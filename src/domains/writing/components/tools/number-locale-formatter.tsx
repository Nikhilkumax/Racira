"use client";

import { useMemo, useState } from "react";
import {
  Checkbox,
  CopyButton,
  HeroStat,
  Notice,
  Panel,
  PanelTitle,
  ResultBox,
  ResultRow,
  Select,
  StackLayout,
  TextInput,
} from "./ui";
import { LOCALES, formatNumber, supportedCurrencies } from "@/domains/writing/lib/text/intl.ts";
import { parseNumberToken } from "@/domains/writing/lib/text/number-format.ts";

type Style = "decimal" | "percent" | "currency" | "unit";
type Notation = "standard" | "compact" | "engineering" | "scientific";

const STYLES: { value: Style; label: string }[] = [
  { value: "decimal", label: "Decimal" },
  { value: "percent", label: "Percent" },
  { value: "currency", label: "Currency" },
  { value: "unit", label: "Unit" },
];

const NOTATIONS: { value: Notation; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "compact", label: "Compact (1.2M)" },
  { value: "engineering", label: "Engineering (1.2E6)" },
  { value: "scientific", label: "Scientific (1.2E6)" },
];

const UNITS: { value: string; label: string }[] = [
  { value: "kilometer", label: "kilometer" },
  { value: "meter", label: "meter" },
  { value: "centimeter", label: "centimeter" },
  { value: "mile", label: "mile" },
  { value: "kilogram", label: "kilogram" },
  { value: "gram", label: "gram" },
  { value: "pound", label: "pound" },
  { value: "liter", label: "liter" },
  { value: "celsius", label: "celsius" },
  { value: "fahrenheit", label: "fahrenheit" },
  { value: "byte", label: "byte" },
  { value: "megabyte", label: "megabyte" },
  { value: "hour", label: "hour" },
  { value: "minute", label: "minute" },
];

/** Common currencies keep the list usable; the full ISO list stays available. */
const COMMON_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "CHF", "CNY", "BRL"];

const COMPARISON_LOCALES = ["en-US", "de-DE", "fr-FR", "hi-IN", "ar-EG"];

