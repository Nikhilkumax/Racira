/**
 * Document style consistency: does one text keep one convention, or does it mix?
 *
 * Eight families are compared — double quotation marks, dashes, ellipses, serial
 * commas, list-item punctuation, numbers below ten, heading capitalisation and
 * date order. Every family is mechanical: the variants are character patterns or
 * documented spelling sets, the counts are counts, and the "lean" is simply the
 * variant with the most occurrences. Nothing here judges the choice of
 * convention; it reports a document that uses two of them, which is the fault a
 * reader notices.
 *
 * The rules and their limits, stated on the tool page as well:
 *   - quotation marks: only double marks are compared (`"` vs “ ”); apostrophes
 *     belong to the apostrophe checks;
 *   - dashes: em dash, en dash, a doubled hyphen and a spaced hyphen;
 *   - ellipses: three periods vs the single ellipsis character;
 *   - serial commas: the two list patterns are matched, not parsed, so a list of
 *     two is not evidence and a pattern inside a quotation still counts;
 *   - list punctuation: single-line bullet/ordered items only, judged by the
 *     final character of the line;
 *   - numbers: bare figures 2-9 and the words two-nine in running text, with
 *     percent, currency, units, decimals, times, years, ordinals and `1`/`one`
 *     excluded as documented;
 *   - heading case: short standalone lines with no terminal punctuation, judged
 *     as title case, sentence case or all caps;
 *   - dates: named-month and numeric dates in month-first, day-first and ISO
 *     order; a numeric date with no value above 12 is reported as ambiguous
 *     rather than being forced into a convention.
 *
 * A family with no evidence is reported as such — no evidence is not a pass.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";

export type StyleFamilyId =
  | "quote-marks"
  | "dash-style"
  | "ellipsis-style"
  | "serial-comma"
  | "list-punctuation"
  | "number-style"
  | "heading-case"
  | "date-order";

export interface StyleFamilyDefinition {
  id: StyleFamilyId;
  label: string;
  /** What the family compares, published in the tool's family table. */
  method: string;
}

export const STYLE_FAMILIES: readonly StyleFamilyDefinition[] = [
  {
    id: "quote-marks",
    label: "Double quotation marks",
    method: "straight \" counted against curly “ and ”",
  },
  {
    id: "dash-style",
    label: "Dashes",
    method: "em dash —, en dash –, doubled hyphen --, and spaced hyphen - all counted",
  },
  {
    id: "ellipsis-style",
    label: "Ellipses",
    method: "three periods ... counted against the single character …",
  },
  {
    id: "serial-comma",
    label: "Serial comma",
    method: "the pattern \", and/or\" counted against a two-comma list without one",
  },
  {
    id: "list-punctuation",
    label: "List item punctuation",
    method: "single-line bullet or numbered items ending with or without . ! ? ; :",
  },
  {
    id: "number-style",
    label: "Numbers below ten",
    method: "bare figures 2-9 counted against the words two-nine in running text",
  },
  {
    id: "heading-case",
    label: "Heading capitalisation",
    method: "short standalone lines judged sentence case, title case or all caps",
  },
  {
    id: "date-order",
    label: "Date order",
    method: "month-first, day-first and ISO dates counted; numeric dates with no day above 12 are ambiguous",
  },
];

interface RawOccurrence {
  variant: string;
  index: number;
  matched: string;
}

export interface StyleVariantCount {
  variant: string;
  label: string;
  count: number;
}

export interface StyleDeviation {
  family: StyleFamilyId;
  familyLabel: string;
  variant: string;
  expected: string;
  matched: string;
  index: number;
  snippet: string;
}

export interface StyleFamilyReport {
  id: StyleFamilyId;
  label: string;
  method: string;
  occurrences: number;
  counts: StyleVariantCount[];
  dominant: string | null;
  dominantLabel: string | null;
  mixed: boolean;
  deviations: StyleDeviation[];
}

