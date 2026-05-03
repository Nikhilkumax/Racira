"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Shape3D = "cube" | "sphere" | "cylinder" | "cone" | "rectangular";

const VolumeCalculator = () => {
  const [shape, setShape] = useState<Shape3D>("cube");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState("");
  const [result, setResult] = useState<{ volume: number; surfaceArea: number; formula: string } | null>(null);

  const calculate = () => {
    const x = parseFloat(a) || 0, y = parseFloat(b) || 0, z = parseFloat(c) || 0;
    let vol = 0, sa = 0, formula = "";
    if (shape === "cube") { vol = x ** 3; sa = 6 * x * x; formula = "V = s³"; }
    else if (shape === "sphere") { vol = (4 / 3) * Math.PI * x ** 3; sa = 4 * Math.PI * x * x; formula = "V = (4/3)πr³"; }
    else if (shape === "cylinder") { vol = Math.PI * x * x * y; sa = 2 * Math.PI * x * (x + y); formula = "V = πr²h"; }
    else if (shape === "cone") { vol = (1 / 3) * Math.PI * x * x * y; const sl = Math.sqrt(x * x + y * y); sa = Math.PI * x * (x + sl); formula = "V = (1/3)πr²h"; }
    else if (shape === "rectangular") { vol = x * y * z; sa = 2 * (x * y + y * z + x * z); formula = "V = l × w × h"; }
    setResult({ volume: vol, surfaceArea: sa, formula });
  };

  const reset = () => { setA(""); setB(""); setC(""); setResult(null); };

  const shapes: { key: Shape3D; label: string }[] = [
    { key: "cube", label: "Cube" }, { key: "sphere", label: "Sphere" },
    { key: "cylinder", label: "Cylinder" }, { key: "cone", label: "Cone" }, { key: "rectangular", label: "Box" },
  ];

  const faqs = [
    { question: "What is volume?", answer: "Volume is the amount of 3D space enclosed within a solid object, measured in cubic units (e.g., m³, ft³)." },
    { question: "How do I convert between volume units?", answer: "1 m³ = 1,000 liters = 264.172 gallons. 1 ft³ = 7.481 gallons = 28.317 liters." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Volume Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Volume Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate volume and surface area of 3D shapes.</p>

            <div className="card-calculator mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {shapes.map(s => (
                  <button key={s.key} onClick={() => { setShape(s.key); reset(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${shape === s.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{s.label}</button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {shape === "cube" && <InputField id="a" label="Side Length" value={a} onChange={setA} />}
                {shape === "sphere" && <InputField id="a" label="Radius" value={a} onChange={setA} />}
                {shape === "cylinder" && <><InputField id="a" label="Radius" value={a} onChange={setA} /><InputField id="b" label="Height" value={b} onChange={setB} /></>}
                {shape === "cone" && <><InputField id="a" label="Radius" value={a} onChange={setA} /><InputField id="b" label="Height" value={b} onChange={setB} /></>}
                {shape === "rectangular" && <><InputField id="a" label="Length" value={a} onChange={setA} /><InputField id="b" label="Width" value={b} onChange={setB} /><InputField id="c" label="Height" value={c} onChange={setC} /></>}
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
                  { label: "Volume", value: 0, textValue: result.volume.toFixed(4) + " cubic units" },
                  { label: "Surface Area", value: 0, textValue: result.surfaceArea.toFixed(4) + " sq units" },
                  { label: "Formula Used", value: 0, textValue: result.formula },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance"><h2>Volume Formulas</h2><p><strong>Cube:</strong> V = s³ | <strong>Sphere:</strong> V = (4/3)πr³ | <strong>Cylinder:</strong> V = πr²h | <strong>Cone:</strong> V = (1/3)πr²h</p></article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/volume-calculator" />
            <PopularCalculators exclude="/volume-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};

export default VolumeCalculator;

