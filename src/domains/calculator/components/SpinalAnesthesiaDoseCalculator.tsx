"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type ProcedureKey = "caesarean" | "lowerLimb" | "hip" | "lowerAbdominal" | "perineal";

interface DrugSpec {
  key: string;
  label: string;
  /** Standard presentation: percent strength and the mg/mL it represents. */
  strengthPct: number;
  mgPerMl: number;
  /** Single-shot ceiling for the drug, mg (standard practice references). */
  maxMg: number;
  /** Expected duration band of the block, hours. */
  durationLow: number;
  durationHigh: number;
  ranges: Record<ProcedureKey, [number, number]>;
}

const PROCEDURES: { key: ProcedureKey; label: string }[] = [
  { key: "caesarean", label: "Caesarean delivery" },
  { key: "lowerLimb", label: "Lower limb (knee, ankle)" },
  { key: "hip", label: "Hip surgery / hip fracture" },
  { key: "lowerAbdominal", label: "Lower abdominal / urological" },
  { key: "perineal", label: "Perineal / transurethral" },
];

// Single-shot reference ranges in mg. Figures reflect commonly used adult ranges
// in current anaesthetic practice (0.5% heavy bupivacaine for Caesarean 9-12 mg
// is the classic ED95 band); they are context, not a prescription.
const DRUGS: DrugSpec[] = [
  {
    key: "bupivacaine-heavy",
    label: "Bupivacaine 0.5% hyperbaric",
    strengthPct: 0.5,
    mgPerMl: 5,
    maxMg: 20,
    durationLow: 2,
    durationHigh: 3,
    ranges: {
      caesarean: [9, 12],
      lowerLimb: [6, 10],
      hip: [8, 12],
      lowerAbdominal: [10, 14],
      perineal: [4, 6],
    },
  },
  {
    key: "bupivacaine-plain",
    label: "Bupivacaine 0.5% plain (isobaric)",
    strengthPct: 0.5,
    mgPerMl: 5,
    maxMg: 20,
    durationLow: 2,
    durationHigh: 3.5,
    ranges: {
      caesarean: [10, 15],
      lowerLimb: [8, 12],
      hip: [10, 15],
      lowerAbdominal: [12, 15],
      perineal: [5, 8],
    },
  },
  {
    key: "levobupivacaine-heavy",
    label: "Levobupivacaine 0.5% heavy",
    strengthPct: 0.5,
    mgPerMl: 5,
    maxMg: 20,
    durationLow: 2,
    durationHigh: 3,
    ranges: {
      caesarean: [9, 12],
      lowerLimb: [6, 10],
      hip: [8, 12],
      lowerAbdominal: [10, 14],
      perineal: [4, 6],
    },
  },
  {
    key: "ropivacaine-plain",
    label: "Ropivacaine 0.5% plain",
    strengthPct: 0.5,
    mgPerMl: 5,
    maxMg: 20,
    durationLow: 1.5,
    durationHigh: 3,
    ranges: {
      caesarean: [12, 18],
      lowerLimb: [10, 15],
      hip: [12, 18],
      lowerAbdominal: [15, 20],
      perineal: [6, 10],
    },
  },
  {
    key: "lidocaine-heavy",
    label: "Lidocaine 5% hyperbaric",
    strengthPct: 5,
    mgPerMl: 50,
    maxMg: 100,
    durationLow: 1,
    durationHigh: 1.5,
    ranges: {
      caesarean: [60, 75],
      lowerLimb: [50, 75],
      hip: [60, 100],
      lowerAbdominal: [75, 100],
      perineal: [40, 60],
    },
  },
];

interface SpinalInputs {
  drug: string;
  procedure: ProcedureKey;
  weightKg: number;
  doseMg: number;
  heightCm: number;
  ageYears: number;
  adjustPct: number;
  mgPerMl: number;
  decimals: number;
}

