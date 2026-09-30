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
import { keywordDensity } from "@/domains/writing/lib/text/ngrams.ts";

/**
 * Keyword density: the share of the text each word and two-word phrase takes up.
 * Density is a ratio, so the denominator is stated — every word token, stopwords
 * included — and the tool makes no claim about a "correct" percentage, because
 * no such threshold exists. It reports what is there.
 */
export default function KeywordDensityAnalyzer() {
  const [raw, setRaw] = useState("");
  const [minCount, setMinCount] = useState("2");
  const [limit, setLimit] = useState("15");
  const [excludeStopwords, setExcludeStopwords] = useState(true);
  const text = useDebouncedValue(raw, 250);

  const min = Math.max(1, Math.min(50, Math.floor(Number(minCount)) || 2));
  const max = Math.max(1, Math.min(100, Math.floor(Number(limit)) || 15));

  const density = useMemo(
    () => keywordDensity(text, { minCount: min, limit: max, excludeStopwords }),
    [text, min, max, excludeStopwords],
  );

  const hasText = density.words > 0;
  const top = density.singleWords[0];

  const summaryText = useMemo(
    () =>
      [
        `Words: ${density.words} | Unique: ${density.uniqueWords}`,
        "",
        "Single words:",
        ...density.singleWords.map((entry) => `  ${entry.term}: ${entry.count} (${entry.densityPercent.toFixed(2)}%)`),
        "",
        "Two-word phrases:",
        ...density.phrases.map((entry) => `  ${entry.term}: ${entry.count} (${entry.densityPercent.toFixed(2)}%)`),
      ].join("\n"),
    [density],
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
          placeholder="Paste an article, a landing page or a draft. Words and two-word phrases are counted separately."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput name="min" label="Minimum occurrences" value={minCount} onChange={setMinCount} type="number" />
          <TextInput name="limit" label="Rows per table" value={limit} onChange={setLimit} type="number" />
        </div>
        <div className="mt-3">
          <Checkbox
            name="stopwords"
            label="Hide function words (the, of, and …)"
            checked={excludeStopwords}
            onChange={setExcludeStopwords}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="keyword-density.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Density</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Most-used single word"
              value={top ? `${top.densityPercent.toFixed(2)}%` : "—"}
              testid="res-top"
              sub={top ? `"${top.term}" appears ${top.count} times` : "no word meets the threshold"}
            />
            <ResultBox>
              <ResultRow name="words" label="Words (the denominator)" value={density.words.toLocaleString("en-US")} />
              <ResultRow name="unique" label="Unique words" value={density.uniqueWords.toLocaleString("en-US")} />
              <ResultRow name="single-count" label="Single words reported" value={density.singleWords.length} />
              <ResultRow name="phrase-count" label="Two-word phrases reported" value={density.phrases.length} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && density.singleWords.length > 0 && (
        <Panel>
          <PanelTitle>Single words</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-single" className="w-full min-w-[26rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Term</th>
                  <th className="py-2 pr-3 font-semibold">Count</th>
                  <th className="py-2 pr-3 font-semibold">Density</th>
                  <th className="py-2 font-semibold">Per 1,000 words</th>
                </tr>
              </thead>
              <tbody>
                {density.singleWords.map((entry) => (
                  <tr key={entry.term} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-medium text-foreground">{entry.term}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.count}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.densityPercent.toFixed(2)}%</td>
                    <td className="py-2 font-mono text-xs">{entry.perThousand.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && density.phrases.length > 0 && (
        <Panel>
          <PanelTitle>Two-word phrases</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-phrases" className="w-full min-w-[26rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Phrase</th>
                  <th className="py-2 pr-3 font-semibold">Count</th>
                  <th className="py-2 pr-3 font-semibold">Density</th>
                  <th className="py-2 font-semibold">Per 1,000 words</th>
                </tr>
              </thead>
              <tbody>
                {density.phrases.map((entry) => (
                  <tr key={entry.term} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-medium text-foreground">{entry.term}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.count}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{entry.densityPercent.toFixed(2)}%</td>
                    <td className="py-2 font-mono text-xs">{entry.perThousand.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How to read density</PanelTitle>
          <Notice>
            Density is count ÷ every word token × 100. The denominator includes function words, because a reader asking
            what share of the text a term occupies means all of it. Phrases must contain at least one content word, so
            "of the" is never reported as a keyword.
          </Notice>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            There is no universal safe percentage. A term repeating more often than the writing can justify is the real
            signal, which is why the count and the per-1,000 rate sit beside the percentage — they do not shrink when
            the text gets shorter. Read the top few rows and decide in context.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
