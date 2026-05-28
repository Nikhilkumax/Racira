"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const HomeLoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState("300000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [downPayment, setDownPayment] = useState("60000");
  const [propertyTax, setPropertyTax] = useState("3600");
  const [insurance, setInsurance] = useState("1200");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(loanAmount) - parseFloat(downPayment);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseFloat(loanTerm) * 12;
    const tax = parseFloat(propertyTax) / 12;
    const ins = parseFloat(insurance) / 12;

    if (p <= 0 || r <= 0 || n <= 0) return;

    const monthlyPI = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalMonthly = monthlyPI + tax + ins;
    const totalPayment = totalMonthly * n;
    const totalInterest = (monthlyPI * n) - p;

    setResults({
      monthlyPI,
      totalMonthly,
      totalInterest,
      totalPayment,
      loanAmount: p
    });
  };

  const reset = () => {
    setShowResults(false);
    setLoanAmount("300000"); setInterestRate("6.5"); setLoanTerm("30");
    setDownPayment("60000"); setPropertyTax("3600"); setInsurance("1200");
    setResults(null);
  };

  const faqs = [
    { question: "What is the difference between a home loan and a mortgage?", answer: "Technically, a 'home loan' is the money you borrow, while the 'mortgage' is the legal agreement that uses your home as collateral for that loan. In common usage, they are often used interchangeably." },
    { question: "How much down payment do I need for a home loan?", answer: "While 20% is the traditional gold standard to avoid Private Mortgage Insurance (PMI), many programs allow for as little as 3% or 3.5% (FHA) down. Some VA and USDA loans require 0% down." },
    { question: "Can I pay off my home loan early?", answer: "Most modern home loans do not have prepayment penalties, meaning you can make extra payments toward the principal to save on interest and shorten the loan term." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your monthly mortgage payments including taxes and insurance.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Property Price ($)" value={loanAmount} onChange={setLoanAmount} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
                <InputField id="term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} />
                <InputField id="tax" label="Annual Property Tax ($)" value={propertyTax} onChange={setPropertyTax} />
                <InputField id="ins" label="Annual Insurance ($)" value={insurance} onChange={setInsurance} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Home className="h-5 w-5" /> Calculate Payment
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Payment Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Principal & Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyPI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Loan Amount", value: 0, textValue: "$" + results.loanAmount.toLocaleString() },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Cost of Loan", value: 0, textValue: "$" + results.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Understanding Your Home Loan</h2>
              <p>Buying a home is likely the largest financial commitment you will ever make. A home loan, or mortgage, allows you to spread the cost of the property over many years, making it accessible even if you don't have the full purchase price in cash.</p>
              <h3>Components of a Mortgage Payment</h3>
              <p>Most home loan payments consist of four main parts, often referred to as PITI:</p>
              <ul>
                <li><strong>Principal:</strong> The actual amount of money you borrowed.</li>
                <li><strong>Interest:</strong> The cost charged by the lender for using their money.</li>
                <li><strong>Taxes:</strong> Real estate or property taxes charged by your local government.</li>
                <li><strong>Insurance:</strong> Homeowners insurance to protect against damage, and potentially PMI if your down payment was low.</li>
              </ul>
              <h3>How Interest Rates Affect You</h3>
              <p>Even a small difference in your interest rate can result in tens of thousands of dollars in savings or costs over the life of a 30-year loan. For example, on a $300,000 loan, the difference between a 6% and 7% interest rate is roughly $200 per month and over $70,000 in total interest.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-loan" />
          <PopularCalculators exclude="/calculator/home-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default HomeLoanCalculator;

