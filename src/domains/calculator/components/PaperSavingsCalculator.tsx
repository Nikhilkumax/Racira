"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
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

interface Inputs { reams: string; }

interface Result {
  sheets: number;
  trees: number;
  waterGallons: number;
  energyKwh: number;
  co2Lbs: number;
  co2Tons: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { reams: "10" };

function calculate(inputs: Inputs): Result {
  const reams = Math.max(0, parseFloat(inputs.reams) || 0);
  const sheets = reams * 12 * 500;
  const trees = reams * 12 * 0.06;
  const waterGallons = reams * 12 * 105;
  const energyKwh = reams * 12 * 22.5;
  const co2Lbs = reams * 12 * 11;
  const co2Tons = co2Lbs * 0.000453592;
  return {
    sheets,
    trees,
    waterGallons,
    energyKwh,
    co2Lbs,
    co2Tons,
    chart: [
      { name: "Trees", value: Math.round(trees * 10) / 10 },
      { name: "Water (100 gal)", value: Math.round(waterGallons / 100) },
      { name: "Energy (100 kWh)", value: Math.round(energyKwh / 100) },
      { name: "CO₂ (100 lbs)", value: Math.round(co2Lbs / 100) },
    ],
  };
}

const PaperSavingsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.reams) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Reams Saved per Month", value: fmt(num(inputs.reams)) + " reams" },
    { label: "Sheets Saved per Year", value: fmt(result.sheets) + " sheets", highlight: true },
    { label: "Trees Saved", value: fmt(result.trees, 1) + " trees", highlight: true },
    { label: "Water Saved", value: fmt(result.waterGallons) + " gallons" },
    { label: "Energy Saved", value: fmt(result.energyKwh) + " kWh" },
    { label: "CO₂ Saved", value: fmt(result.co2Lbs) + " lbs (" + fmt(result.co2Tons, 2) + " tons)", total: true },
  ];

  const faqs = [
    { question: "How many sheets are in a ream?", answer: "A standard ream of office copy paper is exactly 500 sheets of A4 or Letter size." },
    { question: "How many trees does paper production use?", answer: "Roughly one 40-ft pine tree produces about 8,333 sheets — 16.6 reams. Going paperless for a month of 10 reams saves about 0.6 trees per year per ream-month." },
    { question: "Why does paper production use so much water?", answer: "Turning wood into pulp, bleaching, and pressing sheets is highly water-intensive — roughly 105 gallons per ream (about 3 gallons per sheet) even with modern mill recycling." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Paper Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Paper Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Paper Consumption</div>
            <div>
              <NumInput id="reams" label="Reams Saved per Month" value={inputs.reams} onChange={set("reams")} min="0" suffix="reams" hint="1 ream = 500 sheets of A4/Letter paper." />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Reams must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Sheets Saved per Year</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.sheets)} <span className="text-2xl">sheets</span></div>
              <div className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{fmt(result.trees, 1)} trees</span> · {fmt(result.waterGallons)} gallons water · {fmt(result.energyKwh)} kWh</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trees Saved</span>
                <span className="font-extrabold text-primary">{fmt(result.trees, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Water Saved</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.waterGallons)} gal</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Saved</span>
                <span className="font-extrabold text-foreground">{fmt(result.co2Lbs)} lbs</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Impact Metric</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Annual</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Annual Impact (per 100 units)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), ""]} />
                  <Bar dataKey="value" name="Impact" radius={[4, 4, 0, 0]}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Reams / Month", value: fmt(num(inputs.reams)) },
                  { label: "Sheets / Year", value: fmt(result.sheets), bold: true },
                  { label: "Trees Saved", value: fmt(result.trees, 1), bold: true },
                  { label: "Water Saved", value: fmt(result.waterGallons) + " gal" },
                  { label: "Energy Saved", value: fmt(result.energyKwh) + " kWh" },
                  { label: "CO₂ Saved", value: fmt(result.co2Tons, 2) + " tons", bold: true },
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
            <p>Cutting <strong>10 reams per month</strong> avoids 60,000 sheets a year — the output of about 7.2 trees, 12,600 gallons of water, 2,700 kWh, and 1,320 lbs (0.6 tons) of CO2. Across a typical office, going paperless is one of the fastest zero-cost wins in a sustainability report.</p>
            <h2 className="text-2xl font-bold mb-3">The Per-Ream Numbers</h2>
            <p>Figures come from standard paper-lifecycle averages: ~0.06 trees, 105 gallons of water, 22.5 kWh of energy, and 11 lbs of CO2 per ream. And when paper does end up in a landfill, it decays into methane — far more potent than CO2 — so every sheet avoided pays twice.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/paper-savings-calculator" />
          <PopularCalculators exclude="/calculator/paper-savings-calculator" />
        </div>
      </div>
    </>
  );
};
export default PaperSavingsCalculator;
