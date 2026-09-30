/**
 * Capitalisation checks: sentence starts, the pronoun "I", day and month names,
 * all-caps runs and capitals inside a word.
 *
 * Scope, stated plainly: day, month, language and nationality names are checked
 * here because they follow a case rule, while country, continent and planet
 * names belong to the proper-noun checker, which also looks for a name written
 * two different ways.
 *
 * The sentence-start rule scans raw text rather than the shared sentence
 * splitter, and that is deliberate: the splitter needs a capital letter after
 * the full stop to see a sentence at all, so a lower-case sentence start would
 * be invisible to it. Here the pattern is the error itself — a terminator, a
 * space, then a lower-case word — with the two cases that are not errors carved
 * out: abbreviations ("e.g.") and initials ("J.K.").
 *
 * Two of the five checks are style: a word in ALL CAPS and a capital inside a
 * word. Both are real drafting habits and both are sometimes deliberate, so they
 * are reported as style and the acronym allowlist is published in the notes.
 */
import { DAYS, LANGUAGES, MONTHS, NATIONALITIES } from "./proper-nouns.ts";

export type CapitalizationSeverity = "error" | "style";

export interface CapitalizationFinding {
  rule: string;
  label: string;
  message: string;
  suggestion?: string;
  index: number;
  end: number;
  snippet: string;
  severity: CapitalizationSeverity;
}

export interface CapitalizationResult {
  findings: CapitalizationFinding[];
  counts: Record<string, number>;
  rulesRun: { id: string; label: string; severity: CapitalizationSeverity }[];
  /** Day, month, language and nationality names available to the name rule. */
  namesChecked: number;
}

export const CAPITALIZATION_RULES: { id: string; label: string; severity: CapitalizationSeverity }[] = [
  { id: "sentence-start", label: "Sentence starts lower-case", severity: "error" },
  { id: "standalone-i", label: "Lower-case “i” as the pronoun", severity: "error" },
  { id: "name-lowercase", label: "Lower-case day, month, language or nationality", severity: "error" },
  { id: "all-caps-word", label: "Word in all capitals", severity: "style" },
  { id: "mixed-inner-case", label: "Capital inside a word", severity: "style" },
];

/** Abbreviations whose full stop does not end a sentence. */
const ABBREVIATIONS = new Set([
  "al", "approx", "cf", "dept", "dr", "e.g", "eg", "est", "etc", "fig", "ibid", "i.e", "ie", "inc", "jr", "ltd",
  "mr", "mrs", "ms", "no", "pp", "prof", "sr", "st", "vs", "vol",
]);

/** Acronyms that are correct in capitals and never reported. */
const ACRONYM_ALLOWLIST = new Set([
  "ADHD", "AI", "AIDS", "API", "ASAP", "ATM", "BBC", "CD", "CEO", "CFO", "CI", "CIA", "CORS", "CPU", "CRUD", "CSS",
  "CSV", "CT", "CTO", "DNA", "DOI", "DRM", "DVD", "EKG", "ER", "EST", "EU", "FAQ", "FBI", "FYI", "GDP", "GMT", "GPS",
  "GPU", "GST", "GUI", "HIV", "HR", "HTML", "HTTP", "HTTPS", "ICU", "ID", "IDE", "IMF", "ISBN", "IST", "JSON", "JS",
  "KPI", "LLM", "MD", "ML", "MRI", "MVP", "NASA", "NATO", "NPM", "OK", "PDF", "PhD", "PIN", "PM", "PO", "PR", "PST",
  "PTSD", "QA", "RAM", "REST", "RNA", "ROI", "ROM", "SDK", "SEM", "SEO", "SLA", "SMS", "SQL", "SSD", "TBD", "TS",
  "TV", "UAE", "UAT", "UK", "UN", "URL", "US", "USA", "USB", "UTC", "VAT", "WHO", "XML", "YAML",
]);

