"use client";
import { RotateCcw, User, DollarSign, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import InputField from "@/domains/calculator/components/ui/InputField";
const ReverseMortgageCalculator = () => {
  const [homeValue, setHomeValue] = useState("450000");
  const [mortgageBalance, setMortgageBalance] = useState("100000");
  const [age, setAge] = useState("65");
  const [interestRate, setInterestRate] = useState("7.2");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(homeValue) || 0;
    const balance = parseFloat(mortgageBalance) || 0;
    const borrowerAge = parseInt(age) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100;

    if (borrowerAge < 62) {
      setResults({ error: "Borrower must be at least 62 years old for a HECM reverse mortgage." });
      return;
    }

    // Principal Limit Factor (simplified estimate based on HUD tables)
    // Age 62: ~40%, Age 75: ~50%, Age 85: ~60%
    let plf = 0.35 + (borrowerAge - 60) * 0.01;
    plf = Math.min(0.75, Math.max(0.3, plf));

    const principalLimit = value * plf;
    const upfrontCosts = (value * 0.02) + 6000; // 2% MIP + $6k other fees
    const availableCash = Math.max(0, principalLimit - balance - upfrontCosts);

    setResults({
      principalLimit,
      upfrontCosts,
      availableCash,
      netEquity: value - principalLimit,
      error: null
    });
  };

  const reset = () => {
    setHomeValue("450000");
    setMortgageBalance("100000");
    setAge("65");
    setInterestRate("7.2");
  };

  const faqs = [
    {
      question: "What is a reverse mortgage?",
      answer: "A reverse mortgage (HECM) is a loan for seniors aged 62 and older that allows them to convert part of their home equity into cash. Unlike a traditional mortgage, the borrower doesn't make monthly payments; instead, the loan is repaid when the borrower sells the home, moves out permanently, or passes away."
    },
    {
      question: "How is the amount I can borrow determined?",
      answer: "The amount you can borrow, known as the Principal Limit, depends on three main factors: the age of the youngest borrower, the current market value of the home, and the prevailing interest rates."
    },
    {
      question: "Do I still own my home with a reverse mortgage?",
      answer: "Yes, you remain the owner of your home. You are still responsible for paying property taxes, homeowners insurance, and maintaining the property."
    },
    {
      question: "When does the loan have to be repaid?",
      answer: "The loan must be repaid when the last surviving borrower passes away, sells the home, or moves out of the home for more than 12 consecutive months (e.g., into assisted living)."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Reverse Mortgage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reverse Mortgage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <Home className="h-5 w-5 text-primary" /> Property Info
                  </h2>
                  <InputField id="home-value" label="Estimated Home Value" value={homeValue} onChange={setHomeValue} prefix="$" tooltip="Current market value of your primary residence." />
                  <InputField id="mortgage-balance" label="Existing Mortgage Balance" value={mortgageBalance} onChange={setMortgageBalance} prefix="$" tooltip="Any current loans against the property must be paid off with the reverse mortgage." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-bold mb-3">
                    <User className="h-5 w-5 text-primary" /> Borrower Info
                  </h2>
                  <InputField id="age" label="Age of Youngest Borrower" value={age} onChange={setAge} suffix="yrs" tooltip="The age of the youngest person on the title (must be 62+)." />
                  <InputField id="rate" label="Expected Interest Rate (%)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" tooltip="The annual interest rate (MIP + Margin + Index)." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                {results.error ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-6 rounded-2xl text-center font-bold">
                    {results.error}
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Available Cash (Net)</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.availableCash).toLocaleString()}</p>
                      </div>
                      <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Principal Limit</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.principalLimit).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                      <h2 className="text-2xl font-bold mb-3">
                        <DollarSign className="h-5 w-5 text-primary" /> Estimated Breakdown
                      </h2>
                      <ResultDisplay items={[
                        { label: "Closing Costs & Fees", value: results.upfrontCosts },
                        { label: "Mortgage Payoff Amount", value: parseFloat(mortgageBalance) },
                        { label: "Remaining Home Equity", value: results.netEquity },
                        { label: "Loan-to-Value (LTV)", value: 0, textValue: `${((results.principalLimit / parseFloat(homeValue)) * 100).toFixed(1)}%` },
                      ]} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How a Reverse Mortgage Works</h2>
              <p>A reverse mortgage is a financial tool designed specifically for older homeowners. Unlike a traditional mortgage where you make monthly payments to a lender, in a reverse mortgage, the lender provides you with funds based on your home equity. The interest is added to the loan balance over time, meaning the debt grows while your equity decreases.</p>

              <h3>Eligibility Requirements</h3>
              <ul>
                <li><strong>Age:</strong> At least one borrower must be 62 years or older.</li>
                <li><strong>Primary Residence:</strong> The home must be your primary residence.</li>
                <li><strong>Equity:</strong> You must own the home outright or have a significant amount of equity.</li>
                <li><strong>Condition:</strong> The home must meet FHA health and safety standards.</li>
              </ul>

              <h3>Receiving Your Funds</h3>
              <p>You can choose how you receive the money from a reverse mortgage:</p>
              <ul>
                <li><strong>Lump Sum:</strong> Receive all the available cash at once (usually only with fixed-rate loans).</li>
                <li><strong>Line of Credit:</strong> Access funds as needed. The unused portion of the line of credit grows over time.</li>
                <li><strong>Term Payments:</strong> Receive fixed monthly payments for a specific number of years.</li>
                <li><strong>Tenure Payments:</strong> Receive fixed monthly payments for as long as you live in the home.</li>
              </ul>

              <h3>Important Costs to Consider</h3>
              <p>Reverse mortgages carry several types of fees:</p>
              <ol>
                <li><strong>Mortgage Insurance Premium (MIP):</strong> An upfront fee of 2% of the home's value, plus an annual premium of 0.5% of the outstanding balance.</li>
                <li><strong>Origination Fees:</strong> Lenders can charge up to $6,000 to process the loan.</li>
                <li><strong>Closing Costs:</strong> Standard costs like appraisal, title search, and inspections.</li>
              </ol>

              <h3>The Role of Counseling</h3>
              <p>Before you can apply for a HECM reverse mortgage, you are required by law to attend a counseling session with an independent, HUD-approved agency. This ensures you fully understand the risks, costs, and alternatives available to you.</p>

              <h2 className="text-2xl font-bold mb-3">Pros and Cons of Reverse Mortgages</h2>
              <div className="grid sm:grid-cols-2 gap-6 my-6">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-emerald-700 font-bold mb-2">Benefits</h4>
                  <ul className="text-sm space-y-1">
                    <li>Supplement retirement income</li>
                    <li>No monthly mortgage payments</li>
                    <li>Stay in your home</li>
                    <li>Non-recourse loan (you'll never owe more than the home's value)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-red-700 font-bold mb-2">Drawbacks</h4>
                  <ul className="text-sm space-y-1">
                    <li>Decreases inheritance for heirs</li>
                    <li>High upfront costs and interest rates</li>
                    <li>Loan balance grows over time</li>
                    <li>Must still pay taxes and insurance</li>
                  </ul>
                </div>
              </div>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reverse-mortgage-calculator" />
          <PopularCalculators exclude="/calculator/reverse-mortgage-calculator" />
        </div>
      </div>
    </>
  );
};

export default ReverseMortgageCalculator;

