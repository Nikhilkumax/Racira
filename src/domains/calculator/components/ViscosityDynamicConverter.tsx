"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface ViscosityUnit {
  id: string;
  name: string;
  factor: number; // multiplier to pascal-seconds
}

interface ConverterInputs {
  value: string;
  from: string;
  to: string;
  digits: string;
}

interface ViscosityRow {
  name: string;
  value: number;
  isTarget: boolean;
}

interface ConverterResult {
  toValue: number;
  baseValue: number;
  baseUnit: string;
  factor: number;
  rows: ViscosityRow[];
}

// ── 2. Unit table (all factors → Pa·s) ──────────────────────────────────────
const UNITS: ViscosityUnit[] = [
  { id: "pas", name: "Pascal-second (Pa·s)", factor: 1 },
  { id: "mpas", name: "Millipascal-second (mPa·s)", factor: 0.001 },
  { id: "poise", name: "Poise (P)", factor: 0.1 },
  { id: "cp", name: "Centipoise (cP)", factor: 0.001 },
  { id: "kgms", name: "Kilogram/meter-second (kg/(m·s))", factor: 1 },
  { id: "lbfft2", name: "Pound-force·s/ft² (lbf·s/ft²)", factor: 47.8803 },
  { id: "lbfts", name: "Pound/foot-second (lb/(ft·s))", factor: 1.48816 },
  { id: "dynecm2", name: "Dyne·s/cm² (dyn·s/cm²)", factor: 0.1 },
];

