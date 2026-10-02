import { test } from "node:test";
import assert from "node:assert/strict";
import { buildValueProposition } from "./value-prop.ts";

const FULL = {
  audience: "support teams",
  need: "are drowning in tickets",
  brand: "Northwind",
  category: "help desk",
  benefit: "cuts first-response time in half",
  alternative: "a shared inbox",
  proof: "it routes 90% of tickets to the right person",
};

test("buildValueProposition assembles the promise, the contrast and the proof", () => {
  const draft = buildValueProposition(FULL);
  assert.equal(
    draft.proposition,
    "For support teams who are drowning in tickets, Northwind is a help desk that cuts first-response time in half. Unlike a shared inbox, it routes 90% of tickets to the right person.",
  );
  assert.equal(draft.words, 32);
  assert.deepEqual(draft.checks, []);
});

test("buildValueProposition degrades to the short form and names what is missing", () => {
  const draft = buildValueProposition({
    audience: "",
    need: "",
    brand: "Northwind",
    category: "",
    benefit: "cuts first-response time in half",
    alternative: "",
    proof: "it routes 90% of tickets",
  });
  assert.equal(draft.proposition, "Northwind cuts first-response time in half. It routes 90% of tickets.");
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["alternative", "audience", "category", "need"]);
});

test("buildValueProposition asks for a figure in the proof", () => {
  const draft = buildValueProposition({ ...FULL, proof: "it routes tickets to the right person" });
  assert.ok(draft.checks.some((check) => check.id === "proof-figure"));
});

test("buildValueProposition flags a benefit written from the company's side", () => {
  const draft = buildValueProposition({ ...FULL, benefit: "we cut response time in half" });
  assert.ok(draft.checks.some((check) => check.id === "first-person"));
});

test("buildValueProposition flags a pitch that ran past two sentences", () => {
  const benefit = Array.from({ length: 60 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildValueProposition({ ...FULL, benefit });
  assert.ok(draft.checks.some((check) => check.id === "long"));
});
