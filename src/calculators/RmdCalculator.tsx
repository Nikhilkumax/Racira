"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calendar } from "lucide-react";

const RmdCalculator = () => {
  const [balance, setBalance] = useState("500000");
  const [age, setAge] = useState("73");
  const [birthYear, setBirthYear] = useState("1951");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // IRS Uniform Lifetime Table (simplified key values)
  const ulsTable: Record<number, number> = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
    78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7,
    84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9,
    90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9,
  };

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseInt(age);
    const b = parseFloat(balance);
    const distributionPeriod = ulsTable[a] || ulsTable[95] || 8.9;
    const rmd = b / distributionPeriod;
    const monthlyRmd = rmd / 12;
    const penalty = rmd * 0.25; // 25% penalty if not taken
    setResults({ rmd, monthlyRmd, distributionPeriod, penalty });
  };

  const reset = () => {
    setShowResults(false); setBalance("500000"); setAge("73"); setBirthYear("1951"); setResults(null); };

  const faqs = [
    { question: "When must I start taking RMDs?", answer: "Under SECURE 2.0 (2023), RMDs must begin at age 73 for those who turned 72 after Dec 31, 2022. The age will increase to 75 in 2033." },
    { question: "What is the penalty for missing an RMD?", answer: "The penalty for not taking a required RMD is 25% of the amount not withdrawn. This was reduced from 50% by SECURE 2.0. It can be reduced to 10% if corrected promptly." },
    { question: "Do Roth IRAs have RMDs?", answer: "Roth IRAs do NOT have RMDs during your lifetime. However, inherited Roth IRAs typically do have distribution requirements." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "RMD Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">RMD Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate your Required Minimum Distribution from Traditional IRAs and 401(k)s using the IRS Uniform Lifetime Table.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-3 gap-6 mb-6">
                <InputField id="bal" label="Account Balance ($)" value={balance} onChange={setBalance} />
                <InputField id="age" label="Your Age" value={age} onChange={setAge} />
                <InputField id="by" label="Birth Year" value={birthYear} onChange={setBirthYear} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calendar className="h-5 w-5" /> Calculate RMD</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">RMD Calculation</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Annual RMD Required</p>
                    <p className="text-5xl font-black text-foreground">${results.rmd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly Equivalent</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyRmd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "IRS Distribution Period", value: 0, textValue: results.distributionPeriod + " years" },
                  { label: "Penalty if Missed (25%)", value: 0, textValue: "$" + results.penalty.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "% of Balance Withdrawn", value: 0, textValue: ((results.rmd / parseFloat(balance)) * 100).toFixed(2) + "%" },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Understanding Required Minimum Distributions</h2>
              <p>RMDs are mandatory annual withdrawals the IRS requires you to take from tax-deferred retirement accounts. The purpose is to ensure the government eventually collects taxes on money that grew tax-deferred.</p>
              <h3>How RMDs Are Calculated</h3>
              <p>Your RMD is calculated by dividing your prior December 31 account balance by a life expectancy factor from the IRS Uniform Lifetime Table. The factor decreases as you age, meaning the percentage you must withdraw increases over time.</p>
              <h3>Multiple Accounts</h3>
              <p>If you have multiple Traditional IRAs, you can calculate the RMD separately for each but take the total from any one or combination of accounts. For 401(k)s, the RMD must be taken separately from each account.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rmd" />
            <PopularCalculators exclude="/calculator/rmd-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default RmdCalculator;

