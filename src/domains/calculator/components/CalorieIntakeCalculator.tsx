"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Sex = "male" | "female";
type Goal = "lose" | "maintain" | "gain";

interface IntakeInputs {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg: number;
  activity: number;
  goal: Goal;
  weeklyRate: number;
  proteinPerKg: number;
}

const DEFAULTS: IntakeInputs = {
  sex: "male",
  age: 30,
  heightCm: 178,
  weightKg: 85,
  goalWeightKg: 78,
  activity: 1.55,
  goal: "lose",
  weeklyRate: 0.5,
  proteinPerKg: 1.8,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const ACTIVITY_LEVELS: { value: number; label: string }[] = [
  { value: 1.2, label: "Sedentary" },
  { value: 1.375, label: "Light" },
  { value: 1.55, label: "Moderate" },
  { value: 1.725, label: "Active" },
  { value: 1.9, label: "Athlete" },
];

interface GoalRow {
  label: string;
  calories: number;
  rate: number;
  selected: boolean;
}

interface MacroRow {
  label: string;
  grams: number;
  kcal: number;
  share: number;
}

interface IntakeResult {
  valid: boolean;
  errorMsg: string;
  bmr: number;
  tdee: number;
  target: number;
  dailyDelta: number;
  weeklyChangeKg: number;
  weeksToGoal: number;
  goalDateNote: string;
  waterLitres: number;
  bmi: number;
  goalBmi: number;
  macros: MacroRow[];
  goals: GoalRow[];
}

function computeIntake(input: IntakeInputs): IntakeResult {
  const { sex, age, heightCm, weightKg, goalWeightKg, activity, goal, weeklyRate, proteinPerKg } = input;

  const blank: IntakeResult = {
    valid: false,
    errorMsg: "",
    bmr: 0,
    tdee: 0,
    target: 0,
    dailyDelta: 0,
    weeklyChangeKg: 0,
    weeksToGoal: 0,
    goalDateNote: "",
    waterLitres: 0,
    bmi: 0,
    goalBmi: 0,
    macros: [],
    goals: [],
  };

  if (!Number.isFinite(age) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    return { ...blank, errorMsg: "Enter your age, height and current weight to see a daily calorie target." };
  }
  if (weightKg <= 0 || heightCm <= 0) {
    return { ...blank, errorMsg: "Height and weight must both be greater than zero." };
  }
  if (age < 10 || age > 100) {
    return { ...blank, errorMsg: "Enter an age between 10 and 100 years." };
  }

  const bmr =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const multiplier = ACTIVITY_LEVELS.some((a) => a.value === activity) ? activity : 1.55;
  const tdee = bmr * multiplier;

  const direction = goal === "lose" ? -1 : goal === "gain" ? 1 : 0;
  const rate = Math.max(0, Math.min(1.5, Number.isFinite(weeklyRate) ? weeklyRate : 0.5));
  const weeklyChangeKg = direction * rate;
  const dailyDelta = direction === 0 ? 0 : (weeklyChangeKg * 7700) / 7;
  const target = Math.max(1000, Math.round(tdee + dailyDelta));

  const weeksToGoal =
    direction === 0 || rate <= 0 ? 0 : Math.abs(goalWeightKg - weightKg) / rate;

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const goalBmi = heightM > 0 && goalWeightKg > 0 ? goalWeightKg / (heightM * heightM) : 0;

  const proteinGrams = Math.round(weightKg * Math.max(0.8, Math.min(3, proteinPerKg)));
  const fatGrams = Math.round((target * 0.27) / 9);
  const carbGrams = Math.max(0, Math.round((target - proteinGrams * 4 - fatGrams * 9) / 4));

  const macros: MacroRow[] = [
    { label: "Protein", grams: proteinGrams, kcal: proteinGrams * 4, share: (proteinGrams * 4 * 100) / target },
    { label: "Carbohydrate", grams: carbGrams, kcal: carbGrams * 4, share: (carbGrams * 4 * 100) / target },
    { label: "Fat", grams: fatGrams, kcal: fatGrams * 9, share: (fatGrams * 9 * 100) / target },
  ].map((m) => ({ ...m, share: Number(m.share.toFixed(1)) }));

  const goalSpecs: { key: Goal; label: string; rate: number }[] = [
    { key: "lose", label: "Lose weight", rate: -Math.max(0.25, rate) },
    { key: "maintain", label: "Maintain weight", rate: 0 },
    { key: "gain", label: "Gain weight", rate: Math.max(0.15, rate * 0.5) },
  ];

  const goals: GoalRow[] = goalSpecs.map((spec) => {
    const delta = (spec.rate * 7700) / 7;
    return {
      label: spec.label,
      calories: Math.max(1000, Math.round(tdee + delta)),
      rate: Number(spec.rate.toFixed(2)),
      selected: spec.key === goal,
    };
  });

  const goalDateNote =
    direction === 0
      ? "Maintenance goals have no end date"
      : `${fmt(weeksToGoal, 1)} weeks (${fmt(weeksToGoal / 4.345, 1)} months) at this rate`;

  return {
    valid: true,
    errorMsg: "",
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    target,
    dailyDelta: Math.round(dailyDelta),
    weeklyChangeKg: Number(weeklyChangeKg.toFixed(2)),
    weeksToGoal: Number(weeksToGoal.toFixed(1)),
    goalDateNote,
    waterLitres: Number((weightKg * 0.033).toFixed(2)),
    bmi: Number(bmi.toFixed(1)),
    goalBmi: Number(goalBmi.toFixed(1)),
    macros,
    goals,
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

export default function CalorieIntakeCalculator() {
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [goalWeightKg, setGoalWeightKg] = useState(String(DEFAULTS.goalWeightKg));
  const [activity, setActivity] = useState(String(DEFAULTS.activity));
  const [goal, setGoal] = useState<Goal>(DEFAULTS.goal);
  const [weeklyRate, setWeeklyRate] = useState(String(DEFAULTS.weeklyRate));
  const [proteinPerKg, setProteinPerKg] = useState(String(DEFAULTS.proteinPerKg));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): IntakeInputs => ({
    sex,
    age: parseFloat(age) || 0,
    heightCm: parseFloat(heightCm) || 0,
    weightKg: parseFloat(weightKg) || 0,
    goalWeightKg: parseFloat(goalWeightKg) || 0,
    activity: parseFloat(activity) || 1.55,
    goal,
    weeklyRate: parseFloat(weeklyRate) || 0.5,
    proteinPerKg: parseFloat(proteinPerKg) || 1.8,
  });

  const [calcInputs, setCalcInputs] = useState<IntakeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<IntakeResult>(() => computeIntake(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeIntake(inputs));
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(String(DEFAULTS.age));
    setHeightCm(String(DEFAULTS.heightCm));
    setWeightKg(String(DEFAULTS.weightKg));
    setGoalWeightKg(String(DEFAULTS.goalWeightKg));
    setActivity(String(DEFAULTS.activity));
    setGoal(DEFAULTS.goal);
    setWeeklyRate(String(DEFAULTS.weeklyRate));
    setProteinPerKg(String(DEFAULTS.proteinPerKg));
    setCalcInputs(DEFAULTS);
    setResults(computeIntake(DEFAULTS));
  };

  const GOALS: { key: Goal; label: string }[] = [
    { key: "lose", label: "Lose" },
    { key: "maintain", label: "Maintain" },
    { key: "gain", label: "Gain" },
  ];

  const faqs = [
    {
      question: "How do I work out my daily calorie intake?",
      answer:
        "Start with your maintenance level, which is resting metabolic rate multiplied by an activity factor, then add or subtract the change you want. Half a kilogram of fat holds roughly seven thousand seven hundred calories, so a five hundred and fifty calorie daily deficit produces that loss over a week. Everything else is a variation on this single calculation.",
    },
    {
      question: "Is it better to lose weight fast or slowly?",
      answer:
        "Slower is almost always better. Rates of a quarter to half a kilogram a week preserve more lean mass, keep training performance intact and are far easier to hold for months. Faster losses show quick early movement, most of which is water, and are usually followed by a rebound as hunger and fatigue accumulate.",
    },
    {
      question: "How much protein do I need while dieting?",
      answer:
        "Roughly one point six to two point two grams per kilogram of body weight is the range most often recommended while in a deficit, especially with resistance training. Protein is the most satiating macronutrient and protects lean tissue, so it should be set first and the remaining calories split between carbohydrate for training and fat for hormonal health.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Calorie Intake Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Body & Activity">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput id="age" label="Age" value={age} onChange={setAge} onEnter={runCalculate} suffix="yrs" />
                <CompactInput
                  id="height"
                  label="Height"
                  value={heightCm}
                  onChange={setHeightCm}
                  onEnter={runCalculate}
                  suffix="cm"
                />
                <CompactInput
                  id="weight"
                  label="Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  suffix="kg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setSex("male")}
                  aria-pressed={sex === "male"}
                  className={
                    sex === "male"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex("female")}
                  aria-pressed={sex === "female"}
                  className={
                    sex === "female"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Female
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setActivity(String(level.value))}
                    aria-pressed={parseFloat(activity) === level.value}
                    className={
                      parseFloat(activity) === level.value
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-[11px] shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-[11px] transition-colors"
                    }
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </SubSection>

            <SubSection title="Goal">
              <div className="grid grid-cols-3 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGoal(g.key)}
                    aria-pressed={goal === g.key}
                    className={
                      goal === g.key
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                    }
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {goal !== "maintain" && (
                <div className="mt-3">
                  <CompactInput
                    id="goal-weight"
                    label="Goal Weight"
                    value={goalWeightKg}
                    onChange={setGoalWeightKg}
                    onEnter={runCalculate}
                    suffix="kg"
                    hint="Used to estimate how long the plan will take."
                  />
                </div>
              )}
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
                  <SubSection title="Rate & Macros">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="weekly-rate"
                        label="Rate per Week"
                        value={weeklyRate}
                        onChange={setWeeklyRate}
                        onEnter={runCalculate}
                        suffix="kg"
                        tooltip="How much you plan to lose or gain each week."
                      />
                      <CompactInput
                        id="protein-per-kg"
                        label="Protein per kg"
                        value={proteinPerKg}
                        onChange={setProteinPerKg}
                        onEnter={runCalculate}
                        suffix="g"
                        tooltip="Protein target per kilogram of body weight."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Calorie Target</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.target)} kcal` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.dailyDelta === 0 ? "At maintenance" : `${results.dailyDelta > 0 ? "Surplus" : "Deficit"} of ${fmt(Math.abs(results.dailyDelta))} kcal against ${fmt(results.tdee)} kcal maintenance`}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Resting Rate</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.bmr)} kcal` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Change per Week</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${results.weeklyChangeKg} kg` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Time to Goal</span>
                <span className="font-extrabold text-foreground">
                  {results.valid && results.weeksToGoal > 0 ? `${fmt(results.weeksToGoal, 1)} wks` : "—"}
                </span>
              </div>
            </div>

            {/* MACRO TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Macronutrient</th>
                    <th className="p-2.5 text-right">Grams</th>
                    <th className="p-2.5 text-right">Calories</th>
                    <th className="p-2.5 pr-3 text-right w-[110px]">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.macros.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.grams)} g`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.kcal)} kcal`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.share, 1)}%`}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Total</td>
                    <td className="p-2.5 text-right text-foreground">—</td>
                    <td className="p-2.5 text-right text-emerald-600">{`${fmt(results.target)} kcal`}</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* GOAL COMPARISON TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Approach</th>
                    <th className="p-2.5 text-right">Weekly Change</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Calories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.goals.map((row) => (
                    <tr key={row.label} className={row.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        {row.selected ? " (selected)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">
                        {row.rate === 0 ? "Steady" : `${row.rate > 0 ? "+" : "−"}${Math.abs(row.rate)} kg`}
                      </td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(row.calories)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Current BMI</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.bmi, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Goal BMI</span>
                  <span className="text-base font-bold text-foreground">{results.goalBmi > 0 ? fmt(results.goalBmi, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maintenance</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.tdee)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weekly Intake</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.target * 7)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Plan Duration</span>
                  <span className="text-base font-bold text-foreground">{results.goalDateNote || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Water Target</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.waterLitres, 2)} L`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Calorie Intake Calculator?</h2>
            <p>
              A calorie intake calculator converts a weight goal into a daily number to eat. It works out your maintenance level
              from body size, age, sex and activity, then adds a deficit for losing weight or a surplus for gaining it, and splits
              the result into protein, carbohydrate and fat so the plan can actually be followed at meal level.
            </p>
            <p>
              The daily figure also comes with a timeline. Entering a goal weight turns a vague intention into an estimate of how
              many weeks the plan will take at the chosen rate, which is the most useful reality check available before starting.
              A target that needs a year is a different project from one that needs six weeks.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Resting energy needs come from the Mifflin-St Jeor equation and are multiplied by an activity factor that ranges
              from 1.2 for a sedentary day to 1.9 for twice-daily training. The gap between that maintenance figure and the chosen
              goal is created entirely by the planned rate of change, using the fact that a kilogram of body fat stores about
              seven thousand seven hundred calories.
            </p>
            <p>
              Half a kilogram a week therefore needs a deficit of about five hundred and fifty calories a day. The calculator sets
              protein from body weight first, because protein protects lean tissue during a deficit, then allocates a quarter of
              the calories to fat and gives the remainder to carbohydrate to fuel training. Every target is floored at a thousand
              calories so the plan never suggests an intake too low to meet basic needs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the daily target with the deficit or surplus it represents. The three-stat bar reports the
              resting rate, the weekly change and the time to reach the goal weight, the first table splits the target into
              macronutrients with grams, calories and percentage shares, and the second compares losing, maintaining and gaining at
              the same body size.
            </p>
            <p>
              Use the macro table as a shopping and meal-prep guide rather than a strict prescription. Hitting protein consistently
              matters most, the fat figure keeps hormonal function intact, and carbohydrate can flex up or down by fifty grams
              without changing the weekly outcome. What must stay fixed is the total calorie intake across the week.
            </p>
            <p>
              Recalculate after each five kilograms of change, because a smaller body needs fewer calories and the original target
              slowly becomes a maintenance figure. Plan for a short maintenance phase every eight to twelve weeks of dieting, both
              to give the hormonal system a break and to practise the habits that will keep the weight off afterwards.
            </p>
            <p>
              Finally, expect the scale to move unevenly. Weekly averages smooth out water shifts from salt, carbohydrate and
              training stress, and a stall of one or two weeks is not evidence that the plan has failed. Change one thing at a time,
              give each adjustment a fortnight, and treat the calculator as a starting point that measurement refines. Weighing
              food for the first few weeks is the fastest way to learn what a portion actually looks like, after which estimating
              by eye becomes accurate enough for most purposes.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-intake-calculator" />
          <PopularCalculators exclude="/calculator/calorie-intake-calculator" />
        </div>
      </div>
    </>
  );
}
