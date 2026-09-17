"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Shape = "sphere" | "cylinder" | "cone" | "cube" | "rectPrism";

interface SaInput {
  shape: Shape;
  r: number;
  h: number;
  l: number;
  w: number;
}

interface SaResult {
  area: number;
  sqFeet: number;
  sqMeters: number;
  formulaLabel: string;
  chartData: { name: string; area: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const SHAPE_LABELS: Record<Shape, string> = {
  sphere: "Sphere (SA = 4πr²)",
  cylinder: "Cylinder (SA = 2πr² + 2πrh)",
  cone: "Cone (SA = πr² + πrl)",
  cube: "Cube (SA = 6s²)",
  rectPrism: "Rectangular Prism (SA = 2lw + 2lh + 2wh)",
};

function areaFor(shape: Shape, r: number, h: number, l: number, w: number): number {
  switch (shape) {
    case "sphere": return 4 * Math.PI * r * r;
    case "cylinder": return 2 * Math.PI * r * r + 2 * Math.PI * r * h;
    case "cone": return Math.PI * r * (r + Math.sqrt(h * h + r * r));
    case "cube": return 6 * l * l;
    case "rectPrism": return 2 * l * w + 2 * l * h + 2 * w * h;
  }
}

function volumeFor(shape: Shape, r: number, h: number, l: number, w: number): number {
  switch (shape) {
    case "sphere": return (4 / 3) * Math.PI * Math.pow(r, 3);
    case "cylinder": return Math.PI * r * r * h;
    case "cone": return (1 / 3) * Math.PI * r * r * h;
    case "cube": return Math.pow(l, 3);
    case "rectPrism": return l * w * h;
  }
}

function calcSa(input: SaInput): SaResult {
  const area = areaFor(input.shape, input.r, input.h, input.l, input.w);
  const sqFeet = area / 144;
  const sqMeters = area * 0.00064516;

  const others: [string, number][] = [
    ["Sphere", areaFor("sphere", input.r, 0, 0, 0)],
    ["Cylinder", areaFor("cylinder", input.r, input.h, 0, 0)],
    ["Cone", areaFor("cone", input.r, input.h, 0, 0)],
    ["Cube", areaFor("cube", 0, 0, input.l, 0)],
    ["Rect Prism", areaFor("rectPrism", 0, input.h, input.l, input.w)],
  ];

  const chartData = others.map(([name, v]) => ({
    name,
    area: Number(v.toFixed(1)),
    fill: name === SHAPE_LABELS[input.shape].split(" ")[0] ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const dims: { label: string; value: string }[] = [];
  if (input.shape === "sphere" || input.shape === "cylinder" || input.shape === "cone") dims.push({ label: "Radius", value: `${input.r} in` });
  if (input.shape === "cylinder" || input.shape === "cone") dims.push({ label: "Height", value: `${input.h} in` });
  if (input.shape === "cube") dims.push({ label: "Side Length", value: `${input.l} in` });
  if (input.shape === "rectPrism") {
    dims.push({ label: "Length", value: `${input.l} in` });
    dims.push({ label: "Width", value: `${input.w} in` });
    dims.push({ label: "Height", value: `${input.h} in` });
  }

  const breakdown = [
    ...dims,
    { label: "Formula", value: SHAPE_LABELS[input.shape] },
    { label: "Surface Area", value: `${area.toFixed(1)} in²` },
    { label: "Square Feet", value: `${sqFeet.toFixed(3)} ft²` },
    { label: "Square Meters", value: `${sqMeters.toFixed(4)} m²` },
  ];

  const summaryStats = [
    { label: "Surface Area", value: `${area.toFixed(1)} in²` },
    { label: "Square Feet", value: `${sqFeet.toFixed(3)} ft²` },
    { label: "Square Meters", value: `${sqMeters.toFixed(4)} m²` },
    { label: "Volume", value: `${volumeFor(input.shape, input.r, input.h, input.l, input.w).toFixed(1)} in³` },
    { label: "Shape", value: SHAPE_LABELS[input.shape].split(" ")[0] },
    { label: "SA-to-Volume Ratio", value: `${(area / Math.max(0.001, volumeFor(input.shape, input.r, input.h, input.l, input.w))).toFixed(3)} /in` },
  ];

  return { area, sqFeet, sqMeters, formulaLabel: SHAPE_LABELS[input.shape], chartData, breakdown, summaryStats };
}

const DEFAULTS: SaInput = { shape: "sphere", r: 5, h: 10, l: 5, w: 4 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function SurfaceAreaCalculator() {
  const [shape, setShape] = useState<SaInput["shape"]>(DEFAULTS.shape);
  const [r, setR] = useState(String(DEFAULTS.r));
  const [h, setH] = useState(String(DEFAULTS.h));
  const [l, setL] = useState(String(DEFAULTS.l));
  const [w, setW] = useState(String(DEFAULTS.w));
  const [result, setResult] = useState<SaResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcSa({ shape, r: parse(r, DEFAULTS.r), h: parse(h, DEFAULTS.h), l: parse(l, DEFAULTS.l), w: parse(w, DEFAULTS.w) }));
  const reset = () => {
    setShape(DEFAULTS.shape);
    setR(String(DEFAULTS.r));
    setH(String(DEFAULTS.h));
    setL(String(DEFAULTS.l));
    setW(String(DEFAULTS.w));
    setResult(calcSa(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcSa(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I calculate surface area?", answer: "Surface area is the total area of all faces of a solid. Sphere: 4πr²; cylinder: 2πr² + 2πrh; cone: πr² + πrl (l = slant height); cube: 6s²; rectangular prism: 2lw + 2lh + 2wh." },
    { question: "What is the slant height of a cone?", answer: "The slant height l = √(h² + r²) — the straight-line distance from the apex to the edge of the base. It is needed because the cone's lateral surface is a sector of a circle with radius l." },
    { question: "Why does the sphere formula have 4π?", answer: "The surface area of a sphere equals the area of four of its great circles (4πr²) — one of Archimedes' most celebrated results. It is also exactly the area of a cylinder of the same radius and height 2r." },
    { question: "When would I need surface area?", answer: "Painting, plating, packaging, heat transfer, and membrane area all depend on surface area. It also matters biologically — small objects have high surface-area-to-volume ratios, which is why heat escapes faster from small bodies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Surface Area Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Surface Area Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Shape</label>
              <select value={shape} onChange={(e) => setShape(e.target.value as SaInput["shape"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="sphere">Sphere</option>
                <option value="cylinder">Cylinder</option>
                <option value="cone">Cone</option>
                <option value="cube">Cube</option>
                <option value="rectPrism">Rectangular Prism</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(shape === "sphere" || shape === "cylinder" || shape === "cone") && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Radius</label>
                  <div className={inp}><input type="number" value={r} onChange={(e) => setR(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
                </div>
              )}
              {(shape === "cylinder" || shape === "cone" || shape === "rectPrism") && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Height</label>
                  <div className={inp}><input type="number" value={h} onChange={(e) => setH(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
                </div>
              )}
              {(shape === "cube" || shape === "rectPrism") && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Length</label>
                  <div className={inp}><input type="number" value={l} onChange={(e) => setL(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
                </div>
              )}
              {shape === "rectPrism" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Width</label>
                  <div className={inp}><input type="number" value={w} onChange={(e) => setW(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">in</span></div>
                </div>
              )}
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Surface Area</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.area.toFixed(1)} <span className="text-xl font-bold text-muted-foreground">in²</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.sqFeet.toFixed(3)} ft² · {result.sqMeters.toFixed(4)} m² · {result.formulaLabel}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Square Feet", `${result.sqFeet.toFixed(3)} ft²`], ["Square Meters", `${result.sqMeters.toFixed(4)} m²`], ["SA:Volume", `${result.summaryStats[5].value}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.breakdown.length - 3 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Surface Area by Shape (same dimensions)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} in²`, ""]} />
                      <Bar dataKey="area" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Surface Area Formulas</h2>
            <p>Surface area is the sum of the areas of every face of a solid. Sphere: 4πr². Cylinder: 2πr² (two ends) + 2πrh (the wrapped lateral face). Cone: πr² + πrl where l = √(h² + r²) is the slant height. Cube: 6s². Rectangular prism: 2lw + 2lh + 2wh.</p>
            <h2 className="text-2xl font-bold mb-3">Archimedes' Beautiful Result</h2>
            <p>The sphere's surface area, 4πr², exactly matches the lateral area of its circumscribed cylinder — a result so important Archimedes asked for it engraved on his tomb. It also explains why the sphere is the most efficient shape: the least surface for a given volume.</p>
            <h2 className="text-2xl font-bold mb-3">Why Surface Area Matters</h2>
            <p>Heat loss, chemical reaction rates, paint coverage, and packaging cost all scale with surface area. The surface-area-to-volume ratio is fundamental in biology and engineering: smaller objects have proportionally more surface, which is why a cup of tea cools faster than a large pot.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/surface-area-calculator" />
          <PopularCalculators exclude="/calculator/surface-area-calculator" />
        </div>
      </div>
    </>
  );
}
