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
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  HOMOPHONE_PAIR_COUNT,
  HOMOPHONE_RULES,
  findHomophoneConfusions,
  formatHomophoneReport,
  homophoneCounts,
} from "@/domains/writing/lib/text/homophones.ts";

/**
 * Homophone confusions found by context, not by blanket replacement.
 *
 * Each of the published pairs fires only when the surrounding words make one
 * spelling implausible ("your going", "and than", "has past"), which is why the
 * tool can name the pair and the reason. The page states that it never edits the
 * text and that a finding is a question, not a correction.
 */
export default function HomophoneConfusionDetector() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const findings = useMemo(() => findHomophoneConfusions(text), [text]);
  const byPair = useMemo(() => homophoneCounts(findings), [findings]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(() => formatHomophoneReport(findings, HOMOPHONE_PAIR_COUNT), [findings]);

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
          placeholder="Paste a draft. Confusion pairs are checked against their surrounding words as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="homophones.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Possible confusions"
              value={findings.length}
              testid="res-findings"
              sub={`${HOMOPHONE_PAIR_COUNT} pairs checked with ${HOMOPHONE_RULES.length} context rules`}
            />
            <StatGrid>
              <Stat label="Pairs with a hit" value={byPair.length} testid="res-pairs" />
              <Stat label="Rules run" value={HOMOPHONE_RULES.length} testid="res-rules" />
              <Stat label="Pairs in the list" value={HOMOPHONE_PAIR_COUNT} testid="res-listed" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && findings.length > 0 && (
        <Panel>
          <PanelTitle>Where the context points elsewhere</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-findings-table" className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Word</th>
                  <th className="py-2 pr-3 font-semibold">This context calls for</th>
                  <th className="py-2 pr-3 font-semibold">Pair</th>
                  <th className="py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((finding, index) => (
                  <tr key={`${finding.rule}-${finding.start}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-foreground">{finding.word}</td>
                    <td className="py-2 pr-3 font-mono text-foreground">{finding.suggestion}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{finding.pair}</td>
                    <td className="py-2 text-muted-foreground">{finding.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What is checked, and how</PanelTitle>
        <div className="space-y-2">
          <Notice>
            {HOMOPHONE_RULES.length} rules cover {HOMOPHONE_PAIR_COUNT} documented pairs: your / you&apos;re, its /
            it&apos;s, their / there / they&apos;re, then / than, to / too / two, who&apos;s / whose, affect / effect,
            weather / whether, lose / loose, and their relatives. Each rule is a construction, not a word: the tool
            fires on &quot;your going&quot; but stays silent on &quot;your book&quot;.
          </Notice>
          <Notice tone="warn">
            A finding is a question, not a correction. The tool never edits your text — it shows the word, the spelling
            the surrounding words call for, and why. Read the sentence and overrule it whenever the flagged form is what
            you meant.
          </Notice>
          <Notice>
            Pairs whose contexts are identical are not checked at all. &quot;I read it yesterday&quot; and &quot;I red
            it yesterday&quot; cannot be told apart by the words around them, so a read / red rule would only produce
            noise — the list leaves those out.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
