"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface StageBand {
  stage: number;
  label: string;
  low: number;
  high: number;
  mean: number;
  nextYears: number;
}

/**
 * Typical ages at each sexual maturity rating, following the Marshall and Tanner
 * longitudinal cohorts as taught in paediatric references. The ranges are wide
 * because normal timing varies enormously between healthy children.
 */
const FEMALE_BREAST: StageBand[] = [
  { stage: 1, label: "B1 — preadolescent, no breast tissue", low: 0, high: 0, mean: 0, nextYears: 0 },
  { stage: 2, label: "B2 — breast bud, areola widens", low: 8, high: 13, mean: 11.2, nextYears: 1 },
  { stage: 3, label: "B3 — breast and areola enlarge together", low: 10, high: 14, mean: 12.2, nextYears: 1 },
  { stage: 4, label: "B4 — areola and papilla project above the contour", low: 11, high: 15, mean: 13.1, nextYears: 1.7 },
  { stage: 5, label: "B5 — mature, areola no longer projects", low: 13, high: 18, mean: 15.3, nextYears: 0 },
];

const FEMALE_HAIR: StageBand[] = [
  { stage: 1, label: "PH1 — no pubic hair", low: 0, high: 0, mean: 0, nextYears: 0 },
  { stage: 2, label: "PH2 — sparse, straight hair along the labia", low: 8, high: 14, mean: 11.7, nextYears: 1 },
  { stage: 3, label: "PH3 — darker, curling hair over the pubis", low: 10, high: 15, mean: 12.4, nextYears: 1 },
  { stage: 4, label: "PH4 — adult-type hair, smaller area", low: 11, high: 16, mean: 13.0, nextYears: 1.5 },
  { stage: 5, label: "PH5 — adult distribution, spread to the thighs", low: 13, high: 18, mean: 14.4, nextYears: 0 },
];

const MALE_GENITAL: StageBand[] = [
  { stage: 1, label: "G1 — preadolescent testes and scrotum", low: 0, high: 0, mean: 0, nextYears: 0 },
  { stage: 2, label: "G2 — scrotum reddens and enlarges, testes enlarge", low: 9, high: 14, mean: 11.6, nextYears: 1 },
  { stage: 3, label: "G3 — penis lengthens, testes and scrotum grow further", low: 11, high: 15, mean: 12.9, nextYears: 1 },
  { stage: 4, label: "G4 — glans enlarges, scrotum darkens", low: 12, high: 17, mean: 13.8, nextYears: 1.5 },
  { stage: 5, label: "G5 — adult size and shape", low: 13, high: 18, mean: 14.9, nextYears: 0 },
];

const MALE_HAIR: StageBand[] = [
  { stage: 1, label: "PH1 — no pubic hair", low: 0, high: 0, mean: 0, nextYears: 0 },
  { stage: 2, label: "PH2 — sparse, straight hair at the base of the penis", low: 10, high: 15, mean: 12.0, nextYears: 1 },
  { stage: 3, label: "PH3 — coarser, curly hair spreading over the pubis", low: 11, high: 16, mean: 13.0, nextYears: 1 },
  { stage: 4, label: "PH4 — adult-type hair, not yet spread to the thighs", low: 12, high: 17, mean: 13.9, nextYears: 1.3 },
  { stage: 5, label: "PH5 — adult distribution to the inner thighs", low: 14, high: 19, mean: 15.2, nextYears: 0 },
];

/** Mean age at menarche in contemporary cohort data, and the mean peak-height-velocity ages. */
const MENARCHE_MEAN_AGE = 12.4;
const PHV_AGE = { female: 11.9, male: 13.8 };

interface TannerInputs {
  sex: string;
  ageYears: number;
  ageMonths: number;
  primaryStage: string;
  hairStage: string;
  menarche: string;
  decimals: number;
}

