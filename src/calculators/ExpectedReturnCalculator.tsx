"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw, TrendingUp, Plus, Trash2 } from "lucide-react";

const ExpectedReturnCalculator = () => {
  const [outcomes, setOutcomes] = useState([
    { id: 1, name: "Bull Market", probability: "30", returnRate: "15" },
    { id: 2, name: "Neutral Market", probability: "50", returnRate: "7" },
    { id: 3, name: "Bear Market", probability: "20", returnRate: "-10" },
  ]);

  const [results, setResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const addOutcome = () => {
    setOutcomes([...outcomes, { id: Date.now(), name: "New Scenario", probability: "0", returnRate: "0" }]);
  };

  const removeOutcome = (id: number) => {
    setOutcomes(outcomes.filter(o => o.id !== id));
  };

  const updateOutcome = (id: number, field: string, value: string) => {
    setOutcomes(outcomes.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const handleCalculate = () => {
    setShowResults(true);
    let expectedReturn = 0;
    let totalProb = 0;

    outcomes.forEach(o => {
      const p = parseFloat(o.probability) || 0;
      const r = parseFloat(o.returnRate) || 0;
      expectedReturn += (p / 100) * r;
      totalProb += p;
    });

    // Risk (Standard Deviation)
    let variance = 0;
    outcomes.forEach(o => {
      const p = parseFloat(o.probability) || 0;
      const r = parseFloat(o.returnRate) || 0;
      variance += (p / 100) * Math.pow(r - expectedReturn, 2);
    });

    setResults({
      expectedReturn,
      totalProb,
      standardDeviation: Math.sqrt(variance),
      isValid: Math.abs(totalProb - 100) < 0.01
    });
  };

  const reset = () => {
    setShowResults(false);
    setOutcomes([
      { id: 1, name: "Bull Market", probability: "30", returnRate: "15" },
      { id: 2, name: "Neutral Market", probability: "50", returnRate: "7" },
      { id: 3, name: "Bear Market", probability: "20", returnRate: "-10" },
    ]);
    setResults(null);
  };

  const faqs = [
    { question: "What is Expected Return?", answer: "Expected return is the amount of profit or loss an investor can anticipate on an investment that has known historical rates of return or multiple possible outcomes." },
    { question: "Why must probabilities sum to 100%?", answer: "The total probability represents all possible outcomes. If the sum is less than 100%, you haven't accounted for all possibilities. If it's more, the calculation will be mathematically impossible." },
    { question: "What does the Standard Deviation tell me?", answer: "Standard deviation measures the 'volatility' or risk of the investment. A higher standard deviation means the actual return is more likely to be far away from the expected average." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Expected Return Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Expected Return Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Investment Scenarios</h3>
                  <button onClick={addOutcome} className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-80 transition-opacity">
                    <Plus className="h-4 w-4" /> Add Scenario
                  </button>
                </div>
                
                {outcomes.map((o) => (
                  <div key={o.id} className="grid grid-cols-[1fr_80px_80px_40px] gap-3 items-center animate-in fade-in slide-in-from-left-2 duration-300">
                    <input 
                      type="text" 
                      value={o.name} 
                      onChange={(e) => updateOutcome(o.id, "name", e.target.value)}
                      placeholder="Scenario Name"
                      className="input-calc !py-2"
                    />
                    <div className="relative">
                      <input 
                        type="number" 
                        value={o.probability} 
                        onChange={(e) => updateOutcome(o.id, "probability", e.target.value)}
                        className="input-calc !py-2 !pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={o.returnRate} 
                        onChange={(e) => updateOutcome(o.id, "returnRate", e.target.value)}
                        className="input-calc !py-2 !pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">%</span>
                    </div>
                    <button onClick={() => removeOutcome(o.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1 flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Calculate Return
                </button><button onClick={reset} className="p-3 rounded-xl border border-border hover:bg-secondary transition-colors text-muted-foreground">
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>
              
              {results && !results.isValid && (
                <p className="mt-4 text-center text-sm font-bold text-red-500">
                  Warning: Probabilities sum to {results.totalProb}%. They must sum to 100% for an accurate result.
                </p>
              )}
          </div>

          <div className="flex flex-col gap-3">
            {results && results.isValid && (
              <>
                <h2 className="text-xl font-bold mb-6">Investment Projection</h2>
                <div className="grid sm:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Expected Return</p>
                    <p className="text-5xl font-black text-foreground">{results.expectedReturn.toFixed(2)}%</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/10 text-center flex flex-col justify-center">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Standard Deviation (Risk)</p>
                    <p className="text-3xl font-black text-foreground">{results.standardDeviation.toFixed(2)}%</p>
                  </div>
                </div>
                <ResultDisplay items={[
                  { label: "Scenario Count", value: 0, textValue: outcomes.length.toString() },
                  { label: "Total Probability", value: 0, textValue: results.totalProb + "%" },
                  { label: "Risk-Adjusted Return", value: 0, textValue: (results.expectedReturn / results.standardDeviation).toFixed(2) + " (Sharpe)" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
              <h2>Managing Investment Uncertainty</h2>
              <p>In a world of fluctuating markets, static returns are rare. Expected return analysis allows investors to quantify the range of possibilities and make decisions based on the "average" outcome.</p>
              <h3>The Probability-Weighted Average</h3>
              <p>To find the expected return, you multiply each possible return by the probability of that return occurring, then sum those values. This gives you a single number that represents the most likely mathematical outcome over many repetitions.</p>
              <h3>Why Volatility Matters</h3>
              <p>Two investments might both have an expected return of 7%. However, if one has a 0% standard deviation (a government bond) and the other has a 20% standard deviation (a tech stock), the tech stock is significantly riskier. Most investors require a higher expected return to compensate for higher standard deviation.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/expected-return" />
          <PopularCalculators exclude="/calculator/expected-return-calculator" />
        </div>
      </div>
    </>
  );
};

export default ExpectedReturnCalculator;

