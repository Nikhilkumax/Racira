/**
 * RFP response builder: a numbered compliance matrix over the client's
 * requirements, plus the five response sections every proposal is read for.
 *
 * A response is won or lost on the matrix. Evaluators score requirement by
 * requirement, so a requirement with no answer is not a gap in prose, it is a
 * lost point — and the matrix makes every gap visible before submission rather
 * than after. The five sections (understanding, approach, team, past
 * performance, pricing) are the ones evaluators most often find empty, so each
 * gets its own check with the prompt it needs.
 *
 * The builder does not write the answers. It numbers the requirements, pairs
 * each with the answer you wrote, and reports the deadline, the gaps and the
 * duplicate requirement wording that makes a matrix look padded.
 */
import { words } from "./tokenize.ts";

export interface RfpRequirement {
  id: string;
  requirement: string;
  answer: string;
  answered: boolean;
}

export interface RfpResponse {
  requirements: RfpRequirement[];
  matrix: string;
  response: string;
  counts: { total: number; answered: number; gaps: number };
  deadlinePassed: boolean;
  checks: string[];
}

export interface RfpInput {
  rfp?: string;
  deadline?: string;
  requirements?: string;
  understanding?: string;
  approach?: string;
  team?: string;
  past?: string;
  pricing?: string;
}

const SECTIONS: readonly { id: keyof RfpInput; label: string; prompt: string }[] = [
  { id: "understanding", label: "Understanding of the need", prompt: "Restate the client's problem in their own terms, with the outcome they named." },
  { id: "approach", label: "Approach", prompt: "What you will do, in what order, and what the client sees at each stage." },
  { id: "team", label: "Team", prompt: "Who does the work, and what each person has done that is like this." },
  { id: "past", label: "Past performance", prompt: "Two or three comparable engagements, with the result and a reference." },
  { id: "pricing", label: "Pricing", prompt: "The price, what it includes, and what would change it." },
];

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Build the matrix from the requirement lines and check the response. */
export function buildRfpResponse(input: RfpInput = {}, options: { today?: string } = {}): RfpResponse {
  const rfp = clean(input.rfp ?? "");
  const deadline = clean(input.deadline ?? "");

  const requirementLines = (input.requirements ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const requirements: RfpRequirement[] = requirementLines.map((line, index) => {
    const [requirement = "", answer = ""] = line.split(/\s*\|\s*/);
    return {
      id: `R${index + 1}`,
      requirement: requirement.trim(),
      answer: answer.trim(),
      answered: answer.trim().length > 0,
    };
  });

  const matrix = requirements
    .map((entry) =>
      entry.answered
        ? `${entry.id}. ${entry.requirement} — ANSWERED: ${entry.answer}`
        : `${entry.id}. ${entry.requirement} — GAP: no answer written`,
    )
    .join("\n");

  const response = SECTIONS.map((section) => {
    const text = clean(input[section.id] ?? "");
    return `${section.label}\n${text || `(to write) ${section.prompt}`}`;
  }).join("\n\n");

  const gaps = requirements.filter((entry) => !entry.answered);
  const counts = { total: requirements.length, answered: requirements.length - gaps.length, gaps: gaps.length };

  let deadlinePassed = false;
  if (deadline) {
    const parsed = new Date(deadline);
    const today = options.today ? new Date(options.today) : new Date();
    if (!Number.isNaN(parsed.getTime()) && !Number.isNaN(today.getTime())) {
      deadlinePassed = parsed.getTime() < today.getTime();
    }
  }

  const checks: string[] = [];
  if (requirements.length === 0) {
    checks.push("No requirements listed. Paste one per line as requirement | where it is answered.");
  }
  if (gaps.length > 0) {
    const named = gaps.slice(0, 5).map((entry) => entry.id).join(", ");
    checks.push(
      `${gaps.length} requirement${gaps.length === 1 ? " has" : "s have"} no answer (${named}${gaps.length > 5 ? ", …" : ""}); every gap is a point an evaluator cannot award.`,
    );
  }
  if (!rfp) checks.push("No RFP name; name the call so the file can be found at review time.");
  if (!deadline) {
    checks.push("No deadline; submissions are lost to dates more often than to quality.");
  } else if (deadlinePassed) {
    checks.push(`The deadline (${deadline}) has passed.`);
  }
  const duplicate = requirements
    .map((entry) => entry.requirement.toLowerCase())
    .filter((text, index, all) => text.length > 0 && all.indexOf(text) !== index);
  if (duplicate.length > 0) {
    checks.push(`Duplicate requirement wording (${[...new Set(duplicate)].join(", ")}); merge the pair or the matrix looks padded.`);
  }
  for (const section of SECTIONS) {
    if (!clean(input[section.id] ?? "")) {
      checks.push(`${section.label} is empty. ${section.prompt}`);
    }
  }

  return { requirements, matrix, response, counts, deadlinePassed, checks };
}

/** Word count helper shared by the response sections. */
export function responseWords(input: RfpInput): number {
  return SECTIONS.reduce((sum, section) => sum + words(clean(input[section.id] ?? "")).length, 0);
}
