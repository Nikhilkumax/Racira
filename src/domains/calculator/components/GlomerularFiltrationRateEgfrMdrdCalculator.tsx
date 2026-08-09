"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, ChevronDown, User, FlaskConical, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type Sex = "male" | "female";
type CreatUnit = "mgdl" | "umoll";

interface EgfrInputs {
  serumCreatinine: number;
  creatUnit: CreatUnit;
  age: number;
  sex: Sex;
  isBlack: boolean;
  proMode: boolean;
  weightKg: number;
  heightCm: number;
  serumAlbumin: number;
  bun: number;
}

interface ChartPoint {
  name: string;
  value: number;
  isCurrent?: boolean;
}

interface TableRow {
  label: string;
  value: string;
  key?: boolean;
}

interface EgfrResult {
  egfr: number;
  egfrNonIndexed: number;
  creatinineMgDl: number;
  stage: string;
  stageLabel: string;
  stageColor: string;
  description: string;
  cockcroftGault: number;
  bsa: number;
  idealBodyWeight: number;
  mdrd6Variable: number;
  percentFunction: number;
  chartData: ChartPoint[];
  rows: TableRow[];
}

const UMOL_PER_MGDL = 88.4;

// KDIGO CKD stages by eGFR in mL/min/1.73 m2.
const STAGES = [
  { min: 90, code: "G1", label: "Normal or High", color: "#16a34a", description: "Normal kidney function. If markers of kidney damage such as albuminuria are present, this is still classified as CKD stage G1." },
  { min: 60, code: "G2", label: "Mildly Decreased", color: "#65a30d", description: "Mildly reduced filtration. Common with aging and not classified as CKD unless other evidence of kidney damage exists." },
  { min: 45, code: "G3a", label: "Mild to Moderate", color: "#f59e0b", description: "Mild to moderately decreased filtration. Warrants monitoring, medication dose review, and evaluation for causes and complications." },
  { min: 30, code: "G3b", label: "Moderate to Severe", color: "#f97316", description: "Moderately to severely decreased filtration. Anemia, bone mineral disorder, and electrolyte abnormalities become more likely." },
  { min: 15, code: "G4", label: "Severely Decreased", color: "#dc2626", description: "Severely decreased filtration. Nephrology referral and planning for renal replacement therapy are generally indicated." },
  { min: 0, code: "G5", label: "Kidney Failure", color: "#991b1b", description: "Kidney failure. Dialysis or transplantation is usually required unless a conservative pathway has been chosen." },
];

const DEFAULTS: EgfrInputs = {
  serumCreatinine: 1.2,
  creatUnit: "mgdl",
  age: 55,
  sex: "male",
  isBlack: false,
  proMode: false,
  weightKg: 80,
  heightCm: 175,
  serumAlbumin: 4,
  bun: 16,
};

function stageFor(egfr: number) {
  return STAGES.find((s) => egfr >= s.min) ?? STAGES[STAGES.length - 1];
}

