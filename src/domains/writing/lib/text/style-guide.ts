/**
 * Style-guide adherence: a documented subset of mechanical rules.
 *
 * No tool can enforce a whole style guide, and pretending otherwise is the
 * failure mode to avoid. This module encodes a short list of rules that are
 * purely mechanical — a comma is present or it is not, a quote mark is single or
 * double — and shows the preference each preset applies, so a disagreement can
 * be traced to a rule rather than to an opaque "style score".
 *
 * The guide-specific rules:
 *   serial-comma        whether a comma precedes and/or in a list of three;
 *   quotation-marks     double (AP, Chicago, Microsoft) or single (Oxford);
 *   numbers             spell out under ten (AP, Microsoft) or under one
 *                       hundred (Chicago, Oxford);
 *   em-dash-spacing     open (spaced, AP, Oxford) or closed (Chicago, Microsoft).
 *
 * The universal rules, which every preset applies:
 *   sentence-spacing    one space, not two, after a full stop;
 *   space-before-punctuation  no space before , . ; : ! ?;
 *   latin-abbreviations "e.g." and "i.e." are followed by a comma.
 *
 * Headings, capitalisation of titles, citation formats and anything requiring
 * editorial judgement are out of scope and the tool page says so.
 */
import { wordTokens } from "./tokenize.ts";

export type StyleGuideId = "ap" | "chicago" | "oxford" | "microsoft";

export interface StyleGuidePreset {
  id: StyleGuideId;
  name: string;
  note: string;
  rules: {
    serialComma: boolean;
    doubleQuotes: boolean;
    spellOutUnder: number;
    spacedEmDash: boolean;
  };
}

export const STYLE_GUIDES: StyleGuidePreset[] = [
  {
    id: "ap",
    name: "AP (news)",
    note: "News writing: no serial comma, months abbreviated, open em dashes, figures from 10.",
    rules: { serialComma: false, doubleQuotes: true, spellOutUnder: 10, spacedEmDash: true },
  },
  {
    id: "chicago",
    name: "Chicago (books)",
    note: "Book and journal style: serial comma, closed em dashes, numbers spelled out to one hundred.",
    rules: { serialComma: true, doubleQuotes: true, spellOutUnder: 100, spacedEmDash: false },
  },
  {
    id: "oxford",
    name: "Oxford (British)",
    note: "British style: serial comma, single quotation marks, open em dashes.",
    rules: { serialComma: true, doubleQuotes: false, spellOutUnder: 100, spacedEmDash: true },
  },
  {
    id: "microsoft",
    name: "Microsoft (technical)",
    note: "Technical documentation: serial comma, figures from 10, closed em dashes.",
    rules: { serialComma: true, doubleQuotes: true, spellOutUnder: 10, spacedEmDash: false },
  },
];

export interface StyleFinding {
  rule: string;
  ruleLabel: string;
  preference: string;
  found: string;
  suggestion: string;
  index: number;
  snippet: string;
}

export interface StyleResult {
  guide: StyleGuidePreset;
  findings: StyleFinding[];
  words: number;
  rules: { id: string; label: string; preference: string }[];
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

/** Spell out 0-100; larger values are left to the numeral rule's range check. */
export function spellNumber(value: number): string {
  if (value < 20) return ONES[value];
  if (value === 100) return "one hundred";
  if (value < 100) {
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return TENS[tens] + (ones > 0 ? `-${ONES[ones]}` : "");
  }
  return String(value);
}

/** Tokens that make a nearby numeral idiomatic, so it is not a style issue. */
const NUMERAL_CONTEXT = new Set([
  "%",
  "a.m.",
  "billion",
  "cm",
  "°",
  "°c",
  "°f",
  "days",
  "ft",
  "g",
  "gb",
  "hours",
  "hr",
  "hrs",
  "in",
  "kb",
  "kg",
  "km",
  "lbs",
  "m",
  "mb",
  "mi",
  "million",
  "min",
  "mins",
  "mm",
  "months",
  "oz",
  "p.m.",
  "percent",
  "pm",
  "sec",
  "tb",
  "thousand",
  "weeks",
  "years",
  "yd",
]);

const NUMERAL_PRECEDERS = new Set(["$", "£", "€", "#", "chapter", "figure", "no", "page", "section", "table", "version", "v"]);

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 26);
  const end = Math.min(text.length, index + length + 26);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

