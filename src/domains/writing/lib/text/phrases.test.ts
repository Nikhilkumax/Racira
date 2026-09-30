/**
 * Unit tests for the cliché, redundancy and wordiness detectors.
 *
 * The lists are the product, so the tests pin both the lists (every entry has a
 * note, wordiness entries have a replacement) and the matcher (word boundaries,
 * longest-phrase-first, overlap handling) with hand-checked examples.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLICHES,
  REDUNDANCIES,
  WORDY_PHRASES,
  findCliches,
  findRedundancies,
  findWordiness,
  simplifyWordiness,
} from "./phrases.ts";

test("phrase lists are substantial and fully annotated", () => {
  assert.ok(CLICHES.length >= 50, `only ${CLICHES.length} clichés`);
  assert.ok(REDUNDANCIES.length >= 45, `only ${REDUNDANCIES.length} redundancies`);
  assert.ok(WORDY_PHRASES.length >= 60, `only ${WORDY_PHRASES.length} wordy phrases`);
  for (const entry of [...CLICHES, ...REDUNDANCIES, ...WORDY_PHRASES]) {
    assert.equal(entry.phrase, entry.phrase.toLowerCase(), `${entry.phrase} must be lowercase`);
    assert.ok(entry.note.length > 12, `${entry.phrase} needs a real note`);
  }
  for (const entry of WORDY_PHRASES) {
    assert.notEqual(entry.replacement, undefined, `${entry.phrase} needs a replacement`);
  }
});

test("findCliches matches a known phrase and preserves the source casing", () => {
  const found = findCliches("At the end of the day, we shipped it.");
  assert.equal(found.length, 1);
  assert.equal(found[0].phrase, "at the end of the day");
  assert.equal(found[0].source, "At the end of the day");
  assert.equal(found[0].index, 0);
});

test("findCliches is case-insensitive and matches whole phrases only", () => {
  assert.equal(findCliches("CIRCLE BACK tomorrow.").length, 1);
  assert.equal(findCliches("Let us touch base on Friday.").length, 1);
  assert.equal(findCliches("Today is an ordinary day.").length, 0);
  assert.equal(findCliches("").length, 0);
});

test("findRedundancies reports the redundant phrase and why", () => {
  const found = findRedundancies("It was a free gift.");
  assert.equal(found.length, 1);
  assert.equal(found[0].phrase, "free gift");
  assert.match(found[0].note, /gift/i);
});

test("findWordiness prefers the longest phrase at a position", () => {
  const found = findWordiness("The delay was due to the fact that it rained.");
  assert.equal(found.length, 1);
  assert.equal(found[0].phrase, "due to the fact that");
  assert.equal(found[0].replacement, "because");
});

test("findWordiness respects word boundaries", () => {
  // "prior to" is the entry; a bare "prior" or "to" must never match.
  assert.equal(findWordiness("The prior owner left.").length, 0);
  assert.equal(findWordiness("We came prior to the deadline.").length, 1);
});

test("overlapping matches keep the earlier phrase", () => {
  const found = findWordiness("in order to in order to succeed");
  assert.deepEqual(
    found.map((match) => match.phrase),
    ["in order to", "in order to"],
  );
});

test("simplifyWordiness applies replacements and capitalises the sentence", () => {
  const result = simplifyWordiness("In order to succeed, due to the fact that we tried.");
  assert.equal(result.output, "To succeed, because we tried.");
  assert.equal(result.replacements.length, 2);
});

test("simplifyWordiness deletes filler and the space it leaves behind", () => {
  assert.equal(simplifyWordiness("In my opinion the plan works.").output, "The plan works.");
  assert.equal(simplifyWordiness("Needless to say we agreed.").output, "We agreed.");
});

test("simplifyWordiness with nothing to change returns the text unchanged", () => {
  const text = "The cat sat on the mat and slept.";
  const result = simplifyWordiness(text);
  assert.equal(result.output, text);
  assert.equal(result.replacements.length, 0);
});
