/**
 * Legal citation helpers on top of the citation engine's Bluebook 21 layer.
 *
 * The citation formatter already prints a single case or statute in Bluebook
 * form. This module adds what a brief actually needs around it: the introductory
 * signal, the short forms for a second reference (Id. and supra), and a
 * simplified table of authorities grouped cases-then-statutes.
 *
 * Scope, stated on the tool page: Bluebook 21 covers cases and statutes here,
 * not signals-in-depth, jurisdictional variations or the reporter-abbreviation
 * tables. Nothing this module prints is legal advice, and every output is a
 * function of the fields typed — there is no lookup and no network call.
 */
import { formatCitation, type CitationFields } from "./citation.ts";

/** The introductory signals this tool offers, in Bluebook order. */
export const LEGAL_SIGNALS: string[] = [
  "(none)",
  "See",
  "See also",
  "See e.g.",
  "Cf.",
  "Compare",
  "But see",
  "But cf.",
  "Contra",
  "Accord",
  "E.g.,",
  "See generally",
];

export interface LegalCitationResult {
  /** The full citation, with the signal prefixed when one was chosen. */
  citation: string;
  signal: string;
  /** The engine's own short in-text form. */
  inText: string;
  warnings: string[];
  unsupported: boolean;
  unsupportedReason?: string;
}

/** One case or statute, formatted in Bluebook with an optional signal. */
export function legalCitation(fields: CitationFields, signal = "(none)"): LegalCitationResult {
  const result = formatCitation(fields, "bluebook21");
  const trimmed = signal.trim();
  const apply = trimmed && trimmed !== "(none)" ? `${trimmed} ` : "";
  return {
    signal: trimmed === "(none)" ? "" : trimmed,
    citation: result.bibliography ? `${apply}${result.bibliography}` : "",
    inText: result.inText,
    warnings: result.warnings,
    unsupported: result.unsupported,
    unsupportedReason: result.unsupportedReason,
  };
}

export type ShortFormKind = "id" | "supra";

/**
 * A second reference to an already-cited source. `Id.` is for a source cited in
 * the immediately preceding note; `supra` is for any earlier note and takes that
 * note's number. Both accept a pinpoint page.
 */
export function legalShortForm(fields: CitationFields, kind: ShortFormKind, noteNumber = "1"): string {
  const pinpoint = fields.pinpoint?.trim();
  if (kind === "id") {
    return pinpoint ? `Id. at ${pinpoint}.` : "Id.";
  }
  const name = shortName(fields);
  const note = noteNumber.trim() || "1";
  return pinpoint ? `${name}, supra note ${note} at ${pinpoint}.` : `${name}, supra note ${note}.`;
}

/** The short party name a supra form uses: the first party, or the code title. */
function shortName(fields: CitationFields): string {
  if (fields.sourceType === "statute") {
    const title = fields.codeTitle?.trim();
    return title ? `${title} U.S.C.` : "The statute";
  }
  const first = fields.title.split(/\s+v\.?\s+/i)[0]?.trim();
  return first || fields.title.trim() || "The source";
}

export interface AuthorityEntry {
  citation: string;
  /** The source's position in the input list. */
  index: number;
}

export interface AuthorityGroup {
  label: string;
  entries: AuthorityEntry[];
}

const GROUP_LABELS: { type: CitationFields["sourceType"]; label: string }[] = [
  { type: "case", label: "Cases" },
  { type: "statute", label: "Statutes and codes" },
];

/**
 * A simplified table of authorities: cases first, then statutes, each group
 * alphabetical by the citation text. Sources that are not legal material are
 * ignored — Bluebook has no entry for them.
 */
export function tableOfAuthorities(list: CitationFields[]): AuthorityGroup[] {
  const groups: AuthorityGroup[] = [];
  for (const { type, label } of GROUP_LABELS) {
    const entries = list
      .map((fields, index) => ({ fields, index }))
      .filter(({ fields }) => fields.sourceType === type)
      .map(({ fields, index }) => ({
        index,
        citation: formatCitation(fields, "bluebook21").bibliography,
      }))
      .filter((entry) => entry.citation.length > 0)
      .sort((a, b) => a.citation.localeCompare(b.citation) || a.index - b.index);
    if (entries.length > 0) groups.push({ label, entries });
  }
  return groups;
}

export interface AuthorityReport {
  groups: AuthorityGroup[];
  total: number;
  text: string;
}

/** The table of authorities as plain text, with each group's heading. */
export function authorityReport(list: CitationFields[]): AuthorityReport {
  const groups = tableOfAuthorities(list);
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0);
  const text = groups
    .map((group) => [group.label.toLocaleUpperCase(), ...group.entries.map((entry) => `  ${entry.citation}`)].join("\n"))
    .join("\n\n");
  return { groups, total, text };
}
