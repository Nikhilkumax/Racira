/**
 * Landing page copy builder: assemble a hero line, the benefits, a proof block
 * and one next step into the skeleton of a landing page, then check each block.
 *
 * The engine supplies the order a page reads in and flags what is missing —
 * fewer than three benefits, no proof, a headline that became a sentence. It
 * writes no claims.
 */
import { words } from "./tokenize.ts";

export interface LandingPageInput {
  product: string;
  headline: string;
  audience: string;
  benefits: string[];
  proof: string;
  cta: string;
}

export interface LandingPageCheck {
  id: string;
  message: string;
}

export interface LandingPageDraft {
  page: string;
  words: number;
  sections: number;
  checks: LandingPageCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildLandingPage(input: LandingPageInput): LandingPageDraft {
  const product = clean(input.product);
  const headline = clean(input.headline);
  const audience = clean(input.audience);
  const benefits = input.benefits.map(clean).filter(Boolean);
  const proof = clean(input.proof);
  const cta = clean(input.cta);

  const blocks: string[] = [];
  if (headline) blocks.push(headline);
  if (audience) blocks.push(`For ${audience}.`);
  if (benefits.length > 0) {
    blocks.push(`What you get\n${benefits.map((benefit, index) => `${index + 1}. ${benefit}`).join("\n")}`);
  }
  if (proof) blocks.push(`Why it holds up\n${proof}`);
  if (cta) blocks.push(`Next step\n${cta}`);
  if (product) blocks.push(`About ${product}`);

  const page = blocks.join("\n\n");

  const checks: LandingPageCheck[] = [];
  if (!product) checks.push({ id: "product", message: "Name the product; a page that never says what it is makes the reader work." });
  if (!headline) checks.push({ id: "headline", message: "Write the hero line — one promise the page can keep." });
  else if (words(headline).length > 12) {
    checks.push({ id: "headline-long", message: `The hero line runs ${words(headline).length} words; keep it under twelve.` });
  }
  if (!audience) checks.push({ id: "audience", message: "Name the reader the page is for; everyone is no one." });
  if (benefits.length < 3) {
    checks.push({
      id: "benefits",
      message: `${benefits.length} benefit${benefits.length === 1 ? "" : "s"} so far; a landing page needs at least three reasons to keep reading.`,
    });
  }
  if (benefits.length > 7) {
    checks.push({ id: "benefits-many", message: `${benefits.length} benefits dilutes the page; keep the seven that decide the click.` });
  }
  for (const benefit of benefits) {
    const count = words(benefit).length;
    if (count > 20) checks.push({ id: "benefit-long", message: `One benefit runs ${count} words; keep each to a phrase.` });
  }
  if (!proof) checks.push({ id: "proof", message: "Add proof — a figure, a name, a result — or the page is only claims." });
  if (!cta) checks.push({ id: "cta", message: "Add one next step; a page that asks for nothing gets nothing." });

  const sections = [headline, audience, benefits.length ? "benefits" : "", proof, cta].filter(Boolean).length;
  return { page, words: words(page).length, sections, checks };
}
