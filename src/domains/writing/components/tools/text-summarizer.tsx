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
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { SUMMARY_METHOD, formatSummaryReport, summarize } from "@/domains/writing/lib/text/summarize.ts";

const LENGTH_OPTIONS = [
  { value: "10", label: "About 10% of the sentences" },
  { value: "20", label: "About 20% of the sentences" },
  { value: "30", label: "About 30% of the sentences" },
  { value: "40", label: "About 40% of the sentences" },
];

/**
 * Extractive summariser: TextRank-style sentence scoring over the shared
 * tokenizer, selecting sentences from the source and returning them in document
 * order. Every score is shown with its three parts (centrality, frequency,
 * position) so the ranking can be checked, and the output is labelled
 * extractive because nothing is rewritten.
 */
export default function TextSummarizer() {
  const [raw, setRaw] = useState("");
  const [length, setLength] = useState("20");
  const text = useDebouncedValue(raw, 250);

  const percent = Number.parseInt(length, 10);
  const result = useMemo(() => summarize(text, { targetPercent: percent }), [text, percent]);
  const hasText = text.trim().length > 0;
  const report = useMemo(() => formatSummaryReport(result), [result]);
  const summaryText = useMemo(
    () => result.selected.map((sentence) => sentence.text).join(" "),
    [result],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste the text to summarise"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste an article, report or draft. The summary is built from sentences that already exist in the text — nothing is rewritten."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="length"
            label="Summary length"
            value={length}
            onChange={setLength}
            options={LENGTH_OPTIONS}
            hint={result.selected.length > 0 ? `${result.selected.length} sentence(s)` : undefined}
          />
          <div className="flex items-end pb-1">
            <p className="text-xs leading-relaxed text-muted-foreground">
              The percentage is applied to the sentence count and rounded to at least one sentence.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy summary" />
          <CopyButton text={hasText ? report : ""} testid="copy-report" label="Copy report" />
          <DownloadButton text={hasText ? report : ""} filename="extractive-summary.txt" testid="download-summary" label="Download report" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Extractive summary</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Sentences selected"
              value={result.selected.length}
              testid="res-selected"
              sub={`of ${result.sentences.length} · ${result.compressionPercent.toFixed(1)}% of the words`}
            />
            <StatGrid>
              <Stat label="Words in text" value={result.words.toLocaleString("en-US")} />
              <Stat label="Words selected" value={result.selectedWords.toLocaleString("en-US")} testid="res-selected-words" />
              <Stat label="Key-term coverage" value={`${result.coveragePercent.toFixed(0)}%`} testid="res-coverage" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.selected.length > 0 && (
        <Panel>
          <PanelTitle>Summary — sentences taken from your text</PanelTitle>
          <OutputBlock name="summary" value={summaryText} maxHeight={300} mono={false} />
          <div className="mt-3">
            <Notice>
              This is an extractive summary: every sentence below appears verbatim in your text, in its original order.
              No sentence was written, shortened or paraphrased, which is also why the wording can read as disjointed —
              the tool selects, it does not edit.
            </Notice>
          </div>
        </Panel>
      )}

      {hasText && result.sentences.length > 0 && (
        <Panel>
          <PanelTitle>Sentence scores (best first)</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-sentences" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">#</th>
                  <th className="py-2 pr-3 font-semibold">Score</th>
                  <th className="py-2 pr-3 font-semibold">Centrality</th>
                  <th className="py-2 pr-3 font-semibold">Frequency</th>
                  <th className="py-2 pr-3 font-semibold">Position</th>
                  <th className="py-2 font-semibold">Sentence</th>
                </tr>
              </thead>
              <tbody>
                {[...result.sentences]
                  .sort((a, b) => a.rank - b.rank)
                  .slice(0, 30)
                  .map((sentence) => (
                    <tr key={sentence.index} className="border-t border-border/60 align-top">
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{sentence.rank}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-foreground">
                        {sentence.score.toFixed(3)}
                        {sentence.rank <= result.selected.length && (
                          <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] font-semibold text-primary">in</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{sentence.centrality.toFixed(3)}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{sentence.frequency.toFixed(3)}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{sentence.position.toFixed(3)}</td>
                      <td className="py-2 text-foreground">{sentence.text}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && result.keyTerms.length > 0 && (
        <Panel>
          <PanelTitle>Key terms the scoring used</PanelTitle>
          <p data-testid="res-terms" className="flex flex-wrap gap-2">
            {result.keyTerms.slice(0, 12).map((term) => (
              <span key={term.term} className="rounded-md border border-border bg-card/40 px-2 py-1 font-mono text-xs text-foreground">
                {term.term} <span className="text-muted-foreground">×{term.count}</span>
              </span>
            ))}
          </p>
        </Panel>
      )}

      <Panel>
        <PanelTitle>How the scoring works</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each sentence scores 0.55 × TextRank centrality + 0.35 × log term frequency (divided by the square root of
            the sentence length) + 0.10 × position decay, normalised so the best sentence is 1.000. Centrality uses the
            classic shared-content-word similarity |Si ∩ Sj| / (log |Si| + log |Sj|) and 30 PageRank iterations; the
            three parts are shown in the table so any ranking can be recomputed by hand.
          </Notice>
          <Notice tone="warn">
            This is a heuristic, not an understanding of your document. It rewards sentences that share terms with the
            rest of the text, so an introduction that repeats the topic can outrank a conclusion that matters more; a
            sentence with unusual vocabulary may be underrated. Short texts and texts with one dominant term are where
            it is least reliable. Method: {SUMMARY_METHOD}.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
