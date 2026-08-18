"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs {
  electricity: string; gas: string; oil: string;
  carMiles: string; carMpg: string;
  shortFlights: string; mediumFlights: string; longFlights: string;
}

interface Result {
  houseKg: number;
  transportKg: number;
  flightKg: number;
  totalKg: number;
  totalTons: number;
  percentile: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { electricity: "300", gas: "50", oil: "0", carMiles: "1000", carMpg: "25", shortFlights: "2", mediumFlights: "1", longFlights: "0" };

function calculate(inputs: Inputs): Result {
  const elec = Math.max(0, parseFloat(inputs.electricity) || 0);
  const gas = Math.max(0, parseFloat(inputs.gas) || 0);
  const oil = Math.max(0, parseFloat(inputs.oil) || 0);
  const miles = Math.max(0, parseFloat(inputs.carMiles) || 0);
  const mpg = Math.max(0.1, parseFloat(inputs.carMpg) || 0.1);
  const short = Math.max(0, parseFloat(inputs.shortFlights) || 0);
  const medium = Math.max(0, parseFloat(inputs.mediumFlights) || 0);
  const long = Math.max(0, parseFloat(inputs.longFlights) || 0);
  // Emission factors (kg CO2e): EPA / Carbon Trust averages
  const houseKg = elec * 0.4 * 12 + gas * 5.3 * 12 + oil * 10.1 * 12;
  const transportKg = ((miles * 12) / mpg) * 8.8;
  const flightKg = short * 150 + medium * 400 + long * 1200;
  const totalKg = houseKg + transportKg + flightKg;
  const totalTons = totalKg / 1000;
  const percentile = totalTons < 4 ? "Very Low" : totalTons < 10 ? "Average" : "High";
  return {
    houseKg,
    transportKg,
    flightKg,
    totalKg,
    totalTons,
    percentile,
    chart: [
      { name: "Home Energy", value: Math.round(houseKg) },
      { name: "Driving", value: Math.round(transportKg) },
      { name: "Flights", value: Math.round(flightKg) },
    ],
  };
}

const CarbonFootprintCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.electricity) < 0 || num(inputs.gas) < 0 || num(inputs.oil) < 0 || num(inputs.carMiles) < 0 || num(inputs.carMpg) <= 0 || num(inputs.shortFlights) < 0 || num(inputs.mediumFlights) < 0 || num(inputs.longFlights) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Electricity Use", value: fmt(num(inputs.electricity)) + " kWh/mo" },
    { label: "Natural Gas Use", value: fmt(num(inputs.gas)) + " therms/mo" },
    { label: "Heating Oil Use", value: fmt(num(inputs.oil)) + " gal/mo" },
    { label: "Home Energy", value: fmt(result.houseKg / 1000, 2) + " tons", highlight: true },
    { label: "Driving (" + fmt(num(inputs.carMiles)) + " mi @ " + fmt(num(inputs.carMpg)) + " mpg)", value: fmt(result.transportKg / 1000, 2) + " tons", highlight: true },
    { label: "Flights (" + fmt(num(inputs.shortFlights)) + "S / " + fmt(num(inputs.mediumFlights)) + "M / " + fmt(num(inputs.longFlights)) + "L)", value: fmt(result.flightKg / 1000, 2) + " tons", highlight: true },
    { label: "Total Annual Footprint", value: fmt(result.totalTons, 1) + " tons CO2e", total: true },
  ];

  const faqs = [
    { question: "What is a carbon footprint?", answer: "It is the total greenhouse gases (CO2 and methane, counted as CO2e) your activities produce in a year. The US average is about 16 tons per person — one of the highest rates in the world — versus roughly 4 tons globally." },
    { question: "How can I reduce it?", answer: "The biggest levers are home energy (insulation, heat pumps, renewable electricity), transportation (fewer miles, efficient or electric vehicles, fewer flights), and diet (less beef and lamb)." },
    { question: "What are carbon offsets?", answer: "Offsets fund projects that avoid or remove emissions — reforestation, methane capture, renewable energy — to compensate for emissions you can't eliminate. They work best after cutting direct emissions first." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Carbon Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbon Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Home Energy (Monthly)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="electricity" label="Electricity" value={inputs.electricity} onChange={set("electricity")} min="0" suffix="kWh" />
              <NumInput id="gas" label="Natural Gas" value={inputs.gas} onChange={set("gas")} min="0" suffix="therms" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Transportation (Monthly)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="carMiles" label="Distance Driven" value={inputs.carMiles} onChange={set("carMiles")} min="0" suffix="miles" />
              <NumInput id="carMpg" label="Vehicle Fuel Economy" value={inputs.carMpg} onChange={set("carMpg")} min="1" suffix="mpg" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Flights (Annual)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="shortFlights" label="Short Haul (<3h)" value={inputs.shortFlights} onChange={set("shortFlights")} min="0" />
              <NumInput id="mediumFlights" label="Medium Haul (3-6h)" value={inputs.mediumFlights} onChange={set("mediumFlights")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Advanced Options</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="oil" label="Heating Oil" value={inputs.oil} onChange={set("oil")} min="0" suffix="gal/mo" />
              <NumInput id="longFlights" label="Long Haul (>6h)" value={inputs.longFlights} onChange={set("longFlights")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">All values must be ≥ 0 and fuel economy must be positive.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Annual CO2e Emissions</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalTons, 1)} <span className="text-2xl">tons</span></div>
              <div className="text-sm text-muted-foreground font-medium">Impact level: <span className="font-bold text-foreground">{result.percentile}</span> (US avg ≈ 16 tons)</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Home Energy</span>
                <span className="font-extrabold text-primary">{fmt(result.houseKg / 1000, 2)} tons</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Driving</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.transportKg / 1000, 2)} tons</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Flights</span>
                <span className="font-extrabold text-foreground">{fmt(result.flightKg / 1000, 2)} tons</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Source</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Annual Tons</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Where Your Emissions Come From</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value / 1000, 1)}t`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v / 1000, 2) + " tons", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Home Energy", value: fmt(result.houseKg / 1000, 2) + " tons", bold: true },
                  { label: "Driving", value: fmt(result.transportKg / 1000, 2) + " tons", bold: true },
                  { label: "Flights", value: fmt(result.flightKg / 1000, 2) + " tons", bold: true },
                  { label: "Total", value: fmt(result.totalTons, 1) + " tons", bold: true },
                  { label: "Daily Average", value: fmt(result.totalKg / 365, 1) + " kg CO2e" },
                  { label: "Impact Level", value: result.percentile },
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
            <p>With the defaults (300 kWh/mo electricity, 50 therms/mo gas, 1,000 mi/month at 25 mpg, 3 flights/year), the footprint is <strong>9.5 tons CO2e per year</strong> — classified Average, just under the 10-ton threshold. Home energy (4.6t) and driving (4.2t) dominate; flights add 0.7t.</p>
            <h2 className="text-2xl font-bold mb-3">Emission Factors</h2>
            <p>Electricity uses a 0.4 kg/kWh average grid mix — your local grid may be cleaner (renewables) or dirtier (coal). Gas is 5.3 kg/therm, heating oil 10.1 kg/gal, gasoline 8.8 kg/gal, and flights 150/400/1,200 kg per short/medium/long round trip, based on EPA and Carbon Trust averages.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbon-footprint-calculator" />
          <PopularCalculators exclude="/calculator/carbon-footprint-calculator" />
        </div>
      </div>
    </>
  );
};
export default CarbonFootprintCalculator;
