import { test } from "node:test";
import assert from "node:assert/strict";
import { buildNewsletter, parseSections } from "./newsletter.ts";

const FULL = {
  name: "The Support Desk",
  issue: "12",
  sections: [
    "What changed this month | The three fixes we shipped",
    "One tool worth trying | A script that rewrites canned replies",
    "Ask the readers | Your worst ticket, in one sentence",
  ],
  cta: "Reply with your worst ticket",
  signOff: "— Ada",
};

test("buildNewsletter assembles the masthead, sections and sign-off", () => {
  const draft = buildNewsletter(FULL);
  assert.equal(draft.words, 41);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.newsletter.startsWith("The Support Desk — Issue 12"));
  assert.ok(draft.newsletter.includes("What changed this month\nThe three fixes we shipped"));
  assert.ok(draft.newsletter.includes("Next step\nReply with your worst ticket"));
  assert.ok(draft.newsletter.endsWith("— Ada"));
});

test("parseSections splits heading from purpose", () => {
  const sections = parseSections(["Heading only", "Heading | Purpose line"]);
  assert.deepEqual(sections[0], { heading: "Heading only", purpose: "" });
  assert.deepEqual(sections[1], { heading: "Heading", purpose: "Purpose line" });
});

test("buildNewsletter flags the missing masthead, sections and close", () => {
  const draft = buildNewsletter({ name: "", issue: "", sections: [], cta: "", signOff: "" });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["cta", "issue", "name", "sections", "sign-off"]);
});

test("buildNewsletter asks for a purpose line and caps section count", () => {
  const draft = buildNewsletter({
    ...FULL,
    sections: ["One", "Two", "Three", "Four", "Five", "Six | has a purpose", "Seven"],
  });
  assert.ok(draft.checks.some((check) => check.id === "sections-many"));
  assert.ok(draft.checks.some((check) => check.id === "purpose" && check.message.includes('"One"')));
});

test("buildNewsletter flags a heading that became a sentence", () => {
  const draft = buildNewsletter({
    ...FULL,
    sections: ["one two three four five six seven eight nine | purpose", "b | p", "c | p"],
  });
  assert.ok(draft.checks.some((check) => check.id === "heading-long" && check.message.includes("9 words")));
});
