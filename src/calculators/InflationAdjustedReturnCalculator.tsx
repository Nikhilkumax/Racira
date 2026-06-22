"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DEFAULTS = {
  initialInvestment: "10000",
  nominalReturn: "8",
  inflationRate: "3",
  years: "10"
};

interface InflationResult {
  realReturnRate: number;
  nominalEndingValue: number;
  realEndingValue: number;
  purchasingPowerLoss: number;
  chartData: { year: string; Nominal: number; Real: number }[];
}

function calculate(v: typeof DEFAULTS): InflationResult {
  const principal = parseFloat(v.initialInvestment) || 10000;
  const nomRate = (parseFloat(v.nominalReturn) || 0) / 100;
  const infRate = (parseFloat(v.inflationRate) || 0) / 100;
  const yearsNum = parseInt(v.years) || 10;

  // Real Return Rate = (1 + Nominal Return) / (1 + Inflation Rate) - 1
  const realReturnRate = ((1 + nomRate) / (1 + infRate) - 1) * 100;
  const realRateFraction = realReturnRate / 100;

  const nominalEndingValue = principal * Math.pow(1 + nomRate, yearsNum);
  const realEndingValue = principal * Math.pow(1 + realRateFraction, yearsNum);
  const purchasingPowerLoss = nominalEndingValue - realEndingValue;

  const chartData: { year: string; Nominal: number; Real: number }[] = [];
  // Build chart data year by year
  for (let i = 0; i <= yearsNum; i++) {
    // Show step points: start, mid, end, or year-by-year if <= 25 years
    if (yearsNum <= 20 || i % Math.ceil(yearsNum / 10) === 0 || i === yearsNum) {
      chartData.push({
        year: i === 0 ? "Start" : `Year ${i}`,
        Nominal: Math.round(principal * Math.pow(1 + nomRate, i)),
        Real: Math.round(principal * Math.pow(1 + realRateFraction, i))
      });
    }
  }

  return {
    realReturnRate,
    nominalEndingValue,
    realEndingValue,
    purchasingPowerLoss,
    chartData
  };
}

