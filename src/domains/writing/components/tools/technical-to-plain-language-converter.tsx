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
  Stat,
  StatGrid,
  TextArea,
} from "./ui";
import { toPlainLanguage } from "@/domains/writing/lib/text/technical-to-plain-language.ts";

/**
 * Technical to plain language: expand acronyms, replace jargon and name the long
 * words still left in the plain version.
 */
export default function TechnicalToPlainLanguageConverter() {
  const [text, setText] = useState("");
  const report = useMemo(() => toPlainLanguage(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Technical text</PanelTitle>
        <TextArea
          name="text"
          label="Text to convert"
          value={text}
          onChange={setText}
          rows={7}
          placeholder="Paste a technical paragraph — acronyms are expanded and jargon is replaced."
        />
      </Panel>

      <Panel>
        <PanelTitle right={report.output ? <CopyButton text={report.output} testid="copy-plain" /> : undefined}>
          Plain-language version
        </PanelTitle>
        {report.findings.length === 0 && text.trim().length === 0 ? (
          <EmptyState>Paste a paragraph — the plain version builds as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Terms rewritten"
              value={report.findings.length}
              testid="res-findings"
              sub={`${report.abbreviationCount} acronyms expanded across ${report.sentences} sentences`}
            />
            <StatGrid>
              <Stat label="Acronyms" value={report.abbreviationCount} testid="res-abbreviations" />
              <Stat label="Sentences" value={report.sentences} testid="res-sentences" />
              <Stat label="Left untouched" value={report.leftover.length} testid="res-leftover-count" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="plain" value={report.output} />
            </div>
            <div className="mt-3">
              <DownloadButton text={report.output} filename="plain-language.txt" testid="download-plain" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Term by term</PanelTitle>
        {report.findings.length === 0 ? (
          <EmptyState>No term from either table appears in this text.</EmptyState>
        ) : (
          <ul className="space-y-2" data-testid="res-terms">
            {report.findings.map((finding, index) => (
              <li key={`${index}-${finding.source}`} className="rounded-lg border border-border bg-card/40 px-3 py-2">
                <div className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{finding.source}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium text-foreground">{finding.plain}</span>
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    found in a sentence of {finding.sentenceWords} words
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{finding.note}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Long words still untouched</PanelTitle>
        {report.leftover.length === 0 ? (
          <EmptyState>Nothing long and unlisted survived the conversion.</EmptyState>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5" data-testid="res-leftover">
              {report.leftover.map((word) => (
                <li
                  key={word}
                  className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {word}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              These are twelve letters or longer and appear in neither table, so the converter left them as written.
            </p>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Two published tables do the work: the shared jargon list and a local abbreviation list. Nothing is
            paraphrased, and a term that is not on a list is never touched.
          </Notice>
          <Notice tone="warn">
            Some listed terms are precise in the right context — an API really is an API in developer documentation.
            Every substitution is listed with its sentence, so it can be reviewed rather than trusted.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
