"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface AMRResult { amr: number; bmr: number; activityMultiplier: number; proteinNeeds: number; carbNeeds: number; fatNeeds: number; }
const DEFAULTS = { weight: "75", height: "175", age: "30", sex: "male", activityLevel: "moderate", goal: "maintain" };

const ACTIVITY = {
  sedentary: { label: "Sedentary (desk job, no exercise)", mult: 1.2 },
  light: { label: "Lightly Active (1–3 days/week)", mult: 1.375 },
  moderate: { label: "Moderately Active (3–5 days/week)", mult: 1.55 },
  active: { label: "Very Active (6–7 days/week)", mult: 1.725 },
  extreme: { label: "Extremely Active (twice/day)", mult: 1.9 },
};

function calculate(d: typeof DEFAULTS): AMRResult {
  const w = parseFloat(d.weight) || 0, h = parseFloat(d.height) || 0, a = parseFloat(d.age) || 0;
  const bmr = d.sex === "male"
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161;
  const mult = ACTIVITY[d.activityLevel as keyof typeof ACTIVITY]?.mult || 1.55;
  let amr = bmr * mult;
  if (d.goal === "lose") amr -= 500;
  if (d.goal === "gain") amr += 300;
  const proteinNeeds = w * 1.8;
  const fatNeeds = (amr * 0.25) / 9;
  const carbCals = amr - proteinNeeds * 4 - fatNeeds * 9;
  const carbNeeds = carbCals / 4;
  return { amr, bmr, activityMultiplier: mult, proteinNeeds, carbNeeds, fatNeeds };
}

