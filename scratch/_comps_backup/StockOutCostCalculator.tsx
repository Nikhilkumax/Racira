"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  unitsStockedOut: string;
  sellingPrice: string;
  grossMargin: string;
  recoveryRate: string;
  cac: string;
  repeatPurchases: string;
  repeatMargin: string;
}

interface Result {
  lostUnits: number;
  recoveredUnits: number;
  lostRevenue: number;
  lostMargin: number;
  cacCost: number;
  repeatValueLost: number;
  totalMonthly: number;
  totalAnnual: number;
}

const DEFAULTS: Inputs = {
  unitsStockedOut: "400",
  sellingPrice: "45",
  grossMargin: "40",
  recoveryRate: "30",
  cac: "25",
  repeatPurchases: "4",
  repeatMargin: "18",
};

function calculate(inputs: Inputs): Result {
  const unitsStockedOut = Math.max(0, parseFloat(inputs.unitsStockedOut) || 0);
  const sellingPrice = Math.max(0, parseFloat(inputs.sellingPrice) || 0);
  const grossMargin = Math.min(100, Math.max(0, parseFloat(inputs.grossMargin) || 0));
  const recoveryRate = Math.min(100, Math.max(0, parseFloat(inputs.recoveryRate) || 0));
  const cac = Math.max(0, parseFloat(inputs.cac) || 0);
  const repeatPurchases = Math.max(0, parseFloat(inputs.repeatPurchases) || 0);
  const repeatMargin = Math.max(0, parseFloat(inputs.repeatMargin) || 0);

  const recoveredUnits = (unitsStockedOut * recoveryRate) / 100;
  const lostUnits = unitsStockedOut - recoveredUnits;
  const lostRevenue = lostUnits * sellingPrice;
  const lostMargin = (lostRevenue * grossMargin) / 100;
  const cacCost = lostUnits * cac;
  const repeatValueLost = lostUnits * repeatPurchases * repeatMargin;
  const totalMonthly = lostMargin + cacCost + repeatValueLost;
  const totalAnnual = totalMonthly * 12;

  return { lostUnits, recoveredUnits, lostRevenue, lostMargin, cacCost, repeatValueLost, totalMonthly, totalAnnual };
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

export default function StockOutCostCalculator() {
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
    num(inputs.unitsStockedOut) < 0 ||
    num(inputs.sellingPrice) < 0 ||
    num(inputs.grossMargin) < 0 || num(inputs.grossMargin) > 100 ||
    num(inputs.recoveryRate) < 0 || num(inputs.recoveryRate) > 100 ||
    num(inputs.cac) < 0 ||
    num(inputs.repeatPurchases) < 0 ||
    num(inputs.repeatMargin) < 0;

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
    { label: "Units Stocked Out per Month", value: fmt(num(inputs.unitsStockedOut)) },
    { label: `Recovered Sales (${fmt(num(inputs.recoveryRate), 1)}%)`, value: fmt(result.recoveredUnits) },
    { label: "Units Turned Away", value: fmt(result.lostUnits) },
    { label: "Lost Revenue", value: fmtMoney(result.lostRevenue) },
    { label: `Lost Gross Margin (${fmt(num(inputs.grossMargin), 1)}%)`, value: fmtMoney(result.lostMargin) },
    { label: "Lost Customer Acquisition Value", value: fmtMoney(result.cacCost) },
    { label: "Lost Repeat Purchase Value", value: fmtMoney(result.repeatValueLost) },
    { label: "Total Monthly Stock-Out Cost", value: fmtMoney(result.totalMonthly), total: true },
    { label: "Total Annual Stock-Out Cost", value: fmtMoney(result.totalAnnual), highlight: true },
  ];

  const summaryStats = [
    { label: "Units Stocked Out", value: fmt(num(inputs.unitsStockedOut)) },
    { label: "Recovery Rate", value: fmt(num(inputs.recoveryRate), 1) + "%" },
    { label: "Units Turned Away", value: fmt(result.lostUnits) },
    { label: "Lost Revenue", value: fmtMoney(result.lostRevenue) },
    { label: "Lost Gross Margin", value: fmtMoney(result.lostMargin) },
    { label: "Lost Acquisition Value", value: fmtMoney(result.cacCost) },
    { label: "Lost Repeat Value", value: fmtMoney(result.repeatValueLost) },
    { label: "Total Monthly Cost", value: fmtMoney(result.totalMonthly), bold: true },
    { label: "Total Annual Cost", value: fmtMoney(result.totalAnnual) },
    { label: "Gross Margin / Unit", value: "$" + fmt((num(inputs.sellingPrice) * num(inputs.grossMargin)) / 100, 2) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Stock-Out Cost Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stock-Out Cost Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="stockout-units" label="Units Stocked Out per Month" value={inputs.unitsStockedOut} onChange={set("unitsStockedOut")} suffix="units" />
              <NumInput id="stockout-price" label="Selling Price per Unit" value={inputs.sellingPrice} onChange={set("sellingPrice")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="stockout-margin" label="Gross Margin" value={inputs.grossMargin} onChange={set("grossMargin")} suffix="%" />
              <NumInput id="stockout-recovery" label="Lost Sales Recovery Rate" value={inputs.recoveryRate} onChange={set("recoveryRate")} suffix="%" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Customer Impact</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="stockout-cac" label="Customer Acquisition Cost" value={inputs.cac} onChange={set("cac")} prefix="$" />
                    <NumInput id="stockout-repeats" label="Repeat Purchases per Year" value={inputs.repeatPurchases} onChange={set("repeatPurchases")} suffix="purchases" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <NumInput id="stockout-repeat-margin" label="Repeat Purchase Margin" value={inputs.repeatMargin} onChange={set("repeatMargin")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                All amounts must be non-negative; margin and recovery rates must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Monthly Stock-Out Cost</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.totalMonthly)}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.lostUnits)} lost sales from {fmt(num(inputs.unitsStockedOut))} stock-outs</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lost Gross Margin</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.lostMargin)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lost Repeat Value</span>
                <span className="font-extrabold text-amber-600">{fmtMoney(result.repeatValueLost)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Cost</span>
                <span className="font-extrabold text-red-600">{fmtMoney(result.totalAnnual)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Stock-Out Impact</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is a Stock-Out Cost Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">A stock-out cost calculator measures the full financial damage of running out of inventory. A stock-out happens when a customer wants to buy a product and the business cannot deliver it, and the cost of that single missed sale is much larger than the profit on the item itself. When a customer is turned away, the business loses the gross margin on the immediate sale, the money it spent acquiring that customer in the first place, and the entire stream of future purchases that customer would have made. Retail studies consistently show that a large share of customers who encounter an out-of-stock simply buy from a competitor instead of waiting, and some never come back. This tool turns those three layers of loss into a monthly and annual dollar figure, so inventory managers can compare the cost of a stock-out directly against the cost of carrying a little extra safety stock and make stocking decisions on numbers rather than guesswork.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator takes four core inputs. Units stocked out per month is the number of times a requested unit could not be delivered. The selling price per unit and the gross margin determine how much profit each lost sale would have contributed, with the lost margin calculated as the turned-away units multiplied by the selling price and the margin percentage. The lost sales recovery rate is the share of those customers who come back later or accept a backorder, and subtracting it from the stock-out units leaves the units that were genuinely lost to competitors or to no sale at all. That lost-unit count drives the rest of the calculation, and the lost revenue is the turned-away units multiplied by the selling price, with the lost gross margin being the percentage of that revenue the business would have kept.</p>
              <p className="text-muted-foreground leading-relaxed mt-4">The Advanced Options section prices in the customer lifetime damage. The customer acquisition cost is what the business spent in marketing and sales to win each of those customers, and it is multiplied by the lost units because the acquisition spend is effectively wasted when the customer is driven away at the first purchase. The repeat purchases per year and the repeat purchase margin capture the future profit that is lost when a customer never comes back: the repeat value lost is the lost units multiplied by the annual repeat purchase count and the margin per repeat purchase. The total monthly stock-out cost sums the lost margin, the lost acquisition value, and the lost repeat value, and the annual figure is simply the monthly total times twelve. With the default inputs, four hundred monthly stock-outs at a $45 selling price with a 40% margin and a 30% recovery rate generate over $32,000 of monthly damage, or about $386,000 a year.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result is the total monthly stock-out cost, and the breakdown shows which layer of damage dominates. For high-margin products with loyal customers, the repeat purchase loss is usually the largest component, which means the true cost of a stock-out is far above the margin on the single item; for low-margin, low-retention categories, the immediate margin loss matters most. Compare the annual stock-out cost against the annual cost of carrying additional safety stock, which is the inventory value times your holding cost percentage, and any safety stock level that costs less than the stock-outs it prevents is worth carrying. Reducing stock-outs is usually cheaper than it looks: better demand forecasting, supplier lead time buffers, and safety stock on the top-selling SKUs typically eliminate the majority of lost sales. Re-run this calculator quarterly with real stock-out data, and the trend will show whether inventory policy improvements are actually paying for themselves.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/stock-out-cost-calculator" />
        </div>
      </div>
    </>
  );
}