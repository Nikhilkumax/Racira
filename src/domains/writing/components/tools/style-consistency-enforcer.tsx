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
  StatGrid,
  Stat,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { analyzeStyleConsistency, formatStyleConsistencyReport } from "@/domains/writing/lib/text/style-consistency.ts";

/**
 * Style consistency enforcer: eight mechanical families compared across one
 * document — quotation marks, dashes, ellipses, serial commas, list punctuation,
 * numbers below ten, heading capitalisation and date order. The question is
 * never which convention is right; it is whether this document uses one or two.
 * Every family's method and counts are printed so a "mixed" verdict can be
 * checked against the text rather than taken on faith.
 */
export default function StyleConsistencyEnforcer() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);

  const result = useMemo(() => analyzeStyleConsistency(text), [text]);
  const hasText = text.trim().length > 0;
  const report = useMemo(() => formatStyleConsistencyReport(result), [result]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your document</PanelTitle>
        <TextArea
          name="text"
          label="Paste the whole document"
          value={raw}
          onChange={setRaw}
          rows={12}
          placeholder={"Paste the document as one block — headings, lists and prose. Each check compares the document with itself; no style guide is applied."}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? report : ""} testid="copy-report" label="Copy report" />
          <DownloadButton text={hasText ? report : ""} filename="style-consistency-report.txt" testid="download-report" label="Download report" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Your text is analysed in this browser and nothing is uploaded. The report is kept only if you copy or
          download it.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Consistency</PanelTitle>
        {!hasText ? (
          <EmptyState>Paste a document above — the eight families are compared as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Mixed families"
              value={result.mixedFamilies.length}
              testid="res-mixed"
              sub={`${result.consistentFamilies.length} consistent · ${result.emptyFamilies.length} with no evidence`}
            />
            <StatGrid>
              <Stat label="Words" value={result.words.toLocaleString("en-US")} />
              <Stat label="Sentences" value={result.sentences.toLocaleString("en-US")} />
              <Stat label="Headings checked" value={result.headingsChecked} testid="res-headings" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.mixedFamilies.length > 0 && (
        <Panel>
          <PanelTitle>Deviations from each family&rsquo;s dominant convention</PanelTitle>
          <ul data-testid="res-deviations" className="space-y-3">
            {result.deviations.map((deviation, index) => (
              <li key={`${deviation.family}-${deviation.index}-${index}`} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{deviation.familyLabel}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {deviation.matched} → expected {deviation.expected}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{deviation.snippet}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Family table: what was compared and what was found</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-families" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Family</th>
                  <th className="py-2 pr-3 font-semibold">Verdict</th>
                  <th className="py-2 pr-3 font-semibold">Found</th>
                  <th className="py-2 font-semibold">Method</th>
                </tr>
              </thead>
              <tbody>
                {result.families.map((family) => (
                  <tr key={family.id} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-medium text-foreground">{family.label}</td>
                    <td className="py-2 pr-3">
                      {family.occurrences === 0 ? (
                        <span className="text-muted-foreground">no evidence</span>
                      ) : family.mixed ? (
                        <span className="font-semibold text-amber-700 dark:text-amber-300">mixed</span>
                      ) : (
                        <span className="text-foreground">consistent</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">
                      {family.counts.length > 0
                        ? family.counts.map((count) => `${count.label} ×${count.count}`).join(", ")
                        : "—"}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{family.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Scope and limits</PanelTitle>
          <div className="space-y-2">
            <Notice>
              The enforcer compares the document with itself. It applies no style guide, states no preference and
              rewrites nothing — a consistent document needs no action at all, whichever convention it chose. Where a
              guide&rsquo;s rules are the question instead, the Style Guide Adherence Checker measures the text against a
              named preset.
            </Notice>
            <Notice tone="warn">
              Every family is a pattern, not a parse. A serial-comma match inside a quotation still counts, list items
              are judged one line at a time, numeric dates whose day and month are both 12 or less are reported as
              ambiguous rather than guessed, and heading case is estimated from capitalisation alone. Treat a mixed
              verdict as a place to look, not a proof of error.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
