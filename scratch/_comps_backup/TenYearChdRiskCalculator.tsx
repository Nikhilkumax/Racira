"use client";

import { useState, useEffect, useRef } from "react";
import { RotateCcw, Printer, ChevronDown, ChevronUp } from "lucide-react";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";

interface Inputs {
  age: string;
  sex: string;
  totalChol: string;
  hdl: string;
  sbp: string;
  onBpMed: string;
  smoker: string;
}

interface Result {
  agePoints: number;
  cholPoints: number;
  hdlPoints: number;
  sbpPoints: number;
  smokePoints: number;
  totalPoints: number;
  riskPct: number;
  riskLabel: string;
  category: string;
  ldlGoal: string;
}

const DEFAULTS: Inputs = {
  age: "55",
  sex: "Male",
  totalChol: "220",
  hdl: "45",
  sbp: "140",
  onBpMed: "No",
  smoker: "No",
};

// ---- ATP III (NCEP 2001) Framingham point tables ----
const AGE_POINTS: Record<string, [number, number, number, number, number, number, number, number, number, number]> = {
  // 20-34, 35-39, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74, 75-79
  Male: [-9, -4, 0, 3, 6, 8, 10, 11, 12, 13],
  Female: [-7, -3, 0, 3, 6, 8, 10, 12, 14, 16],
};

const TC_POINTS: Record<string, [number[], number[], number[], number[], number[]]> = {
  // [<160, 160-199, 200-239, 240-279, >=280] per age band: 20-39, 40-49, 50-59, 60-69, 70-79
  Male: [
    [0, 4, 7, 9, 11],
    [0, 3, 5, 6, 8],
    [0, 2, 3, 4, 5],
    [0, 1, 1, 2, 3],
    [0, 0, 0, 1, 1],
  ],
  Female: [
    [0, 4, 8, 11, 13],
    [0, 3, 6, 8, 10],
    [0, 2, 4, 5, 7],
    [0, 1, 2, 3, 4],
    [0, 1, 1, 2, 2],
  ],
};

const SMOKE_POINTS: Record<string, number[]> = {
  Male: [8, 5, 3, 1, 1], // 20-39, 40-49, 50-59, 60-69, 70-79
  Female: [9, 7, 4, 2, 1],
};

const HDL_POINTS = (v: number) => (v >= 60 ? -1 : v >= 50 ? 0 : v >= 40 ? 1 : 2);

const SBP_POINTS: Record<string, Record<string, number[]>> = {
  Male: { No: [0, 0, 1, 1, 2], Yes: [0, 1, 2, 2, 3] }, // [<120, 120-129, 130-139, 140-159, >=160] per treated/untreated
  Female: { No: [0, 1, 2, 3, 4], Yes: [0, 3, 4, 5, 6] },
};

// Risk % lookup: [points, risk%] for men
const MEN_RISK: [number, number][] = [
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 2], [6, 2], [7, 3], [8, 4], [9, 5],
  [10, 6], [11, 8], [12, 10], [13, 12], [14, 16], [15, 20], [16, 25], [17, 30],
];
const WOMEN_RISK: [number, number][] = [
  [9, 1], [10, 1], [11, 1], [12, 1], [13, 2], [14, 2], [15, 3], [16, 4], [17, 5], [18, 6],
  [19, 8], [20, 11], [21, 14], [22, 17], [23, 22], [24, 27], [25, 30],
];

const ageBand = (age: number) => (age >= 75 ? 9 : age >= 70 ? 8 : age >= 65 ? 7 : age >= 60 ? 6 : age >= 55 ? 5 : age >= 50 ? 4 : age >= 45 ? 3 : age >= 40 ? 2 : age >= 35 ? 1 : 0);
const tcBandIdx = (v: number) => (v >= 280 ? 4 : v >= 240 ? 3 : v >= 200 ? 2 : v >= 160 ? 1 : 0);
const sbpBandIdx = (v: number) => (v >= 160 ? 4 : v >= 140 ? 3 : v >= 130 ? 2 : v >= 120 ? 1 : 0);

