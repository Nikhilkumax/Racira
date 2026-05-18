"use client";
import { RotateCcw, Landmark, ArrowRightLeft, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const BridgeLoanCalculator = () => {
  const [currentHomeValue, setCurrentHomeValue] = useState("500000");
  const [currentMortgage, setCurrentMortgage] = useState("300000");
  const [newHomePrice, setNewHomePrice] = useState("750000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanFees, setLoanFees] = useState("2");
  const [loanTerm, setLoanTerm] = useState("6");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const homeValue = parseFloat(currentHomeValue) || 0;
    const mortgageBalance = parseFloat(currentMortgage) || 0;
    const newPrice = parseFloat(newHomePrice) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100;
    const feePercent = (parseFloat(loanFees) || 0) / 100;
    const term = parseFloat(loanTerm) || 0;

    // Bridge loan amount is typically the combined value minus a margin (e.g., 80% LTV)
    // For simplicity, we'll assume the bridge loan covers the equity needed for the new home.
    // Total Debt = Current Mortgage + Bridge Loan
    // LTV = (Current Mortgage + Bridge Loan) / Current Home Value
    
    const equity = homeValue - mortgageBalance;
    const bridgeLoanAmount = mortgageBalance + (newPrice * 0.2); // Assuming 20% down payment for new home
    const totalFees = bridgeLoanAmount * feePercent;
    
    // Monthly interest only payment
    const monthlyInterest = (bridgeLoanAmount * rate) / 12;
    const totalInterest = monthlyInterest * term;
    const totalCost = totalInterest + totalFees;

    setResults({
      bridgeLoanAmount,
      monthlyInterest,
      totalInterest,
      totalFees,
      totalCost,
      ltv: (bridgeLoanAmount / homeValue) * 100
    });
  };

  const reset = () => {
    setCurrentHomeValue("500000");
    setCurrentMortgage("300000");
    setNewHomePrice("750000");
    setInterestRate("8.5");
    setLoanFees("2");
    setLoanTerm("6");
  };

  const faqs = [
    {
      question: "What is a bridge loan?",
      answer: "A bridge loan is a short-term financing option that 'bridges' the gap between the purchase of a new home and the sale of an existing one. It allows you to use the equity in your current home to fund the down payment on a new one."
    },
    {
      question: "How much does a bridge loan cost?",
      answer: "Bridge loans typically have higher interest rates than standard mortgages (often 1-3% higher) and carry fees ranging from 1% to 3% of the loan amount. They are designed to be paid off quickly once your original home sells."
    },
    {
      question: "How long do bridge loans last?",
      answer: "Most bridge loans have terms of 6 to 12 months. They are meant to provide temporary liquidity and are not intended for long-term financing."
    },
    {
      question: "What is the maximum LTV for a bridge loan?",
      answer: "Lenders typically limit bridge loans to 80% of the combined value of your current and new homes, or 80% of your current home's value."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Bridge Loan Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Bridge Loan Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate the costs, interest, and payments for a short-term bridge loan to finance your next home purchase.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Home className="h-5 w-5 text-primary" /> Current Property
                  </h2>
                  <InputField id="home-value" label="Current Home Value" value={currentHomeValue} onChange={setCurrentHomeValue} prefix="$" tooltip="Estimated market value of your current residence." />
                  <InputField id="mortgage-balance" label="Current Mortgage Balance" value={currentMortgage} onChange={setCurrentMortgage} prefix="$" tooltip="Remaining balance on your existing home loan." />
                  <InputField id="new-home-price" label="New Home Price" value={newHomePrice} onChange={setNewHomePrice} prefix="$" tooltip="The purchase price of the home you are moving into." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Landmark className="h-5 w-5 text-primary" /> Bridge Loan Terms
                  </h2>
                  <InputField id="rate" label="Interest Rate (Annual %)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" tooltip="The annual interest rate for the bridge loan." />
                  <InputField id="fees" label="Loan Fees (%)" value={loanFees} onChange={setLoanFees} suffix="%" step="0.1" tooltip="Upfront points or origination fees as a percentage of the loan." />
                  <InputField id="term" label="Loan Term (Months)" value={loanTerm} onChange={setLoanTerm} suffix="mo" tooltip="The number of months you expect to hold the bridge loan." />
                </section>
              </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Loan</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-8">
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Estimated Loan Amount</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.bridgeLoanAmount).toLocaleString()}</p>
                  </div>
                  <div className="card-calculator bg-emerald-500/5 border-emerald-500/20 text-center flex flex-col justify-center py-8">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Cost (Interest + Fees)</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.totalCost).toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-calculator">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <ArrowRightLeft className="h-5 w-5 text-primary" /> Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Monthly Interest Only", value: results.monthlyInterest },
                    { label: "Total Interest Paid", value: results.totalInterest },
                    { label: "Upfront Fees", value: results.totalFees },
                    { label: "Bridge LTV Ratio", value: results.ltv, textValue: `${results.ltv.toFixed(1)}%` },
                  ]} />
                </div>
              </div>
            )}

            <AdPlaceholder className="my-8" />

            <article className="prose-finance">
              <h2>Understanding Bridge Loans</h2>
              <p>A bridge loan is a powerful financial tool for homeowners who need to buy a new house before selling their current one. It essentially 'bridges' the gap between the two transactions by providing immediate cash for a down payment or other closing costs on the new property.</p>

              <h3>How a Bridge Loan Works</h3>
              <p>Typically, a bridge loan is secured by your current home's equity. Lenders will allow you to borrow a portion of your equity (usually up to 80% LTV) to use as liquid cash. Once your old home is sold, the proceeds are used to pay off the bridge loan in full.</p>

              <h3>When to Consider a Bridge Loan</h3>
              <ul>
                <li><strong>Hot Markets:</strong> If houses are selling fast and you need to move quickly on a new property.</li>
                <li><strong>No Contingency:</strong> If the seller of your new home won't accept an offer contingent on you selling your current home.</li>
                <li><strong>Major Renovations:</strong> If you need to stay in your current home while the new one is being renovated.</li>
              </ul>

              <h3>Pros and Cons</h3>
              <div className="grid sm:grid-cols-2 gap-6 my-6">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-emerald-700 font-bold mb-2">Advantages</h4>
                  <ul className="text-sm space-y-1">
                    <li>Immediate access to equity</li>
                    <li>Move on your own timeline</li>
                    <li>Make non-contingent offers</li>
                    <li>No monthly principal payments (usually interest-only)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-red-700 font-bold mb-2">Disadvantages</h4>
                  <ul className="text-sm space-y-1">
                    <li>Higher interest rates</li>
                    <li>High upfront fees (points)</li>
                    <li>Risk of owning two mortgages if home doesn't sell</li>
                    <li>Requires significant home equity</li>
                  </ul>
                </div>
              </div>

              <h2>Key Factors in Bridge Loan Approval</h2>
              <p>Lenders look at several criteria when approving a bridge loan:</p>
              <ul>
                <li><strong>Combined LTV (CLTV):</strong> Most lenders limit the total debt (existing mortgage + bridge loan) to 80% of your current home's value.</li>
                <li><strong>Debt-to-Income (DTI):</strong> You must prove you can handle the interest payments on the bridge loan alongside your current mortgage.</li>
                <li><strong>Exit Strategy:</strong> A clear plan for selling the current property (e.g., it's already listed or under contract).</li>
              </ul>

              <h3>Alternatives to Bridge Loans</h3>
              <p>If a bridge loan seems too expensive, consider these alternatives:</p>
              <ul>
                <li><strong>HELOC (Home Equity Line of Credit):</strong> Often cheaper but can be difficult to secure if your home is already for sale.</li>
                <li><strong>80/10/10 Financing:</strong> Using a second mortgage on the new home instead of using equity from the old one.</li>
                <li><strong>Personal Loans:</strong> Unsecured loans that might cover a smaller down payment but usually have higher rates.</li>
              </ul>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bridge-loan-calculator" />
            <PopularCalculators exclude="/calculator/bridge-loan-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BridgeLoanCalculator;

