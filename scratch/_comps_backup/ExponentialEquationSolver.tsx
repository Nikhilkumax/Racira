"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer, Sigma, TrendingUp, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";

interface ExpResult {
  a: number;
  b: number;
  c: number;
  discriminant: number;
  root1: number;
  root2: number;
  hasRealRoots: boolean;
  yAtVertex: number;
  vertexX: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const DEFAULTS = {
  a: "2",
  b: "-5",
  c: "-3",
};

const calculate = (v: typeof DEFAULTS): ExpResult => {
  const a = parseFloat(v.a) || 0;
  const b = parseFloat(v.b) || 0;
  const c = parseFloat(v.c) || 0;

  if (a === 0) {
    const root1 = c !== 0 ? -c / b : 0;
    return {
      a, b, c, discriminant: 0, root1, root2: 0, hasRealRoots: c !== 0,
      yAtVertex: 0, vertexX: 0,
      chartData: [], breakdown: [], summaryStats: [],
    };
  }

  const discriminant = b * b - 4 * a * c;
  const hasRealRoots = discriminant >= 0;
  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
  const root1 = (-b + sqrtDisc) / (2 * a);
  const root2 = (-b - sqrtDisc) / (2 * a);
  const vertexX = -b / (2 * a);
  const yAtVertex = a * vertexX * vertexX + b * vertexX + c;

  const chartData = [
    { name: "Root 1", value: parseFloat(root1.toFixed(3)), fill: "#3b82f6" },
    { name: "Root 2", value: parseFloat(root2.toFixed(3)), fill: "#10b981" },
    { name: "Vertex Y", value: parseFloat(yAtVertex.toFixed(3)), fill: "#f59e0b" },
    { name: "Discriminant", value: parseFloat(discriminant.toFixed(3)), fill: "hsl(var(--primary))" },
  ];

  const breakdown = [
    { label: "Coefficient a", value: `${a.toFixed(2)}` },
    { label: "Coefficient b", value: `${b.toFixed(2)}` },
    { label: "Coefficient c", value: `${c.toFixed(2)}` },
    { label: "Equation", value: `${a.toFixed(1)}x² + ${b.toFixed(1)}x + ${c.toFixed(1)} = 0` },
    { label: "Discriminant (b² - 4ac)", value: `${discriminant.toFixed(3)}` },
    { label: "Has Real Roots", value: hasRealRoots ? "Yes" : "No" },
    { label: "Root 1 (x₁)", value: hasRealRoots ? `${root1.toFixed(4)}` : "Complex" },
    { label: "Root 2 (x₂)", value: hasRealRoots ? `${root2.toFixed(4)}` : "Complex" },
    { label: "Vertex X", value: `${vertexX.toFixed(4)}` },
    { label: "Vertex Y", value: `${yAtVertex.toFixed(4)}` },
    { label: "Axis of Symmetry", value: `x = ${vertexX.toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "Discriminant", value: `${discriminant.toFixed(3)}` },
    { label: "Root 1", value: hasRealRoots ? `${root1.toFixed(4)}` : "Complex" },
    { label: "Root 2", value: hasRealRoots ? `${root2.toFixed(4)}` : "Complex" },
    { label: "Vertex", value: `(${vertexX.toFixed(2)}, ${yAtVertex.toFixed(2)})` },
    { label: "Opens", value: a > 0 ? "Upward" : "Downward" },
  ];

  return {
    a, b, c, discriminant, root1, root2, hasRealRoots,
    yAtVertex, vertexX,
    chartData, breakdown, summaryStats,
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-popover border border-border p-2.5 rounded shadow text-xs">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p style={{ color: payload[0].payload.fill }}>{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function ExponentialEquationSolver() {
  const [vals, setVals] = useState(DEFAULTS);
  const [result, setResult] = useState<ExpResult | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(DEFAULTS));
  }, []);

  const handleCalculate = () => {
    setResult(calculate(vals));
  };

  const reset = () => {
    setVals(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const updateVal = (key: keyof typeof DEFAULTS, val: string) =>
    setVals((prev) => ({ ...prev, [key]: val }));

  const faqs = [
    { question: "What is the quadratic formula?", answer: "The quadratic formula solves equations of the form ax² + bx + c = 0. The solutions are x = (-b ± √(b² - 4ac)) / 2a. The expression under the square root (b² - 4ac) is called the discriminant." },
    { question: "What does the discriminant tell you?", answer: "The discriminant (b² - 4ac) determines the nature of the roots. If positive, there are two distinct real roots. If zero, there is one repeated real root. If negative, the roots are complex conjugates." },
    { question: "What is the vertex of a parabola?", answer: "The vertex is the maximum or minimum point of the parabola. Its x-coordinate is at x = -b/(2a), and the y-coordinate is found by substituting this x value back into the equation." },
    { question: "How do I know if the parabola opens up or down?", answer: "If the coefficient a is positive, the parabola opens upward (has a minimum). If a is negative, it opens downward (has a maximum). The magnitude of a controls how wide or narrow the parabola is." },
    { question: "Can a quadratic equation have no real solutions?", answer: "Yes, when the discriminant is negative (b² - 4ac < 0), the quadratic equation has no real roots. The solutions are complex numbers involving the imaginary unit i = √(-1)." },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Math", href: "/calculator#math" },
          { label: "Exponential Equation Solver" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Exponential Equation Solver
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-primary font-bold mb-2 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" /> Coefficients
              </h3>
              <p className="text-xs text-muted-foreground mb-3">Solves ax² + bx + c = 0</p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Coefficient a</label>
                  <input type="number" value={vals.a} onChange={(e) => updateVal("a", e.target.value)} className="input-calc" step="any" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Coefficient b</label>
                  <input type="number" value={vals.b} onChange={(e) => updateVal("b", e.target.value)} className="input-calc" step="any" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Coefficient c</label>
                  <input type="number" value={vals.c} onChange={(e) => updateVal("c", e.target.value)} className="input-calc" step="any" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleCalculate} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold flex items-center justify-center transition-colors">
                Calculate
              </button>
              <button onClick={reset} className="w-10 h-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {result && (
            <div className="flex flex-col gap-4">
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                <div className="flex justify-end absolute top-3 right-3">
                  <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                    <Printer className="h-3.5 w-3.5" /> Print
                  </button>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                  <Sigma className="h-3 w-3" /> Solutions
                </div>
                <div className="text-4xl font-bold text-primary mb-1">
                  {result.hasRealRoots
                    ? `x₁ = ${result.root1.toFixed(4)}, x₂ = ${result.root2.toFixed(4)}`
                    : "Complex Roots"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Discriminant: {result.discriminant.toFixed(3)} · Vertex: ({result.vertexX.toFixed(2)}, {result.yAtVertex.toFixed(2)})
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Discriminant</div>
                  <div className="text-lg font-bold text-foreground">{result.discriminant.toFixed(3)}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Root 1</div>
                  <div className="text-lg font-bold text-foreground">{result.hasRealRoots ? result.root1.toFixed(4) : "Complex"}</div>
                </div>
                <div className="bg-secondary/40 border border-border rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Root 2</div>
                  <div className="text-lg font-bold text-foreground">{result.hasRealRoots ? result.root2.toFixed(4) : "Complex"}</div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden bg-card">
                <table className="w-full text-base">
                  <thead className="bg-secondary/30 border-b border-border">
                    <tr>
                      <th className="text-left text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Parameter</th>
                      <th className="text-right text-xs uppercase text-muted-foreground font-semibold py-2.5 px-3">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.breakdown.map((r, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-semibold mb-3">Roots & Vertex</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((_, i) => (
                        <Cell key={i} fill={result.chartData[i].fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Solving Quadratic Equations</h2>
            <p>A quadratic equation is any equation that can be rearranged in standard form as ax² + bx + c = 0, where a, b, and c are known coefficients and x is the unknown variable. Quadratic equations appear throughout science, engineering, economics, and everyday life — from calculating projectile trajectories to optimizing profit margins.</p>

            <h3>1. The Quadratic Formula</h3>
            <p>The quadratic formula provides the exact solutions to any quadratic equation: x = (-b ± √(b² - 4ac)) / 2a. This formula works for all quadratic equations, whether the roots are real or complex. The term under the square root, b² - 4ac, is called the discriminant and determines the nature of the solutions.</p>

            <h3>2. The Discriminant</h3>
            <p>The discriminant (Δ = b² - 4ac) reveals the nature of the roots without solving the equation: (1) If Δ &gt; 0, there are two distinct real roots — the parabola crosses the x-axis at two points. (2) If Δ = 0, there is exactly one real root (a repeated root) — the parabola touches the x-axis at its vertex. (3) If Δ &lt; 0, there are no real roots — the parabola does not intersect the x-axis, and the solutions are complex numbers.</p>

            <h3>3. The Vertex and Graph</h3>
            <p>The vertex of the parabola y = ax² + bx + c is at the point (h, k) where h = -b/(2a) and k = f(h). The vertex represents the maximum value of the function if a &lt; 0 (parabola opens downward) or the minimum value if a &gt; 0 (parabola opens upward). The axis of symmetry is the vertical line x = h, which divides the parabola into two mirror-image halves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponential-equation-solver" />
          <PopularCalculators exclude="/calculator/exponential-equation-solver" />
        </div>
      </div>
    </>
  );
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "hsl(var(--primary))"];