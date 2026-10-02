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
import { LONG_SENTENCE_WORDS, simplifyText } from "@/domains/writing/lib/text/simplify-text.ts";

/** One decimal, trailing zero dropped, so "28" rather than "28.0". */
const round1 = (value: number): string => String(Math.round(value * 10) / 10);

/**
 * Simplify text: replace published wordy phrases and split sentences that are
 * still past the long-sentence threshold, with before/after metrics.
 */
export default function SimplifyTextTool() {
  const [text, setText] = useState("");
  const report = useMemo(() => simplifyText(text), [text]);

  const simplified = report.simplifications.map((entry) => entry.simplified).join(" ");

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Text to simplify"
          value={text}
          onChange={setText}
          rows={7}
          placeholder="Paste a paragraph — wordy phrases are replaced and long sentences are split."
        />
      </Panel>

      <Panel>
        <PanelTitle right={simplified ? <CopyButton text={simplified} testid="copy-simplified" /> : undefined}>
          Simplified version
        </PanelTitle>
        {report.simplifications.length === 0 ? (
          <EmptyState>Paste a sentence — the simplified version builds as you type.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Phrases replaced"
              value={report.replacementCount}
              testid="res-replacements"
              sub={`across ${report.changedSentences} of ${report.simplifications.length} sentences`}
            />
            <StatGrid>
              <Stat label="Sentences split" value={report.splitCount} testid="res-splits" />
              <Stat
                label="Avg sentence length"
                value={`${round1(report.before.averageSentenceLength)} → ${round1(report.after.averageSentenceLength)}`}
                testid="res-sentence-length"
              />
              <Stat
                label="Long words"
                value={`${Math.round(report.before.longWordShare * 100)}% → ${Math.round(report.after.longWordShare * 100)}%`}
                testid="res-long-words"
              />
            </StatGrid>
            <div className="mt-3">
              <OutputBlock name="simplified" value={simplified} />
            </div>
            <div className="mt-3">
              <DownloadButton text={simplified} filename="simplified.txt" testid="download-simplified" />
            </div>
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>What changed, sentence by sentence</PanelTitle>
        {report.simplifications.length === 0 ? (
          <EmptyState>No text yet.</EmptyState>
        ) : (
          <ul className="space-y-3" data-testid="res-sentences">
            {report.simplifications.map((entry, index) => (
              <li key={`${index}-${entry.source}`} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {entry.words} words · {entry.split ? "split" : entry.replacements.length > 0 ? "rewritten" : "unchanged"}
                  </p>
                  <CopyButton text={entry.simplified} testid={`copy-sentence-${index + 1}`} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.source}</p>
                <p className="mt-1 text-sm text-foreground">{entry.simplified}</p>
                {entry.replacements.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {entry.replacements.map((replacement) => (
                      <li
                        key={`${replacement.index}-${replacement.phrase}`}
                        className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {replacement.source} → {replacement.replacement}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Substitutions come from a published wordiness table and a split only happens at a comma with and/but/so/
            yet/or or a semicolon. Sentences past {LONG_SENTENCE_WORDS} words without such a seam are left whole.
          </Notice>
          <Notice tone="warn">
            Shorter is not automatically clearer, and a split changes the rhythm of a paragraph. Read the simplified
            version in context before replacing the original.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
