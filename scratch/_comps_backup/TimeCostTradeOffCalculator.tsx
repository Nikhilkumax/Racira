"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  normalDuration: string;
  normalCost: string;
  crashDuration: string;
  crashCost: string;
  targetDuration: string;
  delayPenaltyPerDay: string;
  incentivePerDay: string;
}

interface Result {
  normalDuration: number;
  crashDuration: number;
  maxCrashDays: number;
  crashCostPerDay: number;
  availableCrashDays: number;
  crashPremium: number;
  penaltySaved: number;
  incentiveEarned: number;
  netBenefit: number;
  optimalDuration: number;
  recommendation: string;
}

const DEFAULTS: Inputs = {
  normalDuration: "120",
  normalCost: "600000",
  crashDuration: "90",
  crashCost: "720000",
  targetDuration: "100",
  delayPenaltyPerDay: "8000",
  incentivePerDay: "5000",
};

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

function calculate(inputs: Inputs): Result {
  const normalDuration = Math.max(0, parseFloat(inputs.normalDuration) || 0);
  const normalCost = Math.max(0, parseFloat(inputs.normalCost) || 0);
  const crashDuration = Math.max(0, parseFloat(inputs.crashDuration) || 0);
  const crashCost = Math.max(0, parseFloat(inputs.crashCost) || 0);
  const targetDuration = Math.max(0, parseFloat(inputs.targetDuration) || 0);
  const delayPenaltyPerDay = Math.max(0, parseFloat(inputs.delayPenaltyPerDay) || 0);
  const incentivePerDay = Math.max(0, parseFloat(inputs.incentivePerDay) || 0);

  const maxCrashDays = Math.max(0, normalDuration - crashDuration);
  const crashCostPerDay = maxCrashDays > 0 ? (crashCost - normalCost) / maxCrashDays : 0;
  const availableCrashDays = Math.max(0, Math.min(normalDuration - targetDuration, maxCrashDays));
  const crashPremium = availableCrashDays * crashCostPerDay;
  const daysSaved = availableCrashDays;
  const penaltySaved = daysSaved * delayPenaltyPerDay;
  const incentiveEarned = daysSaved * incentivePerDay;
  const netBenefit = penaltySaved + incentiveEarned - crashPremium;

  let optimalDuration = normalDuration;
  if (crashCostPerDay < delayPenaltyPerDay + incentivePerDay && maxCrashDays > 0) {
    optimalDuration = Math.max(targetDuration, crashDuration);
  }

  let recommendation = "No crash — keeping the normal schedule is cheapest.";
  if (netBenefit > 0) {
    recommendation = `Crash by ${fmt(availableCrashDays)} days to ${fmt(optimalDuration)} days — net benefit ${fmtMoney(netBenefit)}.`;
  } else if (availableCrashDays > 0) {
    recommendation = "Crashing is more expensive than the penalties and incentives justify — hold the normal schedule.";
  }

  return { normalDuration, crashDuration, maxCrashDays, crashCostPerDay, availableCrashDays, crashPremium, penaltySaved, incentiveEarned, netBenefit, optimalDuration, recommendation };
}

const NumInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const TimeCostTradeOffCalculator = () => {
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
    num(inputs.normalDuration) < 0 || num(inputs.normalCost) < 0 ||
    num(inputs.crashDuration) < 0 || num(inputs.crashCost) < 0 ||
    num(inputs.targetDuration) < 0 || num(inputs.delayPenaltyPerDay) < 0 ||
    num(inputs.incentivePerDay) < 0;

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
    { label: "Normal Duration", value: `${fmt(result.normalDuration)} days` },
    { label: "Normal Cost", value: fmtMoney(result.normalDuration > 0 ? num(inputs.normalCost) : 0) },
    { label: "Crash Duration", value: `${fmt(result.crashDuration)} days` },
    { label: "Crash Cost", value: fmtMoney(num(inputs.crashCost)) },
    { label: "Max Crash Days", value: fmt(result.maxCrashDays) },
    { label: "Crash Cost per Day", value: fmt2(result.crashCostPerDay) },
    { label: "Target Duration", value: `${fmt(num(inputs.targetDuration))} days` },
    { label: "Available Crash Days", value: fmt(result.availableCrashDays) },
    { label: "Crash Premium", value: fmtMoney(result.crashPremium) },
    { label: "Penalties Avoided", value: fmtMoney(result.penaltySaved) },
    { label: "Incentives Earned", value: fmtMoney(result.incentiveEarned) },
    { label: "Recommended Duration", value: `${fmt(result.optimalDuration)} days` },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="normal-duration" label="Normal Duration" value={inputs.normalDuration} onChange={set("normalDuration")} suffix="days" />
            <NumInput id="normal-cost" label="Normal Cost" value={inputs.normalCost} onChange={set("normalCost")} prefix="$" />
            <NumInput id="crash-duration" label="Crash Duration" value={inputs.crashDuration} onChange={set("crashDuration")} suffix="days" />
            <NumInput id="crash-cost" label="Crash Cost" value={inputs.crashCost} onChange={set("crashCost")} prefix="$" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Schedule Incentives</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="target-duration" label="Target Duration" value={inputs.targetDuration} onChange={set("targetDuration")} suffix="days" />
                  <NumInput id="penalty" label="Delay Penalty / Day" value={inputs.delayPenaltyPerDay} onChange={set("delayPenaltyPerDay")} prefix="$" />
                  <NumInput id="incentive" label="Incentive / Day" value={inputs.incentivePerDay} onChange={set("incentivePerDay")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter non-negative values for all fields.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Net Benefit of Crashing</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.netBenefit)}</div>
            <div className="text-sm text-muted-foreground mt-1">{result.recommendation}</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Crash Cost / Day</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.crashCostPerDay)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Available Crash Days</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt(result.availableCrashDays)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Recommended Duration</div>
              <div className="text-lg font-bold mt-1">{fmt(result.optimalDuration)} days</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Time-Cost Trade-Off Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Net Benefit</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.netBenefit)}</td>
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
                <div className="text-xs text-muted-foreground">Net Benefit</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.netBenefit)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Time-Cost Trade-Off?</h2>
            <p className="text-muted-foreground leading-relaxed">The time-cost trade-off is the classic project management decision of whether to spend more money to finish sooner. In normal conditions a project runs at its planned duration and planned cost; crashing compresses the schedule by adding resources — overtime, extra crews, expedited materials, parallel work — which raises cost but pulls the finish date in. The decision is economic: crash only as long as the cost of saving a day is less than the value of that day, where the value comes from penalties avoided on a late finish and incentives earned for an early one. The marginal cost of crashing rises as the schedule compresses, so the rational plan crashes the cheapest days first and stops when the next day costs more than it returns.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Trade-Off Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator starts from the normal schedule — duration and cost — and the fully crashed schedule — the shortest achievable duration and the cost of achieving it. The difference in duration is the maximum crash capacity, and the difference in cost divided by that capacity is the crash cost per day: the premium paid for each day saved. The available crash days are the days needed to hit the target duration, capped at the maximum crash capacity. The crash premium is the available days times the cost per day; the penalty savings and incentive earnings are the available days times the contract's per-day penalty and incentive rates. The net benefit subtracts the premium from the combined penalty savings and incentives — a positive number means crashing pays, a negative number means the normal schedule is cheaper. The recommended duration reflects whether the crash is justified all the way to the target or only partway.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Read the net benefit together with the crash cost per day: the per-day figure is the decision threshold for every individual acceleration move, so a project team can use it to approve or reject each overtime request in real time. If the net benefit is positive, the crash is worth executing to the recommended duration; if negative, hold the normal schedule and absorb the penalties — paying them is cheaper than the crash. Watch the available crash days line: when the target is within reach of the crash capacity, the model will usually recommend the full crash; when the target sits beyond the crash limit, the crash can only narrow the gap, and the residual penalty still applies. Sensitivity is worth checking — re-run the model with the penalty and incentive inputs a few percent higher and lower, because contract values often get renegotiated once a delay is visible. In multi-activity projects, apply the same arithmetic activity by activity: crash the critical-path tasks with the lowest cost per day first, and stop when the marginal day costs more than the marginal benefit. That greedy rule is exactly what the model implements for the whole schedule, so teams can extend the logic from the project level to individual work packages without changing the method.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/time-cost-trade-off-calculator" />
      </div>
    </div>
  );
};

export default TimeCostTradeOffCalculator;