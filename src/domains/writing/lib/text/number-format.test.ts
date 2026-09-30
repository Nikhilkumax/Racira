/**
 * Unit tests for the number-format analyser. Each case is a hand-written string
 * whose punctuation is unambiguous to a human reader, plus the two genuinely
 * ambiguous patterns ("1.500", "12,34,567") that the engine is expected to flag
 * rather than silently resolve.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectNumberFormatIssues,
  normalizeNumbers,
  parseNumbers,
  parseNumberToken,
} from "./number-format.ts";

test("parseNumberToken: US style groups with commas and dots the decimal", () => {
  const parsed = parseNumberToken("1,234.56");
  assert.equal(parsed.value, 1234.56);
  assert.equal(parsed.decimalSeparator, ".");
  assert.equal(parsed.thousandsSeparator, ",");
  assert.equal(parsed.style, "us");
  assert.equal(parsed.decimalDigits, 2);
  assert.equal(parsed.ambiguous, false);
  assert.equal(parsed.irregularGrouping, false);
});

test("parseNumberToken: European style swaps the roles", () => {
  const parsed = parseNumberToken("1.234,56");
  assert.equal(parsed.value, 1234.56);
  assert.equal(parsed.decimalSeparator, ",");
  assert.equal(parsed.thousandsSeparator, ".");
  assert.equal(parsed.style, "eu");
  assert.equal(parsed.decimalDigits, 2);
});

test("parseNumberToken: plain values and short decimals", () => {
  assert.equal(parseNumberToken("12").value, 12);
  assert.equal(parseNumberToken("12").style, "none");
  assert.equal(parseNumberToken("7,5").value, 7.5);
  assert.equal(parseNumberToken("7.5").value, 7.5);
  assert.equal(parseNumberToken("0.5").value, 0.5);
  assert.equal(parseNumberToken("-1,5").value, -1.5);
});

test("parseNumberToken: '1.500' is ambiguous and resolves as grouping", () => {
  const parsed = parseNumberToken("1.500");
  assert.equal(parsed.ambiguous, true);
  assert.equal(parsed.value, 1500);
  assert.equal(parsed.thousandsSeparator, ".");
});

test("parseNumberToken: Indian grouping is flagged, digits still readable", () => {
  const parsed = parseNumberToken("1,23,456");
  assert.equal(parsed.irregularGrouping, true);
  assert.equal(parsed.value, 123456);
});

test("parseNumbers: finds currency, percent and unit-bearing numbers", () => {
  const numbers = parseNumbers("Pay $1,234.50 by 2026.");
  assert.equal(numbers.length, 2);
  assert.equal(numbers[0].raw, "$1,234.50");
  assert.equal(numbers[0].currency, "$");
  assert.equal(numbers[0].value, 1234.5);
  assert.equal(numbers[1].raw, "2026");
  assert.equal(numbers[1].currency, null);
});

test("detectNumberFormatIssues: clean document reports nothing", () => {
  const { findings } = detectNumberFormatIssues("Total 1,234.56 shipped on 3 May 2026.");
  assert.deepEqual(findings, []);
});

test("detectNumberFormatIssues: mixed grouping separators", () => {
  const { findings } = detectNumberFormatIssues("Total 1,234.56 and 5.000 units");
  const kinds = findings.map((finding) => finding.kind);
  assert.ok(kinds.includes("mixed-grouping"));
  assert.ok(kinds.includes("ambiguous-separator"));
});

test("detectNumberFormatIssues: mixed decimal separators", () => {
  const { findings } = detectNumberFormatIssues("It grew 1.5x, then 2,5x");
  assert.ok(findings.some((finding) => finding.kind === "mixed-decimal"));
});

test("detectNumberFormatIssues: percent spacing", () => {
  const { findings } = detectNumberFormatIssues("50% off, then another 25 % off");
  assert.ok(findings.some((finding) => finding.kind === "percent-spacing"));
  const clean = detectNumberFormatIssues("50% off, then another 25% off");
  assert.ok(!clean.findings.some((finding) => finding.kind === "percent-spacing"));
});

test("detectNumberFormatIssues: unit spacing", () => {
  const { findings } = detectNumberFormatIssues("Use 5kg of flour, or 10 kg for a big batch.");
  assert.ok(findings.some((finding) => finding.kind === "unit-spacing"));
});

test("detectNumberFormatIssues: ungrouped large numbers", () => {
  const { findings } = detectNumberFormatIssues("Population 38000000 in 2026.");
  assert.ok(findings.some((finding) => finding.kind === "ungrouped-large-number"));
});

test("detectNumberFormatIssues: range dashes and currency placement", () => {
  const ranges = detectNumberFormatIssues("pages 5-10, lines 20\u201330");
  assert.ok(ranges.findings.some((finding) => finding.kind === "range-dash"));

  const currency = detectNumberFormatIssues("Costs $10 or 20\u00a0€");
  assert.ok(currency.findings.some((finding) => finding.kind === "currency-placement"));
  assert.ok(currency.findings.some((finding) => finding.kind === "mixed-currency"));
});

test("normalizeNumbers: rewrites punctuation, keeps currency/sign/unit", () => {
  assert.equal(normalizeNumbers("1.234,56 and 7,5", "us"), "1,234.56 and 7.5");
  assert.equal(normalizeNumbers("1,234.56 and 7.5", "eu"), "1.234,56 and 7,5");
  assert.equal(normalizeNumbers("$1.234,50", "us"), "$1,234.50");
  assert.equal(normalizeNumbers("$1,234.50", "eu"), "$1.234,50");
  assert.equal(normalizeNumbers("5.000,5 kg", "us"), "5,000.5 kg");
  assert.equal(normalizeNumbers("38000000 people", "us"), "38,000,000 people");
  assert.equal(normalizeNumbers("38000000 people", "si"), "38\u202f000\u202f000 people");
  assert.equal(normalizeNumbers("no numbers here", "us"), "no numbers here");
});

test("normalizeNumbers: leaves surrounding text untouched", () => {
  const input = "In 2026 the total was 1.234,56 euros.";
  assert.equal(normalizeNumbers(input, "us"), "In 2026 the total was 1,234.56 euros.");
  // Four-digit numbers the author left ungrouped are not rewritten: regrouping
  // a year would change what the sentence says.
  assert.equal(normalizeNumbers("In 2026 revenue was 12500.", "us"), "In 2026 revenue was 12,500.");
  assert.equal(normalizeNumbers("Chapters 1000-2026", "us"), "Chapters 1000-2026");
});
