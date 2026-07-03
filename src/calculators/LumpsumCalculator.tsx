"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface LumpSumResult {
  futureValue: number;
  totalGrowth: number;
  growthPct: number;
  cagr: number;
  chartData: { year: number; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcLumpsum(principal: number, rate: number, years: number, compounding: number): LumpSumResult {
  const n = compounding;
  const futureValue = principal * Math.pow(1 + rate / 100 / n, n * years);
  const totalGrowth = futureValue - principal;
  const growthPct = principal > 0 ? (totalGrowth / principal) * 100 : 0;
  const cagr = years > 0 ? (Math.pow(futureValue / principal, 1 / years) - 1) * 100 : 0;

  const chartData: { year: number; value: number }[] = [];
  for (let y = 0; y <= years; y++) {
    chartData.push({ year: y, value: Math.round(principal * Math.pow(1 + rate / 100 / n, n * y)) });
  }

  const compoundingLabel: Record<number, string> = { 1: "Annually", 4: "Quarterly", 12: "Monthly", 365: "Daily" };

  const breakdown = [
    { label: "Principal Investment", value: `$${principal.toLocaleString()}` },
    { label: "Annual Interest Rate", value: `${rate}%` },
    { label: "Compounding Frequency", value: compoundingLabel[n] || `${n}x/year` },
    { label: "Investment Period", value: `${years} years` },
    { label: "Future Value", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Growth", value: `$${totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Growth Percentage", value: `${growthPct.toFixed(1)}%` },
    { label: "Effective Annual Rate", value: `${(Math.pow(1 + rate / 100 / n, n) - 1) * 100 > 0 ? ((Math.pow(1 + rate / 100 / n, n) - 1) * 100).toFixed(3) : rate}%` },
  ];

  const summaryStats = [
    { label: "Future Value", value: `$${futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Principal", value: `$${principal.toLocaleString()}` },
    { label: "Total Growth", value: `$${totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Growth %", value: `${growthPct.toFixed(1)}%` },
    { label: "CAGR", value: `${cagr.toFixed(2)}%` },
    { label: "Money Doubled", value: `${(72 / rate).toFixed(1)} years (Rule of 72)` },
  ];

  return { futureValue, totalGrowth, growthPct, cagr, chartData, breakdown, summaryStats };
}

const DEFAULTS = { principal: "50000", rate: "8", years: "20", compounding: "12" };

export default function LumpsumCalculator() {
  const [principal, setPrincipal] = useState(DEFAULTS.principal);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [compounding, setCompounding] = useState(DEFAULTS.compounding);
  const [result, setResult] = useState<LumpSumResult | null>(null);

  const calculate = () => setResult(calcLumpsum(parseFloat(principal) || 50000, parseFloat(rate) || 8, parseInt(years) || 20, parseInt(compounding) || 12));
  const reset = () => { setPrincipal(DEFAULTS.principal); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); setCompounding(DEFAULTS.compounding); setResult(calcLumpsum(50000, 8, 20, 12)); };
  useEffect(() => { setResult(calcLumpsum(50000, 8, 20, 12)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a lumpsum investment?", answer: "A lumpsum investment is a one-time investment of a fixed amount, as opposed to systematic investment plans (SIP) which invest smaller amounts periodically. Lumpsum investments benefit maximally from compounding because the full principal earns returns from day one. They're ideal when you have a large sum available (inheritance, bonus, asset sale proceeds)." },
    { question: "What is compound interest?", answer: "Compound interest is interest earned on both the original principal AND the accumulated interest from prior periods. Einstein reportedly called it 'the eighth wonder of the world.' The formula: A = P(1 + r/n)^(nt), where P = principal, r = annual rate, n = compounding frequency, t = time in years." },
    { question: "How does compounding frequency affect returns?", answer: "More frequent compounding = higher effective annual rate. Example at 8% nominal: Annual compounding → 8.000% effective. Quarterly → 8.243%. Monthly → 8.300%. Daily → 8.328%. The difference compounds over time, making daily compounding noticeably better than annual for long horizons." },
    { question: "What is the Rule of 72?", answer: "The Rule of 72 quickly estimates how long it takes money to double: Years to Double = 72 ÷ Annual Rate. At 8%, money doubles in ~9 years. At 6%, ~12 years. At 12%, ~6 years. It's a mental math shortcut that financial professionals use constantly." },
    { question: "What return should I expect on a lumpsum investment?", answer: "Historical averages (S&P 500, 1928–2023): Nominal ~10%/year, Real (after inflation) ~7%. Government bonds: 4–5%. Diversified 60/40 portfolio: 7–8%. Real estate: 4–6% real returns. Use 6–7% for conservative long-term planning, 8–10% for optimistic equity-heavy scenarios." },
    { question: "Lumpsum vs. SIP — which is better?", answer: "In a rising market, lumpsum outperforms SIP because more money is invested earlier. In a volatile or declining market, SIP outperforms because it averages purchase cost (rupee/dollar cost averaging). If you have a lump sum but are nervous about timing, invest 50% immediately and the remaining 50% over 6 months as a hybrid approach." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Lumpsum Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Lumpsum Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div><label className="text-base font-medium mb-1.5 block">Principal Investment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={ci} /></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Investment Period</label><div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div>
              <label className="text-base font-medium mb-1.5 block">Compounding Frequency</label>
              <div className="grid grid-cols-4 gap-2">
                {[["1", "Annual"], ["4", "Quarterly"], ["12", "Monthly"], ["365", "Daily"]].map(([v, l]) => (
                  <button key={v} onClick={() => setCompounding(v)} className={`h-10 rounded-md border text-xs font-medium transition-colors ${compounding === v ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Future Value</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.futureValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Growth: ${result.totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })} ({result.growthPct.toFixed(1)}%) · CAGR: {result.cagr.toFixed(2)}%</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Principal", `$${parseFloat(principal).toLocaleString()}`], ["Growth", `$${result.totalGrowth.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["Return", `${result.growthPct.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Investment Details</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Future Value" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Growth Projection</h3>
                <ResponsiveContainer width="100%" height={220}><AreaChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11 }} /><YAxis tick={{ fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]} /><Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">{result.summaryStats.map((s, i) => (<div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>))}</div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a Lumpsum Calculator?</h2>
            <p>A <strong>lumpsum calculator</strong> computes the future value of a one-time investment using compound interest. Unlike systematic investment plans, lumpsum investing puts your entire capital to work immediately, maximizing the period over which compounding can operate. This calculator is widely used by mutual fund investors, financial planners, and anyone with a large sum to invest — from inheritance to year-end bonuses.</p>
            <h2>The Compound Interest Formula</h2>
            <p>Future Value = P × (1 + r/n)^(n×t). Where P = principal amount, r = annual interest rate (decimal), n = number of compounding periods per year, t = time in years. The effective annual rate (EAR) = (1 + r/n)^n − 1, which accounts for intra-year compounding effects.</p>
            <h2>Understanding Your Results</h2>
            <p>The future value is what your lumpsum grows to at the end of the investment period. Total growth represents pure compound interest earned — this accelerates over time as you earn interest on interest. The CAGR (Compound Annual Growth Rate) shows the equivalent annual return that would produce the same result.</p>
            <h2>Compounding Frequency Impact</h2>
            <p>Daily compounding outperforms monthly, which outperforms annual. At 8% for 20 years on $50,000: Annual = $233,048. Monthly = $246,600. Daily = $247,589. The difference grows with higher rates and longer time horizons. High-yield savings accounts and money market funds typically compound daily.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lumpsum-calculator" />
          <PopularCalculators exclude="/calculator/lumpsum-calculator" />
        </div>
      </div>
    </>
  );
}
