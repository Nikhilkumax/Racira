"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PolygonInput {
  sides: number;
  sideLength: number;
}

interface PolygonResult {
  area: number;
  perimeter: number;
  apothem: number;
  circumradius: number;
  interiorAngle: number;
  exteriorAngle: number;
  diagonals: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPolygon(input: PolygonInput): PolygonResult {
  const n = Math.max(3, Math.round(input.sides));
  const s = input.sideLength;
  const area = (n * s * s) / (4 * Math.tan(Math.PI / n));
  const perimeter = n * s;
  const apothem = s / (2 * Math.tan(Math.PI / n));
  const circumradius = s / (2 * Math.sin(Math.PI / n));
  const interiorAngle = ((n - 2) * 180) / n;
  const exteriorAngle = 360 / n;
  const diagonals = (n * (n - 3)) / 2;

  const chartData = [
    { name: "Side", value: Number(s.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Apothem", value: Number(apothem.toFixed(2)), fill: "#10b981" },
    { name: "Circumradius", value: Number(circumradius.toFixed(2)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Number of Sides", value: `${n}` },
    { label: "Side Length", value: `${s}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "Area", value: `${area.toFixed(2)}` },
    { label: "Apothem (inradius)", value: `${apothem.toFixed(2)}` },
    { label: "Circumradius", value: `${circumradius.toFixed(2)}` },
    { label: "Interior Angle", value: `${interiorAngle.toFixed(1)}°` },
    { label: "Exterior Angle", value: `${exteriorAngle.toFixed(1)}°` },
    { label: "Diagonals", value: `${diagonals}` },
  ];

  const summaryStats = [
    { label: "Area", value: `${area.toFixed(2)}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "Apothem", value: `${apothem.toFixed(2)}` },
    { label: "Circumradius", value: `${circumradius.toFixed(2)}` },
    { label: "Interior Angle", value: `${interiorAngle.toFixed(1)}°` },
    { label: "Diagonals", value: `${diagonals}` },
  ];

  return { area, perimeter, apothem, circumradius, interiorAngle, exteriorAngle, diagonals, chartData, breakdown, summaryStats };
}

const DEFAULTS: PolygonInput = { sides: 6, sideLength: 4 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function PolygonCalculator() {
  const [sides, setSides] = useState(String(DEFAULTS.sides));
  const [sideLength, setSideLength] = useState(String(DEFAULTS.sideLength));
  const [result, setResult] = useState<PolygonResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPolygon({ sides: parse(sides, DEFAULTS.sides), sideLength: parse(sideLength, DEFAULTS.sideLength) }));
  const reset = () => {
    setSides(String(DEFAULTS.sides));
    setSideLength(String(DEFAULTS.sideLength));
    setResult(calcPolygon(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPolygon(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a regular polygon?", answer: "A regular polygon has all sides equal and all interior angles equal. Common examples: equilateral triangle (3), square (4), regular pentagon (5), hexagon (6), octagon (8)." },
    { question: "How is area calculated?", answer: "Area = (n × s²) ÷ (4 × tan(π/n)), where n is the number of sides and s the side length. It equals (perimeter × apothem) ÷ 2 — the polygon as n identical triangles with height equal to the apothem." },
    { question: "What are the apothem and circumradius?", answer: "The apothem is the distance from center to the midpoint of a side (the inradius of the incircle); the circumradius is the distance from center to a vertex. Together with the side they form the polygon's defining right triangle." },
    { question: "Why do interior angles grow with sides?", answer: "The sum of interior angles is (n − 2) × 180°, so each angle is that sum ÷ n: 60° for a triangle, 90° square, 108° pentagon, 120° hexagon. As n → ∞, the polygon approaches a circle (180° angles)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Regular Polygon Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Regular Polygon Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Number of Sides</label>
                <div className={inp}><input type="number" value={sides} onChange={(e) => setSides(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Side Length</label>
                <div className={inp}><input type="number" value={sideLength} onChange={(e) => setSideLength(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Polygon Area</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.area.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Perimeter {result.perimeter.toFixed(2)} · interior angle {result.interiorAngle.toFixed(1)}°</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Perimeter", `${result.perimeter.toFixed(2)}`], ["Apothem", `${result.apothem.toFixed(2)}`], ["Circumradius", `${result.circumradius.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Polygon Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Radius Measures</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v}`, ""]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {result.summaryStats.map((s, i) => (
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Regular Polygons</h2>
            <p>A regular polygon has equal sides and equal angles. Because it is composed of n identical isosceles triangles from the center, its area is simply (perimeter × apothem) ÷ 2, and the side-apothem-radius right triangle determines everything else.</p>
            <h2 className="text-2xl font-bold mb-3">Angles and Diagonals</h2>
            <p>Interior angles sum to (n − 2) × 180°, so each interior angle is that sum divided by n. The exterior angle is always 360° ÷ n, and the number of diagonals is n(n − 3) ÷ 2 — a pentagon has 5, a hexagon 9, an octagon 20.</p>
            <h2 className="text-2xl font-bold mb-3">Approaching the Circle</h2>
            <p>As the number of sides grows, a regular polygon converges to its circumscribed circle — which is how the ancient Greeks estimated π by inscribing polygons with hundreds of sides. A 96-gon got Archimedes within 0.03% of π.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/polygon-calculator" />
          <PopularCalculators exclude="/calculator/polygon-calculator" />
        </div>
      </div>
    </>
  );
}
