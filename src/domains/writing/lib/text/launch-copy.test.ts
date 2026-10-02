import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLaunchCopy } from "./launch-copy.ts";

const FULL = {
  product: "Northwind Triage",
  date: "14 April 2026",
  audience: "support teams of five to fifty",
  what: "A triage assistant that routes tickets by urgency and owner.",
  why: "Response time is the number customers quote when they leave.",
  cta: "Join the early-access list",
};

test("buildLaunchCopy assembles the announcement in order", () => {
  const draft = buildLaunchCopy(FULL);
  assert.equal(draft.words, 48);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.copy.startsWith("Northwind Triage — launching 14 April 2026"));
  assert.ok(draft.copy.includes("What is new\nA triage assistant that routes tickets by urgency and owner."));
  assert.ok(draft.copy.endsWith("Next step\nJoin the early-access list"));
});

test("buildLaunchCopy flags each missing part", () => {
  const draft = buildLaunchCopy({ product: "", date: "", audience: "", what: "", why: "", cta: "" });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["audience", "cta", "date", "product", "what", "why"]);
});

test("buildLaunchCopy asks for a date that can be circled", () => {
  const draft = buildLaunchCopy({ ...FULL, date: "soon" });
  assert.ok(draft.checks.some((check) => check.id === "date-vague" && check.message.includes('"soon"')));
});

test("buildLaunchCopy flags a what that became a briefing", () => {
  const what = Array.from({ length: 31 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildLaunchCopy({ ...FULL, what });
  assert.ok(draft.checks.some((check) => check.id === "what-long" && check.message.includes("31 words")));
});
