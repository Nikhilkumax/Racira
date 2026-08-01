"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Shape = "rectangle" | "circle" | "triangle" | "square" | "regularPolygon" | "trapezoid";
type Unit = "sqft" | "sqm" | "acre" | "hectare";

interface AreaInputs {
  shape: Shape;
  length: string;
  width: string;
  unit: Unit;
  radius: string;
  triangleBase: string;
  triangleHeight: string;
  sides: string;
  apothem: string;
  precision: string;
}

interface AreaResult {
  area: number;
  formula: string;
  sqft: number;
  sqm: number;
  acre: number;
  hectare: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { unit: string; value: number; fill: string }[];
}

const SHAPES: { key: Shape; label: string }[] = [
  { key: "rectangle", label: "Rectangle" },
  { key: "circle", label: "Circle" },
  { key: "triangle", label: "Triangle" },
  { key: "square", label: "Square" },
  { key: "regularPolygon", label: "Regular Polygon" },
  { key: "trapezoid", label: "Trapezoid" },
];

const UNITS: { key: Unit; label: string }[] = [
  { key: "sqft", label: "Square Feet" },
  { key: "sqm", label: "Square Meters" },
  { key: "acre", label: "Acres" },
  { key: "hectare", label: "Hectares" },
];

const SQFT_PER: Record<Unit, number> = {
  sqft: 1,
  sqm: 10.7639,
  acre: 43560,
  hectare: 107639,
};

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function calcArea(inputs: AreaInputs): AreaResult {
  const precision = Math.max(0, Math.min(10, Math.floor(num(inputs.precision)) || 2));
  const length = num(inputs.length);
  const width = num(inputs.width);
  const radius = num(inputs.radius);
  const base = num(inputs.triangleBase);
  const height = num(inputs.triangleHeight);
  const sides = Math.max(3, Math.round(num(inputs.sides)) || 3);
  const apothem = num(inputs.apothem);
  const inputUnit: Unit = inputs.unit || "sqft";

  let area = 0;
  let formula = "";

  switch (inputs.shape) {
    case "rectangle":
      area = length * width;
      formula = "Area = Length × Width";
      break;
    case "circle":
      area = Math.PI * radius * radius;
      formula = "Area = π × radius²";
      break;
    case "triangle":
      area = 0.5 * base * height;
      formula = "Area = ½ × base × height";
      break;
    case "square":
      area = length * length;
      formula = "Area = side²";
      break;
    case "regularPolygon":
      area = 0.5 * sides * length * apothem;
      formula = "Area = ½ × n × side × apothem";
      break;
    case "trapezoid":
      area = 0.5 * (length + width) * height;
      formula = "Area = ½ × (base₁ + base₂) × height";
      break;
    default:
      area = 0;
      formula = "Area = shape-specific formula";
  }

  const areaSqft = area * SQFT_PER[inputUnit];

  const sqft = areaSqft;
  const sqm = areaSqft / 10.7639;
  const acre = areaSqft / 43560;
  const hectare = areaSqft / 107639;

  const r = (n: number) => parseFloat(n.toFixed(precision));

  const breakdown = [
    { label: "Shape", value: SHAPES.find((s) => s.key === inputs.shape)?.label ?? "" },
    { label: "Input Unit", value: UNITS.find((u) => u.key === inputUnit)?.label ?? "" },
    { label: "Primary Area", value: `${r(area)} ${inputUnit}` },
    { label: "Square Feet", value: `${r(sqft)} sq ft` },
    { label: "Square Meters", value: `${r(sqm)} m²` },
    { label: "Acres", value: `${r(acre)} ac` },
    { label: "Hectares", value: `${r(hectare)} ha` },
  ];

  const summaryStats = [
    { label: "Formula", value: formula.replace("Area = ", "") },
    { label: "Primary Unit", value: `${r(area)} ${inputUnit}` },
    { label: "Square Feet", value: `${r(sqft)}` },
    { label: "Square Meters", value: `${r(sqm)}` },
    { label: "Acres", value: `${r(acre)}` },
    { label: "Hectares", value: `${r(hectare)}` },
  ];

  const chartData = [
    { unit: "sq ft", value: r(sqft), fill: "#3b82f6" },
    { unit: "sq m", value: r(sqm), fill: "#10b981" },
    { unit: "acre", value: r(acre), fill: "#f59e0b" },
    { unit: "hectare", value: r(hectare), fill: "#8b5cf6" },
  ];

  return {
    area: r(area),
    formula,
    sqft: r(sqft),
    sqm: r(sqm),
    acre: r(acre),
    hectare: r(hectare),
    breakdown,
    summaryStats,
    chartData,
  };
}

const DEFAULTS: AreaInputs = {
  shape: "rectangle",
  length: "50",
  width: "30",
  unit: "sqft",
  radius: "10",
  triangleBase: "20",
  triangleHeight: "15",
  sides: "4",
  apothem: "5",
  precision: "2",
};

