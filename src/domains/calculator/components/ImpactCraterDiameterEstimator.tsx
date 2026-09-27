"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface MaterialSpec {
  key: string;
  label: string;
  density: number;
}

interface BodySpec {
  key: string;
  label: string;
  gravity: number;
  simpleComplexKm: number;
}

interface CraterInputs {
  diameterM: number;
  velocityKmS: number;
  impactorMaterial: string;
  angleDegrees: number;
  targetMaterial: string;
  body: string;
  customImpactorDensity: number;
  decimals: number;
}

const IMPACTOR_MATERIALS: MaterialSpec[] = [
  { key: "ice", label: "Cometary ice", density: 930 },
  { key: "porousRock", label: "Porous rock (carbonaceous)", density: 1500 },
  { key: "denseRock", label: "Dense rock (stony)", density: 3000 },
  { key: "iron", label: "Iron", density: 7900 },
];

const TARGET_MATERIALS: MaterialSpec[] = [
  { key: "water", label: "Water", density: 1000 },
  { key: "sediment", label: "Sedimentary rock", density: 2500 },
  { key: "crystalline", label: "Crystalline rock", density: 2750 },
];

const BODIES: BodySpec[] = [
  { key: "earth", label: "Earth", gravity: 9.81, simpleComplexKm: 3.2 },
  { key: "moon", label: "Moon", gravity: 1.62, simpleComplexKm: 15 },
  { key: "mars", label: "Mars", gravity: 3.71, simpleComplexKm: 7 },
];

const JOULES_PER_MEGATON = 4.184e15;

/** Reference craters the result is placed against. */
const REFERENCE_CRATERS = [
  { name: "Barringer (Arizona)", km: 1.2 },
  { name: "Ries (Germany)", km: 24 },
  { name: "Chicxulub", km: 180 },
  { name: "Vredefort", km: 300 },
];

const DEFAULTS: CraterInputs = {
  diameterM: 50,
  velocityKmS: 17,
  impactorMaterial: "denseRock",
  angleDegrees: 45,
  targetMaterial: "crystalline",
  body: "earth",
  customImpactorDensity: 0,
  decimals: 2,
};

function sciDisplay(v: number, digits = 3): string {
  if (!Number.isFinite(v) || v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e-2 && abs < 1e6) return v.toPrecision(digits + 1);
  const exponent = Math.floor(Math.log10(abs));
  const mantissa = v / Math.pow(10, exponent);
  return `${mantissa.toFixed(2)} × 10^${exponent}`;
}

