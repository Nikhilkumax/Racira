"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  listPrice: string;
  standardQty: string;
  standardDiscount: string;
  volumeQty: string;
  volumeDiscount: string;
  variableCostPerUnit: string;
  fixedCosts: string;
}

interface Result {
  stdRevenue: number;
  volRevenue: number;
  stdContribution: number;
  volContribution: number;
  stdProfit: number;
  volProfit: number;
  profitDelta: number;
  profitDeltaPct: number;
  breakEvenQty: number;
  recommendation: string;
}

const DEFAULTS: Inputs = {
  listPrice: "100",
  standardQty: "1000",
  standardDiscount: "5",
  volumeQty: "2500",
  volumeDiscount: "12",
  variableCostPerUnit: "55",
  fixedCosts: "15000",
};

function calculate(inputs: Inputs): Result {
  const listPrice = Math.max(0, parseFloat(inputs.listPrice) || 0);
  const standardQty = Math.max(0, parseFloat(inputs.standardQty) || 0);
  const standardDiscount = Math.min(100, Math.max(0, parseFloat(inputs.standardDiscount) || 0));
  const volumeQty = Math.max(0, parseFloat(inputs.volumeQty) || 0);
  const volumeDiscount = Math.min(100, Math.max(0, parseFloat(inputs.volumeDiscount) || 0));
  const variableCostPerUnit = Math.max(0, parseFloat(inputs.variableCostPerUnit) || 0);
  const fixedCosts = Math.max(0, parseFloat(inputs.fixedCosts) || 0);

  const stdNetPrice = listPrice * (1 - standardDiscount / 100);
  const volNetPrice = listPrice * (1 - volumeDiscount / 100);
  const stdRevenue = stdNetPrice * standardQty;
  const volRevenue = volNetPrice * volumeQty;
  const stdContribution = (stdNetPrice - variableCostPerUnit) * standardQty;
  const volContribution = (volNetPrice - variableCostPerUnit) * volumeQty;
  const stdProfit = stdContribution - fixedCosts;
  const volProfit = volContribution - fixedCosts;
  const profitDelta = volProfit - stdProfit;
  const profitDeltaPct = Math.abs(stdProfit) > 0 ? (profitDelta / Math.abs(stdProfit)) * 100 : 0;
  const breakEvenQty = (volNetPrice - variableCostPerUnit) > 0 ? fixedCosts / (volNetPrice - variableCostPerUnit) : 0;

  let recommendation = "Not profitable — the volume order loses money.";
  if (profitDelta > 0) recommendation = "Accept the volume order — profit increases.";
  else if (profitDelta === 0) recommendation = "Break-even — the volume order adds no profit.";

  return { stdRevenue, volRevenue, stdContribution, volContribution, stdProfit, volProfit, profitDelta, profitDeltaPct, breakEvenQty, recommendation };
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

const VolumeDiscountProfitabilityCalculator = () => {
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
    num(inputs.listPrice) < 0 ||
    num(inputs.standardQty) < 0 ||
    num(inputs.standardDiscount) < 0 || num(inputs.standardDiscount) > 100 ||
    num(inputs.volumeQty) < 0 ||
    num(inputs.volumeDiscount) < 0 || num(inputs.volumeDiscount) > 100 ||
    num(inputs.variableCostPerUnit) < 0 ||
    num(inputs.fixedCosts) < 0;

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
    { label: "Standard Order Revenue", value: fmtMoney(result.stdRevenue) },
    { label: "Volume Order Revenue", value: fmtMoney(result.volRevenue) },
    { label: "Standard Contribution", value: fmtMoney(result.stdContribution) },
    { label: "Volume Contribution", value: fmtMoney(result.volContribution) },
    { label: "Standard Profit", value: fmtMoney(result.stdProfit) },
    { label: "Volume Profit", value: fmtMoney(result.volProfit) },
    { label: "Profit Delta", value: `${result.profitDelta >= 0 ? "+" : ""}${fmtMoney(result.profitDelta)}` },
    { label: "Delta as % of Standard Profit", value: `${result.profitDeltaPct >= 0 ? "+" : ""}${fmt(result.profitDeltaPct, 1)}%` },
    { label: "Volume Break-even Qty", value: fmt(result.breakEvenQty) },
    { label: "Decision", value: result.recommendation },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="list-price" label="List Price per Unit" value={inputs.listPrice} onChange={set("listPrice")} prefix="$" />
            <NumInput id="standard-qty" label="Standard Order Qty" value={inputs.standardQty} onChange={set("standardQty")} />
            <NumInput id="volume-qty" label="Volume Order Qty" value={inputs.volumeQty} onChange={set("volumeQty")} />
            <NumInput id="volume-discount" label="Volume Discount" value={inputs.volumeDiscount} onChange={set("volumeDiscount")} suffix="%" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Standard Terms</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="standard-discount" label="Standard Discount" value={inputs.standardDiscount} onChange={set("standardDiscount")} suffix="%" />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Cost Structure</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="variable-cost" label="Variable Cost per Unit" value={inputs.variableCostPerUnit} onChange={set("variableCostPerUnit")} prefix="$" />
                  <NumInput id="fixed-costs" label="Fixed Costs (period)" value={inputs.fixedCosts} onChange={set("fixedCosts")} prefix="$" />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — discounts must be between 0 and 100%.</p>
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
            <div className="text-xs uppercase tracking-wide text-muted-foreground">Profit Delta</div>
            <div className="text-4xl font-bold text-primary">{result.profitDelta >= 0 ? "+" : ""}{fmtMoney(result.profitDelta)}</div>
            <div className="text-sm text-muted-foreground mt-1">{result.recommendation}</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Standard Profit</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.stdProfit)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Volume Profit</div>
              <div className="text-lg font-bold mt-1">{fmtMoney(result.volProfit)}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Delta vs Standard</div>
              <div className={`text-lg font-bold mt-1 ${result.profitDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>{result.profitDeltaPct >= 0 ? "+" : ""}{fmt(result.profitDeltaPct, 1)}%</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Order Comparison</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">Profit Delta</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{result.profitDelta >= 0 ? "+" : ""}{fmtMoney(result.profitDelta)}</td>
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
                <div className="text-xs text-muted-foreground">Profit Delta</div>
                <div className="text-base font-bold text-primary">{result.profitDelta >= 0 ? "+" : ""}{fmtMoney(result.profitDelta)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is Volume Discount Profitability?</h2>
            <p className="text-muted-foreground leading-relaxed">Volume discount profitability measures whether a large order at a deeper discount actually earns more profit than the standard order the customer would otherwise place. Volume discounts feel like a win — more units, more revenue — but the deeper discount shrinks the margin on every unit, and the extra volume only helps if the discounted net price still clears the variable cost of producing each unit. The decision is never about revenue: it is about contribution, the money left after variable costs, and whether the bigger order's contribution exceeds the smaller order's by enough to matter. This calculator compares both orders through the same lens — net price after discount, contribution per unit, total contribution, and profit after fixed costs — so the trade-off is visible in a single set of numbers rather than buried in a sales spreadsheet.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How Volume Discount Profitability Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">Both orders start from the same list price. The standard order's net price is the list price minus the standard discount, and the volume order's net price is the list price minus the deeper volume discount. Revenue is the net price times the quantity of each order. Contribution subtracts the variable cost per unit from the net price and multiplies by the quantity — this is the true measure of what each order adds, because variable cost is the cost that actually changes with volume. Fixed costs for the period are then subtracted from each order's contribution to produce a profit figure for each scenario, making the two orders directly comparable. The profit delta is the decision number: the volume order's profit minus the standard order's profit. A positive delta means the extra units more than compensate for the thinner margin; a negative delta means the discount is too deep and the order destroys profit compared with the smaller one. The delta is also expressed as a percentage of the standard order's profit to show the relative size of the gain or loss. Finally, the break-even quantity shows how many units the volume order must move at its discounted price to cover the fixed costs — the floor below which the order cannot profitably go. The model treats variable cost per unit as constant across both order sizes; if the volume order brings real purchasing savings or forces overtime, adjust the variable cost accordingly and re-run.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Start with the profit delta and the recommendation line. A negative delta is the classic "winning the order, losing money" trap — the sales team celebrates revenue while contribution shrinks. When the delta is positive but small relative to the revenue swing, the order is worth taking but leaves little room for further concessions. The volume break-even quantity is the number to quote back to a customer pushing for a bigger discount: it defines the floor below which the order cannot profitably go at the proposed price. The breakdown table shows where the money actually flows in each scenario, and the percentage delta tells you how large the improvement or damage is relative to your baseline. Run the comparison at several quantity and discount combinations to map the trade-off curve before negotiating, and remember that fixed costs only matter to the decision if the volume order changes them — if not, compare contributions instead of profits. Finally, watch for margin compression across the whole customer relationship: a volume discount granted on one order becomes the reference point for the next negotiation, so the discount you approve today quietly sets the ceiling for tomorrow's conversation.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/volume-discount-profitability-calculator" />
      </div>
    </div>
  );
};

export default VolumeDiscountProfitabilityCalculator;