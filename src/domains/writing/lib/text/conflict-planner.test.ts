import { test } from "node:test";
import assert from "node:assert/strict";
import { conflictCompleteness, conflictMarkdown, conflictReport, escalationProblems } from "./conflict-planner.ts";

const PLAN = {
  name: "The ledger",
  type: "Person vs person",
  parties: "Mara and Dev",
  stakes: "the ledger that clears her father",
  escalation: ["Mara copies the key", "Dev changes the lock", "Mara breaks in anyway"],
  resolution: "Mara gets the ledger",
  cost: "Dev's trust",
};

test("conflictCompleteness counts the fields and the escalation turns", () => {
  const result = conflictCompleteness(PLAN);
  assert.equal(result.filled, 8);
  assert.equal(result.total, 8);
  assert.equal(result.percent, 100);
  assert.equal(result.turns, 3);
  assert.deepEqual(result.missing, []);
});

test("escalationProblems asks for at least three turns", () => {
  const problems = escalationProblems({ name: "thin", escalation: ["one thing"] });
  assert.ok(problems.some((problem) => problem.includes("Only 1 escalation turn")));
});

test("escalationProblems flags a resolution with no cost", () => {
  const problems = escalationProblems({ name: "x", escalation: PLAN.escalation, resolution: "it works out" });
  assert.ok(problems.some((problem) => problem.includes("no cost")));
});

test("escalationProblems is quiet about a well-shaped plan", () => {
  assert.deepEqual(escalationProblems(PLAN), []);
});

test("conflictMarkdown and conflictReport render the plan", () => {
  assert.ok(conflictMarkdown(PLAN).includes("# The ledger"));
  assert.ok(conflictMarkdown(PLAN).includes("1. Mara copies the key"));
  assert.ok(conflictReport(PLAN).includes("8/8 parts filled"));
});
