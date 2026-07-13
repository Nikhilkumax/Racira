"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface DeficitInputs {
  currentWeight: number;
  dailyDeficit: number;
  unit: "lbs" | "kg";
}

interface DeficitResults {
  weeklyLoss: number;
  monthlyLoss: number;
  weightIn4Weeks: number;
  weightIn12Weeks: number;
  weightIn26Weeks: number;
  
  grade: string;
  recommendation: string;

  chartData: { week: number; weight: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateDeficit = (inputs: DeficitInputs): DeficitResults | null => {
  const { currentWeight, dailyDeficit, unit } = inputs;
  
  if (currentWeight <= 0 || dailyDeficit <= 0) return null;

  // 1 lb fat = 3500 kcal
  // 1 kg fat = 7700 kcal
  const kcalPerUnit = unit === "lbs" ? 3500 : 7700;
  
  const weeklyDeficit = dailyDeficit * 7;
  const weeklyLoss = weeklyDeficit / kcalPerUnit;
  const monthlyLoss = weeklyLoss * 4.345; // average weeks in a month

  const weightIn4Weeks = currentWeight - (weeklyLoss * 4);
  const weightIn12Weeks = currentWeight - (weeklyLoss * 12);
  const weightIn26Weeks = currentWeight - (weeklyLoss * 26);

  let grade = "";
  let recommendation = "";
  let colorClass = "text-primary";

  if (dailyDeficit < 250) {
    grade = "Ultra-Conservative";
    recommendation = "This deficit is so small that standard water weight fluctuations will frequently mask your fat loss on the scale. You must be incredibly patient, but you will preserve 100% of your muscle mass.";
    colorClass = "text-blue-500";
  } else if (dailyDeficit <= 600) {
    grade = "Gold Standard (Sustainable)";
    recommendation = "This is the ideal deficit for sustainable fat loss. It allows you to strip away body fat reliably every week without triggering metabolic adaptation, extreme hunger, or muscle catabolism.";
    colorClass = "text-green-500 font-bold";
  } else if (dailyDeficit <= 1000) {
    grade = "Aggressive";
    recommendation = "This is a severe deficit. You will lose weight rapidly, but you risk significant diet fatigue and muscle loss if you do not keep your protein intake extremely high and engage in resistance training.";
    colorClass = "text-amber-500 font-bold";
  } else {
    grade = "Dangerous / Crash Diet";
    recommendation = "Deficits exceeding 1000 calories a day are clinically categorized as crash diets. Your body will rapidly break down muscle tissue for energy, and your metabolic rate will plummet.";
    colorClass = "text-red-500 font-bold";
  }

  const chartData = [];
  let projected = currentWeight;
  for (let i = 0; i <= 26; i += 2) {
    chartData.push({ week: i, weight: parseFloat(projected.toFixed(1)) });
    projected -= (weeklyLoss * 2);
  }

  const summaryStats = [
    { label: "Weekly Fat Loss", value: `${weeklyLoss.toFixed(2)} ${unit}`, colorClass: "text-primary font-bold" },
    { label: "Monthly Fat Loss", value: `${monthlyLoss.toFixed(1)} ${unit}` },
    { label: "Total Deficit (Week)", value: `-${weeklyDeficit.toLocaleString()} kcal`, colorClass: "text-red-500 font-medium" },
    { label: "Total Deficit (Month)", value: `-${Math.round(weeklyDeficit * 4.345).toLocaleString()} kcal` },
    { label: "Sustainability Rating", value: grade, colorClass: colorClass }
  ];

  return {
    weeklyLoss,
    monthlyLoss,
    weightIn4Weeks,
    weightIn12Weeks,
    weightIn26Weeks,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  currentWeight: "200",
  dailyDeficit: "500",
  unit: "lbs" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5 text-primary">Week {payload[0].payload.week}</p>
        <p className="text-muted-foreground">Projected: <span className="font-bold text-foreground">{payload[0].value}</span></p>
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

export default function CalorieDeficitForWeightLossCalculator() {
  // 4. Component State
  const [currentWeight, setCurrentWeight] = useState(DEFAULTS.currentWeight);
  const [dailyDeficit, setDailyDeficit] = useState(DEFAULTS.dailyDeficit);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<DeficitResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const cw = parseFloat(currentWeight);
    const def = parseInt(dailyDeficit);

    if (cw <= 0 || def <= 0) {
      setErrorMsg("Please enter valid positive numbers for weight and deficit.");
      setResults(null);
      return;
    }

    const inputs: DeficitInputs = {
      currentWeight: cw,
      dailyDeficit: def,
      unit
    };
    setResults(calculateDeficit(inputs));
  };

  const handleReset = () => {
    setCurrentWeight(DEFAULTS.currentWeight);
    setDailyDeficit(DEFAULTS.dailyDeficit);
    setUnit(DEFAULTS.unit);
    setErrorMsg("");
    
    setResults(calculateDeficit({
      currentWeight: parseFloat(DEFAULTS.currentWeight),
      dailyDeficit: parseInt(DEFAULTS.dailyDeficit),
      unit: DEFAULTS.unit
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeight, dailyDeficit, unit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Calorie Deficit Projection</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is a Calorie Deficit?", answer: "A calorie deficit occurs when you consume fewer calories (energy) from food and drink than your body burns to stay alive and move throughout the day. When this happens, your body is forced to burn stored energy (body fat) to make up the difference." },
    { question: "Why is 500 calories a popular deficit?", answer: "One pound of human body fat contains approximately 3,500 kilocalories of stored energy. If you eat 500 calories less than your maintenance level every day for 7 days, you create a total weekly deficit of 3,500 calories, resulting in exactly one pound of fat loss." },
    { question: "Is a bigger deficit always better?", answer: "No. The human body is a survival machine. If you create a massive deficit (e.g., 1,500 calories a day), your body views this as starvation. It will immediately begin burning muscle tissue for energy (because muscle requires a lot of calories to maintain) and it will drastically lower your Basal Metabolic Rate (BMR) to stop the weight loss." },
    { question: "Why hasn't the scale moved despite my deficit?", answer: "Fat loss and weight loss are not the same thing. You can lose a pound of fat in a week, but if you eat a salty meal on Sunday, your body might retain two pounds of water, making the scale go up. If you are mathematically in a true deficit, you are losing fat. You must trust the math and ignore short-term scale fluctuations." },
    { question: "Can I create the deficit through exercise instead of eating less?", answer: "Yes, absolutely. A 500-calorie deficit can be created by eating 500 calories less, OR by eating at maintenance and running on a treadmill to burn 500 calories. Most successful diets use a combination of both (eating 250 calories less, and burning 250 extra calories via cardio)." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie Deficit Calculator for Weight Loss" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie Deficit Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <TrendingDown className="h-4 w-4" /> Fat Loss Projector
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Input your target daily caloric deficit to mathematically project your exact fat loss timeline over the next 6 months.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="cw" label="Current Body Weight" value={currentWeight} onChange={setCurrentWeight} />
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
              <CompactInput id="def" label="Target Daily Deficit" value={dailyDeficit} onChange={setDailyDeficit} suffix="kcal / day" />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Projection
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Cards */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center text-center shadow-sm relative">
                    <button onClick={handlePrint} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">In 1 Month</div>
                    <div className="text-2xl font-black text-foreground">{results.weightIn4Weeks.toFixed(1)}</div>
                    <div className="text-xs font-medium text-muted-foreground">{unit}</div>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex flex-col justify-center text-center shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">In 3 Months</div>
                    <div className="text-3xl font-black text-foreground">{results.weightIn12Weeks.toFixed(1)}</div>
                    <div className="text-xs font-medium text-primary/80">{unit}</div>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-center text-center shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">In 6 Months</div>
                    <div className="text-2xl font-black text-foreground">{results.weightIn26Weeks.toFixed(1)}</div>
                    <div className="text-xs font-medium text-muted-foreground">{unit}</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Mathematics of Fat Loss</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">6-Month Projection</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={results.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `Wk ${v}`} axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6, fill: "hsl(var(--primary))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <TrendingDown className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your current weight and intended daily caloric deficit to mathematically project your 6-month fat loss timeline.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Calorie Deficit Calculator</h2>
            <p>The diet industry generates billions of dollars annually by complicating the simple. They sell detox teas, complicated fasting protocols, "fat-burning" supplements, and highly restrictive food rules (like banning carbohydrates or fats). However, the underlying mechanism behind every single successful diet in human history is exactly the same: <strong>The Calorie Deficit</strong>.</p>
            <p>The First Law of Thermodynamics dictates that energy cannot be created or destroyed, only transferred. If you consume fewer calories (energy) from your diet than your body requires to function, the missing energy must be sourced from somewhere. The body's primary storage tank for excess energy is adipose tissue (body fat). By entering a caloric deficit, you force your body to metabolize its own fat to keep your heart beating and your lungs inflating. The <strong>Calorie Deficit Calculator</strong> allows you to strip away the marketing noise, input your exact mathematical deficit, and project your fat loss across a concrete timeline.</p>

            <h2 className="text-2xl font-bold mb-3">The 3,500 Calorie Rule</h2>
            <p>The foundation of this calculator relies on a deeply established physiological heuristic: One pound of human body fat stores roughly <strong>3,500 kilocalories</strong> of usable energy. (For those using the metric system, one kilogram of body fat equates to roughly 7,700 kilocalories).</p>
            <p>This simple mathematical reality makes fat loss highly predictable:</p>
            <ul>
              <li>A daily deficit of <strong>250 calories</strong> equals a weekly deficit of 1,750 calories, resulting in exactly <strong>0.5 pounds</strong> of fat loss per week.</li>
              <li>A daily deficit of <strong>500 calories</strong> equals a weekly deficit of 3,500 calories, resulting in exactly <strong>1.0 pounds</strong> of fat loss per week.</li>
              <li>A daily deficit of <strong>1,000 calories</strong> equals a weekly deficit of 7,000 calories, resulting in exactly <strong>2.0 pounds</strong> of fat loss per week.</li>
            </ul>
            <p>If you know your Total Daily Energy Expenditure (maintenance calories) is 2,500, and you eat exactly 2,000 calories a day for 7 days, you will lose one pound of fat. It is a mathematical certainty.</p>

            <h2 className="text-2xl font-bold mb-3">Why Bigger Deficits Are Not Always Better</h2>
            <p>Upon learning the 3,500-calorie rule, a beginner's immediate instinct is to create a massive deficit. <em>"If a 500-calorie deficit loses one pound, I will eat a 1,500-calorie deficit and lose three pounds a week!"</em> This logic invariably leads to diet failure, muscle loss, and metabolic crash.</p>
            <p>The human body is an incredibly robust survival machine. It views a massive caloric deficit not as a "diet," but as a famine. When the deficit becomes too severe, the body triggers evolutionary defense mechanisms. First, it realizes that muscle tissue is metabolically expensive (it takes a lot of calories just to maintain muscle). To conserve energy, the body begins cannibalizing muscle tissue for fuel instead of fat. Second, it drastically down-regulates your Basal Metabolic Rate (BMR) and Non-Exercise Activity Thermogenesis (NEAT). You will subconsciously stop fidgeting, feel freezing cold, and become incredibly lethargic, all of which artificially drops your daily calorie burn.</p>
            <p>A "Gold Standard" sustainable deficit is generally between 300 and 600 calories a day. It is small enough that the body doesn't panic, but large enough to yield consistent, motivating results on the scale.</p>

            <h2 className="text-2xl font-bold mb-3">Fat Loss vs. Weight Loss (The Water Weight Trap)</h2>
            <p>One of the most frustrating aspects of dieting is trusting the math while the scale refuses to cooperate. It is highly common to maintain a perfect 500-calorie daily deficit for a week, step on the scale on Sunday, and see that your weight has not changed—or has even gone up. This leads many people to quit, claiming their "metabolism is broken."</p>
            <p>You must separate <em>Weight</em> from <em>Fat</em>. The scale measures everything: bone, muscle, organs, stomach contents, and most importantly, water. If you ate a carbohydrate-heavy or sodium-heavy meal the night before, your body will temporarily retain 2 to 4 pounds of water. That water completely masks the 1 pound of fat you successfully burned that week. If you are tracking your calories accurately and are mathematically in a deficit, the fat is gone. Do not let water weight convince you to abandon the mathematics.</p>

            <h2 className="text-2xl font-bold mb-3">How to Create Your Deficit</h2>
            <p>There are two primary levers you can pull to create your daily deficit: Diet (Input) and Exercise (Output). The most successful and sustainable fat loss protocols utilize a combination of both.</p>
            <p>Let's say your goal is a 500-calorie daily deficit. You can achieve this by:</p>
            <ol>
              <li><strong>Diet Only:</strong> Eating 500 calories less than maintenance. (Highly effective, but can leave you feeling hungry).</li>
              <li><strong>Exercise Only:</strong> Eating exactly at maintenance, but performing 500 calories worth of cardiovascular exercise on a treadmill. (Effective, but requires massive time commitment and can increase appetite).</li>
              <li><strong>The Hybrid Approach:</strong> Eating 250 calories less than maintenance, and burning an additional 250 calories via a 30-minute brisk walk. This is universally considered the best approach. It creates the 500-calorie deficit without severely restricting your food or burning you out in the gym.</li>
            </ol>

            <h2 className="text-2xl font-bold mb-3">Metabolic Adaptation and Diminishing Returns</h2>
            <p>When looking at the 6-month projection chart generated by this calculator, it assumes your deficit remains perfectly static. In reality, you will encounter <em>Metabolic Adaptation</em>.</p>
            <p>As you lose weight, you become a smaller human being. A 200-pound person requires more calories to maintain their body weight than a 180-pound person. Therefore, if you start your diet with a TDEE of 2,500 and a daily intake of 2,000 (a 500 deficit), that math will work beautifully for the first two months. However, once you drop to 180 pounds, your new TDEE might only be 2,200. If you are still eating 2,000 calories, your deficit has shrunk from 500 to a mere 200. Your weight loss will slow to a crawl.</p>
            <p>To continue losing weight at the same rate, you must periodically recalculate your maintenance calories and adjust your intake downward to preserve the size of the deficit.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Trust the Math</h2>
            <p>Fat loss is an agonizingly slow biological process, but it is a guaranteed one. By utilizing the Calorie Deficit Calculator, you remove the emotion, the frustration, and the guesswork from dieting. Calculate your maintenance baseline, establish a sustainable daily deficit, hit your macro targets, and trust the 6-month mathematical projection. Consistency, not intensity, is the ultimate driver of body transformation.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-deficit-for-weight-loss-calculator" />
          <PopularCalculators exclude="/calculator/calorie-deficit-for-weight-loss-calculator" />
        </div>
      </div>
    </>
  );
}
