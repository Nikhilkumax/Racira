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
  MIN_RELIABLE_WORDS,
  fleschBand,
  gradeLabel,
  readabilityScores,
} from "@/domains/writing/lib/text/readability.ts";

/** Published Flesch-Kincaid grade boundaries, shown as a reference table. */
const GRADE_TABLE = [
  { range: "1.0 - 2.9", level: "1st to 2nd grade", audience: "Early readers; very short sentences." },
  { range: "3.0 - 4.9", level: "3rd to 4th grade", audience: "Children's books and simple instructions." },
  { range: "5.0 - 6.9", level: "5th to 6th grade", audience: "Middle-grade fiction and plain-language guides." },
  { range: "7.0 - 8.9", level: "7th to 8th grade", audience: "Most newspapers, web copy and business writing." },
  { range: "9.0 - 12.9", level: "9th to 12th grade", audience: "Trade nonfiction and long-form reporting." },
  { range: "13.0 - 16.9", level: "College", audience: "Academic articles and technical documentation." },
  { range: "17.0+", level: "Graduate", audience: "Legal, medical and specialist literature." },
];

/**
 * The two Flesch scores, with the arithmetic written out so the reader can
 * check the result by hand.
 */
export default function FleschKincaidScoreCalculator() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const scores = useMemo(() => readabilityScores(text), [text]);
  const hasText = scores.words > 0 && scores.sentences > 0;

  const asl = scores.averageSentenceLength;
  const asw = scores.averageSyllablesPerWord;
  const ease = fleschBand(scores.fleschReadingEase);
  const grade = gradeLabel(scores.fleschKincaidGrade);

  const formulas = useMemo(() => {
    const fk = `0.39 × ${asl.toFixed(2)} + 11.8 × ${asw.toFixed(3)} − 15.59 = ${scores.fleschKincaidGrade}`;
    const fre = `206.835 − 1.015 × ${asl.toFixed(2)} − 84.6 × ${asw.toFixed(3)} = ${scores.fleschReadingEase}`;
    return { fk, fre };
  }, [asl, asw, scores.fleschKincaidGrade, scores.fleschReadingEase]);

  const summary = useMemo(
    () =>
      [
        `Flesch-Kincaid Grade Level: ${scores.fleschKincaidGrade} (${grade})`,
        `Flesch Reading Ease: ${scores.fleschReadingEase} (${ease.label})`,
        formulas.fk,
        formulas.fre,
        `Words: ${scores.words} | Sentences: ${scores.sentences} | Syllables: ${scores.syllables}`,
      ].join("\n"),
    [scores, grade, ease.label, formulas],
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
          placeholder="Paste the passage you want graded. Around 100 words or more gives a stable score."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy result" />
          <DownloadButton
            text={hasText ? summary : ""}
            filename="flesch-kincaid.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Score</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Flesch-Kincaid grade level"
              value={scores.fleschKincaidGrade.toFixed(1)}
              testid="res-fk"
              sub={grade}
            />
            <ResultBox>
              <ResultRow
                name="ease"
                label={`Flesch Reading Ease — ${ease.label}`}
                value={scores.fleschReadingEase.toFixed(1)}
              />
              <ResultRow name="asl" label="Average sentence length" value={`${asl.toFixed(2)} words`} />
              <ResultRow name="asw" label="Syllables per word" value={asw.toFixed(3)} />
              <ResultRow name="words" label="Words" value={scores.words.toLocaleString("en-US")} />
              <ResultRow name="sentences" label="Sentences" value={scores.sentences.toLocaleString("en-US")} />
              <ResultRow name="syllables" label="Syllables" value={scores.syllables.toLocaleString("en-US")} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>The arithmetic</PanelTitle>
          <ResultBox>
            <ResultRow name="formula-fk" label="Grade level" value={formulas.fk} />
            <ResultRow name="formula-ease" label="Reading ease" value={formulas.fre} />
          </ResultBox>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Both formulas use the same two inputs: average sentence length in words and average syllables per word.
            Long sentences raise the grade; long words raise it faster.
          </p>
          {scores.words < MIN_RELIABLE_WORDS && (
            <div className="mt-3">
              <Notice tone="warn">
                {scores.words} words is below the {MIN_RELIABLE_WORDS}-word floor these formulas are usually quoted
                for. Treat the score as indicative and re-run it on the finished passage.
              </Notice>
            </div>
          )}
        </Panel>
      )}

      <Panel>
        <PanelTitle>Grade reference</PanelTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-semibold">Score</th>
                <th className="py-2 pr-4 font-semibold">Grade</th>
                <th className="py-2 font-semibold">Typical material</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_TABLE.map((row) => (
                <tr key={row.range} className="border-t border-border/60">
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">{row.range}</td>
                  <td className="py-2 pr-4 text-foreground">{row.level}</td>
                  <td className="py-2 text-muted-foreground">{row.audience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </StackLayout>
  );
}
