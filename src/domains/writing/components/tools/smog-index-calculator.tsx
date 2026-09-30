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
  MIN_SMOG_SENTENCES,
  gradeLabel,
  readabilityScores,
} from "@/domains/writing/lib/text/readability.ts";

/** SMOG to US grade conversion, as published with the index. */
const SMOG_GRADES = [
  { smog: "3 - 5", grade: "4th grade" },
  { smog: "6", grade: "5th grade" },
  { smog: "7", grade: "6th grade" },
  { smog: "8", grade: "7th grade" },
  { smog: "9", grade: "8th grade" },
  { smog: "10", grade: "9th grade" },
  { smog: "11", grade: "10th grade" },
  { smog: "12", grade: "11th grade" },
  { smog: "13", grade: "12th grade" },
  { smog: "14 - 18", grade: "College" },
];

/**
 * SMOG, the formula health-literacy research prefers because it needs only a
 * count of polysyllables. It was validated on 30 sentences, and the tool says so
 * rather than pretending a two-paragraph sample is equivalent.
 */
export default function SmogIndexCalculator() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const scores = useMemo(() => readabilityScores(text), [text]);
  const hasText = scores.words > 0 && scores.sentences > 0;

  const polyShare = scores.words > 0 ? scores.polySyllables / scores.words : 0;
  const formula = `1.043 × √(${scores.polySyllables} × 30 ÷ ${scores.sentences}) + 3.1291 = ${scores.smog}`;
  const grade = gradeLabel(scores.smog);
  const reliable = scores.sentences >= MIN_SMOG_SENTENCES;

  const summary = useMemo(
    () =>
      [
        `SMOG index: ${scores.smog} — ${grade}`,
        `Words of 3+ syllables: ${scores.polySyllables} of ${scores.words} (${(polyShare * 100).toFixed(1)}%)`,
        `Sentences: ${scores.sentences}`,
        formula,
        reliable
          ? "Sample size: at least 30 sentences, the range SMOG was validated on."
          : `Sample size: ${scores.sentences} sentences, below the 30 SMOG was validated on.`,
      ].join("\n"),
    [scores, grade, polyShare, formula, reliable],
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
          rows={12}
          placeholder="Paste the whole passage. SMOG is most reliable on 30 sentences or more."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy result" />
          <DownloadButton
            text={hasText ? summary : ""}
            filename="smog-index.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>SMOG index</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="SMOG index"
              value={scores.smog.toFixed(1)}
              testid="res-smog"
              sub={`${grade} reading level`}
            />
            <ResultBox>
              <ResultRow name="poly" label="Polysyllabic words (3+)" value={scores.polySyllables.toLocaleString("en-US")} />
              <ResultRow name="poly-share" label="Share of the text" value={`${(polyShare * 100).toFixed(1)}%`} />
              <ResultRow name="sentences" label="Sentences" value={scores.sentences.toLocaleString("en-US")} />
              <ResultRow name="words" label="Words" value={scores.words.toLocaleString("en-US")} />
              <ResultRow name="syllables" label="Syllables" value={scores.syllables.toLocaleString("en-US")} />
            </ResultBox>
            {!reliable && (
              <div className="mt-3" data-testid="res-warning">
                <Notice tone="warn">
                  {scores.sentences} sentence{scores.sentences === 1 ? "" : "s"} is below the{" "}
                  {MIN_SMOG_SENTENCES}-sentence sample SMOG was validated on. With so few sentences the index swings
                  hard: each extra polysyllabic word moves it by roughly 0.2.
                </Notice>
              </div>
            )}
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>The arithmetic</PanelTitle>
          <ResultBox>
            <ResultRow name="formula" label="1.043 × √(polysyllables × 30 ÷ sentences) + 3.1291" value={formula} />
          </ResultBox>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            SMOG counts only words of three or more syllables, which is why it is the usual choice when a word list is
            unavailable. It does not look at sentence length at all — a text of long one-syllable sentences will score
            easier here than it reads.
          </p>
        </Panel>
      )}

      <Panel>
        <PanelTitle>SMOG to grade</PanelTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">SMOG</th>
                <th className="py-2 font-semibold">Reading grade</th>
              </tr>
            </thead>
            <tbody>
              {SMOG_GRADES.map((row) => (
                <tr key={row.smog} className="border-t border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{row.smog}</td>
                  <td className="py-2 text-foreground">{row.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </StackLayout>
  );
}
