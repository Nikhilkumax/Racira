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
  useDebouncedValue,
} from "./ui";
import { sentenceTokens, wordTokens } from "@/domains/writing/lib/text/tokenize.ts";

/** How many sentences the preview lists before it truncates. */
const PREVIEW_LIMIT = 25;

interface SentenceRow {
  text: string;
  words: number;
}

export default function SentenceCountTool() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);

  const rows = useMemo<SentenceRow[]>(
    () =>
      sentenceTokens(text).map((sentence) => ({
        text: sentence.text.trim(),
        words: wordTokens(sentence.text).length,
      })),
    [text],
  );

  const totals = useMemo(() => {
    const counts = rows.map((row) => row.words);
    const totalWords = counts.reduce((sum, value) => sum + value, 0);
    const longest = counts.reduce(
      (best, value, index) => (value > best.words ? { words: value, index } : best),
      { words: 0, index: -1 },
    );
    const shortest = counts.reduce(
      (best, value, index) => (best.words === 0 || value < best.words ? { words: value, index } : best),
      { words: 0, index: -1 },
    );
    return {
      sentences: rows.length,
      totalWords,
      avgWords: rows.length > 0 ? totalWords / rows.length : 0,
      longest,
      shortest,
    };
  }, [rows]);

  const summary = useMemo(
    () =>
      [
        `Sentences: ${totals.sentences}`,
        `Words: ${totals.totalWords}`,
        `Average words per sentence: ${totals.avgWords.toFixed(2)}`,
        `Longest sentence: ${totals.longest.words} words`,
        `Shortest sentence: ${totals.shortest.words} words`,
      ].join("\n"),
    [totals],
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
          placeholder="Paste your text to count sentences and see each one with its word count."
        />
        <div className="mt-3">
          <CopyButton text={summary} testid="copy-summary" label="Copy summary" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Counts</PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat label="Sentences" value={totals.sentences.toLocaleString("en-US")} testid="res-sentences" sub={`${totals.totalWords.toLocaleString("en-US")} words`} />
            <ResultBox>
              <ResultRow name="avg-words" label="Average words per sentence" value={totals.avgWords.toFixed(2)} />
              <ResultRow
                name="longest"
                label="Longest sentence"
                value={`${totals.longest.words} words${totals.longest.index >= 0 ? ` (#${totals.longest.index + 1})` : ""}`}
              />
              <ResultRow
                name="shortest"
                label="Shortest sentence"
                value={`${totals.shortest.words} words${totals.shortest.index >= 0 ? ` (#${totals.shortest.index + 1})` : ""}`}
              />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Sentences follow Unicode sentence boundaries. Abbreviations followed by a period split into their own
              segment, so &ldquo;Dr. Smith went home.&rdquo; counts as two — that is a real characteristic of the
              boundary rules, not a hidden guess.
            </p>
          </>
        )}
      </Panel>

      {rows.length > 0 && (
        <Panel>
          <PanelTitle right={<span className="text-[10px] text-muted-foreground">first {Math.min(rows.length, PREVIEW_LIMIT)}</span>}>
            Sentence list
          </PanelTitle>
          <ol className="space-y-2" data-testid="sentence-list">
            {rows.slice(0, PREVIEW_LIMIT).map((row, index) => (
              <li key={index} className="flex items-start justify-between gap-4 border-b border-border/50 pb-2 text-sm last:border-0">
                <span className="text-foreground">
                  <span className="mr-2 font-mono text-xs text-muted-foreground">{index + 1}.</span>
                  {row.text}
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{row.words}w</span>
              </li>
            ))}
          </ol>
          {rows.length > PREVIEW_LIMIT && (
            <div className="mt-3">
              <Notice>{rows.length - PREVIEW_LIMIT} more sentences are counted but not listed here.</Notice>
            </div>
          )}
        </Panel>
      )}
    </StackLayout>
  );
}
