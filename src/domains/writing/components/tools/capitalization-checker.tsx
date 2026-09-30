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
  CAPITALIZATION_RULES,
  checkCapitalization,
  formatCapitalizationReport,
} from "@/domains/writing/lib/text/capitalization.ts";

/**
 * Five capitalisation checks: sentence starts, the pronoun I, day, month,
 * language and nationality names, ALL-CAPS words and capitals inside a word.
 *
 * Scope note shown on the page: country, continent and planet names belong to
 * the Proper Noun Checker, which also looks for a name written two ways.
 */
export default function CapitalizationChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => checkCapitalization(text), [text]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(
    () =>
      [
        ...CAPITALIZATION_RULES.map((rule) => `${rule.label}: ${result.counts[rule.id] ?? 0}`),
        "",
        formatCapitalizationReport(result),
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
          placeholder="Paste a draft. Lower-case sentence starts, a lower-case “i” and stray capitals are reported as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="capitalization-report.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Capitalisation findings"
              value={result.findings.length}
              testid="res-findings"
              sub={`${result.namesChecked} day, month, language and nationality names in the name rule`}
            />
            <StatGrid>
              {CAPITALIZATION_RULES.map((rule) => (
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
                  <th className="py-2 pr-3 font-semibold">Suggested fix</th>
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
        <PanelTitle>What is checked, and what is left alone</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The {CAPITALIZATION_RULES.length} checks are: a lower-case word after a full stop, question mark or
            exclamation mark (a lower-case start of the text or of a line counts too); the pronoun &quot;i&quot; written
            lower-case, including i&apos;m and i&apos;ve; a lower-case day, month, language or nationality; a word in ALL
            CAPS; and a capital inside an ordinary word.
          </Notice>
          <Notice tone="warn">
            Two of the five are style, not error. ALL CAPS can be deliberate emphasis and a capital inside a word is
            often part of a brand, so both are reported with a style severity. The acronym allowlist covers the everyday
            ones (API, URL, JSON, PDF, SEO, CEO, USA), and brand names such as iPhone, macOS, YouTube and GitHub are never
            rewritten.
          </Notice>
          <Notice>
            Names that are also ordinary words are never flagged on their own: &quot;I may go in march&quot;, &quot;we
            polish the table&quot; and &quot;an august evening&quot; all stay clean. Abbreviations (e.g., i.e.) and
            initials (J.K.) do not count as sentence ends, and a deliberate lower-case start after an ellipsis is left
            alone.
          </Notice>
          <Notice tone="warn">
            Country, continent and planet names are the Proper Noun Checker&apos;s job, because that tool also looks for
            a name written two different ways. This checker handles the names that follow a plain case rule.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
