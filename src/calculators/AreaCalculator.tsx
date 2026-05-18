"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/components/calculator/InputField";
import ResultDisplay from "@/components/calculator/ResultDisplay";
import { RotateCcw } from "lucide-react";

type Shape = "rectangle" | "circle" | "triangle" | "trapezoid" | "ellipse";

const AreaCalculator = () => {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [a, setA] = useState(""); const [b, setB] = useState(""); const [c, setC] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<{ area: number; perimeter: number; formula: string } | null>(null);

  const handleCalculate = () => {
    setShowResults(true);
    const x = parseFloat(a) || 0, y = parseFloat(b) || 0, z = parseFloat(c) || 0;
    let area = 0, perimeter = 0, formula = "";
    if (shape === "rectangle") { area = x * y; perimeter = 2 * (x + y); formula = "A = l × w"; }
    else if (shape === "circle") { area = Math.PI * x * x; perimeter = 2 * Math.PI * x; formula = "A = πr²"; }
    else if (shape === "triangle") { area = 0.5 * x * y; perimeter = x + y + (z || Math.sqrt(x * x + y * y)); formula = "A = ½ × b × h"; }
    else if (shape === "trapezoid") { area = 0.5 * (x + y) * z; perimeter = x + y + 2 * z; formula = "A = ½(a+b) × h"; }
    else if (shape === "ellipse") { area = Math.PI * x * y; perimeter = Math.PI * (3 * (x + y) - Math.sqrt((3 * x + y) * (x + 3 * y))); formula = "A = πab"; }
    setResult({ area, perimeter, formula });
  };

  const reset = () => {
    setShowResults(false); setA(""); setB(""); setC(""); setResult(null); };

  const shapes: { key: Shape; label: string }[] = [
    { key: "rectangle", label: "Rectangle" }, { key: "circle", label: "Circle" },
    { key: "triangle", label: "Triangle" }, { key: "trapezoid", label: "Trapezoid" }, { key: "ellipse", label: "Ellipse" },
  ];

  const faqs = [
    { question: "What is area?", answer: "Area is the amount of space enclosed within a 2D shape, measured in square units (e.g., m², ft²)." },
    { question: "How do I calculate the area of an irregular shape?", answer: "Break it into regular shapes, calculate each area, then sum them. Alternatively, use the coordinate geometry method or integration." },
  ];

  return (
    <>
<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Area Calculator" }]} />

      <div className="container-page py-8">
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Area Calculator</h1>
            <p className="text-muted-foreground mb-8">Calculate area and perimeter of common geometric shapes.</p>

            <div className="card-calculator mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                {shapes.map(s => (
                  <button key={s.key} onClick={() => { setShape(s.key); reset(); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${shape === s.key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>{s.label}</button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-5 mb-6">
                {shape === "rectangle" && <><InputField id="a" label="Length" value={a} onChange={setA} /><InputField id="b" label="Width" value={b} onChange={setB} /></>}
                {shape === "circle" && <InputField id="a" label="Radius" value={a} onChange={setA} />}
                {shape === "triangle" && <><InputField id="a" label="Base" value={a} onChange={setA} /><InputField id="b" label="Height" value={b} onChange={setB} /></>}
                {shape === "trapezoid" && <><InputField id="a" label="Side a" value={a} onChange={setA} /><InputField id="b" label="Side b" value={b} onChange={setB} /><InputField id="c" label="Height" value={c} onChange={setC} /></>}
                {shape === "ellipse" && <><InputField id="a" label="Semi-major axis (a)" value={a} onChange={setA} /><InputField id="b" label="Semi-minor axis (b)" value={b} onChange={setB} /></>}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button><button onClick={reset} className="rounded-lg border border-border px-4 py-3 text-muted-foreground hover:bg-secondary transition-colors" aria-label="Reset"><RotateCcw className="h-5 w-5" /></button>
              </div>
            </div>

            {showResults && result && (
              <div className="card-calculator mb-8">
                <h2 className="text-xl font-bold mb-4">Result</h2>
                <ResultDisplay items={[
                  { label: "Area", value: 0, textValue: result.area.toFixed(4) + " sq units" },
                  { label: "Perimeter", value: 0, textValue: result.perimeter.toFixed(4) + " units" },
                  { label: "Formula Used", value: 0, textValue: result.formula },
                ]} />
              </div>
            )}

            <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
            <article className="prose-finance"><h2>Area Formulas</h2><p><strong>Rectangle:</strong> A = l × w | <strong>Circle:</strong> A = πr² | <strong>Triangle:</strong> A = ½bh | <strong>Trapezoid:</strong> A = ½(a+b)h | <strong>Ellipse:</strong> A = πab</p></article>
            <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/area-calculator" />
            <PopularCalculators exclude="/area-calculator" />
          </div>
          <aside className="hidden lg:block space-y-6"><AdPlaceholder className="min-h-[250px]" label="Ad Space – Sidebar" /></aside>
        </div>
      </div>
    </>
  );
};

export default AreaCalculator;


