"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const CircleCalculator = () => {
  const [input, setInput] = useState<"radius" | "diameter" | "area" | "circumference">("radius");
  const [val, setVal] = useState("");
  const [result, setResult] = useState<{ radius: number; diameter: number; area: number; circumference: number; arcLength: number } | null>(null);
  const [angle, setAngle] = useState("360");
  const [showResults, setShowResults] = useState(false);

  const handleCalculate = () => {
    setShowResults(true);
    const v = parseFloat(val) || 0;
    if (v <= 0) return;
    let r: number;
    if (input === "radius") r = v;
    else if (input === "diameter") r = v / 2;
    else if (input === "area") r = Math.sqrt(v / Math.PI);
    else r = v / (2 * Math.PI);

    const deg = parseFloat(angle) || 360;
    setResult({
      radius: r,
      diameter: r * 2,
      area: Math.PI * r * r,
      circumference: 2 * Math.PI * r,
      arcLength: (deg / 360) * 2 * Math.PI * r,
    });
  };

  const reset = () => {
    setShowResults(false); setVal(""); setAngle("360"); setResult(null); };

  const faqs = [
    { question: "What is the formula for the area of a circle?", answer: "A = πr², where r is the radius." },
    { question: "What is arc length?", answer: "Arc length is a portion of the circumference. L = (θ/360) × 2πr, where θ is the central angle in degrees." },
    { question: "What is pi (π)?", answer: "Pi is the ratio of circumference to diameter, approximately 3.14159. It's an irrational number that never terminates or repeats." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Circle Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Circle Calculator</h1>
        <p className="text-muted-foreground mb-6 text-lg">Calculate all circle properties from any single measurement.</p>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex flex-wrap gap-2 mb-6">
                {(["radius", "diameter", "area", "circumference"] as const).map(i => (
                  <button key={i} onClick={() => { setInput(i); reset(); }} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${input === i ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{i}</button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                <InputField id="val" label={input.charAt(0).toUpperCase() + input.slice(1)} value={val} onChange={setVal} />
                <InputField id="angle" label="Arc Angle (optional)" value={angle} onChange={setAngle} suffix="°" tooltip="Enter angle in degrees for arc length calculation" />
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
          </div>

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[
                  { label: "Radius", value: 0, textValue: result.radius.toFixed(4) },
                  { label: "Diameter", value: 0, textValue: result.diameter.toFixed(4) },
                  { label: "Area", value: 0, textValue: result.area.toFixed(4) + " sq units" },
                  { label: "Circumference", value: 0, textValue: result.circumference.toFixed(4) },
                  { label: "Arc Length", value: 0, textValue: result.arcLength.toFixed(4) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance"><h2>Circle Formulas</h2><p><strong>Area:</strong> A = πr² | <strong>Circumference:</strong> C = 2πr | <strong>Diameter:</strong> d = 2r | <strong>Arc Length:</strong> L = (θ/360) × 2πr</p></article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/circle-calculator" />
          <PopularCalculators exclude="/circle-calculator" />
        </div>
      </div>
    </>
  );
};

export default CircleCalculator;


