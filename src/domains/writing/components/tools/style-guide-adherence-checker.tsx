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
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { STYLE_GUIDES, checkStyle, type StyleGuideId } from "@/domains/writing/lib/text/style-guide.ts";

/**
 * A documented subset of mechanical style rules, with the preset's preference
 * printed for each one. Choosing a guide changes which way a rule points (AP
 * omits the serial comma, Chicago requires it), and the preference table makes
 * that visible instead of leaving the reader to guess.
 */
export default function StyleGuideAdherenceChecker() {
  const [raw, setRaw] = useState("");
  const [guideId, setGuideId] = useState<string>("chicago");
  const text = useDebouncedValue(raw, 250);

  const result = useMemo(() => checkStyle(text, guideId as StyleGuideId), [text, guideId]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Guide: ${result.guide.name}`,
        `Findings: ${result.findings.length} across ${result.words} words`,
        "",
        ...result.findings.map((finding) => `${finding.ruleLabel}: ${finding.found} → ${finding.suggestion}`),
      ].join("\n"),
    [result],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text and guide</PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste a draft. The chosen guide decides which way each mechanical rule points."
        />
        <div className="mt-3 max-w-sm">
          <Select
            name="guide"
            label="Style guide"
            value={guideId}
            onChange={setGuideId}
            options={STYLE_GUIDES.map((guide) => ({ value: guide.id, label: guide.name }))}
            hint={result.guide.rules.serialComma ? "serial comma" : "no serial comma"}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.guide.note}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="style-guide-findings.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Findings</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Rule findings"
            value={result.findings.length}
            testid="res-issues"
            sub={`${result.rules.length} rules checked against ${result.guide.name}`}
          />
        )}
      </Panel>

      {hasText && result.findings.length > 0 && (
        <Panel>
          <PanelTitle>What to change</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-findings" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Rule</th>
                  <th className="py-2 pr-3 font-semibold">Found</th>
                  <th className="py-2 pr-3 font-semibold">Suggestion</th>
                  <th className="py-2 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.slice(0, 60).map((finding, index) => (
                  <tr key={`${finding.rule}-${finding.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 text-foreground">{finding.ruleLabel}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{finding.found}</td>
                    <td className="py-2 pr-3 text-foreground">{finding.suggestion}</td>
                    <td className="py-2 text-muted-foreground">{finding.snippet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Rules checked, and the preference in force</PanelTitle>
        <div className="overflow-x-auto">
          <table data-testid="res-rules" className="w-full min-w-[24rem] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3 font-semibold">Rule</th>
                <th className="py-2 font-semibold">{result.guide.name} preference</th>
              </tr>
            </thead>
            <tbody>
              {result.rules.map((rule) => (
                <tr key={rule.id} className="border-t border-border/60">
                  <td className="py-2 pr-3 text-foreground">{rule.label}</td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">{rule.preference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Scope</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Only mechanical rules are checked: serial commas, quotation marks, figures below a threshold, em-dash
            spacing, sentence spacing, spaces before punctuation and the commas after e.g. and i.e. Each one is a fact
            about the text, and the preference it is judged against is listed in the table above.
          </Notice>
          <Notice tone="warn">
            A style guide cannot be reduced to rules a script can test. Headings, title capitalisation, citation format,
            hyphenation, abbreviations and every judgement call are out of scope. Treat a clean report as &quot;none of
            these seven rules&nbsp;fired&quot;, not as conformance to the guide.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
