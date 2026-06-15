"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const PercentErrorCalculator = () => {
  const [experimental, setExperimental] = useState("10.2");
  const [theoretical, setTheoretical] = useState("10");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const exp = parseFloat(experimental) || 0;
    const theo = parseFloat(theoretical) || 0;
    if (theo === 0) return;
    const absError = Math.abs(exp - theo);
    const pctError = (absError / Math.abs(theo)) * 100;
    const relError = absError / Math.abs(theo);
    setResult({ experimental: exp, theoretical: theo, absError, pctError, relError });
  };

  const reset = () => {
    setShowResults(false); setExperimental("10.2"); setTheoretical("10"); setResult(null); };

  const faqs = [
    { question: "What is percent error?", answer: "Percent error measures the difference between an experimental value and a theoretical (accepted) value as a percentage: |experimental − theoretical| / |theoretical| × 100%." },
    { question: "What is absolute error?", answer: "Absolute error is simply the absolute difference between the experimental and theoretical values: |experimental − theoretical|." },
    { question: "What is relative error?", answer: "Relative error is the absolute error divided by the theoretical value: |experimental − theoretical| / |theoretical|. Multiply by 100 to get percent error." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Percent Error Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Percent Error Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="experimental" label="Experimental Value" value={experimental} onChange={setExperimental} />
                <InputField id="theoretical" label="Theoretical Value" value={theoretical} onChange={setTheoretical} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[
                  { label: "Percent Error", value: 0, textValue: `${result.pctError.toFixed(4)}%`, highlight: true },
                  { label: "Absolute Error", value: 0, textValue: result.absError.toFixed(6) },
                  { label: "Relative Error", value: 0, textValue: result.relError.toFixed(6) },
                  { label: "Experimental", value: 0, textValue: result.experimental.toString() },
                  { label: "Theoretical", value: 0, textValue: result.theoretical.toString() },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Understanding Percent Error</h2>
              <p>Percent error quantifies how far an experimental measurement is from the accepted (theoretical) value. It is widely used in chemistry, physics, and engineering to assess measurement accuracy. The formula is: % Error = |Experimental − Theoretical| / |Theoretical| × 100%.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percent-error-calculator" />
          <PopularCalculators exclude="/percent-error-calculator" />
        </div>
      </div>
    </>
  );
};

export default PercentErrorCalculator;


