"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, GraduationCap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface CourseRow { name: string; grade: string; units: number }
interface GpaResult {
  rows: CourseRow[];
  gpa: number;
  totalUnits: number;
  totalPoints: number;
  gradeCounts: Record<string, number>;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const GRADE_POINTS: Record<string, number> = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
};

const DEFAULT_ROWS: CourseRow[] = [
  { name: "English Composition", grade: "A-", units: 3 },
  { name: "College Algebra", grade: "B", units: 3 },
  { name: "Introduction to Psychology", grade: "B+", units: 3 },
  { name: "Public Speaking", grade: "A", units: 3 },
];

function calcGpa(rows: CourseRow[]): GpaResult {
  let totalPoints = 0, totalUnits = 0;
  const gradeCounts: Record<string, number> = {};
  for (const r of rows) {
    const pts = GRADE_POINTS[r.grade] ?? 0;
    const u = Math.max(0, r.units || 0);
    totalPoints += pts * u;
    totalUnits += u;
    gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
  }
  const gpa = totalUnits > 0 ? totalPoints / totalUnits : 0;

  const chartData = rows.map((r) => ({ name: r.name.length > 14 ? r.name.slice(0, 13) + "…" : r.name, value: GRADE_POINTS[r.grade] ?? 0 }));

  const breakdown = [
    { label: "Courses", value: `${rows.length}` },
    { label: "Total Units", value: `${totalUnits}` },
    { label: "Total Grade Points", value: `${totalPoints.toFixed(1)}` },
    { label: "GPA", value: `${gpa.toFixed(2)}` },
    { label: "Highest Possible (this set)", value: "4.00" },
    { label: "Scale", value: "4.0 (CSU standard)" },
  ];

  const summaryStats = [
    { label: "GPA", value: `${gpa.toFixed(2)}` },
    { label: "Units", value: `${totalUnits}` },
    { label: "Grade Points", value: `${totalPoints.toFixed(1)}` },
    { label: "Courses", value: `${rows.length}` },
    { label: "Min. Transfer GPA", value: "2.00 (some majors higher)" },
    { label: "Status", value: gpa >= 3.5 ? "Excellent" : gpa >= 3.0 ? "Good" : gpa >= 2.0 ? "Satisfactory" : "Needs improvement" },
  ];

  return { rows, gpa, totalUnits, totalPoints, gradeCounts, chartData, breakdown, summaryStats };
}

