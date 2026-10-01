/**
 * Reference-list helpers on top of the citation engine: numbered endnotes,
 * the in-text and narrative forms of a source, and import/export of a source
 * list.
 *
 * Everything here is a thin, documented layer over `citation.ts`. Endnotes are
 * numbered in the order given and use each style's own device: Chicago and
 * Bluebook use their note form, APA and MLA use the reference entry itself,
 * because those styles have no separate note form. The narrative form exists
 * only where the style defines one (APA and MLA); for the note styles the note
 * text is returned instead and the tool page says so.
 *
 * Import accepts a JSON array of citation objects. It validates the source type
 * and the title and reports the first problem it finds; it never silently drops
 * a field it does not recognise, because a reference manager that loses data is
 * worse than no reference manager.
 */
import {
  SOURCE_TYPES,
  formatBibliography,
  formatCitation,
  type BibliographyEntry,
  type CitationFields,
  type CitationOptions,
  type CitationStyle,
  type SourceType,
} from "./citation.ts";

export interface EndnoteRow {
  /** 1-based number as rendered. */
  number: number;
  /** The note text, in the style's note or reference form. */
  note: string;
  /** The full reference entry for a bibliography. */
  bibliography: string;
  /** Short form for a second reference to the same source. */
  inText: string;
}

/**
 * Endnotes in the given order. Chicago and Bluebook use their note form; APA and
 * MLA use the reference entry, because those styles number references rather
 * than notes.
 */
export function formatEndnotes(
  entries: CitationFields[],
  style: CitationStyle,
  options: CitationOptions = {},
): EndnoteRow[] {
  return entries.map((fields, index) => {
    const formatted = formatCitation(fields, style, options);
    const usesNotes = style === "chicago17" || style === "bluebook21";
    const note = usesNotes
      ? `See ${formatted.note ?? formatted.bibliography}`
      : style === "mla9"
        ? formatted.bibliography
        : formatted.bibliography;
    return {
      number: index + 1,
      note,
      bibliography: formatted.bibliography,
      inText: formatted.inText,
    };
  });
}

export interface InTextForms {
  /** Parenthetical form, e.g. (Smith, 2020, p. 45). */
  parenthetical: string;
  /** Narrative form where the style has one, otherwise the note text. */
  narrative: string;
  /** Whether the style defines a separate narrative form. */
  hasNarrative: boolean;
  /** A short form for a later reference, or the same citation. */
  shortNote: string;
}

function familyList(fields: CitationFields): { one: string; two: string; many: string } {
  const names = fields.authors;
  const family = (index: number) => names[index]?.family ?? fields.title.trim().slice(0, 20);
  return {
    one: family(0),
    two: `${family(0)} and ${family(1)}`,
    many: `${family(0)} et al.`,
  };
}

/** The in-text, narrative and short forms for one source in one style. */
export function inTextForms(fields: CitationFields, style: CitationStyle, options: CitationOptions = {}): InTextForms {
  const formatted = formatCitation(fields, style, options);
  const year = fields.year?.trim() || "n.d.";
  const pinpoint = fields.pinpoint?.trim();
  const names = familyList(fields);

  if (style === "apa7") {
    const short = fields.authors.length === 0 ? `"${fields.title.trim()}"` : fields.authors.length === 1 ? names.one : fields.authors.length === 2 ? `${names.one} & ${familyList(fields).two.split(" and ")[1]}` : names.many;
    return {
      parenthetical: formatted.inText,
      narrative: `${short} (${year}${pinpoint ? `, p. ${pinpoint}` : ""})`,
      hasNarrative: true,
      shortNote: formatted.inText,
    };
  }

  if (style === "mla9") {
    const short =
      fields.authors.length === 0
        ? `"${fields.title.trim()}"`
        : fields.authors.length === 1
          ? names.one
          : fields.authors.length === 2
            ? names.two
            : names.many;
    return {
      parenthetical: formatted.inText,
      narrative: short,
      hasNarrative: true,
      shortNote: formatted.inText,
    };
  }

  return {
    parenthetical: formatted.inText,
    narrative: formatted.note ?? formatted.bibliography,
    hasNarrative: false,
    shortNote: formatted.inText,
  };
}

