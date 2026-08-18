"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import FAQSection from "@/components/FAQSection";
import PopularCalculators from "@/components/PopularCalculators";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface OwResult {
  overweightPct: number;
  idealWeight: number;
  excess: number;
  bmi: number;
  category: string;
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
  chartData: { name: string; value: number; fill: string }[];
}

function fmt(v: number, d = 1): string {
  return v.toLocaleString("en-US", { maximumFractionDigits: d });
}

function calcOw(sex: string, heightCm: number, weightKg: number): OwResult {
  // Ideal weight: Devine formula — men 50 kg + 0.9 kg per cm over 152.4; women 45.5 + 0.9
  const base = sex === "male" ? 50 : 45.5;
  const idealWeight = base + 0.9 * Math.max(0, heightCm - 152.4);
  const excess = weightKg - idealWeight;
  const overweightPct = idealWeight > 0 ? (excess / idealWeight) * 100 : 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal weight" : bmi < 30 ? "Overweight" : bmi < 35 ? "Obese (Class I)" : bmi < 40 ? "Obese (Class II)" : "Obese (Class III)";
  const breakdown = [
    { label: "Sex", value: sex === "male" ? "Male" : "Female" },
    { label: "Height", value: `${fmt(heightCm, 0)} cm` },
    { label: "Actual Weight", value: `${fmt(weightKg)} kg` },
    { label: "Ideal Weight (Devine)", value: `${fmt(idealWeight)} kg` },
    { label: "Excess Weight", value: `${fmt(excess)} kg` },
    { label: "Overweight Percentage", value: `${fmt(overweightPct)}%` },
    { label: "BMI", value: `${fmt(bmi)} kg/m²` },
    { label: "BMI Category", value: category },
  ];
  const summaryStats = [
    { label: "Overweight %", value: `${fmt(overweightPct)}%` },
    { label: "Ideal Weight", value: `${fmt(idealWeight)} kg` },
    { label: "Excess", value: `${fmt(excess)} kg` },
    { label: "BMI", value: `${fmt(bmi)}` },
    { label: "Category", value: category },
  ];
  const chartData = [
    { name: "Actual", value: Number(weightKg.toFixed(1)), fill: "hsl(var(--primary))" },
    { name: "Ideal", value: Number(idealWeight.toFixed(1)), fill: "#10b981" },
  ];
  return { overweightPct, idealWeight, excess, bmi, category, breakdown, summaryStats, chartData };
}

const DEFAULTS = { sex: "male", height: "175", weight: "85" };

