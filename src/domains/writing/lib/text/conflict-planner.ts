/**
 * Conflict and resolution planner: shape one story conflict as a structure —
 * who opposes whom, over what, at what cost — and track the turns that raise it
 * toward the resolution.
 *
 * The engine checks the shape rather than judging the idea: a conflict needs at
 * least three escalating turns, every turn needs to change the situation, and a
 * resolution without a cost is usually a collapse. The checks say so in those
 * terms, as prompts.
 */

export interface ConflictPlan {
  name: string;
  type?: string;
  parties?: string;
  stakes?: string;
  /** The turns, in order, that raise the conflict toward its resolution. */
  escalation?: string[];
  resolution?: string;
  cost?: string;
}

export const CONFLICT_TYPES = [
  "Person vs person",
  "Person vs self",
  "Person vs society",
  "Person vs nature",
  "Person vs fate",
  "Person vs technology",
];

export const MIN_TURNS = 3;

export interface ConflictCompleteness {
  filled: number;
  total: number;
  percent: number;
  turns: number;
  missing: string[];
}

const FIELDS: { key: keyof ConflictPlan; label: string }[] = [
  { key: "type", label: "Type" },
  { key: "parties", label: "Parties" },
  { key: "stakes", label: "Stakes" },
  { key: "resolution", label: "Resolution" },
  { key: "cost", label: "Cost" },
];

/** How complete the plan is, counting the escalation turns separately. */
export function conflictCompleteness(plan: ConflictPlan): ConflictCompleteness {
  const missing: string[] = [];
  let filled = 0;
  for (const field of FIELDS) {
    if ((plan[field.key] ?? "").toString().trim()) filled += 1;
    else missing.push(field.label);
  }
  const turns = (plan.escalation ?? []).filter((turn) => turn.trim().length > 0).length;
  if (turns < MIN_TURNS) missing.push(`Escalation (needs ${MIN_TURNS} turns)`);
  filled += Math.min(turns, MIN_TURNS);
  const total = FIELDS.length + MIN_TURNS;
  return { filled, total, percent: Math.round((filled / total) * 100), turns, missing };
}

/** Mechanical prompts about the conflict's shape. */
export function escalationProblems(plan: ConflictPlan): string[] {
  const problems: string[] = [];
  const turns = (plan.escalation ?? []).map((turn) => turn.trim()).filter(Boolean);
  if (turns.length < MIN_TURNS) {
    problems.push(`Only ${turns.length} escalation turn(s): a conflict usually needs at least ${MIN_TURNS} to feel like it is rising.`);
  }
  const short = turns.filter((turn) => turn.split(/\s+/).filter(Boolean).length < 3).length;
  if (short > 0) problems.push(`${short} turn(s) are too short to describe a change; say what is different after each one.`);
  if (turns.length >= MIN_TURNS && new Set(turns.map((turn) => turn.toLowerCase())).size !== turns.length) {
    problems.push("Two turns say the same thing: each turn should change the situation, not repeat it.");
  }
  if (plan.resolution?.trim() && !plan.cost?.trim()) {
    problems.push("A resolution with no cost usually reads as a collapse; name what the resolution takes from someone.");
  }
  return problems;
}

/** The plan as a markdown document. */
export function conflictMarkdown(plan: ConflictPlan): string {
  const lines = [`# ${plan.name.trim() || "Unnamed conflict"}`];
  for (const field of FIELDS) {
    const value = (plan[field.key] ?? "").toString().trim();
    lines.push("", `## ${field.label}`, value || "_not decided yet_");
  }
  lines.push("", "## Escalation");
  const turns = (plan.escalation ?? []).map((turn) => turn.trim()).filter(Boolean);
  if (turns.length === 0) lines.push("_no turns yet_");
  else turns.forEach((turn, index) => lines.push(`${index + 1}. ${turn}`));
  return lines.join("\n");
}

/** A copyable report: the plan, the score and the shape checks. */
export function conflictReport(plan: ConflictPlan): string {
  const completeness = conflictCompleteness(plan);
  const problems = escalationProblems(plan);
  return [
    `${plan.name.trim() || "Unnamed conflict"} — ${completeness.filled}/${completeness.total} parts filled (${completeness.percent}%), ${completeness.turns} turns`,
    completeness.missing.length > 0 ? `Open: ${completeness.missing.join(", ")}` : "Every part decided.",
    problems.length > 0 ? `\nShape notes:\n${problems.map((problem) => `- ${problem}`).join("\n")}` : "",
    "",
    conflictMarkdown(plan),
  ]
    .filter((part) => part !== "")
    .join("\n");
}
