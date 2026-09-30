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
  DOUBLE_L_STEMS,
  VARIANT_PAIRS,
  VARIANT_PAIR_COUNT,
  analyseSpellingVariants,
  formatVariantReport,
} from "@/domains/writing/lib/text/spelling-variants.ts";

/**
 * US / UK consistency: the fault is a document that mixes colour and color, not
 * either spelling on its own. The verdict is about the document, and the tool
 * reports which variant the draft leans on rather than claiming a correct one.
 */
const VERDICTS: Record<string, string> = {
  "consistent-us": "US",
  "consistent-uk": "UK",
  mixed: "Mixed",
  "no-variant-words": "—",
};

export default function ConsistentSpellingChecker() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const result = useMemo(() => analyseSpellingVariants(text), [text]);
  const hasText = text.trim().length > 0;

  const summary = useMemo(() => formatVariantReport(result), [result]);
  const listed = useMemo(() => VARIANT_PAIRS.map((pair) => `${pair.us}/${pair.uk}`).join(" · "), []);

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
          placeholder="Paste a draft. US and UK variants are compared as you type — both spellings are correct, the mix is the finding."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summary : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton text={hasText ? summary : ""} filename="spelling-variants.txt" testid="download-summary" label="Download" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="The document leans"
              value={VERDICTS[result.consistency]}
              testid="res-dominant"
              sub={
                result.consistency === "mixed"
                  ? `${result.mixedFamilies.length} ${result.mixedFamilies.length === 1 ? "family is" : "families are"} written both ways`
                  : result.consistency === "no-variant-words"
                    ? "no variant word from the published pairs appears"
                    : "consistently, across every family found"
              }
            />
            <StatGrid>
              <Stat label="US forms" value={result.usTotal} testid="res-us" />
              <Stat label="UK forms" value={result.ukTotal} testid="res-uk" />
              <Stat label="Families written both ways" value={result.mixedFamilies.length} testid="res-mixed" />
              <Stat label="Pairs in the list" value={VARIANT_PAIR_COUNT} testid="res-listed" />
            </StatGrid>
          </>
        )}
      </Panel>

      {hasText && result.families.length > 0 && (
        <Panel>
          <PanelTitle>Families found</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-families" className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Family</th>
                  <th className="py-2 pr-3 font-semibold">US forms</th>
                  <th className="py-2 pr-3 font-semibold">UK forms</th>
                  <th className="py-2 pr-3 font-semibold">Rule</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.families.map((family) => (
                  <tr key={family.family} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono text-foreground">{family.family}</td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">
                      {family.usForms.length > 0 ? `${family.usForms.join(", ")} ×${family.usCount}` : "—"}
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-foreground">
                      {family.ukForms.length > 0 ? `${family.ukForms.join(", ")} ×${family.ukCount}` : "—"}
                    </td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{family.rule}</td>
                    <td className="py-2 text-xs">
                      {family.mixed ? (
                        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                          mixed
                        </span>
                      ) : (
                        <span className="text-muted-foreground">one variant</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What is compared, and what is not</PanelTitle>
        <div className="space-y-2">
          <Notice>
            {VARIANT_PAIR_COUNT} published pairs are checked (color/colour, center/centre, defense/defence,
            catalog/catalogue, gray/grey …), plus three families matched on the shared stem so a word that is not on the
            list is still caught: -ize/-ise (organize/organise), -yze/-yse (analyze/analyse) and the -ll-/-l- doubling
            group ({DOUBLE_L_STEMS.length} stems, traveled/travelled).
          </Notice>
          <Notice tone="warn">
            Both spellings are correct English; the finding is always about one document mixing them, which reads like
            two hands wrote it. A mixed verdict never means a word is wrong — it means a reader can see a seam.
          </Notice>
          <Notice tone="warn">
            The published pairs deliberately exclude words whose meanings have drifted apart: check/cheque, tire/tyre,
            curb/kerb, draft/draught and storey/story are different words now, not variants, so they are not compared. A
            document is never told to change a spelling on their account.
          </Notice>
          <Notice>
            The stem-matched families are reported only when both shapes appear. &quot;traveled&quot; alone or
            &quot;travelled&quot; alone is not evidence about the writer, since both are accepted on both sides of the
            Atlantic; only a draft that uses both is flagged.
          </Notice>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>The published pair list</PanelTitle>
        <div className="max-h-56 overflow-auto rounded-lg border border-border bg-background px-3 py-2">
          <p data-testid="res-pairs" className="font-mono text-xs leading-relaxed text-muted-foreground">
            {listed}
          </p>
        </div>
      </Panel>
    </StackLayout>
  );
}
