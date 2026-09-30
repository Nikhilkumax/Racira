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
  TextInput,
  useDebouncedValue,
} from "./ui";
import { normalisedTokens } from "@/domains/writing/lib/text/ngrams.ts";
import { movingAverageTtr, stylometricProfile } from "@/domains/writing/lib/text/stylometry.ts";

/** Window sizes shown in the comparison table, chosen to span short and long. */
const WINDOWS = [50, 100, 200, 500];

/**
 * Lexical diversity across window sizes. Every diversity measure trades one bias
 * for another, so this tool shows several at once — plain TTR, the Guiraud and
 * Herdan indices, and MATTR at four window widths — instead of picking one and
 * presenting it as the answer.
 */
export default function LexicalDiversityCalculator() {
  const [raw, setRaw] = useState("");
  const [windowSize, setWindowSize] = useState("100");
  const text = useDebouncedValue(raw, 250);

  const window = Math.max(10, Math.min(2000, Math.floor(Number(windowSize)) || 100));
  const profile = useMemo(() => stylometricProfile(text), [text]);
  const tokens = useMemo(() => normalisedTokens(text), [text]);
  const mattr = useMemo(() => movingAverageTtr(tokens, window), [tokens, window]);
  const curve = useMemo(
    () => WINDOWS.map((size) => ({ size, value: movingAverageTtr(tokens, size) })),
    [tokens],
  );

  const types = useMemo(() => new Set(tokens).size, [tokens]);
  const total = tokens.length;
  const herdan = total > 1 ? Math.log(types) / Math.log(total) : 0;
  const guiraud = total > 0 ? types / Math.sqrt(total) : 0;
  const hasText = total > 0;

  const summaryText = useMemo(
    () =>
      [
        `Tokens: ${total} | Types: ${types}`,
        `Type-token ratio: ${(total > 0 ? types / total : 0).toFixed(3)}`,
        `Guiraud index: ${guiraud.toFixed(2)}`,
        `Herdan index: ${herdan.toFixed(3)}`,
        `Moving-average TTR (window ${window}): ${mattr.toFixed(3)}`,
        "",
        "MATTR by window size:",
        ...curve.map((row) => `  ${row.size}: ${row.value.toFixed(3)}`),
      ].join("\n"),
    [total, types, guiraud, herdan, mattr, window, curve],
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
          placeholder="Paste a draft. Diversity measures stabilise once there are several hundred tokens."
        />
        <div className="mt-3 max-w-xs">
          <TextInput
            name="window"
            label="Reference window"
            value={windowSize}
            onChange={setWindowSize}
            type="number"
            hint="tokens"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={hasText ? summaryText : ""} testid="copy-summary" label="Copy report" />
          <DownloadButton
            text={hasText ? summaryText : ""}
            filename="lexical-diversity.txt"
            testid="download-summary"
            label="Download"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Diversity</PanelTitle>
        {!hasText ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label={`MATTR at window ${window}`}
              value={mattr.toFixed(3)}
              testid="res-mattr"
              sub="Averaged type-token ratio — the length-stable measure"
            />
            <ResultBox>
              <ResultRow name="tokens" label="Tokens" value={total.toLocaleString("en-US")} />
              <ResultRow name="types" label="Types (distinct tokens)" value={types.toLocaleString("en-US")} />
              <ResultRow name="ttr" label="Type-token ratio" value={(total > 0 ? types / total : 0).toFixed(3)} />
              <ResultRow name="guiraud" label="Guiraud index (types ÷ √tokens)" value={guiraud.toFixed(2)} />
              <ResultRow name="herdan" label="Herdan index (log types ÷ log tokens)" value={herdan.toFixed(3)} />
              <ResultRow name="sentences" label="Sentences" value={profile.sentences.toLocaleString("en-US")} />
            </ResultBox>
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>MATTR by window size</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-windows" className="w-full min-w-[18rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">Window (tokens)</th>
                  <th className="py-2 font-semibold">MATTR</th>
                </tr>
              </thead>
              <tbody>
                {curve.map((row) => (
                  <tr key={row.size} className="border-t border-border/60">
                    <td className="py-2 pr-3 font-mono text-xs">{row.size}</td>
                    <td className="py-2 font-mono text-xs">{row.value.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            A window wider than the text collapses to the whole-text ratio, so the 500-token row equals plain TTR on
            any text shorter than 500 tokens. That is expected, and it is why the reference window is adjustable.
          </p>
        </Panel>
      )}

      {hasText && (
        <Panel>
          <PanelTitle>Which measure to trust</PanelTitle>
          <div className="space-y-2">
            <Notice>
              Type-token ratio falls as a text grows, so it cannot compare a short sample with a long one. MATTR and the
              Guiraud and Herdan indices correct for that in different ways, which is why several are shown rather than
              one. None of them is a quality score: repetition can be deliberate.
            </Notice>
            {total < 200 && (
              <Notice tone="warn">
                Only {total} tokens. Diversity measures need several hundred tokens before they settle, so treat every
                figure here as provisional.
              </Notice>
            )}
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
