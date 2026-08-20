"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface CryptoInputs {
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  feePct: number;
  taxRatePct: number;
  holdingDays: number;
}

interface CryptoResult {
  costBasis: number;
  grossProceeds: number;
  totalFees: number;
  grossProfit: number;
  netProfit: number;
  roi: number;
  taxOwed: number;
  afterTaxProfit: number;
  holdingPeriod: "short" | "long";
  priceChangePct: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calculateCrypto(inp: CryptoInputs): CryptoResult {
  const costBasis = inp.purchasePrice * inp.quantity;
  const grossProceeds = inp.salePrice * inp.quantity;
  const totalFees = grossProceeds * (inp.feePct / 100);
  const grossProfit = grossProceeds - costBasis;
  const netProfit = grossProfit - totalFees;
  const roi = costBasis > 0 ? (netProfit / costBasis) * 100 : 0;
  const holdingPeriod: "short" | "long" = inp.holdingDays > 365 ? "long" : "short";
  const taxOwed = netProfit > 0 ? netProfit * (inp.taxRatePct / 100) : 0;
  const afterTaxProfit = netProfit - taxOwed;
  const priceChangePct = inp.purchasePrice > 0 ? ((inp.salePrice - inp.purchasePrice) / inp.purchasePrice) * 100 : 0;

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Purchase Price (per coin)", value: `$${fmt(inp.purchasePrice)}` },
    { label: "Sale Price (per coin)", value: `$${fmt(inp.salePrice)}` },
    { label: "Quantity", value: `${inp.quantity.toLocaleString()}` },
    { label: "Cost Basis", value: `$${fmtInt(costBasis)}` },
    { label: "Gross Proceeds", value: `$${fmtInt(grossProceeds)}` },
    { label: `Trading Fees (${inp.feePct}%)`, value: `−$${fmt(totalFees)}` },
    { label: "Net Profit (Pre-Tax)", value: `$${fmt(netProfit)}`, highlight: true },
    { label: `Tax (${holdingPeriod === "long" ? "Long-Term" : "Short-Term"} ${inp.taxRatePct}%)`, value: netProfit > 0 ? `−$${fmt(taxOwed)}` : "$0" },
    { label: "After-Tax Profit", value: `$${fmt(afterTaxProfit)}`, highlight: true },
  ];

  const summaryStats = [
    { label: "Net Profit", value: `$${fmt(netProfit)}` },
    { label: "After-Tax Profit", value: `$${fmt(afterTaxProfit)}` },
    { label: "ROI", value: `${roi.toFixed(2)}%` },
    { label: "Price Change", value: `${priceChangePct >= 0 ? "+" : ""}${priceChangePct.toFixed(2)}%` },
    { label: "Cost Basis", value: `$${fmtInt(costBasis)}` },
    { label: "Total Fees", value: `$${fmt(totalFees)}` },
    { label: "Tax Owed", value: `$${fmt(taxOwed)}` },
    { label: "Holding Period", value: holdingPeriod === "long" ? "Long-Term (>365d)" : "Short-Term (≤365d)" },
  ];

