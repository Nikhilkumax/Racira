"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TdeeInput {
  gender: "male" | "female";
  age: number;
  weight: number;
  weightUnit: "lb" | "kg";
  height: number;
  heightUnit: "in" | "cm";
  activity: number;
}

interface TdeeResult {
  bmr: number;
  tdee: number;
  cutCalories: number;
  bulkCalories: number;
  activityBurn: number;
  tef: number;
  donutData: { name: string; value: number; color: string }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

const ACTIVITY_LABELS: Record<number, string> = {
  1.2: "Sedentary",
  1.375: "Lightly Active",
  1.55: "Moderately Active",
  1.725: "Very Active",
  1.9: "Athlete",
};

function calcTdee(input: TdeeInput): TdeeResult {
  const weightKg = input.weightUnit === "lb" ? input.weight / 2.20462 : input.weight;
  const heightCm = input.heightUnit === "in" ? input.height * 2.54 : input.height;

  // Mifflin-St Jeor
  const bmr = input.gender === "male"
    ? 10 * weightKg + 6.25 * heightCm - 5 * input.age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * input.age - 161;

  const tdee = bmr * input.activity;
  const cutCalories = tdee - 500;
  const bulkCalories = tdee + 500;
  const tef = tdee * 0.1; // thermic effect of food ~10%
  const activityBurn = Math.max(0, tdee - bmr - tef);

  const donutData = [
    { name: "BMR (Resting)", value: Math.round(bmr), color: "hsl(var(--primary))" },
    { name: "Activity Burn", value: Math.round(activityBurn), color: "#10b981" },
    { name: "Thermic Effect (TEF)", value: Math.round(tef), color: "#f59e0b" },
  ];

  const breakdown = [
    { label: "Gender", value: input.gender === "male" ? "Male" : "Female" },
    { label: "Age", value: `${input.age} years` },
    { label: "Weight", value: `${input.weight} ${input.weightUnit}` },
    { label: "Height", value: `${input.height} ${input.heightUnit}` },
    { label: "Activity Level", value: `${ACTIVITY_LABELS[input.activity]} (×${input.activity})` },
    { label: "BMR (Mifflin-St Jeor)", value: `${Math.round(bmr).toLocaleString()} kcal` },
    { label: "Maintenance (TDEE)", value: `${Math.round(tdee).toLocaleString()} kcal` },
    { label: "Weight Loss (−500)", value: `${Math.round(cutCalories).toLocaleString()} kcal` },
    { label: "Weight Gain (+500)", value: `${Math.round(bulkCalories).toLocaleString()} kcal` },
  ];

  const summaryStats = [
    { label: "BMR (at rest)", value: `${Math.round(bmr).toLocaleString()} kcal` },
    { label: "Maintenance (TDEE)", value: `${Math.round(tdee).toLocaleString()} kcal` },
    { label: "Weight Loss (−500)", value: `${Math.round(cutCalories).toLocaleString()} kcal` },
    { label: "Weight Gain (+500)", value: `${Math.round(bulkCalories).toLocaleString()} kcal` },
    { label: "Activity Burn", value: `${Math.round(activityBurn).toLocaleString()} kcal` },
    { label: "Thermic Effect (TEF)", value: `${Math.round(tef).toLocaleString()} kcal` },
  ];

  return { bmr, tdee, cutCalories, bulkCalories, activityBurn, tef, donutData, breakdown, summaryStats };
}

const DEFAULTS: TdeeInput = { gender: "male", age: 30, weight: 175, weightUnit: "lb", height: 70, heightUnit: "in", activity: 1.55 };

const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary";
const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

export default function TdeeCalculator() {
  const [gender, setGender] = useState<TdeeInput["gender"]>(DEFAULTS.gender);
  const [age, setAge] = useState(String(DEFAULTS.age));
  const [weight, setWeight] = useState(String(DEFAULTS.weight));
  const [weightUnit, setWeightUnit] = useState<TdeeInput["weightUnit"]>(DEFAULTS.weightUnit);
  const [height, setHeight] = useState(String(DEFAULTS.height));
  const [heightUnit, setHeightUnit] = useState<TdeeInput["heightUnit"]>(DEFAULTS.heightUnit);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [result, setResult] = useState<TdeeResult | null>(null);

  const parse = (s: string, fallback: number) => {
    const n = parseFloat(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const calculate = () =>
    setResult(calcTdee({
      gender,
      age: parse(age, DEFAULTS.age),
      weight: parse(weight, DEFAULTS.weight),
      weightUnit,
      height: parse(height, DEFAULTS.height),
      heightUnit,
      activity,
    }));
  const reset = () => {
    setGender(DEFAULTS.gender);
    setAge(String(DEFAULTS.age));
    setWeight(String(DEFAULTS.weight));
    setWeightUnit(DEFAULTS.weightUnit);
    setHeight(String(DEFAULTS.height));
    setHeightUnit(DEFAULTS.heightUnit);
    setActivity(DEFAULTS.activity);
    setResult(calcTdee(DEFAULTS));
  };
  useEffect(() => {
    setResult(calcTdee(DEFAULTS));
  }, []);

  const faqs = [
    { question: "What is TDEE?", answer: "Total Daily Energy Expenditure (TDEE) is the total number of calories you burn per day, including BMR, physical activity, and the thermic effect of food. It is the most important number for managing weight." },
    { question: "How do I use TDEE for weight loss?", answer: "To lose weight, eat 300–500 calories below your TDEE (caloric deficit). A 500 cal/day deficit results in approximately 0.45 kg (1 lb) of fat loss per week. For muscle gain, eat 300–500 calories above TDEE." },
    { question: "How accurate is TDEE?", answer: "TDEE estimates are within 10–15% accuracy. Tracking your actual weight changes over 2–3 weeks and adjusting calories is the most reliable approach — recalculate every 5–10 kg of weight change." },
    { question: "What is the Mifflin-St Jeor equation?", answer: "Men: BMR = 10×weight(kg) + 6.25×height(cm) − 5×age + 5. Women: 10×weight(kg) + 6.25×height(cm) − 5×age − 161. It is the most accurate widely used BMR equation for most people." },
    { question: "Should I eat back exercise calories?", answer: "TDEE already includes exercise calories based on your activity level. If you use a separate tracker, be careful not to double-count exercise calories." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "TDEE Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">TDEE Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="flex gap-2">
              <button onClick={() => setGender("male")} className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${gender === "male" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Male</button>
              <button onClick={() => setGender("female")} className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${gender === "female" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>Female</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={ci} />
                  <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value as TdeeInput["weightUnit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="lb">lb</option><option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Height</label>
                <div className={inp}><input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={ci} />
                  <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value as TdeeInput["heightUnit"])} className="h-full px-2 text-sm bg-transparent border-l border-border outline-none text-muted-foreground">
                    <option value="in">in</option><option value="cm">cm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Activity Level</label>
                <select value={activity} onChange={(e) => setActivity(Number(e.target.value))} className="w-full h-10 px-3 text-base rounded-md border border-input bg-background text-foreground">
                  <option value={1.2}>Sedentary</option>
                  <option value={1.375}>Lightly Active</option>
                  <option value={1.55}>Moderately Active</option>
                  <option value={1.725}>Very Active</option>
                  <option value={1.9}>Athlete</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (
              <>
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Maintenance Calories (TDEE)</div>
                  <div className="text-4xl font-extrabold tracking-tight text-primary">{Math.round(result.tdee).toLocaleString()} <span className="text-xl font-bold text-muted-foreground">kcal/day</span></div>
                  <div className="text-sm text-muted-foreground mt-1">BMR {Math.round(result.bmr).toLocaleString()} · {ACTIVITY_LABELS[activity]} ×{activity}</div>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                  {[["BMR (Rest)", `${Math.round(result.bmr).toLocaleString()}`], ["Weight Loss (−500)", `${Math.round(result.cutCalories).toLocaleString()}`], ["Weight Gain (+500)", `${Math.round(result.bulkCalories).toLocaleString()}`]].map(([l, v], i) => (
                    <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                      <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                      <div className="text-base font-bold">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Energy Breakdown</h3>
                  <table className="w-full text-base"><tbody>
                    {result.breakdown.map((r, i) => (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 6 ? "bg-secondary/30 font-bold" : ""}`}>
                        <td className="py-2.5 px-3 text-muted-foreground">{r.label}</td>
                        <td className="py-2.5 px-3 text-right font-semibold">{r.value}</td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>

                <div className="card-calculator !p-5 border border-border bg-card">
                  <h3 className="text-base font-bold mb-4">Where Your Calories Go</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2}>
                        {result.donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kcal`, ""]} />
                      <Legend />
                    </PieChart>
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
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is TDEE?</h2>
            <p>Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a day. It combines your Basal Metabolic Rate (BMR) — calories burned at rest — with energy used for physical activity, digestion, and non-exercise movement. TDEE is the cornerstone of every weight management plan.</p>
            <h2 className="text-2xl font-bold mb-3">How Is TDEE Calculated?</h2>
            <p><strong>TDEE = BMR × Activity Multiplier.</strong> This calculator uses the Mifflin-St Jeor equation for BMR — Men: 10×kg + 6.25×cm − 5×age + 5; Women: 10×kg + 6.25×cm − 5×age − 161 — and multiplies it by your activity factor (1.2 sedentary through 1.9 athlete).</p>
            <h2 className="text-2xl font-bold mb-3">Using TDEE for Your Goals</h2>
            <p><strong>Weight loss:</strong> eat 300–500 calories below TDEE and don't go below BMR. <strong>Maintenance:</strong> eat at TDEE. <strong>Muscle gain:</strong> eat 300–500 calories above TDEE with strength training. Recalculate every 5–10 kg of weight change, and be honest about your activity level — most people are Light or Moderate.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tdee-calculator" />
          <PopularCalculators exclude="/calculator/tdee-calculator" />
        </div>
      </div>
    </>
  );
}
