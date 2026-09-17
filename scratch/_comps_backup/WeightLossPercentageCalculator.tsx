"use client";

import React, { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";

// ── 1. TypeScript interfaces ──────────────────────────────────────────────
interface WeightLossInputs {
  unitSystem: "imperial" | "metric";
  startWeight: number;
  currentWeight: number;
}

interface WeightLossResult {
  absoluteLost: number;
  percentageLost: number;
  hasReached5Pct: boolean;
  hasReached10Pct: boolean;
  hasReached15Pct: boolean;
  target5PctWeight: number;
  target10PctWeight: number;
  target15PctWeight: number;
  to10PctRemaining: number;
}

// ── 2. Pure calculation function ──────────────────────────────────────────
const calculate = (i: WeightLossInputs): WeightLossResult => {
  const absoluteLost = i.startWeight - i.currentWeight;
  const percentageLost = i.startWeight > 0 ? (absoluteLost / i.startWeight) * 100 : 0;

  const target5PctWeight = i.startWeight * 0.95;
  const target10PctWeight = i.startWeight * 0.9;
  const target15PctWeight = i.startWeight * 0.85;

  return {
    absoluteLost,
    percentageLost,
    hasReached5Pct: percentageLost >= 5,
    hasReached10Pct: percentageLost >= 10,
    hasReached15Pct: percentageLost >= 15,
    target5PctWeight,
    target10PctWeight,
    target15PctWeight,
    to10PctRemaining: Math.max(0, i.currentWeight - target10PctWeight),
  };
};

// ── 3. DEFAULTS ────────────────────────────────────────────────────────────
const DEFAULTS = {
  unitSystem: "imperial" as const,
  startWeight: "250",
  currentWeight: "235",
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
};

export default function WeightLossPercentageCalculator() {
  const [inputs, setInputs] = useState<InputState>({
    unitSystem: DEFAULTS.unitSystem,
    startWeight: DEFAULTS.startWeight,
    currentWeight: DEFAULTS.currentWeight,
  });
  const [result, setResult] = useState<WeightLossResult>(() =>
    calculate({ unitSystem: DEFAULTS.unitSystem, startWeight: 250, currentWeight: 235 })
  );
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate({ unitSystem: DEFAULTS.unitSystem, startWeight: 250, currentWeight: 235 }));
  }, []);

  const parsed: WeightLossInputs = {
    unitSystem: inputs.unitSystem,
    startWeight: parse(inputs.startWeight, 0),
    currentWeight: parse(inputs.currentWeight, 0),
  };

  const valErrors: Record<string, string> = {};
  if (parsed.startWeight <= 0) valErrors.startWeight = "Starting weight must be greater than 0";
  if (parsed.currentWeight <= 0) valErrors.currentWeight = "Current weight must be greater than 0";
  else if (parsed.currentWeight > parsed.startWeight)
    valErrors.currentWeight = "Current weight must be lower than starting weight (loss tracker)";
  const hasErrors = Object.keys(valErrors).length > 0;

  const handleCalculate = () => {
    setResult(calculate(parsed));
  };

  const reset = () => {
    setInputs({ ...DEFAULTS });
    setResult(calculate({ unitSystem: DEFAULTS.unitSystem, startWeight: 250, currentWeight: 235 }));
  };

  const handlePrint = () => {
    window.print();
  };

  const r = result;
  const unit = unitLabel(inputs.unitSystem);

  const faqs = [
    {
      question: "Why does the medical community focus on 5% and 10%?",
      answer:
        "A 5% to 10% loss of total body mass dramatically improves insulin sensitivity, reduces visceral fat around the liver, and lowers systolic blood pressure. You do not need a perfect BMI to substantially cut cardiovascular and diabetes risk.",
    },
    {
      question: "What happens when I hit the 10% milestone?",
      answer:
        "At 10% loss, systemic changes compound: sleep apnea often improves as the airway clears, inflammation markers drop, and many pre-diabetic patients return to a normal HbA1c baseline.",
    },
    {
      question: "Why is 15% considered the gold standard for disease reversal?",
      answer:
        "Landmark trials like DiRECT in the UK showed that losing 15% or more of body weight can force Type 2 diabetes into remission by stripping ectopic fat from the pancreas and liver.",
    },
    {
      question: "Can I lose weight too fast?",
      answer:
        "Yes. Losing more than 1% of body weight per week risks muscle loss and gallstones. The safe range is 0.5% to 1.0% per week, sustained over months.",
    },
    {
      question: "If I only lost 3%, did I fail?",
      answer:
        "No. Any movement in the right direction is significant — 3% means you have halted weight gain and entered a deficit. Consistency carries you across the 5% threshold.",
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator/health" }, { label: "Weight Loss Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weight Loss Percentage Calculator</h1>

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
                <CompactInput id="start-weight" label="Starting Baseline" value={inputs.startWeight} onChange={(v) => setInputs({ ...inputs, startWeight: v })} suffix={unit} />
                {valErrors.startWeight && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.startWeight}</p>}
              </div>
              <div className="flex flex-col">
                <CompactInput id="current-weight" label="Current Weight" value={inputs.currentWeight} onChange={(v) => setInputs({ ...inputs, currentWeight: v })} suffix={unit} />
                {valErrors.currentWeight && <p className="text-xs text-red-500 font-medium mt-1">{valErrors.currentWeight}</p>}
              </div>
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Total Weight Lost</div>
              <div className="text-4xl font-bold text-primary">{fmt(r.percentageLost)}%</div>
              <div className="text-sm text-muted-foreground">{fmt(r.absoluteLost)} {unit} lost from a starting weight of {fmt(parsed.startWeight)} {unit}</div>
            </div>

            {/* 2. THREE-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Absolute Loss</span>
                <span className="font-extrabold text-emerald-600">{fmt(r.absoluteLost)} {unit}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">5% Milestone</span>
                <span className={`font-extrabold ${r.hasReached5Pct ? "text-emerald-600" : "text-orange-500"}`}>{r.hasReached5Pct ? "Achieved" : `${fmt(Math.max(0, parsed.currentWeight - r.target5PctWeight))} ${unit} to go`}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">10% Milestone</span>
                <span className={`font-extrabold ${r.hasReached10Pct ? "text-emerald-600" : "text-orange-500"}`}>{r.hasReached10Pct ? "Achieved" : `${fmt(r.to10PctRemaining)} ${unit} to go`}</span>
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
                    <td className="py-2.5 px-4">Absolute Weight Lost</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(r.absoluteLost)} {unit}</td>
                  </tr>
                  <tr className="bg-amber-500/10 border-t-2 border-border font-bold">
                    <td className="py-2.5 px-4 text-amber-700">Percentage Lost</td>
                    <td className="py-2.5 px-4 text-right text-amber-700">{fmt(r.percentageLost)}%</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">5% Milestone Weight</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(r.target5PctWeight)} {unit} {r.hasReached5Pct ? "✓" : ""}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">10% Milestone Weight</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(r.target10PctWeight)} {unit} {r.hasReached10Pct ? "✓" : ""}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-4">15% Milestone Weight</td>
                    <td className="py-2.5 px-4 text-right text-muted-foreground">{fmt(r.target15PctWeight)} {unit} {r.hasReached15Pct ? "✓" : ""}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                <div className="flex justify-between"><span className="text-muted-foreground">Absolute Loss:</span><span className="font-semibold">{fmt(r.absoluteLost)} {unit}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Percentage Lost:</span><span className="font-semibold">{fmt(r.percentageLost)}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">5% Milestone:</span><span className={`font-semibold ${r.hasReached5Pct ? "text-emerald-600" : ""}`}>{r.hasReached5Pct ? "Achieved" : "Not yet"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">10% Milestone:</span><span className={`font-semibold ${r.hasReached10Pct ? "text-emerald-600" : ""}`}>{r.hasReached10Pct ? "Achieved" : "Not yet"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">15% Milestone:</span><span className={`font-semibold ${r.hasReached15Pct ? "text-emerald-600" : ""}`}>{r.hasReached15Pct ? "Achieved" : "Not yet"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Safe Weekly Pace:</span><span className="font-semibold">{fmt(parsed.startWeight * 0.01)} {unit}/wk</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is Weight Loss Percentage?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Weight loss percentage measures how much of your original body weight you have lost, expressed as a ratio instead of raw pounds or kilograms. You divide the total weight lost by your starting weight and multiply by 100. If you started at 250 pounds and now weigh 235, you have lost 15 pounds — 6% of your starting mass. The percentage matters because medical research sets its milestones in relative terms: a 5% loss improves blood pressure and insulin sensitivity, a 10% loss can reverse prediabetes and ease sleep apnea, and a 15% loss has driven Type 2 diabetes into remission in landmark clinical trials. Two people can lose the same number of pounds and be at completely different points in their health journey; percentage is the common yardstick.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">
                Enter your starting baseline weight and your current weight, choose pounds or kilograms, and press Calculate. The calculator subtracts the current weight from the starting weight to find the absolute loss, then divides that by the starting weight to derive the percentage. From there it maps your progress against the three clinical thresholds: the 5% milestone weight is 95% of your starting weight, the 10% milestone is 90%, and the 15% milestone is 85%. Each milestone row shows the exact weight you need to reach and whether you have crossed it. The pace figure at the bottom translates the 1% per week clinical safety limit into your specific numbers — for a 250-pound person, no more than 2.5 pounds per week. Weigh yourself under consistent conditions and let the trend line, not any single day's reading, tell you whether you are on track.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">
                Start with the big number: the percentage of mass eliminated. Below 5%, you are in the early phase — the direction is correct and the first clinical milestone is close. Between 5% and 10%, measurable health changes are underway, and your cardiovascular and metabolic risk is already falling. Crossing 10% puts you in the territory where systemic improvements become obvious, and reaching 15% is where disease remission becomes a realistic goal for many people. The remaining-to-milestone figures tell you exactly how much more to lose for the next threshold, which keeps the target concrete rather than abstract. Whatever your current percentage, the pace guidance is the same: slow, consistent progress beats rapid loss that sacrifices muscle and invites rebound. If you have stalled, the milestone weights give you a precise, motivating next stop on the way down.
              </p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-loss-percentage-calculator" />
          <PopularCalculators exclude="/calculator/weight-loss-percentage-calculator" />
        </div>
      </div>
    </>
  );
}