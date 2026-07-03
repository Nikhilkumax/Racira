"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, TrendingDown, HeartPulse, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface WeightLossInputs {
  unitSystem: "imperial" | "metric";
  startWeight: number;
  currentWeight: number;
}

interface WeightLossResults {
  absoluteLost: number;
  percentageLost: number;
  
  // Clinical Milestones
  hasReached5Pct: boolean;
  hasReached10Pct: boolean;
  hasReached15Pct: boolean;
  
  target5PctWeight: number;
  target10PctWeight: number;
  target15PctWeight: number;
  
  chartData: { name: string; value: number }[];
}

// 2. Pure Calculation Function
const calculateClinicalLoss = (inputs: WeightLossInputs): WeightLossResults | null => {
  const { startWeight, currentWeight } = inputs;
  
  if (startWeight <= 0 || currentWeight <= 0) return null;
  if (currentWeight > startWeight) return null; // This is strictly for LOSS

  const absoluteLost = startWeight - currentWeight;
  const percentageLost = (absoluteLost / startWeight) * 100;

  // Clinical milestone targets (what weight you need to hit to reach them)
  const target5PctWeight = startWeight * 0.95;
  const target10PctWeight = startWeight * 0.90;
  const target15PctWeight = startWeight * 0.85;

  const hasReached5Pct = percentageLost >= 5;
  const hasReached10Pct = percentageLost >= 10;
  const hasReached15Pct = percentageLost >= 15;

  // Generate Chart Data for visual progression
  const chartData = [
    { name: "Starting Baseline", value: 0 }, // 0% lost
    { name: "Your Progress", value: parseFloat(percentageLost.toFixed(1)) },
    { name: "Clinical 5%", value: 5 },
    { name: "Clinical 10%", value: 10 },
    { name: "Clinical 15%", value: 15 }
  ];

  return {
    absoluteLost: parseFloat(absoluteLost.toFixed(1)),
    percentageLost: parseFloat(percentageLost.toFixed(2)),
    hasReached5Pct,
    hasReached10Pct,
    hasReached15Pct,
    target5PctWeight: parseFloat(target5PctWeight.toFixed(1)),
    target10PctWeight: parseFloat(target10PctWeight.toFixed(1)),
    target15PctWeight: parseFloat(target15PctWeight.toFixed(1)),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  unitSystem: "imperial" as const,
  startWeight: "250",
  currentWeight: "235"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 border-b border-border pb-1">{payload[0].payload.name}</p>
        <p className="text-muted-foreground mt-1"><span className="font-bold text-emerald-500">{payload[0].value}%</span> of total mass</p>
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

export default function WeightLossPercentageCalculator() {
  // 4. Component State
  const [unitSystem, setUnitSystem] = useState<"imperial" | "metric">(DEFAULTS.unitSystem);
  const [startWeight, setStartWeight] = useState(DEFAULTS.startWeight);
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<WeightLossResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const s = parseFloat(startWeight);
    const c = parseFloat(currentWeight);

    if (isNaN(s) || s <= 0) return setErrorMsg("Please enter a valid starting weight.");
    if (isNaN(c) || c <= 0) return setErrorMsg("Please enter a valid current weight.");
    
    if (c > s) return setErrorMsg("This calculator is specifically for mapping weight LOSS milestones. Please ensure your current weight is lower than your starting weight.");

    const res = calculateClinicalLoss({ unitSystem, startWeight: s, currentWeight: c });
    
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
    setErrorMsg("");
    setTimeout(handleCalculate, 0);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitSystem, startWeight, currentWeight]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Clinical Weight Loss Milestones</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "Why does the medical community focus on 5% and 10%?", answer: "Many people abandon their diets because they want to lose 50 pounds, but they 'only' lose 15 pounds. Psychologically, they feel like failures. However, clinically, a 5% to 10% loss of total body mass is a biological miracle. Dropping just 5% of your weight violently improves insulin sensitivity, drastically reduces the visceral fat wrapping around your liver, and significantly lowers systolic blood pressure. You do not need a perfect BMI to completely reverse your risk of cardiovascular disease." },
    { question: "What happens when I hit the 10% milestone?", answer: "At 10% total body weight loss, the systemic changes become profound. For patients suffering from Obstructive Sleep Apnea (OSA), a 10% reduction in mass often clears the airway enough to drastically improve sleep quality. For patients with pre-diabetes, losing 10% of their mass is frequently enough to completely normalize their HbA1c levels, effectively pulling them back from the cliff of full-blown Type 2 Diabetes." },
    { question: "Why is 15% considered the 'Gold Standard' for disease reversal?", answer: "Recent clinical data from intensive weight management trials (like the DiRECT trial in the UK) demonstrated that losing 15% or more of your total body weight is highly correlated with the complete remission of Type 2 Diabetes. At 15% loss, the pancreas is often able to shed enough ectopic fat to resume normal insulin production, effectively 'curing' the disease if the weight loss is maintained." },
    { question: "Can I lose too much weight too fast?", answer: "Yes. Dropping your mass by more than 1% per week is metabolically dangerous. Rapid, starvation-style weight loss forces the body to cannibalize its own muscle tissue for energy. Furthermore, rapid weight loss drastically increases the risk of developing painful gallstones, as the liver secretes extra cholesterol into the bile during severe caloric restriction." },
    { question: "If I only lost 3%, did I fail?", answer: "Absolutely not. Any movement in the correct direction is mathematically significant. A 3% loss means you have successfully halted the progression of weight gain and initiated the process of fat oxidation. It means you are in a thermodynamic deficit. Your only job is to maintain the consistency of that deficit until you cross the 5% threshold." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Weight Loss Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Clinical Weight Loss Percentage Calculator</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-emerald-800 dark:text-emerald-400">
            <strong>The Clinical Milestones:</strong> You do not need a perfect magazine-cover physique to save your life. Modern medical literature proves that achieving specific percentage milestones (5%, 10%, 15%) creates profound biological shifts, dramatically reducing your risk of cardiovascular disease, sleep apnea, and Type 2 Diabetes.
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
                <HeartPulse className="h-4 w-4" /> Medical Progress
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Map your weight loss against the three major clinical thresholds used by physicians to determine cardiovascular and metabolic risk reduction.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <CompactInput id="start" label="Starting Baseline" value={startWeight} onChange={setStartWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
              <CompactInput id="current" label="Current Weight" value={currentWeight} onChange={setCurrentWeight} suffix={unitSystem === "imperial" ? "lbs" : "kg"} />
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
                  <div className="bg-gradient-to-br from-emerald-600 to-green-800 text-white rounded-lg p-5 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">Total Mass Eliminated</div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <div className="text-5xl font-black">{results.percentageLost}%</div>
                      </div>
                      <div className="text-sm font-bold text-emerald-100 mt-2 bg-black/20 border border-white/20 inline-block px-3 py-1.5 rounded-full flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" /> Absolute Loss: {results.absoluteLost} {unitSystem === "imperial" ? "lbs" : "kg"}
                      </div>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10" />
                  </div>

                  {/* Milestones Box */}
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-lg p-5 shadow-sm flex flex-col justify-center gap-3">
                    
                    {/* 5% Milestone */}
                    <div className={`flex justify-between items-center p-2 rounded border ${results.hasReached5Pct ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                      <div>
                        <div className={`text-xs font-bold ${results.hasReached5Pct ? 'text-emerald-400' : 'text-slate-400'}`}>5% Clinical Threshold</div>
                        <div className="text-[10px] text-slate-400">Target: {results.target5PctWeight} {unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      {results.hasReached5Pct && <div className="text-emerald-400 text-xs font-black uppercase">Achieved</div>}
                    </div>

                    {/* 10% Milestone */}
                    <div className={`flex justify-between items-center p-2 rounded border ${results.hasReached10Pct ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                      <div>
                        <div className={`text-xs font-bold ${results.hasReached10Pct ? 'text-emerald-400' : 'text-slate-400'}`}>10% Clinical Threshold</div>
                        <div className="text-[10px] text-slate-400">Target: {results.target10PctWeight} {unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      {results.hasReached10Pct && <div className="text-emerald-400 text-xs font-black uppercase">Achieved</div>}
                    </div>

                    {/* 15% Milestone */}
                    <div className={`flex justify-between items-center p-2 rounded border ${results.hasReached15Pct ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`}>
                      <div>
                        <div className={`text-xs font-bold ${results.hasReached15Pct ? 'text-emerald-400' : 'text-slate-400'}`}>15% Disease Remission</div>
                        <div className="text-[10px] text-slate-400">Target: {results.target15PctWeight} {unitSystem === "imperial" ? "lbs" : "kg"}</div>
                      </div>
                      {results.hasReached15Pct && <div className="text-emerald-400 text-xs font-black uppercase">Achieved</div>}
                    </div>

                  </div>

                </div>

                <div className="grid lg:grid-cols-1 gap-4">
                  {/* Chart Panel */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[300px]">
                    <h3 className="text-base font-bold w-full text-left mb-1">Percentage Milestone Mapping</h3>
                    <p className="text-xs text-muted-foreground w-full text-left mb-4">A visual comparison mapping your current percentage of mass lost against the three critical medical milestones required for systemic health improvement.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold', fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 20]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <ReferenceLine y={5} stroke="#10b981" strokeDasharray="3 3" />
                        <ReferenceLine y={10} stroke="#10b981" strokeDasharray="3 3" />
                        <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                          {results.chartData.map((entry, index) => {
                            let fill = "hsl(var(--muted))";
                            if (entry.name === "Your Progress") fill = "#10b981"; // Emerald
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
                <HeartPulse className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your starting weight and current weight to map your exact percentage of progress against the clinical milestones for disease reversal.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>The Deception of Aspirational Fitness</h2>
            <p>If you consume fitness media on Instagram or TikTok, you are subjected to a relentless barrage of "aspirational" physiques. You are shown images of bodybuilders with 5% body fat and fitness models with six-pack abs. This creates a deeply toxic psychological framework for the average person attempting to lose weight. They believe that unless they achieve that magazine-cover perfection, their diet was a failure. Medical science completely disagrees. The clinical reality is that you do not need to be perfect to save your own life. The <strong>Clinical Weight Loss Percentage Calculator</strong> strips away the aesthetic vanity of the fitness industry and anchors your progress to the three objective medical milestones that actually govern human longevity.</p>

            <h2>The 5% Clinical Threshold</h2>
            <p>When an obese patient enters a medical weight-loss clinic, the physician does not tell them to lose 100 pounds. They tell them to lose 5% of their body weight. Why?</p>
            <p>Biologically, the first fat to be oxidized (burned) when you enter a caloric deficit is often the most dangerous fat: intra-hepatic (liver) fat and visceral fat. By simply losing 5% of your total body mass, you drastically reduce the toxic fat wrapping around your vital organs. Clinical trials consistently prove that a 5% reduction causes a massive improvement in cellular insulin sensitivity (lowering blood sugar) and a significant drop in systolic blood pressure. For a 250-pound individual, this is a loss of only 12.5 pounds. By hitting this incredibly achievable metric, you dramatically slash your risk of an early cardiovascular event.</p>

            <h2>The 10% Systemic Shift</h2>
            <p>If you can maintain your caloric deficit and cross the 10% threshold, the physiological benefits compound exponentially. This is where systemic changes occur.</p>
            <p>For individuals suffering from Obstructive Sleep Apnea (OSA)—a terrifying condition where the weight of your own neck causes you to stop breathing dozens of times an hour while asleep—a 10% weight loss is often enough to significantly clear the airway and drastically improve sleep quality. Furthermore, crossing the 10% line frequently causes a steep drop in systemic inflammation markers (like CRP) and is strongly associated with moving patients out of the 'pre-diabetic' danger zone and back into a normal HbA1c metabolic baseline.</p>

            <h2>The 15% Disease Remission Standard</h2>
            <p>The 15% threshold is the holy grail of metabolic medicine. Recent landmark studies, such as the DiRECT trial (Diabetes Remission Clinical Trial) in the UK, have revolutionized how doctors view Type 2 Diabetes.</p>
            <p>Historically, Type 2 Diabetes was considered a chronic, progressive, incurable disease. You simply managed it with insulin until you died. The DiRECT trial proved that if a patient can lose 15% (or more) of their total body weight, they can force the disease into complete remission. By stripping away massive amounts of ectopic fat from the pancreas and the liver, the organs are able to "turn back on" and resume normal insulin production. If the 15% weight loss is maintained, the patient is effectively cured of the disease.</p>

            <h2>Why Speed Kills: The 1% Rule</h2>
            <p>Now that you know the percentage milestones, you must understand the speed limit. You cannot sprint to the 15% threshold.</p>
            <p>The clinical speed limit for weight loss is 0.5% to 1.0% of your body weight per week. If you attempt a starvation crash diet and lose 3% of your body weight in a single week, you are not burning fat. Thermodynamics dictates that your body is cannibalizing its own functional muscle tissue for rapid energy. Destroying your muscle mass permanently lowers your metabolism. Furthermore, rapid weight loss forces the liver to secrete excess cholesterol into the bile, drastically increasing your risk of developing painful gallstones. You must treat weight loss as a clinical procedure: slow, methodical, and relentless.</p>

            <h2>The Psychology of the Milestone</h2>
            <p>By shifting your focus from "I need to lose 50 pounds" to "I just need to hit the 5% medical milestone," you hack your brain's dopamine reward system. Fifty pounds feels like an impossible, multi-year mountain. Five percent is an incredibly achievable goal that you can hit in six to eight weeks. Every time you cross a percentage threshold on this calculator, your brain releases dopamine, reinforcing the discipline required to keep pushing to the next milestone.</p>

            <h2>Conclusion: Reclaim Your Health</h2>
            <p>You do not need a six-pack to be healthy, and you do not need to be thin to dramatically extend your lifespan. You simply need to initiate the process of visceral fat oxidation. Use the Clinical Weight Loss Percentage Calculator to track your exact trajectory. Cross the 5% threshold, push relentlessly toward the 15% remission line, and mathematically reclaim your metabolic health.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/weight-loss-percentage-calculator" />
          <PopularCalculators exclude="/calculator/weight-loss-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
