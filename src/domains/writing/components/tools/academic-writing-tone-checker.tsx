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
import { academicRegisterAnalysis } from "@/domains/writing/lib/text/register.ts";

/**
 * An academic-register checklist: each rule is a counted marker with a pass or
 * warn status. Hedging is deliberately never a warning, because hedged claims
 * are a normal academic move; the checklist says which conventions it enforces
 * and leaves disciplinary judgement to the writer.
 */
export default function AcademicWritingToneChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => academicRegisterAnalysis(text), [text]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Warnings: ${result.warnings} of ${result.checks.length} checks`,
        "",
        ...result.checks.map(
          (check) => `${check.status === "warn" ? "WARN" : "ok"}  ${check.label}: ${check.count}`,
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
          placeholder="Paste an abstract, a paragraph or a section. Each register convention is counted as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="academic-register.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Register checklist</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Conventions flagged"
              value={result.warnings}
              testid="res-warnings"
              sub={`of ${result.checks.length} checks across ${result.words} words`}
            />
            <StatGrid>
              {result.checks.map((check) => (
                <Stat
                  key={check.id}
                  label={check.label}
                  value={check.status === "warn" ? `Warn (${check.count})` : "Pass"}
                  testid={`res-check-${check.id}`}
                />
              ))}
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>What each check means</PanelTitle>
          <div className="space-y-3" data-testid="res-detail">
            {result.checks.map((check) => (
              <div key={check.id} className="border-b border-border/60 pb-2 last:border-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">{check.label}</span>
                  <span
                    className={`font-mono text-xs font-bold ${
                      check.status === "warn" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    }`}
                  >
                    {check.status === "warn" ? `${check.count} found` : "ok"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{check.message}</p>
                {check.examples.length > 0 && (
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    e.g. {check.examples.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Scope and caveats</PanelTitle>
          <div className="space-y-2">
            <Notice>
              Each rule counts a published list: contractions, second-person pronouns, informal vocabulary,
              intensifiers, vague quantifiers and first-person singular, plus exclamation marks and questions. Hedges are
              counted but never flagged, because careful qualification strengthens an academic claim.
            </Notice>
            <Notice tone="warn">
              Register conventions differ between fields and journals. Passive voice, first person and even contractions
              are accepted in some disciplines and avoided in others. Use this checklist as a starting point and defer to
              your target publication&apos;s own guidance.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
