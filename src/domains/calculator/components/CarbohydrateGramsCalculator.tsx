"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { Printer, RotateCcw, AlertTriangle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

// 1. TypeScript Interfaces
interface CarbInputs {
  calories: number;
  proteinPercent: number;
  fatPercent: number;
}

interface ChartSlice {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface TableRow {
  rowId: string;
  label: string;
  value: string;
  key?: boolean;
  total?: boolean;
}

interface CarbResults {
  carbPercent: number;
  carbCalories: number;
  carbGrams: number;

  proteinCalories: number;
  proteinGrams: number;

  fatCalories: number;
  fatGrams: number;

  carbsPerMeal: number;
  fiberTarget: number;
  addedSugarLimit: number;
  netStarchGrams: number;
  meetsBrainMinimum: boolean;
  band: "Low-carb" | "Moderate" | "High-carb";

  chartData: ChartSlice[];
  error?: string;
}

// Institute of Medicine RDA: 130 g/day of carbohydrate covers the brain's glucose demand
const BRAIN_GLUCOSE_RDA = 130;
// Dietary Guidelines for Americans: 14 g fibre per 1,000 kcal
const FIBRE_PER_1000_KCAL = 14;
// WHO / DGA ceiling on added sugar: 10% of total energy
const ADDED_SUGAR_CEILING_PCT = 10;

// 2. Pure Calculation Function
const calculateCarbGrams = (inputs: CarbInputs): CarbResults => {
  const { calories, proteinPercent, fatPercent } = inputs;

  const carbPercent = 100 - proteinPercent - fatPercent;

  if (carbPercent < 0) {
    return {
      carbPercent: 0, carbCalories: 0, carbGrams: 0,
      proteinCalories: 0, proteinGrams: 0, fatCalories: 0, fatGrams: 0,
      carbsPerMeal: 0, fiberTarget: 0, addedSugarLimit: 0, netStarchGrams: 0,
      meetsBrainMinimum: false, band: "Low-carb",
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

  const fiberTarget = (calories / 1000) * FIBRE_PER_1000_KCAL;
  const addedSugarLimit = (calories * (ADDED_SUGAR_CEILING_PCT / 100)) / 4;
  const netStarchGrams = Math.max(0, carbGrams - fiberTarget);

  const band: CarbResults["band"] =
    carbPercent < 30 ? "Low-carb" : carbPercent > 55 ? "High-carb" : "Moderate";

  const chartData: ChartSlice[] = [
    { id: "carb", name: "Carbohydrates", value: Math.round(carbCalories), color: "hsl(217 91% 60%)" },
    { id: "protein", name: "Protein", value: Math.round(proteinCalories), color: "hsl(0 84% 60%)" },
    { id: "fat", name: "Fat", value: Math.round(fatCalories), color: "hsl(25 95% 53%)" }
  ];

  return {
    carbPercent: Math.round(carbPercent * 10) / 10,
    carbCalories: Math.round(carbCalories),
    carbGrams: Math.round(carbGrams),
    proteinCalories: Math.round(proteinCalories),
    proteinGrams: Math.round(proteinGrams),
    fatCalories: Math.round(fatCalories),
    fatGrams: Math.round(fatGrams),
    carbsPerMeal: Math.round(carbGrams / 3),
    fiberTarget: Math.round(fiberTarget),
    addedSugarLimit: Math.round(addedSugarLimit),
    netStarchGrams: Math.round(netStarchGrams),
    meetsBrainMinimum: carbGrams >= BRAIN_GLUCOSE_RDA,
    band,
    chartData
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  calories: "2000",
  proteinPercent: "30",
  fatPercent: "25"
};

const DEFAULT_RESULTS = calculateCarbGrams({
  calories: parseFloat(DEFAULTS.calories),
  proteinPercent: parseFloat(DEFAULTS.proteinPercent),
  fatPercent: parseFloat(DEFAULTS.fatPercent)
});

interface TooltipEntry {
  value: number;
  payload: ChartSlice;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
}

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
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

interface CompactInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
}

// Input Component
const CompactInput = ({ id, label, value, onChange, prefix, suffix, type = "number", ...props }: CompactInputProps) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="flex items-center text-sm font-medium text-foreground mb-1">
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
  
  const [results, setResults] = useState<CarbResults | null>(DEFAULT_RESULTS);
  const [mounted, setMounted] = useState(false);
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
    setMounted(true);
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const tableRows: TableRow[] = results && !results.error
    ? [
        { rowId: "calories", label: "Total daily calories", value: `${parseFloat(calories || "0").toLocaleString()} kcal` },
        { rowId: "protein-pct", label: `Protein allocation (${proteinPercent}%)`, value: `${results.proteinCalories.toLocaleString()} kcal` },
        { rowId: "protein-g", label: "Protein grams (÷ 4 kcal/g)", value: `${results.proteinGrams} g` },
        { rowId: "fat-pct", label: `Fat allocation (${fatPercent}%)`, value: `${results.fatCalories.toLocaleString()} kcal` },
        { rowId: "fat-g", label: "Fat grams (÷ 9 kcal/g)", value: `${results.fatGrams} g` },
        { rowId: "carb-pct", label: `Carbohydrate remainder (${results.carbPercent}%)`, value: `${results.carbCalories.toLocaleString()} kcal` },
        { rowId: "carb-g", label: "Carbohydrate grams (÷ 4 kcal/g)", value: `${results.carbGrams} g`, key: true },
        { rowId: "per-meal", label: "Carbs per meal (3 meals)", value: `${results.carbsPerMeal} g` },
        { rowId: "fiber", label: "Fibre target (14 g / 1,000 kcal)", value: `${results.fiberTarget} g` },
        { rowId: "starch", label: "Non-fibre carbohydrate", value: `${results.netStarchGrams} g` },
        { rowId: "sugar", label: "Added-sugar ceiling (10% of kcal)", value: `${results.addedSugarLimit} g` },
        { rowId: "total", label: "Macros check (P + F + C calories)", value: `${(results.proteinCalories + results.fatCalories + results.carbCalories).toLocaleString()} kcal`, total: true },
      ]
    : [];

  const faqs = [
    { question: "How are carbohydrates calculated from remaining calories?", answer: "Carbohydrates are considered the 'flexible macro.' Once you establish your Daily Calorie Target, and subtract your fixed goals for Protein and Fat, the remaining calories are entirely allocated to carbohydrates. Since every 1 gram of carbohydrate yields 4 calories, you simply divide the remaining calories by 4 to get your exact gram target." },
    { question: "How many calories are in each macronutrient?", answer: "Protein yields 4 calories per gram. Carbohydrates also yield 4 calories per gram. Dietary fats are far more energy-dense, yielding 9 calories per gram." },
    { question: "Why do athletes need so many carbohydrates?", answer: "Carbohydrates are the body's preferred and most efficient source of high-intensity energy. When you eat carbohydrates, they are converted into glycogen and stored in your muscles and liver. During intense exercise (like heavy weightlifting or sprinting), your body rapidly depletes these glycogen stores. Eating adequate carbs ensures those stores are replenished so you can perform optimally the next day." },
    { question: "Will eating carbohydrates make me gain fat?", answer: "No. Carbohydrates themselves do not cause fat gain. Fat gain is driven exclusively by a sustained caloric surplus (eating more total calories—from any macronutrient—than your body burns in a day). As long as you remain in a caloric deficit or maintenance, you will not gain body fat, regardless of your carbohydrate intake." },
    { question: "What is a normal carbohydrate percentage?", answer: "For the average active adult, a balanced diet consists of 40% to 50% carbohydrates. Endurance athletes (runners, cyclists) often push this to 55% or 60% to maximize glycogen availability. Conversely, those following a ketogenic diet heavily restrict carbohydrates to roughly 5% of their total daily intake." },
    { question: "Is there a minimum carbohydrate intake I should not go below?", answer: "The Institute of Medicine sets the RDA for carbohydrate at 130 grams per day, which is the amount needed to supply the brain and central nervous system with glucose without relying on ketones or on protein being converted to glucose. This calculator flags your target when it falls below 130 grams. Very-low-carbohydrate and ketogenic diets deliberately go below that figure and can be done safely, but they are a specific therapeutic choice rather than a general recommendation." },
    { question: "How much of my carbohydrate target should come from fibre?", answer: "The Dietary Guidelines for Americans recommend roughly 14 grams of fibre per 1,000 calories consumed, so a 2,000-calorie diet works out to about 28 grams. This calculator subtracts your fibre target from your total carbohydrate grams to show how much is left for starches and sugars. Fibre counts toward the carbohydrate total on a nutrition label but is largely not absorbed as energy, which is why some people track net carbohydrate instead." },
    { question: "Should I spread my carbohydrates evenly across the day?", answer: "Total daily intake matters far more than timing for body composition, so an even split across three meals is a reasonable default and is what the per-meal figure here assumes. Timing does matter for performance: eating a larger share of your carbohydrates in the one to three hours before hard training and in the window shortly after tops up muscle glycogen when it is most useful. If you train fasted in the morning, shift those grams to later in the day instead." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carbohydrate Grams Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carbohydrate Grams Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          
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
            {results && !errorMsg ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">

                {/* 1. Primary Result Card */}
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative">
                  <button onClick={handlePrint} className="absolute top-4 right-4 print:hidden" aria-label="Print Results">
                    <Printer className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                  <div className="text-sm font-bold uppercase tracking-wider text-primary mb-1">
                    Daily Carbohydrate Target
                  </div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-primary tracking-tight">{results.carbGrams}</div>
                    <div className="text-lg font-semibold text-muted-foreground">grams / day</div>
                  </div>
                  <div className="text-sm font-medium text-muted-foreground mt-2">
                    {results.carbPercent}% of total diet &middot; {results.carbCalories.toLocaleString()} kcal &middot;{" "}
                    <span className={results.meetsBrainMinimum ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-orange-500 font-semibold"}>
                      {results.meetsBrainMinimum ? "meets" : "below"} the 130 g RDA
                    </span>
                  </div>
                </div>

                {/* 2. Three-stat bar */}
                <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                  <div className="p-4 text-center">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Protein</div>
                    <div className="text-2xl font-bold" style={{ color: "hsl(0 84% 60%)" }}>{results.proteinGrams} g</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{results.proteinCalories.toLocaleString()} kcal</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Fat</div>
                    <div className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{results.fatGrams} g</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{results.fatCalories.toLocaleString()} kcal</div>
                  </div>
                  <div className="p-4 text-center border-l border-border">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Carbs</div>
                    <div className="text-2xl font-bold" style={{ color: "hsl(142 71% 45%)" }}>{results.carbGrams} g</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{results.carbCalories.toLocaleString()} kcal</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="card-calculator !p-5 border border-border bg-card h-full">
                    <h3 className="text-base font-bold text-foreground mb-3">Macronutrient Breakdown</h3>
                    <table className="w-full text-base border-collapse">
                      <tbody>
                        {tableRows.map((r) => (
                          <tr
                            key={r.rowId}
                            className={`border-b border-border/60 last:border-0 ${r.key ? "bg-primary/10" : ""} ${r.total ? "border-t-2 border-t-border font-bold" : ""}`}
                          >
                            <td className={`py-2.5 px-3 ${r.key ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{r.label}</td>
                            <td className={`py-2.5 px-3 text-right tabular-nums ${r.key ? "font-bold text-primary" : "text-foreground"}`}>{r.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 4. Donut Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Caloric Distribution</h3>
                    <div className="w-full" style={{ height: 200 }}>
                      {mounted ? (
                        <ResponsiveContainer width="100%" height="100%">
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
                              {results.chartData.map((entry) => (
                                <Cell key={entry.id} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12, fontWeight: "bold" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* 5. Summary Statistics */}
                <div className="bg-muted/30 rounded-lg p-5">
                  <h3 className="text-base font-bold text-foreground mb-3">Summary Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {tableRows.map((r) => (
                      <div key={r.rowId} className="flex justify-between gap-3 text-sm border-b border-border/40 py-1.5 last:border-0">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className={`tabular-nums ${r.key ? "font-bold text-primary" : "font-medium text-foreground"}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    This plan sits in the <strong>{results.band}</strong> range ({results.carbPercent}% of calories from carbohydrate).{" "}
                    {results.meetsBrainMinimum
                      ? `Your ${results.carbGrams} g target clears the 130 g Institute of Medicine RDA, so the brain's glucose supply is covered without needing to make glucose from protein.`
                      : `At ${results.carbGrams} g you are below the 130 g Institute of Medicine RDA. That is fine on a deliberate low-carbohydrate diet, but most active people perform better at or above the RDA.`}{" "}
                    Aim for at least {results.fiberTarget} g of fibre and keep added sugar under {results.addedSugarLimit} g.
                  </p>
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
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Your Carbohydrate Grams Target</h2>
            <p>In the world of sports nutrition and dietetics, carbohydrates are often referred to as the "flexible macro." While your body absolutely requires specific minimums of dietary protein (to repair muscle tissue and synthesize enzymes) and dietary fat (to regulate hormones and absorb fat-soluble vitamins), your carbohydrate intake is entirely dictated by your energy output and performance goals. The <strong>Carbohydrate Grams Calculator</strong> removes the guesswork from meal planning by utilizing reverse-subtraction math. By establishing your total caloric ceiling and securing your essential protein and fat targets first, the calculator allocates every remaining calorie exclusively to carbohydrates, giving you an exact daily gram target to fuel your lifestyle.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of Macronutrients</h2>
            <p>To accurately calculate carbohydrate grams, you must first understand the caloric density of the three primary macronutrients. They are not created equal in terms of energy yield:</p>
            <ul>
              <li><strong>Protein:</strong> Yields exactly <strong>4 calories</strong> per gram.</li>
              <li><strong>Carbohydrates:</strong> Yield exactly <strong>4 calories</strong> per gram.</li>
              <li><strong>Dietary Fat:</strong> Is heavily energy-dense, yielding <strong>9 calories</strong> per gram.</li>
            </ul>
            <p>If you consume a meal containing 30g of protein, 20g of fat, and 50g of carbohydrates, the caloric math looks like this: (30 × 4) + (20 × 9) + (50 × 4) = 120 + 180 + 200 = 500 total calories.</p>

            <h2 className="text-2xl font-bold mb-3">Why Calculate Carbs Last?</h2>
            <p>A properly structured nutrition plan is built in a specific hierarchical order. First, you determine your Total Daily Energy Expenditure (TDEE) based on whether you want to lose weight (caloric deficit), maintain, or gain muscle (caloric surplus). This creates your absolute caloric ceiling.</p>
            <p>Second, you set your Protein target. Protein is the most critical macronutrient for preserving lean body mass during a diet, and it is highly satiating. Most active individuals aim for roughly 0.8 to 1.0 grams of protein per pound of body weight.</p>
            <p>Third, you set your Fat target. Dietary fat is crucial for testosterone production, brain health, and cell membrane integrity. A safe baseline is allocating 20% to 30% of your total daily calories to healthy fats.</p>
            <p>Finally, once the essential building blocks (protein and fat) are accounted for, every single remaining calorie is poured into your body's preferred energy system: Carbohydrates. This ensures your body is protected hormonally and structurally, while giving you the maximum possible fuel for your workouts.</p>

            <h2 className="text-2xl font-bold mb-3">The Biological Role of Carbohydrates</h2>
            <p>Despite heavy demonization in modern diet culture, carbohydrates are not inherently "bad" or "fattening." In fact, they are the primary and most efficient energy source for the human brain and central nervous system. When you consume carbohydrates—whether from a bowl of oatmeal or a piece of fruit—your digestive system breaks them down into glucose.</p>
            <p>This glucose enters your bloodstream and is immediately utilized for energy. Any excess glucose is converted into <strong>glycogen</strong> and stored in two primary locations: your liver (to maintain baseline blood sugar levels between meals) and your skeletal muscles (to fuel high-intensity physical activity). If, and only if, your glycogen stores are entirely full, and you remain in a massive caloric surplus, will your body convert excess carbohydrates into adipose tissue (body fat) through a highly inefficient process called <em>de novo lipogenesis</em>.</p>

            <h2 className="text-2xl font-bold mb-3">How Many Carbohydrates Do You Actually Need?</h2>
            <p>Your ideal carbohydrate intake is entirely dependent on your lifestyle, training intensity, and metabolic health:</p>
            <ul>
              <li><strong>The Sedentary Office Worker:</strong> An individual who sits at a desk all day and does not exercise has very low glycogen turnover. They may thrive on a lower carbohydrate approach (20% to 30% of total calories) because their body simply does not require high-octane fuel.</li>
              <li><strong>The Weightlifter:</strong> Resistance training heavily relies on the glycolytic energy system. A bodybuilder or powerlifter will typically consume 40% to 50% of their calories from carbohydrates to ensure their muscles are fully loaded with glycogen, allowing for maximum strength output and rapid recovery.</li>
              <li><strong>The Endurance Athlete:</strong> Marathon runners, triathletes, and competitive cyclists require massive amounts of energy to sustain hours of continuous output. They frequently push their carbohydrate intake to 55%, 60%, or even 70% of their total daily calories to delay the dreaded "bonk" (complete glycogen depletion).</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">The Difference Between Simple and Complex Carbohydrates</h2>
            <p>While the calculator provides you with a total daily gram target, the <em>quality</em> of those carbohydrates dictates your health, energy stability, and digestion. Carbohydrates exist on a spectrum based on their chemical structure and how rapidly they are absorbed into your bloodstream (measured by the Glycemic Index).</p>
            <p><strong>Complex Carbohydrates</strong> (oats, brown rice, sweet potatoes, quinoa, and vegetables) contain long chains of sugar molecules intertwined with dietary fiber. The fiber drastically slows down the digestive process, resulting in a slow, steady trickle of glucose into your bloodstream. This provides sustained energy for hours and prevents massive spikes in insulin.</p>
            <p><strong>Simple Carbohydrates</strong> (table sugar, soda, candy, and white flour) have had their fiber entirely stripped away. They are absorbed into the bloodstream almost instantly. While this rapid absorption is highly beneficial for an athlete in the middle of a grueling race who needs immediate energy, it is detrimental for a sedentary individual sitting on a couch, as it leads to a massive insulin spike followed by a lethargic "crash."</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Fueling for Performance</h2>
            <p>Calculating your specific carbohydrate grams is the final step in designing a hyper-optimized nutrition protocol. By using this calculator to precisely balance your macronutrients, you ensure that your body has the exact structural materials it needs to recover (protein and fat), coupled with the exact amount of premium fuel required to perform (carbohydrates). Stick to your caloric ceiling, prioritize complex, nutrient-dense carbohydrate sources, and watch your gym performance, energy levels, and physique transform.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carbohydrate-grams-calculator" />
          <PopularCalculators exclude="/calculator/carbohydrate-grams-calculator" />
        </div>
      </div>
    </>
  );
}
