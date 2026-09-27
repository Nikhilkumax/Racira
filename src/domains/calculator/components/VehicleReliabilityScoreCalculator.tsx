"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CategoryWeight {
  key: string;
  label: string;
  weight: number;
}

interface ReliabilityInputs {
  vehicleAge: number;
  currentMileage: number;
  unscheduledRepairs12mo: number;
  annualRepairCost: number;
  worstSeverity: string;
  daysOutOfService: number;
  maintenanceCompliance: number;
  openRecalls: number;
  warningLightsActive: number;
  vehicleValue: number;
  annualMilesDriven: number;
  extendedWarrantyCost: number;
  decimals: number;
}

// Each dimension is scored 0–100 and combined with these weights, mirroring the
// structure published vehicle dependability studies use to aggregate problems.
const CATEGORIES: CategoryWeight[] = [
  { key: "frequency", label: "Repair Frequency", weight: 0.3 },
  { key: "cost", label: "Repair Cost", weight: 0.2 },
  { key: "severity", label: "Failure Severity", weight: 0.2 },
  { key: "downtime", label: "Availability", weight: 0.12 },
  { key: "maintenance", label: "Maintenance Compliance", weight: 0.1 },
  { key: "safety", label: "Recalls & Warnings", weight: 0.08 },
];

const SEVERITY_SCORES: Record<string, number> = {
  none: 100,
  minor: 78,
  moderate: 50,
  major: 15,
};

