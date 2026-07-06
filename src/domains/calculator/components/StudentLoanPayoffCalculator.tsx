"use client";
import { RotateCcw, Calendar, CreditCard, GraduationCap } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
const StudentLoanPayoffCalculator = () => {
  const [loanBalance, setLoanBalance] = useState("35000");
  const [interestRate, setInterestRate] = useState("5.5");
  const [monthlyPayment, setMonthlyPayment] = useState("450");
  const [extraPayment, setExtraPayment] = useState("100");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const balance = parseFloat(loanBalance) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const pmt = parseFloat(monthlyPayment) || 0;
    const extra = parseFloat(extraPayment) || 0;

    if (pmt <= balance * rate) {
      setResults({ isInfinite: true });
      return;
    }

    const calculateMonths = (principal: number, monthlyPmt: number) => {
      if (rate === 0) return principal / monthlyPmt;
      return Math.log(monthlyPmt / (monthlyPmt - principal * rate)) / Math.log(1 + rate);
    };

    const monthsStandard = calculateMonths(balance, pmt);
    const monthsAccelerated = calculateMonths(balance, pmt + extra);

    const totalInterestStandard = (pmt * monthsStandard) - balance;
    const totalInterestAccelerated = ((pmt + extra) * monthsAccelerated) - balance;

    setResults({
      monthsStandard,
      monthsAccelerated,
      interestSaved: totalInterestStandard - totalInterestAccelerated,
      timeSaved: monthsStandard - monthsAccelerated,
      isInfinite: false
    });
  };

  const reset = () => {
    setLoanBalance("35000"); setInterestRate("5.5"); setMonthlyPayment("450"); setExtraPayment("100");
  };

  const faqs = [
    { question: "What is the average student loan interest rate?", answer: "Federal student loan rates for undergraduates are typically between 4% and 6%. Private student loans can range from 5% to over 15% depending on credit history." },
    { question: "Should I pay off student loans early?", answer: "If your interest rate is high (above 6%), paying them off early provides a guaranteed return on your money. However, if your rate is low, you might be better off investing that extra money in a retirement account." },
    { question: "What is capitalization of interest?", answer: "Capitalization occurs when unpaid interest is added to the principal balance of your loan, increasing the amount you owe and causing interest to accrue on interest." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Student Loan Payoff Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Student Loan Payoff Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <GraduationCap className="h-5 w-5 text-primary" /> Loan Details
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Current Balance</label>
                    <input type="number" value={loanBalance} onChange={(e) => setLoanBalance(e.target.value)} className="input-calc font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Annual Interest Rate (%)</label>
                    <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className="input-calc" step="0.1" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Plan
                  </h2>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Standard Monthly Payment</label>
                    <input type="number" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className="input-calc" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">Extra Monthly Payment</label>
                    <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="input-calc border-primary/30 text-primary font-bold" />
                  </div>
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                {results.isInfinite ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-6 rounded-2xl text-center font-bold">
                    Warning: Your payment does not cover the monthly interest. Your balance will grow forever.
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Total Interest Saved</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.interestSaved).toLocaleString()}</p>
                      </div>
                      <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Time Saved</p>
                        <p className="text-5xl font-black text-foreground">{Math.floor(results.timeSaved / 12)}y {Math.round(results.timeSaved % 12)}m</p>
                      </div>
                    </div>

                    <div className="card-calculator">
                      <h2 className="text-2xl font-bold mb-3">
                        <Calendar className="h-5 w-5 text-primary" /> Payoff Timeline
                      </h2>
                        <ResultDisplay items={[
                          { label: "Standard Payoff Time", value: 0, textValue: `${Math.floor(results.monthsStandard / 12)} years, ${Math.round(results.monthsStandard % 12)} months` },
                          { label: "Accelerated Payoff Time", value: 0, textValue: `${Math.floor(results.monthsAccelerated / 12)} years, ${Math.round(results.monthsAccelerated % 12)} months` },
                          { label: "New Monthly Total", value: 0, textValue: `$${(parseFloat(monthlyPayment) + parseFloat(extraPayment)).toLocaleString()}` },
                        ]} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">The Power of Extra Payments</h2>
              <p>Student loans are structured as amortized debt, meaning your monthly payment is split between interest and principal. In the early years of your loan, a large portion of your payment goes toward interest. By adding even a small amount to your monthly payment, you directly reduce the principal balance.</p>
              
              <h3>Bypassing Compound Interest</h3>
              <p>When you reduce the principal, there is less balance for interest to accrue on next month. This creates a powerful snowball effect. For example, on a $35,000 loan, an extra $100 per month can save you over 3 years of payments and several thousand dollars in total interest.</p>

              <h3>Federal vs. Private Loans</h3>
              <p>Always check if your loans have prepayment penalties (most federal and modern private student loans do not). Additionally, ensure your loan servicer is applying the extra payment to the principal balance rather than just 'advancing' your next due date.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan-payoff" />
          <PopularCalculators exclude="/calculator/student-loan-payoff-calculator" />
        </div>
      </div>
    </>
  );
};

export default StudentLoanPayoffCalculator;