function riskFromPoints(points: number, sex: string): { pct: number; belowOne: boolean } {
  if (sex === "Female") {
    if (points < 9) return { pct: 1, belowOne: true }; // <1%
    const table = WOMEN_RISK;
    if (points >= table[table.length - 1][0]) return { pct: 30, belowOne: false };
    for (let i = 0; i < table.length; i++) {
      if (points === table[i][0]) return { pct: table[i][1], belowOne: false };
      if (points < table[i][0]) return { pct: table[i][1], belowOne: false };
    }
  }
  const table = MEN_RISK;
  if (points <= 0) return { pct: 1, belowOne: true }; // <1%
  if (points >= table[table.length - 1][0]) return { pct: 30, belowOne: false };
  for (let i = 0; i < table.length; i++) {
    if (points === table[i][0]) return { pct: table[i][1], belowOne: false };
    if (points < table[i][0]) return { pct: table[i][1], belowOne: false };
  }
  return { pct: 30, belowOne: false };
}

function calculate(inputs: Inputs): Result {
  const age = Math.min(79, Math.max(20, parseInt(inputs.age) || 0));
  const sex = inputs.sex === "Female" ? "Female" : "Male";
  const tc = Math.max(0, parseFloat(inputs.totalChol) || 0);
  const hdl = Math.max(0, parseFloat(inputs.hdl) || 0);
  const sbp = Math.max(0, parseFloat(inputs.sbp) || 0);
  const treated = inputs.onBpMed === "Yes";
  const smoker = inputs.smoker === "Yes";

  const band = ageBand(age);
  const agePoints = AGE_POINTS[sex][band];
  const cholPoints = TC_POINTS[sex][Math.min(4, Math.floor(band / 2))][tcBandIdx(tc)];
  const hdlPoints = HDL_POINTS(hdl);
  const sbpPoints = SBP_POINTS[sex][treated ? "Yes" : "No"][sbpBandIdx(sbp)];
  const smokePoints = smoker ? SMOKE_POINTS[sex][Math.min(4, Math.floor(band / 2))] : 0;
  const totalPoints = agePoints + cholPoints + hdlPoints + sbpPoints + smokePoints;
  const riskInfo = riskFromPoints(totalPoints, sex);
  const riskPct = riskInfo.pct;
  const riskLabel = riskInfo.belowOne ? "<1%" : riskPct >= 30 ? ">30%" : `${riskPct}%`;
  const category = riskPct >= 20 ? "High (≥20%)" : riskPct >= 10 ? "Intermediate (10-20%)" : "Low (<10%)";
  const ldlGoal = riskPct >= 20 ? "<100 mg/dL" : riskPct >= 10 ? "<130 mg/dL" : "<160 mg/dL";

  return { agePoints, cholPoints, hdlPoints, sbpPoints, smokePoints, totalPoints, riskPct, riskLabel, category, ldlGoal };
}

