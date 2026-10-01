/**
 * Story structure reference for the plot point mapper and the story beat
 * builder: the named beat sheets writers work from, as data.
 *
 * Each structure is a list of beats with the share of the story where the beat
 * typically lands. The percentages are the conventional placements from the
 * structures they name; the tool reports them as guidance, not as rules, and the
 * pages say so. Nothing here is generated — these are reference outlines, and
 * they exist so the two tools share one source of truth.
 */

export type StructureId = "three-act" | "four-act" | "save-the-cat" | "hero-journey";

export interface Beat {
  name: string;
  /** Where the beat typically lands, as a percentage through the story. */
  at: number;
  summary: string;
}

export interface Structure {
  id: StructureId;
  name: string;
  blurb: string;
  beats: Beat[];
}

export const STRUCTURES: Structure[] = [
  {
    id: "three-act",
    name: "Three-act structure",
    blurb: "Setup, confrontation, resolution — the shape most stories share even when nobody names it.",
    beats: [
      { name: "Hook", at: 0, summary: "Open on the character in motion; the reader's first question is raised." },
      { name: "Inciting incident", at: 10, summary: "Something happens that the character cannot ignore." },
      { name: "First plot point", at: 25, summary: "The character commits to the journey; the door closes behind them." },
      { name: "Midpoint", at: 50, summary: "A reversal or revelation that changes what the story is about." },
      { name: "Second plot point", at: 75, summary: "The last piece of information arrives; the final push begins." },
      { name: "Climax", at: 90, summary: "The character faces the story's central conflict head on." },
      { name: "Resolution", at: 100, summary: "The new normal is shown; the story's promise is answered." },
    ],
  },
  {
    id: "four-act",
    name: "Four-act structure",
    blurb: "The three acts with the middle split at the midpoint, useful for long or serial fiction.",
    beats: [
      { name: "Act one: setup", at: 0, summary: "The ordinary world and the disruption that ends it." },
      { name: "Act two: reaction", at: 25, summary: "The character reacts to the new situation and fails to control it." },
      { name: "Midpoint", at: 50, summary: "The turn that splits the story in two." },
      { name: "Act three: action", at: 75, summary: "The character stops reacting and starts driving events." },
      { name: "Act four: resolution", at: 90, summary: "The confrontation and its aftermath." },
    ],
  },
  {
    id: "save-the-cat",
    name: "Save the Cat beat sheet",
    blurb: "Blake Snyder's fifteen beats, a widely used shape for commercial screen and genre fiction.",
    beats: [
      { name: "Opening image", at: 0, summary: "A snapshot of the world before the story changes it." },
      { name: "Theme stated", at: 5, summary: "Someone states the lesson the story will prove, usually without knowing it." },
      { name: "Setup", at: 10, summary: "Introduce the characters and the flaws that will cost them." },
      { name: "Catalyst", at: 12, summary: "The event that sets the story in motion." },
      { name: "Debate", at: 15, summary: "The character hesitates; the question of whether to act is aired." },
      { name: "Break into two", at: 20, summary: "A voluntary choice that moves the story into the new world." },
      { name: "B story", at: 25, summary: "A secondary relationship or plot that carries the theme." },
      { name: "Fun and games", at: 30, summary: "The promise of the premise; the heart of what the reader came for." },
      { name: "Midpoint", at: 50, summary: "A false victory or false defeat that raises the stakes." },
      { name: "Bad guys close in", at: 60, summary: "External pressure increases and the plan frays." },
      { name: "All is lost", at: 70, summary: "The lowest point, often marked by a death or a loss." },
      { name: "Dark night of the soul", at: 75, summary: "The character sits with the failure before the turn." },
      { name: "Break into three", at: 80, summary: "The realisation that makes the final plan possible." },
      { name: "Finale", at: 85, summary: "The plan is executed, with the theme confronting the character." },
      { name: "Final image", at: 100, summary: "A mirror of the opening image, changed by the story." },
    ],
  },
  {
    id: "hero-journey",
    name: "Hero's journey",
    blurb: "Campbell's monomyth as twelve stages, the shape behind a great deal of mythic and epic fiction.",
    beats: [
      { name: "Ordinary world", at: 0, summary: "The hero's world before the call, with its limits." },
      { name: "Call to adventure", at: 8, summary: "The disruption that asks the hero to leave." },
      { name: "Refusal of the call", at: 16, summary: "Fear or duty holds the hero back." },
      { name: "Meeting the mentor", at: 24, summary: "Help arrives, with a gift and a warning." },
      { name: "Crossing the threshold", at: 32, summary: "The hero commits and enters the unknown." },
      { name: "Tests, allies, enemies", at: 40, summary: "The new world reveals its rules and its people." },
      { name: "Approach to the inmost cave", at: 55, summary: "The hero nears the ordeal and prepares." },
      { name: "Ordeal", at: 62, summary: "A brush with death that changes the hero." },
      { name: "Reward", at: 70, summary: "The prize, and the cost of taking it." },
      { name: "The road back", at: 80, summary: "The return begins, often pursued." },
      { name: "Resurrection", at: 90, summary: "The final test, in which the hero is proved changed." },
      { name: "Return with the elixir", at: 100, summary: "The hero comes home with what the world needs." },
    ],
  },
];

export function findStructure(id: StructureId): Structure {
  return STRUCTURES.find((structure) => structure.id === id) ?? STRUCTURES[0];
}

/** Beats that fall at or before a story position, as a percentage 0-100. */
export function beatsUpTo(structure: Structure, percent: number): Beat[] {
  return structure.beats.filter((beat) => beat.at <= percent);
}

/** How much of a structure is behind a given position, rounded to a percent. */
export function structureProgress(structure: Structure, percent: number): number {
  const behind = beatsUpTo(structure, percent).length;
  return structure.beats.length === 0 ? 0 : Math.round((behind / structure.beats.length) * 100);
}

/** A copyable reference sheet: every beat, its placement and its summary. */
export function beatSheetMarkdown(structure: Structure): string {
  const lines = [`# ${structure.name}`, "", structure.blurb, ""];
  for (const beat of structure.beats) {
    lines.push(`- **${beat.name}** (${beat.at}%) — ${beat.summary}`);
  }
  return lines.join("\n");
}