export default function NumberLocaleFormatter() {
  const [raw, setRaw] = useState("1234567.89");
  const [locale, setLocale] = useState("en-US");
  const [style, setStyle] = useState<Style>("decimal");
  const [currency, setCurrency] = useState("USD");
  const [unit, setUnit] = useState("kilometer");
  const [notation, setNotation] = useState<Notation>("standard");
  const [minFraction, setMinFraction] = useState("");
  const [maxFraction, setMaxFraction] = useState("");
  const [grouping, setGrouping] = useState(true);

  const parsed = useMemo(() => parseNumberToken(raw.trim()), [raw]);
  const hasInput = raw.trim().length > 0;

  const options = useMemo<Intl.NumberFormatOptions>(() => {
    const base: Intl.NumberFormatOptions = {
      notation,
      useGrouping: grouping,
    };
    if (style === "currency") {
      base.style = "currency";
      base.currency = currency;
    } else if (style === "percent") {
      base.style = "percent";
    } else if (style === "unit") {
      base.style = "unit";
      base.unit = unit;
    }
    if (minFraction !== "" && Number.isFinite(Number(minFraction))) base.minimumFractionDigits = Math.max(0, Number(minFraction));
    if (maxFraction !== "" && Number.isFinite(Number(maxFraction))) base.maximumFractionDigits = Math.max(0, Number(maxFraction));
    return base;
  }, [style, currency, unit, notation, minFraction, maxFraction, grouping]);

  const formatted = useMemo(
    () => (parsed.value === null ? { ok: false as const, error: "Enter a number." } : formatNumber(parsed.value, locale, options)),
    [parsed, locale, options],
  );

  const allCurrencies = useMemo(() => {
    const list = supportedCurrencies();
    const rest = list.filter((code) => !COMMON_CURRENCIES.includes(code));
    return [...COMMON_CURRENCIES.filter((code) => list.length === 0 || list.includes(code)), ...rest];
  }, []);

  const parts = useMemo(() => {
    if (parsed.value === null) return null;
    try {
      return new Intl.NumberFormat(locale, options).formatToParts(parsed.value);
    } catch {
      return null;
    }
  }, [parsed, locale, options]);

  const comparison = useMemo(
    () =>
      COMPARISON_LOCALES.map((comparisonLocale) => ({
        locale: comparisonLocale,
        result: parsed.value === null ? null : formatNumber(parsed.value, comparisonLocale, options),
      })),
    [parsed, options],
  );

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput
            name="number"
            label="Number"
            value={raw}
            onChange={setRaw}
            hint="plain digits, e.g. 1234567.89"
            placeholder="1234567.89"
          />
          <Select name="locale" label="Locale" value={locale} onChange={setLocale} options={LOCALES} />
          <Select name="style" label="Style" value={style} onChange={(next) => setStyle(next as Style)} options={STYLES} />
          {style === "currency" && (
            <Select
              name="currency"
              label="Currency"
              value={currency}
              onChange={setCurrency}
              options={allCurrencies.map((code) => ({ value: code, label: code }))}
              hint={allCurrencies.length > 0 ? `${allCurrencies.length} codes` : undefined}
            />
          )}
          {style === "unit" && (
            <Select name="unit" label="Unit" value={unit} onChange={setUnit} options={UNITS} />
          )}
          <Select
            name="notation"
            label="Notation"
            value={notation}
            onChange={(next) => setNotation(next as Notation)}
            options={NOTATIONS}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              name="min-fraction"
              label="Min fraction digits"
              value={minFraction}
              onChange={setMinFraction}
              type="number"
              placeholder="auto"
            />
            <TextInput
              name="max-fraction"
              label="Max fraction digits"
              value={maxFraction}
              onChange={setMaxFraction}
              type="number"
              placeholder="auto"
            />
          </div>
          <div className="flex items-end pb-2">
            <Checkbox name="grouping" label="Use grouping separators" checked={grouping} onChange={setGrouping} />
          </div>
        </div>
        {hasInput && parsed.value === null && (
          <div className="mt-3">
            <Notice tone="error">Could not read a number from that input. Enter digits, e.g. 1234567.89.</Notice>
          </div>
        )}
        {hasInput && parsed.value !== null && parsed.ambiguous && (
          <div className="mt-3">
            <Notice tone="warn">
              &ldquo;{raw.trim()}&rdquo; is ambiguous. It has been read as {parsed.value.toLocaleString("en-US")} (a
              grouping separator), which is the same reading the Number Format Checker reports.
            </Notice>
          </div>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Formatted output</PanelTitle>
        {!formatted.ok ? (
          <Notice tone="error">{formatted.error}</Notice>
        ) : (
          <>
            <HeroStat label={`${locale} · ${style}`} value={formatted.value} testid="res-formatted" />
            <div className="mt-3">
              <CopyButton text={formatted.value} testid="copy-formatted" label="Copy result" />
            </div>
            {parts && (
              <div className="mt-4">
                <ResultBox>
                  {parts
                    .filter((part) => part.type !== "literal")
                    .map((part) => (
                      <ResultRow key={`${part.type}-${part.value}`} label={part.type} value={part.value} />
                    ))}
                </ResultBox>
              </div>
            )}
          </>
        )}
      </Panel>

      <Panel>
        <PanelTitle>Same number in other locales</PanelTitle>
        <ResultBox>
          {comparison.map((entry) => (
            <ResultRow
              key={entry.locale}
              name={`compare-${entry.locale}`}
              label={entry.locale}
              value={entry.result?.ok ? entry.result.value : "—"}
            />
          ))}
        </ResultBox>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Every value above comes from the platform&rsquo;s <code>Intl.NumberFormat</code>, so it matches what that
          locale actually renders — including narrower spaces and non-Latin digits where the locale uses them.
        </p>
      </Panel>
    </StackLayout>
  );
}
