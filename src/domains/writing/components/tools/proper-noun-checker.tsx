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
  AMBIGUOUS_PROPER_NOUNS,
  MAX_UNVERIFIED,
  PROPER_NOUN_COUNT,
  findProperNounIssues,
  formatProperNounReport,
} from "@/domains/writing/lib/text/proper-nouns.ts";

/**
 * Proper-noun checking against a documented lexicon: the names of days and
 * months come from the platform's Intl data, and the place, language and
 * nationality lists are a curated count published on the page. A second check
 * looks for a name the document itself writes two different ways.
 */
export default function ProperNounChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => findProperNounIssues(text), [text]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(() => formatProperNounReport(result), [result]);
  const ambiguous = useMemo(() => AMBIGUOUS_PROPER_NOUNS.join(", "), []);

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
          placeholder="Paste a draft. Documented names and names written two different ways are reported as you type."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="proper-noun-report.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Name findings"
              value={result.findings.length}
              testid="res-findings"
              sub={`${result.lexicon} documented names in the lexicon`}
            />
            <StatGrid>
              <Stat label="Name words checked" value={result.tokensChecked} testid="res-checked" />
              <Stat label="Lexicon size" value={result.lexicon} testid="res-lexicon" />
              <Stat label="Capitalised words not in it" value={result.unverified.length} testid="res-unverified" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.findings.length > 0 && (
        <Panel>
          <PanelTitle>Findings</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-findings-table" className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Found</th>
                  <th className="py-2 pr-3 font-semibold">Documented form</th>
                  <th className="py-2 pr-3 font-semibold">Kind</th>
                  <th className="py-2 font-semibold">Why it is flagged</th>
                </tr>
              </thead>
              <tbody>
                {result.findings.map((finding, index) => (
                  <tr key={`${finding.kind}-${finding.index}-${index}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-foreground">{finding.found}</td>
                    <td className="py-2 pr-3 font-mono text-foreground">{finding.suggestion}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{finding.kind}</td>
                    <td className="py-2 text-muted-foreground">{finding.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {hasText && result.unverified.length > 0 && (
        <Panel>
          <PanelTitle>Capitalised words not in the lexicon</PanelTitle>
          <div className="max-h-56 overflow-auto rounded-lg border border-border bg-background px-3 py-2">
            <p data-testid="res-unverified-list" className="font-mono text-xs leading-relaxed text-muted-foreground">
              {result.unverified.map((entry) => `${entry.word} ×${entry.count}`).join(" · ")}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            At most {MAX_UNVERIFIED} entries are listed, most frequent first. Nothing here is &quot;corrected&quot; — the
            tool has no opinion about a name it does not know, and this list is where your own characters, products and
            places show up.
          </p>
        </Panel>
      )}

      {hasText && result.findings.length === 0 && (
        <Panel>
          <PanelTitle>Result</PanelTitle>
          <Notice>
            No documented name is written lower-case, and no name in this document appears in two different forms. That
            is a statement about the {result.lexicon} names in the lexicon and about the words you repeated — not about
            every name in the world.
          </Notice>
        </Panel>
      )}

      <Panel>
        <PanelTitle>The lexicon and the two checks</PanelTitle>
        <div className="space-y-2">
          <Notice>
            {result.lexicon} names are checked: the long weekday and month names come from the platform&apos;s Intl data
            at run time, and the continents, planets, languages, nationalities and countries are a curated list. The
            second check reads your own text: if a word appears both capitalised mid-sentence and lower-case mid-sentence,
            the lower-case occurrences are reported so you can pick one form. A capital at the start of a sentence is
            never treated as evidence.
          </Notice>
          <Notice tone="warn">
            Names that are also ordinary words are never flagged alone: {ambiguous}. &quot;The turkey was dry&quot; is a
            sentence about dinner, so the tool waits for context it cannot manufacture.
          </Notice>
          <Notice tone="warn">
            This is not a gazetteer. A town, a company, a product or a person outside the list is simply unknown, and the
            tool says so by listing it rather than guessing at its spelling. Extending the lexicon is a documented
            change, not a matter of opinion.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
