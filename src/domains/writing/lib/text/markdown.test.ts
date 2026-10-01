/**
 * Unit tests for the Markdown engine. These exercise the pure rendering and
 * inspection helpers; the DOM sanitising step lives in the component.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { headingSlug, markdownOutlineText, markdownStats, markdownToPlainText, renderMarkdown } from "./markdown.ts";

const SOURCE = [
  "# Title",
  "",
  "Some **bold** text with a [link](https://example.com).",
  "",
  "## Section one",
  "",
  "- first",
  "- second",
  "",
  "```js",
  "const x = 1;",
  "```",
].join("\n");

test("renderMarkdown produces HTML and an outline", () => {
  const result = renderMarkdown(SOURCE);
  assert.ok(result.html.includes("<h1>Title</h1>"));
  assert.ok(result.html.includes("<strong>bold</strong>"));
  assert.equal(result.headings.length, 2);
  assert.deepEqual(result.headings[0], { level: 1, text: "Title", slug: "title" });
  assert.deepEqual(result.headings[1], { level: 2, text: "Section one", slug: "section-one" });
});

test("renderMarkdown escapes raw HTML rather than passing it through", () => {
  const result = renderMarkdown("<script>alert(1)</script>");
  assert.equal(result.html.includes("<script>"), false);
});

test("markdownStats counts the tokens that describe the structure", () => {
  const stats = markdownStats(SOURCE);
  assert.equal(stats.headings, 2);
  assert.equal(stats.links, 1);
  assert.equal(stats.codeBlocks, 1);
  assert.equal(stats.listItems, 2);
  assert.ok(stats.words > 10);
});

test("markdownToPlainText strips the markup", () => {
  const text = markdownToPlainText(SOURCE);
  assert.ok(text.includes("Some bold text with a link."));
  assert.equal(text.includes("**"), false);
  assert.equal(text.includes("# Title"), false);
});

test("markdownOutlineText and headingSlug", () => {
  assert.equal(markdownOutlineText(SOURCE), "- Title\n  - Section one");
  assert.equal(headingSlug("Hello, World! 2026"), "hello-world-2026");
});
