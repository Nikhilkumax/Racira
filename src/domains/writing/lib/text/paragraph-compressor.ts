/**
 * Paragraph compressor: four documented cuts applied to a paragraph, with the
 * before and after counts and every change listed.
 *
 *   1. hedge phrases removed ("it is worth noting that", "as a matter of fact");
 *   2. wordy phrases replaced with their plainer equivalent (shared table);
 *   3. redundant pairs trimmed ("advance planning" -> "planning");
 *   4. a sentence that repeats an earlier one is dropped, measured by the
 *      Jaccard overlap of their content words rather than by a guess.
 *
 * The last rule is the only one that removes a whole sentence, and it reports
 * the sentence it dropped together with the one it duplicated, so the cut can
 * be checked. Nothing else is deleted, and the compressor never rewrites a
 * sentence's structure.
 */
import { sentences, words } from "./tokenize.ts";
import { applyPhraseReplacements, findPhraseMatches, simplifyWordiness, type PhraseEntry } from "./phrases.ts";

/** Openers that postpone the point without adding information. */
export const HEDGE_PHRASES: readonly PhraseEntry[] = [
  { phrase: "it is worth noting that", note: "Hedge that delays the point.", replacement: "" },
  { phrase: "it should be noted that", note: "Hedge that delays the point.", replacement: "" },
  { phrase: "it is important to note that", note: "Hedge that delays the point.", replacement: "note that" },
  { phrase: "it is important to remember that", note: "Hedge that delays the point.", replacement: "remember that" },
  { phrase: "as a matter of fact", note: "Filler phrase.", replacement: "" },
  { phrase: "in other words", note: "Signals a restatement, which is usually the cut itself.", replacement: "" },
  { phrase: "needless to say", note: "Then do not say it.", replacement: "" },
  { phrase: "for what it is worth", note: "Undercuts the claim it introduces.", replacement: "" },
  { phrase: "at the end of the day", note: "Filler that precedes a summary.", replacement: "" },
  { phrase: "it goes without saying that", note: "Then do not say it.", replacement: "" },
  { phrase: "to be honest", note: "Hedge; the claim should stand without it.", replacement: "" },
  { phrase: "in my personal opinion", note: "Doubles the hedging.", replacement: "in my opinion" },
];

/** Pairs where one word is doing no work at all. */
export const REDUNDANT_PAIRS: readonly PhraseEntry[] = [
  { phrase: "advance planning", note: "Planning happens in advance.", replacement: "planning" },
  { phrase: "advance warning", note: "A warning is given in advance.", replacement: "warning" },
  { phrase: "absolutely essential", note: "Essential is already absolute.", replacement: "essential" },
  { phrase: "basic fundamentals", note: "Fundamentals are basic.", replacement: "fundamentals" },
  { phrase: "brief summary", note: "A summary is brief.", replacement: "summary" },
  { phrase: "close proximity", note: "Proximity is closeness.", replacement: "proximity" },
  { phrase: "end result", note: "A result is at the end.", replacement: "result" },
  { phrase: "exact same", note: "Same already means exact.", replacement: "same" },
  { phrase: "final outcome", note: "An outcome is final.", replacement: "outcome" },
  { phrase: "free gift", note: "A gift is free.", replacement: "gift" },
  { phrase: "future plans", note: "Plans are about the future.", replacement: "plans" },
  { phrase: "join together", note: "Joining is coming together.", replacement: "join" },
  { phrase: "new innovation", note: "An innovation is new.", replacement: "innovation" },
  { phrase: "past history", note: "History is in the past.", replacement: "history" },
  { phrase: "personal opinion", note: "An opinion is personal.", replacement: "opinion" },
  { phrase: "repeat again", note: "Repeating is doing it again.", replacement: "repeat" },
  { phrase: "return back", note: "Returning is coming back.", replacement: "return" },
  { phrase: "still remains", note: "Remaining is still being there.", replacement: "remains" },
  { phrase: "totally unique", note: "Unique admits no degrees.", replacement: "unique" },
  { phrase: "unexpected surprise", note: "A surprise is unexpected.", replacement: "surprise" },
];

