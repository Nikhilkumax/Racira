"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, MousePointerClick } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CpcResult {
  spend: number;
  clicks: number;
  impressions: number;
  cpc: number;
  cpm: number;
  ctrPct: number;
  costPerThousand: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCpc(spend: number, clicks: number, impressions: number): CpcResult {
  const cpc = clicks > 0 ? spend / clicks : 0;
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const chartData = [
    { name: "Total Spend", value: spend },
    { name: "Cost per Click × clicks", value: cpc * clicks },
  ];

  const breakdown = [
    { label: "Ad Spend", value: `$${spend.toLocaleString()}` },
    { label: "Clicks", value: `${Math.round(clicks).toLocaleString()}` },
    { label: "Impressions", value: `${Math.round(impressions).toLocaleString()}` },
    { label: "Cost Per Click (CPC)", value: `$${cpc.toFixed(2)}` },
    { label: "Cost Per Mille (CPM)", value: `$${cpm.toFixed(2)}` },
    { label: "Click-Through Rate (CTR)", value: `${ctrPct.toFixed(2)}%` },
    { label: "Avg. Clicks per $100", value: cpc > 0 ? `${(100 / cpc).toFixed(0)}` : "—" },
    { label: "Blended Rate", value: `$${spend > 0 && (clicks + impressions) > 0 ? (spend / (clicks + impressions)).toFixed(4) : 0}` },
  ];

  const summaryStats = [
    { label: "CPC", value: `$${cpc.toFixed(2)}` },
    { label: "CPM", value: `$${cpm.toFixed(2)}` },
    { label: "CTR", value: `${ctrPct.toFixed(2)}%` },
    { label: "Clicks", value: `${Math.round(clicks).toLocaleString()}` },
    { label: "Spend", value: `$${spend.toLocaleString()}` },
    { label: "Benchmark CPC", value: "$0.50–$3.00 (paid search)" },
  ];

  return { spend, clicks, impressions, cpc, cpm, ctrPct, costPerThousand: cpm, chartData, breakdown, summaryStats };
}

const DEFAULTS = { spend: "1000", clicks: "500", impressions: "25000" };

export default function CpcCalculator() {
  const [spend, setSpend] = useState(DEFAULTS.spend);
  const [clicks, setClicks] = useState(DEFAULTS.clicks);
  const [impressions, setImpressions] = useState(DEFAULTS.impressions);
  const [result, setResult] = useState<CpcResult>(() => calcCpc(1000, 500, 25000));

  useEffect(() => {
    const s = parseFloat(spend);
    const c = parseFloat(clicks);
    const i = parseFloat(impressions);
    if (!isNaN(s) && !isNaN(c) && !isNaN(i)) setResult(calcCpc(s, c, i));
  }, [spend, clicks, impressions]);

  const reset = () => { setSpend(DEFAULTS.spend); setClicks(DEFAULTS.clicks); setImpressions(DEFAULTS.impressions); };
  const invalid = isNaN(parseFloat(spend)) || isNaN(parseFloat(clicks)) || isNaN(parseFloat(impressions));

  const faqs = [
    { question: "What is CPC (cost per click)?", answer: "CPC is the average amount you pay each time someone clicks your ad: total spend divided by total clicks. It is the core billing model for Google Ads and most search advertising." },
    { question: "What is a good CPC?", answer: "It varies by industry — paid search keywords often run $0.50–$3.00, while competitive insurance and legal keywords can exceed $10. Compare against your conversion rate and customer value rather than a raw number." },
    { question: "How do CPC, CPM, and CTR relate?", answer: "CPC = spend ÷ clicks, CPM = spend ÷ impressions × 1000, and CTR = clicks ÷ impressions. Improving CTR lowers your effective CPC because you pay per click, not per impression." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CPC Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CPC Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cspend" className="block text-sm font-medium mb-1 text-foreground">Ad Spend ($)</label>
                <input id="cspend" type="number" min="0" value={spend} onChange={(e) => setSpend(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="cclicks" className="block text-sm font-medium mb-1 text-foreground">Clicks</label>
                <input id="cclicks" type="number" min="0" value={clicks} onChange={(e) => setClicks(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="cimp" className="block text-sm font-medium mb-1 text-foreground">Impressions (for CPM/CTR)</label>
              <input id="cimp" type="number" min="0" value={impressions} onChange={(e) => setImpressions(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <MousePointerClick className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numbers for spend, clicks, and impressions.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Cost Per Click (CPC)</div>
              <div className="text-4xl font-extrabold text-primary">${result.cpc.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">${result.spend.toLocaleString()} ÷ {Math.round(result.clicks).toLocaleString()} clicks · CPM ${result.cpm.toFixed(2)} · CTR {result.ctrPct.toFixed(2)}%</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CPM</div>
                <div className="text-lg font-bold text-primary">${result.cpm.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CTR</div>
                <div className="text-lg font-bold text-primary">{result.ctrPct.toFixed(2)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Clicks/$100</div>
                <div className="text-lg font-bold text-primary">{result.cpc > 0 ? (100 / result.cpc).toFixed(0) : "—"}</div>
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
              <h3 className="text-base font-bold mb-3">Spend vs Cost of Clicks</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                  <Tooltip formatter={(v: number) => [`$${Math.round(v).toLocaleString()}`, "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the CPC Calculator</h2>
            <p>Cost per click is the price you pay for each ad click — total spend divided by total clicks. This calculator also derives the companion metrics CPM (cost per thousand impressions) and CTR (click-through rate) when you provide impressions.</p>
            <h3>Making CPC Work for You</h3>
            <p>CPC matters only relative to conversion value. If a $2.00 click converts 5% of the time into a $100 sale, it is far more profitable than a $0.10 click that never converts. Track the full funnel, not just the click price.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cpc-calculator" />
          <PopularCalculators exclude="/calculator/cpc-calculator" />
        </div>
      </div>
    </>
  );
}
