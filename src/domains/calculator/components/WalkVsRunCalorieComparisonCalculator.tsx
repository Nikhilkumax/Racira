"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type UnitSystem = "metric" | "imperial";

interface CompareInputs {
  unitSystem: UnitSystem;
  weightKg: number;
  distanceKm: number;
  walkKmh: number;
  runKmh: number;
  gradientPct: number;
  terrainFactor: number;
  decimals: number;
}

const DEFAULTS: CompareInputs = {
  unitSystem: "metric",
  weightKg: 70,
  distanceKm: 5,
  walkKmh: 5.5,
  runKmh: 10,
  gradientPct: 0,
  terrainFactor: 1,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

/** 2011 Compendium of Physical Activities walking METs, by km/h. */
function walkMet(kmh: number): number {
  if (kmh <= 3.2) return 2.8;
  if (kmh <= 4.0) return 3.0;
  if (kmh <= 4.8) return 3.5;
  if (kmh <= 5.6) return 4.3;
  if (kmh <= 6.4) return 5.0;
  if (kmh <= 7.2) return 6.3;
  return 7.0;
}

/** 2011 Compendium of Physical Activities running METs, by km/h. */
function runMet(kmh: number): number {
  if (kmh <= 8.0) return 8.3;
  if (kmh <= 9.7) return 9.8;
  if (kmh <= 11.3) return 11.0;
  if (kmh <= 12.9) return 11.8;
  if (kmh <= 14.5) return 12.8;
  if (kmh <= 16.1) return 14.5;
  return 16.0;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CompareResult {
  valid: boolean;
  errorMsg: string;
  walkMet: number;
  runMet: number;
  walkMinutes: number;
  runMinutes: number;
  walkCalories: number;
  runCalories: number;
  calorieDiff: number;
  perKmWalk: number;
  perKmRun: number;
  perMinuteWalk: number;
  perMinuteRun: number;
  timeSavedMinutes: number;
  perHourRun: number;
  equivalentKm: number;
  breakdown: BreakdownRow[];
}

function calculateComparison(input: CompareInputs): CompareResult {
  const blank = (errorMsg: string): CompareResult => ({
    valid: false,
    errorMsg,
    walkMet: 0,
    runMet: 0,
    walkMinutes: 0,
    runMinutes: 0,
    walkCalories: 0,
    runCalories: 0,
    calorieDiff: 0,
    perKmWalk: 0,
    perKmRun: 0,
    perMinuteWalk: 0,
    perMinuteRun: 0,
    timeSavedMinutes: 0,
    perHourRun: 0,
    equivalentKm: 0,
    breakdown: [],
  });

  const nums = [input.weightKg, input.distanceKm, input.walkKmh, input.runKmh, input.gradientPct, input.terrainFactor, input.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to compare the two activities.");
  if (input.weightKg <= 0) return blank("Body weight must be greater than zero.");
  if (input.distanceKm <= 0) return blank("Distance must be greater than zero.");
  if (input.walkKmh <= 0 || input.runKmh <= 0) return blank("Both speeds must be greater than zero.");
  if (input.walkKmh > 12) return blank("Walking speed above 12 km/h is unrealistic — check the value.");
  if (input.runKmh > 40) return blank("Running speed above 40 km/h is unrealistic — check the value.");
  if (input.runKmh <= input.walkKmh) return blank("Running speed should be faster than walking speed.");
  if (input.gradientPct < -20 || input.gradientPct > 40) return blank("Gradient should be between −20% and 40%.");
  if (input.terrainFactor < 0.8 || input.terrainFactor > 2) return blank("Terrain factor should be between 0.8 and 2.0.");

  const d = Math.max(0, Math.min(3, input.decimals));
  const walkBase = walkMet(input.walkKmh);
  const runBase = runMet(input.runKmh);
  // Uphill walking costs roughly 0.9 MET per percent of grade (ACSM walking
  // equation); downhill recovers about half of that. Running grade cost is
  // gentler per percent, about 0.6 MET.
  const walkGrade = input.gradientPct * 0.9;
  const runGrade = input.gradientPct * 0.6;
  const wMet = Math.max(1.5, (walkBase + walkGrade) * input.terrainFactor);
  const rMet = Math.max(2, (runBase + runGrade) * input.terrainFactor);

  const walkHours = input.distanceKm / input.walkKmh;
  const runHours = input.distanceKm / input.runKmh;
  const walkCalories = wMet * input.weightKg * walkHours;
  const runCalories = rMet * input.weightKg * runHours;

  const calorieDiff = runCalories - walkCalories;
  const perKmWalk = walkCalories / input.distanceKm;
  const perKmRun = runCalories / input.distanceKm;
  const walkMinutes = walkHours * 60;
  const runMinutes = runHours * 60;
  const perMinuteWalk = walkCalories / walkMinutes;
  const perMinuteRun = runCalories / runMinutes;
  const perHourRun = rMet * input.weightKg;
  const timeSavedMinutes = walkMinutes - runMinutes;
  const equivalentKm = perKmRun > 0 ? walkCalories / perKmRun : 0;

  const breakdown: BreakdownRow[] = [
    { label: "Walking MET value (with grade and terrain)", value: fmt(wMet, 2) },
    { label: "Running MET value (with grade and terrain)", value: fmt(rMet, 2) },
    { label: "Walking time for the distance", value: `${fmt(walkMinutes, 1)} min` },
    { label: "Running time for the distance", value: `${fmt(runMinutes, 1)} min` },
    { label: "Calories burned walking", value: `${fmt(walkCalories, d)} kcal`, highlight: true },
    { label: "Calories burned running", value: `${fmt(runCalories, d)} kcal`, highlight: true },
    { label: "Extra calories from running", value: `${calorieDiff >= 0 ? "+" : ""}${fmt(calorieDiff, d)} kcal` },
    { label: "Calories per kilometre walked", value: fmt(perKmWalk, 1) },
    { label: "Calories per kilometre run", value: fmt(perKmRun, 1) },
    { label: "Time saved by running", value: `${fmt(timeSavedMinutes, 1)} min` },
    { label: "Walking distance worth one run kilometre", value: `${fmt(equivalentKm, 2)} km` },
  ];

  return {
    valid: true,
    errorMsg: "",
    walkMet: wMet,
    runMet: rMet,
    walkMinutes,
    runMinutes,
    walkCalories,
    runCalories,
    calorieDiff,
    perKmWalk,
    perKmRun,
    perMinuteWalk,
    perMinuteRun,
    timeSavedMinutes,
    perHourRun,
    equivalentKm,
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

export default function WalkVsRunCalorieComparisonCalculator() {
  const [unitSystem, setUnitSystem] = useState<string>(DEFAULTS.unitSystem);
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [distanceKm, setDistanceKm] = useState(String(DEFAULTS.distanceKm));
  const [walkKmh, setWalkKmh] = useState(String(DEFAULTS.walkKmh));
  const [runKmh, setRunKmh] = useState(String(DEFAULTS.runKmh));
  const [gradientPct, setGradientPct] = useState(String(DEFAULTS.gradientPct));
  const [terrainFactor, setTerrainFactor] = useState(String(DEFAULTS.terrainFactor));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const metric = unitSystem === "metric";

  const getInputs = (): CompareInputs => {
    const weight = parseFloat(weightKg) || 0;
    const distance = parseFloat(distanceKm) || 0;
    const walk = parseFloat(walkKmh) || 0;
    const run = parseFloat(runKmh) || 0;
    return {
      unitSystem: unitSystem as UnitSystem,
      weightKg: metric ? weight : weight * 0.45359237,
      distanceKm: metric ? distance : distance * 1.609344,
      walkKmh: metric ? walk : walk * 1.609344,
      runKmh: metric ? run : run * 1.609344,
      gradientPct: parseFloat(gradientPct),
      terrainFactor: parseFloat(terrainFactor) || 1,
      decimals: parseFloat(decimals),
    };
  };

  const [calcInputs, setCalcInputs] = useState<CompareInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CompareResult>(() => calculateComparison(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateComparison(inputs));
  };

  const reset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeightKg(String(DEFAULTS.weightKg));
    setDistanceKm(String(DEFAULTS.distanceKm));
    setWalkKmh(String(DEFAULTS.walkKmh));
    setRunKmh(String(DEFAULTS.runKmh));
    setGradientPct(String(DEFAULTS.gradientPct));
    setTerrainFactor(String(DEFAULTS.terrainFactor));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateComparison(DEFAULTS));
  };

  const weightNum = parseFloat(weightKg);
  const distanceNum = parseFloat(distanceKm);
  const walkNum = parseFloat(walkKmh);
  const runNum = parseFloat(runKmh);

  const errors = {
    weightKg: !Number.isFinite(weightNum) || weightNum <= 0 ? "Must be greater than zero" : "",
    distanceKm: !Number.isFinite(distanceNum) || distanceNum <= 0 ? "Must be greater than zero" : "",
    walkKmh: !Number.isFinite(walkNum) || walkNum <= 0 ? "Must be greater than zero" : "",
    runKmh:
      !Number.isFinite(runNum) || runNum <= 0
        ? "Must be greater than zero"
        : Number.isFinite(walkNum) && runNum <= walkNum
          ? "Running must be faster than walking"
          : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Does running burn more calories than walking the same distance?",
      answer:
        "Yes, but by less than most people expect. The extra cost comes from the vertical work of running, the elastic loading of the legs and a slightly higher metabolic rate after the session. At typical speeds, running a kilometre costs roughly sixty to eighty percent more energy than walking it, so a five kilometre run burns around 200 to 300 kcal more than a five kilometre walk for the same person.",
    },
    {
      question: "Why does walking burn calories more slowly per minute?",
      answer:
        "Because intensity sets the rate and distance sets the duration. Walking at 5.5 km/h lands around 4.3 METs while running at 10 km/h sits near 11 METs, so the runner is spending energy about two and a half times faster. Walking compensates by taking two to three times as long to cover the same ground, which is why the gap in total calories is narrower than the gap in intensity.",
    },
    {
      question: "What are MET values based on?",
      answer:
        "A MET is the rate at which the body uses oxygen at rest, taken as 3.5 millilitres of oxygen per kilogram per minute, which approximates 1 kcal per kilogram per hour. The compendium assigns each activity and speed a multiple of that resting rate, so calories equal METs multiplied by body weight in kilograms multiplied by hours. Speed bands in the tables are the reason the output changes in steps rather than smoothly.",
    },
    {
      question: "How do hills and rough ground change the comparison?",
      answer:
        "Gradient raises the cost of both, but it hurts walking more in relative terms because walkers have less momentum to carry them up. Rough ground, sand or soft trail adds a terrain multiplier to both figures. In practice a hilly trail walk can approach the per-kilometre cost of running on the flat, which is one reason hikers are often surprised by how many calories a day on the trail involves.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Walk vs Run Calorie Comparison Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Walk vs Run Calorie Comparison Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="You & The Session">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="unit-system"
                  label="Units"
                  value={unitSystem}
                  onChange={setUnitSystem}
                  options={[
                    { value: "metric", label: "Metric (kg, km, km/h)" },
                    { value: "imperial", label: "Imperial (lb, miles, mph)" },
                  ]}
                  tooltip="Switches the labels on every distance, speed and weight field."
                />
                <CompactInput
                  id="body-weight"
                  label="Body Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix={metric ? "kg" : "lb"}
                  error={errors.weightKg}
                  tooltip="Calorie burn scales directly with body mass."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="distance"
                  label="Target Distance"
                  value={distanceKm}
                  onChange={setDistanceKm}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix={metric ? "km" : "mi"}
                  error={errors.distanceKm}
                  tooltip="The distance both sessions cover."
                />
                <CompactInput
                  id="walk-speed"
                  label="Walking Speed"
                  value={walkKmh}
                  onChange={setWalkKmh}
                  onEnter={runCalculate}
                  min="0.5"
                  max={metric ? "12" : "7.5"}
                  step="any"
                  suffix={metric ? "km/h" : "mph"}
                  error={errors.walkKmh}
                  hint="5.5 km/h is a brisk walk."
                  tooltip="Speed sets the walking MET value."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="run-speed"
                  label="Running Speed"
                  value={runKmh}
                  onChange={setRunKmh}
                  onEnter={runCalculate}
                  min="1"
                  max={metric ? "40" : "25"}
                  step="any"
                  suffix={metric ? "km/h" : "mph"}
                  error={errors.runKmh}
                  hint="10 km/h is a six-minute kilometre."
                  tooltip="Speed sets the running MET value."
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
                  <SubSection title="Route & Surface">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="gradient"
                        label="Average Gradient"
                        value={gradientPct}
                        onChange={setGradientPct}
                        onEnter={runCalculate}
                        min="-20"
                        max="40"
                        step="any"
                        suffix="%"
                        tooltip="Positive for uphill, negative for downhill."
                      />
                      <CompactInput
                        id="terrain"
                        label="Terrain Factor"
                        value={terrainFactor}
                        onChange={setTerrainFactor}
                        onEnter={runCalculate}
                        min="0.8"
                        max="2"
                        step="0.05"
                        suffix="×"
                        hint="1.0 road, 1.1–1.3 trail, 1.4–1.8 sand or snow."
                        tooltip="Multiplier that raises the cost of soft or rough ground."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="3"
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Calories Burned</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.walkCalories, calcInputs.decimals)} walking` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.runCalories, calcInputs.decimals)} kcal running the same ${fmt(calcInputs.distanceKm, 2)} km — ${fmt(results.calorieDiff, 0)} kcal more, in ${fmt(results.timeSavedMinutes, 0)} minutes less`
                  : "Fix the highlighted inputs to compare the two"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Run Calories</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.runCalories, 0)} kcal` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Extra vs Walking</span>
                <span className="font-extrabold text-orange-600">
                  {results.valid ? `${fmt(results.calorieDiff, 0)} kcal` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Run Time</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.runMinutes, 0)} min` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Comparison</th>
                    <th className="p-2.5 pr-3 text-right w-[180px]">Value</th>
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
                        Enter a body weight, distance and both speeds to compare the sessions.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Walking · running</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.walkCalories, calcInputs.decimals)} · ${fmt(results.runCalories, calcInputs.decimals)} kcal`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Walking METs used</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.walkMet, 2) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Running METs used</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.runMet, 2) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Walk time</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.walkMinutes, 0)} min` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Run time</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.runMinutes, 0)} min` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Walking per km</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.perKmWalk, 1)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Running per km</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.perKmRun, 1)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Running per hour</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.perHourRun, 0)} kcal` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Walking per minute</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.perMinuteWalk, 2)} kcal` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  MET values follow the 2011 Compendium of Physical Activities speed bands with a grade adjustment of 0.9 MET per
                  percent for walking and 0.6 for running. Estimates are typical values, not measurements.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Walk vs Run Calorie Comparison Calculator?</h2>
            <p>
              A walk versus run calorie comparison calculator puts two sessions over the same distance side by side: how long each
              takes, how many calories each burns, and how the difference splits between intensity and duration. It reports the
              calories per kilometre for both activities, the per-minute rate while walking, the per-hour rate while running, and the
              distance you would have to walk to match one kilometre of running.
            </p>
            <p>
              The comparison is more interesting than the headline suggests. Running is roughly two and a half times as intense, yet
              because it takes two to three times less time, the calorie gap over a fixed distance is smaller than most people
              assume — which is why a daily brisk walk is a credible strategy and not just a pale substitute for running.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Both figures come from the MET method. A MET is the resting metabolic rate, about 1 kilocalorie per kilogram per hour,
              and the Compendium of Physical Activities assigns each activity and speed a multiple of it — around 4.3 METs for walking
              at 5.5 km/h, 11 METs for running at 10 km/h. Calories equal METs multiplied by body weight in kilograms multiplied by
              time in hours, and because speed bands are used, the output steps rather than sliding smoothly as you change speed.
            </p>
            <p>
              Grade and surface then adjust the rate. Walking uphill costs about 0.9 MET for every percent of gradient, running
              uphill about 0.6 MET per percent, so a ten percent climb adds roughly nine METs to a walk and six to a run. A terrain
              factor handles soft or rough ground: one for road, 1.1 to 1.3 for trail, and 1.4 to 1.8 for sand or snow. Both adjust
              the rate, which then flows into the calorie total for the fixed distance you entered.
            </p>
            <p>
              The derived figures are what make the comparison usable. Calories per kilometre flattens out the time difference so the
              two activities can be compared like for like. The walking distance worth one run kilometre shows how far you would have
              to walk for the same burn, and the time saved figure quantifies the trade — running usually wins on time, walking on
              joint load and sustainability.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card leads with walking calories, and the subtext gives the running figure for the same distance, the extra
              calories and the minutes saved. The three-stat bar adds the running total, the difference and the running time, all of
              which update together when you press Calculate.
            </p>
            <p>
              The breakdown table lists the MET values actually used, both times, both calorie totals, the calories per kilometre and
              the equivalent-walking-distance figure. The summary panel repeats the key inputs and outputs in a compact form,
              including the per-minute walking rate and the per-hour running rate, which are the numbers to use when you are planning
              a session by duration rather than distance.
            </p>
            <p>
              Treat the totals as estimates. MET tables are population averages, individual efficiency varies by ten to fifteen
              percent, and heart rate, fitness and technique all matter. The figures are most useful for comparing two options for the
              same person on the same day, which is exactly what this tool is built for, rather than for predicting a precise daily
              expenditure.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/walk-vs-run-calorie-comparison-calculator" />
          <PopularCalculators exclude="/calculator/walk-vs-run-calorie-comparison-calculator" />
        </div>
      </div>
    </>
  );
}
