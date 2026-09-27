"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const DEFAULT_START = "2025-01-01";
const DEFAULT_END = "2026-01-01";

interface DateInputs {
  start: string;
  end: string;
  shiftDays: number;
}

interface UnitRow {
  label: string;
  value: string;
}

interface ShiftRow {
  label: string;
  date: string;
  weekday: string;
}

interface DateResult {
  valid: boolean;
  errorMsg: string;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  totalMinutes: number;
  calendarMonths: number;
  years: number;
  months: number;
  days: number;
  weekdays: number;
  weekendDays: number;
  shiftedDate: string;
  shiftedWeekday: string;
  units: UnitRow[];
  shifts: ShiftRow[];
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtInt = (v: number) => (Number.isFinite(v) ? Math.round(v).toLocaleString() : "—");

function toDate(value: string): Date | null {
  if (!value) return null;
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((p) => !Number.isFinite(p))) return null;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function prettyDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function countWeekdays(start: Date, end: Date): { weekdays: number; weekend: number } {
  let weekdays = 0;
  let weekend = 0;
  const cursor = new Date(start.getTime());
  while (cursor.getTime() < end.getTime()) {
    const day = cursor.getUTCDay();
    if (day === 0 || day === 6) weekend += 1;
    else weekdays += 1;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return { weekdays, weekend };
}

function computeDate(input: DateInputs): DateResult {
  const { shiftDays } = input;
  const start = toDate(input.start);
  const end = toDate(input.end);

  const blank: DateResult = {
    valid: false,
    errorMsg: "",
    totalDays: 0,
    totalWeeks: 0,
    totalHours: 0,
    totalMinutes: 0,
    calendarMonths: 0,
    years: 0,
    months: 0,
    days: 0,
    weekdays: 0,
    weekendDays: 0,
    shiftedDate: "",
    shiftedWeekday: "",
    units: [],
    shifts: [],
  };

  if (!start) return { ...blank, errorMsg: "Enter a valid start date." };
  if (!end) return { ...blank, errorMsg: "Enter a valid end date." };
  if (end.getTime() < start.getTime()) {
    return { ...blank, errorMsg: "The end date must fall on or after the start date. Swap the dates to continue." };
  }

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.round(diffMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    const dim = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
    days += dim;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const calendarMonths = years * 12 + months;

  const { weekdays, weekend } = countWeekdays(start, end);

  const shift = Number.isFinite(shiftDays) ? Math.round(shiftDays) : 0;
  const shifted = new Date(start.getTime() + shift * 86400000);

  const units: UnitRow[] = [
    { label: "Total days", value: fmtInt(totalDays) },
    { label: "Total weeks", value: `${fmtInt(totalWeeks)} weeks and ${remainderDays} days` },
    { label: "Total hours", value: fmtInt(totalDays * 24) },
    { label: "Total minutes", value: fmtInt(totalDays * 24 * 60) },
    { label: "Calendar months", value: fmtInt(calendarMonths) },
    { label: "Weekdays (Mon–Fri)", value: fmtInt(weekdays) },
    { label: "Weekend days", value: fmtInt(weekend) },
    { label: "Working weeks (5-day)", value: (weekdays / 5).toFixed(2) },
  ];

  const shiftSpecs = [30, 90, 180, 365];
  const shifts: ShiftRow[] = shiftSpecs.map((n) => {
    const d = new Date(start.getTime() + n * 86400000);
    return { label: `${n} days after start`, date: prettyDate(d), weekday: WEEKDAYS[d.getUTCDay()] };
  });

  return {
    valid: true,
    errorMsg: "",
    totalDays,
    totalWeeks,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 24 * 60,
    calendarMonths,
    years,
    months,
    days,
    weekdays,
    weekendDays: weekend,
    shiftedDate: prettyDate(shifted),
    shiftedWeekday: WEEKDAYS[shifted.getUTCDay()],
    units,
    shifts,
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

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "date", min, suffix, tooltip }: CompactInputProps) => (
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

export default function DateCalculator() {
  const [start, setStart] = useState(DEFAULT_START);
  const [end, setEnd] = useState(DEFAULT_END);
  const [shiftDays, setShiftDays] = useState("0");
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DateInputs => ({
    start,
    end,
    shiftDays: parseFloat(shiftDays) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<DateInputs>(() => ({
    start: DEFAULT_START,
    end: DEFAULT_END,
    shiftDays: 0,
  }));
  const [results, setResults] = useState<DateResult>(() =>
    computeDate({ start: DEFAULT_START, end: DEFAULT_END, shiftDays: 0 }),
  );

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeDate(inputs));
  };

  const reset = () => {
    setStart(DEFAULT_START);
    setEnd(DEFAULT_END);
    setShiftDays("0");
    setCalcInputs({ start: DEFAULT_START, end: DEFAULT_END, shiftDays: 0 });
    setResults(computeDate({ start: DEFAULT_START, end: DEFAULT_END, shiftDays: 0 }));
  };

  const faqs = [
    {
      question: "How do I count the days between two dates?",
      answer:
        "Subtract the earlier date from the later one and divide the result by the number of milliseconds in a day. The calculator adds one day at a time internally so the count is exact across month lengths and leap years. Whether you include the start or end date is a convention, and the difference is always exactly one day.",
    },
    {
      question: "How many working days are in a period?",
      answer:
        "Count every day in the range that is not a Saturday or Sunday. A full year contains about 260 to 262 weekdays depending on where the weekends fall, and a leap year adds one more. Public holidays are not deducted, so subtract them yourself if you need an exact business-day count for a contract or delivery promise.",
    },
    {
      question: "How do I add or subtract days from a date?",
      answer:
        "Enter the starting date and the number of days in the shift field, using a negative number to move backwards. Adding seventy days to the first of January lands in mid-March, and the calculator reports the weekday as well as the date. This is the quickest way to find a deadline, a cooling-off period or a payment due date.",
    },
    {
      question: "Why does the calendar month count differ from days divided by thirty?",
      answer:
        "Calendar months follow the real calendar, so a month can be twenty-eight, thirty or thirty-one days long. The month count gives the number of complete months between the dates and the leftover days are reported separately. Dividing total days by thirty produces a rough estimate that drifts by several days over the course of a year.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Everyday Life", href: "/calculator#everyday-life" },
          { label: "Date Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Date Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Date Range">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="start-date"
                  label="Start Date"
                  value={start}
                  onChange={setStart}
                  onEnter={runCalculate}
                  tooltip="The earlier date in the range."
                />
                <CompactInput
                  id="end-date"
                  label="End Date"
                  value={end}
                  onChange={setEnd}
                  onEnter={runCalculate}
                  tooltip="The later date in the range."
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
                  <SubSection title="Shift the Start Date">
                    <CompactInput
                      id="shift-days"
                      label="Days to Add"
                      value={shiftDays}
                      onChange={setShiftDays}
                      onEnter={runCalculate}
                      type="number"
                      suffix="days"
                      hint="Use a negative number to move backwards in time."
                      tooltip="Offsets the start date by this many days."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Days Between</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmtInt(results.totalDays) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.years} years, ${results.months} months and ${results.days} days apart`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weeks</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmtInt(results.totalWeeks) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weekdays</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmtInt(results.weekdays) : "—"}</span>
              </div>
              <div className="w-px h-8 border-border bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Calendar Months</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmtInt(results.calendarMonths) : "—"}
                </span>
              </div>
            </div>

            {/* UNIT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measurement</th>
                    <th className="p-2.5 pr-3 text-right w-[210px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.units.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Shifted start date</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {results.valid ? `${results.shiftedDate} (${results.shiftedWeekday})` : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SHIFT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Offset From Start</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Weekday</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.shifts.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-foreground">{row.date}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.weekday}</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Start Date</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.start}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">End Date</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.end}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Hours</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtInt(results.totalHours) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total Minutes</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtInt(results.totalMinutes) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weekend Days</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmtInt(results.weekendDays) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Day Offset Applied</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.shiftDays} days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Date Calculator?</h2>
            <p>
              A date calculator measures the distance between two calendar dates and shifts a date forwards or backwards by
              any number of days. It reports the gap in years, months, days, weeks, hours, minutes, weekdays, weekend days and
              working weeks, then shows where the start date lands after thirty, ninety, one hundred and eighty and three
              hundred and sixty-five days.
            </p>
            <p>
              Counting dates by hand is error-prone because months contain different numbers of days and leap years appear
              without warning. That matters for contracts, notice periods, probation windows, visa validity, medication
              courses and interest accrual, all of which are defined by exact calendar dates rather than rough month counts.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator converts both dates to a day offset and subtracts the earlier from the later, which gives the
              total days directly. Hours and minutes follow by multiplication, and the calendar breakdown is produced
              separately by comparing year, month and day components and borrowing from the previous month whenever the day
              count would go negative.
            </p>
            <p>
              Weekdays are counted by walking the range one day at a time and classifying each day by its position in the
              week, so weekends are never mistaken for working days. The shift field adds or subtracts whole days from the
              start date, and the offset table applies the standard intervals so common deadlines are visible without
              recalculating.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the number of days in the range with the calendar equivalent beneath it. The three-stat
              bar summarises the weeks, weekdays and complete calendar months, while the first table lists every unit total
              including the working-week count and the shifted start date.
            </p>
            <p>
              Note that the day count excludes the end date itself, which is the standard way to measure an interval: the
              first of January to the first of February is one month, not one month and a day. If a contract or statute
              includes both endpoints, add one day to the figure before relying on it. The weekday count is a business-day
              estimate only and does not deduct public holidays.
            </p>
            <p>
              Use the offset table for planning rather than the raw numbers. Ninety days is the usual notice period for many
              tenancy and insurance products, thirty days covers most billing cycles, and three hundred and sixty-five days
              reveals the effect of a leap year by landing one day later than the same date the previous year.
            </p>
            <p>
              Finally, watch the direction of travel when a deadline matters. Subtracting days moves a date into the past and
              is useful for reconstructing cut-off dates, while adding days pushes forward. Both use the same field with a
              minus sign, and the calculator shows the resulting weekday so a deadline that lands on a weekend is obvious at a
              glance.
            </p>
            <p>
              One practical habit is to keep the raw dates alongside the totals when the answer will be used for anything
              official. Quoting a bare day count invites disagreement about whether the endpoints are included, whereas
              writing both dates makes the convention explicit and lets anyone reproduce the arithmetic. That single line of
              context prevents most disputes over notice periods and deadline calculations.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/date-calculator" />
          <PopularCalculators exclude="/calculator/date-calculator" />
        </div>
      </div>
    </>
  );
}
