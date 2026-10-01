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
  StackLayout,
  TextArea,
} from "./ui";
import { FALLACY_RULES, detectFallacies, fallacyReport } from "@/domains/writing/lib/text/fallacy.ts";

const SAMPLE = [
  "Everyone knows the plan is wrong, so it must be.",
  "Either we cut the budget or the project fails completely.",
  "It will lead to chaos next year.",
].join("\n");

/**
 * Logical fallacy detector: a documented set of cue phrases for the common
 * informal fallacies. It flags sentences that carry a cue and names the fallacy
 * the phrase suggests — a prompt to look, not a verdict.
 */
export default function LogicalFallacyDetector() {
  const [text, setText] = useState(SAMPLE);
  const findings = useMemo(() => detectFallacies(text), [text]);
  const report = useMemo(() => fallacyReport(findings), [findings]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your argument</PanelTitle>
        <TextArea
          name="text"
          label="Paste the passage to check — one argument per line"
          value={text}
          onChange={setText}
          rows={12}
          placeholder="Everyone knows the plan is wrong."
        />
      </Panel>

      <Panel>
        <PanelTitle>Findings</PanelTitle>
        {findings.length === 0 ? (
          <EmptyState>No cue phrases found. That is not the same as a sound argument — only that this list did not match.</EmptyState>
        ) : (
          <>
            <HeroStat label="Possible issues" value={findings.length} testid="res-count" sub="sentences with a cue phrase" />
            <ul data-testid="res-findings" className="space-y-3">
              {findings.map((finding, index) => (
                <li key={`${finding.id}-${index}`} className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-sm font-semibold text-foreground">{finding.name}</p>
                  <p className="mt-1 font-mono text-xs text-foreground">&ldquo;{finding.cue}&rdquo;</p>
                  <p className="mt-1 text-xs text-muted-foreground">{finding.sentence}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{finding.explanation}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={report} testid="copy-report" label="Copy report" />
              <DownloadButton text={report} filename="fallacy-report.txt" testid="download-report" label="Download" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Report</PanelTitle>
        <OutputBlock name="report" value={report} maxHeight={260} mono={false} />
      </Panel>

      <Panel>
        <PanelTitle>The cues this tool knows</PanelTitle>
        <ul data-testid="res-reference" className="space-y-2 text-sm">
          {FALLACY_RULES.map((rule) => (
            <li key={rule.id} className="border-t border-border/60 pt-2 first:border-0 first:pt-0">
              <span className="font-semibold text-foreground">{rule.name}</span>
              <span className="text-muted-foreground"> — {rule.description}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            This is a lexical detector, not a logic engine. It matches a fixed list of cue phrases and reports what each
            phrase usually signals, so a flagged sentence may be perfectly sound and an unsound one may carry no cue at
            all.
          </Notice>
          <Notice tone="warn">
            The list is not exhaustive — every fallacy has forms without a stock phrase — and it makes no judgement about
            your conclusion. Treat a finding as a place to look, then decide for yourself whether the reasoning holds.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
