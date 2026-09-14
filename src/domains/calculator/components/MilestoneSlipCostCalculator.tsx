"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  slippageDays: string;
  teamSize: string;
  dailyRate: string;
  overheadRate: string;
  contractPenalty: string;
  revenuePerDay: string;
  interestRate: string;
  projectValue: string;
}

interface Result {
  idleLaborCost: number;
  overheadCost: number;
  penaltyCost: number;
  revenueLoss: number;
  interestCost: number;
  totalCost: number;
  costPerDay: number;
  costAsPctValue: number;
}

const DEFAULTS: Inputs = {
  slippageDays: "15",
  teamSize: "12",
  dailyRate: "650",
  overheadRate: "25",
  contractPenalty: "25000",
  revenuePerDay: "30000",
  interestRate: "8",
  projectValue: "750000",
};

function calculate(inputs: Inputs): Result {
  const slippageDays = Math.max(0, parseFloat(inputs.slippageDays) || 0);
  const teamSize = Math.max(0, parseFloat(inputs.teamSize) || 0);
  const dailyRate = Math.max(0, parseFloat(inputs.dailyRate) || 0);
  const overheadRate = Math.min(100, Math.max(0, parseFloat(inputs.overheadRate) || 0));
  const contractPenalty = Math.max(0, parseFloat(inputs.contractPenalty) || 0);
  const revenuePerDay = Math.max(0, parseFloat(inputs.revenuePerDay) || 0);
  const interestRate = Math.min(100, Math.max(0, parseFloat(inputs.interestRate) || 0));
  const projectValue = Math.max(0, parseFloat(inputs.projectValue) || 0);

  const idleLaborCost = slippageDays * teamSize * dailyRate;
  const overheadCost = idleLaborCost * (overheadRate / 100);
  const penaltyCost = contractPenalty;
  const revenueLoss = slippageDays * revenuePerDay;
  const interestCost = (projectValue * (interestRate / 100) * slippageDays) / 365;
  const totalCost = idleLaborCost + overheadCost + penaltyCost + revenueLoss + interestCost;
  const costPerDay = slippageDays > 0 ? totalCost / slippageDays : 0;
  const costAsPctValue = projectValue > 0 ? (totalCost / projectValue) * 100 : 0;

  return { idleLaborCost, overheadCost, penaltyCost, revenueLoss, interestCost, totalCost, costPerDay, costAsPctValue };
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

const MilestoneSlipCostCalculator = () => {
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
    num(inputs.slippageDays) < 0 || num(inputs.teamSize) < 0 ||
    num(inputs.dailyRate) < 0 || num(inputs.overheadRate) < 0 || num(inputs.overheadRate) > 100 ||
    num(inputs.contractPenalty) < 0 || num(inputs.revenuePerDay) < 0 ||
    num(inputs.interestRate) < 0 || num(inputs.interestRate) > 100 ||
    num(inputs.projectValue) < 0;

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
    { label: "Slippage Days", value: `${fmt(num(inputs.slippageDays))} days` },
    { label: "Team Size", value: fmt(num(inputs.teamSize)) },
    { label: "Daily Rate", value: fmtMoney(num(inputs.dailyRate)) },
    { label: "Idle Labor Cost", value: fmtMoney(result.idleLaborCost) },
    { label: "Overhead on Idle Labor", value: fmtMoney(result.overheadCost) },
    { label: "Contract Penalty", value: fmtMoney(result.penaltyCost) },
    { label: "Revenue Loss", value: fmtMoney(result.revenueLoss) },
    { label: "Interest Carry Cost", value: fmtMoney(result.interestCost) },
    { label: "Cost per Day of Slip", value: fmtMoney(result.costPerDay) },
    { label: "Cost as % of Project Value", value: `${fmt(result.costAsPctValue, 1)}%` },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="slippage-days" label="Slippage Days" value={inputs.slippageDays} onChange={set("slippageDays")} suffix="days" />
            <NumInput id="team-size" label="Team Size" value={inputs.teamSize} onChange={set("teamSize")} />
            <NumInput id="daily-rate" label="Daily Rate" value={inputs.dailyRate} onChange={set("dailyRate")} prefix="$" />
            <NumInput id="overhead" label="Overhead" value={inputs.overheadRate} onChange={set("overheadRate")} suffix="%" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Contract &amp; Revenue</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="contract-penalty" label="Contract Penalty" value={inputs.contractPenalty} onChange={set("contractPenalty")} prefix="$" />
                  <NumInput id="revenue-per-day" label="Revenue per Day" value={inputs.revenuePerDay} onChange={set("revenuePerDay")} prefix="$" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Financing</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="interest-rate" label="Interest Rate" value={inputs.interestRate} onChange={set("interestRate")} suffix="%" />
                  <NumInput id="project-value" label="Project Value" value={inputs.projectValue} onChange={set("projectValue")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — overhead and interest must be 0–100%.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Cost of Milestone Slip</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCost)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(num(inputs.slippageDays))} days · {fmtMoney(result.costPerDay)} per day</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Idle Labor Cost</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmtMoney(result.idleLaborCost)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost per Day</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.costPerDay)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">% of Project Value</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmt(result.costAsPctValue, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Slippage Cost Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Cost of Slippage</td>
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
                <div className="text-xs text-muted-foreground">Total Cost of Slippage</div>
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
            <h2 className="text-2xl font-bold mb-3">What Is Milestone Slippage Cost?</h2>
            <p className="text-muted-foreground leading-relaxed">Milestone slippage cost is the total financial damage a project absorbs when a scheduled milestone misses its date. The damage is rarely a single line item — it stacks several distinct costs: the team's labor continues to be paid while the work stalls, overhead such as facilities and management time accrues on top of that labor, contract penalties may be triggered by the missed date, revenue that was expected to arrive when the milestone completed is delayed, and financing costs on the project's capital continue to accrue for every extra day. Each of these components compounds, which is why a two-week slip on a six-figure project can easily cost more than the original contingency budget. Quantifying the slip in dollars turns a schedule discussion into a business discussion — it gives the project sponsor a number to weigh against the cost of crashing, overtime, or additional resources.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Slippage Cost Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator builds the total from five components. Idle labor cost multiplies the slippage days by team size and the daily fully-loaded rate. Overhead cost applies the overhead percentage to that labor figure, capturing the facilities and support burden that continues whether or not productive work is happening. Contract penalty adds any liquidated damages or penalty clause triggered by the late milestone. Revenue loss multiplies the days by the revenue expected per day once the milestone completes — the deferred billing, launch, or delivery that the slip pushes out. Finally, interest cost carries the project value at the annual interest rate for the slippage period: project value times the rate times the days divided by 365. The total of these five components is the full cost of the slip, expressed both as a per-day rate — useful for comparing against the cost of recovery actions — and as a percentage of the overall project value, which puts the damage in perspective against the project's size. The model deliberately treats the five components as independent so each one can be verified against its source document — timesheets for idle labor, the contract for penalties, the sales forecast for revenue, and the financing agreement for interest. If a project carries no penalty clause, set it to zero; if the team can be redeployed to other billable work during the slip, reduce the idle labor input accordingly. The calculator is a planning tool, and the inputs should mirror the project's actual exposure rather than its worst case.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Use the per-day figure as the decision rule during recovery planning: any action that keeps the project from slipping an additional day is worth up to that amount. If overtime or a crash plan costs less per day than the slippage cost, it pays for itself immediately. The breakdown also shows where the damage concentrates — projects with large teams bleed most through idle labor, contracted projects through penalties, and revenue-dependent projects through deferred income. Track the percentage-of-value figure across milestones to see which deliverables are most expensive to delay, and use the interest row to justify accelerating payment-triggering milestones when financing costs are material. Re-run the calculator as the schedule shifts; the cost of a slip grows with every day it is allowed to continue.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/milestone-slip-cost-calculator" />
      </div>
    </div>
  );
};

export default MilestoneSlipCostCalculator;