"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface SharpeInput {
  portfolioReturn: number;
  riskFreeRate: number;
  volatility: number;
}

interface SharpeResult {
  sharpe: number;
  excessReturn: number;
  rating: string;
  ratingColor: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcSharpe(input: SharpeInput): SharpeResult {
  const excessReturn = input.portfolioReturn - input.riskFreeRate;
  const sharpe = input.volatility > 0 ? excessReturn / input.volatility : 0;
  const rating = sharpe >= 3 ? "Excellent" : sharpe >= 2 ? "Very Good" : sharpe >= 1 ? "Good" : sharpe >= 0.5 ? "Acceptable" : "Poor";
  const ratingColor = sharpe >= 2 ? "text-emerald-600" : sharpe >= 1 ? "text-primary" : sharpe >= 0.5 ? "text-amber-500" : "text-red-500";

  const chartData = [
    { name: "Portfolio Return", value: Number(input.portfolioReturn.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Risk-Free Rate", value: Number(input.riskFreeRate.toFixed(1)), fill: "#94a3b8" },
    { name: "Excess Return", value: Number(excessReturn.toFixed(1)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Portfolio Return", value: `${input.portfolioReturn.toFixed(1)}%` },
    { label: "Risk-Free Rate", value: `${input.riskFreeRate.toFixed(1)}%` },
    { label: "Excess Return (over risk-free)", value: `${excessReturn.toFixed(1)}%` },
    { label: "Portfolio Volatility (Std Dev)", value: `${input.volatility.toFixed(1)}%` },
    { label: "Sharpe Ratio", value: sharpe.toFixed(2) },
    { label: "Rating", value: rating },
    { label: "Risk Premium per Unit", value: `${sharpe.toFixed(2)}% per % vol` },
  ];

  const summaryStats = [
    { label: "Sharpe Ratio", value: sharpe.toFixed(2) },
    { label: "Rating", value: rating },
    { label: "Excess Return", value: `${excessReturn.toFixed(1)}%` },
    { label: "Volatility", value: `${input.volatility.toFixed(1)}%` },
    { label: "Portfolio Return", value: `${input.portfolioReturn.toFixed(1)}%` },
    { label: "Risk-Free Rate", value: `${input.riskFreeRate.toFixed(1)}%` },
  ];

  return { sharpe, excessReturn, rating, ratingColor, chartData, breakdown, summaryStats };
}

const DEFAULTS: SharpeInput = { portfolioReturn: 12, riskFreeRate: 4.5, volatility: 15 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SharpeRatioCalculator() {
  const [portfolioReturn, setPortfolioReturn] = useState(String(DEFAULTS.portfolioReturn));
  const [riskFreeRate, setRiskFreeRate] = useState(String(DEFAULTS.riskFreeRate));
  const [volatility, setVolatility] = useState(String(DEFAULTS.volatility));
  const [result, setResult] = useState<SharpeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSharpe({ portfolioReturn: parse(portfolioReturn, DEFAULTS.portfolioReturn), riskFreeRate: parse(riskFreeRate, DEFAULTS.riskFreeRate), volatility: Math.max(0.01, parse(volatility, DEFAULTS.volatility)) }));
  const reset = () => {
    setPortfolioReturn(String(DEFAULTS.portfolioReturn));
    setRiskFreeRate(String(DEFAULTS.riskFreeRate));
    setVolatility(String(DEFAULTS.volatility));
    setResult(calcSharpe(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSharpe(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the Sharpe ratio?", answer: "The Sharpe ratio measures risk-adjusted return: (Portfolio Return − Risk-Free Rate) ÷ Portfolio Volatility. It answers the question 'how much return am I getting for each unit of risk I take?' Developed by Nobel laureate William Sharpe in 1966, it remains the standard for comparing investment performance." },
    { question: "What is a good Sharpe ratio?", answer: "Above 1.0 is considered good, above 2.0 very good, and above 3.0 excellent — though 3.0+ is rare and often signals data issues or leverage. Below 0.5 is poor: the investment is barely compensating you for its risk. Hedge funds typically target 1.5–2.0; broad index funds run 0.5–1.0." },
    { question: "How is volatility measured?", answer: "Volatility is the annualized standard deviation of returns — how much returns bounce around the average. A 15% volatility means roughly two-thirds of annual returns fall within ±15% of the average. More volatility means more uncertainty, which is why the Sharpe ratio divides excess return by it." },
    { question: "What is the risk-free rate?", answer: "The risk-free rate is the return on an investment with no default risk — typically the 10-year US Treasury yield or the yield on short-term T-bills. It represents the baseline return you can get without taking any risk. The Sharpe ratio measures only the return earned above this baseline." },
    { question: "Can the Sharpe ratio be negative?", answer: "Yes. A negative Sharpe ratio means the portfolio underperformed the risk-free rate for its level of volatility — you'd have been better off in Treasuries. Negative Sharpe ratios are common during bear markets and for cash-heavy strategies; they signal that risk isn't being rewarded." },
    { question: "What are its limitations?", answer: "The Sharpe ratio assumes returns are normally distributed, punishes upside and downside volatility equally, and can be gamed with smoothing strategies. It works best comparing similar strategies over the same period. Use it alongside drawdown and Sortino ratio for a fuller picture." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Sharpe Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Sharpe Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Portfolio Return</label>
                <div className={inp}><input type="number" value={portfolioReturn} onChange={(e) => setPortfolioReturn(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Risk-Free Rate</label>
                <div className={inp}><input type="number" value={riskFreeRate} onChange={(e) => setRiskFreeRate(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Portfolio Volatility (Std Dev)</label>
                <div className={inp}><input type="number" value={volatility} onChange={(e) => setVolatility(e.target.value)} step={0.1} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Sharpe Ratio</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${result.ratingColor}`}>{result.sharpe.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Rating: {result.rating} · Excess return: {result.excessReturn.toFixed(1)}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Excess Return", `${result.excessReturn.toFixed(1)}%`], ["Volatility", result.breakdown[3].value], ["Rating", result.rating]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Sharpe Analysis</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Return Components (%)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Measuring Risk-Adjusted Return</h2>
            <p>A 12% return means little without knowing the risk behind it. The Sharpe ratio divides the return earned above the risk-free rate by the portfolio's volatility, expressing performance in units of risk. A 12% return with 8% volatility (Sharpe 0.94) is far more impressive than the same return with 25% volatility (Sharpe 0.30).</p>
            <h2 className="text-2xl font-bold mb-3">Interpreting the Numbers</h2>
            <p>Sharpe above 1.0 clears the bar most institutional investors set. Above 2.0 is exceptional — the portfolio earns two full units of excess return for every unit of volatility. Below 0.5, the strategy may not be worth its risk; below zero, Treasuries would have served you better.</p>
            <h2 className="text-2xl font-bold mb-3">Using It in Practice</h2>
            <p>Compare candidates on the same measurement period and frequency. Monthly data smooths noise; daily data inflates Sharpe ratios. Combine the Sharpe ratio with maximum drawdown and Sortino ratio — which ignores upside volatility — before committing capital to any strategy.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sharpe-ratio-calculator" />
          <PopularCalculators exclude="/calculator/sharpe-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
