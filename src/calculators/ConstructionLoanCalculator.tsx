"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, HardHat } from "lucide-react";

const ConstructionLoanCalculator = () => {
  const [cost, setCost] = useState("400000");
  const [rate, setRate] = useState("7.5");
  const [period, setPeriod] = useState("12"); // Months
  const [term, setTerm] = useState("30"); // Years

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(cost);
    const r = parseFloat(rate) / 100 / 12;
    const g = parseFloat(period);
    const n = parseFloat(term) * 12;

    if (p <= 0 || r < 0 || n <= 0) return;

    // During construction, payment is interest-only on the drawn amount.
    // Assuming average draw is 50% for the duration.
    const avgDrawn = p * 0.5;
    const monthlyConstructionPayment = avgDrawn * r;
    const totalConstructionInterest = monthlyConstructionPayment * g;

    // Post-construction (Standard Mortgage)
    const postEMI = r > 0 
      ? (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : p / n;

    setResults({
      monthlyConstructionPayment,
      totalConstructionInterest,
      postEMI,
      totalInterest: totalConstructionInterest + (postEMI * n - p),
      totalPayback: p + (totalConstructionInterest + (postEMI * n - p))
    });
  };

  const reset = () => {
    setShowResults(false);
    setCost("400000"); setRate("7.5"); setPeriod("12"); setTerm("30");
    setResults(null);
  };

  const faqs = [
    { question: "How does a construction loan differ from a regular mortgage?", answer: "Construction loans are short-term loans that cover the cost of building a home. Once construction is complete, the loan is typically converted into a permanent mortgage." },
    { question: "What are 'draws' in a construction loan?", answer: "Draws are payments made to the contractor as different stages of the project are completed (e.g., foundation, framing, roofing). You only pay interest on the money that has been 'drawn' so far." },
    { question: "How much down payment is required for construction?", answer: "Lenders typically require a 20-30% down payment for construction loans because they are considered higher risk than purchasing an existing home." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Construction Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Construction Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate interest-only construction payments and your future permanent mortgage costs.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="cost" label="Total Project Cost ($)" value={cost} onChange={setCost} />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="period" label="Construction Period (Months)" value={period} onChange={setPeriod} />
                <InputField id="term" label="Post-Construction Term (Years)" value={term} onChange={setTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <HardHat className="h-5 w-5" /> Calculate Loan
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Construction Phase Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Avg. Construction Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.monthlyConstructionPayment.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-muted-foreground mt-2">(Interest-only on drawn amount)</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Post-Build EMI</p>
                    <p className="text-3xl font-black text-foreground">${results.postEMI.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Construction Interest", value: 0, textValue: "$" + results.totalConstructionInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Interest (All Phases)", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Project Cost", value: 0, textValue: "$" + results.totalPayback.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Building Your Dream Home</h2>
              <p>Construction loans are a unique financial product designed to help you build a home from the ground up. Unlike a traditional mortgage, the money is not given all at once, but in stages as work progresses.</p>
              <h3>The Construction-to-Permanent Loan</h3>
              <p>Many borrowers choose a 'construction-to-permanent' loan (also called a 'one-time close' loan). During the construction phase, you only pay interest on the funds that have been disbursed. Once the certificate of occupancy is issued, the loan automatically converts into a traditional mortgage.</p>
              <h3>Why Interest Only?</h3>
              <p>During the building process, you likely have other living expenses (like rent or another mortgage). Paying interest-only on the construction loan helps keep your monthly costs lower while you wait for your new home to be completed. The interest is calculated on the 'average drawn balance,' which grows as the project nears completion.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/construction-loan" />
          <PopularCalculators exclude="/calculator/construction-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConstructionLoanCalculator;