// ── 3. DEFAULTS (realistic: water at 20 °C ≈ 1.002 cP) ─────────────────────
const DEFAULTS: ConverterInputs = {
  value: "1.002",
  from: "cp",
  to: "pas",
  digits: "4",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: ConverterInputs): ConverterResult {
  const value = parseFloat(inputs.value);
  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[3];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];
  const baseValue = value * fromUnit.factor;
  const toValue = baseValue / toUnit.factor;
  const rows: ViscosityRow[] = UNITS.map((u) => ({
    name: u.name,
    value: baseValue / u.factor,
    isTarget: u.id === toUnit.id,
  }));
  return { toValue, baseValue, baseUnit: "Pascal-second (Pa·s)", factor: fromUnit.factor / toUnit.factor, rows };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const ViscosityDynamicConverter = () => {
  const [inputs, setInputs] = useState<ConverterInputs>(DEFAULTS);
  const [result, setResult] = useState<ConverterResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<ConverterInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const parsed = parseFloat(inputs.value);
  const invalid = isNaN(parsed) || parsed < 0 || inputs.value.trim() === "";
  const digitsNum = Math.min(8, Math.max(0, parseInt(inputs.digits) || 0));

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[3];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];

  const fmt = (n: number, dec = 4) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) !== 0 && (Math.abs(n) < 0.0001 || Math.abs(n) >= 1e9)) {
      return n.toExponential(Math.min(dec, 6));
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: dec });
  };

  const toValueStr = fmt(result.toValue, digitsNum);
  const baseStr = fmt(result.baseValue, digitsNum);

  const chartData = result.rows
    .filter((r) => r.value > 0)
    .map((r) => ({ name: r.name.split(" (")[0], value: r.value, isTarget: r.isTarget }));

  const faqs = [
    { question: "What is dynamic viscosity?", answer: "Dynamic viscosity measures a fluid's internal resistance to flow — its 'thickness'. It is the ratio of shear stress to shear rate and is measured in pascal-seconds (Pa·s) in the SI system." },
    { question: "What is the viscosity of water?", answer: "Water at 20 °C has a dynamic viscosity of about 1.002 cP, which is 0.001002 Pa·s or 1.002 mPa·s. Honey, by contrast, is roughly 10,000 cP." },
    { question: "What is the difference between poise and centipoise?", answer: "The poise (P) is the CGS viscosity unit; 1 P = 0.1 Pa·s. The centipoise is one hundredth of a poise, and because water is close to 1 cP, centipoise is the everyday unit in labs and industry." },
    { question: "How does viscosity depend on temperature?", answer: "Liquids thin dramatically as they warm — water drops from about 1.8 cP at 0 °C to 0.65 cP at 40 °C. Gases do the opposite and thicken slightly with temperature." },
    { question: "What is kinematic vs dynamic viscosity?", answer: "Dynamic viscosity (μ) measures resistance to shear flow. Kinematic viscosity (ν) is dynamic viscosity divided by density — ν = μ/ρ — and is measured in stokes or m²/s." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Viscosity (Dynamic) Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Viscosity (Dynamic) Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="vis-value" className="text-sm font-medium text-foreground mb-1">Viscosity Value</label>
                <input
                  id="vis-value"
                  type="number"
                  min="0"
                  step="any"
                  value={inputs.value}
                  onChange={(e) => set({ value: e.target.value })}
                  className={`h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${invalid ? "border-red-500" : ""}`}
                />
                {invalid && <p className="text-[11px] text-red-500 font-medium mt-1">Enter a valid number ≥ 0</p>}
              </div>
              <div className="flex flex-col">
                <label htmlFor="vis-from" className="text-sm font-medium text-foreground mb-1">From Unit</label>
                <select
                  id="vis-from"
                  value={inputs.from}
                  onChange={(e) => set({ from: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label htmlFor="vis-to" className="text-sm font-medium text-foreground mb-1">Convert To</label>
                <select
                  id="vis-to"
                  value={inputs.to}
                  onChange={(e) => set({ to: e.target.value })}
                  className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                >
                  {UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <div className="p-3 rounded-lg bg-secondary/20 border border-border mt-1">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Formatting</div>
                <div className="flex flex-col">
                  <label htmlFor="vis-digits" className="text-sm font-medium text-foreground mb-1">Significant Digits</label>
                  <select
                    id="vis-digits"
                    value={inputs.digits}
                    onChange={(e) => set({ digits: e.target.value })}
                    className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                  >
                    {["0", "1", "2", "3", "4", "5", "6", "8"].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Viscosity</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">
                {toValueStr} <span className="text-2xl">{toUnit.name.split(" (")[0]}</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {inputs.value} {fromUnit.name.split(" (")[0]} = {toValueStr} {toUnit.name.split(" (")[0]}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Converted</span>
                <span className="font-extrabold text-primary">{toValueStr} {toUnit.name.split(" (")[0]}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (Pa·s)</span>
                <span className="font-extrabold text-emerald-600">{baseStr} Pa·s</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Factor</span>
                <span className="font-extrabold text-foreground">{fmt(result.factor, 6)}</span>
              </div>
            </div>

            {/* BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Unit</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.name} className={`hover:bg-secondary/20 transition-colors ${row.isTarget ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${row.isTarget ? "text-amber-700" : "text-foreground"}`}>{row.name}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${row.isTarget ? "text-amber-700" : "text-foreground"}`}>{fmt(row.value, digitsNum)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CHART */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Viscosity Across Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" scale="log" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <Tooltip formatter={(v: number) => [fmt(v, digitsNum), "Value"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={18}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.isTarget ? "#f59e0b" : "hsl(var(--primary))"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-muted-foreground mt-1 text-center">Log scale — target unit highlighted in amber</p>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  { label: "Input", value: `${inputs.value} ${fromUnit.name.split(" (")[0]}` },
                  { label: "Converted", value: `${toValueStr} ${toUnit.name.split(" (")[0]}` },
                  { label: "Pascal-seconds", value: `${baseStr} Pa·s` },
                  { label: "Centipoise", value: `${fmt(result.baseValue / 0.001, digitsNum)} cP` },
                  { label: "Poise", value: `${fmt(result.baseValue / 0.1, digitsNum)} P` },
                  { label: "Conversion Factor", value: `1 ${fromUnit.name.split(" (")[0]} = ${fmt(result.factor, 6)} ${toUnit.name.split(" (")[0]}` },
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
            <h2 className="text-2xl font-bold mb-3">What Dynamic Viscosity Measures</h2>
            <p>Dynamic viscosity is the property that makes honey pour slowly and water pour quickly. Formally, it is the ratio of shear stress to shear rate in a fluid — the resistance a fluid offers when layers slide past one another. The SI unit is the pascal-second (Pa·s), equal to one newton-second per square meter. The CGS system uses the poise, where 1 P = 0.1 Pa·s, and its practical sub-unit, the centipoise, is so common because water at room temperature is almost exactly 1 cP — giving engineers and chemists an intuitive reference point for every other liquid.</p>
            <p>Viscosity drives lubrication engineering, inkjet printing, polymer processing, food formulation, and crude-oil pipeline design. A 10W-30 motor oil is about 100 cP at operating temperature, olive oil roughly 80 cP, ketchup 50,000 cP, and glass at room temperature behaves like a solid with a viscosity near 10²⁰ Pa·s. Because the numbers span more than twenty orders of magnitude, correct unit conversion between Pa·s, poise, centipoise, and the imperial pound-based units is essential whenever data moves between standards — which is exactly what this converter automates.</p>
            <h2 className="text-2xl font-bold mb-3">Dynamic vs Kinematic Viscosity</h2>
            <p>Two viscosity measures appear in engineering tables, and they are easy to confuse. Dynamic viscosity (μ) is what this converter handles — the internal resistance to flow, independent of density. Kinematic viscosity (ν) divides dynamic viscosity by the fluid's density, ν = μ/ρ, and is measured in square meters per second or stokes. A separate kinematic converter is used for that quantity. When a datasheet lists a fluid's centipoise value, it is always dynamic viscosity; when it lists centistokes or SUS (Saybolt Universal Seconds), it is kinematic — and converting between the two requires knowing the density at the measurement temperature.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/viscosity-dynamic-converter" />
          <PopularCalculators exclude="/calculator/viscosity-dynamic-converter" />
        </div>
      </div>
    </>
  );
};

export default ViscosityDynamicConverter;
