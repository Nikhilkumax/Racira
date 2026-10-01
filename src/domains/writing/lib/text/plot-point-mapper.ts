/**
 * Plot point mapper: take a named structure — three-act, four-act, Save the Cat
 * or the hero's journey — and map your story's own events onto its beats.
 *
 * Each beat gets a note, and the map reports how much of the structure is
 * covered and which beats are still blank. The structure itself lives in
 * `story-structure.ts`, so the mapper and the beat builder share one reference.
 */
import { STRUCTURES, findStructure, type Beat, type StructureId } from "./story-structure.ts";

export interface MappedPoint {
  beat: Beat;
  note: string;
  filled: boolean;
}

export interface PlotMap {
  structureId: StructureId;
  structureName: string;
  points: MappedPoint[];
  filled: number;
  total: number;
  coverage: number;
  /** The earliest beat that still has no note. */
  nextOpen?: Beat;
}

/** Build the map for a structure from a set of `beat name -> note` entries. */
export function buildPlotMap(structureId: StructureId, notes: Record<string, string> = {}): PlotMap {
  const structure = findStructure(structureId);
  const points: MappedPoint[] = structure.beats.map((beat) => {
    const note = (notes[beat.name] ?? "").trim();
    return { beat, note, filled: note.length > 0 };
  });
  const filled = points.filter((point) => point.filled).length;
  return {
    structureId,
    structureName: structure.name,
    points,
    filled,
    total: points.length,
    coverage: points.length === 0 ? 0 : Math.round((filled / points.length) * 100),
    nextOpen: points.find((point) => !point.filled)?.beat,
  };
}

/** Parse `Beat name: note` lines into the note map the mapper consumes. */
export function parsePlotNotes(text: string): Record<string, string> {
  const notes: Record<string, string> = {};
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) {
      notes[line] = "";
      continue;
    }
    const name = line.slice(0, colon).trim();
    const note = line.slice(colon + 1).trim();
    if (name) notes[name] = note;
  }
  return notes;
}

/** The map as a markdown document: every beat with its placement and note. */
export function plotMapMarkdown(map: PlotMap): string {
  const lines = [`# ${map.structureName}`, "", `${map.filled} of ${map.total} beats mapped (${map.coverage}%)`, ""];
  for (const point of map.points) {
    lines.push(`## ${point.beat.name} (${point.beat.at}%)`);
    lines.push(point.note || `_${point.beat.summary}_`);
    lines.push("");
  }
  return lines.join("\n").trim();
}

/** Every structure with its beat count, for the picker. */
export function structureOptions(): { id: StructureId; name: string; beats: number }[] {
  return STRUCTURES.map((structure) => ({ id: structure.id, name: structure.name, beats: structure.beats.length }));
}
