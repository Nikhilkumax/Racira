import { test } from "node:test";
import assert from "node:assert/strict";
import { FORMALITY_PAIRS, adjustFormality, scoreFormality } from "./formality-adjuster.ts";

const CASUAL =
  "We need to figure out the budget, and the boss will look into the kids' programme. I think we can't start right away.";
const FORMAL = "We require sufficient funds to establish the programme. Moreover, we cannot commence immediately.";

test("every pair has both a casual and a formal side", () => {
  assert.ok(FORMALITY_PAIRS.length > 40);
  for (const pair of FORMALITY_PAIRS) {
    assert.ok(pair.casual.length > 0);
    assert.ok(pair.formal.length > 0);
    assert.notEqual(pair.casual.toLowerCase(), pair.formal.toLowerCase());
  }
});

test("the formal direction raises the register and lists every change", () => {
  const result = adjustFormality(CASUAL, "formal");
  assert.equal(result.direction, "formal");
  assert.equal(result.words, 23);
  assert.equal(result.casualMarkers, 10);
  assert.equal(result.formalMarkers, 0);
  assert.equal(result.score, 0);
  assert.equal(result.label, "Informal");
  assert.equal(
    result.output,
    "We require to determine the budget, and the supervisor will investigate the children's programme. I believe we cannot commence immediately.",
  );
  assert.ok(result.changes.some((change) => change.from === "kids'" && change.to === "children's"));
  assert.equal(result.changes.length, 9);
});

test("the casual direction lowers the register", () => {
  const result = adjustFormality(FORMAL, "casual");
  assert.equal(result.direction, "casual");
  assert.equal(result.score, 100);
  assert.equal(result.label, "Formal");
  assert.equal(
    result.output,
    "We need enough money to set up the programme. Besides, we can't start right away.",
  );
});

test("a possessive keeps its apostrophe in both directions", () => {
  assert.match(adjustFormality("The kids' club meets today.", "formal").output, /children's club/);
  assert.match(adjustFormality("The funds' growth was slow.", "casual").output, /money's growth/);
});

test("a plural form is left alone: the table matches whole phrases only", () => {
  assert.equal(adjustFormality("The supervisors meet today.", "casual").output, "The supervisors meet today.");
});

test("text already in the target register still scores, with no changes", () => {
  const result = adjustFormality("We need money.", "casual");
  assert.equal(result.changes.length, 0);
  assert.equal(result.output, "We need money.");
  assert.ok(result.casualMarkers >= 1);
});

test("empty input scores balanced", () => {
  const score = scoreFormality("");
  assert.equal(score.score, 50);
  assert.equal(score.label, "Neutral");
  assert.equal(score.words, 0);
  assert.equal(adjustFormality("", "formal").changes.length, 0);
});
