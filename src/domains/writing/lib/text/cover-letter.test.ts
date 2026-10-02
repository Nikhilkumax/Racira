import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCoverLetter } from "./cover-letter.ts";

const FULL = {
  name: "Ada Lovelace",
  role: "support engineer",
  company: "Acme Analytics",
  strengths: [
    "I ran a two-person support desk",
    "I write clear bug reports",
    "I cut first-response time from two days to four hours",
  ],
  closing: "I would welcome a short call next week.",
};

test("buildCoverLetter assembles the letter from the parts", () => {
  const draft = buildCoverLetter(FULL);
  assert.equal(draft.paragraphs, 7);
  assert.equal(draft.words, 60);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.letter.startsWith("Ada Lovelace\n\nDear Acme Analytics hiring team,"));
  assert.ok(
    draft.letter.includes(
      "What I would bring to Acme Analytics: I ran a two-person support desk; I write clear bug reports; and I cut first-response time from two days to four hours.",
    ),
  );
  assert.ok(draft.letter.endsWith("Sincerely,\n\nAda Lovelace"));
});

test("buildCoverLetter joins a closing without a full stop", () => {
  const draft = buildCoverLetter({ ...FULL, closing: "I would welcome a short call" });
  assert.ok(draft.letter.includes("I would welcome a short call."));
});

test("buildCoverLetter flags each missing part once", () => {
  const draft = buildCoverLetter({ name: "", role: "", company: "", strengths: [], closing: "" });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["closing", "company", "name", "role", "strengths"]);
  assert.ok(draft.letter.includes("Sincerely,"));
});

test("buildCoverLetter flags too many specifics and one that runs long", () => {
  const long = Array.from({ length: 26 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildCoverLetter({
    ...FULL,
    strengths: ["one", "two", "three", "four", "five", "six"],
  });
  assert.ok(draft.checks.some((check) => check.id === "strength-count"));
  const longDraft = buildCoverLetter({ ...FULL, strengths: [long] });
  assert.ok(longDraft.checks.some((check) => check.id === "strength-long" && check.message.includes("26 words")));
});
