/**
 * Document comparison for the document diff viewer.
 *
 * Built on the project's existing `diff` dependency (jsdiff). Two views are
 * produced from a pair of texts: a line diff that keeps track of which line of
 * each version a row came from, and a word diff that shows the changed runs
 * inside otherwise identical text. A stats summary counts added, removed and
 * unchanged words, and a unified patch gives the familiar +/- form.
 *
 * Everything is computed locally and synchronously; nothing is uploaded.
 */
import { createTwoFilesPatch, diffLines, diffWords } from "diff";
import { wordTokens } from "./tokenize.ts";

export type DiffKind = "same" | "added" | "removed";

export interface DiffRow {
  kind: DiffKind;
  text: string;
  /** 1-based line in the old text, or null for an added row. */
  oldLine: number | null;
  /** 1-based line in the new text, or null for a removed row. */
  newLine: number | null;
}

/** Split a jsdiff chunk into whole lines, dropping the trailing empty piece. */
function chunkLines(value: string): string[] {
  const lines = value.split("\n");
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

/** A line-by-line diff, each row carrying its old and new line numbers. */
export function lineDiff(oldText: string, newText: string): DiffRow[] {
  const rows: DiffRow[] = [];
  let oldLine = 1;
  let newLine = 1;
  for (const part of diffLines(oldText, newText)) {
    for (const text of chunkLines(part.value)) {
      if (part.added) rows.push({ kind: "added", text, oldLine: null, newLine: newLine++ });
      else if (part.removed) rows.push({ kind: "removed", text, oldLine: oldLine++, newLine: null });
      else rows.push({ kind: "same", text, oldLine: oldLine++, newLine: newLine++ });
    }
  }
  return rows;
}

/** A word-level diff for a fine-grained read of what changed. */
export function wordDiff(oldText: string, newText: string): DiffRow[] {
  const rows: DiffRow[] = [];
  for (const part of diffWords(oldText, newText)) {
    if (!part.value) continue;
    rows.push({ kind: part.added ? "added" : part.removed ? "removed" : "same", text: part.value, oldLine: null, newLine: null });
  }
  return rows;
}

export interface DiffStats {
  addedWords: number;
  removedWords: number;
  sameWords: number;
  addedLines: number;
  removedLines: number;
  changedLines: number;
  /** 0..1: unchanged words as a share of the two texts' words. */
  similarity: number;
}

/** Word and line counts describing how far apart the two texts are. */
export function diffStats(oldText: string, newText: string): DiffStats {
  let addedWords = 0;
  let removedWords = 0;
  let sameWords = 0;
  for (const part of diffWords(oldText, newText)) {
    const count = wordTokens(part.value).length;
    if (part.added) addedWords += count;
    else if (part.removed) removedWords += count;
    else sameWords += count;
  }

  let addedLines = 0;
  let removedLines = 0;
  for (const part of diffLines(oldText, newText)) {
    const count = chunkLines(part.value).length;
    if (part.added) addedLines += count;
    else if (part.removed) removedLines += count;
  }

  const total = sameWords + addedWords + removedWords;
  const similarity = total === 0 ? 1 : sameWords / total;
  return {
    addedWords,
    removedWords,
    sameWords,
    addedLines,
    removedLines,
    changedLines: addedLines + removedLines,
    similarity,
  };
}

/** A unified patch (context lines, @@ hunks) between the two texts. */
export function unifiedDiff(oldText: string, newText: string, context = 3): string {
  return createTwoFilesPatch("original", "revised", oldText, newText, "", "", { context });
}

/** A copyable report: the stats, then the unified patch. */
export function diffReport(oldText: string, newText: string): string {
  const stats = diffStats(oldText, newText);
  return [
    "Document diff",
    `+${stats.addedLines} / -${stats.removedLines} lines · ${stats.addedWords} added words, ${stats.removedWords} removed · ${(stats.similarity * 100).toFixed(1)}% unchanged`,
    "",
    unifiedDiff(oldText, newText),
  ].join("\n");
}
