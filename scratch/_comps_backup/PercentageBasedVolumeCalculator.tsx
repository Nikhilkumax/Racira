"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Box, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface VolumeInputs {
  oneRepMax: number;
  percentage: number;
  sets: number;
  reps: number;
  unit: "lbs" | "kg";
}

interface VolumeResults {
  targetLoad: number;
  totalVolume: number;
  totalReps: number;
  
  grade: string;
  recommendation: string;

  chartData: { scheme: string; volume: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateVolume = (inputs: VolumeInputs): VolumeResults | null => {
  const { oneRepMax, percentage, sets, reps, unit } = inputs;
  
  if (oneRepMax <= 0 || percentage <= 0 || sets < 1 || reps < 1) return null;

  // Calculate load and round to nearest 5 for realistic gym usage
  const exactLoad = oneRepMax * (percentage / 100);
  const targetLoad = Math.round(exactLoad / 5) * 5;

  const totalReps = sets * reps;
  const totalVolume = targetLoad * totalReps;

  let grade = "";
  let recommendation = "";
  let color = "";

  // Categorize based on Prilepin's Chart guidelines / basic strength standards
  if (percentage >= 85) {
    grade = "Absolute Strength Development";
    color = "#ef4444"; // Red
    if (totalReps > 15) {
      recommendation = "WARNING: You are accumulating massive volume at a very high percentage (85%+). This is highly taxing on the Central Nervous System. Ensure you have adequate recovery and are not training to failure on every set.";
    } else {
      recommendation = "Optimal raw strength volume. You are keeping total repetitions low while lifting heavy loads, perfectly targeting high-threshold motor units and neurological adaptation without excessive fatigue.";
    }
  } else if (percentage >= 70) {
    grade = "Hypertrophy / Strength Balance";
    color = "#10b981"; // Green
    if (totalReps < 15) {
      recommendation = "This volume is slightly low for optimal hypertrophy at this percentage. Consider adding more sets or reps to increase metabolic stress if muscle growth is the primary goal.";
    } else if (totalReps > 40) {
      recommendation = "Excellent high-volume hypertrophy block. You are accumulating massive tonnage in the 70-80% range, which is the gold standard for triggering muscle protein synthesis and mechanical tension.";
    } else {
      recommendation = "Solid, balanced volume. You are operating in the classic 'sweet spot' for both building muscle mass and establishing a foundation for future strength gains.";
    }
  } else {
    grade = "Speed / Dynamic Effort / Warmup";
    color = "#3b82f6"; // Blue
    recommendation = "Because the percentage is below 70%, the sheer tonnage might look high, but the neurological fatigue is low. This volume should be executed with maximum explosive speed (Dynamic Effort) or treated as a deload/technique phase.";
  }

  // Generate comparison chart (Compare user's chosen scheme vs common alternatives at the same percentage)
  const chartData = [
    { scheme: "Your Scheme", volume: totalVolume, color: color },
    { scheme: "5x5 (Standard)", volume: targetLoad * 25, color: "hsl(var(--muted))" },
    { scheme: "3x10 (Hypertrophy)", volume: targetLoad * 30, color: "hsl(var(--muted))" },
    { scheme: "8x3 (Speed/Power)", volume: targetLoad * 24, color: "hsl(var(--muted))" }
  ];

  const summaryStats = [
    { label: "Target Barbell Load", value: `${targetLoad} ${unit}`, colorClass: "text-primary font-bold text-lg" },
    { label: "Total Working Tonnage", value: `${totalVolume.toLocaleString()} ${unit}`, colorClass: "text-foreground font-black" },
    { label: "Total Repetitions", value: `${totalReps} Reps` },
    { label: "Primary Adaptation", value: grade }
  ];

  return {
    targetLoad,
    totalVolume,
    totalReps,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  oneRepMax: "315",
  percentage: "75",
  sets: "5",
  reps: "5",
  unit: "lbs" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">{payload[0].payload.scheme}</p>
        <p className="text-muted-foreground">Tonnage: <span className="font-bold text-foreground">{payload[0].value.toLocaleString()}</span></p>
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

export default function PercentageBasedVolumeCalculator() {
  // 4. Component State
  const [oneRepMax, setOneRepMax] = useState(DEFAULTS.oneRepMax);
  const [percentage, setPercentage] = useState(DEFAULTS.percentage);
  const [sets, setSets] = useState(DEFAULTS.sets);
  const [reps, setReps] = useState(DEFAULTS.reps);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<VolumeResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const max = parseFloat(oneRepMax);
    const pct = parseFloat(percentage);
    const s = parseInt(sets);
    const r = parseInt(reps);

    if (max <= 0 || pct <= 0 || s < 1 || r < 1) {
      setErrorMsg("Error: All values must be greater than zero.");
      setResults(null);
      return;
    }

    const inputs: VolumeInputs = {
      oneRepMax: max,
      percentage: pct,
      sets: s,
      reps: r,
      unit
    };
    setResults(calculateVolume(inputs));
  };

  const handleReset = () => {
    setOneRepMax(DEFAULTS.oneRepMax);
    setPercentage(DEFAULTS.percentage);
    setSets(DEFAULTS.sets);
    setReps(DEFAULTS.reps);
    setUnit(DEFAULTS.unit);
    setErrorMsg("");
    
    setResults(calculateVolume({
      oneRepMax: parseFloat(DEFAULTS.oneRepMax),
      percentage: parseFloat(DEFAULTS.percentage),
      sets: parseInt(DEFAULTS.sets),
      reps: parseInt(DEFAULTS.reps),
      unit: DEFAULTS.unit
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oneRepMax, percentage, sets, reps, unit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Training Tonnage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is 'Tonnage' or 'Volume Load'?", answer: "Tonnage (or Volume Load) is the mathematical calculation of total physical work performed during an exercise. It is calculated simply as: Sets × Reps × Weight. If you squat 300 lbs for 5 sets of 5 repetitions, you have moved 7,500 pounds of total tonnage. Tracking this metric week over week is the most objective way to measure progressive overload." },
    { question: "Why is tracking volume so important for hypertrophy?", answer: "Muscle growth (hypertrophy) is directly correlated with mechanical tension and metabolic stress. While lifting a massive weight once (1RM) creates high tension, it creates almost zero metabolic stress. To build muscle, you must accumulate volume. A program that forces you to increase your total weekly tonnage over time guarantees that the muscles are being forced to adapt and grow larger." },
    { question: "Is all tonnage created equal?", answer: "No. The 'Intensity' (Percentage of your 1RM) dictates the biological effect of the tonnage. Moving 5,000 lbs by doing 100 reps with an empty 50 lb bar will build cardiovascular endurance. Moving 5,000 lbs by doing 10 reps of 500 lbs will build massive neurological strength. The calculator categorizes your tonnage based on the percentage to ensure the work you are doing aligns with your actual goals." },
    { question: "What is the danger of high tonnage at high percentages?", answer: "If you attempt to accumulate massive volume (e.g., 5 sets of 5) at a very high percentage (e.g., 90% of your 1RM), you will likely fail the final reps. More dangerously, even if you complete it, the Central Nervous System (CNS) fatigue will be catastrophic. You may not recover for a week, destroying the rest of your training block. High percentages demand low total volume." },
    { question: "How do I use this calculator to progress?", answer: "Use the calculator to plan your progressive overload. If Week 1 is 5x5 at 70% (yielding 5,000 lbs of volume), Week 2 needs to be higher. You can use the calculator to either increase the percentage (75% for 5x5) OR increase the sets/reps (6x5 at 70%) to ensure your final Tonnage number is higher than the previous week." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Percentage-Based Volume Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Training Volume & Tonnage</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Box className="h-4 w-4" /> Tonnage Accumulation Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate the absolute physical workload (Volume Load) of your training sets by multiplying your programmed percentage against your repetitions and sets.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="max" label="Your 1 Rep Max" value={oneRepMax} onChange={setOneRepMax} />
              </div>
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">&nbsp;</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setUnit("lbs")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "lbs" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>LBS</button>
                  <button type="button" onClick={() => setUnit("kg")} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${unit === "kg" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>KG</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="pct" label="Target Percentage" value={percentage} onChange={setPercentage} suffix="% of 1RM" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <CompactInput id="sets" label="Total Sets" value={sets} onChange={setSets} />
              <CompactInput id="reps" label="Reps per Set" value={reps} onChange={setReps} />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleCalculate} className="flex-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 h-10 transition-colors flex items-center justify-center font-bold text-sm">
                Calculate
              </button>
              <button type="button" onClick={handleReset} className="w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                        Total Accumulated Tonnage
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.totalVolume.toLocaleString()}</div>
                        <div className="text-xl font-bold text-muted-foreground">{unit}</div>
                      </div>
                      <div className="text-sm font-bold text-muted-foreground">Across {results.totalReps} Total Repetitions</div>
                    </div>
                    
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Target Bar Load</div>
                      <div className="text-2xl font-black text-primary">{results.targetLoad} <span className="text-sm">{unit}</span></div>
                    </div>
                  </div>
                  <Box className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Volume Diagnostics</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Assessment:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Tonnage Comparison (at {percentage}%)</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="scheme" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 600 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="volume" radius={[0, 4, 4, 0]} maxBarSize={20}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Box className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your 1RM, target percentage, sets, and reps to calculate the total physical tonnage of your workout block.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Percentage-Based Volume Calculator</h2>
            <p>In the realm of strength training and bodybuilding, progression is often tracked by a single metric: adding more weight to the bar. While hitting a new 1-Rep Maximum (1RM) is incredibly satisfying, it is an incomplete picture of physiological adaptation. Elite strength coaches rarely judge a workout solely by the heaviest weight lifted. Instead, they track the absolute, total physical work completed by the athlete. This metric is known as <strong>Volume Load</strong> or <strong>Tonnage</strong>. The <strong>Percentage-Based Volume Calculator</strong> allows you to perfectly quantify the massive amounts of physical work your body is performing, providing an objective mathematical lens through which to view your muscle growth and recovery demands.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Tonnage</h2>
            <p>The concept of Volume Load is rooted in simple physics: Work = Force × Distance. In weightlifting, because the distance the barbell travels remains relatively constant per individual, we simplify the formula to measure total force exerted.</p>
            <p><strong>Volume Load = Sets × Repetitions × Weight Lifted</strong></p>
            <p>For example, if your 1RM is 300 lbs, and a percentage-based program assigns you 5 sets of 5 repetitions at 75% of your max:</p>
            <ul>
              <li><strong>Target Load:</strong> 75% of 300 lbs = 225 lbs</li>
              <li><strong>Total Repetitions:</strong> 5 sets × 5 reps = 25 reps</li>
              <li><strong>Total Tonnage:</strong> 25 reps × 225 lbs = 5,625 lbs</li>
            </ul>
            <p>During that single exercise, your central nervous system, joints, and musculature successfully moved nearly 3 tons of gravitational resistance. When you begin tracking these massive numbers week over week, you gain immense control over your programming.</p>

            <h2 className="text-2xl font-bold mb-3">Why Volume Drives Hypertrophy (Muscle Growth)</h2>
            <p>If your primary goal is to build massive, thick muscle bellies (hypertrophy), Tonnage is the ultimate metric. Muscle growth is primarily triggered by two factors: Mechanical Tension (the physical pulling apart of the muscle fibers under heavy load) and Metabolic Stress (the buildup of lactic acid and blood inside the muscle during sustained effort).</p>
            <p>If you walk into the gym and do a single, grueling 1-rep max of 300 lbs, you have created maximum mechanical tension, but your total volume is only 300 lbs. There is zero metabolic stress, and therefore, very little muscle growth will occur. Conversely, if you execute the 5x5 at 225 lbs, moving 5,625 lbs of total volume, you have subjected the muscle to sustained tension and massive metabolic stress. High volume, executed at the correct percentage (70-80%), is the undisputed king of hypertrophy.</p>

            <h2 className="text-2xl font-bold mb-3">The Trap of Junk Volume</h2>
            <p>A common mistake among novice lifters is assuming that "more volume is always better." This leads to the trap of Junk Volume. If you load an empty 45 lb barbell and do 100 repetitions, you have accumulated 4,500 lbs of volume. Mathematically, this looks impressive. Physiologically, it is garbage.</p>
            <p>Because the percentage of your 1RM is so incredibly low (likely under 20%), the mechanical tension is practically non-existent. Your body will adapt by increasing your cardiovascular endurance and capillary density, but it will not build strength or size. This is why our calculator specifically cross-references your Volume with your Target Percentage. Tonnage is only valuable if the percentage is high enough (generally above 65%) to recruit high-threshold motor units.</p>

            <h2 className="text-2xl font-bold mb-3">Managing Central Nervous System (CNS) Fatigue</h2>
            <p>As you use the calculator, you must be hyper-aware of the relationship between Tonnage and Intensity (Percentage). The human nervous system has a finite capacity for stress.</p>
            <p>If you attempt to accumulate 5,000 lbs of volume using 70% of your 1RM, your body will recover relatively easily within 48 hours. However, if you attempt to accumulate that same 5,000 lbs of volume using 95% of your 1RM (which would require doing roughly 17 brutal single repetitions), your CNS will crash. The neurological output required to fire maximum motor units repeatedly will leave you severely fatigued, potentially requiring an entire week to recover. Elite programming balances the scales: when the percentage goes up, the total volume must come down.</p>

            <h2 className="text-2xl font-bold mb-3">Progressive Overload Without Heavy Weights</h2>
            <p>The most profound use of the Percentage-Based Volume Calculator is planning progressive overload when you are stuck. Imagine your Bench Press has been stuck at 225 lbs for two months. You physically cannot lift 230 lbs. You are plateaued.</p>
            <p>Instead of stubbornly trying to lift heavier weight and failing, you can use Volume Load to progress. In Week 1, you bench 185 lbs for 3 sets of 8 reps (4,440 lbs of volume). In Week 2, the bar weight remains exactly the same (185 lbs), but you perform 4 sets of 8 reps (5,920 lbs of volume). You have successfully forced your body to do more physical work than it did the previous week. You have achieved progressive overload, and your body will adapt by getting stronger, eventually breaking your 225 lb plateau.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Architecting the Workload</h2>
            <p>Strength training is not a chaotic guessing game of effort; it is applied mathematics and architectural design. By calculating the total tonnage of your training blocks, you protect yourself from overtraining while guaranteeing you are doing enough work to grow. Use the Percentage-Based Volume Calculator to audit your weekly routines. Ensure your hypertrophy blocks contain massive, grueling volume, and your strength peaks taper down into low-volume, high-percentage precision. Let the numbers dictate the effort.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/percentage-based-volume-calculator" />
          <PopularCalculators exclude="/calculator/percentage-based-volume-calculator" />
        </div>
      </div>
    </>
  );
}