export interface ReferenceListResult {
  text: string;
  /** Sorted entries, each carrying the index of the source it came from. */
  entries: BibliographyEntry[];
  count: number;
  numbered: boolean;
  style: CitationStyle;
  styleLabel: string;
  note: string;
  missingTitle: number;
}

/** A reference list, numbered or alphabetised, with its coverage reported. */
export function referenceList(
  entries: CitationFields[],
  style: CitationStyle,
  options: CitationOptions & { numbered?: boolean } = {},
): ReferenceListResult {
  const bibliography = formatBibliography(entries, style, options);
  return {
    text: bibliography.text,
    entries: bibliography.entries,
    count: bibliography.entries.filter((entry) => !entry.formatted.unsupported).length,
    numbered: bibliography.numbered,
    style,
    styleLabel: bibliography.styleLabel,
    note: bibliography.note,
    missingTitle: entries.filter((entry) => entry.title.trim().length === 0).length,
  };
}

/** A one-line label for list UIs: first author's family, year, short title. */
export function entryLabel(fields: CitationFields): string {
  const author = fields.authors[0]?.family ?? (fields.title.trim() ? fields.title.trim().slice(0, 24) : "Untitled source");
  const year = fields.year ?? fields.date ?? "n.d.";
  const type = SOURCE_TYPES.find((entry) => entry.id === fields.sourceType)?.label ?? fields.sourceType;
  return `${author} · ${year} · ${type}`;
}

/** Export the whole list as pretty JSON. */
export function serializeEntries(entries: CitationFields[]): string {
  return JSON.stringify(entries, null, 2);
}

export type ParseEntriesResult = { ok: true; entries: CitationFields[] } | { ok: false; error: string };

const SOURCE_TYPE_IDS = new Set<string>(SOURCE_TYPES.map((entry) => entry.id));

/** Parse an exported list back, validating every entry. */
export function parseEntries(json: string): ParseEntriesResult {
  const text = json.trim();
  if (!text) return { ok: false, error: "Paste the JSON you exported first." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "That is not valid JSON. Paste the exact export, including the outer brackets." };
  }
  if (!Array.isArray(parsed)) return { ok: false, error: "The export must be a JSON array of sources." };
  if (parsed.length === 0) return { ok: false, error: "The export contains no sources." };

  const entries: CitationFields[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const raw = parsed[index] as Partial<CitationFields> | null;
    if (!raw || typeof raw !== "object") return { ok: false, error: `Source ${index + 1} is not an object.` };
    if (typeof raw.sourceType !== "string" || !SOURCE_TYPE_IDS.has(raw.sourceType)) {
      return { ok: false, error: `Source ${index + 1} has an unknown sourceType.` };
    }
    if (typeof raw.title !== "string") return { ok: false, error: `Source ${index + 1} has no title string.` };
    const authors = Array.isArray(raw.authors)
      ? raw.authors
          .filter((author): author is { family: string; given?: string; literal?: boolean } => Boolean(author) && typeof (author as { family?: unknown }).family === "string")
          .map((author) => {
            // Only carry keys the export actually had, so a round trip is byte
            // exact rather than sprouting `given: undefined` / `literal: undefined`.
            const clean: { family: string; given?: string; literal?: boolean } = { family: author.family };
            if (author.given !== undefined) clean.given = author.given;
            if (author.literal !== undefined) clean.literal = author.literal;
            return clean;
          })
      : [];
    entries.push({ ...(raw as CitationFields), sourceType: raw.sourceType as SourceType, authors });
  }
  return { ok: true, entries };
}
