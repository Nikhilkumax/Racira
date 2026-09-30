/**
 * Sentence-level metrics: length distribution, variety and a clause *estimate*.
 *
 * Length measures are exact (they come from the shared tokenizer). The clause
 * count is a documented heuristic, not a parse: a clause count starts at 1 and
 * rises by one for each coordinating conjunction, subordinating conjunction,
 * relative pronoun, semicolon or colon in the sentence. Commas are reported but
 * never counted, because a list of three items would otherwise look like four
 * clauses. The estimate is good at spotting sentences that carry too much and
 * bad at fine grammatical distinctions, which the UI says plainly.
 */
import { sentenceTokens, wordTokens, graphemes } from "./tokenize.ts";
import { countSyllables } from "./syllables.ts";

export const COORDINATING_CONJUNCTIONS: readonly string[] = [
  "and",
  "but",
  "or",
  "nor",
  "for",
  "yet",
  "so",
];

export const SUBORDINATING_CONJUNCTIONS: readonly string[] = [
  "although",
  "though",
  "because",
  "since",
  "unless",
  "until",
  "while",
  "whereas",
  "if",
  "when",
  "whenever",
  "where",
  "wherever",
  "after",
  "before",
  "once",
  "provided",
  "whether",
  "as",
  "than",
];

export const RELATIVE_PRONOUNS: readonly string[] = [
  "that",
  "which",
  "who",
  "whom",
  "whose",
];

const CLAUSE_MARKERS: ReadonlySet<string> = new Set([
  ...COORDINATING_CONJUNCTIONS,
  ...SUBORDINATING_CONJUNCTIONS,
  ...RELATIVE_PRONOUNS,
]);

/** Bucket boundaries for sentence length, used by the variety view. */
export const LENGTH_BUCKETS = [
  { label: "Short (1-9 words)", min: 1, max: 9 },
  { label: "Medium (10-19)", min: 10, max: 19 },
  { label: "Long (20-29)", min: 20, max: 29 },
  { label: "Very long (30+)", min: 30, max: Number.POSITIVE_INFINITY },
];

export interface SentenceDetail {
  index: number;
  text: string;
  words: number;
  characters: number;
  commas: number;
  /** Clause estimate: 1 + clause markers + clause punctuation. */
  clauses: number;
  wordsPerClause: number;
  /** 3+ syllable words in the sentence. */
  complexWords: number;
  /** 7+ letter words. */
  longWords: number;
  label: "single clause" | "two clauses" | "three or more clauses";
}

function clauseCount(sentence: string): { clauses: number; commas: number } {
  const tokens = wordTokens(sentence).map((token) => token.text.toLowerCase());
  const commas = (sentence.match(/,/g) ?? []).length;
  // Semicolons and colons join independent clauses; commas do not, so they are
  // reported but never counted — otherwise a list of three items would look
  // like four clauses.
  const separators = (sentence.match(/[;:]/g) ?? []).length;
  let clauses = 1;
  for (const token of tokens) {
    if (CLAUSE_MARKERS.has(token)) clauses += 1;
  }
  clauses += separators;
  return { clauses, commas };
}

/** Per-sentence detail, in document order. */
export function sentenceDetails(text: string, locale = "en"): SentenceDetail[] {
  return sentenceTokens(text, locale).map((sentence, index) => {
    const body = sentence.text.trim();
    const tokens = wordTokens(body, locale).map((token) => token.text);
    const words = tokens.length;
    const { clauses, commas } = clauseCount(body);
    let complexWords = 0;
    let longWords = 0;
    for (const token of tokens) {
      if (countSyllables(token) >= 3) complexWords += 1;
      if (graphemes(token, locale).length >= 7) longWords += 1;
    }
    return {
      index,
      text: body,
      words,
      characters: body.length,
      commas,
      clauses,
      wordsPerClause: clauses > 0 ? words / clauses : words,
      complexWords,
      longWords,
      label: clauses <= 1 ? "single clause" : clauses === 2 ? "two clauses" : "three or more clauses",
    };
  });
}

