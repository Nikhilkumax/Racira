"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { PieChart as RPie, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

interface RiskInputs {
  threat: number;
  likelihood: number;
  impact: number;
  assetValue: number;
  controlEffectiveness: number;
  detectionCapability: number;
  exposureFactor: number;
  annualRateOfOccurrence: number;
}

interface RiskResult {
  inherentScore: number;
  inherentNormalized: number;
  inherentBand: string;
  residualScore: number;
  residualNormalized: number;
  residualBand: string;
  riskReductionPct: number;
  detectionFactor: number;
  matrixScore: number;
  singleLossExpectancy: number;
  annualLossExpectancy: number;
  residualAle: number;
  mitigatedAle: number;
  treatment: string;
}

const MAX_SCORE = 125;

const RATING_LABELS: Record<number, string> = {
  1: "1 — Very Low",
  2: "2 — Low",
  3: "3 — Moderate",
  4: "4 — High",
  5: "5 — Very High",
};

const DEFAULTS: RiskInputs = {
  threat: 4,
  likelihood: 3,
  impact: 4,
  assetValue: 500000,
  controlEffectiveness: 40,
  detectionCapability: 3,
  exposureFactor: 35,
  annualRateOfOccurrence: 0.5,
};

function bandFor(score: number): string {
  if (score > 75) return "Critical";
  if (score > 40) return "High";
  if (score > 15) return "Medium";
  return "Low";
}

