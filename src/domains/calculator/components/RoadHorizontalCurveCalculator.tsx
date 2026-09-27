"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

interface RoadInputs {
  units: string;
  designSpeed: number;
  radius: number;
  superelevationPct: number;
  friction: number;
  centralAngleDeg: number;
  laneWidth: number;
  decimals: number;
}

const DEFAULTS: RoadInputs = {
  units: "us",
  designSpeed: 60,
  radius: 1200,
  superelevationPct: 6,
  friction: 0.15,
  centralAngleDeg: 35,
  laneWidth: 12,
  decimals: 1,
};

/** V²/[15(e + f)] in US customary units, V²/[127(e + f)] in metric (AASHTO). */
const LATERAL_CONSTANT = { us: 15, metric: 127 };
/** Degree of curve for a 100 ft (US) or 100 m (metric) arc. */
const DEGREE_CONSTANT = { us: 5729.578, metric: 1746.375 };

const fmt = (v: number, d = 0) =>
  Number.isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface CurveResult {
  valid: boolean;
  errorMsg: string;
  units: string;
  speedUnit: string;
  lengthUnit: string;
  degreeOfCurve: number;
  tangentLength: number;
  curveLength: number;
  midOrdinate: number;
  externalDistance: number;
  longChord: number;
  requiredSuperelevation: number;
  maxSpeed: number;
  speedMargin: number;
  geometryAdequate: boolean;
  eOk: boolean;
  lateralDemand: number;
  frictionSharePct: number;
  superelevationSharePct: number;
  arcLengthPerDegree: number;
  verdict: string;
  verdictColor: string;
  breakdown: BreakdownRow[];
}

