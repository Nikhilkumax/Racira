"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

/**
 * Anchors for the aneuploidy rate of blastocysts by maternal age, interpolated
 * between the published preimplantation genetic testing age bins (roughly 30% of
 * blastocysts aneuploid under 35, 40% at 35–37, 53% at 38–40 and 66% at 41–42).
 */
const ANEUPLOIDY_ANCHORS: { age: number; rate: number }[] = [
  { age: 20, rate: 12 },
  { age: 25, rate: 18 },
  { age: 28, rate: 24 },
  { age: 31, rate: 30 },
  { age: 35, rate: 40 },
  { age: 38, rate: 53 },
  { age: 40, rate: 58 },
  { age: 42, rate: 66 },
  { age: 44, rate: 80 },
  { age: 46, rate: 88 },
  { age: 48, rate: 93 },
];

/** Clinical pregnancy loss rates by maternal age, from registry data on recognised pregnancies. */
const MISCARRIAGE_ANCHORS: { age: number; rate: number }[] = [
  { age: 20, rate: 9 },
  { age: 25, rate: 10 },
  { age: 30, rate: 12 },
  { age: 35, rate: 18 },
  { age: 38, rate: 24 },
  { age: 40, rate: 34 },
  { age: 42, rate: 45 },
  { age: 44, rate: 55 },
  { age: 46, rate: 65 },
  { age: 48, rate: 75 },
];

/** Ongoing pregnancy or live birth per euploid blastocyst transferred, by maternal age. */
const EUPLOID_TRANSFER_ANCHORS: { age: number; rate: number }[] = [
  { age: 25, rate: 65 },
  { age: 30, rate: 62 },
  { age: 35, rate: 55 },
  { age: 38, rate: 47 },
  { age: 40, rate: 38 },
  { age: 42, rate: 28 },
  { age: 44, rate: 18 },
  { age: 46, rate: 10 },
  { age: 48, rate: 5 },
];

interface EggInputs {
  age: number;
  amh: number;
  cycles: number;
  matureShare: number;
  fertilisationRate: number;
  blastocystRate: number;
  transferShare: number;
  decimals: number;
}

