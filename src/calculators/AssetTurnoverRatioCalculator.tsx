"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-9 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground shrink-0">{prefix}</span>}
      <input id={id} type="number" value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  </div>
);

const fmt = (n: number, d = 4) => n.toFixed(d);
const fmtM = (n: number) => Math.abs(n)>=1e6?`$${(n/1e6).toFixed(2)}M`:Math.abs(n)>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${n.toFixed(2)}`;

function calcAssetTurnover(revenue: number, beginAssets: number, endAssets: number) {
  const avgAssets = (beginAssets + endAssets) / 2;
  const ratio = avgAssets > 0 ? revenue / avgAssets : 0;
  const revenuePerDollarAsset = ratio;
  const assetsPerDollarRevenue = ratio > 0 ? 1 / ratio : 0;
  const daysToTurn = ratio > 0 ? 365 / ratio : 0;
  const benchmarks = [
    {sector:"Retail",ratio:2.5},{sector:"Wholesale",ratio:1.8},{sector:"Manufacturing",ratio:0.9},
    {sector:"Healthcare",ratio:0.8},{sector:"Technology",ratio:0.7},{sector:"Utilities",ratio:0.4},
  ];
  const status = ratio >= 2 ? "High Efficiency" : ratio >= 1 ? "Moderate" : ratio >= 0.5 ? "Low" : "Very Low";
  return { ratio, avgAssets, revenuePerDollarAsset, assetsPerDollarRevenue, daysToTurn, benchmarks, status };
}

const TTip = ({ active, payload, label }: any) => active && payload?.length ? (
  <div className="bg-card border border-border p-2 rounded-lg shadow text-xs">
    <p className="font-bold mb-1">{label}</p>
    <p className="text-primary font-semibold">Ratio: {payload[0]?.value?.toFixed(2)}x</p>
  </div>
) : null;

const COLORS = ["hsl(var(--primary))","#10b981","#f59e0b","#8b5cf6","#ef4444","#6b7280"];

export default function AssetTurnoverRatioCalculator() {
  const [revenue, setRevenue] = useState("8000000");
  const [beginAssets, setBeginAssets] = useState("4500000");
  const [endAssets, setEndAssets] = useState("5500000");
  const [res, setRes] = useState<ReturnType<typeof calcAssetTurnover>|null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); run(); }, []);
  const run = () => setRes(calcAssetTurnover(parseFloat(revenue)||0,parseFloat(beginAssets)||0,parseFloat(endAssets)||0));
  const reset = () => { setRevenue("8000000");setBeginAssets("4500000");setEndAssets("5500000"); setRes(calcAssetTurnover(8000000,4500000,5500000)); };

  const faqs = [
    { question: "What is the Asset Turnover Ratio?", answer: "Asset Turnover = Net Revenue / Average Total Assets. It measures how efficiently a company uses its assets to generate revenue. A ratio of 1.5x means the company generates $1.50 in revenue for every $1 of assets — higher is better, though benchmarks vary widely by industry." },
    { question: "How do I calculate average total assets?", answer: "Average Total Assets = (Beginning Total Assets + Ending Total Assets) / 2. Using the average smooths out seasonal fluctuations. If only one year-end figure is available, some analysts use the single figure instead, which this calculator also supports." },
    { question: "Why does Asset Turnover vary by industry?", answer: "Capital-intensive industries (utilities, real estate, manufacturing) have massive asset bases relative to revenue, naturally producing low ratios (0.3–0.8x). Asset-light businesses (retail, services, software) produce much higher ratios (1.5–3.0x). Never compare across industries." },
    { question: "How is Asset Turnover used in DuPont Analysis?", answer: "Asset Turnover is the middle multiplier in the classic DuPont formula: ROE = Net Margin × Asset Turnover × Equity Multiplier (financial leverage). Improving asset turnover directly improves ROE without needing higher margins or leverage." },
    { question: "What is the Fixed Asset Turnover vs Total Asset Turnover?", answer: "Total Asset Turnover uses all assets (current + non-current). Fixed Asset Turnover = Revenue / Net PP&E, focusing specifically on how efficiently the company uses its long-term physical assets. Fixed Asset Turnover is more relevant for manufacturing and capital-heavy businesses." },
    { question: "Can Asset Turnover be too high?", answer: "Unusually high Asset Turnover can signal under-investment in assets — the company may be using aging equipment, skimping on inventory, or failing to build capacity for future growth. Always contextualize with growth rates and capex levels." },
  ];

  return (
    <>
      <Breadcrumb items={[{label:"Home",href:"/"},{label:"Calculators",href:"/calculator"},{label:"Financial",href:"/calculator#financial"},{label:"Asset Turnover Ratio Calculator"}]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Asset Turnover Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold pb-2 border-b border-border">Financial Data</h2>
            <CompactInput id="rev" label="Net Revenue (Annual)" value={revenue} onChange={setRevenue} prefix="$" />
            <CompactInput id="begin" label="Total Assets (Beginning of Period)" value={beginAssets} onChange={setBeginAssets} prefix="$" />
            <CompactInput id="end" label="Total Assets (End of Period)" value={endAssets} onChange={setEndAssets} prefix="$" />
            <div className="p-3 rounded-lg bg-secondary/20 border border-border text-xs text-muted-foreground">
              Asset Turnover = Revenue ÷ Average Total Assets. Average Assets = (Begin + End) ÷ 2. Measures operational efficiency.
            </div>
            <div className="flex gap-2.5">
              <button onClick={run} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button onClick={reset} className="px-3 rounded-md border border-border hover:bg-secondary h-9 transition-colors flex items-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-lg font-bold">Efficiency Analysis</h2>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>

                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Asset Turnover Ratio</div>
                  <div className="text-4xl font-extrabold tracking-tight">{fmt(res.ratio,2)}x</div>
                  <div className="text-sm text-muted-foreground mt-1">Status: {res.status} · Avg Assets: {fmtM(res.avgAssets)}</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase">
                      <th className="p-2.5 pl-3">Metric</th><th className="p-2.5 pr-3 text-right">Value</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        {label:"Net Revenue",value:fmtM(parseFloat(revenue)||0)},
                        {label:"Beginning Assets",value:fmtM(parseFloat(beginAssets)||0)},
                        {label:"Ending Assets",value:fmtM(parseFloat(endAssets)||0)},
                        {label:"Average Total Assets",value:fmtM(res.avgAssets)},
                        {label:"Asset Turnover Ratio",value:`${fmt(res.ratio,2)}x`,bold:true},
                        {label:"Revenue per $1 Asset",value:`$${fmt(res.revenuePerDollarAsset,3)}`},
                        {label:"Days to Turn Assets",value:`${fmt(res.daysToTurn,0)} days`},
                      ].map(r=>(
                        <tr key={r.label} className={`hover:bg-secondary/20 ${(r as any).bold?"font-bold bg-secondary/30":""}`}>
                          <td className="p-2.5 pl-3 font-semibold">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-xl border border-border">
                  <h3 className="text-sm font-bold mb-3">Your Ratio vs Industry Benchmarks</h3>
                  {mounted && (<>

                    <ResponsiveContainer width="100%" height={195}>
                      <BarChart data={[{sector:"Your Company",ratio:parseFloat(fmt(res.ratio,2))},...res.benchmarks]} margin={{top:4,right:8,left:0,bottom:4}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="sector" tick={{fontSize:10}} />
                        <YAxis tick={{fontSize:11}} tickFormatter={v=>`${v}x`} />
                        <Tooltip content={<TTip />} />
                        <Bar dataKey="ratio" radius={[4,4,0,0]} name="Asset Turnover">
                          {[{sector:"Your Company"},...res.benchmarks].map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  
</>)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-border">
                  {[
                    {label:"Asset Turnover",value:`${fmt(res.ratio,2)}x`},
                    {label:"Status",value:res.status},
                    {label:"Average Assets",value:fmtM(res.avgAssets)},
                    {label:"Revenue/$ Asset",value:`$${fmt(res.revenuePerDollarAsset,3)}`},
                    {label:"Days to Turn",value:`${fmt(res.daysToTurn,0)} days`},
                    {label:"Assets/$Revenue",value:`$${fmt(res.assetsPerDollarRevenue,3)}`},
                  ].map(item=>(
                    <div key={item.label} className="flex flex-col">
                      <span className="text-[12px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">{item.label}</span>
                      <span className="text-base font-extrabold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is the Asset Turnover Ratio?</h2>
            <p>The Asset Turnover Ratio is a fundamental efficiency metric that measures how effectively a company uses its total asset base to generate revenue. The formula is simple: Asset Turnover = Net Revenue / Average Total Assets. A ratio of 1.5x means the company generates $1.50 in revenue for every dollar of assets it owns. Higher ratios indicate greater operational efficiency — the company is squeezing more revenue from the same asset base.</p>
            <p>This metric is a cornerstone of the DuPont Analysis framework, which decomposes Return on Equity (ROE) into three components: net profit margin, asset turnover, and financial leverage. Understanding asset turnover allows investors to diagnose whether a company's ROE is driven by superior margins, efficient asset use, or financial leverage — a critical distinction for valuation and risk assessment.</p>
            <h2>Why Average Assets Are Used</h2>
            <p>Using the average of beginning and ending period assets smooths out the effect of major asset acquisitions or disposals during the year. A company that acquired a large factory in December would show an artificially low turnover if only the year-end figure were used. The average better represents the assets actually available throughout the operating period.</p>
            <h2>Industry Context Is Critical</h2>
            <p>Retail chains like Walmart achieve asset turnover of 2.0–2.5x because they generate enormous revenue relative to their store and inventory assets. Technology companies like Microsoft achieve 0.5–0.8x despite their asset-light model because their asset base includes massive cash holdings and intangibles. Electric utilities may achieve only 0.2–0.3x due to enormous infrastructure. Never interpret asset turnover in isolation — always compare within the same industry sector.</p>
            <h2>Improving Asset Turnover</h2>
            <p>Companies can improve asset turnover by increasing revenue through better sales and pricing, selling or leasing non-core assets to reduce the denominator, improving inventory management to reduce holding periods, optimizing accounts receivable collection cycles, and outsourcing capital-intensive operations. Each of these strategies reduces assets relative to revenue or grows revenue relative to assets.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/asset-turnover-ratio-calculator" />
          <PopularCalculators exclude="/calculator/asset-turnover-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
