"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Anchor } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface RowingInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  intensity: "light" | "moderate" | "vigorous" | "racing";
}

interface RowingResults {
  totalCalories: number;
  metValue: number;
  intensityName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const ROWING_STYLES = {
  "light": { name: "Light (Warmup / Casual)", met: 4.8 },
  "moderate": { name: "Moderate (Steady State)", met: 7.0 },
  "vigorous": { name: "Vigorous (High Output)", met: 8.5 },
  "racing": { name: "Racing / Max Sprint", met: 12.0 }
};

// 2. Pure Calculation Function
const calculateRowingCalories = (inputs: RowingInputs): RowingResults | null => {
  const { unitSystem, weight, durationMins, intensity } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = ROWING_STYLES[intensity];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(ROWING_STYLES).map(key => {
    const s = ROWING_STYLES[key as keyof typeof ROWING_STYLES];
    return {
      name: s.name.split(" (")[0].split(" / ")[0], // Shorter name for chart
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
  durationMins: "30",
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

export default function RowingCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "vigorous" | "racing">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<RowingResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid session duration.");

    const res = calculateRowingCalories({ unitSystem, weight: w, durationMins: d, intensity });
    
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
    w.document.write(`<html><head><title>Rowing Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Is the rowing machine better than the treadmill for weight loss?", answer: "Yes, in many ways. A treadmill primarily works the lower body (quads, hamstrings, calves). A rowing machine (ergometer) works 86% of the muscles in your body, heavily engaging your back, lats, core, and arms, in addition to your legs. Because you are recruiting vastly more total muscle mass, rowing at a moderate intensity frequently burns more calories per minute than running at the same perceived effort level." },
    { question: "Why does the machine display a different calorie number?", answer: "Most gym rowing machines (like Concept2) estimate calorie burn based strictly on the power (watts) you are generating on the flywheel, assuming a standardized body weight. Our calculator uses clinically established Metabolic Equivalent (MET) formulas that factor in your exact body weight and specific exertion level, providing a much more accurate biological estimate of your personal energy expenditure." },
    { question: "Should I row as fast as possible to burn more calories?", answer: "Not necessarily. Rowing is 60% legs, 30% core, and 10% arms. If you try to row as fast as possible by wildly pulling the handle with your arms, you will gas out in 3 minutes and burn very few total calories. The most efficient way to burn calories is to lower your stroke rate (strokes per minute) but increase the explosive pushing power of your legs on every single stroke. This sustains a high heart rate for a much longer duration." },
    { question: "Does rowing build muscle?", answer: "Rowing provides excellent muscular endurance and cardiovascular power, but it does not provide enough raw mechanical tension to build massive muscle hypertrophy (size) like deadlifts or heavy squats. It is fantastic for building a lean, 'toned' athletic back and strong legs, but it is primarily a cardiovascular and fat-burning tool." },
    { question: "Can rowing help me lose belly fat?", answer: "You cannot spot-reduce fat from your stomach. However, because rowing requires constant, aggressive engagement of your abdominal muscles to transfer power from your legs to your arms, it drastically strengthens your core. As you maintain a daily caloric deficit to lose overall body fat, your newly strengthened core muscles will give your stomach a significantly tighter and flatter appearance." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Rowing Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Rowing Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Anchor className="h-4 w-4" /> Full-Body Expenditure
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact energy required to sustain full-body, high-resistance ergometer rowing based on your intensity level.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Rowing Intensity / Pace</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="light">Light (Warmup, easy breathing, &lt; 100 watts)</option>
                <option value="moderate">Moderate (Steady State, heavy breathing, 100-150w)</option>
                <option value="vigorous">Vigorous (High Output, breathless, 150-200w)</option>
                <option value="racing">Racing (Max Sprint / HIIT intervals, 200w+)</option>
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wider mb-1 text-muted-foreground">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight text-foreground">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-muted-foreground">kcal</div>
                      </div>
                      <div className="text-sm font-bold text-cyan-700 mt-2 bg-cyan-500/10 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> {results.intensityName}
                      </div>
                    </div>

                    <div className="bg-background/80 border border-border/60 rounded-lg p-4 text-center min-w-[120px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-foreground">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <Anchor className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10 text-cyan-700" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Pacing & Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected pacing strategy compares to other intensities over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#0891b2' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, session duration, and rowing pace to accurately calculate the massive full-body caloric burn of the ergometer.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Unmatched Efficiency of the Rowing Machine</h2>
            <p>For decades, the treadmill and the elliptical have dominated commercial gym cardio sections. However, in recent years, the indoor rowing machine (ergometer) has surged in popularity, largely driven by the rise of functional fitness and CrossFit. The reason is simple: efficiency. Rowing is one of the few cardiovascular exercises that simultaneously acts as full-body resistance training. But calculating exactly how many calories you are burning while pulling the chain is complex. The <strong>Rowing Calorie Calculator</strong> eliminates the generic estimations of gym consoles by utilizing clinical Metabolic Equivalent (MET) formulas. By factoring in your specific body mass and exact exertion level, it provides a highly accurate, biologically sound caloric burn estimate.</p>

            <h2 className="text-2xl font-bold mb-3">Why Rowing Obliterates the Treadmill</h2>
            <p>To understand why rowing burns so many calories, you must look at total muscle fiber recruitment. When you run on a treadmill or pedal a stationary bike, you are almost exclusively using the lower half of your body (quadriceps, hamstrings, and calves). Your upper body remains relatively static.</p>
            <p>Rowing is entirely different. A proper rowing stroke recruits <strong>86% of the muscles in the human body</strong>. The stroke begins with a massive, explosive leg press (the catch and drive). As the legs extend, the core must engage completely to transfer that power upward. Finally, the massive muscles of the back (latissimus dorsi and rhomboids) and the biceps contract to finish the pull. </p>
            <p>Because your heart is forced to pump oxygenated blood to both your upper and lower extremities simultaneously, the cardiovascular demand is astronomical. This massive systemic blood flow requirement results in a significantly higher caloric burn per minute compared to exercises that only isolate the legs.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding Intensity and METs</h2>
            <p>Like all cardiovascular exercise, the calories you burn are dictated entirely by the physical "work" you perform. In rowing, this is controlled by how hard you push with your legs, not how fast you slide up and down the rail. Our calculator uses METs (Metabolic Equivalents) to measure this intensity:</p>
            <ul>
              <li><strong>Light Effort (MET 4.8):</strong> You are rowing at a casual pace, likely under 100 watts of power. Your breathing is elevated but comfortable. This is an excellent zone for warming up or active recovery.</li>
              <li><strong>Moderate Effort (MET 7.0):</strong> Also known as "Steady State." You are pushing hard with your legs on every stroke (100 to 150 watts). You are sweating heavily and can only speak in short sentences. This is the optimal zone for burning fat and building sustained cardiovascular endurance.</li>
              <li><strong>Vigorous Effort (MET 8.5):</strong> You are pushing near your aerobic threshold. The wattage is high (150-200w). Your lungs are burning, and holding this pace for more than 15-20 minutes is extremely difficult.</li>
              <li><strong>Racing / Sprints (MET 12.0):</strong> This is maximum anaerobic effort. You are rowing as if your life depends on it (200w+). Your body rapidly builds up lactic acid, and you will likely hit muscular failure within 2 to 4 minutes. This burns the highest amount of absolute calories per minute.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Physics on the Erg: Why Body Weight Matters</h2>
            <p>Many people incorrectly assume that because you are sitting down while rowing, your body weight doesn't matter. This is false. A heavier person possesses a larger overall muscle mass.</p>
            <p>If a 220-pound man and a 140-pound woman both row at a moderate, steady-state pace for 30 minutes, the 220-pound man will mathematically burn more absolute calories. Because his body mass is larger, his heart must pump a larger volume of blood, his lungs must process more oxygen, and his larger muscles require more ATP (energy) to contract. The calculator strictly factors in your body mass (in pounds or kilograms) to ensure your caloric estimate is completely personalized to your biology.</p>

            <h2 className="text-2xl font-bold mb-3">The "Afterburn Effect" of Heavy Rowing</h2>
            <p>If you choose to perform Vigorous or Racing intervals on the rowing machine, you will trigger a massive physiological response known as <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, commonly called the "Afterburn Effect."</p>
            <p>Because rowing involves heavy resistance (pulling against a fan or water flywheel), vigorous rowing creates micro-tears in your back, core, and leg muscles, while simultaneously throwing your body into an oxygen deficit. After the workout is over, your body must rapidly consume oxygen and burn additional calories for 12 to 24 hours to repair that muscle tissue and clear lactic acid from your bloodstream. A 20-minute HIIT rowing session can easily burn an additional 50-100 "bonus" calories while you are sitting on the couch recovering.</p>

            <h2 className="text-2xl font-bold mb-3">Rowing for Fat Loss vs. Muscle Gain</h2>
            <p>Rowing is the ultimate hybrid exercise. From a fat-loss perspective, it is unmatched because of the sheer volume of calories it burns per minute. However, it is also a form of resistance training.</p>
            <p>While you won't build massive bodybuilder-style biceps on a rowing machine, the heavy pulling motion provides incredible muscular endurance and functional strength to the posterior chain (the muscles on the back of your body). Most modern office workers suffer from terrible posture because they sit hunched over a desk all day. Rowing actively counteracts this by aggressively strengthening the upper back, rear deltoids, and core, pulling the shoulders back and drastically improving posture while simultaneously incinerating body fat.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Maximize the Machine</h2>
            <p>To get the most accurate results from this calculator, you must row with proper form. The most common mistake beginners make is keeping the resistance ("damper setting") at 10 and trying to row as fast as possible with their arms. This is wildly inefficient. Keep the damper at 4 or 5. Focus on a slow recovery, and explode backward using the massive strength of your legs. Track your sessions with the Rowing Calorie Calculator, dial in your nutrition, and watch as this single machine transforms your cardiovascular engine and your physique.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/rowing-calorie-calculator" />
          <PopularCalculators exclude="/calculator/rowing-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
