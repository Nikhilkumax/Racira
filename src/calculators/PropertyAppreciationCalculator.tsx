"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Calculator } from "lucide-react";

const PropertyAppreciationCalculator = () => {
  const [currentValue, setCurrentValue] = useState("350000");
  const [appreciationRate, setAppreciationRate] = useState("4");
  const [years, setYears] = useState("10");
  const [inflationRate, setInflationRate] = useState("3");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const val = parseFloat(currentValue);
    const rate = parseFloat(appreciationRate) / 100;
    const yrs = parseFloat(years);
    const inflation = parseFloat(inflationRate) / 100;

    const futureValue = val * Math.pow(1 + rate, yrs);
    const realReturnRate = ((1 + rate) / (1 + inflation)) - 1;
    const realFutureValue = val * Math.pow(1 + realReturnRate, yrs);
    const totalGain = futureValue - val;
    const equityGrowth = totalGain;

    setResults({ futureValue, realFutureValue, totalGain, equityGrowth, realReturnRate: realReturnRate * 100 });
  };

  const reset = () => {
    setShowResults(false); setCurrentValue("350000"); setAppreciationRate("4"); setYears("10"); setInflationRate("3"); setResults(null); };

  const faqs = [
    { question: "What is the average home appreciation rate?", answer: "Historically, US home prices have appreciated roughly 3-4% per year on average, slightly outpacing inflation. However, rates vary enormously by location — hot markets like Austin or Phoenix have seen 10%+ for extended periods." },
    { question: "What drives home appreciation?", answer: "Key drivers include: supply and demand, local job growth, population growth, interest rates, neighborhood development, and school district quality. Proximity to employment centers is the single strongest driver." },
    { question: "Is real estate a good inflation hedge?", answer: "Yes. Real estate has historically been an excellent inflation hedge because both rents and property values tend to rise with inflation, while a fixed-rate mortgage payment stays constant — effectively getting cheaper in real terms." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Property Appreciation Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Property Appreciation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="val" label="Current Value ($)" value={currentValue} onChange={setCurrentValue} />
                <InputField id="rate" label="Annual Appreciation (%)" value={appreciationRate} onChange={setAppreciationRate} />
                <InputField id="yrs" label="Years" value={years} onChange={setYears} />
                <InputField id="inf" label="Inflation Rate (%)" value={inflationRate} onChange={setInflationRate} />
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2"><Calculator className="h-5 w-5" /> Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Appreciation Forecast</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Future Value (Nominal)</p>
                    <p className="text-5xl font-black text-foreground">${(results.futureValue / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Real Value (Inflation-Adj.)</p>
                    <p className="text-3xl font-black text-foreground">${(results.realFutureValue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Total Gain", value: 0, textValue: "$" + results.totalGain.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                  { label: "Real Return Rate", value: 0, textValue: results.realReturnRate.toFixed(2) + "%/yr (after inflation)" },
                  { label: "Value Multiple", value: 0, textValue: (results.futureValue / parseFloat(currentValue)).toFixed(2) + "x" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Real vs. Nominal Property Returns</h2>
              <p>Nominal appreciation is the headline number — the percentage your property grows each year. But real appreciation, adjusted for inflation, is the true measure of wealth creation.</p>
              <h3>The Leverage Effect</h3>
              <p>Real estate appreciation is amplified by mortgage leverage. If you put 20% down on a property and it appreciates 4%, your actual return on the equity invested is much higher. A $70,000 down payment on a $350,000 property that gains $14,000 (4%) represents a 20% return on your cash invested.</p>
              <h3>Location is Everything</h3>
              <p>National averages mask enormous local variation. Some zip codes have seen 8-10% annual appreciation for decades; others have barely matched inflation. Research population trends, job growth, and housing supply constraints in your specific market before making projections.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/property-appreciation" />
          <PopularCalculators exclude="/calculator/property-appreciation-calculator" />
        </div>
      </div>
    </>
  );
};
export default PropertyAppreciationCalculator;

