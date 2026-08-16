"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface BmrResult {
  bmr: number;
  formulaUsed: string;
  weekly: number;
  monthly: number;
  yearly: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBmr(gender: "male" | "female", age: number, weight: number, heightCm: number, formula: "mifflin" | "harris" | "katch", bodyFat: number): BmrResult {
  let bmr: number;
  let formulaName: string;

  if (formula === "mifflin") {
    bmr = gender === "male" ? 10 * weight + 6.25 * heightCm - 5 * age + 5 : 10 * weight + 6.25 * heightCm - 5 * age - 161;
    formulaName = "Mifflin-St Jeor";
  } else if (formula === "harris") {
    bmr = gender === "male" ? 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age : 447.593 + 9.247 * weight + 3.098 * heightCm - 4.330 * age;
    formulaName = "Harris-Benedict (Revised)";
  } else {
    const bf = Math.max(0, Math.min(75, bodyFat));
    const lbm = weight * (1 - bf / 100);
    bmr = 370 + 21.6 * lbm;
    formulaName = "Katch-McArdle";
  }

  bmr = Math.max(0, Math.round(bmr));

  return {
    bmr,
    formulaUsed: formulaName,
    weekly: bmr * 7,
    monthly: bmr * 30,
    yearly: bmr * 365,
    chartData: [
      { name: "Daily", value: bmr },
      { name: "Weekly", value: bmr * 7 },
      { name: "Monthly", value: bmr * 30 },
    ],
    breakdown: [
      { label: "Age", value: `${age} years` },
      { label: "Weight", value: `${weight} kg` },
      { label: "Height", value: `${heightCm} cm` },
      { label: "Formula", value: formulaName },
      { label: "Daily BMR", value: `${bmr.toLocaleString()} kcal` },
      { label: "Weekly BMR", value: `${(bmr * 7).toLocaleString()} kcal` },
      { label: "Monthly BMR", value: `${(bmr * 30).toLocaleString()} kcal` },
      { label: "Annual BMR", value: `${(bmr * 365).toLocaleString()} kcal` },
    ],
    summaryStats: [
      { label: "Daily BMR", value: `${bmr.toLocaleString()} kcal` },
      { label: "Weekly BMR", value: `${(bmr * 7).toLocaleString()} kcal` },
      { label: "Monthly BMR", value: `${(bmr * 30).toLocaleString()} kcal` },
      { label: "Annual BMR", value: `${(bmr * 365).toLocaleString()} kcal` },
      { label: "Per Hour", value: `${(bmr / 24).toFixed(0)} kcal` },
      { label: "Formula", value: formulaName },
    ],
  };
}

const DEFAULTS = { gender: "male" as "male" | "female", age: "30", weight: "70", height: "170", formula: "mifflin" as "mifflin" | "harris" | "katch", bodyFat: "20" };