export interface StyleConsistencyResult {
  families: StyleFamilyReport[];
  words: number;
  sentences: number;
  mixedFamilies: StyleFamilyReport[];
  consistentFamilies: StyleFamilyReport[];
  emptyFamilies: StyleFamilyReport[];
  deviations: StyleDeviation[];
  /** Numeric dates that cannot be assigned an order (both parts of 12 or less). */
  ambiguousDates: number;
  /** Heading-like lines the heading rule examined. */
  headingsChecked: number;
}

const VARIANT_LABELS: Record<string, string> = {
  straight: "straight \"",
  curly: "curly “ ”",
  em: "em dash —",
  en: "en dash –",
  "double-hyphen": "doubled hyphen --",
  "spaced-hyphen": "spaced hyphen -",
  "three-dots": "three periods ...",
  character: "ellipsis character …",
  with: "serial comma used",
  without: "no serial comma",
  punctuated: "ends with punctuation",
  unpunctuated: "no end punctuation",
  figure: "figure (2-9)",
  word: "spelled out (two-nine)",
  "sentence-case": "sentence case",
  "title-case": "title case",
  "all-caps": "all caps",
  "month-first": "month-first (March 5)",
  "day-first": "day-first (5 March)",
  iso: "ISO (2026-03-05)",
};

const labelFor = (variant: string): string => VARIANT_LABELS[variant] ?? variant;

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 28);
  const end = Math.min(text.length, index + length + 28);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

// ── Family collectors ────────────────────────────────────────────────────────

/**
 * Double quotation marks only. A straight mark inside a word (can't) is an
 * apostrophe and is not counted; curly single marks are left to the apostrophe
 * checks so the two tools do not contradict each other.
 */
function collectQuotes(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  const straight = /"(?!\d)(?<!\d")/g;
  let match: RegExpExecArray | null;
  while ((match = straight.exec(text)) !== null) {
    out.push({ variant: "straight", index: match.index, matched: "\"" });
    if (match.index === straight.lastIndex) straight.lastIndex += 1;
  }
  for (const [character, variant] of [["\u201c", "curly"], ["\u201d", "curly"]] as const) {
    let at = text.indexOf(character);
    while (at >= 0) {
      out.push({ variant, index: at, matched: character });
      at = text.indexOf(character, at + 1);
    }
  }
  return out;
}

const DASH_PATTERNS: { variant: string; pattern: RegExp }[] = [
  { variant: "em", pattern: /\u2014/g },
  { variant: "en", pattern: /\u2013/g },
  { variant: "double-hyphen", pattern: /(?<![<!])--(?![>-])/g },
  { variant: "spaced-hyphen", pattern: /(?<=\s)-(?=\s)/g },
];

function collectDashes(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  for (const { variant, pattern } of DASH_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      out.push({ variant, index: match.index, matched: match[0] });
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }
  return out;
}

function collectEllipses(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  const three = /\.{3}/g;
  let match: RegExpExecArray | null;
  while ((match = three.exec(text)) !== null) {
    out.push({ variant: "three-dots", index: match.index, matched: "..." });
    three.lastIndex = match.index + 3;
  }
  let at = text.indexOf("\u2026");
  while (at >= 0) {
    out.push({ variant: "character", index: at, matched: "\u2026" });
    at = text.indexOf("\u2026", at + 1);
  }
  return out;
}

