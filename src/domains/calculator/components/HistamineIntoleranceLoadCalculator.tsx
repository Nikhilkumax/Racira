"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface FoodItem {
  key: string;
  label: string;
  serving: string;
  histamineUg: number;
  liberator: boolean;
  daoBlocker: boolean;
}

/**
 * Typical histamine content per serving. Values follow the published food tables
 * used in histamine-intolerance practice (Swiss, German and Dutch analyses), which
 * report very wide ranges because ripening, storage and spoilage all raise the
 * histamine content sharply.
 */
const FOODS: FoodItem[] = [
  { key: "aged-cheese", label: "Aged hard cheese", serving: "30 g", histamineUg: 600, liberator: true, daoBlocker: false },
  { key: "blue-cheese", label: "Blue cheese", serving: "30 g", histamineUg: 800, liberator: true, daoBlocker: false },
  { key: "cured-sausage", label: "Cured sausage or salami", serving: "50 g", histamineUg: 500, liberator: false, daoBlocker: false },
  { key: "cured-ham", label: "Cured ham or prosciutto", serving: "50 g", histamineUg: 400, liberator: false, daoBlocker: false },
  { key: "canned-fish", label: "Canned or smoked fish", serving: "100 g", histamineUg: 300, liberator: false, daoBlocker: false },
  { key: "sauerkraut", label: "Sauerkraut", serving: "100 g", histamineUg: 300, liberator: false, daoBlocker: false },
  { key: "kimchi", label: "Kimchi or fermented vegetables", serving: "100 g", histamineUg: 120, liberator: false, daoBlocker: false },
  { key: "red-wine", label: "Red wine", serving: "150 ml", histamineUg: 250, liberator: false, daoBlocker: true },
  { key: "beer", label: "Beer", serving: "330 ml", histamineUg: 100, liberator: false, daoBlocker: true },
  { key: "spinach", label: "Spinach", serving: "100 g", histamineUg: 150, liberator: true, daoBlocker: false },
  { key: "tomatoes", label: "Tomatoes or ketchup", serving: "100 g", histamineUg: 20, liberator: true, daoBlocker: false },
  { key: "fresh-fish", label: "Fresh fish, gutted and cooked immediately", serving: "100 g", histamineUg: 15, liberator: false, daoBlocker: false },
];

const DEFAULTS: HisInputs = {
  servings: {
    "aged-cheese": 1,
    "blue-cheese": 0,
    "cured-sausage": 1,
    "cured-ham": 0,
    "canned-fish": 1,
    sauerkraut: 0,
    kimchi: 1,
    "red-wine": 1,
    beer: 0,
    spinach: 0,
    tomatoes: 0,
    "fresh-fish": 0,
  },
  threshold: 100,
  mealsPerDay: 3,
  daoCapacityPct: 70,
  decimals: 0,
};

