"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PeResult {
  pe: number;
  earningsYield: number;
  peg: number | null;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 2): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcPe(price: number, eps: number, growth: number | null): PeResult {
  const pe = eps > 0 ? price / eps : Infinity;
  const earningsYield = pe === Infinity ? 0 : (1 / pe) * 100;
  const peg = growth !== null && growth > 0 && pe !== Infinity ? pe / growth : null;
  const breakdown = [
    { label: "Share Price", value: `$${fmt(price)}` },
    { label: "EPS (TTM)", value: `$${fmt(eps)}` },
    { label: "P/E Ratio", value: pe === Infinity ? "No positive earnings" : `${fmt(pe)}×` },
    { label: "Earnings Yield", value: `${fmt(earningsYield)}%` },
    ...(peg !== null ? [
      { label: "Earnings Growth (%)", value: `${fmt(growth!)}%` },
      { label: "PEG Ratio", value: `${fmt(peg)}` },
    ] : []),
  ];
  const summaryStats = [
    { label: "P/E", value: pe === Infinity ? "—" : `${fmt(pe)}×` },
    { label: "Earnings Yield", value: `${fmt(earningsYield)}%` },
    ...(peg !== null ? [{ label: "PEG", value: `${fmt(peg)}` }] : []),
    { label: "Price", value: `$${fmt(price)}` },
    { label: "EPS", value: `$${fmt(eps)}` },
  ];
  const chartData = [
    { name: "P/E Ratio", value: pe === Infinity ? 0 : Number(pe.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Earnings Yield %", value: Number(earningsYield.toFixed(1)), fill: "#f59e0b" },
  ];
  return { pe, earningsYield, peg, breakdown, summaryStats, chartData };
}

const DEFAULTS = { price: "150", eps: "6.25", growth: "12" };

export default function PERatioCalculator() {
  const [price, setPrice] = useState(DEFAULTS.price);
  const [eps, setEps] = useState(DEFAULTS.eps);
  const [growth, setGrowth] = useState(DEFAULTS.growth);
  const [result, setResult] = useState<PeResult | null>(null);

  const p = parseFloat(price);
  const e = parseFloat(eps);
  const g = growth.trim() === "" ? null : parseFloat(growth);
  const errs: string[] = [];
  if (!p || p <= 0) errs.push("Share price must be greater than 0.");
  if (isNaN(e)) errs.push("EPS is required.");
  if (g !== null && isNaN(g)) errs.push("Growth must be a number or blank.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcPe(p, e, g)); };
  const reset = () => {
    setPrice(DEFAULTS.price); setEps(DEFAULTS.eps); setGrowth(DEFAULTS.growth);
    setResult(calcPe(150, 6.25, 12));
  };
  useEffect(() => { setResult(calcPe(150, 6.25, 12)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is the P/E ratio?", answer: "Price divided by earnings per share — how many years of current earnings you pay for a share, or the price of $1 of earnings. A P/E of 24 means investors pay $24 for each $1 of annual profit." },
    { question: "What is a good P/E?", answer: "It depends on the industry and growth: mature banks trade near 10–15×, fast-growing tech well above 30×. Compare a company's P/E to its own history and its sector, not to an arbitrary cutoff." },
    { question: "What is the PEG ratio?", answer: "P/E divided by expected earnings growth. A PEG near 1 is considered fair — the multiple matches the growth rate. PEG below 1 suggests the stock may be cheap relative to growth; far above 1, expensive. It assumes the growth forecast is right." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "P/E Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">P/E Ratio Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Share Price ($)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inp} placeholder="150" />
              </div>
              <div>
                <label className={lbl}>EPS (TTM, $)</label>
                <input type="number" value={eps} onChange={e => setEps(e.target.value)} className={inp} placeholder="6.25" />
              </div>
              <div>
                <label className={lbl}>Growth % (optional)</label>
                <input type="number" value={growth} onChange={e => setGrowth(e.target.value)} className={inp} placeholder="12" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">EPS = earnings per share over the trailing twelve months. Growth feeds the PEG ratio.</p>
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
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">P/E Ratio</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.pe === Infinity ? "—" : `${fmt(result.pe)}×`}</div>
                <div className="text-sm text-muted-foreground mt-1">Earnings yield {fmt(result.earningsYield)}%{result.peg !== null ? ` · PEG ${fmt(result.peg)}` : ""}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Earnings Yield", `${fmt(result.earningsYield)}%`], ["PEG", result.peg !== null ? `${fmt(result.peg)}` : "—"], ["P/E", result.pe === Infinity ? "—" : `${fmt(result.pe)}×`]].map(([l, v], i) => (
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
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 2 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 2 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Valuation Metrics</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">P/E and earnings yield are reciprocals — 24× means a 4.2% earnings yield</p>
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
            <h2 className="text-2xl font-bold mb-3">What the Market Pays for Earnings</h2>
            <p>The <strong>price-to-earnings ratio</strong> is the most quoted valuation metric in finance: how many dollars of market price each dollar of annual earnings commands. This <strong>P/E ratio calculator</strong> computes it, plus the earnings yield and PEG ratio.</p>
            <h2 className="text-2xl font-bold mb-3">The Three Metrics</h2>
            <p>P/E = price ÷ EPS. Its reciprocal, earnings yield = EPS ÷ price, compares the stock to bond yields. Add expected growth and PEG = P/E ÷ growth answers the follow-up: is the multiple justified by the growth rate? PEG near 1 is the classic fair-value mark.</p>
            <h2 className="text-2xl font-bold mb-3">Reading It Honestly</h2>
            <p>A high P/E says the market expects strong future growth; a low one says the opposite — or that earnings are cyclical. Always compare within a sector and over time. The calculator gives you the numbers; context does the rest.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pe-ratio-calculator" />
          <PopularCalculators exclude="/calculator/pe-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
