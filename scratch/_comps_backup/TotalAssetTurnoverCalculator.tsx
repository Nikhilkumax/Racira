"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

/* ─── Interfaces ─────────────────────────────────────────────────────────── */

interface Inputs {
  totalRevenue: number;
  totalAssets: number;
  netFixedAssets: number;
  priorYearAssets: number;
  industry: string;
}

interface Result {
  assetTurnover: number;
  fixedAssetTurnover: number;
  avgAssetTurnover: number;
  revenuePerDollar: string;
  industryBenchmark: number;
  rating: string;
  ratingColor: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; color: string }[];
}

/* ─── Industry Benchmarks ────────────────────────────────────────────────── */

const BENCHMARKS: Record<string, number> = {
  "Retail": 1.8, "Manufacturing": 0.8, "Technology": 0.6, "Healthcare": 0.7,
  "Financial Services": 0.3, "Real Estate": 0.2, "Utilities": 0.4,
  "Transportation": 0.9, "Construction": 1.0, "Wholesale": 1.5, "Food Services": 1.6, "Average": 0.8,
};

/* ─── Pure Calculation ───────────────────────────────────────────────────── */

function calcTurnover(inp: Inputs): Result {
  const assetTurnover = inp.totalAssets > 0 ? inp.totalRevenue / inp.totalAssets : 0;
  const fixedAssetTurnover = inp.netFixedAssets > 0 ? inp.totalRevenue / inp.netFixedAssets : 0;
  const avgAssets = (inp.totalAssets + (inp.priorYearAssets || inp.totalAssets)) / 2;
  const avgAssetTurnover = avgAssets > 0 ? inp.totalRevenue / avgAssets : 0;
  const revenuePerDollar = assetTurnover.toFixed(2);
  const industryBenchmark = BENCHMARKS[inp.industry] || 0.8;

  let rating: string;
  let ratingColor: string;
  const diff = assetTurnover - industryBenchmark;
  if (diff > 0.3) { rating = "Excellent"; ratingColor = "text-emerald-600"; }
  else if (diff > 0) { rating = "Above Average"; ratingColor = "text-emerald-600"; }
  else if (diff > -0.2) { rating = "Average"; ratingColor = "text-foreground"; }
  else if (diff > -0.5) { rating = "Below Average"; ratingColor = "text-amber-500"; }
  else { rating = "Poor"; ratingColor = "text-red-500"; }

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtI = (n: number) => Math.round(n).toLocaleString("en-US");

  const breakdown = [
    { label: "Total Revenue", value: `$${fmtI(inp.totalRevenue)}` },
    { label: "Total Assets", value: `$${fmtI(inp.totalAssets)}` },
    { label: "Net Fixed Assets", value: `$${fmtI(inp.netFixedAssets)}` },
    { label: "Average Total Assets", value: `$${fmtI(avgAssets)}` },
    { label: "Total Asset Turnover", value: `${fmt(assetTurnover)}x`, highlight: true },
    { label: "Fixed Asset Turnover", value: `${fmt(fixedAssetTurnover)}x` },
    { label: "Avg. Asset Turnover", value: `${fmt(avgAssetTurnover)}x` },
    { label: "Industry Benchmark", value: `${fmt(industryBenchmark)}x (${inp.industry})` },
  ];

  const summaryStats = [
    { label: "Total Asset Turnover", value: `${fmt(assetTurnover)}x` },
    { label: "Fixed Asset Turnover", value: `${fmt(fixedAssetTurnover)}x` },
    { label: "Avg. Asset Turnover", value: `${fmt(avgAssetTurnover)}x` },
    { label: "Revenue per $1 Assets", value: `$${revenuePerDollar}` },
    { label: "Industry Benchmark", value: `${fmt(industryBenchmark)}x` },
    { label: "vs Benchmark", value: `${diff >= 0 ? "+" : ""}${fmt(diff)}x` },
    { label: "Rating", value: rating },
    { label: "Total Revenue", value: `$${fmtI(inp.totalRevenue)}` },
  ];

  const chartData = [
    { name: "Your Company", value: Math.round(assetTurnover * 100) / 100, color: "hsl(var(--primary))" },
    { name: inp.industry + " Benchmark", value: industryBenchmark, color: "#10b981" },
  ];

  return { assetTurnover, fixedAssetTurnover, avgAssetTurnover, revenuePerDollar, industryBenchmark, rating, ratingColor, breakdown, summaryStats, chartData };
}

/* ─── Defaults ───────────────────────────────────────────────────────────── */

