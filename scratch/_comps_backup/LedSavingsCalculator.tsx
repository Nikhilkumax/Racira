"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, step, prefix, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; step?: string; prefix?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 text-sm text-muted-foreground font-medium">{prefix}</span>}
      <input id={id} type="number" min={min} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { bulbs: string; oldWattage: string; newWattage: string; hoursPerDay: string; costPerKwh: string; costPerLed: string; }

interface Result {
  totalUpfront: number;
  oldAnnualKwh: number;
  newAnnualKwh: number;
  savingsKwh: number;
  oldCost: number;
  newCost: number;
  savingsDollars: number;
  paybackMonths: number;
  ledLifetimeYears: number;
  lifecycleSavings: number;
  co2Lbs: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { bulbs: "10", oldWattage: "60", newWattage: "9", hoursPerDay: "5", costPerKwh: "0.15", costPerLed: "3" };

function calculate(inputs: Inputs): Result | null {
  const bulbs = Math.max(0, parseFloat(inputs.bulbs) || 0);
  const w1 = Math.max(0, parseFloat(inputs.oldWattage) || 0);
  const w2 = Math.max(0, parseFloat(inputs.newWattage) || 0);
  const hpd = Math.max(0, parseFloat(inputs.hoursPerDay) || 0);
  const cpk = Math.max(0, parseFloat(inputs.costPerKwh) || 0);
  const cost = Math.max(0, parseFloat(inputs.costPerLed) || 0);
  const totalUpfront = bulbs * cost;
  const oldAnnualKwh = (w1 * bulbs * hpd * 365) / 1000;
  const newAnnualKwh = (w2 * bulbs * hpd * 365) / 1000;
  const savingsKwh = oldAnnualKwh - newAnnualKwh;
  const oldCost = oldAnnualKwh * cpk;
  const newCost = newAnnualKwh * cpk;
  const savingsDollars = savingsKwh * cpk;
  const paybackMonths = savingsDollars > 0 ? (totalUpfront / savingsDollars) * 12 : Infinity;
  const ledLifetimeYears = hpd > 0 ? 25000 / (hpd * 365) : 0;
  const lifecycleSavings = savingsDollars * ledLifetimeYears - totalUpfront;
  const co2Lbs = savingsKwh * 0.85;
  return {
    totalUpfront,
    oldAnnualKwh,
    newAnnualKwh,
    savingsKwh,
    oldCost,
    newCost,
    savingsDollars,
    paybackMonths,
    ledLifetimeYears,
    lifecycleSavings,
    co2Lbs,
    chart: [
      { name: "Old Bulbs", value: Math.round(oldCost * 100) / 100 },
      { name: "LED Bulbs", value: Math.round(newCost * 100) / 100 },
    ],
  };
}

const LedSavingsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.bulbs) < 0 || num(inputs.oldWattage) < 0 || num(inputs.newWattage) < 0 || num(inputs.hoursPerDay) < 0 || num(inputs.costPerKwh) < 0 || num(inputs.costPerLed) < 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const paybackText = r ? (r.paybackMonths === Infinity ? "—" : fmt(r.paybackMonths, 1) + " mo") : "—";
  const rows = r ? [
    { label: "Bulbs Replaced", value: fmt(num(inputs.bulbs)) },
    { label: "Old Bulb Wattage", value: fmt(num(inputs.oldWattage)) + " W" },
    { label: "LED Wattage", value: fmt(num(inputs.newWattage)) + " W" },
    { label: "Upfront LED Cost", value: "$" + fmt(r.totalUpfront, 2) },
    { label: "Old Annual Cost", value: "$" + fmt(r.oldCost, 2), highlight: true },
    { label: "New Annual Cost", value: "$" + fmt(r.newCost, 2), highlight: true },
    { label: "Payback Period", value: paybackText, total: true },
  ] : [];

  const faqs = [
    { question: "How long do LED bulbs last?", answer: "A typical LED is rated for 15,000-25,000 hours. At 5 hours per day, that's 8-13 years before replacement — far beyond the ~1,000 hours of an incandescent or ~8,000 of a CFL." },
    { question: "Why are LEDs more efficient?", answer: "Incandescents heat a filament until it glows, wasting about 90% of energy as heat. LEDs produce light by electroluminescence with almost no heat, making them up to 85% more efficient." },
    { question: "Are LED bulbs better for the environment?", answer: "Yes — lower energy demand cuts power-plant emissions, and LEDs contain no mercury (unlike CFLs), making disposal safer. This calculator estimates CO₂ savings at 0.85 lbs per kWh avoided." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "LED Lighting Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">LED Lighting Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Lighting Setup</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="bulbs" label="Number of Bulbs" value={inputs.bulbs} onChange={set("bulbs")} min="0" />
              <NumInput id="hoursPerDay" label="Hours Used Per Day" value={inputs.hoursPerDay} onChange={set("hoursPerDay")} min="0" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="oldWattage" label="Old Bulb Wattage" value={inputs.oldWattage} onChange={set("oldWattage")} min="0" suffix="W" />
              <NumInput id="newWattage" label="LED Wattage" value={inputs.newWattage} onChange={set("newWattage")} min="0" suffix="W" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Financials</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="costPerKwh" label="Electricity Rate" value={inputs.costPerKwh} onChange={set("costPerKwh")} min="0" step="0.01" prefix="$" suffix="/kWh" />
              <NumInput id="costPerLed" label="Cost per LED Bulb" value={inputs.costPerLed} onChange={set("costPerLed")} min="0" prefix="$" />
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
            {r && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
                  <div className="flex justify-end absolute top-3 right-3">
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
                  </div>
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Energy Savings</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">${fmt(r.savingsDollars, 2)}</div>
                  <div className="text-sm text-muted-foreground font-medium">{fmt(r.savingsKwh)} kWh saved · pays back in <span className="font-bold text-foreground">{paybackText}</span></div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Upfront Cost</span>
                    <span className="font-extrabold text-primary">${fmt(r.totalUpfront, 2)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lifecycle Profit</span>
                    <span className="font-extrabold text-emerald-600">${fmt(r.lifecycleSavings, 0)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Reduced</span>
                    <span className="font-extrabold text-foreground">{fmt(r.co2Lbs, 0)} lbs/yr</span>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Annual Lighting Cost ($/year)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => ["$" + fmt(v, 2), "Annual cost"]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="value" name="Annual cost ($)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Upfront Cost", value: "$" + fmt(r.totalUpfront, 2) },
                      { label: "Annual Savings", value: "$" + fmt(r.savingsDollars, 2), bold: true },
                      { label: "Energy Saved", value: fmt(r.savingsKwh) + " kWh/yr" },
                      { label: "Payback Period", value: paybackText, bold: true },
                      { label: "LED Lifespan", value: fmt(r.ledLifetimeYears, 1) + " yrs" },
                      { label: "Lifecycle Profit", value: "$" + fmt(r.lifecycleSavings, 0), bold: true },
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
            <p>With the defaults (10 bulbs, 60 W → 9 W, 5 hrs/day, $0.15/kWh, $3/bulb), old bulbs cost <strong>$164.25/year</strong> and LEDs just $24.64 — saving $139.61 annually. The $30 upfront pays back in about <strong>2.6 months</strong>, and over the ~13.7-year LED lifespan the savings reach roughly $1,880.</p>
            <h2 className="text-2xl font-bold mb-3">The LED Advantage</h2>
            <p>Lighting is the easiest win in home energy: bulbs cost little, install in seconds, and LED lifespans of 25,000+ hours mean you save electricity and replacement costs for over a decade. This calculator uses 0.85 lbs of CO₂ per kWh saved (US grid average).</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/led-savings-calculator" />
          <PopularCalculators exclude="/calculator/led-savings-calculator" />
        </div>
      </div>
    </>
  );
};
export default LedSavingsCalculator;
