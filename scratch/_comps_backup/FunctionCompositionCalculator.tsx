"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, FunctionSquare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";

// Safe polynomial evaluator: accepts terms like "3x^2", "-2x", "5", "+4x^3", separated by +/-
// e.g. "2x^2 + 3x - 5". No eval() — parsed term-by-term.
function parsePoly(expr: string): { coeffs: number[] } | null {
  const cleaned = expr.replace(/\s+/g, "").replace(/−/g, "-");
  if (!/^[0-9x^+\-.]+$/.test(cleaned) || cleaned === "") return null;
  const terms = cleaned.split(/(?=[+-])/).filter(Boolean);
  const coeffs: number[] = [];
  for (const raw of terms) {
    if (!raw) continue;
    let m = raw.match(/^([+-]?\d*\.?\d*)\*?x\^(\d+)$/);
    if (m) {
      const c = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : parseFloat(m[1]);
      const p = parseInt(m[2], 10);
      coeffs[p] = (coeffs[p] || 0) + c;
      continue;
    }
    m = raw.match(/^([+-]?\d*\.?\d*)\*?x$/);
    if (m) {
      const c = m[1] === "" || m[1] === "+" ? 1 : m[1] === "-" ? -1 : parseFloat(m[1]);
      coeffs[1] = (coeffs[1] || 0) + c;
      continue;
    }
    m = raw.match(/^([+-]?\d+\.?\d*)$/);
    if (m) {
      coeffs[0] = (coeffs[0] || 0) + parseFloat(m[1]);
      continue;
    }
    return null;
  }
  return { coeffs };
}

function evalPoly(coeffs: number[], x: number): number {
  let sum = 0;
  for (let p = 0; p < coeffs.length; p++) {
    if (coeffs[p]) sum += coeffs[p] * Math.pow(x, p);
  }
  return sum;
}

function formatPoly(coeffs: number[]): string {
  const parts: string[] = [];
  for (let p = coeffs.length - 1; p >= 0; p--) {
    const c = coeffs[p];
    if (!c) continue;
    const abs = Math.abs(c);
    const sign = parts.length === 0 ? (c < 0 ? "-" : "") : c < 0 ? " − " : " + ";
    if (p === 0) parts.push(`${sign}${abs}`);
    else if (p === 1) parts.push(`${sign}${abs === 1 ? "" : abs}x`);
    else parts.push(`${sign}${abs === 1 ? "" : abs}x^${p}`);
  }
  return parts.join("") || "0";
}

interface CompResult {
  f: string;
  g: string;
  x: number;
  gx: number;
  fgx: number;
  gf: number;
  table: { x: number; gx: number; fgx: number }[];
}

function compose(fExpr: string, gExpr: string, x: number): CompResult | null {
  const f = parsePoly(fExpr);
  const g = parsePoly(gExpr);
  if (!f || !g) return null;
  const gx = evalPoly(g.coeffs, x);
  const fgx = evalPoly(f.coeffs, gx);
  const gf = evalPoly(g.coeffs, evalPoly(f.coeffs, x));
  const table = [-2, -1, 0, 1, 2].map((v) => {
    const gv = evalPoly(g.coeffs, v);
    return { x: v, gx: Number(gv.toFixed(4)), fgx: Number(evalPoly(f.coeffs, gv).toFixed(4)) };
  });
  return { f: formatPoly(f.coeffs), g: formatPoly(g.coeffs), x, gx, fgx, gf, table };
}

const DEFAULTS = { f: "2x + 1", g: "x^2 - 3", x: "2" };

const faqs = [
  { question: "What is function composition?", answer: "Composing f with g, written f∘g, means applying g first and then feeding the result into f: (f∘g)(x) = f(g(x)). For f(x) = 2x + 1 and g(x) = x², (f∘g)(3) = 2(3²) + 1 = 19." },
  { question: "Does f(g(x)) equal g(f(x))?", answer: "Almost never. Composition is not commutative — order matters. With f(x) = 2x + 1 and g(x) = x², f(g(2)) = 9 but g(f(2)) = 25. The calculator computes both directions so you can see the difference." },
  { question: "What notation is supported?", answer: "Polynomials written as terms joined by + or −: 3x^2, -2x, +5, 4x^3. Plain x, numbers, and decimal coefficients all work. Multiplication signs are optional, and exponents use ^." },
];

