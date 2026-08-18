"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
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

interface Inputs { model: string; n0: string; rate: string; time: string; capacity: string; }

interface Result {
  finalPop: number;
  growth: number;
  growthPct: number;
  doublingTime: number;
  chart: { time: number; pop: number }[];
}

const DEFAULTS: Inputs = { model: "exponential", n0: "100", rate: "5", time: "10", capacity: "1000" };

function calculate(inputs: Inputs): Result | null {
  const N0 = Math.max(0, parseFloat(inputs.n0) || 0);
  const r = (parseFloat(inputs.rate) || 0) / 100;
  const t = Math.max(0, parseFloat(inputs.time) || 0);
  const K = Math.max(0, parseFloat(inputs.capacity) || 0);
  if (inputs.model === "logistic" && (K <= 0 || N0 === 0)) return null;
  const calc = (time: number) => inputs.model === "exponential"
    ? N0 * Math.exp(r * time)
    : K / (1 + ((K - N0) / N0) * Math.exp(-r * time));
  const finalPop = calc(t);
  const steps = Math.min(60, Math.max(1, Math.floor(t * 4)));
  const chart = Array.from({ length: steps + 1 }, (_, k) => {
    const time = (t * k) / steps;
    return { time: Math.round(time * 100) / 100, pop: Math.round(calc(time)) };
  });
  const growth = finalPop - N0;
  const growthPct = N0 > 0 ? (growth / N0) * 100 : 0;
  const doublingTime = r > 0 ? Math.LN2 / r : Infinity;
  return { finalPop, growth, growthPct, doublingTime, chart };
}

const PopulationGrowthEcologyCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.n0) < 0 || num(inputs.time) < 0 || (inputs.model === "logistic" && (num(inputs.capacity) <= 0 || num(inputs.n0) === 0));

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const doublingText = r ? (r.doublingTime === Infinity ? "—" : fmt(r.doublingTime, 1) + " periods") : "—";
  const rows = r ? [
    { label: "Growth Model", value: inputs.model === "exponential" ? "Exponential" : "Logistic" },
    { label: "Initial Population (N₀)", value: fmt(num(inputs.n0)) },
    { label: "Growth Rate (r)", value: fmt(num(inputs.rate), 1) + "%" },
    { label: "Time Periods (t)", value: fmt(num(inputs.time)) },
    ...(inputs.model === "logistic" ? [{ label: "Carrying Capacity (K)", value: fmt(num(inputs.capacity)) }] : []),
    { label: "Final Population", value: fmt(r.finalPop), highlight: true },
    { label: "Total Growth", value: "+" + fmt(r.growth) + " (" + fmt(r.growthPct, 1) + "%)", total: true },
  ] : [];

  const faqs = [
    { question: "What is exponential growth?", answer: "Exponential growth happens when the per-capita growth rate stays constant regardless of population size, so the population grows faster and faster as it gets larger — N(t) = N₀·e^(rt). It occurs when resources are effectively unlimited." },
    { question: "What is logistic growth?", answer: "Logistic growth accounts for resource limits: N(t) = K / (1 + ((K−N₀)/N₀)·e^(−rt)). Growth starts exponentially, then slows as the population approaches carrying capacity K, producing an S-shaped (sigmoid) curve." },
    { question: "What is carrying capacity (K)?", answer: "K is the maximum population an environment can sustain given its food, habitat, and water. Above K, mortality rises and growth turns negative; below K, the population tends to grow back toward it." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Population Growth Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Population Growth Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Model</div>
            <div>
              <SelectInput id="model" label="Growth Model" value={inputs.model} onChange={set("model")} options={[
                { value: "exponential", label: "Exponential (Unlimited Resources)" },
                { value: "logistic", label: "Logistic (Carrying Capacity)" },
              ]} />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Parameters</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="n0" label="Initial Population (N₀)" value={inputs.n0} onChange={set("n0")} min="0" />
              <NumInput id="rate" label="Growth Rate (r)" value={inputs.rate} onChange={set("rate")} suffix="%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="time" label="Time Periods (t)" value={inputs.time} onChange={set("time")} min="0" />
              {inputs.model === "logistic" && (
                <NumInput id="capacity" label="Carrying Capacity (K)" value={inputs.capacity} onChange={set("capacity")} min="0" />
              )}
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">{inputs.model === "logistic" ? "For logistic growth, K must be > 0 and N₀ > 0." : "N₀ and time must be ≥ 0."}</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Final Population at t = {fmt(num(inputs.time))}</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.finalPop)}</div>
                  <div className="text-sm text-muted-foreground font-medium">+{fmt(r.growth)} individuals · <span className="font-bold text-foreground">{fmt(r.growthPct, 1)}%</span> total growth</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Model</span>
                    <span className="font-extrabold text-primary">{inputs.model === "exponential" ? "Exponential" : "Logistic"}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Doubling Time</span>
                    <span className="font-extrabold text-emerald-600">{doublingText}</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Growth / Period</span>
                    <span className="font-extrabold text-foreground">{fmt(num(inputs.rate), 1)}%</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Parameter</th>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">Population Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} label={{ value: "Time", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [fmt(v), "Population"]} labelFormatter={(l) => `t = ${l}`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      {inputs.model === "logistic" && <ReferenceLine y={num(inputs.capacity)} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "K = " + fmt(num(inputs.capacity)), fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />}
                      <Line type="monotone" dataKey="pop" name="Population" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Model", value: inputs.model === "exponential" ? "Exponential" : "Logistic" },
                      { label: "Initial Pop.", value: fmt(num(inputs.n0)) },
                      { label: "Final Pop.", value: fmt(r.finalPop), bold: true },
                      { label: "Total Growth", value: "+" + fmt(r.growth), bold: true },
                      { label: "Growth Rate", value: fmt(num(inputs.rate), 1) + "% / period" },
                      { label: "Doubling Time", value: doublingText },
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
            <p>With the defaults (N₀=100, r=5%, t=10, exponential), the population reaches <strong>165</strong> — +65 individuals (+65%). The same run under the logistic model with K=1,000 gives only about 150, already curving toward the cap as the carrying capacity starts to bite.</p>
            <h2 className="text-2xl font-bold mb-3">The Two Classic Models</h2>
            <p>Exponential growth N(t) = N₀·e^(rt) describes colonization of empty habitat. Logistic growth N(t) = K/(1+((K−N₀)/N₀)·e^(−rt)) adds the S-curve that real populations show as resources run out — the same math behind sustainable-harvest and conservation decisions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/population-growth-ecology-calculator" />
          <PopularCalculators exclude="/calculator/population-growth-ecology-calculator" />
        </div>
      </div>
    </>
  );
};
export default PopulationGrowthEcologyCalculator;