interface HisInputs {
  servings: Record<string, number>;
  threshold: number;
  mealsPerDay: number;
  daoCapacityPct: number;
  decimals: number;
}

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface HisResult {
  valid: boolean;
  errorMsg: string;
  totalUg: number;
  liberatorServings: number;
  blockerServings: number;
  liberatorUpliftPct: number;
  effectiveUg: number;
  toleranceUg: number;
  loadPct: number;
  dailyUg: number;
  dailyToleranceUg: number;
  dailyLoadPct: number;
  headroomUg: number;
  status: string;
  statusColor: string;
  dominant: { label: string; ug: number; sharePct: number } | null;
  contributors: { label: string; servings: number; ug: number; sharePct: number }[];
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

const LIBERATOR_UPLIFT = 0.15;
const BLOCKER_PENALTY = 0.2;

function calculateHistamine(input: HisInputs): HisResult {
  const blank = (errorMsg: string): HisResult => ({
    valid: false,
    errorMsg,
    totalUg: 0,
    liberatorServings: 0,
    blockerServings: 0,
    liberatorUpliftPct: 0,
    effectiveUg: 0,
    toleranceUg: 0,
    loadPct: 0,
    dailyUg: 0,
    dailyToleranceUg: 0,
    dailyLoadPct: 0,
    headroomUg: 0,
    status: "",
    statusColor: "text-muted-foreground",
    dominant: null,
    contributors: [],
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const values = FOODS.map((f) => input.servings[f.key] ?? 0);
  if (!values.every((v) => Number.isFinite(v))) return blank("Enter a number of servings for every food.");
  if (values.some((v) => v < 0)) return blank("Servings cannot be negative.");
  if (!Number.isFinite(input.threshold) || input.threshold <= 0) {
    return blank("The personal histamine threshold must be greater than zero micrograms per meal.");
  }
  if (!Number.isFinite(input.mealsPerDay) || input.mealsPerDay < 1 || input.mealsPerDay > 8) {
    return blank("Meals per day should be between 1 and 8.");
  }
  if (!Number.isFinite(input.daoCapacityPct) || input.daoCapacityPct < 5 || input.daoCapacityPct > 100) {
    return blank("Diamine oxidase capacity should be between 5% and 100%.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));

  const contributors = FOODS.map((f) => {
    const servings = input.servings[f.key] ?? 0;
    return { label: f.label, servings, ug: servings * f.histamineUg, sharePct: 0 };
  }).filter((c) => c.servings > 0);

  const totalUg = contributors.reduce((sum, c) => sum + c.ug, 0);
  if (totalUg === 0) return blank("Add at least one serving of a food to see the histamine load for this meal.");

  contributors.forEach((c) => {
    c.sharePct = (c.ug / totalUg) * 100;
  });
  contributors.sort((a, b) => b.ug - a.ug);
  const dominant = contributors[0];

  // Liberators prompt mast cells to release their own histamine, so they are
  // modelled as a percentage uplift on the amount eaten rather than as histamine
  // in the food itself. Alcohol blocks the diamine oxidase that would clear it.
  const liberatorServings = FOODS.filter((f) => f.liberator).reduce((sum, f) => sum + (input.servings[f.key] ?? 0), 0);
  const blockerServings = FOODS.filter((f) => f.daoBlocker).reduce((sum, f) => sum + (input.servings[f.key] ?? 0), 0);

  const liberatorUpliftPct = liberatorServings * LIBERATOR_UPLIFT * 100;
  const effectiveUg = totalUg * (1 + liberatorServings * LIBERATOR_UPLIFT);
  const blockerPenalty = Math.min(0.8, blockerServings * BLOCKER_PENALTY);
  const toleranceUg = input.threshold * (input.daoCapacityPct / 100) * (1 - blockerPenalty);
  const loadPct = toleranceUg > 0 ? (effectiveUg / toleranceUg) * 100 : 0;
  const dailyUg = effectiveUg * input.mealsPerDay;
  const dailyToleranceUg = toleranceUg * input.mealsPerDay;
  const dailyLoadPct = dailyToleranceUg > 0 ? (dailyUg / dailyToleranceUg) * 100 : 0;
  const headroomUg = toleranceUg - effectiveUg;

  const status =
    loadPct > 150
      ? "Well above your tolerance"
      : loadPct > 100
        ? "Above your tolerance"
        : loadPct > 75
          ? "Close to your tolerance"
          : "Within your tolerance";
  const statusColor =
    loadPct > 100 ? "text-red-600" : loadPct > 75 ? "text-orange-600" : "text-emerald-600";

  const verdict =
    loadPct > 100
      ? `This meal carries about ${fmt(loadPct / 100, 1)} times the histamine your stated tolerance covers — ${dominant.label.toLowerCase()} is the largest single contributor`
      : `This meal fits inside your stated tolerance with ${fmt(headroomUg, 0)} µg of headroom, and ${dominant.label.toLowerCase()} is the largest single contributor`;
  const verdictColor = loadPct > 100 ? "text-red-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    ...contributors.map((c) => ({
      label: `${c.label} × ${fmt(c.servings, 1)} serving${c.servings === 1 ? "" : "s"}`,
      value: `${fmt(c.ug, 0)} µg · ${fmt(c.sharePct, 0)}% of the load`,
    })),
    { label: "Histamine eaten in this meal", value: `${fmt(totalUg, d)} µg`, highlight: true },
    {
      label: `Histamine-liberating servings (${fmt(liberatorServings, 1)})`,
      value: `+${fmt(liberatorUpliftPct, 0)}% uplift from mast-cell release`,
    },
    { label: "Load after the liberator uplift", value: `${fmt(effectiveUg, d)} µg`, highlight: true },
    { label: "Diamine oxidase capacity available", value: `${fmt(input.daoCapacityPct, 0)}% of normal` },
    {
      label: `Alcohol servings (${fmt(blockerServings, 1)}) blocking DAO`,
      value: `−${fmt(blockerPenalty * 100, 0)}% of the remaining capacity`,
    },
    { label: "Effective histamine tolerance for this meal", value: `${fmt(toleranceUg, d)} µg`, highlight: true },
    { label: "Load against tolerance", value: `${fmt(loadPct, 0)}%`, highlight: true },
    { label: headroomUg >= 0 ? "Headroom left below tolerance" : "Amount over tolerance", value: `${fmt(Math.abs(headroomUg), d)} µg` },
    { label: `Across ${fmt(input.mealsPerDay, 0)} meals like this a day`, value: `${fmt(dailyUg, 0)} µg/day` },
    { label: "Daily tolerance at the same setting", value: `${fmt(dailyToleranceUg, 0)} µg/day` },
    { label: "Daily load against daily tolerance", value: `${fmt(dailyLoadPct, 0)}%` },
    { label: "Dominant contributor", value: `${dominant.label} at ${fmt(dominant.sharePct, 0)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    totalUg,
    liberatorServings,
    blockerServings,
    liberatorUpliftPct,
    effectiveUg,
    toleranceUg,
    loadPct,
    dailyUg,
    dailyToleranceUg,
    dailyLoadPct,
    headroomUg,
    status,
    statusColor,
    dominant: { label: dominant.label, ug: dominant.ug, sharePct: dominant.sharePct },
    contributors,
    verdict,
    verdictColor,
    breakdown,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  error?: string;
  type?: string;
  min?: string;
  max?: string;
  step?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  onEnter,
  hint,
  error,
  type = "number",
  min,
  max,
  step,
  suffix,
  tooltip,
}: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div
      className={`relative w-full flex items-center rounded-md border bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all ${
        error ? "border-destructive" : "border-input"
      }`}
    >
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
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
    {hint && !error && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
  </div>
);

const CompactSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  tooltip,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  tooltip?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-background outline-none focus:outline-none border-none text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function HistamineIntoleranceLoadCalculator() {
  const [servings, setServings] = useState<Record<string, string>>(() =>
    Object.fromEntries(FOODS.map((f) => [f.key, String(DEFAULTS.servings[f.key] ?? 0)])),
  );
  const [threshold, setThreshold] = useState(String(DEFAULTS.threshold));
  const [mealsPerDay, setMealsPerDay] = useState(String(DEFAULTS.mealsPerDay));
  const [daoCapacityPct, setDaoCapacityPct] = useState(String(DEFAULTS.daoCapacityPct));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const setServing = (key: string, value: string) => {
    setServings((prev) => ({ ...prev, [key]: value }));
  };

  const getInputs = (): HisInputs => ({
    servings: Object.fromEntries(FOODS.map((f) => [f.key, parseFloat(servings[f.key]) || 0])),
    threshold: parseFloat(threshold) || 0,
    mealsPerDay: parseFloat(mealsPerDay) || 0,
    daoCapacityPct: parseFloat(daoCapacityPct) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<HisInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HisResult>(() => calculateHistamine(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateHistamine(inputs));
  };

  const reset = () => {
    setServings(Object.fromEntries(FOODS.map((f) => [f.key, String(DEFAULTS.servings[f.key] ?? 0)])));
    setThreshold(String(DEFAULTS.threshold));
    setMealsPerDay(String(DEFAULTS.mealsPerDay));
    setDaoCapacityPct(String(DEFAULTS.daoCapacityPct));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateHistamine(DEFAULTS));
  };

  const thresholdNum = parseFloat(threshold);
  const mealsNum = parseFloat(mealsPerDay);
  const daoNum = parseFloat(daoCapacityPct);

  const servingError = (key: string) => {
    const v = parseFloat(servings[key]);
    if (!Number.isFinite(v)) return "Number only";
    if (v < 0) return "Cannot be negative";
    return "";
  };

  const errors = {
    threshold: !Number.isFinite(thresholdNum) || thresholdNum <= 0 ? "Must be greater than zero" : "",
    meals: !Number.isFinite(mealsNum) || mealsNum < 1 || mealsNum > 8 ? "Use 1–8 meals" : "",
    dao: !Number.isFinite(daoNum) || daoNum < 5 || daoNum > 100 ? "Use 5–100%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean) || FOODS.some((f) => servingError(f.key) !== "");

  const faqs = [
    {
      question: "What is histamine intolerance?",
      answer:
        "It is a reduced ability to break down dietary histamine, usually because the diamine oxidase enzyme that clears it in the gut is low or its activity is blocked. Histamine is present in the food itself, mainly in fermented, cured and aged products, and it is also released by the body when certain foods trigger mast cells. When intake exceeds clearance, the surplus circulates and produces symptoms such as headache, flushing, hives, a runny nose, abdominal cramps and diarrhoea.",
    },
    {
      question: "Which foods carry the most histamine?",
      answer:
        "Aged and blue cheese, cured meats such as salami and prosciutto, canned, smoked or improperly stored fish, sauerkraut and other fermented vegetables, and red wine are the classic heavy contributors. The numbers in this calculator use servings of 30 to 100 grams and 150 millilitres of wine, at the middle of the very wide published ranges. Freshness matters more than food group: fresh fish that was gutted and cooked immediately carries perhaps 15 micrograms per 100 grams, while the same fish left warm for a day can exceed 500.",
    },
    {
      question: "How do liberators and alcohol change the load?",
      answer:
        "Histamine-liberating foods such as aged cheese, spinach, tomatoes and alcohol prompt the body to release its own histamine, so they raise the effective load without supplying much histamine themselves. Alcohol does the second thing as well: it inhibits diamine oxidase and is often the reason a meal that looks acceptable still produces symptoms. This calculator models liberators as a 15 percent uplift per serving and alcohol as a 20 percent reduction of the remaining enzyme capacity, which reflects the direction and rough size of both effects rather than a precise physiological measurement.",
    },
    {
      question: "How do I use the threshold?",
      answer:
        "The threshold is the histamine your own body tolerates in one meal, and it has to be established by trial rather than by calculation. A common starting point is 100 micrograms per meal, which a low-histamine diet can usually stay under, with the value raised or lowered as you learn how you respond. Capacity is not fixed either: it falls with alcohol, with intestinal inflammation, with some medications that block diamine oxidase, and it changes across the menstrual cycle, so the same meal can sit comfortably inside tolerance on one day and exceed it on another.",
    },
    {
      question: "When should I talk to a doctor instead of using a calculator?",
      answer:
        "If symptoms are persistent, severe, or include swelling of the lips or throat, wheezing or difficulty breathing, seek medical assessment rather than adjusting your diet alone. Those signs point away from simple histamine intolerance and towards allergy or another condition. Because the low-histamine diet is restrictive and nutritionally demanding, it is usually worth doing with a dietitian, and because the ranges in food tables are so wide, treat every figure here as an order-of-magnitude guide.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Histamine Intolerance Load Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Histamine Intolerance Load Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Servings in This Meal">
              {FOODS.map((food) => (
                <div key={food.key} className="grid grid-cols-2 gap-3 mt-3">
                  <div className="flex flex-col justify-center">
                    <span className="text-sm font-semibold text-foreground leading-tight">{food.label}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {food.serving} · about {fmt(food.histamineUg, 0)} µg
                      {food.liberator ? " · liberator" : ""}
                      {food.daoBlocker ? " · DAO blocker" : ""}
                    </span>
                  </div>
                  <CompactInput
                    id={`servings-${food.key}`}
                    label="Servings"
                    value={servings[food.key]}
                    onChange={(v) => setServing(food.key, v)}
                    onEnter={runCalculate}
                    min="0"
                    step="0.5"
                    error={servingError(food.key)}
                    tooltip={`How many ${food.serving} servings of ${food.label.toLowerCase()} you are eating.`}
                  />
                </div>
              ))}
            </SubSection>

            <SubSection title="Your Tolerance">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="threshold"
                  label="Threshold per Meal"
                  value={threshold}
                  onChange={setThreshold}
                  onEnter={runCalculate}
                  min="1"
                  step="1"
                  suffix="µg"
                  error={errors.threshold}
                  hint="100 µg per meal is a common start."
                  tooltip="Histamine you tolerate in one meal, established by trial."
                />
                <CompactInput
                  id="meals"
                  label="Meals Like This per Day"
                  value={mealsPerDay}
                  onChange={setMealsPerDay}
                  onEnter={runCalculate}
                  min="1"
                  max="8"
                  step="1"
                  error={errors.meals}
                  tooltip="Used to scale the load across a full day."
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
                  <SubSection title="Enzyme Capacity">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="dao"
                        label="DAO Capacity"
                        value={daoCapacityPct}
                        onChange={setDaoCapacityPct}
                        onEnter={runCalculate}
                        min="5"
                        max="100"
                        step="5"
                        suffix="%"
                        error={errors.dao}
                        hint="Lower it when gut health is poor."
                        tooltip="Diamine oxidase activity as a percentage of normal; alcohol and inflammation reduce it."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the histamine totals."
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
                disabled={hasErrors}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Histamine Load</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.effectiveUg, calcInputs.decimals)} µg` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.loadPct, 0)}% of the ${fmt(results.toleranceUg, 0)} µg your tolerance covers — ${results.status.toLowerCase()}`
                  : "Fix the highlighted inputs to score the meal"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">In the Food</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.totalUg, 0)} µg` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tolerance</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.toleranceUg, 0)} µg` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Load</span>
                <span className={`font-extrabold ${results.valid ? results.statusColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.dailyLoadPct, 0)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Load Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.valid ? (
                    results.breakdown.map((row) => (
                      <tr key={row.label} className={row.highlight ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                        <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                        <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-2.5 pl-3 text-muted-foreground" colSpan={2}>
                        Enter the servings in your meal to see the histamine load.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Histamine load per meal</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.effectiveUg, calcInputs.decimals)} µg · ${fmt(results.loadPct, 0)}% of tolerance`}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">Summary Statistics</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Histamine in food</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.totalUg, 0)} µg` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Liberator uplift</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `+${fmt(results.liberatorUpliftPct, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective load</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.effectiveUg, 0)} µg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tolerance</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.toleranceUg, 0)} µg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Headroom below tolerance</span>
                  <span className={`text-base font-bold ${results.valid ? results.statusColor : "text-muted-foreground"}`}>
                    {results.valid ? `${fmt(results.headroomUg, 0)} µg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Load against tolerance</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.loadPct, 0)}%` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Daily load</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.dailyUg, 0)} µg` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Status</span>
                  <span className={`text-base font-bold ${results.statusColor}`}>{results.valid ? results.status : "—"}</span>
                </div>
              </div>
              {results.valid && results.dominant && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Largest single contributor: {results.dominant.label.toLowerCase()} at {fmt(results.dominant.ug, 0)} µg, which is{" "}
                  {fmt(results.dominant.sharePct, 0)}% of the histamine in the meal. Food values are mid-range figures from published
                  histamine tables — freshness, ripening and storage move them by far more than this model can.
                </p>
              )}
              {results.valid && <p className={`text-[11px] mt-2 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Histamine Intolerance Load Calculator?</h2>
            <p>
              A histamine intolerance load calculator adds up the histamine in a meal, adjusts it for the foods that provoke your own
              histamine release and for the enzyme blockers that slow its clearance, and compares the total with the amount you
              personally tolerate. It is a way to see which components of a meal are doing the damage, and to test a replacement meal
              before eating it rather than after the headache starts.
            </p>
            <p>
              The underlying idea is simple: symptoms appear when the histamine entering the body from food and from mast cells exceeds
              the capacity of the enzymes — primarily diamine oxidase in the gut and histamine N-methyltransferase elsewhere — to break
              it down. Both sides of that balance move, which is why the same meal can be fine one week and troublesome the next.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each food in the list carries a mid-range histamine figure for a stated serving, taken from the published tables used in
              histamine-intolerance practice. Aged cheese and cured meat sit in the hundreds of micrograms per serving, canned and smoked
              fish and sauerkraut around three hundred, red wine around two hundred and fifty per glass, and fresh, properly handled fish
              only about fifteen per hundred grams. Multiplying the servings you ate by those figures gives the histamine the food
              itself delivered.
            </p>
            <p>
              Liberators are handled separately because they supply little histamine but prompt mast cells to release your own. Aged
              cheese, spinach, tomatoes and alcohol are the familiar examples, and the calculator applies a fifteen percent uplift for
              each liberating serving. Alcohol earns a second adjustment: it inhibits diamine oxidase, so each alcoholic serving in the
              meal cuts the enzyme capacity that remains, at twenty percent per serving up to a ceiling of eighty percent.
            </p>
            <p>
              Your threshold is the third input, and it is deliberately yours rather than a published constant. The calculator reduces
              it by your stated enzyme capacity and by the alcohol penalty to give an effective tolerance for that meal, then expresses
              the load as a percentage of it. Scaling both sides across a day shows the pattern that matters most in practice: two meals
              comfortably inside tolerance can still leave a total that the body cannot clear before the next one arrives.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the effective histamine load with your percentage of tolerance underneath. The three-stat bar adds the
              histamine present in the food before adjustments, the tolerance the meal was measured against and the daily load
              percentage.
            </p>
            <p>
              The breakdown table lists every contributor with its share of the load, then walks through the liberator uplift, the
              alcohol penalty on enzyme capacity, the effective tolerance, the headroom or overshoot and the daily projection. The
              summary panel names the dominant contributor and prints the verdict line, which tells you whether the meal sits inside or
              outside your stated tolerance.
            </p>
            <p>
              Two cautions belong with any result from this tool. First, the food figures are ranges, not constants: a cheese at the
              fresh end of its life may hold a tenth of the histamine of the same cheese three weeks later, and fish that has sat warm
              can multiply its content many times over, so freshness and storage decide more than the recipe does. Second, this is a
              dietary self-management aid, not a diagnosis — if reactions are severe, or if the symptoms include wheezing or
              swelling of the face, lips or throat, that is a medical emergency rather than a histamine load to be recalculated. Work
              with a clinician or dietitian before making the low-histamine diet a long-term habit, because it removes a lot of
              nutritious food.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/histamine-intolerance-load-calculator" />
          <PopularCalculators exclude="/calculator/histamine-intolerance-load-calculator" />
        </div>
      </div>
    </>
  );
}
