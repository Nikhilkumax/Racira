"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import { RotateCcw, Plus, Trash2 } from "lucide-react";

interface Asset {
  name: string;
  value: string;
  target: string;
}

export default function PortfolioRebalancingCalculator() {
  const [assets, setAssets] = useState<Asset[]>([
    { name: "US Stocks", value: "50000", target: "60" },
    { name: "Bonds", value: "25000", target: "30" },
    { name: "International", value: "15000", target: "10" },
  ]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Array<{ name: string; value: number; current: number; target: number; action: string; amount: number }>>([]);
  const [totalValue, setTotalValue] = useState(0);

  const addAsset = () => setAssets(prev => [...prev, { name: "", value: "0", target: "0" }]);
  const removeAsset = (i: number) => setAssets(prev => prev.filter((_, idx) => idx !== i));
  const updateAsset = (i: number, field: keyof Asset, val: string) => {
    setAssets(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: val } : a));
  };

  const handleCalculate = () => {
    const total = assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
    if (total === 0) return;
    const res = assets.map(a => {
      const val = parseFloat(a.value) || 0;
      const tgt = parseFloat(a.target) || 0;
      const current = (val / total) * 100;
      const targetVal = total * (tgt / 100);
      const diff = targetVal - val;
      return {
        name: a.name || "Unnamed",
        value: val,
        current,
        target: tgt,
        action: diff > 0 ? "Buy" : diff < 0 ? "Sell" : "Hold",
        amount: Math.abs(diff),
      };
    });
    setResults(res);
    setTotalValue(total);
    setShowResults(true);
  };

  const reset = () => {
    setAssets([
      { name: "US Stocks", value: "50000", target: "60" },
      { name: "Bonds", value: "25000", target: "30" },
      { name: "International", value: "15000", target: "10" },
    ]);
    setShowResults(false);
  };

  const faqs = [
    { question: "What is portfolio rebalancing?", answer: "Rebalancing is the process of realigning the weightings of your portfolio assets to maintain your original desired asset allocation or risk level." },
    { question: "How often should I rebalance?", answer: "Most financial advisors recommend annual rebalancing or when any asset class drifts more than 5-10% from its target allocation. More frequent rebalancing can create unnecessary tax events." },
    { question: "Does rebalancing improve returns?", answer: "Rebalancing doesn't necessarily maximize returns — it manages risk. It forces you to sell high-performing assets and buy underperformers, maintaining your intended risk profile." },
    { question: "What are the tax implications of rebalancing?", answer: "In taxable accounts, selling appreciated assets triggers capital gains taxes. Tax-advantaged accounts (IRA, 401k) allow free rebalancing. Use new contributions or dividend reinvestment to rebalance without selling when possible." },
    { question: "What is the difference between strategic and tactical asset allocation?", answer: "Strategic allocation sets a long-term target (e.g., 60/40 stocks/bonds) and periodically rebalances to it. Tactical allocation temporarily deviates from the target based on market conditions." },
    { question: "What is a drift threshold for rebalancing?", answer: "A drift threshold triggers rebalancing when an asset's weight deviates by a set amount (e.g., 5%) from its target. This is more systematic than calendar-based rebalancing." },
    { question: "Should I sell assets or use new contributions to rebalance?", answer: "Using new contributions (from salary, dividends, or new deposits) to buy underweight assets is a tax-efficient rebalancing strategy that avoids triggering capital gains in taxable accounts." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Portfolio Rebalancing Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Portfolio Rebalancing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-3 mb-4">
                <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Asset Name</span><span>Current Value ($)</span><span>Target Alloc. (%)</span><span></span>
                </div>
                {assets.map((asset, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center">
                    <input type="text" value={asset.name} onChange={e => updateAsset(i, "name", e.target.value)} className="input-calc" placeholder="Asset name" />
                    <input type="number" value={asset.value} onChange={e => updateAsset(i, "value", e.target.value)} className="input-calc" placeholder="0" />
                    <input type="number" value={asset.target} onChange={e => updateAsset(i, "target", e.target.value)} className="input-calc" placeholder="0" />
                    <button onClick={() => removeAsset(i)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <button onClick={addAsset} className="flex items-center gap-2 text-sm text-primary hover:underline mb-6"><Plus className="h-4 w-4" /> Add Asset</button>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Rebalancing Trades</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-xl font-bold mb-4">Rebalancing Plan</h2>
                <p className="text-sm text-muted-foreground mb-4">Total Portfolio Value: <strong>${totalValue.toLocaleString()}</strong></p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-2 font-medium">Asset</th>
                      <th className="text-right py-2 font-medium">Current %</th>
                      <th className="text-right py-2 font-medium">Target %</th>
                      <th className="text-right py-2 font-medium">Action</th>
                      <th className="text-right py-2 font-medium">Amount</th>
                    </tr></thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2">{r.name}</td>
                          <td className="text-right py-2">{r.current.toFixed(1)}%</td>
                          <td className="text-right py-2">{r.target.toFixed(1)}%</td>
                          <td className={`text-right py-2 font-semibold ${r.action === "Buy" ? "text-green-500" : r.action === "Sell" ? "text-red-500" : "text-muted-foreground"}`}>{r.action}</td>
                          <td className="text-right py-2">${r.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Why Portfolio Rebalancing Matters</h2>
              <p>Portfolio rebalancing is one of the most important — yet most overlooked — aspects of disciplined investing. When you initially construct a portfolio, you assign target weights to different asset classes (e.g., 60% stocks, 30% bonds, 10% international) based on your risk tolerance and investment goals. Over time, as markets move, these weights drift. Stocks may surge, pushing your portfolio to 75% stocks without you making a single decision. This drift can expose you to far more risk than you intended.</p>
              <h2>The Mathematics of Drift</h2>
              <p>Consider a classic 60/40 portfolio starting with $100,000. If stocks return 30% and bonds return 5% in a year, stocks would now represent 65.3% of the portfolio and bonds just 34.7%. You've taken on more equity risk without any deliberate choice. If stocks then fall 40% in the following year, the more stock-heavy portfolio suffers a much larger loss than your intended 60/40 allocation would have.</p>
              <h2>When to Rebalance</h2>
              <p>There are two primary rebalancing strategies. <strong>Calendar rebalancing</strong> triggers a review on a set schedule (quarterly, semi-annually, annually). <strong>Threshold rebalancing</strong> triggers action whenever an asset drifts by a predetermined percentage (typically 5%) from its target. Research suggests that threshold-based rebalancing is slightly more efficient, but both strategies are far better than no rebalancing at all.</p>
              <h2>Tax-Smart Rebalancing</h2>
              <p>In taxable brokerage accounts, selling appreciated assets triggers capital gains taxes. Strategic investors can minimize this tax drag through several approaches: directing new contributions into underweight asset classes, using dividends and income to buy underweight assets, rebalancing inside tax-advantaged accounts (401k, IRA) where there are no tax consequences, and using tax-loss harvesting to offset capital gains.</p>
              <h2>Asset Allocation by Life Stage</h2>
              <p>Your target allocation should shift over time. Young investors can tolerate higher equity allocations (80-100% stocks) because they have decades to recover from bear markets. As retirement approaches, gradually shifting toward more bonds and stable assets reduces volatility and preserves capital for near-term income needs. Target-date funds automate this process but may not perfectly match your personal risk tolerance.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/portfolio-rebalancing-calculator" />
          <PopularCalculators exclude="/calculator/portfolio-rebalancing-calculator" />
        </div>
      </div>
    </>
  );
}
