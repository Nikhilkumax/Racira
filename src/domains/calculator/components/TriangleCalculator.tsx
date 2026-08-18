"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface TriangleInput {
  a: number;
  b: number;
  c: number;
}

interface TriangleResult {
  valid: boolean;
  perimeter: number;
  semiperimeter: number;
  area: number;
  angleA: number;
  angleB: number;
  angleC: number;
  heightA: number;
  chartData: { name: string; side: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcTriangle(input: TriangleInput): TriangleResult {
  const valid = input.a + input.b > input.c && input.a + input.c > input.b && input.b + input.c > input.a;
  const perimeter = input.a + input.b + input.c;
  const semiperimeter = perimeter / 2;
  const area = valid ? Math.sqrt(semiperimeter * (semiperimeter - input.a) * (semiperimeter - input.b) * (semiperimeter - input.c)) : 0;
  const angleA = valid ? (Math.acos((input.b * input.b + input.c * input.c - input.a * input.a) / (2 * input.b * input.c)) * 180) / Math.PI : 0;
  const angleB = valid ? (Math.acos((input.a * input.a + input.c * input.c - input.b * input.b) / (2 * input.a * input.c)) * 180) / Math.PI : 0;
  const angleC = 180 - angleA - angleB;
  const heightA = input.a > 0 ? (2 * area) / input.a : 0;

  const chartData = [
    { name: "Side A", side: input.a, fill: "hsl(var(--primary))" },
    { name: "Side B", side: input.b, fill: "#10b981" },
    { name: "Side C", side: input.c, fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Side A", value: `${input.a}` },
    { label: "Side B", value: `${input.b}` },
    { label: "Side C", value: `${input.c}` },
    { label: "Valid Triangle", value: valid ? "Yes" : "No — violates triangle inequality" },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "Area (Heron's Formula)", value: `${area.toFixed(2)}` },
    { label: "Angle A (opposite a)", value: `${angleA.toFixed(1)}°` },
    { label: "Angle B (opposite b)", value: `${angleB.toFixed(1)}°` },
    { label: "Angle C (opposite c)", value: `${angleC.toFixed(1)}°` },
    { label: "Height to Side A", value: `${heightA.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Area", value: `${area.toFixed(2)}` },
    { label: "Perimeter", value: `${perimeter.toFixed(2)}` },
    { label: "Angle A", value: `${angleA.toFixed(1)}°` },
    { label: "Angle B", value: `${angleB.toFixed(1)}°` },
    { label: "Angle C", value: `${angleC.toFixed(1)}°` },
    { label: "Angles Sum", value: `${(angleA + angleB + angleC).toFixed(1)}°` },
  ];

  return { valid, perimeter, semiperimeter, area, angleA, angleB, angleC, heightA, chartData, breakdown, summaryStats };
}

const DEFAULTS: TriangleInput = { a: 3, b: 4, c: 5 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TriangleCalculator() {
  const [a, setA] = useState(String(DEFAULTS.a));
  const [b, setB] = useState(String(DEFAULTS.b));
  const [c, setC] = useState(String(DEFAULTS.c));
  const [result, setResult] = useState<TriangleResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcTriangle({ a: parse(a, DEFAULTS.a), b: parse(b, DEFAULTS.b), c: parse(c, DEFAULTS.c) }));
  const reset = () => {
    setA(String(DEFAULTS.a));
    setB(String(DEFAULTS.b));
    setC(String(DEFAULTS.c));
    setResult(calcTriangle(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcTriangle(DEFAULTS));
  }, []);

  const faqs = [
    { question: "When do three sides form a triangle?", answer: "The triangle inequality requires the sum of every pair of sides to exceed the third: a + b > c, a + c > b, and b + c > a. If violated, no triangle exists and the area is zero." },
    { question: "How is area calculated from three sides?", answer: "Heron's formula: area = √(s(s−a)(s−b)(s−c)), where s is the semiperimeter (a+b+c)/2. It gives the exact area from sides alone, with no angles needed." },
    { question: "How do I find the angles?", answer: "Use the Law of Cosines: cos A = (b² + c² − a²) ÷ 2bc, and similarly for B and C. This calculator derives all three angles from the sides, and they always sum to 180°." },
    { question: "What is the height of a triangle?", answer: "Height to a side = 2 × area ÷ side length. For side a, h = 2A/a. It is the perpendicular distance from the vertex to that side." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Triangle Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Triangle Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Side A</label>
                <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Side B</label>
                <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Side C</label>
                <div className={inp}><input type="number" value={c} onChange={(e) => setC(e.target.value)} className={ci} /></div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Triangle Area</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.valid ? `${result.area.toFixed(2)}` : "Invalid"}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.valid ? `Heron's formula · angles ${result.angleA.toFixed(0)}° / ${result.angleB.toFixed(0)}° / ${result.angleC.toFixed(0)}°` : "Sides violate the triangle inequality"}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Perimeter", `${result.perimeter.toFixed(2)}`], ["Angle C", `${result.angleC.toFixed(1)}°`], ["Height (to A)", `${result.heightA.toFixed(2)}`]].map(([l, v], i) => (
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
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-secondary/30 font-bold" : ""}`}>
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
                      <Bar dataKey="side" radius={[4, 4, 0, 0]}>
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
            <h2 className="text-2xl font-bold mb-3">Solving a Triangle From Its Sides</h2>
            <p>Given all three sides (SSS), everything else follows: area by Heron's formula, angles by the Law of Cosines, perimeter by summation, and heights from 2A ÷ side. This calculator solves the complete triangle from three side lengths.</p>
            <h2 className="text-2xl font-bold mb-3">The Law of Cosines</h2>
            <p>For sides a, b, c: cos C = (a² + b² − c²) ÷ 2ab. It generalizes the Pythagorean theorem to every triangle — when C = 90°, the cosine term vanishes and you recover a² + b² = c² exactly.</p>
            <h2 className="text-2xl font-bold mb-3">Heron's Formula</h2>
            <p>Heron's formula, area = √(s(s−a)(s−b)(s−c)) with s = perimeter ÷ 2, computes area from sides alone — no trigonometry required. It works for every triangle, including scalene and obtuse ones.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/triangle-calculator" />
          <PopularCalculators exclude="/calculator/triangle-calculator" />
        </div>
      </div>
    </>
  );
}
