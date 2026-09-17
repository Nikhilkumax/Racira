"use client";
import React, { useState } from "react";
import { RotateCcw, Printer, Plus, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const GRADE_VALUES: Record<string, number> = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };

interface Course { id: number; name: string; grade: string; credits: string; }

interface Inputs {
  currentGpa: string;
  currentCredits: string;
  courses: Course[];
}

interface CourseResult {
  name: string;
  grade: string;
  credits: number;
  points: number;
}

interface Result {
  semesterGpa: number;
  newCredits: number;
  newPoints: number;
  finalGpa: number;
  totalCredits: number;
  courses: CourseResult[];
  chartData: { name: string; points: number }[];
}

const DEFAULTS: Inputs = { currentGpa: "3.5", currentCredits: "60", courses: [{ id: 1, name: "Calculus II", grade: "A", credits: "3" }] };
let nextId = 2;

function calculate(inputs: Inputs): Result {
  const curGpa = Math.min(4, Math.max(0, parseFloat(inputs.currentGpa) || 0));
  const curCredits = Math.max(0, parseFloat(inputs.currentCredits) || 0);
  const courses = inputs.courses.map(c => {
    const credits = Math.max(0, parseFloat(c.credits) || 0);
    const points = (GRADE_VALUES[c.grade] ?? 0) * credits;
    return { name: c.name || "Course", grade: c.grade, credits, points };
  });
  const newCredits = courses.reduce((s, c) => s + c.credits, 0);
  const newPoints = courses.reduce((s, c) => s + c.points, 0);
  const semesterGpa = newCredits > 0 ? newPoints / newCredits : 0;
  const totalCredits = curCredits + newCredits;
  const finalGpa = totalCredits > 0 ? (curGpa * curCredits + newPoints) / totalCredits : 0;
  const chartData = courses.map(c => ({ name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name, points: Math.round(c.points * 100) / 100 }));
  return { semesterGpa, newCredits, newPoints, finalGpa, totalCredits, courses, chartData };
}

const CumulativeGPACalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: "currentGpa" | "currentCredits") => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.currentGpa) < 0 || num(inputs.currentGpa) > 4 || num(inputs.currentCredits) < 0;

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

  const rows = [
    { label: "Previous Cumulative GPA", value: fmt(num(inputs.currentGpa), 3) },
    { label: "Previous Credits Completed", value: fmt(num(inputs.currentCredits)) },
    ...result.courses.map(c => ({ label: c.name + " (" + c.grade + ")", value: c.credits + " cr · " + fmt(c.points, 1) + " pts" })),
    { label: "This Semester GPA", value: result.semesterGpa.toFixed(2), highlight: true },
    { label: "New Credits Earned", value: fmt(result.newCredits), total: true },
    { label: "New Cumulative GPA", value: result.finalGpa.toFixed(3), highlight: true },
  ];

  const gpaTone = result.finalGpa >= 3.5 ? "text-emerald-600" : result.finalGpa >= 3.0 ? "text-primary" : result.finalGpa >= 2.0 ? "text-amber-600" : "text-red-600";

  const faqs = [
    { question: "What is a cumulative GPA?", answer: "Your cumulative GPA is the average of every grade you have earned, weighted by credit hours, across your entire academic record. It is the number that appears on transcripts and matters for scholarships, honors, and graduate admissions." },
    { question: "How do credit hours affect GPA?", answer: "Courses with more credits carry more weight. An A in a 4-credit lab moves your GPA more than an A in a 1-credit elective. That is why improving performance in high-credit courses is the fastest way to raise a cumulative GPA." },
    { question: "Why is my GPA hard to move?", answer: "GPA inertia: the more credits you have completed, the smaller the effect of any single semester. With 60 credits at a 3.5 GPA, a perfect 4.0 semester of 15 credits would only lift the cumulative GPA to about 3.60." },
    { question: "Can I use this for a weighted (5.0) scale?", answer: "The calculator uses the standard unweighted 4.0 scale. For AP, IB, or honors weight, convert each grade to the numeric value your school uses (for example enter a 5.0-weighted A as a 5.0) by selecting the closest letter or manually adjusting the formula." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Cumulative GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cumulative GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label htmlFor="cur-gpa" className="text-sm font-medium mb-1">Current Cumulative GPA</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input id="cur-gpa" type="number" min="0" max="4" step="0.01" value={inputs.currentGpa} onChange={(e) => set("currentGpa")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                </div>
              </div>
              <div className="flex flex-col">
                <label htmlFor="cur-credits" className="text-sm font-medium mb-1">Credits Completed</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input id="cur-credits" type="number" min="0" step="any" value={inputs.currentCredits} onChange={(e) => set("currentCredits")(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
                </div>
              </div>
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">New Semester Courses</div>
            <div className="flex flex-col gap-2">
              {inputs.courses.map(c => (
                <div key={c.id} className="grid grid-cols-[1fr_88px_70px_36px] gap-2 items-center">
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
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">GPA must be between 0 and 4.0; credits must be ≥ 0.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">New Cumulative GPA</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{result.finalGpa.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground font-medium">Across <span className="font-bold text-foreground">{fmt(result.totalCredits)}</span> total credits</div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">This Semester GPA</span>
                <span className="font-extrabold text-foreground">{result.semesterGpa.toFixed(2)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">New Credits</span>
                <span className="font-extrabold text-primary">{fmt(result.newCredits)}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Standing</span>
                <span className={`font-extrabold ${gpaTone}`}>{result.finalGpa >= 3.5 ? "Honors" : result.finalGpa >= 3.0 ? "Good" : result.finalGpa >= 2.0 ? "Satisfactory" : "At Risk"}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Detail</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Value</th>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Grade Points by Course</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [v.toFixed(2), "Grade Points"]} />
                  <Bar dataKey="points" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Previous GPA", value: fmt(num(inputs.currentGpa), 3) },
                  { label: "Previous Credits", value: fmt(num(inputs.currentCredits)) },
                  { label: "Semester GPA", value: result.semesterGpa.toFixed(2) },
                  { label: "New Credits", value: fmt(result.newCredits) },
                  { label: "Total Credits", value: fmt(result.totalCredits) },
                  { label: "New Cumulative GPA", value: result.finalGpa.toFixed(3), bold: true },
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
            <h2 className="text-2xl font-bold mb-3">Mastering Your Cumulative GPA</h2>
            <p>A cumulative GPA is the running weighted average of your entire academic record. With the defaults — a 3.5 GPA across 60 credits — adding a 3-credit A semester gives 12 new grade points, producing a new cumulative GPA of (3.5 × 60 + 12) ÷ 63 = 3.524.</p>
            <h2 className="text-2xl font-bold mb-3">GPA Inertia</h2>
            <p>The more credits you have completed, the less any single semester moves your average. A perfect 4.0 semester of 15 credits only lifts a 60-credit, 3.0 GPA to about 3.20. This is why strategic effort matters: prioritize the highest-credit courses, where each grade point carries the most weight.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cumulative-gpa-calculator" />
          <PopularCalculators exclude="/calculator/cumulative-gpa-calculator" />
        </div>
      </div>
    </>
  );
};
export default CumulativeGPACalculator;
