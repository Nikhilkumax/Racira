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

const GROWTH_WEEKS: Record<string, number> = { toy: 30, small: 36, medium: 40, large: 52, giant: 60 };
const ADULT_RANGES: Record<string, [number, number]> = { toy: [1, 5], small: [5, 10], medium: [10, 25], large: [25, 45], giant: [45, 90] };
const BREED_LABELS: Record<string, string> = { toy: "Toy", small: "Small", medium: "Medium", large: "Large", giant: "Giant" };

interface Inputs { weight: string; weightUnit: string; age: string; ageUnit: string; breed: string; }

interface Result {
  predictedKg: number;
  predictedLbs: number;
  low: number;
  high: number;
  pctGrown: number;
  weeksToAdult: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { weight: "5", weightUnit: "kg", age: "12", ageUnit: "weeks", breed: "medium" };

function calculate(inputs: Inputs): Result | null {
  let weightKg = Math.max(0, parseFloat(inputs.weight) || 0);
  if (inputs.weightUnit === "lbs") weightKg /= 2.20462;
  let ageWeeks = Math.max(0, parseFloat(inputs.age) || 0);
  if (inputs.ageUnit === "months") ageWeeks *= 4.33;
  if (weightKg <= 0 || ageWeeks <= 0) return null;
  const maxWeeks = GROWTH_WEEKS[inputs.breed] ?? 40;
  const growthFraction = ageWeeks / maxWeeks;
  const predictedKg = weightKg / growthFraction;
  const [minW, maxW] = ADULT_RANGES[inputs.breed] ?? [10, 25];
  const low = Math.max(minW, predictedKg * 0.9);
  const high = Math.min(maxW, predictedKg * 1.1);
  const pctGrown = Math.min(100, growthFraction * 100);
  const weeksToAdult = Math.max(0, maxWeeks - ageWeeks);
  return {
    predictedKg,
    predictedLbs: predictedKg * 2.20462,
    low,
    high,
    pctGrown,
    weeksToAdult,
    chart: [
      { name: "Current", value: Math.round(weightKg * 10) / 10 },
      { name: "Predicted Adult", value: Math.round(predictedKg * 10) / 10 },
    ],
  };
}

const DogSizePredictor = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.weight) <= 0 || num(inputs.age) <= 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Current Weight", value: inputs.weightUnit === "kg" ? fmt(num(inputs.weight), 1) + " kg" : fmt(num(inputs.weight), 1) + " lbs" },
    { label: "Current Age", value: inputs.ageUnit === "weeks" ? fmt(num(inputs.age)) + " weeks" : fmt(num(inputs.age), 1) + " months" },
    { label: "Breed Size", value: BREED_LABELS[inputs.breed] ?? inputs.breed },
    { label: "Growth Completed", value: fmt(r.pctGrown, 0) + "%", highlight: true },
    { label: "Predicted Adult Weight", value: fmt(r.predictedKg, 1) + " kg (" + fmt(r.predictedLbs, 1) + " lbs)", highlight: true },
    { label: "Likely Range", value: fmt(r.low, 1) + " – " + fmt(r.high, 1) + " kg" },
    { label: "Weeks to Full Growth", value: fmt(Math.round(r.weeksToAdult)) + " weeks", total: true },
  ] : [];

  const faqs = [
    { question: "How accurate are puppy size predictions?", answer: "Most accurate between 16-20 weeks, after the catch-up growth phase. Mixed breeds are harder to predict — a DNA test improves accuracy substantially." },
    { question: "When do dogs stop growing?", answer: "Toy/small breeds finish around 6-10 months, medium breeds by 12 months, large breeds reach height by 12-14 months but fill out past 18, and giant breeds can grow until age 2." },
    { question: "Is there a simpler rule of thumb?", answer: "For medium dogs, double the weight at 14 weeks; for small breeds, double it at 8 weeks. Rough estimates — this calculator uses the growth-fraction method for more precision." },
    { question: "Does paw size predict adult size?", answer: "Large paws relative to the body hint at a bigger adult, but it's unreliable — especially in short-legged breeds like Basset Hounds." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Dog Size Predictor" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Dog Size Predictor</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Puppy Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="weight" label="Current Weight" value={inputs.weight} onChange={set("weight")} min="0" />
              <SelectInput id="weightUnit" label="Weight Unit" value={inputs.weightUnit} onChange={set("weightUnit")} options={[{ value: "kg", label: "kg" }, { value: "lbs", label: "lbs" }]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="age" label="Current Age" value={inputs.age} onChange={set("age")} min="0" />
              <SelectInput id="ageUnit" label="Age Unit" value={inputs.ageUnit} onChange={set("ageUnit")} options={[{ value: "weeks", label: "Weeks" }, { value: "months", label: "Months" }]} />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Breed Size</div>
            <div>
              <SelectInput id="breed" label="Breed Size Category" value={inputs.breed} onChange={set("breed")} options={[
                { value: "toy", label: "Toy (under 5 kg adult)" },
                { value: "small", label: "Small (5-10 kg adult)" },
                { value: "medium", label: "Medium (10-25 kg adult)" },
                { value: "large", label: "Large (25-45 kg adult)" },
                { value: "giant", label: "Giant (over 45 kg adult)" },
              ]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Weight and age must be greater than zero.</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Predicted Adult Weight</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.predictedKg, 1)} <span className="text-2xl">kg</span></div>
                  <div className="text-sm text-muted-foreground font-medium">{fmt(r.predictedLbs, 1)} lbs · likely range <span className="font-bold text-foreground">{fmt(r.low, 1)}-{fmt(r.high, 1)} kg</span></div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Growth Completed</span>
                    <span className="font-extrabold text-primary">{fmt(r.pctGrown, 0)}%</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weeks to Adult</span>
                    <span className="font-extrabold text-emerald-600">{fmt(Math.round(r.weeksToAdult))} wks</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Breed Size</span>
                    <span className="font-extrabold text-foreground">{BREED_LABELS[inputs.breed] ?? inputs.breed}</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right w-[170px]">Value</th>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Current vs Predicted Adult Weight (kg)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v, 1) + " kg", ""]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" name="Weight (kg)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Current Weight", value: fmt(num(inputs.weight), 1) + (inputs.weightUnit === "kg" ? " kg" : " lbs") },
                      { label: "Breed Size", value: BREED_LABELS[inputs.breed] ?? inputs.breed },
                      { label: "Predicted Adult", value: fmt(r.predictedKg, 1) + " kg", bold: true },
                      { label: "Likely Range", value: fmt(r.low, 1) + "-" + fmt(r.high, 1) + " kg", bold: true },
                      { label: "Growth Completed", value: fmt(r.pctGrown, 0) + "%" },
                      { label: "Weeks to Adult", value: fmt(Math.round(r.weeksToAdult)) },
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
            <p>A <strong>5 kg puppy at 12 weeks (medium breed)</strong> is about 30% grown, predicting <strong>16.7 kg adult</strong> — within the medium 10-25 kg band, so the likely range tightens to 15.0-18.3 kg. About 28 weeks of growth remain.</p>
            <h2 className="text-2xl font-bold mb-3">The Growth-Fraction Method</h2>
            <p>Adult estimate = current weight ÷ (age ÷ breed's total growth weeks). Toy breeds finish in ~30 weeks, small 36, medium 40, large 52, giant 60. Don't overfeed large/giant puppies — rapid growth risks hip dysplasia and OCD; use size-appropriate large-breed puppy food.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/dog-size-predictor" />
          <PopularCalculators exclude="/calculator/dog-size-predictor" />
        </div>
      </div>
    </>
  );
};
export default DogSizePredictor;
