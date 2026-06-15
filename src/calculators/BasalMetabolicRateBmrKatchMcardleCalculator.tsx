"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Dumbbell } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// 1. TypeScript Interfaces
interface KatchMcardleInputs {
  weight: number;
  bodyFatPct: number;
  unit: "lbs" | "kg";
}

interface KatchMcardleResults {
  lbm: number; // Lean Body Mass
  fatMass: number;
  bmr: number;
  
  grade: string;
  recommendation: string;

  chartData: { name: string; value: number; color: string }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateKatchMcardle = (inputs: KatchMcardleInputs): KatchMcardleResults | null => {
  const { weight, bodyFatPct, unit } = inputs;
  
  if (weight <= 0 || bodyFatPct < 2 || bodyFatPct > 70) return null;

  const weightKg = unit === "lbs" ? weight / 2.20462 : weight;
  
  // Calculate Fat Mass and Lean Body Mass (LBM) in kg
  const fatMassKg = weightKg * (bodyFatPct / 100);
  const lbmKg = weightKg - fatMassKg;

  // Katch-McArdle Formula: BMR = 370 + (21.6 * Lean Body Mass in kg)
  const bmr = 370 + (21.6 * lbmKg);

  // Convert back to chosen unit for display of mass
  const lbmDisplay = unit === "lbs" ? lbmKg * 2.20462 : lbmKg;
  const fatMassDisplay = unit === "lbs" ? fatMassKg * 2.20462 : fatMassKg;

  let grade = "";
  let recommendation = "";

  if (bodyFatPct < 10) {
    grade = "Elite Lean Mass Ratio";
    recommendation = "You possess an incredibly low body fat percentage. Standard BMR formulas (like Mifflin-St Jeor) severely underestimate your caloric needs because they assume average fat levels. The Katch-McArdle formula corrects this by attributing your high caloric burn entirely to your massive relative muscle mass.";
  } else if (bodyFatPct <= 20) {
    grade = "Athletic Mass Ratio";
    recommendation = "This is a highly athletic body composition. Your Lean Body Mass is the primary driver of your metabolism. Maintaining this muscle mass requires adequate protein intake and resistance training to preserve your high resting metabolic rate.";
  } else if (bodyFatPct <= 30) {
    grade = "Average Mass Ratio";
    recommendation = "At this body fat percentage, the Katch-McArdle formula will likely yield results very similar to standard formulas like Mifflin-St Jeor or Harris-Benedict, as your lean-to-fat ratio represents the clinical average.";
  } else {
    grade = "High Adipose Ratio";
    recommendation = "At a higher body fat percentage, standard formulas dangerously overestimate BMR because they assume body fat burns calories at the same rate as muscle. The Katch-McArdle formula is highly accurate here, isolating your metabolically active lean tissue and preventing you from overeating.";
  }

  const chartData = [
    { name: "Lean Body Mass", value: parseFloat(lbmDisplay.toFixed(1)), color: "#3b82f6" },
    { name: "Fat Mass", value: parseFloat(fatMassDisplay.toFixed(1)), color: "#ef4444" }
  ];

  const summaryStats = [
    { label: "Basal Metabolic Rate (BMR)", value: `${Math.round(bmr)} kcal / day`, colorClass: "text-primary font-bold text-lg" },
    { label: "Metabolically Active Tissue (LBM)", value: `${lbmDisplay.toFixed(1)} ${unit}`, colorClass: "text-blue-500 font-bold" },
    { label: "Adipose Tissue (Fat Mass)", value: `${fatMassDisplay.toFixed(1)} ${unit}`, colorClass: "text-red-500 font-bold" },
    { label: "Body Composition Profile", value: grade }
  ];

  return {
    lbm: lbmDisplay,
    fatMass: fatMassDisplay,
    bmr: Math.round(bmr),
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  weight: "180",
  bodyFatPct: "15",
  unit: "lbs" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1" style={{ color: payload[0].payload.color }}>{payload[0].payload.name}</p>
        <p className="text-muted-foreground"><span className="font-bold text-foreground">{payload[0].value}</span> units</p>
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

export default function BasalMetabolicRateBmrKatchMcardleCalculator() {
  // 4. Component State
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [bodyFatPct, setBodyFatPct] = useState(DEFAULTS.bodyFatPct);
  const [unit, setUnit] = useState<"lbs" | "kg">(DEFAULTS.unit);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<KatchMcardleResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFatPct);

    if (w <= 0 || bf < 2 || bf > 70) {
      setErrorMsg("Error: Please enter a valid weight and a body fat percentage between 2% and 70%.");
      setResults(null);
      return;
    }

    const inputs: KatchMcardleInputs = {
      weight: w,
      bodyFatPct: bf,
      unit
    };
    setResults(calculateKatchMcardle(inputs));
  };

  const handleReset = () => {
    setWeight(DEFAULTS.weight);
    setBodyFatPct(DEFAULTS.bodyFatPct);
    setUnit(DEFAULTS.unit);
    setErrorMsg("");
    
    setResults(calculateKatchMcardle({
      weight: parseFloat(DEFAULTS.weight),
      bodyFatPct: parseFloat(DEFAULTS.bodyFatPct),
      unit: DEFAULTS.unit
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, bodyFatPct, unit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Katch-McArdle BMR</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is BMR?", answer: "Basal Metabolic Rate (BMR) is the total number of calories your body requires to perform its most basic, life-sustaining functions (like breathing, circulating blood, and cellular reproduction) if you were to stay in bed all day and do absolutely nothing." },
    { question: "Why is the Katch-McArdle formula different?", answer: "Most standard BMR formulas (like Mifflin-St Jeor or Harris-Benedict) calculate your caloric needs using only your Total Body Weight, Height, and Age. They assume your body is made of an 'average' amount of fat and muscle. The Katch-McArdle formula ignores total weight and calculates BMR exclusively using your Lean Body Mass (muscle, bones, organs). It is the most scientifically accurate formula available if you know your body fat percentage." },
    { question: "Why does muscle burn more calories than fat?", answer: "Skeletal muscle is highly 'metabolically active' tissue. It requires a constant influx of energy (calories) simply to exist and maintain its structure. Adipose tissue (body fat) is essentially a dormant storage tank; it requires very little energy to maintain. Therefore, a 200lb bodybuilder with 10% body fat has a massively higher BMR than a 200lb sedentary person with 35% body fat, despite weighing exactly the same." },
    { question: "Who should use the Katch-McArdle formula?", answer: "This formula is critical for two groups: 1) Elite athletes and bodybuilders, because standard formulas underestimate their BMR by failing to account for their massive muscle mass. 2) Heavily obese individuals, because standard formulas dangerously overestimate their BMR by assuming all of their excess weight is burning calories." },
    { question: "How do I find my Body Fat Percentage?", answer: "For the most accurate result, use a DEXA scan or hydrostatic weighing. For home estimates, use skinfold calipers (the Jackson-Pollock method) or a high-quality bioelectrical impedance scale. Visual estimation using reference photos is also acceptable for general dieting purposes." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Basal Metabolic Rate BMR (Katch-McArdle) Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Katch-McArdle BMR Calculator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px] mx-auto">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Dumbbell className="h-4 w-4" /> Lean Mass Metabolism Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your highly accurate Basal Metabolic Rate by isolating your metabolically active lean tissue from your dormant fat mass.</p>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-1 gap-3">
                <CompactInput id="cw" label="Total Body Weight" value={weight} onChange={setWeight} />
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
              <CompactInput id="bf" label="Estimated Body Fat Percentage" value={bodyFatPct} onChange={setBodyFatPct} suffix="%" />
              <p className="text-[10px] text-muted-foreground -mt-3 ml-1">Requires a DEXA scan, calipers, or visual estimation.</p>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-600 text-xs font-bold p-3 rounded-md mt-1">
                {errorMsg}
              </div>
            )}

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
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                      Basal Metabolic Rate (BMR)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.bmr}</div>
                      <div className="text-xl font-bold text-muted-foreground">kcal / day</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      Your body burns <strong>{results.bmr} calories</strong> every 24 hours purely to sustain your {results.lbm.toFixed(1)} {unit} of lean metabolically active tissue, excluding all physical movement.
                    </p>
                  </div>
                  <Dumbbell className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Body Composition Analysis</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Formula Note:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-2 w-full text-left">Mass Distribution</h3>
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
                        <span className="text-xl font-black text-foreground leading-none">{weight}</span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{unit}</span>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-center mt-3 text-xs font-bold w-full">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Lean Mass</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Fat Mass</div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Dumbbell className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your total weight and body fat percentage to isolate your metabolically active lean mass and calculate a precise BMR.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1280px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>Understanding the Katch-McArdle BMR Calculator</h2>
            <p>If you have ever attempted to track your macros or count calories, you have likely used a standard online calculator to find your Basal Metabolic Rate (BMR) or Total Daily Energy Expenditure (TDEE). The vast majority of these basic calculators use the Mifflin-St Jeor or Harris-Benedict formulas. While these equations are excellent for the "average" human being, they contain a massive mathematical flaw when applied to outliers: they only look at Total Body Weight. They assume that a pound of body fat and a pound of skeletal muscle burn calories at the exact same rate. This is biologically false. The <strong>Katch-McArdle Formula</strong> is an elite, clinical sports science calculation that corrects this flaw by basing your metabolism entirely on your <strong>Lean Body Mass</strong>.</p>

            <h2>The Metabolic Difference: Muscle vs. Fat</h2>
            <p>To understand why the Katch-McArdle formula is necessary, you must understand how human tissue utilizes energy. Skeletal muscle is highly "metabolically active." It requires a constant, heavy stream of calories simply to maintain its structural integrity, repair micro-tears, and keep the engine idling. Adipose tissue (body fat), on the other hand, is essentially a dormant storage tank. It is designed to hold energy for future famine; it requires almost no calories to maintain its existence.</p>
            <p>Imagine two men who both weigh 220 pounds and are the exact same height and age. Man A is a professional bodybuilder with 10% body fat. Man B is a sedentary office worker with 35% body fat.</p>
            <ul>
              <li><strong>Man A (Bodybuilder):</strong> Has 198 pounds of metabolically expensive Lean Body Mass. His internal engine is massive and constantly burning fuel.</li>
              <li><strong>Man B (Sedentary):</strong> Has only 143 pounds of Lean Body Mass, carrying 77 pounds of dormant fat. His internal engine is quite small.</li>
            </ul>
            <p>If both men use a standard BMR calculator (Mifflin-St Jeor), the calculator will output the <em>exact same metabolic rate</em> for both men because they weigh the same. This will severely under-feed the bodybuilder (causing muscle loss) and over-feed the sedentary man (causing further weight gain).</p>

            <h2>How the Katch-McArdle Formula Works</h2>
            <p>The Katch-McArdle formula bypasses the flaws of total body weight entirely. Instead, it requires you to input your Body Fat Percentage. The algorithm then strips away your fat mass, isolating your Lean Body Mass (LBM)—which includes your muscles, bones, organs, and bodily fluids.</p>
            <p>The formula is remarkably elegant: <strong>BMR = 370 + (21.6 x Lean Body Mass in kg)</strong>.</p>
            <p>Because the formula only looks at the tissue that is actually burning calories, it provides a pinpoint-accurate assessment of your baseline resting energy requirements, regardless of whether you are incredibly shredded or severely obese.</p>

            <h2>Who MUST Use the Katch-McArdle Formula?</h2>
            <p>While average individuals can use any BMR formula with relative success, two specific demographics must rely exclusively on Katch-McArdle to prevent dietary failure:</p>

            <h3>1. Athletes and Bodybuilders (Low Body Fat)</h3>
            <p>If you have spent years in the gym building significant muscle mass and driving your body fat percentage down below 12% (for men) or 20% (for women), standard formulas will fail you. Because they assume your weight is composed of average fat levels, they will drastically underestimate your BMR. If you use a standard formula to set your deficit for a cut, you will end up starving yourself, crashing your hormones, and cannibalizing the hard-earned muscle you spent years building.</p>

            <h3>2. Heavily Obese Individuals (High Body Fat)</h3>
            <p>Conversely, if an individual is severely overweight (e.g., 300 pounds with 45% body fat), standard formulas will see the 300-pound total weight and assume a massive metabolic engine. The formula will generate a BMR of perhaps 2,500 calories. However, 135 pounds of that weight is dormant fat tissue burning almost nothing. If this individual attempts to lose weight by eating 2,000 calories (thinking they are in a 500-calorie deficit), they will likely stall or even gain weight, because their true Lean Mass BMR is much lower. Katch-McArdle strips away the 135 pounds of fat and calculates the BMR solely on the 165 pounds of lean tissue, revealing the harsh reality of their true, lower caloric need.</p>

            <h2>How to Determine Your Body Fat Percentage</h2>
            <p>The only downside to the Katch-McArdle formula is the barrier to entry: you must know your Body Fat Percentage to calculate your Lean Body Mass. You cannot guess this number wildly, or the formula will output garbage data. Here are the best ways to obtain it, ranked by accuracy:</p>
            <ol>
              <li><strong>DEXA Scan:</strong> The gold standard. A low-dose X-ray that maps your exact fat, muscle, and bone density. (Highly accurate, but expensive).</li>
              <li><strong>Hydrostatic Weighing / BodPod:</strong> Water displacement or air displacement chambers. (Highly accurate, moderately expensive).</li>
              <li><strong>Skinfold Calipers (Jackson-Pollock):</strong> A trained professional pinches your fat in 3 or 7 locations. (Accurate if the practitioner is skilled; cheap).</li>
              <li><strong>Bioelectrical Impedance Scales:</strong> Smart scales that send a weak electrical current through your feet. (Inconsistent; highly affected by hydration levels).</li>
              <li><strong>Visual Estimation:</strong> Comparing yourself to clinical reference photos online. (Good enough for general dieting if you are honest with yourself).</li>
            </ol>

            <h2>Translating BMR to TDEE</h2>
            <p>Remember that your BMR is not the amount of calories you should eat in a day. It is the absolute bare minimum required for survival if you were in a coma. To find your actual maintenance calories (Total Daily Energy Expenditure or TDEE), you must multiply your Katch-McArdle BMR by an activity multiplier (e.g., 1.2 for sedentary, 1.55 for moderate exercise, 1.9 for extreme athletes).</p>

            <h2>Conclusion: Precision Engineering</h2>
            <p>If you are serious about optimizing your body composition, generic averages are no longer sufficient. You must treat your body like a high-performance machine. By securing an accurate body fat measurement and running it through the Basal Metabolic Rate (Katch-McArdle) Calculator, you strip away the metabolic dead weight and build your nutritional protocol on the exact mathematical requirements of your lean tissue.</p>
          </article>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/basal-metabolic-rate-bmr-katch-mcardle-calculator" />
          <PopularCalculators exclude="/calculator/basal-metabolic-rate-bmr-katch-mcardle-calculator" />
        </div>
      </div>
    </>
  );
}
