/**
 * Unit tests for the extractive summariser.
 *
 * The engine is scored, not generated, so the tests pin properties that a
 * reader can check: every returned sentence is verbatim source text, the
 * highest score is 1.000 by construction, a sentence that shares its content
 * words with the rest of the text outranks an unrelated one on centrality, and
 * selection sizes come from the requested percentage, sentence count or word
 * budget. Determinism is tested explicitly: two calls must be deep-equal.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SUMMARY_METHOD,
  formatSummaryReport,
  formatTldrReport,
  keyPoints,
  summarize,
  termWeights,
  tldr,
} from "./summarize.ts";

const RIVER = [
  "The river flooded the village after three days of rain.",
  "The river flooded the fields on the eastern bank.",
  "The river flooded the road to the bridge.",
  "Bananas are a yellow fruit grown in warm places.",
].join(" ");

test("termWeights: counts, log weights and ordering", () => {
  const terms = termWeights("cats cats dogs");
  assert.equal(terms.length, 2);
  assert.equal(terms[0].term, "cats");
  assert.equal(terms[0].count, 2);
  assert.ok(Math.abs(terms[0].weight - (1 + Math.log(2))) < 1e-12);
  assert.equal(terms[1].term, "dogs");
  assert.equal(terms[1].weight, 1);
});

test("summarize: every selected sentence is verbatim source text", () => {
  const result = summarize(RIVER, { targetSentences: 2 });
  assert.equal(result.selected.length, 2);
  for (const sentence of result.selected) {
    assert.ok(RIVER.includes(sentence.text), `"${sentence.text}" is not in the source`);
  }
  assert.ok(result.selected[0].index < result.selected[1].index, "selection keeps document order");
});

test("summarize: the best sentence scores 1.000 and ranks are unique", () => {
  const result = summarize(RIVER);
  const scores = result.sentences.map((sentence) => sentence.score);
  assert.equal(Math.max(...scores), 1);
  const ranks = result.sentences.map((sentence) => sentence.rank).sort((a, b) => a - b);
  assert.deepEqual(ranks, result.sentences.map((_, index) => index + 1));
});

test("summarize: centrality reflects shared content words, not position alone", () => {
  const result = summarize(RIVER, { targetSentences: 1 });
  const scores = new Map(result.sentences.map((sentence) => [sentence.index, sentence]));
  // The three river sentences share their topic; the banana sentence shares none.
  const riverCentrality = [0, 1, 2].map((index) => scores.get(index)!.centrality);
  const bananaCentrality = scores.get(3)!.centrality;
  assert.equal(Math.max(...riverCentrality), 1, "the best-connected sentence is normalised to 1");
  assert.ok(bananaCentrality < Math.max(...riverCentrality) / 2, "no shared words means low centrality");
  assert.ok(scores.get(3)!.score < Math.max(...[0, 1, 2].map((index) => scores.get(index)!.score)));
  assert.ok([0, 1, 2].includes(result.selected[0].index), "the single slot goes to a river sentence");
});

test("summarize: percentage, sentence count and word budget each drive the size", () => {
  const tenSentences = Array.from({ length: 10 }, (_, index) => `Sentence number ${index + 1} carries a few words here.`).join(" ");
  assert.equal(summarize(tenSentences, { targetPercent: 20 }).selected.length, 2);
  assert.equal(summarize(tenSentences, { targetPercent: 20 }).targetSentences, 2);
  assert.equal(summarize(tenSentences, { targetSentences: 3 }).selected.length, 3);
  const budgeted = summarize(tenSentences, { maxWords: 9 });
  assert.ok(budgeted.selected.length >= 1);
  assert.ok(budgeted.selectedWords <= 9, `budget respected, got ${budgeted.selectedWords} words`);
});

test("summarize: coverage is a percentage of key-term weight and stays in range", () => {
  const result = summarize(RIVER, { targetSentences: 3 });
  assert.ok(result.coveragePercent >= 0 && result.coveragePercent <= 100);
  assert.ok(result.coveragePercent > 50, "three of four sentences should carry most key terms");
  assert.ok(result.compressionPercent > 0 && result.compressionPercent < 100);
  assert.equal(result.method, SUMMARY_METHOD);
});

test("summarize: empty, whitespace and single-sentence inputs", () => {
  const empty = summarize("");
  assert.deepEqual(empty.selected, []);
  assert.deepEqual(empty.sentences, []);
  assert.equal(empty.words, 0);
  assert.equal(empty.coveragePercent, 0);

  assert.deepEqual(summarize("   \n  ").selected, []);

  const single = summarize("Only one sentence exists here.");
  assert.equal(single.selected.length, 1);
  assert.equal(single.selected[0].text, "Only one sentence exists here.");
  assert.equal(single.compressionPercent, 100);
});

test("summarize: unicode and emoji survive extraction", () => {
  const text = "Le café était plein. Les gâteaux coûtaient 3 € pièce. 🚀 La fusée a décollé tard.";
  const result = summarize(text, { targetSentences: 1 });
  assert.equal(result.selected.length, 1);
  assert.ok(text.includes(result.selected[0].text));
  assert.ok(result.words >= 10);
});

test("summarize: two calls produce identical results", () => {
  const first = summarize(RIVER, { targetSentences: 2 });
  const second = summarize(RIVER, { targetSentences: 2 });
  assert.deepEqual(first, second);
});

test("keyPoints: ranked bullets carry their evidence", () => {
  const result = keyPoints(RIVER, { limit: 2 });
  assert.equal(result.points.length, 2);
  assert.equal(result.points[0].rank, 1);
  assert.equal(result.points[1].rank, 2);
  assert.ok(result.points[0].score >= result.points[1].score);
  assert.ok(result.points[0].terms.length > 0);
  assert.equal(result.sentences, 4);
  assert.ok(result.keyTerms.length > 0);
  assert.ok(result.keyTerms[0].count >= result.keyTerms[result.keyTerms.length - 1].count);
});

test("tldr: respects the character cap and the sentence cap", () => {
  const result = tldr(RIVER, { maxCharacters: 120, maxSentences: 2 });
  assert.ok(result.sentences.length >= 1 && result.sentences.length <= 2);
  assert.ok(result.characters <= 120);
  assert.equal(result.overBudget, false);
  assert.equal(result.text, result.sentences.map((sentence) => sentence.text).join(" "));
  assert.ok(result.compressionPercent > 0 && result.compressionPercent < 100);
});

test("tldr: an impossible cap returns the best sentence and says so", () => {
  const sentence = "This single sentence is far longer than any short character cap could ever hold.";
  const result = tldr(sentence, { maxCharacters: 40, maxSentences: 1 });
  assert.equal(result.sentences.length, 1);
  assert.equal(result.overBudget, true);
  assert.ok(result.characters > 40);
});

test("formatSummaryReport and formatTldrReport label the output extractive", () => {
  const summary = formatSummaryReport(summarize(RIVER, { targetSentences: 2 }));
  assert.ok(summary.includes("Extractive summary"));
  assert.ok(summary.includes("sentences taken from the source"));

  const brief = formatTldrReport(tldr(RIVER, { maxCharacters: 120 }));
  assert.ok(brief.includes("TL;DR:"));
  assert.ok(brief.includes("Method:"));
});
