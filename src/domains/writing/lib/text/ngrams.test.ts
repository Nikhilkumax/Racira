/**
 * Unit tests for the n-gram, density and repetition engine.
 *
 * Counts are asserted against hand-counted inputs, so the density arithmetic
 * (count ÷ word total) is pinned to a known reference rather than to whatever
 * the implementation happens to produce.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adjacentRepeats,
  keywordDensity,
  ngramCounts,
  ngramEntries,
  normalisedTokens,
  repeatedTerms,
} from "./ngrams.ts";

const TEXT = "The cat sat on the mat. The cat sat on the floor.";

test("normalisedTokens: lowercased word tokens", () => {
  assert.deepEqual(normalisedTokens("The CAT sat."), ["the", "cat", "sat"]);
  assert.deepEqual(normalisedTokens(""), []);
});

test("ngramCounts: unigrams and bigrams counted exactly", () => {
  const tokens = ["the", "cat", "sat", "on", "the", "mat"];
  const unigrams = ngramCounts(tokens, 1);
  assert.equal(unigrams.get("the")?.count, 2);
  assert.equal(unigrams.get("the")?.firstIndex, 0);
  assert.equal(unigrams.get("cat")?.count, 1);
  assert.equal(unigrams.size, 5);

  const bigrams = ngramCounts(tokens, 2);
  assert.equal(bigrams.get("the cat")?.count, 1);
  assert.equal(bigrams.get("on the")?.count, 1);
  assert.equal(bigrams.get("the mat")?.count, 1);
  assert.equal(bigrams.size, 5);

  // Trigram windows: n - 1 positions.
  assert.equal(ngramCounts(tokens, 3).size, 4);
  // A window wider than the token list is empty, not an error.
  assert.equal(ngramCounts(tokens, 10).size, 0);
});

test("ngramEntries: counts, density and first appearance", () => {
  const entries = ngramEntries(TEXT, { sizes: [1], minCount: 2, limit: 10 });
  const byTerm = new Map(entries.map((entry) => [entry.term, entry]));

  // "the" and "on" are function words and are excluded by default; "cat" and
  // "sat" repeat twice each in this 12-token text.
  assert.equal(byTerm.has("the"), false);
  assert.equal(byTerm.has("on"), false);
  assert.equal(byTerm.get("cat")?.count, 2);
  assert.equal(byTerm.get("sat")?.count, 2);
  assert.equal(entries.length, 2, "mat and floor appear once and are below minCount");
  // 12 word tokens in total, so two occurrences is 16.7% and 166.7 per 1,000.
  assert.equal(Math.round((byTerm.get("cat")?.densityPercent ?? 0) * 10) / 10, 16.7);
  assert.equal(Math.round(byTerm.get("cat")?.perThousand ?? 0), 167);
  assert.equal(byTerm.get("cat")?.firstIndex, 1, "first occurrence is the second token");
});

test("ngramEntries: stopwords are optional", () => {
  const withoutStopwords = ngramEntries(TEXT, { sizes: [1], minCount: 2, excludeStopwords: true });
  const withStopwords = ngramEntries(TEXT, { sizes: [1], minCount: 2, excludeStopwords: false });
  assert.ok(withoutStopwords.every((entry) => entry.term !== "the"));
  assert.equal(withStopwords[0].term, "the", "the is the most frequent token when included");
  assert.equal(withStopwords[0].count, 4);
});

test("ngramEntries: minCount and limit shape the table", () => {
  // 6 unique tokens, of which "the" and "on" are stopwords.
  assert.equal(new Set(normalisedTokens(TEXT)).size, 6);
  const all = ngramEntries(TEXT, { sizes: [1], minCount: 1, limit: 100 });
  assert.equal(all.length, 4);
  const limited = ngramEntries(TEXT, { sizes: [1], minCount: 1, limit: 3 });
  assert.equal(limited.length, 3);
  // Sorted by count, then by first appearance for ties.
  assert.equal(limited[0].term, "cat");
  const withStopwords = ngramEntries(TEXT, { sizes: [1], minCount: 1, limit: 3, excludeStopwords: false });
  assert.equal(withStopwords[0].term, "the");
});

test("ngramEntries: phrases need a content word", () => {
  const text = "state of the art state of the art";
  const phrases = ngramEntries(text, { sizes: [2], minCount: 2, limit: 20 });
  const bigrams = phrases.map((entry) => entry.term);
  assert.deepEqual(bigrams, ["state of", "the art"], "the all-stopword pair \"of the\" is dropped");
  assert.equal(bigrams.includes("of the"), false);

  const repeated = ngramEntries("state of the art state of the art", {
    sizes: [3],
    minCount: 2,
    limit: 20,
  });
  assert.deepEqual(
    repeated.map((entry) => entry.term),
    ["state of the", "of the art"],
    "both trigrams repeat twice",
  );
  assert.ok(repeated.every((entry) => entry.count === 2));
});

test("keywordDensity: unigram and bigram tables share one denominator", () => {
  const result = keywordDensity(TEXT, { minCount: 2, limit: 10 });
  assert.equal(result.words, 12);
  assert.equal(result.uniqueWords, 6);
  assert.ok(result.singleWords.every((entry) => entry.length === 1));
  assert.ok(result.phrases.every((entry) => entry.length === 2));
  // "the cat sat on the mat" repeats verbatim, so "cat sat" occurs twice.
  const phrase = result.phrases.find((entry) => entry.term === "cat sat");
  assert.equal(phrase?.count, 2);
});

test("repeatedTerms: content words only by default", () => {
  const terms = repeatedTerms(TEXT, { minCount: 2 });
  assert.deepEqual(
    terms.map((entry) => entry.term),
    ["cat", "sat"],
    "sorted by count then alphabetically, function words hidden",
  );
  const withStopwords = repeatedTerms(TEXT, { minCount: 4, includeStopwords: true });
  assert.equal(withStopwords[0].term, "the");
  assert.equal(withStopwords[0].count, 4);
});

test("adjacentRepeats: reports distance between repeats", () => {
  const repeats = adjacentRepeats("The cat cat sat down.", { window: 10 });
  assert.equal(repeats.length, 1);
  assert.equal(repeats[0].term, "cat");
  assert.equal(repeats[0].distance, 1);
  assert.ok(repeats[0].line.includes("cat cat"));
  // A window smaller than the distance hides the repeat.
  assert.equal(adjacentRepeats("The cat walked away and sat, and the cat slept.", { window: 3 }).length, 0);
});

test("empty input is handled without throwing", () => {
  assert.deepEqual(ngramEntries(""), []);
  assert.equal(keywordDensity("").words, 0);
  assert.deepEqual(repeatedTerms(""), []);
  assert.deepEqual(adjacentRepeats(""), []);
});