export default function OverweightPercentageCalculator() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [weight, setWeight] = useState(DEFAULTS.weight);
  const [result, setResult] = useState<OwResult | null>(null);

  const h = parseFloat(height);
  const w = parseFloat(weight);
  const errs: string[] = [];
  if (!h || h < 100 || h > 250) errs.push("Height must be between 100 and 250 cm.");
  if (!w || w < 20 || w > 400) errs.push("Weight must be between 20 and 400 kg.");
  const valid = errs.length === 0;

  const calculate = () => { if (valid) setResult(calcOw(sex, h, w)); };
  const reset = () => {
    setSex(DEFAULTS.sex); setHeight(DEFAULTS.height); setWeight(DEFAULTS.weight);
    setResult(calcOw("male", 175, 85));
  };
  useEffect(() => { setResult(calcOw("male", 175, 85)); }, []);

  const inp = "w-full px-3 py-2 rounded-md border border-input bg-background text-base text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20";
  const lbl = "text-sm font-medium mb-1 block";

  const faqs = [
    { question: "What is overweight percentage?", answer: "How far your actual weight sits above your ideal weight, expressed as a percentage: (actual − ideal) ÷ ideal × 100. It complements BMI by quantifying the excess in relative terms." },
    { question: "How is ideal weight determined?", answer: "The calculator uses the Devine formula — 50 kg for men, 45.5 kg for women, plus 0.9 kg per centimeter above 152.4 cm. It is a clinical estimate: healthy body composition varies with frame, muscle mass, and age." },
    { question: "How does this relate to BMI?", answer: "BMI classifies weight status (normal, overweight, obese); overweight percentage measures the gap to ideal. Both are reported — a person can be 'overweight' by BMI yet near ideal weight by percentage if muscular, since muscle weighs more than fat." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Overweight Percentage Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Overweight Percentage Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 border border-border bg-card shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={lbl}>Sex</label>
                <select value={sex} onChange={e => setSex(e.target.value)} className={inp}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inp} placeholder="175" />
              </div>
              <div>
                <label className={lbl}>Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inp} placeholder="85" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ideal weight by the Devine formula: 50 kg (men) / 45.5 kg (women) + 0.9 kg per cm above 152.4 cm.</p>
            {errs.length > 0 && (
              <div className="text-sm text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-2.5 rounded-md">{errs[0]}</div>
            )}
            <div className="flex gap-3 mt-1">
              <button onClick={calculate} disabled={!valid} className={`flex-1 flex items-center justify-center gap-2 rounded-md font-bold h-10 text-base transition-all shadow-sm ${valid ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-muted text-muted-foreground cursor-not-allowed"}`}>Calculate</button>
              <button onClick={reset} aria-label="Reset" className="w-10 h-10 rounded-md border border-border bg-background hover:bg-secondary flex items-center justify-center text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {result && (<>
              <div className="bg-primary/10 border-l-4 border-primary rounded-lg p-5">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Overweight Percentage</div>
                <div className="text-4xl font-extrabold tracking-tight">{fmt(result.overweightPct)}%</div>
                <div className="text-sm text-muted-foreground mt-1">{fmt(result.excess)} kg above ideal {fmt(result.idealWeight)} kg · BMI {fmt(result.bmi)} ({result.category})</div>
              </div>
              <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
                {[["Ideal Weight", `${fmt(result.idealWeight)} kg`], ["Excess", `${fmt(result.excess)} kg`], ["BMI", `${fmt(result.bmi)}`]].map(([l, v], i) => (
                  <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                    <div className="text-base font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Calculation Breakdown</h3>
                <table className="w-full text-base"><tbody>
                  {result.breakdown.map((r, i) => (
                    <tr key={i} className={`border-b border-border/50 last:border-0 ${i === 5 ? "bg-primary/10" : ""}`}>
                      <td className={`py-2.5 ${i === 5 ? "text-primary font-bold" : "text-muted-foreground"}`}>{r.label}</td>
                      <td className={`py-2.5 text-right font-semibold ${i === 5 ? "text-primary" : ""}`}>{r.value}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
              <div className="card-calculator !p-5 border border-border bg-card">
                <h3 className="text-base font-bold mb-4">Actual vs Ideal Weight</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={result.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => [fmt(v) + " kg", ""]} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {result.chartData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-muted-foreground mt-1">The gap between the bars is your excess weight</p>
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
        <div className="max-w-[1180px] mt-8">
          <AdPlaceholder className="mb-10" />
          <section className="prose-finance text-[15.75px]">
            <h2 className="text-2xl font-bold mb-3">Weight in Context</h2>
            <p>Raw weight says little without a frame of reference. This <strong>overweight percentage calculator</strong> compares your actual weight to a clinical ideal, quantifies the excess as a percentage, and pairs it with your BMI classification.</p>
            <h2 className="text-2xl font-bold mb-3">The Ideal Weight Basis</h2>
            <p>The Devine formula — 50 kg for men, 45.5 kg for women, plus 0.9 kg per centimeter above 152.4 cm — is the standard clinical estimate behind dosing and weight-based medicine. Overweight percentage = excess ÷ ideal × 100.</p>
            <h2 className="text-2xl font-bold mb-3">Two Metrics, One Picture</h2>
            <p>BMI places you in a category; overweight percentage sizes the gap to ideal. Together they distinguish the muscular from the over-fat and give a concrete target — the ideal weight the calculator reports alongside the percentage.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/overweight-percentage-calculator" />
          <PopularCalculators exclude="/calculator/overweight-percentage-calculator" />
        </div>
      </div>
    </>
  );
}
