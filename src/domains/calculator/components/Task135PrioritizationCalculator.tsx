"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  bigHours: string;
  mediumCount: string;
  mediumMinutes: string;
  smallCount: string;
  smallMinutes: string;
  availableHours: string;
  interruptionMinutes: string;
}

interface Result {
  bigMinutes: number;
  mediumMinutes: number;
  smallMinutes: number;
  subtotalMinutes: number;
  interruptionMinutes: number;
  totalMinutes: number;
  totalHours: number;
  availableMinutes: number;
  feasibilityPct: number;
  fitsDay: boolean;
  overUnderMinutes: number;
  totalTasks: number;
  bigSharePct: number;
}

const DEFAULTS: Inputs = {
  bigHours: "2",
  mediumCount: "3",
  mediumMinutes: "45",
  smallCount: "5",
  smallMinutes: "15",
  availableHours: "8",
  interruptionMinutes: "30",
};

function calculate(inputs: Inputs): Result {
  const bigHours = Math.max(0, parseFloat(inputs.bigHours) || 0);
  const mediumCount = Math.max(0, parseInt(inputs.mediumCount) || 0);
  const mediumMinutes = Math.max(0, parseFloat(inputs.mediumMinutes) || 0);
  const smallCount = Math.max(0, parseInt(inputs.smallCount) || 0);
  const smallMinutes = Math.max(0, parseFloat(inputs.smallMinutes) || 0);
  const availableHours = Math.max(0, parseFloat(inputs.availableHours) || 0);
  const interruptionMinutes = Math.max(0, parseFloat(inputs.interruptionMinutes) || 0);

  const bigMinutes = bigHours * 60;
  const mediumTotal = mediumCount * mediumMinutes;
  const smallTotal = smallCount * smallMinutes;
  const subtotalMinutes = bigMinutes + mediumTotal + smallTotal;
  const totalMinutes = subtotalMinutes + interruptionMinutes;
  const totalHours = totalMinutes / 60;
  const availableMinutes = availableHours * 60;
  const feasibilityPct = availableMinutes > 0 ? (totalMinutes / availableMinutes) * 100 : 0;
  const fitsDay = availableMinutes <= 0 || totalMinutes <= availableMinutes;
  const overUnderMinutes = availableMinutes - totalMinutes;
  const totalTasks = mediumCount + smallCount + (bigHours > 0 ? 1 : 0);
  const bigSharePct = totalMinutes > 0 ? (bigMinutes / totalMinutes) * 100 : 0;

  return { bigMinutes, mediumMinutes: mediumTotal, smallMinutes: smallTotal, subtotalMinutes, interruptionMinutes, totalMinutes, totalHours, availableMinutes, feasibilityPct, fitsDay, overUnderMinutes, totalTasks, bigSharePct };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmt1 = (n: number) => fmt(n, 1);

const NumInput = ({ id, label, value, onChange, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const Task135PrioritizationCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.bigHours) < 0 ||
    num(inputs.mediumCount) < 0 ||
    num(inputs.mediumMinutes) < 0 ||
    num(inputs.smallCount) < 0 ||
    num(inputs.smallMinutes) < 0 ||
    num(inputs.availableHours) <= 0 ||
    num(inputs.interruptionMinutes) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: "Big Task (1)", value: `${fmt(result.bigMinutes)} min` },
    { label: `Medium Tasks (${num(inputs.mediumCount)})`, value: `${fmt(result.mediumMinutes)} min` },
    { label: `Small Tasks (${num(inputs.smallCount)})`, value: `${fmt(result.smallMinutes)} min` },
    { label: "Planned Task Time", value: `${fmt(result.subtotalMinutes)} min` },
    { label: "Interruptions & Buffer", value: `${fmt(result.interruptionMinutes)} min` },
    { label: "Total Planned Time", value: `${fmt1(result.totalHours)} hrs (${fmt(result.totalMinutes)} min)` },
    { label: "Available Time Today", value: `${fmt1(num(inputs.availableHours))} hrs (${fmt(result.availableMinutes)} min)` },
    { label: "Day Utilization", value: `${fmt1(result.feasibilityPct)}%` },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="big-hours" label="Big Task Time" value={inputs.bigHours} onChange={set("bigHours")} suffix="hrs" />
            <NumInput id="medium-count" label="Medium Tasks" value={inputs.mediumCount} onChange={set("mediumCount")} suffix="tasks" />
            <NumInput id="medium-minutes" label="Time per Medium Task" value={inputs.mediumMinutes} onChange={set("mediumMinutes")} suffix="min" />
            <NumInput id="small-count" label="Small Tasks" value={inputs.smallCount} onChange={set("smallCount")} suffix="tasks" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Day Structure</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="small-minutes" label="Time per Small Task" value={inputs.smallMinutes} onChange={set("smallMinutes")} suffix="min" />
                  <NumInput id="available-hours" label="Available Hours Today" value={inputs.availableHours} onChange={set("availableHours")} suffix="hrs" />
                  <NumInput id="interruption-minutes" label="Interruptions & Buffer" value={inputs.interruptionMinutes} onChange={set("interruptionMinutes")} suffix="min" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — available hours must be greater than zero.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Planned Time</div>
            <div className="text-4xl font-bold text-primary">{fmt1(result.totalHours)} hrs</div>
            <div className="text-sm text-muted-foreground mt-1">for {result.totalTasks} tasks across all three tiers</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Tasks Planned</div>
              <div className="text-lg font-bold mt-1">{result.totalTasks}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Big Task Share</div>
              <div className="text-lg font-bold mt-1">{fmt1(result.bigSharePct)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Day Utilization</div>
              <div className={`text-lg font-bold mt-1 ${result.feasibilityPct <= 100 ? "text-emerald-600" : "text-red-600"}`}>{fmt1(result.feasibilityPct)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Time Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Planned Time</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt1(result.totalHours)} hrs</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">Total Planned Time</div>
                <div className="text-base font-bold text-primary">{fmt1(result.totalHours)} hrs</div>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-sm border ${result.fitsDay ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
            {result.fitsDay
              ? `This plan fits your day with ${fmt(result.overUnderMinutes)} minutes to spare.`
              : `This plan overruns your available time by ${fmt(Math.abs(result.overUnderMinutes))} minutes — trim a tier or extend the day.`}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the 1-3-5 Method?</h2>
            <p className="text-muted-foreground leading-relaxed">The 1-3-5 method is a daily planning system built on a deliberately small structure: one big task that must be completed, three medium tasks that move meaningful projects forward, and five small tasks that clear the little things. The method exists because unconstrained to-do lists fail in a predictable way — everything on the list looks equally urgent, the big task gets postponed because it feels heavy, and the day ends with ten half-finished items instead of one finished one. By capping the plan at nine items and forcing a single headline task, the 1-3-5 method turns planning into triage: the big task defines the day's real objective, the three medium tasks protect progress on secondary goals, and the five small tasks keep logistics from rotting. This calculator applies a time budget to that structure, so you can see not just what is on the list but whether the list fits the hours you actually have. The one-big-task rule is the part people skip first, which is exactly why the big task gets its own dedicated time input and its own share-of-day statistic in the results.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Time Budget Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculation converts each tier of the plan into minutes and stacks them into a single daily budget. The big task is entered in hours and converted to minutes — two hours becomes 120 minutes. The medium tier multiplies the number of medium tasks by the minutes allotted to each one, so three tasks at 45 minutes each contribute 135 minutes. The small tier works the same way, five tasks at 15 minutes each adding 75 minutes. The three tier subtotals sum to the planned task time, and the interruption buffer — a reserve for email, meetings, and the unplanned — is added on top to produce the total planned time for the day. The feasibility check then divides that total by the available working hours: a 5.5-hour plan inside an 8-hour day is 68.75 percent utilization, leaving a visible buffer; a plan that exceeds the available hours goes over 100 percent and is flagged. The big-task share divides the big task's minutes by the total planned time, showing how much of the day the headline objective consumes — the statistic that keeps the method honest, because a plan with a small big-task share is usually a plan that deferred the real work. Every row in the breakdown traces back to one of the inputs, so adjusting the buffer, the task counts, or the per-task times flows through to the total, the utilization, and the final fit verdict in a single calculation.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Read the results in one glance: the total planned time tells you whether the day is realistically full, and the fit banner at the bottom gives the verdict — spare minutes if the plan fits, or an overrun figure if it does not. When the plan overruns, the breakdown shows exactly which tier to cut: reducing the interruption buffer and the small-task time are the least costly levers, while shrinking the big task means renegotiating the day's real objective. The big-task share deserves deliberate attention — if the headline task consumes less than a third of the day, the plan is probably weighted toward small wins, and the method's entire premise is that the big task comes first. The day-utilization figure has a practical ceiling: sustained plans above 85 percent of available time leave no room for the interruptions that always arrive, which is why the buffer input exists and why the default plan sits comfortably below capacity. Re-run the calculation whenever scope changes mid-day — the calculator is designed to be rebalanced, not just built once in the morning. Used daily, the 1-3-5 structure turns an overwhelming list into a bounded, reviewable plan, and the time budget makes the trade-offs explicit before you commit to the day rather than after it has escaped you.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/1-3-5-task-prioritization-calculator" />
      </div>
    </div>
  );
};

export default Task135PrioritizationCalculator;