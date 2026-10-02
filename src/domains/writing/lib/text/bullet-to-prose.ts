/**
 * Bullet to prose: turn a list of bullet lines into a paragraph, with the
 * bullets counted and the awkward ones flagged.
 *
 * Two published shapes are offered. "Paragraph" keeps every bullet as its own
 * sentence and can open them with a sequence of connectors. "Single sentence"
 * joins short bullets with commas and and, which reads as a list inside a
 * sentence and is only offered for bullets that are short enough to survive it.
 *
 * The engine never invents a transition with meaning — the connectors are a
 * fixed sequence — and it flags the bullets that prose will not carry: a bullet
 * past twenty-five words, a bullet that is really a heading, and duplicates.
 */
import { words } from "./tokenize.ts";

/** Fixed sequence connectors; the last is used for every bullet after it. */
export const PROSE_CONNECTORS: readonly string[] = [
  "First",
  "Next",
  "Then",
  "After that",
  "Finally",
];

/** Bullets longer than this carry more than a sentence wants. */
export const MAX_BULLET_WORDS = 25;

export type ProseShape = "paragraph" | "single";

export interface ProseBullet {
  /** Bullet text with the marker and trailing punctuation removed. */
  text: string;
  words: number;
}

export interface BulletsToProseOptions {
  shape?: ProseShape;
  /** Open the sentences with the fixed connector sequence. */
  connectors?: boolean;
}

export interface ProseDraft {
  output: string;
  bullets: ProseBullet[];
  sentences: number;
  checks: string[];
  shape: ProseShape;
}

const MARKER = /^\s*(?:[-*•·‣▪–]|\(?\d+[.)]|[a-z][.)])\s+/i;

function stripMarker(line: string): string {
  return line.replace(MARKER, "").trim();
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function asSentence(value: string): string {
  const trimmed = value.replace(/[.;,]+$/, "").trim();
  if (!trimmed) return "";
  return /[!?]$/.test(trimmed) ? capitalize(trimmed) : `${capitalize(trimmed)}.`;
}

/** Parse the bullet lines without composing anything. */
export function parseBullets(text: string): ProseBullet[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(stripMarker)
    .filter((line) => line.length > 0)
    .map((line) => ({ text: line, words: words(line).length }));
}

/** Compose the paragraph or sentence and report what will not travel. */
export function bulletsToProse(text: string, options: BulletsToProseOptions = {}): ProseDraft {
  const shape: ProseShape = options.shape === "single" ? "single" : "paragraph";
  const bullets = parseBullets(text);
  const checks: string[] = [];
  if (bullets.length === 0) checks.push("Paste a bullet list — one item per line.");

  const seen = new Set<string>();
  const unique: ProseBullet[] = [];
  for (const bullet of bullets) {
    const key = bullet.text.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "");
    if (seen.has(key)) {
      checks.push(`Duplicate bullet dropped: ${bullet.text}`);
      continue;
    }
    seen.add(key);
    unique.push(bullet);
  }

  for (const bullet of unique) {
    if (bullet.words > MAX_BULLET_WORDS) {
      checks.push(`A ${bullet.words}-word bullet will read as a paragraph inside the paragraph; split it first.`);
    }
    if (bullet.words <= 2 || /:$/.test(bullet.text)) {
      checks.push(`"${bullet.text}" looks like a heading rather than a sentence; prose needs a verb.`);
    }
  }

  let output = "";
  if (shape === "single") {
    if (unique.length === 1) {
      output = asSentence(unique[0].text);
    } else if (unique.length > 1) {
      const head = unique.slice(0, -1).map((bullet) => bullet.text.replace(/[.;,]+$/, ""));
      const last = unique[unique.length - 1].text.replace(/[.;,]+$/, "");
      output = asSentence(`${head.join(", ")} and ${last}`);
    }
  } else {
    output = unique
      .map((bullet, index) => {
        const sentence = asSentence(bullet.text);
        if (!options.connectors) return sentence;
        const connector = PROSE_CONNECTORS[Math.min(index, PROSE_CONNECTORS.length - 1)];
        if (index === 0) return sentence;
        return `${connector} ${sentence.charAt(0).toLowerCase()}${sentence.slice(1)}`;
      })
      .join(" ");
  }

  return { output, bullets: unique, sentences: shape === "single" ? (output ? 1 : 0) : unique.length, checks, shape };
}
