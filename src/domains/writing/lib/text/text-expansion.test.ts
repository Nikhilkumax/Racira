/**
 * Unit tests for the expansion estimator.
 *
 * Every reference value is worked out by hand in the test: 8 characters at
 * x1.2 rounds to 10, at x1.35 rounds to 11, and the percentage beside it is
 * computed from those two numbers. Placeholder handling and the optional
 * budget are pinned the same way, because both change what the tool reports.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_EXPANSION_LOCALE,
  EXPANSION_LOCALES,
  MIN_RELIABLE_CHARS,
  estimateExpansion,
  estimateExpansionLine,
  findExpansionLocale,
  formatExpansionReport,
} from "./text-expansion.ts";

const german = findExpansionLocale("de-DE")!;
const french = findExpansionLocale("fr-FR")!;
const japanese = findExpansionLocale("ja-JP")!;
const chinese = findExpansionLocale("zh-CN")!;

test("estimateExpansionLine: German reference arithmetic", () => {
  const line = estimateExpansionLine("Settings", german);
  assert.equal(line.characters, 8);
  assert.equal(line.base, 8);
  assert.equal(line.placeholders, 0);
  assert.equal(line.lowChars, 10, "8 x 1.20 rounds to 10");
  assert.equal(line.highChars, 11, "8 x 1.35 rounds to 11");
  assert.equal(line.lowPercent, 25);
  assert.equal(line.highPercent, 37.5);
  // Eight characters is below the reliability floor, so the range is flagged
  // as a short-string estimate rather than presented as a firm number.
  assert.equal(line.tooShort, true);
  assert.equal(line.overflow, false);
});

test("estimateExpansionLine: a contracting target goes below the source", () => {
  const japaneseLine = estimateExpansionLine("Settings", japanese);
  assert.equal(japaneseLine.lowChars, 4, "8 x 0.50");
  assert.equal(japaneseLine.highChars, 6, "8 x 0.70 rounds to 6");
  assert.equal(japaneseLine.lowPercent, -50);
  assert.equal(japaneseLine.highPercent, -25);

  const chineseLine = estimateExpansionLine("Save changes", chinese);
  assert.equal(chineseLine.characters, 12);
  assert.equal(chineseLine.lowChars, 5, "12 x 0.40 = 4.8 rounds to 5");
  assert.equal(chineseLine.highChars, 7, "12 x 0.60 = 7.2 rounds to 7");
  assert.equal(chineseLine.lowPercent, -58.3);
  assert.equal(chineseLine.highPercent, -41.7);
});

test("estimateExpansionLine: placeholders are kept, not expanded", () => {
  const source = "Hello {name}, you have {{count}} new messages";
  const line = estimateExpansionLine(source, german);
  assert.equal(line.characters, 45);
  assert.equal(line.placeholders, 2, "{name} and {{count}}");
  assert.equal(line.base, 30, "15 placeholder characters are excluded");
  assert.equal(line.lowChars, 51, "30 x 1.20 = 36, plus the 15 placeholder characters");
  assert.equal(line.highChars, 56, "30 x 1.35 = 40.5 rounds to 41, plus 15");
});

test("estimateExpansionLine: budget turns the high estimate into an overflow flag", () => {
  assert.equal(estimateExpansionLine("Settings", german, 10).overflow, true, "high estimate is 11");
  assert.equal(estimateExpansionLine("Settings", german, 11).overflow, false);
  assert.equal(estimateExpansionLine("Settings", german, 0).overflow, false, "no budget, no flag");
});

test("estimateExpansionLine: short strings are flagged, not trusted", () => {
  const line = estimateExpansionLine("OK", french);
  assert.equal(line.characters, 2);
  assert.equal(line.tooShort, true);
  assert.ok(MIN_RELIABLE_CHARS >= 8);
  assert.equal(estimateExpansionLine("A".repeat(MIN_RELIABLE_CHARS), french).tooShort, false);
});

test("estimateExpansion: totals sum the per-line estimates", () => {
  const estimate = estimateExpansion("Settings\nSave", german);
  assert.equal(estimate.lines.length, 2);
  assert.equal(estimate.total.characters, 12);
  assert.equal(estimate.total.lowChars, 15, "10 + 5");
  assert.equal(estimate.total.highChars, 16, "11 + 5");
  assert.equal(estimate.total.lowPercent, 25);
  assert.equal(estimate.total.highPercent, 33.3);
  assert.equal(estimate.overflowLines, 0);
});

test("estimateExpansion: multiple lines, blanks skipped, flags counted", () => {
  const estimate = estimateExpansion("Settings\n\nSave\nOK", german, 10);
  assert.equal(estimate.lines.length, 3, "the blank line is skipped");
  assert.equal(estimate.tooShortLines, 3, "every line here is shorter than the 10-character floor");
  assert.equal(estimate.overflowLines, 1, "only Settings (11) exceeds a budget of 10");
  assert.equal(estimate.budget, 10);

  const empty = estimateExpansion("", german);
  assert.equal(empty.lines.length, 0);
  assert.equal(empty.total.characters, 0);
  assert.equal(empty.total.lowChars, 0);
  assert.equal(empty.total.lowPercent, 0);
});

test("every locale produces finite estimates on a sample", () => {
  for (const locale of EXPANSION_LOCALES) {
    const line = estimateExpansionLine("Save and continue", locale);
    assert.ok(Number.isFinite(line.lowChars));
    assert.ok(Number.isFinite(line.highChars));
    assert.ok(line.lowChars >= 0 && line.highChars >= line.lowChars);
    assert.ok(locale.note.length > 20, `${locale.id} explains itself`);
  }
});

test("EXPANSION_LOCALES: ids are unique, ranges are ordered and positive", () => {
  assert.equal(EXPANSION_LOCALES.length, 17);
  const ids = EXPANSION_LOCALES.map((locale) => locale.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("ja-JP") && ids.includes("de-DE") && ids.includes("tr-TR"));
  assert.ok(findExpansionLocale("xx-XX") === undefined);
  assert.ok(findExpansionLocale(DEFAULT_EXPANSION_LOCALE));
  for (const locale of EXPANSION_LOCALES) {
    assert.ok(locale.low > 0 && locale.high > 0, `${locale.id} ranges are positive`);
    assert.ok(locale.low <= locale.high, `${locale.id} low <= high`);
    assert.ok(locale.label.includes(locale.language), `${locale.id} label names the language`);
  }
  // Contracting versus expanding targets must actually point in both directions.
  assert.ok(EXPANSION_LOCALES.some((locale) => locale.low > 1));
  assert.ok(EXPANSION_LOCALES.some((locale) => locale.high < 1));
});

test("formatExpansionReport: states the range, the lines and the disclaimer", () => {
  const estimate = estimateExpansion("Settings\nSave", german, 10);
  const report = formatExpansionReport(estimate);
  assert.ok(report.includes("German (Germany)"));
  assert.ok(report.includes("x1.20 to x1.35"));
  assert.ok(report.includes("Estimate: 15 to 16 characters"));
  assert.ok(report.includes("not a translation"));
  assert.ok(report.includes("Settings"));
});
