"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  space: string;
  rentPerSqFt: string;
  laborMonthly: string;
  otherAnnual: string;
  ordersPerYear: string;
  inventoryValue: string;
  holdingPct: string;
}

interface Result {
  rentAnnual: number;
  laborAnnual: number;
  holdingAnnual: number;
  totalAnnual: number;
  costPerOrder: number;
  costPerSqFt: number;
}

const DEFAULTS: Inputs = {
  space: "100000",
  rentPerSqFt: "8.50",
  laborMonthly: "120000",
  otherAnnual: "250000",
  ordersPerYear: "600000",
  inventoryValue: "2000000",
  holdingPct: "25",
};

function calculate(inputs: Inputs): Result {
  const space = Math.max(0, parseFloat(inputs.space) || 0);
  const rentPerSqFt = Math.max(0, parseFloat(inputs.rentPerSqFt) || 0);
  const laborMonthly = Math.max(0, parseFloat(inputs.laborMonthly) || 0);
  const otherAnnual = Math.max(0, parseFloat(inputs.otherAnnual) || 0);
  const ordersPerYear = Math.max(0, parseFloat(inputs.ordersPerYear) || 0);
  const inventoryValue = Math.max(0, parseFloat(inputs.inventoryValue) || 0);
  const holdingPct = Math.min(100, Math.max(0, parseFloat(inputs.holdingPct) || 0));

  const rentAnnual = space * rentPerSqFt;
  const laborAnnual = laborMonthly * 12;
  const holdingAnnual = (inventoryValue * holdingPct) / 100;
  const totalAnnual = rentAnnual + laborAnnual + otherAnnual + holdingAnnual;
  const costPerOrder = ordersPerYear > 0 ? totalAnnual / ordersPerYear : 0;
  const costPerSqFt = space > 0 ? totalAnnual / space : 0;

  return { rentAnnual, laborAnnual, holdingAnnual, totalAnnual, costPerOrder, costPerSqFt };
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

export default function DistributionCenterCostCalculator() {
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
    num(inputs.space) <= 0 ||
    num(inputs.rentPerSqFt) < 0 ||
    num(inputs.laborMonthly) < 0 ||
    num(inputs.otherAnnual) < 0 ||
    num(inputs.ordersPerYear) < 0 ||
    num(inputs.inventoryValue) < 0 ||
    num(inputs.holdingPct) < 0 || num(inputs.holdingPct) > 100;

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
    { label: "Warehouse Space", value: fmt(num(inputs.space)) + " sq ft" },
    { label: `Rent (${fmt(num(inputs.rentPerSqFt), 2)}/sq ft/yr)`, value: fmtMoney(result.rentAnnual) },
    { label: "Labor", value: fmtMoney(result.laborAnnual) },
    { label: "Utilities, Equipment & Other", value: fmtMoney(num(inputs.otherAnnual)) },
    { label: `Inventory Holding Cost (${fmt(num(inputs.holdingPct), 1)}%)`, value: fmtMoney(result.holdingAnnual) },
    { label: "Total Annual DC Cost", value: fmtMoney(result.totalAnnual), total: true },
    { label: "Cost per Order", value: "$" + fmt(result.costPerOrder, 2), highlight: true },
    { label: "Cost per Square Foot", value: "$" + fmt(result.costPerSqFt, 2) },
  ];

  const summaryStats = [
    { label: "Warehouse Space", value: fmt(num(inputs.space)) + " sq ft" },
    { label: "Rent per Sq Ft / Yr", value: "$" + fmt(num(inputs.rentPerSqFt), 2) },
    { label: "Annual Rent", value: fmtMoney(result.rentAnnual) },
    { label: "Annual Labor", value: fmtMoney(result.laborAnnual) },
    { label: "Other Operating Costs", value: fmtMoney(num(inputs.otherAnnual)) },
    { label: "Inventory Holding", value: fmtMoney(result.holdingAnnual) },
    { label: "Total Annual Cost", value: fmtMoney(result.totalAnnual), bold: true },
    { label: "Cost per Order", value: "$" + fmt(result.costPerOrder, 2) },
    { label: "Cost per Sq Ft", value: "$" + fmt(result.costPerSqFt, 2) },
    { label: "Orders per Year", value: fmt(num(inputs.ordersPerYear)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Distribution Center Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Distribution Center Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dc-space" label="Warehouse Space" value={inputs.space} onChange={set("space")} suffix="sq ft" />
              <NumInput id="dc-rent" label="Rent per Sq Ft per Year" value={inputs.rentPerSqFt} onChange={set("rentPerSqFt")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dc-labor" label="Labor Cost per Month" value={inputs.laborMonthly} onChange={set("laborMonthly")} prefix="$" />
              <NumInput id="dc-other" label="Annual Other Operating Costs" value={inputs.otherAnnual} onChange={set("otherAnnual")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Throughput & Inventory</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dc-orders" label="Orders per Year" value={inputs.ordersPerYear} onChange={set("ordersPerYear")} suffix="orders" />
                    <NumInput id="dc-holding" label="Inventory Holding Cost" value={inputs.holdingPct} onChange={set("holdingPct")} suffix="%" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="dc-inventory" label="Average Inventory Value" value={inputs.inventoryValue} onChange={set("inventoryValue")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Warehouse space must be greater than zero; all costs must be non-negative; holding cost must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual DC Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalAnnual)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.costPerOrder)} per order — {fmtMoney(result.costPerSqFt)} per sq ft</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Rent</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.rentAnnual)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Labor</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.laborAnnual)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost per Order</span>
                <span className="font-extrabold text-red-600">${fmt(result.costPerOrder, 2)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Cost Component</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Distribution Center Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A distribution center cost calculator estimates the full annual operating cost of running a warehouse and fulfillment facility. A distribution center is the physical hub where products are received from suppliers, stored, and shipped out to stores or customers, and its operating budget is dominated by a few large line items: the rent on the building, the wages of the staff who run it, utilities and equipment, and the carrying cost of the inventory sitting inside it. Many operators track these costs in separate budgets and never add them up, which makes it impossible to answer basic questions like what it costs to ship one more order or whether the facility is efficient relative to its size. This tool consolidates the major cost categories into a single annual total and then expresses that total in the two units operators actually manage against: the cost per order shipped and the cost per square foot of space. With those two numbers, a facility can be benchmarked against industry norms and against competing options like third-party logistics.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator starts with the facility profile. Warehouse space is the total square footage of the building, and the rent per square foot per year reflects the market rate for industrial space in the facility's region; multiplying the two gives the annual rent. The monthly labor cost covers wages, overtime, and benefits for the receiving, picking, packing, and management staff, and is multiplied by twelve to annualize it. The annual other operating costs capture utilities, forklifts and racking depreciation, equipment maintenance, insurance, and sanitation. These three figures alone produce a solid annual operating cost, and dividing it by the annual order volume shows how much of the fixed facility cost every order has to carry.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section adds the two refinements that make the total complete. The average inventory value is the dollar amount of stock normally held in the building, and the inventory holding cost percentage is the annual cost of carrying that stock, including the capital tied up in it, insurance, and taxes, typically estimated between 20% and 30%. The holding cost is the inventory value multiplied by that percentage, and it is added to rent, labor, and other costs to produce the total annual distribution center cost. The cost per order divides the total by the annual orders entered in the advanced section, and the cost per square foot divides it by the building size. With the default inputs, a 100,000 square foot center renting at $8.50 per square foot with $120,000 of monthly labor, $250,000 of other annual costs, and $2,000,000 of inventory at a 25% holding cost carries roughly $3,040,000 of annual cost, about $5.07 per order and $30.40 per square foot.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total annual distribution center cost, the full price tag of operating the facility. The cost per order is the figure to compare against 3PL pricing, because it shows the true internal cost of processing one order; if a third-party provider can beat it at comparable service levels, outsourcing deserves a serious look. The cost per square foot is the facility efficiency metric, and it should be tracked year over year, because rising cost per square foot signals either rent inflation or underutilized space. Watch the split between cost categories in the breakdown table: labor and inventory holding together typically account for more than half of total cost, so those are the levers with the most headroom. When order volume grows, re-run the calculator to see the cost per order fall as fixed costs spread over more throughput, and use that trajectory to time the decision between expanding the building, adding a second shift, or moving volume to a partner.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/distribution-center-cost-calculator" />
        </div>
      </div>
    </>
  );
}