function calculateEgfr(inputs: EgfrInputs): EgfrResult {
  const creatinineMgDl =
    inputs.creatUnit === "umoll" ? inputs.serumCreatinine / UMOL_PER_MGDL : inputs.serumCreatinine;

  const safeCreat = creatinineMgDl > 0 ? creatinineMgDl : 0.01;
  const safeAge = inputs.age > 0 ? inputs.age : 1;

  // IDMS-traceable 4-variable MDRD study equation.
  let egfr = 175 * Math.pow(safeCreat, -1.154) * Math.pow(safeAge, -0.203);
  if (inputs.sex === "female") egfr *= 0.742;
  if (inputs.isBlack) egfr *= 1.212;

  // 6-variable MDRD adds albumin and BUN terms.
  const safeAlb = inputs.serumAlbumin > 0 ? inputs.serumAlbumin : 0.1;
  const safeBun = inputs.bun > 0 ? inputs.bun : 0.1;
  let mdrd6 =
    161.5 *
    Math.pow(safeCreat, -0.999) *
    Math.pow(safeAge, -0.176) *
    Math.pow(safeBun, -0.17) *
    Math.pow(safeAlb, 0.318);
  if (inputs.sex === "female") mdrd6 *= 0.762;
  if (inputs.isBlack) mdrd6 *= 1.18;

  // Du Bois BSA, used to de-index eGFR back to absolute mL/min.
  const bsa = 0.007184 * Math.pow(inputs.heightCm, 0.725) * Math.pow(inputs.weightKg, 0.425);
  const egfrNonIndexed = egfr * (bsa / 1.73);

  // Devine ideal body weight, then Cockcroft-Gault creatinine clearance.
  const heightInches = inputs.heightCm / 2.54;
  const inchesOver60 = Math.max(0, heightInches - 60);
  const idealBodyWeight =
    inputs.sex === "male" ? 50 + 2.3 * inchesOver60 : 45.5 + 2.3 * inchesOver60;
  const cgWeight = Math.min(inputs.weightKg, idealBodyWeight > 0 ? idealBodyWeight * 1.3 : inputs.weightKg);
  let cockcroftGault = ((140 - safeAge) * cgWeight) / (72 * safeCreat);
  if (inputs.sex === "female") cockcroftGault *= 0.85;

  const stage = stageFor(egfr);
  const percentFunction = Math.min(100, (egfr / 100) * 100);

  const chartData: ChartPoint[] = [
    { name: "G5", value: 15 },
    { name: "G4", value: 30 },
    { name: "G3b", value: 45 },
    { name: "G3a", value: 60 },
    { name: "G2", value: 90 },
    { name: "Yours", value: Math.round(egfr * 10) / 10, isCurrent: true },
  ];

  const num = (v: number, d = 1) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const rows: TableRow[] = [
    { label: "Serum Creatinine", value: `${num(creatinineMgDl, 2)} mg/dL (${num(creatinineMgDl * UMOL_PER_MGDL, 0)} µmol/L)` },
    { label: "Age", value: `${num(inputs.age, 0)} years` },
    { label: "Sex Factor", value: inputs.sex === "female" ? "0.742 (female)" : "1.000 (male)" },
    { label: "Race Coefficient", value: inputs.isBlack ? "1.212 applied" : "Not applied" },
    { label: "eGFR (MDRD 4-variable)", value: `${num(egfr)} mL/min/1.73 m²`, key: true },
    { label: "CKD Stage", value: `${stage.code} — ${stage.label}`, key: true },
    { label: "eGFR (MDRD 6-variable)", value: `${num(mdrd6)} mL/min/1.73 m²` },
    { label: "Cockcroft-Gault CrCl", value: `${num(cockcroftGault)} mL/min` },
    { label: "Body Surface Area", value: `${num(bsa, 2)} m²` },
    { label: "Absolute eGFR (de-indexed)", value: `${num(egfrNonIndexed)} mL/min` },
    { label: "Ideal Body Weight", value: `${num(idealBodyWeight)} kg` },
    { label: "Approx. Function Remaining", value: `${num(percentFunction, 0)}%` },
  ];

  return {
    egfr,
    egfrNonIndexed,
    creatinineMgDl,
    stage: stage.code,
    stageLabel: stage.label,
    stageColor: stage.color,
    description: stage.description,
    cockcroftGault,
    bsa,
    idealBodyWeight,
    mdrd6Variable: mdrd6,
    percentFunction,
    chartData,
    rows,
  };
}

const inp =
  "w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20";
const lbl = "text-sm font-medium text-foreground mb-1 block";
const groupLabel =
  "text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold flex items-center gap-1.5";

