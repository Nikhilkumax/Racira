/**
 * Unit tests for the text statistics engine.
 *
 * The reference string is short enough to count by hand, so every assertion is
 * independently checkable: "Hello world. This is a test."
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SPM,
  DEFAULT_WPM,
  formatDuration,
  sentenceWordCounts,
  textStats,
  topWords,
  wordLengthDistribution,
} from "./stats.ts";
import { wordTokens } from "./tokenize.ts";
import { ENGLISH_STOPWORD_SET } from "./stopwords.ts";

const SAMPLE = "Hello world. This is a test.";

test("textStats: exact counts for a hand-counted sample", () => {
  const stats = textStats(SAMPLE);
  assert.equal(stats.characters, 28);
  assert.equal(stats.charactersNoSpaces, 23);
  assert.equal(stats.codePoints, 28);
  assert.equal(stats.graphemes, 28);
  assert.equal(stats.bytesUtf8, 28);
  assert.equal(stats.words, 6);
  assert.equal(stats.uniqueWords, 6);
  assert.equal(stats.sentences, 2);
  assert.equal(stats.paragraphs, 1);
  assert.equal(stats.lines, 1);
  assert.equal(stats.letters, 21);
  assert.equal(stats.digits, 0);
  assert.equal(stats.punctuation, 2);
  assert.equal(stats.symbols, 0);
  assert.equal(stats.whitespace, 5);
  assert.equal(stats.avgWordLength, 3.5);
  assert.equal(stats.longestWord, "Hello");
  assert.equal(stats.shortestWord, "a");
  assert.equal(stats.avgSentenceLength, 3);
});

test("textStats: reading and speaking time are words-per-minute models", () => {
  const stats = textStats(SAMPLE);
  assert.equal(stats.readingSeconds, (6 / DEFAULT_WPM) * 60);
  assert.equal(stats.speakingSeconds, (6 / DEFAULT_SPM) * 60);
  const slow = textStats(SAMPLE, { wpm: 100, spm: 100 });
  assert.ok(Math.abs(slow.readingSeconds - 3.6) < 1e-9);
  assert.ok(Math.abs(slow.speakingSeconds - 3.6) < 1e-9);
});

test("textStats: accents count as one grapheme, two code units", () => {
  const precomposed = textStats("caf\u00e9");
  assert.equal(precomposed.characters, 4);
  assert.equal(precomposed.codePoints, 4);
  assert.equal(precomposed.graphemes, 4);
  assert.equal(precomposed.bytesUtf8, 5);
  assert.equal(precomposed.letters, 4);
  assert.equal(precomposed.words, 1);

  const decomposed = textStats("cafe\u0301");
  assert.equal(decomposed.characters, 5);
  assert.equal(decomposed.codePoints, 5);
  assert.equal(decomposed.graphemes, 4);
  assert.equal(decomposed.letters, 4, "the combining mark is not a letter");
});

test("textStats: emoji are symbols, not letters or words", () => {
  const stats = textStats("hi \u{1f600}\u{1f44d}\u{1f3fd}");
  assert.equal(stats.words, 1);
  assert.equal(stats.letters, 2);
  // U+1F600 plus the thumbs-up and its skin-tone modifier (U+1F3FD is Sk).
  assert.equal(stats.symbols, 3);
  assert.equal(stats.graphemes, 5); // h i space thumbs-up(1 grapheme) emoji
});

test("textStats: empty input is all zeros", () => {
  const stats = textStats("");
  assert.equal(stats.words, 0);
  assert.equal(stats.characters, 0);
  assert.equal(stats.sentences, 0);
  assert.equal(stats.paragraphs, 0);
  assert.equal(stats.lines, 0);
  assert.equal(stats.avgWordLength, 0);
  assert.equal(stats.avgSentenceLength, 0);
  assert.equal(stats.readingSeconds, 0);
});

test("formatDuration: seconds, minutes, hours", () => {
  assert.equal(formatDuration(0), "0 sec");
  assert.equal(formatDuration(45), "45 sec");
  assert.equal(formatDuration(192), "3 min 12 sec");
  assert.equal(formatDuration(180), "3 min");
  assert.equal(formatDuration(3840), "1 hr 4 min");
  assert.equal(formatDuration(Number.NaN), "0 sec");
});

test("wordLengthDistribution: fixed-width histogram", () => {
  const buckets = wordLengthDistribution(["a", "bb", "bb"], 15);
  assert.equal(buckets.length, 15);
  assert.deepEqual(buckets[0], { length: 1, count: 1 });
  assert.deepEqual(buckets[1], { length: 2, count: 2 });
  assert.deepEqual(buckets[14], { length: 15, count: 0 });
  const folded = wordLengthDistribution(["antidisestablishmentarianism"], 5);
  assert.equal(folded[4].count, 1, "over-long words fold into the last bucket");
});

test("topWords: stopwords filtered, ties alphabetical", () => {
  const tokens = ["the", "cat", "the", "dog", "cat"];
  assert.deepEqual(topWords(tokens, 5, ENGLISH_STOPWORD_SET), [
    { word: "cat", count: 2 },
    { word: "dog", count: 1 },
  ]);
  // Without the stopword filter "the" and "cat" tie at 2, so the alphabetical
  // tiebreak puts "cat" first.
  assert.deepEqual(topWords(tokens, 5)[0], { word: "cat", count: 2 });
  assert.deepEqual(topWords(tokens, 5).map((entry) => entry.word), ["cat", "the", "dog"]);
});

test("sentenceWordCounts: one entry per sentence", () => {
  assert.deepEqual(sentenceWordCounts("One two. Three four five!"), [2, 3]);
  assert.deepEqual(sentenceWordCounts(""), []);
});

test("textStats: hyphenated words count as one word", () => {
  assert.equal(textStats("well-known fact").words, 2);
  assert.equal(textStats("e-mail").words, 1);
  assert.deepEqual(wordTokens("well-known fact").map((t) => t.text), ["well-known", "fact"]);
});
