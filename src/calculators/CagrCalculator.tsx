"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw } from "lucide-react";

const CAGRCalculator = () => {
  const [mode, setMode] = useState<"cagr" | "future" | "years">("cagr");
  const [initialValue, setInitialValue] = useState("10000");
  const [finalValue, setFinalValue] = useState("25000");
  const [years, setYears] = useState("7");
  const [cagrRate, setCagrRate] = useState("8");
  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const IV = parseFloat(initialValue) || 0;
    const FV = parseFloat(finalValue) || 0;
    const N = parseFloat(years) || 0;
    const R = parseFloat(cagrRate) || 0;

    if (mode === "cagr") {
      if (IV <= 0 || FV <= 0 || N <= 0) return;
      const cagr = (Math.pow(FV / IV, 1 / N) - 1) * 100;
      const totalReturn = ((FV - IV) / IV) * 100;
      const absoluteGain = FV - IV;

      // Year-by-year projection
      const yearlyData = Array.from({ length: Math.ceil(N) + 1 }, (_, i) => ({
        year: i,
        value: IV * Math.pow(1 + cagr / 100, i),
      }));

      setResults({ mode, cagr, totalReturn, absoluteGain, IV, FV, N, yearlyData });
    } else if (mode === "future") {
      if (IV <= 0 || R <= 0 || N <= 0) return;
      const fv = IV * Math.pow(1 + R / 100, N);
      const gain = fv - IV;
      const totalReturn = ((fv - IV) / IV) * 100;

      const yearlyData = Array.from({ length: Math.ceil(N) + 1 }, (_, i) => ({
        year: i,
        value: IV * Math.pow(1 + R / 100, i),
      }));

      setResults({ mode, fv, gain, totalReturn, IV, R, N, yearlyData });
    } else {
      if (IV <= 0 || FV <= 0 || R <= 0) return;
      const n = Math.log(FV / IV) / Math.log(1 + R / 100);
      setResults({ mode, n, IV, FV, R });
    }
  };

  const reset = () => {
    setShowResults(false);
    setInitialValue("10000"); setFinalValue("25000");
    setYears("7"); setCagrRate("8");
    setMode("cagr"); setResults(null);
  };

  const faqs = [
    { question: "What is CAGR?", answer: "CAGR (Compound Annual Growth Rate) is the rate at which an investment grows from its beginning value to its ending value over a specific period, assuming the investment compounds annually. It's expressed as a percentage and smooths out volatility to give a single 'steady-state' growth rate. CAGR is widely used to compare performance of investments, companies, and markets over time." },
    { question: "What is the CAGR formula?", answer: "The CAGR formula is: CAGR = [(Final Value / Initial Value)^(1/n) − 1] × 100, where n is the number of years. For example, if an investment grew from $10,000 to $25,000 over 7 years: CAGR = [(25,000/10,000)^(1/7) − 1] × 100 = (2.5^0.1429 − 1) × 100 ≈ 14.07% per year." },
    { question: "What is a good CAGR?", answer: "A 'good' CAGR depends on the asset class. For stocks, a CAGR of 10–15% is strong (the S&P 500 averages about 10% historically). For real estate, 6–8% is solid. For mutual funds, 12–15% over 5+ years is good. Anything above 20% annually is exceptional but rare and often unsustainable. Compare CAGR to relevant benchmarks, not absolute numbers." },
    { question: "What is the difference between CAGR and average annual return?", answer: "Average annual return simply averages the yearly returns, which can be misleading. For example, if an investment returns +100% in year 1 and -50% in year 2, the average return is 25% — but you actually break even! CAGR accounts for compounding and always gives the true annualized growth rate. Always prefer CAGR over simple average returns for multi-year performance comparison." },
    { question: "Can CAGR be negative?", answer: "Yes, CAGR can be negative if the final value is less than the initial value — this represents a loss over the period. For example, if you invested $10,000 and it's now worth $7,000 after 5 years, the CAGR = [(7,000/10,000)^(1/5) − 1] × 100 = −6.7% per year. Negative CAGR indicates your investment is losing value at a compound rate." },
    { question: "How does CAGR relate to compound interest?", answer: "CAGR and compound interest are mathematically related. CAGR tells you what constant annual interest rate would have produced the same growth from start to finish. If an investment has a CAGR of 10%, it's equivalent to earning 10% compound interest each year on your investment. CAGR is essentially compound interest calculated backward from known start and end values." },
    { question: "How is CAGR used in business?", answer: "In business, CAGR is used to measure and compare growth rates of revenue, profits, user bases, and market share over multi-year periods. Companies use it in investor presentations, annual reports, and strategic planning. Analysts compare industry CAGR benchmarks to assess whether a company's growth is outperforming or underperforming its sector." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CAGR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CAGR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Calculation Type</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button type="button" onClick={() => { setMode("cagr"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "cagr" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find CAGR</button>
                  <button type="button" onClick={() => { setMode("future"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "future" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Future Value</button>
                  <button type="button" onClick={() => { setMode("years"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "years" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Years</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="init-val" label="Initial Value" value={initialValue} onChange={setInitialValue} prefix="$" tooltip="Starting value of the investment or metric." />
                {mode !== "future" && (
                  <InputField id="final-val" label="Final Value" value={finalValue} onChange={setFinalValue} prefix="$" tooltip="Ending value of the investment or metric." />
                )}
                {mode !== "cagr" && (
                  <InputField id="cagr-rate" label="CAGR / Growth Rate" value={cagrRate} onChange={setCagrRate} suffix="%" tooltip="The assumed annual growth rate." />
                )}
                {mode !== "years" && (
                  <InputField id="years" label="Number of Years" value={years} onChange={setYears} tooltip="Time period in years for the investment." />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Results</h2>

                {results.mode === "cagr" && (
                  <>
                    <ResultDisplay items={[
                      { label: "CAGR", value: 0, textValue: `${results.cagr.toFixed(2)}%`, highlight: true },
                      { label: "Total Return", value: 0, textValue: `${results.totalReturn.toFixed(2)}%`, highlight: true },
                      { label: "Absolute Gain", value: results.absoluteGain },
                      { label: "Initial Value", value: results.IV },
                      { label: "Final Value", value: results.FV },
                      { label: "Period", value: 0, textValue: `${results.N} years` },
                    ]} />

                    {/* CAGR benchmark comparison */}
                    <div className="mt-4 p-4 rounded-lg bg-secondary/30 border border-border">
                      <h3 className="font-semibold text-foreground mb-2">CAGR Benchmark Comparison</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {[
                          { label: "US Inflation (avg)", rate: 3.5 },
                          { label: "High-Yield Savings", rate: 4.5 },
                          { label: "S&P 500 (historical)", rate: 10.0 },
                          { label: "Your Investment", rate: results.cagr },
                        ].map((b) => (
                          <div key={b.label} className={`flex justify-between items-center p-2 rounded-md ${b.label === "Your Investment" ? "bg-accent/10 font-semibold" : ""}`}>
                            <span className="text-muted-foreground">{b.label}</span>
                            <span className={`font-medium ${b.rate >= results.cagr ? "text-muted-foreground" : "text-primary"}`}>{b.rate.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <PieChart
                        segments={[
                          { label: "Initial", value: results.IV, color: "hsl(211, 100%, 50%)" },
                          { label: "Gain", value: results.absoluteGain, color: "hsl(142, 71%, 45%)" },
                        ]}
                        size={180}
                      />
                    </div>

                    {results.yearlyData.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Year-by-Year Growth</h3>
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary text-foreground">
                                <th className="px-3 py-2 text-left font-medium">Year</th>
                                <th className="px-3 py-2 text-right font-medium">Portfolio Value</th>
                                <th className="px-3 py-2 text-right font-medium">Gain</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.yearlyData.map((row: any) => (
                                <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                                  <td className="px-3 py-2 text-muted-foreground">Year {row.year}</td>
                                  <td className="px-3 py-2 text-right font-medium">${row.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                                  <td className="px-3 py-2 text-right text-primary">${(row.value - results.IV).toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {results.mode === "future" && (
                  <>
                    <ResultDisplay items={[
                      { label: "Future Value", value: results.fv, highlight: true },
                      { label: "Total Gain", value: results.gain, highlight: true },
                      { label: "Total Return", value: 0, textValue: `${results.totalReturn.toFixed(2)}%` },
                      { label: "Initial Investment", value: results.IV },
                      { label: "CAGR Applied", value: 0, textValue: `${results.R}%` },
                      { label: "Period", value: 0, textValue: `${results.N} years` },
                    ]} />
                    {results.yearlyData.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Year-by-Year Projection</h3>
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary text-foreground">
                                <th className="px-3 py-2 text-left font-medium">Year</th>
                                <th className="px-3 py-2 text-right font-medium">Value</th>
                                <th className="px-3 py-2 text-right font-medium">Growth</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.yearlyData.map((row: any) => (
                                <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                                  <td className="px-3 py-2 text-muted-foreground">Year {row.year}</td>
                                  <td className="px-3 py-2 text-right font-medium">${row.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                                  <td className="px-3 py-2 text-right text-primary">{(((row.value - results.IV) / results.IV) * 100).toFixed(1)}%</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {results.mode === "years" && (
                  <ResultDisplay items={[
                    { label: "Years Required", value: 0, textValue: `${results.n.toFixed(2)} years`, highlight: true },
                    { label: "Months Required", value: 0, textValue: `${(results.n * 12).toFixed(1)} months`, highlight: true },
                    { label: "Initial Value", value: results.IV },
                    { label: "Target Value", value: results.FV },
                    { label: "Required CAGR", value: 0, textValue: `${results.R}%` },
                  ]} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is CAGR?</h2>
              <p>CAGR, or Compound Annual Growth Rate, is one of the most important metrics in finance and investing. It represents the rate at which an investment would have grown if it grew at a steady rate each year over the specified period. CAGR is a smoothed-out growth rate that eliminates the volatility of year-to-year returns, making it ideal for comparing investments across different time horizons.</p>
              <p>Unlike simple average annual return, CAGR accounts for the compounding effect — meaning it reflects the actual end-to-end performance of an investment including the reinvestment of gains. This makes it the preferred metric for evaluating mutual funds, stocks, business revenue growth, and any metric that changes over time.</p>

              <h2>The CAGR Formula</h2>
              <p>The CAGR formula is: <strong>CAGR = [(Final Value / Initial Value)^(1/n) − 1] × 100</strong>, where n is the number of years.</p>
              <p>To find the future value using a known CAGR: <strong>FV = PV × (1 + CAGR/100)^n</strong></p>
              <p>To find years required at a given CAGR: <strong>n = log(FV/PV) / log(1 + CAGR/100)</strong></p>

              <h2>How to Use This CAGR Calculator</h2>
              <p>Use Find CAGR mode when you know both the starting and ending values and want to determine the implied annual growth rate. Use Find Future Value to project what an investment will be worth at a given CAGR over a number of years. Use Find Years to determine how long it will take to reach a target value at a specific growth rate. Each mode provides a year-by-year breakdown table for full transparency.</p>

              <h2>Real-World CAGR Examples</h2>
              <p>Apple's revenue grew from approximately $65 billion in 2010 to $394 billion in 2022, a 12-year CAGR of about 15.6%. Amazon's stock price went from around $2 in 2001 to $3,400 in 2021 (before splits), a 20-year CAGR of approximately 38%. The S&P 500 index has delivered a historical CAGR of approximately 10% annually including dividends, making it the standard benchmark for equity investment performance.</p>

              <h2>CAGR vs Simple Average Return</h2>
              <p>Consider a fund that returned: +50% in Year 1, −33% in Year 2. Simple average = (+50 − 33)/2 = 8.5% — sounds great! But CAGR = [(1.5 × 0.67)^(1/2) − 1] × 100 = 0% — the investment broke even. CAGR reveals the true picture because it accounts for the compounding effect of losses and gains. Always compare investments using CAGR, not simple averages.</p>

              <h2>Tips for Interpreting CAGR</h2>
              <p>A higher CAGR doesn't always mean a better investment — consider risk and volatility too. Compare CAGR to a relevant benchmark (e.g., S&P 500 for equity funds). A fund with a 15% CAGR but extreme volatility may be riskier than one with a 12% CAGR and smooth growth. Also note that CAGR is backward-looking — past performance doesn't guarantee future results. Use CAGR alongside Sharpe ratio and maximum drawdown for a complete picture of investment quality.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cagr-calculator" />
          <PopularCalculators exclude="/calculator/cagr-calculator" />
        </div>
      </div>
    </>
  );
};

export default CAGRCalculator;

