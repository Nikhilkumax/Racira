/**
 * Sales page builder: the nine blocks of a long-form sales page assembled from
 * the writer's own facts, with the published structural checks applied.
 *
 * Long-form sales copy has a settled order — promise, problem, mechanism,
 * benefits, proof, offer, guarantee, objections, close — and it is settled
 * because each block answers the question the previous one raises. A page that
 * opens with the product and never states the problem asks the reader to supply
 * the reason to care. A page with no mechanism claims a result without saying
 * how. A page with fewer than three objections answered leaves the common ones
 * to be argued in the reader's head, where the reader wins.
 *
 * The builder assembles your text in that order and checks the blocks a
 * skimmer reads: the promise, the proof with a number in it, the offer, the
 * guarantee and the close. It does not write the copy and cannot verify a
 * claim, and the page says so.
 */
import { words } from "./tokenize.ts";

export interface SalesSection {
  id: string;
  label: string;
  prompt: string;
  text: string;
}

export interface SalesDraft {
  sections: SalesSection[];
  output: string;
  checks: string[];
  stats: { words: number; benefits: number; objections: number; proofLines: number };
}

export interface SalesInput {
  product?: string;
  audience?: string;
  promise?: string;
  problem?: string;
  mechanism?: string;
  benefits?: string;
  proof?: string;
  offer?: string;
  guarantee?: string;
  objections?: string;
  cta?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  (value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Claiming words that need a fact beside them. */
export const SALES_CLAIM_WORDS: readonly string[] = [
  "revolutionary",
  "game-changing",
  "world-class",
  "best-in-class",
  "ultimate",
  "unbeatable",
  "effortless",
  "instant",
];

const isObjection = (line: string): boolean => /\|/.test(line);

/** Assemble the nine blocks and check the ones a skimmer reads. */
export function buildSalesPage(input: SalesInput = {}): SalesDraft {
  const product = clean(input.product ?? "");
  const audience = clean(input.audience ?? "");
  const promise = clean(input.promise ?? "");
  const problem = clean(input.problem ?? "");
  const mechanism = clean(input.mechanism ?? "");
  const benefits = lines(input.benefits ?? "");
  const proof = lines(input.proof ?? "");
  const offer = clean(input.offer ?? "");
  const guarantee = clean(input.guarantee ?? "");
  const objectionLines = lines(input.objections ?? "");
  const cta = clean(input.cta ?? "");

  const sections: SalesSection[] = [
    {
      id: "headline",
      label: "The promise",
      prompt: "One sentence: the outcome for the reader, in their words.",
      text: promise || `(${product || "the product"}${audience ? ` for ${audience}` : ""}: state the outcome in one sentence.)`,
    },
    {
      id: "problem",
      label: "The problem",
      prompt: "Describe the situation the reader is in before the product existed.",
      text: problem || "(describe the problem as the reader experiences it.)",
    },
    {
      id: "mechanism",
      label: "Why this works",
      prompt: "The mechanism: what it actually does that produces the outcome.",
      text: mechanism || "(explain the mechanism in plain words.)",
    },
    {
      id: "benefits",
      label: "What changes",
      prompt: "One benefit per line; three to five is the range a reader holds.",
      text: benefits.length > 0 ? benefits.map((item) => `- ${item}`).join("\n") : "(list the benefits, one per line.)",
    },
    {
      id: "proof",
      label: "Proof",
      prompt: "Results, reviews or numbers, one per line.",
      text: proof.length > 0 ? proof.map((item) => `- ${item}`).join("\n") : "(add proof, one per line, with at least one number.)",
    },
    {
      id: "offer",
      label: "The offer",
      prompt: "What the reader gets, at what price, and what is included.",
      text: offer || "(state the offer and the price.)",
    },
    {
      id: "guarantee",
      label: "The guarantee",
      prompt: "The risk reversal, with its terms.",
      text: guarantee || "(state the guarantee and its terms.)",
    },
    {
      id: "objections",
      label: "Objections, answered",
      prompt: "One per line as objection | answer; three is the working minimum.",
      text:
        objectionLines.length > 0
          ? objectionLines
              .map((line) => {
                const [objection = "", answer = ""] = line.split(/\s*\|\s*/);
                return answer.trim()
                  ? `- ${objection.trim()} — ${answer.trim()}`
                  : `- ${objection.trim()} — (answer not written)`;
              })
              .join("\n")
          : "(list the objections, one per line, with the answer after a pipe.)",
    },
    {
      id: "cta",
      label: "The close",
      prompt: "One action, stated once, with the next step in plain words.",
      text: cta || "(one action, with the next step.)",
    },
  ];

  const output = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");
  const all = sections.map((section) => section.text).join(" ");
  const unanswered = objectionLines.filter((line) => isObjection(line) && !line.split("|")[1]?.trim());

  const checks: string[] = [];
  if (!product) checks.push("No product named; the page has to say what it is selling.");
  if (!promise) checks.push("No promise; a skimmer reads one sentence and decides whether to keep going.");
  if (!problem) {
    checks.push("No problem stated: a page that opens with the product asks the reader to supply the reason to care.");
  }
  if (!mechanism) {
    checks.push("No mechanism: without one the page claims a result without saying how it happens, and the claim is unverifiable.");
  }
  if (benefits.length < 3) {
    checks.push(`${benefits.length} benefi${benefits.length === 1 ? "t is" : "ts are"} too few to hold a reader past the promise; three to five is the working range.`);
  }
  if (proof.length === 0) {
    checks.push("No proof: claims without evidence are discounted, however well written.");
  } else if (!proof.some((line) => /\d/.test(line))) {
    checks.push("No proof line carries a number; counted results are the ones a reader weighs.");
  }
  if (!offer) checks.push("No offer stated; the reader cannot decide without the price and what is included.");
  if (!guarantee) checks.push("No guarantee; a risk reversal answers the reader's last hesitation.");
  if (objectionLines.length < 3) {
    checks.push(`${objectionLines.length} objection${objectionLines.length === 1 ? "" : "s"} answered; the three common ones are price, effort and whether it works for their case.`);
  }
  if (unanswered.length > 0) {
    checks.push(`${unanswered.length} objection${unanswered.length === 1 ? "" : "s"} listed without an answer.`);
  }
  if (!cta) checks.push("No close: one action, stated once.");
  if (cta && words(cta).length > 12) {
    checks.push(`The close runs ${words(cta).length} words; a close is an instruction, not a paragraph.`);
  }

  const haystack = all.toLowerCase();
  const claims = [...new Set((haystack.match(new RegExp(`\\b(${SALES_CLAIM_WORDS.join("|")})\\b`, "g")) ?? []))];
  if (claims.length > 0 && !/\d/.test(all)) {
    checks.push(`Claiming words detected (${claims.join(", ")}) with no fact anywhere on the page; attach a number or drop the claim.`);
  }

  return {
    sections,
    output,
    checks,
    stats: { words: words(all).length, benefits: benefits.length, objections: objectionLines.length, proofLines: proof.length },
  };
}
