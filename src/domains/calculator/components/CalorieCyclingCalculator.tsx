"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, ActivitySquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface CyclingInputs {
  tdee: number;
  goal: "cut" | "maintain" | "bulk";
  aggression: number; // Percentage 10-25%
  highDaysCount: number; // 1-6
}

interface CyclingResults {
  weeklyTarget: number;
  highDayCalories: number;
  lowDayCalories: number;
  dailyAverage: number;
  
  grade: string;
  recommendation: string;

  chartData: { day: string; calories: number; isHigh: boolean }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateCycling = (inputs: CyclingInputs): CyclingResults | null => {
  const { tdee, goal, aggression, highDaysCount } = inputs;
  
  if (tdee <= 1000 || highDaysCount < 1 || highDaysCount > 6) return null;

  let weeklyTarget = tdee * 7;
  let dailyModifier = 0;

  if (goal === "cut") {
    dailyModifier = -(tdee * (aggression / 100));
    weeklyTarget = (tdee + dailyModifier) * 7;
  } else if (goal === "bulk") {
    dailyModifier = (tdee * (aggression / 100));
    weeklyTarget = (tdee + dailyModifier) * 7;
  }

  const lowDaysCount = 7 - highDaysCount;

  // Smart Distribution Algorithm
  let highDayCalories = 0;
  let lowDayCalories = 0;

  if (goal === "cut") {
    // During a cut, High days are typically set at Maintenance to fuel workouts.
    // The deficit is entirely generated on the low days.
    highDayCalories = tdee; 
    lowDayCalories = (weeklyTarget - (highDayCalories * highDaysCount)) / lowDaysCount;
    
    // Safety check: if low day drops dangerously low (below 1200 or BMR territory)
    if (lowDayCalories < 1200) {
      // Re-distribute to make it mathematically possible without starving
      lowDayCalories = 1200;
      highDayCalories = (weeklyTarget - (lowDayCalories * lowDaysCount)) / highDaysCount;
    }
  } else if (goal === "bulk") {
    // During a bulk, High days are a massive surplus to build muscle.
    // Low days are set near maintenance to prevent fat spillover.
    lowDayCalories = tdee;
    highDayCalories = (weeklyTarget - (lowDayCalories * lowDaysCount)) / highDaysCount;
  } else {
    // Maintenance / Recomp
    // High days are a moderate surplus (+300), Low days are a moderate deficit
    highDayCalories = tdee + 300;
    lowDayCalories = (weeklyTarget - (highDayCalories * highDaysCount)) / lowDaysCount;
  }

  const dailyAverage = weeklyTarget / 7;

  let recommendation = "";
  if (goal === "cut") {
    recommendation = "Place your High Days on your heaviest, most neurologically demanding training days (like heavy squats or deadlifts) to maximize performance. Place Low Days on rest days or light cardio days.";
  } else if (goal === "bulk") {
    recommendation = "By keeping Low Days near maintenance, you prevent excessive fat accumulation on rest days. Eat your massive High Day surplus directly surrounding your training window.";
  } else {
    recommendation = "This protocol forces 'body recomposition'. You are eating in a surplus to build muscle on training days, and in a deficit to burn fat on rest days, while staying weight-neutral overall.";
  }

  // Generate standard 7-day schedule (e.g. M/W/F High)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartData = [];
  
  // Simple distribution pattern
  let highDaysAssigned = 0;
  for (let i = 0; i < 7; i++) {
    // Alternate logic for a clean chart
    const shouldBeHigh = (i % 2 === 0 && highDaysAssigned < highDaysCount) || 
                         (i === 5 && highDaysCount >= 4) ||
                         (i === 6 && highDaysCount >= 5);
                         
    if (shouldBeHigh && highDaysAssigned < highDaysCount) {
      chartData.push({ day: days[i], calories: Math.round(highDayCalories), isHigh: true });
      highDaysAssigned++;
    } else {
      chartData.push({ day: days[i], calories: Math.round(lowDayCalories), isHigh: false });
    }
  }

  const summaryStats = [
    { label: "High Day Target", value: `${Math.round(highDayCalories)} kcal`, colorClass: "text-primary font-bold" },
    { label: "Low Day Target", value: `${Math.round(lowDayCalories)} kcal`, colorClass: "text-blue-500 font-bold" },
    { label: "Weekly Net Calories", value: `${Math.round(weeklyTarget)} kcal` },
    { label: "Average Daily Intake", value: `${Math.round(dailyAverage)} kcal`, colorClass: "text-muted-foreground" },
    { label: "Protocol", value: goal === "cut" ? "Deficit Cycling" : goal === "bulk" ? "Surplus Cycling" : "Recomposition", colorClass: "font-medium" }
  ];

  return {
    weeklyTarget,
    highDayCalories,
    lowDayCalories,
    dailyAverage,
    grade: "Optimized",
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  tdee: "2500",
  goal: "cut" as const,
  aggression: "20",
  highDaysCount: "3"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const isHigh = payload[0].payload.isHigh;
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: isHigh ? "hsl(var(--primary))" : "#3b82f6" }}>
          {payload[0].payload.day} ({isHigh ? "Training / High" : "Rest / Low"})
        </p>
        <p className="text-muted-foreground">{payload[0].value} kcal</p>
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

export default function CalorieCyclingCalculator() {
  // 4. Component State
  const [tdee, setTdee] = useState(DEFAULTS.tdee);
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">(DEFAULTS.goal);
  const [aggression, setAggression] = useState(DEFAULTS.aggression);
  const [highDaysCount, setHighDaysCount] = useState(DEFAULTS.highDaysCount);
  
  const [results, setResults] = useState<CyclingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: CyclingInputs = {
      tdee: parseInt(tdee) || 0,
      goal,
      aggression: parseInt(aggression) || 0,
      highDaysCount: parseInt(highDaysCount) || 3
    };
    setResults(calculateCycling(inputs));
  };

