"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, FlaskConical } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface GasInputs {
  p1: string;
  v1: string;
  t1: string;
  p2: string;
  t2: string;
}

interface GasResult {
  p1: number;
  v1: number;
  t1K: number;
  p2: number;
  t2K: number;
  v2: number;
  deltaV: number;
  pctChange: number;
  pRatio: number;
  tRatio: number;
  chartData: { name: string; volume: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation: P₁V₁/T₁ = P₂V₂/T₂ → V₂ = V₁·(P₁/P₂)·(T₂/T₁) ─────
const ABS_ZERO = 273.15;

function calculateGas(inputs: GasInputs): GasResult {
  const empty: GasResult = {
    p1: 0, v1: 0, t1K: 0, p2: 0, t2K: 0, v2: 0, deltaV: 0, pctChange: 0,
    pRatio: 0, tRatio: 0, chartData: [], isError: true,
  };
  const p1 = parseFloat(inputs.p1);
  const v1 = parseFloat(inputs.v1);
  const t1c = parseFloat(inputs.t1);
  const p2 = parseFloat(inputs.p2);
  const t2c = parseFloat(inputs.t2);

  if (isNaN(p1) || isNaN(v1) || isNaN(t1c) || isNaN(p2) || isNaN(t2c)) {
    return { ...empty, errorMsg: "Please enter valid numbers for all five fields." };
  }
  if (p1 <= 0 || v1 <= 0 || p2 <= 0) {
    return { ...empty, errorMsg: "Pressures and the initial volume must be greater than zero." };
  }
  if (t1c <= -ABS_ZERO || t2c <= -ABS_ZERO) {
    return { ...empty, errorMsg: "Temperatures must be above absolute zero (−273.15°C)." };
  }

  const t1 = t1c + ABS_ZERO;
  const t2 = t2c + ABS_ZERO;
  const v2 = (v1 * (p1 / p2) * (t2 / t1));
  const deltaV = v2 - v1;
  const pctChange = (deltaV / v1) * 100;

  return {
    p1, v1, t1K: t1, p2, t2K: t2, v2, deltaV, pctChange,
    pRatio: p1 / p2,
    tRatio: t2 / t1,
    chartData: [
      { name: "Initial", volume: +v1.toFixed(3) },
      { name: "Final", volume: +v2.toFixed(3) },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: GasInputs = { p1: "1.0", v1: "2.0", t1: "25", p2: "1.5", t2: "50" };

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix, step,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix: string; step?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
      />
      <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const CombinedGasLawCalculator = () => {
  const [inputs, setInputs] = useState<GasInputs>(DEFAULTS);
  const [result, setResult] = useState<GasResult>(() => calculateGas(DEFAULTS));

  useEffect(() => {
    setResult(calculateGas(DEFAULTS));
  }, []);

  const handleChange = (key: keyof GasInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));
  const handleCalculate = () => setResult(calculateGas(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateGas(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is the combined gas law?", answer: "The combined gas law merges Boyle's, Charles's, and Gay-Lussac's laws into one equation: P₁V₁/T₁ = P₂V₂/T₂. It describes how pressure, volume, and temperature of a fixed amount of gas change together, assuming the amount of gas (moles) stays constant." },
    { question: "Why must temperature be in Kelvin?", answer: "The law is a direct proportion through absolute zero, so temperatures must be converted to Kelvin (K = °C + 273.15). Using Celsius would break the ratio and can even produce negative volumes." },
    { question: "What units can I use?", answer: "Any consistent pressure and volume units work, since they appear as ratios. Pressure can be atm, kPa, mmHg, or psi — as long as both pressures use the same unit. Volume can be liters, mL, or cubic feet, matching both volumes." },
    { question: "When is the ideal gas law used instead?", answer: "The combined gas law applies when the amount of gas is fixed. When gas is added or removed (moles change), you need the full ideal gas law, PV = nRT. The combined law also assumes ideal behavior, which is very accurate at normal temperatures and pressures." },
    { question: "What is a real-world example?", answer: "A sealed soda can warmed in a car experiences rising pressure and volume — pressure and volume both respond to temperature. Deep-sea divers use the law to predict how a flexible container's volume changes with pressure and temperature while ascending." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Combined Gas Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Combined Gas Law Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="p1" label="Initial Pressure (P₁)" value={inputs.p1} onChange={(v) => handleChange("p1", v)} suffix="atm" step="0.1" />
              <CompactInput id="v1" label="Initial Volume (V₁)" value={inputs.v1} onChange={(v) => handleChange("v1", v)} suffix="L" step="0.1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="t1" label="Initial Temp (T₁)" value={inputs.t1} onChange={(v) => handleChange("t1", v)} suffix="°C" step="0.1" />
              <CompactInput id="p2" label="Final Pressure (P₂)" value={inputs.p2} onChange={(v) => handleChange("p2", v)} suffix="atm" step="0.1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="t2" label="Final Temp (T₂)" value={inputs.t2} onChange={(v) => handleChange("t2", v)} suffix="°C" step="0.1" />
              <div className="flex flex-col justify-end">
                <div className="h-10 flex items-center rounded-md border border-border bg-secondary/20 px-3 text-sm text-muted-foreground">
                  <FlaskConical className="h-4 w-4 mr-2 text-primary" /> Fixed gas amount
                </div>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Final Volume (V₂)</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.v2, 3)} <span className="text-xl">L</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.deltaV >= 0 ? "Expands" : "Contracts"} by {fmt(Math.abs(result.deltaV), 3)} L ({result.pctChange >= 0 ? "+" : ""}{fmt(result.pctChange)}%)
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Pressure Ratio", value: fmt(result.pRatio, 3), color: "text-primary" },
                    { label: "Temp Ratio", value: fmt(result.tRatio, 3), color: "text-primary" },
                    { label: "Volume Change", value: `${result.pctChange >= 0 ? "+" : ""}${fmt(result.pctChange)}%`, color: result.pctChange >= 0 ? "text-emerald-600" : "text-red-500" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Combined Gas Law Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Initial Pressure (P₁)", value: `${fmt(result.p1)} atm` },
                        { label: "Initial Volume (V₁)", value: `${fmt(result.v1, 3)} L` },
                        { label: "Initial Temp (T₁)", value: `${fmt(result.t1K - ABS_ZERO)} °C = ${fmt(result.t1K, 2)} K` },
                        { label: "Final Pressure (P₂)", value: `${fmt(result.p2)} atm` },
                        { label: "Final Temp (T₂)", value: `${fmt(result.t2K - ABS_ZERO)} °C = ${fmt(result.t2K, 2)} K` },
                        { label: "Pressure Factor (P₁/P₂)", value: fmt(result.pRatio, 3) },
                        { label: "Temp Factor (T₂/T₁)", value: fmt(result.tRatio, 3) },
                        { label: "Final Volume (V₂)", value: `${fmt(result.v2, 3)} L`, highlight: true },
                        { label: "Volume Change (ΔV)", value: `${result.deltaV >= 0 ? "+" : ""}${fmt(result.deltaV, 3)} L` },
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
                  <h3 className="text-base font-bold mb-3">Volume Comparison</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [`${fmt(value as number, 3)} L`, "Volume"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={70}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={idx === 1 ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">The final volume accounts for both the pressure change and the temperature change.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Initial Pressure", value: `${fmt(result.p1)} atm` },
                      { label: "Final Pressure", value: `${fmt(result.p2)} atm` },
                      { label: "Initial Volume", value: `${fmt(result.v1, 3)} L` },
                      { label: "Final Volume", value: `${fmt(result.v2, 3)} L` },
                      { label: "T₁ (Kelvin)", value: `${fmt(result.t1K, 2)} K` },
                      { label: "T₂ (Kelvin)", value: `${fmt(result.t2K, 2)} K` },
                      { label: "Volume Change", value: `${result.deltaV >= 0 ? "+" : ""}${fmt(result.deltaV, 3)} L` },
                      { label: "Percent Change", value: `${result.pctChange >= 0 ? "+" : ""}${fmt(result.pctChange)}%` },
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
            <h2 className="text-2xl font-bold mb-3">What Is the Combined Gas Law?</h2>
            <p>The combined gas law brings together Boyle's, Charles's, and Gay-Lussac's laws into a single relationship for a fixed amount of gas: <strong>P₁V₁/T₁ = P₂V₂/T₂</strong>. It describes how a gas responds when its pressure, volume, and temperature change at the same time — the usual situation in real life, where no single variable stays put.</p>

            <h2 className="text-2xl font-bold mb-3">How This Calculator Works</h2>
            <p>Enter the initial pressure, volume, and temperature plus the final pressure and temperature, and the calculator solves for the final volume: <strong>V₂ = V₁ × (P₁/P₂) × (T₂/T₁)</strong>. Both temperatures are converted to Kelvin first, since the law only holds in absolute temperature. The results panel shows the pressure factor and temperature factor separately, so you can see which change dominated.</p>
            <p>With the defaults — 2.0 L of gas at 1.0 atm and 25°C, heated to 50°C while pressure rises to 1.5 atm — the final volume is 1.445 L. The pressure increase squeezes the gas (factor 0.667), while the temperature rise expands it (factor 1.084); together they produce the net 27.8% contraction.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Component Laws</h2>
            <p><strong>Boyle's law</strong> (constant temperature): P₁V₁ = P₂V₂ — volume falls as pressure rises. <strong>Charles's law</strong> (constant pressure): V₁/T₁ = V₂/T₂ — volume rises with absolute temperature. <strong>Gay-Lussac's law</strong> (constant volume): P₁/T₁ = P₂/T₂ — pressure rises with temperature. The combined law is their product, valid whenever the amount of gas stays fixed.</p>

            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Weather balloons expand as they rise into lower-pressure, colder air. Scuba divers account for the volume changes their equipment experiences with depth and temperature. Tire pressure climbs on hot days and after long drives. In each case, the combined gas law predicts the new state — and knowing the numbers in advance makes the behavior expected rather than surprising.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/combined-gas-law-calculator" />
          <PopularCalculators exclude="/calculator/combined-gas-law-calculator" />
        </div>
      </div>
    </>
  );
};

export default CombinedGasLawCalculator;
