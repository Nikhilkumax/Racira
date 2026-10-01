import { test } from "node:test";
import assert from "node:assert/strict";
import { argumentChecks, argumentCompleteness, argumentMarkdown, argumentReport, type ArgumentMap } from "./argument-map.ts";

const FULL: ArgumentMap = {
  claim: "Remote work should be limited",
  reasons: [
    { reason: "it blurs rest", evidence: "two studies", warrant: "rest needs separation" },
    { reason: "it hides costs", evidence: "a survey" },
  ],
  objection: "some roles need it",
  rebuttal: "those roles are rare",
};

test("argumentCompleteness counts reasons with evidence and warrant", () => {
  const result = argumentCompleteness(FULL);
  assert.equal(result.reasons, 2);
  assert.equal(result.evidenced, 2);
  assert.equal(result.warranted, 1);
  assert.equal(result.filled, 5);
  assert.equal(result.percent, 100);
});

test("argumentChecks asks for the missing warrant", () => {
  const checks = argumentChecks(FULL);
  assert.equal(checks.length, 1);
  assert.ok(checks[0].includes("no warrant"));
});

test("argumentChecks asks for reasons, evidence and an objection", () => {
  const checks = argumentChecks({ claim: "something", reasons: [] });
  assert.ok(checks.some((check) => check.includes("at least 2")));
  assert.ok(checks.some((check) => check.includes("No objection named")));
});

test("argumentMarkdown and argumentReport render the map", () => {
  const markdown = argumentMarkdown(FULL);
  assert.ok(markdown.includes("# Claim"));
  assert.ok(markdown.includes("### Reason 1"));
  assert.ok(markdown.includes("rest needs separation"));
  assert.ok(argumentReport(FULL).includes("5/5"));
});
