/**
 * Villain motivation builder: assemble the parts that make an antagonist a
 * person — what they want, the wound behind it, how they justify themselves,
 * their method, the line they will not cross and the story they tell about
 * themselves — and check the parts most drafts skip.
 *
 * The engine writes no villain; it asks the questions a memorable one answers.
 */
import { words } from "./tokenize.ts";

export interface VillainInput {
  villain: string;
  want: string;
  wound: string;
  justification: string;
  method: string;
  limit: string;
  selfStory: string;
}

export interface VillainCheck {
  id: string;
  message: string;
}

export interface VillainDraft {
  profile: string;
  words: number;
  filled: number;
  total: number;
  checks: VillainCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function buildVillainProfile(input: VillainInput): VillainDraft {
  const fields = {
    villain: clean(input.villain),
    want: clean(input.want),
    wound: clean(input.wound),
    justification: clean(input.justification),
    method: clean(input.method),
    limit: clean(input.limit),
    selfStory: clean(input.selfStory),
  };

  const blocks: string[] = [];
  if (fields.villain || fields.want) {
    blocks.push([fields.villain ? `Villain: ${fields.villain}` : "Villain", fields.want ? `Wants: ${fields.want}` : ""].filter(Boolean).join("\n"));
  }
  const sections: [string, string][] = [
    ["Wound", fields.wound],
    ["Justification", fields.justification],
    ["Method", fields.method],
    ["Line they will not cross", fields.limit],
    ["How they see themselves", fields.selfStory],
  ];
  for (const [label, value] of sections) {
    if (value) blocks.push(`${label}\n${value}`);
  }

  const profile = blocks.join("\n\n");
  const filled = Object.values(fields).filter(Boolean).length;

  const checks: VillainCheck[] = [];
  if (!fields.villain) checks.push({ id: "villain", message: "Name the villain; a role is not a person." });
  if (!fields.want) checks.push({ id: "want", message: "State what they want; a villain without a goal is only weather." });
  else if (words(fields.want).length > 20) {
    checks.push({ id: "want-long", message: `The want runs ${words(fields.want).length} words; keep it to a sentence.` });
  }
  if (!fields.wound) {
    checks.push({ id: "wound", message: "Name the wound behind the want; the best villains are answering an old injury." });
  }
  if (!fields.justification) {
    checks.push({ id: "justification", message: "Write how they justify themselves — in their own eyes, not the narrator's." });
  }
  if (!fields.method) checks.push({ id: "method", message: "Describe their method; what they do is their character." });
  if (!fields.limit) {
    checks.push({ id: "limit", message: "Give them a line they will not cross; a limit is what makes them a person rather than a plot device." });
  }
  if (!fields.selfStory) {
    checks.push({ id: "self-story", message: "Write how they see themselves; every convincing villain is the hero of their own account." });
  }

  return { profile, words: words(profile).length, filled, total: 7, checks };
}
