"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Notice,
  OutputBlock,
  Panel,
  PanelTitle,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { WORDY_PHRASES, findWordiness, simplifyWordiness } from "@/domains/writing/lib/text/phrases.ts";

/**
 * Wordy expressions with a plainer equivalent, applied to produce a tightened
 * copy. Because the replacements are a fixed table, the output is deterministic
 * and every change is listed — nothing is rewritten that the user cannot see.
 */
export default function WordyPhraseSimplifier() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);

  const matches = useMemo(() => findWordiness(text), [text]);
  const simplified = useMemo(() => simplifyWordiness(text), [text]);
  const hasText = text.trim().length > 0;

  const wordsBefore = useMemo(() => (text.trim().match(/\S+/g) ?? []).length, [text]);
  const wordsAfter = useMemo(() => (simplified.output.trim().match(/\S+/g) ?? []).length, [simplified.output]);

  const summaryText = useMemo(
    () =>
      [
        `Replacements: ${simplified.replacements.length}`,
        `Words: ${wordsBefore} → ${wordsAfter}`,
        "",
        ...simplified.replacements.map(
          (match) => `${match.source} → ${match.replacement === "" ? "(removed)" : match.replacement}`,
        ),
        "",
        simplified.output,
      ].join("\n"),
    [simplified, wordsBefore, wordsAfter],
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
          placeholder="Paste a draft. Wordy phrases are replaced with the shorter equivalent from a fixed table."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report and result" />
          <DownloadButton
            text={hasText ? simplified.output : ""}
            filename="simplified.txt"
            testid="download-simplified"
            label="Download result"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Simplification</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Phrases replaced"
            value={simplified.replacements.length}
            testid="res-count"
            sub={`${wordsBefore} → ${wordsAfter} words`}
          />
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Simplified text</PanelTitle>
          <OutputBlock name="simplified" value={hasText ? simplified.output : ""} maxHeight={320} mono={false} />
        </Panel>
      )}

      {hasText && matches.length > 0 && (
        <Panel>
          <PanelTitle>Every change</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-matches" className="w-full min-w-[30rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Wordy</th>
                  <th className="py-2 pr-3 font-semibold">Simpler</th>
                  <th className="py-2 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr key={`${match.phrase}-${match.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-medium text-foreground">{match.source}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">
                      {match.replacement === "" ? "(removed)" : match.replacement}
                    </td>
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
          <PanelTitle>How the rewrite is produced</PanelTitle>
          <div className="space-y-2">
            <Notice>
              The simplifier looks up {WORDY_PHRASES.length} known wordy expressions and substitutes the shorter form from
              a fixed table, left to right. It never paraphrases: if a phrase is not on the list, the text is untouched,
              and every substitution is listed above so the result can be checked line by line.
            </Notice>
            <Notice tone="warn">
              A replacement is not always right in context. &quot;In terms of&quot; is sometimes the precise phrase, and
              deleting filler can change an emphasis you wanted. Read the simplified text as a proposal and edit it,
              rather than pasting it back unread.
            </Notice>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
