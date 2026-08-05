"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type RatioType = "pf" | "sf";
type Vasoactive = "none" | "low" | "moderate" | "high";

interface PsofaInputs {
  ageMonths: number;
  ratioType: RatioType;
  oxygenationRatio: number;
  respiratorySupport: boolean;
  platelets: number;
  gcs: number;
  meanArterialPressure: number;
  vasoactive: Vasoactive;
  bilirubin: number;
  creatinine: number;
}

interface OrganScore {
  system: string;
  score: number;
  detail: string;
  color: string;
}

interface PsofaResult {
  respiratory: OrganScore;
  coagulation: OrganScore;
  hepatic: OrganScore;
  cardiovascular: OrganScore;
  neurologic: OrganScore;
  renal: OrganScore;
  organs: OrganScore[];
  totalScore: number;
  maxScore: number;
  band: "Low" | "Moderate" | "High" | "Very High";
  organsWithDysfunction: number;
  severeOrgans: number;
  ageBandLabel: string;
  interpretation: string;
}

const AGE_BAND_LABELS = [
  "Under 1 month",
  "1 to 11 months",
  "12 to 23 months",
  "24 to 59 months",
  "60 to 143 months",
  "144 to 216 months",
  "Over 216 months",
];

// Age-adjusted mean arterial pressure cut-off (mmHg) below which cardiovascular scores 1.
const MAP_CUTOFFS = [46, 55, 60, 62, 65, 67, 70];

// Age-adjusted serum creatinine (mg/dL) lower bounds for scores 1, 2, 3 and 4.
const CREATININE_CUTOFFS: number[][] = [
  [0.8, 1.0, 1.2, 1.6],
  [0.3, 0.5, 0.8, 1.2],
  [0.4, 0.6, 1.1, 1.5],
  [0.6, 0.9, 1.6, 2.3],
  [0.7, 1.1, 1.8, 2.6],
  [1.0, 1.7, 2.9, 4.2],
  [1.2, 2.0, 3.5, 5.0],
];

const BILIRUBIN_CUTOFFS = [1.2, 2.0, 6.0, 12.0];
const PLATELET_CUTOFFS = [150, 100, 50, 20];
const GCS_CUTOFFS = [15, 13, 10, 6];
const PF_CUTOFFS = [400, 300, 200, 100];
const SF_CUTOFFS = [292, 264, 221, 148];

const SCORE_COLORS = ["#10B981", "#84CC16", "#F59E0B", "#F97316", "#EF4444"];

const DEFAULTS: PsofaInputs = {
  ageMonths: 60,
  ratioType: "pf",
  oxygenationRatio: 220,
  respiratorySupport: true,
  platelets: 90,
  gcs: 12,
  meanArterialPressure: 60,
  vasoactive: "none",
  bilirubin: 1.5,
  creatinine: 0.9,
};

function ageBandIndex(months: number): number {
  if (months < 1) return 0;
  if (months < 12) return 1;
  if (months < 24) return 2;
  if (months < 60) return 3;
  if (months < 144) return 4;
  if (months <= 216) return 5;
  return 6;
}

// Ascending cut-offs: the score is the number of thresholds the value has reached or passed.
function scoreAscending(value: number, cutoffs: number[]): number {
  return cutoffs.reduce((acc, c) => (value >= c ? acc + 1 : acc), 0);
}

// Descending cut-offs: the score is the number of thresholds the value has fallen below.
function scoreDescending(value: number, cutoffs: number[]): number {
  return cutoffs.reduce((acc, c) => (value < c ? acc + 1 : acc), 0);
}

