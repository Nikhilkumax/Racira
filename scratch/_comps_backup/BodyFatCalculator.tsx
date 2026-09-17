"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface BodyFatResult {
  bodyFat: number;
  category: string;
  fatMass: number;
  leanMass: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// US Navy method for body fat estimation
const calcNavyBodyFat = (gender: string, waist: number, neck: number, height: number, hip: number) => {
  if (gender === "male") {
    return 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  }
  return 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
};

const getCategory = (bf: number, gender: string) => {
  if (gender === "male") {
    if (bf < 6) return "Essential Fat";
    if (bf < 14) return "Athletes";
    if (bf < 18) return "Fitness";
    if (bf < 25) return "Average";
    return "Obese";
  }
  if (bf < 14) return "Essential Fat";
  if (bf < 21) return "Athletes";
  if (bf < 25) return "Fitness";
  if (bf < 32) return "Average";
  return "Obese";
};

function calcBodyFat(gender: "male" | "female", weight: number, heightCm: number, waist: number, neck: number, hip: number): BodyFatResult {
  const w = weight;
  const h = heightCm;
  const rawBf = calcNavyBodyFat(gender, waist, neck, h, hip);
  const bodyFat = Math.max(0, Math.round(rawBf * 10) / 10);
  const fatMass = Math.round(w * bodyFat / 100 * 10) / 10;
  const leanMass = Math.round((w - fatMass) * 10) / 10;

  return {
    bodyFat,
    category: getCategory(bodyFat, gender),
    fatMass,
    leanMass,
    chartData: [
      { name: "Fat Mass", value: fatMass },
      { name: "Lean Mass", value: leanMass },
    ],
    breakdown: [
      { label: "Gender", value: gender === "male" ? "Male" : "Female" },
      { label: "Weight", value: `${w} kg` },
      { label: "Height", value: `${h} cm` },
      { label: "Waist", value: `${waist} cm` },
      { label: "Neck", value: `${neck} cm` },
      { label: "Hip", value: gender === "female" ? `${hip} cm` : "—" },
      { label: "Body Fat", value: `${bodyFat}%` },
      { label: "Category", value: getCategory(bodyFat, gender) },
      { label: "Fat Mass", value: `${fatMass} kg` },
      { label: "Lean Body Mass", value: `${leanMass} kg` },
    ],
    summaryStats: [
      { label: "Body Fat", value: `${bodyFat}%` },
      { label: "Category", value: getCategory(bodyFat, gender) },
      { label: "Fat Mass", value: `${fatMass} kg` },
      { label: "Lean Mass", value: `${leanMass} kg` },
      { label: "Fat-Free Mass Index", value: `${(leanMass / Math.pow(h / 100, 2)).toFixed(1)}` },
      { label: "Method", value: "US Navy" },
    ],
  };
}

const DEFAULTS = { gender: "male" as "male" | "female", weight: "70", height: "170", waist: "80", neck: "37", hip: "95" };

