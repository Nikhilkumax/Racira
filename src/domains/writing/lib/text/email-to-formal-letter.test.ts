import { test } from "node:test";
import assert from "node:assert/strict";
import { CASUAL_PHRASES, LETTER_CONTRACTIONS, formaliseEmail } from "./email-to-formal-letter.ts";

const EMAIL =
  "Hi Sam,\n\nI just wanted to get back to you about the budget. It's a lot of work but we can't start until Friday!! Thanks for the update \u{1F600}\n\nThanks,\nAlex";

test("the contraction and phrase tables are published", () => {
  assert.ok(LETTER_CONTRACTIONS.some(([from, to]) => from === "can't" && to === "cannot"));
  assert.ok(CASUAL_PHRASES.some((entry) => entry.phrase === "i just wanted to"));
  assert.ok(CASUAL_PHRASES.every((entry) => entry.replacement.length > 0));
});

test("formaliseEmail rewrites the greeting, body and sign-off", () => {
  const draft = formaliseEmail(EMAIL, { sender: "Alex Doe" });
  assert.equal(draft.words, 26);
  assert.deepEqual(draft.checks, []);
  assert.equal(
    draft.output,
    "Dear Sam,\n\nI am writing to get back to you about the budget. It is considerable work but we cannot start until Friday! Thank you for the update\n\nYours sincerely,\nAlex Doe",
  );
});

test("every substitution is listed with its reason", () => {
  const draft = formaliseEmail(EMAIL, { sender: "Alex Doe" });
  assert.deepEqual(
    draft.changes.map((change) => change.id),
    ["greeting", "closing", "emoji", "bangs", "contraction", "contraction", "phrase", "phrase", "phrase"],
  );
  const opener = draft.changes.find((change) => change.from === "I just wanted to");
  assert.equal(opener?.to, "I am writing to");
  assert.match(opener?.note ?? "", /apologetic opener/);
});

test("a typed name becomes the signature when no sender is supplied", () => {
  const draft = formaliseEmail(EMAIL);
  assert.match(draft.output, /Yours sincerely,\nAlex$/);
  assert.doesNotMatch(draft.output, /\[Your name\]/);
});

test("a message with no greeting or sign-off gets both, and says so", () => {
  const draft = formaliseEmail(
    "The report is attached for your review and comments on the figures, and I would welcome any corrections before it goes to the board on Monday.",
  );
  assert.equal(draft.words, 26);
  assert.match(draft.output, /^Dear Sir or Madam,/);
  assert.match(draft.output, /Yours sincerely,/);
  assert.deepEqual(draft.checks, [
    "No greeting line found; Dear Sir or Madam was added — replace it with the reader's name.",
    "No sign-off found; Yours sincerely was added with a signature line.",
  ]);
});

test("a body under twenty words is flagged", () => {
  const draft = formaliseEmail("Hi Sam,\n\nQuick note about the budget.\n\nThanks,\nAlex");
  assert.ok(draft.checks.some((check) => check.includes("under twenty words")));
});
