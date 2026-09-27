"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FuelKey = "jeta" | "jetb" | "jp8" | "avgas";
type VolumeUnit = "usgal" | "litre" | "impgal";

interface FuelSpec {
  key: FuelKey;
  label: string;
  /** Density at 15 °C, kg/L. Source: IATA / ASTM D1655 aviation fuel tables (Jet A/A-1 0.804, JP-8 0.810, Avgas 100LL 0.720). */
  density15: number;
  /** Density fall per 1 °C above 15 °C, kg/L. Jet fuel ≈ 0.00086; gasoline-type avgas ≈ 0.00078. */
  tempCoef: number;
  note: string;
}

const FUELS: FuelSpec[] = [
  {
    key: "jeta",
    label: "Jet A / Jet A-1 (turbine)",
    density15: 0.804,
    tempCoef: 0.00086,
    note: "0.804 kg/L at 15 °C (6.71 lb/US gal), the IATA standard figure for Jet A-1.",
  },
  {
    key: "jp8",
    label: "JP-8 / Jet A-1 military",
    density15: 0.81,
    tempCoef: 0.00086,
    note: "0.810 kg/L at 15 °C (6.76 lb/US gal), typical of JP-8 and NATO F-34.",
  },
  {
    key: "jetb",
    label: "Jet B (wide-cut)",
    density15: 0.78,
    tempCoef: 0.00088,
    note: "0.780 kg/L at 15 °C (6.51 lb/US gal), the lighter wide-cut blend used in cold climates.",
  },
  {
    key: "avgas",
    label: "Avgas 100LL (piston)",
    density15: 0.72,
    tempCoef: 0.00078,
    note: "0.720 kg/L at 15 °C (6.01 lb/US gal), the standard figure for 100LL avgas.",
  },
];

const UNIT_TO_LITRES: Record<VolumeUnit, number> = {
  usgal: 3.785411784,
  litre: 1,
  impgal: 4.54609,
};

const VOLUME_UNITS: { key: VolumeUnit; label: string; suffix: string }[] = [
  { key: "usgal", label: "US gallons", suffix: "US gal" },
  { key: "litre", label: "Litres", suffix: "L" },
  { key: "impgal", label: "Imperial gallons", suffix: "imp gal" },
];

interface FuelInputs {
  fuel: FuelKey;
  volume: number;
  volumeUnit: VolumeUnit;
  tempC: number;
  maxFuelLb: number;
  usablePct: number;
  burnGph: number;
  cruiseKt: number;
  decimals: number;
}

const DEFAULTS: FuelInputs = {
  fuel: "jeta",
  volume: 1000,
  volumeUnit: "usgal",
  tempC: 15,
  maxFuelLb: 6750,
  usablePct: 98,
  burnGph: 120,
  cruiseKt: 250,
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v)
    ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })
    : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
  isTotal?: boolean;
}

interface FuelResult {
  valid: boolean;
  errorMsg: string;
  fuelSpec: FuelSpec;
  volumeL: number;
  volumeUsGal: number;
  densityKgL: number;
  densityLbGal: number;
  weightKg: number;
  weightLb: number;
  usableLb: number;
  usableKg: number;
  maxUsedPct: number;
  remainingLb: number;
  enduranceHr: number;
  rangeNm: number;
  standardWeightLb: number;
  tempDeltaLb: number;
  breakdown: BreakdownRow[];
}

