"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw, Calculator } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const fmt = (n: number, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const getPIRating = (pi: number) => {
  if (pi < 11) return { label: "Underweight", color: "#3b82f6", desc: "Below healthy range — may indicate insufficient body mass." };
  if (pi < 15) return { label: "Normal Weight", color: "#10b981", desc: "Healthy range. Optimal body proportionality." };
  if (pi < 17) return { label: "Overweight", color: "#f59e0b", desc: "Above optimal range. Consider lifestyle adjustments." };
  return { label: "Obese", color: "#ef4444", desc: "Significantly above healthy range. Elevated health risks." };
};

const PonderalIndexCalculator = () => {
  const DEFAULTS = { weight: "170", height: "70", unit: "imperial" };
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [result, setResult] = useState<any>(null);

  const calculate = (w = weight, h = height, u = unit) => {
    const W = parseFloat(w) || 0;
    const H = parseFloat(h) || 0;
    if (!W || !H || H <= 0) return;
    let wKg: number, hM: number;
    if (u === "imperial") {
      wKg = W * 0.453592;
      hM = H * 0.0254;
    } else {
      wKg = W;
      hM = H / 100;
    }
    const pi = wKg / (hM * hM * hM);
    const bmi = wKg / (hM * hM);
    const rating = getPIRating(pi);
    const chartData = [
      { name: "Underweight", range: 11, color: "#3b82f6" },
      { name: "Normal", range: 15, color: "#10b981" },
      { name: "Overweight", range: 17, color: "#f59e0b" },
      { name: "You", range: parseFloat(pi.toFixed(1)), color: rating.color },
    ];
    setResult({ W, H, wKg, hM, pi, bmi, rating, chartData, u });
  };

  useEffect(() => { calculate(); }, []);
  const reset = () => { setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setUnit(DEFAULTS.unit); calculate(DEFAULTS.weight, DEFAULTS.height, DEFAULTS.unit); };

  const faqs = [
    { question: "What is the Ponderal Index?", answer: "The Ponderal Index (PI), also called the Corpulence Index or Rohrer's Index, is a body mass measure calculated as weight divided by height cubed (kg/m³). Unlike BMI (which uses height squared), PI accounts for the three-dimensional nature of the human body and is less biased by height — making it more accurate for very tall or very short individuals." },
    { question: "What is the Ponderal Index formula?", answer: "PI = Weight (kg) / Height (m)³. For a 170 lb (77.1 kg), 5'10\" (1.778 m) person: PI = 77.1 / (1.778)³ = 77.1 / 5.619 = 13.72 kg/m³. The normal range is approximately 11–15 kg/m³." },
    { question: "How does PI differ from BMI?", answer: "BMI = weight / height² and tends to overestimate body fat in tall individuals and underestimate it in short individuals. PI = weight / height³ and is more height-independent. Studies show PI provides more consistent classifications across diverse height ranges, particularly for populations at the extremes of human height." },
    { question: "What is a healthy Ponderal Index?", answer: "Normal PI range is approximately 11–15 kg/m³. Below 11 suggests underweight. 15–17 indicates overweight. Above 17 indicates obesity. These thresholds are more stable across height ranges than BMI thresholds, which is the primary advantage of using PI." },
    { question: "When is PI used instead of BMI?", answer: "PI is commonly used in neonatal medicine to assess newborn body proportionality — it better identifies growth-restricted infants than birth weight alone. It is also used in research studying populations with extreme height variation. Some epidemiological studies prefer PI because its height-independence reduces confounding in regression models." },
    { question: "What is the neonatal Ponderal Index?", answer: "In neonatology, PI = (Birth Weight in grams × 100) / (Crown-Heel Length in cm)³. A neonatal PI below 2.0 suggests intrauterine growth restriction (IUGR). Normal neonatal PI is 2.0–3.0. Above 3.0 may indicate macrosomia (large-for-gestational-age). This is different from the adult PI formula used by this calculator." },
  ];

  const wLabel = unit === "imperial" ? "lbs" : "kg";
  const hLabel = unit === "imperial" ? "in" : "cm";

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Ponderal Index Calculator" }]} />
      <div className="container-page py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Ponderal Index Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1200px] mx-auto">
          <div className="card-calculator flex flex-col gap-5 !p-6 border border-border bg-card">
            <div>
              <label className="text-base font-medium block mb-1.5">Unit System</label>
              <div className="flex gap-2">
                {(["imperial", "metric"] as const).map((u) => (
                  <button key={u} onClick={() => { setUnit(u); calculate(weight, height, u); }} className={`flex-1 h-9 rounded-md border text-sm font-medium transition-colors capitalize ${unit === u ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
                    {u === "imperial" ? "Imperial (lbs/in)" : "Metric (kg/cm)"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Weight ({wLabel})</label>
              <div className="relative">
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "170" : "77"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{wLabel}</span>
              </div>
            </div>
            <div>
              <label className="text-base font-medium block mb-1.5">Height ({hLabel})</label>
              <div className="relative">
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="h-10 w-full px-3 pr-10 text-lg rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" placeholder={unit === "imperial" ? "70" : "178"} min="1" step="0.1" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{hLabel}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => calculate()} className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-semibold text-base flex items-center justify-center gap-2 transition-colors">
                <Calculator className="w-4 h-4" /> Calculate
              </button>
              <button onClick={reset} className="h-10 w-10 border border-border rounded-md flex items-center justify-center hover:bg-secondary transition-colors" aria-label="Reset">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Ponderal Index</div>
                <div className="text-4xl font-bold" style={{ color: result.rating.color }}>{fmt(result.pi, 1)} <span className="text-xl">kg/m³</span></div>
                <div className="text-sm text-muted-foreground mt-1">
                  <span className="font-semibold" style={{ color: result.rating.color }}>{result.rating.label}</span> — {result.rating.desc}
                </div>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {[
                    { label: "Weight", value: `${fmt(result.wKg, 1)} kg (${fmt(result.W)} ${wLabel})` },
                    { label: "Height", value: `${fmt(result.hM, 3)} m (${fmt(result.H)} ${hLabel})` },
                    { label: "Height³", value: `${fmt(result.hM * result.hM * result.hM, 3)} m³` },
                    { label: "Ponderal Index", value: `${fmt(result.pi, 2)} kg/m³` },
                    { label: "BMI (for comparison)", value: `${fmt(result.bmi, 1)} kg/m²` },
                    { label: "Category", value: result.rating.label },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.label}</td>
                      <td className="text-right font-medium">{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-4 border border-border bg-card">
                <h3 className="text-base font-semibold mb-3">PI vs Reference Thresholds</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={result.chartData} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 25]} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)} kg/m³`} />
                    <Bar dataKey="range" radius={[4, 4, 0, 0]}>
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
                    { label: "Ponderal Index", value: `${fmt(result.pi, 2)} kg/m³` },
                    { label: "BMI", value: `${fmt(result.bmi, 1)} kg/m²` },
                    { label: "Normal PI Range", value: "11.0–15.0 kg/m³" },
                    { label: "Category", value: result.rating.label, border: true, bold: true },
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

        <div className="max-w-[1200px] mx-auto mt-10">
          <AdPlaceholder className="mb-10" />
          <article className="prose-finance">
            <h2>What Is a Ponderal Index Calculator?</h2>
            <p>A Ponderal Index (PI) calculator computes the ratio of body mass to height cubed, providing a height-independent measure of body composition. Also called the Corpulence Index or Rohrer's Index, PI was developed as an improvement over BMI because it uses the cube of height rather than the square — better reflecting the three-dimensional nature of the human body. Pre-filled with 170 lbs (77.1 kg) and 70 inches (1.778 m), the Ponderal Index is approximately 13.7 kg/m³ — squarely in the normal range.</p>
            <h2>The Ponderal Index Formula</h2>
            <p><strong>PI = Weight (kg) / Height (m)³</strong></p>
            <p>For our defaults: PI = 77.1 / (1.778)³ = 77.1 / 5.619 = 13.72 kg/m³. Compare this to BMI = 77.1 / (1.778)² = 77.1 / 3.161 = 24.4 kg/m². The key difference: PI uses height cubed, making it less sensitive to height variation.</p>
            <h2>PI vs BMI: Height Independence</h2>
            <p>BMI systematically overestimates body fat in tall people and underestimates it in short people because it uses height squared rather than cubed. A 6'4" muscular athlete and a 5'2" sedentary person can have identical BMIs but vastly different body compositions. PI corrects this bias by using height cubed, which better approximates the volumetric scaling of the human body. Research by Benn (1971) demonstrated that height exponents between 2.5 and 3.0 provide the most height-independent body mass indices.</p>
            <h2>Clinical and Neonatal Applications</h2>
            <p>PI is most widely used in neonatal medicine, where it identifies asymmetric intrauterine growth restriction (IUGR) — infants who are long but thin due to placental insufficiency. The neonatal formula uses grams and centimeters: Neonatal PI = (Weight × 100) / Length³. Normal neonatal PI is 2.0–3.0. Below 2.0 indicates IUGR. Above 3.0 may indicate macrosomia (large for gestational age), common in diabetic mothers.</p>
            <h2>Reference Ranges</h2>
            <p>Adult PI categories: Below 11 kg/m³ — underweight. 11–15 kg/m³ — normal weight (optimal body proportionality). 15–17 kg/m³ — overweight. Above 17 kg/m³ — obese. These thresholds remain stable across diverse height populations, unlike BMI thresholds which require adjustment for certain ethnic groups and height ranges.</p>
            <h2>Limitations of the Ponderal Index</h2>
            <p>While PI is more height-independent than BMI, it still cannot distinguish between fat mass and lean mass. A heavily muscled bodybuilder will have a high PI despite low body fat. Neither PI nor BMI measures fat distribution — central adiposity (the most dangerous pattern) is better assessed by waist-to-height ratio or waist circumference alone. PI is less commonly used clinically than BMI, which limits comparative data across populations.</p>
          </article>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/ponderal-index-calculator" />
          <PopularCalculators exclude="/calculator/ponderal-index-calculator" />
        </div>
      </div>
    </>
  );
};

export default PonderalIndexCalculator;
