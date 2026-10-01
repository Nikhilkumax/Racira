/**
 * Extractive summarisation: TextRank-style sentence scoring on the shared
 * tokenizer, with word-frequency and position evidence added as published
 * weights.
 *
 * Nothing here rewrites or generates text. Every sentence the summariser
 * returns is a sentence that appears in the input, which is why every output
 * from this module is labelled "extractive" — the tool selects, it does not
 * write.
 *
 * How a sentence is scored, in three parts, all printed on the tool page:
 *   centrality   TextRank PageRank over a sentence-similarity graph, using the
 *                classic Mihalcea-Tarau similarity
 *                |shared content words| / (log |Si| + log |Sj|);
 *   frequency    the summed log weight of a sentence's content words, divided
 *                by the square root of its length so long sentences do not win
 *                by size alone;
 *   position     a mild decay, 1 / (1 + 0.12 x index), which keeps an opening
 *                sentence in the running without letting it dominate.
 * The final score is 0.55 x centrality + 0.35 x frequency + 0.10 x position,
 * normalised so the best sentence is 1.000. All three parts are returned per
 * sentence, so the ranking can be audited rather than trusted.
 *
 * Selection never reorders prose: the chosen sentences are returned in document
 * order and a caller that shows them is showing the text as written.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";
import { ENGLISH_STOPWORD_SET } from "./stopwords.ts";

const DAMPING = 0.85;
const RANK_ITERATIONS = 30;
const CENTRALITY_WEIGHT = 0.55;
const FREQUENCY_WEIGHT = 0.35;
const POSITION_WEIGHT = 0.1;
const POSITION_DECAY = 0.12;
const DEFAULT_TARGET_PERCENT = 20;
const DEFAULT_TLDR_CHARACTERS = 220;
const DEFAULT_TLDR_SENTENCES = 3;
const MAX_TERM_LIMIT = 40;

export interface TermWeight {
  term: string;
  count: number;
  /** 1 + log(count): the weight used by every score below. */
  weight: number;
  firstIndex: number;
}

export interface SummarySentence {
  /** Position in the source document, 0-based. */
  index: number;
  /** The sentence exactly as written, trimmed. */
  text: string;
  words: number;
  contentWords: number;
  /** 0-1 centrality, frequency and position parts, each normalised to its max. */
  centrality: number;
  frequency: number;
  position: number;
  /** Weighted final score, 0-1, best sentence 1. */
  score: number;
  /** 1 is the highest-scoring sentence. */
  rank: number;
  /** Up to four of the sentence's highest-weight non-stopword terms. */
  terms: string[];
}

export interface SummaryOptions {
  /** Exact number of sentences to select. */
  targetSentences?: number;
  /** Selection size as a percentage of sentences, default 20. */
  targetPercent?: number;
  /** Maximum words in the selection; overrides the percentage when set. */
  maxWords?: number;
  locale?: string;
}

export interface SummaryResult {
  /** Every sentence, in document order, with its scores. */
  sentences: SummarySentence[];
  /** The selected sentences, in document order. */
  selected: SummarySentence[];
  targetSentences: number;
  words: number;
  selectedWords: number;
  /** Selected words as a percentage of the whole text. */
  compressionPercent: number;
  /** Share of the weight of the top terms that the selection contains. */
  coveragePercent: number;
  /** The top content terms, most frequent first. */
  keyTerms: TermWeight[];
  method: string;
}

export const SUMMARY_METHOD =
  "TextRank centrality (0.55) + log term frequency per sentence (0.35) + position (0.10), all normalised to the best sentence";

/** Lowercase content tokens: stopwords, single characters and bare punctuation are out. */
function contentTokens(text: string, locale: string): string[] {
  const out: string[] = [];
  for (const token of wordTokens(text, locale)) {
    const lower = token.text.toLocaleLowerCase(locale);
    if (lower.length < 2) continue;
    if (ENGLISH_STOPWORD_SET.has(lower)) continue;
    out.push(lower);
  }
  return out;
}

