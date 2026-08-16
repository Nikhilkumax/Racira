"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Mode = "power" | "root" | "scientific";

interface ExponentResult {
  mode: Mode;
  base: number;
  exponent: number;
  result: number;
  resultText: string;
  log10: number;
  chartData: { x: number; y: number }[];
}

function calcExponent(mode: Mode, base: number, exponent: number): ExponentResult | null {
  if (mode === "power") {
    const result = Math.pow(base, exponent);
    if (!isFinite(result)) return null;
    const chartData: { x: number; y: number }[] = [];
    const steps = Math.min(Math.max(Math.abs(exponent), 1), 20);
    for (let i = 0; i <= steps; i++) {
      const e = exponent >= 0 ? i : -i;
      chartData.push({ x: e, y: Number(Math.pow(base, e).toFixed(4)) });
    }
    return {
      mode, base, exponent, result,
      resultText: result >= 1e15 || (result > 0 && result < 1e-6) ? result.toExponential(6) : result.toLocaleString("en-US", { maximumFractionDigits: 6 }),
      log10: Math.log10(Math.abs(result)),
      chartData,
    };
  }
  if (mode === "root") {
    const result = exponent !== 0 ? Math.pow(base, 1 / exponent) : NaN;
    if (isNaN(result) || !isFinite(result)) return null;
    const chartData: { x: number; y: number }[] = [];
    for (let i = 1; i <= 20; i++) {
      const n = i;
      chartData.push({ x: n, y: Number(Math.pow(base, 1 / n).toFixed(4)) });
    }
    return {
      mode, base, exponent, result,
      resultText: result.toLocaleString("en-US", { maximumFractionDigits: 6 }),
      log10: Math.log10(Math.abs(result)),
      chartData,
    };
  }
  // scientific: base × 10^exponent
  const result = base * Math.pow(10, exponent);
  if (!isFinite(result)) return null;
  const chartData: { x: number; y: number }[] = [];
  const steps = Math.min(Math.max(Math.abs(exponent), 1), 20);
  for (let i = 0; i <= steps; i++) {
    const e = exponent >= 0 ? i : -i;
    chartData.push({ x: e, y: Number((base * Math.pow(10, e)).toExponential(3)) });
  }
  return {
    mode, base, exponent, result,
    resultText: result.toExponential(6),
    log10: Math.log10(Math.abs(result)),
    chartData,
  };
}

const DEFAULTS = { mode: "power" as Mode, base: "2", exp: "10" };

const faqs = [
  { question: "What is an exponent?", answer: "An exponent says how many times to multiply the base by itself: 2¹⁰ = 2 × 2 × … = 1,024. Negative exponents give reciprocals (2⁻³ = 1/8); fractional exponents give roots (16^½ = 4)." },
  { question: "What is the root mode?", answer: "The nth root of a number: ⁵√32 = 32^(1/5) = 2. The root mode evaluates base^(1/exponent) — enter the root degree as the exponent field." },
  { question: "What is scientific notation?", answer: "Numbers are written as mantissa × 10^exponent, e.g. 3 × 10⁸ = 300,000,000. The scientific mode multiplies your base by the power of ten and shows the result in exponential form." },
];

