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
import { CLICHES, findCliches } from "@/domains/writing/lib/text/phrases.ts";

/**
 * Clichés as a curated list, matched literally. The count is the number of list
 * entries the text contains — not a style score — and every hit shows the note
 * explaining why the phrase is on the list, so the judgement stays with the
 * writer.
 */
export default function ClicheDetector() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const matches = useMemo(() => findCliches(text), [text]);
  const hasText = text.trim().length > 0;

  const summaryText = useMemo(
    () =>
      [
        `Clichés found: ${matches.length} (list size ${CLICHES.length})`,
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
          placeholder="Paste a draft. Every phrase on the curated cliché list is flagged as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="cliches.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Clichés</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Clichés found"
            value={matches.length}
            testid="res-count"
            sub={`matched against a list of ${CLICHES.length} phrases`}
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
                  <th className="py-2 font-semibold">Why it is flagged</th>
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
          <PanelTitle>What this list can and cannot do</PanelTitle>
          <div className="space-y-2">
            <Notice>
              The detector matches a hand-maintained list of {CLICHES.length} tired expressions. Because it is a list,
              it is exact: a phrase is either on it or it is not, and the same input always gives the same answer.
            </Notice>
            <Notice tone="warn">
              A cliché is a cliché through overuse, and the line moves with context. In a speech or a headline a familiar
              phrase can be exactly the right choice. This tool reports matches; it does not score style, and it will not
              find an unusual phrase that has become tired in your own draft.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