function collectSerialCommas(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  // List with a comma before the conjunction: "bread, milk, and eggs".
  const withComma = /\b[\p{L}][\p{L}'-]*,\s+[\p{L}][\p{L}'-]*,\s+(?:and|or)\s+[\p{L}][\p{L}'-]*/giu;
  let match: RegExpExecArray | null;
  while ((match = withComma.exec(text)) !== null) {
    out.push({ variant: "with", index: match.index, matched: match[0] });
  }
  // List without one: "bread, milk and eggs".
  const withoutComma = /\b[\p{L}][\p{L}'-]*,\s+[\p{L}][\p{L}'-]*\s+(?:and|or)\s+[\p{L}][\p{L}'-]*/giu;
  while ((match = withoutComma.exec(text)) !== null) {
    out.push({ variant: "without", index: match.index, matched: match[0] });
  }
  return out;
}

const LIST_ITEM = /^[ \t]*(?:[-*•‣]|\d+[.)]|\(\d+\))\s+(.+?)\s*$/;

function collectListItems(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  let index = 0;
  for (const line of text.replace(/\r\n?/g, "\n").split("\n")) {
    const match = line.match(LIST_ITEM);
    if (match) {
      const body = match[1].replace(/[)]*["'”’]*$/, "");
      const punctuated = /[.!?;:]$/.test(body);
      out.push({
        variant: punctuated ? "punctuated" : "unpunctuated",
        index: index + (line.length - line.trimStart().length),
        matched: line.trim(),
      });
    }
    index += line.length + 1;
  }
  return out;
}

const NUMBER_WORDS = ["two", "three", "four", "five", "six", "seven", "eight", "nine"];
const NUMERAL_EXEMPT_AFTER = new Set([
  "%",
  "percent",
  "per cent",
  "kg",
  "km",
  "cm",
  "mm",
  "mb",
  "gb",
  "tb",
  "kb",
  "ms",
  "sec",
  "mins",
  "min",
  "hours",
  "days",
  "weeks",
  "months",
  "years",
  "miles",
  "feet",
  "oz",
  "lb",
  "lbs",
  "°c",
  "°f",
]);
const NUMERAL_EXEMPT_BEFORE = new Set(["$", "£", "€", "#", "no", "page", "figure", "table", "section", "chapter", "version", "v", "x"]);

function collectNumberStyles(text: string): RawOccurrence[] {
  const out: RawOccurrence[] = [];
  const numerals = /(?<![\p{L}\p{N}.,:/-])([2-9])(?![\p{L}0-9.%,:/-]|st\b|nd\b|rd\b|th\b)/gu;
  let match: RegExpExecArray | null;
  while ((match = numerals.exec(text)) !== null) {
    const after = text.slice(match.index + match[0].length, match.index + match[0].length + 12).match(/^\s*([\p{L}%°]+)/u)?.[1]?.toLowerCase() ?? "";
    const before = text.slice(Math.max(0, match.index - 12), match.index).match(/([\p{L}$£€#]+)\s*$/u)?.[1]?.toLowerCase() ?? "";
    if (NUMERAL_EXEMPT_AFTER.has(after) || NUMERAL_EXEMPT_BEFORE.has(before)) continue;
    out.push({ variant: "figure", index: match.index, matched: match[0] });
  }
  const tokens = wordTokens(text);
  for (const token of tokens) {
    const lower = token.text.toLowerCase();
    if (!NUMBER_WORDS.includes(lower)) continue;
    const before = text.slice(Math.max(0, token.index - 14), token.index).match(/([\p{L}]+)\s*$/u)?.[1]?.toLowerCase() ?? "";
    if (["chapter", "section", "page", "figure", "table", "part", "version"].includes(before)) continue;
    out.push({ variant: "word", index: token.index, matched: token.text });
  }
  return out;
}

const TITLE_CASE_STOPWORDS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "onto", "or", "over", "per", "the", "to", "up", "via", "with", "vs",
]);

function headingLines(text: string): { line: string; index: number }[] {
  const out: { line: string; index: number }[] = [];
  let offset = 0;
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let previousBlank = true; // document start counts as a boundary
  for (const line of lines) {
    const trimmed = line.trim();
    const isBlank = trimmed.length === 0;
    const words = trimmed.split(/\s+/).filter(Boolean);
    const headingLike =
      !isBlank &&
      previousBlank &&
      trimmed.length <= 60 &&
      words.length >= 2 &&
      !/[.!?,;:]$/.test(trimmed) &&
      !LIST_ITEM.test(line) &&
      !/^[#>|]/.test(trimmed) &&
      /\p{L}/u.test(trimmed);
    if (headingLike) out.push({ line: trimmed, index: offset + (line.length - line.trimStart().length) });
    previousBlank = isBlank;
    offset += line.length + 1;
  }
  return out;
}

function classifyHeading(line: string): string {
  const words = line.split(/\s+/).filter((word) => /\p{L}/u.test(word));
  if (words.length === 0) return "sentence-case";
  const letterWords = words.filter((word) => /\p{L}/u.test(word));
  if (letterWords.every((word) => word === word.toUpperCase())) return "all-caps";
  const capitalised = letterWords.filter((word) => /^[A-Z]/.test(word));
  const interior = letterWords.slice(1);
  const interiorCapitalised = interior.filter((word) => /^[A-Z]/.test(word));
  if (capitalised.length <= 1) return "sentence-case";
  // Title case: most interior words are capitalised, except short function words.
  const significant = interior.filter((word) => word.length > 3 && !TITLE_CASE_STOPWORDS.has(word.toLowerCase()));
  if (significant.length > 0 && interiorCapitalised.length / interior.length >= 0.5) return "title-case";
  return "sentence-case";
}

function collectHeadings(text: string): { occurrences: RawOccurrence[]; checked: number } {
  const lines = headingLines(text);
  return {
    occurrences: lines.map(({ line, index }) => ({ variant: classifyHeading(line), index, matched: line })),
    checked: lines.length,
  };
}

function monthNames(): { long: string[]; short: string[] } {
  const long: string[] = [];
  const short: string[] = [];
  try {
    for (let month = 0; month < 12; month += 1) {
      const date = new Date(Date.UTC(2026, month, 1));
      long.push(new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(date));
      short.push(new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(date));
    }
  } catch {
    // Intl is available in every supported runtime; this is a guard only.
    return { long: [], short: [] };
  }
  return { long, short };
}

function collectDates(text: string): { occurrences: RawOccurrence[]; ambiguous: number } {
  const out: RawOccurrence[] = [];
  let ambiguous = 0;
  const { long, short } = monthNames();
  const monthPattern = [...long, ...short].map((name) => name.replace(/\./g, "")).join("|");
  if (monthPattern) {
    const monthFirst = new RegExp(`\\b(?:${monthPattern})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,)?\\s+\\d{4}\\b`, "gi");
    const dayFirst = new RegExp(`\\b\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${monthPattern})\\.?\\s+\\d{4}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = monthFirst.exec(text)) !== null) out.push({ variant: "month-first", index: match.index, matched: match[0] });
    while ((match = dayFirst.exec(text)) !== null) out.push({ variant: "day-first", index: match.index, matched: match[0] });
  }

  const iso = /\b\d{4}-\d{2}-\d{2}\b/g;
  let match: RegExpExecArray | null;
  while ((match = iso.exec(text)) !== null) out.push({ variant: "iso", index: match.index, matched: match[0] });

  // Numeric dates: 3/5/2026 or 3.5.2026. A date with no part above 12 cannot be
  // assigned an order and is counted as ambiguous instead of being guessed.
  const numeric = /\b(\d{1,2})([/.])(\d{1,2})\2(\d{2,4})\b/g;
  while ((match = numeric.exec(text)) !== null) {
    const first = Number(match[1]);
    const second = Number(match[3]);
    if (first > 12 && second <= 12) out.push({ variant: "day-first", index: match.index, matched: match[0] });
    else if (second > 12 && first <= 12) out.push({ variant: "month-first", index: match.index, matched: match[0] });
    else ambiguous += 1;
  }

  return { occurrences: out, ambiguous };
}

// ── Aggregation ──────────────────────────────────────────────────────────────

const DEVIATION_LIMIT = 20;

function buildFamily(
  family: StyleFamilyDefinition,
  occurrences: RawOccurrence[],
  text: string,
  extra: { ambiguousDates?: number } = {},
): StyleFamilyReport {
  const counts = new Map<string, number>();
  for (const occurrence of occurrences) counts.set(occurrence.variant, (counts.get(occurrence.variant) ?? 0) + 1);

  const ordered = [...counts.entries()]
    .map(([variant, count]) => ({ variant, label: labelFor(variant), count }))
    .sort((a, b) => b.count - a.count || a.variant.localeCompare(b.variant));

  const top = ordered[0];
  const tied = ordered.length > 1 && ordered[1].count === top?.count;
  const dominant = top && !tied ? top.variant : null;
  const dominantLabel = dominant ? labelFor(dominant) : null;

  const minority = dominant
    ? occurrences.filter((occurrence) => occurrence.variant !== dominant)
    : occurrences;

  const deviations: StyleDeviation[] = minority
    .sort((a, b) => a.index - b.index)
    .slice(0, DEVIATION_LIMIT)
    .map((occurrence) => ({
      family: family.id,
      familyLabel: family.label,
      variant: occurrence.variant,
      expected: dominantLabel ?? "one convention",
      matched: occurrence.matched,
      index: occurrence.index,
      snippet: snippet(text, occurrence.index, occurrence.matched.length),
    }));

  const report: StyleFamilyReport = {
    id: family.id,
    label: family.label,
    method: extra.ambiguousDates === undefined ? family.method : `${family.method}; ${extra.ambiguousDates} ambiguous numeric date(s) excluded`,
    occurrences: occurrences.length,
    counts: ordered,
    dominant,
    dominantLabel,
    mixed: ordered.length > 1 && occurrences.length > 1,
    deviations,
  };
  return report;
}

/** Compare the eight documented families across one document. */
export function analyzeStyleConsistency(text: string, locale = "en"): StyleConsistencyResult {
  const quotes = collectQuotes(text);
  const dashes = collectDashes(text);
  const ellipses = collectEllipses(text);
  const serial = collectSerialCommas(text);
  const lists = collectListItems(text);
  const numbers = collectNumberStyles(text);
  const headings = collectHeadings(text);
  const dates = collectDates(text);

  const raw: { family: StyleFamilyDefinition; occurrences: RawOccurrence[]; extra?: { ambiguousDates?: number } }[] = [
    { family: STYLE_FAMILIES[0], occurrences: quotes },
    { family: STYLE_FAMILIES[1], occurrences: dashes },
    { family: STYLE_FAMILIES[2], occurrences: ellipses },
    { family: STYLE_FAMILIES[3], occurrences: serial },
    { family: STYLE_FAMILIES[4], occurrences: lists },
    { family: STYLE_FAMILIES[5], occurrences: numbers },
    { family: STYLE_FAMILIES[6], occurrences: headings.occurrences },
    { family: STYLE_FAMILIES[7], occurrences: dates.occurrences, extra: { ambiguousDates: dates.ambiguous } },
  ];

  const families = raw.map((entry) => buildFamily(entry.family, entry.occurrences, text, entry.extra));

  return {
    families,
    words: wordTokens(text, locale).length,
    sentences: sentenceTokens(text, locale).length,
    mixedFamilies: families.filter((family) => family.mixed),
    consistentFamilies: families.filter((family) => !family.mixed && family.occurrences > 0),
    emptyFamilies: families.filter((family) => family.occurrences === 0),
    deviations: families
      .flatMap((family) => family.deviations)
      .sort((a, b) => a.index - b.index)
      .slice(0, 60),
    ambiguousDates: dates.ambiguous,
    headingsChecked: headings.checked,
  };
}

/** Plain-text report for the copy and download buttons. */
export function formatStyleConsistencyReport(result: StyleConsistencyResult): string {
  const lines: string[] = [];
  lines.push("Style consistency report");
  lines.push(`${result.words} words, ${result.sentences} sentences`);
  lines.push(
    `${result.mixedFamilies.length} mixed families, ${result.consistentFamilies.length} consistent, ${result.emptyFamilies.length} with no evidence`,
  );
  lines.push("");
  for (const family of result.families) {
    lines.push(`${family.label}: ${family.mixed ? "MIXED" : family.occurrences === 0 ? "no evidence" : `consistent (${family.dominantLabel})`}`);
    lines.push(`  method: ${family.method}`);
    if (family.counts.length > 0) {
      lines.push(`  found: ${family.counts.map((count) => `${count.label} x${count.count}`).join(", ")}`);
    } else {
      lines.push("  found: nothing matching this family");
    }
  }
  if (result.deviations.length > 0) {
    lines.push("");
    lines.push("Deviations from the dominant convention");
    for (const deviation of result.deviations) {
      lines.push(`  ${deviation.familyLabel}: ${deviation.matched} (expected ${deviation.expected})`);
      lines.push(`    ${deviation.snippet}`);
    }
  }
  lines.push("");
  lines.push(
    "This report compares the document with itself only. It does not apply any style guide and makes no judgement about which convention is correct.",
  );
  return lines.join("\n");
}
