/**
 * Unit tests for the style-consistency engine.
 *
 * Each of the eight families gets a known positive, a count check and a
 * near-miss that must not be counted: apostrophes are not quotation marks,
 * a device hyphen run is not a dash, "3%" and "3.5" are not number-style
 * evidence, a numbered list is not a heading, and a numeric date with no part
 * above 12 is ambiguous rather than being forced into an order.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLE_FAMILIES, analyzeStyleConsistency, formatStyleConsistencyReport } from "./style-consistency.ts";

const family = (text: string, id: string) => {
  const result = analyzeStyleConsistency(text);
  const found = result.families.find((entry) => entry.id === id);
  assert.ok(found, `family ${id} exists`);
  return found;
};

const counts = (text: string, id: string) =>
  Object.fromEntries(family(text, id).counts.map((count) => [count.variant, count.count]));

test("STYLE_FAMILIES: eight documented families with unique ids and published methods", () => {
  assert.equal(STYLE_FAMILIES.length, 8);
  const ids = STYLE_FAMILIES.map((entry) => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of STYLE_FAMILIES) {
    assert.ok(entry.label.length > 3);
    assert.ok(entry.method.length > 20, `${entry.id} publishes its method`);
  }
});

test("quote-marks: straight marks counted, apostrophes and curly marks kept apart", () => {
  assert.deepEqual(counts('He said "yes" and "no".', "quote-marks"), { straight: 4 });
  assert.deepEqual(counts("He said \u201cyes\u201d and \u201cno\u201d.", "quote-marks"), { curly: 4 });
  // A possessive apostrophe is not a double quotation mark.
  assert.deepEqual(counts("The team's result is don't-care.", "quote-marks"), {});
  const mixed = family('He said "yes" then \u201cno\u201d.', "quote-marks");
  assert.equal(mixed.mixed, true);
  assert.equal(mixed.dominant, null, "a 2-2 tie has no dominant convention");
});

test("dash-style: the four dash habits are counted separately", () => {
  assert.deepEqual(counts("Alpha\u2014beta and gamma\u2013delta.", "dash-style"), { em: 1, en: 1 });
  assert.deepEqual(counts("Alpha -- beta and gamma - delta.", "dash-style"), { "double-hyphen": 1, "spaced-hyphen": 1 });
  // An HTML comment's `--` is not a dash.
  assert.deepEqual(counts("<!-- keep -->", "dash-style"), {});
  // A closed em dash is the consistent form.
  const consistent = family("One\u2014two and three\u2014four.", "dash-style");
  assert.equal(consistent.mixed, false);
  assert.equal(consistent.dominant, "em");
});

test("ellipsis-style: three periods and the ellipsis character are different habits", () => {
  assert.deepEqual(counts("Wait... then go.", "ellipsis-style"), { "three-dots": 1 });
  assert.deepEqual(counts("Wait\u2026 then go.", "ellipsis-style"), { character: 1 });
  assert.deepEqual(counts("Wait... then\u2026 go.", "ellipsis-style"), { "three-dots": 1, character: 1 });
});

test("serial-comma: both list patterns are counted, a list of two is not", () => {
  assert.deepEqual(counts("We bought bread, milk, and eggs.", "serial-comma"), { with: 1 });
  assert.deepEqual(counts("We bought bread, milk and eggs.", "serial-comma"), { without: 1 });
  // Two items are not a serial-comma decision.
  assert.deepEqual(counts("We bought bread and milk.", "serial-comma"), {});
});

test("list-punctuation: single-line items are judged by their final character", () => {
  const text = "- First item\n- Second item.\n- Third item";
  assert.deepEqual(counts(text, "list-punctuation"), { unpunctuated: 2, punctuated: 1 });
  const report = family(text, "list-punctuation");
  assert.equal(report.mixed, true);
  assert.equal(report.deviations.length, 1, "the single punctuated item is the minority");
});

test("number-style: bare figures 2-9 against the words two-nine, with documented exclusions", () => {
  assert.deepEqual(counts("We have 3 cats and two dogs.", "number-style"), { figure: 1, word: 1 });
  // Percent, decimals, times, years, ordinals, currency and 1/one are excluded.
  assert.deepEqual(counts("Up 3% from 3.5 ms at 3:30 in 2026, 3rd place, $3, one thing, 1 item.", "number-style"), {});
  assert.deepEqual(counts("There were 12 visitors.", "number-style"), {}, "two-digit figures are outside the family");
});

test("heading-case: standalone short lines are classified, ordinary sentences are not", () => {
  const text = ["Project Plan", "", "Overview of the work", "", "THIS IS A WARNING", "", "This is an ordinary sentence."].join("\n");
  const result = analyzeStyleConsistency(text);
  const report = result.families.find((entry) => entry.id === "heading-case");
  assert.ok(report);
  assert.equal(result.headingsChecked, 3, "the ordinary sentence is not heading-like");
  assert.deepEqual(Object.fromEntries(report.counts.map((entry) => [entry.variant, entry.count])), {
    "title-case": 1,
    "sentence-case": 1,
    "all-caps": 1,
  });
});

test("date-order: named months, ISO dates and numeric ambiguity", () => {
  assert.deepEqual(counts("March 5, 2026.", "date-order"), { "month-first": 1 });
  assert.deepEqual(counts("5 April 2026.", "date-order"), { "day-first": 1 });
  assert.deepEqual(counts("2026-07-04.", "date-order"), { iso: 1 });
  // Both parts are 12 or less, so the order cannot be known.
  const ambiguous = analyzeStyleConsistency("Filed 03/05/2026.");
  assert.equal(ambiguous.ambiguousDates, 1);
  const dateFamily = ambiguous.families.find((entry) => entry.id === "date-order");
  assert.equal(dateFamily?.occurrences, 0);
  // A part above 12 does settle it.
  assert.deepEqual(counts("Filed 13/05/2026.", "date-order"), { "day-first": 1 });
  assert.deepEqual(counts("Filed 05/13/2026.", "date-order"), { "month-first": 1 });
});

test("analyzeStyleConsistency: mixed, consistent and empty families are separated", () => {
  const consistent = analyzeStyleConsistency('One "quote" only, and a 2026-01-01 date.');
  assert.equal(consistent.mixedFamilies.length, 0);
  assert.ok(consistent.consistentFamilies.some((entry) => entry.id === "quote-marks"));
  const empty = analyzeStyleConsistency("");
  assert.equal(empty.emptyFamilies.length, 8);
  assert.equal(empty.deviations.length, 0);
  assert.equal(empty.words, 0);
  assert.equal(empty.sentences, 0);
});

test("formatStyleConsistencyReport: names the mixed families and disclaims any guide", () => {
  const report = formatStyleConsistencyReport(analyzeStyleConsistency('He said "yes" then \u201cno\u201d.'));
  assert.ok(report.includes("Double quotation marks"));
  assert.ok(report.includes("MIXED"));
  assert.ok(report.includes("does not apply any style guide"));
});
