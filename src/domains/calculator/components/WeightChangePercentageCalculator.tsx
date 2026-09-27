"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

// ── 1. TypeScript interfaces ──────────────────────────────────────────────
interface WeightChangeInputs {
  unitSystem: "imperial" | "metric";
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
}

interface WeightChangeResult {
  absoluteChange: number;
  percentageChange: number;
  direction: "Loss" | "Gain" | "Maintenance";
  hasGoal: boolean;
  distanceToGoal: number;
  progressPctToGoal: number;
  totalDistance: number;
}

// ── 2. Pure calculation function ──────────────────────────────────────────
const calculate = (i: WeightChangeInputs): WeightChangeResult => {
  const absoluteChange = i.currentWeight - i.startWeight;
  const percentageChange = i.startWeight > 0 ? (absoluteChange / i.startWeight) * 100 : 0;
  const direction: "Loss" | "Gain" | "Maintenance" =
    absoluteChange < 0 ? "Loss" : absoluteChange > 0 ? "Gain" : "Maintenance";

  const hasGoal = i.goalWeight > 0;
  let distanceToGoal = 0;
  let progressPctToGoal = 0;
  let totalDistance = 0;

  if (hasGoal) {
    distanceToGoal = Math.abs(i.goalWeight - i.currentWeight);
    totalDistance = Math.abs(i.goalWeight - i.startWeight);
    const movingTowardsGoal =
      (i.goalWeight < i.startWeight && i.currentWeight < i.startWeight) ||
      (i.goalWeight > i.startWeight && i.currentWeight > i.startWeight);
    if (totalDistance === 0) {
      progressPctToGoal = 100;
    } else if (movingTowardsGoal) {
      progressPctToGoal = Math.min(100, (Math.abs(i.currentWeight - i.startWeight) / totalDistance) * 100);
    }
  }

  return {
    absoluteChange: Math.abs(absoluteChange),
    percentageChange: Math.abs(percentageChange),
    direction,
    hasGoal,
    distanceToGoal,
    progressPctToGoal,
    totalDistance,
  };
};

// ── 3. DEFAULTS ────────────────────────────────────────────────────────────
const DEFAULTS = {
  unitSystem: "imperial" as const,
  startWeight: "220",
  currentWeight: "195",
  goalWeight: "180",
};

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const parse = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const unitLabel = (u: "imperial" | "metric") => (u === "imperial" ? "lbs" : "kg");

