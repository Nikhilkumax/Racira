"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ── 1. Types ────────────────────────────────────────────────────────────────
interface TimeUnit {
  id: string;
  name: string;
  factor: number; // multiplier to seconds
}

interface ConverterInputs {
  value: string;
  from: string;
  to: string;
  digits: string;
}

interface TimeRow {
  name: string;
  value: number;
  isTarget: boolean;
}

interface ConverterResult {
  toValue: number;
  baseValue: number;
  baseUnit: string;
  factor: number;
  rows: TimeRow[];
}

// ── 2. Unit table (all factors → seconds) ───────────────────────────────────
const UNITS: TimeUnit[] = [
  { id: "ns", name: "Nanosecond (ns)", factor: 0.000000001 },
  { id: "us", name: "Microsecond (µs)", factor: 0.000001 },
  { id: "ms", name: "Millisecond (ms)", factor: 0.001 },
  { id: "s", name: "Second (s)", factor: 1 },
  { id: "min", name: "Minute (min)", factor: 60 },
  { id: "hr", name: "Hour (hr)", factor: 3600 },
  { id: "day", name: "Day (day)", factor: 86400 },
  { id: "wk", name: "Week (wk)", factor: 604800 },
  { id: "mo", name: "Month (30.44 days)", factor: 2629800 },
  { id: "yr", name: "Year (365.25 days)", factor: 31557600 },
];

// ── 3. DEFAULTS (realistic) ─────────────────────────────────────────────────
const DEFAULTS: ConverterInputs = {
  value: "1.5",
  from: "hr",
  to: "min",
  digits: "4",
};

// ── 4. Pure calculation function ────────────────────────────────────────────
function calculate(inputs: ConverterInputs): ConverterResult {
  const value = parseFloat(inputs.value);
  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[5];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[4];
  const baseValue = value * fromUnit.factor;
  const toValue = baseValue / toUnit.factor;
  const rows: TimeRow[] = UNITS.map((u) => ({
    name: u.name,
    value: baseValue / u.factor,
    isTarget: u.id === toUnit.id,
  }));
  return { toValue, baseValue, baseUnit: "Second (s)", factor: fromUnit.factor / toUnit.factor, rows };
}

// ── 5. Component ────────────────────────────────────────────────────────────
const TimeConverter = () => {
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

  const fromUnit = UNITS.find((u) => u.id === inputs.from) || UNITS[5];
  const toUnit = UNITS.find((u) => u.id === inputs.to) || UNITS[4];

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
    { question: "How many minutes are in 1.5 hours?", answer: "Exactly 90. One hour is 60 minutes, so 1.5 × 60 = 90 minutes." },
    { question: "Why are a month and year given decimals?", answer: "Months vary from 28 to 31 days and years vary with leap days, so converters standardize on average lengths — 30.44 days for a month and 365.25 days for a year." },
    { question: "How many seconds in a day?", answer: "86,400. That is 24 hours × 60 minutes × 60 seconds." },
    { question: "What is a nanosecond?", answer: "One billionth of a second (10⁻⁹ s). Light travels about 30 centimeters in one nanosecond, which is why high-frequency trading and computer memory are measured in nanoseconds." },
    { question: "Is a week exactly 7 days?", answer: "Yes — 7 days × 86,400 seconds = 604,800 seconds, which this converter uses as the exact week factor." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Time Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Time Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="time-value" className="text-sm font-medium text-foreground mb-1">Time Value</label>
                <input
                  id="time-value"
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
                <label htmlFor="time-from" className="text-sm font-medium text-foreground mb-1">From Unit</label>
                <select
                  id="time-from"
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
                <label htmlFor="time-to" className="text-sm font-medium text-foreground mb-1">Convert To</label>
                <select
                  id="time-to"
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
                  <label htmlFor="time-digits" className="text-sm font-medium text-foreground mb-1">Significant Digits</label>
                  <select
                    id="time-digits"
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Time</div>
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Base (s)</span>
                <span className="font-extrabold text-emerald-600">{baseStr} s</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Duration Across Time Units</h3>
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
                  { label: "Seconds", value: `${baseStr} s` },
                  { label: "Minutes", value: `${fmt(result.baseValue / 60, digitsNum)} min` },
                  { label: "Hours", value: `${fmt(result.baseValue / 3600, digitsNum)} hr` },
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
            <h2 className="text-2xl font-bold mb-3">Understanding Time Units</h2>
            <p>Time is the only physical quantity with a base unit — the second — that is defined by atomic physics rather than arbitrary convention. One second is defined as 9,192,631,770 oscillations of the cesium-133 atom. From that anchor, every other unit is a pure multiplier: a minute is 60 seconds, an hour 3,600, a day 86,400, and a week 604,800. The decimal metric prefixes extend the scale downward, with milliseconds, microseconds, and nanoseconds used wherever precision demands it — network latency is measured in milliseconds, processor clock cycles in nanoseconds, and light travel across a chip in picoseconds.</p>
            <p>Months and years are the only units that do not fit the clean multiplier pattern, because calendar months range from 28 to 31 days and the tropical year is 365.2422 days. Practical time conversion therefore uses standardized averages: 30.44 days per month and 365.25 days per year. Whenever you are converting a duration that spans months or years, the average-based result is the correct estimate for planning purposes — which is precisely what this converter applies under the hood.</p>
            <h2 className="text-2xl font-bold mb-3">Real-World Conversions</h2>
            <p>Production engineers track uptime in nines — 99.9% availability allows 43.2 minutes of downtime per month, while 99.999% allows barely 26 seconds. Software developers convert response times between milliseconds and microseconds daily, and network engineers think in the nanoseconds it takes a frame to traverse a switch. Whether you are scheduling a video render that takes 3 hours and converting it to minutes, or comparing a 250 millisecond API call against a 90 microsecond cache hit, this converter gives you every equivalent unit in a single view.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/time-converter" />
          <PopularCalculators exclude="/calculator/time-converter" />
        </div>
      </div>
    </>
  );
};

export default TimeConverter;