/** Brand names whose internal capitals are part of the name (compared lower-cased). */
const BRAND_FORMS = new Set(
  [
    "ChatGPT", "GitHub", "JavaScript", "LinkedIn", "OpenAI", "PayPal", "PlayStation", "PowerPoint", "TikTok",
    "TypeScript", "WhatsApp", "WordPress", "YouTube", "eBay", "iPad", "iPhone", "iPod", "macOS", "McDonald's",
  ].map((brand) => brand.toLowerCase()),
);

/** Names that are also ordinary words, so they are excluded from the name rule. */
const AMBIGUOUS_NAMES = new Set(["august", "danish", "latin", "march", "may", "polish", "welsh"]);

const NAME_FORMS = new Map<string, string>();
for (const name of [...DAYS, ...MONTHS, ...LANGUAGES, ...NATIONALITIES]) {
  if (!AMBIGUOUS_NAMES.has(name.toLowerCase()) && !NAME_FORMS.has(name.toLowerCase())) {
    NAME_FORMS.set(name.toLowerCase(), name);
  }
}

export const MAX_CAPITALIZATION_FINDINGS = 200;

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'-]*/g;

/** "i", "i'm", "i've", "i'll", "i'd" — the pronoun rule owns these. */
function isPronounI(word: string): boolean {
  return /^i(?:['’](?:m|ve|ll|d))?$/i.test(word);
}

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function make(
  text: string,
  rule: string,
  label: string,
  severity: CapitalizationSeverity,
  message: string,
  index: number,
  length: number,
  suggestion?: string,
): CapitalizationFinding {
  return { rule, label, message, suggestion, index, end: index + length, snippet: snippet(text, index, length), severity };
}

function previousWord(text: string, index: number): { word: string; initials: boolean } {
  const before = text.slice(0, index);
  const initials = /(?:^|\s)(?:[A-Z]\.){1,4}$/.test(before);
  const match = before.match(/([A-Za-z][A-Za-z.]*)\.?\s*$/);
  return { word: (match?.[1] ?? "").toLowerCase().replace(/\./g, ""), initials };
}

function checkSentenceStarts(text: string): CapitalizationFinding[] {
  const findings: CapitalizationFinding[] = [];
  // After a terminator, and at the start of each line.
  const patterns = [/([.!?…])\s+([a-z][A-Za-z'-]*)/g, /(^|\n)([ \t]*)([a-z][A-Za-z'-]*)/g];
  const seen = new Set<number>();

  let match: RegExpExecArray | null;
  const afterTerminator = patterns[0];
  while ((match = afterTerminator.exec(text)) !== null) {
    const { word, initials } = previousWord(text, match.index + 1);
    if (initials || ABBREVIATIONS.has(word)) continue;
    // Part of an ellipsis run: "Wait... what?" is a deliberate lower-case start.
    if (/[.!?…]/.test(text[match.index - 1] ?? "")) continue;
    const index = match.index + 1 + match[0].slice(1).search(/\S/);
    if (isPronounI(match[2])) continue; // the pronoun rule owns the i family
    if (seen.has(index)) continue;
    seen.add(index);
    findings.push(
      make(
        text,
        "sentence-start",
        "Sentence starts lower-case",
        "error",
        `“${match[2]}” starts a sentence and should be capitalised.`,
        index,
        match[2].length,
        match[2][0].toUpperCase() + match[2].slice(1),
      ),
    );
  }

  const lineStart = patterns[1];
  while ((match = lineStart.exec(text)) !== null) {
    if (isPronounI(match[3])) continue;
    const index = match.index + match[1].length + match[2].length;
    if (seen.has(index)) continue;
    seen.add(index);
    findings.push(
      make(
        text,
        "sentence-start",
        "Sentence starts lower-case",
        "error",
        `“${match[3]}” starts a line and should be capitalised.`,
        index,
        match[3].length,
        match[3][0].toUpperCase() + match[3].slice(1),
      ),
    );
  }
  return findings;
}

function checkStandaloneI(text: string): CapitalizationFinding[] {
  const findings: CapitalizationFinding[] = [];
  const pattern = /\bi\b(?!['’.])|\bi(?:'m|'ve|'ll|'d|’m|’ve|’ll|’d)\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[0];
    const isContraction = word.length > 1;
    const suggestion = isContraction ? `I${word.slice(1)}` : "I";
    findings.push(
      make(
        text,
        "standalone-i",
        "Lower-case “i” as the pronoun",
        "error",
        isContraction ? `“${word}” needs a capital I.` : "The pronoun “i” is always capitalised in English.",
        match.index,
        word.length,
        suggestion,
      ),
    );
  }
  return findings;
}

function checkNames(text: string): CapitalizationFinding[] {
  const findings: CapitalizationFinding[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const word = match[0];
    if (word[0] === word[0].toUpperCase()) continue;
    const documented = NAME_FORMS.get(word.toLowerCase());
    if (!documented) continue;
    findings.push(
      make(
        text,
        "name-lowercase",
        "Lower-case day, month, language or nationality",
        "error",
        `“${word}” is a ${documented} form and is always capitalised.`,
        match.index,
        word.length,
        documented,
      ),
    );
  }
  return findings;
}

function checkAllCaps(text: string): CapitalizationFinding[] {
  const findings: CapitalizationFinding[] = [];
  const pattern = /\b[A-Z]{3,}\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (ACRONYM_ALLOWLIST.has(match[0])) continue;
    findings.push(
      make(
        text,
        "all-caps-word",
        "Word in all capitals",
        "style",
        `“${match[0]}” is in all capitals. Short acronyms are expected; a whole word in caps usually is not.`,
        match.index,
        match[0].length,
        match[0][0] + match[0].slice(1).toLowerCase(),
      ),
    );
  }
  return findings;
}

function checkInnerCapitals(text: string): CapitalizationFinding[] {
  const findings: CapitalizationFinding[] = [];
  const pattern = /\b[A-Za-z]*[a-z][A-Z][A-Za-z]*\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[0];
    if (BRAND_FORMS.has(word.toLowerCase())) continue;
    const suggestion = /^[A-Z]/.test(word) ? word[0] + word.slice(1).toLowerCase() : word.toLowerCase();
    findings.push(
      make(
        text,
        "mixed-inner-case",
        "Capital inside a word",
        "style",
        `“${word}” has a capital in the middle — unless it is a brand name, it should not.`,
        match.index,
        word.length,
        suggestion,
      ),
    );
  }
  return findings;
}

/** Run every capitalisation check and return the findings in document order. */
export function checkCapitalization(text: string): CapitalizationResult {
  const findings = [
    ...checkSentenceStarts(text),
    ...checkStandaloneI(text),
    ...checkNames(text),
    ...checkAllCaps(text),
    ...checkInnerCapitals(text),
  ]
    .sort((a, b) => a.index - b.index)
    .slice(0, MAX_CAPITALIZATION_FINDINGS);

  const counts: Record<string, number> = {};
  for (const rule of CAPITALIZATION_RULES) counts[rule.id] = 0;
  for (const finding of findings) counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;

  return { findings, counts, rulesRun: CAPITALIZATION_RULES, namesChecked: NAME_FORMS.size };
}

/** Report text for the copy/download buttons. */
export function formatCapitalizationReport(result: CapitalizationResult): string {
  if (result.findings.length === 0) {
    return `No capitalisation issues. ${result.rulesRun.length} checks run, including ${result.namesChecked} day, month, language and nationality names.`;
  }
  return [
    `Capitalisation findings: ${result.findings.length}`,
    "",
    ...result.findings.map(
      (finding) =>
        `${finding.index}  ${finding.label}: ${finding.message}${finding.suggestion ? ` → ${finding.suggestion}` : ""}`,
    ),
  ].join("\n");
}
