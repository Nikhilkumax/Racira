"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RoadType {
  key: string;
  label: string;
  maxSuperelevation: number;
}

/** Practical maximum superelevation rates by facility type (AASHTO Green Book). */
const ROAD_TYPES: RoadType[] = [
  { key: "rural-arterial", label: "Rural arterial", maxSuperelevation: 8 },
  { key: "urban-arterial", label: "Urban arterial", maxSuperelevation: 6 },
  { key: "rural-collector", label: "Rural collector", maxSuperelevation: 8 },
  { key: "urban-collector", label: "Urban collector", maxSuperelevation: 6 },
  { key: "local", label: "Local road", maxSuperelevation: 4 },
];

/** Tabulated minimum stopping sight distance on level ground, all AASHTO editions since 2001. */
const MINIMUM_SSD: { speed: number; ssd: number }[] = [
  { speed: 15, ssd: 80 },
  { speed: 20, ssd: 115 },
  { speed: 25, ssd: 155 },
  { speed: 30, ssd: 200 },
  { speed: 35, ssd: 250 },
  { speed: 40, ssd: 305 },
  { speed: 45, ssd: 360 },
  { speed: 50, ssd: 425 },
  { speed: 55, ssd: 495 },
  { speed: 60, ssd: 570 },
  { speed: 65, ssd: 645 },
  { speed: 70, ssd: 730 },
  { speed: 75, ssd: 820 },
  { speed: 80, ssd: 910 },
];

interface HighwayInputs {
  designSpeed: number;
  roadType: string;
  grade: number;
  gradeChange: number;
  laneWidth: number;
  driverEyeHeight: number;
  objectHeight: number;
  superelevationRate: number;
  sideFrictionFactor: number;
  decimals: number;
}

const DEFAULTS: HighwayInputs = {
  designSpeed: 60,
  roadType: "rural-arterial",
  grade: 3,
  gradeChange: 3,
  laneWidth: 12,
  driverEyeHeight: 3.5,
  objectHeight: 2,
  superelevationRate: 6,
  sideFrictionFactor: 0.15,
  decimals: 0,
};

