/**
 * Writing portfolio builder: one line per piece, grouped into sections by
 * genre, ordered newest first, with the selection trimmed and the gaps named.
 *
 * A portfolio is an argument about range and reliability, and the two failures
 * are visible from the list alone: everything in one genre, or nothing recent.
 * The builder groups the pieces, orders them by year, caps the selection at a
 * size an editor will actually read, and writes the per-genre section headings
 * and an About scaffold from the writer's own positioning line.
 *
 * Line format is `Title | Genre | Where it appeared | Year`, with the middle
 * two optional. A title with no year still appears in its genre, at the end of
 * the section, flagged — the ordering problem is the writer's to fix, not the
 * tool's to hide.
 */

export interface PortfolioPiece {
  title: string;
  genre: string;
  outlet: string;
  year: number | null;
  words: number;
}

export interface PortfolioGroup {
  genre: string;
  label: string;
  pieces: PortfolioPiece[];
}

export interface PortfolioPlan {
  groups: PortfolioGroup[];
  selected: PortfolioPiece[];
  output: string;
  scaffold: string;
  counts: {
    total: number;
    genres: number;
    dated: number;
    placed: number;
    selected: number;
    mostRecent: number | null;
  };
  checks: string[];
}

/** Target size for a reading portfolio. */
export const PORTFOLIO_TARGET = 10;
/** Below this many pieces the portfolio reads as a sample rather than a body of work. */
export const PORTFOLIO_MINIMUM = 6;
/** Pieces older than this many years stop counting as recent work. */
export const RECENT_YEARS = 3;