const DEFAULTS: TannerInputs = {
  sex: "female",
  ageYears: 12,
  ageMonths: 6,
  primaryStage: "3",
  hairStage: "2",
  menarche: "no",
  decimals: 1,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface TannerResult {
  valid: boolean;
  errorMsg: string;
  ageDecimal: number;
  sex: string;
  primaryBand: StageBand;
  hairBand: StageBand;
  primaryLabel: string;
  hairLabel: string;
  smr: number;
  yearsToAdult: number;
  expectedAgeAtAdult: number;
  timing: string;
  timingColor: string;
  timingDetail: string;
  phvNote: string;
  menarcheNote: string;
  concern: string;
  concernColor: string;
  breakdown: BreakdownRow[];
}

function bandFor(bands: StageBand[], stage: number): StageBand {
  return bands.find((b) => b.stage === stage) || bands[0];
}

/** Linear interpolation of a stage band's typical age window for the chart-free readout. */
function timingVerdict(age: number, band: StageBand, sex: string): { timing: string; color: string; detail: string } {
  if (band.stage === 1) {
    return {
      timing: "Prepubertal",
      color: "text-muted-foreground",
      detail:
        sex === "female"
          ? "No breast development is expected before 8 years, and onset after 13 years is considered delayed and worth investigating."
          : "No testicular enlargement is expected before 9 years, and onset after 14 years is considered delayed and worth investigating.",
    };
  }
  if (age < band.low) {
    return {
      timing: "Early for this stage",
      color: "text-orange-600",
      detail:
        sex === "female"
          ? "Reaching this stage before the typical window can still be normal, but onset before 8 years (or pubic hair before 8) warrants assessment for precocious puberty."
          : "Reaching this stage before the typical window can still be normal, but onset before 9 years warrants assessment for precocious puberty.",
    };
  }
  if (age > band.high) {
    return {
      timing: "Late for this stage",
      color: "text-orange-600",
      detail:
        "Sitting above the typical window is common in children who simply mature later, but persistent delay beyond the upper bound is the point at which growth and endocrine assessment is usually offered.",
    };
  }
  return {
    timing: "Within the typical window",
    color: "text-emerald-600",
    detail: "The reported stage sits inside the age range seen in healthy children of the same sex.",
  };
}

function calculateTanner(input: TannerInputs): TannerResult {
  const female = input.sex === "female";
  const breastBands = FEMALE_BREAST;
  const hairBands = female ? FEMALE_HAIR : MALE_HAIR;
  const genitalBands = MALE_GENITAL;

  const blank = (errorMsg: string): TannerResult => ({
    valid: false,
    errorMsg,
    ageDecimal: 0,
    sex: input.sex,
    primaryBand: breastBands[0],
    hairBand: hairBands[0],
    primaryLabel: female ? "Breast" : "Genital",
    hairLabel: "Pubic hair",
    smr: 0,
    yearsToAdult: 0,
    expectedAgeAtAdult: 0,
    timing: "",
    timingColor: "text-muted-foreground",
    timingDetail: "",
    phvNote: "",
    menarcheNote: "",
    concern: "",
    concernColor: "text-muted-foreground",
    breakdown: [],
  });

  if (!Number.isFinite(input.ageYears) || input.ageYears < 3 || input.ageYears > 25) {
    return blank("Enter an age between 3 and 25 years.");
  }
  if (!Number.isFinite(input.ageMonths) || input.ageMonths < 0 || input.ageMonths > 11) {
    return blank("Enter whole months from 0 to 11.");
  }
  const primaryStageNumber = parseInt(input.primaryStage);
  const hairStageNumber = parseInt(input.hairStage);
  if (!Number.isInteger(primaryStageNumber) || primaryStageNumber < 1 || primaryStageNumber > 5) {
    return blank("The breast or genital stage must be 1 to 5.");
  }
  if (!Number.isInteger(hairStageNumber) || hairStageNumber < 1 || hairStageNumber > 5) {
    return blank("The pubic hair stage must be 1 to 5.");
  }

  const d = Math.max(0, Math.min(2, input.decimals));
  const ageDecimal = input.ageYears + input.ageMonths / 12;

  const primaryBand = bandFor(female ? breastBands : genitalBands, primaryStageNumber);
  const hairBand = bandFor(hairBands, hairStageNumber);

  // The sexual maturity rating is the mean of the two independently rated scales,
  // which is how composite SMR is reported in growth studies.
  const smr = (primaryStageNumber + hairStageNumber) / 2;

  // Remaining development is the sum of the mean durations of the stages above the
  // one reported, taken from longitudinal staging cohorts.
  const primaryBands = female ? breastBands : genitalBands;
  const primaryRemaining = primaryBands.filter((b) => b.stage > primaryStageNumber).reduce((sum, b) => sum + b.nextYears, 0);
  const hairRemaining = hairBands.filter((b) => b.stage > hairStageNumber).reduce((sum, b) => sum + b.nextYears, 0);
  // The two scales progress independently, so adult staging arrives when the slower one finishes.
  const yearsToAdult = Math.max(primaryRemaining, hairRemaining);
  const expectedAgeAtAdult = ageDecimal + yearsToAdult;

  const timing = timingVerdict(ageDecimal, primaryBand, input.sex);

  const phvNote =
    ageDecimal < PHV_AGE[female ? "female" : "male"]
      ? `Peak height velocity is expected around ${fmt(PHV_AGE[female ? "female" : "male"], 1)} years for this sex, so a growth spurt is likely still ahead.`
      : `Peak height velocity normally occurs around ${fmt(PHV_AGE[female ? "female" : "male"], 1)} years for this sex, so a growth spurt that has not yet appeared by this age is worth plotting on a growth chart.`;

  const menarcheNote = female
    ? input.menarche === "yes"
      ? "Menarche has been reached, which is normally a stage 4 event and marks the end of the rapid growth phase; linear growth continues at a slower rate for roughly two more years."
      : primaryStageNumber >= 4
        ? `Menarche usually follows within about a year of stage 4, and the population mean age is ${fmt(MENARCHE_MEAN_AGE, 1)} years — later than the average in the decades when the original staging tables were built.`
        : `Menarche normally arrives at an average age of ${fmt(MENARCHE_MEAN_AGE, 1)} years, most often from stage 4, so it is typically still some way off at this stage.`
    : "Voice change and facial hair growth follow testicular enlargement and normally appear from stage 3 onwards.";

  let concern = "No red flag is triggered by the reported stage and age.";
  let concernColor = "text-emerald-600";
  if (female && (primaryStageNumber >= 2 || hairStageNumber >= 2) && ageDecimal < 8) {
    concern = "Signs of puberty before 8 years in girls is the threshold at which assessment for precocious puberty is recommended.";
    concernColor = "text-red-600";
  } else if (!female && (primaryStageNumber >= 2 || hairStageNumber >= 2) && ageDecimal < 9) {
    concern = "Signs of puberty before 9 years in boys is the threshold at which assessment for precocious puberty is recommended.";
    concernColor = "text-red-600";
  } else if (female && primaryStageNumber === 1 && ageDecimal >= 13) {
    concern = "No breast development by 13 years in girls meets the usual definition of delayed puberty and warrants evaluation.";
    concernColor = "text-red-600";
  } else if (!female && primaryStageNumber === 1 && ageDecimal >= 14) {
    concern = "No testicular enlargement by 14 years in boys meets the usual definition of delayed puberty and warrants evaluation.";
    concernColor = "text-red-600";
  } else if (ageDecimal > primaryBand.high && primaryStageNumber < 5) {
    concern = "The stage reported is older than the typical window for it, which is the pattern to discuss with a clinician if growth is also tracking low.";
    concernColor = "text-orange-600";
  }

  const breakdown: BreakdownRow[] = [
    { label: "Age used", value: `${fmt(ageDecimal, 2)} years (${fmt(input.ageYears, 0)} y ${fmt(input.ageMonths, 0)} m)` },
    { label: female ? "Breast stage reported" : "Genital stage reported", value: primaryBand.label, highlight: true },
    { label: "Typical age window for that stage", value: primaryBand.low > 0 ? `${fmt(primaryBand.low, 0)}–${fmt(primaryBand.high, 0)} years (mean ${fmt(primaryBand.mean, 1)})` : "preadolescent" },
    { label: "Pubic hair stage reported", value: hairBand.label, highlight: true },
    { label: "Typical age window for pubic hair", value: hairBand.low > 0 ? `${fmt(hairBand.low, 0)}–${fmt(hairBand.high, 0)} years (mean ${fmt(hairBand.mean, 1)})` : "preadolescent" },
    { label: "Composite sexual maturity rating", value: `SMR ${fmt(smr, 1)}`, highlight: true },
    { label: "Timing against the typical window", value: timing.timing, highlight: true },
    { label: "Mean duration of each stage above this one", value: `${fmt(yearsToAdult, d)} years of staging left` },
    { label: "Estimated age at adult staging", value: `${fmt(expectedAgeAtAdult, d)} years` },
    { label: `Peak height velocity reference age (${female ? "girls" : "boys"})`, value: `${fmt(PHV_AGE[female ? "female" : "male"], 1)} years` },
    { label: "Menarche timing", value: female ? `${fmt(MENARCHE_MEAN_AGE, 1)} years on average` : "not applicable" },
    { label: "Interpretation", value: timing.detail },
    { label: "Red flag check", value: concern, highlight: true },
  ];

  return {
    valid: true,
    errorMsg: "",
    ageDecimal,
    sex: input.sex,
    primaryBand,
    hairBand,
    primaryLabel: female ? "Breast" : "Genital",
    hairLabel: "Pubic hair",
    smr,
    yearsToAdult,
    expectedAgeAtAdult,
    timing: timing.timing,
    timingColor: timing.color,
    timingDetail: timing.detail,
    phvNote,
    menarcheNote,
    concern,
    concernColor,
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

export default function TannerStageEstimator() {
  const [sex, setSex] = useState<string>(DEFAULTS.sex);
  const [ageYears, setAgeYears] = useState(String(DEFAULTS.ageYears));
  const [ageMonths, setAgeMonths] = useState(String(DEFAULTS.ageMonths));
  const [primaryStage, setPrimaryStage] = useState<string>(DEFAULTS.primaryStage);
  const [hairStage, setHairStage] = useState<string>(DEFAULTS.hairStage);
  const [menarche, setMenarche] = useState<string>(DEFAULTS.menarche);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const female = sex === "female";
  const primaryBands = female ? FEMALE_BREAST : MALE_GENITAL;
  const hairBands = female ? FEMALE_HAIR : MALE_HAIR;

  const getInputs = (): TannerInputs => ({
    sex,
    ageYears: parseFloat(ageYears) || 0,
    ageMonths: parseFloat(ageMonths) || 0,
    primaryStage,
    hairStage,
    menarche,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<TannerInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TannerResult>(() => calculateTanner(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateTanner(inputs));
  };

  const reset = () => {
    setSex(DEFAULTS.sex);
    setAgeYears(String(DEFAULTS.ageYears));
    setAgeMonths(String(DEFAULTS.ageMonths));
    setPrimaryStage(DEFAULTS.primaryStage);
    setHairStage(DEFAULTS.hairStage);
    setMenarche(DEFAULTS.menarche);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateTanner(DEFAULTS));
  };

  const ageNum = parseFloat(ageYears);
  const monthNum = parseFloat(ageMonths);

  const errors = {
    ageYears: !Number.isFinite(ageNum) || ageNum < 3 || ageNum > 25 ? "Enter 3–25 years" : "",
    ageMonths: !Number.isFinite(monthNum) || monthNum < 0 || monthNum > 11 ? "Enter 0–11 months" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is the Tanner stage?",
      answer:
        "The Tanner stage — properly the sexual maturity rating, or SMR — grades the physical signs of puberty on a scale of 1 to 5. Two scales are rated separately: breast development and pubic hair in girls, genital development and pubic hair in boys. Stage 1 is prepubertal, stage 2 is the first visible sign, stage 3 is clear progression, stage 4 is the near-adult appearance that includes the areola projecting above the breast contour and darkening of the scrotum, and stage 5 is the adult appearance. Clinicians often quote a composite rating as the average of the two scales.",
    },
    {
      question: "When does puberty normally start and finish?",
      answer:
        "For girls, breast budding normally begins between 8 and 13 years with a mean near 11, and the whole process takes about four years. For boys, testicular enlargement normally begins between 9 and 14 years with a mean near 11.5, and the process takes about three to four years but starts later and lasts longer, which is why girls are usually taller than boys at 12 and shorter at 15. Peak height velocity arrives at roughly 12 years in girls — about a year before menarche — and roughly 13.8 years in boys.",
    },
    {
      question: "What counts as early or delayed puberty?",
      answer:
        "In girls, any sign of puberty before 8 years, and in boys before 9 years, is the threshold that prompts assessment for precocious puberty — it may be normal early variation, but it can also reflect central or adrenal causes that change final height. At the other end, no breast development by 13 in girls or no testicular enlargement by 14 in boys meets the usual definition of delayed puberty; constitutional delay, in which a child simply matures late on a family pattern, is the most common explanation and can often be recognised from the parents' own histories.",
    },
    {
      question: "Why does the model give an estimated age at adult staging?",
      answer:
        "Because each stage has a characteristic mean duration in longitudinal cohorts, so the stages still ahead can be added up to give a rough completion age — roughly four years from the start of stage 2 in girls and about the same in boys. Treat it as a description of the average child rather than a prediction for one: the spread between children is a couple of years in each direction, and it is exactly the children at the ends of that spread whose growth curves are worth plotting.",
    },
    {
      question: "What should I do with a result that looks off?",
      answer:
        "Plot height and weight on a growth chart, since growth velocity is often more informative than a single measurement, and book a paediatric appointment rather than acting on the staging alone. Staging is a clinical skill — breast tissue has to be distinguished from fat, and testicular volume is measured with an orchidometer rather than judged by eye — so a stage recorded here can easily differ by one from the stage a clinician records. This tool is educational and does not diagnose precocious or delayed puberty.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Pubertal Stage (Tanner Stage) Estimator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Pubertal Stage (Tanner Stage) Estimator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Child">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="sex"
                  label="Sex"
                  value={sex}
                  onChange={setSex}
                  options={[
                    { value: "female", label: "Female" },
                    { value: "male", label: "Male" },
                  ]}
                  tooltip="Selects the breast and genital scales and their typical age windows."
                />
                <CompactInput
                  id="age-years"
                  label="Age"
                  value={ageYears}
                  onChange={setAgeYears}
                  onEnter={runCalculate}
                  min="3"
                  max="25"
                  step="1"
                  suffix="years"
                  error={errors.ageYears}
                  tooltip="Age in completed years, used against the typical window for the reported stage."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="age-months"
                  label="Additional Months"
                  value={ageMonths}
                  onChange={setAgeMonths}
                  onEnter={runCalculate}
                  min="0"
                  max="11"
                  step="1"
                  suffix="months"
                  error={errors.ageMonths}
                  tooltip="Months beyond the whole years; staging shifts quickly in the middle of puberty."
                />
                <CompactSelect
                  id="primary-stage"
                  label={female ? "Breast Stage" : "Genital Stage"}
                  value={primaryStage}
                  onChange={setPrimaryStage}
                  options={primaryBands.map((b) => ({ value: String(b.stage), label: b.label }))}
                  tooltip="Rate breast development for girls or genital development for boys."
                />
              </div>
            </SubSection>

            <SubSection title="Second Scale">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="hair-stage"
                  label="Pubic Hair Stage"
                  value={hairStage}
                  onChange={setHairStage}
                  options={hairBands.map((b) => ({ value: String(b.stage), label: b.label }))}
                  tooltip="Rated separately from the breast or genital scale and often one stage apart."
                />
                <CompactSelect
                  id="menarche"
                  label="Menarche"
                  value={menarche}
                  onChange={setMenarche}
                  options={[
                    { value: "no", label: "Not yet" },
                    { value: "yes", label: "Yes" },
                  ]}
                  tooltip="Only used for girls; menarche is normally a stage 4 event."
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
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for the composite rating and the estimated completion age."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Staging is clinical: breast tissue must be distinguished from fat and testicular volume measured, not judged by eye.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Composite Sexual Maturity Rating</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `SMR ${fmt(results.smr, calcInputs.decimals)}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.primaryLabel} stage ${fmt(results.primaryBand.stage, 0)} with pubic hair stage ${fmt(
                      results.hairBand.stage,
                      0,
                    )} at ${fmt(results.ageDecimal, 1)} years — ${results.timing.toLowerCase()}`
                  : "Fix the highlighted inputs to estimate the stage"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{results.primaryLabel} Stage</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.primaryBand.stage, 0) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Hair Stage</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.hairBand.stage, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">To Adult Staging</span>
                <span className={`font-extrabold ${results.valid ? results.timingColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.yearsToAdult, 1)} y` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Staging Item</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Result</th>
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
                        Enter the age and the two stage ratings to see the interpretation.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Composite rating</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`SMR ${fmt(results.smr, 1)} · adult staging near ${fmt(results.expectedAgeAtAdult, 1)} years`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Composite SMR</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `SMR ${fmt(results.smr, 1)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Age</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.ageDecimal, 2)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Typical window</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && results.primaryBand.low > 0
                      ? `${fmt(results.primaryBand.low, 0)}–${fmt(results.primaryBand.high, 0)} y`
                      : "preadolescent"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Timing</span>
                  <span className={`text-base font-bold ${results.timingColor}`}>{results.valid ? results.timing : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Staging left</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.yearsToAdult, 1)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adult staging near</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.expectedAgeAtAdult, 1)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peak height velocity</span>
                  <span className="text-base font-bold text-foreground">
                    {fmt(PHV_AGE[calcInputs.sex === "female" ? "female" : "male"], 1)} years
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Red flag</span>
                  <span className={`text-base font-bold ${results.concernColor}`}>
                    {results.valid ? (results.concernColor === "text-emerald-600" ? "none" : "review") : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <>
                  <p className="text-[11px] text-muted-foreground mt-3">{results.phvNote} {results.menarcheNote}</p>
                  <p className={`text-[11px] mt-2 font-semibold ${results.concernColor}`}>{results.concern}</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Pubertal Stage Estimator?</h2>
            <p>
              A pubertal stage estimator places a child's reported physical signs on the five-point sexual maturity rating and compares the
              result with the age window in which healthy children of the same sex usually reach it. The rating — usually called the Tanner
              stage after the paediatrician who published the longitudinal cohorts behind it — grades breast development and pubic hair in
              girls and genital development and pubic hair in boys, with stage 1 prepubertal and stage 5 adult.
            </p>
            <p>
              Staging matters for more than description. It anchors the timing of the growth spurt, identifies children whose development
              is early or late enough to need assessment, and guides decisions about bone age imaging and endocrine testing. It is also a
              clinical examination rather than a measurement, so a figure entered here is an estimate of an estimate.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Two scales are rated independently and then combined into a composite sexual maturity rating, which is simply the average of
              the breast or genital stage and the pubic hair stage. The two often sit a stage apart — pubic hair can appear before breast
              budding in some girls and after testicular enlargement in most boys — and the composite sits between them rather than
              pretending they agree.
            </p>
            <p>
              Each stage carries a typical age window drawn from the Marshall and Tanner cohorts: breast stage 2 normally arrives between 8
              and 13 years with a mean near 11.2, stage 3 between 10 and 14 with a mean near 12.2, stage 4 between 11 and 15 with a mean
              near 13.1, and stage 5 from 13 with a mean near 15.3. Boys run later at each point: genital stage 2 between 9 and 14 with a
              mean near 11.6, and the adult stage from 13 with a mean near 14.9. Entering an age and a stage therefore produces one of
              three verdicts — inside the window, below it, or above it.
            </p>
            <p>
              The remaining development is estimated from the mean duration of each stage above the one reported, which in longitudinal
              data is about a year per stage through the middle of puberty, lengthening to roughly eighteen months for the stage 4 to
              stage 5 transition. Adding those durations to the current age gives an estimated age at adult staging, which is the figure
              most useful for anticipating when growth will finish. The tool also brings in the two timing markers that parents usually
              ask about: peak height velocity, expected near 12 years in girls and 13.8 in boys, and menarche, which follows about a year
              after peak height velocity in girls at a population mean near 12.4 years.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the composite rating with the two stages behind it and the timing verdict underneath. The three-stat bar
              puts the two individual stages and the estimated years left to adult staging side by side.
            </p>
            <p>
              The breakdown table lists the age used, both reported stages with the typical windows for each, the composite rating, the
              timing verdict against that window, the remaining staging duration, the estimated age at adult staging, the peak
              height-velocity reference age, the menarche explanation and the red-flag check. The summary panel repeats the headline
              figures and prints the growth and menarche notes, which are where the practical reading of a staging exercise usually
              lies.
            </p>
            <p>
              Read the red-flag line as a prompt rather than a diagnosis. Signs of puberty before 8 years in girls or 9 years in boys, or
              a complete absence of breast development by 13 years in girls or testicular enlargement by 14 in boys, are the thresholds at
              which paediatric assessment is standard — and the overwhelming majority of children who cross one of them turn out to have
              normal variation, particularly when a parent matured on the same schedule. Growth curves tell the story better than any
              single staging exercise, so bring serial height measurements to the appointment.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pubertal-stage-tanner-stage-estimator" />
          <PopularCalculators exclude="/calculator/pubertal-stage-tanner-stage-estimator" />
        </div>
      </div>
    </>
  );
}