  const handleReset = () => {
    setTdee(DEFAULTS.tdee);
    setGoal(DEFAULTS.goal);
    setAggression(DEFAULTS.aggression);
    setHighDaysCount(DEFAULTS.highDaysCount);
    
    setResults(calculateCycling({
      tdee: parseInt(DEFAULTS.tdee),
      goal: DEFAULTS.goal,
      aggression: parseInt(DEFAULTS.aggression),
      highDaysCount: parseInt(DEFAULTS.highDaysCount)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdee, goal, aggression, highDaysCount]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Calorie Cycling Protocol</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is Calorie Cycling?", answer: "Calorie cycling (also known as zig-zag dieting) is an advanced nutritional strategy where you eat more calories on training days (High Days) and fewer calories on rest days (Low Days). This allows you to fuel intense workouts while maintaining a net weekly caloric deficit or surplus." },
    { question: "Why is cycling better than a flat daily target?", answer: "If you eat a flat 2,000 calories every day during a cut, you might feel lethargic on a heavy leg day. By cycling, you might eat 2,500 calories on leg day to maximize performance, and 1,600 calories on a rest day. You achieve the exact same weekly fat loss, but with vastly superior gym performance." },
    { question: "Do my macronutrients change on High Days?", answer: "Yes, ideally. Most bodybuilders keep their protein intake constant every day. The extra calories on High Days should come entirely from carbohydrates to replenish muscle glycogen stores. On Low Days, carbs drop significantly while fats may increase slightly." },
    { question: "Can I build muscle and lose fat at the same time?", answer: "Yes, this is called 'Body Recomposition'. If you select 'Maintenance', the calculator assigns a surplus on training days (to signal muscle growth) and a deficit on rest days (to burn fat). Because the weekly net calories equal your TDEE, your total body weight stays the same, but your ratio of muscle-to-fat improves." },
    { question: "Is my TDEE the same as my BMR?", answer: "No. Basal Metabolic Rate (BMR) is what you burn in a coma. Total Daily Energy Expenditure (TDEE) is your BMR plus all physical activity (NEAT, exercise, digestion). You must input your TDEE into this calculator, not your BMR." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie Cycling Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Cycling Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ActivitySquare className="h-4 w-4" /> Non-Linear Protocol
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Optimize gym performance and metabolic adaptation by fluctuating your daily calories while hitting precise weekly net targets.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tdee" label="Total Daily Energy Expenditure (Maintenance)" value={tdee} onChange={setTdee} suffix="kcal" />
            </div>

            <div className="flex flex-col mb-1">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Primary Physique Goal</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setGoal("cut")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${goal === "cut" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Fat Loss</button>
                <button type="button" onClick={() => setGoal("maintain")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${goal === "maintain" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Recomposition</button>
                <button type="button" onClick={() => setGoal("bulk")} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all ${goal === "bulk" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Muscle Gain</button>
              </div>
            </div>

            {goal !== "maintain" && (
              <div className="grid grid-cols-1 gap-4 mt-2">
                <CompactInput id="aggression" label={`Aggression / Target ${goal === 'cut' ? 'Deficit' : 'Surplus'}`} value={aggression} onChange={setAggression} suffix="%" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 mt-2">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Number of Training (High) Days</label>
                <select 
                  value={highDaysCount} 
                  onChange={(e) => setHighDaysCount(e.target.value)}
                  className="w-full h-10 px-3 py-1 text-base rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
                >
                  <option value="1">1 Day per week</option>
                  <option value="2">2 Days per week</option>
                  <option value="3">3 Days per week</option>
                  <option value="4">4 Days per week</option>
                  <option value="5">5 Days per week</option>
                  <option value="6">6 Days per week</option>
                </select>
              </div>
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
                
                {/* 1. Primary Result Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-primary/10 border border-primary rounded-lg p-5 relative overflow-hidden">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">Training (High) Day</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-extrabold tracking-tight text-foreground">{Math.round(results.highDayCalories)}</div>
                      <div className="text-sm font-bold text-muted-foreground">kcal</div>
                    </div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-5 relative overflow-hidden">
                    <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-blue-500">Rest (Low) Day</div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-4xl font-extrabold tracking-tight text-foreground">{Math.round(results.lowDayCalories)}</div>
                      <div className="text-sm font-bold text-muted-foreground">kcal</div>
                    </div>
                  </div>
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
                    <h3 className="text-base font-bold mb-4 w-full text-left">Weekly Distribution</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <ReferenceLine y={tdee} stroke="hsl(var(--foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'TDEE', fill: 'hsl(var(--foreground))', fontSize: 10 }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isHigh ? "hsl(var(--primary))" : "#3b82f6"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your maintenance calories and training schedule to generate your non-linear zig-zag protocol.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Calorie Cycling Calculator</h2>
            <p>Traditional diet plans typically prescribe a "linear" or flat caloric target. For example, if your Total Daily Energy Expenditure (TDEE) is 2,500 calories and you want to lose fat, a standard diet might tell you to eat 2,000 calories every single day. While this mathematically guarantees fat loss, it ignores a fundamental reality of fitness: your energy demands are not the same every day.</p>
            <p>On a Sunday when you are sitting on the couch binge-watching television, your body does not require massive amounts of energy. However, on a Tuesday when you are performing heavy barbell squats, your central nervous system and muscular system demand significant fuel. If you eat a flat 2,000 calories on both days, you will feel perfectly fine on the couch, but you will feel lethargic, weak, and flat during your squat session. The <strong>Calorie Cycling Calculator</strong> (also known as zig-zag dieting) solves this problem by allocating your weekly caloric allowance strategically.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Net Weekly Calories</h2>
            <p>The human body does not operate on a strict 24-hour clock resetting precisely at midnight. Your metabolism functions over longer timelines. Because of this, <strong>Net Weekly Calories</strong> are far more important than any single daily total.</p>
            <p>Using our previous example of a 2,000-calorie daily cut, your Net Weekly Calorie Target is 14,000 calories (2,000 x 7). Calorie cycling simply takes that 14,000-calorie bucket and distributes it unevenly. You might eat 2,500 calories (maintenance) on the three days you train heavy, and drop to 1,625 calories on your four rest days. (3 x 2,500 = 7,500) + (4 x 1,625 = 6,500) = 14,000 weekly calories. The fat loss result is exactly the same, but the gym performance and muscle retention are vastly superior.</p>

            <h2 className="text-2xl font-bold mb-3">Deficit Cycling (Cutting / Fat Loss)</h2>
            <p>When you select "Fat Loss" in the calculator, the algorithm implements a protocol specifically designed to preserve lean muscle mass while stripping away adipose tissue. During a cut, your body is in a state of starvation, making it prime to catabolize (break down) muscle tissue for energy.</p>
            <p>To combat this, the calculator sets your "High Days" equal to your TDEE (maintenance). By eating at maintenance on your heaviest training days, you provide the glycogen necessary to maintain strength and the protein necessary to signal muscle preservation. The entire fat loss deficit is generated on your "Low Days" (rest days), when the lack of calories won't negatively impact a workout. This forces the body to tap into stored fat on rest days while protecting muscle on training days.</p>

            <h2 className="text-2xl font-bold mb-3">Surplus Cycling (Bulking / Muscle Gain)</h2>
            <p>When the goal is building muscle ("Bulking"), a common mistake is eating in a massive surplus every single day. This "dirty bulk" approach leads to excessive, unnecessary fat gain. Muscle protein synthesis (the process of building new tissue) is elevated for roughly 24 to 48 hours after a workout. Eating a massive surplus on a day you haven't trained in 72 hours does not build muscle; it just stores fat.</p>
            <p>If you select "Muscle Gain", the calculator sets your Low Days at maintenance. This ensures you do not gain body fat on your rest days. It then concentrates the entire weekly caloric surplus into your High Days. By surrounding your workouts with a massive influx of calories (specifically carbohydrates and protein), you maximize the anabolic response exactly when your body is primed to utilize it.</p>

            <h2 className="text-2xl font-bold mb-3">The Recomposition Protocol (Maintenance)</h2>
            <p>Body recomposition—the holy grail of fitness—involves losing fat and building muscle simultaneously. Traditional science argued this was impossible because fat loss requires a deficit and muscle gain requires a surplus. However, calorie cycling makes this possible by creating micro-cycles of deficits and surpluses within the same week.</p>
            <p>If you select "Recomposition", the calculator ensures your Net Weekly Calories exactly match your weekly TDEE. This means your weight on the scale will not change. However, on training days, it prescribes a moderate surplus (e.g., +300 calories) to fuel muscle growth. On rest days, it prescribes a deficit to force fat burning. Over several months, your body weight remains identical, but your body fat percentage drops while your muscle mass increases.</p>

            <h2 className="text-2xl font-bold mb-3">How to Manipulate Your Macronutrients</h2>
            <p>Calorie cycling is most effective when paired with Macronutrient Cycling (specifically Carb Cycling). While the total calories change drastically from a High Day to a Low Day, your protein and fat intake should remain relatively stable. The fluctuation should be driven almost entirely by carbohydrates.</p>
            <p><strong>On High Days:</strong> Keep protein at your standard target (e.g., 1g per pound of body weight). Keep fats low-to-moderate. Fill the massive remaining calorie gap entirely with carbohydrates (rice, potatoes, oats, pasta). This fills the intra-muscular glycogen stores required for heavy lifting.</p>
            <p><strong>On Low Days:</strong> Keep protein at your standard target. Increase healthy fats slightly to aid in hormone production and satiety. Drastically slash your carbohydrate intake. Because you are resting, you do not need fast-acting energy, and dropping carbs keeps insulin levels low, optimizing the fat-burning environment.</p>

            <h2 className="text-2xl font-bold mb-3">Psychological Benefits of Zig-Zag Dieting</h2>
            <p>Beyond the physiological benefits, calorie cycling provides a massive psychological advantage. Diet fatigue—the mental exhaustion of chronic caloric restriction—is the number one reason diets fail. Eating a flat 1,800 calories every single day for 12 weeks is soul-crushing.</p>
            <p>With calorie cycling, you are never more than a day or two away from a "High Day." If you are suffering through a grueling 1,500-calorie Low Day on a Sunday, you know that Monday is a training day where you get to eat a massive, satisfying 2,500-calorie meal. This light at the end of the tunnel dramatically improves dietary adherence and completely eliminates the desire to "cheat" on the diet.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Advanced Nutritional Periodization</h2>
            <p>Calorie cycling is not a magic trick; it still abides by the immutable laws of thermodynamics. However, it represents an advanced form of nutritional periodization. By aligning your energy intake with your actual physical output, you optimize hormones, preserve lean tissue, maximize gym performance, and drastically improve your relationship with food. Use the calculator above to map out your week, hit your net targets, and watch your physique transform.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-cycling-calculator" />
          <PopularCalculators exclude="/calculator/calorie-cycling-calculator" />
        </div>
      </div>
    </>
  );
}