export default function AreaCalculator() {
  const [inputs, setInputs] = useState<AreaInputs>(DEFAULTS);
  const [result, setResult] = useState<AreaResult>(calcArea(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calcArea(inputs));
  }, []);

  const calculate = () => setResult(calcArea(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calcArea(DEFAULTS));
  };

  const update = (patch: Partial<AreaInputs>) => setInputs((prev) => ({ ...prev, ...patch }));

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Which formula is used for each shape?", answer: "Rectangle = L × W, Circle = π × r², Triangle = ½ × base × height, Square = side², Regular Polygon = ½ × n × side × apothem, Trapezoid = ½ × (base₁ + base₂) × height." },
    { question: "How are the different units calculated?", answer: "The primary area is converted using fixed factors: 1 sq ft = 0.092903 sq m, 1 acre = 43,560 sq ft, and 1 hectare = 107,639 sq ft." },
    { question: "What can I use area calculations for?", answer: "Areas are used for flooring, painting, landscaping, land valuation, and material estimation. Multiply the area by cost or coverage per unit to plan a project." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Area Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Shape</label>
                <div className={inp}>
                  <select value={inputs.shape} onChange={e => update({ shape: e.target.value as Shape })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci}>
                    {SHAPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit</label>
                <div className={inp}>
                  <select value={inputs.unit} onChange={e => update({ unit: e.target.value as Unit })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci}>
                    {UNITS.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Length / Side</label>
                <div className={inp}><input type="number" value={inputs.length} onChange={e => update({ length: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Width</label>
                <div className={inp}><input type="number" value={inputs.width} onChange={e => update({ width: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
              </div>
            </div>
            <button onClick={() => setShowAdv(!showAdv)} className="text-sm text-primary font-medium text-left">
              Advanced Options {showAdv ? "▲" : "▼"}
            </button>
            {showAdv && (
              <div className="border border-border rounded-lg p-4 space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Shape-Specific</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Radius</label>
                      <div className={inp}><input type="number" value={inputs.radius} onChange={e => update({ radius: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Base</label>
                      <div className={inp}><input type="number" value={inputs.triangleBase} onChange={e => update({ triangleBase: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Height</label>
                      <div className={inp}><input type="number" value={inputs.triangleHeight} onChange={e => update({ triangleHeight: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Sides</label>
                      <div className={inp}><input type="number" value={inputs.sides} onChange={e => update({ sides: e.target.value })} min={3} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Apothem</label>
                      <div className={inp}><input type="number" value={inputs.apothem} onChange={e => update({ apothem: e.target.value })} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Unit Conversion</div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Precision (decimal places)</label>
                    <div className={inp}><input type="number" value={inputs.precision} onChange={e => update({ precision: e.target.value })} min={0} max={10} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Calculated Area</div>
              <div className="text-4xl font-extrabold tracking-tight text-primary">{result.area} {inputs.unit}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.formula}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["sq ft", `${result.sqft}`], ["sq m", `${result.sqm}`], ["acre", `${result.acre}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-primary/5" : ""}`}>
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Area in Different Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="unit" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, "Area"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
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
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Area Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An area calculator is a tool that computes the two-dimensional space enclosed by a flat shape, expressed in square units such as square feet, square meters, acres, or hectares. Each geometry has its own formula — a rectangle uses length × width, a circle uses π × radius², a triangle uses ½ × base × height, a square uses side², a regular polygon uses ½ × n × side × apothem, and a trapezoid uses ½ × (base₁ + base₂) × height. Because real spaces are rarely perfectly regular, you can split an irregular room or plot into rectangles and triangles, calculate each area, and add them together. The advanced options let you enter shape-specific dimensions and set the output precision so every conversion is rounded consistently. Unit conversion factors are fixed and verifiable: 1 sq ft = 0.092903 sq m, 1 acre = 43,560 sq ft, and 1 hectare = 107,639 sq ft.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Using Area for Flooring, Painting & Landscaping</h2>
              <p className="text-muted-foreground leading-relaxed">Once you know the area, you can plan almost any home or outdoor project. For flooring, multiply the room area by the cost per square foot of tile, wood, or carpet, then add a 10% waste allowance for cuts and mistakes. For painting, divide the wall area by the coverage stated on the can (typically 350–400 sq ft per gallon) to find how many gallons you need. Landscaping works the same way: a circular garden bed's area (πr²) tells you how much mulch, sod, or seed to buy, while a rectangular lawn area guides fertilizer and irrigation planning. When your measurement is in square meters but your supplier quotes per square foot, the built-in unit converter keeps estimates accurate. Estimating by area instead of guesswork prevents overspending and mid-project trips to the store, so always calculate the area before ordering materials.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card shows your calculated area in the unit you selected, alongside the exact formula used. The three-stat bar gives a fast read on square feet, square meters, and acres, while the breakdown table lists every conversion including hectares. The bar chart visualizes the same area across all four units so you can compare magnitudes at a glance — note that acres and hectares compress very large areas into small, readable numbers. Summary statistics recap the formula and all unit values for quick reference. To avoid errors, the calculator treats empty, zero, or negative inputs as zero rather than producing NaN, so the outputs remain stable even with incomplete fields. Adjust precision in Advanced Options to control decimal places, and use Reset to restore the default rectangle (50 × 30 sq ft) example whenever you start a new estimate.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/area-calculator" />
          <PopularCalculators exclude="/calculator/area-calculator" />
        </div>
      </div>
    </>
  );
}
