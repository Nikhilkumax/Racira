"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type LifeStageKey =
  | "men"
  | "women"
  | "pregnancy"
  | "lactation"
  | "teen14_18"
  | "teen9_13"
  | "child4_8"
  | "child1_3";

interface LifeStage {
  key: LifeStageKey;
  label: string;
  aiMg: number;
  ulMg: number;
}

/**
 * Adequate Intake and Upper Level figures from the IOM DRI report for choline
 * (1998, still the reference values in use), with the mg/kg basis that the AI
 * for children was derived from.
 */
const LIFE_STAGES: LifeStage[] = [
  { key: "men", label: "Adult man (19+)", aiMg: 550, ulMg: 3500 },
  { key: "women", label: "Adult woman (19+)", aiMg: 425, ulMg: 3500 },
  { key: "pregnancy", label: "Pregnancy", aiMg: 450, ulMg: 3500 },
  { key: "lactation", label: "Breastfeeding", aiMg: 550, ulMg: 3500 },
  { key: "teen14_18", label: "Teen 14–18", aiMg: 550, ulMg: 3000 },
  { key: "teen9_13", label: "Child 9–13", aiMg: 375, ulMg: 2000 },
  { key: "child4_8", label: "Child 4–8", aiMg: 250, ulMg: 1000 },
  { key: "child1_3", label: "Child 1–3", aiMg: 200, ulMg: 1000 },
];

interface SupplementForm {
  key: string;
  label: string;
  cholineFraction: number;
}

/** Choline content of common supplement forms by weight. */
const SUPPLEMENT_FORMS: SupplementForm[] = [
  { key: "bitartrate", label: "Choline bitartrate (41% choline)", cholineFraction: 0.414 },
  { key: "citicoline", label: "Citicoline / CDP-choline (18% choline)", cholineFraction: 0.183 },
  { key: "alpha-gpc", label: "Alpha-GPC (40% choline)", cholineFraction: 0.405 },
  { key: "chloride", label: "Choline chloride (75% choline)", cholineFraction: 0.746 },
  { key: "phosphatidyl", label: "Phosphatidylcholine (13% choline)", cholineFraction: 0.13 },
];

interface FoodSource {
  label: string;
  mg: number;
}

/** Choline per serving, USDA FoodData Central values (2024 release). */
const FOOD_SOURCES: FoodSource[] = [
  { label: "Eggs (1 large)", mg: 147 },
  { label: "Beef liver (3 oz cooked)", mg: 356 },
  { label: "Chicken breast (3 oz cooked)", mg: 68 },
  { label: "Salmon (3 oz cooked)", mg: 63 },
  { label: "Soybeans (½ cup roasted)", mg: 108 },
  { label: "Milk (1 cup)", mg: 38 },
];

interface CholineInputs {
  lifeStage: LifeStageKey;
  weightKg: number;
  dietaryMg: number;
  supplementMg: number;
  supplementForm: string;
  decimals: number;
}

