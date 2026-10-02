/**
 * Writing prompt generator: a fixed bank of prompts per category — character,
 * setting, conflict, dialogue, opening — served three at a time in a stable
 * order.
 *
 * The bank is authored and finite; nothing is generated at random. The "next"
 * action advances through the bank deterministically, so every writer sees the
 * same prompts in the same order and can return to one.
 */

export interface PromptCategory {
  id: string;
  label: string;
}

export const PROMPT_CATEGORIES: PromptCategory[] = [
  { id: "character", label: "Character" },
  { id: "setting", label: "Setting" },
  { id: "conflict", label: "Conflict" },
  { id: "dialogue", label: "Dialogue" },
  { id: "opening", label: "Opening" },
];

export const PROMPT_BANK: Record<string, string[]> = {
  character: [
    "Write about someone who apologises before they are accused.",
    "Write about someone who keeps a suitcase packed for a trip they will never take.",
    "Write about someone who is only brave on other people's behalf.",
    "Write about someone whose greatest skill is also their worst habit.",
    "Write about someone who remembers every promise made to them, and none they made.",
    "Write about someone who is kind for reasons they would not admit.",
  ],
  setting: [
    "Describe a place that is trying to be forgotten.",
    "Describe a town where the clocks disagree by four minutes.",
    "Describe a room that has been packed up for years and never moved.",
    "Describe a place that is beautiful and uninhabitable.",
    "Describe a border you can stand on without knowing which side you are on.",
    "Describe a building that outlives everyone who argues about it.",
  ],
  conflict: [
    "Two people want the same thing, and one of them deserves it.",
    "Someone must betray a secret to keep a promise.",
    "A person is offered exactly what they asked for, on a term they cannot accept.",
    "Two friends discover they remember the same event differently.",
    "Someone must choose between being right and being forgiven.",
    "A person is told the truth by someone who has every reason to lie.",
  ],
  dialogue: [
    "Write a conversation where the real subject is never named.",
    "Write a conversation in which both people are lying, and only one knows.",
    "Write an argument that turns, without either noticing, into a confession.",
    "Write a reunion where neither person says the thing they came to say.",
    "Write a negotiation where one side has already won and the other has not noticed.",
    "Write a goodbye that both people believe is temporary, and is not.",
  ],
  opening: [
    "Open with a character doing something they have done a thousand times, for the last time.",
    "Open with a sentence that would be ordinary in any other house.",
    "Open in the middle of a decision, before the reader knows the stakes.",
    "Open with a small lie that will cost the narrator something real.",
    "Open with an arrival that everyone else has been expecting.",
    "Open with a question the narrator cannot afford to answer.",
  ],
};

export const PROMPTS_PER_PAGE = 3;

export interface PromptPage {
  category: string;
  prompts: string[];
  total: number;
  offset: number;
}

/** One page of the bank, wrapping at the end so the list never runs out. */
export function promptPage(categoryId: string, offset = 0): PromptPage {
  const bank = PROMPT_BANK[categoryId] ?? PROMPT_BANK[PROMPT_CATEGORIES[0].id];
  const total = bank.length;
  const start = ((offset % total) + total) % total;
  const prompts: string[] = [];
  for (let index = 0; index < Math.min(PROMPTS_PER_PAGE, total); index += 1) {
    prompts.push(bank[(start + index) % total]);
  }
  return { category: categoryId, prompts, total, offset: start };
}

/** The next offset in the cycle. */
export function nextPromptOffset(categoryId: string, offset: number): number {
  const bank = PROMPT_BANK[categoryId] ?? PROMPT_BANK[PROMPT_CATEGORIES[0].id];
  return (offset + PROMPTS_PER_PAGE) % bank.length;
}
