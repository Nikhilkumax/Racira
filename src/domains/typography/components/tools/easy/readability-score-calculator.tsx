"use client";

import { useState } from "react";
import { CalcLayout, Panel, PanelTitle, RefTable, Res, ResBox, TextArea, fmtTrim } from "../ui";

/**
 * Readability Score Calculator — six standard readability formulas over one
 * text sample. Syllables use the classic English approximation (vowel groups,
 * corrected for silent -e and non-syllabic -ed/-es), which is what the
 * formulas were designed against.
 */
const DEFAULT_TEXT =
  "Typographic quality is not a matter of taste alone. A page becomes readable when its measure, leading, and contrast are tuned to the reader, and those choices can be measured rather than guessed.";

function countSyllables(raw: string): number {
  const w = raw.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let n = groups.length;
  if (/[^aeiou]e$/.test(w) && !/[aeiou]le$/.test(w)) n -= 1;
  if (/(?:[^aeiou]es|[^aeiou]ed)$/.test(w) && n > 1 && !/[aeiou]{2}(?:es|ed)$/.test(w)) n -= 1;
  return Math.max(1, n);
}

export default function ReadabilityScoreCalculator() {
  const [text, setText] = useState(DEFAULT_TEXT);

  const words = text.trim().split(/\s+/).filter((w) => /[a-z0-9]/i.test(w));
  const sentences = text.split(/[.!?]+(?:\s|$)/).filter((s) => /[a-z0-9]/i.test(s));
  const w = words.length;
  const s = Math.max(1, sentences.length);
  const syllableTotal = words.reduce((n, word) => n + countSyllables(word), 0);
  const letters = (text.match(/[a-z0-9]/gi) ?? []).length;
  const complex = words.filter((word) => countSyllables(word) >= 3).length;
  const valid = w >= 1;

  const perWord = valid ? syllableTotal / w : NaN;
  const perSentence = valid ? w / s : NaN;

  const flesch = valid ? 206.835 - 1.015 * perSentence - 84.6 * perWord : NaN;
  const fkGrade = valid ? 0.39 * perSentence + 11.8 * perWord - 15.59 : NaN;
  const fog = valid ? 0.4 * (perSentence + 100 * (complex / w)) : NaN;
  const smog = valid ? 1.043 * Math.sqrt(complex * (30 / s)) + 3.1291 : NaN;
  const ari = valid ? 4.71 * (letters / w) + 0.5 * perSentence - 21.43 : NaN;
  const coleman = valid ? 0.0588 * ((letters / w) * 100) - 0.296 * ((s / w) * 100) - 15.8 : NaN;
  const minutes = valid ? w / 200 : NaN;

  const scores: [string, string, string][] = [
    ["Flesch Reading Ease", valid ? fmtTrim(flesch, 1) : "—", "Higher is easier: 60–70 = plain English, 30–50 = college."],
    ["Flesch–Kincaid Grade", valid ? `${fmtTrim(fkGrade, 1)}` : "—", "US school grade level."],
    ["Gunning Fog", valid ? fmtTrim(fog, 1) : "—", "Grade level; 12+ needs a specialist reader."],
    ["SMOG Index", valid ? fmtTrim(smog, 1) : "—", "Grade level; built for health/consumer text."],
    ["Automated Readability Index", valid ? fmtTrim(ari, 1) : "—", "Grade level from characters per word."],
    ["Coleman–Liau", valid ? fmtTrim(coleman, 1) : "—", "Grade level from letters per 100 words."],
  ];

  const structured = [
    ["Words", String(w)],
    ["Sentences", String(sentences.length)],
    ["Syllables", String(syllableTotal)],
    ["Complex words (3+ syllables)", String(complex)],
    ["Words per sentence", valid ? fmtTrim(perSentence, 1) : "—"],
    ["Syllables per word", valid ? fmtTrim(perWord, 3) : "—"],
    ["Reading time (200 wpm)", valid ? `${fmtTrim(Math.max(1, Math.ceil(minutes)), 0)} min` : "—"],
  ];

  return (
    <CalcLayout>
      <Panel>
        <PanelTitle>Text sample</PanelTitle>
        <TextArea name="text" label="Paste or type text" value={text} onChange={setText} rows={12} />
        <ResBox>
          {structured.map(([label, value]) => (
            <Res key={label} label={label} value={value} />
          ))}
        </ResBox>
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelTitle>Scores</PanelTitle>
          <RefTable
            cols={["Formula", "Score", "Reading"]}
            rows={scores.map(([f, v, r]) => [f, v, r])}
            minWidth={460}
            note="Unrounded values are shown in the results panel; formulas are the standard published versions."
          />
        </Panel>
        <Panel>
          <PanelTitle>Interpretation</PanelTitle>
          <div className="space-y-2 text-sm leading-relaxed text-foreground">
            <p>
              Flesch Reading Ease of {valid ? fmtTrim(flesch, 1) : "—"} places this sample in the{" "}
              <strong>
                {!valid
                  ? "—"
                  : flesch >= 80
                    ? "very easy"
                    : flesch >= 60
                      ? "plain English"
                      : flesch >= 50
                        ? "fairly difficult"
                        : flesch >= 30
                          ? "difficult"
                          : "very difficult"}
              </strong>{" "}
              band. A grade-level formula around {valid ? fmtTrim((fkGrade + fog + ari + coleman) / 4, 1) : "—"} means a
              reader at that US school grade should follow it comfortably.
            </p>
            <p className="text-muted-foreground">
              Use the weakest result, not the average, when the text is regulated (health, legal, government), and re-run
              after every edit — swapping one clause can move a grade level.
            </p>
          </div>
        </Panel>
      </div>
    </CalcLayout>
  );
}
