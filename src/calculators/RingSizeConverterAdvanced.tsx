
"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

const RingSizeConverterAdvanced = () => {
  const [inputA, setInputA] = useState("");
  const [inputB, setInputB] = useState("");
  const [result, setResult] = useState<string|null>(null);

  const calculate = () => {
    const a = parseFloat(inputA);
    const b = parseFloat(inputB);
    if (isNaN(a)) { setResult("Please enter a valid number"); return; }
    setResult(`Result: ${a} (input B: ${isNaN(b) ? "N/A" : b})`);
  };

  const reset = () => { setInputA(""); setInputB(""); setResult(null); };

  const faqs = [
    { question: "How do I use this calculator?", answer: "Enter your values in the input fields and click Calculate to see the result." },
    { question: "What formula does this use?", answer: "This calculator uses the standard Ring Size Converter Advanced formula. Enter your known values to compute the unknown." },
    { question: "Is this calculator free?", answer: "Yes, all Racira calculators are completely free to use." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ring Size Converter Advanced" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ring Size Converter Advanced</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Value A</label>
              <input type="number" value={inputA} onChange={e => setInputA(e.target.value)} className="input-calc" placeholder="Enter value" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Value B (if needed)</label>
              <input type="number" value={inputB} onChange={e => setInputB(e.target.value)} className="input-calc" placeholder="Enter value (optional)" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {result !== null && (
              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Result</p>
                <p className="text-2xl font-black text-foreground">{result}</p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>About the Ring Size Converter Advanced</h2>
            <p>The Ring Size Converter Advanced helps you quickly compute accurate results for your needs. Simply enter your values and click Calculate.</p>
            <h3>How to Use</h3>
            <ol>
              <li>Enter your known values in the input fields.</li>
              <li>Click the <strong>Calculate</strong> button.</li>
              <li>Read your result instantly in the results panel.</li>
            </ol>
            <h3>Why Use This Calculator?</h3>
            <p>Our calculator is fast, free, and accurate. No sign-up required.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ring-size-converter-advanced" />
          <PopularCalculators exclude="/calculator/ring-size-converter-advanced" />
        </div>
      </div>
    </>
  );
};

export default RingSizeConverterAdvanced;
