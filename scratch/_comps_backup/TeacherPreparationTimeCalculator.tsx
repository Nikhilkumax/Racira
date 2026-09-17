"use client";
import React, { useState } from "react";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, min, hint }: {
  id: string; label: string; value: string; onChange: (v: string) => void; min?: string; hint?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" min={min} step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

interface Inputs { numClasses: string; prepPerClass: string; numStudents: string; gradingPerStudent: string; }

interface Result {
  prepMinutes: number;
  gradingMinutes: number;
  totalMinutes: number;
  totalHours: number;
  remMinutes: number;
  weeklyHours: number;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { numClasses: "5", prepPerClass: "30", numStudents: "25", gradingPerStudent: "5" };

function calculate(inputs: Inputs): Result {
  const numClasses = Math.max(0, parseFloat(inputs.numClasses) || 0);
  const prepPerClass = Math.max(0, parseFloat(inputs.prepPerClass) || 0);
  const numStudents = Math.max(0, parseFloat(inputs.numStudents) || 0);
  const gradingPerStudent = Math.max(0, parseFloat(inputs.gradingPerStudent) || 0);
  const prepMinutes = numClasses * prepPerClass;
  const gradingMinutes = numStudents * gradingPerStudent;
  const totalMinutes = prepMinutes + gradingMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = Math.round(totalMinutes % 60);
  return {
    prepMinutes,
    gradingMinutes,
    totalMinutes,
    totalHours,
    remMinutes,
    weeklyHours: totalMinutes / 60,
    chart: [
      { name: "Lesson Prep", value: Math.round(prepMinutes) },
      { name: "Grading & Admin", value: Math.round(gradingMinutes) },
    ],
  };
}

const TeacherPreparationTimeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.numClasses) < 0 || num(inputs.prepPerClass) < 0 || num(inputs.numStudents) < 0 || num(inputs.gradingPerStudent) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Number of Classes", value: fmt(num(inputs.numClasses)) },
    { label: "Prep per Class (min)", value: fmt(num(inputs.prepPerClass)) },
    { label: "Lesson Prep Total", value: fmt(Math.round(result.prepMinutes)) + " min", highlight: true },
    { label: "Number of Students", value: fmt(num(inputs.numStudents)) },
    { label: "Grading per Student (min)", value: fmt(num(inputs.gradingPerStudent)) },
    { label: "Grading Total", value: fmt(Math.round(result.gradingMinutes)) + " min", highlight: true },
    { label: "Total Prep Time", value: `${fmt(result.totalHours)}h ${fmt(result.remMinutes)}m`, total: true },
  ];

  const faqs = [
    { question: "What counts as preparation time?", answer: "Lesson planning, material preparation, and setting up activities are prep; grading, entering grades, and parent communication are administration. Both are part of the workload this calculator totals." },
    { question: "How much time do teachers actually spend?", answer: "Studies of US teachers find 11-15 hours per week of work beyond contracted class time, with grading and lesson planning the two largest components. This calculator lets you model your own schedule." },
    { question: "How can I reduce prep time?", answer: "Reuse and iterate lesson plans across sections, batch-grade similar assignments, and share materials with colleagues teaching the same course. Keeping prep and grading records also helps when requesting planning-period adjustments." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Teacher Preparation Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Teacher Preparation Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Lesson Planning</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="numClasses" label="Number of Classes" value={inputs.numClasses} onChange={set("numClasses")} min="0" />
              <NumInput id="prepPerClass" label="Prep per Class (min)" value={inputs.prepPerClass} onChange={set("prepPerClass")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Grading & Admin</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="numStudents" label="Number of Students" value={inputs.numStudents} onChange={set("numStudents")} min="0" />
              <NumInput id="gradingPerStudent" label="Grading per Student (min)" value={inputs.gradingPerStudent} onChange={set("gradingPerStudent")} min="0" />
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Total Weekly Prep Time</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.totalHours)}h {fmt(result.remMinutes)}m</div>
              <div className="text-sm text-muted-foreground font-medium">≈ {fmt(result.weeklyHours, 1)} hours per week</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lesson Prep</span>
                <span className="font-extrabold text-primary">{fmt(Math.round(result.prepMinutes))} min</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Grading & Admin</span>
                <span className="font-extrabold text-emerald-600">{fmt(Math.round(result.gradingMinutes))} min</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Day (5-day week)</span>
                <span className="font-extrabold text-foreground">{fmt(result.totalMinutes / 5, 0)} min</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Prep vs Grading Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${value} min`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v) + " min", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Classes", value: fmt(num(inputs.numClasses)) },
                  { label: "Students", value: fmt(num(inputs.numStudents)) },
                  { label: "Lesson Prep", value: fmt(Math.round(result.prepMinutes)) + " min", bold: true },
                  { label: "Grading & Admin", value: fmt(Math.round(result.gradingMinutes)) + " min", bold: true },
                  { label: "Total Minutes", value: fmt(Math.round(result.totalMinutes)) + " min" },
                  { label: "Total Time", value: `${fmt(result.totalHours)}h ${fmt(result.remMinutes)}m`, bold: true },
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
            <p>With the defaults (5 classes × 30 min prep, 25 students × 5 min grading), the result is <strong>4 hours 35 minutes per week</strong> — 150 minutes of lesson prep and 125 minutes of grading. Spread across a 5-day week that is about 55 minutes per day beyond class time.</p>
            <h2 className="text-2xl font-bold mb-3">Beyond the Clock</h2>
            <p>US teacher surveys consistently find 11-15 hours of weekly work beyond contracted classroom time. If your inputs push the total above that, it may be worth reviewing planning periods, batching grading, or sharing prep across sections.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/teacher-preparation-time-calculator" />
          <PopularCalculators exclude="/calculator/teacher-preparation-time-calculator" />
        </div>
      </div>
    </>
  );
};
export default TeacherPreparationTimeCalculator;
