"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

type SpeedUnit = "mph" | "kmh";
type TireMode = "diameter" | "sidewall";

interface RpmInputs {
  engineRpm: string;
  gearRatio: string;
  finalDrive: string;
  tireDiameter: string;
  speedUnit: SpeedUnit;
  advanced: boolean;
  tireMode: TireMode;
  sectionWidth: string;
  aspectRatio: string;
  rimDiameter: string;
  tireGrowthPct: string;
  proMode: boolean;
  redlineRpm: string;
  topGearRatio: string;
  cruiseSpeed: string;
}

interface GearRow {
  label: string;
  ratio: number;
  speedAtRpm: number;
  speedAtRedline: number;
}

interface ChartPoint {
  rpm: number;
  Speed: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
}

interface RpmResult {
  speed: number;
  speedMph: number;
  speedKmh: number;
  wheelRpm: number;
  effectiveDiameter: number;
  rolloutInches: number;
  overallRatio: number;
  mphPer1000: number;
  chartData: ChartPoint[];
  gearRows: GearRow[];
  redlineSpeed: number;
  cruiseRpm: number;
  cruiseInBand: "low" | "ideal" | "high";
  unitLabel: string;
  isError: boolean;
  errorMsg?: string;
}

const num = (s: string): number => {
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

// Wheel revolutions per minute -> MPH.
// Circumference (in) = PI * D. Inches/min -> miles/hour = x60 / 63360 = /1056.
const INCHES_PER_MIN_TO_MPH = 1056;

const GEAR_SPREAD: { label: string; mult: number }[] = [
  { label: "1st", mult: 1 },
  { label: "2nd", mult: 0.58 },
  { label: "3rd", mult: 0.38 },
  { label: "4th", mult: 0.28 },
  { label: "5th", mult: 0.22 },
  { label: "6th", mult: 0.18 },
];

const calculate = (inputs: RpmInputs): RpmResult => {
  const empty: RpmResult = {
    speed: 0,
    speedMph: 0,
    speedKmh: 0,
    wheelRpm: 0,
    effectiveDiameter: 0,
    rolloutInches: 0,
    overallRatio: 0,
    mphPer1000: 0,
    chartData: [],
    gearRows: [],
    redlineSpeed: 0,
    cruiseRpm: 0,
    cruiseInBand: "ideal",
    unitLabel: inputs.speedUnit === "mph" ? "MPH" : "km/h",
    isError: true,
  };

  const engineRpm = num(inputs.engineRpm);
  const gearRatio = num(inputs.gearRatio);
  const finalDrive = num(inputs.finalDrive);

  if (engineRpm <= 0) return { ...empty, errorMsg: "Engine RPM must be greater than zero." };
  if (gearRatio <= 0) return { ...empty, errorMsg: "Gear ratio must be greater than zero." };
  if (finalDrive <= 0) return { ...empty, errorMsg: "Final drive ratio must be greater than zero." };

  // Effective rolling diameter, either entered directly or derived from sidewall spec.
  let baseDiameter: number;
  if (inputs.advanced && inputs.tireMode === "sidewall") {
    const width = num(inputs.sectionWidth);
    const aspect = num(inputs.aspectRatio);
    const rim = num(inputs.rimDiameter);
    if (width <= 0 || aspect <= 0 || rim <= 0) {
      return { ...empty, errorMsg: "Enter a valid tire size, for example 225 / 45 R17." };
    }
    // Sidewall height in mm both top and bottom, converted to inches.
    baseDiameter = rim + (2 * width * (aspect / 100)) / 25.4;
  } else {
    baseDiameter = num(inputs.tireDiameter);
    if (baseDiameter <= 0) return { ...empty, errorMsg: "Tire diameter must be greater than zero." };
  }

  const growth = inputs.advanced ? Math.max(0, num(inputs.tireGrowthPct)) : 0;
  const effectiveDiameter = baseDiameter * (1 + growth / 100);

  const overallRatio = gearRatio * finalDrive;
  const wheelRpm = engineRpm / overallRatio;
  const speedMph = (wheelRpm * effectiveDiameter * Math.PI) / INCHES_PER_MIN_TO_MPH;
  const speedKmh = speedMph * 1.609344;
  const isMph = inputs.speedUnit === "mph";
  const speed = isMph ? speedMph : speedKmh;
  const unitLabel = isMph ? "MPH" : "km/h";

  const rolloutInches = Math.PI * effectiveDiameter;
  const mphPer1000 = (1000 / overallRatio) * rolloutInches / INCHES_PER_MIN_TO_MPH * (isMph ? 1 : 1.609344);

  const chartData: ChartPoint[] = [];
  for (let rpm = 1000; rpm <= 7000; rpm += 500) {
    const wr = rpm / overallRatio;
    const mph = (wr * effectiveDiameter * Math.PI) / INCHES_PER_MIN_TO_MPH;
    chartData.push({ rpm, Speed: parseFloat((isMph ? mph : mph * 1.609344).toFixed(1)) });
  }

  const redlineRpm = inputs.proMode ? Math.max(0, num(inputs.redlineRpm)) : 0;
  const redlineSpeed =
    redlineRpm > 0
      ? ((redlineRpm / overallRatio) * effectiveDiameter * Math.PI) / INCHES_PER_MIN_TO_MPH * (isMph ? 1 : 1.609344)
      : 0;

  const gearRows: GearRow[] = [];
  if (inputs.proMode) {
    for (const g of GEAR_SPREAD) {
      const ratio = gearRatio * g.mult;
      const oa = ratio * finalDrive;
      const sAtRpm = ((engineRpm / oa) * effectiveDiameter * Math.PI) / INCHES_PER_MIN_TO_MPH;
      const sAtRed =
        redlineRpm > 0
          ? ((redlineRpm / oa) * effectiveDiameter * Math.PI) / INCHES_PER_MIN_TO_MPH
          : 0;
      gearRows.push({
        label: g.label,
        ratio: parseFloat(ratio.toFixed(3)),
        speedAtRpm: parseFloat((isMph ? sAtRpm : sAtRpm * 1.609344).toFixed(1)),
        speedAtRedline: parseFloat((isMph ? sAtRed : sAtRed * 1.609344).toFixed(1)),
      });
    }
  }

  // Cruise RPM: what the engine turns at a given road speed in the tallest gear.
  const topGear = inputs.proMode ? Math.max(0.001, num(inputs.topGearRatio) || 0.001) : 0;
  const cruiseSpeedInput = inputs.proMode ? Math.max(0, num(inputs.cruiseSpeed)) : 0;
  const cruiseMph = isMph ? cruiseSpeedInput : cruiseSpeedInput / 1.609344;
  const cruiseRpm =
    topGear > 0 && cruiseMph > 0
      ? (cruiseMph * INCHES_PER_MIN_TO_MPH * topGear * finalDrive) / (effectiveDiameter * Math.PI)
      : 0;

  const cruiseInBand: "low" | "ideal" | "high" =
    cruiseRpm === 0 ? "ideal" : cruiseRpm < 1600 ? "low" : cruiseRpm > 3000 ? "high" : "ideal";

  return {
    speed: parseFloat(speed.toFixed(1)),
    speedMph: parseFloat(speedMph.toFixed(1)),
    speedKmh: parseFloat(speedKmh.toFixed(1)),
    wheelRpm: parseFloat(wheelRpm.toFixed(1)),
    effectiveDiameter: parseFloat(effectiveDiameter.toFixed(2)),
    rolloutInches: parseFloat(rolloutInches.toFixed(2)),
    overallRatio: parseFloat(overallRatio.toFixed(3)),
    mphPer1000: parseFloat(mphPer1000.toFixed(1)),
    chartData,
    gearRows,
    redlineSpeed: parseFloat(redlineSpeed.toFixed(1)),
    cruiseRpm: Math.round(cruiseRpm),
    cruiseInBand,
    unitLabel,
    isError: false,
  };
};

const DEFAULTS: RpmInputs = {
  engineRpm: "3000",
  gearRatio: "1.00",
  finalDrive: "3.73",
  tireDiameter: "26",
  speedUnit: "mph",
  advanced: false,
  tireMode: "diameter",
  sectionWidth: "225",
  aspectRatio: "45",
  rimDiameter: "17",
  tireGrowthPct: "0",
  proMode: false,
  redlineRpm: "6500",
  topGearRatio: "0.72",
  cruiseSpeed: "70",
};

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "How do you convert engine RPM to MPH?",
    answer:
      "Divide engine RPM by the overall drive ratio to get wheel RPM, then multiply wheel RPM by the tire circumference to get distance per minute, and convert to your speed unit. In practice the formula is speed in MPH equals wheel RPM times tire diameter in inches times pi, divided by 1056. That constant comes from converting inches per minute into miles per hour: sixty minutes in an hour divided by 63,360 inches in a mile. The overall drive ratio is simply the transmission gear ratio multiplied by the final drive or differential ratio.",
  },
  {
    question: "What is the difference between gear ratio and final drive?",
    answer:
      "The gear ratio is the reduction inside the transmission for the gear you are currently in, and it changes every time you shift. First gear might be 3.5 to 1 while sixth gear is often an overdrive ratio below 1.0, such as 0.72 to 1. The final drive, sometimes called the differential or axle ratio, is a single fixed reduction between the driveshaft and the wheels, commonly somewhere between 2.7 and 4.5 to 1. Multiply the two together and you get the overall ratio, which is the number that actually determines road speed for a given engine speed.",
  },
  {
    question: "Should I use the tire diameter or the sidewall markings?",
    answer:
      "Use whichever you have, since both are supported. If you know the overall diameter in inches, enter it directly. If you only have the sidewall code such as 225/45R17, switch to sidewall mode and enter the three numbers: 225 is the section width in millimetres, 45 is the aspect ratio meaning the sidewall height is 45 percent of that width, and 17 is the rim diameter in inches. The calculator converts the sidewall height to inches and adds it twice, once for the top of the tire and once for the bottom, then adds the rim.",
  },
  {
    question: "Why is my speedometer reading different from the calculation?",
    answer:
      "Several reasons, and they usually stack in the same direction. Manufacturers deliberately calibrate speedometers to read slightly high, typically two to five percent, because regulations in most markets permit over-reading but never under-reading. Tire wear also matters: a worn tire has a smaller rolling diameter than a new one, which makes you travel slower than the calculation suggests. Tire pressure changes the rolling radius slightly. And if the previous owner fitted a different tire size or changed the differential, the speedometer calibration no longer matches the hardware at all.",
  },
  {
    question: "What is tire growth and when does it matter?",
    answer:
      "At high rotational speeds centrifugal force stretches a tire outward, increasing its effective diameter. On a street car at legal speeds the effect is negligible, well under one percent. It becomes significant in drag racing, where soft-sidewall slicks can grow several percent at the top end of a run, and in high-speed testing. The growth field in Advanced Options lets you model this. For ordinary road use leave it at zero.",
  },
  {
    question: "What does MPH per 1000 RPM tell me?",
    answer:
      "It is the single most useful number for comparing gearing setups, because it expresses the entire drivetrain as one figure independent of the RPM you happen to be at. If your car does 22 MPH per 1000 RPM in top gear, then 70 MPH cruising puts the engine at roughly 3,180 RPM. Enthusiasts use this to decide whether a differential change is worthwhile. Lower numbers mean shorter, more accelerative gearing with higher cruising RPM; higher numbers mean taller gearing with relaxed, more economical cruising but slower acceleration.",
  },
  {
    question: "How do I choose a differential ratio?",
    answer:
      "It is a trade-off between acceleration and cruising RPM, and the right answer depends on how the car is used. A numerically higher ratio such as 4.10 multiplies engine torque more, improving acceleration and making the car feel livelier, at the cost of higher RPM and worse fuel economy at highway speed. A numerically lower ratio such as 3.08 does the opposite. A useful method is to decide what RPM you want at your normal cruising speed in top gear, then work backwards using the professional mode cruise calculation to find the ratio that delivers it.",
  },
  {
    question: "Does drivetrain loss affect the speed calculation?",
    answer:
      "No, and this is a common misunderstanding. Drivetrain loss describes power lost to friction and heat between the crankshaft and the wheels, typically ten to twenty percent. It reduces how much thrust reaches the road, which affects how quickly the car accelerates and what top speed it can ultimately reach against aerodynamic drag. It does not change the geometric relationship between engine speed and wheel speed, because that is fixed entirely by the gear ratios and the tire circumference. A slipping torque converter or clutch would change it, but a healthy locked-up drivetrain does not.",
  },
];