  const PIE_COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];
  const chartData = [
    { name: "Cost Basis", value: Math.max(0, costBasis), color: PIE_COLORS[0] },
    { name: "Gross Profit", value: Math.max(0, grossProfit), color: PIE_COLORS[1] },
    { name: "Fees", value: Math.max(0, totalFees), color: PIE_COLORS[2] },
    { name: "Tax", value: Math.max(0, taxOwed), color: PIE_COLORS[3] },
  ].filter(d => d.value > 0);

  return { costBasis, grossProceeds, totalFees, grossProfit, netProfit, roi, taxOwed, afterTaxProfit, holdingPeriod, priceChangePct, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: CryptoInputs = {
  purchasePrice: 30000,
  salePrice: 45000,
  quantity: 0.5,
  feePct: 0.1,
  taxRatePct: 20,
  holdingDays: 400,
};

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CryptocurrencyProfitCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(String(DEFAULTS.purchasePrice));
  const [salePrice, setSalePrice] = useState(String(DEFAULTS.salePrice));
  const [quantity, setQuantity] = useState(String(DEFAULTS.quantity));
  const [feePct, setFeePct] = useState(String(DEFAULTS.feePct));
  const [taxRatePct, setTaxRatePct] = useState(String(DEFAULTS.taxRatePct));
  const [holdingDays, setHoldingDays] = useState(String(DEFAULTS.holdingDays));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<CryptoResult | null>(null);

  const getInputs = (): CryptoInputs => ({
    purchasePrice: parseFloat(purchasePrice) || 0,
    salePrice: parseFloat(salePrice) || 0,
    quantity: parseFloat(quantity) || 0,
    feePct: parseFloat(feePct) || 0,
    taxRatePct: parseFloat(taxRatePct) || 0,
    holdingDays: parseInt(holdingDays) || 0,
  });

  const calculate = () => setResult(calculateCrypto(getInputs()));
  const reset = () => {
    setPurchasePrice(String(DEFAULTS.purchasePrice));
    setSalePrice(String(DEFAULTS.salePrice));
    setQuantity(String(DEFAULTS.quantity));
    setFeePct(String(DEFAULTS.feePct));
    setTaxRatePct(String(DEFAULTS.taxRatePct));
    setHoldingDays(String(DEFAULTS.holdingDays));
    setResult(calculateCrypto(DEFAULTS));
  };

  useEffect(() => { setResult(calculateCrypto(DEFAULTS)); }, []);

  const profitColor = result ? (result.netProfit > 0 ? "text-emerald-600" : result.netProfit < 0 ? "text-red-500" : "text-foreground") : "";

  const faqs = [
    { question: "How is crypto profit taxed?", answer: "In the US, crypto profits are taxed as capital gains. If you hold for more than 365 days, you qualify for long-term capital gains rates (0%, 15%, or 20% depending on income). Short-term gains (held ≤365 days) are taxed as ordinary income at your marginal tax rate." },
    { question: "What are typical trading fees?", answer: "Major exchanges charge 0.1%–0.5% per trade. Coinbase charges ~0.5% for simple trades, Binance charges ~0.1%. When you buy AND sell, fees apply twice — once on each transaction. Our calculator applies the fee percentage to the sale proceeds." },
    { question: "What is cost basis?", answer: "Cost basis is the total amount you paid to acquire your crypto, including the purchase price and any buying fees. It's used to calculate your capital gain or loss when you sell. Cost Basis = Purchase Price × Quantity." },
    { question: "How do I report crypto on my taxes?", answer: "Report crypto transactions on IRS Form 8949 and Schedule D. Each sale is a separate taxable event. Keep records of every transaction including date, amount, price, and fees. Many tax software products now support crypto import from exchanges." },
    { question: "Does a loss reduce my tax bill?", answer: "Yes. If you sell at a loss, you can use it to offset gains from other investments (tax-loss harvesting). Up to $3,000 in net capital losses can be deducted against ordinary income per year. Unused losses carry forward to future tax years." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Cryptocurrency Profit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cryptocurrency Profit Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Purchase Price ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sale Price ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Quantity (coins)</label>
                <div className={inp}><input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} step="0.001" className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Holding Period (days)</label>
                <div className={inp}><input type="number" value={holdingDays} onChange={e => setHoldingDays(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">days</span></div>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Fees & Taxes</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Trading Fee (%)</label>
                      <div className={inp}><input type="number" value={feePct} onChange={e => setFeePct(e.target.value)} step="0.01" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
                      <div className={inp}><input type="number" value={taxRatePct} onChange={e => setTaxRatePct(e.target.value)} step="0.1" className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Holding &gt;365 days qualifies for long-term capital gains rates (typically 15–20%).</p>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {result && (<>
              {/* Primary Result Card */}
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Net Profit (Pre-Tax)</div>
                <div className={`text-4xl font-extrabold tracking-tight ${profitColor}`}>${result.netProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-muted-foreground mt-1">ROI: {result.roi.toFixed(2)}% · After-Tax: ${result.afterTaxProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>

              {/* 3-Stat Bar */}
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Cost Basis", `$${result.costBasis.toLocaleString("en-US", { maximumFractionDigits: 0 })}`],
                  ["Total Fees", `$${result.totalFees.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                  ["Tax Owed", `$${result.taxOwed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown Table */}
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Profit Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              {/* Donut Chart */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border bg-card">
                <div className="shrink-0">
                  {result.chartData.length > 0 ? (
                    <div className="w-[160px] h-[160px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RPie>
                          <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={2} dataKey="value">
                            {result.chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, ""]} />
                        </RPie>
                      </ResponsiveContainer>
                    </div>
                  ) : <div className="w-[160px] h-[160px] flex items-center justify-center text-muted-foreground text-xs">No data</div>}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Cost Breakdown</h4>
                  {result.chartData.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-bold text-foreground">${item.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Cryptocurrency Profit Calculator?</h2>
            <p>A cryptocurrency profit calculator helps you determine the exact gain or loss from a crypto trade by accounting for your purchase price, sale price, quantity, trading fees, and applicable taxes. Whether you trade Bitcoin, Ethereum, or altcoins, understanding your net profit after all costs is essential for informed investing and accurate tax reporting.</p>
            <h2 className="text-2xl font-bold mb-3">How Crypto Profit Is Calculated</h2>
            <p><strong>Cost Basis</strong> = Purchase Price × Quantity. <strong>Gross Proceeds</strong> = Sale Price × Quantity. <strong>Net Profit</strong> = Gross Proceeds − Cost Basis − Trading Fees. <strong>ROI</strong> = (Net Profit ÷ Cost Basis) × 100. These formulas give you a complete picture of your trade performance before and after taxes.</p>
            <h2 className="text-2xl font-bold mb-3">Short-Term vs Long-Term Capital Gains</h2>
            <p>In the US, if you hold cryptocurrency for more than 365 days before selling, you qualify for long-term capital gains rates (0%, 15%, or 20% depending on your income). Sales within 365 days are taxed as short-term capital gains at your ordinary income tax rate, which can be as high as 37%. This distinction can mean thousands of dollars in tax savings, making holding period a critical factor in your investment strategy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cryptocurrency-profit-calculator" />
          <PopularCalculators exclude="/calculator/cryptocurrency-profit-calculator" />
        </div>
      </div>
    </>
  );
}
