"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Building } from "lucide-react";

const CapRateCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState("400000");
  const [grossRent, setGrossRent] = useState("36000");
  const [vacancyRate, setVacancyRate] = useState("5");
  const [operatingExpenses, setOperatingExpenses] = useState("8000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const price = parseFloat(purchasePrice);
    const gross = parseFloat(grossRent);
    const vacancy = parseFloat(vacancyRate) / 100;
    const expenses = parseFloat(operatingExpenses);

    const effectiveGrossIncome = gross * (1 - vacancy);
    const noi = effectiveGrossIncome - expenses;
    const capRate = (noi / price) * 100;
    const impliedValue = noi / 0.07; // at 7% cap rate
    const grossRentMultiplier = price / gross;

    setResults({ noi, capRate, effectiveGrossIncome, impliedValue, grossRentMultiplier });
  };

  const reset = () => {
    setShowResults(false); setPurchasePrice("400000"); setGrossRent("36000"); setVacancyRate("5"); setOperatingExpenses("8000"); setResults(null); };

  const faqs = [
    { question: "What is Cap Rate?", answer: "Cap Rate (Capitalization Rate) is the ratio of Net Operating Income (NOI) to the property's value or purchase price. It is the most widely used metric for comparing commercial real estate investments." },
    { question: "What is a good cap rate?", answer: "Cap rates vary significantly by market and property type. Generally, 4-6% is common in high-demand urban markets, while 7-10% may be found in secondary markets. Lower cap rates indicate higher prices relative to income (lower risk, lower return)." },
    { question: "What is NOI?", answer: "Net Operating Income (NOI) is gross rental income minus vacancy losses minus operating expenses (property tax, insurance, maintenance, management). It does NOT include mortgage payments or depreciation." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cap Rate Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Cap Rate Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate the capitalization rate and Net Operating Income for any real estate investment property.</p>
            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
                <InputField id="price" label="Purchase Price ($)" value={purchasePrice} onChange={setPurchasePrice} />
                <InputField id="rent" label="Annual Gross Rent ($)" value={grossRent} onChange={setGrossRent} />
                <InputField id="vac" label="Vacancy Rate (%)" value={vacancyRate} onChange={setVacancyRate} />
                <InputField id="exp" label="Annual Operating Expenses ($)" value={operatingExpenses} onChange={setOperatingExpenses} tooltip="Include taxes, insurance, maintenance. Exclude mortgage." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Building className="h-5 w-5" /> Calculate Cap Rate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Investment Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Cap Rate</p>
                    <p className="text-5xl font-black text-foreground">{results.capRate.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Net Operating Income</p>
                    <p className="text-3xl font-black text-foreground">${results.noi.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Effective Gross Income", value: 0, textValue: "$" + results.effectiveGrossIncome.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Gross Rent Multiplier (GRM)", value: 0, textValue: results.grossRentMultiplier.toFixed(1) + "x" },
                  { label: "Implied Value @ 7% Cap", value: 0, textValue: "$" + results.impliedValue.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                ]} />
              </div>
            )}
            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Cap Rate as a Valuation Tool</h2>
              <p>Cap rates allow investors to compare properties quickly and establish relative values across markets. A property's cap rate tells you the return you'd earn if you paid all cash with no mortgage.</p>
              <h3>Cap Rate and Market Cycles</h3>
              <p>Cap rates move inversely with property values. When prices rise, cap rates compress (fall). When prices fall, cap rates expand (rise). Monitoring cap rate trends in a market helps you understand where in the cycle a market sits.</p>
              <h3>Using Cap Rate to Value Property</h3>
              <p>Investors often use the formula: <strong>Property Value = NOI ÷ Cap Rate</strong>. If you know the market cap rate for comparable properties, you can quickly determine a fair value for any property based solely on its income.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cap-rate" />
            <PopularCalculators exclude="/calculator/cap-rate-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default CapRateCalculator;

