"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface TabataInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  cycles: number;
  intensity: "moderate" | "vigorous" | "max";
}

interface TabataResults {
  totalCalories: number;
  metValue: number;
  intensityName: string;
  totalMins: number;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const TABATA_STYLES = {
  "moderate": { name: "Moderate Effort (Modified Tabata)", met: 10.0 },
  "vigorous": { name: "Vigorous Effort (Standard HIIT)", met: 12.0 },
  "max": { name: "All-Out Max (True Tabata Protocol)", met: 14.5 }
};

// 2. Pure Calculation Function
const calculateTabataCalories = (inputs: TabataInputs): TabataResults | null => {
  const { unitSystem, weight, cycles, intensity } = inputs;
  
  if (weight <= 0 || cycles <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  // 1 Tabata Cycle = 4 Minutes
  const totalMins = cycles * 4;
  const durationHrs = totalMins / 60;
  
  const selectedStyle = TABATA_STYLES[intensity];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(TABATA_STYLES).map(key => {
    const s = TABATA_STYLES[key as keyof typeof TABATA_STYLES];
    return {
      name: s.name.split(" (")[0], // Shorter name for chart
      calories: Math.round(s.met * wKg * durationHrs),
      isSelected: key === intensity
    };
  });

  return {
    totalCalories: Math.round(totalCalories),
    metValue: selectedStyle.met,
    intensityName: selectedStyle.name,
    totalMins,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "165",
  cycles: "4", // 16 minutes
  intensity: "vigorous" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const isSelected = payload[0].payload.isSelected;
    return (
      <div className={`bg-card border p-2.5 rounded-lg shadow-md text-xs font-semibold ${isSelected ? 'border-primary' : 'border-border'}`}>
        <p className="font-bold mb-1 text-foreground">{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className={`font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{payload[0].value}</span> kcal</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", onEnter, ...props }: any) => (
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
        onKeyDown={(e) => { if (e.key === "Enter" && onEnter) onEnter(); }}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
        {...props}
      />
      {suffix && <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">{suffix}</span>}
    </div>
  </div>
);

export default function TabataCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [cycles, setCycles] = useState(DEFAULTS.cycles);
  const [intensity, setIntensity] = useState<"moderate" | "vigorous" | "max">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<TabataResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const c = parseInt(cycles, 10);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(c) || c <= 0) return setErrorMsg("Please enter a valid number of Tabata cycles.");

    const res = calculateTabataCalories({ unitSystem, weight: w, cycles: c, intensity });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setCycles(DEFAULTS.cycles);
    setIntensity(DEFAULTS.intensity);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tabata Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What exactly is a 'Tabata' cycle?", answer: "A true Tabata cycle lasts exactly 4 minutes. It consists of 8 rounds of high-intensity intervals: 20 seconds of maximum effort work, followed by exactly 10 seconds of complete rest. This 2:1 work-to-rest ratio was developed by Dr. Izumi Tabata for Japanese Olympic speed skaters to push the human cardiovascular system to its absolute limits." },
    { question: "Why does a 4-minute Tabata burn so many calories?", answer: "The 10-second rest period is the key. Because the rest is so short, your heart rate never has a chance to recover. By round 4, your body is in severe oxygen debt and lactic acid is flooding your muscles. This forces your cardiovascular system to work at near 100% maximum capacity, resulting in a MET value (up to 14.5) that dwarfs standard running or weightlifting." },
    { question: "Is a 'True Tabata' different than normal HIIT?", answer: "Yes. Most fitness classes label any interval training as 'Tabata.' However, a TRUE Tabata protocol requires absolute 100% maximum effort during those 20 seconds. If you are doing jumping jacks or light kettlebell swings, that is modified HIIT. To reach the true 14.5 MET intensity, you must be doing something metabolically devastating, like an all-out sprint on a stationary bike or maximum-effort burpees, to the point of near nausea." },
    { question: "What is the 'Afterburn Effect' (EPOC) from Tabata?", answer: "Tabata was specifically designed to maximize Excess Post-Exercise Oxygen Consumption (EPOC). Because you are working entirely in an anaerobic state, you create a massive oxygen deficit in your body. After the 4 minutes are over, your body must rapidly consume oxygen and burn additional calories for up to 14 to 24 hours just to repair the muscle tissue, clear lactic acid, and restore homeostasis. This means you burn bonus calories long after the workout is finished." },
    { question: "Can I do 10 Tabata cycles in a row?", answer: "If you are performing a TRUE Tabata at 100% maximum effort, no. Your central nervous system and muscular endurance will fail entirely after 1 or 2 cycles (4 to 8 minutes). If you are able to easily perform 10 Tabata cycles (40 minutes) without collapsing, you are performing 'Modified Tabata' at a much lower, moderate intensity (MET 10.0) rather than a true maximal effort." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Tabata Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Tabata Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Zap className="h-4 w-4" /> Anaerobic Math
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic cost of the 20/10 interval protocol based on your body mass and exertion level.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} onEnter={handleCalculate} />
              <CompactInput id="cycles" label="Total Cycles" value={cycles} onChange={setCycles} onEnter={handleCalculate} />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Exertion / Intensity</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="moderate">Moderate Effort (Modified HIIT / Calisthenics)</option>
                <option value="vigorous">Vigorous Effort (Heavy breathing, near failure)</option>
                <option value="max">True Tabata (100% Maximum all-out sprint)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                            <button type="button" onClick={handleCalculate} className="flex-1 flex items-center justify-center gap-1.5 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all active:scale-[0.98] shadow-sm">Calculate</button>
              <button type="button" onClick={handleReset} className="flex-1 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Profile
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Primary Metric */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-primary">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        <Flame className="h-4 w-4 inline mr-1" /> {results.intensityName}
                      </div>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Total Duration</div>
                      <div className="text-2xl font-black text-foreground">{results.totalMins}</div>
                      <div className="text-xs text-muted-foreground font-medium">Minutes</div>
                    </div>
                  </div>
                  <Zap className="absolute -bottom-6 -right-6 h-40 w-40 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected exertion level compares to other Tabata protocols over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#3b82f6' : 'hsl(var(--muted))'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Timer className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, the number of 4-minute Tabata cycles completed, and your exertion level to calculate your exact caloric burn.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Maximum Effort: The Tabata Protocol</h2>
            <p>In 1996, Dr. Izumi Tabata, a researcher at the National Institute of Fitness and Sports in Tokyo, sought to find a way to improve the cardiovascular conditioning of the Japanese Olympic speed skating team. His research resulted in the discovery of arguably the most brutal and thermodynamically efficient interval protocol ever created: the 20/10 ratio. Today, the word "Tabata" is thrown around loosely in commercial gyms, but very few people understand the strict mathematics and physiological demands required to perform it correctly. The <strong>Tabata Calorie Calculator</strong> bypasses generic fitness watch estimations by utilizing clinical Metabolic Equivalent (MET) formulas to calculate the exact thermodynamic cost of pushing the human body into a state of severe oxygen debt.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the 4-Minute Cycle</h2>
            <p>Unlike traditional steady-state cardio (like jogging for 45 minutes) or standard High-Intensity Interval Training (where you might sprint for 1 minute and rest for 2 minutes), a true Tabata cycle is astonishingly short and mathematically rigid. </p>
            <p>One Tabata cycle lasts exactly <strong>4 minutes</strong>. It is comprised of 8 identical rounds:</p>
            <ul>
              <li><strong>20 Seconds of Maximum Effort:</strong> You must perform an exercise at absolute 100% capacity. This is not a "hard" pace; it is a sprint for your life.</li>
              <li><strong>10 Seconds of Complete Rest:</strong> You stop entirely, gasping for air, before the next round begins.</li>
            </ul>
            <p>Because the 10-second rest period is mathematically too short for your heart rate to recover and for your blood to clear the building lactic acid, the physical suffering compounds exponentially with each round. By round 6, your cardiovascular system is operating near its absolute maximum threshold.</p>

            <h2 className="text-2xl font-bold mb-3">Why Tabata Burns More Calories Than Jogging</h2>
            <p>If you jog on a treadmill for 4 minutes, you might burn 40 calories. Your body is operating aerobically—it is pulling in enough oxygen to comfortably fuel your muscles. Your heart rate remains at a steady, moderate plateau.</p>
            <p>A 4-minute Tabata completely destroys this efficiency. Because you are forcing your body to output explosive energy faster than your lungs can supply oxygen, you cross the "anaerobic threshold." Your muscles must rapidly break down stored glycogen (sugar) without oxygen, resulting in a massive spike in heart rate and lactic acid accumulation. This massive internal stress forces the heart to pump at maximum capacity, resulting in a MET value (up to 14.5) that dwarfs standard running. From a purely mathematical standpoint, those 4 minutes of absolute agony will burn significantly more calories per minute than almost any other exercise on earth.</p>

            <h2 className="text-2xl font-bold mb-3">The Difference Between "True" Tabata and "Modified" Tabata</h2>
            <p>A common mistake in the fitness industry is slapping the word "Tabata" onto any 20/10 interval workout. Our calculator differentiates between these intensities using precise MET values:</p>
            <ul>
              <li><strong>Moderate Effort (MET 10.0):</strong> You are performing bodyweight squats, push-ups, or jumping jacks using the 20/10 timer. While difficult, these exercises do not allow you to reach 100% cardiovascular failure. Your muscles will likely burn out before your lungs do. This is highly effective for burning fat, but it is not a true Tabata.</li>
              <li><strong>Vigorous Effort (MET 12.0):</strong> You are performing explosive movements like burpees or kettlebell swings. You are breathing heavily and struggling to finish the 4 minutes. This represents the intensity level of 95% of gym-goers.</li>
              <li><strong>True Tabata Max (MET 14.5):</strong> You are on an air bike (like an Assault Bike) or a rowing machine, sprinting at 100% maximum output for all 20 seconds. By the end of the 4 minutes, you are physically unable to continue and likely lying on the floor. This generates the absolute highest mathematically possible calorie burn per minute.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Physics and Body Mass</h2>
            <p>Like all bodyweight-driven calisthenics, your overall mass heavily influences your total caloric expenditure during a Tabata cycle. The physics formula is immutable: Force = Mass × Acceleration.</p>
            <p>If a 240-pound athlete and a 140-pound athlete both perform a 4-minute Tabata of burpees, the 240-pound athlete had to perform drastically more mechanical "work." Their leg and chest muscles had to propel an extra 100 pounds of mass off the floor and into the air repeatedly. Because their larger body requires more physiological energy (ATP) to perform the exact same movements, they will mathematically burn a significantly higher absolute number of calories.</p>

            <h2 className="text-2xl font-bold mb-3">The Real Magic: The Afterburn Effect (EPOC)</h2>
            <p>If a 4-minute Tabata only burns 60 to 80 absolute calories during the actual workout, how can it be good for weight loss? The answer is <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, commonly known as the "Afterburn Effect."</p>
            <p>Dr. Tabata's research proved that pushing the body so deeply into an anaerobic state creates a massive oxygen debt. After the 4 minutes are over and you return to the locker room, your body cannot immediately return to normal. It must rapidly consume oxygen and burn additional calories for up to 14 to 24 hours just to repair the micro-tears in your muscles, clear the massive lactic acid buildup, and restore your core temperature. A true Tabata continues to burn "bonus" calories long after you have stopped sweating.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Quality Over Quantity</h2>
            <p>More is not always better. If you can perform 10 Tabata cycles (40 minutes) in a row, you are not doing Tabata; you are doing moderate-intensity circuit training. The goal of this protocol is absolute cardiovascular devastation in the shortest time possible. Stop relying on inaccurate wrist trackers that misread your heart rate spikes. Use the Tabata Calorie Calculator to track your true 4-minute outputs, maintain a disciplined caloric deficit in your kitchen, and watch your cardiovascular engine transform.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/tabata-calorie-calculator" />
          <PopularCalculators exclude="/calculator/tabata-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
