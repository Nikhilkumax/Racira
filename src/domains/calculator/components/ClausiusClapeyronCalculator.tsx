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

type SolveFor = "p2" | "t2" | "dh" | "p1";
type TempUnit = "K" | "C" | "F";
type PressureUnit = "kPa" | "atm" | "mmHg" | "bar" | "psi";

interface Substance {
  key: string;
  label: string;
  dhVap: number;      // kJ/mol
  normalBpK: number;  // K at 1 atm
  criticalK: number;
}

interface ClausiusInputs {
  solveFor: SolveFor;
  p1: number;
  t1: number;
  p2: number;
  t2: number;
  dhVap: number;
  tempUnit: TempUnit;
  pressureUnit: PressureUnit;
  substanceKey: string;
  proMode: boolean;
}

interface CurvePoint {
  tempC: number;
  tempK: number;
  pressure: number;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface ClausiusResult {
  solved: number;
  solvedLabel: string;
  solvedUnit: string;
  p1K: number;
  p2K: number;
  t1K: number;
  t2K: number;
  dhVapUsed: number;
  dhJoules: number;
  lnRatio: number;
  inverseTempDelta: number;
  entropyOfVaporisation: number;
  troutonDeviation: number;
  slope: number;
  valid: boolean;
  warning: string;
  curve: CurvePoint[];
  rows: TableRow[];
}

const R = 8.314462618; // J/(mol·K)
const TROUTON = 88; // J/(mol·K) — Trouton's rule constant

const SUBSTANCES: Substance[] = [
  { key: "water", label: "Water", dhVap: 40.65, normalBpK: 373.15, criticalK: 647.1 },
  { key: "ethanol", label: "Ethanol", dhVap: 38.56, normalBpK: 351.5, criticalK: 514.0 },
  { key: "methanol", label: "Methanol", dhVap: 35.21, normalBpK: 337.8, criticalK: 512.6 },
  { key: "benzene", label: "Benzene", dhVap: 30.72, normalBpK: 353.2, criticalK: 562.0 },
  { key: "acetone", label: "Acetone", dhVap: 29.1, normalBpK: 329.2, criticalK: 508.1 },
  { key: "ammonia", label: "Ammonia", dhVap: 23.35, normalBpK: 239.8, criticalK: 405.5 },
  { key: "diethyl-ether", label: "Diethyl ether", dhVap: 26.52, normalBpK: 307.6, criticalK: 466.7 },
  { key: "custom", label: "Custom substance", dhVap: 40.65, normalBpK: 373.15, criticalK: 647.1 },
];

const PRESSURE_TO_KPA: Record<PressureUnit, number> = {
  kPa: 1,
  atm: 101.325,
  mmHg: 0.133322,
  bar: 100,
  psi: 6.894757,
};

const substanceOf = (k: string): Substance => SUBSTANCES.find((s) => s.key === k) ?? SUBSTANCES[0];

const toKelvin = (v: number, unit: TempUnit): number =>
  unit === "K" ? v : unit === "C" ? v + 273.15 : (v - 32) * (5 / 9) + 273.15;

const fromKelvin = (k: number, unit: TempUnit): number =>
  unit === "K" ? k : unit === "C" ? k - 273.15 : (k - 273.15) * (9 / 5) + 32;

const toKPa = (v: number, unit: PressureUnit): number => v * PRESSURE_TO_KPA[unit];
const fromKPa = (kpa: number, unit: PressureUnit): number => kpa / PRESSURE_TO_KPA[unit];

const calculateClausius = (i: ClausiusInputs): ClausiusResult => {
  const sub = substanceOf(i.substanceKey);

  let p1K = toKPa(Math.max(1e-9, i.p1), i.pressureUnit);
  let p2K = toKPa(Math.max(1e-9, i.p2), i.pressureUnit);
  let t1K = Math.max(1e-6, toKelvin(i.t1, i.tempUnit));
  let t2K = Math.max(1e-6, toKelvin(i.t2, i.tempUnit));
  let dhVapUsed = Math.max(1e-9, i.dhVap); // kJ/mol
  let dhJoules = dhVapUsed * 1000;

  let solved = 0;
  let solvedLabel = "";
  let solvedUnit = "";

  // Integrated Clausius-Clapeyron: ln(P2/P1) = -(ΔH/R) · (1/T2 − 1/T1)
  if (i.solveFor === "p2") {
    p2K = p1K * Math.exp(-(dhJoules / R) * (1 / t2K - 1 / t1K));
    solved = fromKPa(p2K, i.pressureUnit);
    solvedLabel = "Vapour pressure P₂";
    solvedUnit = i.pressureUnit;
  } else if (i.solveFor === "p1") {
    p1K = p2K / Math.exp(-(dhJoules / R) * (1 / t2K - 1 / t1K));
    solved = fromKPa(p1K, i.pressureUnit);
    solvedLabel = "Vapour pressure P₁";
    solvedUnit = i.pressureUnit;
  } else if (i.solveFor === "t2") {
    // 1/T2 = 1/T1 − (R/ΔH)·ln(P2/P1)
    const inv = 1 / t1K - (R / dhJoules) * Math.log(p2K / p1K);
    t2K = inv > 0 ? 1 / inv : NaN;
    solved = fromKelvin(t2K, i.tempUnit);
    solvedLabel = "Temperature T₂";
    solvedUnit = `°${i.tempUnit === "K" ? "K" : i.tempUnit}`;
  } else {
    // ΔH = −R·ln(P2/P1) / (1/T2 − 1/T1)
    const denom = 1 / t2K - 1 / t1K;
    dhJoules = denom !== 0 ? (-R * Math.log(p2K / p1K)) / denom : NaN;
    dhVapUsed = dhJoules / 1000;
    solved = dhVapUsed;
    solvedLabel = "Enthalpy of vaporisation ΔH";
    solvedUnit = "kJ/mol";
  }

  const lnRatio = Math.log(p2K / p1K);
  const inverseTempDelta = 1 / t2K - 1 / t1K;

  // Trouton's rule sanity check: ΔH/Tb ≈ 88 J/(mol·K) for normal liquids
  const entropyOfVaporisation = sub.normalBpK > 0 ? dhJoules / sub.normalBpK : 0;
  const troutonDeviation = ((entropyOfVaporisation - TROUTON) / TROUTON) * 100;

  // Slope of the linearised plot: ln P versus 1/T has slope −ΔH/R
  const slope = -dhJoules / R;

  // The derivation assumes ideal vapour and constant ΔH — both fail near the critical point
  const nearCritical = Math.max(t1K, t2K) > sub.criticalK * 0.85;
  const wideRange = Math.abs(t2K - t1K) > 100;
  const valid = !nearCritical && !wideRange && isFinite(solved);

  let warning = "";
  if (!isFinite(solved)) {
    warning = "No physical solution for these inputs — check that the pressures and temperatures are consistent.";
  } else if (nearCritical) {
    warning = `Temperatures approach the critical point of ${sub.label} (${sub.criticalK.toFixed(1)} K). The ideal-gas assumption breaks down and the result will understate reality.`;
  } else if (wideRange) {
    warning = `A ${Math.abs(t2K - t1K).toFixed(0)} K span is wide for the constant-ΔH assumption. Expect a few percent of error; use the Antoine equation for accuracy across large ranges.`;
  }

  // Vapour pressure curve either side of the working range
  const curve: CurvePoint[] = [];
  const lo = Math.max(1, Math.min(t1K, t2K) - 40);
  const hi = Math.max(t1K, t2K) + 40;
  for (let s = 0; s <= 40; s++) {
    const tK = lo + ((hi - lo) / 40) * s;
    const p = p1K * Math.exp(-(dhJoules / R) * (1 / tK - 1 / t1K));
    curve.push({
      tempK: Math.round(tK * 10) / 10,
      tempC: Math.round((tK - 273.15) * 10) / 10,
      pressure: Math.round(fromKPa(p, i.pressureUnit) * 1000) / 1000,
    });
  }

  const pu = i.pressureUnit;
  const tu = i.tempUnit === "K" ? "K" : `°${i.tempUnit}`;

  const rows: TableRow[] = [
    { rowId: "sub", label: "Substance", value: sub.label },
    { rowId: "p1", label: "Pressure P₁", value: `${fromKPa(p1K, pu).toPrecision(5)} ${pu}` },
    { rowId: "t1", label: "Temperature T₁", value: `${fromKelvin(t1K, i.tempUnit).toFixed(2)} ${tu} (${t1K.toFixed(2)} K)` },
    { rowId: "p2", label: "Pressure P₂", value: `${fromKPa(p2K, pu).toPrecision(5)} ${pu}` },
    { rowId: "t2", label: "Temperature T₂", value: `${fromKelvin(t2K, i.tempUnit).toFixed(2)} ${tu} (${t2K.toFixed(2)} K)` },
    { rowId: "dh", label: "Enthalpy of vaporisation ΔH", value: `${dhVapUsed.toFixed(3)} kJ/mol` },
    { rowId: "solved", label: `Solved for — ${solvedLabel}`, value: `${solved.toPrecision(6)} ${solvedUnit}`, key: true },
    { rowId: "lnratio", label: "ln(P₂ / P₁)", value: lnRatio.toFixed(5) },
    { rowId: "invt", label: "1/T₂ − 1/T₁", value: `${inverseTempDelta.toExponential(4)} K⁻¹` },
    { rowId: "r", label: "Gas constant R", value: "8.31446 J/(mol·K)" },
    ...(i.proMode
      ? [
          { rowId: "slope", label: "Slope of ln P vs 1/T plot (−ΔH/R)", value: `${slope.toFixed(1)} K` },
          { rowId: "entropy", label: "Entropy of vaporisation ΔH/T_b", value: `${entropyOfVaporisation.toFixed(2)} J/(mol·K)` },
          { rowId: "trouton", label: "Deviation from Trouton's rule (88)", value: `${troutonDeviation >= 0 ? "+" : ""}${troutonDeviation.toFixed(1)}%` },
        ]
      : []),
    { rowId: "valid", label: "Model validity", value: valid ? "Within assumptions" : "Check warning", total: true },
  ];

  return {
    solved, solvedLabel, solvedUnit, p1K, p2K, t1K, t2K, dhVapUsed, dhJoules,
    lnRatio, inverseTempDelta, entropyOfVaporisation, troutonDeviation, slope,
    valid, warning, curve, rows,
  };
};

const DEFAULTS: ClausiusInputs = {
  solveFor: "p2",
  p1: 101.325,
  t1: 100,
  p2: 50,
  t2: 80,
  dhVap: 40.65,
  tempUnit: "C",
  pressureUnit: "kPa",
  substanceKey: "water",
  proMode: false,
};

const FAQS = [
  {
    question: "What is the Clausius-Clapeyron equation?",
    answer:
      "It relates the vapour pressure of a substance to its temperature. The integrated two-point form — ln(P₂/P₁) equals minus ΔH over R, times the quantity 1/T₂ minus 1/T₁ — lets you find any one of the four quantities when you know the other three. It is one of the most-used relationships in physical chemistry because it connects a quantity that is easy to measure, pressure, to one that is hard to measure directly, the enthalpy of a phase change.",
  },
  {
    question: "Why must temperature be in Kelvin?",
    answer:
      "Because the equation contains 1/T, and reciprocals are only meaningful on an absolute scale. Using Celsius produces nonsense — at 0 °C you would be dividing by zero, and below it the sign flips. This calculator accepts Celsius and Fahrenheit for convenience but converts to Kelvin internally before doing any arithmetic, and shows both in the breakdown so you can verify the conversion.",
  },
  {
    question: "What assumptions does the equation make?",
    answer:
      "Three, and all three eventually fail. It assumes the vapour behaves as an ideal gas, that the volume of the liquid is negligible compared with the vapour, and that the enthalpy of vaporisation is constant across the temperature range. The first two are excellent well below the critical point. The third is the one that bites: ΔH falls as temperature rises, reaching zero at the critical point, so wide temperature spans accumulate error. This calculator warns you when your inputs stray outside the safe region.",
  },
  {
    question: "How do I find the enthalpy of vaporisation experimentally?",
    answer:
      "Measure vapour pressure at several temperatures, plot the natural log of pressure against the reciprocal of absolute temperature, and fit a straight line. The slope equals minus ΔH divided by R, so multiplying the slope by minus 8.314 gives ΔH in joules per mole. This is the standard undergraduate physical chemistry experiment, and the linearity of that plot is itself the evidence that the assumptions hold over your range. Professional Mode reports the slope directly.",
  },
  {
    question: "What is Trouton's rule and why does the calculator check it?",
    answer:
      "Trouton's rule observes that the entropy of vaporisation — ΔH divided by the normal boiling point — is roughly 88 joules per mole-kelvin for most liquids, because vaporisation produces a similar increase in disorder regardless of substance. It is a useful sanity check: a computed ΔH that implies an entropy far from 88 suggests either an arithmetic error or a substance with strong hydrogen bonding. Water deviates upward, at about 109, precisely because its hydrogen-bond network is unusually ordered in the liquid state.",
  },
  {
    question: "Why does water boil at a lower temperature at altitude?",
    answer:
      "Boiling occurs when vapour pressure equals ambient pressure, so lowering the ambient pressure lowers the boiling point. Denver sits at about 84 kPa, which puts water's boiling point near 95 °C; on Everest at roughly 34 kPa it is around 71 °C. You can verify both figures with this calculator by solving for T₂ with P₁ at 101.325 kPa and T₁ at 100 °C. The practical consequence is that food cooks more slowly at altitude — the water is boiling but it is not as hot.",
  },
  {
    question: "Can this be used for sublimation?",
    answer:
      "Yes, with the enthalpy of sublimation in place of vaporisation. The same derivation applies to any first-order phase transition where one phase is a gas, so the solid-to-gas line on a phase diagram obeys the identical relationship. Note that the enthalpy of sublimation is approximately the sum of the enthalpies of fusion and vaporisation, and that sublimation lines are steeper than vaporisation lines because ΔH_sub is larger.",
  },
  {
    question: "What is the difference between the differential and integrated forms?",
    answer:
      "The differential form, dP/dT equals L divided by T times the volume change, is the exact statement and applies to any first-order phase transition including solid-liquid. The integrated form used here is what you get after assuming an ideal vapour, neglecting liquid volume, and holding ΔH constant so the expression can be integrated in closed form. The differential form is more general and more accurate; the integrated form is what makes the relationship practically useful with two data points instead of a full dataset.",
  },
];

const ClausiusClapeyronCalculator = () => {
  const [inputs, setInputs] = useState<ClausiusInputs>(DEFAULTS);
  const [result, setResult] = useState<ClausiusResult>(calculateClausius(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateClausius(DEFAULTS));
  }, []);

