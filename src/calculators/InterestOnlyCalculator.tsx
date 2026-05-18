"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Landmark } from "lucide-react";

const InterestOnlyCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("400000");
  const [interestRate, setInterestRate] = useState("5.5");
  const [ioTerm, setIoTerm] = useState("10"); // years
  const [totalTerm, setTotalTerm] = useState("30"); // years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const ioYears = parseFloat(ioTerm);
    const totalYears = parseFloat(totalTerm);

    if (P <= 0 || r <= 0 || ioYears <= 0 || totalYears <= ioYears) return;

    // Phase 1: Interest Only
    const ioMonthlyPayment = P * r;
    const ioTotalInterest = ioMonthlyPayment * (ioYears * 12);

    // Phase 2: Amortization (Repayment period)
    const repaymentYears = totalYears - ioYears;
    const n = repaymentYears * 12;
    const amortizedPayment = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    const amortizedTotalPaid = amortizedPayment * n;
    const amortizedTotalInterest = amortizedTotalPaid - P;

    const grandTotalInterest = ioTotalInterest + amortizedTotalInterest;
    const grandTotalPaid = P + grandTotalInterest;

    // Standard 30 year for comparison
    const standardN = totalYears * 12;
    const standardPayment = P * (r * Math.pow(1 + r, standardN)) / (Math.pow(1 + r, standardN) - 1);

    setResults({
      ioMonthlyPayment,
      amortizedPayment,
      standardPayment,
      ioTotalInterest,
      grandTotalInterest,
      grandTotalPaid,
      jumpAmount: amortizedPayment - ioMonthlyPayment
    });
  };

  const reset = () => {
    setShowResults(false); setLoanAmount("400000"); setInterestRate("5.5"); setIoTerm("10"); setTotalTerm("30"); setResults(null); };

  const faqs = [
    { question: "What is an Interest-Only Mortgage?", answer: "An interest-only mortgage is a loan where the borrower pays only the interest on the principal balance for a set period (usually 5 to 10 years). After this period, the loan resets, and the borrower must begin paying both principal and interest." },
    { question: "What is payment shock?", answer: "Payment shock occurs at the end of the interest-only period. Because you must now pay off the entire principal balance over a shorter remaining term (e.g., 20 years instead of 30), your monthly payment will jump significantly—often by 50% or more." },
    { question: "Who should get an interest-only loan?", answer: "These loans are typically for wealthy buyers with irregular income, real estate investors who plan to flip the property quickly, or buyers who expect a massive increase in income before the amortization period begins." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Interest-Only Mortgage Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Interest-Only Mortgage Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your initial interest-only payment and the adjusted fully amortized payment once the interest-only period ends.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="ioterm" label="Interest-Only Period (Years)" value={ioTerm} onChange={setIoTerm} />
                <InputField id="totalterm" label="Total Loan Term (Years)" value={totalTerm} onChange={setTotalTerm} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Landmark className="h-5 w-5" /> Calculate Loan Phases</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Payment Schedule</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Phase 1: Interest-Only</p>
                    <p className="text-4xl font-black text-foreground">${results.ioMonthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-muted-foreground mt-1">For first {ioTerm} years</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">Phase 2: Fully Amortized</p>
                    <p className="text-3xl font-black text-foreground">${results.amortizedPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-sm text-red-600 font-medium mt-1">Payment jumps by ${results.jumpAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-4">Total Cost Analysis</h3>
                <ResultDisplay items={[
                  { label: "Interest Paid During Phase 1", value: 0, textValue: `$${results.ioTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: "Grand Total Interest Over Life of Loan", value: 0, textValue: `$${results.grandTotalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  { label: "Total Amount Paid (Principal + Interest)", value: 0, textValue: `$${results.grandTotalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                ]} />

                <div className="mt-6 p-4 rounded-xl border border-border bg-secondary/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Standard {totalTerm}-Year Fixed Payment</p>
                    <p className="text-xs text-muted-foreground">For comparison</p>
                  </div>
                  <p className="font-bold">${results.standardPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>The Risks of Interest-Only Mortgages</h2>
              <p>Interest-only loans are incredibly alluring because the initial monthly payment is significantly lower than a traditional fixed-rate mortgage. However, this structure carries severe financial risks.</p>
              <h3>Zero Equity Buildup</h3>
              <p>For the entire duration of the interest-only period (often 10 years), you do not pay a single cent toward the principal. If you borrow $400,000, after 10 years of payments, you still owe exactly $400,000. If property values decline, you will find yourself "underwater" (owing more than the home is worth).</p>
              <h3>The Payment Shock</h3>
              <p>When the IO period ends, the loan "recasts." Because you haven't paid any principal, the bank forces you to pay off the entire $400,000 balance over the remaining term (e.g., 20 years instead of 30). This causes a massive, unavoidable spike in your monthly payment.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-only" />
            <PopularCalculators exclude="/calculator/interest-only-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default InterestOnlyCalculator;

