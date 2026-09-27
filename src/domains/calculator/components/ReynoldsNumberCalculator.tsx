"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { ChevronDown, RotateCcw } from "lucide-react";

type ViscosityMode = "dynamic" | "kinematic";

interface ReynoldsInputs {
  density: number;
  velocity: number;
  diameterMm: number;
  dynamicViscosity: number;
  kinematicViscosity: number;
  viscosityMode: ViscosityMode;
  decimals: number;
}

const DEFAULTS: ReynoldsInputs = {
  density: 998,
  velocity: 1.5,
  diameterMm: 50,
  dynamicViscosity: 1.002,
  kinematicViscosity: 1.004,
  viscosityMode: "dynamic",
  decimals: 1,
};

const fmt = (v: number, d = 1) =>
  Number.isFinite(v) ? v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

interface RegimeRow {
  label: string;
  range: string;
  detail: string;
  current: boolean;
}

interface VelocityRow {
  velocity: number;
  reynolds: number;
  regime: string;
}

interface ReynoldsResult {
  valid: boolean;
  errorMsg: string;
  reynolds: number;
  regime: string;
  frictionFactor: number;
  frictionNote: string;
  velocity: number;
  diameterM: number;
  kinematic: number;
  dynamicPaS: number;
  flowArea: number;
  volumetricFlow: number;
  regimes: RegimeRow[];
  velocityRows: VelocityRow[];
}

function regimeFor(re: number): string {
  if (re < 2300) return "Laminar";
  if (re <= 4000) return "Transitional";
  return "Turbulent";
}

