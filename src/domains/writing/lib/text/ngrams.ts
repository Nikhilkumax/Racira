/**
 * N-gram counting, keyword density and repetition analysis.
 *
 * Everything here counts what is actually in the text: tokens come from the
 * shared tokenizer, matching is case-insensitive, and every figure is a count
 * divided by the word total — no "SEO score" is invented on top.
 *
 * Conventions, all stated in the UI:
 *   - an n-gram is a window of n consecutive word tokens, joined by a space;
 *   - density is `count / totalWords × 100`, where the denominator is *every*
 *     word token, stopwords included (that is what "percentage of the text"
 *     means to a reader);
 *   - a phrase (n ≥ 2) must contain at least one non-stopword, so "of the" is
 *     not reported as a keyword;
 *   - there is no universal "safe" density. What matters editorially is whether
 *     a term repeats more often than the writing can justify, which is why the
 *     repetition view reports counts and distances rather than a pass/fail.
 */
import { wordTokens } from "./tokenize.ts";
import { ENGLISH_STOPWORD_SET } from "./stopwords.ts";

export interface NgramEntry {
  /** Space-joined, lowercase term. */
  term: string;
  tokens: string[];
  count: number;
  length: number;
  /** Share of all word tokens, in percent. */
  densityPercent: number;
  /** Occurrences per 1,000 word tokens. */
  perThousand: number;
  /** Token offset of the first occurrence, for "jump to it" behaviour. */
  firstIndex: number;
}

export interface NgramOptions {
  /** Window sizes to count, default `[1]`. */
  sizes?: number[];
  /** Maximum entries returned, default 20. */
  limit?: number;
  /** Minimum occurrences before a term is reported, default 2. */
  minCount?: number;
  /** Drop unigrams that are function words, default true. */
  excludeStopwords?: boolean;
  locale?: string;
}

/** Lowercased tokens with apostrophes kept but surrounding punctuation dropped. */
export function normalisedTokens(text: string, locale = "en"): string[] {
  return wordTokens(text, locale).map((token) => token.text.toLocaleLowerCase(locale));
}

/** Raw counts for one window size, keyed by the joined term. */
export function ngramCounts(
  tokens: string[],
  size: number,
): Map<string, { count: number; firstIndex: number }> {
  const counts = new Map<string, { count: number; firstIndex: number }>();
  if (size < 1 || tokens.length < size) return counts;
  for (let index = 0; index + size <= tokens.length; index += 1) {
    const window = tokens.slice(index, index + size);
    const key = window.join(" ");
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { count: 1, firstIndex: index });
  }
  return counts;
}

function makeEntry(
  term: string,
  tokens: string[],
  count: number,
  firstIndex: number,
  totalWords: number,
): NgramEntry {
  return {
    term,
    tokens,
    count,
    length: tokens.length,
    densityPercent: totalWords > 0 ? (count / totalWords) * 100 : 0,
    perThousand: totalWords > 0 ? (count / totalWords) * 1000 : 0,
    firstIndex,
  };
}

/**
 * N-grams with counts and density, sorted by count then by first appearance so
 * equal counts keep document order (a stable, predictable table).
 */
export function ngramEntries(text: string, options: NgramOptions = {}): NgramEntry[] {
  const sizes = (options.sizes ?? [1]).filter((size) => size >= 1);
  const limit = options.limit ?? 20;
  const minCount = options.minCount ?? 2;
  const excludeStopwords = options.excludeStopwords ?? true;
  const locale = options.locale ?? "en";

  const tokens = normalisedTokens(text, locale);
  const totalWords = tokens.length;
  if (totalWords === 0) return [];

  const entries: NgramEntry[] = [];
  for (const size of sizes) {
    for (const [key, value] of ngramCounts(tokens, size)) {
      if (value.count < minCount) continue;
      const parts = key.split(" ");
      if (excludeStopwords) {
        if (size === 1 && ENGLISH_STOPWORD_SET.has(parts[0])) continue;
        // Phrases need at least one content word to be a candidate keyword.
        if (size > 1 && parts.every((part) => ENGLISH_STOPWORD_SET.has(part))) continue;
      }
      entries.push(makeEntry(key, parts, value.count, value.firstIndex, totalWords));
    }
  }

  entries.sort(
    (a, b) => b.count - a.count || a.length - b.length || a.firstIndex - b.firstIndex,
  );
  return entries.slice(0, limit);
}

