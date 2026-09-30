/**
 * Proper-noun checking: capitalisation of known names, and consistency of the
 * names the document repeats.
 *
 * Two data sources, both checkable:
 *   - weekday and month names come from the platform's `Intl` data at run time,
 *     so they are read from the environment rather than typed by hand;
 *   - the place, language and nationality lists below are a curated set of
 *     single-word and multi-word names. "Curated" is the honest word: it is a
 *     documented list, not a gazetteer, and the tool reports how many entries it
 *     holds so the claim can be checked.
 *
 * Names that are also ordinary words — Turkey, China, May, March, Polish — are
 * marked ambiguous and are never reported on their own, because "the turkey was
 * dry" is a sentence about dinner.
 *
 * The third check is the useful one for real documents: a name written two ways
 * ("Racira" and "racira"). It only fires when both forms appear away from the
 * start of a sentence, so a capitalised word at the beginning of a sentence is
 * never mistaken for evidence of a name.
 */
export type ProperNounKind = "day" | "month" | "continent" | "planet" | "language" | "nationality" | "country";

export interface ProperNounEntry {
  name: string;
  kind: ProperNounKind;
  /** The name is also an ordinary English word, so it is never flagged alone. */
  ambiguous?: boolean;
}

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" });

/** Long month names, read from Intl (January … December). */
export const MONTHS: string[] = Array.from({ length: 12 }, (_, month) =>
  monthFormat.format(new Date(Date.UTC(2021, month, 15))),
);

/** Long weekday names, read from Intl (Sunday … Saturday). */
export const DAYS: string[] = Array.from({ length: 7 }, (_, day) =>
  dayFormat.format(new Date(Date.UTC(2021, 7, 1 + day))),
);

export const CONTINENTS: string[] = [
  "Africa",
  "Antarctica",
  "Asia",
  "Australia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
];

export const PLANETS: string[] = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

export const LANGUAGES: string[] = [
  "Arabic",
  "Bengali",
  "Chinese",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Latin",
  "Malay",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Welsh",
];

export const NATIONALITIES: string[] = [
  "American",
  "Argentinian",
  "Australian",
  "Austrian",
  "Belgian",
  "Brazilian",
  "British",
  "Canadian",
  "Chilean",
  "Colombian",
  "Croatian",
  "Cuban",
  "Danish",
  "Dutch",
  "Egyptian",
  "English",
  "Filipino",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hungarian",
  "Indian",
  "Indonesian",
  "Irish",
  "Israeli",
  "Italian",
  "Japanese",
  "Kenyan",
  "Korean",
  "Malaysian",
  "Mexican",
  "Moroccan",
  "Nepali",
  "Nigerian",
  "Norwegian",
  "Pakistani",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Saudi",
  "Scottish",
  "Singaporean",
  "South African",
  "Spanish",
  "Swedish",
  "Swiss",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
  "Welsh",
];

export const COUNTRIES: string[] = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Brazil",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Latvia",
  "Lebanon",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malaysia",
  "Malta",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tanzania",
  "Thailand",
  "Tunisia",
  "Turkey",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

/** Names that are also ordinary words: never flagged on their own. */
const AMBIGUOUS = new Set([
  "august",
  "chad",
  "chile",
  "china",
  "danish",
  "earth",
  "georgia",
  "india",
  "japan",
  "jordan",
  "latin",
  "march",
  "may",
  "mercury",
  "polish",
  "turkey",
  "welsh",
]);

function entries(names: string[], kind: ProperNounKind): ProperNounEntry[] {
  return names.map((name) => ({
    name,
    kind,
    ambiguous: AMBIGUOUS.has(name.split(" ")[0].toLowerCase()) && name.split(" ").length === 1,
  }));
}

/** Every documented entry, in one list. */
export const PROPER_NOUNS: ProperNounEntry[] = [
  ...entries(DAYS, "day"),
  ...entries(MONTHS, "month"),
  ...entries(CONTINENTS, "continent"),
  ...entries(PLANETS, "planet"),
  ...entries(LANGUAGES, "language"),
  ...entries(NATIONALITIES, "nationality"),
  ...entries(COUNTRIES, "country"),
];