function calculateFuel(input: FuelInputs): FuelResult {
  const spec = FUELS.find((f) => f.key === input.fuel) || FUELS[0];

  const blank = (errorMsg: string): FuelResult => ({
    valid: false,
    errorMsg,
    fuelSpec: spec,
    volumeL: 0,
    volumeUsGal: 0,
    densityKgL: 0,
    densityLbGal: 0,
    weightKg: 0,
    weightLb: 0,
    usableLb: 0,
    usableKg: 0,
    maxUsedPct: 0,
    remainingLb: 0,
    enduranceHr: 0,
    rangeNm: 0,
    standardWeightLb: 0,
    tempDeltaLb: 0,
    breakdown: [],
  });

  const nums = [
    input.volume,
    input.tempC,
    input.maxFuelLb,
    input.usablePct,
    input.burnGph,
    input.cruiseKt,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to work out the fuel weight.");
  if (input.volume <= 0) return blank("Fuel volume must be greater than zero.");
  if (input.tempC < -60 || input.tempC > 60) return blank("Fuel temperature should be between −60 °C and 60 °C.");
  if (input.usablePct <= 0 || input.usablePct > 100) return blank("Usable fuel must be between 0% and 100%.");
  if (input.maxFuelLb < 0) return blank("Maximum fuel weight cannot be negative.");
  if (input.burnGph < 0) return blank("Fuel burn cannot be negative.");
  if (input.cruiseKt < 0) return blank("Cruise speed cannot be negative.");

  const d = Math.max(0, Math.min(4, input.decimals));
  const volumeL = input.volume * UNIT_TO_LITRES[input.volumeUnit];
  const volumeUsGal = volumeL / UNIT_TO_LITRES.usgal;
  const volumeImpGal = volumeL / UNIT_TO_LITRES.impgal;

  // Density falls as the fuel warms: measured values follow ASTM D1655 tables
  // closely over the −20 °C to +40 °C band a fuelled aircraft actually sees.
  const densityKgL = spec.density15 - spec.tempCoef * (input.tempC - 15);
  const densityLbGal = densityKgL * UNIT_TO_LITRES.usgal * 2.2046226;

  const weightKg = volumeL * densityKgL;
  const weightLb = weightKg * 2.2046226;
  const usableLb = weightLb * (input.usablePct / 100);
  const usableKg = usableLb / 2.2046226;

  const maxUsedPct = input.maxFuelLb > 0 ? (usableLb / input.maxFuelLb) * 100 : 0;
  const remainingLb = input.maxFuelLb - usableLb;

  const enduranceHr = input.burnGph > 0 ? volumeUsGal / input.burnGph : 0;
  const rangeNm = enduranceHr * input.cruiseKt;

  const standardWeightLb = volumeL * spec.density15 * 2.2046226;
  const tempDeltaLb = weightLb - standardWeightLb;

  const breakdown: BreakdownRow[] = [
    { label: `Volume entered (${VOLUME_UNITS.find((u) => u.key === input.volumeUnit)?.suffix})`, value: fmt(input.volume, d) },
    { label: "Volume (US gal)", value: fmt(volumeUsGal, d) },
    { label: "Volume (litres)", value: fmt(volumeL, d) },
    { label: "Volume (imperial gal)", value: fmt(volumeImpGal, d) },
    { label: `Density at ${fmt(input.tempC, 0)} °C (kg/L)`, value: fmt(densityKgL, 4) },
    { label: `Density at ${fmt(input.tempC, 0)} °C (lb/US gal)`, value: fmt(densityLbGal, 3), highlight: true },
    { label: "Total weight (lb)", value: fmt(weightLb, d) },
    { label: "Usable fuel after allowance (lb)", value: fmt(usableLb, d), highlight: true },
    { label: "Usable fuel after allowance (kg)", value: fmt(usableKg, d) },
    { label: `Weight at 15 °C reference (lb) vs entered temperature`, value: `${fmt(standardWeightLb, d)} / ${tempDeltaLb >= 0 ? "+" : ""}${fmt(tempDeltaLb, d)}` },
  ];

  return {
    valid: true,
    errorMsg: "",
    fuelSpec: spec,
    volumeL,
    volumeUsGal,
    densityKgL,
    densityLbGal,
    weightKg,
    weightLb,
    usableLb,
    usableKg,
    maxUsedPct,
    remainingLb,
    enduranceHr,
    rangeNm,
    standardWeightLb,
    tempDeltaLb,
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

export default function AviationFuelWeightCalculator() {
  const [fuel, setFuel] = useState<string>(DEFAULTS.fuel);
  const [volume, setVolume] = useState(String(DEFAULTS.volume));
  const [volumeUnit, setVolumeUnit] = useState<string>(DEFAULTS.volumeUnit);
  const [tempC, setTempC] = useState(String(DEFAULTS.tempC));
  const [maxFuelLb, setMaxFuelLb] = useState(String(DEFAULTS.maxFuelLb));
  const [usablePct, setUsablePct] = useState(String(DEFAULTS.usablePct));
  const [burnGph, setBurnGph] = useState(String(DEFAULTS.burnGph));
  const [cruiseKt, setCruiseKt] = useState(String(DEFAULTS.cruiseKt));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): FuelInputs => ({
    fuel: fuel as FuelKey,
    volume: parseFloat(volume) || 0,
    volumeUnit: volumeUnit as VolumeUnit,
    tempC: parseFloat(tempC),
    maxFuelLb: parseFloat(maxFuelLb) || 0,
    usablePct: parseFloat(usablePct) || 0,
    burnGph: parseFloat(burnGph) || 0,
    cruiseKt: parseFloat(cruiseKt) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<FuelInputs>(() => DEFAULTS);
  const [results, setResults] = useState<FuelResult>(() => calculateFuel(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateFuel(inputs));
  };

  const reset = () => {
    setFuel(DEFAULTS.fuel);
    setVolume(String(DEFAULTS.volume));
    setVolumeUnit(DEFAULTS.volumeUnit);
    setTempC(String(DEFAULTS.tempC));
    setMaxFuelLb(String(DEFAULTS.maxFuelLb));
    setUsablePct(String(DEFAULTS.usablePct));
    setBurnGph(String(DEFAULTS.burnGph));
    setCruiseKt(String(DEFAULTS.cruiseKt));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateFuel(DEFAULTS));
  };

  const volumeNum = parseFloat(volume);
  const tempNum = parseFloat(tempC);
  const maxNum = parseFloat(maxFuelLb);
  const usableNum = parseFloat(usablePct);

  const errors = {
    volume: !Number.isFinite(volumeNum) ? "Enter a volume" : volumeNum <= 0 ? "Volume must be greater than zero" : "",
    tempC: !Number.isFinite(tempNum) ? "Enter a temperature" : tempNum < -60 || tempNum > 60 ? "Use −60 °C to 60 °C" : "",
    maxFuelLb: !Number.isFinite(maxNum) || maxNum < 0 ? "Must be zero or greater" : "",
    usablePct: !Number.isFinite(usableNum) || usableNum <= 0 || usableNum > 100 ? "Use 1% to 100%" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const capacityColor =
    results.valid && results.maxUsedPct > 100
      ? "text-red-600"
      : results.valid && results.maxUsedPct > 90
        ? "text-orange-600"
        : "text-emerald-600";

  const faqs = [
    {
      question: "Why does aviation fuel weight change with temperature?",
      answer:
        "Jet fuel and avgas expand as they warm, so a gallon loaded on a hot ramp weighs less than the same gallon loaded on a cold morning. Density for Jet A-1 falls by roughly 0.00086 kg per litre for every degree Celsius above the 15 °C reference, which on a 3,000 US gallon uplift is a difference of more than 150 lb. Fuel is bought by volume but the aircraft is limited by weight, so the correction matters for both payload and range planning.",
    },
    {
      question: "What is the difference between usable and unusable fuel?",
      answer:
        "Unusable fuel is the small quantity that cannot be delivered to the engine in the most adverse attitude because it sits below the fuel outlet or is trapped in sumps. It is tank-specific and certified in the aircraft flight manual, typically one to three percent of capacity. The usable-figure input in the advanced section applies that allowance so the weight you see reflects fuel that will actually burn, not merely fuel on board.",
    },
    {
      question: "How do I convert jet fuel gallons to pounds quickly?",
      answer:
        "At the 15 °C reference, Jet A-1 weighs 6.71 lb per US gallon, so a rough field figure is 6.7 lb per gallon. Multiply the uplift in gallons by that number for a fast estimate, then apply the temperature correction if the fuel is significantly warmer or cooler than 15 °C. This calculator does both steps and also reports the weight in kilograms, which is the unit used through most of the world outside the United States.",
    },
    {
      question: "Does the figure include fuel in the lines and tanks?",
      answer:
        "The calculation converts a volume of fuel into weight, so it describes exactly what you enter. Fuel already in the lines, the unusable residue in each tank and any fuel burned during taxi must be accounted for separately. When planning a flight, subtract taxi fuel from the usable figure and compare the remainder against the flight-plan burn, reserves and any alternate requirement.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Aviation Fuel Weight Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Aviation Fuel Weight Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Fuel & Volume">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="fuel-type"
                  label="Fuel Type"
                  value={fuel}
                  onChange={setFuel}
                  options={FUELS.map((f) => ({ value: f.key, label: f.label }))}
                  tooltip="Sets the reference density at 15 °C used for the conversion."
                />
                <CompactInput
                  id="fuel-volume"
                  label="Fuel Volume"
                  value={volume}
                  onChange={setVolume}
                  onEnter={runCalculate}
                  min="0"
                  step="any"
                  error={errors.volume}
                  tooltip="How much fuel is being loaded or checked."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="volume-unit"
                  label="Volume Unit"
                  value={volumeUnit}
                  onChange={setVolumeUnit}
                  options={VOLUME_UNITS.map((u) => ({ value: u.key, label: u.label }))}
                  tooltip="US gallons, litres or imperial gallons."
                />
                <CompactInput
                  id="fuel-temp"
                  label="Fuel Temperature"
                  value={tempC}
                  onChange={setTempC}
                  onEnter={runCalculate}
                  min="-60"
                  step="any"
                  suffix="°C"
                  error={errors.tempC}
                  hint="15 °C is the density reference point."
                  tooltip="Warmer fuel is lighter per gallon."
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
                  <SubSection title="Tank & Usable Fuel">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="max-fuel"
                        label="Max Fuel Weight"
                        value={maxFuelLb}
                        onChange={setMaxFuelLb}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="lb"
                        error={errors.maxFuelLb}
                        tooltip="Maximum fuel weight the aircraft may carry, from the flight manual."
                      />
                      <CompactInput
                        id="usable-fuel"
                        label="Usable Fuel"
                        value={usablePct}
                        onChange={setUsablePct}
                        onEnter={runCalculate}
                        min="1"
                        step="any"
                        suffix="%"
                        error={errors.usablePct}
                        tooltip="Share of the loaded volume that can actually reach the engine."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Endurance & Display">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="burn-rate"
                        label="Fuel Burn"
                        value={burnGph}
                        onChange={setBurnGph}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="gph"
                        tooltip="Cruise fuel flow in US gallons per hour."
                      />
                      <CompactInput
                        id="cruise-speed"
                        label="Cruise Speed"
                        value={cruiseKt}
                        onChange={setCruiseKt}
                        onEnter={runCalculate}
                        min="0"
                        step="any"
                        suffix="kt"
                        tooltip="True airspeed used to turn endurance into range."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Fuel Weight</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.weightLb, calcInputs.decimals)} lb` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(calcInputs.volume, calcInputs.decimals)} ${VOLUME_UNITS.find((u) => u.key === calcInputs.volumeUnit)?.suffix} of ${results.fuelSpec.label.split(" (")[0]} at ${fmt(calcInputs.tempC, 0)} °C weighs ${fmt(results.weightKg, calcInputs.decimals)} kg`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Weight</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.weightKg, 0)} kg` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Density</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.densityLbGal, 2)} lb/gal` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Usable Fuel</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.usableLb, 0)} lb` : "—"}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Measure</th>
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
                        Enter a volume to see the unit-by-unit breakdown.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Fuel weight</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.weightLb, calcInputs.decimals)} lb · ${fmt(results.weightKg, calcInputs.decimals)} kg`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fuel</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? results.fuelSpec.label.split(" (")[0] : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume (US gal)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.volumeUsGal, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volume (litres)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.volumeL, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Density at 15 °C</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.fuelSpec.density15, 3)} kg/L` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Temperature effect</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? `${results.tempDeltaLb >= 0 ? "+" : ""}${fmt(results.tempDeltaLb, 1)} lb vs 15 °C`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Usable fuel (kg)</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.usableKg, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tank capacity used</span>
                  <span className={`text-base font-bold ${capacityColor}`}>
                    {results.valid && calcInputs.maxFuelLb > 0 ? `${fmt(results.maxUsedPct, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Remaining capacity</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.maxFuelLb > 0 ? `${fmt(results.remainingLb, 0)} lb` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Endurance</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.burnGph > 0 ? `${fmt(results.enduranceHr, 2)} h` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Range at cruise</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid && calcInputs.burnGph > 0 ? `${fmt(results.rangeNm, 0)} nm` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Aviation Fuel Weight Calculator?</h2>
            <p>
              An aviation fuel weight calculator converts a volume of fuel into the weight that volume actually represents,
              accounting for the fact that turbine fuel and avgas expand and contract with temperature. It reports the answer in
              pounds and kilograms, converts between US gallons, litres and imperial gallons, and can apply the usable-fuel
              allowance and tank limits taken from the aircraft flight manual.
            </p>
            <p>
              Weight, not volume, is what limits an aircraft. Every performance figure — takeoff distance, climb gradient, cruise
              range, maximum payload — is computed from a mass, while fuel is ordered and metered by volume. The density that links
              the two is not a constant: Jet A-1 is quoted at 0.804 kg per litre at 15 °C, and a load delivered at 35 °C is roughly
              two percent lighter per gallon. On a large uplift that is enough to change reserve calculations or payload available
              for the cabin.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The first step converts the volume you enter into litres, using 3.785411784 litres per US gallon and 4.54609 litres
              per imperial gallon, so that any of the three common units can be compared on one scale. The second step selects a
              reference density for the fuel type: 0.804 kg per litre for Jet A and Jet A-1, 0.810 for JP-8, 0.780 for the
              wide-cut Jet B blend and 0.720 for Avgas 100LL, all quoted at 15 °C.
            </p>
            <p>
              Temperature is then applied. Jet fuel loses about 0.00086 kg per litre of density for every degree Celsius above the
              reference, and the lighter gasoline-type avgas loses about 0.00078. A load at 30 °C therefore sits around 0.013 kg
              per litre below its 15 °C figure, which is a reduction of roughly 1.6 percent. The corrected density is multiplied by
              the volume to give mass in kilograms and pounds, and the same number expressed per US gallon gives the familiar
              pounds-per-gallon figure that crews check against the flight plan.
            </p>
            <p>
              The advanced section adds the operational corrections. Unusable fuel, typically one to three percent of tank
              capacity, is excluded because it cannot be delivered in every attitude, so the usable weight is the number that
              actually burns. Maximum fuel weight, taken from the flight manual, is used to show the share of tank capacity the
              load represents and the weight still available. Finally, a cruise fuel flow turns the usable volume into endurance
              hours, and a true airspeed turns endurance into still-air range in nautical miles.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the total fuel weight in pounds, with the equivalent in kilograms underneath. The three-stat bar
              adds the kilogram figure, the density actually used in pounds per US gallon, and the usable weight after the
              unusable-fuel allowance, so a quick glance shows whether the load is heavier or lighter than the standard figure.
            </p>
            <p>
              The breakdown table lists every intermediate value: the volume in all three units, the corrected density in kilograms
              per litre and pounds per gallon, the total and usable weight, and how much the temperature correction moved the
              result relative to the 15 °C reference. The summary panel reports the fuel selected, the tank capacity used, the
              remaining capacity, and the endurance and range implied by the burn and speed you entered.
            </p>
            <p>
              Treat the output as a planning aid, not a substitute for the flight manual. Actual density is batch-specific and can
              be verified with a hydrometer or from the supplier's delivery ticket, and operators flying under a mass-and-balance
              regime should use the certified figures for their aircraft. When the fuel is warmer than the reference, expect a
              lighter load for the same volume and check that the resulting range still covers the flight, reserves and any
              alternate, with the taxi burn already deducted.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/aviation-fuel-weight-calculator" />
          <PopularCalculators exclude="/calculator/aviation-fuel-weight-calculator" />
        </div>
      </div>
    </>
  );
}
