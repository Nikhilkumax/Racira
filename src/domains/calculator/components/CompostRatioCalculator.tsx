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

interface Inputs { greensWeight: string; greensCN: string; brownsWeight: string; brownsCN: string; target: string; }

interface Result {
  ratio: number;
  nitrogen: number;
  status: string;
  isOptimal: boolean;
  brownsForTarget: number;
  brownsRatio: number;
  chart: { browns: number; ratio: number }[];
}

const DEFAULTS: Inputs = { greensWeight: "10", greensCN: "15", brownsWeight: "10", brownsCN: "60", target: "30" };

function calculate(inputs: Inputs): Result | null {
  const wG = Math.max(0, parseFloat(inputs.greensWeight) || 0);
  const rG = Math.max(0.1, parseFloat(inputs.greensCN) || 0.1);
  const wB = Math.max(0, parseFloat(inputs.brownsWeight) || 0);
  const rB = Math.max(0.1, parseFloat(inputs.brownsCN) || 0.1);
  const target = Math.max(1, parseFloat(inputs.target) || 30);
  const nitrogen = wG / rG + wB / rB;
  const ratio = (wG + wB) / (nitrogen || 1);
  const status = ratio < 20 ? "Too much Nitrogen — add Browns" : ratio > 40 ? "Too much Carbon — add Greens" : "In the workable range";
  const isOptimal = ratio >= 25 && ratio <= 30;
  // Solve for browns weight that hits the target ratio: wB = wG·(1 − R/rG) / (R/rB − 1)
  const denom = target / rB - 1;
  const brownsForTarget = denom !== 0 ? (wG * (1 - target / rG)) / denom : 0;
  const brownsRatio = wG > 0 ? wB / wG : 0;
  const maxX = Math.max(wB * 2, brownsForTarget * 1.5, 1);
  const chart = Array.from({ length: 41 }, (_, k) => {
    const b = (maxX * k) / 40;
    const n = wG / rG + b / rB;
    return { browns: Math.round(b * 10) / 10, ratio: n > 0 ? Math.round(((wG + b) / n) * 10) / 10 : 0 };
  });
  return { ratio, nitrogen, status, isOptimal, brownsForTarget, brownsRatio, chart };
}

const CompostRatioCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result | null>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.greensWeight) < 0 || num(inputs.greensCN) <= 0 || num(inputs.brownsWeight) < 0 || num(inputs.brownsCN) <= 0 || num(inputs.target) <= 0;

  const handleCalculate = () => {
    const r = calculate(inputs);
    if (r) setResult(r);
  };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const r = result;
  const rows = r ? [
    { label: "Greens (Nitrogen) Weight", value: fmt(num(inputs.greensWeight)) + " units" },
    { label: "Greens C:N Ratio", value: fmt(num(inputs.greensCN)) + ":1" },
    { label: "Browns (Carbon) Weight", value: fmt(num(inputs.brownsWeight)) + " units" },
    { label: "Browns C:N Ratio", value: fmt(num(inputs.brownsCN)) + ":1" },
    { label: "Combined C:N Ratio", value: fmt(r.ratio, 1) + ":1", highlight: true },
    { label: "Browns Needed for " + fmt(num(inputs.target)) + ":1", value: fmt(r.brownsForTarget, 1) + " units", highlight: true },
    { label: "Target Ratio", value: "25:1 - 30:1 (hot compost)", total: true },
  ] : [];

  const faqs = [
    { question: "What are 'Greens' and 'Browns'?", answer: "Greens are nitrogen-rich: grass clippings, vegetable scraps, coffee grounds. Browns are carbon-rich: dry leaves, straw, wood chips, shredded cardboard. Microbes need both — carbon for energy, nitrogen for protein and reproduction." },
    { question: "What is the ideal C:N ratio?", answer: "The sweet spot for fast 'hot' composting is 25:1 to 30:1. Below ~20:1 the pile smells like ammonia; above ~40:1 decomposition crawls because the microbes are nitrogen-starved." },
    { question: "Why does the ratio matter?", answer: "A balanced diet lets decomposer microbes thrive and break down material quickly. Too much nitrogen wastes it as ammonia gas; too much carbon leaves a dormant pile that takes a year or more to finish." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Environment", href: "/calculator#environment" }, { label: "Compost C:N Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Compost C:N Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Greens (Nitrogen)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="greensWeight" label="Weight / Volume" value={inputs.greensWeight} onChange={set("greensWeight")} min="0" suffix="units" />
              <NumInput id="greensCN" label="C:N Ratio" value={inputs.greensCN} onChange={set("greensCN")} min="0.1" hint="Grass 15-20, food scraps 12-15." />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Browns (Carbon)</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="brownsWeight" label="Weight / Volume" value={inputs.brownsWeight} onChange={set("brownsWeight")} min="0" suffix="units" />
              <NumInput id="brownsCN" label="C:N Ratio" value={inputs.brownsCN} onChange={set("brownsCN")} min="0.1" hint="Leaves 40-80, cardboard 350." />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Advanced Options</div>
            <div>
              <NumInput id="target" label="Target Ratio (C:N)" value={inputs.target} onChange={set("target")} min="1" hint="Use 30 for hot composting." />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">C:N ratios must be positive and weights ≥ 0.</p>
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
                  <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Combined C:N Ratio</div>
                  <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(r.ratio, 1)}<span className="text-2xl">:1</span></div>
                  <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold mt-1 ${r.isOptimal ? "bg-emerald-500/15 text-emerald-700" : r.ratio < 20 || r.ratio > 40 ? "bg-orange-500/15 text-orange-700" : "bg-amber-500/15 text-amber-700"}`}>{r.status}</div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Nitrogen Content</span>
                    <span className="font-extrabold text-primary">{fmt(r.nitrogen, 2)} units</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Browns : Greens</span>
                    <span className="font-extrabold text-emerald-600">{fmt(r.brownsRatio, 1)}:1</span>
                  </div>
                  <div className="w-px h-8 bg-border"></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Browns for {fmt(num(inputs.target))}:1</span>
                    <span className="font-extrabold text-foreground">{fmt(r.brownsForTarget, 1)} units</span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="p-2.5 pl-3">Detail</th>
                        <th className="p-2.5 pr-3 text-right w-[160px]">Value</th>
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
                  <h3 className="text-sm font-bold text-foreground mb-3">C:N Ratio as Browns Increase</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={r.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="browns" tick={{ fontSize: 11 }} label={{ value: "Browns (units)", position: "insideBottom", offset: -2, fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis domain={[0, "auto"]} tick={{ fontSize: 11 }} label={{ value: "C:N ratio", angle: -90, position: "insideLeft", fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => [fmt(v, 1) + ":1", "Ratio"]} labelFormatter={(l) => `${l} units browns`} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="4 4" />
                      <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Ideal 25-30", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                      <Line type="monotone" dataKey="ratio" name="C:N ratio" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-semibold mb-4">Summary</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { label: "Greens", value: fmt(num(inputs.greensWeight)) + " units @ " + fmt(num(inputs.greensCN)) + ":1" },
                      { label: "Browns", value: fmt(num(inputs.brownsWeight)) + " units @ " + fmt(num(inputs.brownsCN)) + ":1" },
                      { label: "Combined Ratio", value: fmt(r.ratio, 1) + ":1", bold: true },
                      { label: "Status", value: r.isOptimal ? "Optimal" : r.ratio < 20 ? "Needs Browns" : r.ratio > 40 ? "Needs Greens" : "Workable", bold: true },
                      { label: "Browns : Greens", value: fmt(r.brownsRatio, 1) + ":1" },
                      { label: "Browns for " + fmt(num(inputs.target)) + ":1", value: fmt(r.brownsForTarget, 1) + " units (total)" },
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
            <p>With the defaults (10 units greens @ 15:1, 10 units browns @ 60:1), the mix computes to <strong>24.0:1</strong> — in the workable range, just shy of the 25-30:1 hot-compost sweet spot. Reaching 30:1 would need <strong>20 total units of browns</strong> (add 10 to the current pile).</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>The combined ratio is total weight ÷ total nitrogen: (wG + wB) ÷ (wG/rG + wB/rB). Common values: vegetable scraps 12-15:1, grass 15-20:1, dry leaves 40-80:1, straw 75:1, cardboard 350:1, sawdust 500:1.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/compost-ratio-calculator" />
          <PopularCalculators exclude="/calculator/compost-ratio-calculator" />
        </div>
      </div>
    </>
  );
};
export default CompostRatioCalculator;
