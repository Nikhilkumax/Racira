"use client";
import { useState, useEffect } from "react";
import { RotateCcw, Printer, ArrowLeftRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// ── 1. Types ──────────────────────────────────────────────────────────────
type Category = "length" | "weight" | "volume" | "temperature" | "area" | "speed" | "time" | "data";

interface ConversionInputs {
  category: Category;
  from: string;
  to: string;
  value: string;
}

interface ConversionResult {
  category: Category;
  from: string;
  to: string;
  value: number;
  converted: number;
  factor: number;
  chartData: { name: string; value: number }[];
  isError: boolean;
  errorMsg?: string;
}

// ── 2. Unit tables (factor × base unit) ────────────────────────────────────
const LENGTH: Record<string, number> = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 };
const WEIGHT: Record<string, number> = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237, oz: 0.028349523, tonne: 1000 };
const VOLUME: Record<string, number> = { L: 1, mL: 0.001, "m³": 1000, "gal (US)": 3.785411784, qt: 0.946352946, cup: 0.236588236, "fl oz": 0.0295735296 };
const AREA: Record<string, number> = { "m²": 1, "km²": 1000000, ha: 10000, acre: 4046.8564224, "ft²": 0.09290304, "in²": 0.00064516 };
const SPEED: Record<string, number> = { "m/s": 1, "km/h": 0.2777777778, mph: 0.44704, knot: 0.5144444444 };
const TIME: Record<string, number> = { s: 1, min: 60, h: 3600, day: 86400, week: 604800 };
const DATA: Record<string, number> = { B: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 ** 3, TB: 1024 ** 4 };

const UNITS: Record<Category, Record<string, number>> = {
  length: LENGTH,
  weight: WEIGHT,
  volume: VOLUME,
  area: AREA,
  speed: SPEED,
  time: TIME,
  data: DATA,
};

const TEMP_UNITS = ["°C", "°F", "K"];

function toBase(v: number, unit: string, category: Category): number {
  if (category === "temperature") {
    if (unit === "°C") return v + 273.15;
    if (unit === "°F") return ((v - 32) * 5) / 9 + 273.15;
    return v; // K
  }
  return v * UNITS[category][unit];
}

function fromBase(v: number, unit: string, category: Category): number {
  if (category === "temperature") {
    if (unit === "°C") return v - 273.15;
    if (unit === "°F") return ((v - 273.15) * 9) / 5 + 32;
    return v; // K
  }
  return v / UNITS[category][unit];
}

function calculateConversion(inputs: ConversionInputs): ConversionResult {
  const empty: ConversionResult = {
    category: inputs.category, from: inputs.from, to: inputs.to, value: 0, converted: 0,
    factor: 0, chartData: [], isError: true,
  };
  const value = parseFloat(inputs.value);
  if (isNaN(value)) {
    return { ...empty, errorMsg: "Please enter a valid number to convert." };
  }
  const base = toBase(value, inputs.from, inputs.category);
  const converted = fromBase(base, inputs.to, inputs.category);
  // Factor is the value of ONE source unit expressed in the target unit
  const factor = fromBase(toBase(1, inputs.from, inputs.category), inputs.to, inputs.category);

  return {
    category: inputs.category, from: inputs.from, to: inputs.to, value, converted, factor,
    chartData: [
      { name: "Original", value: +value.toPrecision(6) },
      { name: "Converted", value: +converted.toPrecision(6) },
    ],
    isError: false,
  };
}

// ── 3. Defaults ────────────────────────────────────────────────────────────
const DEFAULTS: ConversionInputs = { category: "length", from: "m", to: "ft", value: "10" };

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 6 });

