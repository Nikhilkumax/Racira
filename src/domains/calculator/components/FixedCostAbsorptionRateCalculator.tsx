"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  totalFixedCosts: string;
  totalUnits: string;
  totalLaborHours: string;
  totalMachineHours: string;
  totalLaborCost: string;
  totalRevenue: string;
}

interface Result {
  ratePerUnit: number;
  ratePerLaborHour: number;
  ratePerMachineHour: number;
  ratePerLaborDollar: number;
  ratePerRevenueDollar: number;
  absorptionPerUnit: number;
  utilizationPct: number;
}

const DEFAULTS: Inputs = {
  totalFixedCosts: "250000",
  totalUnits: "40000",
  totalLaborHours: "12000",
  totalMachineHours: "8000",
  totalLaborCost: "420000",
  totalRevenue: "950000",
};

function calculate(inputs: Inputs): Result {
  const totalFixedCosts = Math.max(0, parseFloat(inputs.totalFixedCosts) || 0);
  const totalUnits = Math.max(0, parseFloat(inputs.totalUnits) || 0);
  const totalLaborHours = Math.max(0, parseFloat(inputs.totalLaborHours) || 0);
  const totalMachineHours = Math.max(0, parseFloat(inputs.totalMachineHours) || 0);
  const totalLaborCost = Math.max(0, parseFloat(inputs.totalLaborCost) || 0);
  const totalRevenue = Math.max(0, parseFloat(inputs.totalRevenue) || 0);

  const ratePerUnit = totalUnits > 0 ? totalFixedCosts / totalUnits : 0;
  const ratePerLaborHour = totalLaborHours > 0 ? totalFixedCosts / totalLaborHours : 0;
  const ratePerMachineHour = totalMachineHours > 0 ? totalFixedCosts / totalMachineHours : 0;
  const ratePerLaborDollar = totalLaborCost > 0 ? (totalFixedCosts / totalLaborCost) * 100 : 0;
  const ratePerRevenueDollar = totalRevenue > 0 ? (totalFixedCosts / totalRevenue) * 100 : 0;

  const rates = [ratePerUnit > 0 ? ratePerUnit : null, ratePerLaborHour > 0 ? ratePerLaborHour : null, ratePerMachineHour > 0 ? ratePerMachineHour : null].filter((r): r is number => r !== null);
  const absorptionPerUnit = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
  const utilizationPct = totalFixedCosts > 0 ? (totalRevenue - totalLaborCost > 0 ? Math.min(100, ((totalRevenue - totalLaborCost) / totalFixedCosts) * 100) : 0) : 0;

  return { ratePerUnit, ratePerLaborHour, ratePerMachineHour, ratePerLaborDollar, ratePerRevenueDollar, absorptionPerUnit, utilizationPct };
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

const FixedCostAbsorptionRateCalculator = () => {
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
    num(inputs.totalFixedCosts) < 0 || num(inputs.totalUnits) < 0 ||
    num(inputs.totalLaborHours) < 0 || num(inputs.totalMachineHours) < 0 ||
    num(inputs.totalLaborCost) < 0 || num(inputs.totalRevenue) < 0;

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
    { label: "Total Fixed Costs", value: fmtMoney(num(inputs.totalFixedCosts)) },
    { label: "Total Units Produced", value: fmt(num(inputs.totalUnits)) },
    { label: "Total Labor Hours", value: fmt(num(inputs.totalLaborHours)) },
    { label: "Total Machine Hours", value: fmt(num(inputs.totalMachineHours)) },
    { label: "Rate per Unit", value: fmt2(result.ratePerUnit) },
    { label: "Rate per Labor Hour", value: fmt2(result.ratePerLaborHour) },
    { label: "Rate per Machine Hour", value: fmt2(result.ratePerMachineHour) },
    { label: "Rate per Labor Dollar", value: `${fmt(result.ratePerLaborDollar, 1)}%` },
    { label: "Rate per Revenue Dollar", value: `${fmt(result.ratePerRevenueDollar, 1)}%` },
    { label: "Capacity Utilization", value: `${fmt(result.utilizationPct, 1)}%` },
  ];

  return (
    <div className="racira-page-container py-4" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="fixed-costs" label="Total Fixed Costs" value={inputs.totalFixedCosts} onChange={set("totalFixedCosts")} prefix="$" />
            <NumInput id="total-units" label="Total Units" value={inputs.totalUnits} onChange={set("totalUnits")} />
            <NumInput id="labor-hours" label="Total Labor Hours" value={inputs.totalLaborHours} onChange={set("totalLaborHours")} />
            <NumInput id="machine-hours" label="Total Machine Hours" value={inputs.totalMachineHours} onChange={set("totalMachineHours")} />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cost Base</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="labor-cost" label="Total Labor Cost" value={inputs.totalLaborCost} onChange={set("totalLaborCost")} prefix="$" />
                  <NumInput id="revenue" label="Total Revenue" value={inputs.totalRevenue} onChange={set("totalRevenue")} prefix="$" />
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Absorption Rate per Unit</div>
            <div className="text-4xl font-bold text-primary">{fmt2(result.ratePerUnit)}</div>
            <div className="text-sm text-muted-foreground mt-1">per unit at {fmt(num(inputs.totalUnits))} units of production</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Per Labor Hour</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.ratePerLaborHour)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Per Machine Hour</div>
              <div className="text-lg font-bold mt-1">{fmt2(result.ratePerMachineHour)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Per Revenue Dollar</div>
              <div className="text-lg font-bold text-emerald-600 mt-1">{fmt(result.ratePerRevenueDollar, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Absorption Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Average Absorption (Unit/Labor/Machine)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{fmt2(result.absorptionPerUnit)}</td>
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
                <div className="text-xs text-muted-foreground">Average Absorption (Unit/Labor/Machine)</div>
                <div className="text-base font-bold text-primary">{fmt2(result.absorptionPerUnit)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is the Fixed Cost Absorption Rate?</h2>
            <p className="text-muted-foreground leading-relaxed">The fixed cost absorption rate is the amount of fixed overhead that must be attached to each unit of activity for a business to cover its fixed costs. Fixed costs — rent, salaries, insurance, equipment depreciation — do not change with production volume, so they must be spread across the units, hours, or revenue dollars the operation actually produces. Absorption costing assigns those overhead costs to products so that inventory and cost of goods sold carry their fair share, and the absorption rate is the conversion factor: divide total fixed costs by the chosen activity base. A plant producing 40,000 units with $250,000 of fixed costs absorbs $6.25 per unit; the same fixed costs spread over 12,000 labor hours give a rate of $20.83 per hour. The choice of base changes the answer, which is why managers usually track several rates side by side.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Absorption Rates Are Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Each rate is total fixed costs divided by a different measure of activity. Per-unit divides fixed costs by units produced; per-labor-hour divides by direct labor hours; per-machine-hour divides by machine hours; per-labor-dollar and per-revenue-dollar express the fixed cost burden as a percentage of labor cost or revenue. The average absorption figure is the mean of the unit, labor-hour, and machine-hour rates, giving a single blended view of how heavily fixed costs weigh on each unit of output. Capacity utilization compares the contribution left after labor cost to the total fixed cost base, showing what share of the fixed burden is covered by the current operating level — at low utilization the same fixed costs must be carried by fewer units, which pushes every rate higher. These rates feed directly into product costing: multiply the per-unit rate by the units in a job to attach its share of overhead. Budgeting uses the same arithmetic in reverse — forecast the activity base, divide the planned fixed costs by it, and you have the overhead rate to load into next year's quotes and work orders. Because the rates are recalculated from actuals each period, the calculator also supports month-end review: comparing the actual absorption rate against the budgeted rate shows whether under- or over-absorption is about to hit the income statement, and by how much. A rate that drifts upward across several months usually means volume is falling faster than fixed costs, the earliest practical warning that capacity is underutilized.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Read the rates against your pricing and quoting process. If the per-unit rate is high relative to your selling price, fixed costs are consuming a large share of each sale and volume must increase, or overhead must be cut, before margins improve. A falling per-unit rate as production grows is the classic sign of healthy operating leverage — the same fixed costs spread over more units. Watch the utilization percentage as the early-warning number: when it drops, every subsequent rate climbs automatically. In management accounting, the absorption rate is also the key to avoiding under- or over-absorbed overhead at year end; the rate you budget at the start of the period rarely matches actual activity, and the difference lands in the profit and loss. Use these figures to set overhead rates for quoting, to compare the cost structure of different products, and to model what happens to unit costs when volume changes.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/fixed-cost-absorption-rate-calculator" />
      </div>
    </div>
  );
};

export default FixedCostAbsorptionRateCalculator;