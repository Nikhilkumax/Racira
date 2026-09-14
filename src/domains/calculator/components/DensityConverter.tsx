"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, FlaskConical } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type UnitKey = "kgm3" | "gcm3" | "kgL" | "lbft3" | "gml";

const units: { key: UnitKey; label: string; kgm3: number }[] = [
  { key: "kgm3", label: "kg/m³", kgm3: 1 },
  { key: "gcm3", label: "g/cm³", kgm3: 1000 },
  { key: "kgL", label: "kg/L", kgm3: 1000 },
  { key: "gml", label: "g/mL", kgm3: 1000 },
  { key: "lbft3", label: "lb/ft³", kgm3: 16.018463 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 4 });

const faqs = [
  { question: "What is density?", answer: "Density is mass per unit volume (ρ = m/V). Water is 1 g/cm³ = 1000 kg/m³ — the convenient reference that defines whether materials float or sink." },
  { question: "How do the units relate?", answer: "1 g/cm³ = 1 kg/L = 1000 kg/m³. The pound-per-cubic-foot is the imperial unit: 1 lb/ft³ ≈ 16.02 kg/m³. All conversions pass through kg/m³." },
  { question: "What are typical densities?", answer: "Air ~1.2 kg/m³, wood 400–800 kg/m³, water 1000 kg/m³, aluminum 2700 kg/m³, iron 7870 kg/m³, gold 19,300 kg/m³. Objects denser than the fluid sink." },
];

export default function DensityConverter() {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState<UnitKey>("gcm3");
  const [to, setTo] = useState<UnitKey>("kgm3");
  const [result, setResult] = useState<{ kgm3: number; converted: number; toLabel: string }>(() => {
    const kgm3 = 1 * 1000;
    return { kgm3, converted: kgm3 / 1, toLabel: "kg/m³" };
  });

  const handleCalculate = () => {
    const v = parseFloat(value);
    if (!isNaN(v) && v >= 0) {
      const kgm3 = v * units.find(u => u.key === from)!.kgm3;
      const converted = kgm3 / units.find(u => u.key === to)!.kgm3;
      setResult({ kgm3, converted, toLabel: units.find(u => u.key === to)!.label });
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleCalculate(); }, []);

  const reset = () => { setValue("1"); setFrom("gcm3"); setTo("kgm3"); const kgm3 = 1 * units.find(u => u.key === "gcm3")!.kgm3; setResult({ kgm3, converted: kgm3 / units.find(u => u.key === "kgm3")!.kgm3, toLabel: units.find(u => u.key === "kgm3")!.label }); };
  const invalid = isNaN(parseFloat(value)) || parseFloat(value) < 0;

  const breakdown = [
    { label: "Input", value: `${parseFloat(value) || 0} ${from}` },
    { label: "In kg/m³", value: `${fmt(result.kgm3)} kg/m³` },
    { label: "Converted Value", value: `${fmt(result.converted)} ${to}`, highlight: true },
    { label: "In g/cm³", value: `${fmt(result.kgm3 / 1000)} g/cm³` },
    { label: "In lb/ft³", value: `${fmt(result.kgm3 / 16.018463)} lb/ft³` },
    { label: "Floats in Water?", value: result.kgm3 < 1000 ? "Yes (less dense than water)" : "No (denser than water)" },
  ];

  const summaryStats = [
    { label: "Converted", value: `${fmt(result.converted)} ${to}` },
    { label: "kg/m³", value: `${fmt(result.kgm3)}` },
    { label: "g/cm³", value: `${fmt(result.kgm3 / 1000)}` },
    { label: "kg/L", value: `${fmt(result.kgm3 / 1000)}` },
    { label: "lb/ft³", value: `${fmt(result.kgm3 / 16.018463)}` },
    { label: "vs Water", value: result.kgm3 < 1000 ? "Lighter" : result.kgm3 === 1000 ? "Equal" : "Heavier" },
  ];

  const chartData = [
    { name: `From (${from})`, value: parseFloat(value) || 0 },
    { name: `To (${to})`, value: Number(result.converted.toFixed(4)) },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Density Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Density Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <label htmlFor="dn-value" className="block text-sm font-medium mb-1 text-foreground">Density Value</label>
              <input id="dn-value" type="number" min="0" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dn-from" className="block text-sm font-medium mb-1 text-foreground">From</label>
                <select id="dn-from" value={from} onChange={(e) => setFrom(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dn-to" className="block text-sm font-medium mb-1 text-foreground">To</label>
                <select id="dn-to" value={to} onChange={(e) => setTo(e.target.value as UnitKey)} className="input-calc w-full h-10 px-3 text-base border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                  {units.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleCalculate} disabled={invalid} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                <FlaskConical className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {invalid && <p className="text-xs text-destructive">Enter a valid non-negative density.</p>}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Converted Density</div>
              <div className="text-4xl font-extrabold text-primary">{fmt(result.converted)} <span className="text-xl font-bold">{to}</span></div>
              <div className="text-sm text-muted-foreground mt-1">{fmt(result.kgm3)} kg/m³ · {fmt(result.kgm3 / 1000)} g/cm³</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">kg/m³</div>
                <div className="text-lg font-bold text-primary">{fmt(result.kgm3)}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">g/cm³</div>
                <div className="text-lg font-bold text-primary">{fmt(result.kgm3 / 1000)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">lb/ft³</div>
                <div className="text-lg font-bold text-primary">{fmt(result.kgm3 / 16.018463)}</div>
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
                      <td className="p-2.5 pr-3 text-right font-semibold">{row.value}</td>
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
                  <Tooltip formatter={(v: number) => [fmt(v), "Density"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
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
            <h2 className="text-2xl font-bold mb-3">About the Density Converter</h2>
            <p>Density is mass divided by volume. This converter normalizes every input to SI units (kg/m³), then divides by the target unit's factor: 1 g/cm³ = 1 kg/L = 1000 kg/m³, and 1 lb/ft³ ≈ 16.018 kg/m³ (the imperial pound per cubic foot).</p>
            <h3>Water as the Reference</h3>
            <p>Water's density of 1 g/cm³ anchors everyday intuition: anything less dense floats in water (wood, ice, oil), anything denser sinks (metal, stone). The 'floats' row in the table applies exactly that comparison to your value.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/density-converter" />
          <PopularCalculators exclude="/calculator/density-converter" />
        </div>
      </div>
    </>
  );
}
