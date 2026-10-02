import { test } from "node:test";
import assert from "node:assert/strict";
import { PLOT_ANCHORS, planPlot } from "./plot-planner.ts";

const FULL = {
  logline: "A debt collector must return a house to the family she took it from before the bank sells it twice.",
  protagonist: "A debt collector working the same routes for nine years.",
  goal: "Return the house before the sale goes through.",
  conflict: "The bank that pays her salary wants the sale to close.",
  stakes: "If the sale closes, the family joins the waiting list she administers.",
};

test("the four premise facts are anchored to one beat each", () => {
  const plan = planPlot(FULL);
  assert.deepEqual(plan.checks, []);
  assert.equal(plan.structure.id, "three-act");
  assert.equal(plan.stats.beats, 7);
  assert.equal(plan.stats.anchored, 4);
  assert.equal(plan.stats.filled, 4);
  assert.deepEqual(
    plan.points.filter((point) => point.anchor).map((point) => [point.beat, point.anchor]),
    [
      ["Hook", "protagonist"],
      ["Inciting incident", "goal"],
      ["Midpoint", "conflict"],
      ["Second plot point", "stakes"],
    ],
  );
});

test("each anchor is written into its beat's line of the plan", () => {
  const plan = planPlot(FULL);
  assert.match(plan.output, /1\. Hook \(0%\)\n   A debt collector working the same routes/);
  assert.match(plan.output, /4\. Midpoint \(50%\)\n   The bank that pays her salary/);
  assert.match(plan.output, /Three-act structure — A debt collector must return a house/);
  assert.match(plan.output, /\(to draft\) The character commits to the journey/);
});

test("anchored beats are distinct and ordered down the plan", () => {
  const plan = planPlot(FULL);
  const anchored = plan.points.filter((point) => point.anchor);
  assert.equal(new Set(anchored.map((point) => point.index)).size, PLOT_ANCHORS.length);
  assert.deepEqual(
    anchored.map((point) => point.at),
    [0, 10, 50, 75],
  );
});

test("switching structure keeps the same four anchors on the new beats", () => {
  const plan = planPlot({ ...FULL, structure: "hero-journey" });
  assert.equal(plan.structure.id, "hero-journey");
  assert.equal(plan.stats.beats, 12);
  assert.equal(plan.stats.anchored, 4);
  assert.equal(new Set(plan.points.filter((point) => point.anchor).map((point) => point.index)).size, 4);
});

test("an unknown structure falls back to three-act", () => {
  const plan = planPlot({ ...FULL, structure: "five-act" });
  assert.equal(plan.structure.id, "three-act");
  assert.equal(plan.stats.beats, 7);
});

test("missing facts are named as missing, and a one-word conflict is called out", () => {
  const plan = planPlot({ logline: "Too short", conflict: "rain" });
  assert.equal(plan.checks.length, 5);
  assert.ok(plan.checks.includes("The logline is 2 words; under eight it states a topic rather than a story."));
  assert.ok(plan.checks.includes("No protagonist; a structure is a shape for someone's story."));
  assert.ok(plan.checks.includes("No goal; without something wanted, the inciting incident has nothing to incite."));
  assert.ok(
    plan.checks.includes("The conflict is 1 word; name the force that pushes back, not just the trouble."),
  );
  assert.ok(plan.checks.includes("No stakes; the second turning point needs a cost the reader can measure."));
});

test("an empty premise produces a full draft-ready plan with checks only", () => {
  const plan = planPlot();
  assert.equal(plan.points.length, 7);
  assert.equal(plan.stats.filled, 0);
  assert.match(plan.output, /\(to draft\)/);
  assert.equal(plan.checks.length, 5);
});
