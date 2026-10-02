import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PAPER_TOTAL,
  PAPER_SECTIONS,
  planPaperSections,
} from "./paper-section-planner.ts";

const FULL = {
  question: "Does remote work change informal knowledge sharing?",
  method: "Survey of 412 employees across 9 firms.",
  contribution: "The first estimate of informal exchange frequency by working arrangement.",
  total: 6000,
};

test("the five sections and their shares are published", () => {
  assert.deepEqual(
    PAPER_SECTIONS.map((section) => section.id),
    ["introduction", "methods", "results", "discussion", "conclusion"],
  );
  const shares = PAPER_SECTIONS.reduce((sum, section) => sum + section.share, 0);
  assert.equal(Math.round(shares * 100), 100);
  assert.equal(DEFAULT_PAPER_TOTAL, 6000);
});

test("a 6000-word paper splits into the published targets", () => {
  const plan = planPaperSections(FULL);
  assert.equal(plan.total, 6000);
  assert.deepEqual(
    plan.sections.map((section) => section.targetWords),
    [900, 1200, 1800, 1800, 300],
  );
  assert.deepEqual(plan.sections.map((section) => section.note), [null, null, null, null, null]);
  assert.deepEqual(plan.checks, []);
  assert.match(plan.outline, /^Question: Does remote work change informal knowledge sharing\?/);
  assert.match(plan.outline, /Budget: 6000 words/);
});

test("the total defaults to 6000 when it is not supplied", () => {
  const plan = planPaperSections({ question: "Q?", method: "M.", contribution: "C." });
  assert.equal(plan.total, 6000);
});

test("a small budget flags the thin methods section and the missing statements", () => {
  const plan = planPaperSections({ total: 1500 });
  assert.deepEqual(
    plan.sections.map((section) => section.targetWords),
    [225, 300, 450, 450, 75],
  );
  assert.equal(plan.sections[1].note, "300 words of methods is thin for a repeatable study at this total.");
  assert.deepEqual(plan.checks, [
    "No research question: a paper plan starts from the question the study answers.",
    "No method: state the design in a line so the methods budget has something to describe.",
    "No contribution: say what the paper adds that the literature did not have.",
    "1500 words is short for a research article; sections may be squeezed.",
  ]);
});

test("a question that runs long is flagged", () => {
  const question = `${Array.from({ length: 41 }, (_, index) => `word${index + 1}`).join(" ")}?`;
  const plan = planPaperSections({ question, method: "M.", contribution: "C." });
  assert.ok(plan.checks.some((check) => check.includes("runs 41 words")));
});

test("a very long paper is flagged rather than silently split", () => {
  const plan = planPaperSections({ ...FULL, total: 20000 });
  assert.ok(plan.checks.some((check) => check.includes("check the venue's limit")));
});
