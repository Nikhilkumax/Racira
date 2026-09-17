"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, max, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} max={max} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

// Per meatless day savings vs an average meat-inclusive diet (USDA/EPA-based averages)
const WATER_PER_DAY = 1100; // gallons
const GRAIN_PER_DAY = 40; // lbs
const LAND_PER_DAY = 30; // sq ft
const CO2_PER_DAY = 20; // lbs

interface Inputs { daysPerWeek: string; people: string; weeks: string; }

interface Result {
  totalDays: number;
  waterGallons: number;
  grainLbs: number;
  landSqFt: number;
  co2Lbs: number;
  co2Tons: number;
  co2Kg: number;
  chart: { week: number; co2: number }[];
}

const DEFAULTS: Inputs = { daysPerWeek: "1", people: "1", weeks: "52" };

function calculate(inputs: Inputs): Result {
  const d = Math.min(7, Math.max(0, parseFloat(inputs.daysPerWeek) || 0));
  const p = Math.max(0, parseFloat(inputs.people) || 0);
  const w = Math.max(0, parseFloat(inputs.weeks) || 0);
  const totalDays = d * p * w;
  const waterGallons = totalDays * WATER_PER_DAY;
  const grainLbs = totalDays * GRAIN_PER_DAY;
  const landSqFt = totalDays * LAND_PER_DAY;
  const co2Lbs = totalDays * CO2_PER_DAY;
  const co2Kg = co2Lbs * 0.453592;
  const co2Tons = co2Kg / 1000;
  const step = w > 30 ? 4 : w > 12 ? 2 : 1;
  const chart = Array.from({ length: Math.floor(w / step) + 1 }, (_, k) => {
    const week = k * step;
    return { week, co2: Math.round(d * p * week * CO2_PER_DAY * 0.453592 * 10) / 10 };
  });
  return { totalDays, waterGallons, grainLbs, landSqFt, co2Lbs, co2Tons, co2Kg, chart };
}

const MeatlessDietImpactCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.daysPerWeek) < 0 || num(inputs.daysPerWeek) > 7 || num(inputs.people) < 0 || num(inputs.weeks) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Meatless Days per Week", value: fmt(num(inputs.daysPerWeek), 1) },
    { label: "People Participating", value: fmt(num(inputs.people)) },
    { label: "Weeks", value: fmt(num(inputs.weeks)) },
    { label: "Total Meatless Days", value: fmt(result.totalDays), highlight: true },
    { label: "CO₂ Avoided", value: fmt(result.co2Tons, 2) + " tons (" + fmt(result.co2Lbs) + " lbs)", highlight: true },
    { label: "Water Saved", value: fmt(result.waterGallons) + " gallons" },
    { label: "Grain Saved", value: fmt(result.grainLbs) + " lbs", total: true },
  ];

  const faqs = [
    { question: "Are these estimates accurate?", answer: "They are averages for skipping an average meat-heavy meal — roughly 1,100 gallons of water, 40 lbs of grain, 30 sq ft of forest, and 20 lbs of CO₂e per person-day based on USDA and EPA figures. Exact savings vary with the specific meats and dishes avoided." },
    { question: "Why does meat use so much water?", answer: "Most of the water footprint comes from growing feed crops — it takes hundreds of gallons of water to grow the grain behind a single pound of beef, plus drinking water for the animal over its life." },
    { question: "How does eating less meat help forests?", answer: "Cattle ranching and soy-for-feed production are leading drivers of Amazon deforestation. Cutting meat consumption frees agricultural land, which can be rewilded to absorb carbon." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Meatless Diet Impact Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Meatless Diet Impact Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Diet Plan</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="daysPerWeek" label="Meatless Days / Week" value={inputs.daysPerWeek} onChange={set("daysPerWeek")} min="0" max="7" />
              <NumInput id="people" label="People Participating" value={inputs.people} onChange={set("people")} min="0" />
            </div>
            <div>
              <NumInput id="weeks" label="Number of Weeks" value={inputs.weeks} onChange={set("weeks")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Days per week must be 0-7 and other values ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">CO₂ Emissions Avoided</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.co2Tons, 2)} <span className="text-2xl">tons CO2e</span></div>
              <div className="text-sm text-muted-foreground font-medium">across <span className="font-bold text-foreground">{fmt(result.totalDays)}</span> meatless days</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Water Saved</span>
                <span className="font-extrabold text-primary">{fmt(result.waterGallons)} gal</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Grain Saved</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.grainLbs)} lbs</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Forest Saved</span>
                <span className="font-extrabold text-foreground">{fmt(result.landSqFt)} sq ft</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Impact Metric</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Total</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Cumulative CO₂ Avoided Over Time (kg)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} label={{ value: "Week", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v, 1) + " kg", "CO₂ avoided"]} labelFormatter={(l) => `Week ${l}`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="co2" name="CO₂ avoided (kg)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Meatless Days", value: fmt(result.totalDays), bold: true },
                  { label: "CO₂ Avoided", value: fmt(result.co2Tons, 2) + " tons", bold: true },
                  { label: "Water Saved", value: fmt(result.waterGallons) + " gal" },
                  { label: "Grain Saved", value: fmt(result.grainLbs) + " lbs" },
                  { label: "Forest Saved", value: fmt(result.landSqFt) + " sq ft" },
                  { label: "Per Day (CO₂)", value: fmt(CO2_PER_DAY * 0.453592, 1) + " kg" },
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
            <p>With the defaults (1 meatless day/week for 1 person over 52 weeks), that's 52 meatless days: <strong>0.47 tons of CO₂ avoided</strong> (1,040 lbs), along with 57,200 gallons of water, 2,080 lbs of grain, and 1,560 sq ft of forest. Scale the days or people up and the impact compounds quickly.</p>
            <h2 className="text-2xl font-bold mb-3">Where the Numbers Come From</h2>
            <p>Per meatless day this calculator credits about 1,100 gallons of water, 40 lbs of grain, 30 sq ft of land, and 20 lbs of CO₂e — USDA and EPA averages for replacing an average meat-centric day with plant-based foods. Beef and lamb dominate these figures, so heavier meat diets see larger savings.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meatless-monday-impact-calculator" />
          <PopularCalculators exclude="/calculator/meatless-monday-impact-calculator" />
        </div>
      </div>
    </>
  );
};
export default MeatlessDietImpactCalculator;
