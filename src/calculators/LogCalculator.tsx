"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const LogCalculator = () => {
  const [mode, setMode] = useState<"log" | "antilog">("log");
  const [value, setValue] = useState("100");
  const [base, setBase] = useState("10");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const v = parseFloat(value) || 0;
    const b = parseFloat(base) || 10;

    if (mode === "log") {
      if (v <= 0 || b <= 0 || b === 1) return;
      const log10 = Math.log10(v);
      const ln = Math.log(v);
      const log2 = Math.log2(v);
      const logBase = Math.log(v) / Math.log(b);
      setResult({ log10: log10.toFixed(8), ln: ln.toFixed(8), log2: log2.toFixed(8), logBase: logBase.toFixed(8), base: b });
    } else {
      // antilog: b^v
      const res = Math.pow(b, v);
      setResult({ antilog: res, base: b, exponent: v });
    }
  };

  const reset = () => {
    setShowResults(false); setValue("100"); setBase("10"); setResult(null); };

  const faqs = [
    { question: "What is a logarithm?", answer: "A logarithm answers: to what exponent must the base be raised to get a number? log_b(x) = y means b^y = x." },
    { question: "What is the difference between log and ln?", answer: "log (common log) uses base 10, while ln (natural log) uses base e ≈ 2.71828." },
    { question: "What is an antilog?", answer: "The antilog is the inverse of a logarithm. antilog_b(y) = b^y." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Log Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Log Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate logarithms with any base — natural, common, and custom.</p>

            <div className="card-calculator mb-8">
              <div className="flex gap-2 mb-6">
                {(["log", "antilog"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "log" ? "Logarithm" : "Antilog"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="value" label={mode === "log" ? "Number" : "Exponent"} value={value} onChange={setValue} />
                <InputField id="base" label="Base" value={base} onChange={setBase} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                {mode === "log" ? (
                  <ResultDisplay items={[
                    { label: `log₁₀(${value})`, value: 0, textValue: result.log10 },
                    { label: `ln(${value})`, value: 0, textValue: result.ln },
                    { label: `log₂(${value})`, value: 0, textValue: result.log2 },
                    { label: `log_${result.base}(${value})`, value: 0, textValue: result.logBase, highlight: true },
                  ]} />
                ) : (
                  <ResultDisplay items={[
                    { label: `${result.base}^${result.exponent}`, value: 0, textValue: result.antilog.toFixed(8), highlight: true },
                  ]} />
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>Understanding Logarithms</h2>
              <p>A logarithm is the inverse of exponentiation. The common logarithm (log₁₀) is used in science and engineering, while the natural logarithm (ln, base e) is fundamental in calculus and exponential growth/decay models.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/log-calculator" />
            <PopularCalculators exclude="/log-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default LogCalculator;


