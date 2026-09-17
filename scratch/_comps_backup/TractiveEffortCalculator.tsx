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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type TractionType = "diesel" | "electric" | "steam";
type RailCondition = "dry-sanded" | "dry-clean" | "damp" | "wet" | "leaves" | "custom";

interface TractiveInputs {
  traction: TractionType;
  // Diesel / electric
  horsepower: number;
  // Steam geometry
  cylinderBore: number;      // in
  pistonStroke: number;      // in
  boilerPressure: number;    // psi
  driverDiameter: number;    // in
  cylinderCount: number;
  // Common
  driverWeightTons: number;  // short tons on driving wheels
  speedMph: number;
  // Tier 2A
  railCondition: RailCondition;
  customAdhesion: number;
  driveEfficiency: number;   // fraction, rail horsepower / gross horsepower
  meanEffectivePressure: number; // steam MEP factor
  // Tier 2B
  proMode: boolean;
  trainWeightTons: number;
  gradePercent: number;
  axleCount: number;
}

interface CurvePoint {
  speed: number;
  adhesion: number;
  mechanical: number;
  usable: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface TractiveResult {
  adhesionLimitLb: number;
  mechanicalLb: number;
  usableLb: number;
  limitedBy: "Adhesion" | "Power";
  adhesionCoefficient: number;
  transitionSpeedMph: number;
  railHorsepower: number;
  perAxleLb: number;
  starting: number;
  curve: CurvePoint[];
  // Pro
  grossWeightTons: number;
  rollingResistanceLb: number;
  gradeResistanceLb: number;
  totalResistanceLb: number;
  surplusLb: number;
  accelerationMphps: number;
  maxTrailingTons: number;
  balancingSpeedMph: number;
}

// 375 = (550 ft·lb/s per hp × 3600 s/h) ÷ 5280 ft/mile — converts hp and mph to pounds of force
const HP_MPH_TO_LB = 375;

const ADHESION: Record<Exclude<RailCondition, "custom">, { label: string; mu: number }> = {
  "dry-sanded": { label: "Dry rail, sanded", mu: 0.33 },
  "dry-clean": { label: "Dry rail, clean", mu: 0.25 },
  damp: { label: "Damp rail", mu: 0.2 },
  wet: { label: "Wet rail", mu: 0.15 },
  leaves: { label: "Leaf fall / oil contamination", mu: 0.08 },
};

const RAIL_OPTIONS: { key: RailCondition; label: string }[] = [
  { key: "dry-sanded", label: "Dry rail, sanded (μ 0.33)" },
  { key: "dry-clean", label: "Dry rail, clean (μ 0.25)" },
  { key: "damp", label: "Damp rail (μ 0.20)" },
  { key: "wet", label: "Wet rail (μ 0.15)" },
  { key: "leaves", label: "Leaf fall / contamination (μ 0.08)" },
  { key: "custom", label: "Custom coefficient" },
];

const muFor = (inputs: TractiveInputs): number =>
  inputs.railCondition === "custom"
    ? Math.max(0.01, inputs.customAdhesion)
    : ADHESION[inputs.railCondition].mu;

/** Steam tractive effort — the Whyte/AAR formula, force at the rail from cylinder work */
const steamTractiveEffort = (i: TractiveInputs): number => {
  const bore = Math.max(0.1, i.cylinderBore);
  const stroke = Math.max(0.1, i.pistonStroke);
  const driver = Math.max(1, i.driverDiameter);
  const cylinders = Math.max(1, i.cylinderCount);
  // Standard two-cylinder form is (d² × S × P × 0.85) / D; scale for cylinder count
  return (bore * bore * stroke * i.boilerPressure * i.meanEffectivePressure * (cylinders / 2)) / driver;
};

/** Davis equation for rolling resistance, lb per ton */
const davisResistancePerTon = (speedMph: number, weightPerAxleTons: number): number => {
  const v = Math.max(0, speedMph);
  const w = Math.max(1, weightPerAxleTons);
  // R = 1.3 + 29/w + 0.045V + 0.0005·A·V²/(w·n), simplified with a typical frontal-area term
  return 1.3 + 29 / w + 0.045 * v + (0.0005 * 100 * v * v) / (w * 4);
};

const calculateTractive = (inputs: TractiveInputs): TractiveResult => {
  const {
    traction, horsepower, driverWeightTons, speedMph, driveEfficiency,
    proMode, trainWeightTons, gradePercent, axleCount,
  } = inputs;

  const mu = muFor(inputs);
  const eff = Math.min(1, Math.max(0.01, driveEfficiency));

  // Adhesion ceiling: weight on drivers × coefficient of friction. 2000 lb per short ton.
  const adhesionLimitLb = Math.max(0, driverWeightTons) * 2000 * mu;

  const railHorsepower = horsepower * eff;

  // Mechanical ceiling at this speed
  let mechanicalLb: number;
  if (traction === "steam") {
    mechanicalLb = steamTractiveEffort(inputs);
  } else {
    mechanicalLb = speedMph > 0.1 ? (HP_MPH_TO_LB * railHorsepower) / speedMph : Infinity;
  }

  const usableLb = Math.min(adhesionLimitLb, mechanicalLb);
  const limitedBy = mechanicalLb < adhesionLimitLb ? "Power" : "Adhesion";

  // Speed at which power output falls below the adhesion ceiling
  const transitionSpeedMph =
    traction === "steam"
      ? 0
      : adhesionLimitLb > 0
        ? (HP_MPH_TO_LB * railHorsepower) / adhesionLimitLb
        : 0;

  const perAxleLb = axleCount > 0 ? usableLb / axleCount : usableLb;

  const curve: CurvePoint[] = [];
  for (let v = 1; v <= 80; v += 1) {
    const mech = traction === "steam" ? steamTractiveEffort(inputs) : (HP_MPH_TO_LB * railHorsepower) / v;
    curve.push({
      speed: v,
      adhesion: Math.round(adhesionLimitLb),
      mechanical: Math.round(Math.min(mech, adhesionLimitLb * 3)),
      usable: Math.round(Math.min(adhesionLimitLb, mech)),
    });
  }

  // Tier 2B — resistance and what the locomotive can actually move
  const grossWeightTons = proMode ? driverWeightTons + Math.max(0, trainWeightTons) : driverWeightTons;
  const perAxleTons = axleCount > 0 ? grossWeightTons / axleCount : grossWeightTons;
  const rollingResistanceLb = proMode ? davisResistancePerTon(speedMph, perAxleTons) * grossWeightTons : 0;
  // 20 lb per ton per 1% grade (sin θ ≈ grade/100, × 2000 lb/ton)
  const gradeResistanceLb = proMode ? grossWeightTons * 20 * gradePercent : 0;
  const totalResistanceLb = rollingResistanceLb + gradeResistanceLb;
  const surplusLb = usableLb - totalResistanceLb;

  // a = F/m, converted to mph per second (32.2 ft/s² per g, 2000 lb/ton)
  const accelerationMphps =
    proMode && grossWeightTons > 0 ? (surplusLb / (grossWeightTons * 2000)) * 32.2 * 0.681818 : 0;

  // Largest trailing tonnage the locomotive can start and hold on this grade
  const resistancePerTrailingTon = proMode
    ? davisResistancePerTon(speedMph, Math.max(1, perAxleTons)) + 20 * gradePercent
    : 0;
  const locoSelfResistance = proMode
    ? driverWeightTons * (davisResistancePerTon(speedMph, Math.max(1, perAxleTons)) + 20 * gradePercent)
    : 0;
  const maxTrailingTons =
    proMode && resistancePerTrailingTon > 0
      ? Math.max(0, (usableLb - locoSelfResistance) / resistancePerTrailingTon)
      : 0;

  // Balancing speed: where mechanical effort equals total resistance on this grade
  let balancingSpeedMph = 0;
  if (proMode && traction !== "steam" && totalResistanceLb > 0) {
    for (let v = 1; v <= 120; v += 0.5) {
      const mech = Math.min(adhesionLimitLb, (HP_MPH_TO_LB * railHorsepower) / v);
      const res = davisResistancePerTon(v, Math.max(1, perAxleTons)) * grossWeightTons + gradeResistanceLb;
      if (mech <= res) {
        balancingSpeedMph = v;
        break;
      }
    }
  }

  return {
    adhesionLimitLb,
    mechanicalLb: isFinite(mechanicalLb) ? mechanicalLb : adhesionLimitLb,
    usableLb,
    limitedBy,
    adhesionCoefficient: mu,
    transitionSpeedMph,
    railHorsepower,
    perAxleLb,
    starting: adhesionLimitLb,
    curve,
    grossWeightTons,
    rollingResistanceLb,
    gradeResistanceLb,
    totalResistanceLb,
    surplusLb,
    accelerationMphps,
    maxTrailingTons,
    balancingSpeedMph,
  };
};

const DEFAULTS: TractiveInputs = {
  traction: "diesel",
  horsepower: 4400,
  cylinderBore: 26,
  pistonStroke: 32,
  boilerPressure: 300,
  driverDiameter: 80,
  cylinderCount: 2,
  driverWeightTons: 210,
  speedMph: 25,
  railCondition: "dry-sanded",
  customAdhesion: 0.3,
  driveEfficiency: 0.83,
  meanEffectivePressure: 0.85,
  proMode: false,
  trainWeightTons: 6000,
  gradePercent: 1,
  axleCount: 6,
};

const FAQS = [
  {
    question: "What is tractive effort?",
    answer:
      "Tractive effort is the pulling force a locomotive applies at the rail, measured in pounds or kilonewtons. It is not the same as horsepower. Power is the rate of doing work and stays roughly constant across the operating range; tractive effort is a force that falls as speed rises, because power equals force times velocity. A 4,400 hp locomotive produces about 66,000 lb of pull at 25 mph and only about 33,000 lb at 50 mph from the same power output.",
  },
  {
    question: "Why are there two different limits on tractive effort?",
    answer:
      "Because a locomotive can fail to pull for two entirely separate reasons. The adhesion limit is set by friction: weight on the driving wheels multiplied by the coefficient of friction between steel wheel and steel rail. Exceed it and the wheels spin regardless of available power. The mechanical limit is set by the engine: available power divided by speed. At low speed the adhesion limit is the binding constraint, at high speed the power limit takes over, and the usable tractive effort is always whichever is lower.",
  },
  {
    question: "What coefficient of adhesion should I use?",
    answer:
      "On clean dry rail, roughly 0.25 is the classic planning figure, rising to about 0.33 with sanding. Damp rail drops to about 0.20 and wet rail to about 0.15. Autumn leaf fall or oil contamination can take it as low as 0.08, which is why leaf-fall season causes so much operational disruption. Modern AC-traction locomotives with high-speed creep control can sustain 0.37 to 0.40 or better because they deliberately operate just past the peak of the friction curve where a DC machine would lose the wheelset entirely.",
  },
  {
    question: "How do I calculate steam locomotive tractive effort?",
    answer:
      "The standard Whyte formula is tractive effort equals cylinder bore squared, times piston stroke, times boiler pressure, times a mean effective pressure factor of 0.85, divided by driving wheel diameter — all dimensions in inches and pressure in psi. Because that expression contains no speed term, it gives a starting tractive effort only. A steam locomotive's real output falls away at speed as the valve gear becomes unable to fill the cylinders quickly enough, which is why large driving wheels suit express work and small ones suit freight.",
  },
  {
    question: "Why does the calculator show a transition speed?",
    answer:
      "The transition speed is where the two ceilings cross: below it the locomotive is adhesion-limited and cannot use all its power, above it the locomotive is power-limited and cannot reach its adhesion ceiling. It is the speed at which the machine is best matched to itself, and it is where continuous tractive effort ratings are usually quoted. A heavy freight unit typically transitions somewhere in the teens of mph; a passenger unit geared for speed transitions much higher.",
  },
  {
    question: "How much does grade affect what a locomotive can pull?",
    answer:
      "Enormously, and far more than most people expect. Grade resistance is about 20 pounds per ton for every 1 percent of gradient, which comes straight from resolving gravity along the slope. Rolling resistance on level track is only about 3 to 6 pounds per ton at moderate speed, so a single 1 percent grade adds roughly four times the entire level-track resistance. This is why ruling grade determines tonnage ratings on a railroad, and why helper locomotives exist on mountain districts.",
  },
  {
    question: "What is the Davis equation?",
    answer:
      "The Davis equation is the standard empirical formula for railway rolling resistance, developed by W. J. Davis in the 1920s and revised several times since. It sums a constant journal-bearing term, a term inversely proportional to axle load, a term proportional to speed, and an aerodynamic term proportional to speed squared. The speed-squared component is why resistance climbs steeply at high speed and why fuel consumption per ton-mile rises sharply above about 60 mph.",
  },
  {
    question: "Does this apply to road vehicles as well as locomotives?",
    answer:
      "The physics is identical, but the numbers are not. Rubber on asphalt has a coefficient of friction around 0.7 to 0.9 rather than the 0.25 or so of steel on steel, so road vehicles are almost never adhesion-limited in normal conditions. That relative disadvantage in adhesion is exactly the trade the railway makes: very low rolling resistance in exchange for very low available friction, which is why a train is extraordinarily efficient on the level and struggles badly on gradients a lorry would not notice.",
  },
];

const TractiveEffortCalculator = () => {
  const [inputs, setInputs] = useState<TractiveInputs>(DEFAULTS);
  const [result, setResult] = useState<TractiveResult>(calculateTractive(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateTractive(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof TractiveInputs>(key: K, val: TractiveInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const handleCalculate = () => setResult(calculateTractive(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateTractive(DEFAULTS));
    setShowAdvanced(false);
  };

  const isSteam = inputs.traction === "steam";
  const lb = (n: number) => Math.round(n).toLocaleString();
  const kn = (n: number) => (n * 0.00444822).toFixed(1);
  const fmt = (n: number, d = 2) =>
    n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const tableRows: TableRow[] = [
    { rowId: "weight", label: "Weight on driving wheels", value: `${inputs.driverWeightTons.toLocaleString()} tons (${lb(inputs.driverWeightTons * 2000)} lb)` },
    { rowId: "mu", label: `Coefficient of adhesion${inputs.railCondition === "custom" ? " (custom)" : ""}`, value: fmt(result.adhesionCoefficient, 2) },
    { rowId: "adhesion", label: "Adhesion limit (weight × μ)", value: `${lb(result.adhesionLimitLb)} lb` },
    ...(isSteam
      ? [
          { rowId: "cyl", label: `Cylinders — ${inputs.cylinderCount} × ${inputs.cylinderBore}" bore × ${inputs.pistonStroke}" stroke`, value: `${inputs.boilerPressure} psi` },
          { rowId: "drivers", label: "Driving wheel diameter", value: `${inputs.driverDiameter} in` },
          { rowId: "mech", label: "Cylinder tractive effort (Whyte formula)", value: `${lb(result.mechanicalLb)} lb` },
        ]
      : [
          { rowId: "hp", label: "Gross horsepower", value: `${inputs.horsepower.toLocaleString()} hp` },
          { rowId: "rhp", label: `Rail horsepower (${Math.round(inputs.driveEfficiency * 100)}% efficiency)`, value: `${lb(result.railHorsepower)} hp` },
          { rowId: "mech", label: `Power limit at ${inputs.speedMph} mph (375 × hp ÷ v)`, value: `${lb(result.mechanicalLb)} lb` },
        ]),
    { rowId: "usable", label: `Usable tractive effort at ${inputs.speedMph} mph`, value: `${lb(result.usableLb)} lb`, key: true },
    { rowId: "kn", label: "Usable tractive effort (metric)", value: `${kn(result.usableLb)} kN` },
    { rowId: "axle", label: `Per powered axle (${inputs.axleCount} axles)`, value: `${lb(result.perAxleLb)} lb` },
    ...(isSteam
      ? []
      : [{ rowId: "transition", label: "Transition speed (adhesion → power limited)", value: `${fmt(result.transitionSpeedMph, 1)} mph` }]),
    ...(inputs.proMode
      ? [
          { rowId: "rolling", label: `Rolling resistance (Davis, ${result.grossWeightTons.toLocaleString()} tons)`, value: `${lb(result.rollingResistanceLb)} lb` },
          { rowId: "grade", label: `Grade resistance (${inputs.gradePercent}% × 20 lb/ton)`, value: `${lb(result.gradeResistanceLb)} lb` },
          { rowId: "resistance", label: "Total train resistance", value: `${lb(result.totalResistanceLb)} lb` },
        ]
      : []),
    {
      rowId: "limit",
      label: "Binding constraint",
      value: `${result.limitedBy}-limited`,
      total: true,
    },
  ];

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
          { label: "Science", href: "/calculator#science" },
          { label: "Tractive Effort Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tractive Effort Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="flex flex-col">
              <label className={lbl}>Traction Type</label>
              <select
                value={inputs.traction}
                onChange={(e) => set("traction", e.target.value as TractionType)}
                className={sel}
              >
                <option value="diesel">Diesel-electric</option>
                <option value="electric">Electric</option>
                <option value="steam">Steam</option>
              </select>
            </div>

            {isSteam ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className={lbl}>Cylinder Bore</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.cylinderBore}
                        onChange={(e) => set("cylinderBore", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={1}
                        step={0.5}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">in</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className={lbl}>Piston Stroke</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.pistonStroke}
                        onChange={(e) => set("pistonStroke", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={1}
                        step={0.5}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">in</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className={lbl}>Boiler Pressure</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.boilerPressure}
                        onChange={(e) => set("boilerPressure", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={1}
                        step={5}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">psi</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className={lbl}>Driver Diameter</label>
                    <div className={wrap}>
                      <input
                        type="number"
                        value={inputs.driverDiameter}
                        onChange={(e) => set("driverDiameter", parseFloat(e.target.value) || 0)}
                        className={ci}
                        min={1}
                        step={1}
                      />
                      <span className="pr-3 text-sm text-muted-foreground select-none">in</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col">
                <label className={lbl}>Gross Horsepower</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.horsepower}
                    onChange={(e) => set("horsepower", parseFloat(e.target.value) || 0)}
                    className={ci}
                    min={1}
                    step={100}
                  />
                  <span className="pr-3 text-sm text-muted-foreground select-none">hp</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  A modern six-axle road unit is 4,000 to 4,400 hp; a heavy electric can exceed 6,000 hp.
                </p>
              </div>
            )}

            <div className="flex flex-col">
              <label className={lbl}>Weight on Driving Wheels</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.driverWeightTons}
                  onChange={(e) => set("driverWeightTons", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0}
                  step={5}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">tons</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Only weight carried on powered axles counts. Idler and tender axles contribute nothing to adhesion.
              </p>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Speed</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.speedMph}
                  onChange={(e) => set("speedMph", parseFloat(e.target.value) || 0)}
                  className={ci}
                  min={0.5}
                  step={1}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">mph</span>
              </div>
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
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Adhesion</div>
                  <div className="flex flex-col">
                    <label className={lbl}>Rail Condition</label>
                    <select
                      value={inputs.railCondition}
                      onChange={(e) => set("railCondition", e.target.value as RailCondition)}
                      className={sel}
                    >
                      {RAIL_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {inputs.railCondition === "custom" && (
                    <div className="flex flex-col mt-3">
                      <label className={lbl}>Custom Coefficient μ</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.customAdhesion}
                          onChange={(e) => set("customAdhesion", parseFloat(e.target.value) || 0)}
                          className={ci}
                          min={0.01}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Modern AC creep control sustains 0.37 to 0.40 on dry sanded rail.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Powered Axles</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.axleCount}
                          onChange={(e) => set("axleCount", parseInt(e.target.value, 10) || 1)}
                          className={ci}
                          min={1}
                          step={1}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>{isSteam ? "MEP Factor" : "Drive Efficiency"}</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={isSteam ? inputs.meanEffectivePressure : inputs.driveEfficiency}
                          onChange={(e) =>
                            isSteam
                              ? set("meanEffectivePressure", parseFloat(e.target.value) || 0)
                              : set("driveEfficiency", parseFloat(e.target.value) || 0)
                          }
                          className={ci}
                          min={0.01}
                          max={1}
                          step={0.01}
                        />
                      </div>
                    </div>
                  </div>
                  {isSteam && (
                    <div className="flex flex-col mt-3">
                      <label className={lbl}>Cylinder Count</label>
                      <div className={wrap}>
                        <input
                          type="number"
                          value={inputs.cylinderCount}
                          onChange={(e) => set("cylinderCount", parseInt(e.target.value, 10) || 2)}
                          className={ci}
                          min={1}
                          max={4}
                          step={1}
                        />
                      </div>
                    </div>
                  )}
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
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Adds Davis rolling resistance, grade resistance, haulable tonnage, and acceleration.
                  </p>
                  {inputs.proMode && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className={lbl}>Trailing Weight</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={inputs.trainWeightTons}
                            onChange={(e) => set("trainWeightTons", parseFloat(e.target.value) || 0)}
                            className={ci}
                            min={0}
                            step={100}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">tons</span>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className={lbl}>Ruling Grade</label>
                        <div className={wrap}>
                          <input
                            type="number"
                            value={inputs.gradePercent}
                            onChange={(e) => set("gradePercent", parseFloat(e.target.value) || 0)}
                            className={ci}
                            step={0.1}
                          />
                          <span className="pr-3 text-sm text-muted-foreground select-none">%</span>
                        </div>
                      </div>
                    </div>
                  )}
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
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                Usable Tractive Effort at {inputs.speedMph} mph
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">{lb(result.usableLb)}</div>
                <div className="text-lg font-semibold text-muted-foreground">lb ({kn(result.usableLb)} kN)</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                <span className="font-semibold" style={{ color: result.limitedBy === "Adhesion" ? "hsl(25 95% 53%)" : "hsl(217 91% 60%)" }}>
                  {result.limitedBy}-limited
                </span>{" "}
                &middot; adhesion ceiling {lb(result.adhesionLimitLb)} lb &middot; {isSteam ? "cylinder output" : "power limit"}{" "}
                {lb(result.mechanicalLb)} lb
              </div>
            </div>

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Adhesion Limit</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{lb(result.adhesionLimitLb)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">lb at μ {fmt(result.adhesionCoefficient, 2)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
                  {isSteam ? "Cylinder Effort" : "Power Limit"}
                </div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>{lb(result.mechanicalLb)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">lb at {inputs.speedMph} mph</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Usable</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>{lb(result.usableLb)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">lower of the two</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Tractive Effort Breakdown</h3>
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
              <h3 className="text-base font-bold text-foreground mb-1">Tractive Effort Against Speed</h3>
              <p className="text-xs text-muted-foreground mb-3">
                The flat line is the adhesion ceiling, the falling curve is the {isSteam ? "cylinder" : "power"} limit. Usable effort
                is the lower of the two at every speed.
                {!isSteam && result.transitionSpeedMph > 0 && ` They cross at ${fmt(result.transitionSpeedMph, 1)} mph.`}
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={result.curve} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" />
                      <XAxis dataKey="speed" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" unit=" mph" />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="hsl(215 16% 65%)"
                        width={64}
                        tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                      />
                      <RTooltip
                        formatter={(v: number, name: string) => [`${lb(v)} lb`, name]}
                        labelFormatter={(l: number) => `${l} mph`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        x={inputs.speedMph}
                        stroke="hsl(0 84% 60%)"
                        strokeDasharray="4 4"
                        label={{ value: "your speed", fontSize: 10, position: "insideTopRight" }}
                      />
                      <Line type="monotone" dataKey="adhesion" name="Adhesion limit" stroke="hsl(25 95% 53%)" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                      <Line type="monotone" dataKey="mechanical" name={isSteam ? "Cylinder effort" : "Power limit"} stroke="hsl(217 91% 60%)" strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
                      <Line type="monotone" dataKey="usable" name="Usable effort" stroke="hsl(142 71% 45%)" strokeWidth={2.5} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* Pro mode */}
            {inputs.proMode && (
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold text-foreground mb-3">Train Performance</h3>
                <table className="w-full text-base border-collapse">
                  <tbody>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Gross weight (locomotive + train)</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{result.grossWeightTons.toLocaleString()} tons</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Surplus effort after resistance</td>
                      <td
                        className="py-2.5 px-3 text-right tabular-nums font-semibold"
                        style={{ color: result.surplusLb >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)" }}
                      >
                        {result.surplusLb >= 0 ? "+" : ""}{lb(result.surplusLb)} lb
                      </td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Acceleration available</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{fmt(result.accelerationMphps, 3)} mph/s</td>
                    </tr>
                    <tr className="border-b border-border/60">
                      <td className="py-2.5 px-3 text-muted-foreground">Maximum trailing tonnage on {inputs.gradePercent}% grade</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-foreground">{lb(result.maxTrailingTons)} tons</td>
                    </tr>
                    <tr className="border-t-2 border-t-border font-bold">
                      <td className="py-2.5 px-3 text-foreground">Balancing speed on this grade</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-primary">
                        {result.balancingSpeedMph > 0 ? `${fmt(result.balancingSpeedMph, 1)} mph` : isSteam ? "n/a for steam" : "above 120 mph"}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div
                  className="mt-4 rounded-lg p-3 border"
                  style={{
                    borderColor: result.surplusLb >= 0 ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)",
                    backgroundColor: result.surplusLb >= 0 ? "hsl(142 71% 45% / 0.1)" : "hsl(0 84% 60% / 0.1)",
                  }}
                >
                  <div className="text-sm text-muted-foreground">
                    {result.surplusLb >= 0
                      ? `At ${inputs.speedMph} mph on a ${inputs.gradePercent}% grade this locomotive has ${lb(result.surplusLb)} lb spare after overcoming resistance, so the train will continue to accelerate. Tonnage could rise to about ${lb(result.maxTrailingTons)} tons before the surplus disappears.`
                      : `At ${inputs.speedMph} mph on a ${inputs.gradePercent}% grade resistance exceeds available tractive effort by ${lb(Math.abs(result.surplusLb))} lb. The train will decelerate — reduce tonnage to about ${lb(result.maxTrailingTons)} tons, add helper locomotives, or accept a lower balancing speed.`}
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
                {result.limitedBy === "Adhesion"
                  ? `At ${inputs.speedMph} mph this locomotive cannot use all its available power — friction runs out first. Adding weight to the driving wheels or improving rail conditions would raise output; adding horsepower would not.`
                  : `At ${inputs.speedMph} mph this locomotive has more grip than power. It could pull harder if more power were available; sanding the rail would make no difference at this speed.`}
                {!isSteam && result.transitionSpeedMph > 0 &&
                  ` The two ceilings cross at ${fmt(result.transitionSpeedMph, 1)} mph, which is where this machine is best matched to itself.`}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Tractive Effort Is a Force, Not a Power Rating</h2>
            <p>
              Locomotives are advertised in horsepower, but horsepower is not what moves a train from a standstill. Tractive
              effort is the force applied at the wheel rim, measured in pounds or kilonewtons, and it is what has to exceed the
              resistance of the train before anything happens. The relationship between the two is simple and consequential:
              power equals force times velocity, so for a fixed power output, force falls as speed rises.
            </p>
            <p>
              In imperial units the conversion is tractive effort equals 375 times horsepower divided by speed in mph, where 375
              comes from combining 550 foot-pounds per second per horsepower with the seconds and feet in an hour and a mile. A
              4,400 hp unit at 83 percent transmission efficiency produces about 3,650 rail horsepower, which is roughly 55,000 lb
              of pull at 25 mph but only about 27,000 lb at 50 mph. Nothing about the engine changed; only the arithmetic of force
              against speed.
            </p>

            <h2 className="text-2xl font-bold mb-3">Two Ceilings, and Why the Lower One Always Wins</h2>
            <p>
              Every locomotive operates under two independent constraints. The <strong>adhesion limit</strong> is the maximum force
              friction can transmit before the wheels slip: weight on the driving wheels multiplied by the coefficient of
              adhesion. The <strong>mechanical limit</strong> is the maximum force the prime mover can generate at the current
              speed. Usable tractive effort is the lower of the two, always, and which one binds changes with speed.
            </p>
            <p>
              At low speed the power equation yields an enormous force — mathematically infinite at zero speed — so the adhesion
              limit binds and the locomotive is grip-constrained. At high speed the power limit falls below the adhesion ceiling
              and the locomotive becomes power-constrained. The crossing point is the transition speed, and it explains a great
              deal of locomotive design. Adding horsepower to a machine operating below its transition speed does nothing but
              spin wheels. Adding ballast weight to one operating above it does nothing but increase resistance.
            </p>

            <h2 className="text-2xl font-bold mb-3">Adhesion: The 25 Percent That Defines Railways</h2>
            <p>
              Steel wheel on steel rail is remarkably slippery. Clean dry rail gives a coefficient of adhesion around 0.25,
              rising to perhaps 0.33 with sand applied. Damp rail falls to about 0.20, wet rail to 0.15, and contaminated rail
              during autumn leaf fall can drop to 0.08 — which is why leaf fall genuinely disrupts timetables rather than being an
              excuse. Compare that with rubber on dry asphalt at 0.7 to 0.9 and the railway looks badly handicapped.
            </p>
            <p>
              That handicap is the deliberate other side of a bargain. The same hard, smooth steel-on-steel contact that provides
              so little friction also produces extraordinarily low rolling resistance: a few pounds per ton, against tens of pounds
              per ton for a road vehicle. A train is therefore superb on the level and poor on gradients, which is why railway
              civil engineering has always spent enormous sums on tunnels, cuttings and viaducts to keep gradients gentle. Modern
              AC-traction locomotives with high-frequency creep control have partly closed the adhesion gap, sustaining 0.37 to
              0.40 by deliberately operating slightly past the peak of the friction curve, where an older DC machine would lose
              the wheelset into a full slip.
            </p>

            <h2 className="text-2xl font-bold mb-3">Resistance, Grade, and Tonnage Ratings</h2>
            <p>
              Tractive effort only matters relative to what opposes it. Rolling resistance is estimated with the Davis equation,
              which sums a bearing constant, a term inversely proportional to axle load, a linear speed term, and an aerodynamic
              term in speed squared. On level track at moderate speed the total is typically 3 to 6 lb per ton.
            </p>
            <p>
              Grade resistance dwarfs it. Resolving gravity along the slope gives about 20 lb per ton for every 1 percent of
              gradient, so a single 1 percent grade adds roughly four times the entire level-track resistance of the train. This is
              why railroads rate tonnage by ruling grade rather than by route length, why helper districts exist on mountain
              crossings, and why a couple of tenths of a percent in gradient can be worth millions in earthworks. Professional
              Mode in this calculator computes both resistance components, reports the surplus effort available for acceleration,
              and solves for the maximum trailing tonnage and the balancing speed — the speed at which effort and resistance
              equalise and the train stops accelerating.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/tractive-effort-calculator" />
          <PopularCalculators exclude="/calculator/tractive-effort-calculator" />
        </div>
      </div>
    </>
  );
};

export default TractiveEffortCalculator;
