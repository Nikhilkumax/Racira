"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface HoursInputs {
  start: string;
  end: string;
  breakMin: number;
  hourlyRate: number;
  regularThresholdH: number;
  otMultiplier: number;
  roundingMin: number;
  decimals: number;
}

const DEFAULTS: HoursInputs = {
  start: "09:00",
  end: "17:30",
  breakMin: 30,
  hourlyRate: 25,
  regularThresholdH: 8,
  otMultiplier: 1.5,
  roundingMin: 0,
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number, d = 2) => (Number.isFinite(v) ? "$" + fmt(v, d) : "—");

const fmtHm = (mins: number) => {
  const m = Math.max(0, Math.round(mins));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

const ROUNDING_OPTIONS = [
  { value: "0", label: "No rounding" },
  { value: "5", label: "Nearest 5 minutes" },
  { value: "15", label: "Nearest 15 minutes" },
];

const DECIMAL_OPTIONS = [
  { value: "1", label: "1 decimal" },
  { value: "2", label: "2 decimals" },
];

const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

interface HoursResult {
  valid: boolean;
  errorMsg: string;
  spanMin: number;
  breakApplied: number;
  workedMin: number;
  workedH: number;
  regularH: number;
  otH: number;
  crossesMidnight: boolean;
  regularPay: number;
  otPay: number;
  totalPay: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateHours(i: HoursInputs): HoursResult {
  const blank = (errorMsg: string): HoursResult => ({
    valid: false,
    errorMsg,
    spanMin: 0,
    breakApplied: 0,
    workedMin: 0,
    workedH: 0,
    regularH: 0,
    otH: 0,
    crossesMidnight: false,
    regularPay: 0,
    otPay: 0,
    totalPay: 0,
    breakdown: [],
  });

  if (!TIME_RE.test(i.start) || !TIME_RE.test(i.end)) return blank("Enter both times as HH:MM in 24-hour form, e.g. 09:00 and 17:30.");
  const nums = [i.breakMin, i.hourlyRate, i.regularThresholdH, i.otMultiplier, i.roundingMin, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every numeric field.");
  if (i.breakMin < 0 || i.breakMin > 480) return blank("Unpaid break should be between 0 and 480 minutes.");
  if (i.hourlyRate < 0 || i.hourlyRate > 10000) return blank("Hourly rate should be between $0 and $10,000.");
  if (i.regularThresholdH < 1 || i.regularThresholdH > 16) return blank("The regular-hours threshold should be between 1 and 16 hours.");
  if (i.otMultiplier < 1 || i.otMultiplier > 3) return blank("The overtime multiplier should be between 1.0 and 3.0.");

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map((x) => parseInt(x, 10));
    return h * 60 + m;
  };
  const startMin = toMin(i.start);
  const endMin = toMin(i.end);
  const crossesMidnight = endMin <= startMin;
  const spanMin = crossesMidnight ? 1440 - startMin + endMin : endMin - startMin;

  let workedMin = Math.max(0, spanMin - i.breakMin);
  if (i.roundingMin > 0) {
    workedMin = Math.round(workedMin / i.roundingMin) * i.roundingMin;
  }
  const breakApplied = Math.min(i.breakMin, spanMin);
  const workedH = workedMin / 60;
  const thresholdMin = i.regularThresholdH * 60;
  const regularMin = Math.min(workedMin, thresholdMin);
  const otMin = Math.max(0, workedMin - thresholdMin);
  const regularH = regularMin / 60;
  const otH = otMin / 60;
  const regularPay = regularH * i.hourlyRate;
  const otPay = otH * i.hourlyRate * i.otMultiplier;
  const totalPay = regularPay + otPay;

  const breakdown = [
    { label: "Start time", value: i.start },
    { label: "End time", value: i.end },
    { label: "Shift crosses midnight", value: crossesMidnight ? "Yes" : "No" },
    { label: "Gross span on the clock", value: `${fmtHm(spanMin)} (${fmt(spanMin / 60, 2)} h)` },
    { label: "Unpaid break deducted", value: `−${fmt(breakApplied, 0)} min` },
    { label: "Net hours worked", value: `${fmtHm(workedMin)} · ${fmt(workedH, 2)} h`, highlight: true },
    { label: `Regular hours (first ${fmt(i.regularThresholdH, i.regularThresholdH === Math.round(i.regularThresholdH) ? 0 : 1)} h)`, value: fmt(regularH, 2) },
    { label: `Overtime hours beyond ${fmt(i.regularThresholdH, i.regularThresholdH === Math.round(i.regularThresholdH) ? 0 : 1)} h`, value: fmt(otH, 2) },
    { label: `Hourly rate`, value: money(i.hourlyRate) },
    { label: "Regular pay", value: money(regularPay) },
    { label: `Overtime pay at ${fmt(i.otMultiplier, 1)}×`, value: money(otPay) },
    { label: "Total pay for the shift", value: money(totalPay), highlight: true },
  ];

  return {
    valid: true,
    errorMsg: "",
    spanMin,
    breakApplied,
    workedMin,
    workedH,
    regularH,
    otH,
    crossesMidnight,
    regularPay,
    otPay,
    totalPay,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  prefix?: string;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  prefix,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function HoursCalculator() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [breakMin, setBreakMin] = useState(String(DEFAULTS.breakMin));
  const [hourlyRate, setHourlyRate] = useState(String(DEFAULTS.hourlyRate));
  const [regularThresholdH, setRegularThresholdH] = useState(String(DEFAULTS.regularThresholdH));
  const [otMultiplier, setOtMultiplier] = useState(String(DEFAULTS.otMultiplier));
  const [roundingMin, setRoundingMin] = useState(String(DEFAULTS.roundingMin));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HoursInputs => ({
    start,
    end,
    breakMin: parseFloat(breakMin) || 0,
    hourlyRate: parseFloat(hourlyRate) || 0,
    regularThresholdH: parseFloat(regularThresholdH) || 0,
    otMultiplier: parseFloat(otMultiplier) || 0,
    roundingMin: parseFloat(roundingMin) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<HoursInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HoursResult>(() => calculateHours(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateHours(inputs));
  };

  const reset = () => {
    setStart(DEFAULTS.start);
    setEnd(DEFAULTS.end);
    setBreakMin(String(DEFAULTS.breakMin));
    setHourlyRate(String(DEFAULTS.hourlyRate));
    setRegularThresholdH(String(DEFAULTS.regularThresholdH));
    setOtMultiplier(String(DEFAULTS.otMultiplier));
    setRoundingMin(String(DEFAULTS.roundingMin));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateHours(DEFAULTS));
  };

  const startOk = TIME_RE.test(start);
  const endOk = TIME_RE.test(end);

  const errors = {
    start: startOk ? "" : "Use HH:MM, e.g. 09:00",
    end: endOk ? "" : "Use HH:MM, e.g. 17:30",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const d = Math.max(0, Math.min(2, calcInputs.decimals || 0));

  const faqs = [
    {
      question: "How does the calculator handle shifts that cross midnight?",
      answer:
        "When the end time is earlier than or equal to the start time, the shift is treated as running past midnight — a 22:00 to 06:00 entry resolves to 8 hours, not negative time. This matches how night-shift and on-call spans are actually worked, and the breakdown table flags the crossing explicitly so payroll review can see the assumption rather than guess at it.",
    },
    {
      question: "Should I enter times in 24-hour or AM/PM form?",
      answer:
        "The calculator uses 24-hour form (HH:MM) because it removes the AM/PM ambiguity that causes most timesheet errors: 07:30 is 7:30 am and 19:30 is 7:30 pm. If you think in AM/PM, add 12 to afternoon and evening hours — 1:30 pm becomes 13:30. The validation rejects anything that is not a real clock time, so a typo like 25:00 or 9:7 fails loudly instead of silently corrupting the totals.",
    },
    {
      question: "Why does payroll want decimal hours instead of hours and minutes?",
      answer:
        "Payroll systems multiply an hourly rate by hours as a single decimal number, so 8 hours 30 minutes must become 8.5 — dividing minutes by 60. Reporting 8.30 for 8h 30m is the classic timesheet mistake, and it shortchanges the worker by a fraction of an hour every shift. The calculator shows both forms side by side precisely so the conversion is visible: use hours-and-minutes to read the shift, decimal hours to enter it into payroll.",
    },
    {
      question: "How does the overtime split work?",
      answer:
        "Hours up to the threshold (8 by default, adjustable) pay at the base rate and hours beyond it pay at the multiplier (1.5 by default). This mirrors a daily-overtime arrangement; many jurisdictions instead use weekly thresholds such as 40 hours, in which case run each day separately and sum the regular and overtime hours, or raise the threshold to model a weekly rule. Overtime law varies by state and country — the calculator computes the arithmetic, but the rules that apply to a specific job come from the employer's policy and local law.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Hours Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hours Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Shift Times">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="start"
                  label="Start Time"
                  value={start}
                  onChange={setStart}
                  onEnter={runCalculate}
                  type="text"
                  error={errors.start}
                  hint="24-hour HH:MM."
                  tooltip="Clock-on time in 24-hour form, e.g. 09:00 or 22:00."
                />
                <CompactInput
                  id="end"
                  label="End Time"
                  value={end}
                  onChange={setEnd}
                  onEnter={runCalculate}
                  type="text"
                  error={errors.end}
                  hint="Earlier than start = overnight."
                  tooltip="Clock-off time; an end earlier than the start is read as crossing midnight."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="break"
                  label="Unpaid Break"
                  value={breakMin}
                  onChange={setBreakMin}
                  onEnter={runCalculate}
                  min="0"
                  max="480"
                  step="5"
                  suffix="min"
                  hint="Lunch and other unpaid time."
                  tooltip="Total unpaid break minutes deducted from the span."
                />
                <CompactInput
                  id="rate"
                  label="Hourly Rate"
                  value={hourlyRate}
                  onChange={setHourlyRate}
                  onEnter={runCalculate}
                  min="0"
                  step="0.5"
                  prefix="$"
                  hint="0 hides the pay rows."
                  tooltip="Base hourly wage used for the regular and overtime pay split."
                />
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
                  <SubSection title="Overtime Rules">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="threshold"
                        label="Regular Threshold"
                        value={regularThresholdH}
                        onChange={setRegularThresholdH}
                        onEnter={runCalculate}
                        min="1"
                        max="16"
                        step="0.5"
                        suffix="h"
                        hint="8 = daily OT after 8h."
                        tooltip="Hours paid at the base rate before overtime begins."
                      />
                      <CompactInput
                        id="otmult"
                        label="OT Multiplier"
                        value={otMultiplier}
                        onChange={setOtMultiplier}
                        onEnter={runCalculate}
                        min="1"
                        max="3"
                        step="0.1"
                        suffix="×"
                        hint="1.5 is the common rate."
                        tooltip="Overtime pay multiplier applied to hours beyond the threshold."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Rounding & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="rounding"
                        label="Timesheet Rounding"
                        value={roundingMin}
                        onChange={setRoundingMin}
                        options={ROUNDING_OPTIONS}
                        tooltip="Some employers round net time to the nearest 5 or 15 minutes."
                      />
                      <CompactSelect
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        options={DECIMAL_OPTIONS}
                        tooltip="Decimal places on hour and money figures."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Net Hours Worked</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.workedH, d) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmtHm(results.workedMin)} from ${calcInputs.start} to ${calcInputs.end}${results.crossesMidnight ? " (overnight)" : ""}, net of a ${fmt(calcInputs.breakMin, 0)}-minute break`
                  : "Enter valid HH:MM times to total the shift"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Regular Hours</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.regularH, d) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overtime Hours</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.otH, d) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Pay</span>
                <span className="font-extrabold text-foreground">{results.valid && calcInputs.hourlyRate > 0 ? money(results.totalPay) : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Timesheet Item</th>
                    <th className="p-2.5 pr-3 text-right w-[230px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the start and end times to build the timesheet.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Weekly projection (× 5 shifts)</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.workedH * 5, 1)} h · ${calcInputs.hourlyRate > 0 ? money(results.totalPay * 5) + " gross" : "rate not set"}`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net hours (decimal)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.workedH, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net hours (h:mm)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtHm(results.workedMin) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross span on the clock</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtHm(results.spanMin) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break deducted</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.breakApplied, 0)} min` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Regular hours</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.regularH, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overtime hours</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.otH, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Regular / OT pay</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.hourlyRate > 0 ? `${money(results.regularPay)} / ${money(results.otPay)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Crosses midnight</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? (results.crossesMidnight ? "Yes" : "No") : "—"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Hours Calculator?</h2>
            <p>
              An hours calculator totals the working time between a clock-on and a clock-off entry, deducts unpaid breaks, and — where a
              rate is supplied — splits the result into regular and overtime pay. It exists because time arithmetic is deceptively easy to
              get wrong by hand: a 9:00-to-17:30 span with a half-hour lunch is 8.0 hours, but shifts that cross midnight, spans with
              multiple breaks, and the minutes-to-decimal conversion for payroll each add a place where manual maths quietly fails.
            </p>
            <p>
              The calculator shows every intermediate figure — gross span, break deduction, net time in both hours-and-minutes and
              decimal form — so the number entered into a timesheet can be traced back to the clock times rather than trusted blindly. That traceability matters as much as the total: when a payslip is queried weeks later, the first question is always which clock times produced which figure, and a calculator that shows its working answers it in seconds. The same record also makes patterns visible — recurring unpaid break slippage, chronic late finishes, or rounding policies that consistently favour one side — none of which a single monthly total ever reveals.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Both times are converted to minutes past midnight and subtracted. When the end time is not later than the start time, the
              shift is read as crossing midnight: 1440 minutes are added to the end before subtracting, so a 22:00 to 06:00 night shift
              resolves to 8 hours rather than a negative figure. The unpaid break is then deducted, and the optional rounding rule snaps
              the net time to the nearest 5 or 15 minutes for employers whose timesheet policy rounds.
            </p>
            <p>
              The pay split applies the overtime rule: hours up to the threshold pay at the base rate, hours beyond it pay at the
              multiplier — 8 hours and 1.5× by default, both adjustable. Pay figures are informational: set the rate to 0 and the pay rows
              disappear, leaving a pure duration tool. A weekly projection at five identical shifts closes the table, which is a rough
              planning figure rather than a payroll statement. The projection assumes no variation between days and no weekly overtime threshold, so treat it as a budgeting sketch: the moment shifts differ in length, or a weekly 40-hour rule applies, the daily arithmetic must be summed with the threshold set appropriately for the jurisdiction that governs the job.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the net hours worked as a decimal — the form payroll systems expect — with the hours-and-minutes
              reading directly beneath it. The three-stat bar splits regular hours, overtime hours and total pay. The breakdown table
              walks from clock times to pay, including the midnight-crossing flag, and the summary panel repeats the key figures in both
              notations.
            </p>
            <p>
              Two habits keep the results honest. First, always cross-check the h:mm form against your own memory of the shift before
              using the decimal — 8.30 entered where 8.5 was meant is the most common timesheet error and it compounds every day it
              repeats. Second, remember that overtime law is jurisdiction-specific: some places trigger daily overtime, most trigger at
              40 weekly hours, and some jobs are exempt entirely. The calculator applies whatever threshold and multiplier you set, so
              match them to the rules that actually govern the job rather than assuming the defaults are legal advice.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hours-calculator" />
          <PopularCalculators exclude="/calculator/hours-calculator" />
        </div>
      </div>
    </>
  );
}
