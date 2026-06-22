"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const InterestRateCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("25000");
  const [monthlyPayment, setMonthlyPayment] = useState("500");
  const [loanTerm, setLoanTerm] = useState("60");
  const [showResults, setShowResults] = useState(false);

  const [result, setResult] = useState<{ rate: number; totalInterest: number; totalPaid: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const P = parseFloat(loanAmount) || 0;
    const M = parseFloat(monthlyPayment) || 0;
    const n = parseFloat(loanTerm) || 0;
    if (P <= 0 || M <= 0 || n <= 0) return;

    // Newton's method to find monthly rate
    let r = 0.005; // initial guess
    for (let i = 0; i < 100; i++) {
      const top = M - M * Math.pow(1 + r, -n) - P * r;
      const dTop = M * n * Math.pow(1 + r, -(n + 1)) - P;
      if (Math.abs(dTop) < 1e-14) break;
      const rNew = r - top / dTop;
      if (Math.abs(rNew - r) < 1e-10) { r = rNew; break; }
      r = rNew;
    }

    const annualRate = r * 12 * 100;
    const totalPaid = M * n;

    setResult({ rate: annualRate, totalInterest: totalPaid - P, totalPaid });
  };

  const reset = () => {
    setShowResults(false); setLoanAmount("25000"); setMonthlyPayment("500"); setLoanTerm("60"); setResult(null); };

  const faqs = [
    { question: "How is the interest rate calculated from payments?", answer: "We use Newton's method (numerical iteration) to solve the amortization formula for the interest rate. Given the loan amount, monthly payment, and term, the calculator finds the rate that makes the equation balance." },
    { question: "Why would I need to find the interest rate?", answer: "This is useful when you know the loan amount and payment but not the exact rate — for example, when comparing loan offers that quote different terms, or when reverse-engineering the rate on an existing loan." },
    { question: "Is this the APR?", answer: "The calculated rate is the nominal annual interest rate. The APR may be slightly different if fees are included. For a more accurate APR that includes fees, use our Loan Calculator with the processing fee feature." },
    { question: "What if the payment is too low?", answer: "If the monthly payment doesn't cover the interest on the principal, the loan would never be paid off (negative amortization). The calculator requires the payment to be sufficient to eventually pay off the loan." },
    { question: "How accurate is the result?", answer: "The numerical method used is accurate to at least 6 decimal places. The result matches what financial institutions use for rate calculations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Interest Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Interest Rate Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="loan" label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" />
                <InputField id="payment" label="Monthly Payment" value={monthlyPayment} onChange={setMonthlyPayment} prefix="$" />
                <InputField id="term" label="Loan Term (Months)" value={loanTerm} onChange={setLoanTerm} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Find Rate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Results</h2>
                <ResultDisplay items={[
                  { label: "Annual Interest Rate", value: 0, textValue: `${result.rate.toFixed(3)}%`, highlight: true },
                  { label: "Total Interest", value: result.totalInterest },
                  { label: "Total Paid", value: result.totalPaid },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>What Is an Interest Rate Calculator?</h2>
              <p>An interest rate calculator determines the annual interest rate (APR) on a loan when you know the loan amount, monthly payment, and term length. This is essentially the reverse of a standard loan calculator — instead of calculating the payment from the rate, it calculates the rate from the payment.</p>
              <p>This tool is invaluable when you receive a loan offer that quotes a monthly payment but not the interest rate, or when you want to verify the rate on an existing loan.</p>

              <h2>How the Calculation Works</h2>
              <p>There is no direct algebraic solution for the interest rate in the standard amortization formula. Instead, our calculator uses Newton's method — an iterative numerical technique that converges on the exact rate with high precision. The algorithm typically finds the answer in fewer than 20 iterations.</p>
              <p>The formula being solved is: M = P × r(1+r)^n / [(1+r)^n - 1], where M is the monthly payment, P is the principal, r is the monthly rate, and n is the number of payments. We find the value of r that satisfies this equation.</p>

              <h2>Practical Applications</h2>
              <ul>
                <li><strong>Comparing loan offers:</strong> When different lenders quote different combinations of payments and terms, finding the implied rate helps you compare apples to apples.</li>
                <li><strong>Verifying existing loans:</strong> Double-check the interest rate on current loans by entering your balance, payment, and remaining term.</li>
                <li><strong>Negotiation leverage:</strong> If a dealer quotes "only $400/month" on a car loan, calculating the implied rate reveals whether it's actually a good deal.</li>
                <li><strong>Refinancing decisions:</strong> Compare your current implied rate with available refinancing rates to determine if refinancing makes sense.</li>
              </ul>

              <h2>Understanding Interest Rates</h2>
              <p>The interest rate is the cost of borrowing money, expressed as a percentage of the outstanding balance. Even small differences in rates can have a significant impact over the life of a loan. On a $25,000 loan over 60 months, the difference between 5% and 7% APR is approximately $1,350 in total interest.</p>

              <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> This calculator provides estimates for educational purposes only. The calculated rate is the nominal annual rate, which may differ from the APR if fees are involved. This is not financial advice.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/interest-rate-calculator" />
          <PopularCalculators exclude="/interest-rate-calculator" />
        </div>
      </div>
    </>
  );
};

export default InterestRateCalculator;


