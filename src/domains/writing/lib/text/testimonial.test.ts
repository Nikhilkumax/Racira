import { test } from "node:test";
import assert from "node:assert/strict";
import { LONG_QUOTE_WORDS, SLIDE_QUOTE_WORDS, VAGUE_PHRASES, formatTestimonials } from "./testimonial.ts";

const SET = [
  "The kettle holds 70 degrees for a whole pot of green tea | Maya Chen | tea buyer",
  "Great service and highly recommend this to anyone who loves tea | Sam Ortiz |",
  "I measured the temperature with a probe thermometer and it was within one degree across four sessions, which is why I stopped using my old kettle for green tea entirely | Priya Raman | cafe owner",
  "The kettle holds 70 degrees and my second pot tastes as good as the first | Alex Doe | writer",
].join("\n");

test("the thresholds and the vague list are fixed", () => {
  assert.equal(LONG_QUOTE_WORDS, 50);
  assert.equal(SLIDE_QUOTE_WORDS, 20);
  assert.ok(VAGUE_PHRASES.includes("highly recommend"));
});

test("a mixed set is formatted, graded and checked", () => {
  const result = formatTestimonials(SET);
  assert.deepEqual(result.counts, { total: 4, attributed: 4, slideReady: 3, withResult: 2 });
  assert.deepEqual(result.checks, [
    '1 quote uses phrasing that could describe any business ("Great service and highly recommend this to anyone who loves …"); ask for the specific before-and-after instead.',
    "1 pair of testimonials open with the same words; vary the order so a wall does not read as one voice.",
  ]);
  assert.match(result.formatted, /^"The kettle holds 70 degrees for a whole pot of green tea"\n— Maya Chen, tea buyer/m);
  assert.match(result.slideReady, /"The kettle holds 70 degrees for a whole pot of green tea" — Maya Chen/);
  assert.match(result.pullQuote, /^"I measured the temperature/);
});

test("an unattributed quote and a thin set are named", () => {
  const result = formatTestimonials(
    ["Best kettle I have owned | |", "It works well for green tea | |"].join("\n"),
  );
  assert.equal(result.counts.attributed, 0);
  assert.ok(result.checks.includes("2 testimonials; three to six is the range that reads as a pattern rather than a favour."));
  assert.ok(result.checks.includes("2 testimonials have no name attached; a quote without attribution is an assertion."));
});

test("a long quote and a set with no short quote are flagged", () => {
  const long = Array.from({ length: 51 }, (_, index) => `word${index + 1}`).join(" ");
  const result = formatTestimonials(
    [`${long} | Maya Chen | tea buyer`, `Another ${long} | Sam Ortiz | writer`].join("\n"),
  );
  assert.ok(result.checks.some((check) => check === "2 quotes run past 50 words; cut to the sentence that carries the result."));
  assert.ok(
    result.checks.some((check) =>
      check === "No quote is under 20 words; the carousel needs one short, specific line to lead with.",
    ),
  );
});

test("an empty set asks for lines", () => {
  const result = formatTestimonials("");
  assert.deepEqual(result.counts, { total: 0, attributed: 0, slideReady: 0, withResult: 0 });
  assert.deepEqual(result.checks, ["No testimonials yet. Paste one per line as quote | name | role."]);
});
