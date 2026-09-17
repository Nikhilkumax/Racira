"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CpmResult {
  spend: number;
  impressions: number;
  clicks: number;
  cpm: number;
  cpc: number;
  ctrPct: number;
  budgetFor10k: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCpm(spend: number, impressions: number, clicks: number): CpmResult {
  const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const ctrPct = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const budgetFor10k = cpm * 10;

  const chartData = [
    { name: "Impressions (k)", value: impressions / 1000 },
    { name: "Effective @ CPM", value: spend / cpm },
  ];

  const breakdown = [
    { label: "Ad Spend", value: `$${spend.toLocaleString()}` },
    { label: "Impressions", value: `${Math.round(impressions).toLocaleString()}` },
    { label: "Clicks", value: `${Math.round(clicks).toLocaleString()}` },
    { label: "Cost Per Mille (CPM)", value: `$${cpm.toFixed(2)}` },
    { label: "Effective CPC", value: `$${cpc.toFixed(2)}` },
    { label: "CTR", value: `${ctrPct.toFixed(2)}%` },
    { label: "Budget for 10k Impressions", value: `$${budgetFor10k.toFixed(2)}` },
    { label: "Impressions per $100", value: cpm > 0 ? `${Math.round((100 / cpm) * 1000).toLocaleString()}` : "—" },
  ];

  const summaryStats = [
    { label: "CPM", value: `$${cpm.toFixed(2)}` },
    { label: "eCPC", value: `$${cpc.toFixed(2)}` },
    { label: "CTR", value: `${ctrPct.toFixed(2)}%` },
    { label: "Impressions", value: `${Math.round(impressions).toLocaleString()}` },
    { label: "Budget / 10k", value: `$${budgetFor10k.toFixed(2)}` },
    { label: "Typical Display CPM", value: "$1–$12" },
  ];

  return { spend, impressions, clicks, cpm, cpc, ctrPct, budgetFor10k, chartData, breakdown, summaryStats };
}

const DEFAULTS = { spend: "500", impressions: "100000", clicks: "1200" };

export default function CpmCalculator() {
  const [spend, setSpend] = useState(DEFAULTS.spend);
  const [impressions, setImpressions] = useState(DEFAULTS.impressions);
  const [clicks, setClicks] = useState(DEFAULTS.clicks);
  const [result, setResult] = useState<CpmResult>(() => calcCpm(500, 100000, 1200));

  useEffect(() => {
    const s = parseFloat(spend);
    const i = parseFloat(impressions);
    const c = parseFloat(clicks);
    if (!isNaN(s) && !isNaN(i) && !isNaN(c)) setResult(calcCpm(s, i, c));
  }, []);

  const reset = () => { setSpend(DEFAULTS.spend); setImpressions(DEFAULTS.impressions); setClicks(DEFAULTS.clicks); setResult(calcCpm(parseFloat(DEFAULTS.spend), parseFloat(DEFAULTS.impressions), parseFloat(DEFAULTS.clicks))); };
  const invalid = isNaN(parseFloat(spend)) || isNaN(parseFloat(impressions)) || isNaN(parseFloat(clicks));

  const faqs = [
    { question: "What is CPM (cost per mille)?", answer: "CPM is the cost of 1,000 ad impressions: total spend divided by impressions, multiplied by 1,000. It is the standard billing model for display, video, and programmatic advertising." },
    { question: "What is a good CPM?", answer: "Display CPMs typically run $1–$12; premium video and targeted audiences can exceed $30. High CPMs are fine when the audience converts — judge CPM against revenue per impression." },
    { question: "How is CPM different from CPC?", answer: "CPM bills per 1,000 impressions regardless of interaction, while CPC bills per click. CPM suits brand awareness; CPC suits direct response. The two are linked through CTR: eCPC = CPM ÷ (CTR × 10)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CPM Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CPM Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="mspend" className="block text-sm font-medium mb-1 text-foreground">Ad Spend ($)</label>
                <input id="mspend" type="number" min="0" value={spend} onChange={(e) => setSpend(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="mimp" className="block text-sm font-medium mb-1 text-foreground">Impressions</label>
                <input id="mimp" type="number" min="1" value={impressions} onChange={(e) => setImpressions(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="mclicks" className="block text-sm font-medium mb-1 text-foreground">Clicks (for CTR / eCPC)</label>
              <input id="mclicks" type="number" min="0" value={clicks} onChange={(e) => setClicks(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Eye className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numbers for spend, impressions, and clicks.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Cost Per Mille (CPM)</div>
              <div className="text-4xl font-extrabold text-primary">${result.cpm.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">${result.spend.toLocaleString()} ÷ {Math.round(result.impressions).toLocaleString()} impressions × 1,000 · eCPC ${result.cpc.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">eCPC</div>
                <div className="text-lg font-bold text-primary">${result.cpc.toFixed(2)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">CTR</div>
                <div className="text-lg font-bold text-primary">{result.ctrPct.toFixed(2)}%</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Budget / 10k</div>
                <div className="text-lg font-bold text-primary">${result.budgetFor10k.toFixed(2)}</div>
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
              <h3 className="text-base font-bold mb-3">Budget vs Impressions Delivered</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${Math.round(v).toLocaleString()}k`, "Impressions"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the CPM Calculator</h2>
            <p>Cost per mille (CPM) is the price of 1,000 ad impressions — spend divided by impressions, scaled by 1,000. It is the dominant billing model for display, video, and programmatic campaigns, where reach rather than clicks is the goal.</p>
            <h3>CPM, CTR, and eCPC</h3>
            <p>When you also supply clicks, the calculator derives the click-through rate and the effective cost per click (eCPC = spend ÷ clicks). That lets you compare CPM-based brand campaigns against CPC-based performance campaigns on equal footing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cpm-calculator" />
          <PopularCalculators exclude="/calculator/cpm-calculator" />
        </div>
      </div>
    </>
  );
}
