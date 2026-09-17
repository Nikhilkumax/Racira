"use client";
import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw, Printer } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface HamsterInputs {
  weightGrams: number;
  activityLevel: "inactive" | "normal" | "active";
  foodDensity: number; // kcal per gram of food (usually around 3.5 for standard pellets)
}

interface HamsterResults {
  rer: number; // Resting Energy Requirement
  dailyCalories: number; // Maintenance Energy Requirement
  treatCaloriesMax: number; // 10% rule
  baseFoodCalories: number; // 90% rule
  foodGramsPerDay: number; // Based on food density
  waterMlPerDay: number; // Roughly 10-15% of body weight in ml
  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateHamsterDiet = (inputs: HamsterInputs): HamsterResults => {
  const { weightGrams, activityLevel, foodDensity } = inputs;
  const safeWeight = weightGrams > 0 ? weightGrams : 0;

  const weightKg = safeWeight / 1000;

  // Veterinary RER formula for small mammals: RER = 70 * (Weight in kg)^0.75
  const rer = 70 * Math.pow(weightKg, 0.75);

  // Activity Multipliers
  const multipliers = {
    inactive: 1.4, // Senior or very sedentary
    normal: 1.6,   // Standard maintenance
    active: 2.0    // Growing pup, nursing, or highly active wheel runner
  };

  const dailyCalories = rer * multipliers[activityLevel];

  // 10% Treat Rule
  const treatCaloriesMax = dailyCalories * 0.10;
  const baseFoodCalories = dailyCalories - treatCaloriesMax;

  // Food in grams
  const foodGramsPerDay = baseFoodCalories / (foodDensity > 0 ? foodDensity : 3.5);

  // Water requirement (~10% of body weight in ml daily)
  const waterMlPerDay = Math.max(safeWeight * 0.10, dailyCalories);

  const chartData = [
    { name: "Main Diet (Pellets/Seed Mix)", value: Math.round(baseFoodCalories), color: "hsl(var(--primary))" },
    { name: "Treats/Fresh Veggies", value: Math.round(treatCaloriesMax), color: "#f59e0b" }
  ];

  const species = safeWeight > 80 ? "Syrian Hamster" : safeWeight > 30 ? "Dwarf Hamster" : "Roborovski / Young Pup";

  const summaryStats = [
    { label: "Total Daily Calories", value: `${dailyCalories.toFixed(1)} kcal`, colorClass: "text-primary font-bold" },
    { label: "Main Diet Allocation", value: `${baseFoodCalories.toFixed(1)} kcal` },
    { label: "Max Treat Allowance", value: `${treatCaloriesMax.toFixed(1)} kcal`, colorClass: "text-amber-500 font-medium" },
    { label: "Estimated Daily Food", value: `${foodGramsPerDay.toFixed(1)} grams` },
    { label: "Estimated Daily Water", value: `~${waterMlPerDay.toFixed(0)} mL` },
    { label: "Size Category", value: species }
  ];

  return {
    rer,
    dailyCalories,
    treatCaloriesMax,
    baseFoodCalories,
    foodGramsPerDay,
    waterMlPerDay,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weightGrams: "120", // Average Syrian
  activityLevel: "normal" as const,
  foodDensity: "3.5" // Typical kcal/g for Oxbow/Mazuri
};

const fmt = (n: number, dec = 1) => n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-0.5" style={{ color: payload[0].payload.color }}>{payload[0].name}</p>
        <p className="text-muted-foreground">{payload[0].value.toFixed(0)} kcal / day</p>
      </div>
    );
  }
  return null;
};

