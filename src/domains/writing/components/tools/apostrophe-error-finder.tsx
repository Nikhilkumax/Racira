"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  APOSTROPHE_RULES,
  MISSING_APOSTROPHE_FORMS,
  checkApostrophes,
  formatApostropheReport,
} from "@/domains/writing/lib/text/apostrophes.ts";

/**
 * Apostrophe checks built on a published, closed list of apostrophe-less
 * spellings ("dont", "isnt", "oclock"), because a list that is printed on the
 * page can be checked by the reader. The ambiguous entries ("lets", "wont")
 * only fire when the next word proves the contraction.
 */
export default function ApostropheErrorFinder() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => checkApostrophes(text), [text]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(
    () =>
      [
        ...APOSTROPHE_RULES.map((rule) => `${rule.label}: ${result.counts[rule.id] ?? 0}`),
        "",
        formatApostropheReport(result),
      ].join("\n"),
    [result],
  );

  const listed = useMemo(
    () => Object.entries(MISSING_APOSTROPHE_FORMS).map(([form, fix]) => `${form} → ${fix}`),
    [],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste a draft. Dropped apostrophes and stray marks are reported as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="apostrophe-report.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Apostrophe findings"
              value={result.findings.length}
              testid="res-findings"
              sub={`${result.listedForms} apostrophe-less spellings in the published list`}
            />
            <StatGrid>
              {APOSTROPHE_RULES.map((rule) => (
                <Stat key={rule.id} label={rule.label} value={result.counts[rule.id] ?? 0} testid={`res-count-${rule.id}`} />
              ))}
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.findings.length > 0 && (
        <Panel>
          <PanelTitle>Findings</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-findings-table" className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Check</th>
                  <th className="py-2 pr-3 font-semibold">Issue</th>
                  <th className="py-2 pr-3 font-semibold">Fix</th>
                  <th className="py-2 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.map((finding, index) => (
                  <tr key={`${finding.rule}-${finding.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {finding.label}
                      <span className="ml-1 rounded bg-muted px-1 py-0.5 text-[10px] uppercase">{finding.severity}</span>
                    </td>
                    <td className="py-2 pr-3 text-foreground">{finding.message}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{finding.suggestion ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{finding.snippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>The published list</PanelTitle>
        <div className="max-h-64 overflow-auto rounded-lg border border-border bg-background px-3 py-2">
          <p data-testid="res-listed-forms" className="font-mono text-xs leading-relaxed text-muted-foreground">
            {listed.join(" · ")}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          <Notice>
            These are the {result.listedForms} spellings that only exist with an apostrophe. The engine holds nothing
            else: no general word list, no guessing. If a spelling is not in this list and is not one of the stray-mark or
            decade patterns, it is not reported.
          </Notice>
          <Notice tone="warn">
            Three entries are also real words — lets, wont and im — so they fire only when the next word proves the
            contraction: &quot;lets you and me go&quot; is reported, &quot;the plan lets you save&quot; is not. its and
            it&apos;s, who&apos;s and whose, and they&apos;re, their and there belong to the Homophone Confusion Detector,
            which can read the context; this tool deliberately stays out of them.
          </Notice>
          <Notice>
            A missing possessive apostrophe is out of scope. &quot;the students books&quot; needs to know that students
            is the owner and books the thing owned, and a plural possessive (&quot;the dogs&apos; toys&quot;) is accepted
            as written rather than rewritten.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
