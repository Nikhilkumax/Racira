/**
 * Dictionary-backed spell checking, independent of any particular dictionary.
 *
 * This module never contains a word list. It scans text into tokens, decides
 * which tokens are worth looking up, and delegates every correctness and
 * suggestion decision to an injected checker — in the app that is `nspell`
 * (MIT) reading the `dictionary-en` Hunspell data (v4.0.0, MIT AND BSD, the
 * en_US dictionary derived from SCOWL). Unit tests inject a small fake checker
 * for determinism, and `spell-dictionary.test.ts` exercises the real pair.
 *
 * What this engine can and cannot do:
 *   - it checks spelling only against the dictionary it is given, so names,
 *     jargon, brand names and code-like words are reported as unknown;
 *   - suggestions are whatever the checker produces (nspell walks character
 *     edits and keeps the candidates that exist in the dictionary), not a
 *     hand-written correction table;
 *   - it says nothing about meaning: "form" and "from" are both known words.
 */
import { SPAN_SKIP_PATTERNS } from "./code-likeness.ts";

export interface SpellChecker {
  correct(word: string): boolean;
  suggest(word: string): string[];
}

export interface SpellToken {
  /** The token exactly as written. */
  word: string;
  /** Lowercased, with curly apostrophes straightened, for lookups. */
  normalized: string;
  start: number;
  end: number;
  /** No Latin letters at all (Greek, Cyrillic, CJK …). */
  nonLatin: boolean;
  acronym: boolean;
  hasDigit: boolean;
  innerCapital: boolean;
  hasHyphen: boolean;
}

export interface Misspelling {
  word: string;
  normalized: string;
  /** Offset of the first occurrence. */
  start: number;
  end: number;
  /** How many times this exact spelling occurs. */
  count: number;
  /** Offsets of up to 12 occurrences, for navigation. */
  occurrences: number[];
  /** Checker suggestions, empty when none were produced or the budget ran out. */
  suggestions: string[];
  /** True when the suggestion budget was exhausted before this word. */
  suggestionsSkipped: boolean;
}

export interface SpellReport {
  /** Word-like tokens found in the text. */
  tokens: number;
  /** Tokens in the Latin script. */
  latinTokens: number;
  /** Tokens actually sent to the dictionary. */
  checked: number;
  /** Tokens skipped by the rules below (code-like, acronyms, digits, allow list). */
  skipped: number;
  /** Distinct words reported as unknown. */
  uniqueUnknown: number;
  /** Total occurrences of those words. */
  totalUnknown: number;
  misspellings: Misspelling[];
  /** Distinct words for which suggestions were computed. */
  suggestBudget: number;
  /** Distinct words left without suggestions because of the budget. */
  suggestSkipped: number;
}

export interface SpellOptions {
  /** Skip ALL-CAPS tokens such as API or NASA. Default true. */
  ignoreAcronyms?: boolean;
  /** Skip tokens containing digits, e.g. utf8 or ISO8601. Default true. */
  ignoreNumbers?: boolean;
  /** Skip tokens with a capital after the first letter, e.g. iPhone or eBay. Default true. */
  ignoreInnerCapitals?: boolean;
  /** Skip URLs, emails, file names, code spans and @handles. Default true. */
  ignoreCodeLike?: boolean;
  /** Skip very short tokens. Default 2. */
  minLength?: number;
  /** Extra words to accept (case-insensitive). Default none. */
  allow?: Iterable<string>;
  /** How many distinct unknown words get suggestions. Default 40. */
  suggestionBudget?: number;
  /** Cap on reported distinct words. Default 300. */
  maxReported?: number;
}

/** Tokens shorter than this are not looked up — single letters are not spellings. */
export const MIN_SPELL_LENGTH = 2;
/** Distinct unknown words that receive suggestions before the budget is called in. */
export const SUGGESTION_BUDGET = 40;
/** Distinct unknown words reported at most. */
export const MAX_REPORTED = 300;

