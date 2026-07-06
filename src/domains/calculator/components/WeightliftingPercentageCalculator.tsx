"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface PercentageInputs {
  oneRepMax: number;
  unit: "lbs" | "kg";
  increment: number;
}

interface PercentageResults {
  maxLoad: number;
  tableData: { percentage: number; load: number; category: string; reps: string }[];
  
  grade: string;
  recommendation: string;

  chartData: { percentage: string; load: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculatePercentages = (inputs: PercentageInputs): PercentageResults | null => {
  const { oneRepMax, unit, increment } = inputs;
  
  if (oneRepMax <= 0) return null;

  // Generate table from 50% to 105%
  const tableData = [];
  const chartData = [];
  
  // Custom rounding based on increment (e.g. standard gym plates are usually 5 lbs or 2.5 kg increments)
  const roundLoad = (exactLoad: number, inc: number) => {
    if (inc === 0) return parseFloat(exactLoad.toFixed(1)); // No rounding
    return Math.round(exactLoad / inc) * inc;
  };

  for (let pct = 50; pct <= 105; pct += 5) {
    const exactLoad = oneRepMax * (pct / 100);
    const load = roundLoad(exactLoad, increment);
    
    let category = "";
    let reps = "";
    let color = "";

    if (pct < 65) {
      category = "Speed / Deload / Warmup";
      reps = "8 - 15+";
      color = "#3b82f6"; // Blue
    } else if (pct < 80) {
      category = "Hypertrophy (Muscle Growth)";
      reps = "8 - 12";
      color = "#10b981"; // Green
    } else if (pct < 90) {
      category = "Strength / Power";
      reps = "3 - 6";
      color = "#f59e0b"; // Amber
    } else if (pct <= 100) {
      category = "Absolute Maximum Strength";
      reps = "1 - 2";
      color = "#ef4444"; // Red
    } else {
      category = "Overload / Eccentric Training";
      reps = "Supramaximal";
      color = "#8b5cf6"; // Purple
    }

    tableData.push({ percentage: pct, load, category, reps });
    
    if (pct >= 50 && pct <= 100) {
      chartData.push({ percentage: `${pct}%`, load, color });
    }
  }

  const grade = "1RM Profile Generated";
  const recommendation = "Use the 70-80% ranges for muscle building (hypertrophy) volume blocks, and the 85-95% ranges for peaking absolute strength.";

  const summaryStats = [
    { label: "True 1 Rep Max (100%)", value: `${oneRepMax} ${unit}`, colorClass: "text-primary font-bold text-lg" },
    { label: "Working Set Baseline (75%)", value: `${roundLoad(oneRepMax * 0.75, increment)} ${unit}` },
    { label: "Heavy Single Baseline (90%)", value: `${roundLoad(oneRepMax * 0.90, increment)} ${unit}` },
    { label: "Rounding Increment Applied", value: increment === 0 ? "Exact Decimal" : `Nearest ${increment} ${unit}`, colorClass: "text-muted-foreground italic" }
  ];

  return {
    maxLoad: oneRepMax,
    tableData: tableData.reverse(), // Put highest percentages at the top
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  oneRepMax: "315",
  unit: "lbs" as const,
  increment: "5" // Standard gym plates in lbs
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.percentage} of 1RM</p>
        <p className="text-muted-foreground">Load: <span className="font-bold text-foreground">{payload[0].value}</span></p>
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

export default function WeightliftingPercentageCalculator() {
  // 4. Component State
  const [oneRepMax, setOneRepMax] = useState(DEFAULTS.oneRepMax);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [increment, setIncrement] = useState(DEFAULTS.increment);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<PercentageResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const max = parseFloat(oneRepMax);
    const inc = parseFloat(increment) || 0;

    if (max <= 0) {
      setErrorMsg("Error: 1 Rep Max must be greater than zero.");
      setResults(null);
      return;
    }

    const inputs: PercentageInputs = {
      oneRepMax: max,
      unit,
      increment: inc
    };
    setResults(calculatePercentages(inputs));
  };

  const handleReset = () => {
    setOneRepMax(DEFAULTS.oneRepMax);
    setUnit(DEFAULTS.unit);
    setIncrement(DEFAULTS.increment);
    setErrorMsg("");
    
    setResults(calculatePercentages({
      oneRepMax: parseFloat(DEFAULTS.oneRepMax),
      unit: DEFAULTS.unit,
      increment: parseFloat(DEFAULTS.increment)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneRepMax, unit, increment]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>1RM Percentages</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is percentage-based training important?", answer: "Percentage-based training removes emotion and ego from the gym. Instead of guessing what weight to use, a program dictates exactly what percentage of your 1 Rep Max (1RM) you should lift that day. This ensures you are providing the exact physiological stimulus required to cause adaptation without risking overtraining or central nervous system burnout." },
    { question: "What is the 'Hypertrophy' zone?", answer: "The hypertrophy (muscle building) zone generally exists between 65% and 80% of your 1RM. Lifting in this range allows you to perform roughly 8 to 12 repetitions per set, which provides the optimal balance of mechanical tension and metabolic stress required to trigger muscle protein synthesis." },
    { question: "What is the 'Strength' zone?", answer: "Absolute strength is built in the 85% to 100% range. Lifting in this zone only allows for 1 to 5 repetitions. This type of training heavily taxes the Central Nervous System (CNS), forcing your brain to recruit more motor units and muscle fibers simultaneously. It builds raw strength, but less physical muscle size than the hypertrophy zone." },
    { question: "Why do we round to the nearest 5 lbs (or 2.5 kg)?", answer: "A mathematical calculator might tell you that 75% of your max is exactly 236.25 lbs. However, standard commercial gyms only carry plates in specific increments (usually 2.5 lbs or 1.25 kg). You cannot physically load 236.25 lbs onto a barbell. The calculator's 'Rounding Increment' feature automatically rounds the math to weights you can actually load." },
    { question: "What if I don't know my true 1-Rep Max?", answer: "If you have never performed a true 1-Rep Max (which can be dangerous for beginners), you can estimate it. If you know you can lift 225 lbs for exactly 5 reps, you can use our Repetition Max Calculator to convert that 5RM into an estimated 1RM, and then plug that number into this calculator to generate your program percentages." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Weightlifting Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">1RM Percentage Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Programming Master Table
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Generate a complete percentage-based training matrix (50% to 105%) mapped directly to your 1 Repetition Maximum.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="max" label="Your 1 Rep Max (100%)" value={oneRepMax} onChange={setOneRepMax} />
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">&nbsp;</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setUnit("lbs")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "lbs" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>LBS</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "kg" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>KG</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col mb-1 mt-2 border-t border-border pt-4">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Plate Rounding Increment</label>
              <select 
                value={increment} 
                onChange={(e) => setIncrement(e.target.value)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="5">Round to nearest 5 (Standard LBS Plates)</option>
                <option value="2.5">Round to nearest 2.5 (Standard KG Plates)</option>
                <option value="1">Round to nearest 1 (Micro-loading)</option>
                <option value="0">Do not round (Exact Decimals)</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">Most gym barbells can only be loaded in 5lb or 2.5kg increments.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Table
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Header & Chart */}
                <div className="grid lg:grid-cols-[1fr_250px] gap-4">
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Intensity Escalation Curve</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="percentage" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickMargin={8} domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="load" radius={[2, 2, 0, 0]} maxBarSize={30}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="bg-muted/30 border border-border rounded-lg p-5 flex flex-col justify-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">True 1-Rep Max</div>
                    <div className="text-4xl font-black text-foreground mb-4">{results.maxLoad} <span className="text-lg font-bold text-muted-foreground">{unit}</span></div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">90% (Heavy):</span>
                        <span className="font-bold">{results.tableData.find(d => d.percentage === 90)?.load} {unit}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b border-border/40 pb-2">
                        <span className="text-muted-foreground">75% (Volume):</span>
                        <span className="font-bold">{results.tableData.find(d => d.percentage === 75)?.load} {unit}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">50% (Warmup):</span>
                        <span className="font-bold">{results.tableData.find(d => d.percentage === 50)?.load} {unit}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Detailed Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-secondary/50 px-4 py-3 border-b border-border flex justify-between items-center">
                    <h3 className="font-bold text-foreground">Percentage Matrix</h3>
                    <button onClick={handlePrint} className="text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Table">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Percentage</th>
                          <th className="px-4 py-3 font-semibold text-foreground">Calculated Load</th>
                          <th className="px-4 py-3 font-semibold">Estimated Reps</th>
                          <th className="px-4 py-3 font-semibold">Training Stimulus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {results.tableData.map((row) => (
                          <tr key={row.percentage} className={`hover:bg-muted/10 transition-colors ${row.percentage === 100 ? 'bg-primary/5 font-bold' : ''}`}>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold
                                ${row.percentage >= 90 ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                                  row.percentage >= 80 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                                  row.percentage >= 65 ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                                  'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                }`}>
                                {row.percentage}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-base font-black text-foreground">{row.load} <span className="text-xs font-normal text-muted-foreground">{unit}</span></td>
                            <td className="px-4 py-3 text-muted-foreground">{row.reps}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.category}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your 1-Repetition Maximum to generate a complete, barbell-loadable percentage programming matrix.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Weightlifting Percentage Calculator</h2>
            <p>Walk into any commercial gym, and you will see amateur lifters wandering from machine to machine, guessing what weight they should use that day based purely on how they "feel." This approach almost guarantees plateaus. Professional strength athletes, powerlifters, and Olympic weightlifters do not guess. They use <strong>Percentage-Based Programming</strong>. Every single working set, repetition, and rest period is mathematically derived from a single anchor point: their 1-Repetition Maximum (1RM). The <strong>Weightlifting Percentage Calculator</strong> acts as the central intelligence engine for your training, breaking down your absolute ceiling into specific, actionable physiological zones.</p>

            <h2 className="text-2xl font-bold mb-3">Why Ego is the Enemy of Progress</h2>
            <p>The human Central Nervous System (CNS) is an incredibly sensitive electrical grid. If you attempt to lift 100% of your maximum capability every time you enter the gym, your CNS will rapidly burn out. You will experience severe neurological fatigue, your lifts will regress, and your risk of catastrophic joint injury skyrockets. True strength is built by accumulating volume at sub-maximal loads over a long period of time.</p>
            <p>Percentage-based training removes your ego from the equation. If your program dictates that today is a "Volume Day" consisting of 5 sets of 5 repetitions at 75% of your 1RM, you execute exactly that. You do not load 85% on the bar just because you feel energetic, because doing so would ruin the mathematical progression required for the following week. This calculator provides the exact numbers required to strictly follow professional programming templates (such as 5/3/1, Smolov, or the Texas Method).</p>

            <h2 className="text-2xl font-bold mb-3">Decoding the Training Zones</h2>
            <p>When you generate your matrix using the calculator, you will notice that different percentages trigger vastly different biological adaptations. A weight is not just a weight; the percentage dictates the stimulus.</p>

            <h3>The Hypertrophy Zone (65% to 80%)</h3>
            <p>This is the primary muscle-building zone. Weights in this percentage range are heavy enough to recruit a high number of muscle fibers, but light enough to allow for 8 to 12 repetitions per set. This high repetition count creates a significant amount of "Time Under Tension" and metabolic stress (the "pump"). This mechanical and chemical damage signals the body to synthesize new muscle protein, resulting in larger, thicker muscle bellies.</p>

            <h3>The Strength / Power Zone (85% to 95%)</h3>
            <p>This zone is dedicated almost entirely to neurological adaptation. When you lift 90% of your max, you can only manage 2 to 4 repetitions. The physical muscle tearing (hypertrophy) is actually quite low because the time under tension is so short. However, the weight is so massive that your brain is forced to rapidly fire high-threshold motor units. You are essentially teaching your nervous system to contract your existing muscle fibers harder and faster. You get stronger without necessarily getting larger.</p>

            <h3>The Speed / Dynamic Zone (50% to 60%)</h3>
            <p>Lifting 50% of your max for sets of 10 might feel like a useless warmup, but it has a specific purpose in advanced programming: Speed. Powerlifters use these "Dynamic Effort" days to focus exclusively on acceleration. By lifting a light weight as explosively as humanly possible, you increase your Rate of Force Development (RFD), which translates directly to breaking through sticking points on heavier maximal lifts.</p>

            <h2 className="text-2xl font-bold mb-3">The Importance of Plate Rounding</h2>
            <p>A unique feature of this calculator is the "Plate Rounding Increment." Pure mathematical calculators are useless in a real-world gym environment. If your 1RM is 315 lbs, the pure math states that 82.5% is exactly 259.875 lbs. You cannot load 259.875 lbs onto an Olympic barbell.</p>
            <p>Standard commercial gyms use plates that increase in 5 lb increments (or 2.5 kg increments globally). Our calculator automatically rounds the theoretical math to the nearest physically loadable increment (e.g., rounding 259.875 to 260 lbs). If you belong to a specialized powerlifting gym equipped with micro-fractional plates, you can adjust the rounding increment to 1 lb for extreme precision during peaking blocks.</p>

            <h2 className="text-2xl font-bold mb-3">How to Establish Your 1RM Safely</h2>
            <p>To use this calculator effectively, you must have an accurate 1-Repetition Maximum. However, performing a true 1RM test (loading the absolute heaviest weight you can lift for a single, grinding repetition) is highly taxing and potentially dangerous for beginners.</p>
            <p>If you are not an advanced lifter, do not perform a true 1RM test. Instead, perform an AMRAP (As Many Reps As Possible) test with a sub-maximal weight. For example, load a weight you know you can lift safely, and do it until technical failure. If you lift 225 lbs for 6 clean repetitions, you can use a Repetition Max conversion formula (like the Epley or Brzycki equations) to estimate that your true 1RM is roughly 260 lbs. You then plug that 260 lb estimate into this calculator to safely generate your entire programming matrix.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of the "Training Max" (TM)</h2>
            <p>One of the most profound secrets of elite programming (popularized by Jim Wendler's 5/3/1 program) is the concept of the <strong>Training Max</strong>. Instead of plugging your absolute, 100% true 1RM into the calculator, you plug in 90% of your true max. This artificially lowers every single number on your spreadsheet by 10%.</p>
            <p>Why do this? Because your true 1RM is heavily reliant on environmental factors: you slept 9 hours, ate a massive meal, had 300mg of caffeine, and your favorite song was playing. That is not your everyday reality. By generating your percentages based on a 90% Training Max, you guarantee that you can hit every required rep and set, every single day, even when you are fatigued, stressed, or under-recovered. It ensures constant, unbroken forward momentum without plateaus.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Execute the Math</h2>
            <p>Strength training is applied physics and biology. Stop guessing your weights. Find your 1-Rep Maximum (or calculate an accurate Training Max), input it into the Weightlifting Percentage Calculator, and print your matrix. Walk into the gym with absolute mathematical certainty regarding what weight belongs on the bar for your hypertrophy blocks, your speed days, and your absolute strength peaks. Follow the math, execute the repetitions, and the results are guaranteed.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weightlifting-percentage-calculator" />
          <PopularCalculators exclude="/calculator/weightlifting-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
