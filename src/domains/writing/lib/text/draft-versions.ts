/**
 * Draft versioning: keep labelled snapshots of a draft in the browser, and see
 * how the word count moved from one to the next. Comparison reuses the document
 * diff engine, so "what changed between draft two and draft three" is the same
 * calculation as the diff viewer's.
 *
 * There is no server and no history beyond this tab: a version is a label and
 * the text you saved under it.
 */
import { diffStats } from "./doc-diff.ts";
import { wordTokens } from "./tokenize.ts";

export interface DraftVersion {
  label: string;
  text: string;
  words: number;
}

export function makeVersion(label: string, text: string): DraftVersion {
  return { label: label.trim() || "Untitled draft", text, words: wordTokens(text).length };
}

export interface TimelineRow {
  label: string;
  words: number;
  /** Words gained or lost against the previous version. */
  delta: number;
}

/** Word counts with the change against the previous version. */
export function versionTimeline(versions: DraftVersion[]): TimelineRow[] {
  let previous: number | null = null;
  return versions.map((version) => {
    const delta = previous === null ? 0 : version.words - previous;
    previous = version.words;
    return { label: version.label, words: version.words, delta };
  });
}

export interface VersionDelta {
  from: string;
  to: string;
  addedWords: number;
  removedWords: number;
  similarity: number;
  wordDelta: number;
}

/** How two saved versions differ, using the same word diff as the viewer. */
export function compareVersions(a: DraftVersion, b: DraftVersion): VersionDelta {
  const stats = diffStats(a.text, b.text);
  return {
    from: a.label,
    to: b.label,
    addedWords: stats.addedWords,
    removedWords: stats.removedWords,
    similarity: stats.similarity,
    wordDelta: b.words - a.words,
  };
}

/** The running total across every adjacent pair of versions. */
export function versionsReport(versions: DraftVersion[]): string {
  const timeline = versionTimeline(versions);
  const lines = [
    `Draft versions — ${versions.length} saved`,
    "",
    ...timeline.map((row, index) => `${index + 1}. ${row.label}: ${row.words} words${index === 0 ? "" : ` (${row.delta >= 0 ? "+" : ""}${row.delta})`}`),
  ];
  if (versions.length >= 2) {
    const delta = compareVersions(versions[versions.length - 2], versions[versions.length - 1]);
    lines.push(
      "",
      `Latest change (${delta.from} → ${delta.to}): +${delta.addedWords} / -${delta.removedWords} words, ${(delta.similarity * 100).toFixed(1)}% unchanged.`,
    );
  }
  return lines.join("\n");
}
