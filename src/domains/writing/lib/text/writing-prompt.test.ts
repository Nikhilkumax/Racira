import { test } from "node:test";
import assert from "node:assert/strict";
import { PROMPT_BANK, PROMPT_CATEGORIES, PROMPTS_PER_PAGE, nextPromptOffset, promptPage } from "./writing-prompt.ts";

test("the prompt bank holds six prompts for each of the five categories", () => {
  assert.deepEqual(PROMPT_CATEGORIES.map((category) => category.id), ["character", "setting", "conflict", "dialogue", "opening"]);
  for (const category of PROMPT_CATEGORIES) {
    assert.equal(PROMPT_BANK[category.id].length, 6);
  }
  assert.equal(PROMPTS_PER_PAGE, 3);
});

test("promptPage serves three prompts and advances through the bank", () => {
  const first = promptPage("character", 0);
  assert.deepEqual(first.prompts, [
    "Write about someone who apologises before they are accused.",
    "Write about someone who keeps a suitcase packed for a trip they will never take.",
    "Write about someone who is only brave on other people's behalf.",
  ]);
  const second = promptPage("character", 3);
  assert.deepEqual(second.prompts, [
    "Write about someone whose greatest skill is also their worst habit.",
    "Write about someone who remembers every promise made to them, and none they made.",
    "Write about someone who is kind for reasons they would not admit.",
  ]);
});

test("promptPage wraps at the end of the bank", () => {
  const wrapped = promptPage("character", 6);
  assert.equal(wrapped.offset, 0);
  assert.equal(wrapped.total, 6);
  assert.deepEqual(wrapped.prompts, promptPage("character", 0).prompts);
});

test("nextPromptOffset cycles by three and wraps", () => {
  assert.equal(nextPromptOffset("character", 0), 3);
  assert.equal(nextPromptOffset("character", 3), 0);
});

test("an unknown category falls back to the first bank", () => {
  const page = promptPage("nope", 0);
  assert.deepEqual(page.prompts, promptPage("character", 0).prompts);
});
