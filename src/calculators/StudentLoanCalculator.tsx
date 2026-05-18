"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, GraduationCap } from "lucide-react";

const StudentLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("37000");
  const [interestRate, setInterestRate] = useState("5.5");
  const [term, setTerm] = useState("10"); // Years
  const [income, setIncome] = useState("55000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const inc = parseFloat(income);

    if (p <= 0 || r < 0 || n <= 0) return;

    // Standard Payment
    const standardEmi = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    // Income-Driven Repayment (IDR) - simplified (10% of discretionary income over 150% poverty line)
    // Assuming $22,000 as 150% poverty line for a single person
    const discretionaryIncome = Math.max(0, inc - 22000);
    const idrMonthly = (discretionaryIncome * 0.10) / 12;

    setResults({
      standardEmi,
      idrMonthly,
      totalInterestStandard: (standardEmi * n) - p,
      totalPaybackStandard: standardEmi * n
    });
  };

  const reset = () => {
    setShowResults(false);
    setLoanAmount("37000"); setInterestRate("5.5"); setTerm("10"); setIncome("55000");
    setResults(null);
  };

  const faqs = [
    { question: "What is an Income-Driven Repayment (IDR) plan?", answer: "IDR plans set your monthly student loan payment at a percentage of your discretionary income. If your income is low, your payment could be as low as $0 per month." },
    { question: "How long is the standard student loan repayment term?", answer: "The standard repayment plan for federal student loans is 10 years, though you can extend this to 20 or 25 years through consolidation or extended plans." },
    { question: "Can student loans be forgiven?", answer: "Federal loans may be forgiven after 10 years of payments under Public Service Loan Forgiveness (PSLF), or after 20-25 years on an IDR plan." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Student Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Student Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Compare standard repayment plans with income-driven options for your student debt.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Total Debt ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Term (Years)" value={term} onChange={setTerm} />
                <InputField id="income" label="Annual Income ($)" value={income} onChange={setIncome} tooltip="Used to estimate IDR payments." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <GraduationCap className="h-5 w-5" /> Analyze Repayment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Repayment Comparison</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Standard Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.standardEmi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">IDR Estimate</p>
                    <p className="text-3xl font-black text-foreground">${results.idrMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest (Standard)", value: 0, textValue: "$" + results.totalInterestStandard.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Payback (Standard)", value: 0, textValue: "$" + results.totalPaybackStandard.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Discretionary Income", value: 0, textValue: "$" + (parseFloat(income) - 22000).toLocaleString() },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Managing Student Debt</h2>
              <p>Student loans are a common way to finance higher education, but they require careful management to ensure they don't become a long-term financial burden.</p>
              <h3>Standard vs. IDR Plans</h3>
              <p>The <strong>Standard Repayment Plan</strong> is the fastest way to pay off your loans and results in the lowest total interest paid. However, the monthly payments can be high for new graduates. <strong>Income-Driven Repayment (IDR)</strong> plans adjust your payment based on what you earn, providing a safety net if your starting salary is lower than expected.</p>
              <h3>The Importance of Interest Rates</h3>
              <p>Unlike some other loans, student loan interest is often calculated daily. This means that interest begins to accrue as soon as the loan is disbursed. Over a 10 or 20-year term, even a 1% difference in interest rate can significantly change the total amount you repay.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/student-loan" />
            <PopularCalculators exclude="/calculator/student-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default StudentLoanCalculator;

