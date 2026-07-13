"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, ActivitySquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface CarbRequirementsInputs {
  weight: number;
  unit: "lbs" | "kg";
  activityLevel: "sedentary" | "light" | "moderate" | "intense" | "extreme";
}

interface CarbRequirementsResults {
  minGrams: number;
  maxGrams: number;
  caloriesFromCarbsMin: number;
  caloriesFromCarbsMax: number;
  
  grade: string;
  recommendation: string;

  chartData: { intensity: string; rangeMin: number; rangeMax: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateCarbReqs = (inputs: CarbRequirementsInputs): CarbRequirementsResults | null => {
  const { weight, unit, activityLevel } = inputs;
  
  if (weight <= 0) return null;

  const weightKg = unit === "kg" ? weight : weight / 2.20462;

  // Scientific sports nutrition guidelines for carbohydrate intake (grams per kg of bodyweight)
  // Sedentary: 2 - 3 g/kg
  // Light (1 hr/day): 3 - 5 g/kg
  // Moderate (1-3 hr/day): 5 - 7 g/kg
  // Intense (4-5 hr/day): 8 - 10 g/kg
  // Extreme (&gt;5 hr/day): 10 - 12 g/kg

  let minMult = 0;
  let maxMult = 0;
  let grade = "";
  let recommendation = "";

  switch (activityLevel) {
    case "sedentary":
      minMult = 2; maxMult = 3;
      grade = "Sedentary / Office Worker";
      recommendation = "Due to a lack of physical exertion, your glycogen depletion is minimal. Consuming high amounts of carbohydrates will likely result in excess energy being stored as body fat. Keep intake low and focus on fiber-dense sources.";
      break;
    case "light":
      minMult = 3; maxMult = 5;
      grade = "Lightly Active (1 hr/day)";
      recommendation = "This is optimal for the average gym-goer doing 45-60 minutes of weightlifting or light cardio. It provides enough glycogen to fuel the workout without risking massive caloric spillover.";
      break;
    case "moderate":
      minMult = 5; maxMult = 7;
      grade = "Moderately Active (1-3 hr/day)";
      recommendation = "Designed for competitive athletes, high-level CrossFitters, or half-marathon runners training multiple hours a day. Your carbohydrate demands are significant to prevent hitting the wall.";
      break;
    case "intense":
      minMult = 8; maxMult = 10;
      grade = "Intense / Endurance (4-5 hr/day)";
      recommendation = "You are burning astronomical amounts of glucose. To sustain 4+ hours of intense cardiovascular output, your diet must be heavily dominated by carbohydrates.";
      break;
    case "extreme":
      minMult = 10; maxMult = 12;
      grade = "Extreme / Elite (>5 hr/day)";
      recommendation = "This tier is reserved for elite ultra-marathoners, Tour de France cyclists, and Ironman competitors. Consuming this volume of carbohydrates often requires liquid nutrition (sports drinks) as solid food becomes too difficult to digest in such massive quantities.";
      break;
  }

  const minGrams = weightKg * minMult;
  const maxGrams = weightKg * maxMult;
  const caloriesFromCarbsMin = minGrams * 4;
  const caloriesFromCarbsMax = maxGrams * 4;

  const chartData = [
    { intensity: "Sedentary", rangeMin: weightKg * 2, rangeMax: weightKg * 3 },
    { intensity: "Light", rangeMin: weightKg * 3, rangeMax: weightKg * 5 },
    { intensity: "Moderate", rangeMin: weightKg * 5, rangeMax: weightKg * 7 },
    { intensity: "Intense", rangeMin: weightKg * 8, rangeMax: weightKg * 10 },
    { intensity: "Extreme", rangeMin: weightKg * 10, rangeMax: weightKg * 12 },
  ];

  const summaryStats = [
    { label: "Daily Carbohydrate Target", value: `${Math.round(minGrams)}g - ${Math.round(maxGrams)}g`, colorClass: "text-green-500 font-bold text-lg" },
    { label: "Energy Provided", value: `${Math.round(caloriesFromCarbsMin)} - ${Math.round(caloriesFromCarbsMax)} kcal`, colorClass: "font-medium" },
    { label: "Clinical Multiplier Used", value: `${minMult} - ${maxMult} grams per kg`, colorClass: "text-muted-foreground" },
    { label: "Activity Profile", value: grade }
  ];

  return {
    minGrams: Math.round(minGrams),
    maxGrams: Math.round(maxGrams),
    caloriesFromCarbsMin: Math.round(caloriesFromCarbsMin),
    caloriesFromCarbsMax: Math.round(caloriesFromCarbsMax),
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weight: "170",
  unit: "lbs" as const,
  activityLevel: "light" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">{payload[0].payload.intensity} Activity</p>
        <p className="text-muted-foreground">Required: <span className="font-bold text-foreground">{Math.round(payload[0].payload.rangeMin)}g - {Math.round(payload[0].payload.rangeMax)}g</span></p>
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

export default function CarbohydrateCalculator() {
  // 4. Component State
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [activityLevel, setActivityLevel] = useState<CarbRequirementsInputs["activityLevel"]>(DEFAULTS.activityLevel);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CarbRequirementsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);

    if (w <= 0) {
      setErrorMsg("Error: Please enter a valid body weight.");
      setResults(null);
      return;
    }

    const inputs: CarbRequirementsInputs = {
      weight: w,
      unit,
      activityLevel
    };
    setResults(calculateCarbReqs(inputs));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setActivityLevel(DEFAULTS.activityLevel);
    setErrorMsg("");
    
    setResults(calculateCarbReqs({
      weight: parseFloat(DEFAULTS.weight),
      unit: DEFAULTS.unit,
      activityLevel: DEFAULTS.activityLevel
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, unit, activityLevel]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carbohydrate Requirements</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Are carbohydrates essential for survival?", answer: "Technically, no. The human body can synthesize the small amount of glucose it needs to survive through a process called gluconeogenesis (converting protein/fat into glucose). However, while carbs are not essential for *survival*, they are absolutely essential for *optimal athletic performance*. You cannot sprint or lift heavy weights effectively without glycogen." },
    { question: "Why is the target a range rather than an exact number?", answer: "Because human metabolism is dynamic. If you have an intense workout on Tuesday, you should aim for the higher end of the range. If you have a lighter workout on Wednesday, you should aim for the lower end. Your carbohydrate intake should ebb and flow with your daily energy expenditure." },
    { question: "Do all carbohydrates act the same way?", answer: "No. Complex carbohydrates (like oats, sweet potatoes, and brown rice) contain fiber, which slows digestion and provides a steady release of energy over hours. Simple carbohydrates (like sugar, honey, and white rice) digest instantly, causing a rapid spike in blood glucose and insulin. Complex carbs are best for daily living; simple carbs are best immediately before or after a brutal workout." },
    { question: "Will eating carbs at night make me fat?", answer: "This is a widespread myth. Weight gain is dictated by your total daily caloric intake. If you are in a caloric deficit, you can eat all of your carbohydrates at 11:00 PM and you will still lose body fat. In fact, eating carbs at night can actually improve sleep quality by aiding in the production of serotonin." },
    { question: "What happens if I eat more carbs than my body needs?", answer: "When your muscular and hepatic (liver) glycogen stores are 100% full, the body has nowhere to store excess carbohydrates. In this scenario, the body converts the excess glucose into triglycerides through a process called de novo lipogenesis, and stores them in your fat cells. This is why matching intake to activity level is critical." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carbohydrate Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Daily Carbohydrate Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ActivitySquare className="h-4 w-4" /> Activity-Based Carb Needs
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your scientifically optimal daily carbohydrate requirement based on your body weight and total physical exertion.</p>
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

            <div className="flex flex-col mb-1 mt-2 border-t border-border pt-4">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Daily Physical Exertion</label>
              <select 
                value={activityLevel} 
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="sedentary">Sedentary (Office worker, no structured exercise)</option>
                <option value="light">Lightly Active (1 hr/day: standard gym, walking)</option>
                <option value="moderate">Moderately Active (1-3 hr/day: intensive sports, running)</option>
                <option value="intense">Intense (4-5 hr/day: marathon prep, cycling)</option>
                <option value="extreme">Extreme (&gt;5 hr/day: elite endurance, Ironman)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-green-600 dark:text-green-500">
                      Target Carbohydrate Range
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.minGrams} - {results.maxGrams}</div>
                      <div className="text-xl font-bold text-muted-foreground">grams / day</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      This range will provide your body with <strong>{results.caloriesFromCarbsMin} to {results.caloriesFromCarbsMax} kilocalories</strong> of fast-acting energy to fuel your specific activity level.
                    </p>
                  </div>
                  <ActivitySquare className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Metabolic Analysis</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Recommendation:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Activity Scaling (Grams of Carbs)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="intensity" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="rangeMax" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.intensity.toLowerCase() === activityLevel ? "hsl(var(--primary))" : "hsl(var(--muted))"} />
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
                <p className="font-medium max-w-xs">Enter your body weight and select your daily physical exertion level to generate your carbohydrate targets.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Daily Carbohydrate Calculator</h2>
            <p>Carbohydrates are the most controversial macronutrient in the modern diet industry. Over the last three decades, they have been unfairly demonized by low-carb and ketogenic diets as the primary cause of the obesity epidemic. The scientific reality is entirely different: carbohydrates are the human body's absolute preferred source of high-octane energy. The problem is not the carbohydrate itself; the problem is an extreme mismatch between energy intake and energy expenditure. The <strong>Daily Carbohydrate Calculator</strong> utilizes clinical sports science formulas (measured in grams per kilogram of body weight) to map your exact carbohydrate requirements directly to your physical activity level, ensuring you are perfectly fueled without "spilling over" into fat storage.</p>

            <h2 className="text-2xl font-bold mb-3">The Physiology of Carbohydrates and Glycogen</h2>
            <p>To understand how to calculate your carbohydrate needs, you must first understand how the body processes them. When you eat a carbohydrate (like rice, bread, or fruit), the digestive system breaks it down into a simple sugar called glucose. This glucose enters the bloodstream, raising your blood sugar. In response, the pancreas releases insulin, which acts as a "key" to open your cells.</p>
            <p>The body attempts to store this glucose in two primary biological tanks:</p>
            <ol>
              <li><strong>Skeletal Muscle Glycogen:</strong> The muscles store glucose to be used locally during intense physical exertion. An average adult can store about 400 to 500 grams of glycogen in their muscles.</li>
              <li><strong>Hepatic (Liver) Glycogen:</strong> The liver stores about 100 grams of glycogen, which is used to maintain stable blood sugar levels for the brain while you sleep or fast.</li>
            </ol>
            <p>Here is the critical catch: these storage tanks have a hard limit. If you are sedentary, your tanks are already 100% full. If you eat a massive bowl of pasta with full tanks, the body has no choice but to convert that excess glucose into fat through a process called <em>de novo lipogenesis</em>. If you are highly active, your tanks are constantly depleted, meaning you can eat massive amounts of carbohydrates simply to refill the void.</p>

            <h2 className="text-2xl font-bold mb-3">Scaling Intake by Physical Exertion</h2>
            <p>Because carbohydrate demand is so deeply tied to glycogen depletion, the American College of Sports Medicine (ACSM) dictates that carb intake must be scaled dynamically. The calculator uses the following established physiological multipliers:</p>

            <h3>1. Sedentary (2-3 g/kg)</h3>
            <p>If you work a desk job, drive to work, and do not engage in structured physical exercise, your glycogen burn rate is practically zero. Your brain burns a steady drip of glucose, but your muscles do not. A high carbohydrate diet is detrimental to a sedentary individual. This baseline tier provides enough carbs to fuel brain function and basic life activities without triggering excessive fat storage.</p>

            <h3>2. Lightly Active (3-5 g/kg)</h3>
            <p>This is the appropriate tier for the average gym-goer who lifts weights for 45-60 minutes a day or goes for a brisk walk. A standard hour-long weightlifting session only depletes about 25% to 35% of total muscular glycogen. You need a moderate bump in carbohydrates to recover and refuel, but you do not need an Olympic-sized pasta dinner.</p>

            <h3>3. Moderately Active (5-7 g/kg)</h3>
            <p>This tier is for serious athletes training 1 to 3 hours a day (e.g., CrossFit competitors, soccer players, half-marathon runners). At this level of output, the body is rapidly draining glycogen stores on a daily basis. Failing to consume enough carbohydrates in this tier will result in "brain fog," severe muscle fatigue, heavy legs, and terrible subsequent workouts.</p>

            <h3>4. Intense to Extreme (8-12+ g/kg)</h3>
            <p>Reserved for ultra-endurance athletes (Tour de France cyclists, Ironman triathletes, marathon runners logging 80+ miles a week). Their energy expenditure is astronomical. They must consume massive amounts of carbohydrates not just at meals, but constantly via liquid sports drinks during their actual training sessions, just to prevent catastrophic physical failure.</p>

            <h2 className="text-2xl font-bold mb-3">Simple vs. Complex Carbohydrates</h2>
            <p>Hitting your target grams is only half the battle; the <em>quality</em> of the carbohydrates matters immensely based on timing.</p>
            <p><strong>Complex Carbohydrates</strong> (e.g., oats, brown rice, sweet potatoes, quinoa) contain fiber. Fiber slows down the digestive process, causing a slow, steady trickle of glucose into the bloodstream. This prevents massive insulin spikes and keeps you feeling full for hours. These should make up 80% to 90% of your daily intake.</p>
            <p><strong>Simple Carbohydrates</strong> (e.g., white rice, fruit juice, gummy bears, sports drinks) are stripped of fiber. They digest almost instantly, causing a violent spike in blood sugar and insulin. If you are sitting on the couch, this spike will cause a "sugar crash" and fat storage. However, if you are in the middle of a brutal 2-hour workout, or immediately after one, this rapid spike is exactly what you want. The insulin shuttles the fast-acting glucose directly into the depleted muscles for instant recovery.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of "Low-Carb" for Athletes</h2>
            <p>While low-carb and Keto diets are highly effective for sedentary individuals looking to lose weight via appetite suppression, they are often disastrous for high-intensity athletes. Carbohydrates are the only fuel source that can be broken down rapidly enough (without oxygen) to fuel explosive, high-intensity movements (like sprinting or lifting heavy weights). Fat burns far too slowly.</p>
            <p>If an athlete attempts to perform on a severe low-carb diet, their power output drops, their sprint speed decreases, and their perceived exertion (how hard the workout feels) skyrockets. You must earn your carbs, but once you earn them, you must eat them.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Fueling for Performance</h2>
            <p>Do not be afraid of carbohydrates. They are the premium, high-octane fuel required to build elite physiques and achieve peak athletic performance. By utilizing the Daily Carbohydrate Calculator, you can align your intake perfectly with your lifestyle. Assess your activity level honestly, hit the calculated macro range consistently, prioritize complex fiber-dense sources, and utilize the energy to push harder in the gym than you ever have before.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbohydrate-calculator" />
          <PopularCalculators exclude="/calculator/carbohydrate-calculator" />
        </div>
      </div>
    </>
  );
}
