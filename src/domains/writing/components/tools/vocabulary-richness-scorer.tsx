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
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import { normalisedTokens } from "@/domains/writing/lib/text/ngrams.ts";
import { movingAverageTtr, stylometricProfile } from "@/domains/writing/lib/text/stylometry.ts";

/**
 * Vocabulary richness, with the length trap made explicit. Plain type-token
 * ratio falls as a text grows — a 5,000-word essay has a lower TTR than a
 * 50-word note even if its vocabulary is richer — so the headline number here is
 * the moving-average TTR, which is computed over fixed windows and stays
 * comparable between texts of different lengths.
 */
export default function VocabularyRichnessScorer() {
  const [raw, setRaw] = useState("");
  const [windowSize, setWindowSize] = useState("100");
  const text = useDebouncedValue(raw, 250);

  const window = Math.max(10, Math.min(2000, Math.floor(Number(windowSize)) || 100));
  const profile = useMemo(() => stylometricProfile(text), [text]);
  const tokens = useMemo(() => normalisedTokens(text), [text]);
  const mattr = useMemo(() => movingAverageTtr(tokens, window), [tokens, window]);

  const hasText = profile.words > 0;
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  const summaryText = useMemo(
    () =>
      [
        `Words: ${profile.words} | Unique: ${Math.round(profile.typeTokenRatio * profile.words)}`,
        `Type-token ratio: ${profile.typeTokenRatio.toFixed(3)}`,
        `Moving-average TTR (window ${window}): ${mattr.toFixed(3)}`,
        `Guiraud index (root TTR): ${profile.rootTtr.toFixed(2)}`,
        `Words used once (hapax share): ${pct(profile.hapaxShare)}`,
        `Syllables per word: ${profile.syllablesPerWord.toFixed(2)}`,
      ].join("\n"),
    [profile, mattr, window],
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
          placeholder="Paste a draft. Richness is only meaningful on a few hundred words or more."
        />
        <div className="mt-3 max-w-xs">
          <TextInput
            name="window"
            label="Moving-average window"
            value={windowSize}
            onChange={setWindowSize}
            type="number"
            hint="words"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="vocabulary-richness.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Richness</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label={`Moving-average TTR (window ${window})`}
              value={mattr.toFixed(3)}
              testid="res-mattr"
              sub="Average type-token ratio over fixed windows — stable across text lengths"
            />
            <ResultBox>
              <ResultRow name="words" label="Words" value={profile.words.toLocaleString("en-US")} />
              <ResultRow
                name="unique"
                label="Unique words"
                value={Math.round(profile.typeTokenRatio * profile.words).toLocaleString("en-US")}
              />
              <ResultRow name="ttr" label="Type-token ratio (whole text)" value={profile.typeTokenRatio.toFixed(3)} />
              <ResultRow name="root-ttr" label="Guiraud index (unique ÷ √words)" value={profile.rootTtr.toFixed(2)} />
              <ResultRow name="hapax" label="Words used exactly once" value={pct(profile.hapaxShare)} />
              <ResultRow name="spw" label="Syllables per word" value={profile.syllablesPerWord.toFixed(2)} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Why the whole-text ratio is listed second</PanelTitle>
          <Notice>
            Type-token ratio is the simplest richness measure and the most misleading: it falls mechanically as a text
            grows, because common words repeat. That is why the headline number is the moving-average TTR, which
            averages the ratio over {window}-word windows, and the raw figure sits below it for comparison. A Guiraud
            index is also shown because it stays steadier across lengths than plain TTR.
          </Notice>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            No band or pass/fail is attached. Richness depends on genre — legal writing repeats terms on purpose, and
            literary prose repeats them for effect — so the honest output is the measurement plus the length warning,
            not a verdict.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
