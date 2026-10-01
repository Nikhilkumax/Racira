"use client";

import { useMemo, useState } from "react";
import {
  Btn,
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import { keyPoints, summarize } from "@/domains/writing/lib/text/summarize.ts";

/**
 * Key points extractor: the same TextRank scoring as the summariser, but read
 * as a ranked list rather than a paragraph. Each point shows its rank, score and
 * the terms that carried it, and the key-term table below is the evidence for
 * why those sentences ranked where they did. Points are extractive: the
 * sentences are quoted from the source, never composed.
 */
export default function KeyPointsExtractor() {
  const [raw, setRaw] = useState("");
  const [count, setCount] = useState("5");
  const text = useDebouncedValue(raw, 250);

  const limit = useMemo(() => {
    const value = Number.parseInt(count, 10);
    return Number.isFinite(value) && value > 0 ? Math.min(20, value) : 5;
  }, [count]);

  const result = useMemo(() => keyPoints(text, { limit }), [text, limit]);
  const summary = useMemo(() => summarize(text, { targetSentences: limit }), [text, limit]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Key points: ${result.points.length} of ${result.sentences} sentences (extractive)`,
        "",
        ...result.points.map(
          (point) => `${point.rank}. ${point.text}\n   score ${point.score.toFixed(3)} · terms: ${point.terms.join(", ") || "—"}`,
        ),
        "",
        `Key terms: ${result.keyTerms.map((term) => `${term.term} (${term.count})`).join(", ")}`,
        "",
        "Every point is a sentence taken verbatim from the text; nothing was written or paraphrased.",
      ].join("\n"),
    [result],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your text</PanelTitle>
        <TextArea
          name="text"
          label="Paste the text to extract points from"
          value={raw}
          onChange={setRaw}
          rows={11}
          placeholder="Paste an article, transcript or report. Points are sentences that already exist in the text, ranked by the same scoring the summariser uses."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <TextInput
            name="count"
            label="Maximum points"
            value={count}
            onChange={setCount}
            type="number"
            hint="1-20, default 5"
          />
          <div className="flex items-end pb-1">
            <Btn kind="ghost" testid="btn-reset-count" onClick={() => setCount("5")}>
              Reset to 5 points
            </Btn>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy points" />
          <DownloadButton text={hasText ? summaryText : ""} filename="key-points.txt" testid="download-points" label="Download points" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Extraction</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Points extracted"
            value={result.points.length}
            testid="res-count"
            sub={`from ${result.sentences} sentence${result.sentences === 1 ? "" : "s"} · ${result.words} words`}
          />
        )}
      </Panel>

      {hasText && result.points.length > 0 && (
        <Panel>
          <PanelTitle>Key points, best first</PanelTitle>
          <ol data-testid="res-points" className="space-y-3">
            {result.points.map((point) => (
              <li key={point.index} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-semibold text-primary">Point {point.rank}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    score {point.score.toFixed(3)} · {point.words} words
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{point.text}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {point.terms.length > 0 ? `terms: ${point.terms.join(", ")}` : "no distinctive terms"}
                </p>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {hasText && result.points.length === 0 && (
        <Panel>
          <PanelTitle>Nothing to rank yet</PanelTitle>
          <Notice>Add at least one full sentence — the extractor ranks sentences, so a fragment or a list of words has nothing to score.</Notice>
        </Panel>
      )}

      {hasText && result.keyTerms.length > 0 && (
        <Panel>
          <PanelTitle>Key terms behind the ranking</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-terms" className="w-full min-w-[20rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Term</th>
                  <th className="py-2 pr-3 font-semibold">Count</th>
                  <th className="py-2 font-semibold">Weight (1 + log count)</th>
                </tr>
              </thead>
              <tbody>
                {result.keyTerms.map((term) => (
                  <tr key={term.term} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{term.term}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">{term.count}</td>
                    <td className="py-2 font-mono text-xs text-muted-foreground">{term.weight.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && summary.selected.length > 0 && (
        <Panel>
          <PanelTitle>Points as a continuous extract</PanelTitle>
          <OutputBlock
            name="extract"
            value={summary.selected.map((sentence) => sentence.text).join(" ")}
            maxHeight={240}
            mono={false}
          />
        </Panel>
      )}

      <Panel>
        <PanelTitle>Scope and limits</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each point is a sentence quoted verbatim from your text and ranked by TextRank centrality (weight 0.55),
            log term frequency (weight 0.35) and position (weight 0.10). Stopwords are excluded, terms are matched
            case-insensitively, and the key-term table shows every count the scoring used.
          </Notice>
          <Notice tone="warn">
            Extraction is not understanding. Two sentences that repeat the same topic can rank above a sentence that
            carries the actual decision, and the tool cannot tell a key point from a rhetorical aside. It also reads
            your text as plain prose: headings, captions and list items are treated like any other sentence. Read the
            ranked list as a shortlist to check, not as minutes.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
