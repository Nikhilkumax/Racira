"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

type UnitSystem = "imperial" | "metric";
type Severity = "Extreme" | "Severe" | "Moderate" | "Mild" | "Healthy" | "Overweight";

interface BmiResult {
  bmi: number;
  category: Severity;
  description: string;
  targetWeightKg: number;
  deficitKg: number;
  targetWeightLbs: number;
  deficitLbs: number;
  colorClass: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { range: string; bmi: number; fill: string }[];
}

function calcBmi(inputs: { unitSystem: UnitSystem; heightFt: number; heightIn: number; heightCm: number; weightLbs: number; weightKg: number }): BmiResult | null {
  const { unitSystem, heightFt, heightIn, heightCm, weightLbs, weightKg } = inputs;
  let heightMeters = 0;
  let currentWeight = 0;

  if (unitSystem === "imperial") {
    if (heightFt <= 0 && heightIn <= 0) return null;
    if (weightLbs <= 0) return null;
    const totalInches = heightFt * 12 + heightIn;
    heightMeters = totalInches * 0.0254;
    currentWeight = weightLbs * 0.453592;
  } else {
    if (heightCm <= 0) return null;
    if (weightKg <= 0) return null;
    heightMeters = heightCm / 100;
    currentWeight = weightKg;
  }

  if (heightMeters <= 0 || currentWeight <= 0) return null;

  const bmi = currentWeight / Math.pow(heightMeters, 2);
  const targetWeightKg = 18.5 * Math.pow(heightMeters, 2);
  const deficitKg = Math.max(0, targetWeightKg - currentWeight);
  const targetWeightLbs = targetWeightKg / 0.453592;
  const deficitLbs = deficitKg / 0.453592;

  let category: Severity = "Healthy";
  let description = "";
  let colorClass = "text-emerald-500";

  if (bmi < 15) {
    category = "Extreme";
    description = "Extreme anorexia nervosa. Severe medical intervention and hospitalization may be required immediately.";
    colorClass = "text-red-600";
  } else if (bmi < 16) {
    category = "Severe";
    description = "Severe anorexia nervosa. Professional clinical treatment is urgently recommended.";
    colorClass = "text-red-500";
  } else if (bmi < 17) {
    category = "Moderate";
    description = "Moderate anorexia nervosa. Medical and psychological monitoring is strongly advised.";
    colorClass = "text-orange-500";
  } else if (bmi < 18.5) {
    category = "Mild";
    description = "Mild anorexia nervosa / Underweight. Focus on weight restoration and nutritional counseling.";
    colorClass = "text-yellow-500";
  } else if (bmi <= 24.9) {
    category = "Healthy";
    description = "Your BMI is within the healthy range. Note: Anorexia is a behavioral disorder, and people with healthy or higher BMIs can still suffer from atypical anorexia.";
    colorClass = "text-emerald-500";
  } else {
    category = "Overweight";
    description = "Your BMI is above the healthy range. Note: Anorexia is a behavioral disorder, and people with healthy or higher BMIs can still suffer from atypical anorexia.";
    colorClass = "text-blue-500";
  }

  const r = (n: number) => parseFloat(n.toFixed(1));

  const breakdown = [
    { label: "Current BMI", value: `${r(bmi)}` },
    { label: "Severity Category", value: category },
    { label: "Current Weight", value: unitSystem === "imperial" ? `${r(weightLbs)} lbs` : `${r(weightKg)} kg` },
    { label: "Target Weight (BMI 18.5)", value: unitSystem === "imperial" ? `${r(targetWeightLbs)} lbs` : `${r(targetWeightKg)} kg` },
    { label: "Weight Restoration Goal", value: deficitKg > 0 ? (unitSystem === "imperial" ? `+${r(deficitLbs)} lbs` : `+${r(deficitKg)} kg`) : "At target" },
    { label: "Height", value: unitSystem === "imperial" ? `${heightFt}′ ${heightIn}″` : `${heightCm} cm` },
  ];

  const summaryStats = [
    { label: "BMI", value: `${r(bmi)}` },
    { label: "Category", value: category },
    { label: "Target Weight", value: unitSystem === "imperial" ? `${r(targetWeightLbs)} lbs` : `${r(targetWeightKg)} kg` },
    { label: "Weight Deficit", value: deficitKg > 0 ? (unitSystem === "imperial" ? `${r(deficitLbs)} lbs` : `${r(deficitKg)} kg`) : "None" },
    { label: "Healthy BMI Range", value: "18.5–24.9" },
    { label: "Unit System", value: unitSystem === "imperial" ? "Imperial" : "Metric" },
  ];

  const chartData = [
    { range: "Extreme (<15)", bmi: 14, fill: "#dc2626" },
    { range: "Severe (15-16)", bmi: 15.5, fill: "#ef4444" },
    { range: "Moderate (16-17)", bmi: 16.5, fill: "#f97316" },
    { range: "Mild (17-18.5)", bmi: 17.7, fill: "#eab308" },
    { range: "Healthy (18.5-25)", bmi: 21.7, fill: "#10b981" },
    { range: "Your BMI", bmi: r(bmi), fill: "#3b82f6" },
  ];

  return {
    bmi: r(bmi), category, description,
    targetWeightKg: r(targetWeightKg), deficitKg: r(deficitKg),
    targetWeightLbs: r(targetWeightLbs), deficitLbs: r(deficitLbs),
    colorClass, breakdown, summaryStats, chartData,
  };
}

