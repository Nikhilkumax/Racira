/**
 * Technical to plain language: a converter with two published tables and one
 * piece of analysis the jargon remover does not do.
 *
 *   - the shared jargon table supplies a plainer phrase for each matched term;
 *   - a local abbreviation table expands acronyms (API, SLA, CDN …);
 *   - each finding is reported with the sentence it sits in and that
 *     sentence's length, because a technical term inside a 35-word sentence is
 *     a much harder read than the same term in a 12-word one.
 *
 * It also reports what it did not touch: long words still present in the plain
 * version that are in neither table. A converter that silently leaves half the
 * jargon behind is worse than one that names the leftovers, so the leftovers
 * are named.
 */
import { JARGON_TERMS } from "./jargon.ts";
import {
  applyPhraseReplacements,
  findPhraseMatches,
  type PhraseMatch,
} from "./phrases.ts";
import { sentenceTokens, words } from "./tokenize.ts";

export interface Abbreviation {
  abbr: string;
  expansion: string;
  note: string;
}

/** Acronyms expanded on sight. All are uppercase so ordinary words never match. */
export const ABBREVIATIONS: readonly Abbreviation[] = [
  { abbr: "API", expansion: "application programming interface", note: "Spell it out on first use, then the acronym is fine." },
  { abbr: "CPU", expansion: "processor", note: "Plain prose rarely needs the exact component name." },
  { abbr: "RAM", expansion: "memory", note: "Say memory unless the distinction from storage matters." },
  { abbr: "SSD", expansion: "solid-state drive", note: "A reader outside engineering usually just needs drive." },
  { abbr: "CDN", expansion: "content delivery network", note: "Used in performance notes; expand once." },
  { abbr: "DNS", expansion: "domain name system", note: "Explain the job, not the protocol name." },
  { abbr: "SSL", expansion: "secure connection", note: "Users care that the connection is encrypted, not which protocol." },
  { abbr: "TLS", expansion: "secure connection", note: "Same rule as SSL: name the guarantee, not the standard." },
  { abbr: "HTTP", expansion: "web protocol", note: "Rarely useful outside developer documentation." },
  { abbr: "URL", expansion: "web address", note: "Web address is understood by everyone." },
  { abbr: "SLA", expansion: "service commitment", note: "Commitment is what the customer is buying." },
  { abbr: "KPI", expansion: "metric", note: "Name the measure rather than the acronym." },
  { abbr: "SEO", expansion: "search visibility", note: "Search visibility says what the work is for." },
  { abbr: "CMS", expansion: "content management system", note: "Expand once, then the acronym is fine." },
  { abbr: "PDF", expansion: "PDF file", note: "The format name is already the plain term." },
  { abbr: "FAQ", expansion: "frequently asked questions", note: "Expand on first use in formal documents." },
  { abbr: "UI", expansion: "interface", note: "Interface alone is plainer than the acronym." },
  { abbr: "UX", expansion: "user experience", note: "Expand unless the audience is product specialists." },
  { abbr: "OS", expansion: "operating system", note: "Expand in user-facing prose." },
  { abbr: "SQL", expansion: "database query language", note: "Name what it is for." },
  { abbr: "JSON", expansion: "structured data", note: "Only developers need the format name." },
  { abbr: "VPN", expansion: "private connection", note: "Say what it gives the user." },
  { abbr: "GPU", expansion: "graphics processor", note: "Expand outside hardware discussions." },
];

/** Terms are only relevant if they mean something; these mark time and idiom. */
const LONG_WORD_LETTERS = 12;
const MAX_UNTOUCHED = 8;

export interface PlainFinding {
  source: string;
  plain: string;
  note: string;
  /** The sentence the term was found in. */
  sentence: string;
  sentenceWords: number;
}

export interface PlainLanguageReport {
  output: string;
  findings: PlainFinding[];
  abbreviationCount: number;
  /** Share of sentences that still contain a term from either table. */
  sentences: number;
  leftover: string[];
}

const ABBR_PATTERN = new RegExp(`\\b(?:${ABBREVIATIONS.map((entry) => entry.abbr).join("|")})\\b`, "g");

/**
 * Uppercase acronyms only. Matching is case-sensitive on purpose: a lowercase
 * "os" or "api" is not the acronym and must never be expanded.
 */
export function findAbbreviationMatches(text: string): PhraseMatch[] {
  if (!text) return [];
  const lookup = new Map(ABBREVIATIONS.map((entry) => [entry.abbr, entry]));
  const found: PhraseMatch[] = [];
  let lastEnd = -1;
  ABBR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ABBR_PATTERN.exec(text)) !== null) {
    if (match.index < lastEnd) continue;
    const entry = lookup.get(match[0]);
    if (!entry) continue;
    found.push({
      source: match[0],
      phrase: entry.abbr.toLowerCase(),
      note: entry.note,
      replacement: entry.expansion,
      index: match.index,
      end: match.index + match[0].length,
    });
    lastEnd = match.index + match[0].length;
  }
  return found;
}

function sentenceFor(text: string, index: number): { sentence: string; length: number } {
  for (const token of sentenceTokens(text)) {
    if (index >= token.index && index < token.index + token.text.length) {
      const sentence = token.text.trim();
      return { sentence, length: words(sentence).length };
    }
  }
  return { sentence: "", length: 0 };
}

/** Convert the text and report every term that was rewritten. */
export function toPlainLanguage(text: string): PlainLanguageReport {
  const jargonMatches = findPhraseMatches(text, JARGON_TERMS);

  const abbrMatches = findAbbreviationMatches(text);

  const all = [...jargonMatches, ...abbrMatches].sort((a, b) => a.index - b.index);
  const output = applyPhraseReplacements(text, all).output;

  const findings: PlainFinding[] = all.map((match) => {
    const located = sentenceFor(text, match.index);
    return {
      source: match.source,
      plain: match.replacement ?? match.source,
      note: match.note,
      sentence: located.sentence,
      sentenceWords: located.length,
    };
  });

  const replaced = new Set(all.map((match) => match.source.toLowerCase()));
  const leftover = [
    ...new Set(
      words(output)
        .map((word) => word.replace(/[^\p{L}]/gu, ""))
        .filter((word) => word.length >= LONG_WORD_LETTERS && !replaced.has(word.toLowerCase())),
    ),
  ].slice(0, MAX_UNTOUCHED);

  return {
    output,
    findings,
    abbreviationCount: abbrMatches.length,
    sentences: sentenceTokens(text).length,
    leftover,
  };
}
