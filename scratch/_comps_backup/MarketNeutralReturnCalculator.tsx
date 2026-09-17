"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MnResult {
  hedgeRatio: number;
  strategyReturn: number;
  strategyBeta: number;
  alpha: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcMn(longR: number, shortR: number, longBeta: number, shortBeta: number, rf: number, marketR: number): MnResult {
  const hedgeRatio = shortBeta > 0 ? longBeta / shortBeta : 0;
  const strategyReturn = longR - hedgeRatio * shortR;
  const strategyBeta = longBeta - hedgeRatio * shortBeta;
  const alpha = strategyReturn - rf;
  const breakdown = [
    { label: "Long Portfolio Return", value: `${fmt(longR)}%` },
    { label: "Short Portfolio Return", value: `${fmt(shortR)}%` },
    { label: "Long Beta (βₗ)", value: `${fmt(longBeta, 3)}` },
    { label: "Short Beta (βₛ)", value: `${fmt(shortBeta, 3)}` },
    { label: "Hedge Ratio (βₗ / βₛ)", value: `${fmt(hedgeRatio, 3)}` },
    { label: "Strategy Return", value: `${fmt(strategyReturn)}%` },
    { label: "Strategy Beta", value: `${fmt(strategyBeta, 3)}` },
    { label: "Risk-Free Rate", value: `${fmt(rf)}%` },
    { label: "Alpha (strategy − rf)", value: `${fmt(alpha)}%` },
  ];
  const summaryStats = [
    { label: "Strategy Return", value: `${fmt(strategyReturn)}%` },
    { label: "Strategy Beta", value: `${fmt(strategyBeta, 3)}` },
    { label: "Hedge Ratio", value: `${fmt(hedgeRatio, 3)}` },
    { label: "Alpha vs Risk-Free", value: `${fmt(alpha)}%` },
    { label: "Long / Short Return", value: `${fmt(longR)}% / ${fmt(shortR)}%` },
  ];
  const chartData = [
    { name: "Long", value: Number(longR.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Short", value: Number(shortR.toFixed(2)), fill: "#f59e0b" },
    { name: "Strategy", value: Number(strategyReturn.toFixed(2)), fill: "#10b981" },
  ];
  return { hedgeRatio, strategyReturn, strategyBeta, alpha, breakdown, summaryStats, chartData };
}

const DEFAULTS = { longR: "9.2", shortR: "4.1", longBeta: "1.1", shortBeta: "1.05", rf: "4.0", marketR: "7.0" };

export default function MarketNeutralReturnCalculator() {
  const [longR, setLongR] = useState(DEFAULTS.longR);
  const [shortR, setShortR] = useState(DEFAULTS.shortR);
  const [longBeta, setLongBeta] = useState(DEFAULTS.longBeta);
  const [shortBeta, setShortBeta] = useState(DEFAULTS.shortBeta);
  const [rf, setRf] = useState(DEFAULTS.rf);
  const [marketR, setMarketR] = useState(DEFAULTS.marketR);
  const [result, setResult] = useState<MnResult | null>(null);

  const errs: string[] = [];
  const l = parseFloat(longR), s = parseFloat(shortR), lb = parseFloat(longBeta), sb = parseFloat(shortBeta), r = parseFloat(rf), m = parseFloat(marketR);
  if (isNaN(l)) errs.push("Long portfolio return is required.");
  if (isNaN(s)) errs.push("Short portfolio return is required.");
  if (!lb || lb <= 0) errs.push("Long beta must be greater than 0.");
  if (!sb || sb <= 0) errs.push("Short beta must be greater than 0.");
  if (isNaN(r)) errs.push("Risk-free rate is required.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcMn(l, s, lb, sb, r, m)); };
  const reset = () => {
    setLongR(DEFAULTS.longR); setShortR(DEFAULTS.shortR); setLongBeta(DEFAULTS.longBeta); setShortBeta(DEFAULTS.shortBeta); setRf(DEFAULTS.rf); setMarketR(DEFAULTS.marketR);
    setResult(calcMn(9.2, 4.1, 1.1, 1.05, 4.0, 7.0));
  };
  useEffect(() => { setResult(calcMn(9.2, 4.1, 1.1, 1.05, 4.0, 7.0)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is a market-neutral strategy?", answer: "A portfolio that pairs a long position with a short position sized so the combined beta is (near) zero. Because market swings push both legs in offsetting directions, the strategy's return depends on the spread between the two positions — not on the direction of the market." },
    { question: "How is the hedge ratio computed?", answer: "To neutralize beta, short enough dollars so βₗ × long capital = βₛ × short capital. The ratio βₗ/βₛ tells you how much short exposure offsets one dollar of long exposure. The strategy return is then long return minus the ratio times short return." },
    { question: "What is alpha here?", answer: "Once market exposure is hedged away, the strategy return is compared with the risk-free rate — the extra return (positive or negative) is the manager's alpha. A market-neutral fund is essentially a bet on that spread, not on the market." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Market Neutral Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Market Neutral Return Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Long Portfolio Return (%)</label>
                <input type="number" value={longR} onChange={e => setLongR(e.target.value)} className={inp} placeholder="9.2" />
              </div>
              <div>
                <label className={lbl}>Short Portfolio Return (%)</label>
                <input type="number" value={shortR} onChange={e => setShortR(e.target.value)} className={inp} placeholder="4.1" />
              </div>
              <div>
                <label className={lbl}>Long Beta (βₗ)</label>
                <input type="number" step="0.01" value={longBeta} onChange={e => setLongBeta(e.target.value)} className={inp} placeholder="1.1" />
              </div>
              <div>
                <label className={lbl}>Short Beta (βₛ)</label>
                <input type="number" step="0.01" value={shortBeta} onChange={e => setShortBeta(e.target.value)} className={inp} placeholder="1.05" />
              </div>
              <div>
                <label className={lbl}>Risk-Free Rate (%)</label>
                <input type="number" value={rf} onChange={e => setRf(e.target.value)} className={inp} placeholder="4.0" />
              </div>
              <div>
                <label className={lbl}>Market Return (%)</label>
                <input type="number" value={marketR} onChange={e => setMarketR(e.target.value)} className={inp} placeholder="7.0" />
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Market Neutral Return</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.strategyReturn)}%</div>
                <div className="text-sm text-muted-foreground mt-1">β = {fmt(result.strategyBeta, 3)} · alpha vs risk-free: {fmt(result.alpha)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Hedge Ratio", fmt(result.hedgeRatio, 3)], ["Strategy Beta", fmt(result.strategyBeta, 3)], ["Alpha", `${fmt(result.alpha)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Long vs Short vs Strategy</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v, 2) + "%", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The strategy harvests the spread between the legs, not the market</p>
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
            <h2 className="text-2xl font-bold mb-3">Hedging Away the Market</h2>
            <p>A <strong>market neutral return calculator</strong> models the classic long/short trade: buy a high-conviction long book, sell short a comparable book, and size the short leg so the combined portfolio's beta collapses toward zero. What remains is pure stock-selection spread.</p>
            <h2 className="text-2xl font-bold mb-3">The Hedge Ratio</h2>
            <p>If the long book has a beta of 1.1 and the short book 1.05, you need 1.1/1.05 ≈ 1.048 dollars of short exposure per dollar of long exposure to neutralize market risk. The strategy return is then the long return minus the hedge-ratio-weighted short return.</p>
            <h2 className="text-2xl font-bold mb-3">Alpha and Interpretation</h2>
            <p>With beta near zero, the strategy's return should be compared against the risk-free rate rather than the market. The gap is alpha: if it is consistently positive, the manager is adding value through security selection rather than riding a bull market.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/market-neutral-return-calculator" />
          <PopularCalculators exclude="/calculator/market-neutral-return-calculator" />
        </div>
      </div>
    </>
  );
}
