"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface ImplementSpec {
  key: string;
  label: string;
  massKg: number;
  lengthM: number;
  diameterM: number;
  worldRecordM: number;
  wrHolder: string;
}

interface JavelinInputs {
  velocity: number;
  angle: number;
  height: number;
  implement: string;
  attitude: number;
  crossflowCd: number;
  axialCd: number;
  pitchFollow: number;
  altitudeM: number;
  headwind: number;
  decimals: number;
}

interface TrajectoryPoint {
  t: number;
  x: number;
  y: number;
  aoa: number;
}

const G = 9.80665;
const SEA_LEVEL_RHO = 1.225;

const IMPLEMENTS: ImplementSpec[] = [
  { key: "m800", label: "Men's 800 g (senior)", massKg: 0.8, lengthM: 2.65, diameterM: 0.028, worldRecordM: 98.48, wrHolder: "Jan Železný, 1996" },
  { key: "w600", label: "Women's 600 g (senior)", massKg: 0.6, lengthM: 2.25, diameterM: 0.024, worldRecordM: 72.28, wrHolder: "Barbora Špotáková, 2008" },
  { key: "y700", label: "Men's 700 g (U18)", massKg: 0.7, lengthM: 2.4, diameterM: 0.026, worldRecordM: 89.34, wrHolder: "U18 best, 700 g" },
  { key: "y500", label: "Women's 500 g (U18)", massKg: 0.5, lengthM: 2.1, diameterM: 0.022, worldRecordM: 63.01, wrHolder: "U18 best, 500 g" },
];

