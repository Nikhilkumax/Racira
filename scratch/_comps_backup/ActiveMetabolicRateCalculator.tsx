"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, Cell } from "recharts";

interface AMRResult { amr: number; bmr: number; tdee: number; activityMultiplier: number; goalDelta: number; proteinNeeds: number; carbNeeds: number; fatNeeds: number; }
const DEFAULTS = { weight: "75", height: "175", age: "30", sex: "male", activityLevel: "moderate", goal: "maintain" };

const ACTIVITY = {
  sedentary: { label: "Sedentary (desk job, no exercise)", mult: 1.2 },
  light: { label: "Lightly Active (1–3 days/week)", mult: 1.375 },
  moderate: { label: "Moderately Active (3–5 days/week)", mult: 1.55 },
  active: { label: "Very Active (6–7 days/week)", mult: 1.725 },
  extreme: { label: "Extremely Active (twice/day)", mult: 1.9 },
};

// Clinical floors: never prescribe below these regardless of the goal deficit.
const MIN_KCAL = { male: 1500, female: 1200 };

function calculate(d: typeof DEFAULTS): AMRResult {
  const w = Math.max(0, parseFloat(d.weight) || 0);
  const h = Math.max(0, parseFloat(d.height) || 0);
  const a = Math.max(0, parseFloat(d.age) || 0);
  const bmr = Math.max(0, d.sex === "male"
    ? 10 * w + 6.25 * h - 5 * a + 5
    : 10 * w + 6.25 * h - 5 * a - 161);
  const mult = ACTIVITY[d.activityLevel as keyof typeof ACTIVITY]?.mult || 1.55;
  const tdee = bmr * mult;
  const goalDelta = d.goal === "lose" ? -500 : d.goal === "gain" ? 300 : 0;
  // A deficit must never push the target under the clinical floor, and an
  // empty form must not produce a negative calorie prescription.
  const floor = d.sex === "male" ? MIN_KCAL.male : MIN_KCAL.female;
  const amr = tdee <= 0 ? 0 : Math.max(floor, tdee + goalDelta);

  const proteinNeeds = w * 1.8;
  const fatNeeds = (amr * 0.25) / 9;
  const carbCals = amr - proteinNeeds * 4 - fatNeeds * 9;
  const carbNeeds = Math.max(0, carbCals / 4);
  return { amr, bmr, tdee, activityMultiplier: mult, goalDelta, proteinNeeds, carbNeeds, fatNeeds };
}

