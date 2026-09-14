"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Hash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

type Op = "+" | "-" | "×" | "÷";

interface FracResult {
  num: number;
  den: number;
  decimal: number;
  steps: string[];
  op: Op;
  n1: number;
  d1: number;
  n2: number;
  d2: number;
}

function computeFraction(n1: number, d1: number, n2: number, d2: number, op: Op): FracResult {
  let rn = 0;
  let rd = 1;
  let steps: string[] = [];
  if (op === "+" || op === "-") {
    const sign = op === "+" ? 1 : -1;
    rn = n1 * d2 + sign * n2 * d1;
    rd = d1 * d2;
    steps = [
      `Find a common denominator: ${d1} × ${d2} = ${d1 * d2}`,
      `${n1}/${d1} ${op} ${n2}/${d2} = (${n1}×${d2} ${sign === 1 ? "+" : "−"} ${n2}×${d1}) / ${d1 * d2}`,
      `= ${rn}/${rd}`,
    ];
  } else if (op === "×") {
    rn = n1 * n2;
    rd = d1 * d2;
    steps = [
      `Multiply numerators: ${n1} × ${n2} = ${rn}`,
      `Multiply denominators: ${d1} × ${d2} = ${rd}`,
      `= ${rn}/${rd}`,
    ];
  } else {
    rn = n1 * d2;
    rd = d1 * n2;
    steps = [
      `Flip the second fraction (reciprocal): ${n2}/${d2} → ${d2}/${n2}`,
      `Multiply: ${n1}/${d1} × ${d2}/${n2} = ${rn}/${rd}`,
    ];
  }
  if (rd === 0) {
    return { num: rn, den: 0, decimal: NaN, steps, op, n1, d1, n2, d2 };
  }
  const g = gcd(rn, rd);
  if (g > 1) {
    rn /= g;
    rd /= g;
    steps.push(`Simplify by GCD ${g}: ${rn}/${rd}`);
  }
  return { num: rn, den: rd, decimal: rd !== 0 ? rn / rd : NaN, steps, op, n1, d1, n2, d2 };
}

const DEFAULTS = { n1: "1", d1: "2", n2: "1", d2: "3", op: "+" as Op };

const faqs = [
  { question: "How do I add fractions?", answer: "Find a common denominator, convert both fractions, add the numerators, then simplify by dividing the numerator and denominator by their greatest common divisor (GCD)." },
  { question: "How do I divide fractions?", answer: "Multiply the first fraction by the reciprocal (flip) of the second fraction. For example 1/2 ÷ 1/3 = 1/2 × 3/1 = 3/2." },
  { question: "What is an improper fraction?", answer: "An improper fraction has a numerator larger than its denominator (e.g., 5/3). It equals more than one whole and can be written as a mixed number (1⅔)." },
];

