"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Banknote } from "lucide-react";

const PersonalLoanCalculator = () => {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("12");
  const [term, setTerm] = useState("36");
  const [fee, setFee] = useState("300");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term);
    const f = parseFloat(fee);

    if (p <= 0 || r < 0 || n <= 0) return;

    // Monthly payment formula
    const monthly = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    const totalRepayment = (monthly * n) + f;
    const totalInterest = (monthly * n) - p;
    
    // Simple APR approximation (including fee)
    const netProceeds = p - f;
    const apr = ((totalRepayment - netProceeds) / netProceeds) / (n / 12) * 100;

    setResults({
      monthly,
      totalRepayment,
      totalInterest,
      apr
    });
  };

  const reset = () => {
    setShowResults(false);
    setAmount("10000"); setRate("12"); setTerm("36"); setFee("300");
    setResults(null);
  };

  const faqs = [
    { question: "What is a personal loan used for?", answer: "Personal loans are versatile and can be used for debt consolidation, home improvements, medical bills, weddings, or unexpected emergencies." },
    { question: "Do personal loans require collateral?", answer: "Most personal loans are 'unsecured,' meaning they do not require collateral like your home or car. However, this means interest rates are typically higher than secured loans." },
    { question: "How does my credit score affect my rate?", answer: "Your credit score is the primary factor in determining your interest rate. Borrowers with excellent credit (740+) often qualify for the lowest rates, while those with lower scores may pay significantly more." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Personal Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Personal Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate monthly payments and total costs for unsecured personal loans.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={amount} onChange={setAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Months)" value={term} onChange={setTerm} />
                <InputField id="fee" label="Origination Fee ($)" value={fee} onChange={setFee} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Banknote className="h-5 w-5" /> Calculate Loan
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated APR</p>
                    <p className="text-3xl font-black text-foreground">{results.apr.toFixed(2)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Payback", value: 0, textValue: "$" + results.totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Origination Fee", value: 0, textValue: "$" + parseFloat(fee).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Is a Personal Loan Right for You?</h2>
              <p>Personal loans provide a lump sum of cash that you pay back over a fixed term with a fixed interest rate. They are a popular alternative to high-interest credit cards for consolidating debt or funding large expenses.</p>
              <h3>Fixed vs. Variable Rates</h3>
              <p>Most personal loans offer fixed rates, meaning your monthly payment will never change. This makes budgeting much easier compared to credit cards, which have variable rates that can fluctuate based on the market.</p>
              <h3>The Impact of Fees</h3>
              <p>Many lenders charge an 'origination fee' — a one-time fee taken out of the loan proceeds. For example, if you take a $10,000 loan with a 3% fee ($300), you will only receive $9,700 in your bank account, but you will still owe the full $10,000 plus interest. This is why it's important to look at the APR (Annual Percentage Rate) rather than just the interest rate.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/personal-loan" />
          <PopularCalculators exclude="/calculator/personal-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default PersonalLoanCalculator;

