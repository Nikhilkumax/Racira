/**
 * Author profile writer: assemble a publication-facing profile from a genre, a
 * work list, themes, influences and a short note, with structural checks.
 *
 * A profile is a list of facts a reader can act on — a genre, titles with years,
 * themes — so the engine assembles exactly those and prompts for the year, the
 * missing work list and the first-person slip it cannot fix itself.
 */
import { words } from "./tokenize.ts";

export interface AuthorProfileInput {
  name: string;
  genre: string;
  /** One per line: Title | Year */
  works: string[];
  /** One theme per line. */
  themes: string[];
  influences: string;
  note: string;
  website: string;
}

export interface WorkEntry {
  title: string;
  year: string;
  complete: boolean;
}

export interface AuthorProfileCheck {
  id: string;
  message: string;
}

export interface AuthorProfileDraft {
  profile: string;
  words: number;
  works: WorkEntry[];
  checks: AuthorProfileCheck[];
}

const clean = (line: string): string => line.trim().replace(/\s+/g, " ");

export function parseWorks(lines: string[]): WorkEntry[] {
  return lines
    .map(clean)
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map(clean);
      return {
        title: parts[0] ?? "",
        year: parts[1] ?? "",
        complete: Boolean(parts[0]) && Boolean(parts[1]),
      };
    });
}

export function buildAuthorProfile(input: AuthorProfileInput): AuthorProfileDraft {
  const name = clean(input.name);
  const genre = clean(input.genre);
  const works = parseWorks(input.works);
  const themes = input.themes.map(clean).filter(Boolean);
  const influences = clean(input.influences);
  const note = clean(input.note);
  const website = clean(input.website);

  const blocks: string[] = [];
  if (name || genre) {
    blocks.push(`${name || "This author"} ${genre ? `writes ${genre}` : "writes"}.`);
  }
  if (works.length > 0) {
    blocks.push(`Selected works\n${works.map((work) => `- ${work.title}${work.year ? ` (${work.year})` : ""}`).join("\n")}`);
  }
  if (themes.length > 0) {
    blocks.push(`Themes\n${themes.map((theme) => `- ${theme}`).join("\n")}`);
  }
  if (influences) blocks.push(`Influences\n${influences}`);
  if (note) blocks.push(note);
  if (website) blocks.push(website);

  const profile = blocks.join("\n\n");

  const checks: AuthorProfileCheck[] = [];
  if (!name) checks.push({ id: "name", message: "Add the author's name; the profile is for a byline." });
  if (!genre) checks.push({ id: "genre", message: "Name the genre or the kind of writing, rather than leaving the first line generic." });
  if (works.length === 0) {
    checks.push({ id: "works", message: "List at least one work; a profile without a title is an introduction, not a profile." });
  }
  for (const work of works.filter((entry) => !entry.complete)) {
    checks.push({ id: "work-year", message: `Add the year to "${work.title || "a title"}"; readers use it to place the work.` });
  }
  if (themes.length === 0) {
    checks.push({ id: "themes", message: "Name two or three themes; they tell a reader what the work is about beneath the plot." });
  }
  if (themes.length > 5) {
    checks.push({ id: "themes-many", message: `${themes.length} themes is a list, not a description; keep three to five.` });
  }
  if (!influences) {
    checks.push({ id: "influences", message: "Name an influence or two, so the profile says where the writing comes from." });
  }
  if (!note) {
    checks.push({ id: "note", message: "Add a short note in your own words; the facts above cannot carry the voice." });
  } else if (/\b(I|my|me)\b/.test(note)) {
    checks.push({ id: "first-person", message: "A third-person profile slips here: rewrite the first-person note." });
  }

  return { profile, words: words(profile).length, works, checks };
}
