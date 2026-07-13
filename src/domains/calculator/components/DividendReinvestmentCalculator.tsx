"use client";
import { RotateCcw, TrendingUp, RefreshCw, Calculator, BarChart3 } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import InputField from "@/domains/calculator/components/ui/InputField";
const DividendReinvestmentCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("10000");
  const [annualContribution, setAnnualContribution] = useState("5000");
  const [dividendYield, setDividendYield] = useState("3.5");
  const [annualGrowth, setAnnualGrowth] = useState("6.0");
  const [years, setYears] = useState("20");
  const [reinvest, setReinvest] = useState(true);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    let balance = parseFloat(initialInvestment) || 0;
    const contribution = parseFloat(annualContribution) || 0;
    const yieldRate = (parseFloat(dividendYield) || 0) / 100;
    const growthRate = (parseFloat(annualGrowth) || 0) / 100;
    const numYears = parseInt(years) || 0;

    let totalDividends = 0;
    let totalContributions = balance;
    const yearData = [];

    for (let i = 1; i <= numYears; i++) {
      const yearStartBalance = balance;
      
      // Annual Growth (Price appreciation)
      balance = balance * (1 + growthRate);
      
      // Dividend Calculation
      const annualDividend = yearStartBalance * yieldRate;
      totalDividends += annualDividend;
      
      if (reinvest) {
        balance += annualDividend;
      }
      
      // Add contribution at the end of the year
      balance += contribution;
      totalContributions += contribution;

      yearData.push({
        year: i,
        balance,
        dividends: annualDividend
      });
    }

    setResults({
      finalBalance: balance,
      totalDividends,
      totalContributions,
      totalGain: balance - totalContributions,
      yearData
    });
  };

  const reset = () => {
    setInitialInvestment("10000");
    setAnnualContribution("5000");
    setDividendYield("3.5");
    setAnnualGrowth("6.0");
    setYears("20");
    setReinvest(true);
  };

  const faqs = [
    {
      question: "What is DRIP (Dividend Reinvestment Plan)?",
      answer: "A Dividend Reinvestment Plan (DRIP) is a program that allows investors to automatically reinvest their cash dividends into additional shares or fractional shares of the underlying stock on the dividend payment date."
    },
    {
      question: "Why is reinvesting dividends so powerful?",
      answer: "Reinvesting dividends leverages the power of compound interest. Instead of taking the cash, you buy more shares, which in turn generate their own dividends. Over long periods, reinvested dividends can account for a massive portion of a stock's total return."
    },
    {
      question: "Is there a tax on reinvested dividends?",
      answer: "In a standard taxable brokerage account, you are generally required to pay income tax on dividends in the year they are received, even if you reinvest them. However, in an IRA or 401(k), dividends can grow tax-free until withdrawal."
    },
    {
      question: "What is 'Yield on Cost'?",
      answer: "Yield on Cost is the annual dividend rate divided by your original purchase price. As companies increase their dividends over time, your yield on cost can grow to 10%, 20%, or even 50% of your initial investment."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dividend Reinvestment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dividend Reinvestment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <TrendingUp className="h-5 w-5 text-primary" /> Investment Strategy
                  </h2>
                  <InputField id="initial" label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} prefix="$" />
                  <InputField id="contribution" label="Annual Contribution" value={annualContribution} onChange={setAnnualContribution} prefix="$" />
                  <InputField id="years" label="Investment Period" value={years} onChange={setYears} suffix="years" />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <RefreshCw className="h-5 w-5 text-primary" /> Yield & Growth
                  </h2>
                  <InputField id="yield" label="Annual Dividend Yield (%)" value={dividendYield} onChange={setDividendYield} suffix="%" step="0.1" />
                  <InputField id="growth" label="Annual Price Growth (%)" value={annualGrowth} onChange={setAnnualGrowth} suffix="%" step="0.1" />
                  <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-xl border border-border">
                    <input type="checkbox" id="reinvest" checked={reinvest} onChange={(e) => setReinvest(e.target.checked)} className="w-5 h-5 accent-primary" />
                    <label htmlFor="reinvest" className="text-sm font-bold text-foreground cursor-pointer">Reinvest Dividends (DRIP)</label>
                  </div>
                </section>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-10">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Ending Portfolio Value</p>
                    <p className="text-6xl font-black text-foreground">${Math.round(results.finalBalance).toLocaleString()}</p>
                    <p className="text-xs text-primary mt-2 font-bold uppercase tracking-widest">After {years} Years</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-10">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Dividends Earned</p>
                    <p className="text-6xl font-black text-foreground">${Math.round(results.totalDividends).toLocaleString()}</p>
                    <p className="text-xs text-emerald-500 mt-2 font-bold uppercase tracking-widest">{reinvest ? 'All Reinvested' : 'Cash Received'}</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-2xl font-bold mb-3">
                    <BarChart3 className="h-5 w-5 text-primary" /> Performance Summary
                  </h2>
                  <div className="mb-8">
                     <div className="flex justify-between text-sm font-bold mb-2">
                        <span>Portfolio Composition</span>
                        <span>100%</span>
                     </div>
                     <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${(results.totalContributions / results.finalBalance) * 100}%` }}></div>
                        <div className="h-full bg-emerald-500" style={{ width: `${(results.totalGain / results.finalBalance) * 100}%` }}></div>
                     </div>
                     <div className="flex gap-4 mt-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Total Invested</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Total Growth & Divs</div>
                     </div>
                  </div>
                  <ResultDisplay items={[
                    { label: "Total Contributions", value: results.totalContributions },
                    { label: "Total Capital Gains", value: results.finalBalance - results.totalContributions - (reinvest ? results.totalDividends : 0) },
                    { label: "Cumulative Dividend Income", value: results.totalDividends },
                    { label: "Total Return (%)", value: 0, textValue: `${((results.finalBalance / results.totalContributions - 1) * 100).toFixed(1)}%` },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Power of Dividend Reinvestment (DRIP)</h2>
              <p>For long-term investors, dividends are not just "pocket money"—they are the fuel that drives the engine of compound interest. When you reinvest dividends, you are using the cash generated by your assets to buy more of those same assets, creating a virtuous cycle of wealth creation.</p>

              <h3>What is a DRIP?</h3>
              <p>A Dividend Reinvestment Plan (DRIP) allows you to automatically purchase more shares of a stock or ETF using the dividends that the investment pays out. Instead of the cash sitting in your brokerage account, it is immediately put back to work. Most major brokerages (like Fidelity, Schwab, and Vanguard) offer this service for free, often allowing you to buy "fractional shares" if the dividend isn't enough to buy a full share.</p>

              <h3>Why DRIP Outperforms Cash</h3>
              <p>Historically, dividends have accounted for a significant portion of the S&P 500's total return. Between 1930 and 2023, approximately 40% of the total return of the S&P 500 came from reinvested dividends. By taking the cash instead of reinvesting, you are missing out on the exponential growth of those additional shares.</p>

              <h3>The "Snowball Effect"</h3>
              <p>Imagine you own 100 shares of a company that pays a $1 dividend per share.
              - **Year 1:** You get $100. You buy 2 more shares.
              - **Year 2:** You now have 102 shares. You get $102 in dividends. You buy more shares.
              Over 20 or 30 years, this "snowball" grows larger and larger. By the time you retire, your dividend income alone might be enough to cover your living expenses without you ever having to sell a single share.</p>

              <h3>Tax Considerations</h3>
              <p>It is important to remember that in a taxable brokerage account, you generally owe taxes on dividends in the year they are paid, even if you never see the cash because it was reinvested. To maximize the power of DRIP, many investors prefer to hold dividend-paying stocks in tax-advantaged accounts like a **Roth IRA** or **401(k)**, where the dividends can be reinvested and grow tax-free for decades.</p>

              <h3>When Should You Stop Reinvesting?</h3>
              <p>Reinvesting is the best strategy during your "accumulation phase"—the years when you are working and building wealth. Once you reach retirement (the "distribution phase"), you may want to turn off the DRIP and start taking the dividends as cash to supplement your Social Security or pension income.</p>

              <h2 className="text-2xl font-bold mb-3">How to Start Reinvesting</h2>
              <ol>
                <li><strong>Check your Brokerage:</strong> Look for a setting usually labeled "Dividend Reinvestment" or "DRIP."</li>
                <li><strong>Select your Assets:</strong> You can often choose to reinvest dividends for all your stocks or just specific ones.</li>
                <li><strong>Monitor your Basis:</strong> Your brokerage will track the "cost basis" of every reinvested share, which is important for calculating capital gains taxes when you eventually sell.</li>
              </ol>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dividend-reinvestment-calculator" />
          <PopularCalculators exclude="/calculator/dividend-reinvestment-calculator" />
        </div>
      </div>
    </>
  );
};

export default DividendReinvestmentCalculator;

