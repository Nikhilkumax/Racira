/**
 * Story idea generator: assemble a premise from a protagonist, a want, an
 * obstacle and a setting, then spin the same parts into "what if" variants.
 *
 * The engine combines the parts you supply; it invents no premise. The variants
 * exist to make the idea testable — a premise that survives a few of them is
 * one worth drafting.
 */
import { words } from "./tokenize.ts";

export interface StoryIdeaInput {
  genre: string;
  protagonist: string;
  want: string;
  obstacle: string;
  setting: string;
}

export interface StoryIdeaCheck {
  id: string;
  message: string;
}

export interface StoryIdeaDraft {
  premise: string;
  variants: string[];
  words: number;
  completeness: { done: number; total: number };
  checks: StoryIdeaCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");
const lowerFirst = (line: string): string => (line ? `${line.charAt(0).toLowerCase()}${line.slice(1)}` : line);

export function buildStoryIdea(input: StoryIdeaInput): StoryIdeaDraft {
  const genre = clean(input.genre);
  const protagonist = clean(input.protagonist);
  const want = clean(input.want);
  const obstacle = clean(input.obstacle);
  const setting = clean(input.setting);

  const premiseParts: string[] = [];
  if (protagonist && want && obstacle) {
    premiseParts.push(`${protagonist} wants ${lowerFirst(want)}, but ${lowerFirst(obstacle)}.`);
  } else if (protagonist && want) {
    premiseParts.push(`${protagonist} wants ${lowerFirst(want)}.`);
  }
  if (genre || setting) {
    premiseParts.push(`(${[genre, setting ? `set in ${setting}` : ""].filter(Boolean).join(", ")}.)`);
  }
  const premise = premiseParts.join(" ");

  const variants: string[] = [];
  if (want) variants.push(`What if ${lowerFirst(want)} is achieved in the first act, and the story is the cost?`);
  if (obstacle) variants.push(`What if ${lowerFirst(obstacle)} is right?`);
  if (protagonist) variants.push(`What if ${protagonist} is the obstacle?`);
  if (setting) variants.push(`What if the setting itself — ${setting} — is the antagonist?`);

  const core = [genre, protagonist, want, obstacle].filter(Boolean).length;

  const checks: StoryIdeaCheck[] = [];
  if (!genre) checks.push({ id: "genre", message: "Name a genre or a shelf the story belongs on; it steers every variant below." });
  if (!protagonist) checks.push({ id: "protagonist", message: "Name the protagonist — an idea needs someone to happen to." });
  if (!want) checks.push({ id: "want", message: "State what the protagonist wants; a story is a want meeting a wall." });
  if (!obstacle) checks.push({ id: "obstacle", message: "Name the obstacle; without one the want is a wish." });
  if (!setting) checks.push({ id: "setting", message: "Add a setting, even loosely — place shapes what a character can do." });
  for (const [label, value] of [["want", want], ["obstacle", obstacle]] as const) {
    const count = words(value).length;
    if (count > 15) checks.push({ id: `${label}-long`, message: `The ${label} runs ${count} words; keep it to a clause.` });
  }

  return { premise, variants, words: words(premise).length, completeness: { done: core, total: 4 }, checks };
}
