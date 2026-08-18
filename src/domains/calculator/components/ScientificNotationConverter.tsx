"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface NotationInputs {
  value: string;
}

interface PrefixRow {
  name: string;
  value: number;
}

interface NotationResult {
  value: number;
  scientificMantissa: string;
  scientificExponent: number;
  engineeringMantissa: string;
  engineeringExponent: number;
  standard: string;
  sigFigs: number;
  prefixRows: PrefixRow[];
}

// ── 2. SI prefixes (chart) ──────────────────────────────────────────────────
const PREFIXES: { name: string; factor: number }[] = [
  { name: "pico", factor: 1e-12 },
  { name: "nano", factor: 1e-9 },
  { name: "micro", factor: 1e-6 },
  { name: "milli", factor: 1e-3 },
  { name: "base", factor: 1 },
  { name: "kilo", factor: 1e3 },
  { name: "mega", factor: 1e6 },
  { name: "giga", factor: 1e9 },
];

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: NotationInputs = {
  value: "1.5e-7",
};

// ── 4. Pure calculation functions ───────────────────────────────────────────
function countSigFigs(input: string): number {
  const cleaned = input.trim().toLowerCase().replace(/^[+-]/, "");
  let mantissa = cleaned;
  if (mantissa.includes("e")) mantissa = mantissa.split("e")[0];
  mantissa = mantissa.replace(".", "");
  // strip leading zeros
  mantissa = mantissa.replace(/^0+/, "");
  // strip trailing zeros if no decimal point was present in the original
  if (!cleaned.split("e")[0].includes(".")) mantissa = mantissa.replace(/0+$/, "");
  return mantissa.length || 1;
}

