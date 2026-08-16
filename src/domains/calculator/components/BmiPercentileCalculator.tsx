"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface PercentileResult {
  bmi: number;
  percentile: number;
  category: string;
  color: string;
  zScore: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

// CDC BMI-for-age reference medians (M) by age 2-20, boys and girls
const BOYS_M: number[] = [16.4, 15.8, 15.4, 15.2, 15.3, 15.6, 16.0, 16.5, 17.0, 17.6, 18.2, 18.8, 19.4, 20.1, 20.7, 21.3, 21.8, 22.3, 22.7];
const BOYS_S: number[] = [0.085, 0.09, 0.095, 0.10, 0.105, 0.11, 0.115, 0.12, 0.125, 0.13, 0.135, 0.14, 0.142, 0.144, 0.145, 0.145, 0.144, 0.142, 0.14];
const GIRLS_M: number[] = [16.1, 15.6, 15.3, 15.2, 15.3, 15.7, 16.2, 16.8, 17.4, 18.0, 18.6, 19.1, 19.6, 20.1, 20.5, 20.8, 21.1, 21.4, 21.7];
const GIRLS_S: number[] = [0.085, 0.09, 0.095, 0.10, 0.105, 0.11, 0.115, 0.12, 0.125, 0.13, 0.135, 0.14, 0.142, 0.144, 0.145, 0.145, 0.144, 0.142, 0.14];

