/**
 * Citation formatting: one typed-metadata engine for APA 7th edition (2020),
 * MLA 9th edition (2021), Chicago 17th edition notes-bibliography (2017) and
 * Bluebook 21st edition (2020).
 *
 * Every function takes typed fields — authors, year, title, container, volume,
 * issue, pages, publisher, place, edition, DOI, URL, accessed, reporter, court,
 * section — and returns plain text. Nothing is scraped, looked up or inferred:
 * there is no DOI resolver and no network call, so the field values are exactly
 * what the writer typed and every output can be checked against the manual's
 * own worked example. Titles are printed as entered, because correct title
 * capitalisation depends on the style, the language and proper nouns; the page
 * says so rather than mangling them.
 *
 * Documented simplifications, all stated on the tool page:
 *   - APA lists up to 20 authors; MLA uses et al. from three; Chicago lists up
 *     to three and uses et al. beyond; Bluebook case citations carry no authors;
 *   - page ranges use the style's own dash: en dash for APA and Chicago, hyphen
 *     for MLA;
 *   - italics are plain by default; an option wraps italicised elements in
 *     underscores for writers who want to keep the distinction in plain text;
 *   - Bluebook covers the case and statute patterns implemented here, not the
 *     whole rule set, and this module never claims a citation is correct.
 */
import { wordTokens } from "./tokenize.ts";

export type CitationStyle = "apa7" | "mla9" | "chicago17" | "bluebook21";

export type SourceType =
  | "book"
  | "chapter"
  | "journal-article"
  | "newspaper-article"
  | "website"
  | "report"
  | "case"
  | "statute";

export interface CitationAuthor {
  /** Family name, or the whole name for an organisation. */
  family: string;
  /** Given names, when the author is a person. */
  given?: string;
  /** Set for organisational authors: printed as written, no inversion. */
  literal?: boolean;
}

export interface CitationFields {
  sourceType: SourceType;
  authors: CitationAuthor[];
  editors?: CitationAuthor[];
  title: string;
  year?: string;
  /** Journal, newspaper, website name, or the book title for a chapter. */
  container?: string;
  publisher?: string;
  place?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  edition?: string;
  doi?: string;
  url?: string;
  /** Free text, printed as entered (e.g. "5 May 2026"). */
  accessed?: string;
  /** Publication date for newspapers and websites (e.g. "5 May 2026"). */
  date?: string;
  /** Notes and short forms use this (e.g. "45" or "45-47"). */
  pinpoint?: string;
  reportNumber?: string;
  // Legal fields
  reporter?: string;
  court?: string;
  docketNumber?: string;
  codeTitle?: string;
  section?: string;
}

export interface CitationResult {
  style: CitationStyle;
  styleLabel: string;
  sourceType: SourceType;
  bibliography: string;
  inText: string;
  /** Chicago and Bluebook note form; undefined for APA and MLA. */
  note?: string;
  /** Fields that were empty and changed the output. */
  warnings: string[];
  unsupported: boolean;
  unsupportedReason?: string;
}

export interface CitationOptions {
  /** Wrap italicised elements in underscores (default false: plain text). */
  italicMarkers?: boolean;
}

export const CITATION_STYLES: { id: CitationStyle; label: string; short: string }[] = [
  { id: "apa7", label: "APA 7th edition (2020)", short: "APA 7" },
  { id: "mla9", label: "MLA 9th edition (2021)", short: "MLA 9" },
  { id: "chicago17", label: "Chicago 17th edition, notes-bibliography (2017)", short: "Chicago 17" },
  { id: "bluebook21", label: "Bluebook 21st edition (2020)", short: "Bluebook 21" },
];

export const SOURCE_TYPES: { id: SourceType; label: string }[] = [
  { id: "book", label: "Book" },
  { id: "chapter", label: "Chapter in an edited book" },
  { id: "journal-article", label: "Journal article" },
  { id: "newspaper-article", label: "Newspaper article" },
  { id: "website", label: "Web page" },
  { id: "report", label: "Report" },
  { id: "case", label: "Court case" },
  { id: "statute", label: "Statute" },
];

