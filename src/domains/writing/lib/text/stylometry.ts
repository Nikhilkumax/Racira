/**
 * Stylometric profile and profile comparison.
 *
 * The "fingerprint" a writing tool can honestly produce is a set of *measurable*
 * features of a text: sentence-length distribution, word length, lexical
 * diversity, syllable weight, punctuation rates and the share of function words.
 * This module computes those numbers and can compare two texts' profiles.
 *
 * What it is not: authorship attribution, AI detection or forensic stylometry.
 * Those need calibrated corpora and published error rates. Cosine similarity over
 * function-word shares here answers a much narrower question — "do these two
 * drafts use function words and sentence lengths similarly?" — and the UI says so.
 */
import { sentenceTokens, wordTokens, graphemes, countParagraphs } from "./tokenize.ts";
import { countSyllables } from "./syllables.ts";
import { ENGLISH_STOPWORD_SET } from "./stopwords.ts";
import { sentenceDetails, varietySummary } from "./sentence-metrics.ts";

export interface StylometricProfile {
  words: number;
  sentences: number;
  paragraphs: number;
  /** Mean sentence length in words. */
  meanSentenceLength: number;
  /** Population standard deviation of sentence length. */
  stdevSentenceLength: number;
  medianSentenceLength: number;
  /** Mean word length in grapheme clusters. */
  meanWordLength: number;
  /** Share of tokens with 7+ letters. */
  longWordShare: number;
  syllablesPerWord: number;
  /** Unique words ÷ words. Falls with text length, which is why it is shown beside root TTR. */
  typeTokenRatio: number;
  /** Guiraud index: unique ÷ √words — stable across lengths than TTR. */
  rootTtr: number;
  /** Share of tokens that appear exactly once. */
  hapaxShare: number;
  /** Share of tokens that are function (closed-class) words. */
  functionWordShare: number;
  /** Mean paragraph length in words. */
  meanParagraphWords: number;
  /** Punctuation rates per 1,000 words. */
  punctuationPer1000: {
    commas: number;
    semicolons: number;
    colons: number;
    dashes: number;
    questions: number;
    exclamations: number;
    parentheses: number;
    quotationMarks: number;
  };
  /** Function-word shares (0-1), sorted by share, used for profile comparison. */
  functionWords: { word: string; share: number }[];
}

function per1000(count: number, words: number): number {
  return words > 0 ? (count / words) * 1000 : 0;
}

