"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Sex = "male" | "female";
type Formula = "mifflin" | "harris" | "katch";

interface BmrInputs {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  bodyFat: number;
  formula: Formula;
  activity: number;
}

const DEFAULTS: BmrInputs = {
  sex: "male",
  age: 30,
  weightKg: 77,
  heightCm: 175,
  bodyFat: 20,
  formula: "mifflin",
  activity: 1.375,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const ACTIVITY_LEVELS: { value: number; label: string; note: string }[] = [
  { value: 1.2, label: "Sedentary", note: "Desk work, little exercise" },
  { value: 1.375, label: "Light", note: "Exercise 1–3 days a week" },
  { value: 1.55, label: "Moderate", note: "Exercise 3–5 days a week" },
  { value: 1.725, label: "Very active", note: "Hard exercise 6–7 days" },
  { value: 1.9, label: "Athlete", note: "Twice-daily training" },
];

interface FormulaRow {
  label: string;
  bmr: number;
  selected: boolean;
}

interface ActivityRow {
  label: string;
  note: string;
  multiplier: number;
  tdee: number;
  lose: number;
  gain: number;
  selected: boolean;
}

interface BmrResult {
  valid: boolean;
  errorMsg: string;
  bmr: number;
  formulaLabel: string;
  tdee: number;
  weekly: number;
  monthly: number;
  yearly: number;
  leanMass: number;
  cutCalories: number;
  bulkCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  formulaRows: FormulaRow[];
  activityRows: ActivityRow[];
}

function computeBmr(input: BmrInputs): BmrResult {
  const { sex, age, weightKg, heightCm, bodyFat, formula, activity } = input;

  const blank: BmrResult = {
    valid: false,
    errorMsg: "",
    bmr: 0,
    formulaLabel: "",
    tdee: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    leanMass: 0,
    cutCalories: 0,
    bulkCalories: 0,
    proteinGrams: 0,
    carbGrams: 0,
    fatGrams: 0,
    formulaRows: [],
    activityRows: [],
  };

  if (!Number.isFinite(age) || !Number.isFinite(weightKg) || !Number.isFinite(heightCm)) {
    return { ...blank, errorMsg: "Enter an age, a weight and a height to estimate your metabolic rate." };
  }
  if (weightKg <= 0 || heightCm <= 0) {
    return { ...blank, errorMsg: "Weight and height must both be greater than zero." };
  }
  if (age < 10 || age > 100) {
    return { ...blank, errorMsg: "Enter an age between 10 and 100 years." };
  }

  const mifflin =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const harris =
    sex === "male"
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  const bf = Math.max(0, Math.min(70, Number.isFinite(bodyFat) ? bodyFat : 20));
  const leanMass = weightKg * (1 - bf / 100);
  const katch = 370 + 21.6 * leanMass;

  let bmr = mifflin;
  let formulaLabel = "Mifflin-St Jeor";
  if (formula === "harris") {
    bmr = harris;
    formulaLabel = "Harris-Benedict (revised)";
  } else if (formula === "katch") {
    bmr = katch;
    formulaLabel = "Katch-McArdle";
  }
  bmr = Math.max(0, bmr);

  const multiplier = ACTIVITY_LEVELS.some((a) => a.value === activity) ? activity : 1.375;
  const tdee = bmr * multiplier;

  const formulaRows: FormulaRow[] = [
    { label: "Mifflin-St Jeor", bmr: Math.round(mifflin), selected: formula === "mifflin" },
    { label: "Harris-Benedict (revised)", bmr: Math.round(harris), selected: formula === "harris" },
    { label: "Katch-McArdle (uses body fat)", bmr: Math.round(katch), selected: formula === "katch" },
  ];

  const activityRows: ActivityRow[] = ACTIVITY_LEVELS.map((level) => {
    const rowTdee = bmr * level.value;
    return {
      label: level.label,
      note: level.note,
      multiplier: level.value,
      tdee: Math.round(rowTdee),
      lose: Math.round(rowTdee - 500),
      gain: Math.round(rowTdee + 300),
      selected: level.value === multiplier,
    };
  });

  const proteinGrams = Math.round(weightKg * 1.8);
  const fatGrams = Math.round((tdee * 0.25) / 9);
  const carbGrams = Math.round((tdee - proteinGrams * 4 - fatGrams * 9) / 4);

  return {
    valid: true,
    errorMsg: "",
    bmr: Math.round(bmr),
    formulaLabel,
    tdee: Math.round(tdee),
    weekly: Math.round(bmr * 7),
    monthly: Math.round(bmr * 30),
    yearly: Math.round(bmr * 365),
    leanMass: Number(leanMass.toFixed(1)),
    cutCalories: Math.round(tdee - 500),
    bulkCalories: Math.round(tdee + 300),
    proteinGrams,
    carbGrams: Math.max(0, carbGrams),
    fatGrams,
    formulaRows,
    activityRows,
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

export default function BmrCalculator() {
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [bodyFat, setBodyFat] = useState(String(DEFAULTS.bodyFat));
  const [formula, setFormula] = useState<Formula>(DEFAULTS.formula);
  const [activity, setActivity] = useState(String(DEFAULTS.activity));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BmrInputs => ({
    sex,
    age: parseFloat(age) || 0,
    weightKg: parseFloat(weightKg) || 0,
    heightCm: parseFloat(heightCm) || 0,
    bodyFat: parseFloat(bodyFat) || 0,
    formula,
    activity: parseFloat(activity) || 1.375,
  });

  const [calcInputs, setCalcInputs] = useState<BmrInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BmrResult>(() => computeBmr(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBmr(inputs));
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(String(DEFAULTS.age));
    setWeightKg(String(DEFAULTS.weightKg));
    setHeightCm(String(DEFAULTS.heightCm));
    setBodyFat(String(DEFAULTS.bodyFat));
    setFormula(DEFAULTS.formula);
    setActivity(String(DEFAULTS.activity));
    setCalcInputs(DEFAULTS);
    setResults(computeBmr(DEFAULTS));
  };

  const FORMS: { key: Formula; label: string }[] = [
    { key: "mifflin", label: "Mifflin-St Jeor" },
    { key: "harris", label: "Harris-Benedict" },
    { key: "katch", label: "Katch-McArdle" },
  ];

  const faqs = [
    {
      question: "What is the difference between BMR and TDEE?",
      answer:
        "Basal metabolic rate is the energy the body burns at complete rest to keep organs, breathing and temperature regulation running. Total daily energy expenditure adds movement, exercise, digestion and everyday activity. The multiplier ranges from about 1.2 for a desk-bound day to 1.9 for twice-daily training, and it usually changes the daily figure by several hundred calories.",
    },
    {
      question: "Which BMR formula is most accurate?",
      answer:
        "Mifflin-St Jeor is the most accurate general-purpose equation for most adults and is the usual clinical choice. Katch-McArdle is better when a reliable body fat measurement is available because it works from lean mass directly. Harris-Benedict, revised in 1984, tends to overestimate slightly and is best treated as a cross-check rather than a primary figure.",
    },
    {
      question: "Why does my metabolic rate drop as I lose weight?",
      answer:
        "A smaller body needs less energy, so basal metabolic rate falls as weight is lost, and the drop can be steeper than the weight change alone would suggest because lean tissue is lost along with fat. Resistance training and adequate protein intake preserve lean mass, which keeps the figure higher. Recalculating every few kilograms keeps targets realistic.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "BMR Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Body Measurements">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput
                  id="age"
                  label="Age"
                  value={age}
                  onChange={setAge}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Metabolic rate falls gradually with age."
                />
                <CompactInput
                  id="weight"
                  label="Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  suffix="kg"
                  tooltip="Weight in kilograms."
                />
                <CompactInput
                  id="height"
                  label="Height"
                  value={heightCm}
                  onChange={setHeightCm}
                  onEnter={runCalculate}
                  suffix="cm"
                  tooltip="Height in centimetres."
                />
              </div>
            </SubSection>

            <SubSection title="Sex">
              <div className="grid grid-cols-2 gap-2">
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
            </SubSection>

            <SubSection title="Activity Level">
              <div className="grid grid-cols-5 gap-1.5">
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
              <p className="text-[11px] text-muted-foreground mt-1.5">
                {ACTIVITY_LEVELS.find((l) => l.value === parseFloat(activity))?.note ?? "Exercise 1–3 days a week"}
              </p>
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
                  <SubSection title="Formula & Body Composition">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="body-fat"
                        label="Body Fat"
                        value={bodyFat}
                        onChange={setBodyFat}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="Used by the Katch-McArdle equation to find lean mass."
                      />
                      <CompactInput
                        id="activity-multiplier"
                        label="Activity Factor"
                        value={activity}
                        onChange={setActivity}
                        onEnter={runCalculate}
                        tooltip="Type a precise multiplier between 1.1 and 2.2 if you know it."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {FORMS.map((f) => (
                        <button
                          key={f.key}
                          type="button"
                          onClick={() => setFormula(f.key)}
                          aria-pressed={formula === f.key}
                          className={
                            formula === f.key
                              ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-[11px] shadow-sm transition-all active:scale-[0.98]"
                              : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-[11px] transition-colors"
                          }
                        >
                          {f.label}
                        </button>
                      ))}
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Basal Metabolic Rate</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.bmr)} kcal` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid ? `${results.formulaLabel} · ${fmt(results.tdee)} kcal at your activity level` : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lean Mass</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.leanMass, 1)} kg` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cut Target</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.cutCalories)} kcal` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gain Target</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.bulkCalories)} kcal` : "—"}</span>
              </div>
            </div>

            {/* FORMULA TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Equation</th>
                    <th className="p-2.5 text-right">BMR</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.formulaRows.map((row) => (
                    <tr key={row.label} className={row.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        {row.selected ? " (selected)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.bmr)} kcal`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${row.bmr >= results.bmr ? "+" : "−"}${fmt(Math.abs(row.bmr - results.bmr))} kcal`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ACTIVITY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Activity Level</th>
                    <th className="p-2.5 text-right">Factor</th>
                    <th className="p-2.5 text-right">Maintain</th>
                    <th className="p-2.5 pr-3 text-right w-[120px]">Cut / Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.activityRows.map((row) => (
                    <tr key={row.label} className={row.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        <span className="block text-[11px] font-normal text-muted-foreground">{row.note}</span>
                      </td>
                      <td className="p-2.5 text-right text-foreground">{row.multiplier.toFixed(3)}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.tdee)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.lose)} / ${fmt(row.gain)}`}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Resting Energy Per Week</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.weekly)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Per Month</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.monthly)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Per Year</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.yearly)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">BMR as Share of TDEE</span>
                  <span className="text-base font-bold text-foreground">
                    {results.tdee > 0 ? `${fmt((results.bmr / results.tdee) * 100, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Suggested Protein</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.proteinGrams)} g`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Suggested Carbs / Fat</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.carbGrams)} g / ${fmt(results.fatGrams)} g`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a BMR Calculator?</h2>
            <p>
              A basal metabolic rate calculator estimates the calories your body would burn in a day doing nothing at all:
              powering the heart, brain, kidneys, liver and the constant work of maintaining body temperature. It is the floor
              beneath every energy target, and once the activity factor is applied the figure becomes the maintenance calorie
              level most nutrition plans are built around.
            </p>
            <p>
              Three equations are in common use. Mifflin-St Jeor works from weight, height, age and sex and is the most accurate
              general choice. Harris-Benedict is the older equation and tends to run slightly high, while Katch-McArdle works
              from lean body mass instead, which makes it the better option when body fat has been measured reliably.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each equation adds and multiplies the same inputs in slightly different proportions. Mifflin-St Jeor multiplies
              weight by ten and height by six point two five, subtracts five times the age and then adds or subtracts a constant
              depending on sex. Katch-McArdle drops the demographic terms entirely and uses three hundred and seventy plus
              twenty-one point six times lean mass in kilograms.
            </p>
            <p>
              The activity factor turns the resting figure into a daily target. Sedentary days multiply by 1.2, light activity by
              1.375, moderate training by 1.55, hard training by 1.725 and twice-daily work by 1.9. Subtracting five hundred
              calories produces the conventional weight-loss target of about half a kilogram a week, and adding three hundred
              supports a controlled gain.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the basal rate with the formula used, and the three-stat bar reports lean mass alongside the
              cut and gain calorie targets. The first table compares all three equations side by side so the spread between them
              is visible, and the second lists every activity level with its maintenance, cutting and gaining figures.
            </p>
            <p>
              Treat the estimates as a starting point rather than a prescription. Real metabolic rates vary between individuals
              by several hundred calories at the same height, weight and age, and laboratory measurement is the only way to know
              your own figure precisely. The practical test is to hold an intake steady for two to three weeks and watch what the
              scale and the tape measure actually do.
            </p>
            <p>
              Recalculate whenever weight changes by several kilograms or activity habits shift, because both move the target. The
              drop in basal rate during weight loss is one of the main reasons progress slows, and it is partly offset by
              resistance training and adequate protein, which protect the lean tissue that drives the resting figure.
            </p>
            <p>
              Finally, remember that a large deficit is not automatically better. Eating well below the basal rate makes tiredness,
              poor recovery and muscle loss far more likely. Deficit sizes of ten to twenty percent below maintenance are easier
              to sustain, and the summary panel shows the per-week and per-year totals that follow from your current numbers.
              Weigh yourself under the same conditions each time, because a single reading reflects water and food as much as
              tissue, and compare weekly averages instead of daily fluctuations.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmr-calculator" />
          <PopularCalculators exclude="/calculator/bmr-calculator" />
        </div>
      </div>
    </>
  );
}
