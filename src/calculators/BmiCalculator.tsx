"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const BMICalculator = () => {
  const DEFAULTS = { height: "175", weight: "77", age: "30", gender: "male", unit: "metric" };
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [age, setAge] = useState(DEFAULTS.age);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<any>(null);

  const calculate = (hV = height, wV = weight, aV = age, uV = unit, gV = gender) => {
    let hM = parseFloat(hV), wKg = parseFloat(wV);
    const ageN = parseFloat(aV);
    if (isNaN(hM) || isNaN(wKg) || hM <= 0 || wKg <= 0) return;
    if (uV === "imperial") { hM = hM * 0.0254; wKg = wKg * 0.453592; }
    else hM = hM / 100;

    const bmi = wKg / (hM * hM);
    let category = "", color = "";
    if (bmi < 18.5) { category = "Underweight"; color = "#3b82f6"; }
    else if (bmi < 25) { category = "Normal Weight"; color = "#10b981"; }
    else if (bmi < 30) { category = "Overweight"; color = "#f59e0b"; }
    else { category = "Obese"; color = "#ef4444"; }

    const healthyLow = 18.5 * hM * hM;
    const healthyHigh = 24.9 * hM * hM;
    const weightToLose = bmi >= 25 ? wKg - healthyHigh : 0;
    const weightToGain = bmi < 18.5 ? healthyLow - wKg : 0;

    // Body fat estimate (Deurenberg formula)
    const bodyFat = (1.2 * bmi) + (0.23 * ageN) - (10.8 * (gV === "male" ? 1 : 0)) - 5.4;
    const bmr = gV === "male"
      ? 10 * wKg + 6.25 * (hM * 100) - 5 * ageN + 5
      : 10 * wKg + 6.25 * (hM * 100) - 5 * ageN - 161;

    const chartData = [
      { name: "Underweight", range: "< 18.5", value: 18.5, fill: "#3b82f6" },
      { name: "Normal", range: "18.5–24.9", value: 6.4, fill: "#10b981" },
      { name: "Overweight", range: "25–29.9", value: 4.9, fill: "#f59e0b" },
      { name: "Obese", range: "≥ 30", value: 10, fill: "#ef4444" },
    ];

    setResult({
      primary: bmi.toFixed(1),
      subtitle: `${category} — BMI of ${bmi.toFixed(1)} for ${uV === "metric" ? `${parseFloat(hV)} cm, ${parseFloat(wV)} kg` : `${parseFloat(hV)} in, ${parseFloat(wV)} lbs`}`,
      rows: [
        { label: "BMI", value: bmi.toFixed(2) },
        { label: "Category", value: category },
        { label: "Healthy BMI Range", value: "18.5 – 24.9" },
        { label: `Healthy Weight (${uV === "metric" ? "kg" : "lbs"})`, value: uV === "metric" ? `${healthyLow.toFixed(1)} – ${healthyHigh.toFixed(1)} kg` : `${(healthyLow / 0.453592).toFixed(1)} – ${(healthyHigh / 0.453592).toFixed(1)} lbs` },
        { label: "Body Fat Estimate", value: `${bodyFat.toFixed(1)}%` },
        { label: "BMR (calories/day)", value: `${bmr.toFixed(0)} kcal` },
        ...(weightToLose > 0 ? [{ label: `Weight to lose to healthy`, value: uV === "metric" ? `${weightToLose.toFixed(1)} kg` : `${(weightToLose / 0.453592).toFixed(1)} lbs` }] : []),
        ...(weightToGain > 0 ? [{ label: `Weight to gain to healthy`, value: uV === "metric" ? `${weightToGain.toFixed(1)} kg` : `${(weightToGain / 0.453592).toFixed(1)} lbs` }] : []),
      ],
      chartData, bmi, color,
      summary: [
        { label: "BMI", value: bmi.toFixed(2) },
        { label: "Category", value: category },
        { label: "Body Fat Est.", value: `${bodyFat.toFixed(1)}%` },
        { label: "BMR", value: `${bmr.toFixed(0)} kcal/day`, border: true, bold: true },
      ],
    });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => {
    setHeight(DEFAULTS.height); setWeight(DEFAULTS.weight); setAge(DEFAULTS.age);
    setGender(DEFAULTS.gender); setUnit(DEFAULTS.unit);
    calculate(DEFAULTS.height, DEFAULTS.weight, DEFAULTS.age, DEFAULTS.unit, DEFAULTS.gender);
  };

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">BMI Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px]">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {[["metric", "Metric (cm/kg)"], ["imperial", "Imperial (in/lbs)"]].map(([v, l]) => (
                  <button key={v} onClick={() => { setUnit(v); setHeight(v === "metric" ? "175" : "69"); setWeight(v === "metric" ? "77" : "170"); calculate(v === "metric" ? "175" : "69", v === "metric" ? "77" : "170", age, v, gender); }}
                    className={`flex-1 h-10 rounded-md border text-sm font-medium transition-colors ${unit === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({unit === "metric" ? "cm" : "inches"})</label>
              <div className="relative">
                <input type="number" value={height} onChange={e => setHeight(e.target.value)}
                  className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "metric" ? "175" : "69"} step="0.1" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unit === "metric" ? "cm" : "in"}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
              <div className="relative">
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                  className="h-10 w-full pl-3 pr-12 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "metric" ? "77" : "170"} step="0.1" min="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{unit === "metric" ? "kg" : "lbs"}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-base font-medium block mb-1.5">Age</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none" placeholder="30" min="2" max="120" step="1" />
              </div>
              <div>
                <label className="text-base font-medium block mb-1.5">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)}
                  className="h-10 w-full px-3 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">Calculate</button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">BMI Score</div>
                <div className="text-4xl font-bold text-primary">{result.primary}</div>
                <div className="text-sm text-muted-foreground mt-1">{result.subtitle}</div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Health Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.rows?.map((r: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              {result.chartData && (
                <div className="card-calculator !p-4 border border-border bg-card">
                  <h3 className="text-base font-semibold mb-3">BMI Categories</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={result.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} label={{ value: "BMI units", angle: -90, position: "insideLeft", fontSize: 10 }} />
                      <Tooltip formatter={(v: any) => [v, "BMI width"]} />
                      <ReferenceLine y={result.bmi} stroke={result.color} strokeWidth={2} strokeDasharray="5 3" label={{ value: `Your BMI: ${result.bmi}`, fill: result.color, fontSize: 11, position: "top" }} />
                      {result.chartData.map((d: any, i: number) => null)}
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {result.chartData.map((d: any, i: number) => (
                          <rect key={i} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Summary</h3>
                <div className="space-y-3">
                  {result.summary?.map((s: any, i: number) => (
                    <div key={i} className={`flex justify-between text-base ${s.border ? "border-t pt-3" : ""}`}>
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={`font-medium ${s.bold ? "font-bold text-primary" : ""}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </div>
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance text-[15.75px]">
            <h2>What Is a BMI Calculator?</h2>
            <p>A BMI (Body Mass Index) calculator computes a standardized score from height and weight to assess weight status relative to health guidelines. BMI is the most widely used screening tool for underweight, normal weight, overweight, and obesity in adults worldwide. This calculator uses the standard WHO BMI formula, adds an estimated body fat percentage using the Deurenberg formula, and computes your Basal Metabolic Rate (BMR) — the calories your body burns at rest.</p>
            <p>Pre-filled with a 30-year-old male at 175 cm (5&apos;9&quot;) and 77 kg (170 lbs), the calculator shows BMI = 25.1 — just above the normal-weight threshold, a common scenario for millions of adults navigating their health goals.</p>
            <h2>The BMI Formula</h2>
            <p><strong>BMI = weight (kg) / height² (m²)</strong></p>
            <p>For imperial units: BMI = 703 × weight (lbs) / height² (inches²). For our default: BMI = 77 / (1.75)² = 77 / 3.0625 = 25.14.</p>
            <p>BMI categories (WHO): Underweight: BMI &lt; 18.5. Normal weight: 18.5 – 24.9. Overweight: 25.0 – 29.9. Obese Class I: 30.0 – 34.9. Obese Class II: 35.0 – 39.9. Obese Class III: ≥ 40.0.</p>
            <h2>Body Fat Estimation</h2>
            <p>The Deurenberg formula estimates body fat from BMI, age, and sex: Body Fat % = (1.2 × BMI) + (0.23 × age) − (10.8 × sex) − 5.4, where sex = 1 for male, 0 for female. This is an approximation — DEXA scanning is the gold standard for body composition measurement.</p>
            <h2>Basal Metabolic Rate (BMR)</h2>
            <p>BMR is calculated using the Mifflin-St Jeor equation: For men: BMR = 10W + 6.25H − 5A + 5. For women: BMR = 10W + 6.25H − 5A − 161. Where W = weight in kg, H = height in cm, A = age in years. Multiply BMR by an activity factor (1.2 sedentary, 1.375 light, 1.55 moderate, 1.725 active, 1.9 very active) to get total daily calorie needs.</p>
            <h2>Limitations of BMI</h2>
            <p>BMI does not distinguish between muscle and fat mass. Athletes and bodybuilders often have high BMI despite low body fat. Elderly individuals may have normal BMI but high body fat due to muscle loss (sarcopenia). BMI also does not account for fat distribution — visceral fat (around abdominal organs) is more health-relevant than subcutaneous fat. Waist circumference greater than 102 cm (men) or 88 cm (women) indicates elevated metabolic risk independent of BMI.</p>
            <h2>Healthy Weight Range</h2>
            <p>The calculator shows your healthy weight range — the weights that correspond to BMI 18.5–24.9 at your height. For a 175 cm male: healthy range = 18.5 × 1.75² to 24.9 × 1.75² = 56.6 kg to 76.3 kg (125 to 168 lbs). Use the <a href="/calculator/calorie-calculator">calorie calculator</a> alongside BMI tracking for comprehensive weight management planning.</p>
            <h2>Tips for Using This Calculator</h2>
            <p>Toggle between metric and imperial with the unit selector — values convert automatically. Age and gender improve the body fat estimate accuracy. The BMI category chart shows your score relative to all four categories. Remember that BMI is a screening tool, not a diagnostic measure — always consult a healthcare provider for personalized health assessment. Pair with the <a href="/calculator/ideal-weight-calculator">ideal weight calculator</a> for additional reference points.</p>
          </article>
          <FAQSection faqs={[
            { question: "What BMI is considered healthy?", answer: "A BMI between 18.5 and 24.9 is classified as normal weight by the WHO. Below 18.5 is underweight; 25–29.9 is overweight; 30 and above is obese." },
            { question: "Is BMI accurate for athletes?", answer: "No. BMI overestimates body fat in muscular athletes. A bodybuilder with very low body fat can have a BMI in the obese range due to high muscle mass. Use body fat percentage measurements for athletes." },
            { question: "What is a healthy BMI for women?", answer: "The same WHO ranges apply to both men and women: 18.5–24.9 is normal weight. However, women naturally carry more body fat than men at the same BMI due to hormonal differences." },
            { question: "How does BMI differ for children?", answer: "For children and teens (ages 2–19), BMI is plotted on growth charts as BMI-for-age percentiles. Above the 95th percentile is obese; 85th–95th is overweight. Adult BMI cutoffs do not apply to children." },
            { question: "What is the BMI prime?", answer: "BMI Prime = BMI / 25. A value below 1 is underweight, 1.0 = normal weight upper limit, above 1 = overweight or obese. It normalizes BMI to the upper boundary of normal weight." },
            { question: "Does BMI account for age?", answer: "The standard BMI formula doesn't adjust for age in adults. However, body fat naturally increases with age at the same BMI, so older adults at BMI 25 may have higher body fat than younger adults at BMI 25." },
          ]} pageUrl="https://racira.com/calculator/bmi-calculator" />
          <PopularCalculators exclude="/calculator/bmi-calculator" />
        </div>
      </div>
    </>
  );
};
export default BMICalculator;
