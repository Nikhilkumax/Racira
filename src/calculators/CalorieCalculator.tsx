"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CalorieCalculator = () => {
  const DEFAULTS = { weight: "75", height: "175", age: "30", gender: "male", activity: "1.55" };
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [age, setAge] = useState(DEFAULTS.age);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [activity, setActivity] = useState(DEFAULTS.activity);
  const [goal, setGoal] = useState("maintain");
  const [result, setResult] = useState<any>(null);

  const calculate = (wV = weight, hV = height, aV = age, gV = gender, actV = activity) => {
    const w = parseFloat(wV), h = parseFloat(hV), a = parseFloat(aV), act = parseFloat(actV);
    if (isNaN(w) || isNaN(h) || isNaN(a) || w <= 0 || h <= 0) return;
    const bmr = gV === "male"
      ? 10 * w + 6.25 * h - 5 * a + 5
      : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    const chartData = [
      { name: "Protein (30%)", value: parseFloat(((tdee * 0.30) / 4).toFixed(0)), cal: parseFloat((tdee * 0.30).toFixed(0)) },
      { name: "Carbs (40%)", value: parseFloat(((tdee * 0.40) / 4).toFixed(0)), cal: parseFloat((tdee * 0.40).toFixed(0)) },
      { name: "Fat (30%)", value: parseFloat(((tdee * 0.30) / 9).toFixed(0)), cal: parseFloat((tdee * 0.30).toFixed(0)) },
    ];
    setResult({
      primary: `${Math.round(tdee)} kcal`,
      subtitle: `Daily calorie target to maintain weight (TDEE)`,
      rows: [
        { label: "Weight", value: `${w} kg` },
        { label: "Height", value: `${h} cm` },
        { label: "Age", value: `${a} years` },
        { label: "BMR (Mifflin-St Jeor)", value: `${Math.round(bmr)} kcal/day` },
        { label: "Activity Multiplier", value: act },
        { label: "TDEE (maintain)", value: `${Math.round(tdee)} kcal/day` },
        { label: "Lose 0.5 kg/week (−500)", value: `${Math.round(tdee - 500)} kcal/day` },
        { label: "Lose 1 kg/week (−1000)", value: `${Math.round(tdee - 1000)} kcal/day` },
        { label: "Gain 0.5 kg/week (+500)", value: `${Math.round(tdee + 500)} kcal/day` },
      ],
      chartData,
      summary: [
        { label: "BMR", value: `${Math.round(bmr)} kcal` },
        { label: "TDEE (maintenance)", value: `${Math.round(tdee)} kcal` },
        { label: "Weight loss target", value: `${Math.round(tdee - 500)} kcal` },
        { label: "Weight gain target", value: `${Math.round(tdee + 500)} kcal`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setAge(DEFAULTS.age); setGender(DEFAULTS.gender); setActivity(DEFAULTS.activity); calculate(DEFAULTS.weight, DEFAULTS.height, DEFAULTS.age, DEFAULTS.gender, DEFAULTS.activity); };

  const activityLevels = [
    ["1.2", "Sedentary (desk job, no exercise)"],
    ["1.375", "Light (1–3 days/week)"],
    ["1.55", "Moderate (3–5 days/week)"],
    ["1.725", "Active (6–7 days/week)"],
    ["1.9", "Very Active (athlete, 2×/day)"],
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b"];

  const faqs = [
    { question: "What is BMR?", answer: "Basal Metabolic Rate (BMR) is the calories your body burns at complete rest — just to maintain basic functions like breathing, circulation, and cell repair. It represents about 60–75% of total daily calorie expenditure." },
    { question: "What is TDEE?", answer: "Total Daily Energy Expenditure (TDEE) = BMR × Activity Factor. It estimates the total calories you burn per day including all physical activity. Eating at TDEE maintains weight; below = weight loss; above = weight gain." },
    { question: "Which BMR formula is most accurate?", answer: "The Mifflin-St Jeor equation (used here) is considered the most accurate for most people, with typical error under 10%. The Harris-Benedict equation is older and slightly less accurate. For athletes with high muscle mass, these formulas may underestimate BMR." },
    { question: "How many calories do I need to lose 1 kg per week?", answer: "1 kg of fat ≈ 7,700 calories. To lose 1 kg/week, you need a deficit of 7,700/7 ≈ 1,100 calories/day from TDEE. This is aggressive — most experts recommend a 500–750 calorie deficit for sustainable loss of 0.5 kg/week." },
    { question: "How accurate are calorie counts on food labels?", answer: "FDA allows ±20% error on food labels. Calorie counting is inherently imprecise — individual metabolic variation, cooking methods, and food composition differences mean any calorie estimate is approximate. Use it as a directional guide, not an exact science." },
    { question: "What is the best macronutrient ratio for fat loss?", answer: "High protein diets are consistently most effective for fat loss: protein preserves muscle mass, increases satiety, and has a high thermic effect (20–30% of protein calories are burned digesting it). A common ratio is 40% protein, 30% carbs, 30% fat, though individual needs vary." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium block mb-1.5">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="75" step="0.1" min="0" />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="175" step="1" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium block mb-1.5">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="30" min="10" max="100" />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Activity Level</label>
              <select value={activity} onChange={e => { setActivity(e.target.value); calculate(weight, height, age, gender, e.target.value); }}
                className="h-10 w-full px-3 text-base rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                {activityLevels.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Daily Calories (TDEE)</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Calorie Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">Macronutrient Split (grams)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={result.chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }: any) => `${name}: ${value}g`}>
                        {result.chartData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: any, n: any, p: any) => [`${v}g (${p.payload.cal} kcal)`, ""]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Calorie Calculator?</h2>
            <p>A calorie calculator estimates your Total Daily Energy Expenditure (TDEE) — the total calories you burn each day — using your weight, height, age, gender, and activity level. Based on the Mifflin-St Jeor equation for Basal Metabolic Rate (BMR) multiplied by an activity factor, it provides calorie targets for maintaining weight, losing weight (−500 kcal/day = ~0.5 kg/week loss), and gaining weight. The macronutrient pie chart shows a balanced 30/40/30 protein/carbs/fat split in grams.</p>
            <p>Pre-filled with a 30-year-old male, 75 kg, 175 cm, moderately active (activity factor 1.55), this calculator shows approximately 2,545 kcal/day maintenance — a realistic baseline for a typical active adult male. Women of the same profile would see approximately 200–300 fewer calories due to the Mifflin formula&apos;s gender correction.</p>
            <h2>BMR: The Mifflin-St Jeor Equation</h2>
            <p><strong>Men:</strong> BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) + 5</p>
            <p><strong>Women:</strong> BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161</p>
            <p>For our default (male, 75 kg, 175 cm, 30 years): BMR = 750 + 1093.75 − 150 + 5 = 1698.75 kcal/day. TDEE = 1698.75 × 1.55 (moderate activity) ≈ 2633 kcal/day.</p>
            <h2>Activity Multipliers Explained</h2>
            <p>1.2 = Sedentary: desk job, no exercise. 1.375 = Lightly active: light exercise 1–3 days/week. 1.55 = Moderately active: moderate exercise 3–5 days/week. 1.725 = Very active: hard exercise 6–7 days/week. 1.9 = Extra active: very hard exercise, physical job, or twice-daily training. Most office workers with gym sessions 3× per week should use 1.375–1.55. People tend to overestimate their activity level — when in doubt, use a lower multiplier and adjust based on results.</p>
            <h2>Calorie Targets for Weight Goals</h2>
            <p>1 pound of fat ≈ 3,500 calories. 1 kg of fat ≈ 7,700 calories. For sustainable weight loss, a 500 calorie/day deficit loses approximately 0.5 kg (1 lb) per week. A 1,000 calorie/day deficit loses about 1 kg (2 lbs) per week — this is typically the maximum recommended for non-medically supervised weight loss. Very low calorie diets (below 1,200 kcal for women, 1,500 for men) risk muscle loss, nutrient deficiencies, and metabolic adaptation.</p>
            <h2>Macronutrient Targets</h2>
            <p>The pie chart shows a general 30% protein / 40% carbohydrate / 30% fat distribution. Protein = 4 kcal/gram, Carbs = 4 kcal/gram, Fat = 9 kcal/gram. For muscle building or fat loss, higher protein (35–40%) is beneficial. Protein requirements: 1.6–2.2g/kg bodyweight for those who strength train. For a 75 kg person: 120–165g protein/day. Use these targets alongside a food tracking app for precise macro monitoring.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Be honest about your activity level — it is the biggest variable. Track your actual weight weekly and adjust calories by 100–200 kcal if results differ from predictions after 2–3 weeks. Combine with the <a href="/calculator/bmi-calculator">BMI calculator</a> to understand your current weight category, and use the <a href="/calculator/protein-calculator">protein calculator</a> for precise protein targets based on your training goals.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-calculator" />
          <PopularCalculators exclude="/calculator/calorie-calculator" />
        </div>
      </div>
    </>
  );
};
export default CalorieCalculator;
