"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Building } from "lucide-react";

const RentalYieldCalculator = () => {
  const [propertyValue, setPropertyValue] = useState("300000");
  const [monthlyRent, setMonthlyRent] = useState("2000");
  const [annualExpenses, setAnnualExpenses] = useState("6000");
  const [vacancyRate, setVacancyRate] = useState("5");
  const [mortgagePayment, setMortgagePayment] = useState("1500");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const value = parseFloat(propertyValue);
    const rent = parseFloat(monthlyRent);
    const expenses = parseFloat(annualExpenses);
    const vacancy = parseFloat(vacancyRate) / 100;
    const mortgage = parseFloat(mortgagePayment);

    const grossAnnualRent = rent * 12;
    const effectiveRent = grossAnnualRent * (1 - vacancy);
    const grossYield = (grossAnnualRent / value) * 100;
    const netYield = ((effectiveRent - expenses) / value) * 100;
    const annualCashFlow = effectiveRent - expenses - (mortgage * 12);
    const monthlyCashFlow = annualCashFlow / 12;

    setResults({ grossYield, netYield, annualCashFlow, monthlyCashFlow, effectiveRent, grossAnnualRent });
  };

  const reset = () => {
    setShowResults(false); setPropertyValue("300000"); setMonthlyRent("2000"); setAnnualExpenses("6000"); setVacancyRate("5"); setMortgagePayment("1500"); setResults(null); };

  const faqs = [
    { question: "What is rental yield?", answer: "Rental yield measures the annual rental income as a percentage of the property's value. Gross yield uses total rent; net yield subtracts expenses (maintenance, insurance, taxes, vacancies)." },
    { question: "What is a good rental yield?", answer: "A gross rental yield of 5-8% is generally considered good. Net yields of 3-5% are typical after expenses. Markets with high property values (e.g., San Francisco, London) often have lower yields." },
    { question: "What is cash-on-cash return?", answer: "Cash-on-cash return measures the annual pre-tax cash flow relative to the cash invested (down payment + closing costs). It tells you your actual annual return on the cash you have at risk in the deal." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Rental Yield Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rental Yield Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate gross and net rental yield, cash flow, and annual return on your investment property.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="val" label="Property Value ($)" value={propertyValue} onChange={setPropertyValue} />
                <InputField id="rent" label="Monthly Rent ($)" value={monthlyRent} onChange={setMonthlyRent} />
                <InputField id="exp" label="Annual Expenses ($)" value={annualExpenses} onChange={setAnnualExpenses} tooltip="Property tax, insurance, maintenance, management fees." />
                <InputField id="vac" label="Vacancy Rate (%)" value={vacancyRate} onChange={setVacancyRate} />
                <InputField id="mort" label="Monthly Mortgage Payment ($)" value={mortgagePayment} onChange={setMortgagePayment} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Building className="h-5 w-5" /> Calculate Yield</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Rental Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Gross Rental Yield</p>
                    <p className="text-5xl font-black text-foreground">{results.grossYield.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Rental Yield</p>
                    <p className={`text-3xl font-black ${results.netYield < 0 ? "text-red-500" : "text-foreground"}`}>{results.netYield.toFixed(2)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Monthly Cash Flow", value: 0, textValue: "$" + results.monthlyCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Effective Annual Rent", value: 0, textValue: "$" + results.effectiveRent.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Annual Cash Flow", value: 0, textValue: "$" + results.annualCashFlow.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Evaluating Rental Property Returns</h2>
              <p>Rental yield is the most fundamental metric for evaluating investment properties. It helps you compare potential investments quickly and determine if a property generates meaningful income relative to its cost.</p>
              <h3>Gross vs. Net Yield</h3>
              <p>Gross yield is a quick screening tool. Net yield is the real number — it accounts for vacancy periods, property taxes, insurance, and maintenance. Always make decisions based on net yield, not gross.</p>
              <h3>The 1% Rule</h3>
              <p>A common real estate heuristic is the "1% rule": the monthly rent should be at least 1% of the purchase price. A $300,000 property should rent for at least $3,000/month. Properties meeting this rule tend to generate positive cash flow in most markets.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rental-yield" />
          <PopularCalculators exclude="/calculator/rental-yield-calculator" />
        </div>
      </div>
    </>
  );
};
export default RentalYieldCalculator;

