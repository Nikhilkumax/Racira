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
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { highlightImportantSentences } from "@/domains/writing/lib/text/summarize.ts";

const COUNTS = [
  { value: "3", label: "Top 3 sentences" },
  { value: "5", label: "Top 5 sentences" },
  { value: "8", label: "Top 8 sentences" },
  { value: "12", label: "Top 12 sentences" },
];

/**
 * Important sentence highlighter: the ranked sentences of a text are marked in
 * place, so the document keeps its layout and the selection keeps its context.
 * Segments reproduce the source exactly — joining them returns the input
 * character for character — which is what makes an in-place highlight trustworthy.
 */
export default function ImportantSentenceHighlighter() {
  const [raw, setRaw] = useState("");
  const [count, setCount] = useState("5");
  const text = useDebouncedValue(raw, 250);

  const limit = Number.parseInt(count, 10);
  const result = useMemo(() => highlightImportantSentences(text, { limit }), [text, limit]);
  const hasText = text.trim().length > 0;

  const report = useMemo(
    () =>
      [
        `Important sentences: top ${result.selected.length} of ${result.sentences} (extractive)`,
        "",
        ...[...result.selected]
          .sort((a, b) => a.rank - b.rank)
          .map((sentence) => `${sentence.rank}. ${sentence.text}\n   score ${sentence.score.toFixed(3)}`),
        "",
        "Highlighted sentences are quoted from the text; nothing was rewritten.",
      ].join("\n"),
    [result],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste the text to highlight"
          value={raw}
          onChange={setRaw}
          rows={12}
          placeholder="Paste a document. The highest-ranked sentences are marked where they sit in the text — nothing is moved, cut or rewritten."
        />
        <div className="mt-3 max-w-sm">
          <Select name="count" label="How many to highlight" value={count} onChange={setCount} options={COUNTS} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? report : ""} testid="copy-report" label="Copy highlighted sentences" />
          <DownloadButton text={hasText ? report : ""} filename="important-sentences.txt" testid="download-report" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Selection</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Sentences highlighted"
            value={result.selected.length}
            testid="res-count"
            sub={`of ${result.sentences} sentences · ${result.words} words`}
          />
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle right={<span className="text-[10px] text-muted-foreground">marked in place</span>}>
            Highlighted text
          </PanelTitle>
          <div
            data-testid="res-text"
            className="max-h-[26rem] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 text-sm leading-relaxed text-foreground"
          >
            {result.segments.map((segment, index) =>
              segment.highlighted ? (
                <mark
                  key={`${index}-${segment.rank}`}
                  title={`rank ${segment.rank}`}
                  className="rounded bg-primary/20 px-0.5 text-foreground"
                >
                  {segment.text}
                </mark>
              ) : (
                <span key={`${index}-plain`}>{segment.text}</span>
              ),
            )}
          </div>
        </Panel>
      )}

      {hasText && result.selected.length > 0 && (
        <Panel>
          <PanelTitle>Highlighted sentences, best first</PanelTitle>
          <ol data-testid="res-list" className="space-y-3">
            {[...result.selected]
              .sort((a, b) => a.rank - b.rank)
              .map((sentence) => (
                <li key={sentence.index} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs font-semibold text-primary">Rank {sentence.rank}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      score {sentence.score.toFixed(3)} · sentence {sentence.index + 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">{sentence.text}</p>
                </li>
              ))}
          </ol>
        </Panel>
      )}

      <Panel>
        <PanelTitle>How the highlight is chosen</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Sentences are ranked with the shared extractive scoring — TextRank centrality at weight 0.55, log term
            frequency at 0.35, position at 0.10 — and the top {result.selected.length || 5} are marked. The joining of
            the segments is lossless: the text around and between highlights is the original, character for character.
          </Notice>
          <Notice tone="warn">
            The ranking measures shared vocabulary, not importance. A sentence that repeats the document&rsquo;s key
            terms will be marked even if it says nothing new, and a decisive sentence in unusual language may be left
            plain. Headings and captions are treated as sentences. Use the marks as a reading aid, not as a verdict on
            what the document means.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
