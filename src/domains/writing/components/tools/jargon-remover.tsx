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
import { JARGON_TERMS, findJargon, removeJargon } from "@/domains/writing/lib/text/jargon.ts";

/**
 * Jargon remover: a fixed, published lexicon of workplace, technical, academic
 * and marketing terms with a plainer equivalent, applied mechanically. Every
 * substitution is listed with the note that says when the plain form fits, so
 * the rewrite can be reviewed rather than trusted — the classic empty words go,
 * and a precise technical term the writer wants is one glance away.
 */
export default function JargonRemover() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);

  const matches = useMemo(() => findJargon(text), [text]);
  const simplified = useMemo(() => removeJargon(text), [text]);
  const hasText = text.trim().length > 0;

  const wordsBefore = useMemo(() => (text.trim().match(/\S+/g) ?? []).length, [text]);
  const wordsAfter = useMemo(
    () => (simplified.output.trim().match(/\S+/g) ?? []).length,
    [simplified.output],
  );

  const summaryText = useMemo(
    () =>
      [
        `Jargon replacements: ${simplified.replacements.length}`,
        `Words: ${wordsBefore} → ${wordsAfter}`,
        `List size: ${JARGON_TERMS.length} documented terms`,
        "",
        ...simplified.replacements.map(
          (match) => `${match.source} → ${match.replacement ?? match.source} (${match.note})`,
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
          placeholder="Paste a draft. Terms on the documented jargon list are replaced with the plain equivalent; everything else is untouched."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report and result" />
          <DownloadButton
            text={hasText ? simplified.output : ""}
            filename="plain-language-draft.txt"
            testid="download-result"
            label="Download result"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Replacements</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <HeroStat
            label="Listed jargon terms replaced"
            value={simplified.replacements.length}
            testid="res-count"
            sub={`${wordsBefore} → ${wordsAfter} words · ${JARGON_TERMS.length} terms on the list`}
          />
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Plain-language draft</PanelTitle>
          <OutputBlock name="output" value={simplified.output} maxHeight={320} mono={false} />
        </Panel>
      )}

      {hasText && matches.length > 0 && (
        <Panel>
          <PanelTitle>Every change, with the reason</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-matches" className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Found</th>
                  <th className="py-2 pr-3 font-semibold">Plain alternative</th>
                  <th className="py-2 font-semibold">When it fits</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match, index) => (
                  <tr key={`${match.phrase}-${match.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-medium text-foreground">{match.source}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">{match.replacement}</td>
                    <td className="py-2 text-muted-foreground">{match.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && matches.length === 0 && (
        <Panel>
          <PanelTitle>No listed terms found</PanelTitle>
          <Notice>
            None of the {JARGON_TERMS.length} documented terms appears in this text. That is not a verdict on the
            writing: a word the list does not carry is never flagged, so jargon specific to your field will pass
            through untouched.
          </Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this tool is, and is not</PanelTitle>
        <div className="space-y-2">
          <Notice>
            The remover looks up {JARGON_TERMS.length} hand-written terms and substitutes the plain equivalent from a
            fixed table. It does not understand the sentence, it never paraphrases, and it never invents a word: a term
            not on the list leaves the text exactly as it was.
          </Notice>
          <Notice tone="warn">
            The replacement is a proposal, not a correction. Several entries are precise terms in the right context —
            &quot;robust&quot; in statistics, &quot;idempotent&quot; in computing, &quot;deprecated&quot; in an API
            changelog — so read the &quot;when it fits&quot; column before accepting a change, and keep the original
            where it is the accurate word.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
