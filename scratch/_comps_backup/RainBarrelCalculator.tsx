"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

interface Inputs { roofArea: string; rainfall: string; coeff: string; }

interface Result {
  gallons: number;
  liters: number;
  barrels: number;
  gardenSqFt: number;
  weightLbs: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { roofArea: "1000", rainfall: "1", coeff: "0.9" };

function calculate(inputs: Inputs): Result {
  const area = Math.max(0, parseFloat(inputs.roofArea) || 0);
  const rain = Math.max(0, parseFloat(inputs.rainfall) || 0);
  const coeff = Math.min(1, Math.max(0, parseFloat(inputs.coeff) || 0));
  const gallons = area * rain * 0.623 * coeff;
  const liters = gallons * 3.785;
  const barrels = gallons > 0 ? Math.ceil(gallons / 55) : 0;
  const gardenSqFt = gallons / 0.623;
  const weightLbs = gallons * 8.34;
  return {
    gallons,
    liters,
    barrels,
    gardenSqFt,
    weightLbs,
    chart: [
      { name: "Captured", value: Math.round(gallons) },
      { name: "1 Barrel (55 gal)", value: 55 },
      { name: "1 Storm (2 in)", value: Math.round(area * 2 * 0.623 * coeff) },
    ],
  };
}

const RainBarrelCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.roofArea) < 0 || num(inputs.rainfall) < 0 || num(inputs.coeff) < 0 || num(inputs.coeff) > 1;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Roof Area (footprint)", value: fmt(num(inputs.roofArea)) + " sq ft" },
    { label: "Rainfall", value: fmt(num(inputs.rainfall), 1) + " inches" },
    { label: "Runoff Efficiency", value: fmt(num(inputs.coeff) * 100, 0) + "%" },
    { label: "Water Captured", value: fmt(result.gallons) + " gal (" + fmt(result.liters) + " L)", highlight: true },
    { label: "55-Gallon Barrels Needed", value: fmt(result.barrels) + " barrels", highlight: true },
    { label: "Total Weight", value: fmt(result.weightLbs) + " lbs" },
    { label: "Garden Irrigated (1 in)", value: fmt(result.gardenSqFt) + " sq ft", total: true },
  ];

  const faqs = [
    { question: "How much water can a roof collect?", answer: "About 0.623 gallons per square foot per inch of rain at 100% efficiency. A 1,000 sq ft roof in a 1-inch storm yields roughly 560 gallons at 90% — enough to fill eleven 55-gallon barrels." },
    { question: "What is the runoff coefficient?", answer: "It's the collection efficiency of your roof material: asphalt shingles ~0.9, metal ~0.95, tile ~0.85, flat gravel ~0.6 (absorption and evaporation reduce yield)." },
    { question: "Is rain barrel water safe for vegetables?", answer: "Generally yes, though asphalt shingle runoff can carry trace chemicals. Watering at the base rather than on leaves, or reserving the water for ornamental plants, is the common-sense approach." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Rain Barrel Sizing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rain Barrel Sizing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Roof & Rainfall</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="roofArea" label="Roof Area" value={inputs.roofArea} onChange={set("roofArea")} min="0" suffix="sq ft" />
              <NumInput id="rainfall" label="Rainfall Amount" value={inputs.rainfall} onChange={set("rainfall")} min="0" suffix="inches" />
            </div>
            <div>
              <NumInput id="coeff" label="Runoff Efficiency" value={inputs.coeff} onChange={set("coeff")} min="0" max="1" step="0.05" hint="Asphalt 0.9, metal 0.95, tile 0.85." />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">All values must be ≥ 0 and efficiency between 0 and 1.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Water Captured in This Storm</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.gallons)} <span className="text-2xl">gallons</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.liters)} liters · <span className="font-bold text-foreground">{fmt(result.barrels)} × 55-gal</span> barrels to store it</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Barrels Needed</span>
                <span className="font-extrabold text-primary">{fmt(result.barrels)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Garden Irrigated</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.gardenSqFt)} sq ft</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Weight</span>
                <span className="font-extrabold text-foreground">{fmt(result.weightLbs)} lbs</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Collection Comparison (gallons)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v) + " gal", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="value" name="Gallons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Roof Area", value: fmt(num(inputs.roofArea)) + " sq ft" },
                  { label: "Rainfall", value: fmt(num(inputs.rainfall), 1) + " in" },
                  { label: "Water Captured", value: fmt(result.gallons) + " gal", bold: true },
                  { label: "Barrels Needed", value: fmt(result.barrels), bold: true },
                  { label: "Garden (1 in)", value: fmt(result.gardenSqFt) + " sq ft" },
                  { label: "Total Weight", value: fmt(result.weightLbs) + " lbs" },
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
            <p>With the defaults (1,000 sq ft roof, 1 inch of rain, 90% efficiency), a single storm yields <strong>561 gallons</strong> — enough to fill eleven 55-gallon barrels, irrigate 900 sq ft of garden with an inch of water, or weigh over 4,600 lbs.</p>
            <h2 className="text-2xl font-bold mb-3">The 0.623 Factor</h2>
            <p>One inch of rain on one square foot is 1/12 of a cubic foot = 0.623 gallons. Multiply by roof footprint (pitch doesn't matter — a flat and steep roof of the same footprint catch the same vertical rainfall) and your runoff efficiency.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rain-barrel-calculator" />
          <PopularCalculators exclude="/calculator/rain-barrel-calculator" />
        </div>
      </div>
    </>
  );
};
export default RainBarrelCalculator;
