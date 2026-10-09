"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type VClass = "sedan" | "suv" | "truck" | "luxury" | "electric";
type Condition = "excellent" | "good" | "fair" | "poor";

interface ResaleInputs {
  originalPrice: number;
  ageYears: number;
  vehicleClass: VClass;
  actualMiles: number;
  condition: Condition;
  decimals: number;
}

const DEFAULTS: ResaleInputs = {
  originalPrice: 38000,
  ageYears: 4,
  vehicleClass: "suv",
  actualMiles: 54000,
  condition: "good",
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";
const money = (v: number, d = 0) => (Number.isFinite(v) ? "$" + fmt(v, d) : "—");

const CLASS_OPTIONS = [
  { value: "sedan", label: "Sedan / hatchback" },
  { value: "suv", label: "SUV / crossover" },
  { value: "truck", label: "Pickup truck" },
  { value: "luxury", label: "Luxury / performance" },
  { value: "electric", label: "Electric vehicle" },
];

const CONDITION_OPTIONS = [
  { value: "excellent", label: "Excellent — like new" },
  { value: "good", label: "Good — normal wear" },
  { value: "fair", label: "Fair — visible wear" },
  { value: "poor", label: "Poor — needs work" },
];

const DECIMAL_OPTIONS = [
  { value: "0", label: "Whole dollars" },
  { value: "2", label: "2 decimals" },
];

/** Share of original price remaining by age (years 0–10), per vehicle class. */
const CURVES: Record<VClass, number[]> = {
  sedan: [100, 78, 66, 57, 49, 43, 38, 34, 30, 27, 25],
  suv: [100, 80, 69, 60, 53, 47, 42, 38, 35, 32, 29],
  truck: [100, 82, 72, 64, 58, 52, 47, 43, 39, 36, 33],
  luxury: [100, 72, 60, 50, 43, 38, 34, 30, 27, 25, 23],
  electric: [100, 74, 62, 52, 45, 40, 36, 32, 29, 26, 24],
};

const CONDITION_MULT: Record<Condition, number> = {
  excellent: 1.06,
  good: 1.0,
  fair: 0.88,
  poor: 0.72,
};

const EXPECTED_ANNUAL_MILES = 13500;

function remainingPct(cls: VClass, age: number): number {
  const c = CURVES[cls];
  if (age <= 0) return c[0];
  if (age >= 10) return c[10];
  const lo = Math.floor(age);
  const hi = Math.ceil(age);
  const t = age - lo;
  return c[lo] + t * (c[hi] - c[lo]);
}

interface ResaleResult {
  valid: boolean;
  errorMsg: string;
  remaining: number;
  mileageAdjPct: number;
  conditionMult: number;
  resaleValue: number;
  depreciation: number;
  depreciationPct: number;
  avgAnnualDep: number;
  expectedMiles: number;
  proj1: number;
  proj2: number;
  proj3: number;
  verdict: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

function calculateResale(i: ResaleInputs): ResaleResult {
  const blank = (errorMsg: string): ResaleResult => ({
    valid: false,
    errorMsg,
    remaining: 0,
    mileageAdjPct: 0,
    conditionMult: 1,
    resaleValue: 0,
    depreciation: 0,
    depreciationPct: 0,
    avgAnnualDep: 0,
    expectedMiles: 0,
    proj1: 0,
    proj2: 0,
    proj3: 0,
    verdict: "",
    breakdown: [],
  });

  const nums = [i.originalPrice, i.ageYears, i.actualMiles, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field.");
  if (i.originalPrice < 3000 || i.originalPrice > 1000000) return blank("Original price should be between $3,000 and $1,000,000.");
  if (i.ageYears < 0 || i.ageYears > 25) return blank("Vehicle age should be between 0 and 25 years.");
  if (i.actualMiles < 0 || i.actualMiles > 1000000) return blank("Odometer should be between 0 and 1,000,000 miles.");

  const expectedMiles = Math.max(1, i.ageYears * EXPECTED_ANNUAL_MILES);
  const mileageDelta = expectedMiles - i.actualMiles; // positive = fewer miles than average
  const mileageAdjPct = Math.max(-20, Math.min(20, (mileageDelta / 1000) * 1.5));

  const remaining = remainingPct(i.vehicleClass, i.ageYears);
  const conditionMult = CONDITION_MULT[i.condition];
  const raw = i.originalPrice * (remaining / 100) * (1 + mileageAdjPct / 100) * conditionMult;
  const resaleValue = Math.max(i.originalPrice * 0.03, raw);

  const depreciation = i.originalPrice - resaleValue;
  const depreciationPct = (depreciation / i.originalPrice) * 100;
  const avgAnnualDep = i.ageYears > 0 ? depreciation / i.ageYears : 0;

  const proj1 = Math.max(i.originalPrice * 0.03, i.originalPrice * (remainingPct(i.vehicleClass, i.ageYears + 1) / 100));
  const proj2 = Math.max(i.originalPrice * 0.03, i.originalPrice * (remainingPct(i.vehicleClass, i.ageYears + 2) / 100));
  const proj3 = Math.max(i.originalPrice * 0.03, i.originalPrice * (remainingPct(i.vehicleClass, i.ageYears + 3) / 100));

  const verdict =
    mileageAdjPct <= -10
      ? `At ${fmt(i.actualMiles, 0)} miles the odometer runs well past the ${fmt(expectedMiles, 0)}-mile average for its age, costing roughly ${fmt(Math.abs(mileageAdjPct), 0)}% of value`
      : mileageAdjPct >= 10
        ? `At ${fmt(i.actualMiles, 0)} miles the car has been driven far less than the ${fmt(expectedMiles, 0)}-mile average for its age, adding roughly ${fmt(mileageAdjPct, 0)}% to value`
        : `At ${fmt(i.actualMiles, 0)} miles the odometer sits close to the ${fmt(expectedMiles, 0)}-mile average for its age, so mileage barely moves the number`;

  const d = Math.max(0, Math.min(2, i.decimals));
  const breakdown = [
    { label: "Original price", value: money(i.originalPrice, d) },
    { label: `Age: ${fmt(i.ageYears, 0)} year${i.ageYears === 1 ? "" : "s"} · ${i.vehicleClass === "suv" ? "SUV" : i.vehicleClass}`, value: `${fmt(remaining, 1)}% of value remaining` },
    { label: `Odometer ${fmt(i.actualMiles, 0)} mi vs ${fmt(expectedMiles, 0)} expected`, value: `${mileageAdjPct >= 0 ? "+" : ""}${fmt(mileageAdjPct, 1)}% mileage adjustment`, highlight: true },
    { label: `Condition: ${i.condition}`, value: `× ${fmt(conditionMult, 2)}` },
    { label: "Estimated resale value", value: money(resaleValue, d), highlight: true },
    { label: "Total depreciation so far", value: `−${money(depreciation, d)} (${fmt(depreciationPct, 1)}%)` },
    { label: "Average depreciation per year owned", value: money(avgAnnualDep, d) },
    { label: "Value in 1 year (curve only)", value: money(proj1, d) },
    { label: "Value in 2 years (curve only)", value: money(proj2, d) },
    { label: "Value in 3 years (curve only)", value: money(proj3, d) },
    { label: "First-year loss if sold new tomorrow", value: `−${money(i.originalPrice * (1 - CURVES[i.vehicleClass][1] / 100), d)}` },
  ];

  return {
    valid: true,
    errorMsg: "",
    remaining,
    mileageAdjPct,
    conditionMult,
    resaleValue,
    depreciation,
    depreciationPct,
    avgAnnualDep,
    expectedMiles,
    proj1,
    proj2,
    proj3,
    verdict,
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

export default function CarResaleValueCalculator() {
  const [originalPrice, setOriginalPrice] = useState(String(DEFAULTS.originalPrice));
  const [ageYears, setAgeYears] = useState(String(DEFAULTS.ageYears));
  const [vehicleClass, setVehicleClass] = useState(String(DEFAULTS.vehicleClass));
  const [actualMiles, setActualMiles] = useState(String(DEFAULTS.actualMiles));
  const [condition, setCondition] = useState(String(DEFAULTS.condition));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ResaleInputs => ({
    originalPrice: parseFloat(originalPrice) || 0,
    ageYears: parseFloat(ageYears) || 0,
    vehicleClass: (vehicleClass as VClass) || "suv",
    actualMiles: parseFloat(actualMiles) || 0,
    condition: (condition as Condition) || "good",
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<ResaleInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ResaleResult>(() => calculateResale(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateResale(inputs));
  };

  const reset = () => {
    setOriginalPrice(String(DEFAULTS.originalPrice));
    setAgeYears(String(DEFAULTS.ageYears));
    setVehicleClass(String(DEFAULTS.vehicleClass));
    setActualMiles(String(DEFAULTS.actualMiles));
    setCondition(String(DEFAULTS.condition));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateResale(DEFAULTS));
  };

  const priceNum = parseFloat(originalPrice);
  const ageNum = parseFloat(ageYears);

  const errors = {
    originalPrice: !Number.isFinite(priceNum) || priceNum < 3000 ? "Enter $3,000 or more" : "",
    ageYears: !Number.isFinite(ageNum) || ageNum < 0 || ageNum > 25 ? "Enter 0–25 years" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const d = Math.max(0, Math.min(2, calcInputs.decimals || 0));

  const faqs = [
    {
      question: "Which vehicles hold their value best?",
      answer:
        "Pickup trucks hold value better than any other mainstream class — a five-year-old truck routinely keeps half its original price, driven by sustained demand and long service lives. Luxury and performance cars sit at the other end: steep first-year drops of 25 to 30% are normal because the buyers who want them new are the only ones willing to pay the new premium. SUVs and crossovers hold slightly better than sedans, and electric vehicles currently depreciate faster than comparable gasoline models as battery technology and range improve year over year.",
    },
    {
      question: "How much does mileage change resale value?",
      answer:
        "The market anchors on about 13,500 miles per year of age. A car driven meaningfully less commands a premium and one driven meaningfully less well — a discount — with the adjustment working out to roughly 1.5% of value per 1,000 miles of deviation, capped around 20% either way because extreme figures usually signal something else worth investigating. The key word is average: a 4-year-old car with 90,000 miles is not worn out, it is simply above the curve, and the discount reflects the miles already consumed rather than any single defect.",
    },
    {
      question: "Why does the biggest drop happen in year one?",
      answer:
        "The moment a car is titled to a second owner it stops being 'new', and the market will not pay the new-car premium for a used car regardless of condition. Registration fees, destination charges and dealer markups evaporate too. That 20 to 28% first-year cliff is why buying a one- or two-year-old vehicle is chronically the best value play in motoring — someone else absorbed the steepest depreciation while the car itself has barely aged mechanically.",
    },
    {
      question: "How accurate is a depreciation-curve estimate against real listings?",
      answer:
        "Curve-based estimates land in the right neighbourhood but no model sees the specifics that move individual cars: colour, trim, options, service history, local market, and whether the model is in season. Use the estimate as a baseline before shopping listings for the exact model, and expect the final number to be negotiated within a band around it. Private-party sales typically run 10 to 15% above trade-in, because the dealer must recondition and resell the car at a profit.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Car Resale Value Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Resale Value Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Vehicle & Age">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="price"
                  label="Original Price"
                  value={originalPrice}
                  onChange={setOriginalPrice}
                  onEnter={runCalculate}
                  min="3000"
                  max="1000000"
                  step="500"
                  error={errors.originalPrice}
                  hint="MSRP or price paid new."
                  tooltip="The vehicle's original sticker or purchase price."
                />
                <CompactInput
                  id="age"
                  label="Vehicle Age"
                  value={ageYears}
                  onChange={setAgeYears}
                  onEnter={runCalculate}
                  min="0"
                  max="25"
                  step="1"
                  suffix="yrs"
                  error={errors.ageYears}
                  tooltip="Years since first sale — partial years are interpolated."
                />
              </div>
            </SubSection>

            <SubSection title="Class & Use">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="class"
                  label="Vehicle Class"
                  value={vehicleClass}
                  onChange={setVehicleClass}
                  options={CLASS_OPTIONS}
                  tooltip="Class sets the depreciation curve — trucks hold value best, luxury worst."
                />
                <CompactInput
                  id="miles"
                  label="Odometer"
                  value={actualMiles}
                  onChange={setActualMiles}
                  onEnter={runCalculate}
                  min="0"
                  max="1000000"
                  step="1000"
                  suffix="mi"
                  tooltip="Current odometer reading; compared against 13,500 miles per year of age."
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
                  <SubSection title="Condition & Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="condition"
                        label="Condition"
                        value={condition}
                        onChange={setCondition}
                        options={CONDITION_OPTIONS}
                        tooltip="Excellent ×1.06, good ×1.00, fair ×0.88, poor ×0.72."
                      />
                      <CompactSelect
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        options={DECIMAL_OPTIONS}
                        tooltip="Decimal places shown on money figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated Resale Value</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.resaleValue, d) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.remaining, 0)}% of original value at ${fmt(calcInputs.ageYears, 0)} years · ${results.verdict.split(",")[0]}`
                  : "Enter the price, age and mileage to estimate value"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Depreciation</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.depreciationPct, 0)}%` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Year Owned</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.avgAnnualDep, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Value in 2 Years</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.proj2, 0) : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Item</th>
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
                        Enter the vehicle details to build the valuation.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Expected value retention</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(100 - results.depreciationPct, 1)}% kept · ${fmt(results.expectedMiles, 0)} mi expected`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Resale value</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.resaleValue, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Value retained</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(100 - results.depreciationPct, 1)}%` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Total depreciation</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.depreciation, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Average per year</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.avgAnnualDep, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Mileage adjustment</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.mileageAdjPct >= 0 ? "+" : ""}${fmt(results.mileageAdjPct, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Condition multiplier</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `× ${fmt(results.conditionMult, 2)}` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected, +1 year</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.proj1, d) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Projected, +3 years</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? money(results.proj3, d) : "—"}</span>
                </div>
              </div>
              {results.valid && <p className="text-[11px] mt-3 font-semibold text-muted-foreground">{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Car Resale Value Calculator?</h2>
            <p>
              A car resale value calculator estimates what a vehicle is worth today from four things the used market actually prices:
              what it cost new, how old it is, what class it belongs to, and how it has been used and kept. Depreciation is the single
              largest cost of owning a car — typically exceeding fuel, insurance and maintenance combined over the first five years —
              yet it is the one cost that never appears on a receipt, which is why estimating it before purchase or sale pays.
            </p>
            <p>
              The calculator applies class-specific depreciation curves, adjusts for the odometer against the 13,500-miles-per-year
              market expectation, and applies a condition multiplier. The output is a realistic private-party baseline rather than a
              guarantee: individual trims, options and local markets move around it, but rarely by enormous margins.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Each vehicle class carries a curve of the share of original price remaining at each age, built from observed market
              behaviour: pickups retain value best (a five-year-old truck commonly keeps half its price), SUVs and sedans follow the
              middle path, luxury cars fall fastest because the buyers who want them new will not pay the premium used, and electric
              vehicles currently shed value slightly quicker as each model year brings more range. Age is interpolated between the
              anchor points, so partial years work.
            </p>
            <p>
              Mileage enters as a deviation from the age-based expectation of about 13,500 miles a year: each 1,000 miles below average
              adds roughly 1.5% to value, each 1,000 above subtracts it, with the adjustment capped at ±20% because extreme odometers
              usually signal something the curve cannot see. Condition then multiplies through — excellent ×1.06, good ×1.00, fair
              ×0.88, poor ×0.72 — and a floor at 3% of the original price keeps very old vehicles from resolving to zero. The table
              also projects one to three years forward on the curve alone, which is the honest way to answer "should I sell now or
              keep driving it".
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the estimated resale value, with the retention percentage and mileage verdict beneath. The three-stat
              bar carries total depreciation, the average annual cost of depreciation, and the projected value in two years. Read the
              projections against ownership intent: if the +1-year figure minus its running costs is smaller than the payment on a
              replacement, keeping the car is usually the better financial deal, because the steepest depreciation years are already
              behind it.
            </p>
            <p>
              Remember the two prices every used car really has. The private-party figure this calculator estimates is what you can
              expect selling to another driver, typically 10 to 15% above what a dealer will offer on trade-in, because the dealer must
              recondition and resell at a profit. And no curve sees the car itself: a documented service history, a sought-after colour
              or a rare trim can beat the estimate, while a rebuilt title or neglected maintenance can halve it. Use the number as the
              centre of the negotiating band, not the final word — and check live listings for the exact model before setting an asking
              price.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-resale-value-calculator" />
          <PopularCalculators exclude="/calculator/car-resale-value-calculator" />
        </div>
      </div>
    </>
  );
}
