/**
 * UI text expansion estimation — planning arithmetic, not translation.
 *
 * Translating an English interface usually changes how much room the strings
 * take: German compounds run longer, Finnish agglutinates, CJK text often
 * shrinks. Localization teams plan with published "expansion" ranges, and this
 * module is exactly that arithmetic and nothing more: each locale carries a
 * low and a high multiplier, the source line is measured in code points, and
 * the estimate is source × range, reported with the range visible.
 *
 * What the numbers are not: a translation, or a prediction for your specific
 * copy. Actual length depends on the translator, terminology, tone and how
 * literally the text is rendered. The ranges are planning guidance — wide on
 * purpose — and the page says so next to the results.
 *
 * Handling that matters to real UIs:
 *   - placeholders are never translated, so {name}, {{count}}, %s and ${x}
 *     are measured separately, excluded from the base that expands, and added
 *     back unchanged;
 *   - strings shorter than MIN_RELIABLE_CHARS expand proportionally more in
 *     practice (a two-letter label can grow by 200%), so they are flagged
 *     rather than silently trusted;
 *   - an optional character budget turns the high estimate into an overflow
 *     flag, which is what a fixed-width button or table column needs.
 */
import { countCodePoints } from "./encoding.ts";

export interface ExpansionLocale {
  /** BCP-47 tag used as the select value. */
  id: string;
  /** Language name for the results heading. */
  language: string;
  /** Full label for the select. */
  label: string;
  /** Lower bound of the planning range (1 = unchanged). */
  low: number;
  /** Upper bound of the planning range. */
  high: number;
  /** One line on why this language behaves the way it does. */
  note: string;
}

/**
 * Planning ranges compiled from common localization guidance. They are band
 * values, not measurements: German at 1.20-1.35 covers everything from a short
 * verb phrase to a compound noun.
 */
export const EXPANSION_LOCALES: readonly ExpansionLocale[] = [
  {
    id: "de-DE",
    language: "German",
    label: "German (Germany)",
    low: 1.2,
    high: 1.35,
    note: "Compound nouns and long technical words; the classic worst case for tight buttons.",
  },
  {
    id: "fr-FR",
    language: "French",
    label: "French (France)",
    low: 1.15,
    high: 1.2,
    note: "Wordier verb phrases than English, though usually shorter than German.",
  },
  {
    id: "es-ES",
    language: "Spanish",
    label: "Spanish (Spain)",
    low: 1.15,
    high: 1.25,
    note: "Reflexive verbs and prepositions add length; questions gain inverted punctuation.",
  },
  {
    id: "it-IT",
    language: "Italian",
    label: "Italian (Italy)",
    low: 1.15,
    high: 1.25,
    note: "Similar to Spanish in UI strings; longer prepositions and articles.",
  },
  {
    id: "pt-BR",
    language: "Portuguese",
    label: "Portuguese (Brazil)",
    low: 1.15,
    high: 1.25,
    note: "Brazilian Portuguese sits close to Spanish for interface text.",
  },
  {
    id: "nl-NL",
    language: "Dutch",
    label: "Dutch (Netherlands)",
    low: 1.1,
    high: 1.2,
    note: "Often close to English, but compounds can still stretch narrow columns.",
  },
  {
    id: "sv-SE",
    language: "Swedish",
    label: "Swedish (Sweden)",
    low: 1.05,
    high: 1.15,
    note: "Usually the closest of the Nordic languages to English length.",
  },
  {
    id: "da-DK",
    language: "Danish",
    label: "Danish (Denmark)",
    low: 1.05,
    high: 1.15,
    note: "Short words keep most strings near English length.",
  },
  {
    id: "nb-NO",
    language: "Norwegian",
    label: "Norwegian Bokmål (Norway)",
    low: 1.05,
    high: 1.15,
    note: "Comparable to Danish and Swedish; compounds are the exception.",
  },
  {
    id: "fi-FI",
    language: "Finnish",
    label: "Finnish (Finland)",
    low: 1.25,
    high: 1.4,
    note: "Agglutination builds meaning into word endings, making words much longer.",
  },
  {
    id: "pl-PL",
    language: "Polish",
    label: "Polish (Poland)",
    low: 1.2,
    high: 1.3,
    note: "Case endings and longer consonant clusters widen most labels.",
  },
  {
    id: "cs-CZ",
    language: "Czech",
    label: "Czech (Czechia)",
    low: 1.15,
    high: 1.25,
    note: "Similar to Polish but a little tighter on average.",
  },
  {
    id: "tr-TR",
    language: "Turkish",
    label: "Turkish (Türkiye)",
    low: 1.1,
    high: 1.2,
    note: "Suffix chains can lengthen single words considerably, even when sentences stay short.",
  },
  {
    id: "ru-RU",
    language: "Russian",
    label: "Russian (Russia)",
    low: 1.15,
    high: 1.3,
    note: "Cyrillic strings are often longer than English; case endings add to the count.",
  },
  {
    id: "ja-JP",
    language: "Japanese",
    label: "Japanese (Japan)",
    low: 0.5,
    high: 0.7,
    note: "Character-based writing packs more meaning per character, so strings usually contract.",
  },
  {
    id: "zh-CN",
    language: "Chinese",
    label: "Chinese (Simplified, China)",
    low: 0.4,
    high: 0.6,
    note: "The most compact of the common targets; whole phrases fit in a few characters.",
  },
  {
    id: "ko-KR",
    language: "Korean",
    label: "Korean (South Korea)",
    low: 0.5,
    high: 0.7,
    note: "Hangul syllables are information-dense like CJK, though spacing adds a little.",
  },
];

