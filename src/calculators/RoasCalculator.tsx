"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const RoasCalculator = () => {
  const [revenue, setRevenue] = useState("5000");
  const [spend, setSpend] = useState("1000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const rev = parseFloat(revenue) || 0;
    const cost = parseFloat(spend) || 0;

    if (cost <= 0) return;

    // ROAS = Revenue / Cost
    const roas = rev / cost;
    const profit = rev - cost;

    setResults({
      roas,
      roasPct: roas * 100,
      profit,
      margin: (profit / rev) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setRevenue("5000"); setSpend("1000");
    setResults(null);
  };

  const faqs = [
    { question: "What is ROAS?", answer: "ROAS stands for 'Return on Ad Spend.' It measures how many dollars of revenue you earn for every dollar spent on advertising." },
    { question: "What is a 'good' ROAS?", answer: "A common benchmark is 4:1 ($4.00 revenue for every $1.00 spent). However, this depends on your product margins. If your product costs 90% of its sale price to make, a 4:1 ROAS might actually be losing you money." },
    { question: "How is ROAS different from ROI?", answer: "ROAS only looks at ad spend versus revenue. ROI (Return on Investment) accounts for all costs, including product manufacturing, shipping, and overhead." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "ROAS Calculator" }]} />
      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 text-foreground">ROAS (Return on Ad Spend) Calculator</h1>
            <p className="text-muted-foreground mb-8 text-lg">Calculate the profitability of your advertising campaigns by measuring revenue generated per dollar spent.</p>

            <div className="card-calculator mb-8">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="revenue" label="Total Ad Revenue" value={revenue} onChange={setRevenue} prefix="$" />
                <InputField id="spend" label="Total Ad Spend" value={spend} onChange={setSpend} prefix="$" />
              </div>

              <div className="flex gap-3 items-center">
                <button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground flex items-center gap-2 font-bold text-sm">
                  <RotateCcw className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>

            {showResults && results && (
              <div className="card-calculator mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6">Campaign Profitability</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">ROAS Ratio</p>
                    <p className="text-5xl font-black text-foreground">{results.roas.toFixed(2)}x</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Profit (After Ads)</p>
                    <p className="text-4xl font-black text-foreground">${results.profit.toLocaleString()}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Return Percentage", value: 0, textValue: results.roasPct.toFixed(0) + "%" },
                  { label: "Gross Margin (from Ads)", value: 0, textValue: results.margin.toFixed(1) + "%" },
                  { label: "Scaling Potential", value: 0, textValue: results.roas > 4 ? "High" : results.roas > 2 ? "Moderate" : "Low" },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-8" />
            <article className="prose-finance">
              <h2>Scaling Your Business with ROAS</h2>
              <p>ROAS is the primary compass for e-commerce brands. If you know that every dollar you put into Facebook Ads returns five dollars in sales, you can scale your budget with confidence.</p>
              <h3>The Break-Even ROAS</h3>
              <p>It is vital to know your 'Break-Even ROAS'. This is the point where your ad revenue covers both the ad spend and the cost of the goods sold. For many businesses, a ROAS below 2.5x is a signal to stop or optimize the campaign.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/roas" />
            <PopularCalculators exclude="/calculator/roas-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[600px]" label="Sticky Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default RoasCalculator;

