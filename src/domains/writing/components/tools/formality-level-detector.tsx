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
import { formalityAnalysis } from "@/domains/writing/lib/text/register.ts";

/**
 * Formality as a transparent composite: six counted components, each with the
 * weight it carries, the measurement behind it and the rule that maps one to the
 * other. The score is a convention, so it is shown with its parts.
 */
export default function FormalityLevelDetector() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => formalityAnalysis(text), [text]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Formality score: ${result.score.toFixed(1)} / 100 — ${result.band.label}`,
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
          rows={11}
          placeholder="Paste a draft. Formality is a weighted blend of six countable markers."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="formality.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Formality</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Formality score"
              value={result.score.toFixed(1)}
              testid="res-score"
              sub={result.band.label}
            />
            <ResultBox>
              <ResultRow name="band" label="Register" value={result.band.label} />
              <ResultRow name="words" label="Words" value={result.words.toLocaleString("en-US")} />
              <ResultRow name="contractions" label="Contractions" value={result.counts.contractions} />
              <ResultRow name="informal" label="Informal words" value={result.counts.informal} />
              <ResultRow name="pronouns" label="First / second person pronouns" value={result.counts.pronouns} />
              <ResultRow name="markers" label="Formal connectors" value={result.counts.formalMarkers} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" data-testid="res-note">
              {result.band.note}
            </p>
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
                    {component.label}{" "}
                    <span className="text-xs font-normal text-muted-foreground">({component.weight}% of total)</span>
                  </span>
                  <span
                    data-testid={`res-c-${component.key}`}
                    className="font-mono text-sm font-bold text-foreground"
                  >
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

      <Panel>
        <PanelTitle>How the score is built</PanelTitle>
        <Notice>
          Formality is a weighted average of contractions (20%), informal vocabulary (25%), first- and second-person
          pronouns (20%), exclamations and questions (10%), formal connectors (15%) and sentence length (10%). It is a
          convention for this tool, not a published index, so the weights are stated here and the components are usually
          more useful than the total.
        </Notice>
      </Panel>
    </StackLayout>
  );
}
