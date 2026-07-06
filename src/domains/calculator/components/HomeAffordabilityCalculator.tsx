"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Home, Calculator } from "lucide-react";

const HomeAffordabilityCalculator = () => {
  const [annualIncome, setAnnualIncome] = useState("100000");
  const [monthlyDebts, setMonthlyDebts] = useState("500");
  const [downPayment, setDownPayment] = useState("50000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const income = parseFloat(annualIncome) || 0;
    const debts = parseFloat(monthlyDebts) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const term = (parseFloat(loanTerm) || 30) * 12;

    if (income <= 0 || term <= 0) return;

    // Standard rule: 28% front-end, 36% back-end
    const monthlyIncome = income / 12;
    const maxMonthlyPITI_Front = monthlyIncome * 0.28;
    const maxMonthlyPITI_Back = (monthlyIncome * 0.36) - debts;
    
    const maxMonthlyPayment = Math.min(maxMonthlyPITI_Front, maxMonthlyPITI_Back);

    // Estimating Tax/Insurance at 1.5% of home value annually
    // Let P = Max Loan, H = House Price = P + Down
    // Monthly Tax/Ins = (H * 0.015) / 12
    // MaxPayment = [P * rate * (1+rate)^n / ((1+rate)^n - 1)] + (P + Down) * 0.00125
    
    // Simplification for iterative solve or rough estimate
    // For now, let's subtract a fixed $400 for tax/ins to get a ballpark or use a more precise formula
    const estimatedTaxIns = 400; 
    const maxPAndI = maxMonthlyPayment - estimatedTaxIns;

    const maxLoan = rate > 0 
      ? (maxPAndI * (Math.pow(1 + rate, term) - 1)) / (rate * Math.pow(1 + rate, term))
      : maxPAndI * term;

    const maxHomePrice = maxLoan + down;

    setResults({
      maxHomePrice,
      maxMonthlyPayment,
      monthlyIncome,
      frontRatio: (maxMonthlyPayment / monthlyIncome) * 100,
      backRatio: ((maxMonthlyPayment + debts) / monthlyIncome) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setAnnualIncome("100000"); setMonthlyDebts("500");
    setDownPayment("50000"); setInterestRate("6.5"); setLoanTerm("30");
    setResults(null);
  };

  const faqs = [
    { question: "What is the 28/36 rule?", answer: "Lenders typically use the 28/36 rule: your mortgage payment (PITI) should not exceed 28% of your gross monthly income, and your total debt payments should not exceed 36%." },
    { question: "Does my down payment affect how much I can afford?", answer: "Absolutely. A larger down payment reduces the loan amount you need, which lowers your monthly interest costs and can help you avoid Private Mortgage Insurance (PMI)." },
    { question: "What counts as monthly debt?", answer: "Monthly debt includes car loans, student loans, minimum credit card payments, and personal loans. It does not typically include utilities or groceries." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Home Affordability Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Affordability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="annualIncome" label="Annual Gross Income" value={annualIncome} onChange={setAnnualIncome} prefix="$" />
                <InputField id="monthlyDebts" label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" tooltip="Car loans, student loans, credit cards." />
                <InputField id="downPayment" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
                <InputField id="interestRate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                <InputField id="loanTerm" label="Loan Term (Years)" value={loanTerm} onChange={setLoanTerm} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button>
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Affordability Summary</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Max Home Price</p>
                    <p className="text-5xl font-black text-foreground">${Math.round(results.maxHomePrice).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimated Monthly PITI</p>
                    <p className="text-3xl font-black text-foreground">${Math.round(results.maxMonthlyPayment).toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Front-End DTI", value: 0, textValue: results.frontRatio.toFixed(1) + "%" },
                  { label: "Back-End DTI", value: 0, textValue: results.backRatio.toFixed(1) + "%" },
                  { label: "Monthly Gross Income", value: 0, textValue: "$" + Math.round(results.monthlyIncome).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Finding Your Budget</h2>
              <p>Buying a home is the largest purchase most people will ever make. Knowing exactly how much you can afford before you start house hunting is critical to avoiding financial stress.</p>
              <h3>The Role of Interest Rates</h3>
              <p>Even a 1% change in interest rates can change your home affordability by tens of thousands of dollars. When rates are high, your monthly payment covers more interest and less principal, reducing the total loan amount you can qualify for.</p>
              <h3>PITI: More Than a Mortgage</h3>
              <p>Your monthly housing cost consists of Principal, Interest, Taxes, and Insurance (PITI). When calculating affordability, it's vital to include property taxes and homeowners insurance, as these can easily add $300-$600 to your monthly bill.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-affordability" />
          <PopularCalculators exclude="/calculator/home-affordability-calculator" />
        </div>
      </div>
    </>
  );
};

export default HomeAffordabilityCalculator;

