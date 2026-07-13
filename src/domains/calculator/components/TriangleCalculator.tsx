"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
import { RotateCcw } from "lucide-react";

const TriangleCalculator = () => {
  const [sideA, setSideA] = useState(""); const [sideB, setSideB] = useState(""); const [sideC, setSideC] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ area: number; perimeter: number; type: string; angleA: number; angleB: number; angleC: number } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const a = parseFloat(sideA) || 0, b = parseFloat(sideB) || 0, c = parseFloat(sideC) || 0;
    if (a <= 0 || b <= 0 || c <= 0) return;
    if (a + b <= c || a + c <= b || b + c <= a) return; // invalid triangle

    const s = (a + b + c) / 2;
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    const perimeter = a + b + c;

    const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * (180 / Math.PI);
    const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * (180 / Math.PI);
    const angleC = 180 - angleA - angleB;

    let type = "Scalene";
    if (a === b && b === c) type = "Equilateral";
    else if (a === b || b === c || a === c) type = "Isosceles";
    if (Math.abs(angleA - 90) < 0.01 || Math.abs(angleB - 90) < 0.01 || Math.abs(angleC - 90) < 0.01) type += " Right";

    setResult({ area, perimeter, type, angleA, angleB, angleC });
  };

  const reset = () => {
    setShowResults(false); setSideA(""); setSideB(""); setSideC(""); setResult(null); };

  const faqs = [
    { question: "What is Heron's formula?", answer: "Heron's formula calculates area from three sides: A = √(s(s-a)(s-b)(s-c)) where s = (a+b+c)/2." },
    { question: "How do I know if three sides form a valid triangle?", answer: "The sum of any two sides must be greater than the third side (triangle inequality theorem)." },
    { question: "What are the types of triangles?", answer: "By sides: equilateral (all equal), isosceles (two equal), scalene (none equal). By angles: acute, right, obtuse." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Triangle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Triangle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid sm:grid-cols-3 gap-5 mb-6">
                <InputField id="sideA" label="Side a" value={sideA} onChange={setSideA} />
                <InputField id="sideB" label="Side b" value={sideB} onChange={setSideB} />
                <InputField id="sideC" label="Side c" value={sideC} onChange={setSideC} />
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
                  { label: "Area", value: 0, textValue: result.area.toFixed(4) + " sq units" },
                  { label: "Perimeter", value: 0, textValue: result.perimeter.toFixed(4) + " units" },
                  { label: "Type", value: 0, textValue: result.type },
                  { label: "Angle A", value: 0, textValue: result.angleA.toFixed(2) + "°" },
                  { label: "Angle B", value: 0, textValue: result.angleB.toFixed(2) + "°" },
                  { label: "Angle C", value: 0, textValue: result.angleC.toFixed(2) + "°" },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
              <h2 className="text-2xl font-bold mb-3">Triangle Formulas</h2>
              <p><strong>Heron's Formula:</strong> A = √(s(s−a)(s−b)(s−c)) where s = (a+b+c)/2</p>
              <p><strong>Law of Cosines:</strong> c² = a² + b² − 2ab·cos(C) — used to find angles from three sides.</p>
            </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/triangle-calculator" />
          <PopularCalculators exclude="/triangle-calculator" />
        </div>
      </div>
    </>
  );
};

export default TriangleCalculator;


