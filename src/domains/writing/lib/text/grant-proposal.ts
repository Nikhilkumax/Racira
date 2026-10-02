/**
 * Grant proposal outline: three published frameworks, each with its own
 * sections and prompts, assembled into an outline with the mandate's weak spots
 * named.
 *
 * The frameworks exist because funders organise their calls differently. A
 * significance-and-innovation structure suits a scientific call, a
 * need-and-evaluation structure suits a programme grant, and a generic outline
 * covers everything else. Choosing one changes the sections and the prompts;
 * the checks stay the same, because the same things sink a proposal in any
 * framework: objectives that cannot be measured, no evaluation plan, no
 * timeline, no budget justification, and a total past the stated limit.
 */
import { words } from "./tokenize.ts";

export interface GrantSectionSpec {
  id: string;
  label: string;
  prompt: string;
}

export interface GrantFramework {
  id: string;
  label: string;
  sections: GrantSectionSpec[];
}

/** The three published frameworks. */
export const GRANT_FRAMEWORKS: readonly GrantFramework[] = [
  {
    id: "significance",
    label: "Significance, Innovation, Approach",
    sections: [
      { id: "significance", label: "Significance", prompt: "Why this problem matters, and to whom." },
      { id: "innovation", label: "Innovation", prompt: "What is new about the approach, stated against what exists." },
      { id: "approach", label: "Approach", prompt: "The plan of work, with the riskiest step named." },
      { id: "evaluation", label: "Evaluation", prompt: "How success will be measured and by when." },
      { id: "budget", label: "Budget justification", prompt: "What each cost buys, in the order it is needed." },
    ],
  },
  {
    id: "objectives",
    label: "Need, Objectives, Methods, Evaluation",
    sections: [
      { id: "need", label: "Need", prompt: "The evidence that the problem exists and is worth funding." },
      { id: "objectives", label: "Objectives", prompt: "Three to five measurable objectives, each with a number." },
      { id: "methods", label: "Methods", prompt: "What will be done, by whom, and in what order." },
      { id: "timeline", label: "Timeline", prompt: "Milestones with dates, including the reporting points." },
      { id: "evaluation", label: "Evaluation", prompt: "The measures, the targets and who collects them." },
      { id: "budget", label: "Budget justification", prompt: "Costs tied to activities rather than to categories." },
    ],
  },
  {
    id: "generic",
    label: "Generic proposal outline",
    sections: [
      { id: "summary", label: "Summary", prompt: "The ask in one paragraph, with the amount and the duration." },
      { id: "problem", label: "Problem", prompt: "The problem, its scale and the gap in current provision." },
      { id: "plan", label: "Plan", prompt: "The activities, the partners and the sequence." },
      { id: "outcomes", label: "Outcomes", prompt: "What changes, for whom, and how it will be shown." },
      { id: "risks", label: "Risks", prompt: "What could stop the work and what you will do about it." },
      { id: "budget", label: "Budget", prompt: "The total, the main lines and what a cut would remove." },
    ],
  },
];

/** Default ceiling for the narrative, in words. */
export const DEFAULT_GRANT_LIMIT = 2500;

const MEASURABLE = /\d|(increase|reduce|improve|establish|develop|test|measure|compare|deliver|train|publish|recruit|complete)/i;
const TIMELINE = /\b(month|quarter|week|year|by \w+ \d{4}|20\d{2}|q[1-4])\b/i;

export interface GrantSection {
  id: string;
  label: string;
  prompt: string;
  text: string;
  words: number;
}

export interface GrantPlan {
  output: string;
  sections: GrantSection[];
  words: number;
  framework: string;
  limit: number;
  checks: { id: string; message: string }[];
}

export interface GrantOptions {
  framework?: string;
  limit?: number;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Assemble the chosen framework and check the proposal's load-bearing parts. */
export function planGrantProposal(
  input: Record<string, string>,
  options: GrantOptions = {},
): GrantPlan {
  const framework =
    GRANT_FRAMEWORKS.find((entry) => entry.id === options.framework) ?? GRANT_FRAMEWORKS[0];
  const limit = options.limit && options.limit > 0 ? options.limit : DEFAULT_GRANT_LIMIT;

  const sections: GrantSection[] = framework.sections.map((spec) => {
    const text = clean(input[spec.id] ?? "");
    return { id: spec.id, label: spec.label, prompt: spec.prompt, text, words: words(text).length };
  });
  const byId = new Map(sections.map((section) => [section.id, section]));
  const checks: { id: string; message: string }[] = [];

  for (const section of sections) {
    if (!section.text) {
      checks.push({
        id: `missing-${section.id}`,
        message: `${section.label} is empty. ${section.prompt}`,
      });
    }
  }

  const objectives = byId.get("objectives");
  // Counted from the raw input: the cleaned copy has its line breaks collapsed,
  // and each objective is normally written on its own line.
  const rawObjectives = (input.objectives ?? "").trim();
  if (objectives?.text) {
    const objectiveCount = rawObjectives
      .split(/\n|;\s*|\d[.)]\s+/)
      .filter((part) => part.trim().length > 0).length;
    if (!MEASURABLE.test(objectives.text)) {
      checks.push({
        id: "objectives-unmeasurable",
        message: "The objectives contain no number and no measurable verb; an objective a reviewer cannot measure is a wish.",
      });
    }
    if (objectiveCount > 5) {
      checks.push({
        id: "objectives-many",
        message: `${objectiveCount} objectives is more than a reviewer can hold; three to five is the working range.`,
      });
    }
  }

  const timeline = byId.get("timeline");
  const hasTimelineSection = sections.some((section) => section.id === "timeline");
  if (hasTimelineSection && timeline?.text && !TIMELINE.test(timeline.text)) {
    checks.push({
      id: "timeline-undated",
      message: "The timeline carries no dates or periods; milestones need a month, a quarter or a year.",
    });
  }

  const total = sections.reduce((sum, section) => sum + section.words, 0);
  if (total > limit) {
    checks.push({
      id: "over-limit",
      message: `${total} words against a limit of ${limit}; reviewers stop reading before the budget justification.`,
    });
  }
  if (total > 0 && total < limit * 0.35) {
    checks.push({
      id: "under-limit",
      message: `${total} words is well under the ${limit}-word limit; most calls expect the narrative to use the space it is given.`,
    });
  }

  const output = [
    `${framework.label} — ${total} of ${limit} words`,
    "",
    ...sections.map((section) =>
      [`${section.label}`, section.text ? section.text : `(to write) ${section.prompt}`].join("\n"),
    ),
  ].join("\n\n");

  return { output, sections, words: total, framework: framework.label, limit, checks };
}
