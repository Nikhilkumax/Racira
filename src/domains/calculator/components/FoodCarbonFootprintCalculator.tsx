"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
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

// Daily kg CO2e per 2,000 kcal — Scarborough et al. 2014 (Oxford) dietary emission factors
const DIET_FACTORS: Record<string, number> = {
  meat_heavy: 7.19,
  meat_medium: 5.63,
  meat_low: 4.67,
  pescatarian: 3.91,
  vegetarian: 3.81,
  vegan: 2.89,
  average: 5.5,
};

const DIET_LABELS: Record<string, string> = {
  meat_heavy: "Meat Heavy",
  meat_medium: "Medium Meat",
  meat_low: "Low Meat",
  pescatarian: "Pescatarian",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  average: "Average Diet",
};

interface Inputs { diet: string; calories: string; }

interface Result {
  dailyKg: number;
  annualKg: number;
  annualTons: number;
  treesNeeded: number;
  savingsVsAverage: number;
  savingsPct: number;
  chart: { name: string; value: number; selected: boolean }[];
}

const DEFAULTS: Inputs = { diet: "average", calories: "2000" };

function calculate(inputs: Inputs): Result {
  const cals = Math.max(0, parseFloat(inputs.calories) || 0);
  const calorieMult = cals / 2000;
  const dailyKg = (DIET_FACTORS[inputs.diet] ?? DIET_FACTORS.average) * calorieMult;
  const annualKg = dailyKg * 365;
  const annualTons = annualKg / 1000;
  const treesNeeded = Math.ceil(annualKg / 20);
  const avgDaily = DIET_FACTORS.average * calorieMult;
  const savingsVsAverage = (avgDaily - dailyKg) * 365;
  const savingsPct = avgDaily > 0 ? ((avgDaily - dailyKg) / avgDaily) * 100 : 0;
  const chart = Object.entries(DIET_FACTORS).map(([key, factor]) => ({
    name: DIET_LABELS[key],
    value: Math.round((factor * 365 * calorieMult) / 1000 * 100) / 100,
    selected: key === inputs.diet,
  }));
  return { dailyKg, annualKg, annualTons, treesNeeded, savingsVsAverage, savingsPct, chart };
}

const FoodCarbonFootprintCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.calories) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Dietary Habit", value: DIET_LABELS[inputs.diet] ?? inputs.diet },
    { label: "Daily Calorie Intake", value: fmt(num(inputs.calories)) + " kcal" },
    { label: "Daily Footprint", value: fmt(result.dailyKg, 1) + " kg CO2e", highlight: true },
    { label: "Annual Footprint", value: fmt(result.annualKg, 0) + " kg CO2e" },
    { label: "Trees Needed to Offset (1 yr)", value: fmt(result.treesNeeded) + " trees" },
    { label: "Vs. Average Diet", value: (result.savingsVsAverage >= 0 ? "−" : "+") + fmt(Math.abs(result.savingsVsAverage), 0) + " kg CO2e", total: true },
  ];

  const faqs = [
    { question: "Why does meat have a higher footprint?", answer: "Livestock require large amounts of land, feed, and water, and cattle emit methane — a potent greenhouse gas. Growing grain to feed animals is far less efficient than humans eating plants directly, which is why beef sits at the top of every diet ranking." },
    { question: "How much can a plant-based diet save?", answer: "A vegan diet is typically about 47% lower than a meat-heavy diet (2.89 vs 7.19 kg CO2e/day). The biggest savings come from cutting beef and lamb; the gap between vegetarian and pescatarian is small." },
    { question: "Does local food matter more than diet?", answer: "No — 'food miles' are usually only 5-10% of a food's footprint. What you eat matters far more than where it came from, which is why this calculator focuses on diet type." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Food Carbon Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Food Carbon Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Dietary Habits</div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="diet" label="Dietary Habit" value={inputs.diet} onChange={set("diet")} options={[
                { value: "meat_heavy", label: "Meat Heavy (>100g/day)" },
                { value: "meat_medium", label: "Medium Meat (50-100g/day)" },
                { value: "meat_low", label: "Low Meat (<50g/day)" },
                { value: "pescatarian", label: "Pescatarian" },
                { value: "vegetarian", label: "Vegetarian" },
                { value: "vegan", label: "Vegan" },
                { value: "average", label: "Average Global Diet" },
              ]} />
              <NumInput id="calories" label="Daily Calories" value={inputs.calories} onChange={set("calories")} min="0" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Daily calories must be zero or greater.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Diet Carbon Footprint</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.annualTons, 2)} <span className="text-2xl">tons CO2e</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.dailyKg, 1)} kg per day · <span className="font-bold text-foreground">{fmt(result.treesNeeded)} trees</span> to offset</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Footprint</span>
                <span className="font-extrabold text-primary">{fmt(result.dailyKg, 1)} kg</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Footprint</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.annualKg, 0)} kg</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vs. Average Diet</span>
                <span className={`font-extrabold ${result.savingsVsAverage >= 0 ? "text-emerald-600" : "text-orange-500"}`}>{result.savingsVsAverage >= 0 ? "−" : "+"}{fmt(Math.abs(result.savingsVsAverage), 0)} kg/yr</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Annual Footprint by Diet Type (tons CO2e)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v, 2) + " tons CO2e", "Annual"]} />
                  <Bar dataKey="value" name="Annual tons CO2e" radius={[4, 4, 0, 0]}>
                    {result.chart.map((c) => (
                      <Cell key={c.name} fill={c.selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">Highlighted bar = your selected diet.</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Diet Type", value: DIET_LABELS[inputs.diet] ?? inputs.diet },
                  { label: "Daily Calories", value: fmt(num(inputs.calories)) + " kcal" },
                  { label: "Daily Footprint", value: fmt(result.dailyKg, 1) + " kg CO2e", bold: true },
                  { label: "Annual Footprint", value: fmt(result.annualTons, 2) + " tons", bold: true },
                  { label: "Trees to Offset", value: fmt(result.treesNeeded) + " trees" },
                  { label: "Savings vs Average", value: (result.savingsVsAverage >= 0 ? "−" : "+") + fmt(Math.abs(result.savingsVsAverage), 0) + " kg/yr" },
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
            <p>With the defaults (average global diet, 2,000 kcal/day), the footprint is <strong>5.50 kg CO2e per day — about 2.01 tons per year</strong>. That equals roughly 101 trees' annual absorption capacity and is the benchmark every other diet is compared against.</p>
            <h2 className="text-2xl font-bold mb-3">From Oxford, Not Guesswork</h2>
            <p>The emission factors come from Scarborough et al. 2014, a University of Oxford study of 55,000+ diets. The gap between a meat-heavy diet (7.19 kg/day) and a vegan diet (2.89 kg/day) is about 60% — the single largest lever most people have on their food footprint.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/food-carbon-footprint-calculator" />
          <PopularCalculators exclude="/calculator/food-carbon-footprint-calculator" />
        </div>
      </div>
    </>
  );
};
export default FoodCarbonFootprintCalculator;
