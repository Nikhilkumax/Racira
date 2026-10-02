/**
 * Abstract builder: five labelled parts assembled into a structured or
 * unstructured abstract, with the word count checked against a target range.
 *
 * The five parts follow the order a reader expects in IMRaD-shaped abstracts:
 * background, objective, methods, results, conclusions. The builder composes
 * them and checks the things a rule engine can genuinely check — a missing
 * part, a results part with no figures in it, a conclusion longer than the
 * results, methods that are too short to repeat, and a total outside the usual
 * 150-250 word band.
 *
 * It does not write the abstract: every sentence is the writer's own, and the
 * tool's contribution is the order, the labels and the checks.
 */
import { words } from "./tokenize.ts";

export interface AbstractSectionSpec {
  id: string;
  label: string;
  hint: string;
}

/** The five parts, in the order they are assembled. */
export const ABSTRACT_SECTIONS: readonly AbstractSectionSpec[] = [
  { id: "background", label: "Background", hint: "What is already known and why this question matters." },
  { id: "objective", label: "Objective", hint: "What this study set out to establish." },
  { id: "methods", label: "Methods", hint: "Design, sample, measures and analysis." },
  { id: "results", label: "Results", hint: "The findings, with the numbers that carry them." },
  { id: "conclusions", label: "Conclusions", hint: "What the findings mean and what follows." },
];

/** Usual word band for a journal abstract. */
export const DEFAULT_ABSTRACT_RANGE = { min: 150, max: 250 };

export interface AbstractSection {
  id: string;
  label: string;
  text: string;
  words: number;
}

export interface AbstractCheck {
  id: string;
  message: string;
}

export interface AbstractDraft {
  output: string;
  sections: AbstractSection[];
  words: number;
  checks: AbstractCheck[];
  /** True when the labels prefix each part. */
  structured: boolean;
  range: { min: number; max: number };
}

export interface AbstractOptions {
  structured?: boolean;
  min?: number;
  max?: number;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Assemble the parts, then run the checks over the result. */
export function buildAbstract(
  input: Record<string, string>,
  options: AbstractOptions = {},
): AbstractDraft {
  const structured = options.structured !== false;
  const range = {
    min: options.min ?? DEFAULT_ABSTRACT_RANGE.min,
    max: options.max ?? DEFAULT_ABSTRACT_RANGE.max,
  };

  const sections: AbstractSection[] = ABSTRACT_SECTIONS.map((spec) => {
    const text = clean(input[spec.id] ?? "");
    return { id: spec.id, label: spec.label, text, words: words(text).length };
  });

  const checks: AbstractCheck[] = [];
  for (const section of sections) {
    if (!section.text) {
      checks.push({ id: `missing-${section.id}`, message: `${section.label} is empty; an abstract is read as a whole.` });
    }
  }

  const byId = new Map(sections.map((section) => [section.id, section]));
  const methods = byId.get("methods");
  const results = byId.get("results");
  const conclusions = byId.get("conclusions");

  if (methods && methods.text && methods.words < 15) {
    checks.push({
      id: "methods-short",
      message: `Methods runs ${methods.words} words; a reader needs design, sample and analysis in one or two sentences.`,
    });
  }
  if (results && results.text && !/\d/.test(results.text)) {
    checks.push({
      id: "results-no-figures",
      message: "Results contains no figures; an abstract without a number gives the reader nothing to weigh.",
    });
  }
  if (conclusions && results && conclusions.words > results.words && results.words > 0) {
    checks.push({
      id: "conclusion-long",
      message: `Conclusions (${conclusions.words} words) is longer than Results (${results.words}); the findings should be the heavier half.`,
    });
  }

  const total = sections.reduce((sum, section) => sum + section.words, 0);
  if (total === 0) {
    checks.push({ id: "empty", message: "Fill at least the objective and the methods to see an abstract take shape." });
  } else if (total < range.min) {
    checks.push({
      id: "short",
      message: `${total} words — under the usual ${range.min}-${range.max} band; the methods or results are probably thin.`,
    });
  } else if (total > range.max) {
    checks.push({
      id: "long",
      message: `${total} words — over the usual ${range.min}-${range.max} band; abstracts are read before they are chosen.`,
    });
  }

  const output = structured
    ? sections
        .filter((section) => section.text)
        .map((section) => `${section.label}: ${section.text}`)
        .join("\n")
    : sections
        .filter((section) => section.text)
        .map((section) => section.text)
        .join(" ");

  return { output, sections, words: total, checks, structured, range };
}
