"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, RefreshCw } from "lucide-react";

const RefinanceBreakEvenCalculator = () => {
  const [currentPayment, setCurrentPayment] = useState("2500");
  const [newPayment, setNewPayment] = useState("2100");
  const [closingCosts, setClosingCosts] = useState("5000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const current = parseFloat(currentPayment) || 0;
    const next = parseFloat(newPayment) || 0;
    const costs = parseFloat(closingCosts) || 0;

    if (current <= next) return;

    const monthlySavings = current - next;
    const breakEvenMonths = costs / monthlySavings;

    setResults({
      monthlySavings,
      breakEvenMonths,
      breakEvenYears: breakEvenMonths / 12,
      savings5Year: (monthlySavings * 60) - costs,
      savings10Year: (monthlySavings * 120) - costs
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentPayment("2500"); setNewPayment("2100"); setClosingCosts("5000");
    setResults(null);
  };

  const faqs = [
    { question: "What are refinancing closing costs?", answer: "Refinancing costs typically include appraisal fees, title insurance, loan origination fees, and credit report fees. They usually range from 2% to 5% of the loan amount." },
    { question: "Should I refinance if I plan to move in 2 years?", answer: "Probably not. If your break-even point is 30 months and you move in 24 months, you will have spent more in closing costs than you saved in monthly payments." },
    { question: "Can I roll closing costs into my loan?", answer: "Yes, many lenders allow you to add the closing costs to your total loan balance. This is called a 'no-cost' refinance, though it typically results in a slightly higher interest rate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Refinance Break-Even Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Refinance Break-Even Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Determine exactly how many months it will take for your mortgage savings to cover the cost of refinancing.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="currentPayment" label="Current Monthly Payment" value={currentPayment} onChange={setCurrentPayment} prefix="$" />
                <InputField id="newPayment" label="New Monthly Payment" value={newPayment} onChange={setNewPayment} prefix="$" />
                <InputField id="closingCosts" label="Total Closing Costs" value={closingCosts} onChange={setClosingCosts} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5" /> Calculate Break-Even
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Break-Even Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Break-Even Point</p>
                    <p className="text-5xl font-black text-foreground">{Math.ceil(results.breakEvenMonths)} <span className="text-xl">Months</span></p>
                    <p className="text-xs text-muted-foreground mt-2">({results.breakEvenYears.toFixed(1)} years)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Savings</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlySavings.toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Net Savings (5 Years)", value: 0, textValue: "$" + results.savings5Year.toLocaleString() },
                  { label: "Net Savings (10 Years)", value: 0, textValue: "$" + results.savings10Year.toLocaleString() },
                  { label: "Cost-to-Savings Ratio", value: 0, textValue: (parseFloat(closingCosts) / results.monthlySavings).toFixed(1) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>When Refinancing Makes Sense</h2>
              <p>Refinancing is more than just getting a lower interest rate; it's a math problem. If the cost of getting the new loan is higher than what you save over the time you intend to stay in the home, it's not a good deal.</p>
              <h3>The Break-Even Point</h3>
              <p>The "Break-Even Point" is the most critical metric in refinancing. It tells you the exact month when your accumulated monthly savings equal the upfront closing costs. Most financial advisors recommend a break-even point of 36 months or less.</p>
              <h3>Factors That Influence Your Decision</h3>
              <p>If you plan to live in your home for the next 10-20 years, a longer break-even point might be acceptable. However, if there's any chance you'll sell or move in the next 3-5 years, you need to be very careful that the math works in your favor before signing the paperwork.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/refinance-break-even" />
            <PopularCalculators exclude="/calculator/refinance-break-even-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default RefinanceBreakEvenCalculator;

