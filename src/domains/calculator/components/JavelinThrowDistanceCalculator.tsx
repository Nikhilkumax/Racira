"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type ImplementKey = "m800" | "w600" | "y700" | "y500";

interface ImplementSpec {
  key: ImplementKey;
  label: string;
  massKg: number;
  lengthM: number;
  diameterM: number;
  worldRecordM: number;
  wrHolder: string;
}

interface JavelinInputs {
  velocity: number;        // m/s at release
  angle: number;           // release velocity vector angle, degrees
  height: number;          // release height, m
  implement: ImplementKey;
  // Tier 2A — aerodynamics
  attitude: number;        // javelin long-axis angle at release, degrees
  crossflowCd: number;     // cylinder crossflow drag coefficient
  axialCd: number;         // skin-friction / axial coefficient
  pitchFollow: number;     // how fast the shaft weathercocks onto the flight path, per second
  // Tier 2A — environment
  altitudeM: number;
  headwind: number;        // m/s, positive = into the thrower's face
  // Tier 2B
  proMode: boolean;
}

interface TrajectoryPoint {
  t: number;
  x: number;
  y: number;
  aoa: number;
}

interface SweepRow {
  angle: number;
  range: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface JavelinResult {
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
  trajectory: TrajectoryPoint[];
  sweep: SweepRow[];
  bestAngle: number;
  bestRange: number;
}

const G = 9.80665;
const SEA_LEVEL_RHO = 1.225;

const IMPLEMENTS: ImplementSpec[] = [
  { key: "m800", label: "Men's 800 g (senior)", massKg: 0.8, lengthM: 2.65, diameterM: 0.028, worldRecordM: 98.48, wrHolder: "Jan Železný, 1996" },
  { key: "w600", label: "Women's 600 g (senior)", massKg: 0.6, lengthM: 2.25, diameterM: 0.024, worldRecordM: 72.28, wrHolder: "Barbora Špotáková, 2008" },
  { key: "y700", label: "Men's 700 g (U18)", massKg: 0.7, lengthM: 2.4, diameterM: 0.026, worldRecordM: 89.34, wrHolder: "U18 best, 700 g" },
  { key: "y500", label: "Women's 500 g (U18)", massKg: 0.5, lengthM: 2.1, diameterM: 0.022, worldRecordM: 63.01, wrHolder: "U18 best, 500 g" },
];

const implementOf = (k: ImplementKey): ImplementSpec => IMPLEMENTS.find((i) => i.key === k) ?? IMPLEMENTS[0];

/** ISA density lapse — good to a few thousand metres */
const densityAtAltitude = (altitudeM: number): number => {
  const T0 = 288.15;
  const L = 0.0065;
  const h = Math.max(0, altitudeM);
  const T = T0 - L * h;
  // rho = rho0 * (T/T0)^(g/(L*R) - 1), exponent ≈ 4.2559
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
 * onto the flight path over time, which is exactly what the 1986 CoG rule was designed
 * to force — it is why modern javelins land point-first.
 */
const simulateFlight = (inputs: JavelinInputs, releaseAngleDeg: number, collect: boolean): FlightOutput => {
  const spec = implementOf(inputs.implement);
  const rho = densityAtAltitude(inputs.altitudeM);
  const m = spec.massKg;
  const refArea = spec.lengthM * spec.diameterM; // planform of a slender cylinder

  const dt = 0.002;
  const pathAngle0 = (releaseAngleDeg * Math.PI) / 180;
  // Keep the release angle of attack the user chose even while sweeping the release angle
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

  // hard stop so a pathological input can never spin forever
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

    // Air-relative velocity: headwind pushes back against the throw direction
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

      // Allen–Perkins: normal force from crossflow, axial force from skin friction
      const cn = inputs.crossflowCd * sa * sa * Math.sign(sa || 1);
      const cAxial = inputs.axialCd;

      // Rotate body-axis coefficients into wind axes
      const cl = cn * ca - cAxial * sa;
      const cd = Math.abs(cn * sa) + cAxial * ca;

      const q = 0.5 * rho * va * va * refArea;
      const lift = q * cl;
      const drag = q * cd;
      if (Math.abs(lift) > Math.abs(peakLift)) peakLift = lift;

      // drag opposes the air-relative velocity; lift is perpendicular to it
      const ux = vaX / va;
      const uy = vaY / va;
      ax = (-drag * ux - lift * uy) / m;
      ay = -G + (-drag * uy + lift * ux) / m;

      // Shaft rotates toward the flight path (aerodynamically stable design)
      attitude += (pathAngle - attitude) * Math.min(1, inputs.pitchFollow * dt);
    }

    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    steps++;
  }

