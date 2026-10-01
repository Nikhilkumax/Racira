/**
 * Manuscript formatter: the mechanical typographic clean-up a submission
 * expects, applied to typed text in the browser.
 *
 * It converts straight quotes to curly ones, turns a spaced double hyphen into
 * an em dash and three dots into an ellipsis, normalises scene breaks to a
 * centred `* * *`, and can prepend a title page. It also reports the counts an
 * agent asks for: words, chapters, scene breaks and paragraphs.
 *
 * This is text in, text out. It does not produce a .docx, set fonts or margins,
 * and it never reflows the author's words — every change is a substitution the
 * tool names on its page.
 */
import { wordTokens } from "./tokenize.ts";

export interface ManuscriptOptions {
  title?: string;
  author?: string;
  contact?: string;
  titlePage?: boolean;
}

export interface ManuscriptStats {
  words: number;
  characters: number;
  chapters: number;
  sceneBreaks: number;
  paragraphs: number;
  sentences: number;
}

export interface ManuscriptResult {
  text: string;
  stats: ManuscriptStats;
  /** What the smartening pass changed, so nothing is silent. */
  changes: { smartQuotes: number; emDashes: number; ellipses: number; sceneBreaks: number };
}

/** Straight quotes to curly, double hyphens to em dashes, dots to an ellipsis. */
export function smartenText(text: string): { text: string; changes: ManuscriptResult["changes"] } {
  const changes = { smartQuotes: 0, emDashes: 0, ellipses: 0, sceneBreaks: 0 };

  let out = text;

  // Triple dots to a single ellipsis character.
  out = out.replace(/\.\.\./g, () => {
    changes.ellipses += 1;
    return "\u2026";
  });

  // A double hyphen with surrounding spaces becomes an em dash, unspaced.
  out = out.replace(/\s*--\s*/g, () => {
    changes.emDashes += 1;
    return "\u2014";
  });

  // Double quotes: opening after whitespace or the start, closing otherwise.
  out = out.replace(/"/g, (_match, offset: number, whole: string) => {
    changes.smartQuotes += 1;
    const before = offset === 0 ? " " : whole[offset - 1];
    return /[\s([{\u2018\u201c-]/.test(before) ? "\u201c" : "\u201d";
  });

  // Single quotes: an apostrophe between letters, otherwise an opening or
  // closing single quote by the same rule as doubles.
  out = out.replace(/'/g, (_match, offset: number, whole: string) => {
    const before = offset === 0 ? " " : whole[offset - 1];
    const after = whole[offset + 1] ?? " ";
    if (/[\p{L}\p{N}]/u.test(before) && /[\p{L}\p{N}]/u.test(after)) return "\u2019";
    changes.smartQuotes += 1;
    return /[\s([{-]/.test(before) ? "\u2018" : "\u2019";
  });

  return { text: out, changes };
}

const SCENE_BREAK = /^\s*(?:\*\s*\*\s*\*|\*{1,3}|#{1,3}|-{3,})\s*$/;

/** Apply the formatter's substitutions and gather the submission counts. */
export function formatManuscript(input: string, options: ManuscriptOptions = {}): ManuscriptResult {
  const normalised = input.replace(/\r\n?/g, "\n").trim();
  const { text: smart, changes } = smartenText(normalised);

  const lines = smart.split("\n").map((line) => {
    if (!SCENE_BREAK.test(line) || line.trim() === "") return line;
    changes.sceneBreaks += 1;
    return "* * *";
  });

  const body = lines.join("\n");
  const counts = manuscriptStats(body);
  const words = options.titlePage
    ? `${[options.title?.trim(), options.author ? `by ${options.author.trim()}` : "", options.contact?.trim()].filter(Boolean).join("\n")}\n\n`
    : "";

  return { text: `${words}${body}`, stats: counts, changes };
}

/** The counts a submission asks for, from a formatted manuscript. */
export function manuscriptStats(text: string): ManuscriptStats {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const chapters = lines.filter((line) => /^\s*chapter\b/i.test(line)).length;
  const sceneBreaks = lines.filter((line) => line.trim() === "* * *").length;
  const paragraphs = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean).length;
  const sentences = (text.match(/[^.!?\u2026]+[.!?\u2026]+/g) ?? []).length;
  return {
    words: wordTokens(text).length,
    characters: text.length,
    chapters,
    sceneBreaks,
    paragraphs,
    sentences,
  };
}

/** What standard manuscript format asks for, shown as a checklist. */
export function manuscriptChecklist(): { item: string; note: string }[] {
  return [
    { item: "Title page", note: "title, author name and contact details, on its own page." },
    { item: "Chapter openings", note: "each chapter starts on a new page, with its heading." },
    { item: "Scene breaks", note: "a centred * * * on its own line, never a bare blank line." },
    { item: "Curly quotes and dashes", note: "typographic quotes and em dashes, not straight marks." },
    { item: "Word count", note: "the whole manuscript, rounded to the nearest thousand for a query." },
  ];
}
