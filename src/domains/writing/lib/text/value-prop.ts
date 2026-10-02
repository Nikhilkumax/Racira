/**
 * Value proposition builder: assemble the one paragraph that says who a product
 * is for, what need it answers, what it is, the benefit and — the step most
 * drafts skip — the alternative it replaces and the proof that it does.
 *
 * The engine assembles the sentence from the parts and checks the shape: a
 * proof without a figure, a contrast with nothing on the other side.
 */
import { words } from "./tokenize.ts";

export interface ValuePropInput {
  audience: string;
  need: string;
  brand: string;
  category: string;
  benefit: string;
  alternative: string;
  proof: string;
}

export interface ValuePropCheck {
  id: string;
  message: string;
}

export interface ValuePropDraft {
  proposition: string;
  words: number;
  checks: ValuePropCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const endSentence = (line: string): string => (/[.!?]$/.test(line) ? line : `${line}.`);
const article = (word: string): string => (/^[aeiou]/i.test(word) ? "an" : "a");

export function buildValueProposition(input: ValuePropInput): ValuePropDraft {
  const audience = clean(input.audience);
  const need = clean(input.need);
  const brand = clean(input.brand);
  const category = clean(input.category);
  const benefit = clean(input.benefit);
  const alternative = clean(input.alternative);
  const proof = clean(input.proof);

  const sentences: string[] = [];
  if (audience && need && brand && category && benefit) {
    sentences.push(`For ${audience} who ${need}, ${brand} is ${article(category)} ${category} that ${benefit}.`);
  } else if (brand && benefit) {
    sentences.push(`${brand} ${benefit}.`);
  }
  if (alternative && proof) {
    sentences.push(`Unlike ${alternative}, ${endSentence(proof)}`);
  } else if (proof) {
    sentences.push(endSentence(`${proof.charAt(0).toUpperCase()}${proof.slice(1)}`));
  }

  const proposition = sentences.join(" ");

  const checks: ValuePropCheck[] = [];
  if (!audience) checks.push({ id: "audience", message: "Name the audience; a value proposition that is for everyone is for no one." });
  if (!need) checks.push({ id: "need", message: "State the need in the reader's terms — the problem they already feel." });
  if (!brand) checks.push({ id: "brand", message: "Name the product or brand." });
  if (!category) checks.push({ id: "category", message: "Name the category; readers file a product by what it is before they judge it." });
  if (!benefit) checks.push({ id: "benefit", message: "State the benefit in a verb phrase — what changes for the reader." });
  if (!alternative) {
    checks.push({ id: "alternative", message: "Name the alternative the reader uses today; a value proposition needs contrast to mean anything." });
  }
  if (!proof) {
    checks.push({ id: "proof", message: "Add proof — a figure, a name or a result — or the claim is only an adjective." });
  } else if (!/\d/.test(proof)) {
    checks.push({ id: "proof-figure", message: "The proof contains no number; figures are the part a reader can check." });
  }
  if (/\b(we|our|us)\b/i.test(benefit)) {
    checks.push({ id: "first-person", message: "The benefit describes what you do; rewrite it as what the reader gets." });
  }
  const count = words(proposition).length;
  if (count > 60) {
    checks.push({ id: "long", message: `The proposition runs ${count} words; keep the pitch to two sentences and under sixty words.` });
  }

  return { proposition, words: count, checks };
}
