"use client";
import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";

// 1. TypeScript interfaces — no 'any'
interface CourseRow {
  name: string;
  grade: string;
  honors: boolean;
}

interface GpaInputs {
  rows: CourseRow[];
}

interface ChartPoint {
  name: string;
  points: number;
}

interface GpaResults {
  cappedGpa: number;
  uncappedGpa: number;
  basePoints: number;
  bonusPoints: number;
  cappedBonus: number;
  units: number;
  honorsSemesters: number;
  chartData: ChartPoint[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summaryStats: { label: string; value: string }[];
}

// 2. Pure calculation function — zero React, fully typed
const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };

function calcGpa(i: GpaInputs): GpaResults {
  const units = i.rows.length;
  let basePoints = 0;
  let honorsSemesters = 0;
  for (const r of i.rows) {
    basePoints += GRADE_POINTS[r.grade] ?? 0;
    if (r.honors) honorsSemesters += 1;
  }
  const cappedBonus = Math.min(honorsSemesters, 8);
  const uncappedGpa = units > 0 ? (basePoints + honorsSemesters) / units : 0;
  const cappedGpa = units > 0 ? (basePoints + cappedBonus) / units : 0;

  const chartData: ChartPoint[] = i.rows.map((r) => ({
    name: r.name.length > 12 ? r.name.slice(0, 11) + "…" : r.name,
    points: (GRADE_POINTS[r.grade] ?? 0) + (r.honors ? 1 : 0),
  }));

  const breakdown = [
    { label: "Courses (a-g Semesters)", value: `${units}` },
    { label: "Grade Points (Base)", value: `${basePoints.toFixed(1)}` },
    { label: "Honors/AP Bonus Points", value: `${honorsSemesters}` },
    { label: "Bonus Points Used (Capped at 8)", value: `${cappedBonus}`, highlight: true },
    { label: "Uncapped GPA", value: uncappedGpa.toFixed(3) },
    { label: "UC Capped GPA (Max 8 Bonus)", value: cappedGpa.toFixed(3), isTotal: true },
  ];

  const summaryStats = [
    { label: "UC Capped GPA", value: cappedGpa.toFixed(3) },
    { label: "Uncapped GPA", value: uncappedGpa.toFixed(3) },
    { label: "Honors Semesters", value: `${honorsSemesters}` },
    { label: "Honors Points Used", value: `${cappedBonus}` },
    { label: "Total Units", value: `${units}` },
    { label: "Base Grade Points", value: `${basePoints.toFixed(1)}` },
    { label: "Bonus Points", value: `${honorsSemesters}` },
    { label: "Courses Entered", value: `${units}` },
  ];

  return { cappedGpa, uncappedGpa, basePoints, bonusPoints: honorsSemesters, cappedBonus, units, honorsSemesters, chartData, breakdown, summaryStats };
}

// 3. DEFAULTS object — realistic values
const DEFAULT_ROWS: CourseRow[] = [
  { name: "AP English", grade: "A", honors: true },
  { name: "Algebra II", grade: "B", honors: false },
  { name: "AP Biology", grade: "A", honors: true },
  { name: "Spanish III", grade: "A", honors: false },
  { name: "US History", grade: "B", honors: false },
];