/** How many names the tool checks (shown on the page). */
export const PROPER_NOUN_COUNT = PROPER_NOUNS.length;

/** Names the checker deliberately leaves alone because they are ordinary words. */
export const AMBIGUOUS_PROPER_NOUNS: string[] = PROPER_NOUNS.filter((entry) => entry.ambiguous).map(
  (entry) => entry.name,
);

export interface ProperNounFinding {
  kind: "case" | "inconsistent";
  /** The name as documented. */
  name: string;
  /** The form found in the text. */
  found: string;
  suggestion: string;
  index: number;
  end: number;
  snippet: string;
  note: string;
}

export interface UnverifiedName {
  word: string;
  count: number;
  start: number;
}

export interface ProperNounResult {
  findings: ProperNounFinding[];
  /** Capitalised words the lexicon does not contain — listed, never "corrected". */
  unverified: UnverifiedName[];
  /** Words inside the documented lists that were checked. */
  tokensChecked: number;
  lexicon: number;
}

/** Function words and other lowercase words that never claim to be names. */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "if", "so", "of", "to", "in", "on", "at", "by", "for", "with", "from",
  "as", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "can", "could", "should", "may", "might", "must", "this", "that", "these", "those", "it", "its", "he",
  "she", "they", "we", "you", "i", "my", "your", "his", "her", "their", "our", "there", "here", "then", "than",
  "when", "where", "which", "who", "whom", "what", "why", "how", "not", "no", "yes", "also", "just", "very",
  "more", "most", "some", "any", "all", "each", "every", "both", "few", "many", "much", "other", "another",
  "such", "only", "own", "same", "too", "well", "now", "up", "down", "out", "off", "over", "under", "again",
  "once", "soon", "still", "yet", "ever", "never", "always", "often", "sometimes", "usually", "head", "report",
  "team", "company", "project", "plan", "note", "add", "use", "one", "two", "three", "next", "last", "first",
]);

export const MAX_PROPER_NOUN_FINDINGS = 200;
export const MAX_UNVERIFIED = 20;

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'-]*/g;
/** A token starts a sentence when the gap before it contains a terminator or a newline. */
const SENTENCE_BREAK = /[.!?…]|\n/;

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

interface Token {
  word: string;
  start: number;
  end: number;
  sentenceInitial: boolean;
  allCaps: boolean;
}

function scanTokens(text: string): Token[] {
  const tokens: Token[] = [];
  TOKEN_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  let previousEnd = 0;
  let first = true;
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const gap = text.slice(previousEnd, match.index);
    const sentenceInitial = first ? true : SENTENCE_BREAK.test(gap);
    tokens.push({
      word: match[0],
      start: match.index,
      end: match.index + match[0].length,
      sentenceInitial,
      allCaps: /^[A-Z]{2,}$/.test(match[0]),
    });
    previousEnd = match.index + match[0].length;
    first = false;
  }
  return tokens;
}

const BY_LOWER = new Map<string, ProperNounEntry>();
const MULTI_WORD = new Map<string, ProperNounEntry>();
for (const entry of PROPER_NOUNS) {
  if (entry.name.includes(" ")) MULTI_WORD.set(entry.name.toLowerCase(), entry);
  else if (!BY_LOWER.has(entry.name.toLowerCase())) BY_LOWER.set(entry.name.toLowerCase(), entry);
}

