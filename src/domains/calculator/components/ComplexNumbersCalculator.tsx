"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, Sigma } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
type Op = "add" | "subtract" | "multiply" | "divide";

interface ComplexInputs {
  a: string;
  b: string;
  c: string;
  d: string;
  op: Op;
}

interface ComplexResult {
  a: number;
  b: number;
  c: number;
  d: number;
  op: Op;
  real: number;
  imag: number;
  magnitude: number;
  argumentDeg: number;
  conjugate: string;
  chartData: { name: string; value: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation ───────────────────────────────────────────────────
function calculateComplex(inputs: ComplexInputs): ComplexResult {
  const empty: ComplexResult = {
    a: 0, b: 0, c: 0, d: 0, op: inputs.op, real: 0, imag: 0,
    magnitude: 0, argumentDeg: 0, conjugate: "", chartData: [], isError: true,
  };
  const a = parseFloat(inputs.a);
  const b = parseFloat(inputs.b);
  const c = parseFloat(inputs.c);
  const d = parseFloat(inputs.d);
  if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d)) {
    return { ...empty, errorMsg: "Please enter valid numbers for all four parts." };
  }

  let real = 0;
  let imag = 0;
  switch (inputs.op) {
    case "add":
      real = a + c;
      imag = b + d;
      break;
    case "subtract":
      real = a - c;
      imag = b - d;
      break;
    case "multiply":
      // (a+bi)(c+di) = (ac − bd) + (ad + bc)i
      real = a * c - b * d;
      imag = a * d + b * c;
      break;
    case "divide": {
      // (a+bi)/(c+di) = ((ac + bd) + (bc − ad)i) / (c² + d²)
      const denom = c * c + d * d;
      if (denom === 0) {
        return { ...empty, errorMsg: "Division by zero — the second complex number cannot be (0 + 0i)." };
      }
      real = (a * c + b * d) / denom;
      imag = (b * c - a * d) / denom;
      break;
    }
  }

  const magnitude = Math.sqrt(real * real + imag * imag);
  const argumentDeg = real === 0 && imag === 0 ? 0 : (Math.atan2(imag, real) * 180) / Math.PI;
  const conjugate = `${fmtNum(real)} ${imag < 0 ? "−" : "+"} ${fmtNum(Math.abs(imag))}i`;

  return {
    a, b, c, d, op: inputs.op, real, imag, magnitude, argumentDeg, conjugate,
    chartData: [
      { name: "Real", value: real },
      { name: "Imaginary", value: imag },
    ],
    isError: false,
  };
}

const fmtNum = (n: number, d = 4) => n.toLocaleString("en-US", { maximumFractionDigits: d });
const fmt = (n: number, d = 3) => n.toLocaleString("en-US", { maximumFractionDigits: d });

