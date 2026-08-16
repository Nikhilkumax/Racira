"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Radical } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface CubeResult {
  x: number;
  cubeRoot: number;
  cube: number;
  sign: string;
  chartData: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcCube(xInput: number, rootN: number): CubeResult {
  const x = xInput;
  const n = Math.max(2, Math.round(rootN));
  const cubeRoot = x >= 0 ? Math.pow(x, 1 / n) : -Math.pow(Math.abs(x), 1 / n);
  const cube = Math.pow(cubeRoot, n);

  const chartData: { x: number; y: number }[] = [];
  for (let i = -20; i <= 20; i += 0.5) {
    const y = i >= 0 ? Math.pow(i, 1 / n) : -Math.pow(Math.abs(i), 1 / n);
    chartData.push({ x: i, y });
  }

  const breakdown = [
    { label: "Input", value: `${x}` },
    { label: `${n}-th Root`, value: `${cubeRoot.toFixed(6)}` },
    { label: "Verification (rootⁿ)", value: `${cube.toFixed(6)}` },
    { label: "Sign", value: x < 0 ? "Negative (odd root)" : x > 0 ? "Positive" : "Zero" },
    { label: "Cube of Root", value: `${Math.round(cubeRoot * cubeRoot * cubeRoot).toLocaleString()} (≈ input)` },
    { label: "Root Type", value: n === 3 ? "Cube root" : `${n}-th root` },
  ];

  const summaryStats = [
    { label: `∛(${x})` , value: `${cubeRoot.toFixed(6)}` },
    { label: "Root", value: `${cubeRoot.toFixed(6)}` },
    { label: "Input", value: `${x}` },
    { label: "Rootⁿ", value: `${cube.toFixed(4)}` },
    { label: "Domain", value: "All real numbers" },
    { label: "Note", value: "Odd roots of negatives are real" },
  ];

  return { x, cubeRoot, cube, sign: x < 0 ? "negative" : x > 0 ? "positive" : "zero", chartData, breakdown, summaryStats };
}

const DEFAULTS = { x: "27", n: "3" };

export default function CubeRootCalculator() {
  const [x, setX] = useState(DEFAULTS.x);
  const [n, setN] = useState(DEFAULTS.n);
  const [result, setResult] = useState<CubeResult>(() => calcCube(27, 3));

  useEffect(() => {
    const xi = parseFloat(x);
    const ni = parseInt(n, 10);
    if (!isNaN(xi) && !isNaN(ni) && ni >= 2) setResult(calcCube(xi, ni));
  }, [x, n]);

  const reset = () => { setX(DEFAULTS.x); setN(DEFAULTS.n); };
  const invalid = isNaN(parseFloat(x)) || isNaN(parseInt(n, 10)) || parseInt(n, 10) < 2;

  const faqs = [
    { question: "What is a cube root?", answer: "The cube root of a number x is the value that, cubed, equals x: ∛27 = 3 because 3³ = 27. Unlike square roots, cube roots are defined for negative numbers too (∛−8 = −2)." },
    { question: "How do you compute a cube root without a calculator?", answer: "Use estimation and refinement: 27 lies between 3³ and 4³, so ∛27 is between 3 and 4. Newton's method converges quickly for more digits." },
    { question: "What are n-th roots?", answer: "The n-th root is the value that, raised to the n-th power, equals the input. Even roots of negatives are not real; odd roots are always real." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Cube Root Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cube Root Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="crx" className="block text-sm font-medium mb-1 text-foreground">Number</label>
                <input id="crx" type="number" step="any" value={x} onChange={(e) => setX(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="crn" className="block text-sm font-medium mb-1 text-foreground">Root Degree (n)</label>
                <input id="crn" type="number" min="2" value={n} onChange={(e) => setN(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">n = 3 gives the cube root; any n ≥ 2 works. Negative inputs are supported for odd roots.</p>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Radical className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid number and a root degree of at least 2.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{n === "3" ? "Cube Root" : `${n}-th Root`}</div>
              <div className="text-4xl font-extrabold text-primary">{result.cubeRoot.toFixed(6)}</div>
              <div className="text-sm text-muted-foreground mt-1">∛{result.x} · verification: {result.cubeRoot.toFixed(3)}^{n} ≈ {result.cube.toFixed(4)}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Input</div>
                <div className="text-lg font-bold text-primary">{result.x}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Root</div>
                <div className="text-lg font-bold text-primary">{result.cubeRoot.toFixed(6)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Rootⁿ</div>
                <div className="text-lg font-bold text-primary">{result.cube.toFixed(4)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.breakdown.map((row) => (
                    <tr key={row.label}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Root Function Curve</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(3)}`, "Root value"]} labelFormatter={(l: number) => `x = ${l}`} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Cube Root Calculator</h2>
            <p>A cube root answers the question "what number, cubed, gives this value?" — ∛27 = 3 because 3 × 3 × 3 = 27. Cube roots differ from square roots in a key way: they exist for negative numbers, since an odd power preserves sign.</p>
            <h3>Uses in Math and Science</h3>
            <p>Cube roots appear in volume scaling (tripling an edge multiplies volume by 27), cubic equations, and physics formulas involving volume and density. The n-th root version generalizes the concept to any degree.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cube-root-calculator" />
          <PopularCalculators exclude="/calculator/cube-root-calculator" />
        </div>
      </div>
    </>
  );
}
