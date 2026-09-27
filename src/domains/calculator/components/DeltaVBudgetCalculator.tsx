"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

const G0 = 9.80665;

interface DeltaVInputs {
  isp1: number;
  propellant1: number;
  burnout1: number;
  isp2: number;
  propellant2: number;
  burnout2: number;
  gravityLoss: number;
  dragLoss: number;
  steeringLoss: number;
  reservePct: number;
  requirement: number;
  decimals: number;
}

const DEFAULTS: DeltaVInputs = {
  isp1: 320,
  propellant1: 1800,
  burnout1: 200,
  isp2: 340,
  propellant2: 600,
  burnout2: 150,
  gravityLoss: 1200,
  dragLoss: 150,
  steeringLoss: 100,
  reservePct: 5,
  requirement: 3000,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface DeltaVResult {
  valid: boolean;
  errorMsg: string;
  massRatio1: number;
  massRatio2: number;
  dv1: number;
  dv2: number;
  grossDv: number;
  totalLosses: number;
  netDv: number;
  reserveDv: number;
  usableDv: number;
  surplus: number;
  requirementPct: number;
  overallMassRatio: number;
  totalPropellant: number;
  burnTimeNote: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateDeltaV(input: DeltaVInputs): DeltaVResult {
  const blank = (errorMsg: string): DeltaVResult => ({
    valid: false,
    errorMsg,
    massRatio1: 0,
    massRatio2: 0,
    dv1: 0,
    dv2: 0,
    grossDv: 0,
    totalLosses: 0,
    netDv: 0,
    reserveDv: 0,
    usableDv: 0,
    surplus: 0,
    requirementPct: 0,
    overallMassRatio: 0,
    totalPropellant: 0,
    burnTimeNote: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.isp1,
    input.propellant1,
    input.burnout1,
    input.isp2,
    input.propellant2,
    input.burnout2,
    input.gravityLoss,
    input.dragLoss,
    input.steeringLoss,
    input.reservePct,
    input.requirement,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to build the budget.");
  if (input.isp1 <= 0 || input.isp2 <= 0) return blank("Specific impulse must be greater than zero for each stage.");
  if (input.burnout1 <= 0 || input.burnout2 <= 0) return blank("Burnout mass must be greater than zero for each stage.");
  if (input.propellant1 < 0 || input.propellant2 < 0) return blank("Propellant mass cannot be negative.");
  if (input.propellant1 === 0 && input.propellant2 === 0) return blank("Enter propellant for at least one stage.");
  if ([input.gravityLoss, input.dragLoss, input.steeringLoss].some((v) => v < 0)) return blank("Loss terms cannot be negative.");
  if (input.reservePct < 0 || input.reservePct > 50) return blank("Reserve margin should be between 0% and 50%.");
  if (input.requirement < 0) return blank("The mission requirement cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));

  // Tsiolkovsky: dv = Isp * g0 * ln(m0 / mf), with m0 = burnout + propellant.
  const m01 = input.burnout1 + input.propellant1;
  const m02 = input.burnout2 + input.propellant2;
  const massRatio1 = m01 / input.burnout1;
  const massRatio2 = m02 / input.burnout2;
  const dv1 = input.isp1 * G0 * Math.log(massRatio1);
  const dv2 = input.isp2 * G0 * Math.log(massRatio2);

  const grossDv = dv1 + dv2;
  const totalLosses = input.gravityLoss + input.dragLoss + input.steeringLoss;
  const netDv = grossDv - totalLosses;
  const reserveDv = grossDv * (input.reservePct / 100);
  const usableDv = netDv - reserveDv;
  const surplus = usableDv - input.requirement;
  const requirementPct = input.requirement > 0 ? (usableDv / input.requirement) * 100 : 0;
  const overallMassRatio = (m01 + m02) / (input.burnout1 + input.burnout2);
  const totalPropellant = input.propellant1 + input.propellant2;

  const burnTimeNote =
    input.isp1 > 0
      ? `Ideal (vacuum) exhaust velocity is ${fmt(input.isp1 * G0, 0)} m/s on stage 1 — real losses shown separately.`
      : "";

  const verdict =
    surplus >= 0
      ? `Budget closes with ${fmt(surplus, d)} m/s of margin above the requirement after losses and reserve`
      : `Short by ${fmt(Math.abs(surplus), d)} m/s — add propellant, raise Isp or reduce the loss terms`;
  const verdictColor = surplus >= 0 ? "text-emerald-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    { label: "Stage 1 lift-off mass", value: `${fmt(m01, 0)} kg` },
    { label: "Stage 1 burnout mass", value: `${fmt(input.burnout1, 0)} kg` },
    { label: "Stage 1 mass ratio", value: `${fmt(massRatio1, 3)} : 1` },
    { label: "Stage 1 ideal Δv", value: `${fmt(dv1, d)} m/s`, highlight: true },
    { label: "Stage 2 lift-off mass", value: `${fmt(m02, 0)} kg` },
    { label: "Stage 2 burnout mass", value: `${fmt(input.burnout2, 0)} kg` },
    { label: "Stage 2 mass ratio", value: `${fmt(massRatio2, 3)} : 1` },
    { label: "Stage 2 ideal Δv", value: `${fmt(dv2, d)} m/s`, highlight: true },
    { label: "Gross Δv capability", value: `${fmt(grossDv, d)} m/s`, highlight: true },
    { label: `Losses — gravity, drag, steering`, value: `−${fmt(totalLosses, d)} m/s` },
    { label: `Reserve margin (${fmt(input.reservePct, 1)}%)`, value: `−${fmt(reserveDv, d)} m/s` },
    { label: "Usable Δv after losses and reserve", value: `${fmt(usableDv, d)} m/s`, highlight: true },
    { label: "Mission requirement", value: `${fmt(input.requirement, d)} m/s` },
    { label: "Margin over requirement", value: `${surplus >= 0 ? "+" : ""}${fmt(surplus, d)} m/s` },
  ];

  return {
    valid: true,
    errorMsg: "",
    massRatio1,
    massRatio2,
    dv1,
    dv2,
    grossDv,
    totalLosses,
    netDv,
    reserveDv,
    usableDv,
    surplus,
    requirementPct,
    overallMassRatio,
    totalPropellant,
    burnTimeNote,
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

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function DeltaVBudgetCalculator() {
  const [isp1, setIsp1] = useState(String(DEFAULTS.isp1));
  const [propellant1, setPropellant1] = useState(String(DEFAULTS.propellant1));
  const [burnout1, setBurnout1] = useState(String(DEFAULTS.burnout1));
  const [isp2, setIsp2] = useState(String(DEFAULTS.isp2));
  const [propellant2, setPropellant2] = useState(String(DEFAULTS.propellant2));
  const [burnout2, setBurnout2] = useState(String(DEFAULTS.burnout2));
  const [gravityLoss, setGravityLoss] = useState(String(DEFAULTS.gravityLoss));
  const [dragLoss, setDragLoss] = useState(String(DEFAULTS.dragLoss));
  const [steeringLoss, setSteeringLoss] = useState(String(DEFAULTS.steeringLoss));
  const [reservePct, setReservePct] = useState(String(DEFAULTS.reservePct));
  const [requirement, setRequirement] = useState(String(DEFAULTS.requirement));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): DeltaVInputs => ({
    isp1: parseFloat(isp1) || 0,
    propellant1: parseFloat(propellant1) || 0,
    burnout1: parseFloat(burnout1) || 0,
    isp2: parseFloat(isp2) || 0,
    propellant2: parseFloat(propellant2) || 0,
    burnout2: parseFloat(burnout2) || 0,
    gravityLoss: parseFloat(gravityLoss) || 0,
    dragLoss: parseFloat(dragLoss) || 0,
    steeringLoss: parseFloat(steeringLoss) || 0,
    reservePct: parseFloat(reservePct) || 0,
    requirement: parseFloat(requirement) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<DeltaVInputs>(() => DEFAULTS);
  const [results, setResults] = useState<DeltaVResult>(() => calculateDeltaV(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateDeltaV(inputs));
  };

  const reset = () => {
    setIsp1(String(DEFAULTS.isp1));
    setPropellant1(String(DEFAULTS.propellant1));
    setBurnout1(String(DEFAULTS.burnout1));
    setIsp2(String(DEFAULTS.isp2));
    setPropellant2(String(DEFAULTS.propellant2));
    setBurnout2(String(DEFAULTS.burnout2));
    setGravityLoss(String(DEFAULTS.gravityLoss));
    setDragLoss(String(DEFAULTS.dragLoss));
    setSteeringLoss(String(DEFAULTS.steeringLoss));
    setReservePct(String(DEFAULTS.reservePct));
    setRequirement(String(DEFAULTS.requirement));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateDeltaV(DEFAULTS));
  };

  const isp1Num = parseFloat(isp1);
  const prop1Num = parseFloat(propellant1);
  const burnout1Num = parseFloat(burnout1);
  const isp2Num = parseFloat(isp2);
  const burn2Num = parseFloat(burnout2);

  const errors = {
    isp1: !Number.isFinite(isp1Num) || isp1Num <= 0 ? "Must be greater than zero" : "",
    propellant1: !Number.isFinite(prop1Num) || prop1Num < 0 ? "Cannot be negative" : "",
    burnout1: !Number.isFinite(burnout1Num) || burnout1Num <= 0 ? "Must be greater than zero" : "",
    isp2: !Number.isFinite(isp2Num) || isp2Num <= 0 ? "Must be greater than zero" : "",
    burnout2: !Number.isFinite(burn2Num) || burn2Num <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is the Tsiolkovsky rocket equation?",
      answer:
        "Delta-v equals specific impulse multiplied by standard gravity multiplied by the natural logarithm of the mass ratio, where the mass ratio is the vehicle's lift-off mass divided by its burnout mass. Because the relationship is logarithmic, most of the propellant in a stage is spent buying the last portion of its velocity, which is the fundamental reason rockets are staged rather than built as one tank.",
    },
    {
      question: "Why are losses subtracted separately?",
      answer:
        "The ideal equation assumes all thrust goes into useful velocity. In practice gravity pulls the vehicle back while it climbs, the atmosphere creates drag, and steering to follow a gravity turn is not perfectly aligned with the velocity vector. Typical figures are 1,000 to 1,500 m/s of gravity loss, 100 to 200 m/s of drag loss and around 100 m/s of steering loss for a small launcher, and they must be paid for out of the same propellant budget.",
    },
    {
      question: "How large should the reserve margin be?",
      answer:
        "Most mission budgets carry 3 to 10 percent above the calculated need for dispersions, engine performance variation, residual propellant for tank settling and contingency. A five percent reserve on a 9,000 m/s capability is roughly 450 m/s, which is easily consumed by a slightly low Isp or an underperforming upper stage, so dropping the reserve to zero is a planning risk rather than an optimisation.",
    },
    {
      question: "What is a realistic specific impulse?",
      answer:
        "Solid boosters run 250 to 270 seconds, kerosene and oxygen around 300 to 340, hydrogen and oxygen 440 to 460 in vacuum, and storable hypergolics around 300 to 320. Electric propulsion sits far higher at 1,500 to 3,000 seconds but with very low thrust, so its delta-v budget is built around long spiral burns rather than the multi-stage figures this calculator models.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Delta-V Budget Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Delta-V Budget Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Stage 1">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="isp-1"
                  label="Specific Impulse"
                  value={isp1}
                  onChange={setIsp1}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="s"
                  error={errors.isp1}
                  hint="Kerosene/LOX ≈ 320 s, hydrogen ≈ 450 s."
                  tooltip="Vacuum specific impulse of the first stage."
                />
                <CompactInput
                  id="propellant-1"
                  label="Propellant Mass"
                  value={propellant1}
                  onChange={setPropellant1}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  suffix="kg"
                  error={errors.propellant1}
                  tooltip="Usable propellant loaded in stage 1."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="burnout-1"
                  label="Burnout Mass"
                  value={burnout1}
                  onChange={setBurnout1}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="kg"
                  error={errors.burnout1}
                  hint="Dry mass plus payload and upper stages."
                  tooltip="Mass remaining when stage 1 stops burning."
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
                  <SubSection title="Upper Stage">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="isp-2"
                        label="Stage 2 Isp"
                        value={isp2}
                        onChange={setIsp2}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="s"
                        error={errors.isp2}
                        tooltip="Vacuum specific impulse of the upper stage."
                      />
                      <CompactInput
                        id="propellant-2"
                        label="Stage 2 Propellant"
                        value={propellant2}
                        onChange={setPropellant2}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="kg"
                        tooltip="Usable propellant in the upper stage."
                      />
                      <CompactInput
                        id="burnout-2"
                        label="Stage 2 Burnout"
                        value={burnout2}
                        onChange={setBurnout2}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="kg"
                        error={errors.burnout2}
                        tooltip="Mass remaining when stage 2 stops burning."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Losses, Reserve & Requirement">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="gravity-loss"
                        label="Gravity Loss"
                        value={gravityLoss}
                        onChange={setGravityLoss}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="m/s"
                        tooltip="1,000–1,500 m/s is typical for a small launcher."
                      />
                      <CompactInput
                        id="drag-loss"
                        label="Drag Loss"
                        value={dragLoss}
                        onChange={setDragLoss}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="m/s"
                        tooltip="Atmospheric drag cost, 100–200 m/s is typical."
                      />
                      <CompactInput
                        id="steering-loss"
                        label="Steering Loss"
                        value={steeringLoss}
                        onChange={setSteeringLoss}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="m/s"
                        tooltip="Thrust misalignment and gravity-turn steering cost."
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <CompactInput
                        id="reserve"
                        label="Reserve Margin"
                        value={reservePct}
                        onChange={setReservePct}
                        onEnter={runCalculate}
                        min="0"
                        max="50"
                        step="any"
                        suffix="%"
                        tooltip="Contingency held back from the gross capability."
                      />
                      <CompactInput
                        id="requirement"
                        label="Mission Δv"
                        value={requirement}
                        onChange={setRequirement}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="m/s"
                        hint="Low Earth orbit ≈ 9,400 m/s from the ground."
                        tooltip="Delta-v the mission requires."
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
                        tooltip="Decimal places used for velocity figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Usable Δv</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.usableDv, calcInputs.decimals)} m/s` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.grossDv, 0)} m/s ideal across two stages, less ${fmt(results.totalLosses, 0)} m/s of losses and a ${fmt(calcInputs.reservePct, 1)}% reserve`
                  : "Fix the highlighted inputs to build the budget"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stage 1 Δv</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.dv1, 0)} m/s` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stage 2 Δv</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.dv2, 0)} m/s` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Margin</span>
                <span className={`font-extrabold ${results.verdictColor}`}>
                  {results.valid ? `${fmt(results.surplus, 0)} m/s` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Budget Line</th>
                    <th className="p-2.5 pr-3 text-right w-[170px]">Value</th>
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
                        Enter the stage masses and impulse to see the budget.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Usable Δv</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{fmt(results.usableDv, calcInputs.decimals)} m/s</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total propellant</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.totalPropellant, 0)} kg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Overall mass ratio</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.overallMassRatio, 2)} : 1` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Gross capability</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.grossDv, 0)} m/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total losses</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.totalLosses, 0)} m/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Reserve held</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.reserveDv, 0)} m/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Requirement met</span>
                  <span className={`text-base font-bold ${results.verdictColor}`}>
                    {results.valid ? `${fmt(results.requirementPct, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mission requirement</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.requirement, 0)} m/s` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Propellant fraction</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${fmt((results.totalPropellant / (results.totalPropellant + calcInputs.burnout1 + calcInputs.burnout2)) * 100, 1)}%`
                      : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  {results.verdict}. {results.burnTimeNote} Standard gravity is taken as 9.80665 m/s².
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Delta-V Budget Calculator?</h2>
            <p>
              A delta-v budget calculator adds up every velocity increment a mission must pay for and compares the total with what
              the vehicle can actually deliver. It applies the rocket equation stage by stage, subtracts the gravity, drag and
              steering losses that consume velocity without raising the orbit, holds back a contingency reserve, and reports the
              margin left against the mission requirement.
            </p>
            <p>
              Delta-v is the currency of spaceflight: orbits, transfers and landing burns are all priced in metres per second rather
              than in fuel. Building the budget honestly is what separates a launcher with margin from one that flies with a reserve
              so thin that a slightly underperforming engine turns a nominal mission into a partial failure.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each stage is evaluated with the Tsiolkovsky equation: delta-v equals specific impulse multiplied by standard gravity of
              9.80665 m/s² multiplied by the natural logarithm of the mass ratio. The mass ratio is the stage's lift-off mass divided
              by its burnout mass, and it is the logarithmic term that makes propellant so expensive — going from a mass ratio of five
              to ten buys roughly seventy percent more velocity, not one hundred, and the tank structure needed to hold that propellant
              eats into the gain.
            </p>
            <p>
              Losses are charged separately because the ideal equation assumes every metre per second of thrust becomes useful
              velocity. Gravity loss is the dominant term for a launcher leaving the ground, typically 1,000 to 1,500 m/s, drag costs
              100 to 200 m/s through the lower atmosphere, and steering loss from flying a gravity turn rather than straight up adds
              around 100 m/s. Only what survives those deductions is available for the mission itself.
            </p>
            <p>
              The reserve margin is then withheld from the remaining capability, usually three to ten percent, covering engine
              performance dispersion, residual propellant needed to settle tanks before a restart and contingency for the unexpected.
              The result is compared against the stated requirement — roughly 9,400 m/s from the ground to low Earth orbit, about
              3,900 m/s for a trans-lunar injection, and around 2,100 m/s for a Mars transfer — so the shortfall or surplus is visible
              before hardware is built.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the usable delta-v after losses and reserve, with the gross capability and the deductions in the
              subtext. The three-stat bar shows each stage's ideal contribution and the margin against the requirement, colour-coded so
              a shortfall is obvious at a glance.
            </p>
            <p>
              The breakdown table walks through both stages: masses, mass ratios, ideal delta-v, the combined gross capability, the
              three loss terms, the reserve and the final usable figure followed by the mission requirement and the margin. The summary
              panel reports total propellant, overall mass ratio, propellant fraction and the percentage of the requirement that the
              budget covers.
            </p>
            <p>
              Treat the numbers as a design budget rather than a flight prediction. Real vehicles lose performance to combustion
              efficiency below the quoted vacuum Isp, mixture ratio drift, ullage and chill-down, and atmospheric losses vary with
              trajectory shaping. The value of the exercise is in seeing which term dominates — usually gravity loss on the first stage
              and mass ratio everywhere — and in carrying enough reserve that the mission survives the difference between the
              spreadsheet and the flight.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/delta-v-budget-calculator" />
          <PopularCalculators exclude="/calculator/delta-v-budget-calculator" />
        </div>
      </div>
    </>
  );
}
