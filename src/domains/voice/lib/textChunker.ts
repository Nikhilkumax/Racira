/**
 * Per-language text chunking for Kokoro TTS.
 *
 * Pure text processing — no model, no async, no DOM. Nothing here calls
 * generate(); this module only decides where the cuts go. The generation loop
 * that consumes it lands in a later phase.
 */

// The tokenizer declares model_max_length: 512
// (@huggingface/transformers/.cache/onnx-community/Kokoro-82M-v1.0-ONNX/tokenizer_config.json:2),
// and kokoro-js wraps every phoneme sequence in two boundary tokens — its
// voice-style lookup reads `input_ids.dims.at(-1) - 2`, clamped to 509
// (dist/kokoro.js, generate_from_ids). So 510 phonemes are usable.
//
// Exceeding it is silent: kokoro-js tokenizes with `{ truncation: true }` in
// both generate() and stream(), so the tail is dropped with no error. That
// silence is the whole reason this module exists.
const MAX_PHONEMES = 510;

// Hold back 10%. The ratios below are averages measured across sample text,
// not guarantees — a chunk dense in numerals, acronyms or conjuncts phonemizes
// longer than its character count predicts, and the margin absorbs that.
const PHONEME_BUDGET = Math.floor(MAX_PHONEMES * 0.9); // 459

// Characters of source text per phoneme produced by espeak-ng. Devanagari is
// the outlier: it writes a consonant cluster in one or two glyphs that
// phonemize into several segments.
const EXPANSION_RATIOS: Record<string, number> = {
  "en-us": 1.15,
  "en-gb": 1.15,
  es: 1.25,
  fr: 1.25,
  it: 1.25,
  "pt-BR": 1.25,
  hi: 2.0,
};

// An unrecognised language gets the most expansive ratio on the list. Being
// wrong in this direction costs an extra chunk; being wrong the other way
// costs silently truncated audio.
const FALLBACK_RATIO = 2.0;

// U+0964 danda and U+0965 double danda terminate sentences in Devanagari.
// kokoro-js's own splitter checks ".!?…。？！" only, so Hindi text arrives at
// the tokenizer as one unsplittable run.
const SENTENCE_TERMINATORS = ".!?…。？！।॥";

// Trailing marks that belong to the sentence that just ended, not the next one.
const CLOSING_MARKS = "\"'’”)]}»›」』";

// Mid-sentence breath points, used only when one sentence alone busts the
// limit. Includes the Arabic comma and the CJK/fullwidth forms, since the
// splitter runs before any language check.
const CLAUSE_MARKS = ",;:،、，；：—";

// Periods that end an abbreviation rather than a sentence. Same list kokoro-js
// carries, minus the entries that only matter for its streaming lookahead.
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "sgt", "col", "gen", "rep",
  "sen", "gov", "lt", "maj", "capt", "st", "mt", "etc", "co", "inc", "ltd",
  "dept", "vs", "p", "pg", "jan", "feb", "mar", "apr", "jun", "jul", "aug",
  "sep", "sept", "oct", "nov", "dec", "sun", "mon", "tu", "tue", "tues",
  "wed", "th", "thu", "thur", "thurs", "fri", "sat",
]);

/**
 * Longest input, in characters, that is safe to send to generate() as a single
 * call for the given language. Exported so the UI can size its counter and
 * estimate chunk counts off the same arithmetic the splitter uses.
 */
export function chunkCharLimit(language: string): number {
  const ratio = EXPANSION_RATIOS[language] ?? FALLBACK_RATIO;
  return Math.floor(PHONEME_BUDGET / ratio);
}

function isTerminator(ch: string): boolean {
  return SENTENCE_TERMINATORS.includes(ch);
}

/**
 * True when a period is decorative rather than terminal — a decimal point, an
 * initial, or a known abbreviation. Only "." needs this; no other terminator
 * in the set has a non-terminal use.
 */
