/**
 * Unit tests for the register engines.
 *
 * The checks verify the direction of each measure (formal text scores above
 * informal text, positive lexicon words beat negative ones), the transparency
 * guarantees (six formality components whose weights sum to 100, five tone
 * signals), and the academic checklist's pass/warn logic.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { academicRegisterAnalysis, countTerms, formalityAnalysis, toneAnalysis } from "./register.ts";

const FORMAL =
  "The committee therefore recommends that the proposal be approved. Furthermore, the evidence supports the conclusion.";
const INFORMAL = "I really don't think we're gonna like it, you know. It's kinda cool and stuff!";

test("countTerms counts whole phrases case-insensitively", () => {
  assert.equal(countTerms("the cat and the dog", ["the"]).count, 2);
  assert.equal(countTerms("the cat and the dog", ["cat the"]).count, 0); // not adjacent in the source
  assert.equal(countTerms("A LOT of work", ["a lot"]).count, 1);
});

test("formality has six components whose weights sum to 100", () => {
  const result = formalityAnalysis(FORMAL);
  assert.equal(result.components.length, 6);
  assert.equal(
    result.components.reduce((sum, component) => sum + component.weight, 0),
    100,
  );
});

test("formal prose scores above informal prose", () => {
  const formal = formalityAnalysis(FORMAL);
  const informal = formalityAnalysis(INFORMAL);
  assert.ok(formal.score > 65, `formal scored ${formal.score}`);
  assert.ok(informal.score < 45, `informal scored ${informal.score}`);
  assert.ok(formal.score - informal.score > 25);
});

test("formality counts the markers it reports", () => {
  const result = formalityAnalysis(INFORMAL);
  assert.equal(result.counts.contractions, 3); // don't, we're, It's
  assert.ok(result.counts.informal >= 4); // really, gonna, kinda, cool, stuff
  assert.equal(result.counts.formalMarkers, 0);
});

test("formality bands cover the range", () => {
  assert.equal(formalityAnalysis(FORMAL).band.label.length > 0, true);
  assert.notEqual(formalityAnalysis(FORMAL).band.label, formalityAnalysis(INFORMAL).band.label);
});

test("tone reports five separate signals", () => {
  const result = toneAnalysis("This is a great and wonderful success.");
  assert.equal(result.signals.length, 5);
  assert.deepEqual(
    result.signals.map((signal) => signal.key),
    ["polarity", "energy", "directness", "confidence", "register"],
  );
  assert.match(result.summary, /register/i);
});

test("tone polarity follows the sentiment lexicon", () => {
  const polarityOf = (text: string) => toneAnalysis(text).signals[0].value;
  assert.equal(polarityOf("This is a great and wonderful success."), "Positive");
  assert.equal(polarityOf("This is a terrible and painful failure."), "Negative");
  assert.equal(polarityOf("The cat sat on the mat."), "Neutral");
  assert.equal(toneAnalysis("This is a great and wonderful success.").netPolarity, 3);
});

test("tone energy and confidence move with the text", () => {
  const loud = toneAnalysis("This is really very extremely good!!!");
  assert.equal(loud.signals[1].value, "High");

  const tentative = toneAnalysis("It seems that this is perhaps possibly maybe right, and it appears likely.");
  assert.equal(tentative.signals[3].value, "Tentative");

  const flat = toneAnalysis("The committee approved the proposal.");
  assert.equal(flat.signals[3].value, "Assertive");
});

test("academic register warns on contractions and informal words", () => {
  const result = academicRegisterAnalysis("Don't use you here, it's really very big stuff.");
  const status = (id: string) => result.checks.find((check) => check.id === id)?.status;
  assert.equal(status("contractions"), "warn");
  assert.equal(status("second-person"), "warn");
  assert.equal(status("informal"), "warn");
  assert.equal(status("intensifiers"), "warn");
  assert.equal(status("vague"), "warn");
  assert.ok(result.warnings >= 5);
});

test("a clean academic sentence raises no warnings", () => {
  const result = academicRegisterAnalysis(
    "The study examines the relationship between temperature and growth. Furthermore, the results suggest a strong correlation.",
  );
  assert.equal(result.warnings, 0);
  const hedges = result.checks.find((check) => check.id === "hedges");
  assert.equal(hedges?.status, "pass"); // hedging is never treated as an error
});

test("academic checks name the offending examples", () => {
  const result = academicRegisterAnalysis("We don't really know.");
  const contractions = result.checks.find((check) => check.id === "contractions");
  assert.deepEqual(contractions?.examples, ["don't"]);
});
