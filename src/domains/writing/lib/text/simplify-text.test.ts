import { test } from "node:test";
import assert from "node:assert/strict";
import { LONG_SENTENCE_WORDS, simplifyText, splitSentence } from "./simplify-text.ts";

const SAMPLE =
  "In order to utilise the new system, we must make a decision about the data. The team will commence work at this point in time, and the manager will provide assistance to everyone who needs it because the rollout is large and touches every single part of the business that has ever been involved in reporting.";

test("the long-sentence threshold is 25 words", () => {
  assert.equal(LONG_SENTENCE_WORDS, 25);
});

test("splitSentence only splits at a documented seam", () => {
  const split = splitSentence("The report was finished, and the team went home.");
  assert.equal(split.split, true);
  assert.deepEqual(split.parts, ["The report was finished.", "The team went home."]);

  const none = splitSentence("The report was finished.");
  assert.equal(none.split, false);
  assert.deepEqual(none.parts, ["The report was finished."]);
});

test("simplifyText replaces wordy phrases and measures before and after", () => {
  const report = simplifyText(SAMPLE);
  assert.equal(report.replacementCount, 6);
  assert.equal(report.splitCount, 1);
  assert.equal(report.changedSentences, 2);
  assert.equal(report.before.words, 56);
  assert.equal(report.before.sentences, 2);
  assert.equal(report.before.averageSentenceLength, 28);
  assert.equal(report.after.words, 45);
  assert.equal(report.after.sentences, 3);
  assert.equal(report.after.averageSentenceLength, 15);
});

test("each sentence keeps its replacements alongside its rewrite", () => {
  const report = simplifyText(SAMPLE);
  const first = report.simplifications[0];
  assert.equal(first.source, "In order to utilise the new system, we must make a decision about the data.");
  assert.equal(first.simplified, "To use the new system, we must decide about the data.");
  assert.equal(first.split, false);
  assert.deepEqual(
    first.replacements.map((entry) => entry.replacement),
    ["to", "use", "decide"],
  );

  const second = report.simplifications[1];
  assert.equal(second.split, true);
  assert.equal(
    second.simplified,
    "The team will start work now. The manager will help everyone who needs it because the rollout is large and touches every single part of the business that has ever been involved in reporting.",
  );
});

test("empty input produces no simplifications and zero metrics", () => {
  const report = simplifyText("");
  assert.deepEqual(report.simplifications, []);
  assert.equal(report.replacementCount, 0);
  assert.equal(report.splitCount, 0);
  assert.equal(report.before.words, 0);
  assert.equal(report.after.words, 0);
});
