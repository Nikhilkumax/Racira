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
  ProgressBar,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { MIN_RELIABLE_WORDS, readabilityMetrics } from "@/domains/writing/lib/text/readability.ts";
import { clarityScore, clarityBand } from "@/domains/writing/lib/text/clarity.ts";

/**
 * The clarity score is a composite, not a published index — so this component
 * shows every component score, the measurement behind it and the rule that maps
 * one to the other. A reader who disagrees with a weight can see it and discount
 * the total accordingly.
 */
export default function ClarityScoreTool() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => clarityScore(text), [text]);
  const metrics = useMemo(() => readabilityMetrics(text), [text]);
  const hasText = metrics.words > 0 && metrics.sentences > 0;

  const summaryText = useMemo(
    () =>
      [
        `Clarity score: ${result.score.toFixed(1)} / 100 — ${result.band.label}`,
        ...result.components.map(
          (component) => `${component.label} (weight ${component.weight}%): ${component.score.toFixed(0)} — ${component.measured}`,
        ),
      ].join("\n"),
    [result],
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
          placeholder="Paste a paragraph or more. The score is a weighted blend of four measurable properties."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy result" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="clarity-score.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Clarity</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Clarity score"
              value={result.score.toFixed(1)}
              testid="res-score"
              sub={result.band.label}
            />
            <ResultBox>
              <ResultRow name="band" label="Band" value={result.band.label} />
              <ResultRow name="words" label="Words scored" value={metrics.words.toLocaleString("en-US")} />
              <ResultRow name="sentences" label="Sentences" value={metrics.sentences.toLocaleString("en-US")} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" data-testid="res-note">
              {result.band.note}
            </p>
            {result.shortSample && (
              <div className="mt-3" data-testid="res-short">
                <Notice tone="warn">
                  {metrics.words} words is below the {MIN_RELIABLE_WORDS}-word sample the length and vocabulary
                  components were tuned for. Treat the score as indicative.
                </Notice>
              </div>
            )}
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Score components</PanelTitle>
          <div className="space-y-4" data-testid="res-components">
            {result.components.map((component) => (
              <div key={component.key}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {component.label} <span className="text-xs font-normal text-muted-foreground">({component.weight}% of total)</span>
                  </span>
                  <span data-testid={`res-c-${component.key}`} className="font-mono text-sm font-bold text-foreground">
                    {component.score.toFixed(0)}
                  </span>
                </div>
                <ProgressBar value={component.score} />
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {component.measured} — {component.rule}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How the composite is built</PanelTitle>
          <Notice>
            Clarity is a weighted average of the four components above: sentence length 30%, complex-word rate 25%,
            sentence variety 25% and long-sentence share 20%. It is not a published index — the weights and curves are
            stated here so you can judge them, and the individual components are usually more useful than the total.
          </Notice>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            The easiest ways to raise the score are to split the longest sentences, replace three-syllable words with
            shorter ones where the meaning survives, and make sure the sentences are not all the same length. Those are
            the same things the band note above points at, which is the point: the score is a summary of ordinary
            editing observations, not a verdict of its own.
          </p>
        </Panel>
      )}

      {!hasText && (
        <Panel>
          <PanelTitle>How the composite is built</PanelTitle>
          <Notice>
            Clarity is a weighted average of four measurable components: sentence length (30%), complex-word rate (25%),
            sentence variety (25%) and long-sentence share (20%). Each component and its rule appears here as soon as
            you enter text.
          </Notice>
        </Panel>
      )}
    </StackLayout>
  );
}
