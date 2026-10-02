/**
 * Block-based editor model: a document as an ordered list of typed blocks, each
 * one a small unit with its own text, the way a Notion page is built.
 *
 * Every edit is a pure function over the whole document, and block ids are
 * assigned by scanning the highest existing number, so a document's ids are
 * stable across re-renders without a counter living outside the model. Blocks
 * parse from plain text by their markers (#, ##, -, 1., [ ], >, !, ---), which
 * also means anything typed in a plain textarea can be pasted in and become a
 * structured page, and export back to Markdown so the page survives a round
 * trip.
 *
 * A page keeps at least one block: removing the last one replaces it with an
 * empty paragraph rather than leaving a document with nowhere to type. Headings
 * export from h2 down because the page title is the document's h1.
 */
import { words } from "./tokenize.ts";

export type BlockType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "minor-heading"
  | "bullet"
  | "numbered"
  | "todo"
  | "quote"
  | "callout"
  | "divider";

export interface BlockTypeSpec {
  id: BlockType;
  label: string;
  /** The Markdown marker that opens a line of this type. */
  marker: string;
}

/** The block types the editor offers, in menu order. */
export const BLOCK_TYPES: readonly BlockTypeSpec[] = [
  { id: "paragraph", label: "Paragraph", marker: "" },
  { id: "heading", label: "Heading", marker: "##" },
  { id: "subheading", label: "Subheading", marker: "###" },
  { id: "minor-heading", label: "Minor heading", marker: "####" },
  { id: "bullet", label: "Bulleted list", marker: "-" },
  { id: "numbered", label: "Numbered list", marker: "1." },
  { id: "todo", label: "To-do", marker: "[ ]" },
  { id: "quote", label: "Quote", marker: ">" },
  { id: "callout", label: "Callout", marker: "!" },
  { id: "divider", label: "Divider", marker: "---" },
];

export interface DocBlock {
  id: string;
  type: BlockType;
  text: string;
  /** Only meaningful for to-do blocks. */
  checked: boolean;
}

export interface BlockDoc {
  title: string;
  blocks: DocBlock[];
}

