import { test } from "node:test";
import assert from "node:assert/strict";
import { buildThesis, thesisChecks, thesisReport } from "./thesis.ts";

test("buildThesis joins the topic, position and reasons", () => {
  const thesis = buildThesis({ topic: "remote work", position: "should be limited", reasons: ["it blurs rest", "it hides costs"] });
  assert.equal(thesis, "Remote work should be limited because it blurs rest and it hides costs.");
});

test("buildThesis handles one reason and no reasons", () => {
  assert.equal(buildThesis({ topic: "remote work", position: "helps focus", reasons: ["it cuts the commute"] }), "Remote work helps focus because it cuts the commute.");
  assert.equal(buildThesis({ topic: "remote work", position: "changed the office", reasons: [] }), "Remote work changed the office.");
});

test("thesisChecks flags an incomplete thesis and missing reasons", () => {
  const checks = thesisChecks({ topic: "", position: "should be banned", reasons: [] });
  const ids = checks.map((check) => check.id);
  assert.ok(ids.includes("incomplete"));
  assert.ok(ids.includes("no-reasons"));
});

test("thesisChecks flags hedges and vagueness", () => {
  const parts = { topic: "Remote work", position: "I think it is good", reasons: ["it is important"] };
  const ids = thesisChecks(parts).map((check) => check.id);
  assert.ok(ids.includes("hedge"));
  assert.ok(ids.includes("vague"));
});

test("thesisReport gathers the thesis and the prompts", () => {
  const report = thesisReport({ topic: "remote work", position: "helps focus", reasons: ["it cuts the commute"] });
  assert.ok(report.includes("Remote work helps focus because it cuts the commute."));
  assert.ok(report.includes("No mechanical issues found."));
});