export default function ActiveMetabolicRateCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<AMRResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  const macroData = [
    { name: "Protein", cals: Math.round(r.proteinNeeds * 4), fill: "hsl(var(--primary))" },
    { name: "Carbs", cals: Math.round(r.carbNeeds * 4), fill: "#10b981" },
    { name: "Fat", cals: Math.round(r.fatNeeds * 9), fill: "#f59e0b" },
  ];

  const faqs = [
    { question: "What is Active Metabolic Rate (AMR)?", answer: "AMR is your total daily calorie expenditure including your Basal Metabolic Rate (BMR) plus calories burned through physical activity. It is also called Total Daily Energy Expenditure (TDEE). AMR tells you exactly how many calories you need per day to maintain your current weight given your activity level." },
    { question: "How is AMR calculated?", answer: "AMR = BMR × Activity Multiplier. BMR is calculated using the Mifflin-St Jeor equation: Men: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5. Women: same formula minus 161. The activity multiplier ranges from 1.2 (sedentary) to 1.9 (extremely active)." },
    { question: "What is the Mifflin-St Jeor equation?", answer: "Published in 1990, Mifflin-St Jeor is considered the most accurate BMR prediction equation for most people, outperforming the older Harris-Benedict (1919) equation. Studies show it predicts measured BMR within 10% for ~82% of people." },
    { question: "How many calories should I eat to lose weight?", answer: "A 500 calorie daily deficit produces approximately 0.5 kg (1 lb) of fat loss per week. 3,500 calories ≈ 1 pound of body fat. Our calculator applies this deficit automatically when you select the 'Lose Weight' goal. Never go below 1,200 calories (women) or 1,500 calories (men) without medical supervision." },
    { question: "How do I know my activity level?", answer: "Sedentary: desk job, no exercise. Lightly active: 1–3 days/week of light exercise (walking, yoga). Moderately active: 3–5 days/week of moderate exercise (gym, cycling). Very active: 6–7 days/week of vigorous exercise. Extremely active: physical job plus exercise, or twice-daily training." },
    { question: "Why are protein needs high?", answer: "The recommended protein for active individuals is 1.6–2.2g per kg of body weight to support muscle protein synthesis, recovery, and preservation during calorie restriction. Higher protein also increases satiety and has a higher thermic effect of food (20–30% of protein calories are burned in digestion)." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Active Metabolic Rate Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Active Metabolic Rate (AMR) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Weight (kg)</label>
                <input type="number" value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Height (cm)</label>
                <input type="number" value={f.height} onChange={e => set("height")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Age (years)</label>
                <input type="number" value={f.age} onChange={e => set("age")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Biological Sex</label>
                <select value={f.sex} onChange={e => set("sex")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="male">Male</option><option value="female">Female</option>
                </select></div>
            </div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Activity Level</label>
              <select value={f.activityLevel} onChange={e => set("activityLevel")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(ACTIVITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="flex flex-col"><label className="text-sm font-semibold mb-1">Goal</label>
              <select value={f.goal} onChange={e => set("goal")(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                <option value="lose">Lose Weight (−500 kcal)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle (+300 kcal)</option>
              </select></div>
            <div className="flex gap-2 mt-1">
              <button onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-9 transition-all">Calculate</button>
              <button onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-9 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-5 text-center">
              <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Daily Calorie Target (AMR)</div>
              <div className="text-5xl font-extrabold text-foreground">{Math.round(r.amr).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground mt-1">kcal/day · BMR: {Math.round(r.bmr)} kcal · Multiplier: {r.activityMultiplier}×</div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Protein</div><div className="font-bold text-lg">{Math.round(r.proteinNeeds)}g</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Carbs</div><div className="font-bold text-lg">{Math.round(r.carbNeeds)}g</div></div>
                <div className="p-3 text-center"><div className="text-xs text-muted-foreground mb-1">Fat</div><div className="font-bold text-lg">{Math.round(r.fatNeeds)}g</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Macro Calorie Breakdown</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={macroData} barSize={50}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit=" cal" />
                    <RTooltip formatter={(v: number) => [`${v} kcal`, ""]} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="cals" radius={[4, 4, 0, 0]}>
                      {macroData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Full Breakdown</h3></div>
              {[
                { label: "BMR (Mifflin-St Jeor)", val: `${Math.round(r.bmr)} kcal` },
                { label: "Activity Multiplier", val: `${r.activityMultiplier}×` },
                { label: "TDEE (maintenance)", val: `${Math.round(r.bmr * r.activityMultiplier)} kcal`, bold: true },
                { label: "Goal Adjustment", val: f.goal === "lose" ? "−500 kcal" : f.goal === "gain" ? "+300 kcal" : "None" },
                { label: "Daily Calorie Target", val: `${Math.round(r.amr)} kcal`, bold: true, highlight: true },
                { label: "Protein Target", val: `${Math.round(r.proteinNeeds)}g (${Math.round(r.proteinNeeds * 4)} kcal)` },
                { label: "Carb Target", val: `${Math.round(r.carbNeeds)}g (${Math.round(r.carbNeeds * 4)} kcal)` },
                { label: "Fat Target", val: `${Math.round(r.fatNeeds)}g (${Math.round(r.fatNeeds * 9)} kcal)` },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/5" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-sm">{row.label}</span>
                  <span className={`text-right text-sm ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is Active Metabolic Rate (AMR)?</h2>
            <p>Active Metabolic Rate (AMR), also called Total Daily Energy Expenditure (TDEE), is the total number of calories your body burns in a 24-hour period, combining your resting metabolism with all physical activity. It is the master number in nutrition science — eat below it to lose weight, match it to maintain, and exceed it to gain mass. This calculator uses the gold-standard Mifflin-St Jeor equation for BMR and multiplies by validated activity factors.</p>
            <h2>AMR Formula</h2>
            <p><strong>AMR = BMR × Activity Multiplier</strong></p>
            <p><strong>BMR (Men)</strong> = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5</p>
            <p><strong>BMR (Women)</strong> = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161</p>
            <p>Activity multipliers: Sedentary 1.2, Lightly Active 1.375, Moderately Active 1.55, Very Active 1.725, Extremely Active 1.9.</p>
            <h2>Macro Targets Explained</h2>
            <p>Our calculator distributes your AMR across three macronutrients using evidence-based sports nutrition guidelines. Protein is set at 1.8g/kg (optimal for muscle maintenance and synthesis in active individuals). Fat is set at 25% of total calories (sufficient for hormone production and fat-soluble vitamin absorption). Remaining calories go to carbohydrates — the primary fuel for exercise performance.</p>
            <h2>Calorie Goals by Objective</h2>
            <p>Fat loss: AMR − 500 kcal/day = ~0.5 kg/week loss. Aggressive loss: AMR − 750 kcal/day = ~0.75 kg/week (requires monitoring for muscle loss). Maintenance: AMR exactly. Lean bulking: AMR + 200–300 kcal/day (minimizes fat gain while supporting muscle growth). Traditional bulk: AMR + 500 kcal/day (faster muscle gain, more fat accumulation).</p>
            <h2>Accuracy and Individual Variation</h2>
            <p>The Mifflin-St Jeor equation predicts measured BMR within 10% for ~82% of people. Outliers include individuals with thyroid disorders, very high or low muscle mass, or extreme body composition. Track your actual weight change over 2–3 weeks and adjust calorie targets by ±100–200 kcal if results don&apos;t match expectations. Real-world calorie tracking apps (MyFitnessPal, Cronometer) combined with AMR calculation provide the most accurate nutrition management framework.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/active-metabolic-rate-calculator" />
          <PopularCalculators exclude="/calculator/active-metabolic-rate-calculator" />
        </div>
      </div>
    </>
  );
}
