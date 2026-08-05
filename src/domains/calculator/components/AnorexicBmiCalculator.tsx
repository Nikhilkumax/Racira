"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertTriangle, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

type UnitSystem = "imperial" | "metric";
type Severity = "Extreme" | "Severe" | "Moderate" | "Mild" | "Healthy" | "Overweight";

interface BmiInputs {
  unitSystem: UnitSystem;
  heightFt: number;
  heightIn: number;
  heightCm: number;
  weightLbs: number;
  weightKg: number;
  targetBmi: number;
  gainRateLbs: number;
  gainRateKg: number;
}

interface BmiResult {
  bmi: number;
  category: Severity;
  description: string;
  colorClass: string;
  heightMeters: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetWeightLbs: number;
  deficitKg: number;
  deficitLbs: number;
  gainRateKg: number;
  weeksToTarget: number;
  dailySurplus: number;
  totalEnergyRequired: number;
}

// Energy cost of tissue gain: roughly 7,700 kcal per kilogram (3,500 kcal per pound).
const KCAL_PER_KG = 7700;
const LB_PER_KG = 0.453592;

const DEFAULTS = {
  unitSystem: "imperial" as UnitSystem,
  heightFt: "5",
  heightIn: "6",
  heightCm: "168",
  weightLbs: "100",
  weightKg: "45",
  targetBmi: "18.5",
  gainRateLbs: "1",
  gainRateKg: "0.5",
};

function inputsFromDefaults(): BmiInputs {
  return {
    unitSystem: DEFAULTS.unitSystem,
    heightFt: parseFloat(DEFAULTS.heightFt),
    heightIn: parseFloat(DEFAULTS.heightIn),
    heightCm: parseFloat(DEFAULTS.heightCm),
    weightLbs: parseFloat(DEFAULTS.weightLbs),
    weightKg: parseFloat(DEFAULTS.weightKg),
    targetBmi: parseFloat(DEFAULTS.targetBmi),
    gainRateLbs: parseFloat(DEFAULTS.gainRateLbs),
    gainRateKg: parseFloat(DEFAULTS.gainRateKg),
  };
}

export function calculateAnorexicBmi(i: BmiInputs): BmiResult | null {
  let heightMeters = 0;
  let currentWeightKg = 0;
  let gainRateKg = 0;

  if (i.unitSystem === "imperial") {
    if (i.heightFt <= 0 && i.heightIn <= 0) return null;
    if (i.weightLbs <= 0) return null;
    heightMeters = (i.heightFt * 12 + i.heightIn) * 0.0254;
    currentWeightKg = i.weightLbs * LB_PER_KG;
    gainRateKg = i.gainRateLbs * LB_PER_KG;
  } else {
    if (i.heightCm <= 0 || i.weightKg <= 0) return null;
    heightMeters = i.heightCm / 100;
    currentWeightKg = i.weightKg;
    gainRateKg = i.gainRateKg;
  }

  if (heightMeters <= 0 || currentWeightKg <= 0) return null;

  const bmi = currentWeightKg / Math.pow(heightMeters, 2);
  const targetWeightKg = i.targetBmi * Math.pow(heightMeters, 2);
  // This tool only ever reports weight to restore, never weight to lose.
  const deficitKg = Math.max(0, targetWeightKg - currentWeightKg);

  let category: Severity = "Healthy";
  let description = "";
  let colorClass = "text-emerald-500";

  if (bmi < 15) {
    category = "Extreme";
    description = "Extreme anorexia nervosa severity. Severe medical intervention and hospitalisation may be required immediately.";
    colorClass = "text-red-600";
  } else if (bmi < 16) {
    category = "Severe";
    description = "Severe anorexia nervosa severity. Professional clinical treatment is urgently recommended.";
    colorClass = "text-red-500";
  } else if (bmi < 17) {
    category = "Moderate";
    description = "Moderate anorexia nervosa severity. Medical and psychological monitoring is strongly advised.";
    colorClass = "text-orange-500";
  } else if (bmi < 18.5) {
    category = "Mild";
    description = "Mild anorexia nervosa severity or underweight. Focus on weight restoration and nutritional counselling.";
    colorClass = "text-yellow-500";
  } else if (bmi <= 24.9) {
    category = "Healthy";
    description = "BMI is within the healthy range. Anorexia is a behavioural disorder, and people with healthy or higher BMIs can still have atypical anorexia.";
    colorClass = "text-emerald-500";
  } else {
    category = "Overweight";
    description = "BMI is above the healthy range. Anorexia is a behavioural disorder, and people with healthy or higher BMIs can still have atypical anorexia.";
    colorClass = "text-blue-500";
  }

  return {
    bmi,
    category,
    description,
    colorClass,
    heightMeters,
    currentWeightKg,
    targetWeightKg,
    targetWeightLbs: targetWeightKg / LB_PER_KG,
    deficitKg,
    deficitLbs: deficitKg / LB_PER_KG,
    gainRateKg,
    weeksToTarget: gainRateKg > 0 ? deficitKg / gainRateKg : 0,
    dailySurplus: (gainRateKg * KCAL_PER_KG) / 7,
    totalEnergyRequired: deficitKg * KCAL_PER_KG,
  };
}

