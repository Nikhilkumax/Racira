"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Species = "non_passerine" | "passerine";
type Activity = "inactive" | "moderate" | "active";
type LifeStage = "maintenance" | "molt" | "breeding" | "growth";
type Condition = "ideal" | "underweight" | "overweight";

const SPECIES: { key: Species; label: string; k: number }[] = [
  { key: "non_passerine", label: "Parrot / macaw / cockatiel (non-passerine)", k: 78 },
  { key: "passerine", label: "Canary / finch (passerine)", k: 129 },
];

const ACTIVITY: { key: Activity; label: string; mult: number }[] = [
  { key: "inactive", label: "Inactive — cage bound, clipped", mult: 1.5 },
  { key: "moderate", label: "Moderate — out of cage, short flights", mult: 2.0 },
  { key: "active", label: "Active — free flight, breeding", mult: 3.0 },
];

const LIFE_STAGE: { key: LifeStage; label: string; mult: number }[] = [
  { key: "maintenance", label: "Adult maintenance", mult: 1.0 },
  { key: "molt", label: "Moulting (+20%)", mult: 1.2 },
  { key: "breeding", label: "Breeding / laying (+30%)", mult: 1.3 },
  { key: "growth", label: "Juvenile growth (+50%)", mult: 1.5 },
];

const CONDITION: { key: Condition; label: string; mult: number }[] = [
  { key: "ideal", label: "Ideal body condition", mult: 1.0 },
  { key: "underweight", label: "Underweight (+10%)", mult: 1.1 },
  { key: "overweight", label: "Overweight (−10%)", mult: 0.9 },
];

interface ParrotInputs {
  weightGrams: number;
  species: Species;
  activity: Activity;
  lifeStage: LifeStage;
  condition: Condition;
  pelletPct: number;
  vegPct: number;
  treatPct: number;
  pelletKcalPerGram: number;
  vegKcalPerGram: number;
  treatKcalPerGram: number;
  decimals: number;
}

