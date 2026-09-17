"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface WeeksInputs {
  sm: string;
  sd: string;
  sy: string;
  em: string;
  ed: string;
  ey: string;
}

interface WeeksResults {
  totalDays: number;
  weeks: number;
  wholeWeeks: number;
  remainderDays: number;
  totalMonths: number;
  startLabel: string;
  endLabel: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function calcWeeks(i: WeeksInputs): WeeksResults | null {
  const sm = parseInt(i.sm, 10), sd = parseInt(i.sd, 10), sy = parseInt(i.sy, 10);
  const em = parseInt(i.em, 10), ed = parseInt(i.ed, 10), ey = parseInt(i.ey, 10);
  if (isNaN(sm) || isNaN(sd) || isNaN(sy) || isNaN(em) || isNaN(ed) || isNaN(ey)) return null;
  if (Date.UTC(ey, em - 1, ed) < Date.UTC(sy, sm - 1, sd)) return null;

  const totalDays = Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000);
  const weeks = totalDays / 7;
  const wholeWeeks = Math.floor(weeks);
  const remainderDays = totalDays - wholeWeeks * 7;
  const totalMonths = totalDays / 30.4375;

  const startLabel = `${MONTH_NAMES[sm - 1]} ${sd}, ${sy}`;
  const endLabel = `${MONTH_NAMES[em - 1]} ${ed}, ${ey}`;

  const chartData = [
    { name: "Whole Weeks", value: wholeWeeks * 7 },
    { name: "Remaining Days", value: remainderDays },
  ];

  const breakdown = [
    { label: "Start Date", value: startLabel },
    { label: "End Date", value: endLabel },
    { label: "Total Days", value: `${totalDays} days` },
    { label: "Whole Weeks", value: `${wholeWeeks} wk ${remainderDays} day${remainderDays === 1 ? "" : "s"}` },
    { label: "Exact Weeks", value: `${weeks.toFixed(2)} weeks`, highlight: true, isTotal: true },
    { label: "Approx. Months", value: `${totalMonths.toFixed(1)} months (30.44-day average)` },
  ];

  const summaryStats = [
    { label: "Exact Weeks", value: `${weeks.toFixed(2)}` },
    { label: "Whole Weeks", value: `${wholeWeeks}` },
    { label: "Remaining Days", value: `${remainderDays}` },
    { label: "Total Days", value: `${totalDays}` },
    { label: "Approx. Months", value: `${totalMonths.toFixed(1)}` },
    { label: "Start Date", value: startLabel },
    { label: "End Date", value: endLabel },
    { label: "Days per Week", value: "7" },
  ];

