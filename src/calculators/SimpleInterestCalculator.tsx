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

const SimpleInterestCalculator = () => {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("5");
  const [time, setTime] = useState("3");
  const [timeUnit, setTimeUnit] = useState<"years" | "months" | "days">("years");
  const [mode, setMode] = useState<"calculate" | "find-rate" | "find-time">("calculate");

  // Mode: find-rate
  const [knownInterest, setKnownInterest] = useState("1500");
  // Mode: find-time
  const [targetInterest, setTargetInterest] = useState("1500");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(principal) || 0;
    const R = parseFloat(rate) || 0;
    const rawTime = parseFloat(time) || 0;

    // Convert time to years
    const T = timeUnit === "years" ? rawTime : timeUnit === "months" ? rawTime / 12 : rawTime / 365;

    if (mode === "calculate") {
      const SI = P * R * T / 100;
      const totalAmount = P + SI;
      const dailyInterest = SI / (T * 365);
      const monthlyInterest = SI / (T * 12);

      setResults({
        mode,
        SI,
        totalAmount,
        principal: P,
        rate: R,
        time: T,
        rawTime,
        timeUnit,
        dailyInterest,
        monthlyInterest,
        // Year-by-year
        yearlyData: Array.from({ length: Math.ceil(T) }, (_, i) => {
          const yr = Math.min(i + 1, T);
          const interest = P * R * yr / 100;
          return { year: i + 1, interest, total: P + interest };
        }),
      });
    } else if (mode === "find-rate") {
      const I = parseFloat(knownInterest) || 0;
      const rateCalc = (I * 100) / (P * T);
      setResults({ mode, rateCalc, principal: P, interest: I, time: T });
    } else {
      const I = parseFloat(targetInterest) || 0;
      const timeCalc = (I * 100) / (P * R);
      setResults({ mode, timeCalc, principal: P, interest: I, rate: R });
    }
  };

  const reset = () => {
    setShowResults(false);
    setPrincipal("10000"); setRate("5"); setTime("3");
    setTimeUnit("years"); setMode("calculate");
    setKnownInterest("1500"); setTargetInterest("1500");
    setResults(null);
  };

  const faqs = [
    { question: "What is simple interest?", answer: "Simple interest is a method of calculating interest where the interest is earned only on the original principal, not on any accumulated interest. It's calculated using the formula SI = P × R × T / 100, where P is principal, R is the annual interest rate, and T is the time period in years. Simple interest is commonly used for short-term loans, car loans, and some savings accounts." },
    { question: "What is the difference between simple and compound interest?", answer: "Simple interest is calculated only on the original principal, while compound interest is calculated on the principal plus previously accumulated interest ('interest on interest'). For the same principal, rate, and time, compound interest always generates more growth than simple interest. Over long periods, the difference can be enormous due to the compounding effect." },
    { question: "What is the simple interest formula?", answer: "The simple interest formula is: SI = (P × R × T) / 100, where SI = Simple Interest, P = Principal (initial amount), R = Annual Interest Rate (%), and T = Time in years. To find the total amount including principal: A = P + SI = P(1 + RT/100)." },
    { question: "How do I calculate monthly simple interest?", answer: "For monthly simple interest, convert the time to years by dividing months by 12. For example, for 6 months, T = 6/12 = 0.5 years. Then apply the formula: SI = P × R × 0.5 / 100. Alternatively, divide the annual rate by 12 to get the monthly rate and multiply by the number of months." },
    { question: "What types of loans use simple interest?", answer: "Simple interest is commonly used in: short-term personal loans, car loans (installment loans), some payday loans, US savings bonds, student loans during the grace period, and certificates of deposit. Most credit cards and mortgages use compound interest, which is more expensive for borrowers." },
    { question: "Can I calculate the principal from simple interest?", answer: "Yes. If you know the interest amount, rate, and time, you can find the principal: P = (SI × 100) / (R × T). For example, if you earned $300 in simple interest at 5% annual rate over 2 years, the principal was P = (300 × 100) / (5 × 2) = $3,000." },
    { question: "What is the rule of 72 for simple interest?", answer: "The Rule of 72 is primarily used for compound interest to estimate doubling time. For simple interest, the calculation is simpler: time to double = 100 / R years. At 5% simple interest, it takes 100/5 = 20 years to double your money. With compound interest at 5%, it takes only about 14.4 years (72/5)." },
    { question: "How does time unit affect simple interest calculations?", answer: "Time must always be expressed in years for the standard simple interest formula. If your time is in months, divide by 12. If in days, divide by 365 (or 360 for some financial calculations). Our calculator handles all these conversions automatically, so you can enter time in years, months, or days." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Simple Interest Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Simple Interest Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate simple interest (SI = P×R×T/100), total amount, daily/monthly breakdown, and find unknown rate or time. Includes year-by-year growth table.</p>

            <div className="card-calculator mb-8">
              {/* Mode Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-1.5">Calculate</label>
                <div className="flex rounded-lg border border-input overflow-hidden">
                  <button type="button" onClick={() => { setMode("calculate"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "calculate" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Simple Interest</button>
                  <button type="button" onClick={() => { setMode("find-rate"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "find-rate" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Rate</button>
                  <button type="button" onClick={() => { setMode("find-time"); setResults(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === "find-time" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Find Time</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="principal" label="Principal Amount" value={principal} onChange={setPrincipal} prefix="$" tooltip="The initial amount of money borrowed or invested." />

                {mode !== "find-rate" && (
                  <InputField id="rate" label="Annual Interest Rate" value={rate} onChange={setRate} suffix="%" tooltip="The yearly interest rate applied to the principal." />
                )}
                {mode === "find-rate" && (
                  <InputField id="known-interest" label="Interest Earned/Paid" value={knownInterest} onChange={setKnownInterest} prefix="$" tooltip="The total interest earned or paid." />
                )}

                {mode !== "find-time" && (
                  <div>
                    <label className="flex items-center text-sm font-medium text-foreground mb-1.5">Time Period</label>
                    <div className="flex gap-2">
                      <input
                        id="time"
                        type="number"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="input-calc flex-1"
                        min="0"
                        step="0.5"
                        aria-label="Time period"
                      />
                      <select
                        value={timeUnit}
                        onChange={(e) => setTimeUnit(e.target.value as any)}
                        className="input-calc w-auto"
                        aria-label="Time unit"
                      >
                        <option value="years">Years</option>
                        <option value="months">Months</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>
                )}
                {mode === "find-time" && (
                  <InputField id="target-interest" label="Target Interest" value={targetInterest} onChange={setTargetInterest} prefix="$" tooltip="The total interest you want to earn or pay." />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Results</h2>

                {results.mode === "calculate" && (
                  <>
                    <ResultDisplay items={[
                      { label: "Simple Interest", value: results.SI, highlight: true },
                      { label: "Total Amount", value: results.totalAmount, highlight: true },
                      { label: "Principal", value: results.principal },
                      { label: "Daily Interest", value: results.dailyInterest },
                      { label: "Monthly Interest", value: results.monthlyInterest },
                    ]} />

                    <div className="mt-6 flex justify-center">
                      <PieChart
                        segments={[
                          { label: "Principal", value: results.principal, color: "hsl(211, 100%, 50%)" },
                          { label: "Interest", value: results.SI, color: "hsl(220, 60%, 30%)" },
                        ]}
                        size={180}
                      />
                    </div>

                    {results.yearlyData.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Year-by-Year Interest Growth</h3>
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-secondary text-foreground">
                                <th className="px-3 py-2 text-left font-medium">Year</th>
                                <th className="px-3 py-2 text-right font-medium">Interest Earned</th>
                                <th className="px-3 py-2 text-right font-medium">Total Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.yearlyData.map((row: any) => (
                                <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                                  <td className="px-3 py-2 text-muted-foreground">Year {row.year}</td>
                                  <td className="px-3 py-2 text-right text-primary">${row.interest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                  <td className="px-3 py-2 text-right font-medium">${row.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {results.mode === "find-rate" && (
                  <ResultDisplay items={[
                    { label: "Annual Interest Rate", value: 0, textValue: `${results.rateCalc.toFixed(4)}%`, highlight: true },
                    { label: "Principal", value: results.principal },
                    { label: "Interest Amount", value: results.interest },
                    { label: "Time (years)", value: 0, textValue: `${results.time.toFixed(2)} years` },
                  ]} />
                )}

                {results.mode === "find-time" && (
                  <ResultDisplay items={[
                    { label: "Time Required", value: 0, textValue: `${results.timeCalc.toFixed(2)} years`, highlight: true },
                    { label: "Time in Months", value: 0, textValue: `${(results.timeCalc * 12).toFixed(1)} months`, highlight: true },
                    { label: "Principal", value: results.principal },
                    { label: "Target Interest", value: results.interest },
                  ]} />
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>What Is a Simple Interest Calculator?</h2>
              <p>A simple interest calculator computes the interest earned or owed on a principal amount over a given time period at a fixed interest rate. Unlike compound interest, simple interest is calculated only on the original principal — it does not include interest on previously accrued interest. This makes it the most straightforward interest calculation method and is used for many types of short-term loans and savings instruments.</p>
              <p>Our advanced calculator goes beyond basic SI calculation by offering three modes: standard interest calculation, finding the unknown interest rate, and determining how long to reach a target interest amount. It also provides daily and monthly interest breakdowns alongside a year-by-year growth table.</p>

              <h2>The Simple Interest Formula</h2>
              <p>The standard simple interest formula is:</p>
              <p><strong>SI = (P × R × T) / 100</strong></p>
              <p>Where:</p>
              <ul>
                <li><strong>SI</strong> = Simple Interest (the interest amount earned or paid)</li>
                <li><strong>P</strong> = Principal (the original sum of money)</li>
                <li><strong>R</strong> = Annual Interest Rate (expressed as a percentage)</li>
                <li><strong>T</strong> = Time (in years)</li>
              </ul>
              <p>The total amount (principal + interest) is: <strong>A = P + SI = P(1 + RT/100)</strong></p>

              <h2>How to Use This Calculator</h2>
              <p>In Standard mode, enter your principal, annual interest rate, and time period. Select whether time is in years, months, or days — the calculator automatically converts to years. In Find Rate mode, enter the principal, time, and interest already earned to calculate the implied rate. In Find Time mode, enter principal, rate, and target interest to discover how long you need to wait.</p>

              <h2>Simple Interest vs Compound Interest</h2>
              <p>Simple interest and compound interest both measure how money grows over time, but they differ fundamentally in how interest accumulates. With simple interest at 5% on $10,000 for 5 years, you earn exactly $2,500 total ($500/year). With compound interest at 5% annually on the same principal for 5 years, you earn $2,762.82 — because each year, the interest from previous years also earns interest.</p>
              <p>For short periods (under 2 years) and smaller amounts, the difference is relatively minor. Over long periods (10–30 years), compound interest dramatically outperforms simple interest — which is why it's preferred for long-term investments and savings accounts.</p>

              <h2>Example Scenario</h2>
              <p>Sarah invests $15,000 in a fixed deposit that offers 6.5% simple interest per annum for 4 years. Using the formula: SI = ($15,000 × 6.5 × 4) / 100 = $3,900. At the end of 4 years, she receives $15,000 + $3,900 = $18,900. Her monthly interest income is $3,900 ÷ 48 months = $81.25/month. This is a predictable, guaranteed return useful for conservative investors or emergency funds.</p>

              <h2>When Is Simple Interest Used?</h2>
              <p>Simple interest is used in: short-term personal loans and payday loans, car loans (amortized loans often use simple interest), some savings bonds and treasury notes, bank overdrafts and short-term credit lines, education loans during the moratorium period in India, and trade credit between businesses. Understanding simple interest helps you evaluate loan offers more accurately and compare different investment products.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/simple-interest-calculator" />
            <PopularCalculators exclude="/calculator/simple-interest-calculator" />
          </div>

          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SimpleInterestCalculator;

