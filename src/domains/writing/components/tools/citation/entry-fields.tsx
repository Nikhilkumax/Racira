"use client";

import { Select, TextArea, TextInput } from "../ui";
import {
  SOURCE_TYPES,
  formatAuthorInput,
  parseAuthorsInput,
  type CitationFields,
  type SourceType,
} from "@/domains/writing/lib/text/citation.ts";

/**
 * Shared entry editor for the reference tools (bibliography builder, endnote
 * manager, reference list, in-text builder). One place decides which fields a
 * source type needs, so every tool in the group asks for the same data and the
 * engines receive the same shape.
 *
 * The author box is one author per line as `Family, Given`; an organisation
 * written without a comma is kept as a literal author. The component owns no
 * state — the parent holds the entry — so it can be rendered in a list.
 */
export interface EntryFieldsProps {
  fields: CitationFields;
  onChange: (fields: CitationFields) => void;
  /** Suffix for test ids so several editors can coexist on one page. */
  idSuffix?: string;
  /** Show the source-type select (default true). */
  showType?: boolean;
}

const shown = (fields: CitationFields): CitationFields => fields;

export default function EntryFields({ fields, onChange, idSuffix = "", showType = true }: EntryFieldsProps) {
  const id = (name: string) => `${name}${idSuffix}`;
  const legal = fields.sourceType === "case" || fields.sourceType === "statute";

  const set = (key: keyof CitationFields) => (value: string) => onChange({ ...shown(fields), [key]: value });
  const setAuthors = (value: string) => onChange({ ...fields, authors: parseAuthorsInput(value) });
  const authorsText = fields.authors.map(formatAuthorInput).join("\n");

  return (
    <div className="space-y-3">
      {showType && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name={id("type")}
            label="Source type"
            value={fields.sourceType}
            onChange={(value) => onChange({ ...fields, sourceType: value as SourceType })}
            options={SOURCE_TYPES.map((entry) => ({ value: entry.id, label: entry.label }))}
          />
          <TextInput name={id("year")} label="Year" value={fields.year ?? ""} onChange={set("year")} hint="blank prints n.d." />
        </div>
      )}

      {!showType && <TextInput name={id("year")} label="Year" value={fields.year ?? ""} onChange={set("year")} hint="blank prints n.d." />}

      <TextArea
        name={id("authors")}
        label="Authors — one per line: Family, Given"
        value={authorsText}
        onChange={setAuthors}
        rows={2}
        placeholder={"Smith, John A.\nWorld Health Organization"}
        hint="an organisation with no comma is kept as written"
      />
      <TextInput name={id("title")} label="Title (enter the style's capitalisation)" value={fields.title} onChange={set("title")} />

      {legal ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name={id("court")} label="Court (e.g. 2d Cir.)" value={fields.court ?? ""} onChange={set("court")} />
          <TextInput name={id("reporter")} label="Reporter (e.g. F.3d)" value={fields.reporter ?? ""} onChange={set("reporter")} />
          <TextInput name={id("volume")} label="Volume" value={fields.volume ?? ""} onChange={set("volume")} />
          <TextInput name={id("pages")} label="First page" value={fields.pages ?? ""} onChange={set("pages")} />
          <TextInput name={id("codeTitle")} label="Code title (statutes)" value={fields.codeTitle ?? ""} onChange={set("codeTitle")} />
          <TextInput name={id("section")} label="Section (statutes)" value={fields.section ?? ""} onChange={set("section")} />
          <TextInput name={id("pinpoint")} label="Pinpoint page" value={fields.pinpoint ?? ""} onChange={set("pinpoint")} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name={id("container")} label="Journal / newspaper / website / book title" value={fields.container ?? ""} onChange={set("container")} />
          <TextInput name={id("publisher")} label="Publisher" value={fields.publisher ?? ""} onChange={set("publisher")} />
          <TextInput name={id("place")} label="Place (Chicago)" value={fields.place ?? ""} onChange={set("place")} />
          <TextInput name={id("edition")} label="Edition (e.g. 2nd)" value={fields.edition ?? ""} onChange={set("edition")} />
          <TextInput name={id("volume")} label="Volume" value={fields.volume ?? ""} onChange={set("volume")} />
          <TextInput name={id("issue")} label="Issue" value={fields.issue ?? ""} onChange={set("issue")} />
          <TextInput name={id("pages")} label="Pages (e.g. 45-67)" value={fields.pages ?? ""} onChange={set("pages")} />
          <TextInput name={id("articleNumber")} label="Article number" value={fields.articleNumber ?? ""} onChange={set("articleNumber")} hint="online-only journals" />
          <TextInput name={id("doi")} label="DOI" value={fields.doi ?? ""} onChange={set("doi")} hint="10.1000/xyz" />
          <TextInput name={id("url")} label="URL" value={fields.url ?? ""} onChange={set("url")} />
          <TextInput name={id("accessed")} label="Accessed (printed as entered)" value={fields.accessed ?? ""} onChange={set("accessed")} />
          <TextInput name={id("pinpoint")} label="Pinpoint page" value={fields.pinpoint ?? ""} onChange={set("pinpoint")} />
        </div>
      )}
    </div>
  );
}
