"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, TrendingDown, TrendingUp, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface WeightChangeInputs {
  unitSystem: "imperial" | "metric";
  startWeight: number;
  currentWeight: number;
  goalWeight?: number; // Optional
}

interface WeightChangeResults {
  absoluteChange: number;
  percentageChange: number;
  direction: "Loss" | "Gain" | "Maintenance";
  colorClass: string;
  
  // Goal metrics
  hasGoal: boolean;
  distanceToGoal: number;
  progressPctToGoal: number; // 0 to 100%
  
  chartData: { name: string; weight: number }[];
}

// 2. Pure Calculation Function
const calculateWeightChange = (inputs: WeightChangeInputs): WeightChangeResults | null => {
  const { startWeight, currentWeight, goalWeight } = inputs;
  
  if (startWeight <= 0 || currentWeight <= 0) return null;

  const absoluteChange = currentWeight - startWeight;
  const percentageChange = (absoluteChange / startWeight) * 100;

  let direction: "Loss" | "Gain" | "Maintenance" = "Maintenance";
  let colorClass = "#3b82f6"; // Default blue

  if (absoluteChange < 0) {
    direction = "Loss";
    colorClass = "#10b981"; // Emerald
  } else if (absoluteChange > 0) {
    direction = "Gain";
    colorClass = "#f59e0b"; // Amber (could be muscle gain, not necessarily bad)
  }

  // Goal logic
  const hasGoal = !!goalWeight && goalWeight > 0;
  let distanceToGoal = 0;
  let progressPctToGoal = 0;

  if (hasGoal && goalWeight) {
    distanceToGoal = Math.abs(goalWeight - currentWeight);
    
    // Total distance needed
    const totalDistance = Math.abs(goalWeight - startWeight);
    const distanceCovered = Math.abs(currentWeight - startWeight);
    
    // Check if moving in the right direction
    const movingTowardsGoal = (goalWeight < startWeight && currentWeight < startWeight) || 
                              (goalWeight > startWeight && currentWeight > startWeight);

    if (totalDistance === 0) {
      progressPctToGoal = 100;
    } else if (movingTowardsGoal) {
      progressPctToGoal = (distanceCovered / totalDistance) * 100;
      // Cap at 100 if they overshot the goal
      if (progressPctToGoal > 100) progressPctToGoal = 100;
    } else {
      progressPctToGoal = 0; // Moving in the wrong direction
    }
  }

  // Generate Chart Data
  const chartData = [
    { name: "Starting", weight: startWeight }
  ];
  
  // Only add Current if it's different enough or if there is no goal, otherwise it gets crowded
  chartData.push({ name: "Current", weight: currentWeight });

  if (hasGoal && goalWeight) {
    chartData.push({ name: "Target Goal", weight: goalWeight });
  }

  return {
    absoluteChange: parseFloat(Math.abs(absoluteChange).toFixed(1)),
    percentageChange: parseFloat(Math.abs(percentageChange).toFixed(2)),
    direction,
    colorClass,
    hasGoal,
    distanceToGoal: parseFloat(distanceToGoal.toFixed(1)),
    progressPctToGoal: parseFloat(progressPctToGoal.toFixed(1)),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  startWeight: "220",
  currentWeight: "195",
  goalWeight: "180"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 border-b border-border pb-1">{payload[0].payload.name}</p>
        <p className="text-muted-foreground mt-1"><span className="font-bold text-foreground">{payload[0].value}</span> units</p>
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

export default function WeightChangePercentageCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [startWeight, setStartWeight] = useState(DEFAULTS.startWeight);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [goalWeight, setGoalWeight] = useState(DEFAULTS.goalWeight);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<WeightChangeResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const s = parseFloat(startWeight);
    const c = parseFloat(currentWeight);
    const g = goalWeight ? parseFloat(goalWeight) : undefined;

    if (isNaN(s) || s <= 0) return setErrorMsg("Please enter a valid starting weight.");
    if (isNaN(c) || c <= 0) return setErrorMsg("Please enter a valid current weight.");

    const res = calculateWeightChange({ unitSystem, startWeight: s, currentWeight: c, goalWeight: g });
    
    if (!res) {
      setErrorMsg("Unable to calculate. Please check your inputs.");
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setUnitSystem(DEFAULTS.unitSystem);
    setStartWeight(DEFAULTS.startWeight);
    setCurrentWeight(DEFAULTS.currentWeight);
    setGoalWeight(DEFAULTS.goalWeight);
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, startWeight, currentWeight, goalWeight]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Weight Change Percentage Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why is tracking percentage more important than raw pounds?", answer: "Raw poundage is completely relative to the size of the organism. If a 130-pound woman loses 10 pounds, she has lost nearly 8% of her total body mass—a massive, visually striking physiological change. If a 350-pound offensive lineman loses 10 pounds, he has lost less than 3% of his body mass; it might not even be visually noticeable. Calculating your loss as a strict percentage provides an objective mathematical assessment of your progress, neutralizing the psychological frustration of comparing yourself to heavier individuals." },
    { question: "What is a safe percentage of weight to lose per week?", answer: "Clinical guidelines universally recommend losing between 0.5% and 1.0% of your total body weight per week. For a 200-pound person, this is 1 to 2 pounds per week. Losing weight faster than 1% per week almost guarantees that you are cannibalizing functional muscle tissue (Lean Body Mass) rather than strictly burning adipose tissue (Fat Mass). Rapid weight loss also drastically lowers your BMR (metabolism), making rebound weight gain highly likely." },
    { question: "Why does the progress bar say 0% even though my weight changed?", answer: "If you entered a Target Goal Weight, the calculator checks the direction of your movement. If your starting weight was 200 lbs and your goal is 180 lbs, but your current weight is 205 lbs, you are moving in the wrong mathematical direction. The calculator will log a negative absolute change (a gain) and register 0% progress toward your stated target." },
    { question: "Is this calculator only for weight loss?", answer: "No. This tool is mathematically agnostic and can calculate weight gain trajectories. If you are an athlete or a bodybuilder attempting a 'bulking' phase, you can enter a starting weight of 170 lbs and a goal weight of 190 lbs. The calculator will detect the upward trajectory, shift the UI to track 'Gain,' and accurately map your percentage of mass accrued." },
    { question: "Why do doctors ask for a 5% to 10% weight loss?", answer: "In the medical community, the '5% to 10%' threshold is considered a critical clinical milestone. Research shows that an obese individual does not need to achieve a 'perfect' BMI to see massive health benefits. Losing just 5% to 10% of total body weight drastically improves blood pressure, significantly lowers cholesterol, and vastly improves insulin sensitivity, dramatically reducing the risk of Type 2 Diabetes." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Weight Change Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Weight Change Percentage Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-slate-500/10 border-l-4 border-slate-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-slate-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-400">
            <strong>The Relativity of Mass:</strong> Losing 10 pounds on a 150-pound frame is a completely different biological event than losing 10 pounds on a 300-pound frame. This calculator removes the emotional bias of raw numbers and tracks your progress as an objective mathematical percentage.
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
                <Target className="h-4 w-4" /> Trajectory Tracking
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter your starting weight and current weight. Optionally, enter a target goal to calculate your exact percentage of progress completed.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="start" label="Starting Weight" value={startWeight} onChange={setStartWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="current" label="Current Weight" value={currentWeight} onChange={setCurrentWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2 border-t border-border pt-4">
              <CompactInput id="goal" label="Target Goal Weight (Optional)" value={goalWeight} onChange={setGoalWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
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
                
                {/* Primary Metric Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Percentage Box */}
                  <div 
                    className="text-white rounded-lg p-5 shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: results.colorClass }}
                  >
                    <div className="relative z-10">
                      <div className="text-white/80 text-[10px] font-bold uppercase tracking-wider mb-1">Total {results.direction} Percentage</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-5xl font-black">{results.percentageChange}%</div>
                      </div>
                      <div className="text-sm font-bold text-white mt-2 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        {results.direction === "Loss" ? <TrendingDown className="h-4 w-4" /> : results.direction === "Gain" ? <TrendingUp className="h-4 w-4" /> : <ActivitySquare className="h-4 w-4" />}
                        Absolute Change: {results.absoluteChange} {unitSystem === "imperial" ? "lbs" : "kg"}
                      </div>
                    </div>
                    <Target className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>

                  {/* Goal Progress Box (If applicable) */}
                  {results.hasGoal ? (
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-sm relative flex flex-col justify-center">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">Goal Completion Status</div>
                      
                      {/* Progress Bar UI */}
                      <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-2 border border-slate-700">
                        <div 
                          className="h-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${results.progressPctToGoal}%`, 
                            backgroundColor: results.colorClass 
                          }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{results.progressPctToGoal}% Complete</span>
                        <span className="text-slate-400">{results.distanceToGoal} {unitSystem === "imperial" ? "lbs" : "kg"} remaining</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-lg p-5 shadow-sm flex flex-col justify-center items-center text-center opacity-50">
                      <Target className="h-6 w-6 text-muted-foreground mb-2" />
                      <div className="text-xs text-muted-foreground font-semibold">No Goal Target Set</div>
                    </div>
                  )}

                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Trajectory Visualization</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">A visual comparison mapping your starting mass against your current location and ultimate target destination.</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="weight" radius={[4, 4, 0, 0]} maxBarSize={80}>
                          {results.chartData.map((entry, index) => {
                            let fill = "hsl(var(--muted))";
                            if (entry.name === "Current") fill = results.colorClass;
                            if (entry.name === "Target Goal") fill = "hsl(var(--primary))";
                            return <Cell key={`cell-${index}`} fill={fill} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Target className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your starting weight and current weight to calculate the exact, objective percentage of body mass you have successfully modified.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">The Mathematics of Relativity</h2>
            <p>One of the most psychologically frustrating aspects of the fitness journey is comparing yourself to others. A 130-pound woman might spend three months dieting rigorously to lose 6 pounds, while her 300-pound husband stops drinking soda for a month and drops 15 pounds. The woman feels defeated because she only looks at the absolute number on the scale. However, the laws of biology operate on relativity, not absolute numbers. Losing 6 pounds on a 130-pound frame is an incredibly difficult, massive physiological shift (nearly 5% of total body mass). Losing 15 pounds on a 300-pound frame is mathematically much easier and represents a smaller percentage. The <strong>Weight Change Percentage Calculator</strong> eliminates emotional bias by translating your progress into a strict, objective mathematical ratio.</p>

            <h2 className="text-2xl font-bold mb-3">Why Doctors Track Percentages</h2>
            <p>In a clinical setting, your physician does not care about raw pounds; they care about percentage thresholds. </p>
            <p>A massive body of medical literature confirms that an obese individual does not need to achieve a "perfect" magazine-cover physique to drastically improve their health. The magic number in the medical community is the <strong>5% to 10% threshold</strong>. Losing just 5% to 10% of your total starting body weight creates a profound biological cascade: it drastically lowers systolic blood pressure, dramatically improves cellular insulin sensitivity, and significantly reduces the visceral fat wrapping around your liver. If you start at 250 pounds, a 10% loss is 25 pounds. You are still mathematically overweight at 225 pounds, but your risk of cardiovascular disease and Type 2 Diabetes has plummeted.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of the "Biggest Loser" Fallacy</h2>
            <p>The fitness industry and reality television have programmed society to believe that healthy weight loss looks like dropping 10 pounds in a single week. This is mathematically absurd and physiologically destructive.</p>
            <p>The clinical gold standard for safe, sustainable weight loss is <strong>0.5% to 1.0% of your body weight per week</strong>. For a 200-pound person, that means a maximum safe loss of 1 to 2 pounds per week. If you lose weight faster than 1% per week, the laws of thermodynamics dictate that you are not just burning fat. You are violently dehydrating your cells and cannibalizing your own functional Lean Body Mass (muscle tissue) for rapid fuel. Destroying your muscle mass permanently lowers your basal metabolic rate, virtually guaranteeing that you will suffer a massive "rebound" weight gain the moment you resume normal eating habits.</p>

            <h2 className="text-2xl font-bold mb-3">Tracking Gain: The Science of Bulking</h2>
            <p>While society focuses obsessively on weight loss, this calculator is mathematically agnostic. It is equally valuable for athletes, bodybuilders, and individuals recovering from severe illness who need to track mass accumulation (hypertrophy).</p>
            <p>When "bulking" to build muscle, the percentage rule still applies, but in reverse. If an athlete attempts to gain weight too quickly (e.g., gaining 3% of their body weight per week), the body cannot physically synthesize muscle tissue that fast. The vast majority of that rapid weight gain will be stored as unnecessary body fat. A controlled, clinical "lean bulk" targets a slow, deliberate percentage increase (roughly 0.25% to 0.5% per week) to ensure the newly acquired mass is primarily dense, functional muscle tissue rather than adipose fat.</p>

            <h2 className="text-2xl font-bold mb-3">The Psychology of the Goal Progress Bar</h2>
            <p>Motivation is notoriously unreliable. It is a fleeting emotion that vanishes the moment you are tired or stressed. Discipline is what builds physiques, and discipline requires objective data tracking.</p>
            <p>When you use the "Target Goal" feature in this calculator, the interface generates a strict visual progress bar. Seeing that you are "42% Complete" triggers the brain's dopamine reward system. It gamifies the difficult process of body recomposition. It prevents you from focusing on the massive mountain left to climb and forces you to acknowledge the mathematical reality of the ground you have already conquered.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Trust the Math, Ignore the Mirror</h2>
            <p>When you stare at yourself in the mirror every single day, you suffer from "change blindness." The gradual shifts in your physique are impossible for your brain to detect in real-time. Do not trust the mirror, and do not let the raw poundage on the scale dictate your mood. Use the Weight Change Percentage Calculator to anchor your progress in cold, objective mathematics. Hit the 5% clinical milestone, push toward the 10% threshold, and permanently alter the trajectory of your metabolic health.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-change-percentage-calculator" />
          <PopularCalculators exclude="/calculator/weight-change-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
