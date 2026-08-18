"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface RatioInput {
  a: number;
  b: number;
  c: number;
}

interface RatioResult {
  gcd: number;
  simpleA: number;
  simpleB: number;
  decimalValue: number;
  percentage: number;
  proportionD: number;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function gcd(x: number, y: number): number {
  let a = Math.abs(Math.round(x));
  let b = Math.abs(Math.round(y));
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}

function calcRatio(input: RatioInput): RatioResult {
  const g = gcd(input.a, input.b);
  const simpleA = input.a / g;
  const simpleB = input.b / g;
  const decimalValue = input.b !== 0 ? input.a / input.b : 0;
  const percentage = decimalValue * 100;
  const proportionD = input.c !== 0 ? (input.b * input.c) / input.a : 0;

  const chartData = [
    { name: `A (${input.a})`, value: input.a, fill: "hsl(var(--primary))" },
    { name: `B (${input.b})`, value: input.b, fill: "#10b981" },
  ];

  const breakdown = [
    { label: "Original Ratio", value: `${input.a} : ${input.b}` },
    { label: "Greatest Common Divisor", value: `${g}` },
    { label: "Simplified Ratio", value: `${simpleA} : ${simpleB}` },
    { label: "Decimal Value (A ÷ B)", value: `${decimalValue.toFixed(4)}` },
    { label: "Percentage (A is % of B)", value: `${percentage.toFixed(1)}%` },
    { label: "Equivalent Ratio (×2)", value: `${simpleA * 2} : ${simpleB * 2}` },
    { label: "Equivalent Ratio (×3)", value: `${simpleA * 3} : ${simpleB * 3}` },
    { label: "Proportion D (A/B = C/D)", value: `${proportionD.toFixed(2)}` },
  ];

  const summaryStats = [
    { label: "Simplified Ratio", value: `${simpleA} : ${simpleB}` },
    { label: "Decimal Value", value: `${decimalValue.toFixed(4)}` },
    { label: "Percentage", value: `${percentage.toFixed(1)}%` },
    { label: "GCD", value: `${g}` },
    { label: "Original Ratio", value: `${input.a} : ${input.b}` },
    { label: "Proportion D", value: `${proportionD.toFixed(2)}` },
  ];

  return { gcd: g, simpleA, simpleB, decimalValue, percentage, proportionD, chartData, breakdown, summaryStats };
}

const DEFAULTS: RatioInput = { a: 8, b: 12, c: 6 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function RatioCalculator() {
  const [a, setA] = useState(String(DEFAULTS.a));
  const [b, setB] = useState(String(DEFAULTS.b));
  const [c, setC] = useState(String(DEFAULTS.c));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [result, setResult] = useState<RatioResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n !== 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcRatio({ a: parse(a, DEFAULTS.a), b: parse(b, DEFAULTS.b), c: parse(c, DEFAULTS.c) }));
  const reset = () => {
    setA(String(DEFAULTS.a));
    setB(String(DEFAULTS.b));
    setC(String(DEFAULTS.c));
    setResult(calcRatio(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcRatio(DEFAULTS));
  }, []);

  const faqs = [
    { question: "How do I simplify a ratio?", answer: "Divide both terms by their greatest common divisor (GCD). For 8:12, the GCD is 4, so the simplified ratio is 2:3. Simplified ratios make comparisons and scaling easier." },
    { question: "What is a ratio?", answer: "A ratio compares two quantities of the same kind, written a:b or a/b. 2:3 means two parts of A for every three parts of B. Ratios have no units — the comparison is dimensionless." },
    { question: "How do I solve a proportion?", answer: "In A/B = C/D, cross-multiply: D = B × C ÷ A. For example, if 2/3 = 6/D, then D = 3 × 6 ÷ 2 = 9. This calculator solves for D given A, B, and C." },
    { question: "What is the difference between a ratio and a percentage?", answer: "A ratio is a comparison (2:3); a percentage expresses the same relationship as a fraction of 100 (2÷3 ≈ 66.7%). This calculator shows both views of the same relationship." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Term A</label>
                <div className={inp}><input type="number" value={a} onChange={(e) => setA(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Term B</label>
                <div className={inp}><input type="number" value={b} onChange={(e) => setB(e.target.value)} className={ci} /></div>
              </div>
            </div>

            <button onClick={() => setAdvancedOpen(!advancedOpen)} className="text-sm text-primary font-medium text-left self-start">
              Advanced Options {advancedOpen ? "▲" : "▼"}
            </button>
            {advancedOpen && (
              <div className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">Proportion A/B = C/D</label>
                  <label className="text-sm font-medium mb-1 block">Term C (solve for D)</label>
                  <div className={inp}><input type="number" value={c} onChange={(e) => setC(e.target.value)} className={ci} /></div>
                </div>
              </div>
            )}

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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Simplified Ratio</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{result.simpleA} <span className="text-2xl text-muted-foreground">:</span> {result.simpleB}</div>
                  <div className="text-sm text-muted-foreground mt-1">{result.decimalValue.toFixed(4)} · {result.percentage.toFixed(1)}% · from {result.gcd === 1 ? "already simplified" : `÷ GCD ${result.gcd}`}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Decimal", `${result.decimalValue.toFixed(4)}`], ["Percentage", `${result.percentage.toFixed(1)}%`], ["GCD", `${result.gcd}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Ratio Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Ratio Terms Comparison</h3>
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
            <h2 className="text-2xl font-bold mb-3">Working With Ratios</h2>
            <p>A ratio a:b compares two quantities — it has no units. Simplifying by the GCD (e.g., 8:12 → 2:3) makes ratios easier to read and compare, and equivalent ratios (2:3 = 4:6 = 6:9) are produced by scaling both terms by the same factor.</p>
            <h2 className="text-2xl font-bold mb-3">Ratios, Decimals, and Percentages</h2>
            <p>Every ratio corresponds to a decimal (a ÷ b) and a percentage (a ÷ b × 100). A 2:3 ratio is 0.6667, or 66.7% — useful when converting recipes, mixes, or financial relationships between forms.</p>
            <h2 className="text-2xl font-bold mb-3">Solving Proportions</h2>
            <p>Proportions state that two ratios are equal: A/B = C/D. Cross-multiplication gives D = B × C ÷ A. This is the standard technique for scaling recipes, resizing images proportionally, and unit conversions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ratio-calculator" />
          <PopularCalculators exclude="/calculator/ratio-calculator" />
        </div>
      </div>
    </>
  );
}
