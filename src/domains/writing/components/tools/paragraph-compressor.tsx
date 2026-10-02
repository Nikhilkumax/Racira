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
import { compressParagraph } from "@/domains/writing/lib/text/paragraph-compressor.ts";

/**
 * Paragraph compressor: four documented cuts — hedges, wordy phrases, redundant
 * pairs and repeated sentences — with the reduction and every cut listed.
 */
export default function ParagraphCompressor() {
  const [text, setText] = useState("");
  const report = useMemo(() => compressParagraph(text), [text]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your paragraph</PanelTitle>
        <TextArea
          name="text"
          label="Paragraph to compress"
          value={text}
          onChange={setText}
          rows={7}
          placeholder="Paste a padded paragraph. Hedges, wordy phrases and repeated sentences are cut."
        />
      </Panel>

      <Panel>
        <PanelTitle right={report.output ? <CopyButton text={report.output} testid="copy-compressed" /> : undefined}>
          Compressed version
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState>Paste a paragraph — the compressed version builds as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Removed"
              value={`${report.reduction}%`}
              testid="res-reduction"
              sub={`${report.beforeWords} words to ${report.afterWords}`}
            />
            <StatGrid>
              <Stat label="Before" value={report.beforeWords} testid="res-before" />
              <Stat label="After" value={report.afterWords} testid="res-after" />
              <Stat label="Cuts made" value={report.changes.length} testid="res-cuts" />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="compressed" value={report.output} />
            </div>
            <div className="mt-3">
              <DownloadButton text={report.output} filename="compressed.txt" testid="download-compressed" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>What was cut</PanelTitle>
        {report.changes.length === 0 && report.dropped.length === 0 ? (
          <EmptyState>No documented cut applies to this paragraph.</EmptyState>
        ) : (
          <>
            <ul className="space-y-2" data-testid="res-changes">
              {report.changes.map((change, index) => (
                <li
                  key={`${index}-${change.from}`}
                  className="rounded-lg border border-border bg-card/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {change.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{change.from}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono text-xs text-foreground">{change.to || "(removed)"}</span>
                  </div>
                </li>
              ))}
            </ul>
            {report.dropped.length > 0 && (
              <ul className="mt-3 space-y-2" data-testid="res-dropped">
                {report.dropped.map((entry, index) => (
                  <li
                    key={`${index}-${entry.sentence}`}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
                  >
                    Dropped as {Math.round(entry.overlap * 100)}% identical to: {entry.duplicateOf}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>

      {report.checks.length > 0 && (
        <Panel>
          <PanelTitle>Notes</PanelTitle>
          <ul className="space-y-2" data-testid="res-checks">
            {report.checks.map((check) => (
              <li key={check}>
                <Notice>{check}</Notice>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Only published entries are cut: hedge phrases, wordy phrases, redundant pairs, and a sentence whose content
            words overlap an earlier sentence by {Math.round(0.6 * 100)}% or more. Nothing is paraphrased.
          </Notice>
          <Notice tone="warn">
            A dropped sentence is gone from the copy, not from the draft. Read the compressed version in context before
            replacing the paragraph, and keep the original if the repetition was doing work.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
