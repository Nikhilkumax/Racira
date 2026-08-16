"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, MousePointerClick } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CtrResult {
  clicks: number;
  impressions: number;
  ctrPct: number;
  spend: number;
  cpc: number;
  cpm: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCtr(clicks: number, impressions: number, spend: number): CtrResult {
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

  const chartData = [
    { name: "Clicks", value: clicks },
    { name: "Impressions", value: impressions },
  ];

  const breakdown = [
    { label: "Clicks", value: `${Math.round(clicks).toLocaleString()}` },
    { label: "Impressions", value: `${Math.round(impressions).toLocaleString()}` },
    { label: "Click-Through Rate (CTR)", value: `${ctrPct.toFixed(2)}%` },
    { label: "Ad Spend", value: `$${spend.toLocaleString()}` },
    { label: "Cost Per Click (CPC)", value: `$${cpc.toFixed(2)}` },
    { label: "Cost Per Mille (CPM)", value: `$${cpm.toFixed(2)}` },
    { label: "Impressions per Click", value: clicks > 0 ? `${(impressions / clicks).toFixed(1)}` : "—" },
    { label: "Benchmark", value: "0.5–2% typical display · 2–5% search" },
  ];

  const summaryStats = [
    { label: "CTR", value: `${ctrPct.toFixed(2)}%` },
    { label: "Clicks", value: `${Math.round(clicks).toLocaleString()}` },
    { label: "Impressions", value: `${Math.round(impressions).toLocaleString()}` },
    { label: "CPC", value: `$${cpc.toFixed(2)}` },
    { label: "CPM", value: `$${cpm.toFixed(2)}` },
    { label: "Rating", value: ctrPct >= 3 ? "Above average" : ctrPct >= 1 ? "Average" : "Below average" },
  ];

  return { clicks, impressions, ctrPct, spend, cpc, cpm, chartData, breakdown, summaryStats };
}

const DEFAULTS = { clicks: "50", impressions: "2000", spend: "120" };

export default function CtrCalculator() {
  const [clicks, setClicks] = useState(DEFAULTS.clicks);
  const [impressions, setImpressions] = useState(DEFAULTS.impressions);
  const [spend, setSpend] = useState(DEFAULTS.spend);
  const [result, setResult] = useState<CtrResult>(() => calcCtr(50, 2000, 120));

  useEffect(() => {
    const c = parseFloat(clicks);
    const i = parseFloat(impressions);
    const s = parseFloat(spend);
    if (!isNaN(c) && !isNaN(i) && !isNaN(s)) setResult(calcCtr(c, i, s));
  }, [clicks, impressions, spend]);

  const reset = () => { setClicks(DEFAULTS.clicks); setImpressions(DEFAULTS.impressions); setSpend(DEFAULTS.spend); };
  const invalid = isNaN(parseFloat(clicks)) || isNaN(parseFloat(impressions)) || isNaN(parseFloat(spend));

  const faqs = [
    { question: "What is CTR?", answer: "Click-through rate is the percentage of people who click your ad after seeing it: clicks ÷ impressions × 100. It measures how relevant and compelling your ad is to the audience." },
    { question: "What is a good CTR?", answer: "Display ads average 0.5–2%, search ads 2–5%, and email campaigns 2–5%. Benchmarks vary by industry, placement, and audience — compare against your own historical average first." },
    { question: "How do I improve CTR?", answer: "Sharpen the headline and offer, use relevant keywords, test creative, and tighten audience targeting. Higher CTR usually lowers your effective CPC because platforms reward relevance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CTR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CTR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="trclicks" className="block text-sm font-medium mb-1 text-foreground">Clicks</label>
                <input id="trclicks" type="number" min="0" value={clicks} onChange={(e) => setClicks(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="trimp" className="block text-sm font-medium mb-1 text-foreground">Impressions</label>
                <input id="trimp" type="number" min="1" value={impressions} onChange={(e) => setImpressions(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="trspend" className="block text-sm font-medium mb-1 text-foreground">Ad Spend ($, for CPC/CPM)</label>
              <input id="trspend" type="number" min="0" value={spend} onChange={(e) => setSpend(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <MousePointerClick className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numbers for clicks, impressions, and spend.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Click-Through Rate (CTR)</div>
              <div className="text-4xl font-extrabold text-primary">{result.ctrPct.toFixed(2)}%</div>
              <div className="text-sm text-muted-foreground mt-1">{Math.round(result.clicks).toLocaleString()} clicks / {Math.round(result.impressions).toLocaleString()} impressions · CPC ${result.cpc.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Clicks</div>
                <div className="text-lg font-bold text-primary">{Math.round(result.clicks).toLocaleString()}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CPC</div>
                <div className="text-lg font-bold text-primary">${result.cpc.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CPM</div>
                <div className="text-lg font-bold text-primary">${result.cpm.toFixed(2)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Clicks vs Impressions</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${Math.round(v).toLocaleString()}`, "Count"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the CTR Calculator</h2>
            <p>Click-through rate is the ratio of clicks to impressions, expressed as a percentage: (clicks ÷ impressions) × 100. It is the first quality signal advertisers and platforms use to judge an ad&apos;s relevance.</p>
            <h3>CTR in Context</h3>
            <p>A high CTR means your message resonates; it also improves Quality Score and lowers cost per click on auction platforms. Pair CTR with conversion rate — clicks are worthless if they never convert.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ctr-calculator" />
          <PopularCalculators exclude="/calculator/ctr-calculator" />
        </div>
      </div>
    </>
  );
}