const fmt = (n: number, dec = 1) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function AnorexicBmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULTS.unitSystem);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [targetBmi, setTargetBmi] = useState(DEFAULTS.targetBmi);
  const [gainRateLbs, setGainRateLbs] = useState(DEFAULTS.gainRateLbs);
  const [gainRateKg, setGainRateKg] = useState(DEFAULTS.gainRateKg);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<BmiResult | null>(calculateAnorexicBmi(inputsFromDefaults()));

  const getInputs = (): BmiInputs => ({
    unitSystem,
    heightFt: parseFloat(heightFt) || 0,
    heightIn: parseFloat(heightIn) || 0,
    heightCm: parseFloat(heightCm) || 0,
    weightLbs: parseFloat(weightLbs) || 0,
    weightKg: parseFloat(weightKg) || 0,
    targetBmi: parseFloat(targetBmi) || 18.5,
    gainRateLbs: parseFloat(gainRateLbs) || 0,
    gainRateKg: parseFloat(gainRateKg) || 0,
  });

  useEffect(() => {
    setResult(calculateAnorexicBmi(inputsFromDefaults()));
  }, []);

  const ft = parseFloat(heightFt) || 0;
  const inch = parseFloat(heightIn) || 0;
  const cm = parseFloat(heightCm) || 0;
  const lbs = parseFloat(weightLbs) || 0;
  const kg = parseFloat(weightKg) || 0;

  let errorMsg = "";
  if (unitSystem === "imperial" && ft <= 0 && inch <= 0) errorMsg = "Please enter your height.";
  else if (unitSystem === "metric" && cm <= 0) errorMsg = "Please enter your height.";
  else if (unitSystem === "imperial" && lbs <= 0) errorMsg = "Please enter your weight.";
  else if (unitSystem === "metric" && kg <= 0) errorMsg = "Please enter your weight.";
  else if (unitSystem === "imperial" && (ft > 8 || inch > 11)) errorMsg = "Please check your height entry.";
  else if (unitSystem === "metric" && cm > 250) errorMsg = "Please check your height entry.";

  const hasValidationErrors = errorMsg !== "";

  const calculate = () => {
    if (hasValidationErrors) return;
    const res = calculateAnorexicBmi(getInputs());
    if (res) setResult(res);
  };

  const reset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setHeightFt(DEFAULTS.heightFt);
    setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm);
    setWeightLbs(DEFAULTS.weightLbs);
    setWeightKg(DEFAULTS.weightKg);
    setTargetBmi(DEFAULTS.targetBmi);
    setGainRateLbs(DEFAULTS.gainRateLbs);
    setGainRateKg(DEFAULTS.gainRateKg);
    setShowAdvanced(false);
    setResult(calculateAnorexicBmi(inputsFromDefaults()));
  };

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What are the DSM-5 severity classifications for anorexia nervosa?", answer: "For adults, DSM-5 grades severity by BMI: Mild is 17 or above, Moderate is 16 to 16.99, Severe is 15 to 15.99, and Extreme is below 15. The manual is explicit that severity may be increased beyond what BMI alone suggests where clinical symptoms, functional disability or the need for supervision warrant it." },
    { question: "Is anorexia defined by BMI?", answer: "No. Anorexia nervosa is a psychiatric disorder characterised by restriction of energy intake, intense fear of weight gain, and disturbance in how body weight or shape is experienced. BMI grades the physical severity of starvation once the diagnosis is made; it does not make the diagnosis. People at normal or higher BMI can have atypical anorexia nervosa, which carries the same medical and psychological risks." },
    { question: "When does a low BMI become a medical emergency?", answer: "A BMI below 15 is widely treated as an acute medical concern because organ systems begin to fail under sustained starvation, with risks including cardiac arrhythmia, severe electrolyte disturbance and bone marrow suppression. Rate of loss matters as much as absolute value — rapid weight loss is dangerous at any starting BMI, and someone falling quickly from a high weight can be in more danger than someone stable at a low one." },
    { question: "Why does this calculator only ever show weight to gain?", answer: "It is a weight-restoration tool. The restoration goal is calculated as target BMI multiplied by height squared, and the shortfall is floored at zero, so it can never display a weight-loss target regardless of the values entered. That is deliberate: a calculator used in the context of eating disorders should not be capable of producing a weight-loss figure." },
    { question: "What target BMI should be used for restoration?", answer: "18.5 is the WHO lower bound of the healthy range and the usual minimum. Many eating-disorder services set a higher goal, often 19 or 20, because menstrual function, bone density and cognitive recovery frequently do not return at the bare minimum. The advanced options let you model any of the three, and the target should always be set by the treating clinician rather than by a calculator." },
    { question: "How fast should weight restoration proceed?", answer: "Published guidance generally describes about 0.5 to 1.4 kg per week in inpatient settings and roughly 0.2 to 0.5 kg per week in outpatient care, always under supervision. Restoration must be started cautiously because of refeeding syndrome — the potentially fatal shift in phosphate, potassium and magnesium that follows reintroduction of nutrition after prolonged starvation. Never plan a refeeding schedule without medical supervision." },
    { question: "How is the energy requirement estimated?", answer: "The calculator applies the conventional figure of roughly 7,700 kcal per kilogram of tissue gained, or 3,500 kcal per pound, to the restoration shortfall and to the weekly rate. This gives an order-of-magnitude estimate only. Actual requirements during refeeding are often far higher, because metabolic rate rises sharply as nutrition is restored and many patients need substantially more energy than the simple arithmetic predicts." },
    { question: "Is this tool a diagnosis?", answer: "No. It computes BMI, places it on the DSM-5 severity scale and estimates a restoration target. It cannot assess eating behaviour, body image, medical stability, or psychological risk, and it is not a substitute for assessment. If you or someone you know is struggling with an eating disorder, please seek professional medical help immediately." },
  ];

  const chartData = result
    ? [
        { range: "Your BMI", bmi: parseFloat(result.bmi.toFixed(1)), fill: "#3b82f6" },
        { range: "Extreme <15", bmi: 15, fill: "#dc2626" },
        { range: "Severe <16", bmi: 16, fill: "#ef4444" },
        { range: "Moderate <17", bmi: 17, fill: "#f97316" },
        { range: "Healthy 18.5", bmi: 18.5, fill: "#10b981" },
      ]
    : [];

  const rows = result
    ? [
        { label: "Current BMI", value: fmt(result.bmi, 1) },
        { label: "Severity Category", value: result.category },
        { label: "Height", value: unitSystem === "imperial" ? `${fmtInt(ft)}′ ${fmtInt(inch)}″` : `${fmt(cm, 0)} cm` },
        { label: "Current Weight", value: unitSystem === "imperial" ? `${fmt(lbs, 1)} lbs` : `${fmt(kg, 1)} kg` },
        { label: "Target BMI", value: fmt(parseFloat(targetBmi) || 18.5, 1) },
        { label: "Target Weight", value: unitSystem === "imperial" ? `${fmt(result.targetWeightLbs, 1)} lbs` : `${fmt(result.targetWeightKg, 1)} kg` },
        {
          label: "Weight Restoration Goal",
          value: result.deficitKg > 0 ? (unitSystem === "imperial" ? `+${fmt(result.deficitLbs, 1)} lbs` : `+${fmt(result.deficitKg, 1)} kg`) : "At or above target",
          highlight: true,
        },
        { label: "Planned Gain Rate", value: unitSystem === "imperial" ? `${fmt(parseFloat(gainRateLbs) || 0, 2)} lbs/week` : `${fmt(parseFloat(gainRateKg) || 0, 2)} kg/week` },
        { label: "Estimated Time to Target", value: result.weeksToTarget > 0 ? `${fmt(result.weeksToTarget, 1)} weeks` : "—" },
        { label: "Daily Energy Surplus", value: `${fmtInt(result.dailySurplus)} kcal/day` },
      ]
    : [];

  const severityColor = result?.colorClass ?? "text-foreground";
  const deficitColor = !result || result.deficitKg <= 0 ? "text-emerald-600" : result.deficitKg > 10 ? "text-red-600" : "text-amber-600";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Anorexic BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Anorexic BMI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="flex bg-muted p-1 rounded-lg">
              <button type="button" className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "imperial" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setUnitSystem("imperial")}>Imperial</button>
              <button type="button" className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "metric" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setUnitSystem("metric")}>Metric</button>
            </div>

            {unitSystem === "imperial" ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height-ft" className="text-sm font-medium mb-1 block">Height (ft)</label>
                  <div className={inp}><input id="height-ft" type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} onKeyDown={e => { if (e.key === "Enter") calculate(); }} className={ci} /></div>
                </div>
                <div>
                  <label htmlFor="height-in" className="text-sm font-medium mb-1 block">Height (in)</label>
                  <div className={inp}><input id="height-in" type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} onKeyDown={e => { if (e.key === "Enter") calculate(); }} className={ci} /></div>
                </div>
                <div className="col-span-2">
                  <label htmlFor="weight-lbs" className="text-sm font-medium mb-1 block">Current Weight (lbs)</label>
                  <div className={inp}><input id="weight-lbs" type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} onKeyDown={e => { if (e.key === "Enter") calculate(); }} className={ci} /></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="height-cm" className="text-sm font-medium mb-1 block">Height (cm)</label>
                  <div className={inp}><input id="height-cm" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} onKeyDown={e => { if (e.key === "Enter") calculate(); }} className={ci} /></div>
                </div>
                <div>
                  <label htmlFor="weight-kg" className="text-sm font-medium mb-1 block">Current Weight (kg)</label>
                  <div className={inp}><input id="weight-kg" type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} onKeyDown={e => { if (e.key === "Enter") calculate(); }} className={ci} /></div>
                </div>
              </div>
            )}

            {hasValidationErrors && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-semibold px-3 py-2 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />{errorMsg}
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Restoration Target</div>
                    <label htmlFor="target-bmi" className="text-sm font-medium mb-1 block">Target BMI</label>
                    <select
                      id="target-bmi"
                      value={targetBmi}
                      onChange={e => setTargetBmi(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="18.5">18.5 — WHO healthy minimum</option>
                      <option value="19">19.0 — common clinical goal</option>
                      <option value="20">20.0 — full functional recovery goal</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Restoration Plan</div>
                    <label htmlFor="gain-rate" className="text-sm font-medium mb-1 block">
                      {unitSystem === "imperial" ? "Supervised Gain Rate (lbs/week)" : "Supervised Gain Rate (kg/week)"}
                    </label>
                    <div className={inp}>
                      <input
                        id="gain-rate"
                        type="number"
                        step="any"
                        value={unitSystem === "imperial" ? gainRateLbs : gainRateKg}
                        onChange={e => (unitSystem === "imperial" ? setGainRateLbs(e.target.value) : setGainRateKg(e.target.value))}
                        onKeyDown={e => { if (e.key === "Enter") calculate(); }}
                        className={ci}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Published guidance is roughly 0.5–1.4 kg per week inpatient and 0.2–0.5 kg per week outpatient, always under medical supervision.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={calculate}
                disabled={hasValidationErrors}
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
            {result && (
              <>
                {/* 1. PRIMARY RESULT CARD */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Current BMI</div>
                  <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">{fmt(result.bmi, 1)}</div>
                  <div className="text-sm text-muted-foreground font-medium">
                    <span className={`font-bold ${severityColor}`}>{result.category}</span> severity · restoration target BMI {fmt(parseFloat(targetBmi) || 18.5, 1)}
                  </div>
                </div>

                {/* 2. 3-STAT BAR */}
                <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Category</span>
                    <span className={`font-extrabold ${severityColor}`}>{result.category}</span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Target Weight</span>
                    <span className="font-extrabold text-foreground">
                      {unitSystem === "imperial" ? `${fmt(result.targetWeightLbs, 1)} lbs` : `${fmt(result.targetWeightKg, 1)} kg`}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">To Restore</span>
                    <span className={`font-extrabold ${deficitColor}`}>
                      {result.deficitKg > 0 ? (unitSystem === "imperial" ? `+${fmt(result.deficitLbs, 1)} lbs` : `+${fmt(result.deficitKg, 1)} kg`) : "None"}
                    </span>
                  </div>
                </div>

                {/* 3. BREAKDOWN TABLE */}
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                  <table className="w-full text-left border-collapse text-base">
                    <thead>
                      <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        <th className="py-2.5 px-3">Metric</th>
                        <th className="py-2.5 px-3 text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {rows.map(row => (
                        <tr key={row.label} className={`hover:bg-secondary/20 transition-colors ${row.highlight ? "bg-amber-500/10" : ""}`}>
                          <td className={`py-2.5 px-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                          <td className={`py-2.5 px-3 text-right font-bold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.value}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-border bg-secondary/30 font-bold">
                        <td className="py-2.5 px-3 text-foreground">Total Energy Required</td>
                        <td className="py-2.5 px-3 text-right text-foreground">{fmtInt(result.totalEnergyRequired)} kcal</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. CHART */}
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">BMI Against DSM-5 Severity Thresholds</h4>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="range" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={55} interval={0} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 30]} width={35} />
                        <Tooltip formatter={(v: number) => [fmt(v, 1), "BMI"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Bar dataKey="bmi" radius={[4, 4, 0, 0]}>
                          {chartData.map(entry => <Cell key={entry.range} fill={entry.fill} />)}
                        </Bar>
                        <ReferenceLine y={18.5} stroke="#10b981" strokeDasharray="5 5" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#3b82f6" }} />
                      <span className="font-semibold text-muted-foreground">Your BMI</span>
                      <span className="font-bold text-foreground">{fmt(result.bmi, 1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#10b981" }} />
                      <span className="font-semibold text-muted-foreground">Healthy minimum</span>
                      <span className="font-bold text-foreground">18.5</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#dc2626" }} />
                      <span className="font-semibold text-muted-foreground">DSM-5 severity cut-offs</span>
                    </div>
                  </div>
                </div>

                {/* 5. SUMMARY STATISTICS */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {rows.map(row => (
                      <div key={row.label} className="flex justify-between border-b border-border/50 py-1">
                        <span className="text-muted-foreground font-medium">{row.label}</span>
                        <span className={`font-bold ${row.highlight ? deficitColor : "text-foreground"}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">{result.description}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What This Calculator Does</h2>
            <p>This tool computes Body Mass Index and places it on the severity scale that DSM-5 uses to grade anorexia nervosa in adults. BMI is weight in kilograms divided by height in metres squared. The severity tiers are Mild at 17 and above, Moderate from 16 to 16.99, Severe from 15 to 15.99, and Extreme below 15. Alongside the score, the calculator reports a weight-restoration target — the weight corresponding to your chosen goal BMI — and the shortfall between current and target weight. The shortfall is floored at zero, so this calculator can never display a weight-loss figure regardless of what is entered.</p>
            <h2 className="text-2xl font-bold mb-3">BMI Grades Severity, It Does Not Diagnose</h2>
            <p>Anorexia nervosa is a psychiatric disorder defined by restriction of energy intake, intense fear of weight gain, and disturbance in how body weight or shape is experienced. BMI measures the physical consequence of starvation once a diagnosis exists; it plays no part in making one. This distinction matters because atypical anorexia nervosa — meeting every criterion except the low weight — occurs at normal and high BMI and carries the same medical and psychological risk, including bradycardia, electrolyte disturbance, bone loss and suicidality. A reassuring number on this page rules out nothing.</p>
            <h2 className="text-2xl font-bold mb-3">Choosing a Restoration Target</h2>
            <p>A BMI of 18.5 is the World Health Organization's lower bound for the healthy range and the usual minimum goal. Many eating-disorder services set a higher target, commonly 19 or 20, because menstrual function, bone mineral density and cognitive recovery frequently do not return at the bare minimum. The advanced options let you model all three so the arithmetic reflects the goal your clinician has actually set. The calculator also estimates how long restoration would take at a supervised rate of gain, using the conventional figure of roughly 7,700 kcal per kilogram of tissue.</p>
            <h2 className="text-2xl font-bold mb-3">Refeeding Must Be Supervised</h2>
            <p>The energy and timeline figures here are arithmetic, not a plan. Reintroducing nutrition after prolonged starvation can trigger refeeding syndrome — a rapid shift in phosphate, potassium and magnesium that can be fatal — which is why restoration is started cautiously and monitored with blood tests. Real energy requirements during refeeding also run well above what this simple calculation predicts, because metabolic rate climbs sharply as nutrition is restored. Published rates are roughly 0.5 to 1.4 kg per week inpatient and 0.2 to 0.5 kg per week outpatient, always under medical supervision.</p>
            <h2 className="text-2xl font-bold mb-3">Please Seek Help</h2>
            <p>This calculator is informational and is not a diagnostic instrument. It cannot assess eating behaviour, body image, medical stability or psychological risk. If you or someone you know is struggling with an eating disorder, please seek professional medical help immediately — eating disorders have among the highest mortality rates of any psychiatric illness, and they respond well to early treatment.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/anorexic-bmi-calculator" />
          <PopularCalculators exclude="/calculator/anorexic-bmi-calculator" />
        </div>
      </div>
    </>
  );
}