/** Feature vector for one text. */
export function stylometricProfile(text: string, locale = "en"): StylometricProfile {
  const tokens = wordTokens(text, locale).map((token) => token.text);
  const lowered = tokens.map((token) => token.toLocaleLowerCase(locale));
  const words = tokens.length;
  const sentences = sentenceTokens(text, locale).length;

  let syllables = 0;
  let letters = 0;
  let longWords = 0;
  for (const token of tokens) {
    syllables += countSyllables(token);
    const length = graphemes(token, locale).length;
    letters += length;
    if (length >= 7) longWords += 1;
  }

  const counts = new Map<string, number>();
  for (const token of lowered) counts.set(token, (counts.get(token) ?? 0) + 1);
  const unique = counts.size;
  const hapax = [...counts.values()].filter((count) => count === 1).length;

  const functionCounts = new Map<string, number>();
  let functionTokens = 0;
  for (const token of lowered) {
    if (!ENGLISH_STOPWORD_SET.has(token)) continue;
    functionTokens += 1;
    functionCounts.set(token, (functionCounts.get(token) ?? 0) + 1);
  }

  const variety = varietySummary(sentenceDetails(text, locale));

  return {
    words,
    sentences,
    paragraphs: countParagraphs(text),
    meanSentenceLength: sentences > 0 ? words / sentences : 0,
    stdevSentenceLength: variety.stdevWords,
    medianSentenceLength: variety.medianWords,
    meanWordLength: words > 0 ? letters / words : 0,
    longWordShare: words > 0 ? longWords / words : 0,
    syllablesPerWord: words > 0 ? syllables / words : 0,
    typeTokenRatio: words > 0 ? unique / words : 0,
    rootTtr: words > 0 ? unique / Math.sqrt(words) : 0,
    hapaxShare: words > 0 ? hapax / words : 0,
    functionWordShare: words > 0 ? functionTokens / words : 0,
    meanParagraphWords: countParagraphs(text) > 0 ? words / countParagraphs(text) : 0,
    punctuationPer1000: {
      commas: per1000((text.match(/,/g) ?? []).length, words),
      semicolons: per1000((text.match(/;/g) ?? []).length, words),
      colons: per1000((text.match(/:/g) ?? []).length, words),
      dashes: per1000((text.match(/[—–-]/g) ?? []).length, words),
      questions: per1000((text.match(/\?/g) ?? []).length, words),
      exclamations: per1000((text.match(/!/g) ?? []).length, words),
      parentheses: per1000((text.match(/[()]/g) ?? []).length, words),
      quotationMarks: per1000((text.match(/["“”']/g) ?? []).length, words),
    },
    functionWords: [...functionCounts.entries()]
      .map(([word, count]) => ({ word, share: words > 0 ? count / words : 0 }))
      .sort((a, b) => b.share - a.share || a.word.localeCompare(b.word, locale)),
  };
}

/**
 * Moving-average type-token ratio (Covington & McFall, 2010).
 *
 * Plain TTR falls as a text gets longer, so it cannot compare a paragraph with
 * an essay; MATTR averages TTR over fixed-size windows and stays comparable
 * across lengths. The window size is the caller's choice and is shown in the UI.
 * A window wider than the token list falls back to the whole text's TTR.
 */
export function movingAverageTtr(tokens: string[], window = 100): number {
  if (tokens.length === 0) return 0;
  const size = Math.max(2, Math.min(window, tokens.length));
  if (tokens.length <= size) return new Set(tokens).size / tokens.length;
  let total = 0;
  let windows = 0;
  for (let start = 0; start + size <= tokens.length; start += 1) {
    const slice = tokens.slice(start, start + size);
    total += new Set(slice).size / size;
    windows += 1;
  }
  return windows > 0 ? total / windows : 0;
}

export interface ProfileComparison {
  label: string;
  a: number;
  b: number;
  difference: number;
  /** Signed percentage change from A to B; `null` when A is zero. */
  percentChange: number | null;
}

function comparison(label: string, a: number, b: number): ProfileComparison {
  return {
    label,
    a,
    b,
    difference: b - a,
    percentChange: a === 0 ? null : ((b - a) / a) * 100,
  };
}

/** Field-by-field comparison of two profiles, A being the reference text. */
export function compareProfiles(a: StylometricProfile, b: StylometricProfile): ProfileComparison[] {
  return [
    comparison("Words", a.words, b.words),
    comparison("Sentences", a.sentences, b.sentences),
    comparison("Mean sentence length (words)", a.meanSentenceLength, b.meanSentenceLength),
    comparison("Sentence length variation", a.stdevSentenceLength, b.stdevSentenceLength),
    comparison("Mean word length (letters)", a.meanWordLength, b.meanWordLength),
    comparison("Long-word share", a.longWordShare, b.longWordShare),
    comparison("Syllables per word", a.syllablesPerWord, b.syllablesPerWord),
    comparison("Unique-word share (TTR)", a.typeTokenRatio, b.typeTokenRatio),
    comparison("Guiraud index (root TTR)", a.rootTtr, b.rootTtr),
    comparison("Words used once", a.hapaxShare, b.hapaxShare),
    comparison("Function-word share", a.functionWordShare, b.functionWordShare),
    comparison("Mean paragraph length (words)", a.meanParagraphWords, b.meanParagraphWords),
    comparison("Commas per 1,000 words", a.punctuationPer1000.commas, b.punctuationPer1000.commas),
    comparison(
      "Semicolons per 1,000 words",
      a.punctuationPer1000.semicolons,
      b.punctuationPer1000.semicolons,
    ),
  ];
}

/**
 * Cosine similarity (0-1) of the two texts' function-word share vectors.
 * 1 means the closed-class vocabulary is distributed identically.
 */
export function profileSimilarity(a: StylometricProfile, b: StylometricProfile): number {
  const shared = new Set([...a.functionWords.map((entry) => entry.word), ...b.functionWords.map((entry) => entry.word)]);
  const aMap = new Map(a.functionWords.map((entry) => [entry.word, entry.share]));
  const bMap = new Map(b.functionWords.map((entry) => [entry.word, entry.share]));

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const word of shared) {
    const x = aMap.get(word) ?? 0;
    const y = bMap.get(word) ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** One-line reading of a similarity value, stated as a similarity band. */
export function similarityBand(similarity: number): { label: string; note: string } {
  if (similarity >= 0.98) {
    return {
      label: "Nearly identical profile",
      note: "Function-word distribution and sentence rhythm are almost the same in both texts.",
    };
  }
  if (similarity >= 0.95) {
    return { label: "Very close", note: "The two texts share a very similar closed-class vocabulary profile." };
  }
  if (similarity >= 0.9) {
    return { label: "Similar", note: "Comparable style, with visible differences in word or sentence use." };
  }
  if (similarity >= 0.8) {
    return { label: "Loosely related", note: "Different enough that a reader would notice a change of voice." };
  }
  return { label: "Distinct profiles", note: "The two texts use function words and sentence shapes differently." };
}
