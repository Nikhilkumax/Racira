"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw, Percent } from "lucide-react";

const CpmCalculator = () => {
  const [cost, setCost] = useState("500");
  const [impressions, setImpressions] = useState("100000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const c = parseFloat(cost) || 0;
    const i = parseFloat(impressions) || 0;

    if (i <= 0) return;

    // CPM = (Cost / Impressions) * 1000
    const cpm = (c / i) * 1000;

    setResults({
      cpm,
      costPerImpression: c / i,
      monthlyBudgetAtThisRate: cpm * 1000 // cost for 1M impressions
    });
  };

  const reset = () => {
    setShowResults(false);
    setCost("500"); setImpressions("100000");
    setResults(null);
  };

  const faqs = [
    { question: "What is CPM?", answer: "CPM stands for 'Cost Per Mille,' where 'mille' is the Latin word for thousand. It represents the cost an advertiser pays for 1,000 views or impressions of an advertisement." },
    { question: "Is a lower CPM always better?", answer: "Not necessarily. A very low CPM might mean your ads are being shown to a low-quality audience or in placements where they aren't being noticed. You should always measure CPM alongside conversion rates and ROI." },
    { question: "How is CPM different from CPC?", answer: "CPM is based on views (impressions), regardless of whether anyone clicks. CPC (Cost Per Click) is based strictly on how many people actually click the advertisement." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CPM Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CPM Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="cost" label="Total Campaign Cost" value={cost} onChange={setCost} prefix="$" />
                <InputField id="impressions" label="Total Impressions" value={impressions} onChange={setImpressions} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">Calculate</button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <div className="text-center p-8 bg-primary/5 rounded-3xl border border-primary/10 mb-8">
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Campaign CPM</p>
                  <p className="text-7xl font-black text-foreground">${results.cpm.toFixed(2)}</p>
                </div>
                <ResultDisplay items={[
                  { label: "Cost Per Single Impression", value: 0, textValue: "$" + results.costPerImpression.toFixed(4) },
                  { label: "Cost for 1M Impressions", value: 0, textValue: "$" + (results.cpm * 1000).toLocaleString() },
                  { label: "Efficiency Rating", value: 0, textValue: results.cpm < 5 ? "High Efficiency" : results.cpm < 15 ? "Average" : "Premium" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Mastering CPM in Advertising</h2>
              <p>CPM is the standard metric for brand awareness campaigns. Whether you are running ads on Facebook, Google, or YouTube, understanding your CPM is the first step in optimizing your budget.</p>
              <h3>Why CPM Matters</h3>
              <p>CPM allows you to compare the cost of different advertising platforms on an even playing field. If one platform has a CPM of $5.00 and another has $15.00, you know exactly how many more people you can reach for the same investment on the first platform.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cpm" />
          <PopularCalculators exclude="/calculator/cpm-calculator" />
        </div>
      </div>
    </>
  );
};

export default CpmCalculator;