export function calculateRisk(i: RiskInputs): RiskResult {
  const inherentScore = i.threat * i.likelihood * i.impact;

  // Weak detection lets an incident run longer, so it inflates residual exposure by up to 20%.
  const detectionFactor = 1 + (5 - i.detectionCapability) * 0.05;
  const control = Math.min(Math.max(i.controlEffectiveness, 0), 100) / 100;
  const residualScore = Math.min(inherentScore * (1 - control) * detectionFactor, MAX_SCORE);

  const singleLossExpectancy = i.assetValue * (Math.min(Math.max(i.exposureFactor, 0), 100) / 100);
  const annualLossExpectancy = singleLossExpectancy * i.annualRateOfOccurrence;
  const residualAle = annualLossExpectancy * (1 - control) * detectionFactor;

  const residualBand = bandFor(residualScore);
  let treatment: string;
  if (residualBand === "Critical") treatment = "Avoid or remediate immediately; escalate to executive risk owner.";
  else if (residualBand === "High") treatment = "Mitigate with additional controls on a defined remediation timeline.";
  else if (residualBand === "Medium") treatment = "Mitigate or transfer; review at the next risk committee cycle.";
  else treatment = "Accept with periodic monitoring and no additional control spend.";

  return {
    inherentScore,
    inherentNormalized: (inherentScore / MAX_SCORE) * 100,
    inherentBand: bandFor(inherentScore),
    residualScore,
    residualNormalized: (residualScore / MAX_SCORE) * 100,
    residualBand,
    riskReductionPct: inherentScore > 0 ? ((inherentScore - residualScore) / inherentScore) * 100 : 0,
    detectionFactor,
    matrixScore: i.likelihood * i.impact,
    singleLossExpectancy,
    annualLossExpectancy,
    residualAle,
    mitigatedAle: annualLossExpectancy - residualAle,
    treatment,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function bandColor(band: string): string {
  if (band === "Critical") return "text-red-600";
  if (band === "High") return "text-orange-600";
  if (band === "Medium") return "text-amber-600";
  return "text-emerald-600";
}

export default function RiskScoreThreatLikelihoodImpactCalculator() {
  const [threat, setThreat] = useState(String(DEFAULTS.threat));
  const [likelihood, setLikelihood] = useState(String(DEFAULTS.likelihood));
  const [impact, setImpact] = useState(String(DEFAULTS.impact));
  const [assetValue, setAssetValue] = useState(String(DEFAULTS.assetValue));
  const [controlEffectiveness, setControlEffectiveness] = useState(String(DEFAULTS.controlEffectiveness));
  const [detectionCapability, setDetectionCapability] = useState(String(DEFAULTS.detectionCapability));
  const [exposureFactor, setExposureFactor] = useState(String(DEFAULTS.exposureFactor));
  const [annualRateOfOccurrence, setAnnualRateOfOccurrence] = useState(String(DEFAULTS.annualRateOfOccurrence));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<RiskResult>(calculateRisk(DEFAULTS));

  const getInputs = (): RiskInputs => ({
    threat: parseFloat(threat) || 0,
    likelihood: parseFloat(likelihood) || 0,
    impact: parseFloat(impact) || 0,
    assetValue: parseFloat(assetValue) || 0,
    controlEffectiveness: parseFloat(controlEffectiveness) || 0,
    detectionCapability: parseFloat(detectionCapability) || 0,
    exposureFactor: parseFloat(exposureFactor) || 0,
    annualRateOfOccurrence: parseFloat(annualRateOfOccurrence) || 0,
  });

  useEffect(() => {
    setResult(calculateRisk(DEFAULTS));
  }, []);

  const assetNum = parseFloat(assetValue) || 0;
  const controlNum = parseFloat(controlEffectiveness) || 0;
  const efNum = parseFloat(exposureFactor) || 0;
  const aroNum = parseFloat(annualRateOfOccurrence) || 0;

  let errorMsg = "";
  if (assetNum < 0) errorMsg = "Asset value cannot be negative.";
  else if (controlNum < 0 || controlNum > 100) errorMsg = "Control effectiveness must be between 0% and 100%.";
  else if (efNum < 0 || efNum > 100) errorMsg = "Exposure factor must be between 0% and 100%.";
  else if (aroNum < 0) errorMsg = "Annual rate of occurrence cannot be negative.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResult(calculateRisk(getInputs()));
  };

  const reset = () => {
    setThreat(String(DEFAULTS.threat));
    setLikelihood(String(DEFAULTS.likelihood));
    setImpact(String(DEFAULTS.impact));
    setAssetValue(String(DEFAULTS.assetValue));
    setControlEffectiveness(String(DEFAULTS.controlEffectiveness));
    setDetectionCapability(String(DEFAULTS.detectionCapability));
    setExposureFactor(String(DEFAULTS.exposureFactor));
    setAnnualRateOfOccurrence(String(DEFAULTS.annualRateOfOccurrence));
    setResult(calculateRisk(DEFAULTS));
  };

  const chartTotal = result.residualScore + Math.max(result.inherentScore - result.residualScore, 0);
  const chartData = [
    { name: "Residual Risk", value: result.residualScore, color: "#EF4444" },
    { name: "Mitigated by Controls", value: Math.max(result.inherentScore - result.residualScore, 0), color: "#10B981" },
  ];

  const ratingSelect = (
    id: string,
    label: string,
    value: string,
    onChange: (v: string) => void,
    tooltip: string
  ) => (
    <div>
      <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1" title={tooltip}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
      >
        {[1, 2, 3, 4, 5].map(n => (
          <option key={n} value={String(n)}>{RATING_LABELS[n]}</option>
        ))}
      </select>
    </div>
  );

  const breakdown = [
    { label: "Threat Level", value: `${fmtInt(parseFloat(threat) || 0)} of 5` },
    { label: "Likelihood", value: `${fmtInt(parseFloat(likelihood) || 0)} of 5` },
    { label: "Impact", value: `${fmtInt(parseFloat(impact) || 0)} of 5` },
    { label: "Likelihood × Impact (matrix cell)", value: `${fmtInt(result.matrixScore)} of 25` },
    { label: "Inherent Risk Score", value: `${fmtInt(result.inherentScore)} of ${MAX_SCORE}`, highlight: true },
    { label: "Control Effectiveness", value: `${fmt(controlNum, 0)}%` },
    { label: "Detection Adjustment", value: `× ${fmt(result.detectionFactor, 2)}` },
    { label: "Residual Risk Score", value: `${fmt(result.residualScore, 1)} of ${MAX_SCORE}` },
    { label: "Asset Value", value: fmtMoney(assetNum) },
    { label: "Single Loss Expectancy", value: fmtMoney(result.singleLossExpectancy) },
    { label: "Annual Loss Expectancy", value: fmtMoney(result.annualLossExpectancy) },
    { label: "Residual Annual Loss Expectancy", value: fmtMoney(result.residualAle) },
  ];

  const faqs = [
    { question: "How is the risk score calculated?", answer: "The base score multiplies three ratings on a one-to-five scale: threat, which reflects the capability and motivation of the adversary or hazard; likelihood, which reflects how probable exploitation is in the assessment period; and impact, which reflects the consequence if it succeeds. The product ranges from 1 to 125. Multiplication rather than addition is used deliberately, so that a near-zero rating on any single factor pulls the whole score down." },
    { question: "What is the difference between inherent and residual risk?", answer: "Inherent risk is the exposure before your controls are credited — the raw product of threat, likelihood and impact. Residual risk is what remains once control effectiveness and detection capability are applied. Governance frameworks generally require both to be recorded, because a low residual figure that depends entirely on one control is a different proposition from a low inherent figure that needs no control at all." },
    { question: "Why does detection capability change the score?", answer: "Preventive controls reduce the chance of an incident, but detection determines how long one runs before anyone notices. Two organisations with identical prevention will experience very different losses if one detects intrusions in hours and the other in months. This calculator applies a multiplier of 1.00 at the strongest detection rating rising to 1.20 at the weakest, inflating residual exposure where dwell time is likely to be long." },
    { question: "What are SLE, ARO and ALE?", answer: "Single loss expectancy is asset value multiplied by exposure factor — the proportion of the asset's value destroyed by one occurrence. Annual rate of occurrence is how many times per year the event is expected; 0.5 means once every two years. Annual loss expectancy is SLE multiplied by ARO, and it is the figure normally compared against the annual cost of a proposed control to judge whether the control is worth buying." },
    { question: "How do the risk bands map to treatment decisions?", answer: "On the 125-point scale used here, 1 to 15 is Low, 16 to 40 is Medium, 41 to 75 is High and anything above 75 is Critical. Low risks are typically accepted with monitoring. Medium risks are mitigated or transferred through insurance or contract. High risks require additional controls on a defined timeline. Critical risks are escalated to an executive owner and often trigger avoidance — discontinuing the activity entirely." },
    { question: "Is a five-by-five matrix good enough?", answer: "It is the most widely deployed approach in ISO 27005, NIST SP 800-30 and most enterprise GRC platforms, and its strength is that non-specialists can populate it consistently. Its weakness is that ordinal ratings are not really numbers — the gap between 4 and 5 is not necessarily the same as between 1 and 2 — so products of ordinal scales can rank risks in ways that quantitative methods would not. The monetary figures on this page exist partly as a cross-check on that." },
    { question: "How does this relate to FAIR?", answer: "Factor Analysis of Information Risk models loss event frequency and loss magnitude as probability distributions and runs Monte Carlo simulation to produce a loss curve rather than a point estimate. That is more rigorous and considerably more demanding of data. The scored matrix here, extended with SLE and ALE, is the pragmatic middle ground used for triage before committing to full quantitative analysis on the risks that matter most." },
    { question: "How often should risk scores be reviewed?", answer: "Threat ratings change fastest, since adversary capability and active campaigns shift within weeks. Impact ratings change when the business changes — a new product line, a new jurisdiction, a new data classification. Most organisations recalculate the register quarterly, and immediately after any material incident, control failure, architecture change or acquisition." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Technology", href: "/calculator#technology" }, { label: "Risk Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Risk Score (Threat × Likelihood × Impact) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              {ratingSelect("threat", "Threat Level", threat, setThreat, "Capability and motivation of the adversary or hazard.")}
              {ratingSelect("likelihood", "Likelihood", likelihood, setLikelihood, "Probability of exploitation within the assessment period.")}
              {ratingSelect("impact", "Impact", impact, setImpact, "Severity of consequence if the event succeeds.")}
              <InputField id="asset-value" label="Asset Value ($)" value={assetValue} onChange={setAssetValue} prefix="$" tooltip="Replacement or business value of the asset at risk." />
            </div>

            {hasValidationErrors && (
              <div className="text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}

            <div className="rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvanced(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-primary font-medium hover:bg-secondary/30 transition-colors"
              >
                Advanced Options
                <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </button>
              {showAdvanced && (
                <div className="px-3 pb-3 border-t border-border pt-3 flex flex-col gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Control Environment</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="control-eff" label="Control Effectiveness (%)" value={controlEffectiveness} onChange={setControlEffectiveness} suffix="%" tooltip="Proportion of the inherent risk removed by existing preventive controls." />
                      {ratingSelect("detection", "Detection Capability", detectionCapability, setDetectionCapability, "How quickly an incident would be detected. Weak detection increases residual risk.")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Quantitative Exposure</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="exposure" label="Exposure Factor (%)" value={exposureFactor} onChange={setExposureFactor} suffix="%" tooltip="Percentage of asset value destroyed by a single occurrence." />
                      <InputField id="aro" label="Annual Rate of Occurrence" value={annualRateOfOccurrence} onChange={setAnnualRateOfOccurrence} step="any" tooltip="Expected occurrences per year. Use 0.5 for once every two years." />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={hasValidationErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasValidationErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
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
          <div className="flex flex-col gap-4">
            {/* 1. PRIMARY RESULT CARD */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Inherent Risk Score</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{fmtInt(result.inherentScore)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                out of {MAX_SCORE} · {result.inherentBand} · residual {fmt(result.residualScore, 1)} ({result.residualBand})
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Inherent Band</span>
                <span className={`font-extrabold ${bandColor(result.inherentBand)}`}>{result.inherentBand}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Residual Band</span>
                <span className={`font-extrabold ${bandColor(result.residualBand)}`}>{result.residualBand}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Risk Reduction</span>
                <span className={`font-extrabold ${result.riskReductionPct >= 50 ? "text-emerald-600" : result.riskReductionPct >= 25 ? "text-amber-600" : "text-red-600"}`}>
                  {fmt(result.riskReductionPct, 0)}%
                </span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Factor</th>
                    <th className="py-2.5 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map(row => (
                    <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Residual Risk Score</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmt(result.residualScore, 1)} of {MAX_SCORE}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Control Coverage of Inherent Risk</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPie>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)} points`, "Risk"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  </RPie>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {chartData.map(d => {
                  const share = chartTotal > 0 ? (d.value / chartTotal) * 100 : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-semibold text-muted-foreground">{d.name}</span>
                      <span className="font-bold text-foreground">{fmt(share, 1)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Threat × Likelihood × Impact</span>
                  <span className="font-bold text-foreground">{fmtInt(parseFloat(threat) || 0)} × {fmtInt(parseFloat(likelihood) || 0)} × {fmtInt(parseFloat(impact) || 0)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Matrix Cell (L × I)</span>
                  <span className="font-bold text-foreground">{fmtInt(result.matrixScore)} of 25</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Inherent Risk Score</span>
                  <span className={`font-bold ${bandColor(result.inherentBand)}`}>{fmtInt(result.inherentScore)} of {MAX_SCORE}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Inherent Normalized</span>
                  <span className="font-bold text-foreground">{fmt(result.inherentNormalized, 1)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Control Effectiveness</span>
                  <span className="font-bold text-foreground">{fmt(controlNum, 0)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Detection Adjustment</span>
                  <span className="font-bold text-foreground">× {fmt(result.detectionFactor, 2)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Residual Risk Score</span>
                  <span className={`font-bold ${bandColor(result.residualBand)}`}>{fmt(result.residualScore, 1)} of {MAX_SCORE}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Asset Value</span>
                  <span className="font-bold text-foreground">{fmtMoney(assetNum)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Single Loss Expectancy</span>
                  <span className="font-bold text-foreground">{fmtMoney(result.singleLossExpectancy)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Annual Loss Expectancy</span>
                  <span className="font-bold text-foreground">{fmtMoney(result.annualLossExpectancy)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Residual Annual Loss</span>
                  <span className="font-bold text-foreground">{fmtMoney(result.residualAle)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Loss Avoided by Controls</span>
                  <span className="font-bold text-emerald-600">{fmtMoney(result.mitigatedAle)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.treatment}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How the Risk Score Is Built</h2>
            <p>The score multiplies three ordinal ratings, each on a one-to-five scale. Threat captures the capability and motivation of the adversary or hazard. Likelihood captures how probable successful exploitation is within the assessment period. Impact captures the severity of the consequence if it succeeds. Their product ranges from 1 to 125. Multiplication is used rather than addition on purpose: if any single factor is near zero — no credible threat actor, or negligible consequence — the whole risk collapses, which is the behaviour a risk register should exhibit.</p>
            <h2 className="text-2xl font-bold mb-3">Inherent Versus Residual Risk</h2>
            <p>Inherent risk is exposure before any credit for controls. Residual risk is what survives once control effectiveness and detection capability are applied. Governance frameworks including ISO 27005 and NIST SP 800-30 expect both to be recorded, and for good reason: a residual score of 12 that depends entirely on a single control is a materially different proposition from an inherent score of 12 that needs no control at all. Recording only the residual figure hides that dependency, and it is precisely the dependency that fails during an incident.</p>
            <h2 className="text-2xl font-bold mb-3">Why Detection Capability Is Separate</h2>
            <p>Preventive controls reduce the chance an incident happens. Detection determines how long it runs before anyone notices. Two organisations with identical prevention will suffer very different losses if one detects intrusion within hours and the other within months, because dwell time drives lateral movement, data staging and exfiltration volume. This calculator therefore applies a multiplier that runs from 1.00 at the strongest detection rating to 1.20 at the weakest, inflating residual exposure wherever visibility is poor.</p>
            <h2 className="text-2xl font-bold mb-3">Adding a Monetary View</h2>
            <p>Ordinal scores rank risks but do not price them, which makes control investment hard to argue. The advanced section adds the classic quantitative chain: single loss expectancy is asset value multiplied by exposure factor, the proportion of value destroyed in one occurrence; annual loss expectancy is that figure multiplied by the annual rate of occurrence. An annual loss expectancy of $87,500 tells you immediately whether a $30,000 control is worth buying, in a way that a score of 48 out of 125 never will.</p>
            <h2 className="text-2xl font-bold mb-3">Treating the Result</h2>
            <p>On the 125-point scale, 1 to 15 is Low, 16 to 40 Medium, 41 to 75 High and above 75 Critical. Low risks are normally accepted with periodic monitoring. Medium risks are mitigated or transferred through insurance or contractual terms. High risks require additional controls against a defined remediation date. Critical risks escalate to an executive owner and frequently trigger avoidance — discontinuing the activity. Be aware of the method's main limitation: ordinal ratings are not true numbers, so products of them can order risks in ways a fully quantitative approach such as FAIR would not. Treat this calculator as triage that identifies which risks deserve deeper quantitative analysis, not as the final word on any of them.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/risk-score-threat-likelihood-impact-calculator" />
          <PopularCalculators exclude="/calculator/risk-score-threat-likelihood-impact-calculator" />
        </div>
      </div>
    </>
  );
}
