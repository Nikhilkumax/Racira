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

interface Inputs { bottles: string; bags: string; wrappers: string; takeout: string; straws: string; }

interface Result {
  weeklyGrams: number;
  annualKg: number;
  dailyGrams: number;
  lifetimeKg: number;
  bottlesPerYear: number;
  bagsPerYear: number;
  impact: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { bottles: "5", bags: "3", wrappers: "10", takeout: "2", straws: "0" };

const ITEM_WEIGHTS: Record<string, number> = { bottles: 25, bags: 5, wrappers: 8, takeout: 30, straws: 0.5 };
const ITEM_LABELS: Record<string, string> = { bottles: "Bottles", bags: "Bags", wrappers: "Wrappers", takeout: "Containers", straws: "Straws" };

function calculate(inputs: Inputs): Result {
  const qty: Record<string, number> = {
    bottles: Math.max(0, parseFloat(inputs.bottles) || 0),
    bags: Math.max(0, parseFloat(inputs.bags) || 0),
    wrappers: Math.max(0, parseFloat(inputs.wrappers) || 0),
    takeout: Math.max(0, parseFloat(inputs.takeout) || 0),
    straws: Math.max(0, parseFloat(inputs.straws) || 0),
  };
  const weeklyGrams = Object.entries(qty).reduce((sum, [k, v]) => sum + v * ITEM_WEIGHTS[k], 0);
  const annualKg = (weeklyGrams * 52) / 1000;
  const dailyGrams = (annualKg * 1000) / 365;
  const lifetimeKg = annualKg * 60;
  const bottlesPerYear = qty.bottles * 52;
  const bagsPerYear = qty.bags * 52;
  const impact = annualKg < 5 ? "Low" : annualKg < 15 ? "Average" : "High";
  return {
    weeklyGrams,
    annualKg,
    dailyGrams,
    lifetimeKg,
    bottlesPerYear,
    bagsPerYear,
    impact,
    chart: Object.entries(qty).map(([k, v]) => ({ name: ITEM_LABELS[k], value: Math.round(v * ITEM_WEIGHTS[k]) })),
  };
}

const PlasticFootprintCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.bottles) < 0 || num(inputs.bags) < 0 || num(inputs.wrappers) < 0 || num(inputs.takeout) < 0 || num(inputs.straws) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Plastic Bottles (weekly)", value: fmt(num(inputs.bottles)) + " → " + fmt(num(inputs.bottles) * ITEM_WEIGHTS.bottles) + " g" },
    { label: "Shopping Bags (weekly)", value: fmt(num(inputs.bags)) + " → " + fmt(num(inputs.bags) * ITEM_WEIGHTS.bags) + " g" },
    { label: "Food Wrappers (weekly)", value: fmt(num(inputs.wrappers)) + " → " + fmt(num(inputs.wrappers) * ITEM_WEIGHTS.wrappers) + " g" },
    { label: "Takeout Containers (weekly)", value: fmt(num(inputs.takeout)) + " → " + fmt(num(inputs.takeout) * ITEM_WEIGHTS.takeout) + " g" },
    { label: "Annual Plastic Waste", value: fmt(result.annualKg, 1) + " kg", highlight: true },
    { label: "Daily Average", value: fmt(result.dailyGrams, 1) + " g/day" },
    { label: "60-Year Accumulation", value: fmt(result.lifetimeKg, 0) + " kg", total: true },
  ];

  const faqs = [
    { question: "How much plastic is produced globally?", answer: "Over 400 million tonnes of plastic are produced every year, roughly half of it designed for single use. Only about 9% of all plastic ever made has been recycled." },
    { question: "What happens to most plastic waste?", answer: "Most ends up in landfills, is incinerated, or leaks into the environment where it persists for centuries — breaking into microplastics found in oceans, air, and even human blood." },
    { question: "How can I reduce my plastic footprint?", answer: "Refuse single-use items first, then reduce and reuse: carry a reusable bottle and bags, avoid excess packaging, and choose glass or metal containers. Recycling is the last resort, not the solution." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Plastic Footprint Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Plastic Footprint Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Weekly Consumption</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bottles" label="Plastic Bottles" value={inputs.bottles} onChange={set("bottles")} min="0" suffix="qty" />
              <NumInput id="bags" label="Shopping Bags" value={inputs.bags} onChange={set("bags")} min="0" suffix="qty" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="wrappers" label="Food Wrappers" value={inputs.wrappers} onChange={set("wrappers")} min="0" suffix="qty" />
              <NumInput id="takeout" label="Takeout Containers" value={inputs.takeout} onChange={set("takeout")} min="0" suffix="qty" />
            </div>
            <div>
              <NumInput id="straws" label="Plastic Straws" value={inputs.straws} onChange={set("straws")} min="0" suffix="qty" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Plastic Waste</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.annualKg, 1)} <span className="text-2xl">kg</span></div>
              <div className="text-sm text-muted-foreground font-medium">Impact rating: <span className="font-bold text-foreground">{result.impact}</span> · {fmt(result.dailyGrams, 1)} g per day</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weekly Weight</span>
                <span className="font-extrabold text-primary">{fmt(result.weeklyGrams)} g</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bottles / Year</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.bottlesPerYear)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bags / Year</span>
                <span className="font-extrabold text-foreground">{fmt(result.bagsPerYear)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Item</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Weekly Plastic by Item (grams)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart.filter((c) => c.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value)}g`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="hsl(var(--muted-foreground) / 0.5)" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v) + " g/week", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Weekly Weight", value: fmt(result.weeklyGrams) + " g" },
                  { label: "Annual Waste", value: fmt(result.annualKg, 1) + " kg", bold: true },
                  { label: "Daily Average", value: fmt(result.dailyGrams, 1) + " g" },
                  { label: "60-Year Total", value: fmt(result.lifetimeKg, 0) + " kg", bold: true },
                  { label: "Bottles / Year", value: fmt(result.bottlesPerYear) },
                  { label: "Bags / Year", value: fmt(result.bagsPerYear) },
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
            <p>With the defaults (5 bottles, 3 bags, 10 wrappers, 2 containers weekly), the pile weighs <strong>280 g/week — 14.6 kg per year</strong> (Average). At that pace, 60 years of habits adds up to about 874 kg of plastic, mostly from bottles (1.3 kg/week) and wrappers (0.8 kg/week).</p>
            <h2 className="text-2xl font-bold mb-3">Weight Assumptions</h2>
            <p>Per-item weights are averages: a PET bottle ~25 g, shopping bag ~5 g, food wrapper ~8 g, takeout container ~30 g, straw ~0.5 g. Only about 9% of plastic is ever recycled — the rest persists for centuries as it breaks into microplastics.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/plastic-footprint-calculator" />
          <PopularCalculators exclude="/calculator/plastic-footprint-calculator" />
        </div>
      </div>
    </>
  );
};
export default PlasticFootprintCalculator;
