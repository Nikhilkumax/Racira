/**
 * Unit tests for the mechanical punctuation checks.
 *
 * Each rule gets a positive case and the near-misses that must stay silent
 * (1,000 and 10:30 are not missing spaces; "e.g." and "J.K." are not missing
 * spaces after a full stop; a comma inside a closing quote is American style,
 * not an error).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PUNCTUATION_RULES, checkPunctuation, formatPunctuationReport } from "./punctuation.ts";

const count = (text: string, rule: string) => checkPunctuation(text).counts[rule] ?? 0;
const rules = (text: string) => checkPunctuation(text).findings.map((finding) => finding.rule);

test("initialises a count for every published rule", () => {
  const result = checkPunctuation("A clean sentence.");
  assert.equal(result.findings.length, 0);
  assert.equal(Object.keys(result.counts).length, PUNCTUATION_RULES.length);
  for (const rule of PUNCTUATION_RULES) assert.equal(result.counts[rule.id], 0);
});

test("finds a space before punctuation", () => {
  assert.equal(count("This is wrong .", "space-before-punctuation"), 1);
  assert.equal(count("Wait , what?", "space-before-punctuation"), 1);
  assert.equal(count("This is right.", "space-before-punctuation"), 0);
  assert.equal(count("A sentence .\n\nAnother !", "space-before-punctuation"), 2);
});

test("finds a missing space after punctuation but not inside numbers or abbreviations", () => {
  assert.equal(count("One,two three.", "missing-space-after-punctuation"), 1);
  assert.equal(count("Stop;go now.", "missing-space-after-punctuation"), 1);
  assert.equal(count("It rained.Then it stopped.", "missing-space-after-punctuation"), 1);

  for (const clean of ["It cost 1,000 dollars.", "Meet at 10:30 sharp.", "Use e.g. this one.", "J.K. Rowling wrote it.", 'He said "hello," and left.', "See https://example.com/a,b for details."]) {
    assert.equal(count(clean, "missing-space-after-punctuation"), 0, clean);
  }
});

test("finds repeated punctuation and reports one finding per run", () => {
  assert.equal(count("Wow!!!", "repeated-punctuation"), 1);
  assert.equal(count("Really??", "repeated-punctuation"), 1);
  assert.equal(count("Yes,, please", "repeated-punctuation"), 1);
  assert.equal(count("Wow!", "repeated-punctuation"), 0);
  assert.equal(count("Is it?", "repeated-punctuation"), 0);
  const [finding] = checkPunctuation("Wow!!!").findings;
  assert.match(finding.message, /3 times/);
  assert.equal(finding.severity, "style");
});

test("checks the length of an ellipsis", () => {
  assert.equal(count("Well.. maybe.", "ellipsis-length"), 1);
  assert.equal(count("Well.... maybe.", "ellipsis-length"), 1);
  assert.equal(count("Well… maybe.", "ellipsis-length"), 0);
  assert.equal(count("Well... maybe.", "ellipsis-length"), 0);
});

test("finds unmatched brackets and leaves balanced ones alone", () => {
  assert.equal(count("A (parenthesis here.", "unmatched-brackets"), 1);
  assert.equal(count("A parenthesis here).", "unmatched-brackets"), 1);
  assert.equal(count("A [bracket here.", "unmatched-brackets"), 1);
  assert.equal(count("A {brace here.", "unmatched-brackets"), 1);
  assert.equal(count("A (balanced) pair [and this].", "unmatched-brackets"), 0);
  const [finding] = checkPunctuation("A (parenthesis here.").findings;
  assert.match(finding.message, /1 “\(” but 0 “\)”/);
});

test("finds unbalanced quotation marks in both styles", () => {
  assert.equal(count('He said "hello.', "unbalanced-quotes"), 1);
  assert.equal(count("He said “hello.", "unbalanced-quotes"), 1);
  assert.equal(count('He said "hello" and left.', "unbalanced-quotes"), 0);
  assert.equal(count("He said “hello” and left.", "unbalanced-quotes"), 0);
});

test("finds paragraphs without end punctuation", () => {
  assert.equal(count("This paragraph has no full stop", "missing-terminal-punctuation"), 1);
  assert.equal(count("This one does.", "missing-terminal-punctuation"), 0);
  assert.equal(count("First line\n\nSecond line.", "missing-terminal-punctuation"), 1);
  assert.equal(count("Ends with a question?", "missing-terminal-punctuation"), 0);
  assert.equal(count("Ends with a colon:", "missing-terminal-punctuation"), 0);
});

test("finds a hyphen used as a dash", () => {
  assert.equal(count("Wait - stop.", "spaced-hyphen"), 1);
  assert.equal(count("A well-known fact.", "spaced-hyphen"), 0);
  assert.equal(count("Wait – stop.", "spaced-hyphen"), 0);
});

test("finds doubled hyphens", () => {
  assert.equal(count("Wait -- stop.", "double-hyphen"), 1);
  assert.equal(count("A well-known fact.", "double-hyphen"), 0);
});

test("checks spacing inside brackets", () => {
  assert.equal(count("A bracket ( like this).", "space-after-opening"), 1);
  assert.equal(count("A bracket (like this ).", "space-before-closing"), 1);
  assert.equal(count("A bracket (like this).", "space-after-opening"), 0);
  assert.equal(count("A bracket (like this).", "space-before-closing"), 0);
});

test("returns findings in document order with offsets that point at the issue", () => {
  const text = "Wait - stop now .Then go,, please.";
  const result = checkPunctuation(text);
  assert.deepEqual(rules(text), [
    "spaced-hyphen",
    "space-before-punctuation",
    "missing-space-after-punctuation",
    "repeated-punctuation",
  ]);
  const indices = result.findings.map((finding) => finding.index);
  assert.deepEqual([...indices].sort((a, b) => a - b), indices);
  const spaceBefore = result.findings.find((finding) => finding.rule === "space-before-punctuation");
  assert.equal(text.slice(spaceBefore!.index, spaceBefore!.index + 1), " ");
});

test("counts a comma inside a quote as correct", () => {
  assert.deepEqual(checkPunctuation('He said "stop, now".').findings, []);
});

test("keeps suggestions mechanical", () => {
  const result = checkPunctuation("Wow!!! And a space here .");
  const repeat = result.findings.find((finding) => finding.rule === "repeated-punctuation");
  assert.equal(repeat?.suggestion, "!");
  const space = result.findings.find((finding) => finding.rule === "space-before-punctuation");
  assert.equal(space?.suggestion, ".");
});

test("formats a report for copying and downloading", () => {
  assert.match(formatPunctuationReport(checkPunctuation("Clean."), "Clean."), /No mechanical punctuation issues\./);
  const report = formatPunctuationReport(checkPunctuation("Wait - stop."), "Wait - stop.");
  assert.match(report, /Punctuation findings: 1/);
  assert.match(report, /Hyphen used as a dash/);
});
