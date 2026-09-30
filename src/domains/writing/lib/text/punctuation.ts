/**
 * Mechanical punctuation checks.
 *
 * These are the punctuation faults a machine can see: a space in the wrong
 * place, punctuation doubled, brackets or quotation marks that do not pair up,
 * a paragraph with no full stop, a hyphen used as a dash. Everything the check
 * reports is visible in the character stream, which is why the tool can name its
 * rules and why it stays silent about the rest:
 *
 *   - commas used for meaning (comma splices, restrictive clauses, the Oxford
 *     comma) are a grammatical judgement, not a character pattern;
 *   - a missing apostrophe is a word-level issue and lives in the apostrophe
 *     checker and the homophone detector, not here;
 *   - deliberate punctuation (an ellipsis, an em dash run, a raised eyebrow "?!")
 *     is reported with a style severity so it can be overruled.
 */
export type PunctuationSeverity = "error" | "style";

export interface PunctuationFinding {
  rule: string;
  label: string;
  message: string;
  /** Mechanical fix when one exists. */
  suggestion?: string;
  index: number;
  snippet: string;
  severity: PunctuationSeverity;
}

export interface PunctuationResult {
  findings: PunctuationFinding[];
  /** Findings per rule id, initialised to zero for every rule that ran. */
  counts: Record<string, number>;
  rulesRun: { id: string; label: string; severity: PunctuationSeverity }[];
}

export const PUNCTUATION_RULES: { id: string; label: string; severity: PunctuationSeverity }[] = [
  { id: "space-before-punctuation", label: "Space before punctuation", severity: "error" },
  { id: "missing-space-after-punctuation", label: "Missing space after punctuation", severity: "error" },
  { id: "repeated-punctuation", label: "Repeated punctuation", severity: "style" },
  { id: "ellipsis-length", label: "Ellipsis dots", severity: "style" },
  { id: "unmatched-brackets", label: "Unmatched brackets", severity: "error" },
  { id: "unbalanced-quotes", label: "Unbalanced quotation marks", severity: "error" },
  { id: "missing-terminal-punctuation", label: "Paragraph without end punctuation", severity: "error" },
  { id: "spaced-hyphen", label: "Hyphen used as a dash", severity: "style" },
  { id: "double-hyphen", label: "Double hyphen", severity: "style" },
  { id: "space-before-closing", label: "Space before a closing bracket", severity: "style" },
  { id: "space-after-opening", label: "Space after an opening bracket", severity: "style" },
];

/** Abbreviations whose full stop is not a sentence end and is not a missing space. */
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

export const MAX_PUNCTUATION_FINDINGS = 200;

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + length + 30);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function make(
  text: string,
  rule: string,
  label: string,
  severity: PunctuationSeverity,
  message: string,
  index: number,
  length: number,
  suggestion?: string,
): PunctuationFinding {
  return { rule, label, message, suggestion, index, snippet: snippet(text, index, length), severity };
}

/** The word immediately before `index`, lower-cased and stripped of dots. */
function previousWord(text: string, index: number): string {
  const before = text.slice(0, index);
  const match = before.match(/([A-Za-z][A-Za-z.]*)\.?$/);
  return (match?.[1] ?? "").toLowerCase().replace(/\./g, "");
}

function isInsideUrlOrEmail(text: string, index: number): boolean {
  const lineStart = Math.max(0, text.lastIndexOf("\n", index - 1) + 1);
  const window = text.slice(Math.max(lineStart, index - 60), index + 60);
  return /https?:\/\/|www\.|\S+@\S+\./.test(window);
}

function checkSpacesBefore(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const pattern = /[^\s]\s+([,.!?;:])/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const index = match.index + 1;
    findings.push(
      make(
        text,
        "space-before-punctuation",
        "Space before punctuation",
        "error",
        `There is a space before “${match[1]}”.`,
        index,
        1,
        match[1],
      ),
    );
  }
  return findings;
}

function checkMissingSpaceAfter(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  // Commas, semicolons and colons: never followed by a digit (1,000) or a space.
  // A space is missing unless the next character is whitespace, a digit (1,000;
  // 10:30), a closing quote or a closing bracket ("hello," he said).
  const hard = /([,;:])(?![ \n\d"'”’)\]}])/g;
  let match: RegExpExecArray | null;
  while ((match = hard.exec(text)) !== null) {
    if (isInsideUrlOrEmail(text, match.index)) continue;
    findings.push(
      make(
        text,
        "missing-space-after-punctuation",
        "Missing space after punctuation",
        "error",
        `“${match[1]}” is followed by another character and needs a space.`,
        match.index,
        1,
        `${match[1]} `,
      ),
    );
  }
  // Full stops between letters: skip e.g./i.e., initials and abbreviations.
  const dots = /([A-Za-z])\.(?=[A-Za-z])/g;
  while ((match = dots.exec(text)) !== null) {
    if (isInsideUrlOrEmail(text, match.index)) continue;
    const word = previousWord(text, match.index + 1);
    if (word.length <= 1 || ABBREVIATIONS.has(word)) continue;
    findings.push(
      make(
        text,
        "missing-space-after-punctuation",
        "Missing space after punctuation",
        "error",
        "A full stop here is followed by a letter and needs a space.",
        match.index,
        1,
        ". ",
      ),
    );
  }
  return findings;
}

function checkRepeatedPunctuation(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const pattern = /([!?])\1+|(,)\2+|(;)\3+|(:)\4+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const run = match[0];
    findings.push(
      make(
        text,
        "repeated-punctuation",
        "Repeated punctuation",
        "style",
        `“${run}” repeats the same mark ${run.length} times.`,
        match.index,
        run.length,
        run[0],
      ),
    );
  }
  return findings;
}

function checkEllipsis(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const pattern = /\.{2,}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match[0].length === 3) continue; // exactly three dots is an ellipsis
    findings.push(
      make(
        text,
        "ellipsis-length",
        "Ellipsis dots",
        "style",
        `An ellipsis is three dots; this one has ${match[0].length}.`,
        match.index,
        match[0].length,
        "…",
      ),
    );
  }
  return findings;
}

