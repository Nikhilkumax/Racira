"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PythInput {
  mode: "hypotenuse" | "leg";
  a: number;
  b: number;
  c: number;
}

interface PythResult {
  missingSide: number;
  a: number;
  b: number;
  c: number;
  a2: number;
  b2: number;
  c2: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcPyth(input: PythInput): PythResult {
  let a = input.a;
  let b = input.b;
  let c = input.c;
  let missingSide: number;

  if (input.mode === "hypotenuse") {
    c = Math.sqrt(a * a + b * b);
    missingSide = c;
  } else {
    b = Math.sqrt(Math.max(0, c * c - a * a));
    missingSide = b;
  }

  const chartData = [
    { name: "a", value: a, fill: "hsl(var(--primary))" },
    { name: "b", value: b, fill: "#10b981" },
    { name: "c", value: c, fill: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Solve For", value: input.mode === "hypotenuse" ? "Hypotenuse c (a² + b² = c²)" : "Leg b (a² + b² = c²)" },
    { label: "a", value: `${a}` },
    { label: "b", value: `${b}` },
    { label: "c (Hypotenuse)", value: `${c}` },
    { label: "a²", value: `${a * a}` },
    { label: "b²", value: `${b * b}` },
    { label: "c²", value: `${c * c}` },
    { label: "Check (a² + b²)", value: `${a * a + b * b}` },
  ];

  const summaryStats = [
    { label: "Missing Side", value: `${missingSide.toFixed(2)}` },
    { label: "a", value: `${a}` },
    { label: "b", value: `${b}` },
    { label: "c (Hypotenuse)", value: `${c}` },
    { label: "a² + b²", value: `${a * a + b * b}` },
    { label: "c²", value: `${c * c}` },
  ];

  return { missingSide, a, b, c, a2: a * a, b2: b * b, c2: c * c, chartData, breakdown, summaryStats };
}

const DEFAULTS: PythInput = { mode: "hypotenuse", a: 3, b: 4, c: 5 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function PythagoreanTheoremCalculator() {
  const [mode, setMode] = useState<PythInput["mode"]>(DEFAULTS.mode);
  const [a, setA] = useState(String(DEFAULTS.a));
  const [b, setB] = useState(String(DEFAULTS.b));
  const [c, setC] = useState(String(DEFAULTS.c));
  const [result, setResult] = useState<PythResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcPyth({ mode, a: parse(a, DEFAULTS.a), b: parse(b, DEFAULTS.b), c: parse(c, DEFAULTS.c) }));
  const reset = () => {
    setMode(DEFAULTS.mode);
    setA(String(DEFAULTS.a));
    setB(String(DEFAULTS.b));
    setC(String(DEFAULTS.c));
    setResult(calcPyth(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcPyth(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is the Pythagorean theorem?", answer: "In a right triangle, a² + b² = c², where c is the hypotenuse (the side opposite the right angle). Given two sides, the third follows: c = √(a² + b²), or a leg = √(c² − other²)." },
    { question: "When is the theorem valid?", answer: "Only for right triangles — exactly one 90° angle. For other triangles use the Law of Cosines, which reduces to the Pythagorean theorem when the included angle is 90°." },
    { question: "What are Pythagorean triples?", answer: "Whole-number solutions like 3-4-5, 5-12-13, and 8-15-17. Any triple scaled by a factor is also a triple (6-8-10). They are useful for construction layout — the 3-4-5 method squares corners." },
    { question: "How is this used in real life?", answer: "Construction and carpentry square corners (3-4-5 method), navigation and distance calculations, screen sizes (diagonal from width and height), and ramp or roof pitch computations all rely on the theorem." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Pythagorean Theorem Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Pythagorean Theorem Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div>
              <label className="text-sm font-medium mb-1 block">Solve For</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as PythInput["mode"])} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                <option value="hypotenuse">Hypotenuse c (given a, b)</option>
                <option value="leg">Leg b (given a, c)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Side a</label>
                <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
              </div>
              {mode === "hypotenuse" ? (
                <div>
                  <label className="text-sm font-medium mb-1 block">Side b</label>
                  <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
                </div>
              ) : (
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{mode === "hypotenuse" ? "Hypotenuse (c)" : "Missing Leg (b)"}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.missingSide.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.a}² + {result.b.toFixed(2)}² = {result.c.toFixed(2)}² · {result.a2} + {result.b2.toFixed(1)} = {result.c2.toFixed(1)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["a", `${result.a}`], ["b", `${result.b.toFixed(2)}`], ["c", `${result.c.toFixed(2)}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Side {l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
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
                      <Tooltip formatter={(v: number) => [`${v.toFixed(2)}`, ""]} />
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
            <h2 className="text-2xl font-bold mb-3">The Pythagorean Theorem</h2>
            <p>In a right triangle, the square of the hypotenuse equals the sum of the squares of the legs: a² + b² = c². It is one of the most-used results in geometry, proven by Euclid and known for millennia before him to the Babylonians and Egyptians.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Applications</h2>
            <p>Construction crews square corners with the 3-4-5 method; screen and TV sizes are quoted as the hypotenuse diagonal; GPS and surveying use it for distances; roofers and builders compute pitch and run with it daily.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond Right Triangles</h2>
            <p>The Law of Cosines — c² = a² + b² − 2ab·cos C — extends the theorem to all triangles. When C = 90°, cos C = 0 and it collapses back to the Pythagorean theorem, which is why the two are taught as a pair.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pythagorean-theorem-calculator" />
          <PopularCalculators exclude="/calculator/pythagorean-theorem-calculator" />
        </div>
      </div>
    </>
  );
}
