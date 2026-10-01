/**
 * Scene description builder: turn a set of prompts about a place into a
 * consistent note sheet, and check a passage for the filter words that push a
 * reader a step away from the scene.
 *
 * The builder does not write prose — it lists what you noticed, field by field,
 * so the details are decided before the paragraph is. The filter-word check is a
 * mechanical list of the verbs that narrate perception instead of the thing
 * perceived (saw, heard, felt, noticed), which is one of the most common
 * revision notes dialogue and description attract.
 */
import { wordTokens } from "./tokenize.ts";

export interface DescriptionFields {
  place?: string;
  time?: string;
  light?: string;
  weather?: string;
  sound?: string;
  smell?: string;
  texture?: string;
  mood?: string;
}

export interface DescriptionPrompt {
  key: keyof DescriptionFields;
  label: string;
  prompt: string;
}

export const DESCRIPTION_PROMPTS: DescriptionPrompt[] = [
  { key: "place", label: "Place", prompt: "Where is this, in the story's own terms?" },
  { key: "time", label: "Time", prompt: "What time of day, and what season?" },
  { key: "light", label: "Light", prompt: "Where is the light coming from, and what colour is it?" },
  { key: "weather", label: "Weather", prompt: "What is the weather doing to the place?" },
  { key: "sound", label: "Sound", prompt: "What can be heard, and from how far off?" },
  { key: "smell", label: "Smell", prompt: "What does the air smell of?" },
  { key: "texture", label: "Texture", prompt: "What would a hand touch here?" },
  { key: "mood", label: "Mood", prompt: "What feeling should the place carry?" },
];

export interface DescriptionResult {
  /** The filled fields as labelled lines, in prompt order. */
  text: string;
  filled: number;
  total: number;
  coverage: number;
  missing: string[];
}

/** Compose the note sheet from whichever fields are filled. */
export function buildDescription(fields: DescriptionFields): DescriptionResult {
  const lines: string[] = [];
  const missing: string[] = [];
  for (const prompt of DESCRIPTION_PROMPTS) {
    const value = (fields[prompt.key] ?? "").trim();
    if (value) lines.push(`${prompt.label}: ${value}`);
    else missing.push(prompt.label);
  }
  const filled = DESCRIPTION_PROMPTS.length - missing.length;
  return {
    text: lines.join("\n"),
    filled,
    total: DESCRIPTION_PROMPTS.length,
    coverage: Math.round((filled / DESCRIPTION_PROMPTS.length) * 100),
    missing,
  };
}

const FILTER_WORDS = ["saw", "heard", "felt", "noticed", "watched", "wondered", "realised", "realized", "seemed", "thought", "looked", "listened"];

export interface FilterHit {
  word: string;
  count: number;
}

/** Count the perception verbs in a passage — a revision prompt, not a rule. */
export function filterWords(text: string): FilterHit[] {
  const tokens = wordTokens(text).map((token) => token.text.toLowerCase());
  const counts = new Map<string, number>();
  for (const token of tokens) {
    if (FILTER_WORDS.includes(token)) counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return [...counts.entries()].map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
}

/** A copyable report of the sheet and the filter-word check. */
export function descriptionReport(fields: DescriptionFields, passage: string): string {
  const result = buildDescription(fields);
  const hits = filterWords(passage);
  return [
    `Scene description — ${result.filled}/${result.total} fields filled (${result.coverage}%)`,
    result.missing.length > 0 ? `Still open: ${result.missing.join(", ")}` : "Every prompt answered.",
    "",
    result.text || "(no fields filled yet)",
    "",
    `Filter words: ${hits.length === 0 ? "none found" : hits.map((hit) => `${hit.word} ×${hit.count}`).join(", ")}`,
  ].join("\n");
}
