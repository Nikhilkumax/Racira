/**
 * Number-format consistency analyser.
 *
 * Scans free text for numeric tokens, works out how each one is punctuated
 * (decimal separator, grouping separator, sign, currency, percent, unit) and
 * reports genuine inconsistencies in the document: mixed decimal separators,
 * mixed grouping, ambiguous values such as "1.500", irregular grouping,
 * inconsistent percent/currency/unit spacing and mixed range dashes.
 *
 * Rules are heuristic by design and the UI repeats that: "1.500" is reported as
 * ambiguous because it genuinely is (1,500 in the US, 1.5 in Germany), not
 * because the analyser knows the document's locale. Every finding carries the
 * context and the interpretation used, so nothing is silently "corrected".
 */

export type NumberStyle = "us" | "eu" | "none";

export interface ParsedNumber {
  raw: string;
  /** UTF-16 offset of the number in the source text. */
  index: number;
  /** End offset (exclusive). */
  end: number;
  /** Digits only, in order. */
  digits: string;
  /** Resolved value, or null when the punctuation is not interpretable. */
  value: number | null;
  decimalSeparator: "." | "," | null;
  thousandsSeparator: string | null;
  /** us = 1,234.56; eu = 1.234,56; none = no separators at all. */
  style: NumberStyle;
  /** Number of digits after the decimal separator. */
  decimalDigits: number;
  currency: string | null;
  percent: boolean;
  /** True when two interpretations are possible (e.g. "1.500"). */
  ambiguous: boolean;
  /** True when grouping groups are not the standard 3-digit pattern. */
  irregularGrouping: boolean;
}

export type FindingKind =
  | "mixed-decimal"
  | "mixed-grouping"
  | "ambiguous-separator"
  | "irregular-grouping"
  | "ungrouped-large-number"
  | "percent-spacing"
  | "currency-placement"
  | "mixed-currency"
  | "unit-spacing"
  | "range-dash";

export interface Finding {
  kind: FindingKind;
  index: number;
  snippet: string;
  message: string;
}

/** Common units used for the unit-spacing rule (kept short and concrete). */
const UNITS = [
  "mm", "cm", "m", "km", "in", "ft", "yd", "mi",
  "g", "kg", "mg", "lb", "oz", "t",
  "ml", "l", "cl", "gal", "fl oz",
  "s", "ms", "min", "hr", "h", "days", "weeks",
  "px", "pt", "em", "rem", "%", "°C", "°F", "K",
  "GB", "MB", "KB", "TB", "bps", "Hz", "kHz", "MHz", "GHz",
  "W", "kW", "V", "A", "mA", "Pa", "kPa", "bar", "psi",
];

const UNIT_ALT = UNITS.map((unit) => unit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

// A number, with an optional leading currency symbol or ISO code, and optional
// sign. Grouping separators may be "." "," "'" "’" space or the narrow spaces.
const NUMBER_RE = new RegExp(
  "(?:([$€£¥₹₽₩฿])\\s?|\\b(USD|EUR|GBP|JPY|INR|CAD|AUD)\\s?)?" +
    "([-+−]?(?:\\d{1,3}(?:[.,\\u00a0\\u202f '’]\\d{3})+|\\d+)(?:[.,]\\d+)?)" +
    "(\\s?%)?" +
    "(\\s?(?:" + UNIT_ALT + ")\\b)?",
  "gu",
);

function separatorsIn(body: string): { pos: number; ch: string }[] {
  const out: { pos: number; ch: string }[] = [];
  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];
    if (char === "." || char === "," || char === " " || char === "\u00a0" || char === "\u202f" || char === "'" || char === "\u2019") {
      out.push({ pos: i, ch: char });
    }
  }
  return out;
}

function groupsFrom(body: string, separators: { pos: number }[]): number[] {
  const groups: number[] = [];
  let previous = -1;
  for (const separator of separators) {
    groups.push(separator.pos - previous - 1);
    previous = separator.pos;
  }
  groups.push(body.length - previous - 1);
  return groups;
}

function isStandardGrouping(groups: number[]): boolean {
  if (groups.length < 2) return false;
  if (groups[0] < 1 || groups[0] > 3) return false;
  for (let i = 1; i < groups.length - 1; i += 1) {
    if (groups[i] !== 3) return false;
  }
  // Last group is the decimal part when a decimal separator was chosen; when no
  // decimal separator exists, every trailing group must be exactly 3 digits.
  return true;
}

