"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface DurationInputs {
  startTime: string;
  endTime: string;
}

interface TimeResults {
  durationMin: number;
  hours: number;
  minutes: number;
  totalSeconds: number;
  decimalHours: number;
  overnight: boolean;
  remainingMin: number;
  chartData: { name: string; value: number; pct: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function parseTime(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function calcDuration(i: DurationInputs): TimeResults | null {
  const start = parseTime(i.startTime);
  const end = parseTime(i.endTime);
  if (start === null || end === null) return null;

  let durationMin = end - start;
  const overnight = durationMin <= 0;
  if (overnight) durationMin += 24 * 60;

  const hours = Math.floor(durationMin / 60);
  const minutes = durationMin % 60;
  const totalSeconds = durationMin * 60;
  const decimalHours = durationMin / 60;
  const remainingMin = 24 * 60 - durationMin;

  const chartData = [
    { name: "Elapsed Time", value: durationMin, pct: 0 },
    { name: "Remaining in Day", value: remainingMin, pct: 0 },
  ];
  let acc = 0;
  chartData.forEach((d) => {
    const p = (d.value / (24 * 60)) * 100;
    d.pct = p;
    acc += p;
  });
  chartData[0].pct = Math.round((chartData[0].pct + (100 - acc)) * 10) / 10;
  chartData[1].pct = Math.round((100 - chartData[0].pct) * 10) / 10;

  const breakdown = [
    { label: "Start Time", value: i.startTime },
    { label: "End Time", value: i.endTime },
    { label: "Spans Midnight", value: overnight ? "Yes" : "No" },
    { label: "Duration (Hours:Minutes)", value: `${hours}h ${String(minutes).padStart(2, "0")}m`, highlight: true },
    { label: "Total Minutes", value: `${durationMin}` },
    { label: "Total Seconds", value: `${totalSeconds.toLocaleString()}` },
    { label: "Decimal Hours", value: `${decimalHours.toFixed(2)}` },
    { label: "Remaining in Day", value: `${Math.floor(remainingMin / 60)}h ${String(remainingMin % 60).padStart(2, "0")}m`, isTotal: true },
  ];

  const summaryStats = [
    { label: "Duration", value: `${hours}h ${String(minutes).padStart(2, "0")}m` },
    { label: "Total Minutes", value: `${durationMin}` },
    { label: "Decimal Hours", value: `${decimalHours.toFixed(2)}` },
    { label: "Total Seconds", value: totalSeconds.toLocaleString() },
    { label: "Start", value: i.startTime },
    { label: "End", value: i.endTime },
    { label: "Spans Midnight", value: overnight ? "Yes" : "No" },
    { label: "Remaining in Day", value: `${Math.floor(remainingMin / 60)}h ${String(remainingMin % 60).padStart(2, "0")}m` },
  ];

  return { durationMin, hours, minutes, totalSeconds, decimalHours, overnight, remainingMin, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  startTime: "09:00",
  endTime: "17:30",
};

// 4. Component
export default function TimeDurationCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TimeResults>(() => calcDuration({ startTime: "09:00", endTime: "17:30" }) as TimeResults);

  useEffect(() => {
    setResult(calcDuration({ startTime: "09:00", endTime: "17:30" }) as TimeResults);
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => {
    const r = calcDuration({ startTime: inputs.startTime, endTime: inputs.endTime });
    if (r) setResult(r);
  };
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcDuration({ startTime: "09:00", endTime: "17:30" }) as TimeResults);
  };

  // Validation
  const errors: Record<string, string> = {};
  if (!parseTime(inputs.startTime)) errors.startTime = "Use 24-hour format (e.g., 09:00)";
  if (!parseTime(inputs.endTime)) errors.endTime = "Use 24-hour format (e.g., 17:30)";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How is the duration calculated?", answer: "Both times are converted to minutes since midnight and subtracted. If the end time is earlier than the start time, the calculator assumes the interval crosses midnight and adds 24 hours — so 23:00 to 01:00 correctly yields 2 hours." },
    { question: "What is decimal hours used for?", answer: "Decimal hours (e.g., 8.50 instead of 8h 30m) are the standard for timesheets, payroll, and hourly billing. Multiply decimal hours by your hourly rate to get gross pay for the period." },
    { question: "Can I include dates?", answer: "This calculator works within a single 24-hour window and auto-detects midnight crossing. For multi-day durations, use the Date Calculator, which accepts full dates and computes days, hours, and minutes between them." },
    { question: "Does the calculation include seconds?", answer: "Inputs are minute-precision. Total seconds is provided as a conversion (duration in minutes × 60), useful when you need to report time in seconds for logs or scripting." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Time Duration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Duration Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="start" className={lbl}>Start Time (HH:MM)</label>
                <div className={inp}>
                  <input id="start" type="text" value={inputs.startTime} onChange={(e) => set("startTime")(e.target.value)} className={ci} />
                </div>
                {errors.startTime && <p className="text-xs text-red-500 font-medium mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <label htmlFor="end" className={lbl}>End Time (HH:MM)</label>
                <div className={inp}>
                  <input id="end" type="text" value={inputs.endTime} onChange={(e) => set("endTime")(e.target.value)} className={ci} />
                </div>
                {errors.endTime && <p className="text-xs text-red-500 font-medium mt-1">{errors.endTime}</p>}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Uses 24-hour time. If the end time is earlier than the start, the interval is treated as crossing midnight.</p>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calculate}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time Duration</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.hours}h {String(result.minutes).padStart(2, "0")}m</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.decimalHours.toFixed(2)} decimal hours · {result.durationMin} minutes {result.overnight ? "· crosses midnight" : ""}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Minutes", `${result.durationMin}`],
                ["Decimal Hours", `${result.decimalHours.toFixed(2)}`],
                ["Total Seconds", result.totalSeconds.toLocaleString()],
              ].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Duration Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Share of the 24-Hour Day</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RPie>
                  <Pie data={result.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${Math.round(v).toLocaleString()} min`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                </RPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
                {result.chartData.map((d, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.2)" }} />
                    {d.name} · {d.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Calculating Time Intervals</h2>
            <p>This calculator finds the duration between two clock times in a 24-hour day. Both inputs are converted to minutes since midnight, subtracted, and the result is presented as hours and minutes, total minutes, decimal hours, and seconds. If the end time falls before the start time, the interval is treated as crossing midnight.</p>
            <h2 className="text-2xl font-bold mb-3">Decimal Hours for Work and Payroll</h2>
            <p>Timesheets and payroll systems typically want time in decimal hours — 8.5 hours rather than 8h 30m. Multiply the decimal hours by your hourly rate to check a pay stub, or sum several intervals to total a workweek.</p>
            <h2 className="text-2xl font-bold mb-3">Planning a Day</h2>
            <p>Use the share-of-day chart to see how much of a 24-hour period a task occupies. A standard 8.5-hour shift is just over a third of a day — a useful perspective when planning study blocks, travel, or overnight shifts that span midnight.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-duration-calculator" />
          <PopularCalculators exclude="/calculator/time-duration-calculator" />
        </div>
      </div>
    </>
  );
}
