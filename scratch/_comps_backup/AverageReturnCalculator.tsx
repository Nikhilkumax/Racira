"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface AvgReturnInput {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
}

interface AvgReturnResult {
  arithmeticMean: number;
  geometricMean: number;
  volatility: number;
  difference: number;
  endingValue: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcAvgReturn(input: AvgReturnInput): AvgReturnResult {
  const returns = [input.year1, input.year2, input.year3, input.year4, input.year5];
  const arithmeticMean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const growthFactor = returns.reduce((acc, r) => acc * (1 + r / 100), 1);
  const geometricMean = (Math.pow(growthFactor, 1 / returns.length) - 1) * 100;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - arithmeticMean, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  const difference = arithmeticMean - geometricMean;
  const endingValue = 1000 * growthFactor;

  const chartData = returns.map((r, i) => ({ name: `Year ${i + 1}`, value: Number(r.toFixed(1)), fill: r >= 0 ? "#10b981" : "#ef4444" }));

  const breakdown = [
    { label: "Year 1 Return", value: `${input.year1.toFixed(1)}%` },
    { label: "Year 2 Return", value: `${input.year2.toFixed(1)}%` },
    { label: "Year 3 Return", value: `${input.year3.toFixed(1)}%` },
    { label: "Year 4 Return", value: `${input.year4.toFixed(1)}%` },
    { label: "Year 5 Return", value: `${input.year5.toFixed(1)}%` },
    { label: "Arithmetic Mean Return", value: `${arithmeticMean.toFixed(2)}%` },
    { label: "Geometric Mean Return", value: `${geometricMean.toFixed(2)}%` },
    { label: "Volatility (Std Dev)", value: `${volatility.toFixed(1)}%` },
    { label: "$1,000 Ending Value", value: `$${endingValue.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Arithmetic Mean", value: `${arithmeticMean.toFixed(2)}%` },
    { label: "Geometric Mean", value: `${geometricMean.toFixed(2)}%` },
    { label: "Difference", value: `${difference.toFixed(2)}%` },
    { label: "Volatility", value: `${volatility.toFixed(1)}%` },
    { label: "$1,000 →", value: `$${endingValue.toFixed(2)}` },
    { label: "5-Year Total Return", value: `${(growthFactor - 1) * 100}%` },
  ];

  return { arithmeticMean, geometricMean, volatility, difference, endingValue, chartData, breakdown, summaryStats };
}

const DEFAULTS: AvgReturnInput = { year1: 10, year2: -5, year3: 15, year4: 8, year5: 12 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function AverageReturnCalculator() {
  const [y1, setY1] = useState(String(DEFAULTS.year1));
  const [y2, setY2] = useState(String(DEFAULTS.year2));
  const [y3, setY3] = useState(String(DEFAULTS.year3));
  const [y4, setY4] = useState(String(DEFAULTS.year4));
  const [y5, setY5] = useState(String(DEFAULTS.year5));
  const [result, setResult] = useState<AvgReturnResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcAvgReturn({ year1: parse(y1, DEFAULTS.year1), year2: parse(y2, DEFAULTS.year2), year3: parse(y3, DEFAULTS.year3), year4: parse(y4, DEFAULTS.year4), year5: parse(y5, DEFAULTS.year5) }));
  const reset = () => {
    setY1(String(DEFAULTS.year1));
    setY2(String(DEFAULTS.year2));
    setY3(String(DEFAULTS.year3));
    setY4(String(DEFAULTS.year4));
    setY5(String(DEFAULTS.year5));
    setResult(calcAvgReturn(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcAvgReturn(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the difference between arithmetic and geometric mean?", answer: "The arithmetic mean is the simple average of annual returns — useful for describing the typical year. The geometric mean is the compound annual growth rate (CAGR) that actually grew the investment. Arithmetic mean always equals or exceeds geometric mean; the gap widens with volatility." },
    { question: "Why is geometric mean lower?", answer: "Volatility drag: a 50% loss requires a 100% gain to recover. Averaging returns arithmetically ignores this asymmetry. The geometric mean accounts for it because it compounds the actual growth factors (1 + r) together before taking the root." },
    { question: "Which one should I use?", answer: "For projecting future portfolio value, use the geometric mean — it reflects true compounding. For describing average yearly performance in a headline, arithmetic mean is common. The two differ by roughly half the variance, so the gap is a direct measure of volatility." },
    { question: "What is volatility drag?", answer: "The difference between arithmetic and geometric mean equals approximately half the variance of returns. Higher volatility means more drag: an investment averaging 10% with 20% volatility compounds at roughly 8%. Smoother returns preserve more of the average." },
    { question: "How do I compute the geometric mean by hand?", answer: "Multiply (1 + return) for each year, take the nth root, subtract 1. For returns of 10%, −5%, 15%, 8%, 12%: 1.10 × 0.95 × 1.15 × 1.08 × 1.12 = 1.454, then 1.454^(1/5) − 1 ≈ 7.8%." },
    { question: "Does this account for cash flows?", answer: "No — this calculator assumes a single lump sum held for five years. If you add or withdraw money, use a money-weighted return (IRR or XIRR) instead, since the time-weighted geometric mean ignores the timing of external cash flows." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Average Return Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Average Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {([["Year 1", y1, setY1], ["Year 2", y2, setY2], ["Year 3", y3, setY3], ["Year 4", y4, setY4], ["Year 5", y5, setY5]] as [string, string, (v: string) => void][]).map(([label, val, set], i) => (
                <div key={i}>
                  <label className="text-sm font-medium mb-1 block">{label} Return</label>
                  <div className={inp}><input type="number" value={val} onChange={(e) => set(e.target.value)} step={0.5} className={ci} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                </div>
              ))}
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Compound Annual Growth Rate</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.geometricMean.toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">Arithmetic mean: {result.arithmeticMean.toFixed(2)}% · $1,000 → ${result.endingValue.toFixed(2)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Arithmetic", `${result.arithmeticMean.toFixed(2)}%`], ["Geometric", `${result.geometricMean.toFixed(2)}%`], ["Volatility", `${result.volatility.toFixed(1)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Return Analysis</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Annual Returns</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, "Return"]} />
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
            <h2 className="text-2xl font-bold mb-3">Arithmetic vs Geometric Mean</h2>
            <p>Most performance headlines report the arithmetic mean — the simple average of yearly returns. But your account balance grows at the geometric mean, the compound annual growth rate. The difference between them is volatility drag: rough returns erode compounding, so the average return always flatters the real outcome.</p>
            <h2 className="text-2xl font-bold mb-3">Why Volatility Costs You</h2>
            <p>Returns of +50% and −50% average to 0%, but $1,000 becomes $750. Losses compound against a shrinking base while gains compound from a smaller one. The geometric mean captures this: with 50% and −50%, the CAGR is −13.4% despite a 0% arithmetic average. Smooth, consistent returns beat volatile ones at equal averages.</p>
            <h2 className="text-2xl font-bold mb-3">Using the Numbers</h2>
            <p>For projections and goal planning, always use the geometric mean. For comparing managers or funds over the same period, arithmetic mean plus volatility tells you the full story. A high arithmetic mean with high volatility is the classic illusion — the geometric mean reveals what you'll actually keep.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/average-return-calculator" />
          <PopularCalculators exclude="/calculator/average-return-calculator" />
        </div>
      </div>
    </>
  );
}
