"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface MacroInputs {
  totalCalories: number;
  preset: "bodybuilding" | "keto" | "endurance" | "balanced" | "custom";
  customProteinPct: number;
  customCarbPct: number;
  customFatPct: number;
}

interface MacroResults {
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  
  proteinCals: number;
  carbCals: number;
  fatCals: number;

  proteinPct: number;
  carbPct: number;
  fatPct: number;
  
  grade: string;
  recommendation: string;
  warningMsg: string | null;

  chartData: { name: string; value: number; color: string; percentage: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateMacros = (inputs: MacroInputs): MacroResults | null => {
  const { totalCalories, preset, customProteinPct, customCarbPct, customFatPct } = inputs;
  
  if (totalCalories < 1000) return null;

  let proteinPct = 0;
  let carbPct = 0;
  let fatPct = 0;
  let grade = "";
  let recommendation = "";

  switch (preset) {
    case "bodybuilding":
      proteinPct = 40; carbPct = 40; fatPct = 20;
      grade = "Bodybuilding / Aesthetics Split";
      recommendation = "This is the classic 40/40/20 split used by physique athletes. High protein maximizes muscle protein synthesis, moderate carbs fuel intense resistance training, and low fat keeps total calories manageable while preserving hormone production.";
      break;
    case "keto":
      proteinPct = 20; carbPct = 5; fatPct = 75;
      grade = "Ketogenic Diet Split";
      recommendation = "This extreme low-carb approach forces the body to shift from burning glucose to burning ketones derived from dietary and body fat. This protocol requires strict adherence to remain in a state of ketosis.";
      break;
    case "endurance":
      proteinPct = 15; carbPct = 65; fatPct = 20;
      grade = "Endurance / Marathon Split";
      recommendation = "Designed for marathon runners and triathletes. The massive influx of carbohydrates ensures intramuscular glycogen stores are constantly fully saturated, preventing the athlete from 'bonking' during prolonged cardiovascular exertion.";
      break;
    case "balanced":
      proteinPct = 30; carbPct = 40; fatPct = 30;
      grade = "Balanced / Maintenance Split";
      recommendation = "A highly sustainable, 'Zone Diet' style split. It provides enough protein for recovery, enough fat for hormonal health and satiety, and enough carbohydrates to fuel an active lifestyle without feeling restricted.";
      break;
    case "custom":
      proteinPct = customProteinPct;
      carbPct = customCarbPct;
      fatPct = customFatPct;
      grade = "Custom Distribution";
      recommendation = "You have selected a custom macronutrient distribution. Ensure your protein intake is sufficient to preserve lean mass, and your fat intake does not drop below essential levels for hormone production.";
      break;
  }

  const isInvalidCustom = preset === "custom" && (proteinPct + carbPct + fatPct !== 100);
  if (isInvalidCustom) return null;

  // The Math: Protein = 4 kcal/g, Carbs = 4 kcal/g, Fats = 9 kcal/g
  const proteinCals = totalCalories * (proteinPct / 100);
  const carbCals = totalCalories * (carbPct / 100);
  const fatCals = totalCalories * (fatPct / 100);

  const proteinGrams = proteinCals / 4;
  const carbGrams = carbCals / 4;
  const fatGrams = fatCals / 9;

  let warningMsg = null;
  if (fatGrams < 30) {
    warningMsg = "WARNING: Your fat intake is critically low. Medical guidelines recommend consuming at least 0.3g of dietary fat per pound of body weight to maintain testosterone production, absorb fat-soluble vitamins, and prevent gallstones.";
  } else if (proteinGrams < 50) {
    warningMsg = "WARNING: Your protein intake is exceedingly low. Consuming less than 50g of protein daily dramatically increases the risk of severe muscle catabolism and suppressed immune function.";
  }

  const chartData = [
    { name: "Protein", value: proteinCals, percentage: proteinPct, color: "#3b82f6" },
    { name: "Carbohydrates", value: carbCals, percentage: carbPct, color: "#10b981" },
    { name: "Fats", value: fatCals, percentage: fatPct, color: "#f59e0b" }
  ];

  const summaryStats = [
    { label: "Target Protein", value: `${Math.round(proteinGrams)}g`, colorClass: "text-blue-500 font-bold" },
    { label: "Target Carbohydrates", value: `${Math.round(carbGrams)}g`, colorClass: "text-green-500 font-bold" },
    { label: "Target Fats", value: `${Math.round(fatGrams)}g`, colorClass: "text-amber-500 font-bold" },
    { label: "Total Target", value: `${totalCalories} kcal`, colorClass: "text-foreground font-medium" },
    { label: "Distribution Style", value: grade }
  ];

  return {
    proteinGrams: Math.round(proteinGrams),
    carbGrams: Math.round(carbGrams),
    fatGrams: Math.round(fatGrams),
    proteinCals: Math.round(proteinCals),
    carbCals: Math.round(carbCals),
    fatCals: Math.round(fatCals),
    proteinPct,
    carbPct,
    fatPct,
    grade,
    recommendation,
    warningMsg,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  totalCalories: "2500",
  preset: "bodybuilding" as const,
  customProteinPct: 30,
  customCarbPct: 50,
  customFatPct: 20
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name} ({payload[0].payload.percentage}%)</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{Math.round(payload[0].value / (payload[0].payload.name === 'Fats' ? 9 : 4))}</span> grams</p>
        <p className="text-muted-foreground"><span className="font-medium">{Math.round(payload[0].value)}</span> kcal</p>
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

export default function MacronutrientCalorieDistributionCalculator() {
  // 4. Component State
  const [totalCalories, setTotalCalories] = useState(DEFAULTS.totalCalories);
  const [preset, setPreset] = useState<MacroInputs["preset"]>(DEFAULTS.preset);
  
  const [customProtein, setCustomProtein] = useState(DEFAULTS.customProteinPct.toString());
  const [customCarb, setCustomCarb] = useState(DEFAULTS.customCarbPct.toString());
  const [customFat, setCustomFat] = useState(DEFAULTS.customFatPct.toString());
  
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState<MacroResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const tc = parseInt(totalCalories);
    if (tc < 1000) {
      setErrorMsg("Error: Minimum 1000 calories required to safely distribute macros.");
      setResults(null);
      return;
    }

    let p = parseInt(customProtein) || 0;
    let c = parseInt(customCarb) || 0;
    let f = parseInt(customFat) || 0;

    if (preset === "custom" && (p + c + f !== 100)) {
      setErrorMsg(`Error: Custom macros must equal exactly 100%. Currently they equal ${p + c + f}%.`);
      setResults(null);
      return;
    }

    const inputs: MacroInputs = {
      totalCalories: tc,
      preset,
      customProteinPct: p,
      customCarbPct: c,
      customFatPct: f
    };
    setResults(calculateMacros(inputs));
  };

  const handleReset = () => {
    setTotalCalories(DEFAULTS.totalCalories);
    setPreset(DEFAULTS.preset);
    setCustomProtein(DEFAULTS.customProteinPct.toString());
    setCustomCarb(DEFAULTS.customCarbPct.toString());
    setCustomFat(DEFAULTS.customFatPct.toString());
    setErrorMsg("");
    
    setResults(calculateMacros({
      totalCalories: parseInt(DEFAULTS.totalCalories),
      preset: DEFAULTS.preset,
      customProteinPct: DEFAULTS.customProteinPct,
      customCarbPct: DEFAULTS.customCarbPct,
      customFatPct: DEFAULTS.customFatPct
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCalories, preset, customProtein, customCarb, customFat]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Macronutrient Distribution</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What are Macronutrients?", answer: "Macronutrients (macros) are the three major chemical compounds humans consume in large quantities to provide energy and structural material for the body. They are Protein (used for building and repairing tissue), Carbohydrates (the body's preferred fast-acting energy source), and Fats (used for hormone production and slow-burning energy)." },
    { question: "How many calories are in a gram of each macro?", answer: "This is the mathematical foundation of all dieting: Protein contains 4 kilocalories per gram. Carbohydrates contain 4 kilocalories per gram. Dietary Fats contain 9 kilocalories per gram. (Alcohol, a pseudo-macro, contains 7 kilocalories per gram)." },
    { question: "Why is fat so much higher in calories?", answer: "Fat is a highly dense energy storage molecule. Because it yields 9 calories per gram, compared to 4 calories per gram for carbs and protein, fatty foods (like peanut butter, oil, and cheese) contain massively more energy per physical bite than lean foods (like chicken breast or rice)." },
    { question: "Does my macro split dictate weight loss?", answer: "No. The First Law of Thermodynamics dictates that your Total Daily Calories determine weight loss or weight gain. You could eat a diet of 100% pure sugar (all carbs) and still lose weight if you are in a caloric deficit. However, your macro split dictates body composition (how much of that weight lost is fat vs. muscle)." },
    { question: "Can I build muscle on the Keto diet?", answer: "Yes, but it is sub-optimal compared to a diet containing carbohydrates. Carbohydrates trigger the release of insulin, which is a highly anabolic (muscle-building) hormone. Carbs also fill your muscles with glycogen, allowing you to lift heavier weights for more repetitions." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Macronutrient Calorie Distribution Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Macronutrient Distribution Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <PieChartIcon className="h-4 w-4" /> Dietary Blueprint
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Break down your total daily calories into precise physical grams of Protein, Carbohydrates, and Fats based on your athletic goals.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tcals" label="Total Daily Calorie Target" value={totalCalories} onChange={setTotalCalories} suffix="kcal / day" />
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Distribution Goal</label>
              <select 
                value={preset} 
                onChange={(e) => setPreset(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="bodybuilding">Bodybuilding / Aesthetic (40p / 40c / 20f)</option>
                <option value="balanced">Balanced / Zone Diet (30p / 40c / 30f)</option>
                <option value="endurance">Endurance / Athlete (15p / 65c / 20f)</option>
                <option value="keto">Ketogenic / Low-Carb (20p / 5c / 75f)</option>
                <option value="custom">Custom Distribution</option>
              </select>
            </div>

            {preset === "custom" && (
              <div className="grid grid-cols-3 gap-3 mt-1 bg-secondary/50 p-3 rounded-lg border border-border">
                <CompactInput id="cp" label="Protein %" value={customProtein} onChange={setCustomProtein} />
                <CompactInput id="cc" label="Carbs %" value={customCarb} onChange={setCustomCarb} />
                <CompactInput id="cf" label="Fats %" value={customFat} onChange={setCustomFat} />
                <div className="col-span-3 text-xs text-right font-medium text-muted-foreground">
                  Total: <span className={(parseInt(customProtein)||0) + (parseInt(customCarb)||0) + (parseInt(customFat)||0) === 100 ? "text-green-500" : "text-red-500 font-bold"}>
                    {(parseInt(customProtein)||0) + (parseInt(customCarb)||0) + (parseInt(customFat)||0)}%
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset Macros
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                {/* Warning if any */}
                {results.warningMsg && (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 p-4 rounded-lg flex gap-3 items-start shadow-sm">
                    <p className="text-sm font-semibold leading-relaxed">{results.warningMsg}</p>
                  </div>
                )}

                {/* 1. Primary Result Cards */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex flex-col justify-center text-center shadow-sm relative">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 mb-1">Target Protein</div>
                    <div className="text-3xl font-black text-foreground">{results.proteinGrams}</div>
                    <div className="text-xs font-medium text-blue-500/80">grams ({results.proteinPct}%)</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex flex-col justify-center text-center shadow-sm relative">
                    <button onClick={handlePrint} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-1">Target Carbs</div>
                    <div className="text-3xl font-black text-foreground">{results.carbGrams}</div>
                    <div className="text-xs font-medium text-green-500/80">grams ({results.carbPct}%)</div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex flex-col justify-center text-center shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">Target Fats</div>
                    <div className="text-3xl font-black text-foreground">{results.fatGrams}</div>
                    <div className="text-xs font-medium text-amber-500/80">grams ({results.fatPct}%)</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Protocol Statistics</h3>
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
                    <h3 className="text-base font-bold mb-2 w-full text-left">Energy Source Ratio</h3>
                    <div className="text-center w-full relative mt-2">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={results.chartData}
                            cx="50%" cy="50%"
                            innerRadius={50} outerRadius={75}
                            paddingAngle={3} dataKey="value"
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
                        <span className="text-xl font-black text-foreground leading-none">{totalCalories}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Kcal</span>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center mt-3 text-xs font-bold w-full">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Prot</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>Carb</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>Fat</div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <PieChartIcon className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your total daily calories and select a distribution model to calculate your physical macronutrient targets in grams.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Macronutrient Calorie Distribution Calculator</h2>
            <p>In the hierarchy of nutritional importance, Total Calories dictate whether you will gain or lose weight. However, your <strong>Macronutrients (Macros)</strong> dictate your body composition—specifically, whether that weight gained or lost comes from muscle or fat. "If It Fits Your Macros" (IIFYM) is a scientifically validated dieting approach that ignores restrictive food rules (like "no eating after 8 PM" or "no white bread") and focuses entirely on hitting specific daily targets of Protein, Carbohydrates, and Fats. The <strong>Macronutrient Calorie Distribution Calculator</strong> acts as the architectural blueprint for your diet, taking your raw calorie target and converting it into physical, trackable grams.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Macros (4-4-9 Rule)</h2>
            <p>To use this calculator effectively, you must understand the immutable mathematical laws of human digestion. All food and drink containing energy is composed of one or more of the three macronutrients. Each macronutrient yields a specific amount of energy (measured in kilocalories) per gram:</p>
            <ul>
              <li><strong>Protein:</strong> Yields exactly <strong>4 kilocalories</strong> per gram.</li>
              <li><strong>Carbohydrates:</strong> Yields exactly <strong>4 kilocalories</strong> per gram.</li>
              <li><strong>Fats:</strong> Yields exactly <strong>9 kilocalories</strong> per gram.</li>
            </ul>
            <p>(Note: Alcohol is a pseudo-macronutrient that yields 7 kilocalories per gram, but it offers zero nutritional value and is treated as a toxin by the liver, thus it is excluded from macro planning).</p>
            <p>This "4-4-9" reality is why fatty foods are so much more calorically dense than lean foods. A 100-gram piece of chicken breast (mostly protein) might contain 160 calories. A 100-gram scoop of peanut butter (mostly fat) contains over 600 calories. Because fat contains more than double the energy density of carbs and protein, your fat macro percentage in the calculator translates to a much smaller physical gram allowance.</p>

            <h2 className="text-2xl font-bold mb-3">The Big Three: Roles and Requirements</h2>
            <p>Each macronutrient performs a drastically different biological function in the human body. An optimized diet ensures all three are present in specific ratios.</p>

            <h3>1. Protein (The Builder)</h3>
            <p>Protein is the structural foundation of the human body. It is broken down into amino acids, which are used to construct and repair muscle tissue, skin, hair, and enzymes. Unlike fat, the body has no mechanism for storing excess protein for later use; you must supply it daily. A high-protein diet is the absolute most critical component of both a cut (to preserve muscle while starving) and a bulk (to build new muscle in a surplus). Furthermore, protein is highly satiating—meaning it makes you feel full, making diets much easier to adhere to.</p>

            <h3>2. Carbohydrates (The Fuel)</h3>
            <p>Carbohydrates are the body’s preferred, fastest-acting energy source. When consumed, they are broken down into glucose and stored in your muscle tissue and liver as glycogen. During intense physical exertion (like sprinting or lifting heavy weights), your body rapidly burns this glycogen. If you do not consume enough carbohydrates, your athletic performance will plummet, you will feel lethargic, and your muscles will look "flat" because glycogen pulls water into the muscle cells.</p>

            <h3>3. Dietary Fats (The Regulator)</h3>
            <p>During the fat-phobia craze of the 1990s, the fitness industry believed that eating dietary fat caused you to gain body fat. This is entirely false. Dietary fat is a critical macronutrient required to absorb fat-soluble vitamins (A, D, E, and K) and, most importantly, to synthesize hormones like testosterone and estrogen. If your fat intake drops below roughly 0.3 grams per pound of body weight, your hormonal profile will crash, leading to zero libido, depression, and severe fatigue.</p>

            <h2 className="text-2xl font-bold mb-3">Decoding the Distribution Strategies</h2>
            <p>The calculator provides several scientifically validated distribution presets designed for different physiological goals.</p>

            <h3>The Bodybuilding Split (40p / 40c / 20f)</h3>
            <p>This is the gold standard for aesthetic physique development. It allocates a massive 40% of calories to protein to ensure Muscle Protein Synthesis is maximized. Another 40% is allocated to carbohydrates to ensure glycogen stores are full enough to endure brutal, high-volume resistance training sessions. Finally, it allocates just 20% to fats—just enough to keep testosterone production healthy without wasting excessive calories that could be better spent on muscle-building carbs.</p>

            <h3>The Ketogenic Diet (20p / 5c / 75f)</h3>
            <p>The Keto diet fundamentally rewires human metabolism. By slashing carbohydrate intake to a mere 5% (usually under 30 grams a day), the body exhausts its glycogen stores. In a state of panic, the liver begins converting dietary fat and stored body fat into "ketones" to fuel the brain and body. This requires massive fat intake (75%) to sustain energy. While highly effective for weight loss via appetite suppression, it is sub-optimal for building muscle due to the lack of insulin spikes (which are anabolic) normally provided by carbohydrates.</p>

            <h3>The Endurance Athlete (15p / 65c / 20f)</h3>
            <p>If you are running a marathon or cycling 100 miles, you are burning astronomical amounts of glucose. Unlike a bodybuilder who trains for 45 minutes, an endurance athlete will literally run out of fuel mid-race (known as "bonking") if their glycogen is not fully loaded. This split prioritizes a massive 65% carbohydrate intake to ensure the fuel tank is always topped off, while lowering protein to 15% because cardiovascular exercise does not break down muscle tissue to the same degree as heavy weightlifting.</p>

            <h3>The Balanced / Zone Diet (30p / 40c / 30f)</h3>
            <p>This is the most sustainable approach for the average human being who wants to look good, feel energetic, and maintain their sanity. Popularized by the Zone Diet, it avoids extremes. It provides enough protein to maintain a great physique, enough carbs to feel energized in the gym, and enough fat to make meals taste delicious (allowing for items like avocado, olive oil, and cheese).</p>

            <h2 className="text-2xl font-bold mb-3">How to Track Your Macros in the Real World</h2>
            <p>Once the calculator provides your targets (e.g., 180g Protein, 200g Carbs, 60g Fat), the execution phase begins. You must use a digital food scale and a tracking application (like MyFitnessPal or MacroFactor) to log the physical weight of everything you eat. If you eat 100 grams of raw chicken breast, the app will log roughly 23 grams of protein and 1 gram of fat toward your daily targets.</p>
            <p>The beauty of IIFYM is its absolute flexibility. If you have 40 grams of Carbohydrates and 15 grams of Fat left at 9:00 PM, you can technically eat a Snickers bar to hit those targets. Your body will process the macronutrients exactly the same way mathematically. (Though, of course, doing this every day will leave you deficient in micronutrients and vitamins).</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Precision Yields Results</h2>
            <p>The most elite physiques in the world are not built by "eating clean" and guessing portion sizes; they are built through mathematical precision. Use the Macronutrient Calorie Distribution Calculator to generate your personalized blueprint, hit your targets with a +/- 5 gram variance every single day, and watch your body transform predictably and consistently.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/macronutrient-calorie-distribution-calculator" />
          <PopularCalculators exclude="/calculator/macronutrient-calorie-distribution-calculator" />
        </div>
      </div>
    </>
  );
}
