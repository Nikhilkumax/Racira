"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface MonthsInputs {
  sm: string;
  sd: string;
  sy: string;
  em: string;
  ed: string;
  ey: string;
}

interface MonthsResults {
  completeMonths: number;
  totalDays: number;
  remainderDays: number;
  years: number;
  monthsLeft: number;
  totalWeeks: number;
  startLabel: string;
  endLabel: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function daysBetween(sy: number, sm: number, sd: number, ey: number, em: number, ed: number): number {
  return Math.round((Date.UTC(ey, em - 1, ed) - Date.UTC(sy, sm - 1, sd)) / 86400000);
}

function calcMonths(i: MonthsInputs): MonthsResults | null {
  const sm = parseInt(i.sm, 10), sd = parseInt(i.sd, 10), sy = parseInt(i.sy, 10);
  const em = parseInt(i.em, 10), ed = parseInt(i.ed, 10), ey = parseInt(i.ey, 10);
  if (isNaN(sm) || isNaN(sd) || isNaN(sy) || isNaN(em) || isNaN(ed) || isNaN(ey)) return null;
  if (Date.UTC(ey, em - 1, ed) < Date.UTC(sy, sm - 1, sd)) return null;

  // Complete calendar months: end day must be >= start day to count the final month
  let completeMonths = (ey - sy) * 12 + (em - sm);
  if (ed < sd) completeMonths -= 1;

  const totalDays = daysBetween(sy, sm, sd, ey, em, ed);
  // Remainder days after the last complete month boundary
  const boundary = Date.UTC(sy, sm - 1 + completeMonths, sd);
  const remainderDays = Math.max(0, Math.round((Date.UTC(ey, em - 1, ed) - boundary) / 86400000));

  const years = Math.floor(completeMonths / 12);
  const monthsLeft = completeMonths % 12;
  const totalWeeks = totalDays / 7;

  const startLabel = `${MONTH_NAMES[sm - 1]} ${sd}, ${sy}`;
  const endLabel = `${MONTH_NAMES[em - 1]} ${ed}, ${ey}`;

  const chartData = [
    { name: "Within Complete Months", value: totalDays - remainderDays },
    { name: "Remaining Days", value: remainderDays },
  ];

  const breakdown = [
    { label: "Start Date", value: startLabel },
    { label: "End Date", value: endLabel },
    { label: "Total Days", value: `${totalDays} days` },
    { label: "Complete Months", value: `${completeMonths} months`, highlight: true, isTotal: true },
    { label: "Years + Months", value: years > 0 ? `${years} yr${years > 1 ? "s" : ""} ${monthsLeft > 0 ? `${monthsLeft} mo` : ""}`.trim() : `${monthsLeft} mo` },
    { label: "Remaining Days", value: `${remainderDays} day${remainderDays === 1 ? "" : "s"}` },
    { label: "Total Weeks", value: `${totalWeeks.toFixed(1)} weeks` },
  ];

  const summaryStats = [
    { label: "Complete Months", value: `${completeMonths}` },
    { label: "Total Days", value: `${totalDays}` },
    { label: "Total Weeks", value: `${totalWeeks.toFixed(1)}` },
    { label: "Years", value: `${years}` },
    { label: "Months (remainder)", value: `${monthsLeft}` },
    { label: "Days (remainder)", value: `${remainderDays}` },
    { label: "Start Date", value: startLabel },
    { label: "End Date", value: endLabel },
  ];

  return { completeMonths, totalDays, remainderDays, years, monthsLeft, totalWeeks, startLabel, endLabel, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: MonthsInputs = { sm: "1", sd: "15", sy: "2024", em: "6", ed: "15", ey: "2025" };

// 4. Component
export default function MonthsCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<MonthsResults | null>(() => calcMonths(DEFAULTS));

  useEffect(() => {
    setResult(calcMonths(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcMonths(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcMonths(DEFAULTS));
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
    { question: "How is a 'complete month' defined?", answer: "A complete month runs from a day-of-month to the same day-of-month in the next month — January 15 to February 15 is one complete month. The final month only counts if the end date reaches or passes the start day-of-month: January 15 to February 14 is 0 complete months and 30 days." },
    { question: "Why are the years limited to 1900–2100?", answer: "The Gregorian calendar's leap-year rule is stable across this range, and Date arithmetic is exact within it. For dates outside the range the day-of-month boundary math still works, but the range covers essentially every practical use — birthdates, contracts, and planning horizons." },
    { question: "How do leap years affect month counts?", answer: "Leap years only change February's length, so they affect the day count but not the complete-month count — February 1 to March 1 is one complete month whether February has 28 or 29 days. The total-days figure in the results is computed from the actual calendar, so it stays exact across leap years." },
    { question: "What is the difference between months and weeks?", answer: "Months are calendar units of varying length (28–31 days) counted by day-of-month boundaries; weeks are fixed 7-day units. The same span can be 11 complete months and 22 days, or 47.4 weeks — the calculator reports all three so you can use whichever unit fits your context." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Months Between Dates Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Months Between Dates Calculator</h1>

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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Complete Months</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? `${result.completeMonths}` : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${result.startLabel} → ${result.endLabel}` : "Enter valid dates."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Total Days", result ? `${result.totalDays}` : "—"],
                ["Total Weeks", result ? `${result.totalWeeks.toFixed(1)}` : "—"],
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
              <h3 className="text-base font-bold mb-4">Days Inside vs. Outside Complete Months</h3>
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
              <p className="text-xs text-muted-foreground mt-2 text-center">Days that fall inside complete calendar months vs. the remainder after the last month boundary.</p>
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
            <h2 className="text-2xl font-bold mb-3">Counting Months the Way Calendars Do</h2>
            <p>"How many months is it between January 15 and June 15?" — eleven, in calendar terms: February through May are complete, and the boundary day-of-month decides whether the end month counts. This calculator follows the day-of-month rule used by billing cycles and tenancy agreements: a month is complete only when the same day number comes around again.</p>
            <h2 className="text-2xl font-bold mb-3">The Day-Number Boundary</h2>
            <p>Jan 15 → Feb 15 is one complete month; Jan 15 → Feb 14 is zero complete months and 30 days, even though it is nearly a month long. The rule is deliberately simple — count every full month boundary, and leave the partial days as a remainder. That remainder is exactly what the calculator reports as "remaining days," and it never silently vanishes into a rounded month count.</p>
            <h2 className="text-2xl font-bold mb-3">Three Units, One Span</h2>
            <p>The same period can be expressed as months (calendar), weeks (fixed 7-day chunks), or days (exact). Because months vary between 28 and 31 days, a month figure and a week figure for the same span will never multiply cleanly into each other — the calculator reports all three so a contract clause, a savings goal, or a due date each gets the unit it needs.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/months-calculator" />
          <PopularCalculators exclude="/calculator/months-calculator" />
        </div>
      </div>
    </>
  );
}