function checkBrackets(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const pairs: { name: string; open: string; close: string }[] = [
    { name: "round brackets", open: "(", close: ")" },
    { name: "square brackets", open: "[", close: "]" },
    { name: "braces", open: "{", close: "}" },
  ];
  for (const pair of pairs) {
    const opens = text.split(pair.open).length - 1;
    const closes = text.split(pair.close).length - 1;
    if (opens === closes) continue;
    const moreOpens = opens > closes;
    const index = moreOpens ? text.lastIndexOf(pair.open) : text.lastIndexOf(pair.close);
    findings.push(
      make(
        text,
        "unmatched-brackets",
        "Unmatched brackets",
        "error",
        `${opens} “${pair.open}” but ${closes} “${pair.close}” — the ${moreOpens ? "last opening" : "last closing"} ${pair.name.slice(0, -1)} has no partner.`,
        Math.max(0, index),
        1,
      ),
    );
  }
  return findings;
}

function checkQuotes(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const straight = (text.match(/"/g) ?? []).length;
  if (straight % 2 !== 0) {
    findings.push(
      make(
        text,
        "unbalanced-quotes",
        "Unbalanced quotation marks",
        "error",
        `There are ${straight} straight double quotation marks — an odd number, so one has no partner.`,
        Math.max(0, text.lastIndexOf('"')),
        1,
      ),
    );
  }
  const opens = (text.match(/[“„]/g) ?? []).length;
  const closes = (text.match(/[”]/g) ?? []).length;
  if (opens !== closes && opens + closes > 0) {
    findings.push(
      make(
        text,
        "unbalanced-quotes",
        "Unbalanced quotation marks",
        "error",
        `${opens} opening curly quote(s) but ${closes} closing one(s).`,
        Math.max(0, text.lastIndexOf("”")),
        1,
      ),
    );
  }
  return findings;
}

function checkTerminalPunctuation(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let offset = 0;
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (trimmed.length > 1 && /[A-Za-z0-9]/.test(trimmed) && !/[.!?…:;"'”’)\]}]$/.test(trimmed)) {
      const index = offset + paragraph.lastIndexOf(trimmed[trimmed.length - 1]);
      findings.push(
        make(
          text,
          "missing-terminal-punctuation",
          "Paragraph without end punctuation",
          "error",
          "This paragraph does not end with punctuation.",
          Math.max(0, index),
          1,
        ),
      );
    }
    offset += paragraph.length + 2;
  }
  return findings;
}

function checkDashes(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const spaced = /\s-\s/g;
  let match: RegExpExecArray | null;
  while ((match = spaced.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "spaced-hyphen",
        "Hyphen used as a dash",
        "style",
        "A hyphen with spaces on both sides is usually an en dash (–) or an em dash (—).",
        match.index,
        3,
        " – ",
      ),
    );
  }
  const double = /-{2,}/g;
  while ((match = double.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "double-hyphen",
        "Double hyphen",
        "style",
        `${match[0].length} hyphens in a row usually stand in for a dash.`,
        match.index,
        match[0].length,
        "—",
      ),
    );
  }
  return findings;
}

function checkBracketSpacing(text: string): PunctuationFinding[] {
  const findings: PunctuationFinding[] = [];
  const before = /\s+([)\]])/g;
  let match: RegExpExecArray | null;
  while ((match = before.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "space-before-closing",
        "Space before a closing bracket",
        "style",
        `Remove the space before “${match[1]}”.`,
        match.index,
        match[0].length,
        match[1],
      ),
    );
  }
  const after = /([([])\s+/g;
  while ((match = after.exec(text)) !== null) {
    findings.push(
      make(
        text,
        "space-after-opening",
        "Space after an opening bracket",
        "style",
        `Remove the space after “${match[1]}”.`,
        match.index,
        match[0].length,
        match[1],
      ),
    );
  }
  return findings;
}

/** Run every mechanical check and return the findings in document order. */
export function checkPunctuation(text: string): PunctuationResult {
  const findings = [
    ...checkSpacesBefore(text),
    ...checkMissingSpaceAfter(text),
    ...checkRepeatedPunctuation(text),
    ...checkEllipsis(text),
    ...checkBrackets(text),
    ...checkQuotes(text),
    ...checkTerminalPunctuation(text),
    ...checkDashes(text),
    ...checkBracketSpacing(text),
  ]
    .sort((a, b) => a.index - b.index)
    .slice(0, MAX_PUNCTUATION_FINDINGS);

  const counts: Record<string, number> = {};
  for (const rule of PUNCTUATION_RULES) counts[rule.id] = 0;
  for (const finding of findings) counts[finding.rule] = (counts[finding.rule] ?? 0) + 1;

  return { findings, counts, rulesRun: PUNCTUATION_RULES };
}

/** Report text for the copy/download buttons. */
export function formatPunctuationReport(result: PunctuationResult, text: string): string {
  if (result.findings.length === 0) {
    return `No mechanical punctuation issues. ${result.rulesRun.length} checks run over ${text.trim().length} characters.`;
  }
  const lines = [
    `Punctuation findings: ${result.findings.length}`,
    "",
    ...result.findings.map(
      (finding) =>
        `${finding.index}  ${finding.label}: ${finding.message}${finding.suggestion ? ` → ${finding.suggestion}` : ""}\n    ${finding.snippet}`,
    ),
  ];
  return lines.join("\n");
}
