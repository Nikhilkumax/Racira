/**
 * Unit tests for the apostrophe checks.
 *
 * The missing-apostrophe rule is the reason the tool exists, so it is tested
 * entry by entry on the forms that carry risk ("lets go" is a verb, "the dogs'
 * toys" is a correct plural possessive, "it's" must never be touched here).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  APOSTROPHE_RULES,
  MISSING_APOSTROPHE_FORMS,
  checkApostrophes,
  formatApostropheReport,
} from "./apostrophes.ts";

const count = (text: string, rule: string) => checkApostrophes(text).counts[rule] ?? 0;
const rules = (text: string) => checkApostrophes(text).findings.map((finding) => finding.rule);
const first = (text: string) => checkApostrophes(text).findings[0];

test("initialises every rule and publishes the closed list", () => {
  const result = checkApostrophes("A clean sentence.");
  assert.equal(result.findings.length, 0);
  assert.equal(Object.keys(result.counts).length, APOSTROPHE_RULES.length);
  assert.equal(result.listedForms, Object.keys(MISSING_APOSTROPHE_FORMS).length);
  assert.ok(result.listedForms >= 25, "the list is published in full on the tool page");
  for (const fix of Object.values(MISSING_APOSTROPHE_FORMS)) {
    assert.ok(fix.includes("'"), `${fix} carries an apostrophe`);
  }
});

test("finds contractions written without their apostrophe", () => {
  assert.equal(count("I dont know.", "missing-apostrophe"), 1);
  assert.equal(count("We arent ready.", "missing-apostrophe"), 1);
  assert.equal(count("She doesnt care.", "missing-apostrophe"), 1);
  assert.equal(count("Call me at 5 oclock.", "missing-apostrophe"), 1);
  assert.equal(first("I dont know.").suggestion, "don't");
  assert.equal(first("Call me at 5 oclock.").suggestion, "o'clock");
});

test("keeps the writer's capitalisation in the fix", () => {
  assert.equal(first("Dont do that.").suggestion, "Don't");
  assert.equal(first("Thats all.").suggestion, "That's");
});

test("uses the following word as evidence for forms that are words on their own", () => {
  assert.equal(first("Im going home.").suggestion, "I'm");
  assert.equal(first("Ive seen it.").suggestion, "I've");
  assert.equal(first("Lets you and me go.").suggestion, "Let's");
  assert.equal(first("Then lets you and me go.").suggestion, "let's");

  // "lets" is a verb and "im" is not followed by a verb phrase: leave both.
  assert.equal(count("She lets go of the rope.", "missing-apostrophe"), 0);
  assert.equal(count("The im is short.", "missing-apostrophe"), 0);

  // A subject before "lets" proves the ordinary verb even when the follower
  // words look like a request — the false positive this rule had to lose. A
  // clause opener (and, then, now) keeps the contraction reading.
  assert.equal(count("The plan lets you save.", "missing-apostrophe"), 0);
  assert.equal(count("The tool lets you export.", "missing-apostrophe"), 0);
  assert.equal(count("And lets not forget it.", "missing-apostrophe"), 1);
});

test("never touches correct contractions", () => {
  for (const clean of ["Don't worry.", "It's fine.", "We won't be late.", "He's here.", "The company's policy", "She's the one."]) {
    assert.equal(count(clean, "missing-apostrophe"), 0, clean);
  }
});

test("finds a possessive apostrophe on a plural subject", () => {
  const finding = first("The dog's are barking.");
  assert.equal(finding.rule, "plural-possessive");
  assert.equal(finding.suggestion, "dogs");
  assert.equal(count("The class's are full.", "plural-possessive"), 1);

  // A possessive before a participle or a noun is correct.
  assert.equal(count("The dog's barking woke me.", "plural-possessive"), 0);
  assert.equal(count("The dog's collar is red.", "plural-possessive"), 0);
});

test("never rewrites a plural possessive", () => {
  for (const clean of ["The dogs' toys are here.", "The students' results improved.", "Two weeks' notice is required."]) {
    assert.deepEqual(rules(clean), [], clean);
  }
});

test("finds an apostrophe in a decade", () => {
  assert.equal(first("The 1990's were loud.").suggestion, "1990s");
  assert.equal(first("Back in the 90's.").suggestion, "90s");
  assert.equal(count("The 1990s were loud.", "decade-apostrophe"), 0);
});

test("finds a stray apostrophe at the end of a word", () => {
  assert.equal(count("Wait for the dog' ", "stray-apostrophe"), 1);
  assert.equal(count("Wait for the dog'.", "stray-apostrophe"), 1);
  assert.equal(count("Wait for the dog.", "stray-apostrophe"), 0);
});

test("finds doubled apostrophes", () => {
  assert.equal(count("I don''t know.", "doubled-apostrophe"), 1);
  assert.equal(count("I don’'t know.", "doubled-apostrophe"), 1);
  assert.equal(count("I don't know.", "doubled-apostrophe"), 0);
  assert.equal(first("I don''t know.").suggestion, "'");
});

test("reports mixed straight and curly apostrophes once", () => {
  assert.equal(count("It’s a 'quote'.", "mixed-apostrophe-styles"), 1);
  assert.equal(count("It's a 'quote'.", "mixed-apostrophe-styles"), 0);
  assert.equal(count("It’s a ’quote’.", "mixed-apostrophe-styles"), 0);
});

test("stays silent about its/it's, which the homophone detector owns", () => {
  assert.deepEqual(rules("The dog lost it's collar."), []);
  assert.deepEqual(rules("Its been a long day."), []);
});

test("returns findings in document order", () => {
  const text = "I dont know if the 1990's were better.";
  assert.deepEqual(rules(text), ["missing-apostrophe", "decade-apostrophe"]);
  const findings = checkApostrophes(text).findings;
  assert.ok(findings[0].index < findings[1].index);
  assert.equal(text.slice(findings[0].index, findings[0].end), "dont");
});

test("formats a report for copying and downloading", () => {
  assert.match(
    formatApostropheReport(checkApostrophes("Clean text.")),
    /No apostrophe issues\. \d+ apostrophe-less spellings checked\./,
  );
  const report = formatApostropheReport(checkApostrophes("I dont know."));
  assert.match(report, /Apostrophe findings: 1/);
  assert.match(report, /Missing apostrophe in a contraction: “dont” is missing its apostrophe\. → don't/);
});
