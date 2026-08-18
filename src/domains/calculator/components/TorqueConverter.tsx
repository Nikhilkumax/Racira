"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface TorqueUnit {
  id: string;
  name: string;
  factor: number; // multiplier to newton-meters
}

interface ConverterInputs {
  value: string;
  from: string;
  to: string;
  digits: string;
}

interface TorqueRow {
  name: string;
  value: number;
  isTarget: boolean;
}

interface ConverterResult {
  toValue: number;
  baseValue: number;
  baseUnit: string;
  factor: number;
  rows: TorqueRow[];
}

// ── 2. Unit table (all factors → newton-meters) ─────────────────────────────
const UNITS: TorqueUnit[] = [
  { id: "nm", name: "Newton-meter (N·m)", factor: 1 },
  { id: "ncm", name: "Newton-centimeter (N·cm)", factor: 0.01 },
  { id: "knm", name: "Kilonewton-meter (kN·m)", factor: 1000 },
  { id: "kgfm", name: "Kilogram-force-meter (kgf·m)", factor: 9.80665 },
  { id: "lbfft", name: "Pound-foot (lbf·ft)", factor: 1.35582 },
  { id: "lbfin", name: "Pound-inch (lbf·in)", factor: 0.112985 },
  { id: "ozfin", name: "Ounce-inch (ozf·in)", factor: 0.00706155 },
  { id: "dyncm", name: "Dyne-centimeter (dyn·cm)", factor: 0.0000001 },
];

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: ConverterInputs = {
  value: "100",
  from: "lbfft",
  to: "nm",
  digits: "4",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: ConverterInputs): ConverterResult {
  const value = parseFloat(inputs.value);
  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[4];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];
  const baseValue = value * fromUnit.factor;
  const toValue = baseValue / toUnit.factor;
  const rows: TorqueRow[] = UNITS.map((u) => ({
    name: u.name,
    value: baseValue / u.factor,
    isTarget: u.id === toUnit.id,
  }));
  return { toValue, baseValue, baseUnit: "Newton-meter (N·m)", factor: fromUnit.factor / toUnit.factor, rows };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const TorqueConverter = () => {
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

  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[4];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[0];

  const fmt = (n: number, dec = 4) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) !== 0 && (Math.abs(n) < 0.001 || Math.abs(n) >= 1e9)) {
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
    { question: "How many newton-meters are in one pound-foot?", answer: "Exactly 1.35582. Multiply pound-foot values by 1.35582 to convert to newton-meters — for example 100 lbf·ft = 135.582 N·m." },
    { question: "What is torque?", answer: "Torque is a twisting or rotational force, the product of a force and the perpendicular distance from its line of action to the pivot: τ = F × r. It is measured in N·m (SI) or lbf·ft (imperial)." },
    { question: "Why does my car's torque spec use lb-ft?", answer: "US automakers advertise engine torque in pound-feet because US buyers are familiar with the unit. European specs use newton-meters; 1 lbf·ft equals 1.35582 N·m, so 300 lb-ft is about 407 N·m." },
    { question: "Is kgf·m still used?", answer: "Kilogram-force-meter appears on older European and Asian equipment and torque wrenches. One kgf·m equals exactly 9.80665 N·m because 1 kgf = 9.80665 N." },
    { question: "What is the difference between lb-ft and ft-lb?", answer: "They are the same physical quantity — the ordering is a convention. lb-ft is the common automotive form; both mean pounds of force applied at a one-foot lever arm." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Torque Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Torque Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="tq-value" className="text-sm font-medium text-foreground mb-1">Torque Value</label>
                <input
                  id="tq-value"
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
                <label htmlFor="tq-from" className="text-sm font-medium text-foreground mb-1">From Unit</label>
                <select
                  id="tq-from"
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
                <label htmlFor="tq-to" className="text-sm font-medium text-foreground mb-1">Convert To</label>
                <select
                  id="tq-to"
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
                  <label htmlFor="tq-digits" className="text-sm font-medium text-foreground mb-1">Significant Digits</label>
                  <select
                    id="tq-digits"
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Torque</div>
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (N·m)</span>
                <span className="font-extrabold text-emerald-600">{baseStr} N·m</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Torque Across Units</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" scale="log" domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
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
                  { label: "Newton-meters", value: `${baseStr} N·m` },
                  { label: "Kilogram-force-m", value: `${fmt(result.baseValue / 9.80665, digitsNum)} kgf·m` },
                  { label: "Pound-feet", value: `${fmt(result.baseValue / 1.35582, digitsNum)} lbf·ft` },
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
            <h2 className="text-2xl font-bold mb-3">Understanding Torque Units</h2>
            <p>Torque measures the tendency of a force to rotate an object about a pivot — the product of force and the perpendicular lever-arm distance, τ = F × r. The SI unit is the newton-meter, defined as the torque produced by one newton of force applied at a one-meter lever arm. The imperial world uses pound-feet for large rotating machinery and pound-inches for smaller fasteners. Because the US automotive industry specifies engine torque in pound-feet while European manufacturers use newton-meters, converting between the two is one of the most common torque calculations in the world: 1 lbf·ft equals exactly 1.35582 N·m.</p>
            <p>Legacy metric equipment introduces kilogram-force-meter, where 1 kgf·m equals 9.80665 N·m because one kilogram-force is the weight of one kilogram under standard gravity. Precision fastening — the kind done with torque wrenches on cylinder heads, lug nuts, and structural bolts — requires exact conversion because a 20% torque error can either strip a thread or leave a joint dangerously loose. This converter covers the full practical range from dyne-centimeters used in micro-mechanics to kilonewton-meters used for large drive shafts and wind-turbine hubs.</p>
            <h2 className="text-2xl font-bold mb-3">Common Torque Values</h2>
            <p>A typical lug nut spec of 80–100 lbf·ft converts to 108–136 N·m. Cylinder head bolts on a modern engine are torqued to roughly 60–90 N·m (44–66 lbf·ft) plus angle. A compact car's engine produces about 150–200 N·m (110–148 lbf·ft) of torque, a muscle car 500+ N·m, and a Class 8 semi truck 2,500 N·m. The chart and breakdown table in this calculator show the same value expressed across all eight units at once, so a single calculation covers every wrench, spec sheet, and parts catalog you might encounter.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/torque-converter" />
          <PopularCalculators exclude="/calculator/torque-converter" />
        </div>
      </div>
    </>
  );
};

export default TorqueConverter;
