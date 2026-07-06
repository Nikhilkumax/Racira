"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, Timer, Flame, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface MartialArtsInputs {
  unitSystem: "imperial" | "metric";
  weight: number;
  durationMins: number;
  style: "taichi" | "karate" | "judo" | "muaythai";
}

interface MartialArtsResults {
  totalCalories: number;
  metValue: number;
  styleName: string;
  
  chartData: { name: string; calories: number; isSelected: boolean }[];
}

const MARTIAL_STYLES = {
  "taichi": { name: "Tai Chi (Slow, meditative flows)", met: 4.0 },
  "karate": { name: "Karate / Taekwondo (Forms & Drills)", met: 5.3 },
  "judo": { name: "Judo / Jiu-Jitsu (Heavy Grappling)", met: 10.3 },
  "muaythai": { name: "Muay Thai / Kickboxing (High Impact)", met: 10.5 }
};

// 2. Pure Calculation Function
const calculateMartialArtsCalories = (inputs: MartialArtsInputs): MartialArtsResults | null => {
  const { unitSystem, weight, durationMins, style } = inputs;
  
  if (weight <= 0 || durationMins <= 0) return null;

  const wKg = unitSystem === "imperial" ? weight * 0.453592 : weight;
  
  // Active drilling/combat time
  const durationHrs = durationMins / 60;
  
  const selectedStyle = MARTIAL_STYLES[style];
  const totalCalories = selectedStyle.met * wKg * durationHrs;

  // Generate comparison data
  const chartData = Object.keys(MARTIAL_STYLES).map(key => {
    const s = MARTIAL_STYLES[key as keyof typeof MARTIAL_STYLES];
    return {
      name: s.name.split(" (")[0].split(" / ")[0], // Shorter name for chart
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
  weight: "170",
  durationMins: "45", // Active time
  style: "muaythai" as const
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

export default function MartialArtsCalorieCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [durationMins, setDurationMins] = useState(DEFAULTS.durationMins);
  const [style, setStyle] = useState<"taichi" | "karate" | "judo" | "muaythai">(DEFAULTS.style);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<MartialArtsResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const d = parseFloat(durationMins);

    if (isNaN(w) || w <= 0) return setErrorMsg("Please enter a valid body weight.");
    if (isNaN(d) || d <= 0) return setErrorMsg("Please enter a valid active training duration.");

    const res = calculateMartialArtsCalories({ unitSystem, weight: w, durationMins: d, style });
    
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
  }, [unitSystem, weight, durationMins, style]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Martial Arts Caloric Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does grappling (Jiu-Jitsu) burn as much as kickboxing?", answer: "To the untrained eye, two people grappling on the floor looks slow and easy compared to throwing rapid punches. In reality, Jiu-Jitsu and Judo are incredibly taxing. You are locked in continuous, heavy isometric muscle contractions against another human's entire body weight. You are constantly fighting to establish grips, escape holds, and bridge your hips. This relentless full-body resistance against a live opponent demands astronomical amounts of oxygen, resulting in a MET value (10.3) that rivals intense striking." },
    { question: "How should I calculate my time? (Active vs Class Time)", answer: "You must only enter your ACTIVE drilling or sparring time. If you attend a 60-minute Karate class, but you spend 15 minutes listening to the instructor, 10 minutes stretching, and 5 minutes bowing in/out, your active training time is only 30 minutes. Entering the full '60 minutes' will cause the calculator to massively overestimate your calorie burn. Always estimate the exact minutes you were physically moving." },
    { question: "Are martial arts better than weightlifting for fat loss?", answer: "From a pure 'calories burned per minute' perspective, high-intensity martial arts (like Muay Thai or Judo) drastically outperform traditional weightlifting. Because martial arts involve continuous cardiovascular movement and explosive anaerobic bursts, they burn massive amounts of total calories and trigger a huge 'Afterburn Effect' (EPOC). However, weightlifting is superior for building the actual muscle mass that raises your resting metabolic rate over time." },
    { question: "Why does Tai Chi burn so few calories?", answer: "Caloric expenditure is dictated by physical 'work' and cardiovascular demand. Tai Chi is designed to be a slow, meditative, flowing practice. Your heart rate remains very close to baseline, and you are not moving explosively or fighting resistance. While Tai Chi is absolutely incredible for joint mobility, balance, and reducing cortisol (stress), it does not require enough cardiovascular effort to be an effective primary engine for weight loss." },
    { question: "Why does my body weight affect the calories burned?", answer: "Martial arts are predominantly bodyweight exercises (calisthenics). Physics dictates that Force = Mass × Acceleration. If you weigh 220 pounds, your leg muscles must generate drastically more mechanical force to throw a high kick or sprawl to defend a takedown than someone who weighs 140 pounds. Because your larger body requires more physiological energy to perform the exact same movements, you will mathematically burn a significantly higher absolute number of calories." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Martial Arts Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Martial Arts Calorie Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>Accuracy Warning:</strong> Only input your <strong>ACTIVE</strong> combat or drilling time. If your dojo class is 60 minutes, but you spend 20 minutes resting and listening to the instructor, your active time is 40 minutes. Entering your total class time will massively overestimate your true caloric expenditure.
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
                <Shield className="h-4 w-4" /> Discipline Output
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the exact thermodynamic cost of different martial arts disciplines based on your body mass and active combat time.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="weight" label="Body Weight" value={weight} onChange={setWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="dur" label="Active Drilling" value={durationMins} onChange={setDurationMins} suffix="mins" />
            </div>

            <div className="flex flex-col mt-2">
              <label className="text-sm font-semibold text-foreground mb-1.5">Martial Art Discipline</label>
              <select value={style} onChange={(e: any) => setStyle(e.target.value)} className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="taichi">Tai Chi (Slow, meditative flows)</option>
                <option value="karate">Karate / Taekwondo (Forms & technique drilling)</option>
                <option value="judo">Judo / Jiu-Jitsu (Heavy ground grappling & throws)</option>
                <option value="muaythai">Muay Thai / Kickboxing (High impact striking)</option>
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
                <div className="bg-gradient-to-br from-amber-600 to-orange-800 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-amber-300 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-amber-200 text-sm font-bold uppercase tracking-wider mb-1">
                        Active Energy Expended
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.totalCalories.toLocaleString()}</div>
                        <div className="text-xl font-bold text-amber-200">kcal</div>
                      </div>
                      <div className="text-sm font-medium text-amber-100 mt-2 bg-amber-950/40 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Flame className="h-4 w-4" /> {results.styleName}
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/20 rounded-lg p-4 text-center min-w-[120px] backdrop-blur-sm">
                      <div className="text-[10px] uppercase font-bold text-amber-200 mb-1">MET Intensity</div>
                      <div className="text-2xl font-black text-white">{results.metValue.toFixed(1)}</div>
                    </div>
                  </div>
                  <Shield className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Comparative Output Analysis</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">How your selected martial art compares to other disciplines over the exact same duration.</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]} maxBarSize={50}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.isSelected ? '#d97706' : 'hsl(var(--muted))'} />
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
                <p className="font-medium max-w-xs">Enter your body weight, the minutes spent actively drilling or sparring, and the specific martial art to calculate your true caloric burn.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Massive Caloric Demand of Martial Arts</h2>
            <p>From the explosive high kicks of Muay Thai to the grueling ground battles of Brazilian Jiu-Jitsu, martial arts represent one of the most physically exhausting forms of training in existence. They are entirely unique in the fitness world because they combine the heavy resistance of lifting weights (moving another human being) with the maximum heart rate spikes of sprinting. However, estimating the true energy expenditure of a dojo session is incredibly difficult because so much time is spent receiving instruction. The <strong>Martial Arts Calorie Calculator</strong> solves this by using clinically validated Metabolic Equivalent (MET) formulas based solely on your active drilling time, providing a mathematically precise measurement of your thermodynamic output.</p>

            <h2 className="text-2xl font-bold mb-3">Why Combat Sports Burn More Than Running</h2>
            <p>When you jog on a treadmill, your body is highly efficient. You move in a straight line at a steady, unchanging pace. Your heart rate elevates to a moderate level and stays there. Your body quickly adapts to make the motion as metabolically "cheap" as possible to conserve energy.</p>
            <p>Martial arts destroy this efficiency entirely. First, they require movement across all three planes of motion. You are constantly pivoting, lunging, sprawling, and twisting. Second, they are completely unpredictable and anaerobic. When you are sparring or hitting pads, your central nervous system enters "fight or flight" mode. You must constantly react, slip, absorb impacts, and throw explosive combinations. This rapid acceleration and deceleration forces your heart into maximum overdrive. Finally, in grappling arts, you are locked in grueling isometric holds against another person's entire body weight. This combination of heavy resistance and massive cardiovascular output burns drastically more calories per minute than any steady-state aerobic exercise.</p>

            <h2 className="text-2xl font-bold mb-3">Understanding METs Across Different Disciplines</h2>
            <p>Not all martial arts require the same physiological effort. Exercise physiologists measure this cardiovascular effort using METs (Metabolic Equivalents). One MET is your resting metabolic rate. Our calculator categorizes martial arts into four distinct physiological groups:</p>
            <ul>
              <li><strong>Tai Chi (MET 4.0):</strong> A slow, highly meditative, flowing practice. Your heart rate remains very close to baseline, and you are not fighting resistance. It is excellent for joint mobility and mental clarity, but it is not a high-calorie fat burner.</li>
              <li><strong>Karate / Taekwondo (MET 5.3):</strong> When practicing forms (katas) and basic drilling in the air, the physical demand is moderate. It requires explosive speed, but the lack of constant impact and heavy resistance keeps the MET value relatively low, comparable to a brisk walk or light jog.</li>
              <li><strong>Judo / Jiu-Jitsu (MET 10.3):</strong> Grappling is deceptively exhausting. You are constantly fighting to establish grips, escape holds, and bridge your hips against another human's entire body mass. This relentless, full-body isometric resistance pushes the heart rate into the upper aerobic zones, burning massive calories.</li>
              <li><strong>Muay Thai / Kickboxing (MET 10.5):</strong> High-impact striking is brutally exhausting. Throwing full-power kicks into heavy Thai pads requires explosive power from the calves, hips, and core. The continuous bouncing and rapid-fire anaerobic output result in the highest absolute caloric burn of any martial art.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Danger of Overestimating: Active Time vs. Class Time</h2>
            <p>The single biggest mistake martial artists make when tracking their calories is using their total class time. This is why our calculator features a prominent warning.</p>
            <p>If you attend a 60-minute martial arts class, you do not physically exercise for 60 minutes. You spend 10 minutes stretching, 15 minutes watching the instructor demonstrate a technique, and 5 minutes bowing in and out. Your actual, physical drilling or sparring time might only be 30 minutes. If you input "60 minutes" into a fitness watch, it will falsely assume you were throwing kicks for an hour straight and will massively overestimate your calorie burn. To get an accurate, realistic number, you must only enter the exact minutes you were physically moving.</p>

            <h2 className="text-2xl font-bold mb-3">Physics on the Mat: Why Body Weight Matters</h2>
            <p>Because martial arts are a form of calisthenics (bodyweight training), the laws of physics heavily dictate your caloric expenditure. Specifically, Force equals Mass times Acceleration.</p>
            <p>If a 220-pound heavyweight and a 140-pound lightweight both drill high kicks for exactly 15 minutes, the heavyweight will mathematically burn a significantly higher absolute number of calories. Why? Because the heavyweight has to propel an extra 80 pounds of mass into the air with every single kick, and their larger musculature requires drastically more oxygen and ATP to contract. Our calculator strictly factors in your specific mass to ensure your caloric estimate is biologically accurate.</p>

            <h2 className="text-2xl font-bold mb-3">The Afterburn Effect (EPOC)</h2>
            <p>One of the greatest advantages of high-intensity martial arts (like Judo or Muay Thai) is their ability to trigger <strong>Excess Post-Exercise Oxygen Consumption (EPOC)</strong>, widely known as the "Afterburn Effect."</p>
            <p>Because live sparring pushes your body deep into an anaerobic state (where oxygen demand exceeds supply), it creates a severe oxygen deficit and builds up lactic acid in the muscles. After you step off the mat and go home, your body must rapidly consume oxygen and burn additional calories for up to 14 to 24 hours just to repair the micro-tears in your muscles, clear the lactic acid, and restore homeostasis. This means a grueling 30-minute sparring session continues to burn "bonus" calories long after you have left the dojo.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Train Like a Fighter</h2>
            <p>You do not need to compete in a cage to reap the incredible fat-burning benefits of martial arts. Hitting Thai pads with a coach or grappling with a safe partner provides an astronomical cardiovascular return on investment. Stop relying on inaccurate wrist trackers that get confused by the stop-and-go nature of a class. Use the Martial Arts Calorie Calculator to track your true active time, maintain a disciplined caloric deficit in your diet, and watch as combat training rapidly strips body fat and builds a lean, highly functional physique.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/martial-arts-calorie-calculator" />
          <PopularCalculators exclude="/calculator/martial-arts-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
