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
  ResultBox,
  ResultRow,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { sentenceTokens, wordTokens } from "@/domains/writing/lib/text/tokenize.ts";
import { formatDuration, textStats, topWords } from "@/domains/writing/lib/text/stats.ts";
import { ENGLISH_STOPWORD_SET } from "@/domains/writing/lib/text/stopwords.ts";

/** Above this size the analysis still runs, but the UI says it may pause. */
const LARGE_INPUT = 200_000;

export default function WordCountTool() {
  const [raw, setRaw] = useState("");
  const [hideFunctionWords, setHideFunctionWords] = useState(true);
  const text = useDebouncedValue(raw, 250);

  const stats = useMemo(() => textStats(text), [text]);
  const tokens = useMemo(() => wordTokens(text).map((token) => token.text), [text]);
  const sentences = useMemo(() => sentenceTokens(text).length, [text]);
  const frequent = useMemo(
    () => topWords(tokens, 10, hideFunctionWords ? ENGLISH_STOPWORD_SET : new Set()),
    [tokens, hideFunctionWords],
  );

  const summary = useMemo(
    () =>
      [
        `Words: ${stats.words}`,
        `Unique words: ${stats.uniqueWords}`,
        `Characters: ${stats.characters}`,
        `Sentences: ${sentences}`,
        `Paragraphs: ${stats.paragraphs}`,
        `Reading time: ${formatDuration(stats.readingSeconds)}`,
      ].join("\n"),
    [stats, sentences],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle
          right={
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {hideFunctionWords ? "top words excluding function words" : "top words including function words"}
            </span>
          }
        >
          Your text
        </PanelTitle>
        <TextArea
          name="text"
          label="Paste or type text"
          value={raw}
          onChange={setRaw}
          rows={10}
          placeholder="Paste an article, essay or draft here — the counts update as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="toggle-stopwords"
            onClick={() => setHideFunctionWords((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            {hideFunctionWords ? "Include function words" : "Exclude function words"}
          </button>
          <CopyButton text={summary} testid="copy-summary" label="Copy counts" />
          <DownloadButton text={summary} filename="word-count.txt" testid="download-summary" label="Download counts" />
        </div>
        {raw.length > LARGE_INPUT && (
          <p className="mt-3 text-xs text-muted-foreground">
            This is a very large document ({raw.length.toLocaleString("en-US")} characters). Counting is
            still exact; results settle a moment after you stop typing.
          </p>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Counts</PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat label="Words" value={stats.words.toLocaleString("en-US")} testid="res-words" sub={`${stats.uniqueWords.toLocaleString("en-US")} unique`} />
            <StatGrid>
              <Stat label="Characters" value={stats.characters.toLocaleString("en-US")} testid="res-characters" />
              <Stat label="Sentences" value={sentences.toLocaleString("en-US")} testid="res-sentences" />
              <Stat label="Paragraphs" value={stats.paragraphs.toLocaleString("en-US")} testid="res-paragraphs" />
            </StatGrid>
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="reading-time" label="Reading time (220 wpm)" value={formatDuration(stats.readingSeconds)} />
                <ResultRow name="speaking-time" label="Speaking time (130 wpm)" value={formatDuration(stats.speakingSeconds)} />
                <ResultRow name="longest-word" label="Longest word" value={stats.longestWord || "—"} />
                <ResultRow name="unique-words" label="Unique words" value={stats.uniqueWords.toLocaleString("en-US")} />
              </ResultBox>
            </div>
          </>
        )}
      </Panel>

      {text.trim().length > 0 && (
        <Panel>
          <PanelTitle>{hideFunctionWords ? "Most used content words" : "Most used words"}</PanelTitle>
          {frequent.length === 0 ? (
            <Notice>No repeated words found in this text.</Notice>
          ) : (
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {frequent.map((entry) => (
                <div key={entry.word} className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 text-sm">
                  <span className="truncate font-mono text-foreground">{entry.word}</span>
                  <span className="shrink-0 font-mono text-muted-foreground" data-testid={`freq-${entry.word}`}>
                    {entry.count}
                  </span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Counting follows Unicode word boundaries. Numbers count as words, hyphens join (“well-known” is one
            word), and standalone emoji or punctuation are not words.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