const DEFAULTS: EggInputs = {
  age: 35,
  amh: 2,
  cycles: 1,
  matureShare: 80,
  fertilisationRate: 72,
  blastocystRate: 45,
  transferShare: 100,
  decimals: 1,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

/** Piecewise linear interpolation between the published age anchors. */
function interpolate(anchors: { age: number; rate: number }[], age: number): number {
  if (age <= anchors[0].age) return anchors[0].rate;
  if (age >= anchors[anchors.length - 1].age) return anchors[anchors.length - 1].rate;
  for (let i = 0; i < anchors.length - 1; i++) {
    const low = anchors[i];
    const high = anchors[i + 1];
    if (age >= low.age && age <= high.age) {
      const t = (age - low.age) / (high.age - low.age);
      return low.rate + t * (high.rate - low.rate);
    }
  }
  return anchors[anchors.length - 1].rate;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface EggResult {
  valid: boolean;
  errorMsg: string;
  aneuploidyPct: number;
  euploidPct: number;
  expectedOocytes: number;
  matureOocytes: number;
  fertilised: number;
  blastocysts: number;
  euploidBlastocysts: number;
  chancePerCycle: number;
  cumulativeChance: number;
  miscarriagePct: number;
  transferSuccessPct: number;
  liveBirthPerTransfer: number;
  amhCategory: string;
  amhColor: string;
  ageBand: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateEgg(input: EggInputs): EggResult {
  const blank = (errorMsg: string): EggResult => ({
    valid: false,
    errorMsg,
    aneuploidyPct: 0,
    euploidPct: 0,
    expectedOocytes: 0,
    matureOocytes: 0,
    fertilised: 0,
    blastocysts: 0,
    euploidBlastocysts: 0,
    chancePerCycle: 0,
    cumulativeChance: 0,
    miscarriagePct: 0,
    transferSuccessPct: 0,
    liveBirthPerTransfer: 0,
    amhCategory: "",
    amhColor: "text-muted-foreground",
    ageBand: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.age,
    input.amh,
    input.cycles,
    input.matureShare,
    input.fertilisationRate,
    input.blastocystRate,
    input.transferShare,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to estimate the cycle.");
  if (input.age < 18 || input.age > 50) return blank("Maternal age should be between 18 and 50.");
  if (input.amh <= 0 || input.amh > 25) return blank("AMH should be above 0 and no more than 25 ng/mL.");
  if (input.cycles < 1 || input.cycles > 8) return blank("Cycles should be between 1 and 8.");
  if (input.matureShare <= 0 || input.matureShare > 100) return blank("Mature oocyte share should be between 1% and 100%.");
  if (input.fertilisationRate <= 0 || input.fertilisationRate > 100) return blank("Fertilisation rate should be between 1% and 100%.");
  if (input.blastocystRate <= 0 || input.blastocystRate > 100) return blank("Blastocyst rate should be between 1% and 100%.");
  if (input.transferShare <= 0 || input.transferShare > 100) return blank("Share of blastocysts tested or transferred should be between 1% and 100%.");

  const d = Math.max(0, Math.min(2, input.decimals));

  // Age drives egg quality, which the aneuploidy rate of blastocysts captures most
  // directly: it is the single strongest predictor of whether an embryo can make a
  // baby, and it barely moves with AMH.
  const aneuploidyPct = interpolate(ANEUPLOIDY_ANCHORS, input.age);
  const euploidPct = 100 - aneuploidyPct;
  const miscarriagePct = interpolate(MISCARRIAGE_ANCHORS, input.age);
  const transferSuccessPct = interpolate(EUPLOID_TRANSFER_ANCHORS, input.age);

  // AMH reflects how many eggs are available, not how good they are. The mapping
  // from AMH to retrieved oocytes follows the usual clinical rule of thumb that
  // 1 ng/mL yields roughly six to eight oocytes.
  const expectedOocytes = Math.max(2, Math.min(35, 5 + 2.8 * input.amh));
  const matureOocytes = expectedOocytes * (input.matureShare / 100);
  const fertilised = matureOocytes * (input.fertilisationRate / 100);
  const blastocysts = fertilised * (input.blastocystRate / 100);
  const euploidBlastocysts = blastocysts * (euploidPct / 100) * (input.transferShare / 100);

  // Chance of at least one euploid embryo from the cycle: one minus the chance that
  // every blastocyst examined is aneuploid.
  const chancePerCycle = blastocysts > 0 ? (1 - Math.pow(aneuploidyPct / 100, blastocysts)) * 100 : 0;
  const cumulativeChance = (1 - Math.pow(1 - chancePerCycle / 100, input.cycles)) * 100;
  const liveBirthPerTransfer = (transferSuccessPct * (100 - miscarriagePct)) / 100;

  const amhCategory =
    input.amh < 0.5
      ? "Very low reserve for this age"
      : input.amh < 1
        ? "Low ovarian reserve"
        : input.amh <= 3.5
          ? "Reserve within the usual range"
          : "High reserve — worth screening for polycystic ovary syndrome";
  const amhColor = input.amh < 1 ? "text-orange-600" : input.amh <= 3.5 ? "text-emerald-600" : "text-orange-600";

  const ageBand =
    input.age < 30
      ? "Under 30"
      : input.age < 35
        ? "30 to 34"
        : input.age < 38
          ? "35 to 37"
          : input.age < 41
            ? "38 to 40"
            : input.age < 43
              ? "41 to 42"
              : input.age < 45
                ? "43 to 44"
                : "45 and over";

  const verdict =
    euploidBlastocysts >= 1
      ? `The model expects about ${fmt(euploidBlastocysts, 1)} euploid blastocyst per cycle at ${fmt(
          input.age,
          0,
        )} years, so the cycle is likely to produce at least one embryo that can be transferred`
      : `At ${fmt(input.age, 0)} years the expected number of euploid blastocysts per cycle is below one, so several cycles or donor consideration are the realistic routes to a transfer`;
  const verdictColor = euploidBlastocysts >= 1 ? "text-emerald-600" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: "Maternal age at egg collection", value: `${fmt(input.age, 0)} years — ${ageBand}` },
    { label: "Aneuploidy rate of blastocysts at this age", value: `${fmt(aneuploidyPct, 1)}%`, highlight: true },
    { label: "Euploid share of blastocysts", value: `${fmt(euploidPct, 1)}%`, highlight: true },
    { label: `AMH ${fmt(input.amh, 2)} ng/mL`, value: amhCategory },
    { label: "Expected oocytes retrieved per cycle", value: `${fmt(expectedOocytes, 1)}` },
    { label: `Mature (MII) oocytes at ${fmt(input.matureShare, 0)}%`, value: `${fmt(matureOocytes, 1)}` },
    { label: `Normally fertilised at ${fmt(input.fertilisationRate, 0)}%`, value: `${fmt(fertilised, 1)}` },
    { label: `Blastocysts at ${fmt(input.blastocystRate, 0)}% of fertilised eggs`, value: `${fmt(blastocysts, 1)}` },
    { label: `Immature and arrested embryos`, value: `${fmt(Math.max(0, expectedOocytes - blastocysts), 1)}` },
    { label: `Euploid blastocysts at ${fmt(input.transferShare, 0)}% tested or transferred`, value: `${fmt(euploidBlastocysts, 2)}`, highlight: true },
    { label: "Chance of at least one euploid embryo this cycle", value: `${fmt(chancePerCycle, 1)}%` },
    { label: `Cumulative chance across ${fmt(input.cycles, 0)} cycle${input.cycles === 1 ? "" : "s"}`, value: `${fmt(cumulativeChance, 1)}%` },
    { label: "Pregnancy loss risk for a recognised pregnancy", value: `${fmt(miscarriagePct, 1)}%` },
    { label: "Ongoing pregnancy per euploid blastocyst transferred", value: `${fmt(transferSuccessPct, 1)}%` },
    { label: "Live birth per euploid blastocyst transferred", value: `${fmt(liveBirthPerTransfer, 1)}%` },
    { label: "Egg quality driver vs egg quantity driver", value: "Age drives quality; AMH drives quantity — they move independently" },
  ];

  return {
    valid: true,
    errorMsg: "",
    aneuploidyPct,
    euploidPct,
    expectedOocytes,
    matureOocytes,
    fertilised,
    blastocysts,
    euploidBlastocysts,
    chancePerCycle,
    cumulativeChance,
    miscarriagePct,
    transferSuccessPct,
    liveBirthPerTransfer,
    amhCategory,
    amhColor,
    ageBand,
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

export default function EggQualityAgeCalculator() {
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [amh, setAmh] = useState(String(DEFAULTS.amh));
  const [cycles, setCycles] = useState(String(DEFAULTS.cycles));
  const [matureShare, setMatureShare] = useState(String(DEFAULTS.matureShare));
  const [fertilisationRate, setFertilisationRate] = useState(String(DEFAULTS.fertilisationRate));
  const [blastocystRate, setBlastocystRate] = useState(String(DEFAULTS.blastocystRate));
  const [transferShare, setTransferShare] = useState(String(DEFAULTS.transferShare));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): EggInputs => ({
    age: parseFloat(age) || 0,
    amh: parseFloat(amh) || 0,
    cycles: parseFloat(cycles) || 0,
    matureShare: parseFloat(matureShare) || 0,
    fertilisationRate: parseFloat(fertilisationRate) || 0,
    blastocystRate: parseFloat(blastocystRate) || 0,
    transferShare: parseFloat(transferShare) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<EggInputs>(() => DEFAULTS);
  const [results, setResults] = useState<EggResult>(() => calculateEgg(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateEgg(inputs));
  };

  const reset = () => {
    setAge(String(DEFAULTS.age));
    setAmh(String(DEFAULTS.amh));
    setCycles(String(DEFAULTS.cycles));
    setMatureShare(String(DEFAULTS.matureShare));
    setFertilisationRate(String(DEFAULTS.fertilisationRate));
    setBlastocystRate(String(DEFAULTS.blastocystRate));
    setTransferShare(String(DEFAULTS.transferShare));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateEgg(DEFAULTS));
  };

  const ageNum = parseFloat(age);
  const amhNum = parseFloat(amh);

  const errors = {
    age: !Number.isFinite(ageNum) || ageNum < 18 || ageNum > 50 ? "Enter 18–50 years" : "",
    amh: !Number.isFinite(amhNum) || amhNum <= 0 || amhNum > 25 ? "Enter 0.01–25 ng/mL" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Does AMH measure egg quality?",
      answer:
        "No, and this is the most common misunderstanding in fertility testing. AMH is produced by the small antral follicles in the ovary, so it estimates how many eggs remain — the quantity of the reserve. Quality is driven almost entirely by maternal age, because the eggs a woman ovulates are the same ones she was born with, and the machinery that copies and divides their chromosomes has been running since before birth. Two women with identical AMH at the same age have the same egg quality expectation, and a low AMH at 32 does not predict poor embryo quality, only fewer eggs per cycle.",
    },
    {
      question: "Why does aneuploidy rise so sharply with age?",
      answer:
        "Eggs are held in a paused state of cell division from before birth until ovulation, sometimes for four decades, and the proteins that hold the chromosomes together and pull them apart at meiosis degrade over that time. The result is nondisjunction: a chromosome pair fails to separate properly, so the resulting embryo gains or loses a chromosome. The proportion of blastocysts that are aneuploid rises from around 25% at 30 years to roughly 40% at 35, over half by 38 and about two thirds by 42, which is why euploid rates fall even when plenty of eggs are retrieved.",
    },
    {
      question: "What does the model's 'euploid blastocysts per cycle' mean?",
      answer:
        "It is the number of blastocysts that would be expected to have a normal chromosome count, after the realistic attrition from oocytes retrieved through to day 5: about 80% mature, roughly 70% fertilised, and around 45% of fertilised eggs reaching blastocyst stage. It is not a prediction for one cycle — it is the mean outcome, and the spread around it is wide. Its practical use is deciding how many cycles to plan and whether embryo testing is worth the cost, since the figure where it drops below one is the point at which the arithmetic of repeated cycles starts to look unattractive.",
    },
    {
      question: "How should I read the miscarriage and transfer figures?",
      answer:
        "They are conditional probabilities, not a forecast. The loss risk shown applies to a recognised clinical pregnancy, so it follows a positive scan rather than a positive test, and much of the rise with age comes from the same aneuploidy that the embryo models reject. The ongoing pregnancy rate per euploid blastocyst transferred is the best-performing single number in fertility treatment, conventionally above 55% under 35 and falling to around 30% in the early forties, because most losses from transfer failures onwards are caused by embryo genetics rather than by the uterus.",
    },
    {
      question: "When should I see a specialist?",
      answer:
        "Fertility guidelines commonly suggest assessment after twelve months of trying under 35, after six months from 35 to 39, and immediately at 40 or over; women with irregular cycles, known endometriosis, previous pelvic surgery or a history of chemotherapy should be seen sooner regardless of age. Bring any AMH, antral follicle count or day 3 hormone results to the appointment, but expect the conversation to be about age and cycle planning rather than about AMH alone. This calculator is educational and cannot replace an individual assessment.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Egg Quality Age Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Egg Quality Age Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Age & Reserve">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="age"
                  label="Maternal Age"
                  value={age}
                  onChange={setAge}
                  onEnter={runCalculate}
                  min="18"
                  max="50"
                  step="1"
                  suffix="years"
                  error={errors.age}
                  hint="Age at egg collection."
                  tooltip="Age at the time of egg collection, which is the dominant driver of embryo chromosome normality."
                />
                <CompactInput
                  id="amh"
                  label="AMH"
                  value={amh}
                  onChange={setAmh}
                  onEnter={runCalculate}
                  min="0.01"
                  max="25"
                  step="any"
                  suffix="ng/mL"
                  error={errors.amh}
                  hint="Quantity, not quality."
                  tooltip="Anti-Müllerian hormone, used only to estimate how many eggs a cycle will retrieve."
                />
              </div>
            </SubSection>

            <SubSection title="Cycle Count">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cycles"
                  label="Cycles Planned"
                  value={cycles}
                  onChange={setCycles}
                  onEnter={runCalculate}
                  min="1"
                  max="8"
                  step="1"
                  tooltip="Used for the cumulative chance of obtaining at least one euploid embryo."
                />
                <CompactInput
                  id="transfer-share"
                  label="Tested or Transferred"
                  value={transferShare}
                  onChange={setTransferShare}
                  onEnter={runCalculate}
                  min="1"
                  max="100"
                  step="5"
                  suffix="%"
                  hint="100% if every blastocyst is used."
                  tooltip="Share of blastocysts that are biopsied or transferred, since the rest are not candidates."
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
                  <SubSection title="Laboratory Attrition">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="mature"
                        label="Mature Oocytes"
                        value={matureShare}
                        onChange={setMatureShare}
                        onEnter={runCalculate}
                        min="1"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Share of retrieved oocytes that are mature enough to inject, typically 75–85%."
                      />
                      <CompactInput
                        id="fertilisation"
                        label="Fertilisation Rate"
                        value={fertilisationRate}
                        onChange={setFertilisationRate}
                        onEnter={runCalculate}
                        min="1"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Share of mature oocytes that fertilise normally, typically 65–75% with ICSI."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="blastocyst"
                        label="Blastocyst Rate"
                        value={blastocystRate}
                        onChange={setBlastocystRate}
                        onEnter={runCalculate}
                        min="1"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Share of fertilised eggs that reach day 5 or 6, typically 40–50%, lower with age."
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
                        tooltip="Decimal places used for percentages and embryo counts."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Euploid Blastocysts per Cycle</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.euploidBlastocysts, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `At ${fmt(calcInputs.age, 0)} years roughly ${fmt(results.aneuploidyPct, 0)}% of blastocysts are aneuploid, leaving ${fmt(
                      results.euploidPct,
                      0,
                    )}% usable`
                  : "Fix the highlighted inputs to estimate the cycle"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Aneuploidy Risk</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.aneuploidyPct, 0)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Oocytes</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? fmt(results.expectedOocytes, 1) : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Chance ≥ 1 Euploid</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.chancePerCycle, 0)}%` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Fertility Item</th>
                    <th className="p-2.5 pr-3 text-right w-[240px]">Estimate</th>
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
                        Enter the age and reserve figures to estimate the cycle.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Euploid blastocysts per cycle</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.euploidBlastocysts, calcInputs.decimals)} · ${fmt(results.chancePerCycle, 0)}% chance of at least one`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Age band</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? results.ageBand : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Euploid share</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.euploidPct, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Oocytes retrieved</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.expectedOocytes, 1) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Blastocysts</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.blastocysts, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Euploid blastocysts</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.euploidBlastocysts, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                    Cumulative over {fmt(calcInputs.cycles, 0)} cycles
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.cumulativeChance, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Loss risk per pregnancy</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.miscarriagePct, 0)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Live birth per transfer</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.liveBirthPerTransfer, 0)}%` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && (
                <>
                  <p className={`text-[11px] mt-3 font-semibold ${results.amhColor}`}>
                    AMH {fmt(calcInputs.amh, 2)} ng/mL — {results.amhCategory.toLowerCase()}.
                  </p>
                  <p className={`text-[11px] mt-2 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Egg Quality Age Calculator?</h2>
            <p>
              An egg quality age calculator estimates how many of the embryos a cycle produces are likely to have a normal chromosome
              count, using maternal age as the driver and the ovarian reserve only for the number of eggs retrieved. It follows the
              attrition of a realistic IVF cycle — retrieved oocytes, mature eggs, fertilised eggs, blastocysts — and then applies the
              age-specific aneuploidy rate to what is left.
            </p>
            <p>
              The distinction it is built around is the one that matters most in fertility counselling: quantity and quality are separate
              variables. A high AMH gives more eggs, not better eggs, and age moves quality in a direction that no supplement, protocol
              or lifestyle change has been shown to reverse.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              AMH estimates the size of the remaining follicle pool, and the mapping used here is the usual clinical rule of thumb in
              which each nanogram per millilitre corresponds to roughly three antral follicles and therefore to a handful of retrieved
              oocytes — about six to eight eggs at 1 ng/mL, ten to twelve at 2, and sixteen to eighteen at 4. That figure is then run
              through the ordinary laboratory attrition: around 80% of retrieved eggs are mature enough to inject, roughly 70% of those
              fertilise normally, and 40 to 50% of fertilised eggs reach the blastocyst stage on day 5 or 6.
            </p>
            <p>
              Chromosome normality is layered on top from maternal age. Published preimplantation genetic testing series put the
              aneuploidy rate of blastocysts at roughly 25 to 30% under 35, about 40% at 35 to 37, over half at 38 to 40, around two
              thirds at 41 to 42 and four fifths by 44. Interpolating between those bins gives the euploid share, which is then applied to
              the blastocysts the cycle produces. Because the losses compound, the practical number that comes out is the expected count
              of euploid embryos per cycle — the figure that decides how many retrievals a plan realistically needs.
            </p>
            <p>
              The chance of at least one euploid embryo follows from the binomial arithmetic: one minus the probability that every
              blastocyst examined happens to be aneuploid. Across repeated cycles the same calculation compounds again, which is why a
              single cycle with a disappointing count does not settle the question, but three consecutive cycles at 42 years do.
              Miscarriage risk and the ongoing pregnancy rate per euploid transfer come from the same age anchors, so the whole chain from
              collection to delivery can be read in one place.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the expected number of euploid blastocysts per cycle, with the aneuploidy rate behind it. The three-stat
              bar adds the aneuploidy risk for the age entered, the oocytes the reserve implies and the probability of obtaining at least
              one euploid embryo from a single cycle.
            </p>
            <p>
              The breakdown table walks the full attrition path — oocytes, mature eggs, fertilised eggs, blastocysts, euploid blastocysts
              — then the cumulative chance across the cycles you planned, the pregnancy loss risk and the live birth rate per euploid
              transfer, and ends with the reminder that age drives quality while AMH drives quantity. The summary panel repeats the
              headline figures and prints the reserve and verdict lines.
            </p>
            <p>
              Take the numbers as population averages applied to an individual, which is the honest way to read them. The model cannot see
              sperm quality, uterine factors, endometriosis, thyroid disease, a previous ovarian surgery or the protocol your clinic
              chooses, and its spread is wide: two women of the same age with the same AMH can finish cycles with zero and four euploid
              embryos. What it does do reliably is show the shape of the arithmetic — why a 34-year-old with a reserve of 1 ng/mL typically
              still has a better euploid yield per cycle than a 43-year-old with a reserve of 4, and why the age figure, not the AMH
              figure, is the one to build a plan around.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/egg-quality-age-calculator" />
          <PopularCalculators exclude="/calculator/egg-quality-age-calculator" />
        </div>
      </div>
    </>
  );
}
