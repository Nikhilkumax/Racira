import { test } from "node:test";
import assert from "node:assert/strict";
import { detectFallacies, FALLACY_RULES, fallacyReport, splitSentences } from "./fallacy.ts";

test("FALLACY_RULES documents each fallacy with its cue phrases", () => {
  assert.ok(FALLACY_RULES.length >= 8);
  assert.ok(FALLACY_RULES.every((rule) => rule.patterns.length > 0 && rule.description.length > 0));
});

test("detectFallacies finds the cue phrases in their sentences", () => {
  const findings = detectFallacies("Everyone knows the plan is wrong. Either we cut costs or the company fails.");
  const ids = findings.map((finding) => finding.id);
  assert.ok(ids.includes("appeal-to-popularity"));
  assert.ok(ids.includes("false-dilemma"));
  assert.equal(findings[0].cue.toLowerCase(), "everyone knows");
  assert.ok(findings[0].sentence.includes("Everyone knows"));
});

test("detectFallacies is quiet about text with no cues", () => {
  assert.deepEqual(detectFallacies("The report lists three causes and a recommendation."), []);
  assert.ok(fallacyReport([]).includes("No cue phrases"));
});

test("detectFallacies catches a slippery slope and a straw man", () => {
  assert.ok(detectFallacies("It will lead to chaos before long.").some((finding) => finding.id === "slippery-slope"));
  assert.ok(detectFallacies("So you're saying we should do nothing?").some((finding) => finding.id === "straw-man"));
});

test("splitSentences splits on punctuation and newlines", () => {
  assert.deepEqual(splitSentences("One. Two!\nThree?"), ["One.", "Two!", "Three?"]);
});
