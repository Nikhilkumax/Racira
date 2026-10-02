import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ABSTRACT_ROLES,
  DEFAULT_SCIENTIFIC_RANGE,
  buildScientificAbstract,
} from "./scientific-abstract.ts";

const FULL = {
  context: "Remote work has grown quickly since 2020.",
  gap: "It remains unclear whether remote work changes informal knowledge sharing.",
  approach: "We surveyed 412 employees across 9 firms.",
  results: "Fully remote teams reported 31 percent fewer informal exchanges per week.",
  implication: "These findings suggest that distributed teams should protect informal contact deliberately.",
};

test("the five roles and the default band are published", () => {
  assert.deepEqual(
    ABSTRACT_ROLES.map((role) => role.id),
    ["context", "gap", "approach", "results", "implication"],
  );
  assert.deepEqual(DEFAULT_SCIENTIFIC_RANGE, { min: 200, max: 300 });
});

test("a well-formed abstract produces both shapes and only the band check", () => {
  const draft = buildScientificAbstract(FULL);
  assert.equal(draft.words, 46);
  assert.deepEqual(draft.checks.map((check) => check.id), ["band"]);
  assert.equal(
    draft.output,
    "Context: Remote work has grown quickly since 2020.\nGap: It remains unclear whether remote work changes informal knowledge sharing.\nApproach: We surveyed 412 employees across 9 firms.\nKey results: Fully remote teams reported 31 percent fewer informal exchanges per week.\nImplication: These findings suggest that distributed teams should protect informal contact deliberately.",
  );
  assert.equal(
    draft.continuous,
    "Remote work has grown quickly since 2020. It remains unclear whether remote work changes informal knowledge sharing. We surveyed 412 employees across 9 firms. Fully remote teams reported 31 percent fewer informal exchanges per week. These findings suggest that distributed teams should protect informal contact deliberately.",
  );
});

test("a custom band removes the length check", () => {
  const draft = buildScientificAbstract(FULL, { min: 40, max: 60 });
  assert.deepEqual(draft.checks, []);
});

test("each role is checked for what it has to contain", () => {
  const draft = buildScientificAbstract({
    context: "Remote work has grown quickly since 2020.",
    gap: "We did something interesting.",
    approach: "Something happened.",
    results: "It appears to work.",
    implication: "It is important.",
  });
  assert.deepEqual(
    draft.checks.map((check) => check.id),
    [
      "gap-unmarked",
      "approach-unmarked",
      "results-no-figures",
      "results-hedged",
      "implication-unmarked",
      "band",
    ],
  );
  assert.equal(draft.checks[0].role, "Gap");
});

test("too many acronyms are named", () => {
  const draft = buildScientificAbstract({
    ...FULL,
    context: "The API and the SLA and the CDN and the KPI matter.",
  });
  const acronyms = draft.checks.find((check) => check.id === "acronyms");
  assert.ok(acronyms);
  assert.match(acronyms.message, /4 acronyms appear \(API, SLA, CDN, KPI\)/);
});

test("a citation inside the abstract is flagged", () => {
  const draft = buildScientificAbstract({ ...FULL, context: "This was shown before (Smith, 2020)." });
  assert.ok(draft.checks.some((check) => check.id === "citations"));
});

test("empty input names every missing role", () => {
  const draft = buildScientificAbstract({});
  assert.equal(draft.words, 0);
  assert.equal(draft.output, "");
  assert.equal(draft.checks.filter((check) => check.id.startsWith("missing-")).length, 5);
  assert.ok(draft.checks.some((check) => check.id === "empty"));
});