// 4. Component
export default function UcGpaCalculator() {
  const [rows, setRows] = useState<CourseRow[]>(DEFAULT_ROWS);
  const [result, setResult] = useState<GpaResults>(() => calcGpa({ rows: DEFAULT_ROWS }));

  useEffect(() => {
    setResult(calcGpa({ rows: DEFAULT_ROWS }));
  }, []);

  const updateRow = (i: number, field: keyof CourseRow, value: string | boolean) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  };

  const calculate = () => setResult(calcGpa({ rows }));
  const reset = () => {
    setRows(DEFAULT_ROWS);
    setResult(calcGpa({ rows: DEFAULT_ROWS }));
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the UC GPA?", answer: "The UC GPA is the grade point average the University of California uses for admissions. It is calculated from UC-approved 'a-g' courses taken in 10th and 11th grade (plus the summer before each). Only grades of A, B, C, D, or F in these courses count, and honors points are capped at 8 semesters." },
    { question: "What is the difference between capped and uncapped GPA?", answer: "The uncapped GPA counts every honors/AP bonus point. The capped GPA limits honors points to a maximum of 8 (AP, IB, and UC-approved honors courses add 1 point per semester). UC uses the capped GPA for freshman admission review, so most students should focus on the capped number." },
    { question: "Which courses earn honors points?", answer: "Only courses on the UC 'a-g' course list that are designated as honors (AP, IB, or UC-approved honors courses) earn the +1 bonus. Regular courses, even with an A, do not. You can verify a school's approved honors courses on the UC course list website." },
    { question: "What GPA do I need for UC?", answer: "California residents generally need at least a 3.0 UC GPA (3.4 for out-of-state) to be eligible. Competitive campuses like UCLA and Berkeley typically admit students with 4.0+ weighted GPAs, though admissions are holistic and consider essays, activities, and test scores when relevant." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Education", href: "/calculator#education" }, { label: "UC GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">UC GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="text-sm font-semibold text-foreground">UC-Approved a-g Courses (10th & 11th Grade)</div>
            <div className="space-y-2">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_64px_84px] gap-2 items-center">
                  <input type="text" value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} className={inp} placeholder="Course name" />
                  <select value={r.grade} onChange={(e) => updateRow(i, "grade", e.target.value)} className={`${inp} cursor-pointer font-medium`}>
                    {["A", "B", "C", "D", "F"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <select value={r.honors ? "yes" : "no"} onChange={(e) => updateRow(i, "honors", e.target.value === "yes")} className={`${inp} cursor-pointer font-medium`}>
                    <option value="no">Regular</option>
                    <option value="yes">AP/IB/Honors</option>
                  </select>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, { name: "New Course", grade: "A", honors: false }])}
              className="text-sm text-primary font-medium hover:underline self-start"
            >
              + Add Course
            </button>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-1">
              <button
                type="button"
                onClick={calculate}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm active:scale-[0.98]"
              >
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset" className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">UC Capped GPA</div>
              <div className="text-4xl font-extrabold text-primary tracking-tight">{result.cappedGpa.toFixed(3)}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Uncapped: {result.uncappedGpa.toFixed(3)} · Honors points used: {result.cappedBonus} of {result.honorsSemesters}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[[`Uncapped GPA`, result.uncappedGpa.toFixed(3)], [`Capped GPA`, result.cappedGpa.toFixed(3)], [`Honors Semesters`, `${result.honorsSemesters}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold text-foreground">{v}</div>
                </div>
              ))}
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">GPA Breakdown</h3>
              </div>
              <table className="w-full text-base">
                <tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${r.isTotal ? "border-t-2 font-bold bg-secondary/30" : ""} ${r.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`px-3 py-2.5 ${r.highlight ? "font-semibold text-amber-700" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${r.highlight ? "text-amber-700" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-base font-bold mb-4">Points per Course (Grade + Honors)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} points`, "Points"]} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", backgroundColor: "var(--card)", color: "var(--foreground)" }} />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                    {result.chartData.map((d, idx) => (
                      <Cell key={idx} fill={d.points >= 5 ? "#10b981" : d.points === 4 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.4)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2 text-center">Green bars show courses with honors bonus points (A = 5 points, regular A = 4).</p>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-muted-foreground">{s.label}:</span>
                    <span className="font-semibold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the UC GPA Works</h2>
            <p>The University of California calculates a special GPA for admissions using only UC-approved "a-g" courses taken in 10th and 11th grade (and the summers before each). Each grade earns points on the standard scale — A = 4, B = 3, C = 2, D = 1, F = 0 — and AP, IB, and UC-approved honors courses earn one additional point per semester.</p>
            <h2 className="text-2xl font-bold mb-3">Capped vs. Uncapped</h2>
            <p>The <strong>uncapped GPA</strong> counts every honors point. The <strong>capped GPA</strong> limits honors credit to a maximum of 8 semesters (8 bonus points) — this is the number UC uses for freshman admission review. Students who take more than eight honors courses still receive all points for the uncapped GPA, but only eight count toward the capped GPA.</p>
            <h2 className="text-2xl font-bold mb-3">Eligibility Requirements</h2>
            <p>California residents need at least a 3.0 UC GPA in a-g courses to be eligible; out-of-state students need a 3.4. To even begin accumulating points, you must complete the a-g subject requirements: 2 years of history/social science, 4 years of English, 3 years of math, 2 years of laboratory science, 2 years of a language other than English, 1 year of visual/performing arts, and 1 year of a college-preparatory elective.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/uc-gpa-calculator" />
          <PopularCalculators exclude="/calculator/uc-gpa-calculator" />
        </div>
      </div>
    </>
  );
}
