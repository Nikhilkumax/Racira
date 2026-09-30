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
  useDebouncedValue,
} from "./ui";
import {
  fleschBand,
  gradeLabel,
  readabilityNotes,
  readabilityScores,
} from "@/domains/writing/lib/text/readability.ts";
import { DEFAULT_WPM, formatDuration } from "@/domains/writing/lib/text/stats.ts";

/**
 * Every published readability formula in one readout, with the counts they were
 * computed from shown beside them so the number can be checked by hand.
 */
export default function ReadabilityGradeScorer() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const scores = useMemo(() => readabilityScores(text), [text]);
  const notes = useMemo(() => readabilityNotes(scores), [scores]);

  const hasText = scores.words > 0 && scores.sentences > 0;
  const ease = fleschBand(scores.fleschReadingEase);
  const grade = gradeLabel(scores.fleschKincaidGrade);

  const summary = useMemo(
    () =>
      [
        `Overall grade (Flesch-Kincaid): ${scores.fleschKincaidGrade} — ${grade}`,
        `Flesch Reading Ease: ${scores.fleschReadingEase} (${ease.label})`,
        `Gunning Fog: ${scores.gunningFog} — ${gradeLabel(scores.gunningFog)}`,
        `SMOG: ${scores.smog} — ${gradeLabel(scores.smog)}`,
        `Coleman-Liau: ${scores.colemanLiau} — ${gradeLabel(scores.colemanLiau)}`,
        `Automated Readability Index: ${scores.automatedReadability} — ${gradeLabel(scores.automatedReadability)}`,
        `Words: ${scores.words} | Sentences: ${scores.sentences} | Syllables: ${scores.syllables}`,
        `Average sentence length: ${scores.averageSentenceLength.toFixed(1)} words | ` +
          `Syllables per word: ${scores.averageSyllablesPerWord.toFixed(2)}`,
      ].join("\n"),
    [scores, ease.label, grade],
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
          placeholder="Paste at least a few paragraphs — readability formulas are unstable on short samples."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy all scores" />
          <DownloadButton
            text={hasText ? summary : ""}
            filename="readability-scores.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Reading level</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Overall grade level"
              value={grade}
              testid="res-grade"
              sub={`Flesch-Kincaid grade ${scores.fleschKincaidGrade}`}
            />
            <ResultBox>
              <ResultRow
                name="flesch"
                label={`Flesch Reading Ease — ${ease.label}`}
                value={scores.fleschReadingEase.toFixed(1)}
              />
              <ResultRow name="fk" label="Flesch-Kincaid Grade Level" value={scores.fleschKincaidGrade.toFixed(1)} />
              <ResultRow name="fog" label="Gunning Fog Index" value={scores.gunningFog.toFixed(1)} />
              <ResultRow name="smog" label="SMOG Index" value={scores.smog.toFixed(1)} />
              <ResultRow name="cli" label="Coleman-Liau Index" value={scores.colemanLiau.toFixed(1)} />
              <ResultRow
                name="ari"
                label="Automated Readability Index"
                value={scores.automatedReadability.toFixed(1)}
              />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{ease.note}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Reading time at the site default of {DEFAULT_WPM} words per minute:{" "}
              {formatDuration((scores.words / DEFAULT_WPM) * 60)} for {scores.words.toLocaleString("en-US")} words.
            </p>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>What the scores were computed from</PanelTitle>
          <ResultBox>
            <ResultRow name="words" label="Words" value={scores.words.toLocaleString("en-US")} />
            <ResultRow name="sentences" label="Sentences" value={scores.sentences.toLocaleString("en-US")} />
            <ResultRow name="paragraphs" label="Paragraphs" value={scores.paragraphs.toLocaleString("en-US")} />
            <ResultRow name="syllables" label="Syllables" value={scores.syllables.toLocaleString("en-US")} />
            <ResultRow
              name="poly"
              label="Words of 3+ syllables"
              value={`${scores.polySyllables.toLocaleString("en-US")} (${(
                (scores.polySyllables / scores.words) *
                100
              ).toFixed(1)}%)`}
            />
            <ResultRow
              name="complex"
              label="Gunning complex words"
              value={`${scores.complexWords.toLocaleString("en-US")} (proper nouns excluded)`}
            />
            <ResultRow
              name="asl"
              label="Average sentence length"
              value={`${scores.averageSentenceLength.toFixed(1)} words`}
            />
            <ResultRow
              name="asw"
              label="Syllables per word"
              value={scores.averageSyllablesPerWord.toFixed(2)}
            />
            <ResultRow
              name="long"
              label="Words of 7+ letters"
              value={`${(scores.longWordShare * 100).toFixed(1)}%`}
            />
          </ResultBox>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>How to read these numbers</PanelTitle>
          <div className="space-y-2" data-testid="res-notes">
            {notes.map((note) => (
              <Notice key={note}>{note}</Notice>
            ))}
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
