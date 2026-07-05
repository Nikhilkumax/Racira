"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Utensils, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface SplitInputs {
  totalCalories: number;
  proteinGrams: number;
  mealCount: 2 | 3 | 4 | 5 | 6;
  strategy: "even" | "workout_heavy" | "carb_backload";
}

interface MealPlan {
  mealName: string;
  calories: number;
  protein: number;
  percentage: number;
  description: string;
}

interface SplitResults {
  meals: MealPlan[];
  dailyProtein: number;
  proteinPerMealAvg: number;
  
  grade: string;
  recommendation: string;

  chartData: { mealName: string; calories: number; protein: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateSplit = (inputs: SplitInputs): SplitResults | null => {
  const { totalCalories, proteinGrams, mealCount, strategy } = inputs;
  
  if (totalCalories < 1000 || proteinGrams <= 0 || (proteinGrams * 4) > totalCalories) return null;

  const meals: MealPlan[] = [];
  const evenSplitCals = totalCalories / mealCount;
  const evenSplitProtein = proteinGrams / mealCount;
  
  let grade = "Balanced Distribution";
  let recommendation = "";

  if (strategy === "even") {
    recommendation = "This is the classic bodybuilding approach. By evenly spacing your meals and protein intake every 3-4 hours, you maximize Muscle Protein Synthesis (MPS) pulses throughout the day and keep blood sugar perfectly stable.";
    grade = "Stable / Anabolic";
    
    for (let i = 1; i <= mealCount; i++) {
      meals.push({
        mealName: `Meal ${i}`,
        calories: Math.round(evenSplitCals),
        protein: Math.round(evenSplitProtein),
        percentage: Math.round((1 / mealCount) * 100),
        description: "Balanced macro intake."
      });
    }
  } else if (strategy === "workout_heavy") {
    recommendation = "Peri-workout nutrition prioritized. We have shifted the bulk of your daily calories into your Pre and Post-workout meals to maximize training energy and immediate glycogen replenishment, while keeping other meals lighter.";
    grade = "Performance Optimized";
    
    // Allocate 50% of calories to Pre/Post workout meals combined
    const workoutCalPercentage = 0.50;
    const remainingCals = totalCalories * (1 - workoutCalPercentage);
    
    let prePostCount = 0;
    let otherCount = 0;
    
    if (mealCount === 2) {
      // If only 2 meals, one is pre, one is post. It's essentially even.
      meals.push({ mealName: "Pre-Workout", calories: Math.round(totalCalories * 0.4), protein: Math.round(proteinGrams * 0.4), percentage: 40, description: "Fuel for training." });
      meals.push({ mealName: "Post-Workout", calories: Math.round(totalCalories * 0.6), protein: Math.round(proteinGrams * 0.6), percentage: 60, description: "Massive recovery meal." });
    } else {
      prePostCount = 2;
      otherCount = mealCount - 2;
      
      const prePostCals = (totalCalories * workoutCalPercentage) / 2;
      const prePostProtein = (proteinGrams * workoutCalPercentage) / 2;
      
      const otherCals = remainingCals / otherCount;
      const otherProtein = (proteinGrams * (1 - workoutCalPercentage)) / otherCount;
      
      for (let i = 1; i <= mealCount; i++) {
        if (i === 2) {
          meals.push({ mealName: "Pre-Workout", calories: Math.round(prePostCals), protein: Math.round(prePostProtein), percentage: Math.round((prePostCals/totalCalories)*100), description: "High carb/protein, low fat." });
        } else if (i === 3) {
          meals.push({ mealName: "Post-Workout", calories: Math.round(prePostCals), protein: Math.round(prePostProtein), percentage: Math.round((prePostCals/totalCalories)*100), description: "Glycogen replenishment." });
        } else {
          meals.push({ mealName: `Meal ${i > 3 ? i-2 : i}`, calories: Math.round(otherCals), protein: Math.round(otherProtein), percentage: Math.round((otherCals/totalCalories)*100), description: "Lighter maintenance meal." });
        }
      }
    }
  } else if (strategy === "carb_backload") {
    recommendation = "Carb Backloading shifts the majority of your daily calories (specifically carbohydrates) to the end of the day. This keeps insulin low during the active day to maximize fat burning, and replenishes glycogen while you sleep.";
    grade = "Fat-Loss Focused";
    
    if (mealCount === 2) {
      meals.push({ mealName: "Lunch (Break Fast)", calories: Math.round(totalCalories * 0.3), protein: Math.round(proteinGrams * 0.4), percentage: 30, description: "Protein & Fats, low carb." });
      meals.push({ mealName: "Dinner (Feast)", calories: Math.round(totalCalories * 0.7), protein: Math.round(proteinGrams * 0.6), percentage: 70, description: "Massive meal, high carbs." });
    } else if (mealCount === 3) {
      meals.push({ mealName: "Breakfast", calories: Math.round(totalCalories * 0.2), protein: Math.round(proteinGrams * 0.3), percentage: 20, description: "Light start." });
      meals.push({ mealName: "Lunch", calories: Math.round(totalCalories * 0.3), protein: Math.round(proteinGrams * 0.3), percentage: 30, description: "Moderate meal." });
      meals.push({ mealName: "Dinner", calories: Math.round(totalCalories * 0.5), protein: Math.round(proteinGrams * 0.4), percentage: 50, description: "Heavy backload." });
    } else {
      // 4, 5, 6 meals
      let currentPercent = 10; // start small
      let totalAssigned = 0;
      let totalProtAssigned = 0;
      
      for (let i = 1; i <= mealCount; i++) {
        let p = 0;
        let protP = 0;
        
        if (i === mealCount) {
          // Last meal gets the rest (usually huge)
          p = 100 - totalAssigned;
          protP = 100 - totalProtAssigned;
        } else {
          // Progressively larger
          p = Math.round(100 / mealCount) - (mealCount - i) * 3;
          if (p < 5) p = 5;
          protP = Math.round(100 / mealCount); // Keep protein mostly even
        }
        
        totalAssigned += p;
        totalProtAssigned += protP;
        
        meals.push({
          mealName: i === mealCount ? "Final Feast" : `Meal ${i}`,
          calories: Math.round(totalCalories * (p/100)),
          protein: Math.round(proteinGrams * (protP/100)),
          percentage: p,
          description: i === mealCount ? "Massive caloric backload." : "Light, protein-forward."
        });
      }
    }
  }

  const chartColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
  const chartData = meals.map((m, idx) => ({
    mealName: m.mealName,
    calories: m.calories,
    protein: m.protein,
    color: chartColors[idx % chartColors.length]
  }));

  const proteinPerMealAvg = proteinGrams / mealCount;

  const summaryStats = [
    { label: "Target Daily Calories", value: `${totalCalories} kcal`, colorClass: "text-foreground font-bold" },
    { label: "Daily Protein Target", value: `${proteinGrams}g`, colorClass: "text-primary font-bold" },
    { label: "Avg. Protein Per Meal", value: `${proteinPerMealAvg.toFixed(1)}g`, colorClass: proteinPerMealAvg >= 25 ? "text-green-500 font-medium" : "text-amber-500 font-medium" },
    { label: "Protocol Rating", value: grade, colorClass: "text-blue-500 font-medium" }
  ];

  return {
    meals,
    dailyProtein: proteinGrams,
    proteinPerMealAvg,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCalories: "2400",
  proteinGrams: "180",
  mealCount: "4" as "2" | "3" | "4" | "5" | "6",
  strategy: "even" as "even" | "workout_heavy" | "carb_backload"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.mealName}</p>
        <p className="text-muted-foreground">Calories: <span className="font-bold text-foreground">{payload[0].value} kcal</span></p>
        <p className="text-muted-foreground">Protein: <span className="font-bold text-foreground">{payload[0].payload.protein} g</span></p>
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

export default function MealFrequencyCalorieSplitCalculator() {
  // 4. Component State
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [proteinGrams, setProteinGrams] = useState(DEFAULTS.proteinGrams);
  const [mealCount, setMealCount] = useState<2 | 3 | 4 | 5 | 6>(parseInt(DEFAULTS.mealCount) as any);
  const [strategy, setStrategy] = useState<"even" | "workout_heavy" | "carb_backload">(DEFAULTS.strategy);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<SplitResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tc = parseInt(totalCalories);
    const p = parseInt(proteinGrams);

    if (tc < 1000) {
      setErrorMsg("Error: Total daily calories must be at least 1000 to safely divide into meals.");
      setResults(null);
      return;
    }
    if ((p * 4) > tc) {
      setErrorMsg("Error: Mathematical impossibility. The calories from your protein target exceed your total daily calories.");
      setResults(null);
      return;
    }

    const inputs: SplitInputs = {
      totalCalories: tc,
      proteinGrams: p,
      mealCount,
      strategy
    };
    setResults(calculateSplit(inputs));
  };

  const handleReset = () => {
    setTotalCalories(DEFAULTS.totalCalories);
    setProteinGrams(DEFAULTS.proteinGrams);
    setMealCount(parseInt(DEFAULTS.mealCount) as any);
    setStrategy(DEFAULTS.strategy);
    setErrorMsg("");
    
    setResults(calculateSplit({
      totalCalories: parseInt(DEFAULTS.totalCalories),
      proteinGrams: parseInt(DEFAULTS.proteinGrams),
      mealCount: parseInt(DEFAULTS.mealCount) as any,
      strategy: DEFAULTS.strategy
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCalories, proteinGrams, mealCount, strategy]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Meal Frequency Plan</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Does eating more frequently speed up my metabolism?", answer: "No. This is an outdated fitness myth. The thermic effect of food (the calories burned during digestion) is based on the total volume of food, not the frequency. Eating 2,000 calories in 2 meals burns the exact same amount of energy as eating 2,000 calories in 6 meals." },
    { question: "Why does the calculator focus on 'Protein per Meal'?", answer: "While meal frequency doesn't matter for fat loss, it matters significantly for muscle growth. To trigger Muscle Protein Synthesis (MPS), your body needs a 'leucine threshold'—usually requiring 25 to 40 grams of protein in a single sitting. Spreading protein too thin (e.g., 10g per meal) fails to trigger this growth response." },
    { question: "What is 'Carb Backloading'?", answer: "Carb backloading is a dietary strategy where you eat mostly fats and proteins during the active part of your day, keeping insulin levels low to promote fat oxidation. In the evening (or post-workout), you consume the vast majority of your daily carbohydrates to replenish glycogen stores and aid in sleep." },
    { question: "Is Intermittent Fasting (2 meals) optimal?", answer: "Intermittent fasting is excellent for fat loss and dietary adherence because it allows for two massive, highly satisfying meals. However, it is sub-optimal for maximizing muscle growth, as you are only triggering Muscle Protein Synthesis twice a day instead of 4 or 5 times." },
    { question: "Should I use the 'Pre/Post Workout' strategy?", answer: "If you are an athlete, powerlifter, or intense bodybuilder, yes. Training breaks down muscle and depletes glycogen. Supplying a massive influx of calories directly before and after the workout maximizes training intensity and drastically speeds up recovery compared to eating a large meal hours away from the gym." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Meal Frequency & Calorie Split Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Meal Frequency Calorie Split Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Utensils className="h-4 w-4" /> Daily Macro Distributor
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Divvy up your daily calorie and protein targets across multiple meals based on scientific distribution strategies.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="tcals" label="Total Daily Calories" value={totalCalories} onChange={setTotalCalories} suffix="kcal" />
              <CompactInput id="tprot" label="Total Protein" value={proteinGrams} onChange={setProteinGrams} suffix="grams" />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md -mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Desired Meal Frequency</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button key={num} type="button" onClick={() => setMealCount(num as any)} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${mealCount === num ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>
                    {num} <span className="hidden sm:inline">Meals</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Distribution Strategy</label>
              <select 
                value={strategy} 
                onChange={(e) => setStrategy(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="even">Even Split (Standard Bodybuilding)</option>
                <option value="workout_heavy">Peri-Workout Prioritized (Performance)</option>
                <option value="carb_backload">Carb Backloading (Fat Loss / Fasting)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Distribution
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card (The Plan) */}
                <div className="bg-card border border-border rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" /> Daily Meal Blueprint
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.meals.map((meal, idx) => (
                      <div key={idx} className="bg-secondary/30 border border-border p-3 rounded-md flex flex-col relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: results.chartData[idx].color }}></div>
                        <div className="pl-2">
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{meal.mealName}</div>
                          <div className="flex items-baseline gap-1 mb-1">
                            <span className="text-2xl font-black text-foreground">{meal.calories}</span>
                            <span className="text-xs font-medium text-muted-foreground">kcal</span>
                          </div>
                          <div className="text-sm font-bold text-primary mb-2">
                            {meal.protein}g Protein
                          </div>
                          <div className="text-[10px] leading-snug text-muted-foreground">
                            {meal.percentage}% of daily intake. {meal.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Protocol Statistics</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    {results.proteinPerMealAvg < 20 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 p-3 rounded-md text-xs font-medium flex items-start gap-2">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>Warning: Your protein per meal is below 20g. This is generally insufficient to maximize Muscle Protein Synthesis. Consider eating fewer meals, or increasing total daily protein.</p>
                      </div>
                    )}
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Caloric Load Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="mealName" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Utensils className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your total daily calories and macro targets to generate an optimized meal distribution strategy.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Meal Frequency Calorie Split</h2>
            <p>Once you have calculated your Total Daily Energy Expenditure (TDEE) and set a caloric target for cutting or bulking, you face the practical reality of execution: <em>How do I actually eat all this food?</em> Historically, the fitness industry was plagued by the myth that you had to eat six small meals a day to "stoke the metabolic fire." Modern science has thoroughly debunked this. The thermic effect of food is based entirely on the total caloric volume consumed, not how many times you sit down to eat.</p>
            <p>However, meal frequency and caloric distribution still matter massively for two critical reasons: <strong>Muscle Protein Synthesis (MPS)</strong> and <strong>Dietary Adherence</strong>. The <strong>Meal Frequency Calorie Split Calculator</strong> allows you to take your daily macroscopic targets and chop them up into a sustainable, scientifically optimized daily blueprint.</p>

            <h2 className="text-2xl font-bold mb-3">The Science of Muscle Protein Synthesis (MPS)</h2>
            <p>While fat loss is dictated entirely by your 24-hour net caloric balance, building (and preserving) muscle tissue is highly dependent on meal timing. Muscle Protein Synthesis is a biological switch. To flip that switch "on," your body requires a specific threshold of the amino acid <em>leucine</em>, which typically requires consuming at least 25 to 30 grams of high-quality protein in a single sitting.</p>
            <p>If your daily protein target is 150 grams, and you split that into 6 meals of 25 grams each, you are "pulsing" the MPS switch 6 times a day. This is the classic <strong>"Even Split"</strong> bodybuilding approach. However, if you attempt to eat 6 meals a day but your daily protein target is only 90 grams (yielding 15 grams per meal), you will consistently fail to reach the leucine threshold, and your body will not build muscle optimally. In this scenario, the calculator will warn you, suggesting you condense your eating into 3 larger meals (yielding 30 grams of protein each) to trigger the anabolic response.</p>

            <h2 className="text-2xl font-bold mb-3">Strategy 1: The Even Split (Classic Bodybuilding)</h2>
            <p>The "Even Split" strategy takes your total calories and protein and divides them perfectly evenly across your selected meal count. For decades, this has been the gold standard for competitive bodybuilders and physique athletes.</p>
            <p><strong>The Pros:</strong> Eating a perfectly balanced meal every 3 to 4 hours keeps blood sugar incredibly stable. You will not experience massive insulin spikes or the subsequent crashes that lead to lethargy and cravings. Furthermore, by constantly supplying the bloodstream with amino acids, you theoretically keep the body in a perpetual state of anabolism (muscle building).</p>
            <p><strong>The Cons:</strong> It is incredibly tedious. Eating 5 or 6 times a day requires massive amounts of food preparation, carrying Tupperware everywhere, and living your life by the clock. If you work a standard 9-to-5 job with strict hours, this strategy is highly impractical.</p>

            <h2 className="text-2xl font-bold mb-3">Strategy 2: Peri-Workout Prioritization (Performance Focused)</h2>
            <p>If you are an athlete, a powerlifter, or someone who engages in brutal, high-intensity workouts, your daily energy demands are heavily skewed toward your training window. The "Peri-Workout" strategy addresses this by funneling 50% of your total daily calories directly into your pre-workout and post-workout meals.</p>
            <p><strong>Pre-Workout Fuel:</strong> By allocating a massive chunk of calories (specifically carbohydrates) to the meal directly preceding your workout, you fill intra-muscular glycogen stores. This allows you to push heavier weight for more repetitions without 'bonking' (running out of energy).</p>
            <p><strong>Post-Workout Recovery:</strong> Training breaks down muscle tissue. By supplying a massive influx of protein and fast-digesting carbohydrates immediately after training, you slam the brakes on muscle catabolism and force nutrients into the depleted muscle cells via an insulin spike.</p>
            <p>The remaining meals in the day are kept relatively light, acting merely as maintenance fuel while you sit at a desk or recover on the couch.</p>

            <h2 className="text-2xl font-bold mb-3">Strategy 3: Carb Backloading (Fat Loss and Fasting)</h2>
            <p>Carb Backloading is an advanced dietary protocol popularized by strength athletes looking to stay incredibly lean while still eating large, satisfying meals. This strategy flips traditional nutritional advice on its head by shifting the vast majority of your daily calories to the end of the day.</p>
            <p><strong>How it works:</strong> During the active part of your day (morning and afternoon), you eat very light meals consisting entirely of protein and healthy fats. By virtually eliminating carbohydrates during the day, your insulin levels remain flatline low. In the absence of insulin, your body is biologically forced to burn stored body fat for energy. Then, in the evening, you consume a massive "Feast" containing all of your daily carbohydrates.</p>
            <p><strong>The Benefits:</strong> For many people, eating a massive, carbohydrate-heavy meal at dinner improves sleep quality (by promoting serotonin release) and provides a massive psychological reward after a long day of disciplined eating. If you select "2 Meals" and "Carb Backloading" in our calculator, you are essentially mimicking the popular 16:8 Intermittent Fasting protocol, skipping breakfast and breaking your fast with a light lunch before a massive dinner.</p>

            <h2 className="text-2xl font-bold mb-3">Which Frequency is Right For You?</h2>
            <p>The best meal frequency is the one you can stick to effortlessly for the next 5 years. There is no magic pill.</p>
            <ul>
              <li><strong>2 Meals (Fasting):</strong> Perfect for busy professionals who hate cooking, want to save time in the morning, and enjoy eating massive, restaurant-sized meals while remaining in a caloric deficit.</li>
              <li><strong>3-4 Meals (The Standard):</strong> The most socially acceptable and practical approach. It fits perfectly into standard societal norms (Breakfast, Lunch, Dinner, plus one protein shake). It strikes the perfect balance between triggering MPS pulses and maintaining dietary sanity.</li>
              <li><strong>5-6 Meals (The Competitor):</strong> Necessary only for massive individuals (250+ lbs) who must consume 4,000+ calories a day to maintain muscle mass. Eating 4,000 calories across 3 meals requires consuming over 1,300 calories per sitting, which causes severe digestive distress. Splitting it into 6 meals is simply a mechanical necessity to digest that volume of food.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Consistency Trumps Optimization</h2>
            <p>Do not let the pursuit of the "perfect" meal schedule derail your progress. The hierarchy of nutritional importance is rigid: Total Calories dictate weight, Total Protein dictates muscle preservation, and Meal Frequency simply optimizes the process. Use the calculator to experiment with different distributions. If you find yourself starving and miserable on an even split, try carb backloading. If you lack energy in the gym, try peri-workout prioritization. Find the blueprint that fits your lifestyle, and execute it consistently.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/meal-frequency-calorie-split-calculator" />
          <PopularCalculators exclude="/calculator/meal-frequency-calorie-split-calculator" />
        </div>
      </div>
    </>
  );
}
