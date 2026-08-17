"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, ThermometerSun } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
interface CharlesInputs {
  initialVolume: string;
  initialTemp: string;
  finalTemp: string;
}

interface CharlesResult {
  initialVolume: number;
  initialTempC: number;
  finalTempC: number;
  initialTempK: number;
  finalTempK: number;
  finalVolume: number;
  deltaV: number;
  pctChange: number;
  ratio: number;
  chartData: { name: string; volume: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Pure calculation (Charles's Law: V₁/T₁ = V₂/T₂ at constant pressure) ─
const ABS_ZERO = 273.15;

function calculateCharles(inputs: CharlesInputs): CharlesResult {
  const v1 = parseFloat(inputs.initialVolume);
  const t1c = parseFloat(inputs.initialTemp);
  const t2c = parseFloat(inputs.finalTemp);
  const empty: CharlesResult = {
    initialVolume: 0, initialTempC: 0, finalTempC: 0, initialTempK: 0, finalTempK: 0,
    finalVolume: 0, deltaV: 0, pctChange: 0, ratio: 0, chartData: [], isError: true,
  };

  if (isNaN(v1) || isNaN(t1c) || isNaN(t2c)) {
    return { ...empty, errorMsg: "Please enter valid numbers for all three fields." };
  }
  if (v1 <= 0) {
    return { ...empty, errorMsg: "Initial volume must be greater than zero." };
  }
  if (t1c <= -ABS_ZERO || t2c <= -ABS_ZERO) {
    return { ...empty, errorMsg: "Temperature must be above absolute zero (−273.15°C)." };
  }

  const t1 = t1c + ABS_ZERO;
  const t2 = t2c + ABS_ZERO;
  const v2 = (v1 * t2) / t1;
  const deltaV = v2 - v1;
  const pctChange = (deltaV / v1) * 100;
  const ratio = t2 / t1;

  return {
    initialVolume: v1,
    initialTempC: t1c,
    finalTempC: t2c,
    initialTempK: t1,
    finalTempK: t2,
    finalVolume: v2,
    deltaV,
    pctChange,
    ratio,
    chartData: [
      { name: "Initial", volume: +v1.toFixed(3) },
      { name: "Final", volume: +v2.toFixed(3) },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: CharlesInputs = { initialVolume: "2.0", initialTemp: "25", finalTemp: "50" };

const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const CompactInput = ({
  id, label, value, onChange, suffix, step,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string; step?: string;
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
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

// ── 4. Component ──────────────────────────────────────────────────────────
const CharlesLawCalculator = () => {
  const [inputs, setInputs] = useState<CharlesInputs>(DEFAULTS);
  const [result, setResult] = useState<CharlesResult>(() => calculateCharles(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);

  useEffect(() => {
    setResult(calculateCharles(DEFAULTS));
  }, []);

  const handleChange = (key: keyof CharlesInputs, val: string) => setInputs((p) => ({ ...p, [key]: val }));

  const handleCalculate = () => setResult(calculateCharles(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCharles(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const faqs = [
    { question: "What is Charles's Law?", answer: "Charles's Law states that at constant pressure, the volume of a fixed amount of gas is directly proportional to its absolute temperature: V₁/T₁ = V₂/T₂. When temperature rises, the gas molecules move faster and push the container outward, so volume increases proportionally." },
    { question: "Why must temperature be in Kelvin?", answer: "Charles's Law only works with absolute temperature (Kelvin), because the relationship is a direct proportion through absolute zero. Converting Celsius to Kelvin is simple: K = °C + 273.15. Using Celsius directly would produce wrong and sometimes negative volumes." },
    { question: "What is absolute zero and why does it matter?", answer: "Absolute zero (−273.15°C or 0 K) is the temperature at which gas molecules have zero kinetic energy and a gas would theoretically occupy zero volume. Charles's Law implies volume reaches zero at 0 K, which is why the calculator rejects temperatures at or below it." },
    { question: "What are common real-world examples?", answer: "A balloon left in a hot car expands, a balloon in a freezer shrinks, and hot-air balloons rise because the heated air inside expands and becomes less dense than the cooler air outside. Breathing also relies on the same expansion of warmed air in the lungs." },
    { question: "What are the units of volume?", answer: "Any consistent volume unit works — liters, milliliters, cubic meters, or cubic feet. The calculator preserves your input unit for the result, so 2.0 L at 25°C heated to 50°C gives 2.17 L." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Charles Law Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Charles Law Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="initial-volume" label="Initial Volume" value={inputs.initialVolume} onChange={(v) => handleChange("initialVolume", v)} suffix="L" step="0.1" />
              <CompactInput id="initial-temp" label="Initial Temp" value={inputs.initialTemp} onChange={(v) => handleChange("initialTemp", v)} suffix="°C" step="0.1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="final-temp" label="Final Temp" value={inputs.finalTemp} onChange={(v) => handleChange("finalTemp", v)} suffix="°C" step="0.1" />
              <div className="flex flex-col justify-end">
                <div className="h-10 flex items-center rounded-md border border-border bg-secondary/20 px-3 text-sm text-muted-foreground">
                  <ThermometerSun className="h-4 w-4 mr-2 text-primary" /> Constant pressure assumed
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Final Volume</div>
                  <div className="text-4xl font-bold text-primary">
                    {fmt(result.finalVolume, 3)} <span className="text-xl">L</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {result.deltaV >= 0 ? "Expands" : "Contracts"} by {fmt(Math.abs(result.deltaV), 3)} L ({result.pctChange >= 0 ? "+" : ""}{fmt(result.pctChange)}%)
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Temp Ratio", value: `${fmt(result.ratio, 4)}`, color: "text-primary" },
                    { label: "Volume Change", value: `${result.deltaV >= 0 ? "+" : ""}${fmt(result.deltaV, 3)} L`, color: result.deltaV >= 0 ? "text-emerald-600" : "text-red-500" },
                    { label: "Change", value: `${result.pctChange >= 0 ? "+" : ""}${fmt(result.pctChange)}%`, color: result.pctChange >= 0 ? "text-emerald-600" : "text-red-500" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Charles's Law Breakdown</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Initial Volume (V₁)", value: `${fmt(result.initialVolume, 3)} L` },
                        { label: "Initial Temp (T₁)", value: `${fmt(result.initialTempC)} °C = ${fmt(result.initialTempK, 2)} K` },
                        { label: "Final Temp (T₂)", value: `${fmt(result.finalTempC)} °C = ${fmt(result.finalTempK, 2)} K` },
                        { label: "Temperature Ratio (T₂/T₁)", value: fmt(result.ratio, 4) },
                        { label: "Final Volume (V₂)", value: `${fmt(result.finalVolume, 3)} L`, highlight: true },
                        { label: "Volume Change (ΔV)", value: `${result.deltaV >= 0 ? "+" : ""}${fmt(result.deltaV, 3)} L` },
                        { label: "Percent Change", value: `${result.pctChange >= 0 ? "+" : ""}${fmt(result.pctChange)}%` },
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
                        <ReferenceLine y={result.initialVolume} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                        <Bar dataKey="volume" radius={[4, 4, 0, 0]} maxBarSize={70}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={idx === 1 ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">The dashed line marks the initial volume — the final bar shows the effect of the temperature change.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Initial Volume", value: `${fmt(result.initialVolume, 3)} L` },
                      { label: "Final Volume", value: `${fmt(result.finalVolume, 3)} L` },
                      { label: "T₁ (Kelvin)", value: `${fmt(result.initialTempK, 2)} K` },
                      { label: "T₂ (Kelvin)", value: `${fmt(result.finalTempK, 2)} K` },
                      { label: "Volume Change", value: `${result.deltaV >= 0 ? "+" : ""}${fmt(result.deltaV, 3)} L` },
                      { label: "Percent Change", value: `${result.pctChange >= 0 ? "+" : ""}${fmt(result.pctChange)}%` },
                      { label: "Temp Ratio", value: fmt(result.ratio, 4) },
                      { label: "Pressure", value: "Constant" },
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
            <h2 className="text-2xl font-bold mb-3">What Is Charles's Law?</h2>
            <p>Charles's Law — named after French physicist Jacques Charles, who discovered the relationship in the 1780s — describes how gases expand when heated at constant pressure. The law states that the volume of a fixed amount of gas is directly proportional to its absolute temperature: <strong>V₁/T₁ = V₂/T₂</strong>. This means that if you double the absolute temperature of a gas, its volume doubles as well, as long as the pressure stays the same.</p>
            <p>The proportionality only holds when temperature is measured in Kelvin, because the Kelvin scale starts at absolute zero. The Celsius and Fahrenheit scales are offsets from that zero point, so they break the direct ratio. That is why this calculator automatically converts every Celsius input to Kelvin before applying the formula.</p>

            <h2 className="text-2xl font-bold mb-3">How the Charles Law Calculator Works</h2>
            <p>Enter the initial volume of the gas, its starting temperature, and the temperature it will reach. The calculator converts both temperatures to Kelvin (K = °C + 273.15) and solves for the final volume using <strong>V₂ = V₁ × (T₂ / T₁)</strong>. It also reports the temperature ratio, the absolute change in volume, and the percentage change so you can quickly see whether the gas expands or contracts and by how much.</p>
            <p>For example, a 2.0 L balloon at 25°C heated to 50°C rises to 2.17 L — an 8.4% expansion. Cool the same balloon to 0°C and it would shrink to 1.83 L, because colder gas molecules move more slowly and exert less pressure on the container.</p>

            <h2 className="text-2xl font-bold mb-3">Real-World Applications</h2>
            <p>Charles's Law explains everyday phenomena: hot-air balloons rise because heated air expands and becomes less dense; a basketball left in a hot car feels firmer; a balloon brought into a cold room shrinks. Industry relies on the same principle for gas storage, engine design, and weather balloons — meteorologists use the expansion of a gas-filled balloon to measure upper-atmosphere conditions. In medicine, anesthesia vaporizers and respiratory equipment are designed around the predictable expansion of gases with temperature.</p>

            <h2 className="text-2xl font-bold mb-3">Limits of the Law</h2>
            <p>Charles's Law is exact only for ideal gases at constant pressure. Real gases deviate slightly at high pressures and low temperatures, when intermolecular forces become significant. It also stops being meaningful at extreme temperatures — at 0 K (−273.15°C), a hypothetical ideal gas would occupy zero volume, which is why the calculator rejects inputs at or below absolute zero.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/charles-law-calculator" />
          <PopularCalculators exclude="/calculator/charles-law-calculator" />
        </div>
      </div>
    </>
  );
};

export default CharlesLawCalculator;
