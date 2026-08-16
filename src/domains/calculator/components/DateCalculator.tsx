"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CalendarDays } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DateResult {
  start: Date;
  end: Date;
  days: number;
  weeks: number;
  months: number;
  years: number;
  hours: number;
  businessDays: number;
  weekendDays: number;
  chartData: { name: string; value: number }[];
}

function calcDate(startStr: string, endStr: string): DateResult {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const days = Math.round((end.getTime() - start.getTime()) / 86400000);
  const weeks = days / 7;
  const months = days / 30.4375;
  const years = days / 365.25;
  const hours = days * 24;
  let businessDays = 0;
  const cur = new Date(start);
  const safeDays = Math.max(0, days);
  for (let i = 0; i < safeDays; i++) {
    const d = cur.getDay();
    if (d !== 0 && d !== 6) businessDays++;
    cur.setDate(cur.getDate() + 1);
  }
  const weekendDays = safeDays - businessDays;
  const chartData = [
    { name: "Years", value: Number(years.toFixed(2)) },
    { name: "Months", value: Number(months.toFixed(1)) },
    { name: "Weeks", value: Number(weeks.toFixed(1)) },
    { name: "Days", value: days },
  ];
  return { start, end, days: safeDays, weeks, months, years, hours, businessDays, weekendDays, chartData };
}

const DEFAULTS = { start: "2025-01-01", end: "2026-01-01" };

const faqs = [
  { question: "How is the day count calculated?", answer: "The calculator counts the exact number of 24-hour periods between the two dates, inclusive of start but exclusive of the end day — the standard difference convention." },
  { question: "What counts as a business day?", answer: "Weekdays (Monday–Friday) count as business days; Saturday and Sunday count as weekend days. The calculation does not subtract public holidays, which vary by country and year." },
  { question: "Why are months approximate?", answer: "Months vary in length (28–31 days), so the calculator uses the average month of 30.44 days. For exact month counts, compare the calendar dates directly." },
];

export default function DateCalculator() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [result, setResult] = useState<DateResult>(() => calcDate("2025-01-01", "2026-01-01"));

  useEffect(() => {
    if (start && end && new Date(end) >= new Date(start)) setResult(calcDate(start, end));
  }, [start, end]);

  const reset = () => { setStart(DEFAULTS.start); setEnd(DEFAULTS.end); };
  const invalid = !start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime()) || new Date(end) < new Date(start);

  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const breakdown = [
    { label: "Start Date", value: fmtDate(result.start) },
    { label: "End Date", value: fmtDate(result.end) },
    { label: "Total Days", value: `${result.days.toLocaleString()} days`, highlight: true },
    { label: "Business Days (Mon–Fri)", value: `${result.businessDays.toLocaleString()}` },
    { label: "Weekend Days", value: `${result.weekendDays.toLocaleString()}` },
    { label: "In Weeks", value: `${result.weeks.toFixed(1)}` },
    { label: "In Months (avg)", value: `${result.months.toFixed(1)}` },
    { label: "In Years", value: `${result.years.toFixed(2)}` },
    { label: "In Hours", value: `${result.hours.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Total Days", value: `${result.days.toLocaleString()}` },
    { label: "Business Days", value: `${result.businessDays.toLocaleString()}` },
    { label: "Weekend Days", value: `${result.weekendDays.toLocaleString()}` },
    { label: "Weeks", value: result.weeks.toFixed(1) },
    { label: "Months", value: result.months.toFixed(1) },
    { label: "Years", value: result.years.toFixed(2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Date Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Date Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dt-start" className="block text-sm font-medium mb-1 text-foreground">Start Date</label>
                <input id="dt-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dt-end" className="block text-sm font-medium mb-1 text-foreground">End Date</label>
                <input id="dt-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <CalendarDays className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Choose valid dates with the end date on or after the start date.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Duration</div>
              <div className="text-4xl font-extrabold text-primary">{result.days.toLocaleString()} days</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtDate(result.start)} → {fmtDate(result.end)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Weeks</div>
                <div className="text-lg font-bold text-primary">{result.weeks.toFixed(1)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Business Days</div>
                <div className="text-lg font-bold text-primary">{result.businessDays.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Hours</div>
                <div className="text-lg font-bold text-primary">{result.hours.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th>
                    <th className="p-2.5 pr-3 text-right">Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Duration in Different Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString("en-US", { maximumFractionDigits: 1 })}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Date Calculator</h2>
            <p>The duration between two dates is measured as the number of 24-hour periods separating them. From that base, weeks (÷7), average months (÷30.44), and years (÷365.25) are derived — the astronomical year average accounts for leap days.</p>
            <h3>Business vs Calendar Days</h3>
            <p>Business days count Monday through Friday only. For project timelines, the 5-day work week determines delivery dates; weekends inflate the calendar duration but not the working duration. Public holidays are not subtracted because they vary by country and employer.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/date-calculator" />
          <PopularCalculators exclude="/calculator/date-calculator" />
        </div>
      </div>
    </>
  );
}
