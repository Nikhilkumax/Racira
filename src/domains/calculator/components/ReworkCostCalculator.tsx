"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  unitsReworked: string;
  reworkRate: string;
  laborCostPerUnit: string;
  materialCostPerUnit: string;
  reworkHours: string;
  hourlyRate: string;
  scrapPct: string;
  materialValue: string;
  delayDays: string;
  dailyRevenue: string;
}

interface Result {
  reworkUnits: number;
  laborCost: number;
  materialCost: number;
  reworkCost: number;
  scrapCost: number;
  delayCost: number;
  totalCost: number;
  costAsPctProduction: number;
}

const DEFAULTS: Inputs = {
  unitsReworked: "500",
  reworkRate: "5",
  laborCostPerUnit: "45",
  materialCostPerUnit: "30",
  reworkHours: "600",
  hourlyRate: "55",
  scrapPct: "8",
  materialValue: "12000",
  delayDays: "4",
  dailyRevenue: "35000",
};

function calculate(inputs: Inputs): Result {
  const unitsReworked = Math.max(0, parseFloat(inputs.unitsReworked) || 0);
  const reworkRate = Math.min(100, Math.max(0, parseFloat(inputs.reworkRate) || 0));
  const laborCostPerUnit = Math.max(0, parseFloat(inputs.laborCostPerUnit) || 0);
  const materialCostPerUnit = Math.max(0, parseFloat(inputs.materialCostPerUnit) || 0);
  const reworkHours = Math.max(0, parseFloat(inputs.reworkHours) || 0);
  const hourlyRate = Math.max(0, parseFloat(inputs.hourlyRate) || 0);
  const scrapPct = Math.min(100, Math.max(0, parseFloat(inputs.scrapPct) || 0));
  const materialValue = Math.max(0, parseFloat(inputs.materialValue) || 0);
  const delayDays = Math.max(0, parseFloat(inputs.delayDays) || 0);
  const dailyRevenue = Math.max(0, parseFloat(inputs.dailyRevenue) || 0);

  const reworkUnits = unitsReworked * (reworkRate / 100);
  const laborCost = reworkUnits * laborCostPerUnit;
  const materialCost = reworkUnits * materialCostPerUnit;
  const reworkCost = laborCost + materialCost + reworkHours * hourlyRate;
  const scrapCost = materialValue * (scrapPct / 100);
  const delayCost = delayDays * dailyRevenue;
  const totalCost = reworkCost + scrapCost + delayCost;
  const costAsPctProduction = unitsReworked > 0 ? (totalCost / (unitsReworked * (laborCostPerUnit + materialCostPerUnit))) * 100 : 0;

  return { reworkUnits, laborCost, materialCost, reworkCost, scrapCost, delayCost, totalCost, costAsPctProduction };
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

const ReworkCostCalculator = () => {
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
    num(inputs.unitsReworked) < 0 || num(inputs.reworkRate) < 0 || num(inputs.reworkRate) > 100 ||
    num(inputs.laborCostPerUnit) < 0 || num(inputs.materialCostPerUnit) < 0 ||
    num(inputs.reworkHours) < 0 || num(inputs.hourlyRate) < 0 ||
    num(inputs.scrapPct) < 0 || num(inputs.scrapPct) > 100 ||
    num(inputs.materialValue) < 0 || num(inputs.delayDays) < 0 || num(inputs.dailyRevenue) < 0;

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
    { label: "Units in Production", value: fmt(num(inputs.unitsReworked)) },
    { label: "Rework Rate", value: `${fmt(num(inputs.reworkRate), 1)}%` },
    { label: "Units Requiring Rework", value: fmt(result.reworkUnits) },
    { label: "Rework Labor Cost", value: fmtMoney(result.laborCost) },
    { label: "Rework Material Cost", value: fmtMoney(result.materialCost) },
    { label: "Rework Hours Cost", value: fmtMoney(num(inputs.reworkHours) * num(inputs.hourlyRate)) },
    { label: "Scrap Cost", value: fmtMoney(result.scrapCost) },
    { label: "Delay Revenue Loss", value: fmtMoney(result.delayCost) },
    { label: "Cost as % of Production Cost", value: `${fmt(result.costAsPctProduction, 1)}%` },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="units" label="Units in Production" value={inputs.unitsReworked} onChange={set("unitsReworked")} />
            <NumInput id="rework-rate" label="Rework Rate" value={inputs.reworkRate} onChange={set("reworkRate")} suffix="%" />
            <NumInput id="labor-per-unit" label="Labor Cost per Unit" value={inputs.laborCostPerUnit} onChange={set("laborCostPerUnit")} prefix="$" />
            <NumInput id="material-per-unit" label="Material Cost per Unit" value={inputs.materialCostPerUnit} onChange={set("materialCostPerUnit")} prefix="$" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Labor &amp; Scrap</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="rework-hours" label="Rework Hours" value={inputs.reworkHours} onChange={set("reworkHours")} />
                  <NumInput id="hourly-rate" label="Hourly Rate" value={inputs.hourlyRate} onChange={set("hourlyRate")} prefix="$" />
                  <NumInput id="scrap-pct" label="Scrap" value={inputs.scrapPct} onChange={set("scrapPct")} suffix="%" />
                  <NumInput id="material-value" label="Material Value" value={inputs.materialValue} onChange={set("materialValue")} prefix="$" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Delay Impact</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="delay-days" label="Delay Days" value={inputs.delayDays} onChange={set("delayDays")} />
                  <NumInput id="daily-revenue" label="Daily Revenue" value={inputs.dailyRevenue} onChange={set("dailyRevenue")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — rates must be 0–100%.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Total Rework Cost</div>
            <div className="text-4xl font-bold text-primary">{fmtMoney(result.totalCost)}</div>
            <div className="text-sm text-muted-foreground mt-1">{fmt(result.reworkUnits)} units reworked · {fmtMoney(result.reworkCost)} direct rework</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Units Reworked</div>
              <div className="text-lg font-bold mt-1">{fmt(result.reworkUnits)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost vs. Production</div>
              <div className="text-lg font-bold text-amber-600 mt-1">{fmt(result.costAsPctProduction, 1)}%</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Scrap Cost</div>
              <div className="text-lg font-bold text-red-600 mt-1">{fmtMoney(result.scrapCost)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Rework Cost Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Total Rework Cost</td>
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
                <div className="text-xs text-muted-foreground">Total Rework Cost</div>
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
            <h2 className="text-2xl font-bold mb-3">What Is Rework Cost?</h2>
            <p className="text-muted-foreground leading-relaxed">Rework cost is the total expense of correcting defective output — the labor, material, and overhead spent doing work twice because it was not done right the first time. Rework is the most common form of internal failure cost and one of the largest hidden drains in manufacturing and software alike: industry studies routinely find that rework consumes between 5 and 15 percent of total production cost, and in construction and software projects the figure can run far higher. Because rework is invisible in standard profit-and-loss reporting, it rarely gets the management attention it deserves. The true cost extends beyond the direct correction — reworked units tie up capacity that could have produced new output, scrap consumes material that was already paid for, and schedule delays push revenue out while fixed costs keep accruing. Quality experts consistently rank rework reduction among the fastest routes to margin improvement precisely because the savings drop straight to the bottom line: unlike revenue growth, every dollar of avoided rework is a dollar of profit recovered with no added selling cost. Measuring rework accurately, rather than estimating it, is therefore the first step of any serious continuous-improvement program.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Rework Cost Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator builds the total from three layers. The direct rework cost multiplies the units requiring rework — production volume times the rework rate — by the labor and material cost per unit, then adds the cost of dedicated rework hours at the shop or team hourly rate. The scrap cost applies the scrap percentage to the material value at risk, capturing the raw material written off when defects cannot be salvaged. The delay cost multiplies the days of schedule slippage by the revenue expected per day, capturing the deferred income and customer impact of late delivery. The total is also expressed as a percentage of normal production cost — the figure that reveals how much of the operation's spending is wasted on doing work twice, and the number to benchmark against the 5–15 percent industry norm.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Compare the total rework cost against your production cost and against the components in the breakdown: a rework rate above 5 percent or a cost percentage above 15 percent both justify an immediate root-cause program. The breakdown shows where the money goes — if rework hours dominate, the defect is labor-intensive correction; if scrap dominates, material handling or process stability is the problem. The delay line is the reminder that rework cascades: every day of slippage multiplies the damage beyond the workshop floor. Track the rework rate and cost percentage monthly — a falling rate with stable output is the clearest evidence that quality improvements are paying for themselves, while a rising rate is the earliest warning that process drift has begun. One practical refinement: when the rework rate is driven by a single known defect mode, run the calculator with and without that mode's units to size the financial case for fixing the root cause. The difference between the two totals is the monthly budget a corrective action can justify, which turns the quality discussion from a cost center into an investment decision.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/rework-cost-calculator" />
      </div>
    </div>
  );
};

export default ReworkCostCalculator;