/**
 * Which styles this engine implements for a source type. Legal material is
 * Bluebook only: the other styles' legal-citation rules are not implemented
 * here, and offering them would produce an empty entry.
 */
export function stylesFor(sourceType: SourceType): CitationStyle[] {
  if (sourceType === "case" || sourceType === "statute") return ["bluebook21"];
  return ["apa7", "mla9", "chicago17"];
}

const labelFor = (style: CitationStyle): string =>
  CITATION_STYLES.find((entry) => entry.id === style)?.label ?? style;

const EN_DASH = "\u2013";

/** Page ranges in the style's own dash. */
function pageRange(pages: string, style: CitationStyle): string {
  const styleDash = style === "mla9" ? "-" : EN_DASH;
  return pages.trim().replace(/\s*[-\u2013]\s*/g, styleDash);
}

// ── Author formatting ────────────────────────────────────────────────────────

const initials = (given: string): string =>
  given
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toLocaleUpperCase()}.`)
    .join(" ");

function apaAuthor(author: CitationAuthor): string {
  if (author.literal || !author.given) return author.family;
  return `${author.family}, ${initials(author.given)}`;
}

function invertedAuthor(author: CitationAuthor): string {
  if (author.literal || !author.given) return author.family;
  return `${author.family}, ${author.given}`;
}

function givenFirstAuthor(author: CitationAuthor): string {
  if (author.literal || !author.given) return author.family;
  return `${author.given} ${author.family}`;
}

function listWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

function apaAuthors(authors: CitationAuthor[]): string {
  const names = authors.map(apaAuthor);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]}, & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}

function mlaAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return "";
  const first = invertedAuthor(authors[0]);
  if (authors.length === 1) return first;
  if (authors.length === 2) return `${first}, and ${givenFirstAuthor(authors[1])}`;
  return `${first}, et al.`;
}

function chicagoAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return "";
  const first = invertedAuthor(authors[0]);
  if (authors.length === 1) return first;
  // Chicago's bibliography joins two authors with a comma and and, and three
  // with a serial comma before the last name.
  if (authors.length === 2) return `${first}, and ${givenFirstAuthor(authors[1])}`;
  if (authors.length === 3) {
    return `${first}, ${givenFirstAuthor(authors[1])}, and ${givenFirstAuthor(authors[2])}`;
  }
  return `${first} et al.`;
}

function chicagoNoteAuthors(authors: CitationAuthor[]): string {
  if (authors.length === 0) return "";
  if (authors.length <= 3) return listWithAnd(authors.map(givenFirstAuthor));
  return `${givenFirstAuthor(authors[0])} et al.`;
}

/** Parse a textarea of one author per line: "Family, Given" or a plain name. */
export function parseAuthorsInput(input: string): CitationAuthor[] {
  const out: CitationAuthor[] = [];
  for (const raw of input.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const comma = line.indexOf(",");
    if (comma === -1) out.push({ family: line, literal: true });
    else {
      const family = line.slice(0, comma).trim();
      const given = line.slice(comma + 1).trim();
      if (!family) continue;
      out.push(given ? { family, given } : { family, literal: true });
    }
  }
  return out;
}

/** The same parse, reversed for display: "Family, Given". */
export function formatAuthorInput(author: CitationAuthor): string {
  if (author.literal || !author.given) return author.family;
  return `${author.family}, ${author.given}`;
}

// ── Shared small pieces ──────────────────────────────────────────────────────

function italic(text: string, options: CitationOptions): string {
  if (!text) return "";
  return options.italicMarkers ? `_${text}_` : text;
}

function doiOrUrl(fields: CitationFields): string {
  if (fields.doi) {
    const clean = fields.doi.trim().replace(/^https?:\/\/doi\.org\//i, "");
    return `https://doi.org/${clean}`;
  }
  return fields.url?.trim() ?? "";
}

