"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const MortgagePayoffCalculator = () => {
  const [balance, setBalance] = useState("300000");
  const [rate, setRate] = useState("6.5");
  const [currentPayment, setCurrentPayment] = useState("1896");
  const [targetYears, setTargetYears] = useState("15");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(balance);
    const r = parseFloat(rate) / 100 / 12;
    const nTarget = parseFloat(targetYears) * 12;
    const currentP = parseFloat(currentPayment);

    if (p <= 0 || r < 0 || nTarget <= 0) return;

    // Required payment to hit target
    const requiredPayment = r > 0 
      ? (p * r * Math.pow(1 + r, nTarget)) / (Math.pow(1 + r, nTarget) - 1)
      : p / nTarget;

    const extraNeeded = Math.max(0, requiredPayment - currentP);
    
    // Original months remaining (approximate based on current payment)
    let tempBalance = p;
    let currentMonths = 0;
    let currentTotalInterest = 0;
    while (tempBalance > 0 && currentMonths < 600) {
      const interest = tempBalance * r;
      currentTotalInterest += interest;
      tempBalance = tempBalance + interest - currentP;
      currentMonths++;
    }

    const targetTotalInterest = (requiredPayment * nTarget) - p;

    setResults({
      requiredPayment,
      extraNeeded,
      originalMonths: currentMonths,
      interestSaved: currentTotalInterest - targetTotalInterest
    });
  };

  const reset = () => {
    setShowResults(false);
    setBalance("300000"); setRate("6.5"); setCurrentPayment("1896"); setTargetYears("15");
    setResults(null);
  };

  const faqs = [
    { question: "How can I pay off my mortgage faster?", answer: "The most effective way is to increase your monthly principal payments. Other strategies include making a 13th payment each year or applying unexpected windfalls (like tax refunds) toward the principal." },
    { question: "Is there a penalty for paying off my mortgage early?", answer: "Most modern residential mortgages do not have prepayment penalties. However, you should check your specific loan agreement or contact your lender to be certain." },
    { question: "What is the benefit of a 15-year mortgage vs a 30-year?", answer: "A 15-year mortgage usually has a lower interest rate and results in massive interest savings, though the monthly payments are significantly higher." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Mortgage Payoff Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Mortgage Payoff Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate exactly how much extra you need to pay every month to be mortgage-free by a specific date.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="balance" label="Current Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="current" label="Current Monthly Payment ($)" value={currentPayment} onChange={setCurrentPayment} />
                <InputField id="target" label="Target Payoff (Years)" value={targetYears} onChange={setTargetYears} tooltip="In how many years do you want to be debt-free?" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Home className="h-5 w-5" /> Calculate Payoff Plan
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Payoff Strategy</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">New Required Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.requiredPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Extra Monthly Needed</p>
                    <p className="text-3xl font-black text-foreground">${results.extraNeeded.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest Saved", value: 0, textValue: "$" + results.interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Time Saved", value: 0, textValue: ((results.originalMonths - (parseFloat(targetYears) * 12)) / 12).toFixed(1) + " Years" },
                  { label: "Target Date", value: 0, textValue: new Date(new Date().setFullYear(new Date().getFullYear() + parseFloat(targetYears))).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Journey to Debt-Free Living</h2>
              <p>For most people, the mortgage is their largest monthly expense. Paying it off early not only saves a fortune in interest but also provides a level of financial security and freedom that is hard to match.</p>
              <h3>Why Target a Specific Year?</h3>
              <p>Many people aim to be mortgage-free by the time they retire, or by the time their children start college. This calculator helps you reverse-engineer that goal, telling you exactly how much extra 'skin in the game' you need every month to hit that target.</p>
              <h3>Principal vs. Interest</h3>
              <p>When you make an extra payment, 100% of that money goes toward the principal. This is incredibly powerful. By reducing the principal, you permanently lower the interest charge for every single month that follows. It's like giving yourself a small, compounding pay raise for the rest of the loan term.</p>
              <h3>Is it Right for You?</h3>
              <p>Before aggressively paying down your mortgage, ensure you have no high-interest consumer debt (like credit cards). Also, consider the opportunity cost. If your mortgage rate is 3% and you could earn 7% in the stock market, you might be better off investing the difference. However, the psychological benefit of owning your home outright is often worth more than a few percentage points of return.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/mortgage-payoff" />
          <PopularCalculators exclude="/calculator/mortgage-payoff-calculator" />
        </div>
      </div>
    </>
  );
};

export default MortgagePayoffCalculator;

