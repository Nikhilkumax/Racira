"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  sellingPrice: string;
  productCost: string;
  shippingCharged: string;
  shippingCost: string;
  platformFeePct: string;
  units: string;
}

interface Result {
  revenuePerUnit: number;
  totalCostPerUnit: number;
  shippingPnl: number;
  profitPerUnit: number;
  marginPct: number;
  markupPct: number;
  totalProfit: number;
  platformFee: number;
}

const DEFAULTS: Inputs = {
  sellingPrice: "79.99",
  productCost: "32.00",
  shippingCharged: "9.99",
  shippingCost: "7.85",
  platformFeePct: "8",
  units: "1200",
};

function calculate(inputs: Inputs): Result {
  const sellingPrice = Math.max(0, parseFloat(inputs.sellingPrice) || 0);
  const productCost = Math.max(0, parseFloat(inputs.productCost) || 0);
  const shippingCharged = Math.max(0, parseFloat(inputs.shippingCharged) || 0);
  const shippingCost = Math.max(0, parseFloat(inputs.shippingCost) || 0);
  const platformFeePct = Math.min(100, Math.max(0, parseFloat(inputs.platformFeePct) || 0));
  const units = Math.max(0, parseFloat(inputs.units) || 0);

  const platformFee = sellingPrice * (platformFeePct / 100);
  const revenuePerUnit = sellingPrice + shippingCharged;
  const totalCostPerUnit = productCost + shippingCost + platformFee;
  const shippingPnl = shippingCharged - shippingCost;
  const profitPerUnit = revenuePerUnit - totalCostPerUnit;
  const marginPct = revenuePerUnit > 0 ? (profitPerUnit / revenuePerUnit) * 100 : 0;
  const markupPct = totalCostPerUnit > 0 ? (profitPerUnit / totalCostPerUnit) * 100 : 0;
  const totalProfit = profitPerUnit * units;

  return { revenuePerUnit, totalCostPerUnit, shippingPnl, profitPerUnit, marginPct, markupPct, totalProfit, platformFee };
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

export default function ShippingMarginCalculator() {
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
    num(inputs.sellingPrice) <= 0 ||
    num(inputs.productCost) < 0 ||
    num(inputs.shippingCharged) < 0 ||
    num(inputs.shippingCost) < 0 ||
    num(inputs.platformFeePct) < 0 || num(inputs.platformFeePct) > 100 ||
    num(inputs.units) < 0;

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
    { label: "Selling Price", value: fmtMoney(num(inputs.sellingPrice)) },
    { label: "Shipping Charged", value: fmtMoney(num(inputs.shippingCharged)) },
    { label: "Total Revenue / Unit", value: fmtMoney(result.revenuePerUnit) },
    { label: "Product Cost", value: fmtMoney(num(inputs.productCost)) },
    { label: "Shipping Cost", value: fmtMoney(num(inputs.shippingCost)) },
    { label: "Platform Fee", value: fmtMoney(result.platformFee) },
    { label: "Total Cost / Unit", value: fmtMoney(result.totalCostPerUnit) },
    { label: "Shipping P&L", value: fmtMoney(result.shippingPnl), highlight: true },
    { label: "Profit Per Unit", value: fmtMoney(result.profitPerUnit), highlight: true },
    { label: "Margin", value: result.marginPct.toFixed(1) + "%" },
    { label: "Markup", value: result.markupPct.toFixed(1) + "%" },
    { label: "Total Profit (all units)", value: fmtMoney(result.totalProfit, 0) },
  ];

  const summaryStats = [
    { label: "Margin", value: result.marginPct.toFixed(1) + "%" },
    { label: "Markup", value: result.markupPct.toFixed(1) + "%" },
    { label: "Shipping P&L", value: fmtMoney(result.shippingPnl) },
    { label: "Profit / Unit", value: fmtMoney(result.profitPerUnit) },
    { label: "Total Profit", value: fmtMoney(result.totalProfit, 0) },
    { label: "Platform Fee", value: fmtMoney(result.platformFee) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Shipping Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Shipping Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sm-price" label="Selling Price" value={inputs.sellingPrice} onChange={set("sellingPrice")} prefix="$" />
              <NumInput id="sm-cost" label="Product Cost" value={inputs.productCost} onChange={set("productCost")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sm-charged" label="Shipping Charged" value={inputs.shippingCharged} onChange={set("shippingCharged")} prefix="$" />
              <NumInput id="sm-shipping" label="Actual Shipping Cost" value={inputs.shippingCost} onChange={set("shippingCost")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees & Volume</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="sm-fee" label="Platform Fee" value={inputs.platformFeePct} onChange={set("platformFeePct")} suffix="%" />
                    <NumInput id="sm-units" label="Units / Period" value={inputs.units} onChange={set("units")} />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Selling price must be greater than zero; all other values must be non-negative; platform fee must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Profit Per Unit</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmtMoney(result.profitPerUnit)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.marginPct.toFixed(1)}% margin on {fmtMoney(result.revenuePerUnit)} revenue</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Margin</span>
                <span className={`font-extrabold ${result.marginPct >= 25 ? "text-emerald-600" : "text-amber-600"}`}>{result.marginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shipping P&L</span>
                <span className={`font-extrabold ${result.shippingPnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.shippingPnl)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Profit</span>
                <span className="font-extrabold text-foreground">{fmtMoney(result.totalProfit, 0)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Order Economics</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Shipping Margin?</h2>
              <p className="text-muted-foreground leading-relaxed">Shipping margin is the profit contribution of the shipping line on each order: the shipping amount you charge the customer minus the actual cost of delivering the package. E-commerce sellers routinely bury or lose money here — free-shipping promotions, flat-rate pricing that does not match zone rates, and carrier rate increases all quietly drain margin. The wider order margin is the full picture: selling price plus shipping charged, minus product cost, actual shipping, and platform fees. Sellers who track only product margin often discover at reconciliation that shipping losses have consumed their entire profit on low-ticket items.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your selling price, product cost, the shipping amount charged to the customer, and the actual shipping cost you pay. The calculator derives the shipping P&L, total revenue per unit, total cost per unit, profit per unit, margin, and markup. The Advanced Options add the platform fee percentage — marketplace referral fees or store transaction fees — and the number of units in the period, which converts per-unit economics into total profit. If the shipping P&L shows negative, either raise the shipping charge, renegotiate carrier rates, or absorb the difference consciously as a competitive strategy rather than by accident.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Managing Shipping Costs</h2>
              <p className="text-muted-foreground leading-relaxed">Shipping is one of the few costs sellers can actively negotiate: multi-carrier rate shopping, dimensional-weight awareness, and quarterly carrier contract reviews routinely cut shipping costs 10–20%. The other lever is pricing structure — free shipping thresholds that raise average order value, real-time carrier rates for large items, and zone-based pricing for heavy products. Whatever strategy you choose, model it here first: a $2 per-order shipping loss on 10,000 orders is $20,000 a year out of your margin, and the same math that reveals the loss also shows exactly what shipping charge makes the line profitable.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/shipping-margin-calculator" />
        </div>
      </div>
    </>
  );
}