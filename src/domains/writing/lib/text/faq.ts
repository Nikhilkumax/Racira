/**
 * FAQ generator: turn a topic and a list of question-and-answer lines into a
 * formatted FAQ section, then check the coverage and the answers.
 *
 * The engine formats and checks; it writes no answers. The checks cover what an
 * FAQ section needs: enough questions, no duplicates, an answer under each one,
 * at least one question a reader would actually type.
 */
import { words } from "./tokenize.ts";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqInput {
  topic: string;
  /** One per line: Question | Answer */
  items: FaqItem[];
}

export interface FaqCheck {
  id: string;
  message: string;
}

export interface FaqDraft {
  section: string;
  words: number;
  questions: number;
  checks: FaqCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);
const QUESTION_STARTERS = new Set(["how", "what", "why", "when", "where", "who", "can", "do", "does", "is", "are", "will", "should"]);

export function parseFaqItems(lines: string[]): FaqItem[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map(clean);
      return { question: parts[0] ?? "", answer: parts.slice(1).join(" | ") };
    })
    .filter((item) => item.question.length > 0);
}

export function buildFaqSection(input: FaqInput): FaqDraft {
  const topic = clean(input.topic);
  const items = input.items.map((item) => ({ question: clean(item.question), answer: clean(item.answer) }));

  const blocks: string[] = [`Frequently asked questions about ${topic || "this topic"}`];
  for (const item of items) {
    blocks.push(`Q: ${item.question}\nA: ${item.answer ? endSentence(item.answer) : "TODO — answer in two or three sentences."}`);
  }

  const section = blocks.join("\n\n");

  const checks: FaqCheck[] = [];
  if (!topic) checks.push({ id: "topic", message: "Name the topic; the heading is what tells a reader this FAQ is for them." });
  if (items.length < 3) {
    checks.push({
      id: "count",
      message: `${items.length} question${items.length === 1 ? "" : "s"} so far; a useful FAQ section answers at least three.`,
    });
  }
  if (items.length > 10) {
    checks.push({ id: "count-many", message: `${items.length} questions is a support page, not an FAQ section; keep the ten most asked.` });
  }
  const seen = new Set<string>();
  for (const item of items) {
    const key = item.question.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
    if (seen.has(key)) {
      checks.push({ id: "duplicate", message: `"${item.question}" appears twice; merge the answers.` });
    }
    seen.add(key);
  }
  for (const item of items.filter((entry) => !entry.answer)) {
    checks.push({ id: "answer", message: `Write an answer to "${item.question}" — two or three sentences is enough.` });
  }
  for (const item of items) {
    const count = words(item.answer).length;
    if (count > 80) {
      checks.push({ id: "answer-long", message: `The answer to "${item.question}" runs ${count} words; an FAQ answer is a paragraph, not a page.` });
    }
  }
  const hasReaderQuestion = items.some((item) => QUESTION_STARTERS.has(item.question.split(/\s+/)[0]?.toLowerCase() ?? ""));
  if (items.length >= 3 && !hasReaderQuestion) {
    checks.push({
      id: "coverage",
      message: "None of the questions starts with how, what, why, when, where, who, can, do, does, is, are, will or should — write at least one the way a reader would type it.",
    });
  }

  return { section, words: words(section).length, questions: items.length, checks };
}
