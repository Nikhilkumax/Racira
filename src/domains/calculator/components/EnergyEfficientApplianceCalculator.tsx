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
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { oldWattage: string; newWattage: string; hoursPerDay: string; costPerKwh: string; applianceCost: string; lifetime: string; }

interface Result {
  oldAnnualKwh: number;
  newAnnualKwh: number;
  savingsKwh: number;
  oldCost: number;
  newCost: number;
  savingsDollars: number;
  paybackYears: number;
  lifetimeSavings: number;
  roiPct: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { oldWattage: "500", newWattage: "200", hoursPerDay: "4", costPerKwh: "0.15", applianceCost: "800", lifetime: "12" };

function calculate(inputs: Inputs): Result | null {
  const w1 = Math.max(0, parseFloat(inputs.oldWattage) || 0);
  const w2 = Math.max(0, parseFloat(inputs.newWattage) || 0);
  const hpd = Math.max(0, parseFloat(inputs.hoursPerDay) || 0);
  const cpk = Math.max(0, parseFloat(inputs.costPerKwh) || 0);
  const cost = Math.max(0, parseFloat(inputs.applianceCost) || 0);
  const life = Math.max(0, parseFloat(inputs.lifetime) || 0);
  const oldAnnualKwh = (w1 * hpd * 365) / 1000;
  const newAnnualKwh = (w2 * hpd * 365) / 1000;
  const savingsKwh = oldAnnualKwh - newAnnualKwh;
  const oldCost = oldAnnualKwh * cpk;
  const newCost = newAnnualKwh * cpk;
  const savingsDollars = savingsKwh * cpk;
  const paybackYears = savingsDollars > 0 ? cost / savingsDollars : Infinity;
  const lifetimeSavings = savingsDollars * life - cost;
  const roiPct = cost > 0 ? (lifetimeSavings / cost) * 100 : 0;
  return {
    oldAnnualKwh,
    newAnnualKwh,
    savingsKwh,
    oldCost,
    newCost,
    savingsDollars,
    paybackYears,
    lifetimeSavings,
    roiPct,
    chart: [
      { name: "Current Appliance", value: Math.round(oldCost * 100) / 100 },
      { name: "New Appliance", value: Math.round(newCost * 100) / 100 },
    ],
  };
}

const EnergyEfficientApplianceCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.oldWattage) < 0 || num(inputs.newWattage) < 0 || num(inputs.hoursPerDay) < 0 || num(inputs.costPerKwh) < 0 || num(inputs.applianceCost) < 0 || num(inputs.lifetime) < 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const paybackText = r ? (r.paybackYears === Infinity ? "—" : fmt(r.paybackYears, 1) + " yrs") : "—";
  const rows = r ? [
    { label: "Current Appliance Wattage", value: fmt(num(inputs.oldWattage)) + " W" },
    { label: "New Appliance Wattage", value: fmt(num(inputs.newWattage)) + " W" },
    { label: "Usage", value: fmt(num(inputs.hoursPerDay), 1) + " hrs/day" },
    { label: "Electricity Rate", value: "$" + fmt(num(inputs.costPerKwh), 3) + "/kWh" },
    { label: "Current Annual Energy Cost", value: "$" + fmt(r.oldCost, 2), highlight: true },
    { label: "New Annual Energy Cost", value: "$" + fmt(r.newCost, 2), highlight: true },
    { label: "Payback Period", value: paybackText, total: true },
  ] : [];

  const faqs = [
    { question: "What is ROI in energy efficiency?", answer: "It measures how quickly the annual energy savings repay the upfront cost of the new appliance. After the payback period, every year of savings is pure financial gain for the remaining life of the appliance." },
    { question: "How do I find my electricity rate?", answer: "Check your electric bill: divide the total charged for electricity by the kWh used that month. The US average is about $0.15-0.17 per kWh but varies widely by region and time of use." },
    { question: "Are energy-efficient appliances worth it?", answer: "Usually yes — especially for appliances that run constantly (refrigerators) or use heating elements (dryers, water heaters, ovens). Their energy savings often exceed the price premium over the appliance's lifetime." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Energy Efficiency ROI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Energy Efficiency ROI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Appliance Specs</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="oldWattage" label="Current Wattage" value={inputs.oldWattage} onChange={set("oldWattage")} min="0" suffix="W" />
              <NumInput id="newWattage" label="New Wattage" value={inputs.newWattage} onChange={set("newWattage")} min="0" suffix="W" />
            </div>
            <div>
              <NumInput id="hoursPerDay" label="Hours Used Per Day" value={inputs.hoursPerDay} onChange={set("hoursPerDay")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Financial Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="costPerKwh" label="Electricity Rate" value={inputs.costPerKwh} onChange={set("costPerKwh")} min="0" step="0.01" prefix="$" suffix="/kWh" />
              <NumInput id="applianceCost" label="New Appliance Price" value={inputs.applianceCost} onChange={set("applianceCost")} min="0" prefix="$" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold mt-1">Advanced Options</div>
            <div>
              <NumInput id="lifetime" label="Expected Lifespan (years)" value={inputs.lifetime} onChange={set("lifetime")} min="0" hint="Used for lifetime savings and ROI." />
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Payback Period</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{r.paybackYears === Infinity ? "—" : fmt(r.paybackYears, 1)} <span className="text-2xl">years</span></div>
                  <div className="text-sm text-muted-foreground font-medium">saving <span className="font-bold text-foreground">${fmt(r.savingsDollars, 2)}</span> per year on energy</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Energy Saved</span>
                    <span className="font-extrabold text-primary">{fmt(r.savingsKwh, 0)} kWh/yr</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lifetime Savings</span>
                    <span className="font-extrabold text-emerald-600">${fmt(r.lifetimeSavings, 0)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ROI</span>
                    <span className="font-extrabold text-foreground">{fmt(r.roiPct, 0)}%</span>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Annual Energy Cost Comparison ($/year)</h3>
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
                      { label: "Current Cost", value: "$" + fmt(r.oldCost, 2) + "/yr" },
                      { label: "New Cost", value: "$" + fmt(r.newCost, 2) + "/yr" },
                      { label: "Annual Savings", value: "$" + fmt(r.savingsDollars, 2), bold: true },
                      { label: "Energy Saved", value: fmt(r.savingsKwh, 0) + " kWh/yr" },
                      { label: "Payback Period", value: paybackText, bold: true },
                      { label: "Lifetime ROI", value: fmt(r.roiPct, 0) + "%" },
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
            <p>With the defaults (500 W → 200 W, 4 hrs/day, $0.15/kWh, $800 purchase), the old appliance costs <strong>$109.50/year</strong> to run and the new one $43.80 — saving $65.70 annually. The $800 appliance pays for itself in about <strong>12.2 years</strong>, so it only makes sense for appliances near the end of life or with heavy usage.</p>
            <h2 className="text-2xl font-bold mb-3">When Upgrades Win</h2>
            <p>High-usage appliances are the best candidates: a refrigerator runs 24/7 and an electric water heater or dryer runs hot, so even modest wattage cuts produce large annual savings. For lightly used devices, the payback can exceed the appliance's lifespan.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/energy-efficient-appliance-calculator" />
          <PopularCalculators exclude="/calculator/energy-efficient-appliance-calculator" />
        </div>
      </div>
    </>
  );
};
export default EnergyEfficientApplianceCalculator;
