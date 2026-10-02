/**
 * Counterargument generator: claim-shape detection plus a library of published
 * challenge frames, ordered so the ones that answer the claim's own shape come
 * first.
 *
 * The generator does not invent objections. Each frame is one of the standard
 * moves in argumentation — boundary, counterexample, alternative cause,
 * mechanism, evidence-against, base rate, trade-off, timeline, measurement and
 * definition — and every frame is a question the writer answers, because an
 * objection the tool made up would not be the writer's to defend.
 *
 * The claim's shape decides emphasis. A causal claim ("because") is answered
 * first by an alternative cause and a mechanism question; a policy claim
 * ("should") by the trade-off and the boundary; a prediction by the timeline
 * and the base rate. Absolutes are surfaced because a single exception is
 * enough to break a claim written as "all" or "never".
 */
import { words } from "./tokenize.ts";

export type ClaimShape =
  | "policy"
  | "universal"
  | "predictive"
  | "causal"
  | "comparative"
  | "descriptive";

export const CLAIM_SHAPES: readonly { id: ClaimShape; label: string; hint: string }[] = [
  { id: "policy", label: "Policy", hint: "Claims that something should or must be done." },
  { id: "universal", label: "Universal", hint: "Claims about all cases, or none." },
  { id: "predictive", label: "Predictive", hint: "Claims about what will happen." },
  { id: "causal", label: "Causal", hint: "Claims that one thing causes another." },
  { id: "comparative", label: "Comparative", hint: "Claims that one thing is more or less than another." },
  { id: "descriptive", label: "Descriptive", hint: "A claim about how things are, with no marked shape." },
];

export interface CounterFrame {
  id: string;
  label: string;
  prompt: string;
  /** Shapes this frame is tailored to; it is featured for those claims. */
  appliesTo: ClaimShape[];
}

/** The ten standard challenge moves. `{claim}` is replaced with the claim. */
export const COUNTER_FRAMES: readonly CounterFrame[] = [
  {
    id: "boundary",
    label: "Boundary",
    prompt: "Where does “{claim}” stop being true — which group, period or setting sits outside it?",
    appliesTo: ["universal", "policy", "descriptive"],
  },
  {
    id: "counterexample",
    label: "Counterexample",
    prompt: "Name a case where the opposite holds. If no such case can exist, say why the claim cannot be tested.",
    appliesTo: ["universal", "descriptive"],
  },
  {
    id: "alternative-cause",
    label: "Alternative cause",
    prompt: "What else changed at the same time as the claimed cause, and would the effect survive if that alternative were held fixed?",
    appliesTo: ["causal"],
  },
  {
    id: "mechanism",
    label: "Mechanism",
    prompt: "Through what mechanism is the effect supposed to work — and does it still appear when that mechanism is absent?",
    appliesTo: ["causal", "predictive"],
  },
  {
    id: "evidence-against",
    label: "Evidence against",
    prompt: "What evidence would show “{claim}” is false, and has anyone looked for it?",
    appliesTo: ["descriptive", "universal"],
  },
  {
    id: "base-rate",
    label: "Base rate",
    prompt: "What usually happens in cases like this, and does the claim beat that base rate or merely restate it?",
    appliesTo: ["predictive", "comparative"],
  },
  {
    id: "trade-off",
    label: "Trade-off",
    prompt: "Even if the claim is right, what does acting on it cost, and who bears that cost?",
    appliesTo: ["policy"],
  },
  {
    id: "timeline",
    label: "Timeline",
    prompt: "Was this true a decade ago, and what would have to change for it to stop being true next decade?",
    appliesTo: ["predictive", "policy"],
  },
  {
    id: "measurement",
    label: "Measurement",
    prompt: "If the key term were measured differently, would the claim still hold? Show which measure the claim depends on.",
    appliesTo: ["comparative", "descriptive"],
  },
  {
    id: "definition",
    label: "Definition",
    prompt: "Which word in the claim is doing the most work? Define it precisely and see whether the claim survives the definition.",
    appliesTo: ["universal", "policy"],
  },
];

