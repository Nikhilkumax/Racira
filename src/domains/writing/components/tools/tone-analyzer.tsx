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
import { toneAnalysis } from "@/domains/writing/lib/text/register.ts";

/**
 * Tone reported as five independent signals rather than one verdict. Each signal
 * is a count over a published list — a sentiment lexicon, intensifiers,
 * contractions — and the page states that these are counts, not a trained model
 * reading the feelings of the text.
 */
export default function ToneAnalyzer() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => toneAnalysis(text), [text]);
  const hasText = text.trim().length > 0;

  const polarity = result.signals.find((signal) => signal.key === "polarity");

  const summaryText = useMemo(
    () =>
      [
        result.summary,
        "",
        ...result.signals.map((signal) => `${signal.label}: ${signal.value} — ${signal.reading}`),
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
          placeholder="Paste a draft. Five measured signals update as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="tone-analysis.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Tone signals</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Polarity"
              value={polarity?.value ?? "Neutral"}
              testid="res-polarity"
              sub={`net ${result.netPolarity >= 0 ? "+" : ""}${result.netPolarity} sentiment words across ${result.words} words`}
            />
            <StatGrid>
              {result.signals.map((signal) => (
                <Stat key={signal.key} label={signal.label} value={signal.value} testid={`res-signal-${signal.key}`} />
              ))}
            </StatGrid>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground" data-testid="res-summary">
              {result.summary}
            </p>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>What each signal measures</PanelTitle>
          <div className="space-y-3" data-testid="res-readings">
            {result.signals.map((signal) => (
              <div key={signal.key}>
                <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{signal.label}</div>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground">{signal.reading}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How to read this</PanelTitle>
          <div className="space-y-2">
            <Notice>
              Tone here is a set of counts, not a reading. Polarity comes from a finite positive/negative word list,
              energy from exclamation marks, intensifiers and emphasised words, directness from second-person pronouns
              and questions, confidence from hedges, and register from the formality score.
            </Notice>
            <Notice tone="warn">
              Word lists miss irony, sarcasm and negation, so &quot;not a great outcome&quot; counts as a positive hit.
              Treat each signal as one measurable property of the draft, and the summary as a description of those
              measurements rather than a judgement of the writing.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