  // Linear interpolation to the exact ground crossing
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

const calculateJavelin = (inputs: JavelinInputs): JavelinResult => {
  const spec = implementOf(inputs.implement);
  const rho = densityAtAltitude(inputs.altitudeM);
  const refArea = spec.lengthM * spec.diameterM;

  const flight = simulateFlight(inputs, inputs.angle, true);

  // Drag-free reference from the same release conditions
  const th = (inputs.angle * Math.PI) / 180;
  const vx0 = inputs.velocity * Math.cos(th);
  const vy0 = inputs.velocity * Math.sin(th);
  const h0 = Math.max(0, inputs.height);
  const tVac = (vy0 + Math.sqrt(vy0 * vy0 + 2 * G * h0)) / G;
  const vacuumRange = vx0 * tVac;

  // Release-angle sweep, 20° to 50°
  const sweep: SweepRow[] = [];
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

  return {
    range: flight.range,
    maxHeight: flight.maxHeight,
    timeOfFlight: flight.timeOfFlight,
    impactSpeed: flight.impactSpeed,
    impactAngle: flight.impactAngle,
    // Point-first landing needs the nose below the flight path at impact
    landsPointFirst: flight.impactAngle > 25,
    airDensity: rho,
    vacuumRange,
    aeroGain: flight.range - vacuumRange,
    releaseAoa: inputs.attitude - inputs.angle,
    refArea,
    horizontalV: vx0,
    verticalV: vy0,
    peakLiftN: flight.peakLiftN,
    percentOfWr: (flight.range / spec.worldRecordM) * 100,
    trajectory: flight.trajectory,
    sweep,
    bestAngle,
    bestRange,
  };
};

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
  proMode: false,
};

