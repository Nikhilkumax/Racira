"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

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

interface Inputs { currentGrade: string; targetGrade: string; finalWeight: string; }

interface Result {
  needed: number;
  currentContribution: number;
  targetContribution: number;
  impossible: boolean;
  achieved: boolean;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { currentGrade: "85", targetGrade: "90", finalWeight: "40" };

function calculate(inputs: Inputs): Result {
  const current = Math.min(100, Math.max(0, parseFloat(inputs.currentGrade) || 0));
  const target = Math.min(100, Math.max(0, parseFloat(inputs.targetGrade) || 0));
  const weight = Math.min(99, Math.max(1, parseFloat(inputs.finalWeight) || 0)) / 100;
  const currentContribution = current * (1 - weight);
  const needed = (target - currentContribution) / weight;
  return {
    needed,
    currentContribution,
    targetContribution: target,
    impossible: needed > 100,
    achieved: needed <= 0,
    chart: [
      { name: "Current Grade Contribution", value: Math.round(currentContribution * 10) / 10 },
      { name: "Needed on Final", value: Math.round(Math.min(100, Math.max(0, needed)) * 10) / 10 },
    ],
  };
}

const FinalGradeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.currentGrade) < 0 || num(inputs.currentGrade) > 100 || num(inputs.targetGrade) < 0 || num(inputs.targetGrade) > 100 || num(inputs.finalWeight) <= 0 || num(inputs.finalWeight) >= 100;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const valueColor = result.impossible ? "text-red-500" : result.achieved ? "text-emerald-600" : "text-primary";

  const rows = [
    { label: "Current Grade", value: fmt(num(inputs.currentGrade), 1) + "%" },
    { label: "Target Grade", value: fmt(num(inputs.targetGrade), 1) + "%" },
    { label: "Final Exam Weight", value: fmt(num(inputs.finalWeight)) + "%" },
    { label: "Current Contribution (before final)", value: fmt(result.currentContribution, 1) + "%" },
    { label: "Target Contribution Needed", value: fmt(result.targetContribution, 1) + "%" },
    { label: "Required Score on Final", value: result.impossible ? "Impossible (>100%)" : result.achieved ? "Already achieved (≤0%)" : fmt(result.needed, 1) + "%", highlight: true },
  ];

  const faqs = [
    { question: "How does this calculator work?", answer: "It solves for the final-exam score you need: Needed = (Target − Current × (1 − Weight)) ÷ Weight. With the defaults — 85% now, targeting 90%, with the final worth 40% — you need (90 − 51) ÷ 0.4 = 97.5% on the final." },
    { question: "What if I need more than 100%?", answer: "That means the target is mathematically impossible: even a perfect score can't lift your average far enough. The only path is extra credit or a lower target." },
    { question: "What if the required score is 0% or negative?", answer: "Your target is already locked in — even scoring 0 on the final keeps you at or above your target grade. You can redirect study time to other classes." },
    { question: "Is this for any single assessment?", answer: "Yes — any graded item with a known percentage weight: a final exam, project, or paper. The weight must be between 0% and 100% of the course grade." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Final Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Final Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="current" label="Current Grade" value={inputs.currentGrade} onChange={set("currentGrade")} suffix="%" min="0" max="100" />
              <NumInput id="target" label="Target Grade" value={inputs.targetGrade} onChange={set("targetGrade")} suffix="%" min="0" max="100" />
            </div>
            <div>
              <NumInput id="weight" label="Final Exam Weight" value={inputs.finalWeight} onChange={set("finalWeight")} suffix="%" min="1" max="99" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Grades must be 0–100%; final weight must be between 0 and 100%.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Required Score on Final</div>
              <div className={`text-4xl font-bold mb-1 tracking-tight ${valueColor}`}>{result.achieved ? "0" : result.needed > 100 ? ">100" : fmt(result.needed, 1)}%</div>
              <div className="text-sm text-muted-foreground font-medium">{result.impossible ? "Not mathematically possible — consider extra credit" : result.achieved ? "Already achieved — relax and study elsewhere" : "Score this or higher to reach your target"}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Current Grade</span>
                <span className="font-extrabold text-foreground">{fmt(num(inputs.currentGrade), 1)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Final Weight</span>
                <span className="font-extrabold text-primary">{fmt(num(inputs.finalWeight))}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Grade</span>
                <span className="font-extrabold text-foreground">{fmt(num(inputs.targetGrade), 1)}%</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Grade Detail</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Contribution to Final Grade</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v: number) => v + "%"} />
                  <Tooltip formatter={(v: number) => [v.toFixed(1) + "%", ""]} />
                  <ReferenceLine y={num(inputs.targetGrade)} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Target " + fmt(num(inputs.targetGrade), 1) + "%", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Current Grade", value: fmt(num(inputs.currentGrade), 1) + "%" },
                  { label: "Target Grade", value: fmt(num(inputs.targetGrade), 1) + "%" },
                  { label: "Final Weight", value: fmt(num(inputs.finalWeight)) + "%" },
                  { label: "Current Contribution", value: fmt(result.currentContribution, 1) + "%" },
                  { label: "Required on Final", value: result.impossible ? ">100%" : result.achieved ? "0%" : fmt(result.needed, 1) + "%", bold: true },
                  { label: "Outcome", value: result.impossible ? "Not possible" : result.achieved ? "Already achieved" : "Achievable", bold: true },
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
            <h2 className="text-2xl font-bold mb-3">Planning for Your Final Exam</h2>
            <p>Knowing exactly what you need on the final lets you allocate study time where it matters. With the defaults — an 85% current grade, a 90% target, and a final worth 40% — your current grade already contributes 85 × 0.6 = 51 points, so the final must deliver 39 more points: 39 ÷ 0.4 = <strong>97.5%</strong>.</p>
            <h2 className="text-2xl font-bold mb-3">The Weight Is Everything</h2>
            <p>A final worth 40% can swing your grade dramatically; one worth 10% barely moves it. Before panicking over a low score, check the syllabus — a light final may already be locked in, letting you focus your energy on heavier classes.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/final-grade-calculator" />
          <PopularCalculators exclude="/calculator/final-grade-calculator" />
        </div>
      </div>
    </>
  );
};
export default FinalGradeCalculator;