const titleCase = (value: string): string =>
  value
    .split(/\s+/)
    .map((word) => (word.length > 2 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");

/** Parse the piece lines, group and order them, then check the list. */
export function buildPortfolio(
  input: { name?: string; positioning?: string; pieces?: string },
  options: { currentYear?: number } = {},
): PortfolioPlan {
  const name = (input.name ?? "").trim();
  const positioning = (input.positioning ?? "").trim().replace(/\s+/g, " ");
  const currentYear = options.currentYear ?? new Date().getFullYear();

  const lines = (input.pieces ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const pieces: PortfolioPiece[] = lines.map((line) => {
    const [rawTitle = "", rawGenre = "", rawOutlet = "", rawYear = ""] = line.split(/\s*\|\s*/);
    const yearMatch = (rawYear.match(/\b(19\d{2}|20\d{2})\b/) ?? rawOutlet.match(/\b(19\d{2}|20\d{2})\b/))?.[1];
    const outlet = /\bhttps?:\/\//i.test(rawOutlet) || /\.(com|org|net|io|co)\b/i.test(rawOutlet) ? rawOutlet.replace(/\s*\b(19\d{2}|20\d{2})\b\s*$/, "").trim() : rawOutlet;
    return {
      title: rawTitle.trim(),
      genre: rawGenre.trim().toLowerCase(),
      outlet: outlet.trim(),
      year: yearMatch ? Number(yearMatch) : null,
      words: (rawTitle.match(/[\p{L}\p{N}]+/gu) ?? []).length,
    };
  });

  const genreNames = [...new Set(pieces.map((piece) => piece.genre))].sort((a, b) => a.localeCompare(b));
  const groups: PortfolioGroup[] = genreNames.map((genre) => ({
    genre,
    label: genre ? titleCase(genre) : "Uncategorised",
    pieces:
      pieces
        .filter((piece) => piece.genre === genre)
        .sort((a, b) => (b.year ?? -1) - (a.year ?? -1) || a.title.localeCompare(b.title)),
  }));

  // Selection: newest piece from each genre first, then the rest by year.
  const byRecency = [...pieces].sort((a, b) => (b.year ?? -1) - (a.year ?? -1) || a.title.localeCompare(b.title));
  const firstOfEachGenre = groups.map((group) => group.pieces[0]).filter((piece): piece is PortfolioPiece => Boolean(piece));
  const selected: PortfolioPiece[] = [];
  for (const piece of [...firstOfEachGenre, ...byRecency]) {
    if (selected.length >= PORTFOLIO_TARGET) break;
    if (!selected.includes(piece)) selected.push(piece);
  }

  const dated = pieces.filter((piece) => piece.year !== null);
  const mostRecent = dated.length > 0 ? Math.max(...dated.map((piece) => piece.year ?? 0)) : null;
  const placed = pieces.filter((piece) => piece.outlet.length > 0).length;

  const output = [
    name ? `Portfolio of ${name}` : "Writing portfolio",
    positioning || "(positioning line not set)",
    "",
    ...groups.map((group) =>
      [
        `${group.label} (${group.pieces.length})`,
        ...group.pieces.map((piece) =>
          `  - ${piece.title}${piece.year ? ` (${piece.year})` : " (year not set)"}${piece.outlet ? ` — ${piece.outlet}` : ""}`,
        ),
      ].join("\n"),
    ),
    "",
    `Selected clips: ${selected.length} of ${pieces.length}`,
  ].join("\n\n");

  const scaffold = [
    name ? `${name} writes:` : "(your name) writes:",
    ...(genreNames.length > 0 ? [`  ${genreNames.map((genre) => titleCase(genre)).join(", ")}`] : []),
    positioning ? `  ${positioning}` : "  (one line on what you write and for whom)",
    "",
    "About paragraph, in three sentences:",
    "  1. What you cover, in the words your readers use for it.",
    "  2. Two pieces that show it, named rather than described.",
    "  3. Where your work has appeared, and what you are writing next.",
  ].join("\n");

  const checks: string[] = [];
  if (pieces.length === 0) {
    checks.push("No pieces yet. Paste one per line as Title | Genre | Where it appeared | Year.");
  } else if (pieces.length < PORTFOLIO_MINIMUM) {
    checks.push(`${pieces.length} piece${pieces.length === 1 ? "" : "s"} is thin for a working portfolio; six to ten shows range without asking for a long read.`);
  }
  const undated = pieces.filter((piece) => piece.year === null);
  if (undated.length > 0) {
    checks.push(`${undated.length} piece${undated.length === 1 ? " has" : "s have"} no year: ${undated.map((piece) => piece.title || "(untitled)").join(", ")} — without a year the order is a guess.`);
  }
  if (mostRecent !== null && currentYear - mostRecent > RECENT_YEARS) {
    checks.push(`The most recent piece is from ${mostRecent}; add recent work or a work in progress, or the portfolio reads as a closed chapter.`);
  }
  if (genreNames.length === 1 && pieces.length > 1) {
    checks.push(`Every piece sits under “${genreNames[0] || "uncategorised"}”; one genre shows no range — add another category or split the portfolio by audience.`);
  }
  if (genreNames.length > 1 && genreNames.some((genre) => groups.find((group) => group.genre === genre)?.pieces.length === 1) && groups.filter((group) => group.pieces.length >= 2).length === 0) {
    checks.push("Every genre has exactly one piece; a portfolio reads as range when at least one category carries two or more.");
  }
  if (placed === 0 && pieces.length > 0) {
    checks.push("No piece lists where it appeared; unpublished work needs a context line — course, competition or personal project.");
  }
  const vagueTitles = pieces.filter((piece) => piece.words > 0 && piece.words < 3);
  if (vagueTitles.length > 0) {
    checks.push(`${vagueTitles.length} title${vagueTitles.length === 1 ? " is" : "s are"} under three words (${vagueTitles.map((piece) => piece.title).join(", ")}): an editor scanning a list needs to know what each piece is about.`);
  }
  if (pieces.length > PORTFOLIO_TARGET * 2) {
    checks.push(`${pieces.length} pieces is a full archive; the selection above trims to ${PORTFOLIO_TARGET}, so keep the rest in a secondary list.`);
  }

  return {
    groups,
    selected,
    output,
    scaffold,
    counts: {
      total: pieces.length,
      genres: genreNames.length,
      dated: dated.length,
      placed,
      selected: selected.length,
      mostRecent,
    },
    checks,
  };
}
