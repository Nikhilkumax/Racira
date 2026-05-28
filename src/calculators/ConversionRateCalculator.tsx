"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, TrendingUp } from "lucide-react";

const ConversionRateCalculator = () => {
  const [conversions, setConversions] = useState("25");
  const [visitors, setVisitors] = useState("1000");
  const [spend, setSpend] = useState("500");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const conv = parseFloat(conversions) || 0;
    const vis = parseFloat(visitors) || 0;
    const cost = parseFloat(spend) || 0;

    if (vis <= 0) return;

    // Conv Rate = (Conversions / Visitors) * 100
    const rate = (conv / vis) * 100;
    const cpa = conv > 0 ? cost / conv : 0;

    setResults({
      rate,
      cpa,
      visitorsPerSale: vis / conv,
      projectedSalesAt5k: (5000 * (rate / 100))
    });
  };

  const reset = () => {
    setShowResults(false);
    setConversions("25"); setVisitors("1000"); setSpend("500");
    setResults(null);
  };

  const faqs = [
    { question: "What is a good conversion rate for e-commerce?", answer: "The average e-commerce conversion rate is between 1% and 3%. High-performing stores can see rates of 5% or even 10% for highly targeted landing pages." },
    { question: "What is the difference between CR and ROI?", answer: "Conversion Rate (CR) measures how many people take a specific action (like buying). ROI (Return on Investment) measures the actual profitability of those actions compared to what you spent to get them." },
    { question: "How can I improve my conversion rate?", answer: "Simplify your checkout process, add social proof (reviews/testimonials), ensure your site loads fast, and use high-quality product images." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Conversion Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Conversion Rate Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate your conversion percentage and Cost Per Acquisition (CPA) to measure marketing ROI.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <InputField id="conversions" label="Total Conversions" value={conversions} onChange={setConversions} tooltip="Number of sales, leads, or signups." />
                <InputField id="visitors" label="Total Visitors" value={visitors} onChange={setVisitors} />
                <InputField id="spend" label="Total Ad Spend" value={spend} onChange={setSpend} prefix="$" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Calculate Conversion
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Marketing Performance</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Conversion Rate</p>
                    <p className="text-5xl font-black text-foreground">{results.rate.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Cost Per Acquisition (CPA)</p>
                    <p className="text-4xl font-black text-foreground">${results.cpa.toFixed(2)}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "1 Conversion per X Visitors", value: 0, textValue: results.visitorsPerSale.toFixed(1) },
                  { label: "Proj. Sales at 5,000 Visitors", value: 0, textValue: Math.round(results.projectedSalesAt5k).toString() },
                  { label: "Efficiency Rating", value: 0, textValue: results.rate > 3 ? "High" : results.rate > 1 ? "Average" : "Optimization Needed" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>The Most Important E-commerce Metric</h2>
              <p>While traffic is important, the Conversion Rate is what actually pays the bills. A small improvement in your conversion rate can have a massive impact on your bottom line without increasing your ad spend.</p>
              <h3>Mathematics of Conversion</h3>
              <p>If you have 10,000 visitors and a 1% conversion rate, you have 100 sales. If you improve that rate to just 2%, you have 200 sales. You have doubled your revenue with the exact same amount of traffic.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conversion-rate" />
          <PopularCalculators exclude="/calculator/conversion-rate-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConversionRateCalculator;