export default function FunctionCompositionCalculator() {
  const [fExpr, setFExpr] = useState(DEFAULTS.f);
  const [gExpr, setGExpr] = useState(DEFAULTS.g);
  const [xVal, setXVal] = useState(DEFAULTS.x);
  const [result, setResult] = useState<CompResult>(() => compose("2x + 1", "x^2 - 3", 2)!);

  const handleCalculate = () => {
    const x = parseFloat(xVal);
    if (isNaN(x)) return;
    const r = compose(fExpr, gExpr, x);
    if (r) setResult(r);
  };

  const reset = () => {
    setFExpr(DEFAULTS.f); setGExpr(DEFAULTS.g); setXVal(DEFAULTS.x);
    setResult(compose("2x + 1", "x^2 - 3", 2)!);
  };

  const chartData = result.table.map((r) => ({ name: `x=${r.x}`, "g(x)": r.gx, "f(g(x))": r.fgx }));
  const breakdown = [
    { label: "f(x) (simplified)", value: result.f, highlight: false },
    { label: "g(x) (simplified)", value: result.g, highlight: false },
    { label: `g(${result.x}) = g(x) at input`, value: `${result.gx}`, highlight: false },
    { label: `f(g(${result.x})) — (f∘g)(${result.x})`, value: `${result.fgx}`, highlight: true },
    { label: `g(f(${result.x})) — (g∘f)(${result.x})`, value: `${result.gf}`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Function Composition Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Function Composition Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <FunctionSquare className="w-4 h-4" /> Compute f(g(x))
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Outer Function f(x)</label>
                <input type="text" value={fExpr} onChange={(e) => setFExpr(e.target.value)} className="input-calc" placeholder="2x + 1" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Inner Function g(x)</label>
                <input type="text" value={gExpr} onChange={(e) => setGExpr(e.target.value)} className="input-calc" placeholder="x^2 - 3" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Input Value x</label>
                <input type="number" value={xVal} onChange={(e) => setXVal(e.target.value)} className="input-calc" placeholder="2" />
              </div>
              <p className="text-xs text-muted-foreground">Format: terms like 3x^2, -2x, +5. Exponents use ^.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <FunctionSquare className="w-4 h-4 text-primary" /> COMPOSED RESULT
              </div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">f(g({result.x})) = {result.fgx}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Apply g first ({result.g} at {result.x} gives {result.gx}), then f ({result.f} at {result.gx} gives {result.fgx}).
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Composition Curves</h3>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Legend wrapperStyle={{ fontSize: '13px' }} />
                    <Line type="monotone" dataKey="g(x)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="f(g(x))" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">g(x) and the composed f(g(x)) across the value table.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Value Table (x = −2 … 2)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">x</th>
                      <th className="p-2.5 pr-3 text-right">g(x)</th>
                      <th className="p-2.5 pr-3 text-right">f(g(x))</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {result.table.map((r) => (
                      <tr key={r.x} className={r.x === result.x ? "bg-primary/10 font-bold" : ""}>
                        <td className="p-2.5 pl-3 text-muted-foreground">{r.x}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{r.gx}</td>
                        <td className="p-2.5 pr-3 text-right font-semibold">{r.fgx}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Order Matters", value: result.fgx !== result.gf ? "f∘g ≠ g∘f here" : "f∘g = g∘f (rare)" },
                  { label: "Composition", value: `(f∘g)(x) = f(g(x))` },
                  { label: "f(x)", value: result.f },
                  { label: "g(x)", value: result.g },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Function Composition Calculator</h2>
            <p>Function composition chains operations: (f∘g)(x) = f(g(x)) means "run g on x, then run f on the output." It is the mathematical version of a pipeline — the inner function feeds the outer one. For f(x) = 2x + 1 and g(x) = x² − 3, the composition (f∘g)(x) = 2(x² − 3) + 1 = 2x² − 5, so at x = 2 the value is 3.</p>
            <h3>Why order matters</h3>
            <p>Composition is not commutative: reversing the order gives g(f(x)) = (2x + 1)² − 3, a completely different function. This is why the calculator shows both directions and a value table — watching f(g(x)) diverge from g(f(x)) across inputs makes the non-commutativity concrete. The parser accepts simple polynomials without any eval, so expressions like 3x^2 + 2x − 5 are safe to enter.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/function-composition-calculator" />
          <PopularCalculators exclude="/calculator/function-composition-calculator" />
        </div>
      </div>
    </>
  );
}
