"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type FlowUnit = "lps" | "lpm" | "m3h" | "gpm";

interface PipeFlowInputs {
  diameterMm: number;
  flowValue: number;
  flowUnit: FlowUnit;
  roughnessMm: number;
  lengthM: number;
  decimals: number;
}

const DEFAULTS: PipeFlowInputs = {
  diameterMm: 50,
  flowValue: 3,
  flowUnit: "lps",
  roughnessMm: 0.045,
  lengthM: 30,
  decimals: 3,
};

const fmt = (v: number, d = 3) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const WATER_DENSITY = 998;
const WATER_VISCOSITY = 0.001002;
const GRAVITY = 9.80665;

const FLOW_TO_M3S: Record<FlowUnit, number> = {
  lps: 0.001,
  lpm: 0.001 / 60,
  m3h: 1 / 3600,
  gpm: 0.003785411784 / 60,
};

const UNIT_LABELS: Record<FlowUnit, string> = {
  lps: "L/s",
  lpm: "L/min",
  m3h: "m³/h",
  gpm: "US GPM",
};

interface DiameterRow {
  diameterMm: number;
  area: number;
  velocity: number;
  headLossPer100m: number;
  reynolds: number;
}

interface UnitRow {
  label: string;
  value: string;
}

interface PipeFlowResult {
  valid: boolean;
  errorMsg: string;
  area: number;
  velocity: number;
  flowM3s: number;
  reynolds: number;
  regime: string;
  frictionFactor: number;
  relativeRoughness: number;
  headLossPerM: number;
  headLossTotal: number;
  pressureDropKpa: number;
  pressureDropBar: number;
  travelTimeS: number;
  velocityWarning: string;
  diameterRows: DiameterRow[];
  unitRows: UnitRow[];
}

function frictionFactorFor(re: number, relRoughness: number): number {
  if (re <= 0) return 0;
  if (re < 2300) return 64 / re;
  const term = relRoughness / 3.7 + 5.74 / Math.pow(re, 0.9);
  const denom = Math.log10(term);
  if (!Number.isFinite(denom) || denom === 0) return 0.316 / Math.pow(re, 0.25);
  return 0.25 / (denom * denom);
}

