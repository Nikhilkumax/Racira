"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Activity, FlaskConical, TrendingDown } from "lucide-react";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from "recharts";

/* ============================================================
   Area Under the Curve (AUC) Pharmacokinetics Calculator
   Computes AUC by the linear-up / log-down trapezoidal rule from
   measured concentration-time pairs, extrapolates to infinity via
   the terminal elimination rate constant, and derives clearance,
   volume of distribution, half-life and AUC24/MIC.

   Educational tool. Not a substitute for clinical judgement or
   validated therapeutic drug monitoring software.
   ============================================================ */

interface SamplePoint {
  time: string;
  concentration: string;
}

interface AucInputs {
  samples: SamplePoint[];
  dose: string;
  tau: string;
  infusionMinutes: string;
  mic: string;
  weightKg: string;
  extrapolate: boolean;
  proMode: boolean;
  bioavailability: string;
  targetAucLow: string;
  targetAucHigh: string;
}

interface BreakdownRow {
  label: string;
  value: string;
  highlight?: boolean;
}

interface AucResult {
  valid: boolean;
  error: string;
  aucLast: number;
  aucInf: number;
  pctExtrapolated: number;
  ke: number;
  halfLife: number;
  clearance: number;
  volumeDistribution: number;
  cmax: number;
  tmax: number;
  cmin: number;
  auc24: number;
  aucMicRatio: number;
  targetStatus: string;
  targetColor: string;
  rSquared: number;
  rows: BreakdownRow[];
  chartData: { time: number; concentration: number; fitted: number }[];
  clearancePerKg: number;
}

const DEFAULTS: AucInputs = {
  samples: [
    { time: "1", concentration: "30" },
    { time: "3", concentration: "22" },
    { time: "6", concentration: "14" },
    { time: "9", concentration: "9" },
    { time: "12", concentration: "6" },
  ],
  dose: "1500",
  tau: "12",
  infusionMinutes: "60",
  mic: "1",
  weightKg: "80",
  extrapolate: true,
  proMode: false,
  bioavailability: "100",
  targetAucLow: "400",
  targetAucHigh: "600",
};

interface ParsedPoint {
  t: number;
  c: number;
}

/* Log-linear regression over the terminal points gives ke.
   Returns the slope magnitude and the coefficient of determination. */
const terminalSlope = (pts: ParsedPoint[]): { ke: number; r2: number } => {
  const usable = pts.filter((p) => p.c > 0);
  if (usable.length < 2) return { ke: 0, r2: 0 };

  /* Use the last three points, or all of them if fewer */
  const tail = usable.slice(Math.max(0, usable.length - 3));
  const n = tail.length;
  const xs = tail.map((p) => p.t);
  const ys = tail.map((p) => Math.log(p.c));

  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;

  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - meanX) * (ys[i] - meanY);
    sxx += (xs[i] - meanX) ** 2;
    syy += (ys[i] - meanY) ** 2;
  }

  if (sxx === 0) return { ke: 0, r2: 0 };
  const slope = sxy / sxx;
  const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
  return { ke: Math.max(0, -slope), r2: Math.max(0, Math.min(1, r2)) };
};

