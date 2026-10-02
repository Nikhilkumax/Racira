import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLOCK_QUOTE_WORDS,
  PREP_CHECKLIST,
  QUOTE_SHARE_LIMIT,
  preparePlagiarismCheck,
} from "./plagiarism-prep.ts";

test("the published thresholds and the submission checklist are fixed", () => {
  assert.equal(BLOCK_QUOTE_WORDS, 40);
  assert.equal(QUOTE_SHARE_LIMIT, 15);
  assert.equal(PREP_CHECKLIST.length, 5);
});

test("a cited quote and an uncited quote are told apart", () => {
  const result = preparePlagiarismCheck(
    'The report argues that "remote work cuts informal contact by a third" (Smith, 2021). It also claims that "hybrid teams keep contact only through scheduled meetings and lose the corridor conversations entirely".',
  );
  assert.deepEqual(result.counts, {
    words: 32,
    quotedWords: 22,
    quoteShare: 68.8,
    citations: 1,
    uncited: 1,
    longQuotes: 0,
    unbalanced: false,
  });
  assert.deepEqual(result.quotes.map((quote) => quote.cited), [true, false]);
  assert.deepEqual(result.checks, [
    "1 quotation has no citation in the same or the next sentence.",
    "Quoted material is 68.8% of the draft; even cited, past roughly 15% the quotations are doing the writing.",
  ]);
  assert.match(result.report, /1\. 8 words — cited/);
  assert.match(result.report, /2\. 14 words — NOT cited/);
});

test("an uncited quotation is flagged without a share warning on a short draft", () => {
  const result = preparePlagiarismCheck(
    'He said "we need to move fast in this market and not wait for the regulators to decide what is allowed, because waiting has never once paid off for us".',
  );
  assert.equal(result.counts.citations, 0);
  assert.equal(result.counts.unbalanced, false);
  assert.deepEqual(
    result.checks.map((check) => check.split(" ")[0]),
    ["1", "Quoted"],
  );
});

test("an unbalanced quotation mark is reported", () => {
  const result = preparePlagiarismCheck('He said "the plan is fine and the budget is settled.');
  assert.equal(result.counts.unbalanced, true);
  assert.ok(result.checks.some((check) => check.startsWith("Quotation marks do not balance")));
});

test("a quotation past the block threshold is called out", () => {
  const filler = Array.from({ length: 45 }, (_, index) => `word${index + 1}`).join(" ");
  const result = preparePlagiarismCheck(`She wrote "${filler}" (Jones, 2020).`);
  assert.equal(result.counts.longQuotes, 1);
  assert.equal(result.counts.quotedWords, 45);
  assert.ok(result.checks.some((check) => check.includes("past 40 words")));
});

test("an empty draft asks for text and reports no quotes", () => {
  const result = preparePlagiarismCheck("");
  assert.deepEqual(result.quotes, []);
  assert.deepEqual(result.checks, ["Paste the draft to check its quotations and prepare the submission."]);
  assert.equal(result.report, "No quotation marks found in this draft.");
});
