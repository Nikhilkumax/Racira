"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface InverseResult {
  x1: number;
  y1: number;
  x2: number;
  k: number;
  y2: number;
  curve: { x: number; y: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { x: number; y: number }[];
}

function calcInverse(x1: number, y1: number, x2: number): InverseResult {
  const k = x1 * y1;
  const y2 = x2 !== 0 ? k / x2 : 0;

  const curve: { x: number; y: number }[] = [];
  for (let x = Math.max(0.5, Math.min(x1, x2) / 4); x <= Math.max(x1, x2) * 4; x *= 1.5) {
    curve.push({ x: Math.round(x * 100) / 100, y: Math.round((k / x) * 100) / 100 });
  }

  const breakdown = [
    { label: "First x (x₁)", value: `${x1}` },
    { label: "First y (y₁)", value: `${y1}` },
    { label: "Constant of Variation k = x₁y₁", value: `${k}` },
    { label: "Second x (x₂)", value: `${x2}` },
    { label: "Second y (y₂ = k/x₂)", value: `${y2.toFixed(4)}` },
    { label: "Relationship", value: `y = ${k}/x (inverse variation)` },
    { label: "Product Check x₁y₁", value: `${x1 * y1}` },
    { label: "Product Check x₂y₂", value: `${x2 * y2}` },
  ];
  const summaryStats = [
    { label: "y₂", value: `${y2.toFixed(4)}` },
    { label: "Constant k", value: `${k}` },
    { label: "x₁", value: `${x1}` },
    { label: "y₁", value: `${y1}` },
    { label: "x₂", value: `${x2}` },
    { label: "Equation", value: `y = ${k}/x` },
    { label: "Product", value: `${k}` },
    { label: "Type", value: "Inverse variation" },
  ];
  return { x1, y1, x2, k, y2, curve, breakdown, summaryStats, chartData: curve };
}

const DEFAULTS = { x1: "4", y1: "12", x2: "6" };

export default function InverseVariationCalculator() {
  const [x1, setX1] = useState(DEFAULTS.x1);
  const [y1, setY1] = useState(DEFAULTS.y1);
  const [x2, setX2] = useState(DEFAULTS.x2);
  const [result, setResult] = useState<InverseResult | null>(null);

  const a = parseFloat(x1) || 0;
  const b = parseFloat(y1) || 0;
  const c = parseFloat(x2) || 0;
  const errs: string[] = [];
  if (a === 0) errs.push("x₁ cannot be zero.");
  if (b === 0) errs.push("y₁ cannot be zero.");
  if (c === 0) errs.push("x₂ cannot be zero.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcInverse(a, b, c)); };
  const reset = () => {
    setX1(DEFAULTS.x1); setY1(DEFAULTS.y1); setX2(DEFAULTS.x2);
    setResult(calcInverse(4, 12, 6));
  };
  useEffect(() => { setResult(calcInverse(4, 12, 6)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is inverse variation?", answer: "Two quantities vary inversely when their product is constant: xy = k, or y = k/x. As one grows, the other shrinks in exact proportion." },
    { question: "How do I find the constant k?", answer: "Multiply any known x by its matching y: if x = 4 when y = 12, then k = 48. Every other point on the curve satisfies xy = 48." },
    { question: "Where does this appear in real life?", answer: "Speed vs travel time (distance fixed), brightness vs distance squared, and pressure vs volume in Boyle's law are all inverse variations." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Inverse Variation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Inverse Variation Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>First x (x₁)</label>
                <div className={inp}><input type="number" value={x1} onChange={e => setX1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>First y (y₁)</label>
                <div className={inp}><input type="number" value={y1} onChange={e => setY1(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className={lbl}>Second x (x₂)</label>
                <div className={inp}><input type="number" value={x2} onChange={e => setX2(e.target.value)} className={ci} /></div>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Second y (y₂)</div>
                <div className="text-4xl font-extrabold tracking-tight">{result.y2.toFixed(4)}</div>
                <div className="text-sm text-muted-foreground mt-1">y = {result.k}/x with k = {result.x1} × {result.y1} = {result.k}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[[`Constant k`, `${result.k}`], ["Product x₂y₂", `${(result.x2 * result.y2).toFixed(2)}`], ["Relationship", `y = ${result.k}/x`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Variation Details</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 4 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 4 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 4 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">The Hyperbola y = k/x</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`${v}`, ""]} labelFormatter={(l: number) => `x = ${l}`} />
                    <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">Product xy is constant along the curve</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Inverse Variation in One Step</h2>
            <p>This <strong>inverse variation calculator</strong> derives the constant k from one known point (k = x₁y₁) and applies it to a new x to find y₂. The defining property — the product xy stays fixed — is verified in the results for both points.</p>
            <h2 className="text-2xl font-bold mb-3">The Shape of the Curve</h2>
            <p>Inverse variation plots as a hyperbola: steep near zero and flattening as x grows. Doubling x halves y, tripling x cuts y to a third — the reciprocal scaling that distinguishes inverse from linear or quadratic behavior.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Driving time falls as speed rises for a fixed distance, and Boyle's law ties gas pressure inversely to volume. Any physics or economics problem stating "product is constant" is inverse variation in disguise.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/inverse-variation-calculator" />
          <PopularCalculators exclude="/calculator/inverse-variation-calculator" />
        </div>
      </div>
    </>
  );
}
