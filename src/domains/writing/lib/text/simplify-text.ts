/**
 * Simplify text: one sentence at a time, replace published wordy phrases and
 * split anything still past the long-sentence threshold.
 *
 * The two moves are deliberately different in kind. Substitution is safe and
 * mechanical — the shared wordiness table supplies a plainer equivalent for
 * each match. Splitting changes the rhythm of a paragraph, so it is only
 * proposed for sentences of more than `LONG_SENTENCE_WORDS` words, and it only
 * happens at a documented seam (a comma with and/but/so/yet/or, or a
 * semicolon), never at a guess.
 *
 * Before and after metrics come from the shared readability engine, so the
 * "average sentence length" the tool reports is the same number the
 * Readability Grade Scorer computes for the same text.
 */
import { sentences, words } from "./tokenize.ts";
import { readabilityMetrics, type ReadabilityMetrics } from "./readability.ts";
import { simplifyWordiness, type PhraseMatch } from "./phrases.ts";

/** Sentences longer than this are candidates for a split. */
export const LONG_SENTENCE_WORDS = 25;

const SPLIT_AT = /(,\s+(?:and|but|so|yet|or)\s+|;\s+)/i;

export interface Simplification {
  source: string;
  simplified: string;
  words: number;
  replacements: PhraseMatch[];
  split: boolean;
}

export interface SimplifyReport {
  simplifications: Simplification[];
  before: ReadabilityMetrics;
  after: ReadabilityMetrics;
  replacementCount: number;
  splitCount: number;
  /** Sentences that changed in any way. */
  changedSentences: number;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Split one sentence at the first documented seam, if there is one. */
export function splitSentence(sentence: string): { parts: string[]; split: boolean } {
  const match = sentence.match(SPLIT_AT);
  if (!match || match.index === undefined) return { parts: [sentence], split: false };
  const first = sentence.slice(0, match.index).replace(/[.!?]+$/, "").trim();
  const second = sentence
    .slice(match.index + match[0].length)
    .replace(/[.!?]+$/, "")
    .trim();
  if (!first || !second) return { parts: [sentence], split: false };
  return { parts: [`${capitalize(first)}.`, `${capitalize(second)}.`], split: true };
}

/** Simplify every sentence in the text and report the before/after metrics. */
export function simplifyText(text: string): SimplifyReport {
  const simplifications: Simplification[] = [];
  let replacementCount = 0;
  let splitCount = 0;

  for (const sentence of sentences(text)) {
    const wordCount = words(sentence).length;
    const simplified = simplifyWordiness(sentence);
    replacementCount += simplified.replacements.length;

    let output = simplified.output;
    let split = false;
    if (words(output).length > LONG_SENTENCE_WORDS) {
      const attempt = splitSentence(output);
      if (attempt.split) {
        output = attempt.parts.join(" ");
        split = true;
        splitCount += 1;
      }
    }

    simplifications.push({
      source: sentence,
      simplified: output,
      words: wordCount,
      replacements: simplified.replacements,
      split,
    });
  }

  const rewritten = simplifications.map((entry) => entry.simplified).join(" ");

  return {
    simplifications,
    before: readabilityMetrics(text),
    after: readabilityMetrics(rewritten),
    replacementCount,
    splitCount,
    changedSentences: simplifications.filter(
      (entry) => entry.split || entry.replacements.length > 0,
    ).length,
  };
}
