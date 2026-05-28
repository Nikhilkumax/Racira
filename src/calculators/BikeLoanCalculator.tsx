"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Bike } from "lucide-react";

const BikeLoanCalculator = () => {
  const [price, setPrice] = useState("15000");
  const [downPayment, setDownPayment] = useState("3000");
  const [rate, setRate] = useState("8.5");
  const [term, setTerm] = useState("48");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price) - parseFloat(downPayment);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term);

    if (p <= 0 || r < 0 || n <= 0) return;

    const monthly = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    const totalInterest = (monthly * n) - p;
    const totalCost = (monthly * n) + parseFloat(downPayment);

    setResults({
      monthly,
      totalInterest,
      totalCost,
      loanAmount: p
    });
  };

  const reset = () => {
    setShowResults(false);
    setPrice("15000"); setDownPayment("3000"); setRate("8.5"); setTerm("48");
    setResults(null);
  };

  const faqs = [
    { question: "Are bike loan rates higher than car loans?", answer: "Generally, yes. Because motorcycles are considered luxury items and have higher risks of theft or accidents, lenders often charge slightly higher interest rates than for cars." },
    { question: "What credit score do I need for a bike loan?", answer: "Most lenders look for a score of at least 620, but the best rates are reserved for 'super-prime' borrowers with scores above 720." },
    { question: "Can I finance a used motorcycle?", answer: "Yes, many lenders offer used bike financing, though interest rates may be 1-2% higher than for new models." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bike Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bike Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Plan your motorcycle purchase with our detailed EMI and interest calculator.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Bike Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Months)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Bike className="h-5 w-5" /> Calculate EMI
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Payment Breakdown</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly EMI</p>
                    <p className="text-5xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Loan Amount", value: 0, textValue: "$" + results.loanAmount.toLocaleString() },
                  { label: "Total Cost of Bike", value: 0, textValue: "$" + results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Term", value: 0, textValue: term + " Months" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Financing Your Ride</h2>
              <p>Whether you're looking for a weekend cruiser or a daily commuter, understanding the financial side of motorcycle ownership is key to a stress-free experience.</p>
              <h3>Interest Rates and Terms</h3>
              <p>Motorcycle loans typically range from 24 to 72 months. While longer terms result in smaller monthly payments, they also mean you'll pay much more in interest over time. Aiming for a term of 48 months or less is often the best balance of affordability and total cost.</p>
              <h3>The Down Payment Strategy</h3>
              <p>Putting at least 10-20% down on a bike is highly recommended. Motorcycles depreciate quickly, and a solid down payment ensures you won't end up 'upside down' (owing more than the bike is worth) if you decide to sell it in a year or two.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bike-loan" />
          <PopularCalculators exclude="/calculator/bike-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default BikeLoanCalculator;

