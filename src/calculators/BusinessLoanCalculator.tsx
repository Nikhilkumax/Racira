"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Briefcase } from "lucide-react";

const BusinessLoanCalculator = () => {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("9");
  const [term, setTerm] = useState("60");
  const [revenue, setRevenue] = useState("5000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term);
    const rev = parseFloat(revenue);

    if (p <= 0 || r < 0 || n <= 0) return;

    const monthly = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    const totalInterest = (monthly * n) - p;
    const totalPayback = monthly * n;
    
    // Monthly profit increase after loan payment
    const netMonthlyGain = rev - monthly;

    setResults({
      monthly,
      totalInterest,
      totalPayback,
      netMonthlyGain,
      breakEvenMonths: p / rev
    });
  };

  const reset = () => {
    setShowResults(false);
    setAmount("100000"); setRate("9"); setTerm("60"); setRevenue("5000");
    setResults(null);
  };

  const faqs = [
    { question: "What is the typical interest rate for a business loan?", answer: "Rates vary widely. SBA loans might be 6-9%, while traditional bank loans range from 5-10%. Alternative lenders or merchant cash advances can have significantly higher effective rates." },
    { question: "Do I need a personal guarantee for a business loan?", answer: "Most small business lenders require a personal guarantee, meaning you are personally responsible for the debt if the business cannot pay." },
    { question: "How much can I borrow for my business?", answer: "Lenders typically look at your annual revenue, time in business, and credit score. A common rule of thumb is that you can borrow 10-30% of your annual gross revenue." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Business Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Business Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate payments and analyze the ROI of borrowing for your business growth.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="amount" label="Loan Amount ($)" value={amount} onChange={setAmount} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Term (Months)" value={term} onChange={setTerm} />
                <InputField id="revenue" label="Expected Monthly Revenue Increase ($)" value={revenue} onChange={setRevenue} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Briefcase className="h-5 w-5" /> Analyze Business Loan
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Monthly ROI</p>
                    <p className={`text-3xl font-black ${results.netMonthlyGain >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ${results.netMonthlyGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Interest", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Payback", value: 0, textValue: "$" + results.totalPayback.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Investment Break-Even", value: 0, textValue: Math.ceil(results.breakEvenMonths) + " Months" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Fueling Your Business Growth</h2>
              <p>Borrowing money for your business is a strategic decision. Unlike personal debt, business debt is often used to generate more income than the cost of the loan itself.</p>
              <h3>Types of Business Loans</h3>
              <p>There are several options for business financing:</p>
              <ul>
                <li><strong>Term Loans:</strong> A lump sum paid back over a set period. Good for large equipment or expansions.</li>
                <li><strong>SBA Loans:</strong> Government-backed loans that offer lower rates and longer terms for small businesses.</li>
                <li><strong>Lines of Credit:</strong> Flexible borrowing up to a certain limit, only paying interest on what you use.</li>
              </ul>
              <h3>Analyzing the ROI</h3>
              <p>When taking a business loan, you should always calculate the expected return on investment. If a $100,000 loan costs you $2,000 per month but allows you to increase your monthly revenue by $5,000, the 'net' gain is $3,000 per month. This is the hallmark of healthy business debt.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/business-loan" />
            <PopularCalculators exclude="/calculator/business-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BusinessLoanCalculator;

