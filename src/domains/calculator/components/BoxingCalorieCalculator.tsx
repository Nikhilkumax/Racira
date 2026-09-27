"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface BoxingInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  style: "bag" | "sparring" | "match";
}

interface BoxingResults {
  totalCalories: number;
  metValue: number;
  styleName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const BOXING_STYLES = {
  "bag": { name: "Heavy Bag (Punching / Drills)", met: 5.5 },
  "sparring": { name: "Sparring (In-Ring Practice)", met: 7.8 },
  "match": { name: "Competition (All-Out Fight)", met: 12.8 }
};

// 2. Pure Calculation Function
const calculateBoxingCalories = (inputs: BoxingInputs): BoxingResults | null => {
  const { unitSystem, weight, durationMins, style } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  // Note: For boxing, duration is ACTIVE fighting/drilling time.
  const durationHrs = durationMins / 60;
  
  const selectedStyle = BOXING_STYLES[style];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(BOXING_STYLES).map(key => {
    const s = BOXING_STYLES[key as keyof typeof BOXING_STYLES];
    return {
      name: s.name.split(" (")[0], // Shorter name for chart
      calories: Math.round(s.met * wKg * durationHrs),
      isSelected: key === style
    };
  });

  return {
    totalCalories: Math.round(totalCalories),
    metValue: selectedStyle.met,
    styleName: selectedStyle.name,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  weight: "165",
  durationMins: "30", // Active time
  style: "bag" as const
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

export default function BoxingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [style, setStyle] = useState<"bag" | "sparring" | "match">(DEFAULTS.style);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<BoxingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid active training duration.");

    const res = calculateBoxingCalories({ unitSystem, weight: w, durationMins: d, style });
    
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
    setStyle(DEFAULTS.style);
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
    w.document.write(`<html><head><title>Boxing Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does an actual match burn so much more than hitting the heavy bag?", answer: "Hitting a heavy bag is physically demanding, but it is a highly controlled environment. You set the pace, and the bag does not hit back. In a live sparring match or competition, your central nervous system is in full 'fight or flight' overdrive. You are constantly dodging, slipping, absorbing blows, and reacting explosively to an opponent. This massive adrenaline spike, combined with relentless, unpredictable anaerobic movements, pushes your heart rate to its absolute maximum, resulting in an astronomically high MET value of 12.8." },
    { question: "Does punching harder burn more calories?", answer: "Yes. Biomechanically, throwing a knockout punch does not just use your arm; it requires your calves to pivot, your hips to explosively rotate, and your core to brutally lock in place to transfer power to your fist. The harder you punch, the more massive muscle groups you are recruiting simultaneously. This increased mechanical 'work' translates directly into higher energy expenditure (calories burned)." },
    { question: "How should I calculate my time? (Active vs Total Time)", answer: "You must only enter your ACTIVE time. If you are at the boxing gym for an hour, but you only do six 3-minute rounds on the heavy bag, your active time is 18 minutes. The 42 minutes you spent resting, drinking water, and wrapping your hands do not count toward this intense calorie burn calculation. Entering '60 minutes' will result in a massive, false overestimation of your caloric expenditure." },
    { question: "Is boxing effective for rapid weight loss?", answer: "Boxing is arguably one of the most effective fat-loss engines in existence. Because it combines high-intensity interval training (HIIT) with full-body resistance (hitting heavy objects), it burns massive amounts of calories per minute while simultaneously triggering a massive 'Afterburn Effect' (EPOC). If you pair consistent boxing workouts with a caloric deficit, you will strip body fat incredibly fast while building a lean, dense, athletic physique." },
    { question: "Does boxing build muscle mass?", answer: "Boxing builds incredible muscular endurance, dense shoulders, and a bulletproof core. However, because you are not progressively overloading your muscles with heavy iron (like powerlifting), boxing will not build massive, bulky hypertrophy. Boxers have lean, highly functional 'whip-like' muscle tissue designed for speed and sustained endurance, rather than sheer bulk." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Boxing Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Boxing Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Combat Output
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic cost of high-intensity striking and anaerobic cardiovascular combat training.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Active Rounds" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Training Intensity</label>
              <select value={style} onChange={(e: any) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="bag">Heavy Bag (Punching / Mitt Drills)</option>
                <option value="sparring">Sparring (In-Ring Practice with Partner)</option>
                <option value="match">Competition (All-Out Match / Fight)</option>
              </select>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                <AlertTriangle className="h-4 w-4 inline mr-1 -mt-0.5" />
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-colors flex items-center justify-center gap-2 focus:outline-none shadow-sm">Calculate</button>
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                        Active Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-4xl font-bold text-primary">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        <Flame className="h-4 w-4" /> {results.styleName}
                      </div>
                    </div>

                    <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center min-w-[120px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">MET Intensity</div>
                      <div className="text-2xl font-bold text-foreground">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <Target className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10 text-primary" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected combat intensity compares to other training scenarios over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#e11d48' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, the minutes spent actively fighting or drilling, and the specific training style to calculate your true caloric burn.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-red-800 dark:text-red-400">
            <strong>Accuracy Warning:</strong> Only input your <strong>ACTIVE</strong> combat or drilling time. If you do five 3-minute rounds, your active time is 15 minutes. Do not enter the total 60 minutes you spent at the gym, as this will massively overestimate your calorie burn.
          </p>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Brutal Efficiency of Boxing for Weight Loss</h2>
            <p>Boxing is universally recognized as one of the most physically exhausting sports in the world. Ask any professional athlete from another sport—whether they are a marathon runner or a powerlifter—to step into a boxing ring and throw punches for just 3 minutes, and they will almost certainly collapse from cardiovascular failure. The sheer energy required to sustain full-body, explosive anaerobic movements is staggering. The <strong>Boxing Calorie Calculator</strong> bypasses inaccurate fitness watch estimations by utilizing clinically validated Metabolic Equivalent (MET) formulas. By factoring in your specific body mass and your exact training environment, it calculates the massive thermodynamic cost of the Sweet Science.</p>

            <h2 className="text-2xl font-bold mb-3">Why Boxing Burns More Calories Than Running</h2>
            <p>When you jog on a treadmill, your body is highly efficient. You move in a straight line at a steady, unchanging pace. Your heart rate elevates to a moderate level and stays there. Your body quickly adapts to make the motion as metabolically "cheap" as possible.</p>
            <p>Boxing destroys this efficiency. First, it is a full-body sport. A proper punch does not start in the arm; it starts with a forceful pivot in the calf, massive rotational torque in the hips, and a brutal isometric lock in the core to transfer power into the fist. You are simultaneously firing your legs, core, back, and shoulders. </p>
            <p>Second, boxing is entirely unpredictable and anaerobic. You do not move at a steady pace. You are constantly bouncing, slipping under punches, absorbing impacts, and throwing explosive combinations. This rapid acceleration and deceleration forces your heart into maximum overdrive, burning drastically more calories per minute than any steady-state cardiovascular exercise.</p>

            <h2 className="text-2xl font-bold mb-3">The Three Tiers of Boxing Intensity</h2>
            <p>Exercise physiologists measure this cardiovascular effort using METs (Metabolic Equivalents). One MET is your resting metabolic rate. Boxing is categorized into three distinct levels of intensity:</p>
            <ul>
              <li><strong>Heavy Bag & Mitt Drills (MET 5.5):</strong> Hitting a heavy bag is physically demanding, but it is a highly controlled environment. The bag does not hit back, and you control the pace. You can take a 5-second breath whenever you need it. This is an excellent zone for fat burning and technique, burning roughly 5.5 times your resting rate.</li>
              <li><strong>Live Sparring (MET 7.8):</strong> When another human being is trying to punch you, your central nervous system enters "fight or flight" mode. Adrenaline floods your system. You can no longer dictate the pace; you must constantly react, slip, and absorb blows. This massive neurological and physical stress pushes the caloric burn significantly higher.</li>
              <li><strong>Competition / Match (MET 12.8):</strong> This is an all-out, maximum-effort fight. It represents the absolute pinnacle of human cardiovascular output. Your heart rate operates near its absolute maximum, and your muscles are flooded with lactic acid. You are burning nearly 13 times your resting metabolic rate—a level of exertion that can only be sustained for very short rounds.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Danger of Overestimating: Active Time vs. Total Gym Time</h2>
            <p>The single biggest mistake combat athletes make when calculating their calories is using their total gym time instead of their active time. This is why our calculator features a prominent warning.</p>
            <p>Boxing is an interval sport. You train in rounds—typically 3 minutes of work followed by 1 minute of rest. If you are at the boxing gym for 60 minutes, you might only spend 20 to 25 minutes actively hitting the bag or sparring. The remaining time is spent stretching, resting, drinking water, and listening to your coach. If you input "60 minutes" into a fitness watch, it will falsely assume you threw punches for an hour straight and tell you that you burned 1,000 calories. To get an accurate, realistic number, you must only enter the exact minutes you were actively fighting or drilling.</p>

            <h2 className="text-2xl font-bold mb-3">Physics in the Ring: Why Body Weight Matters</h2>
            <p>Boxing is a calisthenic, bodyweight-driven sport. The laws of physics (Force = Mass × Acceleration) dictate your caloric expenditure.</p>
            <p>If a 220-pound heavyweight and a 140-pound lightweight both hit the heavy bag for exactly 15 minutes, the heavyweight will mathematically burn a significantly higher absolute number of calories. Why? Because the heavyweight has to propel an extra 80 pounds of mass across the ring with every step, and their larger musculature requires drastically more oxygen and ATP to throw a punch. Our calculator strictly factors in your specific mass to ensure your caloric estimate is biologically accurate.</p>

            <h2 className="text-2xl font-bold mb-3">The Afterburn Effect (EPOC)</h2>
            <p>Because live sparring and competition push your body deep into an anaerobic state (where oxygen demand exceeds oxygen supply), boxing triggers a massive physiological response known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, commonly called the "Afterburn Effect."</p>
            <p>After you take off your gloves and go home, your body must rapidly consume oxygen and burn additional calories for up to 24 hours just to repair the micro-tears in your muscles, clear lactic acid from your bloodstream, and restore homeostasis. This means a grueling 20-minute sparring session continues to burn "bonus" calories long after you have left the gym, making boxing one of the most brutally efficient fat-loss protocols in existence.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Fight for Your Fitness</h2>
            <p>You do not need to take punches to the face to reap the incredible fat-burning benefits of boxing. Hitting the heavy bag or doing mitt-work with a trainer provides an astronomical cardiovascular return on investment. Stop relying on inaccurate wrist trackers. Use the Boxing Calorie Calculator to track your active rounds, maintain a disciplined caloric deficit in your diet, and watch as the Sweet Science rapidly strips body fat and builds a lean, bulletproof physique.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/boxing-calorie-calculator" />
          <PopularCalculators exclude="/calculator/boxing-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