// ── 4. Component ──────────────────────────────────────────────────────────
const ConversionCalculator = () => {
  const [inputs, setInputs] = useState<ConversionInputs>(DEFAULTS);
  const [result, setResult] = useState<ConversionResult>(() => calculateConversion(DEFAULTS));

  useEffect(() => {
    setResult(calculateConversion(DEFAULTS));
  }, []);

  const setCategory = (cat: Category) => {
    const next = { ...inputs, category: cat } as ConversionInputs;
    const units = categoryUnits(cat);
    if (!units.includes(next.from)) next.from = units[0];
    if (!units.includes(next.to)) next.to = units[1] ?? units[0];
    setInputs(next);
  };

  const categoryUnits = (cat: Category): string[] =>
    cat === "temperature" ? TEMP_UNITS : Object.keys(UNITS[cat]);

  const handleChange = (key: keyof ConversionInputs, val: string) => {
    const next = { ...inputs, [key]: val } as ConversionInputs;
    setInputs(next);
  };
  const handleCalculate = () => setResult(calculateConversion(inputs));
  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateConversion(DEFAULTS));
  };
  const handlePrint = () => window.print();

  const selectCls = "w-full h-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground transition-all cursor-pointer font-medium";
  const catLabels: Record<Category, string> = {
    length: "Length", weight: "Weight", volume: "Volume", temperature: "Temperature",
    area: "Area", speed: "Speed", time: "Time", data: "Data",
  };

  const faqs = [
    { question: "What does this conversion calculator do?", answer: "It converts between the common units of eight categories — length, weight, volume, temperature, area, speed, time, and data storage. Pick a category, choose the source and target units, enter a value, and get the exact conversion with the underlying factor shown." },
    { question: "How are conversions computed?", answer: "Each unit is defined by a factor to a category's base unit (meters, kilograms, liters, seconds, and so on). The calculator converts your value to the base unit, then to the target unit. Temperature uses its own formulas because its scales are offset, not just scaled: °C = K − 273.15 and °F = (°C × 9/5) + 32." },
    { question: "Is 1 mile really 1.609 km?", answer: "Yes — the international mile is exactly 1,609.344 meters, and 1 pound is exactly 0.45359237 kg. The conversion factors used here are the official international definitions, so results are exact to the precision shown." },
    { question: "Why does the bar chart show different-sized bars?", answer: "The chart compares the original and converted values on a linear scale. When converting to a larger unit (like meters to kilometers), the converted number is smaller; to a smaller unit (like meters to inches), it is larger. Both bars represent the same physical quantity." },
    { question: "How are data storage units counted?", answer: "Data units use binary multiples: 1 KB = 1,024 bytes, 1 MB = 1,024 KB, and so on — the convention used by operating systems and most storage labels. Some drive manufacturers quote decimal multiples (1,000), which is why a '1 TB' drive shows less than 1 TB in your file manager." },
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Conversion Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Conversion Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Category</label>
              <div className="relative h-10">
                <select value={inputs.category} onChange={(e) => setCategory(e.target.value as Category)} className={selectCls}>
                  {(Object.keys(catLabels) as Category[]).map((c) => <option key={c} value={c}>{catLabels[c]}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="from-unit" className="text-sm font-medium mb-1">From</label>
                <div className="relative h-10">
                  <select id="from-unit" value={inputs.from} onChange={(e) => handleChange("from", e.target.value)} className={selectCls}>
                    {categoryUnits(inputs.category).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="to-unit" className="text-sm font-medium mb-1">To</label>
                <div className="relative h-10">
                  <select id="to-unit" value={inputs.to} onChange={(e) => handleChange("to", e.target.value)} className={selectCls}>
                    {categoryUnits(inputs.category).map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="convert-value" className="text-sm font-medium mb-1">Value</label>
              <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input
                  id="convert-value"
                  type="number"
                  step="any"
                  value={inputs.value}
                  onChange={(e) => handleChange("value", e.target.value)}
                  className="w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground"
                />
                <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{inputs.from}</span>
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
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    {fmt(result.value)} {result.from} in {result.to}
                  </div>
                  <div className="text-4xl font-bold text-primary break-words">
                    {fmt(result.converted)} <span className="text-xl">{result.to}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    1 {result.from} = {fmt(result.factor)} {result.to}
                  </div>
                </div>

                {/* 2. 3-Stat Bar */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  {[
                    { label: "Original Value", value: `${fmt(result.value)} ${result.from}`, color: "text-foreground" },
                    { label: "Converted", value: `${fmt(result.converted)} ${result.to}`, color: "text-primary" },
                    { label: "Conversion Factor", value: fmt(result.factor), color: "text-emerald-600" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* 3. Breakdown Table */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-bold mb-3">Conversion Details</h3>
                  <table className="w-full text-base">
                    <tbody>
                      {[
                        { label: "Category", value: catLabels[result.category] },
                        { label: "From", value: result.from },
                        { label: "To", value: result.to },
                        { label: "Input Value", value: `${fmt(result.value)} ${result.from}` },
                        { label: "Converted Value", value: `${fmt(result.converted)} ${result.to}`, highlight: true },
                        { label: "Factor (1 from = ? to)", value: fmt(result.factor) },
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
                  <h3 className="text-base font-bold mb-3">Original vs Converted</h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(value: number) => [fmt(value as number), "Value"]}
                          contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={80}>
                          {result.chartData.map((entry, idx) => (
                            <Cell key={idx} fill={idx === 1 ? "hsl(var(--primary))" : "#10b981"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">Both bars are the same physical quantity — the numbers differ because the units have different sizes.</div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                    {[
                      { label: "Category", value: catLabels[result.category] },
                      { label: "From Unit", value: result.from },
                      { label: "To Unit", value: result.to },
                      { label: "Input", value: `${fmt(result.value)} ${result.from}` },
                      { label: "Result", value: `${fmt(result.converted)} ${result.to}` },
                      { label: "Factor", value: fmt(result.factor) },
                      { label: "Direction", value: `${result.from} → ${result.to}` },
                      { label: "Basis", value: "International definitions" },
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
            <h2 className="text-2xl font-bold mb-3">What Is a Conversion Calculator?</h2>
            <p>A conversion calculator translates a measurement from one unit to another — meters to feet, kilograms to pounds, liters to gallons, Celsius to Fahrenheit. This tool covers eight categories: length, weight, volume, temperature, area, speed, time, and data storage, using the official international definitions of each unit so the numbers are exact.</p>

            <h2 className="text-2xl font-bold mb-3">How Unit Conversion Works</h2>
            <p>Every category has a base unit — meters, kilograms, liters, seconds. Each other unit is a fixed factor of that base: 1 mile = 1,609.344 meters, 1 pound = 0.45359237 kg. The calculator converts your value to the base unit and then to the target unit, so the chain is always exact. Temperature is the exception: its scales are offset rather than merely scaled, so it uses °C = K − 273.15 and °F = (°C × 9/5) + 32.</p>

            <h2 className="text-2xl font-bold mb-3">Choosing the Right Unit</h2>
            <p>Pick the unit that keeps numbers comfortable and error-free: kilometers for road distances in most of the world, miles in the US and UK; kilograms for body weight globally, pounds in the US; liters for beverages, gallons for fuel in the US. Getting the unit right matters most in practical tasks — cooking with a foreign recipe, estimating shipping weight, or checking a speed limit abroad.</p>

            <h2 className="text-2xl font-bold mb-3">Why Precision Matters</h2>
            <p>Engineering, medicine, and international trade all depend on conversions being right. A 0.45359237 factor for pounds looks fussy until a 10,000 kg shipment is off by the wrong conversion. This calculator carries the official factors in full and rounds only for display, so the result you see is the result the math gives.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/conversion-calculator" />
          <PopularCalculators exclude="/calculator/conversion-calculator" />
        </div>
      </div>
    </>
  );
};

export default ConversionCalculator;
