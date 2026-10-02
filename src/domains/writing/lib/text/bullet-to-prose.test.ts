import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_BULLET_WORDS, PROSE_CONNECTORS, bulletsToProse, parseBullets } from "./bullet-to-prose.ts";

const LIST = "- Draft the outline\n- Write the first section\n- Send the draft to the editor\n";

test("the connector sequence is published", () => {
  assert.deepEqual(PROSE_CONNECTORS, ["First", "Next", "Then", "After that", "Finally"]);
  assert.equal(MAX_BULLET_WORDS, 25);
});

test("parseBullets strips markers and counts words", () => {
  assert.deepEqual(parseBullets("1. First item\n2. Second item"), [
    { text: "First item", words: 2 },
    { text: "Second item", words: 2 },
  ]);
  assert.deepEqual(parseBullets(""), []);
});

test("bullets become a paragraph with the fixed connectors", () => {
  const draft = bulletsToProse(LIST, { connectors: true });
  assert.equal(draft.sentences, 3);
  assert.equal(draft.shape, "paragraph");
  assert.deepEqual(draft.checks, []);
  assert.equal(
    draft.output,
    "Draft the outline. Next write the first section. Then send the draft to the editor.",
  );
});

test("without connectors the bullets simply become sentences", () => {
  const draft = bulletsToProse(LIST);
  assert.equal(draft.output, "Draft the outline. Write the first section. Send the draft to the editor.");
});

test("the single-sentence shape joins short bullets with and", () => {
  const draft = bulletsToProse("- Short one\n- Another short point\n", { shape: "single" });
  assert.equal(draft.shape, "single");
  assert.equal(draft.sentences, 1);
  assert.equal(draft.output, "Short one and Another short point.");
  assert.match(draft.checks[0], /looks like a heading/);
});

test("duplicate bullets are dropped and reported", () => {
  const draft = bulletsToProse("- Check the figures\n- Check the figures\n- Send the note\n");
  assert.equal(draft.bullets.length, 2);
  assert.match(draft.checks.join(" "), /Duplicate bullet dropped/);
});

test("a bullet past the word ceiling is flagged", () => {
  const long = Array.from({ length: 26 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = bulletsToProse(`- ${long}\n- Short one\n`);
  assert.ok(draft.checks.some((check) => check.startsWith("A 26-word bullet")));
});

test("an empty list is reported", () => {
  const draft = bulletsToProse("   ");
  assert.equal(draft.output, "");
  assert.deepEqual(draft.checks, ["Paste a bullet list — one item per line."]);
});
