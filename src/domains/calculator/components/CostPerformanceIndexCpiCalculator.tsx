"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  plannedValue: string;
  earnedValue: string;
  actualCost: string;
  totalBudget: string;
}

interface Result {
  cpi: number;
  spi: number;
  cv: number;
  sv: number;
  estimateAtCompletion: number;
  varianceAtCompletion: number;
  toCompletePerformanceIndex: number;
  status: string;
}

const DEFAULTS: Inputs = {
  plannedValue: "250000",
  earnedValue: "220000",
  actualCost: "240000",
  totalBudget: "600000",
};

function calculate(inputs: Inputs): Result {
  const plannedValue = Math.max(0, parseFloat(inputs.plannedValue) || 0);
  const earnedValue = Math.max(0, parseFloat(inputs.earnedValue) || 0);
  const actualCost = Math.max(0, parseFloat(inputs.actualCost) || 0);
  const totalBudget = Math.max(0, parseFloat(inputs.totalBudget) || 0);

  const cpi = actualCost > 0 ? earnedValue / actualCost : 0;
  const spi = plannedValue > 0 ? earnedValue / plannedValue : 0;
  const cv = earnedValue - actualCost;
  const sv = earnedValue - plannedValue;
  const estimateAtCompletion = cpi > 0 ? totalBudget / cpi : 0;
  const varianceAtCompletion = totalBudget - estimateAtCompletion;
  const remainingWork = totalBudget - earnedValue;
  const remainingFunds = totalBudget - actualCost;
  const toCompletePerformanceIndex = remainingFunds > 0 ? remainingWork / remainingFunds : 0;

  let status = "On Budget";
  if (cpi < 1) status = "Over Budget";
  else if (cpi > 1) status = "Under Budget";

  return { cpi, spi, cv, sv, estimateAtCompletion, varianceAtCompletion, toCompletePerformanceIndex, status };
}

const fmt = (n: number, dec = 2) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

const NumInput = ({ id, label, value, onChange, prefix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

const CostPerformanceIndexCpiCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.plannedValue) < 0 || num(inputs.earnedValue) < 0 ||
    num(inputs.actualCost) < 0 || num(inputs.totalBudget) < 0;

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

  const cpiOk = result.cpi >= 1;
  const spiOk = result.spi >= 1;
  const cvOk = result.cv >= 0;
  const svOk = result.sv >= 0;

  const breakdown = [
    { label: "Planned Value (PV)", value: fmtMoney(num(inputs.plannedValue)) },
    { label: "Earned Value (EV)", value: fmtMoney(num(inputs.earnedValue)) },
    { label: "Actual Cost (AC)", value: fmtMoney(num(inputs.actualCost)) },
    { label: "Budget at Completion (BAC)", value: fmtMoney(num(inputs.totalBudget)) },
    { label: "Cost Performance Index (CPI)", value: fmt(result.cpi) },
    { label: "Schedule Performance Index (SPI)", value: fmt(result.spi) },
    { label: "Cost Variance (CV)", value: fmtMoney(result.cv) },
    { label: "Schedule Variance (SV)", value: fmtMoney(result.sv) },
    { label: "Variance at Completion (VAC)", value: fmtMoney(result.varianceAtCompletion) },
    { label: "To-Complete Performance Index (TCPI)", value: fmt(result.toCompletePerformanceIndex) },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="planned-value" label="Planned Value (PV)" value={inputs.plannedValue} onChange={set("plannedValue")} prefix="$" />
            <NumInput id="earned-value" label="Earned Value (EV)" value={inputs.earnedValue} onChange={set("earnedValue")} prefix="$" />
            <NumInput id="actual-cost" label="Actual Cost (AC)" value={inputs.actualCost} onChange={set("actualCost")} prefix="$" />
            <NumInput id="total-budget" label="Budget at Completion" value={inputs.totalBudget} onChange={set("totalBudget")} prefix="$" />
          </div>

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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Cost Performance Index</div>
            <div className="text-4xl font-bold text-primary">{fmt(result.cpi)}</div>
            <div className="text-sm text-muted-foreground mt-1">{result.status} · {fmtMoney(result.varianceAtCompletion)} forecast variance at completion</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">SPI</div>
              <div className={`text-lg font-bold mt-1 ${spiOk ? "text-emerald-600" : "text-red-600"}`}>{fmt(result.spi)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Cost Variance</div>
              <div className={`text-lg font-bold mt-1 ${cvOk ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.cv)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Schedule Variance</div>
              <div className={`text-lg font-bold mt-1 ${svOk ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.sv)}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Earned Value Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Estimate at Completion (EAC)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmtMoney(result.estimateAtCompletion)}</td>
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
                <div className="text-xs text-muted-foreground">Estimate at Completion (EAC)</div>
                <div className="text-base font-bold text-primary">{fmtMoney(result.estimateAtCompletion)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Cost Performance Index?</h2>
            <p className="text-muted-foreground leading-relaxed">The Cost Performance Index (CPI) is the core earned value metric that tells you how efficiently your project is converting every dollar of actual spend into earned value. It is calculated by dividing Earned Value by Actual Cost: a CPI of 1.0 means you are getting exactly one dollar of completed work for every dollar spent, above 1.0 means you are ahead of the cost curve, and below 1.0 means you are over budget. Because it is a ratio rather than a dollar figure, CPI lets you compare cost health across projects of any size, and it is the single best leading indicator of whether a project will finish within its budget. The metric comes from earned value management, the discipline of measuring project performance in money rather than in task completion alone — a task that is half done is worth half its budgeted value, whether the team spent the full amount or not, which is what makes the comparison honest.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Earned Value Metrics Work Together</h2>
            <p className="text-muted-foreground leading-relaxed">The calculator uses the three classic earned value inputs. Planned Value (PV) is the budgeted cost of work scheduled to be done by now, Earned Value (EV) is the budgeted cost of work actually performed, and Actual Cost (AC) is what that work really cost. CPI divides EV by AC, while the Schedule Performance Index (SPI) divides EV by PV to measure time efficiency. Cost Variance (CV) and Schedule Variance (SV) express the same health in dollars: EV minus AC and EV minus PV. The forward-looking numbers use the current CPI to extrapolate: Estimate at Completion (EAC) divides the Budget at Completion (BAC) by CPI, producing the most probable final cost if today's efficiency holds for the rest of the project. Variance at Completion (VAC) subtracts EAC from BAC to show the expected overrun or underrun in dollars, and the To-Complete Performance Index (TCPI) divides the remaining work by the remaining funds — the efficiency the team must achieve from here to finish on budget. A TCPI above 1.0 means the remaining work must be done more efficiently than the project has managed so far, which is the earliest warning that a budget change request is coming.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">A CPI below 1.0 should trigger a root-cause review of the largest cost drivers — labor rates, material overruns, or scope growth — because the EAC line shows the trajectory if current efficiency holds. A common trap is reading a healthy SPI as permission to ignore cost: a project can be ahead of schedule while burning cash, so always read CPI and SPI together. If the TCPI is meaningfully above your current CPI, plan for a budget change request or a scope reduction, since finishing on budget would require better efficiency than the project has demonstrated. Recompute these figures at every reporting period; the trends matter more than any single snapshot. A CPI that drifts from 1.05 to 1.01 across three reports is a warning sign even while the number stays green, and a project that recovers from 0.92 to 0.97 is usually correcting faster than one that holds steady at 0.85. Track the direction as much as the level.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/cost-performance-index-cpi-calculator" />
      </div>
    </div>
  );
};

export default CostPerformanceIndexCpiCalculator;