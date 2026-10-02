import { test } from "node:test";
import assert from "node:assert/strict";
import { buildStoryIdea } from "./story-idea.ts";

const FULL = {
  genre: "noir",
  protagonist: "Mara",
  want: "to buy back her father's shop",
  obstacle: "the buyer is her brother",
  setting: "a flooded river town",
};

test("buildStoryIdea assembles the premise from the parts", () => {
  const draft = buildStoryIdea(FULL);
  assert.equal(draft.premise, "Mara wants to buy back her father's shop, but the buyer is her brother. (noir, set in a flooded river town.)");
  assert.equal(draft.words, 21);
  assert.deepEqual(draft.completeness, { done: 4, total: 4 });
  assert.deepEqual(draft.checks, []);
});

test("buildStoryIdea spins the parts into what-if variants", () => {
  const draft = buildStoryIdea(FULL);
  assert.deepEqual(draft.variants, [
    "What if to buy back her father's shop is achieved in the first act, and the story is the cost?",
    "What if the buyer is her brother is right?",
    "What if Mara is the obstacle?",
    "What if the setting itself — a flooded river town — is the antagonist?",
  ]);
});

test("buildStoryIdea asks for each missing part", () => {
  const draft = buildStoryIdea({ genre: "", protagonist: "", want: "", obstacle: "", setting: "" });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["genre", "obstacle", "protagonist", "setting", "want"]);
  assert.equal(draft.premise, "");
  assert.deepEqual(draft.variants, []);
  assert.deepEqual(draft.completeness, { done: 0, total: 4 });
});

test("buildStoryIdea flags a want that became a summary", () => {
  const want = Array.from({ length: 16 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildStoryIdea({ ...FULL, want });
  assert.ok(draft.checks.some((check) => check.id === "want-long" && check.message.includes("16 words")));
});
