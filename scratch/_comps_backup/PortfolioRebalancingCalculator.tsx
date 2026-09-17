"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, PieChart as PieIcon, Plus, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Asset {
  id: number;
  name: string;
  value: string;
  target: string;
}

const DEFAULT_ASSETS: Asset[] = [
  { id: 1, name: "US Stocks", value: "50000", target: "60" },
  { id: 2, name: "Bonds", value: "25000", target: "30" },
  { id: 3, name: "International", value: "15000", target: "10" },
];

const COLORS = ["#2563eb", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function PortfolioRebalancingCalculator() {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [showResults, setShowResults] = useState(false);

  const total = assets.reduce((s, a) => s + (parseFloat(a.value) || 0), 0);
  const targetSum = assets.reduce((s, a) => s + (parseFloat(a.target) || 0), 0);
  const rows =
    total > 0
      ? assets.map((a) => {
          const val = parseFloat(a.value) || 0;
          const tgt = parseFloat(a.target) || 0;
          const current = (val / total) * 100;
          const targetVal = total * (tgt / 100);
          const diff = targetVal - val;
          return {
            id: a.id,
            name: a.name || "Unnamed",
            value: val,
            current,
            target: tgt,
            action: diff > 0.01 ? "Buy" : diff < -0.01 ? "Sell" : "Hold",
            amount: Math.abs(diff),
          };
        })
      : [];

  const pieData = assets
    .filter((a) => (parseFloat(a.value) || 0) > 0)
    .map((a) => ({ name: a.name || "Unnamed", value: Math.round(parseFloat(a.value) || 0) }));

  const addAsset = () => {
    setAssets([...assets, { id: Date.now(), name: "", value: "0", target: "0" }]);
  };

  const removeAsset = (id: number) => {
    setAssets(assets.filter((a) => a.id !== id));
  };

  const updateAsset = (id: number, field: "name" | "value" | "target", val: string) => {
    setAssets(assets.map((a) => (a.id === id ? { ...a, [field]: val } : a)));
  };

  const handleCalculate = () => setShowResults(true);

  const reset = () => {
    setAssets(DEFAULT_ASSETS);
    setShowResults(false);
  };

  const faqs = [
    { question: "What is rebalancing?", answer: "Restoring your portfolio to its target allocation by buying underweight assets and selling overweight ones. Without it, winners grow until one asset class dominates — a 60/30/10 portfolio can drift to 80/15/5, silently increasing your risk beyond what you planned." },
    { question: "How often should I rebalance?", answer: "Most advisors recommend every 6–12 months, or when an asset drifts more than 5 percentage points from target. Annual rebalancing captures most of the benefit with minimal trading; more frequent rebalancing adds little and increases taxable events." },
    { question: "Why is rebalancing good for returns?", answer: "It forces you to sell high and buy low mechanically — trimming assets that have run up and adding to those that have fallen. Studies show it slightly reduces volatility and can add 0.2–0.5% per year versus never rebalancing, while keeping risk at your intended level." },
    { question: "Should I rebalance in a taxable account?", answer: "Selling winners creates capital gains taxes. In taxable accounts, prefer rebalancing with new contributions — direct new money into underweight assets until they catch up. Use tax-advantaged accounts (401(k), IRA) for the trades that generate gains." },
    { question: "What is drift?", answer: "The gap between current and target allocation caused by differing returns. High-growth assets drift upward fastest. The classic cure is a 'drift threshold' — rebalance when any asset is more than 5 percentage points from target, which this calculator's Buy/Sell amounts show you precisely." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Portfolio Rebalancing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Portfolio Rebalancing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <PieIcon className="w-4 h-4" /> Asset Allocation
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Asset name</span>
                <span>Value ($)</span>
                <span>Target (%)</span>
                <span />
              </div>
              {assets.map((a) => (
                <div key={a.id} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center">
                  <input
                    type="text"
                    value={a.name}
                    onChange={(e) => updateAsset(a.id, "name", e.target.value)}
                    placeholder="Asset name"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={a.value}
                    onChange={(e) => updateAsset(a.id, "value", e.target.value)}
                    placeholder="0"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <input
                    type="number"
                    value={a.target}
                    onChange={(e) => updateAsset(a.id, "target", e.target.value)}
                    placeholder="0"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                  <button
                    className="h-9 w-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                    onClick={() => removeAsset(a.id)}
                    aria-label="Remove asset"
                  >
                    <Trash2 className="h-4 w-4 mx-auto" />
                  </button>
                </div>
              ))}
              <button onClick={addAsset} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors">
                <Plus className="h-4 w-4" /> Add Asset
              </button>
            </div>

            {Math.abs(targetSum - 100) > 0.01 && assets.length > 0 && (
              <p className="text-sm font-medium text-amber-500">
                Target allocations sum to {targetSum.toFixed(1)}% — adjust to 100% for a balanced plan.
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && total > 0 ? (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-4xl font-bold text-primary mt-1">{fmt(total)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {rows.filter((r) => r.action === "Buy").length} to buy · {rows.filter((r) => r.action === "Sell").length} to sell · {rows.filter((r) => r.action === "Hold").length} on target
                  </p>
                </div>

                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-base">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="py-2.5 px-3 font-medium">Asset</th>
                        <th className="py-2.5 px-3 font-medium text-right">Current %</th>
                        <th className="py-2.5 px-3 font-medium text-right">Target %</th>
                        <th className="py-2.5 px-3 font-medium text-right">Action</th>
                        <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr className="border-b" key={r.id}>
                          <td className="py-2.5 px-3 font-medium">{r.name}</td>
                          <td className="py-2.5 px-3 text-right">{r.current.toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-right">{r.target.toFixed(1)}%</td>
                          <td className={`py-2.5 px-3 text-right font-semibold ${r.action === "Buy" ? "text-emerald-600" : r.action === "Sell" ? "text-red-500" : "text-muted-foreground"}`}>
                            {r.action}
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(r.amount)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="py-2.5 px-3">Total</td>
                        <td className="py-2.5 px-3 text-right">{total > 0 ? "100.0%" : "—"}</td>
                        <td className="py-2.5 px-3 text-right">{targetSum.toFixed(1)}%</td>
                        <td className="py-2.5 px-3 text-right" />
                        <td className="py-2.5 px-3 text-right">{fmt(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium mb-3">Current Allocation</p>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} label>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <p className="text-sm font-medium mb-3">Rebalancing Plan</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Portfolio Total</span>
                      <span className="font-medium">{fmt(total)}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Target Allocations Sum</span>
                      <span className="font-medium">{targetSum.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Assets on Target</span>
                      <span className="font-medium">{rows.filter((r) => r.action === "Hold").length}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/60 py-1.5">
                      <span className="text-muted-foreground">Total to Rebalance</span>
                      <span className="font-medium">{fmt(rows.reduce((s, r) => s + r.amount, 0))}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="card-calculator border border-border bg-card !p-5 text-center text-muted-foreground">
                {total <= 0 ? "Enter asset values to see the plan." : <>Add your assets and targets, then click <strong className="text-foreground">Calculate</strong> to see exactly what to buy and sell.</>}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Rebalance</h2>
            <p>With $50,000 US stocks, $25,000 bonds, and $15,000 international (60/30/10 targets), the portfolio has drifted to 55.6/27.8/16.7 — international is overweight. Rebalancing means buying $4,000 of stocks and $2,000 of bonds while selling $6,000 of international. In taxable accounts, prefer directing new contributions to underweight assets to avoid capital gains.</p>
            <h3>Discipline Beats Prediction</h3>
            <p>Rebalancing is the rare strategy that works precisely because you do not know what happens next. You sell what has done well and buy what has lagged, on a fixed schedule — the mechanical opposite of chasing performance. Over decades this keeps your risk profile constant and your returns closer to your plan.</p>
            <h3>Thresholds and Taxes</h3>
            <p>Set a drift band (commonly ±5 percentage points) to avoid overtrading, and rebalance in tax-advantaged accounts first. If you must sell in taxable accounts, prioritize the lots with the smallest gains. New contributions are the cheapest rebalancing tool of all — they cost no commissions and create no tax events.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/portfolio-rebalancing-calculator" />
          <PopularCalculators exclude="/calculator/portfolio-rebalancing-calculator" />
        </div>
      </div>
    </>
  );
}
