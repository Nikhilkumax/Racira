import { test } from "node:test";
import assert from "node:assert/strict";
import { STRUCTURES, beatSheetMarkdown, beatsUpTo, findStructure, structureProgress } from "./story-structure.ts";

test("STRUCTURES exposes the four beat sheets with their beat counts", () => {
  assert.deepEqual(
    STRUCTURES.map((structure) => [structure.id, structure.beats.length]),
    [
      ["three-act", 7],
      ["four-act", 5],
      ["save-the-cat", 15],
      ["hero-journey", 12],
    ],
  );
});

test("findStructure falls back to the first structure", () => {
  assert.equal(findStructure("save-the-cat").beats.length, 15);
  // @ts-expect-error an unknown id is not part of the union
  assert.equal(findStructure("nope").id, "three-act");
});

test("beatsUpTo and structureProgress measure a position in the story", () => {
  const threeAct = findStructure("three-act");
  assert.equal(beatsUpTo(threeAct, 10).length, 2);
  assert.equal(beatsUpTo(threeAct, 50).length, 4);
  assert.equal(structureProgress(threeAct, 50), 57);
  assert.equal(structureProgress(threeAct, 100), 100);
});

test("beatSheetMarkdown names every beat", () => {
  const sheet = beatSheetMarkdown(findStructure("hero-journey"));
  assert.ok(sheet.includes("Hero's journey"));
  assert.ok(sheet.includes("Ordinary world"));
  assert.ok(sheet.includes("Return with the elixir"));
});
