"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Sex = "male" | "female";

interface CalorieInputs {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: number;
  bodyFat: number;
  proteinPerKg: number;
}

const DEFAULTS: CalorieInputs = {
  sex: "male",
  age: 30,
  heightCm: 178,
  weightKg: 78,
  activity: 1.55,
  bodyFat: 20,
  proteinPerKg: 1.8,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const ACTIVITY_LEVELS: { value: number; label: string; note: string }[] = [
  { value: 1.2, label: "Sedentary", note: "Little or no exercise" },
  { value: 1.375, label: "Light", note: "Light exercise 1–3 days a week" },
  { value: 1.55, label: "Moderate", note: "Moderate exercise 3–5 days a week" },
  { value: 1.725, label: "Active", note: "Hard exercise 6–7 days a week" },
  { value: 1.9, label: "Athlete", note: "Twice-daily training" },
];

interface GoalRow {
  label: string;
  weeklyChangeKg: number;
  dailyDelta: number;
  calories: number;
  note: string;
}

interface ActivityRow {
  label: string;
  multiplier: number;
  tdee: number;
  maintenancePortions: string;
  selected: boolean;
}

interface CalorieResult {
  valid: boolean;
  errorMsg: string;
  bmr: number;
  bmrLean: number;
  tdee: number;
  leanMass: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  waterLitres: number;
  goals: GoalRow[];
  activityRows: ActivityRow[];
}

function computeCalorie(input: CalorieInputs): CalorieResult {
  const { sex, age, heightCm, weightKg, activity, bodyFat, proteinPerKg } = input;

  const blank: CalorieResult = {
    valid: false,
    errorMsg: "",
    bmr: 0,
    bmrLean: 0,
    tdee: 0,
    leanMass: 0,
    proteinGrams: 0,
    carbGrams: 0,
    fatGrams: 0,
    waterLitres: 0,
    goals: [],
    activityRows: [],
  };

  if (!Number.isFinite(age) || !Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
    return { ...blank, errorMsg: "Enter your age, height and weight to estimate daily calorie needs." };
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

  const bf = Math.max(0, Math.min(70, Number.isFinite(bodyFat) ? bodyFat : 20));
  const leanMass = weightKg * (1 - bf / 100);
  const bmrLean = 370 + 21.6 * leanMass;

  const multiplier = ACTIVITY_LEVELS.some((a) => a.value === activity) ? activity : 1.55;
  const tdee = bmr * multiplier;

  const goalSpecs: { label: string; weekly: number; note: string }[] = [
    { label: "Extreme weight loss", weekly: -1, note: "Very aggressive, medical supervision advised" },
    { label: "Aggressive weight loss", weekly: -0.75, note: "Hard to sustain for long periods" },
    { label: "Standard weight loss", weekly: -0.5, note: "The usual half kilo per week target" },
    { label: "Mild weight loss", weekly: -0.25, note: "Slow but very sustainable" },
    { label: "Maintain weight", weekly: 0, note: "Eat at your maintenance level" },
    { label: "Mild weight gain", weekly: 0.25, note: "Supports lean gains with training" },
    { label: "Standard weight gain", weekly: 0.5, note: "Faster bulk, more fat gain likely" },
  ];

  const goals: GoalRow[] = goalSpecs.map((g) => {
    const dailyDelta = (g.weekly * 7700) / 7;
    return {
      label: g.label,
      weeklyChangeKg: g.weekly,
      dailyDelta: Math.round(dailyDelta),
      calories: Math.max(1000, Math.round(tdee + dailyDelta)),
      note: g.note,
    };
  });

  const activityRows: ActivityRow[] = ACTIVITY_LEVELS.map((level) => {
    const rowTdee = bmr * level.value;
    return {
      label: level.label,
      multiplier: level.value,
      tdee: Math.round(rowTdee),
      maintenancePortions: `${fmt(rowTdee / 500, 2)} × 500 kcal`,
      selected: level.value === multiplier,
    };
  });

  const proteinGrams = Math.round(weightKg * Math.max(0.8, Math.min(3, proteinPerKg)));
  const fatGrams = Math.round((tdee * 0.27) / 9);
  const carbGrams = Math.max(0, Math.round((tdee - proteinGrams * 4 - fatGrams * 9) / 4));

  return {
    valid: true,
    errorMsg: "",
    bmr: Math.round(bmr),
    bmrLean: Math.round(bmrLean),
    tdee: Math.round(tdee),
    leanMass: Number(leanMass.toFixed(1)),
    proteinGrams,
    carbGrams,
    fatGrams,
    waterLitres: Number(((weightKg * 0.033) + (multiplier - 1.2) * 0.7).toFixed(2)),
    goals,
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

export default function CalorieCalculator() {
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [activity, setActivity] = useState(String(DEFAULTS.activity));
  const [bodyFat, setBodyFat] = useState(String(DEFAULTS.bodyFat));
  const [proteinPerKg, setProteinPerKg] = useState(String(DEFAULTS.proteinPerKg));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CalorieInputs => ({
    sex,
    age: parseFloat(age) || 0,
    heightCm: parseFloat(heightCm) || 0,
    weightKg: parseFloat(weightKg) || 0,
    activity: parseFloat(activity) || 1.55,
    bodyFat: parseFloat(bodyFat) || 0,
    proteinPerKg: parseFloat(proteinPerKg) || 1.8,
  });

  const [calcInputs, setCalcInputs] = useState<CalorieInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CalorieResult>(() => computeCalorie(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeCalorie(inputs));
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAge(String(DEFAULTS.age));
    setHeightCm(String(DEFAULTS.heightCm));
    setWeightKg(String(DEFAULTS.weightKg));
    setActivity(String(DEFAULTS.activity));
    setBodyFat(String(DEFAULTS.bodyFat));
    setProteinPerKg(String(DEFAULTS.proteinPerKg));
    setCalcInputs(DEFAULTS);
    setResults(computeCalorie(DEFAULTS));
  };

  const maintenance = results.goals.find((g) => g.weeklyChangeKg === 0);

  const faqs = [
    {
      question: "How many calories should I eat to lose weight?",
      answer:
        "Subtract a deficit from your maintenance level, which is the total daily energy expenditure. Half a kilogram of fat per week requires roughly a five hundred calorie daily deficit, because a kilogram of fat stores about seven thousand seven hundred calories. Smaller deficits of two hundred to three hundred calories are easier to hold, which usually matters more than the theoretical speed.",
    },
    {
      question: "Why does calorie need change with activity?",
      answer:
        "Basal metabolic rate covers only the energy used at rest, and physical activity adds to it. Multiplying by 1.2 for a sedentary day and by 1.9 for twice-daily training produces a range of several hundred calories at the same body size. Choosing the level honestly is the single most important input, since overestimating activity hides the deficit that was planned.",
    },
    {
      question: "Are all calories the same?",
      answer:
        "For body weight, energy balance dominates, but the composition of those calories affects appetite, muscle retention and health. Adequate protein protects lean mass during a deficit, fibre improves satiety, and very low fat intakes interfere with hormone production. The same calorie total can therefore produce quite different results depending on what makes up the food.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Calorie Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="About You">
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
            </SubSection>

            <SubSection title="Activity Level">
              <div className="grid grid-cols-3 gap-1.5">
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
                {ACTIVITY_LEVELS.find((l) => l.value === parseFloat(activity))?.note ?? "Moderate exercise 3–5 days a week"}
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
                  <SubSection title="Composition">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="body-fat"
                        label="Body Fat"
                        value={bodyFat}
                        onChange={setBodyFat}
                        onEnter={runCalculate}
                        suffix="%"
                        tooltip="Used for a lean-mass estimate of metabolic rate."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Maintenance Calories</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.tdee)} kcal` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.bmr)} kcal at rest plus activity · lean-mass estimate ${fmt(results.bmrLean)} kcal`
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
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lean Mass</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.leanMass, 1)} kg` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Water Target</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.waterLitres, 2)} L` : "—"}</span>
              </div>
            </div>

            {/* GOALS TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Goal</th>
                    <th className="p-2.5 text-right">Weekly Change</th>
                    <th className="p-2.5 text-right">Daily Delta</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Calories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.goals.map((row) => (
                    <tr
                      key={row.label}
                      className={row.weeklyChangeKg === 0 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        <span className="block text-[11px] font-normal text-muted-foreground">{row.note}</span>
                      </td>
                      <td className="p-2.5 text-right text-foreground">
                        {row.weeklyChangeKg === 0 ? "Steady" : `${row.weeklyChangeKg > 0 ? "+" : "−"}${Math.abs(row.weeklyChangeKg)} kg`}
                      </td>
                      <td className="p-2.5 text-right text-foreground">
                        {row.dailyDelta === 0 ? "0" : `${row.dailyDelta > 0 ? "+" : "−"}${Math.abs(row.dailyDelta)}`}
                      </td>
                      <td className="p-2.5 pr-3 text-right font-semibold text-foreground">{fmt(row.calories)} kcal</td>
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
                    <th className="p-2.5 pl-3">If Your Activity Is</th>
                    <th className="p-2.5 text-right">Factor</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Maintenance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.activityRows.map((row) => (
                    <tr key={row.label} className={row.selected ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{row.multiplier.toFixed(3)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.tdee)} kcal`}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maintenance</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.tdee)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Standard Cut</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(maintenance ? maintenance.calories - 500 : 0)} kcal`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Protein</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.proteinGrams)} g`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Carbohydrate</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.carbGrams)} g`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fat</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.fatGrams)} g`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weekly Intake</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.tdee * 7)} kcal`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Calorie Calculator?</h2>
            <p>
              A calorie calculator estimates how much energy your body uses in a day and turns that figure into targets for
              losing, maintaining or gaining weight. It starts from basal metabolic rate, adds an activity factor for movement and
              training, and then applies the deficit or surplus that matches a chosen weekly rate of change.
            </p>
            <p>
              The maintenance figure is the number worth knowing first. Eating at that level keeps weight stable, and every other
              target is simply a fixed amount above or below it. Knowing it turns vague advice about eating less into a specific
              daily number that can be planned, logged and adjusted.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The resting rate comes from the Mifflin-St Jeor equation, which uses weight, height, age and sex, or from the
              Katch-McArdle equation using lean body mass when a body fat figure is supplied. Multiplying by an activity factor
              between 1.2 and 1.9 produces maintenance calories, and the spread between those two numbers is the main reason
              calorie estimates from different tools disagree.
            </p>
            <p>
              Goal calories come from the energy stored in body tissue. A kilogram of fat holds roughly seven thousand seven
              hundred calories, so half a kilogram a week needs a daily deficit of about five hundred and fifty calories. The
              calculator applies the same arithmetic in reverse for weight gain and floors every target at a thousand calories to
              avoid suggesting an intake that cannot cover basic needs.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows maintenance calories with the resting rate and lean-mass estimate beneath it, while the
              three-stat bar adds lean mass and a hydration target. The first table lists every goal from aggressive loss through
              maintenance to standard gain, with the weekly rate and the daily calorie figure for each, and the second shows how
              maintenance changes across activity levels.
            </p>
            <p>
              Start at the standard loss or mild loss level rather than the aggressive end. Larger deficits cause faster initial
              weight change but also more hunger, worse training performance and more lean mass loss, and adherence usually
              collapses within a few weeks. Slower losses that hold lean tissue produce a better result when measured over months
              rather than days.
            </p>
            <p>
              Treat the numbers as an opening estimate and adjust from evidence. Track intake and weight for two to three weeks,
              then compare the predicted change with what actually happened. If weight is stable when a deficit was planned, the
              true maintenance level is lower than the estimate, and the target should come down by a hundred to two hundred
              calories rather than starting over.
            </p>
            <p>
              Finally, remember that food labels, portion estimates and restaurant meals all carry error, often ten percent or
              more. Precision in the calculation is useful, but consistency in what you actually eat matters more. Weekly averages
              smooth out the day-to-day noise from water, sodium and digestion, and they are the fairest way to judge whether the
              plan is working. If the target is genuinely difficult to hit, adding steps or a short training session raises
              maintenance calories and makes the same plate of food go further, which is often easier than cutting portions
              again.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-calculator" />
          <PopularCalculators exclude="/calculator/calorie-calculator" />
        </div>
      </div>
    </>
  );
}
