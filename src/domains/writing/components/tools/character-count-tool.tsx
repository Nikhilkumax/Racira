"use client";

import { useMemo, useState } from "react";
import {
  CopyButton,
  DownloadButton,
  EmptyState,
  HeroStat,
  Panel,
  PanelTitle,
  ProgressBar,
  ResultBox,
  ResultRow,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import { textStats } from "@/domains/writing/lib/text/stats.ts";

/** Real limits people actually count against. */
const LIMITS: { name: string; label: string; limit: number }[] = [
  { name: "x-post", label: "X / Twitter post", limit: 280 },
  { name: "sms", label: "SMS segment", limit: 160 },
  { name: "meta-description", label: "Meta description", limit: 155 },
  { name: "seo-title", label: "SEO title tag", limit: 60 },
  { name: "instagram-caption", label: "Instagram caption", limit: 2200 },
  { name: "linkedin-post", label: "LinkedIn post", limit: 3000 },
];

export default function CharacterCountTool() {
  const [raw, setRaw] = useState("");
  const text = useDebouncedValue(raw, 250);
  const stats = useMemo(() => textStats(text), [text]);

  const summary = useMemo(
    () =>
      [
        `Characters (with spaces): ${stats.characters}`,
        `Characters (without spaces): ${stats.charactersNoSpaces}`,
        `User-perceived characters: ${stats.graphemes}`,
        `Unicode code points: ${stats.codePoints}`,
        `UTF-8 size: ${stats.bytesUtf8} bytes`,
        `Letters: ${stats.letters}`,
        `Digits: ${stats.digits}`,
        `Punctuation: ${stats.punctuation}`,
        `Symbols: ${stats.symbols}`,
        `Whitespace: ${stats.whitespace}`,
        `Lines: ${stats.lines}`,
      ].join("\n"),
    [stats],
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
          placeholder="Type or paste here to count characters, including emoji and accents."
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={summary} testid="copy-counts" label="Copy counts" />
          <DownloadButton text={summary} filename="character-count.txt" testid="download-counts" label="Download counts" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Character counts</PanelTitle>
        {text.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <HeroStat
              label="Characters (with spaces)"
              value={stats.characters.toLocaleString("en-US")}
              testid="res-characters"
              sub={`${stats.charactersNoSpaces.toLocaleString("en-US")} without spaces`}
            />
            <ResultBox>
              <ResultRow name="no-spaces" label="Without whitespace" value={stats.charactersNoSpaces.toLocaleString("en-US")} />
              <ResultRow name="graphemes" label="User-perceived characters" value={stats.graphemes.toLocaleString("en-US")} />
              <ResultRow name="codepoints" label="Unicode code points" value={stats.codePoints.toLocaleString("en-US")} />
              <ResultRow name="bytes" label="UTF-8 size" value={`${stats.bytesUtf8.toLocaleString("en-US")} bytes`} />
              <ResultRow name="letters" label="Letters" value={stats.letters.toLocaleString("en-US")} />
              <ResultRow name="digits" label="Digits" value={stats.digits.toLocaleString("en-US")} />
              <ResultRow name="punctuation" label="Punctuation" value={stats.punctuation.toLocaleString("en-US")} />
              <ResultRow name="symbols" label="Symbols (incl. emoji parts)" value={stats.symbols.toLocaleString("en-US")} />
              <ResultRow name="whitespace" label="Whitespace characters" value={stats.whitespace.toLocaleString("en-US")} />
              <ResultRow name="paragraphs" label="Paragraphs" value={stats.paragraphs.toLocaleString("en-US")} />
            </ResultBox>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              &ldquo;Characters&rdquo; is what a text field counts (UTF-16 code units, which is why an emoji uses
              two). &ldquo;User-perceived characters&rdquo; counts grapheme clusters, so a family emoji is one.
            </p>
          </>
        )}
      </Panel>

      {text.length > 0 && (
        <Panel>
          <PanelTitle>Fits in</PanelTitle>
          <ul className="space-y-3">
            {LIMITS.map((entry) => {
              const used = Math.round((stats.characters / entry.limit) * 100);
              const over = stats.characters > entry.limit;
              return (
                <li key={entry.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                    <span className="text-foreground">{entry.label}</span>
                    <span
                      data-testid={`res-fits-${entry.name}`}
                      className={`font-mono ${over ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {stats.characters.toLocaleString("en-US")} / {entry.limit.toLocaleString("en-US")}
                    </span>
                  </div>
                  <ProgressBar value={Math.min(100, used)} />
                  {over && (
                    <p className="mt-1 text-[11px] text-destructive">
                      {(stats.characters - entry.limit).toLocaleString("en-US")} characters over the limit.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </StackLayout>
  );
}
