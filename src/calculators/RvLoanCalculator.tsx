"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Truck } from "lucide-react";

const RvLoanCalculator = () => {
  const [price, setPrice] = useState("80000");
  const [downPayment, setDownPayment] = useState("15000");
  const [rate, setRate] = useState("7.99");
  const [term, setTerm] = useState("15"); // Years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price) - parseFloat(downPayment);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;

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
    setPrice("80000"); setDownPayment("15000"); setRate("7.99"); setTerm("15");
    setResults(null);
  };

  const faqs = [
    { question: "How long can you finance an RV?", answer: "RV loans can often be financed for up to 15 or 20 years, especially for larger motorhomes or expensive fifth wheels." },
    { question: "Is RV loan interest tax-deductible?", answer: "Similar to boats, if your RV has basic living facilities (bed, kitchen, bathroom), it may be considered a 'qualified home' by the IRS, making the interest tax-deductible." },
    { question: "What is the typical down payment for an RV?", answer: "Most lenders prefer 10-20% down. A larger down payment helps offset the rapid depreciation that RVs experience in their first few years." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "RV Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">RV Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate monthly payments and total costs for motorhomes, campers, and travel trailers.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="RV Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Truck className="h-5 w-5" /> Calculate Payment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Loan Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.monthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Loan Amount", value: 0, textValue: "$" + results.loanAmount.toLocaleString() },
                  { label: "Total Payback", value: 0, textValue: "$" + results.totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Payback Ratio", value: 0, textValue: ((results.totalCost / parseFloat(price)) * 100).toFixed(1) + "% of price" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Financing the Nomadic Lifestyle</h2>
              <p>An RV is more than just a vehicle; it's a home on wheels. Because of this, RV financing is specialized and often looks more like a mortgage than a car loan.</p>
              <h3>Long-Term RV Financing</h3>
              <p>High-end motorhomes can cost as much as a house, which is why lenders offer terms up to 240 months (20 years). While this makes the monthly payment manageable, it also means you will be paying interest for a long time. It's important to balance the monthly cost with the total amount you'll eventually pay.</p>
              <h3>Depreciation Considerations</h3>
              <p>RVs tend to lose value quickly, especially in the first few years. If you finance for 15 or 20 years with a small down payment, you might find yourself 'underwater' (owing more than the RV is worth) for a large portion of the loan term. This can be problematic if you need to sell or trade in the vehicle earlier than expected.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rv-loan" />
            <PopularCalculators exclude="/calculator/rv-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default RvLoanCalculator;