function calculateCurve(input: RoadInputs): CurveResult {
  const metric = input.units === "metric";
  const speedUnit = metric ? "km/h" : "mph";
  const lengthUnit = metric ? "m" : "ft";

  const blank = (errorMsg: string): CurveResult => ({
    valid: false,
    errorMsg,
    units: input.units,
    speedUnit,
    lengthUnit,
    degreeOfCurve: 0,
    tangentLength: 0,
    curveLength: 0,
    midOrdinate: 0,
    externalDistance: 0,
    longChord: 0,
    requiredSuperelevation: 0,
    maxSpeed: 0,
    speedMargin: 0,
    geometryAdequate: false,
    eOk: false,
    lateralDemand: 0,
    frictionSharePct: 0,
    superelevationSharePct: 0,
    arcLengthPerDegree: 0,
    verdict: "",
    verdictColor: "text-muted-foreground",
    breakdown: [],
  });

  const nums = [
    input.designSpeed,
    input.radius,
    input.superelevationPct,
    input.friction,
    input.centralAngleDeg,
    input.laneWidth,
    input.decimals,
  ];
  if (!nums.every((v) => Number.isFinite(v))) return blank("Enter a number in every field to lay out the curve.");
  if (input.designSpeed <= 0) return blank("Design speed must be greater than zero.");
  if (input.radius <= 0) return blank("Curve radius must be greater than zero.");
  if (input.superelevationPct < 0 || input.superelevationPct > 12) return blank("Superelevation should be between 0% and 12%.");
  if (input.friction <= 0 || input.friction > 0.5) return blank("The side friction factor should be above 0 and no more than 0.5.");
  if (input.centralAngleDeg <= 0 || input.centralAngleDeg > 179) return blank("The central angle should be between 0° and 179°.");
  if (input.laneWidth <= 0 || input.laneWidth > 30) return blank("Lane width should be between 0 and 30 in the working units.");

  const d = Math.max(0, Math.min(2, input.decimals));
  const e = input.superelevationPct / 100;
  const f = input.friction;
  const V = input.designSpeed;
  const R = input.radius;
  const delta = input.centralAngleDeg;

  // Design relationship: the radius that balances lateral demand against
  // superelevation and side friction, R = V² / [C(e + f)].
  const lateralDemand = (V * V) / (LATERAL_CONSTANT[metric ? "metric" : "us"] * R);
  const requiredSuperelevation = lateralDemand - f;
  const frictionSharePct = (f / lateralDemand) * 100;
  const superelevationSharePct = (e / lateralDemand) * 100;
  const maxSpeed = Math.sqrt(LATERAL_CONSTANT[metric ? "metric" : "us"] * R * (e + f));
  const speedMargin = V - maxSpeed;
  const geometryAdequate = V <= maxSpeed + 0.5;
  const eOk = input.superelevationPct + 0.001 >= requiredSuperelevation;

  // Standard horizontal curve functions for the arc definition of degree of curve.
  const degreeOfCurve = DEGREE_CONSTANT[metric ? "metric" : "us"] / R;
  const halfAngleRad = ((delta / 2) * Math.PI) / 180;
  const tangentLength = R * Math.tan(halfAngleRad);
  const curveLength = R * ((delta * Math.PI) / 180);
  const midOrdinate = R * (1 - Math.cos(halfAngleRad));
  const externalDistance = R * (1 / Math.cos(halfAngleRad) - 1);
  const longChord = 2 * R * Math.sin(halfAngleRad);
  const arcLengthPerDegree = curveLength / delta;

  const verdict = geometryAdequate
    ? `The ${fmt(R, 0)} ${lengthUnit} radius supports ${fmt(V, 0)} ${speedUnit} with ${fmt(input.superelevationPct, 1)}% superelevation and a friction factor of ${fmt(
        f,
        2,
      )}, leaving ${fmt(Math.abs(speedMargin), 0)} ${speedUnit} in reserve`
    : `The geometry supports only ${fmt(maxSpeed, 0)} ${speedUnit} — the enter speed exceeds it by ${fmt(
        Math.abs(speedMargin),
        0,
      )} ${speedUnit}, so the radius must grow, the superelevation be raised or the friction assumption be revisited`;
  const verdictColor = geometryAdequate ? "text-emerald-600" : "text-red-600";

  const breakdown: BreakdownRow[] = [
    { label: "Units used", value: metric ? "Metric — speed in km/h, lengths in metres, R = V²/[127(e + f)]" : "US customary — speed in mph, lengths in feet, R = V²/[15(e + f)]" },
    { label: "Design speed", value: `${fmt(V, 0)} ${speedUnit}` },
    { label: "Curve radius", value: `${fmt(R, 0)} ${lengthUnit}`, highlight: true },
    { label: `Degree of curve (100 ${lengthUnit} arc)`, value: `${fmt(degreeOfCurve, d)}°` },
    { label: "Central angle Δ", value: `${fmt(delta, d)}°` },
    { label: "Tangent length T = R·tan(Δ/2)", value: `${fmt(tangentLength, d)} ${lengthUnit}` },
    { label: "Tangent offset or external distance", value: `${fmt(externalDistance, d)} ${lengthUnit}` },
    { label: "Long chord = 2R·sin(Δ/2)", value: `${fmt(longChord, d)} ${lengthUnit}` },
    { label: "Middle ordinate M = R(1 − cos(Δ/2))", value: `${fmt(midOrdinate, d)} ${lengthUnit}` },
    { label: "Length of curve L = R·Δ", value: `${fmt(curveLength, d)} ${lengthUnit}`, highlight: true },
    { label: `Length of curve per degree of Δ`, value: `${fmt(arcLengthPerDegree, 2)} ${lengthUnit}` },
    { label: "Lateral demand V²/(C·R)", value: fmt(lateralDemand, 4) },
    { label: `Superelevation provided ${fmt(input.superelevationPct, 1)}%`, value: `${fmt(superelevationSharePct, 1)}% of the demand` },
    { label: `Side friction provided ${fmt(f, 2)}`, value: `${fmt(frictionSharePct, 1)}% of the demand` },
    { label: "Superelevation actually required (demand − f)", value: `${fmt(requiredSuperelevation * 100, 2)}%`, highlight: true },
    { label: "Maximum design speed this geometry supports", value: `${fmt(maxSpeed, 1)} ${speedUnit}`, highlight: true },
    {
      label: "Margin between the design speed and that maximum",
      value: `${speedMargin >= 0 ? "−" : "+"}${fmt(Math.abs(speedMargin), 1)} ${speedUnit}`,
    },
    { label: "Lane width entered (for widening checks)", value: `${fmt(input.laneWidth, d)} ${lengthUnit}` },
  ];

  return {
    valid: true,
    errorMsg: "",
    units: input.units,
    speedUnit,
    lengthUnit,
    degreeOfCurve,
    tangentLength,
    curveLength,
    midOrdinate,
    externalDistance,
    longChord,
    requiredSuperelevation,
    maxSpeed,
    speedMargin,
    geometryAdequate,
    eOk,
    lateralDemand,
    frictionSharePct,
    superelevationSharePct,
    arcLengthPerDegree,
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

export default function RoadHorizontalCurveCalculator() {
  const [units, setUnits] = useState<string>(DEFAULTS.units);
  const [designSpeed, setDesignSpeed] = useState(String(DEFAULTS.designSpeed));
  const [radius, setRadius] = useState(String(DEFAULTS.radius));
  const [superelevationPct, setSuperelevationPct] = useState(String(DEFAULTS.superelevationPct));
  const [friction, setFriction] = useState(String(DEFAULTS.friction));
  const [centralAngleDeg, setCentralAngleDeg] = useState(String(DEFAULTS.centralAngleDeg));
  const [laneWidth, setLaneWidth] = useState(String(DEFAULTS.laneWidth));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const metric = units === "metric";
  const speedUnit = metric ? "km/h" : "mph";
  const lengthUnit = metric ? "m" : "ft";

  const getInputs = (): RoadInputs => ({
    units,
    designSpeed: parseFloat(designSpeed) || 0,
    radius: parseFloat(radius) || 0,
    superelevationPct: parseFloat(superelevationPct) || 0,
    friction: parseFloat(friction) || 0,
    centralAngleDeg: parseFloat(centralAngleDeg) || 0,
    laneWidth: parseFloat(laneWidth) || 0,
    decimals: parseFloat(decimals),
  });

  const [calcInputs, setCalcInputs] = useState<RoadInputs>(() => DEFAULTS);
  const [results, setResults] = useState<CurveResult>(() => calculateCurve(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(calculateCurve(inputs));
  };

  const reset = () => {
    setUnits(DEFAULTS.units);
    setDesignSpeed(String(DEFAULTS.designSpeed));
    setRadius(String(DEFAULTS.radius));
    setSuperelevationPct(String(DEFAULTS.superelevationPct));
    setFriction(String(DEFAULTS.friction));
    setCentralAngleDeg(String(DEFAULTS.centralAngleDeg));
    setLaneWidth(String(DEFAULTS.laneWidth));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(calculateCurve(DEFAULTS));
  };

  const speedNum = parseFloat(designSpeed);
  const radiusNum = parseFloat(radius);
  const eNum = parseFloat(superelevationPct);
  const fNum = parseFloat(friction);
  const deltaNum = parseFloat(centralAngleDeg);

  const errors = {
    designSpeed: !Number.isFinite(speedNum) || speedNum <= 0 ? "Must be greater than zero" : "",
    radius: !Number.isFinite(radiusNum) || radiusNum <= 0 ? "Must be greater than zero" : "",
    superelevationPct: !Number.isFinite(eNum) || eNum < 0 || eNum > 12 ? "Use 0–12%" : "",
    friction: !Number.isFinite(fNum) || fNum <= 0 || fNum > 0.5 ? "Use 0.01–0.5" : "",
    centralAngleDeg: !Number.isFinite(deltaNum) || deltaNum <= 0 || deltaNum > 179 ? "Use 0–179°" : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const faqs = [
    {
      question: "How is the radius of a horizontal curve determined?",
      answer:
        "The radius follows from the balance between centrifugal force and the two things that resist it: superelevation, where the pavement is banked so gravity helps hold the vehicle in the curve, and side friction between tyre and pavement. AASHTO expresses that balance as R = V² divided by 15 times the sum of the superelevation rate as a decimal and the side friction factor, with V in mph and R in feet; in metric the constant is 127 rather than 15. At 60 mph with 6 percent superelevation and a friction factor of 0.15, the required radius is about 1,143 feet.",
    },
    {
      question: "What is the degree of curve?",
      answer:
        "The degree of curve is the central angle subtended by a 100 foot arc, using the arc definition that most state agencies apply: D equals 5,729.578 divided by the radius in feet. In metric practice the arc is 100 metres and the constant is 1,746.375. Highway designers use the degree of curve rather than the radius because curve tables, superelevation tables and the relationship between curve length and central angle are all expressed in degrees, and because a curve of a given degree has a fixed length per degree of deflection regardless of how far it turns in total.",
    },
    {
      question: "What do the tangent, mid-ordinate and external distance tell me?",
      answer:
        "They are the layout dimensions of the curve. The tangent length T is the distance from the point of intersection to the start of the curve, measured along each approach, and equals R times the tangent of half the central angle. The external distance is how far the intersection point sits outside the curve, at R times the secant of half the angle minus one, which is the clearance needed at the apex. The middle ordinate is the largest gap between the long chord and the arc, and it doubles as the horizontal sightline offset a designer must keep free of guardrails, walls and planting so drivers can see through the curve. The long chord spans the two tangent points.",
    },
    {
      question: "What happens if the superelevation is too low?",
      answer:
        "Side friction has to make up the difference, and friction is the weaker partner: on a wet or polished pavement the available friction can fall below 0.10, at which point a curve designed on a 0.15 assumption becomes marginal. That is why this calculator reports the superelevation actually required at the entered radius, and the maximum design speed the geometry supports. Where the superelevation cannot be raised, the radius must increase or the design speed must come down — a curve that is over-driven for its geometry is one of the persistent causes of run-off-road crashes.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Engineering", href: "/calculator#engineering" },
          { label: "Road Horizontal Curve Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Road Horizontal Curve Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Design Basis">
              <div className="grid grid-cols-2 gap-3">
                <CompactSelect
                  id="units"
                  label="Units"
                  value={units}
                  onChange={setUnits}
                  options={[
                    { value: "us", label: "US customary (mph, ft)" },
                    { value: "metric", label: "Metric (km/h, m)" },
                  ]}
                  tooltip="Switches the lateral constant between 15 for US customary and 127 for metric."
                />
                <CompactInput
                  id="design-speed"
                  label="Design Speed"
                  value={designSpeed}
                  onChange={setDesignSpeed}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix={speedUnit}
                  error={errors.designSpeed}
                  tooltip="Speed the curve has to support comfortably."
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <CompactInput
                  id="radius"
                  label="Curve Radius"
                  value={radius}
                  onChange={setRadius}
                  onEnter={runCalculate}
                  min="1"
                  step="any"
                  suffix={lengthUnit}
                  error={errors.radius}
                  tooltip="Radius of the circular arc measured to the centreline."
                />
                <CompactInput
                  id="central-angle"
                  label="Central Angle"
                  value={centralAngleDeg}
                  onChange={setCentralAngleDeg}
                  onEnter={runCalculate}
                  min="0.1"
                  max="179"
                  step="any"
                  suffix="°"
                  error={errors.centralAngleDeg}
                  tooltip="Total deflection of the curve between the two tangents."
                />
              </div>
            </SubSection>

            <SubSection title="Lateral Resistance">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="superelevation"
                  label="Superelevation"
                  value={superelevationPct}
                  onChange={setSuperelevationPct}
                  onEnter={runCalculate}
                  min="0"
                  max="12"
                  step="0.5"
                  suffix="%"
                  error={errors.superelevationPct}
                  hint="Normal crown to 6–8%."
                  tooltip="Rate at which the pavement is banked into the curve."
                />
                <CompactInput
                  id="friction"
                  label="Side Friction Factor"
                  value={friction}
                  onChange={setFriction}
                  onEnter={runCalculate}
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  error={errors.friction}
                  hint="0.15 new, 0.10 worn pavement."
                  tooltip="Lateral friction assumed available between tyre and pavement."
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
                  <SubSection title="Widths & Precision">
                    <div className="grid grid-cols-2 gap-3">
                      <CompactInput
                        id="lane-width"
                        label="Lane Width"
                        value={laneWidth}
                        onChange={setLaneWidth}
                        onEnter={runCalculate}
                        min="1"
                        max="30"
                        step="0.5"
                        suffix={lengthUnit}
                        tooltip="Lane width in the working units, used when checking curve widening for long vehicles."
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
                        tooltip="Decimal places used for the curve dimensions."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Curve Radius</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(calcInputs.radius, 0)} ${results.lengthUnit}` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `Degree of curve ${fmt(results.degreeOfCurve, 2)}° · supports up to ${fmt(results.maxSpeed, 0)} ${
                      results.speedUnit
                    } with ${fmt(calcInputs.superelevationPct, 1)}% superelevation and f = ${fmt(calcInputs.friction, 2)}`
                  : "Fix the highlighted inputs to lay out the curve"}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Tangent T</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.tangentLength, 0)} ${results.lengthUnit}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Curve Length</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.curveLength, 0)} ${results.lengthUnit}` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mid-Ordinate</span>
                <span className={`font-extrabold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                  {results.valid ? `${fmt(results.midOrdinate, 1)} ${results.lengthUnit}` : "—"}
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Curve Element</th>
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
                        Enter the design speed, radius and lateral resistance to lay out the curve.
                      </td>
                    </tr>
                  )}
                  {results.valid && (
                    <tr className="font-bold bg-secondary/30 border-t-2 border-border">
                      <td className="p-2.5 pl-3 text-foreground">Geometry check</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">
                        {`${results.geometryAdequate ? "adequate" : "deficient"} for ${fmt(calcInputs.designSpeed, 0)} ${
                          results.speedUnit
                        } · e required ${fmt(results.requiredSuperelevation * 100, 2)}%`}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Radius</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(calcInputs.radius, 0)} ${results.lengthUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Degree of curve</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.degreeOfCurve, 2)}°` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Tangent length</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.tangentLength, 1)} ${results.lengthUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">External distance</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.externalDistance, 1)} ${results.lengthUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Curve length</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.curveLength, 0)} ${results.lengthUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Long chord</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.longChord, 0)} ${results.lengthUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Max speed supported</span>
                  <span className={`text-base font-bold ${results.valid ? results.verdictColor : "text-muted-foreground"}`}>
                    {results.valid ? `${fmt(results.maxSpeed, 0)} ${results.speedUnit}` : "—"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Superelevation required</span>
                  <span className="text-base font-bold text-foreground">
                    {results.valid ? `${fmt(results.requiredSuperelevation * 100, 2)}%` : "—"}
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
            <h2 className="text-2xl font-bold mb-3">What Is a Road Horizontal Curve Calculator?</h2>
            <p>
              A road horizontal curve calculator turns a design speed and the available lateral resistance into the radius a curve
              needs, and then into the dimensions a surveyor or designer sets out in the field: degree of curve, tangent length, curve
              length, middle ordinate, external distance and long chord. It also runs the reverse check, reporting the maximum speed a
              curve of the entered radius actually supports on the stated superelevation and friction, so a design can be tested rather
              than assumed.
            </p>
            <p>
              Horizontal curves are where a road is most likely to be driven faster than its geometry allows. The geometry is a
              compromise between three quantities — speed, superelevation and friction — and any one of them can be pushed beyond its
              limit by a designer working to a cost constraint or by a driver ignoring the posted limit.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The design relationship sets centrifugal demand against resistance: the term V² divided by R is the lateral acceleration the
              curve demands, and superelevation plus side friction supply it. AASHTO writes the balance as R = V² divided by 15 times the
              sum of e and f in US customary units, and as R = V² divided by 127 times the same sum in metric with speed in km/h and radius
              in metres. Rearranged the other way, the superelevation required at a known radius is the lateral demand minus the friction
              the pavement can supply, which is the check that identifies a curve whose bank is too shallow for its speed.
            </p>
            <p>
              The layout dimensions come from the central angle. Tangent length is the radius times the tangent of half the angle; the
              external distance is the radius times the secant of half the angle minus one, giving the clearance needed at the point of
              intersection; the middle ordinate is the radius times one minus the cosine of half the angle, which is the largest gap
              between chord and arc and therefore the sightline offset that must be kept clear; and the long chord spans the tangent
              points. The degree of curve is the central angle subtended by a 100 foot or 100 metre arc — 5,729.578 divided by the radius
              in feet, or 1,746.375 divided by the radius in metres — and the curve length follows as the radius times the central angle
              in radians.
            </p>
            <p>
              Design speed then becomes a question with two answers rather than one. The first is the radius needed for the speed you
              intend. The second, which this calculator reports directly, is the speed the radius you have can actually carry — and the gap
              between them is what a designer has to close before the alignment is built.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card is the radius in the units you selected, with the degree of curve and the maximum speed it supports
              underneath. The three-stat bar adds the tangent length, the curve length and the middle ordinate, which between them define
              where the curve starts, how long it runs and how far back an obstruction has to be.
            </p>
            <p>
              The breakdown table lists the units in use, the speed, radius and central angle, all five layout dimensions, the split of
              lateral demand between superelevation and friction, the superelevation the curve actually requires, the maximum design speed
              the geometry supports and the margin between that figure and the design speed. The summary panel repeats the headline
              dimensions and prints the verdict line.
            </p>
            <p>
              Treat friction as the honest input here. A new, dry, well-textured pavement can develop lateral friction above 0.35 at low
              speed, but the value falls with speed and falls further with wet weather, polished aggregate and worn tyres. Designing close
              to a friction limit of 0.15 leaves nothing for the day the pavement is wet, which is why the required superelevation figure
              matters more than the radius when a curve is being assessed rather than designed. Long vehicles also matter: a large truck
              not only occupies more of the lane through a sharp curve but also tracks inside it, and its higher centre of gravity reduces
              the rollover threshold, which is what curve widening requirements and off-tracking checks are for.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/road-horizontal-curve-calculator" />
          <PopularCalculators exclude="/calculator/road-horizontal-curve-calculator" />
        </div>
      </div>
    </>
  );
}
