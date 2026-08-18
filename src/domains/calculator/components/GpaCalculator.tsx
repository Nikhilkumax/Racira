"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const GRADE_VALUES: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "D-": 0.7, "F": 0.0 };

interface Course { id: number; name: string; grade: string; credits: string; }

interface Inputs {
  mode: "semester" | "cumulative" | "needed";
  courses: Course[];
  currentGpa: string;
  currentCredits: string;
  targetGpa: string;
  remainingCredits: string;
}

interface CourseRow { name: string; grade: string; credits: number; points: number; }

interface Result {
  label: string;
  value: number;
  sub: string;
  stat1: { label: string; value: string };
  stat2: { label: string; value: string };
  stat3: { label: string; value: string };
  rows: { label: string; value: string; highlight?: boolean; total?: boolean }[];
  chart: { name: string; value: number }[];
  chartTitle: string;
  summary: { label: string; value: string; bold?: boolean }[];
}

const DEFAULT_COURSES: Course[] = [
  { id: 1, name: "Mathematics", grade: "A", credits: "3" },
  { id: 2, name: "English Literature", grade: "B+", credits: "3" },
  { id: 3, name: "Physics", grade: "B", credits: "4" },
];

const DEFAULTS: Inputs = { mode: "semester", courses: DEFAULT_COURSES, currentGpa: "3.2", currentCredits: "60", targetGpa: "3.5", remainingCredits: "30" };
let nextId = 10;

function courseRows(courses: Course[]): { rows: CourseRow[]; credits: number; points: number } {
  const rows = courses.map(c => {
    const credits = Math.max(0, parseFloat(c.credits) || 0);
    return { name: c.name || "Course", grade: c.grade, credits, points: (GRADE_VALUES[c.grade] ?? 0) * credits };
  });
  return { rows, credits: rows.reduce((s, r) => s + r.credits, 0), points: rows.reduce((s, r) => s + r.points, 0) };
}

