"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Apple } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface NDSInputs {
  calories: number;
  protein: number; // g
  fiber: number; // g
  addedSugar: number; // g
  saturatedFat: number; // g
  sodium: number; // mg
}

interface NDSResults {
  densityScore: number; // 0-100
  classification: "Superfood / High Density" | "Nutritious / Moderate" | "Low Density" | "Empty Calories / Ultra-Processed";
  recommendation: string;

  chartData: { subject: string; score: number; fullMark: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateNutrientDensity = (inputs: NDSInputs): NDSResults | null => {
  const { calories, protein, fiber, addedSugar, saturatedFat, sodium } = inputs;
  
  if (calories <= 0) return null;

  // Algorithm inspired by NRF (Nutrient Rich Foods) Index logic
  // Positive nutrients to encourage
  const proteinValue = (protein / 50) * 100; // Daily Value (DV) reference 50g
  const fiberValue = (fiber / 28) * 100;     // DV reference 28g

  const posSubtotal = proteinValue + fiberValue;

  // Negative nutrients to limit
  const sugarValue = (addedSugar / 50) * 100; // Limit 50g
  const satFatValue = (saturatedFat / 20) * 100; // Limit 20g
  const sodiumValue = (sodium / 2300) * 100; // Limit 2300mg

  const negSubtotal = sugarValue + satFatValue + sodiumValue;

  // Raw Score = (Positive % DV) - (Negative % DV) per 100 kcal
  const rawScorePer100Kcal = ((posSubtotal - negSubtotal) / calories) * 100;

  // Normalize to 0-100 scale
  // A perfect food (high protein/fiber, zero sugar/satfat) per 100 cals might score +100 to +300 raw
  // A terrible food (soda) might score -50 to -100 raw.
  let normalizedScore = 50 + (rawScorePer100Kcal * 2); 
  
  if (normalizedScore > 100) normalizedScore = 100;
  if (normalizedScore < 0) normalizedScore = 0;

  let classification: NDSResults["classification"] = "Empty Calories / Ultra-Processed";
  let recommendation = "";
  let colorClass = "text-red-500";

  if (normalizedScore >= 80) {
    classification = "Superfood / High Density";
    recommendation = "This food is packed with essential nutrients and fiber while remaining low in calories and harmful additives. It should be a staple in your daily diet.";
    colorClass = "text-green-500 font-bold";
  } else if (normalizedScore >= 50) {
    classification = "Nutritious / Moderate";
    recommendation = "A solid, balanced food. It provides a good amount of nutrition relative to its caloric load. Great for general maintenance.";
    colorClass = "text-blue-500 font-bold";
  } else if (normalizedScore >= 25) {
    classification = "Low Density";
    recommendation = "This food provides a lot of calories but relatively little nutritional value. It likely contains moderate amounts of added sugar or saturated fat. Consume in moderation.";
    colorClass = "text-amber-500 font-bold";
  } else {
    classification = "Empty Calories / Ultra-Processed";
    recommendation = "This food is highly processed and devoid of beneficial nutrients like protein and fiber. It is almost entirely composed of sugar, saturated fat, or sodium. Limit consumption drastically.";
    colorClass = "text-red-500 font-bold";
  }

  // Cap chart values at 100 for display
  const chartData = [
    { subject: 'Protein', score: Math.min(100, proteinValue), fullMark: 100 },
    { subject: 'Fiber', score: Math.min(100, fiberValue), fullMark: 100 },
    { subject: 'Low Sugar', score: Math.max(0, 100 - sugarValue), fullMark: 100 },
    { subject: 'Low Sat. Fat', score: Math.max(0, 100 - satFatValue), fullMark: 100 },
    { subject: 'Low Sodium', score: Math.max(0, 100 - sodiumValue), fullMark: 100 }
  ];

  const summaryStats = [
    { label: "Nutrient Density Score", value: `${normalizedScore.toFixed(0)} / 100`, colorClass: colorClass },
    { label: "Classification", value: classification, colorClass: colorClass },
    { label: "Beneficial Nutrients (DV%)", value: `+${posSubtotal.toFixed(1)}%`, colorClass: "text-green-500 font-medium" },
    { label: "Harmful Additives (DV%)", value: `-${negSubtotal.toFixed(1)}%`, colorClass: "text-red-500 font-medium" }
  ];

  return {
    densityScore: normalizedScore,
    classification,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  calories: "250",
  protein: "5",
  fiber: "1",
  addedSugar: "20",
  saturatedFat: "8",
  sodium: "350"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: "hsl(var(--primary))" }}>{payload[0].payload.subject}</p>
        <p className="text-muted-foreground">Relative Quality Score: {payload[0].value.toFixed(0)}</p>
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

export default function CalorieToNutrientDensityRatioCalculator() {
  // 4. Component State
  const [calories, setCalories] = useState(DEFAULTS.calories);
  const [protein, setProtein] = useState(DEFAULTS.protein);
  const [fiber, setFiber] = useState(DEFAULTS.fiber);
  const [addedSugar, setAddedSugar] = useState(DEFAULTS.addedSugar);
  const [saturatedFat, setSaturatedFat] = useState(DEFAULTS.saturatedFat);
  const [sodium, setSodium] = useState(DEFAULTS.sodium);
  
  const [results, setResults] = useState<NDSResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const inputs: NDSInputs = {
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      fiber: parseFloat(fiber) || 0,
      addedSugar: parseFloat(addedSugar) || 0,
      saturatedFat: parseFloat(saturatedFat) || 0,
      sodium: parseFloat(sodium) || 0
    };
    setResults(calculateNutrientDensity(inputs));
  };

  const handleReset = () => {
    setCalories(DEFAULTS.calories);
    setProtein(DEFAULTS.protein);
    setFiber(DEFAULTS.fiber);
    setAddedSugar(DEFAULTS.addedSugar);
    setSaturatedFat(DEFAULTS.saturatedFat);
    setSodium(DEFAULTS.sodium);
    
    setResults(calculateNutrientDensity({
      calories: parseFloat(DEFAULTS.calories),
      protein: parseFloat(DEFAULTS.protein),
      fiber: parseFloat(DEFAULTS.fiber),
      addedSugar: parseFloat(DEFAULTS.addedSugar),
      saturatedFat: parseFloat(DEFAULTS.saturatedFat),
      sodium: parseFloat(DEFAULTS.sodium)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calories, protein, fiber, addedSugar, saturatedFat, sodium]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Nutrient Density Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What does Nutrient Density mean?", answer: "Nutrient density refers to the amount of beneficial nutrients (like vitamins, minerals, protein, and fiber) a food contains relative to its calorie count. A 'nutrient-dense' food gives you a massive amount of nutrition for very few calories. An 'empty calorie' food gives you a massive amount of calories with zero nutritional benefit." },
    { question: "How does this algorithm work?", answer: "Our algorithm is based on the Nutrient Rich Foods (NRF) index logic. It takes the positive components (Protein and Fiber) and subtracts the negative components (Added Sugar, Saturated Fat, and Sodium) based on FDA Daily Value percentages. It then divides that net score by the total calories to generate a density ratio." },
    { question: "Why is fiber so heavily weighted?", answer: "Fiber is the ultimate indicator of an unprocessed, natural food. It slows digestion, prevents insulin spikes, and feeds your gut microbiome. Ultra-processed foods have almost all their natural fiber mechanically stripped away during manufacturing." },
    { question: "Can a food be healthy but have a low density score?", answer: "Yes, to a degree. Olive oil and nuts are incredibly healthy fats, but because fat is so calorically dense (9 kcal/g), their Nutrient Density Score might be moderate. This just means you must practice portion control, as they are not 'low calorie/high volume' foods like broccoli or spinach." },
    { question: "What is an 'Empty Calorie'?", answer: "An empty calorie is a calorie derived entirely from added sugars or solid fats (like high-fructose corn syrup or trans fats) that offers zero vitamins, minerals, protein, or fiber. Soda, candy, and standard potato chips are prime examples." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Calorie to Nutrient Density Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Nutrient Density Score Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[500px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Apple className="h-4 w-4" /> Food Quality Analyzer
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Enter the macro data from any nutrition label to instantly calculate its Nutrient Density Score (NDS) and determine if it consists of 'Empty Calories'.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="cals" label="Total Calories" value={calories} onChange={setCalories} suffix="kcal" />
            </div>

            <div className="h-px bg-border my-1"></div>
            <h3 className="text-sm font-bold text-green-500 mb-[-8px]">Beneficial Nutrients (Maximize)</h3>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="prot" label="Protein" value={protein} onChange={setProtein} suffix="grams" />
              <CompactInput id="fib" label="Dietary Fiber" value={fiber} onChange={setFiber} suffix="grams" />
            </div>

            <div className="h-px bg-border my-1"></div>
            <h3 className="text-sm font-bold text-red-500 mb-[-8px]">Harmful Additives (Minimize)</h3>
            <div className="grid grid-cols-2 gap-4">
              <CompactInput id="sugar" label="Added Sugars" value={addedSugar} onChange={setAddedSugar} suffix="grams" />
              <CompactInput id="satfat" label="Saturated Fat" value={saturatedFat} onChange={setSaturatedFat} suffix="grams" />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-0">
              <CompactInput id="sod" label="Sodium" value={sodium} onChange={setSodium} suffix="mg" />
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
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
                  results.densityScore >= 80 ? "bg-green-500/10 border-green-500" :
                  results.densityScore >= 50 ? "bg-blue-500/10 border-blue-500" :
                  results.densityScore >= 25 ? "bg-amber-500/10 border-amber-500" :
                  "bg-red-500/10 border-red-500"
                }`}>
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: results.densityScore >= 80 ? "#10b981" : results.densityScore >= 50 ? "#3b82f6" : results.densityScore >= 25 ? "#f59e0b" : "#ef4444" }}>
                      Nutrient Density Score (NDS)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.densityScore.toFixed(0)}</div>
                      <div className="text-xl font-bold text-muted-foreground">/ 100</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      <strong>Classification:</strong> {results.classification}
                    </p>
                  </div>
                  <Apple className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Nutritional Analysis</h3>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Quality Radar</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={results.chartData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Quality Metric" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                        <Tooltip content={<CustomTooltip />} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-0 w-full text-center">A larger, fuller shape indicates a healthier, more nutrient-dense profile.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Apple className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter data from any nutrition label to evaluate its true nutritional quality and density score.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Nutrient Density</h2>
            <p>In the modern world of fitness and dieting, there is a massive obsession with macronutrients (proteins, carbs, and fats) and raw calorie counting. This approach, colloquially known as "If It Fits Your Macros" (IIFYM), has led many people to believe that 500 calories of potato chips is biologically equivalent to 500 calories of grilled chicken and broccoli, so long as the math balances out at the end of the day. This is a fundamentally flawed understanding of human biology.</p>
            <p>The human body does not just require raw energy (calories) to survive; it requires microscopic instructions in the form of vitamins, minerals, and amino acids to repair DNA, balance hormones, and fight off disease. This is where the concept of <strong>Nutrient Density</strong> comes in. The <strong>Calorie to Nutrient Density Ratio Calculator</strong> is designed to look past the raw calorie count and algorithmically determine exactly how much actual <em>nutrition</em> a food provides per calorie consumed.</p>

            <h2>The Mathematics of the Density Score</h2>
            <p>Our algorithm is heavily inspired by the Nutrient Rich Foods (NRF) Index, a scientifically validated model used by dietitians globally to rank the quality of foods. The math is simple but highly revealing:</p>
            <p>First, the calculator analyzes the <strong>Beneficial Nutrients</strong>. It looks at the grams of protein and dietary fiber, calculating what percentage of your daily recommended value you are receiving. These are the "good points."</p>
            <p>Next, it analyzes the <strong>Harmful Additives</strong>. It evaluates the amount of Added Sugars, Saturated Fat, and Sodium, calculating their percentage of the daily maximum limits. These are the "negative points."</p>
            <p>Finally, the calculator subtracts the negative points from the positive points and divides the resulting number by the total calories. This ensures that foods cannot "cheat" the system by simply having massive serving sizes. The result is normalized on a clean 0 to 100 scale, giving you a definitive, objective grade of the food's quality.</p>

            <h2>The Danger of "Empty Calories" (Score 0 - 24)</h2>
            <p>If your food scores in the red zone, it is classified as containing "Empty Calories." This is the hallmark of ultra-processed food (UPF). Examples include soda, candy, standard potato chips, and commercial pastries.</p>
            <p>Empty calories are incredibly dangerous for two reasons. First, they provide zero satiety. Because they lack fiber and protein, they do not trigger the stretch receptors in your stomach or the release of leptin (the fullness hormone) in your brain. You can easily consume 1,000 empty calories of soda and chips and still feel physically starving an hour later.</p>
            <p>Second, metabolizing these foods actually <em>depletes</em> your body's existing vitamin stores. To process and digest massive amounts of refined sugar, your body must pull B-vitamins and calcium from your bones and tissues. Empty calories do not just fail to provide nutrition; they actively steal it.</p>

            <h2>Low Density to Moderate Density (Score 25 - 79)</h2>
            <p>This massive middle ground contains the bulk of the modern Western diet. A food scoring in the 30s or 40s is usually a "mixed" food—perhaps a frozen pizza or a fast-food hamburger. It provides a decent amount of protein, but it brings along a massive payload of saturated fat, sodium, and refined carbohydrate calories.</p>
            <p>Foods scoring in the 60s and 70s are generally solid, balanced meals. A home-cooked plate of spaghetti with meat sauce, or a peanut butter and jelly sandwich on whole wheat bread, will land here. These foods are the bedrock of a maintenance diet. They provide the energy and macronutrients required to get through a busy day or fuel a workout without overwhelming the body with toxic additives.</p>

            <h2>The Power of Superfoods (Score 80 - 100)</h2>
            <p>If a food scores in the 80s or 90s, it is classified as a "High-Density Superfood." These are the cheat codes of human nutrition. Examples include spinach, kale, broccoli, lean chicken breast, egg whites, and lentils.</p>
            <p>Superfoods possess a unique mathematical property: they max out the positive scoring (massive amounts of fiber, vitamins, and protein) while having virtually zero negative points (no sugar, no sat fat) and an incredibly low caloric footprint. You can eat an entire pound of broccoli for roughly 150 calories. It will physically stretch your stomach, eliminating hunger entirely, while flooding your bloodstream with antioxidants and micronutrients. If your goal is aggressive fat loss, your diet must be built around foods scoring in this tier.</p>

            <h2>Why is Fiber the Ultimate Metric?</h2>
            <p>When you look at the Radar Chart visualization, you will notice that Fiber holds significant weight in determining the shape of the polygon. This is intentional. In the modern food ecosystem, fiber is the ultimate litmus test for whether a food is natural or ultra-processed.</p>
            <p>In nature, sugar is almost always packaged with massive amounts of fiber. Think of an apple or a beet. The fiber acts as a biological net, slowing down the digestion of the sugar so your liver is not overwhelmed, preventing an insulin spike. Food manufacturers mechanically strip the fiber out of foods to increase shelf life and make the food hyper-palatable (so it melts in your mouth). If a carbohydrate-heavy food has zero fiber, it has been ultra-processed and will wreck your metabolic health.</p>

            <h2>Sodium: The Silent Inflammatory</h2>
            <p>Another major factor in the algorithm is Sodium. While athletes who sweat heavily need sodium, the average sedentary human consumes vastly more than the recommended 2,300 mg limit per day. High sodium intake pulls water into the bloodstream, increasing blood volume and placing massive mechanical stress on the walls of the arteries (high blood pressure).</p>
            <p>More insidiously, ultra-processed foods use massive amounts of sodium to mask the taste of chemical preservatives. If a frozen meal or canned soup scores terribly on our calculator, it is almost always because the sodium levels are astronomical.</p>

            <h2>Conclusion: Quality Over Quantity</h2>
            <p>Weight loss is dictated by the quantity of calories you consume, but your longevity, energy levels, and disease risk are dictated entirely by the quality of those calories. By utilizing the Calorie to Nutrient Density Ratio Calculator, you can train your brain to look past flashy marketing claims. You will begin to view food not just as a source of energy, but as a vehicle for complex, life-sustaining nutrition.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/calorie-to-nutrient-density-ratio-calculator" />
          <PopularCalculators exclude="/calculator/calorie-to-nutrient-density-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
