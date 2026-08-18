"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface TimeDiffInputs {
  sh: string;
  sm: string;
  sampm: string;
  eh: string;
  em: string;
  eampm: string;
}

interface TimeDiffResults {
  diffMinutes: number;
  diffLabel: string;
  decimalHours: number;
  startLabel: string;
  endLabel: string;
  startMinutes: number;
  endMinutes: number;
  overnight: boolean;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function toMinutes(h: number, m: number, apm: string): number {
  let hh = h % 12;
  if (apm === "pm") hh += 12;
  return hh * 60 + m;
}

function fmtLabel(totalMin: number): string {
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

function calcTimeDiff(i: TimeDiffInputs): TimeDiffResults | null {
  const sh = parseInt(i.sh, 10), sm = parseInt(i.sm, 10), eh = parseInt(i.eh, 10), em = parseInt(i.em, 10);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return null;

  const startMinutes = toMinutes(sh, sm, i.sampm);
  const endMinutes = toMinutes(eh, em, i.eampm);
  const overnight = endMinutes <= startMinutes;
  const diffMinutes = overnight ? endMinutes + 24 * 60 - startMinutes : endMinutes - startMinutes;

  const startLabel = fmtClock(startMinutes) + (i.sampm === "pm" ? " PM" : " AM");
  const endLabel = fmtClock(endMinutes) + (i.eampm === "pm" ? " PM" : " AM");

  const chartData = [
    { name: "Elapsed", value: diffMinutes },
    { name: "Remaining in Day", value: 24 * 60 - diffMinutes },
  ];

  const breakdown = [
    { label: "Start Time", value: startLabel },
    { label: "End Time", value: endLabel },
    { label: "Overnight Span", value: overnight ? "Yes (crosses midnight)" : "No" },
    { label: "Total Minutes", value: `${diffMinutes} min` },
    { label: "Decimal Hours", value: `${(diffMinutes / 60).toFixed(2)} hrs` },
    { label: "Time Difference", value: diffLabel(diffMinutes), highlight: true, isTotal: true },
  ];

  function diffLabel(d: number): string {
    const h = Math.floor(d / 60), m = d % 60;
    return h > 0 ? `${h} hr${h > 1 ? "s" : ""} ${m > 0 ? `${m} min` : ""}`.trim() : `${m} min`;
  }

  const summaryStats = [
    { label: "Time Difference", value: diffLabel(diffMinutes) },
    { label: "Decimal Hours", value: `${(diffMinutes / 60).toFixed(2)} hrs` },
    { label: "Total Minutes", value: `${diffMinutes} min` },
    { label: "Start Time", value: startLabel },
    { label: "End Time", value: endLabel },
    { label: "Overnight Span", value: overnight ? "Yes" : "No" },
    { label: "Percent of Day", value: `${((diffMinutes / 1440) * 100).toFixed(1)}%` },
    { label: "Percent of Workday", value: `${((diffMinutes / 480) * 100).toFixed(0)}%` },
  ];

  return { diffMinutes, diffLabel: diffLabel(diffMinutes), decimalHours: diffMinutes / 60, startLabel, endLabel, startMinutes, endMinutes, overnight, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS: TimeDiffInputs = { sh: "9", sm: "00", sampm: "am", eh: "5", em: "30", eampm: "pm" };

// 4. Component
export default function TimeDifferenceCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<TimeDiffResults | null>(() => calcTimeDiff(DEFAULTS));

  useEffect(() => {
    setResult(calcTimeDiff(DEFAULTS));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () => setResult(calcTimeDiff(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcTimeDiff(DEFAULTS));
  };

  // Validation
  const errors: Record<string, string> = {};
  const sh = parseInt(inputs.sh, 10), sm = parseInt(inputs.sm, 10), eh = parseInt(inputs.eh, 10), em = parseInt(inputs.em, 10);
  if (isNaN(sh) || sh < 1 || sh > 12) errors.sh = "1–12";
  if (isNaN(sm) || sm < 0 || sm > 59) errors.sm = "0–59";
  if (isNaN(eh) || eh < 1 || eh > 12) errors.eh = "1–12";
  if (isNaN(em) || em < 0 || em > 59) errors.em = "0–59";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "How do I calculate the difference between two times?", answer: "Convert both times to minutes past midnight (12-hour: hour mod 12, plus 12 if PM), then subtract the start from the end. If the end time is earlier than or equal to the start, the span crosses midnight and 24 hours are added — this calculator does that automatically." },
    { question: "Why does 12:00 AM show as 0:00 in the breakdown?", answer: "Internally, times are stored as minutes past midnight on a 24-hour clock, so midnight is 0:00 and noon is 12:00. That internal clock is what makes overnight spans add up correctly; the AM/PM inputs keep entry familiar." },
    { question: "Does this calculator handle times that cross midnight?", answer: "Yes. Enter any start and end time; if the end is earlier than the start (for example 11:00 PM to 2:00 AM), the calculator assumes the span crosses midnight and returns 3 hours instead of a negative number." },
    { question: "What is the difference between elapsed time and clock time?", answer: "Elapsed time counts duration — 8.5 hours between 9:00 AM and 5:30 PM — while clock time is a position on the day. When durations cross midnight, elapsed time can exceed the numeric difference of the clock readings, which is exactly why the calculator converts to minutes first." },
  ];

  const renderTimeField = (label: string, hid: string, mid: string, apid: string, hk: keyof typeof DEFAULTS, mk: keyof typeof DEFAULTS, apk: keyof typeof DEFAULTS, errKey: "sh" | "sm" | "eh" | "em", placeholderH: string) => (
    <div>
      <label className={lbl}>{label}</label>
      <div className="flex gap-2">
        <div className={inp}>
          <input type="number" min="1" max="12" value={inputs[hk]} onChange={(e) => set(hk)(e.target.value)} className={ci} placeholder={placeholderH} aria-label={hid} />
        </div>
        <span className="text-muted-foreground text-sm self-center shrink-0">:</span>
        <div className={inp}>
          <input type="number" min="0" max="59" value={inputs[mk]} onChange={(e) => set(mk)(e.target.value)} className={ci} placeholder="00" aria-label={mid} />
        </div>
        <select value={inputs[apk]} onChange={(e) => set(apk)(e.target.value)} className={`${sel} w-20 shrink-0`} aria-label={apid}>
          <option value="am">AM</option>
          <option value="pm">PM</option>
        </select>
      </div>
      {errors[errKey] && <p className="text-xs text-red-500 font-medium mt-1">{errors[errKey]}</p>}
    </div>
  );

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Time Difference Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Difference Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {renderTimeField("Start Time", "Start hour", "Start minute", "Start AM/PM", "sh", "sm", "sampm", "sh", "9")}
              {renderTimeField("End Time", "End hour", "End minute", "End AM/PM", "eh", "em", "eampm", "eh", "5")}
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Time Difference</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result ? result.diffLabel : "—"}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result ? `${result.startLabel} → ${result.endLabel}${result.overnight ? " (crosses midnight)" : ""}` : "Enter valid times."}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Decimal Hours", result ? `${result.decimalHours.toFixed(2)} hrs` : "—"],
                ["Total Minutes", result ? `${result.diffMinutes} min` : "—"],
                ["Percent of Day", result ? `${((result.diffMinutes / 1440) * 100).toFixed(1)}%` : "—"],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Span Detail</h3>
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
              <h3 className="text-base font-bold mb-4">Share of the 24-Hour Day</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result?.chartData ?? []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted-foreground) / 0.2)" />
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [`${fmtLabel(v)}`, n]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">The elapsed span as a share of the full 24-hour day.</p>
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
            <h2 className="text-2xl font-bold mb-3">Elapsed Time vs. Clock Time</h2>
            <p>A duration is not the same thing as a clock reading. Between 9:00 AM and 5:30 PM, the clock hands move from one position to another, but the elapsed time is a fixed quantity: 8 hours 30 minutes. Converting both readings to minutes past midnight makes the arithmetic trivial — subtract, and you have the span.</p>
            <h2 className="text-2xl font-bold mb-3">The Midnight Problem</h2>
            <p>A shift from 11:00 PM to 7:00 AM does not span −4 hours; it spans 8. The convention in timekeeping is that when the end reading is numerically smaller than the start, the span crosses midnight and a full 24 hours are added. This calculator applies that rule automatically, so overnight shifts, flights, and deadlines all work without extra mental math.</p>
            <h2 className="text-2xl font-bold mb-3">Why Minutes Are the Unit of Truth</h2>
            <p>Subtracting clock faces directly invites errors — 9:45 to 10:15 looks like 30 minutes but 9:45 to 10:05 is only 20. By normalizing everything to minutes past midnight first, the calculator sidesteps borrowing across the hour boundary entirely, and the same minutes convert cleanly to decimal hours for payroll and billing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-difference-calculator" />
          <PopularCalculators exclude="/calculator/time-difference-calculator" />
        </div>
      </div>
    </>
  );
}
