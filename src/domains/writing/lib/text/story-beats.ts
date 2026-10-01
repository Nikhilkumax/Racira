/**
 * Story beat builder: track which beats of a chosen structure are drafted.
 *
 * Where the plot point mapper attaches a note to every beat, this tool is a
 * progress board: mark beats done and it reports how far through the structure
 * the draft has reached and which beat comes next in placement order.
 */
import { findStructure, type StructureId } from "./story-structure.ts";

export interface BeatRow {
  name: string;
  at: number;
  summary: string;
  done: boolean;
}

export interface BeatProgress {
  done: number;
  total: number;
  percent: number;
  next?: BeatRow;
}

/** Beats with their done flags, in the structure's own order. */
export function beatRows(structureId: StructureId, done: string[] = []): BeatRow[] {
  const marked = new Set(done.map((name) => name.trim().toLowerCase()));
  return findStructure(structureId).beats.map((beat) => ({
    name: beat.name,
    at: beat.at,
    summary: beat.summary,
    done: marked.has(beat.name.toLowerCase()),
  }));
}

export function beatProgress(rows: BeatRow[]): BeatProgress {
  const total = rows.length;
  const done = rows.filter((row) => row.done).length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    next: rows.find((row) => !row.done),
  };
}

/** A copyable progress sheet. */
export function beatReport(structureId: StructureId, done: string[]): string {
  const rows = beatRows(structureId, done);
  const progress = beatProgress(rows);
  const structure = findStructure(structureId);
  return [
    `${structure.name} — ${progress.done}/${progress.total} beats drafted (${progress.percent}%)`,
    progress.next ? `Next: ${progress.next.name} at ${progress.next.at}%` : "All beats drafted.",
    "",
    ...rows.map((row) => `${row.done ? "[x]" : "[ ]"} ${row.name} (${row.at}%) — ${row.summary}`),
  ].join("\n");
}
