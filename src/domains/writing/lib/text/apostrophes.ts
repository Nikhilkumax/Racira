/**
 * Apostrophe checks: dropped apostrophes, apostrophes in plurals, decade
 * apostrophes, stray and doubled marks, mixed mark styles.
 *
 * The fault this tool exists for is the missing apostrophe, and the reliable way
 * to find it is a closed list of spellings that only exist without their
 * apostrophe ("dont", "isnt", "oclock"). That list is reported in full on the
 * tool page so the claim is checkable, and the ambiguous members ("im", "ive",
 * "lets") only fire when the next word proves the contraction — "lets go" is a
 * verb, "lets you and me" is a request.
 *
 * Deliberately out of scope, because a machine that guesses here is worse than
 * one that stays quiet:
 *   - its / it's, whose / who's, they're / their / there: a context judgement,
 *     handled by the homophone detector;
 *   - a possessive that is simply missing: "the students books" needs to know
 *     that "students" is a noun and "books" is what is owned;
 *   - plural possessives ("the dogs' toys") are accepted as written, and are
 *     never rewritten to "dog's".
 */
export type ApostropheSeverity = "error" | "style";

export interface ApostropheFinding {
  rule: string;
  label: string;
  message: string;
  suggestion?: string;
  index: number;
  end: number;
  snippet: string;
  severity: ApostropheSeverity;
}

export interface ApostropheResult {
  findings: ApostropheFinding[];
  counts: Record<string, number>;
  rulesRun: { id: string; label: string; severity: ApostropheSeverity }[];
  /** Size of the closed list of apostrophe-less spellings. */
  listedForms: number;
}

export const APOSTROPHE_RULES: { id: string; label: string; severity: ApostropheSeverity }[] = [
  { id: "missing-apostrophe", label: "Missing apostrophe in a contraction", severity: "error" },
  { id: "plural-possessive", label: "Apostrophe turning a plural into a possessive", severity: "error" },
  { id: "decade-apostrophe", label: "Apostrophe in a decade", severity: "style" },
  { id: "stray-apostrophe", label: "Stray apostrophe", severity: "error" },
  { id: "doubled-apostrophe", label: "Doubled apostrophe", severity: "error" },
  { id: "mixed-apostrophe-styles", label: "Mixed straight and curly apostrophes", severity: "style" },
];

/**
 * Spellings that are only correct with an apostrophe. Values are the suggested
 * fix; a `*` suffix marks an entry that is a real word on its own ("wont",
 * "lets", "im") and therefore needs the following word as evidence.
 */
export const MISSING_APOSTROPHE_FORMS: Record<string, string> = {
  dont: "don't",
  doesnt: "doesn't",
  didnt: "didn't",
  isnt: "isn't",
  arent: "aren't",
  wasnt: "wasn't",
  werent: "weren't",
  hasnt: "hasn't",
  havent: "haven't",
  hadnt: "hadn't",
  couldnt: "couldn't",
  wouldnt: "wouldn't",
  shouldnt: "shouldn't",
  wont: "won't",
  aint: "ain't",
  oclock: "o'clock",
  youre: "you're",
  theyre: "they're",
  theres: "there's",
  thats: "that's",
  whats: "what's",
  heres: "here's",
  wheres: "where's",
  whos: "who's",
  im: "I'm",
  ive: "I've",
  lets: "let's",
};

/** Forms whose own word status makes a following word necessary as evidence. */
const NEEDS_EVIDENCE = new Set(["im", "ive", "lets"]);

/**
 * Words that may open a clause right before a contraction. For the ambiguous
 * forms this is the other half of the test: "lets you save" is the ordinary verb
 * when a subject precedes it (the plan lets you save), and the contraction when
 * the word starts the clause (lets you and me go). Without this, every third
 * person verb took a finding — the false positive the tool exists to avoid.
 */
const CLAUSE_LEAD_INS = new Set([
  "and", "but", "or", "so", "then", "now", "well", "ok", "okay", "yes", "no", "oh", "hey", "hi",
  "first", "next", "finally", "also", "plus", "right", "alright", "anyway", "please", "look", "listen",
]);

/** True when a subject-looking word sits immediately before the match. */
function hasPrecedingSubject(text: string, index: number): boolean {
  const before = text.slice(0, index);
  const match = /([A-Za-z]+)\s+$/.exec(before);
  if (!match) return false;
  return !CLAUSE_LEAD_INS.has(match[1].toLowerCase());
}

/** Verbs and pronouns that follow a contraction but not a bare word. */
const EVIDENCE_FOLLOWERS =
  "going|gone|been|being|not|sure|sorry|here|there|happy|ready|trying|looking|working|waiting|doing|thinking|got|get|going|seen|said|told|heard|found|made|taken|given|had|have|be|do|does|did|will|would|can|could|should|must|me|you|him|her|us|them|the|a|an|it|that|this|my|your|our|their|one|two|three|more|less";

/** Verbs that follow a plural subject, proving an apostrophe is wrong. */
const PLURAL_VERBS = "are|were|have|has|had|do|does|did";

export const MAX_APOSTROPHE_FINDINGS = 200;

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function make(
  text: string,
  rule: string,
  label: string,
  severity: ApostropheSeverity,
  message: string,
  index: number,
  length: number,
  suggestion?: string,
): ApostropheFinding {
  return { rule, label, message, suggestion, index, end: index + length, snippet: snippet(text, index, length), severity };
}

