"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  inventoryValue: string;
  capitalPct: string;
  storagePct: string;
  insurancePct: string;
  obsolescencePct: string;
  shrinkagePct: string;
  unitsInStock: string;
  laborPct: string;
}

interface Result {
  totalPct: number;
  capitalCost: number;
  storageCost: number;
  insuranceCost: number;
  obsolescenceCost: number;
  shrinkageCost: number;
  laborCost: number;
  totalCost: number;
  costPerUnit: number;
}

const DEFAULTS: Inputs = {
  inventoryValue: "500000",
  capitalPct: "8",
  storagePct: "4",
  insurancePct: "2",
  obsolescencePct: "3",
  shrinkagePct: "1",
  unitsInStock: "10000",
  laborPct: "3",
};

function calculate(inputs: Inputs): Result {
  const inventoryValue = Math.max(0, parseFloat(inputs.inventoryValue) || 0);
  const capitalPct = Math.min(100, Math.max(0, parseFloat(inputs.capitalPct) || 0));
  const storagePct = Math.min(100, Math.max(0, parseFloat(inputs.storagePct) || 0));
  const insurancePct = Math.min(100, Math.max(0, parseFloat(inputs.insurancePct) || 0));
  const obsolescencePct = Math.min(100, Math.max(0, parseFloat(inputs.obsolescencePct) || 0));
  const shrinkagePct = Math.min(100, Math.max(0, parseFloat(inputs.shrinkagePct) || 0));
  const unitsInStock = Math.max(0, parseFloat(inputs.unitsInStock) || 0);
  const laborPct = Math.min(100, Math.max(0, parseFloat(inputs.laborPct) || 0));

  const totalPct = capitalPct + storagePct + insurancePct + obsolescencePct + shrinkagePct + laborPct;
  const capitalCost = (inventoryValue * capitalPct) / 100;
  const storageCost = (inventoryValue * storagePct) / 100;
  const insuranceCost = (inventoryValue * insurancePct) / 100;
  const obsolescenceCost = (inventoryValue * obsolescencePct) / 100;
  const shrinkageCost = (inventoryValue * shrinkagePct) / 100;
  const laborCost = (inventoryValue * laborPct) / 100;
  const totalCost = (inventoryValue * totalPct) / 100;
  const costPerUnit = unitsInStock > 0 ? totalCost / unitsInStock : 0;

  return { totalPct, capitalCost, storageCost, insuranceCost, obsolescenceCost, shrinkageCost, laborCost, totalCost, costPerUnit };
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

export default function InventoryHoldingCostCalculator() {
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
    num(inputs.inventoryValue) < 0 ||
    num(inputs.capitalPct) < 0 || num(inputs.capitalPct) > 100 ||
    num(inputs.storagePct) < 0 || num(inputs.storagePct) > 100 ||
    num(inputs.insurancePct) < 0 || num(inputs.insurancePct) > 100 ||
    num(inputs.obsolescencePct) < 0 || num(inputs.obsolescencePct) > 100 ||
    num(inputs.shrinkagePct) < 0 || num(inputs.shrinkagePct) > 100 ||
    num(inputs.unitsInStock) < 0 ||
    num(inputs.laborPct) < 0 || num(inputs.laborPct) > 100;

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
    { label: `Capital Cost (${fmt(num(inputs.capitalPct), 1)}%)`, value: fmtMoney(result.capitalCost) },
    { label: `Storage & Space (${fmt(num(inputs.storagePct), 1)}%)`, value: fmtMoney(result.storageCost) },
    { label: `Insurance & Taxes (${fmt(num(inputs.insurancePct), 1)}%)`, value: fmtMoney(result.insuranceCost) },
    { label: `Obsolescence (${fmt(num(inputs.obsolescencePct), 1)}%)`, value: fmtMoney(result.obsolescenceCost) },
    { label: `Shrinkage & Damage (${fmt(num(inputs.shrinkagePct), 1)}%)`, value: fmtMoney(result.shrinkageCost) },
    { label: `Labor & Handling (${fmt(num(inputs.laborPct), 1)}%)`, value: fmtMoney(result.laborCost) },
    { label: `Total Holding Cost (${fmt(result.totalPct, 1)}%)`, value: fmtMoney(result.totalCost), total: true },
    { label: "Cost per Unit in Stock", value: "$" + fmt(result.costPerUnit, 2), highlight: true },
  ];

  const summaryStats = [
    { label: "Avg Inventory Value", value: fmtMoney(num(inputs.inventoryValue)) },
    { label: "Total Holding Rate", value: fmt(result.totalPct, 1) + "%" },
    { label: "Capital Cost", value: fmtMoney(result.capitalCost) },
    { label: "Storage & Space", value: fmtMoney(result.storageCost) },
    { label: "Insurance & Taxes", value: fmtMoney(result.insuranceCost) },
    { label: "Obsolescence", value: fmtMoney(result.obsolescenceCost) },
    { label: "Shrinkage & Damage", value: fmtMoney(result.shrinkageCost) },
    { label: "Labor & Handling", value: fmtMoney(result.laborCost) },
    { label: "Total Annual Holding Cost", value: fmtMoney(result.totalCost), bold: true },
    { label: "Cost per Unit", value: "$" + fmt(result.costPerUnit, 2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Inventory Holding Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Inventory Holding Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="hold-value" label="Average Inventory Value" value={inputs.inventoryValue} onChange={set("inventoryValue")} prefix="$" />
              <NumInput id="hold-capital" label="Capital Cost" value={inputs.capitalPct} onChange={set("capitalPct")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="hold-storage" label="Storage & Space Cost" value={inputs.storagePct} onChange={set("storagePct")} suffix="%" />
              <NumInput id="hold-insurance" label="Insurance & Taxes" value={inputs.insurancePct} onChange={set("insurancePct")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Other Holding Factors</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="hold-obsolescence" label="Obsolescence Rate" value={inputs.obsolescencePct} onChange={set("obsolescencePct")} suffix="%" />
                    <NumInput id="hold-shrinkage" label="Shrinkage & Damage" value={inputs.shrinkagePct} onChange={set("shrinkagePct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="hold-labor" label="Labor & Handling" value={inputs.laborPct} onChange={set("laborPct")} suffix="%" />
                    <NumInput id="hold-units" label="Units in Stock" value={inputs.unitsInStock} onChange={set("unitsInStock")} suffix="units" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All rates must be between 0 and 100; inventory value and units must be non-negative.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual Holding Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalCost)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.totalPct, 1)}% of {fmtMoney(num(inputs.inventoryValue))} in average inventory</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Combined Rate</span>
                <span className="font-extrabold text-amber-600">{fmt(result.totalPct, 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Capital Cost</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.capitalCost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Unit</span>
                <span className="font-extrabold text-red-600">${fmt(result.costPerUnit, 2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Holding Cost Components</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is an Inventory Holding Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An inventory holding cost calculator estimates the annual expense of carrying stock, including every cost that comes from simply owning inventory rather than selling it. Holding cost, also called carrying cost, is one of the largest hidden costs in a product business, and industry studies consistently put it between 20% and 30% of inventory value per year. The cost is made up of several distinct components: the capital tied up in the stock, which could otherwise earn interest or fund growth; the warehouse space and utilities the inventory occupies; insurance and property taxes on the goods; the risk of obsolescence as products age; shrinkage from theft, damage, and loss; and the labor involved in handling and managing the stock. Each component is a percentage of inventory value, so the total holding cost is the inventory value multiplied by the sum of all those percentages. This tool adds the components up transparently, showing exactly where the carrying burden comes from and how much each factor costs in dollars.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with the average inventory value, the typical dollar amount of stock on hand during the year, which is best estimated as the average of month-end inventory balances. The first three inputs are the percentage rates for the core holding factors. The capital cost is the company's cost of capital or the interest forgone by having cash tied up in stock. The storage and space cost covers rent, utilities, and equipment depreciation per dollar of inventory. The insurance and taxes rate covers premiums and property taxes on the goods. Each of these percentages is multiplied by the inventory value to produce a dollar cost, and the three core rates are summed to give the baseline holding percentage, which with the default inputs is 14% before any advanced factors are added.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the remaining components. The obsolescence rate reflects the share of inventory value written off each year as products go stale or out of date, and the shrinkage and damage rate reflects theft, breakage, and loss. The labor and handling rate captures the warehouse staffing cost attributable to inventory management. Each advanced percentage is also applied to the inventory value, and all six components are summed to give the total holding rate, which is then applied to the inventory value for the total annual holding cost. The units in stock input converts the total into a cost per unit, which is useful for pricing decisions and for comparing the carrying burden of different SKUs. With the default inputs, a $500,000 average inventory with an 8% capital cost, 4% storage, 2% insurance, 3% obsolescence, 1% shrinkage, and 3% labor carries a 21% combined rate and roughly $105,000 of annual holding cost, about $10.50 per unit.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total annual holding cost, and the breakdown shows which component dominates. Capital cost is usually the largest single line, which is why reducing inventory days on hand is one of the most effective cash-flow improvements a business can make: every dollar of stock converted to cash stops accruing holding cost immediately. Compare the total holding cost against the gross margin the inventory generates, and any product line whose holding cost consumes a significant share of its margin is a candidate for smaller order quantities, dropshipping, or elimination. The cost per unit is the figure to embed in SKU-level decisions, such as whether a slow-moving item is worth reordering. Use the calculator before setting safety stock levels and economic order quantities, because the holding rate is the key input to both, and a realistic rate produces reorder policies that balance stock-out risk against carrying burden rather than overstocking out of caution.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/inventory-holding-cost-calculator" />
        </div>
      </div>
    </>
  );
}