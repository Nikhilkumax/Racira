/**
 * Unit tests for the sentence metrics.
 *
 * Sentence and word counts are exact and are asserted against hand-counted
 * inputs. Clause counts are the documented estimate, so the tests pin the
 * heuristic's behaviour (including where it deliberately does not fire, such as
 * commas in lists) rather than claiming a parse.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LENGTH_BUCKETS,
  complexitySummary,
  sentenceDetails,
  varietySummary,
} from "./sentence-metrics.ts";

test("sentenceDetails: counts words, commas and clauses per sentence", () => {
  const details = sentenceDetails("The cat sat on the mat, and the dog ran.");
  assert.equal(details.length, 1);
  assert.equal(details[0].words, 10);
  assert.equal(details[0].commas, 1);
  assert.equal(details[0].clauses, 2, "one coordinating conjunction adds one clause");
  assert.equal(details[0].label, "two clauses");
  assert.equal(details[0].wordsPerClause, 5);
});

test("sentenceDetails: clause estimate from markers, not commas", () => {
  const single = sentenceDetails("The cat sat on the mat.")[0];
  assert.equal(single.clauses, 1);
  assert.equal(single.label, "single clause");

  // A list must not inflate the clause count.
  const list = sentenceDetails("I bought apples, oranges, and pears.")[0];
  assert.equal(list.commas, 2);
  assert.equal(list.clauses, 2, "only the conjunction counts");

  // A subordinate clause plus a compound predicate.
  const clausal = sentenceDetails("Although it rained, we walked and talked.")[0];
  assert.equal(clausal.clauses, 3);
  assert.equal(clausal.label, "three or more clauses");

  // Semicolons join independent clauses.
  assert.equal(sentenceDetails("It rained; we stayed inside.")[0].clauses, 2);
  // Relative pronouns indicate a further clause.
  assert.equal(sentenceDetails("The report that I filed was short.")[0].clauses, 2);
});

test("sentenceDetails: complex and long words per sentence", () => {
  const detail = sentenceDetails("The implementation necessitates substantial refactoring.")[0];
  assert.equal(detail.words, 5);
  assert.ok(detail.complexWords >= 3);
  assert.equal(detail.longWords, 4, "implementation, necessitates, substantial, refactoring");
});

test("varietySummary: known distribution", () => {
  const details = sentenceDetails("One. Two. Three four. Five six seven eight.");
  const summary = varietySummary(details);
  assert.equal(summary.count, 4);
  assert.deepEqual(
    details.map((detail) => detail.words),
    [1, 1, 2, 4],
  );
  assert.equal(summary.meanWords, 2);
  assert.equal(summary.medianWords, 1.5);
  // Population standard deviation of [1,1,2,4] about a mean of 2 is √1.5.
  assert.equal(Math.round(summary.stdevWords * 1000) / 1000, 1.225);
  assert.equal(summary.minWords, 1);
  assert.equal(summary.maxWords, 4);
  assert.equal(summary.shortShare, 1);
  assert.equal(summary.longShare, 0);
  assert.equal(summary.buckets[0].count, 4);
  assert.equal(summary.buckets[0].share, 1);
  assert.equal(summary.longestUniformRun, 4, "every consecutive pair is within two words");
  assert.equal(summary.perfectlyUniform, false);
});

test("varietySummary: uniform sentences are detected", () => {
  const summary = varietySummary(sentenceDetails("One two three. Four five six. Seven eight nine."));
  assert.equal(summary.perfectlyUniform, true);
  assert.equal(summary.stdevWords, 0);
  assert.equal(summary.longestUniformRun, 3);
  assert.equal(summary.buckets[0].count, 3, "three-word sentences land in the short bucket");
  assert.equal(summary.shortShare, 1);
});

test("varietySummary: bucket boundaries follow the documented bands", () => {
  const lengths = [5, 15, 25, 35];
  // Each sentence starts with a capital so the segmenter breaks on the period
  // (a period followed by a lowercase word is not a sentence boundary in ICU).
  const summary = varietySummary(
    sentenceDetails(
      lengths.map((length) => `Word ${Array.from({ length: length - 1 }, () => "word").join(" ")}.`).join(" "),
    ),
  );
  assert.equal(summary.count, 4);
  assert.deepEqual(
    summary.buckets.map((bucket) => bucket.count),
    [1, 1, 1, 1],
  );
  assert.equal(LENGTH_BUCKETS.length, 4);
  assert.equal(summary.longShare, 0.25);
  assert.equal(summary.shortShare, 0.25);
});

test("varietySummary: empty input", () => {
  const summary = varietySummary([]);
  assert.equal(summary.count, 0);
  assert.equal(summary.meanWords, 0);
  assert.equal(summary.longestUniformRun, 0);
  assert.equal(summary.perfectlyUniform, false);
  assert.deepEqual(
    summary.buckets.map((bucket) => bucket.count),
    [0, 0, 0, 0],
  );
});

test("complexitySummary: shares and the sentences that stand out", () => {
  const details = sentenceDetails(
    "The cat sat. Although it rained, we walked and talked. The dog ran, and the cat slept, and the bird sang.",
  );
  const summary = complexitySummary(details);
  assert.equal(details.length, 3);
  assert.equal(Math.round(summary.singleClauseShare * 100), 33);
  assert.equal(Math.round(summary.threeOrMoreShare * 100), 67);
  assert.ok(summary.averageClauses > 1.5);
  assert.ok(summary.averageWordsPerClause > 0);
  assert.equal(summary.mostClausal[0].clauses, 3);
  assert.equal(summary.longest[0].words, 11);
});

test("complexitySummary: empty input", () => {
  const summary = complexitySummary([]);
  assert.equal(summary.averageClauses, 0);
  assert.deepEqual(summary.longest, []);
  assert.deepEqual(summary.mostClausal, []);
});
