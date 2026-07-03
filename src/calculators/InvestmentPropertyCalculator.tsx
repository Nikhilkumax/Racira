"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Building } from "lucide-react";

const InvestmentPropertyCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState("250000");
  const [downPayment, setDownPayment] = useState("50000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [monthlyRent, setMonthlyRent] = useState("2200");
  const [otherExpenses, setOtherExpenses] = useState("600");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(purchasePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const rent = parseFloat(monthlyRent) || 0;
    const expenses = parseFloat(otherExpenses) || 0;
    const term = 30 * 12;

    if (price <= 0) return;

    const loanAmount = price - down;
    const monthlyPI = rate > 0 
      ? (loanAmount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
      : loanAmount / term;

    const totalMonthlyOutflow = monthlyPI + expenses;
    const monthlyCashFlow = rent - totalMonthlyOutflow;
    
    // Net Operating Income (NOI) = (Monthly Rent - Other Expenses) * 12
    const annualNOI = (rent - expenses) * 12;
    
    // Cap Rate = NOI / Price
    const capRate = (annualNOI / price) * 100;
    
    // Cash on Cash = Annual Cash Flow / Initial Investment
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = (annualCashFlow / down) * 100;

    setResults({
      monthlyPI,
      monthlyCashFlow,
      annualNOI,
      capRate,
      cashOnCash,
      totalMonthlyOutflow
    });
  };

  const reset = () => {
    setShowResults(false);
    setPurchasePrice("250000"); setDownPayment("50000"); setInterestRate("6.5");
    setMonthlyRent("2200"); setOtherExpenses("600");
    setResults(null);
  };

  const faqs = [
    { question: "What is Cap Rate?", answer: "The Capitalization Rate (Cap Rate) is the ratio of Net Operating Income to the property's purchase price. it represents the expected annual return if the property was bought with cash." },
    { question: "What is Cash on Cash Return?", answer: "Cash on Cash (CoC) return measures the annual cash flow relative to the actual cash you invested (your down payment and closing costs). This is often the most important metric for leveraged investors." },
    { question: "How much should I set aside for maintenance?", answer: "A common rule of thumb is to set aside 1% of the property's value per year for maintenance, or 10-15% of the monthly rent for repairs and capital expenditures." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Investment Property Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Investment Property Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="price" label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" />
                <InputField id="down" label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" />
                <InputField id="rate" label="Interest Rate" value={interestRate} onChange={setInterestRate} suffix="%" />
                <InputField id="rent" label="Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
                <InputField id="expenses" label="Monthly Expenses" value={otherExpenses} onChange={setOtherExpenses} prefix="$" tooltip="Tax, Insurance, Maintenance, Vacancy." />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Building className="h-5 w-5" /> Analyze Property
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-2xl font-bold mb-3">Profitability Report</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Monthly Cash Flow</p>
                    <p className="text-3xl font-black text-foreground">${Math.round(results.monthlyCashFlow).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cap Rate</p>
                    <p className="text-3xl font-black text-foreground">{results.capRate.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cash on Cash</p>
                    <p className="text-3xl font-black text-foreground">{results.cashOnCash.toFixed(2)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Mortgage (P&I)", value: 0, textValue: "$" + Math.round(results.monthlyPI).toLocaleString() },
                  { label: "Total Monthly Outflow", value: 0, textValue: "$" + Math.round(results.totalMonthlyOutflow).toLocaleString() },
                  { label: "Annual NOI", value: 0, textValue: "$" + Math.round(results.annualNOI).toLocaleString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Investing in Real Estate</h2>
              <p>Real estate is one of the most reliable ways to build long-term wealth, but not every property is a good investment. Running the numbers is the difference between a profitable asset and a "money pit."</p>
              <h3>Cash Flow is King</h3>
              <p>While appreciation (the increase in property value) is a great bonus, professional investors focus on cash flow. Monthly cash flow is the money left over after all expenses, including the mortgage, have been paid. Positive cash flow provides a safety net for repairs and allows you to reinvest in more properties.</p>
              <h3>Leverage and Risk</h3>
              <p>Using a mortgage (leverage) allows you to control a $250,000 asset with only $50,000 of your own money. This amplifies your Cash on Cash return but also increases your risk. If the property becomes vacant, you are still responsible for the full mortgage payment.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/investment-property" />
          <PopularCalculators exclude="/calculator/investment-property-calculator" />
        </div>
      </div>
    </>
  );
};

export default InvestmentPropertyCalculator;

