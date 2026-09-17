"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface HydrationResult {
  totalMl: number;
  baselineMl: number;
  exerciseMl: number;
  climateMl: number;
  weightKg: number;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

type Activity = "sedentary" | "light" | "moderate" | "active" | "very";
type Climate = "normal" | "humid" | "dry";

const ACTIVITY_MULT: Record<Activity, number> = { sedentary: 1.0, light: 1.05, moderate: 1.1, active: 1.2, very: 1.3 };
const ACTIVITY_LABELS: Record<Activity, string> = { sedentary: "Sedentary", light: "Lightly Active", moderate: "Moderately Active", active: "Very Active", very: "Athlete" };
const CLIMATE_EXTRA: Record<Climate, number> = { normal: 0, humid: 0.1, dry: 0.15 };
const CLIMATE_LABELS: Record<Climate, string> = { normal: "Normal", humid: "Hot & Humid", dry: "Hot & Dry" };

function calcHydration(weightLb: number, activity: Activity, exerciseMin: number, climate: Climate): HydrationResult {
  const weightKg = weightLb * 0.453592;
  const baselineMl = weightKg * 33 * ACTIVITY_MULT[activity];
  const exerciseMl = Math.max(0, exerciseMin) * (350 / 30);
  const climateMl = baselineMl * CLIMATE_EXTRA[climate];
  const totalMl = baselineMl + exerciseMl + climateMl;
  const l = (v: number) => (v / 1000).toFixed(2);
  const cups = (v: number) => (v / 236.588).toFixed(1);

  const breakdown = [
    { label: "Baseline (weight × 33 ml/kg)", value: `${Math.round(baselineMl)} ml (${l(baselineMl)} L)` },
    { label: "Exercise Addition", value: `${Math.round(exerciseMl)} ml (${l(exerciseMl)} L)` },
    { label: "Climate Addition", value: `${Math.round(climateMl)} ml (${l(climateMl)} L)` },
    { label: "Daily Water Target", value: `${Math.round(totalMl)} ml (${l(totalMl)} L)` },
    { label: "Cups (8 oz)", value: `${cups(totalMl)} cups` },
    { label: "Body Weight", value: `${weightLb} lb (${weightKg.toFixed(1)} kg)` },
    { label: "Activity Level", value: ACTIVITY_LABELS[activity] },
    { label: "Climate", value: CLIMATE_LABELS[climate] },
  ];
  const summaryStats = [
    { label: "Daily Target", value: `${l(totalMl)} L` },
    { label: "Cups (8 oz)", value: `${cups(totalMl)} cups` },
    { label: "Baseline", value: `${Math.round(baselineMl)} ml` },
    { label: "Exercise Extra", value: `${Math.round(exerciseMl)} ml` },
    { label: "Climate Extra", value: `${Math.round(climateMl)} ml` },
    { label: "Weight", value: `${weightLb} lb` },
    { label: "Activity", value: ACTIVITY_LABELS[activity] },
    { label: "Climate", value: CLIMATE_LABELS[climate] },
  ];
  const chartData = [
    { name: "Baseline", value: Math.round(baselineMl), fill: "hsl(var(--primary))" },
    { name: "Exercise", value: Math.round(exerciseMl), fill: "#10b981" },
    { name: "Climate", value: Math.round(climateMl), fill: "#f59e0b" },
  ];
  return { totalMl, baselineMl, exerciseMl, climateMl, weightKg, breakdown, summaryStats, chartData };
}

const DEFAULTS = { weight: "170", activity: "moderate" as Activity, exercise: "45", climate: "normal" as Climate };