export function checkStyle(text: string, guideId: StyleGuideId = "chicago", locale = "en"): StyleResult {
  const guide = STYLE_GUIDES.find((entry) => entry.id === guideId) ?? STYLE_GUIDES[0];
  const findings: StyleFinding[] = [];
  const push = (finding: StyleFinding) => findings.push(finding);

  // ── Serial comma ────────────────────────────────────────────────────────────
  if (guide.rules.serialComma) {
    const pattern = /\b([A-Za-z][A-Za-z'’-]*),\s+([A-Za-z][A-Za-z'’-]*)\s+(and|or)\s+([A-Za-z][A-Za-z'’-]*)\b/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "serial-comma",
        ruleLabel: "Serial comma",
        preference: `${guide.name} uses a comma before ${match[3]} in a list.`,
        found: match[0],
        suggestion: match[0].replace(/\s+(?:and|or)\s+/, (segment) => `,${segment}`),
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  } else {
    const pattern = /,\s+(and|or)\s+/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "serial-comma",
        ruleLabel: "Serial comma",
        preference: `${guide.name} omits the comma before ${match[1]} in a list.`,
        found: match[0].trim(),
        suggestion: ` ${match[1]} `,
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }

  // ── Quotation marks ─────────────────────────────────────────────────────────
  const quotePatterns = guide.rules.doubleQuotes
    ? [/(?<![\w])'[^\s'][^'\n]{0,}'(?![\w])/g, /(?<![\w])‘[^\s][^’\n]{0,}’(?![\w])/g]
    : [/"[^\s"][^"\n]{0,}"/g, /(?<![\w])“[^\s][^”\n]{0,}”(?![\w])/g];
  for (const pattern of quotePatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "quotation-marks",
        ruleLabel: "Quotation marks",
        preference: guide.rules.doubleQuotes ? `${guide.name} uses double quotation marks.` : `${guide.name} uses single quotation marks.`,
        found: match[0],
        suggestion: guide.rules.doubleQuotes ? "use double quotation marks" : "use single quotation marks",
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }

  // ── Numbers ────────────────────────────────────────────────────────────────
  const limit = guide.rules.spellOutUnder;
  if (limit > 1) {
    const pattern = /(?<![\w.$£€#])(\d+)(?![\w.:%-])/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const value = Number(match[1]);
      if (!Number.isFinite(value) || value >= limit) continue;
      const after = text.slice(match.index + match[0].length).match(/^\s*([A-Za-z.°%]+)/)?.[1]?.toLowerCase() ?? "";
      const before = text.slice(0, match.index).match(/([A-Za-z$.£€#]+)\s*$/)?.[1]?.toLowerCase() ?? "";
      if (NUMERAL_CONTEXT.has(after) || NUMERAL_PRECEDERS.has(before)) continue;
      push({
        rule: "numbers",
        ruleLabel: "Numbers",
        preference: `${guide.name} spells out numbers below ${limit}.`,
        found: match[1],
        suggestion: spellNumber(value),
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }

  // ── Em dashes ──────────────────────────────────────────────────────────────
  {
    const pattern = guide.rules.spacedEmDash ? /\S—\S/g : /\s—\s/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "em-dash",
        ruleLabel: "Em dash spacing",
        preference: guide.rules.spacedEmDash ? `${guide.name} sets em dashes open, with spaces.` : `${guide.name} sets em dashes closed, without spaces.`,
        found: match[0],
        suggestion: guide.rules.spacedEmDash ? "space around the em dash" : "remove the spaces around the em dash",
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }

  // ── Universal: one space after a sentence ──────────────────────────────────
  {
    const pattern = /[.!?][ \t]{2,}\S/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "sentence-spacing",
        ruleLabel: "Sentence spacing",
        preference: "Modern guides use a single space after a full stop.",
        found: "multiple spaces",
        suggestion: "use one space",
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }

  // ── Universal: no space before punctuation ─────────────────────────────────
  {
    const pattern = /[ \t]+[,.!?;:]/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      push({
        rule: "space-before-punctuation",
        ruleLabel: "Space before punctuation",
        preference: "Punctuation follows the preceding word with no space.",
        found: match[0],
        suggestion: match[0].trim(),
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }

  // ── Universal: e.g. / i.e. take a comma ────────────────────────────────────
  {
    const pattern = /\b(?:e\.g|i\.e)\.(?!\s*,)/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const isEg = match[0].toLowerCase().startsWith("e");
      push({
        rule: "latin-abbreviation",
        ruleLabel: "Latin abbreviations",
        preference: "e.g. and i.e. are followed by a comma in running text.",
        found: match[0],
        suggestion: isEg ? "e.g.," : "i.e.,",
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }

  findings.sort((a, b) => a.index - b.index);

  return {
    guide,
    findings,
    words: wordTokens(text, locale).length,
    rules: [
      { id: "serial-comma", label: "Serial comma", preference: guide.rules.serialComma ? "used" : "omitted" },
      { id: "quotation-marks", label: "Quotation marks", preference: guide.rules.doubleQuotes ? "double" : "single" },
      { id: "numbers", label: "Numbers", preference: limit > 1 ? `spell out under ${limit}` : "figures" },
      { id: "em-dash", label: "Em dash spacing", preference: guide.rules.spacedEmDash ? "open (spaced)" : "closed" },
      { id: "sentence-spacing", label: "Sentence spacing", preference: "one space" },
      { id: "space-before-punctuation", label: "Space before punctuation", preference: "none" },
      { id: "latin-abbreviation", label: "Latin abbreviations", preference: "followed by a comma" },
    ],
  };
}
