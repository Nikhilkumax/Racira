"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface ActivityUnit {
  id: string;
  name: string;
  factor: number; // multiplier to becquerels
}

interface ConverterInputs {
  value: string;
  from: string;
  to: string;
  digits: string;
}

interface ActivityRow {
  name: string;
  value: number;
  isTarget: boolean;
}

interface ConverterResult {
  toValue: number;
  baseValue: number;
  factor: number;
  rows: ActivityRow[];
}

// ── 2. Unit table (all factors → Becquerel) ─────────────────────────────────
const UNITS: ActivityUnit[] = [
  { id: "bq", name: "Becquerel (Bq)", factor: 1 },
  { id: "kbq", name: "Kilobecquerel (kBq)", factor: 1000 },
  { id: "mbq", name: "Megabecquerel (MBq)", factor: 1000000 },
  { id: "gbq", name: "Gigabecquerel (GBq)", factor: 1000000000 },
  { id: "tbq", name: "Terabecquerel (TBq)", factor: 1000000000000 },
  { id: "ci", name: "Curie (Ci)", factor: 3.7e10 },
  { id: "mci", name: "Millicurie (mCi)", factor: 3.7e7 },
  { id: "uci", name: "Microcurie (µCi)", factor: 3.7e4 },
  { id: "rd", name: "Rutherford (Rd)", factor: 1000000 },
  { id: "dpm", name: "Disintegrations/min (dpm)", factor: 1 / 60 },
];

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: ConverterInputs = {
  value: "0.5",
  from: "uci",
  to: "bq",
  digits: "4",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: ConverterInputs): ConverterResult {
  const value = parseFloat(inputs.value);
  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[7];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];
  const baseValue = value * fromUnit.factor;
  const toValue = baseValue / toUnit.factor;
  const rows: ActivityRow[] = UNITS.map((u) => ({
    name: u.name,
    value: baseValue / u.factor,
    isTarget: u.id === toUnit.id,
  }));
  return { toValue, baseValue, factor: fromUnit.factor / toUnit.factor, rows };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const RadioactivityConverter = () => {
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

  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[7];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];

  const fmt = (n: number, dec = 4) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e12)) {
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
    { question: "What is a becquerel?", answer: "The becquerel (Bq) is the SI unit of radioactivity, equal to one nuclear disintegration per second. It replaces the older curie, where 1 Ci = 3.7 × 10¹⁰ Bq." },
    { question: "How many becquerels are in a microcurie?", answer: "One microcurie (µCi) equals exactly 37,000 becquerels, because 1 Ci = 3.7 × 10¹⁰ Bq and there are 10⁶ microcuries per curie." },
    { question: "Why is dpm still used in testing?", answer: "Liquid scintillation counting of low-activity samples is often reported in disintegrations per minute (dpm). Since 1 Bq = 60 dpm, a 100 Bq sample emits 6,000 counts per minute." },
    { question: "What is a safe activity level?", answer: "Safety depends on the isotope, distance, and shielding. Common household smoke detectors contain roughly 37 kBq (1 µCi) of americium-241, which is safe because the alpha particles are fully shielded." },
    { question: "How is activity different from dose?", answer: "Activity (Bq) measures how many atoms decay per second. Dose (Sv) measures the biological effect of the emitted radiation on tissue. A converter for activity is the first step; dose estimation also needs isotope and geometry data." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Radioactivity Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Radioactivity Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="act-value" className="text-sm font-medium text-foreground mb-1">Activity</label>
                <input
                  id="act-value"
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
                <label htmlFor="act-from" className="text-sm font-medium text-foreground mb-1">From Unit</label>
                <select
                  id="act-from"
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
                <label htmlFor="act-to" className="text-sm font-medium text-foreground mb-1">Convert To</label>
                <select
                  id="act-to"
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
                  <label htmlFor="act-digits" className="text-sm font-medium text-foreground mb-1">Significant Digits</label>
                  <select
                    id="act-digits"
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Activity</div>
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (Bq)</span>
                <span className="font-extrabold text-emerald-600">{baseStr} Bq</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Activity Across Units</h3>
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
                  { label: "Becquerel Base", value: `${baseStr} Bq` },
                  { label: "Curie Base", value: `${fmt(result.baseValue / 3.7e10, digitsNum)} Ci` },
                  { label: "Disintegrations/min", value: `${fmt(result.baseValue * 60, digitsNum)} dpm` },
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
            <h2 className="text-2xl font-bold mb-3">Understanding Radioactivity Units</h2>
            <p>Radioactivity quantifies how many atomic nuclei in a sample decay each second. The becquerel (Bq), the SI unit named after Henri Becquerel, is simply one disintegration per second — a staggeringly small amount by practical standards. A typical laboratory source is measured in kilobecquerels or megabecquerels, and nuclear medicine doses are often in the tens to hundreds of megabecquerels. The curie (Ci), the older unit, is defined as the activity of one gram of radium-226: exactly 3.7 × 10¹⁰ disintegrations per second. Because the curie is so large, practical quantities are expressed in millicuries and microcuries, and converting between the curie family and the becquerel family is a frequent real-world task in health physics and nuclear pharmacy.</p>
            <p>The rutherford (Rd) is a rarely used intermediate unit equal to one million becquerels, and disintegrations per minute (dpm) appears in low-level counting laboratories because scintillation counters accumulate counts over minutes. A proper converter must handle the full span — from terabecquerels for industrial irradiators down to becquerels for environmental samples — which is exactly what this tool provides, with a logarithmic comparison chart so the relative magnitudes of every unit scale remain visually meaningful.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Examples</h2>
            <p>A household smoke detector contains roughly 1 µCi (37 kBq) of americium-241. A vial of technetium-99m for a bone scan holds about 25 mCi (925 MBq) at injection. The iodine-131 therapy dose for hyperthyroidism is commonly 10–30 mCi (370–1,110 MBq), while a large industrial radiography source might be 100 Ci (3.7 TBq). Understanding the relationship between these numbers — and being able to convert instantly between curies and becquerels — is essential for anyone reading radiation safety reports, package labels for radioactive shipments, or nuclear medicine prescriptions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/radioactivity-converter" />
          <PopularCalculators exclude="/calculator/radioactivity-converter" />
        </div>
      </div>
    </>
  );
};

export default RadioactivityConverter;
