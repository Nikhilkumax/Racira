"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, max, step, prefix, suffix, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string; step?: string; prefix?: string; suffix?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 text-sm text-muted-foreground font-medium">{prefix}</span>}
      <input id={id} type="number" min={min} max={max} step={step} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 text-sm text-muted-foreground font-medium shrink-0">{suffix}</span>}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { systemSize: string; installCost: string; rate: string; sunHours: string; efficiency: string; lifespan: string; }

interface Result {
  dailyGeneration: number;
  annualGeneration: number;
  annualSavings: number;
  taxCredit: number;
  netCost: number;
  paybackYears: number;
  co2Kg: number;
  co2TonsLifetime: number;
  totalSavings: number;
  chart: { year: number; cumulative: number }[];
}

const DEFAULTS: Inputs = { systemSize: "6", installCost: "15000", rate: "0.16", sunHours: "4.5", efficiency: "0.8", lifespan: "25" };

function calculate(inputs: Inputs): Result | null {
  const size = Math.max(0, parseFloat(inputs.systemSize) || 0);
  const cost = Math.max(0, parseFloat(inputs.installCost) || 0);
  const rate = Math.max(0, parseFloat(inputs.rate) || 0);
  const hours = Math.max(0, parseFloat(inputs.sunHours) || 0);
  const eff = Math.min(1, Math.max(0, parseFloat(inputs.efficiency) || 0));
  const life = Math.max(1, parseFloat(inputs.lifespan) || 25);
  const dailyGeneration = size * hours * eff;
  const annualGeneration = dailyGeneration * 365;
  const annualSavings = annualGeneration * rate;
  const taxCredit = cost * 0.3;
  const netCost = cost - taxCredit;
  const paybackYears = annualSavings > 0 ? netCost / annualSavings : Infinity;
  const co2Kg = annualGeneration * 0.4;
  const co2TonsLifetime = (co2Kg * life) / 1000;
  const totalSavings = annualSavings * life - netCost;
  const chart = Array.from({ length: life + 1 }, (_, y) => ({
    year: y,
    cumulative: Math.round(annualSavings * y - netCost),
  }));
  return { dailyGeneration, annualGeneration, annualSavings, taxCredit, netCost, paybackYears, co2Kg, co2TonsLifetime, totalSavings, chart };
}

const SolarEnergySavingsCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.systemSize) < 0 || num(inputs.installCost) < 0 || num(inputs.rate) < 0 || num(inputs.sunHours) < 0 || num(inputs.efficiency) <= 0 || num(inputs.efficiency) > 1 || num(inputs.lifespan) < 1;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const paybackText = r ? (r.paybackYears === Infinity ? "—" : fmt(r.paybackYears, 1) + " yrs") : "—";
  const rows = r ? [
    { label: "System Size", value: fmt(num(inputs.systemSize), 1) + " kW" },
    { label: "Install Cost", value: "$" + fmt(num(inputs.installCost)) },
    { label: "Federal Tax Credit (30%)", value: "$" + fmt(r.taxCredit), highlight: true },
    { label: "Net System Cost", value: "$" + fmt(r.netCost), highlight: true },
    { label: "Daily Generation", value: fmt(r.dailyGeneration, 1) + " kWh" },
    { label: "Annual Generation", value: fmt(r.annualGeneration) + " kWh" },
    { label: "Payback Period", value: paybackText, total: true },
  ] : [];

  const faqs = [
    { question: "What are peak sun hours?", answer: "Peak sun hours are the equivalent hours per day of full 1,000 W/m² sunlight, not total daylight. In the US they typically range from about 3 in the northeast to 6+ in the southwest." },
    { question: "How long do solar panels last?", answer: "Most panels carry a 25-year performance warranty and keep producing well beyond that, degrading only about 0.5% per year. This calculator models a flat annual output over the lifespan you enter." },
    { question: "What is the Federal Solar Tax Credit?", answer: "The Investment Tax Credit (ITC) lets you deduct 30% of the installed cost from your federal taxes. This calculator applies it to arrive at the net system cost used for payback." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Solar Energy Savings Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Energy Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">System & Sunlight</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="systemSize" label="System Size" value={inputs.systemSize} onChange={set("systemSize")} min="0" suffix="kW" />
              <NumInput id="sunHours" label="Avg Peak Sun Hours" value={inputs.sunHours} onChange={set("sunHours")} min="0" suffix="hr/day" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Financial Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="installCost" label="Total Install Cost" value={inputs.installCost} onChange={set("installCost")} min="0" prefix="$" />
              <NumInput id="rate" label="Electricity Rate" value={inputs.rate} onChange={set("rate")} min="0" step="0.01" prefix="$" suffix="/kWh" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold mt-1">Advanced Options</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="efficiency" label="System Efficiency" value={inputs.efficiency} onChange={set("efficiency")} min="0.1" max="1" step="0.05" hint="Typical: 0.75-0.85." />
              <NumInput id="lifespan" label="Lifespan (years)" value={inputs.lifespan} onChange={set("lifespan")} min="1" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Efficiency must be 0-1, lifespan ≥ 1, and other values ≥ 0.</p>
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
                  <div className="text-sm text-muted-foreground font-medium">after ${fmt(r.taxCredit)} federal tax credit · saving <span className="font-bold text-foreground">${fmt(r.annualSavings, 0)}/yr</span></div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net Cost</span>
                    <span className="font-extrabold text-primary">${fmt(r.netCost)}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Generation</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.annualGeneration)} kWh</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">CO₂ Offset</span>
                    <span className="font-extrabold text-foreground">{fmt(r.co2Kg, 0)} kg/yr</span>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Cumulative Cash Flow (savings − net cost)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11 }} label={{ value: "Year", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => ["$" + fmt(v), "Cumulative"]} labelFormatter={(l) => `Year ${l}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Break-even", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                      <Line type="monotone" dataKey="cumulative" name="Cumulative savings ($)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Net Cost", value: "$" + fmt(r.netCost), bold: true },
                      { label: "Annual Savings", value: "$" + fmt(r.annualSavings, 0), bold: true },
                      { label: "Payback Period", value: paybackText },
                      { label: "Daily Generation", value: fmt(r.dailyGeneration, 1) + " kWh" },
                      { label: "Lifetime CO₂", value: fmt(r.co2TonsLifetime, 1) + " tons" },
                      { label: "25-Yr Net Savings", value: "$" + fmt(r.totalSavings), bold: true },
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
            <p>With the defaults (6 kW, 4.5 sun hrs, $0.16/kWh, $15,000 install), the system produces <strong>21.6 kWh/day — 7,884 kWh/year</strong>, saving $1,261 annually. After the 30% ITC, net cost is $10,500, so the payback is about <strong>8.3 years</strong> — with roughly $21,000 of net savings over 25 years and 79 tons of CO₂ avoided.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond Simple Payback</h2>
            <p>This model assumes flat production and a fixed rate. Real payback is usually faster: electricity rates historically rise, and net metering credits production at retail rates. State rebates and SRECs can shorten the period further, while shading and roof orientation can lengthen it.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/solar-energy-savings-calculator" />
          <PopularCalculators exclude="/calculator/solar-energy-savings-calculator" />
        </div>
      </div>
    </>
  );
};
export default SolarEnergySavingsCalculator;
