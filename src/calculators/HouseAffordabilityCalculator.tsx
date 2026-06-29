"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const HouseAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState("85000");
  const [monthlyDebt, setMonthlyDebt] = useState("400");
  const [downPayment, setDownPayment] = useState("40000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [insuranceAnnual, setInsuranceAnnual] = useState("1500");
  const [dtiLimit, setDtiLimit] = useState("36");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(annualIncome) || 0;
    const monthlyIncome = income / 12;
    const debt = parseFloat(monthlyDebt) || 0;
    const dp = parseFloat(downPayment) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = (parseInt(loanTerm) || 30) * 12;
    const taxRate = (parseFloat(propertyTaxRate) || 1.2) / 100 / 12;
    const insurance = (parseFloat(insuranceAnnual) || 1500) / 12;
    const limit = (parseFloat(dtiLimit) || 36) / 100;

    // Max monthly payment (PITI) based on DTI
    const maxPITI = (monthlyIncome * limit) - debt;
    
    // Max loan calculation
    // PITI = P*r*(1+r)^n / ((1+r)^n - 1) + Price*taxRate + insurance
    // Price = Loan + DP
    // PITI = Loan * [r(1+r)^n / ((1+r)^n - 1)] + (Loan + DP)*taxRate + insurance
    // PITI - DP*taxRate - insurance = Loan * [M + taxRate]
    // Loan = (PITI - DP*taxRate - insurance) / (M + taxRate)
    
    const M = rate > 0 
      ? (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      : 1 / term;
      
    const maxLoan = (maxPITI - (dp * taxRate) - insurance) / (M + taxRate);
    const maxPrice = maxLoan + dp;

    if (maxLoan <= 0) {
      setResults({ error: "Based on your inputs, you may not be able to afford a home at this time. Consider reducing debt or increasing your down payment." });
      return;
    }

    setResults({
      maxPrice,
      maxLoan,
      monthlyPITI: maxPITI,
      monthlyEMI: maxLoan * M,
      monthlyTax: maxPrice * taxRate,
      monthlyInsurance: insurance,
      dtiActual: ((maxPITI + debt) / monthlyIncome) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setAnnualIncome("85000");
    setMonthlyDebt("400");
    setDownPayment("40000");
    setResults(null);
  };

  const faqs = [
    { question: "How much house can I afford?", answer: "Lenders typically use the 28/36 rule: your mortgage payment shouldn't exceed 28% of your gross monthly income, and your total debt payments shouldn't exceed 36%. Our calculator uses your custom DTI (Debt-to-Income) limit to find your maximum home price." },
    { question: "What is the 28/36 rule?", answer: "It's a guideline for mortgage affordability. 28% refers to your maximum housing expense (PITI), and 36% refers to your maximum total debt (housing + cars, student loans, credit cards). If you have high existing debt, your 'house' budget will be lower." },
    { question: "How does interest rate affect affordability?", answer: "Interest rates have a massive impact. A 1% increase in rate can reduce your buying power by approximately 10%. For a $400,000 budget, moving from 6% to 7% could cost you $40,000 in 'affordable' home price." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "House Affordability" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">House Affordability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="annualIncome" label="Annual Gross Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" />
                <InputField id="monthlyDebt" label="Monthly Debt Payments" value={monthlyDebt} onChange={setMonthlyDebt} prefix="$" tooltip="Car loans, student loans, credit card minimums." />
                <InputField id="downPayment" label="Down Payment Amount" value={downPayment} onChange={setDownPayment} prefix="$" />
                <InputField id="interestRate" label="Expected Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                <InputField id="dtiLimit" label="DTI Limit (%)" value={dtiLimit} onChange={setDtiLimit} suffix="%" tooltip="Lenders usually prefer 36%, some go up to 43% or 50%." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {results && !results.error && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-3">Maximum Home Price</h2>
                  <p className="text-5xl font-extrabold">${Math.round(results.maxPrice).toLocaleString()}</p>
                </div>

                <ResultDisplay items={[
                  { label: "Maximum Loan Amount", value: results.maxLoan, highlight: true },
                  { label: "Monthly PITI Payment", value: results.monthlyPITI, highlight: true },
                  { label: "Monthly Principal & Interest", value: results.monthlyEMI },
                  { label: "Estimated Monthly Tax", value: results.monthlyTax },
                  { label: "Estimated Monthly Insurance", value: results.monthlyInsurance },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>How Lenders Determine Your Budget</h2>
              <p>When you apply for a mortgage, lenders don't just look at your credit score; they look at your "capacity" to pay. The primary metric they use is the Debt-to-Income (DTI) ratio.</p>
              <h3>Front-End vs. Back-End Ratio</h3>
              <p>The **front-end ratio** is the percentage of your gross income that goes toward housing costs. Lenders typically like this to be 28% or less. The **back-end ratio** is your total debt payments (including the new mortgage) divided by your gross income. Lenders typically look for 36% to 43% here.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/house-affordability-calculator" />
          <PopularCalculators exclude="/calculator/house-affordability-calculator" />
        </div>
      </div>
    </>
  );
};

export default HouseAffordabilityCalculator;

