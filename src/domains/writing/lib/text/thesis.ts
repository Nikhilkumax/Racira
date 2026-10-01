/**
 * Thesis statement builder: assemble a thesis from its parts — a topic, a
 * position and the reasons behind it — and check the result for the habits that
 * make a thesis weak: hedges that remove the claim, vague words, and a length
 * that has turned the sentence into a paragraph.
 */

export interface ThesisParts {
  topic: string;
  position: string;
  reasons: string[];
}

export interface ThesisCheck {
  id: string;
  note: string;
}

/** Join the parts into a single thesis sentence. */
export function buildThesis(parts: ThesisParts): string {
  const topic = parts.topic.trim().replace(/[.]+$/, "");
  const position = parts.position.trim().replace(/[.]+$/, "");
  const reasons = parts.reasons.map((reason) => reason.trim().replace(/[.]+$/, "")).filter(Boolean);
  if (!topic && !position) return "";
  const lead = topic ? `${topic[0].toLocaleUpperCase()}${topic.slice(1)}` : "";
  const claim = [lead, position].filter(Boolean).join(" ").trim();
  if (reasons.length === 0) return `${claim}.`;
  const joined =
    reasons.length === 1
      ? reasons[0]
      : reasons.length === 2
        ? `${reasons[0]} and ${reasons[1]}`
        : `${reasons.slice(0, -1).join(", ")}, and ${reasons[reasons.length - 1]}`;
  return `${claim} because ${joined}.`;
}

const HEDGES = [/\bi think\b/i, /\bi believe\b/i, /\bin my opinion\b/i, /\bmaybe\b/i, /\bperhaps\b/i, /\bkind of\b/i, /\bsort of\b/i];
const VAGUE = [/\bthings\b/i, /\bstuff\b/i, /\bsociety\b/i, /\bpeople\b/i, /\binteresting\b/i, /\bimportant\b/i, /\bgood\b/i, /\bbad\b/i];

/** Prompts about the thesis' shape, not its truth. */
export function thesisChecks(parts: ThesisParts, thesis = buildThesis(parts)): ThesisCheck[] {
  const checks: ThesisCheck[] = [];
  if (!parts.topic.trim() || !parts.position.trim()) {
    checks.push({ id: "incomplete", note: "A thesis needs both a topic and a position; one of them is empty." });
  }
  if (parts.reasons.filter((reason) => reason.trim()).length === 0) {
    checks.push({ id: "no-reasons", note: "No reasons given: a thesis is stronger when it says why the claim is true." });
  }
  const hedge = HEDGES.find((pattern) => pattern.test(thesis));
  if (hedge) checks.push({ id: "hedge", note: `A hedge ("${thesis.match(hedge)?.[0]}") softens the claim; state it and defend it.` });
  const vague = VAGUE.find((pattern) => pattern.test(thesis));
  if (vague) checks.push({ id: "vague", note: `A vague word ("${thesis.match(vague)?.[0]}") could mean anything; be specific.` });
  const words = thesis.split(/\s+/).filter(Boolean).length;
  if (words > 40) checks.push({ id: "length", note: `The thesis runs ${words} words: if it needs more than one sentence, it is probably two claims.` });
  if (words > 0 && words < 6) checks.push({ id: "short", note: "The thesis is very short; add the position or a reason." });
  return checks;
}

/** A copyable report: the thesis and the checks. */
export function thesisReport(parts: ThesisParts): string {
  const thesis = buildThesis(parts);
  const checks = thesisChecks(parts, thesis);
  return [
    "Thesis statement",
    "",
    thesis || "(fill in a topic and a position)",
    "",
    checks.length > 0 ? `Prompts:\n${checks.map((check) => `- ${check.note}`).join("\n")}` : "No mechanical issues found.",
  ].join("\n");
}