/** Content-word counts with their log weight, most frequent first. */
export function termWeights(text: string, locale = "en"): TermWeight[] {
  const counts = new Map<string, { count: number; firstIndex: number }>();
  contentTokens(text, locale).forEach((term, index) => {
    const existing = counts.get(term);
    if (existing) existing.count += 1;
    else counts.set(term, { count: 1, firstIndex: index });
  });
  return [...counts.entries()]
    .map(([term, value]) => ({
      term,
      count: value.count,
      weight: 1 + Math.log(value.count),
      firstIndex: value.firstIndex,
    }))
    .sort((a, b) => b.count - a.count || a.firstIndex - b.firstIndex)
    .slice(0, MAX_TERM_LIMIT);
}

function normalise(values: number[]): number[] {
  const max = Math.max(0, ...values);
  if (max <= 0) return values.map(() => 0);
  return values.map((value) => value / max);
}

/**
 * TextRank centrality: sentence vectors of content words, similarity
 * |intersection| / (log |Si| + log |Sj|), row-normalised and iterated to a fixed
 * point with damping 0.85. Deterministic: no random start, fixed iterations.
 */
function textRank(sentences: string[][]): number[] {
  const count = sentences.length;
  if (count === 0) return [];
  if (count === 1) return [1];

  const sets = sentences.map((tokens) => new Set(tokens));
  const similarity: number[][] = Array.from({ length: count }, () => new Array<number>(count).fill(0));

  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      const left = sets[i];
      const right = sets[j];
      let shared = 0;
      for (const term of left) if (right.has(term)) shared += 1;
      const denominator = Math.log(1 + left.size) + Math.log(1 + right.size);
      const value = denominator > 0 ? shared / denominator : 0;
      similarity[i][j] = value;
      similarity[j][i] = value;
    }
  }

  const rowSums = similarity.map((row) => row.reduce((sum, value) => sum + value, 0));
  let scores = new Array<number>(count).fill(1 / count);
  for (let iteration = 0; iteration < RANK_ITERATIONS; iteration += 1) {
    const next = new Array<number>(count).fill((1 - DAMPING) / count);
    for (let i = 0; i < count; i += 1) {
      if (rowSums[i] === 0) continue;
      for (let j = 0; j < count; j += 1) {
        if (similarity[i][j] === 0) continue;
        next[j] += DAMPING * (similarity[i][j] / rowSums[i]) * scores[i];
      }
    }
    scores = next;
  }
  return scores;
}

function rankSentences(text: string, locale: string): SummarySentence[] {
  const raw = sentenceTokens(text, locale)
    .map((token, index) => ({ index, text: token.text.trim() }))
    .filter((sentence) => sentence.text.length > 0);
  if (raw.length === 0) return [];

  const tokenLists = raw.map((sentence) => contentTokens(sentence.text, locale));
  const weights = new Map(termWeights(text, locale).map((entry) => [entry.term, entry.weight]));
  const centralityRaw = textRank(tokenLists);
  const frequencyRaw = tokenLists.map((tokens) => {
    const sum = tokens.reduce((total, term) => total + (weights.get(term) ?? 0), 0);
    return tokens.length > 0 ? sum / Math.sqrt(tokens.length) : 0;
  });
  const positionRaw = raw.map((_, index) => 1 / (1 + POSITION_DECAY * index));

  const centrality = normalise(centralityRaw);
  const frequency = normalise(frequencyRaw);
  const position = normalise(positionRaw);
  const combined = raw.map(
    (_, index) =>
      CENTRALITY_WEIGHT * centrality[index] + FREQUENCY_WEIGHT * frequency[index] + POSITION_WEIGHT * position[index],
  );
  const scores = normalise(combined);

  const scored: SummarySentence[] = raw.map((sentence, index) => {
    const tokens = tokenLists[index];
    const unique = [...new Set(tokens)].sort(
      (a, b) => (weights.get(b) ?? 0) - (weights.get(a) ?? 0) || a.localeCompare(b),
    );
    return {
      index,
      text: sentence.text,
      words: wordTokens(sentence.text, locale).length,
      contentWords: tokens.length,
      centrality: Number(centrality[index].toFixed(3)),
      frequency: Number(frequency[index].toFixed(3)),
      position: Number(position[index].toFixed(3)),
      score: Number(scores[index].toFixed(3)),
      rank: 0,
      terms: unique.slice(0, 4),
    };
  });

  [...scored]
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .forEach((sentence, rank) => {
      scored[sentence.index].rank = rank + 1;
    });

  return scored;
}

