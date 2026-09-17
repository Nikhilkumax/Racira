"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ── 1. TypeScript interfaces — no 'any' ──────────────────────────────────
interface CalorieIntakeInputs {
  gender: "male" | "female";
  age: number;
  weightLb: number;
  heightIn: number;
  activity: number;
  goal: number; // daily calorie adjustment (kcal)
}

interface CalorieIntakeResult {
  bmr: number;
  tdee: number;
  target: number;
  goalAdjustment: number;
  weightKg: number;
  heightCm: number;
  activityFactor: number;
  goalLabel: string;
  chartData: { name: string; value: number; color: string; pct: number }[];
  breakdown: { label: string; value: string; highlight?: boolean; isTotal?: boolean }[];
  summary: { label: string; value: string }[];
}

// ── 2. Pure calculation function — zero React, fully typed ───────────────
function calculateCalorieIntake(inputs: CalorieIntakeInputs): CalorieIntakeResult {
  const { gender, age, weightLb, heightIn, activity, goal } = inputs;
  const weightKg = weightLb * 0.45359237;
  const heightCm = heightIn * 2.54;
  // Mifflin-St Jeor equation
  const bmr = gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const tdee = bmr * activity;
  const target = Math.max(1200, Math.round(tdee + goal));
  const goalAdjustment = goal;

  const goalLabel =
    goal === 0 ? "Maintain weight" :
    goal < 0 ? `Lose ${Math.round((-goal / 250))} lb per week` :
    `Gain ${Math.round((goal / 250))} lb per week`;

  const activityBurn = Math.max(0, tdee - bmr);
  const total = bmr + activityBurn;
  const pctBmr = total > 0 ? Math.round((bmr / total) * 1000) / 10 : 0;
  const pctAct = total > 0 ? Math.round((activityBurn / total) * 1000) / 10 : 0;

  const chartData = [
    { name: "BMR (at rest)", value: Math.round(bmr), color: "hsl(var(--primary))", pct: pctBmr },
    { name: "Activity Burn", value: Math.round(activityBurn), color: "#f59e0b", pct: pctAct },
  ];

  const breakdown = [
    { label: "Weight", value: `${weightLb} lb (${weightKg.toFixed(1)} kg)` },
    { label: "Height", value: `${heightIn} in (${heightCm.toFixed(1)} cm)` },
    { label: "BMR (Mifflin-St Jeor)", value: `${Math.round(bmr).toLocaleString()} kcal`, highlight: true },
    { label: "Activity Factor", value: `${activity.toFixed(2)}x`, highlight: true },
    { label: "TDEE (Maintenance)", value: `${Math.round(tdee).toLocaleString()} kcal`, highlight: true },
    { label: "Goal Adjustment", value: `${goal > 0 ? "+" : ""}${goal} kcal/day` },
    { label: "Daily Calorie Target", value: `${target.toLocaleString()} kcal`, isTotal: true },
  ];

  const summary = [
    { label: "BMR", value: `${Math.round(bmr).toLocaleString()} kcal` },
    { label: "TDEE", value: `${Math.round(tdee).toLocaleString()} kcal` },
    { label: "Goal", value: goalLabel },
    { label: "Adjustment", value: `${goal > 0 ? "+" : ""}${goal} kcal` },
    { label: "Daily Target", value: `${target.toLocaleString()} kcal` },
    { label: "Weight", value: `${weightKg.toFixed(1)} kg` },
  ];

  return { bmr, tdee, target, goalAdjustment, weightKg, heightCm, activityFactor: activity, goalLabel, chartData, breakdown, summary };
}

// ── 3. DEFAULTS object — realistic values ────────────────────────────────
const DEFAULTS: CalorieIntakeInputs = { gender: "male", age: 30, weightLb: 175, heightIn: 70, activity: 1.55, goal: 0 };

// ── Shared UI helpers (typed, no 'any') ──────────────────────────────────
interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  min?: string;
  error?: string;
}

