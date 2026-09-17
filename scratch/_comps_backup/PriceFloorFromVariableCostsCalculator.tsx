"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  unitCost: string;
  targetMargin: string;
  shipping: string;
  processingFee: string;
  commission: string;
  discountAllowance: string;
  fixedOverhead: string;
  unitsPerMonth: string;
  desiredProfit: string;
}

interface Result {
  feeRate: number;
  overheadPerUnit: number;
  pureVariableFloor: number;
  fullCostFloor: number;
  targetPrice: number;
  profitAtTarget: number;
  marginAtTarget: number;
  totalCostAtTarget: number;
}

const DEFAULTS: Inputs = {
  unitCost: "12.50",
  targetMargin: "40",
  shipping: "2.50",
  processingFee: "2.9",
  commission: "5",
  discountAllowance: "5",
  fixedOverhead: "8000",
  unitsPerMonth: "2000",
  desiredProfit: "4.00",
};

function calculate(inputs: Inputs): Result {
  const unitCost = Math.max(0, parseFloat(inputs.unitCost) || 0);
  const shipping = Math.max(0, parseFloat(inputs.shipping) || 0);
  const processingFee = Math.min(100, Math.max(0, parseFloat(inputs.processingFee) || 0));
  const commission = Math.min(100, Math.max(0, parseFloat(inputs.commission) || 0));
  const discountAllowance = Math.min(100, Math.max(0, parseFloat(inputs.discountAllowance) || 0));
  const targetMargin = Math.min(95, Math.max(0, parseFloat(inputs.targetMargin) || 0));
  const fixedOverhead = Math.max(0, parseFloat(inputs.fixedOverhead) || 0);
  const unitsPerMonth = Math.max(1, parseFloat(inputs.unitsPerMonth) || 1);
  const desiredProfit = Math.max(0, parseFloat(inputs.desiredProfit) || 0);

  const feeRate = (processingFee + commission + discountAllowance) / 100;
  const overheadPerUnit = fixedOverhead / unitsPerMonth;
  const pureVariableFloor = feeRate < 1 ? (unitCost + shipping) / (1 - feeRate) : 0;
  const fullCostFloor = feeRate < 1 ? (unitCost + shipping + overheadPerUnit) / (1 - feeRate) : 0;
  const targetPrice = feeRate < 1 ? (unitCost + shipping + overheadPerUnit + desiredProfit) / (1 - feeRate) : 0;
  const totalCostAtTarget = unitCost + shipping + overheadPerUnit + targetPrice * feeRate;
  const profitAtTarget = targetPrice - totalCostAtTarget;
  const marginAtTarget = targetPrice > 0 ? (profitAtTarget / targetPrice) * 100 : 0;

  return { feeRate, overheadPerUnit, pureVariableFloor, fullCostFloor, targetPrice, profitAtTarget, marginAtTarget, totalCostAtTarget };
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
const fmtMoney = (n: number) => "$" + fmt(n, 2);

export default function PriceFloorFromVariableCostsCalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const feeSum = num(inputs.processingFee) + num(inputs.commission) + num(inputs.discountAllowance);

  const hasErrors =
    num(inputs.unitCost) < 0 ||
    num(inputs.shipping) < 0 ||
    num(inputs.processingFee) < 0 || num(inputs.processingFee) > 100 ||
    num(inputs.commission) < 0 || num(inputs.commission) > 100 ||
    num(inputs.discountAllowance) < 0 || num(inputs.discountAllowance) > 100 ||
    num(inputs.targetMargin) < 0 || num(inputs.targetMargin) >= 95 ||
    num(inputs.fixedOverhead) < 0 ||
    num(inputs.unitsPerMonth) <= 0 ||
    num(inputs.desiredProfit) < 0 ||
    feeSum >= 95;

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

  const rows: { label: string; value: string; total?: boolean; highlight?: boolean }[] = [
    { label: "Variable Cost per Unit", value: fmtMoney(num(inputs.unitCost)) },
    { label: "Shipping per Unit", value: fmtMoney(num(inputs.shipping)) },
    { label: `Fee Load (${fmt(num(inputs.processingFee), 1)}% + ${fmt(num(inputs.commission), 1)}% + ${fmt(num(inputs.discountAllowance), 1)}%)`, value: fmt(result.feeRate * 100, 1) + "%" },
    { label: "Overhead per Unit", value: fmtMoney(result.overheadPerUnit) },
    { label: "Pure Variable-Cost Floor", value: fmtMoney(result.pureVariableFloor), highlight: true },
    { label: "Full-Cost Floor (incl. overhead)", value: fmtMoney(result.fullCostFloor) },
    { label: "Target Price (at target margin)", value: fmtMoney(result.targetPrice) },
    { label: "Profit per Unit at Target Price", value: fmtMoney(result.profitAtTarget) },
    { label: "Margin at Target Price", value: fmt(result.marginAtTarget, 1) + "%" },
  ];

  const summaryStats: { label: string; value: string; bold?: boolean }[] = [
    { label: "Variable Cost / Unit", value: fmtMoney(num(inputs.unitCost)) },
    { label: "Shipping / Unit", value: fmtMoney(num(inputs.shipping)) },
    { label: "Fee Load", value: fmt(result.feeRate * 100, 1) + "%" },
    { label: "Overhead / Unit", value: fmtMoney(result.overheadPerUnit) },
    { label: "Pure Variable Floor", value: fmtMoney(result.pureVariableFloor) },
    { label: "Full-Cost Floor", value: fmtMoney(result.fullCostFloor) },
    { label: "Target Price", value: fmtMoney(result.targetPrice) },
    { label: "Profit / Unit at Target", value: fmtMoney(result.profitAtTarget) },
    { label: "Margin at Target", value: fmt(result.marginAtTarget, 1) + "%" },
    { label: "Target Margin", value: fmt(num(inputs.targetMargin)) + "%" },
    { label: "Fixed Overhead / Month", value: fmtMoney(num(inputs.fixedOverhead)) },
    { label: "Units / Month", value: fmt(num(inputs.unitsPerMonth)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Price Floor from Variable Costs Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Price Floor from Variable Costs Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pf-unit-cost" label="Variable Cost per Unit" value={inputs.unitCost} onChange={set("unitCost")} prefix="$" />
              <NumInput id="pf-target-margin" label="Target Contribution Margin" value={inputs.targetMargin} onChange={set("targetMargin")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pf-shipping" label="Shipping per Unit" value={inputs.shipping} onChange={set("shipping")} prefix="$" />
              <NumInput id="pf-processing" label="Payment Processing Fee" value={inputs.processingFee} onChange={set("processingFee")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="pf-commission" label="Sales Commission" value={inputs.commission} onChange={set("commission")} suffix="%" />
              <NumInput id="pf-discount" label="Discount Allowance" value={inputs.discountAllowance} onChange={set("discountAllowance")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Overhead Allocation</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pf-overhead" label="Fixed Overhead (Monthly)" value={inputs.fixedOverhead} onChange={set("fixedOverhead")} prefix="$" />
                    <NumInput id="pf-units" label="Units per Month" value={inputs.unitsPerMonth} onChange={set("unitsPerMonth")} suffix="units" />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Pricing Strategy</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="pf-profit" label="Desired Profit per Unit" value={inputs.desiredProfit} onChange={set("desiredProfit")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Costs must be non-negative; units per month must be greater than zero; each fee and the target margin must be below 95%; the combined fee load must stay below 95%.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Price Floor (Variable-Cost)</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.pureVariableFloor)}</div>
              <div className="text-sm text-muted-foreground font-medium">minimum unit price before covering fees of {fmt(result.feeRate * 100, 1)}%</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full-Cost Floor</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.fullCostFloor)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Overhead / Unit</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.overheadPerUnit)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Price</span>
                <span className="font-extrabold text-emerald-600">{fmtMoney(result.targetPrice)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Pricing Breakdown</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[180px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 pl-4 pr-3 text-base font-medium ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 pl-3 pr-4 text-right text-base font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Price Floor from Variable Costs Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A price floor from variable costs calculator finds the absolute lowest price a product can be sold for without losing money on each unit. Every sale carries direct costs that scale with volume — the product itself, shipping, payment processing, sales commissions, and the discounts you routinely give — and the price floor is the point where those costs exactly consume the selling price. Price below it and every order drains cash; price at it and the business breaks even on the unit, before fixed overhead is even considered. This tool computes that floor two ways: the pure variable-cost floor, which covers only the costs that change with each unit, and the full-cost floor, which also allocates a share of fixed monthly overhead like rent, equipment, and salaries. Between them lies the practical minimum a pricing team needs when setting clearance prices, negotiating with distributors, or evaluating whether a low-margin channel is worth entering at all.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The model starts with the direct costs per unit: the variable cost of goods plus shipping. It then converts the payment processing fee, sales commission, and discount allowance into a combined fee rate — with the defaults, 2.9% plus 5% plus 5% equals 12.9% of every sale that never reaches the business. Because those fees are percentages of the selling price, the floor cannot be found by simple addition; it must be solved by dividing the cash costs by one minus the fee rate. With a $12.50 unit cost and $2.50 shipping, the pure floor is $15.00 divided by 0.871, or $17.22. The full-cost floor adds the allocated overhead, $8,000 of monthly fixed costs spread across 2,000 units being $4.00 per unit, which pushes the floor to $21.81. The target price extends the same logic by adding the desired profit per unit into the numerator, and the margin at that price shows the actual contribution margin you earn after every fee is paid. The result is a ladder from break-even to profitability that pricing decisions can be checked against.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The pure variable-cost floor is the line you should never cross, even in a fire sale — anything below it guarantees a loss on every unit. The full-cost floor is the practical break-even for a healthy business, since selling below it means the product cannot contribute to rent, salaries, and other fixed costs. If your actual selling price sits between the two floors, you are cash-positive but margin-negative, which is only defensible as a temporary customer-acquisition play. Compare the target price against your current price: the margin at the target shows what a correct price yields, and the gap between floors and current pricing exposes how much pricing headroom you are leaving on the table. Re-run the calculation whenever the fee structure changes — a marketplace raising its take rate by a point can silently move the floor more than a supplier price increase does. Use the full-cost floor as the baseline for channel negotiations, minimum-advertised-price policies, and deciding which products deserve premium shelf placement.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/price-floor-from-variable-costs-calculator" />
        </div>
      </div>
    </>
  );
}