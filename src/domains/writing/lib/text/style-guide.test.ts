/**
 * Unit tests for the style-guide checker.
 *
 * Each guide-specific rule is tested in both directions — the preset that wants
 * a convention must flag its absence, and the preset that rejects it must flag
 * its presence — so a preset's preferences can never silently invert.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { STYLE_GUIDES, checkStyle, spellNumber } from "./style-guide.ts";

const rulesOf = (text: string, guide: Parameters<typeof checkStyle>[1]) =>
  checkStyle(text, guide).findings.map((finding) => finding.rule);

test("spellNumber covers the ranges the rules use", () => {
  assert.equal(spellNumber(0), "zero");
  assert.equal(spellNumber(9), "nine");
  assert.equal(spellNumber(12), "twelve");
  assert.equal(spellNumber(42), "forty-two");
  assert.equal(spellNumber(100), "one hundred");
});

test("every preset publishes its seven rules", () => {
  assert.equal(STYLE_GUIDES.length, 4);
  for (const guide of STYLE_GUIDES) {
    assert.equal(checkStyle("A plain sentence.", guide.id).rules.length, 7);
  }
});

test("serial comma: Chicago wants it, AP rejects it", () => {
  assert.deepEqual(rulesOf("apples, oranges and pears", "chicago"), ["serial-comma"]);
  assert.deepEqual(rulesOf("apples, oranges and pears", "ap"), []);
  assert.deepEqual(rulesOf("apples, oranges, and pears", "ap"), ["serial-comma"]);
  assert.deepEqual(rulesOf("apples, oranges, and pears", "chicago"), []);
});

test("serial comma suggestion inserts the comma in the right place", () => {
  const finding = checkStyle("apples, oranges and pears", "chicago").findings[0];
  assert.equal(finding.suggestion, "apples, oranges, and pears");
});

test("quotation marks: single is flagged for Chicago, double for Oxford", () => {
  assert.ok(rulesOf("He said 'hello there'.", "chicago").includes("quotation-marks"));
  assert.deepEqual(rulesOf('He said "hello there".', "chicago"), []);
  assert.ok(rulesOf('He said "hello there".', "oxford").includes("quotation-marks"));
  assert.deepEqual(rulesOf("He said 'hello there'.", "oxford"), []);
});

test("apostrophes in contractions are not mistaken for quotation marks", () => {
  assert.deepEqual(rulesOf("It isn't John's book.", "chicago"), []);
});

test("numbers: AP spells out below ten, Chicago below one hundred", () => {
  assert.deepEqual(rulesOf("We have 5 apples.", "ap"), ["numbers"]);
  assert.deepEqual(rulesOf("We have 12 apples.", "ap"), []);
  assert.deepEqual(rulesOf("We have 12 apples.", "chicago"), ["numbers"]);
});

test("numbers skip measurements, money, times and labelled figures", () => {
  assert.deepEqual(rulesOf("Add 5 kg of flour.", "chicago"), []);
  assert.deepEqual(rulesOf("It cost $5 today.", "chicago"), []);
  assert.deepEqual(rulesOf("The meeting is at 5 p.m.", "chicago"), []);
  assert.deepEqual(rulesOf("See Figure 5 for details.", "chicago"), []);
  assert.deepEqual(rulesOf("Growth was 5%.", "chicago"), []);
});

test("em dashes: AP sets them open, Chicago closed", () => {
  assert.ok(rulesOf("word—word", "ap").includes("em-dash"));
  assert.deepEqual(rulesOf("word—word", "chicago"), []);
  assert.ok(rulesOf("word — word", "chicago").includes("em-dash"));
  assert.deepEqual(rulesOf("word — word", "ap"), []);
});

test("universal rules apply to every preset", () => {
  for (const guide of STYLE_GUIDES) {
    assert.ok(rulesOf("Hello.  World.", guide.id).includes("sentence-spacing"), guide.id);
    assert.ok(rulesOf("Hello , world.", guide.id).includes("space-before-punctuation"), guide.id);
    assert.ok(rulesOf("Use a tool, e.g. this one.", guide.id).includes("latin-abbreviation"), guide.id);
    assert.deepEqual(rulesOf("Use a tool, e.g., this one.", guide.id), [], guide.id);
  }
});

test("a fully compliant sentence produces no findings", () => {
  assert.deepEqual(rulesOf("The committee approved the plan, and the team began work.", "chicago"), []);
});

test("findings are ordered by position", () => {
  const findings = checkStyle("Hello.  World , here.", "chicago").findings;
  const indexes = findings.map((finding) => finding.index);
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b));
});
