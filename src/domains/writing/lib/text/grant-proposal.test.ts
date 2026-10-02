import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_GRANT_LIMIT,
  GRANT_FRAMEWORKS,
  planGrantProposal,
} from "./grant-proposal.ts";

const SIGNIFICANCE = {
  significance: "Informal knowledge sharing matters for onboarding and mentoring.",
  innovation: "No prior study measures exchange frequency by arrangement.",
  approach: "We will survey 400 employees and interview 30 managers over nine months.",
  evaluation: "We will measure exchange frequency at three points and compare arrangements.",
  budget: "Two research assistants for nine months and survey incentives.",
};

test("the three frameworks are published", () => {
  assert.deepEqual(
    GRANT_FRAMEWORKS.map((framework) => framework.id),
    ["significance", "objectives", "generic"],
  );
  assert.equal(GRANT_FRAMEWORKS[0].sections[0].id, "significance");
  assert.equal(DEFAULT_GRANT_LIMIT, 2500);
});

test("a filled significance proposal reports only the length shortfall", () => {
  const plan = planGrantProposal(SIGNIFICANCE, { framework: "significance" });
  assert.equal(plan.words, 48);
  assert.equal(plan.limit, 2500);
  assert.equal(plan.framework, "Significance, Innovation, Approach");
  assert.deepEqual(plan.checks.map((check) => check.id), ["under-limit"]);
  assert.match(plan.output, /^Significance, Innovation, Approach — 48 of 2500 words/);
});

test("empty sections are named with their prompt", () => {
  const plan = planGrantProposal({}, { framework: "significance" });
  assert.deepEqual(
    plan.checks.map((check) => check.id),
    ["missing-significance", "missing-innovation", "missing-approach", "missing-evaluation", "missing-budget"],
  );
  assert.match(plan.checks[0].message, /Why this problem matters/);
  assert.match(plan.output, /\(to write\)/);
});

test("more than five objectives are flagged", () => {
  const plan = planGrantProposal(
    {
      objectives: "Improve things\nDo better\nHelp people\nSupport teams\nGrow the programme\nExpand reach",
    },
    { framework: "objectives", limit: 1000 },
  );
  const ids = plan.checks.map((check) => check.id);
  assert.ok(ids.includes("objectives-many"));
  assert.deepEqual(ids, [
    "missing-need",
    "missing-methods",
    "missing-timeline",
    "missing-evaluation",
    "missing-budget",
    "objectives-many",
    "under-limit",
  ]);
});

test("objectives with no measurable verb are flagged", () => {
  const plan = planGrantProposal({ objectives: "Do better\nHelp people" }, { framework: "objectives" });
  assert.ok(plan.checks.some((check) => check.id === "objectives-unmeasurable"));
});

test("an undated timeline is flagged", () => {
  const plan = planGrantProposal(
    { timeline: "First we recruit the team and then we run the pilot and write it up." },
    { framework: "objectives" },
  );
  assert.ok(plan.checks.some((check) => check.id === "timeline-undated"));
});

test("the generic framework is chosen by id and the first framework by default", () => {
  assert.equal(planGrantProposal({}, { framework: "generic" }).sections[0].id, "summary");
  assert.equal(planGrantProposal({}).framework, "Significance, Innovation, Approach");
});

test("a narrative over the limit is flagged", () => {
  const long = { significance: Array.from({ length: 60 }, (_, index) => `word${index + 1}`).join(" ") };
  const plan = planGrantProposal(long, { framework: "significance", limit: 50 });
  assert.ok(plan.checks.some((check) => check.id === "over-limit"));
});
