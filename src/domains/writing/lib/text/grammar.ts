/**
 * Mechanical checks for common writing errors.
 *
 * This is deliberately not a parser. It runs a fixed, published list of
 * high-precision checks and reports exactly what it looked for, so the tool can
 * say "these seven checks, and no others" instead of implying a grammatical
 * analysis it cannot perform. Every check is a rule with a name, a count and a
 * suggestion, and each one has a documented failure mode:
 *
 *   repeated-word       flags any word repeated back to back, including the
 *                       deliberate "had had";
 *   a-an                matches article to the following sound, with lists of
 *                       the exceptions ("a university", "an hour") and the
 *                       acronym rule ("an MRI", "a URL");
 *   confusable          high-precision context rules for your/you're, its/it's,
 *                       then/than, to/too, loose/lose, affect/effect and
 *                       weather/whether — never a blanket spell-check;
 *   sentence-case       a lowercase word after . ! ? — abbreviations such as
 *                       "e.g." and initials are excluded from the check;
 *   terminal-punctuation a paragraph that does not end with punctuation;
 *   unmatched-delimiters brackets, braces and quotation marks that do not pair
 *                       up.
 *
 * Numbers, foreign-language text and unusual punctuation are treated literally.
 */
import { sentenceTokens, wordTokens } from "./tokenize.ts";

export interface GrammarFinding {
  rule: string;
  label: string;
  message: string;
  /** The corrected fragment, when a mechanical fix exists. */
  suggestion?: string;
  index: number;
  snippet: string;
}

export interface GrammarResult {
  words: number;
  sentences: number;
  findings: GrammarFinding[];
  /** Findings per rule id. */
  counts: Record<string, number>;
  checksRun: string[];
}

export const GRAMMAR_CHECKS: { id: string; label: string }[] = [
  { id: "repeated-word", label: "Repeated words" },
  { id: "a-an", label: "a / an agreement" },
  { id: "confusable", label: "Commonly confused words" },
  { id: "sentence-case", label: "Sentence capitalisation" },
  { id: "terminal-punctuation", label: "Paragraph punctuation" },
  { id: "unmatched-delimiters", label: "Unmatched brackets and quotes" },
];

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 26);
  const end = Math.min(text.length, index + length + 26);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

/** Words that begin with a vowel letter but a consonant sound, so take "a". */
const VOWEL_LETTER_CONSONANT_SOUND = new Set([
  "eucalyptus",
  "eulogy",
  "european",
  "one",
  "once",
  "unicorn",
  "uniform",
  "unilateral",
  "union",
  "unions",
  "unique",
  "uniquely",
  "unit",
  "units",
  "united",
  "universal",
  "universe",
  "universities",
  "university",
  "uranium",
  "useful",
  "usefully",
  "user",
  "users",
  "usual",
  "usually",
  "utilities",
  "utility",
  "utopia",
  "year",
  "years",
]);

/** Words that begin with a consonant letter but a vowel sound, so take "an". */
const CONSONANT_LETTER_VOWEL_SOUND = new Set([
  "heir",
  "heirlooms",
  "heirs",
  "honest",
  "honestly",
  "honesty",
  "honor",
  "honorable",
  "honors",
  "honourable",
  "hour",
  "hourly",
  "hours",
]);

/** Letter names that begin with a vowel sound — "an MRI", "an FBI agent". */
const ACRONYM_VOWEL_SOUND = new Set(["a", "e", "f", "h", "i", "l", "m", "n", "o", "r", "s", "x"]);

function expectedArticle(word: string): "a" | "an" {
  const lower = word.toLowerCase();
  // A capitalised acronym such as MRI or URL is read letter by letter.
  if (/^[A-Z]{2,}$/.test(word)) return ACRONYM_VOWEL_SOUND.has(lower[0]) ? "an" : "a";
  if (/^[aeiou]/.test(lower)) return VOWEL_LETTER_CONSONANT_SOUND.has(lower) ? "a" : "an";
  return CONSONANT_LETTER_VOWEL_SOUND.has(lower) ? "an" : "a";
}

interface ConfusableRule {
  regex: RegExp;
  hint: string;
  /** Correct the matched fragment. */
  fix: (matched: string) => string;
}

