/**
 * Email subject line tester: score a subject line against the mechanical faults
 * inboxes punish — length past the cut, spam-trigger vocabulary, shouting and
 * stacked exclamation marks — and report what it contains.
 *
 * The rubric is fixed and visible; it does not predict open rates, which depend
 * on the list, the sender and the moment.
 */
import { words } from "./tokenize.ts";

export const SPAM_WORDS = [
  "free",
  "guarantee",
  "guaranteed",
  "act now",
  "limited time",
  "risk-free",
  "click here",
  "urgent",
  "winner",
  "no obligation",
  "buy now",
  "lowest price",
  "special promotion",
];

export interface SubjectPart {
  id: string;
  label: string;
  points: number;
  max: number;
}

export interface SubjectCheck {
  id: string;
  message: string;
}

export interface SubjectAnalysis {
  score: number;
  grade: "Strong" | "Workable" | "Weak";
  chars: number;
  wordCount: number;
  spamWords: string[];
  parts: SubjectPart[];
  checks: SubjectCheck[];
}

export function analyzeSubjectLine(subject: string): SubjectAnalysis {
  const text = subject.trim().replace(/\s+/g, " ");
  const lower = text.toLowerCase();
  const tokens = words(text);
  const chars = text.length;
  const spamWords = SPAM_WORDS.filter((phrase) => lower.includes(phrase));

  const parts: SubjectPart[] = [
    {
      id: "length",
      label: "Length (50 characters or fewer)",
      points: chars === 0 ? 0 : chars <= 50 ? 30 : chars <= 70 ? 15 : 0,
      max: 30,
    },
    { id: "spam", label: "No spam-trigger phrases", points: chars === 0 ? 0 : spamWords.length === 0 ? 25 : spamWords.length === 1 ? 10 : 0, max: 25 },
    {
      id: "caps",
      label: "No ALL-CAPS words",
      points: chars === 0 || tokens.some((token) => token.length > 3 && token === token.toUpperCase() && /[A-Z]/.test(token)) ? 0 : 15,
      max: 15,
    },
    { id: "punctuation", label: "At most one exclamation mark", points: chars > 0 && (text.match(/!/g) ?? []).length <= 1 ? 15 : 0, max: 15 },
    {
      id: "concrete",
      label: "Contains a number or personalisation",
      points: chars > 0 && /\d|\{\{?\w+\}?\}/.test(text) ? 15 : 0,
      max: 15,
    },
  ];
  const score = parts.reduce((total, part) => total + part.points, 0);
  const grade: SubjectAnalysis["grade"] = score >= 80 ? "Strong" : score >= 55 ? "Workable" : "Weak";

  const checks: SubjectCheck[] = [];
  if (!text) checks.push({ id: "empty", message: "Write the subject line first." });
  if (chars > 70) checks.push({ id: "long", message: `The subject runs ${chars} characters; most inboxes cut around fifty to seventy.` });
  else if (chars > 50) checks.push({ id: "medium", message: `${chars} characters is long for a phone; move the detail into the preview text.` });
  for (const spam of spamWords) {
    checks.push({ id: `spam-${spam}`, message: `"${spam}" is a trigger phrase filters and readers both learn to skip.` });
  }
  const shouted = tokens.filter((token) => token.length > 3 && token === token.toUpperCase() && /[A-Z]/.test(token));
  if (shouted.length > 0) checks.push({ id: "caps", message: `ALL CAPS on ${shouted.join(", ")} reads as shouting.` });
  if ((text.match(/!/g) ?? []).length > 1) checks.push({ id: "bangs", message: "More than one exclamation mark; keep at most one, ideally none." });
  if (/\.$/.test(text)) checks.push({ id: "period", message: "A closing period in a subject line looks like a typo; drop it." });
  if (text && !/\d|\{\{?\w+\}?\}/.test(text)) {
    checks.push({ id: "concrete", message: "No number and no personalisation token; one of the two gives the line a reason to be opened." });
  }

  return { score, grade, chars, wordCount: tokens.length, spamWords, parts, checks };
}
