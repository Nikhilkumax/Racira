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
import { PUNCTUATION_RULES, checkPunctuation, formatPunctuationReport } from "@/domains/writing/lib/text/punctuation.ts";

/**
 * Mechanical punctuation checks, with the rule list published on the page.
 *
 * Everything reported is visible in the character stream — a space before a
 * comma, a bracket that never closes, a paragraph with no full stop. The
 * judgements a machine cannot make (comma splices, Oxford commas, deliberate
 * style) are named as out of scope rather than guessed at.
 */
export default function PunctuationChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => checkPunctuation(text), [text]);
  const hasText = text.trim().length > 0;

  const errors = useMemo(
    () => result.findings.filter((finding) => finding.severity === "error").length,
    [result],
  );
  const style = result.findings.length - errors;

  const summary = useMemo(
    () =>
      [
        ...PUNCTUATION_RULES.map((rule) => `${rule.label}: ${result.counts[rule.id] ?? 0}`),
        "",
        formatPunctuationReport(result, text),
      ].join("\n"),
    [result, text],
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
          placeholder="Paste a paragraph or a whole draft. Every mechanical punctuation check runs as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="punctuation-report.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Punctuation findings"
              value={result.findings.length}
              testid="res-findings"
              sub={`${errors} likely errors · ${style} style observations`}
            />
            <StatGrid>
              {PUNCTUATION_RULES.map((rule) => (
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
            <table data-testid="res-findings-table" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Check</th>
                  <th className="py-2 pr-3 font-semibold">Issue</th>
                  <th className="py-2 pr-3 font-semibold">Mechanical fix</th>
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

      {hasText && result.findings.length === 0 && (
        <Panel>
          <PanelTitle>Result</PanelTitle>
          <Notice>
            None of the {PUNCTUATION_RULES.length} checks fired. Worth keeping in perspective: they see the character
            stream, so a sentence can be punctuated in a way none of them looks for.
          </Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this checks, and what it cannot</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The {PUNCTUATION_RULES.length} checks are: a space before punctuation; a missing space after it; punctuation
            repeated; an ellipsis that is not three dots; unmatched brackets; unbalanced quotation marks; a paragraph
            with no end punctuation; a hyphen used as a dash; a double hyphen; a space after an opening bracket; a space
            before a closing one.
          </Notice>
          <Notice tone="warn">
            Not covered, because each needs a judgement rather than a pattern: comma splices, the Oxford comma, a comma
            that changes meaning, a missing apostrophe (that is the Apostrophe Error Finder), and dialogue punctuation.
            A comma can be right in every mechanical sense and still be wrong in the sentence.
          </Notice>
          <Notice>
            Deliberate marks are reported as style, not error: an em dash run, a rhetorical &quot;?!&quot;, and a
            stylistic ellipsis are yours to keep. Near-misses are excluded by design — 1,000 and 10:30, e.g. and J.K.,
            a comma inside a closing quote, and anything inside a URL.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
