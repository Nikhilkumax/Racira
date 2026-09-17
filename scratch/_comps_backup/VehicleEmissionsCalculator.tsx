"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, suffix, disabled, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; suffix?: string; disabled?: boolean; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  </div>
);

// kg CO2 per gallon burned (EPA); EVs use grid factor + efficiency
const FUEL_FACTORS: Record<string, number> = { gasoline: 8.887, diesel: 10.18, lpg: 5.79, electric: 0 };
const FUEL_LABELS: Record<string, string> = { gasoline: "Gasoline", diesel: "Diesel", lpg: "LPG", electric: "Electric (EV)" };

interface Inputs { miles: string; mpg: string; fuel: string; }

interface Result {
  gallons: number;
  co2Kg: number;
  totalTons: number;
  monthlyKg: number;
  dailyKg: number;
  treesNeeded: number;
  kwhUsed: number;
  chart: { name: string; value: number; selected: boolean }[];
}

const DEFAULTS: Inputs = { miles: "12000", mpg: "25", fuel: "gasoline" };

function calculate(inputs: Inputs): Result {
  const miles = Math.max(0, parseFloat(inputs.miles) || 0);
  const mpg = Math.max(0.1, parseFloat(inputs.mpg) || 0.1);
  const fuel = inputs.fuel;
  let co2Kg: number;
  let gallons = 0;
  let kwhUsed = 0;
  if (fuel === "electric") {
    kwhUsed = miles / 3; // ~3 mi/kWh avg EV efficiency
    co2Kg = kwhUsed * 0.4; // US grid average kg/kWh
  } else {
    gallons = miles / mpg;
    co2Kg = gallons * FUEL_FACTORS[fuel];
  }
  const totalTons = co2Kg / 1000;
  const monthlyKg = co2Kg / 12;
  const dailyKg = co2Kg / 365;
  const treesNeeded = Math.ceil(co2Kg / 20);
  const chart = Object.keys(FUEL_FACTORS).map((key) => ({
    name: FUEL_LABELS[key],
    value: key === "electric"
      ? Math.round((miles / 3) * 0.4 * 100) / 100
      : Math.round((miles / mpg) * FUEL_FACTORS[key] * 100) / 100,
    selected: key === fuel,
  }));
  return { gallons, co2Kg, totalTons, monthlyKg, dailyKg, treesNeeded, kwhUsed, chart };
}

const VehicleEmissionsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.miles) < 0 || (inputs.fuel !== "electric" && num(inputs.mpg) <= 0);

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const fuelUnit = inputs.fuel === "electric" ? `${fmt(result.kwhUsed)} kWh/yr` : `${fmt(result.gallons)} gal/yr`;
  const rows = [
    { label: "Annual Miles Driven", value: fmt(num(inputs.miles)) + " miles" },
    { label: "Fuel Type", value: FUEL_LABELS[inputs.fuel] ?? inputs.fuel },
    { label: inputs.fuel === "electric" ? "Energy Used" : "Fuel Consumed", value: fuelUnit },
    { label: "Annual CO₂ Output", value: fmt(result.totalTons, 2) + " tons", highlight: true },
    { label: "Monthly Average", value: fmt(result.monthlyKg, 0) + " kg" },
    { label: "Daily Average", value: fmt(result.dailyKg, 1) + " kg" },
    { label: "Trees Needed to Offset", value: fmt(result.treesNeeded) + " trees/yr", total: true },
  ];

  const faqs = [
    { question: "How much CO2 does a gallon of gas produce?", answer: "Burning one gallon of gasoline releases about 8.9 kg (19.6 lbs) of CO2; diesel is higher at 10.2 kg (22.4 lbs) per gallon. The fuel's carbon content, not the engine, determines this." },
    { question: "Are electric cars really zero emissions?", answer: "EVs have zero tailpipe emissions, but charging uses grid electricity. On the US average grid (~0.4 kg/kWh) an EV at 3 mi/kWh emits roughly 1.6 kg per mile-equivalent — about 40-60% less than a gasoline car, and near zero with renewable power." },
    { question: "What is the average annual vehicle emission?", answer: "A typical US passenger car emits about 4.6 metric tons of CO2 per year (22 MPG, 11,500 miles). This calculator's defaults — 12,000 miles at 25 MPG — produce about 4.27 tons." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Vehicle Emissions Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vehicle Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Vehicle Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="miles" label="Annual Miles Driven" value={inputs.miles} onChange={set("miles")} min="0" suffix="miles" />
              <SelectInput id="fuel" label="Fuel Type" value={inputs.fuel} onChange={set("fuel")} options={Object.entries(FUEL_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
            </div>
            <div>
              <NumInput id="mpg" label="Fuel Efficiency" value={inputs.mpg} onChange={set("mpg")} min="0.1" suffix={inputs.fuel === "electric" ? "mi/kWh" : "MPG"} disabled={inputs.fuel === "electric"} hint={inputs.fuel === "electric" ? "EVs use ~3 mi/kWh — grid electricity, not gallons." : undefined} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Miles must be ≥ 0 and fuel economy must be positive.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual CO₂ Output</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalTons, 2)} <span className="text-2xl">tons</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.co2Kg)} kg CO2e · <span className="font-bold text-foreground">{fmt(result.treesNeeded)} trees</span> to offset</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fuel Consumed</span>
                <span className="font-extrabold text-primary">{fuelUnit}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Avg</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.monthlyKg, 0)} kg</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Avg</span>
                <span className="font-extrabold text-foreground">{fmt(result.dailyKg, 1)} kg</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Annual CO₂ by Fuel Type (kg, same miles)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v) + " kg CO2", "Annual"]} />
                  <Bar dataKey="value" name="Annual CO2 (kg)" radius={[4, 4, 0, 0]}>
                    {result.chart.map((c) => (
                      <Cell key={c.name} fill={c.selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">Highlighted bar = your fuel type.</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Miles Driven", value: fmt(num(inputs.miles)) + " mi" },
                  { label: "Fuel Type", value: FUEL_LABELS[inputs.fuel] ?? inputs.fuel },
                  { label: "Fuel Consumed", value: fuelUnit },
                  { label: "Annual CO₂", value: fmt(result.totalTons, 2) + " tons", bold: true },
                  { label: "Monthly Avg", value: fmt(result.monthlyKg, 0) + " kg" },
                  { label: "Trees to Offset", value: fmt(result.treesNeeded) + " trees/yr" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                    <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>With the defaults (12,000 miles, 25 MPG, gasoline), the car burns <strong>480 gallons and emits 4.27 tons CO2</strong> — 356 kg per month. That's just below the 4.6-ton US average and would take about 214 trees a year to offset.</p>
            <h2 className="text-2xl font-bold mb-3">MPG Is Not Linear</h2>
            <p>Going from 15 to 20 MPG saves far more fuel than going from 35 to 40 MPG. The biggest environmental gains come from replacing the least efficient vehicles. EVs, even on a mixed grid, emit roughly half the CO2 of the same trip in a gasoline car.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vehicle-emissions-calculator" />
          <PopularCalculators exclude="/calculator/vehicle-emissions-calculator" />
        </div>
      </div>
    </>
  );
};
export default VehicleEmissionsCalculator;
