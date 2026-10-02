/**
 * First line generator: four candidate opening lines built from a character, a
 * place and a chosen tone, plus a free-text checker for the opener a writer
 * wrote themselves.
 *
 * The patterns are fixed and visible; the engine combines your three fields and
 * never supplies a story. The checker names the four moves that make a first
 * line sound borrowed.
 */

export interface FirstLineInput {
  character: string;
  place: string;
  tone: string;
}

export interface Tone {
  id: string;
  label: string;
}

export const TONES: Tone[] = [
  { id: "quiet", label: "Quiet" },
  { id: "strange", label: "Strange" },
  { id: "dangerous", label: "Dangerous" },
  { id: "warm", label: "Warm" },
];

export interface OpeningFlag {
  id: string;
  message: string;
}

export interface FirstLineDraft {
  lines: string[];
  checks: OpeningFlag[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

function patterns(tone: string, character: string, place: string): string[] {
  const c = character;
  const p = place;
  switch (tone) {
    case "strange":
      return [
        `The morning ${c} arrived, ${p} had one street fewer than the map showed.`,
        `${c} recognised ${p} from a dream that had not been theirs.`,
        `Nobody in ${p} cast a shadow, and nobody mentioned it.`,
        `Everything in ${p} was exactly where ${c} remembered it, which was impossible.`,
      ];
    case "dangerous":
      return [
        `${c} came to ${p} because it was the last place anyone would look.`,
        `The road into ${p} was blocked, and ${c} took that as a welcome.`,
        `${p} had a reputation, and ${c} had a debt.`,
        `They warned ${c} not to go to ${p}, which is how ${c} learned it existed.`,
      ];
    case "warm":
      return [
        `${c} arrived in ${p} expecting nothing, and was handed bread.`,
        `${p} had one rule — everyone eats — and ${c} was hungry.`,
        `The first thing ${c} learned in ${p} was that the door was never locked.`,
        `${c} came to ${p} to leave the world behind, and the world sent letters.`,
      ];
    default:
      return [
        `${c} arrived in ${p} with a suitcase and no reason anyone believed.`,
        `Nothing in ${p} had moved for a week, until ${c} did.`,
        `The first rule of ${p} was not to ask. ${c} asked.`,
        `${c} had been told ${p} was peaceful, and it was, in the way a held breath is.`,
      ];
  }
}

export function buildFirstLines(input: FirstLineInput): FirstLineDraft {
  const character = clean(input.character);
  const place = clean(input.place);
  const tone = TONES.some((entry) => entry.id === input.tone) ? input.tone : TONES[0].id;

  const lines = character && place ? patterns(tone, character, place) : [];

  const checks: OpeningFlag[] = [];
  if (!character) checks.push({ id: "character", message: "Name a character; a first line needs someone it happens to." });
  if (!place) checks.push({ id: "place", message: "Name a place; the setting is half of what makes an opening specific." });

  return { lines, checks };
}

/** Names the borrowed moves in an opening line a writer brought themselves. */
export function checkOpeningLine(line: string): OpeningFlag[] {
  const text = clean(line);
  if (!text) return [];
  const flags: OpeningFlag[] = [];
  if (/\b(dark and stormy|rainy night|sun rose|sun was setting)\b/i.test(text)) {
    flags.push({ id: "weather", message: "Opening on the weather tells the reader nothing the story needs yet; start with a person or an action." });
  }
  if (/^once upon a time/i.test(text)) {
    flags.push({ id: "once", message: "\"Once upon a time\" signals a fairy tale; unless that is the register, cut to the scene." });
  }
  if (/^there (was|were)\b/i.test(text)) {
    flags.push({ id: "there-was", message: "\"There was\" starts a description; starting with a person doing something is stronger." });
  }
  if (text.split(/\s+/).filter(Boolean).length > 30) {
    flags.push({ id: "long", message: `The line runs ${text.split(/\s+/).filter(Boolean).length} words; a first line earns its length, it is not given.` });
  }
  return flags;
}
