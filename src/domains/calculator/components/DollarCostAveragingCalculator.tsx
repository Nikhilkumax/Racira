"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

export default function DollarCostAveragingCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState("500");
  const [initialInvestment, setInitialInvestment] = useState("5000");
  const [years, setYears] = useState("20");
  const [annualReturn, setAnnualReturn] = useState("10");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({ totalInvested: 0, finalValue: 0, totalGain: 0, cagr: 0, numInvestments: 0 });

  const handleCalculate = () => {
    const monthly = parseFloat(monthlyAmount) || 0;
    const initial = parseFloat(initialInvestment) || 0;
    const yrs = parseFloat(years) || 0;
    const r = (parseFloat(annualReturn) || 0) / 100 / 12;
    const n = yrs * 12;
    if (n === 0) return;

    const futureValueInitial = initial * Math.pow(1 + r, n);
    const futureValueMonthly = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) : monthly * n;
    const finalValue = futureValueInitial + futureValueMonthly;
    const totalInvested = initial + monthly * n;
    const totalGain = finalValue - totalInvested;
    const cagrCalc = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / yrs) - 1) * 100 : 0;

    setResults({ totalInvested, finalValue, totalGain, cagr: cagrCalc, numInvestments: n });
    setShowResults(true);
  };

  const reset = () => {
    setMonthlyAmount("500"); setInitialInvestment("5000"); setYears("20"); setAnnualReturn("10"); setShowResults(false);
  };

  const faqs = [
    { question: "What is Dollar Cost Averaging?", answer: "Dollar Cost Averaging (DCA) is an investment strategy where you invest a fixed amount of money at regular intervals regardless of market conditions. This reduces the impact of volatility by spreading purchases over time." },
    { question: "Does Dollar Cost Averaging work?", answer: "DCA is most effective in volatile markets because you buy more shares when prices are low and fewer when prices are high. Over long periods, this can result in a lower average cost per share than lump-sum investing during market peaks." },
    { question: "Is DCA better than lump-sum investing?", answer: "Research shows that lump-sum investing outperforms DCA approximately 2/3 of the time in markets that trend upward over time. However, DCA reduces the emotional risk of investing at a market top and provides a systematic, disciplined approach." },
    { question: "How often should I invest with DCA?", answer: "The most common DCA intervals are weekly, bi-weekly (matching a paycheck), or monthly. More frequent investments smooth out price fluctuations more, but transaction costs can eat into returns for smaller amounts." },
    { question: "Can I use DCA for crypto or other assets?", answer: "Yes. DCA can be applied to any volatile asset — stocks, ETFs, cryptocurrencies, or even real estate investment trusts. Many crypto platforms offer automatic recurring purchases specifically for DCA strategies." },
    { question: "Does DCA remove all market risk?", answer: "No. DCA reduces timing risk but doesn't eliminate market risk. If an asset permanently declines, DCA only means you bought more of a losing asset at multiple price points. Asset selection still matters enormously." },
    { question: "What is the difference between DCA and value averaging?", answer: "In value averaging, you adjust the amount invested each period so that your portfolio grows to a predefined value target. You invest more when markets fall and less (or sell) when markets rise — a more complex but potentially more profitable approach." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Dollar Cost Averaging Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dollar Cost Averaging (DCA) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="initial" label="Initial Investment ($)" value={initialInvestment} onChange={setInitialInvestment} prefix="$" tooltip="Lump sum invested at the start of the period." />
                <InputField id="monthly" label="Monthly Investment ($)" value={monthlyAmount} onChange={setMonthlyAmount} prefix="$" tooltip="Fixed amount added to the investment each month." />
                <InputField id="years" label="Investment Period (Years)" value={years} onChange={setYears} tooltip="Total number of years to invest." />
                <InputField id="return" label="Expected Annual Return (%)" value={annualReturn} onChange={setAnnualReturn} suffix="%" tooltip="Expected average annual return. S&P 500 long-term average is ~10%." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && (
              <>
                <h2 className="text-2xl font-bold mb-3">DCA Investment Results</h2>
                <ResultDisplay items={[
                  { label: "Final Portfolio Value", value: results.finalValue, highlight: true },
                  { label: "Total Amount Invested", value: results.totalInvested },
                  { label: "Total Investment Gain", value: results.totalGain, highlight: true },
                  { label: "Effective CAGR", value: 0, textValue: `${results.cagr.toFixed(2)}%` },
                  { label: "Total # of Investments", value: 0, textValue: results.numInvestments.toString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is Dollar Cost Averaging?</h2>
              <p>Dollar Cost Averaging (DCA) is one of the most powerful — and psychologically comfortable — investment strategies available to individual investors. The concept is elegantly simple: invest a fixed dollar amount into a chosen asset at regular intervals (weekly, monthly, quarterly) regardless of what the market is doing. When prices are high, your fixed amount buys fewer shares. When prices are low, the same amount buys more shares. Over time, this results in a lower average cost per share than randomly timed purchases.</p>
              <h2 className="text-2xl font-bold mb-3">The Math Behind DCA</h2>
              <p>Consider investing $500 per month for 3 months in a stock. In Month 1, the stock costs $50, so you buy 10 shares. In Month 2, it drops to $40 and you buy 12.5 shares. In Month 3, it rises to $60 and you buy 8.33 shares. You've invested $1,500 and own 30.83 shares. The average price paid ($1,500 ÷ 30.83 = $48.66) is lower than the simple average of the three prices ($50).</p>
              <h2 className="text-2xl font-bold mb-3">The Power of Compound Interest Over Time</h2>
              <p>DCA's true power emerges when combined with the miracle of compound interest. A person investing $500 per month for 30 years at a 10% annual return doesn't just end up with the $180,000 they invested — they end up with over $1.1 million. The difference — over $920,000 — is entirely from investment gains compounding on themselves year after year. The earlier you start, the more dramatic the effect.</p>
              <h2 className="text-2xl font-bold mb-3">DCA vs. Lump Sum Investing</h2>
              <p>Academic research, including studies by Vanguard, consistently shows that lump-sum investing (investing all available capital immediately) outperforms DCA approximately two-thirds of the time in markets that trend upward over time. The rationale is simple: the longer your money is invested, the longer it can compound. However, DCA removes the stress of "what if I invest everything at the top?" and ensures consistent, disciplined investing behavior — which has its own enormous value.</p>
              <h2 className="text-2xl font-bold mb-3">Automating Your DCA Strategy</h2>
              <p>The most successful DCA practitioners automate their investments. By setting up automatic monthly transfers from your paycheck into a 401(k), IRA, or brokerage account, you eliminate the emotional component of investment decisions. You never have to agonize over whether "now is a good time" to invest. This "set it and forget it" approach is well-suited for busy professionals who want long-term wealth building without constant market monitoring.</p>
              <h2 className="text-2xl font-bold mb-3">DCA During Market Downturns</h2>
              <p>Market downturns are where DCA truly shines. While a lump-sum investor who put everything in at the peak watches their portfolio decline, a DCA investor continues buying at lower and lower prices, accumulating more shares for the same monthly dollar amount. When the inevitable recovery occurs, the DCA investor has a larger share count and often recovers their losses — and then some — much faster than the lump-sum investor who timed the market badly.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dollar-cost-averaging-calculator" />
          <PopularCalculators exclude="/calculator/dollar-cost-averaging-calculator" />
        </div>
      </div>
    </>
  );
}
