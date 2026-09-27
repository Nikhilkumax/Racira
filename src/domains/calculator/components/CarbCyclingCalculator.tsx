"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface CarbCyclingInputs {
  weight: number;
  unit: "lbs" | "kg";
  goal: "cut" | "maintain" | "bulk";
  schedule: ("high" | "med" | "low")[]; // 7 days (Mon-Sun)
}

interface CarbCyclingResults {
  highCarbTarget: number;
  medCarbTarget: number;
  lowCarbTarget: number;
  
  grade: string;
  recommendation: string;

  chartData: { day: string; carbs: number; type: string; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateCarbCycling = (inputs: CarbCyclingInputs): CarbCyclingResults | null => {
  const { weight, unit, goal, schedule } = inputs;
  
  if (weight <= 0) return null;

  const weightLbs = unit === "lbs" ? weight : weight * 2.20462;

  // Carb multipliers (grams per pound of bodyweight)
  let highMult = 0;
  let medMult = 0;
  let lowMult = 0;

  let grade = "";
  let recommendation = "";

  if (goal === "cut") {
    highMult = 1.5;
    medMult = 1.0;
    lowMult = 0.5;
    grade = "Fat Loss / Depletion Strategy";
    recommendation = "This protocol is heavily biased toward fat loss. By keeping your rest days at just 0.5g of carbs per pound of body weight, you keep insulin low and force your body to burn fat. High days provide just enough glycogen to survive heavy training sessions without derailing the deficit.";
  } else if (goal === "maintain") {
    highMult = 2.0;
    medMult = 1.5;
    lowMult = 0.75;
    grade = "Recomposition Strategy";
    recommendation = "This is a body recomposition protocol. You are consuming enough carbohydrates on training days to potentially build muscle, while dropping them low enough on rest days to slowly chip away at body fat.";
  } else {
    // bulk
    highMult = 3.0;
    medMult = 2.0;
    lowMult = 1.0;
    grade = "Anabolic / Hypertrophy Strategy";
    recommendation = "This protocol floods the muscles with glycogen to maximize performance and anabolism. Because you are bulking, even your 'Low' days still contain a moderate amount of carbohydrates to prevent muscle catabolism.";
  }

  const highCarbTarget = weightLbs * highMult;
  const medCarbTarget = weightLbs * medMult;
  const lowCarbTarget = weightLbs * lowMult;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const chartData = schedule.map((type, idx) => {
    let carbs = 0;
    let color = "";
    if (type === "high") { carbs = highCarbTarget; color = "#ef4444"; } // Red for heavy/high
    else if (type === "med") { carbs = medCarbTarget; color = "#f59e0b"; } // Amber for med
    else { carbs = lowCarbTarget; color = "#3b82f6"; } // Blue for low/rest

    return {
      day: days[idx],
      carbs: Math.round(carbs),
      type: type.toUpperCase(),
      color
    };
  });

  const summaryStats = [
    { label: "High Day Target", value: `${Math.round(highCarbTarget)}g`, colorClass: "text-red-500 font-bold" },
    { label: "Medium Day Target", value: `${Math.round(medCarbTarget)}g`, colorClass: "text-amber-500 font-bold" },
    { label: "Low Day Target", value: `${Math.round(lowCarbTarget)}g`, colorClass: "text-blue-500 font-bold" },
    { label: "Protocol Base", value: grade, colorClass: "font-medium" }
  ];

  return {
    highCarbTarget: Math.round(highCarbTarget),
    medCarbTarget: Math.round(medCarbTarget),
    lowCarbTarget: Math.round(lowCarbTarget),
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weight: "180",
  unit: "lbs" as const,
  goal: "cut" as const,
  schedule: ["high", "med", "low", "high", "med", "low", "low"] as ("high"|"med"|"low")[]
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.day} ({payload[0].payload.type} Day)</p>
        <p className="text-muted-foreground">Target: <span className="font-bold text-foreground">{payload[0].value}g</span> Carbs</p>
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

export default function CarbCyclingCalculator() {
  // 4. Component State
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [goal, setGoal] = useState<"cut" | "maintain" | "bulk">(DEFAULTS.goal);
  const [schedule, setSchedule] = useState<("high"|"med"|"low")[]>([...DEFAULTS.schedule]);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CarbCyclingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);

    if (w <= 0) {
      setErrorMsg("Error: Please enter a valid body weight.");
      setResults(null);
      return;
    }

    const inputs: CarbCyclingInputs = {
      weight: w,
      unit,
      goal,
      schedule
    };
    setResults(calculateCarbCycling(inputs));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setGoal(DEFAULTS.goal);
    setSchedule([...DEFAULTS.schedule]);
    setErrorMsg("");
    
    setResults(calculateCarbCycling({
      weight: parseFloat(DEFAULTS.weight),
      unit: DEFAULTS.unit,
      goal: DEFAULTS.goal,
      schedule: [...DEFAULTS.schedule]
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSchedule = (index: number, val: "high" | "med" | "low") => {
    const newSchedule = [...schedule];
    newSchedule[index] = val;
    setSchedule(newSchedule);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carb Cycling Protocol</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is Carb Cycling?", answer: "Carb cycling is an advanced nutritional strategy where you alternate the amount of carbohydrates you eat on a daily or weekly basis. Instead of eating a flat 200g of carbs every day, you might eat 300g on a heavy leg day, and drop to 75g on a rest day. This manipulates insulin levels to maximize fat burning while still fueling intense workouts." },
    { question: "Do my protein and fat change?", answer: "In a standard carb cycling protocol, your Protein remains high and constant every single day. When your carbs go UP (High days), your fats should go DOWN to keep total calories in check. When your carbs go DOWN (Low days), your fats go UP slightly to provide satiety and hormone support." },
    { question: "Why do I need 'Low' carb days?", answer: "Low carb days are the fat-burning engine of the protocol. By drastically reducing carbohydrates, your body is forced to deplete its glycogen stores. Once glycogen is depleted, insulin levels drop, and the body shifts to burning stored body fat for energy. Low days are best placed on rest days or light cardio days." },
    { question: "What should I do on a 'High' carb day?", answer: "High days are meant to refuel the glycogen you depleted on your low days. These days should always align with your most neurologically demanding, heavy lifting sessions (like Squats or Deadlifts). The massive influx of carbs spikes insulin, which shuttles nutrients into the muscles, preventing catabolism and driving performance." },
    { question: "Is Carb Cycling better than a standard diet?", answer: "Mathematically, fat loss is dictated by your net weekly caloric deficit. If weekly calories are identical, a flat diet and a carb cycling diet will yield similar fat loss. However, carb cycling is vastly superior for preserving gym performance, maintaining muscle mass during a cut, and preventing metabolic adaptation." }
  ];

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carb Cycling Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carb Cycling Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Activity className="h-4 w-4" /> Glycogen Periodization
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Map your carbohydrate intake directly to your physical output. Flood the muscles on training days; starve the fat cells on rest days.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="cw" label="Current Body Weight" value={weight} onChange={setWeight} />
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">&nbsp;</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setUnit("lbs")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "lbs" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>LBS</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "kg" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>KG</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Primary Physique Goal</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border">
                <button type="button" onClick={() => setGoal("cut")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${goal === "cut" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Fat Loss</button>
                <button type="button" onClick={() => setGoal("maintain")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${goal === "maintain" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Recomp</button>
                <button type="button" onClick={() => setGoal("bulk")} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${goal === "bulk" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Muscle Gain</button>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 border-t border-border pt-4">
              <label className="text-sm font-semibold text-foreground mb-1">Weekly Training Schedule</label>
              <p className="text-[10px] text-muted-foreground mb-2">Assign 'High' to your heaviest lifting days (e.g., Legs/Back). Assign 'Low' to rest days or pure cardio.</p>
              
              <div className="grid grid-cols-2 gap-2">
                {dayLabels.map((day, idx) => (
                  <div key={day} className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-md border border-border">
                    <span className="w-10 text-xs font-bold text-muted-foreground">{day}</span>
                    <select 
                      value={schedule[idx]}
                      onChange={(e) => updateSchedule(idx, e.target.value as any)}
                      className="flex-1 h-7 px-2 py-0 text-xs font-medium rounded border border-input bg-background focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="high">High (Heavy Lift)</option>
                      <option value="med">Med (Standard Lift)</option>
                      <option value="low">Low (Rest / Cardio)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Cards */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 flex flex-col justify-center text-center shadow-sm relative">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mb-1">High Day Target</div>
                    <div className="text-3xl font-black text-foreground">{results.highCarbTarget}</div>
                    <div className="text-xs font-medium text-red-500/80">grams of Carbs</div>
                  </div>
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 flex flex-col justify-center text-center shadow-sm relative">
                    <button onClick={handlePrint} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Med Day Target</div>
                    <div className="text-3xl font-black text-foreground">{results.medCarbTarget}</div>
                    <div className="text-xs font-medium text-amber-500/80">grams of Carbs</div>
                  </div>
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4 flex flex-col justify-center text-center shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Low Day Target</div>
                    <div className="text-3xl font-black text-foreground">{results.lowCarbTarget}</div>
                    <div className="text-xs font-medium text-blue-500/80">grams of Carbs</div>
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
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Strategy:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">7-Day Periodization Map</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="carbs" radius={[4, 4, 0, 0]} maxBarSize={40}>
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
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight and map your weekly training intensity to generate a custom carbohydrate periodization protocol.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Carb Cycling Calculator</h2>
            <p>Traditional diets operate on a linear model: you eat the exact same amount of food and the exact same macronutrient ratios every single day until you reach your goal. While this works mathematically, it ignores a fundamental biological reality—your energy expenditure is not linear. On a Tuesday, you might endure a brutal 90-minute weightlifting session that drains your muscular glycogen. On a Wednesday, you might sit at a desk for nine hours and do nothing.</p>
            <p>If you eat a massive amount of carbohydrates on Wednesday (your rest day), those excess carbs have nowhere to go; your glycogen tanks are already full from sitting, so the excess energy is highly likely to be stored as body fat. Conversely, if you eat a low-carb diet on Tuesday (your heavy training day), you will suffer from terrible gym performance and risk muscle catabolism. <strong>Carb Cycling</strong> solves this by periodizing your nutrition to match your physical output. Our Carb Cycling Calculator allows you to map your carbohydrate intake directly to your weekly training intensity.</p>

            <h2 className="text-2xl font-bold mb-3">The Biological Mechanisms of Carb Cycling</h2>
            <p>Carbohydrates are the body's preferred source of fast-acting energy. When you consume carbs (like rice, potatoes, or fruit), your digestive system breaks them down into glucose. The pancreas then releases insulin, a highly anabolic storage hormone, to shuttle that glucose out of the bloodstream and into your muscle cells and liver, where it is stored as <em>glycogen</em>.</p>
            <p>This process is fantastic for building muscle and fueling heavy lifts. However, insulin is a double-edged sword. When insulin levels are high, <strong>fat oxidation (fat burning) is biologically halted</strong>. Your body will not burn stored body fat if it has readily available glucose in the bloodstream. Carb cycling exploits this mechanism by creating distinct hormonal environments on different days.</p>

            <h2 className="text-2xl font-bold mb-3">The Triad of Carb Cycling Days</h2>
            <p>A standard carb cycling protocol utilizes three distinct types of days. The specific gram targets for each day are calculated based on your body weight and primary goal (fat loss vs. muscle gain).</p>

            <h3>1. The High Carb Day (The Refeed)</h3>
            <p>High Carb days are designed to fully replenish your muscular glycogen stores and spike your insulin levels. Because insulin is highly anabolic, it forces nutrients into the muscle cells, triggering repair and preventing the breakdown of muscle tissue (catabolism) that normally occurs during a caloric deficit.</p>
            <p><strong>When to use:</strong> Place High Carb days exclusively on your most neurologically demanding training days. For most athletes, this means heavy Leg days (squats, deadlifts) or heavy Back days. You must earn these carbs through intense physical output.</p>

            <h3>2. The Medium Carb Day (The Standard)</h3>
            <p>Medium Carb days provide just enough glucose to fuel a standard, moderate-intensity workout without spilling over into excess fat storage. They keep you sane and energetic without spiking insulin to the extreme levels seen on High days.</p>
            <p><strong>When to use:</strong> Use Medium days for standard training sessions (e.g., Arms, Shoulders, or Chest isolation work). These workouts do not deplete massive amounts of systemic glycogen, so they do not require a massive refeed.</p>

            <h3>3. The Low Carb Day (The Fat Burner)</h3>
            <p>Low Carb days are the engine of fat loss in this protocol. By drastically restricting carbohydrate intake, you force your body to deplete its remaining glycogen stores. Once glycogen is low, insulin levels plummet. In this low-insulin environment, the body is forced to shift its primary fuel source, opening the fat cells and oxidizing stored body fat for energy.</p>
            <p><strong>When to use:</strong> Low days should be strictly reserved for complete rest days or days where you only perform low-intensity steady-state (LISS) cardiovascular exercise (like walking). Because you are not lifting heavy weights, you do not need fast-acting glucose.</p>

            <h2 className="text-2xl font-bold mb-3">How to Manipulate Protein and Fat</h2>
            <p>The Carb Cycling Calculator provides your precise carbohydrate targets, but to execute the protocol correctly, you must also manipulate your Protein and Fats to keep your overall calories in check.</p>
            <p><strong>Protein remains constant:</strong> Regardless of whether it is a High, Medium, or Low day, your protein intake must remain high and stable (roughly 1 gram per pound of body weight). This ensures constant muscle repair.</p>
            <p><strong>Fat operates inversely to Carbs:</strong></p>
            <ul>
              <li><strong>On High Carb Days:</strong> Because you are eating massive amounts of carbs, your calories will be very high. To prevent a massive surplus, you must drop your dietary fats as low as possible (e.g., 30-40 grams). Do not eat heavy cheeses or peanut butter on a High day.</li>
              <li><strong>On Low Carb Days:</strong> Because you have eliminated carbs, your calories will plummet. To provide satiety (fullness) and prevent starvation, you increase your dietary fats significantly (e.g., 80-100 grams). This is the day to eat avocado, eggs, and fattier cuts of meat.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Customizing the Protocol for Your Goal</h2>
            <p>The calculator alters the multipliers based on your selected goal to ensure you hit your net weekly caloric targets.</p>

            <h3>Fat Loss (Deficit)</h3>
            <p>When selecting "Fat Loss," the multipliers are highly aggressive. Your Low days are extremely restrictive (often 0.5g per pound of body weight), forcing you into a deep caloric deficit. Even your High days are conservative (1.5g/lb), ensuring you replenish just enough glycogen to survive your workout without erasing the fat-burning progress you made on your Low days.</p>

            <h3>Body Recomposition (Maintenance)</h3>
            <p>Body recomposition (building muscle while losing fat) is the holy grail of fitness, and carb cycling is the best nutritional mechanism to achieve it. The multipliers are set so that your High days put you in a slight caloric surplus to build muscle, while your Low days put you in a slight deficit to burn fat. Because your net weekly calories average out to maintenance, your weight on the scale stays the same, but your physique radically improves.</p>

            <h3>Muscle Gain (Bulking)</h3>
            <p>A standard dirty bulk often results in massive fat gain because insulin is constantly elevated 24/7. By carb cycling during a bulk, you maintain insulin sensitivity. Your High days are massive (often 3g+ per pound), flooding the muscles with nutrients. However, inserting a Low day (1g/lb) on your rest days prevents "spillover"—stopping the body from storing excess energy as fat when you are simply recovering on the couch.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Advanced Nutritional Strategy</h2>
            <p>Carb cycling is an advanced protocol. It requires meticulous tracking, digital food scales, and a solid understanding of macronutrients. It is not recommended for absolute beginners who have never tracked a calorie. However, for intermediate and advanced athletes who are dealing with diet fatigue, stalled fat loss, or poor gym performance on a standard cut, Carb Cycling is an incredibly powerful tool to break through plateaus and optimize body composition.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carb-cycling-calculator" />
          <PopularCalculators exclude="/calculator/carb-cycling-calculator" />
        </div>
      </div>
    </>
  );
}
