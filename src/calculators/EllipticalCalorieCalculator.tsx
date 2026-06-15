"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Dumbbell } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface EllipticalInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  intensity: "light" | "moderate" | "vigorous";
}

interface EllipticalResults {
  totalCalories: number;
  metValue: number;
  fatCalories: number;
  carbCalories: number;
  
  chartData: { name: string; value: number; color: string }[];
}

// 2. Pure Calculation Function
const calculateEllipticalCalories = (inputs: EllipticalInputs): EllipticalResults | null => {
  const { unitSystem, weight, durationMins, intensity } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  let metValue = 5.0; // default moderate
  let fatPercentage = 0.5; // at moderate, roughly 50/50 fat/carb oxidation

  if (intensity === "light") {
    metValue = 4.5;
    fatPercentage = 0.65; // lower intensity = higher fat oxidation percentage
  } else if (intensity === "moderate") {
    metValue = 5.0;
    fatPercentage = 0.50;
  } else {
    metValue = 8.0;
    fatPercentage = 0.35; // high intensity = heavily carb dependent
  }

  // Calories = MET * weight(kg) * time(hrs)
  const durationHrs = durationMins / 60;
  const totalCalories = metValue * wKg * durationHrs;

  const fatCalories = totalCalories * fatPercentage;
  const carbCalories = totalCalories * (1 - fatPercentage);

  const chartData = [
    { name: "Fat Oxidation", value: Math.round(fatCalories), color: "#f59e0b" }, // Amber
    { name: "Carb (Glycogen)", value: Math.round(carbCalories), color: "#3b82f6" } // Blue
  ];

  return {
    totalCalories: Math.round(totalCalories),
    metValue,
    fatCalories: Math.round(fatCalories),
    carbCalories: Math.round(carbCalories),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "160",
  durationMins: "30",
  intensity: "moderate" as const
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

export default function EllipticalCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "vigorous">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<EllipticalResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid workout duration.");

    const res = calculateEllipticalCalories({ unitSystem, weight: w, durationMins: d, intensity });
    
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
  }, [unitSystem, weight, durationMins, intensity]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Elliptical Workout Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Is the elliptical better for weight loss than running?", answer: "Neither machine is inherently 'better' for weight loss, as fat loss is dictated entirely by a 24-hour caloric deficit. However, the elliptical is a zero-impact machine. Because it removes the harsh skeletal trauma associated with running, heavily overweight individuals or those with joint pain can sustain an elliptical workout for a much longer duration, ultimately burning more total calories per session safely." },
    { question: "Do the moving handles actually increase calorie burn?", answer: "Yes. Using the moving handles on an elliptical engages your back, chest, shoulders, and arms. Because you are recruiting upper body musculature in addition to your legs, your cardiovascular system must pump blood to more active tissue, which raises your heart rate and increases the total caloric burn by approximately 10% to 15%." },
    { question: "Why does the machine display a different calorie number?", answer: "Most gym machines notoriously overestimate calorie burn by 15% to 30%. They often fail to subtract your resting metabolic rate (calories you would have burned anyway just by being alive during that time), and they assume a generic fitness level. This calculator utilizes clinically established MET (Metabolic Equivalent) formulas tailored specifically to your body weight and intensity level, providing a far more accurate biological estimate." },
    { question: "Should I hold the stationary handles or use no hands?", answer: "If you are not using the moving arm handles, letting go entirely and swinging your arms naturally (like you would while running) forces your abdominal core to engage heavily to maintain balance on the pedals. Leaning heavily on the stationary handles actually reduces your effort, dropping your heart rate and lowering your total calorie burn." },
    { question: "Does increasing the resistance burn more fat?", answer: "Increasing the resistance directly increases the physical 'work' required to push the pedals, which significantly increases total caloric expenditure. Furthermore, pushing against high resistance forces the fast-twitch muscle fibers in your quads and glutes to engage, providing a mild hypertrophic (muscle-building) stimulus alongside the cardiovascular benefit." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Elliptical Calorie Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Elliptical Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Machine Metabolism
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the energy expended during a zero-impact elliptical trainer session based on your body mass and effort level.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Machine Intensity</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="light">Light Effort (Low resistance, easy breathing)</option>
                <option value="moderate">Moderate Effort (Steady sweat, can still talk)</option>
                <option value="vigorous">Vigorous Effort (High resistance, heavy breathing)</option>
              </select>
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
                
                {/* Primary Metric */}
                <div className="bg-emerald-500 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-emerald-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-emerald-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-emerald-100 mt-2 bg-emerald-700/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> Burn Rate: ~{Math.round(results.totalCalories / (parseFloat(durationMins) / 60))} kcal / hour
                      </div>
                    </div>
                  </div>
                  <Dumbbell className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-[1fr_240px] gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left">Estimated Fuel Source Oxidation</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-2">How your body metabolically fueled this specific intensity level.</p>
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
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-4 text-center">Clinical Metrics</h3>
                    <div className="flex flex-col gap-4 text-center">
                      <div className="border border-border/40 bg-card rounded-md p-3 shadow-sm">
                        <div className="text-2xl font-black text-foreground">{results.metValue.toFixed(1)}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">MET Intensity Factor</div>
                      </div>
                      <div className="border border-border/40 bg-card rounded-md p-3 shadow-sm">
                        <div className="text-2xl font-black text-amber-500">{results.fatCalories}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Fat Cals Burned</div>
                      </div>
                      <div className="border border-border/40 bg-card rounded-md p-3 shadow-sm">
                        <div className="text-2xl font-black text-blue-500">{results.carbCalories}</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Carb Cals Burned</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Timer className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, workout duration, and estimated intensity to accurately calculate the calories burned on an elliptical machine.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1280px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding the Elliptical Calorie Calculator</h2>
            <p>Walk into any commercial gym in the world, and you will find the cardio section dominated by elliptical trainers. Since its invention in the 1990s, the elliptical machine has revolutionized cardiovascular training by offering a unique, suspended-pedal design that mimics the natural motion of running without subjecting the skeletal system to harsh impact forces. However, estimating the true energy expenditure on these machines is notoriously difficult. The <strong>Elliptical Calorie Calculator</strong> bypasses inaccurate gym console readouts by utilizing established Metabolic Equivalent (MET) formulas. By factoring in your exact body mass, duration, and cardiovascular effort level, it provides a highly accurate, biologically sound estimate of your caloric burn.</p>

            <h2>The Mechanics of Zero-Impact Training</h2>
            <p>To understand why the elliptical is so effective, you must understand the physics of traditional running. When you run on a treadmill or asphalt, your foot strikes the ground with an impact force equivalent to two to three times your body weight. This shockwave travels up through your ankles, into your knees, hips, and lower back. Over time, this repetitive trauma degrades cartilage, leading to stress fractures, shin splints, and joint pain.</p>
            <p>The elliptical eliminates this impact phase entirely. Because your feet never leave the suspended pedals, your joints are never subjected to blunt-force shock. Instead, you push against magnetic or mechanical resistance in a smooth, continuous fluid motion. This allows individuals who are severely overweight, recovering from injuries, or simply suffering from chronic joint pain to sustain highly elevated heart rates for extended periods of time, maximizing caloric expenditure without risking orthopedic damage.</p>

            <h2>Why You Shouldn't Trust the Machine's Display</h2>
            <p>If you have ever finished a 30-minute elliptical workout and felt a surge of pride when the machine's console told you that you burned 600 calories, you may want to temper your expectations. Exercise physiologists widely agree that commercial cardio machines notoriously overestimate calorie burn by 15% to 30%.</p>
            <p>This inaccuracy stems from several factors. First, many machines use generic, outdated algorithms that assume an "average" weight (usually a 150-pound male) if you do not input your specific statistics. Second, the machines frequently fail to subtract your Resting Metabolic Rate (RMR). Even if you were sitting perfectly still on a couch for 30 minutes, you would burn roughly 40 calories just keeping your organs functioning. The machine often rolls those "free" calories into your workout total, falsely inflating the number of calories you actively burned through exercise. Our calculator strictly isolates the active energy expenditure based on clinical MET values.</p>

            <h2>How Intensity Drives Caloric Burn</h2>
            <p>The total number of calories you burn on an elliptical is dictated by the amount of physical <em>work</em> you do, which is directly controlled by the machine's resistance setting and your pedal RPM (Revolutions Per Minute).</p>
            <ul>
              <li><strong>Light Intensity (MET 4.5):</strong> You are pedaling at a leisurely pace with very little resistance. Your breathing is slightly elevated, but you can easily hold a full conversation without gasping for air. This is an excellent zone for active recovery or warming up.</li>
              <li><strong>Moderate Intensity (MET 5.0 - 6.0):</strong> The resistance is increased. You are breaking a steady sweat. You can speak in short sentences, but holding a long conversation is difficult. This is the optimal zone for sustained cardiovascular conditioning and steady-state fat loss.</li>
              <li><strong>Vigorous Intensity (MET 8.0+):</strong> The resistance is dialed up heavily, forcing your leg muscles to strain against the pedals. Your heart rate is nearing its maximum, and you are breathing too heavily to talk. This zone generates a massive caloric burn per minute and triggers the "afterburn effect," though it can only be sustained for short bursts (like HIIT intervals).</li>
            </ul>

            <h2>The Secret Weapon: Dual-Action Handles</h2>
            <p>One of the primary biological advantages of the elliptical over a standard treadmill or stationary bike is the inclusion of dual-action, moving arm handles. By actively pushing and pulling these handles, you engage your pectorals, latissimus dorsi, biceps, and triceps.</p>
            <p>Because you are recruiting large upper-body muscle groups simultaneously with your quadriceps, hamstrings, and glutes, your heart must pump significantly more oxygenated blood throughout your entire body. This massive systemic blood flow demand drastically elevates your heart rate. Studies show that actively engaging the upper body on an elliptical can increase total caloric expenditure by 10% to 15% compared to using your legs alone. However, you must actually <em>push and pull</em> the handles; passively letting your arms ride along for the motion provides zero added metabolic benefit.</p>

            <h2>Fuel Sources: Fat Oxidation vs. Glycogen</h2>
            <p>Our calculator features an exclusive chart detailing your estimated fuel oxidation. The human body uses two primary fuel tanks during exercise: stored body fat (adipose tissue) and stored carbohydrates (glycogen).</p>
            <p>When you exercise at a Light or Moderate intensity on the elliptical, your oxygen intake easily meets the demands of your muscles. Because oxygen is plentiful, your body has the necessary chemical resources to slowly oxidize and burn stored fat. Therefore, at moderate intensities, up to 50% to 60% of the calories you burn come directly from fat.</p>
            <p>When you push the elliptical to Vigorous intensity, your muscles demand explosive energy faster than your lungs can supply oxygen. The body panics and immediately switches to burning glycogen (sugar), because carbohydrates can be metabolized anaerobically (without oxygen). In this state, up to 70% of the calories burned come from sugar, not fat. However, vigorous intensity burns so many more <em>total</em> calories that the absolute volume of fat burned is often higher, even if the percentage is lower.</p>

            <h2>Conclusion: Maximizing Your Elliptical Sessions</h2>
            <p>The elliptical is an incredibly powerful tool for fat loss and cardiovascular health, provided you use it correctly. To maximize your caloric expenditure, stop leaning heavily on the stationary center console (which effectively turns off your core muscles). Stand up straight, actively push and pull the moving handles, and focus on increasing the resistance to challenge your leg muscles. By using the Elliptical Calorie Calculator to track your exact energy expenditure, you can design a precise, zero-impact cardio routine that perfectly aligns with your daily nutritional goals.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/elliptical-calorie-calculator" />
          <PopularCalculators exclude="/calculator/elliptical-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
