"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Ship } from "lucide-react";

const BoatLoanCalculator = () => {
  const [price, setPrice] = useState("50000");
  const [downPayment, setDownPayment] = useState("10000");
  const [rate, setRate] = useState("7.5");
  const [term, setTerm] = useState("12"); // Years

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
    setPrice("50000"); setDownPayment("10000"); setRate("7.5"); setTerm("12");
    setResults(null);
  };

  const faqs = [
    { question: "How long can I finance a boat for?", answer: "Boat loans often have longer terms than car loans, sometimes up to 15 or 20 years for larger vessels, as they are often treated similarly to real estate." },
    { question: "Do boat loans require a survey?", answer: "For used boats over a certain value or age, many lenders require a marine survey to verify the vessel's condition and market value before approving the loan." },
    { question: "Is boat loan interest tax-deductible?", answer: "In some cases, if the boat has sleeping, cooking, and toilet facilities, it may qualify as a 'second home' for federal tax deduction purposes on interest paid." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Boat Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Boat Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your monthly boat payments and total interest for new or used vessels.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Boat Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Loan Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Ship className="h-5 w-5" /> Calculate Payment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Payment Analysis</h2>
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
                  { label: "Monthly Cost / $10k", value: 0, textValue: "$" + ((results.monthly / results.loanAmount) * 10000).toFixed(2) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Setting Sail with Financing</h2>
              <p>Owning a boat is a dream for many, but the upfront cost can be significant. Boat financing allows you to spread that cost over many years, often with terms much longer than a standard car loan.</p>
              <h3>Marine Finance Terms</h3>
              <p>Because boats, especially larger yachts, can maintain their value longer than cars, lenders are often willing to offer 10, 15, or even 20-year terms. However, be aware that longer terms mean significantly more interest paid over the life of the loan.</p>
              <h3>New vs. Used Boats</h3>
              <p>Lenders typically offer better rates for new boats. For used boats, the rate will depend on the age of the vessel and whether it has been surveyed by a certified marine surveyor. Some lenders won't finance boats over 10-15 years old.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boat-loan" />
            <PopularCalculators exclude="/calculator/boat-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BoatLoanCalculator;

