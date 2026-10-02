/**
 * Ad copy framework builder: three classic structures — AIDA, PAS and BAB —
 * assembled from the same fields, so the same offer can be read in each shape.
 *
 * The engine maps your words onto the framework's slots and checks that every
 * slot the framework needs has something in it. It writes no claims and knows
 * nothing about the offer.
 */
import { words } from "./tokenize.ts";

export interface AdFrameworkInput {
  product: string;
  audience: string;
  problem: string;
  agitate: string;
  benefit: string;
  proof: string;
}

export interface AdFramework {
  id: string;
  label: string;
  slots: { label: string; hint: string }[];
  /** Fields the framework needs before its draft is complete. */
  needed: (keyof AdFrameworkInput)[];
}

export const AD_FRAMEWORKS: AdFramework[] = [
  {
    id: "aida",
    label: "AIDA — attention, interest, desire, action",
    slots: [
      { label: "Attention", hint: "the problem, stated so it stings" },
      { label: "Interest", hint: "who this is for and what changes" },
      { label: "Desire", hint: "the benefit and the proof" },
      { label: "Action", hint: "the one thing to do next" },
    ],
    needed: ["product", "audience", "problem", "benefit", "proof"],
  },
  {
    id: "pas",
    label: "PAS — problem, agitate, solution",
    slots: [
      { label: "Problem", hint: "the situation in the reader's words" },
      { label: "Agitate", hint: "what it costs when it is left alone" },
      { label: "Solution", hint: "what changes, with proof" },
    ],
    needed: ["product", "audience", "problem", "agitate", "benefit", "proof"],
  },
  {
    id: "bab",
    label: "BAB — before, after, bridge",
    slots: [
      { label: "Before", hint: "the world as it is now" },
      { label: "After", hint: "the world once the problem is gone" },
      { label: "Bridge", hint: "how the product gets them across" },
    ],
    needed: ["product", "audience", "problem", "benefit", "proof"],
  },
];

export interface AdFrameworkCheck {
  id: string;
  message: string;
}

export interface AdFrameworkDraft {
  framework: AdFramework;
  draft: string;
  words: number;
  checks: AdFrameworkCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);
const capitalise = (line: string): string => (line ? `${line.charAt(0).toUpperCase()}${line.slice(1)}` : line);

export function buildAdFramework(frameworkId: string, input: AdFrameworkInput): AdFrameworkDraft {
  const framework = AD_FRAMEWORKS.find((entry) => entry.id === frameworkId) ?? AD_FRAMEWORKS[0];
  const fields: AdFrameworkInput = {
    product: clean(input.product),
    audience: clean(input.audience),
    problem: clean(input.problem),
    agitate: clean(input.agitate),
    benefit: clean(input.benefit),
    proof: clean(input.proof),
  };

  const lines: string[] = [];
  if (framework.id === "aida") {
    lines.push(`Attention: ${endSentence(capitalise(fields.problem))}`);
    lines.push(`Interest: ${fields.product} is built for ${fields.audience}.`);
    lines.push(`Desire: ${endSentence(capitalise(fields.benefit))} ${endSentence(capitalise(fields.proof))}`);
    lines.push(`Action: Get ${fields.product}.`);
  } else if (framework.id === "pas") {
    lines.push(`Problem: ${endSentence(capitalise(fields.problem))}`);
    lines.push(`Agitate: ${endSentence(capitalise(fields.agitate))}`);
    lines.push(
      `Solution: ${fields.product} helps ${fields.audience} ${fields.benefit}. ${endSentence(capitalise(fields.proof))} Get ${fields.product}.`,
    );
  } else {
    lines.push(`Before: ${endSentence(capitalise(fields.problem))}`);
    lines.push(`After: ${endSentence(capitalise(fields.benefit))}`);
    lines.push(`Bridge: ${fields.product} gets ${fields.audience} there. ${endSentence(capitalise(fields.proof))} Get ${fields.product}.`);
  }

  const draft = lines.join("\n");

  const checks: AdFrameworkCheck[] = [];
  const missing = framework.needed.filter((key) => !fields[key]);
  for (const key of missing) {
    checks.push({ id: `missing-${key}`, message: `The ${framework.id.toUpperCase()} framework needs "${key}" before the draft is complete.` });
  }
  if (words(draft).length > 120) {
    checks.push({ id: "long", message: `The draft runs ${words(draft).length} words; an ad is read in seconds.` });
  }

  return { framework, draft, words: words(draft).length, checks };
}
