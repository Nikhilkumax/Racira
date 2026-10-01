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
import { entryLabel, formatEndnotes } from "@/domains/writing/lib/text/reference-list.ts";

const KEY = "racira.writing.endnotes.entries";

const blank = (): CitationFields => ({ sourceType: "book", authors: [], title: "", year: "" });

/**
 * Endnote manager: a numbered list of notes in the order you arrange them. Each
 * note is built from the shared citation engine — Chicago and Bluebook use their
 * note form, APA and MLA use the reference entry, because those styles number
 * references rather than notes. Reordering is manual and the numbering follows.
 */
export default function EndnoteManager() {
  const [entries, setEntries] = useStoredState<CitationFields[]>(KEY, [blank()]);
  const [style, setStyle] = useState<CitationStyle>("chicago17");

  const rows = useMemo(() => formatEndnotes(entries.filter((entry) => entry.title.trim().length > 0 || entry.authors.length > 0), style), [entries, style]);
  const usesNotes = style === "chicago17" || style === "bluebook21";

  const move = (index: number, delta: number) =>
    setEntries((previous) => {
      const target = index + delta;
      if (target < 0 || target >= previous.length) return previous;
      const copy = [...previous];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  const update = (index: number, next: CitationFields) =>
    setEntries((previous) => previous.map((entry, position) => (position === index ? next : entry)));

  const notesText = useMemo(() => rows.map((row) => `${row.number}. ${row.note}`).join("\n\n"), [rows]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle right={<span className="text-[10px] text-muted-foreground">stored in this browser</span>}>
          Notes
        </PanelTitle>
        <div className="max-w-sm">
          <Select
            name="style"
            label="Note style"
            value={style}
            onChange={(value) => setStyle(value as CitationStyle)}
            options={CITATION_STYLES.map((entry) => ({ value: entry.id, label: entry.label }))}
            hint={usesNotes ? "note form" : "reference form"}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {usesNotes
            ? "Chicago and Bluebook have a note device, so each endnote is printed in that style's note form with its number."
            : "APA and MLA number references rather than notes, so each endnote is the full reference entry in that style. The page states this rather than implying a note device that does not exist."}
        </p>

        <div className="mt-4 space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  {index + 1}. {entryLabel(entry)}
                </span>
                <span className="flex items-center gap-1">
                  <Btn kind="ghost" testid={`btn-up-${index + 1}`} onClick={() => move(index, -1)} disabled={index === 0}>
                    ↑
                  </Btn>
                  <Btn kind="ghost" testid={`btn-down-${index + 1}`} onClick={() => move(index, 1)} disabled={index === entries.length - 1}>
                    ↓
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
              <EntryFields fields={entry} onChange={(next) => update(index, next)} idSuffix={`-${index + 1}`} showType />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Btn testid="btn-add" onClick={() => setEntries((previous) => [...previous, blank()])}>
            Add a note
          </Btn>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Numbered endnotes</PanelTitle>
        {rows.length === 0 ? (
          <EmptyState>Add a source above — each note is numbered in the order shown.</EmptyState>
        ) : (
          <>
            <HeroStat label="Notes" value={rows.length} testid="res-count" sub={`${style === "mla9" ? "MLA 9" : style === "apa7" ? "APA 7" : style === "chicago17" ? "Chicago 17" : "Bluebook 21"} · numbered in list order`} />
            <OutputBlock name="notes" value={notesText} maxHeight={360} mono={false} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={notesText} testid="copy-notes" label="Copy notes" />
              <DownloadButton text={notesText} filename="endnotes.txt" testid="download-notes" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Renumbering follows the list, so moving a note changes every number after it — which is what an endnote
            section does. Sources without a title or author are skipped in the output rather than printed as empty
            notes, and the list keeps them so nothing is lost while you fill them in.
          </Notice>
          <Notice tone="warn">
            This manager stores a list; it does not integrate with a word processor, cannot scan a document for
            citation points and cannot renumber notes inside a manuscript. It also inherits the citation engine&rsquo;s
            scope: the four editions implemented here, formatted from the fields you type, with no lookup of any kind.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
