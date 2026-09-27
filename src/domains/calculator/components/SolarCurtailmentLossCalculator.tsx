"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface CurtailInputs {
  capacityMw: number;
  specificYield: number;
  curtailmentHours: number;
  averageOutputPct: number;
  curtailmentCapPct: number;
  recoveryPct: number;
  roundTripPct: number;
  price: number;
  storageCost: number;
  decimals: number;
}

const DEFAULTS: CurtailInputs = {
  capacityMw: 50,
  specificYield: 1650,
  curtailmentHours: 180,
  averageOutputPct: 55,
  curtailmentCapPct: 8,
  recoveryPct: 0,
  roundTripPct: 88,
  price: 45,
  storageCost: 120,
  decimals: 1,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CurtailResult {
  valid: boolean;
  errorMsg: string;
  potentialMwh: number;
  capacityFactorPct: number;
  grossCurtailedMwh: number;
  capMwh: number;
  cappedCurtailedMwh: number;
  capBinding: boolean;
  recoveredMwh: number;
  storageInputMwh: number;
  netCurtailedMwh: number;
  deliveredMwh: number;
  curtailedPct: number;
  netCurtailedPct: number;
  lostRevenue: number;
  recoveredValue: number;
  recoveredCost: number;
  netLoss: number;
  revenuePerMwhImpact: number;
  capacityFactorAfterPct: number;
  effectiveYield: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateCurtailment(input: CurtailInputs): CurtailResult {
  const blank = (errorMsg: string): CurtailResult => ({
    valid: false,
    errorMsg,
    potentialMwh: 0,
    capacityFactorPct: 0,
    grossCurtailedMwh: 0,
    capMwh: 0,
    cappedCurtailedMwh: 0,
    capBinding: false,
    recoveredMwh: 0,
    storageInputMwh: 0,
    netCurtailedMwh: 0,
    deliveredMwh: 0,
    curtailedPct: 0,
    netCurtailedPct: 0,
    lostRevenue: 0,
    recoveredValue: 0,
    recoveredCost: 0,
    netLoss: 0,
    revenuePerMwhImpact: 0,
    capacityFactorAfterPct: 0,
    effectiveYield: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.capacityMw,
    input.specificYield,
    input.curtailmentHours,
    input.averageOutputPct,
    input.curtailmentCapPct,
    input.recoveryPct,
    input.roundTripPct,
    input.price,
    input.storageCost,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to size the curtailment.");
  if (input.capacityMw <= 0) return blank("Plant capacity must be greater than zero.");
  if (input.specificYield <= 0) return blank("Specific yield must be greater than zero.");
  if (input.curtailmentHours < 0 || input.curtailmentHours > 8760) return blank("Curtailment hours must be between 0 and 8,760.");
  if (input.averageOutputPct <= 0 || input.averageOutputPct > 100) {
    return blank("Average output during curtailed hours should be between 1% and 100% of capacity.");
  }
  if (input.curtailmentCapPct < 0 || input.curtailmentCapPct > 100) return blank("The curtailment cap should be between 0% and 100%.");
  if (input.recoveryPct < 0 || input.recoveryPct > 100) return blank("Recoverable share should be between 0% and 100%.");
  if (input.roundTripPct <= 0 || input.roundTripPct > 100) return blank("Round-trip efficiency should be above 0% and no more than 100%.");
  if (input.price < 0) return blank("Energy price cannot be negative.");
  if (input.storageCost < 0) return blank("Storage cost cannot be negative.");

  const d = Math.max(0, Math.min(2, input.decimals));

  // Potential generation: direct-current capacity times the specific yield the site
  // delivers per kilowatt-peak in an unconstrained year.
  const potentialMwh = input.capacityMw * 1000 * (input.specificYield / 1000);
  const capacityFactorPct = (potentialMwh / (input.capacityMw * 8760)) * 100;

  // Curtailed energy from the hours and their average output during curtailment,
  // then bounded by the interconnection or offtake limit expressed as a share of
  // annual generation.
  const grossCurtailedMwh = input.curtailmentHours * input.capacityMw * (input.averageOutputPct / 100);
  const capMwh = potentialMwh * (input.curtailmentCapPct / 100);
  const capBinding = grossCurtailedMwh > capMwh;
  const cappedCurtailedMwh = capBinding ? capMwh : grossCurtailedMwh;

  // Storage recovers part of the curtailed energy, and the round-trip loss has to
  // be paid before anything can be sold.
  const recoveredMwh = cappedCurtailedMwh * (input.recoveryPct / 100) * (input.roundTripPct / 100);
  const storageInputMwh = input.recoveryPct > 0 ? cappedCurtailedMwh * (input.recoveryPct / 100) : 0;
  const netCurtailedMwh = cappedCurtailedMwh - recoveredMwh;
  const deliveredMwh = potentialMwh - netCurtailedMwh;

  const curtailedPct = (cappedCurtailedMwh / potentialMwh) * 100;
  const netCurtailedPct = (netCurtailedMwh / potentialMwh) * 100;

  const lostRevenue = cappedCurtailedMwh * input.price;
  const recoveredValue = recoveredMwh * input.price;
  const recoveredCost = recoveredMwh * input.storageCost;
  const netLoss = lostRevenue - (recoveredValue - recoveredCost);

  const uncurtailedRevenue = potentialMwh * input.price;
  const netRevenue = deliveredMwh * input.price + (recoveredValue - recoveredCost);
  const revenuePerMwhImpact = potentialMwh > 0 ? (uncurtailedRevenue - netRevenue) / potentialMwh : 0;
  const capacityFactorAfterPct = (deliveredMwh / (input.capacityMw * 8760)) * 100;
  const effectiveYield = (deliveredMwh * 1000) / (input.capacityMw * 1000);

  const verdict =
    netCurtailedPct >= 5
      ? `Curtailment removes ${fmt(netCurtailedPct, 1)}% of generation, or ${fmt(netLoss, 0)} of revenue at ${fmt(
          input.price,
          0,
        )} per MWh — enough to justify firming capacity or a larger interconnection`
      : `Curtailment removes ${fmt(netCurtailedPct, 1)}% of generation, costing ${fmt(netLoss, 0)} a year, which is within the range most operators absorb`;
  const verdictColor = netCurtailedPct >= 5 ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    { label: `Capacity ${fmt(input.capacityMw, 1)} MW at ${fmt(input.specificYield, 0)} kWh per kWp`, value: `${fmt(potentialMwh, 0)} MWh unconstrained` },
    { label: "Unconstrained capacity factor", value: `${fmt(capacityFactorPct, 1)}%` },
    { label: `Curtailment hours at ${fmt(input.averageOutputPct, 0)}% of capacity`, value: `${fmt(input.curtailmentHours, 0)} h` },
    { label: "Curtailed energy before any cap", value: `${fmt(grossCurtailedMwh, d)} MWh` },
    { label: `Curtailment cap of ${fmt(input.curtailmentCapPct, 1)}% of generation`, value: `${fmt(capMwh, d)} MWh${capBinding ? " — binding" : " — not reached"}` },
    { label: "Curtailed energy applied", value: `${fmt(cappedCurtailedMwh, d)} MWh · ${fmt(curtailedPct, 2)}% of generation`, highlight: true },
    { label: `Recoverable share ${fmt(input.recoveryPct, 0)}% at ${fmt(input.roundTripPct, 0)}% round trip`, value: `${fmt(recoveredMwh, d)} MWh delivered` },
    { label: "Energy routed into storage", value: `${fmt(storageInputMwh, d)} MWh` },
    { label: "Net curtailed energy", value: `${fmt(netCurtailedMwh, d)} MWh · ${fmt(netCurtailedPct, 2)}%`, highlight: true },
    { label: "Delivered generation", value: `${fmt(deliveredMwh, 0)} MWh` },
    { label: `Value of the lost energy at ${fmt(input.price, 2)} per MWh`, value: `${fmt(lostRevenue, 0)}` },
    { label: "Revenue from recovered energy", value: `${fmt(recoveredValue, 0)}` },
    { label: `Storage cost at ${fmt(input.storageCost, 0)} per MWh cycled`, value: `−${fmt(recoveredCost, 0)}` },
    { label: "Net annual cost of curtailment", value: `${fmt(netLoss, 0)}`, highlight: true },
    { label: "Average revenue lost per MWh of potential output", value: `${fmt(revenuePerMwhImpact, 2)}` },
    { label: "Capacity factor after curtailment", value: `${fmt(capacityFactorAfterPct, 1)}%` },
    { label: "Effective specific yield delivered", value: `${fmt(effectiveYield, 0)} kWh per kWp` },
  ];

  return {
    valid: true,
    errorMsg: "",
    potentialMwh,
    capacityFactorPct,
    grossCurtailedMwh,
    capMwh,
    cappedCurtailedMwh,
    capBinding,
    recoveredMwh,
    storageInputMwh,
    netCurtailedMwh,
    deliveredMwh,
    curtailedPct,
    netCurtailedPct,
    lostRevenue,
    recoveredValue,
    recoveredCost,
    netLoss,
    revenuePerMwhImpact,
    capacityFactorAfterPct,
    effectiveYield,
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

export default function SolarCurtailmentLossCalculator() {
  const [capacityMw, setCapacityMw] = useState(String(DEFAULTS.capacityMw));
  const [specificYield, setSpecificYield] = useState(String(DEFAULTS.specificYield));
  const [curtailmentHours, setCurtailmentHours] = useState(String(DEFAULTS.curtailmentHours));
  const [averageOutputPct, setAverageOutputPct] = useState(String(DEFAULTS.averageOutputPct));
  const [curtailmentCapPct, setCurtailmentCapPct] = useState(String(DEFAULTS.curtailmentCapPct));
  const [recoveryPct, setRecoveryPct] = useState(String(DEFAULTS.recoveryPct));
  const [roundTripPct, setRoundTripPct] = useState(String(DEFAULTS.roundTripPct));
  const [price, setPrice] = useState(String(DEFAULTS.price));
  const [storageCost, setStorageCost] = useState(String(DEFAULTS.storageCost));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CurtailInputs => ({
    capacityMw: parseFloat(capacityMw) || 0,
    specificYield: parseFloat(specificYield) || 0,
    curtailmentHours: parseFloat(curtailmentHours) || 0,
    averageOutputPct: parseFloat(averageOutputPct) || 0,
    curtailmentCapPct: parseFloat(curtailmentCapPct) || 0,
    recoveryPct: parseFloat(recoveryPct) || 0,
    roundTripPct: parseFloat(roundTripPct) || 0,
    price: parseFloat(price) || 0,
    storageCost: parseFloat(storageCost) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<CurtailInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CurtailResult>(() => calculateCurtailment(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateCurtailment(inputs));
  };

  const reset = () => {
    setCapacityMw(String(DEFAULTS.capacityMw));
    setSpecificYield(String(DEFAULTS.specificYield));
    setCurtailmentHours(String(DEFAULTS.curtailmentHours));
    setAverageOutputPct(String(DEFAULTS.averageOutputPct));
    setCurtailmentCapPct(String(DEFAULTS.curtailmentCapPct));
    setRecoveryPct(String(DEFAULTS.recoveryPct));
    setRoundTripPct(String(DEFAULTS.roundTripPct));
    setPrice(String(DEFAULTS.price));
    setStorageCost(String(DEFAULTS.storageCost));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateCurtailment(DEFAULTS));
  };

  const capacityNum = parseFloat(capacityMw);
  const yieldNum = parseFloat(specificYield);
  const hoursNum = parseFloat(curtailmentHours);
  const outputNum = parseFloat(averageOutputPct);

  const errors = {
    capacityMw: !Number.isFinite(capacityNum) || capacityNum <= 0 ? "Must be greater than zero" : "",
    specificYield: !Number.isFinite(yieldNum) || yieldNum <= 0 ? "Must be greater than zero" : "",
    curtailmentHours: !Number.isFinite(hoursNum) || hoursNum < 0 || hoursNum > 8760 ? "Use 0–8,760" : "",
    averageOutputPct: !Number.isFinite(outputNum) || outputNum <= 0 || outputNum > 100 ? "Use 1–100%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What is solar curtailment?",
      answer:
        "Curtailment is the deliberate reduction of a solar plant's output below what it could produce, usually on the instruction of the system operator. It happens when generation in an area exceeds what the local network can carry or what demand can absorb: too much midday sunshine, a transmission constraint, a minimum-generation limit on fossil plant, or an oversupplied market where the clearing price goes negative. The energy is not lost to a fault — the plant is simply told to hold back.",
    },
    {
      question: "How is curtailment usually measured?",
      answer:
        "Two numbers matter, and they answer different questions. Curtailment hours count how many hours the plant was constrained, while curtailed energy measures how many megawatt-hours were not produced, which is the hours multiplied by what the plant would have generated in them. A plant can have many curtailment hours with almost no energy lost if the constraint bites at dawn and dusk, and few hours with heavy losses if it is clipped at the midday peak. Utilities and market reports increasingly publish both.",
    },
    {
      question: "How much revenue does curtailment cost?",
      answer:
        "Multiply the curtailed energy by the price the plant would have received. That price is the hard part: curtailment tends to happen when the local price is at its lowest, so valuing lost energy at the annual average capture price overstates the loss. A more careful estimate uses the capture price during constrained hours, which in heavily solar-saturated markets can be a fraction of the annual average and occasionally negative. If storage recovers the energy, subtract the storage cost per megawatt-hour cycled as well as the round-trip efficiency loss.",
    },
    {
      question: "Does adding a battery fix curtailment?",
      answer:
        "Partly, and only up to the battery's power and energy limits. A battery can absorb energy that would otherwise be spilled and discharge it later at a higher price, but round-trip losses, the cost per megawatt-hour cycled and the battery's cycle life all eat into the gain, and a battery sized for a few hours of storage cannot absorb a seasonal constraint. The other routes are a larger interconnection, a plant controller that lowers output smoothly instead of tripping, and co-locating load such as electrolysis or a data centre that can consume the surplus.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Environment", href: "/calculator#environment" },
          { label: "Solar Curtailment Loss Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solar Curtailment Loss Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Plant">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="capacity"
                  label="Capacity"
                  value={capacityMw}
                  onChange={setCapacityMw}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="MW"
                  error={errors.capacityMw}
                  tooltip="Direct-current nameplate capacity of the plant."
                />
                <CompactInput
                  id="yield"
                  label="Specific Yield"
                  value={specificYield}
                  onChange={setSpecificYield}
                  onEnter={runCalculate}
                  min="100"
                  step="any"
                  suffix="kWh/kWp"
                  error={errors.specificYield}
                  hint="Unconstrained, per year."
                  tooltip="Annual generation per kilowatt-peak before any curtailment."
                />
              </div>
            </SubSection>

            <SubSection title="Curtailment Events">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="hours"
                  label="Curtailment Hours"
                  value={curtailmentHours}
                  onChange={setCurtailmentHours}
                  onEnter={runCalculate}
                  min="0"
                  max="8760"
                  step="1"
                  suffix="h/year"
                  error={errors.curtailmentHours}
                  tooltip="Hours in a year when output is constrained."
                />
                <CompactInput
                  id="output"
                  label="Output When Curtailed"
                  value={averageOutputPct}
                  onChange={setAverageOutputPct}
                  onEnter={runCalculate}
                  min="1"
                  max="100"
                  step="1"
                  suffix="%"
                  error={errors.averageOutputPct}
                  hint="Share of capacity it would have made."
                  tooltip="Average output the plant would have produced during the constrained hours, as a share of capacity."
                />
              </div>
            </SubSection>

            <SubSection title="Limits & Value">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="cap"
                  label="Curtailment Cap"
                  value={curtailmentCapPct}
                  onChange={setCurtailmentCapPct}
                  onEnter={runCalculate}
                  min="0"
                  max="100"
                  step="0.5"
                  suffix="%"
                  hint="Contractual or offtake limit."
                  tooltip="Maximum share of annual generation that can be curtailed, from the interconnection or offtake agreement."
                />
                <CompactInput
                  id="price"
                  label="Energy Price"
                  value={price}
                  onChange={setPrice}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  hint="Per MWh at the hours lost."
                  tooltip="Value of the energy that would have been sold, per megawatt-hour."
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
                  <SubSection title="Storage Recovery">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="recovery"
                        label="Recoverable Share"
                        value={recoveryPct}
                        onChange={setRecoveryPct}
                        onEnter={runCalculate}
                        min="0"
                        max="100"
                        step="5"
                        suffix="%"
                        hint="0% if there is no storage."
                        tooltip="Share of curtailed energy a battery or other asset can absorb."
                      />
                      <CompactInput
                        id="round-trip"
                        label="Round-Trip Efficiency"
                        value={roundTripPct}
                        onChange={setRoundTripPct}
                        onEnter={runCalculate}
                        min="1"
                        max="100"
                        step="1"
                        suffix="%"
                        tooltip="Efficiency of storing and returning the recovered energy."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="storage-cost"
                        label="Storage Cost"
                        value={storageCost}
                        onChange={setStorageCost}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        hint="Per MWh cycled."
                        tooltip="Marginal cost of cycling a megawatt-hour through storage, including degradation."
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
                        tooltip="Decimal places used for energy figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Curtailed Generation</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.netCurtailedPct, 2)}%` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.netCurtailedMwh, calcInputs.decimals)} MWh of ${fmt(
                      results.potentialMwh,
                      0,
                    )} MWh of potential output, costing ${fmt(results.netLoss, 0)} a year`
                  : "Fix the highlighted inputs to size the loss"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Potential</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.potentialMwh, 0)} MWh` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Curtailed</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.cappedCurtailedMwh, 0)} MWh` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Annual Cost</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? fmt(results.netLoss, 0) : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Curtailment Item</th>
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
                        Enter the plant and the curtailment events to size the loss.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Net annual cost of curtailment</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.netLoss, 0)} · ${fmt(results.netCurtailedPct, 2)}% of generation`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Potential generation</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.potentialMwh, 0)} MWh` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Capacity factor</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.capacityFactorPct, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Curtailed energy</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.cappedCurtailedMwh, 1)} MWh` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recovered by storage</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.recoveredMwh, 1)} MWh` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Revenue lost</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.lostRevenue, 0) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Net cost of curtailment</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? fmt(results.netLoss, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Capacity factor after</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.capacityFactorAfterPct, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Effective yield</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.effectiveYield, 0)} kWh/kWp` : "—"}
                  </span>
                </div>
              </div>
              {results.valid && <p className={`text-[11px] mt-3 font-semibold ${results.verdictColor}`}>{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Solar Curtailment Loss Calculator?</h2>
            <p>
              A solar curtailment loss calculator converts constrained hours and the output the plant would have produced in them into
              the energy that was not generated, the share of annual output it represents and the revenue attached to it. Curtailment is
              now one of the largest single losses at a solar plant in markets with dense photovoltaic capacity, and it is unusual among
              losses because it is invisible on the asset — the inverters are simply told to produce less.
            </p>
            <p>
              Quantifying it properly matters for three separate decisions: how much a larger interconnection or a storage addition is
              worth, how to report the plant's performance, and whether the constraint is an occasional event or a structural feature of
              the network around it.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The starting point is unconstrained potential generation: capacity in megawatts multiplied by the site's specific yield in
              kilowatt-hours per kilowatt-peak per year. That figure is what the plant would have produced with no network limits at all,
              and it anchors every comparison that follows.
            </p>
            <p>
              Curtailed energy comes from the constrained hours and the output that would have been flowing in them. Multiplying the two
              gives the energy spilled, and the calculator then applies the interconnection or offtake limit — the cap as a share of
              annual generation — because in practice curtailment is bounded by contract or by the network's own figures rather than by
              the arithmetic of hours alone.
            </p>
            <p>
              If storage is available, the recoverable share of the curtailed energy is routed through it, with round-trip losses taken
              off before anything is sold and a cycling cost per megawatt-hour subtracted from the proceeds. The result is a net curtailed
              figure, a net annual cost and the effect on capacity factor and effective specific yield, which is how the same event would
              show up in a performance report.
            </p>
            <p>
              The valuation is deliberately simple — curtailed megawatt-hours times a price you supply — because that is the honest way to
              present a first-pass estimate. A rigorous valuation would price each constrained hour at its own capture price, and in
              solar-saturated markets midday prices during constrained hours sit well below the annual average, sometimes at or under
              zero. Entering the constrained-hour capture price instead of the annual average is the single most useful adjustment you
              can make to the default.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the net curtailed share of generation, with the megawatt-hours and the annual cost behind it. The
              three-stat bar sets the potential output, the curtailed energy and the net annual cost side by side.
            </p>
            <p>
              The breakdown table follows the whole chain: capacity and yield into potential output, curtailment hours at their average
              output into gross curtailed energy, the cap that may bind, the storage recovery after round-trip losses, the net curtailed
              figure, the revenue lost, the revenue recovered, the cost of cycling and the effect on revenue per megawatt-hour of
              potential output. The summary panel repeats the headline numbers and adds the verdict line.
            </p>
            <p>
              Treat the curtailment hours and average output as the two inputs to get right, because they carry all the uncertainty.
              Operator records usually give the constrained hours directly; where they do not, hourly generation data compared against a
              clear-sky estimate will reconstruct them. And remember that this model treats curtailment as a purely financial loss — in
              practice, prolonged curtailment also changes how the asset is dispatched, which shifts degradation, warranty calculations
              and the shape of the revenue it earns in every other hour of the year.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/solar-curtailment-loss-calculator" />
          <PopularCalculators exclude="/calculator/solar-curtailment-loss-calculator" />
        </div>
      </div>
    </>
  );
}
