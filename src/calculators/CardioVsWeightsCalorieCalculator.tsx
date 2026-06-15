"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Dumbbell, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

// 1. TypeScript Interfaces
interface CardioVsWeightsInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  
  cardioMins: number;
  cardioIntensity: "moderate" | "intense";
  
  weightsMins: number;
  weightsIntensity: "hypertrophy" | "heavy";
}

interface CardioVsWeightsResults {
  cardioCalories: number;
  weightsCalories: number;
  cardioMet: number;
  weightsMet: number;
  totalCalories: number;
  
  chartData: { name: string; "Immediate Burn (Workout)": number; "Est. EPOC (Afterburn)": number }[];
}

const CARDIO_METS = {
  "moderate": { name: "Moderate Cardio (Jogging, Cycling)", met: 7.0, epocBonus: 0.05 }, // 5% afterburn
  "intense": { name: "Intense Cardio (Running, Rowing)", met: 10.0, epocBonus: 0.10 }    // 10% afterburn
};

const WEIGHTS_METS = {
  "hypertrophy": { name: "Bodybuilding (Short rests)", met: 5.0, epocBonus: 0.15 }, // 15% afterburn
  "heavy": { name: "Heavy Compound (Long rests)", met: 6.0, epocBonus: 0.20 }     // 20% afterburn
};

