"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, ActivitySquare, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// 1. TypeScript Interfaces
interface GlucoseInputs {
  tdd: number;
  insulinType: "rapid" | "short";
}

interface GlucoseResults {
  carbRatio: number;
  isf: number;
  
  grade: string;
  recommendation: string;

  chartData: { unit: string; drop: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateGlucoseRatios = (inputs: GlucoseInputs): GlucoseResults | null => {
  const { tdd, insulinType } = inputs;
  
  if (tdd <= 0) return null;

  let carbRatio = 0;
  let isf = 0;

  // The Rule of 500 (Rapid-acting) or 450 (Short-acting) for Insulin-to-Carb Ratio (ICR)
  // The Rule of 1800 (Rapid-acting) or 1500 (Short-acting) for Insulin Sensitivity Factor (ISF)
  
  if (insulinType === "rapid") {
    carbRatio = 500 / tdd;
    isf = 1800 / tdd;
  } else {
    carbRatio = 450 / tdd;
    isf = 1500 / tdd;
  }

  const grade = "Clinical Baseline Estimate";
  const recommendation = "These ratios are mathematical starting points based on the universally recognized Rule of 500 and Rule of 1800. They provide a baseline for your endocrinologist to refine. Always test your blood glucose frequently when adjusting ratios.";

  const chartData = [
    { unit: "1 Unit", drop: Math.round(isf * 1) },
    { unit: "2 Units", drop: Math.round(isf * 2) },
    { unit: "3 Units", drop: Math.round(isf * 3) },
    { unit: "4 Units", drop: Math.round(isf * 4) },
    { unit: "5 Units", drop: Math.round(isf * 5) }
  ];

  const summaryStats = [
    { label: "Insulin-to-Carb Ratio (ICR)", value: `1 Unit : ${carbRatio.toFixed(1)}g Carbs`, colorClass: "text-primary font-black text-xl" },
    { label: "Correction Factor (ISF)", value: `1 Unit = -${Math.round(isf)} mg/dL`, colorClass: "text-blue-500 font-bold" },
    { label: "Calculation Matrix Used", value: insulinType === 'rapid' ? 'Rule of 500 / 1800' : 'Rule of 450 / 1500' },
    { label: "Total Daily Dose (TDD)", value: `${tdd} Units` }
  ];

  return {
    carbRatio: parseFloat(carbRatio.toFixed(1)),
    isf: Math.round(isf),
    grade,
    recommendation,
    chartData,
    summaryStats
  };
};

// 3. DEFAULTS Object
const DEFAULTS = {
  tdd: "40",
  insulinType: "rapid" as const
};

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-2.5 rounded-lg shadow-md text-xs font-semibold text-foreground">
        <p className="font-bold mb-1 text-primary">{payload[0].payload.unit} Insulin</p>
        <p className="text-muted-foreground">Blood Glucose Drop: <span className="font-bold text-blue-500">-{payload[0].value} mg/dL</span></p>
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

export default function BloodGlucoseToCarbRatioEstimator() {
  // 4. Component State
  const [tdd, setTdd] = useState(DEFAULTS.tdd);
  const [insulinType, setInsulinType] = useState<"rapid" | "short">(DEFAULTS.insulinType);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<GlucoseResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const t = parseFloat(tdd);

    if (t <= 0) {
      setErrorMsg("Error: Please enter a valid Total Daily Dose (TDD) greater than zero.");
      setResults(null);
      return;
    }

    const inputs: GlucoseInputs = {
      tdd: t,
      insulinType
    };
    setResults(calculateGlucoseRatios(inputs));
  };

  const handleReset = () => {
    setTdd(DEFAULTS.tdd);
    setInsulinType(DEFAULTS.insulinType);
    setErrorMsg("");
    setResults(calculateGlucoseRatios({
      tdd: parseFloat(DEFAULTS.tdd),
      insulinType: DEFAULTS.insulinType
    }));
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdd, insulinType]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Glucose Ratio Analysis</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an Insulin-to-Carb Ratio (ICR)?", answer: "The Insulin-to-Carb Ratio (ICR) tells you exactly how many grams of carbohydrates are covered (metabolized) by a single unit of insulin. For example, if your ratio is 1:15, it means you need to take 1 unit of insulin for every 15 grams of carbohydrates you eat to prevent your blood sugar from spiking." },
    { question: "What is the Insulin Sensitivity Factor (ISF)?", answer: "The Insulin Sensitivity Factor (also called the Correction Factor) tells you how much one unit of insulin will drop your blood sugar. If your blood sugar is high (e.g., 250 mg/dL) and your ISF is 50, taking 1 unit of insulin will bring your blood sugar down by roughly 50 points (to 200 mg/dL)." },
    { question: "What is the Rule of 500 and Rule of 1800?", answer: "These are mathematical constants developed by endocrinologists to provide a safe starting point for insulin dosing. The Rule of 500 (500 divided by your Total Daily Dose) estimates your Carb Ratio. The Rule of 1800 (1800 divided by your Total Daily Dose) estimates your Correction Factor. These specific numbers are used for modern Rapid-Acting insulins (like Humalog or Novolog)." },
    { question: "Why is the Total Daily Dose (TDD) required?", answer: "Your Total Daily Dose is the sum of all your background (basal) insulin and mealtime (bolus) insulin taken over 24 hours. This number perfectly reflects your body's overall insulin resistance. If your TDD is high (e.g., 100 units), it means you are highly resistant, and therefore 1 unit of insulin will have a much weaker effect on your blood sugar compared to someone who only needs 20 units a day." },
    { question: "Can I use these numbers to dose my insulin immediately?", answer: "No. These formulas provide clinical estimates and mathematical baselines. Human biology fluctuates due to stress, hormones, sleep, and exercise. You must discuss these calculated ratios with your endocrinologist or certified diabetes educator before changing your actual insulin dosing protocol." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Blood Glucose-to-Carb Ratio Estimator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Blood Glucose & Carb Ratio Estimator</h1>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <ActivitySquare className="h-4 w-4" /> Ratio Matrix Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate your theoretical Insulin-to-Carb Ratio (ICR) and Correction Factor (ISF) based on your total daily insulin requirements.</p>
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Insulin Type</label>
              <div className="flex p-1 bg-secondary rounded-lg border border-border w-full">
                <button type="button" onClick={() => setInsulinType("rapid")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${insulinType === "rapid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Rapid-Acting</button>
                <button type="button" onClick={() => setInsulinType("short")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${insulinType === "short" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`}>Short-Acting</button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 ml-1 leading-relaxed">Rapid: Humalog, Novolog, Apidra. Short: Regular (R).</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-2 border-t border-border pt-4">
              <CompactInput id="tdd" label="Total Daily Dose (TDD)" value={tdd} onChange={setTdd} suffix="Units" />
              <p className="text-[10px] text-muted-foreground mt-0.5 ml-1 leading-relaxed">Sum of all basal (long-acting) and bolus (meal-time) insulin taken over 24 hours.</p>
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
                <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                        Insulin-to-Carb Ratio (ICR)
                      </div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <div className="text-4xl font-bold text-primary">1 : {results.carbRatio.toFixed(1)}<span className="text-xl font-bold text-muted-foreground ml-1">g</span></div>
                      </div>
                      <div className="text-sm font-bold text-green-500 mt-1">
                        1 Unit covers {results.carbRatio.toFixed(1)} grams of carbs
                      </div>
                    </div>
                    
                    <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center min-w-[160px]">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Correction Factor</div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        -{results.isf} <span className="text-xs">mg/dL</span>
                      </div>
                      <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">Drop per 1 Unit</div>
                    </div>
                  </div>
                  <ActivitySquare className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
                </div>

                <div className="grid lg:grid-cols-2 gap-4">
                  {/* 3. Breakdown Table */}
                  <div className="bg-muted/30 border border-border rounded-lg p-5 h-full">
                    <h3 className="text-base font-bold mb-4">Clinical Profile</h3>
                    <div className="grid grid-cols-1 gap-y-4 text-sm mb-4">
                      {results.summaryStats.map((stat, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="text-muted-foreground">{stat.label}:</span>
                          <span className={`font-semibold ${stat.colorClass || ''}`}>{stat.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/40 text-xs text-muted-foreground leading-relaxed italic">
                      <span className="font-bold">Assessment:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Correction Dose Efficacy</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="unit" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `-${val}`} axisLine={false} tickLine={false} />
                        
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="drop" radius={[2, 2, 0, 0]} maxBarSize={30}>
                          {results.chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-3 text-center px-4">Estimated drop in blood glucose (mg/dL) based on the calculated Sensitivity Factor.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <ActivitySquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your Total Daily Dose (TDD) of insulin to estimate your Carb Ratio and Correction Factor using clinical standard algorithms.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-blue-800 dark:text-blue-400">
            <strong>Clinical Disclaimer:</strong> This tool utilizes the universally recognized "Rule of 500" and "Rule of 1800" to estimate Insulin-to-Carb Ratios and Correction Factors. These results are mathematical estimates only. Do not alter your insulin dosing without direct approval from your endocrinologist.
          </p>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Blood Glucose-to-Carb Ratio Estimator</h2>
            <p>Managing diabetes—whether Type 1 or insulin-dependent Type 2—is one of the most mathematically demanding clinical tasks a patient can undertake. Every meal, every snack, and every high blood sugar correction requires a precise mathematical calculation to determine exactly how much insulin is needed. Guessing is not an option; taking too little insulin leads to hyperglycemia and organ damage over time, while taking too much leads to acute hypoglycemia, which can be immediately life-threatening. The <strong>Blood Glucose-to-Carb Ratio Estimator</strong> utilizes universally accepted endocrinology formulas to provide you with mathematical starting points for two of the most critical numbers in diabetes management: your Insulin-to-Carb Ratio (ICR) and your Insulin Sensitivity Factor (ISF).</p>

            <h2 className="text-2xl font-bold mb-3">What is the Insulin-to-Carb Ratio (ICR)?</h2>
            <p>The Insulin-to-Carb Ratio tells you exactly how many grams of carbohydrates will be metabolized (or "covered") by a single unit of rapid-acting or short-acting insulin. This is the number you use when calculating your dose for a meal.</p>
            <p>For example, if your ICR is calculated at <strong>1:12</strong>, it means you need 1 unit of insulin for every 12 grams of carbohydrates on your plate. If you are about to eat a plate of pasta containing 60 grams of carbohydrates, you divide 60 by 12, resulting in a required dose of 5 units of insulin just to cover the food.</p>
            <p>This ratio fluctuates widely from person to person. A highly insulin-sensitive athlete might have an ICR of 1:20 (needing very little insulin), while an individual with extreme insulin resistance might have an ICR of 1:5 (needing massive amounts of insulin for the same exact meal).</p>

            <h2 className="text-2xl font-bold mb-3">What is the Insulin Sensitivity Factor (ISF)?</h2>
            <p>The Insulin Sensitivity Factor (also frequently called the Correction Factor) is entirely separate from food. It dictates how powerfully your body reacts to a unit of insulin when your blood sugar is already too high and needs to be brought down to a target range.</p>
            <p>The ISF tells you exactly how many points (in mg/dL) one unit of insulin will lower your blood glucose. For example, if your ISF is <strong>40</strong>, one unit of insulin will drop your blood sugar by roughly 40 points.</p>
            <p>If your target blood sugar is 100 mg/dL, but you test at 220 mg/dL, you have a "gap" of 120 points that needs to be corrected. You divide that 120-point gap by your ISF of 40. The result is 3 units of insulin required to correct the high blood sugar.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics: Total Daily Dose (TDD)</h2>
            <p>Both of these critical ratios are derived from a single vital metric: your <strong>Total Daily Dose (TDD)</strong> of insulin. Your TDD is the absolute sum of all insulin you take in a 24-hour period. This includes your basal insulin (long-acting insulin like Lantus or Tresiba, or the basal rates on your pump) PLUS all the bolus insulin you take for meals and corrections.</p>
            <p>Endocrinologists use the TDD as the mathematical anchor because it is the ultimate measure of your body's overall insulin resistance. If your pancreas is producing zero insulin and you only require 30 units a day (a low TDD), it proves your cells are highly sensitive. Therefore, the mathematical formulas will output a high Carb Ratio (meaning 1 unit covers a lot of food) and a high Correction Factor (meaning 1 unit drops your blood sugar significantly).</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of 500 (Calculating ICR)</h2>
            <p>For individuals using modern Rapid-Acting insulins (such as Humalog, Novolog, or Apidra), the global standard for estimating the Carb Ratio is the <strong>Rule of 500</strong>. The math is incredibly simple:</p>
            <p><strong>500 ÷ Total Daily Dose = Insulin-to-Carb Ratio</strong></p>
            <p>If your TDD is 50 units: 500 ÷ 50 = 10. Your ratio is 1 unit for every 10 grams of carbohydrates. (If you use older, Short-Acting Regular insulin, the less aggressive Rule of 450 is used).</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of 1800 (Calculating ISF)</h2>
            <p>Similarly, to calculate the Correction Factor for Rapid-Acting insulin, endocrinologists utilize the <strong>Rule of 1800</strong>:</p>
            <p><strong>1800 ÷ Total Daily Dose = Insulin Sensitivity Factor</strong></p>
            <p>If your TDD is 50 units: 1800 ÷ 50 = 36. One unit of insulin will drop your blood sugar by approximately 36 mg/dL. (If using Short-Acting Regular insulin, the Rule of 1500 is used instead).</p>

            <h2 className="text-2xl font-bold mb-3">Why These Numbers Are Only "Estimates"</h2>
            <p>It is absolutely critical to understand that the human body is not a perfectly calibrated machine. While the Rule of 500 and Rule of 1800 are the best mathematical starting points available to medical science, they are exactly that: starting points. Your actual insulin needs will fluctuate based on a massive array of biological variables:</p>
            <ul>
              <li><strong>Time of Day:</strong> Most people are significantly more insulin-resistant in the morning due to the "Dawn Phenomenon" (a surge of cortisol and growth hormone). You might need an ICR of 1:8 for breakfast, but a highly sensitive ICR of 1:15 for dinner.</li>
              <li><strong>Physical Activity:</strong> Cardiovascular exercise drastically increases insulin sensitivity. Your normal correction factor might cause severe hypoglycemia if used immediately after a 5-mile run.</li>
              <li><strong>Stress and Illness:</strong> An infection or high-stress event triggers adrenaline and cortisol, which block insulin receptors. You will require significantly more insulin to cover meals and correct highs when sick.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Conclusion: Working With Your Medical Team</h2>
            <p>The Blood Glucose-to-Carb Ratio Estimator empowers you to understand the foundational mathematics underlying your diabetes management protocol. If your insulin needs have drastically increased over the last year, running your new TDD through this calculator will show you exactly how your ratios need to shift to keep up with your changing resistance. However, you must always treat these numbers as a theoretical framework. Bring these calculations to your next endocrinology appointment, and use them to have a highly informed, data-driven conversation with your doctor to safely fine-tune your dosing strategy.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blood-glucose-to-carb-ratio-estimator" />
          <PopularCalculators exclude="/calculator/blood-glucose-to-carb-ratio-estimator" />
        </div>
      </div>
    </>
  );
}
