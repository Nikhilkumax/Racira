"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const CustomerLifetimeValueCalculator = () => {
  const [avgOrderValue, setAvgOrderValue] = useState("100");
  const [purchaseFreq, setPurchaseFreq] = useState("4");
  const [customerLifespan, setCustomerLifespan] = useState("3");
  const [profitMargin, setProfitMargin] = useState("40");
  const [retentionRate, setRetentionRate] = useState("80");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const aov = parseFloat(avgOrderValue) || 0;
    const freq = parseFloat(purchaseFreq) || 0;
    const lifespan = parseFloat(customerLifespan) || 0;
    const margin = (parseFloat(profitMargin) || 0) / 100;
    const retention = (parseFloat(retentionRate) || 0) / 100;

    // Simple LTV = AOV * Freq * Lifespan
    const revenueLTV = aov * freq * lifespan;
    const profitLTV = revenueLTV * margin;
    
    // Churn-based LTV = (AOV * Freq * Margin) / (1 - Retention)
    const churnLTV = (aov * freq * margin) / (1 - retention);

    setResults({
      revenueLTV,
      profitLTV,
      churnLTV,
      churnRate: (1 - retention) * 100
    });
  };

  const reset = () => {
    setShowResults(false);
    setAvgOrderValue("100");
    setPurchaseFreq("4");
    setCustomerLifespan("3");
    setResults(null);
  };

  const faqs = [
    { question: "What is Customer Lifetime Value (CLV)?", answer: "Customer Lifetime Value is the total amount of money a customer is expected to spend with your business during their entire relationship with you. It is a critical metric for determining how much you can afford to spend on acquiring new customers (CAC)." },
    { question: "Why is profit margin important in LTV?", answer: "Revenue LTV tells you how much money flows through your business, but Profit LTV tells you how much stays in your pocket. To have a sustainable business, your CAC must be significantly lower than your Profit LTV." },
    { question: "How can I improve my LTV?", answer: "You can improve LTV by increasing average order value (upselling), increasing purchase frequency (loyalty programs), or increasing customer lifespan (improving retention/reducing churn)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "LTV Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Customer Lifetime Value (LTV) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-8 mb-6">
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Order Metrics</h3>
                  <InputField id="aov" label="Average Order Value" value={avgOrderValue} onChange={setAvgOrderValue} prefix="$" />
                  <InputField id="freq" label="Purchase Frequency (per year)" value={purchaseFreq} onChange={setPurchaseFreq} />
                  <InputField id="margin" label="Gross Profit Margin" value={profitMargin} onChange={setProfitMargin} suffix="%" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold border-b pb-2">Retention Metrics</h3>
                  <InputField id="lifespan" label="Avg Customer Lifespan" value={customerLifespan} onChange={setCustomerLifespan} suffix="Years" />
                  <InputField id="retention" label="Annual Retention Rate" value={retentionRate} onChange={setRetentionRate} suffix="%" />
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
                  <h2 className="text-2xl font-bold mb-3">Profit LTV</h2>
                  <p className="text-5xl font-extrabold mb-2">${Math.round(results.profitLTV).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Revenue LTV: <span className="font-bold text-foreground">${Math.round(results.revenueLTV).toLocaleString()}</span></p>
                </div>

                <ResultDisplay items={[
                  { label: "Expected Profit LTV", value: results.profitLTV, highlight: true },
                  { label: "Churn-Adjusted LTV", value: results.churnLTV, highlight: true },
                  { label: "Average Revenue LTV", value: results.revenueLTV },
                  { label: "Annual Churn Rate", value: 0, textValue: `${results.churnRate.toFixed(1)}%` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Sidebar Ad" />
          <article className="prose-finance text-[15.75px]">
              <h2>The Most Important Business Metric</h2>
              <p>Customer Lifetime Value (LTV) is the North Star for marketing and growth teams. If you know a customer is worth $500 in profit over their lifetime, you can confidently spend $150 to acquire them. Without this number, you are flying blind with your advertising budget.</p>
              <h3>The LTV/CAC Ratio</h3>
              <p>In the SaaS and e-commerce world, an LTV/CAC ratio of 3:1 is considered the gold standard for a healthy business. This means that for every $1 you spend on marketing, you eventually get $3 in profit back. A ratio below 1:1 means you are losing money on every customer you acquire.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/lifetime-value-calculator" />
          <PopularCalculators exclude="/calculator/lifetime-value-calculator" />
        </div>
      </div>
    </>
  );
};

export default CustomerLifetimeValueCalculator;

