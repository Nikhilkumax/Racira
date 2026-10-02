import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCaseStudy, parseResults } from "./case-study.ts";

const FULL = {
  client: "Acme Analytics",
  sector: "B2B software",
  challenge: "First-response time doubled in six months.",
  approach: ["Interviewed the support agents", "Rebuilt the triage rules", "Trained the team on the new queue"],
  results: ["First-response time | down 40%", "Ticket backlog | 620 to 90"],
  quote: "We stopped guessing which ticket mattered most. — Priya Raman, Support Lead",
};

test("buildCaseStudy assembles the challenge, approach, results and quote", () => {
  const draft = buildCaseStudy(FULL);
  assert.equal(draft.words, 53);
  assert.equal(draft.results.length, 2);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.study.startsWith("Case study: Acme Analytics (B2B software)"));
  assert.ok(draft.study.includes("Approach\n1. Interviewed the support agents"));
  assert.ok(draft.study.includes("Results\n- First-response time: down 40%\n- Ticket backlog: 620 to 90"));
  assert.ok(draft.study.endsWith("We stopped guessing which ticket mattered most. — Priya Raman, Support Lead"));
});

test("parseResults requires a figure for a quantified result", () => {
  const results = parseResults(["Backlog | unchanged", "Response time | down 40%"]);
  assert.equal(results[0].quantified, false);
  assert.equal(results[1].quantified, true);
});

test("buildCaseStudy flags the missing pieces of a thin study", () => {
  const draft = buildCaseStudy({ client: "", sector: "", challenge: "", approach: [], results: ["Backlog | unchanged"], quote: "" });
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), [
    "approach",
    "challenge",
    "client",
    "quote",
    "result-figure",
    "results-few",
  ]);
});

test("buildCaseStudy asks for results when there are none and caps a dashboard", () => {
  const none = buildCaseStudy({ ...FULL, results: [] });
  assert.ok(none.checks.some((check) => check.id === "results"));
  const many = buildCaseStudy({
    ...FULL,
    results: Array.from({ length: 7 }, (_, index) => `Metric ${index + 1} | ${index + 1}%`),
  });
  assert.ok(many.checks.some((check) => check.id === "results-many"));
});
