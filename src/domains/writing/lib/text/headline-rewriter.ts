/**
 * Headline rewriter: one subject and one action turned into five published
 * headline angles, plus a check list for a headline the writer already has.
 *
 * The angles are fixed patterns, so the tool composes from the writer's own
 * words and never invents a claim about the article. Two fields keep the
 * grammar sound: `action` is a verb phrase ("write a better headline") for the
 * how-to and list angles, and `subject` is a noun phrase ("headline writing")
 * for the guide, mistakes and question angles.
 *
 * The checks are the second half: length in characters and words, a trailing
 * period, a clickbait phrase, shouted words and a repeated word. Each flag
 * explains the cost rather than merely naming the habit.
 */
import { words } from "./tokenize.ts";

export interface HeadlineAngle {
  id: string;
  label: string;
}

/** The five published angles, in the order they are offered. */
export const HEADLINE_ANGLES: readonly HeadlineAngle[] = [
  { id: "howto", label: "How to" },
  { id: "list", label: "Numbered list" },
  { id: "guide", label: "Guide" },
  { id: "mistakes", label: "Mistakes" },
  { id: "question", label: "Question" },
];

/** Phrases that promise more than the article can deliver. */
export const CLICKBAIT_PHRASES: readonly string[] = [
  "you won't believe",
  "shocking",
  "unbelievable",
  "insane",
  "mind-blowing",
  "secret trick",
  "this one trick",
  "doctors hate",
  "gone wrong",
  "ultimate guide",
];

/** Character and word ceilings a search result will not truncate. */
export const MAX_HEADLINE_CHARS = 60;
export const MAX_HEADLINE_WORDS = 12;

export interface HeadlineFlag {
  id: string;
  message: string;
}

export interface HeadlineVariant {
  id: string;
  label: string;
  text: string;
  note: string;
}

export interface HeadlineRewrite {
  variants: HeadlineVariant[];
  flags: HeadlineFlag[];
  /** True when the writer supplied a headline to review. */
  reviewed: boolean;
}

export interface HeadlineRewriteInput {
  /** Noun phrase, e.g. "headline writing". */
  subject: string;
  /** Verb phrase, e.g. "write a better headline". */
  action: string;
  /** Optional audience, appended to the how-to and guide angles. */
  audience?: string;
  /** Number used by the list and mistakes angles. */
  count?: string;
  /** Optional existing headline to review. */
  headline?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ").replace(/[.!?]+$/, "");

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Five composed headlines from the supplied parts. */
export function rewriteHeadline(input: HeadlineRewriteInput): HeadlineRewrite {
  const subject = clean(input.subject);
  const action = clean(input.action);
  const audience = clean(input.audience ?? "");
  const count = clean(input.count ?? "") || "5";
  const forAudience = audience ? ` for ${audience}` : "";

  const variants: HeadlineVariant[] = [];
  if (action) {
    variants.push({
      id: "howto",
      label: "How to",
      text: `How to ${action}${forAudience}`,
      note: "The plainest promise in headline writing: the reader knows the article will tell them how.",
    });
  }
  if (action) {
    variants.push({
      id: "list",
      label: "Numbered list",
      text: `${count} ways to ${action}`,
      note: "A number sets a visible length, which is why list headlines are easy to click and easy to write badly.",
    });
  }
  if (subject) {
    variants.push({
      id: "guide",
      label: "Guide",
      text: `${capitalize(subject)}: a practical guide${forAudience}`,
      note: "A colon and a noun shape signals a reference rather than a promise; good for evergreen pages.",
    });
  }
  if (subject) {
    variants.push({
      id: "mistakes",
      label: "Mistakes",
      text: `${capitalize(subject)}: ${count} mistakes to avoid`,
      note: "Fear of error is a strong hook, so only use it when the article names the mistakes plainly.",
    });
  }
  if (subject) {
    variants.push({
      id: "question",
      label: "Question",
      text: `What does good ${subject} look like?`,
      note: "A question works when the reader genuinely does not know; it fails when the answer is obvious.",
    });
  }

  return { variants, flags: input.headline !== undefined ? checkHeadline(input.headline) : [], reviewed: input.headline !== undefined };
}

/** Every documented problem with a headline, with the reason each one costs. */
export function checkHeadline(headline: string): HeadlineFlag[] {
  const text = headline.trim().replace(/\s+/g, " ");
  const flags: HeadlineFlag[] = [];
  if (!text) return flags;

  if (text.length > MAX_HEADLINE_CHARS) {
    flags.push({
      id: "chars",
      message: `${text.length} characters — search results usually truncate past ${MAX_HEADLINE_CHARS}, so the end may never be read.`,
    });
  }
  const count = words(text).length;
  if (count > MAX_HEADLINE_WORDS) {
    flags.push({ id: "words", message: `${count} words — a headline past ${MAX_HEADLINE_WORDS} has started explaining.` });
  }
  if (/[.!]$/.test(text)) {
    flags.push({ id: "period", message: "Ends with a full stop; headlines are labels, and a period adds a beat they do not need." });
  }
  const lower = text.toLowerCase();
  for (const phrase of CLICKBAIT_PHRASES) {
    if (lower.includes(phrase)) {
      flags.push({
        id: `clickbait-${phrase.split(" ")[0]}`,
        message: `Contains "${phrase}": a promise the article has to cash, and a phrase readers have learned to distrust.`,
      });
    }
  }
  const shouted = words(text).filter((word) => word.length > 2 && word === word.toUpperCase() && /[A-Z]/.test(word));
  if (shouted.length > 0) {
    flags.push({ id: "caps", message: `Shouted word${shouted.length > 1 ? "s" : ""}: ${shouted.join(", ")}.` });
  }
  const seen = new Set<string>();
  for (const word of words(text).map((word) => word.toLowerCase())) {
    if (word.length > 2 && seen.has(word)) {
      flags.push({ id: "repeat", message: `"${word}" appears twice; a headline has room for a word once.` });
      break;
    }
    seen.add(word);
  }
  return flags;
}
