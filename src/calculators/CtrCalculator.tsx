"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, Target } from "lucide-react";

const CtrCalculator = () => {
  const [clicks, setClicks] = useState("50");
  const [impressions, setImpressions] = useState("2000");

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const cl = parseFloat(clicks) || 0;
    const i = parseFloat(impressions) || 0;

    if (i <= 0) return;

    // CTR = (Clicks / Impressions) * 100
    const ctr = (cl / i) * 100;

    let rating = "Average";
    if (ctr > 5) rating = "Excellent";
    else if (ctr > 2) rating = "Good";
    else if (ctr < 0.5) rating = "Low";

    setResults({
      ctr,
      rating,
      oneClickPer: i / cl
    });
  };

  const reset = () => {
    setShowResults(false);
    setClicks("50"); setImpressions("2000");
    setResults(null);
  };

  const faqs = [
    { question: "What is CTR?", answer: "CTR stands for 'Click-Through Rate.' It measures the percentage of people who see your ad (impressions) and then actually click on it. It is the primary way to measure how relevant and engaging your ad is to your target audience." },
    { question: "What is a good CTR for Facebook Ads?", answer: "The average CTR for Facebook ads across all industries is about 0.90%. Anything over 1% is considered good, and 2%+ is excellent." },
    { question: "Does CTR affect my ad costs?", answer: "Yes. Platforms like Google and Facebook reward ads with high CTRs by lowering their CPC. They want to show relevant content that users engage with, so they effectively give you a discount for having 'better' ads." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CTR Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CTR (Click-Through Rate) Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate the effectiveness of your ad creative and targeting by measuring your click-through rate.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <InputField id="clicks" label="Total Clicks" value={clicks} onChange={setClicks} />
                <InputField id="impressions" label="Total Impressions" value={impressions} onChange={setImpressions} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <Target className="h-5 w-5" /> Calculate CTR
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && results && (
              <>
                <h2 className="text-xl font-bold mb-6">Engagement Analysis</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Click-Through Rate</p>
                    <p className="text-5xl font-black text-foreground">{results.ctr.toFixed(2)}%</p>
                  </div>
                  <div className={`p-6 rounded-2xl border text-center flex flex-col justify-center ${results.rating === "Excellent" || results.rating === "Good" ? "bg-green-500/5 border-green-500/10" : "bg-orange-500/5 border-orange-500/10"}`}>
                    <p className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Performance Rating</p>
                    <p className={`text-3xl font-black ${results.rating === "Excellent" || results.rating === "Good" ? "text-green-600" : "text-orange-600"}`}>{results.rating}</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "1 Click per X Impressions", value: 0, textValue: results.oneClickPer.toFixed(0) },
                  { label: "Impressions Needed for 1000 Clicks", value: 0, textValue: (1000 / (results.ctr / 100)).toLocaleString() },
                  { label: "Engagement Focus", value: 0, textValue: "Creative Quality" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Why CTR is the Most Important Ad Metric</h2>
              <p>CTR is the ultimate 'BS detector' in advertising. It tells you exactly whether your message is resonating with your audience. If 1,000 people see your ad and no one clicks, you have a message-market mismatch.</p>
              <h3>Increasing Your CTR</h3>
              <p>The most common ways to increase CTR are: (1) Using high-contrast images or 'scroll-stopping' video hooks, (2) Writing a compelling headline that promises a benefit, and (3) Having a clear Call-to-Action (CTA) like 'Shop Now' or 'Learn More'.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ctr" />
          <PopularCalculators exclude="/calculator/ctr-calculator" />
        </div>
      </div>
    </>
  );
};

export default CtrCalculator;

