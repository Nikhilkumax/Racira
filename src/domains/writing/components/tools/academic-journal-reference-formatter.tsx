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
  useDebouncedValue,
} from "./ui";
import EntryFields from "./citation/entry-fields";
import {
  CITATION_STYLES,
  formatCitation,
  type CitationFields,
  type CitationStyle,
} from "@/domains/writing/lib/text/citation.ts";

const JOURNAL: CitationFields = {
  sourceType: "journal-article",
  authors: [],
  title: "",
  year: "",
  container: "",
  volume: "",
  issue: "",
  pages: "",
  doi: "",
};

/** What each style needs for a journal article, shown as a checklist. */
const CHECKLIST: { field: string; apa: string; mla: string; chicago: string }[] = [
  { field: "Authors", apa: "required, up to 20 listed", mla: "required, et al. from three", chicago: "required, et al. from four" },
  { field: "Article title", apa: "required, sentence case", mla: "required, in quotation marks", chicago: "required, in quotation marks" },
  { field: "Journal name", apa: "required, italic", mla: "required, italic", chicago: "required, italic" },
  { field: "Year", apa: "required, in parentheses", mla: "required after the volume", chicago: "required in parentheses before the pages" },
  { field: "Volume / issue", apa: "volume italic, issue in parentheses", mla: "vol. and no. before the year", chicago: "volume then no. issue" },
  { field: "Pages or article number", apa: "page range, or Article N", mla: "pp. range, or Art. no. N", chicago: "page range in the page slot" },
  { field: "DOI", apa: "full https://doi.org/ link", mla: "full link, after the page range", chicago: "full link, after the pages" },
];

/**
 * Academic journal reference formatter: the journal-article case in detail, with
 * the field checklist each style applies and a warnings list for anything the
 * chosen style expects and the entry does not have. It formats the four
 * editions' journal patterns; it does not pretend to know a specific journal's
 * house style.
 */
export default function AcademicJournalReferenceFormatter() {
  const [fields, setFields] = useState<CitationFields>(JOURNAL);
  const [style, setStyle] = useState<CitationStyle>("apa7");
  const authorsInput = useDebouncedValue(fields.authors.map((author) => `${author.family}, ${author.given ?? ""}`).join("\n"), 250);

  const journal = useMemo(() => ({ ...fields, sourceType: "journal-article" as const }), [fields]);
  const result = useMemo(() => formatCitation(journal, style), [journal, style]);
  const hasSource = fields.title.trim().length > 0 || authorsInput.trim().length > 0;

  const report = useMemo(
    () =>
      [
        `Journal reference — ${result.styleLabel}`,
        "",
        result.bibliography || "(no entry yet)",
        "",
        `In-text: ${result.inText}`,
        result.warnings.length > 0 ? `\nWarnings:\n${result.warnings.map((warning) => `- ${warning}`).join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    [result],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Journal article</PanelTitle>
        <div className="max-w-md">
          <Select
            name="style"
            label="Citation style"
            value={style}
            onChange={(value) => setStyle(value as CitationStyle)}
            options={CITATION_STYLES.filter((entry) => entry.id !== "bluebook21").map((entry) => ({ value: entry.id, label: entry.label }))}
            hint={CITATION_STYLES.find((entry) => entry.id === style)?.short}
          />
        </div>
        <div className="mt-3">
          <EntryFields fields={fields} onChange={setFields} idSuffix="" showType={false} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The source type is fixed to journal article: this formatter exists for the case where volume, issue, pages and
          DOI all matter. For books, chapters and the rest, the citation formatter covers every type in one form.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Formatted reference</PanelTitle>
        {!hasSource ? (
          <EmptyState>Fill in the article fields above — the reference appears as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Reference length"
              value={`${result.bibliography.split(/\s+/).filter(Boolean).length} words`}
              testid="res-length"
              sub={result.styleLabel}
            />
            <OutputBlock name="entry" value={result.bibliography} maxHeight={220} mono={false} />
            <p className="mt-2 text-xs text-muted-foreground">
              In-text: <span data-testid="res-intext" className="font-mono text-foreground">{result.inText}</span>
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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={result.bibliography} testid="copy-entry" label="Copy reference" />
              <DownloadButton text={report} filename="journal-reference.txt" testid="download-entry" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>What each style expects of a journal entry</PanelTitle>
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
              {CHECKLIST.map((row) => (
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
            The formatter implements the journal-article pattern of the three editions listed, from the fields you
            supply. Article numbers are supported for online-only journals; Chicago prints them in the page slot, so if
            you use an article number with Chicago the field checker says so rather than silently dropping it.
          </Notice>
          <Notice tone="warn">
            There is no such thing as one reference format for &ldquo;academic journals&rdquo;. Individual journals
            publish house styles, sometimes a modified version of APA or Vancouver, and this tool cannot know which one
            you are submitting to. Check the target journal&rsquo;s author guidelines and use the checklist above to see
            which fields it needs before you adapt the entry.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
