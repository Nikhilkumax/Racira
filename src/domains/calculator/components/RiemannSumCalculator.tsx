"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

const FUNCS: Record<string, { label: string; fn: (x: number) => number; exact: (a: number, b: number) => number }> = {
  x2: { label: "f(x) = x²", fn: (x) => x * x, exact: (a, b) => (b ** 3 - a ** 3) / 3 },
  x3: { label: "f(x) = x³", fn: (x) => x * x * x, exact: (a, b) => (b ** 4 - a ** 4) / 4 },
  sin: { label: "f(x) = sin(x)", fn: (x) => Math.sin(x), exact: (a, b) => -Math.cos(b) + Math.cos(a) },
  sqrt: { label: "f(x) = √x", fn: (x) => Math.sqrt(Math.max(0, x)), exact: (a, b) => (2 / 3) * (Math.pow(Math.max(0, b), 1.5) - Math.pow(Math.max(0, a), 1.5)) },
};

interface RiemannResult {
  sum: number;
  exact: number;
  error: number;
  errorPct: number;
  chartData: { name: string; area: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcRiemann(a: number, b: number, n: number, method: string, funcKey: string): RiemannResult {
  const { fn, exact } = FUNCS[funcKey] ?? FUNCS.x2;
  const dx = (b - a) / n;
  let sum = 0;
  const rows: { x: number; f: number; area: number }[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * dx;
    const x1 = a + (i + 1) * dx;
    let x: number;
    if (method === "left") x = x0;
    else if (method === "right") x = x1;
    else if (method === "trapezoid") x = x0;
    else x = x0 + dx / 2; // midpoint
    const f = fn(x);
    const area = method === "trapezoid" ? ((fn(x0) + fn(x1)) / 2) * dx : f * dx;
    sum += area;
    rows.push({ x: x0 + dx / 2, f, area });
  }

  const exactVal = exact(a, b);
  const error = sum - exactVal;
  const errorPct = exactVal !== 0 ? (Math.abs(error) / Math.abs(exactVal)) * 100 : 0;

  const chartData = rows.map((r, i) => ({
    name: `R${i + 1}`,
    area: r.area,
    fill: i === n - 1 ? "hsl(var(--primary))" : i % 2 === 0 ? "#a3a3a3" : "#d4d4d4",
  }));

  const breakdown = [
    ...rows.map((r, i) => ({ label: `Rectangle ${i + 1} (x ≈ ${r.x.toFixed(3)})`, value: r.area.toFixed(4) })),
    { label: "Riemann Sum", value: sum.toFixed(4) },
    { label: "Exact Integral", value: exactVal.toFixed(4) },
    { label: "Absolute Error", value: error.toFixed(4) },
    { label: "Relative Error", value: `${errorPct.toFixed(3)}%` },
  ];

  const summaryStats = [
    { label: "Riemann Sum", value: sum.toFixed(4) },
    { label: "Exact Integral", value: exactVal.toFixed(4) },
    { label: "Error", value: error.toFixed(4) },
    { label: "Relative Error", value: `${errorPct.toFixed(3)}%` },
    { label: "Method", value: method === "trapezoid" ? "Trapezoidal" : method === "midpoint" ? "Midpoint" : method === "left" ? "Left endpoint" : "Right endpoint" },
    { label: "Rectangles (n)", value: `${n}` },
  ];

  return { sum, exact: exactVal, error, errorPct, chartData, breakdown, summaryStats };
}

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RiemannSumCalculator() {
  const [funcKey, setFuncKey] = useState("x2");
  const [a, setA] = useState("0");
  const [b, setB] = useState("2");
  const [n, setN] = useState("10");
  const [method, setMethod] = useState("midpoint");
  const [result, setResult] = useState<RiemannResult | null>(null);

  const calculate = () => {
    const lo = parseFloat(a);
    const hi = parseFloat(b);
    const count = Math.max(1, Math.min(100, Math.round(parseFloat(n) || 10)));
    setResult(calcRiemann(Number.isFinite(lo) ? lo : 0, Number.isFinite(hi) ? hi : 2, count, method, funcKey));
  };
  const reset = () => {
    setFuncKey("x2");
    setA("0");
    setB("2");
    setN("10");
    setMethod("midpoint");
    setResult(calcRiemann(0, 2, 10, "midpoint", "x2"));
  };
  useEffect(() => {
    setResult(calcRiemann(0, 2, 10, "midpoint", "x2"));
  }, []);

  const faqs = [
    { question: "What is a Riemann sum?", answer: "A Riemann sum approximates a definite integral by slicing the area under a curve into rectangles (or trapezoids), summing their areas. As the number of slices grows, the sum converges to the exact integral. It is the fundamental idea behind calculus — the integral is the limit of Riemann sums." },
    { question: "Which method is most accurate?", answer: "For smooth functions, the midpoint rule and trapezoidal rule converge much faster than left or right endpoints. The midpoint rule is typically the best rectangle choice: its error is about half the trapezoidal rule's, and both beat the one-sided rules, which systematically over- or under-estimate." },
    { question: "When does the sum equal the integral exactly?", answer: "Linear functions are integrated exactly by the trapezoidal rule with however many slices, and the midpoint rule also integrates linear functions exactly. For everything else, the approximation improves as n grows — doubling n typically quarters the error for midpoint and trapezoid." },
    { question: "What happens as n gets very large?", answer: "The Riemann sum converges to the exact value of the integral. This calculator caps n at 100 slices for display, which already gives high accuracy for the built-in functions — the midpoint rule with 100 slices on x² over [0,2] is correct to about six decimal places." },
    { question: "What functions are available?", answer: "x², x³, sin(x), and √x — each paired with its exact antiderivative so you can see the approximation error directly. The exact value is computed from the fundamental theorem of calculus, not numerically." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Riemann Sum Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Riemann Sum Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Function</label>
                <div className={inp}>
                  <select value={funcKey} onChange={(e) => setFuncKey(e.target.value)} className={ci}>
                    <option value="x2">f(x) = x²</option>
                    <option value="x3">f(x) = x³</option>
                    <option value="sin">f(x) = sin(x)</option>
                    <option value="sqrt">f(x) = √x</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Method</label>
                <div className={inp}>
                  <select value={method} onChange={(e) => setMethod(e.target.value)} className={ci}>
                    <option value="left">Left endpoint</option>
                    <option value="right">Right endpoint</option>
                    <option value="midpoint">Midpoint</option>
                    <option value="trapezoid">Trapezoidal</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Lower bound (a)</label>
                <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Upper bound (b)</label>
                <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Number of Rectangles (n)</label>
              <div className={inp}><input type="number" value={n} onChange={(e) => setN(e.target.value)} className={ci} min={1} max={100} step={1} /></div>
              <p className="text-xs text-muted-foreground mt-1">Capped at 100 slices. Higher n = closer to the exact integral.</p>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Riemann Sum (∫ f dx)</div>
                  <div className="text-4xl font-extrabold tracking-tight">{result.sum.toFixed(4)}</div>
                  <div className="text-sm text-muted-foreground mt-1">Exact integral: {result.exact.toFixed(4)} · error: {result.errorPct.toFixed(3)}%</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Riemann Sum", result.sum.toFixed(4)], ["Exact Integral", result.exact.toFixed(4)], ["Error", `${result.errorPct.toFixed(2)}%`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Rectangle Areas</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={Math.ceil(result.chartData.length / 12)} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v.toFixed(4), "Area"]} />
                      <ReferenceLine y={result.exact / result.chartData.length} stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: "Exact avg height", position: "insideTopRight", fontSize: 10, fill: "hsl(var(--primary))" }} />
                      <Bar dataKey="area" radius={[3, 3, 0, 0]}>
                        {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">The bars sum to the Riemann sum; the dashed line marks the average height of the exact integral.</p>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === result.chartData.length ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
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
            <h2 className="text-2xl font-bold mb-3">The Riemann Sum and the Definite Integral</h2>
            <p>The definite integral ∫ₐᵇ f(x) dx is defined as the limit of Riemann sums: slice the interval into n pieces, approximate the area of each slice with a rectangle (or trapezoid), and let n grow without bound. Every numerical integration technique in science and engineering — from physics simulations to option pricing — is a sophisticated descendant of this idea.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Method</h2>
            <p>Left and right endpoint rules use the function value at one edge of each slice; they converge slowly and systematically bias the result. The midpoint rule samples the center of each slice, and the trapezoidal rule averages the two edges. Both are second-order accurate: doubling n shrinks their error by a factor of four, versus only two for the one-sided rules.</p>
            <h2 className="text-2xl font-bold mb-3">Measuring the Error</h2>
            <p>This calculator compares each approximation against the exact integral computed from antiderivatives — b³/3 for x², b⁴/4 for x³, −cos(x) for sin(x), and 2/3·x^(3/2) for √x — so you can watch the approximation converge as n increases and confirm which method wins for smooth curves.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/riemann-sum-calculator" />
          <PopularCalculators exclude="/calculator/riemann-sum-calculator" />
        </div>
      </div>
    </>
  );
}
