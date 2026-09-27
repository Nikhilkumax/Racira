"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type UnitSystem = "metric" | "imperial";
type Sex = "male" | "female";

interface BmiInputs {
  unit: UnitSystem;
  height: number;
  weight: number;
  age: number;
  sex: Sex;
}

const DEFAULTS: BmiInputs = {
  unit: "metric",
  height: 175,
  weight: 77,
  age: 30,
  sex: "male",
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface CategoryRow {
  label: string;
  from: number;
  to: number;
  weightFrom: number;
  weightTo: number;
  current: boolean;
}

interface BmiResult {
  valid: boolean;
  errorMsg: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  category: string;
  healthyLow: number;
  healthyHigh: number;
  toLose: number;
  toGain: number;
  bmiPrime: number;
  ponderalIndex: number;
  bodyFatEstimate: number;
  bmrEstimate: number;
  weightKgPerInch: number;
  categories: CategoryRow[];
  primaryWeight: number;
  primaryHeight: number;
}

function computeBmi(input: BmiInputs): BmiResult {
  const { unit, height, weight, age, sex } = input;

  const blank: BmiResult = {
    valid: false,
    errorMsg: "",
    heightCm: 0,
    weightKg: 0,
    bmi: 0,
    category: "",
    healthyLow: 0,
    healthyHigh: 0,
    toLose: 0,
    toGain: 0,
    bmiPrime: 0,
    ponderalIndex: 0,
    bodyFatEstimate: 0,
    bmrEstimate: 0,
    weightKgPerInch: 0,
    categories: [],
    primaryWeight: weight,
    primaryHeight: height,
  };

  if (!Number.isFinite(height) || !Number.isFinite(weight) || !Number.isFinite(age)) {
    return { ...blank, errorMsg: "Enter a height, a weight and an age to calculate a body mass index." };
  }
  if (height <= 0 || weight <= 0) {
    return { ...blank, errorMsg: "Height and weight must both be greater than zero." };
  }

  const heightCm = unit === "imperial" ? height * 2.54 : height;
  const weightKg = unit === "imperial" ? weight * 0.45359237 : weight;

  if (heightCm < 60 || heightCm > 260) {
    return { ...blank, errorMsg: "Enter a height between 60 cm and 260 cm (about 24 to 102 inches)." };
  }
  if (weightKg < 15 || weightKg > 500) {
    return { ...blank, errorMsg: "Enter a weight between 15 kg and 500 kg (about 33 to 1100 pounds)." };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  let category = "Normal weight";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal weight";
  else if (bmi < 30) category = "Overweight";
  else if (bmi < 35) category = "Obesity class I";
  else if (bmi < 40) category = "Obesity class II";
  else category = "Obesity class III";

  const healthyLow = 18.5 * heightM * heightM;
  const healthyHigh = 24.9 * heightM * heightM;
  const toLose = weightKg > healthyHigh ? weightKg - healthyHigh : 0;
  const toGain = weightKg < healthyLow ? healthyLow - weightKg : 0;
  const bmiPrime = bmi / 25;
  const ponderalIndex = weightKg / (heightM * heightM * heightM);
  const bodyFatEstimate = 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4;
  const bmrEstimate =
    sex === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const bands: { label: string; from: number; to: number }[] = [
    { label: "Underweight", from: 14, to: 18.5 },
    { label: "Normal weight", from: 18.5, to: 25 },
    { label: "Overweight", from: 25, to: 30 },
    { label: "Obesity class I", from: 30, to: 35 },
    { label: "Obesity class II", from: 35, to: 40 },
    { label: "Obesity class III", from: 40, to: 55 },
  ];

  const toDisplay = (kgValue: number) => (unit === "imperial" ? kgValue / 0.45359237 : kgValue);

  const categories: CategoryRow[] = bands.map((band) => {
    const lowKg = band.from * heightM * heightM;
    const highKg = band.to * heightM * heightM;
    return {
      label: band.label,
      from: band.from,
      to: band.to,
      weightFrom: Number(toDisplay(lowKg).toFixed(1)),
      weightTo: Number(toDisplay(highKg).toFixed(1)),
      current: bmi >= band.from && bmi < band.to,
    };
  });

  return {
    valid: true,
    errorMsg: "",
    heightCm: Number(heightCm.toFixed(2)),
    weightKg: Number(weightKg.toFixed(2)),
    bmi: Number(bmi.toFixed(2)),
    category,
    healthyLow: Number(toDisplay(healthyLow).toFixed(1)),
    healthyHigh: Number(toDisplay(healthyHigh).toFixed(1)),
    toLose: Number(toDisplay(toLose).toFixed(1)),
    toGain: Number(toDisplay(toGain).toFixed(1)),
    bmiPrime: Number(bmiPrime.toFixed(3)),
    ponderalIndex: Number(ponderalIndex.toFixed(2)),
    bodyFatEstimate: Number(bodyFatEstimate.toFixed(1)),
    bmrEstimate: Math.round(bmrEstimate),
    weightKgPerInch: Number((weightKg / (heightCm / 2.54)).toFixed(3)),
    categories,
    primaryWeight: weight,
    primaryHeight: height,
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

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>(DEFAULTS.unit);
  const [height, setHeight] = useState(String(DEFAULTS.height));
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BmiInputs => ({
    unit,
    height: parseFloat(height) || 0,
    weight: parseFloat(weight) || 0,
    age: parseFloat(age) || 30,
    sex,
  });

  const [calcInputs, setCalcInputs] = useState<BmiInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BmiResult>(() => computeBmi(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBmi(inputs));
  };

  const reset = () => {
    setUnit(DEFAULTS.unit);
    setHeight(String(DEFAULTS.height));
    setWeight(String(DEFAULTS.weight));
    setAge(String(DEFAULTS.age));
    setSex(DEFAULTS.sex);
    setCalcInputs(DEFAULTS);
    setResults(computeBmi(DEFAULTS));
  };

  const unitLabel = calcInputs.unit === "imperial" ? "lb" : "kg";
  const lengthLabel = calcInputs.unit === "imperial" ? "in" : "cm";

  const faqs = [
    {
      question: "What is a healthy BMI?",
      answer:
        "For most adults a body mass index between 18.5 and 24.9 is classified as normal weight. Below 18.5 is underweight, 25 to 29.9 is overweight and 30 or above is obesity, which is further divided into three classes. The thresholds come from the World Health Organization and apply to populations rather than to individuals.",
    },
    {
      question: "Why does BMI not work for athletes?",
      answer:
        "Muscle is denser than fat, so a muscular athlete can register as overweight or even obese while carrying very little fat. The index measures mass relative to height and cannot tell the two tissues apart. Waist circumference, body fat percentage or a skinfold measurement give a far better picture for anyone training regularly.",
    },
    {
      question: "How is BMI different for children?",
      answer:
        "Children and teenagers are assessed against growth charts rather than fixed thresholds, because body composition changes rapidly with age. A child's BMI is expressed as a percentile for their age and sex, with the eighty-fifth and ninety-fifth percentiles marking the overweight and obesity bands. The adult cut-offs shown here apply from about twenty years of age.",
    },
    {
      question: "What are BMI prime and the Ponderal Index?",
      answer:
        "BMI prime divides your BMI by twenty-five, so a figure below one sits inside the healthy band and anything above one is the fraction by which you exceed it. The Ponderal Index divides weight by height cubed, which reduces the bias against tall people that the squared height in BMI introduces. Both are reported alongside the standard index.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "BMI Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Units">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnit("metric")}
                  aria-pressed={unit === "metric"}
                  className={
                    unit === "metric"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Metric (cm / kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("imperial")}
                  aria-pressed={unit === "imperial"}
                  className={
                    unit === "imperial"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Imperial (in / lb)
                </button>
              </div>
            </SubSection>

            <SubSection title="Measurements">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="height"
                  label={unit === "imperial" ? "Height (inches)" : "Height (cm)"}
                  value={height}
                  onChange={setHeight}
                  onEnter={runCalculate}
                  suffix={lengthLabel}
                  tooltip="Standing height without shoes."
                />
                <CompactInput
                  id="weight"
                  label={unit === "imperial" ? "Weight (pounds)" : "Weight (kg)"}
                  value={weight}
                  onChange={setWeight}
                  onEnter={runCalculate}
                  suffix={unitLabel}
                  tooltip="Weight measured at the same time of day for consistency."
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
                  <SubSection title="Body Composition Inputs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="age"
                        label="Age"
                        value={age}
                        onChange={setAge}
                        onEnter={runCalculate}
                        suffix="yrs"
                        tooltip="Used for the body fat and metabolic rate estimates."
                      />
                      <div className="flex flex-col">
                        <span className="flex items-center text-sm font-semibold text-foreground mb-1">Sex</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSex("male")}
                            aria-pressed={sex === "male"}
                            className={
                              sex === "male"
                                ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                                : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
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
                                ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                                : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                            }
                          >
                            Female
                          </button>
                        </div>
                      </div>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Body Mass Index</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.bmi, 1) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.category} · ${fmt(results.heightCm, 1)} cm and ${fmt(results.weightKg, 1)} kg`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Healthy Range</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.healthyLow, 1)}–${fmt(results.healthyHigh, 1)} ${unitLabel}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">BMI Prime</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.bmiPrime, 3) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Est. Body Fat</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.bodyFatEstimate, 1)}%` : "—"}
                </span>
              </div>
            </div>

            {/* PERSONAL TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measure</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Height</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(results.heightCm, 1)} cm (${fmt(results.heightCm / 2.54, 1)} in)`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(results.weightKg, 1)} kg (${fmt(results.weightKg * 2.2046226, 1)} lb)`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Body mass index</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.bmi, 2)}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Ponderal index</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(results.ponderalIndex, 2)} kg/m³`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight per inch of height</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(results.weightKgPerInch, 3)} kg/in`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Estimated body fat</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(results.bodyFatEstimate, 1)}%`}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Estimated resting metabolism</td>
                    <td className="p-2.5 pr-3 text-right text-foreground">{`${results.bmrEstimate} kcal/day`}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Weight change to reach the healthy band</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">
                      {results.toLose > 0
                        ? `Lose ${fmt(results.toLose, 1)} ${unitLabel}`
                        : results.toGain > 0
                          ? `Gain ${fmt(results.toGain, 1)} ${unitLabel}`
                          : "Already inside the range"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CATEGORY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Category</th>
                    <th className="p-2.5 text-right">BMI</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Weight At Your Height</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.categories.map((row) => (
                    <tr key={row.label} className={row.current ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        {row.current ? " (you)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{`${row.from}–${row.to}`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(row.weightFrom, 1)}–${fmt(row.weightTo, 1)} ${unitLabel}`}
                      </td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Height</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.heightCm, 1)} cm`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weight</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.weightKg, 1)} kg`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Healthy Weight Low</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.healthyLow, 1)} ${unitLabel}`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Healthy Weight High</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.healthyHigh, 1)} ${unitLabel}`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Classification</span>
                  <span className="text-base font-bold text-foreground">{results.category || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Difference From Midpoint</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${fmt(results.weightKg - (results.healthyLow + results.healthyHigh) / 2, 1)} kg`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a BMI Calculator?</h2>
            <p>
              A BMI calculator divides your weight by your height squared to give a single number that classifies body size for
              a population. The World Health Organization bands are 18.5 to 24.9 for normal weight, 25 to 29.9 for overweight and
              30 or above for obesity, and the calculator also reports the healthy weight range for your exact height so a target
              is expressed in pounds or kilograms rather than in index points.
            </p>
            <p>
              The index was designed for screening rather than diagnosis. It is quick, needs only two measurements and correlates
              well with body fat across large groups, which is why insurers, clinicians and public health surveys all use it. It
              becomes less reliable for individuals, especially very muscular people and those at the extremes of height.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Metric and imperial inputs are converted to a common base first, so a height in inches becomes centimetres and a
              weight in pounds becomes kilograms. The index is then weight in kilograms divided by height in metres squared. A
              person weighing seventy-seven kilograms at one hundred and seventy-five centimetres has a BMI of just over
              twenty-five, which sits at the boundary between normal and overweight.
            </p>
            <p>
              Several related measures come from the same inputs. BMI prime expresses the index as a fraction of twenty-five, so
              anything above one is the proportion by which the healthy ceiling is exceeded. The Ponderal Index divides by height
              cubed instead of squared, which removes some of the bias the standard index shows against tall people, and the
              Deurenberg equation estimates body fat from the index, age and sex.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the index and its classification, with the healthy weight range, BMI prime and estimated
              body fat in the three-stat bar. The first table converts every figure into both unit systems and reports the resting
              metabolic rate estimate, while the second lists each classification band with the weight range it corresponds to at
              your height.
            </p>
            <p>
              Use the weight change line as the practical output. Losing or gaining a specific number of pounds is easier to act
              on than moving an index number, and it makes the size of the task concrete. A weight change of five to ten percent
              of body weight is usually enough to improve blood pressure, blood sugar and cholesterol, even when the healthy band
              itself is far away.
            </p>
            <p>
              Remember that the index says nothing about where fat is stored, and abdominal fat carries more metabolic risk than
              fat on the hips and thighs. Waist circumference is the cheapest way to add that information, with thresholds of
              about ninety-four centimetres for men and eighty for women marking increased risk in many guidelines.
            </p>
            <p>
              Finally, interpret a single reading as a snapshot rather than a verdict. Muscle mass, hydration, recent meals and
              even posture shift the number slightly, and a measurement taken at the same time of day is more comparable over
              months than any single figure. Track the trend, not the individual value, and combine it with how you actually feel.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-calculator" />
          <PopularCalculators exclude="/calculator/bmi-calculator" />
        </div>
      </div>
    </>
  );
}