export default function GlomerularFiltrationRateEgfrMdrdCalculator() {
  const [inputs, setInputs] = useState<EgfrInputs>(DEFAULTS);
  const [result, setResult] = useState<EgfrResult>(calculateEgfr(DEFAULTS));
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setResult(calculateEgfr(inputs));
  }, []);

  const calculate = () => setResult(calculateEgfr(inputs));
  const reset = () => {
    setInputs(DEFAULTS);
    setResult(calculateEgfr(DEFAULTS));
    setShowAdvanced(false);
  };

  const setNum = (key: keyof EgfrInputs, raw: string) => {
    const parsed = parseFloat(raw);
    setInputs((prev) => ({ ...prev, [key]: isNaN(parsed) ? 0 : parsed }));
  };

  const changeUnit = (unit: CreatUnit) => {
    setInputs((prev) => {
      if (prev.creatUnit === unit) return prev;
      const converted =
        unit === "umoll" ? prev.serumCreatinine * UMOL_PER_MGDL : prev.serumCreatinine / UMOL_PER_MGDL;
      return { ...prev, creatUnit: unit, serumCreatinine: Math.round(converted * 100) / 100 };
    });
  };

  const faqs = [
    {
      question: "What is the MDRD equation and what does it estimate?",
      answer:
        "The Modification of Diet in Renal Disease equation estimates glomerular filtration rate from serum creatinine, age, sex, and race. It reports a value in mL/min per 1.73 square meters, meaning the result is already normalized to a standard adult body surface area. The IDMS-traceable version used here starts with a coefficient of 175 rather than the original 186, reflecting recalibration to standardized creatinine assays.",
    },
    {
      question: "How accurate is MDRD compared with CKD-EPI?",
      answer:
        "MDRD was developed in a population with established kidney disease and systematically underestimates filtration above roughly 60 mL/min/1.73 m². CKD-EPI performs better in that upper range and is now the preferred equation in most guidelines. MDRD remains widely reported by laboratories and is still useful for tracking trends within a single patient, since a consistent bias matters less than a changing value.",
    },
    {
      question: "Should the race coefficient still be applied?",
      answer:
        "Major nephrology and laboratory bodies have moved away from race-based adjustment, and the 2021 CKD-EPI refit removed it entirely. The 1.212 multiplier is included here because many historical results and some laboratory reports still incorporate it, and comparing values requires knowing whether it was applied. For new clinical decisions, the race-free equations are generally recommended.",
    },
    {
      question: "Why does eGFR need to be de-indexed for drug dosing?",
      answer:
        "The reported value is scaled to 1.73 square meters of body surface area, which allows comparison across people of different sizes. Drug clearance, however, depends on the individual's actual kidney capacity. Multiplying by the patient's own BSA divided by 1.73 converts the indexed figure back to absolute mL/min. This matters most at the extremes of body size, where indexed and absolute values can differ by 30% or more.",
    },
    {
      question: "What do the CKD stages mean?",
      answer:
        "KDIGO defines G1 as 90 or above, G2 as 60 to 89, G3a as 45 to 59, G3b as 30 to 44, G4 as 15 to 29, and G5 as below 15. Stages G1 and G2 are only classified as chronic kidney disease when other evidence of kidney damage is present, such as albuminuria or structural abnormality. Staging also incorporates albuminuria categories, which this calculator does not include.",
    },
    {
      question: "What can make an eGFR result misleading?",
      answer:
        "Creatinine-based estimates assume a steady state, so they are unreliable during acute kidney injury when the level is still rising or falling. Unusually high or low muscle mass, amputation, malnutrition, a vegetarian diet, and recent creatine supplementation all shift creatinine independently of filtration. Drugs including trimethoprim and cimetidine block tubular secretion of creatinine, raising the measured level without any change in true GFR.",
    },
    {
      question: "How does Cockcroft-Gault differ from MDRD?",
      answer:
        "Cockcroft-Gault estimates creatinine clearance rather than GFR and returns an absolute value in mL/min without BSA indexing. It incorporates body weight directly, so obesity inflates the result unless an adjusted weight is used, as this calculator does. Many drug labels, particularly older ones, base their renal dose adjustments on Cockcroft-Gault, which is why both figures appear here.",
    },
    {
      question: "Does a single low eGFR mean chronic kidney disease?",
      answer:
        "No. Chronic kidney disease requires abnormality persisting for at least three months. A single reduced value may reflect dehydration, acute illness, a recent high-protein meal, or laboratory variation. Confirmation with a repeat measurement, along with urine albumin-to-creatinine ratio and review of the trend over time, is what distinguishes chronic disease from a transient dip.",
    },
  ];

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Calculators", href: "/calculator" },
          { label: "Health", href: "/calculator#health" },
          { label: "Glomerular Filtration Rate (eGFR) – MDRD Calculator" },
        ]}
      />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">
          Glomerular Filtration Rate (eGFR) – MDRD Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="serumCreatinine" className={lbl}>Serum Creatinine</label>
                <input id="serumCreatinine" type="number" min="0" step="0.01" className={inp}
                  value={inputs.serumCreatinine} onChange={(e) => setNum("serumCreatinine", e.target.value)} />
              </div>
              <div>
                <label htmlFor="creatUnit" className={lbl}>Units</label>
                <select id="creatUnit" className={inp} value={inputs.creatUnit}
                  onChange={(e) => changeUnit(e.target.value as CreatUnit)}>
                  <option value="mgdl">mg/dL</option>
                  <option value="umoll">µmol/L</option>
                </select>
              </div>
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
                      <User className="h-3.5 w-3.5" /> Equation Coefficients
                    </div>
                    <label htmlFor="isBlack" className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                      <input id="isBlack" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.isBlack}
                        onChange={(e) => setInputs((p) => ({ ...p, isBlack: e.target.checked }))} />
                      Apply legacy race coefficient (1.212)
                    </label>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Current guidance favors race-free equations. Enable only to reproduce a historical report.
                    </p>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <Activity className="h-3.5 w-3.5" /> Body Size (for BSA &amp; Cockcroft-Gault)
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="weightKg" className={lbl}>Weight (kg)</label>
                        <input id="weightKg" type="number" min="0" step="1" className={inp} value={inputs.weightKg}
                          onChange={(e) => setNum("weightKg", e.target.value)} />
                      </div>
                      <div>
                        <label htmlFor="heightCm" className={lbl}>Height (cm)</label>
                        <input id="heightCm" type="number" min="0" step="1" className={inp} value={inputs.heightCm}
                          onChange={(e) => setNum("heightCm", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={groupLabel}>
                      <FlaskConical className="h-3.5 w-3.5" /> Professional Mode
                    </div>
                    <label htmlFor="proMode" className="flex items-center gap-2 text-sm font-medium text-foreground mb-3 cursor-pointer">
                      <input id="proMode" type="checkbox" className="h-4 w-4 accent-primary" checked={inputs.proMode}
                        onChange={(e) => setInputs((p) => ({ ...p, proMode: e.target.checked }))} />
                      Unlock 6-variable MDRD and dosing comparison
                    </label>
                    {inputs.proMode ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="serumAlbumin" className={lbl}>Serum Albumin (g/dL)</label>
                          <input id="serumAlbumin" type="number" min="0" step="0.1" className={inp}
                            value={inputs.serumAlbumin} onChange={(e) => setNum("serumAlbumin", e.target.value)} />
                        </div>
                        <div>
                          <label htmlFor="bun" className={lbl}>BUN (mg/dL)</label>
                          <input id="bun" type="number" min="0" step="1" className={inp} value={inputs.bun}
                            onChange={(e) => setNum("bun", e.target.value)} />
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
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Estimated GFR (MDRD)</div>
              <div className="text-4xl font-bold text-primary">{result.egfr.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">
                mL/min/1.73 m² — Stage {result.stage}, {result.stageLabel}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              <div className="p-4 text-center">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">CKD Stage</div>
                <div className="text-lg font-bold" style={{ color: result.stageColor }}>{result.stage}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Absolute GFR</div>
                <div className="text-lg font-bold text-amber-600">{result.egfrNonIndexed.toFixed(1)}</div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Cockcroft-Gault</div>
                <div className="text-lg font-bold text-emerald-600">{result.cockcroftGault.toFixed(1)}</div>
              </div>
            </div>

            <div className="rounded-lg border-l-4 p-4 bg-card border border-border" style={{ borderLeftColor: result.stageColor }}>
              <div className="text-sm font-bold text-foreground mb-1">
                Stage {result.stage} — {result.stageLabel}
              </div>
              <p className="text-sm text-muted-foreground">{result.description}</p>
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
                    <td className="text-base py-2.5 px-3 text-foreground">Reported eGFR</td>
                    <td className="text-base py-2.5 px-3 text-right text-primary">{result.egfr.toFixed(1)} mL/min/1.73 m²</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {mounted ? (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-bold text-foreground mb-3">Your eGFR Against CKD Stage Thresholds</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v: number) => `${v}`} />
                    <RTooltip formatter={(value: number) => [`${value} mL/min/1.73 m²`, "eGFR"]}
                      contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                    <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((point) => (
                        <Cell key={point.name} fill={point.isCurrent ? result.stageColor : "#cbd5e1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: result.stageColor }} /> Your result
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm bg-slate-300" /> Stage upper bounds
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-0.5 bg-amber-500" /> CKD threshold (60)
                  </div>
                </div>
              </div>
            ) : null}

            {inputs.proMode ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">Equation Comparison &amp; Dosing Basis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">MDRD 6-Variable</div>
                    <div className="text-base font-bold text-foreground">{result.mdrd6Variable.toFixed(1)} mL/min/1.73 m²</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">MDRD 4-Variable</div>
                    <div className="text-base font-bold text-foreground">{result.egfr.toFixed(1)} mL/min/1.73 m²</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Body Surface Area</div>
                    <div className="text-base font-bold text-foreground">{result.bsa.toFixed(2)} m²</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Ideal Body Weight</div>
                    <div className="text-base font-bold text-foreground">{result.idealBodyWeight.toFixed(1)} kg</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Dosing Note</div>
                    <div className="text-sm text-muted-foreground">
                      Drug labels vary in which estimate they reference. Older renal dose adjustments are usually based on
                      Cockcroft-Gault creatinine clearance ({result.cockcroftGault.toFixed(1)} mL/min), while newer labels
                      may cite absolute eGFR ({result.egfrNonIndexed.toFixed(1)} mL/min). Use the de-indexed value rather
                      than the BSA-normalized one when individualizing a dose.
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
            <h2 className="text-2xl font-bold mb-3">What the MDRD Equation Actually Measures</h2>
            <p className="mb-4">
              Glomerular filtration rate is the volume of plasma the kidneys clear per minute, and measuring it directly
              requires infusing a marker such as inulin or iohexol and sampling over several hours. That is impractical in
              routine care, so filtration is estimated from serum creatinine instead. The MDRD equation, derived from the
              Modification of Diet in Renal Disease study, relates creatinine to filtration while correcting for age and
              sex because both influence how much creatinine muscle produces. The IDMS-traceable form uses a leading
              coefficient of 175 rather than the original 186, a recalibration made when laboratories standardized their
              creatinine assays against isotope dilution mass spectrometry.
            </p>

            <h2 className="text-2xl font-bold mb-3">Why the Result Is Indexed to 1.73 Square Meters</h2>
            <p className="mb-4">
              A larger person has larger kidneys and clears more plasma per minute, which would make raw filtration rates
              incomparable between individuals. Normalizing to 1.73 square meters of body surface area, the average for a
              young adult when the convention was established, puts everyone on the same scale and is what makes staging
              thresholds meaningful. The trade-off appears in drug dosing, where what matters is the patient's actual
              clearance capacity rather than a size-adjusted figure. Multiplying the indexed value by the individual's own
              BSA divided by 1.73 recovers the absolute rate, and at the extremes of body size the two numbers can differ
              by a third or more.
            </p>

            <h2 className="text-2xl font-bold mb-3">Where MDRD Falls Short</h2>
            <p className="mb-4">
              The equation was fitted in a cohort that already had chronic kidney disease, which means it was never
              calibrated for people with normal function. Above roughly 60 mL/min/1.73 m² it systematically underestimates
              filtration, sometimes labeling healthy kidneys as mildly impaired. CKD-EPI corrects much of that bias and has
              largely replaced MDRD in guidelines, though MDRD remains on many laboratory reports and stays useful for
              tracking a single patient over time, where a consistent bias matters far less than the direction of change.
              Creatinine-based estimation also assumes a steady state, so during acute kidney injury, when creatinine is
              still climbing, any estimate lags the true decline in filtration.
            </p>

            <h2 className="text-2xl font-bold mb-3">Interpreting a Result in Context</h2>
            <p className="mb-4">
              KDIGO staging runs from G1 at 90 and above through G5 below 15, but the number alone does not establish
              chronic kidney disease. Stages G1 and G2 require additional evidence of damage, most often albuminuria, and
              any reduced value must persist beyond three months to be considered chronic. Muscle mass drives creatinine
              independently of kidney function, so a bodybuilder can appear impaired while a frail or amputated patient can
              appear normal. Trimethoprim and cimetidine block tubular secretion of creatinine and raise the measured level
              without changing filtration at all. Cystatin C-based estimation avoids most of these confounders and is worth
              considering when the creatinine-based result does not fit the clinical picture.
            </p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/glomerular-filtration-rate-egfr-mdrd-calculator" />
          <PopularCalculators exclude="glomerular-filtration-rate-egfr-mdrd-calculator" />
        </div>
      </div>
    </>
  );
}