function calculate(inputs: NotationInputs): NotationResult {
  const v = parseFloat(inputs.value);
  const abs = Math.abs(v);
  let sciMantissa = "0";
  let sciExp = 0;
  let engMantissa = "0";
  let engExp = 0;
  if (v !== 0 && isFinite(v)) {
    const exp = Math.floor(Math.log10(abs));
    sciExp = exp;
    sciMantissa = (v / Math.pow(10, exp)).toFixed(6).replace(/\.?0+$/, "");
    engExp = 3 * Math.floor(exp / 3);
    engMantissa = (v / Math.pow(10, engExp)).toFixed(6).replace(/\.?0+$/, "");
  }
  const standard = v.toLocaleString("en-US", { maximumFractionDigits: 12 });
  const prefixRows: PrefixRow[] = PREFIXES.map((p) => ({
    name: p.name,
    value: v / p.factor,
  }));
  return {
    value: v,
    scientificMantissa: sciMantissa,
    scientificExponent: sciExp,
    engineeringMantissa: engMantissa,
    engineeringExponent: engExp,
    standard,
    sigFigs: countSigFigs(inputs.value),
    prefixRows,
  };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const ScientificNotationConverter = () => {
  const [inputs, setInputs] = useState<NotationInputs>(DEFAULTS);
  const [result, setResult] = useState<NotationResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const parsed = parseFloat(inputs.value);
  const invalid = isNaN(parsed) || inputs.value.trim() === "" || !isFinite(parsed);

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const fmt = (n: number) => {
    if (Math.abs(n) !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e9)) return n.toExponential(4);
    return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
  };

  const chartData = result.prefixRows
    .filter((r) => r.value > 0)
    .map((r) => ({ name: r.name, value: r.value }));

  const sup = (n: number) => (n < 0 ? `⁻${String(Math.abs(n))}` : String(n));

  const faqs = [
    { question: "What is scientific notation?", answer: "Scientific notation expresses a number as a coefficient between 1 and 10 multiplied by a power of ten — for example 1.5 × 10⁻⁷. It makes very large and very small numbers compact and easier to compare." },
    { question: "What is engineering notation?", answer: "Engineering notation is scientific notation restricted to exponents that are multiples of three (10⁰, 10³, 10⁶, 10⁻³, 10⁻⁶, ...), so the coefficient stays between 1 and 1000. This aligns directly with SI prefixes: 150 × 10⁻⁹ s is read as 150 nanoseconds." },
    { question: "How do I type scientific notation?", answer: "Use the 'e' notation: 1.5e-7 means 1.5 × 10⁻⁷, and 6.02e23 means 6.02 × 10²³. Every calculator and spreadsheet accepts this format." },
    { question: "Why does engineering notation use 150e-9 instead of 1.5e-7?", answer: "Both represent the same number, but engineering exponents must be multiples of three so the value maps to an SI prefix: 150 × 10⁻⁹ = 150 nanoseconds, whereas 1.5 × 10⁻⁷ has no direct prefix reading." },
    { question: "What are significant figures?", answer: "Significant figures are the meaningful digits of a number, excluding leading zeros and placeholder zeros. They communicate measurement precision — 1.50 × 10⁻⁷ (3 sig figs) implies more precision than 1.5 × 10⁻⁷ (2 sig figs)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Scientific Notation Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Scientific Notation Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="sci-value" className="text-sm font-medium text-foreground mb-1">Number (decimal or e-notation)</label>
                <input
                  id="sci-value"
                  type="text"
                  inputMode="decimal"
                  value={inputs.value}
                  onChange={(e) => setInputs({ value: e.target.value })}
                  placeholder="e.g. 1.5e-7 or 0.00000015"
                  className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-mono ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter a valid number (e.g. 1.5e-7)</p>}
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={run}
                disabled={invalid}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 print-section">
            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Scientific Notation</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">
                {result.scientificMantissa} × 10<sup>{sup(result.scientificExponent)}</sup>
              </div>
              <div className="text-sm text-muted-foreground font-medium">= {result.standard}</div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Engineering</span>
                <span className="font-extrabold text-emerald-600">{result.engineeringMantissa} × 10<sup>{sup(result.engineeringExponent)}</sup></span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Standard Form</span>
                <span className="font-extrabold text-foreground">{result.standard}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sig. Figures</span>
                <span className="font-extrabold text-primary">{result.sigFigs}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Representation</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">Scientific Notation</td>
                    <td className="p-2.5 pr-3 text-right font-bold text-amber-700">{result.scientificMantissa} × 10<sup>{sup(result.scientificExponent)}</sup></td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Engineering Notation</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{result.engineeringMantissa} × 10<sup>{sup(result.engineeringExponent)}</sup></td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Standard Decimal</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{result.standard}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Mantissa (Coefficient)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{result.scientificMantissa}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Exponent (Base 10)</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{result.scientificExponent}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Significant Figures</td>
                    <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{result.sigFigs}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Value Expressed with Each SI Prefix</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" scale="log" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Value"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16} fill="hsl(var(--primary))">
                    {chartData.map((d) => <Cell key={d.name} fill={d.value === 1 ? "#f59e0b" : "hsl(var(--primary))"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Reading example: 1.5e-7 = 150 nano-units. Log scale.</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Input", value: inputs.value },
                  { label: "Scientific", value: `${result.scientificMantissa} × 10^${result.scientificExponent}` },
                  { label: "Engineering", value: `${result.engineeringMantissa} × 10^${result.engineeringExponent}` },
                  { label: "Standard Form", value: result.standard },
                  { label: "Mantissa", value: result.scientificMantissa },
                  { label: "Significant Figures", value: String(result.sigFigs) },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Scientific Notation Matters</h2>
            <p>Science deals with quantities that span more than forty orders of magnitude — from the 10⁻³⁵ second Planck time to the 10⁴³-second age of the universe. Writing such numbers in ordinary decimal form is impractical and error-prone, which is why scientists standardized on scientific notation: a coefficient between 1 and 10 multiplied by a power of ten. The charge of an electron, 1.602 × 10⁻¹⁹ coulombs, and Avogadro's number, 6.022 × 10²³, are instantly readable in this form, whereas their decimal expansions would fill entire lines with zeros.</p>
            <p>Engineering notation is a practical variant used across electrical engineering and computing. By restricting the exponent to multiples of three, the notation maps one-to-one onto SI prefixes — 10⁻⁹ is nano, 10⁻⁶ is micro, 10³ is kilo, 10⁶ is mega. A capacitor value of 470 × 10⁻⁹ farads is read directly as 470 nanofarads, and a data rate of 1.25 × 10⁹ bytes per second becomes 1.25 gigabytes per second. This converter produces both forms simultaneously, along with the standard decimal expansion and the significant-figure count, so engineers, students, and researchers can move between representations without transcription errors.</p>
            <h2 className="text-2xl font-bold mb-3">Significant Figures and Precision</h2>
            <p>The number of significant figures a measurement carries communicates its precision. In scientific notation this information is preserved explicitly: 1.5 × 10⁻⁷ carries two significant figures, while 1.500 × 10⁻⁷ carries four, meaning the measurement is known to a hundredth of the smallest digit shown. Decimal notation often obscures this — 0.00000015 and 0.000000150 look nearly identical on a page but state different precision. Our converter counts the significant figures from your input using standard rules, dropping leading zeros and trailing placeholder zeros, so you can verify that your calculations preserve the precision of the original data through every step.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/scientific-notation-converter" />
          <PopularCalculators exclude="/calculator/scientific-notation-converter" />
        </div>
      </div>
    </>
  );
};

export default ScientificNotationConverter;
