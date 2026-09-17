"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  retailPrice: string;
  supplierPrice: string;
  shippingCost: string;
  feesPct: string;
  unitsPerMonth: string;
  monthlyOverhead: string;
}

interface Result {
  totalCostPerUnit: number;
  profitPerUnit: number;
  marginPct: number;
  markupPct: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  breakEvenUnits: number;
  annualProfit: number;
  feesPerUnit: number;
}

const DEFAULTS: Inputs = {
  retailPrice: "59.99",
  supplierPrice: "31.50",
  shippingCost: "4.25",
  feesPct: "10",
  unitsPerMonth: "350",
  monthlyOverhead: "1200",
};

function calculate(inputs: Inputs): Result {
  const retailPrice = Math.max(0, parseFloat(inputs.retailPrice) || 0);
  const supplierPrice = Math.max(0, parseFloat(inputs.supplierPrice) || 0);
  const shippingCost = Math.max(0, parseFloat(inputs.shippingCost) || 0);
  const feesPct = Math.min(100, Math.max(0, parseFloat(inputs.feesPct) || 0));
  const unitsPerMonth = Math.max(0, parseFloat(inputs.unitsPerMonth) || 0);
  const monthlyOverhead = Math.max(0, parseFloat(inputs.monthlyOverhead) || 0);

  const feesPerUnit = retailPrice * (feesPct / 100);
  const totalCostPerUnit = supplierPrice + shippingCost + feesPerUnit;
  const profitPerUnit = retailPrice - totalCostPerUnit;
  const marginPct = retailPrice > 0 ? (profitPerUnit / retailPrice) * 100 : 0;
  const markupPct = totalCostPerUnit > 0 ? (profitPerUnit / totalCostPerUnit) * 100 : 0;
  const monthlyRevenue = retailPrice * unitsPerMonth;
  const monthlyProfit = profitPerUnit * unitsPerMonth - monthlyOverhead;
  const breakEvenUnits = profitPerUnit > 0 ? Math.ceil(monthlyOverhead / profitPerUnit) : 0;
  const annualProfit = monthlyProfit * 12;

  return { totalCostPerUnit, profitPerUnit, marginPct, markupPct, monthlyRevenue, monthlyProfit, breakEvenUnits, annualProfit, feesPerUnit };
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

export default function DropShipMarginCalculator() {
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
    num(inputs.supplierPrice) < 0 ||
    num(inputs.shippingCost) < 0 ||
    num(inputs.feesPct) < 0 || num(inputs.feesPct) > 100 ||
    num(inputs.unitsPerMonth) < 0 ||
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
    { label: "Supplier Price", value: fmtMoney(num(inputs.supplierPrice)) },
    { label: "Shipping Cost / Unit", value: fmtMoney(num(inputs.shippingCost)) },
    { label: "Platform & Payment Fees", value: fmtMoney(result.feesPerUnit) },
    { label: "Total Cost / Unit", value: fmtMoney(result.totalCostPerUnit) },
    { label: "Profit Per Unit", value: fmtMoney(result.profitPerUnit), highlight: true },
    { label: "Margin", value: result.marginPct.toFixed(1) + "%", highlight: true },
    { label: "Markup", value: result.markupPct.toFixed(1) + "%" },
    { label: "Monthly Revenue", value: fmtMoney(result.monthlyRevenue, 0) },
    { label: "Monthly Overhead", value: fmtMoney(num(inputs.monthlyOverhead), 0) },
    { label: "Monthly Profit", value: fmtMoney(result.monthlyProfit, 0) },
    { label: "Break-Even Units / Month", value: fmt(result.breakEvenUnits) },
    { label: "Annual Profit", value: fmtMoney(result.annualProfit, 0) },
  ];

  const summaryStats = [
    { label: "Margin", value: result.marginPct.toFixed(1) + "%" },
    { label: "Markup", value: result.markupPct.toFixed(1) + "%" },
    { label: "Profit / Unit", value: fmtMoney(result.profitPerUnit) },
    { label: "Monthly Profit", value: fmtMoney(result.monthlyProfit, 0) },
    { label: "Break-Even Units", value: fmt(result.breakEvenUnits) },
    { label: "Annual Profit", value: fmtMoney(result.annualProfit, 0) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Drop Ship Margin Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Drop Ship Margin Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dm-price" label="Retail Price" value={inputs.retailPrice} onChange={set("retailPrice")} prefix="$" />
              <NumInput id="dm-supplier" label="Supplier Price" value={inputs.supplierPrice} onChange={set("supplierPrice")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dm-shipping" label="Shipping / Unit" value={inputs.shippingCost} onChange={set("shippingCost")} prefix="$" />
              <NumInput id="dm-units" label="Units / Month" value={inputs.unitsPerMonth} onChange={set("unitsPerMonth")} />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Fees & Overhead</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput id="dm-fees" label="Platform & Payment Fees" value={inputs.feesPct} onChange={set("feesPct")} suffix="%" />
                    <NumInput id="dm-overhead" label="Monthly Overhead" value={inputs.monthlyOverhead} onChange={set("monthlyOverhead")} prefix="$" />
                  </div>
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Retail price must be greater than zero; all other values must be non-negative; fees must be between 0 and 100.
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
              <div className="text-sm text-muted-foreground font-medium">{result.marginPct.toFixed(1)}% margin on {fmtMoney(num(inputs.retailPrice))} retail price</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Margin</span>
                <span className={`font-extrabold ${result.marginPct >= 20 ? "text-emerald-600" : "text-amber-600"}`}>{result.marginPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Profit</span>
                <span className={`font-extrabold ${result.monthlyProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(result.monthlyProfit, 0)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Break-Even Units</span>
                <span className="font-extrabold text-foreground">{fmt(result.breakEvenUnits)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Drop Ship Economics</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is Drop Ship Margin?</h2>
              <p className="text-muted-foreground leading-relaxed">Drop ship margin is the profit remaining on each order after paying the supplier, the shipping cost, and the platform and payment fees — the three costs every drop-shipping order carries. Because the model has no inventory, the per-unit cost structure is brutally simple: retail price minus supplier price, minus shipping, minus fees. That simplicity is also the model's weakness: typical drop-ship margins land between 10% and 25%, far below the 40–60% margins of wholesale and private-label products, and every cost above is paid per order with no volume discounts to soften it. Sellers who skip this calculation routinely discover their "profitable" store is losing money on every sale once fees and shipping are counted.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How to Use This Calculator</h2>
              <p className="text-muted-foreground leading-relaxed">Enter your retail price, the supplier's per-unit price, and the average shipping cost per order. The calculator subtracts those from the retail price to find the profit per unit and margin. The Advanced Options add the platform and payment fee percentage — marketplace referral fees, payment processing, and transaction fees often total 8–15% of retail — and your monthly overhead, which includes the automation tools, ads that are not order-attributed, and subscriptions. With volume and overhead entered, the calculator reports monthly and annual profit plus the break-even unit count: the minimum sales per month before the store covers its fixed costs.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Making Drop Shipping Profitable</h2>
              <p className="text-muted-foreground leading-relaxed">The margin levers are price, supplier, shipping, and fees. Raising retail price is the fastest fix but must survive market comparison; switching suppliers or negotiating better rates on proven SKUs directly improves the margin line; and consolidating orders or negotiating carrier contracts cuts the shipping line. The strategic lever is product selection: the winners in drop shipping are products with a wide gap between retail and supplier price — often accessories, niche items, and bundles — not commodity goods where the market price is set. Use this calculator before listing any product: if the margin does not clear 20% after fees, the product has no room for ad costs, returns, or mistakes, and it will not pay for the overhead that keeps the store running.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/drop-ship-margin-calculator" />
        </div>
      </div>
    </>
  );
}