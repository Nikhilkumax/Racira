"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
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

// Veterinary-standard factors (WSAVA / FEDIAF)
const LIFESTAGE_MULT: Record<string, number> = { kitten: 2.5, adult: 1.2, senior: 1.1, obese_prone: 1.0, lactating: 2.0 };

interface Inputs { weight: string; unit: string; lifestage: string; neutered: string; }

interface Result {
  rer: number;
  mer: number;
  multiplier: number;
  treatKcal: number;
  mealKcal: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { weight: "4", unit: "kg", lifestage: "adult", neutered: "yes" };

function calculate(inputs: Inputs): Result | null {
  let wKg = Math.max(0, parseFloat(inputs.weight) || 0);
  if (inputs.unit === "lbs") wKg /= 2.20462;
  if (wKg <= 0) return null;
  const rer = 70 * Math.pow(wKg, 0.75);
  let multiplier = LIFESTAGE_MULT[inputs.lifestage] ?? 1.2;
  if (inputs.lifestage === "adult" && inputs.neutered === "no") multiplier = 1.4;
  const mer = rer * multiplier;
  return {
    rer,
    mer,
    multiplier,
    treatKcal: mer * 0.1,
    mealKcal: mer * 0.9,
    chart: [
      { name: "RER", value: Math.round(rer) },
      { name: "MER", value: Math.round(mer) },
    ],
  };
}

const CatCalorieCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.weight) <= 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Body Weight", value: inputs.unit === "kg" ? fmt(num(inputs.weight), 1) + " kg" : fmt(num(inputs.weight), 1) + " lbs" },
    { label: "Life Stage", value: inputs.lifestage === "kitten" ? "Kitten" : inputs.lifestage === "senior" ? "Senior" : inputs.lifestage === "obese_prone" ? "Obesity-Prone" : inputs.lifestage === "lactating" ? "Lactating" : inputs.neutered === "yes" ? "Adult (Neutered)" : "Adult (Intact)" },
    { label: "Life Stage Multiplier", value: fmt(r.multiplier, 1) + "× RER" },
    { label: "Resting Energy (RER)", value: fmt(r.rer) + " kcal/day", highlight: true },
    { label: "Daily Target (MER)", value: fmt(r.mer) + " kcal/day", highlight: true },
    { label: "Treat Allowance (10%)", value: fmt(r.treatKcal) + " kcal" },
    { label: "Main Meals (90%)", value: fmt(r.mealKcal) + " kcal", total: true },
  ] : [];

  const faqs = [
    { question: "How many calories does a cat need per day?", answer: "An average 4 kg (8.8 lb) neutered adult cat needs about 200-250 kcal/day. Kittens and lactating queens need up to 2.5× the resting energy requirement (RER)." },
    { question: "Why is my cat always hungry?", answer: "Cats are obligate carnivores that naturally graze. Split the daily allowance across 3-4 small meals rather than 1-2 large ones, and make sure the food is high in animal protein." },
    { question: "How do I convert food labels to calories?", answer: "Find kcal/kg or kcal/can on the label. Divide by grams per serving for kcal per gram, then multiply by the grams you feed. This calculator gives the total budget; split it between food and treats (≤10%)." },
    { question: "Does spaying or neutering reduce caloric needs?", answer: "Yes — neutered cats have lower metabolic rates and roam less, so needs drop roughly 20-30% versus intact adults. That's why this calculator uses 1.2× for neutered and 1.4× for intact adults." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Cat Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cat Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Cat Profile</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="weight" label="Body Weight" value={inputs.weight} onChange={set("weight")} min="0" />
              <SelectInput id="unit" label="Weight Unit" value={inputs.unit} onChange={set("unit")} options={[{ value: "kg", label: "Kilograms (kg)" }, { value: "lbs", label: "Pounds (lbs)" }]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="lifestage" label="Life Stage" value={inputs.lifestage} onChange={set("lifestage")} options={[
                { value: "kitten", label: "Kitten (0-1 yr)" },
                { value: "adult", label: "Adult (1-7 yr)" },
                { value: "senior", label: "Senior (7+ yr)" },
                { value: "obese_prone", label: "Obesity-Prone" },
                { value: "lactating", label: "Lactating" },
              ]} />
              <SelectInput id="neutered" label="Neutered / Spayed?" value={inputs.neutered} onChange={set("neutered")} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No (Intact)" }]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Weight must be greater than zero.</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Daily Calorie Target (MER)</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.mer)} <span className="text-2xl">kcal</span></div>
                  <div className="text-sm text-muted-foreground font-medium">≈ {fmt(r.mer * 0.9 / 4, 0)} kcal per meal × 4 · <span className="font-bold text-foreground">{fmt(r.multiplier, 1)}×</span> RER</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Resting Energy</span>
                    <span className="font-extrabold text-primary">{fmt(r.rer)} kcal</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Treats (10%)</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.treatKcal)} kcal</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Meals (90%)</span>
                    <span className="font-extrabold text-foreground">{fmt(r.mealKcal)} kcal</span>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">RER vs MER (kcal/day)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v) + " kcal", ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" name="kcal/day" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Weight", value: inputs.unit === "kg" ? fmt(num(inputs.weight), 1) + " kg" : fmt(num(inputs.weight), 1) + " lbs" },
                      { label: "Multiplier", value: fmt(r.multiplier, 1) + "×" },
                      { label: "RER", value: fmt(r.rer) + " kcal", bold: true },
                      { label: "MER", value: fmt(r.mer) + " kcal", bold: true },
                      { label: "Treats (10%)", value: fmt(r.treatKcal) + " kcal" },
                      { label: "Meals (90%)", value: fmt(r.mealKcal) + " kcal" },
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
            <p>For a <strong>4 kg neutered adult</strong>, RER = 70 × 4^0.75 ≈ <strong>198 kcal</strong> and MER = 198 × 1.2 ≈ <strong>238 kcal/day</strong>. About 21 kcal can go to treats; the rest — roughly 214 kcal — should come from meals, split across the day.</p>
            <h2 className="text-2xl font-bold mb-3">The Formulas</h2>
            <p>Veterinary nutritionists use RER = 70 × (weight in kg)^0.75, then scale by life stage: kittens 2.5×, intact adults 1.4×, neutered adults 1.2×, seniors 1.1×, obesity-prone 1.0×, lactating queens 2.0×. Indoor cats typically need about 10% less than outdoor cats.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cat-calorie-calculator" />
          <PopularCalculators exclude="/calculator/cat-calorie-calculator" />
        </div>
      </div>
    </>
  );
};
export default CatCalorieCalculator;