// A token starts with a letter and may continue with letters, digits, hyphens
// and apostrophes, so "utf8" and "ISO8601" stay whole and are skipped as
// code-like rather than being cut into "utf".
const TOKEN_PATTERN = /[\p{L}][\p{L}\p{N}'’\u2019-]*/gu;
const TRAILING_JUNK = /['’-]+$/;

/** Normalise a token for dictionary lookup: straight apostrophes, lower case. */
export function normalizeForLookup(word: string): string {
  return word.replace(/[\u2018\u2019]/g, "'").toLowerCase();
}

/** Spans in `text` that are identifiers rather than prose. */
export function codeLikeSpans(text: string): [number, number][] {
  const spans: [number, number][] = [];
  for (const pattern of SPAN_SKIP_PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      spans.push([match.index, match.index + match[0].length]);
      if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
    }
  }
  const code = /`[^`]*`/g;
  let match: RegExpExecArray | null;
  while ((match = code.exec(text)) !== null) spans.push([match.index, match.index + match[0].length]);
  return spans;
}

function overlaps(spans: [number, number][], start: number, end: number): boolean {
  for (const [from, to] of spans) {
    if (start < to && end > from) return true;
  }
  return false;
}

/** Split text into the tokens this engine is willing to look up. */
export function spellTokens(text: string, options: SpellOptions = {}): SpellToken[] {
  const minLength = options.minLength ?? MIN_SPELL_LENGTH;
  const tokens: SpellToken[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const word = match[0].replace(TRAILING_JUNK, "");
    if (word.length < minLength) continue;
    const start = match.index;
    const letters = word.replace(/[^\p{L}]/gu, "");
    tokens.push({
      word,
      normalized: normalizeForLookup(word),
      start,
      end: start + word.length,
      nonLatin: !/[A-Za-z]/.test(letters),
      acronym: word.length >= 2 && /^[A-Z][A-Z0-9]*$/.test(word),
      hasDigit: /\d/.test(word),
      // A capital after the first letter, plus a lower-case letter somewhere,
      // marks the camel-case brand shapes (iPhone, GitHub, macOS).
      innerCapital: /[A-Z]/.test(word.slice(1)) && /[a-z]/.test(word),
      hasHyphen: /-/.test(word),
    });
  }
  return tokens;
}

/** True when a token is excluded from lookup by the current options. */
export function isSkippedToken(token: SpellToken, options: SpellOptions = {}): boolean {
  if (token.nonLatin) return true;
  if (token.word.length < (options.minLength ?? MIN_SPELL_LENGTH)) return true;
  if ((options.ignoreAcronyms ?? true) && token.acronym) return true;
  if ((options.ignoreNumbers ?? true) && token.hasDigit) return true;
  if ((options.ignoreInnerCapitals ?? true) && token.innerCapital) return true;
  return false;
}

/** Word-shaped pieces of a hyphenated token, with their offsets. */
export function hyphenParts(word: string): { part: string; offset: number }[] {
  const parts: { part: string; offset: number }[] = [];
  const pattern = /[\p{L}\p{N}]+/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(word)) !== null) {
    if (match[0].length >= 2) parts.push({ part: match[0], offset: match.index });
  }
  return parts;
}

interface Failure {
  word: string;
  normalized: string;
  start: number;
  end: number;
}

/**
 * Check every eligible token and group the failures by spelling.
 *
 * Hyphenated tokens are looked up whole first. When the compound is unknown,
 * each part of at least two letters is looked up separately and only the parts
 * the dictionary rejects are reported — "well-know" is reported as "know",
 * which is where the error actually is.
 */
export function checkSpelling(text: string, checker: SpellChecker, options: SpellOptions = {}): SpellReport {
  const tokens = spellTokens(text, options);
  const allow = new Set<string>();
  if (options.allow) for (const word of options.allow) allow.add(normalizeForLookup(word));
  const spans = (options.ignoreCodeLike ?? true) ? codeLikeSpans(text) : [];
  const byWord = new Map<string, Misspelling>();
  let latinTokens = 0;
  let checked = 0;
  let skipped = 0;

  const record = (failure: Failure) => {
    const existing = byWord.get(failure.normalized);
    if (existing) {
      existing.count += 1;
      if (existing.occurrences.length < 12) existing.occurrences.push(failure.start);
      return;
    }
    byWord.set(failure.normalized, {
      word: failure.word,
      normalized: failure.normalized,
      start: failure.start,
      end: failure.end,
      count: 1,
      occurrences: [failure.start],
      suggestions: [],
      suggestionsSkipped: false,
    });
  };

  for (const token of tokens) {
    if (!token.nonLatin) latinTokens += 1;
    if (isSkippedToken(token, options) || allow.has(token.normalized)) {
      skipped += 1;
      continue;
    }
    if (spans.length > 0 && overlaps(spans, token.start, token.end)) {
      skipped += 1;
      continue;
    }
    checked += 1;
    if (checker.correct(token.normalized)) continue;

    if (token.hasHyphen) {
      const parts = hyphenParts(token.word);
      const rejected = parts.filter((entry) => !checker.correct(normalizeForLookup(entry.part)));
      if (parts.length > 0 && rejected.length === 0) continue;
      if (parts.length > 0) {
        for (const entry of rejected) {
          record({
            word: entry.part,
            normalized: normalizeForLookup(entry.part),
            start: token.start + entry.offset,
            end: token.start + entry.offset + entry.part.length,
          });
        }
        continue;
      }
    }

    record({ word: token.word, normalized: token.normalized, start: token.start, end: token.end });
  }

  const misspellings = [...byWord.values()]
    .sort((a, b) => a.start - b.start)
    .slice(0, options.maxReported ?? MAX_REPORTED);
  const budget = options.suggestionBudget ?? SUGGESTION_BUDGET;
  let used = 0;
  let suggestSkipped = 0;
  for (const entry of misspellings) {
    if (used >= budget) {
      entry.suggestionsSkipped = true;
      suggestSkipped += 1;
      continue;
    }
    entry.suggestions = checker.suggest(entry.normalized).slice(0, 6);
    used += 1;
  }

  let totalUnknown = 0;
  for (const entry of byWord.values()) totalUnknown += entry.count;

  return {
    tokens: tokens.length,
    latinTokens,
    checked,
    skipped,
    uniqueUnknown: byWord.size,
    totalUnknown,
    misspellings,
    suggestBudget: used,
    suggestSkipped,
  };
}

/** Report text for the copy/download buttons. */
export function formatSpellReport(report: SpellReport): string {
  if (report.uniqueUnknown === 0) {
    return `No unknown words. ${report.checked} words checked against the dictionary.`;
  }
  const lines = [
    `Unknown words: ${report.uniqueUnknown} distinct, ${report.totalUnknown} occurrences`,
    `Words checked: ${report.checked} of ${report.tokens} tokens (${report.skipped} skipped)`,
    "",
  ];
  for (const entry of report.misspellings) {
    const suggestions =
      entry.suggestions.length > 0
        ? entry.suggestions.join(", ")
        : entry.suggestionsSkipped
          ? "(suggestions not computed)"
          : "(no suggestions)";
    lines.push(`${entry.word} ×${entry.count} → ${suggestions}`);
  }
  if (report.suggestSkipped > 0) {
    lines.push("", `Suggestions were computed for the first ${report.suggestBudget} unknown words.`);
  }
  return lines.join("\n");
}
