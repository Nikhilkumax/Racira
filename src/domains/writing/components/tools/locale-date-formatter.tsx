"use client";

import { useEffect, useMemo, useState } from "react";
import {
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
import {
  LOCALES,
  currentTimeZone,
  dateParts,
  formatDate,
  supportedTimeZones,
} from "@/domains/writing/lib/text/intl.ts";

type Preset = "full" | "long" | "medium" | "short" | "none";
type DateStyle = "full" | "long" | "medium" | "short";

const DATE_STYLES: { value: DateStyle; label: string }[] = [
  { value: "full", label: "Full (Tuesday, 29 September 2026)" },
  { value: "long", label: "Long (29 September 2026)" },
  { value: "medium", label: "Medium (29 Sep 2026)" },
  { value: "short", label: "Short (29/09/2026)" },
];

const TIME_PRESETS: { value: Preset; label: string }[] = [
  { value: "short", label: "Short (13:45)" },
  { value: "medium", label: "Medium (13:45:00)" },
  { value: "long", label: "Long (13:45:00 UTC)" },
  { value: "full", label: "Full (13:45:00 UTC)" },
  { value: "none", label: "No time" },
];

const pad = (value: number) => String(value).padStart(2, "0");

/** Local wall-clock string for a `datetime-local` input. */
function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function LocaleDateFormatter() {
  const [value, setValue] = useState("");
  const [locale, setLocale] = useState("en-US");
  const [timeZone, setTimeZone] = useState("");
  const [dateStyle, setDateStyle] = useState<DateStyle>("medium");
  const [timePreset, setTimePreset] = useState<Preset>("short");

  // Default to "now" and the visitor's zone once mounted (SSR-safe).
  useEffect(() => {
    setValue(toLocalInputValue(new Date()));
    setTimeZone(currentTimeZone());
  }, []);

  const zones = useMemo(() => {
    const list = supportedTimeZones();
    return list.length > 0 ? list : ["UTC"];
  }, []);

  const date = useMemo(() => (value ? new Date(value) : new Date(Number.NaN)), [value]);

  const options = useMemo<Intl.DateTimeFormatOptions>(
    () => ({
      dateStyle,
      timeZone,
      ...(timePreset !== "none" ? { timeStyle: timePreset } : {}),
    }),
    [dateStyle, timePreset, timeZone],
  );

  const formatted = useMemo(() => formatDate(date, locale, options), [date, locale, options]);
  const parts = useMemo(() => dateParts(date, locale, options), [date, locale, options]);

  const offset = useMemo(() => {
    if (Number.isNaN(date.getTime()) || !timeZone) return null;
    return formatDate(date, "en-US", { timeZone, timeZoneName: "shortOffset", hour: "2-digit" });
  }, [date, timeZone]);

  const iso = useMemo(() => (Number.isNaN(date.getTime()) ? "—" : date.toISOString()), [date]);
  const utc = useMemo(
    () => formatDate(date, "en-US", { dateStyle: "full", timeStyle: "long", timeZone: "UTC" }),
    [date],
  );

  const copyText = formatted.ok
    ? [
        formatted.value,
        `ISO 8601: ${iso}`,
        `Locale: ${locale}`,
        `Time zone: ${timeZone}`,
        `UTC: ${utc.ok ? utc.value : "—"}`,
      ].join("\n")
    : "";

  return (
    <StackLayout>
      <Panel>
        <PanelTitle>Input</PanelTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextInput name="date" label="Date and local time" value={value} onChange={setValue} type="datetime-local" />
          <Select
            name="locale"
            label="Locale"
            value={locale}
            onChange={setLocale}
            options={LOCALES}
          />
          <Select
            name="timezone"
            label="Display time zone"
            value={timeZone || "UTC"}
            onChange={setTimeZone}
            options={zones.map((zone) => ({ value: zone, label: zone }))}
            hint={`${zones.length} zones`}
          />
          <Select
            name="datestyle"
            label="Date style"
            value={dateStyle}
            onChange={(next) => setDateStyle(next as DateStyle)}
            options={DATE_STYLES}
          />
          <Select
            name="timestyle"
            label="Time style"
            value={timePreset}
            onChange={(next) => setTimePreset(next as Preset)}
            options={TIME_PRESETS}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          The date you enter is your browser&rsquo;s local wall-clock time; the display zone converts it. Times are
          never invented — every row is produced by the platform&rsquo;s own <code>Intl.DateTimeFormat</code>.
        </p>
      </Panel>

      <Panel>
        <PanelTitle>Result</PanelTitle>
        {!formatted.ok ? (
          <Notice tone="error">{formatted.error}</Notice>
        ) : (
          <>
            <HeroStat label={`${locale} · ${timeZone}`} value={formatted.value} testid="res-formatted" sub={offset?.ok ? `UTC offset ${offset.value.slice(-6)}` : undefined} />
            <ResultBox>
              <ResultRow name="iso" label="ISO 8601 (UTC)" value={iso} />
              <ResultRow name="utc" label="Rendered in UTC" value={utc.ok ? utc.value : "—"} />
              {parts.ok && (
                <>
                  {parts.value
                    .filter((part) => part.type !== "literal")
                    .map((part) => (
                      <ResultRow key={`${part.type}-${part.value}`} label={part.type} value={part.value} />
                    ))}
                </>
              )}
            </ResultBox>
            <div className="mt-3">
              <CopyButton text={copyText} testid="copy-formatted" label="Copy formatted date" />
            </div>
          </>
        )}
      </Panel>
    </StackLayout>
  );
}
