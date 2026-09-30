"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  MARKER_FORMS,
  MARKER_STYLES,
  NUMBERING_STYLES,
  analyzeFootnotes,
  detectMarkerStyle,
  renumberBody,
  renderNotes,
  type MarkerForm,
  type MarkerStyle,
  type NoteFormat,
  type NumberingStyle,
} from "@/domains/writing/lib/text/footnote.ts";

const SAMPLE_BODY = "The first draft was finished in March[1]. The second took longer[2], and the third[3] is still open.";
const SAMPLE_NOTES = "1. Field notes, 12 March.\n2. Interview transcript, 4 April.\n3. Working draft, unpublished.";

export default function FootnoteFormatter() {
  const [body, setBody] = useState(SAMPLE_BODY);
  const [notesText, setNotesText] = useState(SAMPLE_NOTES);
  const [styleChoice, setStyleChoice] = useState<"auto" | MarkerStyle>("auto");
  const [numbering, setNumbering] = useState<NumberingStyle>("numeric");
  const [form, setForm] = useState<MarkerForm>("superscript");
  const [notesFormat, setNotesFormat] = useState<NoteFormat>("markdown");
  const debouncedBody = useDebouncedValue(body, 250);
  const debouncedNotes = useDebouncedValue(notesText, 250);

  const analysis = useMemo(
    () =>
      analyzeFootnotes(
        debouncedBody,
        debouncedNotes,
        styleChoice === "auto" ? undefined : styleChoice,
      ),
    [debouncedBody, debouncedNotes, styleChoice],
  );

  const detected = useMemo(() => detectMarkerStyle(debouncedBody), [debouncedBody]);
  const renumbered = useMemo(
    () => renumberBody(debouncedBody, analysis, form, numbering),
    [debouncedBody, analysis, form, numbering],
  );
  const renderedNotes = useMemo(
    () => renderNotes(analysis.pairs, numbering, notesFormat),
    [analysis.pairs, numbering, notesFormat],
  );
  const combined = notesText.trim().length > 0 ? `${renumbered}\n\n${renderedNotes}` : renumbered;

  const extension = notesFormat === "html" ? "html" : notesFormat === "markdown" ? "md" : "txt";
  const mime = notesFormat === "html" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8";

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Body text and notes</PanelTitle>
        <TextArea
          name="body"
          label="Body text with inline markers"
          value={body}
          onChange={setBody}
          rows={6}
          placeholder="Text with markers, e.g. …finished in March[1]."
        />
        <div className="mt-3">
          <TextArea
            name="notes"
            label="Notes — one per line"
            value={notesText}
            onChange={setNotesText}
            rows={6}
            placeholder={"1. First note.\n2. Second note."}
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="style"
            label="Marker style"
            value={styleChoice}
            onChange={(next) => setStyleChoice(next as "auto" | MarkerStyle)}
            options={[
              { value: "auto", label: `Detect automatically (found: ${detected})` },
              ...MARKER_STYLES.map((entry) => ({ value: entry.style, label: `${entry.label} — ${entry.example}` })),
            ]}
          />
          <Select
            name="numbering"
            label="Numbering"
            value={numbering}
            onChange={(next) => setNumbering(next as NumberingStyle)}
            options={NUMBERING_STYLES}
          />
          <Select
            name="form"
            label="Marker format in the body"
            value={form}
            onChange={(next) => setForm(next as MarkerForm)}
            options={MARKER_FORMS}
          />
          <Select
            name="notes-format"
            label="Notes list format"
            value={notesFormat}
            onChange={(next) => setNotesFormat(next as NoteFormat)}
            options={[
              { value: "markdown", label: "Markdown list" },
              { value: "html", label: "HTML ordered list" },
              { value: "plain", label: "Plain text list" },
            ]}
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Formatted result</PanelTitle>
        {body.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {analysis.warnings.length > 0 && (
              <div className="mb-3 space-y-2" data-testid="res-warnings">
                {analysis.warnings.map((warning, index) => (
                  <Notice key={index} tone="warn">
                    {warning}
                  </Notice>
                ))}
              </div>
            )}
            <ResultBox>
              <ResultRow name="markers" label="Markers in the body" value={String(analysis.occurrences.length)} />
              <ResultRow name="matched" label="Notes matched" value={String(analysis.pairs.length)} />
              <ResultRow name="notes" label="Notes provided" value={String(analysis.notes.length)} />
              <ResultRow name="style" label="Marker style used" value={analysis.style} />
            </ResultBox>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Body, renumbered
                </div>
                <pre
                  data-testid="res-body"
                  className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 text-sm text-foreground"
                >
                  {renumbered}
                </pre>
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Notes ({notesFormat})
                </div>
                <pre
                  data-testid="res-notes"
                  className="max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
                >
                  {renderedNotes || "—"}
                </pre>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={combined} testid="copy-combined" label="Copy body + notes" />
              <DownloadButton
                text={combined}
                filename={`footnotes.${extension}`}
                mime={mime}
                testid="download-combined"
                label="Download"
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Markers are matched to notes in order of first appearance, so a body numbered [1], [3] with two notes is
              renumbered 1, 2 and the mismatch is reported above rather than silently hidden.
            </p>
          </>
        )}
      </Panel>
    </StackLayout>
  );
}
