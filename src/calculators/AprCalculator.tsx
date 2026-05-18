"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Percent } from "lucide-react";

const AprCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("10000");
  const [interestRate, setInterestRate] = useState("8");
  const [loanTerm, setLoanTerm] = useState("36");
  const [originationFee, setOriginationFee] = useState("200");
  const [otherFees, setOtherFees] = useState("50");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(loanAmount);
    const nomRate = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(loanTerm);
    const fees = parseFloat(originationFee) + parseFloat(otherFees);

    if (p <= 0 || nomRate < 0 || n <= 0) return;

    // Stated monthly payment
    const monthlyPayment = nomRate > 0
      ? (p * nomRate * Math.pow(1 + nomRate, n)) / (Math.pow(1 + nomRate, n) - 1)
      : p / n;

    // Net amount received (principal minus fees)
    const netAmount = p - fees;

    // Find APR using Newton-Raphson: find rate such that PV of payments = net amount
    let aprMonthly = nomRate;
    for (let i = 0; i < 100; i++) {
      const pv = monthlyPayment * (1 - Math.pow(1 + aprMonthly, -n)) / aprMonthly;
      const f = pv - netAmount;
      const df = monthlyPayment * (n * Math.pow(1 + aprMonthly, -(n + 1)) / aprMonthly - (1 - Math.pow(1 + aprMonthly, -n)) / (aprMonthly * aprMonthly));
      aprMonthly = aprMonthly - f / df;
      if (Math.abs(f) < 0.0001) break;
    }

    const apr = aprMonthly * 12 * 100;
    const totalPaid = monthlyPayment * n;
    const totalInterest = totalPaid - p;

    setResults({ monthlyPayment, apr, totalInterest, totalPaid, fees });
  };

  const reset = () => {
    setShowResults(false);
    setLoanAmount("10000"); setInterestRate("8"); setLoanTerm("36");
    setOriginationFee("200"); setOtherFees("50");
    setResults(null);
  };

  const faqs = [
    { question: "What is APR vs interest rate?", answer: "The interest rate is the cost of borrowing the principal, expressed as a percentage. The APR (Annual Percentage Rate) includes the interest rate PLUS fees and other costs, giving you the true annual cost of the loan." },
    { question: "Why is APR always higher than the interest rate?", answer: "Because APR incorporates upfront fees (like origination fees) into the effective rate. Since you pay fees but receive less net money, the true cost of the loan is higher than the stated interest rate alone." },
    { question: "How do I use APR to compare loans?", answer: "Always compare APRs, not just interest rates. A loan with a lower interest rate but higher fees may have a higher APR and cost more overall than a loan with a slightly higher rate but no fees." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "APR Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">APR Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate the true Annual Percentage Rate (APR) of any loan by factoring in fees and origination costs.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Stated Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Loan Term (Months)" value={loanTerm} onChange={setLoanTerm} />
                <InputField id="origfee" label="Origination Fee ($)" value={originationFee} onChange={setOriginationFee} />
                <InputField id="otherfee" label="Other Fees ($)" value={otherFees} onChange={setOtherFees} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Percent className="h-5 w-5" /> Calculate APR
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">True Cost Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">True APR</p>
                    <p className="text-5xl font-black text-foreground">{results.apr.toFixed(2)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">vs stated {interestRate}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Fees", value: 0, textValue: "$" + results.fees.toLocaleString() },
                  { label: "Total Interest", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Cost (Fees + Interest)", value: 0, textValue: "$" + (results.totalInterest + results.fees).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Understanding APR</h2>
              <p>The Annual Percentage Rate (APR) is the single most important number when comparing loan offers. Unlike the interest rate, it accounts for both the interest cost and any mandatory fees, giving you a complete picture of the true annual cost.</p>
              <h3>The Math Behind APR</h3>
              <p>To calculate APR, lenders determine the monthly payment based on the loan amount, then find what interest rate applied to the <em>net amount received</em> (loan amount minus fees) would produce that same payment. This is why APR is always equal to or higher than the stated interest rate.</p>
              <h3>When APR Can Be Misleading</h3>
              <p>APR is best for comparing loans of the <em>same term</em>. A $250 origination fee has a bigger APR impact on a 12-month loan than on a 5-year loan, because the fee is spread over fewer months. Always compare loans of similar term lengths using APR.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/apr" />
            <PopularCalculators exclude="/calculator/apr-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default AprCalculator;