export default function ExponentCalculator() {
  const [mode, setMode] = useState<Mode>(DEFAULTS.mode);
  const [base, setBase] = useState(DEFAULTS.base);
  const [exp, setExp] = useState(DEFAULTS.exp);
  const [result, setResult] = useState<ExponentResult | null>(() => calcExponent("power", 2, 10));

  useEffect(() => {
    const b = parseFloat(base);
    const e = parseFloat(exp);
    if (!isNaN(b) && !isNaN(e)) {
      const r = calcExponent(mode, b, e);
      if (r) setResult(r);
    }
  }, [mode, base, exp]);

  const reset = () => { setMode(DEFAULTS.mode); setBase(DEFAULTS.base); setExp(DEFAULTS.exp); };
  const invalid = isNaN(parseFloat(base)) || isNaN(parseFloat(exp)) || (mode === "root" && parseFloat(exp) === 0);

  const breakdown = result ? [
    { label: "Mode", value: mode === "power" ? "Power" : mode === "root" ? "Nth Root" : "Scientific Notation" },
    { label: "Base", value: `${result.base}` },
    { label: mode === "power" ? "Exponent" : mode === "root" ? "Root Degree" : "Exponent (×10^)", value: `${result.exponent}` },
    { label: "Result", value: result.resultText, highlight: true },
    { label: "log₁₀(|result|)", value: `${result.log10.toFixed(4)}` },
    { label: "Scientific Form", value: result.result.toExponential(6) },
  ] : [];

  const summaryStats = result ? [
    { label: "Result", value: result.resultText },
    { label: "Scientific", value: result.result.toExponential(6) },
    { label: "log₁₀", value: `${result.log10.toFixed(4)}` },
    { label: "Base", value: `${result.base}` },
    { label: "Exponent", value: `${result.exponent}` },
    { label: "Mode", value: mode === "power" ? "Power" : mode === "root" ? "Root" : "Scientific" },
  ] : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Exponent Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Exponent Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="ex-mode" className="block text-sm font-medium mb-1 text-foreground">Mode</label>
              <select id="ex-mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="power">Power (base^exponent)</option>
                <option value="root">Nth Root (base^(1/n))</option>
                <option value="scientific">Scientific (base × 10^exponent)</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ex-base" className="block text-sm font-medium mb-1 text-foreground">Base</label>
                <input id="ex-base" type="number" step="0.1" value={base} onChange={(e) => setBase(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label htmlFor="ex-exp" className="block text-sm font-medium mb-1 text-foreground">{mode === "root" ? "Root Degree (n)" : "Exponent"}</label>
                <input id="ex-exp" type="number" step="0.1" value={exp} onChange={(e) => setExp(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Calculator className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter valid numeric inputs (root degree ≠ 0).</p>}
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Result</div>
                  <div className="text-4xl font-extrabold text-primary break-all">{result.resultText}</div>
                  <div className="text-sm text-muted-foreground mt-1">{mode === "power" ? `${result.base}^${result.exponent}` : mode === "root" ? `nth root of ${result.base}` : `${result.base} × 10^${result.exponent}`} · {result.result.toExponential(6)}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Scientific</div>
                    <div className="text-lg font-bold text-primary break-all">{result.result.toExponential(4)}</div>
                  </div>
                  <div className="p-3 text-center border-r border-border">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">log₁₀</div>
                    <div className="text-lg font-bold text-primary">{result.log10.toFixed(3)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Mode</div>
                    <div className="text-lg font-bold text-primary">{mode === "power" ? "Power" : mode === "root" ? "Root" : "Scientific"}</div>
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
                          <td className="p-2.5 pr-3 text-right font-semibold break-all">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">{mode === "power" ? "Value Across Exponents" : mode === "root" ? "Value Across Root Degrees" : "Value Across Powers of Ten"}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11 }} type="number" domain={["dataMin", "dataMax"]} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 3 }), "Value"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                      <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {summaryStats.map((s) => (
                      <div key={s.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="font-semibold break-all">{s.value}</span>
                      </div>
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
            <h2 className="text-2xl font-bold mb-3">About the Exponent Calculator</h2>
            <p>Exponentiation multiplies a base by itself a number of times: 2¹⁰ = 1,024. The rules that make it powerful: any base to the 0 is 1, negative exponents invert (2⁻³ = 1/8), and fractional exponents are roots (27^(1/3) = 3).</p>
            <h3>Exponents Everywhere</h3>
            <p>Compound growth is (1 + r)^t, sound intensity spans 10^12 in decibels, and scientific notation keeps the universe's scale manageable. The exponent is the single most important operation in modeling growth — linear in the exponent, explosive in the value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/exponent-calculator" />
          <PopularCalculators exclude="/calculator/exponent-calculator" />
        </div>
      </div>
    </>
  );
}