export default function EngineRpmToMphCalculator() {
  const [inputs, setInputs] = useState<RpmInputs>(DEFAULTS);
  const [result, setResult] = useState<RpmResult>(calculate(DEFAULTS));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculate(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof RpmInputs>(key: K, val: RpmInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const u = result.unitLabel;

  const tableRows: TableRow[] = [
    { rowId: "gear", label: "Transmission gear ratio", value: `${num(inputs.gearRatio).toFixed(2)} : 1` },
    { rowId: "final", label: "Final drive ratio", value: `${num(inputs.finalDrive).toFixed(2)} : 1` },
    { rowId: "overall", label: "Overall drive ratio", value: `${result.overallRatio} : 1`, key: true },
    { rowId: "dia", label: "Effective tire diameter", value: `${result.effectiveDiameter} in` },
    { rowId: "roll", label: "Tire circumference (rollout)", value: `${result.rolloutInches} in` },
    { rowId: "erpm", label: "Engine speed", value: `${num(inputs.engineRpm).toLocaleString()} RPM` },
    { rowId: "wrpm", label: "Wheel speed", value: `${result.wheelRpm.toLocaleString()} RPM` },
    { rowId: "per1000", label: `${u} per 1000 RPM`, value: `${result.mphPer1000} ${u}` },
    { rowId: "mph", label: "Speed in MPH", value: `${result.speedMph} MPH` },
    { rowId: "kmh", label: "Speed in km/h", value: `${result.speedKmh} km/h` },
    ...(inputs.proMode && result.redlineSpeed > 0
      ? [{ rowId: "red", label: `Speed at ${num(inputs.redlineRpm).toLocaleString()} RPM redline`, value: `${result.redlineSpeed} ${u}` }]
      : []),
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Transportation", href: "/category/transportation" },
          { label: "Engine RPM to MPH Calculator" },
        ]}
      />

      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Engine RPM to MPH Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ---------------- INPUTS ---------------- */}
          <div className="card-calculator !p-5">
            <div className="space-y-4">
              <div>
                <label className={lbl} htmlFor="engineRpm">
                  Engine speed (RPM)
                </label>
                <input
                  id="engineRpm"
                  type="number"
                  className={inp}
                  value={inputs.engineRpm}
                  onChange={(e) => set("engineRpm", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="gearRatio">
                  Transmission gear ratio
                </label>
                <input
                  id="gearRatio"
                  type="number"
                  step="0.01"
                  className={inp}
                  value={inputs.gearRatio}
                  onChange={(e) => set("gearRatio", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use 1.00 for a direct-drive gear, or below 1.00 for an overdrive gear.
                </p>
              </div>

              <div>
                <label className={lbl} htmlFor="finalDrive">
                  Final drive (differential) ratio
                </label>
                <input
                  id="finalDrive"
                  type="number"
                  step="0.01"
                  className={inp}
                  value={inputs.finalDrive}
                  onChange={(e) => set("finalDrive", e.target.value)}
                />
              </div>

              <div>
                <label className={lbl} htmlFor="tireDiameter">
                  Tire diameter (inches)
                </label>
                <input
                  id="tireDiameter"
                  type="number"
                  step="0.1"
                  className={inp}
                  value={inputs.tireDiameter}
                  onChange={(e) => set("tireDiameter", e.target.value)}
                  disabled={inputs.advanced && inputs.tireMode === "sidewall"}
                />
                {inputs.advanced && inputs.tireMode === "sidewall" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Being derived from the tire size below.
                  </p>
                )}
              </div>

              {/* -------- TIER 2A -------- */}
              <button
                type="button"
                onClick={() => set("advanced", !inputs.advanced)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {inputs.advanced ? "− Hide" : "+ Show"} Advanced Options
              </button>

              {inputs.advanced && (
                <div className="space-y-4 border-l-2 border-border pl-4">
                  <div>
                    <div className={groupLabel}>Units</div>
                    <label className={lbl} htmlFor="speedUnit">
                      Speed unit
                    </label>
                    <select
                      id="speedUnit"
                      className={inp}
                      value={inputs.speedUnit}
                      onChange={(e) => set("speedUnit", e.target.value as SpeedUnit)}
                    >
                      <option value="mph">Miles per hour</option>
                      <option value="kmh">Kilometres per hour</option>
                    </select>
                  </div>

                  <div>
                    <div className={groupLabel}>Tire Specification</div>
                    <div className="space-y-3">
                      <div>
                        <label className={lbl} htmlFor="tireMode">
                          Enter tire as
                        </label>
                        <select
                          id="tireMode"
                          className={inp}
                          value={inputs.tireMode}
                          onChange={(e) => set("tireMode", e.target.value as TireMode)}
                        >
                          <option value="diameter">Overall diameter in inches</option>
                          <option value="sidewall">Sidewall code (225/45R17)</option>
                        </select>
                      </div>

                      {inputs.tireMode === "sidewall" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block" htmlFor="sectionWidth">
                              Width (mm)
                            </label>
                            <input
                              id="sectionWidth"
                              type="number"
                              className={inp}
                              value={inputs.sectionWidth}
                              onChange={(e) => set("sectionWidth", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block" htmlFor="aspectRatio">
                              Aspect
                            </label>
                            <input
                              id="aspectRatio"
                              type="number"
                              className={inp}
                              value={inputs.aspectRatio}
                              onChange={(e) => set("aspectRatio", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block" htmlFor="rimDiameter">
                              Rim (in)
                            </label>
                            <input
                              id="rimDiameter"
                              type="number"
                              className={inp}
                              value={inputs.rimDiameter}
                              onChange={(e) => set("rimDiameter", e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className={lbl} htmlFor="tireGrowthPct">
                          Tire growth at speed (%)
                        </label>
                        <input
                          id="tireGrowthPct"
                          type="number"
                          step="0.1"
                          className={inp}
                          value={inputs.tireGrowthPct}
                          onChange={(e) => set("tireGrowthPct", e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave at 0 for street use. Drag slicks can grow several percent.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* -------- TIER 2B -------- */}
                  <div>
                    <div className={groupLabel}>Professional Mode</div>
                    <label className="flex items-center gap-2 text-sm text-foreground mb-3">
                      <input
                        type="checkbox"
                        checked={inputs.proMode}
                        onChange={(e) => set("proMode", e.target.checked)}
                        className="h-4 w-4"
                      />
                      Enable gear ladder and cruise RPM analysis
                    </label>

                    {inputs.proMode && (
                      <div className="space-y-3">
                        <div>
                          <label className={lbl} htmlFor="redlineRpm">
                            Redline (RPM)
                          </label>
                          <input
                            id="redlineRpm"
                            type="number"
                            className={inp}
                            value={inputs.redlineRpm}
                            onChange={(e) => set("redlineRpm", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="topGearRatio">
                            Top gear ratio
                          </label>
                          <input
                            id="topGearRatio"
                            type="number"
                            step="0.01"
                            className={inp}
                            value={inputs.topGearRatio}
                            onChange={(e) => set("topGearRatio", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={lbl} htmlFor="cruiseSpeed">
                            Cruising speed ({u})
                          </label>
                          <input
                            id="cruiseSpeed"
                            type="number"
                            className={inp}
                            value={inputs.cruiseSpeed}
                            onChange={(e) => set("cruiseSpeed", e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResult(calculate(inputs))}
                  className="h-10 w-full rounded-md bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
                >
                  Calculate
                </button>
                <button
                  type="button"
                  aria-label="Reset"
                  title="Reset"
                  onClick={() => {
                    setInputs(DEFAULTS);
                    setResult(calculate(DEFAULTS));
                  }}
                  className="h-10 w-10 shrink-0 rounded-md border border-input bg-background text-foreground hover:bg-muted/50 transition flex items-center justify-center"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- RESULTS ---------------- */}
          <div className="flex flex-col gap-5">
            {result.isError ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Error</div>
                <div className="text-base font-medium text-foreground">{result.errorMsg}</div>
              </div>
            ) : (
              <>
                {/* 1. PRIMARY */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Road speed at {num(inputs.engineRpm).toLocaleString()} RPM
                  </div>
                  <div className="text-4xl font-bold text-primary">
                    {result.speed} {u}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Overall ratio {result.overallRatio} : 1 on a {result.effectiveDiameter} inch tire
                  </div>
                </div>

                {/* 2. STAT BAR */}
                <div className="flex items-stretch bg-muted/30 rounded-lg divide-x divide-border">
                  <div className="flex-1 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Wheel RPM</div>
                    <div className="text-lg font-bold text-green-600">{result.wheelRpm.toLocaleString()}</div>
                  </div>
                  <div className="flex-1 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{u} per 1000 RPM</div>
                    <div className="text-lg font-bold text-orange-500">{result.mphPer1000}</div>
                  </div>
                  <div className="flex-1 p-4 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Overall ratio</div>
                    <div className="text-lg font-bold text-red-500">{result.overallRatio}</div>
                  </div>
                </div>

                {/* 3. BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 overflow-hidden">
                  <div className="px-5 pt-4 pb-2 text-sm font-bold text-foreground">Drivetrain Breakdown</div>
                  <table className="w-full text-base">
                    <tbody>
                      {tableRows.map((r) => (
                        <tr
                          key={r.rowId}
                          className={`border-t border-border ${r.key ? "bg-secondary/20 font-semibold" : ""}`}
                        >
                          <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                          <td className="py-2.5 px-3 text-right text-foreground">{r.value}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border font-bold">
                        <td className="py-2.5 px-3 text-foreground">Road speed</td>
                        <td className="py-2.5 px-3 text-right text-foreground">
                          {result.speed} {u}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. CHART */}
                <div className="card-calculator !p-4">
                  <div className="text-sm font-bold text-foreground mb-3">Speed Across the RPM Range</div>
                  <div style={{ height: 250 }}>
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 85%)" />
                          <XAxis
                            dataKey="rpm"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v: number) => `${v / 1000}k`}
                          />
                          <YAxis tick={{ fontSize: 12 }} unit={` ${u}`} />
                          <RTooltip
                            formatter={(v: number) => [`${v} ${u}`, "Speed"]}
                            labelFormatter={(l) => `${Number(l).toLocaleString()} RPM`}
                          />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                          <ReferenceLine
                            x={num(inputs.engineRpm)}
                            stroke="hsl(25 95% 53%)"
                            strokeDasharray="4 4"
                            label={{ value: "Current", fontSize: 11, position: "insideTopRight" }}
                          />
                          {inputs.proMode && num(inputs.redlineRpm) > 0 && (
                            <ReferenceLine
                              x={num(inputs.redlineRpm)}
                              stroke="hsl(0 84% 60%)"
                              strokeDasharray="4 4"
                              label={{ value: "Redline", fontSize: 11, position: "insideTopLeft" }}
                            />
                          )}
                          <Line
                            type="monotone"
                            dataKey="Speed"
                            name={`Speed (${u})`}
                            stroke="hsl(217 91% 60%)"
                            strokeWidth={3}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    Speed rises linearly with engine RPM in a fixed gear, because the ratio and tire size do not
                    change.
                  </div>
                </div>

                {/* PRO MODE */}
                {inputs.proMode && (
                  <>
                    <div className="card-calculator !p-0 overflow-hidden">
                      <div className="px-5 pt-4 pb-2 text-sm font-bold text-foreground">
                        Estimated Gear Ladder
                      </div>
                      <table className="w-full text-base">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                            <th className="py-2 px-3 text-left font-semibold">Gear</th>
                            <th className="py-2 px-3 text-right font-semibold">Ratio</th>
                            <th className="py-2 px-3 text-right font-semibold">At {num(inputs.engineRpm).toLocaleString()} RPM</th>
                            <th className="py-2 px-3 text-right font-semibold">At redline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.gearRows.map((g) => (
                            <tr key={g.label} className="border-t border-border">
                              <td className="py-2.5 px-3 text-foreground">{g.label}</td>
                              <td className="py-2.5 px-3 text-right text-muted-foreground">{g.ratio}</td>
                              <td className="py-2.5 px-3 text-right text-foreground">
                                {g.speedAtRpm} {u}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                                {g.speedAtRedline > 0 ? `${g.speedAtRedline} ${u}` : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p className="text-xs text-muted-foreground px-5 py-3">
                        Gear ladder uses a typical six-speed ratio spread applied to your entered first gear. Enter
                        your actual per-gear ratios one at a time for exact figures.
                      </p>
                    </div>

                    <div
                      className={`card-calculator !p-5 border-l-4 ${
                        result.cruiseInBand === "ideal"
                          ? "border-green-500"
                          : result.cruiseInBand === "low"
                          ? "border-orange-500"
                          : "border-red-500"
                      }`}
                    >
                      <div className="text-sm font-bold text-foreground mb-3">Cruise RPM in Top Gear</div>
                      <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-base">
                        <span className="text-muted-foreground">Cruising speed</span>
                        <span className="text-right text-foreground">
                          {num(inputs.cruiseSpeed)} {u}
                        </span>
                        <span className="text-muted-foreground">Top gear ratio</span>
                        <span className="text-right text-foreground">{num(inputs.topGearRatio).toFixed(2)} : 1</span>
                        <span className="font-semibold text-foreground">Engine speed at cruise</span>
                        <span
                          className={`text-right font-semibold ${
                            result.cruiseInBand === "ideal"
                              ? "text-green-600"
                              : result.cruiseInBand === "low"
                              ? "text-orange-500"
                              : "text-red-500"
                          }`}
                        >
                          {result.cruiseRpm.toLocaleString()} RPM
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {result.cruiseInBand === "ideal"
                          ? "This sits in the relaxed, economical band most manufacturers target for highway cruising."
                          : result.cruiseInBand === "low"
                          ? "Below about 1600 RPM the engine may lug and need a downshift for any gradient or overtake."
                          : "Above about 3000 RPM cruising, fuel consumption and noise rise noticeably. Taller gearing would help."}
                      </p>
                    </div>
                  </>
                )}

                {/* 5. SUMMARY STATISTICS */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className="text-sm font-bold text-foreground mb-3">Summary Statistics</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                    {tableRows.map((r) => (
                      <div key={r.rowId} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="text-foreground font-medium">{r.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 sm:col-span-2 border-t border-border pt-2 mt-1">
                      <span className="font-bold text-foreground">Road speed</span>
                      <span className="font-bold text-foreground">
                        {result.speed} {u}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ---------------- SEO ---------------- */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <div className="prose-finance text-[15.75px] space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">The Formula Behind RPM and Road Speed</h2>
              <p>
                Converting engine speed to road speed is pure geometry once you know the drivetrain. The engine turns
                the input shaft of the transmission, which reduces that speed by the gear ratio. The output passes
                through the final drive, which reduces it again. What arrives at the wheels is engine RPM divided by
                the product of those two ratios, and that product is what this calculator calls the overall ratio.
              </p>
              <p>
                Once you know how many times per minute the wheel turns, road speed follows from the circumference of
                the tire. Every revolution carries the car forward by one circumference, which is pi times the
                diameter. Multiply wheel RPM by that circumference and you have inches travelled per minute. Dividing
                by 1056 converts to miles per hour, a constant that comes from the sixty minutes in an hour divided by
                the 63,360 inches in a mile.
              </p>
              <p>
                Notice that horsepower, torque and drivetrain efficiency appear nowhere in this calculation. They
                determine whether the engine can reach a given RPM against the resistance of drag and grade, and how
                quickly it gets there, but they do not affect the fixed mechanical relationship between engine speed
                and wheel speed. That relationship is set entirely by ratios and tire size.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Reading Tire Sizes Correctly</h2>
              <p>
                The sidewall code on a modern tire mixes three different unit systems, which is why it confuses so
                many people. In the designation 225/45R17, the 225 is the section width in millimetres, the 45 is the
                aspect ratio expressing sidewall height as a percentage of that width, the R denotes radial
                construction, and the 17 is the rim diameter in inches.
              </p>
              <p>
                To get overall diameter, compute the sidewall height as 45 percent of 225 millimetres, which is about
                101 millimetres or roughly 4 inches. That height appears twice in the overall diameter, once above the
                rim and once below, so the total is 17 plus about 8, giving approximately 25 inches. The calculator
                performs this conversion when you switch to sidewall mode, which removes a step where errors commonly
                creep in.
              </p>
              <p>
                Getting this right matters more than it appears. A one inch error in overall diameter on a 26 inch
                tire is nearly a four percent error in every speed figure the calculator produces, which is larger
                than the deliberate optimism built into most factory speedometers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Why Gearing Changes Feel the Way They Do</h2>
              <p>
                The figure most useful for comparing setups is speed per thousand RPM, because it collapses the whole
                drivetrain into one number. A car geared at 22 MPH per 1000 RPM in top gear will turn roughly 3,180
                RPM at 70 MPH. Fit a numerically higher differential ratio and that figure drops, meaning more engine
                revolutions for the same road speed.
              </p>
              <p>
                Numerically higher ratios multiply engine torque more at the wheels, so the car accelerates harder and
                feels more responsive, but it cruises at higher RPM with more noise and worse fuel consumption. Lower
                ratios do the reverse, delivering a relaxed and economical highway gait at the cost of acceleration
                and the need to downshift more often. Changing tire diameter has exactly the same effect as changing
                the final drive, which is why fitting substantially larger wheels makes a car feel sluggish and throws
                the speedometer off at the same time.
              </p>
              <p>
                Professional Mode approaches this from the practical direction. Decide what engine speed you want at
                your normal cruising pace, enter your top gear ratio and target speed, and the calculator tells you
                what the drivetrain actually delivers so you can judge whether a ratio change is worth the cost.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-3">Why the Speedometer Disagrees</h2>
              <p>
                Calculated speed and indicated speed rarely match, and the discrepancies almost always run the same
                direction. Regulations in most markets allow a speedometer to over-read but never to under-read, so
                manufacturers build in a deliberate margin, commonly two to five percent. Your indicated 70 is often a
                true 67 or 68.
              </p>
              <p>
                Tire condition adds to the gap. A tire worn to the wear bars has a meaningfully smaller rolling
                diameter than a new one, sometimes half an inch or more, which means the car travels slightly slower
                than the geometry suggests while the odometer counts slightly more distance. Under-inflation has a
                similar though smaller effect. And any change to wheel diameter or differential ratio after the car
                left the factory invalidates the original calibration entirely, which is the usual reason a modified
                vehicle reads noticeably wrong.
              </p>
              <p>
                To check your own car, note the indicated speed while holding a steady RPM in a known gear, then
                compare it against the figure here using your measured tire diameter. A GPS speed readout gives an
                independent reference that is unaffected by tire wear, and comparing all three will tell you whether
                the difference lies in the calibration or in the hardware.
              </p>
            </section>
          </div>

          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/engine-rpm-to-mph-calculator" />
          <PopularCalculators exclude="/calculator/engine-rpm-to-mph-calculator" />
        </div>
      </div>
    </>
  );
}