export function calculatePsofa(i: PsofaInputs): PsofaResult {
  const band = ageBandIndex(i.ageMonths);

  const respCutoffs = i.ratioType === "pf" ? PF_CUTOFFS : SF_CUTOFFS;
  let respScore = scoreDescending(i.oxygenationRatio, respCutoffs);
  // Scores of 3 and 4 require the patient to be receiving respiratory support.
  if (!i.respiratorySupport && respScore > 2) respScore = 2;
  const respiratory: OrganScore = {
    system: "Respiratory",
    score: respScore,
    detail: `${i.ratioType === "pf" ? "PaO₂/FiO₂" : "SpO₂/FiO₂"} ${i.oxygenationRatio}${i.respiratorySupport ? " with support" : ""}`,
    color: SCORE_COLORS[respScore],
  };

  const coagScore = scoreDescending(i.platelets, PLATELET_CUTOFFS);
  const coagulation: OrganScore = {
    system: "Coagulation",
    score: coagScore,
    detail: `Platelets ${i.platelets} ×10³/µL`,
    color: SCORE_COLORS[coagScore],
  };

  const hepScore = scoreAscending(i.bilirubin, BILIRUBIN_CUTOFFS);
  const hepatic: OrganScore = {
    system: "Hepatic",
    score: hepScore,
    detail: `Bilirubin ${i.bilirubin} mg/dL`,
    color: SCORE_COLORS[hepScore],
  };

  let cvScore: number;
  let cvDetail: string;
  if (i.vasoactive === "high") {
    cvScore = 4;
    cvDetail = "High-dose vasoactive support";
  } else if (i.vasoactive === "moderate") {
    cvScore = 3;
    cvDetail = "Moderate-dose vasoactive support";
  } else if (i.vasoactive === "low") {
    cvScore = 2;
    cvDetail = "Low-dose dopamine or any dobutamine";
  } else {
    cvScore = i.meanArterialPressure < MAP_CUTOFFS[band] ? 1 : 0;
    cvDetail = `MAP ${i.meanArterialPressure} mmHg (cut-off ${MAP_CUTOFFS[band]})`;
  }
  const cardiovascular: OrganScore = {
    system: "Cardiovascular",
    score: cvScore,
    detail: cvDetail,
    color: SCORE_COLORS[cvScore],
  };

  const neuroScore = scoreDescending(i.gcs, GCS_CUTOFFS);
  const neurologic: OrganScore = {
    system: "Neurologic",
    score: neuroScore,
    detail: `Glasgow Coma Scale ${i.gcs}`,
    color: SCORE_COLORS[neuroScore],
  };

  const renalScore = scoreAscending(i.creatinine, CREATININE_CUTOFFS[band]);
  const renal: OrganScore = {
    system: "Renal",
    score: renalScore,
    detail: `Creatinine ${i.creatinine} mg/dL`,
    color: SCORE_COLORS[renalScore],
  };

  const organs = [respiratory, coagulation, hepatic, cardiovascular, neurologic, renal];
  const totalScore = organs.reduce((sum, o) => sum + o.score, 0);

  let scoreBand: "Low" | "Moderate" | "High" | "Very High" = "Low";
  let interpretation = "Minimal organ dysfunction. Continue routine intensive care monitoring.";
  if (totalScore >= 16) {
    scoreBand = "Very High";
    interpretation = "Extensive multi-organ dysfunction. Mortality risk is very high in published cohorts.";
  } else if (totalScore >= 11) {
    scoreBand = "High";
    interpretation = "Substantial multi-organ dysfunction. Escalation of support is usually indicated.";
  } else if (totalScore >= 6) {
    scoreBand = "Moderate";
    interpretation = "Moderate organ dysfunction. Close monitoring and serial rescoring are advised.";
  }

  return {
    respiratory,
    coagulation,
    hepatic,
    cardiovascular,
    neurologic,
    renal,
    organs,
    totalScore,
    maxScore: 24,
    band: scoreBand,
    organsWithDysfunction: organs.filter(o => o.score > 0).length,
    severeOrgans: organs.filter(o => o.score >= 3).length,
    ageBandLabel: AGE_BAND_LABELS[band],
    interpretation,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function PediatricSofaScoreCalculator() {
  const [ageMonths, setAgeMonths] = useState(String(DEFAULTS.ageMonths));
  const [ratioType, setRatioType] = useState<RatioType>(DEFAULTS.ratioType);
  const [oxygenationRatio, setOxygenationRatio] = useState(String(DEFAULTS.oxygenationRatio));
  const [respiratorySupport, setRespiratorySupport] = useState(DEFAULTS.respiratorySupport);
  const [platelets, setPlatelets] = useState(String(DEFAULTS.platelets));
  const [gcs, setGcs] = useState(String(DEFAULTS.gcs));
  const [meanArterialPressure, setMeanArterialPressure] = useState(String(DEFAULTS.meanArterialPressure));
  const [vasoactive, setVasoactive] = useState<Vasoactive>(DEFAULTS.vasoactive);
  const [bilirubin, setBilirubin] = useState(String(DEFAULTS.bilirubin));
  const [creatinine, setCreatinine] = useState(String(DEFAULTS.creatinine));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<PsofaResult>(calculatePsofa(DEFAULTS));

  const getInputs = (): PsofaInputs => ({
    ageMonths: parseFloat(ageMonths) || 0,
    ratioType,
    oxygenationRatio: parseFloat(oxygenationRatio) || 0,
    respiratorySupport,
    platelets: parseFloat(platelets) || 0,
    gcs: parseFloat(gcs) || 0,
    meanArterialPressure: parseFloat(meanArterialPressure) || 0,
    vasoactive,
    bilirubin: parseFloat(bilirubin) || 0,
    creatinine: parseFloat(creatinine) || 0,
  });

  useEffect(() => {
    setResult(calculatePsofa(DEFAULTS));
  }, []);

  const ageNum = parseFloat(ageMonths) || 0;
  const gcsNum = parseFloat(gcs) || 0;
  const ratioNum = parseFloat(oxygenationRatio) || 0;
  const plateletNum = parseFloat(platelets) || 0;
  const mapNum = parseFloat(meanArterialPressure) || 0;
  const biliNum = parseFloat(bilirubin) || 0;
  const creatNum = parseFloat(creatinine) || 0;

  let errorMsg = "";
  if (ageNum < 0 || ageNum > 264) errorMsg = "Age must be between 0 and 264 months (22 years).";
  else if (gcsNum < 3 || gcsNum > 15) errorMsg = "Glasgow Coma Scale must be between 3 and 15.";
  else if (ratioNum <= 0) errorMsg = "Oxygenation ratio must be greater than zero.";
  else if (plateletNum < 0) errorMsg = "Platelet count cannot be negative.";
  else if (mapNum <= 0) errorMsg = "Mean arterial pressure must be greater than zero.";
  else if (biliNum < 0) errorMsg = "Bilirubin cannot be negative.";
  else if (creatNum < 0) errorMsg = "Creatinine cannot be negative.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResult(calculatePsofa(getInputs()));
  };

  const reset = () => {
    setAgeMonths(String(DEFAULTS.ageMonths));
    setRatioType(DEFAULTS.ratioType);
    setOxygenationRatio(String(DEFAULTS.oxygenationRatio));
    setRespiratorySupport(DEFAULTS.respiratorySupport);
    setPlatelets(String(DEFAULTS.platelets));
    setGcs(String(DEFAULTS.gcs));
    setMeanArterialPressure(String(DEFAULTS.meanArterialPressure));
    setVasoactive(DEFAULTS.vasoactive);
    setBilirubin(String(DEFAULTS.bilirubin));
    setCreatinine(String(DEFAULTS.creatinine));
    setResult(calculatePsofa(DEFAULTS));
  };

  const bandColor =
    result.band === "Low"
      ? "text-emerald-600"
      : result.band === "Moderate"
      ? "text-amber-600"
      : result.band === "High"
      ? "text-orange-600"
      : "text-red-600";
  const severeColor = result.severeOrgans === 0 ? "text-emerald-600" : result.severeOrgans <= 1 ? "text-amber-600" : "text-red-600";
  const dysfunctionColor = result.organsWithDysfunction <= 2 ? "text-emerald-600" : result.organsWithDysfunction <= 4 ? "text-amber-600" : "text-red-600";

  const chartData = result.organs.map(o => ({ name: o.system, value: o.score, color: o.color }));

  const faqs = [
    { question: "What is the pediatric SOFA score?", answer: "The pediatric Sequential Organ Failure Assessment score is an age-adapted version of the adult SOFA score, published by Matics and Sanchez-Pinto in 2017. It grades six organ systems from 0 to 4 for a maximum of 24 points. The adaptation replaces adult cut-offs for blood pressure and creatinine with age-specific thresholds, because normal values in a neonate differ enormously from those in an adolescent." },
    { question: "Which six organ systems are scored?", answer: "Respiratory, assessed by the PaO₂/FiO₂ or SpO₂/FiO₂ ratio; coagulation, by platelet count; hepatic, by serum bilirubin; cardiovascular, by age-adjusted mean arterial pressure or vasoactive requirement; neurologic, by the Glasgow Coma Scale; and renal, by age-adjusted serum creatinine. Each contributes 0 to 4 points and the six are summed." },
    { question: "Why do the cut-offs change with age?", answer: "A mean arterial pressure of 50 mmHg is normal for a neonate and shock for a sixteen-year-old. Serum creatinine follows the same pattern, rising with muscle mass through childhood, so a value of 0.9 mg/dL is markedly abnormal in an infant and unremarkable in an adolescent. The pediatric adaptation defines seven age bands and applies different thresholds to each for exactly this reason." },
    { question: "How is the respiratory component scored?", answer: "The PaO₂/FiO₂ ratio scores 0 at 400 or above, 1 from 300 to 399, 2 from 200 to 299, 3 from 100 to 199 and 4 below 100. Scores of 3 and 4 additionally require the patient to be receiving invasive or non-invasive respiratory support. The SpO₂/FiO₂ ratio uses corresponding thresholds of 292, 264, 221 and 148, which lets the score be calculated without an arterial blood gas." },
    { question: "How does the cardiovascular score handle vasoactive drugs?", answer: "Any vasoactive requirement overrides the blood-pressure criterion. Dopamine at 5 µg/kg/min or less, or dobutamine at any dose, scores 2. Dopamine above 5, or adrenaline or noradrenaline at 0.1 µg/kg/min or less, scores 3. Dopamine above 15, or adrenaline or noradrenaline above 0.1, scores 4. Only patients on no vasoactive support are scored on mean arterial pressure alone." },
    { question: "What does the total score mean?", answer: "Higher scores correspond to more extensive organ dysfunction and, in the validation cohorts, sharply higher PICU mortality — the maximum pSOFA score discriminated mortality with an area under the curve of roughly 0.94. The score is a severity measure rather than a probability calculator, so it should be read as a marker of trajectory and a trigger for escalation rather than an individual prognosis." },
    { question: "How often should the score be recalculated?", answer: "Daily, using the worst value for each variable in the preceding 24 hours, is the convention in both research and quality-improvement use. The trend matters more than any single figure: a score that climbs over consecutive days carries far worse implications than a static score of the same magnitude, and a falling score is among the more reassuring signals in critical care." },
    { question: "Can this replace clinical judgement?", answer: "No. The pSOFA score is a structured summary of laboratory and physiological data. It cannot see the diagnosis, the trajectory, the response to a recent intervention or the family's goals of care. It is widely used to standardise severity in research, to define organ dysfunction in pediatric sepsis criteria and to support handover, and it should be used alongside — never instead of — bedside assessment by the treating team." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Pediatric SOFA Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Pediatric SOFA Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="age" label="Age (months)" value={ageMonths} onChange={setAgeMonths} suffix="mo" tooltip="Patient age in months. Sets the age-adjusted blood pressure and creatinine thresholds." />
              <InputField id="ratio" label="PaO₂/FiO₂ Ratio" value={oxygenationRatio} onChange={setOxygenationRatio} tooltip="Oxygenation ratio. Switch to SpO₂/FiO₂ in Advanced Options if no arterial gas is available." />
              <InputField id="platelets" label="Platelets (×10³/µL)" value={platelets} onChange={setPlatelets} tooltip="Lowest platelet count in the preceding 24 hours." />
              <InputField id="gcs" label="Glasgow Coma Scale" value={gcs} onChange={setGcs} tooltip="Total GCS from 3 to 15. Use the pre-sedation value where possible." />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Respiratory</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ratio-type" className="flex items-center text-sm font-medium text-foreground mb-1">Ratio Type</label>
                        <select
                          id="ratio-type"
                          value={ratioType}
                          onChange={e => setRatioType(e.target.value as RatioType)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="pf">PaO₂/FiO₂</option>
                          <option value="sf">SpO₂/FiO₂</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-foreground self-end h-10">
                        <input
                          type="checkbox"
                          checked={respiratorySupport}
                          onChange={e => setRespiratorySupport(e.target.checked)}
                          className="h-4 w-4 rounded border-input accent-primary"
                        />
                        Respiratory support
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Cardiovascular</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="map" label="MAP (mmHg)" value={meanArterialPressure} onChange={setMeanArterialPressure} suffix="mmHg" tooltip="Mean arterial pressure. Used only when no vasoactive agent is running." disabled={vasoactive !== "none"} />
                      <div>
                        <label htmlFor="vasoactive" className="flex items-center text-sm font-medium text-foreground mb-1">Vasoactive Support</label>
                        <select
                          id="vasoactive"
                          value={vasoactive}
                          onChange={e => setVasoactive(e.target.value as Vasoactive)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="none">None</option>
                          <option value="low">Dopamine ≤5 or any dobutamine</option>
                          <option value="moderate">Dopamine &gt;5, epi/norepi ≤0.1</option>
                          <option value="high">Dopamine &gt;15, epi/norepi &gt;0.1</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Hepatic &amp; Renal</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="bilirubin" label="Bilirubin (mg/dL)" value={bilirubin} onChange={setBilirubin} step="any" tooltip="Total serum bilirubin in mg/dL." />
                      <InputField id="creatinine" label="Creatinine (mg/dL)" value={creatinine} onChange={setCreatinine} step="any" tooltip="Serum creatinine in mg/dL, scored against age-specific thresholds." />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Total pSOFA Score</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{fmtInt(result.totalScore)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                out of {result.maxScore} · {result.band} severity · {result.ageBandLabel}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Severity Band</span>
                <span className={`font-extrabold ${bandColor}`}>{result.band}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Organs Affected</span>
                <span className={`font-extrabold ${dysfunctionColor}`}>{fmtInt(result.organsWithDysfunction)} of 6</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Severe (≥3)</span>
                <span className={`font-extrabold ${severeColor}`}>{fmtInt(result.severeOrgans)}</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Organ System</th>
                    <th className="py-2.5 px-3">Measured Value</th>
                    <th className="py-2.5 px-3 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {result.organs.map(o => {
                    const isWorst = o.score === Math.max(...result.organs.map(x => x.score)) && o.score > 0;
                    return (
                      <tr key={o.system} className={`hover:bg-secondary/20 transition-colors ${isWorst ? "bg-amber-500/10" : ""}`}>
                        <td className={`py-2.5 px-3 font-semibold ${isWorst ? "text-amber-700" : "text-foreground"}`}>{o.system}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-sm">{o.detail}</td>
                        <td className={`py-2.5 px-3 text-right font-bold ${isWorst ? "text-amber-700" : "text-foreground"}`}>{o.score}</td>
                      </tr>
                    );
                  })}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground">Age Band</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-sm">{result.ageBandLabel}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-muted-foreground">—</td>
                  </tr>
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-foreground">Organs With Dysfunction</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-sm">Any score above zero</td>
                    <td className="py-2.5 px-3 text-right font-bold text-foreground">{fmtInt(result.organsWithDysfunction)}</td>
                  </tr>
                  <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                    <td className="py-2.5 px-3 text-foreground">Total pSOFA Score</td>
                    <td className="py-2.5 px-3 text-muted-foreground text-sm">{result.band} severity</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmtInt(result.totalScore)} / {result.maxScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Organ Dysfunction Profile</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={30} domain={[0, 4]} allowDecimals={false} />
                    <Tooltip formatter={(v: number) => [`${fmtInt(v)} of 4 points`, "Sub-score"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                {chartData.map(d => {
                  const share = result.totalScore > 0 ? (d.value / result.totalScore) * 100 : 0;
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
                {result.organs.map(o => (
                  <div key={o.system} className="flex justify-between border-b border-border/50 py-1">
                    <span className="text-muted-foreground font-medium">{o.system}</span>
                    <span className="font-bold" style={{ color: o.color }}>{o.score} pts</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Age Band</span>
                  <span className="font-bold text-foreground">{result.ageBandLabel}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Organs With Dysfunction</span>
                  <span className={`font-bold ${dysfunctionColor}`}>{fmtInt(result.organsWithDysfunction)} of 6</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Severe Organs (≥3)</span>
                  <span className={`font-bold ${severeColor}`}>{fmtInt(result.severeOrgans)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total pSOFA Score</span>
                  <span className={`font-bold ${bandColor}`}>{fmtInt(result.totalScore)} / {result.maxScore}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.interpretation}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What the Pediatric SOFA Score Measures</h2>
            <p>The pediatric Sequential Organ Failure Assessment score grades six organ systems from 0 to 4 and sums them for a maximum of 24 points. Published by Matics and Sanchez-Pinto in 2017, it adapts the adult SOFA score for children by replacing fixed adult thresholds for blood pressure and serum creatinine with values specific to seven age bands. The six components are respiratory function, measured by the PaO₂/FiO₂ or SpO₂/FiO₂ ratio; coagulation, by platelet count; hepatic function, by bilirubin; cardiovascular status, by age-adjusted mean arterial pressure or vasoactive requirement; neurologic function, by the Glasgow Coma Scale; and renal function, by age-adjusted creatinine.</p>
            <h2 className="text-2xl font-bold mb-3">Why Age-Specific Thresholds Matter</h2>
            <p>A mean arterial pressure of 50 mmHg is entirely normal in a neonate and represents shock in an adolescent. Serum creatinine behaves the same way, climbing with muscle mass through childhood, so 0.9 mg/dL is a marked abnormality in an infant and unremarkable at sixteen. Applying adult cut-offs to children therefore misclassifies dysfunction in both directions — over-calling it in the young and under-calling it in the older. The seven age bands used here exist to correct that, and the calculator applies the appropriate blood-pressure and creatinine thresholds automatically once age is entered.</p>
            <h2 className="text-2xl font-bold mb-3">How the Components Are Scored</h2>
            <p>Respiratory scores of 3 and 4 require the patient to be receiving invasive or non-invasive respiratory support, which is why that condition is a separate switch rather than an assumption. The SpO₂/FiO₂ option exists so the score can be completed without an arterial blood gas, using thresholds of 292, 264, 221 and 148 in place of the PaO₂/FiO₂ values. On the cardiovascular side, any vasoactive requirement overrides the blood-pressure criterion entirely: low-dose dopamine or any dobutamine scores 2, higher-dose dopamine or modest adrenaline and noradrenaline score 3, and high doses score 4. Only a patient on no vasoactive support is graded on mean arterial pressure alone.</p>
            <h2 className="text-2xl font-bold mb-3">Reading the Result</h2>
            <p>Higher totals correspond to more extensive organ dysfunction and, in the validation cohorts, sharply higher pediatric intensive care mortality — the maximum pSOFA score discriminated mortality with an area under the curve of roughly 0.94. The convention is to recalculate daily using the worst value for each variable in the preceding 24 hours. The trend is more informative than any single figure: a score climbing across consecutive days is a far worse signal than a static score of equal magnitude, and a falling score is among the more reassuring trajectories in critical care.</p>
            <h2 className="text-2xl font-bold mb-3">Scope and Limitations</h2>
            <p>This score is a structured summary of physiological and laboratory data. It carries no information about the underlying diagnosis, the response to a recent intervention, or the family's goals of care. It is widely used to standardise severity in research, to operationalise organ dysfunction within pediatric sepsis criteria, and to support structured handover. It is not a prognostic calculator for an individual patient and must not be used to make treatment decisions in place of bedside assessment by the treating clinical team.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/pediatric-sofa-score-calculator" />
          <PopularCalculators exclude="/calculator/pediatric-sofa-score-calculator" />
        </div>
      </div>
    </>
  );
}
