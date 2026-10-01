/**
 * Unit tests for the document diff engine.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { diffStats, lineDiff, unifiedDiff, wordDiff } from "./doc-diff.ts";

const OLD = "one\ntwo\nthree";
const NEW = "one\nTWO\nthree\nfour";

test("lineDiff tracks the old and new line numbers of every row", () => {
  const rows = lineDiff(OLD, NEW);
  const kinds = rows.map((row) => row.kind);
  assert.ok(kinds.includes("removed"));
  assert.ok(kinds.includes("added"));

  const removed = rows.find((row) => row.kind === "removed");
  assert.equal(removed?.text, "two");
  assert.equal(removed?.oldLine, 2);
  assert.equal(removed?.newLine, null);

  const last = rows[rows.length - 1];
  assert.equal(last.kind, "added");
  assert.equal(last.text, "four");
  assert.equal(last.newLine, 4);
  assert.equal(last.oldLine, null);
});

test("wordDiff marks the changed runs inside otherwise identical text", () => {
  const rows = wordDiff("the quick brown fox", "the slow brown fox");
  const added = rows.filter((row) => row.kind === "added").map((row) => row.text.trim());
  const removed = rows.filter((row) => row.kind === "removed").map((row) => row.text.trim());
  assert.deepEqual(added, ["slow"]);
  assert.deepEqual(removed, ["quick"]);
});

test("diffStats counts the added and removed words and lines", () => {
  const stats = diffStats(OLD, NEW);
  // jsdiff groups the changed block: two old lines removed, three new lines added.
  assert.equal(stats.addedLines, 3);
  assert.equal(stats.removedLines, 2);
  assert.equal(stats.changedLines, 5);
  assert.ok(stats.addedWords >= 1);
  assert.ok(stats.removedWords >= 1);
  assert.ok(stats.similarity > 0 && stats.similarity < 1);
});

test("diffStats on identical text is fully similar", () => {
  const stats = diffStats(OLD, OLD);
  assert.equal(stats.similarity, 1);
  assert.equal(stats.changedLines, 0);
});

test("unifiedDiff emits a +/- patch", () => {
  const patch = unifiedDiff(OLD, NEW);
  assert.ok(patch.includes("-two"));
  assert.ok(patch.includes("+TWO"));
});
