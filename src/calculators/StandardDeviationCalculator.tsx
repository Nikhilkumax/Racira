"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const StandardDeviationCalculator = () => {
  const [data, setData] = useState("4, 8, 6, 5, 3, 7, 2, 9");
  const [type, setType] = useState<"population" | "sample">("population");
  const [result, setResult] = useState<{
    mean: number; variance: number; stdDev: number; count: number;
    sumSquaredDev: number; steps: string[];
  } | null>(null);

  const calculate = () => {
    const nums = data.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (nums.length < 2) return;
    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const squaredDiffs = nums.map(x => (x - mean) ** 2);
    const sumSquaredDev = squaredDiffs.reduce((a, b) => a + b, 0);
    const divisor = type === "population" ? n : n - 1;
    const variance = sumSquaredDev / divisor;
    const stdDev = Math.sqrt(variance);

    const steps = [
      `1. Mean = ${nums.join(" + ")} / ${n} = ${mean.toFixed(4)}`,
      `2. Squared deviations: ${squaredDiffs.map(d => d.toFixed(4)).join(", ")}`,
      `3. Sum of squared deviations = ${sumSquaredDev.toFixed(4)}`,
      `4. Variance = ${sumSquaredDev.toFixed(4)} / ${divisor} = ${variance.toFixed(4)}`,
      `5. Std Dev = √${variance.toFixed(4)} = ${stdDev.toFixed(4)}`,
    ];

    setResult({ mean, variance, stdDev, count: n, sumSquaredDev, steps });
  };

  const reset = () => { setData("4, 8, 6, 5, 3, 7, 2, 9"); setResult(null); };

  const faqs = [
    { question: "When should I use population vs sample standard deviation?", answer: "Use population (σ) when your data includes every member of the group. Use sample (s) when your data is a subset — it uses N-1 (Bessel's correction) to give an unbiased estimate." },
    { question: "What does standard deviation tell me?", answer: "It measures how spread out values are from the mean. A low std dev means values cluster near the mean; a high std dev means they're spread out." },
    { question: "What is the 68-95-99.7 rule?", answer: "For normally distributed data: ~68% falls within 1 std dev of the mean, ~95% within 2, and ~99.7% within 3." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Standard Deviation Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Standard Deviation Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate standard deviation with step-by-step workings.</p>

            <div className="card-calculator mb-8">
              <div className="flex gap-2 mb-6">
                <button onClick={() => setType("population")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${type === "population" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Population (σ)</button>
                <button onClick={() => setType("sample")} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${type === "sample" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Sample (s)</button>
              </div>

              <div className="mb-6">
                <label htmlFor="data" className="text-sm font-medium text-foreground mb-1.5 block">Data Set</label>
                <textarea id="data" value={data} onChange={(e) => setData(e.target.value)} rows={3} className="input-calc w-full resize-none" placeholder="Enter numbers separated by commas or spaces" />
              </div>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[
                  { label: "Standard Deviation", value: 0, textValue: result.stdDev.toFixed(6), highlight: true },
                  { label: "Variance", value: 0, textValue: result.variance.toFixed(6) },
                  { label: "Mean", value: 0, textValue: result.mean.toFixed(6) },
                  { label: "Count (N)", value: 0, textValue: result.count.toString() },
                  { label: "Σ(x - μ)²", value: 0, textValue: result.sumSquaredDev.toFixed(6) },
                ]} />

                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <h3 className="font-semibold mb-2">Step-by-Step Solution</h3>
                  {result.steps.map((step, i) => (
                    <p key={i} className="text-sm text-muted-foreground mb-1 font-mono">{step}</p>
                  ))}
                </div>
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>Standard Deviation Formula</h2>
              <p><strong>Population:</strong> σ = √(Σ(xᵢ − μ)² / N)</p>
              <p><strong>Sample:</strong> s = √(Σ(xᵢ − x̄)² / (N − 1))</p>
              <p>Standard deviation quantifies how much values deviate from the average, making it one of the most important measures in statistics.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/standard-deviation-calculator" />
            <PopularCalculators exclude="/standard-deviation-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};

export default StandardDeviationCalculator;