const DEFAULTS = {
  unitSystem: "imperial" as UnitSystem,
  heightFt: "5", heightIn: "6", heightCm: "168",
  weightLbs: "100", weightKg: "45",
};

export default function AnorexicBmiCalculator() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(DEFAULTS.unitSystem);
  const [heightFt, setHeightFt] = useState(DEFAULTS.heightFt);
  const [heightIn, setHeightIn] = useState(DEFAULTS.heightIn);
  const [heightCm, setHeightCm] = useState(DEFAULTS.heightCm);
  const [weightLbs, setWeightLbs] = useState(DEFAULTS.weightLbs);
  const [weightKg, setWeightKg] = useState(DEFAULTS.weightKg);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<BmiResult | null>(null);

  const calculate = () => {
    setErrorMsg("");
    const ft = parseInt(heightFt, 10) || 0;
    const inch = parseInt(heightIn, 10) || 0;
    const cm = parseFloat(heightCm) || 0;
    const lbs = parseFloat(weightLbs) || 0;
    const kg = parseFloat(weightKg) || 0;

    if (unitSystem === "imperial" && ft === 0 && inch === 0) { setErrorMsg("Please enter your height."); return; }
    if (unitSystem === "metric" && cm === 0) { setErrorMsg("Please enter your height."); return; }
    if (unitSystem === "imperial" && lbs === 0) { setErrorMsg("Please enter your weight."); return; }
    if (unitSystem === "metric" && kg === 0) { setErrorMsg("Please enter your weight."); return; }

    const res = calcBmi({ unitSystem, heightFt: ft, heightIn: inch, heightCm: cm, weightLbs: lbs, weightKg: kg });
    if (!res) setErrorMsg("Unable to calculate. Please check your inputs.");
    else setResult(res);
  };

  const reset = () => {
    setUnitSystem(DEFAULTS.unitSystem); setHeightFt(DEFAULTS.heightFt); setHeightIn(DEFAULTS.heightIn);
    setHeightCm(DEFAULTS.heightCm); setWeightLbs(DEFAULTS.weightLbs); setWeightKg(DEFAULTS.weightKg);
    setErrorMsg("");
    setResult(calcBmi({ unitSystem: "imperial", heightFt: 5, heightIn: 6, heightCm: 168, weightLbs: 100, weightKg: 45 }));
  };

  useEffect(() => { setResult(calcBmi({ unitSystem: "imperial", heightFt: 5, heightIn: 6, heightCm: 168, weightLbs: 100, weightKg: 45 })); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What are the DSM-5 severity classifications for Anorexia Nervosa?", answer: "The DSM-5 classifies severity based on BMI for adults: Mild is a BMI greater than or equal to 17; Moderate is a BMI of 16 to 16.99; Severe is a BMI of 15 to 15.99; and Extreme is a BMI of less than 15." },
    { question: "Is Anorexia defined strictly by BMI?", answer: "No. Anorexia Nervosa is a severe psychological eating disorder characterized by an intense fear of gaining weight and a distorted body image. While BMI is used to gauge the severity of physical starvation, people at a normal or even overweight BMI can suffer from 'Atypical Anorexia Nervosa,' which carries the exact same psychological and physiological risks." },
    { question: "When does a low BMI become an acute medical emergency?", answer: "A BMI below 15 (Extreme Anorexia) is often considered an acute medical emergency because organ systems begin to shut down due to severe starvation. This can lead to cardiac arrest, severe electrolyte imbalances, and bone marrow failure. However, sudden or rapid weight loss is dangerous at any BMI." },
    { question: "What is the target BMI for weight restoration?", answer: "Clinical guidelines usually set a minimum target BMI of 18.5, which is the lower boundary of the standard 'Healthy' weight category according to the WHO. Reaching this target restores basic metabolic function and hormonal balance." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Anorexic BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Anorexic BMI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex bg-muted p-1 rounded-lg">
              <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "imperial" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setUnitSystem("imperial")}>Imperial</button>
              <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${unitSystem === "metric" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`} onClick={() => setUnitSystem("metric")}>Metric</button>
            </div>
            {unitSystem === "imperial" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height (ft)</label>
                     <div className={inp}><input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Height (in)</label>
                     <div className={inp}><input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Current Weight (lbs)</label>
                   <div className={inp}><input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Height (cm)</label>
                   <div className={inp}><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Current Weight (kg)</label>
                   <div className={inp}><input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') calculate(); }} className={ci} /></div>
                </div>
              </>
            )}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />{errorMsg}
              </div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Current BMI</div>
                <div className={`text-4xl font-extrabold tracking-tight ${result.colorClass}`}>{result.bmi}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.category} severity · {result.description}</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Category", result.category], ["Target Wt", unitSystem === "imperial" ? `${result.targetWeightLbs} lbs` : `${result.targetWeightKg} kg`], ["Deficit", result.deficitKg > 0 ? (unitSystem === "imperial" ? `+${result.deficitLbs} lbs` : `+${result.deficitKg} kg`) : "None"]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">BMI Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 0 ? "bg-primary/5" : ""}`}>
                      <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">BMI Severity Scale</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 30]} />
                    <Tooltip formatter={(v: number) => [v, "BMI"]} />
                    <Bar dataKey="bmi" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                    <ReferenceLine y={18.5} stroke="#10b981" strokeDasharray="5 5" label={{ value: "Healthy min", fontSize: 10, position: "top" }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="mt-12 space-y-8 text-base text-foreground">
            <div>
              <h2 className="text-2xl font-bold mb-3">What Is an Anorexic BMI Calculator?</h2>
              <p className="text-muted-foreground leading-relaxed">An anorexic BMI calculator is a clinical tool that computes Body Mass Index and classifies the physical severity of weight loss according to DSM-5 criteria for Anorexia Nervosa. BMI is calculated as weight in kilograms divided by height in meters squared. The DSM-5 defines severity tiers: Mild (BMI ≥ 17), Moderate (16–16.99), Severe (15–15.99), and Extreme (&lt; 15). This calculator also computes the weight restoration target — the weight needed to reach a BMI of 18.5, the WHO minimum healthy threshold. It is important to note that anorexia is fundamentally a psychological disorder; BMI only measures the physical consequence of starvation, not the disorder itself.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground leading-relaxed">The calculator uses the standard BMI formula: BMI = weight (kg) / height² (m²). For imperial inputs, weight in pounds is converted to kilograms (1 lb = 0.453592 kg) and height in feet/inches is converted to meters (1 inch = 0.0254 m). The resulting BMI is then classified into DSM-5 severity categories. The weight restoration target is calculated as: target weight = 18.5 × height² (m²), which gives the minimum weight for a healthy BMI. The deficit is the difference between the target and current weight. The chart displays the BMI severity scale with your current position highlighted, along with a reference line at the healthy minimum of 18.5.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
              <p className="text-muted-foreground leading-relaxed">The primary result card shows your current BMI with a color-coded severity label. The 3-stat bar summarizes your category, target weight, and the weight deficit needed to reach a healthy BMI. The breakdown table provides all key metrics including height, current weight, and restoration goal. The bar chart places your BMI on the severity scale alongside the clinical thresholds. If your BMI is below 18.5, the weight restoration goal shows how much weight gain is needed to reach the minimum healthy threshold. If you or someone you know is struggling with an eating disorder, please seek professional medical help immediately — this tool is for informational purposes only and is not a diagnostic instrument.</p>
            </div>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/anorexic-bmi-calculator" />
          <PopularCalculators exclude="/calculator/anorexic-bmi-calculator" />
        </div>
      </div>
    </>
  );
}