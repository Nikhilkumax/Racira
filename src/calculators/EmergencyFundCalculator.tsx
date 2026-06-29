"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const EmergencyFundCalculator = () => {
  const [housing, setHousing] = useState("1800");
  const [utilities, setUtilities] = useState("250");
  const [groceries, setGroceries] = useState("500");
  const [transportation, setTransportation] = useState("400");
  const [insurance, setInsurance] = useState("200");
  const [otherEssential, setOtherEssential] = useState("300");
  const [monthsTarget, setMonthsTarget] = useState("6");
  const [currentSavings, setCurrentSavings] = useState("2000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const monthlyEssential = (parseFloat(housing) || 0) + 
                            (parseFloat(utilities) || 0) + 
                            (parseFloat(groceries) || 0) + 
                            (parseFloat(transportation) || 0) + 
                            (parseFloat(insurance) || 0) + 
                            (parseFloat(otherEssential) || 0);
    
    const targetMonths = parseFloat(monthsTarget) || 6;
    const totalTarget = monthlyEssential * targetMonths;
    const savings = parseFloat(currentSavings) || 0;
    const remaining = Math.max(0, totalTarget - savings);
    
    setResults({
      monthlyEssential,
      totalTarget,
      remaining,
      progress: savings > 0 ? (savings / totalTarget) * 100 : 0
    });
  };

  const reset = () => {
    setShowResults(false);
    setHousing("1800");
    setMonthsTarget("6");
    setCurrentSavings("2000");
    setResults(null);
  };

  const faqs = [
    { question: "How many months of expenses should be in an emergency fund?", answer: "Financial experts typically recommend 3 to 6 months of essential living expenses. However, if you are self-employed, work in a volatile industry, or have many dependents, a 9 to 12-month cushion may be more appropriate." },
    { question: "What counts as an 'essential' expense?", answer: "Essential expenses are those you MUST pay to survive and stay employed: rent/mortgage, utilities, basic groceries, transportation to work, insurance premiums, and minimum debt payments. Discretionary spending like dining out or streaming services should be excluded from this calculation." },
    { question: "Where should I keep my emergency fund?", answer: "Your emergency fund should be liquid and safe. A High-Yield Savings Account (HYSA) is ideal because it earns more interest than a standard checking account while remaining accessible within 1-2 business days." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Emergency Fund" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Emergency Fund Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Monthly Essentials</h3>
                  <InputField id="housing" label="Rent / Mortgage" value={housing} onChange={setHousing} prefix="$" />
                  <InputField id="utilities" label="Utilities & Phone" value={utilities} onChange={setUtilities} prefix="$" />
                  <InputField id="groceries" label="Groceries" value={groceries} onChange={setGroceries} prefix="$" />
                  <InputField id="transport" label="Transportation" value={transportation} onChange={setTransportation} prefix="$" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Targets & Current</h3>
                  <InputField id="monthsTarget" label="Target Months" value={monthsTarget} onChange={setMonthsTarget} suffix="mo" />
                  <InputField id="currentSavings" label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" />
                  <InputField id="insurance" label="Insurance Premiums" value={insurance} onChange={setInsurance} prefix="$" />
                  <InputField id="other" label="Other Essentials" value={otherEssential} onChange={setOtherEssential} prefix="$" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">Target Emergency Fund</h2>
                  <p className="text-5xl font-extrabold mb-4">${Math.round(results.totalTarget).toLocaleString()}</p>
                  
                  <div className="w-full bg-secondary rounded-full h-3 mb-2 max-w-md mx-auto overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, results.progress)}%` }} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Progress: {results.progress.toFixed(1)}% of your goal</p>
                </div>

                <ResultDisplay items={[
                  { label: "Target Fund Amount", value: results.totalTarget, highlight: true },
                  { label: "Remaining to Save", value: results.remaining, highlight: results.remaining > 0 },
                  { label: "Essential Monthly Expenses", value: results.monthlyEssential },
                  { label: "Safety Cushion", value: 0, textValue: `${monthsTarget} Months` },
                ]} />
              </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Foundation of Financial Peace</h2>
              <p>An emergency fund is not just a savings account; it's insurance for your life. It provides a financial buffer that allows you to weather unexpected storms without resorting to high-interest credit card debt or raiding your retirement accounts.</p>
              <h3>Why 3 to 6 Months?</h3>
              <p>The standard 3 to 6-month recommendation covers the average time it takes to find a new job or recover from a significant medical event. If you have a stable job and low expenses, 3 months might suffice. If you have a family and a mortgage, 6 months is the safer minimum.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/emergency-fund-calculator" />
          <PopularCalculators exclude="/calculator/emergency-fund-calculator" />
        </div>
      </div>
    </>
  );
};

export default EmergencyFundCalculator;

