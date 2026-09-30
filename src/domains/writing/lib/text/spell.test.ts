/**
 * Unit tests for the spell-checking scanner.
 *
 * The engine is dictionary-agnostic, so these tests inject a tiny fake checker:
 * that keeps them deterministic and lets them assert the *scanner's* behaviour
 * (which tokens are looked up, how failures are grouped, where a hyphenated
 * error is located) rather than nspell's word knowledge. The real nspell +
 * dictionary-en pair is exercised in `spell-dictionary.test.ts`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  checkSpelling,
  formatSpellReport,
  normalizeForLookup,
  spellTokens,
  type SpellChecker,
} from "./spell.ts";

const WORDS = new Set([
  "a",
  "and",
  "cat",
  "check",
  "clean",
  "hello",
  "here",
  "in",
  "it's",
  "known",
  "mail",
  "mat",
  "on",
  "or",
  "receive",
  "right",
  "run",
  "sat",
  "see",
  "self",
  "sentence",
  "set",
  "the",
  "well",
  "with",
  "world",
]);

const SUGGESTIONS: Record<string, string[]> = {
  recieve: ["receive"],
  teh: ["the", "ten"],
  knwon: ["known"],
  helllo: ["hello"],
  wordl: ["world"],
  sentnce: ["sentence"],
};

const fake: SpellChecker = {
  correct: (word) => WORDS.has(word),
  suggest: (word) => SUGGESTIONS[word] ?? [],
};

test("scans word tokens with offsets and keeps accents in one token", () => {
  const tokens = spellTokens("Hello, naïve co-operation.");
  assert.deepEqual(
    tokens.map((token) => token.word),
    ["Hello", "naïve", "co-operation"],
  );
  assert.equal(tokens[0].start, 0);
  assert.equal(tokens[0].end, 5);
  assert.equal(tokens[1].nonLatin, false);
  assert.equal(tokens[2].hasHyphen, true);
  assert.equal(normalizeForLookup("Naïve"), "naïve");
});

test("straightens curly apostrophes before lookup", () => {
  const [token] = spellTokens("don’t");
  assert.equal(token.normalized, "don't");
  assert.equal(token.hasHyphen, false);
});

test("treats non-Latin scripts as out of scope rather than unknown", () => {
  const report = checkSpelling("Привет мир and hello", fake);
  assert.equal(report.tokens, 4);
  assert.equal(report.latinTokens, 2);
  assert.equal(report.skipped, 2);
  assert.equal(report.checked, 2);
  assert.equal(report.uniqueUnknown, 0);
});

test("skips acronyms, digit-bearing and camel-case tokens by default", () => {
  const report = checkSpelling("The API and NASA run on utf8 with iPhone", fake);
  assert.equal(report.uniqueUnknown, 0);
  assert.equal(report.skipped, 4);

  const strict = checkSpelling("The API and NASA run on utf8 with iPhone", fake, {
    ignoreAcronyms: false,
    ignoreNumbers: false,
    ignoreInnerCapitals: false,
  });
  assert.deepEqual(
    strict.misspellings.map((entry) => entry.word).sort(),
    ["API", "NASA", "iPhone", "utf8"],
  );
});

test("skips URLs, e-mail addresses, file names, snake_case and backticked code", () => {
  const text =
    "See https://example.com/foo.tsx or mail jo@example.com, run _scripts/writing-reconcile.mjs, set MAX_RETRIES in `spellCheck(word)` — hello.";
  const report = checkSpelling(text, fake);
  assert.equal(report.uniqueUnknown, 0);
  assert.ok(report.skipped >= 5);
});

test("accepts a hyphenated compound when both parts are known", () => {
  const report = checkSpelling("A well-known self-check here.", fake);
  assert.equal(report.uniqueUnknown, 0);
});

test("locates the failing part of a hyphenated compound", () => {
  const report = checkSpelling("A well-knwon self-check.", fake);
  assert.equal(report.uniqueUnknown, 1);
  assert.equal(report.misspellings[0].word, "knwon");
  assert.equal(report.misspellings[0].start, 7);
  assert.deepEqual(report.misspellings[0].suggestions, ["known"]);
});

test("reports a whole apostrophised token instead of splitting it", () => {
  const allowed = checkSpelling("The doesnt matter.", fake, { allow: ["doesnt", "matter"] });
  assert.equal(allowed.uniqueUnknown, 0);

  const flagged = checkSpelling("The doesnt matter.", { correct: () => false, suggest: () => [] });
  assert.deepEqual(
    flagged.misspellings.map((entry) => entry.word),
    ["The", "doesnt", "matter"],
  );
});

test("groups repeated spellings with a count and up to twelve offsets", () => {
  const report = checkSpelling("teh cat and teh cat and teh cat", fake);
  assert.equal(report.uniqueUnknown, 1);
  assert.equal(report.totalUnknown, 3);
  assert.equal(report.misspellings[0].count, 3);
  assert.deepEqual(report.misspellings[0].occurrences, [0, 12, 24]);
  assert.deepEqual(report.misspellings[0].suggestions, ["the", "ten"]);
});

test("stops computing suggestions at the budget and says so", () => {
  const report = checkSpelling("recieve teh helllo wordl sentnce", fake, { suggestionBudget: 2 });
  assert.equal(report.uniqueUnknown, 5);
  assert.equal(report.suggestBudget, 2);
  assert.equal(report.suggestSkipped, 3);
  assert.deepEqual(report.misspellings[0].suggestions, ["receive"]);
  assert.equal(report.misspellings[2].suggestionsSkipped, true);
});

test("honours the allow list and the reporting cap", () => {
  const allowed = checkSpelling("recieve teh", fake, { allow: ["recieve", "TEH"] });
  assert.equal(allowed.uniqueUnknown, 0);
  assert.equal(allowed.skipped, 2);

  const capped = checkSpelling("recieve teh helllo wordl sentnce", fake, { maxReported: 3 });
  assert.equal(capped.uniqueUnknown, 5);
  assert.equal(capped.misspellings.length, 3);
});

test("counts tokens that were actually looked up", () => {
  const report = checkSpelling("The cat sat on the mat. A well-known hello.", fake);
  assert.equal(report.tokens, 8);
  assert.equal(report.skipped, 0);
  assert.equal(report.checked, 8);
  assert.equal(report.uniqueUnknown, 0);
});

test("formats a report for copying and downloading", () => {
  const clean = checkSpelling("Hello world", fake);
  assert.equal(formatSpellReport(clean), "No unknown words. 2 words checked against the dictionary.");

  const report = checkSpelling("recieve teh", fake);
  const text = formatSpellReport(report);
  assert.match(text, /Unknown words: 2 distinct, 2 occurrences/);
  assert.match(text, /recieve ×1 → receive/);
  assert.match(text, /teh ×1 → the, ten/);
});

test("formats the suggestion-budget note", () => {
  const report = checkSpelling("recieve teh helllo", fake, { suggestionBudget: 1 });
  assert.match(formatSpellReport(report), /Suggestions were computed for the first 1 unknown words\./);
});
