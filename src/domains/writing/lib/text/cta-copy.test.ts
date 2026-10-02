import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCtaVariants } from "./cta-copy.ts";

test("buildCtaVariants composes five variants from the parts", () => {
  const draft = buildCtaVariants({ verb: "Download", object: "the rota template", benefit: "start this week" });
  assert.deepEqual(draft.variants, [
    "Download the rota template",
    "Download the rota template and start this week",
    "Download the rota template — start this week.",
    "Your next step: Download the rota template.",
    "Ready to start this week? Download the rota template.",
  ]);
  assert.deepEqual(draft.words, [4, 8, 7, 7, 9]);
  assert.deepEqual(draft.checks, []);
});

test("buildCtaVariants asks for each missing part", () => {
  const draft = buildCtaVariants({ verb: "", object: "", benefit: "" });
  assert.deepEqual(draft.variants, []);
  assert.deepEqual(draft.checks.map((check) => check.id).sort(), ["benefit", "object", "verb"]);
});

test("buildCtaVariants flags a verb that asks for effort", () => {
  const draft = buildCtaVariants({ verb: "Submit", object: "the form", benefit: "get a call" });
  assert.ok(draft.checks.some((check) => check.id === "weak-verb" && check.message.includes('"Submit"')));
});

test("buildCtaVariants flags a label that became a sentence", () => {
  const object = "the very long template that nobody wants to read today";
  const draft = buildCtaVariants({ verb: "Download", object, benefit: "start this week" });
  assert.ok(draft.checks.some((check) => check.id === "long" && check.message.includes("Variant 1 runs 11 words")));
});
