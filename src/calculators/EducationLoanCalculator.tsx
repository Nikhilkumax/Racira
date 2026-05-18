"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, GraduationCap } from "lucide-react";

const EducationLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("40000");
  const [interestRate, setInterestRate] = useState("9.5");
  const [gracePeriod, setGracePeriod] = useState("12"); // Months
  const [term, setTerm] = useState("10"); // Years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const g = parseFloat(gracePeriod);

    if (p <= 0 || r < 0 || n <= 0) return;

    // During grace period, interest typically accumulates (simple interest usually)
    const interestDuringGrace = p * (parseFloat(interestRate) / 100) * (g / 12);
    const principalAtRepayment = p + interestDuringGrace;

    // Monthly EMI post-grace
    const emi = r > 0 
      ? (principalAtRepayment * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : principalAtRepayment / n;

    const totalInterest = (emi * n) + interestDuringGrace;
    const totalPayback = (emi * n) + p;

    setResults({
      emi,
      interestDuringGrace,
      principalAtRepayment,
      totalInterest,
      totalPayback
    });
  };

  const reset = () => {
    setShowResults(false);
    setLoanAmount("40000"); setInterestRate("9.5"); setGracePeriod("12"); setTerm("10");
    setResults(null);
  };

  const faqs = [
    { question: "What is a moratorium period in an education loan?", answer: "A moratorium (or grace) period is a duration during your studies (and usually 6-12 months after) where you are not required to make full EMI payments. Interest may still accumulate during this time." },
    { question: "Does the interest rate change after graduation?", answer: "Usually, the interest rate is fixed or floating based on a benchmark and does not change specifically because you graduated, though market conditions might affect floating rates." },
    { question: "Are education loans tax-deductible?", answer: "In many countries, including the US (Student Loan Interest Deduction) and India (Section 80E), the interest paid on education loans can be deducted from your taxable income." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Education Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate your student loan payments including grace periods and accumulated interest.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="grace" label="Grace Period (Months)" value={gracePeriod} onChange={setGracePeriod} />
                <InputField id="term" label="Repayment Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <GraduationCap className="h-5 w-5" /> Calculate EMI
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Repayment Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly EMI (Post-Grace)</p>
                    <p className="text-5xl font-black text-foreground">${results.emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Interest During Study</p>
                    <p className="text-3xl font-black text-foreground">${results.interestDuringGrace.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Principal at Repayment", value: 0, textValue: "$" + results.principalAtRepayment.toLocaleString() },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Payback", value: 0, textValue: "$" + results.totalPayback.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Investing in Your Future</h2>
              <p>Education is one of the most valuable investments you can make, but the cost can be substantial. An education loan (or student loan) helps cover tuition, books, and living expenses while you focus on your studies.</p>
              <h3>The Grace Period Advantage</h3>
              <p>Most education loans offer a 'moratorium' or grace period, which typically lasts for the duration of your course plus an additional 6 to 12 months. This allows you to find a job and establish your finances before you have to start making full monthly payments.</p>
              <h3>Accumulated Interest</h3>
              <p>It's important to understand that in many cases, interest still accrues during the grace period. This interest is often 'capitalized,' meaning it is added to your original loan balance once you start repayment. Making small 'interest-only' payments while in school can significantly reduce your total loan cost.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/education-loan" />
            <PopularCalculators exclude="/calculator/education-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default EducationLoanCalculator;