const fmt = (n: number, dec = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const NumInput = ({ id, label, value, onChange, suffix }: {
  id: string; label: string; value: string; onChange: (v: string) => void; suffix?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <input id={id} type="number" step="any" value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground" />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const SelectInput = ({ id, label, value, onChange, options }: {
  id: string; label: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-medium mb-1">{label}</label>
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground shadow-sm focus-within:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const TenYearChdRiskCalculator = () => {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [result, setResult] = useState<Result>(calculate(DEFAULTS));
  const [showAdv, setShowAdv] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResult(calculate(DEFAULTS));
  }, []);

  const set = (k: keyof Inputs) => (v: string) => setInputs((prev) => ({ ...prev, [k]: v }));
  const num = (v: string) => parseFloat(v) || 0;

  const hasErrors =
    num(inputs.age) < 20 || num(inputs.age) > 79 ||
    num(inputs.totalChol) < 0 ||
    num(inputs.hdl) < 0 ||
    num(inputs.sbp) < 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResult(calculate(inputs));
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setResult(calculate(DEFAULTS));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const breakdown = [
    { label: `Age (${num(inputs.age)} yrs)`, value: `${result.agePoints} pts` },
    { label: `Total Cholesterol (${fmt(num(inputs.totalChol))} mg/dL)`, value: `${result.cholPoints} pts` },
    { label: `HDL Cholesterol (${fmt(num(inputs.hdl))} mg/dL)`, value: `${result.hdlPoints} pts` },
    { label: `Systolic BP (${fmt(num(inputs.sbp))} mm Hg, ${inputs.onBpMed === "Yes" ? "treated" : "untreated"})`, value: `${result.sbpPoints} pts` },
    { label: `Smoking (${inputs.smoker})`, value: `${result.smokePoints} pts` },
    { label: "Total Points", value: `${result.totalPoints} pts` },
    { label: "10-Year CHD Risk", value: result.riskLabel },
  ];

  return (
    <div onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
        <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card !overflow-visible">
          <div className="grid grid-cols-2 gap-3">
            <NumInput id="age" label="Age" value={inputs.age} onChange={set("age")} suffix="yrs" />
            <SelectInput id="sex" label="Sex" value={inputs.sex} onChange={set("sex")} options={["Male", "Female"]} />
            <NumInput id="total-chol" label="Total Cholesterol" value={inputs.totalChol} onChange={set("totalChol")} suffix="mg/dL" />
            <NumInput id="hdl" label="HDL Cholesterol" value={inputs.hdl} onChange={set("hdl")} suffix="mg/dL" />
          </div>

          <button type="button" onClick={() => setShowAdv((v) => !v)} className="flex items-center gap-1.5 text-sm text-primary font-medium self-start">
            Advanced Options {showAdv ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showAdv && (
            <div className="flex flex-col gap-3 p-3 rounded-lg border border-border bg-secondary/20 mt-1">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Blood Pressure</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumInput id="sbp" label="Systolic Blood Pressure" value={inputs.sbp} onChange={set("sbp")} suffix="mm Hg" />
                  <SelectInput id="on-bp-med" label="On BP Medication?" value={inputs.onBpMed} onChange={set("onBpMed")} options={["No", "Yes"]} />
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Lifestyle</div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectInput id="smoker" label="Current Smoker?" value={inputs.smoker} onChange={set("smoker")} options={["No", "Yes"]} />
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <p className="text-sm text-red-600">Enter valid values — age must be between 20 and 79.</p>
          )}

          <div className="flex gap-2.5 mt-2.5">
            <button type="button" onClick={handleCalculate} className="h-10 flex-1 flex items-center justify-center rounded-md bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-base transition-all active:scale-[0.98] shadow-sm">
              Calculate
            </button>
            <button type="button" onClick={handleReset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 focus:outline-none" aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Educational estimate only — for adults 20-79 without diabetes or known heart disease. Not medical advice.</p>
        </div>

        <div ref={resultsRef} className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start print-section">
          <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
            <button type="button" onClick={() => window.print()} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors" aria-label="Print">
              <Printer className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">10-Year CHD Risk</div>
            <div className="text-4xl font-bold text-primary">{result.riskLabel}</div>
            <div className="text-sm text-muted-foreground mt-1">hard CHD events (MI or coronary death) — ATP III Framingham score</div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Points</div>
              <div className="text-lg font-bold mt-1">{result.totalPoints}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Risk Category</div>
              <div className={`text-sm font-bold mt-1 ${result.riskPct >= 20 ? "text-red-600" : result.riskPct >= 10 ? "text-orange-600" : "text-emerald-600"}`}>{result.category}</div>
            </div>
            <div className="p-3 text-center">
              <div className="text-xs text-muted-foreground">ATP III LDL Goal</div>
              <div className="text-lg font-bold mt-1">{result.ldlGoal}</div>
            </div>
          </div>

          <div className="card-calculator !p-4 shadow-sm border border-border bg-card">
            <h3 className="text-base font-semibold mb-3">Point Breakdown</h3>
            <table className="w-full text-base">
              <tbody>
                {breakdown.map((r) => (
                  <tr key={r.label} className="border-b last:border-0">
                    <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 px-3 text-right font-medium">{r.value}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-3 font-semibold">10-Year CHD Risk</td>
                  <td className="py-2.5 px-3 text-right font-bold text-primary">{result.riskLabel}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-muted/30 rounded-lg p-5">
            <h3 className="text-sm font-semibold mb-3">Summary Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {breakdown.map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground">{r.label}</div>
                  <div className="text-base font-bold">{r.value}</div>
                </div>
              ))}
              <div>
                <div className="text-xs text-muted-foreground">10-Year CHD Risk</div>
                <div className="text-base font-bold text-primary">{result.riskLabel}</div>
              </div>
            </div>
          </div>

          <div className={`rounded-lg p-4 text-sm border ${result.riskPct >= 20 ? "border-red-200 bg-red-50 text-red-800" : result.riskPct >= 10 ? "border-orange-200 bg-orange-50 text-orange-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            {result.category === "High (≥20%)" ? "High risk: per ATP III, treatment decisions are driven by a ≥20% 10-year risk — discuss preventive therapy with your clinician." : result.category === "Intermediate (10-20%)" ? "Intermediate risk: lifestyle intervention is the priority; additional testing or preventive therapy may be considered." : "Low risk: maintain healthy lifestyle habits and re-assess risk periodically."}
          </div>
        </div>
      </div>

      <div className="max-w-[1180px] mt-8">
        <AdPlaceholder className="mb-10" />
        <section className="mt-12 space-y-8 text-base text-foreground">
          <div>
            <h2 className="text-2xl font-bold mb-3">What Is 10-Year CHD Risk?</h2>
            <p className="text-muted-foreground leading-relaxed">Ten-year coronary heart disease risk is the probability, expressed as a percentage, that a person without known heart disease will experience a hard coronary event — a heart attack or death from coronary disease — within the next ten years. The estimate comes from the Framingham Heart Study, a landmark population study that began in 1948 in Framingham, Massachusetts, and has tracked generations of participants ever since. The version implemented here is the ATP III point score published by the National Cholesterol Education Program in 2001, which remains the standard simplified Framingham scoring system used in primary care worldwide. The score converts age, total cholesterol, HDL cholesterol, systolic blood pressure, blood pressure treatment status, and smoking into a small number of points, sums them, and maps the total to a ten-year risk percentage. The result sorts patients into three familiar bands — low risk under ten percent, intermediate risk between ten and twenty percent, and high risk at twenty percent or above — and those bands drive the LDL cholesterol treatment goals recommended by ATP III: under 160, under 130, and under 100 milligrams per deciliter respectively. The score deliberately excludes diabetes, because ATP III treats diabetes as a coronary heart disease equivalent — a diagnosis that already places a person in the high-risk band without further calculation.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">How the Framingham Score Is Calculated</h2>
            <p className="text-muted-foreground leading-relaxed">The ATP III score works in five factor steps, each with its own point table for men and women. Age dominates the score: a man aged 55 to 59 earns 8 points while a woman of the same age also earns 8, and the scale runs from minus 9 for men in their twenties up to 13 points for men in their late seventies. Total cholesterol points depend on both the cholesterol value and the age band, because elevated cholesterol contributes proportionally less risk as age advances — 200 to 239 milligrams per deciliter earns 7 points in a man aged 20 to 39 but only 3 points in a man aged 50 to 59. HDL cholesterol is the only factor that subtracts points: 60 or above subtracts 1, 50 to 59 adds nothing, 40 to 49 adds 1, and below 40 adds 2. Blood pressure scoring uses separate tables for treated and untreated patients, reflecting the higher residual risk of someone already on medication: an untreated systolic pressure of 140 to 159 adds 1 point for men, while the same pressure in a treated man adds 2. Smoking points are age-adjusted like cholesterol, contributing 8 points to a young male smoker but only 1 point past age 70. Summing the five factor contributions gives a total between roughly minus 10 and plus 25, and the lookup table converts that total into a ten-year risk percentage — for men, 13 points maps to 12 percent, 15 points to 20 percent, and 17 points or more to over 30 percent, with a similar monotonic scale for women. The worked example in the results shows every factor's contribution side by side, so the path from inputs to percentage is fully transparent.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
            <p className="text-muted-foreground leading-relaxed">Start with the headline percentage and the category banner beneath the results. A low-risk result below ten percent supports a maintenance approach: keep lipids, blood pressure, and weight in healthy ranges, stay active, and re-assess every few years. An intermediate result between ten and twenty percent is the decision zone — ATP III suggests therapeutic lifestyle changes as the foundation, with lipid-lowering therapy considered when LDL remains above 130 milligrams per deciliter. A high result at or above twenty percent calls for aggressive management, with an LDL goal under 100 and discussion of preventive medication. The point breakdown is the most useful diagnostic feature: it shows exactly which factors drove the total, and it shows what a change is worth. Quitting smoking removes the smoking points entirely, a 20-point HDL increase can flip a point or two, and bringing systolic pressure below 130 removes the blood pressure contribution — the same inputs re-run through the score reveal the estimated benefit of each intervention in percentage points of risk. Remember the score's limits: it predicts hard coronary events only, was derived from a predominantly white New England population and may over- or under-estimate elsewhere, and cannot capture family history, inflammation, or other risk-enhancing factors. Use it as the structured starting point it was designed to be, and bring the result to a clinician for interpretation — this calculator is an educational estimate, not a diagnosis.</p>
          </div>
        </section>
        <PopularCalculators exclude="/calculator/10-year-chd-risk-calculator" />
      </div>
    </div>
  );
};

export default TenYearChdRiskCalculator;