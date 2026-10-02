import { test } from "node:test";
import assert from "node:assert/strict";
import { CLAIM_SHAPES, COUNTER_FRAMES, buildCounterarguments } from "./counterargument.ts";

test("CLAIM_SHAPES lists the six shapes and COUNTER_FRAMES the ten moves", () => {
  assert.deepEqual(CLAIM_SHAPES.map((shape) => shape.id), [
    "policy",
    "universal",
    "predictive",
    "causal",
    "comparative",
    "descriptive",
  ]);
  assert.equal(COUNTER_FRAMES.length, 10);
  assert.deepEqual(
    COUNTER_FRAMES.map((frame) => frame.id),
    [
      "boundary",
      "counterexample",
      "alternative-cause",
      "mechanism",
      "evidence-against",
      "base-rate",
      "trade-off",
      "timeline",
      "measurement",
      "definition",
    ],
  );
});

test("a universal claim is detected and its absolutes are surfaced", () => {
  const plan = buildCounterarguments(
    "Remote work always reduces informal knowledge sharing because teams are distributed.",
  );
  assert.equal(plan.shape, "universal");
  assert.equal(plan.shapeLabel, "Universal");
  assert.deepEqual(plan.absolutes, ["always"]);
  assert.deepEqual(plan.frames.filter((frame) => frame.featured).map((frame) => frame.id), [
    "boundary",
    "counterexample",
    "evidence-against",
    "definition",
  ]);
  assert.deepEqual(plan.checks, [
    "Absolute wording detected (always): a single exception refutes the claim as written, so a challenger will go straight for it.",
  ]);
  assert.equal(plan.frames[0].prompt.includes("Remote work always reduces"), true);
});

test("a policy claim is featured the trade-off and flagged for its missing reason", () => {
  const plan = buildCounterarguments("The city should ban cars from the centre.");
  assert.equal(plan.shape, "policy");
  assert.deepEqual(plan.frames.filter((frame) => frame.featured).map((frame) => frame.id), [
    "boundary",
    "trade-off",
    "timeline",
    "definition",
  ]);
  assert.deepEqual(plan.checks, [
    "The claim gives no reason. A counterargument has nothing to aim at until the claim says why it is supposed to be true.",
  ]);
});

test("a comparative claim needs than and is flagged for vague quantity", () => {
  const plan = buildCounterarguments("Most teams are more productive than before.");
  assert.equal(plan.shape, "comparative");
  assert.deepEqual(plan.vague, ["most"]);
  assert.deepEqual(plan.frames.filter((frame) => frame.featured).map((frame) => frame.id), [
    "base-rate",
    "measurement",
  ]);
  assert.equal(plan.checks.length, 2);
  assert.match(plan.checks[0], /Unquantified wording detected \(most\)/);
});

test("a causal claim is featured the alternative cause and the mechanism", () => {
  const plan = buildCounterarguments("Zoning caused the housing shortage.");
  assert.equal(plan.shape, "causal");
  assert.deepEqual(plan.frames.filter((frame) => frame.featured).map((frame) => frame.id), [
    "alternative-cause",
    "mechanism",
  ]);
});

test("buildCounterarguments limits the frames and asks for a claim", () => {
  const limited = buildCounterarguments("Zoning caused the housing shortage.", { limit: 3 });
  assert.equal(limited.frames.length, 3);
  assert.equal(limited.frames[0].id, "alternative-cause");

  const empty = buildCounterarguments("");
  assert.equal(empty.shape, "descriptive");
  assert.deepEqual(empty.checks, [
    "Write the claim you want to challenge; the frames below stay generic until there is a claim to answer.",
  ]);
  assert.equal(empty.frames[0].prompt.includes("this claim"), true);

  const tiny = buildCounterarguments("Cars bad");
  assert.ok(tiny.checks.some((check) => check.includes("under six words")));
});