const DEFAULTS: ParrotInputs = {
  weightGrams: 400,
  species: "non_passerine",
  activity: "moderate",
  lifeStage: "maintenance",
  condition: "ideal",
  pelletPct: 70,
  vegPct: 20,
  treatPct: 10,
  pelletKcalPerGram: 3.6,
  vegKcalPerGram: 0.4,
  treatKcalPerGram: 5.0,
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ParrotResult {
  valid: boolean;
  errorMsg: string;
  ber: number;
  kFactor: number;
  activityMult: number;
  stageMult: number;
  conditionMult: number;
  dailyCalories: number;
  pelletCalories: number;
  vegCalories: number;
  treatCalories: number;
  pelletGrams: number;
  vegGrams: number;
  treatGrams: number;
  totalGrams: number;
  splitTotal: number;
  waterMl: number;
  sizeLabel: string;
  breakdown: BreakdownRow[];
}

function calculateAvianDiet(input: ParrotInputs): ParrotResult {
  const speciesSpec = SPECIES.find((s) => s.key === input.species) || SPECIES[0];
  const activitySpec = ACTIVITY.find((a) => a.key === input.activity) || ACTIVITY[1];
  const stageSpec = LIFE_STAGE.find((l) => l.key === input.lifeStage) || LIFE_STAGE[0];
  const conditionSpec = CONDITION.find((c) => c.key === input.condition) || CONDITION[0];

  const blank = (errorMsg: string): ParrotResult => ({
    valid: false,
    errorMsg,
    ber: 0,
    kFactor: speciesSpec.k,
    activityMult: activitySpec.mult,
    stageMult: stageSpec.mult,
    conditionMult: conditionSpec.mult,
    dailyCalories: 0,
    pelletCalories: 0,
    vegCalories: 0,
    treatCalories: 0,
    pelletGrams: 0,
    vegGrams: 0,
    treatGrams: 0,
    totalGrams: 0,
    splitTotal: 0,
    waterMl: 0,
    sizeLabel: "",
    breakdown: [],
  });

  const nums = [
    input.weightGrams,
    input.pelletPct,
    input.vegPct,
    input.treatPct,
    input.pelletKcalPerGram,
    input.vegKcalPerGram,
    input.treatKcalPerGram,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to work out the daily ration.");
  if (input.weightGrams <= 0) return blank("Body weight must be greater than zero.");
  if (input.weightGrams > 2000) return blank("Body weight above 2,000 g is outside the range of a companion bird — check the value.");
  if (input.pelletPct < 0 || input.vegPct < 0 || input.treatPct < 0) return blank("Diet percentages cannot be negative.");
  const splitTotal = input.pelletPct + input.vegPct + input.treatPct;
  if (Math.abs(splitTotal - 100) > 0.5) return blank(`Diet percentages must add up to 100% (currently ${fmt(splitTotal, 0)}%).`);
  if (input.pelletKcalPerGram <= 0 || input.vegKcalPerGram <= 0 || input.treatKcalPerGram <= 0) {
    return blank("Energy density must be greater than zero for every food type.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));
  const weightKg = input.weightGrams / 1000;

  // Avian basal energy requirement, allometric: BER = K x W(kg)^0.75.
  // K = 78 for non-passerines (psittacines) and 129 for passerines.
  const ber = speciesSpec.k * Math.pow(weightKg, 0.75);
  const dailyCalories = ber * activitySpec.mult * stageSpec.mult * conditionSpec.mult;

  const pelletCalories = dailyCalories * (input.pelletPct / 100);
  const vegCalories = dailyCalories * (input.vegPct / 100);
  const treatCalories = dailyCalories * (input.treatPct / 100);

  const pelletGrams = pelletCalories / input.pelletKcalPerGram;
  const vegGrams = vegCalories / input.vegKcalPerGram;
  const treatGrams = treatCalories / input.treatKcalPerGram;
  const totalGrams = pelletGrams + vegGrams + treatGrams;

  const waterMl = dailyCalories;

  const sizeLabel =
    input.weightGrams > 600
      ? "Extra large (macaw / large cockatoo)"
      : input.weightGrams > 300
        ? "Large (African grey / Amazon)"
        : input.weightGrams > 100
          ? "Medium (conure / quaker)"
          : "Small (budgie / cockatiel / finch)";

  const breakdown: BreakdownRow[] = [
    { label: "Body weight", value: `${fmt(input.weightGrams, 0)} g · ${fmt(weightKg, 3)} kg` },
    { label: "Allometric constant (K)", value: `${fmt(speciesSpec.k, 0)} kcal × W^0.75` },
    { label: "Basal energy requirement (BER)", value: `${fmt(ber, d)} kcal` },
    { label: "Activity multiplier", value: `×${fmt(activitySpec.mult, 2)} (${activitySpec.label.split(" —")[0]})` },
    { label: "Life stage multiplier", value: `×${fmt(stageSpec.mult, 2)}` },
    { label: "Body condition multiplier", value: `×${fmt(conditionSpec.mult, 2)}` },
    { label: "Maintenance energy requirement", value: `${fmt(dailyCalories, d)} kcal`, highlight: true },
    {
      label: `Pellets · ${fmt(input.pelletPct, 0)}% at ${fmt(input.pelletKcalPerGram, 2)} kcal/g`,
      value: `${fmt(pelletCalories, d)} kcal · ${fmt(pelletGrams, 1)} g`,
    },
    {
      label: `Fresh vegetables · ${fmt(input.vegPct, 0)}% at ${fmt(input.vegKcalPerGram, 2)} kcal/g`,
      value: `${fmt(vegCalories, d)} kcal · ${fmt(vegGrams, 1)} g`,
    },
    {
      label: `Treats, seeds & fruit · ${fmt(input.treatPct, 0)}% at ${fmt(input.treatKcalPerGram, 2)} kcal/g`,
      value: `${fmt(treatCalories, d)} kcal · ${fmt(treatGrams, 1)} g`,
      highlight: true,
    },
    { label: "Total food weight offered", value: `${fmt(totalGrams, 1)} g/day` },
    { label: "Water requirement (≈1 mL per kcal)", value: `${fmt(waterMl, 0)} mL/day` },
  ];

  return {
    valid: true,
    errorMsg: "",
    ber,
    kFactor: speciesSpec.k,
    activityMult: activitySpec.mult,
    stageMult: stageSpec.mult,
    conditionMult: conditionSpec.mult,
    dailyCalories,
    pelletCalories,
    vegCalories,
    treatCalories,
    pelletGrams,
    vegGrams,
    treatGrams,
    totalGrams,
    splitTotal,
    waterMl,
    sizeLabel,
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

export default function ParrotCalorieCalculator() {
  const [weightGrams, setWeightGrams] = useState(String(DEFAULTS.weightGrams));
  const [species, setSpecies] = useState<string>(DEFAULTS.species);
  const [activity, setActivity] = useState<string>(DEFAULTS.activity);
  const [lifeStage, setLifeStage] = useState<string>(DEFAULTS.lifeStage);
  const [condition, setCondition] = useState<string>(DEFAULTS.condition);
  const [pelletPct, setPelletPct] = useState(String(DEFAULTS.pelletPct));
  const [vegPct, setVegPct] = useState(String(DEFAULTS.vegPct));
  const [treatPct, setTreatPct] = useState(String(DEFAULTS.treatPct));
  const [pelletKcalPerGram, setPelletKcalPerGram] = useState(String(DEFAULTS.pelletKcalPerGram));
  const [vegKcalPerGram, setVegKcalPerGram] = useState(String(DEFAULTS.vegKcalPerGram));
  const [treatKcalPerGram, setTreatKcalPerGram] = useState(String(DEFAULTS.treatKcalPerGram));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ParrotInputs => ({
    weightGrams: parseFloat(weightGrams) || 0,
    species: species as Species,
    activity: activity as Activity,
    lifeStage: lifeStage as LifeStage,
    condition: condition as Condition,
    pelletPct: parseFloat(pelletPct) || 0,
    vegPct: parseFloat(vegPct) || 0,
    treatPct: parseFloat(treatPct) || 0,
    pelletKcalPerGram: parseFloat(pelletKcalPerGram) || 0,
    vegKcalPerGram: parseFloat(vegKcalPerGram) || 0,
    treatKcalPerGram: parseFloat(treatKcalPerGram) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ParrotInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ParrotResult>(() => calculateAvianDiet(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateAvianDiet(inputs));
  };

  const reset = () => {
    setWeightGrams(String(DEFAULTS.weightGrams));
    setSpecies(DEFAULTS.species);
    setActivity(DEFAULTS.activity);
    setLifeStage(DEFAULTS.lifeStage);
    setCondition(DEFAULTS.condition);
    setPelletPct(String(DEFAULTS.pelletPct));
    setVegPct(String(DEFAULTS.vegPct));
    setTreatPct(String(DEFAULTS.treatPct));
    setPelletKcalPerGram(String(DEFAULTS.pelletKcalPerGram));
    setVegKcalPerGram(String(DEFAULTS.vegKcalPerGram));
    setTreatKcalPerGram(String(DEFAULTS.treatKcalPerGram));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateAvianDiet(DEFAULTS));
  };

  const weightNum = parseFloat(weightGrams);
  const pelletNum = parseFloat(pelletPct);
  const vegNum = parseFloat(vegPct);
  const treatNum = parseFloat(treatPct);
  const splitSum = (pelletNum || 0) + (vegNum || 0) + (treatNum || 0);

  const errors = {
    weightGrams:
      !Number.isFinite(weightNum) || weightNum <= 0
        ? "Must be greater than zero"
        : weightNum > 2000
          ? "Above 2,000 g — check the value"
          : "",
    split:
      [pelletNum, vegNum, treatNum].every((v) => Number.isFinite(v)) && Math.abs(splitSum - 100) > 0.5
        ? `Adds up to ${fmt(splitSum, 0)}% — needs 100%`
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How many calories does a parrot need each day?",
      answer:
        "Avian energy needs scale allometrically with body weight rather than linearly: the basal energy requirement is the constant K multiplied by body weight in kilograms raised to the power 0.75, with K around 78 for psittacines and 129 for passerines. A 400 g African grey therefore has a basal requirement near 39 kcal, and maintenance lands near 79 kcal once the 2.0 activity multiplier for a moderately active bird is applied.",
    },
    {
      question: "Why does the multiplier matter so much?",
      answer:
        "Because a companion bird's energy use depends more on flight than on size. A clipped bird that never leaves its cage sits near 1.5 times basal, one that flies around a room sits near 2.0, and a free-flying or breeding bird can need three times basal. Feeding an inactive bird the ration of an active one is one of the most common paths to obesity and hepatic lipidosis in parrots.",
    },
    {
      question: "What is the 70/20/10 diet split?",
      answer:
        "It is the standard veterinary recommendation for companion psittacines: roughly 70 percent of calories from a formulated pellet, 20 percent from fresh vegetables and greens, and no more than 10 percent from seeds, nuts and fruit. The split matters because seed-heavy diets are high in fat, low in calcium and vitamin A, and are associated with fatty liver disease, feather problems and shortened lifespan.",
    },
    {
      question: "How do I convert calories into grams to feed?",
      answer:
        "Divide each allocation by the energy density of that food: extruded pellets average about 3.6 kcal per gram, fresh vegetables around 0.4 kcal per gram because of their water content, and nuts or seeds about 5 kcal per gram. That is why a small pile of vegetables can look like a lot of food while offering very few calories, and why a couple of nuts can consume a bird's entire treat allowance.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Parrot Calorie Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Parrot Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Your Bird">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="bird-weight"
                  label="Body Weight"
                  value={weightGrams}
                  onChange={setWeightGrams}
                  onEnter={runCalculate}
                  min="1"
                  max="2000"
                  step="any"
                  suffix="g"
                  error={errors.weightGrams}
                  hint="A 400 g African grey is typical."
                  tooltip="Weigh the bird on a gram scale for accuracy."
                />
                <CompactSelect
                  id="species-group"
                  label="Species Group"
                  value={species}
                  onChange={setSpecies}
                  options={SPECIES.map((s) => ({ value: s.key, label: s.label }))}
                  tooltip="Sets the allometric constant K."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="activity-level"
                  label="Activity Level"
                  value={activity}
                  onChange={setActivity}
                  options={ACTIVITY.map((a) => ({ value: a.key, label: a.label }))}
                  tooltip="Flight is the single biggest driver of avian energy use."
                />
                <CompactSelect
                  id="body-condition"
                  label="Body Condition"
                  value={condition}
                  onChange={setCondition}
                  options={CONDITION.map((c) => ({ value: c.key, label: c.label }))}
                  tooltip="Adjusts the ration for weight gain or loss goals."
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
                  <SubSection title="Life Stage">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="life-stage"
                        label="Life Stage"
                        value={lifeStage}
                        onChange={setLifeStage}
                        options={LIFE_STAGE.map((l) => ({ value: l.key, label: l.label }))}
                        tooltip="Growth, moulting and egg production all raise energy needs."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Diet Split (must total 100%)">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="pellet-pct"
                        label="Pellets"
                        value={pelletPct}
                        onChange={setPelletPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Formulated diet share of total calories."
                      />
                      <CompactInput
                        id="veg-pct"
                        label="Vegetables"
                        value={vegPct}
                        onChange={setVegPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Fresh vegetables, greens and sprouted seed."
                      />
                      <CompactInput
                        id="treat-pct"
                        label="Treats"
                        value={treatPct}
                        onChange={setTreatPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="1"
                        suffix="%"
                        error={errors.split || undefined}
                        tooltip="Seeds, nuts and fruit; keep this at 10% or less."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Energy Density & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="pellet-density"
                        label="Pellet Energy"
                        value={pelletKcalPerGram}
                        onChange={setPelletKcalPerGram}
                        onEnter={runCalculate}
                        min="0.1"
                        step="0.05"
                        suffix="kcal/g"
                        tooltip="Check the bag; extruded pellets run 3.2–4.0 kcal/g."
                      />
                      <CompactInput
                        id="veg-density"
                        label="Vegetable Energy"
                        value={vegKcalPerGram}
                        onChange={setVegKcalPerGram}
                        onEnter={runCalculate}
                        min="0.05"
                        step="0.05"
                        suffix="kcal/g"
                        tooltip="Fresh vegetables are mostly water, around 0.4 kcal/g."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="treat-density"
                        label="Treat Energy"
                        value={treatKcalPerGram}
                        onChange={setTreatKcalPerGram}
                        onEnter={runCalculate}
                        min="0.1"
                        step="0.1"
                        suffix="kcal/g"
                        tooltip="Seeds average about 5 kcal/g, nuts slightly higher."
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
                        tooltip="Decimal places used for calorie figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Daily Calories</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.dailyCalories, calcInputs.decimals)} kcal` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.sizeLabel} at ${fmt(calcInputs.weightGrams, 0)} g · basal need ${fmt(results.ber, calcInputs.decimals)} kcal × ${fmt(results.activityMult, 2)} activity`
                  : "Fix the highlighted inputs to see the ration"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pellets</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.pelletGrams, 0)} g` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vegetables</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.vegGrams, 0)} g` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Treat Limit</span>
                <span className="font-extrabold text-orange-600">
                  {results.valid ? `${fmt(results.treatGrams, 1)} g` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Energy & Ration</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
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
                        Enter your bird's weight and routine to see the ration.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Daily energy requirement</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {fmt(results.dailyCalories, calcInputs.decimals)} kcal
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Body weight</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.weightGrams, 0)} g` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Basal requirement</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.ber, calcInputs.decimals)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maintenance calories</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.dailyCalories, calcInputs.decimals)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pellet calories</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.pelletCalories, calcInputs.decimals)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Vegetable calories</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.vegCalories, calcInputs.decimals)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Treat calories</span>
                  <span className="text-base font-bold text-orange-600">
                    {results.valid ? `${fmt(results.treatCalories, calcInputs.decimals)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total food per day</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.totalGrams, 1)} g` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Water estimate</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.waterMl, 0)} mL` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  Allometric basal energy (K × W^0.75, K = 78 psittacine / 129 passerine), activity ×1.5–3.0, life stage and body
                  condition from the fields in Advanced Options. Weigh your bird weekly and adjust the ration by 5–10% at a time.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Parrot Calorie Calculator?</h2>
            <p>
              A parrot calorie calculator estimates the daily energy a companion bird needs and converts that energy into grams of
              food for each part of the diet. It uses allometric scaling rather than a simple calorie-per-kilogram figure, because
              small birds burn far more energy per unit of body mass than large ones, and it splits the ration into formulated
              pellets, fresh vegetables and the limited treats allowance that veterinary guidance recommends.
            </p>
            <p>
              Feeding by eye is the usual practice and the usual problem. A parrot that eats a bowl of seed mix is selecting the
              highest-fat items and leaving the rest, which over years produces obesity, fatty liver disease and feather abnormalities.
              Quantifying the ration makes the point concrete: a few sunflower seeds can consume a bird's entire treat allowance for
              the day.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The basal energy requirement uses the standard avian allometric equation, the constant K multiplied by body weight in
              kilograms raised to the power 0.75. K is 78 for psittacines — parrots, macaws, cockatiels and conures — and 129 for
              passerines such as canaries and finches, reflecting their higher mass-specific metabolic rate. A 400 g African grey
              therefore has a basal requirement of roughly 24 kcal per day.
            </p>
            <p>
              Maintenance is basal multiplied by activity: 1.5 for a clipped bird that rarely leaves the cage, 2.0 for one with out-of-cage
              time and short flights, and 3.0 for a free-flighted or breeding bird. Life stage adjusts the figure again — moulting and
              egg production are expensive, and a growing juvenile can need half as much energy again. Body condition applies a final
              ten percent adjustment, raising the ration for an underweight bird and lowering it for one carrying excess weight.
            </p>
            <p>
              The result is then split across the diet. The standard companion recommendation is about 70 percent of calories from a
              formulated pellet, 20 percent from fresh vegetables and greens, and no more than 10 percent from seeds, nuts and fruit.
              Each share is divided by the energy density of that food group — roughly 3.6 kcal per gram for extruded pellets, 0.4 for
              fresh vegetables and 5.0 for seeds and nuts — to give the grams to offer each day.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the maintenance energy requirement in kilocalories, with the basal figure and the activity
              multiplier in the subtext. The three-stat bar converts the diet split into grams of pellets, grams of vegetables and the
              gram ceiling for treats, which are the numbers you actually put on a kitchen scale.
            </p>
            <p>
              The breakdown table shows every multiplier applied, both calorie and gram figures for each food group, the total weight
              of food offered, and a water estimate of about one millilitre per kilocalorie. The summary panel repeats the totals and
              the bird's size category so the numbers can be recorded and compared week to week.
            </p>
            <p>
              Treat the output as a starting point, not a prescription. Individual birds vary, pellets differ in energy density between
              brands, and a bird that is ill will often need a different plan entirely. Weigh your parrot weekly at the same time of
              day, adjust the ration by five to ten percent at a time, and involve an avian veterinarian before making large changes —
              especially for a bird that is losing weight, laying eggs or moulting heavily.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/parrot-calorie-calculator" />
          <PopularCalculators exclude="/calculator/parrot-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
