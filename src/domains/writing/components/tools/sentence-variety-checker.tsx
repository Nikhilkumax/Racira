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
  ProgressBar,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { sentenceDetails, varietySummary } from "@/domains/writing/lib/text/sentence-metrics.ts";

/**
 * Sentence variety: the length distribution, its spread, and the longest run of
 * near-identical sentences. Rhythm is a real, measurable property of a draft —
 * the standard deviation of sentence length is the number, and the bucket bars
 * show where the sentences cluster.
 */
export default function SentenceVarietyChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const details = useMemo(() => sentenceDetails(text), [text]);
  const summary = useMemo(() => varietySummary(details), [details]);
  const hasText = summary.count > 0;

  const pct = (value: number) => `${(value * 100).toFixed(0)}%`;

  const summaryText = useMemo(
    () =>
      [
        `Sentences: ${summary.count}`,
        `Mean length: ${summary.meanWords.toFixed(1)} words`,
        `Median length: ${summary.medianWords.toFixed(0)} words`,
        `Standard deviation: ${summary.stdevWords.toFixed(2)} words`,
        `Shortest: ${summary.minWords} words | Longest: ${summary.maxWords} words`,
        `Short sentences (<10 words): ${pct(summary.shortShare)}`,
        `Long sentences (30+ words): ${pct(summary.longShare)}`,
        `Longest uniform run: ${summary.longestUniformRun}`,
      ].join("\n"),
    [summary],
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
          placeholder="Paste a few paragraphs. Variety needs several sentences to mean anything."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy summary" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="sentence-variety.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Rhythm</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Sentence-length variation"
              value={summary.stdevWords.toFixed(1)}
              testid="res-stdev"
              sub={`standard deviation across ${summary.count} sentence${summary.count === 1 ? "" : "s"}`}
            />
            <ResultBox>
              <ResultRow name="mean" label="Mean length" value={`${summary.meanWords.toFixed(1)} words`} />
              <ResultRow name="median" label="Median length" value={`${summary.medianWords.toFixed(0)} words`} />
              <ResultRow name="min" label="Shortest sentence" value={`${summary.minWords} words`} />
              <ResultRow name="max" label="Longest sentence" value={`${summary.maxWords} words`} />
              <ResultRow name="short-share" label="Short sentences (under 10 words)" value={pct(summary.shortShare)} />
              <ResultRow name="long-share" label="Long sentences (30+ words)" value={pct(summary.longShare)} />
              <ResultRow
                name="run"
                label="Longest run of similar-length sentences (±2 words)"
                value={summary.longestUniformRun}
              />
              <ResultRow name="uniform" label="Every sentence the same length" value={summary.perfectlyUniform ? "yes" : "no"} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Length distribution</PanelTitle>
          <div className="space-y-3" data-testid="res-buckets">
            {summary.buckets.map((bucket) => (
              <div key={bucket.label}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">{bucket.label}</span>
                  <span className="font-mono text-foreground">
                    {bucket.count} ({pct(bucket.share)})
                  </span>
                </div>
                <ProgressBar value={bucket.share * 100} />
              </div>
            ))}
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>What the number means</PanelTitle>
          <div className="space-y-2">
            {summary.count < 3 ? (
              <Notice tone="warn">
                With {summary.count === 1 ? "a single sentence" : `${summary.count} sentences`} there is no rhythm to
                measure yet. Paste at least a paragraph.
              </Notice>
            ) : null}
            {summary.perfectlyUniform && (
              <Notice tone="warn">
                Every sentence is the same length. That reads as monotony even when each sentence is correct — vary at
                least one of them.
              </Notice>
            )}
            {summary.longestUniformRun >= 4 && (
              <Notice tone="warn">
                {summary.longestUniformRun} sentences in a row are within two words of each other. That run is what a
                reader hears as a drone.
              </Notice>
            )}
            <Notice>
              A standard deviation of around 8-12 words across a paragraph is comfortably varied. A very high figure can
              also mean one runaway sentence is skewing the spread — check the longest sentence.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
