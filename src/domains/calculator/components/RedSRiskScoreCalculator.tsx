"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import InputField from "@/domains/calculator/components/ui/InputField";

type Sex = "female" | "male";
type MenstrualStatus = "eumenorrheic" | "oligomenorrhea" | "amenorrhea" | "na";
type EatingScreen = "none" | "some" | "marked";

interface RedSInputs {
  energyIntake: number;
  exerciseExpenditure: number;
  bodyWeight: number;
  bodyFatPercent: number;
  sex: Sex;
  heightCm: number;
  menstrual: MenstrualStatus;
  boneInjuries: number;
  eatingScreen: EatingScreen;
}

interface RedSResult {
  fatFreeMass: number;
  energyAvailability: number;
  eaBand: string;
  eaPoints: number;
  bmi: number;
  bmiPoints: number;
  menstrualPoints: number;
  bonePoints: number;
  eatingPoints: number;
  totalScore: number;
  maxScore: number;
  tier: "Low" | "Moderate" | "High";
  clearance: string;
  deficitKcal: number;
  intakeForOptimal: number;
  percentOfOptimal: number;
}

// Energy availability thresholds in kcal per kg of fat-free mass per day.
// 45 is the accepted optimal figure; below 30 is clinically low.
const EA_OPTIMAL = 45;
const EA_REDUCED = 30;

const DEFAULTS: RedSInputs = {
  energyIntake: 2200,
  exerciseExpenditure: 700,
  bodyWeight: 58,
  bodyFatPercent: 18,
  sex: "female",
  heightCm: 168,
  menstrual: "eumenorrheic",
  boneInjuries: 0,
  eatingScreen: "none",
};

export function calculateRedS(i: RedSInputs): RedSResult {
  const fatFreeMass = i.bodyWeight * (1 - Math.min(Math.max(i.bodyFatPercent, 0), 70) / 100);
  const energyAvailability =
    fatFreeMass > 0 ? (i.energyIntake - i.exerciseExpenditure) / fatFreeMass : 0;

  let eaBand = "Optimal";
  let eaPoints = 0;
  if (energyAvailability < EA_REDUCED) {
    eaBand = "Low";
    eaPoints = 4;
  } else if (energyAvailability < EA_OPTIMAL) {
    eaBand = "Reduced";
    eaPoints = 2;
  }

  const heightM = i.heightCm / 100;
  const bmi = heightM > 0 ? i.bodyWeight / (heightM * heightM) : 0;
  const bmiPoints = bmi > 0 && bmi < 17.5 ? 3 : bmi < 18.5 ? 1 : 0;

  let menstrualPoints = 0;
  if (i.sex === "female") {
    if (i.menstrual === "amenorrhea") menstrualPoints = 4;
    else if (i.menstrual === "oligomenorrhea") menstrualPoints = 2;
  }

  // Each prior bone stress injury adds risk, capped so one factor cannot dominate.
  const bonePoints = Math.min(i.boneInjuries, 3) * 2;
  const eatingPoints = i.eatingScreen === "marked" ? 4 : i.eatingScreen === "some" ? 2 : 0;

  const totalScore = eaPoints + bmiPoints + menstrualPoints + bonePoints + eatingPoints;
  const maxScore = i.sex === "female" ? 21 : 17;

  let tier: "Low" | "Moderate" | "High" = "Low";
  let clearance = "Green light — full training and competition, with routine monitoring.";
  if (totalScore >= 9) {
    tier = "High";
    clearance = "Red light — withhold from competition; supervised treatment plan required.";
  } else if (totalScore >= 4) {
    tier = "Moderate";
    clearance = "Yellow light — may train under a supervised plan with medical review.";
  }

  const intakeForOptimal = EA_OPTIMAL * fatFreeMass + i.exerciseExpenditure;

  return {
    fatFreeMass,
    energyAvailability,
    eaBand,
    eaPoints,
    bmi,
    bmiPoints,
    menstrualPoints,
    bonePoints,
    eatingPoints,
    totalScore,
    maxScore,
    tier,
    clearance,
    deficitKcal: Math.max(intakeForOptimal - i.energyIntake, 0),
    intakeForOptimal,
    percentOfOptimal: (energyAvailability / EA_OPTIMAL) * 100,
  };
}

