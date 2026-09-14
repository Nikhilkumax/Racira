"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CalendarRange } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DifferenceResult {
  start: Date;
  end: Date;
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  chartData: { name: string; value: number }[];
}

function calcDifference(startStr: string, endStr: string): DifferenceResult {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const totalDays = Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
  const totalWeeks = totalDays / 7;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthEnd = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthEnd;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearsAsDays = Math.round(years * 365.25);
  const monthsAsDays = Math.round(months * 30.44);
  const chartData = [
    { name: "Years", value: yearsAsDays },
    { name: "Months", value: monthsAsDays },
    { name: "Days", value: days },
  ];
  return { start, end, years, months, days, totalDays, totalWeeks, chartData };
}

const DEFAULTS = { start: "2023-03-15", end: "2026-08-16" };

const faqs = [
  { question: "How is the year-month-day breakdown computed?", answer: "The calculator borrows like subtraction: if the end day is earlier than the start day, one month is borrowed; if the end month is earlier, one year is borrowed. This mirrors how people describe age (e.g., 3 years, 5 months, 1 day)." },
  { question: "Why do total days not equal years + months + days?", answer: "Because years and months vary in length. The breakdown is calendar-based (exact), while the total days is the exact number of 24-hour periods. The chart converts the breakdown to average day-equivalents for visualization." },
  { question: "What is the difference from the Date Calculator?", answer: "The Date Calculator reports total duration in single units (days, weeks, months, years). This calculator decomposes the same span into a combined years/months/days expression, like a DATEDIF calculation." },
];

export default function DateDifferenceCalculator() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [result, setResult] = useState<DifferenceResult>(() => calcDifference("2023-03-15", "2026-08-16"));

  useEffect(() => {
    if (start && end && new Date(end) >= new Date(start)) setResult(calcDifference(start, end));
  }, []);

  const handleCalculate = () => {
    if (start && end && new Date(end) >= new Date(start)) setResult(calcDifference(start, end));
  };
  const reset = () => { setStart(DEFAULTS.start); setEnd(DEFAULTS.end); setResult(calcDifference(DEFAULTS.start, DEFAULTS.end)); };
  const invalid = !start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime()) || new Date(end) < new Date(start);

  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const breakdown = [
    { label: "Start Date", value: fmtDate(result.start) },
    { label: "End Date", value: fmtDate(result.end) },
    { label: "Years", value: `${result.years}` },
    { label: "Months (remainder)", value: `${result.months}` },
    { label: "Days (remainder)", value: `${result.days}` },
    { label: "Full Expression", value: `${result.years} y ${result.months} m ${result.days} d`, highlight: true },
    { label: "Total Days", value: `${result.totalDays.toLocaleString()}` },
    { label: "Total Weeks", value: `${result.totalWeeks.toFixed(1)}` },
  ];

  const summaryStats = [
    { label: "Years", value: `${result.years}` },
    { label: "Months", value: `${result.months}` },
    { label: "Days", value: `${result.days}` },
    { label: "Total Days", value: `${result.totalDays.toLocaleString()}` },
    { label: "Total Weeks", value: result.totalWeeks.toFixed(1) },
    { label: "Total Months (avg)", value: (result.totalDays / 30.44).toFixed(1) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Date Difference Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Date Difference Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dd-start" className="block text-sm font-medium mb-1 text-foreground">Start Date</label>
                <input id="dd-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dd-end" className="block text-sm font-medium mb-1 text-foreground">End Date</label>
                <input id="dd-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <CalendarRange className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Choose valid dates with the end date on or after the start date.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Duration Between Dates</div>
              <div className="text-4xl font-extrabold text-primary">{result.years} y {result.months} m {result.days} d</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtDate(result.start)} → {fmtDate(result.end)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Years</div>
                <div className="text-lg font-bold text-primary">{result.years}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Months</div>
                <div className="text-lg font-bold text-primary">{result.months}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Days</div>
                <div className="text-lg font-bold text-primary">{result.days}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
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
              <h3 className="text-base font-bold mb-3">Breakdown as Day-Equivalents</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} days`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Date Difference Calculator</h2>
            <p>The difference between two dates can be expressed two ways: as a single number of days, or decomposed into whole years, remaining months, and remaining days — the way people describe age or tenure. The decomposition uses calendar borrowing: when the end day is earlier, one month is borrowed from the month count.</p>
            <h3>Reading the Result</h3>
            <p>3 years, 5 months, and 1 day means: advance the start date by 3 years, then 5 months, then 1 day to reach the end date exactly. The total-day figure is independent and exact; the two views agree but describe the span differently.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/date-difference-calculator" />
          <PopularCalculators exclude="/calculator/date-difference-calculator" />
        </div>
      </div>
    </>
  );
}
