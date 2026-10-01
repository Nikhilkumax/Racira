/**
 * Survey question builder: write a question and get the mechanical problems a
 * questionnaire attracts — leading wording, two questions fused into one,
 * absolutes that force a yes or no, loaded words and a length that loses the
 * respondent part-way through.
 *
 * Each check names the exact phrase it found, so the fix is obvious. The checks
 * are about wording, not about whether the question is worth asking: that is a
 * research decision the tool cannot make.
 */

export interface SurveyIssue {
  id: string;
  label: string;
  note: string;
  cue: string;
}

export const QUESTION_TYPES = [
  "Multiple choice",
  "Single choice",
  "Rating scale",
  "Open text",
  "Yes / no",
  "Ranking",
];

const RULES: { id: string; label: string; note: string; pattern: RegExp }[] = [
  { id: "leading", label: "Leading", note: "The wording suggests the answer the respondent should give.", pattern: /\b(don't you agree|isn't it|wouldn't you|obviously|clearly|surely)\b/i },
  { id: "double-barreled", label: "Double-barrelled", note: "This asks two things at once, so a single answer cannot be read.", pattern: /\b(and|or)\b/i },
  { id: "absolute", label: "Absolute", note: "Words like always, never and all force a position the respondent may not hold.", pattern: /\b(always|never|every|everyone|all|none|only)\b/i },
  { id: "loaded", label: "Loaded", note: "The word carries an evaluation that pushes the response.", pattern: /\b(radical|reckless|bureaucratic|dangerous|obvious|backward)\b/i },
];

/** The mechanical issues in one question. */
export function analyzeQuestion(text: string): { issues: SurveyIssue[]; wordCount: number } {
  const issues: SurveyIssue[] = [];
  for (const rule of RULES) {
    const match = text.match(rule.pattern);
    if (match) issues.push({ id: rule.id, label: rule.label, note: rule.note, cue: match[0] });
  }
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > 25) {
    issues.push({ id: "length", label: "Too long", note: `This question is ${wordCount} words; shorten it so it can be read once.`, cue: `${wordCount} words` });
  }
  return { issues, wordCount };
}

export interface SurveyRow {
  text: string;
  issues: SurveyIssue[];
}

export interface SurveyReport {
  rows: SurveyRow[];
  questions: number;
  flagged: number;
}

/** Analyse a list of questions (one per line). */
export function analyzeSurvey(text: string): SurveyReport {
  const rows = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ text: line, issues: analyzeQuestion(line).issues }));
  return { rows, questions: rows.length, flagged: rows.filter((row) => row.issues.length > 0).length };
}

/** A copyable report of the survey analysis. */
export function surveyReport(report: SurveyReport): string {
  if (report.questions === 0) return "Add a question to check it.";
  return [
    `${report.questions} question(s), ${report.flagged} with a wording issue`,
    "",
    ...report.rows.map((row) =>
      row.issues.length === 0
        ? `- OK: ${row.text}`
        : `- ${row.text}\n${row.issues.map((issue) => `    ${issue.label} ("${issue.cue}"): ${issue.note}`).join("\n")}`,
    ),
  ].join("\n");
}
