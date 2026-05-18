"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const ExponentCalculator = () => {
  const [mode, setMode] = useState<"power" | "root" | "scientific">("power");
  const [base, setBase] = useState("2");
  const [exp, setExp] = useState("10");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const b = parseFloat(base) || 0;
    const e = parseFloat(exp) || 0;

    if (mode === "power") {
      const res = Math.pow(b, e);
      setResult({ type: "power", base: b, exponent: e, result: res });
    } else if (mode === "root") {
      if (e === 0) return;
      const res = Math.pow(b, 1 / e);
      setResult({ type: "root", radicand: b, index: e, result: res });
    } else {
      // scientific notation
      const sci = b.toExponential();
      const [mantissa, exponent] = sci.split("e");
      setResult({ type: "scientific", original: b, mantissa, exponent: parseInt(exponent), scientific: sci });
    }
  };

  const reset = () => {
    setShowResults(false); setBase("2"); setExp("10"); setResult(null); };

  const faqs = [
    { question: "What is an exponent?", answer: "An exponent indicates how many times a number (the base) is multiplied by itself. For example, 2³ = 2 × 2 × 2 = 8." },
    { question: "What is a negative exponent?", answer: "A negative exponent means the reciprocal of the base raised to the positive exponent. 2⁻³ = 1/2³ = 1/8." },
    { question: "What is a fractional exponent?", answer: "A fractional exponent represents a root. x^(1/n) = ⁿ√x. For example, 8^(1/3) = ∛8 = 2." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Exponent Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Exponent Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate powers, roots, and scientific notation.</p>

            <div className="card-calculator mb-8">
              <div className="flex gap-2 mb-6">
                {(["power", "root", "scientific"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "power" ? "Power (xⁿ)" : m === "root" ? "Root (ⁿ√x)" : "Scientific"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="base" label={mode === "root" ? "Radicand" : mode === "scientific" ? "Number" : "Base"} value={base} onChange={setBase} />
                {mode !== "scientific" && (
                  <InputField id="exp" label={mode === "root" ? "Root Index (n)" : "Exponent"} value={exp} onChange={setExp} />
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                {result.type === "power" && (
                  <ResultDisplay items={[
                    { label: `${result.base}^${result.exponent}`, value: 0, textValue: result.result.toLocaleString(undefined, { maximumFractionDigits: 10 }), highlight: true },
                    { label: "Expression", value: 0, textValue: `${result.base} ^ ${result.exponent}` },
                  ]} />
                )}
                {result.type === "root" && (
                  <ResultDisplay items={[
                    { label: `${result.index}√${result.radicand}`, value: 0, textValue: result.result.toFixed(8), highlight: true },
                    { label: "Expression", value: 0, textValue: `${result.radicand} ^ (1/${result.index})` },
                  ]} />
                )}
                {result.type === "scientific" && (
                  <ResultDisplay items={[
                    { label: "Scientific Notation", value: 0, textValue: result.scientific, highlight: true },
                    { label: "Mantissa", value: 0, textValue: result.mantissa },
                    { label: "Exponent", value: 0, textValue: String(result.exponent) },
                  ]} />
                )}
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>How Exponents Work</h2>
              <p>Exponentiation is repeated multiplication. The base is the number being multiplied, and the exponent tells how many times. This calculator also handles roots (fractional exponents) and scientific notation for very large or small numbers.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponent-calculator" />
            <PopularCalculators exclude="/exponent-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default ExponentCalculator;