const fmt = (n: number, dec = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");

export default function RedSRiskScoreCalculator() {
  const [energyIntake, setEnergyIntake] = useState(String(DEFAULTS.energyIntake));
  const [exerciseExpenditure, setExerciseExpenditure] = useState(String(DEFAULTS.exerciseExpenditure));
  const [bodyWeight, setBodyWeight] = useState(String(DEFAULTS.bodyWeight));
  const [bodyFatPercent, setBodyFatPercent] = useState(String(DEFAULTS.bodyFatPercent));
  const [sex, setSex] = useState<Sex>(DEFAULTS.sex);
  const [heightCm, setHeightCm] = useState(String(DEFAULTS.heightCm));
  const [menstrual, setMenstrual] = useState<MenstrualStatus>(DEFAULTS.menstrual);
  const [boneInjuries, setBoneInjuries] = useState(String(DEFAULTS.boneInjuries));
  const [eatingScreen, setEatingScreen] = useState<EatingScreen>(DEFAULTS.eatingScreen);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [result, setResult] = useState<RedSResult>(calculateRedS(DEFAULTS));

  const getInputs = (): RedSInputs => ({
    energyIntake: parseFloat(energyIntake) || 0,
    exerciseExpenditure: parseFloat(exerciseExpenditure) || 0,
    bodyWeight: parseFloat(bodyWeight) || 0,
    bodyFatPercent: parseFloat(bodyFatPercent) || 0,
    sex,
    heightCm: parseFloat(heightCm) || 0,
    menstrual: sex === "male" ? "na" : menstrual,
    boneInjuries: parseFloat(boneInjuries) || 0,
    eatingScreen,
  });

  useEffect(() => {
    setResult(calculateRedS(DEFAULTS));
  }, []);

  const intakeNum = parseFloat(energyIntake) || 0;
  const eeeNum = parseFloat(exerciseExpenditure) || 0;
  const weightNum = parseFloat(bodyWeight) || 0;
  const bfNum = parseFloat(bodyFatPercent) || 0;
  const heightNum = parseFloat(heightCm) || 0;
  const boneNum = parseFloat(boneInjuries) || 0;

  let errorMsg = "";
  if (weightNum <= 0) errorMsg = "Body weight must be greater than zero.";
  else if (bfNum < 3 || bfNum > 60) errorMsg = "Body fat percentage must be between 3% and 60%.";
  else if (intakeNum <= 0) errorMsg = "Energy intake must be greater than zero.";
  else if (eeeNum < 0) errorMsg = "Exercise energy expenditure cannot be negative.";
  else if (heightNum <= 0) errorMsg = "Height must be greater than zero.";
  else if (boneNum < 0) errorMsg = "Bone stress injuries cannot be negative.";

  const hasValidationErrors = errorMsg !== "";

  const handleCalculate = () => {
    if (hasValidationErrors) return;
    setResult(calculateRedS(getInputs()));
  };

  const reset = () => {
    setEnergyIntake(String(DEFAULTS.energyIntake));
    setExerciseExpenditure(String(DEFAULTS.exerciseExpenditure));
    setBodyWeight(String(DEFAULTS.bodyWeight));
    setBodyFatPercent(String(DEFAULTS.bodyFatPercent));
    setSex(DEFAULTS.sex);
    setHeightCm(String(DEFAULTS.heightCm));
    setMenstrual(DEFAULTS.menstrual);
    setBoneInjuries(String(DEFAULTS.boneInjuries));
    setEatingScreen(DEFAULTS.eatingScreen);
    setResult(calculateRedS(DEFAULTS));
  };

  const tierColor =
    result.tier === "Low" ? "text-emerald-600" : result.tier === "Moderate" ? "text-amber-600" : "text-red-600";
  const eaColor =
    result.eaBand === "Optimal" ? "text-emerald-600" : result.eaBand === "Reduced" ? "text-amber-600" : "text-red-600";

  const chartData = [
    { name: "Your EA", value: Math.max(result.energyAvailability, 0), color: result.eaBand === "Optimal" ? "#10B981" : result.eaBand === "Reduced" ? "#F59E0B" : "#EF4444" },
    { name: "Low threshold", value: EA_REDUCED, color: "#CBD5E1" },
    { name: "Optimal target", value: EA_OPTIMAL, color: "#CBD5E1" },
  ];

  const breakdown = [
    { label: "Body Weight", value: `${fmt(weightNum, 1)} kg` },
    { label: "Fat-Free Mass", value: `${fmt(result.fatFreeMass, 1)} kg` },
    { label: "Energy Intake", value: `${fmtInt(intakeNum)} kcal/day` },
    { label: "Exercise Energy Expenditure", value: `${fmtInt(eeeNum)} kcal/day` },
    { label: "Energy Availability", value: `${fmt(result.energyAvailability, 1)} kcal/kg FFM`, highlight: true },
    { label: `Energy Availability Band (${result.eaBand})`, value: `${result.eaPoints} pts` },
    { label: `Body Mass Index (${fmt(result.bmi, 1)})`, value: `${result.bmiPoints} pts` },
    { label: "Menstrual Function", value: sex === "male" ? "n/a" : `${result.menstrualPoints} pts` },
    { label: `Bone Stress Injuries (${fmtInt(Math.min(boneNum, 3))})`, value: `${result.bonePoints} pts` },
    { label: "Disordered Eating Screen", value: `${result.eatingPoints} pts` },
    { label: "Intake for Optimal EA", value: `${fmtInt(result.intakeForOptimal)} kcal/day` },
    { label: "Daily Shortfall", value: `${fmtInt(result.deficitKcal)} kcal/day` },
  ];

  const faqs = [
    { question: "What is Relative Energy Deficiency in Sport?", answer: "RED-S describes the cluster of impairments that follow when an athlete's energy intake does not cover the demands of training plus normal physiological function. The consequences extend well beyond performance: menstrual function, bone mineral density, immunity, protein synthesis, cardiovascular health and psychological wellbeing are all affected. It replaced the earlier Female Athlete Triad model because the same deficiency occurs in male athletes and involves far more than three symptoms." },
    { question: "How is energy availability calculated?", answer: "Energy availability is dietary energy intake minus exercise energy expenditure, divided by fat-free mass, expressed as kilocalories per kilogram of fat-free mass per day. Fat-free mass is used rather than total body weight because metabolically active tissue drives the requirement. An athlete eating 2,200 kcal, expending 700 kcal in training and carrying 47.6 kg of fat-free mass has an energy availability of about 31 kcal/kg FFM." },
    { question: "What energy availability is considered too low?", answer: "Around 45 kcal/kg FFM per day is regarded as optimal for a healthy adult athlete. Between 30 and 45 is a reduced or subclinical state where adaptations begin to appear. Below 30 is clinically low energy availability, the threshold below which studies consistently show suppressed luteinising hormone pulsatility, reduced bone formation markers and measurable endocrine disruption." },
    { question: "Does RED-S affect male athletes?", answer: "Yes, and it is regularly missed in them. Men lack the obvious warning sign of menstrual disturbance, so low energy availability tends to present later through reduced testosterone, low bone mineral density, recurrent bone stress injuries, frequent illness and stalled performance. Endurance running, cycling, rowing lightweight categories, and weight-class combat sports carry the highest reported prevalence." },
    { question: "Is this the same as the RED-S Clinical Assessment Tool?", answer: "No. The IOC's RED-S CAT is a clinician-administered framework that assigns a red, amber or green light after full history, examination and laboratory investigation. This calculator computes energy availability precisely and organises the commonly used risk indicators into a structured score. It is a screening aid to prompt referral, not a substitute for the clinical assessment." },
    { question: "Why do bone stress injuries matter so much?", answer: "Bone remodelling is among the first processes downregulated under energy restriction, and reduced oestrogen or testosterone compounds the effect. A stress fracture in an athlete with low energy availability is therefore rarely just a training-load problem, and repeat injuries at different sites are a strong signal. Recovery of bone mineral density takes many months of restored intake, and some loss may be permanent." },
    { question: "How quickly does energy availability recover?", answer: "Endocrine markers such as leptin and triiodothyronine respond within days to weeks of increased intake. Menstrual function commonly takes several months to return. Bone mineral density is the slowest, measured over one to three years, and improvement is not guaranteed. This asymmetry is why early detection matters far more than aggressive correction later." },
    { question: "What should I do with a high-risk result?", answer: "Treat it as a prompt for professional assessment, not a diagnosis. A sports physician, an accredited sports dietitian and, where disordered eating is suspected, a psychologist form the standard team. Increasing intake without addressing training load or the underlying behaviour rarely holds. If you are worried about your own eating or that of an athlete you coach, seek medical advice rather than self-managing." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "RED-S Risk Score Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Relative Energy Deficiency in Sport (RED-S) Risk Score Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUTS */}
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <InputField id="intake" label="Energy Intake (kcal/day)" value={energyIntake} onChange={setEnergyIntake} suffix="kcal" tooltip="Average daily dietary energy intake across a representative training week." />
              <InputField id="eee" label="Exercise Energy (kcal/day)" value={exerciseExpenditure} onChange={setExerciseExpenditure} suffix="kcal" tooltip="Energy expended in purposeful training above resting metabolism." />
              <InputField id="weight" label="Body Weight (kg)" value={bodyWeight} onChange={setBodyWeight} suffix="kg" step="any" tooltip="Current body mass in kilograms." />
              <InputField id="body-fat" label="Body Fat (%)" value={bodyFatPercent} onChange={setBodyFatPercent} suffix="%" step="any" tooltip="Body fat percentage, used to derive fat-free mass." />
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
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Anthropometrics</div>
                    <div className="grid grid-cols-2 gap-3">
                      <InputField id="height" label="Height (cm)" value={heightCm} onChange={setHeightCm} suffix="cm" step="any" tooltip="Standing height, used with weight to derive BMI." />
                      <div>
                        <label htmlFor="sex" className="flex items-center text-sm font-medium text-foreground mb-1">Sex</label>
                        <select
                          id="sex"
                          value={sex}
                          onChange={e => setSex(e.target.value as Sex)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-bold">Clinical Indicators</div>
                    <div className="grid grid-cols-2 gap-3">
                      {sex === "female" && (
                        <div>
                          <label htmlFor="menstrual" className="flex items-center text-sm font-medium text-foreground mb-1">Menstrual Status</label>
                          <select
                            id="menstrual"
                            value={menstrual}
                            onChange={e => setMenstrual(e.target.value as MenstrualStatus)}
                            className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="eumenorrheic">Regular cycles</option>
                            <option value="oligomenorrhea">Irregular / infrequent</option>
                            <option value="amenorrhea">Absent 3+ months</option>
                          </select>
                        </div>
                      )}
                      <InputField id="bone" label="Bone Stress Injuries" value={boneInjuries} onChange={setBoneInjuries} tooltip="Number of prior bone stress injuries or stress fractures. Counted up to three." />
                      <div>
                        <label htmlFor="eating" className="flex items-center text-sm font-medium text-foreground mb-1">Eating Behaviour</label>
                        <select
                          id="eating"
                          value={eatingScreen}
                          onChange={e => setEatingScreen(e.target.value as EatingScreen)}
                          className="h-10 w-full rounded-md border border-input bg-background px-2 text-base text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="none">No concerns</option>
                          <option value="some">Some restriction or preoccupation</option>
                          <option value="marked">Marked disordered eating</option>
                        </select>
                      </div>
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
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 text-center relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-bold">Energy Availability</div>
              <div className="text-4xl font-bold text-primary mb-1 tracking-tight">{fmt(result.energyAvailability, 1)}</div>
              <div className="text-sm text-muted-foreground font-medium">
                kcal/kg FFM/day — {result.eaBand} · risk score {fmtInt(result.totalScore)} of {fmtInt(result.maxScore)}
              </div>
            </div>

            {/* 2. 3-STAT BAR */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Risk Tier</span>
                <span className={`font-extrabold ${tierColor}`}>{result.tier}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">EA Status</span>
                <span className={`font-extrabold ${eaColor}`}>{result.eaBand}</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shortfall</span>
                <span className="font-extrabold text-foreground">{fmtInt(result.deficitKcal)} kcal</span>
              </div>
            </div>

            {/* 3. BREAKDOWN TABLE */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-base">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="py-2.5 px-3">Component</th>
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
                    <td className="py-2.5 px-3 text-foreground">Total Risk Score</td>
                    <td className="py-2.5 px-3 text-right text-foreground">{fmtInt(result.totalScore)} / {fmtInt(result.maxScore)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. CHART */}
            <div className="p-4 rounded-lg border border-border bg-card">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Energy Availability vs Clinical Thresholds</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} stroke="currentColor" className="text-muted-foreground" width={40} />
                    <Tooltip formatter={(v: number) => [`${fmt(v, 1)} kcal/kg FFM`, "Energy availability"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                    <ReferenceLine y={EA_REDUCED} stroke="#EF4444" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: chartData[0].color }} />
                  <span className="font-semibold text-muted-foreground">Your EA</span>
                  <span className="font-bold text-foreground">{fmt(result.energyAvailability, 1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#CBD5E1" }} />
                  <span className="font-semibold text-muted-foreground">Thresholds</span>
                  <span className="font-bold text-foreground">30 / 45</span>
                </div>
              </div>
            </div>

            {/* 5. SUMMARY STATISTICS */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h4 className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-3">Summary Statistics</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Energy Availability</span>
                  <span className={`font-bold ${eaColor}`}>{fmt(result.energyAvailability, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Fat-Free Mass</span>
                  <span className="font-bold text-foreground">{fmt(result.fatFreeMass, 1)} kg</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Energy Intake</span>
                  <span className="font-bold text-foreground">{fmtInt(intakeNum)} kcal</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Exercise Expenditure</span>
                  <span className="font-bold text-foreground">{fmtInt(eeeNum)} kcal</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Body Mass Index</span>
                  <span className="font-bold text-foreground">{fmt(result.bmi, 1)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">% of Optimal EA</span>
                  <span className="font-bold text-foreground">{fmt(result.percentOfOptimal, 0)}%</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Intake for Optimal EA</span>
                  <span className="font-bold text-foreground">{fmtInt(result.intakeForOptimal)} kcal</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Daily Shortfall</span>
                  <span className="font-bold text-foreground">{fmtInt(result.deficitKcal)} kcal</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Total Risk Score</span>
                  <span className={`font-bold ${tierColor}`}>{fmtInt(result.totalScore)} / {fmtInt(result.maxScore)}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 py-1">
                  <span className="text-muted-foreground font-medium">Risk Tier</span>
                  <span className={`font-bold ${tierColor}`}>{result.tier}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{result.clearance}</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What This Calculator Measures</h2>
            <p>Relative Energy Deficiency in Sport describes what happens when an athlete's dietary energy intake fails to cover the cost of training alongside normal physiological function. The central quantity is energy availability: intake minus exercise energy expenditure, divided by fat-free mass, in kilocalories per kilogram of fat-free mass per day. Fat-free mass is the denominator because metabolically active tissue, not total body weight, determines the requirement. Roughly 45 kcal/kg FFM per day is considered optimal, 30 to 45 is a reduced state where adaptations begin, and below 30 is clinically low — the point at which research consistently shows suppressed luteinising hormone pulsatility, falling bone formation markers and measurable endocrine disruption.</p>
            <h2 className="text-2xl font-bold mb-3">Why the Score Includes More Than Energy</h2>
            <p>Energy availability alone is a snapshot, and self-reported intake is systematically underestimated. The risk score therefore combines it with the indicators clinicians actually weigh: body mass index, menstrual function in female athletes, the number of prior bone stress injuries, and a screen for disordered eating behaviour. Each contributes points, and no single factor is allowed to dominate the total. The resulting tier maps to the traffic-light logic used in sports medicine — green for full participation with monitoring, amber for supervised training with medical review, red for withholding from competition pending treatment.</p>
            <h2 className="text-2xl font-bold mb-3">Male Athletes Are Routinely Missed</h2>
            <p>The model that preceded RED-S, the Female Athlete Triad, framed the problem as a women's issue. Male athletes experience the same deficiency but lack the visible signal of menstrual disturbance, so presentation is delayed and arrives instead as reduced testosterone, low bone mineral density, recurrent stress fractures, frequent illness and performance that stops improving despite increased training. Reported prevalence is highest in endurance running, cycling, lightweight rowing and weight-class combat sports. This calculator scores male athletes on every factor except menstrual function and adjusts the maximum accordingly.</p>
            <h2 className="text-2xl font-bold mb-3">Recovery Is Asymmetric</h2>
            <p>Restoring intake produces very different timelines across systems. Endocrine markers such as leptin and triiodothyronine respond within days to weeks. Menstrual function typically takes several months to return. Bone mineral density is measured in years, and some loss may never be recovered. That asymmetry is the practical argument for early screening: the cost of investigating a borderline result is small, and the cost of a missed case compounds over a career.</p>
            <h2 className="text-2xl font-bold mb-3">Limits of This Tool</h2>
            <p>The IOC's RED-S Clinical Assessment Tool is administered by a clinician after full history, examination and laboratory work. This calculator computes energy availability exactly and organises the common risk indicators into a structured, reproducible score. It is a screening aid intended to prompt referral. It cannot diagnose RED-S, an eating disorder, or any other condition. If a result concerns you, or you are worried about your own eating or that of an athlete you coach, seek assessment from a sports physician and an accredited sports dietitian rather than self-managing.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/relative-energy-deficiency-in-sport-red-s-risk-score-calculator" />
          <PopularCalculators exclude="/calculator/relative-energy-deficiency-in-sport-red-s-risk-score-calculator" />
        </div>
      </div>
    </>
  );
}
