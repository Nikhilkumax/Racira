"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Waves } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface WaterAerobicsInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  intensity: "light" | "moderate" | "vigorous";
}

interface WaterAerobicsResults {
  totalCalories: number;
  metValue: number;
  intensityName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const WATER_STYLES = {
  "light": { name: "Light / Therapy (Stretching, slow movement)", met: 4.0 },
  "moderate": { name: "Moderate Aerobics (Standard class)", met: 5.3 },
  "vigorous": { name: "Vigorous / Deep Water Running", met: 6.8 }
};

// 2. Pure Calculation Function
const calculateWaterCalories = (inputs: WaterAerobicsInputs): WaterAerobicsResults | null => {
  const { unitSystem, weight, durationMins, intensity } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  const durationHrs = durationMins / 60;
  
  const selectedStyle = WATER_STYLES[intensity];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(WATER_STYLES).map(key => {
    const s = WATER_STYLES[key as keyof typeof WATER_STYLES];
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

export default function WaterAerobicsCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [intensity, setIntensity] = useState<"light" | "moderate" | "vigorous">(DEFAULTS.intensity);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<WaterAerobicsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid duration.");

    const res = calculateWaterCalories({ unitSystem, weight: w, durationMins: d, intensity });
    
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
    w.document.write(`<html><head><title>Water Aerobics Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does moving in water burn so many calories?", answer: "Water is roughly 800 times denser than air. When you perform a jumping jack on land, you only meet resistance when pushing off the ground; swinging your arms through the air requires almost zero energy. In a pool, you must physically push the dense mass of the water out of the way with every single movement of your arms and legs. This constant, 360-degree fluid resistance forces your muscles to fire continuously, significantly increasing the oxygen required and the calories burned." },
    { question: "Why doesn't water aerobics make me sweat or feel exhausted?", answer: "Water is a phenomenal conductor of heat. When you exercise in a pool, the water immediately draws the heat away from your body, keeping your core temperature perfectly regulated. Because your body does not have to waste energy sweating to cool down, you feel much more comfortable and less fatigued than you would performing the exact same effort on a treadmill. Do not confuse thermal comfort with a lack of exertion; your muscles are still performing massive mechanical work against the water." },
    { question: "Is water aerobics good for people with joint pain?", answer: "It is arguably the single best form of exercise for joint issues. The buoyancy of the water effectively neutralizes the brutal force of gravity. If you stand in chest-deep water, the pool supports approximately 80% of your body weight. You can perform explosive movements, jumping, and running without any of the destructive orthopedic impact that would normally damage your knees, hips, and lower back on land." },
    { question: "What is Deep Water Running?", answer: "Deep water running is exactly what it sounds like. You wear a flotation belt and 'run' in the deep end of the pool where your feet cannot touch the bottom. Because you have no solid ground to push off of, you must rely entirely on the muscular force of your legs and core dragging against the fluid resistance to keep you upright and moving. It requires a staggering amount of fast-twitch muscle fiber recruitment, pushing the MET value up to 6.8 (equivalent to a solid jog on land)." },
    { question: "Can I build muscle with water aerobics?", answer: "While water aerobics is primarily a cardiovascular exercise, the constant multidirectional resistance of the water does provide a significant stimulus for muscular endurance. However, because water cannot provide heavy, progressive eccentric loading (like a heavy barbell dropping against gravity), it will not build massive hypertrophy (large muscles). It will tone and strengthen the muscles perfectly for functional, pain-free daily living." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Water Aerobics Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Water Aerobics Calorie Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-cyan-500/10 border-l-4 border-cyan-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-cyan-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-cyan-800 dark:text-cyan-400">
            <strong>The Buoyancy Factor:</strong> Because water neutralizes gravity but multiplies resistance, you can achieve a massive cardiovascular calorie burn with virtually <strong>zero orthopedic impact</strong> on your knees, hips, or spine.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex bg-secondary p-1 rounded-lg border border-border">
              <button type="button" onClick={() => setUnitSystem("imperial")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "imperial" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Imperial (lbs)</button>
              <button type="button" onClick={() => setUnitSystem("metric")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${unitSystem === "metric" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>Metric (kg)</button>
            </div>

            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mt-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Waves className="h-4 w-4" /> Fluid Dynamics
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exact energy expenditure by analyzing the mechanical effort required to move your mass through high-density fluid resistance.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Class Duration" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Class Type / Intensity Level</label>
              <select value={intensity} onChange={(e: any) => setIntensity(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="light">Light / Therapy (Stretching, slow movement)</option>
                <option value="moderate">Moderate Aerobics (Standard class, high steps)</option>
                <option value="vigorous">Vigorous / Deep Water (Treading, running)</option>
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
                <div className="bg-gradient-to-br from-cyan-600 to-blue-800 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-cyan-200 text-sm font-bold uppercase tracking-wider mb-1">
                        Total Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-cyan-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-cyan-100 mt-2 bg-cyan-950/40 border border-cyan-500/30 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <ActivitySquare className="h-4 w-4" /> {results.intensityName}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[140px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-cyan-200 mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-white">{results.metValue.toFixed(1)}</div>
                      <div className="text-xs text-cyan-300 font-medium">Fluid Resistance</div>
                    </div>
                  </div>
                  <Waves className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected water intensity compares to other aquatic movements over the exact same duration.</p>
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
                <Waves className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your body weight, class duration, and intensity level to calculate the thermodynamic cost of pushing your mass against high-density fluid resistance.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Physics of Fluid Resistance</h2>
            <p>For decades, water aerobics was mistakenly viewed as a "light" or "easy" workout reserved exclusively for the elderly or those recovering from injuries. To a casual observer, the slow, buoyant movements in the pool look effortless compared to the heavy breathing and heavy sweating seen in a CrossFit gym or on a treadmill. However, from a purely thermodynamic and biomechanical perspective, exercising in water is one of the most mechanically demanding tasks the human body can perform. The <strong>Water Aerobics Calorie Calculator</strong> bypasses the visual illusion of "easy movement" by utilizing clinical Metabolic Equivalent (MET) formulas to calculate the massive energy required to displace high-density fluid.</p>

            <h2 className="text-2xl font-bold mb-3">Air vs. Water: The Density Dilemma</h2>
            <p>To understand why water aerobics burns so many calories, you must understand the physics of density. Water is roughly 800 times denser than air.</p>
            <p>When you stand in a gym and perform a jumping jack, the only resistance you face is the moment your feet push off the ground. Swinging your arms out to the side requires almost zero energy because the air parts effortlessly around your hands. When you perform that exact same jumping jack in chest-deep water, the physics change entirely. You must forcefully push the heavy mass of the water out of the way to move your arms and legs. You are essentially lifting weights in 360 degrees. This constant, omnidirectional fluid resistance forces your muscles to fire continuously throughout the entire range of motion, significantly increasing the oxygen required and the calories burned per minute.</p>

            <h2 className="text-2xl font-bold mb-3">The Buoyancy Factor: Zero Impact, High Burn</h2>
            <p>The greatest danger of land-based cardio (like jogging) is gravity. With every step on a treadmill, your joints must absorb an impact force equal to three times your body weight. Over time, this leads to severe degradation of the knees, hips, and lower back.</p>
            <p>Water completely neutralizes this destructive force through buoyancy. If you stand in chest-deep water, the pool physically supports approximately 80% of your body weight. A 200-pound man suddenly feels like he weighs 40 pounds. This allows individuals to perform vigorous cardiovascular movements—like running, jumping, and aggressive twisting—with virtually zero orthopedic trauma. You get the massive caloric burn of a high-intensity interval session without any of the joint damage, making it the ultimate tool for sustainable, pain-free weight loss.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding the MET Values of Aquatic Exercise</h2>
            <p>Exercise physiologists measure physical effort using METs (Metabolic Equivalents). One MET is the energy you burn while sitting still. Our calculator breaks water aerobics down into three distinct clinical intensities:</p>
            <ul>
              <li><strong>Light / Therapy (MET 4.0):</strong> This involves slow, controlled stretching, walking slowly across the shallow end, and gentle range-of-motion therapy. Despite the slow speed, the resistance of the water still requires 4 times your resting metabolic rate.</li>
              <li><strong>Moderate Aerobics (MET 5.3):</strong> A standard class involving continuous jumping jacks, high knees, and using foam dumbbells to increase surface area resistance. This provides a solid cardiovascular stimulus comparable to a brisk walk on land.</li>
              <li><strong>Vigorous / Deep Water (MET 6.8):</strong> This involves wearing a flotation belt and "running" in the deep end where your feet cannot touch the bottom. Because you have no solid ground to push off of, you must rely entirely on the muscular force of your legs and core dragging against the fluid resistance to keep you moving. This requires massive fast-twitch muscle fiber recruitment, pushing the MET value into high-aerobic territory.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Why You Don't Sweat or Feel Exhausted</h2>
            <p>The primary reason people underestimate the caloric burn of water aerobics is the lack of sweat. On a treadmill, you sweat profusely, and your skin gets hot, which your brain interprets as "working hard."</p>
            <p>Water is a phenomenal conductor of heat. When you exercise in a pool, the water immediately draws the metabolic heat away from your working muscles, keeping your core temperature perfectly regulated. Because your body does not have to waste energy sweating and desperately trying to cool down, you feel much more comfortable and less fatigued than you would performing the exact same mechanical effort on a track. Do not confuse thermal comfort with a lack of exertion; your muscles are still performing massive mechanical work against the water.</p>

            <h2 className="text-2xl font-bold mb-3">Is Water Aerobics Enough to Lose Weight?</h2>
            <p>Because water aerobics burns a significant amount of calories while protecting your joints, it is a phenomenal tool to increase your Total Daily Energy Expenditure (TDEE). A 180-pound person doing 45 minutes of moderate water aerobics can burn over 300 calories. However, you cannot out-swim a bad diet. That entire 45-minute effort can be erased by eating a single slice of pizza. To actually lose body fat, you must combine the high-burn, zero-impact benefits of the pool with a strict, disciplined caloric deficit in the kitchen.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Respect the Water</h2>
            <p>Do not let the lack of sweat fool you into thinking you didn't work hard. By leveraging the immense density of water, you are performing a rigorous, full-body resistance and cardiovascular workout simultaneously. Use the Water Aerobics Calorie Calculator to track your exact thermodynamic output, understand the power of fluid resistance, and achieve your weight loss goals without punishing your joints.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/water-aerobics-calorie-calculator" />
          <PopularCalculators exclude="/calculator/water-aerobics-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
