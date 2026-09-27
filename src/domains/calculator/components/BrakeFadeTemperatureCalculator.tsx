"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface PadSpec {
  key: string;
  label: string;
  fadeTempC: number;
}

interface AirflowSpec {
  key: string;
  label: string;
  tauSeconds: number;
}

// Typical fade onset temperatures where the friction coefficient begins to drop
// measurably for each class of pad compound.
const PADS: PadSpec[] = [
  { key: "oem", label: "OEM organic (550°F / 288°C)", fadeTempC: 288 },
  { key: "street", label: "Street semi-metallic (650°F / 343°C)", fadeTempC: 343 },
  { key: "streetPerformance", label: "Street performance (800°F / 427°C)", fadeTempC: 427 },
  { key: "trackR", label: "Track / HPDE (1100°F / 593°C)", fadeTempC: 593 },
  { key: "race", label: "Full race (1300°F / 704°C)", fadeTempC: 704 },
];

// Newtonian cooling time constants for a vented cast-iron rotor.
const AIRFLOWS: AirflowSpec[] = [
  { key: "poor", label: "Poor — enclosed wheel well", tauSeconds: 220 },
  { key: "moderate", label: "Moderate — stock ducting", tauSeconds: 150 },
  { key: "good", label: "Good — open wheel, vented", tauSeconds: 100 },
  { key: "ducted", label: "Ducted — race cooling", tauSeconds: 65 },
];

const CAST_IRON_SPECIFIC_HEAT = 460; // J/kg·K
const CAST_IRON_DENSITY = 7200; // kg/m³
const CAST_IRON_DIFFUSIVITY = 1.3e-5; // m²/s
const CHEEK_THICKNESS_M = 0.006; // half of a ~12 mm vented rotor, per face
const LB_TO_KG = 0.45359237;
const MPH_TO_MS = 0.44704;
const KMH_TO_MS = 1 / 3.6;
const IN_TO_MM = 25.4;
const ROTOR_HEAT_FRACTION = 0.9;

interface BrakeInputs {
  unitSystem: string;
  vehicleWeight: number;
  initialSpeed: number;
  rotorDiameter: number;
  rotorMassKg: number;
  brakeBiasFront: number;
  decelG: number;
  padCompound: string;
  ambientTempC: number;
  airflow: string;
  repeatedStops: number;
  coolingIntervalS: number;
  decimals: number;
}