const FAQS = [
  {
    question: "Why is the optimal javelin release angle not 45 degrees?",
    answer:
      "Forty-five degrees is optimal only for a projectile with no aerodynamics, released from ground level, landing at ground level. A javelin is none of those things. It is a lifting body that generates upward force whenever its shaft is inclined to the flight path, and lift is worth more when the throw is flatter and faster. Biomechanical studies of elite throwers consistently find release angles between 32 and 36 degrees, and this calculator's angle sweep will show you the same shape: a broad, flat optimum well below 45 degrees.",
  },
  {
    question: "What is angle of attack and why does it matter so much?",
    answer:
      "Angle of attack is the difference between where the javelin is pointing (its attitude) and where it is actually travelling (its flight-path angle). It is not the same as release angle, and confusing the two is the most common error in javelin analysis. A small positive angle of attack of roughly 3 to 8 degrees generates useful lift for very little drag penalty. Push beyond about 15 degrees and drag rises with the square of the sine while lift stalls, so the throw balloons upward and lands short. Throwers describe getting this wrong as the javelin 'fluttering' or 'sailing'.",
  },
  {
    question: "Why did the men's javelin world record get reset in 1986?",
    answer:
      "Uwe Hohn threw 104.80 m in 1984, which was running out of infield at major stadiums and creating a genuine safety problem — javelins were landing near the far running track. In 1986 the IAAF moved the centre of gravity of the men's implement 4 cm forward of the centre of pressure. That change makes the javelin pitch nose-down during flight so it descends steeply and lands point-first, and it cut distances by roughly 10 percent. The women's implement was modified the same way in 1999. All records before those dates were retired.",
  },
  {
    question: "How much does release velocity matter compared with angle?",
    answer:
      "Enormously more. In a vacuum, range scales with the square of release velocity, so a 5 percent faster throw is about 10 percent further. With aerodynamics the exponent is a little lower, but the conclusion holds: velocity dominates everything. Release angle has a famously flat optimum — being three or four degrees off costs a fraction of a metre, while being 1 m/s slow costs several metres. This is why javelin coaching spends far more time on the approach run, the crossover steps and the blocking action of the front leg than on release angle.",
  },
  {
    question: "Does a headwind help or hurt a javelin throw?",
    answer:
      "A moderate headwind usually helps, which surprises people. Because the javelin is a lifting body, headwind increases the airspeed over it and therefore increases lift, and the extra time aloft can more than pay for the extra drag. Throwers frequently prefer a light headwind of two to four metres per second, and many personal bests are set into the wind. Strong headwinds above roughly six metres per second reverse the trade, and a tailwind reduces airspeed and usually reduces distance. Note that unlike sprints and horizontal jumps, javelin has no legal wind limit for records.",
  },
  {
    question: "Does throwing at altitude increase distance?",
    answer:
      "It cuts both ways. Thinner air at altitude reduces drag, which helps, but it also reduces lift, which hurts — and for a lifting implement like a javelin the lift loss often matters more. This is the opposite of the discus and the shot put, where altitude is a straightforward advantage. The calculator applies the International Standard Atmosphere density lapse, so you can enter an altitude and see which effect wins for your particular combination of speed and angle of attack.",
  },
  {
    question: "What release velocity do elite throwers actually achieve?",
    answer:
      "World-class men release the 800 g javelin at roughly 30 to 32 metres per second, which is about 108 to 115 km/h. World-class women release the 600 g implement at around 26 to 28 metres per second. Those figures come from high-speed video at major championships. A well-trained club thrower is typically in the low-to-mid twenties. Because range scales close to the square of velocity, the gap between 25 and 30 m/s is the difference between roughly 60 m and roughly 85 m.",
  },
  {
    question: "How accurate is this simulation?",
    answer:
      "It is a two-dimensional slender-body model integrated at 2 millisecond steps, using crossflow and axial force coefficients and a simple weathercocking law for how the shaft rotates onto the flight path. That captures the physics that actually decides javelin range: lift, drag, and pitch behaviour. It does not model vibration of the shaft, the aerodynamic asymmetry of a spinning implement, sidewind yaw, or the specific pressure distribution of any particular manufacturer's design. Treat the output as a well-grounded estimate for exploring how release parameters trade off, not as a substitute for measured competition data.",
  },
];