export default function FractionCalculator() {
  const [n1, setN1] = useState(DEFAULTS.n1);
  const [d1, setD1] = useState(DEFAULTS.d1);
  const [n2, setN2] = useState(DEFAULTS.n2);
  const [d2, setD2] = useState(DEFAULTS.d2);
  const [op, setOp] = useState<Op>(DEFAULTS.op);
  const [result, setResult] = useState<FracResult>(() => computeFraction(1, 2, 1, 3, "+"));

  const handleCalculate = () => {
    const a = parseInt(n1) || 0;
    const b = parseInt(d1) || 1;
    const c = parseInt(n2) || 0;
    const d = parseInt(d2) || 1;
    setResult(computeFraction(a, b, c, d, op));
  };

  const reset = () => {
    setN1(DEFAULTS.n1); setD1(DEFAULTS.d1); setN2(DEFAULTS.n2); setD2(DEFAULTS.d2);
    setOp(DEFAULTS.op);
    setResult(computeFraction(1, 2, 1, 3, "+"));
  };

  const denZero = result.den === 0;
  const chartData = [
    { name: "1st Fraction", value: result.d1 !== 0 ? Number((result.n1 / result.d1).toFixed(4)) : 0 },
    { name: "2nd Fraction", value: result.d2 !== 0 ? Number((result.n2 / result.d2).toFixed(4)) : 0 },
    { name: "Result", value: denZero || isNaN(result.decimal) ? 0 : Number(result.decimal.toFixed(4)) },
  ];
  const breakdown = [
    { label: "Expression", value: `${result.n1}/${result.d1} ${result.op} ${result.n2}/${result.d2}`, highlight: false },
    { label: "Result (simplified)", value: denZero ? "Undefined (division by zero)" : `${result.num}/${result.den}`, highlight: true },
    { label: "Decimal", value: denZero || isNaN(result.decimal) ? "—" : `${Number(result.decimal.toFixed(6))}`, highlight: false },
    { label: "Mixed Number", value: denZero ? "—" : Math.abs(result.num) >= Math.abs(result.den) && result.den !== 0
      ? `${Math.trunc(result.num / result.den)} ${Math.abs(result.num % result.den)}/${result.den}` : "Proper fraction", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fraction Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fraction Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Hash className="w-4 h-4" /> Add, Subtract, Multiply & Divide
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-semibold text-foreground mb-1 block">Numerator 1</label>
                <input type="number" value={n1} onChange={(e) => setN1(e.target.value)} className="input-calc" placeholder="1" />
              </div>
              <span className="text-lg font-bold text-muted-foreground pb-2">/</span>
              <div className="flex-1">
                <label className="text-sm font-semibold text-foreground mb-1 block">Denominator 1</label>
                <input type="number" value={d1} onChange={(e) => setD1(e.target.value)} className="input-calc" placeholder="2" />
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              {(["+", "-", "×", "÷"] as Op[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOp(o)}
                  className={op === o ? "w-10 h-10 rounded-md border text-base font-bold transition-colors bg-primary text-primary-foreground border-primary" : "w-10 h-10 rounded-md border text-base font-bold transition-colors border-border hover:bg-secondary"}
                >
                  {o}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-sm font-semibold text-foreground mb-1 block">Numerator 2</label>
                <input type="number" value={n2} onChange={(e) => setN2(e.target.value)} className="input-calc" placeholder="1" />
              </div>
              <span className="text-lg font-bold text-muted-foreground pb-2">/</span>
              <div className="flex-1">
                <label className="text-sm font-semibold text-foreground mb-1 block">Denominator 2</label>
                <input type="number" value={d2} onChange={(e) => setD2(e.target.value)} className="input-calc" placeholder="3" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Hash className="w-4 h-4 text-primary" /> RESULT
              </div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {denZero ? "Undefined" : `${result.num}/${result.den}`}
                </span>
                {!denZero && !isNaN(result.decimal) && (
                  <span className="text-sm text-muted-foreground">= {Number(result.decimal.toFixed(6))}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {denZero ? "The denominator of the result is zero — check your inputs." : `${result.num}/${result.den} is the simplified form of ${result.n1}/${result.d1} ${result.op} ${result.n2}/${result.d2}.`}
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Value Comparison</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => Number(value).toFixed(4)} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">Decimal values of each fraction and the simplified result.</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Step-by-Step Solution</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {result.steps.map((s, i) => (
                  <li key={i} className={i === result.steps.length - 1 ? "font-semibold text-foreground" : ""}>{s}</li>
                ))}
              </ol>
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
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Fraction Calculator</h2>
            <p>A fraction consists of a numerator (top) and denominator (bottom). To add or subtract fractions, first find a common denominator — usually the product of the two denominators. Then combine the numerators and simplify the result by dividing both parts by their greatest common divisor (GCD).</p>
            <h3>Multiplying and dividing</h3>
            <p>Multiplication is direct: multiply the numerators and multiply the denominators. Division is multiplication by the reciprocal: 1/2 ÷ 1/3 becomes 1/2 × 3/1 = 3/2. Every result here is reduced to its simplest form, and improper fractions are also shown as mixed numbers when the numerator exceeds the denominator.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fraction-calculator" />
          <PopularCalculators exclude="/calculator/fraction-calculator" />
        </div>
      </div>
    </>
  );
}