const fmtCurrency = (n: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

const fmtPct = (n: number) => `${n.toFixed(2)}%`;

export default function InflationAdjustedReturnCalculator() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<InflationResult | null>(null);
  const [mounted, setMounted] = useState(false);

  const handleInputChange = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setVals((prev) => {
      const updated = { ...prev, [key]: e.target.value };
      return updated;
    });
  };

  const runCalc = (v = vals) => setResult(calculate(v));

  useEffect(() => {
    setMounted(true);
    runCalc();
  }, [vals.initialInvestment, vals.nominalReturn, vals.inflationRate, vals.years]);

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const faqs = [
    {
      question: "What is an Inflation-Adjusted Return?",
      answer: "An inflation-adjusted return (also called the real rate of return) measures the actual return of an investment after stripping out the effects of inflation. It represents the actual increase in purchasing power that the investment generated rather than just the numeric increase in dollar amount."
    },
    {
      question: "What is the Fisher Equation?",
      answer: "The Fisher Equation is the formula used to calculate real returns. It states that: 1 + Real Rate = (1 + Nominal Rate) / (1 + Inflation Rate). Solving for the Real Rate yields: Real Return = (1 + Nominal Return) / (1 + Inflation Rate) - 1. A simplified approximation is: Real Return ≈ Nominal Return - Inflation, but the exact Fisher equation is preferred for accuracy."
    },
    {
      question: "Why does inflation matter for long-term investments?",
      answer: "Inflation erodes the purchasing power of money over time. If your portfolio grows by 8% in a year, but the prices of goods and services also increase by 3%, your actual wealth growth in terms of what you can buy is only about 4.85%. Over long periods (e.g., 20-30 years), ignoring inflation can lead to a severe overestimation of retirement readiness."
    },
    {
      question: "What is the difference between Nominal and Real value?",
      answer: "Nominal value refers to the absolute dollar amount of money in the future without accounting for price increases. Real value adjusts that future dollar amount to reflect what it would buy in 'today's dollars.' For example, if you have $20,000 in 10 years, that is the nominal value. If that $20,000 only has the buying power of $14,000 today, then $14,000 is the real value."
    },
    {
      question: "Can inflation-adjusted returns be negative?",
      answer: "Yes. If the inflation rate is higher than your nominal rate of return, your real rate of return will be negative. In this scenario, even though your investment balance is growing numerically, you are actually losing purchasing power over time. This is common with low-yield savings accounts during high-inflation cycles."
    },
    {
      question: "How can I protect my investment portfolio from inflation?",
      answer: "To hedge against inflation, investors typically allocate capital to assets whose values or income streams grow alongside inflation. This includes equities (stocks), real estate (where rent adjusts upwards), commodities (like gold), and specialized government bonds like Treasury Inflation-Protected Securities (TIPS) which adjust their principal value based on the Consumer Price Index (CPI)."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Finance", href: "/calculator#finance" }, { label: "Inflation-Adjusted Return" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Inflation-Adjusted Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          {/* Inputs Card */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-lg font-bold text-foreground pb-2 border-b border-border">Inputs</h2>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Initial Investment ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={vals.initialInvestment}
                  onChange={handleInputChange("initialInvestment")}
                  className="h-10 w-full pl-7 pr-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Nominal Annual Return (%)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                <input
                  type="number"
                  value={vals.nominalReturn}
                  onChange={handleInputChange("nominalReturn")}
                  className="h-10 w-full pl-3 pr-8 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Annual Inflation Rate (%)</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                <input
                  type="number"
                  value={vals.inflationRate}
                  onChange={handleInputChange("inflationRate")}
                  className="h-10 w-full pl-3 pr-8 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Holding Period (Years)</label>
              <input
                type="number"
                value={vals.years}
                onChange={handleInputChange("years")}
                className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                min="1"
                max="100"
              />
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
                {/* Result Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-0.5 uppercase tracking-wider">Real Return Rate</div>
                    <div className="text-3xl font-extrabold text-foreground tracking-tight">{fmtPct(result.realReturnRate)}</div>
                    <span className="text-[10px] text-muted-foreground">Adjusted for inflation (Fisher formula)</span>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl p-4 text-center">
                    <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-0.5 uppercase tracking-wider">Loss to Inflation</div>
                    <div className="text-3xl font-bold text-rose-700 dark:text-rose-300 tracking-tight">{fmtCurrency(result.purchasingPowerLoss)}</div>
                    <span className="text-[10px] text-muted-foreground">Erosion in purchasing power</span>
                  </div>
                </div>

                {/* Comparative Ending Balance Banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                    <div className="text-xs text-muted-foreground font-semibold">Nominal Future Balance</div>
                    <div className="text-xl font-bold text-foreground mt-0.5">{fmtCurrency(result.nominalEndingValue)}</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Real Future Balance (Buying Power)</div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{fmtCurrency(result.realEndingValue)}</div>
                  </div>
                </div>

                {/* Recharts Chart */}
                {mounted && result.chartData.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="text-sm font-bold text-foreground mb-3">Nominal vs. Real Wealth Growth Comparison ($)</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                        <Tooltip formatter={(v: any) => [fmtCurrency(v)]} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="Nominal" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} name="Nominal Balance (Unadjusted)" />
                        <Bar dataKey="Real" fill="#10b981" radius={[3, 3, 0, 0]} name="Real Balance (Inflation-Adjusted)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SEO Article Section */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Power of Real Returns</h2>
            <p>
              In wealth management and investing, the numerical increase in your portfolio is referred to as the <strong>nominal return</strong>. While seeing a 10% gain on paper is positive, it does not represent your actual wealth growth unless it is contrasted with price inflation. The <strong>inflation-adjusted return</strong>, or <strong>real return</strong>, accounts for this erosion by measuring how much additional purchasing power your investments have acquired.
            </p>
            <p>
              If your investments grew by 8% last year, but the consumer price index (CPI) increased by 3%, your nominal growth is 8%. However, because goods and services cost 3% more, you cannot buy 8% more things. Instead, your actual purchasing power increased by a net of 4.85%. This compounding difference is what determines the long-term success of retirement funds and college savings plans.
            </p>

            <h2>The Fisher Equation: How Real Returns are Calculated</h2>
            <p>
              Many investors use a simple subtraction formula to approximate real returns (Nominal Return - Inflation Rate = Real Return). However, this is only a rough estimation. The exact mathematical standard is established by the **Fisher Equation**, named after economist Irving Fisher:
            </p>
            <p className="bg-muted p-4 rounded-lg font-mono text-center text-sm md:text-base border border-border">
              Real Rate of Return = [ (1 + Nominal Rate) / (1 + Inflation Rate) ] - 1
            </p>
            <p>
              This formula is critical because it models the compounding relationship between price changes and wealth gains. For example:
            </p>
            <ul>
              <li><strong>Nominal return:</strong> 10% (0.10)</li>
              <li><strong>Inflation rate:</strong> 4% (0.04)</li>
              <li><strong>Approximate return:</strong> 10% - 4% = 6.00%</li>
              <li><strong>Exact Fisher Return:</strong> (1.10 / 1.04) - 1 = 5.77%</li>
            </ul>
            <p>
              At higher nominal rates or in high-inflation environments, the difference between the approximation and the exact Fisher return becomes much larger and can cause significant errors in long-term financial modeling.
            </p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inflation-adjusted-return-calculator" />
          <PopularCalculators exclude="/calculator/inflation-adjusted-return-calculator" />
        </div>
      </div>
    </>
  );
}
