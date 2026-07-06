"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, DollarSign } from "lucide-react";

const DownPaymentCalculator = () => {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPct, setDownPct] = useState("20");
  const [closingCostPct, setClosingCostPct] = useState("3");
  const [monthsToSave, setMonthsToSave] = useState("24");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(homePrice);
    const pct = parseFloat(downPct) / 100;
    const closingPct = parseFloat(closingCostPct) / 100;
    const months = parseFloat(monthsToSave);

    const downPayment = price * pct;
    const closingCosts = price * closingPct;
    const totalNeeded = downPayment + closingCosts;
    const monthlySavingsNeeded = totalNeeded / months;
    const loanAmount = price - downPayment;
    const pmiNeeded = pct < 0.20;

    setResults({ downPayment, closingCosts, totalNeeded, monthlySavingsNeeded, loanAmount, pmiNeeded });
  };

  const reset = () => {
    setShowResults(false); setHomePrice("400000"); setDownPct("20"); setClosingCostPct("3"); setMonthsToSave("24"); setResults(null); };

  const faqs = [
    { question: "How much down payment do I need?", answer: "Conventional loans typically require 5-20% down. FHA loans require 3.5% (with 580+ credit score). VA and USDA loans can require 0% down. A 20% down payment avoids PMI and usually gets the best rate." },
    { question: "What are closing costs?", answer: "Closing costs include lender fees, appraisal, title insurance, attorney fees, and prepaid items like property taxes and insurance. They typically run 2-5% of the loan amount for buyers." },
    { question: "Can I use gift money for a down payment?", answer: "Yes. Conventional loans allow gift funds with a gift letter. FHA loans also allow gifts from family members. VA loans allow gifts as well. Some programs restrict gift money from non-family parties." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Down Payment Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Down Payment Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="price" label="Home Price ($)" value={homePrice} onChange={setHomePrice} />
                <InputField id="pct" label="Down Payment (%)" value={downPct} onChange={setDownPct} />
                <InputField id="close" label="Closing Costs (%)" value={closingCostPct} onChange={setClosingCostPct} />
                <InputField id="months" label="Months to Save" value={monthsToSave} onChange={setMonthsToSave} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Down Payment Plan</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Cash Needed</p>
                    <p className="text-5xl font-black text-foreground">${results.totalNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Savings Needed</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlySavingsNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Down Payment", value: 0, textValue: "$" + results.downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Estimated Closing Costs", value: 0, textValue: "$" + results.closingCosts.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "PMI Required?", value: 0, textValue: results.pmiNeeded ? "Yes (< 20% down)" : "No ✓" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Planning Your Home Purchase</h2>
              <p>One of the biggest barriers to homeownership is saving the necessary cash. Most buyers underestimate the total needed because they focus on the down payment and forget about closing costs, moving expenses, and initial repairs.</p>
              <h3>The 20% Threshold</h3>
              <p>A 20% down payment eliminates Private Mortgage Insurance (PMI), which typically costs 0.5-1.5% of the loan annually. On a $400,000 loan, that's $2,000-$6,000 per year in avoidable cost. It also often results in a lower interest rate.</p>
              <h3>Low Down Payment Programs</h3>
              <p>If 20% feels out of reach, consider: FHA (3.5% down), Conventional 97 (3% down), or state first-time buyer programs that offer down payment assistance grants. Some employers also offer home buying assistance programs.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/down-payment" />
          <PopularCalculators exclude="/calculator/down-payment-calculator" />
        </div>
      </div>
    </>
  );
};
export default DownPaymentCalculator;

