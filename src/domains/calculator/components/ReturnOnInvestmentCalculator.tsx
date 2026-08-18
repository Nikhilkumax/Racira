"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RoiInput {
  investment: number;
  finalValue: number;
  holdingYears: number;
}

interface RoiResult {
  profit: number;
  roi: number;
  annualizedRoi: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRoi(input: RoiInput): RoiResult {
  const profit = input.finalValue - input.investment;
  const roi = input.investment > 0 ? (profit / input.investment) * 100 : 0;
  const annualizedRoi = input.holdingYears > 0 && input.investment > 0 && input.finalValue > 0 ? (Math.pow(input.finalValue / input.investment, 1 / input.holdingYears) - 1) * 100 : roi;

  const chartData = [
    { name: "Initial Investment", value: Number(input.investment.toFixed(0)), fill: "#94a3b8" },
    { name: "Final Value", value: Number(input.finalValue.toFixed(0)), fill: "hsl(var(--primary))" },
    { name: "Profit", value: Number(Math.max(0, profit).toFixed(0)), fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Initial Investment", value: `$${input.investment.toLocaleString()}` },
    { label: "Final Value", value: `$${input.finalValue.toLocaleString()}` },
    { label: "Holding Period", value: `${input.holdingYears} years` },
    { label: "Total Profit / Loss", value: `${profit >= 0 ? "+" : "−"}$${Math.abs(profit).toLocaleString()}` },
    { label: "Return on Investment (ROI)", value: `${roi >= 0 ? "+" : "−"}${Math.abs(roi).toFixed(1)}%` },
    { label: "Annualized ROI", value: `${annualizedRoi >= 0 ? "+" : "−"}${Math.abs(annualizedRoi).toFixed(1)}%/yr` },
    { label: "Money Multiplier", value: `${(input.finalValue / Math.max(1, input.investment)).toFixed(2)}×` },
  ];

  const summaryStats = [
    { label: "ROI", value: `${roi >= 0 ? "+" : "−"}${Math.abs(roi).toFixed(1)}%` },
    { label: "Annualized", value: `${annualizedRoi >= 0 ? "+" : "−"}${Math.abs(annualizedRoi).toFixed(1)}%/yr` },
    { label: "Profit", value: `${profit >= 0 ? "+" : "−"}$${Math.abs(profit).toLocaleString()}` },
    { label: "Initial Investment", value: `$${input.investment.toLocaleString()}` },
    { label: "Final Value", value: `$${input.finalValue.toLocaleString()}` },
    { label: "Multiplier", value: `${(input.finalValue / Math.max(1, input.investment)).toFixed(2)}×` },
  ];

  return { profit, roi, annualizedRoi, chartData, breakdown, summaryStats };
}

const DEFAULTS: RoiInput = { investment: 5000, finalValue: 7500, holdingYears: 3 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ReturnOnInvestmentCalculator() {
  const [investment, setInvestment] = useState(String(DEFAULTS.investment));
  const [finalValue, setFinalValue] = useState(String(DEFAULTS.finalValue));
  const [years, setYears] = useState(String(DEFAULTS.holdingYears));
  const [result, setResult] = useState<RoiResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcRoi({ investment: parse(investment, DEFAULTS.investment), finalValue: parse(finalValue, DEFAULTS.finalValue), holdingYears: Math.max(0.1, parse(years, DEFAULTS.holdingYears)) }));
  const reset = () => {
    setInvestment(String(DEFAULTS.investment));
    setFinalValue(String(DEFAULTS.finalValue));
    setYears(String(DEFAULTS.holdingYears));
    setResult(calcRoi(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcRoi(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is ROI?", answer: "Return on Investment (ROI) = (Final Value − Investment) ÷ Investment × 100. It measures the gain or loss generated on an investment relative to its cost. A $7,500 outcome on a $5,000 investment is a 50% ROI — a $2,500 profit." },
    { question: "Why use annualized ROI?", answer: "Annualized ROI normalizes returns to a yearly rate so investments with different holding periods can be compared. A 50% total gain over 3 years is about 14.5% per year. The formula is (Final ÷ Initial)^(1/years) − 1." },
    { question: "What is a good ROI?", answer: "Benchmark against alternatives: the S&P 500 averages roughly 10% per year before inflation, real estate 8–12%, and high-yield savings 4–5%. A good ROI exceeds the return you'd earn in a comparable-risk alternative — and always beats the inflation rate in real terms." },
    { question: "What does ROI not tell you?", answer: "ROI ignores risk, timing of cash flows, taxes, and opportunity cost. A 50% ROI from a leveraged, volatile asset is riskier than the same ROI from a diversified portfolio. For cash-flowing investments, pair ROI with IRR, payback period, and risk assessment." },
    { question: "How is ROI different from profit?", answer: "Profit is the absolute dollar gain; ROI is that gain expressed as a percentage of the money invested. $2,500 profit is meaningful on a $5,000 investment (50% ROI) but trivial on $500,000 (0.5% ROI). Always consider both." },
    { question: "Does ROI account for holding period?", answer: "The basic ROI doesn't — that's why annualized ROI matters. A 50% return earned in 6 months is exceptional; the same return over 10 years is mediocre. Use the annualized figure when comparing investments held for different lengths of time." },
  ];

  const profitColor = result ? (result.profit >= 0 ? "text-emerald-600" : "text-red-500") : "";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Return on Investment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Return on Investment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Initial Investment</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={investment} onChange={(e) => setInvestment(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Final Value</label>
                <div className={inp}><span className="pl-3 text-muted-foreground">$</span><input type="number" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Holding Period</label>
                <div className={inp}><input type="number" value={years} onChange={(e) => setYears(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yrs</span></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Return on Investment</div>
                  <div className={`text-4xl font-extrabold tracking-tight ${profitColor}`}>{result.roi >= 0 ? "+" : "−"}{Math.abs(result.roi).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Profit: {result.profit >= 0 ? "+" : "−"}$ {Math.abs(result.profit).toLocaleString()} · Annualized: {result.annualizedRoi >= 0 ? "+" : "−"}{Math.abs(result.annualizedRoi).toFixed(1)}%/yr</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Profit", `${result.profit >= 0 ? "+" : "−"}$${Math.abs(result.profit).toLocaleString()}`], ["Annualized ROI", `${result.annualizedRoi >= 0 ? "+" : "−"}${Math.abs(result.annualizedRoi).toFixed(1)}%`], ["Multiplier", `${result.breakdown[6].value}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Investment Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Investment Values</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
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
            <h2 className="text-2xl font-bold mb-3">Measuring Investment Performance</h2>
            <p>ROI is the most widely used measure of investment performance because it's simple and universal: the profit earned divided by the money at risk. It works for stocks, real estate, businesses, and marketing campaigns alike. The limitation is that raw ROI ignores time — which is exactly why annualized ROI completes the picture.</p>
            <h2 className="text-2xl font-bold mb-3">ROI vs Annualized ROI</h2>
            <p>Total ROI tells you the overall gain; annualized ROI tells you the compound growth rate per year. For a $5,000 investment that becomes $7,500 in 3 years, total ROI is 50% but the annualized return is about 14.5% — the figure you compare against the stock market's long-run ~10% average.</p>
            <h2 className="text-2xl font-bold mb-3">Making Better Decisions</h2>
            <p>Use ROI to screen opportunities, then dig deeper: check risk, liquidity, taxes, and how the return compares to your next-best alternative. A strong ROI on an illiquid, risky asset may be worse than a modest ROI you can actually realize. Consistency and risk-adjusted return beat headline ROI every time.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/return-on-investment-roi-calculator" />
          <PopularCalculators exclude="/calculator/return-on-investment-roi-calculator" />
        </div>
      </div>
    </>
  );
}