export default function BodyFatCalculator() {
  const [gender, setGender] = useState<"male" | "female">(DEFAULTS.gender);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [heightCm, setHeightCm] = useState(DEFAULTS.height);
  const [waist, setWaist] = useState(DEFAULTS.waist);
  const [neck, setNeck] = useState(DEFAULTS.neck);
  const [hip, setHip] = useState(DEFAULTS.hip);
  const [result, setResult] = useState<BodyFatResult>(() => calcBodyFat("male", 70, 170, 80, 37, 95));

  const calculate = () => setResult(calcBodyFat(gender, parseFloat(weight) || 0, parseFloat(heightCm) || 0, parseFloat(waist) || 0, parseFloat(neck) || 0, parseFloat(hip) || 0));
  const reset = () => { setGender(DEFAULTS.gender); setWeight(DEFAULTS.weight); setHeightCm(DEFAULTS.height); setWaist(DEFAULTS.waist); setNeck(DEFAULTS.neck); setHip(DEFAULTS.hip); setResult(calcBodyFat("male", 70, 170, 80, 37, 95)); };
  useEffect(() => { setResult(calcBodyFat("male", 70, 170, 80, 37, 95)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";
  const COLORS = ["#2563eb", "#16a34a"];

  const faqs = [
    { question: "What is the US Navy body fat formula?", answer: "The US Navy method estimates body fat using circumference measurements. For men: neck and waist. For women: neck, waist, and hip. It correlates well with hydrostatic weighing (within 1–3% accuracy)." },
    { question: "What is a healthy body fat percentage?", answer: "For men: 10–20% is healthy, with athletes at 6–13%. For women: 18–28% is healthy, with athletes at 14–20%. Essential fat is 2–5% for men and 10–13% for women." },
    { question: "How do I measure my waist correctly?", answer: "Measure at the narrowest point of your waist (usually at the navel level for men). Stand relaxed, don't suck in, and measure after a normal exhale. Use a flexible tape measure." },
    { question: "Is body fat percentage better than BMI?", answer: "Yes, body fat percentage is a better indicator of health and fitness than BMI because it directly measures fat. BMI can misclassify muscular individuals as overweight." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Body Fat Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Body Fat Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              <button onClick={() => setGender("male")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${gender === "male" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Male</button>
              <button onClick={() => setGender("female")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${gender === "female" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Female</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">kg</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height</label>
                <div className={inp}><input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Waist Circumference</label>
                <div className={inp}><input type="number" value={waist} onChange={e => setWaist(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Neck Circumference</label>
                <div className={inp}><input type="number" value={neck} onChange={e => setNeck(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
              </div>
              {gender === "female" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Hip Circumference</label>
                  <div className={inp}><input type="number" value={hip} onChange={e => setHip(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">cm</span></div>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset"><RotateCcw className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Body Fat Percentage</div>
              <div className="text-4xl font-extrabold text-primary">{result.bodyFat}%</div>
              <div className="text-base font-bold mt-1 text-foreground">{result.category}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.fatMass} kg fat · {result.leanMass} kg lean mass</div>
            </div>
            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Fat Mass", `${result.fatMass} kg`], ["Lean Mass", `${result.leanMass} kg`], ["Category", result.category]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Measurement Breakdown</h3>
              <table className="w-full text-base"><tbody>
                {result.breakdown.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-muted-foreground">{r.label}</td>
                    <td className="py-2.5 text-right font-semibold">{r.value}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Body Composition</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={result.chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {result.chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} kg`]} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-sm">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#2563eb]" />Fat Mass ({Math.round((result.fatMass / (result.fatMass + result.leanMass)) * 100)}%)</div>
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-[#16a34a]" />Lean Mass ({Math.round((result.leanMass / (result.fatMass + result.leanMass)) * 100)}%)</div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-5">
              <h3 className="text-base font-bold mb-4">Summary Statistics</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-base">
                {result.summaryStats.map((s, i) => (
                  <div key={i} className="flex justify-between"><span className="text-muted-foreground">{s.label}:</span><span className="font-semibold">{s.value}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Understanding Body Fat Percentage</h2>
            <p>Body fat percentage is the proportion of your total body weight that is fat tissue. It's a better indicator of health and fitness than weight alone, as it distinguishes between fat mass and lean mass (muscle, bone, water, organs).</p>
            <h2 className="text-2xl font-bold mb-3">US Navy Body Fat Formula</h2>
            <p><strong>Men:</strong> BF% = 495 / (1.0324 − 0.19077 × log₁₀(waist − neck) + 0.15456 × log₁₀(height)) − 450</p>
            <p><strong>Women:</strong> BF% = 495 / (1.29579 − 0.35004 × log₁₀(waist + hip − neck) + 0.22100 × log₁₀(height)) − 450</p>
            <p>This method is validated against hydrostatic weighing and is accurate to within 1–3% for most individuals.</p>
            <h2 className="text-2xl font-bold mb-3">Body Fat Categories</h2>
            <table className="w-full text-sm mb-4">
              <thead><tr><th className="text-left py-1">Category</th><th className="text-right">Men</th><th className="text-right">Women</th></tr></thead>
              <tbody>
                <tr><td>Essential Fat</td><td className="text-right">2–5%</td><td className="text-right">10–13%</td></tr>
                <tr><td>Athletes</td><td className="text-right">6–13%</td><td className="text-right">14–20%</td></tr>
                <tr><td>Fitness</td><td className="text-right">14–17%</td><td className="text-right">21–24%</td></tr>
                <tr><td>Average</td><td className="text-right">18–24%</td><td className="text-right">25–31%</td></tr>
                <tr><td>Obese</td><td className="text-right">25%+</td><td className="text-right">32%+</td></tr>
              </tbody>
            </table>
            <h2 className="text-2xl font-bold mb-3">How to Reduce Body Fat</h2>
            <ul>
              <li>Maintain a moderate caloric deficit (300–500 calories below TDEE)</li>
              <li>Prioritize protein intake (1.6–2.2g per kg bodyweight)</li>
              <li>Strength train 3–4× per week to preserve muscle</li>
              <li>Get 7–9 hours of sleep for optimal hormone balance</li>
              <li>Manage stress — cortisol promotes fat storage, especially visceral fat</li>
            </ul>
            <p className="text-xs mt-8 p-3 bg-secondary rounded-lg"><strong>Disclaimer:</strong> The US Navy method provides estimates. For precise measurements, consider DEXA scans, hydrostatic weighing, or Bod Pod testing. Consult a healthcare professional.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/body-fat-calculator" />
          <PopularCalculators exclude="/calculator/body-fat-calculator" />
        </div>
      </div>
    </>
  );
}
