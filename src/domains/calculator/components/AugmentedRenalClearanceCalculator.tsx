"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ArcInputs {
  age: number;
  sex: string;
  weightKg: number;
  heightCm: number;
  serumCreatinine: number;
  creatinineUnit: string;
  useMeasured: string;
  urineVolumeMl: number;
  urineCollectionHours: number;
  urineCreatinine: number;
  sofaScore: number;
  traumaAdmission: string;
  decimals: number;
}

// ARC is conventionally defined as creatinine clearance at or above
// 130 mL/min/1.73 m² sustained over at least 24 hours.
const ARC_THRESHOLD = 130;
const UMOL_TO_MGDL = 1 / 88.4;

const DEFAULTS: ArcInputs = {
  age: 32,
  sex: "male",
  weightKg: 78,
  heightCm: 178,
  serumCreatinine: 0.62,
  creatinineUnit: "mgdl",
  useMeasured: "no",
  urineVolumeMl: 2400,
  urineCollectionHours: 24,
  urineCreatinine: 95,
  sofaScore: 3,
  traumaAdmission: "yes",
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ArcResult {
  valid: boolean;
  errorMsg: string;
  bsa: number;
  idealBodyWeight: number;
  adjustedBodyWeight: number;
  dosingWeight: number;
  creatinineMgDl: number;
  cockcroftGault: number;
  measuredCrCl: number;
  reportedCrCl: number;
  normalisedCrCl: number;
  hasArc: boolean;
  arcCategory: string;
  arcColor: string;
  arcticScore: number;
  arcticRiskBand: string;
  referenceRows: { name: string; value: number }[];
  vancomycinNote: string;
  betaLactamNote: string;
  monitoringNote: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateArc(i: ArcInputs): ArcResult {
  const blank = (errorMsg: string): ArcResult => ({
    valid: false,
    errorMsg,
    bsa: 0,
    idealBodyWeight: 0,
    adjustedBodyWeight: 0,
    dosingWeight: 0,
    creatinineMgDl: 0,
    cockcroftGault: 0,
    measuredCrCl: 0,
    reportedCrCl: 0,
    normalisedCrCl: 0,
    hasArc: false,
    arcCategory: "",
    arcColor: "text-muted-foreground",
    arcticScore: 0,
    arcticRiskBand: "",
    referenceRows: [],
    vancomycinNote: "",
    betaLactamNote: "",
    monitoringNote: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    i.age,
    i.weightKg,
    i.heightCm,
    i.serumCreatinine,
    i.urineVolumeMl,
    i.urineCollectionHours,
    i.urineCreatinine,
    i.sofaScore,
    i.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to estimate the clearance.");
  if (i.age < 1 || i.age > 120) return blank("Age should be between 1 and 120 years.");
  if (i.weightKg <= 0 || i.weightKg > 400) return blank("Weight should be above 0 and no more than 400 kg.");
  if (i.heightCm <= 0 || i.heightCm > 260) return blank("Height should be above 0 and no more than 260 cm.");
  if (i.serumCreatinine <= 0) return blank("Serum creatinine must be greater than zero.");
  if (i.sofaScore < 0 || i.sofaScore > 24) return blank("The SOFA score should be between 0 and 24.");
  if (i.useMeasured === "yes") {
    if (i.urineVolumeMl <= 0) return blank("Urine volume must be greater than zero for a measured clearance.");
    if (i.urineCollectionHours <= 0 || i.urineCollectionHours > 48) return blank("Collection time should be between 1 and 48 hours.");
    if (i.urineCreatinine <= 0) return blank("Urine creatinine must be greater than zero for a measured clearance.");
  }

  const d = Math.max(0, Math.min(2, i.decimals));
  const age = Math.max(1, i.age);
  const weight = Math.max(1, i.weightKg);
  const height = Math.max(1, i.heightCm);

  const creatinineMgDl = i.creatinineUnit === "umol" ? Math.max(0.01, i.serumCreatinine) * UMOL_TO_MGDL : i.serumCreatinine;

  // Du Bois body surface area.
  const bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);

  // Devine ideal body weight.
  const heightInches = height / 2.54;
  const inchesOver60 = Math.max(0, heightInches - 60);
  const idealBodyWeight = (i.sex === "male" ? 50 : 45.5) + 2.3 * inchesOver60;
  const adjustedBodyWeight = idealBodyWeight + 0.4 * (weight - idealBodyWeight);

  // Cockcroft-Gault dosing weight convention: actual weight when below ideal,
  // ideal weight when normal, adjusted body weight when 30% or more above ideal.
  let dosingWeight: number;
  if (weight < idealBodyWeight) {
    dosingWeight = weight;
  } else if (weight >= idealBodyWeight * 1.3) {
    dosingWeight = adjustedBodyWeight;
  } else {
    dosingWeight = idealBodyWeight;
  }

  // Cockcroft-Gault: ((140 − age) × weight) / (72 × SCr), × 0.85 for females.
  const cgRaw = ((140 - age) * dosingWeight) / (72 * creatinineMgDl);
  const cockcroftGault = i.sex === "female" ? cgRaw * 0.85 : cgRaw;

  // Measured clearance from a timed urine collection:
  // CrCl = (urine creatinine × urine volume) / (serum creatinine × time in minutes).
  const collectionMinutes = Math.max(1, i.urineCollectionHours) * 60;
  const measuredCrCl = (Math.max(0, i.urineCreatinine) * Math.max(0, i.urineVolumeMl)) / (creatinineMgDl * collectionMinutes);

  const reportedCrCl = i.useMeasured === "yes" ? measuredCrCl : cockcroftGault;
  const normalisedCrCl = bsa > 0 ? (reportedCrCl * 1.73) / bsa : reportedCrCl;

  const hasArc = normalisedCrCl >= ARC_THRESHOLD;

  let arcCategory: string;
  let arcColor: string;
  if (normalisedCrCl >= 200) {
    arcCategory = "Extreme augmented renal clearance";
    arcColor = "text-red-600";
  } else if (normalisedCrCl >= 160) {
    arcCategory = "Marked augmented renal clearance";
    arcColor = "text-red-600";
  } else if (normalisedCrCl >= ARC_THRESHOLD) {
    arcCategory = "Augmented renal clearance";
    arcColor = "text-orange-600";
  } else if (normalisedCrCl >= 90) {
    arcCategory = "Normal clearance";
    arcColor = "text-emerald-600";
  } else if (normalisedCrCl >= 60) {
    arcCategory = "Mildly reduced clearance";
    arcColor = "text-orange-600";
  } else {
    arcCategory = "Reduced clearance — dose reduction likely";
    arcColor = "text-red-600";
  }

  // ARCTIC score: age under 50 scores 6, age 50–59 scores 3, male sex scores 4,
  // SOFA of 4 or more scores 1 and the trauma admission scores 0 or 1. A total of
  // 6 or more is the published screening cut-off.
  let arcticScore = 0;
  if (age < 50) arcticScore += 6;
  else if (age < 60) arcticScore += 3;
  if (i.sex === "male") arcticScore += 4;
  if (Math.max(0, i.sofaScore) >= 4) arcticScore += 1;
  if (i.traumaAdmission === "yes") arcticScore += 0;

  const arcticRiskBand =
    arcticScore >= 10
      ? "High — around 70 to 80% of similar patients"
      : arcticScore >= 6
        ? "Elevated — around 50 to 60%, screening cut-off met"
        : arcticScore >= 4
          ? "Intermediate — around 25 to 35%"
          : "Low — under 15%";

  const referenceRows = [
    { name: "This patient", value: Math.round(normalisedCrCl) },
    { name: "ARC threshold", value: ARC_THRESHOLD },
    { name: "Healthy adult reference", value: 100 },
    { name: "CKD stage 3a", value: 52 },
    { name: "CKD stage 4", value: 22 },
  ];

  const vancomycinNote = hasArc
    ? "Standard weight-based dosing will probably underexpose this patient — consider a higher total daily dose with AUC-guided monitoring."
    : "Standard weight-based dosing with routine AUC or trough monitoring.";
  const betaLactamNote = hasArc
    ? "Consider extended or continuous infusion to keep the concentration above the MIC between doses."
    : "Intermittent dosing is generally adequate at this clearance.";
  const monitoringNote = hasArc
    ? "Re-measure clearance every 24 to 48 hours; ARC often resolves as the acute phase settles."
    : "Routine renal monitoring per unit protocol.";

  const verdict = hasArc
    ? `Normalised clearance of ${fmt(normalisedCrCl, d)} mL/min/1.73 m² meets the ${ARC_THRESHOLD} threshold, so renally cleared drugs are being eliminated faster than standard dosing assumes`
    : `Normalised clearance of ${fmt(normalisedCrCl, d)} mL/min/1.73 m² sits below the ${ARC_THRESHOLD} threshold, so standard dosing assumptions hold`;
  const verdictColor = hasArc ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    {
      label: `Serum creatinine ${fmt(creatinineMgDl, 2)} mg/dL`,
      value: `${fmt(creatinineMgDl * 88.4, 1)} µmol/L`,
    },
    { label: "Body surface area (Du Bois)", value: `${fmt(bsa, 2)} m²` },
    { label: "Ideal body weight (Devine)", value: `${fmt(idealBodyWeight, 1)} kg` },
    { label: "Adjusted body weight at 40% of the excess", value: `${fmt(adjustedBodyWeight, 1)} kg` },
    { label: "Dosing weight used for Cockcroft-Gault", value: `${fmt(dosingWeight, 1)} kg`, highlight: true },
    { label: "Cockcroft-Gault creatinine clearance", value: `${fmt(cockcroftGault, 1)} mL/min` },
    { label: `Measured clearance over ${fmt(i.urineCollectionHours, 0)} h`, value: `${fmt(measuredCrCl, 1)} mL/min` },
    {
      label: i.useMeasured === "yes" ? "Clearance used in the assessment" : "Clearance used — estimated, not measured",
      value: `${fmt(reportedCrCl, 1)} mL/min`,
    },
    { label: "Normalised to 1.73 m² of body surface area", value: `${fmt(normalisedCrCl, d)} mL/min/1.73 m²`, highlight: true },
    { label: "ARC threshold", value: `${fmt(ARC_THRESHOLD, 0)} mL/min/1.73 m²` },
    { label: "Augmented renal clearance present", value: hasArc ? "yes" : "no", highlight: true },
    { label: "Clearance category", value: arcCategory, highlight: true },
    { label: "ARCTIC score", value: `${fmt(arcticScore, 0)} of 11` },
    { label: "ARCTIC risk band", value: arcticRiskBand },
    ...referenceRows.map((r) => ({ label: `Reference clearance · ${r.name}`, value: `${fmt(r.value, 0)} mL/min/1.73 m²` })),
    { label: "Vancomycin implication", value: vancomycinNote },
    { label: "Beta-lactam implication", value: betaLactamNote },
    { label: "Monitoring", value: monitoringNote },
  ];

  return {
    valid: true,
    errorMsg: "",
    bsa,
    idealBodyWeight,
    adjustedBodyWeight,
    dosingWeight,
    creatinineMgDl,
    cockcroftGault,
    measuredCrCl,
    reportedCrCl,
    normalisedCrCl,
    hasArc,
    arcCategory,
    arcColor,
    arcticScore,
    arcticRiskBand,
    referenceRows,
    vancomycinNote,
    betaLactamNote,
    monitoringNote,
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

export default function AugmentedRenalClearanceCalculator() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [sex, setSex] = useState<string>(DEFAULTS.sex);
  const [weightKg, setWeightKg] = useState(String(DEFAULTS.weightKg));
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [serumCreatinine, setSerumCreatinine] = useState(String(DEFAULTS.serumCreatinine));
  const [creatinineUnit, setCreatinineUnit] = useState<string>(DEFAULTS.creatinineUnit);
  const [useMeasured, setUseMeasured] = useState<string>(DEFAULTS.useMeasured);
  const [urineVolumeMl, setUrineVolumeMl] = useState(String(DEFAULTS.urineVolumeMl));
  const [urineCollectionHours, setUrineCollectionHours] = useState(String(DEFAULTS.urineCollectionHours));
  const [urineCreatinine, setUrineCreatinine] = useState(String(DEFAULTS.urineCreatinine));
  const [sofaScore, setSofaScore] = useState(String(DEFAULTS.sofaScore));
  const [traumaAdmission, setTraumaAdmission] = useState<string>(DEFAULTS.traumaAdmission);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ArcInputs => ({
    age: parseFloat(age) || 0,
    sex,
    weightKg: parseFloat(weightKg) || 0,
    heightCm: parseFloat(heightCm) || 0,
    serumCreatinine: parseFloat(serumCreatinine) || 0,
    creatinineUnit,
    useMeasured,
    urineVolumeMl: parseFloat(urineVolumeMl) || 0,
    urineCollectionHours: parseFloat(urineCollectionHours) || 0,
    urineCreatinine: parseFloat(urineCreatinine) || 0,
    sofaScore: parseFloat(sofaScore) || 0,
    traumaAdmission,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ArcInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ArcResult>(() => calculateArc(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateArc(inputs));
  };

  const reset = () => {
    setAge(String(DEFAULTS.age));
    setSex(DEFAULTS.sex);
    setWeightKg(String(DEFAULTS.weightKg));
    setHeightCm(String(DEFAULTS.heightCm));
    setSerumCreatinine(String(DEFAULTS.serumCreatinine));
    setCreatinineUnit(DEFAULTS.creatinineUnit);
    setUseMeasured(DEFAULTS.useMeasured);
    setUrineVolumeMl(String(DEFAULTS.urineVolumeMl));
    setUrineCollectionHours(String(DEFAULTS.urineCollectionHours));
    setUrineCreatinine(String(DEFAULTS.urineCreatinine));
    setSofaScore(String(DEFAULTS.sofaScore));
    setTraumaAdmission(DEFAULTS.traumaAdmission);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateArc(DEFAULTS));
  };

  const ageNum = parseFloat(age);
  const weightNum = parseFloat(weightKg);
  const heightNum = parseFloat(heightCm);
  const scrNum = parseFloat(serumCreatinine);

  const errors = {
    age: !Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120 ? "Use 1–120 years" : "",
    weightKg: !Number.isFinite(weightNum) || weightNum <= 0 || weightNum > 400 ? "Use 1–400 kg" : "",
    heightCm: !Number.isFinite(heightNum) || heightNum <= 0 || heightNum > 260 ? "Use 1–260 cm" : "",
    serumCreatinine: !Number.isFinite(scrNum) || scrNum <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is augmented renal clearance?",
      answer:
        "Augmented renal clearance is a state in which the kidneys remove renally eliminated drugs faster than normal, conventionally defined as a creatinine clearance at or above 130 mL/min per 1.73 m² sustained for at least 24 hours. It is common in younger critically ill patients — particularly after trauma, sepsis, burns or major surgery — and it means that standard weight-based doses of antibiotics, antifungals and low-molecular-weight heparins can be cleared before they have done their work.",
    },
    {
      question: "Why is clearance normalised to body surface area?",
      answer:
        "Because raw creatinine clearance scales with body size, so a large young man can exceed the threshold purely because he is large. Dividing by body surface area and multiplying by the standard 1.73 m² removes that effect, which is why the definition of ARC is expressed per 1.73 m². The calculator also reports the unnormalised Cockcroft-Gault figure, because that is the number most dosing references print, and the two are not interchangeable when the patient is far from average size.",
    },
    {
      question: "Why do the estimating equations struggle here?",
      answer:
        "Creatinine is a marker of muscle mass as much as of kidney function, and the Cockcroft-Gault and MDRD equations were derived in stable outpatients rather than in acute illness. In a young trauma patient with low muscle mass, inflammation and fluid shifts, a serum creatinine that looks normal can hide a clearance well above 130 mL/min. That is why a timed urine collection — creatinine clearance measured directly over a known interval — is the reference method, and why clinicians often rely on the ARCTIC score, a combination of age, sex, SOFA and trauma status, to decide whom to screen.",
    },
    {
      question: "How does augmented renal clearance change drug dosing?",
      answer:
        "It changes both the dose and the way the drug is given. For vancomycin, conventional weight-based dosing typically underexposes these patients, so many units start with a higher total daily dose and monitor the AUC closely rather than chasing a trough. For beta-lactams, whose killing depends on the time the free concentration stays above the MIC, extended or continuous infusion is a common answer because raising the dose alone is limited by toxicity. The state is usually temporary, which is why clearance is re-measured every day or two and the dose revised down as the acute phase resolves.",
    },
    {
      question: "Does a high clearance mean the kidneys are healthy?",
      answer:
        "Not necessarily. A clearance of 180 mL/min in a young trauma patient reflects hyperdynamic physiology — increased cardiac output, vasodilation and glomerular hyperfiltration driven by the inflammatory response — rather than better kidney function, and it can precede a decline if the patient deteriorates. In the longer term, persistent glomerular hyperfiltration is also seen in early diabetic nephropathy and in pregnancy, where it is physiological. The number describes how fast the kidneys are clearing solute at this moment, not how well they will do it next week.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Augmented Renal Clearance Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Augmented Renal Clearance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Patient">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="age"
                  label="Age"
                  value={age}
                  onChange={setAge}
                  onEnter={runCalculate}
                  min="1"
                  max="120"
                  step="1"
                  suffix="years"
                  error={errors.age}
                  tooltip="Age drives both Cockcroft-Gault and the ARCTIC score."
                />
                <CompactSelect
                  id="sex"
                  label="Sex"
                  value={sex}
                  onChange={setSex}
                  options={[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                  ]}
                  tooltip="Adjusts Cockcroft-Gault by 15% for women and scores 4 points in ARCTIC for men."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="weight"
                  label="Weight"
                  value={weightKg}
                  onChange={setWeightKg}
                  onEnter={runCalculate}
                  min="1"
                  max="400"
                  step="any"
                  suffix="kg"
                  error={errors.weightKg}
                  tooltip="Used for body surface area and to choose the Cockcroft-Gault dosing weight."
                />
                <CompactInput
                  id="height"
                  label="Height"
                  value={heightCm}
                  onChange={setHeightCm}
                  onEnter={runCalculate}
                  min="1"
                  max="260"
                  step="any"
                  suffix="cm"
                  error={errors.heightCm}
                  tooltip="Needed for Du Bois body surface area and ideal body weight."
                />
              </div>
            </SubSection>

            <SubSection title="Serum Creatinine">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="scr"
                  label="Serum Creatinine"
                  value={serumCreatinine}
                  onChange={setSerumCreatinine}
                  onEnter={runCalculate}
                  min="0.01"
                  step="any"
                  error={errors.serumCreatinine}
                  tooltip="Serum creatinine in the unit selected next to it."
                />
                <CompactSelect
                  id="unit"
                  label="Creatinine Unit"
                  value={creatinineUnit}
                  onChange={setCreatinineUnit}
                  options={[
                    { value: "mgdl", label: "mg/dL" },
                    { value: "umol", label: "µmol/L" },
                  ]}
                  tooltip="The conversion is a factor of 88.4 between the two units."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="use-measured"
                  label="Clearance Source"
                  value={useMeasured}
                  onChange={setUseMeasured}
                  options={[
                    { value: "no", label: "Cockcroft-Gault estimate" },
                    { value: "yes", label: "Measured urine collection" },
                  ]}
                  tooltip="Choose the timed collection when one is available; it is the reference method."
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
                  tooltip="Decimal places used for the clearance figures."
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
                  <SubSection title="Timed Urine Collection">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="urine-volume"
                        label="Urine Volume"
                        value={urineVolumeMl}
                        onChange={setUrineVolumeMl}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="mL"
                        tooltip="Total volume collected over the timed interval."
                      />
                      <CompactInput
                        id="collection-hours"
                        label="Collection Time"
                        value={urineCollectionHours}
                        onChange={setUrineCollectionHours}
                        onEnter={runCalculate}
                        min="1"
                        max="48"
                        step="any"
                        suffix="hours"
                        tooltip="Length of the collection; 24 hours is the conventional interval for ARC."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="urine-creatinine"
                        label="Urine Creatinine"
                        value={urineCreatinine}
                        onChange={setUrineCreatinine}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="mg/dL"
                        tooltip="Urine creatinine concentration from the same collection."
                      />
                      <CompactInput
                        id="sofa"
                        label="SOFA Score"
                        value={sofaScore}
                        onChange={setSofaScore}
                        onEnter={runCalculate}
                        min="0"
                        max="24"
                        step="1"
                        tooltip="A score of 4 or more adds a point to the ARCTIC screen."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactSelect
                        id="trauma"
                        label="Admission Type"
                        value={traumaAdmission}
                        onChange={setTraumaAdmission}
                        options={[
                          { value: "yes", label: "Trauma or surgical admission" },
                          { value: "no", label: "Medical admission" },
                        ]}
                        tooltip="Recorded for context; the ARCTIC cut-off used here does not add points for it."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          ARCTIC: age under 50 scores 6, under 60 scores 3, male sex 4, SOFA 4 or more 1 — six or more meets the screening
                          cut-off.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Normalised Creatinine Clearance</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.normalisedCrCl, calcInputs.decimals)} mL/min` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Per 1.73 m² — ${results.arcCategory.toLowerCase()} against the ${ARC_THRESHOLD} mL/min ARC threshold`
                  : "Fix the highlighted inputs to estimate the clearance"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cockcroft-Gault</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.cockcroftGault, 1)}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Measured</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.measuredCrCl, 1)}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">ARCTIC Score</span>
                <span className={`font-extrabold ${results.valid ? results.arcColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.arcticScore, 0)} / 11` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Clearance Item</th>
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
                        Enter the patient data to assess the clearance.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">ARC assessment</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.normalisedCrCl, calcInputs.decimals)} mL/min/1.73 m² · ${results.hasArc ? "ARC present" : "no ARC"}`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Body surface area</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.bsa, 2)} m²` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dosing weight</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.dosingWeight, 1)} kg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cockcroft-Gault</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.cockcroftGault, 1)} mL/min` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Normalised clearance</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.normalisedCrCl, 1)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ARC present</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? (results.hasArc ? "yes" : "no") : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Category</span>
                  <span className={`text-base font-bold ${results.valid ? results.arcColor : "text-muted-foreground"}`}>
                    {results.valid ? results.arcCategory : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ARCTIC score</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.arcticScore, 0)} of 11` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ARCTIC band</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? results.arcticRiskBand.split(" —")[0] : "—"}</span>
                </div>
              </div>
              {results.valid && (
                <>
                  <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    <span className="font-bold text-foreground">Vancomycin:</span> {results.vancomycinNote}{" "}
                    <span className="font-bold text-foreground">Beta-lactams:</span> {results.betaLactamNote}{" "}
                    <span className="font-bold text-foreground">Monitoring:</span> {results.monitoringNote}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Augmented Renal Clearance Calculator?</h2>
            <p>
              An augmented renal clearance calculator takes the usual demographic and creatinine inputs, estimates creatinine clearance,
              normalises it to body surface area, and reports whether the patient is clearing renally eliminated drugs faster than normal.
              The conventional threshold is 130 mL/min per 1.73 m² sustained for at least 24 hours; anything above that means a standard
              weight-based dose of a renally cleared antibiotic may be gone before it can work.
            </p>
            <p>
              The state is common in exactly the patients least able to afford a treatment failure: young people in intensive care after
              trauma, major surgery, burns or sepsis, whose cardiac output and glomerular filtration are running high because of the
              inflammatory response rather than because their kidneys are unusually healthy.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The estimate starts with the Cockcroft-Gault equation: 140 minus age, multiplied by weight, divided by 72 times serum
              creatinine, with a 15 percent reduction for women. The weight is chosen deliberately, following the usual dosing convention —
              actual weight for a patient below ideal body weight, ideal body weight for a normal build, and adjusted body weight at 40
              percent of the excess when the patient is 30 percent or more above ideal — because creatinine production scales with lean
              mass rather than with total mass.
            </p>
            <p>
              Where a timed urine collection exists, the calculator prefers it, because creatinine clearance measured directly as urine
              creatinine times urine volume divided by serum creatinine times collection time is the reference method, and the estimating
              equations are least reliable in exactly the population that develops ARC. Either figure is then normalised by the Du Bois
              body surface area and multiplied by 1.73 m², which is what makes the comparison across body sizes meaningful.
            </p>
            <p>
              Because the creatinine estimate alone is insensitive in acute illness, the calculator also reports the ARCTIC score — a
              screening tool built from routinely available admission data. Age under 50 scores 6, age 50 to 59 scores 3, male sex scores 4
              and a SOFA score of 4 or more adds 1, for a maximum of 11; six or more is the published cut-off at which formal measurement
              of clearance is worth arranging.
            </p>
            <p>
              The drug implications follow directly from the number. Vancomycin is cleared renally and the conventional dose commonly
              underexposes these patients, so units start higher and monitor the AUC rather than a trough. Beta-lactams are
              time-dependent, so extending or continuing the infusion keeps the free concentration above the MIC for longer than raising
              the dose alone can. Neither option is safe without monitoring, and neither stays appropriate for long — augmented clearance
              typically resolves as the acute phase settles, so the dose has to come down again.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the normalised clearance per 1.73 m², with the category against the ARC threshold underneath. The
              three-stat bar puts the Cockcroft-Gault estimate, the measured clearance if one was entered, and the ARCTIC score side by
              side, which is the quickest way to see whether the two clearance methods disagree.
            </p>
            <p>
              The breakdown table lists the unit conversions, body surface area, both body-weight conventions and the dosing weight chosen,
              the two clearance estimates, the normalised figure, the threshold and category, and the ARCTIC components, followed by
              reference clearances for comparison — a healthy adult, the ARC threshold, and CKD stages 3a and 4 — and the antimicrobial and
              monitoring implications. The summary panel repeats the headline figures and prints the verdict line.
            </p>
            <p>
              Treat the output as a screening conclusion rather than a dosing instruction. Creatinine-based estimates lose accuracy in
              acute illness, in low muscle mass, in liver disease and in the presence of drugs that block tubular secretion. Even a timed
              collection can be mis-collected, so the appropriate next step when ARC is suspected is a conversation with the clinical
              pharmacist or the treating team about therapeutic drug monitoring, not a dose adjustment made from a calculator alone.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/augmented-renal-clearance-calculator" />
          <PopularCalculators exclude="/calculator/augmented-renal-clearance-calculator" />
        </div>
      </div>
    </>
  );
}
