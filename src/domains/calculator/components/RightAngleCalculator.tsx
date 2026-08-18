"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

type Mode = "legs" | "legHyp" | "hypLeg";

interface RightInput {
  mode: Mode;
  a: number;
  b: number;
  c: number;
}

interface RightResult {
  a: number;
  b: number;
  c: number;
  angleA: number;
  angleB: number;
  area: number;
  perimeter: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRight(input: RightInput): RightResult {
  let a = input.a, b = input.b, c = input.c;
  if (input.mode === "legs") {
    c = Math.sqrt(a * a + b * b);
  } else if (input.mode === "legHyp") {
    b = Math.sqrt(Math.max(0, c * c - a * a));
  } else {
    a = Math.sqrt(Math.max(0, c * c - b * b));
  }

  const angleA = c > 0 ? (Math.asin(a / c) * 180) / Math.PI : 0;
  const angleB = 90 - angleA;
  const area = (a * b) / 2;
  const perimeter = a + b + c;

  const chartData = [
    { name: "Leg a", value: Number(a.toFixed(2)), fill: "hsl(var(--primary))" },
    { name: "Leg b", value: Number(b.toFixed(2)), fill: "#10b981" },
    { name: "Hypotenuse c", value: Number(c.toFixed(2)), fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Solve Mode", value: input.mode === "legs" ? "Two legs given" : input.mode === "legHyp" ? "Leg a + hypotenuse given" : "Leg b + hypotenuse given" },
    { label: "Leg a", value: `${a.toFixed(2)}` },
    { label: "Leg b", value: `${b.toFixed(2)}` },
    { label: "Hypotenuse c", value: `${c.toFixed(2)}` },
    { label: "Angle A (opposite a)", value: `${angleA.toFixed(1)}°` },
    { label: "Angle B (opposite b)", value: `${angleB.toFixed(1)}°` },
    { label: "Right Angle C", value: "90°" },
    { label: "Area (a·b ÷ 2)", value: `${area.toFixed(2)}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Hypotenuse c", value: `${c.toFixed(2)}` },
    { label: "Angle A", value: `${angleA.toFixed(1)}°` },
    { label: "Angle B", value: `${angleB.toFixed(1)}°` },
    { label: "Area", value: `${area.toFixed(2)}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "a² + b²", value: `${(a * a + b * b).toFixed(2)}` },
  ];

  return { a, b, c, angleA, angleB, area, perimeter, chartData, breakdown, summaryStats };
}

const DEFAULTS: RightInput = { mode: "legs", a: 3, b: 4, c: 5 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RightAngleCalculator() {
  const [mode, setMode] = useState<RightInput["mode"]>(DEFAULTS.mode);
  const [a, setA] = useState(String(DEFAULTS.a));
  const [b, setB] = useState(String(DEFAULTS.b));
  const [c, setC] = useState(String(DEFAULTS.c));
  const [result, setResult] = useState<RightResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcRight({ mode, a: parse(a, DEFAULTS.a), b: parse(b, DEFAULTS.b), c: parse(c, DEFAULTS.c) }));
  const reset = () => {
    setMode(DEFAULTS.mode);
    setA(String(DEFAULTS.a));
    setB(String(DEFAULTS.b));
    setC(String(DEFAULTS.c));
    setResult(calcRight(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcRight(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is a right triangle?", answer: "A right triangle has one 90° angle. The side opposite it is the hypotenuse — always the longest side. The other two sides are the legs. Pythagoras' theorem (a² + b² = c²) links all three." },
    { question: "How do I find the angles?", answer: "From the side ratio: angle A = arcsin(a ÷ c), and since the angles sum to 180° with one being 90°, angle B = 90° − A. Trigonometric ratios (sin, cos, tan) follow from the same sides." },
    { question: "What are the special right triangles?", answer: "The 3-4-5 (and its multiples, like 6-8-10) and the isosceles 1-1-√2 and 1-√3-2 triangles. Knowing them lets you spot right triangles and compute missing sides instantly without calculation." },
    { question: "How is area calculated?", answer: "Area = (leg a × leg b) ÷ 2 — the two legs are the base and height since they meet at the right angle. Perimeter is simply a + b + c." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Right Angle Triangle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Right Angle Triangle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Known Values</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as RightInput["mode"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="legs">Two legs (a, b)</option>
                <option value="legHyp">Leg a + Hypotenuse c</option>
                <option value="hypLeg">Leg b + Hypotenuse c</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mode !== "hypLeg" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Leg a</label>
                  <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
                </div>
              )}
              {mode !== "legHyp" && mode !== "legs" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Leg b</label>
                  <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
                </div>
              )}
              {mode === "legs" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Leg b</label>
                  <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
                </div>
              )}
              {mode !== "legs" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Hypotenuse c</label>
                  <div className={inp}><input type="number" value={c} onChange={(e) => setC(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Solved Right Triangle</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary break-all">a = {result.a.toFixed(2)} · b = {result.b.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">c = {result.c.toFixed(2)} · angles {result.angleA.toFixed(1)}° / {result.angleB.toFixed(1)}° / 90°</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Hypotenuse", `${result.c.toFixed(2)}`], ["Area", `${result.area.toFixed(2)}`], ["Perimeter", `${result.perimeter.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Triangle Breakdown</h3>
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
                  <h3 className="text-base font-bold mb-4">Side Lengths</h3>
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
            <h2 className="text-2xl font-bold mb-3">Solving Right Triangles</h2>
            <p>Any two values of a right triangle determine the rest. Given two legs, the hypotenuse follows from Pythagoras; given a leg and the hypotenuse, the other leg follows by rearrangement. Angles come from the arcsin of side ratios, and area is half the product of the legs.</p>
            <h2 className="text-2xl font-bold mb-3">Trigonometry Connections</h2>
            <p>In a right triangle, sin A = opposite ÷ hypotenuse, cos A = adjacent ÷ hypotenuse, and tan A = opposite ÷ adjacent. These ratios are the foundation of surveying, navigation, and physics — every vector decomposition is a right triangle.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Ramps must meet specific rise-to-run ratios, roofs need pitch angles, and screen sizes use the diagonal. Construction workers square corners with the 3-4-5 method — the fastest real-world use of the theorem.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/right-angle-calculator" />
          <PopularCalculators exclude="/calculator/right-angle-calculator" />
        </div>
      </div>
    </>
  );
}