const DEFAULTS: Inputs = { totalRevenue: 5000000, totalAssets: 2500000, netFixedAssets: 1000000, priorYearAssets: 2300000, industry: "Retail" };

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function TotalAssetTurnoverCalculator() {
  const [totalRevenue, setTotalRevenue] = useState(String(DEFAULTS.totalRevenue));
  const [totalAssets, setTotalAssets] = useState(String(DEFAULTS.totalAssets));
  const [netFixedAssets, setNetFixedAssets] = useState(String(DEFAULTS.netFixedAssets));
  const [priorYearAssets, setPriorYearAssets] = useState(String(DEFAULTS.priorYearAssets));
  const [industry, setIndustry] = useState(DEFAULTS.industry);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const getInputs = (): Inputs => ({
    totalRevenue: parseFloat(totalRevenue) || 0, totalAssets: parseFloat(totalAssets) || 0,
    netFixedAssets: parseFloat(netFixedAssets) || 0, priorYearAssets: parseFloat(priorYearAssets) || 0,
    industry,
  });

  const calculate = () => setResult(calcTurnover(getInputs()));
  const reset = () => {
    setTotalRevenue(String(DEFAULTS.totalRevenue)); setTotalAssets(String(DEFAULTS.totalAssets));
    setNetFixedAssets(String(DEFAULTS.netFixedAssets)); setPriorYearAssets(String(DEFAULTS.priorYearAssets));
    setIndustry(DEFAULTS.industry);
    setResult(calcTurnover(DEFAULTS));
  };

  useEffect(() => { setResult(calcTurnover(DEFAULTS)); }, []);

  const faqs = [
    { question: "What is total asset turnover?", answer: "Total asset turnover measures how efficiently a company uses its assets to generate revenue. It's calculated as: Total Asset Turnover = Revenue ÷ Total Assets. A ratio of 2.0 means the company generates $2 in revenue for every $1 of assets. Higher is generally better, but benchmarks vary by industry." },
    { question: "What's a good asset turnover ratio?", answer: "It depends on the industry. Retail and food services: 1.5–2.5x (high volume, low margins). Manufacturing: 0.5–1.0x (capital-intensive). Technology: 0.4–0.8x (intangible-heavy). Financial services: 0.1–0.4x (assets are loans/investments). Always compare against your specific industry average." },
    { question: "What's the difference between total and fixed asset turnover?", answer: "Total asset turnover uses all assets (current + fixed). Fixed asset turnover uses only net fixed assets (property, plant, equipment). Fixed asset turnover is more relevant for capital-intensive industries where manufacturing equipment drives revenue. A high fixed asset turnover with low total asset turnover may indicate too much working capital." },
    { question: "How can I improve my asset turnover?", answer: "Increase revenue without proportionally increasing assets (grow sales). Sell underperforming or idle assets. Lease instead of buy equipment (reduces asset base). Improve inventory management to reduce carrying costs. Outsource non-core functions to reduce fixed asset investment." },
  ];

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Total Asset Turnover Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Total Asset Turnover Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Total Revenue ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={totalRevenue} onChange={e => setTotalRevenue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Total Assets ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={totalAssets} onChange={e => setTotalAssets(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Net Fixed Assets ($)</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={netFixedAssets} onChange={e => setNetFixedAssets(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Industry</label>
                <div className="relative h-10">
                  <select value={industry} onChange={e => setIndustry(e.target.value)} className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium">
                    {Object.keys(BENCHMARKS).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus:outline-none">
                Advanced Options
                <svg className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Average Calculation</div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Prior Year Total Assets ($)</label>
                    <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={priorYearAssets} onChange={e => setPriorYearAssets(e.target.value)} className={ci} /></div>
                    <p className="text-[11px] text-muted-foreground mt-1">Used to calculate average assets for a more accurate turnover ratio.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center shrink-0"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Asset Turnover</div>
                <div className={`text-4xl font-extrabold tracking-tight ${result.ratingColor}`}>{result.assetTurnover.toFixed(2)}x</div>
                <div className="text-sm text-muted-foreground mt-1">${result.revenuePerDollar} revenue per $1 of assets · Rating: <span className={`font-bold ${result.ratingColor}`}>{result.rating}</span></div>
              </div>

              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[
                  ["Fixed Asset Turnover", `${result.fixedAssetTurnover.toFixed(2)}x`],
                  ["Avg. Asset Turnover", `${result.avgAssetTurnover.toFixed(2)}x`],
                  ["Industry Benchmark", `${result.industryBenchmark.toFixed(2)}x`],
                ].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.highlight ? "bg-primary/5" : ""}`}>
                      <td className={`py-2.5 ${r.highlight ? "font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right ${r.highlight ? "font-bold" : "font-semibold"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Your Company vs Industry</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} />
                    <Tooltip formatter={(v: number) => [`${v.toFixed(2)}x`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

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
            <h2 className="text-2xl font-bold mb-3">What Is Total Asset Turnover?</h2>
            <p>Total asset turnover is an efficiency ratio that measures how effectively a company uses its assets to generate sales. It&apos;s one of the five key ratios in the DuPont analysis framework for evaluating return on equity (ROE).</p>
            <h2 className="text-2xl font-bold mb-3">Industry Benchmarks</h2>
            <p>Retail and food services have high asset turnover (1.5–2.5x) because they generate high sales volume from relatively small asset bases. Manufacturing and utilities have lower ratios (0.3–0.8x) because they require significant capital equipment. Comparing across industries is misleading — always benchmark against your specific sector.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/total-asset-turnover-calculator" />
          <PopularCalculators exclude="/calculator/total-asset-turnover-calculator" />
        </div>
      </div>
    </>
  );
}