const calculateAuc = (inputs: AucInputs): AucResult => {
  const empty: AucResult = {
    valid: false,
    error: "",
    aucLast: 0,
    aucInf: 0,
    pctExtrapolated: 0,
    ke: 0,
    halfLife: 0,
    clearance: 0,
    volumeDistribution: 0,
    cmax: 0,
    tmax: 0,
    cmin: 0,
    auc24: 0,
    aucMicRatio: 0,
    targetStatus: "",
    targetColor: "",
    rSquared: 0,
    rows: [],
    chartData: [],
    clearancePerKg: 0,
  };

  const pts: ParsedPoint[] = inputs.samples
    .map((s) => ({ t: parseFloat(s.time), c: parseFloat(s.concentration) }))
    .filter((p) => !isNaN(p.t) && !isNaN(p.c) && p.c >= 0)
    .sort((a, b) => a.t - b.t);

  if (pts.length < 2) {
    return { ...empty, error: "Enter at least two valid concentration-time pairs." };
  }

  /* Linear-up / log-down trapezoidal rule: linear while the curve
     rises, logarithmic while it falls, which is the standard
     approach for the elimination phase */
  let aucLast = 0;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const dt = p1.t - p0.t;
    if (dt <= 0) continue;

    if (p1.c >= p0.c || p1.c <= 0 || p0.c <= 0) {
      aucLast += ((p0.c + p1.c) / 2) * dt;
    } else {
      const lnRatio = Math.log(p0.c / p1.c);
      aucLast += lnRatio === 0 ? ((p0.c + p1.c) / 2) * dt : ((p0.c - p1.c) * dt) / lnRatio;
    }
  }

  const { ke, r2 } = terminalSlope(pts);
  const lastPoint = pts[pts.length - 1];
  const aucTail = inputs.extrapolate && ke > 0 ? lastPoint.c / ke : 0;
  const aucInf = aucLast + aucTail;
  const pctExtrapolated = aucInf > 0 ? (aucTail / aucInf) * 100 : 0;

  const halfLife = ke > 0 ? Math.LN2 / ke : 0;

  const dose = Math.max(0, parseFloat(inputs.dose) || 0);
  const tau = Math.max(0, parseFloat(inputs.tau) || 0);
  const bioavail = Math.max(0, Math.min(100, parseFloat(inputs.bioavailability) || 100)) / 100;

  /* Steady-state AUC over one dosing interval scales to 24 h */
  const auc24 = tau > 0 ? aucLast * (24 / tau) : aucInf;

  /* Clearance from dose and AUC (L/h if dose in mg and AUC in mg*h/L) */
  const aucForCl = inputs.extrapolate && aucInf > 0 ? aucInf : aucLast;
  const clearance = aucForCl > 0 ? (dose * bioavail) / aucForCl : 0;
  const volumeDistribution = ke > 0 ? clearance / ke : 0;

  const weight = Math.max(0, parseFloat(inputs.weightKg) || 0);
  const clearancePerKg = weight > 0 ? clearance / weight : 0;

  const mic = Math.max(0.0001, parseFloat(inputs.mic) || 1);
  const aucMicRatio = auc24 / mic;

  const lowTarget = parseFloat(inputs.targetAucLow) || 400;
  const highTarget = parseFloat(inputs.targetAucHigh) || 600;

  let targetStatus: string;
  let targetColor: string;
  if (aucMicRatio < lowTarget) {
    targetStatus = "Below target — subtherapeutic";
    targetColor = "text-orange-600 dark:text-orange-500";
  } else if (aucMicRatio > highTarget) {
    targetStatus = "Above target — nephrotoxicity risk";
    targetColor = "text-red-600 dark:text-red-500";
  } else {
    targetStatus = "Within target range";
    targetColor = "text-emerald-600 dark:text-emerald-500";
  }

  const cmax = Math.max(...pts.map((p) => p.c));
  const tmax = pts.find((p) => p.c === cmax)?.t ?? 0;
  const cmin = Math.min(...pts.map((p) => p.c));

  const n2 = (x: number, d = 2) => x.toLocaleString("en-US", { maximumFractionDigits: d });

  const rows: BreakdownRow[] = [
    { label: "Samples used", value: `${pts.length}` },
    { label: "Cmax", value: `${n2(cmax)} mg/L at ${n2(tmax, 1)} h` },
    { label: "Cmin (trough)", value: `${n2(cmin)} mg/L` },
    { label: "Elimination rate constant kₑ", value: `${n2(ke, 4)} h⁻¹` },
    { label: "Half-life t½", value: `${n2(halfLife, 2)} h` },
    { label: "Terminal fit R²", value: n2(r2, 4) },
    { label: "AUC₀→t (trapezoidal)", value: `${n2(aucLast)} mg·h/L` },
    { label: "Extrapolated tail", value: `${n2(aucTail)} mg·h/L` },
    { label: "% extrapolated", value: `${n2(pctExtrapolated, 1)}%` },
    { label: "Clearance", value: `${n2(clearance, 2)} L/h` },
    { label: "Volume of distribution", value: `${n2(volumeDistribution, 2)} L` },
    { label: "AUC₂₄", value: `${n2(auc24)} mg·h/L`, highlight: true },
  ];

  /* Chart: observed points plus the fitted terminal decay */
  const c0Fit = lastPoint.c * Math.exp(ke * lastPoint.t);
  const chartData = pts.map((p) => ({
    time: p.t,
    concentration: p.c,
    fitted: ke > 0 ? c0Fit * Math.exp(-ke * p.t) : p.c,
  }));

  return {
    valid: true,
    error: "",
    aucLast,
    aucInf,
    pctExtrapolated,
    ke,
    halfLife,
    clearance,
    volumeDistribution,
    cmax,
    tmax,
    cmin,
    auc24,
    aucMicRatio,
    targetStatus,
    targetColor,
    rSquared: r2,
    rows,
    chartData,
    clearancePerKg,
  };
};

