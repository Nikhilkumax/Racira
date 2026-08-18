"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, prefix, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; prefix?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 text-sm text-muted-foreground font-medium">{prefix}</span>}
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

const METHODS: Record<string, { ratio: number; desc: string }> = {
  pourover: { ratio: 16, desc: "Clean, balanced cup." },
  frenchpress: { ratio: 15, desc: "More body and oils." },
  aeropress: { ratio: 13, desc: "Concentrated, dilute to taste." },
  espresso: { ratio: 2, desc: "Extremely concentrated." },
  coldbrew: { ratio: 8, desc: "Strong concentrate for long steeping." },
};
const METHOD_LABELS: Record<string, string> = { pourover: "Pour Over", frenchpress: "French Press", aeropress: "AeroPress", espresso: "Espresso", coldbrew: "Cold Brew" };

interface Inputs { mode: "water" | "coffee"; water: string; coffee: string; ratio: string; method: string; }

interface Result {
  coffeeGrams: number;
  waterMl: number;
  ratio: number;
  strength: string;
  coffeeOz: number;
  waterOz: number;
  chart: { name: string; value: number; selected: boolean }[];
}

const DEFAULTS: Inputs = { mode: "water", water: "350", coffee: "22", ratio: "16", method: "pourover" };

function calculate(inputs: Inputs): Result {
  const water = Math.max(0, parseFloat(inputs.water) || 0);
  const coffee = Math.max(0, parseFloat(inputs.coffee) || 0);
  const ratio = Math.max(0.5, parseFloat(inputs.ratio) || 16);
  let coffeeGrams: number;
  let waterMl: number;
  if (inputs.mode === "water") {
    waterMl = water;
    coffeeGrams = water / ratio;
  } else {
    coffeeGrams = coffee;
    waterMl = coffee * ratio;
  }
  let strength = "Balanced";
  if (ratio < 14) strength = "Very Strong / Bold";
  else if (ratio < 16) strength = "Strong / Rich";
  else if (ratio > 18) strength = "Light / Delicate";
  else if (ratio > 16) strength = "Standard / Balanced";
  const chart = Object.entries(METHODS).map(([key, m]) => ({
    name: METHOD_LABELS[key],
    value: m.ratio,
    selected: key === inputs.method,
  }));
  return { coffeeGrams, waterMl, ratio, strength, coffeeOz: coffeeGrams * 0.035274, waterOz: waterMl * 0.033814, chart };
}

const CoffeeBrewingCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = (inputs.mode === "water" ? num(inputs.water) : num(inputs.coffee)) <= 0 || num(inputs.ratio) <= 0;

  const handleMethodChange = (m: string) => setInputs(prev => ({ ...prev, method: m, ratio: METHODS[m].ratio.toString() }));
  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Brewing Method", value: METHOD_LABELS[inputs.method] ?? inputs.method },
    { label: "Brew Ratio", value: "1:" + fmt(result.ratio) },
    { label: inputs.mode === "water" ? "Water Used" : "Coffee Used", value: inputs.mode === "water" ? fmt(result.waterMl, 0) + " ml" : fmt(result.coffeeGrams, 1) + " g" },
    { label: "Coffee Needed", value: fmt(result.coffeeGrams, 1) + " g (" + fmt(result.coffeeOz, 2) + " oz)", highlight: true },
    { label: "Water Needed", value: fmt(result.waterMl, 0) + " ml (" + fmt(result.waterOz, 1) + " fl oz)", highlight: true },
    { label: "Estimated Strength", value: result.strength },
    { label: "Cups (250 ml)", value: fmt(result.waterMl / 250, 1), total: true },
  ];

  const faqs = [
    { question: "What is the 'Golden Ratio' for coffee?", answer: "Generally 1:15 to 1:18 — one gram of coffee per 15-18 grams of water. 1:16 is the popular starting point for pour-over and most manual methods." },
    { question: "Should I weigh my coffee or use spoons?", answer: "Weigh in grams. Volume is unreliable — a dark roast is lighter and fluffier than a dense light roast, so a tablespoon of one can weigh nearly double the other." },
    { question: "How much coffee do I need for a 12 oz cup?", answer: "A 12 oz cup is about 355 ml. At 1:16 that's roughly 22 grams of coffee." },
    { question: "Does water temperature matter?", answer: "Yes — aim for 195-205°F (90.5-96°C). Boiling water burns the grounds; cooler water under-extracts." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Everyday Life", href: "/calculator#everyday-life" }, { label: "Coffee Brewing Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Coffee Brewing Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Method & Ratio</div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="method" label="Brewing Method" value={inputs.method} onChange={handleMethodChange} options={[
                { value: "pourover", label: "Pour Over" },
                { value: "frenchpress", label: "French Press" },
                { value: "aeropress", label: "AeroPress" },
                { value: "espresso", label: "Espresso" },
                { value: "coldbrew", label: "Cold Brew" },
              ]} />
              <NumInput id="ratio" label="Ratio (1:X)" value={inputs.ratio} onChange={set("ratio")} min="0.5" prefix="1:" />
            </div>
            <p className="text-[11px] text-muted-foreground -mt-1">{METHODS[inputs.method]?.desc}</p>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Calculate Based On</div>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setInputs(prev => ({ ...prev, mode: "water" }))} className={`h-10 rounded-md text-sm font-semibold transition-colors border ${inputs.mode === "water" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-secondary"}`}>Water Amount</button>
              <button type="button" onClick={() => setInputs(prev => ({ ...prev, mode: "coffee" }))} className={`h-10 rounded-md text-sm font-semibold transition-colors border ${inputs.mode === "coffee" ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:bg-secondary"}`}>Coffee Amount</button>
            </div>
            {inputs.mode === "water" ? (
              <NumInput id="water" label="Total Water" value={inputs.water} onChange={set("water")} min="0" suffix="ml" />
            ) : (
              <NumInput id="coffee" label="Total Coffee" value={inputs.coffee} onChange={set("coffee")} min="0" suffix="g" />
            )}
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Amount and ratio must be greater than zero.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Your Recipe (1:{fmt(result.ratio)})</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.coffeeGrams, 1)} g <span className="text-2xl text-muted-foreground">+</span> {fmt(result.waterMl, 0)} ml</div>
              <div className="text-sm text-muted-foreground font-medium">Strength: <span className="font-bold text-foreground">{result.strength}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Coffee</span>
                <span className="font-extrabold text-primary">{fmt(result.coffeeGrams, 1)} g</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Water</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.waterMl, 0)} ml</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cups (250 ml)</span>
                <span className="font-extrabold text-foreground">{fmt(result.waterMl / 250, 1)}</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Standard Ratios by Method (1:X)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11 }} label={{ value: "Water per 1 g coffee", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip formatter={(v: number) => ["1:" + fmt(v), "Ratio"]} />
                  <Bar dataKey="value" name="Ratio" radius={[4, 4, 0, 0]}>
                    {result.chart.map((c) => (
                      <Cell key={c.name} fill={c.selected ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[11px] text-muted-foreground mt-2">Highlighted bar = your method.</p>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Method", value: METHOD_LABELS[inputs.method] ?? inputs.method },
                  { label: "Ratio", value: "1:" + fmt(result.ratio) },
                  { label: "Coffee", value: fmt(result.coffeeGrams, 1) + " g", bold: true },
                  { label: "Water", value: fmt(result.waterMl, 0) + " ml", bold: true },
                  { label: "Strength", value: result.strength },
                  { label: "Cups (250 ml)", value: fmt(result.waterMl / 250, 1) },
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
            <p>For a <strong>350 ml pour-over at 1:16</strong>, you need about <strong>21.9 g of coffee</strong> — roughly 1.4 cups (250 ml) of finished brew. Ratios below 1:14 turn bold and intense; above 1:18 the cup turns light and tea-like.</p>
            <h2 className="text-2xl font-bold mb-3">The Ratio by Method</h2>
            <p>Pour-over runs 1:15-1:17 for clarity; French press tightens to 1:14-1:15 for body; AeroPress concentrates at 1:11-1:13 (dilute after); espresso compresses to 1:1.5-1:2.5; cold brew concentrates at 1:8 for long steeping. If your cup is bitter, go coarser or use more water — sour means finer or less water.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/coffee-brewing-calculator" />
          <PopularCalculators exclude="/calculator/coffee-brewing-calculator" />
        </div>
      </div>
    </>
  );
};
export default CoffeeBrewingCalculator;