/** Words ignored when two sentences are compared for repetition. */
export const COMPRESSION_STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "then", "than", "that", "this", "these", "those",
  "is", "are", "was", "were", "be", "been", "being", "am", "do", "does", "did", "has", "have", "had",
  "to", "of", "in", "on", "at", "by", "for", "with", "from", "as", "it", "its", "we", "you", "they",
  "he", "she", "i", "not", "no", "so", "such", "will", "would", "can", "could", "should", "may", "might",
]);

/** Overlap at which two sentences count as saying the same thing. */
export const DUPLICATE_THRESHOLD = 0.6;

export interface CompressionStep {
  id: string;
  label: string;
  from: string;
  to: string;
}

export interface DroppedSentence {
  sentence: string;
  duplicateOf: string;
  overlap: number;
}

export interface CompressionReport {
  output: string;
  beforeWords: number;
  afterWords: number;
  /** Whole-number percentage removed. */
  reduction: number;
  changes: CompressionStep[];
  dropped: DroppedSentence[];
  checks: string[];
}

function contentWords(sentence: string): Set<string> {
  return new Set(
    words(sentence)
      .map((word) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""))
      .filter((word) => word.length > 2 && !COMPRESSION_STOPWORDS.has(word)),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const word of a) if (b.has(word)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/** Compress a paragraph and report every cut. */
export function compressParagraph(text: string): CompressionReport {
  const source = text.trim();
  const beforeWords = words(source).length;
  const changes: CompressionStep[] = [];

  // 1. Hedges, then wordiness, then redundancies — each applied to the result
  // of the last so counts stay honest.
  const hedges = findPhraseMatches(source, HEDGE_PHRASES);
  let output = applyPhraseReplacements(source, hedges).output;
  for (const match of hedges) {
    changes.push({ id: "hedge", label: "Hedge removed", from: match.source, to: match.replacement ?? "" });
  }

  const wordy = simplifyWordiness(output);
  for (const match of wordy.replacements) {
    changes.push({ id: "wordy", label: "Wordy phrase replaced", from: match.source, to: match.replacement ?? "" });
  }
  output = wordy.output;

  const redundant = findPhraseMatches(output, REDUNDANT_PAIRS);
  for (const match of redundant) {
    changes.push({ id: "redundant", label: "Redundant pair trimmed", from: match.source, to: match.replacement ?? "" });
  }
  output = applyPhraseReplacements(output, redundant).output;

  // 2. A sentence that repeats an earlier one is dropped, with the pair named.
  const kept: string[] = [];
  const keptWordSets: Set<string>[] = [];
  const dropped: DroppedSentence[] = [];
  for (const sentence of sentences(output)) {
    const set = contentWords(sentence);
    let duplicateOf: string | null = null;
    let best = 0;
    for (let index = 0; index < kept.length; index += 1) {
      const score = overlap(set, keptWordSets[index]);
      if (score > best) {
        best = score;
        duplicateOf = kept[index];
      }
    }
    if (duplicateOf && best >= DUPLICATE_THRESHOLD) {
      dropped.push({ sentence, duplicateOf, overlap: Math.round(best * 100) / 100 });
      continue;
    }
    kept.push(sentence);
    keptWordSets.push(set);
  }
  output = kept.join(" ");

  const afterWords = words(output).length;
  const reduction = beforeWords === 0 ? 0 : Math.round(((beforeWords - afterWords) / beforeWords) * 100);

  const checks: string[] = [];
  if (beforeWords === 0) checks.push("Paste a paragraph to compress.");
  else if (reduction === 0) checks.push("No documented cut applies — the paragraph is already carrying no filler the tables know.");
  else if (reduction < 10) checks.push(`Only ${reduction}% came out; the rest is content rather than padding.`);
  if (dropped.length > 0) {
    checks.push(`${dropped.length} sentence${dropped.length === 1 ? "" : "s"} dropped as a repeat of an earlier one.`);
  }

  return { output, beforeWords, afterWords, reduction, changes, dropped, checks };
}
