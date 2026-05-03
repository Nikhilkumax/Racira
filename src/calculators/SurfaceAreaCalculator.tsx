"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Shape = "cube" | "sphere" | "cylinder" | "cone" | "box";

const SurfaceAreaCalculator = () => {
  const [shape, setShape] = useState<Shape>("cube");
  const [a, setA] = useState("5");
  const [b, setB] = useState("3");
  const [c, setC] = useState("4");
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const na = parseFloat(a) || 0, nb = parseFloat(b) || 0, nc = parseFloat(c) || 0;
    if (na <= 0) return;
    let sa = 0, lateral = 0, formula = "";

    switch (shape) {
      case "cube":
        sa = 6 * na * na;
        lateral = 4 * na * na;
        formula = `6 × ${na}² = ${sa.toFixed(4)}`;
        break;
      case "sphere":
        sa = 4 * Math.PI * na * na;
        lateral = sa;
        formula = `4π × ${na}² = ${sa.toFixed(4)}`;
        break;
      case "cylinder":
        if (nb <= 0) return;
        lateral = 2 * Math.PI * na * nb;
        sa = lateral + 2 * Math.PI * na * na;
        formula = `2πr(r+h) = 2π×${na}×(${na}+${nb})`;
        break;
      case "cone":
        if (nb <= 0) return;
        const slant = Math.sqrt(na * na + nb * nb);
        lateral = Math.PI * na * slant;
        sa = lateral + Math.PI * na * na;
        formula = `πr(r+l) where l=${slant.toFixed(4)}`;
        break;
      case "box":
        if (nb <= 0 || nc <= 0) return;
        sa = 2 * (na * nb + nb * nc + na * nc);
        lateral = 2 * nc * (na + nb);
        formula = `2(lw+wh+lh) = 2(${na}×${nb}+${nb}×${nc}+${na}×${nc})`;
        break;
    }
    setResult({ sa, lateral, formula, shape });
  };

  const reset = () => { setA("5"); setB("3"); setC("4"); setResult(null); };

  const labels: Record<Shape, { a: string; b?: string; c?: string }> = {
    cube: { a: "Side Length" },
    sphere: { a: "Radius" },
    cylinder: { a: "Radius", b: "Height" },
    cone: { a: "Radius", b: "Height" },
    box: { a: "Length", b: "Width", c: "Height" },
  };

  const faqs = [
    { question: "What is surface area?", answer: "Surface area is the total area of all outer faces of a 3D object, measured in square units." },
    { question: "What is lateral surface area?", answer: "Lateral surface area is the area of the sides only, excluding the top and bottom (base) faces." },
    { question: "How do I find the surface area of a cone?", answer: "SA = πr² + πrl, where l is the slant height: l = √(r² + h²)." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Surface Area Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Surface Area Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate total and lateral surface area of 3D shapes.</p>

            <div className="card-calculator mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {(["cube", "sphere", "cylinder", "cone", "box"] as const).map(s => (
                  <button key={s} onClick={() => { setShape(s); setResult(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${shape === s ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                    {s === "box" ? "Rectangular Prism" : s}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <InputField id="a" label={labels[shape].a} value={a} onChange={setA} />
                {labels[shape].b && <InputField id="b" label={labels[shape].b!} value={b} onChange={setB} />}
                {labels[shape].c && <InputField id="c" label={labels[shape].c!} value={c} onChange={setC} />}
              </div>

              <div className="flex gap-3">
                <button onClick={calculate} className="btn-calculate flex-1">Calculate</button>
                <button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[
                  { label: "Total Surface Area", value: 0, textValue: result.sa.toFixed(4), highlight: true },
                  { label: "Lateral Surface Area", value: 0, textValue: result.lateral.toFixed(4) },
                  { label: "Formula", value: 0, textValue: result.formula },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance">
              <h2>Surface Area Formulas</h2>
              <p>Surface area measures the total area of the exterior surfaces of a 3D object. This calculator supports cubes, spheres, cylinders, cones, and rectangular prisms (boxes), providing both total and lateral surface area.</p>
            </article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/surface-area-calculator" />
            <PopularCalculators exclude="/surface-area-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6">
            <AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default SurfaceAreaCalculator;