/** Weighted coverage of the top `keyTerms` by the selected sentences. */
function coverage(selected: SummarySentence[], keyTerms: TermWeight[], locale: string): number {
  const top = keyTerms.slice(0, 10);
  const total = top.reduce((sum, term) => sum + term.weight, 0);
  if (total === 0) return 0;
  const present = new Set<string>();
  for (const sentence of selected) {
    for (const term of contentTokens(sentence.text, locale)) present.add(term);
  }
  const covered = top.reduce((sum, term) => (present.has(term.term) ? sum + term.weight : sum), 0);
  return (covered / total) * 100;
}

/** Score every sentence and select the highest-ranked ones, in document order. */
export function summarize(text: string, options: SummaryOptions = {}): SummaryResult {
  const locale = options.locale ?? "en";
  const scored = rankSentences(text, locale);
  const keyTerms = termWeights(text, locale);
  const words = wordTokens(text, locale).length;

  if (scored.length === 0) {
    return {
      sentences: [],
      selected: [],
      targetSentences: 0,
      words,
      selectedWords: 0,
      compressionPercent: 0,
      coveragePercent: 0,
      keyTerms,
      method: SUMMARY_METHOD,
    };
  }

  const ranked = [...scored].sort((a, b) => a.rank - b.rank);

  let selected: SummarySentence[];
  if (options.maxWords !== undefined && options.maxWords > 0) {
    // A word budget: take the highest-ranked sentences in order and stop at the
    // first that would not fit, so nothing low-ranked sneaks in under the cap.
    selected = [];
    let used = 0;
    for (const sentence of ranked) {
      const projected = used + sentence.words + (selected.length > 0 ? 1 : 0);
      if (selected.length > 0 && projected > options.maxWords) break;
      selected.push(sentence);
      used = projected;
    }
  } else {
    let target = options.targetSentences ?? 0;
    if (target === 0) {
      const percent = options.targetPercent ?? DEFAULT_TARGET_PERCENT;
      target = Math.round((scored.length * percent) / 100);
    }
    target = Math.max(1, Math.min(scored.length, target));
    selected = ranked.slice(0, target);
  }

  selected = [...selected].sort((a, b) => a.index - b.index);
  const selectedWords = selected.reduce((sum, sentence) => sum + sentence.words, 0);

  return {
    sentences: scored,
    selected,
    targetSentences: selected.length,
    words,
    selectedWords,
    compressionPercent: words > 0 ? (selectedWords / words) * 100 : 0,
    coveragePercent: coverage(selected, keyTerms, locale),
    keyTerms,
    method: SUMMARY_METHOD,
  };
}

export interface KeyPoint {
  rank: number;
  index: number;
  text: string;
  score: number;
  words: number;
  /** The point's highest-weight terms, most important first. */
  terms: string[];
}

export interface KeyPointsResult {
  points: KeyPoint[];
  keyTerms: TermWeight[];
  words: number;
  sentences: number;
  method: string;
}

/** The highest-ranked sentences as ranked bullet points, best first. */
export function keyPoints(text: string, options: { limit?: number; locale?: string } = {}): KeyPointsResult {
  const limit = Math.max(1, options.limit ?? 5);
  const locale = options.locale ?? "en";
  const scored = rankSentences(text, locale);
  const ranked = [...scored].sort((a, b) => a.rank - b.rank).slice(0, limit);
  return {
    points: ranked.map((sentence) => ({
      rank: sentence.rank,
      index: sentence.index,
      text: sentence.text,
      score: sentence.score,
      words: sentence.words,
      terms: sentence.terms,
    })),
    keyTerms: termWeights(text, locale).slice(0, 12),
    words: wordTokens(text, locale).length,
    sentences: scored.length,
    method: SUMMARY_METHOD,
  };
}

