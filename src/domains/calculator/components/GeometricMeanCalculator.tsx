"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Sigma } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface MeanResult {
  values: number[];
  geometric: number;
  arithmetic: number;
  harmonic: number;
  n: number;
  valid: boolean;
  chartData: { name: string; value: number }[];
}

function calcMeans(input: string): MeanResult {
  const values = input.split(",").map((s) => parseFloat(s.trim())).filter((v) => !isNaN(v));
  const valid = values.length > 0 && values.every((v) => v > 0);
  let geometric = 0;
  let arithmetic = 0;
  let harmonic = 0;
  if (valid) {
    geometric = Math.pow(values.reduce((p, v) => p * v, 1), 1 / values.length);
    arithmetic = values.reduce((p, v) => p + v, 0) / values.length;
    harmonic = values.length / values.reduce((p, v) => p + 1 / v, 0);
  }
  const chartData = valid
    ? [
        { name: "Geometric", value: Number(geometric.toFixed(3)) },
        { name: "Arithmetic", value: Number(arithmetic.toFixed(3)) },
        { name: "Harmonic", value: Number(harmonic.toFixed(3)) },
      ]
    : [];
  return { values, geometric, arithmetic, harmonic, n: values.length, valid, chartData };
}

const DEFAULTS = { values: "2, 8" };

const faqs = [
  { question: "What is the geometric mean?", answer: "It is the nth root of the product of n numbers: for 2 and 8 it is √(2×8) = 4. Unlike the arithmetic mean, it multiplies rather than adds, so it is never skewed upward by one huge value — it is always ≤ the arithmetic mean." },
  { question: "When should I use the geometric mean?", answer: "Use it for rates of change, ratios, and percentages — investment returns, population growth, inflation, and any quantity that compounds. A 50% gain followed by a 50% loss averages 0% geometrically but +0% arithmetically is misleading." },
  { question: "Why does the geometric mean fail for negative numbers?", answer: "The product of numbers containing a negative or zero gives a meaningless root (or zero). The geometric mean is only defined for positive values — that's fine for growth rates and ratios, which are naturally positive." },
];

export default function GeometricMeanCalculator() {
  const [input, setInput] = useState(DEFAULTS.values);
  const [result, setResult] = useState<MeanResult>(() => calcMeans("2, 8"));

  const handleCalculate = () => {
    setResult(calcMeans(input));
  };

  const reset = () => {
    setInput(DEFAULTS.values);
    setResult(calcMeans("2, 8"));
  };

  const breakdown = [
    { label: "Numbers Analyzed", value: result.valid ? `${result.values.join(", ")}` : "—", highlight: false },
    { label: "Count (n)", value: `${result.n}`, highlight: false },
    { label: "Geometric Mean", value: result.valid ? `${result.geometric.toFixed(4)}` : "Requires positive values", highlight: true },
    { label: "Arithmetic Mean", value: result.valid ? `${result.arithmetic.toFixed(4)}` : "—", highlight: false },
    { label: "Harmonic Mean", value: result.valid ? `${result.harmonic.toFixed(4)}` : "—", highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Geometric Mean Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Geometric Mean Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Sigma className="w-4 h-4" /> Geometric Mean
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-1 block">Numbers (comma-separated)</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input-calc min-h-[80px] resize-y"
                placeholder="2, 8, 4, 16"
              />
              <p className="text-xs text-muted-foreground mt-1">All values must be positive for a geometric mean.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="card-calculator !p-4 border border-border bg-card">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Sigma className="w-4 h-4 text-primary" /> GEOMETRIC MEAN
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {result.valid ? result.geometric.toFixed(4) : "—"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {result.valid
                  ? `The nth root (n = ${result.n}) of the product of ${result.n} positive values.`
                  : "Enter only positive numbers separated by commas."}
              </p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Mean Comparison</h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <RechartsTooltip formatter={(value: number) => Number(value).toFixed(4)} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3 italic">Harmonic ≤ Geometric ≤ Arithmetic for positive values.</p>
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

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "Pythagorean Order", value: result.valid ? "Harmonic ≤ Geometric ≤ Arithmetic" : "—" },
                  { label: "Product of Values", value: result.valid ? `${result.values.reduce((p, v) => p * v, 1).toLocaleString("en-US", { maximumFractionDigits: 4 })}` : "—" },
                  { label: "Best For", value: "Growth rates & ratios" },
                  { label: "Classic Example", value: "√(2 × 8) = 4" },
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
            <h2 className="text-2xl font-bold mb-3">About the Geometric Mean Calculator</h2>
            <p>The geometric mean multiplies n values and takes the nth root, where the arithmetic mean adds and divides. For the pair 2 and 8, the geometric mean is √16 = 4 — the "fair middle" for multiplicative quantities. It is always less than or equal to the arithmetic mean, equal only when every value is identical.</p>
            <h3>Where it is indispensable</h3>
            <p>Any quantity that compounds over time averages geometrically, not arithmetically. A portfolio returning +50% then −50% has an arithmetic average of +0% but an actual result of −25% — the geometric mean correctly reports −13.4% per period. The same logic governs inflation, population growth, currency exchange, and lens aperture scales, which is why the geometric mean is the default for ratios.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/geometric-mean-calculator" />
          <PopularCalculators exclude="/calculator/geometric-mean-calculator" />
        </div>
      </div>
    </>
  );
}
