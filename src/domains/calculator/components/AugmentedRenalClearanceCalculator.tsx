"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, Activity, FlaskConical, Stethoscope } from "lucide-react";
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

type Sex = "male" | "female";
type CreatinineUnit = "mgdl" | "umol";

interface ArcInputs {
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  serumCreatinine: number;
  creatinineUnit: CreatinineUnit;
  useMeasured: boolean;
  urineVolumeMl: number;
  urineCollectionHours: number;
  urineCreatinine: number;
  proMode: boolean;
  sofaScore: number;
  traumaAdmission: boolean;
}

interface ChartPoint {
  name: string;
  value: number;
  isSubject: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface ArcResult {
  bsa: number;
  idealBodyWeight: number;
  adjustedBodyWeight: number;
  dosingWeight: number;
  creatinineMgDl: number;
  cockcroftGault: number;
  measuredCrCl: number;
  normalisedCrCl: number;
  reportedCrCl: number;
  hasArc: boolean;
  arcCategory: string;
  arcColor: string;
  arcticScore: number;
  arcticRiskPercent: string;
  chartData: ChartPoint[];
  rows: TableRow[];
  vancomycinNote: string;
  betaLactamNote: string;
  monitoringNote: string;
}

// ARC is conventionally defined as creatinine clearance at or above
// 130 mL/min/1.73 m2 sustained over at least 24 hours.
const ARC_THRESHOLD = 130;
const UMOL_TO_MGDL = 1 / 88.4;

const DEFAULTS: ArcInputs = {
  age: 32,
  sex: "male",
  weightKg: 78,
  heightCm: 178,
  serumCreatinine: 0.62,
  creatinineUnit: "mgdl",
  useMeasured: false,
  urineVolumeMl: 2400,
  urineCollectionHours: 24,
  urineCreatinine: 95,
  proMode: false,
  sofaScore: 3,
  traumaAdmission: true,
};

export function calculateArc(i: ArcInputs): ArcResult {
  const age = Math.max(1, i.age);
  const weight = Math.max(1, i.weightKg);
  const height = Math.max(1, i.heightCm);

  const creatinineMgDl =
    i.creatinineUnit === "umol"
      ? Math.max(0.01, i.serumCreatinine) * UMOL_TO_MGDL
      : Math.max(0.01, i.serumCreatinine);

  // Du Bois body surface area.
  const bsa = 0.007184 * Math.pow(height, 0.725) * Math.pow(weight, 0.425);

  // Devine ideal body weight.
  const heightInches = height / 2.54;
  const inchesOver60 = Math.max(0, heightInches - 60);
  const idealBodyWeight =
    (i.sex === "male" ? 50 : 45.5) + 2.3 * inchesOver60;
  const adjustedBodyWeight = idealBodyWeight + 0.4 * (weight - idealBodyWeight);

  // Cockcroft-Gault dosing weight convention: use actual weight when below IBW,
  // IBW when normal, and adjusted body weight when 30% or more above IBW.
  let dosingWeight: number;
  if (weight < idealBodyWeight) {
    dosingWeight = weight;
  } else if (weight >= idealBodyWeight * 1.3) {
    dosingWeight = adjustedBodyWeight;
  } else {
    dosingWeight = idealBodyWeight;
  }

  // Cockcroft-Gault: ((140 - age) x weight) / (72 x SCr), x 0.85 for females.
  const cgRaw = ((140 - age) * dosingWeight) / (72 * creatinineMgDl);
  const cockcroftGault = i.sex === "female" ? cgRaw * 0.85 : cgRaw;

  // Measured clearance from a timed urine collection:
  // CrCl = (urine creatinine x urine volume) / (serum creatinine x time in min)
  const collectionMinutes = Math.max(1, i.urineCollectionHours) * 60;
  const measuredCrCl =
    (Math.max(0, i.urineCreatinine) * Math.max(0, i.urineVolumeMl)) /
    (creatinineMgDl * collectionMinutes);

  const reportedCrCl = i.useMeasured ? measuredCrCl : cockcroftGault;
  const normalisedCrCl = bsa > 0 ? (reportedCrCl * 1.73) / bsa : reportedCrCl;

  const hasArc = normalisedCrCl >= ARC_THRESHOLD;

  let arcCategory: string;
  let arcColor: string;
  if (normalisedCrCl >= 200) {
    arcCategory = "Extreme augmented renal clearance";
    arcColor = "text-red-600";
  } else if (normalisedCrCl >= 160) {
    arcCategory = "Marked augmented renal clearance";
    arcColor = "text-red-600";
  } else if (normalisedCrCl >= ARC_THRESHOLD) {
    arcCategory = "Augmented renal clearance";
    arcColor = "text-amber-600";
  } else if (normalisedCrCl >= 90) {
    arcCategory = "Normal clearance";
    arcColor = "text-emerald-600";
  } else if (normalisedCrCl >= 60) {
    arcCategory = "Mildly reduced clearance";
    arcColor = "text-amber-600";
  } else {
    arcCategory = "Reduced clearance — dose reduction likely";
    arcColor = "text-red-600";
  }

  // ARCTIC score: age under 50 scores 6, age 50-59 scores 3, female sex scores 0
  // and male scores 4, SOFA 4 or higher scores 1. A total of 6 or more is the
  // published screening cut-off.
  let arcticScore = 0;
  if (age < 50) arcticScore += 6;
  else if (age < 60) arcticScore += 3;
  if (i.sex === "male") arcticScore += 4;
  if (Math.max(0, i.sofaScore) >= 4) arcticScore += 1;

  let arcticRiskPercent: string;
  if (arcticScore >= 10) arcticRiskPercent = "High (~70-80% of similar patients)";
  else if (arcticScore >= 6) arcticRiskPercent = "Elevated (~50-60%) — screening cut-off met";
  else if (arcticScore >= 4) arcticRiskPercent = "Intermediate (~25-35%)";
  else arcticRiskPercent = "Low (under 15%)";

  const chartData: ChartPoint[] = [
    { name: "This patient", value: Math.round(normalisedCrCl), isSubject: true },
    { name: "ARC threshold", value: ARC_THRESHOLD, isSubject: false },
    { name: "Healthy adult", value: 100, isSubject: false },
    { name: "CKD stage 3a", value: 52, isSubject: false },
    { name: "CKD stage 4", value: 22, isSubject: false },
  ];

  const vancomycinNote = hasArc
    ? "Standard weight-based dosing will likely underexpose — consider higher total daily dose with AUC-guided monitoring"
    : "Standard weight-based dosing with routine AUC or trough monitoring";
  const betaLactamNote = hasArc
    ? "Consider extended or continuous infusion to maintain time above MIC"
    : "Intermittent dosing generally adequate";
  const monitoringNote = hasArc
    ? "Re-measure clearance every 24-48 h; ARC often resolves as the acute phase settles"
    : "Routine renal monitoring per unit protocol";

  const rows: TableRow[] = [
    { label: "Serum Creatinine", value: `${creatinineMgDl.toFixed(2)} mg/dL (${(creatinineMgDl * 88.4).toFixed(1)} µmol/L)` },
    { label: "Body Surface Area (Du Bois)", value: `${bsa.toFixed(2)} m²` },
    { label: "Ideal Body Weight (Devine)", value: `${idealBodyWeight.toFixed(1)} kg` },
    { label: "Dosing Weight Used", value: `${dosingWeight.toFixed(1)} kg` },
    { label: "Cockcroft-Gault CrCl", value: `${cockcroftGault.toFixed(1)} mL/min` },
    { label: "Measured CrCl (urine)", value: `${measuredCrCl.toFixed(1)} mL/min` },
    { label: "BSA-Normalised CrCl", value: `${normalisedCrCl.toFixed(1)} mL/min/1.73 m²`, key: true },
    { label: "ARC Threshold", value: `${ARC_THRESHOLD} mL/min/1.73 m²` },
    { label: "ARC Present", value: hasArc ? "Yes" : "No" },
    { label: "Clearance Category", value: arcCategory },
    { label: "ARCTIC Score", value: `${arcticScore} / 11` },
    { label: "ARCTIC Risk Band", value: arcticRiskPercent },
  ];

  return {
    bsa,
    idealBodyWeight,
    adjustedBodyWeight,
    dosingWeight,
    creatinineMgDl,
    cockcroftGault,
    measuredCrCl,
    normalisedCrCl,
    reportedCrCl,
    hasArc,
    arcCategory,
    arcColor,
    arcticScore,
    arcticRiskPercent,
    chartData,
    rows,
    vancomycinNote,
    betaLactamNote,
    monitoringNote,
  };
}
const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function AugmentedRenalClearanceCalculator() {
  const [inputs, setInputs] = useState<ArcInputs>(DEFAULTS);
  const [result, setResult] = useState<ArcResult>(calculateArc(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateArc(inputs));
  }, []);