export default function ActiveMetabolicRateCalculator() {
  const [f, setF] = useState(DEFAULTS);
  const [r, setR] = useState<AMRResult>(() => calculate(DEFAULTS));
  const set = (k: keyof typeof DEFAULTS) => (v: string) => setF(p => ({ ...p, [k]: v }));
  const calc = () => setR(calculate(f));
  const reset = () => { setF(DEFAULTS); setR(calculate(DEFAULTS)); };

  useEffect(() => {
    setR(calculate(DEFAULTS));
  }, []);

  const invalid =
    (parseFloat(f.weight) || 0) <= 0 ||
    (parseFloat(f.height) || 0) <= 0 ||
    (parseFloat(f.age) || 0) <= 0;

  const atFloor = r.tdee > 0 && r.amr > r.tdee + r.goalDelta;

  const macroData = [
    { name: "Protein", cals: Math.round(r.proteinNeeds * 4), fill: "hsl(var(--primary))" },
    { name: "Carbs", cals: Math.round(r.carbNeeds * 4), fill: "#10b981" },
    { name: "Fat", cals: Math.round(r.fatNeeds * 9), fill: "#f59e0b" },
  ];
  const macroTotal = macroData.reduce((s, m) => s + m.cals, 0);

  // Largest-remainder allocation so the displayed shares total exactly 100%.
  const macroPct = (() => {
    if (macroTotal <= 0) return macroData.map(() => 0);
    const exact = macroData.map((m) => (m.cals / macroTotal) * 100);
    const floors = exact.map((v) => Math.floor(v));
    let remainder = 100 - floors.reduce((s, v) => s + v, 0);
    const order = exact
      .map((v, i) => ({ i, frac: v - Math.floor(v) }))
      .sort((a, b) => b.frac - a.frac);
    const out = [...floors];
    for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
      out[order[k].i] += 1;
    }
    return out;
  })();

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
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Active Metabolic Rate (AMR) Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-3 !p-4 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col"><label htmlFor="amr-weight" className="text-sm font-medium mb-1">Weight (kg)</label>
                <input id="amr-weight" type="number" min={0} value={f.weight} onChange={e => set("weight")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label htmlFor="amr-height" className="text-sm font-medium mb-1">Height (cm)</label>
                <input id="amr-height" type="number" min={0} value={f.height} onChange={e => set("height")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label htmlFor="amr-age" className="text-sm font-medium mb-1">Age (years)</label>
                <input id="amr-age" type="number" min={0} value={f.age} onChange={e => set("age")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-base outline-none focus:ring-2 focus:ring-primary/20 text-foreground" /></div>
              <div className="flex flex-col"><label htmlFor="amr-sex" className="text-sm font-medium mb-1">Biological Sex</label>
                <select id="amr-sex" value={f.sex} onChange={e => set("sex")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="male">Male</option><option value="female">Female</option>
                </select></div>
            </div>
            <div className="flex flex-col"><label htmlFor="amr-activity" className="text-sm font-medium mb-1">Activity Level</label>
              <select id="amr-activity" value={f.activityLevel} onChange={e => set("activityLevel")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                {Object.entries(ACTIVITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select></div>
            <div className="flex flex-col"><label htmlFor="amr-goal" className="text-sm font-medium mb-1">Goal</label>
              <select id="amr-goal" value={f.goal} onChange={e => set("goal")(e.target.value)} className="h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20">
                <option value="lose">Lose Weight (−500 kcal)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle (+300 kcal)</option>
              </select></div>
            {invalid && (
              <p className="text-sm text-red-600">Weight, height, and age must each be greater than zero.</p>
            )}
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={calc} disabled={invalid} className="h-10 w-full flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all disabled:opacity-50">Calculate</button>
              <button type="button" onClick={reset} aria-label="Reset to defaults" className="h-10 w-10 shrink-0 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
              <div className="flex justify-end absolute top-3 right-3">
                <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Daily Calorie Target (AMR)</div>
              <div className="text-4xl font-bold text-primary my-1">{Math.round(r.amr).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">
                kcal/day · BMR: {Math.round(r.bmr)} kcal · Multiplier: {r.activityMultiplier}×
                {atFloor && <span className="block text-orange-600 font-medium mt-1">Held at the clinical minimum for your biological sex.</span>}
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-3 text-center"><div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Protein</div><div className="font-bold text-lg text-emerald-600">{Math.round(r.proteinNeeds)}g</div></div>
                <div className="p-3 text-center"><div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Carbs</div><div className="font-bold text-lg text-amber-600">{Math.round(r.carbNeeds)}g</div></div>
                <div className="p-3 text-center"><div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Fat</div><div className="font-bold text-lg text-red-600">{Math.round(r.fatNeeds)}g</div></div>
              </div>
            </div>
            <div className="card-calculator !p-4 border border-border bg-card shadow-sm">
              <h3 className="font-semibold text-sm mb-3">Macro Calorie Breakdown</h3>
              <div className="h-[250px]">
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
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {macroData.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: m.fill }} />
                    {m.name} — {macroPct[i]}%
                  </div>
                ))}
              </div>
            </div>
            <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2.5 border-b border-border/50"><h3 className="font-bold text-sm">Full Breakdown</h3></div>
              {[
                { label: "BMR (Mifflin-St Jeor)", val: `${Math.round(r.bmr)} kcal` },
                { label: "Activity Multiplier", val: `${r.activityMultiplier}×` },
                { label: "TDEE (maintenance)", val: `${Math.round(r.tdee)} kcal`, bold: true },
                { label: "Goal Adjustment", val: r.goalDelta === 0 ? "None" : `${r.goalDelta > 0 ? "+" : "−"}${Math.abs(r.goalDelta)} kcal` },
                { label: "Clinical Minimum Applied", val: atFloor ? `Yes — floor ${f.sex === "male" ? MIN_KCAL.male : MIN_KCAL.female} kcal` : "No" },
                { label: "Daily Calorie Target", val: `${Math.round(r.amr)} kcal`, bold: true, highlight: true },
                { label: "Protein Target", val: `${Math.round(r.proteinNeeds)}g (${Math.round(r.proteinNeeds * 4)} kcal)` },
                { label: "Carb Target", val: `${Math.round(r.carbNeeds)}g (${Math.round(r.carbNeeds * 4)} kcal)` },
                { label: "Fat Target", val: `${Math.round(r.fatNeeds)}g (${Math.round(r.fatNeeds * 9)} kcal)` },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-2 px-4 py-2.5 border-b border-border/30 last:border-0 ${row.highlight ? "bg-primary/10 border-t-2 border-t-border" : "hover:bg-secondary/20"}`}>
                  <span className="text-muted-foreground text-base">{row.label}</span>
                  <span className={`text-right text-base ${row.bold ? "font-bold text-foreground" : ""}`}>{row.val}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted/30 rounded-lg p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Summary Statistics</p>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Basal Metabolic Rate</dt>
                <dd className="text-right font-medium">{Math.round(r.bmr)} kcal</dd>
                <dt className="text-muted-foreground">Activity Multiplier</dt>
                <dd className="text-right font-medium">{r.activityMultiplier}×</dd>
                <dt className="text-muted-foreground">TDEE (maintenance)</dt>
                <dd className="text-right font-medium">{Math.round(r.tdee)} kcal</dd>
                <dt className="text-muted-foreground">Goal Adjustment</dt>
                <dd className="text-right font-medium">{r.goalDelta === 0 ? "None" : `${r.goalDelta > 0 ? "+" : "−"}${Math.abs(r.goalDelta)} kcal`}</dd>
                <dt className="text-muted-foreground">Daily Calorie Target</dt>
                <dd className="text-right font-medium">{Math.round(r.amr)} kcal</dd>
                <dt className="text-muted-foreground">Protein Target</dt>
                <dd className="text-right font-medium">{Math.round(r.proteinNeeds)}g</dd>
                <dt className="text-muted-foreground">Carb Target</dt>
                <dd className="text-right font-medium">{Math.round(r.carbNeeds)}g</dd>
                <dt className="text-muted-foreground">Fat Target</dt>
                <dd className="text-right font-medium">{Math.round(r.fatNeeds)}g</dd>
                <dt className="text-muted-foreground">Weekly Weight Change</dt>
                <dd className="text-right font-medium">{r.tdee <= 0 ? "—" : `${(((r.amr - r.tdee) * 7) / 7700).toFixed(2)} kg`}</dd>
                <dt className="text-muted-foreground">Clinical Minimum Applied</dt>
                <dd className="text-right font-medium">{atFloor ? "Yes" : "No"}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Active Metabolic Rate (AMR)</h2>
            <p>The human body is an incredibly complex thermodynamic engine that requires a constant influx of chemical energy to sustain life, repair cellular damage, and perform physical work. This total daily energy expenditure is precisely what we call the Active Metabolic Rate (AMR), though it is frequently referred to in fitness circles as Total Daily Energy Expenditure (TDEE). While your Basal Metabolic Rate (BMR) represents the absolute minimum number of calories your body would burn if you were in a coma and completely motionless for an entire 24-hour period, your AMR takes that baseline figure and scales it up to account for the physical realities of your daily life. Every single time you stand up from a chair, walk to the kitchen, lift weights in the gym, or even digest a meal, you are burning extra calories on top of your baseline BMR. Your AMR is the true, master number in nutrition science. If you consume exactly your AMR in calories every day, your body weight will remain perfectly stable. If you consistently eat below your AMR, you will force your body to metabolize stored fat for energy, resulting in weight loss. If you eat above your AMR, the surplus energy will be stored as either fat or new muscle tissue.</p>
            
            <p>Our Active Metabolic Rate Calculator uses the industry gold-standard Mifflin-St Jeor equation to establish your baseline BMR with exceptional accuracy. It then multiplies that baseline by a scientifically validated activity factor that corresponds to your specific lifestyle. Furthermore, this calculator goes beyond simple calorie counting by instantly breaking down your target calories into a precise macronutrient profile—calculating exactly how many grams of protein, carbohydrates, and dietary fats you need to consume to hit your fitness goals safely and sustainably.</p>
            
            <h2 className="text-2xl font-bold mb-3">The Science of the Mifflin-St Jeor Equation</h2>
            <p>For decades, the standard formula used by dietitians and physicians to calculate BMR was the Harris-Benedict equation, developed in 1919. However, as the average composition of the human body changed over the 20th century, that formula began to significantly overestimate calorie needs, leading to stalled weight loss for many patients. In 1990, researchers Dr. Mark Mifflin and Dr. Sachiko St. Jeor published a massive new study that developed a far more accurate predictive model. Their resulting equation has since been endorsed by the American Dietetic Association as the single most reliable formula for predicting resting metabolic rate in both normal weight and obese individuals without requiring expensive clinical testing.</p>
            
            <p>The Mifflin-St Jeor equation takes three primary variables into account: total body mass (weight), physical stature (height), and biological age. Weight and height are critical because larger bodies physically require more energy to maintain their existing cellular structure. Age is factored in as a negative variable because human metabolism naturally slows down as we grow older, primarily due to the gradual loss of metabolically active muscle tissue (sarcopenia). Finally, a fixed constant is added or subtracted based on biological sex (+5 for males, -161 for females) to account for the fact that males generally possess a higher ratio of lean muscle mass to body fat than females of the exact same height and weight.</p>
            
            <h2 className="text-2xl font-bold mb-3">Selecting the Correct Activity Multiplier</h2>
            <p>The most common error people make when calculating their AMR is drastically overestimating their daily activity level. The activity multiplier is a scalar value that increases your BMR based on physical exertion. A multiplier of 1.2 represents a "Sedentary" lifestyle, which applies to the vast majority of modern office workers who sit at a desk all day, drive home, and watch television, even if they occasionally go for a short walk. To qualify as "Moderately Active" (a 1.55 multiplier), you must be engaging in sustained, moderate-intensity exercise—like jogging, swimming, or heavy weightlifting—for at least 45 minutes to an hour, three to five days every single week. To reach the "Extremely Active" multiplier of 1.9, you essentially must be a professional athlete training twice a day, or working a highly demanding manual labor job like construction or farming. It is always better to slightly underestimate your activity level when calculating calories for weight loss to ensure you remain in a true deficit.</p>
            
            <h2 className="text-2xl font-bold mb-3">Macronutrient Distribution and Protein Importance</h2>
            <p>While hitting your total calorie target will dictate whether your scale moves up or down, the distribution of those calories across the three macronutrients—protein, carbohydrates, and fats—dictates what kind of weight you lose or gain. Our calculator automatically prioritizes protein, setting the target at roughly 1.8 grams per kilogram of body weight. This is significantly higher than the standard government dietary minimums because active individuals require more protein to repair muscle tissue damaged during exercise. More importantly, when you are eating in a caloric deficit to lose weight, a high protein intake signals the body to preserve its existing muscle mass and preferentially burn body fat instead. Protein is also highly satiating, meaning it keeps you feeling full longer, and it possesses a high Thermic Effect of Food (TEF), meaning your body burns up to 30% of the calories in protein simply digesting it.</p>
            
            <p>Once the essential protein and fat targets are calculated (with fats set to a minimum of 25% of total calories to support critical hormone production, including testosterone and estrogen), all remaining calories are allocated to carbohydrates. Carbs are not the enemy; they are the preferred, high-octane fuel source for your brain and your central nervous system, and they are absolutely vital for fueling high-intensity workouts and replenishing depleted muscle glycogen stores.</p>
            
            <h2 className="text-2xl font-bold mb-3">Managing Your Goals Safely</h2>
            <p>If you select "Lose Weight," the calculator automatically subtracts exactly 500 calories from your daily AMR. Because one pound of human body fat stores approximately 3,500 calories of energy, maintaining a 500-calorie daily deficit will reliably result in exactly one pound of pure fat loss per week (500 × 7 = 3,500). This is widely considered the maximum sustainable rate of weight loss that does not risk severe muscle degradation or metabolic adaptation (often referred to as "starvation mode"). Conversely, if you select "Gain Muscle," the calculator adds a mild 300-calorie surplus. This is known as a "lean bulk," providing just enough excess energy to fuel the synthesis of new muscle tissue without causing excessive, unwanted fat accumulation.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/active-metabolic-rate-calculator" />
          <PopularCalculators exclude="/calculator/active-metabolic-rate-calculator" />
        </div>
      </div>
    </>
  );
}
