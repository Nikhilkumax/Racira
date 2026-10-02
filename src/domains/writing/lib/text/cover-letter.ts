/**
 * Cover letter builder: assemble a letter from a name, a role, a company, the
 * specifics to bring and a closing line, with structural checks.
 *
 * The engine composes and checks the shape — it does not write the specifics or
 * judge whether the letter will win the role. The checks are prompts about
 * structure: no company named, no specifics, a closing that asks for nothing.
 */
import { words } from "./tokenize.ts";

export interface CoverLetterInput {
  name: string;
  role: string;
  company: string;
  strengths: string[];
  closing: string;
}

export interface CoverLetterCheck {
  id: string;
  message: string;
}

export interface CoverLetterDraft {
  letter: string;
  words: number;
  paragraphs: number;
  checks: CoverLetterCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);

/** Join a short list as "a; b; and c" so the body reads as a sentence. */
function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join("; ")}; and ${items[items.length - 1]}`;
}

export function buildCoverLetter(input: CoverLetterInput): CoverLetterDraft {
  const name = clean(input.name);
  const role = clean(input.role);
  const company = clean(input.company);
  const strengths = input.strengths.map(clean).filter(Boolean);
  const closing = clean(input.closing);

  const blocks: string[] = [];
  if (name) blocks.push(name);
  if (company) blocks.push(`Dear ${company} hiring team,`);
  if (role) blocks.push(`I am writing to apply for the ${role} role${company ? ` at ${company}` : ""}.`);
  if (strengths.length > 0) {
    blocks.push(`What I would bring to ${company || "the role"}: ${joinList(strengths)}.`);
  }
  if (closing) blocks.push(endSentence(closing));
  blocks.push("Sincerely,");
  if (name) blocks.push(name);

  const letter = blocks.join("\n\n");

  const checks: CoverLetterCheck[] = [];
  if (!name) {
    checks.push({ id: "name", message: "Add your name — every letter is signed by someone." });
  }
  if (!company) {
    checks.push({
      id: "company",
      message: "Name the company: a letter addressed to any employer reads as a mailshot.",
    });
  }
  if (!role) {
    checks.push({ id: "role", message: "Name the role, so the reader knows which opening this is about." });
  }
  if (strengths.length === 0) {
    checks.push({
      id: "strengths",
      message: "Add at least one specific you would bring; a letter with no specifics gives the reader nothing to remember.",
    });
  }
  if (strengths.length > 5) {
    checks.push({
      id: "strength-count",
      message: `${strengths.length} specifics is more than a first read holds; keep the five strongest.`,
    });
  }
  for (const strength of strengths) {
    const count = words(strength).length;
    if (count > 25) {
      checks.push({ id: "strength-long", message: `One specific runs ${count} words; keep each under twenty-five.` });
    }
  }
  if (!closing) {
    checks.push({
      id: "closing",
      message: "Close with what you want next — an interview, a call — rather than a general thank-you.",
    });
  }

  return { letter, words: words(letter).length, paragraphs: blocks.length, checks };
}
