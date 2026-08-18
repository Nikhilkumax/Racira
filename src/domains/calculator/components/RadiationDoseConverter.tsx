"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface DoseUnit {
  id: string;
  name: string;
  factor: number; // multiplier to sieverts
}

interface ConverterInputs {
  value: string;
  from: string;
  to: string;
  digits: string;
}

interface DoseRow {
  name: string;
  value: number;
  isTarget: boolean;
}

interface ConverterResult {
  toValue: number;
  baseValue: number;
  baseUnit: string;
  factor: number;
  rows: DoseRow[];
}

// ── 2. Unit table (all factors → Sievert) ───────────────────────────────────
const UNITS: DoseUnit[] = [
  { id: "sv", name: "Sievert (Sv)", factor: 1 },
  { id: "msv", name: "Millisievert (mSv)", factor: 0.001 },
  { id: "usv", name: "Microsievert (µSv)", factor: 0.000001 },
  { id: "nsv", name: "Nanosievert (nSv)", factor: 0.000000001 },
  { id: "rem", name: "Rem (rem)", factor: 0.01 },
  { id: "mrem", name: "Millirem (mrem)", factor: 0.00001 },
  { id: "gy", name: "Gray (Gy)", factor: 1 },
  { id: "mgy", name: "Milligray (mGy)", factor: 0.001 },
  { id: "rad", name: "Rad (rad)", factor: 0.01 },
  { id: "mrad", name: "Millirad (mrad)", factor: 0.00001 },
];

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: ConverterInputs = {
  value: "5",
  from: "msv",
  to: "usv",
  digits: "4",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: ConverterInputs): ConverterResult {
  const value = parseFloat(inputs.value);
  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[1];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[2];
  const baseValue = value * fromUnit.factor;
  const toValue = baseValue / toUnit.factor;
  const rows: DoseRow[] = UNITS.map((u) => ({
    name: u.name,
    value: baseValue / u.factor,
    isTarget: u.id === toUnit.id,
  }));
  return {
    toValue,
    baseValue,
    baseUnit: "Sievert (Sv)",
    factor: fromUnit.factor / toUnit.factor,
    rows,
  };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const RadiationDoseConverter = () => {
  const [inputs, setInputs] = useState<ConverterInputs>(DEFAULTS);
  const [result, setResult] = useState<ConverterResult>(() => calculate(DEFAULTS));

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (patch: Partial<ConverterInputs>) => setInputs((p) => ({ ...p, ...patch }));

  const parsed = parseFloat(inputs.value);
  const invalid = isNaN(parsed) || parsed < 0 || inputs.value.trim() === "";
  const digits = Math.min(8, Math.max(0, parseInt(inputs.digits) || 0));

  const run = () => {
    if (invalid) return;
    setResult(calculate(inputs));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[1];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[2];
  const digitsNum = Math.min(8, Math.max(0, parseInt(inputs.digits) || 0));

  const fmt = (n: number, dec = 4) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e9)) {
      return n.toExponential(Math.min(dec, 6));
    }
    return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: dec });
  };

  const toValueStr = fmt(result.toValue, digitsNum);
  const baseStr = fmt(result.baseValue, 6);
  const factorStr = fmt(result.factor, 6);

  const chartData = result.rows
    .filter((r) => r.value > 0)
    .map((r) => ({ name: r.name.split(" (")[0], value: r.value, isTarget: r.isTarget }));

  const stat1 = { label: "Converted Value", value: `${toValueStr} ${toUnit.name.split(" (")[0]}`, tone: "text-primary" };
  const stat2 = { label: "Base (Sievert)", value: `${baseStr} Sv`, tone: "text-emerald-600" };
  const stat3 = { label: "Conversion Factor", value: `1 ${fromUnit.name.split(" (")[0]} = ${factorStr} ${toUnit.name.split(" (")[0]}`, tone: "text-foreground" };

  const faqs = [
    { question: "What is the difference between sievert and gray?", answer: "The gray (Gy) measures absorbed dose — the energy deposited per kilogram of tissue. The sievert (Sv) measures equivalent dose — the biological effect of that energy, which accounts for radiation type weighting. For X-rays and gamma rays the two are numerically equal (1 Gy = 1 Sv)." },
    { question: "How many microsieverts are in a millisievert?", answer: "Exactly 1,000. One millisievert (mSv) equals 1,000 microsieverts (µSv)." },
    { question: "What is a typical radiation dose from a chest X-ray?", answer: "A single chest X-ray delivers about 0.02 mSv (20 µSv), while a cross-country flight adds roughly 0.03–0.05 mSv of cosmic radiation." },
    { question: "Is 1 rem equal to 1 sievert?", answer: "No. 1 sievert equals 100 rem. The rem is the older, larger unit; millirem (0.001 rem) is still common in US regulatory tables." },
    { question: "What is the annual public dose limit?", answer: "The ICRP recommends a public dose limit of 1 mSv per year above natural background, while radiation workers may receive up to 20 mSv per year averaged over five years." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Radiation Dose Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radiation Dose Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="dose-value" className="text-sm font-medium text-foreground mb-1">Dose Value</label>
                <input
                  id="dose-value"
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
                <label htmlFor="dose-from" className="text-sm font-medium text-foreground mb-1">From Unit</label>
                <select
                  id="dose-from"
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
                <label htmlFor="dose-to" className="text-sm font-medium text-foreground mb-1">Convert To</label>
                <select
                  id="dose-to"
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
                  <label htmlFor="dose-digits" className="text-sm font-medium text-foreground mb-1">Significant Digits</label>
                  <select
                    id="dose-digits"
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Dose</div>
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
                <span className={`font-extrabold ${stat1.tone}`}>{stat1.value}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (Sv)</span>
                <span className={`font-extrabold ${stat2.tone}`}>{stat2.value}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Factor</span>
                <span className="font-extrabold text-foreground">{result.factor.toFixed(6)}</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Dose Magnitude Across Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" scale="log" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
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
                  { label: "Sievert Base", value: `${baseStr} Sv` },
                  { label: "Gray Base", value: `${fmt(result.baseValue, digitsNum)} Gy` },
                  { label: "Rem Base", value: `${fmt(result.baseValue / 0.01, digitsNum)} rem` },
                  { label: "Conversion Factor", value: `1 ${fromUnit.name.split(" (")[0]} = ${factorStr} ${toUnit.name.split(" (")[0]}` },
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
            <h2 className="text-2xl font-bold mb-3">Understanding Radiation Dose Units</h2>
            <p>Radiation dose is expressed through several related units that often confuse patients, workers, and even professionals, because the same exposure can be written as a different number depending on which scale you choose. The sievert (Sv) is the SI unit for equivalent dose — the measure of biological harm from ionizing radiation. A single sievert is an enormous dose; occupational and medical doses are almost always measured in millisieverts (thousandths) or microsieverts (millionths). The rem is the older US unit where 1 Sv equals 100 rem, and 1 rem equals 1,000 millirem, so converting between the SI and legacy systems requires nothing more than moving the decimal point by factors of ten.</p>
            <p>The gray (Gy) and its sub-units describe absorbed dose — the physical energy deposited per kilogram of matter — while the sievert adds a radiation-weighting factor to reflect biological effectiveness. For the X-rays and gamma rays used in medical imaging, 1 Gy of absorbed dose produces 1 Sv of equivalent dose, so the two scales coincide numerically. For alpha particles the weighting factor is 20, meaning the same energy deposit causes roughly 20 times more biological damage. This is why a radiation dose converter that moves between Gy, Sv, and rem units is an essential reference for radiology staff, nuclear medicine technologists, and anyone interpreting exposure reports from imaging studies.</p>
            <h2 className="text-2xl font-bold mb-3">Practical Exposure Benchmarks</h2>
            <p>To make these numbers tangible: a typical dental X-ray delivers about 0.005 mSv, a chest X-ray about 0.02 mSv, and a CT scan of the abdomen between 5 and 10 mSv. Natural background radiation in the United States averages roughly 3 mSv per year, about half of which comes from radon gas. A transatlantic flight adds approximately 0.05 mSv of cosmic radiation. The ICRP public dose limit of 1 mSv per year above background and the occupational limit of 20 mSv per year averaged over five years provide the regulatory context for these conversions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radiation-dose-converter" />
          <PopularCalculators exclude="/calculator/radiation-dose-converter" />
        </div>
      </div>
    </>
  );
};

export default RadiationDoseConverter;
