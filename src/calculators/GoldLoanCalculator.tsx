"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Coins } from "lucide-react";

const GoldLoanCalculator = () => {
  const [weight, setWeight] = useState("50");
  const [karat, setKarat] = useState("22");
  const [pricePerGram, setPricePerGram] = useState("75");
  const [ltv, setLtv] = useState("75");
  const [interestRate, setInterestRate] = useState("10");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const w = parseFloat(weight);
    const k = parseFloat(karat);
    const p = parseFloat(pricePerGram);
    const l = parseFloat(ltv) / 100;
    const r = parseFloat(interestRate) / 100 / 12;

    if (w <= 0 || p <= 0) return;

    // Adjust price for purity
    const purityMultiplier = k / 24;
    const goldValue = w * p * purityMultiplier;
    const eligibleLoan = goldValue * l;
    const monthlyInterest = eligibleLoan * r;

    setResults({
      goldValue,
      eligibleLoan,
      monthlyInterest,
      purityMultiplier
    });
  };

  const reset = () => {
    setShowResults(false);
    setWeight("50"); setKarat("22"); setPricePerGram("75"); setLtv("75"); setInterestRate("10");
    setResults(null);
  };

  const faqs = [
    { question: "What is a gold loan?", answer: "A gold loan is a secured loan where you provide gold jewelry or coins as collateral to a lender in exchange for a lump sum of cash." },
    { question: "What is the maximum LTV for a gold loan?", answer: "The Loan-to-Value (LTV) ratio is typically capped at 75% by most central banks or lenders to protect against fluctuations in gold prices." },
    { question: "Do gold loans require a high credit score?", answer: "Since the loan is secured by physical gold, lenders are often much more lenient with credit scores. Many people use gold loans when they have poor credit but need immediate liquidity." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Gold Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Gold Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate your eligible loan amount and monthly interest based on your gold's weight and purity.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="weight" label="Gold Weight (grams)" value={weight} onChange={setWeight} />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Purity (Karat)</label>
                  <select value={karat} onChange={(e) => setKarat(e.target.value)} className="input-calc">
                    <option value="24">24K (99.9%)</option>
                    <option value="22">22K (91.6%)</option>
                    <option value="18">18K (75.0%)</option>
                    <option value="14">14K (58.3%)</option>
                  </select>
                </div>
                <InputField id="price" label="Gold Price (per gram) ($)" value={pricePerGram} onChange={setPricePerGram} />
                <InputField id="ltv" label="LTV Ratio (%)" value={ltv} onChange={setLtv} tooltip="Usually 75% max." />
                <InputField id="rate" label="Interest Rate (%)" value={interestRate} onChange={setInterestRate} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5" /> Calculate Loan
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Loan Estimation</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Eligible Loan Amount</p>
                    <p className="text-5xl font-black text-foreground">${results.eligibleLoan.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Interest</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Market Value of Gold", value: 0, textValue: "$" + results.goldValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Purity Factor", value: 0, textValue: (results.purityMultiplier * 100).toFixed(1) + "%" },
                  { label: "Annual Interest Cost", value: 0, textValue: "$" + (results.monthlyInterest * 12).toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Liquidity from Your Assets</h2>
              <p>Gold has been a store of value for thousands of years. A gold loan allows you to unlock that value for immediate needs without having to sell your precious items.</p>
              <h3>How Purity Affects Your Loan</h3>
              <p>Gold purity is measured in Karats. 24K gold is pure gold, while 22K or 18K gold is mixed with other metals for durability. Lenders only calculate the loan based on the actual gold content. For example, if you have 10 grams of 18K gold, the lender treats it as 7.5 grams of pure gold.</p>
              <h3>The Risks of a Gold Loan</h3>
              <p>The primary risk of a gold loan is 'margin calls.' If the global price of gold drops significantly, the value of your collateral might fall below the required LTV ratio. In such cases, the lender may ask you to pay back a portion of the loan or provide more gold to maintain the ratio.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gold-loan" />
            <PopularCalculators exclude="/calculator/gold-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default GoldLoanCalculator;

