"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CandleResult {
  burnHours: number;
  burnRate: number;
  waxWeight: number;
  wickType: string;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const WICKS: Record<string, { label: string; rate: number }> = {
  small: { label: "Small (1\"–2\" diameter)", rate: 3.5 },
  medium: { label: "Medium (2\"–3\" diameter)", rate: 5.0 },
  large: { label: "Large (3\"–4\" diameter)", rate: 7.0 },
  extraLarge: { label: "Extra Large (4\"+ diameter)", rate: 9.5 },
};

function calcCandle(waxOz: number, wickKey: string): CandleResult {
  const wax = Math.max(0, waxOz);
  const wick = WICKS[wickKey] || WICKS.medium;
  const burnRate = wick.rate; // oz per hour
  const burnHours = burnRate > 0 ? wax / burnRate : 0;

  return {
    burnHours,
    burnRate,
    waxWeight: wax,
    wickType: wick.label,
    chartData: [
      { name: "Wax Weight", value: +wax.toFixed(1) },
      { name: "Burn Rate (oz/hr)", value: burnRate },
      { name: "Est. Burn Hours", value: +burnHours.toFixed(1) },
    ],
    breakdown: [
      { label: "Wax Weight", value: `${wax} oz` },
      { label: "Wick Type", value: wick.label },
      { label: "Burn Rate", value: `${burnRate} oz/hour` },
      { label: "Estimated Burn Time", value: `${burnHours.toFixed(1)} hours` },
      { label: "Approx. Sessions (2h each)", value: `${Math.floor(burnHours / 2)}` },
      { label: "Approx. Sessions (3h each)", value: `${Math.floor(burnHours / 3)}` },
    ],
    summaryStats: [
      { label: "Burn Time", value: `${burnHours.toFixed(1)} hrs` },
      { label: "Burn Rate", value: `${burnRate} oz/hr` },
      { label: "Wax Weight", value: `${wax} oz` },
      { label: "Days (2h/day)", value: `${Math.floor(burnHours / 2)}` },
      { label: "Cost/hr ($20 candle)", value: `$${(20 / Math.max(1, burnHours)).toFixed(2)}` },
      { label: "Wick Type", value: wick.label },
    ],
  };
}

const DEFAULTS = { wax: "8", wick: "medium" };

export default function CandleBurnTimeCalculator() {
  const [wax, setWax] = useState(DEFAULTS.wax);
  const [wick, setWick] = useState(DEFAULTS.wick);
  const [result, setResult] = useState<CandleResult>(() => calcCandle(8, "medium"));

  const calculate = () => setResult(calcCandle(parseFloat(wax) || 0, wick));
  const reset = () => { setWax(DEFAULTS.wax); setWick(DEFAULTS.wick); setResult(calcCandle(8, "medium")); };
  useEffect(() => { setResult(calcCandle(8, "medium")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "How long do candles typically burn?", answer: "Most container candles burn 1 hour per ounce of wax — an 8 oz candle lasts about 8 hours, and a 12 oz candle about 12 hours. Actual time varies with wick size, wax type, and how the candle is burned." },
    { question: "How is burn time calculated?", answer: "Burn time = wax weight ÷ burn rate. Burn rate depends mainly on wick size: a small wick consumes about 3.5 oz/hour, a medium 5 oz/hour, and a large 7 oz/hour. Bigger flames melt more wax per hour, so they burn faster." },
    { question: "How can I make my candle last longer?", answer: "Trim the wick to 1/4 inch before each burn, avoid drafts that create tall flames, and burn in 2–3 hour sessions so the wax pool reaches the edges without overheating. The first burn should be long enough to melt the full top surface to prevent tunneling." },
    { question: "Why does wick size matter?", answer: "A wick that is too small creates a small flame that tunnels down the center and wastes wax. A wick that is too large burns too hot, melting wax faster and shortening burn time. Matching wick size to the candle diameter is the single biggest factor in burn time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Candle Burn Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Candle Burn Time Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Wax Weight</label>
              <div className={inp}><input type="number" value={wax} onChange={e => setWax(e.target.value)} className={ci} min={0} step={0.5} /><span className="pr-3 text-muted-foreground text-sm">oz</span></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Wick Size</label>
              <select value={wick} onChange={e => setWick(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                {Object.entries(WICKS).map(([key, w]) => <option key={key} value={key}>{w.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Burn Time</div>
              <div className="text-4xl font-extrabold text-primary">{result.burnHours.toFixed(1)} <span className="text-2xl">hours</span></div>
              <div className="text-sm text-muted-foreground mt-1">{result.waxWeight} oz of wax at {result.burnRate} oz/hour</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Wax Weight", `${result.waxWeight} oz`], ["Burn Rate", `${result.burnRate} oz/hr`], ["2h Sessions", `${Math.floor(result.burnHours / 2)}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Burn Time Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Candle Profile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, "Value"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={55}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 2 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.4)"} />)}
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Long Will Your Candle Burn?</h2>
            <p>A <strong>candle burn time calculator</strong> estimates how many hours a candle will last by dividing its wax weight by its burn rate. Burn rate is governed mostly by wick size — the larger the flame, the more wax it consumes each hour. The same 8 oz candle can last 2 hours longer with a small wick than with a large one.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>Burn Time = Wax Weight ÷ Burn Rate. Wax weight is what the container or label states; burn rate is the wick's hourly wax consumption. This calculator uses typical rates of 3.5–9.5 oz/hour for small through extra-large wicks and shows the resulting hours plus realistic session counts.</p>
            <h2 className="text-2xl font-bold mb-3">Getting the Most From Your Candle</h2>
            <p>Trim the wick to 1/4 inch before each lighting, burn for 2–3 hour sessions, and keep the candle away from drafts. The first burn should melt the entire top surface — that prevents the tunneling that wastes wax and shortens a candle's usable life far more than any rate calculation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/candle-burn-time-calculator" />
          <PopularCalculators exclude="/calculator/candle-burn-time-calculator" />
        </div>
      </div>
    </>
  );
}