export interface VarietySummary {
  count: number;
  meanWords: number;
  medianWords: number;
  /** Population standard deviation of sentence length in words. */
  stdevWords: number;
  minWords: number;
  maxWords: number;
  /** Share of sentences with fewer than 10 words. */
  shortShare: number;
  /** Share of sentences with 30 or more words. */
  longShare: number;
  buckets: { label: string; count: number; share: number }[];
  /** Longest run of consecutive sentences within ±2 words of each other. */
  longestUniformRun: number;
  /** True when at least two sentences exist and every one has the same length. */
  perfectlyUniform: boolean;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/** Length distribution and variety statistics for a set of sentence details. */
export function varietySummary(details: SentenceDetail[]): VarietySummary {
  const lengths = details.map((detail) => detail.words);
  const count = lengths.length;
  if (count === 0) {
    return {
      count: 0,
      meanWords: 0,
      medianWords: 0,
      stdevWords: 0,
      minWords: 0,
      maxWords: 0,
      shortShare: 0,
      longShare: 0,
      buckets: LENGTH_BUCKETS.map((bucket) => ({ label: bucket.label, count: 0, share: 0 })),
      longestUniformRun: 0,
      perfectlyUniform: false,
    };
  }

  const total = lengths.reduce((sum, value) => sum + value, 0);
  const mean = total / count;
  const variance = lengths.reduce((sum, value) => sum + (value - mean) ** 2, 0) / count;

  let longestUniformRun = 1;
  let run = 1;
  for (let index = 1; index < lengths.length; index += 1) {
    if (Math.abs(lengths[index] - lengths[index - 1]) <= 2) {
      run += 1;
      longestUniformRun = Math.max(longestUniformRun, run);
    } else {
      run = 1;
    }
  }

  return {
    count,
    meanWords: mean,
    medianWords: median(lengths),
    stdevWords: Math.sqrt(variance),
    minWords: Math.min(...lengths),
    maxWords: Math.max(...lengths),
    shortShare: lengths.filter((value) => value < 10).length / count,
    longShare: lengths.filter((value) => value >= 30).length / count,
    buckets: LENGTH_BUCKETS.map((bucket) => {
      const bucketCount = lengths.filter((value) => value >= bucket.min && value <= bucket.max).length;
      return { label: bucket.label, count: bucketCount, share: bucketCount / count };
    }),
    longestUniformRun,
    perfectlyUniform: count > 1 && new Set(lengths).size === 1,
  };
}

export interface ComplexitySummary {
  averageClauses: number;
  averageWordsPerClause: number;
  singleClauseShare: number;
  threeOrMoreShare: number;
  /** Sentences with more than 30 words, longest first. */
  longest: SentenceDetail[];
  /** Sentences with three or more clause markers, longest first. */
  mostClausal: SentenceDetail[];
}

/** Clause-estimate summary plus the sentences that stand out. */
export function complexitySummary(details: SentenceDetail[]): ComplexitySummary {
  if (details.length === 0) {
    return {
      averageClauses: 0,
      averageWordsPerClause: 0,
      singleClauseShare: 0,
      threeOrMoreShare: 0,
      longest: [],
      mostClausal: [],
    };
  }
  const totalClauses = details.reduce((sum, detail) => sum + detail.clauses, 0);
  const totalWords = details.reduce((sum, detail) => sum + detail.words, 0);
  return {
    averageClauses: totalClauses / details.length,
    averageWordsPerClause: totalClauses > 0 ? totalWords / totalClauses : 0,
    singleClauseShare: details.filter((detail) => detail.clauses <= 1).length / details.length,
    threeOrMoreShare: details.filter((detail) => detail.clauses >= 3).length / details.length,
    longest: [...details].sort((a, b) => b.words - a.words).slice(0, 5),
    mostClausal: [...details].sort((a, b) => b.clauses - a.clauses || b.words - a.words).slice(0, 5),
  };
}