function normalCdf(z: number): number {
  // Abramowitz & Stegun 7.1.26 approximation of the standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

function calcBmiPercentile(age: number, gender: string, heightCm: number, weightKg: number): PercentileResult {
  const bmi = heightCm > 0 ? weightKg / Math.pow(heightCm / 100, 2) : 0;

  const ageClamped = Math.max(2, Math.min(20, age));
  const idx = Math.round(ageClamped) - 2;
  const i = Math.max(0, Math.min(18, idx));
  const M = gender === "girl" ? GIRLS_M[i] : BOYS_M[i];
  const S = gender === "girl" ? GIRLS_S[i] : BOYS_S[i];
  const L = gender === "girl" ? -2.5 : -2.3;

  // LMS method z-score: z = ((BMI/M)^L − 1) / (L·S)
  let z: number;
  const ratio = bmi / M;
  if (ratio <= 0) {
    z = -5;
  } else {
    z = (Math.pow(ratio, L) - 1) / (L * S);
  }
  z = Math.max(-4, Math.min(4, z));
  const percentile = Math.round(normalCdf(z) * 1000) / 10;

  let category = "Healthy Weight";
  let color = "text-emerald-600";
  if (percentile >= 95) { category = "Obese"; color = "text-red-500"; }
  else if (percentile >= 85) { category = "Overweight"; color = "text-amber-500"; }
  else if (percentile < 5) { category = "Underweight"; color = "text-blue-500"; }

  const chartData = [
    { name: `Your BMI (${bmi.toFixed(1)})`, value: bmi },
    { name: "Median", value: M },
    { name: "85th Pct", value: M * (1 + 1.036 * S) },
    { name: "95th Pct", value: M * (1 + 1.645 * S) },
  ];

  return {
    bmi,
    percentile,
    category,
    color,
    zScore: z,
    chartData,
    breakdown: [
      { label: "Age", value: `${age} years` },
      { label: "Sex", value: gender === "girl" ? "Girl" : "Boy" },
      { label: "Height", value: `${heightCm} cm` },
      { label: "Weight", value: `${weightKg} kg` },
      { label: "BMI", value: bmi.toFixed(1) },
      { label: "Percentile", value: `${percentile.toFixed(1)}th` },
      { label: "Z-Score", value: z.toFixed(2) },
      { label: "Category", value: category },
    ],
    summaryStats: [
      { label: "BMI", value: bmi.toFixed(1) },
      { label: "Percentile", value: `${percentile.toFixed(1)}th` },
      { label: "Z-Score", value: z.toFixed(2) },
      { label: "Category", value: category },
      { label: "Reference Median", value: M.toFixed(1) },
      { label: "Compared to Median", value: `${bmi > M ? "+" : ""}${(bmi - M).toFixed(1)}` },
    ],
  };
}

const DEFAULTS = { age: "12", gender: "boy", height: "150", weight: "45" };

export default function BmiPercentileCalculator() {
  const [age, setAge] = useState(DEFAULTS.age);
  const [gender, setGender] = useState(DEFAULTS.gender);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [result, setResult] = useState<PercentileResult>(() => calcBmiPercentile(12, "boy", 150, 45));

  const calculate = () => setResult(calcBmiPercentile(parseFloat(age) || 0, gender, parseFloat(height) || 0, parseFloat(weight) || 0));
  const reset = () => { setAge(DEFAULTS.age); setGender(DEFAULTS.gender); setHeight(DEFAULTS.height); setWeight(DEFAULTS.weight); setResult(calcBmiPercentile(12, "boy", 150, 45)); };
  useEffect(() => { setResult(calcBmiPercentile(12, "boy", 150, 45)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "Why is BMI for children different than for adults?", answer: "In adults, BMI categories are fixed (e.g., 25+ is overweight). In children and teens, BMI changes with age and differs between boys and girls. Therefore, percentiles are used to compare a child's BMI to other children of the same age and sex." },
    { question: "What does the 85th percentile mean?", answer: "The 85th percentile means that the child's BMI is higher than 85% of other children of the same age and sex. The CDC defines 85th–94th as overweight and 95th and above as obese." },
    { question: "Is BMI a perfect measure of health?", answer: "No. BMI is a screening tool, not a diagnostic one. It does not measure body fat directly and can be influenced by muscle mass or bone structure. Always consult a pediatrician for a complete health assessment." },
    { question: "What reference data does this use?", answer: "This calculator approximates percentiles from CDC BMI-for-age growth-chart medians and standard deviations using the LMS method. It is designed for ages 2–20 and is a screening estimate, not a clinical diagnosis." },
    { question: "What is a z-score?", answer: "The z-score is how many standard deviations the child's BMI sits above or below the reference median for their age and sex. A z-score of +1 roughly corresponds to the 84th percentile; +2 to the 98th." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI Percentile Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">BMI Percentile Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Age (Years, 2–20)</label>
                <div className={inp}><input type="number" value={age} onChange={e => setAge(e.target.value)} className={ci} min={2} max={20} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Sex</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-base focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="boy">Boy</option>
                  <option value="girl">Girl</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height (cm)</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight (kg)</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} min={0} /></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 text-base transition-all shadow-sm">Calculate</button>
              <button onClick={reset} className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center" aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">BMI Percentile</div>
              <div className="text-4xl font-extrabold text-primary">{result.percentile.toFixed(1)}th</div>
              <div className={`text-base font-bold mt-1 ${result.color}`}>{result.category}</div>
              <div className="text-sm text-muted-foreground mt-1">BMI {result.bmi.toFixed(1)} for a {age}-year-old {gender === "girl" ? "girl" : "boy"}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["BMI", result.bmi.toFixed(1)], ["Z-Score", result.zScore.toFixed(2)], ["Category", result.category]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Growth Assessment</h3>
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
              <h3 className="text-base font-bold mb-4">BMI vs CDC Reference</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, "auto"]} />
                  <Tooltip formatter={(v: number) => [v, "BMI"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                    {result.chartData.map((_, i) => <Cell key={i} fill={i === 0 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.25)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
            <h2 className="text-2xl font-bold mb-3">Understanding BMI in Youth</h2>
            <p>Body Mass Index (BMI) is a measure of weight relative to height. For children and teens, BMI is age- and sex-specific and is often referred to as BMI-for-age. A BMI that is healthy at 19 could signal obesity at 10, which is why doctors plot children on percentile growth charts rather than using fixed adult cutoffs.</p>
            <h3>Why Percentiles Matter</h3>
            <p>Percentiles compare the child against the CDC reference population of the same age and sex. The 5th to 85th percentile range is considered healthy weight; 85th–94th is overweight; and 95th and above is obese. Under the 5th percentile is underweight. The goal is typically to remain in the healthy band while following the child's own growth curve.</p>
            <h3>Next Steps</h3>
            <p>If a child's BMI percentile falls outside the healthy range, it is not an immediate cause for alarm, but it is a reason to have a conversation with a healthcare provider. They can assess other factors like diet, physical activity, and family history to provide a complete picture of health.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-percentile-calculator" />
          <PopularCalculators exclude="/calculator/bmi-percentile-calculator" />
        </div>
      </div>
    </>
  );
}
