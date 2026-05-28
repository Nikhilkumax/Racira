"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const parseCoeffs = (s: string): number[] => s.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));

const fmtPoly = (c: number[]): string => {
  if (!c.length) return "0";
  return c.map((v, i) => {
    const deg = c.length - 1 - i;
    if (v === 0) return "";
    const sign = v > 0 && i > 0 ? " + " : v < 0 ? " − " : "";
    const av = Math.abs(v);
    const coeff = (av === 1 && deg > 0) ? "" : av.toString();
    const x = deg === 0 ? "" : deg === 1 ? "x" : `x^${deg}`;
    return `${sign}${coeff}${x}`;
  }).filter(Boolean).join("") || "0";
};

const addPoly = (a: number[], b: number[]): number[] => {
  const len = Math.max(a.length, b.length);
  const ra = [...Array(len - a.length).fill(0), ...a];
  const rb = [...Array(len - b.length).fill(0), ...b];
  return ra.map((v, i) => v + rb[i]);
};

const subPoly = (a: number[], b: number[]): number[] => addPoly(a, b.map(v => -v));

const mulPoly = (a: number[], b: number[]): number[] => {
  const result = Array(a.length + b.length - 1).fill(0);
  a.forEach((av, i) => b.forEach((bv, j) => { result[i + j] += av * bv; }));
  return result;
};

const evalPoly = (c: number[], x: number): number =>
  c.reduce((acc, v) => acc * x + v, 0);

const PolynomialCalculator = () => {
  const [mode, setMode] = useState<"add" | "subtract" | "multiply" | "evaluate">("add");
  const [polyA, setPolyA] = useState("1 -3 2");
  const [polyB, setPolyB] = useState("1 1");
  const [xVal, setXVal] = useState("2");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseCoeffs(polyA);
    if (!a.length) return;

    if (mode === "evaluate") {
      const x = parseFloat(xVal) || 0;
      setResult({ type: "eval", poly: fmtPoly(a), x, value: evalPoly(a, x) });
      return;
    }

    const b = parseCoeffs(polyB);
    if (!b.length) return;

    let res: number[];
    if (mode === "add") res = addPoly(a, b);
    else if (mode === "subtract") res = subPoly(a, b);
    else res = mulPoly(a, b);

    setResult({ type: "op", label: mode === "add" ? "A + B" : mode === "subtract" ? "A − B" : "A × B", a: fmtPoly(a), b: fmtPoly(b), result: fmtPoly(res) });
  };

  const reset = () => {
    setShowResults(false); setPolyA("1 -3 2"); setPolyB("1 1"); setXVal("2"); setResult(null); };

  const faqs = [
    { question: "How do I enter a polynomial?", answer: "Enter coefficients from highest degree to lowest, separated by spaces. For x² − 3x + 2, enter '1 -3 2'." },
    { question: "What is polynomial multiplication?", answer: "Multiply each term of one polynomial by every term of the other and combine like terms." },
    { question: "How is a polynomial evaluated?", answer: "Substitute the x value into the polynomial using Horner's method for efficiency." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Polynomial Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Polynomial Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Add, subtract, multiply polynomials and evaluate at a point.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-wrap gap-2 mb-6">
                {(["add", "subtract", "multiply", "evaluate"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "add" ? "Add" : m === "subtract" ? "Subtract" : m === "multiply" ? "Multiply" : "Evaluate"}
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Polynomial A (coefficients, highest degree first)</label>
                  <input value={polyA} onChange={e => setPolyA(e.target.value)} className="input-calc" placeholder="1 -3 2 (for x²-3x+2)" />
                </div>
                {mode !== "evaluate" ? (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Polynomial B</label>
                    <input value={polyB} onChange={e => setPolyB(e.target.value)} className="input-calc" placeholder="1 1 (for x+1)" />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">x value</label>
                    <input type="number" value={xVal} onChange={e => setXVal(e.target.value)} className="input-calc" />
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                {result.type === "eval" ? (
                  <ResultDisplay items={[
                    { label: "P(x)", value: 0, textValue: result.poly },
                    { label: `P(${result.x})`, value: 0, textValue: result.value.toString(), highlight: true },
                  ]} />
                ) : (
                  <ResultDisplay items={[
                    { label: "A", value: 0, textValue: result.a },
                    { label: "B", value: 0, textValue: result.b },
                    { label: result.label, value: 0, textValue: result.result, highlight: true },
                  ]} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Polynomial Operations</h2>
              <p>A polynomial is an expression of variables and coefficients using only addition, subtraction, multiplication, and non-negative integer exponents. This calculator lets you perform arithmetic on polynomials by entering coefficients from highest degree to lowest.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/polynomial-calculator" />
          <PopularCalculators exclude="/polynomial-calculator" />
        </div>
      </div>
    </>
  );
};

export default PolynomialCalculator;


