"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Dumbbell, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface BulkingInputs {
  currentWeight: number;
  goalWeight: number;
  unit: "lbs" | "kg";
  tdee: number;
  aggression: number; // percentage of body weight per week (e.g. 0.25, 0.5)
}

interface BulkingResults {
  targetCalories: number;
  dailySurplus: number;
  weeksToGoal: number;
  weeklyGain: number;
  
  warningMsg: string | null;
  recommendation: string;

  chartData: { week: number; weight: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateBulk = (inputs: BulkingInputs): BulkingResults | null => {
  const { currentWeight, goalWeight, unit, tdee, aggression } = inputs;
  
  if (currentWeight <= 0 || goalWeight <= 0 || tdee < 1000 || goalWeight <= currentWeight) return null;

  // Calculate rate of gain
  const weeklyGain = currentWeight * (aggression / 100);
  
  // Bulking math is slightly different than cutting.
  // While 1lb of fat is 3500 cals, building 1lb of muscle requires a surplus of ~2500-2800 kcal due to the energy cost of protein synthesis.
  // However, a standard heuristic of 3500 kcal per lb is still widely used to account for the mix of fat/muscle gained.
  const kcalPerUnit = unit === "lbs" ? 3500 : 7700;
  
  const weeklySurplus = weeklyGain * kcalPerUnit;
  const dailySurplus = weeklySurplus / 7;
  
  const targetCalories = tdee + dailySurplus;
  const totalWeightToGain = goalWeight - currentWeight;
  const weeksToGoal = totalWeightToGain / weeklyGain;

  let warningMsg = null;
  
  if (aggression > 0.5) {
    warningMsg = "WARNING: You have selected an aggressive 'Dirty Bulk' rate. The human body can only synthesize a maximum of ~0.5 lbs of muscle per week (less for advanced lifters). Any weight gained beyond that biological limit will be stored entirely as body fat.";
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
    projectedWeight += weeklyGain;
  }
  
  // If we capped the chart, add the final point
  if (maxWeeksChart < Math.ceil(weeksToGoal)) {
    chartData.push({ 
      week: Math.ceil(weeksToGoal), 
      weight: parseFloat(goalWeight.toFixed(1)) 
    });
  }

  let recommendation = "";
  if (aggression <= 0.25) {
    recommendation = "This is a 'Lean Bulk'. The surplus is small enough that you will gain almost pure muscle with virtually zero fat accumulation. It requires patience and strict macro tracking.";
  } else if (aggression <= 0.5) {
    recommendation = "This is the optimal 'Standard Bulk'. It provides enough excess energy to maximize muscle protein synthesis and gym performance, while keeping fat gain to an acceptable minimum.";
  } else {
    recommendation = "This is a 'Dirty Bulk'. You will gain weight very quickly, and your strength will skyrocket, but be prepared to undergo a lengthy cutting phase afterward to strip away the significant body fat you will accumulate.";
  }

  const summaryStats = [
    { label: "Target Daily Calories", value: `${Math.round(targetCalories)} kcal`, colorClass: "text-primary font-bold text-lg" },
    { label: "Required Daily Surplus", value: `+${Math.round(dailySurplus)} kcal`, colorClass: "text-green-500 font-bold" },
    { label: "Projected Weekly Gain", value: `${weeklyGain.toFixed(2)} ${unit}` },
    { label: "Total Timeline", value: `${Math.ceil(weeksToGoal)} Weeks`, colorClass: "text-blue-500 font-medium" }
  ];

  return {
    targetCalories,
    dailySurplus,
    weeksToGoal,
    weeklyGain,
    warningMsg,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  currentWeight: "160",
  goalWeight: "180",
  unit: "lbs" as const,
  tdee: "2600",
  aggression: "0.5" // 0.5%
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

export default function BulkingCalorieCalculator() {
  // 4. Component State
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [goalWeight, setGoalWeight] = useState(DEFAULTS.goalWeight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [tdee, setTdee] = useState(DEFAULTS.tdee);
  const [aggression, setAggression] = useState(DEFAULTS.aggression);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<BulkingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const curr = parseFloat(currentWeight);
    const goal = parseFloat(goalWeight);
    
    if (goal <= curr) {
      setErrorMsg("Error: Goal weight must be higher than current weight for a bulking phase.");
      setResults(null);
      return;
    }

    const inputs: BulkingInputs = {
      currentWeight: curr || 0,
      goalWeight: goal || 0,
      unit,
      tdee: parseInt(tdee) || 0,
      aggression: parseFloat(aggression) || 0.5
    };
    setResults(calculateBulk(inputs));
  };

  const handleReset = () => {
    setCurrentWeight(DEFAULTS.currentWeight);
    setGoalWeight(DEFAULTS.goalWeight);
    setUnit(DEFAULTS.unit);
    setTdee(DEFAULTS.tdee);
    setAggression(DEFAULTS.aggression);
    setErrorMsg("");
    
    setResults(calculateBulk({
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
    w.document.write(`<html><head><title>Bulking Protocol</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a 'Bulk'?", answer: "A 'bulk' is a deliberate, structured phase of eating in a caloric surplus (consuming more calories than your body burns). The purpose is to provide the excess energy and nutrients required to build new muscle tissue, an energy-expensive process that the body will not perform in a deficit." },
    { question: "What is the difference between a Lean Bulk and a Dirty Bulk?", answer: "A Lean Bulk uses a very small surplus (e.g., +200 calories/day) to build muscle slowly while minimizing fat gain. A Dirty Bulk uses a massive surplus (e.g., +1000 calories/day), often relying on junk food. While a Dirty Bulk builds muscle faster, it results in massive fat accumulation that must be dieted off later." },
    { question: "Why is the biological limit of muscle growth important?", answer: "The human body has a strict biological limit on how fast it can synthesize new muscle tissue. For an average male beginner, the absolute maximum is roughly 0.5 pounds of muscle per week (and far less for advanced lifters). If you gain 2 pounds a week on a dirty bulk, 1.5 pounds of that is guaranteed to be pure fat." },
    { question: "Why is the target based on a percentage of my weight?", answer: "A 200-pound lifter has a larger frame, more muscle mass, and a higher metabolic capacity than a 140-pound lifter. Setting the surplus as a percentage of total body weight ensures the surplus is scaled appropriately to the individual's capacity to build tissue, preventing rapid fat gain." },
    { question: "Do I have to track macros on a bulk?", answer: "Yes, even more so than a cut. If you eat a massive caloric surplus but fail to consume enough protein, your body cannot build muscle, and 100% of the surplus will be stored as fat. You must ensure at least 1 gram of protein per pound of body weight." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Bulking Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Bulking Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Muscle Hypertrophy Protocol
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact caloric surplus required to maximize muscle protein synthesis without crossing the biological threshold into excessive fat gain.</p>
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
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Rate of Gain (% of Body Weight per Week)</label>
              <select 
                value={aggression} 
                onChange={(e) => setAggression(e.target.value)}
                className="w-full h-10 px-3 py-1 text-base rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="0.15">0.15% - Ultra Lean (Advanced Lifters)</option>
                <option value="0.25">0.25% - Lean Bulk (Minimal Fat)</option>
                <option value="0.5">0.50% - Standard Bulk (Optimal)</option>
                <option value="0.75">0.75% - Aggressive</option>
                <option value="1.0">1.00% - Dirty Bulk (High Fat Gain)</option>
                <option value="1.5">1.50% - Extreme Dirty Bulk</option>
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
                      Consume exactly this many calories daily to gain <strong>{results.weeklyGain.toFixed(2)} {unit}</strong> per week and reach your goal in <strong>{Math.ceil(results.weeksToGoal)} weeks</strong>.
                    </p>
                  </div>
                  <Dumbbell className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
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
                    <h3 className="text-base font-bold mb-4 w-full text-left">Mass Accrual Projection</h3>
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
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your current weight, goal weight, and maintenance calories to calculate your customized bulking protocol.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Bulking Calorie Calculator</h2>
            <p>Building muscle is a deeply un-natural and energy-expensive process for the human body. Unlike fat, which is the body's preferred survival mechanism for storing excess energy, muscle tissue requires massive amounts of calories just to be built, and even more calories to be sustained on a daily basis. To force your body to build muscle, you must give it a reason (heavy resistance training) and you must provide the raw materials (a caloric surplus). The <strong>Bulking Calorie Calculator</strong> is designed to determine exactly how large that surplus should be to maximize muscle growth while minimizing unwanted fat accumulation.</p>
            <p>A "bulk" is a deliberate, mathematically structured phase of eating in a caloric surplus. Unfortunately, because the body's ability to build muscle is strictly biologically capped, many athletes fall into the trap of eating too much, resulting in what is colloquially known as a "Dirty Bulk." Our calculator prevents this by scaling your surplus directly to your body weight and experience level.</p>

            <h2>The Thermodynamics of Muscle Hypertrophy</h2>
            <p>To understand bulking, you must understand the math behind the tissue. While it is universally accepted that one pound of stored fat equates to roughly 3,500 calories, the mathematics of muscle are slightly different. Skeletal muscle is mostly water (about 70%), with the remaining 30% composed of protein and trace amounts of glycogen and fat.</p>
            <p>However, the <em>process</em> of synthesizing that protein (muscle protein synthesis) is incredibly energy-intensive. It is generally estimated that building one pound of new muscle requires a surplus of roughly 2,500 to 2,800 calories. Because no bulk is 100% perfectly efficient (you will always gain a small fraction of fat alongside the muscle), the standard heuristic of a 3,500-calorie surplus per pound of body weight gained is still used to calculate the macro-level timeline.</p>

            <h2>The Biological Limit of Muscle Growth</h2>
            <p>The single most important concept in bulking is understanding your biological limit. The human body is not capable of building infinite muscle simply because you eat infinite food. There is a hard cap on how much protein synthesis can occur in a given week, dictated by your genetics, testosterone levels, and training age.</p>
            <ul>
              <li><strong>Novice Lifters (Year 1):</strong> Can potentially build up to 0.5 pounds of pure muscle per week (roughly 2 pounds a month).</li>
              <li><strong>Intermediate Lifters (Years 2-3):</strong> Muscle growth slows drastically to about 0.25 pounds per week (1 pound a month).</li>
              <li><strong>Advanced Lifters (Years 4+):</strong> May struggle to build 0.5 pounds of muscle in an entire month.</li>
            </ul>
            <p>Why does this matter? If your biological limit is 0.5 pounds of muscle per week, and you eat a massive 1,000-calorie daily surplus designed to make you gain 2 pounds per week, the remaining 1.5 pounds of weight you gain will be <strong>100% pure body fat</strong>. You cannot force the muscle-building machinery to run faster by over-fueling it. This is why scaling your rate of gain in the calculator is critical.</p>

            <h2>Decoding the "Rate of Gain" Options</h2>
            <p>When selecting your bulking aggression level, you must align your choice with your training experience:</p>
            <p><strong>0.15% - 0.25% (The Lean Bulk):</strong> This is the ideal zone for intermediate to advanced lifters. The caloric surplus is very small (often just +200 to +300 calories a day). Because the surplus is so tight, virtually all the weight gained will be muscle, keeping your body fat percentage extremely low. The drawback is that you must track your macros with absolute precision; miscounting by just 200 calories means you are no longer bulking.</p>
            <p><strong>0.50% (The Standard Bulk):</strong> This is the "Gold Standard" for beginners in their first year of training. A 160-pound novice selecting this rate will aim to gain 0.8 pounds a week (roughly a +400 calorie surplus). This provides enough excess energy to guarantee muscle growth and massive strength gains, with only a moderate, acceptable amount of fat accumulation.</p>
            <p><strong>1.00%+ (The Dirty Bulk):</strong> The calculator will flag this choice with a warning. A 1% weekly gain equates to over 6 pounds a month. Because your body cannot build 6 pounds of muscle in a month naturally, you are accepting that the majority of this weight will be fat. This is only recommended for severely underweight individuals (often high school athletes) who desperately need to move the scale regardless of body composition.</p>

            <h2>Macronutrients During a Bulk</h2>
            <p>Securing your caloric surplus from the calculator is only half the battle. If you eat a 500-calorie surplus comprised entirely of jelly beans, you will not build muscle; you will just get fat. To build tissue, those calories must be correctly partitioned across the three macronutrients.</p>
            <p><strong>1. Protein (The Building Block):</strong> Your body requires physical amino acids to construct new muscle fibers. During a bulk, you must consume a minimum of 1 gram of protein per pound of your goal body weight. (Some extreme bodybuilders push this to 1.5g). Without adequate protein, your surplus is useless.</p>
            <p><strong>2. Carbohydrates (The Fuel):</strong> Carbohydrates are the secret weapon of a successful bulk. Carbs are stored in your muscles as glycogen. When your muscles are full of glycogen, you can lift heavier weights for more repetitions, which triggers greater muscle hypertrophy. Furthermore, carbs trigger the release of insulin, the body's most highly anabolic (building) hormone. Once your protein target is met, fill the vast majority of your remaining surplus calories with clean carbohydrates like rice, oats, and potatoes.</p>
            <p><strong>3. Fats (The Regulator):</strong> Keep fats moderate. They are essential for producing testosterone, but dietary fat is very easily stored as body fat when you are in a massive caloric surplus. Keep them around 0.3 to 0.4 grams per pound of body weight.</p>

            <h2>When to Stop Bulking</h2>
            <p>A bulk should not last forever. As your body fat percentage creeps higher, your body becomes less insulin sensitive, meaning it becomes worse at building muscle and better at storing fat. A general rule in the fitness community is to bulk until you hit roughly 15% to 18% body fat (for men) or 25% to 28% (for women). Once you hit that threshold, it is time to transition to a Cutting phase, strip off the accumulated fat, and reveal the new muscle you have built underneath.</p>

            <h2>Conclusion: Trust the Process</h2>
            <p>Bulking requires immense patience. While fat can be lost rapidly (up to 2 pounds a week), muscle is built agonizingly slowly. Do not panic if the mirror doesn't change in the first three weeks. Do not artificially increase your calories just to force the scale to move faster, as that will only result in fat gain. Stick to the precise mathematical surplus provided by the Bulking Calorie Calculator, hit your protein targets, lift progressively heavier weights, and trust the biological process.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bulking-calorie-calculator" />
          <PopularCalculators exclude="/calculator/bulking-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
