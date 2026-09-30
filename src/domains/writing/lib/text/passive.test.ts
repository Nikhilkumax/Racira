/**
 * Unit tests for the passive-voice heuristic.
 *
 * The tests pin the four shapes the detector must handle — irregular
 * participle, regular -ed participle, adverb between auxiliary and participle,
 * and a by-agent that raises confidence — plus its two documented false
 * positives (adjectival participles, which are still flagged).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { findPassives, passiveSummary } from "./passive.ts";

test("detects an irregular participle with a by-agent as a strong hit", () => {
  const hits = findPassives("The report was written by the analyst.");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].auxiliary, "was");
  assert.equal(hits[0].participle, "written");
  assert.equal(hits[0].confidence, "strong");
  assert.equal(hits[0].phrase, "was written");
});

test("detects a regular -ed participle without an agent as a candidate", () => {
  const hits = findPassives("The ball was thrown.");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].participle, "thrown");
  assert.equal(hits[0].confidence, "candidate");
});

test("looks past an adverb between the auxiliary and the participle", () => {
  const hits = findPassives("The report was quickly written.");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].phrase, "was written");
});

test("treats a perfect-tense been + participle as passive", () => {
  const hits = findPassives("The forms have been sent.");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].auxiliary, "been");
  assert.equal(hits[0].participle, "sent");
});

test("flags an adjectival participle — a documented false positive", () => {
  const hits = findPassives("The door is closed.");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].participle, "closed");
});

test("an active sentence produces no hits", () => {
  assert.equal(findPassives("She wrote the report and sent it.").length, 0);
  assert.equal(findPassives("The team finished early.").length, 0);
});

test("does not treat a bare auxiliary as passive", () => {
  assert.equal(findPassives("The cat is hungry.").length, 0);
  assert.equal(findPassives("We were there.").length, 0);
});

test("summary reports the share of sentences and the worst offenders", () => {
  const summary = passiveSummary("The ball was thrown. She ran home. The rules were broken by the council.");
  assert.equal(summary.sentences, 3);
  assert.equal(summary.hits.length, 2);
  assert.equal(summary.sentencesWithPassive, 2);
  assert.equal(summary.shareOfSentences, 2 / 3);
  assert.equal(summary.strongCount, 1);
  assert.equal(summary.candidateCount, 1);
  assert.equal(summary.worst[0].hits, 1);
  assert.equal(summary.worst.length, 2);
});

test("empty text yields an empty summary", () => {
  const summary = passiveSummary("");
  assert.equal(summary.sentences, 0);
  assert.equal(summary.hits.length, 0);
  assert.equal(summary.shareOfSentences, 0);
});