function warningsFor(fields: CitationFields, style: CitationStyle): string[] {
  const warnings: string[] = [];
  const legal = fields.sourceType === "case" || fields.sourceType === "statute";
  if (!legal && fields.authors.length === 0) warnings.push("No author: the entry starts with the title.");
  if (!fields.year && !fields.date) warnings.push("No year or date: n.d. is used where the style has a slot for it.");
  if (!fields.title.trim()) warnings.push("No title: the entry cannot be identified.");
  if (style === "apa7" && !fields.publisher && ["book", "chapter", "report"].includes(fields.sourceType)) {
    warnings.push("No publisher: APA expects one for this source type.");
  }
  if (!legal && !doiOrUrl(fields) && fields.sourceType === "website") {
    warnings.push("No URL: a web page cannot be located without one.");
  }
  return warnings;
}

// ── APA 7 ────────────────────────────────────────────────────────────────────

function apaBibliography(fields: CitationFields, options: CitationOptions): string {
  const authors = apaAuthors(fields.authors);
  const year = fields.year?.trim() || "n.d.";
  const lead = authors ? `${authors} ` : "";
  const title = fields.title.trim();
  const edition = fields.edition ? ` (${fields.edition} ed.)` : "";
  const link = doiOrUrl(fields);

  switch (fields.sourceType) {
    case "book":
      return `${lead}(${year}). ${italic(title, options)}${edition}. ${fields.publisher ?? ""}.`.replace(/\. \.$/, ".").trim();
    case "chapter": {
      const editors = fields.editors?.length
        ? ` In ${listWithAnd(fields.editors.map(invertedAuthor))} (Ed${fields.editors.length > 1 ? "s" : ""}.),`
        : " In";
      const pages = fields.pages ? ` (pp. ${pageRange(fields.pages, "apa7")})` : "";
      return `${lead}(${year}). ${title}.${editors} ${italic(fields.container ?? "", options)}${pages}. ${fields.publisher ?? ""}.`
        .replace(/\. \.$/, ".")
        .trim();
    }
    case "journal-article": {
      const volume = fields.volume ? `, ${fields.volume}` : "";
      const issue = fields.issue ? `(${fields.issue})` : "";
      const pages = fields.pages ? `, ${pageRange(fields.pages, "apa7")}` : "";
      const tail = link ? ` ${link}` : "";
      return `${lead}(${year}). ${title}. ${italic(fields.container ?? "", options)}${volume}${issue}${pages}.${tail}`.trim();
    }
    case "newspaper-article": {
      const date = fields.date ? `, ${fields.date}` : "";
      const tail = link ? ` ${link}` : "";
      return `${lead}(${year}${date}). ${title}. ${italic(fields.container ?? "", options)}.${tail}`.trim();
    }
    case "website": {
      const date = fields.date ? `, ${fields.date}` : "";
      const retrieved = fields.accessed ? `Retrieved ${fields.accessed}, from ` : "";
      return `${lead}(${year}${date}). ${italic(title, options)}. ${fields.container ?? ""}. ${retrieved}${link}`.replace(/\s+\./g, ".").trim();
    }
    case "report": {
      const number = fields.reportNumber ? ` (Report No. ${fields.reportNumber})` : "";
      const tail = link ? ` ${link}` : "";
      return `${lead}(${year}). ${italic(title, options)}${number}. ${fields.publisher ?? ""}.${tail}`.replace(/\. \.$/, ".").trim();
    }
    default:
      return "";
  }
}

function apaInText(fields: CitationFields): string {
  const names = fields.authors;
  const year = fields.year?.trim() || "n.d.";
  const pinpoint = fields.pinpoint ? `, p. ${fields.pinpoint}` : "";
  if (names.length === 0) return `("${fields.title.trim().slice(0, 25)}", ${year})`;
  const short =
    names.length === 1 ? names[0].family : names.length === 2 ? `${names[0].family} & ${names[1].family}` : `${names[0].family} et al.`;
  return `(${short}, ${year}${pinpoint})`;
}

