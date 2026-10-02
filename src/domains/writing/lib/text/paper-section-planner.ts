/**
 * Academic paper section planner: a word budget split across the five standard
 * sections, with the required elements of each and the gaps in the plan named.
 *
 * The shares are published proportions rather than a guess: an introduction is
 * roughly a seventh of a paper, methods a fifth, results and discussion a third
 * each, and a conclusion a twentieth. Multiplying a total by those shares gives
 * a target for each section before a word is written, which is the cheapest way
 * to notice that a planned discussion cannot fit the findings it has to explain.
 *
 * The planner also keeps the three things a paper plan must state — the
 * question, the method and the contribution — and flags the shares that have
 * drifted, since a methods section at five per cent of a paper cannot describe
 * a study anyone could repeat.
 */
import { words } from "./tokenize.ts";

export interface SectionSpec {
  id: string;
  label: string;
  purpose: string;
  /** Share of the total word budget. */
  share: number;
  elements: string[];
}

/** The five standard sections, in order, with their shares of the budget. */
export const PAPER_SECTIONS: readonly SectionSpec[] = [
  {
    id: "introduction",
    label: "Introduction",
    purpose: "Establish the context, state the gap and name the question this paper answers.",
    share: 0.15,
    elements: ["context", "gap in the literature", "research question", "contribution"],
  },
  {
    id: "methods",
    label: "Methods",
    purpose: "Describe what was done well enough that another researcher could repeat it.",
    share: 0.2,
    elements: ["design", "sample and setting", "materials or instruments", "analysis plan"],
  },
  {
    id: "results",
    label: "Results",
    purpose: "Report the findings with their figures and their uncertainty, without interpretation.",
    share: 0.3,
    elements: ["main finding", "secondary findings", "figures and tables", "uncertainty and exclusions"],
  },
  {
    id: "discussion",
    label: "Discussion",
    purpose: "Interpret the findings, compare them with prior work and state the limitations.",
    share: 0.3,
    elements: ["interpretation", "comparison with prior work", "limitations", "implications"],
  },
  {
    id: "conclusion",
    label: "Conclusion",
    purpose: "Answer the question in one paragraph and name the next step.",
    share: 0.05,
    elements: ["direct answer", "significance", "next steps"],
  },
];

/** Typical total for a research article in words. */
export const DEFAULT_PAPER_TOTAL = 6000;

export interface PaperPlanInput {
  question?: string;
  method?: string;
  contribution?: string;
  total?: number;
}

export interface SectionPlan {
  id: string;
  label: string;
  purpose: string;
  targetWords: number;
  elements: string[];
  note: string | null;
}

export interface PaperPlan {
  sections: SectionPlan[];
  total: number;
  checks: string[];
  outline: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Split the word budget and check the plan's three load-bearing statements. */
export function planPaperSections(input: PaperPlanInput = {}): PaperPlan {
  const total = Math.round(input.total && input.total > 0 ? input.total : DEFAULT_PAPER_TOTAL);
  const question = clean(input.question ?? "");
  const method = clean(input.method ?? "");
  const contribution = clean(input.contribution ?? "");

  const sections: SectionPlan[] = PAPER_SECTIONS.map((spec) => {
    const targetWords = Math.round(total * spec.share);
    let note: string | null = null;
    if (spec.id === "methods" && targetWords < 400) {
      note = `${targetWords} words of methods is thin for a repeatable study at this total.`;
    }
    if (spec.id === "introduction" && targetWords > total * 0.25) {
      note = "An introduction past a quarter of the paper has become a literature review.";
    }
    if (spec.id === "results" && targetWords < 300) {
      note = "Under 300 words of results rarely carries figures and uncertainty together.";
    }
    return { id: spec.id, label: spec.label, purpose: spec.purpose, targetWords, elements: spec.elements, note };
  });

  const checks: string[] = [];
  if (!question) {
    checks.push("No research question: a paper plan starts from the question the study answers.");
  } else if (words(question).length > 40) {
    checks.push(`The question runs ${words(question).length} words; a research question should fit in a sentence.`);
  }
  if (!method) checks.push("No method: state the design in a line so the methods budget has something to describe.");
  if (!contribution) checks.push("No contribution: say what the paper adds that the literature did not have.");
  if (total < 3000) checks.push(`${total} words is short for a research article; sections may be squeezed.`);
  if (total > 12000) checks.push(`${total} words is long; check the venue's limit before splitting it across sections.`);

  const outline = [
    question ? `Question: ${question}` : "Question: (not stated)",
    method ? `Method: ${method}` : "Method: (not stated)",
    contribution ? `Contribution: ${contribution}` : "Contribution: (not stated)",
    `Budget: ${total} words`,
    "",
    ...sections.map((section) =>
      [
        `${section.label} — about ${section.targetWords} words`,
        `  Purpose: ${section.purpose}`,
        `  Elements: ${section.elements.join(", ")}`,
        section.note ? `  Note: ${section.note}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].join("\n");

  return { sections, total, checks, outline };
}
