"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Fuel } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const UNITS = [
  { id: "mpgUs", label: "Miles per US Gallon (mpg)", toL100: 235.214583, name: "mpg (US)" },
  { id: "mpgUk", label: "Miles per Imperial Gallon (mpg UK)", toL100: 282.480936, name: "mpg (UK)" },
  { id: "l100", label: "Liters per 100 km (L/100km)", toL100: 1, name: "L/100km" },
  { id: "kml", label: "Kilometers per Liter (km/L)", toL100: 100, name: "km/L" },
] as const;

interface FuelResult {
  value: number;
  unitId: string;
  l100: number;
  conversions: { name: string; value: number }[];
  chartData: { name: string; value: number }[];
  rating: string;
  annualCost: number;
}

function convertEconomy(value: number, unitId: string): FuelResult {
  const unit = UNITS.find((u) => u.id === unitId) ?? UNITS[0];
  const l100 = value > 0 ? unit.toL100 / value : 0;
  const conversions = UNITS.map((u) => ({ name: u.name, value: u.toL100 / l100 }));
  const chartData = conversions.map((c) => ({ name: c.name, value: Number(c.value.toPrecision(4)) }));
  let rating: string;
  if (l100 > 0 && l100 <= 4) rating = "Excellent — hybrid or EV-like efficiency";
  else if (l100 <= 6.5) rating = "Very good — efficient modern car";
  else if (l100 <= 9) rating = "Average — typical family car";
  else if (l100 <= 12) rating = "Below average — thirsty engine";
  else rating = "Poor — large SUV, truck, or sports car";
  const annualCost = 15000 / (l100 > 0 ? l100 / 100 : 0) * 1.5; // 15,000 km/yr, $1.50/L
  return { value, unitId, l100, conversions, chartData, rating, annualCost };
}

const DEFAULTS = { value: "30", unit: "mpgUs" };

const faqs = [
  { question: "What is the difference between US and UK mpg?", answer: "The imperial gallon is 4.546 L while the US gallon is 3.785 L — about 20% larger. A car rated 30 mpg (US) would be rated about 36 mpg (UK) even though it burns the same fuel." },
  { question: "Why does Europe use L/100km instead of mpg?", answer: "L/100km is a consumption figure (fuel per distance) rather than an efficiency figure (distance per fuel). Lower is better, and it makes fuel cost math straightforward: divide by 100 and multiply by the distance driven." },
  { question: "What is a good fuel economy?", answer: "Modern efficient cars achieve 4.5–6.5 L/100km (36–52 mpg US). The average new car in the US sits around 8–9 L/100km (26–30 mpg), while hybrids commonly reach 4–5 L/100km and EVs effectively use no liquid fuel at all." },
];

export default function FuelEconomyConverter() {
  const [value, setValue] = useState(DEFAULTS.value);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<FuelResult>(() => convertEconomy(30, "mpgUs"));

  const handleCalculate = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) return;
    setResult(convertEconomy(v, unit));
  };

  const reset = () => {
    setValue(DEFAULTS.value);
    setUnit(DEFAULTS.unit);
    setResult(convertEconomy(30, "mpgUs"));
  };

  const breakdown = [
    { label: "Liters per 100 km", value: `${result.l100.toFixed(2)} L/100km`, highlight: true },
    { label: "km per Liter", value: `${(100 / result.l100).toFixed(2)} km/L`, highlight: false },
    { label: "miles per US Gallon", value: `${(235.214583 / result.l100).toFixed(1)} mpg (US)`, highlight: false },
    { label: "miles per UK Gallon", value: `${(282.480936 / result.l100).toFixed(1)} mpg (UK)`, highlight: false },
    { label: "Fuel Cost (15,000 km, $1.50/L)", value: `$${result.annualCost.toFixed(2)}/yr`, highlight: false },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Fuel Economy Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Fuel Economy Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
              <Fuel className="w-4 h-4" /> Fuel Economy Unit Conversion
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Fuel Economy Value</label>
                <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="input-calc" placeholder="e.g. 30" min={0} />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground mb-1 block">Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-calc">
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleCalculate} className="btn-calculate flex-1">Calculate</button>
              <button onClick={reset} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary text-sm font-medium transition-colors">Reset</button>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-0">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-1">
                <Fuel className="w-4 h-4 text-primary" /> EQUIVALENT CONSUMPTION
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">{result.l100.toFixed(2)} L/100km</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{result.rating}</p>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Result Breakdown</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Quantity</th>
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
              <h3 className="text-base font-bold mb-3">Across Unit Systems</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString("en-US", { maximumFractionDigits: 2 }), ""]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {[
                  { label: "CO₂ per km", value: `${(result.l100 / 100 * 2.31).toFixed(3)} kg/km` },
                  { label: "Annual CO₂ (15,000 km)", value: `${(result.l100 / 100 * 2.31 * 15000 / 1000).toFixed(1)} tonnes` },
                  { label: "Tank Range (60 L)", value: `${(60 / result.l100 * 100).toFixed(0)} km` },
                  { label: "US EPA Rating", value: result.l100 <= 5 ? "Superior" : result.l100 <= 7 ? "Excellent" : result.l100 <= 9 ? "Good" : "Below average" },
                ].map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">About the Fuel Economy Converter</h2>
            <p>Fuel economy is measured two opposite ways: distance per fuel (mpg, km/L) and fuel per distance (L/100km). The conversion constants come from the gallon definitions — 1 US gallon = 3.785 L, 1 imperial gallon = 4.546 L — and 1 mile = 1.609 km. The calculator normalizes everything to L/100km, the most precise common unit, then re-expresses it in every system.</p>
            <h3>Why the numbers matter</h3>
            <p>Consumption drives both budget and emissions. Every liter of gasoline releases about 2.31 kg of CO₂, so a car using 8 L/100km emits roughly 192 g/km — about 2.9 tonnes over 15,000 km. Improving from 8 to 6 L/100km saves over 700 liters a year, which at $1.50/L is more than $1,000 annually plus a tonne of CO₂. Small efficiency gains compound quickly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/fuel-economy-converter" />
          <PopularCalculators exclude="/calculator/fuel-economy-converter" />
        </div>
      </div>
    </>
  );
}