const DEFAULTS: CholineInputs = {
  lifeStage: "men",
  weightKg: 70,
  dietaryMg: 350,
  supplementMg: 0,
  supplementForm: "bitartrate",
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CholineResult {
  valid: boolean;
  errorMsg: string;
  stage: LifeStage;
  supplementSpec: SupplementForm;
  supplementCholineMg: number;
  totalMg: number;
  pctOfAi: number;
  gapMg: number;
  headroomToUl: number;
  pctOfUl: number;
  mgPerKg: number;
  aiPerKg: number;
  dietSharePct: number;
  status: string;
  statusColor: string;
  ulStatus: string;
  ulColor: string;
  foodEquivalents: { label: string; servings: number }[];
  breakdown: BreakdownRow[];
}

function calculateCholine(input: CholineInputs): CholineResult {
  const stage = LIFE_STAGES.find((s) => s.key === input.lifeStage) || LIFE_STAGES[0];
  const supplementSpec = SUPPLEMENT_FORMS.find((s) => s.key === input.supplementForm) || SUPPLEMENT_FORMS[0];

  const blank = (errorMsg: string): CholineResult => ({
    valid: false,
    errorMsg,
    stage,
    supplementSpec,
    supplementCholineMg: 0,
    totalMg: 0,
    pctOfAi: 0,
    gapMg: 0,
    headroomToUl: 0,
    pctOfUl: 0,
    mgPerKg: 0,
    aiPerKg: 0,
    dietSharePct: 0,
    status: "",
    statusColor: "text-muted-foreground",
    ulStatus: "",
    ulColor: "text-muted-foreground",
    foodEquivalents: [],
    breakdown: [],
  });

  const nums = [input.weightKg, input.dietaryMg, input.supplementMg, input.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to check the intake.");
  if (input.weightKg <= 0) return blank("Body weight must be greater than zero.");
  if (input.dietaryMg < 0) return blank("Dietary choline cannot be negative.");
  if (input.supplementMg < 0) return blank("Supplement amount cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const supplementCholineMg = input.supplementMg * supplementSpec.cholineFraction;
  const totalMg = input.dietaryMg + supplementCholineMg;
  const pctOfAi = (totalMg / stage.aiMg) * 100;
  const gapMg = Math.max(0, stage.aiMg - totalMg);
  const headroomToUl = stage.ulMg - totalMg;
  const pctOfUl = (totalMg / stage.ulMg) * 100;
  const mgPerKg = totalMg / input.weightKg;
  const aiPerKg = stage.aiMg / input.weightKg;
  const dietSharePct = totalMg > 0 ? (input.dietaryMg / totalMg) * 100 : 0;

  const status =
    pctOfAi >= 100
      ? "At or above the adequate intake"
      : pctOfAi >= 80
        ? "Close to the adequate intake"
        : pctOfAi >= 50
          ? "Below the adequate intake"
          : "Well below the adequate intake";
  const statusColor = pctOfAi >= 100 ? "text-emerald-600" : pctOfAi >= 80 ? "text-foreground" : "text-orange-600";

  const ulStatus =
    totalMg > stage.ulMg
      ? "Above the tolerable upper intake level"
      : pctOfUl >= 80
        ? "Approaching the upper level"
        : "Within the safe range";
  const ulColor = totalMg > stage.ulMg ? "text-red-600" : pctOfUl >= 80 ? "text-orange-600" : "text-emerald-600";

  const foodEquivalents = gapMg > 0 ? FOOD_SOURCES.map((f) => ({ label: f.label, servings: gapMg / f.mg })) : [];

  const breakdown: BreakdownRow[] = [
    { label: "Adequate intake for this life stage", value: `${fmt(stage.aiMg, 0)} mg/day` },
    { label: "Tolerable upper intake level", value: `${fmt(stage.ulMg, 0)} mg/day` },
    { label: "Dietary choline", value: `${fmt(input.dietaryMg, d)} mg` },
    {
      label: `Supplement: ${supplementSpec.label.split(" (")[0]} at ${fmt(input.supplementMg, d)} mg`,
      value: `${fmt(supplementCholineMg, d)} mg choline`,
    },
    { label: "Total choline intake", value: `${fmt(totalMg, d)} mg`, highlight: true },
    { label: "Percentage of the adequate intake", value: `${fmt(pctOfAi, 1)}%`, highlight: true },
    { label: "Remaining to reach the adequate intake", value: gapMg > 0 ? `${fmt(gapMg, d)} mg` : "target met" },
    { label: "Headroom below the upper level", value: `${fmt(headroomToUl, d)} mg` },
    { label: "Percentage of the upper level", value: `${fmt(pctOfUl, 1)}%` },
    { label: "Intake per kilogram of body weight", value: `${fmt(mgPerKg, 2)} mg/kg` },
    { label: "Adequate intake per kilogram", value: `${fmt(aiPerKg, 2)} mg/kg` },
    { label: "Share of intake from food", value: `${fmt(dietSharePct, 0)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    stage,
    supplementSpec,
    supplementCholineMg,
    totalMg,
    pctOfAi,
    gapMg,
    headroomToUl,
    pctOfUl,
    mgPerKg,
    aiPerKg,
    dietSharePct,
    status,
    statusColor,
    ulStatus,
    ulColor,
    foodEquivalents,
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

export default function CholineRequirementCalculator() {
  const [lifeStage, setLifeStage] = useState<string>(DEFAULTS.lifeStage);
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [dietaryMg, setDietaryMg] = useState(String(DEFAULTS.dietaryMg));
  const [supplementMg, setSupplementMg] = useState(String(DEFAULTS.supplementMg));
  const [supplementForm, setSupplementForm] = useState<string>(DEFAULTS.supplementForm);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CholineInputs => ({
    lifeStage: lifeStage as LifeStageKey,
    weightKg: parseFloat(weightKg) || 0,
    dietaryMg: parseFloat(dietaryMg) || 0,
    supplementMg: parseFloat(supplementMg) || 0,
    supplementForm,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<CholineInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CholineResult>(() => calculateCholine(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateCholine(inputs));
  };

  const reset = () => {
    setLifeStage(DEFAULTS.lifeStage);
    setWeightKg(String(DEFAULTS.weightKg));
    setDietaryMg(String(DEFAULTS.dietaryMg));
    setSupplementMg(String(DEFAULTS.supplementMg));
    setSupplementForm(DEFAULTS.supplementForm);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateCholine(DEFAULTS));
  };

  const weightNum = parseFloat(weightKg);
  const dietNum = parseFloat(dietaryMg);
  const suppNum = parseFloat(supplementMg);

  const errors = {
    weightKg: !Number.isFinite(weightNum) || weightNum <= 0 ? "Must be greater than zero" : "",
    dietaryMg: !Number.isFinite(dietNum) || dietNum < 0 ? "Cannot be negative" : "",
    supplementMg: !Number.isFinite(suppNum) || suppNum < 0 ? "Cannot be negative" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How much choline do adults need?",
      answer:
        "The adequate intake is 550 mg per day for men and 425 mg for women, rising to 450 mg in pregnancy and 550 mg during breastfeeding. The figures come from the Institute of Medicine's dietary reference intake report for choline and are still the values in use; the European Food Safety Authority sets a single adult adequate intake of 400 mg, so the two references differ by roughly a third.",
    },
    {
      question: "Which foods are highest in choline?",
      answer:
        "Liver is the standout at roughly 350 mg per three-ounce serving, followed by eggs at about 147 mg each, with the choline concentrated in the yolk. Soybeans, chicken breast, salmon, milk, wheat germ and peanuts add meaningful amounts, and cruciferous vegetables such as broccoli contribute modestly. Most people who fall short are eating little or no egg, liver, soy or fish.",
    },
    {
      question: "Do supplement labels state choline content directly?",
      answer:
        "Often not. A label may say 500 mg of choline bitartrate, which supplies about 207 mg of choline, because bitartrate is roughly 41 percent choline by weight. Citicoline carries about 18 percent, alpha-GPC about 40 percent and choline chloride about 75 percent. This calculator converts the compound amount you enter into actual choline so the total is comparable with the adequate intake rather than the label weight.",
    },
    {
      question: "Is there a risk of taking too much choline?",
      answer:
        "Yes. The tolerable upper intake level is 3,500 mg per day for adults and lower for children, and exceeding it is usually associated with a fishy body odour, sweating, salivation and gastrointestinal upset, with low blood pressure reported at higher doses. High intakes rarely come from food; they come from supplements, which is why the calculator tracks both the remaining headroom below the upper level and the percentage of it the current intake represents.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Choline Requirement Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Choline Requirement Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="You & Your Intake">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="life-stage"
                  label="Life Stage"
                  value={lifeStage}
                  onChange={setLifeStage}
                  options={LIFE_STAGES.map((s) => ({ value: s.key, label: s.label }))}
                  tooltip="Sets the adequate intake and the upper level for comparison."
                />
                <CompactInput
                  id="weight"
                  label="Body Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="kg"
                  error={errors.weightKg}
                  tooltip="Used for the mg-per-kilogram comparison."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="dietary"
                  label="Choline from Food"
                  value={dietaryMg}
                  onChange={setDietaryMg}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="mg/day"
                  error={errors.dietaryMg}
                  hint="An egg is 147 mg; 3 oz of liver is 356 mg."
                  tooltip="Total choline from food and drink."
                />
                <CompactInput
                  id="supplement"
                  label="Supplement Compound"
                  value={supplementMg}
                  onChange={setSupplementMg}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="mg/day"
                  error={errors.supplementMg}
                  hint="Label amount, converted below."
                  tooltip="Milligrams of the supplement compound, not of choline."
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
                  <SubSection title="Supplement Form">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="supplement-form"
                        label="Compound"
                        value={supplementForm}
                        onChange={setSupplementForm}
                        options={SUPPLEMENT_FORMS.map((s) => ({ value: s.key, label: s.label }))}
                        tooltip="Converts the label weight into choline by the fraction in brackets."
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
                        tooltip="Decimal places used for milligram figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Choline Target</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.stage.aiMg, 0)} mg` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Adequate intake for ${results.stage.label.toLowerCase()} — you are at ${fmt(results.totalMg, calcInputs.decimals)} mg, ${fmt(results.pctOfAi, 0)}% of the target`
                  : "Fix the highlighted inputs to check the intake"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Intake</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.totalMg, 0)} mg` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Gap to Target</span>
                <span className={`font-extrabold ${results.gapMg > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                  {results.valid ? (results.gapMg > 0 ? `${fmt(results.gapMg, 0)} mg` : "met") : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Of Upper Limit</span>
                <span className={`font-extrabold ${results.ulColor}`}>
                  {results.valid ? `${fmt(results.pctOfUl, 0)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Intake Measure</th>
                    <th className="p-2.5 pr-3 text-right w-[200px]">Value</th>
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
                        Enter your intake to see how it compares with the reference values.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Total choline</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.totalMg, calcInputs.decimals)} mg · ${fmt(results.pctOfAi, 0)}% of the AI`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Life stage</span>
                  <span className="text-base font-bold text-foreground">{results.stage.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adequate intake</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.stage.aiMg, 0)} mg/day</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">From food</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.dietaryMg, calcInputs.decimals)} mg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">From supplements</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.supplementCholineMg, calcInputs.decimals)} mg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Per kg body weight</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.mgPerKg, 2)} mg/kg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Upper level</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.stage.ulMg, 0)} mg/day</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Headroom below UL</span>
                  <span className={`text-base font-bold ${results.ulColor}`}>
                    {results.valid ? `${fmt(results.headroomToUl, 0)} mg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Status</span>
                  <span className={`text-base font-bold ${results.statusColor}`}>{results.valid ? results.status : "—"}</span>
                </div>
              </div>
              {results.valid && results.foodEquivalents.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Closing a {fmt(results.gapMg, 0)} mg gap would take roughly{" "}
                  {results.foodEquivalents
                    .slice(0, 3)
                    .map((f) => `${fmt(f.servings, 1)} × ${f.label.toLowerCase()}`)
                    .join(", or ")}
                  . {results.ulStatus}.
                </p>
              )}
              {results.valid && results.foodEquivalents.length === 0 && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Target met from food and supplements combined. {results.ulStatus}. Food choline values follow the USDA FoodData
                  Central release current in 2024; reference intakes follow the IOM DRI report for choline.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Choline Requirement Calculator?</h2>
            <p>
              A choline requirement calculator compares your daily choline intake with the adequate intake for your life stage,
              reports the gap that remains, checks how much headroom is left below the tolerable upper intake level and converts the
              shortfall into servings of common choline-rich foods. It also converts the compound weight printed on a supplement
              label into the choline it actually supplies, which is the step most labels leave out.
            </p>
            <p>
              Choline is an essential nutrient involved in cell membranes, acetylcholine signalling, lipid transport out of the liver
              and fetal brain development. It is unusual among nutrients in that the body can synthesise some of it, but not reliably
              enough — which is why an adequate intake exists rather than a recommended dietary allowance, and why intake needs to be
              tracked honestly.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The target values come from the Institute of Medicine's dietary reference intake report for choline: 550 mg per day for
              adult men, 425 mg for adult women, 450 mg in pregnancy and 550 mg while breastfeeding, with lower figures for children
              and adolescents. Those are adequate intakes rather than requirements, so falling slightly below is not automatically a
              deficiency, but sustained intakes under about half the figure are the pattern that shows up in surveys of people eating
              no eggs, liver, soy or fish.
            </p>
            <p>
              Intake is the sum of choline from food and from supplements. Food contributions are straightforward once you know the
              values: an egg carries about 147 mg, three ounces of cooked liver about 356 mg, three ounces of chicken breast about 68
              mg, half a cup of roasted soybeans about 108 mg and a cup of milk about 38 mg. Supplements need conversion because the
              label states the compound weight — choline bitartrate is roughly 41 percent choline, citicoline about 18 percent,
              alpha-GPC about 40 percent and choline chloride about 75 percent — so 500 mg of bitartrate supplies only around 207 mg
              of choline.
            </p>
            <p>
              The result is then expressed three ways. The percentage of the adequate intake shows how complete the day is, the
              milligram gap shows what would have to be added, and the intake per kilogram of body weight provides a check that is
              useful for children and for anyone whose body size is far from average, since the reference values scale with weight
              across ages one to eighteen at about 5.5 mg per kilogram per day.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the adequate intake for the selected life stage with your own total underneath. The three-stat bar
              adds total intake, the gap still to close and the percentage of the upper level currently used, colour-coded when
              intake approaches the ceiling.
            </p>
            <p>
              The breakdown table lists the reference figures, both intake sources, the total, the gap, the headroom below the upper
              level and the per-kilogram comparison. The summary panel adds the life stage, the supplement contribution and a
              practical list of servings that would close the gap, such as how many eggs or how much liver or soy it would take.
            </p>              <p>
                Two cautions are worth keeping in view. Food choline values are averages that vary with cooking and with the specific
                food, so treat the totals as estimates rather than measurements. Supplement doses are also the usual route to
                excessive intake — a handful of high-dose capsules can approach or exceed the upper level of 3,500 mg for adults,
                which is associated with fishy body odour, sweating, salivation, gastrointestinal upset and, at higher intakes, low
                blood pressure. If you are pregnant, breastfeeding, managing liver or kidney disease, or taking a high-dose supplement,
                confirm the plan with a clinician rather than relying on a calculator.
              </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/choline-requirement-calculator" />
          <PopularCalculators exclude="/calculator/choline-requirement-calculator" />
        </div>
      </div>
    </>
  );
}