const DEFAULTS: BrakeInputs = {
  unitSystem: "imperial",
  vehicleWeight: 3500,
  initialSpeed: 70,
  rotorDiameter: 12.5,
  rotorMassKg: 9.5,
  brakeBiasFront: 65,
  decelG: 0.9,
  padCompound: "street",
  ambientTempC: 20,
  airflow: "moderate",
  repeatedStops: 5,
  coolingIntervalS: 30,
  decimals: 0,
};

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface BrakeResult {
  valid: boolean;
  errorMsg: string;
  massKg: number;
  massLb: number;
  velocityMs: number;
  speedMph: number;
  totalEnergyJ: number;
  frontAxleEnergyJ: number;
  energyPerRotorJ: number;
  bulkDeltaTempC: number;
  deltaTempC: number;
  stopDurationS: number;
  heatedMassKg: number;
  rotorMassUsedKg: number;
  peakTempC: number;
  peakTempF: number;
  fadeTempC: number;
  headroomC: number;
  fadePercent: number;
  swept: number;
  cooldownToSafeS: number;
  repeatedPeakTempC: number;
  stops: number;
  fadeVerdict: string;
  fadeVerdictColor: string;
  stopSeries: { stop: number; tempC: number }[];
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateBrakeFade(i: BrakeInputs): BrakeResult {
  const pad = PADS.find((p) => p.key === i.padCompound) || PADS[1];
  const air = AIRFLOWS.find((a) => a.key === i.airflow) || AIRFLOWS[1];
  const imperial = i.unitSystem === "imperial";

  const blank = (errorMsg: string): BrakeResult => ({
    valid: false,
    errorMsg,
    massKg: 0,
    massLb: 0,
    velocityMs: 0,
    speedMph: 0,
    totalEnergyJ: 0,
    frontAxleEnergyJ: 0,
    energyPerRotorJ: 0,
    bulkDeltaTempC: 0,
    deltaTempC: 0,
    stopDurationS: 0,
    heatedMassKg: 0,
    rotorMassUsedKg: 0,
    peakTempC: 0,
    peakTempF: 0,
    fadeTempC: pad.fadeTempC,
    headroomC: 0,
    fadePercent: 0,
    swept: 0,
    cooldownToSafeS: 0,
    repeatedPeakTempC: 0,
    stops: 1,
    fadeVerdict: "",
    fadeVerdictColor: "text-muted-foreground",
    stopSeries: [],
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    i.vehicleWeight,
    i.initialSpeed,
    i.rotorDiameter,
    i.rotorMassKg,
    i.brakeBiasFront,
    i.decelG,
    i.ambientTempC,
    i.repeatedStops,
    i.coolingIntervalS,
    i.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to run the thermal check.");
  if (i.vehicleWeight <= 0) return blank("Vehicle weight must be greater than zero.");
  if (i.initialSpeed <= 0) return blank("Braking speed must be greater than zero.");
  if (i.rotorDiameter <= 0) return blank("Rotor diameter must be greater than zero.");
  if (i.rotorMassKg <= 0) return blank("Rotor mass must be greater than zero.");
  if (i.brakeBiasFront < 0 || i.brakeBiasFront > 100) return blank("Front brake bias should be between 0% and 100%.");
  if (i.decelG < 0.3 || i.decelG > 2) return blank("Average deceleration should be between 0.3 g and 2 g.");
  if (i.ambientTempC < -40 || i.ambientTempC > 60) return blank("Ambient temperature should be between −40 °C and 60 °C.");
  if (i.repeatedStops < 1 || i.repeatedStops > 60) return blank("Repeated stops should be between 1 and 60.");
  if (i.coolingIntervalS < 0 || i.coolingIntervalS > 3600) return blank("The cooling interval should be between 0 and 3,600 seconds.");

  const d = Math.max(0, Math.min(2, i.decimals));

  const massKg = imperial ? i.vehicleWeight * LB_TO_KG : i.vehicleWeight;
  const velocityMs = imperial ? i.initialSpeed * MPH_TO_MS : i.initialSpeed * KMH_TO_MS;
  const massLb = massKg / LB_TO_KG;
  const speedMph = velocityMs / MPH_TO_MS;

  // A single stop converts essentially all translational kinetic energy into heat
  // in the friction surfaces: E = ½ m v².
  const totalEnergyJ = 0.5 * massKg * velocityMs * velocityMs;

  const bias = Math.min(100, Math.max(0, i.brakeBiasFront)) / 100;
  const frontAxleEnergyJ = totalEnergyJ * bias;
  const energyPerRotorJ = frontAxleEnergyJ / 2;

  // Roughly 90% of the heat lands in the rotor rather than the pads and caliper in
  // the first seconds of the stop, before conduction redistributes it.
  const rotorMassUsedKg = Math.max(0.5, i.rotorMassKg);
  const rotorHeatJ = energyPerRotorJ * ROTOR_HEAT_FRACTION;

  // Bulk rise: the whole rotor at thermal equilibrium, which is what survives
  // between stops and accumulates over a session.
  const bulkDeltaTempC = rotorHeatJ / (rotorMassUsedKg * CAST_IRON_SPECIFIC_HEAT);

  // Swept area, both faces, assuming an annulus whose inner radius is 70% of the
  // outer radius — typical for a passenger-car rotor.
  const rotorDiaMm = imperial ? i.rotorDiameter * IN_TO_MM : i.rotorDiameter;
  const outerR = rotorDiaMm / 2000;
  const innerR = outerR * 0.7;
  const swept = 2 * Math.PI * (outerR * outerR - innerR * innerR);

  // Peak surface temperature. In one stop the heat does not reach the whole rotor:
  // it penetrates a layer of depth √(α·t), where α is the thermal diffusivity of
  // cast iron and t the stop duration. Only the mass inside that layer absorbs the
  // heat, so the surface runs far hotter than the bulk. That surface spike is what
  // drives pad fade.
  const decelMs2 = Math.max(0.5, i.decelG) * 9.80665;
  const stopDurationS = velocityMs / decelMs2;
  const penetrationM = Math.sqrt(CAST_IRON_DIFFUSIVITY * stopDurationS);
  const effectiveDepthM = Math.min(penetrationM, CHEEK_THICKNESS_M);
  const heatedMassKg = Math.min(rotorMassUsedKg, Math.max(0.1, CAST_IRON_DENSITY * swept * effectiveDepthM));
  const deltaTempC = rotorHeatJ / (heatedMassKg * CAST_IRON_SPECIFIC_HEAT);

  const peakTempC = i.ambientTempC + deltaTempC;
  const peakTempF = peakTempC * 1.8 + 32;
  const fadeTempC = pad.fadeTempC;
  const headroomC = fadeTempC - peakTempC;
  const fadePercent = (peakTempC / fadeTempC) * 100;

  const fadeVerdict =
    fadePercent >= 100
      ? "Beyond fade onset — this compound will lose friction on this stop"
      : fadePercent >= 80
        ? "Marginal — the surface temperature is approaching fade onset"
        : "Within the rated range of this compound for a single stop";
  const fadeVerdictColor = fadePercent >= 100 ? "text-red-600" : fadePercent >= 80 ? "text-orange-600" : "text-emerald-600";

  // Newtonian cooling: T(t) = T_amb + ΔT·e^(−t/τ). Solve for the time to come back
  // inside 60% of the rated temperature, which is where the pad has recovered.
  const safeTarget = fadeTempC * 0.6;
  const targetExcess = safeTarget - i.ambientTempC;
  const cooldownToSafeS =
    peakTempC > safeTarget && targetExcess > 0 && deltaTempC > targetExcess
      ? air.tauSeconds * Math.log(deltaTempC / targetExcess)
      : 0;

  // Repeated stops. Between stops the hot surface layer equilibrates into the
  // rotor, so what accumulates is the BULK rise, decaying by r = e^(−t/τ) each
  // interval: a geometric series (1 − r^n)/(1 − r). The surface spike does not
  // stack — it is added once, for the stop in progress.
  const surfaceExcessC = Math.max(0, deltaTempC - bulkDeltaTempC);
  const stops = Math.max(1, Math.floor(i.repeatedStops));
  const r = Math.exp(-Math.max(0, i.coolingIntervalS) / air.tauSeconds);
  const soakFactor = (n: number) => (r >= 1 ? n : (1 - Math.pow(r, n)) / (1 - r));
  const repeatedPeakTempC = i.ambientTempC + bulkDeltaTempC * soakFactor(stops) + surfaceExcessC;

  const stopSeries = [];
  for (let n = 1; n <= Math.min(10, stops); n++) {
    stopSeries.push({ stop: n, tempC: i.ambientTempC + bulkDeltaTempC * soakFactor(n) + surfaceExcessC });
  }

  const repeatedHeadroom = fadeTempC - repeatedPeakTempC;
  const verdict =
    repeatedHeadroom < 0
      ? `After ${fmt(stops, 0)} stop${stops === 1 ? "" : "s"} at ${fmt(i.coolingIntervalS, 0)} s apart the rotor reaches ${fmt(
          repeatedPeakTempC,
          0,
        )} °C, which is ${fmt(Math.abs(repeatedHeadroom), 0)} °C past the fade threshold of this compound`
      : `After ${fmt(stops, 0)} stop${stops === 1 ? "" : "s"} the rotor peaks at ${fmt(repeatedPeakTempC, 0)} °C, leaving ${fmt(
          repeatedHeadroom,
          0,
        )} °C below the ${fmt(fadeTempC, 0)} °C fade threshold`;
  const verdictColor = repeatedHeadroom < 0 ? "text-red-600" : repeatedHeadroom < fadeTempC * 0.2 ? "text-orange-600" : "text-emerald-600";

  const breakdown: BreakdownRow[] = [
    {
      label: "Vehicle mass",
      value: `${fmt(massKg, 0)} kg (${fmt(massLb, 0)} lb)`,
    },
    {
      label: `Braking speed at ${fmt(speedMph, 0)} mph`,
      value: `${fmt(velocityMs, 1)} m/s`,
    },
    { label: "Kinetic energy dissipated", value: `${fmt(totalEnergyJ / 1000, 0)} kJ` },
    { label: `Front axle share at ${fmt(i.brakeBiasFront, 0)}% bias`, value: `${fmt(frontAxleEnergyJ / 1000, 0)} kJ` },
    { label: "Energy absorbed per front rotor", value: `${fmt(energyPerRotorJ / 1000, 0)} kJ`, highlight: true },
    { label: `Rotor mass ${fmt(rotorMassUsedKg, 1)} kg, ${fmt(ROTOR_HEAT_FRACTION * 100, 0)}% of the heat into the rotor`, value: `${fmt(rotorHeatJ / 1000, 0)} kJ` },
    { label: "Surface temperature rise in this stop", value: `${fmt(deltaTempC, d)} °C (${fmt(deltaTempC * 1.8, d)} °F)`, highlight: true },
    { label: "Bulk rotor temperature rise", value: `${fmt(bulkDeltaTempC, d)} °C (${fmt(bulkDeltaTempC * 1.8, d)} °F)` },
    { label: `Stop duration at ${fmt(i.decelG, 2)} g`, value: `${fmt(stopDurationS, 1)} s` },
    { label: "Heated rotor mass inside the penetration layer", value: `${fmt(heatedMassKg, 2)} kg of ${fmt(rotorMassUsedKg, 2)} kg` },
    { label: "Swept rotor area, both faces", value: `${fmt(swept * 10000, 0)} cm²` },
    { label: `Peak rotor surface temperature from ${fmt(i.ambientTempC, 0)} °C ambient`, value: `${fmt(peakTempC, d)} °C (${fmt(peakTempF, d)} °F)`, highlight: true },
    { label: `Pad fade threshold · ${pad.label.split(" (")[0]}`, value: `${fmt(fadeTempC, 0)} °C (${fmt(fadeTempC * 1.8 + 32, 0)} °F)` },
    { label: "Thermal headroom in this stop", value: `${fmt(headroomC, d)} °C`, highlight: true },
    { label: "Peak as a share of the fade threshold", value: `${fmt(fadePercent, 0)}%` },
    { label: `Sustained heat soak over ${fmt(stops, 0)} stops`, value: `${fmt(repeatedPeakTempC, d)} °C` },
    { label: "Cooldown to within 60% of the fade threshold", value: cooldownToSafeS > 0 ? `${fmt(cooldownToSafeS, 0)} s` : "not required" },
    ...stopSeries.map((s) => ({
      label: `Peak temperature at stop ${fmt(s.stop, 0)}`,
      value: `${fmt(s.tempC, 0)} °C (${fmt(s.tempC * 1.8 + 32, 0)} °F)`,
    })),
  ];

  return {
    valid: true,
    errorMsg: "",
    massKg,
    massLb,
    velocityMs,
    speedMph,
    totalEnergyJ,
    frontAxleEnergyJ,
    energyPerRotorJ,
    bulkDeltaTempC,
    deltaTempC,
    stopDurationS,
    heatedMassKg,
    rotorMassUsedKg,
    peakTempC,
    peakTempF,
    fadeTempC,
    headroomC,
    fadePercent,
    swept,
    cooldownToSafeS,
    repeatedPeakTempC,
    stops,
    fadeVerdict,
    fadeVerdictColor,
    stopSeries,
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

export default function BrakeFadeTemperatureCalculator() {
  const [unitSystem, setUnitSystem] = useState<string>(DEFAULTS.unitSystem);
  const [vehicleWeight, setVehicleWeight] = useState(String(DEFAULTS.vehicleWeight));
  const [initialSpeed, setInitialSpeed] = useState(String(DEFAULTS.initialSpeed));
  const [rotorDiameter, setRotorDiameter] = useState(String(DEFAULTS.rotorDiameter));
  const [rotorMassKg, setRotorMassKg] = useState(String(DEFAULTS.rotorMassKg));
  const [brakeBiasFront, setBrakeBiasFront] = useState(String(DEFAULTS.brakeBiasFront));
  const [decelG, setDecelG] = useState(String(DEFAULTS.decelG));
  const [padCompound, setPadCompound] = useState<string>(DEFAULTS.padCompound);
  const [ambientTempC, setAmbientTempC] = useState(String(DEFAULTS.ambientTempC));
  const [airflow, setAirflow] = useState<string>(DEFAULTS.airflow);
  const [repeatedStops, setRepeatedStops] = useState(String(DEFAULTS.repeatedStops));
  const [coolingIntervalS, setCoolingIntervalS] = useState(String(DEFAULTS.coolingIntervalS));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const imperial = unitSystem === "imperial";
  const weightUnit = imperial ? "lb" : "kg";
  const speedUnit = imperial ? "mph" : "km/h";
  const lengthUnit = imperial ? "in" : "mm";

  const getInputs = (): BrakeInputs => ({
    unitSystem,
    vehicleWeight: parseFloat(vehicleWeight) || 0,
    initialSpeed: parseFloat(initialSpeed) || 0,
    rotorDiameter: parseFloat(rotorDiameter) || 0,
    rotorMassKg: parseFloat(rotorMassKg) || 0,
    brakeBiasFront: parseFloat(brakeBiasFront) || 0,
    decelG: parseFloat(decelG) || 0,
    padCompound,
    ambientTempC: parseFloat(ambientTempC) || 0,
    airflow,
    repeatedStops: parseFloat(repeatedStops) || 0,
    coolingIntervalS: parseFloat(coolingIntervalS) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<BrakeInputs>(() => DEFAULTS);
  const [results, setResults] = useState<BrakeResult>(() => calculateBrakeFade(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateBrakeFade(inputs));
  };

  const reset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setVehicleWeight(String(DEFAULTS.vehicleWeight));
    setInitialSpeed(String(DEFAULTS.initialSpeed));
    setRotorDiameter(String(DEFAULTS.rotorDiameter));
    setRotorMassKg(String(DEFAULTS.rotorMassKg));
    setBrakeBiasFront(String(DEFAULTS.brakeBiasFront));
    setDecelG(String(DEFAULTS.decelG));
    setPadCompound(DEFAULTS.padCompound);
    setAmbientTempC(String(DEFAULTS.ambientTempC));
    setAirflow(DEFAULTS.airflow);
    setRepeatedStops(String(DEFAULTS.repeatedStops));
    setCoolingIntervalS(String(DEFAULTS.coolingIntervalS));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateBrakeFade(DEFAULTS));
  };

  const weightNum = parseFloat(vehicleWeight);
  const speedNum = parseFloat(initialSpeed);
  const diaNum = parseFloat(rotorDiameter);
  const massNum = parseFloat(rotorMassKg);
  const biasNum = parseFloat(brakeBiasFront);
  const decelNum = parseFloat(decelG);

  const errors = {
    vehicleWeight: !Number.isFinite(weightNum) || weightNum <= 0 ? "Must be greater than zero" : "",
    initialSpeed: !Number.isFinite(speedNum) || speedNum <= 0 ? "Must be greater than zero" : "",
    rotorDiameter: !Number.isFinite(diaNum) || diaNum <= 0 ? "Must be greater than zero" : "",
    rotorMassKg: !Number.isFinite(massNum) || massNum <= 0 ? "Must be greater than zero" : "",
    brakeBiasFront: !Number.isFinite(biasNum) || biasNum < 0 || biasNum > 100 ? "Use 0–100%" : "",
    decelG: !Number.isFinite(decelNum) || decelNum < 0.3 || decelNum > 2 ? "Use 0.3–2 g" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How hot do brake rotors actually get?",
      answer:
        "A single 70 mph stop in a 3,500 lb car puts roughly 750 kJ into the brakes, which lifts each front rotor 150 to 200 °C above ambient. Street driving rarely exceeds 300 °C. Repeated hard stops without cooling time stack the heat: a mountain descent or a track session routinely pushes rotors past 600 °C, where they glow visibly and most street pads have already lost significant friction.",
    },
    {
      question: "What is brake fade and what causes it?",
      answer:
        "Fade is the loss of braking force as temperature rises, and there are two distinct mechanisms. Pad fade happens when the friction material passes its rated temperature and its coefficient of friction drops, so the pedal stays firm but the car does not slow. Fluid fade happens when brake fluid boils and the vapour compresses, giving a long, soft pedal. This calculator models pad fade through the rotor surface temperature; fluid fade depends on the fluid's wet boiling point and how much moisture it has absorbed.",
    },
    {
      question: "Why does the front axle get most of the heat?",
      answer:
        "Weight transfers forward under braking, so the front tyres carry more load and can generate more decelerating force. Production cars typically run 60 to 70 percent front brake bias, meaning the front rotors absorb that share of the total energy. Because there are two front rotors, each takes half the axle share. That is why front rotors and pads wear faster, and why a front brake upgrade matters more than a rear one.",
    },
    {
      question: "Does a bigger rotor run cooler?",
      answer:
        "Yes, for two reasons. More rotor mass means the same energy produces a smaller temperature rise, because the heat is spread through more metal. More swept area means faster rejection of heat to the air. That is why heavier and faster cars get larger brakes — not for more clamping force, but for thermal capacity. A larger rotor also increases the effective lever arm, which reduces the clamping force needed for the same braking torque.",
    },
    {
      question: "Why does the model treat the surface and the bulk rotor separately?",
      answer:
        "Because they behave on completely different timescales, and only one of them fades the pad. In a three-second stop, heat penetrates only a couple of millimetres of the rotor's cheek, so the surface spikes to a temperature the bulk never reaches; that spike is what the pad experiences. Between stops the heat conducts into the rest of the rotor, the surface cools and the whole disc warms. The second temperature, the bulk rise, is the one that accumulates over repeated stops and eventually saturates the disc.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator#transportation" },
          { label: "Brake Fade Temperature Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Brake Fade Temperature Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Vehicle & Stop">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="units"
                  label="Units"
                  value={unitSystem}
                  onChange={setUnitSystem}
                  options={[
                    { value: "imperial", label: "Imperial (lb, mph, in)" },
                    { value: "metric", label: "Metric (kg, km/h, mm)" },
                  ]}
                  tooltip="Switches the weight, speed and rotor diameter units."
                />
                <CompactInput
                  id="weight"
                  label="Vehicle Weight"
                  value={vehicleWeight}
                  onChange={setVehicleWeight}
                  onEnter={runCalculate}
                  min="100"
                  step="any"
                  suffix={weightUnit}
                  error={errors.vehicleWeight}
                  tooltip="Test weight including driver and fuel, which is what the kinetic energy depends on."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="speed"
                  label="Braking From"
                  value={initialSpeed}
                  onChange={setInitialSpeed}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix={speedUnit}
                  error={errors.initialSpeed}
                  tooltip="Speed at the start of the stop; energy rises with the square of this figure."
                />
                <CompactInput
                  id="decel"
                  label="Average Deceleration"
                  value={decelG}
                  onChange={setDecelG}
                  onEnter={runCalculate}
                  min="0.3"
                  max="2"
                  step="0.05"
                  suffix="g"
                  error={errors.decelG}
                  hint="0.9 g on dry asphalt."
                  tooltip="Sets the stop duration, which in turn sets how deep the heat penetrates."
                />
              </div>
            </SubSection>

            <SubSection title="Brake Hardware">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="rotor-dia"
                  label="Rotor Diameter"
                  value={rotorDiameter}
                  onChange={setRotorDiameter}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix={lengthUnit}
                  error={errors.rotorDiameter}
                  tooltip="Outer diameter of the rotor, used for the swept area."
                />
                <CompactInput
                  id="rotor-mass"
                  label="Rotor Mass (each)"
                  value={rotorMassKg}
                  onChange={setRotorMassKg}
                  onEnter={runCalculate}
                  min="0.5"
                  step="any"
                  suffix="kg"
                  error={errors.rotorMassKg}
                  tooltip="Mass of one front rotor; thermal capacity is proportional to it."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="bias"
                  label="Front Brake Bias"
                  value={brakeBiasFront}
                  onChange={setBrakeBiasFront}
                  onEnter={runCalculate}
                  min="0"
                  max="100"
                  step="1"
                  suffix="%"
                  error={errors.brakeBiasFront}
                  tooltip="Share of braking energy the front axle absorbs; 60–70% is typical for a production car."
                />
                <CompactInput
                  id="ambient"
                  label="Ambient Temperature"
                  value={ambientTempC}
                  onChange={setAmbientTempC}
                  onEnter={runCalculate}
                  min="-40"
                  max="60"
                  step="1"
                  suffix="°C"
                  tooltip="Starting rotor temperature before the stop."
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
                  <SubSection title="Pad Compound">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactSelect
                        id="pad"
                        label="Compound"
                        value={padCompound}
                        onChange={setPadCompound}
                        options={PADS.map((p) => ({ value: p.key, label: p.label }))}
                        tooltip="Sets the fade onset temperature the peak is compared against."
                      />
                      <CompactSelect
                        id="airflow"
                        label="Cooling Airflow"
                        value={airflow}
                        onChange={setAirflow}
                        options={AIRFLOWS.map((a) => ({ value: a.key, label: a.label }))}
                        tooltip="Sets the cooling time constant used for heat soak and cooldown."
                      />
                    </div>
                  </SubSection>
                  <SubSection title="Repeated Stops">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="stops"
                        label="Number of Stops"
                        value={repeatedStops}
                        onChange={setRepeatedStops}
                        onEnter={runCalculate}
                        min="1"
                        max="60"
                        step="1"
                        tooltip="How many hard stops are made in the run being modelled."
                      />
                      <CompactInput
                        id="interval"
                        label="Interval Between Stops"
                        value={coolingIntervalS}
                        onChange={setCoolingIntervalS}
                        onEnter={runCalculate}
                        min="0"
                        max="3600"
                        step="1"
                        suffix="s"
                        tooltip="Cooling time between stops; short intervals are what make heat soak severe."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        max="2"
                        step="1"
                        tooltip="Decimal places used for temperature figures."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Cast iron at 460 J/kg·K, 7,200 kg/m³ and 1.3 × 10⁻⁵ m²/s diffusivity.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Peak Rotor Temperature</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.peakTempC, calcInputs.decimals)} °C` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.peakTempF, 0)} °F — ${results.fadeVerdict.toLowerCase()} (threshold ${fmt(
                      results.fadeTempC,
                      0,
                    )} °C)`
                  : "Fix the highlighted inputs to run the thermal check"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Per Rotor</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.energyPerRotorJ / 1000, 0)} kJ` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Surface Rise</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.deltaTempC, 0)} °C` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Headroom</span>
                <span className={`font-extrabold ${results.valid ? results.fadeVerdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.headroomC, 0)} °C` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Thermal Item</th>
                    <th className="p-2.5 pr-3 text-right w-[220px]">Value</th>
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
                        Enter the vehicle and brake hardware to see the thermal analysis.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Peak rotor temperature</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.peakTempC, calcInputs.decimals)} °C · ${fmt(results.fadePercent, 0)}% of the fade threshold`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peak surface temperature</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.peakTempC, 0)} °C` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">In Fahrenheit</span>
                  <span className="text-base font-bold text-foreground">{results.valid ? `${fmt(results.peakTempF, 0)} °F` : "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Energy per rotor</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.energyPerRotorJ / 1000, 0)} kJ` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Bulk rotor rise</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.bulkDeltaTempC, 0)} °C` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Fade threshold</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.fadeTempC, 0)} °C` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Headroom</span>
                  <span className={`text-base font-bold ${results.valid ? results.fadeVerdictColor : "text-muted-foreground"}`}>
                    {results.valid ? `${fmt(results.headroomC, 0)} °C` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">After repeated stops</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? `${fmt(results.repeatedPeakTempC, 0)} °C` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cooldown to safe</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? (results.cooldownToSafeS > 0 ? `${fmt(results.cooldownToSafeS, 0)} s` : "not needed") : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Brake Fade Temperature Calculator?</h2>
            <p>
              A brake fade temperature calculator turns a braking event into the temperature the friction surfaces actually reach, and
              compares it with the temperature at which the pad compound starts to lose grip. It works from the energy the stop has to
              absorb — one half of mass times speed squared — and follows that energy through the brake bias, into a single rotor, into the
              thin layer of metal the pads sweep, which is where the pad's temperature comes from.
            </p>
            <p>
              The result matters because fade is the failure mode drivers meet most often without warning. A pad that has lost friction
              produces no pedal change at all: the pedal stays firm and the car simply stops less. Knowing the margin between the peak
              rotor temperature and the compound's rated limit is the difference between a car that repeats its braking performance and
              one that surprises its driver at the end of a descent.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              A stop converts the vehicle's kinetic energy into heat. For a 3,500 lb car stopping from 70 mph that is about 750 kJ, and
              weight transfer means the front axle absorbs it in proportion to the front brake bias — typically 60 to 70 percent. Because
              there are two front rotors, each takes half of that share, and roughly 90 percent of the heat lands in the rotor rather than
              the pads and caliper in the first seconds of the stop.
            </p>
            <p>
              The temperature rise is the energy divided by the heat capacity of the metal that absorbs it, which is mass times the
              460 J/kg·K specific heat of cast iron. The complication is deciding how much metal counts. In a three-second stop the heat
              penetrates only a couple of millimetres into the cheek, so the mass that matters is the swept area times a depth of
              √(α·t) — the thermal penetration depth, with the diffusivity of cast iron at about 1.3 × 10⁻⁵ m²/s. That is why the surface
              reaches 400 or 500 °C while the rest of the disc is still near ambient.
            </p>
            <p>
              Between stops the heat conducts into the rest of the rotor and the surface cools, so what accumulates from stop to stop is
              the bulk rise, decaying towards ambient with the cooling time constant of the installation. The model sums that decay as a
              geometric series and adds the surface spike once, for the stop in progress, which is the sequence that makes the last stop of
              a session hotter than the first even though the energy of each stop is identical.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the peak rotor surface temperature for the stop, with the fade threshold of the selected compound and
              the verdict underneath. The three-stat bar adds the energy absorbed per rotor, the surface temperature rise and the thermal
              headroom that remains.
            </p>
            <p>
              The breakdown table follows the energy from the vehicle mass and speed through the axle bias to the rotor, then the two
              temperatures — surface and bulk — the stop duration, the mass inside the penetration layer, the swept area, the fade
              threshold and the headroom, followed by the heat soak over the number of stops you entered and the temperature reached at
              each of the first ten of them. The summary panel repeats the headline figures and prints the verdict line for the repeated
              run.
            </p>
            <p>
              Two limits deserve respect. This model handles pad fade only: brake fluid fade depends on the fluid's wet boiling point and
              its moisture content, and it does not care how hot the rotor is. It also assumes the whole stop's energy is deposited in one
              pass at a constant deceleration. Real stops taper as speed falls, real pads insulate the rotor rather than conducting into
              it, and air flow changes with speed, so treat the temperature as an order-of-magnitude figure. Its usefulness is comparative:
              the difference between a 12-inch and a 14-inch rotor, or between a 30-second and a 90-second cooling interval, is what the
              calculator gets right.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/brake-fade-temperature-calculator" />
          <PopularCalculators exclude="/calculator/brake-fade-temperature-calculator" />
        </div>
      </div>
    </>
  );
}
