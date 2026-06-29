"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const SlopeCalculator = () => {
  const [x1, setX1] = useState("1");
  const [y1, setY1] = useState("2");
  const [x2, setX2] = useState("4");
  const [y2, setY2] = useState("8");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const nx1 = parseFloat(x1) || 0, ny1 = parseFloat(y1) || 0;
    const nx2 = parseFloat(x2) || 0, ny2 = parseFloat(y2) || 0;
    const dx = nx2 - nx1, dy = ny2 - ny1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midX = (nx1 + nx2) / 2, midY = (ny1 + ny2) / 2;

    if (dx === 0) {
      setResult({ slope: "Undefined (vertical line)", angle: 90, distance, midX, midY, equation: `x = ${nx1}`, perpSlope: "0", yIntercept: "N/A" });
    } else {
      const slope = dy / dx;
      const angle = Math.atan(slope) * (180 / Math.PI);
      const yIntercept = ny1 - slope * nx1;
      const perpSlope = slope === 0 ? "Undefined" : (-1 / slope).toFixed(6);
      const eq = yIntercept >= 0 ? `y = ${slope.toFixed(4)}x + ${yIntercept.toFixed(4)}` : `y = ${slope.toFixed(4)}x - ${Math.abs(yIntercept).toFixed(4)}`;
      setResult({ slope: slope.toFixed(6), angle: angle.toFixed(4), distance, midX, midY, equation: eq, perpSlope, yIntercept: yIntercept.toFixed(4) });
    }
  };

  const reset = () => {
    setShowResults(false); setX1("1"); setY1("2"); setX2("4"); setY2("8"); setResult(null); };

  const faqs = [
    { question: "What is slope?", answer: "Slope measures the steepness of a line. It's calculated as rise over run: m = (y₂ - y₁) / (x₂ - x₁)." },
    { question: "What is the slope-intercept form?", answer: "y = mx + b, where m is the slope and b is the y-intercept (where the line crosses the y-axis)." },
    { question: "What is a perpendicular slope?", answer: "The perpendicular slope is the negative reciprocal of the original slope: m_perp = -1/m." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Slope Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Slope Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <p className="text-sm font-medium text-foreground mb-3">Point 1 (x₁, y₁)</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField id="x1" label="x₁" value={x1} onChange={setX1} />
                <InputField id="y1" label="y₁" value={y1} onChange={setY1} />
              </div>
              <p className="text-sm font-medium text-foreground mb-3">Point 2 (x₂, y₂)</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="x2" label="x₂" value={x2} onChange={setX2} />
                <InputField id="y2" label="y₂" value={y2} onChange={setY2} />
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
                  { label: "Slope (m)", value: 0, textValue: String(result.slope), highlight: true },
                  { label: "Angle (°)", value: 0, textValue: String(result.angle) },
                  { label: "Distance", value: 0, textValue: result.distance.toFixed(6) },
                  { label: "Midpoint", value: 0, textValue: `(${result.midX.toFixed(2)}, ${result.midY.toFixed(2)})` },
                  { label: "Line Equation", value: 0, textValue: result.equation },
                  { label: "Perpendicular Slope", value: 0, textValue: String(result.perpSlope) },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance text-[15.75px]">
              <h2>How to Calculate Slope</h2>
              <p>The slope of a line through two points (x₁, y₁) and (x₂, y₂) is m = (y₂ - y₁) / (x₂ - x₁). This calculator also finds the distance (using the distance formula), the midpoint, the equation in slope-intercept form, and the perpendicular slope.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/slope-calculator" />
          <PopularCalculators exclude="/slope-calculator" />
        </div>
      </div>
    </>
  );
};

export default SlopeCalculator;


