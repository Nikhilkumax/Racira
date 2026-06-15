"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

const DistanceCalculator = () => {
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [x1, setX1] = useState("1");
  const [y1, setY1] = useState("2");
  const [z1, setZ1] = useState("0");
  const [x2, setX2] = useState("4");
  const [y2, setY2] = useState("6");
  const [z2, setZ2] = useState("3");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const nx1 = parseFloat(x1) || 0, ny1 = parseFloat(y1) || 0;
    const nx2 = parseFloat(x2) || 0, ny2 = parseFloat(y2) || 0;

    if (mode === "2d") {
      const dx = nx2 - nx1, dy = ny2 - ny1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mx = (nx1 + nx2) / 2, my = (ny1 + ny2) / 2;
      setResult({ dist, midpoint: `(${mx.toFixed(2)}, ${my.toFixed(2)})`, manhattan: Math.abs(dx) + Math.abs(dy) });
    } else {
      const nz1 = parseFloat(z1) || 0, nz2 = parseFloat(z2) || 0;
      const dx = nx2 - nx1, dy = ny2 - ny1, dz = nz2 - nz1;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const mx = (nx1 + nx2) / 2, my = (ny1 + ny2) / 2, mz = (nz1 + nz2) / 2;
      setResult({ dist, midpoint: `(${mx.toFixed(2)}, ${my.toFixed(2)}, ${mz.toFixed(2)})`, manhattan: Math.abs(dx) + Math.abs(dy) + Math.abs(dz) });
    }
  };

  const reset = () => {
    setShowResults(false); setX1("1"); setY1("2"); setZ1("0"); setX2("4"); setY2("6"); setZ2("3"); setResult(null); };

  const faqs = [
    { question: "What is the distance formula?", answer: "In 2D: d = √((x₂−x₁)² + (y₂−y₁)²). In 3D: d = √((x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²)." },
    { question: "What is Manhattan distance?", answer: "Manhattan distance is the sum of absolute differences: |x₂−x₁| + |y₂−y₁|. It measures distance along grid lines." },
    { question: "What is the midpoint?", answer: "The midpoint is the point exactly halfway between two points: ((x₁+x₂)/2, (y₁+y₂)/2)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Distance Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Distance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex gap-2 mb-6">
                {(["2d", "3d"] as const).map(m => (
                  <button key={m} onClick={() => { setMode(m); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-4 mb-6">
                <p className="text-sm text-muted-foreground">Point 1</p>
                <div className={`grid ${mode === "3d" ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <InputField id="x1" label="x₁" value={x1} onChange={setX1} />
                  <InputField id="y1" label="y₁" value={y1} onChange={setY1} />
                  {mode === "3d" && <InputField id="z1" label="z₁" value={z1} onChange={setZ1} />}
                </div>
                <p className="text-sm text-muted-foreground">Point 2</p>
                <div className={`grid ${mode === "3d" ? "grid-cols-3" : "grid-cols-2"} gap-4`}>
                  <InputField id="x2" label="x₂" value={x2} onChange={setX2} />
                  <InputField id="y2" label="y₂" value={y2} onChange={setY2} />
                  {mode === "3d" && <InputField id="z2" label="z₂" value={z2} onChange={setZ2} />}
                </div>
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
                  { label: "Euclidean Distance", value: 0, textValue: result.dist.toFixed(6), highlight: true },
                  { label: "Manhattan Distance", value: 0, textValue: result.manhattan.toFixed(4) },
                  { label: "Midpoint", value: 0, textValue: result.midpoint },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <article className="prose-finance">
              <h2>Distance Between Two Points</h2>
              <p>The Euclidean distance formula is derived from the Pythagorean theorem. This calculator also computes the Manhattan distance (city-block distance) and the midpoint between the two points.</p>
            </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/distance-calculator" />
          <PopularCalculators exclude="/distance-calculator" />
        </div>
      </div>
    </>
  );
};

export default DistanceCalculator;


