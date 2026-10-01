import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeQuestion, analyzeSurvey, surveyReport } from "./survey-question.ts";

test("analyzeQuestion flags leading and loaded wording", () => {
  const ids = analyzeQuestion("Don't you agree the policy is reckless?").issues.map((issue) => issue.id);
  assert.ok(ids.includes("leading"));
  assert.ok(ids.includes("loaded"));
});

test("analyzeQuestion flags a double-barrelled question", () => {
  const ids = analyzeQuestion("How satisfied are you with the service and the price?").issues.map((issue) => issue.id);
  assert.ok(ids.includes("double-barreled"));
});

test("analyzeQuestion flags absolutes", () => {
  assert.ok(analyzeQuestion("Do you always read the terms?").issues.some((issue) => issue.id === "absolute"));
});

test("analyzeQuestion is quiet about a clean question", () => {
  assert.deepEqual(analyzeQuestion("How often do you use the tool?").issues, []);
});

test("analyzeSurvey counts the questions and the flagged ones", () => {
  const report = analyzeSurvey("How often do you use it?\nDon't you agree it is obvious?");
  assert.equal(report.questions, 2);
  assert.equal(report.flagged, 1);
  assert.ok(surveyReport(report).includes("1 with a wording issue"));
});
