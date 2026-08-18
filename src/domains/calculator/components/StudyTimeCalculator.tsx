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

const DIFF_MULT: Record<string, number> = { easy: 1, moderate: 2, hard: 3, very_hard: 4 };
const GRADE_MULT: Record<string, number> = { A: 1.2, B: 1.0, C: 0.8, D: 0.6 };

interface Inputs { credits: string; difficulty: string; targetGrade: string; weeks: string; }

interface Result {
  weeklyStudy: number;
  dailyStudy: number;
  totalTerm: number;
  classHoursPerWeek: number;
  ratio: number;
  workload: string;
  chart: { name: string; value: number }[];
}

const DEFAULTS: Inputs = { credits: "12", difficulty: "moderate", targetGrade: "A", weeks: "15" };

function calculate(inputs: Inputs): Result {
  const credits = Math.max(0, parseFloat(inputs.credits) || 0);
  const weeks = Math.max(0, parseFloat(inputs.weeks) || 0);
  const diffMult = DIFF_MULT[inputs.difficulty] ?? 2;
  const gradeMult = GRADE_MULT[inputs.targetGrade] ?? 1;
  const weeklyStudy = credits * diffMult * gradeMult;
  const dailyStudy = weeklyStudy / 7;
  const totalTerm = weeklyStudy * weeks;
  const classHoursPerWeek = credits;
  const ratio = credits > 0 ? weeklyStudy / credits : 0;
  const workload = weeklyStudy > 40 ? "Intense (full-time job equivalent)" : weeklyStudy > 20 ? "Moderate" : "Light";
  return {
    weeklyStudy,
    dailyStudy,
    totalTerm,
    classHoursPerWeek,
    ratio,
    workload,
    chart: [
      { name: "Class Time (hrs/wk)", value: Math.round(classHoursPerWeek * 10) / 10 },
      { name: "Study Time (hrs/wk)", value: Math.round(weeklyStudy * 10) / 10 },
    ],
  };
}

const StudyTimeCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(() => calculate(DEFAULTS));
  const set = (k: keyof Inputs) => (v: string) => setInputs(prev => ({ ...prev, [k]: v }));

  const num = (v: string) => parseFloat(v) || 0;
  const hasErrors = num(inputs.credits) < 0 || num(inputs.weeks) < 0;

  const handleCalculate = () => { if (!hasErrors) setResult(calculate(inputs)); };
  const reset = () => { setInputs(DEFAULTS); setResult(calculate(DEFAULTS)); };
  const handlePrint = () => window.print();

  const rows = [
    { label: "Credit Hours", value: fmt(num(inputs.credits)) },
    { label: "Course Difficulty", value: inputs.difficulty.replace("_", " ").replace(/^\w/, (c) => c.toUpperCase()) },
    { label: "Target Grade", value: inputs.targetGrade },
    { label: "Term Duration (Weeks)", value: fmt(num(inputs.weeks)) },
    { label: "Weekly Study Time", value: fmt(result.weeklyStudy, 1) + " hrs", highlight: true },
    { label: "Daily Study Time", value: fmt(result.dailyStudy, 1) + " hrs" },
    { label: "Total Term Commitment", value: fmt(Math.round(result.totalTerm)) + " hrs", total: true },
  ];

  const faqs = [
    { question: "What is the '2-to-1' rule?", answer: "The Carnegie credit-hour system assumes roughly 2-3 hours of outside study per credit hour. For a 15-credit full-time load, that is 30-45 hours of studying each week on top of class time." },
    { question: "How does course difficulty change study time?", answer: "An introductory elective may need 1 hour per credit, while a senior STEM or intensive language course can need 3-4 hours. This calculator scales from 1x (easy) to 4x (very hard)." },
    { question: "What if I work while studying?", answer: "If you work more than 20 hours a week, consider a reduced credit load. A full-time 12-credit semester plus an 'A' target already implies about 29 hours of study per week — check whether your total commitments are realistic." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "Study Time Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Study Time Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold">Course Details</div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput id="credits" label="Total Credit Hours" value={inputs.credits} onChange={set("credits")} min="0" />
              <NumInput id="weeks" label="Term Duration (Weeks)" value={inputs.weeks} onChange={set("weeks")} min="0" />
            </div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground font-bold mt-1">Goals</div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="difficulty" label="Course Difficulty" value={inputs.difficulty} onChange={set("difficulty")} options={[
                { value: "easy", label: "Easy (Low effort)" },
                { value: "moderate", label: "Moderate (Standard)" },
                { value: "hard", label: "Hard (Technical)" },
                { value: "very_hard", label: "Very Hard (Pre-med/Eng)" },
              ]} />
              <SelectInput id="targetGrade" label="Target Grade" value={inputs.targetGrade} onChange={set("targetGrade")} options={[
                { value: "A", label: "Grade A (90-100%)" },
                { value: "B", label: "Grade B (80-89%)" },
                { value: "C", label: "Grade C (70-79%)" },
                { value: "D", label: "Grade D (Passing)" },
              ]} />
            </div>
            {hasErrors && (
              <p className="text-xs text-red-500 font-medium">Credit hours and term weeks must be zero or greater.</p>
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
              <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Recommended Weekly Study</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.weeklyStudy, 1)} <span className="text-2xl">hours</span></div>
              <div className="text-sm text-muted-foreground font-medium">~{fmt(result.dailyStudy, 1)} hours per day · <span className="font-bold text-foreground">{result.workload}</span></div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Study-to-Class Ratio</span>
                <span className="font-extrabold text-primary">{fmt(result.ratio, 1)}:1</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Term Commitment</span>
                <span className="font-extrabold text-emerald-600">{fmt(Math.round(result.totalTerm))} hrs</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Enrollment</span>
                <span className="font-extrabold text-foreground">{num(inputs.credits) >= 12 ? "Full-Time" : "Part-Time"}</span>
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
              <h3 className="text-sm font-bold text-foreground mb-3">Weekly Time Split (Class vs Study)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={result.chart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, value }: { name: string; value: number }) => `${name}: ${value}h`} labelLine={false}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--secondary))" />
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v, 1) + " hrs/week", ""]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-semibold mb-4">Summary</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Credit Hours", value: fmt(num(inputs.credits)) },
                  { label: "Term Weeks", value: fmt(num(inputs.weeks)) },
                  { label: "Weekly Study", value: fmt(result.weeklyStudy, 1) + " hrs", bold: true },
                  { label: "Daily Study", value: fmt(result.dailyStudy, 1) + " hrs" },
                  { label: "Study-to-Class Ratio", value: fmt(result.ratio, 1) + ":1" },
                  { label: "Total Term Study", value: fmt(Math.round(result.totalTerm)) + " hrs", bold: true },
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
            <p>With the defaults (12 credits, moderate difficulty, A target, 15-week term), the recommendation is <strong>28.8 study hours per week</strong> — about 4.1 hours per day. Over the term that is 432 study hours, a realistic load for a full-time student aiming for top grades.</p>
            <h2 className="text-2xl font-bold mb-3">The Carnegie Credit System</h2>
            <p>One credit hour represents one hour of class plus a minimum of two hours of outside work per week. Because cognitive performance drops after 4-5 hours of intense study, spread the work across the week with techniques like Pomodoro instead of marathon sessions.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/study-time-calculator" />
          <PopularCalculators exclude="/calculator/study-time-calculator" />
        </div>
      </div>
    </>
  );
};
export default StudyTimeCalculator;
