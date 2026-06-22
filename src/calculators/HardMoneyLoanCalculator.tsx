"use client";
import { RotateCcw, TrendingUp, Hammer, DollarSign, AlertTriangle, ChevronDown } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const HardMoneyLoanCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState("250000");
  const [renovationCost, setRenovationCost] = useState("50000");
  const [arv, setArv] = useState("400000");
  const [ltc, setLtc] = useState("80");
  const [interestRate, setInterestRate] = useState("12");
  const [points, setPoints] = useState("2");
  const [loanTerm, setLoanTerm] = useState("6");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const purchase = parseFloat(purchasePrice) || 0;
    const reno = parseFloat(renovationCost) || 0;
    const valueAfter = parseFloat(arv) || 0;
    const ltcPercent = (parseFloat(ltc) || 0) / 100;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const pts = (parseFloat(points) || 0) / 100;
    const term = parseFloat(loanTerm) || 0;

    const totalProjectCost = purchase + reno;
    const loanAmount = totalProjectCost * ltcPercent;
    const totalPoints = loanAmount * pts;
    const monthlyInterest = loanAmount * rate;
    const totalInterest = monthlyInterest * term;

    const totalHoldingCost = totalInterest + totalPoints;
    const profit = valueAfter - totalProjectCost - totalHoldingCost;
    const roi = (profit / (totalProjectCost - loanAmount + totalHoldingCost)) * 100;

    setResults({
      loanAmount,
      totalPoints,
      monthlyInterest,
      totalInterest,
      totalHoldingCost,
      profit,
      roi,
      equityRequired: totalProjectCost - loanAmount
    });
  };

  const reset = () => {
    setPurchasePrice("250000");
    setRenovationCost("50000");
    setArv("400000");
    setLtc("80");
    setInterestRate("12");
    setPoints("2");
    setLoanTerm("6");
  };

  const faqs = [
    {
      question: "What is a hard money loan?",
      answer: "A hard money loan is a short-term, asset-based loan where the property itself serves as the primary collateral. These loans are typically provided by private investors or companies rather than banks and are commonly used by real estate 'flippers' to fund quick purchases and renovations."
    },
    {
      question: "What are 'points' in a hard money loan?",
      answer: "Points are upfront fees paid to the lender at closing. One point is equal to 1% of the total loan amount. Hard money lenders typically charge 1 to 4 points in addition to high interest rates."
    },
    {
      question: "What is LTC vs. LTV?",
      answer: "LTC (Loan-to-Cost) is the ratio of the loan amount to the total project cost (purchase + renovation). LTV (Loan-to-Value) is the ratio of the loan amount to the estimated After Repair Value (ARV). Hard money lenders often use both to limit their risk."
    },
    {
      question: "How long do hard money loans last?",
      answer: "Hard money loans are designed for short durations, usually ranging from 6 to 24 months. They are intended to be paid off once the property is sold or refinanced with a traditional mortgage."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Hard Money Loan Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hard Money Loan Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col gap-4">
              <InputField id="purchase" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
              <InputField id="reno" label="Renovation Cost" value={renovationCost} onChange={setRenovationCost} prefix="$" />
              <InputField id="arv" label="After Repair Value (ARV)" value={arv} onChange={setArv} prefix="$" tooltip="Estimated market value after all renovations are complete." />
              <InputField id="rate" label="Interest Rate (Annual %)" value={interestRate} onChange={setInterestRate} suffix="%" step="0.1" />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowResults((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showResults ? "rotate-180" : ""}`} />
              </button>

              {showResults && (
                <div className="grid grid-cols-1 gap-3 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Loan Details</div>
                  <InputField id="ltc" label="Loan-to-Cost (%)" value={ltc} onChange={setLtc} suffix="%" tooltip="Percentage of total costs funded by the lender." />
                  <InputField id="points" label="Points" value={points} onChange={setPoints} suffix="pts" />
                  <InputField id="term" label="Term" value={loanTerm} onChange={setLoanTerm} suffix="mo" />
                </div>
              )}
            </div>
              <div className="mt-8 flex gap-3 items-center">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate Loan</button>
<button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset 
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 mb-6">
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Projected Net Profit</div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">${Math.round(results.profit).toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground font-medium">Total Loan Amount: ${Math.round(results.loanAmount).toLocaleString()} ({ltc}% of Cost)</div>
                </div>

                <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="h-5 w-5 text-primary" /> Deal Breakdown
                  </h2>
                  <ResultDisplay items={[
                    { label: "Cash Required (Equity)", value: results.equityRequired },
                    { label: "Upfront Points Cost", value: results.totalPoints },
                    { label: "Monthly Interest Payment", value: results.monthlyInterest },
                    { label: "Total Holding Costs", value: results.totalHoldingCost },
                  ]} />
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3 items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <strong>Investor Tip:</strong> Hard money is expensive. Every extra month the project takes reduces your profit by <strong>${Math.round(results.monthlyInterest).toLocaleString()}</strong> in interest costs.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Fix-and-Flip with Hard Money</h2>
              <p>Hard money loans are the lifeblood of real estate investors. Because these loans focus on the property's potential value rather than the borrower's credit score, they allow for rapid funding of distressed properties that traditional banks won't touch.</p>

              <h2 className="text-2xl font-bold mb-3">The Mechanics of the Loan</h2>
              <p>Hard money lenders care most about the <strong>ARV (After Repair Value)</strong>. They typically lend up to 70-75% of the ARV, which should cover both the purchase price and the renovation costs. This "70% Rule" is a standard benchmark used to ensure there is enough profit margin to cover high interest rates and unexpected costs.</p>

              <h2 className="text-2xl font-bold mb-3">Understanding the Costs</h2>
              <p>Because hard money is high-risk for the lender, it is high-cost for the borrower. You should expect:</p>
              <p><strong>High Interest:</strong> Rates typically range from 10% to 15%, depending on your experience and the market.</p>
              <p><strong>Points:</strong> Upfront fees of 1-4% of the loan amount are common.</p>
              <p><strong>Closing Costs:</strong> In addition to points, you'll pay for appraisals, title work, and legal fees.</p>

              <h2 className="text-2xl font-bold mb-3">Managing the 'Holding Period'</h2>
              <p>Time is money in real estate flipping. Since hard money interest is charged monthly on the full loan balance, every day the house sits on the market or every week the contractor is delayed directly eats into your net profit. This calculator helps you see exactly how much each month of 'holding' costs you.</p>

              <h2 className="text-2xl font-bold mb-3">Why Use Hard Money?</h2>
              <p>If it's so expensive, why use it? The answer is <strong>speed and leverage</strong>. Hard money lenders can often fund a deal in 7-10 days, allowing you to beat out other buyers who are waiting for bank approvals. Additionally, using a lender's capital allows you to flip multiple houses simultaneously with less of your own cash tied up in any single deal.</p>

              <h2 className="text-2xl font-bold mb-3">Critical Success Factors</h2>
              <p>To maximize your ROI when using hard money, focus on these three areas:</p>
              <p><strong>Accurate ARV:</strong> Overestimating the final sale price is the most common reason flippers lose money. Always use conservative 'Comps' (comparable sales).</p>
              <p><strong>Tight Renovation Budget:</strong> Get multiple quotes and add a 10-20% contingency fund for 'surprises' behind the walls.</p>
              <p><strong>Speed:</strong> Have your contractors ready to go the day you close. Every day the house is empty is a day you are losing interest.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hard-money-loan-calculator" />
          <PopularCalculators exclude="/calculator/hard-money-loan-calculator" />
        </div>
      </div>
    </>
  );
};

export default HardMoneyLoanCalculator;

