"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Thermometer, Wind } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

type PadCompound = "oem" | "street" | "streetPerformance" | "trackR" | "race";
type Airflow = "poor" | "moderate" | "good" | "ducted";
type UnitSystem = "imperial" | "metric";

interface PadSpec {
  key: PadCompound;
  label: string;
  fadeTempC: number;
}

interface AirflowSpec {
  key: Airflow;
  label: string;
  tauSeconds: number;
}

interface BrakeInputs {
  vehicleWeight: number;
  initialSpeed: number;
  rotorDiameter: number;
  padCompound: PadCompound;
  unitSystem: UnitSystem;
  rotorMassKg: number;
  brakeBiasFront: number;
  ambientTempC: number;
  decelG: number;
  proMode: boolean;
  repeatedStops: number;
  coolingIntervalS: number;
  airflow: Airflow;
}

interface ChartPoint {
  name: string;
  tempC: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface BrakeResult {
  massKg: number;
  velocityMs: number;
  totalEnergyJ: number;
  frontAxleEnergyJ: number;
  energyPerRotorJ: number;
  deltaTempC: number;
  bulkDeltaTempC: number;
  stopDurationS: number;
  heatedMassKg: number;
  peakTempC: number;
  peakTempF: number;
  fadeTempC: number;
  headroomC: number;
  fadePercent: number;
  fadeVerdict: string;
  fadeVerdictColor: string;
  swept: number;
  rotorMassUsedKg: number;
  cooldownToSafeS: number;
  repeatedPeakTempC: number;
  chartData: ChartPoint[];
  rows: TableRow[];
}

// Typical fade onset temperatures where the friction coefficient begins to drop
// measurably for each class of pad compound.
const PADS: PadSpec[] = [
  { key: "oem", label: "OEM organic (550°F / 288°C)", fadeTempC: 288 },
  { key: "street", label: "Street semi-metallic (650°F / 343°C)", fadeTempC: 343 },
  { key: "streetPerformance", label: "Street performance (800°F / 427°C)", fadeTempC: 427 },
  { key: "trackR", label: "Track/HPDE (1100°F / 593°C)", fadeTempC: 593 },
  { key: "race", label: "Full race (1300°F / 704°C)", fadeTempC: 704 },
];

// Newtonian cooling time constants for a vented cast-iron rotor.
const AIRFLOWS: AirflowSpec[] = [
  { key: "poor", label: "Poor (enclosed wheel well)", tauSeconds: 220 },
  { key: "moderate", label: "Moderate (stock ducting)", tauSeconds: 150 },
  { key: "good", label: "Good (open wheel, vented)", tauSeconds: 100 },
  { key: "ducted", label: "Ducted (race cooling)", tauSeconds: 65 },
];

const CAST_IRON_SPECIFIC_HEAT = 460; // J/kg·K
const CAST_IRON_DENSITY = 7200; // kg/m^3
const CAST_IRON_DIFFUSIVITY = 1.3e-5; // m^2/s
const CHEEK_THICKNESS_M = 0.006; // half of a ~12mm vented rotor, per face
const LB_TO_KG = 0.45359237;
const MPH_TO_MS = 0.44704;
const KMH_TO_MS = 1 / 3.6;
const IN_TO_MM = 25.4;

const DEFAULTS: BrakeInputs = {
  vehicleWeight: 3500,
  initialSpeed: 70,
  rotorDiameter: 12.5,
  padCompound: "street",
  unitSystem: "imperial",
  rotorMassKg: 9.5,
  brakeBiasFront: 65,
  ambientTempC: 20,
  decelG: 0.9,
  proMode: false,
  repeatedStops: 5,
  coolingIntervalS: 30,
  airflow: "moderate",
};

export function calculateBrakeFade(i: BrakeInputs): BrakeResult {
  const pad = PADS.find((p) => p.key === i.padCompound) ?? PADS[1];
  const air = AIRFLOWS.find((a) => a.key === i.airflow) ?? AIRFLOWS[1];

  const massKg =
    i.unitSystem === "imperial"
      ? Math.max(0, i.vehicleWeight) * LB_TO_KG
      : Math.max(0, i.vehicleWeight);

  const velocityMs =
    i.unitSystem === "imperial"
      ? Math.max(0, i.initialSpeed) * MPH_TO_MS
      : Math.max(0, i.initialSpeed) * KMH_TO_MS;

  // A single stop converts essentially all translational kinetic energy to heat
  // in the friction surfaces: E = 1/2 m v^2.
  const totalEnergyJ = 0.5 * massKg * Math.pow(velocityMs, 2);

  const bias = Math.min(100, Math.max(0, i.brakeBiasFront)) / 100;
  const frontAxleEnergyJ = totalEnergyJ * bias;

  // The front axle has two rotors, so each absorbs half the axle's share.
  const energyPerRotorJ = frontAxleEnergyJ / 2;

  // Roughly 90% of the heat lands in the rotor rather than the pads and caliper
  // in the first seconds of a stop, before conduction redistributes it.
  const rotorHeatFraction = 0.9;
  const rotorMassUsedKg = Math.max(0.5, i.rotorMassKg);
  const rotorHeatJ = energyPerRotorJ * rotorHeatFraction;

  // Bulk rise: the whole rotor at thermal equilibrium once conduction has
  // spread the heat evenly. This is what survives between stops.
  const bulkDeltaTempC = rotorHeatJ / (rotorMassUsedKg * CAST_IRON_SPECIFIC_HEAT);

  // Swept rotor area, both faces. Assumes an annulus whose inner radius is 70%
  // of the outer radius, which is typical for a passenger-car rotor.
  const rotorDiaMm =
    i.unitSystem === "imperial" ? Math.max(0, i.rotorDiameter) * IN_TO_MM : Math.max(0, i.rotorDiameter);
  const outerR = rotorDiaMm / 2000; // m
  const innerR = outerR * 0.7;
  const sweptOneFace = Math.PI * (Math.pow(outerR, 2) - Math.pow(innerR, 2));
  const swept = 2 * sweptOneFace; // m^2, both faces

  // Peak surface temperature. In a single stop the heat does not reach the whole
  // rotor: it penetrates a layer of depth delta = sqrt(alpha * t), where alpha is
  // the thermal diffusivity of cast iron and t is the stop duration. Only the
  // mass inside that layer absorbs the heat, so the surface runs far hotter than
  // the bulk. This is the temperature that drives pad fade.
  const decelMs2 = Math.max(0.5, i.decelG) * 9.80665;
  const stopDurationS = velocityMs > 0 ? velocityMs / decelMs2 : 0;
  const penetrationM = Math.sqrt(CAST_IRON_DIFFUSIVITY * stopDurationS);
  const effectiveDepthM = Math.min(penetrationM, CHEEK_THICKNESS_M);
  const heatedMassKg = Math.min(
    rotorMassUsedKg,
    Math.max(0.1, CAST_IRON_DENSITY * swept * effectiveDepthM)
  );
  const deltaTempC = rotorHeatJ / (heatedMassKg * CAST_IRON_SPECIFIC_HEAT);

  const ambient = i.ambientTempC;
  const peakTempC = ambient + deltaTempC;
  const peakTempF = peakTempC * 1.8 + 32;

  const fadeTempC = pad.fadeTempC;
  const headroomC = fadeTempC - peakTempC;
  const fadePercent = fadeTempC > 0 ? (peakTempC / fadeTempC) * 100 : 0;

  let fadeVerdict: string;
  let fadeVerdictColor: string;
  if (fadePercent >= 100) {
    fadeVerdict = "Fade expected — pad is past its rated temperature";
    fadeVerdictColor = "text-red-600";
  } else if (fadePercent >= 80) {
    fadeVerdict = "Marginal — approaching fade onset";
    fadeVerdictColor = "text-amber-600";
  } else {
    fadeVerdict = "Within thermal limits for this compound";
    fadeVerdictColor = "text-emerald-600";
  }

  // Newtonian cooling: T(t) = T_amb + dT * e^(-t/tau). Solve for the time to
  // return within 10% of the pad's rated temperature.
  const safeTarget = fadeTempC * 0.6;
  const cooldownToSafeS =
    peakTempC > safeTarget && deltaTempC > 0
      ? air.tauSeconds * Math.log(deltaTempC / Math.max(1, safeTarget - ambient))
      : 0;

  // Repeated stops. Between stops the hot surface layer equilibrates into the
  // rotor, so what accumulates from stop to stop is the BULK rise, decaying by
  // r = e^(-t/tau) each interval: a geometric series (1 - r^n)/(1 - r). The
  // surface spike does not stack — it is added once, for the stop in progress.
  const surfaceExcessC = Math.max(0, deltaTempC - bulkDeltaTempC);
  const stops = Math.max(1, Math.floor(i.repeatedStops));
  const r = Math.exp(-Math.max(0, i.coolingIntervalS) / air.tauSeconds);
  const soakFactor = (n: number) => (r >= 1 ? n : (1 - Math.pow(r, n)) / (1 - r));
  const repeatedPeakTempC = ambient + bulkDeltaTempC * soakFactor(stops) + surfaceExcessC;

  const chartData: ChartPoint[] = [];
  for (let n = 1; n <= Math.min(10, stops); n++) {
    chartData.push({
      name: `Stop ${n}`,
      tempC: Math.round(ambient + bulkDeltaTempC * soakFactor(n) + surfaceExcessC),
      isSubject: n === stops,
    });
  }

  const num = (v: number, d = 1) =>
    v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const rows: TableRow[] = [
    { label: "Vehicle Mass", value: `${num(massKg, 0)} kg (${num(massKg / LB_TO_KG, 0)} lb)` },
    { label: "Initial Speed", value: `${num(velocityMs, 1)} m/s (${num(velocityMs / MPH_TO_MS, 0)} mph)` },
    { label: "Kinetic Energy Dissipated", value: `${num(totalEnergyJ / 1000, 0)} kJ` },
    { label: `Front Axle Share (${Math.round(bias * 100)}%)`, value: `${num(frontAxleEnergyJ / 1000, 0)} kJ` },
    { label: "Energy Per Front Rotor", value: `${num(energyPerRotorJ / 1000, 0)} kJ` },
    { label: "Rotor Mass (each)", value: `${num(rotorMassUsedKg, 1)} kg` },
    { label: "Surface Temp Rise Per Stop", value: `${num(deltaTempC, 0)} °C (${num(deltaTempC * 1.8, 0)} °F)` },
    { label: "Bulk Rotor Temp Rise", value: `${num(bulkDeltaTempC, 0)} °C (${num(bulkDeltaTempC * 1.8, 0)} °F)` },
    { label: "Stop Duration", value: `${num(stopDurationS, 1)} s` },
    { label: "Heated Rotor Mass", value: `${num(heatedMassKg, 2)} kg of ${num(rotorMassUsedKg, 2)} kg` },
    { label: "Peak Rotor Temperature", value: `${num(peakTempC, 0)} °C (${num(peakTempF, 0)} °F)`, key: true },
    { label: "Pad Fade Threshold", value: `${num(fadeTempC, 0)} °C (${num(fadeTempC * 1.8 + 32, 0)} °F)` },
    { label: "Thermal Headroom", value: `${num(headroomC, 0)} °C` },
    { label: "Swept Rotor Area (both faces)", value: `${num(swept * 10000, 0)} cm²` },
    { label: `Peak After ${stops} Stop${stops === 1 ? "" : "s"}`, value: `${num(repeatedPeakTempC, 0)} °C` },
  ];

  return {
    massKg,
    velocityMs,
    totalEnergyJ,
    frontAxleEnergyJ,
    energyPerRotorJ,
    deltaTempC,
    bulkDeltaTempC,
    stopDurationS,
    heatedMassKg,
    peakTempC,
    peakTempF,
    fadeTempC,
    headroomC,
    fadePercent,
    fadeVerdict,
    fadeVerdictColor,
    swept,
    rotorMassUsedKg,
    cooldownToSafeS,
    repeatedPeakTempC,
    chartData,
    rows,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function BrakeFadeTemperatureCalculator() {
  const [inputs, setInputs] = useState<BrakeInputs>(DEFAULTS);
  const [result, setResult] = useState<BrakeResult>(calculateBrakeFade(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateBrakeFade(inputs));
  }, []);

  const calculate = () => setResult(calculateBrakeFade(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateBrakeFade(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof BrakeInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const num = (v: number, d = 1) =>
    v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const isImperial = inputs.unitSystem === "imperial";

  const faqs = [
    {
      question: "How hot do brake rotors actually get?",
      answer:
        "A single 70 mph stop in a 3,500 lb car puts roughly 750 kJ into the brakes, which lifts each front rotor around 150 to 200°C above ambient. Street driving rarely exceeds 300°C. Repeated hard stops without cooling time stack the heat: a mountain descent or a track session routinely pushes rotors past 600°C, where they glow visibly and most street pads have already lost significant friction.",
    },
    {
      question: "What is brake fade and what causes it?",
      answer:
        "Fade is the loss of braking force as temperature rises. There are two distinct mechanisms. Pad fade happens when the friction material passes its rated temperature and its coefficient of friction drops — the pedal still feels firm but the car does not slow. Fluid fade happens when brake fluid boils and the vapor compresses, giving a long, soft pedal. Pad fade is what this calculator models; fluid fade depends on your fluid's wet boiling point and how much moisture it has absorbed.",
    },
    {
      question: "Why does the front axle get most of the heat?",
      answer:
        "Weight transfers forward under braking, so the front tires carry more load and can generate more decelerating force. Production cars typically run 60 to 70% front brake bias, meaning the front rotors absorb that share of the total energy. Because there are two front rotors, each one takes half the axle share. That is why front rotors and pads wear faster and why front brake upgrades matter more than rear ones.",
    },
    {
      question: "Does a bigger rotor run cooler?",
      answer:
        "Yes, for two reasons. More rotor mass means the same energy produces a smaller temperature rise, since the heat is spread through more metal. More swept area means faster heat rejection to the air. This is why heavier and faster cars get larger brakes: not for more clamping force, but for thermal capacity. A larger rotor also increases the effective lever arm, which reduces the clamping force needed for the same torque.",
    },
    {
      question: "How long do brakes need to cool between hard stops?",
      answer:
        "Cooling follows an exponential curve with a time constant that depends on airflow. With stock ducting, a rotor sheds about 63% of its temperature rise over roughly 150 seconds of driving at speed. Sitting still is far worse, since there is no forced convection. On track, a cool-down lap at moderate pace is more effective than parking in the pits, because moving air does most of the work.",
    },
    {
      question: "Should I upgrade to race pads for street driving?",
      answer:
        "Usually not. Race compounds are formulated to work hot and often bite poorly below 200°C, which means weak cold braking on the first stop of the morning and more noise and rotor wear. Match the pad to the duty cycle: street semi-metallic for daily driving, a performance street compound if you see occasional canyon or autocross use, and a dedicated track pad only if you are seeing sustained high temperatures.",
    },
    {
      question: "What does the temperature rise per stop assume?",
      answer:
        "It assumes the vehicle comes to a complete stop from the entered speed, that all translational kinetic energy becomes heat in the friction surfaces, and that about 90% of that heat initially lands in the rotor rather than the pads and caliper. Cast iron's specific heat of 460 J/kg·K converts energy to temperature. Real stops also lose some energy to aerodynamic drag, engine braking, and rolling resistance, so the model is slightly conservative — which is the useful direction for a thermal margin estimate.",
    },
    {
      question: "How do I reduce brake temperatures without new hardware?",
      answer:
        "Change how you use them. Brake later and harder rather than riding the pedal, which puts the same energy in but gives more cooling time between applications. On a descent, use a lower gear so engine braking absorbs part of the load. On track, lift earlier and let aerodynamic drag do some work. Also confirm your ducting is intact and that dust shields are not blocking airflow to the rotor face.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/calculator/transportation" },
          { label: "Brake Fade Temperature Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Brake Fade Temperature Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="vehicleWeight" className={lbl}>
                  Vehicle Weight ({isImperial ? "lb" : "kg"})
                </label>
                <input id="vehicleWeight" type="number" min="0" step="50" className={inp}
                  value={inputs.vehicleWeight} onChange={(e) => setNum("vehicleWeight", e.target.value)} />
              </div>
              <div>
                <label htmlFor="initialSpeed" className={lbl}>
                  Initial Speed ({isImperial ? "mph" : "km/h"})
                </label>
                <input id="initialSpeed" type="number" min="0" step="5" className={inp}
                  value={inputs.initialSpeed} onChange={(e) => setNum("initialSpeed", e.target.value)} />
              </div>
              <div>
                <label htmlFor="rotorDiameter" className={lbl}>
                  Rotor Diameter ({isImperial ? "in" : "mm"})
                </label>
                <input id="rotorDiameter" type="number" min="0" step="0.5" className={inp}
                  value={inputs.rotorDiameter} onChange={(e) => setNum("rotorDiameter", e.target.value)} />
              </div>
              <div>
                <label htmlFor="padCompound" className={lbl}>Pad Compound</label>
                <select id="padCompound" className={inp} value={inputs.padCompound}
                  onChange={(e) => setInputs((p) => ({ ...p, padCompound: e.target.value as PadCompound }))}>
                  {PADS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 focus:outline-none">
                Advanced Options
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced ? (
                <div className="flex flex-col gap-4 p-4 rounded-lg bg-secondary/20 border border-border mt-3">
                  <div>
                    <div className={groupLabel}>
                      <Thermometer className="h-3.5 w-3.5" /> Thermal Properties
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="rotorMassKg" className={lbl}>Rotor Mass Each (kg)</label>
                        <input id="rotorMassKg" type="number" min="0.5" step="0.5" className={inp}
                          value={inputs.rotorMassKg} onChange={(e) => setNum("rotorMassKg", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="brakeBiasFront" className={lbl}>Front Brake Bias (%)</label>
                        <input id="brakeBiasFront" type="number" min="0" max="100" step="5" className={inp}
                          value={inputs.brakeBiasFront} onChange={(e) => setNum("brakeBiasFront", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="ambientTempC" className={lbl}>Ambient Temp (°C)</label>
                        <input id="ambientTempC" type="number" step="1" className={inp}
                          value={inputs.ambientTempC} onChange={(e) => setNum("ambientTempC", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="decelG" className={lbl}>Deceleration (g)</label>
                        <input id="decelG" type="number" step="0.05" min="0.1" className={inp}
                          value={inputs.decelG} onChange={(e) => setNum("decelG", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="unitSystem" className={lbl}>Unit System</label>
                        <select id="unitSystem" className={inp} value={inputs.unitSystem}
                          onChange={(e) => setInputs((p) => ({ ...p, unitSystem: e.target.value as UnitSystem }))}>
                          <option value="imperial">Imperial (lb, mph, in)</option>
                          <option value="metric">Metric (kg, km/h, mm)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Wind className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock repeated-stop heat soak and cooldown analysis
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="repeatedStops" className={lbl}>Repeated Stops</label>
                          <input id="repeatedStops" type="number" min="1" max="20" step="1" className={inp}
                            value={inputs.repeatedStops} onChange={(e) => setNum("repeatedStops", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="coolingIntervalS" className={lbl}>Cooling Interval (s)</label>
                          <input id="coolingIntervalS" type="number" min="0" step="5" className={inp}
                            value={inputs.coolingIntervalS} onChange={(e) => setNum("coolingIntervalS", e.target.value)} />
                        </div>
                        <div className="col-span-2">
                          <label htmlFor="airflow" className={lbl}>Cooling Airflow</label>
                          <select id="airflow" className={inp} value={inputs.airflow}
                            onChange={(e) => setInputs((p) => ({ ...p, airflow: e.target.value as Airflow }))}>
                            {AIRFLOWS.map((a) => (
                              <option key={a.key} value={a.key}>{a.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2.5 mt-2.5">
              <button type="button" onClick={calculate}
                className="h-10 w-full flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
                Calculate
              </button>
              <button type="button" onClick={reset} aria-label="Reset"
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Peak Rotor Temperature</div>
              <div className="text-4xl font-bold text-primary my-1">{num(result.peakTempC, 0)} °C</div>
              <div className="text-sm text-muted-foreground">
                {num(result.peakTempF, 0)} °F — <span className={`font-semibold ${result.fadeVerdictColor}`}>{result.fadeVerdict}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Rise Per Stop</div>
                <div className="text-lg font-bold text-emerald-600">{num(result.deltaTempC, 0)} °C</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Headroom</div>
                <div className={`text-lg font-bold ${result.headroomC < 0 ? "text-red-600" : result.headroomC < 80 ? "text-amber-600" : "text-emerald-600"}`}>
                  {num(result.headroomC, 0)} °C
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Of Fade Limit</div>
                <div className={`text-lg font-bold ${result.fadePercent >= 100 ? "text-red-600" : result.fadePercent >= 80 ? "text-amber-600" : "text-emerald-600"}`}>
                  {num(result.fadePercent, 0)}%
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Metric</th>
                    <th className="p-2.5 pr-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.rows.map((row) => (
                    <tr key={row.label} className={row.key ? "bg-primary/5" : ""}>
                      <td className={`text-base py-2.5 px-3 ${row.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{row.label}</td>
                      <td className={`text-base py-2.5 px-3 text-right font-medium ${row.key ? "text-primary font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold border-t-2 border-border">
                    <td className="text-base py-2.5 px-3 text-foreground">Peak Rotor Temperature</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{num(result.peakTempC, 0)} °C</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Rotor Temperature Across Successive Stops</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}°`} />
                    <RTooltip formatter={(value: number) => [`${value} °C`, "Rotor temp"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={result.fadeTempC} stroke="#DC2626" strokeDasharray="4 4"
                      label={{ value: "Fade threshold", fontSize: 10, fill: "#DC2626", position: "insideTopRight" }} />
                    <Bar dataKey="tempC" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name}
                          fill={point.tempC >= result.fadeTempC ? "#DC2626" : point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Final stop
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Earlier stops
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#DC2626" }} /> Past fade threshold
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Heat Soak &amp; Cooldown</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">
                      Peak After {Math.max(1, Math.floor(inputs.repeatedStops))} Stops
                    </div>
                    <div className={`text-base font-bold ${result.repeatedPeakTempC >= result.fadeTempC ? "text-red-600" : "text-foreground"}`}>
                      {num(result.repeatedPeakTempC, 0)} °C
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cooldown to 60% of Limit</div>
                    <div className="text-base font-bold text-foreground">{num(result.cooldownToSafeS, 0)} s</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cooling Time Constant</div>
                    <div className="text-base font-bold text-foreground">
                      {AIRFLOWS.find((a) => a.key === inputs.airflow)?.tauSeconds ?? 150} s
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Energy Per Front Rotor</div>
                    <div className="text-base font-bold text-foreground">{num(result.energyPerRotorJ / 1000, 0)} kJ</div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Repeated stops stack heat faster than the rotor can shed it. Cooling follows an exponential curve,
                      so short intervals between stops leave most of the previous rise in the metal. This model covers
                      pad fade only — brake fluid boiling depends on your fluid&apos;s wet boiling point and moisture content.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="bg-muted/30 rounded-lg p-5">
              <div className="grid grid-cols-2 gap-4">
                {result.rows.map((row) => (
                  <div key={row.label} className="flex flex-col">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">{row.label}</span>
                    <span className={`text-base font-bold ${row.key ? "text-primary" : "text-foreground"}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Where the Heat Comes From</h2>
            <p className="mb-4">
              Braking is energy conversion, not energy destruction. A moving car holds kinetic energy equal to half its
              mass times the square of its speed, and the brakes turn essentially all of it into heat in the friction
              surfaces. The square term is what makes speed so punishing: doubling your speed quadruples the energy the
              rotors must absorb. A 3,500 lb car stopping from 70 mph dumps roughly 750 kJ into the brakes — enough to
              raise a typical front rotor 150 to 200°C in a few seconds.
            </p>

            <h2 className="text-2xl font-bold mb-3">Pad Fade Versus Fluid Fade</h2>
            <p className="mb-4">
              Two different failures both get called fade. Pad fade is a friction problem: past its rated temperature,
              the compound&apos;s coefficient of friction falls, so the pedal stays firm but the car stops slowing as hard.
              Fluid fade is a hydraulic problem: boiling brake fluid creates compressible vapor, giving a long, soft
              pedal that may go to the floor. The distinction matters because the fixes differ. Pad fade calls for a
              higher-temperature compound or better cooling; fluid fade calls for fresh, high-boiling-point fluid.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Repeated Stops Are the Real Test</h2>
            <p className="mb-4">
              A single stop rarely causes fade. The problem is accumulation. Rotors cool exponentially with a time
              constant of roughly 100 to 200 seconds depending on airflow, so a stop every 30 seconds leaves most of the
              previous temperature rise still in the metal. Each stop adds its full rise on top of what remains, and the
              temperature climbs toward an equilibrium set by the ratio of heat in to heat out. This is why a long
              mountain descent or a track session finds the limit that a single panic stop never does.
            </p>

            <h2 className="text-2xl font-bold mb-3">Thermal Capacity Is Why Big Brakes Exist</h2>
            <p>
              Larger rotors help in two independent ways. Extra mass means the same energy produces a smaller temperature
              rise, and extra swept area means faster heat rejection to the passing air. Neither has much to do with
              clamping force, which is why upgrading pads and fluid on stock-size rotors improves fade resistance without
              improving thermal capacity. Match the whole system to the duty cycle: compound to peak temperature, rotor
              mass and ducting to sustained load, and fluid to the worst case you expect to see. Treat these figures as
              engineering estimates for planning rather than a substitute for measured rotor temperatures.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/brake-fade-temperature-calculator" />
          <PopularCalculators exclude="/calculator/brake-fade-temperature-calculator" />
        </div>
      </div>
    </>
  );
}
