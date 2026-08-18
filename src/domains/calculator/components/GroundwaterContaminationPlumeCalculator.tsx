"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, step, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; step?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs {
  sourceConcentration: string;
  conductivity: string;
  gradient: string;
  porosity: string;
  decayRate: string;
  distance: string;
  limitConcentration: string;
}

interface Result {
  velocity: number;
  travelTime: number;
  concentration: number;
  plumeLength: number;
  chart: { distance: number; concentration: number }[];
}

const DEFAULTS: Inputs = {
  sourceConcentration: "100",
  conductivity: "1",
  gradient: "0.01",
  porosity: "0.3",
  decayRate: "0.001",
  distance: "10",
  limitConcentration: "5",
};

function calculate(inputs: Inputs): Result | null {
  const C0 = parseFloat(inputs.sourceConcentration);
  const K = parseFloat(inputs.conductivity);
  const i = parseFloat(inputs.gradient);
  const n = parseFloat(inputs.porosity);
  const lambda = parseFloat(inputs.decayRate);
  const x = parseFloat(inputs.distance);
  const Climit = parseFloat(inputs.limitConcentration);
  if ([C0, K, i, n, lambda, x, Climit].some((v) => isNaN(v))) return null;
  if (K <= 0 || i < 0 || n <= 0 || x < 0 || C0 < 0 || lambda < 0 || Climit <= 0) return null;
  const velocity = (K * i) / n; // m/d
  const travelTime = x / velocity; // days
  const concentration = C0 * Math.exp(-lambda * travelTime); // mg/L
  // Plume length: distance where concentration falls to the limit (first-order decay)
  const plumeLength = C0 > Climit && lambda > 0 ? (velocity / lambda) * Math.log(C0 / Climit) : (C0 > Climit ? Infinity : 0);
  const maxDist = isFinite(plumeLength) ? plumeLength : x * 2 || 10;
  const samples = 30;
  const chart = Array.from({ length: samples + 1 }, (_, k) => {
    const d = (maxDist * k) / samples;
    return { distance: Math.round(d * 100) / 100, concentration: Math.round(C0 * Math.exp(-(lambda * d) / velocity) * 1000) / 1000 };
  });
  return { velocity, travelTime, concentration, plumeLength, chart };
}

const GroundwaterContaminationPlumeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.conductivity) <= 0 || num(inputs.porosity) <= 0 || num(inputs.limitConcentration) <= 0 || num(inputs.gradient) < 0 || num(inputs.sourceConcentration) < 0 || num(inputs.decayRate) < 0 || num(inputs.distance) < 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const plumeText = r ? (r.plumeLength === Infinity ? "Exceeds modeled range" : fmt(r.plumeLength, 1) + " m") : "—";
  const rows = r ? [
    { label: "Source Concentration (C₀)", value: fmt(num(inputs.sourceConcentration)) + " mg/L" },
    { label: "Hydraulic Conductivity (K)", value: fmt(num(inputs.conductivity), 2) + " m/d" },
    { label: "Hydraulic Gradient (i)", value: fmt(num(inputs.gradient), 3) },
    { label: "Effective Porosity (n)", value: fmt(num(inputs.porosity), 2) },
    { label: "Decay Rate (λ)", value: fmt(num(inputs.decayRate), 4) + " /day" },
    { label: "Groundwater Velocity", value: fmt(r.velocity, 2) + " m/d", highlight: true },
    { label: "Travel Time to " + fmt(num(inputs.distance)) + " m", value: fmt(r.travelTime, 1) + " days" },
    { label: "Plume Length (to limit)", value: plumeText, total: true },
  ] : [];

  const faqs = [
    { question: "What is a contaminant plume?", answer: "A contaminant plume is the body of contaminated groundwater moving downstream from a pollution source. Its extent is governed by advection (groundwater velocity), dispersion, and attenuation such as first-order decay." },
    { question: "How is plume length estimated?", answer: "For a continuous source with first-order decay, concentration declines as C = C₀·exp(−λ·t), where travel time t = x/v and v = (K·i)/n. The plume length is the distance where C falls to the regulatory limit: L = (v/λ)·ln(C₀/C_limit)." },
    { question: "What do the parameters mean?", answer: "Hydraulic conductivity K and gradient i push the plume downstream, porosity n slows it down, and the decay rate λ (biodegradation, sorption, dilution) shrinks it. This calculator uses Darcy's law for velocity and the exponential decay model for a screening-level estimate — dispersion is ignored." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Engineering", href: "/calculator#engineering" }, { label: "Groundwater Contamination Plume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Groundwater Contamination Plume Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Aquifer & Source</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="sourceConcentration" label="Source Concentration (mg/L)" value={inputs.sourceConcentration} onChange={set("sourceConcentration")} min="0" />
              <NumInput id="conductivity" label="Hydraulic Conductivity (m/d)" value={inputs.conductivity} onChange={set("conductivity")} min="0.0001" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="gradient" label="Hydraulic Gradient" value={inputs.gradient} onChange={set("gradient")} min="0" step="0.001" />
              <NumInput id="porosity" label="Effective Porosity" value={inputs.porosity} onChange={set("porosity")} min="0.01" step="0.01" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Transport & Attenuation</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="decayRate" label="Decay Rate (1/day)" value={inputs.decayRate} onChange={set("decayRate")} min="0" step="0.0001" />
              <NumInput id="distance" label="Distance from Source (m)" value={inputs.distance} onChange={set("distance")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Advanced Options</div>
            <div>
              <NumInput id="limitConcentration" label="Cleanup Limit (mg/L)" value={inputs.limitConcentration} onChange={set("limitConcentration")} min="0.001" hint="Concentration threshold used for plume-length estimate." />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Conductivity, porosity, and cleanup limit must be positive; other values must be ≥ 0.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} disabled={hasErrors} className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]"}`}>Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Concentration at {fmt(num(inputs.distance))} m</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.concentration, 2)} <span className="text-2xl">mg/L</span></div>
                  <div className="text-sm text-muted-foreground font-medium">after {fmt(r.travelTime, 1)} days of transport</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Groundwater Velocity</span>
                    <span className="font-extrabold text-primary">{fmt(r.velocity, 2)} m/d</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Travel Time</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.travelTime, 1)} days</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Plume Length</span>
                    <span className="font-extrabold text-foreground">{plumeText}</span>
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
                      {rows.map((row) => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`p-2.5 pr-3 text-right font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-bold text-foreground mb-3">Concentration vs Distance from Source</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="distance" tick={{ fontSize: 11 }} label={{ value: "Distance (m)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11 }} label={{ value: "mg/L", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => [fmt(v, 2) + " mg/L", "Concentration"]} labelFormatter={(l) => `Distance: ${l} m`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {isFinite(r.plumeLength) && <ReferenceLine x={r.plumeLength} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Plume length", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />}
                      <Line type="monotone" dataKey="concentration" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Concentration" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Source Conc.", value: fmt(num(inputs.sourceConcentration)) + " mg/L" },
                      { label: "Velocity", value: fmt(r.velocity, 2) + " m/d", bold: true },
                      { label: "Travel Time", value: fmt(r.travelTime, 1) + " days" },
                      { label: "Conc. at " + fmt(num(inputs.distance)) + " m", value: fmt(r.concentration, 2) + " mg/L", bold: true },
                      { label: "Cleanup Limit", value: fmt(num(inputs.limitConcentration)) + " mg/L" },
                      { label: "Plume Length", value: plumeText, bold: true },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{s.label}</span>
                        <span className={`text-sm font-extrabold ${s.bold ? "text-primary" : "text-foreground"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Numbers Mean</h2>
            <p>With the defaults (C₀=100 mg/L, K=1 m/d, gradient 0.01, porosity 0.3, λ=0.001/day), groundwater moves at <strong>0.033 m/d</strong>, so a monitoring well 10 m downgradient sees contamination after about 300 days at a concentration near <strong>74.1 mg/L</strong> — still well above the 5 mg/L cleanup limit.</p>
            <h2 className="text-2xl font-bold mb-3">The Decay Model</h2>
            <p>This screening-level estimate uses C = C₀·exp(−λ·x/v) with v = K·i/n. The plume length to a 5 mg/L limit works out to about <strong>100 m</strong> here. Real sites need dispersion, transient flow, and site-specific reactive-transport modeling, but this gives a fast first-order check.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/groundwater-contamination-plume-calculator" />
          <PopularCalculators exclude="/calculator/groundwater-contamination-plume-calculator" />
        </div>
      </div>
    </>
  );
};
export default GroundwaterContaminationPlumeCalculator;
