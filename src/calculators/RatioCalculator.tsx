"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const RatioCalculator = () => {
  const [mode, setMode] = useState<"simplify" | "equivalent" | "proportion">("simplify");
  const [a, setA] = useState("4");
  const [b, setB] = useState("6");
  const [c, setC] = useState("3");
  const [d, setD] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;

    if (mode === "simplify") {
      if (nb === 0) return;
      const g = gcd(Math.round(na), Math.round(nb));
      setResult({ type: "simplify", simplified: `${Math.round(na) / g}:${Math.round(nb) / g}`, original: `${na}:${nb}` });
    } else if (mode === "equivalent") {
      const nc = parseFloat(c) || 1;
      if (nb === 0) return;
      const factor = nc / na;
      setResult({ type: "equivalent", original: `${na}:${nb}`, multiplier: nc, equivalent: `${nc}:${(nb * factor).toFixed(2)}` });
    } else {
      const nc = parseFloat(c) || 0;
      if (nb === 0 || na === 0) return;
      const missing = (nb * nc) / na;
      setResult({ type: "proportion", equation: `${na}/${nb} = ${nc}/${missing.toFixed(4)}`, missing: missing.toFixed(4) });
    }
  };

  const reset = () => {
    setShowResults(false); setA("4"); setB("6"); setC("3"); setD(""); setResult(null); };

  const faqs = [
    { question: "How do I simplify a ratio?", answer: "Divide both parts of the ratio by their greatest common divisor (GCD)." },
    { question: "What is a proportion?", answer: "A proportion states that two ratios are equal, e.g. a/b = c/d. You can cross-multiply to find a missing value." },
    { question: "How do I find an equivalent ratio?", answer: "Multiply or divide both parts of the ratio by the same number." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Ratio Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Ratio Calculator</h1>
            <p className="text-muted-foreground mb-8">Simplify ratios, find equivalents, and solve proportions.</p>

            <div className="card-calculator mb-8">
              <div className="flex gap-2 mb-6">
                {(["simplify", "equivalent", "proportion"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "simplify" ? "Simplify" : m === "equivalent" ? "Equivalent" : "Proportion"}
                  </button>
                ))}
              </div>

              {mode === "simplify" && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <InputField id="a" label="First Value" value={a} onChange={setA} />
                  <InputField id="b" label="Second Value" value={b} onChange={setB} />
                </div>
              )}

              {mode === "equivalent" && (
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField id="a" label="A" value={a} onChange={setA} />
                    <InputField id="b" label="B" value={b} onChange={setB} />
                  </div>
                  <InputField id="c" label="Scale A to" value={c} onChange={setC} />
                </div>
              )}

              {mode === "proportion" && (
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-muted-foreground">Solve: A / B = C / ?</p>
                  <div className="grid grid-cols-3 gap-4">
                    <InputField id="a" label="A" value={a} onChange={setA} />
                    <InputField id="b" label="B" value={b} onChange={setB} />
                    <InputField id="c" label="C" value={c} onChange={setC} />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                {result.type === "simplify" && (
                  <ResultDisplay items={[
                    { label: "Original Ratio", value: 0, textValue: result.original },
                    { label: "Simplified Ratio", value: 0, textValue: result.simplified, highlight: true },
                  ]} />
                )}
                {result.type === "equivalent" && (
                  <ResultDisplay items={[
                    { label: "Original Ratio", value: 0, textValue: result.original },
                    { label: "Equivalent Ratio", value: 0, textValue: result.equivalent, highlight: true },
                  ]} />
                )}
                {result.type === "proportion" && (
                  <ResultDisplay items={[
                    { label: "Missing Value", value: 0, textValue: result.missing, highlight: true },
                    { label: "Equation", value: 0, textValue: result.equation },
                  ]} />
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>How to Use the Ratio Calculator</h2>
              <p>A ratio compares two quantities. Use "Simplify" to reduce a ratio to its lowest terms, "Equivalent" to scale a ratio, or "Proportion" to find a missing value using cross-multiplication.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ratio-calculator" />
            <PopularCalculators exclude="/ratio-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default RatioCalculator;


