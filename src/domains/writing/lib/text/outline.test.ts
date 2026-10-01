/**
 * Unit tests for the outline engine: parsing indented text into a tree, the
 * shape summary, and the three renderings.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  outlineStats,
  outlineToIndentedText,
  parseOutline,
  renderOutlineMarkdown,
  renderOutlineNumbered,
} from "./outline.ts";

const SOURCE = ["Intro", "  Background", "    Detail", "  Method", "Conclusion"].join("\n");

test("parseOutline builds a tree from indentation, without skipping levels", () => {
  const tree = parseOutline(SOURCE);
  assert.equal(tree.length, 2);
  assert.equal(tree[0].text, "Intro");
  assert.equal(tree[0].children.length, 2);
  assert.equal(tree[0].children[0].text, "Background");
  assert.equal(tree[0].children[0].children[0].text, "Detail");
  assert.equal(tree[1].text, "Conclusion");
});

test("parseOutline accepts markdown bullets and tabs, and never skips a level", () => {
  const tree = parseOutline("- Intro\n\t- Background\n        - Jumped\n");
  assert.equal(tree.length, 1);
  assert.equal(tree[0].children.length, 1);
  // A double-indent can only descend one level at a time.
  assert.equal(tree[0].children[0].text, "Background");
  assert.equal(tree[0].children[0].children[0].text, "Jumped");
});

test("outlineStats reports the count and the population of each level", () => {
  const stats = outlineStats(parseOutline(SOURCE));
  assert.equal(stats.count, 5);
  assert.equal(stats.maxDepth, 3);
  assert.deepEqual(stats.byLevel, [2, 2, 1]);
});

test("renderOutlineMarkdown and outlineToIndentedText", () => {
  assert.equal(
    renderOutlineMarkdown(parseOutline(SOURCE)),
    "- Intro\n  - Background\n    - Detail\n  - Method\n- Conclusion",
  );
  assert.equal(outlineToIndentedText(parseOutline(SOURCE)), "Intro\n  Background\n    Detail\n  Method\nConclusion");
});

test("renderOutlineNumbered: decimal and classic schemes", () => {
  const tree = parseOutline(SOURCE);
  assert.equal(renderOutlineNumbered(tree, "decimal"), "1. Intro\n  1.1 Background\n    1.1.1 Detail\n  1.2 Method\n2. Conclusion");
  assert.equal(renderOutlineNumbered(tree, "classic"), "I. Intro\n  A. Background\n    1. Detail\n  B. Method\nII. Conclusion");
});
