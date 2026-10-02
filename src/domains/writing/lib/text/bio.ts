/**
 * Bio generator: turn a name, a role, a focus and a few facts into three bios —
 * a one-line, a short paragraph and a full paragraph — in the third person.
 *
 * The engine assembles only what the writer supplies; the checks flag the slips
 * that make a bio sound like a template (no facts, first person, an over-long
 * paragraph). It invents no credits and no biography.
 */
import { words } from "./tokenize.ts";

export interface BioInput {
  name: string;
  role: string;
  focus: string;
  location: string;
  /** One fact per line. */
  facts: string[];
}

export interface BioCheck {
  id: string;
  message: string;
}

export interface BioSet {
  short: string;
  medium: string;
  long: string;
  wordCounts: { short: number; medium: number; long: number };
  checks: BioCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);
const article = (word: string): string => (/^[aeiou]/i.test(word) ? "an" : "a");

export function buildBio(input: BioInput): BioSet {
  const name = clean(input.name);
  const role = clean(input.role);
  const focus = clean(input.focus);
  const location = clean(input.location);
  const facts = input.facts.map(clean).filter(Boolean);

  const who = name || "The writer";
  const rolePhrase = role ? (/^(a|an|the)\s/i.test(role) ? role : `${article(role)} ${role}`) : "";
  const where = location ? ` based in ${location}` : "";
  const whoLine = rolePhrase ? `${who} is ${rolePhrase}${where}.` : `${who} is a writer${where}.`;
  const focusLine = focus ? `The work focuses on ${focus}.` : "";
  const factLines = facts.map(endSentence);

  const short = whoLine;
  const medium = [whoLine, focusLine, factLines[0] ?? ""].filter(Boolean).join(" ");
  const long = [whoLine, focusLine, ...factLines].filter(Boolean).join(" ");

  const checks: BioCheck[] = [];
  if (!role) {
    checks.push({ id: "role", message: "Name the role or title the bio should lead with; it is the first thing a reader looks for." });
  }
  if (!focus) {
    checks.push({ id: "focus", message: "Say what the work focuses on — a bio without a subject reads as a placeholder." });
  }
  if (facts.length === 0) {
    checks.push({ id: "facts", message: "Add one or two facts (a credit, a publication, a first) so the bio has something to stand on." });
  }
  if (facts.length > 6) {
    checks.push({ id: "facts-many", message: `${facts.length} facts is more than a bio carries; keep the ones a stranger would repeat.` });
  }
  if (facts.some((fact) => /\b(I|my|me)\b/i.test(fact))) {
    checks.push({ id: "first-person", message: "A bio is written in the third person; rewrite the first-person facts." });
  }
  for (const fact of facts) {
    const count = words(fact).length;
    if (count > 30) checks.push({ id: "fact-long", message: `One fact runs ${count} words; trim it to a sentence.` });
  }
  const longWords = words(long).length;
  if (longWords > 150) {
    checks.push({ id: "long", message: `The long bio runs ${longWords} words; a book-jacket paragraph is usually under 150.` });
  }

  return {
    short,
    medium,
    long,
    wordCounts: {
      short: words(short).length,
      medium: words(medium).length,
      long: words(long).length,
    },
    checks,
  };
}
