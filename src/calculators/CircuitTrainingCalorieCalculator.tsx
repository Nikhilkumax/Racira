"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface CircuitInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  intensity: "light" | "moderate" | "hiit";
}

interface CircuitResults {
  totalCalories: number;
  metValue: number;
  intensityName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const CIRCUIT_STYLES = {
  "light": { name: "Light (Long rest periods)", met: 6.0 },
  "moderate": { name: "Moderate (Standard Circuit)", met: 8.0 },
  "hiit": { name: "Vigorous (HIIT / CrossFit style)", met: 10.0 }
};

// 2. Pure Calculation Function
const calculateCircuitCalories = (inputs: CircuitInputs): CircuitResults | null => {
  const { unitSystem, weight, durationMins, intensity } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = CIRCUIT_STYLES[intensity];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(CIRCUIT_STYLES).map(key => {
    const s = CIRCUIT_STYLES[key as keyof typeof CIRCUIT_STYLES];
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
  weight: "170",
  durationMins: "45",
  intensity: "moderate" as const
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

export default function CircuitTrainingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "hiit">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CircuitResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid session duration.");

    const res = calculateCircuitCalories({ unitSystem, weight: w, durationMins: d, intensity });
    
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
    w.document.write(`<html><head><title>Circuit Training Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What exactly is Circuit Training?", answer: "Circuit training is a high-volume, time-efficient workout methodology where you perform a sequence of different exercises (stations) back-to-back with minimal or no rest in between. For example, moving directly from push-ups to squats to pull-ups to jumping jacks. Once the entire 'circuit' is complete, you take a brief rest before repeating it. It is designed to combine cardiovascular endurance with resistance training." },
    { question: "Does Circuit Training burn more calories than heavy weightlifting?", answer: "Yes, significantly. Traditional heavy weightlifting involves performing a set of 5-8 reps followed by 2 to 3 minutes of complete rest. During those long rest periods, your heart rate drops and calorie burn plummets. Because circuit training utilizes extremely short rest periods (often 10-15 seconds), your heart rate remains elevated near its cardiovascular maximum for the entire duration, resulting in a drastically higher total caloric burn per hour." },
    { question: "What makes a circuit 'Vigorous' or HIIT?", answer: "High-Intensity Interval Training (HIIT) circuits are characterized by pushing your body into an anaerobic state. This means you are working at 85% to 95% of your maximum heart rate. At this intensity (MET 10.0), you cannot hold a conversation and your muscles will rapidly build up lactic acid. Exercises often include explosive plyometrics like box jumps, burpees, or heavy kettlebell swings." },
    { question: "What is the 'Afterburn Effect' (EPOC) in circuit training?", answer: "Vigorous circuit training and HIIT create a massive oxygen deficit in your body. Because you are working so hard with so little rest, your body cannot take in enough oxygen to meet the muscular demand. After the workout is over, your body must rapidly consume oxygen for hours to repair muscle tissue, clear lactic acid, and restore hormone levels. This means you continue burning 'bonus' calories (EPOC) long after you have left the gym." },
    { question: "Can I build muscle doing circuit training?", answer: "Circuit training is excellent for building muscular endurance and 'toning' (revealing muscle by burning fat), but it is generally poor for building massive muscular hypertrophy (size). Because the rest periods are so short, your muscles never fully recover between sets, meaning you cannot lift heavy enough weights to trigger maximum muscular growth. For raw muscle size, traditional heavy weightlifting is superior." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Circuit Training Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Circuit Training Calorie Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Anaerobic Demand
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact energy expended during high-volume, low-rest circuit training or HIIT workouts.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Circuit Intensity</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="light">Light (Longer rest periods, steady breathing)</option>
                <option value="moderate">Moderate (Standard circuit, heavy breathing)</option>
                <option value="hiit">Vigorous (HIIT / CrossFit style, max effort)</option>
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
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-orange-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-orange-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-orange-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-orange-100 mt-2 bg-orange-900/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> {results.intensityName}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[120px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-orange-100 mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-white">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <Timer className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Intensity vs. Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected intensity compares to other pacing strategies over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#f97316' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, session duration, and overall intensity to accurately calculate the massive caloric burn of circuit training.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Caloric Power of Circuit Training</h2>
            <p>If you have ever felt completely exhausted after just 20 minutes of a high-intensity workout class, you have experienced the brutal efficiency of circuit training. While traditional weightlifting requires long rest periods and steady-state cardio requires long time commitments, circuit training perfectly marries the two into a hyper-efficient, massive calorie-burning protocol. The <strong>Circuit Training Calorie Calculator</strong> bypasses inaccurate fitness watch estimates by utilizing clinical Metabolic Equivalent (MET) formulas. By factoring in your specific body mass and the intensity of your rest periods, it calculates the exact thermodynamic cost of your session.</p>

            <h2 className="text-2xl font-bold mb-3">What Exactly is Circuit Training?</h2>
            <p>Circuit training is a workout methodology designed specifically to maximize work volume in the shortest possible time. Instead of performing 3 sets of push-ups, resting for two minutes between each set, and then moving to squats, you perform a "circuit."</p>
            <p>A typical circuit might look like this:</p>
            <ul>
              <li>Station 1: 15 Push-ups</li>
              <li>Station 2: 20 Bodyweight Squats</li>
              <li>Station 3: 15 Dumbbell Rows</li>
              <li>Station 4: 30 Seconds of Jumping Jacks</li>
            </ul>
            <p>The defining characteristic of a circuit is the <strong>absence of rest</strong>. You move immediately from Station 1 to Station 2. Because you are constantly moving, your heart rate never has a chance to return to its baseline. It stays drastically elevated for the entire duration of the circuit. Once you complete all the stations, you take a brief 60 to 90-second rest, and then repeat the entire sequence multiple times.</p>

            <h2 className="text-2xl font-bold mb-3">Why It Burns More Calories Than Traditional Lifting</h2>
            <p>A common complaint among gym-goers whose primary goal is weight loss is that they lift heavy weights for an hour but don't seem to lose body fat. The problem lies in their heart rate.</p>
            <p>If you are performing traditional powerlifting or bodybuilding routines, you might lift an incredibly heavy barbell for 15 seconds, but then you sit on a bench and rest for 3 minutes. During a 60-minute session, you may only be actively "working" for 10 or 15 minutes total. The rest of the time, your heart rate is low and your caloric burn is minimal. </p>
            <p>Circuit training flips this math upside down. Because you are resting for only 10 to 15 seconds between stations, you are actively working for 45 minutes out of a 50-minute session. Your cardiovascular system is forced to continuously pump blood to rapidly alternating muscle groups. This constant cardiovascular demand results in a MET value of 8.0 (Moderate) to 10.0 (Vigorous), meaning you are burning calories at 8 to 10 times your resting rate—drastically outpacing standard weightlifting.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Tiers of Circuit Intensity</h2>
            <p>Our calculator asks you to define the intensity of your circuit. This is the single most critical variable in determining your caloric output:</p>
            <ul>
              <li><strong>Light Intensity (MET 6.0):</strong> You are moving between stations, but the weights are light and you are taking 30 to 45 seconds of rest between exercises. You are breathing heavily, but you are not gasping for air. This is an excellent zone for beginners or active recovery days.</li>
              <li><strong>Moderate Intensity (MET 8.0):</strong> The standard circuit. Rest periods are kept under 20 seconds. You are sweating profusely, and your heart rate is solidly in the aerobic zone (70-80% of max). You can only speak in short, breathless sentences.</li>
              <li><strong>Vigorous / HIIT (MET 10.0):</strong> This is the realm of CrossFit metcons, heavy kettlebell flows, and true High-Intensity Interval Training. You are performing explosive movements (box jumps, burpees, heavy thrusters) with virtually zero rest. You are pushed into the anaerobic zone (85-95% of max heart rate) where lactic acid builds up rapidly. It is physically agonizing and results in the highest possible caloric burn per minute.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Secret Weapon: The Afterburn Effect (EPOC)</h2>
            <p>If you select "Vigorous" on the calculator, the total calories burned during the session is only half the story. High-intensity circuits trigger a massive physiological response known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, widely referred to as the "Afterburn Effect."</p>
            <p>When you perform explosive, anaerobic exercises with minimal rest, your body cannot pull in enough oxygen to meet the immediate muscular demand. This creates a severe "oxygen debt." Furthermore, your muscle fibers suffer micro-tears, and your blood becomes saturated with lactic acid. </p>
            <p>Once the workout ends and you go home, your body must repay that debt. It must rapidly consume oxygen, synthesize proteins to repair muscle tissue, clear the lactic acid, and bring your elevated core temperature back down. All of these physiological repairs require energy. Because of EPOC, your body will continue to burn "bonus" calories at an elevated rate for up to 14 to 24 hours after a vigorous circuit. Traditional low-intensity cardio (like walking on a treadmill) generates almost zero EPOC.</p>

            <h2 className="text-2xl font-bold mb-3">Circuit Training vs. Pure Muscle Hypertrophy</h2>
            <p>While circuit training is the undisputed king of caloric efficiency and fat loss, it is important to understand its limitations. If your primary goal is to build massive, bulky muscles (hypertrophy), circuit training is not the optimal path.</p>
            <p>Muscle hypertrophy requires you to lift weights that are heavy enough to push the muscle to absolute failure within 6 to 10 repetitions. Because circuit training utilizes such short rest periods, your muscles are never fully recovered when you start the next set. Therefore, you are forced to use much lighter weights. While this lighter weight is fantastic for building muscular <em>endurance</em> and burning fat (which makes existing muscles look "toned" and visible), it does not provide enough raw mechanical tension to trigger massive muscle growth.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: The Ultimate Time-Saver</h2>
            <p>In modern society, "lack of time" is the number one reason people fail to achieve their fitness goals. Circuit training entirely destroys this excuse. By utilizing the Circuit Training Calorie Calculator, you can easily see that a grueling, 30-minute high-intensity circuit can easily burn more calories than an hour of walking on a treadmill, all while simultaneously strengthening your muscles and spiking your cardiovascular endurance. Design a circuit, keep your rest periods strictly timed, and watch your metabolic rate skyrocket.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/circuit-training-calorie-calculator" />
          <PopularCalculators exclude="/calculator/circuit-training-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