export interface BlockDocStats {
  blocks: number;
  words: number;
  headings: number;
  todos: number;
  todosDone: number;
  emptyBlocks: number;
  types: Record<BlockType, number>;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

function nextId(blocks: DocBlock[]): string {
  let highest = 0;
  for (const block of blocks) {
    const match = /^b(\d+)$/.exec(block.id);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return `b${highest + 1}`;
}

function emptyBlock(id: string): DocBlock {
  return { id, type: "paragraph", text: "", checked: false };
}

/** One empty paragraph under an empty title. */
export function createBlockDoc(): BlockDoc {
  return { title: "", blocks: [emptyBlock("b1")] };
}

/** Read plain text into typed blocks by each line's marker. */
export function blockDocFromText(text: string, title = ""): BlockDoc {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();

  const blocks: DocBlock[] = [];
  for (const line of lines) {
    const id = `b${blocks.length + 1}`;
    const todo = /^\s*[-*]?\s*\[( |x|X)\]\s*(.*)$/.exec(line);
    if (todo) {
      blocks.push({ id, type: "todo", text: todo[2].trim(), checked: todo[1].toLowerCase() === "x" });
      continue;
    }
    const heading = /^\s*#\s+(.*)$/.exec(line);
    const subheading = /^\s*##\s+(.*)$/.exec(line);
    const minor = /^\s*###\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    const quote = /^\s*>\s?(.*)$/.exec(line);
    const callout = /^\s*!\s+(.*)$/.exec(line);
    if (heading) blocks.push({ id, type: "heading", text: heading[1].trim(), checked: false });
    else if (subheading) blocks.push({ id, type: "subheading", text: subheading[1].trim(), checked: false });
    else if (minor) blocks.push({ id, type: "minor-heading", text: minor[1].trim(), checked: false });
    else if (bullet) blocks.push({ id, type: "bullet", text: bullet[1].trim(), checked: false });
    else if (numbered) blocks.push({ id, type: "numbered", text: numbered[1].trim(), checked: false });
    else if (quote) blocks.push({ id, type: "quote", text: quote[1].trim(), checked: false });
    else if (callout) blocks.push({ id, type: "callout", text: callout[1].trim(), checked: false });
    else if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) blocks.push({ id, type: "divider", text: "", checked: false });
    else blocks.push({ id, type: "paragraph", text: line.trim(), checked: false });
  }

  if (blocks.length === 0) blocks.push(emptyBlock("b1"));
  return { title: title.trim(), blocks };
}

/** Insert a block at an index (clamped to the document's bounds). */
export function insertBlock(doc: BlockDoc, index: number, type: BlockType = "paragraph", text = ""): BlockDoc {
  const at = Math.max(0, Math.min(index, doc.blocks.length));
  const block: DocBlock = { id: nextId(doc.blocks), type, text, checked: false };
  const blocks = [...doc.blocks];
  blocks.splice(at, 0, block);
  return { ...doc, blocks };
}

/** Remove a block; the last remaining block becomes an empty paragraph. */
export function removeBlock(doc: BlockDoc, index: number): BlockDoc {
  if (index < 0 || index >= doc.blocks.length) return doc;
  const blocks = doc.blocks.filter((_, current) => current !== index);
  if (blocks.length === 0) blocks.push(emptyBlock(nextId(doc.blocks)));
  return { ...doc, blocks };
}

/** Change a block's type; dividers carry no text. */
export function setBlockType(doc: BlockDoc, index: number, type: BlockType): BlockDoc {
  return {
    ...doc,
    blocks: doc.blocks.map((block, current) =>
      current === index ? { ...block, type, text: type === "divider" ? "" : block.text } : block,
    ),
  };
}

/** Replace a block's text. */
export function setBlockText(doc: BlockDoc, index: number, text: string): BlockDoc {
  return {
    ...doc,
    blocks: doc.blocks.map((block, current) => (current === index ? { ...block, text } : block)),
  };
}

/** Tick or untick a to-do block; any other type is left alone. */
export function toggleBlockTodo(doc: BlockDoc, index: number): BlockDoc {
  const block = doc.blocks[index];
  if (!block || block.type !== "todo") return doc;
  return {
    ...doc,
    blocks: doc.blocks.map((current, at) => (at === index ? { ...current, checked: !current.checked } : current)),
  };
}

/** Move a block up or down by a delta; edges clamp to a no-op. */
export function moveBlock(doc: BlockDoc, index: number, delta: number): BlockDoc {
  const target = index + delta;
  if (index < 0 || index >= doc.blocks.length || target < 0 || target >= doc.blocks.length) return doc;
  const blocks = [...doc.blocks];
  const [block] = blocks.splice(index, 1);
  blocks.splice(target, 0, block);
  return { ...doc, blocks };
}

/** Markdown for the page: the title as h1, then one line per block. */
export function blockDocToMarkdown(doc: BlockDoc): string {
  const lines: string[] = [];
  if (doc.title.trim()) lines.push(`# ${doc.title.trim()}`, "");
  let run = 0;
  for (const block of doc.blocks) {
    if (block.type === "numbered") {
      run += 1;
    } else {
      run = 0;
    }
    switch (block.type) {
      case "divider":
        lines.push("---");
        break;
      case "todo":
        lines.push(`- [${block.checked ? "x" : " "}] ${block.text}`);
        break;
      case "numbered":
        lines.push(`${run}. ${block.text}`);
        break;
      case "bullet":
        lines.push(`- ${block.text}`);
        break;
      case "heading":
        lines.push(`## ${block.text}`);
        break;
      case "subheading":
        lines.push(`### ${block.text}`);
        break;
      case "minor-heading":
        lines.push(`#### ${block.text}`);
        break;
      case "quote":
        lines.push(`> ${block.text}`);
        break;
      case "callout":
        lines.push(`> [!note] ${block.text}`);
        break;
      default:
        lines.push(block.text);
        break;
    }
  }
  return lines.join("\n").trim();
}

/** The page's reading text: the title and each non-empty block. */
export function blockDocToPlainText(doc: BlockDoc): string {
  const lines = doc.blocks.filter((block) => block.type !== "divider" && block.text.trim() !== "").map((block) => block.text.trim());
  return [doc.title.trim(), ...lines].filter(Boolean).join("\n");
}

/** Headings only, indented by level — a navigation outline for the page. */
export function blockOutline(doc: BlockDoc): string {
  const lines: string[] = [];
  if (doc.title.trim()) lines.push(doc.title.trim());
  const depth: Partial<Record<BlockType, number>> = { heading: 0, subheading: 1, "minor-heading": 2 };
  for (const block of doc.blocks) {
    const level = depth[block.type];
    if (level === undefined || !block.text.trim()) continue;
    lines.push(`${"  ".repeat(level)}- ${block.text.trim()}`);
  }
  return lines.join("\n");
}

/** Counts for the page, including a per-type breakdown in menu order. */
export function blockDocStats(doc: BlockDoc): BlockDocStats {
  const types = Object.fromEntries(BLOCK_TYPES.map((spec) => [spec.id, 0])) as Record<BlockType, number>;
  for (const block of doc.blocks) types[block.type] += 1;
  const todos = doc.blocks.filter((block) => block.type === "todo");
  return {
    blocks: doc.blocks.length,
    words: words([doc.title, ...doc.blocks.map((block) => block.text)].join(" ")).length,
    headings: doc.blocks.filter((block) =>
      block.type === "heading" || block.type === "subheading" || block.type === "minor-heading",
    ).length,
    todos: todos.length,
    todosDone: todos.filter((block) => block.checked).length,
    emptyBlocks: doc.blocks.filter((block) => block.type !== "divider" && clean(block.text) === "").length,
    types,
  };
}