/** Below this many translatable characters a line is flagged as too short. */
export const MIN_RELIABLE_CHARS = 10;

/**
 * Placeholder shapes left untouched by translation. Deliberately conservative:
 * it must not swallow ordinary braces in prose.
 */
const PLACEHOLDER = /\{\{[^{}]*\}\}|\{[^{}\n]{1,40}\}|%[sdif]|\$\{[^{}\n]*\}/g;

export interface ExpansionLine {
  /** The source line exactly as written. */
  source: string;
  /** Code points in the whole line, placeholders included. */
  characters: number;
  /** Number of placeholder tokens found. */
  placeholders: number;
  /** Code points that are actually translated. */
  base: number;
  lowChars: number;
  highChars: number;
  /** Change against the source line, one decimal (25 = +25%). */
  lowPercent: number;
  highPercent: number;
  /** Fewer than MIN_RELIABLE_CHARS translatable characters. */
  tooShort: boolean;
  /** High estimate exceeds the character budget (never true without one). */
  overflow: boolean;
}

export interface ExpansionEstimate {
  locale: ExpansionLocale;
  lines: ExpansionLine[];
  /** Sums over the lines, using the same per-line rounding. */
  total: {
    characters: number;
    base: number;
    placeholders: number;
    lowChars: number;
    highChars: number;
    lowPercent: number;
    highPercent: number;
  };
  tooShortLines: number;
  overflowLines: number;
  /** Budget that was applied, or 0 when none was given. */
  budget: number;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

/** Look up a locale by BCP-47 id. */
export function findExpansionLocale(id: string): ExpansionLocale | undefined {
  return EXPANSION_LOCALES.find((locale) => locale.id === id);
}

/** Default locale for the select: German, the common worst case. */
export const DEFAULT_EXPANSION_LOCALE = "de-DE";

/**
 * Estimate one line under one locale. Exported separately so the per-line
 * arithmetic can be tested without the totals.
 */
export function estimateExpansionLine(
  source: string,
  locale: ExpansionLocale,
  budget = 0,
): ExpansionLine {
  const characters = countCodePoints(source);
  const matches = [...source.matchAll(PLACEHOLDER)];
  const placeholderChars = matches.reduce((sum, match) => sum + countCodePoints(match[0]), 0);
  const base = Math.max(0, characters - placeholderChars);

  const lowChars = Math.round(base * locale.low) + placeholderChars;
  const highChars = Math.round(base * locale.high) + placeholderChars;

  return {
    source,
    characters,
    placeholders: matches.length,
    base,
    lowChars,
    highChars,
    lowPercent: characters > 0 ? round1(((lowChars - characters) / characters) * 100) : 0,
    highPercent: characters > 0 ? round1(((highChars - characters) / characters) * 100) : 0,
    tooShort: base > 0 && base < MIN_RELIABLE_CHARS,
    overflow: budget > 0 && highChars > budget,
  };
}

/**
 * Estimate every non-empty line of a text. The character budget is optional;
 * pass 0 (the default) to only report the ranges.
 */
export function estimateExpansion(
  text: string,
  locale: ExpansionLocale,
  budget = 0,
): ExpansionEstimate {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => estimateExpansionLine(line, locale, budget));

  const total = lines.reduce(
    (accumulator, line) => ({
      characters: accumulator.characters + line.characters,
      base: accumulator.base + line.base,
      placeholders: accumulator.placeholders + line.placeholders,
      lowChars: accumulator.lowChars + line.lowChars,
      highChars: accumulator.highChars + line.highChars,
      lowPercent: 0,
      highPercent: 0,
    }),
    { characters: 0, base: 0, placeholders: 0, lowChars: 0, highChars: 0, lowPercent: 0, highPercent: 0 },
  );

  total.lowPercent =
    total.characters > 0 ? round1(((total.lowChars - total.characters) / total.characters) * 100) : 0;
  total.highPercent =
    total.characters > 0 ? round1(((total.highChars - total.characters) / total.characters) * 100) : 0;

  return {
    locale,
    lines,
    total,
    tooShortLines: lines.filter((line) => line.tooShort).length,
    overflowLines: lines.filter((line) => line.overflow).length,
    budget: budget > 0 ? budget : 0,
  };
}

/** Plain-text report for copy/download. */
export function formatExpansionReport(estimate: ExpansionEstimate): string {
  const { locale, total } = estimate;
  const lines: string[] = [];
  lines.push(`Text expansion estimate — English into ${locale.label}`);
  lines.push(
    `Planning range: x${locale.low.toFixed(2)} to x${locale.high.toFixed(2)} (${total.lowPercent > 0 ? "+" : ""}${total.lowPercent}% to ${total.highPercent > 0 ? "+" : ""}${total.highPercent}%)`,
  );
  lines.push(`Source: ${total.characters} characters | placeholders kept: ${total.placeholders}`);
  lines.push(`Estimate: ${total.lowChars} to ${total.highChars} characters`);
  if (estimate.budget > 0) {
    lines.push(`Budget: ${estimate.budget} characters — ${estimate.overflowLines} line(s) may overflow`);
  }
  lines.push("");
  for (const line of estimate.lines) {
    lines.push(
      `${line.lowChars}-${line.highChars} (was ${line.characters})${line.overflow ? " [over budget]" : ""}${line.tooShort ? " [short string]" : ""}  ${line.source}`,
    );
  }
  lines.push("");
  lines.push("Planning estimate only — not a translation. Actual length varies with translator and terminology.");
  return lines.join("\n");
}
