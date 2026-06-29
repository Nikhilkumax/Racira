"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from "recharts";

interface ExpenditureResult {
  bmr: number;
  tdee: number;
  weightLossTarget: number;
  weightGainTarget: number;
  activityLevel: string;
  chartData: { name: string; calories: number; fill: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcExpenditure(
  sex: string, age: number,
  feet: number, inches: number, weightLbs: number,
  activityMultiplier: number, activityLevelName: string
): ExpenditureResult {
  // Convert to metric
  const weightKg = weightLbs / 2.20462;
  const heightCm = ((feet * 12) + inches) * 2.54;

  // Mifflin-St Jeor Equation (Clinical Standard)
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (sex === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Calculate TDEE
  const tdee = bmr * activityMultiplier;

  // Goals
  const weightLossTarget = tdee - 500; // Standard 1 lb/week deficit
  const weightGainTarget = tdee + 500; // Standard 1 lb/week surplus

  // Chart: Compare TDEE across all activity levels
  const chartData = [
    { name: "Sedentary", calories: Math.round(bmr * 1.2), fill: activityMultiplier === 1.2 ? "#ef4444" : "#e2e8f0" },
    { name: "Light Active", calories: Math.round(bmr * 1.375), fill: activityMultiplier === 1.375 ? "#f97316" : "#cbd5e1" },
    { name: "Moderate", calories: Math.round(bmr * 1.55), fill: activityMultiplier === 1.55 ? "#3b82f6" : "#94a3b8" },
    { name: "Very Active", calories: Math.round(bmr * 1.725), fill: activityMultiplier === 1.725 ? "#8b5cf6" : "#cbd5e1" },
    { name: "Extra Active", calories: Math.round(bmr * 1.9), fill: activityMultiplier === 1.9 ? "#10b981" : "#e2e8f0" }
  ];

  const summaryStats = [
    { label: "Basal Metabolic Rate", value: `${Math.round(bmr)} kcal` },
    { label: "Maintenance (TDEE)", value: `${Math.round(tdee)} kcal` },
    { label: "Weight Loss (-500)", value: `${Math.round(weightLossTarget)} kcal` },
    { label: "Weight Gain (+500)", value: `${Math.round(weightGainTarget)} kcal` }
  ];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    weightLossTarget: Math.round(weightLossTarget),
    weightGainTarget: Math.round(weightGainTarget),
    activityLevel: activityLevelName,
    chartData,
    summaryStats
  };
}

export default function CaloricExpenditureCalculator() {
  const [sex, setSex] = useState("male");
  const [age, setAge] = useState("30");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("10");
  const [weight, setWeight] = useState("180");
  const [activity, setActivity] = useState("1.55|Moderate");

  const [result, setResult] = useState<ExpenditureResult | null>(null);

  const calculate = () => {
    const a = parseInt(age), f = parseInt(feet) || 0, i = parseInt(inches) || 0, w = parseInt(weight);
    if (a > 0 && w > 0 && (f > 0 || i > 0)) {
      const [multStr, actName] = activity.split("|");
      setResult(calcExpenditure(sex, a, f, i, w, parseFloat(multStr), actName));
    }
  };

  useEffect(() => { setResult(calcExpenditure("male", 30, 5, 10, 180, 1.55, "Moderate")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is the difference between BMR and TDEE?", answer: "Basal Metabolic Rate (BMR) is the absolute minimum amount of energy your body requires just to stay alive if you were in a coma (keeping your heart beating, lungs breathing, and brain functioning). Total Daily Energy Expenditure (TDEE) takes your BMR and multiplies it by your daily movement and exercise to calculate your true daily caloric burn." },
    { question: "Should I eat my BMR or my TDEE to lose weight?", answer: "You must base your diet on your TDEE, not your BMR. Eating below your BMR is generally considered crash-dieting and can negatively impact hormone production and muscle mass. To lose weight safely, you should subtract 300 to 500 calories from your TDEE. This creates a caloric deficit while ensuring your body has enough energy to function." },
    { question: "Why is the Mifflin-St Jeor formula the clinical standard?", answer: "Before Mifflin-St Jeor was published in 1990, the Harris-Benedict equation was the standard. However, the Harris-Benedict equation was created in 1919 and has been proven to overestimate caloric needs by about 5% in modern populations. Clinical dietitians now exclusively use Mifflin-St Jeor because it is statistically the most accurate formula for modern body compositions." },
    { question: "Which activity multiplier should I choose?", answer: "Most people overestimate their activity level. If you work a desk job but go to the gym for 45 minutes a day, you are still considered 'Lightly Active'. The 'Moderately Active' tier is for individuals who are on their feet for their job (like nurses or waiters) AND exercise. Only choose 'Extra Active' if you perform hard manual labor (like construction) or train athletically twice a day." },
    { question: "Can I out-train a bad diet?", answer: "Mathematically, no. As you can see by toggling the activity levels, exercising for an hour only burns an extra 300 to 500 calories (the equivalent of one large muffin). It is significantly easier to simply not eat the 500 calories than it is to spend an hour sweating on a treadmill trying to burn them off. Weight loss happens in the kitchen." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Caloric Expenditure Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Total Daily Energy Expenditure (TDEE) Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age</label>
                <div className={inp}><input type="number" min="15" max="100" value={age} onChange={e => setAge(e.target.value)} className={ci} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Biological Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={`${inp} w-full px-3 text-sm focus:ring-2 focus:ring-primary/20`}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Feet)</label>
                <div className={inp}><input type="number" value={feet} onChange={e => setFeet(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">ft</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (Inches)</label>
                <div className={inp}><input type="number" value={inches} onChange={e => setInches(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">in</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Current Weight</label>
              <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className="pr-3 text-xs text-muted-foreground">lbs</span></div>
            </div>

            <div className="border-t border-border pt-4 mt-1">
              <label className="text-sm font-medium mb-1.5 block">Physical Activity Level</label>
              <select value={activity} onChange={e => setActivity(e.target.value)} className={`${inp} w-full px-3 text-sm h-12 focus:ring-2 focus:ring-primary/20`}>
                <option value="1.2|Sedentary">Sedentary (Desk job, little to no exercise)</option>
                <option value="1.375|Light Active">Lightly Active (Exercise 1-3 days/week)</option>
                <option value="1.55|Moderate">Moderately Active (Exercise 3-5 days/week)</option>
                <option value="1.725|Very Active">Very Active (Hard exercise 6-7 days/week)</option>
                <option value="1.9|Extra Active">Extra Active (Physical labor job or 2x/day training)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={() => { setSex("male"); setAge("30"); setFeet("5"); setInches("10"); setWeight("180"); setActivity("1.55|Moderate"); setResult(calcExpenditure("male", 30, 5, 10, 180, 1.55, "Moderate")); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="border-l-4 rounded-lg p-5 shadow-sm bg-primary/5 border-primary">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Daily Maintenance Calories (TDEE)</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-5xl font-extrabold text-foreground tracking-tight">{result.tdee}</div>
                      <div className="text-xl font-bold text-muted-foreground">kcal</div>
                    </div>
                  </div>
                  <div className="bg-background rounded-full p-3 shadow-sm border border-border">
                    <Flame className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="inline-block px-3 py-1 mt-3 text-sm font-bold uppercase tracking-widest rounded-full text-primary shadow-sm bg-primary/10 border border-primary/20">
                  {result.activityLevel}
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-3 leading-relaxed">
                  You must eat exactly <strong>{result.tdee} calories</strong> per day to maintain your current weight of {weight} lbs.
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className={`p-4 text-center flex flex-col justify-center ${i > 0 ? "border-l border-border" : ""} ${i === 2 ? "bg-amber-500/5" : ""} ${i === 3 ? "bg-emerald-500/5" : ""}`}>
                    <div className="text-[10px] sm:text-[11px] font-bold uppercase text-muted-foreground tracking-wider mb-2 leading-tight">{s.label}</div>
                    <div className={`text-lg sm:text-xl font-bold ${i === 2 ? "text-amber-600 dark:text-amber-500" : i === 3 ? "text-emerald-600 dark:text-emerald-500" : "text-foreground"}`}>{s.value.replace(" kcal", "")}</div>
                    <div className="text-[10px] font-semibold text-muted-foreground mt-1">kcal</div>
                  </div>
                ))}
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold">Activity Level Impact on TDEE</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 500 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 300', 'dataMax + 300']} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(v: number) => [`${v} kcal`, "TDEE"]} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {result.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">Highlighted bar represents your currently selected activity level.</p>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Mathematics of Weight Loss: Understanding TDEE</h2>
            <p>Every fad diet on the market—from Keto and Paleo to Intermittent Fasting and Weight Watchers—ultimately works through the exact same biological mechanism: a caloric deficit. If you consume fewer calories than your body burns, your body is forced to oxidize stored fat tissue to make up the missing energy difference. To create that precise deficit, you must first calculate your <strong>Total Daily Energy Expenditure (TDEE)</strong>.</p>
            <p>This calculator uses the <strong>Mifflin-St Jeor Equation</strong>, the clinical formula used by registered dietitians worldwide to calculate human energy expenditure. It is significantly more accurate than the older Harris-Benedict equation, which notoriously overestimates caloric burn.</p>

            <h2>Step 1: Basal Metabolic Rate (BMR)</h2>
            <p>Your caloric expenditure is made up of two distinct parts. The first part is your BMR. Think of BMR as the absolute minimum energy required to keep your biological lights on. If you were lying perfectly still in a dark room all day, your body still needs massive amounts of energy to keep your heart pumping blood, your lungs expanding, your liver filtering toxins, and your brain firing neurons. For most people, BMR accounts for roughly 60% to 70% of all calories burned in a day.</p>
            
            <h2>Step 2: Activity Multipliers</h2>
            <p>The second part of the equation is your movement. To calculate your final TDEE, the formula takes your BMR and multiplies it by an Activity Multiplier based on your daily routine:</p>
            <ul>
              <li><strong>Sedentary (1.2):</strong> You work a desk job and do not engage in intentional exercise. You drive to work, sit at a desk, and sit on the couch at home.</li>
              <li><strong>Lightly Active (1.375):</strong> You work a desk job but purposefully exercise or take long walks 1 to 3 times a week.</li>
              <li><strong>Moderately Active (1.55):</strong> You engage in moderate-intensity exercise 3 to 5 days a week. Alternatively, you have a job that keeps you on your feet all day (like a nurse, teacher, or waiter).</li>
              <li><strong>Very Active (1.725):</strong> You engage in intense athletic training or heavy lifting 6 to 7 days a week.</li>
              <li><strong>Extra Active (1.9):</strong> You have a grueling physical labor job (roofing, construction) or you are a professional athlete training twice a day.</li>
            </ul>

            <h2>How to Use Your TDEE to Lose Weight</h2>
            <p>Once you know your TDEE, weight loss becomes a simple, predictable math equation. One pound of human body fat stores approximately <strong>3,500 calories</strong> of energy.</p>
            <p>If you want to lose 1 pound of pure fat per week, you need to create a deficit of 3,500 calories per week. By dividing 3,500 by 7 days, you arrive at a daily deficit of exactly <strong>500 calories</strong>.</p>
            <p>Therefore, if the calculator says your TDEE is 2,500 calories, you simply set your daily food target to 2,000 calories. If you track your food accurately and hit that 2,000 calorie target every single day, the laws of thermodynamics guarantee that you will lose exactly 1 pound of fat per week.</p>

            <h2>Why You Shouldn't Over-Restrict</h2>
            <p>A common mistake is trying to lose weight too fast by eating drastically below your TDEE (e.g., eating 1,200 calories when your TDEE is 2,800). This is clinically dangerous and biologically counterproductive. Severe caloric restriction spikes cortisol (a stress hormone that causes water retention), causes the body to cannibalize muscle tissue for fast energy, and eventually suppresses your BMR as the body attempts to prevent starvation. A moderate 500-calorie deficit from your TDEE is the scientifically proven sweet spot for sustainable, long-term fat loss while preserving lean muscle mass.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/caloric-expenditure-calculator" />
          <PopularCalculators exclude="/calculator/caloric-expenditure-calculator" />
        </div>
      </div>
    </>
  );
}
