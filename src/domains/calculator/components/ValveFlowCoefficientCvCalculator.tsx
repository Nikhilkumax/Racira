"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Gauge, Droplets, Wind } from "lucide-react";
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

type FluidPhase = "liquid" | "gas" | "steam";
type ValveStyle = "globe" | "ballSegmented" | "butterfly" | "gate";

interface ValveSpec {
  key: ValveStyle;
  label: string;
  fl: number;
  cvPerInchSquared: number;
}

interface CvInputs {
  phase: FluidPhase;
  flowGpm: number;
  inletPressure: number;
  outletPressure: number;
  specificGravity: number;
  gasFlowScfh: number;
  inletTempF: number;
  molecularWeight: number;
  steamFlowLbHr: number;
  proMode: boolean;
  valveStyle: ValveStyle;
  vaporPressure: number;
  pipeDiameterIn: number;
}

interface ChartPoint {
  name: string;
  cv: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface CvResult {
  pressureDrop: number;
  cv: number;
  kv: number;
  chokedDeltaP: number;
  isChoked: boolean;
  chokedNote: string;
  chokedColor: string;
  cavitationIndex: number;
  cavitationRisk: string;
  cavitationColor: string;
  requiredValveSizeIn: number;
  velocityFtS: number;
  pressureDropRatio: number;
  chartData: ChartPoint[];
  rows: TableRow[];
  recommendedOpeningPercent: number;
}

// FL is the liquid pressure recovery factor; higher values choke later.
const VALVE_STYLES: ValveSpec[] = [
  { key: "globe", label: "Globe (single-seat)", fl: 0.9, cvPerInchSquared: 10 },
  { key: "ballSegmented", label: "Segmented ball", fl: 0.6, cvPerInchSquared: 25 },
  { key: "butterfly", label: "Butterfly (60° open)", fl: 0.68, cvPerInchSquared: 18 },
  { key: "gate", label: "Gate (full open)", fl: 0.95, cvPerInchSquared: 30 },
];

const KV_PER_CV = 0.865;

const DEFAULTS: CvInputs = {
  phase: "liquid",
  flowGpm: 150,
  inletPressure: 100,
  outletPressure: 60,
  specificGravity: 1.0,
  gasFlowScfh: 50000,
  inletTempF: 70,
  molecularWeight: 28.96,
  steamFlowLbHr: 5000,
  proMode: false,
  valveStyle: "globe",
  vaporPressure: 0.36,
  pipeDiameterIn: 3,
};

export function calculateCv(i: CvInputs): CvResult {
  const spec = VALVE_STYLES.find((v) => v.key === i.valveStyle) ?? VALVE_STYLES[0];

  const p1 = Math.max(0, i.inletPressure);
  const p2 = Math.max(0, i.outletPressure);
  const pressureDrop = Math.max(0.0001, p1 - p2);
  const sg = Math.max(0.01, i.specificGravity);

  // Choked flow limit: dP_choked = FL^2 (P1 - Ff Pv), with Ff the liquid
  // critical pressure ratio factor approximated as 0.96 - 0.28 sqrt(Pv/Pc).
  const pv = Math.max(0, i.vaporPressure);
  const ff = 0.96 - 0.28 * Math.sqrt(Math.min(1, pv / 3200));
  const chokedDeltaP = Math.pow(spec.fl, 2) * (p1 - ff * pv);
  const isChoked = i.phase === "liquid" && pressureDrop > chokedDeltaP && chokedDeltaP > 0;

  // When choked, additional pressure drop produces no additional flow, so the
  // sizing drop is capped at the choked value.
  const effectiveDeltaP = isChoked ? chokedDeltaP : pressureDrop;

  let cv: number;
  if (i.phase === "gas") {
    // ISA/Fisher universal gas sizing, subcritical form:
    // Cv = Q sqrt(SG T) / (1360 sqrt(dP (P1 + P2) / 2))  with T in Rankine.
    const tempRankine = Math.max(1, i.inletTempF + 459.67);
    const gasSg = Math.max(0.01, i.molecularWeight) / 28.96;
    const meanPressure = (p1 + 14.7 + (p2 + 14.7)) / 2;
    const denominator = 1360 * Math.sqrt(Math.max(0.0001, pressureDrop * meanPressure));
    cv = denominator > 0
      ? (Math.max(0, i.gasFlowScfh) * Math.sqrt(gasSg * tempRankine)) / denominator
      : 0;
  } else if (i.phase === "steam") {
    // Saturated steam, subcritical: Cv = W / (2.1 sqrt(dP (P1 + P2)))
    const denominator = 2.1 * Math.sqrt(Math.max(0.0001, pressureDrop * (p1 + 14.7 + p2 + 14.7)));
    cv = denominator > 0 ? Math.max(0, i.steamFlowLbHr) / denominator : 0;
  } else {
    // Liquid: Cv = Q sqrt(SG / dP)
    cv = Math.max(0, i.flowGpm) * Math.sqrt(sg / effectiveDeltaP);
  }

  const kv = cv * KV_PER_CV;

  // Cavitation index sigma = (P1 - Pv) / (P1 - P2). Lower values mean higher risk.
  const cavitationIndex = pressureDrop > 0 ? (p1 - pv) / pressureDrop : 0;

  let cavitationRisk: string;
  let cavitationColor: string;
  if (i.phase !== "liquid") {
    cavitationRisk = "Not applicable to compressible flow";
    cavitationColor = "text-muted-foreground";
  } else if (cavitationIndex >= 2.0) {
    cavitationRisk = "Low — incipient cavitation unlikely";
    cavitationColor = "text-emerald-600";
  } else if (cavitationIndex >= 1.5) {
    cavitationRisk = "Moderate — audible cavitation possible";
    cavitationColor = "text-amber-600";
  } else {
    cavitationRisk = "High — damaging cavitation likely, use anti-cavitation trim";
    cavitationColor = "text-red-600";
  }

  const chokedNote = isChoked
    ? "Choked — extra pressure drop yields no extra flow"
    : "Not choked — flow responds to pressure drop";
  const chokedColor = isChoked ? "text-red-600" : "text-emerald-600";

  // Approximate valve size from the style's Cv per square inch of port area.
  const requiredArea = spec.cvPerInchSquared > 0 ? cv / spec.cvPerInchSquared : 0;
  const requiredValveSizeIn = requiredArea > 0 ? 2 * Math.sqrt(requiredArea / Math.PI) : 0;

  // Line velocity for the liquid case, ft/s, from GPM and pipe diameter.
  const dia = Math.max(0.1, i.pipeDiameterIn);
  const pipeAreaFt2 = (Math.PI * Math.pow(dia / 12, 2)) / 4;
  const velocityFtS =
    i.phase === "liquid" && pipeAreaFt2 > 0
      ? (Math.max(0, i.flowGpm) / 448.831) / pipeAreaFt2
      : 0;

  const pressureDropRatio = p1 > 0 ? (pressureDrop / p1) * 100 : 0;

  // Control valves should operate between roughly 20% and 80% of rated Cv.
  const recommendedOpeningPercent = 65;

  const chartData: ChartPoint[] = VALVE_STYLES.map((v) => {
    const styleChoked = Math.pow(v.fl, 2) * (p1 - ff * pv);
    const styleDeltaP =
      i.phase === "liquid" && pressureDrop > styleChoked && styleChoked > 0 ? styleChoked : pressureDrop;
    const styleCv =
      i.phase === "liquid" ? Math.max(0, i.flowGpm) * Math.sqrt(sg / Math.max(0.0001, styleDeltaP)) : cv;
    return { name: v.label, cv: styleCv, isSubject: v.key === i.valveStyle };
  });

  const num = (v: number, d = 2) =>
    v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const phaseLabel = i.phase === "liquid" ? "Liquid" : i.phase === "gas" ? "Gas" : "Saturated steam";

  const rows: TableRow[] = [
    { label: "Fluid Phase", value: phaseLabel },
    { label: "Inlet Pressure P₁", value: `${num(p1, 1)} psig` },
    { label: "Outlet Pressure P₂", value: `${num(p2, 1)} psig` },
    { label: "Pressure Drop ΔP", value: `${num(pressureDrop, 1)} psi (${num(pressureDropRatio, 1)}% of P₁)` },
    { label: "Flow Rate", value: i.phase === "liquid" ? `${num(i.flowGpm, 0)} GPM` : i.phase === "gas" ? `${num(i.gasFlowScfh, 0)} SCFH` : `${num(i.steamFlowLbHr, 0)} lb/hr` },
    { label: "Required Flow Coefficient Cv", value: num(cv, 2), key: true },
    { label: "Equivalent Kv (metric)", value: num(kv, 2) },
    { label: "Valve Style", value: `${spec.label} (F_L = ${spec.fl})` },
    { label: "Choked ΔP Limit", value: `${num(chokedDeltaP, 1)} psi` },
    { label: "Flow Condition", value: chokedNote },
    { label: "Cavitation Index σ", value: i.phase === "liquid" ? num(cavitationIndex, 2) : "n/a" },
    { label: "Approx. Required Port Size", value: `${num(requiredValveSizeIn, 2)} in` },
  ];

  return {
    pressureDrop,
    cv,
    kv,
    chokedDeltaP,
    isChoked,
    chokedNote,
    chokedColor,
    cavitationIndex,
    cavitationRisk,
    cavitationColor,
    requiredValveSizeIn,
    velocityFtS,
    pressureDropRatio,
    chartData,
    rows,
    recommendedOpeningPercent,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function ValveFlowCoefficientCvCalculator() {
  const [inputs, setInputs] = useState<CvInputs>(DEFAULTS);
  const [result, setResult] = useState<CvResult>(calculateCv(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateCv(inputs));
  }, []);

  const calculate = () => setResult(calculateCv(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateCv(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof CvInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "What is the valve flow coefficient Cv?",
      answer:
        "Cv is the number of US gallons per minute of 60 °F water that will pass through a valve at a pressure drop of 1 psi. It is a capacity rating, not a physical dimension: a valve with Cv = 100 passes 100 GPM at 1 psi drop, and because flow scales with the square root of pressure drop, the same valve passes about 316 GPM at 10 psi. The metric equivalent, Kv, is measured in m³/h at 1 bar and equals roughly 0.865 times Cv.",
    },
    {
      question: "How do I calculate Cv for a liquid?",
      answer:
        "Cv = Q × √(SG / ΔP), where Q is flow in GPM, SG is specific gravity relative to water, and ΔP is pressure drop in psi. For 150 GPM of water across a 40 psi drop, Cv = 150 × √(1/40) ≈ 23.7. Denser fluids need more capacity for the same volumetric flow, which is why specific gravity appears under the root. The equation assumes turbulent, non-choked, non-flashing flow.",
    },
    {
      question: "What is choked flow and when does it happen?",
      answer:
        "Choked flow occurs when the pressure at the valve's vena contracta drops to the fluid's vapour pressure. Beyond that point, increasing the pressure drop produces no additional flow — the valve is at its hydraulic limit. The threshold is ΔP_choked = F_L²(P₁ − F_f·P_v), where F_L is the pressure recovery factor. Sizing a valve using the actual drop rather than the choked limit undersizes it, sometimes badly, which is why this calculator caps ΔP at the choked value.",
    },
    {
      question: "What is the pressure recovery factor F_L?",
      answer:
        "F_L describes how much pressure a valve recovers downstream of its vena contracta. High-recovery valves such as butterfly and segmented ball designs have low F_L, around 0.6 to 0.7, and choke and cavitate at relatively modest pressure drops. Low-recovery globe valves have F_L near 0.9 and tolerate much higher drops before choking. This is why valve style, not just size, matters for high-differential service.",
    },
    {
      question: "How is cavitation different from flashing?",
      answer:
        "Both begin identically — the pressure at the vena contracta falls below vapour pressure and bubbles form. In cavitation, downstream pressure recovers above vapour pressure and the bubbles collapse violently, producing the characteristic gravel noise and pitting the trim. In flashing, downstream pressure stays below vapour pressure, so the bubbles persist and the fluid leaves the valve as a two-phase mixture. Cavitation destroys valves; flashing erodes them and requires hardened trim plus larger downstream piping.",
    },
    {
      question: "Why does gas sizing use a different equation?",
      answer:
        "Because gases are compressible, so density changes as pressure drops across the valve. The gas equation includes absolute temperature, molecular weight, and the mean of inlet and outlet absolute pressures rather than treating density as constant. Gas flow also chokes at a fixed pressure ratio — roughly 0.5 for air — rather than at a vapour pressure, so critical flow behaviour is governed by different physics than the liquid case.",
    },
    {
      question: "How much margin should I add when sizing?",
      answer:
        "Aim for the valve to operate between roughly 20% and 80% of its rated Cv at normal conditions, with 60 to 70% a common target. Below 20% the plug sits close to the seat where control is poor and trim damage accelerates; above 80% there is no headroom for upsets or for fouling. Oversizing is the more common error and the more damaging one, because a grossly oversized valve spends its life nearly closed, where its inherent characteristic is least linear.",
    },
    {
      question: "Does Cv change with valve opening?",
      answer:
        "Yes — the published Cv is the fully open value, and the relationship between travel and capacity is the valve's inherent characteristic. Equal-percentage trim gives equal fractional increases in Cv per unit of travel and suits most control loops where valve pressure drop varies with flow. Linear trim gives proportional change and suits constant-drop applications. Quick-opening trim delivers most of its capacity in the first portion of travel and is used for on-off service rather than modulation.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Construction", href: "/calculator#construction" },
          { label: "Valve Flow Coefficient (Cv) Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Valve Flow Coefficient (Cv) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label htmlFor="phase" className={lbl}>Fluid Phase</label>
                <select id="phase" className={inp} value={inputs.phase}
                  onChange={(e) => setInputs((p) => ({ ...p, phase: e.target.value as FluidPhase }))}>
                  <option value="liquid">Liquid</option>
                  <option value="gas">Gas</option>
                  <option value="steam">Saturated steam</option>
                </select>
              </div>
              {inputs.phase === "liquid" ? (
                <div>
                  <label htmlFor="flowGpm" className={lbl}>Flow (GPM)</label>
                  <input id="flowGpm" type="number" min="0" step="10" className={inp} value={inputs.flowGpm}
                    onChange={(e) => setNum("flowGpm", e.target.value)} />
                </div>
              ) : inputs.phase === "gas" ? (
                <div>
                  <label htmlFor="gasFlowScfh" className={lbl}>Flow (SCFH)</label>
                  <input id="gasFlowScfh" type="number" min="0" step="1000" className={inp} value={inputs.gasFlowScfh}
                    onChange={(e) => setNum("gasFlowScfh", e.target.value)} />
                </div>
              ) : (
                <div>
                  <label htmlFor="steamFlowLbHr" className={lbl}>Flow (lb/hr)</label>
                  <input id="steamFlowLbHr" type="number" min="0" step="100" className={inp} value={inputs.steamFlowLbHr}
                    onChange={(e) => setNum("steamFlowLbHr", e.target.value)} />
                </div>
              )}
              <div>
                <label htmlFor="inletPressure" className={lbl}>Inlet P₁ (psig)</label>
                <input id="inletPressure" type="number" min="0" step="5" className={inp} value={inputs.inletPressure}
                  onChange={(e) => setNum("inletPressure", e.target.value)} />
              </div>
              <div>
                <label htmlFor="outletPressure" className={lbl}>Outlet P₂ (psig)</label>
                <input id="outletPressure" type="number" min="0" step="5" className={inp} value={inputs.outletPressure}
                  onChange={(e) => setNum("outletPressure", e.target.value)} />
              </div>
              {inputs.phase === "liquid" ? (
                <div>
                  <label htmlFor="specificGravity" className={lbl}>Specific Gravity</label>
                  <input id="specificGravity" type="number" min="0.01" step="0.01" className={inp}
                    value={inputs.specificGravity} onChange={(e) => setNum("specificGravity", e.target.value)} />
                </div>
              ) : inputs.phase === "gas" ? (
                <div>
                  <label htmlFor="molecularWeight" className={lbl}>Molecular Weight</label>
                  <input id="molecularWeight" type="number" min="0.1" step="0.1" className={inp}
                    value={inputs.molecularWeight} onChange={(e) => setNum("molecularWeight", e.target.value)} />
                </div>
              ) : null}
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
                      <Gauge className="h-3.5 w-3.5" /> Valve &amp; Fluid Properties
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="valveStyle" className={lbl}>Valve Style</label>
                        <select id="valveStyle" className={inp} value={inputs.valveStyle}
                          onChange={(e) => setInputs((p) => ({ ...p, valveStyle: e.target.value as ValveStyle }))}>
                          {VALVE_STYLES.map((v) => (
                            <option key={v.key} value={v.key}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="vaporPressure" className={lbl}>Vapour Pressure (psia)</label>
                        <input id="vaporPressure" type="number" min="0" step="0.1" className={inp}
                          value={inputs.vaporPressure} onChange={(e) => setNum("vaporPressure", e.target.value)} />
                      </div>
                      {inputs.phase === "gas" ? (
                        <div className="col-span-2">
                          <label htmlFor="inletTempF" className={lbl}>Inlet Temperature (°F)</label>
                          <input id="inletTempF" type="number" step="1" className={inp} value={inputs.inletTempF}
                            onChange={(e) => setNum("inletTempF", e.target.value)} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Wind className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock cavitation, sizing margin, and line velocity
                    </label>
                    {inputs.proMode ? (
                      <div>
                        <label htmlFor="pipeDiameterIn" className={lbl}>Pipe Diameter (in)</label>
                        <input id="pipeDiameterIn" type="number" min="0.1" step="0.5" className={inp}
                          value={inputs.pipeDiameterIn} onChange={(e) => setNum("pipeDiameterIn", e.target.value)} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Required Flow Coefficient</div>
              <div className="text-4xl font-bold text-primary my-1">Cv = {result.cv.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">
                Kv = {result.kv.toFixed(2)} — at ΔP of {result.pressureDrop.toFixed(1)} psi
              </div>
              <div className={`text-base font-bold mt-2 ${result.chokedColor}`}>{result.chokedNote}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cv</div>
                <div className="text-lg font-bold text-emerald-600">{result.cv.toFixed(1)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">ΔP / P₁</div>
                <div className={`text-lg font-bold ${result.pressureDropRatio <= 30 ? "text-emerald-600" : result.pressureDropRatio <= 60 ? "text-amber-600" : "text-red-600"}`}>
                  {result.pressureDropRatio.toFixed(0)}%
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cavitation σ</div>
                <div className={`text-lg font-bold ${result.cavitationColor}`}>
                  {inputs.phase === "liquid" ? result.cavitationIndex.toFixed(2) : "n/a"}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Parameter</th>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Required Cv</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.cv.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Required Cv by Valve Style</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(value: number) => `Cv = ${value.toFixed(2)}`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={result.cv} stroke="#F59E0B" strokeDasharray="4 4" />
                    <Bar dataKey="cv" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isSubject ? "#2563EB" : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#2563EB" }} /> Selected style
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Alternative styles
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F59E0B" }} /> Your required Cv
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Droplets className="h-4 w-4 text-primary" /> Cavitation, Sizing Margin &amp; Velocity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cavitation Index σ</div>
                    <div className={`text-base font-bold ${result.cavitationColor}`}>
                      {inputs.phase === "liquid" ? result.cavitationIndex.toFixed(2) : "n/a"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Cavitation Assessment</div>
                    <div className={`text-base font-bold ${result.cavitationColor}`}>{result.cavitationRisk}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Rated Cv at 65% Opening</div>
                    <div className="text-base font-bold text-foreground">
                      {(result.cv / (result.recommendedOpeningPercent / 100)).toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Approx. Port Diameter</div>
                    <div className="text-base font-bold text-foreground">{result.requiredValveSizeIn.toFixed(2)} in</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Line Velocity</div>
                    <div className={`text-base font-bold ${result.velocityFtS <= 10 ? "text-emerald-600" : result.velocityFtS <= 15 ? "text-amber-600" : "text-red-600"}`}>
                      {inputs.phase === "liquid" ? `${result.velocityFtS.toFixed(1)} ft/s` : "n/a"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Choked ΔP Limit</div>
                    <div className="text-base font-bold text-foreground">{result.chokedDeltaP.toFixed(1)} psi</div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      Target 20-80% of rated Cv at normal flow, with 60-70% a common design point. Oversizing forces the
                      valve to operate near its seat where control degrades and trim wears rapidly.
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
            <h2 className="text-2xl font-bold mb-3">What Cv Measures and What It Does Not</h2>
            <p className="mb-4">
              The flow coefficient Cv is the number of US gallons per minute of 60 °F water a valve passes at a 1 psi
              pressure drop. It is a capacity rating rather than a dimension, and because flow scales with the square root
              of pressure drop, a Cv of 100 means 100 GPM at 1 psi and about 316 GPM at 10 psi. For liquids the sizing
              equation is Cv = Q√(SG/ΔP) — denser fluids require more capacity for the same volumetric flow, which is why
              specific gravity sits under the root. The metric equivalent Kv, in m³/h at 1 bar, is about 0.865 times Cv.
            </p>

            <h2 className="text-2xl font-bold mb-3">Choked Flow: The Limit That Undersizes Valves</h2>
            <p className="mb-4">
              Once the pressure at the vena contracta falls to the fluid's vapour pressure, additional pressure drop
              produces no additional flow. The valve is hydraulically choked, and the sizing calculation must cap ΔP at
              ΔP_choked = F_L²(P₁ − F_f·P_v) rather than using the full available drop. Skipping this step is a common and
              consequential error: it produces a Cv that looks adequate on paper and a valve that cannot pass the required
              flow in service. This calculator applies the cap automatically for liquid service and reports when it takes
              effect.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Valve Style Changes the Answer</h2>
            <p className="mb-4">
              The pressure recovery factor F_L describes how much pressure a valve recovers downstream of its vena
              contracta, and it varies substantially by design. High-recovery valves — butterfly and segmented ball, with
              F_L around 0.6 to 0.7 — choke and cavitate at relatively modest pressure drops. Low-recovery globe valves at
              F_L near 0.9 tolerate far higher differentials before choking. For high-differential service this makes valve
              style a first-order decision rather than a detail, and it explains why an apparently oversized butterfly
              valve can fail where a smaller globe valve succeeds.
            </p>

            <h2 className="text-2xl font-bold mb-3">Cavitation, Flashing, and Sizing Margin</h2>
            <p>
              Cavitation and flashing begin the same way, with vapour bubbles forming at the vena contracta. If downstream
              pressure recovers above vapour pressure, the bubbles collapse violently — that is cavitation, and it produces
              the characteristic gravel noise while pitting trim and body. If downstream pressure stays below vapour
              pressure the bubbles persist and the fluid leaves as a two-phase mixture, which is flashing and calls for
              hardened trim plus enlarged downstream piping. The cavitation index σ = (P₁ − P_v)/ΔP flags the risk, with
              values below about 1.5 warranting anti-cavitation trim. Finally, size for 20 to 80% of rated Cv at normal
              flow. Oversizing is both the more common error and the more damaging one, since a grossly oversized valve
              spends its life near the seat where control is poor and wear accelerates.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/valve-flow-coefficient-cv-calculator" />
          <PopularCalculators exclude="/calculator/valve-flow-coefficient-cv-calculator" />
        </div>
      </div>
    </>
  );
}
