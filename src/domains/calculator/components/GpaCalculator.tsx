"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw, Plus, X } from "lucide-react";

interface CourseRow {
  id: number;
  name: string;
  credits: number;
  letter: string;
}

interface GpaInputs {
  courses: CourseRow[];
  priorGpa: number;
  priorCredits: number;
  upcomingCredits: number;
  expectedGpa: number;
}

const GRADE_POINTS: { letter: string; points: number; min: number }[] = [
  { letter: "A+", points: 4.0, min: 97 },
  { letter: "A", points: 4.0, min: 93 },
  { letter: "A−", points: 3.7, min: 90 },
  { letter: "B+", points: 3.3, min: 87 },
  { letter: "B", points: 3.0, min: 83 },
  { letter: "B−", points: 2.7, min: 80 },
  { letter: "C+", points: 2.3, min: 77 },
  { letter: "C", points: 2.0, min: 73 },
  { letter: "C−", points: 1.7, min: 70 },
  { letter: "D+", points: 1.3, min: 67 },
  { letter: "D", points: 1.0, min: 63 },
  { letter: "D−", points: 0.7, min: 60 },
  { letter: "F", points: 0.0, min: 0 },
];

const DEFAULT_COURSES: CourseRow[] = [
  { id: 1, name: "Calculus I", credits: 4, letter: "A−" },
  { id: 2, name: "English Composition", credits: 3, letter: "B+" },
  { id: 3, name: "Chemistry", credits: 4, letter: "B" },
  { id: 4, name: "History", credits: 3, letter: "A" },
];

