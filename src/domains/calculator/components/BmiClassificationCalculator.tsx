"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BmiResult {
  bmi: number;
  category: string;
  color: string;
  healthyRangeLow: number;
  healthyRangeHigh: number;
  weightDiff: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function calcBmiClass(weight: number, height: number, unit: "metric" | "imperial"): BmiResult {
  let w = weight;
  let h = height;
  let bmi = 0;

  if (unit === "metric" && h > 0) {
    bmi = w / Math.pow(h / 100, 2);
  } else if (unit === "imperial" && h > 0) {
    bmi = (w / Math.pow(h, 2)) * 703;
  }

  let category = "";
  let color = "";
  if (bmi < 18.5) { category = "Underweight"; color = "text-blue-500"; }
  else if (bmi < 25) { category = "Normal weight"; color = "text-emerald-600"; }
  else if (bmi < 30) { category = "Overweight"; color = "text-amber-500"; }
  else { category = "Obese"; color = "text-red-500"; }

  // Healthy weight range for this height
  let healthyRangeLow = 0;
  let healthyRangeHigh = 0;
  let weightDiff = 0;
  if (unit === "metric" && h > 0) {
    const m = h / 100;
    healthyRangeLow = 18.5 * m * m;
    healthyRangeHigh = 24.9 * m * m;
  } else if (unit === "imperial" && h > 0) {
    healthyRangeLow = (18.5 * Math.pow(h, 2)) / 703;
    healthyRangeHigh = (24.9 * Math.pow(h, 2)) / 703;
  }
  weightDiff = bmi < 18.5 ? healthyRangeLow - w : bmi > 24.9 ? w - healthyRangeHigh : 0;

  const chartData = [
    { name: "Your BMI", value: Math.round(bmi * 10) / 10 },
    { name: "Underweight ≤18.5", value: 18.5 },
    { name: "Normal ≤25", value: 25 },
    { name: "Overweight ≤30", value: 30 },
  ];

  return {
    bmi,
    category,
    color,
    healthyRangeLow,
    healthyRangeHigh,
    weightDiff,
    chartData,
    breakdown: [
      { label: "Weight", value: unit === "metric" ? `${w} kg` : `${w} lb` },
      { label: "Height", value: unit === "metric" ? `${h} cm` : `${h} in` },
      { label: "BMI", value: bmi.toFixed(1) },
      { label: "Category", value: category },
      { label: "Healthy Weight Range", value: `${healthyRangeLow.toFixed(1)}–${healthyRangeHigh.toFixed(1)} ${unit === "metric" ? "kg" : "lb"}` },
      { label: weightDiff > 0 ? "Weight Above Range" : "Weight Below Range", value: weightDiff > 0 ? `${weightDiff.toFixed(1)} ${unit === "metric" ? "kg" : "lb"} above` : weightDiff < 0 ? `${(-weightDiff).toFixed(1)} ${unit === "metric" ? "kg" : "lb"} below` : "Within healthy range" },
    ],
    summaryStats: [
      { label: "BMI", value: bmi.toFixed(1) },
      { label: "Category", value: category },
      { label: "Healthy Range Low", value: `${healthyRangeLow.toFixed(1)}` },
      { label: "Healthy Range High", value: `${healthyRangeHigh.toFixed(1)}` },
      { label: "Distance to Range", value: weightDiff === 0 ? "In range" : `${Math.abs(weightDiff).toFixed(1)} ${unit === "metric" ? "kg" : "lb"}` },
      { label: "BMI Prime", value: `${(bmi / 25).toFixed(2)}` },
    ],
  };
}

const DEFAULTS = { weight: "70", height: "175", unit: "metric" as "metric" | "imperial" };

export default function BmiClassificationCalculator() {
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [unit, setUnit] = useState<"metric" | "imperial">(DEFAULTS.unit);
  const [result, setResult] = useState<BmiResult>(() => calcBmiClass(70, 175, "metric"));

  const calculate = () => setResult(calcBmiClass(parseFloat(weight) || 0, parseFloat(height) || 0, unit));
  const reset = () => { setWeight(DEFAULTS.weight); setHeight(DEFAULTS.height); setUnit(DEFAULTS.unit); setResult(calcBmiClass(70, 175, "metric")); };
  useEffect(() => { setResult(calcBmiClass(70, 175, "metric")); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What is BMI?", answer: "BMI (Body Mass Index) is a simple calculation using a person's height and weight. The formula is BMI = kg/m², where kg is a person's weight in kilograms and m² is their height in metres squared." },
    { question: "Is BMI an accurate measure of health?", answer: "BMI is a useful screening tool but has limitations. It doesn't distinguish between muscle and fat. Athletes or bodybuilders may have a high BMI due to muscle mass, even if they have low body fat." },
    { question: "What are the standard BMI categories?", answer: "According to the WHO, the categories are: Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), and Obese (30 or greater)." },
    { question: "What is BMI Prime?", answer: "BMI Prime is BMI divided by 25 (the top of the normal range). A value below 1 means you are in the healthy range; above 1 means you are above it. It makes the 'how far am I?' question a single number." },
    { question: "How do I compute BMI in imperial units?", answer: "The imperial formula is BMI = weight (lb) × 703 ÷ height (in)². The 703 converts pounds and inches into the same kg/m² scale used in the metric formula." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "BMI Classification Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">BMI Classification Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-1 bg-background">
              <button onClick={() => setUnit("metric")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${unit === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Metric (kg/cm)</button>
              <button onClick={() => setUnit("imperial")} className={`h-9 rounded-md text-sm font-semibold transition-colors ${unit === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}>Imperial (lb/in)</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Weight ({unit === "metric" ? "kg" : "lb"})</label>
                <div className={inp}><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={ci} min={0} /></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Height ({unit === "metric" ? "cm" : "in"})</label>
                <div className={inp}><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={ci} min={0} /></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your BMI</div>
              <div className="text-4xl font-extrabold text-primary">{result.bmi.toFixed(1)}</div>
              <div className={`text-base font-bold mt-1 ${result.color}`}>{result.category}</div>
              <div className="text-sm text-muted-foreground mt-1">Healthy range: {result.healthyRangeLow.toFixed(1)}–{result.healthyRangeHigh.toFixed(1)} {unit === "metric" ? "kg" : "lb"}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["BMI", result.bmi.toFixed(1)], ["Category", result.category], ["BMI Prime", (result.bmi / 25).toFixed(2)]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Classification Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">BMI vs Category Thresholds</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
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
            <h2 className="text-2xl font-bold mb-3">Understanding BMI Classifications</h2>
            <p>While BMI is the standard tool used by the WHO and CDC to categorize body weight and health risks, it should not be the only metric you track. It does not measure body fat percentage directly or account for bone density or muscle mass.</p>
            <h3>Why Categories Matter</h3>
            <p>Falling into the Overweight or Obese categories is statistically associated with higher risks of chronic conditions like type 2 diabetes, hypertension, and cardiovascular diseases. However, a person with a 'Normal' BMI can still be unhealthy if they have high visceral fat or poor fitness levels.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/bmi-classification-calculator" />
          <PopularCalculators exclude="/calculator/bmi-classification-calculator" />
        </div>
      </div>
    </>
  );
}
