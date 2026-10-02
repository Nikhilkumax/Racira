/**
 * Rich text editor model: a plain-text document plus the inline marks and block
 * kinds layered over it.
 *
 * The text stays the single source of truth. Bold, italic, underline,
 * strikethrough and code are stored as offset ranges into that text, and each
 * line carries a block kind (paragraph, heading, subheading, quote or bullet).
 * Keeping the marks off the characters means editing the text can never leave
 * half-open tags behind: ranges are clamped and split back to the line they
 * belong to whenever the document is normalised.
 *
 * The HTML export escapes every character of the text and emits only the tags in
 * the two fixed tables below, so the editor can show a live preview without a
 * sanitiser — nothing the writer types is ever interpreted as markup. Headings
 * map to h2 and h3 because the page's own h1 belongs to the page, not the
 * document.
 */
import { words } from "./tokenize.ts";

export type InlineMark = "bold" | "italic" | "underline" | "strike" | "code";

export interface MarkSpec {
  id: InlineMark;
  label: string;
  tag: string;
  shortcut: string;
}

/** The inline marks the toolbar offers, in nesting order. */
export const RICH_MARKS: readonly MarkSpec[] = [
  { id: "bold", label: "Bold", tag: "strong", shortcut: "Ctrl+B" },
  { id: "italic", label: "Italic", tag: "em", shortcut: "Ctrl+I" },
  { id: "underline", label: "Underline", tag: "u", shortcut: "Ctrl+U" },
  { id: "strike", label: "Strikethrough", tag: "s", shortcut: "Ctrl+Shift+X" },
  { id: "code", label: "Code", tag: "code", shortcut: "Ctrl+E" },
];

export type RichBlockKind = "paragraph" | "heading" | "subheading" | "quote" | "bullet";

export interface KindSpec {
  id: RichBlockKind;
  label: string;
  tag: string;
}

/** Block kinds for the line the caret sits on. */
export const RICH_BLOCK_KINDS: readonly KindSpec[] = [
  { id: "paragraph", label: "Paragraph", tag: "p" },
  { id: "heading", label: "Heading", tag: "h2" },
  { id: "subheading", label: "Subheading", tag: "h3" },
  { id: "quote", label: "Quote", tag: "blockquote" },
  { id: "bullet", label: "Bullet", tag: "li" },
];

export interface RichMarkRange {
  mark: InlineMark;
  start: number;
  end: number;
}

export interface RichDoc {
  text: string;
  /** One kind per line of text; line 0 is the first line. */
  kinds: RichBlockKind[];
  marks: RichMarkRange[];
}

export interface RichDocStats {
  words: number;
  characters: number;
  lines: number;
  formattedWords: number;
  marks: number;
  paragraphs: number;
  headings: number;
  quotes: number;
  bullets: number;
}

const MARK_ORDER: InlineMark[] = RICH_MARKS.map((spec) => spec.id);
const WORD_PATTERN = /[\p{L}\p{N}'’]+/gu;

/** Start and end offset of every line, with the newline excluded. */
export function lineSpans(text: string): { start: number; end: number }[] {
  const spans: { start: number; end: number }[] = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") {
      spans.push({ start, end: index });
      start = index + 1;
    }
  }
  spans.push({ start, end: text.length });
  return spans;
}

