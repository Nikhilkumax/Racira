"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
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
  gradeLabel,
  readabilityScores,
} from "@/domains/writing/lib/text/readability.ts";
import { countSyllables } from "@/domains/writing/lib/text/syllables.ts";
import { wordTokens } from "@/domains/writing/lib/text/tokenize.ts";

/**
 * The Gunning Fog index, plus the complex words that produced it — the list is
 * the actionable part, because it names exactly which words raised the score.
 */
export default function GunningFogIndexCalculator() {
  const [raw, setRaw] = useState("");
  const [excludeProperNouns, setExcludeProperNouns] = useState(true);
  const text = useDebouncedValue(raw, 250);

  const scores = useMemo(() => readabilityScores(text), [text]);
  const hasText = scores.words > 0 && scores.sentences > 0;

  /** Complex words with their counts, for the "what raised the score" table. */
  const complexWords = useMemo(() => {
    if (scores.words === 0) return [];
    const counts = new Map<string, { count: number; syllables: number }>();
    for (const token of wordTokens(text).map((entry) => entry.text)) {
      const syllables = countSyllables(token);
      if (syllables < 3) continue;
      if (excludeProperNouns && /^[A-ZÀ-Þ]/.test(token)) continue;
      const stem = token.toLowerCase().replace(/(?:es|ed|ing)$/, "");
      if (stem.length >= 2 && countSyllables(stem) <= 2) continue;
      const key = token.toLowerCase();
      const entry = counts.get(key) ?? { count: 0, syllables };
      entry.count += 1;
      counts.set(key, entry);
    }
    return [...counts.entries()]
      .map(([word, value]) => ({ word, ...value }))
      .sort((a, b) => b.count - a.count || b.syllables - a.syllables || a.word.localeCompare(b.word))
      .slice(0, 40);
  }, [text, scores.words, excludeProperNouns]);

  const asl = scores.averageSentenceLength;
  const complexShare = scores.words > 0 ? scores.complexWords / scores.words : 0;
  const formula = `0.4 × (${asl.toFixed(2)} + 100 × ${scores.complexWords}/${scores.words}) = ${scores.gunningFog}`;
  const grade = gradeLabel(scores.gunningFog);

  const summary = useMemo(
    () =>
      [
        `Gunning Fog index: ${scores.gunningFog} — ${grade}`,
        `Complex words (3+ syllables): ${scores.complexWords} of ${scores.words}`,
        `Share of complex words: ${(complexShare * 100).toFixed(1)}%`,
        `Average sentence length: ${asl.toFixed(2)} words`,
        formula,
      ].join("\n"),
    [scores, grade, complexShare, asl, formula],
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
          placeholder="Paste the passage you want to score. The Fog index is usually reported on 100 words or more."
        />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Checkbox
            name="proper-nouns"
            label="Exclude capitalised words (proper nouns)"
            checked={excludeProperNouns}
            onChange={setExcludeProperNouns}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy result" />
          <DownloadButton
            text={hasText ? summary : ""}
            filename="gunning-fog.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Fog index</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat label="Gunning Fog index" value={scores.gunningFog.toFixed(1)} testid="res-fog" sub={grade} />
            <ResultBox>
              <ResultRow name="complex" label="Complex words (3+ syllables)" value={scores.complexWords.toLocaleString("en-US")} />
              <ResultRow name="complex-share" label="Share of the text" value={`${(complexShare * 100).toFixed(1)}%`} />
              <ResultRow name="asl" label="Average sentence length" value={`${asl.toFixed(2)} words`} />
              <ResultRow name="words" label="Words" value={scores.words.toLocaleString("en-US")} />
              <ResultRow name="sentences" label="Sentences" value={scores.sentences.toLocaleString("en-US")} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Gunning's rule counts a word as complex at three or more syllables, ignoring proper nouns and words that
              reach three syllables only through an -es, -ed or -ing ending. A Fog index of 12 is often quoted as the
              ceiling for writing aimed at a general audience.
            </p>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>The arithmetic</PanelTitle>
          <ResultBox>
            <ResultRow name="formula" label="0.4 × (ASL + 100 × complex ÷ words)" value={formula} />
          </ResultBox>
          {scores.words < MIN_RELIABLE_WORDS && (
            <div className="mt-3">
              <Notice tone="warn">
                {scores.words} words is a short sample. Fog is stable from about {MIN_RELIABLE_WORDS} words, and a
                single long word moves it further than it should on a short extract.
              </Notice>
            </div>
          )}
        </Panel>
      )}

      {complexWords.length > 0 && (
        <Panel>
          <PanelTitle right={<span className="text-[10px] text-muted-foreground">{complexWords.length} shown</span>}>
            Words that raised the score
          </PanelTitle>
          <div className="max-h-80 overflow-auto" data-testid="complex-list">
            <ResultBox>
              {complexWords.map((entry) => (
                <ResultRow
                  key={entry.word}
                  label={entry.word}
                  value={`${entry.syllables} syllables${entry.count > 1 ? ` × ${entry.count}` : ""}`}
                />
              ))}
            </ResultBox>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Each of these is a candidate for replacement with a shorter word. The list is a suggestion, not a rule:
            technical terms are often the most precise word available.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