const DEFAULTS: SpinalInputs = {
  drug: "bupivacaine-heavy",
  procedure: "caesarean",
  weightKg: 75,
  doseMg: 10,
  heightCm: 165,
  ageYears: 32,
  adjustPct: 0,
  mgPerMl: 5,
  decimals: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SpinalResult {
  valid: boolean;
  errorMsg: string;
  drug: DrugSpec;
  procedureLabel: string;
  adjustedDose: number;
  volumeMl: number;
  mgPerKg: number;
  mgPerCm: number;
  range: [number, number];
  position: "below" | "within" | "above";
  positionLabel: string;
  positionColor: string;
  pctOfMax: number;
  maxColor: string;
  durationNote: string;
  ageNote: string;
  breakdown: BreakdownRow[];
}

function calculateSpinal(input: SpinalInputs): SpinalResult {
  const drug = DRUGS.find((d) => d.key === input.drug) || DRUGS[0];
  const procedureLabel = (PROCEDURES.find((p) => p.key === input.procedure) || PROCEDURES[0]).label;

  const blank = (errorMsg: string): SpinalResult => ({
    valid: false,
    errorMsg,
    drug,
    procedureLabel,
    adjustedDose: 0,
    volumeMl: 0,
    mgPerKg: 0,
    mgPerCm: 0,
    range: drug.ranges[input.procedure] || [0, 0],
    position: "within",
    positionLabel: "",
    positionColor: "text-muted-foreground",
    pctOfMax: 0,
    maxColor: "text-muted-foreground",
    durationNote: "",
    ageNote: "",
    breakdown: [],
  });

  const nums = [
    input.weightKg,
    input.doseMg,
    input.heightCm,
    input.ageYears,
    input.adjustPct,
    input.mgPerMl,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to size the dose.");
  if (input.weightKg <= 0) return blank("Patient weight must be greater than zero.");
  if (input.doseMg <= 0) return blank("Planned dose must be greater than zero.");
  if (input.heightCm <= 0) return blank("Patient height must be greater than zero.");
  if (input.heightCm > 250) return blank("Patient height should be between 1 cm and 250 cm.");
  if (input.ageYears < 0 || input.ageYears > 120) return blank("Patient age should be between 0 and 120 years.");
  if (input.adjustPct < -50 || input.adjustPct > 50) return blank("Dose adjustment should be between −50% and 50%.");
  if (input.mgPerMl <= 0) return blank("Concentration must be greater than zero mg/mL.");

  const d = Math.max(0, Math.min(4, input.decimals));
  const adjustedDose = input.doseMg * (1 + input.adjustPct / 100);
  if (adjustedDose <= 0) return blank("The adjustment drives the dose to zero or below.");

  const volumeMl = adjustedDose / input.mgPerMl;
  const mgPerKg = adjustedDose / input.weightKg;
  const mgPerCm = adjustedDose / input.heightCm;

  const range = drug.ranges[input.procedure] || [0, 0];
  const position: "below" | "within" | "above" =
    adjustedDose < range[0] ? "below" : adjustedDose > range[1] ? "above" : "within";
  const positionLabel =
    position === "below" ? "Below the usual range" : position === "above" ? "Above the usual range" : "Within the usual range";
  const positionColor =
    position === "within" ? "text-emerald-600" : position === "above" ? "text-red-600" : "text-orange-600";

  const pctOfMax = (adjustedDose / drug.maxMg) * 100;
  const maxColor = pctOfMax > 100 ? "text-red-600" : pctOfMax > 80 ? "text-orange-600" : "text-emerald-600";

  const durationNote = `${fmt(drug.durationLow, 1)}–${fmt(drug.durationHigh, 1)} h at the doses typically used for this block`;
  const ageNote =
    input.ageYears >= 70
      ? "Patients over 70 often need a 20–30% lower dose for the same block height."
      : input.ageYears <= 18
        ? "Paediatric spinal dosing is weight-based and specialist-led; check local protocols."
        : "Adult dosing shown; pregnancy, obesity and a high block target all raise the effective spread.";

  const breakdown: BreakdownRow[] = [
    { label: "Drug", value: drug.label },
    { label: "Procedure", value: procedureLabel },
    { label: "Concentration", value: `${fmt(drug.strengthPct, 2)}% · ${fmt(input.mgPerMl, 1)} mg/mL` },
    { label: "Adjustment applied", value: `${input.adjustPct >= 0 ? "+" : ""}${fmt(input.adjustPct, 0)}%` },
    { label: "Dose to inject", value: `${fmt(adjustedDose, d)} mg`, highlight: true },
    { label: "Volume to draw", value: `${fmt(volumeMl, d)} mL` },
    { label: "Dose per kg body weight", value: `${fmt(mgPerKg, 3)} mg/kg` },
    { label: "Dose per cm of height", value: `${fmt(mgPerCm, 4)} mg/cm` },
    { label: `Typical range · ${procedureLabel}`, value: `${fmt(range[0], 1)}–${fmt(range[1], 1)} mg` },
    { label: "Volume at that range", value: `${fmt(range[0] / input.mgPerMl, 2)}–${fmt(range[1] / input.mgPerMl, 2)} mL` },
    { label: "Position against the range", value: positionLabel, highlight: true },
    { label: "Single-shot ceiling", value: `${fmt(drug.maxMg, 0)} mg · using ${fmt(pctOfMax, 1)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    drug,
    procedureLabel,
    adjustedDose,
    volumeMl,
    mgPerKg,
    mgPerCm,
    range,
    position,
    positionLabel,
    positionColor,
    pctOfMax,
    maxColor,
    durationNote,
    ageNote,
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

export default function SpinalAnesthesiaDoseCalculator() {
  const [drug, setDrug] = useState<string>(DEFAULTS.drug);
  const [procedure, setProcedure] = useState<string>(DEFAULTS.procedure);
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [doseMg, setDoseMg] = useState(String(DEFAULTS.doseMg));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [ageYears, setAgeYears] = useState(String(DEFAULTS.ageYears));
  const [adjustPct, setAdjustPct] = useState(String(DEFAULTS.adjustPct));
  const [mgPerMl, setMgPerMl] = useState(String(DEFAULTS.mgPerMl));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): SpinalInputs => ({
    drug,
    procedure: procedure as ProcedureKey,
    weightKg: parseFloat(weightKg) || 0,
    doseMg: parseFloat(doseMg) || 0,
    heightCm: parseFloat(heightCm) || 0,
    ageYears: parseFloat(ageYears) || 0,
    adjustPct: parseFloat(adjustPct) || 0,
    mgPerMl: parseFloat(mgPerMl) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<SpinalInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SpinalResult>(() => calculateSpinal(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateSpinal(inputs));
  };

  const reset = () => {
    setDrug(DEFAULTS.drug);
    setProcedure(DEFAULTS.procedure);
    setWeightKg(String(DEFAULTS.weightKg));
    setDoseMg(String(DEFAULTS.doseMg));
    setHeightCm(String(DEFAULTS.heightCm));
    setAgeYears(String(DEFAULTS.ageYears));
    setAdjustPct(String(DEFAULTS.adjustPct));
    setMgPerMl(String(DEFAULTS.mgPerMl));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateSpinal(DEFAULTS));
  };

  const weightNum = parseFloat(weightKg);
  const doseNum = parseFloat(doseMg);
  const heightNum = parseFloat(heightCm);
  const ageNum = parseFloat(ageYears);
  const adjustNum = parseFloat(adjustPct);
  const concNum = parseFloat(mgPerMl);

  const errors = {
    weightKg: !Number.isFinite(weightNum) || weightNum <= 0 ? "Must be greater than zero" : "",
    doseMg: !Number.isFinite(doseNum) || doseNum <= 0 ? "Must be greater than zero" : "",
    heightCm: !Number.isFinite(heightNum) || heightNum <= 0 || heightNum > 250 ? "Use 1–250 cm" : "",
    ageYears: !Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120 ? "Use 0–120 years" : "",
    adjustPct: !Number.isFinite(adjustNum) || adjustNum < -50 || adjustNum > 50 ? "Use −50% to 50%" : "",
    mgPerMl: !Number.isFinite(concNum) || concNum <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How is the volume of a spinal dose worked out?",
      answer:
        "Volume is simply the dose in milligrams divided by the concentration in milligrams per millilitre. A 0.5% solution contains 5 mg per mL, so a 10 mg dose of hyperbaric bupivacaine is 2 mL. The calculator shows both figures and also lists the volume that corresponds to the typical range for the chosen operation, which is what most anaesthetists actually draw up.",
    },
    {
      question: "What is a typical single-shot dose for a Caesarean section?",
      answer:
        "With 0.5% hyperbaric bupivacaine the widely used range is 9 to 12 mg, which is 1.8 to 2.4 mL, and it sits near the published ED95 for the procedure. Lower doses with intrathecal opioid are common in enhanced-recovery pathways, and higher doses are reserved for long procedures. The calculator places your planned dose inside or outside that band so the choice is explicit rather than assumed.",
    },
    {
      question: "Do weight and height change the dose?",
      answer:
        "Weight matters, but less than most people expect: intrathecal doses are small and the cerebrospinal fluid volume, not body mass, sets the spread. Published work in anaesthesia shows dose requirements rise with weight and fall with height and age in a fairly predictable way. The calculator reports the dose per kilogram and per centimetre of height so you can see the relationship rather than guess at it.",
    },
    {
      question: "Why reduce the dose in older or pregnant patients?",
      answer:
        "Patients over about seventy need roughly 20 to 30 percent less for the same block height because the spread of local anaesthetic is greater, and pregnancy increases the sensitivity of nerve tissue as well as compressing the epidural space. The adjustment field applies a documented percentage reduction so the printed volume reflects the plan you intend to follow.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Spinal Anesthesia Dose Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Spinal Anesthesia Dose Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Drug & Procedure">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="spinal-drug"
                  label="Local Anesthetic"
                  value={drug}
                  onChange={(v) => {
                    setDrug(v);
                    const spec = DRUGS.find((x) => x.key === v);
                    if (spec) setMgPerMl(String(spec.mgPerMl));
                  }}
                  options={DRUGS.map((x) => ({ value: x.key, label: x.label }))}
                  tooltip="Sets the concentration, ceiling and duration band used below."
                />
                <CompactSelect
                  id="spinal-procedure"
                  label="Procedure"
                  value={procedure}
                  onChange={setProcedure}
                  options={PROCEDURES.map((p) => ({ value: p.key, label: p.label }))}
                  tooltip="Selects the typical single-shot range for comparison."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="spinal-weight"
                  label="Patient Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix="kg"
                  error={errors.weightKg}
                  tooltip="Used for the dose-per-kilogram figure."
                />
                <CompactInput
                  id="spinal-dose"
                  label="Planned Dose"
                  value={doseMg}
                  onChange={setDoseMg}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="mg"
                  error={errors.doseMg}
                  hint="Milligrams, before any adjustment below."
                  tooltip="The dose you intend to inject."
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
                  <SubSection title="Patient Factors">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="spinal-height"
                        label="Patient Height"
                        value={heightCm}
                        onChange={setHeightCm}
                        onEnter={runCalculate}
                        min="1"
                        max="250"
                        step="any"
                        suffix="cm"
                        error={errors.heightCm}
                        tooltip="Dose requirement falls as height rises."
                      />
                      <CompactInput
                        id="spinal-age"
                        label="Patient Age"
                        value={ageYears}
                        onChange={setAgeYears}
                        onEnter={runCalculate}
                        min="0"
                        max="120"
                        step="1"
                        suffix="yr"
                        error={errors.ageYears}
                        tooltip="Used for the age-related dosing note."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Adjustment & Syringe">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="spinal-adjust"
                        label="Dose Adjustment"
                        value={adjustPct}
                        onChange={setAdjustPct}
                        onEnter={runCalculate}
                        min="-50"
                        max="50"
                        step="any"
                        suffix="%"
                        error={errors.adjustPct}
                        tooltip="Use −10% to −25% for the elderly, pregnancy near term or a lower block target."
                      />
                      <CompactInput
                        id="spinal-conc"
                        label="Concentration"
                        value={mgPerMl}
                        onChange={setMgPerMl}
                        onEnter={runCalculate}
                        min="0.1"
                        step="any"
                        suffix="mg/mL"
                        error={errors.mgPerMl}
                        tooltip="Volume is the dose divided by this figure."
                      />
                      <CompactInput
                        id="spinal-decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="4"
                        step="1"
                        tooltip="How many digits to show after the decimal point."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Dose to Inject</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.adjustedDose, calcInputs.decimals)} mg` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Draw ${fmt(results.volumeMl, calcInputs.decimals)} mL of ${fmt(calcInputs.mgPerMl, 1)} mg/mL ${results.drug.label} for ${results.procedureLabel.toLowerCase()}`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Volume</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.volumeMl, 2)} mL` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per kg</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.mgPerKg, 3)} mg` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Vs usual range</span>
                <span className={`font-extrabold ${results.positionColor}`}>
                  {results.valid ? results.positionLabel.replace(" the usual range", "") : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Dose Item</th>
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
                        Enter a dose to see the syringe arithmetic.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Dose · volume</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.adjustedDose, calcInputs.decimals)} mg · ${fmt(results.volumeMl, calcInputs.decimals)} mL`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Drug</span>
                  <span className="text-base font-bold text-foreground">{results.drug.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Procedure</span>
                  <span className="text-base font-bold text-foreground">{results.procedureLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Weight / height</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.weightKg, 0)} kg / ${fmt(calcInputs.heightCm, 0)} cm` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Age</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.ageYears, 0)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dose per cm height</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.mgPerCm, 4)} mg/cm` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Share of ceiling</span>
                  <span className={`text-base font-bold ${results.maxColor}`}>
                    {results.valid ? `${fmt(results.pctOfMax, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Duration band</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.drug.durationLow, 1)}–${fmt(results.drug.durationHigh, 1)} h` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adjustment</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${calcInputs.adjustPct >= 0 ? "+" : ""}${fmt(calcInputs.adjustPct, 0)}%` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <p className="text-[11px] text-muted-foreground mt-3">
                  {results.durationNote}. {results.ageNote} Planning aid only — confirm every dose against your local protocol,
                  the drug label and the patient in front of you.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Spinal Anesthesia Dose Calculator?</h2>
            <p>
              A spinal anesthesia dose calculator converts a planned intrathecal dose into the volume a clinician actually draws
              into the syringe, places that dose against the usual single-shot range for the operation, and reports how close it
              comes to the ceiling for the drug. It also normalises the dose to body weight and height so the figure can be
              compared with published requirements rather than treated in isolation.
            </p>
            <p>
              The arithmetic matters because spinal doses are tiny and the preparations are concentrated. A 0.5% solution holds 5
              mg in every millilitre, so a 2 mL syringe contains 10 mg, and half a millilitre either way moves the dose by 2.5 mg.
              In a neuraxial block that difference can mean the difference between an adequate level and a block that spreads
              higher than intended.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Volume is the dose divided by the concentration in milligrams per millilitre. The drug selector fixes that
              concentration: 0.5% bupivacaine, levobupivacaine and ropivacaine are 5 mg per mL, while 5% hyperbaric lidocaine is
              50 mg per mL, which is why lidocaine volumes look so small for the same milligram figure. Dose per kilogram divides
              the dose by body weight, and dose per centimetre of height divides it by stature, since taller patients need less
              drug for a given block height.
            </p>
            <p>
              Comparison ranges encode the bands that anaesthetists use in practice: 9 to 12 mg of hyperbaric bupivacaine for a
              Caesarean section, 6 to 10 mg for lower limb surgery, 8 to 12 mg for hip procedures and up to 14 mg for lower
              abdominal work. The calculator reports whether the planned dose sits inside that band, above it or below it, and
              separately tracks the percentage of the single-shot ceiling for the drug — 20 mg for the bupivacaine family and 100
              mg for hyperbaric lidocaine.
            </p>
            <p>
              The advanced section adds the patient factors that shift requirements in opposite directions. Dose needs rise with
              weight and fall with height and age, and the adjustment field applies a percentage reduction of the kind used for
              elderly patients, where a 20 to 30 percent lower dose achieves the same block, and for pregnancy near term. Because
              these are clinical judgments rather than formulas, the adjustment is explicit and visible in the output instead of
              being baked into a hidden constant.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the dose to inject after any adjustment, with the volume to draw in the subtext. The
              three-stat bar adds the syringe volume, the dose per kilogram and the position against the usual range for the
              operation, colour-coded so a dose above the band is immediately visible.
            </p>
            <p>
              The breakdown table lists the drug, concentration, adjustment, volume, the normalised figures, the typical range in
              both milligrams and millilitres, and the share of the single-shot ceiling being used. The summary panel reports the
              patient dimensions, the duration band associated with the drug, and a note on how age affects the same dose.
            </p>
            <p>
              Every figure is a planning aid. Baricity, patient position, pregnancy, obesity, spinal deformity and the intended
              block height all change where a given dose ends up, and local protocols frequently differ from the published ranges.
              Confirm the plan against your department's guidance and the drug label, and treat the output as a starting point for
              that conversation rather than a decision on its own.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/spinal-anesthesia-dose-calculator" />
          <PopularCalculators exclude="/calculator/spinal-anesthesia-dose-calculator" />
        </div>
      </div>
    </>
  );
}
