import { test } from "node:test";
import assert from "node:assert/strict";
import { compareVersions, makeVersion, versionTimeline, versionsReport } from "./draft-versions.ts";

const ONE = makeVersion("Draft one", "one two three");
const TWO = makeVersion("Draft two", "one two three four");
const THREE = makeVersion("Draft three", "one two");

test("makeVersion counts the words and falls back to a label", () => {
  assert.equal(ONE.words, 3);
  assert.equal(makeVersion("", "text").label, "Untitled draft");
});

test("versionTimeline shows the change against the previous version", () => {
  assert.deepEqual(versionTimeline([ONE, TWO, THREE]), [
    { label: "Draft one", words: 3, delta: 0 },
    { label: "Draft two", words: 4, delta: 1 },
    { label: "Draft three", words: 2, delta: -2 },
  ]);
});

test("compareVersions reports the word delta", () => {
  const delta = compareVersions(ONE, TWO);
  assert.equal(delta.from, "Draft one");
  assert.equal(delta.to, "Draft two");
  assert.equal(delta.wordDelta, 1);
  assert.ok(delta.addedWords >= 1);
  assert.ok(delta.similarity > 0.5);
});

test("versionsReport summarises the latest change", () => {
  const report = versionsReport([ONE, TWO]);
  assert.ok(report.includes("Draft two: 4 words (+1)"));
  assert.ok(report.includes("Latest change (Draft one → Draft two)"));
});
