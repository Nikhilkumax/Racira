"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface AlloySpec {
  key: string;
  label: string;
  fatigueDuctility: number;
  exponentConstant: number;
  activationEnergy: number;
}

/**
 * Engelmaier fatigue ductility coefficients and Norris–Landzberg activation
 * energies for the common solder alloys. The activation energy is expressed in
 * electron volts and converted to kelvin through Boltzmann's constant.
 */
const ALLOYS: AlloySpec[] = [
  { key: "sn63pb37", label: "Sn63/Pb37 eutectic", fatigueDuctility: 0.325, exponentConstant: 0.442, activationEnergy: 0.122 },
  { key: "sac305", label: "SAC305 (Sn96.5/Ag3.0/Cu0.5)", fatigueDuctility: 0.32, exponentConstant: 0.5, activationEnergy: 0.1 },
  { key: "sac405", label: "SAC405 (Sn95.5/Ag4.0/Cu0.5)", fatigueDuctility: 0.3, exponentConstant: 0.52, activationEnergy: 0.09 },
  { key: "snag", label: "SnAg (Sn96.5/Ag3.5)", fatigueDuctility: 0.29, exponentConstant: 0.53, activationEnergy: 0.09 },
  { key: "sncu", label: "SnCu (Sn99.3/Cu0.7)", fatigueDuctility: 0.27, exponentConstant: 0.55, activationEnergy: 0.08 },
];

interface PackageSpec {
  key: string;
  label: string;
  dnp: number;
  cteMismatch: number;
  jointHeight: number;
}

/**
 * Distance to the neutral point, board-to-package CTE mismatch and joint height for
 * the package families that dominate thermal cycling failures.
 */
const PACKAGES: PackageSpec[] = [
  { key: "chip1206", label: "1206 chip resistor / capacitor", dnp: 1.5, cteMismatch: 11, jointHeight: 0.08 },
  { key: "chip0805", label: "0805 chip resistor / capacitor", dnp: 1.0, cteMismatch: 11, jointHeight: 0.08 },
  { key: "soic", label: "SOIC-8 (gull wing)", dnp: 2.5, cteMismatch: 10.5, jointHeight: 0.12 },
  { key: "tssop", label: "TSSOP-20 (gull wing)", dnp: 3.2, cteMismatch: 10, jointHeight: 0.1 },
  { key: "qfn", label: "QFN-32 (perimeter joint)", dnp: 2.5, cteMismatch: 9.5, jointHeight: 0.05 },
  { key: "bga", label: "15 mm plastic BGA", dnp: 5.3, cteMismatch: 10, jointHeight: 0.35 },
  { key: "cbga", label: "25 mm ceramic BGA", dnp: 8.8, cteMismatch: 10.5, jointHeight: 0.55 },
  { key: "module", label: "Large ceramic module", dnp: 15, cteMismatch: 11.5, jointHeight: 0.7 },
];

const BOLTZMANN_K = 1.380649e-23;
const EV_TO_J = 1.602176634e-19;
const THERMAL_CYCLES_PER_YEAR_BASIS = 365;

interface SolderInputs {
  alloy: string;
  packageKey: string;
  dnp: number;
  cteMismatch: number;
  jointHeight: number;
  deltaTField: number;
  deltaTTest: number;
  cyclesPerDay: number;
  dwellMinutes: number;
  meanTempC: number;
  maxTempFieldC: number;
  maxTempTestC: number;
  targetYears: number;
  decimals: number;
}

