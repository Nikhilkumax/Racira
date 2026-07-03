"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const PythagoreanTheoremCalculator = () => {
  const [mode, setMode] = useState<"hypotenuse" | "leg">("hypotenuse");
  const [a, setA] = useState("3");
  const [b, setB] = useState("4");
  const [c, setC] = useState("5");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    if (mode === "hypotenuse") {
      const na = parseFloat(a) || 0, nb = parseFloat(b) || 0;
      if (na <= 0 || nb <= 0) return;
      const hyp = Math.sqrt(na * na + nb * nb);
      const area = (na * nb) / 2;
      const perimeter = na + nb + hyp;
      const angleA = Math.atan(na / nb) * (180 / Math.PI);
      const angleB = 90 - angleA;
      setResult({ a: na, b: nb, c: hyp, area, perimeter, angleA, angleB });
    } else {
      const known = parseFloat(a) || 0;
      const nc = parseFloat(c) || 0;
      if (known <= 0 || nc <= 0 || nc <= known) return;
      const missing = Math.sqrt(nc * nc - known * known);
      const area = (known * missing) / 2;
      const perimeter = known + missing + nc;
      const angleA = Math.atan(known / missing) * (180 / Math.PI);
      const angleB = 90 - angleA;
      setResult({ a: known, b: missing, c: nc, area, perimeter, angleA, angleB });
    }
  };

  const reset = () => {
    setShowResults(false); setA("3"); setB("4"); setC("5"); setResult(null); };

  const faqs = [
    { question: "What is the Pythagorean theorem?", answer: "a² + b² = c², where c is the hypotenuse (longest side) of a right triangle and a, b are the other two sides." },
    { question: "How do I find the hypotenuse?", answer: "c = √(a² + b²). Square both legs, add them, then take the square root." },
    { question: "What are Pythagorean triples?", answer: "Integer sets that satisfy a² + b² = c², such as (3,4,5), (5,12,13), (8,15,17), and (7,24,25)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Pythagorean Theorem Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pythagorean Theorem Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex gap-2 mb-6">
                {(["hypotenuse", "leg"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m === "hypotenuse" ? "Find Hypotenuse" : "Find Leg"}
                  </button>
                ))}
              </div>

              {mode === "hypotenuse" ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <InputField id="a" label="Side a" value={a} onChange={setA} />
                  <InputField id="b" label="Side b" value={b} onChange={setB} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <InputField id="a" label="Known Leg" value={a} onChange={setA} />
                  <InputField id="c" label="Hypotenuse (c)" value={c} onChange={setC} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Result</h2>
                <ResultDisplay items={[
                  { label: "Side a", value: 0, textValue: result.a.toFixed(4) },
                  { label: "Side b", value: 0, textValue: result.b.toFixed(4) },
                  { label: "Hypotenuse (c)", value: 0, textValue: result.c.toFixed(4), highlight: true },
                  { label: "Area", value: 0, textValue: result.area.toFixed(4) },
                  { label: "Perimeter", value: 0, textValue: result.perimeter.toFixed(4) },
                  { label: "Angle A (°)", value: 0, textValue: result.angleA.toFixed(2) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>Understanding the Pythagorean Theorem</h2>
              <p>The Pythagorean theorem states that in a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides: a² + b² = c². This calculator also computes the area, perimeter, and interior angles of the right triangle.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pythagorean-theorem-calculator" />
          <PopularCalculators exclude="/pythagorean-theorem-calculator" />
        </div>
      </div>
    </>
  );
};

export default PythagoreanTheoremCalculator;


