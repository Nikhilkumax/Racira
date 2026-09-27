"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type PracticeKey = "restoration" | "enhancement" | "preservation" | "establishment";

interface Practice {
  key: PracticeKey;
  label: string;
  /** Credit weight per acre relative to full re-establishment. */
  weight: number;
}

/** Credit weights follow the common regulatory convention: re-establishment and
 *  restoration earn full credit, enhancement about half, preservation a small
 *  fraction (typically 0.1 or lower). */
const PRACTICES: Practice[] = [
  { key: "establishment", label: "Re-establishment (full credit)", weight: 1 },
  { key: "restoration", label: "Restoration / rehabilitation", weight: 0.8 },
  { key: "enhancement", label: "Enhancement of existing wetland", weight: 0.5 },
  { key: "preservation", label: "Preservation only", weight: 0.1 },
];

interface WetlandInputs {
  impactAcres: number;
  impactScore: number;
  baseRatio: number;
  siteScore: number;
  practice: PracticeKey;
  outOfServicePct: number;
  temporalLossPct: number;
  bufferPct: number;
  costPerAcre: number;
  decimals: number;
}

const DEFAULTS: WetlandInputs = {
  impactAcres: 2,
  impactScore: 0.8,
  baseRatio: 2,
  siteScore: 0.7,
  practice: "restoration",
  outOfServicePct: 25,
  temporalLossPct: 10,
  bufferPct: 10,
  costPerAcre: 45000,
  decimals: 2,
};

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number, d = 0) => `$${fmt(v, d)}`;

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface WetlandResult {
  valid: boolean;
  errorMsg: string;
  practiceSpec: Practice;
  adjustedRatio: number;
  ratioRequirement: number;
  functionalDebit: number;
  creditPerAcre: number;
  functionalRequirement: number;
  bindingRequirement: number;
  effectiveRatio: number;
  bufferAcres: number;
  totalAcres: number;
  totalCost: number;
  bindingMethod: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateWetland(input: WetlandInputs): WetlandResult {
  const practiceSpec = PRACTICES.find((p) => p.key === input.practice) || PRACTICES[0];
  const blank = (errorMsg: string): WetlandResult => ({
    valid: false,
    errorMsg,
    practiceSpec,
    adjustedRatio: 0,
    ratioRequirement: 0,
    functionalDebit: 0,
    creditPerAcre: 0,
    functionalRequirement: 0,
    bindingRequirement: 0,
    effectiveRatio: 0,
    bufferAcres: 0,
    totalAcres: 0,
    totalCost: 0,
    bindingMethod: "",
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.impactAcres,
    input.impactScore,
    input.baseRatio,
    input.siteScore,
    input.outOfServicePct,
    input.temporalLossPct,
    input.bufferPct,
    input.costPerAcre,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to size the mitigation.");
  if (input.impactAcres <= 0) return blank("Impact area must be greater than zero.");
  if (input.impactScore <= 0 || input.impactScore > 1) return blank("Impact functional score should be above 0 and up to 1.");
  if (input.baseRatio <= 0) return blank("Base mitigation ratio must be greater than zero.");
  if (input.siteScore <= 0 || input.siteScore > 1) return blank("Compensation site score should be above 0 and up to 1.");
  if (input.outOfServicePct < 0 || input.outOfServicePct > 200) return blank("Service-area adjustment should be between 0% and 200%.");
  if (input.temporalLossPct < 0 || input.temporalLossPct > 100) return blank("Temporal loss should be between 0% and 100%.");
  if (input.bufferPct < 0 || input.bufferPct > 100) return blank("Buffer requirement should be between 0% and 100%.");
  if (input.costPerAcre < 0) return blank("Cost per acre cannot be negative.");

  const d = Math.max(0, Math.min(3, input.decimals));

  // Ratio method: impact area scaled by the base ratio and by the adjustments
  // that regulators apply for distance from the impact and for the time lag
  // before the compensation site is fully functional.
  const adjustedRatio = (input.baseRatio * (1 + input.outOfServicePct / 100 + input.temporalLossPct / 100)) / practiceSpec.weight;
  const ratioRequirement = input.impactAcres * adjustedRatio;

  // Functional-equivalency method: debits are impact acres times function, and
  // each compensation acre supplies function times its credit weight.
  const functionalDebit = input.impactAcres * input.impactScore;
  const creditPerAcre = input.siteScore * practiceSpec.weight;
  const functionalRequirement = creditPerAcre > 0 ? functionalDebit / creditPerAcre : Infinity;

  const bindingRequirement = Math.max(ratioRequirement, Number.isFinite(functionalRequirement) ? functionalRequirement : 0);
  const bindingMethod = ratioRequirement >= functionalRequirement ? "Ratio method binds" : "Functional-equivalency method binds";
  const effectiveRatio = bindingRequirement / input.impactAcres;
  const bufferAcres = bindingRequirement * (input.bufferPct / 100);
  const totalAcres = bindingRequirement + bufferAcres;
  const totalCost = totalAcres * input.costPerAcre;

  const verdict =
    effectiveRatio > 4
      ? `An effective ratio of ${fmt(effectiveRatio, 2)}:1 is high — check whether a nearer compensation site or a higher-credit practice reduces the requirement`
      : `An effective ratio of ${fmt(effectiveRatio, 2)}:1 sits in the range regulators commonly require for this type of impact`;
  const verdictColor = effectiveRatio > 4 ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    { label: "Impact area", value: `${fmt(input.impactAcres, d)} acres` },
    { label: "Impact functional score", value: fmt(input.impactScore, 2) },
    { label: "Base mitigation ratio", value: `${fmt(input.baseRatio, 2)} : 1` },
    { label: `Out-of-service-area adjustment`, value: `+${fmt(input.outOfServicePct, 0)}%` },
    { label: `Temporal loss (lag to full function)`, value: `+${fmt(input.temporalLossPct, 0)}%` },
    { label: `Practice credit weight · ${practiceSpec.label.split(" (")[0]}`, value: `÷ ${fmt(practiceSpec.weight, 2)}` },
    { label: "Adjusted ratio applied", value: `${fmt(adjustedRatio, 2)} : 1` },
    { label: "Requirement by the ratio method", value: `${fmt(ratioRequirement, d)} acres`, highlight: true },
    { label: "Functional debit from the impact", value: `${fmt(functionalDebit, d)} units` },
    { label: "Credit supplied per compensation acre", value: `${fmt(creditPerAcre, d)} units` },
    { label: "Requirement by functional equivalency", value: `${fmt(functionalRequirement, d)} acres`, highlight: true },
    { label: "Binding requirement", value: `${fmt(bindingRequirement, d)} acres` },
    { label: `Buffer and upland at ${fmt(input.bufferPct, 0)}%`, value: `${fmt(bufferAcres, d)} acres` },
    { label: "Total area to secure", value: `${fmt(totalAcres, d)} acres`, highlight: true },
    { label: `Cost at ${money(input.costPerAcre, 0)} per acre`, value: money(totalCost, 0) },
  ];

  return {
    valid: true,
    errorMsg: "",
    practiceSpec,
    adjustedRatio,
    ratioRequirement,
    functionalDebit,
    creditPerAcre,
    functionalRequirement,
    bindingRequirement,
    effectiveRatio,
    bufferAcres,
    totalAcres,
    totalCost,
    bindingMethod,
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
  prefix?: string;
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
  prefix,
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
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
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

export default function WetlandMitigationRatioCalculator() {
  const [impactAcres, setImpactAcres] = useState(String(DEFAULTS.impactAcres));
  const [impactScore, setImpactScore] = useState(String(DEFAULTS.impactScore));
  const [baseRatio, setBaseRatio] = useState(String(DEFAULTS.baseRatio));
  const [siteScore, setSiteScore] = useState(String(DEFAULTS.siteScore));
  const [practice, setPractice] = useState<string>(DEFAULTS.practice);
  const [outOfServicePct, setOutOfServicePct] = useState(String(DEFAULTS.outOfServicePct));
  const [temporalLossPct, setTemporalLossPct] = useState(String(DEFAULTS.temporalLossPct));
  const [bufferPct, setBufferPct] = useState(String(DEFAULTS.bufferPct));
  const [costPerAcre, setCostPerAcre] = useState(String(DEFAULTS.costPerAcre));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): WetlandInputs => ({
    impactAcres: parseFloat(impactAcres) || 0,
    impactScore: parseFloat(impactScore) || 0,
    baseRatio: parseFloat(baseRatio) || 0,
    siteScore: parseFloat(siteScore) || 0,
    practice: practice as PracticeKey,
    outOfServicePct: parseFloat(outOfServicePct) || 0,
    temporalLossPct: parseFloat(temporalLossPct) || 0,
    bufferPct: parseFloat(bufferPct) || 0,
    costPerAcre: parseFloat(costPerAcre) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<WetlandInputs>(() => DEFAULTS);
  const [results, setResults] = useState<WetlandResult>(() => calculateWetland(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateWetland(inputs));
  };

  const reset = () => {
    setImpactAcres(String(DEFAULTS.impactAcres));
    setImpactScore(String(DEFAULTS.impactScore));
    setBaseRatio(String(DEFAULTS.baseRatio));
    setSiteScore(String(DEFAULTS.siteScore));
    setPractice(DEFAULTS.practice);
    setOutOfServicePct(String(DEFAULTS.outOfServicePct));
    setTemporalLossPct(String(DEFAULTS.temporalLossPct));
    setBufferPct(String(DEFAULTS.bufferPct));
    setCostPerAcre(String(DEFAULTS.costPerAcre));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateWetland(DEFAULTS));
  };

  const impactNum = parseFloat(impactAcres);
  const impactScoreNum = parseFloat(impactScore);
  const ratioNum = parseFloat(baseRatio);
  const siteNum = parseFloat(siteScore);

  const errors = {
    impactAcres: !Number.isFinite(impactNum) || impactNum <= 0 ? "Must be greater than zero" : "",
    impactScore: !Number.isFinite(impactScoreNum) || impactScoreNum <= 0 || impactScoreNum > 1 ? "Use 0.01–1.00" : "",
    baseRatio: !Number.isFinite(ratioNum) || ratioNum <= 0 ? "Must be greater than zero" : "",
    siteScore: !Number.isFinite(siteNum) || siteNum <= 0 || siteNum > 1 ? "Use 0.01–1.00" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is a wetland mitigation ratio?",
      answer:
        "It is the number of acres of compensation wetland required for each acre of wetland impacted — written as 2:1, 3:1 and so on. The ratio exists because a newly created wetland does not replace a mature one immediately, because the compensation site is often some distance from the impact and because some replacement practices produce less function per acre than others. A ratio of 2:1 with adjustments typically produces an effective requirement well above two.",
    },
    {
      question: "How do functional assessment scores change the answer?",
      answer:
        "A functional assessment such as the hydrogeomorphic method scores a wetland between zero and one on the functions it performs — water storage, nutrient cycling, habitat. Debits are the impact acres multiplied by the impact score, and credits are the compensation acres multiplied by their score. High-function impact and a low-function replacement site can push the requirement far above the nominal ratio, which is why regulators now commonly work in functional units rather than acres alone.",
    },
    {
      question: "Why does the practice type matter?",
      answer:
        "Because re-establishing a wetland from scratch, restoring a degraded one, enhancing an existing one and simply preserving one produce very different amounts of function per acre. Preservation is typically credited at a small fraction of a re-established acre, often around ten percent, while restoration earns close to full credit. Selecting the practice in the calculator applies that credit weight to the requirement, which is where large differences in project cost come from.",
    },
    {
      question: "Is the buffer area counted as mitigation?",
      answer:
        "Usually not as wetland credit, but it is nearly always required. Upland buffers of fifty to a hundred feet are standard around compensation wetlands to protect hydrology and water quality, and though they are secured and managed, they typically earn no wetland credit. The calculator separates the credited area from the buffer so the land you must buy, fence and manage is not confused with the credit you can sell or retire.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/calculator#environment" },
          { label: "Wetland Mitigation Ratio Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Wetland Mitigation Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Impact & Ratio">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="impact-acres"
                  label="Impact Area"
                  value={impactAcres}
                  onChange={setImpactAcres}
                  onEnter={runCalculate}
                  min="0.01"
                  step="any"
                  suffix="acres"
                  error={errors.impactAcres}
                  tooltip="Wetland area that will be permanently or temporarily affected."
                />
                <CompactInput
                  id="impact-score"
                  label="Impact Functional Score"
                  value={impactScore}
                  onChange={setImpactScore}
                  onEnter={runCalculate}
                  min="0.01"
                  max="1"
                  step="0.01"
                  error={errors.impactScore}
                  hint="0–1 from a functional assessment such as HGM."
                  tooltip="Function lost per acre of impact."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="base-ratio"
                  label="Base Mitigation Ratio"
                  value={baseRatio}
                  onChange={setBaseRatio}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix=": 1"
                  error={errors.baseRatio}
                  hint="2:1 is common for in-kind replacement."
                  tooltip="Ratio required before adjustments."
                />
                <CompactInput
                  id="site-score"
                  label="Compensation Site Score"
                  value={siteScore}
                  onChange={setSiteScore}
                  onEnter={runCalculate}
                  min="0.01"
                  max="1"
                  step="0.01"
                  error={errors.siteScore}
                  hint="Expected function of the replacement wetland."
                  tooltip="Function supplied per acre at the compensation site."
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
                  <SubSection title="Practice & Adjustments">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactSelect
                        id="practice"
                        label="Compensation Practice"
                        value={practice}
                        onChange={setPractice}
                        options={PRACTICES.map((p) => ({ value: p.key, label: p.label }))}
                        tooltip="Sets the credit weight applied per acre."
                      />
                      <CompactInput
                        id="service-area"
                        label="Service-Area Adjustment"
                        value={outOfServicePct}
                        onChange={setOutOfServicePct}
                        onEnter={runCalculate}
                        min="0"
                        max="200"
                        step="any"
                        suffix="%"
                        tooltip="Extra requirement when the compensation site sits outside the impact's service area."
                      />
                      <CompactInput
                        id="temporal-loss"
                        label="Temporal Loss"
                        value={temporalLossPct}
                        onChange={setTemporalLossPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Adjustment for the lag before the compensation wetland reaches full function."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Buffer & Cost">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="buffer"
                        label="Buffer & Upland"
                        value={bufferPct}
                        onChange={setBufferPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="any"
                        suffix="%"
                        tooltip="Upland buffer secured around the credit area, normally earning no credit."
                      />
                      <CompactInput
                        id="cost-per-acre"
                        label="Cost per Acre"
                        value={costPerAcre}
                        onChange={setCostPerAcre}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        tooltip="Land, design, construction and monitoring per acre."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="3"
                        step="1"
                        tooltip="Decimal places used for area figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Mitigation Required</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.bindingRequirement, calcInputs.decimals)} acres` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.effectiveRatio, 2)}:1 effective for ${fmt(calcInputs.impactAcres, 2)} acres of impact, plus ${fmt(results.bufferAcres, calcInputs.decimals)} acres of buffer`
                  : "Fix the highlighted inputs to size the mitigation"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Functional Debit</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.functionalDebit, 2)} units` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Effective Ratio</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.effectiveRatio, 2)}:1` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Area</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.totalAcres, 2)} acres` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Mitigation Step</th>
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
                        Enter the impact and compensation details to size the requirement.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Credited acres required</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {fmt(results.bindingRequirement, calcInputs.decimals)}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Impact area</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.impactAcres, 2)} acres` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Base ratio</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.baseRatio, 2)}:1` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Adjusted ratio</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.adjustedRatio, 2)}:1` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ratio method</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.ratioRequirement, 2)} acres` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Functional method</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && Number.isFinite(results.functionalRequirement)
                      ? `${fmt(results.functionalRequirement, 2)} acres`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Binding method</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? results.bindingMethod : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Buffer area</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.bufferAcres, 2)} acres` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Estimated cost</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.totalCost, 0) : "—"}</span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Wetland Mitigation Ratio Calculator?</h2>
            <p>
              A wetland mitigation ratio calculator works out how much compensation wetland a project must secure for the wetland it
              impacts. It applies the base ratio used by regulators, adjusts it for distance from the impact and for the lag before a
              new wetland functions, weights it by the type of compensation practice, and cross-checks the answer with the functional-
              equivalency method that compares function lost with function supplied per acre.
            </p>
            <p>
              Ratios are quoted as a single figure such as 2:1, but the number that matters is the effective ratio after adjustments,
              because that is what determines how much land must be bought, restored and monitored. Projects routinely start with a
              nominal 2:1 requirement and end up closer to 4:1 once service-area, temporal and practice adjustments are applied.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The ratio method multiplies the impact area by the base ratio and then by the adjustment factors. An out-of-service-area
              adjustment applies when the compensation site cannot replace the functions lost at the impact location, commonly twenty to
              fifty percent, and a temporal loss adjustment applies because a restored wetland takes years to reach full function — often
              ten to twenty percent. The sum is then divided by the practice credit weight, since preservation earns only a fraction of a
              credit per acre while re-establishment earns full credit.
            </p>
            <p>
              The functional method starts from the same data but works in functional units. Debits are the impact acres multiplied by
              the impact functional score from a hydrogeomorphic or similar assessment, and credits are compensation acres multiplied by
              the score of the replacement site and the practice weight. Dividing debits by credits per acre gives the acres required to
              replace function rather than area, and the larger of the two methods is the binding requirement — which is why the
              calculator reports both and names the one that governs.
            </p>
            <p>
              Buffer and upland requirements are then added as a percentage of the credited area. These acres are secured and managed but
              usually earn no wetland credit, so separating them from the credited figure matters for both cost estimating and for the
              instrument used to satisfy the requirement, whether that is a permittee-responsible site, a mitigation bank or an in-lieu
              fee programme.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the credited area required after adjustments, with the effective ratio and the buffer area in the
              subtext. The three-stat bar shows the functional debit in units, the effective ratio and the total land area, so the scale
              of the obligation is clear before reading the detail.
            </p>
            <p>
              The breakdown table lists the impact, the base ratio, each adjustment, the practice weight, the requirement from both
              methods, the binding figure, the buffer and the estimated cost. The summary panel reports both requirements side by side,
              which method binds, the buffer area and the total cost at the per-acre figure you supplied.
            </p>
            <p>
              Every jurisdiction sets its own ratios, adjustments, credit weights and buffer standards, and many allow in-lieu fee
              payment rather than land acquisition. Use this calculator to size the obligation and to see which adjustment is driving it,
              then confirm the figures against the specific guidance of the district or state agency issuing the permit, and against a
              functional assessment performed by a qualified ecologist rather than estimated from a desk.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/wetland-mitigation-ratio-calculator" />
          <PopularCalculators exclude="/calculator/wetland-mitigation-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
