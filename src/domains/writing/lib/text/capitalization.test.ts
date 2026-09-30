/**
 * Unit tests for the capitalisation checks.
 *
 * Worth pinning: the sentence rule sees the error itself (a lower-case word
 * after a terminator) without tripping on abbreviations or initials, the pronoun
 * rule stays out of "i.e.", the acronym allowlist covers the everyday ones, and
 * brand names are never rewritten.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPITALIZATION_RULES, checkCapitalization, formatCapitalizationReport } from "./capitalization.ts";

const count = (text: string, rule: string) => checkCapitalization(text).counts[rule] ?? 0;
const findings = (text: string) => checkCapitalization(text).findings.map((f) => `${f.rule}:${f.suggestion}`);

test("initialises a count for every published rule", () => {
  const result = checkCapitalization("A clean sentence.");
  assert.equal(result.findings.length, 0);
  assert.equal(Object.keys(result.counts).length, CAPITALIZATION_RULES.length);
  assert.equal(result.namesChecked, 81);
});

test("finds a lower-case sentence start after a terminator", () => {
  assert.equal(count("This is fine. and so is this.", "sentence-start"), 1);
  assert.equal(count("This is fine. And so is this.", "sentence-start"), 0);
  assert.equal(count("Really? yes really.", "sentence-start"), 1);
  assert.deepEqual(findings("This is fine. and so is this."), ["sentence-start:And"]);
});

test("finds a lower-case start of a line and of the text", () => {
  assert.equal(count("we met yesterday.", "sentence-start"), 1);
  assert.equal(count("First line\nsecond line here", "sentence-start"), 1);
});

test("does not mistake abbreviations or initials for sentence ends", () => {
  assert.equal(count("Use e.g. this one.", "sentence-start"), 0);
  assert.equal(count("It costs $5, i.e. five dollars.", "sentence-start"), 0);
  assert.equal(count("J.K. rowling wrote it.", "sentence-start"), 0);
  assert.equal(count("Dr. smith arrived.", "sentence-start"), 0);
});

test("leaves a deliberate lower-case start after an ellipsis alone", () => {
  assert.equal(count("Wait... what was that?", "sentence-start"), 0);
});

test("finds a lower-case pronoun i, including its contractions", () => {
  assert.equal(count("i think so.", "standalone-i"), 1);
  assert.equal(count("i'm sure.", "standalone-i"), 1);
  assert.deepEqual(findings("i'm sure."), ["standalone-i:I'm"]);
  assert.equal(count("I think so.", "standalone-i"), 0);
  assert.equal(count("Use i.e. this one.", "standalone-i"), 0);
});

test("finds lower-case day, month, language and nationality names", () => {
  assert.equal(count("It happened on monday.", "name-lowercase"), 1);
  assert.equal(count("We travelled in december.", "name-lowercase"), 1);
  assert.equal(count("She speaks spanish.", "name-lowercase"), 1);
  assert.equal(count("He is american.", "name-lowercase"), 1);
  assert.deepEqual(findings("We travelled in december."), ["name-lowercase:December"]);
  assert.equal(count("We travelled in December.", "name-lowercase"), 0);
});

test("leaves country and place names to the proper-noun checker", () => {
  // The split is deliberate: countries, continents and planets are the
  // proper-noun tool's list, which also looks for inconsistent spellings.
  assert.equal(count("We met in france.", "name-lowercase"), 0);
  assert.equal(count("We met in europe.", "name-lowercase"), 0);
});

test("stays quiet about names that are ordinary words", () => {
  assert.equal(count("I may go in march.", "name-lowercase"), 0);
  assert.equal(count("We polish the table.", "name-lowercase"), 0);
  assert.equal(count("It was an august evening.", "name-lowercase"), 0);
});

test("reports all-caps words but accepts the usual acronyms", () => {
  assert.equal(count("This is VERY important.", "all-caps-word"), 1);
  assert.equal(count("We used XYZ and ABC.", "all-caps-word"), 2);
  for (const acronym of ["API", "URL", "JSON", "PDF", "SEO", "CEO", "USA", "UK", "FAQ", "GPS"]) {
    assert.equal(count(`The ${acronym} is fine.`, "all-caps-word"), 0, acronym);
  }
});

test("finds a capital inside a word", () => {
  assert.equal(count("It is tHe best.", "mixed-inner-case"), 1);
  assert.equal(count("This was wOrd.", "mixed-inner-case"), 1);
  assert.deepEqual(findings("It is tHe best."), ["mixed-inner-case:the"]);
  assert.equal(count("This is fine.", "mixed-inner-case"), 0);
});

test("never rewrites a brand name", () => {
  for (const brand of ["iPhone", "iPad", "macOS", "YouTube", "GitHub", "JavaScript", "eBay", "TikTok"]) {
    assert.equal(count(`The ${brand} app works.`, "mixed-inner-case"), 0, brand);
  }
});

test("returns findings in document order", () => {
  const text = "we met in december on monday.";
  const result = checkCapitalization(text);
  assert.deepEqual(
    result.findings.map((finding) => finding.rule),
    ["sentence-start", "name-lowercase", "name-lowercase"],
  );
  const indices = result.findings.map((finding) => finding.index);
  assert.deepEqual([...indices].sort((a, b) => a - b), indices);
});

test("formats a report for copying and downloading", () => {
  assert.match(formatCapitalizationReport(checkCapitalization("Clean text.")), /No capitalisation issues\./);
  const report = formatCapitalizationReport(checkCapitalization("we met yesterday."));
  assert.match(report, /Capitalisation findings: 1/);
  assert.match(report, /Sentence starts lower-case: .* → We/);
});