const fmt = (v: number, d = 2) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CraterResult {
  valid: boolean;
  errorMsg: string;
  massKg: number;
  velocityMs: number;
  kineticEnergyJ: number;
  megatonsTnt: number;
  transientDiameterM: number;
  finalDiameterM: number;
  finalDiameterKm: number;
  depthM: number;
  craterType: string;
  craterTypeColor: string;
  ejectaRadiusKm: number;
  seismicMagnitude: number;
  recurrenceYears: number;
  impactorDensity: number;
  fireballRadiusKm: number;
  bodyLabel: string;
  targetLabel: string;
  scaleComparison: { name: string; km: number; ratio: number }[];
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateCrater(i: CraterInputs): CraterResult {
  const spec = IMPACTOR_MATERIALS.find((m) => m.key === i.impactorMaterial) || IMPACTOR_MATERIALS[2];
  const target = TARGET_MATERIALS.find((t) => t.key === i.targetMaterial) || TARGET_MATERIALS[2];
  const body = BODIES.find((b) => b.key === i.body) || BODIES[0];
  const impactorDensity = i.customImpactorDensity > 0 ? i.customImpactorDensity : spec.density;

  const blank = (errorMsg: string): CraterResult => ({
    valid: false,
    errorMsg,
    massKg: 0,
    velocityMs: 0,
    kineticEnergyJ: 0,
    megatonsTnt: 0,
    transientDiameterM: 0,
    finalDiameterM: 0,
    finalDiameterKm: 0,
    depthM: 0,
    craterType: "",
    craterTypeColor: "text-muted-foreground",
    ejectaRadiusKm: 0,
    seismicMagnitude: 0,
    recurrenceYears: 0,
    impactorDensity,
    fireballRadiusKm: 0,
    bodyLabel: body.label,
    targetLabel: target.label,
    scaleComparison: [],
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    i.diameterM,
    i.velocityKmS,
    i.angleDegrees,
    i.customImpactorDensity,
    i.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to estimate the crater.");
  if (i.diameterM <= 0 || i.diameterM > 100000) return blank("Impactor diameter should be above 0 and no more than 100,000 m.");
  if (i.velocityKmS <= 0 || i.velocityKmS > 100) return blank("Impact velocity should be above 0 and no more than 100 km/s.");
  if (i.angleDegrees <= 0 || i.angleDegrees > 90) return blank("Impact angle should be between 1° and 90° from horizontal.");
  if (i.customImpactorDensity < 0 || i.customImpactorDensity > 20000) {
    return blank("A custom impactor density should be between 0 and 20,000 kg/m³, or 0 to use the material default.");
  }

  const d = Math.max(0, Math.min(4, i.decimals));

  const radius = i.diameterM / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const massKg = volume * impactorDensity;

  const velocityMs = i.velocityKmS * 1000;
  const kineticEnergyJ = 0.5 * massKg * Math.pow(velocityMs, 2);
  const megatonsTnt = kineticEnergyJ / JOULES_PER_MEGATON;

  // Pi-group crater scaling (Holsapple & Schmidt, gravity-dominated regime): the
  // transient crater grows with the cube root of the density ratio, with impactor
  // size and velocity, and shrinks with the target's gravity.
  const angleRad = (Math.min(90, Math.max(0, i.angleDegrees)) * Math.PI) / 180;
  const angleFactor = Math.pow(Math.sin(angleRad), 1 / 3);

  const densityRatio = Math.pow(impactorDensity / target.density, 1 / 3);
  const transientDiameterM =
    1.161 *
    densityRatio *
    Math.pow(i.diameterM, 0.78) *
    Math.pow(velocityMs, 0.44) *
    Math.pow(body.gravity, -0.22) *
    angleFactor;

  // Simple craters relax slightly; complex craters collapse and widen substantially.
  const simpleComplexM = body.simpleComplexKm * 1000;
  let finalDiameterM: number;
  let craterType: string;
  let craterTypeColor: string;

  if (transientDiameterM < simpleComplexM) {
    finalDiameterM = transientDiameterM * 1.25;
    craterType = "Simple bowl-shaped crater";
    craterTypeColor = "text-emerald-600";
  } else {
    finalDiameterM = (1.17 * Math.pow(transientDiameterM, 1.13)) / Math.pow(simpleComplexM, 0.13);
    craterType = "Complex crater with central uplift and terraced walls";
    craterTypeColor = "text-orange-600";
  }

  const finalDiameterKm = finalDiameterM / 1000;

  // Simple craters hold a depth-to-diameter ratio near 1:5; complex craters are
  // proportionally much shallower.
  const depthM =
    transientDiameterM < simpleComplexM ? finalDiameterM / 5 : 0.4 * Math.pow(finalDiameterKm, 0.3) * 1000;

  // The continuous ejecta blanket extends to roughly 2–3 crater radii.
  const ejectaRadiusKm = finalDiameterKm * 1.3;

  // Energy-to-magnitude relation with the standard seismic efficiency of 1e-4.
  const seismicMagnitude = kineticEnergyJ > 0 ? 0.67 * Math.log10(kineticEnergyJ * 1e-4) - 5.87 : 0;

  // Rough terrestrial recurrence interval from the observed impactor size-frequency
  // distribution.
  const recurrenceYears = Math.pow(Math.max(1, i.diameterM), 2.7) / 12;

  // Fireball radius scales roughly as the cube root of the yield.
  const fireballRadiusKm = megatonsTnt > 0 ? 0.28 * Math.pow(megatonsTnt, 1 / 3) : 0;

  const scaleComparison = REFERENCE_CRATERS.map((c) => ({ ...c, ratio: finalDiameterKm / c.km }));

  const verdict =
    finalDiameterKm >= (body.simpleComplexKm || 1)
      ? `A complex crater forms — a ${fmt(finalDiameterKm, d)} km basin with a central uplift, an ejecta blanket reaching ${fmt(
          ejectaRadiusKm,
          d,
        )} km and a seismic magnitude near ${fmt(seismicMagnitude, 1)}`
      : `A simple bowl-shaped crater forms — ${fmt(finalDiameterKm, d)} km across and about ${fmt(depthM, 0)} m deep`;
  const verdictColor = "text-foreground";

  const breakdown: BreakdownRow[] = [
    { label: `Impactor diameter ${fmt(i.diameterM, 1)} m`, value: `sphere of ${fmt(volume, 0)} m³ at ${fmt(impactorDensity, 0)} kg/m³` },
    { label: "Impactor mass", value: `${sciDisplay(massKg)} kg` },
    { label: `Impact velocity ${fmt(i.velocityKmS, 1)} km/s`, value: `${fmt(velocityMs, 0)} m/s` },
    { label: "Kinetic energy", value: `${sciDisplay(kineticEnergyJ)} J`, highlight: true },
    {
      label: "Energy yield in TNT equivalent",
      value: megatonsTnt >= 1 ? `${fmt(megatonsTnt, 2)} Mt` : `${fmt(megatonsTnt * 1000, 1)} kt`,
      highlight: true,
    },
    { label: `Impact angle ${fmt(i.angleDegrees, 0)}° from horizontal`, value: `angle factor ${fmt(angleFactor, 3)} of a vertical impact` },
    { label: `Target ${target.label} at ${fmt(target.density, 0)} kg/m³`, value: `density ratio term ${fmt(densityRatio, 3)}` },
    { label: `Body gravity ${fmt(body.gravity, 2)} m/s²`, value: `gravity term ${fmt(Math.pow(body.gravity, -0.22), 3)}` },
    { label: "Transient crater diameter", value: `${fmt(transientDiameterM / 1000, 3)} km`, highlight: true },
    { label: "Final crater diameter", value: `${fmt(finalDiameterKm, d)} km`, highlight: true },
    { label: "Crater depth", value: depthM >= 1000 ? `${fmt(depthM / 1000, 2)} km` : `${fmt(depthM, 0)} m` },
    { label: `Morphology · simple-complex transition at ${fmt(body.simpleComplexKm, 1)} km on ${body.label}`, value: craterType, highlight: true },
    { label: "Continuous ejecta blanket radius", value: `${fmt(ejectaRadiusKm, d)} km` },
    { label: "Fireball radius", value: `${fmt(fireballRadiusKm, d)} km` },
    { label: "Estimated seismic magnitude", value: fmt(seismicMagnitude, 2) },
    { label: "Recurrence interval for an impactor this size", value: `${fmt(recurrenceYears, 0)} years` },
    ...scaleComparison.map((c) => ({
      label: `Compared with ${c.name} at ${fmt(c.km, 1)} km`,
      value: `${fmt(c.ratio, 2)} times that diameter`,
    })),
  ];

  return {
    valid: true,
    errorMsg: "",
    massKg,
    velocityMs,
    kineticEnergyJ,
    megatonsTnt,
    transientDiameterM,
    finalDiameterM,
    finalDiameterKm,
    depthM,
    craterType,
    craterTypeColor,
    ejectaRadiusKm,
    seismicMagnitude,
    recurrenceYears,
    impactorDensity,
    fireballRadiusKm,
    bodyLabel: body.label,
    targetLabel: target.label,
    scaleComparison,
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

export default function ImpactCraterDiameterEstimator() {
  const [diameterM, setDiameterM] = useState(String(DEFAULTS.diameterM));
  const [velocityKmS, setVelocityKmS] = useState(String(DEFAULTS.velocityKmS));
  const [angleDegrees, setAngleDegrees] = useState(String(DEFAULTS.angleDegrees));
  const [impactorMaterial, setImpactorMaterial] = useState<string>(DEFAULTS.impactorMaterial);
  const [targetMaterial, setTargetMaterial] = useState<string>(DEFAULTS.targetMaterial);
  const [body, setBody] = useState<string>(DEFAULTS.body);
  const [customImpactorDensity, setCustomImpactorDensity] = useState(String(DEFAULTS.customImpactorDensity));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): CraterInputs => ({
    diameterM: parseFloat(diameterM) || 0,
    velocityKmS: parseFloat(velocityKmS) || 0,
    angleDegrees: parseFloat(angleDegrees) || 0,
    impactorMaterial,
    targetMaterial,
    body,
    customImpactorDensity: parseFloat(customImpactorDensity) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<CraterInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CraterResult>(() => calculateCrater(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateCrater(inputs));
  };

  const reset = () => {
    setDiameterM(String(DEFAULTS.diameterM));
    setVelocityKmS(String(DEFAULTS.velocityKmS));
    setAngleDegrees(String(DEFAULTS.angleDegrees));
    setImpactorMaterial(DEFAULTS.impactorMaterial);
    setTargetMaterial(DEFAULTS.targetMaterial);
    setBody(DEFAULTS.body);
    setCustomImpactorDensity(String(DEFAULTS.customImpactorDensity));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateCrater(DEFAULTS));
  };

  const diameterNum = parseFloat(diameterM);
  const velocityNum = parseFloat(velocityKmS);
  const angleNum = parseFloat(angleDegrees);

  const errors = {
    diameterM: !Number.isFinite(diameterNum) || diameterNum <= 0 || diameterNum > 100000 ? "Use 0.1–100,000 m" : "",
    velocityKmS: !Number.isFinite(velocityNum) || velocityNum <= 0 || velocityNum > 100 ? "Use 0.1–100 km/s" : "",
    angleDegrees: !Number.isFinite(angleNum) || angleNum <= 0 || angleNum > 90 ? "Use 1–90°" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Why is a crater so much bigger than the object that made it?",
      answer:
        "Because a hypervelocity impact releases the impactor's kinetic energy into the target in microseconds. A 50 m stony body arriving at 17 km/s carries roughly 10^16 joules, about a quarter of a megaton of TNT, and almost all of it goes into excavating and shaking the ground rather than into moving the impactor. The transient cavity that opens is then widened further as the walls collapse, so the final crater ends up ten to twenty times the impactor's diameter. That ratio grows with impactor size: a 1 km body leaves a crater nearer 13 km across, and the basin that forms at Chicxulub is about 180 km wide.",
    },
    {
      question: "What does the Pi-group scaling relation actually do?",
      answer:
        "It groups the variables that control crater size into dimensionless numbers so that experiments with centimetre-scale projectiles can be extrapolated to kilometre-scale impacts. The gravity-dominated branch used here treats the crater diameter as a function of the impactor diameter, the impact velocity, the density ratio between impactor and target, the target's gravitational acceleration and the impact angle, each raised to an experimentally fitted exponent. Above the strength-dominated regime — where target rock strength, not gravity, resists the excavation — the exponents change, which is why small laboratory craters and large planetary ones do not scale in a simple straight line.",
    },
    {
      question: "What is the difference between a simple and a complex crater?",
      answer:
        "Simple craters are bowl-shaped, with a depth-to-diameter ratio near one to five and a slightly raised rim. Above a threshold diameter that depends on the body's gravity — around 3 to 4 km on Earth, 15 km on the Moon and about 7 km on Mars — the transient cavity is too large to stand, and it collapses into a complex crater with a flat floor, terraced walls and often a central peak formed by rock rebounding from depth. That is why the same impactor makes a proportionally flatter crater on a low-gravity body: the Moon's craters are wider and shallower for the same energy, and their simple-to-complex transition happens at a much larger diameter.",
    },
    {
      question: "How much does the impact angle change the outcome?",
      answer:
        "Less than intuition suggests for the crater itself. The scaling used here carries an angle term equal to the cube root of the sine of the impact angle, so a 30 degree impact produces about 79 percent of the diameter of a vertical one and a 45 degree impact about 89 percent — far from the dramatic difference a glancing hit would suggest. Below about 15 degrees the picture changes qualitatively: the impact becomes elongated, the energy is deposited over an increasing path length, and the resulting crater is elliptical rather than circular. The most probable impact angle is 45 degrees, because random directions on a sphere favour it over vertical.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Impact Crater Diameter Estimator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Impact Crater Diameter Estimator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Impactor">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="diameter"
                  label="Impactor Diameter"
                  value={diameterM}
                  onChange={setDiameterM}
                  onEnter={runCalculate}
                  min="0.1"
                  max="100000"
                  step="any"
                  suffix="m"
                  error={errors.diameterM}
                  hint="Barringer was about 50 m."
                  tooltip="Diameter of the impactor, treated as a sphere."
                />
                <CompactInput
                  id="velocity"
                  label="Impact Velocity"
                  value={velocityKmS}
                  onChange={setVelocityKmS}
                  onEnter={runCalculate}
                  min="0.1"
                  max="100"
                  step="any"
                  suffix="km/s"
                  error={errors.velocityKmS}
                  hint="Earth encounters average 17–20 km/s."
                  tooltip="Speed at contact; typical near-Earth encounter speeds are 12 to 20 km/s."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactSelect
                  id="impactor"
                  label="Impactor Material"
                  value={impactorMaterial}
                  onChange={setImpactorMaterial}
                  options={IMPACTOR_MATERIALS.map((m) => ({ value: m.key, label: m.label }))}
                  tooltip="Sets the density used in the mass and the density ratio of the scaling relation."
                />
                <CompactInput
                  id="angle"
                  label="Impact Angle"
                  value={angleDegrees}
                  onChange={setAngleDegrees}
                  onEnter={runCalculate}
                  min="1"
                  max="90"
                  step="1"
                  suffix="°"
                  error={errors.angleDegrees}
                  hint="45° is the most probable."
                  tooltip="Measured from the horizontal; below about 15° the crater becomes elliptical."
                />
              </div>
            </SubSection>

            <SubSection title="Target">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="target"
                  label="Target Material"
                  value={targetMaterial}
                  onChange={setTargetMaterial}
                  options={TARGET_MATERIALS.map((t) => ({ value: t.key, label: t.label }))}
                  tooltip="Target density enters the cube root of the density ratio."
                />
                <CompactSelect
                  id="body"
                  label="Planetary Body"
                  value={body}
                  onChange={setBody}
                  options={BODIES.map((b) => ({ value: b.key, label: b.label }))}
                  tooltip="Gravity sets the crater size, and the body sets the simple-to-complex transition diameter."
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
                  <SubSection title="Overrides">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="custom-density"
                        label="Custom Density"
                        value={customImpactorDensity}
                        onChange={setCustomImpactorDensity}
                        onEnter={runCalculate}
                        min="0"
                        max="20000"
                        step="100"
                        suffix="kg/m³"
                        hint="0 uses the material default."
                        tooltip="Override the impactor density when the material is known from spectroscopy."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="4"
                        step="1"
                        tooltip="Decimal places used for the crater diameter and depth."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Final Crater Diameter</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.finalDiameterKm, calcInputs.decimals)} km` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.craterType.toLowerCase()} on ${results.bodyLabel} from a ${fmt(
                      calcInputs.diameterM,
                      1,
                    )} m impactor at ${fmt(calcInputs.velocityKmS, 1)} km/s`
                  : "Fix the highlighted inputs to estimate the crater"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Energy Yield</span>
                <span className="font-extrabold text-foreground">
                  {results.valid
                    ? results.megatonsTnt >= 1
                      ? `${fmt(results.megatonsTnt, 1)} Mt`
                      : `${fmt(results.megatonsTnt * 1000, 0)} kt`
                    : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Transient Crater</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.transientDiameterM / 1000, 1)} km` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Seismic</span>
                <span className={`font-extrabold ${results.valid ? "text-foreground" : "text-muted-foreground"}`}>
                  {results.valid ? `M ${fmt(results.seismicMagnitude, 1)}` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Impact Item</th>
                    <th className="p-2.5 pr-3 text-right w-[250px]">Value</th>
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
                        Enter the impactor and target to estimate the crater.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Final crater</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.finalDiameterKm, calcInputs.decimals)} km · ${fmt(
                          results.depthM >= 1000 ? results.depthM / 1000 : results.depthM,
                          1,
                        )} ${results.depthM >= 1000 ? "km" : "m"} deep`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Impactor mass</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${sciDisplay(results.massKg)} kg` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Kinetic energy</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${sciDisplay(results.kineticEnergyJ)} J` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Final diameter</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.finalDiameterKm, 2)} km` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Depth</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid
                      ? results.depthM >= 1000
                        ? `${fmt(results.depthM / 1000, 2)} km`
                        : `${fmt(results.depthM, 0)} m`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ejecta radius</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.ejectaRadiusKm, 1)} km` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fireball radius</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.fireballRadiusKm, 1)} km` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Seismic magnitude</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `M ${fmt(results.seismicMagnitude, 1)}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Recurrence interval</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.recurrenceYears, 0)} years` : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is an Impact Crater Diameter Estimator?</h2>
            <p>
              An impact crater diameter estimator takes the size, velocity, density and angle of an impactor and the properties of the
              target body, and works out how large a crater the collision leaves behind. It reports the kinetic energy in TNT equivalent,
              the transient cavity that opens in the first seconds, the final diameter after the walls collapse, the depth, the ejecta
              blanket, the equivalent seismic magnitude and the average interval between impacts of that size.
            </p>
            <p>
              The reason the answer needs a model rather than a rule of thumb is that a hypervelocity impact is not a hole punched in the
              ground. Almost all of the impactor's energy goes into compressing, melting and throwing the target material, and the crater
              that remains is the product of an excavation phase followed by a collapse phase whose behaviour depends on the planet's
              gravity.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The energy comes first. The impactor is treated as a sphere, its volume multiplied by the density of the chosen material
              gives the mass, and half the mass times the square of the velocity gives the kinetic energy — which for a 50 metre stony body
              arriving at 17 km/s is about 10¹⁶ joules, or roughly a quarter of a megaton of TNT. That single number drives everything
              else.
            </p>
            <p>
              Crater size follows from Pi-group scaling, the framework that lets laboratory shots with centimetre projectiles be
              extrapolated to planetary impacts. In the gravity-dominated regime the transient crater diameter grows with the cube root of
              the ratio of impactor to target density, with the impactor diameter and velocity raised to fitted exponents, and shrinks
              weakly with the target's gravity — which is why the Moon keeps a much larger crater from the same impactor than Earth does.
              The angle of arrival enters as the cube root of its sine, so a 30 degree impact produces about 79 percent of the diameter of a
              vertical one.
            </p>
            <p>
              The final crater then depends on the transient size relative to the body's simple-to-complex transition diameter: about 3 to
              4 km on Earth, 7 km on Mars and 15 km on the Moon. Below the transition the transient cavity relaxes slightly and keeps a
              depth-to-diameter ratio near one to five; above it the walls fail, the floor rises and the crater widens while becoming
              proportionally shallower. The model also converts the energy to an equivalent seismic magnitude using the standard seismic
              efficiency of 10⁻⁴, estimates the fireball radius from the cube root of the yield, and places the result against Barringer,
              Ries, Chicxulub and Vredefort so the scale is immediately legible.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the final crater diameter on the selected body. The three-stat bar adds the energy yield in megatons,
              the transient crater diameter and the equivalent seismic magnitude.
            </p>
            <p>
              The breakdown table carries every step: the impactor volume and mass, the velocity, the kinetic energy and its TNT
              equivalent, the angle factor, the density-ratio and gravity terms, the transient and final diameters, the depth, the
              morphology verdict against the body's transition diameter, the ejecta blanket, the fireball, the seismic magnitude, the
              recurrence interval and the comparison with four real craters. The summary panel repeats the headline figures.
            </p>
            <p>
              Two cautions belong with the numbers. The scaling relation is calibrated on the gravity-dominated regime, which is the right
              one for craters above a few hundred metres; small craters form in the strength-dominated regime where target rock strength
              rather than gravity controls the size, and the exponents there are different. The model also assumes a solid, uniform target
              and a vertical-to-oblique impact above roughly 15 degrees, below which craters become elliptical and the energy deposition
              changes character. For comparison and education — how much bigger is Chicxulub than Barringer, and how much energy does that
              take — it is a sound guide; for a specific real impact structure, the geology on the ground is the arbiter.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/impact-crater-diameter-estimator" />
          <PopularCalculators exclude="/calculator/impact-crater-diameter-estimator" />
        </div>
      </div>
    </>
  );
}
