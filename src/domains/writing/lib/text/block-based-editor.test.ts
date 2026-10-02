import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLOCK_TYPES,
  blockDocFromText,
  blockDocStats,
  blockDocToMarkdown,
  blockDocToPlainText,
  blockOutline,
  createBlockDoc,
  insertBlock,
  moveBlock,
  removeBlock,
  setBlockText,
  setBlockType,
  toggleBlockTodo,
} from "./block-based-editor.ts";

const SOURCE = "# Field notes\nA line of plain text.\n- [x] Book the hall\n- [ ] Print the signs\n1. First step\n2. Second step\n> A remembered line\n! Keep this\n---\n## Afternoon\n";

test("plain text parses into typed blocks by its markers", () => {
  const page = blockDocFromText(SOURCE, "Launch page");
  assert.equal(page.title, "Launch page");
  assert.deepEqual(
    page.blocks.map((block) => block.type),
    ["heading", "paragraph", "todo", "todo", "numbered", "numbered", "quote", "callout", "divider", "subheading"],
  );
  assert.deepEqual(
    page.blocks.map((block) => block.id),
    ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "b10"],
  );
  assert.equal(page.blocks[2].checked, true);
  assert.equal(page.blocks[3].checked, false);
  assert.equal(blockDocFromText("").blocks.length, 1);
});

test("the page exports to Markdown with the title as h1 and lists renumbered", () => {
  const page = blockDocFromText(SOURCE, "Launch page");
  assert.equal(
    blockDocToMarkdown(page),
    [
      "# Launch page",
      "",
      "## Field notes",
      "A line of plain text.",
      "- [x] Book the hall",
      "- [ ] Print the signs",
      "1. First step",
      "2. Second step",
      "> A remembered line",
      "> [!note] Keep this",
      "---",
      "### Afternoon",
    ].join("\n"),
  );
});

test("the outline nests headings and the plain text keeps reading order", () => {
  const page = blockDocFromText(SOURCE, "Launch page");
  assert.equal(blockOutline(page), "Launch page\n- Field notes\n  - Afternoon");
  assert.equal(
    blockDocToPlainText(page),
    "Launch page\nField notes\nA line of plain text.\nBook the hall\nPrint the signs\nFirst step\nSecond step\nA remembered line\nKeep this\nAfternoon",
  );
});

test("blocks insert, move and remove with ids assigned from the highest existing number", () => {
  let page = createBlockDoc();
  page = insertBlock(page, 1, "todo", "Draft the intro");
  page = insertBlock(page, 2, "bullet", "Collect quotes");
  assert.deepEqual(page.blocks.map((block) => block.id), ["b1", "b2", "b3"]);
  assert.equal(blockDocToMarkdown(page), "- [ ] Draft the intro\n- Collect quotes");
  assert.deepEqual(moveBlock(page, 2, -1).blocks.map((block) => block.id), ["b1", "b3", "b2"]);
  assert.deepEqual(moveBlock(page, 0, -1).blocks.map((block) => block.id), ["b1", "b2", "b3"]);
  assert.equal(moveBlock(page, 5, 1), page);
  assert.deepEqual(removeBlock(page, 0).blocks.map((block) => block.id), ["b2", "b3"]);
});

test("removing every block leaves an empty paragraph to type in", () => {
  const page = removeBlock(createBlockDoc(), 0);
  assert.equal(page.blocks.length, 1);
  assert.equal(page.blocks[0].type, "paragraph");
  assert.equal(page.blocks[0].text, "");
  assert.equal(removeBlock(page, 4), page);
});

test("types and text change in place, and a divider carries no text", () => {
  let page = insertBlock(createBlockDoc(), 1, "paragraph", "Notes");
  page = setBlockText(setBlockType(page, 1, "heading"), 1, "Notes");
  assert.deepEqual(
    page.blocks.map((block) => `${block.type}:${block.text}`),
    ["paragraph:", "heading:Notes"],
  );
  const divider = setBlockType(page, 1, "divider");
  assert.equal(divider.blocks[1].text, "");
  assert.equal(blockDocToMarkdown(divider), "---");
});

test("only to-do blocks can be ticked", () => {
  let page = insertBlock(createBlockDoc(), 1, "todo", "Print the signs");
  page = toggleBlockTodo(page, 1);
  assert.equal(page.blocks[1].checked, true);
  assert.equal(blockDocToMarkdown(page), "- [x] Print the signs");
  const untouched = toggleBlockTodo(page, 0);
  assert.equal(untouched, page);
});

test("stats count blocks, words, headings and to-do progress by type", () => {
  const stats = blockDocStats(blockDocFromText(SOURCE, "Launch page"));
  assert.equal(stats.blocks, 10);
  assert.equal(stats.words, 25);
  assert.equal(stats.headings, 2);
  assert.equal(stats.todos, 2);
  assert.equal(stats.todosDone, 1);
  assert.equal(stats.emptyBlocks, 0);
  assert.equal(stats.types.heading, 1);
  assert.equal(stats.types.subheading, 1);
  assert.equal(stats.types.bullet, 0);
  assert.equal(stats.types.divider, 1);
  assert.deepEqual(Object.keys(stats.types), BLOCK_TYPES.map((spec) => spec.id));
});
