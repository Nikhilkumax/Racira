"use client";
import { RotateCcw, ShieldCheck, TrendingDown, Home } from "lucide-react";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import InputField from "@/components/calculator/InputField";
const PmiCalculator = () => {
  const [homeValue, setHomeValue] = useState("400000");
  const [downPayment, setDownPayment] = useState("20000");
  const [creditScore, setCreditScore] = useState("720");
  const [loanTerm, setLoanTerm] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(homeValue) || 0;
    const down = parseFloat(downPayment) || 0;
    const score = parseInt(creditScore) || 0;
    const loanAmount = value - down;
    const ltv = (loanAmount / value) * 100;

    if (value <= 0 || loanAmount <= 0) return;

    if (ltv <= 80) {
      setResults({ isRequired: false, ltv });
      return;
    }

    // Simplified PMI rate estimation based on LTV and Credit Score
    let baseRate = 0.5;
    if (ltv > 95) baseRate = 1.0;
    else if (ltv > 90) baseRate = 0.75;
    else if (ltv > 85) baseRate = 0.55;

    // Credit score adjustment
    if (score >= 760) baseRate *= 0.8;
    else if (score >= 720) baseRate *= 1.0;
    else if (score >= 680) baseRate *= 1.4;
    else if (score >= 640) baseRate *= 2.0;
    else baseRate *= 2.5;

    const annualPMI = (loanAmount * baseRate) / 100;
    const monthlyPMI = annualPMI / 12;

    // Estimate cancellation date (when balance reaches 80% LTV)
    // For simplicity, we'll assume a 7% annual interest rate for the mortgage
    const rate = 0.07 / 12;
    const payment = (loanAmount * rate * Math.pow(1 + rate, parseInt(loanTerm) * 12)) / (Math.pow(1 + rate, parseInt(loanTerm) * 12) - 1);
    
    let currentBalance = loanAmount;
    let monthsTo80 = 0;
    const targetBalance = value * 0.8;

    while (currentBalance > targetBalance && monthsTo80 < 360) {
      currentBalance -= (payment - (currentBalance * rate));
      monthsTo80++;
    }

    setResults({
      isRequired: true,
      ltv,
      annualPMI,
      monthlyPMI,
      baseRate,
      monthsTo80,
      totalPmiPaid: monthlyPMI * monthsTo80
    });
  };

  const reset = () => {
    setHomeValue("400000");
    setDownPayment("20000");
    setCreditScore("720");
    setLoanTerm("30");
  };

  const faqs = [
    {
      question: "What is PMI?",
      answer: "Private Mortgage Insurance (PMI) is a type of insurance that protects the lender if you stop making payments on your loan. It is typically required on conventional loans when the down payment is less than 20% of the home's value."
    },
    {
      question: "How much does PMI cost?",
      answer: "PMI costs usually range from 0.2% to 2% of your loan amount annually. The specific rate depends on your loan-to-value (LTV) ratio, your credit score, and the type of mortgage you have."
    },
    {
      question: "Can I remove PMI?",
      answer: "Yes. Under the Homeowners Protection Act, you can request PMI cancellation when your loan balance reaches 80% of the original home value. Lenders are required to automatically terminate PMI when the balance reaches 78% LTV, provided you are current on payments."
    },
    {
      question: "Is PMI tax-deductible?",
      answer: "PMI deductibility varies depending on current tax laws and your income level. It has historically been deductible for many taxpayers, but you should consult with a tax professional for the latest rules."
    }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "PMI Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">PMI Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Estimate your monthly Private Mortgage Insurance (PMI) costs and see when you can cancel it.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <Home className="h-5 w-5 text-primary" /> Loan Basics
                  </h2>
                  <InputField id="home-value" label="Home Value" value={homeValue} onChange={setHomeValue} prefix="$" tooltip="The purchase price or appraised value of the home." />
                  <InputField id="down-payment" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" tooltip="The amount of cash you are paying upfront." />
                </section>

                <section className="space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Risk Factors
                  </h2>
                  <InputField id="credit-score" label="Credit Score" value={creditScore} onChange={setCreditScore} tooltip="Lenders use your credit score to determine your PMI rate." />
                  <InputField id="loan-term" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} suffix="yrs" />
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
                {!results.isRequired ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 p-8 rounded-2xl text-center">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                    <p className="text-2xl font-black mb-2">No PMI Required!</p>
                    <p className="font-medium">Your LTV ratio is {results.ltv.toFixed(1)}%, which is 80% or less. You do not need to pay Private Mortgage Insurance on a conventional loan.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div className="card-calculator bg-primary/5 border-solid border-primary/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Monthly PMI Cost</p>
                        <p className="text-5xl font-black text-foreground">${Math.round(results.monthlyPMI).toLocaleString()}</p>
                      </div>
                      <div className="card-calculator bg-amber-500/5 border-amber-500/20 text-center flex flex-col justify-center py-8">
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Time to 80% LTV</p>
                        <p className="text-5xl font-black text-foreground">{Math.floor(results.monthsTo80 / 12)}y {results.monthsTo80 % 12}m</p>
                      </div>
                    </div>

                    <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <TrendingDown className="h-5 w-5 text-primary" /> Cost Analysis
                      </h2>
                      <ResultDisplay items={[
                        { label: "Annual PMI Premium", value: results.annualPMI },
                        { label: "Estimated PMI Rate", value: 0, textValue: `${results.baseRate.toFixed(2)}%` },
                        { label: "Total PMI Paid Over Time", value: results.totalPmiPaid },
                        { label: "Current LTV Ratio", value: 0, textValue: `${results.ltv.toFixed(1)}%` },
                      ]} />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>What Is Private Mortgage Insurance (PMI)?</h2>
              <p>Private Mortgage Insurance, commonly known as PMI, is a risk-management product that protects lenders in the event that a borrower defaults on their home loan. While it increases your monthly housing expense, it serves a critical purpose: it allows you to purchase a home with a down payment as low as 3% or 5%, rather than waiting until you've saved the traditional 20%.</p>

              <h3>Why Lenders Require PMI</h3>
              <p>Statistically, borrowers with less 'skin in the game' (equity) are more likely to walk away from a mortgage during financial hardship. PMI provides a financial cushion for the lender, covering a portion of their losses if they have to foreclose on the property.</p>

              <h3>Factors That Determine Your PMI Rate</h3>
              <ul>
                <li><strong>Loan-to-Value (LTV) Ratio:</strong> The higher your loan balance relative to the home's value, the higher the risk and the higher the rate.</li>
                <li><strong>Credit Score:</strong> Borrowers with higher credit scores are seen as lower risk and receive significantly lower PMI rates.</li>
                <li><strong>Loan Type:</strong> Fixed-rate mortgages often have lower PMI costs than adjustable-rate mortgages (ARMs).</li>
                <li><strong>Property Type:</strong> Investment properties or multi-unit homes usually carry higher premiums than single-family primary residences.</li>
              </ul>

              <h3>How to Avoid Paying PMI</h3>
              <p>There are several ways to eliminate or avoid PMI altogether:</p>
              <ol>
                <li><strong>Save a 20% Down Payment:</strong> This is the most direct way to avoid PMI on a conventional loan.</li>
                <li><strong>VA Loans:</strong> If you are a veteran or active-duty service member, VA loans require no down payment and have no monthly PMI.</li>
                <li><strong>LPMI (Lender-Paid Mortgage Insurance):</strong> The lender pays the PMI in exchange for a slightly higher interest rate on your loan.</li>
                <li><strong>Piggyback Loans:</strong> Taking out a second mortgage (e.g., an 80/10/10 loan) to cover part of the down payment.</li>
              </ol>

              <h3>The Path to PMI Cancellation</h3>
              <p>One of the best features of PMI is that it isn't permanent. You have two main paths to removal:</p>
              <ul>
                <li><strong>Request Cancellation:</strong> Once your loan balance reaches 80% of the original value, you can submit a written request to your lender to remove the PMI.</li>
                <li><strong>Automatic Termination:</strong> By law, lenders must automatically stop charging PMI when your balance hits 78% of the original value, provided you are current on your payments.</li>
                <li><strong>New Appraisal:</strong> If your home's value has increased significantly due to market conditions or renovations, you can pay for a new appraisal to prove your LTV is now below 80%.</li>
              </ul>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pmi-calculator" />
          <PopularCalculators exclude="/calculator/pmi-calculator" />
        </div>
      </div>
    </>
  );
};

export default PmiCalculator;