const SHAPE_PATTERNS: readonly { id: ClaimShape; pattern: RegExp }[] = [
  { id: "policy", pattern: /\b(should|must|ought to|need(?:s)? to|has to|have to)\b/i },
  { id: "universal", pattern: /\b(all|every|everyone|everything|always|never|no one|nobody|none)\b/i },
  { id: "predictive", pattern: /\b(will|won't|would|going to|is likely to|are likely to|predict)\b/i },
  { id: "causal", pattern: /\b(because|causes?|caused|leads? to|led to|results? in|due to|drives?|explains?)\b/i },
  { id: "comparative", pattern: /\b(more|less|better|worse|faster|slower|higher|lower|greater|fewer)\b[\s\S]*\bthan\b/i },
];

const ABSOLUTES = /\b(all|every|everyone|everything|always|never|no one|nobody|none|only|impossible)\b/gi;
const VAGUE = /\b(many|most|some|often|usually|significant|substantial|a lot|several|few|rarely)\b/gi;
const REASON = /\b(because|since|so that|therefore|as a result|due to|in order to|which is why)\b/i;

export interface CounterargumentPlan {
  claim: string;
  shape: ClaimShape;
  shapeLabel: string;
  absolutes: string[];
  vague: string[];
  frames: { id: string; label: string; prompt: string; featured: boolean }[];
  checks: string[];
  checklist: string[];
}

/** Fixed discipline for writing out any objection, independent of the claim. */
export const COUNTER_CHECKLIST: readonly string[] = [
  "State the claim you are answering in one sentence, in its strongest form, before objecting.",
  "Name the condition under which your objection holds; an objection with no conditions is an opinion.",
  "Say what evidence would make you withdraw the objection — if nothing would, it is not an argument.",
  "Answer the strongest version, not the weakest wording, and say so when the claim's wording is the whole problem.",
];

/** Detect the claim's shape, then order the frames for it. */
export function buildCounterarguments(claim: string, options: { limit?: number } = {}): CounterargumentPlan {
  const cleanClaim = claim.trim().replace(/\s+/g, " ");
  const shape = SHAPE_PATTERNS.find((entry) => entry.pattern.test(cleanClaim))?.id ?? "descriptive";
  const shapeLabel = CLAIM_SHAPES.find((entry) => entry.id === shape)?.label ?? "Descriptive";

  const absolutes = [...new Set((cleanClaim.match(ABSOLUTES) ?? []).map((match) => match.toLowerCase()))];
  const vague = [...new Set((cleanClaim.match(VAGUE) ?? []).map((match) => match.toLowerCase()))];

  const frames = COUNTER_FRAMES.map((frame) => ({
    id: frame.id,
    label: frame.label,
    prompt: frame.prompt.replaceAll("{claim}", cleanClaim || "this claim"),
    featured: frame.appliesTo.includes(shape),
  })).sort((a, b) => Number(b.featured) - Number(a.featured));

  const limited = options.limit && options.limit > 0 ? frames.slice(0, options.limit) : frames;

  const checks: string[] = [];
  if (!cleanClaim) {
    checks.push("Write the claim you want to challenge; the frames below stay generic until there is a claim to answer.");
  }
  const count = words(cleanClaim).length;
  if (cleanClaim && count < 6) {
    checks.push(`The claim is ${count} words; a claim under six words rarely says enough to challenge. Write it as a full sentence.`);
  }
  if (absolutes.length > 0) {
    checks.push(
      `Absolute wording detected (${absolutes.join(", ")}): a single exception refutes the claim as written, so a challenger will go straight for it.`,
    );
  }
  if (vague.length > 0) {
    checks.push(
      `Unquantified wording detected (${vague.join(", ")}): say how many, how often or how much, or the claim cannot be weighed.`,
    );
  }
  if (cleanClaim && !REASON.test(cleanClaim)) {
    checks.push("The claim gives no reason. A counterargument has nothing to aim at until the claim says why it is supposed to be true.");
  }

  return {
    claim: cleanClaim,
    shape,
    shapeLabel,
    absolutes,
    vague,
    frames: limited,
    checks,
    checklist: [...COUNTER_CHECKLIST],
  };
}
