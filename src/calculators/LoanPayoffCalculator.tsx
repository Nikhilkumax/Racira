"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const LoanPayoffCalculator = () => {
  const [loanBalance, setLoanBalance] = useState("30000");
  const [interestRate, setInterestRate] = useState("7.5");
  const [remainingTerm, setRemainingTerm] = useState("60");
  const [extraPayment, setExtraPayment] = useState("200");
  const [oneTimePayment, setOneTimePayment] = useState("0");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const balance = parseFloat(loanBalance) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = parseInt(remainingTerm) || 0;
    const extra = parseFloat(extraPayment) || 0;
    const oneTime = parseFloat(oneTimePayment) || 0;

    // Monthly payment formula
    const monthlyPayment = r > 0 
      ? (balance * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1)
      : balance / term;

    // Baseline (no extra)
    const baselineInterest = (monthlyPayment * term) - balance;

    // With extra payments
    let currentBalance = balance - oneTime;
    let months = 0;
    let totalInterest = 0;
    const totalPayment = monthlyPayment + extra;

    while (currentBalance > 0.01 && months < 600) {
      months++;
      const interest = currentBalance * r;
      totalInterest += interest;
      const principal = Math.min(currentBalance, totalPayment - interest);
      currentBalance -= principal;
    }

    const interestSaved = baselineInterest - totalInterest;
    const monthsSaved = term - months;

    setResults({
      monthlyPayment,
      totalPayment,
      months,
      monthsSaved,
      totalInterest,
      interestSaved,
      payoffDate: new Date(new Date().setMonth(new Date().getMonth() + months)).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    });
  };

  const reset = () => {
    setShowResults(false);
    setLoanBalance("30000");
    setInterestRate("7.5");
    setRemainingTerm("60");
    setResults(null);
  };

  const faqs = [
    { question: "How does an extra loan payment help?", answer: "Extra payments go directly toward the principal balance. This reduces the amount of interest that accrues every subsequent month, creating a compounding effect that significantly shortens the loan term." },
    { question: "Is there a penalty for paying off a loan early?", answer: "Some loans (especially older or private ones) have prepayment penalties. Always check your loan agreement or call your lender before making large extra payments." },
    { question: "Should I pay off my loan or invest the money?", answer: "If your loan's interest rate is higher than your expected investment return (after taxes), paying off the loan is usually the better financial move. If the rate is low (e.g., 3-4%), investing might be more profitable." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Loan Payoff" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Payoff Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">See how much time and interest you can save by making extra payments on your personal, student, or auto loan.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="loanBalance" label="Remaining Balance" value={loanBalance} onChange={setLoanBalance} prefix="$" />
                <InputField id="interestRate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                <InputField id="remainingTerm" label="Remaining Months" value={remainingTerm} onChange={setRemainingTerm} />
                <InputField id="extraPayment" label="Monthly Extra Payment" value={extraPayment} onChange={setExtraPayment} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Savings</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-4">Payoff Summary</h2>
                <ResultDisplay items={[
                  { label: "New Payoff Date", value: 0, textValue: results.payoffDate, highlight: true },
                  { label: "Months Saved", value: 0, textValue: `${results.monthsSaved} months`, highlight: true },
                  { label: "Total Interest Saved", value: results.interestSaved, highlight: true },
                  { label: "Required Monthly Payment", value: results.monthlyPayment },
                  { label: "Total Monthly Payment", value: results.totalPayment },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance">
              <h2>The Power of Extra Payments</h2>
              <p>Making even small extra payments on a loan can have a dramatic impact on your financial health. Because interest is typically calculated on your remaining balance, reducing that balance faster means you pay less interest over the life of the loan.</p>
              <h3>Why Principal Payments Matter</h3>
              <p>In the early stages of a loan, most of your monthly payment goes toward interest. By adding an "extra" payment, 100% of that extra amount goes toward the principal. This "skips" future interest payments and can shave years off a 5 or 10-year loan.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/loan-payoff-calculator" />
          <PopularCalculators exclude="/calculator/loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
};

export default LoanPayoffCalculator;