const JavelinThrowDistanceCalculator = () => {
  const [inputs, setInputs] = useState<JavelinInputs>(DEFAULTS);
  const [result, setResult] = useState<JavelinResult>(calculateJavelin(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateJavelin(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof JavelinInputs>(key: K, val: JavelinInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateJavelin(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateJavelin(DEFAULTS));
    setShowAdvanced(false);
  };

  const spec = implementOf(inputs.implement);
  const fmt = (n: number, d = 2) =>
    n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const tableRows: TableRow[] = [
    { rowId: "implement", label: "Implement", value: `${spec.label} — ${spec.massKg} kg, ${spec.lengthM} m` },
    { rowId: "velocity", label: "Release velocity", value: `${fmt(inputs.velocity, 1)} m/s (${fmt(inputs.velocity * 3.6, 1)} km/h)` },
    { rowId: "components", label: "Velocity split (horizontal / vertical)", value: `${fmt(result.horizontalV, 1)} / ${fmt(result.verticalV, 1)} m/s` },
    { rowId: "angle", label: "Release angle", value: `${fmt(inputs.angle, 1)}°` },
    { rowId: "aoa", label: "Release angle of attack (attitude − path)", value: `${fmt(result.releaseAoa, 1)}°` },
    { rowId: "rho", label: `Air density at ${inputs.altitudeM.toLocaleString()} m`, value: `${fmt(result.airDensity, 3)} kg/m³` },
    { rowId: "vacuum", label: "Drag-free reference range", value: `${fmt(result.vacuumRange)} m` },
    { rowId: "aero", label: "Net aerodynamic effect (lift − drag)", value: `${result.aeroGain >= 0 ? "+" : ""}${fmt(result.aeroGain)} m`, key: true },
    { rowId: "apex", label: "Peak height above ground", value: `${fmt(result.maxHeight)} m` },
    { rowId: "tof", label: "Time of flight", value: `${fmt(result.timeOfFlight)} s` },
    { rowId: "impact", label: "Impact speed / descent angle", value: `${fmt(result.impactSpeed, 1)} m/s at ${fmt(result.impactAngle, 1)}°` },
    { rowId: "range", label: "Predicted throw distance", value: `${fmt(result.range)} m`, total: true },
  ];

  const chartData = result.trajectory.map((p) => ({ x: p.x, y: p.y }));

  const wrap =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel =
    "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium text-foreground mb-1";

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
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className={lbl}>Release Velocity</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.velocity}
                  onChange={(e) => set("velocity", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={1}
                  step={0.5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">m/s</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Elite men release at 30–32 m/s, elite women at 26–28 m/s. This is the single biggest lever on distance.
              </p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Release Angle</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.angle}
                  onChange={(e) => set("angle", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  max={80}
                  step={1}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">°</span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Release Height</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.height}
                  onChange={(e) => set("height", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={0.1}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">m</span>
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Implement Class</label>
              <select
                value={inputs.implement}
                onChange={(e) => set("implement", e.target.value as ImplementKey)}
                className={sel}
              >
                {IMPLEMENTS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                World record {spec.worldRecordM} m — {spec.wrHolder}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className="text-sm font-semibold text-primary hover:underline text-left mt-1"
            >
              {showAdvanced ? "− Hide" : "+ Show"} Advanced Options
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Aerodynamics</div>
                  <div className="flex flex-col">
                    <label className={lbl}>Release Attitude (shaft angle)</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.attitude}
                        onChange={(e) => set("attitude", parseFloat(e.target.value) || 0)}
                        className={ci}
                        step={1}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">°</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Angle of attack is attitude minus release angle: currently{" "}
                      <strong className="text-foreground">{fmt(inputs.attitude - inputs.angle, 1)}°</strong>. Elite throws sit near 3–8°.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Crossflow C<sub>d</sub></label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.crossflowCd}
                          onChange={(e) => set("crossflowCd", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0}
                          step={0.05}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Axial C<sub>d</sub></label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.axialCd}
                          onChange={(e) => set("axialCd", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0}
                          step={0.005}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col mt-3">
                    <label className={lbl}>Pitch-Follow Rate</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.pitchFollow}
                        onChange={(e) => set("pitchFollow", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={0}
                        step={0.1}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">/s</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      How quickly the shaft weathercocks onto the flight path. Higher values model the post-1986 nose-forward
                      implement that lands point-first.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Environment</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Altitude</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.altitudeM}
                          onChange={(e) => set("altitudeM", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0}
                          step={100}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">m</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Headwind</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.headwind}
                          onChange={(e) => set("headwind", parseFloat(e.target.value) || 0)}
                          className={ci}
                          step={0.5}
                        />
                        <span className="pr-3 text-sm text-muted-foreground select-none">m/s</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Positive headwind blows into the thrower&apos;s face; use a negative value for a tailwind.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm font-semibold text-foreground">Professional Mode</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Adds the full release-angle sweep table and the landing-legality check.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center"
                aria-label="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RESULTS */}
          <div className="flex flex-col gap-4">
            {/* 1. Primary */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">Predicted Throw Distance</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">{fmt(result.range)}</div>
                <div className="text-lg font-semibold text-muted-foreground">metres</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                {fmt(result.percentOfWr, 1)}% of the {spec.worldRecordM} m world record &middot; apex {fmt(result.maxHeight, 1)} m &middot;{" "}
                {fmt(result.timeOfFlight, 2)} s aloft
              </div>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Angle of Attack</div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color:
                      result.releaseAoa >= 2 && result.releaseAoa <= 10
                        ? "hsl(142 71% 45%)"
                        : result.releaseAoa > 10 && result.releaseAoa <= 15
                        ? "hsl(25 95% 53%)"
                        : "hsl(0 84% 60%)",
                  }}
                >
                  {fmt(result.releaseAoa, 1)}°
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">ideal 3–8°</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Aero Effect</div>
                <div
                  className="text-2xl font-bold"
                  style={{ color: result.aeroGain >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}
                >
                  {result.aeroGain >= 0 ? "+" : ""}
                  {fmt(result.aeroGain, 1)} m
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">vs drag-free flight</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Best Angle</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{result.bestAngle}°</div>
                <div className="text-xs text-muted-foreground mt-0.5">would reach {fmt(result.bestRange, 1)} m</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Flight Breakdown</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {tableRows.map((r) => (
                    <tr
                      key={r.rowId}
                      className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                    >
                      <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-1">Flight Path</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Height against ground distance. The dashed line marks the {fmt(result.vacuumRange, 1)} m a drag-free projectile
                would reach from the same release.
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={[0, "dataMax"]}
                        tick={{ fontSize: 11 }}
                        stroke="hsl(215 16% 65%)"
                        unit=" m"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" width={48} unit=" m" />
                      <RTooltip
                        formatter={(v: number) => [`${fmt(v, 1)} m`, "Height"]}
                        labelFormatter={(l: number) => `${fmt(l, 1)} m downrange`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        x={Math.round(result.vacuumRange * 10) / 10}
                        stroke="hsl(215 16% 65%)"
                        strokeDasharray="4 4"
                        label={{ value: "drag-free", fontSize: 10, position: "insideTopRight" }}
                      />
                      <Area type="monotone" dataKey="y" name="Height above ground" fill="hsl(217 91% 60%)" fillOpacity={0.15} stroke="none" />
                      <Line type="monotone" dataKey="y" name="Trajectory" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Pro mode */}
            {inputs.proMode && (
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Release-Angle Sweep</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Every row re-runs the full simulation with your velocity, height and aerodynamics, changing only the release
                  angle. Note how flat the optimum is — this is why coaches prioritise speed over angle.
                </p>
                <table className="w-full text-base border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left text-sm font-bold text-muted-foreground">Release angle</th>
                      <th className="py-2 px-3 text-right text-sm font-bold text-muted-foreground">Distance</th>
                      <th className="py-2 px-3 text-right text-sm font-bold text-muted-foreground">vs best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.sweep.map((s) => (
                      <tr
                        key={`sweep-${s.angle}`}
                        className={`border-b border-border/60 last:border-0 ${s.angle === result.bestAngle ? "bg-primary/10" : ""}`}
                      >
                        <td className={`py-2.5 px-3 ${s.angle === result.bestAngle ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                          {s.angle}°
                        </td>
                        <td className={`py-2.5 px-3 text-right tabular-nums ${s.angle === result.bestAngle ? "font-bold text-primary" : "text-foreground"}`}>
                          {fmt(s.range)} m
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                          {s.range - result.bestRange >= 0 ? "—" : `${fmt(s.range - result.bestRange, 2)} m`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="mt-4 rounded-lg p-3 border"
                  style={{
                    borderColor: result.landsPointFirst ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)",
                    backgroundColor: result.landsPointFirst ? "hsl(142 71% 45% / 0.1)" : "hsl(25 95% 53% / 0.1)",
                  }}
                >
                  <div className="text-sm font-semibold text-foreground mb-0.5">Landing check</div>
                  <div className="text-sm text-muted-foreground">
                    Descent angle is {fmt(result.impactAngle, 1)}°.{" "}
                    {result.landsPointFirst
                      ? "Steep enough that the tip strikes first, so the throw would be marked valid under World Athletics Rule 38."
                      : "That is shallow for a legal landing — a flat javelin risks landing tail-first or skidding, which is a foul. Reduce the angle of attack or increase the pitch-follow rate."}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Summary statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {tableRows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Your release angle of {fmt(inputs.angle, 1)}° gives up {fmt(Math.abs(result.range - result.bestRange), 2)} m against the
                best angle found in the sweep ({result.bestAngle}°). Aerodynamics are currently worth{" "}
                {result.aeroGain >= 0 ? "an extra" : "a loss of"} {fmt(Math.abs(result.aeroGain), 2)} m compared with drag-free flight.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Why a Javelin Is Not a Cannonball</h2>
            <p>
              Almost every projectile-motion lesson starts with the same result: to maximise range, launch at 45 degrees. That
              answer is correct for a point mass in a vacuum, and it is wrong for a javelin by a wide margin. A javelin is a
              two-and-a-half metre lifting body. Whenever its shaft is inclined to the direction it is travelling, air pushes
              perpendicular to the flight path as well as against it, and that lift keeps it aloft far longer than gravity alone
              would allow.
            </p>
            <p>
              This calculator therefore does not use the closed-form range equation. It integrates the flight numerically in
              2 millisecond steps, resolving the aerodynamic force into a component along the shaft and a component across it
              — the slender-body treatment first set out by Allen and Perkins for long cylindrical bodies. At each step it also
              rotates the shaft toward the flight path, which is how a stable javelin actually behaves in the air. The output is
              a trajectory, not a formula, which is why the shape of the flight path on the chart is asymmetric: the descent is
              steeper than the climb.
            </p>

            <h2 className="text-2xl font-bold mb-3">Release Angle, Attitude, and the Angle That Actually Matters</h2>
            <p>
              Three angles get confused constantly. <strong>Release angle</strong> is the direction the javelin&apos;s centre of mass is
              moving at the instant it leaves the hand. <strong>Attitude</strong> is where the shaft is pointing. <strong>Angle of
              attack</strong> is the difference between the two, and it is the one that determines the aerodynamic force.
            </p>
            <p>
              A javelin released at 34 degrees with the tip pointing at 40 degrees has a 6 degree angle of attack — modest,
              efficient, and close to what high-speed film shows for good throws. The same 34 degree release with the tip at 55
              degrees has a 21 degree angle of attack, and the result is a throw that climbs steeply, decelerates hard, and lands
              well short. Throwers call this stalling or sailing. Change the attitude field in the advanced panel while leaving
              release angle alone and you can watch the distance collapse without any change in how hard the throw was made.
            </p>

            <h2 className="text-2xl font-bold mb-3">The 1986 Rule Change and Why Records Restarted</h2>
            <p>
              In 1984 Uwe Hohn threw 104.80 metres. It was a magnificent throw and an infrastructure crisis: javelins were
              reaching the far end of stadium infields and landing near the opposite running track, and the old implements often
              landed flat, making valid-throw judgements contentious. In 1986 the governing body moved the centre of gravity of
              the men&apos;s javelin four centimetres forward relative to its centre of pressure.
            </p>
            <p>
              That single change makes the javelin nose-heavy in aerodynamic terms, so it pitches down through the flight and
              arrives tip-first at a steep angle. It also cut distances by roughly ten percent, which is why the current men&apos;s
              record of 98.48 metres by Jan Železný sits below Hohn&apos;s retired mark. The women&apos;s implement received the same
              treatment in 1999. In this calculator, the pitch-follow rate is the parameter that represents that behaviour:
              raise it and the javelin tracks its flight path closely and lands steeply; lower it and the shaft stays proud of the
              path, generating more lift but risking a flat, foul landing.
            </p>

            <h2 className="text-2xl font-bold mb-3">Wind, Altitude, and the Conditions That Help</h2>
            <p>
              Javelin is the rare throwing event where a headwind is usually welcome. Because lift scales with the square of
              airspeed, throwing into a two-to-four metre-per-second breeze raises the air-relative velocity over the implement
              and buys extra lift that more than offsets the additional drag. Many personal bests are set into the wind, and
              unlike sprints and horizontal jumps there is no legal wind limit in javelin, so a wind-aided throw still counts for
              records.
            </p>
            <p>
              Altitude is more subtle. Thin air reduces drag, which helps a shot put or a discus unambiguously. But thin air also
              reduces lift, and for an implement that depends on lift to stay aloft, that loss can outweigh the drag saving. Enter
              an altitude in the advanced panel and compare the net aerodynamic effect figure at sea level and at 2,000 metres to
              see which side wins for your particular release parameters. The honest answer is that it depends on the angle of
              attack: lift-heavy throws lose at altitude, flatter and faster throws gain.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/javelin-throw-distance-calculator" />
          <PopularCalculators exclude="/calculator/javelin-throw-distance-calculator" />
        </div>
      </div>
    </>
  );
};

export default JavelinThrowDistanceCalculator;