const num = (n: number, d = 2) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const inp = "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel = "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

const FAQS = [
  {
    question: "What does area under the curve mean in pharmacokinetics?",
    answer:
      "AUC is the integral of drug concentration in plasma over time, expressed in units such as mg·h/L. It represents total systemic exposure across a dosing interval or across the full time course of the drug. Unlike a single peak or trough reading, AUC captures both how high the concentration rose and how long it stayed elevated, which is why it correlates better with both efficacy and toxicity for many drug classes.",
  },
  {
    question: "How is AUC calculated from concentration measurements?",
    answer:
      "The standard approach is the trapezoidal rule applied between consecutive sample points. This calculator uses the linear-up, log-down variant: it treats the segment as a straight line while concentrations rise and as an exponential decay while they fall. Because drug elimination is first-order and therefore log-linear, the logarithmic form avoids the systematic overestimation that a purely linear trapezoid produces during the elimination phase.",
  },
  {
    question: "What is the difference between AUC₀→t and AUC₀→∞?",
    answer:
      "AUC₀→t covers only the interval spanned by your actual samples, ending at the last measured concentration. AUC₀→∞ adds an extrapolated tail representing the drug still to be eliminated, computed as the final concentration divided by the terminal elimination rate constant. The extrapolated portion should ideally stay below 20 percent of the total; a larger fraction means sampling ended too early for the estimate to be reliable, and the calculator reports that percentage so you can judge it.",
  },
  {
    question: "Why is AUC-guided vancomycin dosing preferred over trough monitoring?",
    answer:
      "The 2020 consensus guideline from ASHP, IDSA, PIDS and SIDP recommends AUC₂₄/MIC targeting of 400 to 600 rather than trough-only monitoring for serious MRSA infections. Trough concentrations of 15 to 20 mg/L were found to overshoot the exposure needed for efficacy while substantially increasing acute kidney injury, whereas AUC-guided dosing achieves comparable outcomes at lower total exposure. AUC also correlates directly with the pharmacodynamic driver of vancomycin activity in a way that a single trough does not.",
  },
  {
    question: "How many samples do I need for a reliable AUC?",
    answer:
      "Two well-timed levels — typically a post-distribution peak and a trough within the same interval — support a first-order two-point estimate and are what most therapeutic drug monitoring services use. More points improve the terminal slope estimate and reduce error in the extrapolated tail. Timing matters more than count: draw the peak after distribution is complete, at least one to two hours post-infusion for vancomycin, and record the actual draw times rather than the scheduled ones.",
  },
  {
    question: "What do clearance and volume of distribution tell me?",
    answer:
      "Clearance is the volume of plasma cleared of drug per unit time and is calculated as dose divided by AUC. It determines the maintenance dose needed to hold a given steady-state exposure. Volume of distribution relates the amount of drug in the body to the plasma concentration and determines the loading dose. A large volume implies extensive tissue distribution. Together with the elimination rate constant they describe the whole one-compartment disposition of the drug.",
  },
  {
    question: "What is a good R² for the terminal slope?",
    answer:
      "The coefficient of determination for the log-linear regression over the terminal points should generally exceed 0.95. A lower value suggests the points used are not yet in the true terminal phase, that distribution is still ongoing, or that assay variability is dominating. Since the extrapolated tail depends entirely on this slope, a poor fit propagates directly into AUC₀→∞. If R² is low, prefer AUC₀→t or collect later samples.",
  },
  {
    question: "Can I use this calculator to make dosing decisions?",
    answer:
      "No. This is an educational tool for understanding and checking pharmacokinetic arithmetic. Clinical dosing requires validated therapeutic drug monitoring software, often with Bayesian estimation against a population model, together with the patient's renal function, clinical trajectory, concurrent nephrotoxins and the judgement of a pharmacist or physician. Verify every result against your institution's approved process before it influences care.",
  },
];

