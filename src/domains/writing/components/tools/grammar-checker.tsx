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
import { GRAMMAR_CHECKS, checkGrammar } from "@/domains/writing/lib/text/grammar.ts";

/**
 * A fixed set of mechanical checks, not a parser. The page names all six checks
 * and shows the count for each, so "no issues found" always means "none of these
 * six rules fired" rather than an unqualified claim about grammar.
 */
export default function GrammarChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => checkGrammar(text), [text]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(
    () =>
      [
        `Issues found: ${result.findings.length} across ${result.words} words`,
        ...GRAMMAR_CHECKS.map((check) => `  ${check.label}: ${result.counts[check.id] ?? 0}`),
        "",
        ...result.findings.map(
          (finding) => `${finding.label}: ${finding.message}${finding.suggestion ? ` → ${finding.suggestion}` : ""}`,
        ),
      ].join("\n"),
    [result],
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
          placeholder="Paste a paragraph or a whole draft. Six mechanical checks run as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summary : ""}
            filename="grammar-report.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Issues by check</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Mechanical issues"
              value={result.findings.length}
              testid="res-issues"
              sub={`${result.words} words across ${result.sentences} sentences`}
            />
            <StatGrid>
              {GRAMMAR_CHECKS.map((check) => (
                <Stat
                  key={check.id}
                  label={check.label}
                  value={result.counts[check.id] ?? 0}
                  testid={`res-count-${check.id}`}
                />
              ))}
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.findings.length > 0 && (
        <Panel>
          <PanelTitle>What was found</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-findings" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Check</th>
                  <th className="py-2 pr-3 font-semibold">Issue</th>
                  <th className="py-2 pr-3 font-semibold">Suggested fix</th>
                  <th className="py-2 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.slice(0, 60).map((finding, index) => (
                  <tr key={`${finding.rule}-${finding.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{finding.label}</td>
                    <td className="py-2 pr-3 text-foreground">{finding.message}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{finding.suggestion ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{finding.snippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.findings.length > 60 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing the first 60 of {result.findings.length} findings.
            </p>
          )}
        </Panel>
      )}

      {hasText && result.findings.length === 0 && (
        <Panel>
          <PanelTitle>Result</PanelTitle>
          <Notice>
            None of the six checks below fired. That is a real result, not a guarantee: this tool runs mechanical rules,
            not a grammatical parse, so a sentence can be wrong in a way none of these rules looks for.
          </Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What is checked</PanelTitle>
        <div className="space-y-2">
          <Notice tone="info">
            These six checks run, and only these six: repeated words; a / an agreement; confusion pairs (your/you're,
            its/it&apos;s, then/than, to/too, loose/lose, affect/effect, weather/whether); sentence capitalisation;
            paragraphs without terminal punctuation; and unmatched brackets and quotation marks.
          </Notice>
          <Notice tone="warn">
            This is not a full grammar checker. It has no parser, so it cannot judge tense, agreement in complex
            clauses, dangling modifiers or word order. Choose a tool that states what it checks over one that claims
            everything.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
