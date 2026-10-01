import { test } from "node:test";
import assert from "node:assert/strict";
import { PEER_REVIEW_CHECKLIST, reviewProgress, reviewReport } from "./peer-review.ts";

test("PEER_REVIEW_CHECKLIST groups the items by section", () => {
  assert.equal(PEER_REVIEW_CHECKLIST.length, 12);
  const sections = new Set(PEER_REVIEW_CHECKLIST.map((item) => item.section));
  assert.deepEqual([...sections].sort(), ["Discussion", "Introduction", "Methods", "Presentation", "Results", "Summary"]);
});

test("reviewProgress counts the ticks overall and by section", () => {
  const progress = reviewProgress(["abstract-claim"]);
  assert.equal(progress.done, 1);
  assert.equal(progress.total, 12);
  assert.equal(progress.percent, 8);
  const summary = progress.sections.find((section) => section.section === "Summary");
  assert.deepEqual(summary, { section: "Summary", done: 1, total: 2 });
});

test("reviewReport marks the ticks and includes the notes", () => {
  const report = reviewReport(["abstract-claim"], { "abstract-claim": "states the method clearly" });
  assert.ok(report.includes("[x] Does the abstract state"));
  assert.ok(report.includes("[ ] Is the contribution clear"));
  assert.ok(report.includes("states the method clearly"));
  assert.ok(report.includes("By section:"));
});
