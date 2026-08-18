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

interface Inputs { electricity: string; gas: string; oil: string; propane: string; }

interface Result {
  elecKg: number;
  gasKg: number;
  oilKg: number;
  propaneKg: number;
  totalKg: number;
  totalTons: number;
  dailyKg: number;
  treesNeeded: number;
  elecPct: number;
  gasPct: number;
  otherPct: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { electricity: "900", gas: "60", oil: "0", propane: "0" };

function calculate(inputs: Inputs): Result {
  const elec = Math.max(0, parseFloat(inputs.electricity) || 0);
  const gas = Math.max(0, parseFloat(inputs.gas) || 0);
  const oil = Math.max(0, parseFloat(inputs.oil) || 0);
  const propane = Math.max(0, parseFloat(inputs.propane) || 0);
  const elecKg = elec * 0.4 * 12;
  const gasKg = gas * 5.3 * 12;
  const oilKg = oil * 10.1 * 12;
  const propaneKg = propane * 5.7 * 12;
  const totalKg = elecKg + gasKg + oilKg + propaneKg;
  const totalTons = totalKg / 1000;
  const dailyKg = totalKg / 365;
  const treesNeeded = Math.ceil(totalKg / 20);
  const t = totalKg || 1;
  return {
    elecKg,
    gasKg,
    oilKg,
    propaneKg,
    totalKg,
    totalTons,
    dailyKg,
    treesNeeded,
    elecPct: (elecKg / t) * 100,
    gasPct: (gasKg / t) * 100,
    otherPct: ((oilKg + propaneKg) / t) * 100,
    chart: [
      { name: "Electricity", value: Math.round(elecKg) },
      { name: "Natural Gas", value: Math.round(gasKg) },
      { name: "Oil & Propane", value: Math.round(oilKg + propaneKg) },
    ],
  };
}

const HomeEnergyEmissionsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.electricity) < 0 || num(inputs.gas) < 0 || num(inputs.oil) < 0 || num(inputs.propane) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Electricity", value: fmt(num(inputs.electricity)) + " kWh/mo → " + fmt(result.elecKg / 1000, 2) + " t" },
    { label: "Natural Gas", value: fmt(num(inputs.gas)) + " therms/mo → " + fmt(result.gasKg / 1000, 2) + " t" },
    { label: "Heating Oil", value: fmt(num(inputs.oil)) + " gal/mo → " + fmt(result.oilKg / 1000, 2) + " t" },
    { label: "Propane", value: fmt(num(inputs.propane)) + " gal/mo → " + fmt(result.propaneKg / 1000, 2) + " t" },
    { label: "Total Annual Emissions", value: fmt(result.totalTons, 2) + " tons CO2e", highlight: true },
    { label: "Daily Average", value: fmt(result.dailyKg, 1) + " kg/day" },
    { label: "Trees Needed to Offset", value: fmt(result.treesNeeded) + " trees/yr", total: true },
  ];

  const faqs = [
    { question: "Which home energy source is cleanest?", answer: "Electricity from the modern grid is the cleanest option for most homes, and it gets cleaner every year as renewables expand. Natural gas beats heating oil and coal but still emits significant CO₂ (and methane leakage)." },
    { question: "How can I lower my electricity emissions?", answer: "Insulation and air sealing cut demand, smart thermostats and Energy Star appliances reduce use, and a green power plan or rooftop solar lowers the emissions factor of every kWh you pull from the grid." },
    { question: "What is a 'therm' of natural gas?", answer: "A therm is 100,000 BTUs — the standard billing unit for natural gas in the US. A typical household uses 40-80 therms per month in winter, more with gas heat and hot water." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Home Energy Emissions Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Home Energy Emissions Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Energy Use (Monthly)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="electricity" label="Electricity" value={inputs.electricity} onChange={set("electricity")} min="0" suffix="kWh" />
              <NumInput id="gas" label="Natural Gas" value={inputs.gas} onChange={set("gas")} min="0" suffix="therms" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Advanced Options</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="oil" label="Heating Oil" value={inputs.oil} onChange={set("oil")} min="0" suffix="gal" />
              <NumInput id="propane" label="Propane" value={inputs.propane} onChange={set("propane")} min="0" suffix="gal" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Annual Home Energy Emissions</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalTons, 2)} <span className="text-2xl">tons CO2e</span></div>
              <div className="text-sm text-muted-foreground font-medium">{fmt(result.dailyKg, 1)} kg per day · <span className="font-bold text-foreground">{fmt(result.treesNeeded)} trees</span> to offset</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Electricity</span>
                <span className="font-extrabold text-primary">{fmt(result.elecKg / 1000, 2)} t</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{fmt(result.elecPct, 0)}% of total</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Natural Gas</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.gasKg / 1000, 2)} t</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{fmt(result.gasPct, 0)}% of total</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Oil & Propane</span>
                <span className="font-extrabold text-foreground">{fmt((result.oilKg + result.propaneKg) / 1000, 2)} t</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{fmt(result.otherPct, 0)}% of total</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Source</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Emissions Breakdown by Source (kg CO2e)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${fmt(value / 1000, 1)}t`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v / 1000, 2) + " tons", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Electricity", value: fmt(result.elecKg / 1000, 2) + " t", bold: true },
                  { label: "Natural Gas", value: fmt(result.gasKg / 1000, 2) + " t", bold: true },
                  { label: "Oil & Propane", value: fmt((result.oilKg + result.propaneKg) / 1000, 2) + " t" },
                  { label: "Total", value: fmt(result.totalTons, 2) + " tons", bold: true },
                  { label: "Daily Average", value: fmt(result.dailyKg, 1) + " kg" },
                  { label: "Trees to Offset", value: fmt(result.treesNeeded) + " trees/yr" },
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
            <p>With the defaults (900 kWh/mo electricity, 60 therms/mo gas), the home emits <strong>8.14 tons CO2e per year</strong> — 4.32 t from electricity and 3.82 t from gas, about 53% vs 47%. That's roughly 407 trees' worth of annual absorption capacity.</p>
            <h2 className="text-2xl font-bold mb-3">Where the Emissions Come From</h2>
            <p>Electricity uses a 0.4 kg/kWh US-average grid factor (higher in coal regions, near zero with renewables), gas 5.3 kg/therm, heating oil 10.1 kg/gal, and propane 5.7 kg/gal. Heating and cooling dominate most homes — efficiency upgrades cut every line in this table regardless of fuel.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/home-energy-emissions-calculator" />
          <PopularCalculators exclude="/calculator/home-energy-emissions-calculator" />
        </div>
      </div>
    </>
  );
};
export default HomeEnergyEmissionsCalculator;