const CompactInput = ({ id, label, value, onChange, suffix, min, error }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <div className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${error ? "border-red-500" : "border-input"}`}>
      <input
        id={id}
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground shrink-0">{suffix}</span>}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

interface SelectInputProps {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

const SelectInput = ({ id, label, value, options, onChange }: SelectInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">{label}</label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 px-3 bg-background border border-input rounded-md text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name?: string | number; value?: number | string }[];
}

const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  return (
    <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold">
      <p className="font-bold text-muted-foreground mb-0.5">{String(p.name)}</p>
      <p className="text-primary font-extrabold text-sm">{typeof p.value === "number" ? `${Math.round(p.value).toLocaleString()} kcal` : String(p.value)}</p>
    </div>
  );
};

// ── 4. Component ─────────────────────────────────────────────────────────
export default function CalorieIntakeCalculator() {
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [weight, setWeight] = useState(String(DEFAULTS.weightLb));
  const [height, setHeight] = useState(String(DEFAULTS.heightIn));
  const [activity, setActivity] = useState(String(DEFAULTS.activity));
  const [goal, setGoal] = useState(String(DEFAULTS.goal));
  const [results, setResults] = useState<CalorieIntakeResult>(() => calculateCalorieIntake(DEFAULTS));

  const getInputs = (): CalorieIntakeInputs => ({
    gender: gender as "male" | "female",
    age: parseFloat(age) || 0,
    weightLb: parseFloat(weight) || 0,
    heightIn: parseFloat(height) || 0,
    activity: parseFloat(activity) || 0,
    goal: parseFloat(goal) || 0,
  });

  useEffect(() => {
    setResults(calculateCalorieIntake(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valErrors: Record<string, string> = {};
  const ageNum = parseFloat(age) || 0;
  const weightNum = parseFloat(weight) || 0;
  const heightNum = parseFloat(height) || 0;
  if (ageNum < 10 || ageNum > 100) valErrors.age = "Age must be 10–100";
  if (weightNum < 50 || weightNum > 700) valErrors.weight = "Weight must be 50–700 lb";
  if (heightNum < 36 || heightNum > 96) valErrors.height = "Height must be 36–96 in";
  const hasErrors = Object.keys(valErrors).length > 0;

  const calc = () => {
    if (hasErrors) return;
    setResults(calculateCalorieIntake(getInputs()));
  };

  const reset = () => {
    setGender(DEFAULTS.gender);
    setAge(String(DEFAULTS.age));
    setWeight(String(DEFAULTS.weightLb));
    setHeight(String(DEFAULTS.heightIn));
    setActivity(String(DEFAULTS.activity));
    setGoal(String(DEFAULTS.goal));
    setResults(calculateCalorieIntake(DEFAULTS));
  };

  const handlePrint = () => window.print();

  const activityOptions = [
    { value: "1.2", label: "Sedentary (little exercise)" },
    { value: "1.375", label: "Lightly Active (1–3 days/week)" },
    { value: "1.55", label: "Moderately Active (3–5 days/week)" },
    { value: "1.725", label: "Very Active (6–7 days/week)" },
    { value: "1.9", label: "Extremely Active (physical job)" },
  ];

  const goalOptions = [
    { value: "-500", label: "Lose 2 lb / week (aggressive)" },
    { value: "-250", label: "Lose 1 lb / week (moderate)" },
    { value: "0", label: "Maintain current weight" },
    { value: "250", label: "Gain 1 lb / week (moderate)" },
    { value: "500", label: "Gain 2 lb / week (aggressive)" },
  ];

  const faqs = [
    {
      question: "How is daily calorie intake calculated?",
      answer: "This calculator uses the Mifflin-St Jeor equation, the most accurate widely used formula, to estimate your basal metabolic rate (BMR) — the calories your body burns at rest. BMR is multiplied by an activity factor to get total daily energy expenditure (TDEE), your maintenance calories. Your goal then adjusts TDEE: roughly 3,500 calories equals one pound of body weight, so a 500-calorie daily deficit produces about one pound of weight loss per week.",
    },
    {
      question: "What is the difference between BMR and TDEE?",
      answer: "BMR is the energy your body needs to sustain basic life functions — breathing, circulation, cell repair — while at complete rest. TDEE adds the calories burned through everyday movement and exercise. A 175 lb, 5'10\", 30-year-old moderately active man has a BMR around 1,790 kcal and a TDEE around 2,770 kcal. The gap between them is your activity burn, shown in the donut chart.",
    },
    {
      question: "Why is my target floored at 1,200 calories?",
      answer: "Very low intakes make it nearly impossible to meet vitamin and mineral needs, and they slow metabolism by burning lean mass. The calculator floors the target at 1,200 kcal for safety. If your goal requires less than that, favor a slower rate of loss or add exercise rather than cutting intake further.",
    },
  ];

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-section, .print-section * { visibility: visible; }
          .print-section { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
        }
      `}</style>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Calorie Intake Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Intake Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT — INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="gender" label="Sex" value={gender} options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }]} onChange={(v) => setGender(v as "male" | "female")} />
              <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" min="10" error={valErrors.age} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CompactInput id="weight" label="Weight" value={weight} onChange={setWeight} suffix="lb" min="50" error={valErrors.weight} />
              <CompactInput id="height" label="Height" value={height} onChange={setHeight} suffix="in" min="36" error={valErrors.height} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectInput id="activity" label="Activity Level" value={activity} options={activityOptions} onChange={setActivity} />
              <SelectInput id="goal" label="Goal" value={goal} options={goalOptions} onChange={setGoal} />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={calc}
                className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"}`}
              >Calculate</button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
            {hasErrors && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">
                ⚠️ Please fix the errors above before calculating.
              </div>
            )}
          </div>

          {/* RIGHT — RESULTS */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Daily Calorie Target</div>
              <div className="text-4xl font-bold text-primary tracking-tight">{results.target.toLocaleString()} <span className="text-2xl font-semibold">kcal</span></div>
              <div className="text-sm text-muted-foreground mt-1 font-medium">
                {results.goalLabel} — TDEE {Math.round(results.tdee).toLocaleString()} kcal {results.goalAdjustment !== 0 ? `${results.goalAdjustment > 0 ? "+" : ""}${results.goalAdjustment} kcal` : ""}.
              </div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">BMR</span>
                <span className="font-extrabold text-foreground">{Math.round(results.bmr).toLocaleString()} kcal</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">TDEE</span>
                <span className="font-extrabold text-foreground">{Math.round(results.tdee).toLocaleString()} kcal</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Adjustment</span>
                <span className={`font-extrabold ${results.goalAdjustment < 0 ? "text-red-600" : results.goalAdjustment > 0 ? "text-emerald-600" : "text-foreground"}`}>{results.goalAdjustment > 0 ? "+" : ""}{results.goalAdjustment} kcal</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right w-[220px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.breakdown.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : row.highlight ? "bg-amber-500/10" : "hover:bg-secondary/20"}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center">
              <h3 className="text-base font-bold mb-2 w-full text-left">Where Your Calories Go</h3>
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={results.chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name">
                    {results.chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                {results.chartData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    {d.name} — {d.pct}%
                  </div>
                ))}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-3 text-foreground">Summary</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {results.summary.map((row, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{row.label}</span>
                    <span className="text-sm font-extrabold text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Calorie Intake Calculator?</h2>
            <p>Your daily calorie intake target is the number of calories you should eat to reach a specific weight goal — maintain, lose, or gain. It is built from your basal metabolic rate, adjusted for how active you are, then shifted by the energy balance you want: roughly 3,500 calories equals one pound of body weight.</p>
            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>This calculator estimates BMR with the Mifflin-St Jeor equation, the most widely validated formula, using your sex, age, weight, and height. BMR is multiplied by an activity factor (1.2 to 1.9) to produce TDEE, your maintenance intake. Your goal then applies a fixed daily adjustment of 250 or 500 calories — equal to a 0.5 or 1 lb weekly change — and the result is your daily calorie target.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>The primary number is your daily calorie target for the selected goal. The three-stat bar separates BMR, TDEE, and the goal adjustment; the donut chart shows how TDEE splits between resting burn and activity; and the breakdown table walks each step so the headline number can be verified. Adjust the goal selector to see how moving between maintain, lose, and gain shifts the target by exactly 250 kcal per half-pound step.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-intake-calculator" />
          <PopularCalculators exclude="/calculator/calorie-intake-calculator" />
        </div>
      </div>
    </>
  );
}
