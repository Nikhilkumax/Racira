/**
 * World building template: a world bible skeleton with one slot per question a
 * story will ask of its setting — geography, culture, politics, economy, rules,
 * history, conflicts — plus checks for the areas left empty.
 *
 * The engine supplies the questions and formats the answers; it invents no
 * world.
 */
import { words } from "./tokenize.ts";

export interface WorldInput {
  name: string;
  premise: string;
  geography: string;
  culture: string;
  politics: string;
  economy: string;
  rules: string;
  history: string;
  conflicts: string;
}

export interface WorldArea {
  id: keyof Omit<WorldInput, "name" | "premise">;
  label: string;
  prompt: string;
}

export const WORLD_AREAS: WorldArea[] = [
  { id: "geography", label: "Geography", prompt: "What does the land do to the people who live on it?" },
  { id: "culture", label: "Culture", prompt: "What do they believe, celebrate and forbid?" },
  { id: "politics", label: "Politics", prompt: "Who holds power, and what do they fear losing?" },
  { id: "economy", label: "Economy", prompt: "What is scarce, and who profits from the scarcity?" },
  { id: "rules", label: "Rules of magic or technology", prompt: "What is possible, what does it cost, and who may use it?" },
  { id: "history", label: "History", prompt: "What happened before the story that everyone still argues about?" },
  { id: "conflicts", label: "Conflicts", prompt: "Which two forces cannot both get what they want?" },
];

export interface WorldCheck {
  id: string;
  message: string;
}

export interface WorldDraft {
  bible: string;
  words: number;
  filled: number;
  total: number;
  checks: WorldCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildWorldBible(input: WorldInput): WorldDraft {
  const name = clean(input.name);
  const premise = clean(input.premise);

  const blocks: string[] = [];
  if (name) blocks.push(premise ? `World: ${name}\n${premise}` : `World: ${name}`);
  for (const area of WORLD_AREAS) {
    const value = clean(input[area.id]);
    if (value) blocks.push(`${area.label}\n${value}`);
  }

  const bible = blocks.join("\n\n");
  const filled = WORLD_AREAS.filter((area) => clean(input[area.id]).length > 0).length;

  const checks: WorldCheck[] = [];
  if (!name) checks.push({ id: "name", message: "Name the world; a bible without a title is hard to return to." });
  if (!premise) checks.push({ id: "premise", message: "Add a one-line premise so the details have a story to serve." });
  if (filled < 5) {
    checks.push({
      id: "areas",
      message: `${filled} of ${WORLD_AREAS.length} areas filled; a working bible answers at least five of the seven questions.`,
    });
  }
  if (!clean(input.conflicts)) {
    checks.push({ id: "conflicts", message: "Name the conflict the world is built around; settings are interesting for what they deny people." });
  }
  for (const area of WORLD_AREAS) {
    const count = words(clean(input[area.id])).length;
    if (count > 120) {
      checks.push({ id: `${area.id}-long`, message: `${area.label} runs ${count} words; a bible entry is a paragraph, not a chapter.` });
    }
  }

  return {
    bible,
    words: words(bible).length,
    filled,
    total: WORLD_AREAS.length,
    checks,
  };
}
