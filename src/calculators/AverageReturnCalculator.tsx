"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DEFAULTS = {
  returnsInput: "10, 15, -5, 20, 8",
  initialValue: "10000"
};

interface ReturnResult {
  returnsList: number[];
  arithmeticMean: number;
  geometricMean: number;
  cumulativeReturn: number;
  endingValue: number;
  chartData: { year: string; return: number; value: number }[];
}

function calculate(v: typeof DEFAULTS): ReturnResult {
  const initial = parseFloat(v.initialValue) || 10000;
  // Parse returns
  const returnsList = v.returnsInput
    .split(/[,\n]/)
    .map(s => s.trim())
    .map(s => parseFloat(s))
    .filter(n => !isNaN(n));

  if (returnsList.length === 0) {
    return {
      returnsList: [],
      arithmeticMean: 0,
      geometricMean: 0,
      cumulativeReturn: 0,
      endingValue: initial,
      chartData: [{ year: "Year 0", return: 0, value: initial }]
    };
  }

  const n = returnsList.length;
  // 1. Arithmetic Mean
  const sum = returnsList.reduce((acc, curr) => acc + curr, 0);
  const arithmeticMean = sum / n;

  // 2. Geometric Mean & Cumulative Return
  let product = 1;
  const chartData = [{ year: "Start", return: 0, value: initial }];
  let runningValue = initial;

  for (let i = 0; i < returnsList.length; i++) {
    const rate = returnsList[i] / 100;
    product *= (1 + rate);
    runningValue = runningValue * (1 + rate);
    chartData.push({
      year: `Year ${i + 1}`,
      return: returnsList[i],
      value: Math.round(runningValue * 100) / 100
    });
  }

  const geometricMean = (Math.pow(product, 1 / n) - 1) * 100;
  const cumulativeReturn = (product - 1) * 100;
  const endingValue = runningValue;

  return {
    returnsList,
    arithmeticMean,
    geometricMean,
    cumulativeReturn,
    endingValue,
    chartData
  };
}

const fmtPct = (n: number) => `${n.toFixed(2)}%`;
const fmtCurrency = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

