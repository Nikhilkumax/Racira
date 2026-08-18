"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface LeapInputs {
  year: string;
  month: string; // 1-12
  day: string;   // 1-31
}

interface LeapResults {
  isLeap: boolean;
  statusLabel: string;
  daysInYear: number;
  febDays: number;
  nextLeap: number;
  prevLeap: number;
  centuryRule: string;
  dayOfYear: number | null;
  monthDays: { name: string; days: number; highlight: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTH_DAYS_COMMON = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function calcLeap(i: LeapInputs): LeapResults | null {
  const y = parseInt(i.year, 10);
  if (isNaN(y) || y < 1 || y > 9999) return null;

  const leap = isLeapYear(y);
  const febDays = leap ? 29 : 28;
  const daysInYear = leap ? 366 : 365;

  let next = y + 1;
  while (!isLeapYear(next)) next++;
  let prev = y - 1;
  while (prev > 0 && !isLeapYear(prev)) prev--;

  const centuryRule = y % 100 === 0
    ? (leap ? `Divisible by 400 → leap (${y} is a century year)` : `Century year not divisible by 400 → common`)
    : `Not a century year → ${leap ? "divisible by 4, so leap" : `not divisible by 4, so common`}`;

  // Day-of-year from the optional date inputs
  let dayOfYear: number | null = null;
  const m = parseInt(i.month, 10);
  const d = parseInt(i.day, 10);
  if (!isNaN(m) && !isNaN(d) && m >= 1 && m <= 12 && d >= 1 && d <= (m === 2 ? febDays : MONTH_DAYS_COMMON[m - 1])) {
    dayOfYear = MONTH_DAYS_COMMON.slice(0, m - 1).reduce((a, b) => a + b, 0) + d + (leap && m > 2 ? 1 : 0);
  }

  const monthDays = MONTH_NAMES.map((name, idx) => ({
    name,
    days: idx === 1 ? febDays : MONTH_DAYS_COMMON[idx],
    highlight: idx === 1,
  }));

  const breakdown = [
    { label: "Year", value: `${y}` },
    { label: "Leap Year?", value: leap ? "Yes — 366 days" : "No — 365 days", highlight: true, isTotal: true },
    { label: "Days in Year", value: `${daysInYear}` },
    { label: "February Days", value: `${febDays}` },
    { label: "Divisibility Check", value: `${y % 4 === 0 ? "÷4 ✓" : "÷4 ✗"} · ${y % 100 === 0 ? "÷100 ✓" : "÷100 ✗"} · ${y % 400 === 0 ? "÷400 ✓" : "÷400 ✗"}` },
    { label: "Century Rule", value: centuryRule },
    { label: "Next Leap Year", value: `${next}` },
    { label: "Previous Leap Year", value: prev > 0 ? `${prev}` : "—" },
    { label: "Selected Date (day of year)", value: dayOfYear !== null ? `${MONTH_NAMES[m - 1]} ${d}, ${y} → day ${dayOfYear} of ${daysInYear}` : "—" },
  ];

  const summaryStats = [
    { label: "Leap Year?", value: leap ? "Yes" : "No" },
    { label: "Days in Year", value: `${daysInYear}` },
    { label: "February Days", value: `${febDays}` },
    { label: "Next Leap Year", value: `${next}` },
    { label: "Previous Leap Year", value: prev > 0 ? `${prev}` : "—" },
    { label: "Divisible by 4", value: y % 4 === 0 ? "Yes" : "No" },
    { label: "Divisible by 100", value: y % 100 === 0 ? "Yes" : "No" },
    { label: "Divisible by 400", value: y % 400 === 0 ? "Yes" : "No" },
  ];

  return { isLeap: leap, statusLabel: leap ? "Leap Year" : "Common Year", daysInYear, febDays, nextLeap: next, prevLeap: prev, centuryRule, dayOfYear, monthDays, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = { year: "2024", month: "2", day: "29" };

// 4. Component
export default function LeapYearCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<LeapResults | null>(() => calcLeap(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcLeap(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcLeap(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcLeap(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const y = parseInt(inputs.year, 10);
  if (isNaN(y) || y < 1 || y > 9999) errors.year = "Must be 1–9999";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is the rule for leap years?", answer: "A year is a leap year if it is divisible by 4 — except century years, which must also be divisible by 400. So 2024 is a leap year (÷4 ✓, not a century), 1900 is not (century, not ÷400), and 2000 is (century, ÷400 ✓)." },
    { question: "Why do we need leap years at all?", answer: "The Earth orbits the Sun in about 365.2422 days, not exactly 365. Without correction, the calendar would drift roughly one day every four years, and seasons would slowly slide through the year. Leap days keep the equinoxes and solstices anchored to the same dates century after century." },
    { question: "Why is the ÷400 exception needed?", answer: "Adding a leap day every 4 years over-corrects: 365.25 days overshoots the true year by about 11 minutes a year. Dropping the leap day on century years (÷100) fixes most of it, and restoring it on ÷400 years fixes the remainder — the Gregorian calendar's average year is 365.2425 days, accurate to one day in ~3,300 years." },
    { question: "Which countries use the Gregorian leap rule?", answer: "Most of the world adopted the Gregorian calendar between the 16th and 20th centuries — it was introduced by Pope Gregory XIII in 1582, adopted in Britain and its colonies in 1752, and in much of Asia in the 19th and 20th centuries. Some countries (e.g., Ethiopia, and several lunar-calendar cultures) follow different rules entirely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Leap Year Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Leap Year Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="year" className={lbl}>Year</label>
              <div className={inp}>
                <input id="year" type="number" min="1" max="9999" step="1" value={inputs.year} onChange={(e) => set("year")(e.target.value)} className={ci} />
              </div>
              {errors.year && <p className="text-xs text-red-500 font-medium mt-1">{errors.year}</p>}
            </div>

            {/* ADVANCED OPTIONS */}
            <div className="border-t border-border pt-3">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Day of Year</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="month" className={lbl}>Month</label>
                        <select id="month" value={inputs.month} onChange={(e) => set("month")(e.target.value)} className={sel}>
                          {MONTH_NAMES.map((n, idx) => (
                            <option key={idx} value={String(idx + 1)}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="day" className={lbl}>Day</label>
                        <div className={inp}>
                          <input id="day" type="number" min="1" max="31" step="1" value={inputs.day} onChange={(e) => set("day")(e.target.value)} className={ci} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Year Status</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.statusLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${inputs.year} has ${result.daysInYear} days — February gets ${result.febDays}.` : "Enter a valid year."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Days in Year", result ? `${result.daysInYear}` : "—"],
                ["February Days", result ? `${result.febDays}` : "—"],
                ["Next Leap Year", result ? `${result.nextLeap}` : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Leap Rule Check</h3>
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
              <h3 className="text-base font-bold mb-4">Days per Month</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result?.monthDays ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={0} angle={-35} textAnchor="end" height={55} />
                  <YAxis domain={[0, 31]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip formatter={(v: number) => `${v} days`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="days" radius={[4, 4, 0, 0]}>
                    {(result?.monthDays ?? []).map((d, idx) => (
                      <Cell key={idx} fill={d.highlight ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">February is the only month that changes — {result ? `${result.febDays} days in ${inputs.year}` : "28 or 29 days depending on the year"}.</p>
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
            <h2 className="text-2xl font-bold mb-3">One Extra Day Every Four Years</h2>
            <p>A leap year adds February 29 so the calendar year stays in sync with the solar year. The rule that decides it has exactly three clauses: the year must be divisible by 4; if it is also divisible by 100 it must additionally be divisible by 400. That triple test is what separates 2024 (leap), 1900 (common), and 2000 (leap).</p>
            <h2 className="text-2xl font-bold mb-3">The Drift the Rule Fixes</h2>
            <p>The Earth's orbit takes 365.2422 days. A 365-day calendar loses almost a quarter-day each year, so seasons would drift a full month every 120 years — Christmas would eventually fall in summer. Adding a leap day every four years (365.25) overshoots slightly, and the century exceptions fine-tune the average to 365.2425 days, accurate to about one day in 3,300 years.</p>
            <h2 className="text-2xl font-bold mb-3">Leap-Day Trivia</h2>
            <p>Someone born on February 29 celebrates their "real" birthday only in leap years — about 5 million people worldwide are leap-day babies, roughly a 1-in-1,461 chance for any birth date. Contracts and software that handle dates have special rules for the day, which is why date libraries treat February 29 so carefully.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/leap-year-calculator" />
          <PopularCalculators exclude="/calculator/leap-year-calculator" />
        </div>
      </div>
    </>
  );
}
