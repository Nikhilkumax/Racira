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
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">Property Appreciation Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Estimate the future value of your property and real inflation-adjusted returns over any time horizon.</p>
            <div className="card-calculator mb-8">
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
            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              </div>
            )}
            <AdPlaceholder className="mb-8" />

            {/* SEO Content Sections */}
            <div className="mt-4 space-y-8 mb-10">
              <section>
                <h2 className="text-2xl font-bold mb-4">How the Property Appreciation Calculator Works</h2>
                <p className="text-muted-foreground mb-3">Enter your property's current value, an expected annual appreciation rate, your time horizon in years, and the prevailing inflation rate. Click Calculate and the tool instantly projects both the nominal (face-value) and real (inflation-adjusted) future value of your property.</p>
                <p className="text-muted-foreground mb-3">The nominal future value uses standard compound growth: FV = PV × (1 + r)^n. The real return strips out inflation using the Fisher equation — Real Rate = ((1 + nominal) / (1 + inflation)) − 1 — to show how much purchasing power your property actually gains.</p>
                <p className="text-muted-foreground">The value multiple tells you at a glance how many times larger your investment will be. A 2.19× multiple on a 10-year horizon means the property more than doubled in nominal terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Understanding Your Results</h2>
                <p className="text-muted-foreground mb-3">The <strong>Future Value (Nominal)</strong> is the raw projected price you could sell for, ignoring what money is worth at that time. This is the number most people quote when talking about appreciation.</p>
                <p className="text-muted-foreground mb-3">The <strong>Real Value (Inflation-Adjusted)</strong> shows how much of that gain is genuine wealth creation versus simply keeping pace with rising prices. If your nominal return equals inflation, the real value equals today's value — you've broken even in purchasing power.</p>
                <p className="text-muted-foreground">The <strong>Real Return Rate</strong> is the annualized growth rate above inflation. Even a modest 1–2% real annual return compounded over 20+ years produces substantial wealth — particularly when amplified by mortgage leverage on a leveraged investment.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-4">Common Use Cases</h2>
                <p className="text-muted-foreground mb-3"><strong>Homebuyer planning:</strong> Prospective buyers use this tool to estimate whether a home purchase makes financial sense versus renting and investing the difference, comparing real estate returns with stock market benchmarks.</p>
                <p className="text-muted-foreground mb-3"><strong>Real estate investors:</strong> Landlords project gross appreciation on rental properties to assess total return (appreciation + rent yield) and make buy/hold/sell decisions at various time horizons.</p>
                <p className="text-muted-foreground"><strong>Retirement planning:</strong> Homeowners approaching retirement use the calculator to estimate how much equity they will have when they downsize, which directly informs how much they can allocate to other retirement income sources.</p>
              </section>
            </div>

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
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};
export default PropertyAppreciationCalculator;

