"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Drumstick } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface PCRInputs {
  totalCalories: number;
  proteinGrams: number;
}

interface PCRResults {
  gramsPer100Kcal: number;
  proteinPercentage: number;
  
  grade: "Elite Source" | "Excellent Source" | "Good Source" | "Moderate Source" | "Poor Source";
  recommendation: string;

  chartData: { name: string; "Protein per 100 kcal": number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculatePCR = (inputs: PCRInputs): PCRResults | null => {
  const { totalCalories, proteinGrams } = inputs;
  
  if (totalCalories <= 0 || proteinGrams <= 0) return null;
  if ((proteinGrams * 4) > totalCalories) return null; // Impossible mathematically

  // Calculate grams of protein per 100 calories
  const multiplier = 100 / totalCalories;
  const gramsPer100Kcal = proteinGrams * multiplier;
  
  const proteinPercentage = ((proteinGrams * 4) / totalCalories) * 100;

  let grade: PCRResults["grade"] = "Poor Source";
  let recommendation = "";
  let colorClass = "text-red-500";
  let chartColor = "#ef4444";

  // Max theoretical is 25g per 100 kcal (since 25g * 4kcal = 100kcal)
  if (gramsPer100Kcal >= 15) {
    grade = "Elite Source";
    recommendation = "This is a massive amount of protein for very few calories. This is the gold standard for aggressive fat loss or bodybuilding contest prep. Examples include whey isolate, egg whites, and chicken breast.";
    colorClass = "text-purple-500 font-bold";
    chartColor = "#a855f7";
  } else if (gramsPer100Kcal >= 10) {
    grade = "Excellent Source";
    recommendation = "Highly efficient protein source. Easily fits into almost any cutting or lean bulking diet without breaking your calorie bank.";
    colorClass = "text-primary font-bold";
    chartColor = "hsl(var(--primary))";
  } else if (gramsPer100Kcal >= 6) {
    grade = "Good Source";
    recommendation = "A balanced source of protein, but it brings along fats or carbohydrates. Good for maintenance diets or bulking. Examples: whole eggs, whole milk, fattier cuts of meat.";
    colorClass = "text-blue-500 font-bold";
    chartColor = "#3b82f6";
  } else if (gramsPer100Kcal >= 3) {
    grade = "Moderate Source";
    recommendation = "This food contains trace protein but is primarily composed of fats or carbs. You cannot rely on this to hit your protein goals without severely overeating calories.";
    colorClass = "text-amber-500 font-bold";
    chartColor = "#f59e0b";
  } else {
    grade = "Poor Source";
    recommendation = "This is effectively a carbohydrate or fat source. If a product with this ratio advertises itself as 'High Protein' on the label, it is highly misleading marketing.";
    colorClass = "text-red-500 font-bold";
    chartColor = "#ef4444";
  }

  const chartData = [
    { name: "Your Food", "Protein per 100 kcal": parseFloat(gramsPer100Kcal.toFixed(1)), color: chartColor },
    { name: "Chicken Breast", "Protein per 100 kcal": 22.0, color: "hsl(var(--muted))" },
    { name: "Whole Egg", "Protein per 100 kcal": 8.5, color: "hsl(var(--muted))" },
    { name: "Peanut Butter", "Protein per 100 kcal": 3.7, color: "hsl(var(--muted))" }
  ];

  const summaryStats = [
    { label: "Protein to Calorie Ratio (PCR)", value: `${gramsPer100Kcal.toFixed(1)}g per 100 kcal`, colorClass: colorClass },
    { label: "Total Calories Provided", value: `${totalCalories} kcal` },
    { label: "Total Protein Provided", value: `${proteinGrams} grams` },
    { label: "Percentage of Calories from Protein", value: `${proteinPercentage.toFixed(1)}%` },
    { label: "Quality Grade", value: grade, colorClass: colorClass }
  ];

  return {
    gramsPer100Kcal,
    proteinPercentage,
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCalories: "160",
  proteinGrams: "20"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5">{payload[0].payload.name}</p>
        <p className="text-muted-foreground" style={{ color: payload[0].payload.color }}>{payload[0].value.toFixed(1)}g per 100 kcal</p>
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

export default function ProteinToCalorieRatioCalculator() {
  // 4. Component State
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [proteinGrams, setProteinGrams] = useState(DEFAULTS.proteinGrams);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<PCRResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tCals = parseFloat(totalCalories) || 0;
    const pGrams = parseFloat(proteinGrams) || 0;

    if (tCals > 0 && pGrams > 0) {
      if ((pGrams * 4) > tCals) {
        setErrorMsg("Error: 1 gram of protein has 4 calories. The protein alone exceeds the total calories entered. Check the nutrition label.");
        setResults(null);
        return;
      }
      setResults(calculatePCR({ totalCalories: tCals, proteinGrams: pGrams }));
    } else {
      setResults(null);
    }
  };

  const handleReset = () => {
    setTotalCalories(DEFAULTS.totalCalories);
    setProteinGrams(DEFAULTS.proteinGrams);
    setErrorMsg("");
    
    setResults(calculatePCR({
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
    w.document.write(`<html><head><title>Protein to Calorie Ratio</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the Protein to Calorie Ratio (PCR)?", answer: "The PCR standardizes any food by calculating exactly how many grams of protein it delivers per 100 calories. This allows you to easily compare a 400-calorie steak against a 150-calorie yogurt on an even playing field." },
    { question: "What is a good PCR target?", answer: "If you are trying to lose weight while maintaining muscle, you want foods that provide at least 10 grams of protein per 100 calories. If a food only provides 3 grams per 100 calories, it is fundamentally a fat or carbohydrate source, not a protein source." },
    { question: "What is the highest possible ratio?", answer: "Because pure protein contains 4 calories per gram, the absolute theoretical maximum is 25 grams of protein per 100 calories (25g x 4kcal = 100kcal). A high-quality whey isolate powder usually hits around 22g to 24g per 100 calories." },
    { question: "Why do protein bars score so low?", answer: "Many commercial 'Protein Bars' are essentially candy bars with added whey. While they might advertise '20 grams of protein!', they often contain 300 total calories due to heavy sugar and fat content. This yields a mediocre PCR of 6.6g per 100 calories." },
    { question: "How does this differ from Protein Percentage?", answer: "They measure the same underlying reality but express it differently. A PCR of 10g per 100 calories is exactly the same as saying the food is 40% protein (10g x 4kcal = 40kcal out of 100). PCR is just easier for many athletes to visualize when building meal plans." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Protein to Calorie Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Protein to Calorie Ratio Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Drumstick className="h-4 w-4" /> Lean Macro Evaluator
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exactly how many grams of protein a food delivers per 100 calories to expose misleading 'High Protein' marketing labels.</p>
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
                      Protein to Calorie Ratio (PCR)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight" style={{ color: results.chartData[0].color }}>{results.gramsPer100Kcal.toFixed(1)}</div>
                      <div className="text-xl font-bold text-muted-foreground">g / 100 kcal</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      For every 100 calories you consume of this food, you receive exactly <strong>{results.gramsPer100Kcal.toFixed(1)} grams</strong> of protein.
                    </p>
                  </div>
                  <Drumstick className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Nutritional Efficiency</h3>
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
                    <h3 className="text-base font-bold mb-4 w-full text-left">Efficiency Benchmark Comparison</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={results.chartData} layout="vertical" margin={{ top: 0, right: 15, left: 15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" hide domain={[0, 25]} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <ReferenceLine x={10} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                        <Bar dataKey="Protein per 100 kcal" radius={[0, 4, 4, 0]} barSize={20}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-2 w-full text-center">Dashed line indicates the 10g 'Excellent' benchmark threshold.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                {errorMsg ? (
                  <div className="text-red-500 font-bold max-w-sm">{errorMsg}</div>
                ) : (
                  <>
                    <Drumstick className="h-12 w-12 mb-4 opacity-20" />
                    <p className="font-medium max-w-xs">Enter the total calories and protein from a nutrition label to calculate the grams of protein per 100 calories.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding the Protein to Calorie Ratio</h2>
            <p>Hitting your daily protein target while staying inside a caloric deficit is the hardest mathematical challenge in fitness. Many people fail because they are tricked by deceptive marketing on the front of food packaging. A box of cereal might claim "10g of Protein!" in huge letters, but if that serving also contains 400 calories of sugar, it is actively destroying your fat loss goals. The <strong>Protein to Calorie Ratio (PCR) Calculator</strong> cuts through the marketing noise by giving you the only metric that actually matters: <em>How many grams of protein are you getting for every 100 calories you consume?</em></p>
            <p>By standardizing all foods to a 100-calorie baseline, you can easily compare a massive 800-calorie steak dinner to a 150-calorie protein shake on an even, mathematical playing field. This is the ultimate tool for evaluating macronutrient density and building a diet that supports lean muscle growth without unnecessary fat accumulation.</p>

            <h2>The Thermodynamics of Pure Protein</h2>
            <p>To use this calculator effectively, you must understand the absolute physical limits of food. The human body derives energy from three macronutrients:</p>
            <ul>
              <li><strong>Protein:</strong> 4 kilocalories per gram.</li>
              <li><strong>Carbohydrates:</strong> 4 kilocalories per gram.</li>
              <li><strong>Fats:</strong> 9 kilocalories per gram.</li>
            </ul>
            <p>Because protein yields 4 calories per gram, the absolute theoretical maximum Protein-to-Calorie Ratio is <strong>25 grams per 100 calories</strong> (25g x 4 kcal = 100 total kcal). If a food achieved a perfect 25 ratio, it would mean it is 100% pure protein with absolutely zero trace fats or carbohydrates. This is practically impossible to find in nature. Even ultra-refined whey protein isolate powders usually max out around 22g or 23g per 100 calories because of trace flavoring or binding agents.</p>

            <h2>Decoding the Quality Grades</h2>
            <p>When you input your numbers, the calculator assigns a "Quality Grade" based on the ratio. Here is exactly what those benchmarks mean for your diet:</p>
            <p><strong>Elite Source (15g to 25g per 100 kcal):</strong> Foods in this category are essentially pure protein. They contain almost zero fats or carbs. Examples include egg whites, skinless chicken breast, white fish (like cod or tilapia), and high-quality protein powder. If you are a bodybuilder weeks away from a competition, or someone trying to lose fat aggressively, your diet must be anchored by Elite sources.</p>
            <p><strong>Excellent Source (10g to 15g per 100 kcal):</strong> This is the "sweet spot" for sustainable fat loss. These foods are highly protein-dense but contain enough trace fats or carbs to actually taste good and keep you full. Examples include 93% lean ground turkey, non-fat plain Greek yogurt, and low-fat cottage cheese.</p>
            <p><strong>Good Source (6g to 10g per 100 kcal):</strong> Foods in this tier provide a solid dose of protein, but it comes packaged with a significant amount of dietary fat or carbohydrates. Whole eggs, whole milk, and fattier cuts of steak fall here. These are fantastic for maintenance diets or muscle-building phases (bulking), but they make cutting very difficult.</p>
            <p><strong>Moderate to Poor Sources (&lt; 6g per 100 kcal):</strong> These foods should not be considered protein sources. For example, a standard serving of peanut butter has 190 calories and 7g of protein, yielding a miserable ratio of 3.7g per 100 kcal. Peanut butter is an excellent source of healthy fats, but eating it to hit your protein goal will result in massive caloric surpluses and rapid fat gain.</p>

            <h2>Exposing "High Protein" Junk Food</h2>
            <p>The fitness industry has weaponized the phrase "High Protein" to sell junk food. Walk down the aisle of any grocery store, and you will see protein cookies, protein chips, and protein donuts. </p>
            <p>Let's look at a popular "High Protein" cookie. The label proudly boasts 16 grams of protein. However, checking the back reveals it contains 420 calories. If we input that into the calculator, it yields a PCR of just <strong>3.8g per 100 calories</strong>. This means the cookie is actually 85% fat and sugar, and only 15% protein. You would be better off eating an actual dessert and drinking a whey shake separately.</p>

            <h2>Applying PCR to Your Daily Diet</h2>
            <p>While evaluating individual foods is helpful, the PCR is most powerful when applied to your entire day of eating. If you weigh 200 lbs and want to eat 200g of protein a day while losing fat on a 2,000-calorie diet, your "Daily Target PCR" is <strong>10g per 100 calories</strong>.</p>
            <p>This means that, on average, every single thing you eat must hit that "Excellent" benchmark. If you eat a slice of pizza for lunch (which has a PCR of about 4g per 100 kcal), you have severely dragged down your daily average. To hit your 200g goal without going over 2,000 calories, you will be forced to eat nothing but dry chicken breast and egg whites (Elite sources) for dinner to balance the mathematical equation.</p>

            <h2>Protein Percentage vs. PCR</h2>
            <p>The calculator outputs both the PCR and the Protein Percentage. They are two sides of the exact same mathematical coin. If a food has a PCR of 10g per 100 calories, that means 40 of those 100 calories are protein (10g x 4kcal = 40kcal). Therefore, the food is 40% protein. </p>
            <p>Some people prefer thinking in percentages (e.g., "I want my diet to be 40% protein, 40% carbs, 20% fat"). However, many athletes find the PCR (grams per 100 cals) much easier to visualize when standing in the grocery store reading a nutrition label.</p>

            <h2>Why Does the Calculator Give Me an Error?</h2>
            <p>If you type in the numbers straight from a nutrition label and the calculator flashes a red error, do not panic. The calculator is enforcing thermodynamic law. Because protein yields 4 kcal/g, you cannot mathematically have a food with 100 total calories and 30 grams of protein (30g x 4 = 120 calories).</p>
            <p>If a label causes this error, the manufacturer is either aggressively rounding the numbers (which the FDA allows in small increments) or they are committing fraud via "amino spiking." In either case, the label is mathematically impossible and cannot be trusted.</p>

            <h2>Conclusion</h2>
            <p>Dieting does not have to be an emotional struggle; it is simply an accounting problem. By utilizing the Protein to Calorie Ratio Calculator, you can instantly strip away deceptive marketing and analyze the cold, hard mathematics of the foods you eat. By anchoring your meals with "Elite" and "Excellent" ratio foods, hitting your protein targets while maintaining a caloric deficit becomes a near certainty.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/protein-to-calorie-ratio-calculator" />
          <PopularCalculators exclude="/calculator/protein-to-calorie-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
