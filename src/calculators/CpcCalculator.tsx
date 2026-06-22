"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, MousePointer2 } from "lucide-react";

const CpcCalculator = () => {
  const [cost, setCost] = useState("1000");
  const [clicks, setClicks] = useState("500");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const c = parseFloat(cost) || 0;
    const cl = parseFloat(clicks) || 0;

    if (cl <= 0) return;

    // CPC = Cost / Clicks
    const cpc = c / cl;

    setResults({
      cpc,
      clicksPerDollar: cl / c,
      monthlyBudget10k: cpc * 10000
    });
  };

  const reset = () => {
    setShowResults(false);
    setCost("1000"); setClicks("500");
    setResults(null);
  };

  const faqs = [
    { question: "What is CPC?", answer: "CPC stands for 'Cost Per Click.' It is a performance-based advertising metric where you only pay when a user actually clicks on your advertisement." },
    { question: "What is a good CPC for Google Ads?", answer: "Average CPC varies wildly by industry. For legal or insurance services, CPC can be $50 or more. For clothing or home goods, it might be under $1.00." },
    { question: "How can I lower my CPC?", answer: "Improve your 'Quality Score' (relevance of your ad to the landing page), target more specific 'long-tail' keywords, and test different ad copy to increase your Click-Through Rate (CTR)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CPC Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CPC (Cost Per Click) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="cost" label="Total Ad Spend" value={cost} onChange={setCost} prefix="$" />
                <InputField id="clicks" label="Total Clicks" value={clicks} onChange={setClicks} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <MousePointer2 className="h-5 w-5" /> Calculate CPC
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center p-8 bg-primary/5 rounded-3xl border border-primary/10 mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Cost Per Click</p>
                  <p className="text-7xl font-black text-foreground">${results.cpc.toFixed(2)}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Clicks per $1.00", value: 0, textValue: results.clicksPerDollar.toFixed(2) },
                  { label: "Cost for 10,000 Clicks", value: 0, textValue: "$" + results.monthlyBudget10k.toLocaleString() },
                  { label: "Campaign Focus", value: 0, textValue: "Direct Response" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
              <h2>Optimizing for CPC</h2>
              <p>CPC is the most popular metric for performance marketers. Unlike CPM, where you pay for eyeballs, CPC ensures you only pay when you actually get a visitor to your site.</p>
              <h3>Balancing CPC and Conversion</h3>
              <p>A low CPC is great, but only if those visitors are actually interested in your product. It is often better to pay a $2.00 CPC for a highly targeted visitor than a $0.20 CPC for someone who leaves your site immediately. Always track your 'Cost Per Acquisition' (CPA) alongside your CPC.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cpc" />
          <PopularCalculators exclude="/calculator/cpc-calculator" />
        </div>
      </div>
    </>
  );
};

export default CpcCalculator;