/** Interpret a raw numeric token's separators. */
export function parseNumberToken(raw: string): {
  digits: string;
  value: number | null;
  decimalSeparator: "." | "," | null;
  thousandsSeparator: string | null;
  style: NumberStyle;
  decimalDigits: number;
  ambiguous: boolean;
  irregularGrouping: boolean;
} {
  const body = raw.replace(/^[-+−]/, "");
  const sign = /^[-−]/.test(raw) ? -1 : 1;
  const withSign = (v: number | null): number | null => (v === null ? null : sign * v);
  const separators = separatorsIn(body);
  const digits = body.replace(/[^\d]/g, "");
  const base = {
    digits,
    decimalSeparator: null as "." | "," | null,
    thousandsSeparator: null as string | null,
    style: "none" as NumberStyle,
    decimalDigits: 0,
    ambiguous: false,
    irregularGrouping: false,
  };
  if (separators.length === 0) {
    return { ...base, value: withSign(digits ? Number(digits) : null) };
  }

  const last = separators[separators.length - 1];
  const afterLast = body.slice(last.pos + 1).replace(/[^\d]/g, "").length;
  const sameChar = separators.every((separator) => separator.ch === last.ch);

  // Interpretation A — every separator is a grouping separator.
  const groupsA = groupsFrom(body, separators);
  const groupingOnlyValid = sameChar && isStandardGrouping(groupsA) && groupsA.every((g, i) => i === 0 || g === 3);

  // Interpretation B — the last separator is the decimal separator.
  const headSeparators = separators.slice(0, -1);
  const remainingSame = headSeparators.every((separator) => separator.ch === headSeparators[0]?.ch);
  const groupsB = headSeparators.length ? groupsFrom(body.slice(0, last.pos), headSeparators) : [];
  const decimalValid =
    afterLast >= 1 &&
    (headSeparators.length === 0 ||
      (remainingSame && groupsB.length >= 2 && groupsB[0] >= 1 && groupsB[0] <= 3 && groupsB.slice(1).every((g) => g === 3)));

  const isGroupingChar = last.ch !== "." && last.ch !== "," ? true : false;
  const lastIsGrouping = isGroupingChar && sameChar && afterLast === 3;

  if (groupingOnlyValid && decimalValid) {
    // e.g. "1.500" — both readings are legal; report as ambiguous, resolve as grouping.
    return {
      ...base,
      value: withSign(Number(digits)),
      thousandsSeparator: last.ch,
      style: last.ch === "." ? "eu" : "us",
      ambiguous: true,
    };
  }

  if (lastIsGrouping || groupingOnlyValid) {
    const irregular =
      groupsA.length >= 2 && !(groupsA[0] >= 1 && groupsA[0] <= 3 && groupsA.slice(1, -1).every((g) => g === 3) && groupsA[groupsA.length - 1] === 3);
    return {
      ...base,
      value: withSign(Number(digits)),
      thousandsSeparator: last.ch,
      style: last.ch === "." ? "eu" : "us",
      irregularGrouping: irregular,
    };
  }

  if (decimalValid) {
    const decimalSeparator = last.ch === "." || last.ch === "," ? (last.ch as "." | ",") : null;
    const thousands = headSeparators.length ? headSeparators[0].ch : null;
    let value: number | null = null;
    if (digits) {
      const integer = digits.slice(0, digits.length - afterLast);
      const fraction = digits.slice(digits.length - afterLast);
      value = Number(`${integer || "0"}.${fraction}`);
    }
    const groupsBefore = groupsB;
    const irregular =
      groupsBefore.length >= 2 &&
      !(groupsBefore[0] >= 1 && groupsBefore[0] <= 3 && groupsBefore.slice(1).every((g) => g === 3));
    return {
      ...base,
      value: withSign(value),
      decimalSeparator,
      thousandsSeparator: thousands,
      style: decimalSeparator === "." ? "us" : decimalSeparator === "," ? "eu" : "none",
      decimalDigits: afterLast,
      irregularGrouping: irregular,
    };
  }

  // Neither reading is standard (e.g. "1,23,456"): keep the digits, flag it.
  return { ...base, value: withSign(digits ? Number(digits) : null), irregularGrouping: true };
}

/** Scan text for numeric tokens with their punctuation context. */
export function parseNumbers(text: string): ParsedNumber[] {
  const out: ParsedNumber[] = [];
  for (const match of text.matchAll(NUMBER_RE)) {
    const raw = match[0];
    const numeric = match[3];
    if (!numeric) continue;
    const index = match.index ?? 0;
    const parsed = parseNumberToken(numeric);
    out.push({
      raw,
      index,
      end: index + raw.length,
      ...parsed,
      currency: (match[1] ?? match[2] ?? null) as string | null,
      percent: Boolean(match[4]),
    });
  }
  return out;
}

