"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Wallet } from "lucide-react";

const RentAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState("60000");
  const [monthlyDebts, setMonthlyDebts] = useState("300");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(annualIncome) || 0;
    const debts = parseFloat(monthlyDebts) || 0;

    if (income <= 0) return;

    const monthlyGross = income / 12;
    
    // 30% Rule (Industry Standard)
    const recommendedRent = monthlyGross * 0.30;
    
    // "Aggressive" / Max (often used for NYC/Bay Area or by landlords for qualification)
    // 40x rule: Annual Income / 40
    const maxRent40x = income / 40;

    setResults({
      monthlyGross,
      recommendedRent,
      maxRent: maxRent40x,
      leftoverAfterRent: monthlyGross - recommendedRent - debts
    });
  };

  const reset = () => {
    setShowResults(false);
    setAnnualIncome("60000"); setMonthlyDebts("300");
    setResults(null);
  };

  const faqs = [
    { question: "What is the 30% rule for rent?", answer: "The 30% rule suggests that you should spend no more than 30% of your gross monthly income on housing costs. This ensures you have enough money left for other essentials and savings." },
    { question: "What is the 40x rule?", answer: "Many landlords, especially in high-cost cities like New York, require that your annual gross income be at least 40 times the monthly rent. For example, to afford a $2,000 apartment, you would need to earn $80,000 per year." },
    { question: "Should I use gross or net income to calculate rent?", answer: "While experts recommend using net (after-tax) income for more accurate budgeting, most rental applications and standard rules use gross (before-tax) income." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rent Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rent Affordability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="annualIncome" label="Annual Gross Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" />
                <InputField id="monthlyDebts" label="Other Monthly Debts" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" />
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
                <h2 className="text-2xl font-bold mb-3">Affordability Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Recommended Rent</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.recommendedRent).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on 30% rule</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Maximum Rent</p>
                    <p className="text-3xl font-black text-foreground">${Math.round(results.maxRent).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-2">Based on 40x rule</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Monthly Gross Income", value: 0, textValue: "$" + Math.round(results.monthlyGross).toLocaleString() },
                  { label: "Leftover (After Rent & Debt)", value: 0, textValue: "$" + Math.round(results.leftoverAfterRent).toLocaleString() },
                  { label: "Suggested Net Budget", value: 0, textValue: "25% of Take-Home" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Renting Without Stress</h2>
              <p>Rent is often the single largest monthly expense. Overextending yourself on a "dream apartment" can lead to a cycle of debt and prevent you from reaching other financial goals like traveling or saving for a down payment.</p>
              <h3>Why the 30% Rule Exists</h3>
              <p>The 30% threshold was established by HUD in the 1980s as a standard for housing affordability. If you spend more than 30% of your income on rent, you are considered "house burdened," which significantly increases the risk of financial instability during emergencies.</p>
              <h3>Adjusting for High-Cost Areas</h3>
              <p>In cities like New York, London, or San Francisco, the 30% rule is often impossible to follow for many workers. In these cases, it's vital to look at your actual net income and subtract fixed costs (transportation, food, debt) to see what is truly leftover. Often, sacrificing space or location is better than living paycheck to paycheck.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rent-affordability" />
          <PopularCalculators exclude="/calculator/rent-affordability-calculator" />
        </div>
      </div>
    </>
  );
};

export default RentAffordabilityCalculator;

