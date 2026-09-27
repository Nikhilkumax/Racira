"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  originalBudget: string;
  scopeGrowthPct: string;
  teamSize: string;
  dailyRate: string;
  creepHoursPerWeek: string;
  hourlyRate: string;
  addedFeatures: string;
  costPerFeature: string;
}

interface Result {
  addedBudget: number;
  unbudgetedLabor: number;
  addedFeatureCost: number;
  totalCost: number;
  finalBudget: number;
  overrunPct: number;
  costPerWeek: number;
}

const DEFAULTS: Inputs = {
  originalBudget: "500000",
  scopeGrowthPct: "20",
  teamSize: "10",
  dailyRate: "600",
  creepHoursPerWeek: "8",
  hourlyRate: "85",
  addedFeatures: "6",
  costPerFeature: "15000",
};

function calculate(inputs: Inputs): Result {
  const originalBudget = Math.max(0, parseFloat(inputs.originalBudget) || 0);
  const scopeGrowthPct = Math.min(1000, Math.max(0, parseFloat(inputs.scopeGrowthPct) || 0));
  const teamSize = Math.max(0, parseFloat(inputs.teamSize) || 0);
  const dailyRate = Math.max(0, parseFloat(inputs.dailyRate) || 0);
  const creepHoursPerWeek = Math.max(0, parseFloat(inputs.creepHoursPerWeek) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const addedFeatures = Math.max(0, parseFloat(inputs.addedFeatures) || 0);
  const costPerFeature = Math.max(0, parseFloat(inputs.costPerFeature) || 0);

  const addedBudget = originalBudget * (scopeGrowthPct / 100);
  const unbudgetedLabor = creepHoursPerWeek * hourlyRate * 12;
  const addedFeatureCost = addedFeatures * costPerFeature;
  const totalCost = addedBudget + unbudgetedLabor + addedFeatureCost;
  const finalBudget = originalBudget + totalCost;
  const overrunPct = originalBudget > 0 ? (totalCost / originalBudget) * 100 : 0;
  const costPerWeek = unbudgetedLabor / 12;

  return { addedBudget, unbudgetedLabor, addedFeatureCost, totalCost, finalBudget, overrunPct, costPerWeek };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));

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

const ScopeCreepCostCalculator = () => {
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
    num(inputs.originalBudget) < 0 || num(inputs.scopeGrowthPct) < 0 ||
    num(inputs.teamSize) < 0 || num(inputs.dailyRate) < 0 ||
    num(inputs.creepHoursPerWeek) < 0 || num(inputs.hourlyRate) < 0 ||
    num(inputs.addedFeatures) < 0 || num(inputs.costPerFeature) < 0;

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
    { label: "Original Budget", value: fmtMoney(num(inputs.originalBudget)) },
    { label: "Scope Growth", value: `${fmt(num(inputs.scopeGrowthPct), 1)}%` },
    { label: "Added Budget from Scope Growth", value: fmtMoney(result.addedBudget) },
    { label: "Unbudgeted Labor (12 wks)", value: fmtMoney(result.unbudgetedLabor) },
    { label: "Cost per Week of Creep", value: fmtMoney(result.costPerWeek) },
    { label: "Added Features", value: fmt(num(inputs.addedFeatures)) },
    { label: "Added Feature Cost", value: fmtMoney(result.addedFeatureCost) },
    { label: "Final Budget", value: fmtMoney(result.finalBudget) },
    { label: "Budget Overrun", value: `${fmt(result.overrunPct, 1)}%` },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="original-budget" label="Original Budget" value={inputs.originalBudget} onChange={set("originalBudget")} prefix="$" />
            <NumInput id="scope-growth" label="Scope Growth" value={inputs.scopeGrowthPct} onChange={set("scopeGrowthPct")} suffix="%" />
            <NumInput id="team-size" label="Team Size" value={inputs.teamSize} onChange={set("teamSize")} />
            <NumInput id="daily-rate" label="Daily Rate" value={inputs.dailyRate} onChange={set("dailyRate")} prefix="$" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Unbudgeted Labor</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="creep-hours" label="Creep Hours / Week" value={inputs.creepHoursPerWeek} onChange={set("creepHoursPerWeek")} />
                  <NumInput id="hourly-rate" label="Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Added Features</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="added-features" label="Added Features" value={inputs.addedFeatures} onChange={set("addedFeatures")} />
                  <NumInput id="cost-per-feature" label="Cost per Feature" value={inputs.costPerFeature} onChange={set("costPerFeature")} prefix="$" />
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Scope Creep Cost</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCost)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(result.overrunPct, 1)}% overrun · final budget {fmtMoney(result.finalBudget)}</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Final Budget</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.finalBudget)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Budget Overrun</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmt(result.overrunPct, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Added Budget</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmtMoney(result.addedBudget)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Scope Creep Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Cost of Scope Creep</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.totalCost)}</td>
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
                <div className="text-xs text-muted-foreground">Total Cost of Scope Creep</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.totalCost)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Scope Creep Cost?</h2>
            <p className="text-muted-foreground leading-relaxed">Scope creep cost is the budget damage caused by requirements growing beyond what was originally agreed — features added informally, small requests accepted without a change order, and effort spent on work that was never in the plan. Scope creep is the most common cause of project overruns, and it is insidious because each individual addition looks small. A feature here, a tweak there, and a team quietly absorbing extra hours every week can collectively consume 20 to 50 percent of the original budget before anyone adds the numbers up. The cost has three distinct components: the direct budget growth from scope expansion, the unbudgeted labor of work done informally outside the plan, and the cost of features added after the baseline was set — each of which this calculator models separately.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Scope Creep Cost Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator adds three components. Added budget from scope growth applies the scope growth percentage to the original budget — a 20 percent scope increase on a $500,000 project adds $100,000 of work that was never funded. Unbudgeted labor multiplies the creep hours absorbed per week by the blended hourly rate across the project duration, modeled here over a 12-week period, capturing the ongoing drip of informal requests. Added feature cost multiplies the number of post-baseline features by the average cost to deliver each one. The total of the three is the full cost of creep, added to the original budget to show the final budget, and expressed as an overrun percentage that puts the damage in perspective. The cost-per-week figure isolates the pace of the labor bleed, making the ongoing burn visible before the project ends.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">An overrun of 20 percent or more is a clear signal that the change control process is not working — every addition should go through a formal change request that updates budget and schedule before work starts. The breakdown shows which channel of creep is the biggest: if unbudgeted labor dominates, the problem is informal requests that never reach the change log; if added features dominate, the baseline was drawn too thin. The cost-per-week figure is the number to watch during execution — if it is material, the project is accruing creep in real time. Use the final budget line as the basis for the change request discussion: stakeholders respond differently to "we need more money" than to "the project now costs this much because of these additions." Prevention is cheaper than recovery — a disciplined baseline review costs a fraction of the creep it prevents. The same model doubles as a forward-planning tool: before approving any new request, run the numbers with the request's estimated cost per feature or hours per week to see the overrun it would produce, and use that figure in the change-control meeting. Teams that quote the cost of a proposed addition in dollars — before the addition is accepted — report far fewer of the small approvals that quietly compound into a budget crisis.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/scope-creep-cost-calculator" />
      </div>
    </div>
  );
};

export default ScopeCreepCostCalculator;