/**
 * CTA button copy generator: build button-label variants from a verb, an object
 * and the benefit behind the click, and check the wording a button cannot
 * afford — a passive verb, a label that became a sentence.
 *
 * The engine composes five short variants from the parts; the choice, and the
 * promise, remain the writer's.
 */
import { words } from "./tokenize.ts";

export interface CtaInput {
  verb: string;
  object: string;
  benefit: string;
}

export interface CtaCheck {
  id: string;
  message: string;
}

export interface CtaDraft {
  variants: string[];
  words: number[];
  checks: CtaCheck[];
}

/** Verbs that ask the reader for effort rather than offering a reward. */
const WEAK_VERBS = new Set(["submit", "click", "send", "read", "view", "continue"]);

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildCtaVariants(input: CtaInput): CtaDraft {
  const verb = clean(input.verb);
  const object = clean(input.object);
  const benefit = clean(input.benefit);

  const verbs: string[] = [];
  if (verb && object) {
    const bare = verb.replace(/^(to\s+|please\s+)/i, "");
    verbs.push(`${bare} ${object}`);
    if (benefit) {
      verbs.push(`${bare} ${object} and ${benefit}`);
      verbs.push(`${bare} ${object} — ${benefit}.`);
      verbs.push(`Your next step: ${bare.charAt(0).toUpperCase()}${bare.slice(1)} ${object}.`);
      const benefitPhrase = benefit.replace(/^(to\s+|and\s+)/i, "");
      verbs.push(`Ready to ${benefitPhrase}? ${bare.charAt(0).toUpperCase()}${bare.slice(1)} ${object}.`);
    }
  }

  const wordCounts = verbs.map((variant) => words(variant).length);

  const checks: CtaCheck[] = [];
  if (!verb) checks.push({ id: "verb", message: "Choose a verb the reader wants to do: download, start, get, save." });
  if (!object) checks.push({ id: "object", message: "Name what the click gets — the template, the checklist, the trial." });
  if (!benefit) {
    checks.push({ id: "benefit", message: "Add the benefit behind the click; without it the button is a command." });
  }
  if (verb && WEAK_VERBS.has(verb.toLowerCase())) {
    checks.push({
      id: "weak-verb",
      message: `"${verb}" asks the reader for effort. Verbs like download, start or get describe what they receive.`,
    });
  }
  for (const [index, count] of wordCounts.entries()) {
    if (count > 10) {
      checks.push({ id: "long", message: `Variant ${index + 1} runs ${count} words; a button label is a phrase of two to six.` });
    }
  }
  if (verb && /\bclick here\b/i.test(`${verb} ${object}`)) {
    checks.push({ id: "click-here", message: "Avoid \"click here\"; name the destination instead." });
  }

  return { variants: verbs, words: wordCounts, checks };
}
