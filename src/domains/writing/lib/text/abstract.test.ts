import { test } from "node:test";
import assert from "node:assert/strict";
import { ABSTRACT_SECTIONS, DEFAULT_ABSTRACT_RANGE, buildAbstract } from "./abstract.ts";

const FULL = {
  background: "Remote work has grown quickly since 2020.",
  objective: "We examined whether remote work changes how teams share informal knowledge.",
  methods: "We surveyed 412 employees across 9 firms and compared teams with fully remote and hybrid arrangements.",
  results: "Fully remote teams reported 31 percent fewer informal exchanges per week than hybrid teams.",
  conclusions:
    "Remote work appears to reduce informal knowledge sharing substantially, which has practical consequences for onboarding, mentoring and the maintenance of shared context across a distributed organisation.",
};

test("the five parts and the default band are published", () => {
  assert.deepEqual(
    ABSTRACT_SECTIONS.map((section) => section.id),
    ["background", "objective", "methods", "results", "conclusions"],
  );
  assert.deepEqual(DEFAULT_ABSTRACT_RANGE, { min: 150, max: 250 });
});

test("buildAbstract labels the parts in order and counts the words", () => {
  const draft = buildAbstract(FULL);
  assert.equal(draft.words, 74);
  assert.equal(draft.structured, true);
  assert.equal(draft.sections[3].words, 14);
  assert.ok(draft.output.startsWith("Background: Remote work has grown quickly since 2020."));
  assert.ok(draft.output.includes("\nMethods: We surveyed 412 employees"));
  assert.deepEqual(
    draft.checks.map((check) => check.id),
    ["conclusion-long", "short"],
  );
});

test("the unstructured shape drops the labels", () => {
  const draft = buildAbstract(FULL, { structured: false });
  assert.equal(draft.structured, false);
  assert.ok(draft.output.startsWith("Remote work has grown quickly since 2020. We examined"));
  assert.ok(!draft.output.includes("Background:"));
});

test("each missing part is named", () => {
  const draft = buildAbstract({ objective: "Test.", methods: "Short survey.", results: "No numbers here.", conclusions: "Lots." }, { structured: false });
  assert.deepEqual(
    draft.checks.map((check) => check.id),
    ["missing-background", "methods-short", "results-no-figures", "short"],
  );
});

test("a custom band changes the length check", () => {
  const draft = buildAbstract(FULL, { min: 50, max: 100 });
  assert.deepEqual(draft.checks.map((check) => check.id), ["conclusion-long"]);
  assert.deepEqual(draft.range, { min: 50, max: 100 });
});

test("an empty abstract is reported rather than counted", () => {
  const draft = buildAbstract({});
  assert.equal(draft.words, 0);
  assert.equal(draft.output, "");
  assert.ok(draft.checks.some((check) => check.id === "empty"));
  assert.equal(draft.checks.filter((check) => check.id.startsWith("missing-")).length, 5);
});
