/**
 * A transparent clarity index: four measured numbers, four stated scales.
 *
 * This is deliberately NOT presented as a published index — it is a composite
 * whose every component, curve and weight is visible in the code and repeated in
 * the UI, so a reader can disagree with the score and see exactly why it landed
 * where it did. The components:
 *
 *   1. Sentence length (weight 30) — 100 up to a mean of 18 words, then −4 per
 *      additional word to 0 at 40; a mean below 12 is penalised 3 per word for
 *      choppiness (floor 60).
 *   2. Complex-word rate (weight 25) — 100 − 250 × share of 3+ syllable words,
 *      so 0 at 40% and 75 at 10%.
 *   3. Sentence variety (weight 25) — 12 × the standard deviation of sentence
 *      lengths, capped at 100: a varied rhythm scores high, monotony low.
 *   4. Long-sentence share (weight 20) — 100 − 200 × share of sentences over 30
 *      words, so 0 at half the sentences.
 *
 * The result is a 0-100 score plus the four components, each carrying the value
 * it was computed from.
 */
import { sentenceDetails, varietySummary } from "./sentence-metrics.ts";
import { MIN_RELIABLE_WORDS, readabilityMetrics } from "./readability.ts";

export interface ClarityComponent {
  key: "sentence-length" | "complex-words" | "sentence-variety" | "long-sentences";
  label: string;
  /** Weight in the composite, in percent. */
  weight: number;
  /** 0-100 component score. */
  score: number;
  /** The measured value the score came from, formatted for display. */
  measured: string;
  /** How the score maps to the measurement. */
  rule: string;
}

export interface ClarityResult {
  score: number;
  band: { label: string; note: string };
  components: ClarityComponent[];
  /** True when the sample is too short for the score to mean much. */
  shortSample: boolean;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function componentScoreSentenceLength(mean: number): number {
  const longPenalty = 4 * Math.max(0, mean - 18);
  const choppyPenalty = 3 * Math.max(0, 12 - mean);
  return clamp(100 - longPenalty - choppyPenalty);
}

export function clarityScore(text: string): ClarityResult {
  const metrics = readabilityMetrics(text);
  const details = sentenceDetails(text);
  const variety = varietySummary(details);

  const complexRate = metrics.words > 0 ? metrics.polySyllables / metrics.words : 0;
  const longSentenceShare =
    details.length > 0 ? details.filter((detail) => detail.words > 30).length / details.length : 0;

  const sentenceLengthScore = clamp(componentScoreSentenceLength(metrics.averageSentenceLength));
  const complexScore = clamp(100 - complexRate * 250);
  const varietyScore = clamp(variety.stdevWords * 12);
  const longSentenceScore = clamp(100 - longSentenceShare * 200);

  const components: ClarityComponent[] = [
    {
      key: "sentence-length",
      label: "Sentence length",
      weight: 30,
      score: sentenceLengthScore,
      measured: `${metrics.averageSentenceLength.toFixed(1)} words per sentence`,
      rule: "100 up to 18 words, then −4 per word (0 at 43); a mean under 12 also loses 3 per word for choppiness.",
    },
    {
      key: "complex-words",
      label: "Complex-word rate",
      weight: 25,
      score: complexScore,
      measured: `${(complexRate * 100).toFixed(1)}% of words have 3+ syllables`,
      rule: "100 − 250 × share of 3+ syllable words, so 0% scores 100 and 40% scores 0.",
    },
    {
      key: "sentence-variety",
      label: "Sentence variety",
      weight: 25,
      score: varietyScore,
      measured: `${variety.stdevWords.toFixed(1)} words standard deviation across ${variety.count} sentences`,
      rule: "12 × the standard deviation of sentence length, capped at 100.",
    },
    {
      key: "long-sentences",
      label: "Long sentences",
      weight: 20,
      score: longSentenceScore,
      measured: `${(longSentenceShare * 100).toFixed(0)}% of sentences are over 30 words`,
      rule: "100 − 200 × the share of sentences longer than 30 words.",
    },
  ];

  const weighted = components.reduce((sum, component) => sum + component.score * component.weight, 0);
  const totalWeight = components.reduce((sum, component) => sum + component.weight, 0);
  const score = Math.round((weighted / totalWeight) * 10) / 10;

  return {
    score,
    band: clarityBand(score),
    components,
    // `readabilityMetrics` reports counts only, so the short-sample flag is
    // derived here from the same thresholds the formulas use.
    shortSample: metrics.words < MIN_RELIABLE_WORDS || metrics.sentences < 3,
  };
}

/** Plain-language band for the composite score. */
export function clarityBand(score: number): { label: string; note: string } {
  if (score >= 85) {
    return { label: "Very clear", note: "Short enough to scan, varied enough to stay readable." };
  }
  if (score >= 70) {
    return { label: "Clear", note: "Comfortable for most readers; a few sentences carry extra weight." };
  }
  if (score >= 55) {
    return { label: "Could be clearer", note: "Some sentences are long, dense or monotonous — worth a pass." };
  }
  if (score >= 40) {
    return { label: "Dense", note: "Long sentences or heavy vocabulary are slowing the reader down." };
  }
  return { label: "Hard going", note: "Consider splitting sentences and replacing long words before publishing." };
}
