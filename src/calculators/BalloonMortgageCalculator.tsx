"use client";
import { RotateCcw, Calendar, Info, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
import AmortizationTable, { type AmortRow } from "@/components/calculator/AmortizationTable";
const BalloonMortgageCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [amortizationPeriod, setAmortizationPeriod] = useState("30");
  const [balloonTerm, setBalloonTerm] = useState("7");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const principal = parseFloat(loanAmount) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const amortMonths = (parseFloat(amortizationPeriod) || 0) * 12;
    const termMonths = (parseFloat(balloonTerm) || 0) * 12;

    if (principal <= 0 || rate <= 0 || amortMonths <= 0 || termMonths <= 0) return;

    // Monthly payment based on full amortization
    const monthlyPayment = (principal * rate * Math.pow(1 + rate, amortMonths)) / (Math.pow(1 + rate, amortMonths) - 1);

    // Calculate remaining balance after balloon term
    let currentBalance = principal;
    const monthlyRows: AmortRow[] = [];
    const yearlyRows: AmortRow[] = [];

    let totalInterest = 0;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= termMonths; m++) {
      const interestPayment = currentBalance * rate;
      const principalPayment = monthlyPayment - interestPayment;
      currentBalance -= principalPayment;
      totalInterest += interestPayment;

      yearPrincipal += principalPayment;
      yearInterest += interestPayment;

      monthlyRows.push({
        period: m,
        payment: monthlyPayment,
        interest: interestPayment,
        principal: principalPayment,
        balance: Math.max(0, currentBalance),
      });

      if (m % 12 === 0) {
        yearlyRows.push({
          period: m / 12,
          payment: monthlyPayment * 12,
          interest: yearInterest,
          principal: yearPrincipal,
          balance: Math.max(0, currentBalance),
        });
        yearPrincipal = 0;
        yearInterest = 0;
      }
    }

    const balloonPayment = currentBalance;

    setResults({
      monthlyPayment,
      balloonPayment,
      totalInterest,
      totalPaid: (monthlyPayment * termMonths) + balloonPayment,
      monthlyRows,
      yearlyRows,
    });
  };

  const reset = () => {
    setLoanAmount("300000");
    setInterestRate("6.5");
    setAmortizationPeriod("30");
    setBalloonTerm("7");
  };

  const faqs = [
    {
      question: "What is a balloon mortgage?",
      answer: "A balloon mortgage is a type of loan that does not fully amortize over the term. Instead, it features low monthly payments for a short period (typically 5-10 years) based on a longer amortization schedule (like 30 years), with the remaining balance due as a large lump sum at the end of the term."
    },
    {
      question: "How is the balloon payment calculated?",
      answer: "The balloon payment is the remaining principal balance of the loan at the end of the specified term. It is calculated by taking the original loan amount and subtracting the principal portions of all monthly payments made during the term."
    },
    {
      question: "What are the risks of a balloon mortgage?",
      answer: "The primary risk is the inability to pay the large lump sum at the end of the term. Borrowers often plan to refinance, sell the property, or pay the balloon in cash, but changes in interest rates or property values can make these options difficult."
    },
    {
      question: "Who should consider a balloon mortgage?",
      answer: "Balloon mortgages are often used by investors or homeowners who plan to sell the property or refinance before the balloon payment is due. They offer lower monthly payments compared to standard fixed-rate mortgages."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Balloon Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Balloon Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Home className="h-5 w-5 text-primary" /> Loan Basics
                  </h2>
                  <InputField id="loan-amount" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" tooltip="The total amount of money you are borrowing." />
                  <InputField id="interest-rate" label="Interest Rate (Annual %)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" tooltip="The annual interest rate for the loan." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Calendar className="h-5 w-5 text-primary" /> Timeline
                  </h2>
                  <InputField id="amort-period" label="Amortization Period (Years)" value={amortizationPeriod} onChange={setAmortizationPeriod} suffix="yrs" tooltip="The period used to calculate monthly payments (e.g., 30 years)." />
                  <InputField id="balloon-term" label="Balloon Term (Years)" value={balloonTerm} onChange={setBalloonTerm} suffix="yrs" tooltip="The number of years until the remaining balance is due in full." />
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
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.monthlyPayment).toLocaleString()}</p>
                  </div>
                  <div className="card-calculator bg-red-500/5 border-red-500/20 text-center flex flex-col justify-center py-8 border-dashed">
                    <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Final Balloon Payment</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.balloonPayment).toLocaleString()}</p>
                    <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">Due in {balloonTerm} years</p>
                  </div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-2xl font-bold mb-3">
                    <Info className="h-5 w-5 text-primary" /> Loan Summary
                  </h2>
                  <ResultDisplay items={[
                    { label: "Total Interest Paid", value: results.totalInterest },
                    { label: "Total Cost of Loan", value: results.totalPaid },
                    { label: "Loan Balance After Term", value: results.balloonPayment },
                    { label: "Effective Monthly Interest", value: results.monthlyPayment - (parseFloat(loanAmount) / (parseFloat(amortizationPeriod) * 12)), textValue: `$${(results.monthlyPayment).toFixed(2)}` },
                  ]} />
                </div>

                <AmortizationTable rows={results.yearlyRows} yearly={true} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is a Balloon Mortgage?</h2>
              <p>A balloon mortgage is a unique type of financing that offers the low monthly payments of a long-term mortgage (like a 30-year fixed) but requires the borrower to pay off the entire remaining balance in one large "balloon" payment at the end of a much shorter term (typically 5, 7, or 10 years).</p>

              <h3>How the Calculations Work</h3>
              <p>When you take out a balloon mortgage, the lender calculates your monthly payment as if the loan would last for 30 years. However, the legal contract states that the loan actually ends much sooner. Because the monthly payments are mostly interest in the early years, very little of the principal is paid down, resulting in a large balance due at the end.</p>

              <h3>Key Components of a Balloon Loan</h3>
              <ul>
                <li><strong>Principal:</strong> The initial amount borrowed.</li>
                <li><strong>Interest Rate:</strong> Usually lower than standard fixed-rate mortgages.</li>
                <li><strong>Amortization Period:</strong> The timeline used to set the monthly payment (e.g., 30 years).</li>
                <li><strong>Balloon Term:</strong> The actual duration of the loan (e.g., 7 years).</li>
              </ul>

              <h3>Why Choose a Balloon Mortgage?</h3>
              <p>Borrowers typically choose balloon mortgages for two main reasons:</p>
              <ol>
                <li><strong>Lower Monthly Payments:</strong> Interest rates on balloon loans are often lower than traditional 30-year mortgages, making them more affordable in the short term.</li>
                <li><strong>Short-Term Ownership:</strong> If you plan to sell the house or refinance before the balloon term ends, you can benefit from the lower rates without ever having to make the lump-sum payment.</li>
              </ol>

              <h3>The Risks Involved</h3>
              <p>The greatest danger of a balloon mortgage is <strong>refinance risk</strong>. If interest rates rise significantly or your property value drops before the balloon payment is due, you might find it impossible to refinance the balance. If you cannot pay the balloon payment in cash and cannot refinance, you may face foreclosure.</p>

              <h2>Strategies for Managing a Balloon Payment</h2>
              <p>To safely navigate a balloon mortgage, consider these strategies:</p>
              <ul>
                <li><strong>Refinance Early:</strong> Start looking for a traditional mortgage at least 6-12 months before the balloon date.</li>
                <li><strong>Sell the Property:</strong> List your home early enough to ensure a sale before the payment deadline.</li>
                <li><strong>Aggressive Savings:</strong> Set aside extra funds each month to chip away at the principal or build a cash reserve for the final payment.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/balloon-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/balloon-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default BalloonMortgageCalculator;

