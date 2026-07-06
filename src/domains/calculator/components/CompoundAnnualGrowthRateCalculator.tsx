"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const DEFAULTS = { beginningValue: "10000", endingValue: "18500", years: "6" };

interface CAGRResult {
  cagr: number;
  absoluteReturn: number;
  absoluteReturnPct: number;
  simpleAnnualReturn: number;
  chartData: { year: string; value: number }[];
  doubleTime: number;
}

function calculate(v: typeof DEFAULTS): CAGRResult {
  const bv = parseFloat(v.beginningValue) || 0;
  const ev = parseFloat(v.endingValue) || 0;
  const n = parseFloat(v.years) || 1;
  if (bv <= 0 || ev <= 0 || n <= 0) return { cagr: 0, absoluteReturn: 0, absoluteReturnPct: 0, simpleAnnualReturn: 0, chartData: [], doubleTime: 0 };

  // CAGR = (Ending Value / Beginning Value)^(1/n) - 1
  const cagr = Math.pow(ev / bv, 1 / n) - 1;
  const absoluteReturn = ev - bv;
  const absoluteReturnPct = ((ev - bv) / bv) * 100;
  const simpleAnnualReturn = absoluteReturnPct / n;
  // Rule of 72: years to double = 72 / (CAGR * 100)
  const doubleTime = cagr > 0 ? 72 / (cagr * 100) : 0;

  // Growth chart: project from year 0 to n using CAGR
  const chartData = Array.from({ length: Math.min(Math.ceil(n) + 1, 31) }, (_, i) => ({
    year: `Yr ${i}`,
    value: parseFloat((bv * Math.pow(1 + cagr, i)).toFixed(2)),
  }));

  return { cagr, absoluteReturn, absoluteReturnPct, simpleAnnualReturn, chartData, doubleTime };
}

