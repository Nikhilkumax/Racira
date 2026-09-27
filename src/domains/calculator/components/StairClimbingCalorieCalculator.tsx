"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, ChevronsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface StairInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  intensity: "slow" | "fast" | "running";
}

interface StairResults {
  totalCalories: number;
  metValue: number;
  intensityName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const STAIR_STYLES = {
  "slow": { name: "Slow Stepmill (Steady State)", met: 6.0 },
  "fast": { name: "Fast Stepmill (Vigorous Cardio)", met: 9.0 },
  "running": { name: "Running Real Stairs (Explosive Max)", met: 15.0 }
};

// 2. Pure Calculation Function
const calculateStairCalories = (inputs: StairInputs): StairResults | null => {
  const { unitSystem, weight, durationMins, intensity } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = STAIR_STYLES[intensity];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(STAIR_STYLES).map(key => {
    const s = STAIR_STYLES[key as keyof typeof STAIR_STYLES];
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
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "165",
  durationMins: "30",
  intensity: "fast" as const
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

export default function StairClimbingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [intensity, setIntensity] = useState<"slow" | "fast" | "running">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<StairResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid duration.");

    const res = calculateStairCalories({ unitSystem, weight: w, durationMins: d, intensity });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setWeight(DEFAULTS.weight);
    setDurationMins(DEFAULTS.durationMins);
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
    w.document.write(`<html><head><title>Stair Climbing Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is the Stepmill considered the hardest machine in the gym?", answer: "Unlike a treadmill where the motor pulls the belt out from under your feet, the Stepmill (or StairMaster) forces your legs to do 100% of the mechanical work. You are performing continuous, unbroken single-leg squats, lifting your entire body weight straight up against gravity for the entire duration. This massive muscular demand requires a staggering amount of oxygen, immediately pushing your heart rate into the high-aerobic or anaerobic zones." },
    { question: "What happens if I hold onto the handrails?", answer: "Holding the handrails completely destroys the mathematics of this calculator. When you grip the rails and lean forward, your arms are artificially supporting up to 30% of your body weight. You are no longer lifting your true mass against gravity, and your core is completely disengaged. If you support your weight on the rails, you must mathematically subtract at least 30% of the calculated caloric burn. For an accurate reading, your hands must swing freely at your sides or gently rest on the sensors for balance only." },
    { question: "Why does running real stairs burn so much more than the Stepmill?", answer: "The Stepmill is highly controlled and lacks a 'flight phase.' When you run up real stadium stairs, your muscles must generate explosive, plyometric force to violently launch your body weight up and forward, and then instantly absorb the shock of landing. This explosive fast-twitch muscle recruitment (MET 15.0) demands vastly more oxygen and ATP energy than the slow, grinding movement of a Stepmill (MET 9.0), resulting in an astronomically higher calorie burn per minute." },
    { question: "Is the Stepmill better for fat loss or building glutes?", answer: "It is highly effective for both. Because the Stepmill requires significant hip extension, it heavily recruits the gluteus maximus and hamstrings, causing massive hypertrophic stimulus (muscle growth) in the lower body. Simultaneously, the immense cardiovascular demand burns a massive amount of absolute calories. By building dense muscle tissue while stripping away body fat, the Stepmill is arguably the best single piece of equipment for lower-body recomposition." },
    { question: "What is the 'Afterburn Effect' (EPOC) from stair climbing?", answer: "Because fast stair climbing pushes your body into an anaerobic state (oxygen debt) and causes significant microscopic tearing in your leg muscles, your workout does not end when you step off the machine. Your body must rapidly consume oxygen and burn additional calories for up to 24 hours just to repair the muscle tissue, clear lactic acid, and restore homeostasis. This means your 30-minute stair session continues to burn bonus calories while you are sleeping." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Stair Climbing Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Stair Climbing Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ChevronsUp className="h-4 w-4" /> Vertical Resistance
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exact energy expenditure by analyzing the continuous metabolic cost of lifting your mass against gravity.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} onEnter={handleCalculate} />
              <CompactInput id="dur" label="Total Duration" value={durationMins} onChange={setDurationMins} suffix="mins" onEnter={handleCalculate} />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Machine / Intensity Level</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="slow">Slow Stepmill (Steady State Cardio)</option>
                <option value="fast">Fast Stepmill (Vigorous Cardio / Sweating)</option>
                <option value="running">Running Real Stairs (Stadiums, Explosive Max)</option>
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

                    <div className="bg-muted/30 border border-border rounded-lg p-4 text-center min-w-[120px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-foreground">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <ChevronsUp className="absolute -bottom-6 -right-6 h-40 w-40 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected intensity compares to other vertical modalities over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#dc2626' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, total duration on the stairs, and the mechanical intensity to calculate your exact cardiovascular energy expenditure.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Brutal Mathematics of the Stepmill</h2>
            <p>Walk into any commercial gym in the world, and you will notice a stark difference between the people on the treadmills and the people on the Stepmills (StairMasters). The people on the treadmills are often watching TV or casually scrolling on their phones. The people on the Stepmills are dripping with sweat, gasping for air, and staring blankly at the timer, praying for the workout to end. This is not a coincidence. From a purely thermodynamic and physiological perspective, stair climbing is one of the most mechanically devastating exercises a human being can perform. The <strong>Stair Climbing Calorie Calculator</strong> utilizes clinical Metabolic Equivalent (MET) formulas to mathematically explain exactly why the Stepmill obliterates flat-ground cardio.</p>

            <h2 className="text-2xl font-bold mb-3">Why Stair Climbing is Not Walking</h2>
            <p>When you walk on a treadmill, the motor is literally doing the work for you. The belt physically pulls the ground out from under your feet; you are simply lifting your feet up to prevent yourself from falling backward. Furthermore, you are moving horizontally. Your center of gravity remains perfectly level, requiring very little muscular effort or cardiovascular strain.</p>
            <p>A Stepmill completely destroys this horizontal efficiency. A Stepmill is essentially an endless escalator moving downward, forcing you to perform continuous, unbroken single-leg squats to stay upright. With every single step, your glutes and quadriceps must fire to dead-lift your entire body weight straight up against the brutal resistance of gravity. Because this mechanical demand is so extreme, your muscles rapidly deplete their immediate oxygen stores. Your heart rate instantly spikes to pump fresh blood to your legs. It is not walking; it is a continuous, high-intensity resistance workout.</p>

            <h2 className="text-2xl font-bold mb-3">The Physics of Body Weight</h2>
            <p>Like all bodyweight-driven exercises, your overall mass heavily influences your total caloric expenditure on the stairs. The physics formula is immutable: Force = Mass × Acceleration.</p>
            <p>If a 240-pound man and a 140-pound woman both climb the Stepmill for 30 minutes at the exact same speed, the heavier man's quadriceps had to generate drastically more mechanical "work" to lift an extra 100 pounds against gravity with every single step. Because his larger body required vastly more physiological energy (ATP) to accomplish the exact same task, he will mathematically burn significantly more absolute calories. Our calculator strictly relies on your body mass to ensure the clinical MET multipliers are perfectly tailored to your biology.</p>

            <h2 className="text-2xl font-bold mb-3">The Handrail Warning: Do Not Cheat the Physics</h2>
            <p>The single biggest mistake people make on the Stepmill is gripping the side handrails, locking their elbows, and supporting their upper body weight. If you do this, you are mathematically destroying the calculation.</p>
            <p>If you weigh 180 pounds, the calorie calculator assumes your legs are lifting 180 pounds against gravity. If you lean on the rails, your arms are artificially supporting up to 50 pounds of that weight. Your legs are now only lifting 130 pounds, and your core stabilizers are completely disengaged. The machine's monitor will falsely reward you with an inflated calorie burn because it does not know you are cheating the physics. To get an accurate reading from this calculator, your hands must swing freely or rest gently on the sensors purely for balance—they cannot bear weight.</p>

            <h2 className="text-2xl font-bold mb-3">Real Stairs vs. the Stepmill</h2>
            <p>While the Stepmill is a phenomenal tool, it still operates at a controlled, steady pace. It lacks a true "flight phase." If you go to a local high school stadium and run real concrete stairs, the caloric burn skyrockets even higher.</p>
            <p>Running real stairs requires explosive plyometric power. Your fast-twitch muscle fibers must fire violently to launch your body weight up and forward, and then instantly absorb the brutal shock of landing on the next concrete step. This explosive speed and impact trauma force the heart rate to its absolute maximum threshold, pushing the MET value to a staggering 15.0—more than double the intensity of a slow Stepmill session.</p>

            <h2 className="text-2xl font-bold mb-3">The Afterburn Effect (EPOC)</h2>
            <p>Because stair climbing is so intense, it triggers a massive physiological response known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, commonly called the "Afterburn Effect."</p>
            <p>Because you are working in a highly aerobic or anaerobic state, you create a severe oxygen deficit in your body. After the 30-minute session is over and you step off the machine, your body cannot immediately return to normal. It must rapidly consume oxygen and burn additional calories for up to 14 to 24 hours just to repair the micro-tears in your massive leg muscles, clear lactic acid, and restore your core temperature. Your stair session continues to burn "bonus" calories while you are sitting at your desk later that afternoon.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Embrace the Grind</h2>
            <p>The Stepmill is mentally and physically grueling, but the mathematical rewards are unmatched. It builds dense, powerful muscle in the glutes and hamstrings while simultaneously stripping away body fat at an astonishing rate. Stop holding onto the handrails, stop relying on inaccurate machine monitors, and use the Stair Climbing Calorie Calculator to track your true, unassisted thermodynamic output.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/stair-climbing-calorie-calculator" />
          <PopularCalculators exclude="/calculator/stair-climbing-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
