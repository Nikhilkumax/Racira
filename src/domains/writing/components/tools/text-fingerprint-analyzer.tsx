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
  compareProfiles,
  profileSimilarity,
  similarityBand,
  stylometricProfile,
} from "@/domains/writing/lib/text/stylometry.ts";

/**
 * Text fingerprint: a set of measurable features — sentence-length distribution,
 * word length, lexical diversity, punctuation rates, function-word share — for
 * one text, and a field-by-field comparison with a second text.
 *
 * The page is explicit about what this is not. It is not authorship attribution,
 * plagiarism detection or AI detection; those need calibrated corpora and
 * published error rates. Cosine similarity over function-word shares answers a
 * narrower question and the tool says which one.
 */
export default function TextFingerprintAnalyzer() {
  const [rawA, setRawA] = useState("");
  const [rawB, setRawB] = useState("");
  const textA = useDebouncedValue(rawA, 250);
  const textB = useDebouncedValue(rawB, 250);

  const profileA = useMemo(() => stylometricProfile(textA), [textA]);
  const profileB = useMemo(() => stylometricProfile(textB), [textB]);
  const comparisons = useMemo(() => compareProfiles(profileA, profileB), [profileA, profileB]);
  const similarity = useMemo(() => profileSimilarity(profileA, profileB), [profileA, profileB]);
  const band = similarityBand(similarity);

  const hasA = profileA.words > 0;
  const hasB = profileB.words > 0;
  const hasBoth = hasA && hasB;
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

  const summaryText = useMemo(
    () =>
      [
        hasBoth ? `Function-word similarity: ${pct(similarity)} — ${band.label}` : "Add a second text to compare.",
        "",
        "Profile of the first text:",
        `  Words: ${profileA.words} | Sentences: ${profileA.sentences}`,
        `  Mean sentence length: ${profileA.meanSentenceLength.toFixed(1)} words`,
        `  Mean word length: ${profileA.meanWordLength.toFixed(2)} letters`,
        `  Type-token ratio: ${profileA.typeTokenRatio.toFixed(3)}`,
        `  Function-word share: ${pct(profileA.functionWordShare)}`,
        "",
        "Comparison (first vs second):",
        ...comparisons.map(
          (row) => `  ${row.label}: ${row.a.toFixed(3)} vs ${row.b.toFixed(3)} (${row.difference >= 0 ? "+" : ""}${row.difference.toFixed(3)})`,
        ),
      ].join("\n"),
    [hasBoth, similarity, band.label, profileA, comparisons],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Two texts</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextArea
            name="text"
            label="Text A (reference)"
            value={rawA}
            onChange={setRawA}
            rows={9}
            placeholder="Paste the first text."
          />
          <TextArea
            name="compare"
            label="Text B (compare)"
            value={rawB}
            onChange={setRawB}
            rows={9}
            placeholder="Paste the second text."
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasA ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasA ? summaryText : ""}
            filename="text-fingerprint.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Profile similarity</PanelTitle>
        {!hasBoth ? (
          <EmptyState>Paste both texts — the comparison needs each side to contain words.</EmptyState>
        ) : (
          <>
            <HeroStat
              label="Function-word similarity"
              value={pct(similarity)}
              testid="res-similarity"
              sub={`${band.label} — cosine similarity of closed-class word distribution`}
            />
            <ResultBox>
              <ResultRow name="band" label="Reading" value={band.label} />
              <ResultRow name="words-a" label="Words in text A" value={profileA.words.toLocaleString("en-US")} />
              <ResultRow name="words-b" label="Words in text B" value={profileB.words.toLocaleString("en-US")} />
              <ResultRow
                name="fn-a"
                label="Function-word share, A"
                value={pct(profileA.functionWordShare)}
              />
              <ResultRow
                name="fn-b"
                label="Function-word share, B"
                value={pct(profileB.functionWordShare)}
              />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground" data-testid="res-note">
              {band.note}
            </p>
          </>
        )}
      </Panel>

      {hasA && (
        <Panel>
          <PanelTitle>Profile of text A</PanelTitle>
          <ResultBox>
            <ResultRow name="pa-sentences" label="Sentences" value={profileA.sentences.toLocaleString("en-US")} />
            <ResultRow
              name="pa-msl"
              label="Mean sentence length"
              value={`${profileA.meanSentenceLength.toFixed(1)} words`}
            />
            <ResultRow
              name="pa-stdev"
              label="Sentence-length variation"
              value={`${profileA.stdevSentenceLength.toFixed(1)} words`}
            />
            <ResultRow
              name="pa-mwl"
              label="Mean word length"
              value={`${profileA.meanWordLength.toFixed(2)} letters`}
            />
            <ResultRow name="pa-ttr" label="Type-token ratio" value={profileA.typeTokenRatio.toFixed(3)} />
            <ResultRow name="pa-root" label="Guiraud index" value={profileA.rootTtr.toFixed(2)} />
            <ResultRow name="pa-hapax" label="Words used once" value={pct(profileA.hapaxShare)} />
            <ResultRow name="pa-punct" label="Commas per 1,000 words" value={profileA.punctuationPer1000.commas.toFixed(1)} />
          </ResultBox>
        </Panel>
      )}

      {hasBoth && (
        <Panel>
          <PanelTitle>Field-by-field comparison</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-compare" className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Feature</th>
                  <th className="py-2 pr-3 font-semibold">A</th>
                  <th className="py-2 pr-3 font-semibold">B</th>
                  <th className="py-2 font-semibold">Difference</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row) => (
                  <tr key={row.label} className="border-t border-border/60">
                    <td className="py-2 pr-3 text-foreground">{row.label}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.a.toFixed(2)}</td>
                    <td className="py-2 pr-3 font-mono text-xs">{row.b.toFixed(2)}</td>
                    <td className="py-2 font-mono text-xs">
                      {row.difference >= 0 ? "+" : ""}
                      {row.difference.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What a fingerprint is — and is not</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The features here are counts: sentence lengths, word lengths, lexical diversity, punctuation rates and the
            share of function words. They describe a text, and they can show that two texts differ in measurable ways.
          </Notice>
          <Notice tone="warn">
            This is not authorship attribution, plagiarism detection or AI detection. Those need calibrated reference
            corpora and published error rates, which a browser tool cannot honestly supply. A high similarity simply
            means the two texts distribute function words and sentence lengths alike — two drafts on the same subject by
            the same writer will often score high, and so will two texts in the same genre by different writers.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