// ── MLA 9 ────────────────────────────────────────────────────────────────────

function mlaBibliography(fields: CitationFields, options: CitationOptions): string {
  const authors = mlaAuthors(fields.authors);
  // An inverted name already ends in a full stop ("Smith, John A."), so the
  // joining period is added only when the name does not carry one.
  const lead = authors ? `${authors}${authors.endsWith(".") ? " " : ". "}` : "";
  const title = fields.title.trim();
  const year = fields.year?.trim() || "n.d.";
  const link = doiOrUrl(fields);

  switch (fields.sourceType) {
    case "book": {
      const edition = fields.edition ? `${fields.edition} ed., ` : "";
      return `${lead}${italic(title, options)}. ${edition}${fields.publisher ?? ""}, ${year}.`.replace(/\s+,/g, ",").trim();
    }
    case "chapter": {
      const pages = fields.pages ? `, pp. ${pageRange(fields.pages, "mla9")}` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}, ${fields.publisher ?? ""}, ${year}${pages}.`.trim();
    }
    case "journal-article": {
      const volume = fields.volume ? `, vol. ${fields.volume}` : "";
      const issue = fields.issue ? `, no. ${fields.issue}` : "";
      const pages = fields.pages ? `, pp. ${pageRange(fields.pages, "mla9")}` : "";
      const tail = link ? `, ${link}` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}${volume}${issue}, ${year}${pages}${tail}.`.trim();
    }
    case "newspaper-article": {
      const date = fields.date || year;
      const tail = link ? `, ${link}` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}, ${date}${tail}.`.trim();
    }
    case "website": {
      const date = fields.date || year;
      const accessed = fields.accessed ? ` Accessed ${fields.accessed}.` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}, ${date}, ${link}.${accessed}`.replace(/\s+\./g, ".").trim();
    }
    case "report": {
      const tail = link ? `, ${link}` : "";
      return `${lead}${italic(title, options)}. ${fields.publisher ?? ""}, ${year}${tail}.`.replace(/\s+,/g, ",").trim();
    }
    default:
      return "";
  }
}

function mlaInText(fields: CitationFields): string {
  const names = fields.authors;
  const page = fields.pinpoint ? ` ${fields.pinpoint}` : "";
  if (names.length === 0) return `("${fields.title.trim().slice(0, 25)}"${page})`;
  const short =
    names.length === 1 ? names[0].family : names.length === 2 ? `${names[0].family} and ${names[1].family}` : `${names[0].family} et al.`;
  return `(${short}${page})`;
}

// ── Chicago 17, notes-bibliography ───────────────────────────────────────────

function chicagoBibliography(fields: CitationFields, options: CitationOptions): string {
  const authors = chicagoAuthors(fields.authors);
  const lead = authors ? `${authors}${authors.endsWith(".") ? " " : ". "}` : "";
  const title = fields.title.trim();
  const year = fields.year?.trim() || "n.d.";
  const place = fields.place ? `${fields.place}: ` : "";
  const link = doiOrUrl(fields);

  switch (fields.sourceType) {
    case "book": {
      const edition = fields.edition ? `${fields.edition} ed. ` : "";
      return `${lead}${italic(title, options)}. ${edition}${place}${fields.publisher ?? ""}, ${year}.`.replace(/\s+,/g, ",").trim();
    }
    case "chapter": {
      const pages = fields.pages ? `, ${pageRange(fields.pages, "chicago17")}` : "";
      return `${lead}"${title}." In ${italic(fields.container ?? "", options)}${pages}, ${place}${fields.publisher ?? ""}, ${year}.`.trim();
    }
    case "journal-article": {
      const volume = fields.volume ? ` ${fields.volume}` : "";
      const issue = fields.issue ? `, no. ${fields.issue}` : "";
      const pages = fields.pages ? `: ${pageRange(fields.pages, "chicago17")}` : "";
      const tail = link ? ` ${link}.` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}${volume}${issue} (${year})${pages}.${tail}`.trim();
    }
    case "newspaper-article": {
      const date = fields.date ? `, ${fields.date}` : fields.year ? `, ${fields.year}` : "";
      const tail = link ? ` ${link}.` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}${date}.${tail}`.trim();
    }
    case "website": {
      const date = fields.date ? ` ${fields.date}` : fields.year ? ` ${fields.year}` : "";
      const accessed = fields.accessed ? ` Accessed ${fields.accessed}.` : "";
      return `${lead}"${title}." ${italic(fields.container ?? "", options)}.${date}. ${link}.${accessed}`.replace(/\s+\./g, ".").trim();
    }
    case "report": {
      const tail = link ? ` ${link}.` : "";
      return `${lead}${italic(title, options)}. ${place}${fields.publisher ?? ""}, ${year}.${tail}`.replace(/\s+,/g, ",").trim();
    }
    default:
      return "";
  }
}

