"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Package } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface UPFInputs {
  totalCalories: number;
  upfCalories: number;
}

interface UPFResults {
  upfPercentage: number;
  wholeFoodPercentage: number;
  wholeFoodCalories: number;
  
  grade: "Optimal / Whole Food" | "Acceptable" | "High UPF" | "Dangerous / Standard American";
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateUPF = (inputs: UPFInputs): UPFResults | null => {
  const { totalCalories, upfCalories } = inputs;
  
  if (totalCalories <= 0 || upfCalories < 0) return null;
  if (upfCalories > totalCalories) return null; // Impossible mathematically

  const wholeFoodCalories = totalCalories - upfCalories;
  const upfPercentage = (upfCalories / totalCalories) * 100;
  const wholeFoodPercentage = (wholeFoodCalories / totalCalories) * 100;

  let grade: UPFResults["grade"] = "Dangerous / Standard American";
  let recommendation = "";
  let colorClass = "text-red-500";
  let chartColor = "#ef4444";

  if (upfPercentage <= 10) {
    grade = "Optimal / Whole Food";
    recommendation = "Excellent. Your diet is fundamentally anchored in the NOVA Group 1 (unprocessed) foods. You are at a significantly reduced risk for metabolic syndrome, obesity, and cardiovascular disease.";
    colorClass = "text-green-500 font-bold";
    chartColor = "#ef4444"; // We'll map the colors for the pie chart explicitly below
  } else if (upfPercentage <= 20) {
    grade = "Acceptable";
    recommendation = "You maintain a solid balance. Relying on UPFs for less than 20% of your calories provides convenience without overwhelming your metabolism with artificial additives or seed oils.";
    colorClass = "text-blue-500 font-bold";
  } else if (upfPercentage <= 40) {
    grade = "High UPF";
    recommendation = "You are consuming a significant amount of ultra-processed food. Try swapping commercial breads for sourdough, or fast-food lunches for whole-food meal preps to lower this ratio.";
    colorClass = "text-amber-500 font-bold";
  } else {
    grade = "Dangerous / Standard American";
    recommendation = "Over half of your energy is derived from ultra-processed, hyper-palatable foods. This is the Standard American Diet (SAD) and strongly correlates with chronic inflammation and obesity.";
    colorClass = "text-red-500 font-bold";
  }

  const chartData = [
    { name: "NOVA 4 (Ultra-Processed)", value: upfCalories, color: "#ef4444" },
    { name: "NOVA 1-3 (Whole / Minimally Processed)", value: wholeFoodCalories, color: "#10b981" }
  ];

  const summaryStats = [
    { label: "Ultra-Processed (UPF) %", value: `${upfPercentage.toFixed(1)}%`, colorClass: colorClass },
    { label: "Whole Food %", value: `${wholeFoodPercentage.toFixed(1)}%`, colorClass: "text-green-500 font-bold" },
    { label: "UPF Calories", value: `${upfCalories} kcal`, colorClass: "text-red-500 font-medium" },
    { label: "Whole Food Calories", value: `${wholeFoodCalories} kcal`, colorClass: "text-green-600 font-medium" },
    { label: "Diet Assessment", value: grade, colorClass: colorClass }
  ];

  return {
    upfPercentage,
    wholeFoodPercentage,
    wholeFoodCalories,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCalories: "2200",
  upfCalories: "1300"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground">{payload[0].value} kcal</p>
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

export default function UltraProcessedFoodPercentageCalculator() {
  // 4. Component State
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [upfCalories, setUpfCalories] = useState(DEFAULTS.upfCalories);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<UPFResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tCals = parseFloat(totalCalories) || 0;
    const uCals = parseFloat(upfCalories) || 0;

    if (tCals > 0) {
      if (uCals > tCals) {
        setErrorMsg("Error: Processed calories cannot exceed total daily calories.");
        setResults(null);
        return;
      }
      setResults(calculateUPF({ totalCalories: tCals, upfCalories: uCals }));
    } else {
      setResults(null);
    }
  };

  const handleReset = () => {
    setTotalCalories(DEFAULTS.totalCalories);
    setUpfCalories(DEFAULTS.upfCalories);
    setErrorMsg("");
    
    setResults(calculateUPF({
      totalCalories: parseFloat(DEFAULTS.totalCalories),
      upfCalories: parseFloat(DEFAULTS.upfCalories)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCalories, upfCalories]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>UPF Percentage</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What exactly is an Ultra-Processed Food (UPF)?", answer: "According to the NOVA classification system (NOVA Group 4), UPFs are industrial formulations made entirely or mostly from substances extracted from foods, often with chemical additives. If the ingredient list contains items you wouldn't find in a standard kitchen (like maltodextrin, high-fructose corn syrup, soy lecithin, or artificial flavors), it is a UPF." },
    { question: "Does 'processed' mean the same thing as 'ultra-processed'?", answer: "No. Baking a whole potato or cooking rice is 'processing' a food (NOVA Group 2 or 3). UPF (NOVA Group 4) refers specifically to hyper-palatable, industrially manufactured foods like Doritos, frozen pizzas, soda, or commercial packaged pastries." },
    { question: "Is commercial protein powder considered a UPF?", answer: "Yes. Whey protein isolate is highly processed and extracted, often containing artificial sweeteners and emulsifiers. However, it is an 'outlier' UPF because its primary macro is protein, not refined carbohydrates and seed oils. Still, it counts toward your UPF percentage." },
    { question: "Why is an 80/20 rule recommended?", answer: "Perfection is the enemy of adherence. Trying to eat a 100% whole-food diet is incredibly difficult in the modern world and often leads to orthorexia or diet-binge cycles. Allowing 10% to 20% of your calories to come from UPFs provides psychological relief without damaging your metabolic health." },
    { question: "How does UPF cause weight gain?", answer: "UPFs are scientifically engineered to bypass your brain's natural satiety signals. The specific ratio of sugar, salt, and fat creates a 'bliss point' that drives you to overeat. You can easily consume 1,000 calories of potato chips, but eating 1,000 calories of plain chicken breast is physically difficult." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ultra-Processed Food Percentage Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ultra-Processed Food Percentage Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Package className="h-4 w-4" /> NOVA Diet Screener
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Input your total daily calories and the calories derived from ultra-processed foods to determine the true quality of your diet.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tcals" label="Total Daily Calories" value={totalCalories} onChange={setTotalCalories} suffix="kcal" />
              <CompactInput id="ucals" label="Calories from UPFs (Fast Food, Soda, Chips, etc.)" value={upfCalories} onChange={setUpfCalories} suffix="kcal" />
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
                <div className={`border-l-4 rounded-lg p-5 relative overflow-hidden ${
                  results.upfPercentage <= 10 ? "bg-green-500/10 border-green-500" :
                  results.upfPercentage <= 20 ? "bg-blue-500/10 border-blue-500" :
                  results.upfPercentage <= 40 ? "bg-amber-500/10 border-amber-500" :
                  "bg-red-500/10 border-red-500"
                }`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: results.chartData[0].color }}>
                      UPF Saturation Ratio
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.upfPercentage.toFixed(1)}</div>
                      <div className="text-xl font-bold text-muted-foreground">%</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      <strong>Assessment:</strong> {results.recommendation}
                    </p>
                  </div>
                  <Package className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Dietary Composition</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">NOVA Classification Chart</h3>
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
                        <span className="text-2xl font-black text-foreground leading-none" style={{ color: "#10b981" }}>{results.wholeFoodPercentage.toFixed(0)}%</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Whole Food</span>
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
                    <Package className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium max-w-xs">Enter your total daily calories and the calories derived from ultra-processed foods to calculate your UPF percentage.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mx-auto mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Ultra-Processed Food Percentage Calculator</h2>
            <p>For decades, nutritional science was heavily focused on macronutrients (proteins, carbohydrates, and fats) and raw calorie counting. This led to the creation of "diet foods"—such as 100-calorie snack packs or sugar-free cookies—that perfectly fit macro targets but contained absolutely zero natural ingredients. In recent years, a massive paradigm shift has occurred in dietary science. Researchers realized that it is not just the <em>amount</em> of calories we eat that dictates our health, but the <em>level of industrial processing</em> those calories have undergone. The <strong>Ultra-Processed Food (UPF) Percentage Calculator</strong> is designed to help you quantify exactly how much of your daily diet is derived from these industrially manufactured foods.</p>
            <p>Recent epidemiological studies have shown that diets high in UPFs are strongly correlated with an increased risk of obesity, Type 2 diabetes, cardiovascular disease, and certain types of cancer. By tracking your UPF percentage, you can slowly transition your diet away from the factory floor and back to the farm.</p>

            <h2>The NOVA Food Classification System</h2>
            <p>To understand what constitutes a "UPF," the scientific community utilizes the NOVA classification system, developed by researchers at the University of São Paulo. The NOVA system ignores macronutrients entirely and categorizes food based solely on the extent and purpose of its processing. There are four groups:</p>
            
            <p><strong>NOVA Group 1: Unprocessed or Minimally Processed Foods.</strong><br/>
            These are the physical parts of plants or animals (seeds, fruits, leaves, muscles, eggs, milk) that have been removed from nature. Minimal processing includes cleaning, freezing, or pasteurizing to make them safe for consumption. Examples: Fresh apples, raw chicken breasts, plain frozen broccoli, dry rice, and pasteurized whole milk.</p>

            <p><strong>NOVA Group 2: Processed Culinary Ingredients.</strong><br/>
            These are substances extracted from Group 1 foods used in cooking. Examples: Olive oil, butter, sugar, and salt.</p>

            <p><strong>NOVA Group 3: Processed Foods.</strong><br/>
            These are relatively simple foods made by adding Group 2 ingredients (oil, salt, sugar) to Group 1 foods to increase their durability or enhance their taste. They usually have two or three ingredients. Examples: Canned beans, salted nuts, freshly baked bakery bread, and cheese.</p>

            <p><strong>NOVA Group 4: Ultra-Processed Foods (UPFs).</strong><br/>
            These are industrial formulations made entirely or mostly from substances extracted from foods (oils, fats, sugar, starch, and proteins). They undergo chemical processing and contain cosmetic additives (flavors, colors, emulsifiers) to make them hyper-palatable. If the ingredient list contains words you would never find in a home kitchen—like high-fructose corn syrup, hydrogenated oils, maltodextrin, or soy lecithin—it is a UPF. Examples: Fast food, soda, packaged cookies, mass-produced bread, flavored yogurt, and most protein bars.</p>

            <h2>The Dangers of the Standard American Diet (SAD)</h2>
            <p>If your calculator results indicate a UPF percentage above 50%, you are eating the Standard American Diet. According to recent dietary surveys, over 57% of the total caloric intake of the average American adult comes from NOVA Group 4 foods. For children and adolescents, that number climbs to an alarming 67%.</p>
            <p>Why is this dangerous? UPFs are engineered by food scientists to hit the "bliss point"—the perfect ratio of salt, sugar, and fat that bypasses the brain's natural satiety signals. When you eat an apple (Group 1), the fiber physically stretches your stomach, and the slow release of fructose triggers hormones that tell your brain you are full. When you drink an apple-flavored soda (Group 4), those natural roadblocks are removed. You consume 200 calories instantly without triggering any fullness, leading directly to caloric surplus and weight gain.</p>

            <h2>The 80/20 Rule: A Realistic Approach</h2>
            <p>While the health risks of UPFs are severe, attempting to eliminate them entirely (achieving a 0% UPF score) is incredibly difficult in modern society. Unless you grow all your own food and never eat at a restaurant, you will encounter ultra-processed ingredients.</p>
            <p>Nutritionists recommend aiming for the <strong>80/20 Rule</strong>. If 80% or more of your daily calories come from Whole/Minimally Processed foods (NOVA 1-3), your body is receiving the complex matrix of vitamins, fiber, and micronutrients it needs to maintain a robust metabolism and clear out inflammation. Leaving 10% to 20% of your caloric budget for UPFs (like a slice of commercial cake at a birthday party, or a protein shake after a workout) allows for psychological flexibility and prevents the development of restrictive eating disorders like orthorexia.</p>

            <h2>Common UPF "Health Traps"</h2>
            <p>The food industry is highly aware that consumers are seeking healthier options, which has led to "health-washing" ultra-processed foods. Many products that appear healthy are actually NOVA Group 4 items. Be highly suspicious of:</p>
            <ul>
              <li><strong>Flavored Yogurts:</strong> While plain, whole-milk yogurt is a Group 1 food, commercial strawberry-flavored yogurt is often packed with artificial flavors, stabilizers, and massive amounts of refined sugar, classifying it as a UPF.</li>
              <li><strong>Protein Bars:</strong> The vast majority of protein bars are essentially candy bars injected with isolated whey protein and artificial sweeteners.</li>
              <li><strong>Store-Bought "Whole Wheat" Bread:</strong> Genuine bread requires three ingredients: flour, water, and salt. Commercial bagged bread often contains 20+ ingredients, including emulsifiers and dough conditioners, to keep it soft for weeks on a shelf.</li>
              <li><strong>Plant-Based Meat Alternatives:</strong> Many imitation meats undergo extreme industrial processing involving protein isolates, refined seed oils, and chemical flavorings to mimic the texture of meat.</li>
            </ul>

            <h2>How to Lower Your UPF Percentage</h2>
            <p>Lowering your UPF percentage does not require eating boring, bland food; it simply requires moving back down the NOVA classification chain. Here are a few simple swaps to drastically improve your ratio:</p>
            <p>Instead of buying commercial fruit juices or sodas (UPF), buy fresh oranges (NOVA 1) or squeeze them yourself. Instead of buying boxed macaroni and cheese with powdered synthetic cheese sauce (UPF), buy dry pasta (NOVA 1) and make a sauce using real butter and block cheese (NOVA 2 & 3). Instead of eating a fast-food hamburger (UPF) filled with preservatives and seed oils, make a burger at home using ground beef (NOVA 1) and a sourdough bun from a local bakery.</p>

            <h2>Conclusion</h2>
            <p>Your health is ultimately dictated by the structural integrity of the food you consume. By using the Ultra-Processed Food Percentage Calculator, you can audit your dietary habits and expose hidden UPFs. By prioritizing single-ingredient, whole foods, you provide your body with the natural metabolic instructions it needs to thrive, naturally reducing hunger, lowering inflammation, and effortlessly shedding excess body fat.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ultra-processed-food-percentage-calculator" />
          <PopularCalculators exclude="/calculator/ultra-processed-food-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