/** A document with the text split into empty paragraphs and no marks. */
export function createRichDoc(text = ""): RichDoc {
  return {
    text,
    kinds: lineSpans(text).map(() => "paragraph" as RichBlockKind),
    marks: [],
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mergeRanges(ranges: RichMarkRange[]): RichMarkRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: RichMarkRange[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.mark === range.mark && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

/** True when the mark's ranges already cover every character of the span. */
function coveredBy(ranges: RichMarkRange[], start: number, end: number): boolean {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let cursor = start;
  for (const range of sorted) {
    if (range.end <= cursor) continue;
    if (range.start > cursor) return false;
    cursor = range.end;
    if (cursor >= end) return true;
  }
  return cursor >= end;
}

/** Remove a span from every range of one mark. */
function subtractSpan(ranges: RichMarkRange[], mark: InlineMark, start: number, end: number): RichMarkRange[] {
  const out: RichMarkRange[] = [];
  for (const range of ranges) {
    if (range.mark !== mark || range.end <= start || range.start >= end) {
      out.push(range);
      continue;
    }
    if (range.start < start) out.push({ mark, start: range.start, end: start });
    if (range.end > end) out.push({ mark, start: end, end: range.end });
  }
  return out;
}

/**
 * Clamp everything into the current text: marks are limited to the text length,
 * split at line breaks so no mark spans two blocks, and merged; the kind list is
 * padded or trimmed to one entry per line.
 */
export function normalizeRichDoc(doc: RichDoc): RichDoc {
  const spans = lineSpans(doc.text);
  const clamped: RichMarkRange[] = [];
  for (const range of doc.marks) {
    const start = Math.max(0, Math.min(range.start, doc.text.length));
    const end = Math.max(0, Math.min(range.end, doc.text.length));
    if (end <= start) continue;
    for (const span of spans) {
      const from = Math.max(start, span.start);
      const to = Math.min(end, span.end);
      if (to > from) clamped.push({ mark: range.mark, start: from, end: to });
    }
  }
  const kinds = spans.map((_, index) => doc.kinds[index] ?? "paragraph");
  return { text: doc.text, kinds, marks: mergeRanges(clamped) };
}

/** Replace the text, keeping the block kinds and clamping the marks to fit. */
export function setRichDocText(doc: RichDoc, text: string): RichDoc {
  return normalizeRichDoc({ text, kinds: doc.kinds, marks: doc.marks });
}

/**
 * Toggle a mark over a selection. A selection spanning several lines is applied
 * to each line's part, so a mark never crosses a block boundary.
 */
export function toggleMarkRange(doc: RichDoc, mark: InlineMark, start: number, end: number): RichDoc {
  const spans = lineSpans(doc.text);
  const from = Math.max(0, Math.min(Math.min(start, end), doc.text.length));
  const to = Math.max(0, Math.min(Math.max(start, end), doc.text.length));
  if (to <= from) return normalizeRichDoc(doc);

  let marks = doc.marks;
  for (const span of spans) {
    const segmentStart = Math.max(from, span.start);
    const segmentEnd = Math.min(to, span.end);
    if (segmentEnd <= segmentStart) continue;
    const same = marks.filter((range) => range.mark === mark);
    if (coveredBy(same, segmentStart, segmentEnd)) {
      marks = subtractSpan(marks, mark, segmentStart, segmentEnd);
    } else {
      marks = [...marks, { mark, start: segmentStart, end: segmentEnd }];
    }
  }
  return normalizeRichDoc({ ...doc, marks });
}

/** True when the character at an offset carries a mark (for toolbar state). */
export function markActiveAt(doc: RichDoc, mark: InlineMark, offset: number): boolean {
  return doc.marks.some((range) => range.mark === mark && offset >= range.start && offset < range.end);
}

/** Set the block kind of one line. */
export function setLineKind(doc: RichDoc, lineIndex: number, kind: RichBlockKind): RichDoc {
  return normalizeRichDoc({
    ...doc,
    kinds: lineSpans(doc.text).map((_, index) => (index === lineIndex ? kind : doc.kinds[index] ?? "paragraph")),
  });
}

/** HTML for the document. Every character of the text is escaped. */
export function richDocToHtml(doc: RichDoc): string {
  const spans = lineSpans(doc.text);
  const html: string[] = [];
  let index = 0;
  while (index < spans.length) {
    const kind = doc.kinds[index] ?? "paragraph";
    const span = spans[index];
    const line = doc.text.slice(span.start, span.end);

    if (kind === "bullet") {
      const items: string[] = [];
      while (index < spans.length && (doc.kinds[index] ?? "paragraph") === "bullet") {
        const current = spans[index];
        items.push(`<li>${inlineHtml(doc, doc.text.slice(current.start, current.end), current.start)}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    const inner = inlineHtml(doc, line, span.start) || (kind === "paragraph" ? "<br />" : "");
    switch (kind) {
      case "heading":
        html.push(`<h2>${inner}</h2>`);
        break;
      case "subheading":
        html.push(`<h3>${inner}</h3>`);
        break;
      case "quote":
        html.push(`<blockquote>${inner}</blockquote>`);
        break;
      default:
        html.push(`<p>${inner}</p>`);
        break;
    }
    index += 1;
  }
  return html.join("\n");
}

/** One line's text with only the tags of the fixed mark table. */
function inlineHtml(doc: RichDoc, line: string, offset: number): string {
  const relevant = doc.marks
    .filter((range) => range.end > offset && range.start < offset + line.length)
    .sort((a, b) => a.start - b.start);
  if (relevant.length === 0) return escapeHtml(line);

  const boundaries = new Set<number>([offset, offset + line.length]);
  for (const range of relevant) {
    boundaries.add(Math.max(offset, range.start));
    boundaries.add(Math.min(offset + line.length, range.end));
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const pieces: string[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    const piece = line.slice(from - offset, to - offset);
    if (!piece) continue;
    const active = MARK_ORDER.filter((mark) =>
      relevant.some((range) => range.mark === mark && range.start <= from && range.end >= to),
    );
    const specs = active
      .map((mark) => RICH_MARKS.find((spec) => spec.id === mark))
      .filter((spec): spec is MarkSpec => Boolean(spec));
    const open = specs.map((spec) => `<${spec.tag}>`).join("");
    const close = [...specs].reverse().map((spec) => `</${spec.tag}>`).join("");
    pieces.push(`${open}${escapeHtml(piece)}${close}`);
  }
  return pieces.join("");
}

/** The visible text with all mark syntax removed. */
export function richDocToPlainText(doc: RichDoc): string {
  return doc.text;
}

/** Counts for the document: text, marks and block kinds. */
export function richDocStats(doc: RichDoc): RichDocStats {
  const spans = lineSpans(doc.text);
  const formatted = new Set<number>();
  for (const match of doc.text.matchAll(WORD_PATTERN)) {
    const at = match.index ?? 0;
    if (doc.marks.some((range) => at >= range.start && at < range.end)) formatted.add(at);
  }
  return {
    words: words(doc.text).length,
    characters: doc.text.length,
    lines: spans.length,
    formattedWords: formatted.size,
    marks: doc.marks.length,
    paragraphs: doc.kinds.filter((kind) => kind === "paragraph").length,
    headings: doc.kinds.filter((kind) => kind === "heading" || kind === "subheading").length,
    quotes: doc.kinds.filter((kind) => kind === "quote").length,
    bullets: doc.kinds.filter((kind) => kind === "bullet").length,
  };
}