const CONTEXT = 24;

function contextOf(text: string, index: number, length: number): string {
  const start = Math.max(0, index - CONTEXT);
  const end = Math.min(text.length, index + length + CONTEXT);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\n/g, " ")}${end < text.length ? "…" : ""}`;
}

/** All consistency findings for the text, in document order. */
export function detectNumberFormatIssues(text: string): { numbers: ParsedNumber[]; findings: Finding[] } {
  const numbers = parseNumbers(text);
  const findings: Finding[] = [];

  const decimals = new Set(numbers.filter((n) => n.decimalSeparator).map((n) => n.decimalSeparator as string));
  const groupings = new Set(
    numbers.filter((n) => n.thousandsSeparator).map((n) => n.thousandsSeparator as string),
  );

  const first = (predicate: (n: ParsedNumber) => boolean): ParsedNumber | undefined =>
    numbers.find(predicate);

  if (decimals.size > 1) {
    const sample = first((n) => n.decimalSeparator !== null);
    findings.push({
      kind: "mixed-decimal",
      index: sample?.index ?? 0,
      snippet: sample ? contextOf(text, sample.index, sample.raw.length) : "",
      message:
        "Both \u201c,\u201d and \u201c.\u201d are used as decimal separators. Pick one convention for the whole document.",
    });
  }

  if (groupings.size > 1) {
    const sample = first((n) => n.thousandsSeparator !== null);
    findings.push({
      kind: "mixed-grouping",
      index: sample?.index ?? 0,
      snippet: sample ? contextOf(text, sample.index, sample.raw.length) : "",
      message:
        "Both \u201c,\u201d and \u201c.\u201d are used to group thousands. Mixed grouping makes \"1,234\" and \"1.234\" mean different things to different readers.",
    });
  }

  for (const number of numbers) {
    if (number.ambiguous) {
      findings.push({
        kind: "ambiguous-separator",
        index: number.index,
        snippet: contextOf(text, number.index, number.raw.length),
        message: `\u201c${number.raw}\u201d reads as ${number.value?.toLocaleString("en-US")} with a grouping separator, but as a decimal in locales that use \u201c${number.thousandsSeparator ?? "."}\u201d for grouping.`,
      });
    }
    if (number.irregularGrouping) {
      findings.push({
        kind: "irregular-grouping",
        index: number.index,
        snippet: contextOf(text, number.index, number.raw.length),
        message: `\u201c${number.raw}\u201d does not use standard three-digit grouping. (Indian lakh/crore grouping is valid in en-IN \u2014 this is informational.)`,
      });
    }
    const digitCount = number.digits.length;
    if (!number.thousandsSeparator && !number.decimalSeparator && digitCount >= 5) {
      findings.push({
        kind: "ungrouped-large-number",
        index: number.index,
        snippet: contextOf(text, number.index, number.raw.length),
        message: `\u201c${number.raw}\u201d has ${digitCount} digits with no grouping. Large numbers are easier to check with a thousands separator.`,
      });
    }
  }

  // Percent spacing: "50%" vs "50 %".
  const percentMatches = [...text.matchAll(/(\d)\s?%/g)];
  const spaced = percentMatches.filter((m) => /\s/.test(m[0].slice(1))).length;
  const unspaced = percentMatches.length - spaced;
  if (spaced > 0 && unspaced > 0) {
    const sample = percentMatches.find((m) => /\s/.test(m[0].slice(1)));
    findings.push({
      kind: "percent-spacing",
      index: sample?.index ?? 0,
      snippet: sample ? contextOf(text, sample.index, sample[0].length) : "",
      message: "Percent signs are spaced inconsistently (\u201c50 %\u201d in some places, \u201c50%\u201d in others).",
    });
  }

  // Currency placement: symbol before the number vs after it.
  const before = [...text.matchAll(/[$€£¥₹₽₩฿]\s?\d/g)].length;
  const after = [...text.matchAll(/\d\s?[$€£¥₹₽₩฿]/g)].length;
  if (before > 0 && after > 0) {
    findings.push({
      kind: "currency-placement",
      index: 0,
      snippet: "",
      message: "Currency symbols appear both before and after amounts. Choose one position for the whole document.",
    });
  }

  // Symbols can sit before or after the amount, so scan the whole text rather
  // than only the leading-currency captures on the parsed numbers.
  const currencies = new Set(
    [...text.matchAll(/[$€£¥₹₽₩฿]|\b(?:USD|EUR|GBP|JPY|INR|CAD|AUD)\b/g)].map((match) => match[0]),
  );
  if (currencies.size > 1) {
    findings.push({
      kind: "mixed-currency",
      index: 0,
      snippet: "",
      message: `More than one currency appears (${[...currencies].join(", ")}). Amounts are not directly comparable without a conversion rate.`,
    });
  }

  // Unit spacing: "5 kg" vs "5kg", per unit.
  const unitSpacing = new Map<string, { spaced: number; unspaced: number; index: number }>();
  for (const match of text.matchAll(new RegExp("(\\d)\\s?(" + UNIT_ALT + ")(?!\\w)", "gu"))) {
    const unit = match[2];
    const spaced = /\s/.test(match[0].slice(1, match[0].length - unit.length));
    const entry = unitSpacing.get(unit) ?? { spaced: 0, unspaced: 0, index: match.index ?? 0 };
    if (spaced) entry.spaced += 1;
    else entry.unspaced += 1;
    unitSpacing.set(unit, entry);
  }
  for (const [unit, entry] of unitSpacing) {
    if (entry.spaced > 0 && entry.unspaced > 0) {
      findings.push({
        kind: "unit-spacing",
        index: entry.index,
        snippet: contextOf(text, entry.index, unit.length + 3),
        message: `The unit \u201c${unit}\u201d is written both with and without a space after the number.`,
      });
    }
  }

  const hyphenRanges = [...text.matchAll(/\d\s?-\s?\d/g)];
  const dashRanges = [...text.matchAll(/\d\s?–\s?\d/g)];
  if (hyphenRanges.length > 0 && dashRanges.length > 0) {
    findings.push({
      kind: "range-dash",
      index: 0,
      snippet: "",
      message: "Number ranges use both a hyphen (\u201c5-10\u201d) and an en dash (\u201c5–10\u201d).",
    });
  }

  findings.sort((a, b) => a.index - b.index);
  return { numbers, findings };
}

export type TargetStyle = "us" | "eu" | "si";

const GROUP_CHAR: Record<TargetStyle, string> = { us: ",", eu: ".", si: "\u202f" };
const DECIMAL_CHAR: Record<TargetStyle, string> = { us: ".", eu: ",", si: "," };

function groupDigits(digits: string, separator: string): string {
  let out = "";
  for (let i = 0; i < digits.length; i += 1) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += separator;
  }
  return out;
}

/**
 * Rewrite every detected number in the chosen convention. The characters
 * around the digits (currency symbol, sign, percent, unit) are preserved
 * exactly as the author wrote them — only the digit punctuation changes.
 */
export function normalizeNumbers(text: string, target: TargetStyle): string {
  const numbers = parseNumbers(text);
  let out = "";
  let cursor = 0;
  for (const number of numbers) {
    out += text.slice(cursor, number.index);
    const firstDigit = number.raw.search(/\d/);
    const lastDigit = number.raw.length - 1 - [...number.raw].reverse().findIndex((char) => /\d/.test(char));
    const prefix = firstDigit > 0 ? number.raw.slice(0, firstDigit) : "";
    const suffix = lastDigit >= 0 ? number.raw.slice(lastDigit + 1) : "";
    const integerDigits = (number.digits.slice(0, number.digits.length - number.decimalDigits) || number.digits).replace(/^0+(?=\d)/, "");
    const fractionDigits = number.decimalDigits > 0 ? number.digits.slice(-number.decimalDigits) : "";
    // Numbers the author wrote without separators and that are four digits or
    // shorter are left alone: regrouping "2026" into "2,026" mangles years and
    // small quantities, and no style guide asks for that.
    const hadSeparators = number.decimalSeparator !== null || number.thousandsSeparator !== null;
    let body =
      !hadSeparators && integerDigits.length <= 4
        ? integerDigits
        : groupDigits(integerDigits, GROUP_CHAR[target]);
    if (fractionDigits) body += DECIMAL_CHAR[target] + fractionDigits;
    out += prefix + body + suffix;
    cursor = number.end;
  }
  out += text.slice(cursor);
  return out;
}

/** Example rendering of a number in each target convention, for the legend. */
export function conventionSamples(): { target: TargetStyle; label: string; sample: string }[] {
  return [
    { target: "us", label: "US / UK (1,234,567.89)", sample: "1,234,567.89" },
    { target: "eu", label: "European (1.234.567,89)", sample: "1.234.567,89" },
    { target: "si", label: "SI / French (1\u202f234\u202f567,89)", sample: "1\u202f234\u202f567,89" },
  ];
}