function isProtectedPeriod(text: string, i: number): boolean {
  const prev = text[i - 1];
  const next = text[i + 1];

  // 3.14, 1.2.3, 10.00
  if (prev && next && /\d/.test(prev) && /\d/.test(next)) return true;

  // Walk back to the start of the token carrying the period.
  let start = i;
  while (start > 0 && !/[\s"'([{]/.test(text[start - 1])) start--;
  const word = text.slice(start, i).toLowerCase().replace(/['’]s$/, "");

  if (ABBREVIATIONS.has(word)) return true;

  // A lone letter is an initial: "J. K. Rowling", "A. Sharma".
  if (word.length === 1 && /[a-z]/i.test(word)) return true;

  // A period followed by a lowercase word is mid-sentence — "10.30 a.m. and
  // left". Catches abbreviations absent from the list above. Cased scripts
  // only; Devanagari has no case, so Hindi is unaffected either way.
  let j = i + 1;
  while (j < text.length && /\s/.test(text[j])) j++;
  if (j < text.length && /[a-z]/.test(text[j])) return true;

  return false;
}

/**
 * Split text into sentences, keeping each sentence's terminating punctuation
 * and any closing quote or bracket attached to it.
 *
 * Newlines are treated as hard boundaries — a line that ends without
 * punctuation (a heading, a list item) is still its own sentence.
 */
export function splitIntoSentences(text: string): string[] {
  const out: string[] = [];

  for (const line of text.split(/\n+/)) {
    const n = line.length;
    let start = 0;
    let i = 0;

    while (i < n) {
      if (!isTerminator(line[i]) || (line[i] === "." && isProtectedPeriod(line, i))) {
        i++;
        continue;
      }

      // Absorb runs — "?!", "...", "।।" — then trailing closers.
      let end = i;
      while (end + 1 < n && isTerminator(line[end + 1])) end++;
      while (end + 1 < n && CLOSING_MARKS.includes(line[end + 1])) end++;

      const piece = line.slice(start, end + 1).trim();
      if (piece) out.push(piece);
      start = end + 1;
      i = end + 1;
    }

    const tail = line.slice(start).trim();
    if (tail) out.push(tail);
  }

  return out;
}

/** Split on clause punctuation, keeping the mark attached to the left side. */
function splitAtClauseMarks(sentence: string): string[] {
  const out: string[] = [];
  const n = sentence.length;
  let start = 0;

  for (let i = 0; i < n; i++) {
    if (!CLAUSE_MARKS.includes(sentence[i])) continue;

    let end = i;
    while (end + 1 < n && CLAUSE_MARKS.includes(sentence[end + 1])) end++;

    const piece = sentence.slice(start, end + 1).trim();
    if (piece) out.push(piece);
    start = end + 1;
    i = end;
  }

  const tail = sentence.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

/**
 * Last resort: chop a single oversized token into limit-sized pieces.
 *
 * Accumulates whole code points while measuring in UTF-16 units, so a cut can
 * never land inside a surrogate pair yet the result still satisfies the
 * `.length <= limit` invariant the callers check. Devanagari matras can still
 * be separated from their base consonant — accepted, since reaching here at
 * all requires an unbroken run of 229+ characters containing no space or
 * comma.
 */
function sliceToLimit(token: string, limit: number): string[] {
  const out: string[] = [];
  let current = "";

  for (const point of token) {
    if (current && current.length + point.length > limit) {
      out.push(current);
      current = "";
    }
    current += point;
  }

  if (current) out.push(current);
  return out;
}

/**
 * Reduce one over-long sentence to units that each fit the limit, degrading
 * through clause marks, then whitespace, then a blind slice. The blind slice
 * only fires on a single unbroken run longer than the limit (a URL, a hash),
 * which is what guarantees this terminates.
 */
function explodeSentence(sentence: string, limit: number): string[] {
  return splitAtClauseMarks(sentence).flatMap((clause) => {
    if (clause.length <= limit) return [clause];

    return clause
      .split(/\s+/)
      .filter(Boolean)
      .flatMap((word) => (word.length <= limit ? [word] : sliceToLimit(word, limit)));
  });
}

/** Greedily fill chunks with consecutive units, joining with a single space. */
function pack(units: string[], limit: number): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const unit of units) {
    if (!current) {
      current = unit;
    } else if (current.length + 1 + unit.length <= limit) {
      current = `${current} ${unit}`;
    } else {
      chunks.push(current);
      current = unit;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

/**
 * Split text into generation-sized chunks for the given language.
 *
 * Every returned chunk is at most `chunkCharLimit(language)` characters, so
 * each survives tokenization without truncation. Boundaries prefer sentence
 * ends, fall back to clause marks, then whitespace.
 *
 * Text already within the limit is returned as a single trimmed chunk, so a
 * caller can treat a length-1 result as "no chunking happened".
 *
 * @param text     Raw user input.
 * @param language A KOKORO_LANGUAGES code ("en-us", "hi", …). Unknown values
 *                 fall back to the most conservative ratio.
 * @returns Ordered chunks; empty array for blank input.
 */
export function splitTextIntoChunks(text: string, language: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const limit = chunkCharLimit(language);
  if (trimmed.length <= limit) return [trimmed];

  const units = splitIntoSentences(trimmed).flatMap((sentence) =>
    sentence.length <= limit ? [sentence] : explodeSentence(sentence, limit),
  );

  return pack(units, limit);
}
