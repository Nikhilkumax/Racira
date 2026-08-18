"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, Plus, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const PIE_COLORS = ["hsl(var(--primary))", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

interface Category { id: number; name: string; weight: string; grade: string; }

interface Inputs { categories: Category[]; }

interface CategoryRow { name: string; weight: number; grade: number; points: number; }

interface Result {
  finalGrade: number;
  totalWeight: number;
  totalPoints: number;
  rows: CategoryRow[];
  pie: { name: string; value: number; pct: number; color: string }[];
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Homework", weight: "20", grade: "95" },
  { id: 2, name: "Quizzes", weight: "30", grade: "88" },
  { id: 3, name: "Final Exam", weight: "50", grade: "82" },
];

const DEFAULTS: Inputs = { categories: DEFAULT_CATEGORIES };
let nextId = 10;

function calculate(inputs: Inputs): Result {
  const rows = inputs.categories.map(c => {
    const weight = Math.max(0, parseFloat(c.weight) || 0);
    const grade = Math.max(0, parseFloat(c.grade) || 0);
    return { name: c.name || "Category", weight, grade, points: grade * weight / 100 };
  });
  const totalWeight = rows.reduce((s, r) => s + r.weight, 0);
  const totalPoints = rows.reduce((s, r) => s + r.points, 0);
  const finalGrade = totalWeight > 0 ? (totalPoints / totalWeight) * 100 : 0;
  const parts = rows.map((r, i) => ({ name: r.name, value: r.weight, pct: 0, color: PIE_COLORS[i % PIE_COLORS.length] }));
  const valid = parts.filter(p => p.value > 0);
  const sum = valid.reduce((s, p) => s + p.value, 0);
  valid.forEach(p => { p.pct = sum > 0 ? Math.round((p.value / sum) * 1000) / 10 : 0; });
  let pctSum = valid.reduce((s, p) => s + p.pct, 0);
  if (sum > 0 && pctSum !== 100 && valid.length) {
    const diff = Math.round((100 - pctSum) * 10) / 10;
    let maxIdx = 0;
    for (let i = 1; i < valid.length; i++) if (valid[i].pct > valid[maxIdx].pct) maxIdx = i;
    valid[maxIdx].pct = Math.round((valid[maxIdx].pct + diff) * 10) / 10;
    pctSum += diff;
  }
  return { finalGrade, totalWeight, totalPoints, rows, pie: valid };
}

const WeightedGradeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));

  const addCategory = () => {
    nextId++;
    setInputs(prev => ({ ...prev, categories: [...prev.categories, { id: nextId, name: "New Category", weight: "0", grade: "0" }] }));
  };
  const removeCategory = (id: number) => {
    if (inputs.categories.length <= 1) return;
    setInputs(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
  };
  const updateCategory = (id: number, field: keyof Category, value: string) => {
    setInputs(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, [field]: value } : c) }));
  };

  const handleCalculate = () => setResult(calculate(inputs));
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const letter = (g: number) => g >= 90 ? "A" : g >= 80 ? "B" : g >= 70 ? "C" : g >= 60 ? "D" : "F";
  const weightsSum100 = Math.abs(result.totalWeight - 100) < 0.01;

  type Row = { label: string; value: string; highlight?: boolean; total?: boolean };
  const rows: Row[] = [
    ...result.rows.map(r => ({ label: r.name, value: r.weight + "% weight · " + fmt(r.grade, 1) + "% → " + fmt(r.points, 1) + " pts" })),
    { label: "Total Weight", value: fmt(result.totalWeight) + "%" + (weightsSum100 ? "" : " (normalized)"), total: true },
    { label: "Overall Weighted Grade", value: fmt(result.finalGrade, 2) + "% (" + letter(result.finalGrade) + ")", highlight: true },
  ];

  const faqs = [
    { question: "What is a weighted grade?", answer: "A weighted grade multiplies each category's average by its share of the course (its weight) and sums the results. A final worth 50% moves your grade far more than homework worth 20%." },
    { question: "Do the weights have to sum to 100%?", answer: "Normally yes, but mid-semester your completed categories often total less than 100%. The calculator normalizes: it divides by the total weight you entered, so it shows your current standing on completed work." },
    { question: "How do I see my grade before the final?", answer: "Enter only the categories you have completed. The calculator divides by that partial total weight, giving your running average on the work done so far." },
    { question: "What grade contribution does each category make?", answer: "Contribution = grade × weight / 100. With the defaults: Homework 95×20% = 19.0, Quizzes 88×30% = 26.4, Final 82×50% = 41.0 — summing to an 86.4% course grade." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Weighted Grade Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weighted Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Grade Categories</div>
            <div className="grid grid-cols-[1fr_76px_76px_36px] gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              <span>Category</span><span className="text-center">Weight %</span><span className="text-center">Grade %</span><span></span>
            </div>
            <div className="flex flex-col gap-2">
              {inputs.categories.map(c => (
                <div key={c.id} className="grid grid-cols-[1fr_76px_76px_36px] gap-2 items-center">
                  <input type="text" value={c.name} onChange={(e) => updateCategory(c.id, "name", e.target.value)} className="h-10 w-full px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" placeholder="Category" />
                  <input type="number" min="0" max="100" step="any" value={c.weight} onChange={(e) => updateCategory(c.id, "weight", e.target.value)} className="h-10 w-full px-2 text-sm text-center rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                  <input type="number" min="0" max="100" step="any" value={c.grade} onChange={(e) => updateCategory(c.id, "grade", e.target.value)} className="h-10 w-full px-2 text-sm text-center rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-bold" />
                  <button type="button" onClick={() => removeCategory(c.id)} disabled={inputs.categories.length <= 1} aria-label="Remove category" className="h-10 w-9 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addCategory} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add Category</button>
            {!weightsSum100 && (
              <p className="text-xs text-amber-600 font-medium bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-md">Weights sum to {fmt(result.totalWeight)}% — result is normalized to completed work.</p>
            )}
            <div className="flex gap-2.5 mt-1">
              <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground active:scale-[0.98]">Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none"><Printer className="h-3.5 w-3.5" /> Print</button>
              </div>
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Overall Weighted Grade</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.finalGrade, 2)}%</div>
              <div className="text-sm text-muted-foreground font-medium">Letter grade: <span className="font-bold text-foreground">{letter(result.finalGrade)}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weighted Points</span>
                <span className="font-extrabold text-foreground">{fmt(result.totalPoints, 1)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Weight</span>
                <span className="font-extrabold text-primary">{fmt(result.totalWeight)}%</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Letter Grade</span>
                <span className="font-extrabold text-emerald-600">{letter(result.finalGrade)}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Category</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Contribution</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Category Weights</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.pie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {result.pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number, n: string) => [v + "%", n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {result.pie.map((p) => (
                  <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color }} />{p.name} — {p.pct.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {([
                  ...result.rows.map(r => ({ label: r.name, value: r.weight + "% · " + fmt(r.points, 1) + " pts" })),
                  { label: "Total Weight", value: fmt(result.totalWeight) + "%" },
                  { label: "Overall Grade", value: fmt(result.finalGrade, 2) + "%", bold: true },
                  { label: "Letter Grade", value: letter(result.finalGrade), bold: true },
                ] as { label: string; value: string; bold?: boolean }[]).map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">Understanding Weighted Grading</h2>
            <p>Most courses weight their components so major assessments carry more weight than routine work. The math: multiply each category's average by its weight as a decimal and add. With the defaults — Homework 95% × 20%, Quizzes 88% × 30%, Final 82% × 50% — the course grade is 19.0 + 26.4 + 41.0 = <strong>86.4%</strong> (a B).</p>
            <h2 className="text-2xl font-bold mb-3">Mid-Semester Standing</h2>
            <p>If you have not taken the final, enter only completed categories — the calculator normalizes by the partial total weight, showing your current running average. That is the number to watch when deciding where to invest study time.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weighted-grade-calculator" />
          <PopularCalculators exclude="/calculator/weighted-grade-calculator" />
        </div>
      </div>
    </>
  );
};
export default WeightedGradeCalculator;
