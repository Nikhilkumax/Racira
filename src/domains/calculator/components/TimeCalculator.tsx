"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type TimeOp = "add" | "sub";

interface TimeInputs {
  days1: number;
  hours1: number;
  minutes1: number;
  seconds1: number;
  days2: number;
  hours2: number;
  minutes2: number;
  seconds2: number;
  op: TimeOp;
  clockHour: number;
  clockMinute: number;
}

const DEFAULTS: TimeInputs = {
  days1: 0,
  hours1: 5,
  minutes1: 30,
  seconds1: 0,
  days2: 0,
  hours2: 2,
  minutes2: 45,
  seconds2: 0,
  op: "add",
  clockHour: 9,
  clockMinute: 0,
};

interface FormatRow {
  label: string;
  value: string;
}

interface TimeResult {
  valid: boolean;
  errorMsg: string;
  seconds1: number;
  seconds2: number;
  totalSeconds: number;
  negative: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hhmmss: string;
  clockTime: string;
  clockDayOffset: number;
  decimalHours: number;
  decimalMinutes: number;
  formats: FormatRow[];
}

const pad = (v: number) => String(v).padStart(2, "0");

function computeTime(input: TimeInputs): TimeResult {
  const {
    days1,
    hours1,
    minutes1,
    seconds1,
    days2,
    hours2,
    minutes2,
    seconds2,
    op,
    clockHour,
    clockMinute,
  } = input;

  const blank: TimeResult = {
    valid: false,
    errorMsg: "",
    seconds1: 0,
    seconds2: 0,
    totalSeconds: 0,
    negative: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hhmmss: "",
    clockTime: "",
    clockDayOffset: 0,
    decimalHours: 0,
    decimalMinutes: 0,
    formats: [],
  };

  const parts = [days1, hours1, minutes1, seconds1, days2, hours2, minutes2, seconds2];
  if (parts.some((p) => !Number.isFinite(p))) {
    return { ...blank, errorMsg: "Enter a number in each duration field, using 0 where there is none." };
  }
  if (parts.some((p) => p < 0)) {
    return { ...blank, errorMsg: "Durations must be positive. Use the subtract option to take one away from the other." };
  }

  const s1 = days1 * 86400 + hours1 * 3600 + minutes1 * 60 + seconds1;
  const s2 = days2 * 86400 + hours2 * 3600 + minutes2 * 60 + seconds2;
  const raw = op === "add" ? s1 + s2 : s1 - s2;
  const negative = raw < 0;
  const abs = Math.abs(raw);

  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  const hhmmss = `${negative ? "−" : ""}${days > 0 ? `${days}d ` : ""}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const clockSeconds = clockHour * 3600 + clockMinute * 60 + raw;
  const wrap = Math.floor(clockSeconds / 86400);
  const inDay = ((clockSeconds % 86400) + 86400) % 86400;
  const clockTime = `${pad(Math.floor(inDay / 3600))}:${pad(Math.floor((inDay % 3600) / 60))}:${pad(inDay % 60)}`;

  const formats: FormatRow[] = [
    { label: "Days, hours, minutes, seconds", value: `${days} d ${hours} h ${minutes} m ${seconds} s` },
    { label: "Clock-style duration", value: hhmmss },
    { label: "Total hours", value: (abs / 3600).toFixed(4) },
    { label: "Total minutes", value: (abs / 60).toFixed(4) },
    { label: "Total seconds", value: String(abs) },
    { label: "Total weeks", value: (abs / 604800).toFixed(6) },
    { label: "Working days at 8 hours", value: (abs / 28800).toFixed(4) },
  ];

  return {
    valid: true,
    errorMsg: "",
    seconds1: s1,
    seconds2: s2,
    totalSeconds: raw,
    negative,
    days,
    hours,
    minutes,
    seconds,
    hhmmss,
    clockTime,
    clockDayOffset: wrap,
    decimalHours: Number((raw / 3600).toFixed(6)),
    decimalMinutes: Number((raw / 60).toFixed(6)),
    formats,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function TimeCalculator() {
  const [days1, setDays1] = useState(String(DEFAULTS.days1));
  const [hours1, setHours1] = useState(String(DEFAULTS.hours1));
  const [minutes1, setMinutes1] = useState(String(DEFAULTS.minutes1));
  const [seconds1, setSeconds1] = useState(String(DEFAULTS.seconds1));
  const [days2, setDays2] = useState(String(DEFAULTS.days2));
  const [hours2, setHours2] = useState(String(DEFAULTS.hours2));
  const [minutes2, setMinutes2] = useState(String(DEFAULTS.minutes2));
  const [seconds2, setSeconds2] = useState(String(DEFAULTS.seconds2));
  const [op, setOp] = useState<TimeOp>(DEFAULTS.op);
  const [clockHour, setClockHour] = useState(String(DEFAULTS.clockHour));
  const [clockMinute, setClockMinute] = useState(String(DEFAULTS.clockMinute));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TimeInputs => ({
    days1: parseFloat(days1) || 0,
    hours1: parseFloat(hours1) || 0,
    minutes1: parseFloat(minutes1) || 0,
    seconds1: parseFloat(seconds1) || 0,
    days2: parseFloat(days2) || 0,
    hours2: parseFloat(hours2) || 0,
    minutes2: parseFloat(minutes2) || 0,
    seconds2: parseFloat(seconds2) || 0,
    op,
    clockHour: parseFloat(clockHour) || 0,
    clockMinute: parseFloat(clockMinute) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<TimeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TimeResult>(() => computeTime(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeTime(inputs));
  };

  const reset = () => {
    setDays1(String(DEFAULTS.days1));
    setHours1(String(DEFAULTS.hours1));
    setMinutes1(String(DEFAULTS.minutes1));
    setSeconds1(String(DEFAULTS.seconds1));
    setDays2(String(DEFAULTS.days2));
    setHours2(String(DEFAULTS.hours2));
    setMinutes2(String(DEFAULTS.minutes2));
    setSeconds2(String(DEFAULTS.seconds2));
    setOp(DEFAULTS.op);
    setClockHour(String(DEFAULTS.clockHour));
    setClockMinute(String(DEFAULTS.clockMinute));
    setCalcInputs(DEFAULTS);
    setResults(computeTime(DEFAULTS));
  };

  const faqs = [
    {
      question: "How do I add two durations together?",
      answer:
        "Convert both durations to seconds, add the totals, then break the result back into days, hours, minutes and seconds. Working in a single unit avoids the carrying mistakes that happen when you add hours and minutes separately, and the calculator shows each intermediate total so the conversion can be checked.",
    },
    {
      question: "How do I subtract one time from another?",
      answer:
        "Switch the operation to subtract and enter the duration being taken away in the second row. If the result is negative the calculator marks it with a minus sign and still reports the magnitude, which usually means the durations were entered the wrong way around rather than that a negative time exists.",
    },
    {
      question: "Why does 5 hours 30 minutes plus 2 hours 45 minutes equal 8 hours 15 minutes?",
      answer:
        "Seventy-five minutes carries one hour into the hours column, leaving fifteen minutes behind. That carrying is the reason time arithmetic cannot be treated like decimal arithmetic: there are sixty minutes in an hour and sixty seconds in a minute, so sums wrap at sixty rather than at one hundred.",
    },
    {
      question: "How do I work out what time it will be later?",
      answer:
        "Enter a start time in the advanced options and the calculator adds the duration to it, wrapping past midnight when necessary. Five hours thirty minutes after nine in the morning is 14:30, and adding ten hours to that start would land at 19:00 the same day. The display uses a twenty-four hour clock.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Time Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="First Duration">
              <div className="grid grid-cols-4 gap-2">
                <CompactInput id="days-1" label="Days" value={days1} onChange={setDays1} onEnter={runCalculate} min="0" />
                <CompactInput id="hours-1" label="Hours" value={hours1} onChange={setHours1} onEnter={runCalculate} min="0" />
                <CompactInput id="minutes-1" label="Mins" value={minutes1} onChange={setMinutes1} onEnter={runCalculate} min="0" />
                <CompactInput id="seconds-1" label="Secs" value={seconds1} onChange={setSeconds1} onEnter={runCalculate} min="0" />
              </div>
            </SubSection>

            <SubSection title="Operation">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOp("add")}
                  aria-pressed={op === "add"}
                  className={
                    op === "add"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Add (+)
                </button>
                <button
                  type="button"
                  onClick={() => setOp("sub")}
                  aria-pressed={op === "sub"}
                  className={
                    op === "sub"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Subtract (−)
                </button>
              </div>
            </SubSection>

            <SubSection title="Second Duration">
              <div className="grid grid-cols-4 gap-2">
                <CompactInput id="days-2" label="Days" value={days2} onChange={setDays2} onEnter={runCalculate} min="0" />
                <CompactInput id="hours-2" label="Hours" value={hours2} onChange={setHours2} onEnter={runCalculate} min="0" />
                <CompactInput id="minutes-2" label="Mins" value={minutes2} onChange={setMinutes2} onEnter={runCalculate} min="0" />
                <CompactInput id="seconds-2" label="Secs" value={seconds2} onChange={setSeconds2} onEnter={runCalculate} min="0" />
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Clock Time">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="clock-hour"
                        label="Start Hour"
                        value={clockHour}
                        onChange={setClockHour}
                        onEnter={runCalculate}
                        min="0"
                        suffix="h"
                        hint="0 to 23 on a 24-hour clock."
                        tooltip="Time of day the duration starts from."
                      />
                      <CompactInput
                        id="clock-minute"
                        label="Start Minute"
                        value={clockMinute}
                        onChange={setClockMinute}
                        onEnter={runCalculate}
                        min="0"
                        suffix="m"
                        tooltip="Minutes past the start hour."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Resulting Duration</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? results.hhmmss : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.days} days, ${results.hours} hours, ${results.minutes} minutes and ${results.seconds} seconds`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Hours</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? results.decimalHours.toFixed(4) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Minutes</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? results.decimalMinutes.toFixed(2) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Clock Time</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.clockTime : "—"}</span>
              </div>
            </div>

            {/* FORMAT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Format</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.formats.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Start time plus duration</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {results.valid
                        ? `${pad(calcInputs.clockHour)}:${pad(calcInputs.clockMinute)} → ${results.clockTime}`
                        : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* COMPONENT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right">First</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Second</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Days</td>
                    <td className="p-2.5 text-right text-foreground">{calcInputs.days1}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{calcInputs.days2}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Hours</td>
                    <td className="p-2.5 text-right text-foreground">{calcInputs.hours1}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{calcInputs.hours2}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Minutes</td>
                    <td className="p-2.5 text-right text-foreground">{calcInputs.minutes1}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{calcInputs.minutes2}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Seconds</td>
                    <td className="p-2.5 text-right text-foreground">{calcInputs.seconds1}</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{calcInputs.seconds2}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Equivalent seconds</td>
                    <td className="p-2.5 text-right text-foreground">{results.seconds1.toLocaleString()}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{results.seconds2.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Operation</span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.op === "add" ? "Adding both durations" : "Subtracting the second duration"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Result Sign</span>
                  <span className="text-base font-bold text-foreground">
                    {results.negative ? "Negative" : "Positive"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Days</span>
                  <span className="text-base font-bold text-foreground">{results.days}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Hours Left Over</span>
                  <span className="text-base font-bold text-foreground">{results.hours}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Clock Day Offset</span>
                  <span className="text-base font-bold text-foreground">
                    {results.clockDayOffset === 0 ? "Same day" : `${results.clockDayOffset} day(s)`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Seconds</span>
                  <span className="text-base font-bold text-foreground">{results.totalSeconds.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Time Calculator?</h2>
            <p>
              A time calculator adds or subtracts durations expressed in days, hours, minutes and seconds. Give it two
              durations and it returns the combined or remaining time in several formats at once: a clock-style figure, the
              total hours, the total minutes, the total seconds and the equivalent number of eight-hour working days.
            </p>
            <p>
              Durations are not decimal numbers, which is exactly why they cause so many mistakes. Sixty minutes make an
              hour, not one hundred, so adding two times by treating the minute columns like ordinary arithmetic produces
              answers that are wrong by precisely the amount that should have been carried. Converting everything to seconds
              first removes that class of error entirely.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each duration is converted into seconds using the standard multipliers: eighty-six thousand four hundred
              seconds in a day, three thousand six hundred in an hour and sixty in a minute. The two totals are then added or
              subtracted as plain numbers, which is safe because seconds are a single consistent unit with no carrying
              involved at any stage.
            </p>
            <p>
              The result is converted back by dividing out complete days, then hours, then minutes, keeping the remainder at
              each step. That yields the familiar day, hour, minute and second breakdown alongside the clock-style string. If
              a start time is supplied in the advanced panel, the duration is added to it and the total wraps past midnight, so
              an overnight shift shows the following day rather than a number beyond twenty-four.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the duration in clock style, with total hours, total minutes and the resulting clock time
              in the three-stat bar. The first table presents the result in every useful format, from a full day-hour-minute-
              second breakdown through to working days at eight hours, and it also shows the start time converted into an
              arrival time.
            </p>
            <p>
              The second table breaks both input durations into their components and converts each one into seconds, which is
              the quickest way to spot a field entered in the wrong unit. A duration typed as two hundred minutes shows as
              twelve thousand seconds, and the clock-style output immediately reveals that it is really three hours and twenty
              minutes.
            </p>
            <p>
              Watch the sign on subtraction. A negative result means the second duration was larger than the first, which
              usually signals the inputs were entered the wrong way round rather than a genuine negative interval. The summary
              panel flags the sign explicitly so the comparison does not have to be repeated by hand.
            </p>
            <p>
              Finally, keep the conversion factors in mind when moving between systems. Timesheets usually want decimal hours,
              where thirty minutes is 0.5 rather than 0.30, and billing systems often want decimal minutes. The format table
              provides both, so the same duration can be reported correctly whatever the receiving system expects. Keeping a
              running total of several shifts is the same exercise repeated: add each duration in turn, or convert them all to
              seconds first and divide once at the end, and the answer will agree either way.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-calculator" />
          <PopularCalculators exclude="/calculator/time-calculator" />
        </div>
      </div>
    </>
  );
}
