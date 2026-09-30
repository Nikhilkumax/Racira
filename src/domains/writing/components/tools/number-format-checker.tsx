"use client";

import { useMemo, useState } from "react";
import {
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
  conventionSamples,
  detectNumberFormatIssues,
  normalizeNumbers,
  type TargetStyle,
} from "@/domains/writing/lib/text/number-format.ts";

const KIND_LABELS: Record<string, string> = {
  "mixed-decimal": "Mixed decimal separators",
  "mixed-grouping": "Mixed thousands separators",
  "ambiguous-separator": "Ambiguous number",
  "irregular-grouping": "Irregular grouping",
  "ungrouped-large-number": "Large number without grouping",
  "percent-spacing": "Percent spacing",
  "currency-placement": "Currency placement",
  "mixed-currency": "More than one currency",
  "unit-spacing": "Unit spacing",
  "range-dash": "Range dash",
};

export default function NumberFormatChecker() {
  const [raw, setRaw] = useState("");
  const [target, setTarget] = useState<TargetStyle>("us");
  const text = useDebouncedValue(raw, 250);

  const analysis = useMemo(() => detectNumberFormatIssues(text), [text]);
  const normalized = useMemo(() => (text.length === 0 ? "" : normalizeNumbers(text, target)), [text, target]);

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Your document</PanelTitle>
        <TextArea
          name="text"
          label="Paste text containing numbers"
          value={raw}
          onChange={setRaw}
          rows={9}
          placeholder={"Revenue was 1,234.56 in Q1 and 5.000 in Q2, up 50% on 41 % last year."}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="target"
            label="Rewrite numbers in"
            value={target}
            onChange={(next) => setTarget(next as TargetStyle)}
            options={conventionSamples().map((sample) => ({ value: sample.target, label: sample.label }))}
          />
          <div className="flex flex-wrap items-end gap-2 pb-1">
            <CopyButton text={normalized} testid="copy-normalized" label="Copy rewritten text" />
            <DownloadButton text={normalized} filename="numbers-normalized.txt" testid="download-normalized" label="Download" />
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Numbers the author wrote without separators and that are four digits or shorter (years, small counts) are
          left exactly as written.
        </p>
      </Panel>

      <Panel>
        <PanelTitle
          right={
            <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {analysis.numbers.length} number{analysis.numbers.length === 1 ? "" : "s"}
            </span>
          }
        >
          Consistency issues
        </PanelTitle>
        {text.trim().length === 0 ? (
          <EmptyState />
        ) : analysis.findings.length === 0 ? (
          <>
            <Notice tone="info">
              No inconsistencies found in the numbers, percent signs, currencies or units in this text.
            </Notice>
            <div className="mt-3">
              <ResultRow name="findings" label="Issues" value="0" />
            </div>
          </>
        ) : (
          <>
            <div className="mb-3">
              <ResultRow name="findings" label="Issues" value={String(analysis.findings.length)} />
            </div>
            <ul className="space-y-3" data-testid="findings">
              {analysis.findings.map((finding, index) => (
                <li key={`${finding.kind}-${index}`} className="rounded-lg border border-border bg-card/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      {KIND_LABELS[finding.kind] ?? finding.kind}
                    </span>
                    {finding.snippet && (
                      <code className="max-w-[55%] truncate rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {finding.snippet}
                      </code>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground">{finding.message}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The checker reads punctuation, not intent: it reports what is inconsistent or ambiguous and never
              silently rewrites the text below unless you copy the rewritten version.
            </p>
          </>
        )}
      </Panel>

      {analysis.numbers.length > 0 && (
        <Panel>
          <PanelTitle>Numbers interpreted</PanelTitle>
          <div className="max-h-72 overflow-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-left text-xs" data-testid="numbers-table">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="p-2">Raw</th>
                  <th className="p-2">Value</th>
                  <th className="p-2">Decimal</th>
                  <th className="p-2">Grouping</th>
                  <th className="p-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {analysis.numbers.slice(0, 60).map((number) => (
                  <tr key={`${number.index}-${number.raw}`}>
                    <td className="p-2 font-mono text-foreground">{number.raw}</td>
                    <td className="p-2 font-mono text-foreground">{number.value === null ? "—" : number.value}</td>
                    <td className="p-2 font-mono text-muted-foreground">{number.decimalSeparator ?? "—"}</td>
                    <td className="p-2 font-mono text-muted-foreground">{number.thousandsSeparator ?? "—"}</td>
                    <td className="p-2 text-muted-foreground">
                      {number.ambiguous ? "ambiguous" : number.irregularGrouping ? "irregular grouping" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {analysis.numbers.length > 60 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Showing the first 60 of {analysis.numbers.length} numbers.
            </p>
          )}
        </Panel>
      )}

      {text.trim().length > 0 && (
        <Panel>
          <PanelTitle>Rewritten in {conventionSamples().find((sample) => sample.target === target)?.label}</PanelTitle>
          <pre
            data-testid="res-normalized"
            className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground"
          >
            {normalized}
          </pre>
          <div className="mt-3">
            <ResultBox>
              <ResultRow name="changed" label="Differs from input" value={normalized === text ? "no" : "yes"} />
              <ResultRow name="numbers" label="Numbers rewritten" value={String(analysis.numbers.length)} />
            </ResultBox>
          </div>
        </Panel>
      )}
    </StackLayout>
  );
}
