/**
 * Sentence-aware text chunking for the Voice domain's speech engine.
 *
 * Pure text processing — no model, no async, no DOM. This module only decides
 * where the cuts go; the generation loop that consumes it lives in
 * piperEngine.ts.
 *
 * Why chunk at all: every engine call is duration-capped by what the voice was
 * trained on, and an over-long input is not rejected — it is silently cut. So
 * long scripts are split here, on sentence boundaries, and the resulting audio
 * is stitched back together with a short silence at each seam.
 */

/**
 * Default cap, in characters, for one engine call. Callers that know the
 * engine's own internal limit should pass a smaller value: the engine splits
 * any remaining over-long piece itself, at a boundary it does not report.
 */
export const DEFAULT_MAX_CHARS = 500;

// U+0964 danda and U+0965 double danda terminate sentences in Devanagari, and
// the CJK forms are included because the splitter runs before any language
// check.
const SENTENCE_TERMINATORS = ".!?…。？！।॥";

// Trailing marks that belong to the sentence that just ended, not the next one.
const CLOSING_MARKS = "\"'’”)]}»›」』";

// Mid-sentence breath points, used only when one sentence alone busts the
// limit. Includes the Arabic comma and the CJK/fullwidth forms.
const CLAUSE_MARKS = ",;:،、，；：—";

// Periods that end an abbreviation rather than a sentence.
const ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "sgt", "col", "gen", "rep",
  "sen", "gov", "lt", "maj", "capt", "st", "mt", "etc", "co", "inc", "ltd",
  "dept", "vs", "p", "pg", "jan", "feb", "mar", "apr", "jun", "jul", "aug",
  "sep", "sept", "oct", "nov", "dec", "sun", "mon", "tu", "tue", "tues",
  "wed", "th", "thu", "thur", "thurs", "fri", "sat",
]);

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
 * all requires an unbroken run longer than the limit containing no space or
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
 * Split text into generation-sized chunks.
 *
 * Every returned chunk is at most `maxLen` characters. Boundaries prefer
 * sentence ends, fall back to clause marks, then whitespace, then a blind
 * slice — so a seam lands inside a sentence only when the sentence itself
 * cannot fit.
 *
 * Text already within the limit is returned as a single trimmed chunk, so a
 * caller can treat a length-1 result as "no chunking happened".
 *
 * @param text   Raw user input.
 * @param maxLen Longest chunk to emit, in characters. Values below 1 are
 *               clamped to 1 rather than rejected, since the fallback slices
 *               would otherwise never terminate.
 * @returns Ordered chunks; empty array for blank input.
 */
export function chunkText(text: string, maxLen: number = DEFAULT_MAX_CHARS): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const limit = Math.max(1, Math.floor(maxLen));
  if (trimmed.length <= limit) return [trimmed];

  const units = splitIntoSentences(trimmed).flatMap((sentence) =>
    sentence.length <= limit ? [sentence] : explodeSentence(sentence, limit),
  );

  return pack(units, limit);
}