function computePipeFlow(input: PipeFlowInputs): PipeFlowResult {
  const { diameterMm, flowValue, flowUnit, roughnessMm, lengthM, decimals } = input;

  const blank: PipeFlowResult = {
    valid: false,
    errorMsg: "",
    area: 0,
    velocity: 0,
    flowM3s: 0,
    reynolds: 0,
    regime: "",
    frictionFactor: 0,
    relativeRoughness: 0,
    headLossPerM: 0,
    headLossTotal: 0,
    pressureDropKpa: 0,
    pressureDropBar: 0,
    travelTimeS: 0,
    velocityWarning: "",
    diameterRows: [],
    unitRows: [],
  };

  if (![diameterMm, flowValue, roughnessMm, lengthM].every((v) => Number.isFinite(v))) {
    return { ...blank, errorMsg: "Enter a number in every field to run the pipe flow calculation." };
  }
  if (diameterMm <= 0) return { ...blank, errorMsg: "The internal pipe diameter must be greater than zero." };
  if (flowValue < 0) return { ...blank, errorMsg: "Flow rate cannot be negative." };
  if (roughnessMm < 0) return { ...blank, errorMsg: "Pipe roughness cannot be negative." };
  if (lengthM <= 0) return { ...blank, errorMsg: "Pipe length must be greater than zero." };

  const diameterM = diameterMm / 1000;
  const area = (Math.PI * diameterM * diameterM) / 4;
  const flowM3s = flowValue * FLOW_TO_M3S[flowUnit];
  const velocity = area > 0 ? flowM3s / area : 0;
  const reynolds = (WATER_DENSITY * velocity * diameterM) / WATER_VISCOSITY;
  const relativeRoughness = diameterM > 0 ? roughnessMm / 1000 / diameterM : 0;
  const frictionFactor = frictionFactorFor(reynolds, relativeRoughness);

  const velocityHead = (velocity * velocity) / (2 * GRAVITY);
  const headLossPerM = diameterM > 0 ? (frictionFactor * velocityHead) / diameterM : 0;
  const headLossTotal = headLossPerM * lengthM;
  const pressureDropPa = WATER_DENSITY * GRAVITY * headLossTotal;

  const regime = reynolds < 2300 ? "Laminar" : reynolds <= 4000 ? "Transitional" : "Turbulent";

  let velocityWarning = "Velocity is inside the usual design range for pumped water.";
  if (velocity < 0.5) velocityWarning = "Below 0.5 m/s: solids may settle and air can be difficult to clear.";
  else if (velocity > 3) velocityWarning = "Above 3 m/s: expect erosion, noise and a high pressure drop.";
  else if (velocity > 1.8) velocityWarning = "Above 1.8 m/s: acceptable, but pressure drop and noise rise noticeably.";

  const diameterRows: DiameterRow[] = [15, 20, 25, 32, 40, 50, 65, 80, 100, 150, 200].map((d) => {
    const dm = d / 1000;
    const a = (Math.PI * dm * dm) / 4;
    const v = a > 0 ? flowM3s / a : 0;
    const re = (WATER_DENSITY * v * dm) / WATER_VISCOSITY;
    const rr = roughnessMm / 1000 / dm;
    const f = frictionFactorFor(re, rr);
    const hl = dm > 0 ? (f * (v * v) / (2 * GRAVITY) / dm) * 100 : 0;
    return {
      diameterMm: d,
      area: Number((a * 1000000).toFixed(0)),
      velocity: Number(v.toFixed(3)),
      headLossPer100m: Number(hl.toFixed(3)),
      reynolds: Number(re.toFixed(0)),
    };
  });

  const unitRows: UnitRow[] = [
    { label: "Litres per second", value: `${fmt(flowM3s * 1000, 4)} L/s` },
    { label: "Litres per minute", value: `${fmt(flowM3s * 60000, 2)} L/min` },
    { label: "Cubic metres per hour", value: `${fmt(flowM3s * 3600, 3)} m³/h` },
    { label: "US gallons per minute", value: `${fmt(flowM3s * 15850.323, 2)} gpm` },
    { label: "US gallons per hour", value: `${fmt(flowM3s * 951019.4, 1)} gph` },
    { label: "Cubic feet per second", value: `${fmt(flowM3s * 35.3147, 5)} cfs` },
  ];

  return {
    valid: true,
    errorMsg: "",
    area: Number((area * 10000).toFixed(3)),
    velocity: Number(velocity.toFixed(decimals)),
    flowM3s: Number(flowM3s.toFixed(6)),
    reynolds: Number(reynolds.toFixed(0)),
    regime,
    frictionFactor: Number(frictionFactor.toFixed(5)),
    relativeRoughness: Number(relativeRoughness.toFixed(6)),
    headLossPerM: Number(headLossPerM.toFixed(5)),
    headLossTotal: Number(headLossTotal.toFixed(3)),
    pressureDropKpa: Number((pressureDropPa / 1000).toFixed(3)),
    pressureDropBar: Number((pressureDropPa / 100000).toFixed(4)),
    travelTimeS: velocity > 0 ? Number((lengthM / velocity).toFixed(2)) : 0,
    velocityWarning,
    diameterRows,
    unitRows,
  };
}

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hint?: string;
  type?: string;
  min?: string;
  suffix?: string;
  tooltip?: string;
}