function fmtComplex(real: number, imag: number): string {
  const r = fmt(real, 4);
  if (imag === 0) return `${r} + 0i`;
  const i = fmt(Math.abs(imag), 4);
  return imag > 0 ? `${r} + ${i}i` : `${r} − ${i}i`;
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: ComplexInputs = { a: "3", b: "2", c: "1", d: "4", op: "multiply" };

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
const ComplexNumbersCalculator = () => {
  const [inputs, setInputs] = useState<ComplexInputs>(DEFAULTS);
  const [result, setResult] = useState<ComplexResult>(() => calculateComplex(DEFAULTS));

  useEffect(() => {
    setResult(calculateComplex(DEFAULTS));
  }, []);

  const handleChange = (key: keyof ComplexInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateComplex(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateComplex(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const opLabels: Record<Op, string> = {
    add: "Add (z₁ + z₂)",
    subtract: "Subtract (z₁ − z₂)",
    multiply: "Multiply (z₁ × z₂)",
    divide: "Divide (z₁ ÷ z₂)",
  };

  const faqs = [
    { question: "What is a complex number?", answer: "A complex number combines a real part and an imaginary part: a + bi, where i² = −1. Complex numbers extend the number line into a plane, letting you represent and solve problems that real numbers cannot — from electrical AC circuits to quantum mechanics." },
    { question: "How is complex multiplication performed?", answer: "Multiply term by term and use i² = −1: (a + bi)(c + di) = ac + adi + bci + bdi² = (ac − bd) + (ad + bc)i. With (3 + 2i)(1 + 4i), that gives (3 − 8) + (12 + 2)i = −5 + 14i." },
    { question: "What is the magnitude of a complex number?", answer: "The magnitude (modulus) is the distance from the origin to the point (a, b) in the complex plane: |z| = √(a² + b²). For −5 + 14i, |z| = √(25 + 196) ≈ 14.87. It generalizes the absolute value of a real number." },
    { question: "What is the argument of a complex number?", answer: "The argument is the angle the number makes with the positive real axis, measured in degrees: θ = atan2(b, a). Together with the magnitude it forms polar form, z = |z|(cos θ + i·sin θ), which makes powers and roots of complex numbers much easier." },
    { question: "How does division by a complex number work?", answer: "Multiply numerator and denominator by the conjugate of the denominator: (a + bi)/(c + di) = ((a + bi)(c − di))/(c² + d²). The denominator becomes a real number, so the result splits cleanly into real and imaginary parts. Division by zero is undefined, as with real numbers." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Math", href: "/calculator#math" }, { label: "Complex Numbers Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Complex Numbers Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div>
              <label className="text-sm font-medium mb-1">Operation</label>
              <div className="relative h-10">
                <select
                  value={inputs.op}
                  onChange={(e) => handleChange("op", e.target.value)}
                  className="w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium"
                >
                  {(["add", "subtract", "multiply", "divide"] as Op[]).map((o) => <option key={o} value={o}>{opLabels[o]}</option>)}
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">First Number z₁ = a + bi</div>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="a-part" label="Real (a)" value={inputs.a} onChange={(v) => handleChange("a", v)} />
                <CompactInput id="b-part" label="Imaginary (b)" value={inputs.b} onChange={(v) => handleChange("b", v)} />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Second Number z₂ = c + di</div>
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="c-part" label="Real (c)" value={inputs.c} onChange={(v) => handleChange("c", v)} />
                <CompactInput id="d-part" label="Imaginary (d)" value={inputs.d} onChange={(v) => handleChange("d", v)} />
              </div>
            </div>

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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Result ({opLabels[result.op]})</div>
                  <div className="text-3xl md:text-4xl font-bold text-primary break-words">
                    {fmtComplex(result.real, result.imag)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Magnitude {fmt(result.magnitude)} · Argument {fmt(result.argumentDeg)}°
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Real Part", value: fmt(result.real, 4), color: "text-primary" },
                    { label: "Imaginary Part", value: fmt(result.imag, 4), color: "text-primary" },
                    { label: "Magnitude |z|", value: fmt(result.magnitude), color: "text-emerald-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Result Analysis</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "z₁", value: `${fmt(result.a, 4)} ${result.b < 0 ? "−" : "+"} ${fmt(Math.abs(result.b), 4)}i` },
                        { label: "z₂", value: `${fmt(result.c, 4)} ${result.d < 0 ? "−" : "+"} ${fmt(Math.abs(result.d), 4)}i` },
                        { label: "Operation", value: opLabels[result.op] },
                        { label: "Real Part", value: fmt(result.real, 4) },
                        { label: "Imaginary Part", value: fmt(result.imag, 4) },
                        { label: "Result (a + bi)", value: fmtComplex(result.real, result.imag), highlight: true },
                        { label: "Magnitude |z|", value: fmt(result.magnitude, 4) },
                        { label: "Argument (θ)", value: `${fmt(result.argumentDeg)}°` },
                        { label: "Conjugate z̄", value: result.conjugate },
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
                  <h3 className="text-base font-bold mb-3">Real vs Imaginary Components</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [fmt(value as number, 4), ""]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={idx === 0 ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">The result plotted as its real and imaginary components in the complex plane.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Real Part", value: fmt(result.real, 4) },
                      { label: "Imaginary Part", value: fmt(result.imag, 4) },
                      { label: "Magnitude |z|", value: fmt(result.magnitude, 4) },
                      { label: "Argument", value: `${fmt(result.argumentDeg)}°` },
                      { label: "Conjugate", value: result.conjugate },
                      { label: "z₁", value: `${fmt(result.a, 3)} + ${fmt(result.b, 3)}i` },
                      { label: "z₂", value: `${fmt(result.c, 3)} + ${fmt(result.d, 3)}i` },
                      { label: "Operation", value: opLabels[result.op].split(" ")[0] },
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
            <h2 className="text-2xl font-bold mb-3">What Are Complex Numbers?</h2>
            <p>A complex number is written a + bi, where a is the real part, b is the imaginary part, and i is the imaginary unit with the defining property i² = −1. Complex numbers live on a two-dimensional plane — the real axis running horizontally and the imaginary axis vertically — which makes them the natural language for anything that oscillates, rotates, or involves phase.</p>

            <h2 className="text-2xl font-bold mb-3">Arithmetic in the Complex Plane</h2>
            <p>Addition and subtraction combine corresponding parts: (a + bi) + (c + di) = (a + c) + (b + d)i. Multiplication distributes term by term and simplifies with i² = −1, so (3 + 2i)(1 + 4i) = 3 + 12i + 2i + 8i² = −5 + 14i. Division multiplies both numerator and denominator by the denominator's conjugate, turning the denominator real and producing a clean split into real and imaginary parts.</p>

            <h2 className="text-2xl font-bold mb-3">Magnitude and Argument</h2>
            <p>Every complex number has a polar description: its magnitude |z| = √(a² + b²), the distance from the origin, and its argument θ = atan2(b, a), the angle from the positive real axis. For −5 + 14i the magnitude is about 14.87 and the argument about 109.7°. Polar form, z = |z|(cos θ + i sin θ), is where powers and roots become trivial — a key reason electrical engineers analyze AC circuits in the complex domain.</p>

            <h2 className="text-2xl font-bold mb-3">Where Complex Numbers Are Used</h2>
            <p>Electrical engineering models AC voltage and current as complex phasors, combining magnitude and phase in one number. Signal processing and control theory rely on complex frequency analysis. Quantum mechanics is built on complex wave functions, and fractal geometry — like the Mandelbrot set — is defined entirely by iterating a complex quadratic. This calculator handles the four core operations plus the magnitude, argument, and conjugate you need to work confidently in that plane.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/complex-numbers-calculator" />
          <PopularCalculators exclude="/calculator/complex-numbers-calculator" />
        </div>
      </div>
    </>
  );
};

export default ComplexNumbersCalculator;