function matchCase(matched: string, suggested: string): string {
  if (matched[0] !== matched[0].toLowerCase() && matched[0] === matched[0].toUpperCase()) {
    return suggested[0].toUpperCase() + suggested.slice(1);
  }
  return suggested;
}

function checkMissingApostrophes(text: string): ApostropheFinding[] {
  const findings: ApostropheFinding[] = [];
  const pattern = /[A-Za-z]+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[0];
    const lower = word.toLowerCase();
    const fix = MISSING_APOSTROPHE_FORMS[lower];
    if (!fix) continue;
    if (NEEDS_EVIDENCE.has(lower)) {
      if (hasPrecedingSubject(text, match.index)) continue;
      const rest = text.slice(match.index + word.length);
      const evidence = new RegExp(`^\\s+(?:${EVIDENCE_FOLLOWERS})\\b`, "i");
      if (!evidence.test(rest)) continue;
    }
    findings.push(
      make(
        text,
        "missing-apostrophe",
        "Missing apostrophe in a contraction",
        "error",
        `“${word}” is missing its apostrophe.`,
        match.index,
        word.length,
        matchCase(word, fix),
      ),
    );
  }
  return findings;
}

function checkPluralPossessive(text: string): ApostropheFinding[] {
  const findings: ApostropheFinding[] = [];
  const pattern = new RegExp(`\\b([A-Za-z]+)'s\\b(?=\\s+(?:${PLURAL_VERBS})\\b)`, "g");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[1];
    const plural = /s$/i.test(word) ? `${word}es` : `${word}s`;
    findings.push(
      make(
        text,
        "plural-possessive",
        "Apostrophe turning a plural into a possessive",
        "error",
        `“${word}'s” is a possessive, but the verb after it needs a plural subject.`,
        match.index,
        match[0].length,
        plural,
      ),
    );
  }
  return findings;
}

function checkDecades(text: string): ApostropheFinding[] {
  const findings: ApostropheFinding[] = [];
  const pattern = /\b(\d{2,4})'s\b/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "decade-apostrophe",
        "Apostrophe in a decade",
        "style",
        `Decades take no apostrophe: “${match[1]}s”.`,
        match.index,
        match[0].length,
        `${match[1]}s`,
      ),
    );
  }
  return findings;
}

function checkStrayApostrophes(text: string): ApostropheFinding[] {
  const findings: ApostropheFinding[] = [];
  // An apostrophe hanging before punctuation or at the end of a line, which is
  // where a typed mark gets left behind. A plural possessive ("dogs' toys")
  // always has a word after the mark, so it never matches.
  const pattern = /\S'(?=\s*[.,;:!?]|\s*$)/gm;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "stray-apostrophe",
        "Stray apostrophe",
        "error",
        "This apostrophe ends a word but has no closing partner and no word after it.",
        match.index + 1,
        1,
        "",
      ),
    );
  }
  return findings;
}

function checkDoubledApostrophes(text: string): ApostropheFinding[] {
  const findings: ApostropheFinding[] = [];
  const pattern = /'{2,}|’{2,}|'’|’'/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "doubled-apostrophe",
        "Doubled apostrophe",
        "error",
        `${match[0].length} apostrophes in a row — only one is needed.`,
        match.index,
        match[0].length,
        "'",
      ),
    );
  }
  return findings;
}

function checkMixedStyles(text: string): ApostropheFinding[] {
  const straight = text.includes("'");
  const curly = text.includes("’");
  if (!straight || !curly) return [];
  const index = text.indexOf("’");
  return [
    make(
      text,
      "mixed-apostrophe-styles",
      "Mixed straight and curly apostrophes",
      "style",
      "The text uses both ' and ’ — pick one so the typography stays consistent.",
      Math.max(0, index),
      1,
    ),
  ];
}

/** Run every apostrophe check and return the findings in document order. */
export function checkApostrophes(text: string): ApostropheResult {
  const findings = [
    ...checkMissingApostrophes(text),
    ...checkPluralPossessive(text),
    ...checkDecades(text),
    ...checkStrayApostrophes(text),
    ...checkDoubledApostrophes(text),
    ...checkMixedStyles(text),
  ]
    .sort((a, b) => a.index - b.index)
    .slice(0, MAX_APOSTROPHE_FINDINGS);

  const counts: Record<string, number> = {};
  for (const rule of APOSTROPHE_RULES) counts[rule.id] = 0;
  for (const finding of findings) counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;

  return { findings, counts, rulesRun: APOSTROPHE_RULES, listedForms: Object.keys(MISSING_APOSTROPHE_FORMS).length };
}

/** Report text for the copy/download buttons. */
export function formatApostropheReport(result: ApostropheResult): string {
  if (result.findings.length === 0) {
    return `No apostrophe issues. ${result.listedForms} apostrophe-less spellings checked.`;
  }
  return [
    `Apostrophe findings: ${result.findings.length}`,
    "",
    ...result.findings.map(
      (finding) =>
        `${finding.index}  ${finding.label}: ${finding.message}${finding.suggestion ? ` → ${finding.suggestion}` : ""}`,
    ),
  ].join("\n");
}
