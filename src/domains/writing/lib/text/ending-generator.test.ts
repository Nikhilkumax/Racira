import { test } from "node:test";
import assert from "node:assert/strict";
import { ENDING_SHAPES, generateEndings } from "./ending-generator.ts";

const FULL = {
  protagonist: "Mara",
  want: "keep the farm solvent through the winter",
  obstacle: "the bank's new manager",
  turn: "the recognition that she no longer wants the farm, only the fight",
};

test("six shapes are drafted once a want and an obstacle exist", () => {
  const result = generateEndings(FULL);
  assert.deepEqual(result.checks, []);
  assert.deepEqual(
    result.ideas.map((idea) => idea.name),
    ["Full circle", "Hard-won victory", "Inversion", "Tragic fall", "Ambiguous threshold", "Quiet return"],
  );
  assert.deepEqual(result.stats, { shapes: 6, ideas: 6, words: 345 });
  assert.match(result.output, /^cast: Mara · want: keep the farm solvent through the winter · obstacle: the bank's new manager\n\n1\. Full circle\n/);
});

test("the change the writer names appears in the shapes that turn on it", () => {
  const result = generateEndings(FULL);
  assert.match(result.ideas[0].text, /one detail moved — the recognition that she no longer wants the farm, only the fight —/);
  assert.match(result.ideas[5].text, /and with the recognition that she no longer wants the farm, only the fight;/);
});

test("each idea carries the shape's promise and what it requires", () => {
  const result = generateEndings(FULL);
  for (const idea of result.ideas) {
    assert.ok(idea.promise.length > 0, idea.id);
    assert.ok(idea.requires.length > 0, idea.id);
  }
  assert.equal(result.ideas[1].requires, "A cost the reader saw the protagonist refuse earlier.");
});

test("a want without an obstacle drafts nothing and names what is missing", () => {
  const result = generateEndings({ want: "win" });
  assert.deepEqual(result.ideas, []);
  assert.deepEqual(result.checks, [
    "No obstacle; without the force that pushed back, the ending has nothing to answer.",
    "The want is 1 word; endings land on a concrete want, not a mood.",
    "No turn; name what changes in the protagonist, or the closing scene will replay the opening.",
  ]);
  assert.deepEqual(result.stats, { shapes: 6, ideas: 0, words: 3 });
});

test("without a named protagonist the drafts fall back and the gap is named", () => {
  const result = generateEndings({ want: "win the case", obstacle: "the firm that fired her" });
  assert.equal(result.ideas.length, 6);
  assert.match(result.ideas[0].text, /the protagonist is back in the place the story opened on/);
  assert.ok(result.checks.includes("No protagonist; an ending happens to someone, so name them."));
  assert.ok(result.checks.includes("No turn; name what changes in the protagonist, or the closing scene will replay the opening."));
});

test("every shape promises a distinct verdict", () => {
  assert.equal(ENDING_SHAPES.length, 6);
  assert.equal(new Set(ENDING_SHAPES.map((shape) => shape.id)).size, 6);
  assert.equal(new Set(ENDING_SHAPES.map((shape) => shape.promise)).size, 6);
});
