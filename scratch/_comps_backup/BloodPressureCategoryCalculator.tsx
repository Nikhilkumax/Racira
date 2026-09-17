"use client";
import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import AdPlaceholder from "@/components/AdPlaceholder";
import PopularCalculators from "@/components/PopularCalculators";
import FAQSection from "@/components/FAQSection";
import { RotateCcw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

interface BPResult {
  category: string;
  color: string;
  description: string;
  s: number;
  d: number;
  pulsePressure: number;
  map: number;
  chartData: { name: string; value: number }[];
  breakdown: { label: string; value: string }[];
  summaryStats: { label: string; value: string }[];
}

function classifyBP(s: number, d: number): BPResult {
  let category = "";
  let color = "";
  let description = "";

  if (s < 120 && d < 80) {
    category = "Normal";
    color = "text-emerald-600";
    description = "Your blood pressure is in the healthy range. Maintain healthy lifestyle habits.";
  } else if (s < 130 && d < 80) {
    category = "Elevated";
    color = "text-amber-500";
    description = "You are at risk for high blood pressure. Lifestyle changes are often recommended.";
  } else if (s < 140 || d < 90) {
    category = "Hypertension Stage 1";
    color = "text-orange-500";
    description = "Blood pressure is consistently high. Doctors may prescribe lifestyle changes and medication.";
  } else if (s < 180 || d < 120) {
    category = "Hypertension Stage 2";
    color = "text-red-500";
    description = "Blood pressure is significantly high. Medical intervention is usually required.";
  } else {
    category = "Hypertensive Crisis";
    color = "text-red-700";
    description = "URGENT: Consult a doctor immediately or seek emergency medical care.";
  }

  const pulsePressure = s - d;
  const map = d + (s - d) / 3;

  return {
    category,
    color,
    description,
    s,
    d,
    pulsePressure,
    map,
    chartData: [
      { name: "Systolic", value: s },
      { name: "Diastolic", value: d },
    ],
    breakdown: [
      { label: "Systolic (Top Number)", value: `${s} mmHg` },
      { label: "Diastolic (Bottom Number)", value: `${d} mmHg` },
      { label: "Category", value: category },
      { label: "Pulse Pressure (S−D)", value: `${pulsePressure} mmHg` },
      { label: "Mean Arterial Pressure", value: `${map.toFixed(0)} mmHg` },
      { label: "AHA Classification", value: category },
    ],
    summaryStats: [
      { label: "Systolic", value: `${s} mmHg` },
      { label: "Diastolic", value: `${d} mmHg` },
      { label: "Pulse Pressure", value: `${pulsePressure} mmHg` },
      { label: "MAP", value: `${map.toFixed(0)} mmHg` },
      { label: "Category", value: category },
      { label: "Reading", value: `${s}/${d}` },
    ],
  };
}

const DEFAULTS = { systolic: "120", diastolic: "80" };

export default function BloodPressureCategoryCalculator() {
  const [systolic, setSystolic] = useState(DEFAULTS.systolic);
  const [diastolic, setDiastolic] = useState(DEFAULTS.diastolic);
  const [result, setResult] = useState<BPResult>(() => classifyBP(120, 80));

  const calculate = () => setResult(classifyBP(parseInt(systolic) || 0, parseInt(diastolic) || 0));
  const reset = () => { setSystolic(DEFAULTS.systolic); setDiastolic(DEFAULTS.diastolic); setResult(classifyBP(120, 80)); };
  useEffect(() => { setResult(classifyBP(120, 80)); }, []);

  const inp = "flex items-center rounded-md border border-input bg-background h-10 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20";
  const ci = "w-full h-full px-3 text-base bg-transparent outline-none border-none text-foreground";

  const faqs = [
    { question: "What do the blood pressure numbers mean?", answer: "The top number (systolic) measures the pressure in your arteries when your heart beats. The bottom number (diastolic) measures the pressure in your arteries when your heart rests between beats." },
    { question: "What is considered high blood pressure?", answer: "According to the American Heart Association (AHA), high blood pressure is defined as a reading of 130/80 mmHg or higher." },
    { question: "How can I lower my blood pressure naturally?", answer: "Reducing sodium (salt) intake, exercising regularly, losing weight, and limiting alcohol can all help lower blood pressure. The DASH diet is also highly effective." },
    { question: "What is pulse pressure?", answer: "Pulse pressure is the difference between systolic and diastolic (the top number minus the bottom number). A wide pulse pressure (over 60 mmHg) can indicate stiff arteries and is worth discussing with your doctor." },
    { question: "What is mean arterial pressure (MAP)?", answer: "MAP estimates the average pressure in your arteries during one cardiac cycle: MAP = diastolic + (systolic − diastolic) ÷ 3. A healthy MAP is roughly 70–100 mmHg and is the number doctors track in critical care." },
  ];

  return (
    <>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Calculators", href: "/calculator" }, { label: "Health", href: "/calculator#health" }, { label: "Blood Pressure Category Calculator" }]} />
      <div className="racira-page-container py-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Blood Pressure Category Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start max-w-[1180px]">
          <div className="card-calculator flex flex-col gap-4 !p-5 shadow-sm border border-border bg-card">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Systolic (Top Number)</label>
                <div className={inp}><input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">mmHg</span></div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Diastolic (Bottom Number)</label>
                <div className={inp}><input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} className={ci} min={0} /><span className="pr-3 text-muted-foreground text-sm">mmHg</span></div>
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
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Blood Pressure Category</div>
              <div className={`text-4xl font-extrabold ${result.color}`}>{result.category}</div>
              <div className="text-sm text-muted-foreground mt-1">{result.description}</div>
            </div>

            <div className="grid grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden bg-card">
              {[["Systolic", `${result.s} mmHg`], ["Diastolic", `${result.d} mmHg`], ["Reading", `${result.s}/${result.d}`]].map(([l, v], i) => (
                <div key={i} className={`p-4 text-center ${i > 0 ? "border-l border-border" : ""}`}>
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">{l}</div>
                  <div className="text-base font-bold">{v}</div>
                </div>
              ))}
            </div>

            <div className="card-calculator !p-5 border border-border bg-card">
              <h3 className="text-base font-bold mb-4">Reading Breakdown</h3>
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
              <h3 className="text-base font-bold mb-4">Systolic vs Diastolic</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={result.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${v}`} />
                  <Tooltip formatter={(v: number) => [`${v} mmHg`, "Pressure"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={70}>
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--primary)/0.4)" />
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
            <h2 className="text-2xl font-bold mb-3">The 'Silent Killer': Why Monitoring Matters</h2>
            <p>High blood pressure (hypertension) often has no symptoms, earning it the nickname 'the silent killer.' Left untreated, it can lead to heart attacks, strokes, and kidney disease. Regular monitoring at home can help you and your doctor identify trends that might not be visible during an occasional office visit.</p>
            <h3>Understanding the AHA Guidelines</h3>
            <p>In 2017, the American Heart Association lowered the threshold for Hypertension Stage 1 from 140/90 to 130/80. This change was based on research showing that risks for cardiovascular complications double when blood pressure is in the 130–139 range compared to the normal range.</p>
          </section>
          <FAQSection faqs={faqs} pageUrl="https://racira.com/calculator/blood-pressure-category-calculator" />
          <PopularCalculators exclude="/calculator/blood-pressure-category-calculator" />
        </div>
      </div>
    </>
  );
}