export default function BMRCalculator() {
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  const [age, setAge] = useState(DEFAULTS.age);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightCm, setHeightCm] = useState(DEFAULTS.height);
  const [formula, setFormula] = useState<"mifflin" | "harris" | "katch">(DEFAULTS.formula);
  const [bodyFat, setBodyFat] = useState(DEFAULTS.bodyFat);
  const [result, setResult] = useState<BmrResult>(() => calcBmr("male", 30, 70, 170, "mifflin", 20));

  const calculate = () => setResult(calcBmr(gender, parseFloat(age) || 0, parseFloat(weight) || 0, parseFloat(heightCm) || 0, formula, parseFloat(bodyFat) || 0));
  const reset = () => { setGender(DEFAULTS.gender); setAge(DEFAULTS.age); setWeight(DEFAULTS.weight); setHeightCm(DEFAULTS.height); setFormula(DEFAULTS.formula); setBodyFat(DEFAULTS.bodyFat); setResult(calcBmr("male", 30, 70, 170, "mifflin", 20)); };
  useEffect(() => { setResult(calcBmr("male", 30, 70, 170, "mifflin", 20)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is BMR?", answer: "Basal Metabolic Rate (BMR) is the number of calories your body needs to perform basic life-sustaining functions like breathing, circulation, and cell production while completely at rest." },
    { question: "Which BMR formula is most accurate?", answer: "The Mifflin-St Jeor equation is considered the most accurate for most people. The Katch-McArdle formula is better if you know your body fat percentage, as it accounts for lean body mass." },
    { question: "How is BMR different from TDEE?", answer: "BMR is calories burned at complete rest. TDEE (Total Daily Energy Expenditure) includes BMR plus calories burned through daily activities and exercise. TDEE = BMR × Activity Multiplier." },
    { question: "Can I increase my BMR?", answer: "Yes — building muscle mass increases BMR since muscle tissue burns more calories at rest than fat. Regular strength training, adequate protein intake, and staying hydrated can help boost BMR." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMR Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">BMR Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              <button onClick={() => setGender("male")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${gender === "male" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Male</button>
              <button onClick={() => setGender("female")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${gender === "female" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Female</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">yr</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              {formula === "katch" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Body Fat</label>
                  <div className={inp}><input type="number" value={bodyFat} onChange={e => setBodyFat(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">%</span></div>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Formula</label>
              <div className="grid grid-cols-3 gap-1.5">
                {([["mifflin", "Mifflin"], ["harris", "Harris-Ben"], ["katch", "Katch"]] as const).map(([val, label]) => (
                  <button key={val} onClick={() => setFormula(val)} className={`h-9 rounded-md text-xs font-semibold border border-input transition-colors ${formula === val ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-secondary/80"}`}>{label}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Basal Metabolic Rate</div>
              <div className="text-4xl font-extrabold text-primary">{result.bmr.toLocaleString()} <span className="text-2xl">kcal/day</span></div>
              <div className="text-sm text-muted-foreground mt-1">Calories burned at complete rest · {result.formulaUsed}</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Daily", `${result.bmr.toLocaleString()} kcal`], ["Weekly", `${result.weekly.toLocaleString()} kcal`], ["Monthly", `${result.monthly.toLocaleString()} kcal`]].map(([l, v], i) => (
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
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">BMR by Time Period</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kcal`, "BMR"]} />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={60} />
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
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is BMR?</h2>
            <p>Basal Metabolic Rate (BMR) represents the minimum number of calories your body needs to function while at complete rest. This includes essential processes like breathing, blood circulation, nutrient processing, and cell production. BMR typically accounts for 60–75% of your total daily calorie expenditure.</p>
            <h2 className="text-2xl font-bold mb-3">BMR Formulas Explained</h2>
            <h3>Mifflin-St Jeor (Recommended)</h3>
            <p><strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5</p>
            <p><strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161</p>
            <h3>Harris-Benedict (Revised)</h3>
            <p><strong>Men:</strong> BMR = 88.362 + 13.397 × weight(kg) + 4.799 × height(cm) − 5.677 × age</p>
            <p><strong>Women:</strong> BMR = 447.593 + 9.247 × weight(kg) + 3.098 × height(cm) − 4.330 × age</p>
            <h3>Katch-McArdle</h3>
            <p><strong>Both:</strong> BMR = 370 + 21.6 × lean body mass(kg)</p>
            <p>This formula is most accurate when body fat percentage is known, as it uses lean body mass rather than total weight.</p>
            <h2 className="text-2xl font-bold mb-3">Factors That Affect BMR</h2>
            <ul>
              <li><strong>Age:</strong> BMR decreases ~1–2% per decade after 20</li>
              <li><strong>Gender:</strong> Males typically have 5–10% higher BMR</li>
              <li><strong>Body composition:</strong> More muscle = higher BMR</li>
              <li><strong>Genetics:</strong> Can account for up to 10% variation</li>
              <li><strong>Hormones:</strong> Thyroid hormones significantly impact BMR</li>
              <li><strong>Temperature:</strong> Cold environments can increase BMR</li>
            </ul>
            <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> BMR calculations provide estimates. Individual metabolic rates can vary. Consult a healthcare professional for personalized nutrition advice.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmr-calculator" />
          <PopularCalculators exclude="/calculator/bmr-calculator" />
        </div>
      </div>
    </>
  );
}
