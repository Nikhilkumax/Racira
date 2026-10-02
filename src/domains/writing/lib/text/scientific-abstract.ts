/**
 * Scientific abstract builder: five sentence roles assembled into a labelled or
 * continuous abstract, with each role checked against what it has to contain.
 *
 * This is a role checker rather than a label assembler. A gap sentence that
 * never says what is not yet known is not doing its job, so the gap role looks
 * for a marker such as "remains unclear" or "has not been examined". A results
 * sentence with no figure in it cannot be weighed, so the results role looks
 * for a number — and flags hedging words there, because "appears to" belongs in
 * the implication rather than in the finding. An implication with no
 * consequence marker is a restatement rather than a conclusion.
 *
 * Every check names the role it belongs to and explains the cost, and the
 * composition itself is only your own sentences in a fixed order.
 */
import { words } from "./tokenize.ts";

export interface AbstractRole {
  id: string;
  label: string;
  hint: string;
}

/** The five roles, in the order a reader expects them. */
export const ABSTRACT_ROLES: readonly AbstractRole[] = [
  { id: "context", label: "Context", hint: "What is already established in this area." },
  { id: "gap", label: "Gap", hint: "What is not yet known, stated as a gap." },
  { id: "approach", label: "Approach", hint: "What was done, with the design and the sample." },
  { id: "results", label: "Key results", hint: "The findings, carrying their figures." },
  { id: "implication", label: "Implication", hint: "What the findings suggest and what follows." },
];

/** Usual band for a scientific abstract. */
export const DEFAULT_SCIENTIFIC_RANGE = { min: 200, max: 300 };

export interface RoleCheck {
  id: string;
  role: string;
  message: string;
  level: "info" | "warn";
}

export interface ScientificAbstractPart {
  id: string;
  label: string;
  text: string;
  words: number;
}

export interface ScientificAbstractDraft {
  /** Labelled version. */
  output: string;
  /** Continuous version, labels dropped. */
  continuous: string;
  parts: ScientificAbstractPart[];
  words: number;
  checks: RoleCheck[];
  range: { min: number; max: number };
}

export interface ScientificAbstractOptions {
  min?: number;
  max?: number;
  /** Warn when more than this many acronyms appear. */
  maxAcronyms?: number;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

const GAP_MARKERS = /(remains? (?:unclear|unknown|untested|unresolved)|has not been|have not been|little is known|is unknown|remains to be|no study|scarce|has yet to|not (?:yet )?established)/i;
const APPROACH_MARKERS = /(we (?:surveyed|analysed|analyzed|interviewed|measured|tested|reviewed|modelled|modeled|conducted|examined|sampled)|this (?:study|paper|work)|a (?:survey|trial|cohort|case study|review|experiment) of|data (?:from|were)|participants|sample)/i;
const HEDGES = /\b(appears? to|seems? to|might|possibly|likely|presumably)\b/i;
const IMPLICATION_MARKERS = /\b(suggest|suggests|imply|implies|indicate|indicates|should|may|can|points? to|support|supports|demonstrate|demonstrates)\b/i;
const CITATION = /(\([A-Z][A-Za-z-]+(?:\s+et al\.)?,?\s+\d{4}\)|\bet al\b)/;

export function buildScientificAbstract(
  input: Record<string, string>,
  options: ScientificAbstractOptions = {},
): ScientificAbstractDraft {
  const range = {
    min: options.min ?? DEFAULT_SCIENTIFIC_RANGE.min,
    max: options.max ?? DEFAULT_SCIENTIFIC_RANGE.max,
  };
  const maxAcronyms = options.maxAcronyms ?? 3;

  const parts: ScientificAbstractPart[] = ABSTRACT_ROLES.map((role) => {
    const text = clean(input[role.id] ?? "");
    return { id: role.id, label: role.label, text, words: words(text).length };
  });
  const byId = new Map(parts.map((part) => [part.id, part]));
  const checks: RoleCheck[] = [];

  for (const part of parts) {
    if (!part.text) {
      checks.push({
        id: `missing-${part.id}`,
        role: part.label,
        message: `${part.label} is empty; an abstract is read as a whole and a missing role is noticed immediately.`,
        level: "warn",
      });
    }
  }

  const gap = byId.get("gap");
  if (gap?.text && !GAP_MARKERS.test(gap.text)) {
    checks.push({
      id: "gap-unmarked",
      role: "Gap",
      message: "The gap sentence does not state what is not yet known; markers such as remains unclear or has not been examined make the gap explicit.",
      level: "warn",
    });
  }

  const approach = byId.get("approach");
  if (approach?.text && !APPROACH_MARKERS.test(approach.text)) {
    checks.push({
      id: "approach-unmarked",
      role: "Approach",
      message: "The approach sentence names no design or sample; a reader needs to know what kind of study produced the figures.",
      level: "warn",
    });
  }

  const results = byId.get("results");
  if (results?.text) {
    if (!/\d/.test(results.text)) {
      checks.push({
        id: "results-no-figures",
        role: "Key results",
        message: "The results sentence carries no figure; without a number a reader has nothing to weigh.",
        level: "warn",
      });
    }
    if (HEDGES.test(results.text)) {
      checks.push({
        id: "results-hedged",
        role: "Key results",
        message: "Hedging words appear in the results; the finding should be stated plainly and the caution moved to the implication.",
        level: "info",
      });
    }
  }

  const implication = byId.get("implication");
  if (implication?.text && !IMPLICATION_MARKERS.test(implication.text)) {
    checks.push({
      id: "implication-unmarked",
      role: "Implication",
      message: "The implication sentence draws no consequence; verbs such as suggest, indicate or should make the conclusion visible.",
      level: "warn",
    });
  }

  const joined = parts
    .filter((part) => part.text)
    .map((part) => part.text)
    .join(" ");
  if (CITATION.test(joined)) {
    checks.push({
      id: "citations",
      role: "All roles",
      message: "A citation appears in the abstract; abstracts are read apart from the reference list and usually carry none.",
      level: "warn",
    });
  }

  const acronyms = [
    ...new Set(
      words(joined).filter((word) => /^[A-Z]{2,6}$/.test(word.replace(/[^A-Za-z]/g, ""))),
    ),
  ];
  if (acronyms.length > maxAcronyms) {
    checks.push({
      id: "acronyms",
      role: "All roles",
      message: `${acronyms.length} acronyms appear (${acronyms.join(", ")}); a reader outside the subfield will have to decode them.`,
      level: "info",
    });
  }

  const total = parts.reduce((sum, part) => sum + part.words, 0);
  if (total === 0) {
    checks.push({
      id: "empty",
      role: "All roles",
      message: "Fill the context and approach roles to see an abstract take shape.",
      level: "info",
    });
  } else if (total < range.min || total > range.max) {
    checks.push({
      id: "band",
      role: "All roles",
      message: `${total} words is outside the usual ${range.min}-${range.max} band for a scientific abstract.`,
      level: "warn",
    });
  }

  const output = parts
    .filter((part) => part.text)
    .map((part) => `${part.label}: ${part.text}`)
    .join("\n");

  return { output, continuous: joined, parts, words: total, checks, range };
}
