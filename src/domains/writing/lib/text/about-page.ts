/**
 * About page builder: the six sections an About page needs, assembled from the
 * writer's own facts and checked against published conversion guidance.
 *
 * The checks are the things an About page most often gets wrong. The reader is
 * told about the company's passion rather than their own problem; the page
 * carries no proof with a number in it; the words "we" and "our" outnumber
 * "you" and "your"; the headline runs past a breath; and the page ends without
 * saying what to do next. Filler adjectives are listed because they consume the
 * space a differentiator should occupy.
 *
 * The builder does not invent credentials, numbers or a story. Every section is
 * your text in a fixed order, and the checks name what is missing rather than
 * filling it in.
 */
import { words } from "./tokenize.ts";

export interface AboutSection {
  id: string;
  label: string;
  prompt: string;
  text: string;
}

export interface AboutDraft {
  sections: AboutSection[];
  output: string;
  checks: string[];
  stats: { words: number; we: number; you: number };
}

export interface AboutInput {
  name?: string;
  offer?: string;
  audience?: string;
  differentiator?: string;
  proof?: string;
  story?: string;
  cta?: string;
}

/** Documented filler that displaces a differentiator. */
export const ABOUT_FILLER_WORDS: readonly string[] = [
  "passionate",
  "dedicated",
  "world-class",
  "cutting-edge",
  "best-in-class",
  "state-of-the-art",
  "innovative",
  "synergy",
  "leverage",
  "seamless",
  "robust",
  "dynamic",
];

const WE = /\b(we|our|us|i|my)\b/gi;
const YOU = /\b(you|your)\b/gi;

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Assemble the six sections and check the page's load-bearing parts. */
export function buildAboutPage(input: AboutInput = {}): AboutDraft {
  const name = clean(input.name ?? "");
  const offer = clean(input.offer ?? "");
  const audience = clean(input.audience ?? "");
  const differentiator = clean(input.differentiator ?? "");
  const proof = lines(input.proof ?? "");
  const story = clean(input.story ?? "");
  const cta = clean(input.cta ?? "");

  const headline = offer ? (name ? `${name}: ${offer}` : offer) : "";

  const sections: AboutSection[] = [
    {
      id: "headline",
      label: "Headline",
      prompt: "One sentence: what you do, for whom, with the differentiator attached.",
      text: headline || `(${name ? `${name} — ` : ""}state the offer in one sentence.)`,
    },
    {
      id: "what",
      label: "What we do",
      prompt: "The offer in plain words, and the differentiator that makes it yours.",
      text: [offer, differentiator].filter(Boolean).join("\n") || "(describe the offer.)",
    },
    {
      id: "who",
      label: "Who this is for",
      prompt: "Name the reader's situation, not a demographic.",
      text: audience || "(name who this is for and the problem they arrive with.)",
    },
    {
      id: "proof",
      label: "Proof",
      prompt: "Numbers, names, results: one per line.",
      text: proof.length > 0 ? proof.map((line) => `- ${line}`).join("\n") : "(add a number, a name or a result per line.)",
    },
    {
      id: "story",
      label: "Our story",
      prompt: "Two or three sentences: what made you start, and why it matters now.",
      text: story || "(two or three sentences: the reason the work exists.)",
    },
    {
      id: "cta",
      label: "Next step",
      prompt: "One action, one link or address.",
      text: cta || "(one action: book, buy, write, call — with the link.)",
    },
  ];

  const output = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");
  const all = sections.map((section) => section.text).join(" ");
  const we = (all.match(WE) ?? []).length;
  const you = (all.match(YOU) ?? []).length;

  const checks: string[] = [];
  if (!offer) checks.push("No offer stated: an About page opens with what the reader can get, not with history.");
  if (!audience) checks.push("No audience named: say who this is for and the situation they arrive in.");
  if (proof.length === 0) {
    checks.push("No proof at all: one number, one client or one result carries more than a paragraph of adjectives.");
  } else if (!proof.some((line) => /\d/.test(line))) {
    checks.push("No proof line carries a number; results that can be counted are the ones a reader believes.");
  }
  if (!cta) checks.push("No next step: an About page that does not say what to do next wastes the attention it earned.");
  if (!differentiator) checks.push("No differentiator: the offer is stated but nothing explains why it is yours.");

  const filler = [...new Set((all.toLowerCase().match(new RegExp(`\\b(${ABOUT_FILLER_WORDS.join("|")})\\b`, "g")) ?? []))];
  if (filler.length > 0) {
    checks.push(`Filler words detected (${filler.join(", ")}): they take the room a differentiator needs.`);
  }
  if (you > 0 && we > you * 3) {
    checks.push(`The page says we or our ${we} times against you or your ${you}: an About page is still written for the reader.`);
  }
  if (headline && words(headline).length > 20) {
    checks.push(`The headline runs ${words(headline).length} words; the reader should not need a comma clause to know what you do.`);
  }

  return { sections, output, checks, stats: { words: words(all).length, we, you } };
}