const DEFAULTS: JavelinInputs = {
  velocity: 29,
  angle: 34,
  height: 1.8,
  implement: "m800",
  attitude: 40,
  crossflowCd: 1.1,
  axialCd: 0.04,
  pitchFollow: 0.6,
  altitudeM: 0,
  headwind: 0,
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const implementOf = (k: string): ImplementSpec => IMPLEMENTS.find((i) => i.key === k) || IMPLEMENTS[0];

/** ISA density lapse — good to a few thousand metres. */
const densityAtAltitude = (altitudeM: number): number => {
  const T0 = 288.15;
  const L = 0.0065;
  const h = Math.max(0, altitudeM);
  const T = T0 - L * h;
  // rho = rho0 · (T/T0)^(g/(L·R) − 1), exponent ≈ 4.2559
  return SEA_LEVEL_RHO * Math.pow(T / T0, 4.2559);
};

interface FlightOutput {
  range: number;
  maxHeight: number;
  timeOfFlight: number;
  impactSpeed: number;
  impactAngle: number;
  peakLiftN: number;
  trajectory: TrajectoryPoint[];
}

/**
 * Slender-body (Allen–Perkins) aerodynamics: a javelin is a long cylinder, so normal
 * force comes from crossflow and axial force from skin friction. The shaft weathercocks
 * onto the flight path over time, which is what the 1986 centre-of-gravity rule was
 * designed to force — it is why modern javelins land point-first.
 */
const simulateFlight = (inputs: JavelinInputs, releaseAngleDeg: number, collect: boolean): FlightOutput => {
  const spec = implementOf(inputs.implement);
  const rho = densityAtAltitude(inputs.altitudeM);
  const m = spec.massKg;
  const refArea = spec.lengthM * spec.diameterM;

  const dt = 0.002;
  const pathAngle0 = (releaseAngleDeg * Math.PI) / 180;
  // Keep the release angle of attack the user chose even while sweeping the release angle.
  const aoa0 = ((inputs.attitude - inputs.angle) * Math.PI) / 180;

  let x = 0;
  let y = Math.max(0, inputs.height);
  let vx = inputs.velocity * Math.cos(pathAngle0);
  let vy = inputs.velocity * Math.sin(pathAngle0);
  let attitude = pathAngle0 + aoa0;
  let t = 0;
  let maxH = y;
  let peakLift = 0;

  const pts: TrajectoryPoint[] = [];
  let prevX = x;
  let prevY = y;
  let prevT = 0;
  let sampleCounter = 0;
  const MAX_STEPS = 20000;
  let steps = 0;

  while (y >= 0 && steps < MAX_STEPS) {
    if (collect && sampleCounter % 15 === 0) {
      pts.push({
        t: Math.round(t * 100) / 100,
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        aoa: Math.round(((attitude - Math.atan2(vy, vx)) * 180) / Math.PI * 10) / 10,
      });
    }
    sampleCounter++;

    prevX = x;
    prevY = y;
    prevT = t;

    // Air-relative velocity: a headwind pushes back against the throw direction.
    const vaX = vx + inputs.headwind;
    const vaY = vy;
    const va = Math.sqrt(vaX * vaX + vaY * vaY);

    let ax = 0;
    let ay = -G;

    if (va > 0.01) {
      const pathAngle = Math.atan2(vaY, vaX);
      const alpha = attitude - pathAngle;
      const sa = Math.sin(alpha);
      const ca = Math.cos(alpha);

      const cn = inputs.crossflowCd * sa * sa * Math.sign(sa || 1);
      const cAxial = inputs.axialCd;

      // Rotate the body-axis coefficients into wind axes.
      const cl = cn * ca - cAxial * sa;
      const cd = Math.abs(cn * sa) + cAxial * ca;

      const q = 0.5 * rho * va * va * refArea;
      const lift = q * cl;
      const drag = q * cd;
      if (Math.abs(lift) > Math.abs(peakLift)) peakLift = lift;

      const ux = vaX / va;
      const uy = vaY / va;
      ax = (-drag * ux - lift * uy) / m;
      ay = -G + (-drag * uy + lift * ux) / m;

      // The shaft rotates toward the flight path because the modern javelin is stable.
      attitude += (pathAngle - attitude) * Math.min(1, inputs.pitchFollow * dt);
    }

    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    steps++;
    if (y > maxH) maxH = y;
  }

  // Linear interpolation to the exact ground crossing.
  let range = x;
  let tof = t;
  if (prevY !== y) {
    const frac = prevY / (prevY - y);
    range = prevX + frac * (x - prevX);
    tof = prevT + frac * (t - prevT);
  }

  if (collect) pts.push({ t: Math.round(tof * 100) / 100, x: Math.round(range * 100) / 100, y: 0, aoa: 0 });

  const impactSpeed = Math.sqrt(vx * vx + vy * vy);
  const impactAngle = (Math.atan2(-vy, vx) * 180) / Math.PI;

  return { range, maxHeight: maxH, timeOfFlight: tof, impactSpeed, impactAngle, peakLiftN: peakLift, trajectory: pts };
};

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface JavelinResult {
  valid: boolean;
  errorMsg: string;
  range: number;
  maxHeight: number;
  timeOfFlight: number;
  impactSpeed: number;
  impactAngle: number;
  landsPointFirst: boolean;
  airDensity: number;
  vacuumRange: number;
  aeroGain: number;
  releaseAoa: number;
  refArea: number;
  horizontalV: number;
  verticalV: number;
  peakLiftN: number;
  percentOfWr: number;
  bestAngle: number;
  bestRange: number;
  implementLabel: string;
  worldRecordM: number;
  wrHolder: string;
  sweep: { angle: number; range: number }[];
  trajectoryRows: { t: number; x: number; y: number; aoa: number }[];
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

const calculateJavelin = (inputs: JavelinInputs): JavelinResult => {
  const spec = implementOf(inputs.implement);

  const blank = (errorMsg: string): JavelinResult => ({
    valid: false,
    errorMsg,
    range: 0,
    maxHeight: 0,
    timeOfFlight: 0,
    impactSpeed: 0,
    impactAngle: 0,
    landsPointFirst: false,
    airDensity: 0,
    vacuumRange: 0,
    aeroGain: 0,
    releaseAoa: 0,
    refArea: 0,
    horizontalV: 0,
    verticalV: 0,
    peakLiftN: 0,
    percentOfWr: 0,
    bestAngle: 0,
    bestRange: 0,
    implementLabel: spec.label,
    worldRecordM: spec.worldRecordM,
    wrHolder: spec.wrHolder,
    sweep: [],
    trajectoryRows: [],
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    inputs.velocity,
    inputs.angle,
    inputs.height,
    inputs.attitude,
    inputs.crossflowCd,
    inputs.axialCd,
    inputs.pitchFollow,
    inputs.altitudeM,
    inputs.headwind,
    inputs.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to simulate the throw.");
  if (inputs.velocity < 5 || inputs.velocity > 45) return blank("Release velocity should be between 5 and 45 m/s.");
  if (inputs.angle < 10 || inputs.angle > 60) return blank("Release angle should be between 10° and 60°.");
  if (inputs.height < 0.5 || inputs.height > 3) return blank("Release height should be between 0.5 and 3 m.");
  if (inputs.attitude < 5 || inputs.attitude > 70) return blank("Javelin attitude should be between 5° and 70°.");
  if (inputs.crossflowCd <= 0 || inputs.crossflowCd > 3) return blank("The crossflow drag coefficient should be above 0 and no more than 3.");
  if (inputs.axialCd < 0 || inputs.axialCd > 0.5) return blank("The axial coefficient should be between 0 and 0.5.");
  if (inputs.pitchFollow < 0 || inputs.pitchFollow > 5) return blank("The weathercock rate should be between 0 and 5 per second.");
  if (inputs.altitudeM < 0 || inputs.altitudeM > 3000) return blank("Altitude should be between 0 and 3,000 m.");
  if (inputs.headwind < -10 || inputs.headwind > 10) return blank("Headwind should be between −10 and +10 m/s.");

  const d = Math.max(0, Math.min(2, inputs.decimals));
  const rho = densityAtAltitude(inputs.altitudeM);
  const refArea = spec.lengthM * spec.diameterM;

  const flight = simulateFlight(inputs, inputs.angle, true);

  // Drag-free reference from the same release conditions.
  const th = (inputs.angle * Math.PI) / 180;
  const vx0 = inputs.velocity * Math.cos(th);
  const vy0 = inputs.velocity * Math.sin(th);
  const h0 = Math.max(0, inputs.height);
  const tVac = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
  const vacuumRange = vx0 * tVac;

  // Release-angle sweep from 20° to 50° in two-degree steps.
  const sweep: { angle: number; range: number }[] = [];
  let bestAngle = inputs.angle;
  let bestRange = -Infinity;
  for (let a = 20; a <= 50; a += 2) {
    const r = simulateFlight(inputs, a, false).range;
    sweep.push({ angle: a, range: Math.round(r * 100) / 100 });
    if (r > bestRange) {
      bestRange = r;
      bestAngle = a;
    }
  }

  const trajectoryRows = flight.trajectory.filter(
    (_, idx) => idx % Math.max(1, Math.ceil(flight.trajectory.length / 8)) === 0,
  );

  const percentOfWr = (flight.range / spec.worldRecordM) * 100;
  const landsPointFirst = flight.impactAngle > 25;
  const aeroGain = flight.range - vacuumRange;

  const verdict = `The throw carries ${fmt(flight.range, d)} m — ${fmt(percentOfWr, 1)}% of the ${fmt(
    spec.worldRecordM,
    2,
  )} m world record — and the sweep peaks at ${fmt(bestRange, d)} m with a release angle near ${bestAngle}°`;
  const verdictColor = percentOfWr >= 90 ? "text-emerald-600" : percentOfWr >= 70 ? "text-foreground" : "text-orange-600";

  const breakdown: BreakdownRow[] = [
    { label: "Implement", value: `${spec.label} · ${fmt(spec.massKg * 1000, 0)} g, ${fmt(spec.lengthM, 2)} m long` },
    { label: `Release velocity ${fmt(inputs.velocity, 2)} m/s`, value: `${fmt(inputs.velocity * 3.6, 1)} km/h` },
    { label: `Release angle ${fmt(inputs.angle, 1)}°`, value: `horizontal ${fmt(vx0, 2)} m/s · vertical ${fmt(vy0, 2)} m/s` },
    { label: `Release height ${fmt(inputs.height, 2)} m`, value: `attitude ${fmt(inputs.attitude, 1)}°` },
    { label: "Release angle of attack", value: `${fmt(inputs.attitude - inputs.angle, 1)}°`, highlight: true },
    { label: `Air density at ${fmt(inputs.altitudeM, 0)} m`, value: `${fmt(rho, 4)} kg/m³ (${fmt((rho / SEA_LEVEL_RHO) * 100, 1)}% of sea level)` },
    { label: `Wind ${fmt(inputs.headwind, 1)} m/s ${inputs.headwind >= 0 ? "headwind" : "tailwind"}`, value: `${fmt(inputs.headwind * 3.6, 1)} km/h along the flight path` },
    { label: "Reference planform area", value: `${fmt(refArea, 4)} m²` },
    { label: "Peak normal force from lift", value: `${fmt(flight.peakLiftN, 2)} N` },
    { label: "Range through vacuum, no lift or drag", value: `${fmt(vacuumRange, d)} m` },
    { label: "Aerodynamic gain over vacuum", value: `${aeroGain >= 0 ? "+" : "−"}${fmt(Math.abs(aeroGain), d)} m`, highlight: true },
    { label: "Simulated range", value: `${fmt(flight.range, d)} m`, highlight: true },
    { label: "Share of the world record", value: `${fmt(percentOfWr, 1)}% (${spec.wrHolder})` },
    { label: "Maximum height reached", value: `${fmt(flight.maxHeight, d)} m` },
    { label: "Time of flight", value: `${fmt(flight.timeOfFlight, 2)} s` },
    { label: "Impact speed", value: `${fmt(flight.impactSpeed, d)} m/s` },
    { label: `Impact angle ${fmt(flight.impactAngle, 1)}°`, value: landsPointFirst ? "lands point-first" : "below the point-first threshold" },
    { label: `Best release angle in the sweep`, value: `${fmt(bestAngle, 0)}° for ${fmt(bestRange, d)} m`, highlight: true },
    ...sweep.map((s) => ({ label: `Sweep at ${fmt(s.angle, 0)}° release`, value: `${fmt(s.range, 2)} m` })),
    ...trajectoryRows.map((p) => ({
      label: `Trajectory at ${fmt(p.t, 2)} s`,
      value: `${fmt(p.x, 2)} m downrange · ${fmt(p.y, 2)} m high · ${fmt(p.aoa, 1)}° angle of attack`,
    })),
  ];

  return {
    valid: true,
    errorMsg: "",
    range: flight.range,
    maxHeight: flight.maxHeight,
    timeOfFlight: flight.timeOfFlight,
    impactSpeed: flight.impactSpeed,
    impactAngle: flight.impactAngle,
    landsPointFirst,
    airDensity: rho,
    vacuumRange,
    aeroGain,
    releaseAoa: inputs.attitude - inputs.angle,
    refArea,
    horizontalV: vx0,
    verticalV: vy0,
    peakLiftN: flight.peakLiftN,
    percentOfWr,
    bestAngle,
    bestRange,
    implementLabel: spec.label,
    worldRecordM: spec.worldRecordM,
    wrHolder: spec.wrHolder,
    sweep,
    trajectoryRows,
    verdict,
    verdictColor,
    breakdown,
  };
};

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

export default function JavelinThrowDistanceCalculator() {
  const [implement, setImplement] = useState<string>(DEFAULTS.implement);
  const [velocity, setVelocity] = useState(String(DEFAULTS.velocity));
  const [angle, setAngle] = useState(String(DEFAULTS.angle));
  const [height, setHeight] = useState(String(DEFAULTS.height));
  const [attitude, setAttitude] = useState(String(DEFAULTS.attitude));
  const [altitudeM, setAltitudeM] = useState(String(DEFAULTS.altitudeM));
  const [headwind, setHeadwind] = useState(String(DEFAULTS.headwind));
  const [crossflowCd, setCrossflowCd] = useState(String(DEFAULTS.crossflowCd));
  const [axialCd, setAxialCd] = useState(String(DEFAULTS.axialCd));
  const [pitchFollow, setPitchFollow] = useState(String(DEFAULTS.pitchFollow));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): JavelinInputs => ({
    implement,
    velocity: parseFloat(velocity) || 0,
    angle: parseFloat(angle) || 0,
    height: parseFloat(height) || 0,
    attitude: parseFloat(attitude) || 0,
    altitudeM: parseFloat(altitudeM) || 0,
    headwind: parseFloat(headwind) || 0,
    crossflowCd: parseFloat(crossflowCd) || 0,
    axialCd: parseFloat(axialCd),
    pitchFollow: parseFloat(pitchFollow) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<JavelinInputs>(() => DEFAULTS);
  const [results, setResults] = useState<JavelinResult>(() => calculateJavelin(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateJavelin(inputs));
  };

  const reset = () => {
    setImplement(DEFAULTS.implement);
    setVelocity(String(DEFAULTS.velocity));
    setAngle(String(DEFAULTS.angle));
    setHeight(String(DEFAULTS.height));
    setAttitude(String(DEFAULTS.attitude));
    setAltitudeM(String(DEFAULTS.altitudeM));
    setHeadwind(String(DEFAULTS.headwind));
    setCrossflowCd(String(DEFAULTS.crossflowCd));
    setAxialCd(String(DEFAULTS.axialCd));
    setPitchFollow(String(DEFAULTS.pitchFollow));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateJavelin(DEFAULTS));
  };

  const velocityNum = parseFloat(velocity);
  const angleNum = parseFloat(angle);
  const heightNum = parseFloat(height);
  const attitudeNum = parseFloat(attitude);

  const errors = {
    velocity: !Number.isFinite(velocityNum) || velocityNum < 5 || velocityNum > 45 ? "Use 5–45 m/s" : "",
    angle: !Number.isFinite(angleNum) || angleNum < 10 || angleNum > 60 ? "Use 10–60°" : "",
    height: !Number.isFinite(heightNum) || heightNum < 0.5 || heightNum > 3 ? "Use 0.5–3 m" : "",
    attitude: !Number.isFinite(attitudeNum) || attitudeNum < 5 || attitudeNum > 70 ? "Use 5–70°" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "Why is the optimal javelin release angle not 45 degrees?",
      answer:
        "Forty-five degrees is optimal only for a projectile with no aerodynamics, released from ground level and landing at ground level. A javelin is none of those things. It is a lifting body that generates upward force whenever its shaft is inclined to the flight path, and lift is worth more than the extra flight time a steeper angle buys. Biomechanical studies of elite throwers consistently find release angles between 32 and 36 degrees, and the angle sweep in this calculator shows the same shape: a broad, flat optimum well below 45 degrees, which is reassuring because it means a thrower does not need to hit an exact number.",
    },
    {
      question: "What is angle of attack and why does it matter so much?",
      answer:
        "Angle of attack is the difference between where the javelin is pointing, its attitude, and where it is actually travelling, the flight-path angle. It is not the same as release angle, and confusing the two is the most common error in javelin analysis. A small positive angle of attack of roughly 3 to 8 degrees generates useful lift for very little drag penalty. Push beyond about 15 degrees and drag rises with the square of the sine while lift stalls, so the throw balloons upward and lands short — the throwers' description of getting this wrong is that the javelin flutters or sails.",
    },
    {
      question: "Why did the men's world record get reset in 1986?",
      answer:
        "Uwe Hohn threw 104.80 m in 1984, which was running out of infield at major stadiums and creating a genuine safety problem as javelins landed near the far track. In 1986 the IAAF moved the centre of gravity of the men's implement 4 cm forward of the centre of pressure, which makes the shaft pitch nose-down during flight so it descends steeply and lands point-first rather than flat. The change cut distances by roughly 10 percent, and the women's implement was modified the same way in 1999. Every record set before those dates was retired, which is why the 98.48 m mark from 1996 sits where it does in the record books.",
    },
    {
      question: "How much do wind and altitude help a throw?",
      answer:
        "Both work through air density. Air density falls with altitude — about 10 percent lower at 1,000 m and 20 percent lower at 2,000 m than at sea level — and both lift and drag scale with it, so a thinner atmosphere reduces the lift that carries the javelin as well as the drag that slows it. The net effect in the simulation is usually a small gain for heavier implements and a small loss for lighter ones, which is why altitude records cluster around the heavier throws. A headwind raises the air-relative velocity and therefore both forces: it adds drag and lends extra lift, and a tailwind does the reverse, which is why the wind rules in the sport are strict about measuring it.",
    },
    {
      question: "How accurate is the simulation?",
      answer:
        "It captures the physics that shape a real throw — release velocity, angle, attitude, slender-body lift and drag, weathercocking of the shaft, air density and wind — and reproduces the flat optimum around 33 to 36 degrees that the biomechanics literature reports for elite throwers. What it cannot see is the thrower: release velocity is an input rather than a prediction, the model ignores the javelin's spin and vibration, and it treats the atmosphere as still and uniform apart from the wind you enter. Use it to understand how the variables interact, not to predict what an athlete will throw tomorrow.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Javelin Throw Distance Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Javelin Throw Distance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Release">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="implement"
                  label="Implement"
                  value={implement}
                  onChange={setImplement}
                  options={IMPLEMENTS.map((i) => ({ value: i.key, label: i.label }))}
                  tooltip="Sets the mass, length, diameter and the world record the throw is compared with."
                />
                <CompactInput
                  id="velocity"
                  label="Release Velocity"
                  value={velocity}
                  onChange={setVelocity}
                  onEnter={runCalculate}
                  min="5"
                  max="45"
                  step="any"
                  suffix="m/s"
                  error={errors.velocity}
                  hint="World class is 28–32 m/s."
                  tooltip="Speed of the javelin as it leaves the hand."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="angle"
                  label="Release Angle"
                  value={angle}
                  onChange={setAngle}
                  onEnter={runCalculate}
                  min="10"
                  max="60"
                  step="any"
                  suffix="°"
                  error={errors.angle}
                  tooltip="Angle of the velocity vector at release, not of the shaft."
                />
                <CompactInput
                  id="height"
                  label="Release Height"
                  value={height}
                  onChange={setHeight}
                  onEnter={runCalculate}
                  min="0.5"
                  max="3"
                  step="0.05"
                  suffix="m"
                  error={errors.height}
                  tooltip="Height of the hand at release above the ground."
                />
              </div>
            </SubSection>

            <SubSection title="Attitude & Environment">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="attitude"
                  label="Javelin Attitude"
                  value={attitude}
                  onChange={setAttitude}
                  onEnter={runCalculate}
                  min="5"
                  max="70"
                  step="any"
                  suffix="°"
                  error={errors.attitude}
                  hint="Attitude minus release angle is the angle of attack."
                  tooltip="Angle of the shaft above the horizontal at release; the difference from the release angle gives the angle of attack."
                />
                <CompactInput
                  id="headwind"
                  label="Headwind"
                  value={headwind}
                  onChange={setHeadwind}
                  onEnter={runCalculate}
                  min="-10"
                  max="10"
                  step="0.5"
                  suffix="m/s"
                  hint="Negative for a tailwind."
                  tooltip="Wind along the flight path; positive is into the thrower's face."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="altitude"
                  label="Altitude"
                  value={altitudeM}
                  onChange={setAltitudeM}
                  onEnter={runCalculate}
                  min="0"
                  max="3000"
                  step="50"
                  suffix="m"
                  tooltip="Sets air density through the ISA lapse rate, which scales both lift and drag."
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
                  tooltip="Decimal places used for the distances."
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
                  <SubSection title="Slender-Body Aerodynamics">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="crossflow"
                        label="Crossflow Cd"
                        value={crossflowCd}
                        onChange={setCrossflowCd}
                        onEnter={runCalculate}
                        min="0.1"
                        max="3"
                        step="0.05"
                        hint="1.1 for a javelin section."
                        tooltip="Allen–Perkins crossflow drag coefficient; it drives the normal force from the angle of attack."
                      />
                      <CompactInput
                        id="axial"
                        label="Axial Cd"
                        value={axialCd}
                        onChange={setAxialCd}
                        onEnter={runCalculate}
                        min="0"
                        max="0.5"
                        step="0.005"
                        hint="Skin friction along the shaft."
                        tooltip="Skin-friction coefficient along the shaft axis; 0.04 suits a smooth carbon shaft."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <CompactInput
                        id="pitch"
                        label="Weathercock Rate"
                        value={pitchFollow}
                        onChange={setPitchFollow}
                        onEnter={runCalculate}
                        min="0"
                        max="5"
                        step="0.05"
                        suffix="/s"
                        tooltip="How quickly the shaft rotates onto the flight path; the modern centre of gravity makes this fast."
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-[11px] text-muted-foreground">
                          Simulation step 2 ms; a throw is integrated over roughly 20,000 steps or the time of flight, whichever comes
                          first.
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Simulated Throw</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.range, calcInputs.decimals)} m` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${results.implementLabel} — ${fmt(results.percentOfWr, 1)}% of the ${fmt(
                      results.worldRecordM,
                      2,
                    )} m world record, releasing at ${fmt(calcInputs.velocity, 1)} m/s and ${fmt(calcInputs.angle, 1)}°`
                  : "Fix the highlighted inputs to simulate the throw"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Best Angle</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.bestAngle, 0)}°` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Flight Time</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.timeOfFlight, 2)} s` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Impact</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.impactSpeed, 0)} m/s` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Flight Item</th>
                    <th className="p-2.5 pr-3 text-right w-[260px]">Value</th>
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
                        Enter the release conditions to simulate the flight.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Range</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${fmt(results.range, calcInputs.decimals)} m · best ${fmt(results.bestRange, calcInputs.decimals)} m at ${
                          results.bestAngle
                        }°`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Range</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.range, 1)} m` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Share of world record</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.percentOfWr, 1)}%` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Angle of attack</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.releaseAoa, 1)}°` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Aerodynamic gain</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${results.aeroGain >= 0 ? "+" : "−"}${fmt(Math.abs(results.aeroGain), 1)} m` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Maximum height</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.maxHeight, 1)} m` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Peak normal force</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.peakLiftN, 1)} N` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Air density</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.airDensity, 3)} kg/m³` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Landing</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? (results.landsPointFirst ? "point-first" : "flat or steep") : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Javelin Throw Distance Calculator?</h2>
            <p>
              A javelin throw distance calculator simulates the flight of the implement from the release conditions — velocity, angle,
              attitude, height — through the aerodynamics that actually carry it, and reports how far it goes. Unlike a simple projectile
              formula, it treats the javelin as a slender body that develops lift from its angle of attack, suffers drag along both axes,
              and rotates in the air as the shaft weathercocks onto its flight path.
            </p>
            <p>
              That last behaviour is the reason the event looks the way it does. A javelin is not a spear thrown in a straight line; it is
              a lifting body whose flight depends on how the shaft is oriented relative to the airflow, and getting that orientation wrong
              costs metres whether the thrower is a beginner or a national-level athlete.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The simulation integrates the flight in two-millisecond steps. At each step the air-relative velocity is computed — a headwind
              increases it, a tailwind decreases it — and the angle between the shaft and that velocity vector gives the angle of attack.
              The normal force follows Allen–Perkins slender-body theory, in which the crossflow coefficient acts on the square of the sine
              of that angle, while a smaller axial coefficient represents skin friction along the shaft. Those two are rotated into wind
              axes to give lift and drag, and the shaft is allowed to rotate towards the flight path at the weathercocking rate.
            </p>
            <p>
              Air density comes from the ISA lapse rate, so altitude and temperature both change the forces: both lift and drag scale with
              density, which is why the effect of altitude depends on how much of the flight is lift-driven. The flight ends when the
              interpolated trajectory crosses the ground, and the model reports the impact angle, which is the test of whether the javelin
              landed point-first — the behaviour the 1986 centre-of-gravity rule was introduced to enforce.
            </p>
            <p>
              The results also include a drag-free reference computed from the same release conditions, so the aerodynamic gain or loss can
              be seen directly, and a sweep of release angles from 20 to 50 degrees in two-degree steps. The sweep is the practical part of
              the tool: it shows where the optimum sits for your release velocity and attitude, and how flat the curve is around it. Real
              throwers find a broad optimum between roughly 32 and 36 degrees, which means a small error in release angle costs little —
              while a large error in attitude, which shows up as angle of attack, costs a great deal.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the simulated range with the share of the world record for the selected implement. The three-stat bar adds
              the best release angle from the sweep, the time of flight and the impact speed.
            </p>
            <p>
              The breakdown table records every element of the flight: the release velocity and angle, the release height and attitude, the
              angle of attack, air density and wind, the aerodynamic gain over vacuum, the range, the maximum height, the time of flight,
              the impact speed and angle, the landing verdict, and then the full angle sweep and a sample of trajectory checkpoints with
              their positions and angles of attack. The summary panel repeats the headline figures and prints the verdict line.
            </p>
            <p>
              Read the simulation as a way to understand how the variables interact rather than as a prediction of an athlete's throw.
              Release velocity is an input, not a projection: a thrower who releases at 26 m/s will see about 70 metres and one at 32 m/s
              will see over 90, and no amount of tuning the other sliders closes that gap. The model also assumes a still, uniform
              atmosphere apart from the wind you enter, ignores the implement's spin and flex, and does not include the boundary effects
              near release — which is why the numbers are best used to compare two attitudes or two wind conditions rather than to certify
              a distance.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/javelin-throw-distance-calculator" />
          <PopularCalculators exclude="/calculator/javelin-throw-distance-calculator" />
        </div>
      </div>
    </>
  );
}