const fmtPct = (n: number) => `${(n * 100).toFixed(2)}%`;
const fmtCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CompoundAnnualGrowthRateCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<CAGRResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const set = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setVals((v) => ({ ...v, [key]: e.target.value }));

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => { setMounted(true); runCalc(); }, []);

  const reset = () => { setVals(DEFAULTS); setResult(calculate(DEFAULTS)); };

  const faqs = [
    { question: "What is CAGR and why does it matter?", answer: "CAGR (Compound Annual Growth Rate) is the rate at which an investment would have grown if it grew at a steady rate each year. It smooths out volatility to show a single representative annual growth rate, making it the gold standard for comparing investment performance across different time periods and asset classes." },
    { question: "What is the CAGR formula?", answer: "CAGR = (Ending Value / Beginning Value)^(1/Number of Years) − 1. For example, if $10,000 grew to $18,500 over 6 years: CAGR = (18500/10000)^(1/6) − 1 = 1.85^0.1667 − 1 = 1.1080 − 1 = 10.80% per year." },
    { question: "What is the difference between CAGR and average annual return?", answer: "Average annual return is the arithmetic mean of yearly returns. CAGR is the geometric mean — it accounts for compounding. If an investment gains 50% in year 1 and loses 33% in year 2, the average return is 8.5% but the CAGR is exactly 0% (the investment returned to its starting value). CAGR is more accurate for multi-year performance." },
    { question: "What is a good CAGR for an investment?", answer: "The S&P 500 has historically delivered a CAGR of approximately 10–11% before inflation. Real estate averages 4–6% CAGR. Bonds typically deliver 3–5%. A CAGR above 15% consistently is considered excellent. Venture capital targets 25–30%+ CAGR but with much higher risk. Always compare CAGR to inflation (historically ~3%) to assess real purchasing power growth." },
    { question: "How does CAGR relate to the Rule of 72?", answer: "The Rule of 72 says that dividing 72 by the annual growth rate approximates the number of years to double an investment. At 10.80% CAGR: 72 / 10.80 ≈ 6.67 years to double. This closely matches the actual calculation. Use CAGR as the input to the Rule of 72 for quick doubling-time estimates." },
    { question: "Can CAGR be negative?", answer: "Yes. If the ending value is less than the beginning value, CAGR will be negative, representing an annualized loss. For example, if $10,000 dropped to $7,000 over 5 years: CAGR = (7000/10000)^(1/5) − 1 = 0.7^0.2 − 1 = −6.62% per year." },
    { question: "What are the limitations of CAGR?", answer: "CAGR ignores volatility (two investments with identical CAGR may have very different risk profiles), doesn't account for cash flows in or out of the investment, and can be misleading if the measurement period is cherry-picked. Always pair CAGR with standard deviation or Sharpe Ratio for a complete risk/return picture." },
    { question: "How do I use CAGR to compare mutual funds?", answer: "Compare 1-year, 3-year, 5-year, and 10-year CAGR across funds in the same category. Consistent high CAGR across multiple time periods suggests genuine skill rather than a lucky run. Also compare expense ratios — a fund with 12% gross CAGR but 1.5% expense ratio delivers less than a fund with 11% gross CAGR and 0.05% expense ratio." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "CAGR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Compound Annual Growth Rate (CAGR) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Inputs</h2>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Beginning Value ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.beginningValue} onChange={set("beginningValue")}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Ending Value ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" value={vals.endingValue} onChange={set("endingValue")}
                  className="h-10 w-full pl-7 pr-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Number of Years</label>
              <div className="relative">
                <input type="number" value={vals.years} onChange={set("years")}
                  className="h-10 w-full pl-3 pr-16 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" min="0.1" step="0.5" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">years</span>
              </div>
            </div>
            <div className="flex gap-2.5 mt-1">
              <button onClick={() => runCalc()} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Compound Annual Growth Rate</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">{fmtPct(result.cagr)}</div>
                  <div className="text-sm text-muted-foreground font-medium">{fmtCurrency(parseFloat(vals.beginningValue))} → {fmtCurrency(parseFloat(vals.endingValue))} over {vals.years} years</div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Metric</th>
                        <th className="p-2.5 pr-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "CAGR", value: fmtPct(result.cagr) },
                        { label: "Total Absolute Return", value: fmtCurrency(result.absoluteReturn) },
                        { label: "Total Return %", value: `${result.absoluteReturnPct.toFixed(2)}%` },
                        { label: "Simple Annual Return (avg)", value: `${result.simpleAnnualReturn.toFixed(2)}%` },
                        { label: "Years to Double (Rule of 72)", value: result.doubleTime > 0 ? `${result.doubleTime.toFixed(1)} years` : "N/A" },
                        { label: "Beginning Value", value: fmtCurrency(parseFloat(vals.beginningValue)) },
                        { label: "Ending Value", value: fmtCurrency(parseFloat(vals.endingValue)), bold: true },
                      ].map((r) => (
                        <tr key={r.label} className="hover:bg-secondary/20 transition-colors">
                          <td className="p-2.5 pl-3 font-semibold text-foreground">{r.label}</td>
                          <td className={`p-2.5 pr-3 text-right ${r.bold ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Growth Projection at {fmtPct(result.cagr)} CAGR</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={result.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} interval={Math.max(1, Math.floor(result.chartData.length / 8))} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(Number(v)), "Value"]} />
                        <ReferenceLine y={parseFloat(vals.beginningValue)} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="bg-muted/30 rounded-xl border border-border p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "CAGR", value: fmtPct(result.cagr) },
                      { label: "Total Return", value: `${result.absoluteReturnPct.toFixed(1)}%` },
                      { label: "Gain / Loss", value: fmtCurrency(result.absoluteReturn) },
                      { label: "Simple Avg / Year", value: `${result.simpleAnnualReturn.toFixed(2)}%` },
                      { label: "Years to Double", value: result.doubleTime > 0 ? `${result.doubleTime.toFixed(1)} yrs` : "N/A" },
                      { label: "Performance", value: result.cagr >= 0.15 ? "Excellent" : result.cagr >= 0.10 ? "Strong" : result.cagr >= 0.06 ? "Moderate" : result.cagr >= 0 ? "Below Avg" : "Negative", bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                        <span className={`text-base font-bold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is CAGR (Compound Annual Growth Rate)?</h2>
            <p>CAGR, or Compound Annual Growth Rate, is the single most important metric for measuring investment performance over time. It represents the rate at which an investment would have grown each year if it had grown at a perfectly steady rate — factoring in the effect of compounding. Unlike simple average returns, CAGR eliminates volatility from the picture, giving you a clean, comparable number that tells you exactly what your investment delivered annually, year after year.</p>
            <p>Our calculator is pre-filled with a common investment scenario: $10,000 growing to $18,500 over 6 years — producing a CAGR of 10.80% per year. This is close to the historical S&P 500 average, illustrating what a decade of consistent index fund investing looks like in practice.</p>

            <h2 className="text-2xl font-bold mb-3">The CAGR Formula Explained</h2>
            <p><strong>CAGR = (Ending Value ÷ Beginning Value)^(1 ÷ Number of Years) − 1</strong></p>
            <p>Breaking this down step by step for our example: Step 1: Divide ending by beginning: $18,500 ÷ $10,000 = 1.85. Step 2: Raise to the power of 1/n (where n = 6 years): 1.85^(1/6) = 1.85^0.1667 = 1.1080. Step 3: Subtract 1: 1.1080 − 1 = 0.1080 = 10.80% CAGR. This means your investment grew at the equivalent of 10.80% per year, compounded annually.</p>

            <h2 className="text-2xl font-bold mb-3">CAGR vs. Simple Average Return: A Critical Difference</h2>
            <p>Suppose an investment gains 100% in year 1 (doubles from $10,000 to $20,000) then loses 50% in year 2 (falls back to $10,000). Simple average return = (100% + −50%) ÷ 2 = 25%. But you ended where you started — the actual CAGR is 0%. This example illustrates why simple averages are misleading for multi-year investments. CAGR uses the geometric mean, which always accounts for compounding and path dependence, making it the only accurate way to compare returns across different time horizons.</p>

            <h2 className="text-2xl font-bold mb-3">What CAGR Tells You About Investment Quality</h2>
            <p>Historical benchmarks for CAGR by asset class: US Stock Market (S&P 500): ~10.5% per year since 1926, ~7.5% after inflation. Real Estate: ~4–6% before inflation. Corporate Bonds: ~4–5%. Government Bonds: ~3–4%. Gold: ~3–4% long-term. Cash/CDs: ~1–2%. A personal investment with a CAGR significantly above the relevant benchmark suggests active outperformance — either through skill, luck, or higher risk-taking. Any CAGR comparison must account for risk: a small-cap growth fund might show 15% CAGR but with 30% annual volatility, while an S&P 500 index fund at 10.5% CAGR has 15% volatility — often the better risk-adjusted choice.</p>

            <h2 className="text-2xl font-bold mb-3">The Power of Compounding at Different CAGR Rates</h2>
            <p>Starting with $10,000, here's what different CAGR rates produce over 20 years: 5% CAGR → $26,533. 7% CAGR → $38,697. 10% CAGR → $67,275. 12% CAGR → $96,463. 15% CAGR → $163,665. 20% CAGR → $383,376. The gap between 10% and 15% is nearly $100,000 on a $10,000 initial investment over 20 years — demonstrating why even a 5% difference in annual return compounds into an enormous wealth gap. This is why minimizing investment fees (which directly reduce CAGR) is so critical for long-term wealth building.</p>

            <h2 className="text-2xl font-bold mb-3">Using CAGR to Evaluate Business Growth</h2>
            <p>CAGR applies equally to business metrics: Revenue CAGR, customer base CAGR, profit CAGR, or market share CAGR. A company growing revenue at 20%+ CAGR over 5+ years is typically classified as a high-growth company and commands premium valuation multiples. Revenue CAGR is a key metric in pitch decks and investor presentations. To calculate it: use the company's first-year revenue as beginning value and most recent year's revenue as ending value. Consistent CAGR above 15% for 5+ years puts a company in the top tier of growth performance.</p>

            <h2 className="text-2xl font-bold mb-3">CAGR and the Rule of 72</h2>
            <p>The Rule of 72 is a mental math shortcut: divide 72 by the annual growth rate to estimate years to double. At 10.80% CAGR: 72 ÷ 10.80 = 6.67 years to double. The actual precise calculation gives 6.76 years — the Rule of 72 is accurate within 1–2% for rates between 2% and 25%. Use it for quick back-of-envelope calculations: if your portfolio has a 7% CAGR, it doubles in approximately 10 years. At 12% CAGR, it doubles in 6 years. At 3% (inflation), purchasing power halves in 24 years — which is why investing above inflation rate is essential for real wealth preservation.</p>

            <h2 className="text-2xl font-bold mb-3">Limitations of CAGR and How to Complement It</h2>
            <p>CAGR has three important limitations. First, it ignores risk and volatility: two investments with identical 10% CAGR can have wildly different risk profiles. Always pair CAGR with standard deviation, maximum drawdown, or Sharpe Ratio. Second, CAGR is sensitive to endpoints: measuring from a market peak to a trough (or vice versa) produces misleading CAGR figures. Use rolling CAGR across multiple periods for robustness. Third, CAGR doesn't account for cash flows: if you made additional investments during the period, use IRR (Internal Rate of Return) instead. IRR is the cash-flow-aware version of CAGR for investments with multiple inflows and outflows.</p>

            <h2 className="text-2xl font-bold mb-3">How to Use This CAGR Calculator</h2>
            <p>Enter your Beginning Value (your initial investment or starting metric), Ending Value (final value after the period), and Number of Years. The calculator instantly computes your CAGR, total return in dollars and percent, simple average annual return for comparison, and the Rule of 72 doubling time. The growth chart projects your investment forward at the calculated CAGR rate, showing the compounding curve visually. Use this to set realistic expectations: a $50,000 investment at 8% CAGR becomes $107,946 in 10 years — more than doubling, but not the explosive growth seen in speculative assets.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compound-annual-growth-rate-calculator" />
          <PopularCalculators exclude="/calculator/compound-annual-growth-rate-calculator" />
        </div>
      </div>
    </>
  );
}
