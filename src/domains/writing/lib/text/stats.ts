/**
 * Text statistics engine shared by the Writing counters.
 *
 * Every number here is computed from the input text with no estimation except
 * the reading/speaking times, which are explicitly words-per-minute models with
 * the rate shown in the UI and adjustable by the user.
 */
import {
  averageWordLength,
  codePoints,
  countLines,
  countParagraphs,
  graphemes,
  sentenceTokens,
  wordLength,
  wordTokens,
} from "./tokenize.ts";

/** Silent-reading rate used as the default (words per minute). */
export const DEFAULT_WPM = 220;
/** Speaking rate used as the default (words per minute). */
export const DEFAULT_SPM = 130;

export interface TextStats {
  /** UTF-16 code units — what a `<textarea>` maxlength counts. */
  characters: number;
  /** Characters excluding all Unicode whitespace. */
  charactersNoSpaces: number;
  /** Unicode code points (surrogate pairs count once). */
  codePoints: number;
  /** Grapheme clusters — user-perceived characters. */
  graphemes: number;
  /** UTF-8 encoded size in bytes. */
  bytesUtf8: number;
  words: number;
  /** Case-insensitive unique word count. */
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  letters: number;
  digits: number;
  punctuation: number;
  symbols: number;
  whitespace: number;
  /** Mean word length in grapheme clusters. */
  avgWordLength: number;
  longestWord: string;
  shortestWord: string;
  /** Words per sentence. */
  avgSentenceLength: number;
  /** Reading time in seconds at the requested words-per-minute rate. */
  readingSeconds: number;
  /** Speaking time in seconds at the requested words-per-minute rate. */
  speakingSeconds: number;
}

export interface TextStatsOptions {
  wpm?: number;
  spm?: number;
  locale?: string;
}

const LETTER_RE = /\p{L}/gu;
const NUMBER_RE = /\p{N}/gu;
const PUNCT_RE = /\p{P}/gu;
const SYMBOL_RE = /\p{S}/gu;
const SPACE_RE = /\s/gu;

function countMatches(text: string, re: RegExp): number {
  // `String.prototype.match` with /g returns all matches (or null).
  return text.match(re)?.length ?? 0;
}

function utf8Bytes(text: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  return unescape(encodeURIComponent(text)).length;
}

/** Everything the counters need, in one pass over the text. */
export function textStats(text: string, options: TextStatsOptions = {}): TextStats {
  const wpm = options.wpm && options.wpm > 0 ? options.wpm : DEFAULT_WPM;
  const spm = options.spm && options.spm > 0 ? options.spm : DEFAULT_SPM;
  const locale = options.locale ?? "en";

  const tokens = wordTokens(text, locale);
  const sentenceTokensList = sentenceTokens(text, locale);

  let uniqueWords = 0;
  let longestWord = "";
  let shortestWord = "";
  const seen = new Set<string>();
  for (const token of tokens) {
    const key = token.text.toLocaleLowerCase(locale);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueWords += 1;
    }
    const length = wordLength(token.text);
    if (longestWord === "" || length > wordLength(longestWord)) longestWord = token.text;
    if (shortestWord === "" || length < wordLength(shortestWord)) shortestWord = token.text;
  }

  const words = tokens.length;

  return {
    characters: text.length,
    charactersNoSpaces: text.replace(SPACE_RE, "").length,
    codePoints: codePoints(text).length,
    graphemes: graphemes(text, locale).length,
    bytesUtf8: utf8Bytes(text),
    words,
    uniqueWords,
    sentences: sentenceTokensList.length,
    paragraphs: countParagraphs(text),
    lines: countLines(text),
    letters: countMatches(text, LETTER_RE),
    digits: countMatches(text, NUMBER_RE),
    punctuation: countMatches(text, PUNCT_RE),
    symbols: countMatches(text, SYMBOL_RE),
    whitespace: countMatches(text, SPACE_RE),
    avgWordLength: averageWordLength(tokens),
    longestWord,
    shortestWord,
    avgSentenceLength: sentenceTokensList.length > 0 ? words / sentenceTokensList.length : 0,
    readingSeconds: (words / wpm) * 60,
    speakingSeconds: (words / spm) * 60,
  };
}

/** "0 sec" / "45 sec" / "3 min 12 sec" / "1 hr 4 min". */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0 sec";
  const seconds = Math.round(totalSeconds);
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  if (minutes < 60) {
    const parts = [`${minutes} min`];
    if (restSeconds > 0) parts.push(`${restSeconds} sec`);
    return parts.join(" ");
  }
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  const parts = [`${hours} hr`];
  if (restMinutes > 0) parts.push(`${restMinutes} min`);
  return parts.join(" ");
}

export interface LengthBucket {
  /** Word length in graphemes. */
  length: number;
  count: number;
}

/**
 * Word-length histogram. Lengths above `maxLength` are folded into the
 * `maxLength` bucket so the chart has a fixed number of columns.
 */
export function wordLengthDistribution(tokens: string[], maxLength = 15): LengthBucket[] {
  const buckets = new Map<number, number>();
  for (const word of tokens) {
    const length = Math.min(wordLength(word), maxLength);
    buckets.set(length, (buckets.get(length) ?? 0) + 1);
  }
  const out: LengthBucket[] = [];
  for (let length = 1; length <= maxLength; length += 1) {
    out.push({ length, count: buckets.get(length) ?? 0 });
  }
  return out;
}

export interface WordFrequency {
  word: string;
  count: number;
}

/**
 * Most frequent words, case-insensitive; ties broken alphabetically so the
 * output is stable. `stopWords` may be empty to include function words.
 */
export function topWords(
  tokens: string[],
  limit = 10,
  stopWords: ReadonlySet<string> = new Set(),
): WordFrequency[] {
  const counts = new Map<string, WordFrequency>();
  for (const token of tokens) {
    const key = token.toLocaleLowerCase("en");
    if (stopWords.has(key)) continue;
    const existing = counts.get(key);
    if (existing) existing.count += 1;
    else counts.set(key, { word: key, count: 1 });
  }
  return [...counts.values()]
    .sort((a, b) => (b.count - a.count) || a.word.localeCompare(b.word))
    .slice(0, limit);
}

/** Sentence lengths in words, in document order. */
export function sentenceWordCounts(text: string, locale = "en"): number[] {
  return sentenceTokens(text, locale).map((sentence) => wordTokens(sentence.text, locale).length);
}