const DEFAULTS: GpaInputs = {
  courses: DEFAULT_COURSES,
  priorGpa: 3.2,
  priorCredits: 30,
  upcomingCredits: 15,
  expectedGpa: 3.5,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const pointsFor = (letter: string): number => {
  const found = GRADE_POINTS.find((g) => g.letter === letter);
  return found ? found.points : 0;
};

interface CourseDetail {
  name: string;
  credits: number;
  letter: string;
  points: number;
  qualityPoints: number;
}

interface GpaResult {
  valid: boolean;
  errorMsg: string;
  termCredits: number;
  termQualityPoints: number;
  termGpa: number;
  totalCredits: number;
  cumulativeGpa: number;
  cumulativeQualityPoints: number;
  projectedGpa: number;
  projectedCredits: number;
  bestCaseGpa: number;
  worstCaseGpa: number;
  details: CourseDetail[];
  scale: { letter: string; points: number; min: number }[];
}

function computeGpa(input: GpaInputs): GpaResult {
  const { courses, priorGpa, priorCredits, upcomingCredits, expectedGpa } = input;

  const blank: GpaResult = {
    valid: false,
    errorMsg: "",
    termCredits: 0,
    termQualityPoints: 0,
    termGpa: 0,
    totalCredits: 0,
    cumulativeGpa: 0,
    cumulativeQualityPoints: 0,
    projectedGpa: 0,
    projectedCredits: 0,
    bestCaseGpa: 0,
    worstCaseGpa: 0,
    details: [],
    scale: [],
  };

  if (courses.length === 0) {
    return { ...blank, errorMsg: "Add at least one course to calculate a grade point average." };
  }
  if (courses.some((c) => !Number.isFinite(c.credits) || c.credits <= 0)) {
    return { ...blank, errorMsg: "Every course needs a credit value greater than zero." };
  }
  if (priorCredits < 0 || upcomingCredits < 0) {
    return { ...blank, errorMsg: "Credit totals cannot be negative." };
  }

  const details: CourseDetail[] = courses.map((c) => {
    const points = pointsFor(c.letter);
    return {
      name: c.name || "Course",
      credits: c.credits,
      letter: c.letter,
      points,
      qualityPoints: points * c.credits,
    };
  });

  const termCredits = details.reduce((p, c) => p + c.credits, 0);
  const termQualityPoints = details.reduce((p, c) => p + c.qualityPoints, 0);
  const termGpa = termCredits > 0 ? termQualityPoints / termCredits : 0;

  const totalCredits = termCredits + priorCredits;
  const cumulativeQualityPoints = termQualityPoints + priorGpa * priorCredits;
  const cumulativeGpa = totalCredits > 0 ? cumulativeQualityPoints / totalCredits : 0;

  const projectedCredits = totalCredits + upcomingCredits;
  const projectedGpa =
    projectedCredits > 0
      ? (cumulativeQualityPoints + expectedGpa * upcomingCredits) / projectedCredits
      : 0;

  const bestCaseGpa = projectedCredits > 0 ? (cumulativeQualityPoints + 4 * upcomingCredits) / projectedCredits : 0;
  const worstCaseGpa = projectedCredits > 0 ? cumulativeQualityPoints / projectedCredits : 0;

  return {
    valid: true,
    errorMsg: "",
    termCredits: Number(termCredits.toFixed(2)),
    termQualityPoints: Number(termQualityPoints.toFixed(2)),
    termGpa: Number(termGpa.toFixed(4)),
    totalCredits: Number(totalCredits.toFixed(2)),
    cumulativeGpa: Number(cumulativeGpa.toFixed(4)),
    cumulativeQualityPoints: Number(cumulativeQualityPoints.toFixed(2)),
    projectedGpa: Number(projectedGpa.toFixed(4)),
    projectedCredits: Number(projectedCredits.toFixed(2)),
    bestCaseGpa: Number(bestCaseGpa.toFixed(4)),
    worstCaseGpa: Number(worstCaseGpa.toFixed(4)),
    details,
    scale: GRADE_POINTS.map((g) => ({ letter: g.letter, points: g.points, min: g.min })),
  };
}

const inputClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground";

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>
      )}
    </div>
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function GpaCalculator() {
  const [courses, setCourses] = useState<CourseRow[]>(DEFAULT_COURSES);
  const [priorGpa, setPriorGpa] = useState(String(DEFAULTS.priorGpa));
  const [priorCredits, setPriorCredits] = useState(String(DEFAULTS.priorCredits));
  const [upcomingCredits, setUpcomingCredits] = useState(String(DEFAULTS.upcomingCredits));
  const [expectedGpa, setExpectedGpa] = useState(String(DEFAULTS.expectedGpa));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): GpaInputs => ({
    courses,
    priorGpa: Math.max(0, Math.min(4.5, parseFloat(priorGpa) || 0)),
    priorCredits: parseFloat(priorCredits) || 0,
    upcomingCredits: parseFloat(upcomingCredits) || 0,
    expectedGpa: Math.max(0, Math.min(4.5, parseFloat(expectedGpa) || 0)),
  });

  const [calcInputs, setCalcInputs] = useState<GpaInputs>(() => DEFAULTS);
  const [results, setResults] = useState<GpaResult>(() => computeGpa(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeGpa(inputs));
  };

  const reset = () => {
    setCourses(DEFAULT_COURSES);
    setPriorGpa(String(DEFAULTS.priorGpa));
    setPriorCredits(String(DEFAULTS.priorCredits));
    setUpcomingCredits(String(DEFAULTS.upcomingCredits));
    setExpectedGpa(String(DEFAULTS.expectedGpa));
    setCalcInputs(DEFAULTS);
    setResults(computeGpa(DEFAULTS));
  };

  const updateCourse = (id: number, patch: Partial<CourseRow>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { id: prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1, name: "New Course", credits: 3, letter: "B" },
    ]);
  };

  const removeCourse = (id: number) => {
    setCourses((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));
  };

  const faqs = [
    {
      question: "How is GPA calculated?",
      answer:
        "Each course is converted to grade points on a four point scale, multiplied by its credit hours to produce quality points, and the total quality points are divided by the total credits. An A minus in a four credit course contributes fourteen point eight quality points, and four credits are added to the denominator at the same time.",
    },
    {
      question: "Why do credits matter more than the number of courses?",
      answer:
        "A four credit course moves the average further than a one credit course because it carries more weight in the denominator. That is why a good result in a heavy course lifts a term GPA noticeably, and why dropping a course late can raise or lower the average depending on the grade it would have earned.",
    },
    {
      question: "How do I combine a term GPA with my cumulative GPA?",
      answer:
        "Convert both to quality points by multiplying each GPA by its credit total, add the quality points and the credits separately, then divide. Averaging the two GPAs directly is the most common mistake and produces the wrong figure whenever the credit totals differ.",
    },
    {
      question: "What is a good GPA?",
      answer:
        "On a four point scale, 3.5 and above is usually described as strong, 3.0 as solid and 2.0 as the minimum most colleges require to stay in good standing. Graduate and professional programmes often look for 3.0 to 3.5, but the requirement varies widely and departments sometimes weight the final two years more heavily.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Education", href: "/calculator#education" },
          { label: "GPA Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">GPA Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Courses">
              <div className="flex flex-col gap-2">
                {courses.map((course) => (
                  <div key={course.id} className="grid grid-cols-[1fr_64px_74px_32px] gap-2 items-center">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      type="number"
                      value={course.credits}
                      min="0"
                      onChange={(e) => updateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") runCalculate();
                      }}
                      className={inputClass}
                    />
                    <select
                      value={course.letter}
                      onChange={(e) => updateCourse(course.id, { letter: e.target.value })}
                      className={inputClass}
                    >
                      {GRADE_POINTS.map((g) => (
                        <option key={g.letter} value={g.letter}>
                          {g.letter}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeCourse(course.id)}
                      aria-label="Remove course"
                      className="h-9 w-8 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCourse}
                  className="mt-1 flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-border bg-background hover:bg-secondary text-sm font-semibold text-primary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Course
                </button>
                <p className="text-[11px] text-muted-foreground">Columns: course name, credits, letter grade.</p>
              </div>
            </SubSection>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdv(!showAdv)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdv ? "rotate-180" : ""}`} />
              </button>

              {showAdv && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <SubSection title="Prior Record">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="prior-gpa"
                        label="Prior Cumulative GPA"
                        value={priorGpa}
                        onChange={setPriorGpa}
                        onEnter={runCalculate}
                        tooltip="GPA from earlier terms, on the same four point scale."
                      />
                      <CompactInput
                        id="prior-credits"
                        label="Prior Credits"
                        value={priorCredits}
                        onChange={setPriorCredits}
                        onEnter={runCalculate}
                        suffix="cr"
                        tooltip="Total credits completed before this term."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Next Term Projection">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="upcoming-credits"
                        label="Upcoming Credits"
                        value={upcomingCredits}
                        onChange={setUpcomingCredits}
                        onEnter={runCalculate}
                        suffix="cr"
                        tooltip="Credits you plan to take next."
                      />
                      <CompactInput
                        id="expected-gpa"
                        label="Expected GPA"
                        value={expectedGpa}
                        onChange={setExpectedGpa}
                        onEnter={runCalculate}
                        tooltip="The GPA you expect to earn over those credits."
                      />
                    </div>
                  </SubSection>
                </div>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={runCalculate}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Term GPA</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.termGpa, 3) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.termCredits, 0)} credits and ${fmt(results.termQualityPoints, 1)} quality points`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cumulative GPA</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.cumulativeGpa, 3) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Credits</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.totalCredits, 1) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Projected</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.projectedGpa, 3) : "—"}
                </span>
              </div>
            </div>

            {/* COURSE TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Course</th>
                    <th className="p-2.5 text-right">Credits</th>
                    <th className="p-2.5 text-right">Grade</th>
                    <th className="p-2.5 text-right">Points</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Quality Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.details.map((row) => (
                    <tr key={row.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.name}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.credits, 1)}</td>
                      <td className="p-2.5 text-right text-foreground">{row.letter}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.points, 1)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.qualityPoints, 2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Term total</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.termCredits, 1)}</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.termGpa, 3)}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.termQualityPoints, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SCALE TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Letter</th>
                    <th className="p-2.5 text-right">Percent From</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.scale.map((row) => (
                    <tr key={row.letter} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.letter}</td>
                      <td className="p-2.5 text-right text-foreground">{row.min}%</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.points, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Courses Entered</span>
                  <span className="text-base font-bold text-foreground">{calcInputs.courses.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Prior GPA</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.priorGpa, 3)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Prior Credits</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.priorCredits, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cumulative Quality Points</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.cumulativeQualityPoints, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Best Possible Next Term</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.bestCaseGpa, 3)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Worst Possible Next Term</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.worstCaseGpa, 3)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a GPA Calculator?</h2>
            <p>
              A GPA calculator converts letter grades and credit hours into a grade point average on the standard four point
              scale. Enter each course with its credit value and grade, and the tool returns the term GPA, the quality points
              behind it, and the cumulative average that results when the term is folded into your existing record.
            </p>
            <p>
              Grade point averages carry weight well beyond graduation. Scholarships, honours lists, graduate admissions,
              internships and many first-job screens all use them, and a single heavy-credit course can move the number more
              than students expect. Calculating the figure yourself makes the effect of each course visible while there is
              still time to respond to it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each letter grade maps to grade points: an A or A plus is four point zero, an A minus three point seven, and the
              scale steps down through B, C and D before an F contributes nothing. Multiplying grade points by credit hours
              produces quality points, and the term GPA is total quality points divided by total credits attempted.
            </p>
            <p>
              Cumulative GPA uses the same arithmetic across the whole record. The prior GPA is converted back into quality
              points using the prior credit total, the new term is added on top, and the combined quality points are divided by
              the combined credits. Averaging the two GPAs directly instead of weighting them by credits is the most frequent
              mistake and gets worse as the credit totals diverge.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the term GPA, with the cumulative average, total credits and a projection in the three-stat
              bar. The first table lists every course with its credits, letter, grade points and quality point contribution so
              each step of the arithmetic can be traced, and the second table reproduces the standard letter-to-points scale.
            </p>
            <p>
              Use the projection to answer the question that matters most near the end of a degree: how much can the average
              still move? Enter the credits you plan to take and the GPA you expect from them, and the projected figure shows
              the realistic outcome. The summary panel also reports the best and worst cases, which is the range a perfect or a
              failing term would produce.
            </p>
            <p>
              Remember that some institutions attach different weights to honours, advanced placement or pass-fail courses, and
              a few use a five point scale for advanced classes. The calculator follows the conventional four point scale with
              plus and minus grades, so adjust the letters you enter if your school treats them differently.
            </p>
            <p>
              Finally, track the credit totals as carefully as the grades. A term with fifteen credits counts three times as
              heavily towards the cumulative average as a five credit summer session, which is why a strong summer can move a
              stalled record faster than another full term at the same performance level. Keep the calculation updated after
              every term rather than once a year, because the earlier a slippage is visible the cheaper it is to correct: a
              single retaken course carries far more weight in a short record than in a long one.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gpa-calculator" />
          <PopularCalculators exclude="/calculator/gpa-calculator" />
        </div>
      </div>
    </>
  );
}