function chicagoNote(fields: CitationFields, options: CitationOptions): string {
  const authors = chicagoNoteAuthors(fields.authors);
  const lead = authors ? `${authors}, ` : "";
  const title = fields.title.trim();
  const year = fields.year?.trim() || "n.d.";
  const place = fields.place ? `${fields.place}: ` : "";
  const pinpoint = fields.pinpoint ? `, ${fields.pinpoint}` : "";
  const link = doiOrUrl(fields);

  switch (fields.sourceType) {
    case "book": {
      const edition = fields.edition ? `, ${fields.edition} ed.` : "";
      return `${lead}${italic(title, options)}${edition} (${place}${fields.publisher ?? ""}, ${year})${pinpoint}.`.replace(/\s+,/g, ",").trim();
    }
    case "journal-article": {
      const volume = fields.volume ? ` ${fields.volume}` : "";
      const issue = fields.issue ? `, no. ${fields.issue}` : "";
      const pages = fields.pages ? `: ${pageRange(fields.pages, "chicago17")}` : "";
      const tail = link ? `, ${link}` : "";
      return `${lead}"${title}," ${italic(fields.container ?? "", options)}${volume}${issue} (${year})${pages}${pinpoint}${tail}.`.trim();
    }
    default: {
      const bibliography = chicagoBibliography(fields, options);
      return `${lead}${bibliography.replace(/\.$/, "")}${pinpoint}.`;
    }
  }
}

// ── Bluebook 21 ──────────────────────────────────────────────────────────────

