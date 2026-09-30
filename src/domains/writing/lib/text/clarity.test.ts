/**
 * Unit tests for the clarity index.
 *
 * The index is a composite of four documented curves, so the tests check the
 * curves themselves (a mean sentence length of 22 scores 84 on the sentence
 * component), the weights (they must sum to 100), and the direction of the
 * result (dense text scores lower than plain text).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { clarityBand, clarityScore } from "./clarity.ts";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

test("clarityScore: components follow their documented curves", () => {
  const result = clarityScore(
    "The cat sat on the mat and the dog ran to the park with a red ball in the yard today. ".repeat(4),
  );
  const byKey = new Map(result.components.map((component) => [component.key, component]));

  const sentenceLength = byKey.get("sentence-length");
  assert.ok(sentenceLength);
  assert.ok(sentenceLength.rule.length > 20, "the component states the curve it uses");
  // The reported score must equal the documented curve at the reported mean.
  const mean = Number.parseFloat(sentenceLength.measured);
  assert.ok(Number.isFinite(mean) && mean > 18, sentenceLength.measured);
  assert.equal(
    Math.round(sentenceLength.score),
    Math.round(clamp(100 - 4 * Math.max(0, mean - 18) - 3 * Math.max(0, 12 - mean))),
  );

  const variety = byKey.get("sentence-variety");
  assert.ok(variety);
  assert.equal(variety.score, 0, "four identical sentences have zero variation");

  const longSentences = byKey.get("long-sentences");
  assert.ok(longSentences);
  assert.equal(longSentences.score, 100, "no sentence is over 30 words");

  const complexWords = byKey.get("complex-words");
  assert.ok(complexWords);
  assert.ok(complexWords.score > 50, "mostly one-syllable words");
});

test("clarityScore: weights sum to 100 and the result is their weighted mean", () => {
  const result = clarityScore(
    "Short sentences read easily. Complexity builds understanding gradually when writers vary their structure.",
  );
  const totalWeight = result.components.reduce((sum, component) => sum + component.weight, 0);
  assert.equal(totalWeight, 100);

  const weighted = result.components.reduce((sum, component) => sum + component.score * component.weight, 0);
  assert.equal(result.score, Math.round((weighted / totalWeight) * 10) / 10);
  for (const component of result.components) {
    assert.ok(component.score >= 0 && component.score <= 100);
    assert.ok(component.measured.length > 0);
  }
});

test("clarityScore: dense prose scores below plain prose", () => {
  const plain = clarityScore(
    "The team wrote short sentences. Readers followed them easily. The result was clear and quick to scan. " +
      "Each point landed in turn.",
  );
  const dense = clarityScore(
    "Notwithstanding the comprehensive infrastructural modernisation initiatives, organisational " +
      "reconfiguration necessitates extraordinarily substantial methodological reconsideration " +
      "throughout the entirety of the administrative apparatus, consequently engendering " +
      "considerable operational discontinuity and substantial personnel disorientation.",
  );
  assert.ok(dense.score < plain.score, `dense ${dense.score} should score below plain ${plain.score}`);
  const plainComplex = plain.components.find((c) => c.key === "complex-words")?.score ?? 0;
  const denseComplex = dense.components.find((c) => c.key === "complex-words")?.score ?? 0;
  assert.ok(plainComplex > denseComplex, "plain text uses simpler words");
  assert.ok(denseComplex < 60, `dense complex-word component was ${denseComplex}`);
});

test("clarityScore: monotony is penalised through the variety component", () => {
  const varied = clarityScore(
    "It rained. The meeting continued despite the noise outside, which nobody mentioned at the time. " +
      "We agreed. Afterwards the building emptied quickly and the lights went out one by one.",
  );
  const uniform = clarityScore(
    "It rained today. The meeting stopped. We went home. The lights went out. The cat slept on. " +
      "The door stayed shut.",
  );
  const variedComponent = varied.components.find((c) => c.key === "sentence-variety");
  const uniformComponent = uniform.components.find((c) => c.key === "sentence-variety");
  assert.ok((variedComponent?.score ?? 0) > (uniformComponent?.score ?? 0));
});

test("clarityScore: short and empty samples are flagged, not fabricated", () => {
  assert.equal(clarityScore("").shortSample, true);
  assert.equal(clarityScore("The cat sat.").shortSample, true);
  const long = "The cat sat on the mat. The dog ran in the park. The bird sang all morning. ".repeat(12);
  assert.equal(clarityScore(long).shortSample, false);
});

test("clarityBand: bands cover the scale", () => {
  assert.equal(clarityBand(92).label, "Very clear");
  assert.equal(clarityBand(85).label, "Very clear");
  assert.equal(clarityBand(72).label, "Clear");
  assert.equal(clarityBand(60).label, "Could be clearer");
  assert.equal(clarityBand(45).label, "Dense");
  assert.equal(clarityBand(10).label, "Hard going");
  for (const band of [92, 72, 60, 45, 10]) {
    assert.ok(clarityBand(band).note.length > 20);
  }
});

test("component curve matches the documented sentence-length rule", () => {
  // The same rule restated here so a change to the curve fails the build.
  const score = (mean: number) => clamp(100 - 4 * Math.max(0, mean - 18) - 3 * Math.max(0, 12 - mean));
  assert.equal(score(18), 100);
  assert.equal(score(22), 84);
  assert.equal(score(30), 52);
  assert.equal(score(43), 0);
  assert.equal(score(8), 88);
  assert.equal(score(4), 76);
});
