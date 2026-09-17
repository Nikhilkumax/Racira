"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const FACTOR = 9.5;

const NumInput = ({ id, label, value, onChange, suffix, min, max }: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string; min?: string; max?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} max={max} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

interface Inputs {
  mode: "pctToCgpa" | "cgpaToPct";
  percentage: string;
  cgpa: string;
}

interface Result {
  converted: number;
  unit: string;
  pctToCgpa: number;
  cgpaToPct: number;
  curve: { pct: number; cgpa: number }[];
}

const DEFAULTS: Inputs = { mode: "pctToCgpa", percentage: "75", cgpa: "7.89" };

function calculate(inputs: Inputs): Result {
  const pct = Math.min(100, Math.max(0, parseFloat(inputs.percentage) || 0));
  const cgpa = Math.min(10, Math.max(0, parseFloat(inputs.cgpa) || 0));
  const pctToCgpa = pct / FACTOR;
  const cgpaToPct = cgpa * FACTOR;
  const curve = Array.from({ length: 21 }, (_, i) => {
    const p = i * 5;
    return { pct: p, cgpa: Math.round((p / FACTOR) * 100) / 100 };
  });
  return {
    converted: inputs.mode === "pctToCgpa" ? pctToCgpa : cgpaToPct,
    unit: inputs.mode === "pctToCgpa" ? "CGPA" : "%",
    pctToCgpa,
    cgpaToPct,
    curve,
  };
}

