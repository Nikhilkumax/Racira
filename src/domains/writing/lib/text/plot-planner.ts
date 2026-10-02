/**
 * Plot structure planner: the premise's load-bearing facts mapped onto the
 * beats of a chosen structure, so the writer can see where each one belongs
 * before a draft exists.
 *
 * The four facts a premise needs — who it is about, what they want, what
 * stands in the way and what it costs — are anchored to the beats where a
 * reader expects them: the protagonist at the opening, the goal around the
 * inciting incident, the conflict at the midpoint, the stakes at the second
 * turning point. The beats between them keep their own prompts from the
 * structure, so the plan is a full beat sheet with the writer's facts already
 * placed.
 *
 * The checks are the premise's own: a logline under eight words says too
 * little to plan against, a conflict under four words names a difficulty
 * rather than an opposing force, and a missing fact is named as missing rather
 * than quietly left to the draft.
 */
import { findStructure, type StructureId } from "./story-structure.ts";
import { words } from "./tokenize.ts";

export interface PlotAnchor {
  id: "protagonist" | "goal" | "conflict" | "stakes";
  label: string;
  /** Where the fact belongs, as a percentage through the story. */
  at: number;
  prompt: string;
}

/** The four premise facts and where a reader expects them. */
export const PLOT_ANCHORS: readonly PlotAnchor[] = [
  { id: "protagonist", label: "Protagonist", at: 0, prompt: "Introduce the protagonist in motion, in their ordinary world." },
  { id: "goal", label: "Goal", at: 10, prompt: "Name what the protagonist wants; the incident that sets it moving lands here." },
  { id: "conflict", label: "Conflict", at: 50, prompt: "The opposing force shows its full strength and changes what the story is about." },
  { id: "stakes", label: "Stakes", at: 75, prompt: "The cost of failing is made concrete; the final push begins." },
];

export interface PlotPoint {
  index: number;
  beat: string;
  at: number;
  summary: string;
  /** Set when one of the premise facts is anchored to this beat. */
  anchor: string | null;
  text: string;
}

export interface PlotPlan {
  structure: { id: StructureId; name: string };
  logline: string;
  points: PlotPoint[];
  output: string;
  checks: string[];
  stats: { beats: number; anchored: number; filled: number; words: number };
}

export interface PremiseInput {
  logline?: string;
  protagonist?: string;
  goal?: string;
  conflict?: string;
  stakes?: string;
  structure?: string;
}

const clean = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Map the premise onto the structure's beats and check what is missing. */
export function planPlot(input: PremiseInput = {}): PlotPlan {
  const structure = findStructure((input.structure as StructureId) ?? "three-act");
  const logline = clean(input.logline ?? "");

  const facts: Record<string, string> = {
    protagonist: clean(input.protagonist ?? ""),
    goal: clean(input.goal ?? ""),
    conflict: clean(input.conflict ?? ""),
    stakes: clean(input.stakes ?? ""),
  };

  // Nearest beat to each anchor's percentage, kept distinct.
  const taken = new Set<number>();
  const anchorFor = new Map<number, PlotAnchor>();
  for (const anchor of PLOT_ANCHORS) {
    let best = -1;
    let bestDistance = Number.POSITIVE_INFINITY;
    structure.beats.forEach((beat, index) => {
      if (taken.has(index)) return;
      const distance = Math.abs(beat.at - anchor.at);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    if (best >= 0) {
      taken.add(best);
      anchorFor.set(best, anchor);
    }
  }

  const points: PlotPoint[] = structure.beats.map((beat, index) => {
    const anchor = anchorFor.get(index) ?? null;
    return {
      index,
      beat: beat.name,
      at: beat.at,
      summary: beat.summary,
      anchor: anchor?.id ?? null,
      text: anchor ? facts[anchor.id] : "",
    };
  });

  const output = [
    `${structure.name}${logline ? ` — ${logline}` : ""}`,
    "",
    ...points.map((point) =>
      [
        `${point.index + 1}. ${point.beat} (${point.at}%)`,
        point.text ? `   ${point.text}` : `   ${point.anchor ? `(to decide: ${point.summary})` : `(to draft) ${point.summary}`}`,
      ].join("\n"),
    ),
  ].join("\n");

  const checks: string[] = [];
  if (!logline) {
    checks.push("No logline; a plan needs one sentence for every beat to answer to.");
  } else if (words(logline).length < 8) {
    checks.push(`The logline is ${words(logline).length} words; under eight it states a topic rather than a story.`);
  }
  if (!facts.protagonist) checks.push("No protagonist; a structure is a shape for someone's story.");
  if (!facts.goal) {
    checks.push("No goal; without something wanted, the inciting incident has nothing to incite.");
  }
  if (!facts.conflict) {
    checks.push("No conflict; a difficulty the protagonist could walk away from is not an opposing force.");
  } else if (words(facts.conflict).length < 4) {
    const count = words(facts.conflict).length;
    checks.push(`The conflict is ${count} word${count === 1 ? "" : "s"}; name the force that pushes back, not just the trouble.`);
  }
  if (!facts.stakes) {
    checks.push("No stakes; the second turning point needs a cost the reader can measure.");
  }

  return {
    structure: { id: structure.id, name: structure.name },
    logline,
    points,
    output,
    checks,
    stats: {
      beats: structure.beats.length,
      anchored: PLOT_ANCHORS.length,
      filled: points.filter((point) => point.text).length,
      words: words([logline, ...Object.values(facts)].join(" ")).length,
    },
  };
}
