"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface TwoCompInputs {
  value: string;
  bits: string;
}

interface TwoCompResult {
  decimal: number;
  bits: number;
  binary: string;
  hex: string;
  unsigned: number;
  min: number;
  max: number;
  overflow: boolean;
  bitValues: { position: number; bit: number }[];
}

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: TwoCompInputs = {
  value: "-128",
  bits: "8",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: TwoCompInputs): TwoCompResult {
  const decimal = Math.trunc(parseFloat(inputs.value) || 0);
  const bits = Math.max(2, Math.min(64, parseInt(inputs.bits) || 8));
  const min = -Math.pow(2, bits - 1);
  const max = Math.pow(2, bits - 1) - 1;
  const overflow = decimal < min || decimal > max;
  // two's complement wrap
  const wrapped = ((decimal % Math.pow(2, bits)) + Math.pow(2, bits)) % Math.pow(2, bits);
  const binary = wrapped.toString(2).padStart(bits, "0");
  const hexLen = Math.ceil(bits / 4);
  const hex = wrapped.toString(16).toUpperCase().padStart(hexLen, "0");
  const unsigned = wrapped;
  const bitValues = binary
    .split("")
    .map((b, i) => ({ position: bits - 1 - i, bit: parseInt(b, 10) }));
  return { decimal, bits, binary, hex, unsigned, min, max, overflow, bitValues };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const TwoComplementCalculator = () => {
  const [inputs, setInputs] = useState<TwoCompInputs>(DEFAULTS);
  const [result, setResult] = useState<TwoCompResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<TwoCompInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const parsed = parseFloat(inputs.value);
  const invalid = isNaN(parsed) || inputs.value.trim() === "" || !Number.isInteger(parsed);
  const bitsNum = parseInt(inputs.bits) || 8;

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const chartData = result.bitValues.slice().reverse().map((b) => ({
    name: `2^${b.position}`,
    value: b.bit,
  }));

  const faqs = [
    { question: "What is two's complement?", answer: "Two's complement is the standard way computers represent signed integers. The most significant bit acts as the sign, and negative numbers are formed by inverting all bits and adding one. An 8-bit value ranges from −128 to +127." },
    { question: "Why is −128 the minimum for 8 bits?", answer: "With 8 bits, two's complement represents 256 values. Half — 0 to +127 — are non-negative, and the other half — −128 to −1 — are negative. 10000000 is −128, not +128." },
    { question: "How do I negate a number in two's complement?", answer: "Invert every bit, then add 1. For example, +5 is 00000101; inverting gives 11111010; adding 1 gives 11111011 = −5." },
    { question: "What happens on overflow?", answer: "If the value is outside the representable range — below −2^(n−1) or above 2^(n−1)−1 — it wraps around. Our calculator flags this so you can widen the bit width instead of trusting a wrapped result." },
    { question: "What is the unsigned interpretation?", answer: "The same bit pattern read without a sign bit. 11111111 is −1 as signed but 255 as unsigned. The calculator shows both readings." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Two's Complement Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Two's Complement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="tc-value" className="text-sm font-medium text-foreground mb-1">Decimal Value</label>
                <input
                  id="tc-value"
                  type="number"
                  step="1"
                  value={inputs.value}
                  onChange={(e) => set({ value: e.target.value })}
                  className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter an integer</p>}
              </div>
              <div className="flex flex-col">
                <label htmlFor="tc-bits" className="text-sm font-medium text-foreground mb-1">Bit Width</label>
                <select
                  id="tc-bits"
                  value={inputs.bits}
                  onChange={(e) => set({ bits: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {["8", "16", "32", "64"].map((b) => <option key={b} value={b}>{b} bits</option>)}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <div className="p-3 rounded-lg bg-secondary/20 border border-border mt-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Range for Selected Width</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Signed Range</span>
                    <span className="font-extrabold text-foreground">−2^{bitsNum - 1} … 2^{bitsNum - 1}−1</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">Unsigned Range</span>
                    <span className="font-extrabold text-foreground">0 … 2^{bitsNum}−1</span>
                  </div>
                </div>
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
              {result.overflow ? (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Out of Range</div>
                  <div className="text-3xl font-bold text-red-500 mb-1 tracking-tight">Overflow</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {result.decimal} is outside {result.bits}-bit signed range ({result.min} … {result.max})
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{result.bits}-bit Two's Complement</div>
                  <div className="text-3xl font-bold text-primary mb-1 tracking-tight break-all font-mono">{result.binary}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    0x{result.hex} · unsigned {result.unsigned}
                  </div>
                </>
              )}
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Signed Value</span>
                <span className="font-extrabold text-foreground">{result.decimal}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Unsigned</span>
                <span className="font-extrabold text-emerald-600">{result.unsigned}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hex</span>
                <span className="font-extrabold text-primary">0x{result.hex}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Property</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="bg-amber-500/10">
                    <td className="p-2.5 pl-3 font-semibold text-amber-700">Two's Complement Binary</td>
                    <td className="p-2.5 pr-3 text-right font-bold text-amber-700 font-mono">{result.binary}</td>
                  </tr>
                  {[
                    { label: "Decimal (signed)", value: String(result.decimal) },
                    { label: "Unsigned Decimal", value: String(result.unsigned) },
                    { label: "Hexadecimal", value: `0x${result.hex}` },
                    { label: "Bit Width", value: `${result.bits} bits` },
                    { label: "Signed Range", value: `${result.min} … ${result.max}` },
                    { label: "MSB (sign bit)", value: result.binary[0] },
                  ].map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Bit Pattern (LSB → MSB)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} tickLine={false} interval={0} />
                  <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} width={26} />
                  <Tooltip formatter={(v: number) => [String(v), "Bit"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={22}>
                    {chartData.map((d, i) => <Cell key={i} fill={d.value === 1 ? "hsl(var(--primary))" : "#d4d4d8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Each bar is one bit — filled = 1, light = 0</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Decimal", value: String(result.decimal) },
                  { label: "Binary", value: result.binary },
                  { label: "Hexadecimal", value: `0x${result.hex}` },
                  { label: "Unsigned", value: String(result.unsigned) },
                  { label: "Bit Width", value: `${result.bits} bits` },
                  { label: "One's Complement", value: (result.decimal >= 0 ? result.unsigned : result.unsigned - 1).toString(2).padStart(result.bits, "0") },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{item.label}</span>
                    <span className="text-sm font-extrabold text-foreground break-all">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why Computers Use Two's Complement</h2>
            <p>Computer arithmetic needs a way to represent negative numbers that lets the same addition circuit handle both positive and negative operands. Two's complement achieves this elegantly: the most significant bit carries the sign, negative values are produced by inverting all bits and adding one, and — crucially — addition, subtraction, and multiplication work identically on signed and unsigned patterns. Adding 1 to 11111111 wraps to 00000000, which is why −1 plus 1 equals 0 without any special-case logic. This single property is why virtually every processor since the 1960s has used two's complement.</p>
            <p>The range of an n-bit two's complement value is asymmetric: −2^(n−1) through +2^(n−1)−1. An 8-bit byte holds −128 to +127, a 16-bit word −32,768 to +32,767, and a 32-bit integer roughly ±2.1 billion. Programmers meet this asymmetry constantly — the classic off-by-one of signed overflow, the sentinel value of −128 in pixel data, and the reason unsigned types double the positive range at the cost of losing negative values. This calculator converts any integer into its two's complement representation at a chosen bit width and flags overflow so a wrapped result never sneaks into your code silently.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Bit Pattern</h2>
            <p>Each position in the binary output is a power of two, and in two's complement the most significant bit contributes negatively: for an 8-bit pattern, bit 7 is worth −128 rather than +128. The chart in this calculator plots every bit from least to most significant, and the breakdown table reports the signed value, the unsigned interpretation of the same pattern, and the hexadecimal shorthand. Change the bit width from 8 to 16 or 32 and watch the sign extension fill the new high-order bits — the same negative value gains leading ones in exactly the way a compiler's implicit widening does.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/two-complement-calculator" />
          <PopularCalculators exclude="/calculator/two-complement-calculator" />
        </div>
      </div>
    </>
  );
};

export default TwoComplementCalculator;
