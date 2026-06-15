"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Beef } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface RatioInputs {
  totalCalories: number;
  proteinGrams: number;
}

interface RatioResults {
  cprRatio: number; // Calories per gram of protein
  proteinCalories: number;
  otherCalories: number;
  proteinPercentage: number;
  
  grade: "Elite / Ultra-Lean" | "Excellent" | "Good / Balanced" | "Moderate" | "Poor / Low Protein";
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateRatio = (inputs: RatioInputs): RatioResults | null => {
  const { totalCalories, proteinGrams } = inputs;
  
  if (totalCalories <= 0 || proteinGrams <= 0) return null;
  if ((proteinGrams * 4) > totalCalories) return null; // Impossible mathematically, protein is 4 kcal/g

  const proteinCalories = proteinGrams * 4;
  const otherCalories = totalCalories - proteinCalories;
  
  const cprRatio = totalCalories / proteinGrams;
  const proteinPercentage = (proteinCalories / totalCalories) * 100;

  let grade: RatioResults["grade"] = "Poor / Low Protein";
  let recommendation = "";
  let colorClass = "text-red-500";
  let chartColor = "#ef4444";

  if (cprRatio < 8) {
    grade = "Elite / Ultra-Lean";
    recommendation = "This is exceptionally lean protein (like chicken breast, egg whites, or whey isolate). Perfect for aggressive cutting phases where you need to maximize protein while keeping total calories extremely low.";
    colorClass = "text-purple-500 font-bold";
    chartColor = "#a855f7";
  } else if (cprRatio <= 11) {
    grade = "Excellent";
    recommendation = "Highly protein-dense. Great for standard cutting phases or lean bulking without accumulating excess body fat. Common in lean meats, greek yogurt, and fish.";
    colorClass = "text-primary font-bold";
    chartColor = "hsl(var(--primary))";
  } else if (cprRatio <= 15) {
    grade = "Good / Balanced";
    recommendation = "A balanced macronutrient profile. Ideal for maintenance or a slow bulk. Examples include whole eggs, higher-fat ground beef, or mixed meals.";
    colorClass = "text-blue-500 font-bold";
    chartColor = "#3b82f6";
  } else if (cprRatio <= 25) {
    grade = "Moderate";
    recommendation = "Protein is present, but it comes with a heavy load of carbs or fats. Okay for bulking, but difficult to fit into a strict cutting diet. Examples include protein bars, peanut butter, or mixed restaurant meals.";
    colorClass = "text-amber-500 font-bold";
    chartColor = "#f59e0b";
  } else {
    grade = "Poor / Low Protein";
    recommendation = "This food or diet is highly composed of fats and carbohydrates. It will be very difficult to hit your daily protein targets using foods with this ratio without massively overeating calories.";
    colorClass = "text-red-500 font-bold";
    chartColor = "#ef4444";
  }

  const chartData = [
    { name: "Protein Calories", value: proteinCalories, color: chartColor },
    { name: "Fats & Carbs", value: otherCalories, color: "hsl(var(--muted)/0.5)" }
  ];

  const summaryStats = [
    { label: "Calorie-to-Protein Ratio", value: `${cprRatio.toFixed(1)}:1`, colorClass: colorClass },
    { label: "Protein Percentage", value: `${proteinPercentage.toFixed(1)}% of total calories` },
    { label: "Protein Calories", value: `${proteinCalories.toFixed(0)} kcal` },
    { label: "Carb/Fat Calories", value: `${otherCalories.toFixed(0)} kcal` },
    { label: "Density Grade", value: grade, colorClass: colorClass }
  ];

  return {
    cprRatio,
    proteinCalories,
    otherCalories,
    proteinPercentage,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCalories: "250",
  proteinGrams: "24"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5">{payload[0].payload.name}</p>
        <p className="text-muted-foreground">{payload[0].value.toFixed(0)} kcal</p>
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

export default function CalorieToProteinRatioCalculator() {
  // 4. Component State
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [proteinGrams, setProteinGrams] = useState(DEFAULTS.proteinGrams);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<RatioResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tCals = parseFloat(totalCalories) || 0;
    const pGrams = parseFloat(proteinGrams) || 0;

    if (tCals > 0 && pGrams > 0) {
      if ((pGrams * 4) > tCals) {
        setErrorMsg("Mathematical error: Protein contains 4 calories per gram. The protein calories exceed the total calories provided.");
        setResults(null);
        return;
      }
      setResults(calculateRatio({ totalCalories: tCals, proteinGrams: pGrams }));
    } else {
      setResults(null);
    }
  };

  const handleReset = () => {
    setTotalCalories(DEFAULTS.totalCalories);
    setProteinGrams(DEFAULTS.proteinGrams);
    setErrorMsg("");
    
    setResults(calculateRatio({
      totalCalories: parseFloat(DEFAULTS.totalCalories),
      proteinGrams: parseFloat(DEFAULTS.proteinGrams)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCalories, proteinGrams]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Calorie to Protein Ratio</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the Calorie-to-Protein Ratio (CPR)?", answer: "The CPR measures how many calories you must consume to yield exactly 1 gram of protein. A lower number means the food is highly protein-dense (lean), while a higher number means the food contains significant amounts of fats or carbohydrates." },
    { question: "What is a 'good' ratio for building muscle?", answer: "If you are 'cutting' (losing fat while maintaining muscle), look for foods with a ratio of 10:1 or lower (e.g., chicken breast, egg whites, protein powder). If you are 'bulking' (building mass), ratios up to 15:1 or 20:1 are perfectly acceptable." },
    { question: "Why does the calculator say my math is wrong?", answer: "Protein scientifically contains 4 kilocalories per gram. If you input 100 total calories and 30 grams of protein, that is mathematically impossible because 30 grams of protein equals 120 calories. Food labels often round numbers, but severe discrepancies mean the label is inaccurate." },
    { question: "Is peanut butter a good source of protein?", answer: "No. Peanut butter typically contains 190 calories and 7 grams of protein, giving it a massive CPR of 27:1. It is an excellent source of healthy fats, but it is a terrible source of protein if you are trying to stay lean." },
    { question: "How is Protein Percentage calculated?", answer: "We take the grams of protein, multiply it by 4 (the number of calories per gram of protein), and divide that number by the total calories. If a 100-calorie food has 10 grams of protein (40 kcal), it is 40% protein." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie to Protein Ratio Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Calorie to Protein Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Beef className="h-4 w-4" /> Macronutrient Density Scanner
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Input the nutritional data of any food, meal, or daily diet to instantly calculate its exact calorie-to-protein ratio and macro density grade.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="cals" label="Total Calories" value={totalCalories} onChange={setTotalCalories} suffix="kcal" />
              <CompactInput id="prot" label="Protein Amount" value={proteinGrams} onChange={setProteinGrams} suffix="grams" />
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-2">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Metrics
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* 1. Primary Result Card */}
                <div className="bg-muted/10 border border-border rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-muted-foreground">
                      Calorie-to-Protein Ratio (CPR)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight" style={{ color: results.chartData[0].color }}>{results.cprRatio.toFixed(1)}</div>
                      <div className="text-xl font-bold text-muted-foreground">: 1</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      You must consume <strong>{results.cprRatio.toFixed(1)} calories</strong> to yield exactly 1 gram of protein from this source.
                    </p>
                  </div>
                  <Beef className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Density Analysis</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Macronutrient Profile</h3>
                    <div className="text-center w-full relative">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={70}
                            paddingAngle={2} dataKey="value"
                            startAngle={90} endAngle={-270}
                          >
                            {results.chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-foreground leading-none">{results.proteinPercentage.toFixed(0)}%</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Protein</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                {errorMsg ? (
                  <div className="text-red-500 font-bold max-w-sm">{errorMsg}</div>
                ) : (
                  <>
                    <Beef className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium max-w-xs">Enter the total calories and protein grams from a nutrition label to calculate its exact macro density.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding the Calorie-to-Protein Ratio</h2>
            <p>If you are an athlete, a bodybuilder, or simply someone trying to lose fat while preserving lean muscle mass, your primary nutritional goal is likely hitting a high daily protein target. However, doing so while staying within a strict caloric deficit is a mathematical puzzle. The <strong>Calorie to Protein Ratio (CPR) Calculator</strong> is the ultimate tool for solving this puzzle. By instantly evaluating the macronutrient density of any food, meal, or daily diet plan, it reveals exactly how efficiently you are sourcing your protein.</p>
            <p>The Calorie-to-Protein Ratio answers a single, critical question: <em>"How many calories do I have to eat to get exactly one gram of protein from this food?"</em> A lower number indicates a highly efficient, lean protein source, while a higher number indicates a food that is heavily laden with fats and carbohydrates.</p>

            <h2>The Mathematics of Protein Density</h2>
            <p>To understand the calculator's outputs, you must first understand the fundamental biochemistry of macronutrients. The human body derives energy from three primary sources:</p>
            <ul>
              <li><strong>Protein:</strong> Yields 4 kilocalories per gram.</li>
              <li><strong>Carbohydrates:</strong> Yields 4 kilocalories per gram.</li>
              <li><strong>Fats:</strong> Yields 9 kilocalories per gram.</li>
            </ul>
            <p>Because protein inherently contains 4 calories per gram, the absolute theoretical "perfect" Calorie-to-Protein Ratio is <strong>4.0</strong>. This represents a food that is 100% pure protein with zero carbs and zero fats. In the real world, this is nearly impossible to find outside of highly refined whey protein isolate or pure amino acid powders. Everything else in nature contains at least trace amounts of fat or carbohydrates, which pushes the ratio higher.</p>

            <h2>Decoding the Ratio Grades</h2>
            <p>Our calculator assigns a specific "Density Grade" to your input based on the calculated ratio. Here is exactly what those grades mean for your diet:</p>
            <p><strong>Elite / Ultra-Lean (Ratio &lt; 8):</strong> This category is reserved for foods that are over 50% pure protein. Examples include chicken breast (ratio of ~5), egg whites (ratio of ~4.5), white fish like tilapia or cod (ratio of ~5), and high-quality protein powders. If you are in a deep caloric deficit (a severe "cut") for a bodybuilding show or weight-class sport, your diet must be anchored heavily in this category.</p>
            <p><strong>Excellent (Ratio 8 to 11):</strong> These foods are highly protein-dense but contain enough trace fats to improve flavor and satiety. Examples include 93% lean ground turkey, non-fat plain Greek yogurt, and low-fat cottage cheese. This is the sweet spot for a sustainable fat-loss diet.</p>
            <p><strong>Good / Balanced (Ratio 12 to 15):</strong> Foods in this category provide a solid dose of protein but bring along significant fats or carbs. Examples include whole eggs (ratio of ~12) and 80/20 ground beef. These foods are excellent for maintenance phases or "lean bulking," where keeping calories extremely low is no longer the primary goal.</p>
            <p><strong>Moderate (Ratio 16 to 25):</strong> This is where many "health foods" hide. A typical protein bar might have 200 calories and 10g of protein, giving it a ratio of 20:1. While 10g of protein sounds good on the wrapper, you are consuming a massive amount of carbs and fats to get it.</p>
            <p><strong>Poor / Low Protein (Ratio &gt; 25):</strong> These foods should not be considered protein sources. If you try to hit a 150g daily protein target using foods with a 25:1 ratio, you will consume 3,750 calories to do it, resulting in massive fat gain.</p>

            <h2>The Peanut Butter Myth</h2>
            <p>One of the most common nutritional mistakes made by beginners is viewing peanut butter as a primary protein source. The marketing surrounding nut butters heavily emphasizes their protein content, but the math tells a different story.</p>
            <p>A standard serving of peanut butter (2 tablespoons) contains roughly 190 calories and 7 grams of protein. If we input this into the calculator, it yields a Calorie-to-Protein Ratio of <strong>27.1</strong>, placing it firmly in the "Poor" category. Furthermore, the calculator shows that only 14.7% of the calories in peanut butter come from protein; the remaining 85% come from fats and carbohydrates. Peanut butter is an excellent, healthy fat source, but it is a terrible primary protein source.</p>

            <h2>Applying the CPR to Your Daily Diet</h2>
            <p>The beauty of the Calorie-to-Protein Ratio is that it can be applied to an entire day of eating, not just individual foods. If your daily macro targets are 2,000 calories and 160 grams of protein, your target "Daily CPR" is <strong>12.5</strong> (2000 / 160 = 12.5). </p>
            <p>This means that on average, every single item you put in your mouth throughout the day must have a ratio of 12.5. If you eat a donut for breakfast (ratio of 100+), you have severely skewed your daily average. To recover and hit your target, you will be forced to eat an "Elite" food—like pure chicken breast with a ratio of 5—for dinner just to balance the math.</p>

            <h2>Protein Percentage vs. CPR</h2>
            <p>Our calculator provides both the CPR (like 10:1) and the Protein Percentage (like 40%). These are simply two different ways of looking at the exact same mathematical reality. Some nutritionists prefer percentages. If a food has a 10:1 CPR, it means it takes 10 calories to yield 1 gram of protein. Since that 1 gram of protein is worth 4 calories, 4 out of those 10 calories are protein (40%).</p>
            <p>A simple rule of thumb: If you are trying to lose body fat, aim for meals where at least <strong>30% to 40%</strong> of the total calories come directly from protein. High-protein meals trigger the release of leptin (the satiety hormone) much faster than high-carb meals, keeping you full longer and preventing diet-destroying snacking.</p>

            <h2>Why Does the Calculator Give Me an Error?</h2>
            <p>If you input data straight from a nutrition label and the calculator flashes a red mathematical error, do not panic. The calculator is simply enforcing the laws of thermodynamics. Because protein yields 4 kcal/g, you cannot have 50 grams of protein in a 100-calorie food (50g x 4 = 200 calories).</p>
            <p>If a label causes this error, the manufacturer is either rounding the numbers aggressively (which is legally allowed by the FDA in small increments) or they are actively lying about the macro profile of the product (a process known as "amino spiking"). In either case, the label cannot be trusted.</p>

            <h2>Conclusion</h2>
            <p>Macronutrient management does not have to rely on intuition or marketing buzzwords. By using the Calorie-to-Protein Ratio Calculator, you can instantly strip away the misleading "High Protein!" labels on the front of food packaging and analyze the cold, hard mathematics on the back. By anchoring your diet with "Elite" and "Excellent" ratio foods, hitting your daily protein targets while maintaining a caloric deficit becomes effortless.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-to-protein-ratio-calculator" />
          <PopularCalculators exclude="/calculator/calorie-to-protein-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
