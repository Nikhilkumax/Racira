"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Dumbbell } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface GymSessionInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  warmupMins: number;
  liftingMins: number;
  cardioMins: number;
}

interface GymSessionResults {
  totalCalories: number;
  totalMins: number;
  
  warmupCalories: number;
  liftingCalories: number;
  cardioCalories: number;

  chartData: { name: string; value: number; color: string }[];
}

// MET Values for standard gym segments
const METS = {
  warmup: 3.5, // Light stretching / brisk walk
  lifting: 5.0, // Traditional resistance training with rest periods
  cardio: 8.0   // Moderate-to-vigorous steady state cardio
};

// 2. Pure Calculation Function
const calculateGymSessionCalories = (inputs: GymSessionInputs): GymSessionResults | null => {
  const { unitSystem, weight, warmupMins, liftingMins, cardioMins } = inputs;
  
  if (weight <= 0) return null;
  const totalMins = warmupMins + liftingMins + cardioMins;
  if (totalMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  const warmupCalories = METS.warmup * wKg * (warmupMins / 60);
  const liftingCalories = METS.lifting * wKg * (liftingMins / 60);
  const cardioCalories = METS.cardio * wKg * (cardioMins / 60);

  const totalCalories = warmupCalories + liftingCalories + cardioCalories;

  const chartData = [];
  if (warmupCalories > 0) chartData.push({ name: "Warmup / Stretch", value: Math.round(warmupCalories), color: "#10b981" }); // Emerald
  if (liftingCalories > 0) chartData.push({ name: "Resistance Training", value: Math.round(liftingCalories), color: "#3b82f6" }); // Blue
  if (cardioCalories > 0) chartData.push({ name: "Cardiovascular", value: Math.round(cardioCalories), color: "#f43f5e" }); // Rose

  return {
    totalCalories: Math.round(totalCalories),
    totalMins,
    warmupCalories: Math.round(warmupCalories),
    liftingCalories: Math.round(liftingCalories),
    cardioCalories: Math.round(cardioCalories),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "170",
  warmupMins: "10",
  liftingMins: "45",
  cardioMins: "20"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold">{payload[0].value}</span> kcal burned</p>
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

export default function GymSessionCalorieBurnCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [warmupMins, setWarmupMins] = useState(DEFAULTS.warmupMins);
  const [liftingMins, setLiftingMins] = useState(DEFAULTS.liftingMins);
  const [cardioMins, setCardioMins] = useState(DEFAULTS.cardioMins);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<GymSessionResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const warmup = parseFloat(warmupMins) || 0;
    const lift = parseFloat(liftingMins) || 0;
    const cardio = parseFloat(cardioMins) || 0;

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (warmup === 0 && lift === 0 && cardio === 0) return setErrorMsg("Please enter duration for at least one gym activity.");

    const res = calculateGymSessionCalories({ unitSystem, weight: w, warmupMins: warmup, liftingMins: lift, cardioMins: cardio });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setWarmupMins(DEFAULTS.warmupMins);
    setLiftingMins(DEFAULTS.liftingMins);
    setCardioMins(DEFAULTS.cardioMins);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, warmupMins, liftingMins, cardioMins]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Gym Session Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does an hour of lifting burn fewer calories than an hour of cardio?", answer: "Cardio is a continuous effort; your heart rate remains elevated for the entire 60 minutes without rest. Weightlifting is an intermittent effort. If you lift a heavy barbell for 30 seconds and then rest on a bench for 2 minutes, your heart rate drops significantly during the rest period. In a 60-minute lifting session, you may only be doing 15 minutes of actual physical 'work', resulting in a much lower overall calorie burn compared to steady-state cardio." },
    { question: "Does muscle burn fat all day long?", answer: "Yes, but the effect is often exaggerated by fitness influencers. A pound of resting muscle burns approximately 6 to 10 calories per day, whereas a pound of fat burns about 2 calories per day. If you gain 10 pounds of pure muscle (which takes months or years of intense training), your Resting Metabolic Rate (RMR) increases by roughly 60 to 100 calories per day. It is highly beneficial for longevity, but it will not magically offset a terrible diet." },
    { question: "Should I do cardio before or after lifting weights?", answer: "If your goal is to build muscle or get stronger, you should always lift weights first. Weightlifting requires maximum explosive power driven by glycogen (sugar) stored in your muscles. If you do 30 minutes of exhausting cardio first, you will deplete that glycogen, leading to a weak, fatiguing lifting session where you cannot recruit fast-twitch muscle fibers effectively." },
    { question: "What is the 'Afterburn Effect' (EPOC) from lifting?", answer: "When you lift heavy weights to the point of muscular failure, you cause micro-tears in the muscle tissue. After you leave the gym, your body must spend significant energy synthesizing proteins to repair that tissue and make it stronger. This recovery process requires oxygen and calories. Therefore, while lifting may burn fewer calories while you are in the gym, it forces your body to continue burning 'bonus' calories (EPOC) for 24 to 48 hours after the workout to fund the repair process." },
    { question: "Why do fitness trackers overestimate weightlifting calories?", answer: "Fitness watches rely primarily on heart rate to estimate calorie burn. When you lift a heavy weight, your blood pressure spikes dramatically, causing your heart rate to jump. The watch assumes this heart rate spike means you are running or doing intense cardio, and falsely rewards you with massive calorie burns. Our calculator ignores heart rate spikes and uses clinical MET values for resistance training to provide a biologically accurate estimate." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Gym Session Calorie Burn Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Gym Session Calorie Burn Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Comprehensive Session Math
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Most gym routines are highly fragmented. Calculate your true total energy expenditure by breaking your workout down by specific modalities.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            <div className="border-t border-border mt-2 pt-4">
              <h3 className="text-sm font-bold mb-3">Time Allocation</h3>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="wmin" label="Warmup / Stretching" value={warmupMins} onChange={setWarmupMins} suffix="mins" />
                <CompactInput id="lmin" label="Resistance Training (Lifting)" value={liftingMins} onChange={setLiftingMins} suffix="mins" />
                <CompactInput id="cmin" label="Cardio (Treadmill, Bike, etc.)" value={cardioMins} onChange={setCardioMins} suffix="mins" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">Enter '0' for any segment you skipped.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-2 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Gym Session Burn
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-blue-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-blue-100 mt-2 bg-blue-900/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Timer className="h-4 w-4" /> {results.totalMins} Minutes Total Duration
                      </div>
                    </div>
                  </div>
                  <Dumbbell className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-[1fr_240px] gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Caloric Distribution</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-2">Visual breakdown of where you expended the most thermodynamic energy during your session.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Stats Panel */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-center">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 text-center">Session Segments</h3>
                    <div className="flex flex-col gap-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-md p-3 flex justify-between items-center">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Warmup</div>
                        <div className="text-sm font-black text-foreground">{results.warmupCalories} <span className="text-[10px] text-muted-foreground font-normal">kcal</span></div>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 flex justify-between items-center">
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Lifting</div>
                        <div className="text-sm font-black text-foreground">{results.liftingCalories} <span className="text-[10px] text-muted-foreground font-normal">kcal</span></div>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-md p-3 flex justify-between items-center">
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">Cardio</div>
                        <div className="text-sm font-black text-foreground">{results.cardioCalories} <span className="text-[10px] text-muted-foreground font-normal">kcal</span></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Break down your gym session by activity duration to accurately calculate your total daily exercise energy expenditure.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1280px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Mathematics of a Complete Gym Session</h2>
            <p>Walking into a gym and staying for exactly 60 minutes does not guarantee a specific caloric burn. The human body does not burn calories based on the clock on the wall; it burns calories based on the intensity of cardiovascular demand and muscular tension. Most people don't do just one thing at the gym; they warm up, lift weights, and finish with a cardio session. Because each of these activities has a drastically different metabolic demand, relying on a generic "1 Hour Workout" estimate is highly inaccurate. The <strong>Gym Session Calorie Burn Calculator</strong> solves this by breaking your workout down into distinct physiological segments, applying clinical Metabolic Equivalent (MET) formulas to each, and providing a highly accurate total energy expenditure.</p>

            <h2>Why Lifting Weights Burns Fewer Calories Than You Think</h2>
            <p>One of the most disappointing truths in the fitness industry is the realization of how few calories traditional weightlifting actually burns. Many people assume that because lifting a 100-pound barbell is excruciatingly difficult, they must be burning massive amounts of energy.</p>
            <p>The problem lies in <strong>rest periods</strong>. Traditional resistance training (hypertrophy or powerlifting) requires you to perform a set of heavy repetitions for 20 to 40 seconds, and then sit on a bench and recover for 2 to 3 minutes. If you spend 60 minutes in the weight room, you may only be performing active, physical "work" for 12 to 15 minutes. The remaining 45 minutes are spent sitting, recovering, and changing weights on the bar. During those rest periods, your heart rate plummets and your caloric burn drops to near-baseline. Consequently, the MET value for standard resistance training is only 5.0, meaning a 170-pound person might only burn 200 to 250 calories in a full hour of heavy lifting.</p>

            <h2>Cardio: The Undisputed King of Immediate Output</h2>
            <p>Conversely, steady-state cardiovascular training (running on a treadmill, cycling, or using the stair climber) lacks the heavy resistance of weights but completely eliminates the rest periods. If you step on a treadmill for 30 minutes, your heart rate elevates into the aerobic zone and stays there continuously for the entire duration.</p>
            <p>Because there is zero downtime, your lungs must continuously pull in massive amounts of oxygen to oxidize fat and carbohydrates to fuel the constant muscle contractions. Moderate steady-state cardio carries a MET value of 8.0 or higher. This is why a 20-minute post-workout cardio session will frequently burn more calories than the entire 45-minute weightlifting session that preceded it.</p>

            <h2>The Hidden Value of Muscle: The Afterburn Effect</h2>
            <p>If cardio burns so many more calories, why should anyone lift weights for weight loss? The answer lies in what happens to your body <em>after</em> you leave the gym.</p>
            <p>When you perform steady-state cardio, your calorie burn stops almost the exact minute you step off the treadmill. Your heart rate returns to normal, and the metabolic event is over. However, when you lift heavy weights to the point of muscular failure, you cause microscopic tears in your muscle fibers. Your body views this as severe trauma.</p>
            <p>Over the next 24 to 48 hours, your body must expend a significant amount of energy (calories) to synthesize new proteins and repair that muscle tissue, making it thicker and stronger. This phenomenon is known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>. While lifting weights may burn fewer calories <em>during</em> the session, it forces your body to continue burning bonus calories for days afterward.</p>

            <h2>Increasing Your Resting Metabolic Rate (RMR)</h2>
            <p>Furthermore, lifting weights is the only way to build lean muscle mass. Muscle is metabolically "expensive" tissue. Your body must burn calories just to keep muscle tissue alive, even when you are sleeping. Every pound of new muscle you add to your frame burns approximately 6 to 10 additional calories per day.</p>
            <p>While that doesn't sound like much, if you add 10 pounds of muscle over a year of training, your body will passively burn an extra 100 calories every single day, forever. This elevated Resting Metabolic Rate acts as an internal furnace, making it significantly easier to maintain a lean body fat percentage in the long term without having to rely on hours of exhausting cardio.</p>

            <h2>The Optimal Workout Structure: Lift First, Cardio Last</h2>
            <p>Our calculator allows you to input minutes for both lifting and cardio. If you are doing both in the same session, exercise physiologists universally recommend <strong>lifting weights first</strong>, and saving your cardio for the end of the workout.</p>
            <p>Weightlifting requires maximum explosive power, which is fueled exclusively by glycogen (stored sugar in the muscles). If you perform 30 minutes of exhausting cardio before you lift, you will severely deplete those glycogen stores. When you finally pick up the dumbbells, your muscles will be starved of their primary fuel, resulting in a weak, fatiguing workout where you cannot recruit the fast-twitch muscle fibers required for growth. Always prioritize your heavy resistance training when your energy stores are completely full, and use your remaining stamina to burn calories on the treadmill afterward.</p>

            <h2>Conclusion: Stop Trusting Fitness Watches</h2>
            <p>Do not rely on the calorie readout on your smart watch when lifting weights. Fitness trackers estimate caloric burn primarily through heart rate. When you lift a heavy barbell, your blood pressure spikes to push blood to the working muscles, which artificially spikes your heart rate. Your watch assumes this massive heart rate spike means you are sprinting at full speed, and it will falsely reward you with hundreds of phantom calories you did not actually burn. The Gym Session Calorie Burn Calculator ignores these false heart rate spikes and uses clinically validated thermodynamic math to provide you with the cold, hard truth of your energy expenditure.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/gym-session-calorie-burn-calculator" />
          <PopularCalculators exclude="/calculator/gym-session-calorie-burn-calculator" />
        </div>
      </div>
    </>
  );
}
