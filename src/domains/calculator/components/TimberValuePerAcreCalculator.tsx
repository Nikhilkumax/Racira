"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type PriceBasis = "stumpage" | "delivered";

interface TimberInputs {
  volumeTons: number;
  pricePerTon: number;
  rotationYears: number;
  priceBasis: PriceBasis;
  boardFeetPerTon: number;
  sitePrepCost: number;
  annualCost: number;
  loggingPerTon: number;
  thinningRevenue: number;
  thinningYear: number;
  discountRatePct: number;
  acres: number;
  decimals: number;
}

const DEFAULTS: TimberInputs = {
  volumeTons: 35,
  pricePerTon: 45,
  rotationYears: 35,
  priceBasis: "stumpage",
  boardFeetPerTon: 150,
  sitePrepCost: 350,
  annualCost: 12,
  loggingPerTon: 22,
  thinningRevenue: 0,
  thinningYear: 15,
  discountRatePct: 5,
  acres: 40,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const money = (v: number, d = 0) => `$${fmt(v, d)}`;

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface TimberResult {
  valid: boolean;
  errorMsg: string;
  grossPerAcre: number;
  netPerAcre: number;
  netPerTon: number;
  totalNet: number;
  boardFeet: number;
  mbfPerAcre: number;
  pricePerMbf: number;
  harvestYear: number;
  annuityCost: number;
  pvThinning: number;
  pvHarvest: number;
  npvPerAcre: number;
  annualisedPct: number;
  breakEvenPrice: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateTimber(input: TimberInputs, currentYear: number): TimberResult {
  const blank = (errorMsg: string): TimberResult => ({
    valid: false,
    errorMsg,
    grossPerAcre: 0,
    netPerAcre: 0,
    netPerTon: 0,
    totalNet: 0,
    boardFeet: 0,
    mbfPerAcre: 0,
    pricePerMbf: 0,
    harvestYear: currentYear,
    annuityCost: 0,
    pvThinning: 0,
    pvHarvest: 0,
    npvPerAcre: 0,
    annualisedPct: 0,
    breakEvenPrice: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.volumeTons,
    input.pricePerTon,
    input.rotationYears,
    input.boardFeetPerTon,
    input.sitePrepCost,
    input.annualCost,
    input.loggingPerTon,
    input.thinningRevenue,
    input.thinningYear,
    input.discountRatePct,
    input.acres,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to value the stand.");
  if (input.volumeTons <= 0) return blank("Volume per acre must be greater than zero.");
  if (input.pricePerTon <= 0) return blank("Timber price must be greater than zero.");
  if (input.rotationYears <= 0 || input.rotationYears > 120) return blank("Rotation age should be between 1 and 120 years.");
  if (input.boardFeetPerTon <= 0) return blank("Board feet per ton must be greater than zero.");
  if (input.acres <= 0) return blank("Acreage must be greater than zero.");
  if (input.thinningYear <= 0 || input.thinningYear >= input.rotationYears) {
    return blank("The thinning year must fall inside the rotation.");
  }
  const nonNegative = [
    input.sitePrepCost,
    input.annualCost,
    input.loggingPerTon,
    input.thinningRevenue,
    input.discountRatePct,
  ];
  if (nonNegative.some((v) => v < 0)) return blank("Costs and the discount rate cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const isStumpage = input.priceBasis === "stumpage";

  // A stumpage sale leaves harvesting with the buyer, so the logging and haul
  // cost is only deducted when the owner sells on a delivered basis.
  const loggingCostPerAcre = isStumpage ? 0 : input.loggingPerTon * input.volumeTons;
  const grossPerAcre = input.pricePerTon * input.volumeTons;
  const netPerAcre = grossPerAcre - loggingCostPerAcre - input.sitePrepCost - input.annualCost * input.rotationYears;
  const netPerTon = netPerAcre / input.volumeTons;
  const totalNet = netPerAcre * input.acres;

  const boardFeet = input.volumeTons * input.boardFeetPerTon;
  const mbfPerAcre = boardFeet / 1000;
  const pricePerMbf = mbfPerAcre > 0 ? grossPerAcre / mbfPerAcre : 0;

  const r = input.discountRatePct / 100;
  const discount = (amount: number, years: number) => (r > 0 ? amount / Math.pow(1 + r, years) : amount);
  const pvThinning = discount(input.thinningRevenue, input.thinningYear);
  const pvHarvest = discount(grossPerAcre - loggingCostPerAcre, input.rotationYears);
  // Annual management and tax costs form an annuity over the rotation.
  const annuityCost =
    r > 0
      ? (input.annualCost * (1 - Math.pow(1 + r, -input.rotationYears))) / r
      : input.annualCost * input.rotationYears;
  const npvPerAcre = pvHarvest + pvThinning - annuityCost - input.sitePrepCost;

  // Compound annual return on the establishment cost, once the thinning and
  // harvest income is credited and the annual costs debited.
  const totalIncome = pvHarvest + pvThinning - annuityCost;
  const annualisedPct =
    input.sitePrepCost > 0 && totalIncome > 0
      ? (Math.pow(totalIncome / input.sitePrepCost, 1 / input.rotationYears) - 1) * 100
      : 0;

  const baseCosts = input.sitePrepCost + input.annualCost * input.rotationYears;
  const breakEvenPrice =
    input.volumeTons > 0 ? (baseCosts + loggingCostPerAcre) / input.volumeTons : 0;

  const harvestYear = currentYear + Math.round(input.rotationYears);
  const verdict =
    npvPerAcre > 0
      ? `Positive present value of ${money(npvPerAcre, d)} per acre at a ${fmt(input.discountRatePct, 1)}% discount rate`
      : `Negative present value of ${money(Math.abs(npvPerAcre), d)} per acre — the rotation does not clear the discount rate`;
  const verdictColor = npvPerAcre > 0 ? "text-emerald-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    { label: "Volume per acre", value: `${fmt(input.volumeTons, 1)} tons · ${fmt(mbfPerAcre, 2)} MBF` },
    { label: "Price basis", value: isStumpage ? "Stumpage (standing timber)" : "Delivered (roadside)" },
    { label: "Gross revenue per acre", value: money(grossPerAcre, d), highlight: true },
    { label: "Implied price per MBF", value: money(pricePerMbf, 2) },
    { label: isStumpage ? "Logging & haul (buyer's cost)" : "Logging & haul cost", value: money(loggingCostPerAcre, d) },
    { label: "Site preparation & seedlings", value: `−${money(input.sitePrepCost, d)}` },
    {
      label: `Management, tax & insurance · ${fmt(input.rotationYears, 0)} years`,
      value: `−${money(input.annualCost * input.rotationYears, d)}`,
    },
    { label: "Thinning revenue (discounted to today)", value: money(pvThinning, d) },
    { label: "Net value per acre (nominal)", value: money(netPerAcre, d), highlight: true },
    { label: "Net value per ton", value: money(netPerTon, 2) },
    { label: "Present value of the harvest", value: money(pvHarvest, d) },
    { label: "Net present value per acre", value: money(npvPerAcre, d), highlight: true },
    { label: "Break-even price per ton", value: money(breakEvenPrice, 2) },
    { label: "Harvest year at this rotation age", value: String(harvestYear) },
  ];

  return {
    valid: true,
    errorMsg: "",
    grossPerAcre,
    netPerAcre,
    netPerTon,
    totalNet,
    boardFeet,
    mbfPerAcre,
    pricePerMbf,
    harvestYear,
    annuityCost,
    pvThinning,
    pvHarvest,
    npvPerAcre,
    annualisedPct,
    breakEvenPrice,
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

export default function TimberValuePerAcreCalculator() {
  const currentYear = new Date().getFullYear();
  const [volumeTons, setVolumeTons] = useState(String(DEFAULTS.volumeTons));
  const [pricePerTon, setPricePerTon] = useState(String(DEFAULTS.pricePerTon));
  const [rotationYears, setRotationYears] = useState(String(DEFAULTS.rotationYears));
  const [priceBasis, setPriceBasis] = useState<string>(DEFAULTS.priceBasis);
  const [boardFeetPerTon, setBoardFeetPerTon] = useState(String(DEFAULTS.boardFeetPerTon));
  const [sitePrepCost, setSitePrepCost] = useState(String(DEFAULTS.sitePrepCost));
  const [annualCost, setAnnualCost] = useState(String(DEFAULTS.annualCost));
  const [loggingPerTon, setLoggingPerTon] = useState(String(DEFAULTS.loggingPerTon));
  const [thinningRevenue, setThinningRevenue] = useState(String(DEFAULTS.thinningRevenue));
  const [thinningYear, setThinningYear] = useState(String(DEFAULTS.thinningYear));
  const [discountRatePct, setDiscountRatePct] = useState(String(DEFAULTS.discountRatePct));
  const [acres, setAcres] = useState(String(DEFAULTS.acres));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): TimberInputs => ({
    volumeTons: parseFloat(volumeTons) || 0,
    pricePerTon: parseFloat(pricePerTon) || 0,
    rotationYears: parseFloat(rotationYears) || 0,
    priceBasis: priceBasis as PriceBasis,
    boardFeetPerTon: parseFloat(boardFeetPerTon) || 0,
    sitePrepCost: parseFloat(sitePrepCost) || 0,
    annualCost: parseFloat(annualCost) || 0,
    loggingPerTon: parseFloat(loggingPerTon) || 0,
    thinningRevenue: parseFloat(thinningRevenue) || 0,
    thinningYear: parseFloat(thinningYear) || 0,
    discountRatePct: parseFloat(discountRatePct) || 0,
    acres: parseFloat(acres) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<TimberInputs>(() => DEFAULTS);
  const [results, setResults] = useState<TimberResult>(() => calculateTimber(DEFAULTS, currentYear));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateTimber(inputs, currentYear));
  };

  const reset = () => {
    setVolumeTons(String(DEFAULTS.volumeTons));
    setPricePerTon(String(DEFAULTS.pricePerTon));
    setRotationYears(String(DEFAULTS.rotationYears));
    setPriceBasis(DEFAULTS.priceBasis);
    setBoardFeetPerTon(String(DEFAULTS.boardFeetPerTon));
    setSitePrepCost(String(DEFAULTS.sitePrepCost));
    setAnnualCost(String(DEFAULTS.annualCost));
    setLoggingPerTon(String(DEFAULTS.loggingPerTon));
    setThinningRevenue(String(DEFAULTS.thinningRevenue));
    setThinningYear(String(DEFAULTS.thinningYear));
    setDiscountRatePct(String(DEFAULTS.discountRatePct));
    setAcres(String(DEFAULTS.acres));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateTimber(DEFAULTS, currentYear));
  };

  const volumeNum = parseFloat(volumeTons);
  const priceNum = parseFloat(pricePerTon);
  const rotationNum = parseFloat(rotationYears);
  const acresNum = parseFloat(acres);

  const errors = {
    volumeTons: !Number.isFinite(volumeNum) || volumeNum <= 0 ? "Must be greater than zero" : "",
    pricePerTon: !Number.isFinite(priceNum) || priceNum <= 0 ? "Must be greater than zero" : "",
    rotationYears: !Number.isFinite(rotationNum) || rotationNum <= 0 ? "Must be greater than zero" : "",
    acres: !Number.isFinite(acresNum) || acresNum <= 0 ? "Must be greater than zero" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is stumpage and how does it change the value?",
      answer:
        "Stumpage is the price paid for standing timber, with the buyer taking on felling, skidding and haulage. A delivered or roadside price is higher because it includes those operations, so comparing the two without adjusting for the logging cost is a common and expensive mistake. This calculator deducts logging and haul only when the delivered basis is selected, which keeps the net figure comparable across the two ways of selling.",
    },
    {
      question: "How much timber is on an acre?",
      answer:
        "A well-stocked acre of mature softwood sawtimber commonly carries 25 to 50 tons of merchantable volume, which is roughly 4 to 8 thousand board feet depending on species, form and utilisation standards. Hardwood stands, plantation thinnings and poorly stocked woodlots sit well below that, and the board-feet-per-ton factor is the single most regionally variable number in the calculation, so it deserves a local figure rather than a default.",
    },
    {
      question: "Why discount the harvest back to today?",
      answer:
        "Because a dollar received in thirty-five years is not worth a dollar today. Discounting at five percent shrinks a harvest value by about 82 percent over that period, which is why long rotations only make sense when growth adds value faster than the discount rate erodes it. Present value per acre is the number to compare against other uses of the land, such as leasing, farming or development.",
    },
    {
      question: "What does break-even price per ton tell me?",
      answer:
        "It is the price at which the stand's revenue covers establishment, annual carrying costs and any logging cost, producing zero net value. Tracking it against current market prices shows the margin of safety in a timber sale, and it is a useful negotiating figure because it states plainly how low a buyer can go before the woodland stops paying for itself on this rotation.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/calculator#environment" },
          { label: "Timber Value per Acre Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Timber Value per Acre Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Stand & Price">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="volume-per-acre"
                  label="Volume per Acre"
                  value={volumeTons}
                  onChange={setVolumeTons}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="tons"
                  error={errors.volumeTons}
                  hint="Mature softwood sawtimber often runs 25–50 tons."
                  tooltip="Merchantable green tons per acre."
                />
                <CompactInput
                  id="price-per-ton"
                  label="Timber Price"
                  value={pricePerTon}
                  onChange={setPricePerTon}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  prefix="$"
                  suffix="/ton"
                  error={errors.pricePerTon}
                  tooltip="Stumpage or delivered price per green ton, from a local bid or price report."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="rotation"
                  label="Rotation Age"
                  value={rotationYears}
                  onChange={setRotationYears}
                  onEnter={runCalculate}
                  min="1"
                  max="120"
                  step="1"
                  suffix="years"
                  error={errors.rotationYears}
                  tooltip="Years from planting to final harvest."
                />
                <CompactSelect
                  id="price-basis"
                  label="Price Basis"
                  value={priceBasis}
                  onChange={setPriceBasis}
                  options={[
                    { value: "stumpage", label: "Stumpage — standing timber" },
                    { value: "delivered", label: "Delivered — roadside / mill" },
                  ]}
                  tooltip="Delivered sales carry the logging and haul cost."
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
                  <SubSection title="Volume Conversion & Holding Costs">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="board-feet-per-ton"
                        label="Board Feet per Ton"
                        value={boardFeetPerTon}
                        onChange={setBoardFeetPerTon}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="bf/ton"
                        hint="120–200 bf per green ton suits most softwood sawtimber."
                        tooltip="Species and region specific — use your state extension figure."
                      />
                      <CompactInput
                        id="annual-cost"
                        label="Annual Carrying Cost"
                        value={annualCost}
                        onChange={setAnnualCost}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/acre/yr"
                        tooltip="Property tax, insurance and management per acre per year."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="acreage"
                        label="Total Acreage"
                        value={acres}
                        onChange={setAcres}
                        onEnter={runCalculate}
                        min="0.1"
                        step="any"
                        suffix="acres"
                        error={errors.acres}
                        tooltip="Used for the whole-stand value."
                      />
                      <CompactInput
                        id="site-prep"
                        label="Establishment Cost"
                        value={sitePrepCost}
                        onChange={setSitePrepCost}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/acre"
                        tooltip="Site preparation, seedlings and planting per acre."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Harvest, Thinning & Discounting">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="logging-per-ton"
                        label="Logging & Haul"
                        value={loggingPerTon}
                        onChange={setLoggingPerTon}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/ton"
                        tooltip="Felling, skidding and haulage per ton, deducted on a delivered sale."
                      />
                      <CompactInput
                        id="thinning-revenue"
                        label="Thinning Revenue"
                        value={thinningRevenue}
                        onChange={setThinningRevenue}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        prefix="$"
                        suffix="/acre"
                        tooltip="Net income from a mid-rotation thinning."
                      />
                      <CompactInput
                        id="thinning-year"
                        label="Thinning Year"
                        value={thinningYear}
                        onChange={setThinningYear}
                        onEnter={runCalculate}
                        min="1"
                        step="1"
                        suffix="yr"
                        tooltip="The year the thinning income arrives."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="discount-rate"
                        label="Discount Rate"
                        value={discountRatePct}
                        onChange={setDiscountRatePct}
                        onEnter={runCalculate}
                        min="0"
                        max="30"
                        step="any"
                        suffix="%"
                        tooltip="The return the land could earn elsewhere; 4–6% is common in forestry analysis."
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
                        tooltip="Decimal places used for money figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Value per Acre</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? money(results.netPerAcre, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${money(results.grossPerAcre, calcInputs.decimals)} gross on ${fmt(calcInputs.volumeTons, 1)} tons, net of establishment and carrying costs — harvest around ${results.harvestYear}`
                  : "Fix the highlighted inputs to see the valuation"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Net per Ton</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.netPerTon, 2) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">NPV per Acre</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.npvPerAcre, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Stand Total</span>
                <span className="font-extrabold text-foreground">{results.valid ? money(results.totalNet, 0) : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Valuation Line</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
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
                        Enter the stand and price details to value the timber.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Net value per acre</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{money(results.netPerAcre, calcInputs.decimals)}</td>
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume per acre</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.volumeTons, 1)} tons` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Board feet per acre</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.boardFeet, 0)} bf` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Price per MBF</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.pricePerMbf, 2) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rotation</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.rotationYears, 0)} years` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Annualised return</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.annualisedPct, 2)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Break-even price</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${money(results.breakEvenPrice, 2)}/ton` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Discounted thinning</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? money(results.pvThinning, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Acreage valued</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.acres, 0)} acres` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Timber Value per Acre Calculator?</h2>
            <p>
              A timber value per acre calculator values a stand of trees from its merchantable volume, the price per ton or per
              thousand board feet, the costs of establishing and holding the land, and the rotation age at which the harvest is
              expected. It returns gross revenue, net value per acre, value per ton, net present value after discounting, the
              implied price per MBF and the break-even price the stand needs to cover its own costs.
            </p>
            <p>
              The nominal and discounted figures answer different questions. Net value per acre says what the harvest is worth at the
              end of the rotation; net present value says what that future money is worth today, which is the number that makes
              forestry comparable with other uses of the same land. Both matter, and quoting only one is how timber valuations go
              wrong in either direction.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Gross revenue is volume per acre multiplied by price per ton. When the price is on a stumpage basis the buyer fells,
              skids and hauls the timber, so no logging cost is deducted; when the price is delivered or roadside the logging and
              haulage cost is subtracted, because the owner has paid for those operations. Site preparation and seedlings are charged
              once, annual property tax, insurance and management costs are multiplied by the rotation age, and any mid-rotation
              thinning income is added back.
            </p>
            <p>
              Volume is also expressed in board feet using a board-feet-per-ton factor, which gives the implied price per thousand
              board feet and makes the stand comparable with mill quotes that are published on that basis. The factor varies by
              species, form and region — approximately 120 to 200 board feet per green ton for softwood sawtimber — so a local
              extension figure is the right input rather than the default.
            </p>
            <p>
              Discounting reduces future revenue at the rate of return the land could earn elsewhere. A five percent rate shrinks a
              dollar received in thirty-five years to under twenty cents, which is why long rotations are sensitive to the discount
              rate chosen and why a modest change in the rate can flip a project from positive to negative present value. The
              calculator also compounds the establishment cost into an annualised return, so the internal economics of the rotation
              can be compared with a simple interest rate.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the net value per acre with gross revenue and the estimated harvest year in the subtext. The
              three-stat bar adds the net value per ton, the net present value per acre and the total value across the acreage, so
              the scale of the holding is visible immediately.
            </p>
            <p>
              The breakdown table traces every line from volume and price through logging, establishment, carrying costs and
              discounted thinning to the nominal and present values, ending with the break-even price and the harvest year. The
              summary panel reports board feet per acre, price per MBF, annualised return, thinning present value and acreage.
            </p>
            <p>
              Markets, not formulas, set timber prices, and they move with housing starts, mill capacity and local competition. Use a
              current bid or a state extension price report rather than a remembered figure, treat the result as a valuation model
              rather than an appraisal, and check whether the stand needs a timber cruise to establish volume properly. Certified
              appraisal work requires an on-site cruise, but this calculator will tell you quickly whether a sale is in the right
              range and what price the stand must fetch to make the rotation worthwhile.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/timber-value-per-acre-calculator" />
          <PopularCalculators exclude="/calculator/timber-value-per-acre-calculator" />
        </div>
      </div>
    </>
  );
}
