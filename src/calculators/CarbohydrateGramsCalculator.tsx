"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, ActivitySquare, AlertTriangle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface CarbInputs {
  calories: number;
  proteinPercent: number;
  fatPercent: number;
}

interface CarbResults {
  carbPercent: number;
  carbCalories: number;
  carbGrams: number;
  
  proteinCalories: number;
  proteinGrams: number;
  
  fatCalories: number;
  fatGrams: number;

  chartData: { name: string; value: number; color: string }[];
  error?: string;
}

// 2. Pure Calculation Function
const calculateCarbGrams = (inputs: CarbInputs): CarbResults => {
  const { calories, proteinPercent, fatPercent } = inputs;
  
  const carbPercent = 100 - proteinPercent - fatPercent;
  
  if (carbPercent < 0) {
    return {
      carbPercent: 0, carbCalories: 0, carbGrams: 0,
      proteinCalories: 0, proteinGrams: 0, fatCalories: 0, fatGrams: 0,
      chartData: [],
      error: "Protein and Fat percentages exceed 100%."
    };
  }

  const proteinCalories = (calories * proteinPercent) / 100;
  const fatCalories = (calories * fatPercent) / 100;
  const carbCalories = (calories * carbPercent) / 100;

  // Gram calculations (Protein = 4 kcal/g, Fat = 9 kcal/g, Carbs = 4 kcal/g)
  const proteinGrams = proteinCalories / 4;
  const fatGrams = fatCalories / 9;
  const carbGrams = carbCalories / 4;

  const chartData = [
    { name: "Carbohydrates", value: Math.round(carbCalories), color: "#3b82f6" }, // Blue
    { name: "Protein", value: Math.round(proteinCalories), color: "#ef4444" },   // Red
    { name: "Fat", value: Math.round(fatCalories), color: "#f59e0b" }            // Amber
  ];

  return {
    carbPercent: Math.round(carbPercent * 10) / 10,
    carbCalories: Math.round(carbCalories),
    carbGrams: Math.round(carbGrams),
    proteinCalories: Math.round(proteinCalories),
    proteinGrams: Math.round(proteinGrams),
    fatCalories: Math.round(fatCalories),
    fatGrams: Math.round(fatGrams),
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  calories: "2000",
  proteinPercent: "30",
  fatPercent: "25"
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
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

export default function CarbohydrateGramsCalculator() {
  // 4. Component State
  const [calories, setCalories] = useState(DEFAULTS.calories);
  const [proteinPercent, setProteinPercent] = useState(DEFAULTS.proteinPercent);
  const [fatPercent, setFatPercent] = useState(DEFAULTS.fatPercent);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<CarbResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const cal = parseFloat(calories);
    const pPct = parseFloat(proteinPercent);
    const fPct = parseFloat(fatPercent);

    if (isNaN(cal) || cal <= 0) {
      setErrorMsg("Please enter a valid daily calorie target.");
      return;
    }
    if (isNaN(pPct) || pPct < 0 || pPct > 100) {
      setErrorMsg("Protein percentage must be between 0 and 100.");
      return;
    }
    if (isNaN(fPct) || fPct < 0 || fPct > 100) {
      setErrorMsg("Fat percentage must be between 0 and 100.");
      return;
    }

    const res = calculateCarbGrams({ calories: cal, proteinPercent: pPct, fatPercent: fPct });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setResults(res);
    }
  };

  const handleReset = () => {
    setCalories(DEFAULTS.calories);
    setProteinPercent(DEFAULTS.proteinPercent);
    setFatPercent(DEFAULTS.fatPercent);
    setErrorMsg("");
    setResults(calculateCarbGrams({
      calories: parseFloat(DEFAULTS.calories),
      proteinPercent: parseFloat(DEFAULTS.proteinPercent),
      fatPercent: parseFloat(DEFAULTS.fatPercent)
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calories, proteinPercent, fatPercent]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Carbohydrate Target Summary</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "How are carbohydrates calculated from remaining calories?", answer: "Carbohydrates are considered the 'flexible macro.' Once you establish your Daily Calorie Target, and subtract your fixed goals for Protein and Fat, the remaining calories are entirely allocated to carbohydrates. Since every 1 gram of carbohydrate yields 4 calories, you simply divide the remaining calories by 4 to get your exact gram target." },
    { question: "How many calories are in each macronutrient?", answer: "Protein yields 4 calories per gram. Carbohydrates also yield 4 calories per gram. Dietary fats are far more energy-dense, yielding 9 calories per gram." },
    { question: "Why do athletes need so many carbohydrates?", answer: "Carbohydrates are the body's preferred and most efficient source of high-intensity energy. When you eat carbohydrates, they are converted into glycogen and stored in your muscles and liver. During intense exercise (like heavy weightlifting or sprinting), your body rapidly depletes these glycogen stores. Eating adequate carbs ensures those stores are replenished so you can perform optimally the next day." },
    { question: "Will eating carbohydrates make me gain fat?", answer: "No. Carbohydrates themselves do not cause fat gain. Fat gain is driven exclusively by a sustained caloric surplus (eating more total calories—from any macronutrient—than your body burns in a day). As long as you remain in a caloric deficit or maintenance, you will not gain body fat, regardless of your carbohydrate intake." },
    { question: "What is a normal carbohydrate percentage?", answer: "For the average active adult, a balanced diet consists of 40% to 50% carbohydrates. Endurance athletes (runners, cyclists) often push this to 55% or 60% to maximize glycogen availability. Conversely, those following a ketogenic diet heavily restrict carbohydrates to roughly 5% of their total daily intake." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carbohydrate Grams Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbohydrate Grams Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <PieChartIcon className="h-4 w-4" /> Macronutrient Balancing
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Determine your exact daily carbohydrate target by subtracting your protein and fat goals from your total daily calories.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <CompactInput id="calories" label="Total Daily Calories" value={calories} onChange={setCalories} suffix="kcal" />
              <CompactInput id="proteinPct" label="Protein Target" value={proteinPercent} onChange={setProteinPercent} suffix="%" />
              <CompactInput id="fatPct" label="Fat Target" value={fatPercent} onChange={setFatPercent} suffix="%" />
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
                
                {/* 1. Primary Result Card */}
                <div className="bg-blue-500 text-white rounded-lg p-6 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-blue-100 text-sm font-bold uppercase tracking-wider mb-1">
                        Daily Carbohydrate Target
                      </div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-6xl font-extrabold tracking-tight">{results.carbGrams}</div>
                        <div className="text-xl font-bold text-blue-200">grams</div>
                      </div>
                      <div className="text-sm font-medium text-blue-100 mt-2 bg-blue-600/50 inline-block px-3 py-1 rounded-full">
                        {results.carbPercent}% of Total Diet ({results.carbCalories} kcal)
                      </div>
                    </div>
                  </div>
                  <PieChartIcon className="absolute -bottom-6 -right-6 h-40 w-40 opacity-10" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 2. Full Macro Breakdown */}
                  <div className="bg-card border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Complete Macro Profile</h3>
                    <div className="flex flex-col gap-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">Carbohydrates</div>
                          <div className="text-xs text-muted-foreground">{results.carbPercent}% • {results.carbCalories} kcal</div>
                        </div>
                        <div className="text-lg font-black">{results.carbGrams}g</div>
                      </div>
                      
                      <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-red-600 dark:text-red-400">Protein</div>
                          <div className="text-xs text-muted-foreground">{proteinPercent}% • {results.proteinCalories} kcal</div>
                        </div>
                        <div className="text-lg font-black">{results.proteinGrams}g</div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-amber-600 dark:text-amber-400">Dietary Fat</div>
                          <div className="text-xs text-muted-foreground">{fatPercent}% • {results.fatCalories} kcal</div>
                        </div>
                        <div className="text-lg font-black">{results.fatGrams}g</div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Donut Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Caloric Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={results.chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <PieChartIcon className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your total daily calories and your targets for protein and fat to calculate your required carbohydrate intake.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>Understanding Your Carbohydrate Grams Target</h2>
            <p>In the world of sports nutrition and dietetics, carbohydrates are often referred to as the "flexible macro." While your body absolutely requires specific minimums of dietary protein (to repair muscle tissue and synthesize enzymes) and dietary fat (to regulate hormones and absorb fat-soluble vitamins), your carbohydrate intake is entirely dictated by your energy output and performance goals. The <strong>Carbohydrate Grams Calculator</strong> removes the guesswork from meal planning by utilizing reverse-subtraction math. By establishing your total caloric ceiling and securing your essential protein and fat targets first, the calculator allocates every remaining calorie exclusively to carbohydrates, giving you an exact daily gram target to fuel your lifestyle.</p>

            <h2>The Mathematics of Macronutrients</h2>
            <p>To accurately calculate carbohydrate grams, you must first understand the caloric density of the three primary macronutrients. They are not created equal in terms of energy yield:</p>
            <ul>
              <li><strong>Protein:</strong> Yields exactly <strong>4 calories</strong> per gram.</li>
              <li><strong>Carbohydrates:</strong> Yield exactly <strong>4 calories</strong> per gram.</li>
              <li><strong>Dietary Fat:</strong> Is heavily energy-dense, yielding <strong>9 calories</strong> per gram.</li>
            </ul>
            <p>If you consume a meal containing 30g of protein, 20g of fat, and 50g of carbohydrates, the caloric math looks like this: (30 × 4) + (20 × 9) + (50 × 4) = 120 + 180 + 200 = 500 total calories.</p>

            <h2>Why Calculate Carbs Last?</h2>
            <p>A properly structured nutrition plan is built in a specific hierarchical order. First, you determine your Total Daily Energy Expenditure (TDEE) based on whether you want to lose weight (caloric deficit), maintain, or gain muscle (caloric surplus). This creates your absolute caloric ceiling.</p>
            <p>Second, you set your Protein target. Protein is the most critical macronutrient for preserving lean body mass during a diet, and it is highly satiating. Most active individuals aim for roughly 0.8 to 1.0 grams of protein per pound of body weight.</p>
            <p>Third, you set your Fat target. Dietary fat is crucial for testosterone production, brain health, and cell membrane integrity. A safe baseline is allocating 20% to 30% of your total daily calories to healthy fats.</p>
            <p>Finally, once the essential building blocks (protein and fat) are accounted for, every single remaining calorie is poured into your body's preferred energy system: Carbohydrates. This ensures your body is protected hormonally and structurally, while giving you the maximum possible fuel for your workouts.</p>

            <h2>The Biological Role of Carbohydrates</h2>
            <p>Despite heavy demonization in modern diet culture, carbohydrates are not inherently "bad" or "fattening." In fact, they are the primary and most efficient energy source for the human brain and central nervous system. When you consume carbohydrates—whether from a bowl of oatmeal or a piece of fruit—your digestive system breaks them down into glucose.</p>
            <p>This glucose enters your bloodstream and is immediately utilized for energy. Any excess glucose is converted into <strong>glycogen</strong> and stored in two primary locations: your liver (to maintain baseline blood sugar levels between meals) and your skeletal muscles (to fuel high-intensity physical activity). If, and only if, your glycogen stores are entirely full, and you remain in a massive caloric surplus, will your body convert excess carbohydrates into adipose tissue (body fat) through a highly inefficient process called <em>de novo lipogenesis</em>.</p>

            <h2>How Many Carbohydrates Do You Actually Need?</h2>
            <p>Your ideal carbohydrate intake is entirely dependent on your lifestyle, training intensity, and metabolic health:</p>
            <ul>
              <li><strong>The Sedentary Office Worker:</strong> An individual who sits at a desk all day and does not exercise has very low glycogen turnover. They may thrive on a lower carbohydrate approach (20% to 30% of total calories) because their body simply does not require high-octane fuel.</li>
              <li><strong>The Weightlifter:</strong> Resistance training heavily relies on the glycolytic energy system. A bodybuilder or powerlifter will typically consume 40% to 50% of their calories from carbohydrates to ensure their muscles are fully loaded with glycogen, allowing for maximum strength output and rapid recovery.</li>
              <li><strong>The Endurance Athlete:</strong> Marathon runners, triathletes, and competitive cyclists require massive amounts of energy to sustain hours of continuous output. They frequently push their carbohydrate intake to 55%, 60%, or even 70% of their total daily calories to delay the dreaded "bonk" (complete glycogen depletion).</li>
            </ul>

            <h2>The Difference Between Simple and Complex Carbohydrates</h2>
            <p>While the calculator provides you with a total daily gram target, the <em>quality</em> of those carbohydrates dictates your health, energy stability, and digestion. Carbohydrates exist on a spectrum based on their chemical structure and how rapidly they are absorbed into your bloodstream (measured by the Glycemic Index).</p>
            <p><strong>Complex Carbohydrates</strong> (oats, brown rice, sweet potatoes, quinoa, and vegetables) contain long chains of sugar molecules intertwined with dietary fiber. The fiber drastically slows down the digestive process, resulting in a slow, steady trickle of glucose into your bloodstream. This provides sustained energy for hours and prevents massive spikes in insulin.</p>
            <p><strong>Simple Carbohydrates</strong> (table sugar, soda, candy, and white flour) have had their fiber entirely stripped away. They are absorbed into the bloodstream almost instantly. While this rapid absorption is highly beneficial for an athlete in the middle of a grueling race who needs immediate energy, it is detrimental for a sedentary individual sitting on a couch, as it leads to a massive insulin spike followed by a lethargic "crash."</p>

            <h2>Conclusion: Fueling for Performance</h2>
            <p>Calculating your specific carbohydrate grams is the final step in designing a hyper-optimized nutrition protocol. By using this calculator to precisely balance your macronutrients, you ensure that your body has the exact structural materials it needs to recover (protein and fat), coupled with the exact amount of premium fuel required to perform (carbohydrates). Stick to your caloric ceiling, prioritize complex, nutrient-dense carbohydrate sources, and watch your gym performance, energy levels, and physique transform.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbohydrate-grams-calculator" />
          <PopularCalculators exclude="/calculator/carbohydrate-grams-calculator" />
        </div>
      </div>
    </>
  );
}