const CompactInput = ({ id, label, value, onChange, onEnter, hint, type = "number", min, suffix, tooltip }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1" title={tooltip}>
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-9 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input
        id={id}
        type={type}
        value={value}
        min={min}
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
    {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">{title}</div>
    {children}
  </div>
);

export default function PipeFlowCalculator() {
  const [diameterMm, setDiameterMm] = useState(String(DEFAULTS.diameterMm));
  const [flowValue, setFlowValue] = useState(String(DEFAULTS.flowValue));
  const [flowUnit, setFlowUnit] = useState<FlowUnit>(DEFAULTS.flowUnit);
  const [roughnessMm, setRoughnessMm] = useState(String(DEFAULTS.roughnessMm));
  const [lengthM, setLengthM] = useState(String(DEFAULTS.lengthM));
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): PipeFlowInputs => ({
    diameterMm: parseFloat(diameterMm) || 0,
    flowValue: parseFloat(flowValue) || 0,
    flowUnit,
    roughnessMm: parseFloat(roughnessMm) || 0,
    lengthM: parseFloat(lengthM) || 0,
    decimals: Math.max(0, Math.min(6, parseFloat(decimals) || 3)),
  });

  const [calcInputs, setCalcInputs] = useState<PipeFlowInputs>(() => DEFAULTS);
  const [results, setResults] = useState<PipeFlowResult>(() => computePipeFlow(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computePipeFlow(inputs));
  };

  const reset = () => {
    setDiameterMm(String(DEFAULTS.diameterMm));
    setFlowValue(String(DEFAULTS.flowValue));
    setFlowUnit(DEFAULTS.flowUnit);
    setRoughnessMm(String(DEFAULTS.roughnessMm));
    setLengthM(String(DEFAULTS.lengthM));
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computePipeFlow(DEFAULTS));
  };

  const UNITS: FlowUnit[] = ["lps", "lpm", "m3h", "gpm"];

  const faqs = [
    {
      question: "What is a good water velocity in a pipe?",
      answer:
        "Most pumped water systems are designed between about one and three metres per second. Below half a metre per second solids can settle and air is hard to clear, while above three metres per second erosion, noise and pressure drop all rise sharply. Around one to one and a half metres per second is the usual comfortable target for distribution pipework.",
    },
    {
      question: "How does pipe size affect flow for the same pressure?",
      answer:
        "Flow capacity rises very steeply with diameter. Doubling the internal diameter roughly quadruples the cross-sectional area and, at the same velocity, quadruples the flow. At the same pressure the gain is even larger because friction falls. That is why a modest increase in pipe size often solves a persistent flow complaint.",
    },
    {
      question: "What is head loss?",
      answer:
        "Head loss is the energy lost to friction as water travels through a pipe, expressed as an equivalent height of water. It grows with length, with the square of velocity and with roughness, and it is what a pump has to overcome. Converting head loss to pressure is simply a matter of multiplying by the density of water and gravity.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Pipe Flow Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pipe Flow Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Pipe & Flow">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput
                  id="diameter"
                  label="Internal Diameter"
                  value={diameterMm}
                  onChange={setDiameterMm}
                  onEnter={runCalculate}
                  suffix="mm"
                  tooltip="Inside bore of the pipe, not the nominal size."
                />
                <CompactInput
                  id="flow-value"
                  label="Flow Rate"
                  value={flowValue}
                  onChange={setFlowValue}
                  onEnter={runCalculate}
                  suffix={UNIT_LABELS[flowUnit]}
                  tooltip="Volume flowing per unit of time."
                />
              </div>
            </SubSection>

            <SubSection title="Flow Units">
              <div className="grid grid-cols-4 gap-2">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setFlowUnit(u)}
                    aria-pressed={flowUnit === u}
                    className={
                      flowUnit === u
                        ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-xs shadow-sm transition-all active:scale-[0.98]"
                        : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-xs transition-colors"
                    }
                  >
                    {UNIT_LABELS[u]}
                  </button>
                ))}
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
                  <SubSection title="Pipe Detail">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="roughness"
                        label="Roughness"
                        value={roughnessMm}
                        onChange={setRoughnessMm}
                        onEnter={runCalculate}
                        min="0"
                        suffix="mm"
                        tooltip="About 0.045 mm for plastic, 0.15 mm for steel, 0.26 mm for cast iron."
                      />
                      <CompactInput
                        id="length"
                        label="Pipe Length"
                        value={lengthM}
                        onChange={setLengthM}
                        onEnter={runCalculate}
                        min="0"
                        suffix="m"
                        tooltip="Length used for the total head loss and pressure drop."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show in the velocity."
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
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm"
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

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
            {!results.valid && (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Check your inputs</div>
                <div className="text-base font-medium text-foreground">{results.errorMsg}</div>
              </div>
            )}

            {/* PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative overflow-hidden">
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Flow Velocity</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? `${fmt(results.velocity, calcInputs.decimals)} m/s` : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid
                  ? `${fmt(results.flowM3s * 1000, 2)} L/s through a ${fmt(calcInputs.diameterMm, 1)} mm bore · ${results.regime} flow`
                  : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Reynolds</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.reynolds, 0) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Head Loss</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.headLossTotal, 3)} m` : "—"}
                </span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Pressure Drop</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.pressureDropBar, 4)} bar` : "—"}
                </span>
              </div>
            </div>

            {results.valid && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Velocity Check</div>
                <p className="text-sm text-foreground">{results.velocityWarning}</p>
              </div>
            )}

            {/* FLOW TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Bore</th>
                    <th className="p-2.5 text-right">Area</th>
                    <th className="p-2.5 text-right">Velocity</th>
                    <th className="p-2.5 pr-3 text-right w-[150px]">Head Loss / 100 m</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.diameterRows.map((row) => (
                    <tr
                      key={row.diameterMm}
                      className={row.diameterMm === calcInputs.diameterMm ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{`${row.diameterMm} mm`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.area, 0)} mm²`}</td>
                      <td className="p-2.5 text-right text-foreground">{`${fmt(row.velocity, 3)} m/s`}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{`${fmt(row.headLossPer100m, 3)} m`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* UNIT TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Flow Unit</th>
                    <th className="p-2.5 pr-3 text-right w-[190px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.unitRows.map((row) => (
                    <tr key={row.label} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{row.label}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.value}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Travel time through the pipe</td>
                    <td className="p-2.5 pr-3 text-right text-emerald-600">{`${fmt(results.travelTimeS, 2)} s`}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-bold">
                Summary Statistics
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Flow Rate</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.flowM3s * 1000, 3)} L/s`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Flow Regime</span>
                  <span className="text-base font-bold text-foreground">{results.regime || "—"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Friction Factor</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.frictionFactor, 5)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Relative Roughness</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.relativeRoughness, 6)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Head Loss per Metre</span>
                  <span className="text-base font-bold text-foreground">{fmt(results.headLossPerM, 5)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pressure Drop</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.pressureDropKpa, 2)} kPa`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Pipe Flow Calculator?</h2>
            <p>
              A pipe flow calculator converts a flow rate into velocity for a given bore, then works out the friction losses that
              flow creates. It reports the cross-sectional area, the Reynolds number, the Darcy friction factor, head loss per metre
              and over the whole length, the equivalent pressure drop and the same flow expressed in six different units.
            </p>
            <p>
              Sizing pipework means balancing three things: enough velocity to keep the line self-cleaning, low enough velocity to
              avoid erosion and noise, and a pressure drop the pump or supply can actually overcome. This calculator makes all three
              visible at once, and the diameter table shows how much a single size step up improves the picture.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              Flow rate is converted to cubic metres per second and divided by the internal area of the pipe to give average
              velocity. The Reynolds number then compares inertial and viscous forces using water properties at typical ambient
              conditions, and the friction factor follows from the Swamee-Jain approximation, which accounts for both Reynolds number
              and the relative roughness of the pipe wall.
            </p>
            <p>
              Head loss comes from the Darcy-Weisbach relationship: friction factor multiplied by length divided by diameter,
              multiplied by the velocity head. Multiplying that height by the density of water and gravity converts it into
              pressure, which is why head in metres and pressure in kilopascals always move together in a water system.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the velocity with the flow rate and regime beneath it. The three-stat bar reports the Reynolds
              number, total head loss and pressure drop, and a note flags whether the velocity sits inside the usual design window of
              roughly half a metre per second to three metres per second.
            </p>
            <p>
              Use the diameter table as a sizing tool. Holding the same flow rate, moving from a twenty-five millimetre to a
              thirty-two millimetre bore cuts the velocity by about forty percent and the head loss by two thirds, which is often
              enough to turn an inadequate supply into an acceptable one without adding a pump.
            </p>
            <p>
              Remember that these figures cover straight pipe only. Bends, tees, valves, strainers and any other fittings add local
              losses that can easily exceed the straight-pipe figure in a compact plant room, so add a suitable allowance when
              checking a real installation against an available pressure.
            </p>
            <p>
              Finally, check the roughness value against the material actually installed. New plastic pipe is far smoother than old
              galvanised steel, and scale and biofilm can raise roughness significantly over a few years of service. Recalculating
              with a pessimistic roughness is a quick way to see whether a design still works at the end of its life rather than
              only on commissioning day.
            </p>
            <p>
              Keep the calculation with the drawing whenever a line is installed or altered, because pipe sizes are frequently
              changed on site to match what is in the van rather than what was designed. A note showing flow, velocity and pressure
              drop at commissioning makes later troubleshooting far quicker, and it shows clearly whether a complaint is caused by
              a sizing decision or by something blocking the line.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pipe-flow-calculator" />
          <PopularCalculators exclude="/calculator/pipe-flow-calculator" />
        </div>
      </div>
    </>
  );
}
