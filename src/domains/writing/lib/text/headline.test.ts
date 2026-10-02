import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeHeadline } from "./headline.ts";

test("analyzeHeadline scores a strong headline and finds no faults", () => {
  const analysis = analyzeHeadline("The 7-step guide that saves your team six hours a week");
  assert.equal(analysis.score, 80);
  assert.equal(analysis.grade, "Strong");
  assert.equal(analysis.wordCount, 11);
  assert.deepEqual(analysis.powerWords, ["guide"]);
  assert.deepEqual(analysis.checks, []);
  assert.deepEqual(
    analysis.parts.map((part) => part.points),
    [25, 20, 15, 10, 0, 10],
  );
});

test("analyzeHeadline flags the habits a weak headline lacks", () => {
  const analysis = analyzeHeadline("This is a bad headline");
  assert.equal(analysis.score, 25);
  assert.equal(analysis.grade, "Weak");
  assert.deepEqual(analysis.checks.map((check) => check.id), ["power", "number", "you"]);
});

test("analyzeHeadline flags caps, a closing period and a repeated word", () => {
  const analysis = analyzeHeadline("HUGE SALE on the huge sale today.");
  assert.ok(analysis.checks.some((check) => check.id === "caps" && check.message.includes("HUGE, SALE")));
  assert.ok(analysis.checks.some((check) => check.id === "period"));
  assert.ok(analysis.checks.some((check) => check.id === "repeat" && check.message.includes("sale")));
});

test("analyzeHeadline flags a headline that ran long", () => {
  const long = Array.from({ length: 16 }, (_, index) => `word${index + 1}`).join(" ");
  const analysis = analyzeHeadline(long);
  assert.equal(analysis.wordCount, 16);
  assert.ok(analysis.checks.some((check) => check.id === "long" && check.message.includes("16 words")));
});
