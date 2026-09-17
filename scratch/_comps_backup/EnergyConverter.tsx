"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type UnitKey = "j" | "kj" | "cal" | "kcal" | "kwh" | "btu" | "ev";

const units: { key: UnitKey; label: string; joules: number }[] = [
  { key: "j", label: "Joules (J)", joules: 1 },
  { key: "kj", label: "Kilojoules (kJ)", joules: 1000 },
  { key: "cal", label: "Calories (cal)", joules: 4.184 },
  { key: "kcal", label: "Kilocalories (kcal)", joules: 4184 },
  { key: "kwh", label: "Kilowatt-hours (kWh)", joules: 3.6e6 },
  { key: "btu", label: "BTU", joules: 1055.06 },
  { key: "ev", label: "Electronvolts (eV)", joules: 1.602176634e-19 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

const faqs = [
  { question: "What is a joule?", answer: "The joule is the SI unit of energy: the work done by a force of one newton over one meter, or one watt for one second. Every other unit here converts through it." },
  { question: "How do calories relate to joules?", answer: "One (thermochemical) calorie is exactly 4.184 joules; a food Calorie is a kilocalorie (1,000 cal). A 2,000-Calorie diet is about 8.4 million joules of energy." },
  { question: "Why are there so many energy units?", answer: "Each field picked a convenient scale: physics uses joules and electronvolts, nutrition kilocalories, HVAC and appliances BTU and kWh, chemistry calories. Converting through joules guarantees exact, reversible results." },
];

export default function EnergyConverter() {
  const [value, setValue] = useState("1000");
  const [from, setFrom] = useState<UnitKey>("j");
  const [to, setTo] = useState<UnitKey>("kcal");
  const [result, setResult] = useState<{ joules: number; converted: number; toLabel: string }>(() => {
    const joules = 1000;
    return { joules, converted: joules / 4184, toLabel: "Kilocalories (kcal)" };
  });

  const handleCalculate = () => {
    const v = parseFloat(value);
    if (!isNaN(v) && v >= 0) {
      const joules = v * units.find(u => u.key === from)!.joules;
      const converted = joules / units.find(u => u.key === to)!.joules;
      setResult({ joules, converted, toLabel: units.find(u => u.key === to)!.label });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCalculate(); }, []);

  const reset = () => { setValue("1000"); setFrom("j"); setTo("kcal"); const joules = 1000 * units.find(u => u.key === "j")!.joules; setResult({ joules, converted: joules / units.find(u => u.key === "kcal")!.joules, toLabel: units.find(u => u.key === "kcal")!.label }); };
  const invalid = isNaN(parseFloat(value)) || parseFloat(value) < 0;

  const breakdown = [
    { label: "Input", value: `${parseFloat(value) || 0} ${from}` },
    { label: "In Joules", value: `${fmt(result.joules)} J` },
    { label: "Converted Value", value: `${fmt(result.converted)} ${to}`, highlight: true },
    { label: "In kWh", value: `${fmt(result.joules / 3.6e6)} kWh` },
    { label: "In kcal", value: `${fmt(result.joules / 4184)} kcal` },
    { label: "In eV", value: `${result.joules / 1.602176634e-19 >= 1e10 ? (result.joules / 1.602176634e-19).toExponential(3) : fmt(result.joules / 1.602176634e-19)} eV` },
  ];

  const summaryStats = [
    { label: "Converted", value: `${fmt(result.converted)} ${to}` },
    { label: "Joules", value: `${fmt(result.joules)} J` },
    { label: "Kilojoules", value: `${fmt(result.joules / 1000)} kJ` },
    { label: "kcal", value: `${fmt(result.joules / 4184)}` },
    { label: "kWh", value: `${fmt(result.joules / 3.6e6)}` },
    { label: "BTU", value: `${fmt(result.joules / 1055.06)}` },
  ];

  const chartData = [
    { name: `From (${from})`, value: parseFloat(value) || 0 },
    { name: `To (${to})`, value: Number(result.converted.toFixed(4)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Energy Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Energy Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="en-value" className="block text-sm font-medium mb-1 text-foreground">Energy Value</label>
              <input id="en-value" type="number" min="0" step="0.1" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="en-from" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="en-from" value={from} onChange={(e) => setFrom(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="en-to" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="en-to" value={to} onChange={(e) => setTo(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <Flame className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative energy value.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Energy</div>
              <div className="text-4xl font-extrabold text-primary">{fmt(result.converted)} <span className="text-xl font-bold">{to}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.joules)} J total</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Joules</div>
                <div className="text-lg font-bold text-primary">{fmt(result.joules)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">kcal</div>
                <div className="text-lg font-bold text-primary">{fmt(result.joules / 4184)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">kWh</div>
                <div className="text-lg font-bold text-primary">{fmt(result.joules / 3.6e6)}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row) => (
                    <tr key={row.label} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold break-all">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Value in From vs To Unit</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Energy"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={70} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the Energy Converter</h2>
            <p>Every unit in this converter is a fixed multiple of the joule: 1 cal = 4.184 J, 1 kcal = 4,184 J, 1 kWh = 3.6 million J, 1 BTU ≈ 1,055.06 J, and 1 eV ≈ 1.602 × 10⁻¹⁹ J. Values normalize to joules first, then divide by the target unit's factor — an exact chain at any scale.</p>
            <h3>Scales Matter</h3>
            <p>The same physical quantity spans 36 orders of magnitude across fields: an electron's binding energy is a few eV, a snack is hundreds of kJ, and a home's monthly electricity use is several hundred kWh. Converting through joules keeps all of these comparable.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/energy-converter" />
          <PopularCalculators exclude="/calculator/energy-converter" />
        </div>
      </div>
    </>
  );
}
