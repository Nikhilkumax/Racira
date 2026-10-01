import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeDialogue, dialogueReport } from "./dialogue.ts";

const PASSAGE = [
  'Mara: "We should turn back."',
  'Dev: "Not yet — the tide is with us."',
  'Mara: "The tide is the problem," she said quietly.',
  '"Nonsense," Dev barked.',
  '"Are you certain?" she asked.',
].join("\n");

test("analyzeDialogue attributes script and prose speeches to speakers", () => {
  const report = analyzeDialogue(PASSAGE);
  assert.equal(report.lines, 5);
  assert.equal(report.words, 20);
  assert.deepEqual(report.speakers.find((s) => s.name === "Mara"), { name: "Mara", lines: 2, words: 9 });
  assert.deepEqual(report.speakers.find((s) => s.name === "Dev"), { name: "Dev", lines: 2, words: 8 });
  assert.ok(report.speakers.some((s) => s.name === "(unnamed)"));
});

test("analyzeDialogue separates plain tags from said-bookisms and adverb tags", () => {
  const report = analyzeDialogue(PASSAGE);
  assert.equal(report.plainTags, 2);
  assert.deepEqual(report.bookisms, [{ verb: "barked", count: 1 }]);
  assert.equal(report.adverbTags, 1);
});

test("analyzeDialogue counts questions, exclamations and the longest speech", () => {
  const report = analyzeDialogue(PASSAGE);
  assert.equal(report.questions, 1);
  assert.equal(report.exclamations, 0);
  assert.deepEqual(report.longest, { speaker: "Dev", words: 7 });
  assert.equal(report.averageWords, 4);
  assert.equal(report.narrationLines, 0);
});

test("analyzeDialogue counts unquoted narration lines", () => {
  const report = analyzeDialogue('Mara: "Hello."\nRain fell on the pier.');
  assert.equal(report.lines, 1);
  assert.equal(report.narrationLines, 1);
  assert.ok(dialogueReport(report).includes("1 speech(es)"));
});
