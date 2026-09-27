"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Sex = "male" | "female";
type UnitSystem = "metric" | "imperial";

interface BodyFatInputs {
  sex: Sex;
  unit: UnitSystem;
  weight: number;
  height: number;
  waist: number;
  neck: number;
  hip: number;
  age: number;
  targetBodyFat: number;
}

const DEFAULTS: BodyFatInputs = {
  sex: "male",
  unit: "metric",
  weight: 80,
  height: 178,
  waist: 88,
  neck: 38,
  hip: 98,
  age: 30,
  targetBodyFat: 15,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BandRow {
  label: string;
  from: number;
  to: number;
  fatMass: number;
  current: boolean;
}

interface MethodRow {
  label: string;
  estimate: number;
  note: string;
}

interface BodyFatResult {
  valid: boolean;
  errorMsg: string;
  bodyFat: number;
  category: string;
  fatMassKg: number;
  leanMassKg: number;
  leanMassLb: number;
  fatMassLb: number;
  bmiEstimate: number;
  bmiFromMeasurements: number;
  weightAtTarget: number;
  weightChange: number;
  targetBodyFat: number;
  healthyRangeLow: number;
  healthyRangeHigh: number;
  bands: BandRow[];
  methods: MethodRow[];
}

function computeBodyFat(input: BodyFatInputs): BodyFatResult {
  const { sex, unit, weight, height, waist, neck, hip, age, targetBodyFat } = input;

  const blank: BodyFatResult = {
    valid: false,
    errorMsg: "",
    bodyFat: 0,
    category: "",
    fatMassKg: 0,
    leanMassKg: 0,
    leanMassLb: 0,
    fatMassLb: 0,
    bmiEstimate: 0,
    bmiFromMeasurements: 0,
    weightAtTarget: 0,
    weightChange: 0,
    targetBodyFat,
    healthyRangeLow: 0,
    healthyRangeHigh: 0,
    bands: [],
    methods: [],
  };

  const numbers = [weight, height, waist, neck, hip, age, targetBodyFat];
  if (numbers.some((n) => !Number.isFinite(n))) {
    return { ...blank, errorMsg: "Fill in every measurement with a number." };
  }
  if (weight <= 0 || height <= 0 || waist <= 0 || neck <= 0) {
    return { ...blank, errorMsg: "Weight, height, waist and neck must all be greater than zero." };
  }

  const toInches = (v: number) => (unit === "metric" ? v / 2.54 : v);
  const toKg = (v: number) => (unit === "metric" ? v : v * 0.45359237);

  const heightIn = toInches(height);
  const waistIn = toInches(waist);
  const neckIn = toInches(neck);
  const hipIn = toInches(hip);
  const weightKg = toKg(weight);

  let bodyFat = 0;
  if (sex === "male") {
    if (waistIn <= neckIn) {
      return { ...blank, errorMsg: "Waist must be larger than neck for the Navy method to work." };
    }
    bodyFat = 86.01 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    if (hipIn <= 0) {
      return { ...blank, errorMsg: "Enter a hip measurement for the female Navy formula." };
    }
    if (waistIn + hipIn <= neckIn) {
      return { ...blank, errorMsg: "Waist plus hip must be larger than neck for the Navy method to work." };
    }
    bodyFat = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
  }

  bodyFat = Math.min(70, Math.max(1, bodyFat));

  const heightM = unit === "metric" ? height / 100 : (height * 2.54) / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;
  const bmiEstimate = Math.max(0, 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4);

  const fatMassKg = (weightKg * bodyFat) / 100;
  const leanMassKg = weightKg - fatMassKg;

  const healthyLow = sex === "male" ? 8 : 16;
  const healthyHigh = sex === "male" ? 20 : 28;
  const clampedTarget = Math.max(2, Math.min(60, targetBodyFat));
  const weightAtTarget = clampedTarget < 100 ? leanMassKg / (1 - clampedTarget / 100) : weightKg;
  const weightChange = weightAtTarget - weightKg;

  let category = "Average";
  if (sex === "male") {
    if (bodyFat < 6) category = "Essential fat";
    else if (bodyFat < 14) category = "Athletic";
    else if (bodyFat < 18) category = "Fitness";
    else if (bodyFat < 25) category = "Average";
    else category = "Obese";
  } else {
    if (bodyFat < 14) category = "Essential fat";
    else if (bodyFat < 21) category = "Athletic";
    else if (bodyFat < 25) category = "Fitness";
    else if (bodyFat < 32) category = "Average";
    else category = "Obese";
  }

  const bandSpecs =
    sex === "male"
      ? [
          { label: "Essential fat", from: 2, to: 5 },
          { label: "Athletic", from: 6, to: 13 },
          { label: "Fitness", from: 14, to: 17 },
          { label: "Average", from: 18, to: 24 },
          { label: "Obese", from: 25, to: 45 },
        ]
      : [
          { label: "Essential fat", from: 10, to: 13 },
          { label: "Athletic", from: 14, to: 20 },
          { label: "Fitness", from: 21, to: 24 },
          { label: "Average", from: 25, to: 31 },
          { label: "Obese", from: 32, to: 55 },
        ];

  const bands: BandRow[] = bandSpecs.map((band) => {
    const mid = (band.from + band.to) / 2;
    const mass = (weightKg * mid) / 100;
    return {
      label: band.label,
      from: band.from,
      to: band.to,
      fatMass: Number((unit === "metric" ? mass : mass * 2.2046226).toFixed(1)),
      current: bodyFat >= band.from && bodyFat <= band.to,
    };
  });

  const methods: MethodRow[] = [
    {
      label: "US Navy circumference method",
      estimate: Number(bodyFat.toFixed(2)),
      note: "Uses waist, neck and height, plus hip for women",
    },
    {
      label: "BMI-based (Deurenberg) estimate",
      estimate: Number(Math.max(0, bmiEstimate).toFixed(2)),
      note: "Uses body mass index with age and sex",
    },
  ];

  return {
    valid: true,
    errorMsg: "",
    bodyFat: Number(bodyFat.toFixed(2)),
    category,
    fatMassKg: Number(fatMassKg.toFixed(2)),
    leanMassKg: Number(leanMassKg.toFixed(2)),
    leanMassLb: Number((leanMassKg * 2.2046226).toFixed(2)),
    fatMassLb: Number((fatMassKg * 2.2046226).toFixed(2)),
    bmiEstimate: Number(bmiEstimate.toFixed(2)),
    bmiFromMeasurements: Number(bmi.toFixed(2)),
    weightAtTarget: Number((unit === "metric" ? weightAtTarget : weightAtTarget * 2.2046226).toFixed(1)),
    weightChange: Number((unit === "metric" ? weightChange : weightChange * 2.2046226).toFixed(1)),
    targetBodyFat: clampedTarget,
    healthyRangeLow: healthyLow,
    healthyRangeHigh: healthyHigh,
    bands,
    methods,
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

export default function BodyFatPercentageCalculator() {
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [unit, setUnit] = useState<UnitSystem>(DEFAULTS.unit);
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [height, setHeight] = useState(String(DEFAULTS.height));
  const [waist, setWaist] = useState(String(DEFAULTS.waist));
  const [neck, setNeck] = useState(String(DEFAULTS.neck));
  const [hip, setHip] = useState(String(DEFAULTS.hip));
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [targetBodyFat, setTargetBodyFat] = useState(String(DEFAULTS.targetBodyFat));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): BodyFatInputs => ({
    sex,
    unit,
    weight: parseFloat(weight) || 0,
    height: parseFloat(height) || 0,
    waist: parseFloat(waist) || 0,
    neck: parseFloat(neck) || 0,
    hip: parseFloat(hip) || 0,
    age: parseFloat(age) || 30,
    targetBodyFat: parseFloat(targetBodyFat) || 15,
  });

  const [calcInputs, setCalcInputs] = useState<BodyFatInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BodyFatResult>(() => computeBodyFat(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeBodyFat(inputs));
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setUnit(DEFAULTS.unit);
    setWeight(String(DEFAULTS.weight));
    setHeight(String(DEFAULTS.height));
    setWaist(String(DEFAULTS.waist));
    setNeck(String(DEFAULTS.neck));
    setHip(String(DEFAULTS.hip));
    setAge(String(DEFAULTS.age));
    setTargetBodyFat(String(DEFAULTS.targetBodyFat));
    setCalcInputs(DEFAULTS);
    setResults(computeBodyFat(DEFAULTS));
  };

  const lengthUnit = unit === "metric" ? "cm" : "in";
  const massUnit = unit === "metric" ? "kg" : "lb";

  const faqs = [
    {
      question: "How accurate is the Navy body fat method?",
      answer:
        "The circumference method typically lands within three to four percentage points of a laboratory measurement when the tape is used correctly. It is a substantial improvement on body mass index because it measures the waist and neck, which track abdominal fat rather than total mass. Consistency matters more than absolute accuracy, so measure in the same spot each time.",
    },
    {
      question: "Where exactly should the tape go?",
      answer:
        "Measure the neck just below the larynx with the tape sloping slightly downward at the front, the waist at the navel for men and at the narrowest point for women, and the hips at the widest point. Keep the tape snug against the skin without compressing it, breathe normally, and measure at the end of a normal exhale rather than holding your breath.",
    },
    {
      question: "What is a healthy body fat percentage?",
      answer:
        "For men, roughly eight to twenty percent is commonly described as healthy, with athletes often between six and thirteen. For women the equivalent range is about sixteen to twenty-eight percent, with athletes between fourteen and twenty. Women carry more essential fat for hormonal and reproductive reasons, so the two scales are not interchangeable.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Body Fat Percentage Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Body Fat Percentage Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Sex & Units">
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
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setUnit("metric")}
                  aria-pressed={unit === "metric"}
                  className={
                    unit === "metric"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                  }
                >
                  Metric (cm)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("imperial")}
                  aria-pressed={unit === "imperial"}
                  className={
                    unit === "imperial"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                  }
                >
                  Imperial (in)
                </button>
              </div>
            </SubSection>

            <SubSection title="Body Measurements">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput
                  id="weight"
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  onEnter={runCalculate}
                  suffix={massUnit}
                  tooltip="Body weight."
                />
                <CompactInput
                  id="height"
                  label="Height"
                  value={height}
                  onChange={setHeight}
                  onEnter={runCalculate}
                  suffix={lengthUnit}
                  tooltip="Standing height."
                />
                <CompactInput
                  id="waist"
                  label="Waist"
                  value={waist}
                  onChange={setWaist}
                  onEnter={runCalculate}
                  suffix={lengthUnit}
                  tooltip="At the navel for men, at the narrowest point for women."
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <CompactInput
                  id="neck"
                  label="Neck"
                  value={neck}
                  onChange={setNeck}
                  onEnter={runCalculate}
                  suffix={lengthUnit}
                  tooltip="Just below the larynx, tape sloping slightly down at the front."
                />
                {sex === "female" && (
                  <CompactInput
                    id="hip"
                    label="Hip"
                    value={hip}
                    onChange={setHip}
                    onEnter={runCalculate}
                    suffix={lengthUnit}
                    tooltip="At the widest point of the hips."
                  />
                )}
                <CompactInput
                  id="age"
                  label="Age"
                  value={age}
                  onChange={setAge}
                  onEnter={runCalculate}
                  suffix="yrs"
                  tooltip="Used by the BMI-based comparison estimate."
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
                  <SubSection title="Target Body Fat">
                    <CompactInput
                      id="target-body-fat"
                      label="Goal Body Fat"
                      value={targetBodyFat}
                      onChange={setTargetBodyFat}
                      onEnter={runCalculate}
                      suffix="%"
                      hint="The calculator works out the weight that corresponds to this percentage."
                      tooltip="Assumes lean mass stays the same while fat changes."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Body Fat Percentage</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.bodyFat, 1)}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.category} · ${fmt(results.fatMassKg, 1)} kg fat and ${fmt(results.leanMassKg, 1)} kg lean mass`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Fat Mass</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.fatMassKg, 1)} kg` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Lean Mass</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.leanMassKg, 1)} kg` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Healthy Range</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${results.healthyRangeLow}–${results.healthyRangeHigh}%` : "—"}
                </span>
              </div>
            </div>

            {/* BAND TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Classification</th>
                    <th className="p-2.5 text-right">Body Fat</th>
                    <th className="p-2.5 pr-3 text-right w-[180px]">Fat Mass At Midpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.bands.map((row) => (
                    <tr key={row.label} className={row.current ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        {row.current ? " (you)" : ""}
                      </td>
                      <td className="p-2.5 text-right text-foreground">{`${row.from}–${row.to}%`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.fatMass, 1)} ${massUnit}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* METHOD + TARGET TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Estimate</th>
                    <th className="p-2.5 text-right">Value</th>
                    <th className="p-2.5 pr-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.methods.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.estimate, 1)}%`}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.note}</td>
                    </tr>
                  ))}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="p-2.5 pl-3 font-semibold text-foreground">Weight at your goal percentage</td>
                    <td className="p-2.5 text-right text-foreground">{`${fmt(results.weightAtTarget, 1)} ${massUnit}`}</td>
                    <td className="p-2.5 pr-3 text-muted-foreground">{`Lean mass held constant at ${fmt(results.leanMassKg, 1)} kg`}</td>
                  </tr>
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Change required</td>
                    <td className="p-2.5 text-right text-emerald-600">
                      {`${results.weightChange >= 0 ? "+" : "−"}${fmt(Math.abs(results.weightChange), 1)} ${massUnit}`}
                    </td>
                    <td className="p-2.5 pr-3 text-foreground">
                      {results.weightChange < 0 ? "Fat to lose" : "Fat to gain"}
                    </td>
                  </tr>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Body Fat</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.bodyFat, 2)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Classification</span>
                  <span className="text-base font-bold text-foreground">{results.category || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fat Mass (lb)</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.fatMassLb, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Lean Mass (lb)</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.leanMassLb, 1)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">BMI From Measurements</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.bmiFromMeasurements, 2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Goal Percentage</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.targetBodyFat, 1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Body Fat Percentage Calculator?</h2>
            <p>
              A body fat percentage calculator estimates how much of your weight is fat tissue rather than lean mass. This one
              uses the US Navy circumference method, which combines waist, neck and height measurements, plus hip for women, and
              reports the resulting percentage alongside the fat and lean mass it implies and the weight that corresponds to a
              goal percentage.
            </p>
            <p>
              The figure is far more informative than weight alone. Two people can weigh exactly the same and look completely
              different because one carries more muscle and the other more fat. Tracking body fat percentage shows whether a
              training programme is building lean tissue, losing fat, or both at once, which the scale cannot distinguish.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The Navy method uses logarithms of the tape measurements. For men, the difference between waist and neck is divided
              against height in a logarithmic equation that produces a percentage. For women, the hip and waist circumferences are
              added before the neck is subtracted. Neck girth accounts for the fact that a thicker neck carries more lean tissue,
              which is why it appears in the formula at all.
            </p>
            <p>
              Fat mass is simply the percentage of total weight, and lean mass is everything else. The weight at a target
              percentage assumes lean mass stays constant while only fat changes, which is a reasonable short-term model. The
              calculator also reports a body mass index estimate of body fat so the two methods can be compared side by side.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the percentage with its classification, and the three-stat bar reports fat mass, lean mass
              and the healthy range for your sex. The first table lists every classification band with the fat mass it
              corresponds to at your current weight, and the second compares the circumference estimate with the BMI-based
              estimate and the weight needed to reach your goal.
            </p>
            <p>
              Read the lean mass figure as the number to protect. Any weight loss plan that reduces lean mass along with fat
              lowers metabolic rate and makes the result harder to keep. Maintaining protein intake and including resistance
              training is what keeps the lean figure steady while the fat figure falls, and the calculator can be rerun to confirm
              that is what is happening.
            </p>
            <p>
              Consistency beats precision with tape measurements. Measure at the same time of day, with the same tape, in the
              same place on the body, and compare monthly rather than daily. A millimetre of measurement error translates to
              roughly a quarter of a percentage point, so a single reading should never drive a change of plan.
            </p>
            <p>
              Finally, note that the healthy ranges are broad and the athletic bands are narrower than they look. Body fat below
              the essential level cannot be sustained for long, and very low figures carry hormonal and immune consequences. For
              most people the goal is a stable position in the fitness or average band rather than the lowest number achievable.
              Write each measurement down with its date so the direction of travel is visible, and treat a change of less than a
              full percentage point as measurement noise rather than progress.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-fat-percentage-calculator" />
          <PopularCalculators exclude="/calculator/body-fat-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
