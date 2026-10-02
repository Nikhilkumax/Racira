import { test } from "node:test";
import assert from "node:assert/strict";
import { ABBREVIATIONS, findAbbreviationMatches, toPlainLanguage } from "./technical-to-plain-language.ts";

const TECH =
  "The API call uses a CDN and the SLA covers latency. Our team will leverage the microservice to onboard new users. The performance of the implementation was unacceptable.";

test("the abbreviation table is uppercase and unique", () => {
  const seen = new Set<string>();
  for (const entry of ABBREVIATIONS) {
    assert.equal(entry.abbr, entry.abbr.toUpperCase());
    assert.ok(!seen.has(entry.abbr), `duplicate abbreviation ${entry.abbr}`);
    seen.add(entry.abbr);
    assert.ok(entry.expansion.length > 0);
  }
});

test("abbreviation matching is case-sensitive", () => {
  assert.deepEqual(findAbbreviationMatches("An api call and an API call.").map((entry) => entry.source), ["API"]);
  assert.deepEqual(findAbbreviationMatches(""), []);
});

test("toPlainLanguage expands acronyms and replaces jargon", () => {
  const report = toPlainLanguage(TECH);
  assert.equal(report.abbreviationCount, 3);
  assert.equal(report.sentences, 3);
  assert.equal(report.findings.length, 7);
  assert.equal(
    report.output,
    "The application programming interface call uses a content delivery network and the service commitment covers delay. Our team will use the small service to train new users. The performance of the implementation was unacceptable.",
  );
});

test("each finding carries the sentence it was found in", () => {
  const report = toPlainLanguage(TECH);
  const first = report.findings[0];
  assert.equal(first.source, "API");
  assert.equal(first.plain, "application programming interface");
  assert.equal(first.sentence, "The API call uses a CDN and the SLA covers latency.");
  assert.equal(first.sentenceWords, 11);
});

test("the report names the long words it did not touch", () => {
  const report = toPlainLanguage(TECH);
  assert.deepEqual(report.leftover, ["implementation", "unacceptable"]);
});

test("empty input converts nothing", () => {
  const report = toPlainLanguage("");
  assert.equal(report.output, "");
  assert.deepEqual(report.findings, []);
  assert.equal(report.abbreviationCount, 0);
  assert.deepEqual(report.leftover, []);
});
