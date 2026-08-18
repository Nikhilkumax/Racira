"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, max }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; max?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} max={max} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
  </div>
);

interface Inputs { readingRaw: string; writingRaw: string; mathRaw: string; }

interface Result {
  readingScaled: number;
  writingScaled: number;
  erw: number;
  math: number;
  total: number;
  percentile: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { readingRaw: "45", writingRaw: "40", mathRaw: "50" };

function calculate(inputs: Inputs): Result {
  const rRaw = Math.min(52, Math.max(0, parseFloat(inputs.readingRaw) || 0));
  const wRaw = Math.min(44, Math.max(0, parseFloat(inputs.writingRaw) || 0));
  const mRaw = Math.min(58, Math.max(0, parseFloat(inputs.mathRaw) || 0));
  // Linear approximation of the paper-SAT conversion tables (Reading 10-40, Writing 10-40, Math 200-800)
  const readingScaled = Math.round(10 + (rRaw / 52) * 30);
  const writingScaled = Math.round(10 + (wRaw / 44) * 30);
  const erw = Math.min(800, Math.max(200, (readingScaled + writingScaled) * 10));
  const math = Math.min(800, Math.max(200, Math.round(200 + (mRaw / 58) * 600)));
  const total = erw + math;
  const percentile = total >= 1550 ? "99th" : total >= 1400 ? "95th" : total >= 1200 ? "75th" : total >= 1050 ? "50th" : "Below 50th";
  return {
    readingScaled,
    writingScaled,
    erw,
    math,
    total,
    percentile,
    chart: [
      { name: "Reading & Writing", value: erw },
      { name: "Mathematics", value: math },
    ],
  };
}

const SATScoreCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.readingRaw) < 0 || num(inputs.readingRaw) > 52 || num(inputs.writingRaw) < 0 || num(inputs.writingRaw) > 44 || num(inputs.mathRaw) < 0 || num(inputs.mathRaw) > 58;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Reading Raw Score (0-52)", value: fmt(num(inputs.readingRaw)) },
    { label: "Writing Raw Score (0-44)", value: fmt(num(inputs.writingRaw)) },
    { label: "Math Raw Score (0-58)", value: fmt(num(inputs.mathRaw)) },
    { label: "Reading Scaled (10-40)", value: fmt(result.readingScaled) },
    { label: "Writing Scaled (10-40)", value: fmt(result.writingScaled) },
    { label: "Reading & Writing Score (200-800)", value: fmt(result.erw), highlight: true },
    { label: "Math Score (200-800)", value: fmt(result.math), highlight: true },
    { label: "Estimated Total SAT Score (400-1600)", value: fmt(result.total), total: true },
  ];

  const faqs = [
    { question: "How is the SAT scored?", answer: "The SAT ranges 400-1600, split into Evidence-Based Reading and Writing (200-800) and Math (200-800). Raw scores (questions correct) convert to scaled scores through equating tables that keep scores comparable across test dates." },
    { question: "What is a good SAT score?", answer: "1200 is above average and competitive for many state schools; 1400+ is strong for selective universities; 1500+ is in the range expected by the most competitive programs. Percentiles depend on the test date." },
    { question: "Is this the digital SAT conversion?", answer: "This calculator uses a linear approximation of the traditional paper-SAT curve. The digital SAT uses adaptive modules, so exact raw-to-scaled conversion depends on which module path you took." },
    { question: "Is there a guessing penalty?", answer: "No — since 2016 the SAT has no penalty for wrong answers. Your raw score is simply the number of correct answers, so guessing is always better than leaving a question blank." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "SAT Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">SAT Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Reading & Writing</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="reading" label="Reading Raw (0-52)" value={inputs.readingRaw} onChange={set("readingRaw")} min="0" max="52" />
              <NumInput id="writing" label="Writing Raw (0-44)" value={inputs.writingRaw} onChange={set("writingRaw")} min="0" max="44" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Mathematics</div>
            <div>
              <NumInput id="math" label="Math Raw (0-58)" value={inputs.mathRaw} onChange={set("mathRaw")} min="0" max="58" />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Raw scores must be within section limits: Reading ≤ 52, Writing ≤ 44, Math ≤ 58.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Estimated Total SAT Score</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.total)}</div>
              <div className="text-sm text-muted-foreground font-medium">Approx. <span className="font-bold text-foreground">{result.percentile}</span> percentile</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reading & Writing</span>
                <span className="font-extrabold text-primary">{fmt(result.erw)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mathematics</span>
                <span className="font-extrabold text-emerald-600">{fmt(result.math)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Percentile</span>
                <span className="font-extrabold text-foreground">{result.percentile}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Score Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Section Scores (out of 800)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 800]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Score"]} />
                  <ReferenceLine y={600} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Competitive threshold", fontSize: 10, fill: "#d97706", position: "insideTopRight" }} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Reading Raw", value: fmt(num(inputs.readingRaw)) + " / 52" },
                  { label: "Writing Raw", value: fmt(num(inputs.writingRaw)) + " / 44" },
                  { label: "Math Raw", value: fmt(num(inputs.mathRaw)) + " / 58" },
                  { label: "Reading & Writing", value: fmt(result.erw), bold: true },
                  { label: "Mathematics", value: fmt(result.math), bold: true },
                  { label: "Total SAT Score", value: fmt(result.total), bold: true },
                  { label: "Percentile", value: result.percentile },
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
            <h2 className="text-2xl font-bold mb-3">Understanding the SAT Curve</h2>
            <p>The SAT uses equating to keep scores comparable across test dates. Your raw score — the number of correct answers, with no guessing penalty — converts through a table into a scaled 200-800 section score. With the defaults (45/52 Reading, 40/44 Writing, 50/58 Math), the estimate is 730 ERW + 717 Math = <strong>1447</strong>, roughly the 95th percentile.</p>
            <h2 className="text-2xl font-bold mb-3">Raw vs Scaled</h2>
            <p>This calculator applies a linear approximation of the traditional conversion tables. The actual curve varies slightly by test form, and the digital SAT's adaptive format makes exact conversion depend on your module path — treat the output as an estimate within a few points.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/sat-score-calculator" />
          <PopularCalculators exclude="/calculator/sat-score-calculator" />
        </div>
      </div>
    </>
  );
};
export default SATScoreCalculator;
