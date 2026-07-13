"use client";

import { useState, useRef, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { ChevronDown, Printer, RotateCcw, Activity, Droplet } from "lucide-react";

// 1. TypeScript Interfaces
interface InsulinInputs {
  tdd: number; // Total Daily Dose of Insulin (units)
  insulinType: "rapid" | "regular"; // Rapid-acting (Humalog/Novolog) vs Regular (Humulin R)
  bloodSugarUnit: "mgdl" | "mmol";
}

interface InsulinResults {
  carbRatio: number; // Grams of carbs covered by 1 unit
  correctionFactorMgdl: number; // Blood sugar drop (mg/dL) per 1 unit
  correctionFactorMmol: number; // Blood sugar drop (mmol/L) per 1 unit
  
  basalEstimate: number; // 50% of TDD
  bolusEstimate: number; // 50% of TDD

  chartData: { label: string; value: string; colorClass?: string }[];
}

// 2. Pure Calculation Function
const calculateInsulin = (inputs: InsulinInputs): InsulinResults | null => {
  const { tdd, insulinType, bloodSugarUnit } = inputs;
  
  if (tdd <= 0) return null;

  // Carb Ratio (Rule of 500 for Rapid, 450 for Regular)
  const carbRule = insulinType === "rapid" ? 500 : 450;
  const carbRatio = carbRule / tdd;

  // Correction Factor (Rule of 1800 for Rapid, 1500 for Regular)
  const correctionRule = insulinType === "rapid" ? 1800 : 1500;
  const correctionFactorMgdl = correctionRule / tdd;
  const correctionFactorMmol = correctionFactorMgdl / 18;

  const basalEstimate = tdd * 0.5;
  const bolusEstimate = tdd * 0.5;

  const activeCF = bloodSugarUnit === "mgdl" 
    ? `${Math.round(correctionFactorMgdl)} mg/dL`
    : `${correctionFactorMmol.toFixed(1)} mmol/L`;

  const chartData = [
    { label: "Total Daily Dose (TDD)", value: `${tdd.toFixed(1)} U`, colorClass: "text-foreground font-bold" },
    { label: "Estimated Basal Need", value: `${basalEstimate.toFixed(1)} U/day` },
    { label: "Estimated Bolus Need", value: `${bolusEstimate.toFixed(1)} U/day` },
    { label: "Carb Ratio (1 Unit Covers)", value: `${Math.round(carbRatio)}g carbs`, colorClass: "text-primary font-bold" },
    { label: "Correction Factor (1 Unit Drops)", value: activeCF, colorClass: "text-amber-600 font-bold" }
  ];

  return {
    carbRatio,
    correctionFactorMgdl,
    correctionFactorMmol,
    basalEstimate,
    bolusEstimate,
    chartData
  };
};

export default function InsulinToCarbRatioCalculator() {
  const [tdd, setTdd] = useState<string>("40");
  const [insulinType, setInsulinType] = useState<"rapid" | "regular">("rapid");
  const [bloodSugarUnit, setBloodSugarUnit] = useState<"mgdl" | "mmol">("mgdl");
  
  const [results, setResults] = useState<InsulinResults | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleCalculate = () => {
    const d = parseFloat(tdd);
    if (isNaN(d) || d <= 0) {
      setResults(null);
      return;
    }
    const inputs: InsulinInputs = { tdd: d, insulinType, bloodSugarUnit };
    setResults(calculateInsulin(inputs));
  };

  const handleReset = () => {
    setTdd("40");
    setInsulinType("rapid");
    setBloodSugarUnit("mgdl");
    setTimeout(handleCalculate, 10);
  };

  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tdd, insulinType, bloodSugarUnit]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Insulin to Carb Ratio</title><style>body{font-family:system-ui;padding:2rem}table{width:100%;border-collapse:collapse;font-size:14px}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>`);
    w.document.write(printRef.current.innerHTML);
    w.document.write("</body></html>");
    w.document.close();
    w.print();
  };

  const faqs = [
    { question: "What is an Insulin-to-Carb Ratio (ICR)?", answer: "The Insulin-to-Carb Ratio (ICR) tells you exactly how many grams of carbohydrates will be covered (metabolized) by 1 unit of rapid-acting insulin. For example, an ICR of 1:15 means that for every 15 grams of carbohydrates you eat, you must inject 1 unit of insulin to keep your blood sugar stable." },
    { question: "What is the Rule of 500?", answer: "The Rule of 500 is a standard clinical formula used to estimate your ICR. You divide the constant '500' by your Total Daily Dose (TDD) of insulin. If you use Regular (short-acting) insulin instead of Rapid-acting analogs, the rule changes to the Rule of 450 because regular insulin has a slightly different pharmacokinetic profile." },
    { question: "What is a Correction Factor (ISF)?", answer: "The Correction Factor, or Insulin Sensitivity Factor (ISF), tells you how much your blood sugar will drop in response to 1 unit of insulin. If your pre-meal blood sugar is 250 mg/dL (too high), and your ISF is 50, you know that injecting 1 extra unit of insulin will bring your sugar down to 200 mg/dL. This is calculated using the Rule of 1800 (for Rapid) or the Rule of 1500 (for Regular)." },
    { question: "Are these numbers perfect?", answer: "No. The Rule of 500 and Rule of 1800 provide excellent physiological starting estimates. However, individual insulin resistance varies. Stress, exercise, hormones, and illness can all change how your body reacts to insulin on a given day. These calculated ratios should serve as a baseline that you and your endocrinologist fine-tune over time." }
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Insulin-to-Carb Ratio Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Insulin-to-Carb Ratio (ICR) Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start max-w-[1100px]">
          
          {/* LEFT: Inputs */}
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Total Daily Dose (TDD)</label>
                <div className="relative w-full flex items-center rounded-md border border-input bg-background overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <input
                    type="number"
                    value={tdd}
                    onChange={(e) => setTdd(e.target.value)}
                    className="w-full h-full px-3 py-1 text-base bg-transparent outline-none border-none text-foreground"
                    placeholder="Total basal + bolus units"
                  />
                  <span className="pr-3 pl-1 text-sm font-bold text-muted-foreground select-none pointer-events-none shrink-0">Units/Day</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Sum of all your long-acting and fast-acting insulin taken in 24 hours.</p>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Mealtime Insulin Type</label>
                <select
                  value={insulinType}
                  onChange={(e) => setInsulinType(e.target.value as any)}
                  className="w-full rounded-md border border-input bg-background px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                >
                  <option value="rapid">Rapid-Acting (Humalog, Novolog, Apidra)</option>
                  <option value="regular">Regular / Short-Acting (Humulin R, Novolin R)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center text-sm font-semibold text-foreground mb-1.5">Blood Sugar Unit</label>
                <div className="flex p-1 bg-secondary rounded-lg border border-border">
                  <button type="button" onClick={() => setBloodSugarUnit("mgdl")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${bloodSugarUnit === "mgdl" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>mg/dL (US)</button>
                  <button type="button" onClick={() => setBloodSugarUnit("mmol")} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${bloodSugarUnit === "mmol" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>mmol/L (UK/Can)</button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-border">
              <button type="button" onClick={handleReset} className="w-full rounded-md border border-border bg-background hover:bg-secondary text-muted-foreground h-10 transition-colors flex items-center justify-center font-bold text-sm">
                <RotateCcw className="h-4 w-4 mr-2" /> Reset
              </button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="flex flex-col gap-4">
            {results ? (
              <div ref={printRef} className="flex flex-col gap-4 animate-fade-in-up">
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* ICR Card */}
                  <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5 relative overflow-hidden shadow-sm">
                    <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-wider mb-2 text-primary">Insulin-to-Carb Ratio</div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                          1 <span className="text-xl font-bold text-muted-foreground mx-1">:</span> {Math.round(results.carbRatio)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground mt-2 leading-tight">
                        1 Unit of insulin covers exactly {Math.round(results.carbRatio)} grams of carbohydrates.
                      </div>
                    </div>
                    <Droplet className="absolute -bottom-4 -right-4 h-24 w-24 opacity-5 text-primary" />
                  </div>

                  {/* ISF Card */}
                  <div className="bg-amber-500/10 border-l-4 border-amber-500 rounded-lg p-5 relative overflow-hidden shadow-sm">
                    <div className="relative z-10">
                      <div className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-600">Correction Factor (ISF)</div>
                      <div className="flex items-baseline gap-2 mb-2">
                        <div className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                          {bloodSugarUnit === 'mgdl' ? Math.round(results.correctionFactorMgdl) : results.correctionFactorMmol.toFixed(1)}
                        </div>
                        <div className="text-lg font-bold text-muted-foreground">{bloodSugarUnit === 'mgdl' ? 'mg/dL' : 'mmol/L'}</div>
                      </div>
                      <div className="text-sm font-semibold text-muted-foreground mt-2 leading-tight">
                        1 Unit of insulin drops blood sugar by {bloodSugarUnit === 'mgdl' ? Math.round(results.correctionFactorMgdl) : results.correctionFactorMmol.toFixed(1)} points.
                      </div>
                    </div>
                    <Activity className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 text-amber-500" />
                  </div>
                </div>

                {/* Detailed Table */}
                <div className="card-calculator !p-0 border border-border bg-card shadow-sm overflow-hidden">
                  <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center">
                    <h3 className="text-sm font-bold text-foreground">Complete Pharmacokinetic Breakdown</h3>
                    <button onClick={handlePrint} className="text-muted-foreground hover:text-foreground transition-colors print:hidden" aria-label="Print Results">
                      <Printer className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-sm">
                      <tbody>
                        {results.chartData.map((row, i) => (
                          <tr key={i} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                            <td className="py-3 px-4 text-muted-foreground">{row.label}</td>
                            <td className={`py-3 px-4 text-right tabular-nums ${row.colorClass || 'font-semibold text-foreground'}`}>{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg border border-border">
                  <strong>Clinical Note:</strong> The calculations above use the <em>Rule of {insulinType === 'rapid' ? '500' : '450'}</em> for Carb Ratio and the <em>Rule of {insulinType === 'rapid' ? '1800' : '1500'}</em> for Correction Factor. These are universal starting estimates. Always verify blood sugar levels and consult your endocrinologist before making structural changes to your insulin regimen.
                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* SEO CONTENT */}
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding the Insulin-to-Carb Ratio Calculator</h2>
            <p>For individuals managing Type 1 Diabetes or insulin-dependent Type 2 Diabetes, precision is the difference between optimal health and dangerous glycemic extremes. Modern diabetes management relies heavily on Intensive Insulin Therapy (IIT), also known as "basal-bolus" therapy. This strategy mimics a healthy pancreas by providing a steady baseline of insulin (basal) and sharp spikes of insulin (bolus) specifically to cover the carbohydrates eaten at meals. To successfully bolus for a meal, you must know your exact <strong>Insulin-to-Carb Ratio (ICR)</strong>. Our calculator uses established clinical algorithms to provide you with your baseline ICR and your Insulin Sensitivity Factor (ISF).</p>

            <h2 className="text-2xl font-bold mb-3">What is Total Daily Dose (TDD)?</h2>
            <p>Every calculation regarding your insulin sensitivity stems from your Total Daily Dose. Your TDD is simply the total sum of all the insulin you inject over a 24-hour period. This includes your long-acting basal insulin (like Lantus, Levemir, or Tresiba) plus all the rapid-acting bolus insulin (like Humalog or Novolog) you took for meals and high blood sugar corrections.</p>
            <p>For example, if you take 20 units of Lantus every night, and you typically take 5 units of Humalog before breakfast, 7 units before lunch, and 8 units before dinner, your TDD is exactly 40 units (20 + 5 + 7 + 8). When you input this TDD into our calculator, the algorithm understands your body's overall systemic insulin resistance.</p>

            <h2 className="text-2xl font-bold mb-3">The Rule of 500 (Calculating ICR)</h2>
            <p>Your Insulin-to-Carb Ratio tells you how many grams of carbohydrates will be metabolized by 1 unit of insulin. The clinical standard for estimating this ratio is the <strong>Rule of 500</strong>.</p>
            <p>The math is straightforward: divide the constant number 500 by your TDD. If your TDD is 50 units, 500 ÷ 50 = 10. Your ratio is 1:10. This means for every 10 grams of carbohydrates on your plate, you must inject 1 unit of rapid-acting insulin.</p>
            <p>If you are eating a meal consisting of a sandwich and an apple containing 60 grams of total carbohydrates, you divide 60 by your ratio of 10. You need exactly 6 units of insulin to cover that specific meal. <em>Note: If you are using older Regular insulin (like Humulin R), the formula shifts slightly to the Rule of 450 to account for its slower pharmacokinetic profile.</em></p>

            <h2 className="text-2xl font-bold mb-3">The Rule of 1800 (Calculating Correction Factor)</h2>
            <p>Carbohydrates are only half the battle. What happens if your blood sugar is already high before you even sit down to eat? You must apply a "Correction Factor," also known as an Insulin Sensitivity Factor (ISF). This number tells you exactly how many points (mg/dL) your blood sugar will drop in response to 1 unit of insulin.</p>
            <p>We calculate this using the <strong>Rule of 1800</strong>. Divide 1800 by your TDD. If your TDD is 40 units, 1800 ÷ 40 = 45. Your correction factor is 45. One unit of insulin drops your blood sugar by 45 points. If your target blood sugar is 100 mg/dL, but your current reading is 190 mg/dL, you are 90 points over target. Since 1 unit drops you by 45 points, you need exactly 2 units of insulin to "correct" back to baseline.</p>

            <h2 className="text-2xl font-bold mb-3">Combining Carb Ratios and Corrections</h2>
            <p>The true power of these metrics is realized when they are combined. Imagine you are about to eat a 45-gram carbohydrate meal, but your pre-meal blood sugar is elevated at 190 mg/dL (target 100). Assuming a TDD of 40 (ICR of 1:12, ISF of 45):</p>
            <ul>
              <li><strong>Carb Coverage:</strong> 45g ÷ 12 (ICR) = 3.75 units to cover the food.</li>
              <li><strong>Correction Dose:</strong> You are 90 points high. 90 ÷ 45 (ISF) = 2.0 units to correct the high.</li>
              <li><strong>Total Bolus:</strong> 3.75 + 2.0 = <strong>5.75 units</strong> total injection required before the meal.</li>
            </ul>

            <h2 className="text-2xl font-bold mb-3">Fine-Tuning Your Baselines</h2>
            <p>It is vital to understand that the Rule of 500 and the Rule of 1800 provide <em>estimates</em> based on population averages. They are excellent, safe starting points. However, insulin resistance is fluid. If you are highly active, you may find your true ICR is 1:15 (you need less insulin). If you are stressed or sick, your ratio might drop to 1:8 (you need more insulin). Always work closely with your endocrinologist to track post-meal blood sugars and fine-tune these mathematical starting points to fit your unique biological needs.</p>
          </section>
          
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/insulin-to-carb-ratio-calculator" />
          <PopularCalculators exclude="/calculator/insulin-to-carb-ratio-calculator" />
        </div>
      </div>
    </>
  );
}
