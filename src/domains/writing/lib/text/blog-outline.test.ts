import { test } from "node:test";
import assert from "node:assert/strict";
import { buildBlogOutline } from "./blog-outline.ts";

const FULL = {
  title: "How to run a support desk without burning out",
  audience: "new support leads",
  takeaways: ["Hire for patience before speed", "Rotate the on-call rota weekly", "Write the bug report you want to receive"],
  cta: "Download the rota template",
};

test("buildBlogOutline numbers the points between an introduction and a conclusion", () => {
  const draft = buildBlogOutline(FULL);
  assert.equal(draft.words, 100);
  assert.equal(draft.sections, 5);
  assert.deepEqual(draft.checks, []);
  assert.ok(draft.outline.startsWith("Working title: How to run a support desk without burning out\n\nFor: new support leads"));
  assert.ok(draft.outline.includes("1. Hire for patience before speed"));
  assert.ok(draft.outline.includes("3. Write the bug report you want to receive"));
  assert.ok(draft.outline.includes("Conclusion — restate the promise and hand off to the next step."));
  assert.ok(draft.outline.endsWith("CTA: Download the rota template"));
});

test("buildBlogOutline flags the missing parts", () => {
  const draft = buildBlogOutline({ title: "", audience: "", takeaways: [], cta: "" });
  const ids = draft.checks.map((check) => check.id).sort();
  assert.deepEqual(ids, ["audience", "cta", "takeaways", "title"]);
});

test("buildBlogOutline caps the point count and the title", () => {
  const draft = buildBlogOutline({
    ...FULL,
    title: "one two three four five six seven eight nine ten eleven twelve thirteen",
    takeaways: ["a", "b", "c", "d", "e", "f", "g", "h"],
  });
  assert.ok(draft.checks.some((check) => check.id === "title-long" && check.message.includes("13 words")));
  assert.ok(draft.checks.some((check) => check.id === "takeaways-many"));
});

test("buildBlogOutline flags a takeaway that became a paragraph", () => {
  const long = Array.from({ length: 21 }, (_, index) => `word${index + 1}`).join(" ");
  const draft = buildBlogOutline({ ...FULL, takeaways: [long, "short", "also short"] });
  assert.ok(draft.checks.some((check) => check.id === "takeaway-long" && check.message.includes("21 words")));
});
