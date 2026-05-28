"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, TrendingDown } from "lucide-react";

const RepaymentCalculator = () => {
  const [amount, setAmount] = useState("250000");
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("30");
  const [extra, setExtra] = useState("200");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const e = parseFloat(extra);

    if (p <= 0 || r < 0 || n <= 0) return;

    // Standard Payment
    const standardMonthly = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;
    
    const totalInterestStandard = (standardMonthly * n) - p;

    // With Extra Payment
    let balance = p;
    let months = 0;
    let totalInterestExtra = 0;
    const newMonthly = standardMonthly + e;

    while (balance > 0 && months < 600) {
      const interest = balance * r;
      totalInterestExtra += interest;
      balance = balance + interest - newMonthly;
      months++;
    }

    if (balance < 0) {
      // Adjustment for last month's overpayment is implicitly handled by the interest calculation loop
    }

    setResults({
      standardMonthly,
      newMonthly,
      originalMonths: n,
      newMonths: months,
      monthsSaved: n - months,
      interestSaved: totalInterestStandard - totalInterestExtra
    });
  };

  const reset = () => {
    setShowResults(false);
    setAmount("250000"); setRate("6.5"); setTerm("30"); setExtra("200");
    setResults(null);
  };

  const faqs = [
    { question: "How do extra payments affect my loan?", answer: "Extra payments go directly toward the principal balance. By reducing the principal faster, you decrease the amount of interest that accumulates every month, leading to a shorter loan term and massive interest savings." },
    { question: "Is it better to pay monthly or a yearly lump sum?", answer: "Paying monthly is slightly better because you reduce the principal balance earlier in the year, preventing more interest from accruing. However, any extra payment is better than none." },
    { question: "Should I pay off my mortgage or invest?", answer: "This depends on your mortgage interest rate vs. your expected investment return. If your mortgage rate is high (e.g. 7%), paying it off is a guaranteed 'return.' If it's low (e.g. 3%), you might earn more by investing in the stock market." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Repayment Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Loan Repayment Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">See how extra monthly payments can shave years off your loan and save you thousands in interest.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Balance ($)" value={amount} onChange={setAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Current Term (Years)" value={term} onChange={setTerm} />
                <InputField id="extra" label="Extra Monthly Payment ($)" value={extra} onChange={setExtra} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <TrendingDown className="h-5 w-5" /> Analyze Repayment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Savings Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Interest Saved</p>
                    <p className="text-5xl font-black text-foreground">${results.interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Time Saved</p>
                    <p className="text-3xl font-black text-foreground">{Math.floor(results.monthsSaved / 12)}y {results.monthsSaved % 12}m</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "New Monthly Payment", value: 0, textValue: "$" + results.newMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 }) },
                  { label: "Original Term", value: 0, textValue: (results.originalMonths / 12) + " Years" },
                  { label: "New Term", value: 0, textValue: (results.newMonths / 12).toFixed(1) + " Years" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Power of Extra Payments</h2>
              <p>Amortized loans, like mortgages and car loans, are front-loaded with interest. This means that in the early years of your loan, most of your monthly payment goes toward interest rather than the principal balance.</p>
              <h3>How it Works</h3>
              <p>By making even a small extra payment each month, you apply that money directly to the principal. This reduces the total balance on which interest is calculated for the following month. This compounding effect accelerates your progress and can significantly shorten your loan term.</p>
              <h3>Case Study: The $200 Difference</h3>
              <p>On a $250,000 mortgage at 6.5%, a monthly payment of $1,580 will pay the loan off in 30 years. By adding just $200 per month, you pay the loan off in roughly 22 years and save over $80,000 in interest. That's a massive return for a relatively small lifestyle adjustment.</p>
              <h3>Is it Always the Best Move?</h3>
              <p>While saving interest is great, you should first ensure you have a healthy emergency fund and have paid off higher-interest debt (like credit cards). If your mortgage interest rate is very low (e.g. under 4%), you might find that investing that extra $200 in a retirement account yields a better long-term financial outcome.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/repayment" />
          <PopularCalculators exclude="/calculator/repayment-calculator" />
        </div>
      </div>
    </>
  );
};

export default RepaymentCalculator;

