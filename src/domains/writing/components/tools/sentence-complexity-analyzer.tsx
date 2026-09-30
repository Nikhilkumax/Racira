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
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  COORDINATING_CONJUNCTIONS,
  RELATIVE_PRONOUNS,
  SUBORDINATING_CONJUNCTIONS,
  complexitySummary,
  sentenceDetails,
} from "@/domains/writing/lib/text/sentence-metrics.ts";

/**
 * Sentence complexity: the clause count is a documented estimate, so the panel
 * that explains it sits on the page next to the numbers rather than behind a
 * tooltip. Commas are shown but never counted — a three-item list is not three
 * clauses — which is exactly the over-count a reader would expect from a naive
 * tool, so the page says so plainly.
 */
export default function SentenceComplexityAnalyzer() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const details = useMemo(() => sentenceDetails(text), [text]);
  const summary = useMemo(() => complexitySummary(details), [details]);
  const hasText = details.length > 0;

  const pct = (value: number) => `${(value * 100).toFixed(0)}%`;

  const summaryText = useMemo(
    () =>
      [
        `Sentences: ${details.length}`,
        `Average clause estimate: ${summary.averageClauses.toFixed(2)}`,
        `Average words per clause: ${summary.averageWordsPerClause.toFixed(1)}`,
        `Single-clause sentences: ${pct(summary.singleClauseShare)}`,
        `Sentences with 3+ clause markers: ${pct(summary.threeOrMoreShare)}`,
        "",
        "Longest sentences:",
        ...summary.longest.map((s) => `  ${s.words} words / ${s.clauses} clauses — ${s.text}`),
      ].join("\n"),
    [details.length, summary],
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
          rows={10}
          placeholder="Paste a paragraph or a whole draft. Each sentence is measured for length and clause load."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy analysis" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="sentence-complexity.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Complexity at a glance</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Average clauses per sentence"
              value={summary.averageClauses.toFixed(2)}
              testid="res-avg-clauses"
              sub={`across ${details.length} sentence${details.length === 1 ? "" : "s"}`}
            />
            <ResultBox>
              <ResultRow name="sentences" label="Sentences" value={details.length.toLocaleString("en-US")} />
              <ResultRow
                name="avg-wpc"
                label="Average words per clause"
                value={summary.averageWordsPerClause.toFixed(1)}
              />
              <ResultRow
                name="single-share"
                label="Single-clause sentences"
                value={`${pct(summary.singleClauseShare)} (${details.filter((d) => d.clauses <= 1).length})`}
              />
              <ResultRow
                name="complex-share"
                label="Sentences with 3+ clauses"
                value={`${pct(summary.threeOrMoreShare)} (${details.filter((d) => d.clauses >= 3).length})`}
              />
              <ResultRow
                name="longest-words"
                label="Longest sentence"
                value={`${summary.longest[0]?.words ?? 0} words`}
              />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Sentences carrying the most clauses</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-clausal" className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Clauses</th>
                  <th className="py-2 pr-3 font-semibold">Words</th>
                  <th className="py-2 pr-3 font-semibold">Words / clause</th>
                  <th className="py-2 font-semibold">Sentence</th>
                </tr>
              </thead>
              <tbody>
                {summary.mostClausal.map((sentence) => (
                  <tr key={sentence.index} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.clauses}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.words}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.wordsPerClause.toFixed(1)}</td>
                    <td className="py-2 text-foreground">{sentence.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Longest sentences</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-longest" className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Words</th>
                  <th className="py-2 pr-3 font-semibold">Clauses</th>
                  <th className="py-2 pr-3 font-semibold">Commas</th>
                  <th className="py-2 pr-3 font-semibold">3+ syllable words</th>
                  <th className="py-2 font-semibold">Sentence</th>
                </tr>
              </thead>
              <tbody>
                {summary.longest.map((sentence) => (
                  <tr key={sentence.index} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.words}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.clauses}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.commas}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{sentence.complexWords}</td>
                    <td className="py-2 text-foreground">{sentence.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How the clause count works</PanelTitle>
          <div className="space-y-2">
            <Notice>
              The clause estimate starts at one and rises by one for each of the {COORDINATING_CONJUNCTIONS.length}{" "}
              coordinating conjunctions (and, but, or, nor, for, yet, so), the {SUBORDINATING_CONJUNCTIONS.length}{" "}
              subordinating conjunctions (because, although, while, when …), the {RELATIVE_PRONOUNS.length} relative
              pronouns (that, which, who, whom, whose) and each semicolon or colon.
            </Notice>
            <Notice>
              Commas are reported but never counted as clauses. A list of three items separated by commas is one clause,
              not four — counting commas would make ordinary lists look unreadable.
            </Notice>
            <Notice tone="warn">
              This is an estimate, not a parse. It is good at flagging sentences that carry too much and cannot tell a
              restrictive clause from an appositive. Read the flagged sentences before rewriting them.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