export interface TldrOptions {
  maxCharacters?: number;
  maxSentences?: number;
  locale?: string;
}

export interface TldrResult {
  /** The chosen sentences, document order. */
  sentences: SummarySentence[];
  /** The chosen sentences joined with a space. */
  text: string;
  characters: number;
  words: number;
  totalSentences: number;
  /** Words in the TL;DR as a percentage of the whole text. */
  compressionPercent: number;
  maxCharacters: number;
  /** True when even the shortest top-ranked sentence exceeds the character cap. */
  overBudget: boolean;
  method: string;
}

/**
 * A short extractive gist: the top-ranked sentences that fit a character cap,
 * and never more than `maxSentences` of them. When nothing fits, the best
 * sentence is returned with `overBudget` set rather than silently dropped.
 */
export function tldr(text: string, options: TldrOptions = {}): TldrResult {
  const locale = options.locale ?? "en";
  const maxCharacters = Math.max(40, options.maxCharacters ?? DEFAULT_TLDR_CHARACTERS);
  const maxSentences = Math.max(1, options.maxSentences ?? DEFAULT_TLDR_SENTENCES);
  const scored = rankSentences(text, locale);
  const ranked = [...scored].sort((a, b) => a.rank - b.rank);
  const words = wordTokens(text, locale).length;

  const chosen: SummarySentence[] = [];
  let length = 0;
  let overBudget = false;
  for (const sentence of ranked) {
    if (chosen.length >= maxSentences) break;
    const projected = length + sentence.text.length + (chosen.length > 0 ? 1 : 0);
    if (projected <= maxCharacters) {
      chosen.push(sentence);
      length = projected;
    }
  }
  if (chosen.length === 0 && ranked.length > 0) {
    chosen.push(ranked[0]);
    length = ranked[0].text.length;
    overBudget = ranked[0].text.length > maxCharacters;
  }

  const ordered = [...chosen].sort((a, b) => a.index - b.index);
  const joined = ordered.map((sentence) => sentence.text).join(" ");
  const chosenWords = ordered.reduce((sum, sentence) => sum + sentence.words, 0);

  return {
    sentences: ordered,
    text: joined,
    characters: joined.length,
    words: chosenWords,
    totalSentences: scored.length,
    compressionPercent: words > 0 ? (chosenWords / words) * 100 : 0,
    maxCharacters,
    overBudget,
    method: SUMMARY_METHOD,
  };
}

/** Plain-text report for the summariser's copy and download buttons. */
export function formatSummaryReport(result: SummaryResult): string {
  const lines: string[] = [];
  lines.push("Extractive summary (sentences taken from the source, not rewritten)");
  lines.push(
    `${result.selected.length} of ${result.sentences.length} sentences, ${result.selectedWords} of ${result.words} words (${result.compressionPercent.toFixed(1)}%)`,
  );
  lines.push(`Key-term coverage: ${result.coveragePercent.toFixed(1)}%`);
  lines.push("");
  for (const sentence of result.selected) {
    lines.push(sentence.text);
    lines.push("");
  }
  lines.push(`Method: ${result.method}`);
  return lines.join("\n");
}

/** Plain-text report for the TL;DR copy button. */
export function formatTldrReport(result: TldrResult): string {
  return [
    result.text,
    "",
    `TL;DR: ${result.characters} characters, ${result.words} words from ${result.totalSentences} sentences (${result.compressionPercent.toFixed(1)}% of the text)`,
    result.overBudget
      ? `The best sentence is longer than the ${result.maxCharacters}-character cap; nothing shorter scored as well.`
      : `Within the ${result.maxCharacters}-character cap.`,
    `Method: ${result.method}`,
  ].join("\n");
}
