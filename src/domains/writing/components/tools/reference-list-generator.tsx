"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  Select,
  StackLayout,
  useStoredState,
} from "./ui";
import EntryFields from "./citation/entry-fields";
import {
  CITATION_STYLES,
  type CitationFields,
  type CitationStyle,
} from "@/domains/writing/lib/text/citation.ts";
import { entryLabel, referenceList } from "@/domains/writing/lib/text/reference-list.ts";

const KEY = "racira.writing.reference-list.entries";

const blank = (): CitationFields => ({ sourceType: "journal-article", authors: [], title: "", year: "" });

/**
 * Reference list generator: sources formatted as a numbered reference list with
 * the matching in-text markers, so a reader can move between the list and the
 * prose. Alphabetical or numbered order is your choice, and the numbering is
 * recomputed from the final order rather than stored.
 */
export default function ReferenceListGenerator() {
  const [entries, setEntries] = useStoredState<CitationFields[]>(KEY, [blank()]);
  const [style, setStyle] = useState<CitationStyle>("apa7");
  const [numbered, setNumbered] = useState(true);

  const result = useMemo(() => referenceList(entries, style, { numbered }), [entries, style, numbered]);
  const rows = useMemo(() => formatRows(entries, style, numbered), [entries, style, numbered]);
  const update = (index: number, next: CitationFields) =>
    setEntries((previous) => previous.map((entry, position) => (position === index ? next : entry)));

  const report = useMemo(
    () =>
      [
        `Reference list — ${result.styleLabel}`,
        result.note,
        "",
        result.text || "(no sources yet)",
        "",
        "In-text markers",
        ...rows.map((row) => `${row.marker}  ${row.inText}`),
      ].join("\n"),
    [result, rows],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Sources
        </PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="style"
            label="Citation style"
            value={style}
            onChange={(value) => setStyle(value as CitationStyle)}
            options={CITATION_STYLES.filter((entry) => entry.id !== "bluebook21").map((entry) => ({ value: entry.id, label: entry.label }))}
          />
          <Select
            name="numbered"
            label="Reference numbering"
            value={numbered ? "yes" : "no"}
            onChange={(value) => setNumbered(value === "yes")}
            options={[
              { value: "yes", label: "Numbered [1], [2] …" },
              { value: "no", label: "Unnumbered, alphabetical" },
            ]}
          />
        </div>
        <div className="mt-4 space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">{entryLabel(entry)}</span>
                <Btn
                  kind="ghost"
                  testid={`btn-remove-${index + 1}`}
                  onClick={() => setEntries((previous) => (previous.length === 1 ? [blank()] : previous.filter((_, position) => position !== index)))}
                >
                  Remove
                </Btn>
              </div>
              <EntryFields fields={entry} onChange={(next) => update(index, next)} idSuffix={`-${index + 1}`} showType={false} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Btn testid="btn-add" onClick={() => setEntries((previous) => [...previous, blank()])}>
            Add a journal source
          </Btn>
          <span className="text-xs text-muted-foreground">
            The type is fixed to journal article here; the bibliography builder covers books and the rest.
          </span>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Reference list</PanelTitle>
        {result.count === 0 ? (
          <EmptyState>Add a journal source above.</EmptyState>
        ) : (
          <>
            <HeroStat label="References" value={result.count} testid="res-count" sub={result.note} />
            <OutputBlock name="references" value={result.text} maxHeight={340} mono={false} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={report} testid="copy-references" label="Copy list and markers" />
              <DownloadButton text={report} filename="reference-list.txt" testid="download-references" label="Download" />
            </div>
          </>
        )}
      </Panel>

      {result.count > 0 && (
        <Panel>
          <PanelTitle>In-text markers</PanelTitle>
          <ul data-testid="res-markers" className="space-y-2 text-sm">
            {rows.map((row) => (
              <li key={row.marker} className="flex flex-wrap items-baseline gap-3 border-t border-border/60 pt-2 first:border-0 first:pt-0">
                <span className="font-mono text-xs text-primary">{row.marker}</span>
                <span className="font-mono text-xs text-foreground">{row.inText}</span>
                <span className="text-xs text-muted-foreground">{row.label}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Numbering is recomputed from the final order, so switching between alphabetical and numbered never leaves
            stale numbers behind. Markers are the style&rsquo;s own in-text form; for numbered lists they are shown as
            [1], [2] and so on, which is a house convention rather than a rule of APA or MLA.
          </Notice>
          <Notice tone="warn">
            A reference list is only as good as the fields you enter. The tool does not verify that a DOI resolves,
            that a journal name is correct or that a page range exists — it places the values you supply in the order the
            selected style requires. It also cannot scan a manuscript for citation points, so the markers are for
            reference while you write, not a check of the document.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}

interface ReferenceRow {
  marker: string;
  inText: string;
  label: string;
}

/** Markers in the order the reference list prints them. */
function formatRows(entries: CitationFields[], style: CitationStyle, numbered: boolean): ReferenceRow[] {
  const list = referenceList(entries, style, { numbered });
  return list.entries
    .filter((entry) => !entry.formatted.unsupported)
    .map((entry, position) => ({
      marker: numbered ? `[${position + 1}]` : "—",
      inText: entry.formatted.inText,
      label: entryLabel(entries[entry.index] ?? entries[0]),
    }));
}
