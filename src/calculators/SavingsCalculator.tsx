"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import PieChart from "@/components/calculator/PieChart";
import { RotateCcw } from "lucide-react";

const SavingsCalculator = () => {
  const [initialDeposit, setInitialDeposit] = useState("5000");
  const [monthlyContribution, setMonthlyContribution] = useState("500");
  const [annualRate, setAnnualRate] = useState("7");
  const [years, setYears] = useState("20");
  const [compoundFreq, setCompoundFreq] = useState<"12" | "4" | "2" | "1" | "365">("12");
  const [inflationRate, setInflationRate] = useState("3");
  const [showInflation, setShowInflation] = useState(false);

  const [results, setResults] = useState<any>(null);
  const freqLabels: Record<string, string> = {
    "365": "Daily",
    "12": "Monthly",
    "4": "Quarterly",
    "2": "Semi-Annual",
    "1": "Annual",
  };

  useEffect(() => { handleCalculate(); }, []);

  const handleCalculate = () => {
    const P = parseFloat(initialDeposit) || 0;
    const PMT = parseFloat(monthlyContribution) || 0;
    const r = parseFloat(annualRate) || 0;
    const t = parseFloat(years) || 0;
    const n = parseInt(compoundFreq) || 12;
    const inf = parseFloat(inflationRate) || 0;

    const rn = r / 100 / n;
    const periods = n * t;

    // Future value of initial deposit
    const fvInitial = P * Math.pow(1 + rn, periods);

    // Future value of regular contributions (per period, annuity formula)
    const contributionPerPeriod = PMT * (12 / n); // convert monthly contribution to per-period
    const fvContributions = rn > 0
      ? contributionPerPeriod * ((Math.pow(1 + rn, periods) - 1) / rn)
      : contributionPerPeriod * periods;

    const totalSavings = fvInitial + fvContributions;
    const totalContributions = P + PMT * 12 * t;
    const interestEarned = totalSavings - totalContributions;
    const inflationAdjusted = totalSavings / Math.pow(1 + inf / 100, t);

    // Year-by-year data
    const yearlyData = Array.from({ length: Math.ceil(t) }, (_, i) => {
      const yr = i + 1;
      const p = n * yr;
      const fvI = P * Math.pow(1 + rn, p);
      const fvC = rn > 0
        ? contributionPerPeriod * ((Math.pow(1 + rn, p) - 1) / rn)
        : contributionPerPeriod * p;
      const total = fvI + fvC;
      const contrib = P + PMT * 12 * yr;
      return { year: yr, total, contributions: contrib, interest: total - contrib };
    });

    setResults({
      totalSavings, totalContributions, interestEarned,
      inflationAdjusted, fvInitial, fvContributions,
      yearlyData, t,
    });
  };

  const reset = () => {
    setInitialDeposit("5000"); setMonthlyContribution("500");
    setAnnualRate("7"); setYears("20");
    setCompoundFreq("12"); setInflationRate("3");
    setShowInflation(false); setResults(null);
    setTimeout(() => handleCalculate(), 0);
  };

  const faqs = [
    { question: "How is savings growth calculated?", answer: "Savings growth uses compound interest with regular contributions. The future value formula for regular deposits is: FV = P(1+r/n)^(nt) + PMT × [((1+r/n)^(nt) − 1) / (r/n)], where P is initial principal, r is annual rate, n is compounding frequency, t is years, and PMT is contribution per period. Our calculator applies this formula with year-by-year breakdowns." },
    { question: "What is compound interest and why does it matter for savings?", answer: "Compound interest means you earn interest on your original principal AND on all the interest you've previously earned. Over long periods, this creates exponential growth. For example, $5,000 growing at 7% annually for 20 years becomes $19,348 from compounding alone — nearly 4× without adding a single extra dollar. Regular contributions amplify this effect dramatically." },
    { question: "What compounding frequency should I choose?", answer: "Most savings accounts and investments compound monthly or daily. Daily compounding gives slightly more growth than monthly, which gives more than annual. The difference is small: $10,000 at 5% for 10 years compounds to $16,470 (annual), $16,534 (monthly), or $16,553 (daily). Choose the frequency that matches your actual account's terms." },
    { question: "How much should I save per month?", answer: "A common guideline is to save 15–20% of your gross income. For retirement specifically, financial planners often recommend saving enough to replace 70–80% of your pre-retirement income. Use our calculator to work backward from your savings goal: enter the target amount as the final value and try different monthly contribution amounts to find what's needed." },
    { question: "What rate of return is realistic for savings?", answer: "Realistic rates of return depend on the investment type: high-yield savings accounts (4–5%), CDs (4–5%), bonds (3–6%), balanced mutual funds (6–8%), equity index funds (8–10% historically). These are nominal rates; inflation (averaging 3% historically) reduces the real purchasing power of returns." },
    { question: "What is the Rule of 72?", answer: "The Rule of 72 is a quick way to estimate how long it takes to double your money. Divide 72 by the annual interest rate: at 6%, your money doubles in approximately 72/6 = 12 years. At 9%, it doubles in 8 years. This rule works well for rates between 6% and 12% and helps you quickly evaluate different investment scenarios." },
    { question: "How does inflation affect my savings?", answer: "Inflation erodes the purchasing power of your savings over time. If inflation averages 3% annually and your savings earn 7%, your real rate of return is approximately 7% − 3% = 4%. Over 20 years at 3% inflation, $500,000 in future savings has the purchasing power of only about $277,000 in today's dollars. Our calculator shows the inflation-adjusted value of your savings." },
    { question: "Should I pay off debt or save?", answer: "If your debt carries a higher interest rate than your expected investment returns, paying off debt first is mathematically optimal. Credit card debt at 20% APR costs more than any realistic investment return. However, if your employer offers a 401(k) match, always contribute enough to capture the full match first — that's a guaranteed 50–100% instant return on your contribution." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Savings Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <InputField id="init-deposit" label="Initial Deposit" value={initialDeposit} onChange={setInitialDeposit} prefix="$" />
                <InputField id="monthly-contrib" label="Monthly Contribution" value={monthlyContribution} onChange={setMonthlyContribution} prefix="$" />
                <InputField id="annual-rate" label="Annual Interest Rate" value={annualRate} onChange={setAnnualRate} suffix="%" />
                <InputField id="years" label="Time Period (Years)" value={years} onChange={setYears} />
                <div>
                  <label className="flex items-center text-sm font-medium text-foreground mb-1">Compounding Frequency</label>
                  <select value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value as any)} className="input-calc" aria-label="Compounding frequency">
                    {Object.entries(freqLabels).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    id="show-inflation"
                    type="checkbox"
                    checked={showInflation}
                    onChange={(e) => setShowInflation(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="show-inflation" className="text-sm font-medium text-foreground">Adjust for inflation</label>
                </div>
                {showInflation && (<>

                  <InputField id="inflation-rate" label="Inflation Rate" value={inflationRate} onChange={setInflationRate} suffix="%" />
                
</>)}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Savings</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && (<>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <h2 className="text-xl font-bold mb-4">Your Savings Projection</h2>

                <ResultDisplay items={[
                  { label: "Total Savings", value: results.totalSavings, highlight: true },
                  { label: "Interest Earned", value: results.interestEarned, highlight: true },
                  { label: "Total Contributions", value: results.totalContributions },
                  { label: "From Initial Deposit", value: results.fvInitial },
                  { label: "From Monthly Savings", value: results.fvContributions },
                  ...(showInflation ? [{ label: "Inflation-Adjusted Value", value: results.inflationAdjusted }] : []),
                ]} />

                <div className="mt-6 flex justify-center">
                  <PieChart
                    segments={[
                      { label: "Contributions", value: results.totalContributions, color: "hsl(211, 100%, 50%)" },
                      { label: "Interest Earned", value: results.interestEarned, color: "hsl(142, 71%, 45%)" },
                    ]}
                    size={180}
                  />
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Year-by-Year Savings Growth</h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary text-foreground">
                          <th className="px-3 py-2 text-left font-medium">Year</th>
                          <th className="px-3 py-2 text-right font-medium">Total Saved</th>
                          <th className="px-3 py-2 text-right font-medium">Contributions</th>
                          <th className="px-3 py-2 text-right font-medium">Interest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.yearlyData.map((row: any) => (
                          <tr key={row.year} className="border-t border-border hover:bg-secondary/30">
                            <td className="px-3 py-2 text-muted-foreground">Year {row.year}</td>
                            <td className="px-3 py-2 text-right font-medium">${row.total.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                            <td className="px-3 py-2 text-right">${row.contributions.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                            <td className="px-3 py-2 text-right text-primary">${row.interest.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              
              </div>
            
</>)}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>What Is a Savings Calculator?</h2>
              <p>A savings calculator projects how much money you'll accumulate over time based on your initial deposit, regular contributions, interest rate, and compounding frequency. It's an essential planning tool for anyone building an emergency fund, saving for a down payment, funding a college education, or growing long-term wealth.</p>
              <p>Our advanced savings calculator goes beyond basic projections by including compounding frequency options (daily, monthly, quarterly, annually), optional inflation adjustment to show real purchasing power, and a complete year-by-year breakdown table that reveals exactly how compound interest and regular savings work together over time.</p>

              <h2>How Savings Growth Is Calculated</h2>
              <p>Savings growth uses the future value formula for compound interest with regular contributions. The total future value is the sum of two parts:</p>
              <ul>
                <li><strong>Initial deposit growth:</strong> FV = P × (1 + r/n)^(n×t), where P is principal, r is annual rate, n is compounds per year, and t is years</li>
                <li><strong>Regular contribution growth:</strong> FV = PMT × [((1 + r/n)^(n×t) − 1) / (r/n)], where PMT is the contribution per compounding period</li>
              </ul>
              <p>The total future value is the sum of these two components. The interest earned is the difference between the total future value and all contributions made (initial + regular).</p>

              <h2>How to Use This Calculator</h2>
              <p>Enter your initial deposit (can be $0 if starting fresh), your planned monthly contribution, the expected annual interest rate, and how many years you'll save. Select the compounding frequency matching your account — most savings accounts and investments compound monthly. Enable inflation adjustment to see what your future balance is worth in today's purchasing power. Click Calculate to see your full savings projection with the year-by-year growth table.</p>

              <h2>The Power of Consistent Monthly Savings</h2>
              <p>Consider two investors: Investor A contributes $500/month starting at age 25. Investor B waits until age 35 to start. Both earn 7% annually and retire at 65. Investor A accumulates approximately $1.31 million. Investor B accumulates approximately $607,000 — less than half, despite only 10 fewer years of saving. The extra decade of compounding is worth over $700,000. Starting early is the single most powerful factor in savings accumulation.</p>

              <h2>Example Scenario</h2>
              <p>Emily wants to build a college fund for her newborn. She starts with $5,000 and adds $300/month to a 529 plan expecting 7% annual returns (monthly compounding). After 18 years: Initial deposit grows to $5,000 × (1.0058)^216 = $17,218. Monthly contributions grow to $300 × ((1.0058^216 − 1) / 0.0058) = $117,895. Total college fund: $135,113. Total contributions: $5,000 + ($300 × 216) = $69,800. Interest earned: $65,313 — nearly matching the total contributions.</p>

              <h2>Savings Tips to Maximize Growth</h2>
              <p>Automate contributions so you save before spending. Take advantage of tax-advantaged accounts (401k, Roth IRA, 529) to keep more of your returns. Reinvest all interest and dividends to maximize compound growth. Increase contributions by 1% each year or with every raise. Consider high-yield savings accounts (currently 4–5%) versus traditional banks (0.01–0.5%) — the difference is enormous over time. Keep emergency savings in liquid accounts; invest longer-term savings in diversified portfolios for better growth.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/savings-calculator" />
          <PopularCalculators exclude="/calculator/savings-calculator" />
        </div>
      </div>
    </>
  );
};

export default SavingsCalculator;