const PERCEPTION_REACTION_TIME = 2.5;

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface HighwayResult {
  valid: boolean;
  errorMsg: string;
  prd: number;
  brakingDistance: number;
  ssd: number;
  radius: number;
  middleOrdinate: number;
  kValue: number;
  curveLength: number;
  minimumSsd: number;
  tableSpeed: number;
  margin: number;
  meetsMinimum: boolean;
  frictionSharePct: number;
  superelevationSharePct: number;
  availableFriction: number;
  lateralRatio: number;
  roadTypeLabel: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateHighway(input: HighwayInputs): HighwayResult {
  const roadType = ROAD_TYPES.find((r) => r.key === input.roadType) || ROAD_TYPES[0];

  const blank = (errorMsg: string): HighwayResult => ({
    valid: false,
    errorMsg,
    prd: 0,
    brakingDistance: 0,
    ssd: 0,
    radius: 0,
    middleOrdinate: 0,
    kValue: 0,
    curveLength: 0,
    minimumSsd: 0,
    tableSpeed: 0,
    margin: 0,
    meetsMinimum: false,
    frictionSharePct: 0,
    superelevationSharePct: 0,
    availableFriction: 0,
    lateralRatio: 0,
    roadTypeLabel: roadType.label,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.designSpeed,
    input.grade,
    input.gradeChange,
    input.laneWidth,
    input.driverEyeHeight,
    input.objectHeight,
    input.superelevationRate,
    input.sideFrictionFactor,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every design field to run the check.");
  if (input.designSpeed < 15 || input.designSpeed > 85) return blank("Design speed should be between 15 and 85 mph.");
  if (input.grade < -12 || input.grade > 12) return blank("Grade should be between −12% and +12%.");
  if (input.gradeChange < 0 || input.gradeChange > 12) return blank("The algebraic grade change should be between 0% and 12%.");
  if (input.laneWidth < 6 || input.laneWidth > 20) return blank("Lane width should be between 6 and 20 feet.");
  if (input.driverEyeHeight < 1 || input.driverEyeHeight > 10) return blank("Driver eye height should be between 1 and 10 feet.");
  if (input.objectHeight < 0.1 || input.objectHeight > 10) return blank("Object height should be between 0.1 and 10 feet.");
  if (input.superelevationRate < 0 || input.superelevationRate > 12) return blank("Superelevation should be between 0% and 12%.");
  if (input.sideFrictionFactor <= 0 || input.sideFrictionFactor > 0.5) {
    return blank("The side friction factor should be above 0 and no more than 0.5.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));
  const V = input.designSpeed;
  const G = input.grade / 100;
  const f = input.sideFrictionFactor;
  const e = input.superelevationRate / 100;

  // AASHTO stopping sight distance: perception-reaction distance 1.47·V·t with the
  // 2.5 s reaction time, plus the braking distance V² / [30(f ± G)]. An uphill grade
  // raises the denominator and shortens the braking distance; a downhill grade does
  // the opposite, which is why the sign of G matters.
  const prd = 1.47 * V * PERCEPTION_REACTION_TIME;
  const brakingDistance = (V * V) / (30 * (f + G));
  if (brakingDistance <= 0) {
    return blank("The friction factor and grade cancel out — raise the friction factor or reduce the downgrade.");
  }
  const ssd = prd + brakingDistance;

  // Horizontal curve geometry: the radius that balances centrifugal force against
  // superelevation and side friction, R = V² / [15(e + f)] with V in mph.
  const lateralRatio = e + f;
  const radius = (V * V) / (15 * lateralRatio);

  // AASHTO horizontal sightline offset (middle ordinate) for the curve, using the
  // 28.65° approximation for the angle subtended by the sight distance.
  const angleRad = (28.65 * ssd) / radius;
  const middleOrdinate = radius * (1 - Math.cos(Math.min(angleRad, Math.PI)));

  // Crest vertical curve length for S < L: L = A·S² / [200(√h1 + √h2)²], which equals
  // the familiar A·S² / 2,158 with the standard 3.5 ft eye and 2.0 ft object heights.
  const curveLength = (input.gradeChange * ssd * ssd) / (200 * Math.pow(Math.sqrt(input.driverEyeHeight) + Math.sqrt(input.objectHeight), 2));
  const kValue = input.gradeChange > 0 ? curveLength / input.gradeChange : 0;

  // Nearest tabulated design speed gives the minimum stopping sight distance a new
  // alignment is expected to provide on level ground.
  const nearestRow = MINIMUM_SSD.reduce((best, row) => (Math.abs(row.speed - V) < Math.abs(best.speed - V) ? row : best), MINIMUM_SSD[0]);
  const tableSpeed = nearestRow.speed;
  const minimumSsd = nearestRow.ssd;
  const margin = ssd - minimumSsd;
  const meetsMinimum = margin >= 0;

  const frictionSharePct = (f / lateralRatio) * 100;
  const superelevationSharePct = (e / lateralRatio) * 100;
  const availableFriction = Math.max(0, 0.5 - f);

  const verdict = meetsMinimum
    ? `The computed ${fmt(ssd, 0)} ft of stopping sight distance is ${fmt(margin, 0)} ft beyond the ${fmt(
        minimumSsd,
        0,
      )} ft tabulated minimum for ${fmt(tableSpeed, 0)} mph`
    : `The computed ${fmt(ssd, 0)} ft falls ${fmt(Math.abs(margin), 0)} ft short of the ${fmt(
        minimumSsd,
        0,
      )} ft minimum used for ${fmt(tableSpeed, 0)} mph — check the downgrade and the friction assumption`;
  const verdictColor = meetsMinimum ? "text-emerald-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    { label: "Design speed", value: `${fmt(V, 0)} mph` },
    { label: "Road type", value: `${roadType.label} — maximum superelevation ${fmt(roadType.maxSuperelevation, 0)}%` },
    { label: `Grade ${fmt(input.grade, 1)}% (${input.grade >= 0 ? "uphill" : "downhill"})`, value: `G = ${fmt(G, 3)}` },
    { label: "Side friction factor assumed", value: fmt(f, 3) },
    { label: "Perception-reaction distance (1.47 × V × 2.5)", value: `${fmt(prd, d)} ft` },
    { label: "Braking distance (V² / [30(f + G)])", value: `${fmt(brakingDistance, d)} ft` },
    { label: "Stopping sight distance", value: `${fmt(ssd, d)} ft`, highlight: true },
    { label: `Minimum sight distance at ${fmt(tableSpeed, 0)} mph`, value: `${fmt(minimumSsd, 0)} ft` },
    {
      label: "Margin against the minimum",
      value: `${margin >= 0 ? "+" : "−"}${fmt(Math.abs(margin), d)} ft`,
      highlight: true,
    },
    { label: `Superelevation ${fmt(input.superelevationRate, 1)}% (e = ${fmt(e, 3)})`, value: `${fmt(superelevationSharePct, 1)}% of the lateral demand` },
    { label: "Side friction share of the lateral demand", value: `${fmt(frictionSharePct, 1)}%` },
    { label: "Horizontal curve radius (V² / [15(e + f)])", value: `${fmt(radius, 0)} ft` },
    { label: "Horizontal sightline offset (R(1 − cos 28.65S/R))", value: `${fmt(middleOrdinate, d)} ft` },
    { label: `Crest vertical curve for A = ${fmt(input.gradeChange, 1)}%`, value: `${fmt(curveLength, d)} ft · K = ${fmt(kValue, d)}` },
    { label: "Lane width entered (used for the lateral checks)", value: `${fmt(input.laneWidth, d)} ft` },
    { label: "Friction left in reserve above the assumed value", value: fmt(availableFriction, 3) },
  ];

  return {
    valid: true,
    errorMsg: "",
    prd,
    brakingDistance,
    ssd,
    radius,
    middleOrdinate,
    kValue,
    curveLength: curveLength,
    minimumSsd,
    tableSpeed,
    margin,
    meetsMinimum,
    frictionSharePct,
    superelevationSharePct,
    availableFriction,
    lateralRatio,
    roadTypeLabel: roadType.label,
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

export default function HighwayDesignSpeedCalculator() {
  const [designSpeed, setDesignSpeed] = useState(String(DEFAULTS.designSpeed));
  const [roadType, setRoadType] = useState<string>(DEFAULTS.roadType);
  const [grade, setGrade] = useState(String(DEFAULTS.grade));
  const [gradeChange, setGradeChange] = useState(String(DEFAULTS.gradeChange));
  const [laneWidth, setLaneWidth] = useState(String(DEFAULTS.laneWidth));
  const [driverEyeHeight, setDriverEyeHeight] = useState(String(DEFAULTS.driverEyeHeight));
  const [objectHeight, setObjectHeight] = useState(String(DEFAULTS.objectHeight));
  const [superelevationRate, setSuperelevationRate] = useState(String(DEFAULTS.superelevationRate));
  const [sideFrictionFactor, setSideFrictionFactor] = useState(String(DEFAULTS.sideFrictionFactor));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): HighwayInputs => ({
    designSpeed: parseFloat(designSpeed) || 0,
    roadType,
    grade: parseFloat(grade) || 0,
    gradeChange: parseFloat(gradeChange) || 0,
    laneWidth: parseFloat(laneWidth) || 0,
    driverEyeHeight: parseFloat(driverEyeHeight) || 0,
    objectHeight: parseFloat(objectHeight) || 0,
    superelevationRate: parseFloat(superelevationRate) || 0,
    sideFrictionFactor: parseFloat(sideFrictionFactor) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<HighwayInputs>(() => DEFAULTS);
  const [results, setResults] = useState<HighwayResult>(() => calculateHighway(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateHighway(inputs));
  };

  const reset = () => {
    setDesignSpeed(String(DEFAULTS.designSpeed));
    setRoadType(DEFAULTS.roadType);
    setGrade(String(DEFAULTS.grade));
    setGradeChange(String(DEFAULTS.gradeChange));
    setLaneWidth(String(DEFAULTS.laneWidth));
    setDriverEyeHeight(String(DEFAULTS.driverEyeHeight));
    setObjectHeight(String(DEFAULTS.objectHeight));
    setSuperelevationRate(String(DEFAULTS.superelevationRate));
    setSideFrictionFactor(String(DEFAULTS.sideFrictionFactor));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateHighway(DEFAULTS));
  };

  const speedNum = parseFloat(designSpeed);
  const gradeNum = parseFloat(grade);
  const widthNum = parseFloat(laneWidth);
  const eNum = parseFloat(superelevationRate);
  const fNum = parseFloat(sideFrictionFactor);

  const errors = {
    designSpeed: !Number.isFinite(speedNum) || speedNum < 15 || speedNum > 85 ? "Use 15–85 mph" : "",
    grade: !Number.isFinite(gradeNum) || gradeNum < -12 || gradeNum > 12 ? "Use −12% to +12%" : "",
    laneWidth: !Number.isFinite(widthNum) || widthNum < 6 || widthNum > 20 ? "Use 6–20 ft" : "",
    superelevationRate: !Number.isFinite(eNum) || eNum < 0 || eNum > 12 ? "Use 0–12%" : "",
    sideFrictionFactor: !Number.isFinite(fNum) || fNum <= 0 || fNum > 0.5 ? "Use 0.01–0.5" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is stopping sight distance?",
      answer:
        "Stopping sight distance is the length of roadway a driver must be able to see ahead to notice an unexpected object, react and brake to a stop before reaching it. AASHTO builds it from two parts: the distance travelled during perception and reaction, taken as 1.47 times the design speed in mph times a 2.5 second reaction time, and the braking distance V² divided by 30 times the sum or difference of the side friction factor and the grade. For a 60 mph design speed on level ground with a friction factor of 0.35 that comes to about 220 feet plus 343 feet, or roughly 570 feet in total.",
    },
    {
      question: "Why does the grade change the braking distance?",
      answer:
        "Because gravity either helps or hinders the brakes. On an upgrade some of the deceleration comes free from gravity, so the denominator grows and the braking distance shrinks; on a downgrade gravity works against the brakes, the denominator shrinks and the distance grows sharply. The effect is far from marginal: at 60 mph with a friction factor of 0.35, a 6 percent downgrade stretches the braking distance from about 343 feet to roughly 421 feet, and a 6 percent upgrade shortens it to about 289 feet. AASHTO therefore requires sight distance to be checked in the downhill direction of travel.",
    },
    {
      question: "How is the horizontal curve radius calculated?",
      answer:
        "The radius that balances the centrifugal force at the design speed against superelevation and side friction is R = V² divided by 15 times the sum of the superelevation rate, as a decimal, and the side friction factor. At 60 mph with 6 percent superelevation and a friction factor of 0.15 the sum is 0.21 and the radius comes out near 1,143 feet. From that radius the horizontal sightline offset follows as R times one minus the cosine of 28.65 times the sight distance divided by R, which is the middle ordinate a designer must keep clear of obstacles such as guardrails, walls or vegetation.",
    },
    {
      question: "How long does a crest vertical curve need to be?",
      answer:
        "For a crest curve where the sight distance is shorter than the curve, AASHTO gives the minimum length as A times S squared divided by 200 times the sum of the square roots of the driver eye height and the object height. With the standard 3.5 foot eye height and 2.0 foot object height that denominator is 2,158, so the length is A times S squared divided by 2,158, where A is the algebraic difference in grades. A 4 percent grade change with 570 feet of sight distance then needs about 603 feet of curve, and the ratio of length to grade change — the K value — is the number a designer carries into the office.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Highway Design Speed Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Highway Design Speed Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Design Parameters">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="design-speed"
                  label="Design Speed"
                  value={designSpeed}
                  onChange={setDesignSpeed}
                  onEnter={runCalculate}
                  min="15"
                  max="85"
                  step="5"
                  suffix="mph"
                  error={errors.designSpeed}
                  tooltip="Speed used for every geometric check, in miles per hour."
                />
                <CompactSelect
                  id="road-type"
                  label="Road Type"
                  value={roadType}
                  onChange={setRoadType}
                  options={ROAD_TYPES.map((r) => ({ value: r.key, label: r.label }))}
                  tooltip="Sets the maximum superelevation rate the alignment should respect."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="grade"
                  label="Grade"
                  value={grade}
                  onChange={setGrade}
                  onEnter={runCalculate}
                  min="-12"
                  max="12"
                  step="0.5"
                  suffix="%"
                  error={errors.grade}
                  hint="Negative for downhill."
                  tooltip="Longitudinal grade of the segment being checked; downhill grades lengthen the braking distance."
                />
                <CompactInput
                  id="lane-width"
                  label="Lane Width"
                  value={laneWidth}
                  onChange={setLaneWidth}
                  onEnter={runCalculate}
                  min="6"
                  max="20"
                  step="0.5"
                  suffix="ft"
                  error={errors.laneWidth}
                  tooltip="Used in the lateral clearance comparison on curves."
                />
              </div>
            </SubSection>

            <SubSection title="Lateral Geometry">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="superelevation"
                  label="Superelevation"
                  value={superelevationRate}
                  onChange={setSuperelevationRate}
                  onEnter={runCalculate}
                  min="0"
                  max="12"
                  step="0.5"
                  suffix="%"
                  error={errors.superelevationRate}
                  tooltip="Rate at which the pavement banks into the curve."
                />
                <CompactInput
                  id="friction"
                  label="Side Friction Factor"
                  value={sideFrictionFactor}
                  onChange={setSideFrictionFactor}
                  onEnter={runCalculate}
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  error={errors.sideFrictionFactor}
                  hint="0.15 new, 0.10 worn."
                  tooltip="Lateral friction the tyres can develop; it appears in both the braking distance and the curve radius."
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
                  <SubSection title="Sight Distance Objects">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="eye-height"
                        label="Driver Eye Height"
                        value={driverEyeHeight}
                        onChange={setDriverEyeHeight}
                        onEnter={runCalculate}
                        min="1"
                        max="10"
                        step="0.1"
                        suffix="ft"
                        hint="3.5 ft is the AASHTO passenger-car value."
                        tooltip="Height of the driver's eye above the pavement."
                      />
                      <CompactInput
                        id="object-height"
                        label="Object Height"
                        value={objectHeight}
                        onChange={setObjectHeight}
                        onEnter={runCalculate}
                        min="0.1"
                        max="10"
                        step="0.1"
                        suffix="ft"
                        hint="2.0 ft for a stopped vehicle."
                        tooltip="Height of the object the driver must see over the crest."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Vertical Alignment">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="grade-change"
                        label="Grade Change (A)"
                        value={gradeChange}
                        onChange={setGradeChange}
                        onEnter={runCalculate}
                        min="0"
                        max="12"
                        step="0.5"
                        suffix="%"
                        tooltip="Algebraic difference between the incoming and outgoing grades at the crest."
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
                        tooltip="Decimal places used for distances and offsets."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Stopping Sight Distance</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.ssd, calcInputs.decimals)} ft` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.prd, 0)} ft perception-reaction plus ${fmt(results.brakingDistance, 0)} ft braking at ${fmt(
                      calcInputs.designSpeed,
                      0,
                    )} mph with a ${fmt(calcInputs.grade, 1)}% grade`
                  : "Fix the highlighted inputs to check the geometry"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Perception-Reaction</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.prd, 0)} ft` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Braking</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.brakingDistance, 0)} ft` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Minimum</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.minimumSsd, 0)} ft` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Design Item</th>
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
                        Enter the design speed and alignment data to see the geometry checks.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Sight distance check</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.ssd, calcInputs.decimals)} ft · ${results.meetsMinimum ? "meets" : "below"} the ${fmt(
                          results.minimumSsd,
                          0,
                        )} ft minimum`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Design speed</span>
                  <span className="text-base font-bold text-foreground">{fmt(calcInputs.designSpeed, 0)} mph</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Road type</span>
                  <span className="text-base font-bold text-foreground">{results.roadTypeLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Stopping sight distance</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.ssd, 0)} ft` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Margin vs minimum</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? `${results.margin >= 0 ? "+" : "−"}${fmt(Math.abs(results.margin), 0)} ft` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Curve radius</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.radius, 0)} ft` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Sightline offset</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.middleOrdinate, 1)} ft` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Crest curve length</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.curveLength, 0)} ft` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Vertical K value</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.kValue, 1) : "—"}</span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Highway Design Speed Calculator?</h2>
            <p>
              A highway design speed calculator turns the design speed, the longitudinal grade and the friction assumptions for a road
              segment into the geometric values a designer has to satisfy: stopping sight distance, the horizontal curve radius the
              superelevation and friction can support, the sightline offset that radius requires and the crest vertical curve length
              needed for the sight distance to exist. It follows the AASHTO Green Book relationships that state highway agencies apply
              when a new alignment is laid out or an existing one is checked for deficiencies.
            </p>
            <p>
              Design speed is the organising value of the whole exercise. Sight distance, curve radius and vertical curve length are all
              derived from it, so choosing a design speed that the alignment cannot actually support is the fastest way to produce a road
              that gets driven faster than its geometry allows.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Stopping sight distance has two parts. The perception-reaction distance is 1.47 times the design speed in mph times the
              2.5 second reaction time AASHTO uses, which at 60 mph is about 220 feet. The braking distance is the design speed squared
              divided by 30 times the sum or difference of the side friction factor and the decimal grade. Adding them gives the distance
              a driver needs to see an unexpected object and stop before reaching it.
            </p>
            <p>
              The grade term makes the two directions of travel unequal, and the difference is large enough that sight distance is always
              checked downhill. At 60 mph with a friction factor of 0.35, a level segment needs about 563 feet, a 6 percent downgrade
              needs about 641 feet and a 6 percent upgrade only about 507 feet. Friction assumptions matter just as much: a wet or polished
              pavement can cut the available friction from 0.35 to 0.25 and add more than a hundred feet to the braking distance.
            </p>
            <p>
              The horizontal geometry follows from the same speed. The radius that balances centrifugal force against superelevation and
              side friction is V² divided by 15 times the sum of the two, and the sightline offset — the middle ordinate — is the depth of
              the obstruction the driver's line of sight cuts through, which is what determines how far back a guardrail, wall or planting
              has to be. The vertical geometry uses the crest curve relationship A times the sight distance squared divided by 2,158 for
              the standard 3.5 foot eye height and 2.0 foot object height, and reports the K value as well, since that is the form in
              which designers normally carry the requirement.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the computed stopping sight distance, with the two components behind it. The three-stat bar puts the
              perception-reaction distance, the braking distance and the tabulated minimum for the nearest standard design speed side by
              side, so the comparison is visible at a glance.
            </p>
            <p>
              The breakdown table lists the inputs used, the two distance components, the minimum for that speed and the margin against
              it, then the split of lateral demand between superelevation and friction, the curve radius, the sightline offset, the crest
              curve length and its K value. The summary panel repeats the headline geometry and prints the verdict line, which says
              whether the sight distance the alignment produces meets the tabulated minimum.
            </p>
            <p>
              Two cautions on use. These are level-ground AASHTO relationships for passenger cars; trucks, buses and conditions such as a
              heavy downgrade need their own checks, since a loaded truck's braking performance is quite different. And a calculator can
              only verify what has been entered — real design has to consider intersection sight distance, decision sight distance,
              passing sight distance on two-lane roads and the interaction between horizontal and vertical alignment, which is where sight
              distance most often disappears in practice.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/highway-design-speed-calculator" />
          <PopularCalculators exclude="/calculator/highway-design-speed-calculator" />
        </div>
      </div>
    </>
  );
}
