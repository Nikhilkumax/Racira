/**
 * Unit tests for the proper-noun engine.
 *
 * The claims worth pinning: the day and month names come from Intl (not from a
 * hand-typed list), ordinary words that happen to be names (Turkey, May, Polish)
 * are never flagged on their own, capitalised words at the start of a sentence
 * never count as evidence, and the consistency rule needs both forms mid-sentence
 * before it says anything.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AMBIGUOUS_PROPER_NOUNS,
  CONTINENTS,
  COUNTRIES,
  DAYS,
  MONTHS,
  PROPER_NOUN_COUNT,
  findProperNounIssues,
  formatProperNounReport,
} from "./proper-nouns.ts";

const suggestions = (text: string) => findProperNounIssues(text).findings.map((finding) => `${finding.found}=>${finding.suggestion}`);

test("reads the weekday and month names from Intl", () => {
  assert.equal(MONTHS.length, 12);
  assert.equal(MONTHS[0], "January");
  assert.equal(MONTHS[11], "December");
  assert.equal(DAYS.length, 7);
  assert.deepEqual(DAYS, ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
});

test("publishes a curated lexicon with its size", () => {
  assert.ok(PROPER_NOUN_COUNT > 200, `lexicon holds ${PROPER_NOUN_COUNT} names`);
  assert.ok(CONTINENTS.includes("Europe"));
  assert.ok(COUNTRIES.includes("United Kingdom"));
  assert.ok(COUNTRIES.includes("Costa Rica"));
  assert.ok(AMBIGUOUS_PROPER_NOUNS.includes("Turkey"));
  assert.ok(AMBIGUOUS_PROPER_NOUNS.includes("May"));
});

test("flags a documented name written in lower case", () => {
  assert.deepEqual(suggestions("We met in france last year."), ["france=>France"]);
  assert.deepEqual(suggestions("She speaks japanese."), ["japanese=>Japanese"]);
  assert.deepEqual(suggestions("It happened on monday."), ["monday=>Monday"]);
  assert.deepEqual(suggestions("We travelled in december."), ["december=>December"]);
  assert.deepEqual(suggestions("He was born in the united kingdom."), ["united kingdom=>United Kingdom"]);
  assert.deepEqual(suggestions("They flew to new zealand."), ["new zealand=>New Zealand"]);
});

test("names the kind of the entry it corrected", () => {
  const [finding] = findProperNounIssues("We met in france.").findings;
  assert.equal(finding.kind, "case");
  assert.match(finding.note, /France is a country name/);
});

test("leaves names that are ordinary words alone", () => {
  for (const clean of [
    "The turkey was dry.",
    "I may go now.",
    "The earth is round.",
    "We polish the table.",
    "It was a march to remember.",
    "They ate chile in china.",
    "She wrote a danish recipe down.",
  ]) {
    assert.deepEqual(suggestions(clean), [], clean);
  }
});

test("accepts correctly capitalised names", () => {
  assert.deepEqual(suggestions("We met in France on Monday in December."), []);
  assert.deepEqual(suggestions("Japanese and Turkish are both languages."), []);
});

test("reports a name the document spells two ways", () => {
  const result = findProperNounIssues("We love Racira. Everyone loves racira too.");
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].kind, "inconsistent");
  assert.equal(result.findings[0].found, "racira");
  assert.equal(result.findings[0].suggestion, "Racira");
});

test("needs both forms mid-sentence before calling anything inconsistent", () => {
  // "Spring" only appears at the start of a sentence, so it is not evidence.
  assert.deepEqual(suggestions("Spring is here. The spring is nice."), []);
  assert.deepEqual(suggestions("We use Figma daily."), []);
});

test("lists capitalised words it cannot verify instead of correcting them", () => {
  const result = findProperNounIssues("We use Kubernetes and Figma daily.");
  assert.deepEqual(result.findings, []);
  assert.deepEqual(
    result.unverified.map((entry) => entry.word).sort(),
    ["Figma", "Kubernetes"],
  );
});

test("counts words that fall inside the documented lists", () => {
  const result = findProperNounIssues("France and Japan and Monday and Europe.");
  assert.equal(result.tokensChecked, 4);
  assert.equal(result.lexicon, PROPER_NOUN_COUNT);
});

test("returns findings in document order and points at the word", () => {
  const text = "We met in france and later in japan? no, in germany.";
  const result = findProperNounIssues(text);
  assert.deepEqual(
    result.findings.map((finding) => finding.found),
    ["france", "germany"], // japan is ambiguous, so it is not reported
  );
  assert.ok(result.findings[0].index < result.findings[1].index);
  assert.equal(text.slice(result.findings[0].index, result.findings[0].end), "france");
});

test("formats a report for copying and downloading", () => {
  assert.match(formatProperNounReport(findProperNounIssues("France is fine.")), /No documented name issues\. \d+ names checked\./);
  const report = formatProperNounReport(findProperNounIssues("We met in france."));
  assert.match(report, /Name findings: 1/);
  assert.match(report, /france → France {2}\(case\)/);
});
