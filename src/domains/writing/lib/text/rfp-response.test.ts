import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRfpResponse, responseWords } from "./rfp-response.ts";

const FULL = {
  rfp: "Council digital services tender 2026",
  deadline: "2030-03-01",
  requirements: [
    "Accessibility audit | Approach, section 2",
    "Data migration | Past performance, section 4",
    "Training for 40 staff |",
    "Accessibility audit | Approach, section 2",
  ].join("\n"),
  understanding: "The council needs its services to pass an accessibility audit before the new financial year.",
  approach: "We audit, fix and retest in four weeks, with a named lead for each service.",
  team: "Two auditors with public-sector engagements and one migration engineer.",
  past: "Twelve council migrations since 2021, all delivered inside the audit window.",
  pricing: "Fixed price of 48,000 for the full scope, quoted against this matrix.",
};

test("the matrix pairs answers with requirements and counts the gaps", () => {
  const response = buildRfpResponse(FULL, { today: "2026-10-02" });
  assert.deepEqual(response.counts, { total: 4, answered: 3, gaps: 1 });
  assert.equal(response.deadlinePassed, false);
  assert.deepEqual(response.checks, [
    "1 requirement has no answer (R3); every gap is a point an evaluator cannot award.",
    "Duplicate requirement wording (accessibility audit); merge the pair or the matrix looks padded.",
  ]);
  assert.match(response.matrix, /^R1\. Accessibility audit — ANSWERED: Approach, section 2/m);
  assert.match(response.matrix, /^R3\. Training for 40 staff — GAP: no answer written/m);
  assert.match(response.response, /Understanding of the need\n/);
});

test("a version of the response counts only the sections it is given", () => {
  assert.equal(responseWords({ understanding: "One two three" }), 3);
  assert.equal(responseWords({}), 0);
});

test("a passed deadline is reported", () => {
  const response = buildRfpResponse(
    { rfp: "Tender", deadline: "2020-01-01", requirements: "One thing | Answer text" },
    { today: "2026-10-02" },
  );
  assert.equal(response.deadlinePassed, true);
  assert.equal(response.checks[0], "The deadline (2020-01-01) has passed.");
  assert.equal(response.checks.length, 6);
});

test("an empty response names the missing scaffold", () => {
  const response = buildRfpResponse();
  assert.deepEqual(response.counts, { total: 0, answered: 0, gaps: 0 });
  assert.ok(response.checks.includes("No requirements listed. Paste one per line as requirement | where it is answered."));
  assert.ok(response.checks.includes("No deadline; submissions are lost to dates more often than to quality."));
  assert.equal(response.checks.length, 8);
});
