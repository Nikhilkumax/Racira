"use client";
import { RotateCcw, Landmark, ArrowRightLeft, Home, ChevronDown } from "lucide-react";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const BridgeLoanCalculator = () => {
  const [currentHomeValue, setCurrentHomeValue] = useState("500000");
  const [currentMortgage, setCurrentMortgage] = useState("300000");
  const [newHomePrice, setNewHomePrice] = useState("750000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanFees, setLoanFees] = useState("2");
  const [loanTerm, setLoanTerm] = useState("6");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bridge Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="home-value" label="Current Home Value" value={currentHomeValue} onChange={setCurrentHomeValue} prefix="$" />
              <CompactInput id="mortgage-balance" label="Current Mortgage" value={currentMortgage} onChange={setCurrentMortgage} prefix="$" />
              <CompactInput id="new-home-price" label="New Home Price" value={newHomePrice} onChange={setNewHomePrice} prefix="$" />
              <CompactInput id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
            </div>

            <div className="mt-2 border border-border rounded-md overflow-hidden bg-background">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 text-sm font-bold text-foreground hover:bg-secondary/50 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              <div className={`transition-all duration-300 ease-in-out ${showAdvanced ? "max-h-[500px] opacity-100 p-4 pt-1 border-t border-border" : "max-h-0 opacity-0 px-4 overflow-hidden"}`}>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <CompactInput id="fees" label="Loan Fees (%)" value={loanFees} onChange={setLoanFees} suffix="%" step="0.1" />
                  <CompactInput id="term" label="Loan Term (mo)" value={loanTerm} onChange={setLoanTerm} suffix="mo" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3 items-center">
              <button onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-12 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {showResults && results && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Estimated Loan Amount</div>
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">${Math.round(results.bridgeLoanAmount).toLocaleString()}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Total Cost</div>
                    <div className="text-lg font-bold">${Math.round(results.totalCost).toLocaleString()}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Interest</div>
                    <div className="text-lg font-bold text-amber-600">${Math.round(results.totalInterest).toLocaleString()}</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Fees</div>
                    <div className="text-lg font-bold text-red-600">${Math.round(results.totalFees).toLocaleString()}</div>
                  </div>
                </div>

                <div className="card-calculator border border-border bg-card !p-5">
                  <h3 className="text-base font-bold mb-4 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" /> Breakdown
                  </h3>
                  <ResultDisplay items={[
                    { label: "Monthly Interest Only", value: results.monthlyInterest },
                    { label: "Total Interest Paid", value: results.totalInterest },
                    { label: "Upfront Fees", value: results.totalFees },
                    { label: "Bridge LTV Ratio", value: results.ltv, textValue: `${results.ltv.toFixed(1)}%` },
                  ]} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Understanding Bridge Loans</h2>
              <p>A bridge loan is a powerful financial tool for homeowners who need to buy a new house before selling their current one. It essentially 'bridges' the gap between the two transactions by providing immediate cash for a down payment or other closing costs on the new property.</p>

              <h2 className="text-2xl font-bold mb-3">How a Bridge Loan Works</h2>
              <p>Typically, a bridge loan is secured by your current home's equity. Lenders will allow you to borrow a portion of your equity (usually up to 80% LTV) to use as liquid cash. Once your old home is sold, the proceeds are used to pay off the bridge loan in full.</p>

              <h2 className="text-2xl font-bold mb-3">When to Consider a Bridge Loan</h2>
              <p><strong>Hot Markets:</strong> If houses are selling fast and you need to move quickly on a new property.</p>
              <p><strong>No Contingency:</strong> If the seller of your new home won't accept an offer contingent on you selling your current home.</p>
              <p><strong>Major Renovations:</strong> If you need to stay in your current home while the new one is being renovated.</p>

              <h2 className="text-2xl font-bold mb-3">Pros and Cons</h2>
              <div className="grid sm:grid-cols-2 gap-6 my-6">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-emerald-700 font-bold mb-2">Advantages</h4>
                  <p className="text-sm mb-1">Immediate access to equity</p>
                  <p className="text-sm mb-1">Move on your own timeline</p>
                  <p className="text-sm mb-1">Make non-contingent offers</p>
                  <p className="text-sm mb-1">No monthly principal payments (usually interest-only)</p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <h4 className="text-red-700 font-bold mb-2">Disadvantages</h4>
                  <p className="text-sm mb-1">Higher interest rates</p>
                  <p className="text-sm mb-1">High upfront fees (points)</p>
                  <p className="text-sm mb-1">Risk of owning two mortgages if home doesn't sell</p>
                  <p className="text-sm mb-1">Requires significant home equity</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-3">Key Factors in Bridge Loan Approval</h2>
              <p>Lenders look at several criteria when approving a bridge loan:</p>
              <p><strong>Combined LTV (CLTV):</strong> Most lenders limit the total debt (existing mortgage + bridge loan) to 80% of your current home's value.</p>
              <p><strong>Debt-to-Income (DTI):</strong> You must prove you can handle the interest payments on the bridge loan alongside your current mortgage.</p>
              <p><strong>Exit Strategy:</strong> A clear plan for selling the current property (e.g., it's already listed or under contract).</p>

              <h2 className="text-2xl font-bold mb-3">Alternatives to Bridge Loans</h2>
              <p>If a bridge loan seems too expensive, consider these alternatives:</p>
              <p><strong>HELOC (Home Equity Line of Credit):</strong> Often cheaper but can be difficult to secure if your home is already for sale.</p>
              <p><strong>80/10/10 Financing:</strong> Using a second mortgage on the new home instead of using equity from the old one.</p>
              <p><strong>Personal Loans:</strong> Unsecured loans that might cover a smaller down payment but usually have higher rates.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bridge-loan-calculator" />
          <PopularCalculators exclude="/calculator/bridge-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default BridgeLoanCalculator;

