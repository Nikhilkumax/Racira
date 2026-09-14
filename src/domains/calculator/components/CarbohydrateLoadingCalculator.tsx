"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Zap, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

// 1. TypeScript Interfaces
interface CarbLoadingInputs {
  weight: number;
  unit: "lbs" | "kg";
  eventDuration: "short" | "med" | "long" | "ultra";
}

interface CarbLoadingResults {
  dailyTargetGrams: number;
  totalCaloriesFromCarbs: number;
  waterWeightGain: number; // For every 1g of glycogen, you store 3g of water
  
  grade: string;
  recommendation: string;

  chartData: { day: string; carbs: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateLoading = (inputs: CarbLoadingInputs): CarbLoadingResults | null => {
  const { weight, unit, eventDuration } = inputs;
  
  if (weight <= 0) return null;

  const weightKg = unit === "lbs" ? weight / 2.20462 : weight;
  
  // Clinical multipliers for supercompensation (grams per kg of bodyweight)
  let mult = 0;
  let grade = "";
  let recommendation = "";

  switch (eventDuration) {
    case "short": // < 90 mins (5k, 10k)
      mult = 5; 
      grade = "Unnecessary / Maintenance Only";
      recommendation = "True carbohydrate loading is not required for events under 90 minutes. Your muscles naturally store enough glycogen to fuel a 10K race. Simply eat a normal, balanced diet the day before. Attempting to massive carb load will only leave you bloated and heavy.";
      break;
    case "med": // 90 mins - 2 hours (Half Marathon)
      mult = 8;
      grade = "Moderate Supercompensation";
      recommendation = "You are approaching the limits of normal glycogen reserves. A moderate 1-to-2 day loading phase of 8g/kg will ensure your muscles are completely saturated without causing severe gastrointestinal distress on race morning.";
      break;
    case "long": // 2 - 4 hours (Marathon)
      mult = 10;
      grade = "Full Supercompensation (Marathon)";
      recommendation = "A marathon guarantees severe glycogen depletion. You must undergo a strict 2-to-3 day loading phase of 10g/kg. To achieve this massive intake without vomiting, you must drastically lower your fiber, fat, and protein intake during the loading window.";
      break;
    case "ultra": // > 4 hours (Ultra, Ironman)
      mult = 12;
      grade = "Extreme Supercompensation";
      recommendation = "This is maximum biological glycogen storage. Hitting 12g/kg requires meticulous planning. You will likely need to drink a significant portion of these carbohydrates via sports drinks, as eating this volume of solid food will paralyze your digestive tract.";
      break;
  }

  const dailyTargetGrams = weightKg * mult;
  const totalCaloriesFromCarbs = dailyTargetGrams * 4;

  // When you store 1g of glycogen, your body stores roughly 3g of water with it.
  // 500g of extra glycogen = 1500g of water = 2000g total weight gain (~4.4 lbs)
  const waterWeightGainKg = (dailyTargetGrams * 3) / 1000;
  const waterWeightGainDisplay = unit === "lbs" ? waterWeightGainKg * 2.20462 : waterWeightGainKg;

  // Generate 7 day timeline (T-minus 6 to Race Day)
  const standardDaily = weightKg * 4; // Baseline diet assumption
  const chartData = [
    { day: "T-6", carbs: Math.round(standardDaily) },
    { day: "T-5", carbs: Math.round(standardDaily) },
    { day: "T-4", carbs: Math.round(standardDaily) },
    { day: "T-3", carbs: Math.round(eventDuration === "short" ? standardDaily : dailyTargetGrams) },
    { day: "T-2", carbs: Math.round(eventDuration === "short" ? standardDaily : dailyTargetGrams) },
    { day: "T-1", carbs: Math.round(eventDuration === "short" ? standardDaily : dailyTargetGrams) },
    { day: "Race", carbs: Math.round(standardDaily * 0.5) } // Minimal carbs morning of race
  ];

  const summaryStats = [
    { label: "Daily Carb Target (T-3 to T-1)", value: `${Math.round(dailyTargetGrams)}g / day`, colorClass: "text-blue-500 font-bold text-lg" },
    { label: "Energy Stored Daily", value: `${Math.round(totalCaloriesFromCarbs)} kcal` },
    { label: "Clinical Multiplier", value: `${mult}g per kg bodyweight` },
    { label: "Expected Water Weight Gain", value: `+${waterWeightGainDisplay.toFixed(1)} ${unit}`, colorClass: "text-amber-500 font-bold italic" }
  ];

  return {
    dailyTargetGrams: Math.round(dailyTargetGrams),
    totalCaloriesFromCarbs: Math.round(totalCaloriesFromCarbs),
    waterWeightGain: parseFloat(waterWeightGainDisplay.toFixed(1)),
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weight: "160",
  unit: "lbs" as const,
  eventDuration: "long" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">{payload[0].payload.day}</p>
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

export default function CarbohydrateLoadingCalculator() {
  // 4. Component State
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [eventDuration, setEventDuration] = useState<CarbLoadingInputs["eventDuration"]>(DEFAULTS.eventDuration);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CarbLoadingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);

    if (w <= 0) {
      setErrorMsg("Error: Please enter a valid body weight.");
      setResults(null);
      return;
    }

    const inputs: CarbLoadingInputs = {
      weight: w,
      unit,
      eventDuration
    };
    setResults(calculateLoading(inputs));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight);
    setUnit(DEFAULTS.unit);
    setEventDuration(DEFAULTS.eventDuration);
    setErrorMsg("");
    
    setResults(calculateLoading({
      weight: parseFloat(DEFAULTS.weight),
      unit: DEFAULTS.unit,
      eventDuration: DEFAULTS.eventDuration
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, unit, eventDuration]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carb Loading Protocol</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is Carbohydrate Loading?", answer: "Carbohydrate loading (supercompensation) is an extreme nutritional strategy used by endurance athletes in the 36 to 72 hours leading up to a massive event (like a marathon). By drastically increasing carbohydrate intake while simultaneously dropping training volume to zero (the 'taper'), the muscles act like sponges, soaking up and storing far more glycogen than they typically hold under normal conditions." },
    { question: "Why is the expected weight gain so high?", answer: "When your body stores 1 gram of glycogen in the muscle, it chemically binds with approximately 3 grams of water. If you successfully load 600 grams of carbohydrates, you will also retain 1,800 grams of water. This means you will step on the starting line 4 to 6 pounds heavier than normal. Do not panic; this is functional water weight that will keep you hydrated as you burn the glycogen." },
    { question: "Can I just eat a massive plate of pasta the night before?", answer: "No. This is the biggest amateur mistake in running. Eating a massive 2,000-calorie pasta dinner at 8:00 PM the night before a marathon will leave the food rotting in your gut. Your stomach will not have time to empty it, leading to severe cramps and emergency bathroom stops on race day. True carb loading happens 2 to 3 days BEFORE the race. Your dinner the night before should actually be quite small." },
    { question: "How do I eat 700g of carbs without vomiting?", answer: "You must drastically lower your fiber and fat intake. If you try to hit 700g of carbs by eating brown rice, beans, and broccoli, your digestive system will paralyze. During a carb load, switch entirely to low-fiber, fast-digesting carbs: white rice, white bread, pancakes, fruit juice, and gummy bears. It sounds counterintuitive to health, but it is necessary for sports performance." },
    { question: "Do I need to carb load for a 5K?", answer: "Absolutely not. The human body naturally stores enough glycogen to run hard for about 90 minutes. A 5K (which takes most people 20 to 40 minutes) will not come close to depleting your stores. Carb loading for short events just adds unnecessary heavy water weight that will slow you down." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carbohydrate Loading Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carb Loading Supercompensation</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Zap className="h-4 w-4" /> Glycogen Saturation Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the precise massive dose of daily carbohydrates required to chemically super-saturate your muscle tissue 72 hours before a major endurance event.</p>
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
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Race / Event Duration</label>
              <select 
                value={eventDuration} 
                onChange={(e) => setEventDuration(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="short">Short (&lt; 90 mins: 5K, 10K)</option>
                <option value="med">Medium (90-120 mins: Half Marathon)</option>
                <option value="long">Long (2-4 hours: Full Marathon)</option>
                <option value="ultra">Ultra (&gt; 4 hours: Ironman, Ultra Marathon)</option>
              </select>
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
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-blue-600 dark:text-blue-500">
                      Loading Phase Target
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.dailyTargetGrams}</div>
                      <div className="text-xl font-bold text-muted-foreground">g / day</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      Consume this massive target every day for <strong>2 to 3 days prior to your race</strong> to achieve maximum muscular supercompensation.
                    </p>
                  </div>
                  <Zap className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
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
                      <span className="font-bold">Assessment:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">7-Day Glycogen Timeline</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Line type="stepAfter" dataKey="carbs" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Zap className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight and expected race duration to generate a scientific carbohydrate loading protocol.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>The Bloat Warning:</strong> A proper carb load will cause you to temporarily gain 3 to 6 pounds of water weight. This is biologically necessary. Do not restrict water or panic about the scale weight leading up to the starting line.
          </p>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Carbohydrate Loading Calculator</h2>
            <p>Hitting "The Wall" is the most feared physiological event in all of endurance sports. Around mile 20 of a marathon, thousands of perfectly trained runners suddenly find their legs turned to cement, their vision tunneling, and their pace dropping to a staggered walk. This is not a failure of willpower or cardiovascular fitness; it is a mathematical failure of chemistry. They have completely depleted their muscular glycogen stores. To prevent this, elite endurance athletes utilize a strict nutritional protocol known as Carbohydrate Loading (or Glycogen Supercompensation). The <strong>Carb Loading Calculator</strong> provides the exact mathematical framework to execute this protocol, ensuring your fuel tanks are literally overflowing when you step on the starting line.</p>

            <h2 className="text-2xl font-bold mb-3">The Biological Mechanics of "The Wall"</h2>
            <p>The human body stores fast-acting energy (glucose) inside the muscles and liver in a chemically bonded form called <em>glycogen</em>. However, these storage tanks have a strict biological capacity limit. A fully rested, well-fed athlete can store approximately 400 to 500 grams of glycogen in their muscles. Because each gram of glycogen yields 4 kilocalories of energy, the body holds roughly 2,000 kilocalories of premium, fast-acting rocket fuel.</p>
            <p>During a grueling event like a marathon, the body burns a mixture of fat and glycogen. The faster you run, the higher the percentage of glycogen burned. Regardless of your pace, by roughly two hours of continuous exertion, that 2,000-calorie glycogen tank will hit absolute zero. When the tank is empty, the body is forced to rely 100% on burning body fat. Because converting body fat to energy requires significantly more oxygen and is a much slower chemical process, your physical pace is violently down-regulated by the brain. You have officially hit the wall.</p>

            <h2 className="text-2xl font-bold mb-3">The Science of Glycogen Supercompensation</h2>
            <p>In the 1960s, Scandinavian researchers discovered a biological loophole. They found that if an athlete depleted their glycogen via heavy training, and then consumed massive amounts of carbohydrates while resting, the muscles would panic. To protect against future depletion, the muscles would "supercompensate," temporarily expanding their storage capacity to hold roughly 20% to 30% more glycogen than normal.</p>
            <p>This means instead of starting a race with 2,000 calories of fuel, an athlete could manipulate their diet to start with 2,600 calories of fuel—enough to push "The Wall" from mile 20 back to mile 24, or eliminate it entirely if paired with intra-race sports drinks.</p>

            <h2 className="text-2xl font-bold mb-3">Execution: The 3-Day Taper Window</h2>
            <p>The biggest amateur mistake in endurance racing is attempting to carb load in a single meal. The "massive pasta dinner" the night before the race is a terrible strategy. It overwhelms the digestive system, leaves a brick of undigested wheat in the stomach, and causes severe gastrointestinal distress on race morning while completely failing to saturate the muscles.</p>
            <p>Proper carbohydrate loading takes <strong>2 to 3 days</strong>. You must hit the massive targets output by this calculator (often 600 to 800 grams of carbs per day) while simultaneously dropping your running volume to zero (the Taper). By removing the expenditure and maxing out the intake for 72 hours, the glycogen slowly and safely packs into the muscle fibers.</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of Fiber and Fat (Why Quality Drops)</h2>
            <p>If the calculator tells you to eat 700 grams of carbohydrates a day, you will immediately realize that this is a staggering, almost nauseating amount of food. (For context, a large apple contains 25 grams of carbs; you would have to eat 28 apples a day).</p>
            <p>If you attempt to hit this target using "healthy," complex carbohydrates like brown rice, sweet potatoes, and oatmeal, the massive amount of dietary fiber will paralyze your digestive tract. You will suffer from agonizing bloating and constipation. Therefore, during a clinical carb load, the rules of "healthy eating" are temporarily suspended.</p>
            <ul>
              <li><strong>Drop the Fiber:</strong> Switch entirely to low-fiber, white, refined carbohydrates. White rice, white bread, pancakes, pretzels, and plain pasta.</li>
              <li><strong>Drop the Fat:</strong> Fat slows down digestion and makes you feel full. Eliminate heavy sauces, butter, cheese, and oils. You want the food to digest instantly.</li>
              <li><strong>Drink Your Carbs:</strong> When you physically cannot eat another bite of rice, you must drink your carbs. Apple juice, grape juice, and high-carb sports drinks (like Maurten or Tailwind) are critical tools for hitting high targets.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Psychological Hurdle: Water Weight Gain</h2>
            <p>When you use the calculator, pay close attention to the "Expected Water Weight Gain" warning. When the body stores a single gram of glycogen inside the muscle, it chemically binds it with approximately 3 grams of water. Therefore, if you successfully supercompensate and store an extra 500 grams of glycogen, you are also storing 1,500 grams of water.</p>
            <p>This means you will step on the scale the morning of your race and find yourself 4 to 6 pounds heavier than normal. You will feel bloated, heavy, and sluggish. <strong>Do not panic.</strong> Do not attempt to restrict water intake or sweat it out in a sauna. This is functional water weight. As you burn the glycogen during the marathon, that water is released into your system, acting as a critical internal hydration mechanism when you are sweating heavily.</p>

            <h2 className="text-2xl font-bold mb-3">When NOT to Carb Load</h2>
            <p>This protocol is miserable, requires military discipline to eat that much food, and is entirely unnecessary for short events. If you are running a 5K or a 10K, your event will be over in 20 to 60 minutes. You will not come close to depleting your baseline glycogen stores. Carb loading for a 5K simply adds 5 pounds of heavy, dead water weight to your body, making you slower. Reserve the supercompensation protocol strictly for events exceeding 90 to 120 minutes of continuous, high-intensity output.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Trust the Process</h2>
            <p>A marathon is won or lost in the final 10 kilometers. Your cardiovascular fitness dictates your pace, but your glycogen dictates whether you get to maintain that pace or collapse. Use the Carbohydrate Loading Calculator to establish your 72-hour mathematical targets. Strip the fiber out of your diet, embrace the white rice and fruit juice, accept the temporary water weight gain, and step onto the starting line with an overflowing fuel tank.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbohydrate-loading-calculator" />
          <PopularCalculators exclude="/calculator/carbohydrate-loading-calculator" />
        </div>
      </div>
    </>
  );
}
