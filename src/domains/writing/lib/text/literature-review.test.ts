import { test } from "node:test";
import assert from "node:assert/strict";
import { STANCES, SYNTHESIS_PROMPTS, organizeLiteratureReview } from "./literature-review.ts";

const SAMPLE =
  "Smith (2021) | remote work cuts informal contact by a third | supports\nJones (2019) | no measurable effect on knowledge sharing | challenges\nAli et al. (2022) | extends the finding to hybrid teams | extends\nBrown | hybrid teams were not studied";

test("the stances and the synthesis prompts are published", () => {
  assert.deepEqual(STANCES.map((stance) => stance.id), ["supports", "challenges", "extends"]);
  assert.equal(SYNTHESIS_PROMPTS.length, 4);
});

test("sources are parsed, dated and grouped by stance", () => {
  const plan = organizeLiteratureReview(SAMPLE);
  assert.deepEqual(plan.counts, { total: 4, withYear: 3, withStance: 3 });
  assert.deepEqual(
    plan.groups.map((group) => [group.id, group.sources.length]),
    [
      ["supports", 1],
      ["challenges", 1],
      ["extends", 1],
      ["unstanced", 1],
    ],
  );
  assert.equal(plan.sources[0].year, 2021);
  assert.equal(plan.sources[3].year, null);
});

test("the scaffold names each group and lists its sources", () => {
  const plan = organizeLiteratureReview(SAMPLE);
  assert.equal(
    plan.scaffold,
    "Agrees — The evidence consistently shows\n  - Smith (2021): remote work cuts informal contact by a third\n\nDisagrees — This agreement is not universal:\n  - Jones (2019): no measurable effect on knowledge sharing\n\nExtends — Beyond this, the literature extends the question:\n  - Ali et al. (2022): extends the finding to hybrid teams\n\nUnstanced — These sources have no stated position yet:\n  - Brown: hybrid teams were not studied",
  );
});

test("a source with no year is named", () => {
  const plan = organizeLiteratureReview(SAMPLE);
  assert.deepEqual(plan.checks, ["1 source has no year: Brown."]);
});

test("a list where everything agrees is flagged for having no tension", () => {
  const plan = organizeLiteratureReview(
    "A (2020) | agrees with the consensus | supports\nB (2021) | also agrees | supports\nC (2022) | agrees too | supports",
  );
  assert.deepEqual(plan.checks, [
    "2 findings are under four words: too thin to synthesise later.",
    "No source disagrees with any other; a review with no tension reads as an annotated bibliography.",
  ]);
});

test("the stance falls back to the finding text", () => {
  const plan = organizeLiteratureReview("D (2018) | the result contradicts the earlier study");
  assert.equal(plan.sources[0].stance, "challenges");
});

test("duplicate citations and missing findings are reported", () => {
  const plan = organizeLiteratureReview(
    "Smith (2021) | a finding with enough words in it\nSmith (2021) | another finding with enough words\nJones (2020)",
  );
  assert.ok(plan.checks.some((check) => check.startsWith("Duplicate citation")));
  assert.ok(plan.checks.some((check) => check.includes("no finding recorded")));
});

test("empty input asks for the line format", () => {
  const plan = organizeLiteratureReview("   ");
  assert.deepEqual(plan.sources, []);
  assert.equal(plan.scaffold, "");
  assert.deepEqual(plan.checks, ["Paste one source per line as citation | finding | stance."]);
});
