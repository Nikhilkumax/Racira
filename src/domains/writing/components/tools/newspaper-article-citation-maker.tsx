"use client";

import { useMemo, useState } from "react";
import {
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
} from "./ui";
import EntryFields from "./citation/entry-fields";
import { CITATION_STYLES, type CitationFields, type CitationStyle } from "@/domains/writing/lib/text/citation.ts";
import {
  newspaperAllStyles,
  newspaperChecklist,
  newspaperCitation,
  newspaperReport,
} from "@/domains/writing/lib/text/newspaper-citation.ts";

const EMPTY: CitationFields = {
  sourceType: "newspaper-article",
  authors: [],
  title: "",
  container: "",
  date: "",
  year: "",
  pages: "",
  url: "",
  accessed: "",
};

/**
 * Newspaper article citation maker: one article quoted in APA 7, MLA 9 and
 * Chicago 17, with the per-style field checklist and warnings for the details a
 * newspaper entry turns on (byline, day-month date, paper name, page or URL).
 */
export default function NewspaperArticleCitationMaker() {
  const [fields, setFields] = useState<CitationFields>(EMPTY);
  const [style, setStyle] = useState<CitationStyle>("apa7");

  const result = useMemo(() => newspaperCitation(fields, style), [fields, style]);
  const allStyles = useMemo(() => newspaperAllStyles(fields), [fields]);
  const report = useMemo(() => newspaperReport(fields), [fields]);
  const checklist = useMemo(() => newspaperChecklist(), []);
  const hasSource = fields.title.trim().length > 0 || fields.authors.length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Newspaper article</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Select
            name="style"
            label="Citation style"
            value={style}
            onChange={(value) => setStyle(value as CitationStyle)}
            options={CITATION_STYLES.filter((entry) => entry.id !== "bluebook21").map((entry) => ({
              value: entry.id,
              label: entry.label,
            }))}
            hint={CITATION_STYLES.find((entry) => entry.id === style)?.short}
          />
          <TextInput
            name="date"
            label="Publication date (month and day)"
            value={fields.date ?? ""}
            onChange={(value) => setFields({ ...fields, date: value })}
            hint="e.g. May 5"
          />
        </div>
        <div className="mt-3">
          <EntryFields fields={fields} onChange={setFields} idSuffix="" showType={false} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Enter the byline, the headline, the newspaper&rsquo;s name, the date as you read it (for example 5 May 2026), the
          year, and either the print page or the article&rsquo;s URL. The source type is fixed to a newspaper article.
        </p>
      </Panel>

      <Panel>
        <PanelTitle
          right={hasSource ? <CopyButton text={result.entry} testid="copy-entry" label="Copy entry" /> : undefined}
        >
          Formatted entry
        </PanelTitle>
        {!hasSource ? (
          <EmptyState>Fill in the headline or byline above — the entry appears as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Entry length"
              value={`${result.entry.split(/\s+/).filter(Boolean).length} words`}
              testid="res-length"
              sub={result.styleLabel}
            />
            <OutputBlock name="entry" value={result.entry} maxHeight={220} mono={false} />
            <p className="mt-2 text-xs text-muted-foreground">
              In-text:{" "}
              <span data-testid="res-intext" className="font-mono text-foreground">
                {result.inText}
              </span>
            </p>
            {result.warnings.length > 0 && (
              <ul data-testid="res-warnings" className="mt-3 space-y-1">
                {result.warnings.map((warning) => (
                  <li key={warning} className="text-xs text-amber-700 dark:text-amber-300">
                    {warning}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3">
              <DownloadButton text={report} filename="newspaper-citation.txt" testid="download-entry" label="Download all styles" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Every style at a glance</PanelTitle>
        <div data-testid="res-all" className="space-y-3">
          {allStyles.map((row) => (
            <div key={row.style} className="rounded-lg border border-border bg-background/40 p-3">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{row.styleLabel}</p>
              <p className="font-mono text-xs text-foreground">{row.entry || "(no entry yet)"}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>What each style expects of a newspaper entry</PanelTitle>
        <div className="overflow-x-auto">
          <table data-testid="res-checklist" className="w-full min-w-[38rem] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Field</th>
                <th className="py-2 pr-3 font-semibold">APA 7</th>
                <th className="py-2 pr-3 font-semibold">MLA 9</th>
                <th className="py-2 font-semibold">Chicago 17</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((row) => (
                <tr key={row.field} className="border-t border-border/60 align-top">
                  <td className="py-2 pr-3 text-foreground">{row.field}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.apa}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{row.mla}</td>
                  <td className="py-2 text-muted-foreground">{row.chicago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            MLA and Chicago print the whole publication date, so a date of just the month and day gets the year appended
            for those two styles; APA keeps its own year slot and the day-month date. The date is otherwise printed
            exactly as entered, because day-month order differs by style and locale.
          </Notice>
          <Notice tone="warn">
            The tool formats the fields you supply; it does not fetch a headline, resolve a URL or confirm the
            newspaper&rsquo;s name. It covers APA 7, MLA 9 and Chicago 17 as implemented by the citation engine, not every
            newspaper house style, and it cannot tell whether an article you read online also appeared in print.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