// Input Component
const CompactInput = ({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  min,
  error
}: {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  min?: string;
  error?: string;
}) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-semibold text-foreground mb-1">
      {label}
    </label>
    <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {prefix && (
        <span className="pl-3 pr-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <input
        id={id}
        type="number"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full px-3 py-1 text-base bg-transparent outline-none focus:outline-none border-none text-foreground"
      />
      {suffix && (
        <span className="pr-3 pl-1 text-sm text-muted-foreground select-none pointer-events-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>}
  </div>
);

export default function HamsterCalorieCalculator() {
  // 4. Component State
  const [weightGrams, setWeightGrams] = useState(DEFAULTS.weightGrams);
  const [activityLevel, setActivityLevel] = useState<"inactive" | "normal" | "active">(DEFAULTS.activityLevel);
  const [foodDensity, setFoodDensity] = useState(DEFAULTS.foodDensity);

  const getInputs = (): HamsterInputs => ({
    weightGrams: parseFloat(weightGrams) || 0,
    activityLevel,
    foodDensity: parseFloat(foodDensity) || 3.5
  });

  const [results, setResults] = useState<HamsterResults>(() => calculateHamsterDiet(getInputs()));
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults(calculateHamsterDiet(getInputs()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wg = parseFloat(weightGrams) || 0;
  const hasErrors = wg <= 0;

  const handleCalculate = () => {
    if (hasErrors) return;
    setResults(calculateHamsterDiet(getInputs()));
  };

  const handleReset = () => {
    setWeightGrams(DEFAULTS.weightGrams);
    setActivityLevel(DEFAULTS.activityLevel);
    setFoodDensity(DEFAULTS.foodDensity);
    setResults(calculateHamsterDiet(getInputs()));
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Hamster Diet Results</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const breakdown = [
    { label: "Resting Energy (RER)", value: `${fmt(results.rer)} kcal` },
    { label: "Maintenance Calories (MER)", value: `${fmt(results.dailyCalories)} kcal` },
    { label: "Main Diet Allocation (90%)", value: `${fmt(results.baseFoodCalories)} kcal`, highlight: true },
    { label: "Max Treat Allowance (10%)", value: `${fmt(results.treatCaloriesMax)} kcal` },
    { label: "Estimated Daily Food", value: `${fmt(results.foodGramsPerDay)} grams` },
    { label: "Estimated Daily Water", value: `~${fmt(results.waterMlPerDay, 0)} mL` },
    { label: "Total Daily Calories", value: `${fmt(results.dailyCalories)} kcal`, isTotal: true }
  ];

  const faqs = [
    { question: "How many calories does a hamster need?", answer: "A hamster's caloric needs depend entirely on their species and weight. A 150-gram Syrian hamster requires about 27 kcal per day, while a tiny 35-gram Dwarf hamster only requires about 9 kcal per day." },
    { question: "What is the 10% Treat Rule?", answer: "Veterinarians strongly recommend that no more than 10% of a hamster's daily calories come from treats or fresh vegetables. The other 90% must come from a nutritionally complete lab block or fortified seed mix to prevent severe vitamin deficiencies." },
    { question: "Are seed mixes better than pellets?", answer: "Both have pros and cons. High-quality seed mixes provide necessary foraging enrichment but allow 'selective feeding' (the hamster only eats the fatty seeds and leaves the healthy bits). Uniform pellets prevent selective feeding but are boring. Many owners feed a measured combination of both." },
    { question: "Why is my hamster getting fat?", answer: "Obesity is common in captive hamsters due to a lack of exercise (wheels that are too small cause pain, so the hamster stops running) and overfeeding of high-fat treats like sunflower seeds and yogurt drops." },
    { question: "How do I weigh my hamster?", answer: "Use a digital kitchen scale that measures in grams. The easiest method is to place a small cup or bowl on the scale, press the 'Tare/Zero' button, and then gently place the hamster inside the bowl." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Hamster Calorie Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Hamster Calorie Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          {/* LEFT: INPUT PANEL */}
          <div className="card-calculator flex flex-col gap-4 !p-4 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-4">
              <CompactInput
                id="weight"
                label="Hamster's Weight"
                value={weightGrams}
                onChange={setWeightGrams}
                suffix="grams"
                min="1"
                error={wg <= 0 ? "Must be > 0" : undefined}
              />
              <div className="flex flex-col">
                <label htmlFor="activity" className="flex items-center text-sm font-semibold text-foreground mb-1">
                  Activity / Life Stage
                </label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <select
                    id="activity"
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as "inactive" | "normal" | "active")}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground cursor-pointer font-medium"
                  >
                    <option value="normal">Normal / Maintenance Adult</option>
                    <option value="inactive">Senior / Sedentary / Overweight</option>
                    <option value="active">Growing Pup / Nursing / Highly Active</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput
                id="density"
                label="Food Energy Density"
                value={foodDensity}
                onChange={setFoodDensity}
                suffix="kcal / gram"
                min="0.1"
              />
              <p className="text-[11px] text-muted-foreground -mt-1">Standard hamster pellets are usually 3.0 to 3.8 kcal/g. Check your food bag's guaranteed analysis.</p>
            </div>

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                disabled={hasErrors}
                onClick={handleCalculate}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-md font-bold h-10 text-base transition-all shadow-sm ${
                  hasErrors ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/95 text-primary-foreground active:scale-[0.98]"
                }`}
              >Calculate</button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="h-10 w-10 rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground transition-colors flex items-center justify-center shrink-0 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* RIGHT: RESULTS PANEL */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start" ref={printRef}>
            {/* 1. Primary Result Card */}
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
              <div className="flex justify-end absolute top-3 right-3">
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline focus:outline-none">
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
              </div>
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Total Daily Calories</div>
              <div className="text-4xl font-extrabold text-primary mb-1 tracking-tight">
                {fmt(results.dailyCalories)} <span className="text-xl font-bold text-muted-foreground">kcal</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Feed {fmt(results.foodGramsPerDay)} grams of main food per day to maintain this weight.
              </div>
            </div>

            {/* 2. 3-Stat Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border border-border rounded-lg text-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Main Diet</span>
                <span className="font-extrabold text-emerald-600">{fmt(results.baseFoodCalories)} kcal</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Max Treats</span>
                <span className="font-extrabold text-amber-600">{fmt(results.treatCaloriesMax)} kcal</span>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Food</span>
                <span className="font-extrabold text-foreground">{fmt(results.foodGramsPerDay)} g</span>
              </div>
            </div>

            {/* 3. Breakdown Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-2.5 pl-3">Breakdown</th>
                    <th className="p-2.5 pr-3 text-right w-[160px]">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {breakdown.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-secondary/20 transition-colors ${row.isTotal ? "font-bold bg-secondary/30 border-t-2 border-border" : ""} ${row.highlight ? "bg-amber-500/10" : ""}`}>
                      <td className={`p-2.5 pl-3 font-semibold ${row.highlight ? "text-amber-700" : "text-foreground"}`}>{row.label}</td>
                      <td className={`p-2.5 pr-3 text-right ${row.highlight ? "text-amber-700 font-bold" : "text-foreground"}`}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 4. Chart */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-bold text-foreground mb-3">Dietary Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={results.chartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {results.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 mt-2">
                {results.chartData.map((d, i) => {
                  const pct = results.dailyCalories > 0 ? (d.value / results.dailyCalories) * 100 : 0;
                  return (
                    <div key={i} className="flex justify-between items-center text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }}></span>
                        {d.name}
                      </div>
                      <span className="font-bold">{pct.toFixed(0)}% · {d.value} kcal</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Summary Statistics */}
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Nutritional Targets</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {results.summaryStats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">{stat.label}</span>
                    <span className={`text-base font-extrabold ${stat.colorClass || "text-foreground"}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Hamster Calorie Calculator</h2>
            <p>Hamsters are incredibly popular pets, yet their nutritional needs are frequently misunderstood. Because they are so small, it is remarkably easy to accidentally overfeed them, leading to severe obesity, diabetes (especially in dwarf species), and a significantly shortened lifespan. The <strong>Hamster Calorie Calculator</strong> is a veterinary-grade tool designed to strip the guesswork out of feeding your pocket pet. By utilizing standardized allometric scaling formulas, this tool calculates the exact resting and maintenance energy requirements for your specific hamster based on their weight and activity level.</p>
            <p>Whether you own a large 200-gram Syrian hamster or a tiny 30-gram Roborovski, understanding their exact daily caloric limit is the first step in providing responsible, ethical care. This calculator not only provides the raw caloric data but translates those numbers into actionable feeding portions in grams, ensuring you do not overfill the food bowl.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Small Mammal Metabolism</h2>
            <p>Metabolism does not scale linearly with body weight. A 100-gram hamster does not require exactly one-tenth the calories of a 1-kilogram rabbit. Smaller mammals have a much higher surface-area-to-volume ratio, meaning they lose body heat much faster than larger animals. To compensate, their basal metabolic rate (BMR) must run significantly faster just to keep them alive.</p>
            <p>Veterinarians calculate the <strong>Resting Energy Requirement (RER)</strong> for small exotics using an exponential formula: <code>70 × (Body Weight in kg)^0.75</code>. Our calculator performs this complex math instantly. It then applies an Activity Multiplier (usually 1.6x for an adult hamster with a properly sized running wheel) to determine the <strong>Maintenance Energy Requirement (MER)</strong>. This final number represents the total calories your hamster needs to consume daily to maintain their current body weight.</p>

            <h2 className="text-2xl font-bold mb-3">The 10% Treat Rule: Avoiding Nutritional Deficiencies</h2>
            <p>One of the most critical metrics provided by this calculator is the <strong>Max Treat Allowance</strong>. Exotic veterinarians universally enforce the "10% Rule" for small mammals. This rule dictates that 90% of a hamster's daily caloric intake must come from a nutritionally complete, fortified staple diet (such as high-quality lab blocks or a perfectly balanced seed mix). The remaining 10% can be reserved for fresh vegetables, mealworms, or commercial treats.</p>
            <p>Why is this so strict? Hamsters require precise ratios of calcium to phosphorus, specific levels of protein (usually 15-19%), and essential vitamins. If you feed your hamster too many treats—even healthy treats like broccoli or carrots—they will fill up on the treats and refuse to eat their staple diet. Over time, this leads to severe nutritional deficiencies, metabolic bone disease, and organ failure. The calculator explicitly shows you the exact calorie limit for treats to prevent this dangerous imbalance.</p>

            <h2 className="text-2xl font-bold mb-3">Translating Calories to Grams of Food</h2>
            <p>Knowing that your hamster needs "20 calories a day" is not very helpful when you are holding a bag of food. You need to know how much to put in the bowl. Our calculator bridges this gap by utilizing <strong>Food Energy Density</strong>.</p>
            <p>Standard high-quality hamster diets (like Oxbow Essentials or Mazuri Rat/Mouse blocks) typically contain about 3.5 kilocalories per gram. By dividing your hamster's 'Main Diet Allocation' by 3.5, the calculator tells you exactly how many grams of food to weigh out on your kitchen scale every evening. If your food bag lists a different caloric density in the Guaranteed Analysis section, you can input that number into the calculator for perfect precision.</p>

            <h2 className="text-2xl font-bold mb-3">The Danger of Seed Mixes and Selective Feeding</h2>
            <p>Walk into any major pet store, and you will see dozens of colorful hamster diets containing pellets, dried corn, sunflower seeds, and bright green puffs. While these look appealing, they present a massive hidden danger: <strong>Selective Feeding</strong>.</p>
            <p>Hamsters are notorious hoarders and picky eaters. If you fill their bowl with a seed mix, they will immediately pick out the high-fat, high-calorie items (like sunflower seeds and peanuts) and ignore the less tasty fortified pellets that actually contain the essential vitamins. They will stuff the healthy pellets into their cheek pouches and bury them under their bedding, tricking you into thinking they ate them. If you simply refill the bowl the next day, the cycle continues, and the hamster becomes obese and malnourished simultaneously.</p>
            <p>To combat this, many exotic veterinarians recommend either feeding a uniform pelleted diet (where every bite is nutritionally identical) or strictly enforcing "Bowl Emptying." If you feed a seed mix using the exact gram weight provided by our calculator, you must not refill the bowl until every single piece of food has been consumed. This forces the hamster to eat the healthy bits, not just the fatty seeds.</p>

            <h2 className="text-2xl font-bold mb-3">Dwarf Hamsters and Diabetes Risk</h2>
            <p>If you have a dwarf hamster (specifically Campbell's Dwarf or Winter White/Djungarian hybrids), precise calorie and nutritional management is even more critical. These species have a genetic predisposition to Type 2 Diabetes.</p>
            <p>For these hamsters, completely eliminating high-sugar treats (such as yogurt drops, fruit, honey-coated seed sticks, and even sweet vegetables like carrots and corn) is heavily recommended. Their entire Treat Allowance should be fulfilled using high-protein, low-sugar options like freeze-dried chicken, mealworms, or leafy green vegetables (like spinach or cucumber).</p>

            <h2 className="text-2xl font-bold mb-3">The Importance of the Running Wheel</h2>
            <p>A hamster's metabolism and caloric needs are entirely dependent on their ability to exercise. In the wild, a Syrian hamster can run up to 5 miles a night foraging for food. In captivity, a running wheel is an absolute necessity, not a luxury.</p>
            <p>However, the wheel must be correctly sized. A Syrian hamster requires a wheel that is at least 11 to 12 inches in diameter. If the wheel is too small, the hamster must arch its back unnaturally to run, causing severe spinal pain. A hamster in pain will stop using the wheel, leading their activity level to plummet to "Inactive." If their diet is not immediately reduced using our calculator, they will rapidly gain fat.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion</h2>
            <p>Caring for a hamster involves much more than filling a bowl and forgetting about it. These complex, delicate animals require precise nutritional management to thrive. By utilizing a digital kitchen scale and the Hamster Calorie Calculator, you transform your care routine from reactive to proactive.</p>
            <p>Weigh your hamster weekly to track their baseline, use the 10% rule to safely provide enrichment treats, and never overfill the food bowl. Through strict adherence to caloric data, you can prevent obesity, avoid diabetes, and ensure your tiny companion lives the longest, healthiest life possible.</p>
          </section>

          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/hamster-calorie-calculator" />
          <PopularCalculators exclude="/calculator/hamster-calorie-calculator" />
        </div>
      </div>
    </>
  );
}
