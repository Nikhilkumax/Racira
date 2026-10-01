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
  TextInput,
  useDebouncedValue,
} from "./ui";
import { formatTldrReport, tldr } from "@/domains/writing/lib/text/summarize.ts";

/**
 * TL;DR generator: the shortest honest gist the scoring can produce — the
 * top-ranked sentences that fit a character cap, never more than three. Output
 * is extractive, so the TL;DR is a compressed quotation of the source rather
 * than a paraphrase, and when nothing fits the cap the best sentence is returned
 * with an explicit over-budget flag instead of being silently dropped.
 */
export default function TldrGenerator() {
  const [raw, setRaw] = useState("");
  const [chars, setChars] = useState("220");
  const [maxSentences, setMaxSentences] = useState("3");
  const text = useDebouncedValue(raw, 250);

  const maxCharacters = useMemo(() => {
    const value = Number.parseInt(chars, 10);
    return Number.isFinite(value) && value > 0 ? Math.min(2000, value) : 220;
  }, [chars]);

  const sentenceLimit = useMemo(() => {
    const value = Number.parseInt(maxSentences, 10);
    return Number.isFinite(value) && value > 0 ? Math.min(5, value) : 3;
  }, [maxSentences]);

  const result = useMemo(
    () => tldr(text, { maxCharacters, maxSentences: sentenceLimit }),
    [text, maxCharacters, sentenceLimit],
  );
  const hasText = text.trim().length > 0;
  const report = useMemo(() => formatTldrReport(result), [result]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste the text to compress"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste an article or a long update. The TL;DR quotes the highest-scoring sentences that fit your character cap — it does not write new ones."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            name="chars"
            label="Character cap"
            value={chars}
            onChange={setChars}
            type="number"
            hint="40-2000, default 220"
          />
          <TextInput
            name="sentences"
            label="Maximum sentences"
            value={maxSentences}
            onChange={setMaxSentences}
            type="number"
            hint="1-5, default 3"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? result.text : ""} testid="copy-tldr" label="Copy TL;DR" />
          <CopyButton text={hasText ? report : ""} testid="copy-report" label="Copy report" />
          <DownloadButton text={hasText ? report : ""} filename="tldr.txt" testid="download-tldr" label="Download report" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>TL;DR</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Characters in TL;DR"
              value={result.characters}
              testid="res-chars"
              sub={
                result.overBudget
                  ? `over the ${result.maxCharacters}-character cap`
                  : `within the ${result.maxCharacters}-character cap`
              }
            />
            <StatGrid>
              <Stat label="Sentences used" value={result.sentences.length} testid="res-used" />
              <Stat label="Words" value={result.words} />
              <Stat label="Of the text" value={`${result.compressionPercent.toFixed(1)}%`} testid="res-compression" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.sentences.length > 0 && (
        <Panel>
          <PanelTitle>One-line gist — sentences quoted from your text</PanelTitle>
          <OutputBlock name="tldr" value={result.text} maxHeight={220} mono={false} />
          {result.overBudget && (
            <div className="mt-3">
              <Notice tone="warn">
                <span data-testid="res-over">
                  The best-scoring sentence is {result.characters} characters — longer than the {result.maxCharacters}
                  -character cap — and nothing shorter scored as well. Raise the cap to fit it, or accept that the
                  shortest honest gist is this sentence.
                </span>
              </Notice>
            </div>
          )}
          {!result.overBudget && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" data-testid="res-over">
              Within the {result.maxCharacters}-character cap. Every character above was quoted from your text.
            </p>
          )}
        </Panel>
      )}

      {hasText && result.sentences.length > 0 && (
        <Panel>
          <PanelTitle>The sentences used, and why</PanelTitle>
          <ul data-testid="res-used-list" className="space-y-3">
            {result.sentences.map((sentence) => (
              <li key={sentence.index} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">Rank {sentence.rank}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    score {sentence.score.toFixed(3)} · centrality {sentence.centrality.toFixed(3)} · frequency{" "}
                    {sentence.frequency.toFixed(3)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{sentence.text}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {hasText && result.sentences.length === 0 && (
        <Panel>
          <PanelTitle>Nothing to summarise</PanelTitle>
          <Notice>Add at least one sentence — a word or a list of fragments gives the scoring nothing to rank.</Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>How the TL;DR is chosen</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Sentences are ranked with the shared extractive scoring (TextRank centrality 0.55, log term frequency 0.35,
            position 0.10) and taken in rank order while they fit the character cap, up to your sentence limit. The cap
            counts characters including spaces; the sentences are then returned in document order so the gist reads in
            the original sequence.
          </Notice>
          <Notice tone="warn">
            A TL;DR is only as good as the document it quotes. A text whose first sentences restate the topic will
            produce a gist from those sentences, and one with no repeated terms has no clear centre for the scoring to
            find. The tool never paraphrases: if the shortest honest gist is one long sentence, that is what it returns.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
