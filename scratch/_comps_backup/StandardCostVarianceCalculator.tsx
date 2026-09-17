"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  unitsProduced: string;
  stdCostPerUnit: string;
  actCostPerUnit: string;
  budgetedUnits: string;
}

interface Result {
  stdCost: number;
  actCost: number;
  budgetCost: number;
  costVariance: number;
  variancePct: number;
  volumeVariance: number;
  netVsBudget: number;
}

const DEFAULTS: Inputs = {
  unitsProduced: "10000",
  stdCostPerUnit: "25.00",
  actCostPerUnit: "26.50",
  budgetedUnits: "11000",
};

function calculate(inputs: Inputs): Result {
  const unitsProduced = Math.max(0, parseFloat(inputs.unitsProduced) || 0);
  const stdCostPerUnit = Math.max(0, parseFloat(inputs.stdCostPerUnit) || 0);
  const actCostPerUnit = Math.max(0, parseFloat(inputs.actCostPerUnit) || 0);
  const budgetedUnits = Math.max(0, parseFloat(inputs.budgetedUnits) || 0);

  const stdCost = stdCostPerUnit * unitsProduced;
  const actCost = actCostPerUnit * unitsProduced;
  const budgetCost = stdCostPerUnit * budgetedUnits;
  const costVariance = actCost - stdCost;
  const variancePct = stdCost > 0 ? (costVariance / stdCost) * 100 : 0;
  const volumeVariance = (unitsProduced - budgetedUnits) * stdCostPerUnit;
  const netVsBudget = actCost - budgetCost;

  return { stdCost, actCost, budgetCost, costVariance, variancePct, volumeVariance, netVsBudget };
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

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtMoney = (n: number) => "$" + fmt(Math.round(n));
const fmtVar = (n: number) => (n >= 0 ? "$" + fmt(Math.round(n)) + " U" : "-$" + fmt(Math.round(-n)) + " F");

export default function StandardCostVarianceCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.unitsProduced) < 0 ||
    num(inputs.stdCostPerUnit) < 0 ||
    num(inputs.actCostPerUnit) < 0 ||
    num(inputs.budgetedUnits) < 0;

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

  const handlePrint = () => window.print();

  const rows = [
    { label: "Units Produced", value: fmt(num(inputs.unitsProduced)) },
    { label: "Standard Cost per Unit", value: "$" + fmt(num(inputs.stdCostPerUnit), 2) },
    { label: "Actual Cost per Unit", value: "$" + fmt(num(inputs.actCostPerUnit), 2) },
    { label: "Standard Cost of Output", value: fmtMoney(result.stdCost) },
    { label: "Actual Cost of Output", value: fmtMoney(result.actCost) },
    { label: "Cost Variance (Actual vs Standard)", value: fmtVar(result.costVariance), total: true, colorClass: result.costVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Variance as % of Standard", value: result.variancePct.toFixed(1) + "%" },
    { label: "Volume Variance (Budget vs Actual)", value: fmtVar(result.volumeVariance), colorClass: result.volumeVariance > 0 ? "text-red-600" : "text-emerald-600" },
    { label: "Net vs Budget", value: fmtVar(result.netVsBudget), highlight: true, colorClass: result.netVsBudget > 0 ? "text-amber-700" : "text-emerald-700" },
  ];

  const summaryStats = [
    { label: "Units Produced", value: fmt(num(inputs.unitsProduced)) },
    { label: "Budgeted Units", value: fmt(num(inputs.budgetedUnits)) },
    { label: "Standard Cost / Unit", value: "$" + fmt(num(inputs.stdCostPerUnit), 2) },
    { label: "Actual Cost / Unit", value: "$" + fmt(num(inputs.actCostPerUnit), 2) },
    { label: "Standard Cost of Output", value: fmtMoney(result.stdCost) },
    { label: "Actual Cost of Output", value: fmtMoney(result.actCost) },
    { label: "Cost Variance", value: fmtVar(result.costVariance), bold: true },
    { label: "Variance %", value: result.variancePct.toFixed(1) + "%" },
    { label: "Volume Variance", value: fmtVar(result.volumeVariance) },
    { label: "Net vs Budget", value: fmtVar(result.netVsBudget) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Standard Cost Variance Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Standard Cost Variance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="scv-units" label="Units Produced" value={inputs.unitsProduced} onChange={set("unitsProduced")} suffix="units" />
              <NumInput id="scv-std" label="Standard Cost per Unit" value={inputs.stdCostPerUnit} onChange={set("stdCostPerUnit")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="scv-act" label="Actual Cost per Unit" value={inputs.actCostPerUnit} onChange={set("actCostPerUnit")} prefix="$" />
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
            >
              Advanced Options <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-1 animate-fade-in-up">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Budget Analysis</div>
                  <NumInput id="scv-budget" label="Budgeted Units" value={inputs.budgetedUnits} onChange={set("budgetedUnits")} suffix="units" />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All quantities and costs must be non-negative values.
              </p>
            )}

            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={handleReset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div ref={resultsRef} className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Cost Variance</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtVar(result.costVariance)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.costVariance > 0 ? "Unfavorable — " + result.variancePct.toFixed(1) + "% above standard cost" : "Favorable — " + (-result.variancePct).toFixed(1) + "% below standard cost"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost Variance</span>
                <span className={`font-extrabold ${result.costVariance > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmtVar(result.costVariance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Volume Variance</span>
                <span className={`font-extrabold ${result.volumeVariance > 0 ? "text-amber-600" : "text-emerald-600"}`}>{fmtVar(result.volumeVariance)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net vs Budget</span>
                <span className={`font-extrabold ${result.netVsBudget > 0 ? "text-red-600" : "text-emerald-600"}`}>{fmtVar(result.netVsBudget)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Variance Analysis</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.colorClass || (r.highlight ? "text-amber-700" : "text-foreground")}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is a Standard Cost Variance Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A standard cost variance calculator measures the difference between the cost a business planned for its production and the cost it actually incurred. Standard costing is the practice of setting an expected cost per unit in advance, based on efficient levels of material, labor, and overhead, and then comparing actual results against that standard every period. The difference is the variance, and it is one of the most important early warning signals in management accounting, because it separates the production story into two distinct questions: did the operation spend more or less than the standard for the output it made, and did it make more or less than the volume it planned for? This calculator answers both questions in dollars, showing the cost variance for the actual output, the volume variance between budgeted and actual production, and the net position against the original budget. Management can then investigate the variance with its causes already narrowed down.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes three core inputs. Units produced is the actual output for the period, the standard cost per unit is the expected cost the business planned for each unit, and the actual cost per unit is what production really cost per unit. The standard cost of output is the standard cost per unit multiplied by the units produced, and the actual cost of output is the actual cost per unit multiplied by the same volume, so both figures describe the same output. The cost variance is the actual cost of output minus the standard cost of output, and it isolates the spending question: whether the operation used its resources at the planned cost. A positive variance is unfavorable, meaning each unit cost more than the standard, and a negative variance is favorable, meaning production beat the standard.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the budgeted units for the period, which opens the second dimension of the analysis. The volume variance is the difference between the units actually produced and the budgeted units, multiplied by the standard cost per unit, and it answers whether the operation produced the volume it planned. The net versus budget figure subtracts the budgeted cost of the planned volume from the actual cost of the actual volume, combining both effects into the bottom-line position against the original plan. With the default inputs, producing 10,000 units at an actual cost of $26.50 against a $25.00 standard creates a $15,000 unfavorable cost variance, while producing 1,000 fewer units than the 11,000 budgeted creates a $25,000 favorable volume variance, for a net $10,000 favorable position against budget. That reconciliation is the heart of standard cost analysis: two variances moving in opposite directions that together explain the total.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total cost variance, and the first question it raises is whether the operation is spending at the planned rate for what it actually made. When the cost variance is unfavorable, look for price increases on materials, wage inflation, overtime, or waste in the conversion process; when it is favorable, verify the standard is still realistic rather than celebrating a fluke. The volume variance tells a different story: it is a planning outcome, not a spending outcome, and a large favorable volume variance simply means the operation produced more than budgeted, which is usually good news but can also mask idle capacity elsewhere. The net versus budget figure reconciles the two, and it is the number to compare against the original plan. Use the calculator each reporting period with actual production data, investigate any variance large enough to move profitability, and update standards whenever the underlying costs genuinely change, so the analysis keeps pointing at real problems instead of stale expectations.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/standard-cost-variance-calculator" />
        </div>
      </div>
    </>
  );
}