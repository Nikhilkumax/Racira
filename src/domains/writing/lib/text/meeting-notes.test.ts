/**
 * Unit tests for the meeting-notes cue scan.
 *
 * The known positives cover each category and both label forms; the near-misses
 * pin the two places a cue list typically over-fires (a label without its colon,
 * and a sentence that mentions a word without the phrase) so the published cue
 * lists stay honest.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACTION_CUES,
  DECISION_CUES,
  LABELS,
  QUESTION_CUES,
  formatMeetingSummary,
  summarizeMeeting,
} from "./meeting-notes.ts";

const NOTES = [
  "We reviewed the launch plan and the current numbers.",
  "Decision: we ship the beta on the fifteenth.",
  "Action: Sam will send the pricing deck by Friday.",
  "Should we keep the old landing page?",
  "Open question: who owns the migration?",
  "The coffee machine was repaired.",
  "We agreed to postpone the second announcement.",
].join(" ");

test("summarizeMeeting: each category gets its sentences, counted once", () => {
  const result = summarizeMeeting(NOTES);
  assert.equal(result.counts.decision, 2, "the label and the agreed phrase");
  assert.equal(result.counts.action, 1);
  assert.equal(result.counts.question, 2, "the trailing question mark and the label");
  assert.equal(result.items.length, 5);
  assert.equal(result.unclassified.length, 2);
  assert.ok(result.unclassified.every((row) => !row.text.includes("Decision:")));
  assert.equal(result.sentences, 7);
});

test("summarizeMeeting: cue lists are published, non-empty and lower-case", () => {
  for (const cue of [...ACTION_CUES, ...DECISION_CUES, ...QUESTION_CUES]) {
    assert.equal(cue, cue.toLocaleLowerCase(), `${cue} is stored lower-case`);
    assert.ok(cue.length >= 3);
  }
  assert.ok(LABELS.every((entry) => entry.label.endsWith(":")));
});

test("summarizeMeeting: labels need their colon and cues need their phrase", () => {
  const nearMisses = summarizeMeeting(
    "The decision tree was updated. The question mark was typed twice. We discussed the deadline. The action was logged.",
  );
  assert.equal(nearMisses.counts.decision, 0);
  assert.equal(nearMisses.counts.question, 0);
  assert.equal(nearMisses.counts.action, 0);
  assert.equal(nearMisses.unclassified.length, 4);
});

test("summarizeMeeting: owner and due are suggestions from two documented patterns", () => {
  const result = summarizeMeeting("Action: Sam will send the deck by Friday.");
  assert.equal(result.items[0].category, "action");
  assert.equal(result.items[0].owner, "Sam");
  assert.equal(result.items[0].due, "Friday");

  // A capitalised "Owner:" makes the sentence boundary unambiguous; the shared
  // segmenter keeps "draft. owner" together as an abbreviation-shaped span.
  const labelled = summarizeMeeting("Action: review the draft. Owner: Priya");
  assert.equal(labelled.items.length, 2);
  assert.equal(labelled.items[1].owner, "Priya");
  assert.equal(labelled.items[1].category, "action");
  assert.equal(labelled.items[0].due, null);
});

test("summarizeMeeting: a sentence lands in exactly one category", () => {
  const result = summarizeMeeting("Action: we agreed to decide the timeline by Monday.");
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].category, "action", "the explicit label wins over the decision cue");
});

test("formatMeetingSummary: sections, counts and the disclaimer are all present", () => {
  const report = formatMeetingSummary(summarizeMeeting(NOTES));
  assert.ok(report.includes("DECISIONS"));
  assert.ok(report.includes("ACTIONS"));
  assert.ok(report.includes("OPEN QUESTIONS"));
  assert.ok(report.includes("UNCLASSIFIED"));
  assert.ok(report.includes("not comprehension"));
  assert.ok(report.includes("Sam will send"));
});

test("summarizeMeeting: empty input produces empty sections", () => {
  const result = summarizeMeeting("");
  assert.deepEqual(result.items, []);
  assert.deepEqual(result.unclassified, []);
  assert.equal(result.sentences, 0);
  assert.equal(formatMeetingSummary(result).includes("(none)"), true);
});
