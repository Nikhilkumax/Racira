/**
 * Unit tests for the stylometric profile.
 *
 * The controlled text below has hand-countable properties (12 tokens, 2
 * sentences, 9 unique words, 6 function words), so every ratio can be checked
 * against arithmetic rather than against the implementation's own output.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareProfiles,
  movingAverageTtr,
  profileSimilarity,
  similarityBand,
  stylometricProfile,
} from "./stylometry.ts";

const PLAIN = "The cat sat on the mat. The dog ran in the park.";

test("stylometricProfile: controlled text", () => {
  const profile = stylometricProfile(PLAIN);
  assert.equal(profile.words, 12);
  assert.equal(profile.sentences, 2);
  assert.equal(profile.paragraphs, 1);
  assert.equal(profile.meanSentenceLength, 6);
  // 9 unique words out of 12, so TTR = 0.75 and the Guiraud index is 9/√12.
  assert.equal(profile.typeTokenRatio, 0.75);
  assert.equal(Math.round(profile.rootTtr * 1000) / 1000, Math.round((9 / Math.sqrt(12)) * 1000) / 1000);
  assert.equal(profile.hapaxShare, 8 / 12);
  // the ×4, on ×1, in ×1 → six function words, half the text.
  assert.equal(profile.functionWordShare, 0.5);
  assert.equal(profile.meanWordLength, 35 / 12);
  assert.equal(profile.longWordShare, 0);
  assert.equal(profile.syllablesPerWord, 1);
  assert.equal(profile.meanParagraphWords, 12);
  assert.equal(profile.punctuationPer1000.commas, 0);
  assert.equal(profile.punctuationPer1000.dashes, 0);
  // Function words are ranked by share.
  assert.equal(profile.functionWords[0].word, "the");
  assert.equal(Math.round(profile.functionWords[0].share * 100), 33);
});

test("stylometricProfile: punctuation rates are per 1,000 words", () => {
  const text = "Yes, indeed; however: the report — short as it is — says \"stop!\" now.";
  const profile = stylometricProfile(text);
  assert.ok(profile.punctuationPer1000.commas > 0);
  assert.ok(profile.punctuationPer1000.semicolons > 0);
  assert.ok(profile.punctuationPer1000.colons > 0);
  assert.ok(profile.punctuationPer1000.dashes >= 2);
  assert.ok(profile.punctuationPer1000.exclamations > 0);
  assert.ok(profile.punctuationPer1000.quotationMarks > 0);
  // 12 tokens (the dashes and quotes are not word tokens), one comma → 83.3.
  assert.equal(profile.words, 12);
  assert.equal(Math.round(profile.punctuationPer1000.commas * 10) / 10, 83.3);
});

test("stylometricProfile: empty input is all zeros", () => {
  const profile = stylometricProfile("");
  assert.equal(profile.words, 0);
  assert.equal(profile.sentences, 0);
  assert.equal(profile.typeTokenRatio, 0);
  assert.equal(profile.functionWordShare, 0);
  assert.equal(profile.meanSentenceLength, 0);
  assert.deepEqual(profile.functionWords, []);
});

test("profileSimilarity: identical text is 1, different style is lower", () => {
  const plain = stylometricProfile(PLAIN);
  assert.ok(profileSimilarity(plain, stylometricProfile(PLAIN)) > 0.999999, "identical text is a perfect match");

  // A different register: longer words, a different function-word mix.
  const dense = stylometricProfile(
    "Consequently, the infrastructure modernisation necessitates a comprehensive evaluation. " +
      "Authorisation therefore proceeds gradually, notwithstanding the intermittent disruption.",
  );
  const similarity = profileSimilarity(plain, dense);
  assert.ok(similarity > 0 && similarity < 1, `expected a partial match, got ${similarity}`);
  // A text with no function words from the curated list has no vector to compare.
  assert.equal(profileSimilarity(plain, stylometricProfile("")), 0);
  assert.equal(profileSimilarity(plain, stylometricProfile("Comprehensive evaluation necessitates reconfiguration.")), 0);
});

test("compareProfiles: reports both sides, the difference and the change", () => {
  const a = stylometricProfile("The cat sat on the mat. The dog ran.");
  const b = stylometricProfile(
    "The extraordinarily complicated implementation significantly complicated the previously straightforward process.",
  );
  const rows = compareProfiles(a, b);
  assert.ok(rows.length >= 10);

  const words = rows.find((row) => row.label === "Words");
  assert.equal(words?.a, 9);
  assert.equal(words?.b, 10);
  assert.equal(words?.difference, 1);

  const wordLength = rows.find((row) => row.label === "Mean word length (letters)");
  assert.ok((wordLength?.difference ?? 0) > 0, "longer words in the second text");

  const sentenceLength = rows.find((row) => row.label === "Mean sentence length (words)");
  assert.ok((sentenceLength?.difference ?? 0) > 0);

  // A zero baseline reports no percentage rather than dividing by zero.
  const zero = compareProfiles(stylometricProfile(""), stylometricProfile(PLAIN));
  const zeroRow = zero.find((row) => row.label === "Mean sentence length (words)");
  assert.equal(zeroRow?.percentChange, null);
  assert.equal(zeroRow?.a, 0);
});

test("movingAverageTtr: fixed windows keep the measure comparable", () => {
  // Windows over [a,b,a,b,c] with size 3: 2/3, 2/3, 3/3 → mean 0.777…
  assert.equal(
    Math.round(movingAverageTtr(["a", "b", "a", "b", "c"], 3) * 1000) / 1000,
    0.778,
  );
  // A window wider than the text falls back to plain TTR: 2 unique of 3.
  assert.equal(movingAverageTtr(["a", "a", "b"], 5), 2 / 3);
  // More repetition lowers the measure, which is the whole point.
  const varied = movingAverageTtr(["a", "b", "c", "d", "e", "f", "g", "h"], 4);
  const repetitive = movingAverageTtr(["a", "a", "b", "a", "a", "b", "a", "a"], 4);
  assert.ok(varied > repetitive);
  assert.equal(movingAverageTtr([], 100), 0);
});

test("similarityBand: bands cover the range with an explanation each", () => {
  for (const value of [1, 0.97, 0.93, 0.85, 0.5]) {
    const band = similarityBand(value);
    assert.ok(band.label.length > 0);
    assert.ok(band.note.length > 20);
  }
  assert.equal(similarityBand(1).label, "Nearly identical profile");
  assert.equal(similarityBand(0.5).label, "Distinct profiles");
});