const CONFUSABLE_RULES: ConfusableRule[] = [
  {
    regex: /\byour\b(?=\s+(?:are|were|was|is|not|going|gonna|right|wrong|so|the|a|an)\b)/gi,
    hint: "\"your\" is possessive; the verb phrase needs \"you're\".",
    fix: (matched) => matched.replace(/your/i, "you're"),
  },
  {
    regex: /\byou're\b(?=\s+(?:name|car|book|idea|job|turn|opinion|answer|fault|problem|money|own)\b)/gi,
    hint: "\"you're\" is \"you are\"; a possessive noun needs \"your\".",
    fix: (matched) => matched.replace(/you're/i, "your"),
  },
  {
    regex: /\bits\b(?=\s+(?:been|being|not|going|just|only|always|very|really|a|an)\b)/gi,
    hint: "\"its\" is possessive; the verb phrase needs \"it's\".",
    fix: (matched) => matched.replace(/its/i, "it's"),
  },
  {
    regex: /\bit's\b(?=\s+(?:own|purpose|place|use|name|design|origin|value|size|form|shape|colour|color|contents|role|job)\b)/gi,
    hint: "\"it's\" is \"it is\"; a possessive noun needs \"its\".",
    fix: (matched) => matched.replace(/it's/i, "its"),
  },
  {
    regex: /\b(more|less|rather|other|greater|fewer|better|worse|longer|shorter|higher|lower|older|younger|bigger|smaller|faster|slower|easier|harder|cheaper|larger)\s+then\b/gi,
    hint: "A comparison takes \"than\", not \"then\".",
    fix: (matched) => matched.replace(/then$/i, "than"),
  },
  {
    regex: /\b(?:to|will|would|won't|don't|doesn't|didn't|never|might|could|should|must|can|not)\s+loose\b/gi,
    hint: "\"loose\" means not tight; the verb is \"lose\".",
    fix: (matched) => matched.replace(/loose$/i, "lose"),
  },
  {
    regex: /\bto\s+(?:much|many|late|early|long|short|big|small|far|fast|slow|good|bad|expensive|cheap|difficult|easy|often|soon|high|low)\b/gi,
    hint: "The degree word is \"too\", not the preposition \"to\".",
    fix: (matched) => matched.replace(/^to/i, "too"),
  },
  {
    regex: /\bweather\s+or\s+not\b/gi,
    hint: "The alternative is \"whether\", not the noun \"weather\".",
    fix: () => "whether or not",
  },
  {
    regex: /\b(?:the|a|an|this|that|any|no|some|great|big|huge|significant|major|minor|positive|negative|side)\s+affect\b/gi,
    hint: "The noun is \"effect\"; \"affect\" is the verb.",
    fix: (matched) => matched.replace(/affect$/i, "effect"),
  },
  {
    regex: /\b(?:will|would|can|could|may|might|won't|to|doesn't|don't)\s+effect\b/gi,
    hint: "The verb is \"affect\"; \"effect\" is the noun.",
    fix: (matched) => matched.replace(/effect$/i, "affect"),
  },
];

/** Abbreviations whose full stop does not end a sentence. */
const ABBREVIATIONS = new Set([
  "al",
  "approx",
  "cf",
  "dept",
  "dr",
  "e.g",
  "eg",
  "est",
  "etc",
  "fig",
  "ibid",
  "i.e",
  "ie",
  "inc",
  "jr",
  "ltd",
  "mr",
  "mrs",
  "ms",
  "no",
  "pp",
  "prof",
  "sr",
  "st",
  "vs",
  "vol",
]);

function checkRepeatedWords(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  const pattern = /\b([A-Za-z][A-Za-z'’-]*)(\s+)(\1)\b/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    findings.push({
      rule: "repeated-word",
      label: "Repeated word",
      message: `"${match[1]}" is repeated.`,
      suggestion: match[1],
      index: match.index,
      snippet: snippet(text, match.index, match[0].length),
    });
    if (match.index === pattern.lastIndex) pattern.lastIndex += 1;
  }
  return findings;
}

function checkArticles(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  const pattern = /\b(a|an)\s+([A-Za-z][A-Za-z'’-]*)/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const article = match[1];
    const word = match[2];
    const expected = expectedArticle(word);
    if (article.toLowerCase() !== expected) {
      findings.push({
        rule: "a-an",
        label: "a / an agreement",
        message: `"${article} ${word}" should be "${expected} ${word}".`,
        suggestion: `${expected} ${word}`,
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
    }
  }
  return findings;
}

function checkConfusables(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  for (const rule of CONFUSABLE_RULES) {
    rule.regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = rule.regex.exec(text)) !== null) {
      findings.push({
        rule: "confusable",
        label: "Commonly confused words",
        message: rule.hint,
        suggestion: rule.fix(match[0]),
        index: match.index,
        snippet: snippet(text, match.index, match[0].length),
      });
      if (match.index === rule.regex.lastIndex) rule.regex.lastIndex += 1;
    }
  }
  return findings.sort((a, b) => a.index - b.index);
}

function checkSentenceCase(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  const pattern = /([.!?])(\s+)([a-z][A-Za-z'’-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const before = text.slice(0, match.index);
    const previousWord = (before.match(/([A-Za-z][A-Za-z.]*)\.?$/)?.[1] ?? "").toLowerCase().replace(/\./g, "");
    // Skip abbreviations ("e.g. the") and initials ("J. smith").
    if (ABBREVIATIONS.has(previousWord)) continue;
    if (/(?:^|\s)[A-Z]$/.test(before)) continue;
    const wordIndex = match.index + match[1].length + match[2].length;
    findings.push({
      rule: "sentence-case",
      label: "Sentence capitalisation",
      message: `"${match[3]}" starts a sentence and should be capitalised.`,
      suggestion: match[3][0].toUpperCase() + match[3].slice(1),
      index: wordIndex,
      snippet: snippet(text, wordIndex, match[3].length),
    });
  }
  return findings;
}

function checkTerminalPunctuation(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  let offset = 0;
  for (const paragraph of text.split(/\n\s*\n/)) {
    const trimmed = paragraph.trim();
    if (trimmed.length > 0 && wordTokens(trimmed).length > 0) {
      const last = trimmed[trimmed.length - 1];
      if (!/[.!?…:;"'”’)\]]/.test(last)) {
        const index = offset + paragraph.lastIndexOf(last);
        findings.push({
          rule: "terminal-punctuation",
          label: "Paragraph punctuation",
          message: "This paragraph does not end with punctuation.",
          index,
          snippet: snippet(text, Math.max(0, index - 40), 40),
        });
      }
    }
    offset += paragraph.length + 2;
  }
  return findings;
}

function checkDelimiters(text: string): GrammarFinding[] {
  const findings: GrammarFinding[] = [];
  const pairs: { name: string; open: RegExp; close: RegExp }[] = [
    { name: "parentheses", open: /\(/g, close: /\)/g },
    { name: "square brackets", open: /\[/g, close: /\]/g },
    { name: "braces", open: /\{/g, close: /\}/g },
    { name: "double quotation marks", open: /["“”]/g, close: /["“”]/g },
    { name: "single quotation marks", open: /[‘’]/g, close: /[‘’]/g },
  ];
  for (const pair of pairs) {
    const opens = (text.match(pair.open) ?? []).length;
    const closes = (text.match(pair.close) ?? []).length;
    const balanced = pair.name === "double quotation marks" ? opens % 2 === 0 : opens === closes;
    if (opens + closes > 0 && !balanced) {
      findings.push({
        rule: "unmatched-delimiters",
        label: "Unmatched delimiters",
        message: `${pair.name} do not pair up (${opens} open, ${closes} close).`,
        index: Math.max(0, text.length - 1),
        snippet: "end of text",
      });
    }
  }
  return findings;
}

/** Run every check and return the findings in document order. */
export function checkGrammar(text: string, locale = "en"): GrammarResult {
  const findings = [
    ...checkRepeatedWords(text),
    ...checkArticles(text),
    ...checkConfusables(text),
    ...checkSentenceCase(text),
    ...checkTerminalPunctuation(text),
    ...checkDelimiters(text),
  ].sort((a, b) => a.index - b.index);

  const counts: Record<string, number> = {};
  for (const check of GRAMMAR_CHECKS) counts[check.id] = 0;
  for (const finding of findings) counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;

  return {
    words: wordTokens(text, locale).length,
    sentences: sentenceTokens(text, locale).length,
    findings,
    counts,
    checksRun: GRAMMAR_CHECKS.map((check) => check.label),
  };
}