export default function AverageReturnCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ReturnResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, [vals.returnsInput, vals.initialValue]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is the difference between Arithmetic and Geometric average returns?",
      answer: "The arithmetic average is the simple mean of a series of returns (sum of returns divided by count). It ignores compounding effects. The geometric average accounts for compounding over multiple periods and represents the actual annual rate of growth (CAGR) an investor achieved. Geometric returns are always equal to or lower than arithmetic returns."
    },
    {
      question: "Why is the Geometric average return preferred for portfolios?",
      answer: "Geometric return measures the true compound growth rate of an investment over time. For example, if an investment loses 50% in Year 1 and gains 50% in Year 2, the arithmetic average return is 0%, but your actual wealth has dropped by 25% (from $100 to $50, then to $75). The geometric return correctly shows a loss of -13.4% per year, reflecting the actual wealth outcome."
    },
    {
      question: "How is Cumulative Return calculated?",
      answer: "Cumulative return measures the total percentage change in the value of an investment over a multi-period holding span. It is calculated by multiplying the relative return factors: Cumulative Return = [(1 + R1) * (1 + R2) * ... * (1 + Rn)] - 1. It represents the total gain or loss from the start to the end."
    },
    {
      question: "Can I input negative returns in this calculator?",
      answer: "Yes, negative returns should be entered directly as negative numbers (e.g., -5 or -12.5). The calculator will process negative returns accurately, reducing both arithmetic/geometric averages and showing the dip in the portfolio growth chart."
    },
    {
      question: "What does WACC have to do with average returns?",
      answer: "WACC represents the firm's cost of capital, whereas average return calculates what an asset or investment portfolio actually generated. Investors compare the historical average return of a project or firm against WACC to check if the company is generating positive economic value added (EVA)."
    },
    {
      question: "How does volatility affect the difference between Arithmetic and Geometric returns?",
      answer: "Higher return volatility (larger swings between gains and losses) increases the gap between the arithmetic and geometric averages. This phenomenon is known as 'volatility drag.' A stable portfolio return series will have arithmetic and geometric returns close to each other, whereas a highly volatile series will see the geometric return drop significantly below the arithmetic average."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Average Return Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Average Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Annual Returns (%)</label>
              <span className="text-xs text-muted-foreground mb-1 block">Enter returns separated by commas or newlines.</span>
              <textarea
                value={vals.returnsInput}
                onChange={handleInputChange("returnsInput")}
                className="h-28 w-full p-2.5 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none font-mono"
                placeholder="e.g. 10, 15, -5, 20, 8"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Hypothetical Starting Investment ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.initialValue}
                  onChange={handleInputChange("initialValue")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => runCalc()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button
                onClick={reset}
                className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Results Side */}
          <div className="flex flex-col gap-4">
            {result && (
              <>
                {/* Primary Result Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Geometric Average</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtPct(result.geometricMean)}</div>
                    <span className="text-[10px] text-muted-foreground">True Compound Growth Rate</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Arithmetic Average</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtPct(result.arithmeticMean)}</div>
                    <span className="text-[10px] text-muted-foreground">Simple Average of Values</span>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">Cumulative Return</div>
                    <div className="text-3xl font-bold text-foreground tracking-tight">{fmtPct(result.cumulativeReturn)}</div>
                    <span className="text-[10px] text-muted-foreground">Total Gain over Hold Period</span>
                  </div>
                </div>

                {/* Final Value Banner */}
                <div className="bg-secondary/40 border border-border rounded-xl p-4 text-center flex items-center justify-between px-6">
                  <span className="text-sm font-semibold text-muted-foreground">Hypothetical Ending Value:</span>
                  <span className="text-2xl font-bold text-foreground">{fmtCurrency(result.endingValue)}</span>
                </div>

                {/* Recharts Portfolio Growth Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Portfolio Growth Over Time ($)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(v), "Portfolio Value"]} />
                        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Returns Sequence Table */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Period</th>
                        <th className="p-2.5 text-right">Return (%)</th>
                        <th className="p-2.5 pr-3 text-right">Ending Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {result.chartData.map((row, idx) => {
                        if (idx === 0) return null; // Skip start row
                        return (
                          <tr key={idx}>
                            <td className="p-2.5 pl-3 font-semibold text-foreground">Year {idx}</td>
                            <td className={`p-2.5 text-right font-medium ${row.return >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {row.return >= 0 ? "+" : ""}{row.return}%
                            </td>
                            <td className="p-2.5 pr-3 text-right text-foreground font-medium">{fmtCurrency(row.value)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO Article section */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Average Returns: Arithmetic vs. Geometric Mean</h2>
            <p>
              When evaluating the performance of stocks, mutual funds, or real estate assets over multiple years, investors frequently refer to "average returns." However, the term average can be highly misleading in finance because it can refer to two fundamentally different mathematical concepts: the <strong>Arithmetic Mean</strong> and the <strong>Geometric Mean</strong>.
            </p>
            <p>
              While the arithmetic average return provides a quick, simple summary of annual performance, it fails to account for compounding. The geometric average return, on the other hand, factors in compounding growth over time and represents the true annual rate of return that an investor actually experienced.
            </p>

            <h2>Formulas for Average Return</h2>
            
            <h3>Arithmetic Return Formula</h3>
            <p>
              The arithmetic average return is the standard average you learn in basic math:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              Arithmetic Mean = (R₁ + R₂ + ... + Rₙ) / n
            </p>
            <p>
              Where <strong>R</strong> represents individual annual returns, and <strong>n</strong> represents the total number of periods.
            </p>

            <h3>Geometric Return Formula (CAGR)</h3>
            <p>
              The geometric average return determines the constant rate of return that would yield the same ending wealth as the volatile sequence of actual returns:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              Geometric Mean = [ (1 + R₁) × (1 + R₂) × ... × (1 + Rₙ) ]^(1/n) - 1
            </p>
            <p>
              Each return is converted to a multiplier (e.g., a 10% gain becomes 1.10, a 5% loss becomes 0.95), multiplied together, raised to the power of 1/n, and finally, 1 is subtracted.
            </p>

            <h2>Why compounding and volatility matter: An example</h2>
            <p>
              Suppose you start with an investment of $10,000. In Year 1, the market crashes and your portfolio loses 50%, leaving you with $5,000. In Year 2, the market recovers and gains 50%, lifting your balance to $7,500.
            </p>
            <ul>
              <li><strong>Arithmetic Average:</strong> (-50% + 50%) / 2 = 0%. Under a simple average, it appears you broke even.</li>
              <li><strong>Actual Outcome:</strong> You lost $2,500 (25% of your original wealth).</li>
              <li><strong>Geometric Average:</strong> [ (1 - 0.50) × (1 + 0.50) ]^(1/2) - 1 = (0.75)^(0.5) - 1 ≈ -13.4%. The geometric return correctly registers a compound annual loss of -13.4%, matching the wealth decline.</li>
            </ul>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/average-return-calculator" />
          <PopularCalculators exclude="/calculator/average-return-calculator" />
        </div>
      </div>
    </>
  );
}