function calculate(inputs: Inputs): Result {
  const { rows, credits, points } = courseRows(inputs.courses);
  const curGpa = Math.min(4, Math.max(0, parseFloat(inputs.currentGpa) || 0));
  const curCredits = Math.max(0, parseFloat(inputs.currentCredits) || 0);
  const target = Math.min(4, Math.max(0, parseFloat(inputs.targetGpa) || 0));
  const remaining = Math.max(0, parseFloat(inputs.remainingCredits) || 0);

  if (inputs.mode === "semester") {
    const gpa = credits > 0 ? points / credits : 0;
    return {
      label: "Semester GPA",
      value: gpa,
      sub: credits + " credit hours · " + fmt(points, 1) + " grade points",
      stat1: { label: "Semester GPA", value: gpa.toFixed(2) },
      stat2: { label: "Total Credits", value: fmt(credits) },
      stat3: { label: "Grade Points", value: fmt(points, 1) },
      rows: [
        ...rows.map(r => ({ label: r.name + " (" + r.grade + ")", value: r.credits + " cr · " + fmt(r.points, 1) + " pts" })),
        { label: "Total Credits", value: fmt(credits), total: true },
        { label: "Grade Points", value: fmt(points, 1), total: true },
        { label: "Semester GPA", value: gpa.toFixed(2), highlight: true },
      ],
      chart: rows.map(r => ({ name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name, value: Math.round(r.points * 100) / 100 })),
      chartTitle: "Grade Points by Course",
      summary: [
        { label: "Semester GPA", value: gpa.toFixed(2), bold: true },
        { label: "Total Credits", value: fmt(credits) },
        { label: "Grade Points", value: fmt(points, 1) },
        { label: "Courses", value: fmt(rows.length) },
        { label: "Best Grade", value: rows.length ? rows.reduce((a, b) => (GRADE_VALUES[a.grade] ?? 0) > (GRADE_VALUES[b.grade] ?? 0) ? a : b).grade : "—" },
      ],
    };
  }

  if (inputs.mode === "cumulative") {
    const totalCredits = curCredits + credits;
    const cumGpa = totalCredits > 0 ? (curGpa * curCredits + points) / totalCredits : 0;
    const semGpa = credits > 0 ? points / credits : 0;
    return {
      label: "New Cumulative GPA",
      value: cumGpa,
      sub: "Across " + fmt(totalCredits) + " total credits",
      stat1: { label: "Cumulative GPA", value: cumGpa.toFixed(2) },
      stat2: { label: "Semester GPA", value: semGpa.toFixed(2) },
      stat3: { label: "Total Credits", value: fmt(totalCredits) },
      rows: [
        { label: "Previous Cumulative GPA", value: curGpa.toFixed(2) },
        { label: "Previous Credits", value: fmt(curCredits) },
        ...rows.map(r => ({ label: r.name + " (" + r.grade + ")", value: r.credits + " cr · " + fmt(r.points, 1) + " pts" })),
        { label: "This Semester GPA", value: semGpa.toFixed(2), highlight: true },
        { label: "Total Credits", value: fmt(totalCredits), total: true },
        { label: "New Cumulative GPA", value: cumGpa.toFixed(3), highlight: true },
      ],
      chart: rows.map(r => ({ name: r.name.length > 12 ? r.name.slice(0, 12) + "…" : r.name, value: Math.round(r.points * 100) / 100 })),
      chartTitle: "Grade Points by Course",
      summary: [
        { label: "Previous GPA", value: curGpa.toFixed(2) },
        { label: "Previous Credits", value: fmt(curCredits) },
        { label: "Semester GPA", value: semGpa.toFixed(2) },
        { label: "New Credits", value: fmt(credits) },
        { label: "Total Credits", value: fmt(totalCredits) },
        { label: "New Cumulative GPA", value: cumGpa.toFixed(3), bold: true },
      ],
    };
  }

  const totalCredits = curCredits + remaining;
  const needed = remaining > 0 ? (target * totalCredits - curGpa * curCredits) / remaining : 0;
  const achievable = needed <= 4.0;
  return {
    label: "Required GPA in Remaining Credits",
    value: needed,
    sub: achievable ? "Achievable within the 4.0 scale" : "Target exceeds the 4.0 maximum",
    stat1: { label: "Required GPA", value: needed > 4.0 ? ">4.0" : needed < 0 ? "N/A" : needed.toFixed(2) },
    stat2: { label: "Target Cumulative GPA", value: target.toFixed(2) },
    stat3: { label: "Remaining Credits", value: fmt(remaining) },
    rows: [
      { label: "Current Cumulative GPA", value: curGpa.toFixed(2) },
      { label: "Completed Credits", value: fmt(curCredits) },
      { label: "Target Cumulative GPA", value: target.toFixed(2) },
      { label: "Remaining Credits", value: fmt(remaining) },
      { label: "Total Credits at Graduation", value: fmt(totalCredits), total: true },
      { label: "Required GPA (remaining)", value: needed > 4.0 ? "Not achievable (>4.0)" : needed < 0 ? "Already achieved" : needed.toFixed(2), highlight: true },
    ],
    chart: [
      { name: "Current GPA", value: Math.round(curGpa * 100) / 100 },
      { name: "Required GPA", value: Math.min(4, Math.round(needed * 100) / 100) },
      { name: "4.0 Max", value: 4.0 },
    ],
    chartTitle: "Current vs Required GPA",
    summary: [
      { label: "Current GPA", value: curGpa.toFixed(2) },
      { label: "Completed Credits", value: fmt(curCredits) },
      { label: "Target GPA", value: target.toFixed(2) },
      { label: "Remaining Credits", value: fmt(remaining) },
      { label: "Required GPA", value: needed > 4.0 ? ">4.0 (not achievable)" : needed.toFixed(2), bold: true },
      { label: "Achievable?", value: achievable ? "Yes" : "No — lower the target", bold: true },
    ],
  };
}

const GpaCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const setMode = (m: Inputs["mode"]) => { setInputs(prev => ({ ...prev, mode: m })); setResult(calculate({ ...inputs, mode: m })); };
  const setNum = (k: "currentGpa" | "currentCredits" | "targetGpa" | "remainingCredits") => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.currentGpa) < 0 || num(inputs.currentGpa) > 4 || num(inputs.currentCredits) < 0 || num(inputs.targetGpa) < 0 || num(inputs.targetGpa) > 4 || num(inputs.remainingCredits) < 0;

  const addCourse = () => {
    nextId++;
    setInputs(prev => ({ ...prev, courses: [...prev.courses, { id: nextId, name: "New Course", grade: "B", credits: "3" }] }));
  };
  const removeCourse = (id: number) => {
    if (inputs.courses.length <= 1) return;
    setInputs(prev => ({ ...prev, courses: prev.courses.filter(c => c.id !== id) }));
  };
  const updateCourse = (id: number, field: keyof Course, value: string) => {
    setInputs(prev => ({ ...prev, courses: prev.courses.map(c => c.id === id ? { ...c, [field]: value } : c) }));
  };

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const valueColor = inputs.mode === "needed" ? (result.value <= 4.0 ? "text-primary" : "text-red-500") : "text-primary";

  const faqs = [
    { question: "What is GPA and how is it calculated?", answer: "GPA is the average of your grade points weighted by credit hours: sum of (grade points × credits) divided by total credits. An A (4.0) in 3 credits contributes 12 points; a B (3.0) in 4 credits contributes 12 points." },
    { question: "What is the difference between semester and cumulative GPA?", answer: "Semester GPA covers one term; cumulative GPA averages every course since enrollment. Employers and graduate schools look at the cumulative number, though a rising semester trend is also a strong signal." },
    { question: "How do I calculate the GPA I need to reach a target?", answer: "Required GPA = (Target × Total Credits − Current GPA × Completed Credits) ÷ Remaining Credits. With the defaults — 3.2 over 60 credits, targeting 3.5 with 30 credits left — the requirement is 4.10, which exceeds the 4.0 cap, so the target is not achievable." },
    { question: "What is a weighted GPA?", answer: "Weighted GPA adds bonus points for honors, AP, or IB courses (typically +0.5 or +1.0). This calculator uses the standard unweighted 4.0 scale; to model weighting, enter the weighted numeric value of each grade." },
    { question: "What GPA is needed for honors?", answer: "Common thresholds: Cum Laude 3.5, Magna Cum Laude 3.7, Summa Cum Laude 3.9, Dean's List often 3.5. Requirements vary by institution, so check your school's catalog." },
    { question: "How much can a semester raise my GPA?", answer: "The larger your credit history, the smaller the effect. One 4.0 semester of 15 credits lifts a 60-credit 3.0 GPA to about 3.20; it lifts a 30-credit 3.0 GPA to about 3.33. High-credit courses are the strongest lever." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="flex rounded-lg border border-input overflow-hidden">
              {(["semester", "cumulative", "needed"] as const).map(m => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${inputs.mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>
                  {m === "semester" ? "Semester" : m === "cumulative" ? "Cumulative" : "Needed GPA"}
                </button>
              ))}
            </div>

            {(inputs.mode === "cumulative" || inputs.mode === "needed") && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="cur-gpa" className="text-sm font-medium mb-1">Current Cumulative GPA</label>
                  <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input id="cur-gpa" type="number" min="0" max="4" step="0.01" value={inputs.currentGpa} onChange={(e) => setNum("currentGpa")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cur-credits" className="text-sm font-medium mb-1">Credits Completed</label>
                  <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input id="cur-credits" type="number" min="0" step="any" value={inputs.currentCredits} onChange={(e) => setNum("currentCredits")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                  </div>
                </div>
              </div>
            )}

            {inputs.mode === "needed" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label htmlFor="target" className="text-sm font-medium mb-1">Target Cumulative GPA</label>
                  <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input id="target" type="number" min="0" max="4" step="0.01" value={inputs.targetGpa} onChange={(e) => setNum("targetGpa")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="remaining" className="text-sm font-medium mb-1">Remaining Credits</label>
                  <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <input id="remaining" type="number" min="0" step="any" value={inputs.remainingCredits} onChange={(e) => setNum("remainingCredits")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                  </div>
                </div>
              </div>
            )}

            {inputs.mode !== "needed" && (
              <>
                <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Courses</div>
                <div className="flex flex-col gap-2">
                  {inputs.courses.map(c => (
                    <div key={c.id} className="grid grid-cols-[1fr_76px_64px_36px] gap-2 items-center">
                      <input type="text" value={c.name} onChange={(e) => updateCourse(c.id, "name", e.target.value)} className="h-10 w-full px-3 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" placeholder="Course name" />
                      <select value={c.grade} onChange={(e) => updateCourse(c.id, "grade", e.target.value)} className="h-10 w-full px-2 text-sm rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground font-bold cursor-pointer">
                        {Object.keys(GRADE_VALUES).map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <input type="number" min="0.5" step="0.5" value={c.credits} onChange={(e) => updateCourse(c.id, "credits", e.target.value)} className="h-10 w-full px-2 text-sm text-center rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none text-foreground" />
                      <button type="button" onClick={() => removeCourse(c.id)} disabled={inputs.courses.length <= 1} aria-label="Remove course" className="h-10 w-9 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCourse} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><Plus className="h-4 w-4" /> Add Course</button>
              </>
            )}

            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">GPA values must be between 0 and 4.0; credits must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{result.label}</div>
              <div className={`text-4xl font-bold mb-1 tracking-tight ${valueColor}`}>{result.value > 4.0 ? ">4.0" : result.value < 0 ? "N/A" : result.value.toFixed(inputs.mode === "cumulative" ? 3 : 2)}</div>
              <div className="text-sm text-muted-foreground font-medium">{result.sub}</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{result.stat1.label}</span>
                <span className="font-extrabold text-foreground">{result.stat1.value}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{result.stat2.label}</span>
                <span className="font-extrabold text-primary">{result.stat2.value}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{result.stat3.label}</span>
                <span className="font-extrabold text-foreground">{result.stat3.value}</span>
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
                  {result.rows.map((r) => (
                    <tr key={r.label} className={`hover:bg-secondary/20 transition-colors ${r.total ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.label}</td>
                      <td className={`p-2.5 pr-3 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">{result.chartTitle}</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chart} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={inputs.mode === "needed" ? [0, 5] : undefined} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(2), "GPA / Points"]} />
                  <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="4 4" />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {result.summary.map((s) => (
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
            <h2 className="text-2xl font-bold mb-3">What Is a GPA Calculator?</h2>
            <p>This GPA calculator converts letter grades and credit hours into a GPA on the standard 4.0 scale with three modes. <strong>Semester GPA</strong> averages one term's courses — the defaults (A, B+, B across 10 credits) produce a 3.39 GPA. <strong>Cumulative GPA</strong> merges a new semester into your existing record. <strong>Needed GPA</strong> works backwards from a target to show exactly what average you need in the credits you have left.</p>
            <h2 className="text-2xl font-bold mb-3">How GPA Is Calculated</h2>
            <p><strong>GPA = Σ(Grade Points × Credit Hours) ÷ Σ(Credit Hours)</strong>. Example: A (4.0) × 3 + B+ (3.3) × 3 + B (3.0) × 4 = 33.9 points ÷ 10 credits = 3.39. In Needed mode the formula is inverted: Required = (Target × Total − Current × Completed) ÷ Remaining.</p>
            <h2 className="text-2xl font-bold mb-3">Example: The 4.4 Problem</h2>
            <p>A student with a 3.2 GPA over 60 credits targeting 3.5 with 30 credits left needs (3.5 × 90 − 3.2 × 60) ÷ 30 = 4.10 — above the 4.0 maximum. The calculator flags this as unachievable so the student can reset expectations, for example to a 3.35 target, which requires (3.35 × 90 − 192) ÷ 30 = 3.62.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gpa-calculator" />
          <PopularCalculators exclude="/calculator/gpa-calculator" />
        </div>
      </div>
    </>
  );
};
export default GpaCalculator;