export default function HydrationCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [activity, setActivity] = useState<Activity>("moderate");
  const [exercise, setExercise] = useState(DEFAULTS.exercise);
  const [climate, setClimate] = useState<Climate>("normal");
  const [result, setResult] = useState<HydrationResult | null>(null);

  const w = parseFloat(weight) || 0;
  const ex = parseFloat(exercise) || 0;
  const errs: string[] = [];
  if (w <= 0) errs.push("Weight must be greater than 0.");
  if (w > 800) errs.push("Weight looks unrealistic — enter pounds.");
  if (ex < 0 || ex > 720) errs.push("Exercise must be 0–720 minutes per day.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcHydration(w, activity, ex, climate)); };
  const reset = () => {
    setWeight(DEFAULTS.weight); setActivity("moderate"); setExercise(DEFAULTS.exercise); setClimate("normal");
    setResult(calcHydration(170, "moderate", 45, "normal"));
  };
  useEffect(() => { setResult(calcHydration(170, "moderate", 45, "normal")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const sel = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-foreground cursor-pointer font-medium";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "How much water should I drink daily?", answer: "A common evidence-based target is 30–35 ml of water per kilogram of body weight, adjusted for activity and heat. For a 170 lb (77 kg) person, that's roughly 2.5–2.7 liters, before exercise and climate adjustments." },
    { question: "Does the 8-cups-a-day rule hold?", answer: "The '8×8' rule (eight 8-oz glasses) is a memorable heuristic, not a scientific standard. Needs scale with body size, sweat rate, activity, and environment. Larger, active people in hot climates need substantially more than 2 liters." },
    { question: "How much water should I add for exercise?", answer: "Research suggests about 350–500 ml per 30 minutes of exercise, depending on intensity and sweat rate. This calculator adds roughly 350 ml per 30-minute block. For endurance efforts lasting over an hour, add electrolytes as well." },
    { question: "How does hot weather affect hydration needs?", answer: "Heat increases sweat loss significantly. In hot, humid conditions add about 10% to your baseline; in hot, dry climates add about 15% — dry air pulls more moisture through sweat and respiration. Thirst alone is a lagging indicator; check urine color and frequency." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Daily Hydration Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Daily Hydration Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Body Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">lb</span></div>
              </div>
              <div>
                <label className={lbl}>Activity Level</label>
                <select value={activity} onChange={e => setActivity(e.target.value as Activity)} className={sel}>
                  {Object.entries(ACTIVITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Daily Exercise</label>
                <div className={inp}><input type="number" value={exercise} onChange={e => setExercise(e.target.value)} className={ci} /><span className="pr-3 text-muted-foreground text-sm">min</span></div>
              </div>
              <div>
                <label className={lbl}>Climate</label>
                <select value={climate} onChange={e => setClimate(e.target.value as Climate)} className={sel}>
                  {Object.entries(CLIMATE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Daily Water Target</div>
                <div className="text-4xl font-extrabold tracking-tight">{(result.totalMl / 1000).toFixed(2)} <span className="text-2xl text-muted-foreground">L</span></div>
                <div className="text-sm text-muted-foreground mt-1">≈ {(result.totalMl / 236.588).toFixed(1)} cups (8 oz) · {Math.round(result.totalMl)} ml</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Baseline", `${Math.round(result.baselineMl)} ml`], ["Exercise Extra", `+${Math.round(result.exerciseMl)} ml`], ["Climate Extra", `+${Math.round(result.climateMl)} ml`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Hydration Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 3 ? "bg-amber-500/10" : ""}`}>
                      <td className={`py-2.5 ${i === 3 ? "text-amber-700 font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 3 ? "text-amber-700" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Where the Water Comes From</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}L`} />
                    <Tooltip formatter={(v: number) => [`${v.toLocaleString()} ml`, ""]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">How Much Water Do You Need?</h2>
            <p>Daily water needs scale with body weight — roughly 33 ml per kilogram — then rise with physical activity and heat. This <strong>daily hydration calculator</strong> starts from your weight, applies an activity multiplier, adds fluid for exercise, and accounts for climate, producing a personalized target in liters, milliliters, and cups.</p>
            <h2 className="text-2xl font-bold mb-3">The Formula</h2>
            <p>Baseline = Weight (kg) × 33 ml × Activity multiplier. Exercise addition ≈ 350 ml per 30 minutes. Climate addition = 10% (hot & humid) or 15% (hot & dry) of baseline. The target includes water from beverages and food — food contributes roughly 20% of daily intake.</p>
            <h2 className="text-2xl font-bold mb-3">Signs of Dehydration</h2>
            <p>Thirst is a late signal. Check urine color — pale straw is ideal, dark yellow signals dehydration. Headache, fatigue, dry mouth, and reduced concentration all appear with even 1–2% body-water loss. Sip steadily through the day rather than chugging large volumes at once.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hydration-calculator" />
          <PopularCalculators exclude="/calculator/hydration-calculator" />
        </div>
      </div>
    </>
  );
}
