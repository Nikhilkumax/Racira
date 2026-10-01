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
import { formatSummaryReport, summarize } from "@/domains/writing/lib/text/summarize.ts";

const LENGTHS = [
  { value: "20", label: "Short — about 20% of sentences" },
  { value: "30", label: "Standard — about 30% of sentences" },
  { value: "40", label: "Full — about 40% of sentences" },
];

/**
 * Executive summary builder: a bottom line plus findings, built entirely from
 * the extractive scoring engine. The bottom line is the highest-ranked sentence
 * as the engine sees it, the findings are the remaining selected sentences in
 * document order, and the coverage figure says how much of the document's key
 * vocabulary the brief carries. Nothing is generated.
 */
export default function ExecutiveSummaryBuilder() {
  const [raw, setRaw] = useState("");
  const [length, setLength] = useState("30");
  const text = useDebouncedValue(raw, 250);

  const result = useMemo(() => summarize(text, { targetPercent: Number.parseInt(length, 10) }), [text, length]);
  const hasText = text.trim().length > 0;
  const bottomLine = useMemo(() => {
    const ranked = [...result.sentences].sort((a, b) => a.rank - b.rank);
    return ranked[0] ?? null;
  }, [result]);
  const findings = useMemo(
    () => result.selected.filter((sentence) => sentence.index !== bottomLine?.index),
    [result, bottomLine],
  );

  const report = useMemo(() => {
    if (!hasText) return "";
    return [
      "EXECUTIVE SUMMARY (extractive — sentences quoted from the document)",
      "",
      "BOTTOM LINE",
      bottomLine ? bottomLine.text : "—",
      "",
      "FINDINGS",
      ...findings.map((sentence, index) => `${index + 1}. ${sentence.text}`),
      "",
      `${result.selected.length} sentences, ${result.selectedWords} of ${result.words} words (${result.compressionPercent.toFixed(1)}%), key-term coverage ${result.coveragePercent.toFixed(0)}%`,
      formatSummaryReport(result).split("\n").slice(-1)[0],
    ].join("\n");
  }, [hasText, bottomLine, findings, result]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Source document</PanelTitle>
        <TextArea
          name="text"
          label="Paste the full document"
          value={raw}
          onChange={setRaw}
          rows={12}
          placeholder="Paste the document. The brief is assembled from sentences that already exist in it — nothing is written or paraphrased."
        />
        <div className="mt-3 max-w-sm">
          <Select name="length" label="Brief length" value={length} onChange={setLength} options={LENGTHS} hint={`${result.selected.length} sentence(s)`} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={report} testid="copy-summary" label="Copy brief" />
          <DownloadButton text={report} filename="executive-summary.txt" testid="download-summary" label="Download brief" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The document is analysed in this browser and never uploaded. Nothing is stored after the tab closes.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Overview</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Sentences in the brief"
              value={result.selected.length}
              testid="res-selected"
              sub={`of ${result.sentences.length} · ${result.compressionPercent.toFixed(1)}% of the words`}
            />
            <StatGrid>
              <Stat label="Document words" value={result.words.toLocaleString("en-US")} />
              <Stat label="Brief words" value={result.selectedWords.toLocaleString("en-US")} testid="res-words" />
              <Stat label="Key-term coverage" value={`${result.coveragePercent.toFixed(0)}%`} testid="res-coverage" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && bottomLine && (
        <Panel>
          <PanelTitle>Bottom line (highest-ranked sentence)</PanelTitle>
          <OutputBlock name="bottom" value={bottomLine.text} maxHeight={160} mono={false} />
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            rank 1 · score {bottomLine.score.toFixed(3)} · centrality {bottomLine.centrality.toFixed(3)} · frequency{" "}
            {bottomLine.frequency.toFixed(3)}
          </p>
        </Panel>
      )}

      {hasText && findings.length > 0 && (
        <Panel>
          <PanelTitle>Findings, in document order</PanelTitle>
          <ol data-testid="res-findings" className="space-y-3">
            {findings.map((sentence, index) => (
              <li key={sentence.index} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">score {sentence.score.toFixed(3)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{sentence.text}</p>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <Panel>
        <PanelTitle>How the brief is built</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Every line above is a sentence quoted from the document. Scoring is the shared extractive method: TextRank
            centrality (weight 0.55) + log term frequency (0.35) + position (0.10), normalised to the best sentence. The
            bottom line is simply the highest-ranked sentence; the findings are the rest of the selection in document
            order.
          </Notice>
          <Notice tone="warn">
            This is an extraction, not an executive&rsquo;s judgement. It rewards sentences that share vocabulary with
            the rest of the document, so an introduction can outrank a recommendation, and a document with no repeated
            terms has no clear centre. It does not know what a recommendation, a risk or a number is. Read every line
            against the source before circulating the brief, and edit by hand where the ranking missed your point.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