function checkKnownNames(text: string, tokens: Token[]): { findings: ProperNounFinding[]; unverified: Map<string, UnverifiedName> } {
  const findings: ProperNounFinding[] = [];
  const unverified = new Map<string, UnverifiedName>();

  for (const token of tokens) {
    if (token.allCaps) continue;
    const lower = token.word.toLowerCase();
    const entry = BY_LOWER.get(lower);
    if (entry) {
      if (entry.ambiguous) continue;
      if (token.word !== entry.name) {
        findings.push({
          kind: "case",
          name: entry.name,
          found: token.word,
          suggestion: entry.name,
          index: token.start,
          end: token.end,
          snippet: snippet(text, token.start, token.word.length),
          note: `${entry.name} is a ${entry.kind} name and is always capitalised.`,
        });
      }
      continue;
    }
    // A lower-case word that starts a multi-word name ("north America") is
    // caught by the phrase scan; everything else capitalised here is unknown.
    if (/^[A-Z][a-z]+$/.test(token.word) && token.word.length >= 3 && !token.sentenceInitial && !STOPWORDS.has(lower)) {
      const existing = unverified.get(token.word);
      if (existing) existing.count += 1;
      else unverified.set(token.word, { word: token.word, count: 1, start: token.start });
    }
  }

  for (const [phrase, entry] of MULTI_WORD) {
    const pattern = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").split(" ").join("[\\s-]+"), "gi");
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (match[0] === entry.name) continue;
      findings.push({
        kind: "case",
        name: entry.name,
        found: match[0],
        suggestion: entry.name,
        index: match.index,
        end: match.index + match[0].length,
        snippet: snippet(text, match.index, match[0].length),
        note: `${entry.name} is a ${entry.kind} name and is always capitalised.`,
      });
    }
  }

  return { findings, unverified };
}

/** Capitalised and lower-case forms of the same word, both used mid-sentence. */
function checkConsistency(text: string, tokens: Token[]): ProperNounFinding[] {
  const forms = new Map<string, Map<string, Token[]>>();
  for (const token of tokens) {
    if (token.sentenceInitial || token.allCaps) continue;
    const lower = token.word.toLowerCase();
    if (lower.length < 3 || STOPWORDS.has(lower)) continue;
    if (!/^[a-z]+$/.test(lower)) continue;
    if (BY_LOWER.has(lower)) continue; // known names have their own rule
    const byForm = forms.get(lower) ?? new Map<string, Token[]>();
    const list = byForm.get(token.word) ?? [];
    list.push(token);
    byForm.set(token.word, list);
    forms.set(lower, byForm);
  }

  const findings: ProperNounFinding[] = [];
  for (const byForm of forms.values()) {
    if (byForm.size < 2) continue;
    const capitalized = [...byForm.keys()].find((form) => /^[A-Z]/.test(form));
    if (!capitalized) continue;
    for (const [form, list] of byForm) {
      if (form === capitalized) continue;
      const token = list[0];
      findings.push({
        kind: "inconsistent",
        name: capitalized,
        found: form,
        suggestion: capitalized,
        index: token.start,
        end: token.end,
        snippet: snippet(text, token.start, form.length),
        note: `The document also writes “${capitalized}” mid-sentence — pick one form.`,
      });
    }
  }
  return findings;
}

/** Find capitalisation problems and inconsistencies among documented names. */
export function findProperNounIssues(text: string): ProperNounResult {
  const tokens = scanTokens(text);
  const known = checkKnownNames(text, tokens);
  const findings = [...known.findings, ...checkConsistency(text, tokens)]
    .sort((a, b) => a.index - b.index)
    .slice(0, MAX_PROPER_NOUN_FINDINGS);
  const unverified = [...known.unverified.values()]
    .sort((a, b) => b.count - a.count || a.start - b.start)
    .slice(0, MAX_UNVERIFIED);
  const checked = tokens.filter((token) => BY_LOWER.has(token.word.toLowerCase())).length;
  return { findings, unverified, tokensChecked: checked, lexicon: PROPER_NOUN_COUNT };
}

/** Report text for the copy/download buttons. */
export function formatProperNounReport(result: ProperNounResult): string {
  const lines: string[] = [];
  if (result.findings.length === 0) {
    lines.push(`No documented name issues. ${result.lexicon} names checked.`);
  } else {
    lines.push(`Name findings: ${result.findings.length}`, "");
    for (const finding of result.findings) {
      lines.push(`${finding.index}  ${finding.found} → ${finding.suggestion}  (${finding.kind})\n    ${finding.note}`);
    }
  }
  if (result.unverified.length > 0) {
    lines.push("", `Capitalised words not in the ${result.lexicon}-name list (never "corrected"):`);
    for (const name of result.unverified) lines.push(`  ${name.word} ×${name.count}`);
  }
  return lines.join("\n");
}
