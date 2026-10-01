import { test } from "node:test";
import assert from "node:assert/strict";
import { formatManuscript, manuscriptChecklist, manuscriptStats, smartenText } from "./manuscript.ts";

test("smartenText converts straight quotes to curly ones", () => {
  const result = smartenText('"Hello," she said.');
  assert.equal(result.text, "\u201cHello,\u201d she said.");
  assert.equal(result.changes.smartQuotes, 2);
});

test("smartenText keeps apostrophes as apostrophes", () => {
  assert.equal(smartenText("it's fine").text, "it\u2019s fine");
});

test("smartenText converts spaced double hyphens to em dashes and dots to an ellipsis", () => {
  const dash = smartenText("a -- b");
  assert.equal(dash.text, "a\u2014b");
  assert.equal(dash.changes.emDashes, 1);

  const dots = smartenText("Wait...");
  assert.equal(dots.text, "Wait\u2026");
  assert.equal(dots.changes.ellipses, 1);
});

test("formatManuscript normalises a scene break and counts the parts", () => {
  const result = formatManuscript("Chapter one\n\nA scene happens.\n\n***\n\nMore happens.");
  assert.equal(result.stats.chapters, 1);
  assert.equal(result.stats.sceneBreaks, 1);
  assert.ok(result.text.includes("* * *"));
  assert.equal(result.changes.sceneBreaks, 1);
});

test("formatManuscript can prepend a title page", () => {
  const result = formatManuscript("Chapter one\n\nText.", { titlePage: true, title: "My Book", author: "A. Writer" });
  assert.ok(result.text.startsWith("My Book\nby A. Writer"));
});

test("manuscriptStats counts words, sentences and paragraphs", () => {
  const stats = manuscriptStats("Chapter one\n\nOne. Two!\n\nThree?");
  assert.equal(stats.words, 5);
  assert.equal(stats.sentences, 3);
  assert.equal(stats.paragraphs, 3);
});

test("manuscriptChecklist names the standard requirements", () => {
  assert.equal(manuscriptChecklist().length, 5);
});
