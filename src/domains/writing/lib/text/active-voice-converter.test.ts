import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADJECTIVAL_PARTICIPLES,
  PARTICIPLE_SIMPLE_PAST,
  convertPassive,
  findPassive,
} from "./active-voice-converter.ts";

const SAMPLE =
  "The report was written by Maya. The package was delivered by the courier. The budget has been approved by the board. The decision was made. The plan is reviewed by the committee. She was tired by noon.";

test("the participle table maps participles to a simple past", () => {
  assert.equal(PARTICIPLE_SIMPLE_PAST.written, "wrote");
  assert.equal(PARTICIPLE_SIMPLE_PAST.made, "made");
  assert.ok(ADJECTIVAL_PARTICIPLES.has("tired"));
});

test("past and perfect passives are recast with the named actor", () => {
  const findings = findPassive(SAMPLE);
  assert.equal(findings.length, 5);
  assert.equal(findings[0].active, "Maya wrote the report.");
  assert.equal(findings[0].verb, "written");
  assert.equal(findings[0].tense, "was");
  assert.equal(findings[1].active, "The courier delivered the package.");
  assert.equal(findings[2].active, "The board has approved the budget.");
});

test("an agentless passive is reported, never rewritten", () => {
  const findings = findPassive(SAMPLE);
  const agentless = findings.find((finding) => finding.source === "The decision was made.");
  assert.ok(agentless);
  assert.equal(agentless.active, null);
  assert.equal(agentless.agent, null);
  assert.match(agentless.reason ?? "", /No named actor/);
});

test("an unsupported tense is reported with a reason", () => {
  const findings = findPassive(SAMPLE);
  const present = findings.find((finding) => finding.verb === "reviewed");
  assert.ok(present);
  assert.equal(present.active, null);
  assert.equal(present.agent, "the committee");
  assert.equal(present.reason, 'Tense "is reviewed" is not covered; recast by hand.');
});

test("an adjectival participle is not treated as a passive", () => {
  assert.deepEqual(findPassive("She was tired by noon."), []);
});

test("a by-phrase that is a time is not an actor", () => {
  const findings = findPassive("The draft was finished by Friday.");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].agent, null);
  assert.equal(findings[0].active, null);
});

test("convertPassive rewrites only the convertible clauses", () => {
  const report = convertPassive(SAMPLE);
  assert.equal(report.converted, 3);
  assert.equal(report.agentless, 1);
  assert.equal(report.unconverted, 2);
  assert.equal(
    report.output,
    "Maya wrote the report. The courier delivered the package. The board has approved the budget. The decision was made. The plan is reviewed by the committee. She was tired by noon.",
  );
});

test("empty input reports nothing", () => {
  const report = convertPassive("");
  assert.deepEqual(report.findings, []);
  assert.equal(report.converted, 0);
  assert.equal(report.output, "");
});
