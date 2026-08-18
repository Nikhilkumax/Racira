"use client";
import { useState, useEffect } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface PomodoroInputs {
  focusMin: number;
  shortMin: number;
  longMin: number;
  sessions: number;
  perCycle: number;
  startTime: string;
}

interface ChartPoint {
  name: string;
  minutes: number;
}

interface PomodoroResults {
  totalFocusMin: number;
  totalShortMin: number;
  totalLongMin: number;
  totalBreakMin: number;
  totalMinutes: number;
  longBreaks: number;
  shortBreaks: number;
  finishTime: string;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
function addMinutes(time: string, minutes: number): string {
  const m = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "—";
  let total = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + minutes) % (24 * 60);
  const h = Math.floor(total / 60);
  const min = total % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

function calcPomodoro(i: PomodoroInputs): PomodoroResults {
  const sessions = Math.max(0, Math.round(i.sessions));
  const perCycle = Math.max(1, Math.round(i.perCycle));
  const totalBreaks = sessions > 0 ? sessions - 1 : 0;
  const longBreaks = perCycle > 0 ? Math.floor(totalBreaks / perCycle) : 0;
  const shortBreaks = Math.max(0, totalBreaks - longBreaks);
  const totalFocusMin = sessions * i.focusMin;
  const totalShortMin = shortBreaks * i.shortMin;
  const totalLongMin = longBreaks * i.longMin;
  const totalBreakMin = totalShortMin + totalLongMin;
  const totalMinutes = totalFocusMin + totalBreakMin;
  const finishTime = addMinutes(i.startTime || "09:00", totalMinutes);

  const chartData: ChartPoint[] = [
    { name: "Focus Time", minutes: totalFocusMin },
    { name: "Short Breaks", minutes: totalShortMin },
    { name: "Long Breaks", minutes: totalLongMin },
  ];

  const breakdown = [
    { label: "Work Sessions", value: `${sessions}` },
    { label: "Focus Length", value: `${i.focusMin} min` },
    { label: "Short Break", value: `${i.shortMin} min` },
    { label: "Long Break (after cycle)", value: `${i.longMin} min` },
    { label: "Sessions per Cycle", value: `${perCycle}` },
    { label: "Short Breaks Taken", value: `${shortBreaks}` },
    { label: "Long Breaks Taken", value: `${longBreaks}` },
    { label: "Total Focus Time", value: formatDuration(totalFocusMin) },
    { label: "Total Break Time", value: formatDuration(totalBreakMin) },
    { label: "Total Session Time", value: formatDuration(totalMinutes), isTotal: true },
    { label: "Finish Time", value: finishTime, highlight: true },
  ];

  const summaryStats = [
    { label: "Total Time", value: formatDuration(totalMinutes) },
    { label: "Focus Time", value: formatDuration(totalFocusMin) },
    { label: "Break Time", value: formatDuration(totalBreakMin) },
    { label: "Sessions", value: `${sessions}` },
    { label: "Long Breaks", value: `${longBreaks}` },
    { label: "Short Breaks", value: `${shortBreaks}` },
    { label: "Start Time", value: i.startTime || "09:00" },
    { label: "Finish Time", value: finishTime },
  ];

  return { totalFocusMin, totalShortMin, totalLongMin, totalBreakMin, totalMinutes, longBreaks, shortBreaks, finishTime, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULTS = {
  focusMin: "25",
  shortMin: "5",
  longMin: "15",
  sessions: "8",
  perCycle: "4",
  startTime: "09:00",
};

// 4. Component
export default function PomodoroCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);
  const [result, setResult] = useState<PomodoroResults>(() =>
    calcPomodoro({ focusMin: 25, shortMin: 5, longMin: 15, sessions: 8, perCycle: 4, startTime: "09:00" })
  );
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setResult(calcPomodoro({ focusMin: 25, shortMin: 5, longMin: 15, sessions: 8, perCycle: 4, startTime: "09:00" }));
  }, []);

  const set = (key: keyof typeof DEFAULTS) => (v: string) => setInputs((s) => ({ ...s, [key]: v }));

  const calculate = () =>
    setResult(
      calcPomodoro({
        focusMin: parseFloat(inputs.focusMin) || 0,
        shortMin: parseFloat(inputs.shortMin) || 0,
        longMin: parseFloat(inputs.longMin) || 0,
        sessions: parseFloat(inputs.sessions) || 0,
        perCycle: parseFloat(inputs.perCycle) || 4,
        startTime: inputs.startTime || "09:00",
      })
    );
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcPomodoro({ focusMin: 25, shortMin: 5, longMin: 15, sessions: 8, perCycle: 4, startTime: "09:00" }));
  };

  // Validation
  const errors: Record<string, string> = {};
  (["focusMin", "shortMin", "longMin", "sessions"] as (keyof typeof DEFAULTS)[]).forEach((k) => {
    const v = parseFloat(inputs[k]) || 0;
    if (inputs[k].trim() === "") errors[k] = "Required";
    else if (v <= 0) errors[k] = "Must be greater than 0";
  });
  if ((parseFloat(inputs.perCycle) || 0) <= 0) errors.perCycle = "Must be greater than 0";
  const hasErrors = Object.keys(errors).length > 0;

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "block text-sm font-medium mb-1";

  const faqs = [
    { question: "What is the Pomodoro Technique?", answer: "The Pomodoro Technique splits work into focused intervals (traditionally 25 minutes) separated by short breaks (5 minutes). Every four sessions, you take a longer break (15-30 minutes). The structure fights procrastination by making each session a small, completable commitment." },
    { question: "How many pomodoros should I do per day?", answer: "Most people sustainably manage 8-12 pomodoros (4-6 hours of focused work) per day. Quality matters more than quantity — a deeply focused session beats a distracted one. Build up gradually and always take the breaks; skipping them reduces long-term focus." },
    { question: "Should I use 25-minute sessions?", answer: "25 minutes is the classic default, but many people prefer 50-minute sessions with 10-minute breaks once they're in flow. The technique works best when the session length matches your attention span — adjust and measure, rather than following the number rigidly." },
    { question: "What should I do during breaks?", answer: "Get away from the screen: stand, stretch, walk, or rest your eyes. Avoid starting another task or checking distracting apps — the break is for recovery, not multitasking. Use long breaks for a real reset like a short walk or a snack." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Pomodoro Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pomodoro Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="focus" className={lbl}>Focus Length</label>
                <div className={inp}>
                  <input id="focus" type="number" min="1" value={inputs.focusMin} onChange={(e) => set("focusMin")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.focusMin && <p className="text-xs text-red-500 font-medium mt-1">{errors.focusMin}</p>}
              </div>
              <div>
                <label htmlFor="short" className={lbl}>Short Break</label>
                <div className={inp}>
                  <input id="short" type="number" min="1" value={inputs.shortMin} onChange={(e) => set("shortMin")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.shortMin && <p className="text-xs text-red-500 font-medium mt-1">{errors.shortMin}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="long" className={lbl}>Long Break</label>
                <div className={inp}>
                  <input id="long" type="number" min="1" value={inputs.longMin} onChange={(e) => set("longMin")(e.target.value)} className={ci} />
                  <span className="pr-3 text-muted-foreground text-sm">min</span>
                </div>
                {errors.longMin && <p className="text-xs text-red-500 font-medium mt-1">{errors.longMin}</p>}
              </div>
              <div>
                <label htmlFor="sessions" className={lbl}>Number of Sessions</label>
                <div className={inp}>
                  <input id="sessions" type="number" min="1" value={inputs.sessions} onChange={(e) => set("sessions")(e.target.value)} className={ci} />
                </div>
                {errors.sessions && <p className="text-xs text-red-500 font-medium mt-1">{errors.sessions}</p>}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cycle & Schedule</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="cycle" className={lbl}>Sessions per Cycle</label>
                        <div className={inp}>
                          <input id="cycle" type="number" min="1" value={inputs.perCycle} onChange={(e) => set("perCycle")(e.target.value)} className={ci} />
                        </div>
                        {errors.perCycle && <p className="text-xs text-red-500 font-medium mt-1">{errors.perCycle}</p>}
                      </div>
                      <div>
                        <label htmlFor="start" className={lbl}>Start Time (HH:MM)</label>
                        <div className={inp}>
                          <input id="start" type="text" value={inputs.startTime} onChange={(e) => set("startTime")(e.target.value)} className={ci} />
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Session Time</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{formatDuration(result.totalMinutes)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {result.totalFocusMin} min focus · {result.totalBreakMin} min breaks · Done by {result.finishTime}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[
                ["Focus Time", formatDuration(result.totalFocusMin)],
                ["Break Time", formatDuration(result.totalBreakMin)],
                ["Finish Time", result.finishTime],
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
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Session Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Time Allocation (Minutes)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip formatter={(v: number) => [`${v} min`, "Time"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={idx === 0 ? "hsl(var(--primary))" : idx === 1 ? "#10b981" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Planning Your Pomodoro Sessions</h2>
            <p>This calculator plans a full Pomodoro block: it counts how many short and long breaks your session count requires, adds up total focus and break time, and tells you when you'll finish. A long break is scheduled after every full cycle — with 8 sessions and a 4-session cycle, you get one long break after session four.</p>
            <h2 className="text-2xl font-bold mb-3">Tuning the Defaults</h2>
            <p>The classic 25/5/15 rhythm works well for most people, but deep-focus work often suits longer sessions. If you find yourself fighting the timer, try 50-minute sessions with 10-minute breaks. The key is consistency: decide your session length, plan your block, and protect the breaks as seriously as the focus time.</p>
            <h2 className="text-2xl font-bold mb-3">Estimating Your Day</h2>
            <p>Start by estimating how many sessions your tasks require, then set the start time to see when you'll finish. Over a week, 40 focus sessions is a strong, sustainable output — roughly 17 hours of deep work for most students and knowledge workers.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pomodoro-calculator" />
          <PopularCalculators exclude="/calculator/pomodoro-calculator" />
        </div>
      </div>
    </>
  );
}
