/**
 * Product description writer: a description assembled from the product's own
 * facts in the order a shopper reads — hook, what it is, benefits, specs,
 * proof, offer and one call to action.
 *
 * The checks are the commercial ones. A feature that names no benefit leaves
 * the shopper to do the translation; a description with no proof line carries
 * only the seller's word; a hook past a breath loses the scan; and claiming
 * words such as premium or best-in-class used without a fact beside them are
 * the words shoppers have learned to discount. The price is checked because a
 * description that hides it sends the shopper elsewhere to find it.
 */
import { words } from "./tokenize.ts";

export interface ProductSection {
  id: string;
  label: string;
  text: string;
}

export interface ProductDescription {
  sections: ProductSection[];
  output: string;
  checkCount: number;
  checks: string[];
}

export interface ProductInput {
  name?: string;
  category?: string;
  audience?: string;
  features?: string;
  specs?: string;
  proof?: string;
  offer?: string;
  cta?: string;
}

/** Claiming adjectives that need a fact beside them. */
export const CLAIM_WORDS: readonly string[] = [
  "premium",
  "high-quality",
  "high quality",
  "best-in-class",
  "world-class",
  "revolutionary",
  "ultimate",
  "unbeatable",
  "amazing",
  "perfect",
];

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  (value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Assemble the description and check its load-bearing claims. */
export function buildProductDescription(input: ProductInput = {}): ProductDescription {
  const name = clean(input.name ?? "");
  const category = clean(input.category ?? "");
  const audience = clean(input.audience ?? "");
  const features = lines(input.features ?? "");
  const specs = lines(input.specs ?? "");
  const proof = lines(input.proof ?? "");
  const offer = clean(input.offer ?? "");
  const cta = clean(input.cta ?? "");

  const hook = name && category ? `${name} is ${category}${audience ? ` for ${audience}` : ""}.` : "";
  const paired = features.map((line) => {
    const [feature = "", benefit = ""] = line.split(/\s*\|\s*/);
    return { feature: feature.trim(), benefit: benefit.trim() };
  });

  const sections: ProductSection[] = [
    { id: "hook", label: "Hook", text: hook || "(one line: what it is, and who it is for.)" },
    {
      id: "what",
      label: "What it is",
      text: category ? [category, audience ? `Built for ${audience}.` : ""].filter(Boolean).join("\n") : "(name the category and the user.)",
    },
    {
      id: "benefits",
      label: "Benefits",
      text:
        paired.length > 0
          ? paired.map((pair) => `- ${pair.feature}${pair.benefit ? ` — ${pair.benefit}` : ""}`).join("\n")
          : "(one feature per line as feature | the benefit it produces.)",
    },
    { id: "specs", label: "Specs", text: specs.length > 0 ? specs.map((line) => `- ${line}`).join("\n") : "(measurements, materials, compatibility — one per line.)" },
    { id: "proof", label: "Proof", text: proof.length > 0 ? proof.map((line) => `- ${line}`).join("\n") : "(a review, a result, a guarantee, a number.)" },
    { id: "offer", label: "Offer", text: offer ? `Price and offer: ${offer}` : "(state the price and what it includes.)" },
    { id: "cta", label: "Call to action", text: cta || "(one action, with the button wording.)" },
  ];

  const output = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!name || !category) checks.push("The product has no name or category; the hook cannot be written without both.");
  if (!audience) checks.push("No audience named; a description for everyone is a description for no one.");
  if (paired.length < 3) checks.push(`${paired.length} benefit${paired.length === 1 ? "" : "s"} listed; three to five is the range a shopper will read.`);
  const unpaired = paired.filter((pair) => pair.feature && !pair.benefit);
  if (unpaired.length > 0) {
    checks.push(
      `${unpaired.length} feature${unpaired.length === 1 ? " names" : "s name"} no benefit (${unpaired.map((pair) => pair.feature).join(", ")}): add what each one means for the buyer.`,
    );
  }
  if (proof.length === 0) {
    checks.push("No proof line: without a review, a result or a guarantee the description carries only the seller's word.");
  } else if (!proof.some((line) => /\d/.test(line))) {
    checks.push("No proof line carries a number; counted results are the ones shoppers believe.");
  }
  if (!offer) checks.push("No price stated; hiding it sends the shopper to find it elsewhere.");
  if (!cta) checks.push("No call to action; one action, stated once.");
  if (hook && words(hook).length > 25) {
    checks.push(`The hook runs ${words(hook).length} words; it is a scan line, not a paragraph.`);
  }

  const haystack = [hook, ...paired.map((pair) => `${pair.feature} ${pair.benefit}`), ...specs].join(" ");
  const claims = [...new Set((haystack.toLowerCase().match(new RegExp(`\\b(${CLAIM_WORDS.join("|")})\\b`, "g")) ?? []))];
  if (claims.length > 0 && !/\d/.test(haystack)) {
    checks.push(`Claiming words detected (${claims.join(", ")}) with no fact beside them; attach a number or a comparison or drop the claim.`);
  }

  return { sections, output, checkCount: checks.length, checks };
}
