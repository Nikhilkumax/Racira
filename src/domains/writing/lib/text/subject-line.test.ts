import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeSubjectLine } from "./subject-line.ts";

test("analyzeSubjectLine scores a concrete, quiet subject line at 100", () => {
  const analysis = analyzeSubjectLine("Your refund in 10 working days");
  assert.equal(analysis.score, 100);
  assert.equal(analysis.grade, "Strong");
  assert.equal(analysis.chars, 30);
  assert.equal(analysis.wordCount, 6);
  assert.deepEqual(analysis.spamWords, []);
  assert.deepEqual(analysis.checks, []);
});

test("analyzeSubjectLine flags trigger phrases, shouting and stacked bangs", () => {
  const analysis = analyzeSubjectLine("FREE!!! Act now — limited time offer");
  assert.equal(analysis.score, 30);
  assert.equal(analysis.grade, "Weak");
  assert.deepEqual(analysis.spamWords, ["free", "act now", "limited time"]);
  assert.deepEqual(analysis.checks.map((check) => check.id), [
    "spam-free",
    "spam-act now",
    "spam-limited time",
    "caps",
    "bangs",
    "concrete",
  ]);
});

test("analyzeSubjectLine asks for a subject when there is none", () => {
  const analysis = analyzeSubjectLine("");
  assert.equal(analysis.score, 0);
  assert.deepEqual(analysis.checks.map((check) => check.id), ["empty"]);
});

test("analyzeSubjectLine warns when the line runs past the cut", () => {
  const long = Array.from({ length: 12 }, (_, index) => `word${index + 1}`).join(" ");
  const analysis = analyzeSubjectLine(long);
  assert.ok(analysis.chars > 70);
  assert.ok(analysis.checks.some((check) => check.id === "long"));
});

test("analyzeSubjectLine accepts a personalisation token as concrete", () => {
  const analysis = analyzeSubjectLine("{{name}}, your invoice is ready");
  assert.ok(!analysis.checks.some((check) => check.id === "concrete"));
});
