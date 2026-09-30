"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  EmptyState,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import { DEFAULT_SPM, DEFAULT_WPM, formatDuration, textStats } from "@/domains/writing/lib/text/stats.ts";

/** Rates used for the comparison table — rounded published averages. */
const REFERENCE_RATES = [
  { name: "slow", label: "Slow reader", wpm: 150 },
  { name: "average", label: "Average adult", wpm: DEFAULT_WPM },
  { name: "fast", label: "Fast reader", wpm: 300 },
];

export default function ReadingTimeEstimator() {
  const [raw, setRaw] = useState("");
  const [wpmInput, setWpmInput] = useState(String(DEFAULT_WPM));
  const [spmInput, setSpmInput] = useState(String(DEFAULT_SPM));
  const text = useDebouncedValue(raw, 250);

  const wpm = Number.parseFloat(wpmInput);
  const spm = Number.parseFloat(spmInput);
  const wpmValid = Number.isFinite(wpm) && wpm > 0;
  const spmValid = Number.isFinite(spm) && spm > 0;

  const stats = useMemo(
    () => textStats(text, { wpm: wpmValid ? wpm : DEFAULT_WPM, spm: spmValid ? spm : DEFAULT_SPM }),
    [text, wpm, spm, wpmValid, spmValid],
  );

  const summary = useMemo(
    () =>
      [
        `Words: ${stats.words}`,
        `Reading time at ${wpmValid ? wpm : DEFAULT_WPM} wpm: ${formatDuration(stats.readingSeconds)}`,
        `Speaking time at ${spmValid ? spm : DEFAULT_SPM} wpm: ${formatDuration(stats.speakingSeconds)}`,
        `Sentences: ${stats.sentences}`,
        `Paragraphs: ${stats.paragraphs}`,
      ].join("\n"),
    [stats, wpm, spm, wpmValid, spmValid],
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
          placeholder="Paste the text you want to time — a blog post, a script, a speech."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            name="wpm"
            label="Reading speed (words per minute)"
            value={wpmInput}
            onChange={setWpmInput}
            type="number"
            hint="default 220"
          />
          <TextInput
            name="spm"
            label="Speaking speed (words per minute)"
            value={spmInput}
            onChange={setSpmInput}
            type="number"
            hint="default 130"
          />
        </div>
        {(!wpmValid || !spmValid) && (
          <div className="mt-3">
            <Notice tone="warn">
              Enter a rate above zero. The results below use the default rate ({DEFAULT_WPM} wpm reading, {DEFAULT_SPM}
              &nbsp;wpm speaking) until you enter a valid one.
            </Notice>
          </div>
        )}
        <div className="mt-3">
          <CopyButton text={summary} testid="copy-times" label="Copy times" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Estimated time</PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label={`Reading time at ${wpmValid ? wpm : DEFAULT_WPM} wpm`}
              value={formatDuration(stats.readingSeconds)}
              testid="res-reading"
              sub={`${stats.words.toLocaleString("en-US")} words`}
            />
            <ResultBox>
              <ResultRow name="speaking" label={`Speaking time at ${spmValid ? spm : DEFAULT_SPM} wpm`} value={formatDuration(stats.speakingSeconds)} />
              <ResultRow name="words" label="Words" value={stats.words.toLocaleString("en-US")} />
              <ResultRow name="sentences" label="Sentences" value={stats.sentences.toLocaleString("en-US")} />
              <ResultRow name="paragraphs" label="Paragraphs" value={stats.paragraphs.toLocaleString("en-US")} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Time = words ÷ rate. Nothing here is estimated from visuals or averages: it is the word count of your
              text divided by the rate you chose.
            </p>
          </>
        )}
      </Panel>

      {text.trim().length > 0 && (
        <Panel>
          <PanelTitle>At other reading speeds</PanelTitle>
          <ResultBox>
            {REFERENCE_RATES.map((rate) => (
              <ResultRow
                key={rate.name}
                name={`rate-${rate.name}`}
                label={`${rate.label} — ${rate.wpm} wpm`}
                value={formatDuration((stats.words / rate.wpm) * 60)}
              />
            ))}
          </ResultBox>
        </Panel>
      )}
    </StackLayout>
  );
}
