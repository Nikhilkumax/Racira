/**
 * Newspaper citation helpers: one newspaper article, quoted in APA 7, MLA 9 and
 * Chicago 17 — the three editions the citation engine implements for a
 * newspaper source.
 *
 * A newspaper entry turns on the things a book entry does not: the byline, the
 * publication date with its day and month, the paper's own name, and whether the
 * article was read in print or online. This module fixes the source type, so the
 * field set is always the newspaper field set, and reports the fields each style
 * expects but the entry does not have. Nothing is looked up and the date is
 * printed exactly as entered, because date order differs by style and locale.
 */
import { CITATION_STYLES, formatCitation, type CitationFields, type CitationStyle } from "./citation.ts";

export const NEWSPAPER_STYLES: CitationStyle[] = ["apa7", "mla9", "chicago17"];

export interface NewspaperResult {
  style: CitationStyle;
  styleLabel: string;
  short: string;
  entry: string;
  inText: string;
  warnings: string[];
  unsupported: boolean;
}

/**
 * MLA and Chicago print the whole publication date, so a Date entry of just the
 * month and day ("May 5") gets the year appended for them; APA already has its
 * own year slot, so it keeps the date as entered.
 */
function withYear(date: string | undefined, year: string | undefined): string {
  const day = (date ?? "").trim();
  const stamp = (year ?? "").trim();
  if (!day) return stamp;
  if (!stamp || day.includes(stamp)) return day;
  return `${day}, ${stamp}`;
}

/** One newspaper article in one style, with the source type pinned. */
export function newspaperCitation(fields: CitationFields, style: CitationStyle): NewspaperResult {
  const date = style === "apa7" ? fields.date ?? "" : withYear(fields.date, fields.year);
  const result = formatCitation({ ...fields, sourceType: "newspaper-article", date }, style);
  const generic = result.warnings.filter(
    (warning) => !warning.startsWith("No year or date") && !warning.startsWith("No URL"),
  );
  return {
    style,
    styleLabel: result.styleLabel,
    short: CITATION_STYLES.find((entry) => entry.id === style)?.short ?? style,
    entry: result.bibliography,
    inText: result.inText,
    warnings: [...new Set([...newspaperWarnings(fields), ...generic])],
    unsupported: result.unsupported,
  };
}

/** The same article in every style the engine supports for a newspaper. */
export function newspaperAllStyles(fields: CitationFields): NewspaperResult[] {
  return NEWSPAPER_STYLES.map((style) => newspaperCitation(fields, style));
}

/** Fields a newspaper entry needs that the shared engine does not check. */
export function newspaperWarnings(fields: CitationFields): string[] {
  const warnings: string[] = [];
  if (!fields.container?.trim()) {
    warnings.push("No newspaper name: every style names the publication for a newspaper article.");
  }
  if (!fields.date?.trim() && !fields.year?.trim()) {
    warnings.push("No date: a newspaper article is dated to the day, not just the year.");
  }
  if (!fields.doi && !fields.url) {
    warnings.push("No URL: add the article's web address when you read it online, or note that it is a print article.");
  }
  if (!fields.pages?.trim() && !fields.url?.trim()) {
    warnings.push("No page: a print newspaper article is located by its page, an online one by its URL.");
  }
  return warnings;
}

export interface NewspaperFieldRow {
  field: string;
  apa: string;
  mla: string;
  chicago: string;
}

/** What each style expects of a newspaper entry, shown as a checklist. */
export function newspaperChecklist(): NewspaperFieldRow[] {
  return [
    { field: "Byline", apa: "last name, initials", mla: "first author inverted, the rest natural order", chicago: "first author inverted, the rest natural order" },
    { field: "Headline", apa: "sentence case, no quotation marks", mla: "headline style, in quotation marks", chicago: "headline style, in quotation marks" },
    { field: "Newspaper", apa: "italic, no city unless it is the paper's name", mla: "italic", chicago: "italic" },
    { field: "Date", apa: "year, then month and day in parentheses", mla: "the full date, day-month-year as entered", chicago: "the full date, as entered" },
    { field: "Location", apa: "URL for an online article", mla: "URL, or the page range for print", chicago: "URL, or the page for print" },
  ];
}

/** A one-line summary of the entry for the copy/download report. */
export function newspaperReport(fields: CitationFields): string {
  const rows = newspaperAllStyles(fields);
  return [
    `Newspaper citation — ${fields.title.trim() || "(untitled article)"}`,
    "",
    ...rows.flatMap((row) => [`${row.styleLabel}`, `  ${row.entry || "(no entry)"}`, `  in-text: ${row.inText}`, ""]),
  ].join("\n");
}
