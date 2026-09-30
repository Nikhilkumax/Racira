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
  TextArea,
  useDebouncedValue,
} from "./ui";
import { REDUNDANCIES, findRedundancies } from "@/domains/writing/lib/text/phrases.ts";

/**
 * Redundant pairs: a curated list of phrases whose two parts say the same thing.
 * The tool reports count and reason, and is explicit that redundancy is a
 * mechanical observation — sometimes an emphatic pair is a deliberate choice.
 */
export default function RedundancyFinder() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const matches = useMemo(() => findRedundancies(text), [text]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Redundant phrases found: ${matches.length} (list size ${REDUNDANCIES.length})`,
        ...matches.map((match) => `${match.source} — ${match.note}`),
      ].join("\n"),
    [matches],
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
          placeholder="Paste a draft. Every phrase whose parts repeat a meaning is flagged as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="redundancies.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Redundancies</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Redundant phrases found"
            value={matches.length}
            testid="res-count"
            sub={`matched against a list of ${REDUNDANCIES.length} pairs`}
          />
        )}
      </Panel>

      {hasText && matches.length > 0 && (
        <Panel>
          <PanelTitle>Matches</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-matches" className="w-full min-w-[34rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Phrase</th>
                  <th className="py-2 font-semibold">Where the repetition is</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr key={`${match.phrase}-${match.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-medium text-foreground">{match.source}</td>
                    <td className="py-2 text-muted-foreground">{match.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Why a pair is on the list</PanelTitle>
          <div className="space-y-2">
            <Notice>
              Each entry repeats a meaning: &quot;free gift&quot; because a gift is free, &quot;ATM machine&quot; because
              the M already stands for machine, &quot;advance planning&quot; because planning happens in advance. Cutting
              one word usually leaves the sentence intact.
            </Notice>
            <Notice tone="warn">
              Redundancy is not always a fault. Deliberate repetition can create emphasis, and legal drafting sometimes
              keeps a doubled phrase for precision. Read each match in context before cutting; the tool reports the pair
              and the reason, not a verdict.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