const CompactInput = ({
  id,
  label,
  value,
  onChange,
  suffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ── 4. Component ───────────────────────────────────────────────────────────
type InputState = {
  unitSystem: "imperial" | "metric";
  startWeight: string;
  currentWeight: string;
  goalWeight: string;
};

export default function WeightChangePercentageCalculator() {
  const [inputs, setInputs] = useState<InputState>({
    unitSystem: DEFAULTS.unitSystem,
    startWeight: DEFAULTS.startWeight,
    currentWeight: DEFAULTS.currentWeight,
    goalWeight: DEFAULTS.goalWeight,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<WeightChangeResult>(() =>
    calculate({
      unitSystem: DEFAULTS.unitSystem,
      startWeight: 220,
      currentWeight: 195,
      goalWeight: 180,
    })
  );
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate({ unitSystem: DEFAULTS.unitSystem, startWeight: 220, currentWeight: 195, goalWeight: 180 }));
  }, []);

  const parsed: WeightChangeInputs = {
    unitSystem: inputs.unitSystem,
    startWeight: parse(inputs.startWeight, 0),
    currentWeight: parse(inputs.currentWeight, 0),
    goalWeight: inputs.goalWeight.trim() === "" ? 0 : parse(inputs.goalWeight, 0),
  };

  const valErrors: Record<string, string> = {};
  if (parsed.startWeight <= 0) valErrors.startWeight = "Starting weight must be greater than 0";
  if (parsed.currentWeight <= 0) valErrors.currentWeight = "Current weight must be greater than 0";
  const hasErrors = Object.keys(valErrors).length > 0;

  const handleCalculate = () => {
    setResult(calculate(parsed));
  };

  const reset = () => {
    setInputs({ ...DEFAULTS });
    setShowAdvanced(false);
    setResult(calculate({ unitSystem: DEFAULTS.unitSystem, startWeight: 220, currentWeight: 195, goalWeight: 180 }));
  };

  const handlePrint = () => {
    window.print();
  };

  const r = result;
  const unit = unitLabel(inputs.unitSystem);

  const faqs = [
    {
      question: "Why is tracking percentage more important than raw pounds?",
      answer:
        "Raw poundage is relative to body size. A 130-pound person losing 10 pounds has lost nearly 8% of their mass — a massive change — while a 350-pound person losing the same 10 pounds has lost under 3%. Percentage neutralizes that distortion and gives an objective measure of progress.",
    },
    {
      question: "What is a safe percentage of weight to lose per week?",
      answer:
        "Clinical guidelines recommend losing 0.5% to 1.0% of total body weight per week. For a 200-pound person that is 1 to 2 pounds. Losing faster than 1% per week usually means losing muscle along with fat and often triggers rebound gain.",
    },
    {
      question: "Why does progress show 0% even though my weight changed?",
      answer:
        "If a target goal is entered, the calculator checks direction. Starting at 200 lbs with a goal of 180 lbs while currently at 205 lbs means you are moving away from the goal, so progress registers as 0%.",
    },
    {
      question: "Is this calculator only for weight loss?",
      answer:
        "No. It tracks gain as well. Athletes bulking from 170 lbs toward a 190 lb goal get the same percentage progress mapping, just in the upward direction.",
    },
    {
      question: "Why do doctors ask for a 5% to 10% weight loss?",
      answer:
        "The 5% to 10% threshold is a critical clinical milestone. Losing even 5% of total body weight measurably improves blood pressure, cholesterol, and insulin sensitivity, dramatically reducing Type 2 diabetes and cardiovascular risk.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Weight Change Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weight Change Percentage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div
            className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible"
            onKeyDown={(e) => { if (e.key === "Enter") handleCalculate(); }}
          >
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, unitSystem: "imperial" })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${inputs.unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Imperial (lbs)
              </button>
              <button
                type="button"
                onClick={() => setInputs({ ...inputs, unitSystem: "metric" })}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${inputs.unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Metric (kg)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <CompactInput id="start-weight" label="Starting Weight" value={inputs.startWeight} onChange={(v) => setInputs({ ...inputs, startWeight: v })} suffix={unit} />
                {valErrors.startWeight && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.startWeight}</p>}
              </div>
              <div className="flex flex-col">
                <CompactInput id="current-weight" label="Current Weight" value={inputs.currentWeight} onChange={(v) => setInputs({ ...inputs, currentWeight: v })} suffix={unit} />
                {valErrors.currentWeight && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.currentWeight}</p>}
              </div>
            </div>

            {/* ADVANCED OPTIONS */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-1 focus:outline-none"
              >
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3 animate-fade-in-up !overflow-visible">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Goal Tracking</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <CompactInput id="goal-weight" label="Target Goal Weight (Optional)" value={inputs.goalWeight} onChange={(v) => setInputs({ ...inputs, goalWeight: v })} suffix={unit} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
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
          <div className="flex flex-col gap-4 print-section" ref={printRef}>
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Weight Change</div>
              <div className="text-4xl font-bold text-primary">{fmt(r.percentageChange)}%</div>
              <div className="text-sm text-muted-foreground">{r.direction === "Maintenance" ? "No change detected" : `${r.direction} of ${fmt(r.absoluteChange)} ${unit} — ${fmt(r.percentageChange)}% of starting weight`}</div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Absolute Change</span>
                <span className={`font-extrabold ${r.direction === "Loss" ? "text-emerald-600" : r.direction === "Gain" ? "text-orange-500" : "text-foreground"}`}>
                  {r.direction === "Loss" ? "−" : r.direction === "Gain" ? "+" : ""}{fmt(r.absoluteChange)} {unit}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Distance to Goal</span>
                <span className="font-extrabold text-foreground">{r.hasGoal ? `${fmt(r.distanceToGoal)} ${unit}` : "No goal set"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Progress to Goal</span>
                <span className={`font-extrabold ${r.progressPctToGoal >= 50 ? "text-emerald-600" : r.progressPctToGoal > 0 ? "text-orange-500" : "text-muted-foreground"}`}>
                  {r.hasGoal ? `${fmt(r.progressPctToGoal)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-3 pl-4">Metric</th>
                    <th className="p-3 pr-4 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Starting Weight</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{fmt(parsed.startWeight)} {unit}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Current Weight</td>
                    <td className="py-2.5 px-4 text-right font-semibold">{fmt(parsed.currentWeight)} {unit}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Absolute Change</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{r.direction === "Loss" ? "−" : r.direction === "Gain" ? "+" : ""}{fmt(r.absoluteChange)} {unit}</td>
                  </tr>
                  <tr className="bg-amber-500/10 border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4 text-amber-700">Percentage Change</td>
                    <td className="py-2.5 px-4 text-right text-amber-700">{fmt(r.percentageChange)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Target Goal Weight</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{r.hasGoal ? `${fmt(parsed.goalWeight)} ${unit}` : "Not set"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Distance to Goal</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{r.hasGoal ? `${fmt(r.distanceToGoal)} ${unit}` : "—"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">Progress to Goal</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{r.hasGoal ? `${fmt(r.progressPctToGoal)}%` : "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Direction:</span><span className="font-semibold">{r.direction}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Absolute Change:</span><span className="font-semibold">{fmt(r.absoluteChange)} {unit}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Percentage Change:</span><span className="font-semibold">{fmt(r.percentageChange)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Distance to Goal:</span><span className="font-semibold">{r.hasGoal ? `${fmt(r.distanceToGoal)} ${unit}` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Progress to Goal:</span><span className="font-semibold">{r.hasGoal ? `${fmt(r.progressPctToGoal)}%` : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Journey:</span><span className="font-semibold">{r.hasGoal ? `${fmt(r.totalDistance)} ${unit}` : "—"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is Weight Change Percentage?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Weight change percentage expresses how much of your original body weight you have gained or lost as a ratio rather than a raw number. It is calculated by dividing the absolute change in pounds or kilograms by your starting weight and multiplying by 100. A 130-pound person losing 10 pounds has lost 7.7% of their body weight, while a 350-pound person losing the same 10 pounds has lost only 2.9% — identical on a scale, very different physiologically. Health professionals rely on percentages for exactly this reason: the same absolute loss means far more to a smaller frame, and clinical milestones such as the 5% and 10% thresholds only make sense as percentages of starting mass.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                Enter your starting weight and your current weight, choose pounds or kilograms, and press Calculate. The calculator subtracts the starting weight from the current weight to find the absolute change, then divides by the starting weight to find the percentage. A negative result is a loss, a positive result is a gain. The optional target goal activates progress tracking: the distance remaining is the absolute difference between your current weight and the goal, and progress is the portion of the total journey already completed, capped at 100%. Progress only counts when you are moving toward the goal — if you have drifted past it in the wrong direction, progress reads 0% until you reverse course. Because the math is unit-agnostic, results are identical whether you weigh yourself in pounds or kilograms.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Read the percentage first, then the absolute change. A 5% loss is the first clinical milestone — blood pressure, cholesterol, and insulin sensitivity all improve measurably at that threshold — and a 10% loss brings systemic changes that can reverse prediabetes and improve sleep apnea. Safe, sustainable progress runs between 0.5% and 1.0% per week; faster rates typically cost muscle and invite rebound gain. The progress-to-goal figure is the most motivating number: it converts a distant target into a fraction you have already conquered. Weigh yourself under consistent conditions, ideally the same time of day on the same scale, and let the trend across weeks — not any single reading — guide your decisions.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-change-percentage-calculator" />
          <PopularCalculators exclude="/calculator/weight-change-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
