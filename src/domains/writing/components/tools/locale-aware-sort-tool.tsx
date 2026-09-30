"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  DownloadButton,
  EmptyState,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextArea,
  useDebouncedValue,
} from "./ui";
import {
  LOCALES,
  localeKey,
  sortByCodePoint,
  sortLines,
} from "@/domains/writing/lib/text/intl.ts";

type Sensitivity = "base" | "accent" | "case" | "variant";

export default function LocaleAwareSortTool() {
  const [raw, setRaw] = useState("");
  const [locale, setLocale] = useState("en-US");
  const [numeric, setNumeric] = useState(false);
  const [sensitivity, setSensitivity] = useState<Sensitivity>("variant");
  const [ignorePunctuation, setIgnorePunctuation] = useState(false);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [descending, setDescending] = useState(false);
  const text = useDebouncedValue(raw, 250);

  const source = useMemo(() => {
    const all = text.replace(/\r\n?/g, "\n").split("\n");
    const nonEmpty = all.filter((line) => line.trim().length > 0);
    return { lines: nonEmpty, dropped: all.length - nonEmpty.length };
  }, [text]);

  const sorted = useMemo(
    () => sortLines(source.lines, { locale, numeric, sensitivity, ignorePunctuation }),
    [source.lines, locale, numeric, sensitivity, ignorePunctuation],
  );

  const output = useMemo(() => {
    if (!sorted.ok) return { lines: [] as string[], duplicates: [] as string[] };
    let lines = sorted.value;
    const duplicates: string[] = [];
    if (removeDuplicates) {
      const seen = new Set<string>();
      const kept: string[] = [];
      for (const line of lines) {
        const key = localeKey(line, locale);
        if (seen.has(key)) {
          duplicates.push(line);
          continue;
        }
        seen.add(key);
        kept.push(line);
      }
      lines = kept;
    } else {
      const seen = new Map<string, number>();
      for (const line of lines) {
        const key = localeKey(line, locale);
        seen.set(key, (seen.get(key) ?? 0) + 1);
      }
      for (const [key, count] of seen) {
        if (count > 1) duplicates.push(key);
      }
    }
    return { lines: descending ? [...lines].reverse() : lines, duplicates };
  }, [sorted, removeDuplicates, descending, locale]);

  const codePointOrder = useMemo(() => sortByCodePoint(source.lines).join("\n"), [source.lines]);
  const outputText = output.lines.join("\n");

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Lines to sort</PanelTitle>
        <TextArea
          name="lines"
          label="One item per line"
          value={raw}
          onChange={setRaw}
          rows={10}
          placeholder={"Zebra\nÄrger\napfel\nitem10\nitem2"}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select name="locale" label="Sort locale" value={locale} onChange={setLocale} options={LOCALES} />
          <Select
            name="sensitivity"
            label="Case / accent sensitivity"
            value={sensitivity}
            onChange={(next) => setSensitivity(next as Sensitivity)}
            options={[
              { value: "variant", label: "Variant (distinguish case and accents)" },
              { value: "case", label: "Case (ignore accents)" },
              { value: "accent", label: "Accent (ignore case)" },
              { value: "base", label: "Base (ignore case and accents)" },
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <Checkbox name="numeric" label="Natural numbers (item2 before item10)" checked={numeric} onChange={setNumeric} />
          <Checkbox name="ignore-punctuation" label="Ignore punctuation" checked={ignorePunctuation} onChange={setIgnorePunctuation} />
          <Checkbox name="dedupe" label="Remove duplicates" checked={removeDuplicates} onChange={setRemoveDuplicates} />
          <Checkbox name="descending" label="Z → A" checked={descending} onChange={setDescending} />
        </div>
        {source.dropped > 0 && (
          <div className="mt-3">
            <Notice>{source.dropped} blank line{source.dropped === 1 ? "" : "s"} ignored.</Notice>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Sorted</PanelTitle>
        {source.lines.length === 0 ? (
          <EmptyState />
        ) : !sorted.ok ? (
          <Notice tone="error">{sorted.error}</Notice>
        ) : (
          <>
            <pre
              data-testid="res-sorted"
              className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
            >
              {outputText}
            </pre>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <CopyButton text={outputText} testid="copy-sorted" label="Copy sorted list" />
              <DownloadButton text={outputText} filename="sorted.txt" testid="download-sorted" label="Download" />
            </div>
            <div className="mt-4">
              <ResultBox>
                <ResultRow name="count" label="Lines in the output" value={String(output.lines.length)} />
                <ResultRow name="duplicates" label="Duplicate groups" value={String(output.duplicates.length)} />
                <ResultRow name="locale" label="Collator locale" value={locale} />
              </ResultBox>
            </div>
            {output.duplicates.length > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Duplicates (ignoring case and accents): {output.duplicates.slice(0, 12).join(", ")}
                {output.duplicates.length > 12 ? ` … +${output.duplicates.length - 12} more` : ""}
              </p>
            )}
          </>
        )}
      </Panel>

      {source.lines.length > 1 && (
        <Panel>
          <PanelTitle>Why locale matters</PanelTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Collator ({locale})
              </div>
              <pre data-testid="res-collator" className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {outputText}
              </pre>
            </div>
            <div className="rounded-lg border border-border bg-card/40 p-3">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Raw code point order
              </div>
              <pre data-testid="res-codepoint" className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                {codePointOrder}
              </pre>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Code-point order puts every uppercase and accented letter after the basic Latin alphabet; a collator
            sorts the way readers of that locale expect.
          </p>
        </Panel>
      )}
    </StackLayout>
  );
}
