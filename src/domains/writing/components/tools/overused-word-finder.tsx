"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
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
import { adjacentRepeats, repeatedTerms } from "@/domains/writing/lib/text/ngrams.ts";

/**
 * Overused words, reported as two honest tables: a frequency list with its
 * denominator stated, and the words that come back within a short window — the
 * "you just said that" signal. No style verdict is attached; a term appearing
 * five times may be exactly right, so the counts and distances are the output.
 */
export default function OverusedWordFinder() {
  const [raw, setRaw] = useState("");
  const [minCount, setMinCount] = useState("3");
  const [includeStopwords, setIncludeStopwords] = useState(false);
  const text = useDebouncedValue(raw, 250);

  const min = Math.max(1, Math.min(50, Math.floor(Number(minCount)) || 3));
  const terms = useMemo(
    () => repeatedTerms(text, { minCount: min, includeStopwords, limit: 30 }),
    [text, min, includeStopwords],
  );
  const repeats = useMemo(
    () => adjacentRepeats(text, { includeStopwords, limit: 25, window: 40 }),
    [text, includeStopwords],
  );

  const hasText = text.trim().length > 0;
  const top = terms[0];

  const summaryText = useMemo(
    () =>
      [
        `Repeated words (at least ${min}x): ${terms.length}`,
        ...terms.map((term) => `  ${term.term}: ${term.count} (${term.densityPercent.toFixed(2)}% of words)`),
        "",
        `Words repeated within 40 tokens: ${repeats.length}`,
        ...repeats.map((repeat) => `  ${repeat.term} — ${repeat.distance} tokens apart`),
      ].join("\n"),
    [min, terms, repeats],
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
          placeholder="Paste a draft. Every word is counted, and repeats inside a short window are listed separately."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            name="min"
            label="Report words used at least"
            value={minCount}
            onChange={setMinCount}
            type="number"
            hint="times"
          />
          <div className="flex items-end pb-2">
            <Checkbox
              name="stopwords"
              label="Include function words (the, and, of …)"
              checked={includeStopwords}
              onChange={setIncludeStopwords}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="overused-words.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Most repeated word</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : terms.length === 0 ? (
          <Notice>
            No content word appears {min} or more times. Lower the threshold above, or include function words, to see
            what the text leans on.
          </Notice>
        ) : (
          <>
            <HeroStat
              label="Used most often"
              value={top.term}
              testid="res-top"
              sub={`${top.count} times — ${top.densityPercent.toFixed(2)}% of all words`}
            />
            <ResultBox>
              <ResultRow name="repeated" label={`Words used ${min}+ times`} value={terms.length.toLocaleString("en-US")} />
              <ResultRow name="close" label="Repeated within 40 tokens" value={repeats.length.toLocaleString("en-US")} />
              <ResultRow name="threshold" label="Threshold in use" value={`${min} occurrences`} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && terms.length > 0 && (
        <Panel>
          <PanelTitle>Frequency table</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-terms" className="w-full min-w-[26rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Word</th>
                  <th className="py-2 pr-3 font-semibold">Count</th>
                  <th className="py-2 pr-3 font-semibold">Share of text</th>
                  <th className="py-2 font-semibold">Per 1,000 words</th>
                </tr>
              </thead>
              <tbody>
                {terms.map((term) => (
                  <tr key={term.term} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-medium text-foreground">{term.term}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{term.count}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{term.densityPercent.toFixed(2)}%</td>
                    <td className="py-2 font-mono text-xs">{term.perThousand.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && repeats.length > 0 && (
        <Panel>
          <PanelTitle>Words that come back quickly</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-repeats" className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Word</th>
                  <th className="py-2 pr-3 font-semibold">Tokens apart</th>
                  <th className="py-2 font-semibold">Context</th>
                </tr>
              </thead>
              <tbody>
                {repeats.map((repeat) => (
                  <tr key={`${repeat.term}-${repeat.index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-medium text-foreground">{repeat.term}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{repeat.distance}</td>
                    <td className="py-2 text-muted-foreground">…{repeat.line}…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>What this does not say</PanelTitle>
          <Notice>
            Repetition is not automatically a fault. This table reports counts and distances only — a word used five
            times across a long essay may be the subject itself. Read the flagged words in context before changing them.
          </Notice>
        </Panel>
      )}
    </StackLayout>
  );
}
