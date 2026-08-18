"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface ExpInput {
  base: number;
  exponent: number;
}

interface ExpResult {
  result: number;
  reciprocal: number;
  sciNotation: string;
  expanded: string;
  chartData: { name: string; value: number; fill: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcExp(input: ExpInput): ExpResult {
  const result = Math.pow(input.base, input.exponent);
  const reciprocal = input.base !== 0 ? 1 / result : Infinity;
  const sciNotation = result >= 1e6 || (result > 0 && result < 1e-4) ? result.toExponential(4) : `${result}`;

  let expanded = "";
  const n = Math.round(input.exponent);
  if (input.exponent === n && n >= 0 && n <= 12 && Math.abs(input.base) < 1e6) {
    expanded = Array.from({ length: n }, () => `${input.base}`).join(" × ");
  } else {
    expanded = `Not shown (exponent ${input.exponent} is not a small non-negative integer)`;
  }

  const maxPower = Math.min(8, Math.max(1, n < 0 ? 4 : n));
  const chartData = Array.from({ length: maxPower + 1 }, (_, i) => ({
    name: `${input.base}^${i}`,
    value: Number(Math.pow(input.base, i).toFixed(2)),
    fill: i === n ? "hsl(var(--primary))" : "#94a3b8",
  }));

  const breakdown = [
    { label: "Base", value: `${input.base}` },
    { label: "Exponent", value: `${input.exponent}` },
    { label: "Result", value: `${result}` },
    { label: "Reciprocal (1 ÷ result)", value: Number.isFinite(reciprocal) ? `${reciprocal}` : "undefined" },
    { label: "Scientific Notation", value: sciNotation },
    { label: "Expanded Form", value: expanded },
  ];

  const summaryStats = [
    { label: "Result", value: Number.isFinite(result) ? `${result}` : "undefined" },
    { label: "Scientific Notation", value: sciNotation },
    { label: "Reciprocal", value: Number.isFinite(reciprocal) ? `${reciprocal}` : "undefined" },
    { label: "Base", value: `${input.base}` },
    { label: "Exponent", value: `${input.exponent}` },
    { label: "Parity", value: input.exponent % 2 === 0 ? "Even exponent" : "Odd exponent" },
  ];

  return { result, reciprocal, sciNotation, expanded, chartData, breakdown, summaryStats };
}

const DEFAULTS: ExpInput = { base: 2, exponent: 10 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function ExponentCalculator() {
  const [base, setBase] = useState(String(DEFAULTS.base));
  const [exponent, setExponent] = useState(String(DEFAULTS.exponent));
  const [result, setResult] = useState<ExpResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : fallback;
  };

  const calculate = () =>
    setResult(calcExp({ base: parse(base, DEFAULTS.base), exponent: parse(exponent, DEFAULTS.exponent) }));
  const reset = () => {
    setBase(String(DEFAULTS.base));
    setExponent(String(DEFAULTS.exponent));
    setResult(calcExp(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcExp(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is an exponent?", answer: "An exponent says how many times to multiply the base by itself: 2³ = 2 × 2 × 2 = 8. Any non-zero base to the power 0 equals 1, and a negative exponent means the reciprocal: 2⁻³ = 1/8." },
    { question: "How do fractional exponents work?", answer: "A fractional exponent is a root: 9^(1/2) = √9 = 3, and 8^(2/3) = (³√8)² = 4. In general, x^(a/b) = (bth root of x)^a." },
    { question: "What happens with a negative base?", answer: "With an integer exponent, an odd power stays negative (−2³ = −8) and an even power is positive (−2⁴ = 16). Fractional exponents of negative bases can be undefined in the real numbers." },
    { question: "What is scientific notation for?", answer: "Huge or tiny results — like 2⁶⁴ ≈ 1.845 × 10¹⁹ — are unreadable in decimal form. Scientific notation (a × 10ᵇ) compresses them, which is why this calculator reports both." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Exponent Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Exponent Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Base</label>
                <div className={inp}><input type="number" value={base} onChange={(e) => setBase(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Exponent</label>
                <div className={inp}><input type="number" value={exponent} onChange={(e) => setExponent(e.target.value)} className={ci} /></div>
              </div>
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
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{base} ^ {exponent}</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary break-all">{Number.isFinite(result.result) ? result.result : "undefined"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Scientific notation: {result.sciNotation}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["Scientific", result.sciNotation], ["Reciprocal", Number.isFinite(result.reciprocal) ? `${result.reciprocal}` : "—"], ["Expanded", result.expanded.length > 40 ? "…shown below" : result.expanded]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-sm font-bold break-all">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold break-all">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Powers of the Base</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
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
                      <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold break-all">{s.value}</span></div>
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
            <h2 className="text-2xl font-bold mb-3">The Rules of Exponents</h2>
            <p>Exponents compress repeated multiplication: 2¹⁰ = 1,024 means ten factors of 2. Key rules: x⁰ = 1, x⁻ⁿ = 1/xⁿ, xᵃ × xᵇ = x⁽ᵃ⁺ᵇ⁾, (xᵃ)ᵇ = xᵃᵇ, and fractional exponents are roots — 9^(1/2) = 3.</p>
            <h2 className="text-2xl font-bold mb-3">Exponential Growth Is Everywhere</h2>
            <p>Compound interest, population growth, and computing power all follow exponential laws. Because growth compounds, small differences in the exponent produce enormous differences in the result — 2¹⁰ is 1,024, while 2²⁰ is over a million.</p>
            <h2 className="text-2xl font-bold mb-3">Reading Big Numbers</h2>
            <p>Results beyond a few digits are hard to read, so this calculator also reports scientific notation (a × 10ᵇ). For negative exponents the reciprocal is shown: 2⁻³ = 1/8 = 0.125, useful when working with decay and probability.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponent-calculator" />
          <PopularCalculators exclude="/calculator/exponent-calculator" />
        </div>
      </div>
    </>
  );
}
