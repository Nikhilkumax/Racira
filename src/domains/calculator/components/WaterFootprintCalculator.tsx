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

// Indirect daily water footprint by diet (gallons/person-day) — Water Footprint Network
const DIET_WATER: Record<string, number> = { vegan: 600, vegetarian: 800, low_meat: 1000, medium: 1200, heavy_meat: 1600 };
const DIET_LABELS: Record<string, string> = { vegan: "Vegan", vegetarian: "Vegetarian", low_meat: "Low Meat", medium: "Average Meat", heavy_meat: "Heavy Meat" };

interface Inputs { showerMin: string; flushes: string; dishLoads: string; laundryLoads: string; diet: string; }

interface Result {
  showerGal: number;
  toiletGal: number;
  dishGal: number;
  laundryGal: number;
  directGal: number;
  dietGal: number;
  totalDaily: number;
  annualTotal: number;
  directPct: number;
  dietPct: number;
  score: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { showerMin: "10", flushes: "5", dishLoads: "1", laundryLoads: "0.3", diet: "medium" };

function calculate(inputs: Inputs): Result {
  const showerMin = Math.max(0, parseFloat(inputs.showerMin) || 0);
  const flushes = Math.max(0, parseFloat(inputs.flushes) || 0);
  const dishLoads = Math.max(0, parseFloat(inputs.dishLoads) || 0);
  const laundryLoads = Math.max(0, parseFloat(inputs.laundryLoads) || 0);
  const showerGal = showerMin * 2.1;
  const toiletGal = flushes * 1.6;
  const dishGal = dishLoads * 10;
  const laundryGal = laundryLoads * 25;
  const directGal = showerGal + toiletGal + dishGal + laundryGal;
  const dietGal = DIET_WATER[inputs.diet] ?? 1200;
  const totalDaily = directGal + dietGal;
  const annualTotal = totalDaily * 365;
  const directPct = (directGal / totalDaily) * 100;
  const dietPct = (dietGal / totalDaily) * 100;
  const score = totalDaily < 800 ? "Excellent" : totalDaily < 1500 ? "Average" : "High";
  return {
    showerGal,
    toiletGal,
    dishGal,
    laundryGal,
    directGal,
    dietGal,
    totalDaily,
    annualTotal,
    directPct,
    dietPct,
    score,
    chart: [
      { name: "Direct (Indoor)", value: Math.round(directGal) },
      { name: "Indirect (Food)", value: Math.round(dietGal) },
    ],
  };
}

const WaterFootprintCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.showerMin) < 0 || num(inputs.flushes) < 0 || num(inputs.dishLoads) < 0 || num(inputs.laundryLoads) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Shower Time", value: fmt(num(inputs.showerMin), 1) + " min → " + fmt(result.showerGal, 1) + " gal" },
    { label: "Toilet Flushes", value: fmt(num(inputs.flushes)) + " → " + fmt(result.toiletGal, 1) + " gal" },
    { label: "Dishwasher Loads", value: fmt(num(inputs.dishLoads), 1) + " → " + fmt(result.dishGal, 1) + " gal" },
    { label: "Laundry Loads", value: fmt(num(inputs.laundryLoads), 2) + " → " + fmt(result.laundryGal, 1) + " gal" },
    { label: "Diet Water (indirect)", value: fmt(result.dietGal) + " gal/day", highlight: true },
    { label: "Total Daily Footprint", value: fmt(result.totalDaily) + " gal", highlight: true },
    { label: "Annual Footprint", value: fmt(result.annualTotal) + " gal", total: true },
  ];

  const faqs = [
    { question: "What is a water footprint?", answer: "It measures total water use — direct (what flows from your taps) plus indirect (the water embedded in your food, clothing, and goods). Most of your footprint is indirect: typically over 90%." },
    { question: "Why is meat so water-intensive?", answer: "The bulk of meat's water footprint is the water used to grow animal feed — roughly 1,800 gallons to produce a pound of beef versus a few hundred for grains and vegetables." },
    { question: "How can I reduce my water footprint?", answer: "Shorter showers and low-flow fixtures cut direct use; eating less beef and wasting less food are the biggest levers on the indirect side." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Water Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Direct Usage (Daily)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="showerMin" label="Shower Time" value={inputs.showerMin} onChange={set("showerMin")} min="0" suffix="min" />
              <NumInput id="flushes" label="Toilet Flushes" value={inputs.flushes} onChange={set("flushes")} min="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="dishLoads" label="Dishwasher Loads" value={inputs.dishLoads} onChange={set("dishLoads")} min="0" />
              <NumInput id="laundryLoads" label="Laundry Loads" value={inputs.laundryLoads} onChange={set("laundryLoads")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Dietary Impact (Indirect)</div>
            <div>
              <SelectInput id="diet" label="Typical Diet" value={inputs.diet} onChange={set("diet")} options={[
                { value: "vegan", label: "Vegan (Lowest)" },
                { value: "vegetarian", label: "Vegetarian" },
                { value: "low_meat", label: "Low Meat (<50g/day)" },
                { value: "medium", label: "Average Meat Intake" },
                { value: "heavy_meat", label: "Heavy Meat (>100g/day)" },
              ]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">All values must be zero or greater.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Daily Water Footprint</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalDaily)} <span className="text-2xl">gal</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.annualTotal)} gal per year · score: <span className="font-bold text-foreground">{result.score}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Direct (Indoor)</span>
                <span className="font-extrabold text-primary">{fmt(result.directGal)} gal</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{fmt(result.directPct, 0)}% of total</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Indirect (Food)</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.dietGal)} gal</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{fmt(result.dietPct, 0)}% of total</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Score</span>
                <span className="font-extrabold text-foreground">{result.score}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Source</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Direct vs Indirect Water (gallons/day)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value)} gal`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v) + " gal/day", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Shower", value: fmt(result.showerGal, 1) + " gal" },
                  { label: "Toilet + Laundry", value: fmt(result.toiletGal + result.laundryGal, 1) + " gal" },
                  { label: "Direct Total", value: fmt(result.directGal) + " gal", bold: true },
                  { label: "Diet (Indirect)", value: fmt(result.dietGal) + " gal", bold: true },
                  { label: "Total Daily", value: fmt(result.totalDaily) + " gal", bold: true },
                  { label: "Annual Footprint", value: fmt(result.annualTotal) + " gal" },
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
            <p>With the defaults (10-min shower, 5 flushes, 1 dish load, 0.3 laundry loads, average diet), direct use is <strong>46.5 gal/day</strong> and food adds 1,200 — a 1,247 gal/day total, about 455,000 gallons per year. Food is 96% of the footprint, which is typical for an average American diet.</p>
            <h2 className="text-2xl font-bold mb-3">Direct Use Is the Tip of the Iceberg</h2>
            <p>Household taps account for under 5% of the typical person's water footprint. The other 95% is embedded in food, clothing, and products. Diet factors come from the Water Footprint Network: a heavy-meat diet (1,600 gal/day) is nearly triple a vegan one (600 gal/day).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-footprint-calculator" />
          <PopularCalculators exclude="/calculator/water-footprint-calculator" />
        </div>
      </div>
    </>
  );
};
export default WaterFootprintCalculator;