const DEFAULTS: SolderInputs = {
  alloy: "sac305",
  packageKey: "bga",
  dnp: 5.3,
  cteMismatch: 10,
  jointHeight: 0.35,
  deltaTField: 45,
  deltaTTest: 100,
  cyclesPerDay: 2,
  dwellMinutes: 20,
  meanTempC: 40,
  maxTempFieldC: 70,
  maxTempTestC: 125,
  targetYears: 10,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface SolderResult {
  valid: boolean;
  errorMsg: string;
  shearStrainPct: number;
  fatigueExponent: number;
  cyclesToFailure: number;
  yearsToFailure: number;
  cyclesPerYear: number;
  accelerationFactor: number;
  equivalentTestCycles: number;
  damagePerYear: number;
  marginYears: number;
  meetsTarget: boolean;
  alloyLabel: string;
  packageLabel: string;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateSolder(input: SolderInputs): SolderResult {
  const alloy = ALLOYS.find((a) => a.key === input.alloy) || ALLOYS[0];
  const pkg = PACKAGES.find((p) => p.key === input.packageKey) || PACKAGES[0];

  const blank = (errorMsg: string): SolderResult => ({
    valid: false,
    errorMsg,
    shearStrainPct: 0,
    fatigueExponent: 0,
    cyclesToFailure: 0,
    yearsToFailure: 0,
    cyclesPerYear: 0,
    accelerationFactor: 0,
    equivalentTestCycles: 0,
    damagePerYear: 0,
    marginYears: 0,
    meetsTarget: false,
    alloyLabel: alloy.label,
    packageLabel: pkg.label,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.dnp,
    input.cteMismatch,
    input.jointHeight,
    input.deltaTField,
    input.deltaTTest,
    input.cyclesPerDay,
    input.dwellMinutes,
    input.meanTempC,
    input.maxTempFieldC,
    input.maxTempTestC,
    input.targetYears,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to run the fatigue estimate.");
  if (input.dnp <= 0) return blank("The distance to the neutral point must be greater than zero.");
  if (input.cteMismatch <= 0) return blank("The CTE mismatch must be greater than zero.");
  if (input.jointHeight <= 0) return blank("Joint height must be greater than zero.");
  if (input.deltaTField <= 0 || input.deltaTField > 200) return blank("Field thermal excursion should be between 1 and 200 °C.");
  if (input.deltaTTest <= 0 || input.deltaTTest > 300) return blank("Test thermal excursion should be between 1 and 300 °C.");
  if (input.cyclesPerDay <= 0 || input.cyclesPerDay > 200) return blank("Cycles per day should be between 0.1 and 200.");
  if (input.dwellMinutes <= 0 || input.dwellMinutes > 1440) return blank("Dwell time should be between 0.1 and 1,440 minutes.");
  if (input.maxTempFieldC < -40 || input.maxTempFieldC > 200) return blank("Peak field temperature should be between −40 °C and 200 °C.");
  if (input.maxTempTestC < 0 || input.maxTempTestC > 250) return blank("Peak test temperature should be between 0 °C and 250 °C.");
  if (input.targetYears <= 0 || input.targetYears > 50) return blank("Service life target should be between 1 and 50 years.");

  const d = Math.max(0, Math.min(2, input.decimals));

  // Engelmaier inelastic shear strain per thermal cycle: the CTE mismatch across the
  // distance to the neutral point, divided by the joint height that has to absorb it.
  const shearStrain = (input.dnp * input.cteMismatch * input.deltaTField) / (input.jointHeight * 1000);
  const shearStrainPct = shearStrain * 100;

  // Engelmaier fatigue ductility exponent: c = −0.442 − 6×10⁻⁴·T̄ + 1.74×10⁻²·ln(1 + 360/t_D),
  // with the mean cyclic temperature in °C and the dwell in minutes.
  const fatigueExponent =
    -alloy.exponentConstant -
    6e-4 * input.meanTempC +
    1.74e-2 * Math.log(1 + 360 / input.dwellMinutes);

  // Coffin–Manson: Nf = ½ (Δγ / (2 εf))^(1/c), the classic Engelmaier closed form.
  const cyclesToFailure = 0.5 * Math.pow(shearStrain / (2 * alloy.fatigueDuctility), 1 / fatigueExponent);
  if (!Number.isFinite(cyclesToFailure) || cyclesToFailure <= 0) {
    return blank("The strain and exponent combination does not produce a finite life — check the joint height and excursion.");
  }

  const cyclesPerYear = input.cyclesPerDay * THERMAL_CYCLES_PER_YEAR_BASIS;
  const yearsToFailure = cyclesToFailure / cyclesPerYear;

  // Norris–Landzberg acceleration factor between the test and the field condition:
  // excursion ratio to the 1.9 power, frequency ratio to the one-third power, and an
  // Arrhenius term using the peak temperatures in kelvin.
  const testMaxK = input.maxTempTestC + 273.15;
  const fieldMaxK = input.maxTempFieldC + 273.15;
  const activationKelvin = (alloy.activationEnergy * EV_TO_J) / BOLTZMANN_K;
  const accelerationFactor =
    Math.pow(input.deltaTTest / input.deltaTField, 1.9) *
    Math.pow(input.cyclesPerDay / (24 * 60 / 90), 1 / 3) *
    Math.exp(activationKelvin * (1 / fieldMaxK - 1 / testMaxK));

  const equivalentTestCycles = cyclesToFailure / (accelerationFactor > 0 ? accelerationFactor : 1);
  const damagePerYear = cyclesPerYear / cyclesToFailure;
  const marginYears = yearsToFailure - input.targetYears;
  const meetsTarget = marginYears >= 0;

  const verdict = meetsTarget
    ? `The joint survives about ${fmt(yearsToFailure, 0)} years at ${fmt(
        input.cyclesPerDay,
        1,
      )} cycling events a day, which clears the ${fmt(input.targetYears, 0)} year target with ${fmt(marginYears, 0)} years in hand`
    : `Predicted life is ${fmt(yearsToFailure, 1)} years against a ${fmt(
        input.targetYears,
        0,
      )} year target — the joint height, the package footprint or the field excursion has to change`;
  const verdictColor = meetsTarget ? "text-emerald-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    { label: "Solder alloy", value: alloy.label },
    { label: "Package family", value: pkg.label },
    { label: "Distance to the neutral point", value: `${fmt(input.dnp, 2)} mm` },
    { label: "Board-to-package CTE mismatch", value: `${fmt(input.cteMismatch, 1)} ppm/K` },
    { label: "Joint stand-off height", value: `${fmt(input.jointHeight, 3)} mm` },
    { label: `Field excursion ΔT of ${fmt(input.deltaTField, 0)} °C`, value: `${fmt(input.deltaTField * input.cteMismatch * input.dnp, 1)} ppm·mm of expansion difference` },
    { label: "Inelastic shear strain per cycle", value: `${fmt(shearStrainPct, 3)}%`, highlight: true },
    { label: `Fatigue ductility coefficient εf = ${fmt(alloy.fatigueDuctility, 3)}`, value: `strain ratio ${fmt(shearStrain / (2 * alloy.fatigueDuctility), 4)}` },
    { label: `Mean cyclic temperature ${fmt(input.meanTempC, 0)} °C at ${fmt(input.dwellMinutes, 0)} min dwell`, value: `fatigue exponent c = ${fmt(fatigueExponent, 3)}` },
    { label: "Cycles to failure (Coffin–Manson)", value: `${fmt(cyclesToFailure, 0)} cycles`, highlight: true },
    { label: `Cycling rate of ${fmt(input.cyclesPerDay, 1)} per day`, value: `${fmt(cyclesPerYear, 0)} cycles a year` },
    { label: "Predicted time to failure", value: `${fmt(yearsToFailure, 1)} years`, highlight: true },
    { label: "Target service life", value: `${fmt(input.targetYears, 0)} years` },
    { label: "Margin against the target", value: `${marginYears >= 0 ? "+" : "−"}${fmt(Math.abs(marginYears), 1)} years` },
    { label: `Norris–Landzberg acceleration, ΔT ${fmt(input.deltaTTest, 0)} °C test vs ${fmt(input.deltaTField, 0)} °C field`, value: `AF = ${fmt(accelerationFactor, 1)}` },
    { label: "Equivalent test cycles for the same damage", value: `${fmt(equivalentTestCycles, 0)} cycles` },
    { label: "Damage fraction consumed per year", value: `${fmt(damagePerYear, 4)} of the joint's life` },
    { label: "Cycles accumulated by the end of the target life", value: `${fmt(input.targetYears * cyclesPerYear, 0)} cycles` },
  ];

  return {
    valid: true,
    errorMsg: "",
    shearStrainPct,
    fatigueExponent,
    cyclesToFailure,
    yearsToFailure,
    cyclesPerYear,
    accelerationFactor,
    equivalentTestCycles,
    damagePerYear,
    marginYears,
    meetsTarget,
    alloyLabel: alloy.label,
    packageLabel: pkg.label,
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

export default function SolderJointReliabilityCalculator() {
  const [alloy, setAlloy] = useState<string>(DEFAULTS.alloy);
  const [packageKey, setPackageKey] = useState<string>(DEFAULTS.packageKey);
  const [dnp, setDnp] = useState(String(DEFAULTS.dnp));
  const [cteMismatch, setCteMismatch] = useState(String(DEFAULTS.cteMismatch));
  const [jointHeight, setJointHeight] = useState(String(DEFAULTS.jointHeight));
  const [deltaTField, setDeltaTField] = useState(String(DEFAULTS.deltaTField));
  const [deltaTTest, setDeltaTTest] = useState(String(DEFAULTS.deltaTTest));
  const [cyclesPerDay, setCyclesPerDay] = useState(String(DEFAULTS.cyclesPerDay));
  const [dwellMinutes, setDwellMinutes] = useState(String(DEFAULTS.dwellMinutes));
  const [meanTempC, setMeanTempC] = useState(String(DEFAULTS.meanTempC));
  const [maxTempFieldC, setMaxTempFieldC] = useState(String(DEFAULTS.maxTempFieldC));
  const [maxTempTestC, setMaxTempTestC] = useState(String(DEFAULTS.maxTempTestC));
  const [targetYears, setTargetYears] = useState(String(DEFAULTS.targetYears));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const applyPackage = (key: string) => {
    setPackageKey(key);
    const spec = PACKAGES.find((p) => p.key === key);
    if (spec) {
      setDnp(String(spec.dnp));
      setCteMismatch(String(spec.cteMismatch));
      setJointHeight(String(spec.jointHeight));
    }
  };

  const getInputs = (): SolderInputs => ({
    alloy,
    packageKey,
    dnp: parseFloat(dnp) || 0,
    cteMismatch: parseFloat(cteMismatch) || 0,
    jointHeight: parseFloat(jointHeight) || 0,
    deltaTField: parseFloat(deltaTField) || 0,
    deltaTTest: parseFloat(deltaTTest) || 0,
    cyclesPerDay: parseFloat(cyclesPerDay) || 0,
    dwellMinutes: parseFloat(dwellMinutes) || 0,
    meanTempC: parseFloat(meanTempC) || 0,
    maxTempFieldC: parseFloat(maxTempFieldC) || 0,
    maxTempTestC: parseFloat(maxTempTestC) || 0,
    targetYears: parseFloat(targetYears) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<SolderInputs>(() => DEFAULTS);
  const [results, setResults] = useState<SolderResult>(() => calculateSolder(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateSolder(inputs));
  };

  const reset = () => {
    setAlloy(DEFAULTS.alloy);
    setPackageKey(DEFAULTS.packageKey);
    setDnp(String(DEFAULTS.dnp));
    setCteMismatch(String(DEFAULTS.cteMismatch));
    setJointHeight(String(DEFAULTS.jointHeight));
    setDeltaTField(String(DEFAULTS.deltaTField));
    setDeltaTTest(String(DEFAULTS.deltaTTest));
    setCyclesPerDay(String(DEFAULTS.cyclesPerDay));
    setDwellMinutes(String(DEFAULTS.dwellMinutes));
    setMeanTempC(String(DEFAULTS.meanTempC));
    setMaxTempFieldC(String(DEFAULTS.maxTempFieldC));
    setMaxTempTestC(String(DEFAULTS.maxTempTestC));
    setTargetYears(String(DEFAULTS.targetYears));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateSolder(DEFAULTS));
  };

  const dnpNum = parseFloat(dnp);
  const cteNum = parseFloat(cteMismatch);
  const heightNum = parseFloat(jointHeight);
  const fieldNum = parseFloat(deltaTField);
  const testNum = parseFloat(deltaTTest);
  const cyclesNum = parseFloat(cyclesPerDay);

  const errors = {
    dnp: !Number.isFinite(dnpNum) || dnpNum <= 0 ? "Must be greater than zero" : "",
    cteMismatch: !Number.isFinite(cteNum) || cteNum <= 0 ? "Must be greater than zero" : "",
    jointHeight: !Number.isFinite(heightNum) || heightNum <= 0 ? "Must be greater than zero" : "",
    deltaTField: !Number.isFinite(fieldNum) || fieldNum <= 0 || fieldNum > 200 ? "Use 1–200 °C" : "",
    deltaTTest: !Number.isFinite(testNum) || testNum <= 0 || testNum > 300 ? "Use 1–300 °C" : "",
    cyclesPerDay: !Number.isFinite(cyclesNum) || cyclesNum <= 0 || cyclesNum > 200 ? "Use 0.1–200" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "What causes solder joint fatigue?",
      answer:
        "Thermal cycling. The board and the package expand by different amounts as temperature changes, and the solder joint has to absorb the difference because it is the softest element in the assembly. Each cycle shears the joint inelastically, and the accumulated damage eventually cracks it, usually starting at the interface between the solder and the copper pad on the package side. The strain per cycle depends on three things: the CTE mismatch, the distance from the joint to the neutral point of the package, and how tall the joint stands.",
    },
    {
      question: "What does the distance to the neutral point do to the life estimate?",
      answer:
        "It is the single most powerful geometric term, because the strain is directly proportional to it. A joint at the corner of a 15 mm ball grid array sits about 5.3 mm from the neutral point and accumulates more than three times the strain of a joint on an 0805 chip at 1 mm. That is why large packages fail at their corner balls first while their centre balls survive, why perimeter-ball and corner-ball reinforcements exist, and why a bigger package with the same solder alloy can have far shorter life than a small one.",
    },
    {
      question: "How is the acceleration factor used?",
      answer:
        "It converts between a test condition and the field condition so the two can be compared on equal terms. The Norris–Landzberg form used here raises the ratio of the test and field excursions to the 1.9 power, adjusts slightly for cycling frequency, and adds an Arrhenius term based on the peak temperatures in kelvin — hotter peaks accelerate the damage far more than the same excursion at a lower temperature. A typical accelerated test at 100 °C excursion therefore represents a far greater number of field cycles than its raw count suggests, and the equivalent test cycles figure is what a qualification plan should be written against.",
    },
    {
      question: "Why do lead-free joints often outlast tin-lead ones in this model?",
      answer:
        "Because they are stiffer and stronger at temperature, so their fatigue ductility exponents and coefficients differ in a way that often favours SAC alloys under accelerated cycling. The trade is not free: lead-free joints are more brittle in drop and vibration loading, they creep less (which is what makes them look better under thermal cycling), and their higher melting points mean the strain behaviour is different again in harsh environments. That is why the model exposes the alloy parameters rather than hiding them behind a single reliability number.",
    },
    {
      question: "How accurate is a Coffin–Manson life estimate?",
      answer:
        "It is an engineering estimate, best used for comparing designs rather than for predicting a failure date. The strain calculation assumes a rigid joint, a uniform temperature across the assembly and a single dominant failure mechanism; real assemblies have underfill, mould compound, conformal coating, thermal gradients and package warpage that all change the answer — sometimes by a factor of two in either direction. Calibrate the coefficients against your own test data, or against the same package family measured in the same thermal chamber, and the comparison between two candidate joint heights or two alloys becomes genuinely useful.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Solder Joint Reliability Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Solder Joint Reliability Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Materials">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="alloy"
                  label="Solder Alloy"
                  value={alloy}
                  onChange={setAlloy}
                  options={ALLOYS.map((a) => ({ value: a.key, label: a.label }))}
                  tooltip="Sets the fatigue ductility coefficient, the exponent constant and the activation energy."
                />
                <CompactSelect
                  id="package"
                  label="Package"
                  value={packageKey}
                  onChange={applyPackage}
                  options={PACKAGES.map((p) => ({ value: p.key, label: p.label }))}
                  tooltip="Fills the distance to the neutral point, the CTE mismatch and the joint height."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="dnp"
                  label="Distance to Neutral Point"
                  value={dnp}
                  onChange={setDnp}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="mm"
                  error={errors.dnp}
                  hint="Corner joint on a BGA."
                  tooltip="Distance from the package centre to the joint being assessed; strain scales directly with it."
                />
                <CompactInput
                  id="cte"
                  label="CTE Mismatch"
                  value={cteMismatch}
                  onChange={setCteMismatch}
                  onEnter={runCalculate}
                  min="0.1"
                  step="any"
                  suffix="ppm/K"
                  error={errors.cteMismatch}
                  hint="FR-4 17 ppm/K, ceramic 7 ppm/K."
                  tooltip="Difference in coefficient of thermal expansion between the board and the package."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="height"
                  label="Joint Height"
                  value={jointHeight}
                  onChange={setJointHeight}
                  onEnter={runCalculate}
                  min="0.01"
                  step="any"
                  suffix="mm"
                  error={errors.jointHeight}
                  hint="Taller joints last longer."
                  tooltip="Stand-off height of the solder joint, which absorbs the expansion difference."
                />
                <CompactInput
                  id="target"
                  label="Service Target"
                  value={targetYears}
                  onChange={setTargetYears}
                  onEnter={runCalculate}
                  min="1"
                  max="50"
                  step="1"
                  suffix="years"
                  tooltip="Design life the predicted life is compared against."
                />
              </div>
            </SubSection>

            <SubSection title="Thermal Environment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="dt-field"
                  label="Field Excursion ΔT"
                  value={deltaTField}
                  onChange={setDeltaTField}
                  onEnter={runCalculate}
                  min="1"
                  max="200"
                  step="1"
                  suffix="°C"
                  error={errors.deltaTField}
                  tooltip="Temperature swing the product actually sees in service."
                />
                <CompactInput
                  id="cycles"
                  label="Cycles per Day"
                  value={cyclesPerDay}
                  onChange={setCyclesPerDay}
                  onEnter={runCalculate}
                  min="0.1"
                  max="200"
                  step="any"
                  error={errors.cyclesPerDay}
                  hint="Vehicle: 2–4 power cycles."
                  tooltip="Number of full thermal cycles per day; it converts cycles to failure into time."
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
                  <SubSection title="Cycle Shape">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="mean-temp"
                        label="Mean Cyclic Temperature"
                        value={meanTempC}
                        onChange={setMeanTempC}
                        onEnter={runCalculate}
                        min="-40"
                        max="150"
                        step="1"
                        suffix="°C"
                        tooltip="Mid-point temperature of the cycle; it enters the fatigue ductility exponent."
                      />
                      <CompactInput
                        id="dwell"
                        label="Dwell Time"
                        value={dwellMinutes}
                        onChange={setDwellMinutes}
                        onEnter={runCalculate}
                        min="0.1"
                        max="1440"
                        step="any"
                        suffix="min"
                        tooltip="Time spent at each extreme; longer dwells let the solder creep and cost life."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Accelerated Test">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="dt-test"
                        label="Test Excursion ΔT"
                        value={deltaTTest}
                        onChange={setDeltaTTest}
                        onEnter={runCalculate}
                        min="1"
                        max="300"
                        step="1"
                        suffix="°C"
                        error={errors.deltaTTest}
                        hint="100 °C is the usual chamber cycle."
                        tooltip="Excursion of the qualification test whose cycles you want to translate."
                      />
                      <CompactInput
                        id="test-max"
                        label="Test Peak Temperature"
                        value={maxTempTestC}
                        onChange={setMaxTempTestC}
                        onEnter={runCalculate}
                        min="0"
                        max="250"
                        step="1"
                        suffix="°C"
                        tooltip="Peak temperature of the test cycle, used in the Arrhenius term."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="field-max"
                        label="Field Peak Temperature"
                        value={maxTempFieldC}
                        onChange={setMaxTempFieldC}
                        onEnter={runCalculate}
                        min="-40"
                        max="200"
                        step="1"
                        suffix="°C"
                        tooltip="Peak temperature in service, also in the Arrhenius term."
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
                        tooltip="Decimal places used for the life and acceleration figures."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Predicted Joint Life</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.yearsToFailure, calcInputs.decimals)} years` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.cyclesToFailure, 0)} thermal cycles at ${fmt(results.shearStrainPct, 2)}% shear strain per cycle, against a ${fmt(
                      calcInputs.targetYears,
                      0,
                    )} year target`
                  : "Fix the highlighted inputs to estimate the life"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shear Strain</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.shearStrainPct, 2)}%` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Test Equivalent</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.equivalentTestCycles, 0)} cyc` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Margin</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${results.marginYears >= 0 ? "+" : "−"}${fmt(Math.abs(results.marginYears), 0)} y` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Reliability Item</th>
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
                        Enter the package, alloy and thermal environment to estimate the life.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Predicted life</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.yearsToFailure, calcInputs.decimals)} years · ${fmt(results.cyclesToFailure, 0)} cycles`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Alloy</span>
                  <span className="text-base font-bold text-foreground">{results.alloyLabel.split(" (")[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Package</span>
                  <span className="text-base font-bold text-foreground">{results.packageLabel}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Shear strain per cycle</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.shearStrainPct, 3)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fatigue exponent</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.fatigueExponent, 3) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cycles to failure</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? fmt(results.cyclesToFailure, 0) : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cycling rate</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.cyclesPerYear, 0)} per year` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Acceleration factor</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? fmt(results.accelerationFactor, 1) : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Damage per year</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.damagePerYear * 100, 2)}%` : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Solder Joint Reliability Calculator?</h2>
            <p>
              A solder joint reliability calculator estimates how many thermal cycles a solder joint survives before it cracks. It combines
              the geometry of the assembly — how far the joint sits from the package centre, how different the board and package expansion
              rates are, how tall the joint stands — with the thermal excursion of the environment, and applies the Coffin–Manson fatigue
              relationship with the Engelmaier solder constants. The answer is a life in cycles and years, matched against a design target
              and translated into the equivalent accelerated-test cycles a qualification plan needs.
            </p>
            <p>
              Thermal fatigue is the dominant wear-out mechanism for surface-mount electronics: a solder joint is the softest part of a
              rigid assembly, so it absorbs every expansion difference between a plastic package and a glass-epoxy board, thousands of
              times over a product's life.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The shear strain per cycle follows from the expansion difference. If a joint sits a distance L from the neutral point of the
              package and the board and package expand at rates that differ by Δα, then a temperature swing of ΔT forces a relative
              displacement of L·Δα·ΔT, and dividing by the joint height h gives the inelastic shear strain the joint must absorb. The
              relationship is unforgiving in each term: doubling the distance to the neutral point doubles the damage, while doubling the
              joint height halves it, which is why taller joints survive longer than the same volume of solder spread flat.
            </p>
            <p>
              The strain is then converted into cycles to failure by the Coffin–Manson equation, N_f = ½ (Δγ/(2ε_f))^(1/c). The fatigue
              ductility coefficient ε_f and the exponent c come from the alloy and the cycle shape. Engelmaier's expression for c makes the
              cycle itself part of the answer: c = −0.442 − 6×10⁻⁴·T̄ + 1.74×10⁻²·ln(1 + 360/t_D), where T̄ is the mean cyclic temperature
              in degrees Celsius and t_D the dwell in minutes. Hotter cycles and longer dwells both reduce the exponent, and because the
              exponent is negative a smaller exponent means fewer cycles to failure — the model's way of representing creep damage.
            </p>
            <p>
              Comparing a test chamber with the field uses the Norris–Landzberg acceleration factor: the ratio of test to field excursion
              raised to the 1.9 power, a weak dependence on cycling frequency, and an Arrhenius term in the peak temperatures. A 100 °C
              chamber cycle against a 45 °C field cycle typically accelerates damage by a factor of five or more, so a few hundred test
              cycles can represent many thousands of field cycles — which is what makes accelerated qualification possible at all.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the predicted life in years, with the cycle count and the shear strain per cycle behind it. The three-stat
              bar adds the strain per cycle, the equivalent test cycles for the same accumulated damage, and the margin between the
              predicted life and the target you set.
            </p>
            <p>
              The breakdown table records the alloy and package, the three geometry terms, the strain per cycle, the fatigue ductility
              ratio, the mean temperature and dwell that produced the exponent, the cycles to failure, the cycling rate, the resulting
              time to failure, the acceleration factor, the equivalent test cycles and the damage fraction consumed each year. The summary
              panel repeats the headline numbers and prints the verdict line against your target.
            </p>
            <p>
              Read the result as a comparison tool rather than a prophecy. The model assumes a rigid joint, a uniform assembly temperature
              and a single failure mechanism; underfill, mould compound, conformal coating, package warpage and thermal gradients all move
              the answer, sometimes by a factor of two either way. Its strength is in ranking options — a taller joint, a lower-CTE package,
              a smaller footprint or a reduced field excursion — and in showing how much of the margin a hotter environment consumes. When
              the predicted life and the target are close, that is the point at which experimental confirmation in a thermal chamber
              becomes the right next step rather than more arithmetic.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/solder-joint-reliability-calculator" />
          <PopularCalculators exclude="/calculator/solder-joint-reliability-calculator" />
        </div>
      </div>
    </>
  );
}
