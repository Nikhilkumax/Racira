/**
 * Outline parsing and rendering for the outline builder.
 *
 * An outline is authored as indented lines, with or without leading markdown
 * bullets. This module reads that text into a tree, reports its shape, and
 * writes it back out three ways: indented markdown, a numbered outline (decimal
 * or classic I./A./1./a./i.), and plain indented text for pasting into a word
 * processor. Indentation is normalised, so a stray space or a pasted tab does
 * not break the tree.
 */

export interface OutlineNode {
  text: string;
  children: OutlineNode[];
}

export interface OutlineStats {
  /** Total number of nodes, all levels. */
  count: number;
  maxDepth: number;
  /** Node count at each depth; index 0 is level 1. */
  byLevel: number[];
}

export type OutlineScheme = "decimal" | "classic";

const MARKER = /^\s*(?:[-*+]|\d+[.)])\s+/;

/** The indent width in spaces, with tabs counted as four. */
function indentWidth(line: string): number {
  const match = line.match(/^[\t ]*/);
  if (!match) return 0;
  return match[0].replace(/\t/g, "    ").length;
}

const stripMarker = (line: string): string => line.replace(MARKER, "").trim();

/** Parse indented text into a tree. Blank lines are skipped; levels never skip. */
export function parseOutline(input: string): OutlineNode[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const withIndent = lines
    .map((line) => ({ line, indent: indentWidth(line) }))
    .filter(({ line }) => stripMarker(line).length > 0);

  if (withIndent.length === 0) return [];

  const positives = withIndent.map((entry) => entry.indent).filter((value) => value > 0);
  const unit = positives.length > 0 ? Math.min(...positives) : 2;

  const roots: OutlineNode[] = [];
  const stack: { node: OutlineNode; level: number }[] = [];

  for (const { line, indent } of withIndent) {
    const rawLevel = indent > 0 ? Math.round(indent / unit) + 1 : 1;
    const previousLevel = stack.length > 0 ? stack[stack.length - 1].level : 0;
    const level = Math.max(1, Math.min(rawLevel, previousLevel + 1));
    const node: OutlineNode = { text: stripMarker(line), children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= level) stack.pop();
    if (stack.length === 0) roots.push(node);
    else stack[stack.length - 1].node.children.push(node);
    stack.push({ node, level });
  }

  return roots;
}

/** Count nodes, the deepest level and the population of each level. */
export function outlineStats(nodes: OutlineNode[]): OutlineStats {
  const byLevel: number[] = [];
  let count = 0;
  let maxDepth = 0;

  const walk = (list: OutlineNode[], depth: number): void => {
    if (list.length === 0) return;
    maxDepth = Math.max(maxDepth, depth);
    byLevel[depth - 1] = (byLevel[depth - 1] ?? 0) + list.length;
    count += list.length;
    for (const node of list) walk(node.children, depth + 1);
  };

  walk(nodes, 1);
  for (let index = 0; index < maxDepth; index += 1) if (byLevel[index] === undefined) byLevel[index] = 0;
  return { count, maxDepth, byLevel };
}

/** Indented markdown bullets, two spaces per level. */
export function renderOutlineMarkdown(nodes: OutlineNode[]): string {
  const lines: string[] = [];
  const walk = (list: OutlineNode[], depth: number): void => {
    for (const node of list) {
      lines.push(`${"  ".repeat(depth)}- ${node.text}`);
      walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return lines.join("\n");
}

/** Plain indented text, no bullets — the shape a word processor expects. */
export function outlineToIndentedText(nodes: OutlineNode[]): string {
  const lines: string[] = [];
  const walk = (list: OutlineNode[], depth: number): void => {
    for (const node of list) {
      lines.push(`${"  ".repeat(depth)}${node.text}`);
      walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return lines.join("\n");
}

const ROMAN: [number, string][] = [
  [1000, "m"], [900, "cm"], [500, "d"], [400, "cd"], [100, "c"], [90, "xc"],
  [50, "l"], [40, "xl"], [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
];

function roman(value: number, upper: boolean): string {
  let rest = Math.max(1, value);
  let out = "";
  for (const [amount, symbol] of ROMAN) {
    while (rest >= amount) {
      out += symbol;
      rest -= amount;
    }
  }
  return upper ? out.toLocaleUpperCase() : out;
}

function alpha(value: number, upper: boolean): string {
  let rest = Math.max(1, value);
  let out = "";
  while (rest > 0) {
    const remainder = (rest - 1) % 26;
    out = String.fromCharCode(97 + remainder) + out;
    rest = Math.floor((rest - 1) / 26);
  }
  return upper ? out.toLocaleUpperCase() : out;
}

/** The classic outline markers by depth: I., A., 1., a., i. */
function classicMarker(index: number, depth: number): string {
  switch (depth) {
    case 0:
      return roman(index + 1, true);
    case 1:
      return alpha(index + 1, true);
    case 2:
      return String(index + 1);
    case 3:
      return alpha(index + 1, false);
    default:
      return roman(index + 1, false);
  }
}

/** A numbered outline: hierarchical decimals or classic I./A./1./a. markers. */
export function renderOutlineNumbered(nodes: OutlineNode[], scheme: OutlineScheme = "decimal"): string {
  const lines: string[] = [];
  const walk = (list: OutlineNode[], depth: number, prefix: number[]): void => {
    list.forEach((node, index) => {
      const counters = [...prefix, index + 1];
      // "1. Top" for the first level, "1.1 Nested" below it — the trailing dot
      // belongs to the outmost number only.
      const label =
        scheme === "decimal"
          ? counters.length === 1
            ? `${counters[0]}.`
            : counters.join(".")
          : `${classicMarker(index, depth)}.`;
      lines.push(`${"  ".repeat(depth)}${label} ${node.text}`);
      walk(node.children, depth + 1, counters);
    });
  };
  walk(nodes, 0, []);
  return lines.join("\n");
}

/** A copyable report combining every rendering and the shape summary. */
export function outlineReport(nodes: OutlineNode[], scheme: OutlineScheme): string {
  const stats = outlineStats(nodes);
  return [
    `Outline — ${stats.count} item(s), ${stats.maxDepth} level(s)`,
    `Per level: ${stats.byLevel.map((count, index) => `L${index + 1}: ${count}`).join(", ")}`,
    "",
    scheme === "decimal" ? renderOutlineNumbered(nodes, "decimal") : renderOutlineNumbered(nodes, "classic"),
  ].join("\n");
}
