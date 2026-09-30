/**
 * Unicode-aware tokenizer for the Writing domain.
 *
 * Word / sentence / grapheme segmentation goes through `Intl.Segmenter`
 * (UAX #29 word and sentence boundaries), with a regex fallback for engines
 * without it. Everything here is synchronous, dependency-free and works on the
 * client.
 *
 * One deliberate behaviour on top of raw segmentation: `Intl.Segmenter` breaks
 * a hyphenated word ("well-known" -> "well" + "known"). We re-join segments
 * separated by a single intra-word hyphen (`-`, U+2010, U+2011) because that is
 * what a word-processor word count reports. Apostrophes are already kept inside
 * the segment by UAX #29 ("don't" is one word).
 *
 * Inputs are treated as plain text: no HTML or Markdown parsing happens here.
 */

type SegmentResult = { segment: string; index: number; isWordLike?: boolean };
type SegmenterLike = { segment(input: string): Iterable<SegmentResult> };
type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity: "grapheme" | "word" | "sentence" },
) => SegmenterLike;

const SegmenterImpl = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;

export interface Token {
  /** Segment text exactly as it appears in the source string. */
  text: string;
  /** UTF-16 code-unit offset of the segment start within the source string. */
  index: number;
}

/** Characters that join two words when they sit alone between word segments. */
const HYPHEN_JOINERS = new Set(["-", "\u2010", "\u2011"]);

/** Fallback word pattern: letters/numbers with internal apostrophes or hyphens. */
const WORD_FALLBACK = /[\p{L}\p{N}]+(?:['\u2019\u2010\u2011-][\p{L}\p{N}]+)*/gu;

/** Fallback sentence splitter: chunk up to and including trailing punctuation. */
const SENTENCE_FALLBACK = /[^.!?\u2026\n]+[.!?\u2026]+[)\]'"\u2019\u201d]*\s*|[^.!?\u2026\n]+(?:\n|$)/g;

function makeSegmenter(
  granularity: "grapheme" | "word" | "sentence",
  locale: string,
): SegmenterLike | null {
  if (!SegmenterImpl) return null;
  try {
    return new SegmenterImpl(locale, { granularity });
  } catch {
    // Unknown/invalid locale tag — retry with the runtime default.
    try {
      return new SegmenterImpl(undefined, { granularity });
    } catch {
      return null;
    }
  }
}

/** True when the runtime exposes `Intl.Segmenter`. */
export const hasIntlSegmenter = Boolean(SegmenterImpl);

/**
 * Word tokens with their source offsets. Only word-like segments are returned:
 * whitespace, punctuation and standalone emoji are dropped, while numbers
 * ("123", "3.5", "10,000") are kept as words, matching `Intl.Segmenter`'s
 * word-like classification.
 */
export function wordTokens(text: string, locale = "en"): Token[] {
  if (!text) return [];
  const segmenter = makeSegmenter("word", locale);
  if (!segmenter) {
    const out: Token[] = [];
    for (const match of text.matchAll(WORD_FALLBACK)) {
      out.push({ text: match[0], index: match.index ?? 0 });
    }
    return out;
  }

  const wordLike = [...segmenter.segment(text)].filter((s) => s.isWordLike === true);
  const out: Token[] = [];
  let pending: Token | null = null;

  for (const segment of wordLike) {
    if (!pending) {
      pending = { text: segment.segment, index: segment.index };
      continue;
    }
    const gap = text.slice(pending.index + pending.text.length, segment.index);
    if (gap.length === 1 && HYPHEN_JOINERS.has(gap)) {
      // Re-join the hyphenated pair into one word with its original offset.
      pending = { text: `${pending.text}${gap}${segment.segment}`, index: pending.index };
    } else {
      out.push(pending);
      pending = { text: segment.segment, index: segment.index };
    }
  }
  if (pending) out.push(pending);
  return out;
}

/** Word strings only (no offsets). */
export function words(text: string, locale = "en"): string[] {
  return wordTokens(text, locale).map((token) => token.text);
}

/**
 * Sentence tokens with source offsets. Whitespace-only segments are dropped;
 * `text` keeps its original trailing whitespace so `index + text.length` stays
 * contiguous across the source string.
 *
 * Known limitation (documented, not hidden): abbreviations followed by a period
 * split, so "Dr. Smith went home." counts as two sentences.
 */
export function sentenceTokens(text: string, locale = "en"): Token[] {
  if (!text.trim()) return [];
  const segmenter = makeSegmenter("sentence", locale);
  if (!segmenter) {
    const out: Token[] = [];
    for (const match of text.matchAll(SENTENCE_FALLBACK)) {
      const value = match[0];
      if (value.trim()) out.push({ text: value, index: match.index ?? 0 });
    }
    return out;
  }
  return [...segmenter.segment(text)]
    .map((s) => ({ text: s.segment, index: s.index }))
    .filter((s) => s.text.trim().length > 0);
}

/** Sentence strings with surrounding whitespace trimmed. */
export function sentences(text: string, locale = "en"): string[] {
  return sentenceTokens(text, locale).map((token) => token.text.trim());
}

/**
 * User-perceived characters (grapheme clusters): a combining sequence like
 * "a" + U+0301 is one grapheme, as is an emoji with a skin-tone modifier.
 */
export function graphemes(text: string, locale = "en"): string[] {
  if (!text) return [];
  const segmenter = makeSegmenter("grapheme", locale);
  if (!segmenter) return Array.from(text);
  return [...segmenter.segment(text)].map((s) => s.segment);
}

/** Unicode code points (`Array.from` iterates by code point, not code unit). */
export function codePoints(text: string): string[] {
  return Array.from(text);
}

/**
 * Paragraph count: blocks separated by one or more blank lines. A single
 * newline keeps text in the same paragraph, which is the convention used by
 * word processors.
 */
export function countParagraphs(text: string): number {
  const normalized = text.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return 0;
  return normalized.split(/\n[ \t]*\n+/).filter((block) => block.trim().length > 0).length;
}

/** Line count; an empty string is zero lines, "a" is one, "a\n" is two. */
export function countLines(text: string): number {
  if (text === "") return 0;
  return text.replace(/\r\n?/g, "\n").split("\n").length;
}

/** Length of a word in grapheme clusters (accented letters and emoji count 1). */
export function wordLength(word: string): number {
  return graphemes(word).length;
}

/** Average word length in grapheme clusters, 0 for empty input. */
export function averageWordLength(tokens: Token[]): number {
  if (tokens.length === 0) return 0;
  let total = 0;
  for (const token of tokens) total += wordLength(token.text);
  return total / tokens.length;
}
