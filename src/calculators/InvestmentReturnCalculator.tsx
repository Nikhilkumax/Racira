"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface InvestmentReturnResult {
  finalValue: number;
  totalContributions: number;
  totalGains: number;
  cagr: number;
  inflationAdjusted: number;
  returnMultiple: number;
  pieData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcInvestmentReturn(initialInvestment: number, annualContribution: number, rate: number, years: number, inflationRate: number): InvestmentReturnResult {
  const r = rate / 100;
  const rI = inflationRate / 100;
  let balance = initialInvestment;
  let totalContribs = initialInvestment;

  for (let y = 0; y < years; y++) {
    balance = balance * (1 + r) + annualContribution;
    if (y > 0) totalContribs += annualContribution;
  }

  const finalValue = balance;
  const totalGains = finalValue - totalContribs;
  const cagr = totalContribs > 0 ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100 : 0;
  const inflationAdjusted = finalValue / Math.pow(1 + rI, years);
  const returnMultiple = totalContribs > 0 ? finalValue / totalContribs : 1;

  const pieData = [
    { name: "Contributions", value: Math.round(totalContribs) },
    { name: "Investment Gains", value: Math.round(totalGains) },
  ];

  const breakdown = [
    { label: "Initial Investment", value: `$${initialInvestment.toLocaleString()}` },
    { label: "Annual Contribution", value: `$${annualContribution.toLocaleString()}` },
    { label: "Annual Return Rate", value: `${rate}%` },
    { label: "Investment Period", value: `${years} years` },
    { label: "Total Contributions", value: `$${totalContribs.toLocaleString()}` },
    { label: "Investment Gains", value: `$${totalGains.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Final Portfolio Value", value: `$${finalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "CAGR", value: `${cagr.toFixed(2)}%` },
    { label: "Return Multiple", value: `${returnMultiple.toFixed(1)}x your contributions` },
    { label: `Inflation-Adjusted (${inflationRate}%)`, value: `$${inflationAdjusted.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
  ];

  const summaryStats = [
    { label: "Final Value", value: `$${finalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Total Gains", value: `$${totalGains.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "CAGR", value: `${cagr.toFixed(2)}%` },
    { label: "Return Multiple", value: `${returnMultiple.toFixed(1)}x` },
    { label: "Real Value", value: `$${inflationAdjusted.toLocaleString("en-US", { maximumFractionDigits: 0 })}` },
    { label: "Gains %", value: `${finalValue > 0 ? ((totalGains / finalValue) * 100).toFixed(1) : 0}%` },
  ];

  return { finalValue, totalContributions: totalContribs, totalGains, cagr, inflationAdjusted, returnMultiple, pieData, breakdown, summaryStats };
}

const DEFAULTS = { initial: "20000", contrib: "6000", rate: "8", years: "25", inflation: "3" };
const PIE_COLORS = ["#6366f1", "#10b981"];

export default function InvestmentReturnCalculator() {
  const [initial, setInitial] = useState(DEFAULTS.initial);
  const [contrib, setContrib] = useState(DEFAULTS.contrib);
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [years, setYears] = useState(DEFAULTS.years);
  const [inflation, setInflation] = useState(DEFAULTS.inflation);
  const [result, setResult] = useState<InvestmentReturnResult | null>(null);

  const calculate = () => setResult(calcInvestmentReturn(parseFloat(initial) || 20000, parseFloat(contrib) || 6000, parseFloat(rate) || 8, parseInt(years) || 25, parseFloat(inflation) || 3));
  const reset = () => { setInitial(DEFAULTS.initial); setContrib(DEFAULTS.contrib); setRate(DEFAULTS.rate); setYears(DEFAULTS.years); setInflation(DEFAULTS.inflation); setResult(calcInvestmentReturn(20000, 6000, 8, 25, 3)); };
  useEffect(() => { setResult(calcInvestmentReturn(20000, 6000, 8, 25, 3)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is a realistic investment return to expect?", answer: "Historical averages (US stocks, 1928–2023): S&P 500 nominal return: ~10% per year. Real (after inflation): ~7% per year. Diversified 60/40 portfolio: ~7–8% nominal. Bonds alone: 4–5%. Cash/HYSA: 4–5% (2024). For long-term financial planning, use 6–7% as a conservative real return assumption." },
    { question: "How does compound interest work?", answer: "Compound returns mean you earn returns on your returns. A $10,000 investment at 8% for 30 years grows to $100,627 — a 10x return — from just the compounding effect alone (no additional contributions). Adding regular contributions accelerates growth dramatically. The key variable is time — start investing as early as possible." },
    { question: "What is CAGR?", answer: "CAGR (Compound Annual Growth Rate) is the smoothed annual return rate that would produce your investment's growth from start to end, assuming reinvestment. It removes year-to-year volatility. CAGR allows fair comparison between different investments over different time periods. Formula: CAGR = (Ending Value / Beginning Value)^(1/n) − 1." },
    { question: "Why should I adjust for inflation?", answer: "Inflation erodes purchasing power over time. At 3% inflation, $1,000 today is worth only $412 in 30 years. Your investment return in nominal terms (e.g., 8%) minus inflation (3%) = 5% real return. Always think in real terms for long-term planning — the real purchasing power of your retirement savings matters more than the nominal number." },
    { question: "How much should I contribute annually?", answer: "General guidance: save 15% of gross income for retirement (Fidelity). Contribute at least enough to get employer 401(k) match (free money). Max IRA: $7,000 (2024). Max 401(k): $23,000 (2024). If you're behind, increase savings rate by 1% each year — behavioral research shows small, gradual increases are most sustainable." },
    { question: "What is the difference between absolute return and CAGR?", answer: "Absolute return is total return over the entire period (e.g., 300% over 20 years). CAGR is the annualized equivalent (e.g., 300% over 20 years = ~7.2% CAGR). CAGR is more useful for comparing investments because it accounts for the time dimension." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Investment Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Investment Return Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Initial Investment</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={initial} onChange={e => setInitial(e.target.value)} className={ci} /></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Annual Contribution</label><div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={contrib} onChange={e => setContrib(e.target.value)} className={ci} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-base font-medium mb-1.5 block">Annual Return Rate</label><div className={inp}><input type="number" value={rate} onChange={e => setRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
              <div><label className="text-base font-medium mb-1.5 block">Investment Period</label><div className={inp}><input type="number" value={years} onChange={e => setYears(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div></div>
            </div>
            <div><label className="text-base font-medium mb-1.5 block">Inflation Rate</label><div className={inp}><input type="number" value={inflation} onChange={e => setInflation(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div></div>
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Final Portfolio Value</div>
                <div className="text-4xl font-extrabold text-foreground tracking-tight">${result.finalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
                <div className="text-sm text-muted-foreground mt-1">Gains: ${result.totalGains.toLocaleString("en-US", { maximumFractionDigits: 0 })} · CAGR: {result.cagr.toFixed(2)}% · {result.returnMultiple.toFixed(1)}x return</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Total Gains", `$${result.totalGains.toLocaleString("en-US", { maximumFractionDigits: 0 })}`], ["CAGR", `${result.cagr.toFixed(2)}%`], ["Real Value", `$${result.inflationAdjusted.toLocaleString("en-US", { maximumFractionDigits: 0 })}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}><div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div><div className="text-base font-bold">{v}</div></div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Investment Breakdown</h3>
                <table className="w-full text-base"><tbody>{result.breakdown.map((r, i) => (<tr key={i} className={`border-b border-border/50 last:border-0 ${r.label === "Final Portfolio Value" ? "font-bold text-primary" : ""}`}><td className="py-2.5 text-muted-foreground">{r.label}</td><td className="py-2.5 text-right font-semibold">{r.value}</td></tr>))}</tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Contributions vs. Gains</h3>
                <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={result.pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>{result.pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}</Pie><Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} /><Legend /></PieChart></ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">What Is an Investment Return Calculator?</h2>
            <p>An <strong>investment return calculator</strong> projects the future value of an investment portfolio based on initial investment, annual contributions, expected return rate, and time horizon. It separates contributions from investment gains and adjusts for inflation to show the real purchasing power of your future savings.</p>
            <h2 className="text-2xl font-bold mb-3">The Power of Compound Growth</h2>
            <p>At 8% annual return, $20,000 initial plus $6,000/year for 25 years grows to approximately $580,000. Of that, only $170,000 came from contributions — the remaining $410,000 is pure compound growth. This is why time in the market matters more than timing the market.</p>
            <h2 className="text-2xl font-bold mb-3">Inflation-Adjusted Returns</h2>
            <p>A nominal return of 8% with 3% inflation produces a real return of approximately 5%. Real return = (1 + nominal) / (1 + inflation) − 1. Over 25 years, this significantly impacts purchasing power — a $580,000 nominal value may have the purchasing power of only $285,000 in today&apos;s dollars.</p>
            <h2 className="text-2xl font-bold mb-3">Portfolio Asset Allocation and Expected Returns</h2>
            <p>100% US stocks: ~10% nominal (historical). 80/20 stocks/bonds: ~8.5%. 60/40 balanced: ~7.5%. 40/60 conservative: ~6%. 100% bonds: ~4.5%. Diversification smooths volatility while preserving most of the return potential — especially important as you approach retirement age.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-return-calculator" />
          <PopularCalculators exclude="/calculator/investment-return-calculator" />
        </div>
      </div>
    </>
  );
}
