"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, max, step, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; step?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { diameter: string; windSpeed: string; efficiency: string; airDensity: string; }

interface Result {
  area: number;
  powerInWind: number;
  powerWatts: number;
  dailyKwh: number;
  annualKwh: number;
  co2Kg: number;
  homesPowered: number;
  chart: { speed: number; power: number }[];
}

const DEFAULTS: Inputs = { diameter: "3", windSpeed: "5", efficiency: "35", airDensity: "1.225" };

function calculate(inputs: Inputs): Result {
  const d = Math.max(0, parseFloat(inputs.diameter) || 0);
  const v = Math.max(0, parseFloat(inputs.windSpeed) || 0);
  const eff = Math.min(59.3, Math.max(0, parseFloat(inputs.efficiency) || 0)) / 100;
  const rho = Math.max(0.01, parseFloat(inputs.airDensity) || 0.01);
  const area = Math.PI * Math.pow(d / 2, 2);
  const powerInWind = 0.5 * rho * area * Math.pow(v, 3);
  const powerWatts = powerInWind * eff;
  const dailyKwh = (powerWatts * 24) / 1000;
  const annualKwh = dailyKwh * 365;
  const co2Kg = annualKwh * 0.4;
  const homesPowered = annualKwh / 10500; // avg US home ~10,500 kWh/yr
  const chart = Array.from({ length: 21 }, (_, k) => {
    const speed = (k * 12) / 20; // 0-12 m/s
    return { speed: Math.round(speed * 10) / 10, power: Math.round((0.5 * rho * area * Math.pow(speed, 3) * eff) / 100) / 10 };
  });
  return { area, powerInWind, powerWatts, dailyKwh, annualKwh, co2Kg, homesPowered, chart };
}

const WindTurbineEnergyCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.diameter) < 0 || num(inputs.windSpeed) < 0 || num(inputs.efficiency) < 0 || num(inputs.efficiency) > 59.3 || num(inputs.airDensity) <= 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Rotor Diameter", value: fmt(num(inputs.diameter)) + " m" },
    { label: "Swept Area (A = πr²)", value: fmt(result.area, 2) + " m²" },
    { label: "Average Wind Speed", value: fmt(num(inputs.windSpeed), 1) + " m/s" },
    { label: "Turbine Efficiency", value: fmt(num(inputs.efficiency)) + "%" },
    { label: "Power in the Wind", value: fmt(result.powerInWind) + " W", highlight: true },
    { label: "Usable Power Output", value: fmt(result.powerWatts) + " W", highlight: true },
    { label: "Annual Energy", value: fmt(result.annualKwh) + " kWh", total: true },
  ];

  const faqs = [
    { question: "What is the Betz Limit?", answer: "The Betz Limit is the theoretical maximum efficiency of any wind turbine: 59.3%. The wind must keep moving through the rotor, so no turbine can capture more than that share of the kinetic energy." },
    { question: "Why is wind speed so important?", answer: "Power scales with the cube of wind speed — doubling the wind speed produces 8× the power. That's why siting at height with consistent wind matters more than anything else." },
    { question: "How large are residential turbines?", answer: "Typical residential turbines have 2-5 m rotors on 20-40 m towers. A 3 m rotor at 5 m/s at 35% efficiency yields roughly 190 W average — enough to offset a small share of household use, not replace the grid." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Wind Turbine Energy Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wind Turbine Energy Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Turbine & Site</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="diameter" label="Rotor Diameter" value={inputs.diameter} onChange={set("diameter")} min="0" suffix="m" />
              <NumInput id="windSpeed" label="Avg Wind Speed" value={inputs.windSpeed} onChange={set("windSpeed")} min="0" suffix="m/s" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="efficiency" label="Turbine Efficiency" value={inputs.efficiency} onChange={set("efficiency")} min="0" max="59.3" suffix="%" hint="Max 59.3% (Betz limit)." />
              <NumInput id="airDensity" label="Air Density" value={inputs.airDensity} onChange={set("airDensity")} min="0.01" step="0.005" suffix="kg/m³" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Efficiency must be 0-59.3%, air density positive, others ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Energy Output</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.annualKwh)} <span className="text-2xl">kWh</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.powerWatts)} W average power · <span className="font-bold text-foreground">{fmt(result.homesPowered, 2)}</span> homes' worth</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Energy</span>
                <span className="font-extrabold text-primary">{fmt(result.dailyKwh, 1)} kWh</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Power in Wind</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.powerInWind)} W</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Offset</span>
                <span className="font-extrabold text-foreground">{fmt(result.co2Kg, 0)} kg/yr</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Parameter</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Power Output vs Wind Speed (W)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="speed" tick={{ fontSize: 11 }} label={{ value: "Wind speed (m/s)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "Watts", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number) => [fmt(v * 100, 0) + " W", "Power"]} labelFormatter={(l) => `${l} m/s`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine x={num(inputs.windSpeed)} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Your site", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                  <Line type="monotone" dataKey="power" name="Power (×100 W)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Swept Area", value: fmt(result.area, 2) + " m²" },
                  { label: "Avg Power", value: fmt(result.powerWatts) + " W", bold: true },
                  { label: "Daily Energy", value: fmt(result.dailyKwh, 1) + " kWh" },
                  { label: "Annual Energy", value: fmt(result.annualKwh) + " kWh", bold: true },
                  { label: "CO₂ Offset", value: fmt(result.co2Kg, 0) + " kg/yr" },
                  { label: "Homes Powered", value: fmt(result.homesPowered, 2) },
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
            <p>With the defaults (3 m rotor, 5 m/s wind, 35% efficiency), the wind carries <strong>541 W</strong> through the swept area and the turbine captures about <strong>189 W</strong> — 4.5 kWh/day, 1,660 kWh/year. That's about 16% of a typical US home's use, or 0.16 homes.</p>
            <h2 className="text-2xl font-bold mb-3">The Physics</h2>
            <p>Power = ½·ρ·A·v³, where A = π·(d/2)². Doubling the rotor doubles the diameter and quadruples the area; doubling wind speed octuples the power. This is why the chart rises so steeply and why 5 m/s vs 7 m/s is the difference between a novelty and a real contributor.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wind-turbine-energy-calculator" />
          <PopularCalculators exclude="/calculator/wind-turbine-energy-calculator" />
        </div>
      </div>
    </>
  );
};
export default WindTurbineEnergyCalculator;
