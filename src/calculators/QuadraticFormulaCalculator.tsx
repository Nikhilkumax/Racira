"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const QuadraticFormulaCalculator = () => {
  const [a, setA] = useState("1");
  const [b, setB] = useState("-5");
  const [c, setC] = useState("6");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    const nc = parseFloat(c) || 0;
    if (na === 0) return;
    const discriminant = nb * nb - 4 * na * nc;
    const vertex = { x: -nb / (2 * na), y: nc - (nb * nb) / (4 * na) };

    if (discriminant > 0) {
      const x1 = (-nb + Math.sqrt(discriminant)) / (2 * na);
      const x2 = (-nb - Math.sqrt(discriminant)) / (2 * na);
      setResult({ discriminant, roots: "two real", x1: x1.toFixed(6), x2: x2.toFixed(6), vertex });
    } else if (discriminant === 0) {
      const x1 = -nb / (2 * na);
      setResult({ discriminant, roots: "one real (repeated)", x1: x1.toFixed(6), x2: x1.toFixed(6), vertex });
    } else {
      const real = (-nb / (2 * na)).toFixed(6);
      const imag = (Math.sqrt(-discriminant) / (2 * na)).toFixed(6);
      setResult({ discriminant, roots: "two complex", x1: `${real} + ${imag}i`, x2: `${real} - ${imag}i`, vertex });
    }
  };

  const reset = () => {
    setShowResults(false); setA("1"); setB("-5"); setC("6"); setResult(null); };

  const faqs = [
    { question: "What is the quadratic formula?", answer: "x = (-b ± √(b²-4ac)) / 2a. It solves any quadratic equation ax² + bx + c = 0." },
    { question: "What does the discriminant tell us?", answer: "If b²-4ac > 0, there are two real roots. If = 0, one repeated root. If < 0, two complex roots." },
    { question: "What is the vertex of a parabola?", answer: "The vertex is at x = -b/(2a), y = c - b²/(4a). It's the minimum or maximum point of the parabola." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Quadratic Formula Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Quadratic Formula Calculator</h1>
            <p className="text-muted-foreground mb-8">Solve ax² + bx + c = 0 and find roots, discriminant, and vertex.</p>

            <div className="card-calculator mb-8">
              <p className="text-sm font-medium text-foreground mb-4">Enter coefficients for ax² + bx + c = 0</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <InputField id="a" label="a (x² coefficient)" value={a} onChange={setA} />
                <InputField id="b" label="b (x coefficient)" value={b} onChange={setB} />
                <InputField id="c" label="c (constant)" value={c} onChange={setC} />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Solve</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Solution</h2>
                <ResultDisplay items={[
                  { label: "Root Type", value: 0, textValue: result.roots },
                  { label: "x₁", value: 0, textValue: String(result.x1), highlight: true },
                  { label: "x₂", value: 0, textValue: String(result.x2), highlight: true },
                  { label: "Discriminant (b²-4ac)", value: 0, textValue: result.discriminant.toFixed(4) },
                  { label: "Vertex X", value: 0, textValue: result.vertex.x.toFixed(4) },
                  { label: "Vertex Y", value: 0, textValue: result.vertex.y.toFixed(4) },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>Understanding the Quadratic Formula</h2>
              <p>The quadratic formula x = (-b ± √(b²-4ac)) / 2a solves any equation of the form ax² + bx + c = 0. The discriminant (b²-4ac) determines the nature of the roots: positive yields two distinct real roots, zero yields one repeated root, and negative yields two complex conjugate roots.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/quadratic-formula-calculator" />
            <PopularCalculators exclude="/quadratic-formula-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default QuadraticFormulaCalculator;


