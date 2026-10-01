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
  Select,
  StackLayout,
  Stat,
  StatGrid,
  TextArea,
  TextInput,
  useDebouncedValue,
} from "./ui";
import {
  DEFAULT_EXPANSION_LOCALE,
  EXPANSION_LOCALES,
  MIN_RELIABLE_CHARS,
  estimateExpansion,
  findExpansionLocale,
  formatExpansionReport,
} from "@/domains/writing/lib/text/text-expansion.ts";

/**
 * UI text expansion estimator.
 *
 * The arithmetic lives in `text-expansion.ts`: each target locale carries a
 * planning range, placeholders are excluded from the expanding base and added
 * back unchanged, and an optional character budget flags the lines whose high
 * estimate would overflow. The page is explicit that this is planning
 * arithmetic from published ranges — not a translation and not a prediction
 * for a specific translator.
 */
function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value}%`;
}

export default function TextExpansionEstimatorTool() {
  const [raw, setRaw] = useState("");
  const [localeId, setLocaleId] = useState(DEFAULT_EXPANSION_LOCALE);
  const [budgetRaw, setBudgetRaw] = useState("");

  const text = useDebouncedValue(raw, 250);
  const budgetDebounced = useDebouncedValue(budgetRaw, 250);

  const locale = findExpansionLocale(localeId) ?? findExpansionLocale(DEFAULT_EXPANSION_LOCALE)!;
  const budgetValue = Number.parseInt(budgetDebounced, 10);
  const budget = Number.isFinite(budgetValue) && budgetValue > 0 ? budgetValue : 0;

  const estimate = useMemo(() => estimateExpansion(text, locale, budget), [text, locale, budget]);
  const report = useMemo(() => formatExpansionReport(estimate), [estimate]);
  const hasText = estimate.lines.length > 0;

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Interface strings</PanelTitle>
        <TextArea
          name="text"
          label="One English string per line"
          value={raw}
          onChange={setRaw}
          rows={8}
          placeholder={"Settings\nSave document changes now\nDelete {name}"}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Select
            name="locale"
            label="Translate into"
            value={localeId}
            onChange={setLocaleId}
            options={EXPANSION_LOCALES.map((entry) => ({ value: entry.id, label: entry.label }))}
            hint={`x${locale.low.toFixed(2)}–x${locale.high.toFixed(2)}`}
          />
          <TextInput
            name="budget"
            label="Character budget per string"
            value={budgetRaw}
            onChange={setBudgetRaw}
            type="number"
            placeholder="18"
            hint="optional"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={report} testid="copy-report" label="Copy report" />
          <DownloadButton text={report} filename="text-expansion.txt" testid="download-report" label="Download" />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{locale.note}</p>
      </Panel>

      <Panel>
        <PanelTitle>Estimate</PanelTitle>
        {!hasText ? (
          <EmptyState>Type one or more interface strings above.</EmptyState>
        ) : (
          <>
            <HeroStat
              label={`English → ${locale.language}`}
              value={`${estimate.total.lowChars}–${estimate.total.highChars}`}
              testid="res-estimate"
              sub={`from ${estimate.total.characters} source characters · ${formatPercent(estimate.total.lowPercent)} to ${formatPercent(estimate.total.highPercent)}`}
            />
            <StatGrid>
              <Stat label="Low estimate" value={estimate.total.lowChars} testid="res-low-chars" />
              <Stat label="High estimate" value={estimate.total.highChars} testid="res-high-chars" />
              <Stat label="Change (low)" value={formatPercent(estimate.total.lowPercent)} testid="res-low-percent" />
              <Stat label="Change (high)" value={formatPercent(estimate.total.highPercent)} testid="res-high-percent" />
              <Stat
                label="Over budget"
                value={estimate.budget > 0 ? estimate.overflowLines : "—"}
                testid="res-overflow"
              />
              <Stat label="Short strings" value={estimate.tooShortLines} testid="res-too-short" />
            </StatGrid>
            {estimate.total.placeholders > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {estimate.total.placeholders} placeholder token
                {estimate.total.placeholders === 1 ? "" : "s"} detected ({`{name}`}, {`{{count}}`}, %s). They are
                excluded from the expanding base and kept unchanged in the estimate.
              </p>
            )}
            {estimate.overflowLines > 0 && (
              <div className="mt-3">
                <Notice tone="warn">
                  {estimate.overflowLines} line{estimate.overflowLines === 1 ? "" : "s"} may exceed the {estimate.budget}
                  -character budget at the high end of the range. Give the widest target room, or shorten the English
                  before translating.
                </Notice>
              </div>
            )}
            {estimate.tooShortLines > 0 && (
              <div className="mt-3">
                <Notice>
                  {estimate.tooShortLines} string{estimate.tooShortLines === 1 ? " is" : "s are"} shorter than{" "}
                  {MIN_RELIABLE_CHARS} characters. Short labels expand proportionally more than averages suggest — treat
                  those rows as a warning, not a measurement.
                </Notice>
              </div>
            )}
          </>
        )}
      </Panel>

      {hasText && (
        <Panel>
          <PanelTitle>Per-string detail</PanelTitle>
          <div className="overflow-x-auto">
            <table data-testid="res-lines" className="w-full min-w-[38rem] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-semibold">English</th>
                  <th className="py-2 pr-3 font-semibold">Chars</th>
                  <th className="py-2 pr-3 font-semibold">Estimate</th>
                  <th className="py-2 pr-3 font-semibold">Change</th>
                  <th className="py-2 font-semibold">Flags</th>
                </tr>
              </thead>
              <tbody>
                {estimate.lines.map((line, index) => (
                  <tr key={`${index}-${line.source}`} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 text-foreground">{line.source}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{line.characters}</td>
                    <td className="py-2 pr-3 font-mono text-foreground">
                      {line.lowChars}–{line.highChars}
                    </td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">
                      {formatPercent(line.lowPercent)} to {formatPercent(line.highPercent)}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {line.overflow ? "over budget" : ""}
                      {line.overflow && line.tooShort ? ", " : ""}
                      {line.tooShort ? "short string" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel>
        <PanelTitle>What this does and cannot do</PanelTitle>
        <div className="space-y-2">
          <Notice>
            Each locale carries a low and a high multiplier taken from common localization planning ranges — German
            x1.20–x1.35, Japanese x0.50–x0.70, and so on. The range is the point: actual length depends on the
            translator, terminology and tone, so the estimate is shown as a band, never as a single number.
          </Notice>
          <Notice tone="warn">
            This tool estimates length; it does not translate, and it has no dictionary of your product&apos;s terms.
            Contracting targets (CJK) and expanding ones (German, Finnish) are treated the same way — arithmetic on
            character counts.
          </Notice>
          <Notice tone="warn">
            Characters are counted as code points, so an emoji counts once. Lines are compared to the same English
            source, which is what this estimator assumes; if your source is not English, the multipliers no longer
            apply. Everything runs in the browser.
          </Notice>
        </div>
      </Panel>
    </StackLayout>
  );
}
