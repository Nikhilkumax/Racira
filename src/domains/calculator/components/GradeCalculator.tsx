"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw, Plus, X } from "lucide-react";

interface GradeRow {
  id: number;
  name: string;
  score: number;
  weight: number;
}

interface GradeInputs {
  rows: GradeRow[];
  finalWeight: number;
  target: number;
  curve: number;
}

const DEFAULT_ROWS: GradeRow[] = [
  { id: 1, name: "Homework", score: 92, weight: 20 },
  { id: 2, name: "Midterm", score: 85, weight: 30 },
  { id: 3, name: "Quizzes", score: 88, weight: 15 },
];

const DEFAULTS: GradeInputs = {
  rows: DEFAULT_ROWS,
  finalWeight: 35,
  target: 90,
  curve: 0,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const LETTERS: [number, string][] = [
  [97, "A+"],
  [93, "A"],
  [90, "A−"],
  [87, "B+"],
  [83, "B"],
  [80, "B−"],
  [77, "C+"],
  [73, "C"],
  [70, "C−"],
  [67, "D+"],
  [63, "D"],
  [60, "D−"],
];

function letterFor(pct: number): string {
  for (const [min, letter] of LETTERS) {
    if (pct >= min) return letter;
  }
  return "F";
}

function gpaPointsFor(pct: number): number {
  if (pct >= 93) return 4.0;
  if (pct >= 90) return 3.7;
  if (pct >= 87) return 3.3;
  if (pct >= 83) return 3.0;
  if (pct >= 80) return 2.7;
  if (pct >= 77) return 2.3;
  if (pct >= 73) return 2.0;
  if (pct >= 70) return 1.7;
  if (pct >= 67) return 1.3;
  if (pct >= 63) return 1.0;
  if (pct >= 60) return 0.7;
  return 0.0;
}

interface RowDetail {
  name: string;
  score: number;
  weight: number;
  contribution: number;
}

interface WhatIfRow {
  finalScore: number;
  course: number;
  letter: string;
}

interface TargetRow {
  target: number;
  letter: string;
  needed: number;
  possible: boolean;
}

interface GradeResult {
  valid: boolean;
  errorMsg: string;
  totalWeight: number;
  remainingWeight: number;
  weighted: number;
  curved: number;
  letter: string;
  gpaPoints: number;
  pointsBanked: number;
  neededOnFinal: number;
  possible: boolean;
  bestPossible: number;
  worstPossible: number;
  details: RowDetail[];
  whatIf: WhatIfRow[];
  targets: TargetRow[];
  scale: { letter: string; min: number; gpa: number }[];
}

function computeGrade(input: GradeInputs): GradeResult {
  const { rows, finalWeight, target, curve } = input;

  const blank: GradeResult = {
    valid: false,
    errorMsg: "",
    totalWeight: 0,
    remainingWeight: 0,
    weighted: 0,
    curved: 0,
    letter: "F",
    gpaPoints: 0,
    pointsBanked: 0,
    neededOnFinal: 0,
    possible: false,
    bestPossible: 0,
    worstPossible: 0,
    details: [],
    whatIf: [],
    targets: [],
    scale: [],
  };

  if (rows.length === 0) {
    return { ...blank, errorMsg: "Add at least one graded component before calculating." };
  }
  if (rows.some((r) => !Number.isFinite(r.score) || !Number.isFinite(r.weight) || r.weight < 0)) {
    return { ...blank, errorMsg: "Every component needs a valid score and a weight of zero or more." };
  }
  if (!Number.isFinite(finalWeight) || finalWeight < 0 || finalWeight > 100) {
    return { ...blank, errorMsg: "The final exam weight must be between 0 and 100 percent." };
  }

  const totalWeight = rows.reduce((p, r) => p + Math.max(0, r.weight), 0) + finalWeight;
  if (totalWeight <= 0) {
    return { ...blank, errorMsg: "Assign some weight to at least one component so a grade can be formed." };
  }

  const gradedWeight = rows.reduce((p, r) => p + Math.max(0, r.weight), 0);
  const weighted =
    gradedWeight > 0 ? rows.reduce((p, r) => p + r.score * Math.max(0, r.weight), 0) / gradedWeight : 0;
  const curved = weighted + curve;
  const remainingWeight = Math.max(0, 100 - gradedWeight);
  const pointsBanked = (weighted * gradedWeight) / 100;
  const pointsRemaining = 100 - gradedWeight;
  const neededOnFinal = pointsRemaining > 0 ? ((target - pointsBanked) / pointsRemaining) * 100 : 0;
  const possible = neededOnFinal <= 100;
  const bestPossible = pointsBanked + pointsRemaining;
  const worstPossible = pointsBanked;

  const details: RowDetail[] = rows.map((r) => ({
    name: r.name || "Component",
    score: r.score,
    weight: Math.max(0, r.weight),
    contribution: (r.score * Math.max(0, r.weight)) / 100,
  }));

  const whatIf: WhatIfRow[] = [60, 70, 80, 90, 100].map((finalScore) => {
    const course = pointsBanked + (finalScore * pointsRemaining) / 100;
    return { finalScore, course: Number(course.toFixed(2)), letter: letterFor(course + curve) };
  });

  const targets: TargetRow[] = [90, 80, 70, 60].map((t) => {
    const needed = pointsRemaining > 0 ? ((t - pointsBanked) / pointsRemaining) * 100 : 0;
    return {
      target: t,
      letter: letterFor(t),
      needed: Number(needed.toFixed(2)),
      possible: needed <= 100,
    };
  });

  const scale = LETTERS.map(([min, letter]) => ({ letter, min, gpa: gpaPointsFor(min) }));

  return {
    valid: true,
    errorMsg: "",
    totalWeight: Number(totalWeight.toFixed(2)),
    remainingWeight: Number(remainingWeight.toFixed(2)),
    weighted: Number(weighted.toFixed(2)),
    curved: Number(curved.toFixed(2)),
    letter: letterFor(curved),
    gpaPoints: Number(gpaPointsFor(curved).toFixed(2)),
    pointsBanked: Number(pointsBanked.toFixed(2)),
    neededOnFinal: Number(neededOnFinal.toFixed(2)),
    possible,
    bestPossible: Number(bestPossible.toFixed(2)),
    worstPossible: Number(worstPossible.toFixed(2)),
    details,
    whatIf,
    targets,
    scale,
  };
}

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

export default function GradeCalculator() {
  const [rows, setRows] = useState<GradeRow[]>(DEFAULT_ROWS);
  const [finalWeight, setFinalWeight] = useState(String(DEFAULTS.finalWeight));
  const [target, setTarget] = useState(String(DEFAULTS.target));
  const [curve, setCurve] = useState(String(DEFAULTS.curve));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): GradeInputs => ({
    rows,
    finalWeight: parseFloat(finalWeight) || 0,
    target: parseFloat(target) || 90,
    curve: parseFloat(curve) || 0,
  });

  const [calcInputs, setCalcInputs] = useState<GradeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<GradeResult>(() => computeGrade(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeGrade(inputs));
  };

  const reset = () => {
    setRows(DEFAULT_ROWS);
    setFinalWeight(String(DEFAULTS.finalWeight));
    setTarget(String(DEFAULTS.target));
    setCurve(String(DEFAULTS.curve));
    setCalcInputs(DEFAULTS);
    setResults(computeGrade(DEFAULTS));
  };

  const updateRow = (id: number, patch: Partial<GradeRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1, name: "New Component", score: 85, weight: 10 },
    ]);
  };

  const removeRow = (id: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const faqs = [
    {
      question: "How is a weighted grade calculated?",
      answer:
        "Multiply each score by its weight, add the products, then divide by the total weight earned so far. Homework at ninety-two with a twenty percent weight contributes eighteen point four points and a midterm at eighty-five with thirty percent adds twenty-five point five. Dividing by the weight already assessed, rather than by one hundred, gives the current standing.",
    },
    {
      question: "What score do I need on the final exam?",
      answer:
        "Take the points still needed for your target, then divide by the weight the final carries. If you have banked fifty-eight points and want ninety overall with a thirty-five percent final, you need the remaining thirty-two points from that thirty-five percent, which works out at about ninety-one percent on the exam.",
    },
    {
      question: "What is the difference between a weighted and a points-based grade?",
      answer:
        "A weighted course treats categories as percentages of the final grade, so each category is normalised before it is combined. A points-based course simply totals every mark and divides by the total available. The two often agree, but they diverge whenever categories contain different numbers of items, and the syllabus decides which applies.",
    },
    {
      question: "How do curves and extra credit change the result?",
      answer:
        "A curve adds a fixed number of percentage points to the final score before the letter is assigned, which lifts every result by the same amount. Extra credit usually adds to the points earned rather than to the percentage, so its effect depends on how the course totals marks. The calculator applies a flat curve so the letter grade shown matches a curved syllabus.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Education", href: "/calculator#education" },
          { label: "Grade Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Grade Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Graded Components">
              <div className="flex flex-col gap-2">
                {rows.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_70px_70px_32px] gap-2 items-end">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(row.id, { name: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                    <input
                      type="number"
                      value={row.score}
                      onChange={(e) => updateRow(row.id, { score: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") runCalculate();
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                    <input
                      type="number"
                      value={row.weight}
                      onChange={(e) => updateRow(row.id, { weight: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") runCalculate();
                      }}
                      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      aria-label="Remove component"
                      className="h-9 w-8 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRow}
                  className="mt-1 flex items-center justify-center gap-1.5 h-8 rounded-md border border-dashed border-border bg-background hover:bg-secondary text-sm font-semibold text-primary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Component
                </button>
                <p className="text-[11px] text-muted-foreground">Columns: name, score out of 100, weight in percent.</p>
              </div>
            </SubSection>

            <SubSection title="Target & Final Exam">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="final-weight"
                  label="Final Exam Weight"
                  value={finalWeight}
                  onChange={setFinalWeight}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="How much of the course grade the final exam is worth."
                />
                <CompactInput
                  id="target"
                  label="Target Grade"
                  value={target}
                  onChange={setTarget}
                  onEnter={runCalculate}
                  suffix="%"
                  tooltip="The course percentage you want to finish with."
                />
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
                  <SubSection title="Curve">
                    <CompactInput
                      id="curve"
                      label="Curve Adjustment"
                      value={curve}
                      onChange={setCurve}
                      onEnter={runCalculate}
                      suffix="pts"
                      hint="Percentage points added to every score before grading."
                      tooltip="Leave at zero for an uncurved course."
                    />
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Current Course Grade</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.curved, 2)}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Letter grade ${results.letter} from ${fmt(results.totalWeight, 0)}% of the course assessed`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Points Banked</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.pointsBanked, 2) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Needed on Final</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.neededOnFinal, 2)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">GPA Points</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.gpaPoints, 2) : "—"}</span>
              </div>
            </div>

            {results.valid && !results.possible && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-4">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Target out of reach</div>
                <div className="text-sm text-foreground">
                  {`A ${fmt(calcInputs.target, 0)}% course grade needs more than 100% on the remaining work. The highest finish still available is ${fmt(results.bestPossible, 2)}%.`}
                </div>
              </div>
            )}

            {/* COMPONENT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Component</th>
                    <th className="p-2.5 text-right">Score</th>
                    <th className="p-2.5 text-right">Weight</th>
                    <th className="p-2.5 pr-3 text-right w-[130px]">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.details.map((row) => (
                    <tr key={row.name} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.name}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.score, 2)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.weight, 1)}%</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.contribution, 2)}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Final exam (not yet taken)</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(calcInputs.finalWeight, 1)}%</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">—</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-foreground">{fmt(results.totalWeight, 0)}%</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{fmt(results.pointsBanked, 2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* WHAT IF TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">If the Final Scores</th>
                    <th className="p-2.5 text-right">Course Grade</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Letter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.whatIf.map((row) => (
                    <tr key={row.finalScore} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.finalScore}%</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.course, 2)}%</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.letter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TARGET TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Target Letter</th>
                    <th className="p-2.5 text-right">Needed on Final</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Achievable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.targets.map((row) => (
                    <tr key={row.target} className={row.possible ? "hover:bg-secondary/20 transition-colors" : "bg-destructive/5"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.letter} ({row.target}%)</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.needed, 2)}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.possible ? "Yes" : "No"}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weight Assessed</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(results.totalWeight - calcInputs.finalWeight, 0)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Uncurved Average</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.weighted, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Curve Applied</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.curve, 2)} pts</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining Weight</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.remainingWeight, 0)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Best Possible Finish</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.bestPossible, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Worst Possible Finish</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.worstPossible, 2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Grade Calculator?</h2>
            <p>
              A grade calculator combines your scores with the weight each one carries to show where you stand in a course,
              what you need on the final exam to reach a target, and which letter grade that implies. Add a component for each
              assignment, quiz, project or exam, set its weight from the syllabus, and the running course average updates
              immediately.
            </p>
            <p>
              The useful part is not the average itself but the planning it allows. Knowing that an eighty-eight is banked
              and a ninety is still within reach changes how much effort an exam deserves, and knowing that a target has
              already slipped out of range prevents wasted stress. The same arithmetic works for any weighted scoring system.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each component contributes its score multiplied by its weight. The calculator adds those contributions and
              divides by the weight already assessed, which is why the current average is based only on graded work rather
              than on the whole course. A sixty percent weight graded at ninety points yields fifty-four of the hundred points
              available, and forty points remain unearned.
            </p>
            <p>
              From the banked points, the score needed on the final follows by dividing the shortfall by the remaining weight.
              If forty points are still outstanding and the final exam is worth forty percent, then a twenty-point shortfall
              requires fifty percent on the exam. That formula is the whole reason a single exam can rescue a course, or
              destroy one.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the current course percentage and its letter, with banked points, the score needed for
              your target and the equivalent grade point average in the three-stat bar. The first table lists every component
              with its score, weight and point contribution so the arithmetic is visible rather than hidden.
            </p>
            <p>
              The what-if table answers the question students ask most: what course grade follows from scoring sixty, seventy,
              eighty, ninety or a hundred on the final. The target table then inverts the problem and shows the exam score each
              letter grade would require, flagging the ones that are no longer reachable so the realistic goal is obvious.
            </p>
            <p>
              Watch the weights rather than the scores when assessing a course. A quiz averaging ninety-five with a five 
              percent weight moves the final grade far less than an exam averaging eighty at thirty percent. Entering the
              syllabus weights correctly is the single most important step, because a wrong weight changes the answer more
              than any other input.
            </p>
            <p>
              Finally, use the curve field when your instructor grades against an adjusted scale. Applying the points before
              the letter is assigned mirrors how a curved syllabus actually works, and it shows the difference between an
              eighty-nine that stands and one that needs a two-point lift to become an A.
            </p>
            <p>
              Rerun the calculation after every returned assignment. Small scores all count towards the same total, and an
              early quiz that feels insignificant can sit behind a full letter grade by the end of the term. Treating the
              running figure as a live number rather than a surprise in December is the simplest habit that keeps a target
              grade within reach.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/grade-calculator" />
          <PopularCalculators exclude="/calculator/grade-calculator" />
        </div>
      </div>
    </>
  );
}