export interface KeywordDensityResult {
  words: number;
  uniqueWords: number;
  /** Single-word densities, stopword-filtered by default. */
  singleWords: NgramEntry[];
  /** Two-word phrases that contain at least one content word. */
  phrases: NgramEntry[];
}

/** Unigram plus bigram density table for the keyword-density tool. */
export function keywordDensity(text: string, options: NgramOptions = {}): KeywordDensityResult {
  const tokens = normalisedTokens(text, options.locale ?? "en");
  const unique = new Set(tokens);
  return {
    words: tokens.length,
    uniqueWords: unique.size,
    singleWords: ngramEntries(text, { ...options, sizes: [1] }),
    phrases: ngramEntries(text, { ...options, sizes: [2] }),
  };
}

export interface RepeatedTerm {
  term: string;
  count: number;
  perThousand: number;
  densityPercent: number;
  firstIndex: number;
}

/**
 * Content words that repeat at least `minCount` times, most frequent first.
 * This is the honest core of the "overused word" view: a frequency table with
 * the denominator stated, not a judgement about style.
 */
export function repeatedTerms(
  text: string,
  options: { minCount?: number; limit?: number; includeStopwords?: boolean; locale?: string } = {},
): RepeatedTerm[] {
  const minCount = options.minCount ?? 3;
  const limit = options.limit ?? 25;
  const includeStopwords = options.includeStopwords ?? false;
  const locale = options.locale ?? "en";

  const tokens = normalisedTokens(text, locale);
  const totalWords = tokens.length;
  const counts = ngramCounts(tokens, 1);

  const out: RepeatedTerm[] = [];
  for (const [term, value] of counts) {
    if (value.count < minCount) continue;
    if (!includeStopwords && ENGLISH_STOPWORD_SET.has(term)) continue;
    if (term.length < 2) continue;
    out.push({
      term,
      count: value.count,
      perThousand: totalWords > 0 ? (value.count / totalWords) * 1000 : 0,
      densityPercent: totalWords > 0 ? (value.count / totalWords) * 100 : 0,
      firstIndex: value.firstIndex,
    });
  }

  out.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term, locale));
  return out.slice(0, limit);
}

export interface AdjacentRepeat {
  term: string;
  /** Token offset of the later occurrence in the reported pair. */
  index: number;
  /** Distance in tokens between the two occurrences. */
  distance: number;
  line: string;
}

/**
 * Words used again within `window` tokens — the "you just said that" signal,
 * which is usually what a writer means by an overused word. Returns one entry
 * per occurrence after the first.
 */
export function adjacentRepeats(
  text: string,
  options: { window?: number; limit?: number; includeStopwords?: boolean; locale?: string } = {},
): AdjacentRepeat[] {
  const window = options.window ?? 40;
  const limit = options.limit ?? 25;
  const includeStopwords = options.includeStopwords ?? false;
  const locale = options.locale ?? "en";

  const tokens = normalisedTokens(text, locale);
  const lastSeen = new Map<string, number>();
  const out: AdjacentRepeat[] = [];

  tokens.forEach((token, index) => {
    const previous = lastSeen.get(token);
    lastSeen.set(token, index);
    if (previous === undefined) return;
    const distance = index - previous;
    if (distance > window) return;
    if (!includeStopwords && ENGLISH_STOPWORD_SET.has(token)) return;

    const start = Math.max(0, index - 6);
    const end = Math.min(tokens.length, index + 5);
    out.push({ term: token, index, distance, line: tokens.slice(start, end).join(" ") });
  });

  out.sort((a, b) => a.distance - b.distance || a.index - b.index);
  return out.slice(0, limit);
}
