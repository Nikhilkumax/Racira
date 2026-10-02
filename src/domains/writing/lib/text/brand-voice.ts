/**
 * Brand voice guide builder: three voice attributes with their practice, a
 * say / do-not-say list, and a sample paragraph checked against the guide it is
 * supposed to demonstrate.
 *
 * A voice guide fails in one of two ways. It is abstract — "we are warm but
 * professional" — so no writer can apply it, or it is contradicted by the
 * brand's own copy. The builder addresses both: every attribute is requested
 * with a line describing what it means in practice, and the sample paragraph is
 * checked for the banned terms it contains, the sentences a reader has to hold
 * in one breath, and the overlap between the two lists, which is the quiet way
 * a guide contradicts itself.
 */
import { sentences, words } from "./tokenize.ts";

export interface VoiceSection {
  id: string;
  label: string;
  prompt: string;
  text: string;
}

export interface BrandVoiceGuide {
  sections: VoiceSection[];
  output: string;
  checks: string[];
  stats: { attributes: number; doSay: number; dontSay: number; sampleWords: number; longSentences: number };
}

export interface BrandVoiceInput {
  brand?: string;
  audience?: string;
  attributes?: string;
  doSay?: string;
  dontSay?: string;
  sample?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");
const lines = (value: string): string[] =>
  (value ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0);

/** Assemble the guide and check the sample against it. */
export function buildBrandVoice(input: BrandVoiceInput = {}): BrandVoiceGuide {
  const brand = clean(input.brand ?? "");
  const audience = clean(input.audience ?? "");
  const attributeLines = lines(input.attributes ?? "");
  const doSay = lines(input.doSay ?? "");
  const dontSay = lines(input.dontSay ?? "");
  const sample = clean(input.sample ?? "");

  const attributes = attributeLines.map((line) => {
    const [attribute = "", practice = ""] = line.split(/\s*\|\s*/);
    return { attribute: attribute.trim(), practice: practice.trim() };
  });

  const sections: VoiceSection[] = [
    {
      id: "who",
      label: "Who we are writing for",
      prompt: "The reader, named by the situation they arrive in.",
      text: audience || "(name the reader and the situation they arrive in.)",
    },
    {
      id: "attributes",
      label: "Voice attributes",
      prompt: "One per line as attribute | what it means in practice.",
      text:
        attributes.length > 0
          ? attributes
              .map((entry) => `- ${entry.attribute}${entry.practice ? `: ${entry.practice}` : " — (no practice written)"}`)
              .join("\n")
          : "(three attributes, each with a line on what it means in practice.)",
    },
    {
      id: "say",
      label: "We say",
      prompt: "Phrases and constructions to reach for, one per line.",
      text: doSay.length > 0 ? doSay.map((line) => `- ${line}`).join("\n") : "(phrases to reach for.)",
    },
    {
      id: "dontsay",
      label: "We do not say",
      prompt: "Phrases to avoid, one per line.",
      text: dontSay.length > 0 ? dontSay.map((line) => `- ${line}`).join("\n") : "(phrases to avoid.)",
    },
    {
      id: "sample",
      label: "Example in voice",
      prompt: "One paragraph that demonstrates the guide.",
      text: sample || "(paste one paragraph written in the voice.)",
    },
  ];

  const output = sections.map((section) => `${section.label}\n${section.text}`).join("\n\n");

  const checks: string[] = [];
  if (!brand) checks.push("No brand named; the guide is written for a specific one.");
  if (!audience) checks.push("No reader named; a voice guide without an audience is a preference list.");
  if (attributes.length < 3) {
    checks.push(`${attributes.length} attribute${attributes.length === 1 ? "" : "s"}; three is the working range — enough to shape a sentence, few enough to remember.`);
  }
  const unpracticed = attributes.filter((entry) => entry.attribute && !entry.practice);
  if (unpracticed.length > 0) {
    checks.push(
      `${unpracticed.length} attribute${unpracticed.length === 1 ? " has" : "s have"} no line on what it means in practice (${unpracticed.map((entry) => entry.attribute).join(", ")}); "warm" means nothing until it says what a writer does differently.`,
    );
  }
  if (doSay.length === 0) checks.push("No phrases to reach for; the guide only says what not to do.");
  if (dontSay.length === 0) checks.push("No phrases to avoid; the say list alone leaves the edge cases to taste.");

  const lowerDont = dontSay.map((line) => line.toLowerCase());
  const overlap = doSay.filter((line) => lowerDont.includes(line.toLowerCase()));
  if (overlap.length > 0) {
    checks.push(`The same phrase appears on both lists (${overlap.join(", ")}); a guide that contradicts itself will be ignored.`);
  }

  if (sample) {
    const banned = dontSay.filter((line) => sample.toLowerCase().includes(line.toLowerCase()));
    if (banned.length > 0) {
      checks.push(`The sample paragraph uses banned phrasing (${banned.join(", ")}); fix the sample or the list.`);
    }
    const sentenceList = sentences(sample);
    const longSentences = sentenceList.filter((sentence) => words(sentence).length > 25);
    if (longSentences.length > 0) {
      checks.push(`${longSentences.length} sample sentence${longSentences.length === 1 ? " runs" : "s run"} past 25 words; whatever the voice, a reader holds a sentence for one breath.`);
    }
  } else {
    checks.push("No sample paragraph; writers copy an example before they follow a description.");
  }

  return {
    sections,
    output,
    checks,
    stats: {
      attributes: attributes.length,
      doSay: doSay.length,
      dontSay: dontSay.length,
      sampleWords: words(sample).length,
      longSentences: sample ? sentences(sample).filter((sentence) => words(sentence).length > 25).length : 0,
    },
  };
}
