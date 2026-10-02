import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REPORT_SECTIONS,
  THIN_SECTION_WORDS,
  buildTechnicalReport,
} from "./technical-report.ts";

const FULL = {
  title: "Review of the onboarding pipeline",
  audience: "the operations board",
  scope:
    "This review covers the onboarding pipeline for the operations board and excludes contractor accounts.",
  background: "Onboarding times doubled after the migration.",
  findings: "Median time to first commit rose from 2 days to 5 days across the sample of 40 hires.",
  risks: "The sample covers one quarter only.",
  recommendations: "Reduce the number of manual approval steps, owner the platform team, by Q3.",
};

test("the seven sections are published in order", () => {
  assert.deepEqual(
    REPORT_SECTIONS.map((section) => section.id),
    ["summary", "scope", "background", "findings", "risks", "recommendations", "appendix"],
  );
  assert.equal(THIN_SECTION_WORDS, 10);
});

test("a filled report numbers its sections and keeps the front matter", () => {
  const draft = buildTechnicalReport(FULL);
  assert.equal(draft.words, 57);
  assert.deepEqual(draft.missing, ["Summary"]);
  assert.deepEqual(
    draft.checks.map((check) => check.id),
    ["required-summary", "thin-background", "thin-risks"],
  );
  assert.match(draft.output, /^Title: Review of the onboarding pipeline\nPrepared for: the operations board\n\n1\. Scope and audience/);
  assert.match(draft.output, /\n\nRevision history: \(add date, author and change\)$/);
});

test("a required section that is missing is named", () => {
  const draft = buildTechnicalReport({ title: "T", audience: "the team" });
  assert.deepEqual(draft.missing, [
    "Summary",
    "Scope and audience",
    "Findings",
    "Risks and limitations",
    "Recommendations",
  ]);
  assert.ok(draft.checks.some((check) => check.id === "required-findings"));
});

test("findings with no evidence markers are flagged", () => {
  const draft = buildTechnicalReport({
    ...FULL,
    findings: "Onboarding feels slower than it used to and everyone agrees about it.",
  });
  assert.ok(draft.checks.some((check) => check.id === "findings-no-evidence"));
});

test("recommendations with no owner or date are flagged", () => {
  const draft = buildTechnicalReport({
    ...FULL,
    recommendations: "The team should consider simplifying the approval steps at some point.",
  });
  assert.ok(draft.checks.some((check) => check.id === "recommendations-unowned"));
});

test("an audience that the scope never names is flagged", () => {
  const draft = buildTechnicalReport({ ...FULL, scope: "This review covers the pipeline." });
  assert.ok(draft.checks.some((check) => check.id === "scope-audience"));
});

test("recommendations without a risks section are flagged", () => {
  const draft = buildTechnicalReport({ ...FULL, risks: "" });
  assert.ok(draft.checks.some((check) => check.id === "risks-missing"));
});

test("an empty report names everything it needs", () => {
  const draft = buildTechnicalReport({});
  assert.equal(draft.words, 0);
  assert.equal(draft.missing.length, 5);
  assert.ok(draft.checks.some((check) => check.id === "title"));
  assert.match(draft.output, /^Title: \(untitled report\)/);
});
