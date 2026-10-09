"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type Drivetrain = "fwd" | "rwd" | "awd";
type TireGrip = "street" | "performance" | "drag";
type Gearbox = "manual" | "automatic" | "dct";

interface PerfInputs {
  weightLb: number;
  horsepower: number;
  drivetrain: Drivetrain;
  tireGrip: TireGrip;
  gearbox: Gearbox;
  occupantsLb: number;
  decimals: number;
}

const DEFAULTS: PerfInputs = {
  weightLb: 3400,
  horsepower: 300,
  drivetrain: "rwd",
  tireGrip: "performance",
  gearbox: "automatic",
  occupantsLb: 0,
  decimals: 2,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const DRIVE_OPTIONS = [
  { value: "fwd", label: "Front-wheel drive" },
  { value: "rwd", label: "Rear-wheel drive" },
  { value: "awd", label: "All-wheel drive" },
];

const TIRE_OPTIONS = [
  { value: "street", label: "Street all-season" },
  { value: "performance", label: "Performance summer" },
  { value: "drag", label: "Drag / sticky compound" },
];

const GEARBOX_OPTIONS = [
  { value: "manual", label: "Manual (2–3 shifts)" },
  { value: "automatic", label: "Torque-converter auto" },
  { value: "dct", label: "Dual-clutch / fast auto" },
];

const DECIMAL_OPTIONS = [
  { value: "1", label: "1 decimal" },
  { value: "2", label: "2 decimals" },
];

interface PerfResult {
  valid: boolean;
  errorMsg: string;
  powerToWeight: number;
  hpPerTonne: number;
  t60: number;
  quarterET: number;
  quarterTrap: number;
  energyBase: number;
  launchPenalty: number;
  bandLabel: string;
  bandColor: string;
  verdict: string;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

/** Energy-method 0-60 estimate with drivetrain, tire and gearbox corrections,
 *  plus the classic Hale cube-root quarter-mile relations. */
function calculatePerf(i: PerfInputs): PerfResult {
  const blank = (errorMsg: string): PerfResult => ({
    valid: false,
    errorMsg,
    powerToWeight: 0,
    hpPerTonne: 0,
    t60: 0,
    quarterET: 0,
    quarterTrap: 0,
    energyBase: 0,
    launchPenalty: 0,
    bandLabel: "",
    bandColor: "text-muted-foreground",
    verdict: "",
    breakdown: [],
  });

  const nums = [i.weightLb, i.horsepower, i.occupantsLb, i.decimals];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field.");
  if (i.weightLb < 1200 || i.weightLb > 12000) return blank("Curb weight should be between 1,200 and 12,000 lb.");
  if (i.horsepower < 30 || i.horsepower > 2000) return blank("Horsepower should be between 30 and 2,000.");
  if (i.occupantsLb < 0 || i.occupantsLb > 1200) return blank("Occupant / cargo weight should be between 0 and 1,200 lb.");

  const weight = i.weightLb + i.occupantsLb;
  const powerToWeight = i.horsepower / weight; // hp per lb
  const hpPerTonne = i.horsepower / (weight * 0.45359237 / 1000);

  // Energy method: t = m·v² / (2·P·η) with η ≈ 0.85 driveline + shift-gaps folded in,
  // v = 60 mph = 26.82 m/s, P in watts. First-order: ignores aero drag and traction
  // saturation, so empirical corrections are applied on top.
  const m = weight * 0.45359237;
  const v = 26.8224;
  const watts = i.horsepower * 745.699872;
  const energyBase = (0.5 * m * v * v) / (0.85 * watts); // seconds, idealised

  const driveFactor = i.drivetrain === "awd" ? 1.0 : i.drivetrain === "rwd" ? 1.06 : 1.1;
  const tireFactor = i.tireGrip === "drag" ? 0.93 : i.tireGrip === "performance" ? 0.97 : 1.0;
  const gearFactor = i.gearbox === "dct" ? 1.0 : i.gearbox === "automatic" ? 1.03 : 1.05;
  const launchPenalty = driveFactor * tireFactor * gearFactor;
  const t60 = energyBase * launchPenalty;

  // Hale's quarter-mile relations from the same power-to-weight.
  const quarterET = 5.825 * Math.pow(weight / i.horsepower, 1 / 3);
  const quarterTrap = 234 * Math.pow(i.horsepower / weight, 1 / 3);

  const band =
    t60 < 3.2
      ? { label: "Hypercar territory", color: "text-violet-600" }
      : t60 < 4.5
        ? { label: "Supercar / performance car", color: "text-emerald-600" }
        : t60 < 6.0
          ? { label: "Quick — sporty daily", color: "text-emerald-600" }
          : t60 < 8.0
            ? { label: "Average modern car", color: "text-foreground" }
            : t60 < 11.0
              ? { label: "Slow — economy territory", color: "text-orange-600" }
              : { label: "Very slow", color: "text-orange-600" };

  const verdict = `A ${fmt(weight, 0)} lb car at ${fmt(i.horsepower, 0)} hp (${fmt(hpPerTonne, 0)} hp/tonne) with ${i.drivetrain.toUpperCase()} launch, ${i.tireGrip} tires and a ${i.gearbox} gearbox should run 0–60 in about ${fmt(t60, 2)} s and the quarter mile in ${fmt(quarterET, 2)} s at ${fmt(quarterTrap, 0)} mph.`;

  const d = Math.max(0, Math.min(2, i.decimals));
  const breakdown = [
    { label: "Effective test weight (curb + occupants)", value: `${fmt(weight, 0)} lb` },
    { label: "Engine power", value: `${fmt(i.horsepower, 0)} hp` },
    { label: "Power-to-weight", value: `${fmt(powerToWeight * 1000, 0)} hp / 1,000 lb`, highlight: true },
    { label: "Metric equivalent", value: `${fmt(hpPerTonne, 0)} hp / tonne` },
    { label: "Ideal energy-method 0–60 (0.85 driveline eff.)", value: `${fmt(energyBase, 2)} s` },
    { label: `Launch correction (${i.drivetrain.toUpperCase()} × ${i.tireGrip} × ${i.gearbox})`, value: `× ${fmt(launchPenalty, 3)}` },
    { label: "Estimated 0–60 mph", value: `${fmt(t60, d)} s`, highlight: true },
    { label: "Estimated quarter-mile ET (Hale)", value: `${fmt(quarterET, d)} s` },
    { label: "Estimated quarter-mile trap speed", value: `${fmt(quarterTrap, 1)} mph` },
    { label: "0–60 as share of quarter-mile", value: `${fmt((t60 / quarterET) * 100, 0)}%` },
  ];

  return {
    valid: true,
    errorMsg: "",
    powerToWeight,
    hpPerTonne,
    t60,
    quarterET,
    quarterTrap,
    energyBase,
    launchPenalty,
    bandLabel: band.label,
    bandColor: band.color,
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

export default function CarPerformance060Calculator() {
  const [weightLb, setWeightLb] = useState(String(DEFAULTS.weightLb));
  const [horsepower, setHorsepower] = useState(String(DEFAULTS.horsepower));
  const [drivetrain, setDrivetrain] = useState(String(DEFAULTS.drivetrain));
  const [tireGrip, setTireGrip] = useState(String(DEFAULTS.tireGrip));
  const [gearbox, setGearbox] = useState(String(DEFAULTS.gearbox));
  const [occupantsLb, setOccupantsLb] = useState(String(DEFAULTS.occupantsLb));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PerfInputs => ({
    weightLb: parseFloat(weightLb) || 0,
    horsepower: parseFloat(horsepower) || 0,
    drivetrain: (drivetrain as Drivetrain) || "rwd",
    tireGrip: (tireGrip as TireGrip) || "performance",
    gearbox: (gearbox as Gearbox) || "automatic",
    occupantsLb: parseFloat(occupantsLb) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<PerfInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PerfResult>(() => calculatePerf(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculatePerf(inputs));
  };

  const reset = () => {
    setWeightLb(String(DEFAULTS.weightLb));
    setHorsepower(String(DEFAULTS.horsepower));
    setDrivetrain(String(DEFAULTS.drivetrain));
    setTireGrip(String(DEFAULTS.tireGrip));
    setGearbox(String(DEFAULTS.gearbox));
    setOccupantsLb(String(DEFAULTS.occupantsLb));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculatePerf(DEFAULTS));
  };

  const weightNum = parseFloat(weightLb);
  const hpNum = parseFloat(horsepower);

  const errors = {
    weightLb: !Number.isFinite(weightNum) || weightNum < 1200 ? "Enter 1,200–12,000 lb" : "",
    horsepower: !Number.isFinite(hpNum) || hpNum < 30 ? "Enter 30–2,000 hp" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How does a calculator estimate 0–60 from just weight and power?",
      answer:
        "The core physics is the energy method: accelerating a mass to 60 mph requires a fixed kinetic energy, and the time to deliver it is mass times velocity squared divided by twice the driveline power — roughly half a car's mass at 26.8 m/s against 85% of crank horsepower. That idealised number is then corrected for the things the energy method cannot see: launch traction (all-wheel drive hooks up best), tire compound and shift gaps. The result lands within a few tenths of instrumented tests for most cars, which is respectable for two inputs.",
    },
    {
      question: "Why do all-wheel-drive cars launch faster than the same power rear-wheel drive?",
      answer:
        "Acceleration is limited by traction before it is limited by power at the start of a run. A rear-drive car with 400 hp can spin its tires through first and part of second gear, so much of that power is spent as smoke rather than motion; an all-wheel-drive car spreads the same torque over four contact patches and accelerates at what the power allows. That is why the correction factor is 1.00 for AWD, 1.06 for RWD and 1.10 for FWD — and why sticky tires are worth more on a powerful rear-drive car than a weak one.",
    },
    {
      question: "How accurate is the quarter-mile estimate?",
      answer:
        "The quarter-mile figures use Hale's cube-root relations — ET = 5.825 × (weight/power)^⅓ and trap speed = 234 × (power/weight)^⅓ — which are fitted to thousands of drag-strip runs and are typically within about 3% for conventional cars. They break down at the extremes: very low powered vehicles (heavy trucks), extremely sticky drag cars that leave hard, or cars with tall gearing. Treat the ET as a strip-day expectation on street tires and the trap speed as the better indicator of real power.",
    },
    {
      question: "What changes more the 0–60 time: weight or horsepower?",
      answer:
        "For a typical car, percentage changes in either move the result almost identically, because both enter the energy method linearly — 10% less weight or 10% more power each cut the idealised time by about 10%. In practice weight also affects braking, cornering and tire wear, so on real roads removing mass usually pays twice. Add the occupant and cargo weight in the calculator: two 180 lb passengers add 360 lb, which on a 3,400 lb, 300 hp car costs roughly two tenths.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Car Performance 0-60 Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Car Performance (0-60) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Weight & Power">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="weight"
                  label="Curb Weight"
                  value={weightLb}
                  onChange={setWeightLb}
                  onEnter={runCalculate}
                  min="1200"
                  max="12000"
                  step="50"
                  suffix="lb"
                  error={errors.weightLb}
                  hint="Empty car, no cargo."
                  tooltip="Manufacturer curb weight in pounds."
                />
                <CompactInput
                  id="hp"
                  label="Horsepower"
                  value={horsepower}
                  onChange={setHorsepower}
                  onEnter={runCalculate}
                  min="30"
                  max="2000"
                  step="5"
                  suffix="hp"
                  error={errors.horsepower}
                  hint="Crank, not wheel, figure."
                  tooltip="Rated engine output at the crank."
                />
              </div>
            </SubSection>

            <SubSection title="Launch & Drivetrain">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="drivetrain"
                  label="Drivetrain"
                  value={drivetrain}
                  onChange={setDrivetrain}
                  options={DRIVE_OPTIONS}
                  tooltip="Sets the traction correction: AWD 1.00, RWD 1.06, FWD 1.10."
                />
                <CompactSelect
                  id="gearbox"
                  label="Transmission"
                  value={gearbox}
                  onChange={setGearbox}
                  options={GEARBOX_OPTIONS}
                  tooltip="Shift gaps: dual-clutch 1.00, auto 1.03, manual 1.05."
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
                  <SubSection title="Tires & Load">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="tires"
                        label="Tire Compound"
                        value={tireGrip}
                        onChange={setTireGrip}
                        options={TIRE_OPTIONS}
                        tooltip="Grip correction: drag 0.93, performance 0.97, all-season 1.00."
                      />
                      <CompactInput
                        id="cargo"
                        label="Occupants & Cargo"
                        value={occupantsLb}
                        onChange={setOccupantsLb}
                        onEnter={runCalculate}
                        min="0"
                        max="1200"
                        step="20"
                        suffix="lb"
                        hint="Add to curb weight."
                        tooltip="Extra mass carried during the run — passengers, luggage, fluids."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Display">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        options={DECIMAL_OPTIONS}
                        tooltip="Decimal places on time figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Estimated 0–60 mph</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.t60, calcInputs.decimals)} s` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.bandLabel} · power-to-weight ${fmt(results.hpPerTonne, 0)} hp/tonne`
                  : "Enter weight and power to estimate the run"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Quarter-Mile ET</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.quarterET, 2)} s` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Trap Speed</span>
                <span className="font-extrabold text-foreground">{results.valid ? `${fmt(results.quarterTrap, 0)} mph` : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">hp / 1,000 lb</span>
                <span className={`font-extrabold ${results.valid ? results.bandColor : "text-muted-foreground"}`}>
                  {results.valid ? fmt(results.powerToWeight * 1000, 0) : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Performance Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Estimate</th>
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
                        Enter the weight and power figures to model the run.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Launch correction applied</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.launchPenalty, 3)} × · ideal ${fmt(results.energyBase, 2)} s`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">0–60 mph</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.t60, calcInputs.decimals)} s` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Quarter-mile ET</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.quarterET, calcInputs.decimals)} s` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Trap speed</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.quarterTrap, 1)} mph` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Power-to-weight</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.hpPerTonne, 0)} hp/t` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Performance band</span>
                  <span className={`text-base font-bold ${results.valid ? results.bandColor : "text-muted-foreground"}`}>
                    {results.valid ? results.bandLabel : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Launch correction</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `× ${fmt(results.launchPenalty, 3)}` : "—"}</span>
                </div>
              </div>
              {results.valid && <p className="text-[11px] mt-3 font-semibold text-muted-foreground">{results.verdict}.</p>}
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Car Performance 0-60 Calculator?</h2>
            <p>
              A car performance 0-60 calculator estimates how quickly a vehicle accelerates from standstill to 60 mph using its weight,
              power and launch characteristics — no dyno, drag strip or GPS box required. The engine driving the estimate is the energy
              method: reaching 60 mph demands a fixed amount of kinetic energy, and the time to deliver it follows directly from
              power-to-weight. Corrections for drivetrain layout, tire compound and transmission type then account for the physics the
              core model cannot see, chiefly traction saturation at launch and shift gaps.
            </p>
            <p>
              The same run produces quarter-mile figures through Hale's cube-root relations, fitted to thousands of real strip passes.
              Together the two estimates give a rounded picture of straight-line performance — the 0-60 time that reviewers quote and the
              trap speed that drag racers trust as the honest signal of actual power.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The energy method treats the run as one big energy transfer: half the car's mass times the square of 60 mph, divided by the
              driveline power — crank horsepower times a realistic 85% delivery efficiency. A 3,400 lb, 300 hp car resolves to about 4.7
              seconds in that idealised world. Reality is slower, so three correction factors stack on top: 1.00 for all-wheel drive
              against 1.06 for rear and 1.10 for front; 0.93 to 1.00 for tire compound; and 1.00 to 1.05 for gearbox. Dual-clutch
              transmissions change gear with almost no torque interruption, manual gearboxes cost a shift and a human, and torque
              converters sit in between.
            </p>
            <p>
              The quarter-mile side uses Hale's empirical fits: ET equals 5.825 times the cube root of weight divided by power, and trap
              speed equals 234 times the cube root of power divided by weight. Because the relations are cubic, small power gains matter
              more as a car gets faster — the trap speed is the more sensitive indicator of genuine horsepower, which is why strip
              regulars read trap before ET. The breakdown table shows the idealised time, the correction stack and the final estimate
              side by side, so the cost of each launch penalty is visible rather than buried.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the 0-60 estimate with a performance band label, and the three-stat bar adds the quarter-mile ET, trap
              speed and the power-to-weight figure that drives everything. The band is a sanity check against published tests: production
              cars under 3.2 seconds are hypercars, 4.5 to 6.0 covers quick sporty dailies, and most modern economy cars land between 8
              and 11. If the estimate disagrees with a magazine figure by more than a few tenths, the usual suspects are drivetrain loss
              assumptions, underrated factory power figures or an optimistic curb weight — every input is editable, so test the
              sensitivity rather than trusting one configuration.
            </p>
            <p>
              Two cautions apply. First, the model ignores aerodynamic drag, which is negligible at 60 mph but not at 130 — the
              quarter-mile trap speed remains sound, but top-speed questions need a different tool. Second, altitude, temperature and
              surface move real-world runs by tenths on their own; instrumented tests from a hot day at 5,000 ft are not comparable to a
              cool sea-level pass. Use the calculator to compare configurations of the same car — tires, passengers, power mods — where
              those environmental factors cancel out, and the differences the model shows are the ones you will actually feel.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/car-performance060-calculator" />
          <PopularCalculators exclude="/calculator/car-performance060-calculator" />
        </div>
      </div>
    </>
  );
}
