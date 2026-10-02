import { test } from "node:test";
import assert from "node:assert/strict";
import { FILLER_WORDS, SUBORDINATORS, rewriteSentence, rewriteSentences } from "./sentence-rewriter.ts";

test("the documented lists are exported in order", () => {
  assert.equal(SUBORDINATORS[0], "because");
  assert.ok(SUBORDINATORS.includes("although"));
  assert.equal(FILLER_WORDS[0], "very");
  assert.ok(FILLER_WORDS.includes("basically"));
});

test("a leading subordinate clause is moved to the end", () => {
  const rewrite = rewriteSentence("Because the rain fell, the match was cancelled.");
  assert.equal(rewrite.words, 8);
  assert.equal(rewrite.variants.length, 1);
  assert.equal(rewrite.variants[0].id, "end-clause");
  assert.equal(rewrite.variants[0].text, "The match was cancelled because the rain fell.");
});

test("a trailing subordinate clause is moved to the front", () => {
  const rewrite = rewriteSentence("The match was cancelled because the rain fell.");
  assert.equal(rewrite.variants[0].id, "front-clause");
  assert.equal(rewrite.variants[0].text, "Because the rain fell, the match was cancelled.");
});

test("a compound sentence is split into two", () => {
  const rewrite = rewriteSentence("The report was finished, and the team went home.");
  assert.equal(rewrite.variants[0].id, "split");
  assert.equal(rewrite.variants[0].text, "The report was finished. The team went home.");
});

test("intensifiers are cut and an expletive opening is noted", () => {
  const rewrite = rewriteSentence("There are very many reasons to keep the plan.");
  assert.equal(rewrite.variants[0].id, "tighten");
  assert.equal(rewrite.variants[0].text, "There are many reasons to keep the plan.");
  assert.equal(rewrite.notes.length, 1);
  assert.match(rewrite.notes[0], /expletive/);
});

test("a long sentence is noted rather than rewritten", () => {
  const long = `${Array.from({ length: 31 }, (_, index) => `word${index + 1}`).join(" ")}.`;
  const rewrite = rewriteSentence(long);
  assert.ok(rewrite.notes.some((note) => note.startsWith("31 words")));
});

test("empty input produces an empty rewrite", () => {
  const rewrite = rewriteSentence("   ");
  assert.equal(rewrite.source, "");
  assert.equal(rewrite.words, 0);
  assert.deepEqual(rewrite.variants, []);
  assert.deepEqual(rewrite.notes, []);
});

test("rewriteSentences reports the whole document", () => {
  const report = rewriteSentences(
    "Because the rain fell, the match was cancelled. The report was finished, and the team went home.",
  );
  assert.equal(report.sentences, 2);
  assert.equal(report.withVariants, 2);
  assert.equal(report.totalVariants, 2);
  assert.equal(report.rewrites[1].variants[0].id, "split");
});
