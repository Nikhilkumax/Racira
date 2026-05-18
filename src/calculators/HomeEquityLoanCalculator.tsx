"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const HomeEquityLoanCalculator = () => {
  const [value, setValue] = useState("500000");
  const [balance, setBalance] = useState("300000");
  const [rate, setRate] = useState("8.5");
  const [term, setTerm] = useState("15");
  const [ltv, setLtv] = useState("80");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const v = parseFloat(value);
    const b = parseFloat(balance);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const l = parseFloat(ltv) / 100;

    if (v <= 0 || r < 0 || n <= 0) return;

    // Max loan = (Value * LTV) - Current Balance
    const maxLoan = (v * l) - b;
    const availableEquity = Math.max(0, maxLoan);

    const monthly = r > 0 
      ? (availableEquity * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : availableEquity / n;

    setResults({
      availableEquity,
      monthly,
      totalInterest: (monthly * n) - availableEquity,
      totalEquityValue: v - b
    });
  };

  const reset = () => {
    setShowResults(false);
    setValue("500000"); setBalance("300000"); setRate("8.5");
    setTerm("15"); setLtv("80");
    setResults(null);
  };

  const faqs = [
    { question: "What is a home equity loan?", answer: "A home equity loan, also known as a 'second mortgage,' allows you to borrow a lump sum of cash using your home's equity as collateral. It typically has a fixed interest rate and a fixed repayment term." },
    { question: "How much can I borrow from my home's equity?", answer: "Most lenders allow you to borrow up to 80-85% of your home's total value, minus what you still owe on your primary mortgage." },
    { question: "What can I use a home equity loan for?", answer: "Home equity loans are commonly used for high-value expenses such as home renovations, debt consolidation, or major life events like tuition or medical bills." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home Equity Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Home Equity Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Determine how much cash you can borrow against your home's equity and estimate your monthly payments.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="value" label="Home Market Value ($)" value={value} onChange={setValue} />
                <InputField id="balance" label="Current Mortgage Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="ltv" label="Max LTV Ratio (%)" value={ltv} onChange={setLtv} tooltip="Lenders typically allow 80-85%." />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Home className="h-5 w-5" /> Calculate Equity Loan
                </button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Equity Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Max Borrowable Equity</p>
                    <p className="text-5xl font-black text-foreground">${results.availableEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-3xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Equity in Home", value: 0, textValue: "$" + results.totalEquityValue.toLocaleString() },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Loan Term", value: 0, textValue: term + " Years" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Unlocking Your Home's Value</h2>
              <p>For many homeowners, the equity in their home is their largest financial asset. A home equity loan provides a way to access that wealth without selling the property.</p>
              <h3>How Equity is Calculated</h3>
              <p>Equity is the difference between what your home is worth on the open market and what you still owe on your mortgage. If your home is worth $500,000 and your mortgage balance is $300,000, you have $200,000 in equity.</p>
              <h3>The LTV Limit</h3>
              <p>Lenders will rarely let you borrow 100% of your equity. Most use a <strong>Loan-to-Value (LTV)</strong> limit of around 80%. This means your total debt (primary mortgage + new equity loan) cannot exceed 80% of the home's value. This cushion protects the lender if home prices fall.</p>
              <h3>Home Equity Loan vs. HELOC</h3>
              <p>A home equity loan is a 'closed-end' loan. You get the money in one lump sum and pay it back with fixed monthly payments. This is different from a HELOC (Home Equity Line of Credit), which works more like a credit card where you can draw funds as needed and the rates are usually variable.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-equity-loan" />
            <PopularCalculators exclude="/calculator/home-equity-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default HomeEquityLoanCalculator;

