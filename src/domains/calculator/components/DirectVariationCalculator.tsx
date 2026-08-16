"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface VariationResult {
  x1: number;
  y1: number;
  x2: number;
  k: number;
  y2: number;
  chartData: { x: number; y: number }[];
}

function calcVariation(x1: number, y1: number, x2: number): VariationResult {
  const k = x1 !== 0 ? y1 / x1 : 0;
  const y2 = k * x2;
  const chartData = [
    { x: 0, y: 0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
  return { x1, y1, x2, k, y2, chartData };
}

const DEFAULTS = { x1: "4", y1: "12", x2: "7" };

const faqs = [
  { question: "What is direct variation?", answer: "Two quantities vary directly when y = kx for a constant k — doubling x doubles y. The ratio y/x stays fixed, and the graph is a straight line through the origin." },
  { question: "How is the constant k found?", answer: "From any known pair: k = y₁ ÷ x₁. With k known, any other x maps to y = kx. This calculator uses that two-step process." },
  { question: "What are real examples?", answer: "Distance vs time at constant speed, pay vs hours worked, circumference vs radius (k = 2π), and force vs acceleration (k = mass)." },
];

export default function DirectVariationCalculator() {
  const [x1, setX1] = useState(DEFAULTS.x1);
  const [y1, setY1] = useState(DEFAULTS.y1);
  const [x2, setX2] = useState(DEFAULTS.x2);
  const [result, setResult] = useState<VariationResult>(() => calcVariation(4, 12, 7));

  useEffect(() => {
    const a = parseFloat(x1);
    const b = parseFloat(y1);
    const c = parseFloat(x2);
    if (!isNaN(a) && !isNaN(b) && !isNaN(c) && a !== 0) setResult(calcVariation(a, b, c));
  }, [x1, y1, x2]);

  const reset = () => { setX1(DEFAULTS.x1); setY1(DEFAULTS.y1); setX2(DEFAULTS.x2); };
  const invalid = isNaN(parseFloat(x1)) || isNaN(parseFloat(y1)) || isNaN(parseFloat(x2)) || parseFloat(x1) === 0;

  const breakdown = [
    { label: "Known Point (x₁, y₁)", value: `(${result.x1}, ${result.y1})` },
    { label: "Constant of Variation k", value: `${result.k.toFixed(4)}`, highlight: true },
    { label: "Equation", value: `y = ${result.k.toFixed(4)}x` },
    { label: "New x (x₂)", value: `${result.x2}` },
    { label: "New y (y₂)", value: `${result.y2.toFixed(4)}`, highlight: true },
    { label: "Ratio Check", value: `y₁/x₁ = ${result.k.toFixed(4)} = y₂/x₂ = ${(result.y2 / (result.x2 || 1)).toFixed(4)}` },
  ];

  const summaryStats = [
    { label: "k", value: `${result.k.toFixed(4)}` },
    { label: "y₂", value: `${result.y2.toFixed(4)}` },
    { label: "x₂", value: `${result.x2}` },
    { label: "Point (x₁, y₁)", value: `(${result.x1}, ${result.y1})` },
    { label: "Equation", value: `y = ${result.k.toFixed(3)}x` },
    { label: "Proportionality", value: "Direct (y = kx)" },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Direct Variation Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Direct Variation Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dv-x1" className="block text-sm font-medium mb-1 text-foreground">Known x (x₁)</label>
                <input id="dv-x1" type="number" step="0.1" value={x1} onChange={(e) => setX1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="dv-y1" className="block text-sm font-medium mb-1 text-foreground">Known y (y₁)</label>
                <input id="dv-y1" type="number" step="0.1" value={y1} onChange={(e) => setY1(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label htmlFor="dv-x2" className="block text-sm font-medium mb-1 text-foreground">New x (x₂)</label>
              <input id="dv-x2" type="number" step="0.1" value={x2} onChange={(e) => setX2(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter numeric values with x₁ ≠ 0.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">New Value y₂</div>
              <div className="text-4xl font-extrabold text-primary">{result.y2.toFixed(4)}</div>
              <div className="text-sm text-muted-foreground mt-1">y = {result.k.toFixed(4)} · {result.x2} = {result.y2.toFixed(4)} · k = y₁/x₁</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Constant k</div>
                <div className="text-lg font-bold text-primary">{result.k.toFixed(4)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Ratio y/x</div>
                <div className="text-lg font-bold text-primary">{result.k.toFixed(4)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Equation</div>
                <div className="text-lg font-bold text-primary">y = {result.k.toFixed(3)}x</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
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
              <h3 className="text-base font-bold mb-3">Direct Variation Line</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, n: string) => [v.toFixed(2), n === "y" ? "y" : "x"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground -mt-2">Line through origin: (0,0), (x₁,y₁), (x₂,y₂)</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Direct Variation Calculator</h2>
            <p>Direct variation describes proportional relationships: y = kx with a constant k. The signature test is a constant ratio — y₁/x₁ must equal y₂/x₂. In practice, find k from any known pair, then scale: if 4 items cost $12 (k = 3), 7 items cost $21.</p>
            <h3>Proportional Thinking</h3>
            <p>Direct variation is the mathematical core of unit rates, exchange rates, speed, density, and scaling recipes. Its graph is always a straight line through the origin — no constant term, because at x = 0, y must be 0.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/direct-variation-calculator" />
          <PopularCalculators exclude="/calculator/direct-variation-calculator" />
        </div>
      </div>
    </>
  );
}
