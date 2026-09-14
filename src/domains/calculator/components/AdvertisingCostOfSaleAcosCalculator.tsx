"use client";

import { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, ChevronDown } from "lucide-react";

interface Inputs {
  adSpend: string;
  revenue: string;
  unitsSold: string;
  avgSellingPrice: string;
  targetAcos: string;
}

interface Result {
  acosPct: number;
  roas: number;
  profitBeforeAds: number;
  breakevenAcosPct: number;
  adEfficiencyPct: number;
  revenuePerUnit: number;
  impliedUnits: number;
  targetSpend: number;
}

const DEFAULTS: Inputs = {
  adSpend: "12000",
  revenue: "48000",
  unitsSold: "800",
  avgSellingPrice: "60",
  targetAcos: "25",
};

function calculate(inputs: Inputs): Result {
  const adSpend = Math.max(0, parseFloat(inputs.adSpend) || 0);
  const revenue = Math.max(0, parseFloat(inputs.revenue) || 0);
  const unitsSold = Math.max(0, parseFloat(inputs.unitsSold) || 0);
  const avgSellingPrice = Math.max(0, parseFloat(inputs.avgSellingPrice) || 0);
  const targetAcos = Math.min(100, Math.max(0, parseFloat(inputs.targetAcos) || 0));

  const acosPct = revenue > 0 ? (adSpend / revenue) * 100 : 0;
  const roas = adSpend > 0 ? revenue / adSpend : 0;
  const revenuePerUnit = unitsSold > 0 ? revenue / unitsSold : avgSellingPrice;
  const impliedUnits = avgSellingPrice > 0 ? revenue / avgSellingPrice : unitsSold;
  const productMarginPct = avgSellingPrice > 0 ? Math.max(0, (avgSellingPrice - 12) / avgSellingPrice) * 100 : 0;
  const breakevenAcosPct = Math.min(100, productMarginPct);
  const profitBeforeAds = revenue - impliedUnits * 12;
  const adEfficiencyPct = breakevenAcosPct > 0 ? (acosPct / breakevenAcosPct) * 100 : 0;
  const targetSpend = (targetAcos / 100) * revenue;

  return { acosPct, roas, profitBeforeAds, breakevenAcosPct, adEfficiencyPct, revenuePerUnit, impliedUnits, targetSpend };
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
const fmtMoney = (n: number, dec = 0) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

export default function AdvertisingCostOfSaleAcosCalculator() {
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
    num(inputs.adSpend) < 0 ||
    num(inputs.revenue) <= 0 ||
    num(inputs.unitsSold) < 0 ||
    num(inputs.avgSellingPrice) <= 0 ||
    num(inputs.targetAcos) < 0 || num(inputs.targetAcos) > 100;

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

  const healthy = result.acosPct <= result.breakevenAcosPct;

  const rows = [
    { label: "Ad Spend", value: fmtMoney(num(inputs.adSpend)) },
    { label: "Attributed Revenue", value: fmtMoney(num(inputs.revenue)) },
    { label: "ACOS", value: result.acosPct.toFixed(2) + "%", highlight: true },
    { label: "ROAS", value: result.roas.toFixed(2) + "x" },
    { label: "Estimated Units Sold", value: fmt(result.impliedUnits) },
    { label: "Est. COGS at $12/unit", value: fmtMoney(result.impliedUnits * 12) },
    { label: "Profit Before Ads", value: fmtMoney(result.profitBeforeAds) },
    { label: "Breakeven ACOS", value: result.breakevenAcosPct.toFixed(1) + "%" },
    { label: "Target ACOS Spend", value: fmtMoney(result.targetSpend) },
  ];

  const summaryStats = [
    { label: "ACOS", value: result.acosPct.toFixed(2) + "%" },
    { label: "ROAS", value: result.roas.toFixed(2) + "x" },
    { label: "Breakeven ACOS", value: result.breakevenAcosPct.toFixed(1) + "%" },
    { label: "Target Spend", value: fmtMoney(result.targetSpend) },
    { label: "Profit Before Ads", value: fmtMoney(result.profitBeforeAds) },
    { label: "Status", value: healthy ? "Profitable" : "Unprofitable" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business", href: "/calculator#business" }, { label: "Advertising Cost of Sale (ACOS) Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Advertising Cost of Sale (ACOS) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="acos-spend" label="Ad Spend" value={inputs.adSpend} onChange={set("adSpend")} prefix="$" />
              <NumInput id="acos-revenue" label="Attributed Revenue" value={inputs.revenue} onChange={set("revenue")} prefix="$" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="acos-units" label="Units Sold" value={inputs.unitsSold} onChange={set("unitsSold")} />
              <NumInput id="acos-price" label="Avg Selling Price" value={inputs.avgSellingPrice} onChange={set("avgSellingPrice")} prefix="$" />
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Targets</div>
                  <NumInput id="acos-target" label="Target ACOS" value={inputs.targetAcos} onChange={set("targetAcos")} suffix="%" />
                </div>
              </div>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">
                Revenue and average selling price must be greater than zero; ad spend and units must be non-negative; target ACOS must be between 0 and 100.
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">ACOS</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.acosPct.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{fmtMoney(num(inputs.adSpend))} ad spend on {fmtMoney(num(inputs.revenue))} revenue</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROAS</span>
                <span className="font-extrabold text-foreground">{result.roas.toFixed(2)}x</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Breakeven ACOS</span>
                <span className="font-extrabold text-amber-600">{result.breakevenAcosPct.toFixed(1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                <span className={`font-extrabold ${healthy ? "text-emerald-600" : "text-red-600"}`}>{healthy ? "Profitable" : "Unprofitable"}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 pl-4 pr-3">Campaign Economics</th>
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
              <h2 className="text-2xl font-bold mb-3">What Is ACOS?</h2>
              <p className="text-muted-foreground leading-relaxed">Advertising cost of sale (ACOS) is the percentage of attributed revenue consumed by advertising spend, calculated as ad spend divided by attributed sales. It is the headline efficiency metric on Amazon Advertising and most retail media networks. An ACOS of 25% means a quarter of every sales dollar goes back into ads. ACOS is the inverse of ROAS: a 4x ROAS equals 25% ACOS. Because it is expressed as a ratio of spend to revenue, ACOS alone does not tell you whether a campaign is profitable — you must compare it against your breakeven ACOS, which is the margin you keep on each unit before advertising.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How Breakeven ACOS Is Estimated</h2>
              <p className="text-muted-foreground leading-relaxed">This calculator estimates breakeven ACOS from your average selling price and a default variable cost of $12 per unit, which you can think of as the product cost plus fulfillment and fees. The margin percentage — price minus variable cost divided by price — is the maximum share of revenue you can give to advertising before you lose money. If your true per-unit cost differs, scale the estimate mentally: a product with higher landed cost has a lower breakeven ACOS and therefore less room for advertising. The status result compares your actual ACOS to that breakeven level to flag whether the campaign is generating profit or burning it.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Using ACOS to Manage Campaigns</h2>
              <p className="text-muted-foreground leading-relaxed">New products and launches routinely run at high ACOS because ranking and review velocity matter more than short-term profit, while established bestsellers should operate well below breakeven. Use the target ACOS input to compute the spend budget consistent with your goal: target spend equals target ACOS times revenue. Bid management follows directly — if actual ACOS runs above target, lower bids on keywords that convert poorly; if it runs far below, you are leaving profitable impressions on the table. Revisit the numbers weekly during campaigns and whenever pricing or product cost changes, because breakeven ACOS moves with your margin.</p>
            </div>
          </section>
          <PopularCalculators exclude="/calculator/advertising-cost-of-sale-acos-calculator" />
        </div>
      </div>
    </>
  );
}