  const calculate = () => setResult(calculateArc(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateArc(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof ArcInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const faqs = [
    {
      question: "What is augmented renal clearance?",
      answer:
        "Augmented renal clearance, or ARC, is a sustained increase in kidney filtration above normal, conventionally defined as a creatinine clearance at or above 130 mL/min/1.73 m² persisting for at least 24 hours. It is not a disease and not a lab error. It reflects the hyperdynamic circulation of critical illness — raised cardiac output and renal blood flow drive glomerular filtration above baseline, which clears renally eliminated drugs faster than standard dosing assumes.",
    },
    {
      question: "Who develops ARC?",
      answer:
        "It is common in critically ill patients who are young, male, and have relatively low illness severity scores — a combination that sounds counterintuitive until you recognise ARC as a marker of preserved physiological reserve rather than organ failure. Trauma, sepsis in the hyperdynamic phase, burns, subarachnoid haemorrhage, and the post-operative period are all associated. Reported prevalence in mixed ICU cohorts runs from 20% to over 65% depending on the population and the definition used.",
    },
    {
      question: "Why does ARC matter for antibiotic dosing?",
      answer:
        "Because standard doses were validated in patients with normal clearance. When clearance doubles, plasma concentrations fall proportionally, and beta-lactams in particular can spend too little time above the pathogen's minimum inhibitory concentration to be effective. This produces treatment failure and selects for resistance despite a technically correct prescription. ARC is one of the better-documented reasons that a patient on an appropriate antibiotic at an appropriate dose fails to improve.",
    },
    {
      question: "Is a low serum creatinine enough to identify ARC?",
      answer:
        "It is a useful flag but not sufficient. A creatinine of 0.5 mg/dL in a muscular young trauma patient strongly suggests high clearance, but creatinine production depends on muscle mass, so a low value in a frail or cachectic patient may reflect reduced production rather than raised filtration. This is exactly where estimating equations mislead, and why a timed urine collection is the reference standard when the dosing decision matters.",
    },
    {
      question: "Should I use Cockcroft-Gault or a measured collection?",
      answer:
        "Use a measured collection when you can. Cockcroft-Gault was derived in stable outpatients and systematically underestimates clearance in the ARC range, meaning it can miss the very patients it matters most to identify. An 8 to 24 hour timed urine creatinine clearance is the practical reference standard in the ICU, and 8-hour collections correlate well enough with 24-hour values to be clinically usable. This calculator reports both so you can see the gap.",
    },
    {
      question: "Why normalise to 1.73 m² of body surface area?",
      answer:
        "Because the 130 mL/min ARC threshold is defined per 1.73 m², the standard adult body surface area. A large patient can have an absolute clearance of 140 mL/min that normalises to 115 and is not ARC, while a small patient at 125 mL/min absolute may normalise to 140 and is. Skipping the normalisation step biases identification by body size, which is why this calculator reports both the absolute and normalised values.",
    },
    {
      question: "What is the ARCTIC score?",
      answer:
        "The ARCTIC score is a bedside screening tool that weights age under 50 at 6 points, age 50 to 59 at 3, male sex at 4, and a SOFA score of 4 or higher at 1 point. A total of 6 or more is the published cut-off for suspecting ARC and pursuing a measured clearance. It is a screening instrument, not a substitute for measurement — its purpose is to tell you which patients warrant a timed collection rather than to quantify clearance itself.",
    },
    {
      question: "How should dosing change when ARC is present?",
      answer:
        "The general principles are to increase total daily dose for concentration-dependent agents and to extend the infusion for time-dependent ones. Beta-lactams benefit from extended or continuous infusion to maintain time above MIC; vancomycin typically needs a higher total daily dose with AUC-guided monitoring. Use therapeutic drug monitoring wherever available, and re-measure clearance every 24 to 48 hours, because ARC frequently resolves as the hyperdynamic phase settles and a dose that was correct on day two can be excessive on day five. These are general considerations, not a dosing prescription — specific regimens belong with the treating team and a clinical pharmacist.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator/health" },
          { label: "Augmented Renal Clearance Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Augmented Renal Clearance Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age" className={lbl}>Age (years)</label>
                <input id="age" type="number" min="1" step="1" className={inp} value={inputs.age}
                  onChange={(e) => setNum("age", e.target.value)} />
              </div>
              <div>
                <label htmlFor="sex" className={lbl}>Sex</label>
                <select id="sex" className={inp} value={inputs.sex}
                  onChange={(e) => setInputs((p) => ({ ...p, sex: e.target.value as Sex }))}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="weightKg" className={lbl}>Weight (kg)</label>
                <input id="weightKg" type="number" min="1" step="0.5" className={inp} value={inputs.weightKg}
                  onChange={(e) => setNum("weightKg", e.target.value)} />
              </div>
              <div>
                <label htmlFor="serumCreatinine" className={lbl}>Serum Creatinine</label>
                <input id="serumCreatinine" type="number" min="0.01" step="0.01" className={inp}
                  value={inputs.serumCreatinine} onChange={(e) => setNum("serumCreatinine", e.target.value)} />
              </div>
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
                      <Activity className="h-3.5 w-3.5" /> Anthropometry &amp; Units
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="heightCm" className={lbl}>Height (cm)</label>
                        <input id="heightCm" type="number" min="1" step="1" className={inp} value={inputs.heightCm}
                          onChange={(e) => setNum("heightCm", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="creatinineUnit" className={lbl}>Creatinine Unit</label>
                        <select id="creatinineUnit" className={inp} value={inputs.creatinineUnit}
                          onChange={(e) => setInputs((p) => ({ ...p, creatinineUnit: e.target.value as CreatinineUnit }))}>
                          <option value="mgdl">mg/dL</option>
                          <option value="umol">µmol/L</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <FlaskConical className="h-3.5 w-3.5" /> Timed Urine Collection
                    </div>
                    <label htmlFor="useMeasured" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="useMeasured" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.useMeasured}
                        onChange={(e) => setInputs((p) => ({ ...p, useMeasured: e.target.checked }))} />
                      Use measured clearance as the primary result
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="urineVolumeMl" className={lbl}>Urine Volume (mL)</label>
                        <input id="urineVolumeMl" type="number" min="0" step="50" className={inp}
                          value={inputs.urineVolumeMl} onChange={(e) => setNum("urineVolumeMl", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="urineCollectionHours" className={lbl}>Collection (hours)</label>
                        <input id="urineCollectionHours" type="number" min="1" step="1" className={inp}
                          value={inputs.urineCollectionHours} onChange={(e) => setNum("urineCollectionHours", e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="urineCreatinine" className={lbl}>Urine Creatinine (mg/dL)</label>
                        <input id="urineCreatinine" type="number" min="0" step="1" className={inp}
                          value={inputs.urineCreatinine} onChange={(e) => setNum("urineCreatinine", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Stethoscope className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock ARCTIC screening and dosing considerations
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="sofaScore" className={lbl}>SOFA Score</label>
                          <input id="sofaScore" type="number" min="0" max="24" step="1" className={inp}
                            value={inputs.sofaScore} onChange={(e) => setNum("sofaScore", e.target.value)} />
                        </div>
                        <div className="flex items-end">
                          <label htmlFor="traumaAdmission" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer h-10">
                            <input id="traumaAdmission" type="checkbox" className="h-4 w-4 accent-primary"
                              checked={inputs.traumaAdmission}
                              onChange={(e) => setInputs((p) => ({ ...p, traumaAdmission: e.target.checked }))} />
                            Trauma admission
                          </label>
                        </div>
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Normalised Creatinine Clearance</div>
              <div className="text-4xl font-bold text-primary my-1">{result.normalisedCrCl.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">
                mL/min/1.73 m² — {inputs.useMeasured ? "measured collection" : "Cockcroft-Gault estimate"}
              </div>
              <div className={`text-base font-bold mt-2 ${result.arcColor}`}>{result.arcCategory}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">ARC Present</div>
                <div className={`text-lg font-bold ${result.hasArc ? "text-red-600" : "text-emerald-600"}`}>
                  {result.hasArc ? "Yes" : "No"}
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cockcroft-Gault</div>
                <div className="text-lg font-bold text-amber-600">{result.cockcroftGault.toFixed(0)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">ARCTIC Score</div>
                <div className={`text-lg font-bold ${result.arcticScore >= 6 ? "text-red-600" : "text-emerald-600"}`}>
                  {result.arcticScore}
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
                    <td className="text-base py-2.5 px-3 text-foreground">Normalised CrCl</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.normalisedCrCl.toFixed(1)} mL/min/1.73 m²</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Clearance in Context (mL/min/1.73 m²)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip formatter={(value: number) => `${value} mL/min/1.73 m²`}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={ARC_THRESHOLD} stroke="#EF4444" strokeDasharray="4 4" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name}
                          fill={point.isSubject ? (result.hasArc ? "#EF4444" : "#2563EB") : "#94A3B8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: result.hasArc ? "#EF4444" : "#2563EB" }} /> This patient
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#94A3B8" }} /> Reference band
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#EF4444" }} /> ARC threshold (130)
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">ARCTIC Screening &amp; Dosing Considerations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">ARCTIC Score</div>
                    <div className={`text-base font-bold ${result.arcticScore >= 6 ? "text-red-600" : "text-emerald-600"}`}>
                      {result.arcticScore} / 11 {result.arcticScore >= 6 ? "— cut-off met" : ""}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Screening Risk Band</div>
                    <div className="text-base font-bold text-foreground">{result.arcticRiskPercent}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Beta-Lactam Consideration</div>
                    <div className="text-base font-bold text-foreground">{result.betaLactamNote}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Vancomycin Consideration</div>
                    <div className="text-base font-bold text-foreground">{result.vancomycinNote}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Monitoring</div>
                    <div className="text-base font-bold text-foreground">{result.monitoringNote}</div>
                  </div>
                  <div className="col-span-2 pt-1">
                    <div className="text-sm text-muted-foreground">
                      These are general pharmacokinetic considerations for education, not dosing instructions. Specific
                      regimens require the treating team, a clinical pharmacist, and therapeutic drug monitoring.
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
            <h2 className="text-2xl font-bold mb-3">Kidneys That Work Too Well</h2>
            <p className="mb-4">
              Augmented renal clearance is the mirror image of the renal problem clinicians are trained to look for.
              Instead of filtration falling and drugs accumulating, filtration rises and drugs disappear faster than the
              dosing interval assumes. The conventional definition is a creatinine clearance at or above 130 mL/min/1.73 m²
              sustained for at least 24 hours. The mechanism is the hyperdynamic circulation of critical illness: raised
              cardiac output increases renal blood flow, which increases glomerular filtration well above baseline.
            </p>

            <h2 className="text-2xl font-bold mb-3">The Counterintuitive Risk Profile</h2>
            <p className="mb-4">
              ARC is most common in patients who look least sick by conventional severity scoring — young, male, with
              relatively low SOFA scores, often admitted after trauma or in the hyperdynamic phase of sepsis. That pattern
              makes sense once you read ARC as a marker of preserved physiological reserve rather than organ dysfunction.
              The ARCTIC score formalises it, weighting age under 50 at 6 points, age 50 to 59 at 3, male sex at 4, and a
              SOFA score of 4 or higher at 1, with a total of 6 or more prompting a measured clearance. Reported prevalence
              in mixed ICU cohorts ranges from roughly 20% to over 65% depending on population and definition.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why Estimating Equations Fail Here</h2>
            <p className="mb-4">
              Cockcroft-Gault was derived in stable outpatients with normal or reduced function, and it systematically
              underestimates clearance in the augmented range — precisely where the miss carries the greatest cost. Serum
              creatinine compounds the problem because production depends on muscle mass: a value of 0.5 mg/dL means high
              filtration in a muscular young trauma patient but may mean low production in a cachectic one. A timed urine
              collection, 8 to 24 hours, remains the practical reference standard, and 8-hour collections track 24-hour
              values closely enough for clinical use. Normalising to 1.73 m² matters too, since the 130 threshold is
              defined per standard body surface area and skipping the step biases detection by patient size.
            </p>

            <h2 className="text-2xl font-bold mb-3">What Changes at the Bedside</h2>
            <p>
              The clinical consequence is antibiotic underexposure. Beta-lactams are time-dependent, so raised clearance
              shortens the fraction of the interval spent above the pathogen's minimum inhibitory concentration, which
              argues for extended or continuous infusion rather than simply a bigger bolus. Vancomycin typically requires a
              higher total daily dose under AUC-guided monitoring. Equally important is that ARC is dynamic: it commonly
              resolves as the hyperdynamic phase settles, so a regimen that was correct on day two may be excessive by day
              five, and clearance should be re-measured every 24 to 48 hours. This calculator is an educational tool for
              understanding those relationships — dosing decisions belong with the treating team, a clinical pharmacist,
              and therapeutic drug monitoring where available.
            </p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/augmented-renal-clearance-calculator" />
          <PopularCalculators exclude="/calculator/augmented-renal-clearance-calculator" />
        </div>
      </div>
    </>
  );
}
