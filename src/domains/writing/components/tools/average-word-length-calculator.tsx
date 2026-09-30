"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  EmptyState,
  HeroStat,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { wordLength, wordTokens } from "@/domains/writing/lib/text/tokenize.ts";
import { wordLengthDistribution } from "@/domains/writing/lib/text/stats.ts";

export default function AverageWordLengthCalculator() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);

  const data = useMemo(() => {
    const tokens = wordTokens(text).map((token) => token.text);
    const lengths = tokens.map((token) => wordLength(token));
    const sorted = [...lengths].sort((a, b) => a - b);
    const total = lengths.reduce((sum, value) => sum + value, 0);
    const average = lengths.length > 0 ? total / lengths.length : 0;
    const median =
      sorted.length === 0
        ? 0
        : sorted.length % 2 === 1
          ? sorted[(sorted.length - 1) / 2]
          : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    let longest = "";
    let longestLength = 0;
    let shortest = "";
    let shortestLength = Number.POSITIVE_INFINITY;
    tokens.forEach((token) => {
      const length = wordLength(token);
      if (length > longestLength) {
        longest = token;
        longestLength = length;
      }
      if (length < shortestLength) {
        shortest = token;
        shortestLength = length;
      }
    });
    return {
      tokens,
      total,
      average,
      median,
      longest,
      longestLength,
      shortest,
      shortestLength: Number.isFinite(shortestLength) ? shortestLength : 0,
      distribution: wordLengthDistribution(tokens, 15),
    };
  }, [text]);

  const maxBucket = useMemo(
    () => data.distribution.reduce((best, bucket) => Math.max(best, bucket.count), 0),
    [data.distribution],
  );

  const summary = useMemo(
    () =>
      [
        `Words: ${data.tokens.length}`,
        `Average word length: ${data.average.toFixed(2)} characters`,
        `Median word length: ${data.median}`,
        `Longest word: ${data.longest} (${data.longestLength})`,
        `Shortest word: ${data.shortest} (${data.shortestLength})`,
        `Total letters: ${data.total}`,
      ].join("\n"),
    [data],
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
          placeholder="Paste text to measure how long the words are, on average and in distribution."
        />
        <div className="mt-3">
          <CopyButton text={summary} testid="copy-summary" label="Copy summary" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Word length</PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Average word length"
              value={data.average.toFixed(2)}
              testid="res-avg"
              sub={`${data.tokens.length.toLocaleString("en-US")} words · median ${data.median}`}
            />
            <ResultBox>
              <ResultRow name="median" label="Median word length" value={data.median} />
              <ResultRow name="words" label="Words" value={data.tokens.length.toLocaleString("en-US")} />
              <ResultRow name="letters" label="Letters across all words" value={data.total.toLocaleString("en-US")} />
              <ResultRow name="longest" label="Longest word" value={`${data.longest} (${data.longestLength})`} />
              <ResultRow name="shortest" label="Shortest word" value={`${data.shortest} (${data.shortestLength})`} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Length is measured in user-perceived characters (grapheme clusters), so &ldquo;café&rdquo; is 4 no
              matter which accent form the source text used.
            </p>
          </>
        )}
      </Panel>

      {data.tokens.length > 0 && (
        <Panel>
          <PanelTitle>Distribution</PanelTitle>
          <ul className="space-y-1" data-testid="distribution">
            {data.distribution.map((bucket) => (
              <li key={bucket.length} className="flex items-center gap-3 text-xs">
                <span className="w-10 shrink-0 text-right font-mono text-muted-foreground">{bucket.length}</span>
                <span className="h-3 rounded-sm bg-primary/70" style={{ width: `${maxBucket ? Math.max(bucket.count > 0 ? 2 : 0, (bucket.count / maxBucket) * 100) : 0}%` }} />
                <span className="font-mono text-muted-foreground" data-testid={`bucket-${bucket.length}`}>
                  {bucket.count}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Column shows the number of characters; words longer than 15 characters are folded into the last row.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
