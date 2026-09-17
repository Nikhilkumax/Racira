"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Target, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface ThresholdInputs {
  tdee: number;
  carbGrams: number;
}

interface ThresholdResults {
  carbCalories: number;
  carbPercentage: number;
  remainingCalories: number;
  
  classification: string;
  grade: string;
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateThreshold = (inputs: ThresholdInputs): ThresholdResults | null => {
  const { tdee, carbGrams } = inputs;
  
  if (tdee < 1000 || carbGrams < 0) return null;

  // Carbs = 4 kcal/g
  const carbCalories = carbGrams * 4;
  const carbPercentage = (carbCalories / tdee) * 100;
  const remainingCalories = tdee - carbCalories;

  let classification = "";
  let grade = "";
  let recommendation = "";
  let colorClass = "";

  if (carbGrams <= 50) {
    classification = "Ketogenic (Deep Low-Carb)";
    grade = "Strict Keto Threshold";
    recommendation = "By restricting carbohydrates below 50 grams, you have starved the body of glucose and completely depleted hepatic glycogen. The liver is now forced to produce ketones from fat to fuel the brain. This state (Ketosis) is highly effective for appetite suppression and rapid fat loss.";
    colorClass = "text-purple-500 font-bold";
  } else if (carbGrams <= 100) {
    classification = "Strict Low-Carb";
    grade = "Moderate Restriction";
    recommendation = "You are consuming between 50g and 100g of carbs. This is the 'sweet spot' for many individuals. It is too many carbs to enter deep ketosis, but low enough to maintain extremely stable insulin levels and prevent spontaneous weight gain, while allowing for some vegetables and berries.";
    colorClass = "text-blue-500 font-bold";
  } else if (carbGrams <= 150) {
    classification = "Liberal Low-Carb";
    grade = "Maintenance Threshold";
    recommendation = "At 100g to 150g, you are technically 'low-carb' compared to the Standard American Diet (which averages 300g+). This is an excellent, highly sustainable threshold for active individuals who want to maintain their weight while keeping metabolic health markers optimized.";
    colorClass = "text-green-500 font-bold";
  } else {
    classification = "Standard / High-Carb";
    grade = "Exceeds Low-Carb Threshold";
    recommendation = "You have exceeded 150 grams of carbohydrates per day. While perfectly fine for athletes and highly active individuals, you are no longer operating within a clinical 'low-carb' paradigm. Your primary fuel source is heavily reliant on glucose.";
    colorClass = "text-amber-500 font-bold";
  }

  // Handle case where carbs exceed TDEE (impossible diet but mathematically possible input)
  const safeRemaining = remainingCalories < 0 ? 0 : remainingCalories;
  const safeCarbCals = carbCalories > tdee ? tdee : carbCalories;

  const chartData = [
    { name: "Carbohydrates", value: safeCarbCals, color: "#3b82f6" },
    { name: "Remaining (Protein/Fat)", value: safeRemaining, color: "#94a3b8" }
  ];

  const summaryStats = [
    { label: "Daily Carbohydrate Target", value: `${carbGrams}g`, colorClass: "text-blue-500 font-bold text-lg" },
    { label: "Carb Caloric Load", value: `${carbCalories} kcal` },
    { label: "Percentage of Total Diet", value: `${carbPercentage.toFixed(1)}%`, colorClass: "text-foreground font-medium" },
    { label: "Metabolic Classification", value: classification, colorClass: colorClass }
  ];

  return {
    carbCalories,
    carbPercentage,
    remainingCalories: safeRemaining,
    classification,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  tdee: "2200",
  carbGrams: "40"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{payload[0].value}</span> kcal</p>
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

export default function LowCarbThresholdCalculator() {
  // 4. Component State
  const [tdee, setTdee] = useState(DEFAULTS.tdee);
  const [carbGrams, setCarbGrams] = useState(DEFAULTS.carbGrams);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<ThresholdResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const t = parseInt(tdee);
    const c = parseInt(carbGrams);

    if (t < 1000) {
      setErrorMsg("Error: Minimum TDEE allowed is 1000 kcal.");
      setResults(null);
      return;
    }
    if (c < 0) {
      setErrorMsg("Error: Carbs cannot be negative.");
      setResults(null);
      return;
    }

    const inputs: ThresholdInputs = {
      tdee: t,
      carbGrams: c
    };
    setResults(calculateThreshold(inputs));
  };

  const handleReset = () => {
    setTdee(DEFAULTS.tdee);
    setCarbGrams(DEFAULTS.carbGrams);
    setErrorMsg("");
    
    setResults(calculateThreshold({
      tdee: parseInt(DEFAULTS.tdee),
      carbGrams: parseInt(DEFAULTS.carbGrams)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdee, carbGrams]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Low Carb Threshold</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What defines a 'Low-Carb' diet?", answer: "There is no single legal definition, but clinical nutrition generally defines 'Low-Carb' as consuming less than 150 grams of carbohydrates per day. For context, the Standard American Diet (SAD) often exceeds 300 grams of carbohydrates daily, primarily from processed sugars and refined grains." },
    { question: "What is the difference between Low-Carb and Keto?", answer: "Ketosis is a strict biological state, not just a diet type. To force your body to stop burning glucose and start burning ketones (fat), you must completely starve it of carbohydrates. This usually requires staying under a strict threshold of 20 to 50 grams of carbs per day. A diet of 100g of carbs is 'low-carb', but it will not put you in ketosis." },
    { question: "Will a low-carb diet automatically cause weight loss?", answer: "No. The First Law of Thermodynamics still applies. If your TDEE is 2,000 calories, and you eat 2,500 calories of pure fat and protein (zero carbs), you will still gain weight. However, low-carb diets are highly effective because protein and fat are incredibly satiating (filling), which causes people to naturally eat fewer total calories without feeling starved." },
    { question: "What is the 'Keto Flu'?", answer: "When you drop your carbs below 50g, your body flushes out its glycogen stores. Every gram of glycogen holds roughly 3 grams of water. As this water is flushed out through urine, it takes massive amounts of essential electrolytes (Sodium, Potassium, Magnesium) with it. This rapid dehydration and electrolyte crash causes the 'Keto Flu' (headaches, fatigue). It is easily fixed by heavily salting your food and drinking electrolyte water." },
    { question: "Is the Liberal Low-Carb tier effective?", answer: "Absolutely. The 100g to 150g tier is considered the 'Maintenance Sweet Spot'. It removes the dangerous refined sugars and junk food of the standard diet, stabilizing insulin levels, but still allows you to eat healthy carbs like sweet potatoes, oats, and fruit to fuel gym workouts." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Low Carb Threshold Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Low-Carb Threshold Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Target className="h-4 w-4" /> Ketogenic & Low-Carb Profiler
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Determine your exact metabolic classification (Keto vs. Low-Carb vs. Standard) based on your daily carbohydrate allowance relative to your Total Daily Energy Expenditure.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tdee" label="Total Daily Energy Expenditure (TDEE)" value={tdee} onChange={setTdee} suffix="kcal / day" />
              <p className="text-[10px] text-muted-foreground -mt-3 ml-1">Your total maintenance calories (BMR + Activity).</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="carbs" label="Target Carbohydrate Intake" value={carbGrams} onChange={setCarbGrams} suffix="grams / day" />
              <p className="text-[10px] text-muted-foreground -mt-3 ml-1">Enter net or total carbs you plan to consume.</p>
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
                  <div className="relative z-10">
                    <div className={`text-xs font-bold uppercase tracking-wider mb-1 
                      ${results.classification.includes('Keto') ? 'text-purple-600 dark:text-purple-400' : 
                      results.classification.includes('Strict') ? 'text-blue-600 dark:text-blue-400' : 
                      results.classification.includes('Liberal') ? 'text-green-600 dark:text-green-400' : 
                      'text-amber-600 dark:text-amber-400'}`}
                    >
                      Dietary Classification
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      <div className="text-3xl font-extrabold tracking-tight text-foreground">{results.classification}</div>
                      <div className="text-sm font-bold text-muted-foreground">Threshold: {carbGrams}g of Carbs</div>
                    </div>
                  </div>
                  <Target className={`absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground`} />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Threshold Analytics</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">{results.grade}:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Dietary Energy Ratio</h3>
                    <div className="text-center w-full relative mt-2">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={75}
                            paddingAngle={2} dataKey="value"
                            startAngle={90} endAngle={-270}
                            stroke="none"
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-foreground leading-none">{results.carbPercentage.toFixed(0)}%</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Carbs</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-3 w-full text-center">Visually representing the percentage of total daily calories derived from carbohydrates vs. the remaining budget for proteins and fats.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Target className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your TDEE and target carbohydrate grams to determine your metabolic dietary classification.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Low-Carb Threshold Calculator</h2>
            <p>The term "low-carb" is one of the most widely used and broadly misunderstood phrases in the health and fitness industry. To a competitive marathon runner eating 500 grams of carbohydrates a day, dropping to 250 grams feels incredibly "low-carb." To a strict Ketogenic dieter eating 20 grams a day, 250 grams is an astronomical carbohydrate overload. Because human metabolism operates on a continuous spectrum rather than binary switches, defining where you stand requires mathematical precision. The <strong>Low-Carb Threshold Calculator</strong> classifies your exact dietary protocol based on established clinical guidelines, helping you align your carbohydrate intake with your specific metabolic goals (whether that is deep ketosis, insulin stabilization, or simple weight maintenance).</p>

            <h2 className="text-2xl font-bold mb-3">The Standard American Diet (The Baseline)</h2>
            <p>Before understanding what constitutes a "low" intake, it is necessary to establish the modern baseline. The Standard American Diet (SAD) is heavily dominated by refined sugars, high-fructose corn syrup, and heavily processed grains (breads, pastas, cereals). The average adult consuming this diet easily exceeds <strong>300 to 400 grams of carbohydrates</strong> per day. When carbohydrates are consumed in this massive volume without the physical exertion required to burn them off, they trigger continuous, chronically high levels of insulin. Over years, this leads to insulin resistance, metabolic syndrome, and severe weight gain. All low-carb strategies are fundamentally designed to lower this baseline to regain insulin sensitivity.</p>

            <h2 className="text-2xl font-bold mb-3">Tier 1: The Ketogenic Diet (&lt;50g)</h2>
            <p>The Ketogenic (Keto) diet is not merely a diet; it is a highly engineered metabolic state. The human brain requires a massive amount of energy to function (roughly 20% of your total daily caloric burn). Historically, the brain relies almost entirely on glucose (derived from carbohydrates). If you cut your carbohydrate intake to below <strong>50 grams per day</strong>, you starve the body of glucose. The liver completely empties its glycogen reserves.</p>
            <p>To prevent the brain from shutting down, a biological survival mechanism is triggered. The liver begins breaking down dietary fat and stored body fat into molecules called <strong>Ketones</strong>. These ketones cross the blood-brain barrier and serve as a highly efficient alternative fuel source. This metabolic shift is called <em>Ketosis</em>. It is celebrated for its incredible appetite-suppressing effects and rapid fat loss, but it requires extreme discipline. A single high-carb meal (like a plate of pasta) will instantly kick the body out of ketosis, requiring days of strict fasting or severe restriction to re-enter.</p>

            <h2 className="text-2xl font-bold mb-3">Tier 2: Strict Low-Carb (50g to 100g)</h2>
            <p>For individuals who cannot tolerate the restrictiveness of the Ketogenic diet, the Strict Low-Carb tier (often called "Keto-lite") is the next best option. At 50 to 100 grams of carbohydrates a day, you are eating too many carbs to maintain deep ketosis. The body will primarily rely on glucose for fuel.</p>
            <p>However, this threshold is incredibly effective for fat loss and metabolic healing. By capping carbs at 100g, you eliminate almost all processed junk food, sugary sodas, and heavy pasta dishes. You are limited to getting your carbs from fibrous vegetables, berries, and perhaps a very small portion of oats or sweet potato. This keeps insulin levels incredibly flat throughout the day, preventing the "sugar crashes" and ravenous hunger spikes associated with high-carb diets.</p>

            <h2 className="text-2xl font-bold mb-3">Tier 3: Liberal Low-Carb / Maintenance (100g to 150g)</h2>
            <p>The 100g to 150g threshold is widely considered the ultimate, sustainable "sweet spot" for human nutrition. It is low enough to prevent chronic insulin resistance, but high enough to support a highly active, athletic lifestyle. While 150g might seem "high" to a Keto purist, it is still 50% lower than the Standard American Diet.</p>
            <p>This tier allows you to easily fuel intense 60-minute weightlifting sessions, run 5Ks, and occasionally enjoy a piece of fruit or a sensible portion of rice without feeling guilty or lethargic. It is the perfect maintenance threshold once you have finished a fat-loss phase and simply want to live a healthy, balanced life without obsessively tracking every gram of spinach.</p>

            <h2 className="text-2xl font-bold mb-3">The Role of Total Calories (TDEE)</h2>
            <p>A critical feature of this calculator is the inclusion of your Total Daily Energy Expenditure (TDEE). While 50 grams of carbs is the absolute ceiling for ketosis, the <em>percentage</em> of your diet that comes from carbs matters significantly. If you are a massive bodybuilder with a TDEE of 4,000 calories, eating 150 grams of carbs (600 calories) means carbs only make up 15% of your diet. Your body will process that load very differently than a small sedentary individual with a TDEE of 1,500 calories eating the exact same 150 grams of carbs (making up 40% of their diet). Always view your carbohydrate intake through the lens of your total caloric budget.</p>

            <h2 className="text-2xl font-bold mb-3">Net Carbs vs. Total Carbs</h2>
            <p>When operating in the Ketogenic or Strict Low-Carb tiers, accuracy is paramount. A massive debate within the community is whether to track "Total Carbs" or "Net Carbs."</p>
            <p><strong>Total Carbs</strong> include everything: starches, sugars, and fiber. <strong>Net Carbs</strong> are calculated by taking the Total Carbs and subtracting Dietary Fiber (and sometimes Sugar Alcohols). Because the human digestive system cannot break down dietary fiber into glucose, it does not spike insulin or provide caloric energy in the traditional sense. Therefore, most advanced low-carb dieters track Net Carbs. This allows them to eat massive amounts of leafy green vegetables (which are high in total carbs but almost entirely made of fiber) without getting kicked out of ketosis.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Choose Your Threshold</h2>
            <p>There is no single "best" carbohydrate threshold. The optimal tier depends entirely on your current metabolic health, your athletic goals, and your psychological ability to adhere to restriction. If you are deeply insulin-resistant and want rapid weight loss, the Ketogenic threshold (&lt;50g) is a powerful medical tool. If you are a healthy, active individual looking to stay lean year-round, the Liberal Low-Carb tier (100-150g) offers the perfect balance of metabolic health and dietary freedom. Use the calculator to establish your target, eliminate refined sugars, and stick to your chosen threshold.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/low-carb-threshold-calculator" />
          <PopularCalculators exclude="/calculator/low-carb-threshold-calculator" />
        </div>
      </div>
    </>
  );
}
