"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, TrendingUp } from "lucide-react";

const RuleOf70Calculator = () => {
  const [growthRate, setGrowthRate] = useState("7");
  const [initialInvestment, setInitialInvestment] = useState("10000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const rate = parseFloat(growthRate) || 0;
    const initial = parseFloat(initialInvestment) || 0;

    if (rate <= 0) return;

    // Rule of 70: Years to double = 70 / Rate
    const yearsToDouble = 70 / rate;

    setResults({
      yearsToDouble,
      doubledValue: initial * 2,
      valueAfter10Years: initial * Math.pow(1 + (rate / 100), 10),
      valueAfter20Years: initial * Math.pow(1 + (rate / 100), 20)
    });
  };

  const reset = () => {
    setShowResults(false);
    setGrowthRate("7"); setInitialInvestment("10000");
    setResults(null);
  };

  const faqs = [
    { question: "What is the Rule of 70?", answer: "The Rule of 70 is a quick way to estimate the number of years it will take for an investment to double in value, given a fixed annual rate of growth. You simply divide 70 by the annual growth rate percentage." },
    { question: "How accurate is the Rule of 70?", answer: "It is a very close approximation for growth rates between 2% and 10%. For higher growth rates, the 'Rule of 72' is often slightly more accurate for compound interest." },
    { question: "Can I use the Rule of 70 for inflation?", answer: "Yes. If inflation is 3%, the Rule of 70 tells you that the purchasing power of your money will be cut in half in approximately 23.3 years (70 / 3)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rule of 70 Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rule of 70 Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="growthRate" label="Annual Growth Rate" value={growthRate} onChange={setGrowthRate} suffix="%" />
                <InputField id="initialInvestment" label="Initial Investment" value={initialInvestment} onChange={setInitialInvestment} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Growth Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Years to Double</p>
                    <p className="text-5xl font-black text-foreground">{results.yearsToDouble.toFixed(1)} <span className="text-xl">Years</span></p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Doubled Value</p>
                    <p className="text-3xl font-black text-foreground">${results.doubledValue.toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Value After 10 Years", value: 0, textValue: "$" + Math.round(results.valueAfter10Years).toLocaleString() },
                  { label: "Value After 20 Years", value: 0, textValue: "$" + Math.round(results.valueAfter20Years).toLocaleString() },
                  { label: "Growth Factor (20y)", value: 0, textValue: (results.valueAfter20Years / parseFloat(initialInvestment)).toFixed(2) + "x" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Power of Compounding</h2>
              <p>The Rule of 70 is a powerful mental shortcut used by economists and investors to understand exponential growth. It reveals why even a small difference in annual returns can lead to massive differences in wealth over long periods.</p>
              <h3>Why Time is Your Greatest Asset</h3>
              <p>If you have an investment growing at 7%, it doubles every 10 years. If you start with $10,000 at age 20, you'll have $20,000 at 30, $40,000 at 40, $80,000 at 50, and $160,000 at 60. If you wait until age 30 to start, you'll end up with only half as much money by retirement.</p>
              <h3>Rule of 70 vs. Rule of 72</h3>
              <p>While the Rule of 70 is common in economics and population growth studies, the 'Rule of 72' is more popular in finance for annual compounding. The Rule of 69 is technically the most accurate for continuous compounding, but the Rule of 70 remains the easiest for quick mental math.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rule-of-70" />
          <PopularCalculators exclude="/calculator/rule-of-70-calculator" />
        </div>
      </div>
    </>
  );
};

export default RuleOf70Calculator;