function computeReynolds(input: ReynoldsInputs): ReynoldsResult {
  const { density, velocity, diameterMm, dynamicViscosity, kinematicViscosity, viscosityMode, decimals } = input;

  const blank: ReynoldsResult = {
    valid: false,
    errorMsg: "",
    reynolds: 0,
    regime: "",
    frictionFactor: 0,
    frictionNote: "",
    velocity: 0,
    diameterM: 0,
    kinematic: 0,
    dynamicPaS: 0,
    flowArea: 0,
    volumetricFlow: 0,
    regimes: [],
    velocityRows: [],
  };

  if (![density, velocity, diameterMm, dynamicViscosity, kinematicViscosity].every((v) => Number.isFinite(v))) {
    return { ...blank, errorMsg: "Enter a number in every field to calculate the Reynolds number." };
  }
  if (density <= 0) return { ...blank, errorMsg: "Fluid density must be greater than zero." };
  if (velocity < 0) return { ...blank, errorMsg: "Velocity cannot be negative." };
  if (diameterMm <= 0) return { ...blank, errorMsg: "The pipe or duct diameter must be greater than zero." };
  if (viscosityMode === "dynamic" && dynamicViscosity <= 0) {
    return { ...blank, errorMsg: "Dynamic viscosity must be greater than zero." };
  }
  if (viscosityMode === "kinematic" && kinematicViscosity <= 0) {
    return { ...blank, errorMsg: "Kinematic viscosity must be greater than zero." };
  }

  const diameterM = diameterMm / 1000;
  const dynamicPaS = dynamicViscosity / 1000;
  const kinematic = viscosityMode === "kinematic" ? kinematicViscosity / 1000000 : dynamicPaS / density;

  const reynolds =
    viscosityMode === "kinematic"
      ? (velocity * diameterM) / (kinematicViscosity / 1000000)
      : (density * velocity * diameterM) / dynamicPaS;

  const regime = regimeFor(reynolds);

  let frictionFactor = 0;
  let frictionNote = "";
  if (reynolds <= 0) {
    frictionFactor = 0;
    frictionNote = "No flow, so no friction factor.";
  } else if (reynolds < 2300) {
    frictionFactor = 64 / reynolds;
    frictionNote = "Laminar flow: friction factor equals 64 divided by the Reynolds number.";
  } else if (reynolds <= 4000) {
    frictionFactor = 0.316 / Math.pow(reynolds, 0.25);
    frictionNote = "Transitional flow: the Blasius estimate is shown, but the real value is unpredictable here.";
  } else {
    frictionFactor = 0.316 / Math.pow(reynolds, 0.25);
    frictionNote = "Turbulent flow: Blasius estimate, accurate for smooth pipes up to about 100,000.";
  }

  const flowArea = (Math.PI * diameterM * diameterM) / 4;
  const volumetricFlow = flowArea * velocity;

  const regimes: RegimeRow[] = [
    {
      label: "Laminar",
      range: "Re < 2,300",
      detail: "Smooth, orderly layers; viscous forces dominate",
      current: reynolds < 2300,
    },
    {
      label: "Transitional",
      range: "2,300 – 4,000",
      detail: "Unstable region where flow flickers between states",
      current: reynolds >= 2300 && reynolds <= 4000,
    },
    {
      label: "Turbulent",
      range: "Re > 4,000",
      detail: "Chaotic mixing; inertial forces dominate",
      current: reynolds > 4000,
    },
  ];

  const velocityRows: VelocityRow[] = [0.2, 0.5, 1, 1.5, 2, 3, 5].map((v) => {
    const re = viscosityMode === "kinematic" ? (v * diameterM) / (kinematicViscosity / 1000000) : (density * v * diameterM) / dynamicPaS;
    return { velocity: v, reynolds: Number(re.toFixed(0)), regime: regimeFor(re) };
  });

  return {
    valid: true,
    errorMsg: "",
    reynolds: Number(reynolds.toFixed(Math.max(0, Math.min(4, decimals)))),
    regime,
    frictionFactor: Number(frictionFactor.toFixed(5)),
    frictionNote,
    velocity: Number(velocity.toFixed(3)),
    diameterM: Number(diameterM.toFixed(4)),
    kinematic,
    dynamicPaS: Number(dynamicPaS.toFixed(6)),
    flowArea: Number(flowArea.toFixed(6)),
    volumetricFlow: Number(volumetricFlow.toFixed(5)),
    regimes,
    velocityRows,
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

export default function ReynoldsNumberCalculator() {
  const [density, setDensity] = useState(String(DEFAULTS.density));
  const [velocity, setVelocity] = useState(String(DEFAULTS.velocity));
  const [diameterMm, setDiameterMm] = useState(String(DEFAULTS.diameterMm));
  const [dynamicViscosity, setDynamicViscosity] = useState(String(DEFAULTS.dynamicViscosity));
  const [kinematicViscosity, setKinematicViscosity] = useState(String(DEFAULTS.kinematicViscosity));
  const [viscosityMode, setViscosityMode] = useState<ViscosityMode>(DEFAULTS.viscosityMode);
  const [decimals, setDecimals] = useState(String(DEFAULTS.decimals));
  const [showAdv, setShowAdv] = useState(false);

  const getInputs = (): ReynoldsInputs => ({
    density: parseFloat(density) || 0,
    velocity: parseFloat(velocity) || 0,
    diameterMm: parseFloat(diameterMm) || 0,
    dynamicViscosity: parseFloat(dynamicViscosity) || 0,
    kinematicViscosity: parseFloat(kinematicViscosity) || 0,
    viscosityMode,
    decimals: parseFloat(decimals) || 1,
  });

  const [calcInputs, setCalcInputs] = useState<ReynoldsInputs>(() => DEFAULTS);
  const [results, setResults] = useState<ReynoldsResult>(() => computeReynolds(DEFAULTS));

  const runCalculate = () => {
    const inputs = getInputs();
    setCalcInputs(inputs);
    setResults(computeReynolds(inputs));
  };

  const reset = () => {
    setDensity(String(DEFAULTS.density));
    setVelocity(String(DEFAULTS.velocity));
    setDiameterMm(String(DEFAULTS.diameterMm));
    setDynamicViscosity(String(DEFAULTS.dynamicViscosity));
    setKinematicViscosity(String(DEFAULTS.kinematicViscosity));
    setViscosityMode(DEFAULTS.viscosityMode);
    setDecimals(String(DEFAULTS.decimals));
    setCalcInputs(DEFAULTS);
    setResults(computeReynolds(DEFAULTS));
  };

  const faqs = [
    {
      question: "What does the Reynolds number actually tell you?",
      answer:
        "It compares inertial forces with viscous forces in a flowing fluid. A low number means viscosity dominates and the flow stays in smooth layers, while a high number means momentum dominates and the flow breaks into turbulent eddies. Because it is dimensionless, the same value predicts the same behaviour in water, air or oil as long as the geometry is similar.",
    },
    {
      question: "What is the difference between dynamic and kinematic viscosity?",
      answer:
        "Dynamic viscosity measures resistance to shear and is expressed in pascal seconds, while kinematic viscosity is dynamic viscosity divided by density and is expressed in square metres per second. Water at room temperature has a dynamic viscosity of about one millipascal second and a kinematic viscosity of about one square millimetre per second, which is a convenient coincidence.",
    },
    {
      question: "Why does the friction factor matter?",
      answer:
        "Once the regime is known, the friction factor converts flow conditions into pressure loss. Laminar flow uses the simple ratio of sixty-four to the Reynolds number, while turbulent flow follows the Blasius or Colebrook relationships. That single number drives pumping power, pipe sizing and fan selection, which is why the Reynolds number is the first calculation in most fluid system designs.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Reynolds Number Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Reynolds Number Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
            <SubSection title="Flow Conditions">
              <div className="grid grid-cols-3 gap-3">
                <CompactInput
                  id="density"
                  label="Density"
                  value={density}
                  onChange={setDensity}
                  onEnter={runCalculate}
                  suffix="kg/m³"
                  tooltip="Water is about 998 kg/m³ at room temperature."
                />
                <CompactInput
                  id="velocity"
                  label="Velocity"
                  value={velocity}
                  onChange={setVelocity}
                  onEnter={runCalculate}
                  suffix="m/s"
                  tooltip="Average flow velocity in the pipe."
                />
                <CompactInput
                  id="diameter"
                  label="Diameter"
                  value={diameterMm}
                  onChange={setDiameterMm}
                  onEnter={runCalculate}
                  suffix="mm"
                  tooltip="Internal diameter of the pipe or duct."
                />
              </div>
            </SubSection>

            <SubSection title="Viscosity Basis">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setViscosityMode("dynamic")}
                  aria-pressed={viscosityMode === "dynamic"}
                  className={
                    viscosityMode === "dynamic"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Dynamic (mPa·s)
                </button>
                <button
                  type="button"
                  onClick={() => setViscosityMode("kinematic")}
                  aria-pressed={viscosityMode === "kinematic"}
                  className={
                    viscosityMode === "kinematic"
                      ? "h-9 rounded-md bg-primary text-primary-foreground font-semibold text-sm shadow-sm transition-all active:scale-[0.98]"
                      : "h-9 rounded-md border border-border bg-background hover:bg-secondary text-foreground font-semibold text-sm transition-colors"
                  }
                >
                  Kinematic (mm²/s)
                </button>
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
                  <SubSection title="Viscosity & Display">
                    <div className="grid grid-cols-3 gap-3">
                      <CompactInput
                        id="dynamic-viscosity"
                        label="Dynamic"
                        value={dynamicViscosity}
                        onChange={setDynamicViscosity}
                        onEnter={runCalculate}
                        suffix="mPa·s"
                        tooltip="Used when the dynamic basis is selected."
                      />
                      <CompactInput
                        id="kinematic-viscosity"
                        label="Kinematic"
                        value={kinematicViscosity}
                        onChange={setKinematicViscosity}
                        onEnter={runCalculate}
                        suffix="mm²/s"
                        tooltip="Used when the kinematic basis is selected."
                      />
                      <CompactInput
                        id="decimals"
                        label="Decimals"
                        value={decimals}
                        onChange={setDecimals}
                        onEnter={runCalculate}
                        min="0"
                        tooltip="How many digits to show in the Reynolds number."
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
              <div className="text-[13px] font-bold text-primary mb-1 uppercase tracking-wider">Reynolds Number</div>
              <div className="text-4xl font-extrabold text-foreground mb-1 tracking-tight">
                {results.valid ? fmt(results.reynolds, calcInputs.decimals) : "—"}
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                {results.valid ? `${results.regime} flow at ${fmt(results.velocity, 2)} m/s in a ${fmt(calcInputs.diameterMm, 1)} mm bore` : "Fix the highlighted inputs to see an answer"}
              </div>
            </div>

            {/* 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Regime</span>
                <span className="font-extrabold text-foreground">{results.valid ? results.regime : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Friction Factor</span>
                <span className="font-extrabold text-foreground">{results.valid ? fmt(results.frictionFactor, 5) : "—"}</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Flow Rate</span>
                <span className="font-extrabold text-foreground">
                  {results.valid ? `${fmt(results.volumetricFlow * 1000, 3)} L/s` : "—"}
                </span>
              </div>
            </div>

            {/* REGIME TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Regime</th>
                    <th className="p-2.5">Reynolds Range</th>
                    <th className="p-2.5 pr-3">Behaviour</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.regimes.map((row) => (
                    <tr key={row.label} className={row.current ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}>
                      <td className="p-2.5 pl-3 font-semibold text-foreground">
                        {row.label}
                        {row.current ? " (you)" : ""}
                      </td>
                      <td className="p-2.5 text-foreground">{row.range}</td>
                      <td className="p-2.5 pr-3 text-muted-foreground">{row.detail}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-secondary/30 border-t border-border">
                    <td className="p-2.5 pl-3 text-foreground">Friction factor basis</td>
                    <td className="p-2.5 text-foreground">—</td>
                    <td className="p-2.5 pr-3 text-emerald-600">{results.frictionNote}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* VELOCITY TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Velocity</th>
                    <th className="p-2.5 text-right">Reynolds Number</th>
                    <th className="p-2.5 pr-3 text-right w-[140px]">Regime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {results.velocityRows.map((row) => (
                    <tr
                      key={row.velocity}
                      className={Math.abs(row.velocity - calcInputs.velocity) < 0.001 ? "bg-secondary/20" : "hover:bg-secondary/20 transition-colors"}
                    >
                      <td className="p-2.5 pl-3 font-semibold text-foreground">{`${fmt(row.velocity, 2)} m/s`}</td>
                      <td className="p-2.5 text-right text-foreground">{fmt(row.reynolds, 0)}</td>
                      <td className="p-2.5 pr-3 text-right text-foreground">{row.regime}</td>
                    </tr>
                  ))}
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
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Pipe Bore</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.diameterM * 1000, 1)} mm`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cross-Section Area</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.flowArea * 1000000, 1)} mm²`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dynamic Viscosity</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.dynamicPaS * 1000, 3)} mPa·s`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Kinematic Viscosity</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.kinematic * 1000000, 3)} mm²/s`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Volumetric Flow</span>
                  <span className="text-base font-bold text-foreground">{`${fmt(results.volumetricFlow * 3600, 2)} m³/h`}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Viscosity Basis</span>
                  <span className="text-base font-bold text-foreground">
                    {calcInputs.viscosityMode === "dynamic" ? "Dynamic" : "Kinematic"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is a Reynolds Number Calculator?</h2>
            <p>
              A Reynolds number calculator tells you whether a flow is smooth and orderly or chaotic and mixing. It combines
              fluid density, velocity, pipe diameter and viscosity into a single dimensionless figure, classifies the result as
              laminar, transitional or turbulent, and estimates the friction factor that goes with it.
            </p>
            <p>
              The number is the first thing an engineer calculates on any flow problem because it decides which set of equations
              applies. Laminar flow follows simple relationships and needs less pumping energy, while turbulent flow mixes far
              better but costs much more pressure to push through the same pipe. Everything from blood vessels to gas pipelines
              is designed around that distinction.
            </p>

            <h2 className="text-2xl font-bold mb-3">How It Works</h2>
            <p>
              The calculator divides inertial forces by viscous forces. In practical terms it multiplies density, velocity and
              diameter, then divides by viscosity. Because the formula is unit-sensitive, the tool converts millimetres to metres
              and millipascal seconds to pascal seconds before dividing, so results stay consistent whichever units you prefer.
            </p>
            <p>
              Viscosity can be entered either as dynamic viscosity in millipascal seconds or as kinematic viscosity in square
              millimetres per second. The kinematic form already includes density, so the calculator divides velocity times
              diameter by it directly. Water at twenty degrees Celsius sits close to one in both units, which makes it a useful
              reference fluid.
            </p>

            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p>
              The primary card shows the Reynolds number with the regime and velocity behind it. The three-stat bar reports the
              regime, the friction factor and the volumetric flow rate, since a fast-looking velocity in a small bore can still
              carry a modest flow. The first table explains each regime and names the friction factor relationship used.
            </p>
            <p>
              Use the second table to see how sensitive the answer is to velocity. Because the Reynolds number is directly
              proportional to speed, doubling velocity doubles it, which often pushes a carefully designed laminar system into
              turbulence. The row matching your input is highlighted so the crossover point is easy to spot.
            </p>
            <p>
              Treat the transitional band with caution. Between roughly two thousand three hundred and four thousand the flow
              flickers between laminar and turbulent, and a single figure can move between them with small changes in temperature
              or roughness. Designers usually aim to stay clearly on one side of that range rather than inside it.
            </p>
            <p>
              Finally, remember that the friction factor here is an estimate for a smooth pipe. Real pipes have roughness that
              raises the factor at high Reynolds numbers, and fittings add losses the number cannot capture. For a full pressure
              drop calculation, combine this result with a pipe flow and head loss calculation.
            </p>
            <p>
              Keep a note of the fluid temperature alongside the number, because viscosity changes markedly with heat: water
              becomes noticeably thinner as it warms, and oils thicken sharply when cold. That single variable can move a
              borderline pipe from laminar to turbulent in the space of a morning start-up, so the temperature used in the
              calculation belongs with the result. Rechecking after a process change is quick, and it catches the cases where a
              small speed increase quietly pushed a line out of its original design envelope.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/reynolds-number-calculator" />
          <PopularCalculators exclude="/calculator/reynolds-number-calculator" />
        </div>
      </div>
    </>
  );
}