export default function AreaUnderTheCurveAucPharmacokineticsCalculator() {
  const [inputs, setInputs] = useState<AucInputs>(DEFAULTS);
  const [result, setResult] = useState<AucResult>(calculateAuc(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateAuc(inputs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof AucInputs>(key: K, val: AucInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const setSample = (index: number, field: keyof SamplePoint, val: string) =>
    setInputs((prev) => ({
      ...prev,
      samples: prev.samples.map((s, i) => (i === index ? { ...s, [field]: val } : s)),
    }));

  const addSample = () =>
    setInputs((prev) => ({ ...prev, samples: [...prev.samples, { time: "", concentration: "" }] }));

  const removeSample = (index: number) =>
    setInputs((prev) => ({
      ...prev,
      samples: prev.samples.length > 2 ? prev.samples.filter((_, i) => i !== index) : prev.samples,
    }));

  const handleCalculate = () => setResult(calculateAuc(inputs));

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculateAuc(DEFAULTS));
    setShowAdvanced(false);
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Area Under the Curve (AUC) Pharmacokinetics Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Area Under the Curve (AUC) Pharmacokinetics Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* ───────── INPUT PANEL ───────── */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div>
              <div className={groupLabel}>
                <FlaskConical className="h-3.5 w-3.5" /> Concentration-Time Samples
              </div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-medium">Time (h)</span>
                <span className="text-xs text-muted-foreground font-medium">Conc. (mg/L)</span>
                <span className="w-10" />
              </div>
              <div className="flex flex-col gap-2">
                {inputs.samples.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`Sample ${i + 1} time`}
                      value={s.time}
                      onChange={(e) => setSample(i, "time", e.target.value)}
                      className={inp}
                    />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      aria-label={`Sample ${i + 1} concentration`}
                      value={s.concentration}
                      onChange={(e) => setSample(i, "concentration", e.target.value)}
                      className={inp}
                    />
                    <button
                      type="button"
                      onClick={() => removeSample(i)}
                      aria-label={`Remove sample ${i + 1}`}
                      disabled={inputs.samples.length <= 2}
                      className="h-10 w-10 shrink-0 grid place-items-center rounded-md border border-input bg-background hover:bg-secondary/40 text-muted-foreground transition-colors disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSample}
                className="mt-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                + Add sample
              </button>
            </div>

            <div>
              <label className={lbl} htmlFor="auc-dose">Dose (mg)</label>
              <input
                id="auc-dose"
                type="number"
                min="0"
                step="any"
                value={inputs.dose}
                onChange={(e) => set("dose", e.target.value)}
                className={inp}
              />
            </div>

            <div>
              <label className={lbl} htmlFor="auc-tau">Dosing Interval τ (h)</label>
              <input
                id="auc-tau"
                type="number"
                min="0"
                step="any"
                value={inputs.tau}
                onChange={(e) => set("tau", e.target.value)}
                className={inp}
              />
            </div>

            <div>
              <label className={lbl} htmlFor="auc-mic">MIC (mg/L)</label>
              <input
                id="auc-mic"
                type="number"
                min="0"
                step="any"
                value={inputs.mic}
                onChange={(e) => set("mic", e.target.value)}
                className={inp}
              />
            </div>

            {/* ── TIER 2A: ADVANCED OPTIONS ── */}
            <button
              type="button"
              onClick={() => setShowAdvanced((s) => !s)}
              className="flex items-center justify-between w-full text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-1"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>

            {showAdvanced && (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <div>
                  <div className={groupLabel}>
                    <Activity className="h-3.5 w-3.5" /> Patient &amp; Administration
                  </div>
                  <label className={lbl} htmlFor="auc-weight">Body Weight (kg)</label>
                  <input
                    id="auc-weight"
                    type="number"
                    min="0"
                    step="any"
                    value={inputs.weightKg}
                    onChange={(e) => set("weightKg", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <label className={lbl} htmlFor="auc-inf">Infusion Duration (min)</label>
                  <input
                    id="auc-inf"
                    type="number"
                    min="0"
                    step="any"
                    value={inputs.infusionMinutes}
                    onChange={(e) => set("infusionMinutes", e.target.value)}
                    className={inp}
                  />
                </div>

                <div>
                  <div className={groupLabel}>
                    <TrendingDown className="h-3.5 w-3.5" /> Extrapolation
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.extrapolate}
                      onChange={(e) => set("extrapolate", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Extrapolate to infinity (AUC₀→∞)
                  </label>
                </div>

                <div>
                  <div className={groupLabel}>
                    <FlaskConical className="h-3.5 w-3.5" /> Professional Mode
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inputs.proMode}
                      onChange={(e) => set("proMode", e.target.checked)}
                      className="h-4 w-4 rounded border-input accent-primary"
                    />
                    Show clearance, Vd and target attainment
                  </label>
                </div>

                {inputs.proMode && (
                  <>
                    <div>
                      <label className={lbl} htmlFor="auc-f">Bioavailability F (%)</label>
                      <input
                        id="auc-f"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={inputs.bioavailability}
                        onChange={(e) => set("bioavailability", e.target.value)}
                        className={inp}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={lbl} htmlFor="auc-tlow">Target AUC/MIC Low</label>
                        <input
                          id="auc-tlow"
                          type="number"
                          min="0"
                          step="any"
                          value={inputs.targetAucLow}
                          onChange={(e) => set("targetAucLow", e.target.value)}
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className={lbl} htmlFor="auc-thigh">Target AUC/MIC High</label>
                        <input
                          id="auc-thigh"
                          type="number"
                          min="0"
                          step="any"
                          value={inputs.targetAucHigh}
                          onChange={(e) => set("targetAucHigh", e.target.value)}
                          className={inp}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={handleCalculate}
                className="h-10 w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-colors active:scale-[0.99]"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 shrink-0 grid place-items-center rounded-md border border-input bg-background hover:bg-secondary/40 text-muted-foreground transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ───────── RESULTS PANEL ───────── */}
          <div className="flex flex-col gap-4">
            {!result.valid ? (
              <div className="bg-destructive/10 border-l-4 border-destructive rounded-lg p-5">
                <div className="text-sm font-bold text-destructive mb-1 uppercase tracking-wider">Input Error</div>
                <div className="text-base font-medium text-foreground">{result.error}</div>
              </div>
            ) : (
              <>
                {/* 1 — PRIMARY CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">
                    AUC₂₄ (24-Hour Exposure)
                  </div>
                  <div className="text-4xl font-bold text-primary tracking-tight mb-2">
                    {num(result.auc24, 1)} <span className="text-2xl">mg·h/L</span>
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    AUC₂₄/MIC of <span className="font-bold text-foreground">{num(result.aucMicRatio, 0)}</span> —{" "}
                    <span className={`font-bold ${result.targetColor}`}>{result.targetStatus}</span>
                  </div>
                </div>

                {/* 2 — 3-STAT BAR */}
                <div className="grid grid-cols-3 border border-border rounded-lg overflow-hidden bg-card">
                  <div className="p-4 text-center">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Half-Life</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-500">
                      {num(result.halfLife, 2)} h
                    </div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">Clearance</div>
                    <div className="text-base font-bold text-orange-600 dark:text-orange-500">
                      {num(result.clearance, 2)} L/h
                    </div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-1">% Extrapolated</div>
                    <div
                      className={`text-base font-bold ${
                        result.pctExtrapolated <= 20
                          ? "text-emerald-600 dark:text-emerald-500"
                          : result.pctExtrapolated <= 40
                          ? "text-orange-600 dark:text-orange-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {num(result.pctExtrapolated, 1)}%
                    </div>
                  </div>
                </div>

                {/* 3 — BREAKDOWN TABLE */}
                <div className="card-calculator !p-0 border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-secondary/40 border-b border-border">
                        <tr>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3">Parameter</th>
                          <th className="text-xs font-bold uppercase text-muted-foreground tracking-wider py-2.5 px-3 text-right">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {result.rows.slice(0, -1).map((row, i) => (
                          <tr key={i} className={row.highlight ? "bg-primary/10 font-bold" : ""}>
                            <td className="text-base py-2.5 px-3">{row.label}</td>
                            <td className="text-base py-2.5 px-3 text-right font-mono">{row.value}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-border font-bold bg-secondary/20">
                          <td className="text-base py-2.5 px-3">{result.rows[result.rows.length - 1].label}</td>
                          <td className="text-base py-2.5 px-3 text-right font-mono text-primary">
                            {result.rows[result.rows.length - 1].value}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4 — CHART */}
                <div className="card-calculator !p-4 border border-border bg-card">
                  <div className="text-sm font-bold text-foreground mb-1">Concentration-Time Profile</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Shaded region is the integrated AUC; the dashed line is the fitted terminal decay
                  </div>
                  {mounted ? (
                    <div style={{ width: "100%", height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="time"
                            type="number"
                            domain={["dataMin", "dataMax"]}
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            label={{ value: "Time (h)", position: "insideBottom", offset: -3, fontSize: 11 }}
                          />
                          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                          <RTooltip
                            formatter={(v: number | string, name: string) => [
                              `${num(Number(v), 2)} mg/L`,
                              name === "fitted" ? "Fitted decay" : "Measured",
                            ]}
                            labelFormatter={(l: number | string) => `t = ${l} h`}
                            contentStyle={{ fontSize: 12, borderRadius: 8 }}
                          />
                          <ReferenceLine
                            y={parseFloat(inputs.mic) || 0}
                            stroke="hsl(0 84% 60%)"
                            strokeDasharray="4 4"
                          />
                          <Area
                            type="monotone"
                            dataKey="concentration"
                            fill="hsl(217 91% 60%)"
                            fillOpacity={0.18}
                            stroke="none"
                          />
                          <Line
                            type="monotone"
                            dataKey="concentration"
                            name="Measured"
                            stroke="hsl(217 91% 60%)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="fitted"
                            name="Fitted decay"
                            stroke="hsl(142 71% 45%)"
                            strokeWidth={1.5}
                            strokeDasharray="5 4"
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(217 91% 60%)" }} />
                      Measured concentration
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "hsl(142 71% 45%)" }} />
                      Fitted terminal decay
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-0.5 w-4" style={{ background: "hsl(0 84% 60%)" }} />
                      MIC
                    </span>
                  </div>
                </div>

                {/* TIER 2B — PROFESSIONAL MODE RESULTS */}
                {inputs.proMode && (
                  <div className="card-calculator !p-5 border border-border bg-card">
                    <div className={groupLabel}>
                      <Activity className="h-3.5 w-3.5" /> Disposition Parameters
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Clearance / kg</div>
                        <div className="text-lg font-bold text-foreground">
                          {num(result.clearancePerKg, 3)} L/h/kg
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Volume of Distribution</div>
                        <div className="text-lg font-bold text-foreground">{num(result.volumeDistribution, 2)} L</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">AUC₀→∞</div>
                        <div className="text-lg font-bold text-foreground">{num(result.aucInf, 1)} mg·h/L</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-0.5">Terminal Fit R²</div>
                        <div
                          className={`text-lg font-bold ${
                            result.rSquared >= 0.95
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "text-orange-600 dark:text-orange-500"
                          }`}
                        >
                          {num(result.rSquared, 4)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-3">
                      Target range {inputs.targetAucLow}–{inputs.targetAucHigh} AUC₂₄/MIC. {result.targetStatus}.
                      Educational estimate only — confirm with validated therapeutic drug monitoring software.
                    </div>
                  </div>
                )}

                {/* 5 — SUMMARY STATISTICS (mirrors the breakdown table) */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <div className={groupLabel}>
                    <TrendingDown className="h-3.5 w-3.5" /> Summary Statistics
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {result.rows.map((row, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className={row.highlight ? "font-bold text-foreground" : "text-muted-foreground"}>
                          {row.label}
                        </span>
                        <span className={`font-mono ${row.highlight ? "font-bold text-primary" : "text-foreground"}`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    Computed by the linear-up / log-down trapezoidal rule.{" "}
                    {result.pctExtrapolated > 20
                      ? "More than 20% of the total is extrapolated — collect later samples for a reliable AUC₀→∞."
                      : "Extrapolated fraction is within the conventional 20% acceptance limit."}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ───────── SEO ───────── */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What AUC Measures and Why It Matters</h2>
            <p>
              Plot plasma concentration against time after a dose and you get a curve that rises to a peak and then
              decays. The area beneath that curve is total systemic exposure, expressed in units such as milligram
              hours per litre. It answers a question no single measurement can: not how high the concentration
              reached, nor how low it fell before the next dose, but how much drug the body was exposed to overall
              and for how long.
            </p>
            <p>
              That distinction has practical weight. Two dosing regimens can produce identical trough concentrations
              while delivering substantially different total exposure, and for many drugs it is the exposure that
              drives both bacterial killing and organ toxicity. AUC is therefore the pharmacodynamic index of choice
              for glycopeptides such as vancomycin, for several oncology agents where exposure predicts myelo-
              suppression, and for immunosuppressants like mycophenolate where a narrow therapeutic window makes
              precise exposure targeting essential.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Trapezoidal Rule, Linear Up and Log Down</h2>
            <p>
              Since concentration is sampled at discrete times rather than measured continuously, AUC is estimated
              by summing the areas of the segments between consecutive points. The simplest approach treats each
              segment as a trapezoid with straight sides. That works well while concentrations are rising, but it
              systematically overestimates during elimination, because first-order decay is exponential and a
              straight chord always sits above the true curve.
            </p>
            <p>
              The linear-up, log-down method used here fixes that. While concentrations rise it applies the linear
              trapezoid; while they fall it integrates the exponential form, computing the segment as the
              concentration difference multiplied by the time interval and divided by the natural logarithm of the
              concentration ratio. The correction is modest when samples are closely spaced and becomes substantial
              when intervals are long or the decay is steep, which is exactly the situation in sparse clinical
              sampling.
            </p>

            <h2 className="text-2xl font-bold mb-3">Extrapolating to Infinity and Judging the Fit</h2>
            <p>
              AUC₀→t stops at your last sample, but drug remains in the body after that point. Extending to
              AUC₀→∞ adds a tail equal to the final concentration divided by the terminal elimination rate constant,
              which this calculator derives by log-linear regression over the last points. The same constant yields
              the half-life through the natural logarithm of two, and combines with clearance to give the volume of
              distribution.
            </p>
            <p>
              Two diagnostics decide whether that extrapolation can be trusted. The extrapolated percentage should
              stay below twenty percent of the total; above that, sampling ended too early and the estimate rests
              more on the model than on data. The coefficient of determination for the terminal regression should
              exceed 0.95, indicating the points genuinely lie in the terminal phase rather than still reflecting
              distribution. Both figures are reported here so a weak estimate is visible rather than hidden inside a
              confident-looking number.
            </p>

            <h2 className="text-2xl font-bold mb-3">AUC-Guided Vancomycin Dosing in Practice</h2>
            <p>
              The 2020 consensus guideline published jointly by ASHP, IDSA, PIDS and SIDP moved vancomycin
              monitoring for serious MRSA infection away from trough-only targeting toward an AUC₂₄ to MIC ratio of
              400 to 600. The evidence behind that change was consistent: trough targets of 15 to 20 mg/L delivered
              exposure beyond what efficacy required while roughly doubling rates of acute kidney injury, whereas
              AUC-guided regimens achieved comparable clinical outcomes at lower total exposure.
            </p>
            <p>
              Implementing it requires either two well-timed levels within a dosing interval or Bayesian estimation
              against a population model. Timing dominates accuracy: the peak must be drawn after distribution is
              complete, generally one to two hours after the infusion ends, and actual draw times must be recorded
              rather than assumed from the schedule. Clearance falls with declining renal function, so the same
              dose produces higher exposure as creatinine clearance drops, and concurrent nephrotoxins such as
              piperacillin-tazobactam compound the risk. This calculator is an educational aid for understanding
              and checking that arithmetic; clinical decisions belong with validated monitoring software and the
              judgement of the treating team.
            </p>
          </section>
          <FAQSection
            faqs={FAQS}
            pageUrl="https://racira.com/calculator/area-under-the-curve-auc-pharmacokinetics-calculator"
          />
          <PopularCalculators exclude="/calculator/area-under-the-curve-auc-pharmacokinetics-calculator" />
        </div>
      </div>
    </>
  );
}
