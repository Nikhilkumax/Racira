"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const PercentageCalculator = () => {
  const [mode, setMode] = useState<"of" | "change" | "isWhat">("of");
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [result, setResult] = useState<{ label: string; value: string } | null>(null);

  const calculate = () => {
    const a = parseFloat(val1) || 0;
    const b = parseFloat(val2) || 0;
    if (mode === "of") {
      setResult({ label: `${a}% of ${b}`, value: ((a / 100) * b).toFixed(4) });
    } else if (mode === "change") {
      if (a === 0) return;
      const change = ((b - a) / Math.abs(a)) * 100;
      setResult({ label: `% Change from ${a} to ${b}`, value: change.toFixed(4) + "%" });
    } else {
      if (b === 0) return;
      setResult({ label: `${a} is what % of ${b}`, value: ((a / b) * 100).toFixed(4) + "%" });
    }
  };

  const reset = () => { setVal1(""); setVal2(""); setResult(null); };

  const faqs = [
    { question: "How do I calculate a percentage of a number?", answer: "Divide the percentage by 100, then multiply by the number. For example, 25% of 200 = (25/100) × 200 = 50." },
    { question: "How do I find percentage change?", answer: "Subtract the old value from the new value, divide by the absolute value of the old value, then multiply by 100." },
    { question: "What is the difference between percentage and percentile?", answer: "A percentage is a fraction of 100, while a percentile indicates the rank of a value in a dataset — the percentage of values that fall below it." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Percentage Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Percentage Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate percentages, percentage change, and more.</p>

            <div className="card-calculator mb-8">
              <div className="flex gap-2 mb-6">
                <button onClick={() => { setMode("of"); reset(); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "of" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>% of Number</button>
                <button onClick={() => { setMode("change"); reset(); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "change" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>% Change</button>
                <button onClick={() => { setMode("isWhat"); reset(); }} className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${mode === "isWhat" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>X is % of Y</button>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="val1" label={mode === "of" ? "Percentage" : mode === "change" ? "Old Value" : "Value (X)"} value={val1} onChange={setVal1} suffix={mode === "of" ? "%" : ""} />
                <InputField id="val2" label={mode === "of" ? "Number" : mode === "change" ? "New Value" : "Total (Y)"} value={val2} onChange={setVal2} />
              </div>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[{ label: result.label, value: 0, textValue: result.value }]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />

            <article className="prose-finance">
              <h2>How to Calculate Percentages</h2>
              <p>A percentage represents a fraction of 100. To find X% of Y, multiply Y by X/100. To find what percentage X is of Y, divide X by Y and multiply by 100.</p>
              <h2>Percentage Change Formula</h2>
              <p>Percentage Change = ((New Value − Old Value) / |Old Value|) × 100. A positive result means an increase; negative means a decrease.</p>
            </article>

            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-calculator" />
            <PopularCalculators exclude="/percentage-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default PercentageCalculator;

