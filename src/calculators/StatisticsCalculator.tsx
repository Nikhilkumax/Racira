"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const StatisticsCalculator = () => {
  const [data, setData] = useState("10, 20, 30, 40, 50");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{
    count: number; sum: number; mean: number; median: number; mode: string;
    range: number; variance: number; stdDev: number; min: number; max: number;
  } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const nums = data.split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
    if (nums.length === 0) return;
    const sorted = [...nums].sort((a, b) => a - b);
    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;
    const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)];

    // Mode
    const freq: Record<number, number> = {};
    nums.forEach(n => { freq[n] = (freq[n] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, f]) => f === maxFreq && f > 1).map(([n]) => n);
    const mode = modes.length > 0 ? modes.join(", ") : "No mode";

    const variance = nums.reduce((acc, n) => acc + (n - mean) ** 2, 0) / count;
    const stdDev = Math.sqrt(variance);

    setResult({ count, sum, mean, median, mode, range: sorted[count - 1] - sorted[0], variance, stdDev, min: sorted[0], max: sorted[count - 1] });
  };

  const reset = () => {
    setShowResults(false); setData("10, 20, 30, 40, 50"); setResult(null); };

  const faqs = [
    { question: "What's the difference between population and sample standard deviation?", answer: "Population std dev divides by N; sample std dev divides by N-1 (Bessel's correction). This calculator uses population variance." },
    { question: "What is the median?", answer: "The middle value when data is sorted. For even-count datasets, it's the average of the two middle values." },
    { question: "What is mode?", answer: "The most frequently occurring value(s). A dataset can have no mode, one mode, or multiple modes." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Statistics Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Statistics Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="mb-6">
                <label htmlFor="data" className="text-sm font-medium text-foreground mb-1.5 block">Data Set</label>
                <textarea id="data" value={data} onChange={(e) => setData(e.target.value)} rows={3} className="input-calc w-full resize-none" placeholder="Enter numbers separated by commas or spaces" />
                <p className="text-xs text-muted-foreground mt-1">Separate values with commas or spaces</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Result</h2>
                <ResultDisplay items={[
                  { label: "Count", value: 0, textValue: result.count.toString() },
                  { label: "Sum", value: 0, textValue: result.sum.toFixed(4) },
                  { label: "Mean", value: 0, textValue: result.mean.toFixed(4) },
                  { label: "Median", value: 0, textValue: result.median.toFixed(4) },
                  { label: "Mode", value: 0, textValue: result.mode },
                  { label: "Range", value: 0, textValue: result.range.toFixed(4) },
                  { label: "Variance (σ²)", value: 0, textValue: result.variance.toFixed(4) },
                  { label: "Std Deviation (σ)", value: 0, textValue: result.stdDev.toFixed(4) },
                  { label: "Min", value: 0, textValue: result.min.toFixed(4) },
                  { label: "Max", value: 0, textValue: result.max.toFixed(4) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Descriptive Statistics</h2>
              <p><strong>Mean:</strong> Sum of all values ÷ count. <strong>Median:</strong> Middle value when sorted. <strong>Mode:</strong> Most frequent value. <strong>Standard Deviation:</strong> Measures how spread out data is from the mean.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/statistics-calculator" />
          <PopularCalculators exclude="/statistics-calculator" />
        </div>
      </div>
    </>
  );
};

export default StatisticsCalculator;


