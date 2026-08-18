"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Shape = "sphere" | "cylinder" | "cone" | "cube" | "rectPrism";

interface VolumeInput {
  shape: Shape;
  r: number;
  h: number;
  l: number;
  w: number;
}

interface VolumeResult {
  volume: number;
  liters: number;
  gallons: number;
  formulaLabel: string;
  chartData: { name: string; volume: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const SHAPE_LABELS: Record<Shape, string> = {
  sphere: "Sphere (V = 4/3πr³)",
  cylinder: "Cylinder (V = πr²h)",
  cone: "Cone (V = 1/3πr²h)",
  cube: "Cube (V = s³)",
  rectPrism: "Rectangular Prism (V = lwh)",
};

function volumeFor(shape: Shape, r: number, h: number, l: number, w: number): number {
  switch (shape) {
    case "sphere": return (4 / 3) * Math.PI * Math.pow(r, 3);
    case "cylinder": return Math.PI * r * r * h;
    case "cone": return (1 / 3) * Math.PI * r * r * h;
    case "cube": return Math.pow(l, 3);
    case "rectPrism": return l * w * h;
  }
}

function calcVolume(input: VolumeInput): VolumeResult {
  const volume = volumeFor(input.shape, input.r, input.h, input.l, input.w);
  const liters = volume * 0.0163871; // in³ to L
  const gallons = volume * 0.004329; // in³ to US gal

  const others: [string, number][] = [
    ["Sphere", volumeFor("sphere", input.r, 0, 0, 0)],
    ["Cylinder", volumeFor("cylinder", input.r, input.h, 0, 0)],
    ["Cone", volumeFor("cone", input.r, input.h, 0, 0)],
    ["Cube", volumeFor("cube", 0, 0, input.l, 0)],
    ["Rect Prism", volumeFor("rectPrism", 0, input.h, input.l, input.w)],
  ];

  const chartData = others.map(([name, v]) => ({
    name,
    volume: Number(v.toFixed(1)),
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
    { label: "Volume", value: `${volume.toFixed(1)} in³` },
    { label: "Volume (Liters)", value: `${liters.toFixed(2)} L` },
    { label: "Volume (Gallons)", value: `${gallons.toFixed(2)} gal` },
  ];

  const summaryStats = [
    { label: "Volume", value: `${volume.toFixed(1)} in³` },
    { label: "Liters", value: `${liters.toFixed(2)} L` },
    { label: "Gallons", value: `${gallons.toFixed(2)} gal` },
    { label: "Cubic Feet", value: `${(volume / 1728).toFixed(3)} ft³` },
    { label: "Milliliters", value: `${(liters * 1000).toFixed(0)} mL` },
    { label: "Shape", value: SHAPE_LABELS[input.shape].split(" ")[0] },
  ];

  return { volume, liters, gallons, formulaLabel: SHAPE_LABELS[input.shape], chartData, breakdown, summaryStats };
}

const DEFAULTS: VolumeInput = { shape: "sphere", r: 5, h: 10, l: 5, w: 4 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function VolumeCalculator() {
  const [shape, setShape] = useState<VolumeInput["shape"]>(DEFAULTS.shape);
  const [r, setR] = useState(String(DEFAULTS.r));
  const [h, setH] = useState(String(DEFAULTS.h));
  const [l, setL] = useState(String(DEFAULTS.l));
  const [w, setW] = useState(String(DEFAULTS.w));
  const [result, setResult] = useState<VolumeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcVolume({ shape, r: parse(r, DEFAULTS.r), h: parse(h, DEFAULTS.h), l: parse(l, DEFAULTS.l), w: parse(w, DEFAULTS.w) }));
  const reset = () => {
    setShape(DEFAULTS.shape);
    setR(String(DEFAULTS.r));
    setH(String(DEFAULTS.h));
    setL(String(DEFAULTS.l));
    setW(String(DEFAULTS.w));
    setResult(calcVolume(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcVolume(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I calculate the volume of a sphere?", answer: "V = 4/3 × π × r³, where r is the radius. A sphere of radius 5 in has volume 4/3 × π × 125 ≈ 523.6 in³ (about 8.6 liters)." },
    { question: "Why is the cone one-third of the cylinder?", answer: "Cavalieri's principle shows that a cone and pyramid occupy exactly one-third of their circumscribed cylinder or prism. V = 1/3 × πr²h follows directly." },
    { question: "How do I convert volume units?", answer: "1 in³ = 16.3871 mL = 0.01639 L = 0.004329 US gallons. This calculator reports in³, liters, gallons, and cubic feet so you can switch freely." },
    { question: "Which formula should I use for an irregular shape?", answer: "Irregular objects are best measured by water displacement (Archimedes' principle): the volume of water displaced equals the object's volume. The formulas here cover standard geometric solids." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Volume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Volume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Shape</label>
              <select value={shape} onChange={(e) => setShape(e.target.value as VolumeInput["shape"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Volume</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.volume.toFixed(1)} <span className="text-xl font-bold text-muted-foreground">in³</span></div>
                  <div className="text-sm text-muted-foreground mt-1">{result.liters.toFixed(2)} L · {result.gallons.toFixed(2)} gal · {result.formulaLabel}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Liters", `${result.liters.toFixed(2)} L`], ["Gallons", `${result.gallons.toFixed(2)} gal`], ["Cubic Feet", `${(result.volume / 1728).toFixed(3)} ft³`]].map(([l, v], i) => (
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
                  <h3 className="text-base font-bold mb-4">Volume by Shape (same dimensions)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [`${v.toFixed(1)} in³`, ""]} />
                      <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Volume Formulas</h2>
            <p>Volume measures the space a solid occupies. Standard formulas: sphere 4/3πr³, cylinder πr²h, cone 1/3πr²h, cube s³, and rectangular prism lwh. All dimensions are in consistent units — this calculator uses inches, then converts to liters, gallons, and cubic feet.</p>
            <h2 className="text-2xl font-bold mb-3">The One-Third Relationship</h2>
            <p>A cone holds exactly one-third of its circumscribed cylinder — a fact proven by Cavalieri's principle. The same relationship holds between a pyramid and its prism. This is why cone and pyramid formulas always carry the 1/3 factor.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Uses</h2>
            <p>Volume calculations size aquariums, pools, tanks, packaging, and concrete pours. When exact shape formulas don't apply, water displacement — the rise in water level when an object is submerged — measures volume directly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/volume-calculator" />
          <PopularCalculators exclude="/calculator/volume-calculator" />
        </div>
      </div>
    </>
  );
}
