"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const FractionCalculator = () => {
  const [n1, setN1] = useState("1");
  const [d1, setD1] = useState("2");
  const [n2, setN2] = useState("1");
  const [d2, setD2] = useState("3");
  const [showResults, setShowResults] = useState(false);
  const [op, setOp] = useState<"+" | "-" | "×" | "÷">("+");
  const [result, setResult] = useState<{ num: number; den: number; decimal: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseInt(n1) || 0, b = parseInt(d1) || 1, c = parseInt(n2) || 0, d = parseInt(d2) || 1;
    if (b === 0 || d === 0) return;
    let rn: number, rd: number;
    if (op === "+") { rn = a * d + c * b; rd = b * d; }
    else if (op === "-") { rn = a * d - c * b; rd = b * d; }
    else if (op === "×") { rn = a * c; rd = b * d; }
    else { if (c === 0) return; rn = a * d; rd = b * c; }
    const g = gcd(rn, rd);
    rn /= g; rd /= g;
    if (rd < 0) { rn = -rn; rd = -rd; }
    setResult({ num: rn, den: rd, decimal: rn / rd });
  };

  const reset = () => {
    setShowResults(false); setN1("1"); setD1("2"); setN2("1"); setD2("3"); setResult(null); };

  const faqs = [
    { question: "How do I add fractions?", answer: "Find a common denominator, convert both fractions, add the numerators, then simplify." },
    { question: "How do I simplify a fraction?", answer: "Divide both the numerator and denominator by their greatest common divisor (GCD)." },
    { question: "How do I divide fractions?", answer: "Multiply the first fraction by the reciprocal (flip) of the second fraction." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fraction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fraction Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <p className="text-sm font-medium text-foreground mb-3">Fraction 1</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField id="n1" label="Numerator" value={n1} onChange={setN1} />
                <InputField id="d1" label="Denominator" value={d1} onChange={setD1} />
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {(["+", "-", "×", "÷"] as const).map(o => (
                  <button key={o} onClick={() => setOp(o)} className={`w-12 h-12 rounded-lg text-lg font-bold transition-colors ${op === o ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{o}</button>
                ))}
              </div>

              <p className="text-sm font-medium text-foreground mb-3">Fraction 2</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="n2" label="Numerator" value={n2} onChange={setN2} />
                <InputField id="d2" label="Denominator" value={d2} onChange={setD2} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Result</h2>
                <div className="text-center mb-4">
                  <p className="text-4xl font-extrabold">{result.num}<span className="mx-2 text-muted-foreground">/</span>{result.den}</p>
                  {result.den === 1 && <p className="text-muted-foreground mt-1">= {result.num}</p>}
                </div>
                <ResultDisplay items={[
                  { label: "Simplified Fraction", value: 0, textValue: `${result.num}/${result.den}` },
                  { label: "Decimal", value: 0, textValue: result.decimal.toFixed(6) },
                  { label: "Mixed Number", value: 0, textValue: Math.abs(result.num) >= result.den && result.den !== 1 ? `${Math.trunc(result.num / result.den)} ${Math.abs(result.num % result.den)}/${result.den}` : `${result.num}/${result.den}` },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">How to Work with Fractions</h2>
              <p>A fraction consists of a numerator (top) and denominator (bottom). To add or subtract fractions, first find a common denominator. To multiply, multiply numerators and denominators. To divide, multiply by the reciprocal.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fraction-calculator" />
          <PopularCalculators exclude="/fraction-calculator" />
        </div>
      </div>
    </>
  );
};

export default FractionCalculator;


