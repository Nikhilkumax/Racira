"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Workstream {
  id: number;
  cost: string;
  hours: string;
}

interface Inputs {
  workstreams: Workstream[];
  hoursPerDay: string;
}

interface Result {
  totalCost: number;
  totalHours: number;
  wacPerHour: number;
  wacPerDay: number;
  costShare: number[];
  hourShare: number[];
}

const DEFAULT_ROWS: Workstream[] = [
  { id: 1, cost: "180000", hours: "2400" },
  { id: 2, cost: "120000", hours: "1800" },
  { id: 3, cost: "90000", hours: "1500" },
  { id: 4, cost: "110000", hours: "1600" },
];

const DEFAULTS: Inputs = {
  workstreams: DEFAULT_ROWS,
  hoursPerDay: "8",
};

function calculate(inputs: Inputs): Result {
  const rows = inputs.workstreams.map((w) => ({
    cost: Math.max(0, parseFloat(w.cost) || 0),
    hours: Math.max(0, parseFloat(w.hours) || 0),
  }));
  const totalCost = rows.reduce((a, r) => a + r.cost, 0);
  const totalHours = rows.reduce((a, r) => a + r.hours, 0);
  const wacPerHour = totalHours > 0 ? totalCost / totalHours : 0;
  const hoursPerDay = Math.max(0, parseFloat(inputs.hoursPerDay) || 0);
  const wacPerDay = hoursPerDay > 0 ? wacPerHour * hoursPerDay : 0;
  const costShare = rows.map((r) => (totalCost > 0 ? (r.cost / totalCost) * 100 : 0));
  const hourShare = rows.map((r) => (totalHours > 0 ? (r.hours / totalHours) * 100 : 0));

  return { totalCost, totalHours, wacPerHour, wacPerDay, costShare, hourShare };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmt2 = (n: number) => "$" + fmt(n, 2);

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

const WeightedAverageCostOfProjectCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const updateRow = (id: number, key: "cost" | "hours", value: string) =>
    setInputs((prev) => ({
      ...prev,
      workstreams: prev.workstreams.map((w) => (w.id === id ? { ...w, [key]: value } : w)),
    }));

  const addRow = () =>
    setInputs((prev) => ({
      ...prev,
      workstreams: [...prev.workstreams, { id: Date.now(), cost: "50000", hours: "800" }],
    }));

  const removeRow = (id: number) =>
    setInputs((prev) => ({
      ...prev,
      workstreams: prev.workstreams.length > 1 ? prev.workstreams.filter((w) => w.id !== id) : prev.workstreams,
    }));

  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    inputs.workstreams.some((w) => num(w.cost) < 0 || num(w.hours) < 0) ||
    num(inputs.hoursPerDay) < 0;

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
    { label: "Total Project Cost", value: fmtMoney(result.totalCost) },
    { label: "Total Hours", value: fmt(result.totalHours) },
    { label: "Weighted Avg Cost / Hour", value: fmt2(result.wacPerHour) },
    { label: "Weighted Avg Cost / Day", value: fmt2(result.wacPerDay) },
    ...inputs.workstreams.flatMap((w, i) => [
      { label: `Workstream ${i + 1} Cost`, value: fmtMoney(parseFloat(w.cost) || 0) },
      { label: `Workstream ${i + 1} Hours`, value: fmt(parseFloat(w.hours) || 0) },
    ]),
    ...inputs.workstreams.flatMap((w, i) => [
      { label: `Workstream ${i + 1} Cost Share`, value: `${fmt(result.costShare[i] ?? 0, 1)}%` },
      { label: `Workstream ${i + 1} Hour Share`, value: `${fmt(result.hourShare[i] ?? 0, 1)}%` },
    ]),
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="flex flex-col gap-3">
            {inputs.workstreams.map((w, i) => (
              <div key={w.id} className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id={`ws-${w.id}-cost`} label={`Workstream ${i + 1} Cost`} value={w.cost} onChange={(v) => updateRow(w.id, "cost", v)} prefix="$" />
                  <NumInput id={`ws-${w.id}-hours`} label={`Workstream ${i + 1} Hours`} value={w.hours} onChange={(v) => updateRow(w.id, "hours", v)} />
                </div>
                {inputs.workstreams.length > 1 && (
                  <button type="button" onClick={() => removeRow(w.id)} className="self-end flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" onClick={addRow} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            <Plus className="h-4 w-4" /> Add Workstream
          </button>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Work Schedule</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="hours-per-day" label="Hours per Day" value={inputs.hoursPerDay} onChange={(v) => setInputs((prev) => ({ ...prev, hoursPerDay: v }))} />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — costs and hours must be zero or positive.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Weighted Avg Cost / Hour</div>
            <div className="text-4xl font-bold text-primary">{fmt2(result.wacPerHour)}</div>
            <div className="text-sm text-muted-foreground mt-1">across {fmt(result.totalHours)} hours in {inputs.workstreams.length} workstreams</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Project Cost</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.totalCost)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Hours</div>
              <div className="text-lg font-bold mt-1">{fmt(result.totalHours)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Avg Cost / Day</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt2(result.wacPerDay)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Workstream Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Weighted Avg Cost / Hour</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt2(result.wacPerHour)}</td>
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
                <div className="text-xs text-muted-foreground">Weighted Avg Cost / Hour</div>
                <div className="text-base font-bold text-primary">{fmt2(result.wacPerHour)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Weighted Average Cost of a Project?</h2>
            <p className="text-muted-foreground leading-relaxed">The weighted average cost of a project is the single hourly rate that would reproduce the project's total cost if every hour were billed at that one rate. Projects rarely run at a single rate — engineering, design, and vendor work each carry different hourly costs, and quoting a project as if one rate applied everywhere distorts both estimates and chargebacks. The weighted average solves that by dividing the total cost across all workstreams by the total hours across all workstreams. Weighting matters because it is hours, not dollars, that drive the average toward the workstreams where people actually spend time: a small, expensive vendor block with a few hundred hours moves the average far less than a large internal team running thousands of hours at a moderate rate. The result is a defensible planning number for budget approval, shared-service allocation, and comparing the efficiency of projects of different shapes.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Weighted Average Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator takes each workstream's total cost and total hours, sums the costs across all workstreams, and sums the hours across all workstreams. The weighted average cost per hour is total cost divided by total hours. Because both sums come from the same workstreams, a workstream with many hours pulls the average toward its own rate proportionally — that is the weighting. The cost share and hour share for each workstream are then computed as the workstream's cost divided by total cost and its hours divided by total hours, both expressed as percentages, which makes the mix visible: a workstream can command a large share of cost while contributing a small share of hours, or the reverse. The daily equivalent multiplies the hourly figure by the number of hours in a standard work day, which defaults to eight and can be adjusted in the advanced options to match the project's actual schedule. Add or remove workstream rows freely — the calculation re-weights automatically — and remember that each workstream's cost should be fully loaded: include overhead and benefits before entering the number, because the weighted average is only as accurate as its inputs. When scope shifts mid-project, re-run the model with revised hours to see how the weighted average moves before you re-quote or re-baseline.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">A weighted average close to your largest workstream's rate means the project is dominated by that team's economics; a wide gap between the weighted average and any single workstream's rate simply reflects the mix — it is not an error. Use the hourly figure when blending rates for budget approval or when a client or sponsor asks for a single number that captures what an hour costs on this project. Use the daily figure for capacity planning and sprint or week-level cost estimates. When benchmarking, compare projects with similar mixes, since two projects with identical totals can have very different weighted averages. If you are estimating individual workstreams, keep using each workstream's own rate — the weighted average is a planning rate for the whole project, not a substitute for line-level detail. The cost and hour share columns are the diagnostic: when a small workstream consumes a disproportionate share of cost, it is the first candidate for renegotiation or in-sourcing, and when a large share of hours carries a low share of cost, that is where capacity is cheapest to add.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/weighted-average-cost-of-project-calculator" />
      </div>
    </div>
  );
};

export default WeightedAverageCostOfProjectCalculator;