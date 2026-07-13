"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6" };
  if (bmi < 25) return { label: "Normal Weight", color: "#10b981" };
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
  if (bmi < 35) return { label: "Obese Class I", color: "#f97316" };
  if (bmi < 40) return { label: "Obese Class II", color: "#ef4444" };
  return { label: "Obese Class III", color: "#dc2626" };
};

const OverweightCalculator = () => {
  const DEFAULTS = { weight: "195", height: "68", unit: "imperial" };
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<any>(null);

  const calculate = (w = weight, h = height, u = unit) => {
    const W = parseFloat(w) || 0;
    const H = parseFloat(h) || 0;
    if (!W || !H || H <= 0) return;
    let wKg: number, hM: number;
    if (u === "imperial") { wKg = W * 0.453592; hM = H * 0.0254; } else { wKg = W; hM = H / 100; }
    const bmi = wKg / (hM * hM);
    const category = getCategory(bmi);
    const normalMaxW = 24.9 * hM * hM;
    const normalMinW = 18.5 * hM * hM;
    const overweightBy = wKg > normalMaxW ? wKg - normalMaxW : 0;
    const targetWeight = normalMaxW;
    const isOverweight = bmi >= 25;
    const overweightPct = overweightBy > 0 ? (overweightBy / normalMaxW) * 100 : 0;
    const chartData = [
      { name: "Underweight", max: 18.5, color: "#3b82f6" },
      { name: "Normal", max: 24.9, color: "#10b981" },
      { name: "Overweight", max: 29.9, color: "#f59e0b" },
      { name: "Obese I", max: 34.9, color: "#f97316" },
      { name: "Obese II", max: 39.9, color: "#ef4444" },
      { name: "Obese III", max: 45, color: "#dc2626" },
    ];
    const toUnit = (kg: number) => u === "imperial" ? kg / 0.453592 : kg;
    const wU = u === "imperial" ? "lbs" : "kg";
    setResult({ W, H, wKg, hM, bmi, category, normalMaxW, normalMinW, overweightBy, targetWeight, isOverweight, overweightPct, chartData, u, toUnit, wU });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setUnit(DEFAULTS.unit); calculate(DEFAULTS.weight, DEFAULTS.height, DEFAULTS.unit); };

  const wLabel = unit === "imperial" ? "lbs" : "kg";
  const hLabel = unit === "imperial" ? "in" : "cm";

  const faqs = [
    { question: "How do I know if I'm overweight?", answer: "A BMI of 25.0–29.9 is classified as overweight by the WHO and CDC. However, BMI alone doesn't distinguish between muscle and fat. Athletes with high muscle mass may have BMI in the 'overweight' range despite having healthy body fat levels. Waist circumference, body fat percentage, and waist-to-height ratio provide more nuanced assessments." },
    { question: "How much overweight am I?", answer: "This calculator computes how many pounds or kilograms above the 'normal weight' BMI threshold (24.9) you are. For example, at 195 lbs and 5'8\", your BMI is 29.7 — you are approximately 31 lbs above the upper threshold of normal weight (164 lbs for your height)." },
    { question: "What are the health risks of being overweight?", answer: "Being overweight (BMI 25–29.9) increases risk of type 2 diabetes, cardiovascular disease, hypertension, sleep apnea, certain cancers, osteoarthritis, and fatty liver disease. However, the 'overweight' category carries significantly lower risk than obesity (BMI 30+). Research shows that 'overweight' individuals with high cardiorespiratory fitness may have lower mortality risk than 'normal weight' sedentary individuals." },
    { question: "What weight should I target?", answer: "For most adults, a BMI of 18.5–24.9 represents a healthy range. This calculator shows your specific target weight at the upper end of normal (BMI 24.9). However, a more meaningful target considers body composition, waist circumference, metabolic health markers, and fitness level — not just scale weight." },
    { question: "Is BMI accurate for everyone?", answer: "No. BMI overestimates body fat in muscular athletes and underestimates it in elderly individuals who have lost muscle mass. It also has ethnic biases — Asian populations develop metabolic complications at lower BMIs (overweight threshold of 23 in some Asian guidelines). For a more complete picture, measure body fat percentage, waist-to-height ratio, and metabolic health markers." },
    { question: "How quickly can I safely lose weight?", answer: "A safe, sustainable rate is 1–2 lbs (0.5–1 kg) per week, achieved through a 500–1000 kcal/day deficit via reduced caloric intake and increased physical activity. Faster weight loss is associated with muscle loss, gallstones, nutritional deficiencies, and metabolic adaptation that makes long-term maintenance difficult." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Overweight Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Overweight Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {(["imperial", "metric"] as const).map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(weight, height, u); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors ${unit === u ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {u === "imperial" ? "Imperial (lbs/in)" : "Metric (kg/cm)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weight ({wLabel})</label>
              <div className="relative">
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "195" : "88"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{wLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({hLabel})</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "68" : "173"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{hLabel}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className={`border-l-4 rounded-lg p-4 ${result.isOverweight ? "bg-amber-500/10 border-amber-500" : "bg-green-500/10 border-green-500"}`}>
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Weight Assessment</div>
                <div className="text-4xl font-bold" style={{ color: result.category.color }}>
                  {result.isOverweight ? `${fmt(result.toUnit(result.overweightBy), 1)} ${result.wU} overweight` : "Not Overweight"}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  BMI: <span className="font-semibold text-foreground">{fmt(result.bmi, 1)}</span> — <span className="font-semibold" style={{ color: result.category.color }}>{result.category.label}</span>
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Weight Analysis</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Current Weight", value: `${fmt(result.toUnit(result.wKg), 1)} ${result.wU}` },
                    { label: "Height", value: `${fmt(result.H)} ${hLabel}` },
                    { label: "BMI", value: fmt(result.bmi, 1) },
                    { label: "Category", value: result.category.label },
                    { label: "Normal Weight Range", value: `${fmt(result.toUnit(result.normalMinW), 0)}–${fmt(result.toUnit(result.normalMaxW), 0)} ${result.wU}` },
                    { label: "Target Weight (BMI 24.9)", value: `${fmt(result.toUnit(result.targetWeight), 1)} ${result.wU}` },
                    ...(result.isOverweight ? [
                      { label: "Amount Overweight", value: `${fmt(result.toUnit(result.overweightBy), 1)} ${result.wU}` },
                      { label: "Overweight By (%)", value: `${fmt(result.overweightPct, 1)}%` },
                      { label: "Est. Time to Target (1 lb/wk)", value: `~${Math.ceil(result.toUnit(result.overweightBy))} weeks` },
                    ] : [{ label: "Status", value: "Within healthy weight range ✓" }]),
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">BMI Categories</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 50]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `BMI ${Number(v).toFixed(1)}`} />
                    <ReferenceLine y={result.bmi} stroke="#000" strokeDasharray="4 2" label={{ value: `You: ${fmt(result.bmi, 1)}`, position: "insideTopRight", fontSize: 10 }} />
                    <Bar dataKey="max" radius={[4, 4, 0, 0]}>
                      {result.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "BMI", value: fmt(result.bmi, 1) },
                    { label: "Category", value: result.category.label },
                    { label: "Target Weight", value: `${fmt(result.toUnit(result.targetWeight), 0)} ${result.wU}` },
                    { label: result.isOverweight ? "Amount to Lose" : "Status", value: result.isOverweight ? `${fmt(result.toUnit(result.overweightBy), 1)} ${result.wU}` : "Healthy ✓", border: true, bold: true },
                  ].map((s: any, i) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.bold ? "font-bold text-primary" : "font-medium"}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">What Is an Overweight Calculator?</h2>
            <p>An overweight calculator determines whether your current weight exceeds the healthy BMI range (18.5–24.9) for your height, and if so, calculates exactly how much excess weight you carry. Pre-filled with 195 lbs and 5'8" (68 inches), the BMI is 29.7 — classified as overweight, with approximately 31 lbs above the upper threshold of normal weight for this height.</p>
            <h2 className="text-2xl font-bold mb-3">Understanding the Results</h2>
            <p>The calculator shows your current BMI, normal weight range for your height, target weight (at BMI 24.9), and the exact amount you need to lose to reach the upper boundary of normal weight. The bar chart visually compares your BMI against all six WHO weight categories, with your position marked as a reference line.</p>
            <h2 className="text-2xl font-bold mb-3">BMI Categories (WHO Classification)</h2>
            <p>Underweight: BMI below 18.5. Normal weight: 18.5–24.9. Overweight: 25.0–29.9. Obese Class I: 30.0–34.9. Obese Class II: 35.0–39.9. Obese Class III (morbid): 40.0+. Each category carries progressively higher risk of metabolic disease, cardiovascular events, and reduced life expectancy — though individual health context matters enormously.</p>
            <h2 className="text-2xl font-bold mb-3">Health Risks of Overweight Status</h2>
            <p>Being overweight increases risk of: type 2 diabetes (2–3x), hypertension (2x), coronary heart disease (1.5x), stroke, certain cancers (breast, colon, kidney), osteoarthritis, sleep apnea, gallbladder disease, and fatty liver disease. However, research shows that cardiovascular fitness significantly modifies these risks — a fit overweight person may have lower mortality than an unfit normal-weight person (the "fat but fit" phenomenon).</p>
            <h2 className="text-2xl font-bold mb-3">BMI Limitations and Alternatives</h2>
            <p>BMI cannot distinguish muscle from fat. Muscular athletes routinely register as "overweight" or "obese" by BMI while having healthy or athletic body fat percentages. For a more complete assessment, combine BMI with: waist-to-height ratio (WHtR &lt; 0.5 is healthy), body fat percentage (Navy method, DEXA), metabolic health markers (blood pressure, fasting glucose, lipid panel), and cardiorespiratory fitness level.</p>
            <h2 className="text-2xl font-bold mb-3">Evidence-Based Weight Loss Strategies</h2>
            <p>For sustainable weight loss: create a moderate caloric deficit of 500–750 kcal/day (yields ~1–1.5 lbs/week loss). Prioritize protein intake (1.2–1.6 g/kg body weight) to preserve lean mass. Engage in both aerobic exercise (150+ minutes/week) and resistance training (2–3 sessions/week). Focus on whole foods, adequate sleep (7–9 hours), and stress management. Avoid extreme diets that promise rapid results — they typically result in muscle loss and metabolic adaptation that makes long-term weight maintenance extremely difficult.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/overweight-calculator" />
          <PopularCalculators exclude="/calculator/overweight-calculator" />
        </div>
      </div>
    </>
  );
};

export default OverweightCalculator;
