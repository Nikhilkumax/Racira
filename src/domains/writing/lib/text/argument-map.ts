/**
 * Argument mapping: lay an argument out as a claim, the reasons that support it,
 * and for each reason the evidence behind it and the warrant that connects the
 * evidence to the claim. The oldest way to find a hole in an argument is to
 * write out its unstated step, which is what the warrant field is for.
 *
 * The checks are structural: a reason with no evidence is an assertion, a
 * warrant missing where the leap is large is an unstated step, and no objection
 * usually means the strongest counter has not been considered.
 */

export interface ArgumentReason {
  reason: string;
  evidence?: string;
  warrant?: string;
}

export interface ArgumentMap {
  claim: string;
  reasons: ArgumentReason[];
  objection?: string;
  rebuttal?: string;
}

export interface ArgumentCompleteness {
  filled: number;
  total: number;
  percent: number;
  reasons: number;
  evidenced: number;
  warranted: number;
}

const MIN_REASONS = 2;

/** How complete the map is; reasons count toward a small minimum. */
export function argumentCompleteness(map: ArgumentMap): ArgumentCompleteness {
  const reasons = (map.reasons ?? []).filter((reason) => reason.reason.trim().length > 0);
  const evidenced = reasons.filter((reason) => (reason.evidence ?? "").trim().length > 0).length;
  const warranted = reasons.filter((reason) => (reason.warrant ?? "").trim().length > 0).length;
  const filled =
    (map.claim.trim() ? 1 : 0) +
    (map.objection?.trim() ? 1 : 0) +
    (map.rebuttal?.trim() ? 1 : 0) +
    Math.min(reasons.length, MIN_REASONS);
  const total = 3 + MIN_REASONS;
  return { filled, total, percent: Math.round((filled / total) * 100), reasons: reasons.length, evidenced, warranted };
}

/** Structural prompts about the argument. */
export function argumentChecks(map: ArgumentMap): string[] {
  const notes: string[] = [];
  const reasons = (map.reasons ?? []).filter((reason) => reason.reason.trim().length > 0);
  if (reasons.length < MIN_REASONS) notes.push(`Only ${reasons.length} reason(s): a claim usually needs at least ${MIN_REASONS} to stand on.`);
  const unevidenced = reasons.filter((reason) => !(reason.evidence ?? "").trim()).length;
  if (unevidenced > 0) notes.push(`${unevidenced} reason(s) have no evidence: an unsupported reason is an assertion, not support.`);
  const unwarranted = reasons.filter((reason) => !(reason.warrant ?? "").trim()).length;
  if (unwarranted > 0) notes.push(`${unwarranted} reason(s) have no warrant: say why the evidence supports the claim, not just that it does.`);
  if (!map.objection?.trim()) notes.push("No objection named: the strongest counterargument is worth stating and answering.");
  if (map.objection?.trim() && !map.rebuttal?.trim()) notes.push("An objection is named but not answered; add the rebuttal.");
  return notes;
}

/** The argument as a markdown document. */
export function argumentMarkdown(map: ArgumentMap): string {
  const lines = [`# Claim`, "", map.claim.trim() || "_not stated_", "", "## Reasons"];
  const reasons = (map.reasons ?? []).filter((reason) => reason.reason.trim().length > 0);
  if (reasons.length === 0) lines.push("_none yet_");
  reasons.forEach((reason, index) => {
    lines.push("", `### Reason ${index + 1}`, reason.reason.trim());
    lines.push(`- Evidence: ${(reason.evidence ?? "").trim() || "_none_"}`);
    lines.push(`- Warrant: ${(reason.warrant ?? "").trim() || "_none_"}`);
  });
  lines.push("", "## Objection", "", map.objection?.trim() || "_none named_");
  lines.push("", "## Rebuttal", "", map.rebuttal?.trim() || "_none_");
  return lines.join("\n");
}

/** A copyable report: the map, the score and the checks. */
export function argumentReport(map: ArgumentMap): string {
  const completeness = argumentCompleteness(map);
  const checks = argumentChecks(map);
  return [
    `Argument — ${completeness.reasons} reason(s), ${completeness.evidenced} with evidence, ${completeness.warranted} with a warrant`,
    `Filled: ${completeness.filled}/${completeness.total} (${completeness.percent}%)`,
    checks.length > 0 ? `\nPrompts:\n${checks.map((check) => `- ${check}`).join("\n")}` : "",
    "",
    argumentMarkdown(map),
  ]
    .filter((part) => part !== "")
    .join("\n");
}
