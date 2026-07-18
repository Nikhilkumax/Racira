"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Syringe, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// 1. TypeScript Interfaces
interface InsulinInputs {
  tdd: number; // Total Daily Dose of insulin
  insulinType: "rapid" | "regular"; // 500 rule vs 450 rule
}

interface InsulinResults {
  carbRatio: number; // grams of carbs covered by 1 unit
  ruleUsed: number;
  
  grade: string;
  recommendation: string;

  chartData: { carbs: string; units: number }[];
  summaryStats: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateRatio = (inputs: InsulinInputs): InsulinResults | null => {
  const { tdd, insulinType } = inputs;
  
  if (tdd <= 0) return null;

  // The 500 Rule is for rapid-acting insulin (Humalog, Novolog, Apidra).
  // The 450 Rule is for short-acting regular insulin (Humulin R, Novolin R).
  const ruleUsed = insulinType === "rapid" ? 500 : 450;
  
  // Carbohydrate-to-Insulin Ratio (CIR)
  const carbRatio = ruleUsed / tdd;

  let grade = "";
  let recommendation = "";

  if (carbRatio < 5) {
    grade = "High Insulin Resistance";
    recommendation = "A ratio below 1:5 indicates significant insulin resistance. You require a large amount of insulin to cover a small amount of carbohydrates. This is often seen in Type 2 Diabetes or late-stage Type 1 with severe metabolic syndrome.";
  } else if (carbRatio <= 15) {
    grade = "Standard Adult Ratio";
    recommendation = "This is the average clinical range for most adults with Type 1 Diabetes. One unit of insulin covers roughly an apple or a slice of bread.";
  } else if (carbRatio <= 30) {
    grade = "High Insulin Sensitivity";
    recommendation = "You are highly sensitive to insulin. A very small dose covers a large carbohydrate load. This is typical for children, newly diagnosed Type 1s (honeymoon phase), or highly active endurance athletes.";
  } else {
    grade = "Extreme Sensitivity";
    recommendation = "Your body requires very little exogenous insulin. Please ensure you are dosing accurately, as minor miscalculations could lead to severe hypoglycemia.";
  }

  // Generate chart data for dosing examples
  const mealExamples = [15, 30, 45, 60, 75, 90, 105]; // typical carb loads
  const chartData = mealExamples.map(carbs => ({
    carbs: `${carbs}g`,
    units: parseFloat((carbs / carbRatio).toFixed(1))
  }));

  const summaryStats = [
    { label: "Insulin-to-Carb Ratio (ICR)", value: `1 Unit : ${carbRatio.toFixed(1)}g`, colorClass: "text-primary font-bold text-lg" },
    { label: "Clinical Formula Used", value: `The ${ruleUsed} Rule`, colorClass: "font-medium" },
    { label: "Example: 60g Carb Meal Dose", value: `${(60 / carbRatio).toFixed(1)} Units`, colorClass: "text-blue-500 font-bold" },
    { label: "Sensitivity Profile", value: grade }
  ];

  return {
    carbRatio,
    ruleUsed,
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
        <p className="font-bold mb-1 text-primary">Meal Size: {payload[0].payload.carbs} Carbs</p>
        <p className="text-muted-foreground">Required Bolus: <span className="font-bold text-foreground">{payload[0].value} Units</span></p>
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

export default function CarbToInsulinRatioCalculator() {
  // 4. Component State
  const [tdd, setTdd] = useState(DEFAULTS.tdd);
  const [insulinType, setInsulinType] = useState<"rapid" | "regular">(DEFAULTS.insulinType);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [results, setResults] = useState<InsulinResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    setErrorMsg("");
    const t = parseFloat(tdd);

    if (t <= 0) {
      setErrorMsg("Error: Total Daily Dose must be greater than zero.");
      setResults(null);
      return;
    }

    const inputs: InsulinInputs = {
      tdd: t,
      insulinType
    };
    setResults(calculateRatio(inputs));
  };

  const handleReset = () => {
    setTdd(DEFAULTS.tdd);
    setInsulinType(DEFAULTS.insulinType);
    setErrorMsg("");
    
    setResults(calculateRatio({
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
    w.document.write(`<html><head><title>Carb to Insulin Ratio</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is the Total Daily Dose (TDD)?", answer: "Your TDD is the total number of units of insulin you take in an average 24-hour period. This includes all of your long-acting basal insulin (e.g., Lantus, Levemir) PLUS all of your short-acting mealtime bolus insulin (e.g., Humalog, Novolog)." },
    { question: "What is the 500 Rule?", answer: "The 500 Rule is a clinically validated mathematical heuristic used by endocrinologists to estimate insulin sensitivity. By dividing the constant 500 by your TDD, you get an approximation of how many grams of carbohydrates one unit of rapid-acting insulin will cover." },
    { question: "Why is the 450 Rule used for Regular Insulin?", answer: "Older 'Regular' insulins (like Humulin R or Novolin R) have a slower onset and different pharmacokinetic profile than modern rapid-acting analogs. Because they are slightly less efficient at managing rapid postprandial (post-meal) blood sugar spikes, a more conservative constant (450) is used to calculate the ratio." },
    { question: "Is this ratio constant all day?", answer: "No. The 500 rule provides a baseline average, but insulin sensitivity fluctuates dramatically based on circadian rhythms and hormones. Many diabetics require a more aggressive ratio in the morning (e.g., 1:8 due to the Dawn Phenomenon) and a more sensitive ratio in the evening (e.g., 1:12). Always adjust based on actual blood glucose readings." },
    { question: "Does exercise affect this ratio?", answer: "Massively. Cardiovascular exercise drastically increases muscle insulin sensitivity, meaning glucose is shuttled into the cells more efficiently. If you are dosing for a meal immediately before or after intense exercise, you will likely need to artificially increase your ratio (taking less insulin) to prevent severe hypoglycemia." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Carb to Insulin Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Carb to Insulin Ratio Calculator (ICR)</h1>

        {/* MEDICAL DISCLAIMER */}
        <div className="max-w-[1280px] mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed text-red-800 dark:text-red-400">
            <strong>Medical Disclaimer:</strong> This calculator provides clinical estimations based on the 500/450 Rule. It is intended for educational purposes only. Do <strong>not</strong> change your insulin dosing protocol without explicit supervision and approval from your endocrinologist or primary care physician.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[460px_1fr] gap-6 items-start max-w-[1280px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="bg-primary/5 border-l-4 border-primary rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 text-primary font-bold mb-1">
                <Syringe className="h-4 w-4" /> Bolus Estimation Engine
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Calculate exactly how many grams of carbohydrates are covered by a single unit of insulin using standard clinical heuristics.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CompactInput id="tdd" label="Total Daily Dose (TDD) of Insulin" value={tdd} onChange={setTdd} suffix="Units" />
              <p className="text-[10px] text-muted-foreground -mt-3 ml-1">Sum of all basal AND bolus insulin taken in 24 hours.</p>
            </div>

            <div className="flex flex-col mb-1 mt-2">
              <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Insulin Formulation</label>
              <select 
                value={insulinType} 
                onChange={(e) => setInsulinType(e.target.value as any)}
                className="w-full h-10 px-3 py-1 text-sm font-medium rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all text-foreground"
              >
                <option value="rapid">Rapid-Acting Analogs (Novolog, Humalog, Apidra) - 500 Rule</option>
                <option value="regular">Short-Acting Regular (Humulin R, Novolin R) - 450 Rule</option>
              </select>
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
                <div className="bg-primary/10 border border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                  <button onClick={handlePrint} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors print:hidden z-10" aria-label="Print Results">
                    <Printer className="h-4 w-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 text-primary">
                      Carbohydrate-to-Insulin Ratio (ICR)
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-xl font-bold text-muted-foreground">1 Unit : </div>
                      <div className="text-5xl font-extrabold tracking-tight text-foreground">{results.carbRatio.toFixed(1)}</div>
                      <div className="text-xl font-bold text-muted-foreground">grams</div>
                    </div>
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed max-w-md">
                      For every <strong>{results.carbRatio.toFixed(1)} grams</strong> of carbohydrates you eat, you must inject one unit of insulin to maintain stable blood glucose.
                    </p>
                  </div>
                  <Syringe className="absolute -bottom-4 -right-4 h-32 w-32 opacity-5 text-foreground" />
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
                      <span className="font-bold">{results.grade}:</span> {results.recommendation}
                    </div>
                  </div>

                  {/* 4. Chart */}
                  <div className="card-calculator !p-5 border border-border bg-card flex flex-col justify-center items-center h-full min-h-[260px]">
                    <h3 className="text-base font-bold mb-4 w-full text-left">Dosing Escalation Curve</h3>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={results.chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="carbs" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickMargin={8} domain={[0, 'auto']} tickFormatter={(v) => `${v}U`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Bar dataKey="units" radius={[4, 4, 0, 0]} maxBarSize={40} fill="hsl(var(--primary))">
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-[10px] text-muted-foreground mt-3 w-full text-center">Required units of insulin across standard carbohydrate meal sizes.</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-card/50 text-muted-foreground p-8 text-center">
                <Syringe className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium max-w-xs">Enter your Total Daily Dose (TDD) of insulin to calculate your baseline Carbohydrate-to-Insulin Ratio.</p>
              </div>
            )}
          </div>
        </div>

        {/* SEO CONTENT (1500+ words, 8 sections) */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Carb-to-Insulin Ratio (ICR)</h2>
            <p>For individuals living with Type 1 Diabetes (and insulin-dependent Type 2 Diabetes), the pancreas no longer produces the insulin required to shuttle glucose from the bloodstream into the body's cells. To survive and prevent severe hyperglycemia, patients must manually inject exogenous insulin every time they eat. However, guessing the dose is incredibly dangerous. Inject too little, and blood sugar spikes dangerously high. Inject too much, and blood sugar crashes, leading to potentially fatal hypoglycemia.</p>
            <p>To navigate this, endocrinologists utilize the <strong>Insulin-to-Carbohydrate Ratio (ICR)</strong>. This ratio dictates exactly how many grams of carbohydrates are covered by a single unit of rapid-acting insulin. The <strong>Carb-to-Insulin Ratio Calculator</strong> utilizes the globally recognized clinical heuristics—the "500 Rule" and the "450 Rule"—to help patients determine their baseline starting ratio based on their total physiological insulin requirements.</p>

            <h2 className="text-2xl font-bold mb-3">The Mathematics of the 500 Rule</h2>
            <p>The 500 Rule is the gold standard algorithm used to calculate the ICR for patients using modern rapid-acting insulin analogs (such as Humalog, Novolog, or Apidra). The math is remarkably straightforward: you divide the constant 500 by your Total Daily Dose (TDD) of insulin.</p>
            <p><strong>Step 1: Calculate your TDD.</strong> This is the total amount of insulin you take in an average 24-hour period. It includes your background basal insulin (e.g., 20 units of Lantus) PLUS all the bolus insulin you take for meals (e.g., 5 units for breakfast, 6 for lunch, 9 for dinner). In this example, your TDD is 40 units.</p>
            <p><strong>Step 2: Apply the formula.</strong> Divide 500 by 40. The result is 12.5. Therefore, your Insulin-to-Carb Ratio is 1:12.5. For every 12.5 grams of carbohydrates you consume, you must inject one unit of insulin.</p>

            <h2 className="text-2xl font-bold mb-3">The 450 Rule for Regular Insulin</h2>
            <p>Before the invention of ultra-fast rapid analogs, diabetics relied on "Regular" short-acting insulin (such as Humulin R or Novolin R). Regular insulin has a much slower onset (taking up to 30 minutes to start working) and a longer peak. Because its pharmacokinetic profile is slightly less aggressive in handling rapid post-meal spikes, endocrinologists use a slightly more conservative constant: 450.</p>
            <p>If you are using Regular insulin and your TDD is 40 units, you divide 450 by 40, resulting in a ratio of 1:11.2. As you can see, you need slightly more Regular insulin to cover the exact same meal compared to rapid-acting analogs.</p>

            <h2 className="text-2xl font-bold mb-3">Why is TDD Used as the Foundation?</h2>
            <p>A common question from newly diagnosed patients is: <em>"Why does my basal (long-acting) insulin impact how much insulin I need for a sandwich?"</em></p>
            <p>Your Total Daily Dose is the most accurate reflection of your body's overall <strong>Insulin Sensitivity</strong>. If a 150-pound man requires 80 units of insulin a day to survive, and another 150-pound man requires only 30 units a day, it indicates that the first man has significant insulin resistance. Because his body resists the insulin, he needs massive amounts of it to move glucose into the cells. Therefore, his ICR will be very low (e.g., 1 unit covers only 6 grams of carbs). By basing the calculation on the TDD, the formula automatically calibrates to your unique metabolic resistance profile.</p>

            <h2 className="text-2xl font-bold mb-3">Applying the Ratio to Real-World Meals</h2>
            <p>Once you know your ratio, dosing for meals becomes an exercise in strict carbohydrate counting. You must read nutrition labels, use digital food scales, and track your macros meticulously.</p>
            <p>Let's assume your calculator result is a ratio of <strong>1:10</strong> (1 unit per 10 grams of carbs).</p>
            <ul>
              <li>You eat a banana (25g carbs) and a slice of toast (15g carbs). Total carbs: 40g.</li>
              <li>Divide the total carbs (40) by your ratio (10).</li>
              <li>Required Dose: <strong>4 Units</strong>.</li>
            </ul>
            <p>If you guess the carbs incorrectly—say, estimating the meal at 60g and taking 6 units—you have given yourself two units of excess insulin. Without sugar to cover it, those two units will rapidly drive your blood sugar into a hypoglycemic state.</p>

            <h2 className="text-2xl font-bold mb-3">Variables That Alter Insulin Sensitivity</h2>
            <p>The 500 Rule provides a phenomenal <em>baseline</em>, but the human endocrine system is not a static machine. Your ratio will fluctuate based on a myriad of environmental and physiological factors. You must learn to adjust your ratio dynamically:</p>
            <p><strong>1. Circadian Rhythms (The Dawn Phenomenon):</strong> Due to the morning release of cortisol and growth hormone (designed to wake you up), humans are naturally highly insulin-resistant in the morning. Many diabetics require a much stronger ratio for breakfast (e.g., 1:8) than they do for dinner (e.g., 1:15).</p>
            <p><strong>2. Cardiovascular Exercise:</strong> Aerobic exercise (running, cycling, swimming) drastically increases the insulin sensitivity of muscle tissue. Glucose is essentially vacuumed out of the bloodstream without the need for high insulin levels. If you eat a meal right before a run, you must artificially weaken your ratio (e.g., changing it from 1:10 to 1:20, effectively cutting your dose in half) to prevent a massive crash.</p>
            <p><strong>3. Dietary Fat and Protein:</strong> The 500 rule only accounts for carbohydrates. However, high-fat, high-protein meals (like a massive steak or a heavily cheesed pizza) delay gastric emptying. The carbs digest much slower, often causing a delayed blood sugar spike 4 to 6 hours later. Advanced diabetics use "square wave" or "extended" bolus features on their insulin pumps to manage this.</p>

            <h2 className="text-2xl font-bold mb-3">When to Adjust Your Ratio</h2>
            <p>How do you know if your calculator-provided ratio is correct? You must test it via rigorous blood glucose monitoring (preferably with a Continuous Glucose Monitor or CGM).</p>
            <p>If you calculate your dose perfectly, take your insulin 15 minutes before eating, and your blood sugar spikes to 250 mg/dL and stays there for hours, your ratio is too weak (you need more insulin per carb). Conversely, if you routinely crash into hypoglycemia two hours after eating, your ratio is too strong (you are taking too much insulin). Keep detailed logs and review them with your medical team.</p>

            <h2 className="text-2xl font-bold mb-3">Conclusion: The Blueprint of Diabetic Management</h2>
            <p>Living with diabetes requires you to act as your own pancreas. It is an exhausting mathematical burden, but mastering your Carb-to-Insulin Ratio is the single most empowering step you can take toward metabolic control. Use the calculator to establish your baseline, count your carbohydrates with absolute precision, and continuously refine your ratio to achieve flatline, non-diabetic blood sugars.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/carb-to-insulin-ratio-calculator" />
          <PopularCalculators exclude="/calculator/carb-to-insulin-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
