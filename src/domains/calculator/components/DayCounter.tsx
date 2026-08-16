"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, CalendarDays } from "lucide-react";
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, eachDayOfInterval, isWeekend } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DayCountResult {
  totalDays: number;
  weeks: number;
  weekdays: number;
  weekendDays: number;
  months: number;
  years: number;
  chartData: { name: string; value: number }[];
}

function calcDays(startStr: string, endStr: string, includeEndDay: boolean): DayCountResult {
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const from = start < end ? start : end;
  const to = start < end ? end : start;

  let totalDays = differenceInDays(to, from);
  if (includeEndDay) totalDays += 1;

  const allDays = eachDayOfInterval({ start: from, end: to });
  const weekendDays = allDays.filter(d => isWeekend(d)).length;
  const weekdays = allDays.length - weekendDays;

  const chartData = [
    { name: "Weekdays", value: weekdays },
    { name: "Weekend Days", value: weekendDays },
  ];
  return { totalDays, weeks: differenceInWeeks(to, from), weekdays, weekendDays, months: differenceInMonths(to, from), years: differenceInYears(to, from), chartData };
}

const DEFAULTS = { start: "2026-01-01", end: "2026-08-16" };

const COLORS = ["hsl(var(--primary))", "hsl(38 92% 50%)"];

const faqs = [
  { question: "Does the day counter include both start and end dates?", answer: "By default, it counts from the start date up to (but not including) the end date. Toggle 'Include end day' to count both dates." },
  { question: "How are weekdays calculated?", answer: "Weekdays are Monday through Friday. The calculator counts each day in the range and classifies it as a weekday or weekend day." },
  { question: "Can I count days between past and future dates?", answer: "Yes, you can select any two dates regardless of whether they are in the past or future — the calculator orders them automatically." },
  { question: "Does it account for holidays?", answer: "No, the calculator only distinguishes between weekdays and weekends. Public holidays are counted as regular weekdays." },
];

export default function DayCounter() {
  const [start, setStart] = useState(DEFAULTS.start);
  const [end, setEnd] = useState(DEFAULTS.end);
  const [includeEndDay, setIncludeEndDay] = useState(false);
  const [result, setResult] = useState<DayCountResult>(() => calcDays("2026-01-01", "2026-08-16", false));

  useEffect(() => {
    if (start && end && !isNaN(new Date(start).getTime()) && !isNaN(new Date(end).getTime())) {
      setResult(calcDays(start, end, includeEndDay));
    }
  }, [start, end, includeEndDay]);

  const reset = () => { setStart(DEFAULTS.start); setEnd(DEFAULTS.end); setIncludeEndDay(false); };
  const invalid = !start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime());

  const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const breakdown = [
    { label: "Start Date", value: fmtDate(start) },
    { label: "End Date", value: fmtDate(end) },
    { label: "Inclusion", value: includeEndDay ? "Includes end day (+1)" : "End day excluded" },
    { label: "Total Days", value: `${result.totalDays.toLocaleString()}`, highlight: true },
    { label: "Weekdays (Mon–Fri)", value: `${result.weekdays.toLocaleString()}` },
    { label: "Weekend Days", value: `${result.weekendDays.toLocaleString()}` },
    { label: "Weeks", value: `${result.weeks.toLocaleString()}` },
    { label: "Months", value: `${result.months.toLocaleString()}` },
    { label: "Years", value: `${result.years.toLocaleString()}` },
  ];

  const summaryStats = [
    { label: "Total Days", value: `${result.totalDays.toLocaleString()}` },
    { label: "Weekdays", value: `${result.weekdays.toLocaleString()}` },
    { label: "Weekend Days", value: `${result.weekendDays.toLocaleString()}` },
    { label: "Weeks", value: `${result.weeks.toLocaleString()}` },
    { label: "Months", value: `${result.months.toLocaleString()}` },
    { label: "Years", value: `${result.years.toLocaleString()}` },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Day Counter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Day Counter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dc-start" className="block text-sm font-medium mb-1 text-foreground">Start Date</label>
                <input id="dc-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dc-end" className="block text-sm font-medium mb-1 text-foreground">End Date</label>
                <input id="dc-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={includeEndDay} onChange={(e) => setIncludeEndDay(e.target.checked)} className="h-4 w-4 rounded border-input" />
              Include end day (+1)
            </label>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <CalendarDays className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Choose valid dates.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Days Between Dates</div>
              <div className="text-4xl font-extrabold text-primary">{result.totalDays.toLocaleString()} days</div>
              <div className="text-sm text-muted-foreground mt-1">{fmtDate(start)} → {fmtDate(end)}{includeEndDay ? " (inclusive)" : ""}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Weekdays</div>
                <div className="text-lg font-bold text-primary">{result.weekdays.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Weekend Days</div>
                <div className="text-lg font-bold text-primary">{result.weekendDays.toLocaleString()}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Weeks</div>
                <div className="text-lg font-bold text-primary">{result.weeks.toLocaleString()}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
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
              <h3 className="text-base font-bold mb-3">Weekday / Weekend Split</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {result.chartData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} days`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </PieChart>
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
            <h2 className="text-2xl font-bold mb-3">About the Day Counter</h2>
            <p>Counting days between dates is the basis of deadlines, billing cycles, and countdowns. By default the count is exclusive of the end date — 90 days from January 1 lands on April 1, not March 31 — which is why the calculator offers an 'include end day' toggle.</p>
            <h3>Business Planning</h3>
            <p>For scheduling, split the span into weekdays and weekend days: project tasks land on weekdays, and a 10-day calendar span typically contains 8 weekdays and 2 weekend days. Holidays are not excluded here, so adjust for local public holidays separately.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/day-counter" />
          <PopularCalculators exclude="/calculator/day-counter" />
        </div>
      </div>
    </>
  );
}
