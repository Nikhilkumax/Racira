"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import InputField from "@/domains/calculator/components/ui/InputField";
import ResultDisplay from "@/domains/calculator/components/ui/ResultDisplay";
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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
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

          <div className="flex flex-col gap-3">
            {showResults && result && (
              <>
                <h2 className="text-2xl font-bold mb-3">Result</h2>
                <ResultDisplay items={[
                  { label: "Area", value: 0, textValue: result.area.toFixed(4) + " sq units" },
                  { label: "Perimeter", value: 0, textValue: result.perimeter.toFixed(4) + " units" },
                  { label: "Formula Used", value: 0, textValue: result.formula },
                ]} />
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Geometric Area</h2>
            <p>In geometry, area represents the amount of two-dimensional space that a flat surface or shape occupies. It is universally measured in square units, such as square meters (m²), square feet (ft²), square inches (in²), or acres. Calculating the area of various shapes is one of the most fundamental concepts in mathematics, with countless practical applications in everyday life, construction, engineering, agriculture, and design.</p>
            <p>Whether you are calculating how much paint you need for a bedroom wall, determining the square footage of a property you want to buy, figuring out how much fertilizer is required for a circular garden, or calculating the cross-sectional capacity of a pipe, you are using area calculations. Because the physical world is constructed from complex geometries, being able to break down irregular objects into basic mathematical shapes (like rectangles and triangles) allows you to solve almost any spatial problem.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Basic Shapes</h2>
            <p>Every standard geometric shape has a specific formula derived from its unique properties:</p>
            <ul>
              <li><strong>Rectangle:</strong> The simplest shape to calculate. The area is simply the product of its length and width (A = l × w). If you have a room that is 10 feet long and 12 feet wide, the area is exactly 120 square feet. A square is just a special rectangle where all sides are equal.</li>
              <li><strong>Triangle:</strong> A triangle is mathematically exactly half of a rectangle or parallelogram. Therefore, the area is half of its base multiplied by its vertical height (A = ½bh). It is critical to use the vertical height (straight up and down at a 90-degree angle to the base), not the slanted side lengths.</li>
              <li><strong>Circle:</strong> The area of a circle depends entirely on its radius (the distance from the center to the edge) and the mathematical constant Pi (π, approximately 3.14159). The formula is A = πr². Because the radius is squared, doubling the size of a circle actually quadruples its total area.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Complex Shapes: Trapezoids and Ellipses</h2>
            <p>Moving beyond basic geometry, we encounter shapes that require slightly more complex calculations:</p>
            <ul>
              <li><strong>Trapezoid:</strong> A trapezoid is a four-sided shape with only one pair of parallel sides (called the bases). Its area is found by taking the average of the two parallel bases and multiplying that average by the height (A = ½(a+b)h). This shape is incredibly common in architectural roofs and land plots.</li>
              <li><strong>Ellipse:</strong> An ellipse is an elongated circle, often called an oval. Instead of a single radius, it has a semi-major axis (the longest distance from center to edge) and a semi-minor axis (the shortest distance). Its area is calculated by multiplying these two axes together with Pi (A = πab). This formula is essential in physics and astronomy for calculating planetary orbits.</li>
            </ul>
            
            <h2 className="text-2xl font-bold mb-3">Practical Applications of Area</h2>
            <p>In the real estate and construction industries, "square footage" (which is simply the area of the floor plan) is the primary metric used to determine property value. When laying flooring, installing carpets, or calculating roof shingles, professionals must factor in a "waste percentage" (usually 10%) on top of the calculated area to account for cuts and overlaps. In manufacturing, calculating the surface area of raw materials ensures minimal waste when cutting parts from sheet metal or fabric.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/area-calculator" />
          <PopularCalculators exclude="/area-calculator" />
        </div>
      </div>
    </>
  );
};

export default AreaCalculator;


