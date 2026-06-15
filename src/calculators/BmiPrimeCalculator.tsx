"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from "recharts";

interface BmiPrimeResult {
  bmi: number;
  bmiPrime: number;
  category: string;
  categoryColor: string;
  percentageOffset: number;
  offsetDirection: string;
  breakdown: { label: string; value: string }[];
  chartData: { category: string; span: number; min: number; max: number; color: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBmiPrime(weightKg: number, heightCm: number, isAsian: boolean): BmiPrimeResult {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  
  // Upper limit of normal BMI is 25 for standard populations, 23 for Asian populations
  const upperLimit = isAsian ? 23 : 25;
  const bmiPrime = bmi / upperLimit;

  let category = "", categoryColor = "";
  // The thresholds for BMI Prime are mathematically:
  // Underweight: < 18.5/25 = 0.74 (Standard) or 18.5/23 = 0.80 (Asian)
  const underweightThreshold = 18.5 / upperLimit;
  // Overweight: > 25/25 = 1.0 (Standard) or 23/23 = 1.0 (Asian)
  const overweightThreshold = 1.0;
  // Obese: > 30/25 = 1.2 (Standard) or 27.5/23 = 1.2 (Asian)
  const obeseThreshold = isAsian ? (27.5 / 23) : 1.2;

  if (bmiPrime < underweightThreshold) {
    category = "Underweight"; categoryColor = "#3b82f6";
  } else if (bmiPrime <= overweightThreshold) {
    category = "Optimal (Healthy)"; categoryColor = "#22c55e";
  } else if (bmiPrime < obeseThreshold) {
    category = "Overweight"; categoryColor = "#f59e0b";
  } else {
    category = "Obese"; categoryColor = "#ef4444";
  }

  // Calculate percentage offset from optimal
  // BMI Prime = 1.0 means you are exactly at the upper limit (100%)
  const percentageOffset = Math.abs((bmiPrime - 1.0) * 100);
  let offsetDirection = bmiPrime === 1.0 ? "at upper limit" : bmiPrime > 1.0 ? "above optimal limit" : "below optimal limit";
  if (bmiPrime < 1.0 && bmiPrime > underweightThreshold) {
    offsetDirection = "below upper limit (healthy)";
  }

  const breakdown = [
    { label: "Standard BMI", value: bmi.toFixed(1) },
    { label: "Upper Limit BMI Used", value: `${upperLimit}` },
    { label: "Calculated BMI Prime", value: bmiPrime.toFixed(2) },
    { label: "Clinical Category", value: category },
    { label: "Variance from Upper Limit", value: `${percentageOffset.toFixed(1)}% ${offsetDirection}` },
  ];

  const summaryStats = [
    { label: "BMI Prime", value: bmiPrime.toFixed(2) },
    { label: "Standard BMI", value: bmi.toFixed(1) },
    { label: "Status", value: category },
    { label: "Threshold", value: `BMI ${upperLimit}` },
  ];

  const chartData = [
    { category: "Under", min: 0.5, max: underweightThreshold, span: underweightThreshold - 0.5, color: "#3b82f6" },
    { category: "Optimal", min: underweightThreshold, max: overweightThreshold, span: overweightThreshold - underweightThreshold, color: "#22c55e" },
    { category: "Over", min: overweightThreshold, max: obeseThreshold, span: obeseThreshold - overweightThreshold, color: "#f59e0b" },
    { category: "Obese", min: obeseThreshold, max: obeseThreshold + 0.5, span: 0.5, color: "#ef4444" },
  ];

  return { bmi, bmiPrime, category, categoryColor, percentageOffset, offsetDirection, breakdown, chartData, summaryStats };
}

export default function BmiPrimeCalculator() {
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("175");
  const [isAsian, setIsAsian] = useState("false");
  const [result, setResult] = useState<BmiPrimeResult | null>(null);

  const calculate = () => {
    const w = parseFloat(weight), h = parseFloat(height);
    if (w > 0 && h > 0) setResult(calcBmiPrime(w, h, isAsian === "true"));
  };

  useEffect(() => { setResult(calcBmiPrime(75, 175, false)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const suf = "pr-3 text-sm text-muted-foreground shrink-0";

  const faqs = [
    { question: "What is BMI Prime?", answer: "BMI Prime is a simple ratio that compares your actual Body Mass Index (BMI) against the upper limit of the optimal healthy BMI range (which is typically 25). It was developed to make BMI easier to understand. Instead of trying to remember arbitrary numbers, BMI Prime expresses your weight as a fraction of your maximum healthy weight. A BMI Prime of 1.0 means you are exactly at the upper limit of a healthy weight." },
    { question: "How do you calculate BMI Prime?", answer: "The mathematical formula is extremely simple: BMI Prime = Actual BMI / 25. For example, if your calculated BMI is 27.5, your BMI Prime is 27.5 / 25 = 1.10. This number instantly tells you that you are 10% over the maximum healthy weight limit for your height." },
    { question: "What is a good BMI Prime score?", answer: "A healthy, optimal BMI Prime score falls between 0.74 and 1.0. If your score drops below 0.74, you are clinically underweight. If your score is above 1.0, you are overweight. If your score exceeds 1.20, you fall into the obese category. The ultimate goal is to keep your BMI Prime below 1.0." },
    { question: "Why is there an option for Asian ethnicity?", answer: "Extensive medical research has shown that individuals of South Asian and East Asian descent tend to accumulate dangerous visceral fat and develop metabolic diseases (like type 2 diabetes) at much lower BMIs than Caucasian populations. Consequently, the World Health Organization (WHO) lowered the 'upper limit' of a healthy BMI for Asian populations from 25 to 23. This calculator adjusts the BMI Prime denominator to 23 to accurately reflect this clinical reality." },
    { question: "Why is BMI Prime better than regular BMI?", answer: "Regular BMI uses an arbitrary scale (e.g., 18.5 to 24.9) that means nothing to the average person without referencing a chart. BMI Prime converts that abstract scale into a percentage. If your BMI Prime is 1.15, you instantly know without checking any charts that you are carrying 15% more mass than the maximum healthy limit. It makes setting weight loss goals significantly more intuitive." },
    { question: "What are the limitations of BMI Prime?", answer: "Because BMI Prime is derived directly from regular BMI, it shares all of the exact same flaws. It only measures total mass relative to height; it cannot distinguish between fat tissue and muscle tissue. A highly trained, heavily muscled athlete might have a BMI Prime of 1.15, indicating they are '15% overweight', when in reality that extra 15% is pure muscle mass. It is a screening tool, not a diagnostic one." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI Prime Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">BMI Prime Calculator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px] mx-auto">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} /><span className={suf}>kg</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} /><span className={suf}>cm</span></div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">WHO Population Standard</label>
              <div className="grid grid-cols-2 gap-2">
                {[["false", "Standard (Limit: 25)"], ["true", "Asian (Limit: 23)"]].map(([v, l]) => (
                  <button key={v} onClick={() => setIsAsian(v)} className={`h-10 rounded-md border text-sm font-medium transition-colors ${isAsian === v ? "bg-primary text-primary-foreground border-primary shadow-sm" : "border-border bg-background hover:bg-secondary"}`}>{l}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Asian populations face elevated metabolic risks at lower BMIs.</p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">
                <Calculator className="h-4 w-4" /> Calculate BMI Prime
              </button>
              <button onClick={() => { setWeight("75"); setHeight("175"); setIsAsian("false"); setResult(calcBmiPrime(75, 175, false)); }} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="rounded-lg p-5 shadow-sm border-l-4" style={{ backgroundColor: `${result.categoryColor}15`, borderColor: result.categoryColor }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: result.categoryColor }}>BMI Prime Score</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-extrabold text-foreground tracking-tight">{result.bmiPrime.toFixed(2)}</div>
                </div>
                <div className="text-sm font-semibold mt-1" style={{ color: result.categoryColor }}>{result.category}: You are {result.percentageOffset.toFixed(1)}% {result.offsetDirection}.</div>
              </div>
              
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card shadow-sm">
                {[["Standard BMI", result.bmi.toFixed(1)], ["Target Limit", `1.0 Prime`], ["Variance", `${result.percentageOffset.toFixed(1)}%`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-lg font-bold">{v}</div>
                  </div>
                ))}
              </div>
              
              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 2 ? "font-bold text-foreground border-t-2 border-border" : ""}`}>
                      <td className="py-2.5 text-muted-foreground">{r.label}</td>
                      <td className="py-2.5 text-right font-semibold">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>

              <div className="card-calculator !p-5 border border-border bg-card shadow-sm">
                <h3 className="text-base font-bold mb-4">BMI Prime Spectrum</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0.5, 1.7]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={50} />
                    <Tooltip formatter={(v: any, n: any, p: any) => [`${p.payload.min.toFixed(2)} – ${p.payload.max.toFixed(2)}`, "Prime Range"]} />
                    <ReferenceLine x={result.bmiPrime} stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" label={{ value: `You: ${result.bmiPrime.toFixed(2)}`, position: "insideTopRight", fontSize: 11, fill: "#6366f1" }} />
                    <ReferenceLine x={1.0} stroke="#22c55e" strokeWidth={1} label={{ value: `Limit (1.0)`, position: "insideBottomRight", fontSize: 10, fill: "#22c55e" }} />
                    <Bar dataKey="span" radius={[0, 4, 4, 0]}>{result.chartData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-muted-foreground mt-3 text-center">A score of 1.0 represents the exact upper boundary of a healthy weight.</p>
              </div>

              <div className="bg-muted/30 rounded-lg p-5">
                <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                  {result.summaryStats.map((s, i) => (
                    <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        
        <div className="max-w-[1180px] mx-auto mt-12">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance max-w-none">
            <h2>What Is BMI Prime?</h2>
            <p>The standard Body Mass Index (BMI) is a cornerstone of global preventative medicine, but it suffers from a major psychological flaw: the numbers mean absolutely nothing without referencing a medical chart. If a doctor tells a patient their BMI is 27.3, the patient doesn't intuitively know if that is slightly overweight or dangerously obese. They have to memorize that 25 is the cutoff for "normal" and 30 is the cutoff for "obese."</p>
            <p>To solve this communication barrier, medical researchers developed <strong>BMI Prime</strong>. BMI Prime is a simple mathematical ratio that converts your standard BMI into a fraction of your maximum optimal weight. Instead of dealing with abstract medical scales, BMI Prime expresses your body mass as a clean, intuitive percentage relative to the upper boundary of health.</p>

            <h2>How The Calculations Work</h2>
            <p>The mathematics behind a BMI Prime Calculator are elegantly simple, requiring only two steps.</p>
            <p>First, the calculator determines your standard <strong>Body Mass Index</strong> using the universal formula: <code>Weight in Kilograms / (Height in Meters)²</code>.</p>
            <p>Second, it calculates your <strong>BMI Prime Ratio</strong> by dividing your standard BMI by the upper limit of the optimal healthy BMI range. For the vast majority of the global population, the World Health Organization sets this upper optimal limit at a BMI of 25. Therefore, the formula is: <code>BMI Prime = Actual BMI / 25</code>.</p>

            <h3>The Asian Population Adjustment</h3>
            <p>Extensive clinical research has proven that individuals of East Asian and South Asian descent accumulate visceral fat and develop metabolic diseases (such as type 2 diabetes and hypertension) at much lower body weights than Caucasian populations. Because of this genetic difference, the WHO recommends lowering the upper healthy limit for these populations from 25 to 23. If you select the Asian population standard on this calculator, the formula dynamically shifts to: <code>BMI Prime = Actual BMI / 23</code>.</p>

            <h2>Interpreting Your BMI Prime Score</h2>
            <p>The power of BMI Prime lies in its instant readability. The number 1.0 represents the exact upper boundary of a healthy weight. Any number above 1.0 represents the exact percentage of excess mass you are carrying.</p>
            
            <h3>Score &lt; 0.74: Underweight</h3>
            <p>If your score falls below 0.74 (or 0.80 for the Asian standard), you are clinically underweight. Your body mass is less than 74% of the maximum optimal limit. Being underweight carries significant health risks, including osteoporosis, a compromised immune system, and hormonal imbalances.</p>

            <h3>Score 0.74 to 1.0: Optimal (Healthy)</h3>
            <p>This is the medical gold standard. If your score is 0.90, it means you are utilizing 90% of your maximum healthy weight limit, leaving a 10% buffer before you cross into the overweight category. Staying within this range is statistically correlated with the lowest risk of all-cause mortality and chronic disease.</p>

            <h3>Score 1.01 to 1.20: Overweight</h3>
            <p>If your score is 1.15, you don't need to reference a chart to understand what it means. It mathematically proves that you are carrying 15% more mass than the maximum healthy limit for your height. This is a crucial early warning stage where implementing dietary changes and cardiovascular exercise can quickly reverse the trend before long-term metabolic damage occurs.</p>

            <h3>Score &gt; 1.20: Obese</h3>
            <p>If your score exceeds 1.20, you are carrying over 20% more mass than the clinical upper limit of health. At this stage, the mechanical stress on your joints and the metabolic stress on your heart and liver increase exponentially. A score above 1.20 strongly warrants a consultation with a medical professional to develop a safe, sustainable weight loss strategy.</p>

            <h2>Understanding Your Results Dashboard</h2>
            <p>When you execute a calculation, this tool provides five distinct analytical sections designed to give you total visibility into your body composition.</p>
            <p><strong>Primary Score Card:</strong> This boldly displays your calculated BMI Prime ratio (e.g., 1.12), immediately color-coded for fast comprehension (Green for optimal, Orange for overweight, Red for obese).</p>
            <p><strong>3-Stat Diagnostic Bar:</strong> This section clearly defines your standard BMI alongside your BMI Prime, and explicitly states your percentage variance (e.g., "12.0% above optimal limit").</p>
            <p><strong>Calculation Breakdown Table:</strong> A transparent, line-by-line accounting that tracks exactly which upper limit was used (25 vs 23) and how the final ratio was generated.</p>
            <p><strong>BMI Prime Spectrum Chart:</strong> A visual horizontal bar chart that maps the clinical thresholds (Underweight, Optimal, Overweight, Obese), placing a precise marker exactly where your BMI Prime score sits on that spectrum. It clearly illustrates how far you are from the safety of the 1.0 limit.</p>

            <h2>The Benefits of Using BMI Prime</h2>
            <p>The primary benefit of BMI Prime is its psychological impact on goal setting. Telling someone they need to drop their BMI from 28.5 to 24.9 feels abstract and overwhelming. Telling someone their BMI Prime is 1.14 (meaning they are 14% over their limit), and their goal is to simply get that number below 1.0, gives them a concrete, percentage-based target to track.</p>
            <p>It provides a universal language for weight management. A 5-foot-tall woman and a 6-foot-tall man can compare their BMI Prime scores instantly. If they both have a score of 1.08, they are both exactly 8% over their respective optimal weight limits, despite having vastly different heights and raw weights.</p>

            <h2>Critical Limitations</h2>
            <p>Because BMI Prime is derived directly from the standard BMI formula, it inherits all of the exact same clinical limitations.</p>
            <p><strong>It cannot measure body fat.</strong> The formula only registers total mass relative to height. It assumes all mass is identical. If you are a dedicated weightlifter, a collegiate sprinter, or someone who performs heavy manual labor, your dense muscle tissue will increase your total mass. You may register a BMI Prime of 1.15 (15% Overweight), but that 15% excess mass may be pure, healthy muscle tissue.</p>
            <p><strong>It ignores fat distribution.</strong> Two people can have a perfect optimal BMI Prime of 0.95. One person may store their fat evenly across their subcutaneous layer (safe fat), while the other may store a small amount of fat exclusively around their waist, wrapping around their organs (dangerous visceral fat). The person with visceral fat is at a much higher risk for heart disease, despite having a "perfect" BMI Prime score.</p>
            <p>BMI Prime is an exceptional public health screening tool and a fantastic starting point for personal goal setting, but it should always be contextualized with other metrics like waist circumference, body fat percentage, and overall cardiovascular fitness.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-prime-calculator" />
          <PopularCalculators exclude="/calculator/bmi-prime-calculator" />
        </div>
      </div>
    </>
  );
}