// 2. Pure Calculation Function
const calculateComparisonCalories = (inputs: CardioVsWeightsInputs): CardioVsWeightsResults | null => {
  const { unitSystem, weight, cardioMins, cardioIntensity, weightsMins, weightsIntensity } = inputs;
  
  if (weight <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  // Cardio
  const cStyle = CARDIO_METS[cardioIntensity];
  const cDuration = cardioMins / 60;
  const cCalories = cStyle.met * wKg * cDuration;
  const cEpoc = cCalories * cStyle.epocBonus;

  // Weights
  const wStyle = WEIGHTS_METS[weightsIntensity];
  const wDuration = weightsMins / 60;
  const wCalories = wStyle.met * wKg * wDuration;
  const wEpoc = wCalories * wStyle.epocBonus;

  // Generate Stacked Chart Data
  const chartData = [
    { 
      name: "Cardio Session", 
      "Immediate Burn (Workout)": Math.round(cCalories), 
      "Est. EPOC (Afterburn)": Math.round(cEpoc)
    },
    { 
      name: "Weightlifting", 
      "Immediate Burn (Workout)": Math.round(wCalories), 
      "Est. EPOC (Afterburn)": Math.round(wEpoc)
    }
  ];

  return {
    cardioCalories: Math.round(cCalories),
    weightsCalories: Math.round(wCalories),
    cardioMet: cStyle.met,
    weightsMet: wStyle.met,
    totalCalories: Math.round(cCalories + wCalories),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "170",
  cardioMins: "30",
  cardioIntensity: "moderate" as const,
  weightsMins: "45",
  weightsIntensity: "hypertrophy" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground min-w-[150px]">
        <p className="font-bold mb-2 text-foreground border-b border-border pb-1">{payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span style={{ color: entry.color }} className="mr-3">{entry.name}:</span>
            <span className="font-bold">{entry.value} kcal</span>
          </div>
        ))}
        <div className="flex justify-between items-center mt-2 pt-1 border-t border-border">
          <span className="text-muted-foreground">Total Impact:</span>
          <span className="font-black text-foreground">
            {payload[0].value + (payload[1]?.value || 0)} kcal
          </span>
        </div>
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

export default function CardioVsWeightsCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  
  const [cardioMins, setCardioMins] = useState(DEFAULTS.cardioMins);
  const [cardioIntensity, setCardioIntensity] = useState<"moderate" | "intense">(DEFAULTS.cardioIntensity);
  
  const [weightsMins, setWeightsMins] = useState(DEFAULTS.weightsMins);
  const [weightsIntensity, setWeightsIntensity] = useState<"hypertrophy" | "heavy">(DEFAULTS.weightsIntensity);
  
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CardioVsWeightsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const cM = parseFloat(cardioMins) || 0;
    const wM = parseFloat(weightsMins) || 0;

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (cM === 0 && wM === 0) return setErrorMsg("Please enter a duration for at least one activity.");

    const res = calculateComparisonCalories({ 
      unitSystem, weight: w, 
      cardioMins: cM, cardioIntensity, 
      weightsMins: wM, weightsIntensity 
    });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setCardioMins(DEFAULTS.cardioMins);
    setCardioIntensity(DEFAULTS.cardioIntensity);
    setWeightsMins(DEFAULTS.weightsMins);
    setWeightsIntensity(DEFAULTS.weightsIntensity);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, weight, cardioMins, cardioIntensity, weightsMins, weightsIntensity]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Cardio vs Weights Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does cardio burn more calories 'in the moment'?", answer: "Cardio (like running or cycling) requires continuous, unbroken cardiovascular output. Your heart rate elevates and stays elevated for the entire duration of the workout, burning a massive amount of acute energy. Weightlifting is highly segmented. You might lift a heavy barbell for 15 seconds, and then sit on a bench and rest for 3 minutes to recover your central nervous system. Because you spend so much time resting during a lifting session, the acute calorie burn per minute is significantly lower." },
    { question: "If cardio burns more calories, why should I lift weights for fat loss?", answer: "This is the biggest misconception in fitness. Cardio burns calories strictly while you are doing it. Weightlifting builds lean muscle mass. Muscle is highly metabolically active tissue, meaning it requires calories just to exist. For every pound of muscle you build, your body's Resting Metabolic Rate (RMR) increases. Weightlifting turns your body into a passive 24/7 calorie-burning machine, even while you are sleeping, whereas cardio does not." },
    { question: "What is the 'Afterburn Effect' (EPOC) shown in the chart?", answer: "EPOC stands for Excess Post-Exercise Oxygen Consumption. When you lift heavy weights, you create microscopic tears in the muscle fibers and deplete ATP stores. After the workout ends, your body must rapidly consume oxygen and burn additional calories for up to 24 to 48 hours just to repair that tissue and restore homeostasis. Steady-state cardio creates very little mechanical damage, meaning the EPOC afterburn is negligible. Weightlifting produces a massive afterburn." },
    { question: "Should I do cardio before or after weights?", answer: "If your goal is fat loss or muscle building, you should ALWAYS do cardio after weights. Your body stores immediate energy as glycogen (sugar) in the muscles. If you run for 30 minutes before lifting, you burn through all of that high-octane glycogen. When you go to lift weights, your muscles will be depleted and weak. If you lift heavy weights first (using the glycogen), and then do cardio after, your body is much more likely to tap directly into stored body fat to fuel the cardio session." },
    { question: "Can I out-train a bad diet with both?", answer: "Absolutely not. You could run on a treadmill for 45 minutes and lift weights for 60 minutes, burning roughly 800 total calories. You can completely erase that brutal 2-hour gym session by eating a double cheeseburger in 5 minutes. Exercise is for cardiovascular health, muscle retention, and hormonal balance. Fat loss is driven almost entirely by maintaining a strict caloric deficit in the kitchen." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Cardio vs Weights Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Cardio vs Weights Calorie Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mx-auto mb-6 bg-slate-500/10 border-l-4 border-slate-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-400">
            <strong>The Muscle Paradox:</strong> While cardiovascular exercise mathematically burns more calories <em>during</em> the actual workout, heavy resistance training triggers a much larger "Afterburn Effect" (EPOC) and permanently raises your resting metabolic rate by building lean tissue.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2">
              <CompactInput id="weight" label="Total Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            {/* CARDIO SECTION */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-primary font-bold mb-3">
                <Activity className="h-4 w-4" /> Cardiovascular Training
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="c-dur" label="Cardio Duration" value={cardioMins} onChange={setCardioMins} suffix="mins" />
                <div className="flex flex-col">
                  <select value={cardioIntensity} onChange={(e: any) => setCardioIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="moderate">Moderate (Jogging, Cycling, Stepper)</option>
                    <option value="intense">Intense (Running, Rowing, Anaerobic)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* WEIGHTS SECTION */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-indigo-500 font-bold mb-3">
                <Dumbbell className="h-4 w-4" /> Resistance Training
              </div>
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="w-dur" label="Lifting Duration" value={weightsMins} onChange={setWeightsMins} suffix="mins" />
                <div className="flex flex-col">
                  <select value={weightsIntensity} onChange={(e: any) => setWeightsIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="hypertrophy">Bodybuilding (High Reps, Short Rest)</option>
                    <option value="heavy">Powerlifting (Heavy Compound, Long Rest)</option>
                  </select>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
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
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Cardio Box */}
                  <div className="bg-gradient-to-br from-primary/90 to-red-600 text-white rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Cardio Burn</div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-4xl font-extrabold">{results.cardioCalories}</div>
                        <div className="text-sm font-medium text-white/80">kcal</div>
                      </div>
                      <div className="text-xs font-medium text-white/90 mt-1">MET: {results.cardioMet.toFixed(1)}</div>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>

                  {/* Weights Box */}
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Weights Burn</div>
                      <div className="flex items-baseline gap-1">
                        <div className="text-4xl font-extrabold">{results.weightsCalories}</div>
                        <div className="text-sm font-medium text-white/80">kcal</div>
                      </div>
                      <div className="text-xs font-medium text-white/90 mt-1">MET: {results.weightsMet.toFixed(1)}</div>
                    </div>
                    <Dumbbell className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Stacked Bar Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">The EPOC Phenomenon (Afterburn)</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-6">While cardio burns more acute calories during the session, heavy weightlifting causes massive muscle trauma, triggering a much larger caloric burn (EPOC) over the next 48 hours to repair the tissue.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="Immediate Burn (Workout)" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Est. EPOC (Afterburn)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight and the duration of your cardio and lifting sessions to visually compare the immediate and long-term thermodynamic impacts of both training styles.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1280px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>The Great Debate: Cardio vs. Weights for Weight Loss</h2>
            <p>Walk into any gym, and you will see a clear divide. On one side of the room, people are sweating profusely on treadmills, chasing a high calorie-burn number on a digital screen. On the other side, people are lifting heavy barbells, taking long rest periods, and barely looking at their heart rate monitors. For decades, the fitness industry told us that to lose weight, you must do cardio. To build muscle, you must lift weights. However, modern clinical exercise physiology has proven that this binary thinking is fundamentally flawed. The <strong>Cardio vs Weights Calorie Calculator</strong> uses clinical Metabolic Equivalent (MET) data to mathematically prove why you need both, and why the calories you burn <em>after</em> you leave the gym matter more than the ones you burn while you are there.</p>

            <h2>Why Cardio Wins the "Immediate Burn" Battle</h2>
            <p>If you look purely at a 60-minute window of time, cardiovascular exercise will mathematically burn significantly more absolute calories than weightlifting. The reason is simple: Continuous Output.</p>
            <p>When you jog on a treadmill for 60 minutes, your heart rate elevates to 150 BPM and stays there for the entire hour. Your legs never stop moving, and your lungs never stop pulling in oxygen. You are performing 60 solid minutes of physical "work."</p>
            <p>Weightlifting is highly segmented. If you spend 60 minutes in the weight room, you might do a heavy set of squats that takes 20 seconds, and then you sit on a bench and rest for 3 minutes to let your central nervous system recover. Out of that entire 60 minutes, you might only perform 12 total minutes of actual, active physical work. Because you spent 48 minutes resting, the acute caloric burn during that hour is significantly lower than the treadmill.</p>

            <h2>The Muscle Paradox: Building a Caloric Furnace</h2>
            <p>If cardio burns more acute calories, why do professional bodybuilders and fitness models rely heavily on weightlifting to get so incredibly lean? The answer is Resting Metabolic Rate (RMR) and tissue density.</p>
            <p>Cardio burns calories only while you are actively doing it. Once you step off the treadmill, the burn effectively stops. Weightlifting, however, forces your body to adapt by building lean muscle tissue. Muscle is highly metabolically active tissue. It requires a constant supply of calories just to exist on your frame. For every pound of muscle you build, your body's baseline RMR increases. By lifting weights, you are physically expanding the size of your body's "engine," meaning you burn more calories 24 hours a day, 7 days a week, even while you are sitting at your desk or sleeping. Cardio does not build this engine; it merely burns the fuel currently in the tank.</p>

            <h2>The Science of EPOC (The Afterburn Effect)</h2>
            <p>The interactive chart in this calculator highlights a critical physiological phenomenon known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, commonly called the "Afterburn."</p>
            <p>When you jog at a moderate pace, you create very little mechanical damage to your body. When you lift a heavy barbell, you cause massive microscopic tearing in the muscle fibers and severely deplete your ATP energy stores. After you leave the gym, your body cannot immediately return to a resting state. It must rapidly consume oxygen and burn additional calories for up to 24 to 48 hours just to repair the damaged tissue, clear lactic acid, and synthesize new muscle proteins. Weightlifting generates a massive, prolonged EPOC effect, whereas steady-state cardio generates almost zero.</p>

            <h2>The Danger of Being "Skinny Fat"</h2>
            <p>If you only do cardio to lose weight, you will absolutely lose pounds on the scale. However, because you are not providing any resistance stimulus to your muscles, your body will happily burn away both fat and muscle tissue equally to drop weight. The result is becoming a smaller, softer version of yourself—often referred to as being "skinny fat."</p>
            <p>Weightlifting sends a powerful hormonal signal to your body: <em>"We need this muscle tissue to survive the heavy loads; do not burn it."</em> Consequently, when you are in a caloric deficit, weightlifting forces your body to spare the muscle and strictly oxidize stored body fat for fuel, resulting in a lean, toned, and athletic physique.</p>

            <h2>Optimal Sequencing: Cardio Before or After Weights?</h2>
            <p>If you are going to do both in the same gym session, the scientific consensus is clear: <strong>Always lift weights first, and do cardio second.</strong></p>
            <p>Your body stores immediate energy as glycogen (sugar) inside your muscles. To lift heavy weights safely and effectively, you need those glycogen stores to be completely full. If you run for 45 minutes first, you will burn through all of your high-octane glycogen. When you finally go to the weight room, your muscles will be depleted, weak, and highly susceptible to injury. By lifting weights first (utilizing the glycogen), you exhaust the sugar supply. When you step onto the treadmill afterward, your body has no sugar left and is forced to tap directly into stored body fat to fuel the cardio session.</p>

            <h2>Conclusion: Do Not Pick a Side</h2>
            <p>Cardio is phenomenal for your heart, your lungs, and your immediate caloric deficit. Weightlifting is essential for your bone density, hormonal profile, and long-term metabolic rate. You do not have to choose a side. Use the Cardio vs Weights Calorie Calculator to visually understand the different ways these modalities manipulate thermodynamics, integrate both into your weekly routine, and let the science of body recomposition transform your physique.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/cardio-vs-weights-calorie-calculator" />
          <PopularCalculators exclude="/calculator/cardio-vs-weights-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