  return { totalDays, weeks, wholeWeeks, remainderDays, totalMonths, startLabel, endLabel, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: WeeksInputs = { sm: "1", sd: "1", sy: "2024", em: "3", ed: "1", ey: "2024" };

// 4. Component
export default function WeeksCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<WeeksResults | null>(() => calcWeeks(DEFAULTS));

  useEffect(() => {
    setResult(calcWeeks(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcWeeks(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcWeeks(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const sd = parseInt(inputs.sd, 10), sy = parseInt(inputs.sy, 10), ed = parseInt(inputs.ed, 10), ey = parseInt(inputs.ey, 10);
  if (isNaN(sd) || sd < 1 || sd > 31) errors.sd = "1–31";
  if (isNaN(ed) || ed < 1 || ed > 31) errors.ed = "1–31";
  if (isNaN(sy) || sy < 1900 || sy > 2100) errors.sy = "1900–2100";
  if (isNaN(ey) || ey < 1900 || ey > 2100) errors.ey = "1900–2100";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const renderDate = (prefix: string, mKey: keyof typeof DEFAULTS, dKey: keyof typeof DEFAULTS, yKey: keyof typeof DEFAULTS, errKey: "sd" | "ed") => (
    <div>
      <label className={lbl}>{prefix} Date</label>
      <div className="grid grid-cols-[1fr_76px_92px] gap-2">
        <select value={inputs[mKey]} onChange={(e) => set(mKey)(e.target.value)} className={sel} aria-label={`${prefix} month`}>
          {MONTH_NAMES.map((n, idx) => (
            <option key={idx} value={String(idx + 1)}>{n}</option>
          ))}
        </select>
        <div className={inp}>
          <input type="number" min="1" max="31" value={inputs[dKey]} onChange={(e) => set(dKey)(e.target.value)} className={ci} aria-label={`${prefix} day`} />
        </div>
        <div className={inp}>
          <input type="number" min="1900" max="2100" value={inputs[yKey]} onChange={(e) => set(yKey)(e.target.value)} className={ci} aria-label={`${prefix} year`} />
        </div>
      </div>
      {errors[errKey] && <p className="text-xs text-red-500 font-medium mt-1">{errors[errKey]}</p>}
    </div>
  );

  const faqs = [
    { question: "How are weeks counted between two dates?", answer: "The exact number of weeks is the total days between the dates divided by 7 — January 1 to March 1, 2024 is 60 days, so exactly 8.57 weeks. The calculator also reports the whole-week count (8 weeks) and the remaining days (4 days), which is the useful form for planning." },
    { question: "Why does the calendar week matter?", answer: "A 'week' in scheduling usually means a Monday-to-Sunday block, and a span rarely aligns perfectly with those blocks. This calculator counts weeks purely by days ÷ 7, which is exact and unambiguous — the day-of-week alignment is a separate concern you can handle with your start day." },
    { question: "How are leap years handled?", answer: "The day count is computed from the real calendar via UTC timestamps, so February 29 is included exactly when it occurs. A span crossing a leap year simply has one more day and therefore slightly more weeks than the same date range in a common year." },
    { question: "Why is the month figure approximate?", answer: "Months vary from 28 to 31 days, so there is no exact day-for-day month conversion. The calculator uses the 30.44-day average (365.25 ÷ 12) for a quick reference figure, clearly labeled approximate — the exact days and weeks figures are always authoritative." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Weeks Between Dates Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weeks Between Dates Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {renderDate("Start", "sm", "sd", "sy", "sd")}
              {renderDate("End", "em", "ed", "ey", "ed")}
            </div>

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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Exact Weeks</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? `${result.weeks.toFixed(2)}` : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${result.startLabel} → ${result.endLabel}` : "Enter valid dates."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Days", result ? `${result.totalDays}` : "—"],
                ["Whole Weeks", result ? `${result.wholeWeeks}` : "—"],
                ["Remaining Days", result ? `${result.remainderDays}` : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Span Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result?.breakdown.map((r, i) => (
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
              <h3 className="text-base font-bold mb-4">Whole Weeks vs. Remainder Days</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result?.chartData ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted-foreground) / 0.2)" />
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${v} days`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Each whole week contributes 7 days; anything left over is the remainder shown in the stat bar.</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result?.summaryStats.map((s, i) => (
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
            <h2 className="text-2xl font-bold mb-3">Weeks Are Just Days Divided by Seven</h2>
            <p>Unlike months, a week has an exact, invariant length: seven days. The exact number of weeks between two dates is therefore always total days ÷ 7 — 60 days is 8.57 weeks, no calendar table required. The interesting part is splitting that decimal into whole weeks and leftover days, which is what this calculator reports.</p>
            <h2 className="text-2xl font-bold mb-3">Exactness Across the Calendar</h2>
            <p>The day count is computed from UTC timestamps on the real calendar, so February 29, month-length variation, and century leap rules are all handled exactly. A span from January 1 to March 1 is 60 days in 2024 (a leap year) and 59 days in 2023 — the calculator reflects that difference down to the decimal week.</p>
            <h2 className="text-2xl font-bold mb-3">Weeks for Planning, Months for Contracts</h2>
            <p>Fixed 7-day weeks make a natural unit for training plans, shipping schedules, and habits; calendar months dominate contracts and billing. The approximate month figure (30.44-day average) is included as a bridge between the two units, always clearly labeled — the exact days and exact weeks are the numbers to rely on.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weeks-calculator" />
          <PopularCalculators exclude="/calculator/weeks-calculator" />
        </div>
      </div>
    </>
  );
}
