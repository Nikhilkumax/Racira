"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, FunctionSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface QuadraticInputs {
  a: string;
  b: string;
  c: string;
}

interface QuadraticResult {
  a: number;
  b: number;
  c: number;
  h: number;
  k: number;
  vertexForm: string;
  vertexX: number;
  vertexY: number;
  discriminant: number;
  axis: string;
  roots: string[];
  chartData: { x: number; y: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation: ax² + bx + c = a(x − h)² + k ─────────────────────
const fmt = (n: number, d = 3) => n.toLocaleString("en-US", { maximumFractionDigits: d });

function fmtTerm(n: number): string {
  if (n === 0) return "";
  return `${n < 0 ? "− " : "+ "}${fmt(Math.abs(n), 3)}`;
}

function fmtSq(inner: string, a: number): string {
  const leading = a === 1 ? "" : a === -1 ? "−" : `${fmt(a, 3)}`;
  return `${leading}(${inner})²`;
}

function calculateQuadratic(inputs: QuadraticInputs): QuadraticResult {
  const empty: QuadraticResult = {
    a: 0, b: 0, c: 0, h: 0, k: 0, vertexForm: "", vertexX: 0, vertexY: 0,
    discriminant: 0, axis: "", roots: [], chartData: [], isError: true,
  };
  const a = parseFloat(inputs.a);
  const b = parseFloat(inputs.b);
  const c = parseFloat(inputs.c);
  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    return { ...empty, errorMsg: "Please enter valid numbers for a, b, and c." };
  }
  if (a === 0) {
    return { ...empty, errorMsg: "'a' cannot be zero — this is a linear equation, not a quadratic." };
  }

  const h = -b / (2 * a);
  const k = c - (b * b) / (4 * a);
  const discriminant = b * b - 4 * a * c;

  // Vertex form string: a(x − h)² + k — the binomial is (x − h), so x + (−h)
  const inner = h === 0 ? "x" : `x ${fmtTerm(-h)}`;
  const signK = k < 0 ? ` − ${fmt(Math.abs(k), 3)}` : k > 0 ? ` + ${fmt(k, 3)}` : "";
  const vertexForm = `${fmtSq(inner, a)}${signK}`.replace(/^\+ /, "");

  // Roots
  const roots: string[] = [];
  if (discriminant > 0) {
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    roots.push(`x = ${fmt(r1, 4)}`, `x = ${fmt(r2, 4)}`);
  } else if (discriminant === 0) {
    roots.push(`x = ${fmt(-b / (2 * a), 4)} (double root)`);
  } else {
    roots.push("No real roots");
  }

  // Parabola points around the vertex
  const chartData: { x: number; y: number }[] = [];
  for (let i = -5; i <= 5; i++) {
    const x = h + i;
    chartData.push({ x: +x.toFixed(2), y: +(a * x * x + b * x + c).toFixed(3) });
  }

  return {
    a, b, c, h, k, vertexForm, vertexX: h, vertexY: k, discriminant,
    axis: `x = ${fmt(h, 3)}`,
    roots, chartData, isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: QuadraticInputs = { a: "1", b: "6", c: "5" };

const CompactInput = ({
  id, label, value, onChange,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const CompletingTheSquareCalculator = () => {
  const [inputs, setInputs] = useState<QuadraticInputs>(DEFAULTS);
  const [result, setResult] = useState<QuadraticResult>(() => calculateQuadratic(DEFAULTS));

  useEffect(() => {
    setResult(calculateQuadratic(DEFAULTS));
  }, []);

  const handleChange = (key: keyof QuadraticInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateQuadratic(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateQuadratic(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What does completing the square mean?", answer: "Completing the square rewrites a quadratic ax² + bx + c as a(x − h)² + k, where (h, k) is the vertex of the parabola. It is a standard algebraic technique used to solve quadratics, derive the quadratic formula, and rewrite circles and ellipses in center-radius form." },
    { question: "How do I find the vertex?", answer: "The x-coordinate of the vertex is h = −b/(2a). Substitute it back into the original equation to get k. With x² + 6x + 5, h = −6/(2·1) = −3 and k = 5 − 36/4 = −4, so the vertex is (−3, −4) and the vertex form is (x + 3)² − 4." },
    { question: "Why is vertex form useful?", answer: "Vertex form exposes the parabola's turning point and its minimum or maximum value instantly. If a > 0 the parabola opens upward and k is the minimum; if a < 0 it opens downward and k is the maximum. It also makes graphing straightforward — translate y = x² by h horizontally and k vertically." },
    { question: "What does the discriminant tell me?", answer: "The discriminant b² − 4ac reveals the roots: positive means two distinct real roots, zero means one repeated real root, and negative means no real roots (two complex roots). With x² + 6x + 5, the discriminant is 36 − 20 = 16, so the parabola crosses the x-axis at x = −1 and x = −5." },
    { question: "When is completing the square used in real life?", answer: "Physics uses it to find maximum height or range of projectiles, economics uses it to locate profit-maximizing output, and engineering uses it to analyze the shape of suspension cables and arches — any situation where a quadratic model's peak or valley matters." },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Completing the Square Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Completing the Square Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-3 gap-3">
              <CompactInput id="coef-a" label="a (x²)" value={inputs.a} onChange={(v) => handleChange("a", v)} />
              <CompactInput id="coef-b" label="b (x)" value={inputs.b} onChange={(v) => handleChange("b", v)} />
              <CompactInput id="coef-c" label="c (const)" value={inputs.c} onChange={(v) => handleChange("c", v)} />
            </div>
            <p className="text-xs text-muted-foreground -mt-1">For the quadratic <span className="font-semibold">ax² + bx + c</span></p>

            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 print-section">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Vertex Form</div>
                  <div className="text-2xl md:text-4xl font-bold text-primary break-words">
                    {result.vertexForm}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Vertex: ({fmt(result.vertexX, 3)}, {fmt(result.vertexY, 3)}) · Axis: {result.axis}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Vertex X (h)", value: fmt(result.h, 3), color: "text-primary" },
                    { label: "Vertex Y (k)", value: fmt(result.k, 3), color: "text-primary" },
                    { label: "Discriminant", value: fmt(result.discriminant, 3), color: result.discriminant > 0 ? "text-emerald-600" : result.discriminant < 0 ? "text-red-500" : "text-amber-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Quadratic Analysis</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Standard Form", value: `${fmt(result.a, 3)}x² ${fmtTerm(result.b)}x ${result.c < 0 ? `− ${fmt(Math.abs(result.c), 3)}` : `+ ${fmt(result.c, 3)}`}` },
                        { label: "Vertex Form", value: result.vertexForm, highlight: true },
                        { label: "Vertex (h, k)", value: `(${fmt(result.h, 3)}, ${fmt(result.k, 3)})` },
                        { label: "Axis of Symmetry", value: result.axis },
                        { label: "Discriminant (b² − 4ac)", value: fmt(result.discriminant, 3) },
                        { label: "Opens", value: result.a > 0 ? "Upward (minimum)" : "Downward (maximum)" },
                        { label: "Roots", value: result.roots.join("; ") },
                      ].map((r, i) => (
                        <tr key={i} className={`border-b last:border-0 ${r.highlight ? "bg-primary/10 font-bold" : ""}`}>
                          <td className="py-2.5 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 text-right font-semibold">{r.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 4. Chart */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Parabola Plot</h3>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="x" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number, name: string) => [String(value), name === "y" ? "y" : name]}
                          labelFormatter={(l) => `x = ${l}`}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <ReferenceLine x={result.h} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <ReferenceDot x={result.h} y={result.k} r={5} fill="hsl(var(--primary))" stroke="#fff" />
                        <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">The dot marks the vertex ({fmt(result.h, 2)}, {fmt(result.k, 2)}); the dashed vertical line is the axis of symmetry.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "a", value: fmt(result.a, 3) },
                      { label: "b", value: fmt(result.b, 3) },
                      { label: "c", value: fmt(result.c, 3) },
                      { label: "Vertex X (h)", value: fmt(result.h, 3) },
                      { label: "Vertex Y (k)", value: fmt(result.k, 3) },
                      { label: "Discriminant", value: fmt(result.discriminant, 3) },
                      { label: "Axis of Symmetry", value: result.axis },
                      { label: "Min/Max Value", value: fmt(result.k, 3) },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between">
                        <span className="text-muted-foreground">{s.label}:</span>
                        <span className="font-semibold">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is Completing the Square?</h2>
            <p>Completing the square is an algebraic technique that rewrites a quadratic expression ax² + bx + c in the form <strong>a(x − h)² + k</strong>. The new form reveals the parabola's vertex (h, k) directly — the turning point where the graph reaches its minimum or maximum. It is the standard method for solving quadratics without the quadratic formula and for converting circles and ellipses into center-radius form.</p>

            <h2 className="text-2xl font-bold mb-3">How the Calculator Works</h2>
            <p>Enter the coefficients a, b, and c of your quadratic. The calculator computes h = −b/(2a) and k = c − b²/(4a), builds the vertex form, and reports the vertex, axis of symmetry, discriminant, and roots. With x² + 6x + 5, the result is (x + 3)² − 4, meaning the parabola's vertex sits at (−3, −4) and it crosses the x-axis at x = −1 and x = −5.</p>

            <h2 className="text-2xl font-bold mb-3">Why Vertex Form Matters</h2>
            <p>The vertex is the most informative point on a parabola. For a projectile, it is the maximum height; for a profit function, the profit-maximizing output; for an arch, the peak of the span. Because a(x − h)² + k shows the vertex explicitly, it turns a three-term expression into a description of shape: h shifts the graph horizontally, k vertically, and a controls how steeply it opens.</p>

            <h2 className="text-2xl font-bold mb-3">The Discriminant and Roots</h2>
            <p>The discriminant b² − 4ac tells you how the parabola meets the x-axis before you ever solve for roots. Positive: two real roots (the graph crosses twice). Zero: one repeated root (the vertex touches the axis). Negative: no real roots (the graph never crosses). This calculator reports all of it in one view, with a plot of the parabola and its vertex marked for visual confirmation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/completing-the-square-calculator" />
          <PopularCalculators exclude="/calculator/completing-the-square-calculator" />
        </div>
      </div>
    </>
  );
};

export default CompletingTheSquareCalculator;