const PercentageToCgpaConverter = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = inputs.mode === "pctToCgpa" ? (num(inputs.percentage) < 0 || num(inputs.percentage) > 100) : (num(inputs.cgpa) < 0 || num(inputs.cgpa) > 10);

  const handleMode = (m: "pctToCgpa" | "cgpaToPct") => { setInputs(prev => ({ ...prev, mode: m })); setResult(calculate({ ...inputs, mode: m })); };
  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const inputValue = inputs.mode === "pctToCgpa" ? num(inputs.percentage) : num(inputs.cgpa);
  const rows = [
    { label: "Conversion Mode", value: inputs.mode === "pctToCgpa" ? "Percentage → CGPA" : "CGPA → Percentage" },
    { label: "Input Value", value: fmt(inputValue) + (inputs.mode === "pctToCgpa" ? "%" : "") },
    { label: "Conversion Factor (÷ or × 9.5)", value: String(FACTOR) },
    { label: "Converted Result", value: fmt(result.converted, 2) + (result.unit === "%" ? "%" : ""), highlight: true },
    { label: "Reverse Check", value: inputs.mode === "pctToCgpa" ? fmt(result.cgpaToPct, 1) + "% = " + fmt(result.pctToCgpa, 2) + " CGPA" : fmt(result.pctToCgpa, 2) + " CGPA = " + fmt(result.cgpaToPct, 1) + "%" },
  ];

  const faqs = [
    { question: "How do you convert percentage to CGPA?", answer: "Divide the percentage by 9.5 — the factor used by CBSE and many Indian boards. For example, 75% ÷ 9.5 = 7.89 CGPA. The calculator also converts the other direction by multiplying the CGPA by 9.5." },
    { question: "Where does the 9.5 factor come from?", answer: "It is derived from the statistical relationship between board exam percentage scores and the corresponding grade points in the 10-point CGPA scale. It maps a 95% score to a 10.0 CGPA." },
    { question: "Is the 9.5 factor universal?", answer: "No. Some institutions use different conversion tables, and international systems use a 4.0 scale. Always confirm with your school's official conversion policy before submitting applications that require a specific scale." },
    { question: "What is the difference between CGPA and GPA?", answer: "CGPA (Cumulative Grade Point Average) is the 10-point average used by many Indian institutions. GPA is typically the 4.0-scale average used in the US and elsewhere. Both weight courses by credit, but the scales differ." },
  ];

  const marker = inputs.mode === "pctToCgpa"
    ? { x: inputValue, y: Math.round((inputValue / FACTOR) * 100) / 100 }
    : { x: Math.round(inputValue * FACTOR), y: inputValue };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Percentage to CGPA Converter" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Percentage to CGPA Converter</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="flex bg-secondary rounded-lg p-1">
              <button type="button" onClick={() => handleMode("pctToCgpa")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${inputs.mode === "pctToCgpa" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>Percentage to CGPA</button>
              <button type="button" onClick={() => handleMode("cgpaToPct")} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${inputs.mode === "cgpaToPct" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>CGPA to Percentage</button>
            </div>
            <div>
              {inputs.mode === "pctToCgpa" ? (
                <NumInput id="percentage" label="Percentage Marks" value={inputs.percentage} onChange={set("percentage")} suffix="%" min="0" max="100" />
              ) : (
                <NumInput id="cgpa" label="CGPA (10-point scale)" value={inputs.cgpa} onChange={set("cgpa")} min="0" max="10" />
              )}
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Percentage must be 0–100; CGPA must be 0–10.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Converted {result.unit}</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.converted, 2)}{result.unit === "%" ? "%" : ""}</div>
              <div className="text-sm text-muted-foreground font-medium">{inputs.mode === "pctToCgpa" ? fmt(inputValue) + "% ÷ 9.5" : fmt(inputValue) + " CGPA × 9.5"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Input</span>
                <span className="font-extrabold text-foreground">{fmt(inputValue)}{inputs.mode === "pctToCgpa" ? "%" : " CGPA"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Factor</span>
                <span className="font-extrabold text-primary">{FACTOR}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reverse Conversion</span>
                <span className="font-extrabold text-emerald-600">{inputs.mode === "pctToCgpa" ? fmt(result.cgpaToPct, 1) + "%" : fmt(result.pctToCgpa, 2) + " CGPA"}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Conversion Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Percentage ↔ CGPA Relationship</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={result.curve} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="pct" tick={{ fontSize: 11 }} label={{ value: "Percentage (%)", position: "insideBottom", offset: -2, fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} label={{ value: "CGPA", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(2), "CGPA"]} labelFormatter={(l: number) => l + "%"} />
                  <ReferenceLine x={marker.x} stroke="#f59e0b" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="cgpa" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Mode", value: inputs.mode === "pctToCgpa" ? "Percentage → CGPA" : "CGPA → Percentage" },
                  { label: "Input Value", value: fmt(inputValue) + (inputs.mode === "pctToCgpa" ? "%" : " CGPA") },
                  { label: "Conversion Factor", value: String(FACTOR) },
                  { label: "Converted Result", value: fmt(result.converted, 2) + (result.unit === "%" ? "%" : ""), bold: true },
                  { label: "Reverse Direction", value: inputs.mode === "pctToCgpa" ? fmt(result.cgpaToPct, 1) + "%" : fmt(result.pctToCgpa, 2) + " CGPA" },
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
            <h2 className="text-2xl font-bold mb-3">Academic Grading Conversions</h2>
            <p>Converting between percentage marks and CGPA is a routine step for students applying to universities or jobs across systems. The 9.5 factor is the standard bridge used by CBSE and many Indian institutions: it maps a 95% score to a perfect 10.0 CGPA and scales linearly below that. With the default input, 75% converts to 75 ÷ 9.5 = 7.89 CGPA.</p>
            <p>The relationship is strictly linear, so the chart shows a straight line from 0% to 100%. The reverse direction is the same line read backwards: a 7.89 CGPA multiplies back to 75.0%.</p>
            <h2 className="text-2xl font-bold mb-3">When the Factor Differs</h2>
            <p>Institutions outside the 10-point system (notably the US 4.0 scale) need their own conversion tables. Before submitting any application, verify the exact policy of the receiving institution — a CGPA quoted on the wrong scale can misrepresent your record.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-to-cgpa-converter" />
          <PopularCalculators exclude="/calculator/percentage-to-cgpa-converter" />
        </div>
      </div>
    </>
  );
};
export default PercentageToCgpaConverter;
