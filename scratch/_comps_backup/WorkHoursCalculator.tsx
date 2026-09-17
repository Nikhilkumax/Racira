"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface WorkHoursInputs {
  ih: string;
  im: string;
  iap: string;
  oh: string;
  om: string;
  oap: string;
  brk: string;
  days: string;
  stdDay: string;
}

interface WorkHoursResults {
  workedMinutes: number;
  workedLabel: string;
  decimalHours: number;
  weeklyMinutes: number;
  weeklyLabel: string;
  overtimeMinutes: number;
  overtimeLabel: string;
  spanMinutes: number;
  spanLabel: string;
  clockInLabel: string;
  clockOutLabel: string;
  chartData: { name: string; hours: number; highlighted: boolean }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function toMinutes(h: number, m: number, ap: string): number {
  let hh = h % 12;
  if (ap === "pm") hh += 12;
  return hh * 60 + m;
}

function fmtHrs(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function fmtClock(totalMin: number): string {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function calcWorkHours(i: WorkHoursInputs): WorkHoursResults | null {
  const ih = parseInt(i.ih, 10), im = parseInt(i.im, 10), oh = parseInt(i.oh, 10), om = parseInt(i.om, 10);
  const brk = parseInt(i.brk, 10), days = parseInt(i.days, 10), stdDay = parseFloat(i.stdDay);
  if (isNaN(ih) || isNaN(im) || isNaN(oh) || isNaN(om) || isNaN(brk) || isNaN(days) || isNaN(stdDay)) return null;

  const clockIn = toMinutes(ih, im, i.iap);
  const clockOut = toMinutes(oh, om, i.oap);
  const spanMinutes = clockOut > clockIn ? clockOut - clockIn : clockOut + 24 * 60 - clockIn;
  const workedMinutes = Math.max(0, spanMinutes - brk);
  const weeklyMinutes = workedMinutes * days;
  const stdDayMinutes = stdDay * 60;
  const overtimeMinutes = workedMinutes - stdDayMinutes;

  const clockInLabel = fmtClock(clockIn) + (i.iap === "pm" ? " PM" : " AM");
  const clockOutLabel = fmtClock(clockOut) + (i.oap === "pm" ? " PM" : " AM");

  const chartData = [
    { name: "Standard Day", hours: stdDayMinutes / 60, highlighted: false },
    { name: "Worked Today", hours: workedMinutes / 60, highlighted: true },
  ];

  const breakdown = [
    { label: "Clock In", value: clockInLabel },
    { label: "Clock Out", value: clockOutLabel },
    { label: "Span on Clock", value: fmtHrs(spanMinutes) },
    { label: "Break", value: `${brk} min` },
    { label: "Worked Hours", value: fmtHrs(workedMinutes), highlight: true, isTotal: true },
    { label: "Decimal Hours", value: `${(workedMinutes / 60).toFixed(2)} hrs` },
    { label: "Days per Week", value: `${days}` },
    { label: "Weekly Hours", value: fmtHrs(weeklyMinutes) },
    { label: "Standard Day", value: `${stdDay} hrs` },
    { label: "Overtime / Undertime", value: overtimeMinutes === 0 ? "None" : `${overtimeMinutes > 0 ? "+" : "−"}${fmtHrs(Math.abs(overtimeMinutes))}` },
  ];

  const summaryStats = [
    { label: "Worked Hours", value: fmtHrs(workedMinutes) },
    { label: "Decimal Hours", value: `${(workedMinutes / 60).toFixed(2)} hrs` },
    { label: "Weekly Hours", value: fmtHrs(weeklyMinutes) },
    { label: "Overtime / Undertime", value: overtimeMinutes === 0 ? "None" : `${overtimeMinutes > 0 ? "+" : "−"}${fmtHrs(Math.abs(overtimeMinutes))}` },
    { label: "Span on Clock", value: fmtHrs(spanMinutes) },
    { label: "Break", value: `${brk} min` },
    { label: "Clock In", value: clockInLabel },
    { label: "Clock Out", value: clockOutLabel },
  ];

  return {
    workedMinutes,
    workedLabel: fmtHrs(workedMinutes),
    decimalHours: workedMinutes / 60,
    weeklyMinutes,
    weeklyLabel: fmtHrs(weeklyMinutes),
    overtimeMinutes,
    overtimeLabel: overtimeMinutes === 0 ? "None" : `${overtimeMinutes > 0 ? "+" : "−"}${fmtHrs(Math.abs(overtimeMinutes))}`,
    spanMinutes,
    spanLabel: fmtHrs(spanMinutes),
    clockInLabel,
    clockOutLabel,
    chartData,
    breakdown,
    summaryStats,
  };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: WorkHoursInputs = { ih: "9", im: "00", iap: "am", oh: "5", om: "30", oap: "pm", brk: "30", days: "5", stdDay: "8" };

// 4. Component
export default function WorkHoursCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<WorkHoursResults | null>(() => calcWorkHours(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcWorkHours(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcWorkHours(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcWorkHours(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const ih = parseInt(inputs.ih, 10), im = parseInt(inputs.im, 10), oh = parseInt(inputs.oh, 10), om = parseInt(inputs.om, 10);
  const brk = parseInt(inputs.brk, 10), days = parseInt(inputs.days, 10);
  if (isNaN(ih) || ih < 1 || ih > 12) errors.ih = "1–12";
  if (isNaN(im) || im < 0 || im > 59) errors.im = "0–59";
  if (isNaN(oh) || oh < 1 || oh > 12) errors.oh = "1–12";
  if (isNaN(om) || om < 0 || om > 59) errors.om = "0–59";
  if (isNaN(brk) || brk < 0 || brk > 600) errors.brk = "0–600 min";
  if (isNaN(days) || days < 1 || days > 7) errors.days = "1–7";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const renderClock = (label: string, hk: keyof typeof DEFAULTS, mk: keyof typeof DEFAULTS, apk: keyof typeof DEFAULTS, errKey: "ih" | "oh") => (
    <div>
      <label className={lbl}>{label}</label>
      <div className="flex gap-2">
        <div className={inp}>
          <input type="number" min="1" max="12" value={inputs[hk]} onChange={(e) => set(hk)(e.target.value)} className={ci} aria-label={`${label} hour`} />
        </div>
        <span className="text-muted-foreground text-sm self-center shrink-0">:</span>
        <div className={inp}>
          <input type="number" min="0" max="59" value={inputs[mk]} onChange={(e) => set(mk)(e.target.value)} className={ci} aria-label={`${label} minute`} />
        </div>
        <select value={inputs[apk]} onChange={(e) => set(apk)(e.target.value)} className={`${sel} w-20 shrink-0`} aria-label={`${label} AM/PM`}>
          <option value="am">AM</option>
          <option value="pm">PM</option>
        </select>
      </div>
      {errors[errKey] && <p className="text-xs text-red-500 font-medium mt-1">{errors[errKey]}</p>}
    </div>
  );

  const faqs = [
    { question: "How do I calculate my work hours with a break?", answer: "Convert clock-in and clock-out to minutes past midnight, subtract to get the span on the clock, then subtract the break. A 9:00 AM to 5:30 PM shift with a 30-minute lunch is 510 minutes minus 30 — 8 hours of paid work." },
    { question: "What happens if I work past midnight?", answer: "If the clock-out time is numerically earlier than clock-in, the calculator assumes the shift crosses midnight and adds 24 hours to the span. A 10:00 PM to 6:00 AM night shift correctly becomes 8 hours on the clock before the break is subtracted." },
    { question: "How is overtime calculated?", answer: "Overtime (or undertime) is the worked hours minus the standard day, which defaults to 8 hours and is adjustable in Advanced Options. If you work 9 hours and 15 minutes, overtime is +1:15; if you work 7 hours, it is −1:00 undertime. Weekly totals simply multiply the daily figure by the days-per-week input." },
    { question: "What counts as paid work time?", answer: "Generally, time between clock-in and clock-out minus unpaid breaks (lunch, personal time) counts as paid. Short paid rest breaks (15 minutes) usually count as work time under labor rules — deduct only the unpaid breaks from the span, which is why the break input exists." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Work Hours Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Work Hours Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {renderClock("Clock In", "ih", "im", "iap", "ih")}
              {renderClock("Clock Out", "oh", "om", "oap", "oh")}
              <div>
                <label htmlFor="brk" className={lbl}>Break</label>
                <div className={inp}>
                  <input id="brk" type="number" min="0" max="600" step="5" value={inputs.brk} onChange={(e) => set("brk")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.brk && <p className="text-xs text-red-500 font-medium mt-1">{errors.brk}</p>}
              </div>
              <div>
                <label htmlFor="days" className={lbl}>Days per Week</label>
                <div className={inp}>
                  <input id="days" type="number" min="1" max="7" step="1" value={inputs.days} onChange={(e) => set("days")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">days</span>
                </div>
                {errors.days && <p className="text-xs text-red-500 font-medium mt-1">{errors.days}</p>}
              </div>
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Overtime Baseline</div>
                    <label htmlFor="stdDay" className={lbl}>Standard Day</label>
                    <div className={inp}>
                      <input id="stdDay" type="number" min="1" max="16" step="0.5" value={inputs.stdDay} onChange={(e) => set("stdDay")(e.target.value)} className={ci} />
                      <span className="pr-3 text-muted-foreground text-sm">hrs</span>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Worked Hours (Today)</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.workedLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${result.clockInLabel} → ${result.clockOutLabel}, minus ${inputs.brk} min break` : "Enter valid times."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Decimal Hours", result ? `${result.decimalHours.toFixed(2)} hrs` : "—"],
                ["Weekly Hours", result ? result.weeklyLabel : "—"],
                ["Overtime", result ? result.overtimeLabel : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Shift Detail</h3>
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
              <h3 className="text-base font-bold mb-4">Standard Day vs. Worked Today</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result?.chartData ?? []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} tickFormatter={(v: number) => `${v}h`} />
                  <Tooltip formatter={(v: number) => `${v.toFixed(2)} hrs`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {(result?.chartData ?? []).map((d, idx) => (
                      <Cell key={idx} fill={d.highlighted ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.3)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Compare the worked time against the standard day to see overtime at a glance.</p>
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
            <h2 className="text-2xl font-bold mb-3">From Clock Times to Paid Hours</h2>
            <p>Work hours are not the same as time on the clock — breaks sit inside the span but outside the pay. The standard sequence is: convert clock-in and clock-out to minutes past midnight, subtract to get the span, then subtract the unpaid break. A 9:00–5:30 shift with a 30-minute lunch yields 8.0 paid hours; with a 15-minute break it yields 8.25.</p>
            <h2 className="text-2xl font-bold mb-3">Overnight Shifts and the 24-Hour Wrap</h2>
            <p>Night shifts cross midnight, so a naive subtraction goes negative. Timekeeping convention fixes this by adding 24 hours whenever the clock-out reading is smaller than the clock-in reading — 10:00 PM to 6:00 AM becomes an 8-hour span, and the break deduction then applies normally. The calculator does this wrap automatically.</p>
            <h2 className="text-2xl font-bold mb-3">Overtime Starts at the Baseline</h2>
            <p>Overtime is defined relative to a standard day — typically 8 hours, adjustable in Advanced Options. Worked hours above the baseline are overtime; below are undertime. Weekly totals multiply the daily figure by days worked, giving a quick check against full-time thresholds and shift targets without a spreadsheet.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/work-hours-calculator" />
          <PopularCalculators exclude="/calculator/work-hours-calculator" />
        </div>
      </div>
    </>
  );
}
