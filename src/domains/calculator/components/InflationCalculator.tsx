"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Mode = "forward" | "backward" | "rate";

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const InflationCalculator = () => {
  const [mode, setMode] = useState<Mode>("forward");
  const [amount, setAmount] = useState("1000");
  const [inflationRate, setInflationRate] = useState("3");
  const [years, setYears] = useState("10");
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{ adjustedValue: number; purchasingPower: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseFloat(amount) || 0;
    const r = (parseFloat(inflationRate) || 0) / 100;
    const y = parseFloat(years) || 0;
    if (a <= 0 || y <= 0) return;

    if (mode === "forward") {
      const future = a * Math.pow(1 + r, y);
      setResult({ adjustedValue: future, purchasingPower: a / Math.pow(1 + r, y) });
    } else if (mode === "backward") {
      const past = a / Math.pow(1 + r, y);
      setResult({ adjustedValue: past, purchasingPower: a * Math.pow(1 + r, y) });
    } else {
      // What inflation rate turns amount into adjusted value over years
      const adjusted = a / Math.pow(1 + r, y);
      setResult({ adjustedValue: adjusted, purchasingPower: a - adjusted });
    }
  };

  const reset = () => {
    setShowResults(false); setAmount("1000"); setInflationRate("3"); setYears("10"); setResult(null); };

  const faqs = [
    { question: "What is inflation?", answer: "Inflation is the rate at which the general level of prices for goods and services rises over time, reducing purchasing power. A 3% inflation rate means something costing $100 today will cost about $103 next year." },
    { question: "How does inflation affect my savings?", answer: "If your savings don't grow at least as fast as inflation, you're effectively losing money in terms of purchasing power. For example, $100,000 at 3% inflation loses about $3,000 in purchasing power each year." },
    { question: "What is the average inflation rate?", answer: "The US historical average inflation rate is approximately 3% per year. However, inflation can vary significantly year to year. Recent years have seen rates from under 2% to over 8%." },
    { question: "What is purchasing power?", answer: "Purchasing power is the value of money in terms of what it can buy. As inflation increases, purchasing power decreases. $100 today buys more than $100 will in 10 years due to rising prices." },
    { question: "How do I protect against inflation?", answer: "Common inflation hedges include investing in stocks (which historically outpace inflation), real estate, Treasury Inflation-Protected Securities (TIPS), and commodities. Keeping all savings in cash or low-interest accounts loses value to inflation over time." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Inflation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Inflation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex rounded-lg border border-input overflow-hidden mb-6">
                {([["forward", "Future Cost"], ["backward", "Past Value"], ["rate", "Purchasing Power"]] as [Mode, string][]).map(([key, label]) => (
                  <button key={key} onClick={() => { setMode(key); setResult(null); }} className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === key ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"}`}>{label}</button>
                ))}
              </div>

              <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="amount" label={mode === "forward" ? "Current Amount" : mode === "backward" ? "Future Amount" : "Amount"} value={amount} onChange={setAmount} prefix="$" />
                <InputField id="rate" label="Inflation Rate" value={inflationRate} onChange={setInflationRate} suffix="%" />
                <InputField id="years" label="Years" value={years} onChange={setYears} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Results</h2>
                <ResultDisplay items={[
                  { label: mode === "forward" ? "Future Equivalent" : mode === "backward" ? "Past Equivalent" : "Adjusted Value", value: result.adjustedValue, highlight: true },
                  { label: mode === "forward" ? "Today's $1 will be worth" : "Purchasing Power Change", value: result.purchasingPower },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">What Is an Inflation Calculator?</h2>
              <p>An inflation calculator helps you understand how the purchasing power of money changes over time due to inflation. It can show you what today's money will be worth in the future, or what a past amount would be equivalent to today.</p>
              <p>Understanding inflation is crucial for financial planning. Whether you're saving for retirement, negotiating a salary, or evaluating an investment, knowing how inflation erodes purchasing power helps you make better decisions.</p>

              <h2 className="text-2xl font-bold mb-3">How Inflation Is Calculated</h2>
              <p>The basic inflation formula is: Future Value = Present Value × (1 + inflation rate)^years. For example, at 3% annual inflation, $1,000 today will need to be $1,343.92 in 10 years to have the same purchasing power.</p>

              <h2 className="text-2xl font-bold mb-3">The Three Calculation Modes</h2>
              <h3>Forward Inflation</h3>
              <p>Shows how much you'll need in the future to maintain the same purchasing power as a given amount today. Use this when planning future expenses like college tuition or retirement income.</p>
              <h3>Backward Inflation</h3>
              <p>Shows what a future amount is worth in today's dollars. Use this to understand the real value of future income, pension payments, or investment returns.</p>
              <h3>Purchasing Power</h3>
              <p>Shows how much purchasing power a given amount loses over time. This mode is useful for understanding the hidden cost of holding cash or keeping money in low-interest savings accounts.</p>

              <h2 className="text-2xl font-bold mb-3">Historical Inflation Context</h2>
              <p>The United States has experienced varying inflation rates throughout history. The post-World War II era saw moderate inflation averaging 3-4%. The 1970s experienced high inflation (reaching 14.8% in 1980), while the 2010s saw historically low inflation under 2%. Recent years have seen elevated inflation, reminding savers and investors of this important economic force.</p>

              <h2 className="text-2xl font-bold mb-3">Protecting Your Wealth from Inflation</h2>
              <ul>
                <li><strong>Invest in equities:</strong> Stocks have historically returned 7-10% annually, well above inflation.</li>
                <li><strong>Real estate:</strong> Property values and rents tend to rise with or above inflation.</li>
                <li><strong>TIPS:</strong> Treasury Inflation-Protected Securities adjust their principal with inflation.</li>
                <li><strong>I-Bonds:</strong> Series I savings bonds earn a composite rate that includes an inflation adjustment.</li>
                <li><strong>Negotiate salary increases:</strong> Ensure your income keeps pace with or exceeds inflation.</li>
              </ul>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. Actual inflation rates vary and past rates don't predict future inflation. This is not financial advice.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inflation-calculator" />
          <PopularCalculators exclude="/inflation-calculator" />
        </div>
      </div>
    </>
  );
};

export default InflationCalculator;


