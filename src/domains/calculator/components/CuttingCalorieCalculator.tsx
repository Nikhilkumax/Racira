"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Scissors, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface CuttingInputs {
  currentWeight: number;
  goalWeight: number;
  unit: "lbs" | "kg";
  tdee: number;
  aggression: number; // percentage of body weight per week (e.g. 0.5, 1.0, 1.5)
}

interface CuttingResults {
  targetCalories: number;
  dailyDeficit: number;
  weeksToGoal: number;
  weeklyLoss: number;
  
  warningMsg: string | null;
  recommendation: string;

  chartData: { week: number; weight: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateCut = (inputs: CuttingInputs): CuttingResults | null => {
  const { currentWeight, goalWeight, unit, tdee, aggression } = inputs;
  
  if (currentWeight <= 0 || goalWeight <= 0 || tdee < 1000 || goalWeight >= currentWeight) return null;

  // Calculate rate of loss
  const weeklyLoss = currentWeight * (aggression / 100);
  
  // 1 lb of fat = ~3500 kcal. 1 kg = ~7700 kcal
  const kcalPerUnit = unit === "lbs" ? 3500 : 7700;
  
  const weeklyDeficit = weeklyLoss * kcalPerUnit;
  const dailyDeficit = weeklyDeficit / 7;
  
  let targetCalories = tdee - dailyDeficit;
  const totalWeightToLose = currentWeight - goalWeight;
  const weeksToGoal = totalWeightToLose / weeklyLoss;

  let warningMsg = null;
  
  // Hard floors for safety
  if (targetCalories < 1200) {
    warningMsg = `DANGER: Your selected rate of loss forces your daily calories down to ${Math.round(targetCalories)} kcal. Medical guidelines strongly advise against dropping below 1200 kcal/day without clinical supervision. We have adjusted your target to 1200.`;
    targetCalories = 1200;
  } else if (aggression > 1.0 && currentWeight < (unit === "lbs" ? 180 : 80)) {
    warningMsg = "WARNING: Losing more than 1% of your body weight per week when you are already relatively lean dramatically increases the risk of severe muscle loss and metabolic crash.";
  }

  // Generate chart projection data (cap at 24 weeks for chart readability)
  const chartData = [];
  const maxWeeksChart = Math.min(Math.ceil(weeksToGoal), 24);
  let projectedWeight = currentWeight;

  for (let i = 0; i <= maxWeeksChart; i++) {
    chartData.push({ 
      week: i, 
      weight: parseFloat(projectedWeight.toFixed(1)) 
    });
    projectedWeight -= weeklyLoss;
  }
  
  // If we capped the chart, add the final point
  if (maxWeeksChart < Math.ceil(weeksToGoal)) {
    chartData.push({ 
      week: Math.ceil(weeksToGoal), 
      weight: parseFloat(goalWeight.toFixed(1)) 
    });
  }

  let recommendation = "";
  if (aggression <= 0.5) {
    recommendation = "This is a conservative, sustainable cut. It will take longer, but you will experience virtually zero muscle loss, retain high energy for workouts, and face minimal diet fatigue.";
  } else if (aggression <= 1.0) {
    recommendation = "This is the optimal 'Gold Standard' cutting zone. You will strip fat efficiently while preserving lean mass, provided your protein intake remains high and you continue heavy resistance training.";
  } else {
    recommendation = "This is an aggressive 'Mini-Cut'. It is designed to strip fat as quickly as possible over a very short duration (4-6 weeks maximum) before diet fatigue and muscle catabolism set in.";
  }

  const summaryStats = [
    { label: "Target Daily Calories", value: `${Math.round(targetCalories)} kcal`, colorClass: "text-primary font-bold text-lg" },
    { label: "Required Daily Deficit", value: `-${Math.round(dailyDeficit)} kcal`, colorClass: "text-red-500 font-bold" },
    { label: "Projected Weekly Loss", value: `${weeklyLoss.toFixed(1)} ${unit}` },
    { label: "Total Timeline", value: `${Math.ceil(weeksToGoal)} Weeks`, colorClass: "text-blue-500 font-medium" }
  ];

  return {
    targetCalories,
    dailyDeficit,
    weeksToGoal,
    weeklyLoss,
    warningMsg,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  currentWeight: "200",
  goalWeight: "185",
  unit: "lbs" as const,
  tdee: "2800",
  aggression: "1.0" // 1%
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5 text-primary">Week {payload[0].payload.week}</p>
        <p className="text-muted-foreground">Projected Weight: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: any) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1.5">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{prefix}</span>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function CuttingCalorieCalculator() {
  // 4. Component State
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [goalWeight, setGoalWeight] = useState(DEFAULTS.goalWeight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [tdee, setTdee] = useState(DEFAULTS.tdee);
  const [aggression, setAggression] = useState(DEFAULTS.aggression);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CuttingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const curr = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);
    
    if (goal >= curr) {
      setErrorMsg("Error: Goal weight must be lower than current weight for a cutting phase.");
      setResults(null);
      return;
    }

    const inputs: CuttingInputs = {
      currentWeight: curr || 0,
      goalWeight: goal || 0,
      unit,
      tdee: parseInt(tdee) || 0,
      aggression: parseFloat(aggression) || 1.0
    };
    setResults(calculateCut(inputs));
  };

  const handleReset = () => {
    setCurrentWeight(DEFAULTS.currentWeight);
    setGoalWeight(DEFAULTS.goalWeight);
    setUnit(DEFAULTS.unit);
    setTdee(DEFAULTS.tdee);
    setAggression(DEFAULTS.aggression);
    setErrorMsg("");
    
    setResults(calculateCut({
      currentWeight: parseFloat(DEFAULTS.currentWeight),
      goalWeight: parseFloat(DEFAULTS.goalWeight),
      unit: DEFAULTS.unit,
      tdee: parseInt(DEFAULTS.tdee),
      aggression: parseFloat(DEFAULTS.aggression)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeight, goalWeight, unit, tdee, aggression]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cutting Protocol</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a 'Cut'?", answer: "In bodybuilding and fitness, a 'cut' is a deliberate, mathematically structured phase of caloric restriction designed to strip away body fat while preserving as much lean muscle mass as possible. It is vastly different from a 'crash diet', which indiscriminately destroys muscle and fat alike." },
    { question: "Why is the target based on a percentage of my weight?", answer: "A 250-pound man can safely lose 2.5 pounds per week because he has massive fat reserves. A 140-pound man attempting to lose 2.5 pounds per week will immediately begin catabolizing (burning) muscle tissue because his fat reserves are too low to sustain that massive energy deficit. Basing the deficit on your exact body weight prevents muscle loss." },
    { question: "Why does the calculator warn me if I select >1.5%?", answer: "Scientific literature overwhelmingly shows that losing more than 1% to 1.5% of your total body weight per week results in significant muscle atrophy, crashing testosterone levels, and severe metabolic adaptation (your BMR drops). You are starving, not cutting." },
    { question: "What if my target calories drop below 1200?", answer: "If your required deficit drops your daily intake below 1200 kcal, the calculator will trigger a hard stop. It is impossible to meet your basic micronutrient (vitamin/mineral) and essential fat requirements under 1200 calories without clinical supervision. You must either slow down your rate of loss, or increase your physical activity to raise your TDEE." },
    { question: "Do I need to do cardio during a cut?", answer: "Not necessarily. Fat loss is driven entirely by the caloric deficit. You can generate that deficit entirely through diet (eating less). However, doing cardio raises your TDEE, which allows you to eat more food while maintaining the exact same deficit, making the diet much easier to adhere to psychologically." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cutting Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cutting Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Scissors className="h-4 w-4" /> Fat Loss Protocol
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact daily caloric deficit required to strip body fat at a specific rate without sacrificing lean muscle tissue.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-2 gap-3">
                <CompactInput id="cw" label="Current Wt." value={currentWeight} onChange={setCurrentWeight} />
                <CompactInput id="gw" label="Goal Wt." value={goalWeight} onChange={setGoalWeight} />
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">&nbsp;</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setUnit("lbs")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "lbs" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>LBS</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "kg" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>KG</button>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md -mt-1">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tdee" label="Total Daily Energy Expenditure (Maintenance)" value={tdee} onChange={setTdee} suffix="kcal" />
            </div>

            <div className="flex flex-col mb-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Rate of Loss (% of Body Weight per Week)</label>
              <select 
                value={aggression} 
                onChange={(e) => setAggression(e.target.value)}
                className="w-full h-10 px-3 py-1 text-base rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="0.25">0.25% - Ultra Conservative (Recomp)</option>
                <option value="0.5">0.50% - Conservative Cut</option>
                <option value="0.75">0.75% - Moderate Cut</option>
                <option value="1.0">1.00% - Gold Standard Cut</option>
                <option value="1.25">1.25% - Aggressive</option>
                <option value="1.5">1.50% - Mini-Cut (Short Duration)</option>
                <option value="2.0">2.00% - Extreme (High Risk of Muscle Loss)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Protocol
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Warning if any */}
                {results.warningMsg && (
                  <div className="bg-amber-500/10 border border-amber-500 text-amber-700 dark:text-amber-400 p-4 rounded-lg flex gap-3 items-start">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold leading-relaxed">{results.warningMsg}</p>
                  </div>
                )}

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                      Daily Calorie Target
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{Math.round(results.targetCalories)}</div>
                      <div className="text-xl font-bold text-muted-foreground">kcal / day</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      Consume exactly this many calories daily to lose <strong>{results.weeklyLoss.toFixed(1)} {unit}</strong> per week and reach your goal in <strong>{Math.ceil(results.weeksToGoal)} weeks</strong>.
                    </p>
                  </div>
                  <Scissors className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Protocol Statistics</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Weight Loss Projection</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={results.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `Wk ${v}`} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={goalWeight} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Scissors className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your current weight, goal weight, and maintenance calories to calculate your customized fat loss protocol.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Cutting Calorie Calculator</h2>
            <p>In the fitness and bodybuilding world, losing weight is not the goal—losing <em>fat</em> is the goal. If you simply stop eating, you will lose weight rapidly, but a massive portion of that weight will be metabolically expensive, hard-earned muscle tissue. This process, known as muscle catabolism, leaves you looking "skinny fat" and drastically lowers your basal metabolic rate (BMR), guaranteeing that you will rebound and gain all the fat back once the diet ends.</p>
            <p>To prevent this, athletes utilize a highly structured nutritional phase known as a "Cut". A cut is not a crash diet; it is a mathematically precise caloric deficit designed to coax the body into burning stored body fat for fuel while providing just enough energy (and heavy resistance training) to signal the body to preserve muscle. The <strong>Cutting Calorie Calculator</strong> removes the guesswork by providing exact daily targets based on your unique body weight and timeline.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Fat Loss</h2>
            <p>The entire foundation of a cutting protocol rests on the laws of thermodynamics. To lose fat, you must be in a caloric deficit. But how large should that deficit be? The math is universally established:</p>
            <p>One pound of human adipose tissue (body fat) contains approximately <strong>3,500 kilocalories</strong> of stored energy. (If you use the metric system, one kilogram of fat contains roughly 7,700 kcal). Therefore, if you want to lose exactly one pound of pure fat per week, you must create a deficit of 3,500 calories over the course of that week. Divided by 7 days, this equates to a daily deficit of <strong>500 calories</strong> below your Total Daily Energy Expenditure (TDEE).</p>
            <p>If your TDEE (maintenance) is 2,500 calories, eating 2,000 calories a day will result in exactly one pound of fat loss per week. The calculator automates this math, factoring in your exact target rate of loss to generate a customized daily limit.</p>

            <h2 className="text-2xl font-bold mb-3">Why is the Target Based on Percentage of Body Weight?</h2>
            <p>One of the most dangerous myths in the diet industry is the idea of a universal, flat rate of weight loss (e.g., "Everyone should aim to lose 2 pounds per week!"). This is biologically absurd. </p>
            <p>Adipose tissue can only release a finite amount of energy per day. If the caloric deficit you create exceeds the energy your fat cells can release, your body immediately panics and begins breaking down muscle tissue to make up the difference. A 300-pound man has massive fat reserves; he can safely lose 3 pounds (1%) per week without risking muscle loss. However, a 150-pound man attempting to lose 3 pounds per week is forcing his body into severe starvation and will strip away massive amounts of muscle.</p>
            <p>This is why our calculator bases your deficit on a <strong>percentage of your total body weight</strong>. This ensures the protocol scales safely to your unique physiology.</p>

            <h2 className="text-2xl font-bold mb-3">Decoding the "Rate of Loss" Options</h2>
            <p>When selecting your aggression level, it is vital to understand the physiological trade-offs of each tier:</p>
            <p><strong>0.25% - 0.50% (Conservative):</strong> This is the ideal zone for "Body Recomposition." The deficit is so small that your gym performance will not suffer at all. If your protein is high, you can actually build muscle while slowly dropping fat. However, the timeline to reach your goal will be extremely long.</p>
            <p><strong>0.75% - 1.00% (The Gold Standard):</strong> This is universally accepted as the optimal cutting zone for natural athletes. You are stripping away fat efficiently (often 1.5 to 2 pounds a week for a larger man) without triggering the body's starvation response. Gym performance may drop slightly toward the end of the cut, but muscle mass is preserved.</p>
            <p><strong>1.25% - 1.50% (The Mini-Cut):</strong> This is an aggressive deficit designed for short durations (usually 4 to 6 weeks maximum). Bodybuilders use mini-cuts to quickly strip off excess fat accumulated during a bulking phase so they can get back to building muscle. Because the deficit is massive, diet fatigue sets in rapidly, and you will feel hungry and tired.</p>
            <p><strong>2.00%+ (Extreme / High Risk):</strong> This rate should only be attempted by clinically obese individuals under medical supervision, or by enhanced bodybuilders utilizing exogenous hormones to chemically prevent muscle breakdown. For a natural, average-weight individual, a 2% weekly drop guarantees severe muscle atrophy and metabolic crash.</p>

            <h2 className="text-2xl font-bold mb-3">The 1200 Calorie Hard-Stop</h2>
            <p>If you input a highly aggressive rate of loss, the calculator may throw a red warning and hard-stop your target at 1,200 calories. This is not a glitch; it is a critical safety feature. </p>
            <p>Major medical institutions (including the NIH and the American College of Sports Medicine) state that diets dipping below 1,200 calories for women (or 1,500 for men) are clinically dangerous without medical supervision. When calories drop this low, it becomes mathematically impossible to consume the essential amino acids, essential fatty acids, and micronutrients your organs need to function. If your required deficit pushes you below 1,200 calories, you cannot simply "eat less." You must increase your TDEE by adding cardiovascular exercise to widen the gap.</p>

            <h2 className="text-2xl font-bold mb-3">Macronutrients During a Cut</h2>
            <p>Knowing your daily calorie target is only step one. Step two is organizing those calories into macronutrients. During a cut, your macronutrient ratio must shift drastically compared to a maintenance or bulking phase.</p>
            <p><strong>1. Protein is Paramount:</strong> During a caloric deficit, protein becomes the most important macronutrient. You must consume at least 1 gram of protein per pound of your goal body weight. This forces the body to preserve muscle tissue and keeps you incredibly satiated.</p>
            <p><strong>2. Keep Fats Moderate:</strong> Dietary fats are essential for hormone production (specifically testosterone). Do not drop your fats below 0.3 grams per pound of body weight, or your hormonal profile will crash, leading to depression and zero libido.</p>
            <p><strong>3. Carbs Fill the Rest:</strong> Carbohydrates are the only macro you should actively restrict to create the deficit. Because carbs yield energy, and your goal is to force the body to use stored fat for energy, dropping carbs is the primary mechanism of a successful cut. However, time your remaining carbs strategically around your workout to fuel your training.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Consistency Over Intensity</h2>
            <p>The most successful cut is not the one with the most aggressive deficit; it is the one you can actually adhere to. A 1% deficit followed perfectly for 12 weeks will yield vastly superior results to a 2% deficit that causes you to binge-eat every weekend. Use the Cutting Calorie Calculator to map out a mathematical, sustainable protocol, trust the timeline, and watch the fat melt away.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cutting-calorie-calculator" />
          <PopularCalculators exclude="/calculator/cutting-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
