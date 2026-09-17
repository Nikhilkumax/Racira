"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  retailPrice: string;
  dropSupplierPrice: string;
  wholesalePrice: string;
  unitsPerMonth: string;
  shippingCost: string;
  returnRate: string;
  monthlyOverhead: string;
}

interface Result {
  dropMarginPct: number;
  dropProfitPerUnit: number;
  wholesaleMarginPct: number;
  wholesaleProfitPerUnit: number;
  dropMonthlyProfit: number;
  wholesaleMonthlyProfit: number;
  dropMonthlyRevenue: number;
  wholesaleMonthlyRevenue: number;
  annualDifference: number;
  dropBetter: boolean;
  dropBreakEvenUnits: number;
}

const DEFAULTS: Inputs = {
  retailPrice: "49.99",
  dropSupplierPrice: "29.50",
  wholesalePrice: "18.00",
  unitsPerMonth: "400",
  shippingCost: "4.5",
  returnRate: "5",
  monthlyOverhead: "1500",
};

function calculate(inputs: Inputs): Result {
  const retailPrice = Math.max(0, parseFloat(inputs.retailPrice) || 0);
  const dropSupplierPrice = Math.max(0, parseFloat(inputs.dropSupplierPrice) || 0);
  const wholesalePrice = Math.max(0, parseFloat(inputs.wholesalePrice) || 0);
  const unitsPerMonth = Math.max(0, parseFloat(inputs.unitsPerMonth) || 0);
  const shippingCost = Math.max(0, parseFloat(inputs.shippingCost) || 0);
  const returnRate = Math.min(100, Math.max(0, parseFloat(inputs.returnRate) || 0));
  const monthlyOverhead = Math.max(0, parseFloat(inputs.monthlyOverhead) || 0);

  const dropCostPerUnit = dropSupplierPrice + shippingCost;
  const dropProfitPerUnit = retailPrice - dropCostPerUnit;
  const dropMarginPct = retailPrice > 0 ? (dropProfitPerUnit / retailPrice) * 100 : 0;
  const dropMonthlyRevenue = retailPrice * unitsPerMonth;
  const dropMonthlyProfit = dropProfitPerUnit * unitsPerMonth - monthlyOverhead;

  const wholesaleMarginPct = retailPrice > 0 ? ((retailPrice - wholesalePrice) / retailPrice) * 100 : 0;
  const wholesaleProfitPerUnit = retailPrice - wholesalePrice;
  const wholesaleMonthlyRevenue = retailPrice * unitsPerMonth;
  const wholesaleMonthlyProfit = wholesaleProfitPerUnit * unitsPerMonth - monthlyOverhead;

  const annualDifference = (wholesaleMonthlyProfit - dropMonthlyProfit) * 12;
  const dropBetter = dropMonthlyProfit >= wholesaleMonthlyProfit;
  const dropBreakEvenUnits = dropProfitPerUnit > 0 ? monthlyOverhead / dropProfitPerUnit : 0;

  return {
    dropMarginPct, dropProfitPerUnit, wholesaleMarginPct, wholesaleProfitPerUnit,
    dropMonthlyProfit, wholesaleMonthlyProfit, dropMonthlyRevenue, wholesaleMonthlyRevenue,
    annualDifference, dropBetter, dropBreakEvenUnits,
  };
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
const fmtMoney = (n: number, dec = 2) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function DropShippingVsWholesaleMarginComparison() {
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
    num(inputs.retailPrice) <= 0 ||
    num(inputs.dropSupplierPrice) < 0 ||
    num(inputs.wholesalePrice) < 0 ||
    num(inputs.unitsPerMonth) < 0 ||
    num(inputs.shippingCost) < 0 ||
    num(inputs.returnRate) < 0 || num(inputs.returnRate) > 100 ||
    num(inputs.monthlyOverhead) < 0;

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
    { label: "Retail Price", value: fmtMoney(num(inputs.retailPrice)) },
    { label: "Drop Ship Cost (supplier + shipping)", value: fmtMoney(num(inputs.dropSupplierPrice) + num(inputs.shippingCost)) },
    { label: "Drop Ship Profit / Unit", value: fmtMoney(result.dropProfitPerUnit) },
    { label: "Drop Ship Margin", value: result.dropMarginPct.toFixed(1) + "%", highlight: true },
    { label: "Drop Ship Monthly Profit", value: fmtMoney(result.dropMonthlyProfit, 0) },
    { label: "Wholesale Cost / Unit", value: fmtMoney(num(inputs.wholesalePrice)) },
    { label: "Wholesale Profit / Unit", value: fmtMoney(result.wholesaleProfitPerUnit) },
    { label: "Wholesale Margin", value: result.wholesaleMarginPct.toFixed(1) + "%", highlight: true },
    { label: "Wholesale Monthly Profit", value: fmtMoney(result.wholesaleMonthlyProfit, 0) },
    { label: "Annual Profit Difference", value: fmtMoney(Math.abs(result.annualDifference), 0) },
    { label: "More Profitable Model", value: result.dropBetter ? "Drop Shipping" : "Wholesale", highlight: true },
  ];

  const summaryStats = [
    { label: "Drop Margin", value: result.dropMarginPct.toFixed(1) + "%" },
    { label: "Wholesale Margin", value: result.wholesaleMarginPct.toFixed(1) + "%" },
    { label: "Drop Monthly", value: fmtMoney(result.dropMonthlyProfit, 0) },
    { label: "Wholesale Monthly", value: fmtMoney(result.wholesaleMonthlyProfit, 0) },
    { label: "Annual Difference", value: fmtMoney(Math.abs(result.annualDifference), 0) },
    { label: "Drop Break-Even Units", value: fmt(result.dropBreakEvenUnits) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Drop Shipping vs Wholesale Margin Comparison" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Drop Shipping vs Wholesale Margin Comparison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Product & Pricing</div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput id="ds-retail" label="Retail Price" value={inputs.retailPrice} onChange={set("retailPrice")} prefix="$" />
                <NumInput id="ds-units" label="Units / Month" value={inputs.unitsPerMonth} onChange={set("unitsPerMonth")} />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Drop Shipping Costs</div>
              <div className="grid grid-cols-2 gap-3">
                <NumInput id="ds-supplier" label="Supplier Price" value={inputs.dropSupplierPrice} onChange={set("dropSupplierPrice")} prefix="$" />
                <NumInput id="ds-shipping" label="Shipping / Unit" value={inputs.shippingCost} onChange={set("shippingCost")} prefix="$" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Wholesale Cost</div>
              <NumInput id="ds-wholesale" label="Wholesale Price / Unit" value={inputs.wholesalePrice} onChange={set("wholesalePrice")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Operating Costs</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="ds-returns" label="Return Rate" value={inputs.returnRate} onChange={set("returnRate")} suffix="%" />
                    <NumInput id="ds-overhead" label="Monthly Overhead" value={inputs.monthlyOverhead} onChange={set("monthlyOverhead")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Retail price must be greater than zero; all other values must be non-negative; return rate must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">More Profitable Model</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.dropBetter ? "Drop Shipping" : "Wholesale"}</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(result.dropBetter ? result.dropMonthlyProfit : result.wholesaleMonthlyProfit, 0)} / month before returns</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Drop Margin</span>
                <span className="font-extrabold text-emerald-600">{result.dropMarginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Wholesale Margin</span>
                <span className="font-extrabold text-amber-600">{result.wholesaleMarginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Difference</span>
                <span className="font-extrabold text-foreground">{fmtMoney(Math.abs(result.annualDifference), 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Model Comparison</th>
                    <th className="py-2.5 pl-3 pr-4 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={r.highlight ? "bg-amber-500/10" : ""}>
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
                    <span className="text-sm font-extrabold text-foreground">{s.value}</span>
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
              <h2 className="text-2xl font-bold mb-3">Drop Shipping vs Wholesale: The Core Trade-Off</h2>
              <p className="text-muted-foreground leading-relaxed">In drop shipping, the supplier holds the inventory and ships directly to your customer; you pay the supplier's price plus shipping per order. In wholesale, you buy inventory in bulk at a low per-unit cost, store it, and ship it yourself. The trade-off is margin versus risk: wholesale per-unit costs are typically 30–50% below drop-ship supplier prices because you are taking the inventory risk, but that margin advantage is offset by storage costs, dead stock, and the cash tied up in inventory. Drop shipping caps your downside — you only pay for what sells — but the supplier's price, per-order shipping, and per-order fees chew into a much thinner margin. This calculator quantifies both sides so the choice is based on real numbers rather than anecdotes.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your retail price, the drop-ship supplier's per-unit price, your per-unit shipping cost, and the wholesale price for the same product. The calculator derives each model's profit per unit, margin percentage, and monthly profit at your expected sales volume, after subtracting a monthly overhead that covers platform fees, tools, and other fixed costs. The Advanced Options let you set the return rate — which hits drop shipping harder because return shipping is usually paid by you — and monthly overhead. The headline result names the more profitable model and shows the annual profit difference, while the drop-ship break-even unit count tells you how many sales you need each month just to cover overhead.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">When Each Model Wins</h2>
              <p className="text-muted-foreground leading-relaxed">Drop shipping wins at low volume and for testing new products, because there is no inventory risk and no minimum order quantity — a $20 margin on a $50 product is acceptable when you are selling 100 units a month with zero capital at stake. Wholesale wins at scale: once a product is proven, the 20–30 point margin advantage on several hundred units a month dwarfs the cost of holding inventory, and bulk shipping rates close the per-order shipping gap. The crossover point depends on your exact costs — which is precisely what this calculator computes. Many operators run both: wholesale for the top-selling SKUs, drop shipping for the long tail of unproven items.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/drop-shipping-vs-wholesale-margin-calculator" />
        </div>
      </div>
    </>
  );
}