export default function CsuGpaCalculator() {
  const [rows, setRows] = useState<CourseRow[]>(DEFAULT_ROWS);
  const [result, setResult] = useState<GpaResult>(() => calcGpa(DEFAULT_ROWS));

  useEffect(() => {
    setResult(calcGpa(rows));
  }, []);

  const updateRow = (i: number, patch: Partial<CourseRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { name: "", grade: "B", units: 3 }]);
  const removeRow = (i: number) => setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : rs));
  const reset = () => { setRows(DEFAULT_ROWS); setResult(calcGpa(DEFAULT_ROWS)); };

  const faqs = [
    { question: "How is CSU GPA calculated?", answer: "Each grade converts to grade points (A = 4.0, A- = 3.7, B = 3.0, etc.), multiplied by the course units. GPA = total grade points ÷ total units. CSU and UC both use this 4.0 scale." },
    { question: "What GPA do I need to transfer to a CSU?", answer: "The minimum is 2.00 (2.40 for out-of-state applicants), but impacted majors and campuses often require 3.0+. Lower-division major preparation grades count heavily." },
    { question: "Do repeated courses count twice?", answer: "For CSU admission, repeated courses are typically calculated with both attempts unless the repeat policy applies (e.g., a C or better replaces a D/F in some cases). Check with the campus admissions office." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "CSU GPA Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">CSU GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="space-y-3">
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_88px_72px_32px] gap-2 items-center">
                  <input
                    type="text"
                    value={r.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder={`Course ${i + 1}`}
                    className="input-calc w-full h-9 px-2.5 text-sm border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <select value={r.grade} onChange={(e) => updateRow(i, { grade: e.target.value })} className="input-calc w-full h-9 px-1.5 text-sm border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {Object.keys(GRADE_POINTS).map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={r.units}
                    onChange={(e) => updateRow(i, { units: Math.max(0, Math.min(12, parseFloat(e.target.value) || 0)) })}
                    className="input-calc w-full h-9 px-1.5 text-sm border-input bg-background rounded-md border focus:outline-none focus:ring-2 focus:ring-primary/20"
                    title="Units"
                  />
                  <button type="button" onClick={() => removeRow(i)} className="h-9 w-8 text-muted-foreground hover:text-destructive text-lg leading-none" aria-label="Remove course">×</button>
                </div>
              ))}
              <button type="button" onClick={addRow} className="text-sm text-primary font-medium hover:underline">+ Add course</button>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setResult(calcGpa(rows))} className="btn-calculate flex-1 h-10 bg-primary text-primary-foreground rounded-md font-bold text-base hover:bg-primary/90 flex items-center justify-center gap-2">
                <GraduationCap className="h-4 w-4" /> Calculate
              </button>
              <button type="button" onClick={reset} className="h-10 w-10 rounded-md border border-border hover:bg-secondary text-muted-foreground flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Cumulative GPA (4.0 scale)</div>
              <div className="text-4xl font-extrabold text-primary">{result.gpa.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.totalUnits} units · {result.totalPoints.toFixed(1)} grade points · {result.rows.length} courses</div>
            </div>

            <div className="grid grid-cols-3 gap-0 rounded-lg border border-border overflow-hidden bg-card">
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Total Units</div>
                <div className="text-lg font-bold text-primary">{result.totalUnits}</div>
              </div>
              <div className="p-3 text-center border-r border-border">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Grade Points</div>
                <div className="text-lg font-bold text-primary">{result.totalPoints.toFixed(1)}</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Courses</div>
                <div className="text-lg font-bold text-primary">{result.rows.length}</div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Course</th>
                    <th className="p-2.5 text-center">Grade</th>
                    <th className="p-2.5 text-right">Units</th>
                    <th className="p-2.5 pr-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2.5 pl-3 text-muted-foreground">{r.name || `Course ${i + 1}`}</td>
                      <td className="p-2.5 text-center font-semibold">{r.grade}</td>
                      <td className="p-2.5 text-right">{r.units}</td>
                      <td className="p-2.5 pr-3 text-right font-semibold">{((GRADE_POINTS[r.grade] ?? 0) * Math.max(0, r.units || 0)).toFixed(1)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold">
                    <td className="p-2.5 pl-3">Total</td>
                    <td className="p-2.5 text-center">{result.rows.length} courses</td>
                    <td className="p-2.5 text-right">{result.totalUnits}</td>
                    <td className="p-2.5 pr-3 text-right">{result.totalPoints.toFixed(1)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card-calculator !p-4 border border-border bg-card">
              <h3 className="text-base font-bold mb-3">Grade Points by Course</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={55} />
                  <YAxis tick={{ fontSize: 11 }} domain={[0, 4]} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(2)}`, "Grade points"]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {result.chartData.map((e, i) => <Cell key={i} fill={e.value >= 3 ? "hsl(var(--primary))" : e.value >= 2 ? "hsl(var(--primary)/0.55)" : "hsl(var(--primary)/0.3)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-sm font-bold mb-3">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {result.summaryStats.map((s) => (
                  <div key={s.label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">About the CSU GPA Calculator</h2>
            <p>This calculator uses the standard 4.0 scale applied by the California State University system: each letter grade maps to grade points (A = 4.0 down to F = 0.0), weighted by course units, then divided by total units.</p>
            <h3>Transfer Requirements</h3>
            <p>CSU admission requires a minimum 2.00 GPA (2.40 out of state), but impacted campuses and majors often need 3.0 or higher. Grades in required lower-division major preparation courses carry particular weight, so plan accordingly.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/csu-gpa-calculator" />
          <PopularCalculators exclude="/calculator/csu-gpa-calculator" />
        </div>
      </div>
    </>
  );
}
