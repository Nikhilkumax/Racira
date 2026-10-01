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
  TextInput,
  useStoredState,
} from "./ui";
import EntryFields from "./citation/entry-fields";
import {
  LEGAL_SIGNALS,
  authorityReport,
  legalCitation,
  legalShortForm,
  type ShortFormKind,
} from "@/domains/writing/lib/text/legal-citation.ts";
import type { CitationFields, SourceType } from "@/domains/writing/lib/text/citation.ts";

const KEY = "racira.writing.legal.authorities";

const blank = (sourceType: SourceType = "case"): CitationFields => ({
  sourceType,
  authors: [],
  title: "",
  reporter: "",
  volume: "",
  pages: "",
  court: "",
  year: "",
  codeTitle: "",
  section: "",
  pinpoint: "",
});

/**
 * Legal citation formatter: one case or statute in Bluebook 21 form, with the
 * introductory signal, the short forms a later reference uses (Id. and supra),
 * and a simplified table of authorities assembled from the citations you add.
 *
 * Bluebook support is scoped to the case and statute patterns implemented by
 * the citation engine. Nothing here is legal advice, and the page says so.
 */
export default function LegalCitationFormatter() {
  const [fields, setFields] = useState<CitationFields>(blank());
  const [signal, setSignal] = useState(LEGAL_SIGNALS[0]);
  const [shortKind, setShortKind] = useState<ShortFormKind>("id");
  const [noteNumber, setNoteNumber] = useState("1");
  const [authorities, setAuthorities] = useStoredState<CitationFields[]>(KEY, []);

  const result = useMemo(() => legalCitation(fields, signal), [fields, signal]);
  const short = useMemo(() => legalShortForm(fields, shortKind, noteNumber), [fields, shortKind, noteNumber]);
  const report = useMemo(() => authorityReport(authorities), [authorities]);
  const hasSource = fields.title.trim().length > 0;

  const copyReport = useMemo(
    () =>
      [
        `Legal citation — ${result.signal ? `${result.signal} ` : ""}${fields.title || "(untitled)"}`,
        "",
        result.citation || "(no citation yet)",
        `Short forms: Id. · ${short}`,
        "",
        report.text,
      ].join("\n"),
    [result, short, report, fields.title],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Authority</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="type"
            label="Type"
            value={fields.sourceType}
            onChange={(value) => setFields(blank(value as SourceType))}
            options={[
              { value: "case", label: "Court case" },
              { value: "statute", label: "Statute" },
            ]}
            hint="Bluebook case and statute forms"
          />
          <Select
            name="signal"
            label="Introductory signal"
            value={signal}
            onChange={setSignal}
            options={LEGAL_SIGNALS.map((entry) => ({ value: entry, label: entry }))}
          />
        </div>
        <div className="mt-3">
          <EntryFields fields={fields} onChange={setFields} idSuffix="" showType={false} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Enter the case name or statute title, the reporter or code title, the volume, the first page or section and the
          court and year. Authors are ignored for legal material, and nothing is looked up.
        </p>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            hasSource ? (
              <CopyButton text={result.citation} testid="copy-citation" label="Copy citation" />
            ) : undefined
          }
        >
          Formatted citation
        </PanelTitle>
        {!hasSource ? (
          <EmptyState>Fill in a case name or statute title — the citation appears as you type.</EmptyState>
        ) : (
          <>
            <HeroStat label="Signal" value={result.signal || "(none)"} testid="res-signal" sub="current introductory signal" />
            <OutputBlock name="citation" value={result.citation} maxHeight={200} mono={false} />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">In-text</p>
                <OutputBlock name="intext" value={result.inText} maxHeight={120} mono={false} />
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Short form</p>
                <OutputBlock name="short" value={short} maxHeight={120} mono={false} />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Select
                name="short-kind"
                label="Short form"
                value={shortKind}
                onChange={(value) => setShortKind(value as ShortFormKind)}
                options={[
                  { value: "id", label: "Id. (immediately preceding)" },
                  { value: "supra", label: "supra (any earlier note)" },
                ]}
              />
              <TextInput
                name="short-note"
                label="Note number (for supra)"
                value={noteNumber}
                onChange={setNoteNumber}
                hint="the earlier note's number"
              />
            </div>
            {result.warnings.length > 0 && (
              <ul data-testid="res-warnings" className="mt-3 space-y-1">
                {result.warnings.map((warning) => (
                  <li key={warning} className="text-xs text-amber-700 dark:text-amber-300">
                    {warning}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Btn testid="btn-add-authority" onClick={() => setAuthorities((previous) => [...previous, { ...fields }])}>
                Add to table of authorities
              </Btn>
              <DownloadButton text={copyReport} filename="legal-citation.txt" testid="download-citation" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle
          right={
            authorities.length > 0 ? (
              <Btn kind="ghost" testid="btn-clear-toa" onClick={() => setAuthorities([])}>
                Clear
              </Btn>
            ) : undefined
          }
        >
          Table of authorities
        </PanelTitle>
        {authorities.length === 0 ? (
          <EmptyState>Add a citation above — cases and statutes are grouped here as you go.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Authorities"
              value={report.total}
              testid="res-toa-count"
              sub={`${authorities.length} citation(s) added`}
            />
            <div data-testid="res-toa" className="space-y-3">
              {report.groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                  <ul className="space-y-1">
                    {group.entries.map((entry) => (
                      <li key={`${entry.index}-${entry.citation}`} className="font-mono text-xs text-foreground">
                        {entry.citation}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <CopyButton text={report.text} testid="copy-toa" label="Copy table of authorities" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The formatter implements the Bluebook case and statute patterns the citation engine covers: case name, volume,
            reporter, first page, court and year; code title, section and year. Signals and the Id. and supra short forms
            are offered around them.
          </Notice>
          <Notice tone="warn">
            This tool is not legal advice and not a citation checker. Bluebook&rsquo;s reporter-abbreviation tables,
            jurisdiction-specific rules, signals-in-depth and tables of authorities formats vary, and the simplified
            table here groups cases before statutes. Verify every citation against the current edition before filing.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
