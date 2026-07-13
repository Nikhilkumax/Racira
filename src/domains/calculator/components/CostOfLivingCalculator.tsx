"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, ArrowRight } from "lucide-react";

const CostOfLivingCalculator = () => {
  const [currentSalary, setCurrentSalary] = useState("80000");
  const [currentCityIndex, setCurrentCityIndex] = useState("100");
  const [targetCityIndex, setTargetCityIndex] = useState("125");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const salary = parseFloat(currentSalary) || 0;
    const cIndex = parseFloat(currentCityIndex) || 100;
    const tIndex = parseFloat(targetCityIndex) || 100;

    const equivalentSalary = (salary / cIndex) * tIndex;
    const difference = equivalentSalary - salary;
    const percentage = ((tIndex - cIndex) / cIndex) * 100;

    setResults({
      equivalentSalary,
      difference,
      percentage,
      isMoreExpensive: tIndex > cIndex
    });
  };

  const reset = () => {
    setShowResults(false);
    setCurrentSalary("80000");
    setCurrentCityIndex("100");
    setTargetCityIndex("125");
    setResults(null);
  };

  const faqs = [
    { question: "What is a cost of living index?", answer: "A cost of living index is a theoretical price index that measures relative differences in the prices of consumer goods and services between different locations. A score of 100 usually represents the national average." },
    { question: "What factors are included in cost of living?", answer: "Most indices include housing, groceries, utilities, transportation, healthcare, and miscellaneous taxes. Housing is typically the most significant variable between cities." },
    { question: "Should I move for a higher salary in a more expensive city?", answer: "Not necessarily. If your salary increases by 10% but the cost of living increases by 20%, your standard of living will actually decrease. Use this calculator to find the 'equivalent salary' you need to maintain your current lifestyle." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cost of Living" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cost of Living Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Current Location</h3>
                  <InputField id="currentSalary" label="Current Annual Salary" value={currentSalary} onChange={setCurrentSalary} prefix="$" />
                  <InputField id="currentCityIndex" label="City Cost Index (Default 100)" value={currentCityIndex} onChange={setCurrentCityIndex} tooltip="National average is 100. NYC is ~180, Dallas is ~105." />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Target Location</h3>
                  <div className="pt-10 hidden sm:block">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  </div>
                  <InputField id="targetCityIndex" label="Target City Cost Index" value={targetCityIndex} onChange={setTargetCityIndex} />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-3">Equivalent Salary Needed</h2>
                  <p className="text-5xl font-extrabold mb-2">${Math.round(results.equivalentSalary).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Target city is <span className="font-bold text-foreground">{Math.abs(results.percentage).toFixed(1)}% {results.isMoreExpensive ? 'more' : 'less'}</span> expensive
                  </p>
                </div>

                <ResultDisplay items={[
                  { label: "Target Equivalent Salary", value: results.equivalentSalary, highlight: true },
                  { label: "Salary Difference Required", value: results.difference, highlight: results.difference > 0 },
                  { label: "Current Purchasing Power", value: parseFloat(currentSalary) },
                  { label: "Cost of Living Change", value: 0, textValue: `${results.percentage.toFixed(1)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Calculating Your Real Income</h2>
              <p>Salary is a relative number. A $100,000 salary in San Francisco may provide a lower standard of living than a $60,000 salary in a smaller Midwest town. Understanding the cost of living index helps you compare "apples to apples" when evaluating job offers.</p>
              <h3>Why Housing Dominates</h3>
              <p>In most cost of living calculations, housing accounts for 30-40% of the total weight. While groceries and utilities may only vary by 10-15% between cities, housing costs can vary by 300% or more. This makes housing the primary driver of regional wealth differences.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cost-of-living-calculator" />
          <PopularCalculators exclude="/calculator/cost-of-living-calculator" />
        </div>
      </div>
    </>
  );
};

export default CostOfLivingCalculator;

