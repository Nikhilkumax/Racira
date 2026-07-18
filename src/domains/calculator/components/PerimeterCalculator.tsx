"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, Triangle as TriIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

type ShapeType = "square" | "rectangle" | "circle" | "triangle" | "polygon";

export default function PerimeterCalculator() {
  const [shape, setShape] = useState<ShapeType>("rectangle");
  const [side, setSide] = useState("10");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("8");
  const [radius, setRadius] = useState("7");
  const [sideA, setSideA] = useState("6");
  const [sideB, setSideB] = useState("8");
  const [sideC, setSideC] = useState("10");
  const [numSides, setNumSides] = useState("5");
  const [polySide, setPolySide] = useState("6");

  const [res, setRes] = useState<{
    perimeter: number;
    area: number;
    error: string | null;
    chartData: { name: string; value: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    let perimeter = 0;
    let area = 0;
    let error: string | null = null;

    if (shape === "square") {
      const s = parseFloat(side) || 0;
      if (s <= 0) error = "Side length must be positive.";
      perimeter = 4 * s;
      area = s * s;
    } else if (shape === "rectangle") {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      if (l <= 0 || w <= 0) error = "Dimensions must be positive.";
      perimeter = 2 * (l + w);
      area = l * w;
    } else if (shape === "circle") {
      const r = parseFloat(radius) || 0;
      if (r <= 0) error = "Radius must be positive.";
      perimeter = 2 * Math.PI * r;
      area = Math.PI * r * r;
    } else if (shape === "triangle") {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const c = parseFloat(sideC) || 0;
      
      if (a <= 0 || b <= 0 || c <= 0) {
        error = "All sides must be positive.";
      } else if (a + b <= c || a + c <= b || b + c <= a) {
        error = "Triangle inequality theorem violated: sum of any two sides must exceed the third.";
      } else {
        perimeter = a + b + c;
        // Heron's Formula for area
        const s = perimeter / 2;
        area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      }
    } else if (shape === "polygon") {
      const n = parseInt(numSides) || 3;
      const s = parseFloat(polySide) || 0;
      if (n < 3) error = "A polygon must have at least 3 sides.";
      if (s <= 0) error = "Side length must be positive.";
      perimeter = n * s;
      // Area of regular polygon = (n * s^2) / (4 * tan(pi/n))
      area = (n * s * s) / (4 * Math.tan(Math.PI / n));
    }

    const chartData = error ? [] : [
      { name: "Perimeter", value: parseFloat(perimeter.toFixed(2)) },
      { name: "Area", value: parseFloat(area.toFixed(2)) },
    ];

    setRes({
      perimeter,
      area,
      error,
      chartData,
    });
  };

  const reset = () => {
    setShape("rectangle");
    setSide("10");
    setLength("12");
    setWidth("8");
    setRadius("7");
    setSideA("6");
    setSideB("8");
    setSideC("10");
    setNumSides("5");
    setPolySide("6");
  };

  const faqs = [
    { question: "What is perimeter?", answer: "Perimeter is the total boundary distance around a two-dimensional shape." },
    { question: "How does circle circumference relate to perimeter?", answer: "Circumference is simply the specialized term for the perimeter of a circular boundary shape." },
    { question: "What is the triangle inequality theorem?", answer: "The theorem states that for any valid triangle, the sum of lengths of any two sides must be strictly greater than the length of the remaining side." },
    { question: "How does perimeter scale compared to area?", answer: "Perimeter scales linearly with dimension changes (e.g. doubling side length doubles perimeter), whereas area scales quadratically (doubling side length quadruples area)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Perimeter Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Geometric Perimeter & Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Select 2D Shape</h2>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Shape Type</label>
              <select value={shape} onChange={e => setShape(e.target.value as ShapeType)} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="rectangle">Rectangle</option>
                <option value="square">Square</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="polygon">Regular Polygon</option>
              </select>
            </div>

            {shape === "square" && (
              <CompactInput id="side" label="Side Length (s)" value={side} onChange={setSide} />
            )}

            {shape === "rectangle" && (
              <>
                <CompactInput id="len" label="Length (l)" value={length} onChange={setLength} />
                <CompactInput id="wid" label="Width (w)" value={width} onChange={setWidth} />
              </>
            )}

            {shape === "circle" && (
              <CompactInput id="rad" label="Radius (r)" value={radius} onChange={setRadius} />
            )}

            {shape === "triangle" && (
              <>
                <CompactInput id="sa" label="Side A" value={sideA} onChange={setSideA} />
                <CompactInput id="sb" label="Side B" value={sideB} onChange={setSideB} />
                <CompactInput id="sc" label="Side C" value={sideC} onChange={setSideC} />
              </>
            )}

            {shape === "polygon" && (
              <>
                <CompactInput id="ns" label="Number of Sides" value={numSides} onChange={setNumSides} min="3" step="1" />
                <CompactInput id="ps" label="Side Length" value={polySide} onChange={setPolySide} />
              </>
            )}

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Boundary Dimensions</h2>
                  <TriIcon className="h-5 w-5 text-primary" />
                </div>

                {res.error ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md text-sm font-semibold leading-relaxed">
                    {res.error}
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                      <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Calculated Perimeter</div>
                      <div className="text-5xl font-extrabold text-foreground mb-1 tracking-tight">{res.perimeter.toLocaleString(undefined, { maximumFractionDigits: 4 })}</div>
                      <div className="text-sm font-semibold text-muted-foreground">units</div>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-left text-sm">
                        <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                          <th className="p-2.5 pl-3">Property</th><th className="p-2.5 pr-3 text-right">Value</th>
                        </tr></thead>
                        <tbody className="divide-y divide-border/50">
                          {[
                            { label: "Perimeter (Circumference)", value: res.perimeter.toFixed(4), bold: true },
                            { label: "Surface Area", value: res.area.toFixed(4) },
                          ].map(r => (
                            <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                              <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                              <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {mounted && (<>

                      <div className="p-4 rounded-xl border border-border bg-card">
                        <h3 className="text-sm font-bold text-foreground mb-3">Boundary Metric vs. Coverage Area</h3>
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart layout="vertical" data={res.chartData} margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(v: any) => [`${v}`, "Value"]} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    
</>)}
                  </>
                )}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Perimeter and Geometric Boundaries</h2>
            <p>In classical geometry, the perimeter is the total continuous distance that outlines or encompasses a closed, two-dimensional shape. The word itself is derived from the Greek terms <em>peri</em> (meaning "around") and <em>metron</em> (meaning "measure"). Simply put, if you were to walk along the exact edge of a flat object until you returned to your starting point, the distance you traveled would be the object's perimeter.</p>
            <p>Perimeter is a one-dimensional measurement, which means it is always expressed in standard linear units such as meters (m), feet (ft), inches (in), or centimeters (cm). This distinguishes it from Area, which measures two-dimensional space and is expressed in square units (m², ft²). Calculating the perimeter of various shapes is a foundational mathematical skill with endless applications in construction, agriculture, engineering, and everyday life.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Basic Polygons</h2>
            <p>For any straight-sided shape (polygon), the perimeter is calculated by simply adding the lengths of all its exterior sides together. However, because standard shapes have predictable properties, we use specific formulas to calculate them faster:</p>
            <ul>
              <li><strong>Rectangles:</strong> A rectangle has two pairs of equal parallel sides. Therefore, instead of adding <em>length + width + length + width</em>, the standard formula is <em>P = 2(Length + Width)</em>. If a rectangular garden is 10 feet long and 5 feet wide, the perimeter is 2(10 + 5) = 30 feet.</li>
              <li><strong>Squares:</strong> A square is a special type of rectangle where all four sides are exactly equal. The formula is simply <em>P = 4s</em>, where "s" is the length of one side.</li>
              <li><strong>Triangles:</strong> The perimeter of a triangle is the sum of its three sides (<em>P = a + b + c</em>). An important rule of geometry, known as the Triangle Inequality Theorem, states that the sum of the lengths of any two sides of a triangle must always be strictly greater than the length of the third side. If this is not true, the shape cannot physically connect to form a triangle.</li>
              <li><strong>Regular Polygons:</strong> For shapes like regular pentagons, hexagons, or octagons (where all sides and interior angles are identical), the perimeter is the length of one side multiplied by the total number of sides (<em>P = n × s</em>).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Circles and Circumference</h2>
            <p>When dealing with a perfect circle, the perimeter is given a special name: <strong>Circumference</strong>. Because a circle has no straight sides to measure, its perimeter must be calculated using its radius (the distance from the center to the edge) and the mathematical constant Pi (π, approximately 3.14159). The formula for the circumference of a circle is <em>C = 2πr</em> (or <em>C = πd</em>, where d is the diameter). For example, a circular pool with a 10-foot radius will have a perimeter (circumference) of 2 × 3.14159 × 10, which equals roughly 62.83 feet.</p>

            <h2 className="text-2xl font-bold mb-3">Practical Applications of Perimeter</h2>
            <p>Understanding boundary metrics is crucial for estimating physical materials. If you are building a fence around a yard, installing baseboards in a room, framing a picture, or laying down border trim, you are working directly with perimeter calculations. Furthermore, comparing a shape's perimeter to its internal area helps assess its structural efficiency. For example, a circle encloses the maximum possible area for any given perimeter, which is why bubbles, pipes, and natural cellular structures tend to form as spheres or cylinders—they offer the highest internal capacity with the lowest possible material requirement for the boundary.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/perimeter-calculator" />
          <PopularCalculators exclude="/calculator/perimeter-calculator" />
        </div>
      </div>
    </>
  );
}
