"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Shield } from "lucide-react";

const FhaLoanCalculator = () => {
  const [price, setPrice] = useState("300000");
  const [downPayment, setDownPayment] = useState("10500"); // 3.5%
  const [rate, setRate] = useState("6.5");
  const [term, setTerm] = useState("30");
  const [upfrontMip, setUpfrontMip] = useState("1.75");
  const [annualMip, setAnnualMip] = useState("0.55");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const p = parseFloat(price);
    const d = parseFloat(downPayment);
    const baseLoan = p - d;
    const umip = baseLoan * (parseFloat(upfrontMip) / 100);
    const totalLoan = baseLoan + umip;
    
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(term) * 12;
    const amipRate = parseFloat(annualMip) / 100 / 12;

    if (totalLoan <= 0 || r < 0 || n <= 0) return;

    const monthlyPI = r > 0 
      ? (totalLoan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : totalLoan / n;

    const monthlyMip = totalLoan * amipRate;
    const totalMonthly = monthlyPI + monthlyMip;

    setResults({
      totalLoan,
      upfrontMipAmount: umip,
      monthlyPI,
      monthlyMip,
      totalMonthly,
      totalInterest: (monthlyPI * n) - totalLoan
    });
  };

  const reset = () => {
    setShowResults(false);
    setPrice("300000"); setDownPayment("10500"); setRate("6.5");
    setTerm("30"); setUpfrontMip("1.75"); setAnnualMip("0.55");
    setResults(null);
  };

  const faqs = [
    { question: "What is an FHA loan?", answer: "An FHA loan is a mortgage insured by the Federal Housing Administration. It is designed for low-to-moderate-income borrowers who may have lower credit scores or smaller down payments." },
    { question: "What is the minimum down payment for an FHA loan?", answer: "The minimum down payment for an FHA loan is 3.5% for borrowers with a credit score of 580 or higher. For scores between 500 and 579, a 10% down payment is required." },
    { question: "Does FHA mortgage insurance ever go away?", answer: "For most FHA loans with a down payment of less than 10%, Mortgage Insurance Premiums (MIP) stay for the entire life of the loan. If you put 10% or more down, it may be removed after 11 years." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "FHA Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">FHA Loan Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate monthly FHA payments including upfront and annual mortgage insurance (MIP).</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Home Price ($)" value={price} onChange={setPrice} />
                <InputField id="down" label="Down Payment ($)" value={downPayment} onChange={setDownPayment} tooltip="Min 3.5% for 580+ credit." />
                <InputField id="rate" label="Interest Rate (%)" value={rate} onChange={setRate} />
                <InputField id="term" label="Term (Years)" value={term} onChange={setTerm} />
                <InputField id="umip" label="Upfront MIP (%)" value={upfrontMip} onChange={setUpfrontMip} />
                <InputField id="amip" label="Annual MIP (%)" value={annualMip} onChange={setAnnualMip} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Shield className="h-5 w-5" /> Calculate FHA Payment
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">FHA Loan Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Total Monthly Payment</p>
                    <p className="text-5xl font-black text-foreground">${results.totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Monthly MIP</p>
                    <p className="text-3xl font-black text-foreground">${results.monthlyMip.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Loan Amount", value: 0, textValue: "$" + results.totalLoan.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Upfront MIP Financed", value: 0, textValue: "$" + results.upfrontMipAmount.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Total Interest Paid", value: 0, textValue: "$" + results.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Benefits of FHA Loans</h2>
              <p>FHA loans are one of the most popular options for first-time homebuyers because they offer more flexible qualifying requirements than conventional mortgages.</p>
              <h3>Low Down Payment Requirements</h3>
              <p>While many conventional loans require 5-20% down, an FHA loan allows you to buy a home with as little as 3.5% of the purchase price. This makes homeownership accessible much earlier for people who are still building their savings.</p>
              <h3>Understanding MIP (Mortgage Insurance Premium)</h3>
              <p>Because FHA loans have lower down payments and credit requirements, they are seen as higher risk for lenders. To offset this, the FHA requires <strong>Mortgage Insurance Premiums</strong>. There are two types:</p>
              <ul>
                <li><strong>Upfront MIP:</strong> Usually 1.75% of the loan amount, typically added to your total loan balance at closing.</li>
                <li><strong>Annual MIP:</strong> Paid monthly as part of your mortgage payment. The rate depends on the loan amount, term, and LTV ratio.</li>
              </ul>
              <h3>Credit Flexibility</h3>
              <p>FHA loans allow for credit scores as low as 500 (with 10% down) or 580 (with 3.5% down). They also allow for higher debt-to-income ratios than many other loan programs.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fha-loan" />
          <PopularCalculators exclude="/calculator/fha-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default FhaLoanCalculator;