function bluebookCitation(fields: CitationFields, options: CitationOptions): { bibliography: string; inText: string } {
  if (fields.sourceType === "case") {
    const volume = fields.volume ? `${fields.volume} ` : "";
    const reporter = fields.reporter ?? "";
    const firstPage = fields.pages ? `${pageRange(fields.pages, "bluebook21").split(/[-\u2013]/)[0]} ` : "";
    const court = fields.court ? `${fields.court} ` : "";
    const year = fields.year ? `${fields.year}` : "n.d.";
    const citation = `${italic(fields.title.trim(), options)}, ${volume}${reporter} ${firstPage}(${court}${year}).`.replace(/\s+/g, " ").replace(" (", " (");
    const short = fields.pinpoint
      ? `${italic(fields.title.trim().split(/\s+v\.?\s*/i)[0], options)}, ${volume}${reporter} at ${fields.pinpoint}.`
      : citation;
    return { bibliography: citation, inText: short };
  }
  if (fields.sourceType === "statute") {
    const title = fields.codeTitle ?? "";
    const section = fields.section ?? "";
    const year = fields.year ? ` (${fields.year})` : "";
    const citation = `${title} U.S.C. § ${section}${year}.`.replace(/\s+/g, " ");
    const short = fields.pinpoint ? `${title} U.S.C. § ${fields.pinpoint}.` : citation;
    return { bibliography: citation, inText: short };
  }
  return { bibliography: "", inText: "" };
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Format one source in one style. Bluebook covers cases and statutes only. */
export function formatCitation(
  fields: CitationFields,
  style: CitationStyle,
  options: CitationOptions = {},
): CitationResult {
  if (style === "bluebook21" && fields.sourceType !== "case" && fields.sourceType !== "statute") {
    return {
      style,
      styleLabel: labelFor(style),
      sourceType: fields.sourceType,
      bibliography: "",
      inText: "",
      warnings: [],
      unsupported: true,
      unsupportedReason:
        "Bluebook covers legal material. Its rules cover cases, statutes and other authorities; it does not provide a format for this source type.",
    };
  }

  if (style === "bluebook21") {
    const { bibliography, inText } = bluebookCitation(fields, options);
    return {
      style,
      styleLabel: labelFor(style),
      sourceType: fields.sourceType,
      bibliography,
      inText,
      note: `See ${bibliography}`,
      warnings: warningsFor(fields, style),
      unsupported: false,
    };
  }

  const bibliography =
    style === "apa7"
      ? apaBibliography(fields, options)
      : style === "mla9"
        ? mlaBibliography(fields, options)
        : chicagoBibliography(fields, options);
  const inText = style === "apa7" ? apaInText(fields) : style === "mla9" ? mlaInText(fields) : chicagoNote(fields, options);
  const note = style === "chicago17" ? chicagoNote(fields, options) : undefined;

  return {
    style,
    styleLabel: labelFor(style),
    sourceType: fields.sourceType,
    bibliography,
    inText,
    note,
    warnings: warningsFor(fields, style),
    unsupported: false,
  };
}

export interface BibliographyEntry {
  index: number;
  /** The string to sort by: the first author's family, or the title. */
  sortKey: string;
  formatted: CitationResult;
}

export interface BibliographyResult {
  entries: BibliographyEntry[];
  text: string;
  style: CitationStyle;
  styleLabel: string;
  /** True when the style groups and numbers rather than alphabetising. */
  numbered: boolean;
  /** Sorting note for the page. */
  note: string;
}

function sortKeyFor(fields: CitationFields): string {
  const first = fields.authors[0];
  if (first) return (first.family || first.given || "").toLocaleLowerCase();
  return fields.title.trim().toLocaleLowerCase();
}

/**
 * A bibliography or reference list: alphabetised for APA, MLA and Chicago, and
 * grouped cases-then-statutes for Bluebook (a simplified table of authorities).
 */
export function formatBibliography(
  list: CitationFields[],
  style: CitationStyle,
  options: CitationOptions & { numbered?: boolean } = {},
): BibliographyResult {
  const numbered = options.numbered ?? false;
  const entries: BibliographyEntry[] = list.map((fields, index) => ({
    index,
    sortKey: sortKeyFor(fields),
    formatted: formatCitation(fields, style, options),
  }));

  if (style === "bluebook21") {
    const order: Record<string, number> = { case: 0, statute: 1 };
    entries.sort(
      (a, b) =>
        (order[a.formatted.sourceType] ?? 9) - (order[b.formatted.sourceType] ?? 9) ||
        a.sortKey.localeCompare(b.sortKey),
    );
  } else {
    entries.sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.index - b.index);
  }

  const text = entries
    .filter((entry) => !entry.formatted.unsupported)
    .map((entry, position) => (numbered ? `[${position + 1}] ${entry.formatted.bibliography}` : entry.formatted.bibliography))
    .join("\n");

  return {
    entries,
    text,
    style,
    styleLabel: labelFor(style),
    numbered: numbered || style === "bluebook21",
    note:
      style === "bluebook21"
        ? "Bluebook has no bibliography as such; this is a simplified table of authorities: cases first, then statutes, alphabetical within each group."
        : numbered
          ? "Numbered, in the order you entered the sources."
          : "Alphabetised by the first author's family name, or by title when there is no author.",
  };
}

/** Word count of a bibliography line, used by the copy/download summary. */
export function bibliographyWordCount(text: string): number {
  return wordTokens(text).length;
}
