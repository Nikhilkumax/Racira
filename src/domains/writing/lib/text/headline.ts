/**
 * Headline analyzer: score a headline against the mechanical habits strong
 * headlines share — a length a reader can take in, concrete detail, a power
 * word, an address to the reader — and flag the habits that weaken one.
 *
 * The score is a documented rubric, not a prediction. It says what the headline
 * contains, never whether the story under it is worth reading.
 */
import { words } from "./tokenize.ts";

export const POWER_WORDS = new Set([
  "proven", "ultimate", "free", "new", "guide", "essential", "easy", "fastest", "best", "complete",
  "step-by-step", "simple", "practical", "honest", "quiet", "exact", "working", "field-tested",
]);

export interface HeadlinePart {
  id: string;
  label: string;
  points: number;
  max: number;
}

export interface HeadlineCheck {
  id: string;
  message: string;
}

export interface HeadlineAnalysis {
  score: number;
  grade: "Strong" | "Workable" | "Weak";
  wordCount: number;
  powerWords: string[];
  parts: HeadlinePart[];
  checks: HeadlineCheck[];
}

export function analyzeHeadline(headline: string): HeadlineAnalysis {
  const text = headline.trim().replace(/\s+/g, " ");
  const tokens = words(text);
  const wordCount = tokens.length;
  const lower = text.toLowerCase();
  const powerWords = [...new Set(tokens.filter((token) => POWER_WORDS.has(token.toLowerCase())))];

  const parts: HeadlinePart[] = [
    {
      id: "length",
      label: "Length (6-12 words)",
      points: wordCount >= 6 && wordCount <= 12 ? 25 : wordCount >= 4 && wordCount <= 15 ? 15 : 0,
      max: 25,
    },
    { id: "power", label: "Power word", points: powerWords.length > 0 ? 20 : 0, max: 20 },
    { id: "number", label: "Concrete number", points: /\d/.test(text) ? 15 : 0, max: 15 },
    { id: "you", label: "Addresses the reader", points: /\b(you|your)\b/i.test(text) ? 10 : 0, max: 10 },
    { id: "shape", label: "Question or list shape", points: /[?:]|\s[—|]\s/.test(text) ? 10 : 0, max: 10 },
    { id: "case", label: "Readable capitalisation", points: /^[A-Z\u201c"']/.test(text) ? 10 : 0, max: 10 },
  ];
  const score = parts.reduce((total, part) => total + part.points, 0);

  const checks: HeadlineCheck[] = [];
  if (wordCount > 15) checks.push({ id: "long", message: `The headline runs ${wordCount} words; past fifteen, readers skim instead.` });
  if (wordCount < 4) checks.push({ id: "short", message: `Only ${wordCount} words — too little for the reader to know what the piece is about.` });
  if (powerWords.length === 0) checks.push({ id: "power", message: "No power word: add one concrete, load-bearing adjective rather than several vague ones." });
  if (!/\d/.test(text)) checks.push({ id: "number", message: "No number: a figure (a count, a duration, a price) makes a headline concrete." });
  if (!/\b(you|your)\b/i.test(text)) checks.push({ id: "you", message: "The headline does not address the reader; your or you puts them in the sentence." });
  const shouted = tokens.filter((token) => token.length > 3 && token === token.toUpperCase() && /[A-Z]/.test(token));
  if (shouted.length > 0) checks.push({ id: "caps", message: `ALL CAPS on ${shouted.join(", ")} reads as shouting; use caps for no more than one word, if at all.` });
  if (/\.$/.test(text)) checks.push({ id: "period", message: "Headlines take no closing period." });
  const lowered = tokens.map((token) => token.toLowerCase());
  const repeated = [...new Set(lowered.filter((token, index) => lowered.indexOf(token) !== index && token.length > 3))];
  if (repeated.length > 0) checks.push({ id: "repeat", message: `Repeated word: ${repeated.join(", ")} — a second use is usually a cut.` });

  const grade: HeadlineAnalysis["grade"] = score >= 80 ? "Strong" : score >= 55 ? "Workable" : "Weak";

  return { score, grade, wordCount, powerWords, parts, checks };
}