const DEFAULTS: ReliabilityInputs = {
  vehicleAge: 5,
  currentMileage: 65000,
  unscheduledRepairs12mo: 1,
  annualRepairCost: 750,
  worstSeverity: "minor",
  daysOutOfService: 3,
  maintenanceCompliance: 90,
  openRecalls: 0,
  warningLightsActive: 0,
  vehicleValue: 18000,
  annualMilesDriven: 12000,
  extendedWarrantyCost: 2400,
  decimals: 1,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ReliabilityResult {
  valid: boolean;
  errorMsg: string;
  totalScore: number;
  grade: string;
  gradeColor: string;
  bandLabel: string;
  repairsPerYear: number;
  costPerMile: number;
  costPercentOfValue: number;
  availabilityPercent: number;
  averageAnnualMileage: number;
  projectedAnnualCost: number;
  fiveYearRepairCost: number;
  expectedRemainingYears: number;
  warrantyBreakEven: number;
  warrantyVerdict: string;
  replaceVsRepairVerdict: string;
  categoryScores: { label: string; score: number; weightPct: number }[];
  weakestCategory: string;
  strongestCategory: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateReliability(i: ReliabilityInputs): ReliabilityResult {
  const blank = (errorMsg: string): ReliabilityResult => ({
    valid: false,
    errorMsg,
    totalScore: 0,
    grade: "",
    gradeColor: "text-muted-foreground",
    bandLabel: "",
    repairsPerYear: 0,
    costPerMile: 0,
    costPercentOfValue: 0,
    availabilityPercent: 0,
    averageAnnualMileage: 0,
    projectedAnnualCost: 0,
    fiveYearRepairCost: 0,
    expectedRemainingYears: 0,
    warrantyBreakEven: 0,
    warrantyVerdict: "",
    replaceVsRepairVerdict: "",
    categoryScores: [],
    weakestCategory: "",
    strongestCategory: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    i.vehicleAge,
    i.currentMileage,
    i.unscheduledRepairs12mo,
    i.annualRepairCost,
    i.daysOutOfService,
    i.maintenanceCompliance,
    i.openRecalls,
    i.warningLightsActive,
    i.vehicleValue,
    i.annualMilesDriven,
    i.extendedWarrantyCost,
    i.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to score the vehicle.");
  if (i.vehicleAge < 0 || i.vehicleAge > 40) return blank("Vehicle age should be between 0 and 40 years.");
  if (i.currentMileage < 0 || i.currentMileage > 600000) return blank("Mileage should be between 0 and 600,000.");
  if (i.unscheduledRepairs12mo < 0 || i.unscheduledRepairs12mo > 40) return blank("Unscheduled repairs should be between 0 and 40.");
  if (i.annualRepairCost < 0) return blank("Annual repair cost cannot be negative.");
  if (i.daysOutOfService < 0 || i.daysOutOfService > 365) return blank("Days out of service should be between 0 and 365.");
  if (i.maintenanceCompliance < 0 || i.maintenanceCompliance > 100) return blank("Maintenance compliance should be between 0% and 100%.");
  if (i.vehicleValue <= 0) return blank("Vehicle value must be greater than zero.");
  if (i.annualMilesDriven <= 0 || i.annualMilesDriven > 100000) return blank("Annual mileage should be between 1 and 100,000.");
  if (i.extendedWarrantyCost < 0) return blank("Warranty cost cannot be negative.");

  const d = Math.max(0, Math.min(2, i.decimals));
  const age = Math.max(0, i.vehicleAge);
  const value = Math.max(1, i.vehicleValue);
  const mileage = Math.max(0, i.currentMileage);

  const repairsPerYear = Math.max(0, i.unscheduledRepairs12mo);

  // Zero unscheduled repairs scores 100 and each repair costs 22 points. Accumulated
  // mileage adds a wear penalty that begins once the odometer passes 100,000 and
  // reaches its 15-point cap at 250,000.
  const mileagePenalty = clamp(((mileage - 100000) / 150000) * 15, 0, 15);
  const repairFrequencyScore = clamp(100 - repairsPerYear * 22 - mileagePenalty, 0, 100);

  // Repair spend is judged against vehicle value, not in absolute dollars, since $800
  // means something different on a $6,000 car than on a $45,000 one.
  const costPercentOfValue = (Math.max(0, i.annualRepairCost) / value) * 100;
  const costScore = clamp(100 - costPercentOfValue * 7, 0, 100);

  const severityScore = SEVERITY_SCORES[i.worstSeverity] ?? SEVERITY_SCORES.minor;

  const daysDown = Math.max(0, i.daysOutOfService);
  const availabilityPercent = clamp(((365 - daysDown) / 365) * 100, 0, 100);
  // Two weeks off the road in a year is treated as complete loss of availability.
  const downtimeScore = clamp(100 - (daysDown / 14) * 100, 0, 100);

  const maintenanceScore = clamp(i.maintenanceCompliance, 0, 100);

  const safetyDeductions = Math.max(0, i.openRecalls) * 25 + Math.max(0, i.warningLightsActive) * 15;
  const safetyScore = clamp(100 - safetyDeductions, 0, 100);

  const scores: Record<string, number> = {
    frequency: repairFrequencyScore,
    cost: costScore,
    severity: severityScore,
    downtime: downtimeScore,
    maintenance: maintenanceScore,
    safety: safetyScore,
  };

  const totalScore = CATEGORIES.reduce((sum, c) => sum + scores[c.key] * c.weight, 0);

  let grade: string;
  let gradeColor: string;
  let bandLabel: string;
  if (totalScore >= 90) {
    grade = "A";
    gradeColor = "text-emerald-600";
    bandLabel = "Exceptional";
  } else if (totalScore >= 80) {
    grade = "B";
    gradeColor = "text-emerald-600";
    bandLabel = "Above Average";
  } else if (totalScore >= 70) {
    grade = "C";
    gradeColor = "text-orange-600";
    bandLabel = "Average";
  } else if (totalScore >= 60) {
    grade = "D";
    gradeColor = "text-orange-600";
    bandLabel = "Below Average";
  } else {
    grade = "F";
    gradeColor = "text-red-600";
    bandLabel = "Poor";
  }

  const milesDriven = Math.max(1, i.annualMilesDriven);
  const costPerMile = Math.max(0, i.annualRepairCost) / milesDriven;
  const averageAnnualMileage = mileage / Math.max(1, age);

  // Repair costs rise roughly 12% a year as components age past warranty.
  const escalation = 1.12;
  const projectedAnnualCost = Math.max(0, i.annualRepairCost) * escalation;
  let fiveYearRepairCost = 0;
  let running = Math.max(0, i.annualRepairCost);
  for (let y = 1; y <= 5; y += 1) {
    running *= escalation;
    fiveYearRepairCost += running;
  }

  // Higher-scoring vehicles are projected to stay economical for longer.
  const deficit = clamp((100 - totalScore) / 100, 0, 1);
  const expectedRemainingYears = clamp(15 - age - deficit * 6, 0, 20);

  const warrantyCost = Math.max(0, i.extendedWarrantyCost);
  const warrantyBreakEven = projectedAnnualCost > 0 ? warrantyCost / projectedAnnualCost : 0;
  const warrantyVerdict =
    totalScore >= 85
      ? "Unlikely to pay off — reliability is already strong"
      : warrantyBreakEven <= 3
        ? "Likely worthwhile at this repair rate"
        : "Marginal — compare it against a self-funded repair reserve";

  const replaceVsRepairVerdict =
    costPercentOfValue >= 30
      ? "Annual repairs exceed 30% of the vehicle's value, so replacement is usually the cheaper route"
      : costPercentOfValue >= 15
        ? "Repair costs are material against the vehicle's value — reassess at each major failure"
        : "Repair remains the economical choice at this spend";

  const categoryScores = CATEGORIES.map((c) => ({
    label: c.label,
    score: scores[c.key],
    weightPct: c.weight * 100,
  }));
  const weakest = categoryScores.reduce((worst, c) => (c.score < worst.score ? c : worst), categoryScores[0]);
  const strongest = categoryScores.reduce((best, c) => (c.score > best.score ? c : best), categoryScores[0]);

  const verdict = `The vehicle scores ${fmt(totalScore, 1)} of 100 — grade ${grade} (${bandLabel.toLowerCase()}) — with ${
    weakest.label.toLowerCase()
  } the weakest dimension at ${fmt(weakest.score, 0)}`;
  const verdictColor = totalScore >= 80 ? "text-emerald-600" : totalScore >= 60 ? "text-orange-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    ...categoryScores.map((c) => ({
      label: `${c.label} at ${fmt(c.weightPct, 0)}% weight`,
      value: `${fmt(c.score, d)} of 100 · contributes ${fmt((c.score * c.weightPct) / 100, 2)} points`,
    })),
    { label: "Weighted reliability score", value: `${fmt(totalScore, d)} of 100`, highlight: true },
    { label: "Reliability grade", value: `${grade} — ${bandLabel}`, highlight: true },
    { label: "Unscheduled repairs in the last 12 months", value: fmt(repairsPerYear, 1) },
    { label: "Average annual mileage across the vehicle's life", value: `${fmt(averageAnnualMileage, 0)} mi` },
    { label: "Mileage wear penalty applied to frequency", value: `−${fmt(mileagePenalty, 1)} points` },
    { label: "Repair cost as a share of vehicle value", value: `${fmt(costPercentOfValue, 1)}%` },
    { label: "Repair cost per mile driven", value: `$${fmt(costPerMile, 3)}` },
    { label: "Vehicle availability", value: `${fmt(availabilityPercent, 1)}%` },
    { label: "Recall and warning-light deductions", value: `${fmt(safetyDeductions, 0)} points` },
    { label: "Projected repair cost next year at 12% escalation", value: `$${fmt(projectedAnnualCost, 0)}` },
    { label: "Cumulative repair cost over the next five years", value: `$${fmt(fiveYearRepairCost, 0)}`, highlight: true },
    { label: "Expected remaining economical years", value: `${fmt(expectedRemainingYears, 1)} years` },
    {
      label: `Extended warranty at $${fmt(warrantyCost, 0)}`,
      value: warrantyCost > 0 ? `breaks even after ${fmt(warrantyBreakEven, 1)} years of repairs` : "no warranty priced in",
    },
    { label: "Warranty view", value: warrantyVerdict },
    { label: "Repair versus replace", value: replaceVsRepairVerdict, highlight: true },
    { label: "Strongest dimension", value: `${strongest.label} at ${fmt(strongest.score, 0)} of 100` },
    { label: "Weakest dimension", value: `${weakest.label} at ${fmt(weakest.score, 0)} of 100` },
  ];

  return {
    valid: true,
    errorMsg: "",
    totalScore,
    grade,
    gradeColor,
    bandLabel,
    repairsPerYear,
    costPerMile,
    costPercentOfValue,
    availabilityPercent,
    averageAnnualMileage,
    projectedAnnualCost,
    fiveYearRepairCost,
    expectedRemainingYears,
    warrantyBreakEven,
    warrantyVerdict,
    replaceVsRepairVerdict,
    categoryScores,
    weakestCategory: weakest.label,
    strongestCategory: strongest.label,
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

export default function VehicleReliabilityScoreCalculator() {
  const [vehicleAge, setVehicleAge] = useState(String(DEFAULTS.vehicleAge));
  const [currentMileage, setCurrentMileage] = useState(String(DEFAULTS.currentMileage));
  const [unscheduledRepairs12mo, setUnscheduledRepairs12mo] = useState(String(DEFAULTS.unscheduledRepairs12mo));
  const [annualRepairCost, setAnnualRepairCost] = useState(String(DEFAULTS.annualRepairCost));
  const [worstSeverity, setWorstSeverity] = useState<string>(DEFAULTS.worstSeverity);
  const [daysOutOfService, setDaysOutOfService] = useState(String(DEFAULTS.daysOutOfService));
  const [maintenanceCompliance, setMaintenanceCompliance] = useState(String(DEFAULTS.maintenanceCompliance));
  const [openRecalls, setOpenRecalls] = useState(String(DEFAULTS.openRecalls));
  const [warningLightsActive, setWarningLightsActive] = useState(String(DEFAULTS.warningLightsActive));
  const [vehicleValue, setVehicleValue] = useState(String(DEFAULTS.vehicleValue));
  const [annualMilesDriven, setAnnualMilesDriven] = useState(String(DEFAULTS.annualMilesDriven));
  const [extendedWarrantyCost, setExtendedWarrantyCost] = useState(String(DEFAULTS.extendedWarrantyCost));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ReliabilityInputs => ({
    vehicleAge: parseFloat(vehicleAge) || 0,
    currentMileage: parseFloat(currentMileage) || 0,
    unscheduledRepairs12mo: parseFloat(unscheduledRepairs12mo) || 0,
    annualRepairCost: parseFloat(annualRepairCost) || 0,
    worstSeverity,
    daysOutOfService: parseFloat(daysOutOfService) || 0,
    maintenanceCompliance: parseFloat(maintenanceCompliance) || 0,
    openRecalls: parseFloat(openRecalls) || 0,
    warningLightsActive: parseFloat(warningLightsActive) || 0,
    vehicleValue: parseFloat(vehicleValue) || 0,
    annualMilesDriven: parseFloat(annualMilesDriven) || 0,
    extendedWarrantyCost: parseFloat(extendedWarrantyCost) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ReliabilityInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ReliabilityResult>(() => calculateReliability(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateReliability(inputs));
  };

  const reset = () => {
    setVehicleAge(String(DEFAULTS.vehicleAge));
    setCurrentMileage(String(DEFAULTS.currentMileage));
    setUnscheduledRepairs12mo(String(DEFAULTS.unscheduledRepairs12mo));
    setAnnualRepairCost(String(DEFAULTS.annualRepairCost));
    setWorstSeverity(DEFAULTS.worstSeverity);
    setDaysOutOfService(String(DEFAULTS.daysOutOfService));
    setMaintenanceCompliance(String(DEFAULTS.maintenanceCompliance));
    setOpenRecalls(String(DEFAULTS.openRecalls));
    setWarningLightsActive(String(DEFAULTS.warningLightsActive));
    setVehicleValue(String(DEFAULTS.vehicleValue));
    setAnnualMilesDriven(String(DEFAULTS.annualMilesDriven));
    setExtendedWarrantyCost(String(DEFAULTS.extendedWarrantyCost));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateReliability(DEFAULTS));
  };

  const ageNum = parseFloat(vehicleAge);
  const mileageNum = parseFloat(currentMileage);
  const repairsNum = parseFloat(unscheduledRepairs12mo);
  const valueNum = parseFloat(vehicleValue);
  const milesNum = parseFloat(annualMilesDriven);

  const errors = {
    vehicleAge: !Number.isFinite(ageNum) || ageNum < 0 || ageNum > 40 ? "Use 0–40 years" : "",
    currentMileage: !Number.isFinite(mileageNum) || mileageNum < 0 || mileageNum > 600000 ? "Use 0–600,000" : "",
    unscheduledRepairs12mo: !Number.isFinite(repairsNum) || repairsNum < 0 || repairsNum > 40 ? "Use 0–40" : "",
    vehicleValue: !Number.isFinite(valueNum) || valueNum <= 0 ? "Must be greater than zero" : "",
    annualMilesDriven: !Number.isFinite(milesNum) || milesNum <= 0 || milesNum > 100000 ? "Use 1–100,000" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How is the reliability score built?",
      answer:
        "Six dimensions are scored from 0 to 100 and combined with published-style weights: repair frequency at 30%, repair cost at 20%, failure severity at 20%, availability at 12%, maintenance compliance at 10% and recalls or active warning lights at 8%. The frequency score subtracts 22 points for each unscheduled repair and adds a mileage penalty that starts at 100,000 miles, while the cost score judges spending against the vehicle's value rather than in dollars, because $800 of repairs means something very different on a $6,000 car than on a $45,000 one.",
    },
    {
      question: "Why is cost measured against vehicle value?",
      answer:
        "Because the decision the score is meant to support is whether to keep or replace the car. An annual repair bill of $1,200 is unremarkable against a vehicle worth $25,000 and is a warning sign against one worth $4,000. Expressing spend as a percentage of value makes the comparison honest across price classes, and the same ratio drives the repair-versus-replace verdict: at 15% of value the outcome becomes a judgement call, and past 30% the arithmetic usually favours replacement.",
    },
    {
      question: "What does the projected five-year repair cost assume?",
      answer:
        "That repairs escalate by about 12% a year as components age past their warranty and more of them begin to fail together — a rate consistent with the way dependability curves steepen in later years. The projection is deliberately simple, and it will overstate costs for a vehicle that has just had its major wear items replaced and understate them for one approaching a known expensive service such as a timing belt, turbocharger or transmission. Use the figure as the trend, and adjust your own expectations for known upcoming work.",
    },
    {
      question: "Should I buy an extended warranty based on this?",
      answer:
        "The calculator compares the warranty price against the projected repair bill to show a break-even period, but the decision needs two more pieces of information. First, what the policy actually excludes — most extended warranties require proof of scheduled maintenance and exclude wear items, seals and consequential damage. Second, whether you would fund the repairs yourself if they arrived: a warranty is a certainty-priced hedge against an uncertain bill, so it is most defensible for a low-scoring, complex, out-of-warranty vehicle and least defensible for one already scoring above 85.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Vehicle Reliability Score Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Vehicle Reliability Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Vehicle">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="age"
                  label="Vehicle Age"
                  value={vehicleAge}
                  onChange={setVehicleAge}
                  onEnter={runCalculate}
                  min="0"
                  max="40"
                  step="1"
                  suffix="years"
                  error={errors.vehicleAge}
                  tooltip="Used for average annual mileage and the projected remaining economical years."
                />
                <CompactInput
                  id="mileage"
                  label="Odometer"
                  value={currentMileage}
                  onChange={setCurrentMileage}
                  onEnter={runCalculate}
                  min="0"
                  max="600000"
                  step="1000"
                  suffix="mi"
                  error={errors.currentMileage}
                  hint="Wear penalty starts at 100,000."
                  tooltip="Accumulated mileage, which carries its own wear penalty on top of the repair count."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="value"
                  label="Current Value"
                  value={vehicleValue}
                  onChange={setVehicleValue}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  error={errors.vehicleValue}
                  hint="Repairs are judged against it."
                  tooltip="Market value of the vehicle, which is the denominator for the cost dimension."
                />
                <CompactInput
                  id="annual-miles"
                  label="Annual Mileage"
                  value={annualMilesDriven}
                  onChange={setAnnualMilesDriven}
                  onEnter={runCalculate}
                  min="1"
                  max="100000"
                  step="1000"
                  suffix="mi"
                  error={errors.annualMilesDriven}
                  tooltip="Miles driven in a year, used for the repair cost per mile."
                />
              </div>
            </SubSection>

            <SubSection title="Repair History">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="repairs"
                  label="Unscheduled Repairs"
                  value={unscheduledRepairs12mo}
                  onChange={setUnscheduledRepairs12mo}
                  onEnter={runCalculate}
                  min="0"
                  max="40"
                  step="1"
                  suffix="in 12 mo"
                  error={errors.unscheduledRepairs12mo}
                  hint="Scheduled servicing excluded."
                  tooltip="How many unplanned repairs the vehicle needed in the last twelve months."
                />
                <CompactInput
                  id="repair-cost"
                  label="Repair Spend"
                  value={annualRepairCost}
                  onChange={setAnnualRepairCost}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="per year"
                  tooltip="Total spent on unplanned repairs over the last twelve months."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="severity"
                  label="Worst Failure"
                  value={worstSeverity}
                  onChange={setWorstSeverity}
                  options={[
                    { value: "none", label: "No failures at all" },
                    { value: "minor", label: "Minor — accessory or trim" },
                    { value: "moderate", label: "Moderate — driveability affected" },
                    { value: "major", label: "Major — vehicle could not be driven" },
                  ]}
                  tooltip="Severity of the worst single failure in the period; it carries a fifth of the total weight."
                />
                <CompactInput
                  id="downtime"
                  label="Days Off the Road"
                  value={daysOutOfService}
                  onChange={setDaysOutOfService}
                  onEnter={runCalculate}
                  min="0"
                  max="365"
                  step="1"
                  suffix="days"
                  tooltip="Total days the vehicle was unusable for repairs in the last year."
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
                  <SubSection title="Upkeep & Warranty">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="compliance"
                        label="Maintenance Compliance"
                        value={maintenanceCompliance}
                        onChange={setMaintenanceCompliance}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="5"
                        suffix="%"
                        tooltip="Share of scheduled services actually performed on time."
                      />
                      <CompactInput
                        id="recalls"
                        label="Open Recalls"
                        value={openRecalls}
                        onChange={setOpenRecalls}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        hint="25 points each."
                        tooltip="Recalls not yet carried out, which are a direct safety deduction."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="warnings"
                        label="Active Warning Lights"
                        value={warningLightsActive}
                        onChange={setWarningLightsActive}
                        onEnter={runCalculate}
                        min="0"
                        step="1"
                        hint="15 points each."
                        tooltip="Warning lights currently illuminated; each costs 15 points of the safety dimension."
                      />
                      <CompactInput
                        id="warranty"
                        label="Extended Warranty Price"
                        value={extendedWarrantyCost}
                        onChange={setExtendedWarrantyCost}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        tooltip="Quoted price of an extended warranty, used for the break-even comparison."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the scores."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Weights: frequency 30%, cost 20%, severity 20%, availability 12%, maintenance 10%, safety 8%.
                        </span>
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Reliability Score</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.totalScore, calcInputs.decimals)} / 100` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Grade ${results.grade} — ${results.bandLabel} · weakest dimension is ${results.weakestCategory.toLowerCase()}`
                  : "Fix the highlighted inputs to score the vehicle"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Repairs / Year</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.repairsPerYear, 1) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cost of Value</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.costPercentOfValue, 1)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Availability</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.availabilityPercent, 1)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Reliability Item</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Value</th>
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
                        Enter the vehicle's history to see the score breakdown.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Weighted score</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.totalScore, calcInputs.decimals)} / 100 · grade ${results.grade}`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Reliability score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.totalScore, 1)} / 100` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Grade</span>
                  <span className={`text-base font-bold ${results.gradeColor}`}>
                    {results.valid ? `${results.grade} — ${results.bandLabel}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cost per mile</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `$${fmt(results.costPerMile, 3)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average annual mileage</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.averageAnnualMileage, 0)} mi` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected next-year cost</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `$${fmt(results.projectedAnnualCost, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Five-year repair cost</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `$${fmt(results.fiveYearRepairCost, 0)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining economical years</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.expectedRemainingYears, 1)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Warranty break-even</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? (results.warrantyBreakEven > 0 ? `${fmt(results.warrantyBreakEven, 1)} years` : "n/a") : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <>
                  <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    <span className="font-bold text-foreground">Repair or replace:</span> {results.replaceVsRepairVerdict}.{" "}
                    <span className="font-bold text-foreground">Warranty:</span> {results.warrantyVerdict}.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Vehicle Reliability Score Calculator?</h2>
            <p>
              A vehicle reliability score calculator turns a car's repair history, downtime, upkeep and safety record into a single
              weighted score and a letter grade, then uses that history to project what the next few years of ownership are likely to cost
              and whether an extended warranty would pay for itself. It is a decision tool for the two questions every out-of-warranty
              owner eventually faces: keep it or replace it, and insure the repairs or fund them yourself.
            </p>
            <p>
              Scoring six separate dimensions rather than one overall number matters, because the dimensions point at different actions.
              A vehicle with a good frequency score but a poor severity score has had few failures that were serious, while one with the
              reverse pattern has had niggling problems that never left it stranded. The two deserve different decisions.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Repair frequency carries the heaviest weight at 30%. It starts from 100 and subtracts 22 points for each unscheduled repair
              in the last twelve months, then applies a mileage penalty that begins at 100,000 miles and reaches its 15-point cap at
              250,000 — because a high-mileage car with one repair has different prospects from a low-mileage car with the same record.
              Scheduled servicing is deliberately excluded, since a service is a cost of ownership rather than a failure.
            </p>
            <p>
              Cost carries 20% and is expressed as a percentage of the vehicle's value rather than in dollars, which is what makes the
              score comparable between a cheap car and an expensive one. Severity carries another 20% and is scored from the worst single
              failure in the period, running from 100 points for no failures to 15 for a major one that left the car undriveable.
              Availability carries 12%, treating two weeks off the road in a year as a complete loss of the dimension, and maintenance
              compliance carries 10% directly from the share of scheduled work performed on time. Recalls and active warning lights take
              the smallest share at 8%, with 25 points deducted per open recall and 15 per illuminated warning light.
            </p>
            <p>
              The projections follow from the score. Repair spend is assumed to escalate about 12% a year as more components pass their
              design life, which produces a next-year figure and a cumulative five-year figure, and the score itself sets an estimate of how
              many economical years remain: higher scores stretch the horizon, lower scores shorten it. An extended warranty is compared
              against the projected annual spend to give a break-even period, and the ratio of repair cost to vehicle value decides the
              repair-versus-replace verdict.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the weighted score out of 100 with the letter grade and the name of the weakest dimension. The three-stat
              bar sets the repairs per year, the repair spend as a share of vehicle value and the availability figure side by side.
            </p>
            <p>
              The breakdown table shows each dimension's score, its weight and the points it contributes, then the weighted total, the
              mileage penalty that was applied, the cost-per-mile figure, the recall and warning deductions, the projected and five-year
              repair costs, the remaining economical years, the warranty break-even and both verdicts. The summary panel repeats the
              headline figures.
            </p>
            <p>
              Two cautions are worth keeping. The score is only as good as the repair history you enter, and a single recent year is a
              noisy sample: two repairs in one year often say more about an unlucky twelve months than about the car. And no score can see
              the future — a model with a known expensive service interval ahead, a design with a documented weak component, or a repair
              quote already sitting on your desk should all override a number that was built from the past. Use the score to frame the
              decision and the specifics to settle it.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/vehicle-reliability-score-calculator" />
          <PopularCalculators exclude="/calculator/vehicle-reliability-score-calculator" />
        </div>
      </div>
    </>
  );
}
