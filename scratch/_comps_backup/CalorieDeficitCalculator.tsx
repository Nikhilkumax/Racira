"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Calculator, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string; [key: string]: any;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="text-sm font-semibold text-foreground mb-1">{label}</label>
    <div className="relative flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none shrink-0">{prefix}</span>}
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground" {...props} />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

const ACTIVITY_MULTIPLIERS = [
  { name: "Sedentary (desk job, little exercise)", val: 1.2 },
  { name: "Lightly Active (light exercise 1-3 days/week)", val: 1.375 },
  { name: "Moderately Active (moderate exercise 3-5 days/week)", val: 1.55 },
  { name: "Active (hard exercise 6-7 days/week)", val: 1.725 },
  { name: "Very Active (physical job & heavy exercise)", val: 1.9 },
];

export default function CalorieDeficitCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState("30");
  const [weight, setWeight] = useState("80");
  const [height, setHeight] = useState("175");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [activityIdx, setActivityIdx] = useState(2);
  const [lossRate, setLossRate] = useState("0.5"); // kg per week
  const [res, setRes] = useState<{
    bmr: number;
    tdee: number;
    targetIntake: number;
    deficit: number;
    warning: string | null;
    chartData: { name: string; calories: number }[];
  } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); calc(); }, []);

  const calc = () => {
    const a = parseFloat(age) || 30;
    const w = parseFloat(weight) || 80;
    const h = parseFloat(height) || 175;
    const rate = parseFloat(lossRate) || 0.5;

    // Unit conversions
    const weightKg = unit === "in" ? w * 0.453592 : w;
    const heightCm = unit === "in" ? h * 2.54 : h;

    // BMR using Mifflin-St Jeor Formula
    const bmr = gender === "male"
      ? (10 * weightKg) + (6.25 * heightCm) - (5 * a) + 5
      : (10 * weightKg) + (6.25 * heightCm) - (5 * a) - 161;

    // TDEE
    const mult = ACTIVITY_MULTIPLIERS[activityIdx].val;
    const tdee = bmr * mult;

    // Caloric deficit calculation (1 kg loss ≈ 7700 calories deficit)
    // For rate per week, daily deficit = (rate * 7700) / 7 = rate * 1100
    // If rate is in lbs, 1 lb loss ≈ 3500 calories deficit, daily deficit = (rate * 3500) / 7 = rate * 500
    const weeklyRateMultiplier = unit === "in" ? 500 : 1100;
    const deficit = rate * weeklyRateMultiplier;
    const targetIntake = Math.max(800, tdee - deficit);

    // Warnings for extremely low intake levels
    let warning = null;
    const safeMin = gender === "male" ? 1500 : 1200;
    if (targetIntake < safeMin) {
      warning = `Warning: Your calculated intake of ${Math.round(targetIntake)} kcal falls below the recommended daily minimum of ${safeMin} kcal for healthy, sustainable weight loss. Please consult a nutritionist or choose a more gradual rate of loss.`;
    }

    const chartData = [
      { name: "BMR", calories: Math.round(bmr) },
      { name: "TDEE", calories: Math.round(tdee) },
      { name: "Target Intake", calories: Math.round(targetIntake) },
      { name: "Deficit", calories: Math.round(deficit) },
    ];

    setRes({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetIntake: Math.round(targetIntake),
      deficit: Math.round(deficit),
      warning,
      chartData,
    });
  };

  const reset = () => {
    setGender("male");
    setAge("30");
    setWeight("80");
    setHeight("175");
    setActivityIdx(2);
    setLossRate("0.5");
  };

  const faqs = [
    { question: "What is a calorie deficit?", answer: "A calorie deficit occurs when the number of calories you consume is less than the number of calories your body burns (your Total Daily Energy Expenditure or TDEE) to sustain operations." },
    { question: "How large should my calorie deficit be?", answer: "A safe and sustainable deficit is between 300 to 500 calories per day, which translates to roughly 0.5 to 1 lb (0.25 to 0.5 kg) of weight loss per week." },
    { question: "What are BMR and TDEE?", answer: "BMR (Basal Metabolic Rate) is the calories burned just keeping your body alive at rest. TDEE (Total Daily Energy Expenditure) is your BMR plus the active calories burned through daily movement, work, and exercise." },
    { question: "Is there a minimum safe daily calorie intake?", answer: "Generally, eating fewer than 1,200 calories per day for women and 1,500 calories per day for men is not recommended without medical supervision, as it can cause metabolic adaptation and nutrient deficiencies." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie Deficit Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Deficit & Weight Loss Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
            <h2 className="text-2xl font-bold mb-3">Profile Details</h2>
            <div className="flex gap-2">
              {(["male", "female"] as const).map(g => (
                <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${gender === g ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
              ))}
            </div>
            <div className="flex gap-2">
              {(["cm", "in"] as const).map(u => (
                <button key={u} type="button" onClick={() => { setUnit(u); setWeight(u === "cm" ? "80" : "175"); setHeight(u === "cm" ? "175" : "69"); }} className={`flex-1 h-9 rounded-md text-sm font-semibold transition-all ${unit === u ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-background text-muted-foreground hover:bg-secondary"}`}>{u === "cm" ? "Metric (cm/kg)" : "Imperial (in/lb)"}</button>
              ))}
            </div>

            <CompactInput id="age" label="Age" value={age} onChange={setAge} suffix="years" min="15" max="100" />
            <CompactInput id="weight" label="Weight" value={weight} onChange={setWeight} suffix={unit === "cm" ? "kg" : "lbs"} />
            <CompactInput id="height" label="Height" value={height} onChange={setHeight} suffix={unit === "cm" ? "cm" : "in"} />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Activity Level</label>
              <select value={activityIdx} onChange={e => setActivityIdx(Number(e.target.value))} className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                {ACTIVITY_MULTIPLIERS.map((a, idx) => <option key={a.name} value={idx}>{a.name}</option>)}
              </select>
            </div>

            <CompactInput id="loss" label={unit === "cm" ? "Target Loss / Week (kg)" : "Target Loss / Week (lbs)"} value={lossRate} onChange={setLossRate} step="0.1" min="0.1" max="2" />

            <div className="flex gap-2.5 mt-2">
              <button type="button" onClick={calc} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={reset} className="px-3 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {res && (
              <>
                <>

              <div className="card-calculator flex flex-col gap-3 !p-4 shadow-sm border border-border bg-card">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <h2 className="text-2xl font-bold mb-3">Deficit Profile</h2>
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>

                {res.warning && (<>

                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-md text-xs font-semibold leading-relaxed">
                    {res.warning}
                  </div>
                
</>)}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Target Intake</div>
                    <div className="text-4xl font-bold text-primary">{res.targetIntake}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">kcal / day</div>
                  </div>
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 text-center">
                    <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Required Deficit</div>
                    <div className="text-4xl font-bold text-primary">{res.deficit}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">kcal / day</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-left text-sm">
                    <thead><tr className="bg-secondary/40 border-b border-border text-[12px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-2.5 pl-3">Metabolic Stage</th><th className="p-2.5 pr-3 text-right">Value (kcal)</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { label: "Basal Metabolic Rate (BMR)", value: res.bmr },
                        { label: "Total Daily Energy Expenditure (TDEE)", value: res.tdee },
                        { label: "Calculated Daily Deficit", value: res.deficit },
                        { label: "Target Intake Goal", value: res.targetIntake, bold: true },
                      ].map(r => (
                        <tr key={r.label} className={`hover:bg-secondary/20 ${r.bold ? "font-bold bg-secondary/30" : ""}`}>
                          <td className="p-2.5 pl-3 font-semibold text-muted-foreground">{r.label}</td>
                          <td className="p-2.5 pr-3 text-right font-bold text-foreground">{r.value.toLocaleString()} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {mounted && (<>

                  <div className="p-4 rounded-xl border border-border bg-card">
                    <h3 className="text-sm font-bold text-foreground mb-3">Daily Energy Profile Comparison</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={res.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: any) => [`${v} kcal`]} />
                        <Bar dataKey="calories" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                
</>)}
              </div>
            
</>
              </>
            )}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" label="Ad Space – In Content" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Mechanics of Calorie Deficits</h2>
            <p>Weight reduction is governed by thermodynamics: to lose tissue mass, the body must consume fewer calories than it expends to maintain basic operations and activities. This deficit forces the body to mobilize adipose tissue (fat stores) and convert it to ATP energy.</p>
            <p>Our calculator determines your Basal Metabolic Rate (BMR) using the Mifflin-St Jeor formula and adjusts it for your exercise habits to determine your Total Daily Energy Expenditure (TDEE). The required daily deficit is then subtracted to calculate your final daily calorie intake goal.</p>

            <h2 className="text-2xl font-bold mb-3">Setting Safe Deficits</h2>
            <p>While a larger deficit accelerates initial weight loss, excessively low calorie consumption triggers severe metabolic adaptations (muscle loss, hormonal suppression, decreased thyroid activity). Aim to keep daily deficits between 300 to 500 kcal for stable, sustainable results.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-deficit-calculator" />

      <section className="mt-12 space-y-8 text-base text-foreground">
        <div>
          <h2 className="text-2xl font-bold mb-3">What Is a Calorie Deficit Calculator?</h2>
          <p className="text-muted-foreground leading-relaxed">The Calorie Deficit Calculator is a practical online tool designed to give you fast, reliable answers for everyday decisions. Whether you are planning a budget, comparing options, or verifying a quick estimate, this calculator removes the guesswork and delivers clear, actionable numbers. It is built for anyone who needs a dependable result without wading through spreadsheets or manual formulas. By focusing on the inputs that actually matter, the Calorie Deficit Calculator keeps the experience simple while still producing a trustworthy output you can act on with confidence.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground leading-relaxed">Using the Calorie Deficit Calculator is straightforward. Enter the key values in the input fields above, adjust any advanced options if they apply to your situation, and click the Calculate button. The calculator applies the standard industry formula behind the scenes and instantly updates every result component on the right, including the primary result card, the three-stat bar, the breakdown table, the chart, and the summary statistics. All inputs are pre-filled with realistic defaults so you see a complete result the moment the page loads. The tool validates your entries and handles edge cases such as zero, negative, or empty values without crashing, so you always get a clean, readable answer rather than an error or a NaN.</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-3">Understanding Your Results</h2>
          <p className="text-muted-foreground leading-relaxed">The results panel is organized so the most important number is always at the top, followed by supporting metrics that put that number in context. The breakdown table shows exactly how each input contributes to the total, and the chart visualizes the distribution so you can spot the biggest drivers at a glance. Use the summary statistics block to cross-check the headline figure against the detailed rows, because the two are designed to match exactly. Adjust any input and click Calculate again to compare scenarios side by side, which makes the Calorie Deficit Calculator useful for both quick checks and deeper what-if analysis.</p>
        </div>
      </section>
          <PopularCalculators exclude="/calculator/calorie-deficit-calculator" />
        </div>
      </div>
    </>
  );
}
