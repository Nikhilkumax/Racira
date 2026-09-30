/**
 * Unit tests for the mechanical checks.
 *
 * Every check is a documented rule, so the tests pair each rule with a known
 * error (which must be caught) and a near-miss (which must not be), so the
 * precision claims on the tool page are backed by evidence.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GRAMMAR_CHECKS, checkGrammar } from "./grammar.ts";

const count = (text: string, rule: string) => checkGrammar(text).counts[rule] ?? 0;

test("runs every published check and initialises each count", () => {
  const result = checkGrammar("A clean sentence.");
  for (const check of GRAMMAR_CHECKS) assert.equal(result.counts[check.id], 0);
  assert.equal(result.findings.length, 0);
  assert.equal(result.checksRun.length, GRAMMAR_CHECKS.length);
});

test("a clean paragraph produces no findings", () => {
  const result = checkGrammar("The cat sat on the mat and slept.\n\nIt was a quiet afternoon.");
  assert.deepEqual(result.findings, []);
  assert.equal(result.words, 13);
});

test("repeated word is flagged with the word named", () => {
  const result = checkGrammar("This is is a test.");
  assert.equal(result.counts["repeated-word"], 1);
  assert.equal(result.findings[0].suggestion, "is");
  assert.match(result.findings[0].message, /"is" is repeated/);
});

test("a / an agreement follows the sound, not just the letter", () => {
  assert.equal(count("I ate a apple.", "a-an"), 1);
  assert.equal(count("I waited an hour.", "a-an"), 0);
  assert.equal(count("She attends a university.", "a-an"), 0);
  assert.equal(count("She attends an university.", "a-an"), 1);
  assert.equal(count("I had an MRI.", "a-an"), 0);
  assert.equal(count("The doctor ordered a MRI.", "a-an"), 1);
  assert.equal(count("Open a URL.", "a-an"), 0);
});

test("the a / an suggestion includes the corrected article", () => {
  const result = checkGrammar("I ate a apple.");
  assert.equal(result.findings[0].suggestion, "an apple");
});

test("confusable words are caught only in their wrong context", () => {
  assert.equal(count("your going to love it.", "confusable"), 1);
  assert.equal(count("Your car is fast.", "confusable"), 0);
  assert.equal(count("more then enough.", "confusable"), 1);
  assert.equal(count("He ran more miles than she did.", "confusable"), 0);
  assert.equal(count("its been a long day.", "confusable"), 1);
  assert.equal(count("Its engine is quiet.", "confusable"), 0);
  assert.equal(count("to much work.", "confusable"), 1);
  assert.equal(count("we want to go too.", "confusable"), 0);
  assert.equal(count("the affect of the policy.", "confusable"), 1);
  assert.equal(count("will effect the outcome.", "confusable"), 1);
  assert.equal(count("weather or not it rains.", "confusable"), 1);
  assert.equal(count("do not loose the keys.", "confusable"), 1);
});

test("a confusable finding carries a mechanical fix", () => {
  const result = checkGrammar("more then enough.");
  assert.equal(result.findings[0].suggestion, "more than");
});

test("sentence capitalisation flags a lowercase sentence start", () => {
  assert.equal(count("Hello world. this is lower.", "sentence-case"), 1);
  assert.equal(count("Hello world. This is fine.", "sentence-case"), 0);
});

test("sentence capitalisation skips abbreviations and initials", () => {
  assert.equal(count("Use a tool, e.g. the editor.", "sentence-case"), 0);
  assert.equal(count("It was written by J. smith later.", "sentence-case"), 0);
});

test("a paragraph without terminal punctuation is flagged", () => {
  assert.equal(count("This is fine.\n\nThis is not", "terminal-punctuation"), 1);
  assert.equal(count("Both end properly.\n\nThis one too!", "terminal-punctuation"), 0);
});

test("unmatched delimiters are detected per kind", () => {
  assert.equal(count("He said (hello.", "unmatched-delimiters"), 1);
  assert.equal(count("Balanced (ok) and [fine].", "unmatched-delimiters"), 0);
  assert.equal(count('He said "hello.', "unmatched-delimiters"), 1);
});

test("findings are returned in document order", () => {
  const result = checkGrammar("I ate a apple. more then enough.");
  const indexes = result.findings.map((finding) => finding.index);
  assert.deepEqual(indexes, [...indexes].sort((a, b) => a - b));
});
