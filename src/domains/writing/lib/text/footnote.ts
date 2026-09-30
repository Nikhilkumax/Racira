/**
 * Footnote marker parsing, matching, renumbering and rendering.
 *
 * The tool takes two inputs: the body text with inline markers, and the notes,
 * one per line (a note line may optionally repeat its marker, e.g. "3. See…").
 * This module detects which marker style the body actually uses, matches
 * markers to notes in order of first appearance, reports real structural
 * problems (a marker with no note, a note never referenced, a marker used more
 * than once) and renumbers so the exported list is always sequential.
 *
 * Nothing here is guessed: when the body has more markers than notes the
 * analysis says so and the pairing stops at the shorter list.
 */

export type MarkerStyle = "bracket" | "caret" | "paren" | "symbol";

export interface MarkerStyleInfo {
  style: MarkerStyle;
  label: string;
  example: string;
}

export const MARKER_STYLES: MarkerStyleInfo[] = [
  { style: "bracket", label: "Square brackets", example: "Text[1]" },
  { style: "caret", label: "Caret", example: "Text^1" },
  { style: "paren", label: "Parentheses", example: "Text(1)" },
  { style: "symbol", label: "Symbols", example: "Text*" },
];

const STYLE_PATTERNS: Record<MarkerStyle, RegExp> = {
  bracket: /\[(\d{1,3})\]/g,
  caret: /\^(\d{1,3})/g,
  paren: /\((\d{1,3})\)/g,
  symbol: /[*†‡§¶#]/g,
};

export interface MarkerOccurrence {
  raw: string;
  /** The marker's own label ("7", "*") — not the renumbered value. */
  label: string;
  index: number;
  end: number;
}

/** Count occurrences of every marker style in the body, so the UI can pick one. */
export function markerStyleCounts(body: string): { style: MarkerStyle; count: number }[] {
  return MARKER_STYLES.map(({ style }) => {
    const re = new RegExp(STYLE_PATTERNS[style].source, "g");
    return { style, count: [...body.matchAll(re)].length };
  });
}

/** Most-used marker style, or "bracket" when the body has no markers at all. */
export function detectMarkerStyle(body: string): MarkerStyle {
  const counts = markerStyleCounts(body);
  let best: { style: MarkerStyle; count: number } = { style: "bracket", count: 0 };
  for (const entry of counts) {
    if (entry.count > best.count) best = entry;
  }
  return best.style;
}

/** Every marker occurrence of one style, in document order. */
export function findMarkers(body: string, style: MarkerStyle): MarkerOccurrence[] {
  const re = new RegExp(STYLE_PATTERNS[style].source, "g");
  const out: MarkerOccurrence[] = [];
  for (const match of body.matchAll(re)) {
    const raw = match[0];
    const index = match.index ?? 0;
    out.push({ raw, label: match[1] ?? raw, index, end: index + raw.length });
  }
  return out;
}

export type NumberingStyle = "numeric" | "alpha" | "roman" | "symbol";

export const NUMBERING_STYLES: { value: NumberingStyle; label: string }[] = [
  { value: "numeric", label: "1, 2, 3" },
  { value: "alpha", label: "a, b, c" },
  { value: "roman", label: "i, ii, iii" },
  { value: "symbol", label: "*, †, ‡" },
];

/** 1 → a, 26 → z, 27 → aa (spreadsheet-column style). */
export function toAlpha(value: number): string {
  let n = Math.max(1, Math.floor(value));
  let out = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    out = String.fromCharCode(97 + remainder) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** 1 → i, 4 → iv, 1990 → mcmxc. Values above 3999 fall back to the decimal form. */
export function toRoman(value: number): string {
  let n = Math.max(1, Math.floor(value));
  if (n > 3999) return String(n);
  const table: [number, string][] = [
    [1000, "m"], [900, "cm"], [500, "d"], [400, "cd"],
    [100, "c"], [90, "xc"], [50, "l"], [40, "xl"],
    [10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"],
  ];
  let out = "";
  for (const [amount, numeral] of table) {
    while (n >= amount) {
      out += numeral;
      n -= amount;
    }
  }
  return out;
}

const SYMBOL_SEQUENCE = ["*", "†", "‡", "§", "¶", "#"];

/** 1 → *, 6 → #, 7 → **, 8 → †† … (traditional footnote symbol sequence). */
export function toSymbol(value: number): string {
  const n = Math.max(1, Math.floor(value));
  const symbol = SYMBOL_SEQUENCE[(n - 1) % SYMBOL_SEQUENCE.length];
  const repeats = Math.floor((n - 1) / SYMBOL_SEQUENCE.length) + 1;
  return symbol.repeat(repeats);
}

/** The label for footnote `n` in the chosen numbering style. */
export function markerFor(n: number, style: NumberingStyle): string {
  switch (style) {
    case "alpha":
      return toAlpha(n);
    case "roman":
      return toRoman(n);
    case "symbol":
      return toSymbol(n);
    default:
      return String(n);
  }
}

const SUPERSCRIPTS: Record<string, string> = {
  "0": "\u2070", "1": "\u00b9", "2": "\u00b2", "3": "\u00b3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
};

export function toSuperscript(text: string): string {
  return [...text].map((char) => SUPERSCRIPTS[char] ?? char).join("");
}

export interface NotePair {
  /** Marker as it appeared in the body. */
  raw: string;
  /** The marker's own label ("3", "*", "") — what the body actually wrote. */
  label: string;
  /** Sequential number assigned by the renumbering (1-based). */
  number: number;
  /** Note text with any leading marker prefix removed. */
  note: string;
  /** First index of the marker in the body. */
  index: number;
  /** How many times the marker appears in the body. */
  references: number;
}

export interface FootnoteAnalysis {
  style: MarkerStyle;
  occurrences: MarkerOccurrence[];
  pairs: NotePair[];
  notes: string[];
  warnings: string[];
}

/** Strip a leading marker prefix from a note line ("3.", "[3]", "^3", "*", "3 —"). */
function stripNotePrefix(line: string): { label: string | null; text: string } {
  const match = line.match(/^\s*(?:\[(\d{1,3})\]|\((\d{1,3})\)|\^(\d{1,3})|(\d{1,3})\s*[.)\u2013\u2014:-]|([*†‡§¶#]+))\s*/);
  if (!match) return { label: null, text: line.trim() };
  const label = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? null;
  return { label, text: line.slice(match[0].length).trim() };
}

/**
 * Match body markers to notes and report structural problems. `style` defaults
 * to the style detected in the body.
 */
export function analyzeFootnotes(body: string, notesText: string, style?: MarkerStyle): FootnoteAnalysis {
  const resolvedStyle = style ?? detectMarkerStyle(body);
  const occurrences = findMarkers(body, resolvedStyle);
  const rawNoteLines = notesText
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0);

  const explicitLabels = rawNoteLines.map((line) => stripNotePrefix(line));
  const notes = explicitLabels.map((entry) => entry.text);
  const warnings: string[] = [];

  // Pair markers to notes by order of first appearance.
  const seen = new Map<string, NotePair>();
  const order: NotePair[] = [];
  for (const occurrence of occurrences) {
    const existing = seen.get(occurrence.label);
    if (existing) {
      existing.references += 1;
      continue;
    }
    const number = order.length + 1;
    const pair: NotePair = {
      raw: occurrence.raw,
      label: occurrence.label,
      number,
      note: notes[number - 1] ?? "",
      index: occurrence.index,
      references: 1,
    };
    seen.set(occurrence.label, pair);
    order.push(pair);
  }

  if (order.length > notes.length) {
    warnings.push(
      `${order.length - notes.length} of ${order.length} markers in the body have no matching note (${notes.length} note${notes.length === 1 ? "" : "s"} provided).`,
    );
  }
  if (notes.length > order.length) {
    warnings.push(
      `${notes.length - order.length} of ${notes.length} notes are never referenced in the body (${order.length} marker${order.length === 1 ? "" : "s"} found).`,
    );
  }
  // Numbered markers that point past the end of the note list — the common
  // "renumbering half-done" mistake.
  const orphanNumbers = order
    .map((pair) => pair.raw.replace(/[^\d]/g, ""))
    .filter((digits) => digits.length > 0)
    .map(Number)
    .filter((label) => label > notes.length);
  if (orphanNumbers.length > 0) {
    warnings.push(
      `Body marker${orphanNumbers.length === 1 ? "" : "s"} ${orphanNumbers.map((n) => `[${n}]`).join(", ")} point${orphanNumbers.length === 1 ? "s" : ""} past the end of the note list (${notes.length} note${notes.length === 1 ? "" : "s"}).`,
    );
  }

  for (const pair of order) {
    if (pair.references > 1) {
      warnings.push(`Marker ${pair.raw} is referenced ${pair.references} times; all references keep the same number.`);
    }
  }
  explicitLabels.forEach((entry, index) => {
    if (entry.label && !occurrences.some((occurrence) => occurrence.label === entry.label)) {
      warnings.push(`Note ${index + 1} is prefixed "${entry.label}" but that marker does not appear in the body.`);
    }
  });

  return { style: resolvedStyle, occurrences, pairs: order, notes, warnings };
}

export type MarkerForm = "bracket" | "caret" | "paren" | "superscript" | "markdown";

export const MARKER_FORMS: { value: MarkerForm; label: string }[] = [
  { value: "superscript", label: "Superscript\u00b9" },
  { value: "bracket", label: "Square brackets [1]" },
  { value: "markdown", label: "Markdown [^1]" },
  { value: "caret", label: "Caret ^1" },
  { value: "paren", label: "Parentheses (1)" },
];

/** Replace in-body markers with the renumbered, reformatted markers. */
export function renumberBody(
  body: string,
  analysis: FootnoteAnalysis,
  form: MarkerForm,
  numbering: NumberingStyle = "numeric",
): string {
  const byLabel = new Map(analysis.pairs.map((pair) => [pair.label, pair]));
  let out = "";
  let cursor = 0;
  for (const occurrence of analysis.occurrences) {
    const pair = byLabel.get(occurrence.label);
    if (!pair) continue;
    const label = markerFor(pair.number, numbering);
    let replacement: string;
    switch (form) {
      case "bracket":
        replacement = `[${label}]`;
        break;
      case "caret":
        replacement = `^${label}`;
        break;
      case "paren":
        replacement = `(${label})`;
        break;
      case "markdown":
        replacement = `[^${label}]`;
        break;
      default:
        replacement = toSuperscript(label);
    }
    out += body.slice(cursor, occurrence.index) + replacement;
    cursor = occurrence.end;
  }
  out += body.slice(cursor);
  return out;
}

/** Escape the five HTML-significant characters for the HTML note list. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type NoteFormat = "markdown" | "html" | "plain";

/** The note list as markdown, HTML (`<ol>`) or plain text. */
export function renderNotes(
  pairs: NotePair[],
  numbering: NumberingStyle = "numeric",
  format: NoteFormat = "markdown",
): string {
  if (pairs.length === 0) return "";
  if (format === "html") {
    const items = pairs
      .map((pair) => `  <li id="fn-${pair.number}">${escapeHtml(pair.note)} <a href="#fnref-${pair.number}">\u21a9</a></li>`)
      .join("\n");
    return `<ol class="footnotes">\n${items}\n</ol>`;
  }
  return pairs
    .map((pair) => `${markerFor(pair.number, numbering)}. ${pair.note}`)
    .join("\n");
}