  const set = <K extends keyof ClausiusInputs>(key: K, val: ClausiusInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const pickSubstance = (key: string) => {
    const s = substanceOf(key);
    setInputs((prev) => ({ ...prev, substanceKey: key, dhVap: key === "custom" ? prev.dhVap : s.dhVap }));
  };

  const handleCalculate = () => setResult(calculateClausius(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateClausius(DEFAULTS));
    setShowAdvanced(false);
  };

  const wrap =
    "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel =
    "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium text-foreground mb-1";
  const disabled = "opacity-50 pointer-events-none";
  const tu = inputs.tempUnit === "K" ? "K" : `°${inputs.tempUnit}`;

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Science", href: "/calculator#science" },
          { label: "Clausius-Clapeyron Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Clausius-Clapeyron Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* INPUTS */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="bg-secondary/30 border border-border rounded-lg p-3 text-center">
              <div className="text-sm font-mono text-foreground">
                ln(P₂/P₁) = −(ΔH<sub>vap</sub>/R) · (1/T₂ − 1/T₁)
              </div>
            </div>

            <div className="flex flex-col">
              <label className={lbl}>Solve For</label>
              <select value={inputs.solveFor} onChange={(e) => set("solveFor", e.target.value as SolveFor)} className={sel}>
                <option value="p2">Vapour pressure P₂</option>
                <option value="t2">Temperature T₂</option>
                <option value="dh">Enthalpy of vaporisation ΔH</option>
                <option value="p1">Vapour pressure P₁</option>
              </select>
            </div>

            <div className={`grid grid-cols-2 gap-3 ${inputs.solveFor === "p1" ? disabled : ""}`}>
              <div className="flex flex-col">
                <label className={lbl}>Pressure P₁</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.p1}
                    onChange={(e) => set("p1", parseFloat(e.target.value) || 0)}
                    className={ci}
                    step="any"
                    min={0}
                  />
                  <span className="pr-3 text-sm text-muted-foreground select-none">{inputs.pressureUnit}</span>
                </div>
              </div>
              <div className="flex flex-col">
                <label className={lbl}>Temperature T₁</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.t1}
                    onChange={(e) => set("t1", parseFloat(e.target.value) || 0)}
                    className={ci}
                    step="any"
                  />
                  <span className="pr-3 text-sm text-muted-foreground select-none">{tu}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className={`flex flex-col ${inputs.solveFor === "p2" ? disabled : ""}`}>
                <label className={lbl}>Pressure P₂</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.p2}
                    onChange={(e) => set("p2", parseFloat(e.target.value) || 0)}
                    className={ci}
                    step="any"
                    min={0}
                  />
                  <span className="pr-3 text-sm text-muted-foreground select-none">{inputs.pressureUnit}</span>
                </div>
              </div>
              <div className={`flex flex-col ${inputs.solveFor === "t2" ? disabled : ""}`}>
                <label className={lbl}>Temperature T₂</label>
                <div className={wrap}>
                  <input
                    type="number"
                    value={inputs.t2}
                    onChange={(e) => set("t2", parseFloat(e.target.value) || 0)}
                    className={ci}
                    step="any"
                  />
                  <span className="pr-3 text-sm text-muted-foreground select-none">{tu}</span>
                </div>
              </div>
            </div>

            <div className={`flex flex-col ${inputs.solveFor === "dh" ? disabled : ""}`}>
              <label className={lbl}>Enthalpy of Vaporisation ΔH</label>
              <div className={wrap}>
                <input
                  type="number"
                  value={inputs.dhVap}
                  onChange={(e) => set("dhVap", parseFloat(e.target.value) || 0)}
                  className={ci}
                  step="any"
                  min={0}
                />
                <span className="pr-3 text-sm text-muted-foreground select-none">kJ/mol</span>
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
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Substance</div>
                  <select value={inputs.substanceKey} onChange={(e) => pickSubstance(e.target.value)} className={sel}>
                    {SUBSTANCES.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                        {s.key !== "custom" ? ` — ΔH ${s.dhVap} kJ/mol` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Selecting a substance fills in its literature ΔH and enables the critical-point validity check.
                  </p>
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Units</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className={lbl}>Temperature</label>
                      <select value={inputs.tempUnit} onChange={(e) => set("tempUnit", e.target.value as TempUnit)} className={sel}>
                        <option value="C">Celsius (°C)</option>
                        <option value="K">Kelvin (K)</option>
                        <option value="F">Fahrenheit (°F)</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className={lbl}>Pressure</label>
                      <select
                        value={inputs.pressureUnit}
                        onChange={(e) => set("pressureUnit", e.target.value as PressureUnit)}
                        className={sel}
                      >
                        <option value="kPa">Kilopascal (kPa)</option>
                        <option value="atm">Atmosphere (atm)</option>
                        <option value="mmHg">Millimetre Hg (mmHg)</option>
                        <option value="bar">Bar</option>
                        <option value="psi">PSI</option>
                      </select>
                    </div>
                  </div>
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
                    Adds the linearised-plot slope, entropy of vaporisation, and a Trouton&apos;s rule cross-check.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={handleCalculate}
                className="flex-1 w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-base"
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
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">{result.solvedLabel}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-primary tracking-tight">
                  {isFinite(result.solved) ? result.solved.toPrecision(6) : "—"}
                </div>
                <div className="text-lg font-semibold text-muted-foreground">{result.solvedUnit}</div>
              </div>
              <div className="text-sm font-medium text-muted-foreground mt-2">
                ln(P₂/P₁) = {result.lnRatio.toFixed(4)} &middot; ΔH {result.dhVapUsed.toFixed(2)} kJ/mol &middot;{" "}
                <span
                  className="font-semibold"
                  style={{ color: result.valid ? "hsl(142 71% 45%)" : "hsl(25 95% 53%)" }}
                >
                  {result.valid ? "within model assumptions" : "assumptions strained"}
                </span>
              </div>
            </div>

            {result.warning && (
              <div
                className="rounded-lg p-4 border-l-4"
                style={{ borderColor: "hsl(25 95% 53%)", backgroundColor: "hsl(25 95% 53% / 0.1)" }}
              >
                <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: "hsl(25 95% 53%)" }}>
                  Validity Warning
                </div>
                <p className="text-sm text-foreground">{result.warning}</p>
              </div>
            )}

            {/* 2. Three-stat bar */}
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">T₁ → T₂</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(217 91% 60%)" }}>
                  {(result.t2K - result.t1K).toFixed(1)} K
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {result.t1K.toFixed(1)} → {result.t2K.toFixed(1)} K
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Pressure Ratio</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>
                  {(result.p2K / result.p1K).toFixed(3)}×
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">P₂ / P₁</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">ΔH</div>
                <div className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>
                  {result.dhVapUsed.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">kJ/mol</div>
              </div>
            </div>

            {/* 3. Breakdown table */}
            <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
              <h3 className="text-base font-bold text-foreground mb-3">Calculation Breakdown</h3>
              <table className="w-full text-base border-collapse">
                <tbody>
                  {result.rows.map((r) => (
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
              <h3 className="text-base font-bold text-foreground mb-1">Vapour Pressure Curve</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Vapour pressure against temperature for ΔH = {result.dhVapUsed.toFixed(2)} kJ/mol. The exponential shape is the
                signature of the Clausius-Clapeyron relationship — pressure rises far faster than temperature.
              </p>
              <div style={{ height: 250 }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={result.curve} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 16% 65% / 0.25)" />
                      <XAxis dataKey="tempK" tick={{ fontSize: 11 }} stroke="hsl(215 16% 65%)" unit=" K" />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="hsl(215 16% 65%)"
                        width={64}
                        tickFormatter={(v: number) => v.toPrecision(3)}
                      />
                      <RTooltip
                        formatter={(v: number) => [`${v.toPrecision(5)} ${inputs.pressureUnit}`, "Vapour pressure"]}
                        labelFormatter={(l: number) => `${l} K (${(Number(l) - 273.15).toFixed(1)} °C)`}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <ReferenceLine
                        x={Math.round(result.t1K * 10) / 10}
                        stroke="hsl(215 16% 65%)"
                        strokeDasharray="4 4"
                        label={{ value: "T₁", fontSize: 10, position: "insideTopLeft" }}
                      />
                      <ReferenceLine
                        x={Math.round(result.t2K * 10) / 10}
                        stroke="hsl(0 84% 60%)"
                        strokeDasharray="4 4"
                        label={{ value: "T₂", fontSize: 10, position: "insideTopRight" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pressure"
                        name={`Vapour pressure (${inputs.pressureUnit})`}
                        stroke="hsl(217 91% 60%)"
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>

            {/* 5. Summary statistics — same rows as the breakdown table */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {result.rows.map((r) => (
                  <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`tabular-nums text-right ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {inputs.proMode
                  ? `An entropy of vaporisation of ${result.entropyOfVaporisation.toFixed(1)} J/(mol·K) is ${Math.abs(result.troutonDeviation).toFixed(0)}% ${result.troutonDeviation >= 0 ? "above" : "below"} Trouton's rule of 88. Large positive deviations indicate hydrogen bonding in the liquid, as in water and alcohols.`
                  : "Turn on Professional Mode for the linearised-plot slope, entropy of vaporisation, and a Trouton's rule cross-check."}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Clausius-Clapeyron Equation Describes</h2>
            <p>
              Every liquid exerts a vapour pressure: molecules escape the surface into the gas phase until escape and return
              balance. That pressure rises with temperature, and it rises <em>exponentially</em> rather than linearly. The
              Clausius-Clapeyron equation is the quantitative statement of that relationship, derived from the requirement that
              two phases in equilibrium have equal chemical potential.
            </p>
            <p>
              The integrated two-point form used here — the natural log of the pressure ratio equals minus ΔH over R, times the
              difference of reciprocal temperatures — is the workhorse version. Given any three of the four quantities it returns
              the fourth, which is why it appears in every physical chemistry course and in a great deal of practical engineering.
              Boiling is simply the special case where vapour pressure reaches ambient pressure, so every question about boiling
              points at altitude, in vacuum, or under pressure is this equation in disguise.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Temperature Must Be Absolute</h2>
            <p>
              The single most common error in applying this equation is using Celsius. The expression contains 1/T, and a
              reciprocal only carries physical meaning on an absolute scale where zero means zero thermal energy. At 0 °C the
              Celsius reciprocal is undefined; below it, the sign inverts and the result becomes nonsense rather than merely
              inaccurate.
            </p>
            <p>
              This calculator accepts Celsius and Fahrenheit because that is how temperatures are usually recorded, but it
              converts to Kelvin before any arithmetic and displays both values in the breakdown table so the conversion is
              auditable. If you are checking work done by hand, the Kelvin figures in that table are the ones to compare against.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Three Assumptions and Where They Fail</h2>
            <p>
              The integrated form is not exact. Reaching it requires three simplifications: that the vapour behaves ideally, that
              the liquid&apos;s molar volume is negligible beside the vapour&apos;s, and that ΔH is constant over the temperature
              range. The first two hold very well at pressures and temperatures far below the critical point, where vapour is
              dilute and liquid volume is genuinely tiny by comparison.
            </p>
            <p>
              The constant-ΔH assumption is the one that fails first. Enthalpy of vaporisation decreases as temperature rises,
              falling to exactly zero at the critical point, where the distinction between liquid and gas disappears entirely.
              Over a 20 K span the error is negligible; over 100 K it becomes several percent; approaching the critical point the
              equation fails outright. This calculator flags both conditions — wide spans and proximity to the critical
              temperature of the selected substance — rather than silently returning a confident wrong answer. When you need
              accuracy across a wide range, the Antoine equation with fitted empirical constants is the correct tool.
            </p>

            <h2 className="text-2xl font-bold mb-3">Practical Uses: Altitude, Vacuum, and Measuring ΔH</h2>
            <p>
              The everyday application is boiling point at altitude. Denver&apos;s 84 kPa puts water&apos;s boiling point near
              95 °C; the summit of Everest at roughly 34 kPa brings it to about 71 °C. Food cooks more slowly not because the water
              boils reluctantly but because boiling water is simply not as hot, which is why pressure cookers exist — raising the
              pressure raises the boiling point and speeds the chemistry.
            </p>
            <p>
              In the laboratory the equation is more often run in reverse, to measure ΔH. Record vapour pressure at several
              temperatures, plot the natural log of pressure against reciprocal absolute temperature, and fit a line: the slope is
              minus ΔH over R. The linearity of that plot is itself the evidence that the assumptions hold across your range,
              which makes the experiment self-validating. Professional Mode reports that slope along with the entropy of
              vaporisation and its deviation from Trouton&apos;s rule — a quick check that a computed ΔH is physically plausible,
              since most normal liquids cluster near 88 J/(mol·K) and large positive deviations reliably signal hydrogen bonding.
            </p>
          </section>
          <FAQSection faqs={FAQS} pageUrl="https://racira.com/calculator/clausius-clapeyron-calculator" />
          <PopularCalculators exclude="/calculator/clausius-clapeyron-calculator" />
        </div>
      </div>
    </>
  );
};

export default ClausiusClapeyronCalculator;
