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
  TextArea,
  useDebouncedValue,
  useStoredState,
} from "./ui";
import EntryFields from "./citation/entry-fields";
import {
  CITATION_STYLES,
  type CitationFields,
  type CitationStyle,
} from "@/domains/writing/lib/text/citation.ts";
import { entryLabel, parseEntries, referenceList, serializeEntries } from "@/domains/writing/lib/text/reference-list.ts";

const KEY = "racira.writing.bibliography.entries";

const blank = (): CitationFields => ({ sourceType: "book", authors: [], title: "", year: "" });

/**
 * Bibliography builder: a working list of sources, each edited in the shared
 * entry form, formatted as one bibliography in the chosen style. The list is
 * kept in this browser and can be exported to JSON and imported back, which is
 * how a bibliography survives a refresh without a server.
 */
export default function BibliographyBuilder() {
  const [entries, setEntries] = useStoredState<CitationFields[]>(KEY, [blank()]);
  const [style, setStyle] = useState<CitationStyle>("apa7");
  const [numbered, setNumbered] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const result = useMemo(() => referenceList(entries, style, { numbered }), [entries, style, numbered]);
  const exported = useMemo(() => serializeEntries(entries), [entries]);
  const importInput = useDebouncedValue(importText, 250);

  const update = (index: number, next: CitationFields) =>
    setEntries((previous) => previous.map((entry, position) => (position === index ? next : entry)));

  const move = (index: number, delta: number) =>
    setEntries((previous) => {
      const target = index + delta;
      if (target < 0 || target >= previous.length) return previous;
      const copy = [...previous];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  const report = useMemo(
    () =>
      [
        `Bibliography — ${result.styleLabel}`,
        result.note,
        "",
        result.text || "(no entries yet)",
        "",
        `${result.count} source(s). ${result.missingTitle > 0 ? `${result.missingTitle} without a title.` : "Every source has a title."}`,
      ].join("\n"),
    [result],
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
          <div className="flex items-end pb-1">
            <Select
              name="numbered"
              label="Order"
              value={numbered ? "number" : "alpha"}
              onChange={(value) => setNumbered(value === "number")}
              options={[
                { value: "alpha", label: "Alphabetical by author" },
                { value: "number", label: "Numbered in the order entered" },
              ]}
            />
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Bluebook is not offered here: it has no bibliography as such, only a table of authorities, so legal sources
          belong in the citation formatter&rsquo;s Bluebook style.
        </p>

        <div className="mt-4 space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">{entryLabel(entry)}</span>
                <span className="flex items-center gap-1">
                  <Btn kind="ghost" testid={`btn-up-${index + 1}`} onClick={() => move(index, -1)} disabled={index === 0}>
                    ↑
                  </Btn>
                  <Btn
                    kind="ghost"
                    testid={`btn-down-${index + 1}`}
                    onClick={() => move(index, 1)}
                    disabled={index === entries.length - 1}
                  >
                    ↓
                  </Btn>
                  <Btn kind="ghost" testid={`btn-duplicate-${index + 1}`} onClick={() => setEntries((previous) => [...previous, { ...entry }])}>
                    Duplicate
                  </Btn>
                  <Btn
                    kind="ghost"
                    testid={`btn-remove-${index + 1}`}
                    onClick={() => setEntries((previous) => (previous.length === 1 ? [blank()] : previous.filter((_, position) => position !== index)))}
                  >
                    Remove
                  </Btn>
                </span>
              </div>
              <EntryFields fields={entry} onChange={(next) => update(index, next)} idSuffix={`-${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Btn testid="btn-add" onClick={() => setEntries((previous) => [...previous, blank()])}>
            Add a source
          </Btn>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Your sources stay in this browser and are never uploaded. There is no account, no lookup service and no
          storage outside your device.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Bibliography</PanelTitle>
        {result.count === 0 ? (
          <EmptyState>Add a source above — the bibliography builds itself as you type.</EmptyState>
        ) : (
          <>
            <HeroStat label="Sources" value={result.count} testid="res-count" sub={result.note} />
            <OutputBlock name="bibliography" value={result.text} maxHeight={360} mono={false} />
            {result.missingTitle > 0 && (
              <div className="mt-3">
                <Notice tone="warn">
                  {result.missingTitle} source{result.missingTitle === 1 ? " has" : "s have"} no title, which every style
                  requires. The entry is printed with an empty title so the gap is visible rather than hidden.
                </Notice>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={report} testid="copy-bibliography" label="Copy bibliography" />
              <DownloadButton text={report} filename="bibliography.txt" testid="download-bibliography" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">local export only</span>}>
          Export and import
        </PanelTitle>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          The export is plain JSON of the fields you entered, so the list moves between browsers without any service.
        </p>
        <OutputBlock name="export" value={exported} maxHeight={180} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={exported} testid="copy-export" label="Copy JSON" />
        </div>
        <div className="mt-4">
          <TextArea
            name="import"
            label="Import a JSON list"
            value={importText}
            onChange={(value) => {
              setImportText(value);
              setImportError(null);
            }}
            rows={4}
            placeholder='[{"sourceType":"book","authors":[{"family":"Smith","given":"John A."}],"title":"...","year":"2020"}]'
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Btn
              testid="btn-import"
              onClick={() => {
                const parsed = parseEntries(importInput);
                if (!parsed.ok) {
                  setImportError(parsed.error);
                  return;
                }
                setEntries(parsed.entries);
                setImportError(null);
              }}
            >
              Replace my sources with this list
            </Btn>
            <span className="font-mono text-[11px] text-muted-foreground">{entries.length} source(s) currently</span>
          </div>
          {importError && (
            <p data-testid="res-import-error" className="mt-2 text-xs text-destructive">
              {importError}
            </p>
          )}
        </div>
      </Panel>
    </StackLayout>
  );
}
